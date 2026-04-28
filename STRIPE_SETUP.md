# Stripe 配置指南

## 1. 创建 Stripe 账号

1. 访问 [https://stripe.com](https://stripe.com) 注册账号
2. 完成基本信息填写（可以用测试模式，不需要真实银行信息）

## 2. 获取 API Keys

在 Stripe Dashboard → **Developers** → **API keys**：

- `STRIPE_SECRET_KEY` → 复制 **Secret key**（`sk_test_...`）
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → 复制 **Publishable key**（`pk_test_...`）

## 3. 创建产品和价格

在 Stripe Dashboard → **Products** → **Add product**：

### Starter 计划
1. 产品名称: `Starter Plan`
2. 创建两个价格：
   - **Monthly**: $12/month (Recurring)
   - **Yearly**: $96/year (Recurring) → $8/month

### Pro 计划
1. 产品名称: `Pro Plan`
2. 创建两个价格：
   - **Monthly**: $29/month (Recurring)
   - **Yearly**: $174/year (Recurring) → $14.5/month

创建完成后，每个价格都有一个 `price_` 开头的 ID，复制它们。

## 4. 配置 Webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - 本地开发用 Stripe CLI（见下方）
3. 监听事件选择：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. 创建后复制 **Signing secret**（`whsec_...`）→ 填入 `STRIPE_WEBHOOK_SECRET`

## 5. 更新 .env.local

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# 从 Stripe Products 页面复制每个价格的 ID
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxx
```

## 6. 本地测试 Webhook

安装 Stripe CLI：
```bash
brew install stripe/stripe-cli/stripe
```

登录并转发 webhook：
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

这会输出一个 `whsec_` 开头的 webhook secret，更新到 `.env.local`。

## 7. 测试支付

在 Stripe 测试模式下，用测试卡号支付：
- **成功**: `4242 4242 4242 4242`
- **需要验证**: `4000 0025 0000 3155`
- **被拒绝**: `4000 0000 0000 9995`

过期日期和 CVC 填任意未来日期和 3 位数字即可。

## 支付流程

```
用户点击 "Get Started"
    ↓
POST /api/stripe/checkout → 创建 Stripe Checkout Session
    ↓
跳转到 Stripe 托管支付页面
    ↓
支付成功 → Stripe 发送 webhook
    ↓
POST /api/webhooks/stripe
    ↓
创建 Subscription 记录 + 更新用户计划 + 增加积分
    ↓
用户跳转到 /billing?success=true
```
