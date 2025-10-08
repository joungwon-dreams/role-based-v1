# 🚂 Railway 배포 가이드

## 1단계: Railway 프로젝트 생성

1. **https://railway.app** 접속
2. **GitHub로 로그인** (joungwon-dreams 계정)
3. **"New Project"** 클릭
4. **"Deploy from GitHub repo"** 선택
5. **"joungwon-dreams/role-based-v1"** 선택

## 2단계: 서비스 설정

프로젝트가 생성되면 서비스 설정:

### Settings → Build & Deploy

```
Root Directory: backend
Build Command: pnpm install && pnpm build
Start Command: node dist/index.js
```

## 3단계: PostgreSQL 추가

1. 프로젝트 대시보드에서 **"+ New"** 클릭
2. **"Database"** → **"Add PostgreSQL"** 선택
3. PostgreSQL이 자동으로 프로비저닝됨
4. `DATABASE_URL`이 자동으로 생성됨

## 4단계: 환경변수 설정

Backend 서비스 → **Variables** 탭:

### 필수 환경변수

```bash
# Database (자동 생성됨)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (새로 생성 필요)
JWT_SECRET=<your-64-character-hex-secret>

# Server
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# CORS
CORS_ORIGINS=*

# JWT Expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

### JWT_SECRET 생성 방법

로컬에서 실행:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

출력된 값을 `JWT_SECRET`에 입력

## 5단계: 재배포

환경변수 저장하면 자동으로 재배포됨

## 6단계: 데이터베이스 시드

배포 완료 후:

1. Backend 서비스 → **"Shell"** 탭
2. 다음 명령어 실행:

```bash
pnpm db:seed
```

이것이 실행되면:
- 5개 roles 생성
- 28개 permissions 생성
- Admin 사용자 생성 (admin@example.com / Admin@123456)

## 7단계: 배포 확인

### 배포된 URL 확인

Backend 서비스 → **"Settings"** → **"Domains"** 섹션에서 URL 확인

예: `https://role-based-v1-production.up.railway.app`

### API 테스트

```bash
# Health check
curl https://your-app.up.railway.app/health

# tRPC endpoint
curl https://your-app.up.railway.app/trpc/auth.me
```

## 8단계: 배포 완료!

✅ Backend API가 Railway에서 실행 중
✅ PostgreSQL 데이터베이스 연결됨
✅ 초기 데이터 시드 완료

### 다음 단계

- Frontend (Next.js) 개발
- Frontend를 Vercel에 배포
- Frontend에서 Railway backend URL 연결

## 문제 해결

### 빌드 실패 시

**Logs** 탭에서 에러 확인:
- `pnpm` 버전 문제: `packageManager` 필드 확인
- TypeScript 에러: `pnpm type-check` 로컬에서 실행
- 환경변수 누락: Variables 탭에서 모든 필수값 확인

### 런타임 에러

**Deploy Logs** 확인:
- DATABASE_URL 연결 문제
- JWT_SECRET 누락
- PORT 바인딩 문제

### 데이터베이스 연결 실패

```bash
# Railway Shell에서 확인
echo $DATABASE_URL

# 연결 테스트
pnpm db:push
```

## 유용한 Railway 명령어

```bash
# 로그 확인
railway logs

# 재배포
railway up

# 환경변수 확인
railway variables

# Shell 접속
railway run bash
```

---

**배포 시간**: 약 5-10분
**비용**: Free tier로 시작 가능 ($5/월 크레딧)
