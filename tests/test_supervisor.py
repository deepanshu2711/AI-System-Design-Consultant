import asyncio
import unittest

from langgraph.graph import END

from app.agents.supervisor import supervisor
from app.schema.error import make_agent_error


class SupervisorFailureCircuitTests(unittest.TestCase):
    def test_stops_routing_to_agent_after_repeated_failures(self):
        state = {
            "user_clarifications": {"answer": "provided"},
            "clarified_requirements": None,
            "traffic_estimates": None,
            "capacity_plan": None,
            "database_design": None,
            "cache_design": None,
            "queue_expert": None,
            "api_design": None,
            "cdn_design": None,
            "storage_design": None,
            "microservice_design": None,
            "errors": [
                make_agent_error("requirement_analyzer_agent", "ValueError", "bad state", 1),
                make_agent_error("requirement_analyzer_agent", "ValueError", "bad state", 2),
                make_agent_error("requirement_analyzer_agent", "ValueError", "bad state", 3),
            ],
        }

        command = asyncio.run(supervisor(state))

        self.assertEqual(command.goto, END)


if __name__ == "__main__":
    unittest.main()
