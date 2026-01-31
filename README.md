# Welcome to your Lovable project

## Project info

**URL**: https://vendorly-shop-hub.lovable.app

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps (single script):

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Start the frontend locally.
bash scripts/setup-dev.sh start
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment Setup

Copy `env.example` to `.env` locally (never commit it), or set variables in your deployment platform.

Required variables:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase **anon** (public) key only
- `VITE_PUBLIC_SITE_URL` — Base site URL for SEO/OG tags (e.g. https://example.com)

### Vercel
- Go to **Project Settings → Environment Variables**
- Add the required variables for the appropriate environments (Development/Preview/Production)
- Redeploy after updating environment variables

**Important:** Secrets (service role keys, database passwords) must never be committed or exposed in frontend code.

## Package Manager

This repo uses **npm**. Keep `package-lock.json` committed and avoid other lockfiles.

## Analytics

This project uses Vercel Web Analytics for lightweight, privacy-friendly tracking.

Tracked events:
- Page views (automatic)
- Key actions: add to cart, quote request start/submit

Setup:
- Enable **Web Analytics** in the Vercel project dashboard.
- Deploy the app (analytics only runs in production builds).
- Do Not Track is respected; analytics is disabled when DNT is enabled.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

### Vercel build settings
- Install: `npm install`
- Build: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
