
import { Route, Routes } from "react-router-dom";
import { PortfolioProvider } from "./hooks/usePortfolio";
import SiteLayout from "./components/SiteLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Journey from "./pages/Journey";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import AnalyticsTracker from "./components/AnalyticsTracker";
import SwarmRebuildLauncher from "./components/vfx/SwarmRebuildLauncher";

import { MotionPreferenceProvider } from "./hooks/MotionPreference";

// Shared cinematic photo background for every route.
import "./cinematic-background.css";

export default function App() {
  return (
    <PortfolioProvider>
      <MotionPreferenceProvider>
        <AnalyticsTracker />

        {/* Automatically start Swarm Rebuild on public pages */}
        <SwarmRebuildLauncher />

        <Routes>
          {/* Public pages */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin pages outside public SiteLayout */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MotionPreferenceProvider>
    </PortfolioProvider>
  );
}
