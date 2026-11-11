
import { useEffect, useRef } from "react";
import { useMotionPreference } from "../../hooks/MotionPreference";
import "./cursor-swarm.css";

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

const TAU = Math.PI * 2;

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const noise = (n) => {
  const value =
    Math.sin((n + 1) * 127.1 + 311.7) * 43758.5453;

  return value - Math.floor(value);
};

function agentCount(width, cores, memory) {
  let count =
    width < 600 ? 24 :
    width < 900 ? 50 :
    width < 1440 ? 100 : 150;

  if (cores && cores <= 4) {
    count = Math.min(count, 50);
  }

  if (memory && memory <= 4) {
    count = Math.min(count, 64);
  }

  return count;
}

function makeAgents(count, width, height) {
  const perTeam = Math.ceil(count / 10);

  return Array.from({ length: count }, (_, index) => {
    const angle = noise(index * 7) * TAU;

    const radius =
      25 + noise(index * 11) * Math.min(width, height) * 0.38;

    const team = Math.min(
      9,
      Math.floor(index / perTeam)
    );

    const member = index - team * perTeam;

    return {
      x: width * 0.5 + Math.cos(angle) * radius,
      y: height * 0.5 + Math.sin(angle) * radius,

      vx: 0,
      vy: 0,

      phase: noise(index * 13) * TAU,

      team,
      member,
      seed: index,

      color: COLORS[team],

      size:
        member === 0
          ? 18
          : 12 + noise(index * 19) * 3,

      alpha: 0.48 + noise(index * 23) * 0.3,

      leader: member === 0,

      trail:
        member < Math.max(2, Math.ceil(perTeam * 0.25)),
    };
  });
}

function pointerPath(ctx) {
  ctx.beginPath();

  ctx.moveTo(1, 1);
  ctx.lineTo(1, 20);
  ctx.lineTo(6.2, 15.1);
  ctx.lineTo(10.1, 22.5);
  ctx.lineTo(13.2, 20.9);
  ctx.lineTo(9.3, 13.7);
  ctx.lineTo(17.1, 13.4);

  ctx.closePath();
}

function drawAgent(ctx, agent, now) {
  const pulse =
    1 + Math.sin(now * 0.0014 + agent.phase) * 0.025;

  const size = agent.size * pulse;

  ctx.save();

  ctx.translate(agent.x, agent.y);
  ctx.scale(size / 24, size / 24);

  ctx.globalAlpha = agent.alpha;

  // Saturated glow keeps the original team colours visible on dark sections.
  ctx.shadowColor = agent.color;
  ctx.shadowBlur = agent.leader ? 13 : 7;

  pointerPath(ctx);

  ctx.fillStyle = agent.color;
  ctx.fill();

  // Dark outer contour adds definition over both dark backgrounds and photos.
  ctx.shadowBlur = 0;
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = "rgba(3, 6, 14, 0.96)";
  ctx.stroke();

  // A restrained highlight preserves the original crisp arrow identity.
  ctx.lineWidth = 0.75;
  ctx.strokeStyle = "rgba(255,255,255,0.68)";
  ctx.stroke();

  ctx.restore();
}

/* =========================================================
   SCENE DISCOVERY
   ========================================================= */

const SCENE_SELECTORS = [
  "#top, .aps-hero",
  "#aps-about, .about-layout",
  "#aps-skills, .aps-toolkit-section, .skills-section",
  "#aps-projects, .projects-featured-section, .projects-archive-section",
  "#aps-dsa, #aps-achievements, #aps-journey, .journey-premium",
  "#aps-contact, .aps-cta, .contact-page",
  ".page-section",
];

const TARGET_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "p",
  "img",
  ".portrait-orbit",
  ".hero-vignette",
  ".hero-bg-photo",
  ".portrait-glow",
  ".aps-project-card",
  ".project-card",
  ".skill-card",
  ".aps-skill-card",
  ".stat-card",
  ".aps-stat-card",
  ".aps-toolkit-card",
  "a[class]",
  "button",
].join(",");

function isVisible(element, viewportHeight) {
  const rect = element.getBoundingClientRect();

  const style = getComputedStyle(element);

  return (
    rect.width > 24 &&
    rect.height > 16 &&
    rect.bottom > 0 &&
    rect.top < viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) > 0
  );
}

function collectScenes() {
  const elements = new Set();

  SCENE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!element.closest(".admin-app")) {
        elements.add(element);
      }
    });
  });

  return [...elements]
    .map((element) => {
      const heading =
        element.querySelector("h1, h2, h3, .aps-hero-title") ||
        element;

      const targets = [
        ...new Set([
          heading,
          ...element.querySelectorAll(TARGET_SELECTOR),
        ]),
      ].slice(0, 20);

      return {
        element,
        heading,
        targets,
      };
    })
    .sort((a, b) => {
      const topA =
        a.element.getBoundingClientRect().top + window.scrollY;

      const topB =
        b.element.getBoundingClientRect().top + window.scrollY;

      return topA - topB;
    });
}

/* =========================================================
   COMPACT TEAM TARGETS
   ========================================================= */

function getTeamTargets(scene, width, height, now) {
  if (!scene) return [];

  const visibleTargets = scene.targets.filter((element) =>
    isVisible(element, height)
  );

  if (!visibleTargets.length) return [];

  const targets = [];

  for (let team = 0; team < 10; team++) {
    const targetIndex = Math.min(
      visibleTargets.length - 1,
      Math.floor(
        (team * visibleTargets.length) / 10
      )
    );

    const element = visibleTargets[targetIndex];

    const rect = element.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    /*
      Compact formations:
      Never let very wide paragraphs or large images
      create huge particle formations.
    */

    const baseRadiusX = clamp(rect.width * 0.12, 30, 76);
    const baseRadiusY = clamp(rect.height * 0.18, 24, 58);

    const radiusX = Math.min(
      rect.width / 2 + 20,
      baseRadiusX + 18
    );

    const radiusY = Math.min(
      rect.height / 2 + 18,
      baseRadiusY + 14
    );

    const phase = team * 0.37 + now * 0.00012;

    targets.push({
      x: clamp(
        centerX + Math.cos(phase) * 3,
        12,
        width - 12
      ),

      y: clamp(
        centerY + Math.sin(phase) * 3,
        12,
        height - 12
      ),

      radiusX,
      radiusY,
    });
  }

  return targets;
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function CursorSwarm() {
  const canvasRef = useRef(null);

  const { enabled } = useMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !enabled) return undefined;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let raf = 0;
    let lastTime = 0;

    let agents = [];
    let scenes = [];
    let activeScene = 0;

    let teamTargets = [];
    let ripples = [];

    let dirty = true;
    let visible = !document.hidden;

    const pointer = {
      x: -1000,
      y: -1000,
      rawX: -1000,
      rawY: -1000,
      vx: 0,
      vy: 0,
      speed: 0,
      acceleration: 0,
      dirX: 0,
      dirY: 0,
      active: false,
      movedAt: 0,
      lastEventAt: 0,
    };

    const reactiveElements = new Set();
    const elementMotion = new WeakMap();

    /* Discover page sections */

    const refreshScenes = () => {
      scenes = collectScenes();
      dirty = true;
    };

    /* Canvas resize */

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = agentCount(
        width,
        navigator.hardwareConcurrency || 8,
        navigator.deviceMemory || 8
      );

      agents = makeAgents(count, width, height);

      refreshScenes();
    };

    /* Select active page scene */

    const updateScene = () => {
      if (!scenes.length) {
        refreshScenes();
      }

      const referenceY = height * 0.46;

      let nearest = 0;
      let nearestDistance = Infinity;

      scenes.forEach((scene, index) => {
        const rect = scene.element.getBoundingClientRect();

        const centerY =
          rect.top + Math.min(rect.height * 0.32, height * 0.55);

        const distance = Math.abs(centerY - referenceY);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }

        const headingRect = scene.heading.getBoundingClientRect();

        if (headingRect.width && headingRect.height) {
          scene.heading.classList.add("aps-story-heading");

          const progress = clamp(
            (height * 0.88 - headingRect.top) / (height * 0.7),
            0,
            1
          );

          scene.heading.style.setProperty(
            "--aps-delivery-progress",
            String(progress)
          );
        }
      });

      activeScene = nearest;
      dirty = false;
    };

    /* Pointer events */

    const onScroll = () => {
      dirty = true;
    };

    const onPointerMove = (event) => {
      if (event.pointerType === "touch" && width > 700) {
        // Touch devices use a short-lived force field, not a sticky cursor.
      }

      const now = performance.now();
      const elapsed = pointer.lastEventAt
        ? clamp(now - pointer.lastEventAt, 8, 48) / 1000
        : 1 / 60;

      const nextX = event.clientX;
      const nextY = event.clientY;

      if (!pointer.lastEventAt) {
        pointer.x = nextX;
        pointer.y = nextY;
        pointer.rawX = nextX;
        pointer.rawY = nextY;
        pointer.lastEventAt = now;
        pointer.movedAt = now;
        pointer.active = true;
        pointer.speed = 0;
        return;
      }

      if (pointer.lastEventAt) {
        const instantVX = (nextX - pointer.rawX) / elapsed;
        const instantVY = (nextY - pointer.rawY) / elapsed;
        const instantSpeed = Math.hypot(instantVX, instantVY);
        const blend = 0.68;

        pointer.vx += (instantVX - pointer.vx) * blend;
        pointer.vy += (instantVY - pointer.vy) * blend;
        pointer.acceleration +=
          (Math.abs(instantSpeed - pointer.speed) / elapsed -
            pointer.acceleration) * 0.2;

        if (instantSpeed > 8) {
          pointer.dirX = instantVX / (instantSpeed || 1);
          pointer.dirY = instantVY / (instantSpeed || 1);
        }
      }

      pointer.rawX = nextX;
      pointer.rawY = nextY;
      pointer.lastEventAt = now;
      pointer.movedAt = now;
      pointer.speed = Math.hypot(pointer.vx, pointer.vy);
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onClick = (event) => {
      if (ripples.length >= 7) {
        ripples.shift();
      }

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        radius: 2,
        life: 1,
      });
    };

    /* Tab visibility */

    const onVisibility = () => {
      visible = !document.hidden;

      if (visible && !raf) {
        lastTime = 0;
        raf = requestAnimationFrame(render);
      }
    };

    /* =====================================================
       CURSOR-DRIVEN DOM ENVIRONMENT
       ===================================================== */

    const updateElementReactivity = (scene, dt) => {
      if (!scene) return;

      const radius = 420;
      const nextElements = new Set(
        scene.targets.slice(0, 18).filter((element) =>
          isVisible(element, height)
        )
      );

      for (const element of reactiveElements) {
        if (!nextElements.has(element)) {
          element.classList.remove("aps-cursor-reactive");
          element.style.removeProperty("--aps-cursor-shift-x");
          element.style.removeProperty("--aps-cursor-shift-y");
          element.style.removeProperty("--aps-cursor-tilt");
          element.style.removeProperty("--aps-cursor-depth");
          reactiveElements.delete(element);
        }
      }

      for (const element of nextElements) {
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const distance = Math.hypot(dx, dy);
        const proximity = pointer.active
          ? Math.pow(clamp(1 - distance / radius, 0, 1), 2)
          : 0;

        const isImage = element.matches("img");
        const isCard = element.matches(
          ".aps-project-card,.project-card,.skill-card,.aps-skill-card,.stat-card,.aps-stat-card,.aps-toolkit-card"
        );
        const strength = isCard ? 1 : isImage ? 0.82 : 0.48;

        // A small directional lift follows the cursor's velocity field.
        const flow = clamp(pointer.speed / 650, 0, 1);
        const awayX = distance > 1 ? dx / distance : 0;
        const awayY = distance > 1 ? dy / distance : 0;
        const shiftX =
          proximity * strength *
          clamp(awayX * 20 + pointer.dirX * flow * 19, -30, 30);
        const shiftY =
          proximity * strength *
          clamp(awayY * 18 + pointer.dirY * flow * 16, -26, 26);
        const tilt =
          proximity * strength *
          clamp((pointer.dirX * awayY - pointer.dirY * awayX) * flow * 4.8, -4.8, 4.8);

        let motion = elementMotion.get(element);
        if (!motion) {
          motion = { x: 0, y: 0, tilt: 0, depth: 0 };
          elementMotion.set(element, motion);
        }

        const easing = 1 - Math.pow(0.42, dt);
        motion.x += (shiftX - motion.x) * easing;
        motion.y += (shiftY - motion.y) * easing;
        motion.tilt += (tilt - motion.tilt) * easing;
        motion.depth += (proximity * strength - motion.depth) * easing;

        element.classList.add("aps-cursor-reactive");
        element.style.setProperty("--aps-cursor-shift-x", `${motion.x.toFixed(2)}px`);
        element.style.setProperty("--aps-cursor-shift-y", `${motion.y.toFixed(2)}px`);
        element.style.setProperty("--aps-cursor-tilt", `${motion.tilt.toFixed(3)}deg`);
        element.style.setProperty("--aps-cursor-depth", motion.depth.toFixed(3));
        reactiveElements.add(element);
      }
    };

    /* =====================================================
       RENDER LOOP
       ===================================================== */

    function render(now) {
      raf = 0;

      if (!visible) return;

      const dt = lastTime
        ? clamp(now - lastTime, 0, 34) / 16.67
        : 1;

      lastTime = now;

      // Smooth the real pointer independently from the rendered agents.
      if (pointer.active) {
        const pointerEase = 1 - Math.pow(0.35, dt);
        pointer.x += (pointer.rawX - pointer.x) * pointerEase;
        pointer.y += (pointer.rawY - pointer.y) * pointerEase;
      } else {
        pointer.vx *= Math.pow(0.76, dt);
        pointer.vy *= Math.pow(0.76, dt);
        pointer.acceleration *= Math.pow(0.78, dt);
        pointer.speed = Math.hypot(pointer.vx, pointer.vy);
        pointer.x += (pointer.rawX - pointer.x) * (1 - Math.pow(0.9, dt));
        pointer.y += (pointer.rawY - pointer.y) * (1 - Math.pow(0.9, dt));
      }

      if (dirty) {
        updateScene();
      }

      if (
        pointer.active &&
        now - pointer.movedAt > 1500
      ) {
        pointer.active = false;
      }

      context.clearRect(0, 0, width, height);

      const scene = scenes[activeScene];

      /*
        IMPORTANT PERFORMANCE FIX:
        Calculate DOM positions once per frame,
        not once per particle.
      */

      teamTargets = getTeamTargets(
        scene,
        width,
        height,
        now
      );

      updateElementReactivity(scene, dt);

      for (const agent of agents) {
        const target = teamTargets[agent.team];

        if (!target) continue;

        const memberCount = Math.ceil(agents.length / 10);

        const angle =
          (agent.member / memberCount) * TAU +
          agent.team * 0.37 +
          now * 0.00016;

        const ring = Math.floor(agent.member / 6);

        const radiusX =
          target.radiusX + ring * 7;

        const radiusY =
          target.radiusY + ring * 6;

        const tx =
          target.x + Math.cos(angle) * radiusX;

        const ty =
          target.y + Math.sin(angle) * radiusY;

        let ax =
          (tx - agent.x) *
          (agent.leader ? 0.0054 : 0.0040);

        let ay =
          (ty - agent.y) *
          (agent.leader ? 0.0054 : 0.0040);

        ax +=
          Math.sin(now * 0.00045 + agent.phase) * 0.006;

        ay +=
          Math.cos(now * 0.00042 + agent.phase) * 0.006;

        /* Direction-aware cursor force field: repel + wake + soft magnetic drift. */

        const pointerDX = agent.x - pointer.x;
        const pointerDY = agent.y - pointer.y;
        const pointerDistance2 =
          pointerDX * pointerDX + pointerDY * pointerDY;
        const influenceRadius = 420;

        if (pointer.active && pointerDistance2 < influenceRadius * influenceRadius) {
          const distance = Math.max(1, Math.sqrt(pointerDistance2));
          const falloff = Math.pow(
            clamp(1 - distance / influenceRadius, 0, 1),
            2
          );
          const nx = pointerDX / distance;
          const ny = pointerDY / distance;
          const intensity = clamp(
            pointer.speed / 610 + pointer.acceleration / 9500 * 0.32,
            0,
            1
          );
          const radial = (0.048 + intensity * 0.285) * falloff;
          const wake = intensity * falloff * 0.205;
          const tangentX = -ny;
          const tangentY = nx;

          // Cursor pushes nearby agents away; a directional wake bends their paths.
          ax += nx * radial + pointer.dirX * wake + tangentX * wake * 0.56;
          ay += ny * radial + pointer.dirY * wake + tangentY * wake * 0.56;

          // Gentle attraction at very low speed keeps the field organic, not sticky.
          if (intensity < 0.12 && falloff > 0.35) {
            const magnet = (0.006 * falloff) * (1 - intensity / 0.12);
            ax -= nx * magnet;
            ay -= ny * magnet;
          }
        }

        /* Physics */

        agent.vx =
          (agent.vx + ax * dt) *
          Math.pow(0.925, dt);

        agent.vy =
          (agent.vy + ay * dt) *
          Math.pow(0.925, dt);

        const maxSpeed = agent.leader ? 9.2 : 7.2;

        const speed = Math.hypot(
          agent.vx,
          agent.vy
        );

        if (speed > maxSpeed) {
          agent.vx =
            (agent.vx / speed) * maxSpeed;

          agent.vy =
            (agent.vy / speed) * maxSpeed;
        }

        agent.x = clamp(
          agent.x + agent.vx * dt,
          8,
          width - 8
        );

        agent.y = clamp(
          agent.y + agent.vy * dt,
          8,
          height - 8
        );

        agent.alpha = agent.leader ? 0.98 : 0.78;

        /* Trails */

        if (agent.trail && speed > 0.35) {
          context.save();

          context.beginPath();

          context.moveTo(
            agent.x - agent.vx * 13,
            agent.y - agent.vy * 13
          );

          context.lineTo(agent.x, agent.y);

          context.strokeStyle = agent.color;
          context.globalAlpha = 0.48;
          context.lineWidth = 1.1;

          context.stroke();

          context.restore();
        }

        drawAgent(context, agent, now);
      }

      /* Click ripples */

      for (const ripple of ripples) {
        ripple.radius += 3 * dt;

        ripple.life *= Math.pow(0.93, dt);

        context.beginPath();

        context.arc(
          ripple.x,
          ripple.y,
          ripple.radius,
          0,
          TAU
        );

        context.strokeStyle =
          `rgba(255,90,112,${ripple.life * 0.5})`;

        context.lineWidth = 1.3;

        context.stroke();
      }

      ripples = ripples.filter(
        (ripple) => ripple.life > 0.035
      );

      context.globalAlpha = 1;

      if (visible) {
        raf = requestAnimationFrame(render);
      }
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    resize();

    raf = requestAnimationFrame(render);

    const observer = new MutationObserver(() => {
      refreshScenes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", resize, {
      passive: true,
    });

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    window.addEventListener("pointerleave", onPointerLeave, {
      passive: true,
    });

    window.addEventListener("click", onClick, {
      passive: true,
    });

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    window.addEventListener(
      "load",
      refreshScenes,
      { once: true }
    );

    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }

      observer.disconnect();

      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("load", refreshScenes);

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );

      for (const element of reactiveElements) {
        element.classList.remove("aps-cursor-reactive");
        element.style.removeProperty("--aps-cursor-shift-x");
        element.style.removeProperty("--aps-cursor-shift-y");
        element.style.removeProperty("--aps-cursor-tilt");
        element.style.removeProperty("--aps-cursor-depth");
      }
      reactiveElements.clear();

      scenes.forEach(({ heading }) => {
        heading.classList.remove("aps-story-heading");

        heading.style.removeProperty(
          "--aps-delivery-progress"
        );
      });

      context.clearRect(0, 0, width, height);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="aps-cursor-swarm"
      aria-hidden="true"
    />
  );
}
