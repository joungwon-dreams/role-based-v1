-- ============================================================================
-- DATABASE PARTITIONING STRATEGY
-- ============================================================================
--
-- 파티셔닝은 대용량 테이블을 작은 물리적 파티션으로 분할하여
-- 쿼리 성능을 향상시키고 유지보수를 간소화합니다.
--
-- 장점:
-- 1. 쿼리 성능 향상 (partition pruning)
-- 2. 빠른 데이터 삭제 (DROP PARTITION)
-- 3. 유지보수 간소화 (파티션별 VACUUM)
-- 4. 병렬 처리 가능
--
-- 단점:
-- 1. 초기 설정 복잡도
-- 2. 파티션 키 선택 중요
-- 3. 파티션 간 조인 비용
--
-- ============================================================================

-- ============================================================================
-- 1. AUDIT LOGS - 월별 파티셔닝 (Range Partitioning)
-- ============================================================================
--
-- audit_logs는 시간이 지남에 따라 계속 증가하는 append-only 테이블입니다.
-- 월별로 파티셔닝하여 오래된 데이터를 쉽게 아카이빙할 수 있습니다.

-- 기존 테이블을 파티셔닝 테이블로 변환
-- 주의: 기존 데이터가 있다면 먼저 백업!

-- Step 1: 파티셔닝된 새 테이블 생성
CREATE TABLE audit_logs_partitioned (
  id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Step 2: 파티션 생성 (2025년 예시)
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- 이후 월별 파티션 계속 추가...

-- Step 3: 인덱스 생성 (각 파티션에 자동 적용)
CREATE INDEX ON audit_logs_partitioned(user_id, created_at DESC);
CREATE INDEX ON audit_logs_partitioned(action);
CREATE INDEX ON audit_logs_partitioned(resource_type, resource_id);

-- Step 4: 기존 데이터 마이그레이션 (필요 시)
-- INSERT INTO audit_logs_partitioned SELECT * FROM audit_logs;

-- Step 5: 테이블 교체 (downtime 필요)
-- ALTER TABLE audit_logs RENAME TO audit_logs_old;
-- ALTER TABLE audit_logs_partitioned RENAME TO audit_logs;

-- ============================================================================
-- 파티션 자동 생성 함수 (매월 실행)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_audit_log_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  -- 다음 달 파티션 생성
  partition_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  partition_name := 'audit_logs_' || TO_CHAR(partition_date, 'YYYY_MM');
  start_date := partition_date::TEXT;
  end_date := (partition_date + INTERVAL '1 month')::TEXT;

  -- 파티션이 없으면 생성
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF audit_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
      partition_name,
      start_date,
      end_date
    );
    RAISE NOTICE 'Created partition: %', partition_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 매월 1일 자동 실행하도록 크론 설정 필요
-- SELECT cron.schedule('create-audit-partition', '0 0 1 * *', 'SELECT create_audit_log_partition()');

-- ============================================================================
-- 오래된 파티션 삭제/아카이빙 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_old_audit_logs(months_to_keep INTEGER DEFAULT 12)
RETURNS void AS $$
DECLARE
  cutoff_date DATE;
  partition_record RECORD;
BEGIN
  cutoff_date := DATE_TRUNC('month', NOW() - (months_to_keep || ' months')::INTERVAL);

  FOR partition_record IN
    SELECT
      c.relname AS partition_name,
      pg_get_expr(c.relpartbound, c.oid) AS partition_bound
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    JOIN pg_class p ON p.oid = i.inhparent
    WHERE p.relname = 'audit_logs_partitioned'
    AND c.relname LIKE 'audit_logs_%'
  LOOP
    -- 파티션 날짜 파싱 (간단 버전)
    -- 실제로는 relpartbound를 파싱해야 함
    -- 여기서는 이름에서 날짜 추출
    IF partition_record.partition_name < 'audit_logs_' || TO_CHAR(cutoff_date, 'YYYY_MM') THEN
      -- Option 1: 파티션 삭제 (데이터 영구 삭제)
      -- EXECUTE format('DROP TABLE %I', partition_record.partition_name);

      -- Option 2: 파티션 분리 후 아카이브 테이블로 이동
      EXECUTE format('ALTER TABLE audit_logs_partitioned DETACH PARTITION %I', partition_record.partition_name);
      EXECUTE format('ALTER TABLE %I RENAME TO %I', partition_record.partition_name, partition_record.partition_name || '_archived');

      RAISE NOTICE 'Archived partition: %', partition_record.partition_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 매월 실행: SELECT archive_old_audit_logs(12);

-- ============================================================================
-- 2. SYSTEM LOGS - 주별 파티셔닝
-- ============================================================================
--
-- system_logs는 더 빠르게 증가하므로 주별 파티셔닝 사용

CREATE TABLE system_logs_partitioned (
  id UUID NOT NULL,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 주별 파티션 생성 함수
CREATE OR REPLACE FUNCTION create_system_log_weekly_partitions()
RETURNS void AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  partition_name TEXT;
  i INTEGER;
BEGIN
  -- 향후 4주 파티션 미리 생성
  FOR i IN 0..3 LOOP
    week_start := DATE_TRUNC('week', NOW() + (i || ' weeks')::INTERVAL);
    week_end := week_start + INTERVAL '1 week';
    partition_name := 'system_logs_' || TO_CHAR(week_start, 'YYYY_IW');

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF system_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        week_start::TEXT,
        week_end::TEXT
      );
      RAISE NOTICE 'Created weekly partition: %', partition_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 인덱스
CREATE INDEX ON system_logs_partitioned(level, created_at DESC);
CREATE INDEX ON system_logs_partitioned(created_at DESC);

-- ============================================================================
-- 3. USER ACTIVITIES - 월별 파티셔닝
-- ============================================================================

CREATE TABLE user_activities_partitioned (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 월별 파티션 생성 (audit_logs와 동일한 패턴)
-- ... (생략, audit_logs와 동일)

-- ============================================================================
-- 4. LIST PARTITIONING - 지역/국가별
-- ============================================================================
--
-- 지리적 분산이 필요한 경우 (예: 글로벌 서비스)

CREATE TABLE users_by_region (
  id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY LIST (country);

-- 지역별 파티션
CREATE TABLE users_asia PARTITION OF users_by_region
  FOR VALUES IN ('KR', 'JP', 'CN', 'SG', 'TH');

CREATE TABLE users_europe PARTITION OF users_by_region
  FOR VALUES IN ('DE', 'FR', 'GB', 'IT', 'ES');

CREATE TABLE users_americas PARTITION OF users_by_region
  FOR VALUES IN ('US', 'CA', 'BR', 'MX', 'AR');

CREATE TABLE users_others PARTITION OF users_by_region
  DEFAULT; -- 나머지 국가

-- ============================================================================
-- 5. HASH PARTITIONING - 균등 분산
-- ============================================================================
--
-- 특정 키로 균등하게 분산하고 싶을 때 (예: user_id 기반)

CREATE TABLE user_sessions_partitioned (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY HASH (user_id);

-- 4개 파티션으로 분산
CREATE TABLE user_sessions_p0 PARTITION OF user_sessions_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE user_sessions_p1 PARTITION OF user_sessions_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE user_sessions_p2 PARTITION OF user_sessions_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE user_sessions_p3 PARTITION OF user_sessions_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- ============================================================================
-- PARTITIONING BEST PRACTICES
-- ============================================================================

-- 1. 파티션 키 선택
--    - 쿼리에서 자주 사용하는 컬럼
--    - 시간 기반 테이블은 created_at 사용
--    - 균등 분산 필요 시 HASH 사용

-- 2. 파티션 크기
--    - 너무 작으면: 파티션 관리 비용 증가
--    - 너무 크면: 파티셔닝 효과 감소
--    - 권장: 파티션당 10GB ~ 100GB

-- 3. 인덱스 전략
--    - 파티션 테이블에 인덱스 생성하면 모든 파티션에 자동 적용
--    - 각 파티션별로 별도 인덱스 생성 가능

-- 4. 쿼리 최적화
--    - WHERE 절에 파티션 키 포함 시 partition pruning 활성화
--    - EXPLAIN ANALYZE로 partition pruning 확인

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- 파티션 정보 조회
SELECT
  parent.relname AS table_name,
  child.relname AS partition_name,
  pg_get_expr(child.relpartbound, child.oid) AS partition_bound,
  pg_size_pretty(pg_relation_size(child.oid)) AS size
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'audit_logs_partitioned'
ORDER BY child.relname;

-- 파티션 pruning 확인
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM audit_logs_partitioned
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01';
-- "Partitions removed"가 표시되면 pruning이 작동 중

-- 파티션별 행 수
SELECT
  tableoid::regclass AS partition,
  COUNT(*) AS row_count
FROM audit_logs_partitioned
GROUP BY tableoid
ORDER BY partition;

-- ============================================================================
-- MIGRATION CHECKLIST
-- ============================================================================

-- [ ] 1. 백업 생성
-- [ ] 2. 파티션 테이블 생성
-- [ ] 3. 인덱스 생성
-- [ ] 4. 데이터 마이그레이션
-- [ ] 5. 애플리케이션 테스트
-- [ ] 6. 테이블 교체
-- [ ] 7. 모니터링 설정
-- [ ] 8. 자동 파티션 생성 스케줄 설정
-- [ ] 9. 아카이빙 정책 설정

-- ============================================================================
