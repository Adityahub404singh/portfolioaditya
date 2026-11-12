import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMotionPreference } from "../../hooks/MotionPreference";
import { CursorEngine } from "./cursorEngine";
import { createStory } from "./storyController";
import "./cursor-swarm.css";

/* Mounted ONCE at the application root (App.jsx). One persistent canvas, one engine,
   one rAF loop; it survives every public route change. Home attaches the scroll story. */
export default function CursorStage() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const { enabled } = useMotionPreference();
  const { pathname } = useLocation();
  const active = enabled && !pathname.startsWith("/admin");

  // 1) engine lifecycle (StrictMode-safe: cleanup fully destroys, re-run rebuilds)
  useEffect(() => {
    if (!active || !canvasRef.current) return undefined;
    const engine = new CursorEngine(canvasRef.current);
    engine.start();
    engineRef.current = engine;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("cursordebug")) window.__apsCursor = engine;
    return () => { engine.destroy(); engineRef.current = null; };
  }, [active]);

  // 2) scroll story (Home only; other routes keep the ambient swarm + pointer interaction)
  useEffect(() => {
    if (!active || pathname !== "/" || !engineRef.current) return undefined;
    const story = createStory(engineRef.current);
    return () => story.destroy();
  }, [active, pathname]);

  // 3) magnetic buttons (fine pointers only). Uses the independent CSS `translate` property.
  useEffect(() => {
    if (!active || !window.matchMedia("(pointer: fine)").matches) return undefined;
    let cur = null;
    const reset = () => { if (cur) { cur.style.setProperty("--mx", "0px"); cur.style.setProperty("--my", "0px"); cur = null; } };
    const onMove = (e) => {
      const btn = e.target.closest && e.target.closest(".aps-button");
      if (cur && cur !== btn) reset();
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
      btn.style.setProperty("--my", `${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`);
      cur = btn;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => { window.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", reset); reset(); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="aps-cursor-swarm" aria-hidden="true" />;
}
