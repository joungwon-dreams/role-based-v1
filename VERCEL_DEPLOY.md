# 🔺 Vercel 배포 가이드

## ✅ 완전 무료 배포!

Vercel은 결제 정보 없이 무료로 사용할 수 있습니다.

## 1단계: Vercel 계정 생성

1. **https://vercel.com** 접속
2. **"Sign Up"** 클릭
3. **GitHub로 로그인** (joungwon-dreams 계정)

## 2단계: 새 프로젝트 생성

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서
3. **`joungwon-dreams/role-based-v1`** 검색 및 선택
4. **"Import"** 클릭

## 3단계: 프로젝트 설정

### Build & Development Settings

```
Framework Preset: Other
Root Directory: backend
Build Command: pnpm install && pnpm build
Output Directory: (비워두기)
Install Command: pnpm install
```

## 4단계: 환경변수 설정

**Environment Variables** 섹션에서 다음 변수들을 추가:

### 필수 환경변수

```bash
# Database (이미 사용 중인 Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# JWT Secret (새로 생성)
JWT_SECRET=<your-64-character-hex-secret>

# Server Config
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGINS=*

# JWT Expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

### JWT_SECRET 생성

로컬 터미널에서:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

출력된 값을 복사해서 `JWT_SECRET`에 입력

### DATABASE_URL

현재 로컬에서 사용 중인 Neon PostgreSQL URL을 그대로 사용:
```bash
# backend/.env.local 파일에서 복사
cat backend/.env.local | grep DATABASE_URL
```

## 5단계: 배포

모든 설정 완료 후:
1. **"Deploy"** 버튼 클릭
2. 약 2-3분 기다리기
3. 배포 완료!

## 6단계: 배포 URL 확인

배포가 완료되면 자동으로 URL이 생성됩니다:

```
https://role-based-v1-<random>.vercel.app
```

## 7단계: 데이터베이스 시드

### 방법 1: Vercel CLI 사용 (추천)

로컬 터미널에서:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 링크
cd backend
vercel link

# 시드 스크립트 실행
vercel env pull .env.vercel
pnpm db:seed
```

### 방법 2: 로컬에서 직접 시드

Neon PostgreSQL을 사용하므로 로컬에서 시드 가능:

```bash
cd backend
pnpm db:seed
```

시드 완료 시:
- ✅ 5개 roles 생성
- ✅ 28개 permissions 생성
- ✅ Admin 사용자 생성 (admin@example.com / Admin@123456)

## 8단계: API 테스트

배포된 URL로 테스트:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# tRPC endpoint (admin 로그인 테스트)
curl -X POST https://your-app.vercel.app/api/trpc/auth.signin \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":{"email":"admin@example.com","password":"Admin@123456"}}}'
```

## 🎯 배포 완료!

✅ Backend API가 Vercel Serverless Functions로 실행 중
✅ Neon PostgreSQL 데이터베이스 연결됨
✅ 초기 데이터 시드 완료
✅ **완전 무료!**

## 📡 API 엔드포인트

```
Health Check: https://your-app.vercel.app/api/health
tRPC API: https://your-app.vercel.app/api/trpc/*
```

### 사용 예시

```typescript
// Frontend에서 사용
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-app.vercel.app/api/trpc',
    }),
  ],
});

// 로그인
const result = await trpc.auth.signin.mutate({
  email: 'admin@example.com',
  password: 'Admin@123456',
});
```

## 🔄 자동 배포

GitHub에 push하면 Vercel이 자동으로 재배포:

```bash
git add .
git commit -m "update backend"
git push
```

Vercel이 자동으로 감지하고 새 배포 시작!

## 문제 해결

### 빌드 실패

**Logs** 탭에서 에러 확인:
- TypeScript 에러: 로컬에서 `pnpm type-check`
- 환경변수 누락: Vercel 대시보드에서 확인

### 런타임 에러

**Function Logs** 확인:
- DATABASE_URL 연결 문제
- JWT_SECRET 누락

### Cold Start

Vercel Serverless Functions는 cold start가 있습니다:
- 첫 요청: 1-2초
- 이후 요청: 빠름 (<100ms)

## Vercel 장점

✅ **무료** - 신용카드 불필요
✅ **자동 HTTPS** - SSL 인증서 자동
✅ **CDN** - 전 세계 빠른 속도
✅ **자동 배포** - Git push로 배포
✅ **무제한 트래픽** - Hobby plan

---

**배포 시간**: 5분
**비용**: 완전 무료
