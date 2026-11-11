# APS Portfolio Studio — React + Vite

A modern, interactive, multi-page developer portfolio and private content dashboard for **Aditya Pratap Singh**. Built with React and Vite, featuring cinematic animations, interactive cursor swarm effects, project showcases, and an optional Supabase-powered admin dashboard.

## 🌐 Live Website

**[portfolioaditya-sigma.vercel.app](https://portfolioaditya-sigma.vercel.app/)**

## ✨ Features

- Modern and responsive portfolio design
- Cinematic intro and background animations
- Interactive cursor swarm with particle effects
- Smooth scrolling and page transitions
- Dedicated About, Projects, Journey, and Contact pages
- Project showcase with images and descriptions
- Private admin dashboard
- Supabase authentication and cloud publishing (optional)
- Local browser storage for preview mode
- Responsive layout for desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Routing:** React Router
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend / Database:** Supabase Auth + PostgreSQL JSONB
- **Styling:** CSS3
- **Deployment:** Vercel

## 📁 Project Structure

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
│   ├── favicon.svg
│   └── resume.pdf
│
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── PortraitStage.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── SectionHeading.jsx
│   │   ├── ScrollStoryController.jsx
│   │   └── vfx/
│   │       ├── CinematicIntro.jsx
│   │       └── CursorSwarm.jsx
│   │
│   ├── hooks/
│   │   ├── MotionPreference.jsx
│   │   └── usePortfolio.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   ├── Journey.jsx
│   │   ├── Projects.jsx
│   │   └── NotFound.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── data.js
│   ├── styles.css
│   └── cinematic-background.css
│
├── supabase/
│   └── schema.sql
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Adityahub404singh/portfolioaditya.git
cd portfolioaditya
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory using `.env.example` as a reference.

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADMIN_EMAIL=YOUR_ADMIN_EMAIL
```

Supabase configuration is optional for local preview mode. Never commit your actual `.env` file or service-role keys.

### 4. Start development server

```bash
npm run dev
```

### 5. Create production build

```bash
npm run build
```

### 6. Preview production build

```bash
npm run preview
```

## ☁️ Deployment

This project is deployed using **Vercel**.

Live URL: https://portfolioaditya-sigma.vercel.app/

For your own deployment:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Deploy the project.
4. Vercel will build and host the application.

## 🔐 Admin Dashboard

The project includes a private admin dashboard with optional Supabase authentication and cloud publishing.

Local browser storage is available for preview mode.

## 📌 Future Improvements

- Performance optimization and code splitting
- Enhanced mobile animations
- Additional interactive visual effects
- Improved dashboard analytics
- More project showcases

## 👨‍💻 Author

**Aditya Pratap Singh**

Developer Portfolio — APS Portfolio Studio

- **GitHub:** [Adityahub404singh](https://github.com/Adityahub404singh)
- **Live Portfolio:** [portfolioaditya-sigma.vercel.app](https://portfolioaditya-sigma.vercel.app/)

---

⭐ If you like this project, consider giving it a star on GitHub.
