// Sidebar nav metadata for each design artifact the backend can produce.
// `stateKey` matches the field name on DesignState (app/state/desgin_state.py) —
// note queue_expert holds a QueueDesign despite the name (see TODO.md).
// cdn/storage are optional: the supervisor only runs those agents when
// clarified_requirements.involves_media_content is true.
export const DESIGN_SECTIONS = [
  { id: "requirements", label: "Requirements", icon: "clipboard", stateKey: "clarified_requirements" },
  { id: "traffic", label: "Traffic Estimate", icon: "activity", stateKey: "traffic_estimates" },
  { id: "capacity", label: "Capacity Plan", icon: "server", stateKey: "capacity_plan" },
  { id: "database", label: "Database Design", icon: "database", stateKey: "database_design" },
  { id: "cache", label: "Cache Design", icon: "zap", stateKey: "cache_design" },
  { id: "queue", label: "Queue Design", icon: "layers", stateKey: "queue_expert" },
  { id: "api", label: "API Design", icon: "code", stateKey: "api_design" },
  { id: "cdn", label: "CDN Design", icon: "globe", stateKey: "cdn_design", optional: true },
  { id: "storage", label: "Storage Design", icon: "hard-drive", stateKey: "storage_design", optional: true },
  { id: "microservice", label: "Microservices", icon: "boxes", stateKey: "microservice_design" },
]
