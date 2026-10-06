# Souq — modern e-commerce store

Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · TanStack Query · React Hook Form · Zod · Framer Motion

Frontend only, powered by two public APIs. No database, no API keys, no `.env` file.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## APIs

| What | API | Where in the code |
| --- | --- | --- |
| Products, categories, search, product reviews | [DummyJSON](https://dummyjson.com/docs/products) | `src/lib/dummyjson.ts` |
| Sign up, sign in (email + password, JWT), profile | [Platzi Fake Store API](https://fakeapi.platzi.com/en/rest/auth-jwt/) | `src/lib/platzi.ts`, `src/store/auth.ts` |

- Platzi is called through `/api/platzi/*`, a rewrite in `next.config.mjs` that forwards to
  `https://api.escuelajs.co/api/v1/*`. This avoids CORS problems in the browser.
- Sign up checks the email with `POST /users/is-available`, creates the user with `POST /users`, then logs in.
- Login gets an access + refresh token from `POST /auth/login` and the user from `GET /auth/profile`.
  On every page load the saved token is checked again and refreshed once if it has expired.
- Platzi passwords may only contain letters and numbers. **It's a shared public demo database — don't use a real password.**
  Test account: `john@mail.com` / `changeme`.

## What stays in the browser

Cart, wishlist, orders and reviews you write are saved with Zustand in localStorage, because neither API stores them.
Checkout validates the address and card with Zod and creates the order locally. Demo card: **4242 4242 4242 4242**.

## Product URLs

Products use `/products/{id}-{name}`, e.g. `/products/1-essence-mascara-lash-princess`.
Only the number at the start is used to fetch the product.

## Customise

- Home page categories: `HOME_CATEGORIES` in `src/app/page.tsx`
- Header links: `NAV` in `src/components/layout/site-header.tsx`
- Colours: CSS variables in `src/app/globals.css`
- Delivery fee: `src/lib/shipping.ts`
