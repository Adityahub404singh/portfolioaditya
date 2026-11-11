
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../../hooks/MotionPreference";
import "./cinematic-intro.css";

const COLORS = [
  "#3478F6",
  "#8758FF",
  "#FF5A70",
  "#13B89A",
  "#FF963B",
  "#E84CB8",
  "#28BCE8",
  "#A5C940",
  "#6741D9",
  "#F26B38",
];

const INTRO_DURATION = 3800;

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const random = (min, max) =>
  min + Math.random() * (max - min);

function drawArrow(ctx, agent, now) {
  const pulse =
    1 + Math.sin(now * 0.0018 + agent.phase) * 0.025;

  const scale = (agent.size * pulse) / 24;

  ctx.save();

  ctx.translate(agent.x, agent.y);
  ctx.scale(scale, scale);

  ctx.globalAlpha = agent.alpha;
  ctx.shadowColor = agent.color;
  ctx.shadowBlur = agent.enhanced ? 9 : 4;

  ctx.beginPath();

  ctx.moveTo(1, 1);
  ctx.lineTo(1, 20);
  ctx.lineTo(6.2, 15.1);
  ctx.lineTo(10.1, 22.5);
  ctx.lineTo(13.2, 20.9);
  ctx.lineTo(9.3, 13.7);
  ctx.lineTo(17.1, 13.4);

  ctx.closePath();

  ctx.fillStyle = agent.color;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.05;
  ctx.strokeStyle = "rgba(255,255,255,.96)";

  ctx.stroke();
  ctx.restore();
}

function createAgents(width, height) {
  const count =
    width < 600
      ? 16
      : width < 1000
        ? 40
        : width < 1440
          ? 75
          : 100;

  const centerX = width / 2;
  const centerY = height / 2;

  return Array.from({ length: count }, (_, index) => {
    const angle = random(0, Math.PI * 2);

    const startRadius = Math.max(width, height) * random(0.45, 0.78);

    const targetRadiusX = random(
      Math.min(65, width * 0.12),
      Math.min(260, width * 0.3)
    );

    const targetRadiusY = random(
      Math.min(30, height * 0.08),
      Math.min(115, height * 0.18)
    );

    return {
      x: centerX + Math.cos(angle) * startRadius,
      y: centerY + Math.sin(angle) * startRadius,

      targetX: centerX + Math.cos(angle) * targetRadiusX,
      targetY: centerY + Math.sin(angle) * targetRadiusY,

      vx: 0,
      vy: 0,

      phase: random(0, Math.PI * 2),

      color: COLORS[index % COLORS.length],

      size: index < 10 ? random(17, 21) : random(12, 16),

      alpha: random(0.45, 0.86),

      enhanced: index < 24,
    };
  });
}

export default function CinematicIntro() {
  const canvasRef = useRef(null);

  const [visible, setVisible] = useState(false);

  const { enabled } = useMotionPreference();

  // Close intro manually.
  const closeIntro = useCallback(() => {
    try {
      sessionStorage.setItem("aps-intro-seen", "yes");
    } catch {
      // Storage may be unavailable.
    }

    setVisible(false);
  }, []);

  // Decide whether the intro should appear.
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!enabled || reducedMotion) {
      setVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem("aps-intro-seen") === "yes") {
        return;
      }

      sessionStorage.setItem("aps-intro-seen", "yes");
    } catch {
      // Continue without session persistence.
    }

    setVisible(true);
  }, [enabled]);

  // Escape key skips the intro.
  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, closeIntro]);

  // Canvas animation.
  useEffect(() => {
    if (!visible || !enabled) return undefined;

    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let rafId = 0;
    let startTime = null;
    let stopped = false;

    let agents = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      agents = createAgents(width, height);
    }

    function finish() {
      if (stopped) return;

      stopped = true;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      setVisible(false);
    }

    function render(now) {
      if (stopped) return;

      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime;

      const progress = clamp(
        elapsed / INTRO_DURATION,
        0,
        1
      );

      const ease = 1 - Math.pow(1 - progress, 3);

      const fade =
        progress < 0.78
          ? 1
          : clamp(1 - (progress - 0.78) / 0.22, 0, 1);

      ctx.clearRect(0, 0, width, height);

      agents.forEach((agent, index) => {
        const orbit = (1 - ease) * 0.55;

        const phase =
          now * (0.00055 + (index % 5) * 0.00004) +
          agent.phase;

        const targetX =
          agent.targetX + Math.cos(phase) * 13 * orbit;

        const targetY =
          agent.targetY +
          Math.sin(phase * 1.13) * 9 * orbit;

        const dx = targetX - agent.x;
        const dy = targetY - agent.y;

        agent.vx = (agent.vx + dx * 0.055) * 0.88;
        agent.vy = (agent.vy + dy * 0.055) * 0.88;

        agent.x += agent.vx;
        agent.y += agent.vy;

        agent.alpha = (index < 24 ? 0.82 : 0.62) * fade;

        // Motion trails.
        if (agent.enhanced) {
          ctx.save();

          ctx.globalAlpha = 0.18 * fade;
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1.2;

          ctx.beginPath();

          ctx.moveTo(
            agent.x - agent.vx * 1.8,
            agent.y - agent.vy * 1.8
          );

          ctx.lineTo(agent.x, agent.y);

          ctx.stroke();
          ctx.restore();
        }

        drawArrow(ctx, agent, now);
      });

      if (elapsed >= INTRO_DURATION) {
        finish();
        return;
      }

      rafId = requestAnimationFrame(render);
    }

    resize();

    rafId = requestAnimationFrame(render);

    window.addEventListener("resize", resize, {
      passive: true,
    });

    return () => {
      stopped = true;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", resize);

      ctx.clearRect(0, 0, width, height);
    };
  }, [visible, enabled]);

  if (!visible || !enabled) {
    return null;
  }

  return (
    <div
      className="aps-cinematic-intro"
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio introduction"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />

      <div className="aps-intro-copy">
        <span className="aps-intro-kicker">
          <i />
          DEVELOPER · BUILDER · LEARNER
        </span>

        <h1>
          ADITYA
          <em>PRATAP SINGH</em>
        </h1>

        <p>
          BUILDING IDEAS INTO DIGITAL EXPERIENCES
        </p>

        <div
          className="aps-intro-progress"
          aria-hidden="true"
        >
          <span />
        </div>
      </div>

      <button
        type="button"
        className="aps-intro-skip"
        onClick={closeIntro}
        aria-label="Skip cinematic introduction"
      >
        SKIP INTRO
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
