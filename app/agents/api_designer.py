from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.api_designer.v1 import API_DESIGNER_SYSTEM_PROMPT
from app.schema.api import ApiDesign
from app.schema.error import make_agent_error
from app.state.desgin_state import DesignState
from app.tools.json_formatter import json_formatter
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm, build_llm
from app.utils.timing import timed_node

# One round per example payload; endpoints are capped at 6 — intentionally
# larger than the shared MAX_TOOL_ITERATIONS default.
MAX_TOOL_ITERATIONS = 6

format_instructions = PydanticOutputParser(
    pydantic_object=ApiDesign).get_format_instructions()
llm_with_tools = llm.bind_tools([json_formatter])
llm_structured = build_llm(num_ctx=16384, num_predict=6144, timeout=360)
llm_with_structure = llm_structured.with_structured_output(ApiDesign)


prompt = ChatPromptTemplate.from_messages([
    ("system", API_DESIGNER_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Database design:\n{database_design}\n\n"
     "Design the API layer. Validate every JSON example through the "
     "json_formatter tool. You have at most {max_tool_iterations} rounds of "
     "json_formatter calls — plan accordingly.\n\n"
     "Your final answer will be captured as structured output matching this "
     "schema, so make sure your reasoning covers every one of these fields "
     "before you stop calling tools:\n\n{format_instructions}\n\n"
     "Do not output this JSON yourself — just state the design clearly in "
     "your reasoning once you're done, then stop calling tools."),
]).partial(
    format_instructions=format_instructions,
    max_tool_iterations=MAX_TOOL_ITERATIONS,
)


@timed_node("api_designer_agent")
@catch_agent_errors("api_designer_agent")
async def api_designer_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    database_design = state.get('database_design')

    messages = prompt.format_messages(
        clarified_requirements=clarified_requirements,
        database_design=database_design
        or 'Not available — reason generically about likely resources.',
    )

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    iterations = 0
    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'json_formatter':
                try:
                    result = json_formatter.invoke(tool_call['args'])
                except Exception as exc:  # let the model see and recover from bad calls
                    result = f"json_formatter error: {exc}"
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=str(result), tool_call_id=tool_call["id"]))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)
        iterations += 1

    hit_iteration_cap = iterations >= MAX_TOOL_ITERATIONS and bool(
        response.tool_calls)

    if hit_iteration_cap:
        # The last AIMessage still has unanswered tool_calls. Every provider
        # requires a ToolMessage for each pending tool_call_id before the
        # message list can be sent again - satisfy that contract first.
        for tool_call in response.tool_calls:
            messages.append(ToolMessage(
                content="Skipped: tool iteration limit reached.",
                tool_call_id=tool_call["id"],
            ))
        messages.append(HumanMessage(
            content="You now have all the numbers you need. "
            "Produce the final API design as structured output now, "
            "including all endpoints with validated JSON examples."
        ))

    result = await llm_with_structure.ainvoke(messages)

    if hit_iteration_cap:
        return Command(
            goto="supervisor",
            update={
                "errors": [make_agent_error(
                    node="api_designer_agent",
                    error_type="max_tool_iterations_exceeded",
                    message=(
                        f"Hit {MAX_TOOL_ITERATIONS} tool iterations before "
                        "the model stopped requesting tools"
                    ),
                    attempt_count=iterations,
                )],
                "api_design": result,
            },
        )

    return Command(
        goto="supervisor",
        update={"api_design": result}
    )
