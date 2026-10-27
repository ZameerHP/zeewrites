# Zee Writes - Supabase Environment Variables Guide

When deploying to Vercel (or testing locally), add these variables in your **Vercel Project Settings -> Environment Variables**:

```env
# 1. Your Supabase Project URL (from Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 2. Your Supabase Anon Key (public API key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Your Supabase Service Role Key (recommended for server-side full admin write access)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step-by-Step Setup in 2 Minutes:

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** tab on the left.
3. Paste the contents of `supabase_schema.sql` and click **Run**.
4. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key
5. In **Vercel**:
   - Go to **Settings -> Environment Variables**.
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
6. Redeploy on Vercel. Now every time you publish, edit, or delete an article from `/zee-studio-vault`, it instantly syncs to Supabase and updates the live website worldwide!
