# Query Optimization Guide

## 1. 쿼리 최적화 원칙 (Query Optimization Principles)

### SELECT 쿼리 최적화
```typescript
// ❌ BAD: SELECT *는 불필요한 데이터 전송
const stories = await db.select().from(stories);

// ✅ GOOD: 필요한 컬럼만 선택
const stories = await db
  .select({
    id: stories.id,
    title: stories.title,
    authorId: stories.authorId,
    createdAt: stories.createdAt,
  })
  .from(stories);
```

### WHERE 절 최적화
```typescript
// ❌ BAD: 함수 사용은 인덱스를 무효화
const users = await db
  .select()
  .from(users)
  .where(sql`LOWER(email) = 'test@example.com'`);

// ✅ GOOD: 인덱스 사용 가능
const users = await db
  .select()
  .from(users)
  .where(eq(users.email, 'test@example.com'));
```

### JOIN 최적화
```typescript
// ❌ BAD: N+1 쿼리 문제
for (const story of stories) {
  const author = await db
    .select()
    .from(users)
    .where(eq(users.id, story.authorId));
}

// ✅ GOOD: 한 번의 JOIN으로 해결
const storiesWithAuthors = await db
  .select({
    story: stories,
    author: users,
  })
  .from(stories)
  .leftJoin(users, eq(stories.authorId, users.id));
```

### Pagination 최적화
```typescript
// ❌ BAD: OFFSET은 대량 데이터에서 느림
const page = await db
  .select()
  .from(stories)
  .offset(page * limit)
  .limit(limit);

// ✅ GOOD: Cursor-based pagination (더 빠름)
const page = await db
  .select()
  .from(stories)
  .where(gt(stories.createdAt, lastSeenCreatedAt))
  .orderBy(desc(stories.createdAt))
  .limit(limit);
```

## 2. 인덱스 활용 전략 (Index Usage Strategy)

### 복합 인덱스 활용
```sql
-- 인덱스: (team_id, scope, is_pinned, created_at)
-- 이 인덱스는 다음 쿼리들을 최적화:
-- 1. WHERE team_id = ?
-- 2. WHERE team_id = ? AND scope = ?
-- 3. WHERE team_id = ? AND scope = ? AND is_pinned = ?
-- 4. WHERE team_id = ? AND scope = ? ORDER BY created_at
```

```typescript
// ✅ 인덱스 활용
const pinnedStories = await db
  .select()
  .from(stories)
  .where(
    and(
      eq(stories.teamId, teamId),
      eq(stories.scope, 'team'),
      eq(stories.isPinned, true)
    )
  )
  .orderBy(desc(stories.createdAt));
```

### 부분 인덱스 (Partial Index)
```sql
-- 발행된 story만 인덱싱 (저장 공간 절약)
CREATE INDEX idx_stories_published
ON stories(is_published, published_at DESC)
WHERE is_published = true;
```

## 3. 집계 쿼리 최적화 (Aggregation Optimization)

### COUNT 최적화
```typescript
// ❌ BAD: 전체 데이터 카운트
const count = (await db.select().from(stories)).length;

// ✅ GOOD: COUNT 쿼리 사용
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(stories)
  .where(eq(stories.teamId, teamId));
```

### 그룹별 집계
```typescript
// 효율적인 좋아요 수 계산
const likeCounts = await db
  .select({
    storyId: likes.storyId,
    count: sql<number>`count(*)`,
  })
  .from(likes)
  .where(inArray(likes.storyId, storyIds))
  .groupBy(likes.storyId);
```

## 4. 트랜잭션 최적화 (Transaction Optimization)

### 배치 작업
```typescript
// ❌ BAD: 개별 INSERT
for (const event of events) {
  await db.insert(calendarEvents).values(event);
}

// ✅ GOOD: 배치 INSERT (한 번의 쿼리)
await db.insert(calendarEvents).values(events);
```

### 낙관적 잠금 (Optimistic Locking)
```typescript
// 버전 필드를 사용한 동시성 제어
const [updated] = await db
  .update(stories)
  .set({
    content: newContent,
    version: sql`${stories.version} + 1`,
    updatedAt: new Date(),
  })
  .where(
    and(
      eq(stories.id, storyId),
      eq(stories.version, currentVersion)
    )
  )
  .returning();

if (!updated) {
  throw new Error('Concurrent modification detected');
}
```

## 5. 캐싱 전략 (Caching Strategy)

### Redis 캐싱 패턴
```typescript
// 1. Cache-Aside Pattern
async function getStory(id: string) {
  // 1. 캐시 확인
  const cached = await redis.get(`story:${id}`);
  if (cached) return JSON.parse(cached);

  // 2. DB 조회
  const story = await db.query.stories.findFirst({
    where: eq(stories.id, id),
  });

  // 3. 캐시 저장 (TTL: 1시간)
  await redis.setex(`story:${id}`, 3600, JSON.stringify(story));

  return story;
}

// 2. Write-Through Pattern
async function createStory(data) {
  const [story] = await db.insert(stories).values(data).returning();

  // 즉시 캐시에 저장
  await redis.setex(`story:${story.id}`, 3600, JSON.stringify(story));

  return story;
}

// 3. Cache Invalidation
async function updateStory(id: string, data) {
  const [story] = await db
    .update(stories)
    .set(data)
    .where(eq(stories.id, id))
    .returning();

  // 캐시 무효화
  await redis.del(`story:${id}`);

  return story;
}
```

### 캐싱할 데이터
1. **자주 읽히는 데이터**: 사용자 프로필, 팀 정보
2. **변경이 적은 데이터**: 설정, 권한, 역할
3. **집계 데이터**: 좋아요 수, 댓글 수, 팔로워 수
4. **세션 데이터**: 로그인 세션, 토큰

## 6. 데이터베이스 설정 최적화

### PostgreSQL 설정
```sql
-- 1. Shared Buffers (RAM의 25%)
ALTER SYSTEM SET shared_buffers = '4GB';

-- 2. Work Memory (복잡한 쿼리용)
ALTER SYSTEM SET work_mem = '64MB';

-- 3. Maintenance Work Memory (VACUUM, CREATE INDEX용)
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- 4. Effective Cache Size (총 RAM의 50-75%)
ALTER SYSTEM SET effective_cache_size = '12GB';

-- 5. WAL 설정 (Write-Ahead Logging)
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- 설정 reload
SELECT pg_reload_conf();
```

## 7. 쿼리 실행 계획 분석 (Execution Plan Analysis)

### EXPLAIN ANALYZE 사용
```sql
-- 실행 계획 확인
EXPLAIN ANALYZE
SELECT s.*, u.name as author_name
FROM stories s
LEFT JOIN users u ON s.author_id = u.id
WHERE s.team_id = 'some-uuid'
  AND s.scope = 'team'
ORDER BY s.is_pinned DESC, s.created_at DESC
LIMIT 20;

-- 주의사항:
-- 1. Seq Scan → Index Scan 으로 변경되어야 함
-- 2. Cost 값이 낮을수록 좋음
-- 3. Actual time vs Estimated time 비교
-- 4. Nested Loop vs Hash Join 선택 확인
```

### 느린 쿼리 모니터링
```sql
-- pg_stat_statements 활성화
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 가장 느린 쿼리 top 10
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 통계 리셋
SELECT pg_stat_statements_reset();
```

## 8. 연결 풀링 (Connection Pooling)

### PgBouncer 설정
```ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
```

### Drizzle 연결 풀 설정
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

## 9. 성능 모니터링 체크리스트

- [ ] 인덱스 사용률 > 99%
- [ ] 평균 쿼리 응답 시간 < 100ms
- [ ] 연결 풀 사용률 < 80%
- [ ] 캐시 히트율 > 90%
- [ ] 데이터베이스 CPU 사용률 < 70%
- [ ] 테이블 bloat < 20%
- [ ] 정기적인 VACUUM ANALYZE 실행

## 10. 추가 최적화 기법

### Materialized Views
```sql
-- 복잡한 집계를 미리 계산
CREATE MATERIALIZED VIEW story_stats AS
SELECT
  s.id,
  s.title,
  COUNT(DISTINCT l.id) as like_count,
  COUNT(DISTINCT c.id) as comment_count
FROM stories s
LEFT JOIN likes l ON s.id = l.story_id
LEFT JOIN comments c ON s.id = c.story_id
GROUP BY s.id, s.title;

-- 인덱스 추가
CREATE INDEX idx_story_stats_id ON story_stats(id);

-- 주기적으로 refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY story_stats;
```

### 파티셔닝 (Partitioning)
```sql
-- 날짜별 파티셔닝
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

-- 월별 파티션 생성
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

## 요약 (Summary)

1. **SELECT 최적화**: 필요한 컬럼만 선택, JOIN 대신 subquery 고려
2. **인덱스**: 복합 인덱스, 부분 인덱스 활용
3. **캐싱**: Redis로 자주 읽는 데이터 캐싱
4. **배치 작업**: 개별 쿼리 대신 배치 INSERT/UPDATE
5. **모니터링**: EXPLAIN ANALYZE로 쿼리 계획 확인
6. **연결 풀**: PgBouncer 또는 내장 풀링 사용
7. **파티셔닝**: 대용량 테이블 분할
8. **VACUUM**: 정기적인 유지보수
