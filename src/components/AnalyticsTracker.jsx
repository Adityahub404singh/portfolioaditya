import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const event = {
      event_type: "page_view",
      page_path: location.pathname,
      referrer: document.referrer || null,
      metadata: { screen: `${window.screen?.width || 0}x${window.screen?.height || 0}` }
    };
    if (isSupabaseConfigured) {
      supabase.from("portfolio_events").insert(event).then(({ error }) => {
        if (error) console.warn("Analytics event not recorded:", error.message);
      });
    } else {
      try {
        const key = "aps-analytics-preview";
        const current = JSON.parse(localStorage.getItem(key) || '{"visits":[],"projectClicks":[]}');
        current.visits = [{ ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...(current.visits || [])].slice(0, 500);
        localStorage.setItem(key, JSON.stringify(current));
      } catch {}
    }
  }, [location.pathname]);
  return null;
}
