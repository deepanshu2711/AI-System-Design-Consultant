// Dummy data shaped after the backend Pydantic schemas in app/schema/*.py.
// No API calls here — this is purely for UI development.

export const dummyQuery = "Design a photo-sharing app like Instagram"

export const dummyClarifyingQuestions = {
  questions: [
    "What is the expected initial user base, and what scale should we design for in year one?",
    "Should the system support video content in addition to photos?",
    "Do you need real-time features like live notifications or direct messaging?",
    "Is global, multi-region availability a requirement, or is a single region acceptable?",
  ],
  reasoning:
    "Scale, media type, and real-time requirements materially change the storage, CDN, and queueing design, so these need to be pinned down before estimating capacity.",
}

export const dummyRequirements = {
  functional_requirements: [
    "Users can sign up, log in, and manage a profile",
    "Users can upload photos with captions and tags",
    "Users can follow other users and view a personalized feed",
    "Users can like and comment on posts",
    "Users receive notifications for likes, comments, and new followers",
  ],
  non_functional_requirements: [
    "Feed reads must respond within 200ms at p99",
    "System must support 10M DAU with room to scale to 50M",
    "99.95% availability",
    "Eventual consistency acceptable for feed and like counts",
  ],
  assumed_scale: "10M DAU, 50M MAU at launch year, growing 3x over 2 years",
  explicit_assumptions: [
    "No video support in v1 — photos only",
    "Single primary region (US) with a read replica in EU",
    "Push notifications handled by a third-party provider (FCM/APNs)",
  ],
  involves_media_content: true,
}

export const dummyTraffic = {
  dau: 10_000_000,
  mau: 50_000_000,
  peak_rps: 18_500,
  avg_rps: 4_200,
  read_write_ratio: "100:1",
  avg_request_size_kb: 2.4,
  avg_response_size_kb: 85,
  reasoning:
    "Feed reads dominate traffic (read-heavy social app). Peak RPS assumes a 4.4x multiplier over average during evening peak hours, consistent with typical social app diurnal patterns.",
}

export const dummyCapacity = {
  storage_per_day_gb: 820,
  storage_per_year_tb: 292,
  replication_factor: 3,
  bandwidth_peak_mbps: 1450,
  bandwidth_avg_mbps: 340,
  estimated_compute_nodes: 64,
  reasoning:
    "Storage estimate assumes 2.5M photo uploads/day at ~320KB average (post-compression). Compute nodes sized for peak RPS with 40% headroom.",
  confidence: "high",
}

export const dummyDatabase = {
  database_type: "PostgreSQL (primary) + DynamoDB (feed cache)",
  reasoning:
    "PostgreSQL for strongly-consistent relational data (users, follows, posts metadata). DynamoDB for the denormalized, high-throughput feed fan-out table.",
  confidence: "high",
  tables: [
    {
      name: "users",
      description: "Core user account and profile data",
      estimated_row_count: "50M rows/year",
      primary_key: ["id"],
      columns: [
        { name: "id", data_type: "UUID", constraints: ["PRIMARY KEY"], description: "Unique user identifier" },
        { name: "username", data_type: "VARCHAR(30)", constraints: ["UNIQUE", "NOT NULL"], description: "Public handle" },
        { name: "email", data_type: "VARCHAR(255)", constraints: ["UNIQUE", "NOT NULL"], description: "Login email" },
        { name: "created_at", data_type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Account creation time" },
      ],
      foreign_keys: [],
      indexes: [
        { name: "idx_users_username", columns: ["username"], index_type: "btree", reasoning: "Fast lookup by handle for profile pages and mentions" },
      ],
    },
    {
      name: "posts",
      description: "Photo posts with captions",
      estimated_row_count: "900M rows/year",
      primary_key: ["id"],
      columns: [
        { name: "id", data_type: "UUID", constraints: ["PRIMARY KEY"], description: "Unique post identifier" },
        { name: "user_id", data_type: "UUID", constraints: ["NOT NULL"], description: "Author of the post" },
        { name: "caption", data_type: "TEXT", constraints: [], description: "Post caption" },
        { name: "media_url", data_type: "TEXT", constraints: ["NOT NULL"], description: "Object storage URL" },
        { name: "created_at", data_type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Upload time" },
      ],
      foreign_keys: [{ column: "user_id", references: "users.id" }],
      indexes: [
        { name: "idx_posts_user_created", columns: ["user_id", "created_at"], index_type: "btree", reasoning: "Powers profile grid queries ordered by recency" },
      ],
    },
    {
      name: "follows",
      description: "Follower/followee relationships",
      estimated_row_count: "2B rows/year",
      primary_key: ["follower_id", "followee_id"],
      columns: [
        { name: "follower_id", data_type: "UUID", constraints: ["NOT NULL"], description: "The user who follows" },
        { name: "followee_id", data_type: "UUID", constraints: ["NOT NULL"], description: "The user being followed" },
        { name: "created_at", data_type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Follow time" },
      ],
      foreign_keys: [
        { column: "follower_id", references: "users.id" },
        { column: "followee_id", references: "users.id" },
      ],
      indexes: [
        { name: "idx_follows_followee", columns: ["followee_id"], index_type: "btree", reasoning: "Fan-out on new post creation" },
      ],
    },
  ],
  relationships: [
    { from_table: "users", to_table: "posts", relationship_type: "one-to-many", description: "A user authors many posts" },
    { from_table: "users", to_table: "follows", relationship_type: "many-to-many", description: "Users follow other users" },
  ],
  partitioning_strategy: "Hash-partition posts and follows by user_id across 128 shards to distribute write load evenly",
  sample_queries: [
    "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
    "SELECT followee_id FROM follows WHERE follower_id = $1",
  ],
}

export const dummyCache = {
  cache_type: "multi-tier",
  cache_engine: "Redis Cluster",
  reasoning:
    "Feed pages and hot profile data are read orders of magnitude more than they're written, making them ideal cache-aside candidates.",
  confidence: "high",
  cached_items: [
    {
      name: "user feed page",
      cache_key_pattern: "feed:{user_id}:page:{n}",
      ttl_seconds: 120,
      eviction_policy: "LRU",
      invalidation_strategy: "invalidate on new post from followed user",
      reasoning: "Feed reads are the single hottest path in the system",
    },
    {
      name: "user session",
      cache_key_pattern: "session:{session_id}",
      ttl_seconds: 3600,
      eviction_policy: "TTL-only",
      invalidation_strategy: "expire naturally, explicit delete on logout",
      reasoning: "Avoids a DB round-trip on every authenticated request",
    },
  ],
  consistency_model: "Eventual, invalidate-on-write with a 120s TTL fallback",
  cache_hit_ratio_target: "target >92% hit ratio for feed reads",
  hot_key_risk_notes: "Celebrity accounts can create hot keys on fan-out; mitigated with local in-process caching layer in front of Redis",
  cache_aside_vs_write_through: "cache-aside",
  estimated_memory_gb: 480,
  sample_access_pattern: "GET feed:{user_id}:page:0 -> miss -> query DB -> SET with 120s TTL",
}

export const dummyQueue = {
  broker_type: "log-based-streaming",
  broker_engine: "Kafka",
  reasoning: "High fan-out write volume on new posts needs durable, ordered, replayable delivery to multiple downstream consumers.",
  confidence: "high",
  topics: [
    {
      name: "post-fanout-jobs",
      producer: "post creation service",
      consumer: "feed fan-out workers",
      message_schema: "{ post_id, user_id, created_at }",
      delivery_guarantee: "at-least-once",
      ordering_requirement: "per-key",
      retry_policy: "3 retries, exponential backoff, then dead-letter",
      dead_letter_strategy: "route to DLQ topic, alert on-call after 100 msgs/min",
      reasoning: "Decouples post creation latency from fan-out to millions of followers",
    },
    {
      name: "notification-events",
      producer: "like/comment/follow services",
      consumer: "notification dispatch workers",
      message_schema: "{ type, actor_id, target_user_id, entity_id }",
      delivery_guarantee: "at-least-once",
      ordering_requirement: "none",
      retry_policy: "5 retries, exponential backoff",
      dead_letter_strategy: "route to DLQ, retried hourly for 24h",
      reasoning: "Notification delivery should never block the originating write path",
    },
  ],
  backpressure_strategy: "Consumer lag triggers autoscaling of worker pool; producers unaffected due to durable log buffering",
  scaling_strategy: "Horizontal, partitioned by user_id for ordering guarantees",
  estimated_throughput_msgs_per_sec: 12_000,
  estimated_queue_depth_notes: "Normal: <5k messages. Peak (celebrity post): burst to 2M messages, drained within ~3 minutes",
  sample_flow: "user posts photo -> post-fanout-jobs -> fan-out worker writes to followers' feed caches -> notification-events -> push notification sent",
}

export const dummyApi = {
  api_style: "REST",
  reasoning: "REST is well-understood, cacheable, and sufficient for the CRUD-heavy access patterns of this system.",
  confidence: "high",
  base_path: "/api/v1",
  versioning_strategy: "URI versioning (/api/v1, /api/v2) with a 12-month deprecation window",
  auth_strategy: "JWT bearer tokens with refresh token rotation",
  pagination_strategy: "Cursor-based for feeds, offset-based for admin lists",
  error_format: 'Standard envelope: { "error": { "code": "string", "message": "string" } }',
  endpoints: [
    {
      method: "GET",
      path: "/api/v1/feed",
      description: "Fetch the current user's personalized feed",
      requires_auth: true,
      rate_limit_notes: "120 requests/min per user",
      source_table: "posts",
      parameters: [
        { name: "cursor", location: "query", data_type: "string", required: false, description: "Pagination cursor" },
        { name: "limit", location: "query", data_type: "integer", required: false, description: "Page size, default 20" },
      ],
      request_body_example: null,
      responses: [
        { status_code: 200, description: "Feed page returned", example_body: '{ "posts": [...], "next_cursor": "abc123" }' },
        { status_code: 401, description: "Missing or invalid auth token", example_body: '{ "error": { "code": "unauthorized", "message": "..." } }' },
      ],
    },
    {
      method: "POST",
      path: "/api/v1/posts",
      description: "Create a new photo post",
      requires_auth: true,
      rate_limit_notes: "10 requests/min per user",
      source_table: "posts",
      parameters: [],
      request_body_example: '{ "media_url": "s3://...", "caption": "string" }',
      responses: [
        { status_code: 201, description: "Post created", example_body: '{ "id": "uuid", "created_at": "..." }' },
        { status_code: 400, description: "Invalid payload", example_body: '{ "error": { "code": "bad_request", "message": "..." } }' },
      ],
    },
  ],
}

export const dummyCdn = {
  needed: true,
  cdn_provider: "CloudFront",
  cached_content_types: ["profile images", "post photos", "thumbnails", "static assets"],
  cache_invalidation_strategy: "Immutable content-addressed URLs; no invalidation needed, new uploads get new keys",
  edge_locations_strategy: "Global distribution, weighted toward North America, Europe, and South Asia based on projected user base",
  reasoning: "Media is read far more often than written and benefits heavily from edge caching to reduce origin load and latency.",
  confidence: "high",
}

export const dummyStorage = {
  needed: true,
  storage_provider: "AWS S3",
  buckets: [
    {
      name: "post-media-original",
      content_type: "images",
      storage_class: "S3 Standard",
      access_pattern: "write-once, read-many",
      lifecycle_policy: "move to S3 Infrequent Access after 90 days",
    },
    {
      name: "post-media-thumbnails",
      content_type: "images",
      storage_class: "S3 Standard",
      access_pattern: "write-once, read-many (very hot)",
      lifecycle_policy: "retain indefinitely, low storage cost",
    },
  ],
  total_estimated_storage_tb_year: 292,
  reasoning: "Original photos are large but infrequently re-fetched after the first week; thumbnails are small but permanently hot.",
  confidence: "high",
}

export const dummyMicroservice = {
  services: [
    { name: "UserService", responsibility: "Account, auth, and profile management", owns_data: ["users", "sessions"] },
    { name: "PostService", responsibility: "Photo post creation and metadata", owns_data: ["posts"] },
    { name: "FeedService", responsibility: "Feed assembly and ranking", owns_data: ["feed_cache"] },
    { name: "SocialGraphService", responsibility: "Follow relationships", owns_data: ["follows"] },
    { name: "NotificationService", responsibility: "Push/email notification dispatch", owns_data: ["notifications"] },
  ],
  communications: [
    { from_service: "PostService", to_service: "FeedService", pattern: "async_queue", reason: "Fan-out to followers shouldn't block post creation" },
    { from_service: "FeedService", to_service: "SocialGraphService", pattern: "sync_grpc", reason: "Low-latency follower list lookups needed at read time" },
    { from_service: "PostService", to_service: "NotificationService", pattern: "async_event", reason: "Notification delivery is best-effort and non-blocking" },
  ],
  decomposition_rationale: "Split by business capability and data ownership — each service is the single source of truth for its own tables, minimizing cross-service transactions.",
  shared_concerns: "Auth handled via a shared JWT validation library; logging and tracing standardized via a common sidecar (OpenTelemetry collector)",
}

export const designSections = [
  { id: "requirements", label: "Requirements", icon: "clipboard" },
  { id: "traffic", label: "Traffic Estimate", icon: "activity" },
  { id: "capacity", label: "Capacity Plan", icon: "server" },
  { id: "database", label: "Database Design", icon: "database" },
  { id: "cache", label: "Cache Design", icon: "zap" },
  { id: "queue", label: "Queue Design", icon: "layers" },
  { id: "api", label: "API Design", icon: "code" },
  { id: "cdn", label: "CDN Design", icon: "globe" },
  { id: "storage", label: "Storage Design", icon: "hard-drive" },
  { id: "microservice", label: "Microservices", icon: "boxes" },
]
