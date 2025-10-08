# Backend - Fastify + tRPC + RBAC System

Production-ready backend API server with role-based access control.

## 📋 Tech Stack

- **Framework**: Fastify 5+ (high-performance web framework)
- **API**: tRPC 11+ (type-safe API without code generation)
- **ORM**: Drizzle ORM (type-safe database queries)
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest

## 🗄️ Database Schema

**24 Tables across 6 categories:**
- **Core (5)**: users, roles, permissions, user_roles, role_permissions
- **Auth (3)**: accounts, sessions, verification_tokens
- **Activity (2)**: user_activities, audit_logs
- **Security (3)**: security_whitelist, security_blacklist, suspicious_logins
- **Features (8)**: profiles, posts, teams, projects, calendar_events, notifications, translations
- **Admin (3)**: admin_assignments, password_resets, database_operations

**5-Tier RBAC System:**
1. **guest** (level 1) - Public access only
2. **user** (level 2) - Basic authenticated features
3. **premium** (level 3) - Advanced features (posts, teams, projects)
4. **admin** (level 4) - User management, permissions
5. **superadmin** (level 5) - Full system control

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your Neon PostgreSQL credentials:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Push Schema to Database

```bash
pnpm db:push
```

### 4. Seed Initial Data

```bash
pnpm db:seed
```

This creates:
- 5 roles (guest, user, premium, admin, superadmin)
- 28 permissions
- Admin user: `admin@example.com` / `Admin@123456`

### 5. Start Development Server

```bash
pnpm dev
```

Server runs on `http://localhost:4000`

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Build for production
pnpm start            # Start production server
pnpm type-check       # TypeScript check

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema (no migrations)
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed initial data
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report

# Code Quality
pnpm lint             # ESLint
pnpm format           # Prettier
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # Fastify server setup
│   ├── config/                  # Configuration files
│   │   └── app.config.ts
│   ├── db/                      # Database layer
│   │   ├── index.ts             # Database connection
│   │   ├── migrate.ts           # Migration runner
│   │   ├── seed.ts              # Database seeding
│   │   └── schema/              # 24 tables (organized by category)
│   │       ├── enums.ts
│   │       ├── core/            # users, roles, permissions
│   │       ├── auth/            # accounts, sessions, tokens
│   │       ├── activity/        # logs, audit
│   │       ├── security/        # whitelist, blacklist
│   │       ├── features/        # profiles, posts, teams, etc.
│   │       └── admin/           # admin operations
│   ├── trpc/                    # tRPC configuration
│   │   ├── context.ts           # tRPC context
│   │   ├── router.ts            # Root router
│   │   ├── routers/             # API routers
│   │   └── middlewares/         # RBAC, logging
│   ├── services/                # Business logic
│   ├── utils/                   # Utilities
│   │   ├── jwt.ts               # JWT utilities
│   │   └── password.ts          # Password hashing
│   └── types/                   # TypeScript types
├── drizzle.config.ts            # Drizzle configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## 🔐 Authentication Flow

1. **Signup/Signin** → Generate JWT access + refresh tokens
2. **Access Token** (15min) → Stored in localStorage, used for API calls
3. **Refresh Token** (30 days) → Stored in httpOnly cookie, used to renew access token
4. **Token Verification** → Middleware checks JWT on every protected route
5. **RBAC Check** → Middleware validates user role/permissions

## 🛡️ Security Features

- JWT tokens with expiration
- Password hashing with bcrypt (10 rounds)
- Role-based access control (5 tiers)
- Permission-level granularity
- Activity logging for all user actions
- Audit trail for database changes
- IP whitelist/blacklist
- Suspicious login detection

## 📚 API Documentation

The backend is ready for tRPC router implementation. Core utilities and database schema are in place.

## 🚢 Deployment

### Railway (Recommended)

```bash
# 1. Install CLI
npm i -g @railway/cli

# 2. Deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

## 📖 For Complete Documentation

See `/Users/wonny/Dev/joungwon.dreams/obsidian/dev-list/role-based-claude/backend.md`

## 📡 tRPC API Routes

### Auth Router (`auth.*`)
- `signup` - Register new user
- `signin` - Login and get JWT tokens
- `me` - Get current user info
- `refresh` - Refresh access token
- `signout` - Sign out user

### User Router (`user.*`)
- `getProfile` - Get own profile
- `updateProfile` - Update own profile (requires `user:update:own`)
- `getById` - Get user by ID (requires `user:read:all`)
- `list` - List all users (requires `user:list:all`)
- `updateUser` - Update any user (requires `user:update:all`)
- `deleteUser` - Delete user (requires `user:delete:all`)

### Role Router (`role.*`)
- `list` - List all roles (requires `role:read:all`)
- `getById` - Get role details (requires `role:read:all`)
- `assignToUser` - Assign role to user (requires `role:assign:all`)
- `removeFromUser` - Remove role from user (requires `role:assign:all`)
- `getUserRoles` - Get user's roles (requires `role:read:all`)

### Permission Router (`permission.*`)
- `list` - List all permissions (requires `permission:read:all`)
- `listByResource` - List by resource (requires `permission:read:all`)
- `getById` - Get permission details (requires `permission:read:all`)
- `grouped` - Get permissions grouped by resource (requires `permission:read:all`)

## 🔑 Permission Matrix

| Resource | Actions | Scopes |
|----------|---------|--------|
| user | read, update, delete, list | own, all |
| post | create, read, update, delete, manage | own, all |
| team | create, read, update, delete, manage | own, team, all |
| project | create, read, update, delete, manage | own, team, all |
| role | read, assign, manage | all |
| permission | read, manage | all |
| database | manage | all |
| security | manage | all |

**Total: 28 permissions**

## 🎯 Testing the API

The server is running and ready to accept tRPC requests. The API follows tRPC protocol and is designed to be consumed by a tRPC client.

### Test Credentials
- **Admin**: admin@example.com / Admin@123456
- **Permissions**: All 28 permissions

### Endpoints
- Health Check: `http://localhost:4000/health`
- tRPC: `http://localhost:4000/trpc/*`

---

**Status**: ✅ **COMPLETE** - All 20 implementation tasks finished
**Server**: 🟢 Running on http://localhost:4000
