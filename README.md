# APS Portfolio Studio — React + Vite

A multi-page developer portfolio and private content dashboard for Aditya Pratap Singh.

## Stack
- React 19 + Vite
- React Router
- Framer Motion
- Lucide icons
- Supabase Auth + Postgres JSONB (optional cloud publishing)
- Local browser storage for preview mode

## Folder structure

```text
aps-portfolio-studio/
├── public/
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── profile.jpg
│   │   ├── skillswap.jpg
│   │   ├── tutormitra.jpg
│   │   ├── ai-project.jpg
│   │   └── fire-robot.jpg
│   └── resume.pdf
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── PortraitStage.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── SectionHeading.jsx
│   │   ├── SiteLayout.jsx
│   │   └── StatCard.jsx
│   ├── hooks/
│   │   └── usePortfolio.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   ├── Journey.jsx
│   │   ├── NotFound.jsx
│   │   └── Projects.jsx
│   ├── App.jsx
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Install and run

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite.

## Supabase setup for secure admin publishing

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_EMAIL`.
4. Open `supabase/schema.sql` in the Supabase SQL Editor.
5. Replace `YOUR_ADMIN_EMAIL@example.com` in the SQL policies with the same admin email.
6. Run the SQL.
7. In Supabase Authentication, create the admin user with that email and a strong password.
8. Restart Vite after editing `.env`.

The public site reads the portfolio JSON record. Only the authenticated admin email can insert or update it through the row-level security policies.

## Admin pages

- `/admin` — Supabase email/password login.
- `/admin/dashboard` — dashboard KPIs, DSA/LeetCode metrics, daily updates, project CRUD, skills, certificate uploads, achievements, timeline, profile/media settings, analytics, goals/notes, backup/import/export and account settings.

The admin route intentionally requires Supabase authentication. If Supabase is not configured, the public portfolio can still be previewed using the bundled starter content, but secure admin publishing and file uploads are unavailable. Preview-mode analytics are kept in local browser storage.

## Images and resume

Replace files in `public/images/` and `public/resume.pdf` with your final assets while keeping the filenames unchanged. The current `hero-bg.jpg` uses the supplied full-body outdoor photo as the hero backdrop and portrait stage image.

## Important data note

Starter values in `src/data.js` are editable profile content. DSA, certificate and achievement lists start empty so the public portfolio does not display invented counts or credentials. Add only verified entries through Admin.

## Build

```bash
npm run build
npm run preview
```

The build should be run locally after installing dependencies. This environment did not complete `npm install`, so no successful production-build claim is made here.


## Admin workspace

The private `/admin` workspace includes 12 modules: Dashboard, DSA / LeetCode, Daily Updates, Projects, Skills, Certificates, Achievements, Timeline & Roadmap, Profile Settings, Analytics, Notes & Goals, and System backup/security.

## Local setup (Windows PowerShell)

```powershell
cd .\aps-portfolio-studio-aditya
npm install
npm run dev
```

Open the local URL printed by Vite. The admin route is `/admin`.
