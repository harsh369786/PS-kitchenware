# AI Replication Instructions: E-Commerce Codebase Structure & Features

This file is a comprehensive guide specifically written for an AI code assistant to understand the architecture, structure, and features of the current project (`PS-kitchenware`). 

**Goal:** Use this document as a blueprint to replicate this same Next.js e-commerce structure and its functionalities for **another brand's product website**.

---

## 1. Tech Stack Overview

When recreating this website for a new brand, initialize the project with these exact technologies:
- **Framework:** Next.js 15.5+ (using App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS combined with `tailwind-merge` and `clsx`
- **UI Components:** Radix UI primitives (e.g., Dialog, Dropdown, Accordion) wrapped in custom components, mimicking a `shadcn/ui`-like architecture.
- **Icons:** `lucide-react`
- **Form Handling & Validation:** `react-hook-form` with `@hookform/resolvers` and `zod` schema validation.
- **Backend & Database:** Supabase (PostgreSQL)
- **AI Integration:** `@genkit-ai/google-genai` and `@genkit-ai/next` for Google Gemini AI integrations.
- **Emails:** `nodemailer` for handling transactional emails (e.g., order confirmations).
- **Carousel:** `embla-carousel-react` and `embla-carousel-autoplay`.

---

## 2. Codebase Structure Blueprint

Maintain this folder structure in `src/` when replicating for the new brand:

```text
/src
  /ai
    dev.ts                # Genkit CLI setup
    genkit.ts             # Genkit SDK initialization
    /flows                # AI flows/chains (e.g., generation logic)
  /app
    layout.tsx            # Main HTML layout, imports globals.css, sets up headers and providers
    page.tsx              # Landing page (implements hero carousel, featured categories)
    /about, /contact      # Static pages for brand info and contact forms
    /cart                 # Shopping cart page and checkout sequence
    /category             # Dynamic routing for product categories (e.g., /category/[slug])
    /search               # Search results page
    /admin                # Admin dashboard for managing orders, products, editing banners
    /actions
      auth-actions.ts     # Server actions: login, logout
      order-actions.ts    # Server actions: fetching, updating orders
      user-actions.ts     # Server actions: profile updates
      send-order-email.ts # Server actions: triggers nodemailer to send order confirmation
      send-enquiry-email.ts # Server actions: triggers nodemailer for contact form
  /components
    hero-carousel.tsx       # Embla carousel for home banners
    category-grid.tsx       # Grid displaying brand categories
    product-scroll.tsx      # Horizontal scroll layout of products
    ai-product-form.tsx     # Form utilizing Genkit AI to auto-generate product descriptions/data
    product-detail-modal.tsx# Quick-view Radix UI dialog for products
    address-dialog.tsx      # Dialog for capturing checkout details
    contact-form.tsx        # React-Hook-Form for user enquiries
    /layout                 # Header, Footer, Mobile Navigation components
    /ui                     # Reusable Radix UI building blocks (Button, Input, Select, etc.)
  /context
    cart-context.tsx      # React Context providing global Cart State (items, total, add, remove)
  /hooks
    # Custom React hooks used to wrap generic UI/Data fetching logic
  /lib
    supabase.ts           # Supabase JS client singleton
    types.ts              # Global TypeScript interfaces (Product, Category, Order, User)
    utils.ts              # Tailwind class merger (`cn()`), date formatters, etc.
    upload-image.ts       # Logic for streaming/uploading images to Supabase storage buckets
```

---

## 3. Core Features to Replicate

During replication, you must implement the following key workflows exactly as they are configured in the current codebase:

### A. E-Commerce Cart & State Management
- **Cart Context (`src/context/cart-context.tsx`):**
  - Implement a `CartProvider` at the root (`layout.tsx`).
  - Manage state for cart items (Product ID, quantity, selected variations like size/color).
  - Persist cart items locally using `localStorage` until the user checks out.
- **Product Display Module (`src/components/`):**
  - Extract dynamic product lists from Supabase.
  - Implement a modal architecture (`product-detail-modal.tsx`) that opens instantly without a full page reload when clicking on a product from listing views.

### B. Next.js Server Actions (Backend Logic)
Instead of standard API routes (`/api`), use **Server Actions** (`src/app/actions`) for handling side effects:
- Form submissions from the admin panel (creating/updating products).
- Triggering NodeMailer emails safely from the server context without exposing SMTP credentials (`send-order-email.ts`).
- Secure operations on Supabase interacting via server-side roles (fetching unauthenticated or admin-only data securely).

### C. Admin & AI Enhancements
- **Admin Layout (`/src/app/admin/`):**
  - Secure section verifying the user's role (fetching auth token server-side).
  - CRUD operations for dynamic brand resources (Hero banners, Categories, Products).
- **AI Content Generation (`ai-product-form.tsx` & `/src/ai/`):**
  - Integrate Genkit to assist admins. For example, dynamically filling missing SEO text, describing product pictures, or translating marketing copy for the new brand.

### D. Nodemailer Integration
- Configure a generic SMTP integration using `nodemailer` triggered inside `send-order-email.ts`. 
- Generate HTML templates dynamically combining the Cart context details (product names, totals, quantities) to send receipt confirmations directly to the user's email.

---

## 4. Replication Step-by-Step Prompt (For AI)

If you are starting the fresh replication process for the new brand, follow these steps:

1. **Setup & Configurations:** Run `npx create-next-app@latest` followed by installing the specified packages (`tailwindcss`, `@supabase/supabase-js`, `lucide-react`, `radix-ui` pieces).
2. **Global & Typography:** Initialize `globals.css` and `tailwind.config.ts` reflecting the new brand's colors and fonts. 
3. **Database Setup:** 
   - Define exact schema mirroring `types.ts` into Supabase (Tables: `products`, `categories`, `orders`, `banners`).
   - Setup RLS (Row Level Security) and Supabase Storage bucket for the new brand's images.
   - Inject `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `.env.local`.
4. **Base Architecture Layer:** 
   - Write `src/lib/utils.ts`, `src/lib/supabase.ts`, and `src/lib/types.ts`.
   - Setup `src/context/cart-context.tsx` and wrap it over `src/app/layout.tsx`.
5. **UI & Components:** 
   - Recreate Radix primitives inside `src/components/ui/`.
   - Recreate layout blocks (`Header`, `Footer`).
6. **Pages & Data Fetching:** 
   - Construct `/app/page.tsx` pulling from the `banners` and `categories` tables.
   - Construct `/app/category/[slug]/page.tsx` for dynamic product listings.
7. **Business Logic Integration:** 
   - Assemble the `/cart` page and the simulated checkout dialog (`address-dialog.tsx`).
   - Hook up `send-order-email.ts` server action linking nodemailers to environment variables (`GMAIL_SENDER_EMAIL`, `GMAIL_APP_PASSWORD`).
8. **Admin Panel & AI Setup:** 
   - Construct the dashboard for updating brand data. 
   - Hook up the Gemini API key (`GEMINI_API_KEY`) and set up `/src/ai/dev.ts` for AI tools inside the admin form.

*Save this file. When the user requests to create the new brand website, load this file as your primary context blueprint.*
