// Mirrors the routing in app/agents/supervisor.py — keep in sync if that
// routing changes. The cdn/storage pair only runs when the requirements
// agent set involves_media_content, matching the supervisor's branch.
export const AGENT_NODES = [
  { id: "clarifying_questions_agent", label: "Clarifying Questions", icon: "message-circle" },
  { id: "requirement_analyzer_agent", label: "Requirement Analyzer", icon: "clipboard" },
  { id: "traffic_estimator_agent", label: "Traffic Estimator", icon: "activity" },
  { id: "capacity_planner_agent", label: "Capacity Planner", icon: "server" },
  { id: "database_designer_agent", label: "Database Designer", icon: "database" },
  { id: "cache_expert_agent", label: "Cache Expert", icon: "zap" },
  { id: "queue_expert_agent", label: "Queue Expert", icon: "layers" },
  { id: "api_designer_agent", label: "API Designer", icon: "code" },
  { id: "cdn_expert_agent", label: "CDN Expert", icon: "globe", branch: "left" },
  { id: "storage_expert_agent", label: "Storage Expert", icon: "hard-drive", branch: "right" },
  { id: "microservice_expert_agent", label: "Microservice Expert", icon: "boxes" },
]
