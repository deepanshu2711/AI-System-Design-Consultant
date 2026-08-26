import type { Icon } from "@phosphor-icons/react";
import {
  ChatsCircle,
  ListChecks,
  ChartLineUp,
  Gauge,
  Database,
  Lightning,
  FlowArrow,
  PlugsConnected,
  GlobeHemisphereWest,
  HardDrives,
  TreeStructure,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";

export type Agent = {
  num: string;
  title: string;
  /** LangGraph node name, as registered in app/grpahs/supervisor_graph.py — used to match live run events to this agent. */
  node: string;
  file: string;
  schema: string;
  blurb: string;
  icon: Icon;
  mediaOnly?: boolean;
  closesRun?: boolean;
};

export const AGENTS: Agent[] = [
  {
    num: "01",
    title: "Clarifying Questions",
    node: "clarifying_questions_agent",
    file: "app/agents/clarifying_questions.py",
    schema: "ClarifyingQuestions",
    blurb: "Finds what the brief left out, then stops the run to ask.",
    icon: ChatsCircle,
  },
  {
    num: "02",
    title: "Requirement Analyzer",
    node: "requirement_analyzer_agent",
    file: "app/agents/requirement_analyzer.py",
    schema: "RequirementSpec",
    blurb: "Turns the answers into functional and non-functional requirements.",
    icon: ListChecks,
  },
  {
    num: "03",
    title: "Traffic Estimator",
    node: "traffic_estimator_agent",
    file: "app/agents/traffic_estimator.py",
    schema: "TrafficEstimate",
    blurb: "DAU, MAU, peak and average RPS, request and response sizes.",
    icon: ChartLineUp,
  },
  {
    num: "04",
    title: "Capacity Planner",
    node: "capacity_planner_agent",
    file: "app/agents/capacity_planner.py",
    schema: "CapacityPlan",
    blurb: "Storage per day and year, bandwidth, replication, compute nodes.",
    icon: Gauge,
  },
  {
    num: "05",
    title: "Database Designer",
    node: "database_designer_agent",
    file: "app/agents/database_designer.py",
    schema: "DatabaseDesign",
    blurb: "Engine choice, tables, columns, indexes, partitioning strategy.",
    icon: Database,
  },
  {
    num: "06",
    title: "Cache Expert",
    node: "cache_expert_agent",
    file: "app/agents/cache_expert.py",
    schema: "CacheDesign",
    blurb: "Key patterns, TTLs, eviction, hit-ratio target, hot-key risk.",
    icon: Lightning,
  },
  {
    num: "07",
    title: "Queue Expert",
    node: "queue_expert_agent",
    file: "app/agents/queue_expert.py",
    schema: "QueueDesign",
    blurb: "Topics, delivery guarantees, ordering, retries, dead-lettering.",
    icon: FlowArrow,
  },
  {
    num: "08",
    title: "API Designer",
    node: "api_designer_agent",
    file: "app/agents/api_designer.py",
    schema: "ApiDesign",
    blurb: "Endpoints, auth, pagination, versioning, error envelope.",
    icon: PlugsConnected,
  },
  {
    num: "09",
    title: "CDN Expert",
    node: "cdn_expert_agent",
    file: "app/agents/cdn_expert.py",
    schema: "CdnDesign",
    blurb: "Edge strategy and invalidation.",
    icon: GlobeHemisphereWest,
    mediaOnly: true,
  },
  {
    num: "10",
    title: "Storage Expert",
    node: "storage_expert_agent",
    file: "app/agents/storage_expert.py",
    schema: "StorageDesign",
    blurb: "Buckets, storage classes, lifecycle policies.",
    icon: HardDrives,
    mediaOnly: true,
  },
  {
    num: "11",
    title: "Microservice Expert",
    node: "microservice_expert_agent",
    file: "app/agents/microservice_expert.py",
    schema: "MicroserviceDesign",
    blurb: "Service boundaries, data ownership, communication patterns.",
    icon: TreeStructure,
  },
  {
    num: "12",
    title: "Architecture Reviewer",
    node: "architecture_review_cycle",
    file: "app/agents/architecture_reviewer.py",
    schema: "ReviewFeedback",
    blurb: "Checks the design for blockers, sends revisions back until it's sound.",
    icon: MagnifyingGlass,
    closesRun: true,
  },
];
