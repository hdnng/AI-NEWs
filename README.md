# 🌐 AI PULSE — Real-time AI News & Multi-Criteria Leaderboard

**AI Pulse** là nền tảng trực tuyến chuyên biệt giúp theo dõi nhịp đập của thế giới trí tuệ nhân tạo (AI). Dự án kết hợp hai tính năng cốt lõi: **Tổng hợp tin tức AI thời gian thực** và **Bảng xếp hạng mô hình AI chuyên sâu theo từng tiêu chí riêng biệt**.

---

## ✨ Tính Năng Nổi Bật

### 1. 📊 Bảng Xếp Hạng Mô Hình AI Đa Tiêu Chí (`/leaderboard`)
Không đánh giá mô hình AI một cách chung chung, AI Pulse cho phép phân tích và so sánh chi tiết điểm mạnh/yếu của từng mô hình theo 6 tiêu chí độc lập:

- 🧠 **Suy luận (Reasoning):** Tổng hợp từ các bộ chuẩn kiểm thử chuyên sâu (GPQA, MMLU-PRO, BBH).
- 📐 **Toán học (Math):** Đánh giá năng lực giải toán nâng cao qua benchmark MATH Level 5.
- 💻 **Lập trình (Coding):** Đo lường khả năng sinh mã và giải thuật thực tế (BigCodeBench).
- ⚔️ **Đấu trường Arena (Human & Auto Evals):** Đánh giá qua bộ benchmark Arena Hard Auto dựa trên dữ liệu đấu mù thực tế.
- 📥 **Lượt tải (Downloads):** Đo lường mức độ ứng dụng thực tế trong cộng đồng nguồn mở.
- ❤️ **Độ yêu thích (Likes):** Thể hiện sự tín nhiệm của cộng đồng lập trình viên và nhà nghiên cứu.

> 💡 *Mỗi cột điểm đều có thông tin nguồn dữ liệu minh bạch, phân biệt rõ ràng giữa mô hình nguồn mở và mô hình đóng thương mại (GPT-4o, Claude 3.5, Gemini...).*

---

### 2. 📰 Tổng Hợp Tin Tức AI Nhanh Chóng & Uy Tín (`/news`)
- **Tập hợp nguồn tin hàng đầu:** Tự động gom tin tức từ blog chính thức của các hãng AI (OpenAI, Google AI), báo công nghệ lớn (TechCrunch, VentureBeat) và các nghiên cứu khoa học mới nhất từ **arXiv CS.AI**.
- **Tóm tắt ngắn gọn:** Trích xuất phần cốt lõi của bài viết, kèm liên kết dẫn thẳng về bài gốc để tôn trọng bản quyền tác giả.
- **Trải nghiệm tức thì:** Tự động nhận diện bài viết mới dưới 15 phút, hỗ trợ lọc theo từng nguồn phát hành và phân trang mượt mà.

---

## 🏛️ Kiến Trúc & Cơ Chế Vận Hành

AI Pulse được xây dựng theo mô hình **Decoupled Sync Architecture (Tách biệt tác vụ đồng bộ và hiển thị)**:

```
┌─────────────────────────────────────────────────────────┐
│              Background Sync Jobs (Cron)                │
│  Tự động thu thập dữ liệu từ các nguồn định kỳ theo lịch│
└────────┬────────────────────────────────┬───────────────┘
         │                                │
         ▼                                ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│  4 Nguồn Benchmark & Hub│    │    5 Kênh RSS & arXiv    │
└────────┬────────────────┘    └──────────┬───────────────┘
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│                 Postgres Database (Neon)                │
│  Lưu trữ dữ liệu tập trung, đã chuẩn hóa và loại trùng  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Frontend (ISR)                      │
│  Người dùng truy cập xem ngay lập tức, siêu nhanh,      │
│  không phải chờ gọi API ngoài tại thời điểm load trang  │
└─────────────────────────────────────────────────────────┘
```

- **Tự động hóa hoàn toàn:** Hệ thống tự động làm mới dữ liệu theo lịch trình nền, người dùng chỉ cần vào xem mà không cần thao tác tải lại trang.
- **Độ ổn định cao:** Mỗi nguồn thu thập đều có cơ chế timeout và xử lý lỗi độc lập; sự cố từ một nguồn ngoài không bao giờ làm ảnh hưởng đến toàn bộ hệ thống hay làm gián đoạn trải nghiệm người dùng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components, ISR)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Cơ sở dữ liệu:** [PostgreSQL](https://www.postgresql.org/) (Neon Serverless Postgres)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Giao diện & Thiết kế:** [Tailwind CSS](https://tailwindcss.com/) — Phong cách **Dark Cyberpunk / Terminal**, tối ưu typography với Google Fonts (*Space Grotesk*, *Inter*, *JetBrains Mono*).
- **Phân tích dữ liệu:** `papaparse` (CSV Parser), `rss-parser` (RSS/Atom Feed Parser).
