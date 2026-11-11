import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CursorSwarm from "./vfx/CursorSwarm";
import { MotionPreferenceProvider } from "../hooks/MotionPreference";

export default function SiteLayout() {
  return (
    <MotionPreferenceProvider>
      <>
        {/* Keep the fixed canvas outside the clipped app-shell stacking context. */}
        <CursorSwarm />
        <div className="app-shell">
          <Header />
          <main><Outlet /></main>
          <Footer />
        </div>
      </>
    </MotionPreferenceProvider>
  );
}
