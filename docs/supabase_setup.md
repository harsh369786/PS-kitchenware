# Supabase Setup Guide

## 1. Create Account & Project
1. Go to [Supabase](https://supabase.com/).
2. Click **"Start your project"**.
3. Sign in with GitHub.
4. Click **"New Project"**.
5. Choose your organization, name it (e.g., `ps-kitchenware`), and set a database password.
6. Choose a region close to your users (e.g., Mumbai, Singapore).
7. Click **"Create new project"**.

## 2. Database Setup (SQL Editor)
Go to the **SQL Editor** (sidebar icon with terminal lines) and run this script to create your tables:

```sql
-- Create a table for orders
create table orders (
  id text primary key,
  product_name text,
  quantity integer,
  price numeric,
  size text,
  image_url text,
  date timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for site content (storing complex JSON structure)
create table site_content (
  id text primary key,
  data jsonb
);

-- Insert initial empty content row
insert into site_content (id, data) values ('main', '{}');

-- Enable Row Level Security (Recommended)
alter table orders enable row level security;
alter table site_content enable row level security;

-- Create policies (Adjust for production! These are permissive for initial setup)
create policy "Public orders read" on orders for select using (true);
create policy "Public orders insert" on orders for insert with check (true);
create policy "Public content read" on site_content for select using (true);
create policy "Public content update" on site_content for update using (true);
```

## 3. Storage Setup
1. Go to **Storage** (sidebar icon with image folder).
2. Click **"New Bucket"**.
3. Name it `uploads`.
4. Toggle **"Public bucket"** to ON.
5. Click **"Save"**.

## 4. Get API Keys
1. Go to **Project Settings** (gear icon) > **API**.
2. Copy **Project URL** and **anon public** key.

## 5. Environment Variables
Add these to your `.env.local` and Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
