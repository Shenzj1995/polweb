# 关键词策略报告

> 基于竞品分析（Pollo.ai + Toolify Top 20）和行业搜索数据
> 生成日期：2026-04-26

---

## 一、竞品格局总览（Toolify 数据）

| 排名 | 工具 | 月访问量 | 月增长 | 趋势 |
|------|------|----------|--------|------|
| 1 | OpenAI (含Sora) | 225M | -15.5% | ↓ 下降 |
| 2 | CapCut | 65.1M | +19.1% | ↑ 上升 |
| 3 | Sora (独立站) | 33.9M | -16.7% | ↓ 新鲜感消退 |
| 4 | Candy AI | 20.4M | +32.5% | ↑ 快速增长 |
| 5 | VSCO | 18.1M | -2.3% | → 平稳 |
| 6 | **Kling AI** | 17.3M | **+47.4%** | ↑↑ **增长最快** |
| 7 | Canva | 15.7M | +6.1% | ↑ |
| 8 | **Hailuo AI (MiniMax)** | 13.5M | **+33.8%** | ↑↑ 快速增长 |
| 9 | Veed.io | 12.9M | +11.9% | ↑ |
| 10 | **Pollo.ai** | 12.0M | +0.6% | → 增长放缓 |
| 11 | **PixVerse** | 10.2M | **+25.6%** | ↑↑ 增长 |
| 12 | HeyGen | 8.7M | -6.5% | ↓ |
| 13 | Viggle AI | 7.0M | +14.1% | ↑ |
| 14 | Pika | 6.8M | +9.1% | ↑ |
| 15 | Runway | 5.9M | -3.8% | ↓ |
| 16 | Luma AI | 5.1M | -0.3% | → |

**关键发现：**
- Kling AI (+47.4%)、Hailuo AI (+33.8%)、PixVerse (+25.6%) 是当前增长最快的玩家
- Pollo 增长已放缓（+0.6%），说明聚合平台模型正在被验证但也竞争激烈
- 传统头部（Sora、Runway、HeyGen）流量在下降，说明市场在分散化

---

## 二、关键词分层策略

### 第一层：模型关键词（最高优先级 — 立即执行）

这是 Pollo 90% 流量来源的关键词类型。每个 AI 模型发布都会带来搜索热潮。

| 关键词 | 预估月搜索量 | KD 评估 | 竞争度 | 优先级 |
|--------|-------------|---------|--------|--------|
| kling ai | 500K-1M | 中 (40-55) | 中 | ★★★★★ |
| kling ai video generator | 50K-100K | 低-中 (25-40) | 低 | ★★★★★ |
| sora ai / openai sora | 500K-1M | 高 (60-75) | 高 | ★★★★ |
| sora video generator | 30K-50K | 中 (35-50) | 中 | ★★★★ |
| runway ai / runway ml | 200K-500K | 中 (45-60) | 中 | ★★★★ |
| runway gen-3 | 20K-50K | 低 (20-35) | 低 | ★★★★★ |
| veo 3 / google veo | 100K-300K | 中 (40-55) | 中 | ★★★★ |
| hailuo ai / hailuo ai video | 100K-300K | 低-中 (25-40) | 低 | ★★★★★ |
| pixverse / pixverse ai | 50K-100K | 低 (20-35) | 低 | ★★★★★ |
| seedance / seedance 2.0 | 50K-200K | **极低 (10-25)** | **极低** | ★★★★★ |
| pika ai / pika labs | 100K-200K | 中 (40-50) | 中 | ★★★★ |
| luma ai / luma dream machine | 50K-100K | 低-中 (25-40) | 低 | ★★★★★ |
| vidu ai | 20K-50K | **极低 (10-20)** | **极低** | ★★★★★ |
| wan ai / wan video | 10K-30K | **极低 (5-15)** | **极低** | ★★★★★ |
| hunyuan video | 10K-30K | **极低 (5-15)** | **极低** | ★★★★★ |
| flux ai / flux image generator | 50K-100K | 低 (25-35) | 低 | ★★★★★ |

**执行建议：** 每个模型做独立落地页 `/models/{model-slug}`，包含：
- 模型介绍 + 能力说明
- 在线生成入口（直接可用）
- 示例作品展示
- 与其他模型对比（自然引入对比关键词）

### 第二层：功能关键词（高优先级 — MVP 即做）

| 关键词 | 预估月搜索量 | KD 评估 | 优先级 |
|--------|-------------|---------|--------|
| AI video generator | 500K-1M | 高 (65-80) | ★★★★ |
| text to video AI | 200K-500K | 高 (60-70) | ★★★★ |
| image to video AI | 100K-200K | 中 (40-55) | ★★★★★ |
| video to video AI | 30K-50K | 低-中 (30-45) | ★★★★★ |
| AI image generator | 1M-2M | 极高 (75-90) | ★★★ |
| text to image AI | 500K-1M | 高 (65-75) | ★★★ |
| image to image AI | 50K-100K | 中 (40-50) | ★★★★ |
| AI avatar generator | 100K-200K | 中 (45-60) | ★★★★ |
| AI video editor | 100K-200K | 中 (45-55) | ★★★★ |
| AI animation generator | 50K-100K | 低-中 (30-45) | ★★★★★ |

**执行建议：** 每个功能做独立路由 `/tools/{function-slug}`
- 核心大词（AI video generator）直接放首页竞争
- 长尾变体通过工具子页面覆盖

### 第三层：细分场景关键词（中优先级 — MVP 后 1 个月内）

这些是从 Pollo 文档提到的"Apps"策略，每个都是一个独立页面。

| 关键词 | 预估月搜索量 | KD 评估 | 页面类型 |
|--------|-------------|---------|----------|
| AI video upscaler | 20K-50K | 低 (20-35) | 工具页 |
| AI video enhancer | 20K-50K | 低 (20-35) | 工具页 |
| video to anime | 10K-30K | 低 (15-30) | 工具页 |
| AI dance generator | 10K-30K | 低 (15-25) | 特效页 |
| AI hug generator | 50K-100K | 低 (15-30) | 特效页 |
| ghibli AI generator | 100K-300K | 低-中 (25-40) | 特效页 |
| anime video enhancer | 5K-10K | 极低 (10-20) | 工具页 |
| AI walking video generator | 5K-20K | 极低 (5-15) | 特效页 |
| drunk dance AI | 5K-20K | 极低 (5-15) | 特效页 |
| earth zoom in AI | 5K-10K | 极低 (5-10) | 特效页 |
| polaroid duo selfie AI | 5K-10K | 极低 (5-10) | 特效页 |
| AI video no watermark | 50K-100K | 低 (25-40) | 工具页 |
| AI video generator free | 200K-500K | 中 (45-60) | 工具页 |
| AI image generator free | 300K-500K | 中 (50-65) | 工具页 |
| blog to video AI | 10K-30K | 低 (15-25) | 工具页 |
| UGC video ad generator | 5K-20K | 极低 (10-20) | 工具页 |
| AI short video generator | 20K-50K | 低 (20-35) | 工具页 |
| clone viral video AI | 5K-10K | 极低 (5-15) | 工具页 |

**执行建议：** 用动态模板 + JSON 配置批量生成，不需要每个页面手写代码

### 第四层：对比关键词（GEO + SEO 双杀）

| 关键词 | 预估月搜索量 | KD 评估 | 页面类型 |
|--------|-------------|---------|----------|
| kling ai vs runway | 10K-30K | 低 (15-30) | 对比文章 |
| sora vs runway | 10K-30K | 低-中 (20-35) | 对比文章 |
| kling ai vs pika | 5K-10K | 极低 (10-20) | 对比文章 |
| veo 3 vs sora 2 | 10K-30K | 低 (15-25) | 对比文章 |
| hailuo vs kling | 5K-10K | 极低 (5-15) | 对比文章 |
| best AI video generator | 100K-200K | 高 (60-70) | 测评文章 |
| runway review | 20K-50K | 中 (35-50) | 测评文章 |
| kling ai review | 10K-30K | 低 (20-35) | 测评文章 |
| pollo ai alternatives | 5K-10K | 极低 (10-20) | 平替文章 |
| runway alternatives | 10K-20K | 低 (20-35) | 平替文章 |
| how to make AI videos | 50K-100K | 中 (40-55) | 教程文章 |

### 第五层：How-to / 教程关键词（长期 GEO 投资）

| 关键词 | 预估月搜索量 | KD |
|--------|-------------|-----|
| how to create AI videos | 20K-50K | 中 |
| how to make AI video from text | 10K-30K | 低 |
| how to animate image with AI | 10K-20K | 低 |
| how to upscale video with AI | 10K-30K | 低 |
| how to create loop videos with AI | 5K-10K | 极低 |
| how to extend video using AI | 5K-10K | 极低 |

---

## 三、首批目标关键词清单（MVP 阶段必做）

### A. 模型落地页（14 个页面 — 动态模板生成）

| # | 关键词 | 页面路由 | 模型 |
|---|--------|----------|------|
| 1 | kling ai | /models/kling-ai | Kling AI |
| 2 | sora ai | /models/sora | Sora 2 |
| 3 | runway ai | /models/runway | Runway Gen-3 |
| 4 | veo 3 | /models/veo-3 | Google Veo 3 |
| 5 | hailuo ai | /models/hailuo-ai | Hailuo (MiniMax) |
| 6 | seedance 2.0 | /models/seedance | Seedance 2.0 |
| 7 | pika ai | /models/pika | Pika |
| 8 | luma ai | /models/luma-ai | Luma Dream Machine |
| 9 | pixverse | /models/pixverse | PixVerse |
| 10 | vidu ai | /models/vidu-ai | Vidu AI |
| 11 | wan ai | /models/wan-ai | Wan AI |
| 12 | hunyuan | /models/hunyuan | Hunyuan Video |
| 13 | flux ai | /models/flux | FLUX (图片) |
| 14 | stable diffusion | /models/stable-diffusion | SD (图片) |

### B. 功能页面（6 个页面）

| # | 关键词 | 页面路由 |
|---|--------|----------|
| 1 | text to video | /tools/text-to-video |
| 2 | image to video | /tools/image-to-video |
| 3 | video to video | /tools/video-to-video |
| 4 | text to image | /tools/text-to-image |
| 5 | AI avatar | /tools/ai-avatar |
| 6 | AI animation | /tools/ai-animation |

### C. 特效页面（5 个高潜力热点）

| # | 关键词 | 页面路由 |
|---|--------|----------|
| 1 | ghibli AI generator | /effects/ghibli-generator |
| 2 | AI hug generator | /effects/ai-hug |
| 3 | AI video upscaler | /tools/ai-video-upscaler |
| 4 | AI dance generator | /effects/ai-dance |
| 5 | video to anime | /effects/video-to-anime |

### D. 首批对比文章（4 篇 GEO 内容）

| # | 关键词 | 文章路由 |
|---|--------|----------|
| 1 | kling ai vs runway | /hub/kling-ai-vs-runway |
| 2 | veo 3 vs sora 2 | /hub/veo-3-vs-sora-2 |
| 3 | best AI video generator 2026 | /hub/best-ai-video-generator |
| 4 | seedance 2.0 review | /hub/seedance-2-0-review |

---

## 四、关键词价值评分模型

参考飞书文档的公式：**Score = (CPC x Volume) / KD**

### Top 20 高价值关键词排序

| 排名 | 关键词 | Volume | CPC | KD | Score | 类型 |
|------|--------|--------|-----|-----|-------|------|
| 1 | seedance 2.0 | 100K | $2.5 | 12 | 20,833 | 模型 |
| 2 | vidu ai video generator | 20K | $3.0 | 10 | 6,000 | 模型 |
| 3 | wan ai video | 15K | $2.8 | 8 | 5,250 | 模型 |
| 4 | hunyuan video | 15K | $2.5 | 8 | 4,688 | 模型 |
| 5 | kling ai video generator | 80K | $2.8 | 28 | 8,000 | 模型 |
| 6 | ghibli AI generator | 200K | $1.5 | 25 | 12,000 | 特效 |
| 7 | hailuo ai video | 150K | $2.0 | 30 | 10,000 | 模型 |
| 8 | pixverse ai | 80K | $2.0 | 22 | 7,273 | 模型 |
| 9 | luma dream machine | 60K | $2.2 | 28 | 4,714 | 模型 |
| 10 | AI hug generator | 80K | $1.2 | 20 | 4,800 | 特效 |
| 11 | image to video AI | 150K | $2.5 | 42 | 8,929 | 功能 |
| 12 | video to video AI | 40K | $2.8 | 35 | 3,200 | 功能 |
| 13 | AI video generator free | 300K | $1.8 | 50 | 10,800 | 功能 |
| 14 | runway gen-3 | 30K | $3.5 | 30 | 3,500 | 模型 |
| 15 | AI animation generator | 80K | $1.8 | 35 | 4,114 | 功能 |
| 16 | AI video upscaler | 30K | $2.0 | 25 | 2,400 | 工具 |
| 17 | AI video no watermark | 60K | $1.5 | 30 | 3,000 | 功能 |
| 18 | blog to video AI | 15K | $3.5 | 18 | 2,917 | 场景 |
| 19 | AI dance generator | 15K | $1.5 | 15 | 1,500 | 特效 |
| 20 | clone viral video AI | 8K | $4.0 | 10 | 3,200 | 场景 |

---

## 五、执行优先级总结

### MVP 上线时（共 25-30 个 SEO 页面）
1. **14 个模型页** — 一次全上，动态模板生成
2. **6 个功能页** — 核心能力入口
3. **5 个特效/工具页** — 抓热点长尾

### 上线后第 1 个月
4. **4-8 篇对比文章** — GEO 内容
5. **持续新增模型页** — 新模型出来第一时间做页

### 上线后第 2 个月
6. **10-20 个细分场景页** — 参考竞品 + SemRush 数据持续挖掘
7. **How-to 教程系列** — 每周 2-3 篇

### 长期维护
- 每 2 周检查一次 SimilarWeb 竞品关键词变化
- 每次新模型发布 48 小时内上线对应页面
- TikTok 热点特效 24 小时内上线对应页面

---

## 六、SEO 技术实施要点

1. **SSG（静态生成）**：所有模型/工具/文章页面用 Next.js SSG，确保加载速度和 SEO 爬虫友好
2. **Schema.org 结构化数据**：每个页面加 FAQ Schema + Product Schema
3. **Sitemap 自动生成**：每次新增页面自动加入 sitemap.xml
4. **内链策略**：模型页 ↔ 功能页 ↔ 文章页互相链接
5. **多语言**（后期）：英文为主，逐步加日/韩/西/葡等语言版本
