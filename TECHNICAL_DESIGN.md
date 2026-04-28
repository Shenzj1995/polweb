# 技术设计文档 — AI 视频/图片生成聚合平台

> 版本: v1.1 | 日期: 2026-04-27
> 目标市场: 海外（英文）| 技术栈: TypeScript / React 19 / Next.js 16
> 参考竞品: pollo.ai | 预算: 低成本启动 (<$100/月)
> 当前项目状态: 已初始化 Next.js 16.2.4 + React 19.2.4 + Tailwind CSS 4 + Prisma + Supabase + Stripe + Replicate/fal Provider 雏形

---

## 目录

1. [系统架构总览](#1-系统架构总览)
2. [技术栈选型明细](#2-技术栈选型明细)
3. [项目目录结构](#3-项目目录结构)
4. [数据库 Schema 设计](#4-数据库-schema-设计)
5. [API 接口设计](#5-api-接口设计)
6. [前端页面设计](#6-前端页面设计)
7. [AI 模型集成层设计](#7-ai-模型集成层设计)
8. [支付与积分系统设计](#8-支付与积分系统设计)
9. [SEO 技术方案](#9-seo-技术方案)
10. [部署与基础设施](#10-部署与基础设施)
11. [剩余 21 天开发路线图](#11-剩余-21-天开发路线图)
12. [Tech-Arch-Planner 复核清单](#12-tech-arch-planner-复核清单)

---

## 1. 系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户浏览器                               │
│  Landing Page │ Model Pages │ Generate Studio │ History │ Billing│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Vercel    │
                    │  Next.js 16 │
                    │  App Router │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │
   ┌──────▼──────┐  ┌──────▼──────┐
   │  Supabase   │  │ Cloudflare  │
   │  PostgreSQL │  │     R2      │
   │  + Auth     │  │ (Storage)   │
   └──────┬──────┘  └─────────────┘
          │
          │         ┌──────────────┐
          └────────▶│ Vercel Cron  │
                    │ polling 兜底 │
                    └──────┬───────┘
                           │
   ┌──────▼────────────────▼──────────────────────────┐
   │               AI Model APIs                      │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
   │  │Replicate │ │  fal.ai  │ │  Kling   │         │
   │  │(FLUX/SD) │ │(FLUX Pro)│ │   API    │         │
   │  └──────────┘ └──────────┘ └──────────┘         │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
   │  │ Runway   │ │  Luma    │ │  More... │         │
   │  │   API    │ │   API    │ │          │         │
   │  └──────────┘ └──────────┘ └──────────┘         │
   └──────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Stripe    │
                    │  Payments   │
                    └─────────────┘
```

### 核心数据流

```
用户提交生成请求
       │
       ▼
┌─────────────────┐
│ 1. 验证用户身份  │ ← Supabase Auth
│ 2. 检查积分余额  │ ← PostgreSQL
│ 3. 扣减积分      │ ← PostgreSQL Transaction
│ 4. 创建任务记录  │ ← PostgreSQL (Generation)
│ 5. 调用上游 AI API│ ← 带 webhookUrl
│ 6. 返回任务 ID   │ ← 前端开始轮询
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Webhook / Cron  │
│ 1. 接收上游回调  │ ← Replicate/fal/Kling...
│ 2. 校验签名/幂等 │ ← webhooks_log
│ 3. 下载结果文件  │
│ 4. 上传到 R2    │ ← Cloudflare R2
│ 5. 更新任务状态  │ → PostgreSQL
│ 6. 失败自动退款  │ → CreditLog
│ 7. 前端轮询拿结果│ → Polling
└─────────────────┘
```

---

## 2. 技术栈选型明细

### 前端

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|---------|
| **Next.js** | 16.2.4 (App Router) | 全栈框架 | SSR/SSG、Route Handlers、SEO 友好 |
| **React** | 19.2.4 | UI 库 | 与当前 Next.js 版本匹配，支持最新 Server Components 能力 |
| **TypeScript** | 5+ | 类型安全 | 减少运行时错误 |
| **Tailwind CSS** | 4.x | 样式 | 当前项目已使用 Tailwind 4 + PostCSS 插件 |
| **shadcn/ui** | 4.5.0 | 组件库 | 可定制、高质量、按需引入 |
| **Base UI** | 1.4.1 | 低层交互组件 | 当前依赖已引入，可作为复杂交互补充 |
| **Framer Motion** | 12.38.0 | 动画 | 特效展示页需要动画 |
| **React Hook Form + Zod** | RHF 7.74 / Zod 4.3 | 表单验证 | 类型安全的表单处理 |
| **nuqs** | 2.8.9 | URL 状态管理 | 搜索参数状态同步 |

### 后端

| 技术 | 用途 | 选择理由 |
|------|------|---------|
| **Next.js Route Handlers** | REST API | 与前端同仓库，部署简单 |
| **Prisma** | ORM | 类型安全的数据库操作 |
| **Supabase** | Auth + DB | 免费额度大、Auth 开箱即用 |
| **Vercel Cron** | 生成任务兜底轮询 | MVP 零额外基础设施 |
| **Upstash QStash / Trigger.dev** | 后续任务编排 | 5000 DAU 或 webhook 失败率升高后再引入 |

### 第三方服务

| 服务 | 用途 | 免费额度 |
|------|------|---------|
| **Supabase** | PostgreSQL + OAuth Auth | 500MB DB, 50K Auth MAU |
| **Cloudflare R2** | 文件存储 | 10GB + 10M reads/月 |
| **Stripe** | 支付 | 无月费，按交易收费 |
| **Vercel** | 部署 | Hobby: 100GB BW, Serverless Functions |

### Next.js 16 开发注意事项

- 本项目不是 Next.js 14/15，开发前必须优先查看 `node_modules/next/dist/docs/` 中对应 App Router、Route Handlers、Metadata、Caching 文档。
- API 层使用 `src/app/api/**/route.ts` Route Handlers，不再使用 Pages Router 风格。
- 新增页面默认优先 Server Component；只有表单交互、浏览器状态、上传、动画等场景才加 `"use client"`。
- SEO 页面要优先使用 `generateMetadata`、`generateStaticParams`、静态内容配置和结构化数据，避免把纯内容页做成 CSR。

### 开发工具

| 工具 | 用途 |
|------|------|
| **ESLint + Prettier** | 代码规范 |
| **Husky + lint-staged** | Git hooks |
| **Vitest** | 单元测试 |
| **Playwright** | E2E 测试 |

---

## 3. 项目目录结构

```
polweb/
├── public/                          # 静态资源
│   ├── images/
│   │   ├── models/                  # 模型示例图
│   │   └── effects/                 # 特效预览图
│   └── og/                          # OG 图片
│
├── content/                         # SEO 内容 (MDX/JSON)
│   ├── models/                      # 模型页面内容
│   │   ├── kling-ai.json
│   │   ├── runway.json
│   │   ├── seedance.json
│   │   └── ...
│   ├── tools/                       # 工具页面内容
│   │   ├── text-to-video.json
│   │   ├── image-to-video.json
│   │   └── ...
│   ├── effects/                     # 特效页面内容
│   │   ├── ghibli-generator.json
│   │   └── ...
│   └── hub/                         # 博客/对比文章 (MDX)
│       ├── kling-ai-vs-runway.mdx
│       └── ...
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root Layout
│   │   ├── page.tsx                 # 首页 (直接是生成入口)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                  # 认证页面组
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts    # OAuth 回调
│   │   │
│   │   ├── (dashboard)/             # 登录后页面组
│   │   │   ├── layout.tsx           # Dashboard Layout (侧边栏)
│   │   │   ├── generate/
│   │   │   │   ├── page.tsx         # 生成工作台
│   │   │   │   ├── text-to-video/page.tsx
│   │   │   │   ├── image-to-video/page.tsx
│   │   │   │   ├── video-to-video/page.tsx
│   │   │   │   └── text-to-image/page.tsx
│   │   │   ├── history/page.tsx     # 生成历史
│   │   │   ├── assets/page.tsx      # 资产管理
│   │   │   └── billing/
│   │   │       ├── page.tsx         # 积分 & 订阅
│   │   │       └── success/page.tsx # 支付成功
│   │   │
│   │   ├── (marketing)/             # 营销/SEO 页面组
│   │   │   ├── pricing/page.tsx     # 定价页
│   │   │   ├── explore/page.tsx     # 社区展示
│   │   │   ├── models/
│   │   │   │   ├── page.tsx         # 模型广场聚合页
│   │   │   │   └── [slug]/page.tsx  # 单模型页 (SSG)
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx         # 工具目录页
│   │   │   │   └── [slug]/page.tsx  # 单工具页 (SSG)
│   │   │   ├── effects/
│   │   │   │   ├── page.tsx         # 特效目录页
│   │   │   │   └── [slug]/page.tsx  # 单特效页 (SSG)
│   │   │   └── hub/
│   │   │       └── [slug]/page.tsx  # 博客文章 (SSG)
│   │   │
│   │   └── api/                     # API 路由
│   │       ├── auth/                # Supabase Auth
│   │       ├── generate/
│   │       │   ├── route.ts         # POST 创建生成任务
│   │       │   └── [id]/route.ts    # GET 查询任务状态
│   │       ├── webhooks/
│   │       │   ├── replicate/route.ts
│   │       │   ├── fal/route.ts
│   │       │   └── stripe/route.ts
│   │       ├── credits/
│   │       │   ├── route.ts         # GET 积分余额
│   │       │   └── history/route.ts # GET 积分记录
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts    # POST 创建 Checkout
│   │       │   ├── portal/route.ts      # POST 客户门户
│   │       │   └── webhook/route.ts     # POST Webhook
│   │       ├── upload/
│   │       │   └── route.ts         # POST 上传图片到 R2
│   │       └── sitemap/
│   │           └── route.ts         # GET 动态 Sitemap
│   │
│   ├── components/                  # React 组件
│   │   ├── ui/                      # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── header.tsx           # 全局导航
│   │   │   ├── sidebar.tsx          # 侧边栏 (货架型)
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── generate/
│   │   │   ├── generate-form.tsx    # 生成表单 (核心组件)
│   │   │   ├── prompt-input.tsx     # 提示词输入框
│   │   │   ├── model-selector.tsx   # 模型选择器
│   │   │   ├── param-panel.tsx      # 参数面板 (时长/分辨率/画幅)
│   │   │   ├── image-upload.tsx     # 图片上传
│   │   │   ├── generate-button.tsx  # 生成按钮
│   │   │   ├── generation-progress.tsx
│   │   │   ├── result-display.tsx   # 结果展示 (图片/视频)
│   │   │   └── floating-input.tsx   # 悬浮输入框
│   │   ├── pricing/
│   │   │   ├── plan-card.tsx
│   │   │   ├── pricing-toggle.tsx   # 月付/年付切换
│   │   │   └── credit-slider.tsx    # 积分滑动条
│   │   ├── seo/
│   │   │   ├── model-landing.tsx    # 模型着陆页模板
│   │   │   ├── tool-landing.tsx     # 工具着陆页模板
│   │   │   ├── effect-landing.tsx   # 特效着陆页模板
│   │   │   ├── faq-section.tsx      # FAQ (带 Schema)
│   │   │   ├── comparison-table.tsx # 模型对比表
│   │   │   └── example-gallery.tsx  # 示例作品画廊
│   │   └── shared/
│   │       ├── credits-badge.tsx    # 积分余额徽章
│   │       ├── user-menu.tsx
│   │       └── loading-states.tsx
│   │
│   ├── lib/                         # 工具库
│   │   ├── supabase/
│   │   │   ├── client.ts            # 浏览器端 Supabase
│   │   │   └── server.ts            # 服务端 Supabase
│   │   ├── ai/                      # AI 模型封装
│   │   │   ├── types.ts             # 统一类型定义
│   │   │   ├── registry.ts          # 模型注册表
│   │   │   ├── providers/
│   │   │   │   ├── replicate.ts
│   │   │   │   ├── fal.ts
│   │   │   │   ├── kling.ts
│   │   │   │   ├── runway.ts
│   │   │   │   └── luma.ts
│   │   │   └── queue.ts             # 任务队列封装
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   ├── plans.ts             # 套餐定义
│   │   │   └── webhooks.ts          # Webhook 处理
│   │   ├── credits.ts               # 积分系统逻辑
│   │   ├── storage.ts               # R2 文件存储
│   │   └── utils.ts                 # 通用工具函数
│   │
│   ├── db/                          # 数据库
│   │   ├── schema.prisma            # Prisma Schema
│   │   └── seed.ts                  # 种子数据
│   │
│   ├── hooks/                       # React Hooks
│   │   ├── use-auth.ts
│   │   ├── use-credits.ts
│   │   ├── use-generation.ts
│   │   └── use-upload.ts
│   │
│   ├── types/                       # 全局类型
│   │   ├── generation.ts
│   │   ├── models.ts
│   │   └── plans.ts
│   │
│   └── config/                      # 配置
│       ├── models.ts                # 模型配置 (名称/参数/积分消耗)
│       ├── plans.ts                 # 套餐配置
│       └── site.ts                  # 站点配置 (名称/URL/SEO)
│
├── .env.local                       # 环境变量
├── .env.example                     # 环境变量示例
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   └── migrations/
└── README.md
```

---

## 4. 数据库 Schema 设计

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 用户与认证
// ============================================

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  avatarUrl       String?
  credits         Int       @default(20)    // 当前积分余额
  plan            Plan      @default(FREE)
  stripeCustomerId String?  @unique

  // 关联
  generations     Generation[]
  subscriptions   Subscription[]
  creditLogs      CreditLog[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("users")
}

// ============================================
// 模型配置（MVP 可先保留在 src/config/models.ts，增长期迁入 DB）
// ============================================

model Model {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  provider        String
  providerModelId String   @map("provider_model_id")
  category        String   // "video" | "image"
  supportedTypes  Json     @map("supported_types")
  supportedParams Json     @map("supported_params")
  creditsCost     Json     @map("credits_cost")
  costUsdEstimate Decimal? @map("cost_usd_estimate") @db.Decimal(10, 4)
  timeoutSeconds  Int      @default(180) @map("timeout_seconds")
  fallbackProvider String? @map("fallback_provider")
  isActive        Boolean  @default(true) @map("is_active")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("models")
}

enum Plan {
  FREE
  STARTER
  PRO
}

// ============================================
// 订阅
// ============================================

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @map("user_id")
  user              User     @relation(fields: [userId], references: [id])
  stripeSubId       String   @unique @map("stripe_sub_id")
  stripePriceId     String   @map("stripe_price_id")
  plan              Plan
  status            SubStatus @default(ACTIVE)
  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd  DateTime @map("current_period_end")
  cancelAtPeriodEnd Boolean  @default(false) @map("cancel_at_period_end")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("subscriptions")
}

enum SubStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  ENDED
}

// ============================================
// 积分记录
// ============================================

model CreditLog {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  user        User        @relation(fields: [userId], references: [id])
  amount      Int                           // 正数=充值, 负数=消耗
  type        CreditType
  description String?
  refId       String?     @map("ref_id")    // 关联的 generationId 或 stripeSubId
  balanceAfter Int?       @map("balance_after")

  createdAt   DateTime    @default(now())

  @@unique([type, refId])
  @@index([userId, createdAt])
  @@map("credit_logs")
}

enum CreditType {
  SIGNUP_BONUS       // 注册赠送
  SUBSCRIPTION        // 订阅充值
  ADDON_PURCHASE      // 加购
  GENERATION_CONSUME  // 生成消耗
  REFUND              // 退款
  ADMIN_ADJUST        // 管理员调整
}

// ============================================
// 生成任务
// ============================================

model Generation {
  id              String          @id @default(cuid())
  userId          String          @map("user_id")
  user            User            @relation(fields: [userId], references: [id])

  // 生成类型
  type            GenerationType
  model           String                          // 模型标识 (e.g. "kling-ai", "flux-schnell")
  provider        String                          // API 提供商 (e.g. "replicate", "fal")

  // 输入
  prompt          String?
  negativePrompt  String?         @map("negative_prompt")
  imageUrl        String?         @map("image_url")        // 参考图 URL
  videoUrl        String?         @map("video_url")        // 输入视频 URL (video-to-video)
  params          Json?                                    // 额外参数 (resolution, duration, etc.)

  // 输出
  status          GenStatus       @default(PENDING)
  outputUrl       String?         @map("output_url")       // 结果文件 URL (R2)
  outputType      String?         @map("output_type")      // "image" | "video"
  thumbnailUrl    String?         @map("thumbnail_url")

  // 费用
  creditsCost     Int             @map("credits_cost")
  costUsd         Decimal?        @map("cost_usd") @db.Decimal(10, 4)

  // 外部追踪
  providerId      String?         @map("provider_id")      // Replicate prediction ID 等
  errorCode       String?         @map("error_code")
  errorMessage    String?         @map("error_message")
  retryCount      Int             @default(0) @map("retry_count")

  // 可见性
  isPublic        Boolean         @default(false) @map("is_public")
  isCopyProtected Boolean         @default(false) @map("is_copy_protected")

  createdAt       DateTime        @default(now())
  completedAt     DateTime?       @map("completed_at")
  expiresAt       DateTime?       @map("expires_at")

  @@index([userId, createdAt])
  @@index([status])
  @@index([model])
  @@index([provider, providerId])
  @@map("generations")
}

// ============================================
// 媒体资产
// ============================================

model Asset {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  generationId   String?  @map("generation_id")
  kind           String   // "input" | "output" | "thumbnail"
  mediaType      String   @map("media_type") // "image" | "video"
  storageKey     String   @unique @map("storage_key")
  mimeType       String?  @map("mime_type")
  sizeBytes      Int?     @map("size_bytes")
  width          Int?
  height         Int?
  durationSec    Int?     @map("duration_sec")
  expiresAt      DateTime? @map("expires_at")

  createdAt      DateTime @default(now())

  @@index([userId, createdAt])
  @@index([generationId])
  @@map("assets")
}

// ============================================
// SEO / 模板页
// ============================================

model Template {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  prompt      String
  model       String?
  category    String
  params      Json?
  metaTitle   String?  @map("meta_title")
  metaDesc    String?  @map("meta_desc")
  isPublished Boolean  @default(false) @map("is_published")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category, isPublished])
  @@map("templates")
}

// ============================================
// Webhook 幂等日志
// ============================================

model WebhookLog {
  id          String   @id @default(cuid())
  provider    String
  eventId     String   @map("event_id")
  eventType   String?  @map("event_type")
  payload     Json?
  status      String   @default("RECEIVED") // RECEIVED | PROCESSED | FAILED
  error       String?

  createdAt   DateTime @default(now())
  processedAt DateTime? @map("processed_at")

  @@unique([provider, eventId])
  @@index([provider, createdAt])
  @@map("webhook_logs")
}

enum GenerationType {
  TEXT_TO_VIDEO
  IMAGE_TO_VIDEO
  VIDEO_TO_VIDEO
  TEXT_TO_IMAGE
  IMAGE_TO_IMAGE
  AVATAR_VIDEO
}

enum GenStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELLED
}
```

### 关键索引与约束说明

| 表 | 索引 | 用途 |
|----|------|------|
| generations | `(userId, createdAt)` | 用户历史查询 |
| generations | `(status)` | Worker 查询待处理任务 |
| generations | `(model)` | 按模型筛选 |
| generations | `(provider, providerId)` | Webhook 回调定位任务 |
| credit_logs | `(userId, createdAt)` | 用户积分流水 |
| credit_logs | `(type, refId)` unique | 防止同一生成/订阅重复入账或重复退款 |
| webhooks_log | `(provider, eventId)` unique | 防止 Stripe/AI Provider Webhook 重放 |
| assets | `(userId, createdAt)` | 用户素材库查询 |
| templates | `(category, isPublished)` | SEO 模板页批量生成 |

---

## 5. API 接口设计

### 5.1 认证相关

```
GET  /api/auth/callback          # OAuth 回调 (Supabase 处理)
POST /api/auth/logout            # 登出
GET  /api/auth/me                # 获取当前用户信息
```

### 5.2 生成相关

```
POST /api/generate
  Request:
    {
      "type": "TEXT_TO_VIDEO" | "TEXT_TO_IMAGE" | "IMAGE_TO_VIDEO" | ...,
      "model": "kling-ai",          // 模型标识
      "prompt": "A cat walking...",
      "negativePrompt": "...",      // 可选
      "imageUrl": "https://...",    // 可选, IMAGE_TO_VIDEO 时必填
      "params": {
        "duration": "5",            // 5s | 10s
        "resolution": "720p",
        "aspectRatio": "16:9",
        "seed": 12345               // 可选
      }
    }
  Response:
    {
      "id": "gen_xxx",
      "status": "PENDING",
      "creditsCost": 10,
      "creditsRemaining": 290
    }
  Errors:
    401 - 未登录
    402 - 积分不足
    429 - 超出并发限制
    400 - 参数错误

GET /api/generate/[id]
  Response:
    {
      "id": "gen_xxx",
      "status": "SUCCEEDED",
      "outputUrl": "https://r2.xxx/video.mp4",
      "outputType": "video",
      "thumbnailUrl": "https://r2.xxx/thumb.jpg",
      "completedAt": "2026-04-26T10:00:00Z"
    }

GET /api/generate/history?page=1&limit=20&type=TEXT_TO_VIDEO&model=kling-ai
  Response:
    {
      "items": [Generation...],
      "total": 42,
      "page": 1,
      "limit": 20
    }
```

### 5.3 积分相关

```
GET /api/user/profile
  Response:
    {
      "credits": 290,
      "plan": "STARTER",
      "imagesUsed": 45,
      "imagesLimit": 300,
      "videosUsed": 12,
      "videosLimit": 30,
      "parallelTasks": 1,
      "parallelLimit": 2
    }

GET /api/user/credits?page=1&limit=20
  Response:
    {
      "items": [CreditLog...],
      "total": 15
    }

Security:
  - 必须从 Supabase session 读取 userId
  - 禁止接受 query/body 里的 userId 作为查询条件
```

### 5.4 支付相关

```
POST /api/stripe/checkout
  Request: { "priceId": "price_xxx", "annual": true }
  Response: { "url": "https://checkout.stripe.com/..." }

POST /api/stripe/portal
  Response: { "url": "https://billing.stripe.com/..." }

POST /api/webhooks/stripe
  # Stripe Webhook (内部)
  Events: checkout.session.completed, customer.subscription.updated,
          customer.subscription.deleted, invoice.payment_succeeded
  Idempotency: webhooks_log(provider="stripe", event_id=event.id)
```

### 5.5 Webhook (AI 模型回调)

```
POST /api/webhooks/replicate
  Body: Replicate Prediction Object
  Action: 验签 → 幂等记录 → 根据 providerId 更新 Generation → 下载结果上传 R2 → 失败退款

POST /api/webhooks/fal
  Body: fal.ai Queue Status Object
  Action: 同上
```

### 5.6 文件上传

```
POST /api/upload
  Request: FormData { file: File }
  Response: { "url": "https://r2.xxx/uploads/xxx.jpg", "key": "uploads/xxx.jpg" }
  Max size: 10MB (图片), 100MB (视频)
```

### 5.7 SEO

```
GET /api/sitemap
  # 动态生成 sitemap.xml
  # 包含所有模型页、工具页、特效页、文章页
```

### 5.8 API 安全与幂等规则

| 场景 | 必须规则 | 原因 |
|------|----------|------|
| 用户资料 / 积分 / 历史 | 从服务端 session 取 userId | 防止用户通过 query 参数读取他人数据 |
| 创建生成任务 | 原子扣减 credits + 创建 Generation | 防止重复点击和并发透支 |
| AI Webhook | `provider + event_id` 或 `provider + providerId + status` 幂等 | 防止上游重试导致重复上传/重复退款 |
| Stripe Webhook | `event.id` 唯一处理 | 防止重复发放订阅积分 |
| 文件下载 | 使用 R2 签名 URL，默认 24h 过期 | 不暴露永久公开地址 |
| 管理 API | MVP 不开放；需要后台时单独加 admin role | 降低首版权限复杂度 |

---

## 6. 前端页面设计

### 6.1 路由与渲染策略

| 路由 | 渲染方式 | 认证 | 说明 |
|------|---------|------|------|
| `/` | SSR | 否 | 首页，直接展示生成输入框 |
| `/login` | SSR | 否 | 登录页 |
| `/signup` | SSR | 否 | 注册页 |
| `/pricing` | SSG | 否 | 定价页，静态生成 |
| `/models` | SSG | 否 | 模型广场聚合页 |
| `/models/[slug]` | SSG | 否 | 单模型页 (ISR 24h) |
| `/tools` | SSG | 否 | 工具目录 |
| `/tools/[slug]` | SSG | 否 | 单工具页 (ISR 24h) |
| `/effects` | SSG | 否 | 特效目录 |
| `/effects/[slug]` | SSG | 否 | 单特效页 (ISR 24h) |
| `/hub/[slug]` | SSG | 否 | 博客/对比文章 |
| `/explore` | SSR | 否 | 社区展示 (分页) |
| `/generate` | CSR | 是 | 生成工作台 |
| `/generate/text-to-video` | CSR | 是 | 文生视频 |
| `/generate/image-to-video` | CSR | 是 | 图生视频 |
| `/generate/text-to-image` | CSR | 是 | 文生图 |
| `/history` | CSR | 是 | 生成历史 |
| `/billing` | CSR | 是 | 积分 & 订阅管理 |

### 6.2 核心页面设计

#### 首页 `/`

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]   Video AI  Image AI  Tools  Models  Pricing   │
│                                              [Sign In]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Create the World You Imagine               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Tab: AI Video]  [Tab: AI Image]               │    │
│  │─────────────────────────────────────────────────│    │
│  │  What do you want to create today?              │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │ Enter your prompt...               [📎]  │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  │  Model: [Kling AI ▾]  Duration: [5s]  [16:9]   │    │
│  │                              [✨ Generate]      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ─── Featured Models ───                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Kling│ │Seed.│ │Veo 3│ │Hailuo│ │Sora │              │
│  │  AI │ │2.0  │ │     │ │ AI  │ │  2  │              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                         │
│  ─── Trending Effects ───                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │Ghibl│ │AI   │ │AI   │ │AI   │                      │
│  │  i  │ │Hug  │ │Dance│ │Upscl│                      │
│  └─────┘ └─────┘ └─────┘ └─────┘                      │
│                                                         │
│  ─── Example Gallery ───                                │
│  [视频/图片瀑布流展示]                                    │
│                                                         │
│  ─── FAQ ───                                            │
│  Q: What makes this platform different?                 │
│  A: ...                                                 │
│                                                         │
│  ─── Footer ───                                         │
│  Video Models | Image Models | Tools | Effects | Blog   │
│  © 2026 YourBrand. All rights reserved.                 │
└─────────────────────────────────────────────────────────┘
```

#### 模型着陆页 `/models/[slug]` (SSG 程序化生成)

```
┌───────────────────────────────────────────────────┐
│  ← Back to Models                                 │
│                                                    │
│  # Kling AI Video Generator                       │
│                                                    │
│  [模型描述 - 从 JSON content/models/kling-ai.json]  │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Quick Generate                              │ │
│  │  [Prompt Input]              [Generate →]    │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ─── Key Features ───                              │
│  ✅ Text to Video  ✅ Image to Video               │
│  ✅ Up to 10s     ✅ 1080p Resolution              │
│                                                    │
│  ─── Example Outputs ───                           │
│  [视频/图片网格展示]                                 │
│                                                    │
│  ─── How It Compares ───                           │
│  | Feature    | Kling AI | Runway | Sora |        │
│  | Max Length | 10s      | 16s    | 60s  |        │
│  | Resolution | 1080p    | 4K     | 1080p|        │
│                                                    │
│  ─── FAQ (Schema.org) ───                          │
│  Q: Is Kling AI free to use?                       │
│  A: Yes, you can try Kling AI with free credits... │
│                                                    │
│  [CTA: Start Creating with Kling AI →]             │
└───────────────────────────────────────────────────┘
```

#### 生成工作台 `/generate`

```
┌────────┬───────────────────────────────────────────────┐
│        │  AI Video  AI Image                           │
│ ─────  │───────────────────────────────────────────────│
│ Text   │                                               │
│ to     │  ┌─────────────────────────────────────────┐ │
│ Video  │  │ Share your vision or drop any assets... │ │
│        │  │                                         │ │
│ Image  │  │                                         │ │
│ to     │  │                    [📎 Upload] [Generate]│ │
│ Video  │  └─────────────────────────────────────────┘ │
│        │                                               │
│ Video  │  ┌─── Settings ────────────────────────────┐ │
│ to     │  │ Model: [Kling AI ▾]                      │ │
│ Video  │  │ Duration: [5s] [10s]                     │ │
│        │  │ Resolution: [480p] [720p] [1080p]        │ │
│ Text   │  │ Aspect Ratio: [16:9] [9:16] [1:1] [4:3] │ │
│ to     │  │ Output: [1] [2] [3] [4]                  │ │
│ Image  │  │ Seed: [random]                            │ │
│        │  │ ☐ Generate Audio                          │ │
│ Image  │  └──────────────────────────────────────────┘ │
│ to     │                                               │
│ Image  │  ─── Results ───                              │
│        │  ┌──────┐ ┌──────┐ ┌──────┐                  │
│ Avatar │  │ 🎬   │ │ ⏳   │ │ ✅   │                  │
│        │  │Pending│ │ Proc.│ │Done! │                  │
│ Tools  │  └──────┘ └──────┘ └──────┘                  │
│        │                                               │
│ Effects│                                               │
│        │                                               │
│ Models │                                               │
└────────┴───────────────────────────────────────────────┘
```

### 6.3 核心交互设计

**生成流程：**
1. 用户输入 prompt + 选择模型 + 设置参数
2. 点击 Generate → 调用 `POST /api/generate`
3. 扣减积分 → 创建 Generation 记录 → 推入队列
4. 前端显示进度条 (轮询 `GET /api/generate/[id]`)
5. 完成后展示结果 → 下载/分享/重新生成

**悬浮输入框：**
- 页面滚动超过首屏时，底部弹出悬浮输入框
- 核心指标：提高生成转化率

**积分不足拦截：**
- 积分不足时弹出升级弹窗
- 默认高亮 Pro 套餐
- 年付默认选中，显示"Save 50%"

---

## 7. AI 模型集成层设计

### 7.1 统一接口抽象

```typescript
// src/lib/ai/types.ts

interface AIProvider {
  id: string;                          // "replicate" | "fal" | "kling" | ...
  name: string;
  supportedTypes: GenerationType[];

  // 创建生成任务
  createGeneration(params: CreateGenParams): Promise<GenResult>;

  // 查询任务状态 (轮询备用)
  getGenerationStatus(providerId: string): Promise<GenStatusResult>;

  // Webhook 签名验证
  verifyWebhook(body: string, signature: string): boolean;

  // 处理 Webhook 回调
  handleWebhook(payload: unknown): Promise<WebhookResult>;
}

interface CreateGenParams {
  type: GenerationType;
  model: string;
  prompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  params: {
    duration?: string;
    resolution?: string;
    aspectRatio?: string;
    seed?: number;
    outputCount?: number;
  };
  webhookUrl?: string;                 // 回调 URL
}

interface GenResult {
  providerId: string;                  // 外部任务 ID
  status: 'PENDING' | 'PROCESSING';
  estimatedTime?: number;              // 预估耗时 (秒)
}

interface GenStatusResult {
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  outputUrl?: string;
  error?: string;
}

interface WebhookResult {
  providerId: string;
  status: 'SUCCEEDED' | 'FAILED';
  outputUrl?: string;
  error?: string;
}
```

### 7.2 模型注册表

```typescript
// src/lib/ai/registry.ts

interface ModelConfig {
  id: string;                    // "kling-ai"
  name: string;                  // "Kling AI"
  provider: string;              // "replicate"
  providerModelId: string;       // "kuaishou/kling-v1.5"
  type: GenerationType[];
  supportedParams: {
    duration: string[];          // ["5", "10"]
    resolution: string[];        // ["480p", "720p", "1080p"]
    aspectRatio: string[];       // ["16:9", "9:16", "1:1"]
    maxOutputCount: number;      // 4
  };
  creditsCost: {
    TEXT_TO_VIDEO: number;       // 10
    IMAGE_TO_VIDEO: number;      // 10
    TEXT_TO_IMAGE: number;       // 1
  };
  avgGenerationTime: number;     // 60s
  isHot: boolean;                // 是否热门标签
  isNew: boolean;                // 是否新标签
  slug: string;                  // "kling-ai" (URL)
}

// 所有模型配置集中管理
export const models: Record<string, ModelConfig> = {
  "kling-ai": { ... },
  "flux-schnell": { ... },
  "seedance-2": { ... },
  // ...
};
```

### 7.3 Provider 实现示例

#### Replicate Provider

```typescript
// src/lib/ai/providers/replicate.ts

import Replicate from "replicate";
import { AIProvider, CreateGenParams, GenResult } from "../types";

export class ReplicateProvider implements AIProvider {
  id = "replicate";
  name = "Replicate";
  private client: Replicate;

  constructor() {
    this.client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }

  supportedTypes = [
    "TEXT_TO_VIDEO", "IMAGE_TO_VIDEO", "TEXT_TO_IMAGE", "IMAGE_TO_IMAGE"
  ];

  async createGeneration(params: CreateGenParams): Promise<GenResult> {
    const modelConfig = getModelConfig(params.model);
    const input = this.buildInput(params);

    const prediction = await this.client.predictions.create({
      version: modelConfig.providerModelId,
      input,
      webhook: params.webhookUrl,
      webhook_events_filter: ["completed"],
    });

    return {
      providerId: prediction.id,
      status: prediction.status === "starting" ? "PENDING" : "PROCESSING",
    };
  }

  async getGenerationStatus(predictionId: string) {
    const prediction = await this.client.predictions.get(predictionId);
    return {
      status: this.mapStatus(prediction.status),
      outputUrl: Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output,
    };
  }

  verifyWebhook(body: string, signature: string): boolean {
    // Replicate webhook signature verification
    // 使用 Webhook-Signature header 验证
    return true; // 简化
  }

  async handleWebhook(payload: any) {
    return {
      providerId: payload.id,
      status: payload.status === "succeeded" ? "SUCCEEDED" : "FAILED",
      outputUrl: Array.isArray(payload.output)
        ? payload.output[0]
        : payload.output,
    };
  }

  private buildInput(params: CreateGenParams) {
    const input: Record<string, any> = {};
    if (params.prompt) input.prompt = params.prompt;
    if (params.negativePrompt) input.negative_prompt = params.negativePrompt;
    if (params.imageUrl) input.image = params.imageUrl;
    if (params.params.duration) input.duration = params.params.duration;
    if (params.params.aspectRatio) input.aspect_ratio = params.params.aspectRatio;
    return input;
  }

  private mapStatus(status: string) {
    const map: Record<string, string> = {
      starting: "PENDING", processing: "PROCESSING",
      succeeded: "SUCCEEDED", failed: "FAILED", canceled: "CANCELLED",
    };
    return map[status] || "PENDING";
  }
}
```

#### fal.ai Provider

```typescript
// src/lib/ai/providers/fal.ts

// fal.ai 使用类似的模式，但 API 格式不同
// 支持 queue submit + webhook callback
// 关键区别: fal 用 queue.submit() 而非 predictions.create()
```

### 7.4 生成管线设计

```typescript
// src/lib/ai/queue.ts

// MVP 推荐：Webhook 主推 + 前端轮询 + Vercel Cron 兜底
//
// 1. POST /api/generate：
//    - 验证 session
//    - 原子扣减 credits
//    - 创建 Generation
//    - 调用 provider.createGeneration(webhookUrl)
//    - 返回 generationId
// 2. 前端每 2s 轮询 GET /api/generate/[id]
// 3. 上游完成后打 /api/webhooks/[provider]
// 4. Webhook 验签 + 幂等后下载结果并上传 R2
// 5. Cron 每 1 分钟扫描超时/卡住任务，主动查询上游状态
//
// 暂不引入 BullMQ/Redis：当前 Vercel Serverless 环境不适合长驻 Worker，
// 且 MVP 并发目标 < 20 时，Webhook + Polling 足够。

export async function processPendingGenerations() {
  // Vercel Cron 调用
  const processing = await prisma.generation.findMany({
    where: { status: "PROCESSING" },
    take: 10,
  });

  for (const gen of processing) {
    const provider = getProvider(gen.provider);
    const result = await provider.getGenerationStatus(gen.providerId!);

    if (result.status === "SUCCEEDED" && result.outputUrl) {
      // 下载 → 上传 R2 → 更新 DB
      await handleGenerationSuccess(gen, result.outputUrl);
    } else if (result.status === "FAILED") {
      await handleGenerationFailure(gen, result.error);
    }
  }
}
```

### 7.4.1 同步 vs 异步决策

视频生成耗时通常 10-180 秒，必须异步。MVP 采用：

| 路径 | 使用阶段 | 方案 | 打架阈值 |
|------|----------|------|----------|
| A | MVP / <500 DAU | Webhook + 前端轮询 + Cron 兜底 | 高峰并发 >20 或 webhook 丢失率 >1% |
| B | 早期增长 / 500-5000 DAU | Trigger.dev / Inngest / QStash 编排任务 | 日生成 >5000 或需要复杂重试 |
| C | 规模化 / >5000 DAU | 独立 Worker + Redis/BullMQ 或队列服务 | 多区域、复杂优先级、批处理需求 |

当前项目应先实现路径 A。Upstash Redis/BullMQ 不进入 MVP 依赖，避免为 21 天上线制造额外运维面。

### 7.4.2 失败兜底与退款规则

| 失败类型 | 处理 | Credits |
|----------|------|---------|
| Provider 创建任务失败 | Generation 标记 FAILED，记录 errorCode/errorMessage | 自动退回 |
| Provider 5xx / 超时 | 重试 1 次；仍失败则 FAILED | 自动退回 |
| Webhook 丢失 | Cron 主动查询 providerId 状态 | 不立即退款 |
| 任务超过 timeoutSeconds | 主动查上游；确认失败或取消后 FAILED | 自动退回 |
| 内容审核失败 | 展示明确提示，让用户修改 prompt | 自动退回 |
| R2 上传失败 | 重试 2 次；失败则保留上游 outputUrl 并告警 | 暂不退款，人工补偿 |

所有退款都必须写入 `credit_logs`，并通过 `(type, refId)` 唯一约束防止重复退款。

### 7.4.3 并发控制

| Plan | 最大并行生成 | 说明 |
|------|--------------|------|
| Free | 1 | 防止免费用户刷爆 API 额度 |
| Starter | 2 | 满足轻量创作者 |
| Pro | 3 | 预留优先队列空间 |

创建任务前查询用户 `PROCESSING/PENDING` 数量，超过套餐上限返回 `429`。

### 7.5 MVP 首批集成的模型

| 模型 | Provider | 功能 | 积分消耗 | API 成本 |
|------|----------|------|---------|---------|
| FLUX Schnell | Replicate | 文生图 | 1 | ~$0.003 |
| FLUX Pro | fal.ai | 文生图(高质量) | 3 | ~$0.04 |
| Kling v1.5 | Replicate / Kling API | 文/图生视频 | 10 | ~$0.10 |
| Runway Gen-3 | Replicate / Runway API | 文/图生视频 | 10 | ~$0.05 |
| Luma Dream Machine | Replicate / Luma API | 文/图生视频 | 8 | ~$0.03 |
| Stable Diffusion 3 | Replicate | 文生图 | 1 | ~$0.01 |

> 当前代码中 Kling/Runway/Luma 暂由 `replicate` provider 承接配置；如果后续接官方 API，只新增 Provider 实现并调整模型配置，不改业务调用链。

---

## 8. 支付与积分系统设计

### 8.1 套餐定义

```typescript
// src/config/plans.ts

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    annualPriceId: null,
    credits: 20,
    imageLimit: 20,
    videoLimit: 2,
    parallelTasks: 1,
    features: [
      "All-in-one multi-model support",
      "Text/Image/Video to video",
      "Text/Image to image",
      "300+ templates & effects",
      "Watermarked outputs",
    ],
    lockedFeatures: [
      "No-watermark outputs",
      "Private video visibility",
      "Copy protection",
      "Faster generation speed",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 12,
    annualPrice: 8,         // 年付折算月价 (Save 33%)
    credits: 300,
    imageLimit: 300,
    videoLimit: 30,
    parallelTasks: 2,
    features: [
      "Everything in Free, plus:",
      "No-watermark outputs",
      "Private video visibility",
      "Copy protection",
      "Faster generation speed",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29,
    annualPrice: 14.5,      // 年付折算月价 (Save 50%)
    credits: 800,
    imageLimit: 800,
    videoLimit: 80,
    parallelTasks: 3,
    features: [
      "Everything in Starter, plus:",
      "Priority generation queue",
      "More camera movement options",
      "Advanced audio generation",
    ],
    // Pro 支持加购积分
    addonCredits: [2000, 3000, 5000, 10000, 20000, 50000],
  },
};
```

### 8.2 积分消耗规则

```typescript
// src/config/models.ts (部分)

// 不同操作的积分消耗
export const CREDITS_COST = {
  // 文生图
  TEXT_TO_IMAGE: {
    "flux-schnell": 1,
    "flux-pro": 3,
    "stable-diffusion-3": 1,
    "dall-e-3": 5,
    "ideogram": 2,
  },
  // 文生视频 (按时长)
  TEXT_TO_VIDEO: {
    "kling-ai":   { "5s": 10, "10s": 20 },
    "runway-gen3": { "5s": 10, "10s": 20 },
    "luma-ai":     { "5s": 8,  "10s": 16 },
    "seedance-2":  { "5s": 10, "10s": 20 },
    "pika":        { "5s": 8,  "10s": 16 },
    "veo-3":       { "5s": 12, "10s": 24 },
  },
  // 图生视频 (同文生视频)
  IMAGE_TO_VIDEO: "same_as_text_to_video",
  // 图生图
  IMAGE_TO_IMAGE: 1,
};
```

### 8.3 积分扣减逻辑 (事务)

```typescript
// src/lib/credits.ts

import { prisma } from "@/db";

export async function deductCredits(
  userId: string,
  amount: number,
  generationId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. 读取当前余额 (加行锁)
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < amount) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    // 2. 扣减积分
    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    });

    // 3. 记录日志
    await tx.creditLog.create({
      data: {
        userId,
        amount: -amount,
        type: "GENERATION_CONSUME",
        description: `Generation ${generationId}`,
        refId: generationId,
      },
    });

    return { creditsRemaining: user.credits - amount };
  });
}
```

### 8.4 Stripe Webhook 处理流程

```
Stripe Webhook (checkout.session.completed)
       │
       ▼
┌──────────────────────────────┐
│ 1. 验证 Webhook 签名         │
│ 2. 提取 session/subscription │
│ 3. 查找 User (by stripeId)  │
│ 4. 更新 Subscription 记录    │
│ 5. 充值积分到 User           │
│    - STARTER: +300 credits   │
│    - PRO: +800 credits       │
│ 6. 记录 CreditLog            │
│ 7. 返回 200 OK               │
└──────────────────────────────┘
```

---

## 9. SEO 技术方案

### 9.1 程序化页面生成

```typescript
// src/app/(marketing)/models/[slug]/page.tsx

import { models } from "@/config/models";
import { modelContent } from "@/content/models";
import { ModelLanding } from "@/components/seo/model-landing";

// 静态生成所有模型页面
export function generateStaticParams() {
  return Object.keys(models).map((slug) => ({ slug }));
}

// 动态元数据
export function generateMetadata({ params }: { params: { slug: string } }) {
  const model = models[params.slug];
  const content = modelContent[params.slug];

  return {
    title: `${model.name} - Free Online ${model.name} Video/Image Generator`,
    description: content.metaDescription,
    openGraph: {
      title: `${model.name} Video Generator - Try Free`,
      description: content.metaDescription,
      images: [content.ogImage],
    },
    alternates: {
      canonical: `/models/${params.slug}`,
    },
  };
}

export default function ModelPage({ params }: { params: { slug: string } }) {
  const model = models[params.slug];
  const content = modelContent[params.slug];
  return <ModelLanding model={model} content={content} />;
}
```

### 9.2 内容配置文件格式

```json
// content/models/kling-ai.json
{
  "slug": "kling-ai",
  "metaTitle": "Kling AI Video Generator - Free Online Text/Image to Video",
  "metaDescription": "Generate stunning AI videos with Kling AI. Free text-to-video and image-to-video generation. Try Kling AI 1.5 online without signup.",
  "ogImage": "/images/models/kling-ai-og.jpg",
  "headline": "Kling AI Video Generator",
  "subheadline": "Create cinematic AI videos from text or images with Kling AI by Kuaishou",
  "description": "...",
  "features": [
    { "icon": "🎬", "title": "Text to Video", "description": "..." },
    { "icon": "🖼️", "title": "Image to Video", "description": "..." },
    { "icon": "⏱️", "title": "Up to 10s", "description": "..." }
  ],
  "examples": [
    { "type": "video", "url": "/images/models/kling-ex1.mp4", "prompt": "..." },
    { "type": "video", "url": "/images/models/kling-ex2.mp4", "prompt": "..." }
  ],
  "faq": [
    {
      "question": "Is Kling AI free to use?",
      "answer": "Yes! You can try Kling AI video generation with 20 free credits when you sign up..."
    }
  ],
  "comparisonModels": ["runway", "sora-2", "seedance-2"],
  "relatedTools": ["text-to-video", "image-to-video"]
}
```

### 9.3 结构化数据 (Schema.org)

```typescript
// 每个模型页面注入 JSON-LD
const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": `${model.name} Video Generator`,
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free tier with 20 credits"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "1000"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": content.faq.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};
```

### 9.4 Sitemap 生成

```typescript
// src/app/api/sitemap/route.ts

export async function GET() {
  const modelPages = Object.keys(models).map((slug) => `
    <url>
      <loc>${BASE_URL}/models/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `);

  const toolPages = tools.map((slug) => `
    <url>
      <loc>${BASE_URL}/tools/${slug}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `);

  // ... effects, hub, etc.

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${BASE_URL}</loc><priority>1.0</priority></url>
      <url><loc>${BASE_URL}/pricing</loc><priority>0.9</priority></url>
      ${modelPages.join("")}
      ${toolPages.join("")}
      ${effectPages.join("")}
      ${hubPages.join("")}
    </urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

---

## 10. 部署与基础设施

### 10.1 环境变量

```bash
# .env.example

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=YourAppName

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AI Providers
REPLICATE_API_TOKEN=r8_...
FAL_API_KEY=fal_...
KLING_API_KEY=...
RUNWAY_API_KEY=...
LUMA_API_KEY=...

# Storage
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
R2_PUBLIC_URL=https://cdn.yourdomain.com

# Optional queue orchestration (post-MVP)
QSTASH_TOKEN=...
TRIGGER_SECRET_KEY=...
```

### 10.2 部署架构

```
GitHub Push
    │
    ▼
┌─────────┐     ┌──────────────┐
│ Vercel  │────▶│ Auto Deploy  │
│ Project │     │ Preview +    │
│         │     │ Production   │
└─────────┘     └──────────────┘
    │
    ├── Frontend (SSR/SSG/CSR)
    ├── Route Handlers (Serverless Functions)
    └── Cron Jobs (/api/cron/*)

外部服务:
    ├── Supabase (DB + Auth)
    ├── Cloudflare R2 (Storage)
    └── Stripe (Payments)
```

### 10.3 Vercel Cron 配置

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-generations",
      "schedule": "*/1 * * * *"
    },
    {
      "path": "/api/cron/cleanup-expired",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 10.4 月度成本估算

| 服务 | MVP <50 DAU | 早期 500 DAU | 成长 5000 DAU | 规模 10000+ DAU |
|------|-------------|--------------|----------------|------------------|
| Vercel | $0 | $0-20 | $20-150 | $150+ |
| Supabase | $0 | $0-25 | $25-100 | $100+ |
| Cloudflare R2 | $0 | ~$1 | ~$8 | $75+ |
| Stripe | 按交易抽成 | 按交易抽成 | 按交易抽成 | 可谈费率 |
| 任务编排 | $0（Cron） | $0（Cron） | $20-50（Trigger/QStash） | $100+ |
| Sentry/PostHog | $0 | $0-29 | $29-100 | $100+ |
| 域名 | ~$1 | ~$1 | ~$1 | ~$1 |
| AI API 调用 | $20-80 | $100-500 | $1K-5K | $10K+ |
| **总计** | **$21-81** | **$102-575** | **$1.1K-5.4K** | **$10K+** |

### 10.5 容量规划与升级阈值

| 阶段 | DAU | 日生成数 | 高峰并发 | 月数据增量 | 最先打架组件 | 升级信号 |
|------|-----|----------|----------|------------|--------------|----------|
| MVP | <50 | <100 | <5 | <5GB | 上游 AI API 配额 | Webhook/R2/支付跑通前不要扩功能 |
| 早期 | 50-500 | 200-2000 | 5-20 | 50GB | Vercel 函数超时、Provider 限流 | webhook 丢失率 >1%，任务卡住 >1% |
| 成长 | 500-5000 | 2K-20K | 20-100 | 500GB | 任务编排、DB 连接池、轮询流量 | 引入 Trigger.dev/QStash、DB pooling、状态推送 |
| 规模 | >5000 | >20K | >100 | >5TB | 多 provider 调度、风控、成本 | 独立 Worker、队列优先级、成本看板、自动降级 |

### 10.6 存储生命周期

| 用户类型 | 输出保存 | 下载方式 | 删除策略 |
|----------|----------|----------|----------|
| Free | 7 天 | 24h R2 signed URL | R2 lifecycle 自动删除 |
| Starter | 30 天 | 24h R2 signed URL | 到期软删除 + lifecycle |
| Pro | 长期保存 | 24h R2 signed URL | 用户主动删除 / 合规删除 |

禁止默认公开 R2 bucket。公开展示页使用经过审核的 public asset 或单独 CDN 路径。

---

## 11. 剩余 21 天开发路线图

> 当前项目已经完成初始化，不再把 `create-next-app` 作为任务。以下计划以“能上线收款 + 能稳定生成 + 能开始 SEO 收录”为目标。

### Phase 1: 生成闭环与数据安全 (3-5 天)

- [ ] 补齐 `Generation` 的 `costUsd/errorCode/errorMessage/retryCount/expiresAt`
- [ ] 增加 `Asset` 与 `WebhookLog` 表，完成 Prisma migration
- [ ] 实现 R2 上传、签名下载、生命周期策略
- [ ] 完成 Replicate/fal Webhook 验签、幂等、下载结果、上传 R2、更新 DB
- [ ] 实现 Cron 兜底查询 PROCESSING 任务
- [ ] 修复用户数据 API：所有 profile/credits/history 从 session 取 userId

### Phase 2: Credits 与支付幂等 (3-4 天)

- [ ] 将 credits 扣减改为原子操作，避免并发透支
- [ ] `CreditLog` 增加 `balanceAfter` 与唯一约束
- [ ] Stripe Webhook 写入 `WebhookLog`，防止重复发放订阅积分
- [ ] 明确订阅取消后的 credits 策略：本期已到账 credits 保留，到期后 plan 降级
- [ ] 生成失败自动退款，并保证同一 generation 只退款一次

### Phase 3: 生成工作台 MVP (4-5 天)

- [ ] Generate Form 参数校验与模型能力约束
- [ ] 生成状态卡片：pending / processing / succeeded / failed
- [ ] 前端轮询 `GET /api/generate/[id]`
- [ ] 并发限制：Free 1 / Starter 2 / Pro 3
- [ ] 历史记录与素材下载
- [ ] 积分不足弹窗与 Checkout 入口

### Phase 4: SEO 与内容页 (4-5 天)

- [ ] 基于 `src/config/models.ts` 生成模型聚合页和模型详情页
- [ ] 工具页 / 特效页使用配置驱动，避免手写重复页面
- [ ] `sitemap.ts` / `robots.ts` / canonical / JSON-LD
- [ ] 首批页面：7 个模型页 + 6 个工具页 + 5 个特效页
- [ ] `llms.txt` / `ai.txt`，服务 GEO 与 AI 搜索抓取

### Phase 5: 上线验收 (3-4 天)

- [ ] Google OAuth 生产域名回调配置
- [ ] Stripe 生产 Webhook 与价格 ID 验证
- [ ] Sentry / PostHog / Google Analytics
- [ ] Rate limiting 与基础滥用防护
- [ ] 用户协议、隐私政策、退款说明、联系我们
- [ ] Vercel 生产环境变量审查
- [ ] 端到端验收：注册 → 送 credits → 生成 → R2 下载 → 支付 → credits 到账 → 失败退款

### 上线阻塞项

| 阻塞项 | 当前风险 | 必须完成标准 |
|--------|----------|--------------|
| AI Webhook | 当前 Replicate webhook 仍是 TODO | 验签、幂等、状态更新、R2 上传、失败退款全跑通 |
| Credits 并发 | 先查再扣可能并发透支 | 原子扣减 + 唯一退款 |
| 用户数据 API | query id 查询有越权风险 | 全部从 session 取 userId |
| R2 存储 | 文档有方案但代码未闭环 | 上传、签名 URL、生命周期均验证 |
| Stripe 幂等 | Webhook 重试可能重复发 credits | `WebhookLog` 防重 |

---

## 12. Tech-Arch-Planner 复核清单

1. **视频生成是同步还是异步？**  
   异步。MVP 使用 Webhook + 前端轮询 + Vercel Cron 兜底。

2. **第二个模型怎么接？需要改业务代码吗？**  
   不改业务代码。新增 Provider 实现或在 `src/config/models.ts` 增加模型配置即可。

3. **用户付钱后 Credits 怎么到账？Webhook 失败怎么办？**  
   Stripe Webhook 验签后写 `WebhookLog`，幂等发放 credits；失败由 Stripe 重试，后台可按 event_id 补偿。

4. **视频存哪？500 个用户每月存储费多少？**  
   存 Cloudflare R2。早期按 50GB/月估算约 $1 以内，主要成本不是存储而是 AI API。

5. **1000 个用户同时在线，哪个组件最先扛不住？**  
   高概率是上游 AI API 限流、Vercel 函数时长/并发、前端轮询流量。达到高峰并发 >20 后考虑任务编排服务。

6. **API key 放哪？前端能拿到吗？**  
   Provider API key 只放服务端环境变量，禁止 `NEXT_PUBLIC_`。前端只能拿 publishable key 和 Supabase anon key。

7. **用户取消订阅，本期 Credits 留还是清零？**  
   建议保留已到账 credits，到当前周期结束后 plan 降为 FREE；额外购买 credits 不清零。

8. **生成失败了，Credits 怎么退？**  
   Provider 创建失败、确认失败、内容审核失败、超时取消都自动退；退款写 `CreditLog(type=REFUND, refId=generationId)` 并加唯一约束。

9. **内容审核谁来做？**  
   MVP 先使用上游 provider 审核结果 + 本地 prompt 黑名单；增长期再接专门审核服务和用户违规记录。

10. **21 天后能上线吗？关键不确定项是什么？**  
   能上线 MVP，但关键路径是 AI Webhook/R2 闭环、Credits 幂等、Stripe 生产配置、Google OAuth 审核和法务三件套。

### 主要风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 上游模型 API 不稳定 | 生成失败、退款增加 | Provider Adapter + fallbackProvider + 失败告警 |
| 生成成本不可控 | 毛利被吃掉 | 每个模型记录 `costUsd`，按周复盘 credits 定价 |
| Webhook 重放/丢失 | 重复到账或任务卡住 | `WebhookLog` 幂等 + Cron 主动查询 |
| SEO 页面太薄 | 难以收录 | 模型/工具/特效页必须有示例、FAQ、对比、结构化数据 |
| 21 天范围失控 | 上线延期 | 亮点功能延期，优先生成/支付/SEO/法务闭环 |

---

## 附录 A: 环境要求

- Node.js 18+
- npm/pnpm
- Git
- VS Code (推荐)
- Supabase CLI (可选)
- Vercel CLI (可选)

## 附录 B: 参考文档

- Next.js App Router: https://nextjs.org/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs
- Replicate: https://replicate.com/docs
- fal.ai: https://fal.ai/docs
- shadcn/ui: https://ui.shadcn.com
