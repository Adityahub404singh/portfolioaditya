import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Cpu,
  Github,
  Linkedin,
  Mail,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const PHOTO = "/images/profile-cutout-blackshirt.png";
const EASE = [0.22, 1, 0.36, 1];

/**
 * Hero = ONE canvas (reference aspect ratio). Everything inside uses % / cqw,
 * so it scales as a unit at any window size or zoom.
 *
 * Upgrades vs. previous version:
 *  - Rings resized to match the reference (small head ring + big shoulder ring)
 *  - Smoky grey edge vignette + film grain (reference has foggy edges)
 *  - Red aura / rim-light behind the portrait + floor glow
 *  - Mouse parallax (springs, per-layer depth) + soft cursor spotlight
 *  - One orchestrated page-load sequence (word -> portrait -> copy -> chips)
 *  - Idle float on chips, bobbing scroll button
 *  - Hero never taller than the viewport (no more cropped portrait on laptops)
 *  - All motion respects `enabled` (your "Motion ON/OFF" toggle),
 *    prefers-reduced-motion, and touch devices
 */
export default function HeroSection({
  name = "Developer",
  role = "Developer • Builder • Problem Solver",
  intro = "",
  github = "",
  linkedin = "",
  leetcode = "",
  email = "",
  enabled = true,
  onExplore,
  onDiscover,
}) {
  const ref = useRef(null);

  /* ---------- scroll parallax ---------- */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const wordY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  /* ---------- pointer parallax ---------- */
  const mx = useMotionValue(0); // -0.5 .. 0.5
  const my = useMotionValue(0);
  const spot = { x: useMotionValue(-999), y: useMotionValue(-999) };
  const spring = { stiffness: 70, damping: 18, mass: 0.6 };
  const smx = useSpring(mx, spring);
  const smy = useSpring(my, spring);
  const sx = useSpring(spot.x, { stiffness: 120, damping: 24 });
  const sy = useSpring(spot.y, { stiffness: 120, damping: 24 });

  const wordX = useTransform(smx, [-0.5, 0.5], [14, -14]);
  const ringX = useTransform(smx, [-0.5, 0.5], [8, -8]);
  const ringY = useTransform(smy, [-0.5, 0.5], [6, -6]);
  const photoX = useTransform(smx, [-0.5, 0.5], [-16, 16]);
  const chipX = useTransform(smx, [-0.5, 0.5], [-26, 26]);
  const chipY = useTransform(smy, [-0.5, 0.5], [-14, 14]);

  const onMove = (e) => {
    if (!enabled || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    spot.x.set(e.clientX - r.left);
    spot.y.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    spot.x.set(-999);
    spot.y.set(-999);
  };

  /* ---------- entrance helper (single orchestrated load) ---------- */
  const enter = (delay = 0, y = 22) =>
    enabled
      ? {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        }
      : {};

  const words = name.trim().split(/\s+/);
  const first = words[0] || "Developer";
  const rest = words.slice(1);

  const parallaxStyle = (x, y) => (enabled ? { x, ...(y ? { y } : {}) } : undefined);

  return (
    <section
      className="aps-hx"
      id="top"
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <style>{CSS}</style>
      <div className="aps-hx-bg" aria-hidden="true" />
      <div className="aps-hx-smoke" aria-hidden="true" />
      {enabled && (
        <motion.div className="aps-hx-spot" style={{ x: sx, y: sy }} aria-hidden="true" />
      )}

      <div className="aps-hx-canvas">
        {/* ---------- stage: word, rings, portrait, chips ---------- */}
        <div className="aps-hx-stage">
          <motion.div
            className="aps-hx-word"
            style={enabled ? { y: wordY, x: wordX } : undefined}
            {...(enabled
              ? {
                  initial: { opacity: 0, scale: 1.05 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 1.2, ease: EASE },
                }
              : {})}
            aria-hidden="true"
          >
            <svg viewBox="0 0 1672 866" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="apsHxWordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff3135" />
                  <stop offset=".48" stopColor="#cf121c" />
                  <stop offset="1" stopColor="#3a050a" />
                </linearGradient>
              </defs>
              <text
                x="330"
                y="505"
                textLength="1305"
                lengthAdjust="spacingAndGlyphs"
                fontSize="430"
                fill="url(#apsHxWordGrad)"
              >
                PORTFOLIO
              </text>
            </svg>
          </motion.div>

          {/* rings + plus marks drift together */}
          <motion.div className="aps-hx-rings" style={parallaxStyle(ringX, ringY)} aria-hidden="true">
            <div className="aps-hx-ring aps-hx-ring-a" />
            <div className="aps-hx-ring aps-hx-ring-b" />
            <span className="aps-hx-plus" style={{ left: "79.5%", top: "12.7%" }}>+</span>
            <span className="aps-hx-plus aps-hx-plus-2" style={{ left: "51.7%", top: "35.3%" }}>+</span>
            <span className="aps-hx-plus aps-hx-plus-3" style={{ left: "44.1%", top: "69.8%" }}>+</span>
          </motion.div>

          {/* red aura + floor glow behind the portrait */}
          <div className="aps-hx-aura" aria-hidden="true" />

          <motion.div
            className="aps-hx-photo"
            style={enabled ? { y: photoY, x: photoX } : undefined}
            {...(enabled
              ? {
                  initial: { opacity: 0, scale: 0.96 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 1, delay: 0.25, ease: EASE },
                }
              : {})}
          >
            <img
              src={PHOTO}
              alt={`${name} portrait`}
              loading="eager"
              decoding="async"
              fetchpriority="high"
              draggable="false"
            />
          </motion.div>

          <motion.div className="aps-hx-pill aps-hx-pill-top" {...enter(0.7, 10)}>
            APS <i>/</i> 2026
          </motion.div>

          <motion.div
            className="aps-hx-chip aps-hx-chip-build"
            style={parallaxStyle(chipX, chipY)}
            {...(enabled
              ? {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.6, delay: 0.85, ease: EASE },
                }
              : {})}
          >
            <small>BUILD / 001</small>
            <strong><Code2 /> Developer</strong>
          </motion.div>
          <motion.div
            className="aps-hx-chip aps-hx-chip-focus"
            style={parallaxStyle(chipX, chipY)}
            {...(enabled
              ? {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.6, delay: 1, ease: EASE },
                }
              : {})}
          >
            <small>FOCUS / 002</small>
            <strong><Cpu /> Technology</strong>
          </motion.div>
          <motion.div
            className="aps-hx-chip aps-hx-chip-status"
            style={parallaxStyle(chipX, chipY)}
            {...(enabled
              ? {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.6, delay: 1.15, ease: EASE },
                }
              : {})}
          >
            <small>STATUS / 003</small>
            <strong><Zap /> Always learning</strong>
          </motion.div>

          <motion.div className="aps-hx-pill aps-hx-pill-caption" {...enter(1.2, 10)}>
            <span className="aps-hx-dot" /> PERSONAL PORTFOLIO / PROFILE
          </motion.div>
        </div>

        {/* ---------- copy ---------- */}
        <div className="aps-hx-copy">
          <motion.p className="aps-hx-kicker" {...enter(0.1, 12)}>
            COMPUTER SCIENCE ENGINEER
            <small>DEVELOPER / BUILDER / PROBLEM SOLVER</small>
          </motion.p>
          <motion.p className="aps-hx-eyebrow" {...enter(0.18, 12)}>
            <i /> PORTFOLIO / {new Date().getFullYear()}
          </motion.p>
          <motion.p className="aps-hx-hello" {...enter(0.26)}>Hello, I’m</motion.p>

          <h1 className="aps-hx-title" aria-label={name}>
            <motion.span className="aps-hx-first" {...enter(0.34, 36)}>{first}</motion.span>
            {rest.map((part, i) => (
              <motion.span className="aps-hx-red" key={part + i} {...enter(0.44 + i * 0.1, 36)}>
                {part}
                {i === rest.length - 1 ? "." : ""}
              </motion.span>
            ))}
          </h1>

          <motion.p className="aps-hx-role" {...enter(0.7)}>{role}</motion.p>
          <motion.p className="aps-hx-intro" {...enter(0.78)}>
            {intro ||
              "I’m a Computer Science Engineering student who enjoys building real-world web applications, solving problems and exploring AI/ML-driven solutions."}
          </motion.p>

          <motion.div className="aps-hx-actions" {...enter(0.88)}>
            <button type="button" className="aps-hx-btn aps-hx-btn-primary" onClick={onExplore}>
              Explore my work <ArrowRight />
            </button>
            <Link className="aps-hx-btn aps-hx-btn-ghost" to="/contact">
              Let’s connect <Mail />
            </Link>
          </motion.div>

          <motion.div className="aps-hx-socials" {...enter(0.98)}>
            {github && <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github /></a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin /></a>}
            {leetcode && <a href={leetcode} target="_blank" rel="noopener noreferrer" aria-label="LeetCode"><Code2 /></a>}
            {email && <a href={`mailto:${email}`} aria-label="Email"><Mail /></a>}
          </motion.div>
        </div>

        <div className="aps-hx-arc" aria-hidden="true" />
        <button type="button" className="aps-hx-down" onClick={onDiscover} aria-label="Scroll to next section">
          <ChevronDown />
        </button>
      </div>
    </section>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;700;800;900&family=Instrument+Serif:ital@1&display=swap');

.aps-hx {
  --red: #ff2a2f;
  --nav: 76px; /* height of your fixed navbar */
  position: relative; z-index: 1; isolation: isolate; overflow: hidden;
  background: #060608; color: #fff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
.aps-hx *, .aps-hx *::before, .aps-hx *::after { box-sizing: border-box; }
.aps-hx a { color: inherit; text-decoration: none; }
:where(.aps-hx) p, :where(.aps-hx) h1 { margin: 0; }
.aps-hx svg { flex: 0 0 auto; }
.aps-hx :focus-visible { outline: 2px solid #ff8a90; outline-offset: 4px; }

/* ----- background: red bloom behind portrait + soft grid ----- */
.aps-hx-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 44% 66% at 65% 55%, rgba(255,32,40,.38), transparent 72%),
    radial-gradient(ellipse 30% 46% at 6% 30%, rgba(180,180,180,.2), transparent 70%),
    linear-gradient(180deg, #0b0b0e, #050506);
}
.aps-hx-bg::after {
  content: ""; position: absolute; inset: 0; opacity: .13;
  background-image: linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 62% 50%, #000, transparent 75%);
}

/* ----- smoky grey edges (reference) + film grain ----- */
.aps-hx-smoke {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse 22% 38% at 0% 18%, rgba(190,190,190,.34), transparent 70%),
    radial-gradient(ellipse 18% 30% at 0% 88%, rgba(150,150,150,.28), transparent 70%),
    radial-gradient(ellipse 26% 20% at 12% 0%, rgba(210,210,210,.22), transparent 70%),
    radial-gradient(ellipse 14% 40% at 100% 22%, rgba(170,170,170,.22), transparent 70%),
    radial-gradient(ellipse 20% 26% at 100% 100%, rgba(140,140,140,.2), transparent 70%);
  filter: blur(14px);
  animation: aps-hx-drift 18s ease-in-out infinite alternate;
}
.aps-hx-smoke::after {
  content: ""; position: absolute; inset: -14px; opacity: .08; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
@keyframes aps-hx-drift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-1.2%, .8%, 0) scale(1.03); } }

/* cursor spotlight */
.aps-hx-spot {
  position: absolute; left: 0; top: 0; z-index: 1; width: 520px; height: 520px; margin: -260px 0 0 -260px;
  border-radius: 50%; pointer-events: none; mix-blend-mode: screen;
  background: radial-gradient(circle, rgba(255,42,47,.2), transparent 65%);
}
@media (hover: none) { .aps-hx-spot { display: none; } }

/* ===== canvas: everything below scales with its width ===== */
/* never taller than the viewport (minus navbar), never narrower than 980px */
.aps-hx-canvas {
  position: relative; z-index: 2; margin: 0 auto;
  width: 100%;
  max-width: 1760px;
  aspect-ratio: 1672 / 866; min-height: 0;
  container-type: inline-size;
}
/* only cap by height when the window is tall enough; on short windows keep full width
   (otherwise the px-minimum font sizes overflow the canvas and clip the buttons/socials) */
@media (min-height: 760px) and (min-width: 861px) {
  .aps-hx-canvas { width: max(min(100%, calc((100svh - var(--nav)) * 1.931)), min(100%, 1180px)); }
}
.aps-hx-stage { position: absolute; inset: 0; z-index: 2; }

/* giant word (behind portrait) */
.aps-hx-word { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.aps-hx-word svg {
  display: block; width: 100%; height: 100%; overflow: visible;
  font-family: Anton, Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  filter: drop-shadow(0 0 3cqw rgba(255,30,40,.3));
}

/* rings — sized from the reference: small ring around the head, big ring around the shoulders */
.aps-hx-rings { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.aps-hx-ring {
  position: absolute; border-radius: 50%; pointer-events: none;
  transform: translate(-50%, -50%); aspect-ratio: 1;
  border: 1.5px solid rgba(255,70,78,.8);
  box-shadow: 0 0 2cqw rgba(255,40,50,.4), inset 0 0 3cqw rgba(255,40,50,.14);
}
.aps-hx-ring-a { left: 64.8%; top: 37.5%; width: 35.5cqw; }
.aps-hx-ring-b { left: 62%;   top: 85%;   width: 46cqw; border-color: rgba(255,70,78,.38); box-shadow: 0 0 1.4cqw rgba(255,40,50,.18); }
.aps-hx-plus {
  position: absolute; z-index: 4; transform: translate(-50%, -50%);
  color: rgba(255,255,255,.85); font: 300 max(22px, 2cqw)/1 Inter, sans-serif;
  animation: aps-hx-twinkle 4.5s ease-in-out infinite;
}
.aps-hx-plus-2 { animation-delay: 1.4s; } .aps-hx-plus-3 { animation-delay: 2.8s; }
@keyframes aps-hx-twinkle { 0%,100% { opacity: .9; } 50% { opacity: .3; } }

/* aura: red rim-light behind the shoulders + glow on the floor */
.aps-hx-aura {
  position: absolute; z-index: 2; left: 64%; top: 40%; width: 46cqw; height: 60%;
  transform: translateX(-50%); pointer-events: none; border-radius: 50%;
  background: radial-gradient(ellipse at 50% 55%, rgba(255,35,45,.5), rgba(255,35,45,.12) 55%, transparent 72%);
  filter: blur(2.2cqw);
  animation: aps-hx-pulse 6s ease-in-out infinite;
}
@keyframes aps-hx-pulse { 0%,100% { opacity: .85; } 50% { opacity: 1; } }

/* portrait — real transparent PNG, edges feathered into the scene */
.aps-hx-photo {
  position: absolute; z-index: 3; left: 64%; top: 7%; height: 84%;
  translate: -50% 0; pointer-events: none;
}
.aps-hx-photo img {
  display: block; height: 100%; width: auto; max-width: none; user-select: none;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 90%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 90%, transparent 100%);
  filter:
    drop-shadow(0 0 2px rgba(255,95,100,.75))
    drop-shadow(0 0 1.2cqw rgba(255,45,55,.5))
    drop-shadow(0 0 3cqw rgba(255,35,45,.4))
    drop-shadow(0 1.5cqw 2cqw rgba(0,0,0,.55));
}

/* pills + chips */
.aps-hx-pill {
  position: absolute; z-index: 6; display: inline-flex; align-items: center; justify-content: center; gap: .7cqw;
  padding: .75cqw 1.3cqw; border: 1px solid rgba(255,255,255,.22); border-radius: 999px;
  background: rgba(10,10,13,.74); backdrop-filter: blur(14px);
  font-size: max(9px, .8cqw); font-weight: 700; letter-spacing: .12em; white-space: nowrap;
}
.aps-hx-pill i { color: var(--red); font-style: normal; margin: 0 .15cqw; }
.aps-hx-pill-top { left: 43.2%; top: 8.1%; width: 8.9cqw; padding: 0; height: 5.2%; min-height: 28px; border-radius: .7cqw; font-size: max(11px, 1cqw); letter-spacing: .16em; }
.aps-hx-pill-caption { left: 53.9%; top: 79.9%; width: 20cqw; height: 5.1%; min-height: 28px; padding: 0 1cqw; }
.aps-hx-dot { width: .65cqw; height: .65cqw; min-width: 7px; min-height: 7px; border-radius: 50%; background: #22d37a; box-shadow: 0 0 .8cqw #22d37a; animation: aps-hx-blink 2.2s ease-in-out infinite; }
@keyframes aps-hx-blink { 0%,100% { opacity: 1; } 50% { opacity: .45; } }

.aps-hx-chip {
  position: absolute; z-index: 6; padding: .9cqw 1.15cqw;
  border: 1px solid rgba(255,90,100,.4); border-radius: .75cqw;
  background: rgba(10,10,13,.8); backdrop-filter: blur(16px);
  box-shadow: 0 0 2cqw rgba(255,40,50,.14), 0 1cqw 2.6cqw rgba(0,0,0,.4);
  animation: aps-hx-float 7s ease-in-out infinite;  /* uses the separate CSS "translate" prop, so it never fights framer's transform */
}
.aps-hx-chip-focus  { animation-delay: -2.3s; }
.aps-hx-chip-status { animation-delay: -4.6s; }
@keyframes aps-hx-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -.55cqw; } }
.aps-hx-chip small { display: block; margin-bottom: .6cqw; color: #a7a0a1; font-size: max(8px, .72cqw); letter-spacing: .2em; }
.aps-hx-chip strong { display: flex; align-items: center; gap: .6cqw; font-size: max(11px, 1.15cqw); white-space: nowrap; }
.aps-hx-chip svg { width: max(13px, 1.25cqw); height: max(13px, 1.25cqw); color: var(--red); }
.aps-hx-chip-build  { left: 84.4%; top: 10.4%; width: 12.6cqw; }
.aps-hx-chip-focus  { left: 36.9%; top: 54.7%; width: 10.8cqw; }
.aps-hx-chip-status { left: 83.3%; top: 64.7%; width: 12.9cqw; }

/* ===== copy ===== */
.aps-hx-copy {
  position: absolute; z-index: 5; left: 4.8cqw; top: 0; width: 36cqw;
  padding-top: 2.4cqw;
}
.aps-hx-kicker { font-size: max(10px, .9cqw); font-weight: 700; letter-spacing: .2em; color: #ebe6e6; line-height: 1.4; }
.aps-hx-kicker small { display: block; margin-top: .35cqw; color: #8b8586; font-size: max(9px, .8cqw); font-weight: 500; letter-spacing: .16em; }
.aps-hx-eyebrow { display: flex; align-items: center; gap: .9cqw; margin-top: max(22px, 2.3cqw); color: var(--red); font-size: max(10px, .9cqw); font-weight: 800; letter-spacing: .22em; }
.aps-hx-eyebrow i { width: 2.6cqw; height: 2px; background: var(--red); }
.aps-hx-hello { margin-top: max(14px, 1.5cqw); font: italic 400 max(26px, 2.35cqw)/1 "Instrument Serif", Georgia, serif; color: #ddd6d6; }
.aps-hx-title {
  display: flex; flex-direction: column; margin-top: .6cqw;
  font-weight: 900; text-transform: uppercase; font-size: max(44px, 5.95cqw);
  line-height: .93; letter-spacing: -.035em; text-shadow: 0 1cqw 3cqw rgba(0,0,0,.6);
}
.aps-hx-first { color: #fff; }
.aps-hx-red { color: var(--red); text-shadow: 0 0 2.5cqw rgba(255,30,40,.4); }
.aps-hx-role { margin-top: max(16px, 1.5cqw); font-size: max(14px, 1.33cqw); font-weight: 700; }
.aps-hx-intro { margin-top: max(8px, .8cqw); max-width: 28cqw; color: #cfc8c8; font-size: max(12px, 1cqw); line-height: 1.6; text-shadow: 0 2px 16px rgba(0,0,0,.8); }
.aps-hx-actions { display: flex; flex-wrap: wrap; gap: .9cqw; margin-top: max(18px, 1.9cqw); }
.aps-hx-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .8cqw;
  min-height: max(38px, 3.3cqw); padding: 0 max(16px, 1.7cqw); border-radius: 6px; border: 1px solid transparent;
  font: 700 max(12px, 1.12cqw)/1 Inter, sans-serif; cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
}
.aps-hx-btn svg { width: max(14px, 1.15cqw); height: max(14px, 1.15cqw); transition: transform .2s ease; }
.aps-hx-btn:hover { transform: translateY(-2px); }
.aps-hx-btn:hover svg { transform: translateX(3px); }
.aps-hx-btn:active { transform: translateY(0) scale(.98); }
.aps-hx-btn-primary { color: #fff; background: linear-gradient(180deg, #ff2f35, #d3141d); box-shadow: 0 .6cqw 1.8cqw rgba(255,35,45,.38); }
.aps-hx-btn-primary:hover { box-shadow: 0 .8cqw 2.4cqw rgba(255,35,45,.55); }
.aps-hx-btn-ghost { color: #fff; background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.28); backdrop-filter: blur(10px); }
.aps-hx-btn-ghost:hover { border-color: var(--red); background: rgba(255,42,47,.1); }
.aps-hx-socials { display: flex; gap: .85cqw; margin-top: max(14px, 1.6cqw); }
.aps-hx-socials a {
  width: max(34px, 3.1cqw); height: max(34px, 3.1cqw); display: grid; place-items: center; border-radius: 50%;
  border: 1px solid rgba(255,70,78,.5); background: rgba(10,10,13,.6); transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
}
.aps-hx-socials a svg { width: max(15px, 1.2cqw); height: max(15px, 1.2cqw); }
.aps-hx-socials a:hover { background: var(--red); transform: translateY(-3px); box-shadow: 0 0 1.6cqw rgba(255,42,47,.5); }

/* bottom arc + scroll button */
.aps-hx-arc {
  position: absolute; z-index: 4; left: 50%; top: 87%; width: 128%; height: 60%;
  transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  border-top: 2px solid #ff3036;
  box-shadow: 0 -.5cqw 2.4cqw rgba(255,40,50,.65), inset 0 1.5cqw 4cqw rgba(255,40,50,.24);
}
.aps-hx-down {
  position: absolute; z-index: 7; left: 50%; top: 92.6%; transform: translate(-50%, -50%);
  width: max(44px, 3.7cqw); height: max(44px, 3.7cqw); display: grid; place-items: center; border-radius: 50%;
  border: 2px solid rgba(255,60,66,.8); color: #fff; background: rgba(10,10,13,.85); cursor: pointer;
  box-shadow: 0 0 2cqw rgba(255,40,50,.35); transition: box-shadow .2s ease, border-color .2s ease;
}
.aps-hx-down svg { width: 60%; height: 60%; animation: aps-hx-bob 2s ease-in-out infinite; }
.aps-hx-down:hover { border-color: #ff8a90; box-shadow: 0 0 2.6cqw rgba(255,40,50,.6); }
@keyframes aps-hx-bob { 0%,100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }

/* ===== mobile / small tablet: copy first, portrait stage below ===== */
@media (max-width: 860px) {
  .aps-hx-canvas { width: 100%; aspect-ratio: auto; min-height: 0; display: flex; flex-direction: column; container-type: normal; }
  .aps-hx-copy { position: relative; left: auto; top: auto; width: 90%; margin: 0 auto; padding: 28px 0 8px; order: 1; }
  .aps-hx-kicker { font-size: 11px; } .aps-hx-kicker small { font-size: 10px; }
  .aps-hx-eyebrow { margin-top: 22px; font-size: 11px; } .aps-hx-eyebrow i { width: 30px; }
  .aps-hx-hello { margin-top: 14px; font-size: 28px; }
  .aps-hx-title { font-size: clamp(52px, 17vw, 88px); margin-top: 6px; }
  .aps-hx-role { margin-top: 16px; font-size: 16px; }
  .aps-hx-intro { margin-top: 10px; max-width: 100%; font-size: 14px; }
  .aps-hx-actions { gap: 10px; margin-top: 22px; }
  .aps-hx-btn { min-height: 48px; padding: 0 20px; font-size: 14px; gap: 10px; }
  .aps-hx-btn svg { width: 16px; height: 16px; }
  .aps-hx-socials { gap: 10px; margin-top: 18px; }
  .aps-hx-socials a { width: 44px; height: 44px; } .aps-hx-socials a svg { width: 18px; height: 18px; }

  .aps-hx-stage { position: relative; inset: auto; order: 2; width: 100%; height: 118vw; max-height: 640px; overflow: hidden; }
  .aps-hx-word { inset: auto; left: -42%; top: 8%; width: 184%; height: auto; }
  .aps-hx-word svg { height: auto; aspect-ratio: 1672 / 866; filter: none; }
  .aps-hx-photo { left: 50%; top: 5%; height: 90%; }
  .aps-hx-aura { left: 50%; top: 35%; width: 90vw; height: 65%; filter: blur(24px); }
  .aps-hx-ring { left: 50%; }
  .aps-hx-ring-a { top: 48%; width: 82vw; } .aps-hx-ring-b { top: 82%; width: 118vw; }
  .aps-hx-plus { display: none; }
  .aps-hx-pill { padding: 0 12px; font-size: 10px; gap: 8px; }
  .aps-hx-pill-top { left: 5%; top: 5%; width: auto; height: 32px; padding: 0 14px; border-radius: 8px; font-size: 12px; }
  .aps-hx-pill-caption { left: 50%; top: auto; bottom: 17%; transform: translateX(-50%); width: auto; height: 32px; }
  .aps-hx-dot { width: 8px; height: 8px; }
  .aps-hx-chip { padding: 9px 11px; border-radius: 9px; }
  .aps-hx-chip small { font-size: 8px; margin-bottom: 5px; } .aps-hx-chip strong { font-size: 12px; gap: 6px; }
  .aps-hx-chip svg { width: 14px; height: 14px; }
  .aps-hx-chip-build  { left: auto; right: 3%; top: 9%; width: auto; }
  .aps-hx-chip-focus  { left: 3%; top: 52%; width: auto; }
  .aps-hx-chip-status { left: auto; right: 3%; top: 66%; width: auto; }
  @keyframes aps-hx-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -5px; } }
  .aps-hx-arc { top: auto; bottom: -28vw; height: 40vw; width: 130%; }
  .aps-hx-down { top: auto; bottom: 16px; transform: translateX(-50%); width: 48px; height: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .aps-hx *, .aps-hx *::before, .aps-hx *::after { transition-duration: .01ms !important; animation: none !important; }
}
`;
