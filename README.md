# PS Kitchenware E-Commerce

A modern e-commerce platform for kitchenware products built with Next.js, Supabase, and TypeScript.

## Features

- 🛒 **E-Commerce Functionality**
  - Product catalog with categories
  - Shopping cart
  - Checkout process
  - Order management

- 📧 **Email Notifications**
  - Order confirmations with product images
  - Admin notifications
  - Gmail SMTP integration

- 🎨 **Admin Dashboard**
  - Order tracking and analytics
  - Content management (products, categories, banners)
  - Date-range filtering
  - Real-time statistics

- 💾 **Database & Storage**
  - Supabase PostgreSQL database
  - Image storage with Supabase Storage
  - Real-time data synchronization

- 🎯 **AI-Powered Features**
  - AI-generated product images (Gemini AI)
  - Smart content generation

## Tech Stack

- **Framework:** Next.js 15.5
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **Email:** Nodemailer (Gmail SMTP)
- **AI:** Google Gemini AI

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Gmail account (for email notifications)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd PS-kitchenware
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in the required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GMAIL_SENDER_EMAIL`
   - `GMAIL_APP_PASSWORD`
   - `GEMINI_API_KEY`

4. Set up Supabase database
   - Run the SQL scripts in `docs/supabase_setup.md`
   - Run the user schema in `docs/supabase-users-schema.md`

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app              # Next.js app directory
    /actions        # Server actions
    /admin          # Admin dashboard
    /cart           # Shopping cart
  /components       # React components
    /ui             # UI components
  /lib              # Utilities and types
/docs               # Documentation
/public             # Static assets
```

## Admin Access

Default credentials:
- Email: admin@pskitchen.com
- Password: admin123

**⚠️ Change these in production!**

## Documentation

- [Supabase Setup](docs/supabase_setup.md)
- [User Schema](docs/supabase-users-schema.md)
- [Email Notifications](docs/email-notifications.md)

## Deployment

The app is configured for deployment on:
- **Vercel** (recommended)
- **Google Cloud App Hosting**

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
