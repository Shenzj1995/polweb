# Supabase 项目配置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 注册/登录
2. 点击 **New Project**
3. 填写项目名称（如 `ai-studio`）和数据库密码
4. 选择区域（推荐选离目标用户最近的，如 US East）
5. 等待项目创建完成（约 2 分钟）

## 2. 获取环境变量

在 Supabase Dashboard → **Settings** → **API** 中找到：

```
NEXT_PUBLIC_SUPABASE_URL=        → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   → anon public key
SUPABASE_SERVICE_ROLE_KEY=       → service_role secret key
```

在 **Settings** → **Database** 中找到：

```
DATABASE_URL=                    → Connection string (URI 格式，将 [YOUR-PASSWORD] 替换为你的密码)
```

将这些值填入项目根目录的 `.env.local` 文件。

## 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送 schema 到 Supabase 数据库
npx prisma db push
```

## 4. 配置 OAuth 登录

### Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目 → APIs & Services → Credentials → Create OAuth Client ID
3. 应用类型选 **Web Application**
4. Authorized redirect URIs 填：
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. 拿到 Client ID 和 Client Secret
6. 回到 Supabase Dashboard → **Authentication** → **Providers** → **Google**
7. 开启 Google，填入 Client ID 和 Client Secret

### GitHub OAuth
1. 访问 GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. 拿到 Client ID 和 Client Secret
5. 回到 Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
6. 开启 GitHub，填入 Client ID 和 Client Secret

## 5. 配置 Site URL

Supabase Dashboard → **Authentication** → **URL Configuration**：
- Site URL: `http://localhost:3000`（开发环境）
- Redirect URLs 添加：
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`（生产环境）

## 6. 关闭邮箱确认（可选，开发阶段）

Supabase Dashboard → **Authentication** → **Providers** → **Email**：
- 取消勾选 **Confirm email**（仅开发阶段使用，上线前务必开启）

## 7. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000/signup` 注册新用户。

## 项目认证架构说明

```
用户点击登录按钮
    ↓
Supabase Auth (OAuth / Email)
    ↓
/oauth/callback → 交换 code 为 session
    ↓
/api/user/sync → upsert 用户到我们的 users 表
    ↓
middleware.ts → 刷新 session + 保护路由
    ↓
AuthContext → 前端获取用户状态/积分/计划
```

### 关键文件
- `src/lib/supabase/client.ts` — 浏览器端 Supabase 客户端
- `src/lib/supabase/server.ts` — 服务端 Supabase 客户端
- `src/lib/supabase/auth-context.tsx` — React Auth Context Provider
- `src/middleware.ts` — Session 刷新 + 路由保护
- `src/app/auth/callback/route.ts` — OAuth 回调处理
- `src/app/api/user/sync/route.ts` — 用户同步到我们的 DB
- `src/app/api/user/profile/route.ts` — 获取用户积分/计划
