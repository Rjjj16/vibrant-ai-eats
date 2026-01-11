# AI Food Calorie - Food Scanner App

A nutrition tracking app that uses AI to analyze food images and log daily meals.

## Technologies

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- Framer Motion

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- Your own Supabase project OR Docker for fully local backend

### Option 1: Use Your Own Supabase Project

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rjjj16/vibrant-ai-eats.git
   cd vibrant-ai-eats
   ```

2. **Create `.env.local`** in the project root:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
   VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
   ```

3. **Create `supabase/.env.local`** for edge functions:
   ```env
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   LOVABLE_API_KEY=your_lovable_api_key
   ```
   > Get LOVABLE_API_KEY from your Lovable Cloud settings, or use GEMINI_API_KEY directly (see Option 2)

4. **Install dependencies and run**
   ```bash
   npm install
   npm run dev
   ```

5. **Apply database migrations** to your Supabase project via the Supabase dashboard SQL editor using files in `supabase/migrations/`

### Option 2: 100% Local Backend (No External Dependencies)

1. **Install Docker Desktop** and **Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # or npm
   npm install -g supabase
   ```

2. **Start local Supabase**
   ```bash
   supabase start
   ```
   This outputs local credentials - copy them.

3. **Create `.env.local`**:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key_from_supabase_start>
   VITE_SUPABASE_PROJECT_ID=local
   ```

4. **Create `supabase/.env.local`** with a direct Gemini API key:
   ```env
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=<anon_key_from_supabase_start>
   SUPABASE_SERVICE_ROLE_KEY=<service_role_key_from_supabase_start>
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

5. **Modify edge function** to use Gemini directly:
   In `supabase/functions/analyze-food/index.ts`, replace the AI gateway call with direct Gemini API.

6. **Run the app**
   ```bash
   npm install
   npm run dev
   ```

7. **Serve edge functions locally**
   ```bash
   supabase functions serve
   ```

---

## Database Schema

### Tables

- **profiles**: User plan info, scan limits
- **food_logs**: Meal entries with nutrition data

Run migrations from `supabase/migrations/` folder in your Supabase SQL editor.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (edge functions) |
| `LOVABLE_API_KEY` | For Lovable AI gateway |
| `GEMINI_API_KEY` | For direct Google Gemini access |

---

## Lovable Development

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

Changes made via Lovable are committed automatically to this repo.

---

## Deployment

- **Via Lovable**: Click Share → Publish
- **Self-hosted**: Build with `npm run build` and deploy `dist/` folder
