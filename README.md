# AI Pulse v2

Web tổng hợp tin tức AI theo thời gian thực + bảng xếp hạng mô hình AI theo nhiều tiêu chí.

Xây bằng **Next.js 14** (App Router, TypeScript) + **Postgres** (Neon/Supabase) + **Prisma ORM**. Dữ liệu được sync tự động qua Vercel Cron Jobs — người dùng chỉ vào xem, không cần bấm refresh.

---

## Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Cron Jobs                      │
│  sync-leaderboard (mỗi 6h)   sync-news (mỗi 1h)       │
└────────┬────────────────────────────────┬───────────────┘
         │                                │
         ▼                                ▼
┌────────────────┐    ┌──────────────────────────────────┐
│ 4 nguồn dữ liệu│    │ 5 nguồn RSS                      │
│ • Open LLM     │    │ • OpenAI  • Google AI             │
│ • Arena Hard   │    │ • TechCrunch AI  • VentureBeat AI │
│ • BigCodeBench │    │ • arXiv CS.AI                     │
│ • HF Hub API   │    │                                   │
└────────┬────────┘    └──────────────┬───────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────────────────────────────────┐
│          Neon Postgres Database               │
│     bảng "models"     bảng "articles"        │
└─────────┬─────────────────────┬──────────────┘
          │                     │
          ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ /leaderboard │    │     /news        │
│ (ISR 5 phút) │    │ (ISR 2 phút)    │
│ Tabs, sort,  │    │ Filter source,  │
│ tooltip nguồn│    │ phân trang, poll │
└──────────────┘    └──────────────────┘
```

---

## Cách setup

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd AInews
npm install
```

### 2. Tạo database Postgres

**Cách nhanh nhất: dùng Neon (miễn phí)**

1. Vào [neon.tech](https://neon.tech) → Sign up → Create Project
2. Copy **connection string** (dạng `postgresql://user:pass@host/dbname?sslmode=require`)

**Hoặc dùng Supabase:**

1. Vào [supabase.com](https://supabase.com) → New Project
2. Vào Settings → Database → Connection string (URI)

### 3. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Sửa file `.env`:

```env
# Paste connection string từ bước 2
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Tự đặt chuỗi bí mật bất kỳ (bảo vệ cron jobs khỏi bị gọi trái phép)
CRON_SECRET="chuoi-bi-mat-cua-ban-123"
```

### 4. Khởi tạo database

```bash
# Tạo bảng trong database
npx prisma db push

# (Tùy chọn) Mở Prisma Studio để xem dữ liệu trực quan
npx prisma studio
```

### 5. Chạy local

```bash
npm run dev
```

Mở http://localhost:3000

### 6. Chạy sync thủ công (lần đầu)

Vì cron chưa chạy, database trống. Gọi API sync thủ công:

```bash
# Sync leaderboard
curl -H "Authorization: Bearer chuoi-bi-mat-cua-ban-123" http://localhost:3000/api/cron/sync-leaderboard

# Sync tin tức
curl -H "Authorization: Bearer chuoi-bi-mat-cua-ban-123" http://localhost:3000/api/cron/sync-news
```

Sau khi chạy xong, reload trang để thấy dữ liệu.

---

## Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → Add New Project → chọn repo
3. Thêm **Environment Variables** trong Vercel dashboard:
   - `DATABASE_URL` = connection string Neon/Supabase
   - `CRON_SECRET` = chuỗi bí mật bạn đã đặt
4. Deploy!

### Cấu hình Vercel Cron

File `vercel.json` đã cấu hình sẵn 2 cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-leaderboard",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/sync-news",
      "schedule": "0 * * * *"
    }
  ]
}
```

- **sync-leaderboard**: chạy mỗi 6 giờ (0h, 6h, 12h, 18h UTC)
- **sync-news**: chạy mỗi 1 giờ

> **Lưu ý:** Vercel Cron tự động thêm header `Authorization: Bearer <CRON_SECRET>` khi gọi. Hãy đảm bảo biến `CRON_SECRET` đã được thêm vào Environment Variables trên Vercel dashboard.

---

## Cấu trúc thư mục

```
app/
  layout.tsx                         Layout + fonts + Nav
  page.tsx                           Redirect → /news
  news/
    page.tsx                         Trang tin tức (ISR 2 phút, đọc DB)
    loading.tsx                      Loading skeleton
    error.tsx                        Error boundary
  leaderboard/
    page.tsx                         Trang xếp hạng (ISR 5 phút, đọc DB)
    loading.tsx                      Loading skeleton
    error.tsx                        Error boundary
  api/
    cron/
      sync-leaderboard/route.ts      Cron job: fetch 4 nguồn → merge → DB
      sync-news/route.ts             Cron job: fetch RSS → DB
    leaderboard/route.ts             Public API: đọc models từ DB
    news/route.ts                    Public API: đọc articles từ DB

components/
  Nav.tsx                            Thanh điều hướng
  LeaderboardTabs.tsx                Tabs xếp hạng + tooltip nguồn
  NewsCard.tsx                       Thẻ 1 tin
  NewsFeed.tsx                       Danh sách tin + filter + phân trang
  Skeleton.tsx                       Loading skeletons

lib/
  db.ts                              Prisma client singleton
  sync-leaderboard.ts                Logic fetch 4 nguồn + merge + upsert
  sync-news.ts                       Logic fetch RSS + upsert
  rss-sources.ts                     Danh sách nguồn RSS
  time.ts                            Tiện ích "x phút trước" + format số

prisma/
  schema.prisma                      Schema DB: models + articles
```

---

## Nguồn dữ liệu

### Bảng xếp hạng (Leaderboard)

| Tiêu chí | Nguồn | Cập nhật |
|-----------|-------|----------|
| Suy luận (Reasoning) | Open LLM Leaderboard (GPQA, MMLU-PRO, BBH) | Mỗi 6h |
| Toán học (Math) | Open LLM Leaderboard (MATH Lvl 5) | Mỗi 6h |
| Lập trình (Coding) | BigCodeBench (complete + instruct) | Mỗi 6h |
| Arena | Arena Hard Auto v0.1 CSV | Mỗi 6h (snapshot tĩnh 2024-07-31) |
| Popularity | Hugging Face Hub API (downloads, likes) | Mỗi 6h |

> ⚠️ **Arena Hard** là snapshot tĩnh chốt ngày 2024-07-31, không phải Elo realtime. UI đã hiển thị rõ thông tin này.
>
> ⚠️ **Popularity** chỉ áp dụng cho model có trên HF Hub. Model đóng (GPT-4o, Claude, Gemini) hiển thị "N/A".

### Tin tức (News)

| Nguồn | URL |
|-------|-----|
| OpenAI | openai.com/news/rss.xml |
| Google AI | blog.google/technology/ai/rss/ |
| TechCrunch AI | techcrunch.com/category/artificial-intelligence/feed/ |
| VentureBeat AI | venturebeat.com/category/ai/feed/ |
| arXiv CS.AI | export.arxiv.org/api/query (Atom) |

---

## Xử lý lỗi

- Mỗi nguồn dữ liệu được wrap trong `try/catch` riêng — 1 nguồn lỗi không làm crash toàn bộ job
- Fetch có timeout (15s cho leaderboard, 15s cho RSS) — không treo vô hạn
- Nếu API ngoài fail/timeout: dữ liệu cũ trong DB giữ nguyên, log lỗi
- Frontend có error boundary + retry button cho cả 2 trang
- Cron jobs được bảo vệ bằng `CRON_SECRET` — không thể gọi trái phép
