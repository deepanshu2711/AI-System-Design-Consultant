// Mirrors the routing in app/agents/supervisor.py — keep in sync if that
// routing changes. The cdn/storage pair only runs when the requirements
// agent set involves_media_content, matching the supervisor's branch.
export const AGENT_NODES = [
  { id: "clarifying_questions_agent", label: "Clarifying Questions", icon: "message-circle", stateKey: "user_clarifications" },
  { id: "requirement_analyzer_agent", label: "Requirement Analyzer", icon: "clipboard", stateKey: "clarified_requirements" },
  { id: "traffic_estimator_agent", label: "Traffic Estimator", icon: "activity", stateKey: "traffic_estimates" },
  { id: "capacity_planner_agent", label: "Capacity Planner", icon: "server", stateKey: "capacity_plan" },
  { id: "database_designer_agent", label: "Database Designer", icon: "database", stateKey: "database_design" },
  { id: "cache_expert_agent", label: "Cache Expert", icon: "zap", stateKey: "cache_design" },
  { id: "queue_expert_agent", label: "Queue Expert", icon: "layers", stateKey: "queue_expert" },
  { id: "api_designer_agent", label: "API Designer", icon: "code", stateKey: "api_design" },
  { id: "cdn_expert_agent", label: "CDN Expert", icon: "globe", branch: "left", stateKey: "cdn_design" },
  { id: "storage_expert_agent", label: "Storage Expert", icon: "hard-drive", branch: "right", stateKey: "storage_design" },
  { id: "microservice_expert_agent", label: "Microservice Expert", icon: "boxes", stateKey: "microservice_design" },
]
