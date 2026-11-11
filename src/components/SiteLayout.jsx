import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { MotionPreferenceProvider } from "../hooks/MotionPreference";

export default function SiteLayout() {
  return (
    <MotionPreferenceProvider>
      <div className="app-shell">
        <Header />
        <main><Outlet /></main>
        <Footer />
      </div>
    </MotionPreferenceProvider>
  );
}
