const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type WaitingForInput = {
  status: "waiting_for_input";
  thread_id: string;
  message: string;
  questions: string[];
};

// Mirrors app/schema/*.py — field names match the Pydantic models exactly
// (snake_case, as serialized by jsonable_encoder).

export type RequirementSpec = {
  functional_requirements: string[];
  non_functional_requirements: string[];
  assumed_scale: string;
  explicit_assumptions: string[];
  involves_media_content: boolean;
};

export type TrafficEstimate = {
  dau: number;
  mau: number;
  peak_rps: number;
  avg_rps: number;
  read_write_ratio: string;
  avg_request_size_kb: number;
  avg_response_size_kb: number;
  reasoning: string;
};

export type CapacityPlan = {
  storage_per_day_gb: number;
  storage_per_year_tb: number;
  replication_factor: number;
  bandwidth_peak_mbps: number;
  bandwidth_avg_mbps: number;
  estimated_compute_nodes: number;
  reasoning: string;
  confidence: string;
};

export type Column = { name: string; data_type: string; constraints: string[]; description: string };
export type Index = { name: string; columns: string[]; index_type: string; reasoning: string };
export type Table = { name: string; columns: Column[]; indexes: Index[]; description: string; estimated_row_count: string };
export type Relationship = { from_table: string; to_table: string; relationship_type: string; description: string };

export type DatabaseDesign = {
  database_type: string;
  reasoning: string;
  confidence: string;
  tables: Table[];
  relationships: Relationship[];
  partitioning_strategy: string;
  sample_queries: string[];
};

export type CachedItem = {
  name: string;
  cache_key_pattern: string;
  ttl_seconds: number;
  eviction_policy: "LRU" | "LFU" | "TTL-only" | "FIFO";
  invalidation_strategy: string;
  reasoning: string;
};

export type CacheDesign = {
  cache_type: string;
  cache_engine: string;
  reasoning: string;
  confidence: "high" | "low";
  cached_items: CachedItem[];
  consistency_model: string;
  cache_hit_ratio_target: string;
  hot_key_risk_notes: string;
  cache_aside_vs_write_through: string;
  estimated_memory_gb: number;
  sample_access_pattern: string;
};

export type QueueTopic = {
  name: string;
  producer: string;
  consumer: string;
  message_schema: string;
  delivery_guarantee: string;
  ordering_requirement: "none" | "per-key" | "strict-global";
  retry_policy: string;
  dead_letter_strategy: string;
  reasoning: string;
};

export type QueueDesign = {
  broker_type: string;
  broker_engine: string;
  reasoning: string;
  confidence: string;
  topics: QueueTopic[];
  backpressure_strategy: string;
  scaling_strategy: string;
  estimated_throughput_msgs_per_sec: number;
  estimated_queue_depth_notes: string;
  sample_flow: string;
};

export type ApiParameter = { name: string; location: "path" | "query" | "body" | "header"; data_type: string; required: boolean; description: string };
export type ApiResponse = { status_code: number; description: string; example_body: string };
export type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  parameters: ApiParameter[];
  request_body_example: string | null;
  responses: ApiResponse[];
  requires_auth: boolean;
  rate_limit_notes: string;
  source_table: string | null;
};

export type ApiDesign = {
  api_style: "REST" | "GraphQL" | "gRPC" | "hybrid";
  reasoning: string;
  confidence: string;
  base_path: string;
  versioning_strategy: string;
  endpoints: ApiEndpoint[];
  auth_strategy: string;
  pagination_strategy: string;
  error_format: string;
};

export type CdnDesign = {
  needed: boolean;
  cdn_provider: string;
  cached_content_types: string[];
  cache_invalidation_strategy: string;
  edge_locations_strategy: string;
  reasoning: string;
  confidence: string;
};

export type StorageBucket = { name: string; content_type: string; storage_class: string; access_pattern: string; lifecycle_policy: string };

export type StorageDesign = {
  needed: boolean;
  storage_provider: string;
  buckets: StorageBucket[];
  total_estimated_storage_tb_year: number;
  reasoning: string;
  confidence: string;
};

export type ServiceDefinition = { name: string; responsibility: string; owns_data: string[] };
export type ServiceCommunication = {
  from_service: string;
  to_service: string;
  pattern: "sync_rest" | "sync_grpc" | "async_queue" | "async_event";
  reason: string;
};

export type MicroserviceDesign = {
  services: ServiceDefinition[];
  communications: ServiceCommunication[];
  decomposition_rationale: string;
  shared_concerns: string;
};

export type ReviewIssue = {
  target: "database_designer_agent" | "cache_expert_agent" | "queue_expert_agent" | "api_designer_agent";
  severity: "blocker" | "warning";
  description: string;
  suggested_fix: string;
};

export type ReviewFeedback = { approved: boolean; summary: string; issues: ReviewIssue[] };

export type AgentError = { node: string; error_type: string; message: string; attempt_count: number };

/** The shared LangGraph state — app/state/desgin_state.py (typo intentional, matches backend). */
export type DesignState = {
  user_query: string;
  clarified_requirements?: RequirementSpec | null;
  user_clarifications?: Record<string, string> | null;
  clarification_rounds?: number;
  traffic_estimates?: TrafficEstimate | null;
  capacity_plan?: CapacityPlan | null;
  database_design?: DatabaseDesign | null;
  cache_design?: CacheDesign | null;
  queue_expert?: QueueDesign | null;
  api_design?: ApiDesign | null;
  cdn_design?: CdnDesign | null;
  storage_design?: StorageDesign | null;
  microservice_design?: MicroserviceDesign | null;
  review_feedback?: ReviewFeedback | null;
  review_iterations?: number;
  errors?: AgentError[] | null;
  run_status?: string;
};

/** Covers both a finished run (`state` populated) and a failed one (`message` populated instead). */
export type RunComplete = {
  status: string;
  thread_id: string;
  state?: DesignState;
  message?: string;
};

export type DesignRunResponse = WaitingForInput | RunComplete;

export function isWaitingForInput(res: DesignRunResponse): res is WaitingForInput {
  return res.status === "waiting_for_input";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new Error(`Could not reach the backend at ${API_BASE_URL} — is it running?`);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? JSON.stringify(data);
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new Error(`${res.status}: ${detail}`);
  }

  return res.json() as Promise<T>;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Kicks off a new design run for the given product prompt.
 * `threadId` should be generated by the caller (crypto.randomUUID()) so the
 * run's progress stream can be opened before/while this resolves.
 */
export function startDesign(userQuery: string, threadId: string): Promise<DesignRunResponse> {
  return postJson<DesignRunResponse>("/design/start", { user_query: userQuery, thread_id: threadId });
}

/** Resumes a paused run with the user's answers, keyed by question text. */
export function resumeDesign(threadId: string, answers: Record<string, string>): Promise<DesignRunResponse> {
  return postJson<DesignRunResponse>("/design/resume", { thread_id: threadId, answers });
}

/**
 * Re-fetches a finished (or failed) run's terminal payload by thread id —
 * for loading the results page directly or after a refresh, independent of
 * the SSE stream. Throws (with a "404: ..." message) if no run for this
 * thread has finished yet.
 */
export function getDesignState(threadId: string): Promise<RunComplete> {
  return request<RunComplete>(`/design/state/${threadId}`);
}

export type RunStreamEvent =
  | { type: "node_start"; node: string }
  | { type: "node_end"; node: string }
  | ({ type: "terminal" } & DesignRunResponse);

/**
 * Opens a live SSE connection to a run's progress. Returns the EventSource
 * so the caller can close() it (e.g. on unmount) — the connection is also
 * closed automatically once a "terminal" event arrives.
 */
export function openRunStream(
  threadId: string,
  handlers: {
    onNodeStart?: (node: string) => void;
    onNodeEnd?: (node: string) => void;
    onTerminal?: (res: DesignRunResponse) => void;
    onError?: () => void;
  }
): EventSource {
  const source = new EventSource(`${API_BASE_URL}/design/stream/${threadId}`);

  source.onmessage = (msg) => {
    let event: RunStreamEvent;
    try {
      event = JSON.parse(msg.data);
    } catch {
      return;
    }
    if (event.type === "node_start") handlers.onNodeStart?.(event.node);
    else if (event.type === "node_end") handlers.onNodeEnd?.(event.node);
    else if (event.type === "terminal") {
      handlers.onTerminal?.(event);
      source.close();
    }
  };

  source.onerror = () => {
    handlers.onError?.();
  };

  return source;
}
