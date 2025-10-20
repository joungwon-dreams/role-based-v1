# Database Optimization Documentation

데이터베이스 성능 최적화를 위한 종합 가이드입니다.

## 📋 목차 (Table of Contents)

1. [개요](#overview)
2. [인덱스 최적화](#indexes)
3. [쿼리 최적화](#query-optimization)
4. [캐싱 전략](#caching)
5. [파티셔닝](#partitioning)
6. [구현 가이드](#implementation)
7. [모니터링](#monitoring)
8. [성능 목표](#performance-goals)

---

## 📊 개요 (Overview) {#overview}

### 최적화 목표

| 항목 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| 평균 쿼리 응답 시간 | ~500ms | <100ms | 80% ⬇️ |
| 캐시 히트율 | ~60% | >90% | 50% ⬆️ |
| DB 쿼리 수 | 1000/min | 500/min | 50% ⬇️ |
| 인덱스 사용률 | ~70% | >95% | 25% ⬆️ |
| I/O 작업 | 높음 | 낮음 | 60% ⬇️ |

### 최적화 전략

```
1. 인덱스 (Indexes)
   ├── 단일 컬럼 인덱스
   ├── 복합 인덱스
   ├── 부분 인덱스
   └── 커버링 인덱스

2. 캐싱 (Caching)
   ├── Redis 기반
   ├── Cache-Aside 패턴
   ├── Write-Through 패턴
   └── 캐시 무효화 전략

3. 쿼리 최적화 (Query Optimization)
   ├── SELECT 절 최적화
   ├── JOIN 최적화
   ├── WHERE 절 인덱스 활용
   └── Pagination 최적화

4. 파티셔닝 (Partitioning)
   ├── Range Partitioning (시간 기반)
   ├── List Partitioning (지역 기반)
   └── Hash Partitioning (균등 분산)

5. 연결 풀링 (Connection Pooling)
   └── PgBouncer / 내장 풀

6. I/O 감소
   ├── 배치 작업
   ├── Lazy Loading
   └── Materialized Views
```

---

## 🔍 인덱스 최적화 (Indexes) {#indexes}

### 파일 위치
- **`indexes.sql`** - 모든 인덱스 정의

### 주요 인덱스

#### 1. Core Tables
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- User Roles
CREATE INDEX idx_user_roles_composite ON user_roles(user_id, role_id);
```

#### 2. Stories (Team & Personal)
```sql
-- 팀 스토리 조회 최적화
CREATE INDEX idx_stories_team_composite
ON stories(team_id, scope, is_pinned, created_at DESC)
WHERE team_id IS NOT NULL AND scope = 'team';

-- 작성자별 스토리
CREATE INDEX idx_stories_author_composite
ON stories(author_id, scope, created_at DESC);
```

#### 3. Comments (Hierarchical)
```sql
-- 스토리별 댓글 + 계층 구조
CREATE INDEX idx_comments_story_hierarchy
ON comments(story_id, parent_id, created_at DESC);
```

#### 4. Calendar Events
```sql
-- 시간 범위 쿼리 최적화
CREATE INDEX idx_calendar_events_user_time
ON calendar_events(user_id, start_time, end_time);

CREATE INDEX idx_calendar_events_team_time
ON calendar_events(team_id, scope, start_time, end_time)
WHERE team_id IS NOT NULL AND scope = 'team';
```

### 인덱스 적용 방법

```bash
# PostgreSQL에 인덱스 적용
psql -U postgres -d your_database -f indexes.sql

# 또는 migration으로 적용
pnpm drizzle-kit generate:pg
pnpm drizzle-kit push:pg
```

### 인덱스 모니터링

```sql
-- 인덱스 사용 통계
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 사용되지 않는 인덱스 찾기
SELECT
  schemaname || '.' || tablename AS table,
  indexname AS index,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🚀 쿼리 최적화 (Query Optimization) {#query-optimization}

### 파일 위치
- **`query-optimization.md`** - 쿼리 최적화 가이드

### 핵심 원칙

#### 1. SELECT 최적화
```typescript
// ❌ BAD
const stories = await db.select().from(stories);

// ✅ GOOD - 필요한 컬럼만
const stories = await db.select({
  id: stories.id,
  title: stories.title,
  createdAt: stories.createdAt,
}).from(stories);
```

#### 2. N+1 문제 해결
```typescript
// ❌ BAD - N+1 쿼리
for (const story of stories) {
  const author = await db.query.users.findFirst({
    where: eq(users.id, story.authorId)
  });
}

// ✅ GOOD - JOIN으로 한 번에
const storiesWithAuthors = await db
  .select({
    story: stories,
    author: users,
  })
  .from(stories)
  .leftJoin(users, eq(stories.authorId, users.id));
```

#### 3. Cursor-based Pagination
```typescript
// ❌ BAD - OFFSET (느림)
const page = await db
  .select()
  .from(stories)
  .offset(page * limit)
  .limit(limit);

// ✅ GOOD - Cursor-based (빠름)
const page = await db
  .select()
  .from(stories)
  .where(gt(stories.createdAt, lastSeenCreatedAt))
  .orderBy(desc(stories.createdAt))
  .limit(limit);
```

### 실행 계획 분석

```sql
EXPLAIN ANALYZE
SELECT s.*, u.name
FROM stories s
LEFT JOIN users u ON s.author_id = u.id
WHERE s.team_id = 'uuid'
  AND s.scope = 'team'
ORDER BY s.created_at DESC
LIMIT 20;
```

---

## 💾 캐싱 전략 (Caching) {#caching}

### 파일 위치
- **`caching-strategy.ts`** - Redis 캐싱 구현

### Redis 설정

```typescript
// Redis 연결
import { redis, CacheKeys, CacheTTL } from './optimizations/caching-strategy';

// 환경 변수
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

### 캐싱 패턴

#### 1. Cache-Aside Pattern
```typescript
import { cacheAside, CacheKeys, CacheTTL } from './optimizations/caching-strategy';

const user = await cacheAside(
  CacheKeys.user(userId),
  async () => db.query.users.findFirst({
    where: eq(users.id, userId)
  }),
  CacheTTL.user
);
```

#### 2. Write-Through Pattern
```typescript
import { writeThrough, CacheKeys, CacheTTL } from './optimizations/caching-strategy';

const [story] = await db.insert(stories).values(data).returning();
await writeThrough(CacheKeys.story(story.id), story, CacheTTL.story);
```

#### 3. Cache Invalidation
```typescript
import { invalidateRelatedCache } from './optimizations/caching-strategy';

// Story 업데이트 시
await db.update(stories).set(data).where(eq(stories.id, storyId));
await invalidateRelatedCache('story', storyId);
```

### 캐싱할 데이터

| 데이터 유형 | TTL | 이유 |
|------------|-----|------|
| 사용자 프로필 | 1시간 | 자주 읽힘, 변경 적음 |
| 팀 정보 | 1시간 | 자주 읽힘, 변경 적음 |
| 좋아요/댓글 수 | 5분 | 자주 읽힘, 자주 변경 |
| 스토리 목록 | 10분 | 페이지네이션마다 변경 |
| 캘린더 이벤트 | 10분 | 보통 빈도 조회 |
| 세션 | 24시간 | 보안 관련 |

---

## 📦 파티셔닝 (Partitioning) {#partitioning}

### 파일 위치
- **`partitioning-strategy.sql`** - 파티셔닝 전략

### 파티셔닝 대상 테이블

#### 1. Audit Logs - 월별 Range Partitioning
```sql
CREATE TABLE audit_logs_partitioned (
  ...
) PARTITION BY RANGE (created_at);

-- 월별 파티션
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**장점**:
- 오래된 데이터 빠른 삭제 (DROP PARTITION)
- 쿼리 성능 향상 (partition pruning)
- 유지보수 간소화

#### 2. System Logs - 주별 Range Partitioning
```sql
CREATE TABLE system_logs_partitioned (
  ...
) PARTITION BY RANGE (created_at);

-- 주별 파티션 (빠르게 증가하는 로그)
```

#### 3. User Sessions - Hash Partitioning
```sql
CREATE TABLE user_sessions_partitioned (
  ...
) PARTITION BY HASH (user_id);

-- 4개 파티션으로 균등 분산
```

### 파티션 자동 생성

```sql
-- 매월 자동 파티션 생성
CREATE OR REPLACE FUNCTION create_audit_log_partition()
RETURNS void AS $$
  -- 다음 달 파티션 자동 생성
$$ LANGUAGE plpgsql;

-- Cron 스케줄
SELECT cron.schedule(
  'create-audit-partition',
  '0 0 1 * *', -- 매월 1일
  'SELECT create_audit_log_partition()'
);
```

---

## 🛠️ 구현 가이드 (Implementation) {#implementation}

### Step 1: 환경 설정

```bash
# Redis 설치 (macOS)
brew install redis
brew services start redis

# PostgreSQL 확인
psql --version

# Node.js 패키지
pnpm add ioredis
pnpm add -D @types/ioredis
```

### Step 2: 인덱스 적용

```bash
# 1. 데이터베이스 백업
pg_dump -U postgres your_database > backup.sql

# 2. 인덱스 생성 (downtime 최소화)
psql -U postgres -d your_database -f backend/src/db/optimizations/indexes.sql

# 3. VACUUM ANALYZE 실행
psql -U postgres -d your_database -c "VACUUM ANALYZE;"
```

### Step 3: 캐싱 통합

```typescript
// 1. tRPC 라우터에 캐싱 추가
import { cacheAside, CacheKeys, CacheTTL } from '@/db/optimizations/caching-strategy';

export const storyRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return cacheAside(
        CacheKeys.story(input.id),
        async () => {
          return ctx.db.query.stories.findFirst({
            where: eq(stories.id, input.id),
          });
        },
        CacheTTL.story
      );
    }),
});

// 2. Mutation 시 캐시 무효화
update: protectedProcedure
  .input(...)
  .mutation(async ({ ctx, input }) => {
    const [story] = await ctx.db
      .update(stories)
      .set(input.data)
      .where(eq(stories.id, input.id))
      .returning();

    // 캐시 무효화
    await invalidateRelatedCache('story', input.id);

    return story;
  }),
```

### Step 4: 모니터링 설정

```typescript
// 캐시 통계 엔드포인트
export const adminRouter = router({
  cacheStats: protectedProcedure.query(async () => {
    return getCacheStats();
  }),

  cacheHitRate: protectedProcedure.query(async () => {
    return getCacheHitRate();
  }),
});
```

---

## 📈 모니터링 (Monitoring) {#monitoring}

### 1. 데이터베이스 모니터링

```sql
-- 느린 쿼리 Top 10
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 인덱스 히트율 (>99% 권장)
SELECT
  sum(idx_blks_hit) * 100.0 / sum(idx_blks_hit + idx_blks_read) AS index_hit_rate
FROM pg_statio_user_indexes;

-- 캐시 히트율
SELECT
  sum(heap_blks_hit) * 100.0 / sum(heap_blks_hit + heap_blks_read) AS cache_hit_rate
FROM pg_statio_user_tables;
```

### 2. Redis 모니터링

```bash
# Redis CLI
redis-cli

# 통계 확인
> INFO stats
> INFO memory

# 키 수
> DBSIZE

# 키 패턴 검색
> KEYS user:*
```

```typescript
// 프로그래매틱 모니터링
import { getCacheStats, getCacheHitRate } from './optimizations/caching-strategy';

// 캐시 통계
const stats = await getCacheStats();
console.log(stats);

// 캐시 히트율
const hitRate = await getCacheHitRate();
console.log(hitRate); // { hits: 1000, misses: 100, hitRate: '90.91%' }
```

### 3. 성능 모니터링 대시보드

```typescript
// 실시간 성능 메트릭 수집
export async function collectPerformanceMetrics() {
  const [dbStats, cacheStats, cacheHitRate] = await Promise.all([
    // DB 통계
    db.execute(sql`
      SELECT
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT avg(mean_exec_time) FROM pg_stat_statements) as avg_query_time
    `),
    // 캐시 통계
    getCacheStats(),
    // 캐시 히트율
    getCacheHitRate(),
  ]);

  return {
    database: dbStats,
    cache: cacheStats,
    hitRate: cacheHitRate,
    timestamp: new Date(),
  };
}
```

---

## 🎯 성능 목표 (Performance Goals) {#performance-goals}

### 단기 목표 (1개월)

- [ ] ✅ 모든 인덱스 적용 완료
- [ ] ✅ Redis 캐싱 구현 (주요 엔드포인트)
- [ ] 📊 평균 쿼리 응답 시간 < 200ms
- [ ] 📊 캐시 히트율 > 70%

### 중기 목표 (3개월)

- [ ] 🔄 Audit Logs 파티셔닝 완료
- [ ] 🔄 System Logs 파티셔닝 완료
- [ ] 📊 평균 쿼리 응답 시간 < 100ms
- [ ] 📊 캐시 히트율 > 85%
- [ ] 📊 DB 쿼리 수 30% 감소

### 장기 목표 (6개월)

- [ ] 🚀 Materialized Views 구현
- [ ] 🚀 Read Replica 설정
- [ ] 🚀 PgBouncer 연결 풀링
- [ ] 📊 평균 쿼리 응답 시간 < 50ms
- [ ] 📊 캐시 히트율 > 90%
- [ ] 📊 DB 쿼리 수 50% 감소

---

## 📚 참고 자료 (References)

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Drizzle ORM Best Practices](https://orm.drizzle.team/docs/performance)
- [Redis Caching Patterns](https://redis.io/topics/lru-cache)
- [Database Partitioning Guide](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

## 🤝 기여 (Contributing)

성능 최적화에 대한 제안이나 개선 사항이 있다면 이슈를 생성하거나 PR을 제출해 주세요.

---

## 📝 변경 이력 (Changelog)

- **2025-01-13**: 초기 최적화 문서 작성
  - 인덱스 전략 수립
  - 캐싱 전략 구현
  - 파티셔닝 가이드 작성
  - 쿼리 최적화 가이드 작성
