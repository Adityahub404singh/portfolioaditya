import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Automatically starts the original Swarm Rebuild on every public page visit.
 * The original engine starts itself when its local script is loaded.
 * Audio remains subject to browser autoplay policy and may need first user
 * interaction; the visual rebuild does not require a click.
 */
export default function SwarmRebuildLauncher() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.__swarmRebuild || document.querySelector('script[data-swarm-rebuild="local"]')) return;

    const script = document.createElement("script");
    script.src = "/swarm-rebuild.js";
    script.async = true;
    script.dataset.swarmRebuild = "local";
    script.onerror = () => {
      console.error("[swarm-rebuild] Could not load /swarm-rebuild.js");
      script.remove();
    };
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
