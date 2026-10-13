# Kilo Club — Fight for Fitness

Supplement store with WhatsApp enquiries, in two apps:

| App | Folder | Who uses it | Local URL |
| --- | --- | --- | --- |
| **Store** | `apps/store` | Customers: browse, cart, enquire on WhatsApp, log in | http://localhost:3000 |
| **Admin panel** | `apps/admin` | Admins only: products, categories, brands, enquiries, users, settings | http://localhost:3001 |

Both apps share one **Supabase** project (database, login, image storage) and the code in `packages/shared`.

## How it works

- **Enquire on WhatsApp.** The button opens `wa.me/<number>` with the message already typed:
  - one product: *Heyy, I'm looking to buy Optimum Nutrition Gold Standard 100% Whey – 2 kg (Chocolate). Is the product available for sale?*
  - whole cart: *Heyy, I want to buy: 1. … 2. … Are they available?*

  If the customer is logged in, their name is added at the end. Each enquiry is also saved, so it shows up in **Admin → Enquiries** and on the dashboard.
- **Price notice.** "Prices may vary, so please enquire to confirm!" appears at the top of every page and next to prices. You can change it in **Admin → Settings**.
- **Login.** Email + password, or Google. Logging in is optional. It gives customers a wishlist, an enquiry history and their name on messages.
- **Admin-only access.** Every user has a role (`customer` or `admin`), and new sign-ups are always `customer`. The admin app turns away anyone who isn't an admin. The database rules (row-level security in `supabase/migrations/0001_init.sql`) also block non-admins from changing products, even if they bypass the website.
- **Before Supabase is connected**, the store runs in preview mode on a sample catalogue (`packages/shared/src/demo-data.ts`). Login and the admin panel turn on once Supabase is set up.

## 1. Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev:store     # http://localhost:3000
npm run dev:admin     # http://localhost:3001
```

## 2. Set up Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste and run `supabase/migrations/0001_init.sql` (tables, security rules, image bucket).
   Optionally run `supabase/seed.sql` to start with the sample products. **Their prices are placeholders**, so edit or delete them.
3. **Project Settings → API** → copy the Project URL and the publishable (or anon) key. Then create
   `apps/store/.env.local` and `apps/admin/.env.local` from the `.env.example` files next to them.
4. **Authentication → URL Configuration**
   - Site URL: your store URL (e.g. `https://kiloclub.vercel.app`)
   - Redirect URLs: add `https://<store>/auth/callback`, `https://<admin>/auth/callback`,
     `http://localhost:3000/auth/callback` and `http://localhost:3001/auth/callback`
5. **Google login** (Authentication → Sign In / Providers → Google):
   in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an *OAuth client ID* (Web application).
   Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorised redirect URI, then paste the client ID and secret into Supabase.

### Make yourself the admin

1. Sign up on the **store** with your email (or Google).
2. In the Supabase SQL Editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Log in on the admin app. From now on you can promote or demote other people in **Admin → Users**.

## 3. Deploy (free on Vercel)

Create **two Vercel projects** from this same GitHub repo:

| Project | Root Directory | Environment variables |
| --- | --- | --- |
| `kiloclub` (store) | `apps/store` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `kiloclub-admin` | `apps/admin` | same two, plus `NEXT_PUBLIC_STORE_URL` (the store's URL) |

Vercel gives you free `*.vercel.app` addresses. If you buy a domain later (e.g. `kiloclub.in`), point it at the store
and use `admin.kiloclub.in` for the admin. Then update the Supabase URL configuration (step 4).

## Day-to-day (admin panel)

- **Products → Add product.** Name, brand, category, photos (resized automatically) and description.
  Under *Sizes, flavours & prices*, use **Quick add** (`1 kg, 2 kg` × `Chocolate, Vanilla`) to make every combination,
  then fill in the prices. MRP is optional and shows as a strike-through with the % off.
- **Live on store** hides or shows a product. **Best seller** puts it on the home page. **Badge** adds a label such as *New*.
- **Settings** sets the WhatsApp number, both message templates (keep `{items}` in them) and the price notice.

## Project layout

```
apps/store            customer site (Next.js)
apps/admin            admin panel (Next.js)
packages/shared       types, WhatsApp message builder, Supabase clients, sample data
supabase/migrations   database schema + security rules
supabase/seed.sql     optional sample catalogue (generated: node scripts/generate-seed.ts)
brand/                original logo file
```
