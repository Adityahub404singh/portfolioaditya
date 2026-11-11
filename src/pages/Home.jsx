import React, { useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Code2,
  Trophy,
  Award,
  Activity,
  Cpu,
  Database,
  Brain,
  Monitor,
  Terminal,
  Globe,
  GraduationCap,
  CalendarDays,
  Target,
  Flame,
  Sparkles,
  Layers3,
  ChevronDown,
  MoveUpRight,
  ShieldCheck,
  ImageOff,
  Eye,
  Zap,
  BriefcaseBusiness,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";
import SectionHeading from "../components/SectionHeading";
import { usePortfolio } from "../hooks/usePortfolio";
import { useMotionPreference } from "../hooks/MotionPreference";

const EASE = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const safeArray = (value) => (Array.isArray(value) ? value : []);
const textValue = (value) => (typeof value === "string" ? value.trim() : "");

function firstText(...values) {
  for (const value of values) {
    const normalized = textValue(value);
    if (normalized) return normalized;
  }
  return "";
}

function safeExternalUrl(value) {
  const raw = textValue(value);
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function safeImageUrl(value) {
  const raw = textValue(value);
  if (!raw) return "";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return safeExternalUrl(raw);
}

function entryKey(entry, index, prefix) {
  return entry?.id || entry?.slug || entry?.title || entry?.name || `${prefix}-${index}`;
}

function entryTitle(entry, fallback) {
  return firstText(entry?.title, entry?.name, entry?.role, entry?.topic, fallback);
}

function entryDescription(entry) {
  return firstText(
    entry?.description,
    entry?.details,
    entry?.content,
    entry?.note,
    entry?.summary
  );
}

function entryDate(entry) {
  return firstText(entry?.date, entry?.year, entry?.period, entry?.createdAt);
}

function normalizeSkill(skill) {
  if (typeof skill === "string") {
    return { name: textValue(skill), category: "Technology", level: null, detail: "" };
  }
  if (!skill || typeof skill !== "object") return null;

  const name = firstText(skill.name, skill.title, skill.label);
  if (!name) return null;

  const numericLevel = Number(skill.level);
  return {
    ...skill,
    name,
    category: firstText(skill.category, skill.group, "Technology"),
    level: Number.isFinite(numericLevel)
      ? Math.max(0, Math.min(100, numericLevel))
      : null,
    detail: firstText(skill.detail, skill.description),
  };
}

function normalizeEntry(entry, index, prefix, fallback) {
  if (!entry || typeof entry !== "object") return null;
  return {
    ...entry,
    id: entryKey(entry, index, prefix),
    title: entryTitle(entry, fallback),
    description: entryDescription(entry),
    date: entryDate(entry),
    url: safeExternalUrl(entry.url || entry.link || entry.certificateUrl || entry.href),
  };
}

function SectionLabel({ number, children }) {
  return (
    <div className="aps-section-label">
      <span>{number}</span>
      <i />
      {children}
    </div>
  );
}

function TiltSurface({ children, className = "", enabled = true }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 170, damping: 23, mass: 0.7 });
  const rotateY = useSpring(y, { stiffness: 170, damping: 23, mass: 0.7 });

  const onPointerMove = (event) => {
    if (!enabled || reduceMotion || event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    x.set((0.5 - py) * 7);
    y.set((px - 0.5) * 9);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={
        enabled && !reduceMotion
          ? { rotateX, rotateY, transformPerspective: 1100, transformStyle: "preserve-3d" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}

function ProfileStage({ profile, name, portraitStyle }) {
  const [failed, setFailed] = useState(false);
  // Transparent cutout supplied for the cinematic 3D hero.
  // Keep the admin-managed profile photo untouched for other pages.
  const photo = safeImageUrl(profile.photo || profile.profileImage || profile.avatar || profile.image || "/images/profile.jpg");

  return (
    <div className="aps-profile-stage" aria-label={`${name} profile photograph`}>
      <div className="aps-profile-stage-grid" />
      <div className="aps-stage-depth-grid" />
      <div className="aps-profile-orbit aps-orbit-a" />
      <div className="aps-profile-orbit aps-orbit-b" />
      <div className="aps-profile-orbit aps-orbit-c" />
      <div className="aps-orbit-core" />
      <div className="aps-orbit-particle aps-particle-one" />
      <div className="aps-orbit-particle aps-particle-two" />
      <div className="aps-orbit-particle aps-particle-three" />
      <motion.div className="aps-profile-photo-frame aps-profile-card-frame" style={portraitStyle}>
        {photo && !failed ? (
          <img
            className="aps-profile-card-image"
            src={photo}
            alt={`${name} standing with arms open`}
            loading="eager"
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="aps-profile-fallback">
            <span>{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
            <small>PROFILE IMAGE NOT AVAILABLE</small>
          </div>
        )}
      </motion.div>
      <div className="aps-photo-edge" />
      <div className="aps-photo-caption">
        <span className="aps-live-dot" />
        PERSONAL PORTFOLIO / PROFILE
      </div>
      <div className="aps-stage-chip aps-chip-top">
        <small>BUILD / 001</small>
        <strong><Code2 size={13} /> Developer</strong>
      </div>
      <div className="aps-stage-chip aps-chip-left">
        <small>FOCUS / 002</small>
        <strong><Cpu size={13} /> Technology</strong>
      </div>
      <div className="aps-stage-chip aps-chip-bottom">
        <small>STATUS / 003</small>
        <strong><Zap size={13} /> Always learning</strong>
      </div>
      <div className="aps-stage-index">APS<span> / 2026</span></div>
    </div>
  );
}

function getLiveWebsiteScreenshot(value) {
  const website = safeExternalUrl(value);
  if (!website) return "";

  const params = new URLSearchParams({
    url: website,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
  });

  return `https://api.microlink.io/?${params.toString()}`;
}

function ProjectArtwork({ project, index, liveUrl }) {
  const [failed, setFailed] = useState(false);
  const name = firstText(project.name, project.title, "Project");
  const isRobot = /fire\s*fighting|robot/i.test(name);
  const rawImage = safeImageUrl(project.image || project.imageUrl || project.thumbnail);

  // Use a screenshot generated from the actual deployed website whenever a
  // project has a live URL. This is a real site capture, not a mockup.
  const liveScreenshot = getLiveWebsiteScreenshot(liveUrl);
  const isKnownDuplicate = /\/(skillswap|ai-project|tutormitra)\.jpg(?:$|\?)/i.test(rawImage);
  const localImage = isRobot
    ? "/images/fire-robot.jpg"
    : (!isKnownDuplicate ? rawImage : "");
  const image = liveScreenshot || localImage;
  const showImage = Boolean(image) && !failed;

  const visualLabel = isRobot ? "HARDWARE BUILD" :
    /skillswap/i.test(name) ? "PEER LEARNING PLATFORM" :
    /automation/i.test(name) ? "AI AUTOMATION PRODUCT" :
    /tutormitra/i.test(name) ? "EDTECH CONCEPT" :
    /data/i.test(name) ? "DATA & MACHINE LEARNING" : "PROJECT CASE STUDY";

  return (
    <div className={`aps-project-art ${showImage ? "has-image" : "no-image"} ${liveUrl ? "is-live-preview" : ""}`}>
      {showImage ? (
        <img
          src={image}
          alt={liveUrl ? `${name} real live website screenshot` : `${name} project photograph`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`aps-project-artwork aps-artwork-${index % 5}`}>
          <div className="aps-art-grid" />
          <div className="aps-art-orbit" />
          <div className="aps-art-orbit second" />
          <div className="aps-art-number">{String(index + 1).padStart(2, "0")}</div>
          <div className="aps-art-center">
            {isRobot ? <Cpu size={34} /> : /ai|automation/i.test(name) ? <Brain size={34} /> : /tutor|education/i.test(name) ? <GraduationCap size={34} /> : /data/i.test(name) ? <Database size={34} /> : <Globe size={34} />}
            <span>{visualLabel}</span>
          </div>
          <small className="aps-art-disclaimer">
            {liveUrl ? "LIVE PREVIEW UNAVAILABLE · OPEN WEBSITE" : "PROJECT IDENTITY GRAPHIC · NO LIVE DEMO"}
          </small>
        </div>
      )}
      <div className="aps-project-art-overlay">
        <span className="aps-preview-kind">
          {liveUrl ? <><span className="aps-live-dot" /> LIVE WEBSITE CAPTURE</> : isRobot ? "ACTUAL HARDWARE PHOTO" : "PROJECT OVERVIEW"}
        </span>
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} live website`}>
            OPEN LIVE <ArrowUpRight size={14} />
          </a>
        )}
      </div>
      <div className="aps-project-art-footer">
        <span>PROJECT / {String(index + 1).padStart(2, "0")}</span>
        <span>{project.status || "IN DEVELOPMENT"}</span>
      </div>
    </div>
  );
}

function HomeProjectCard({ project, index, enabled }) {
  const name = firstText(project.name, project.title, "Untitled project");
  const category = firstText(project.category, project.type, "Development");
  const description = firstText(
    project.description,
    project.details,
    "Project details will be updated soon."
  );
  const stack = safeArray(project.stack || project.techStack || project.technologies)
    .filter((item) => typeof item === "string" && item.trim())
    .slice(0, 5);
  const liveUrl = safeExternalUrl(project.liveUrl || project.demoUrl || project.website);
  const githubUrl = safeExternalUrl(project.githubUrl || project.repoUrl || project.repositoryUrl);
  const githubProfile = (() => {
    if (!githubUrl) return false;
    try {
      return new URL(githubUrl).hostname.endsWith("github.com") &&
        new URL(githubUrl).pathname.split("/").filter(Boolean).length < 2;
    } catch {
      return false;
    }
  })();

  return (
    <TiltSurface className="aps-project-card" enabled={enabled}>
      <div className="aps-project-card-inner">
        <div className="aps-project-card-meta">
          <span><b>{String(index + 1).padStart(2, "0")}</b> / {category}</span>
          <span className={`aps-project-status ${liveUrl ? "is-live" : ""}`}>
            {liveUrl ? "LIVE" : project.status || "PROJECT"}
          </span>
        </div>
        <ProjectArtwork project={project} index={index} liveUrl={liveUrl} />
        <div className="aps-project-card-content">
          <div className="aps-project-title-row">
            <div>
              <span className="aps-project-kicker">{category.toUpperCase()} / SELECTED WORK</span>
              <h3>{name}</h3>
            </div>
            <span className="aps-project-arrow"><ArrowUpRight size={19} /></span>
          </div>
          <p>{description}</p>
          {stack.length > 0 && (
            <div className="aps-project-stack">
              {stack.map((item, itemIndex) => (
                <span key={`${item}-${itemIndex}`}>{item}</span>
              ))}
            </div>
          )}
          <div className="aps-project-card-bottom">
            <div className="aps-project-actions">
              {liveUrl ? (
                <a className="aps-project-live" href={liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} /> Visit live website
                </a>
              ) : (
                <span className="aps-no-link"><Eye size={13} /> No live demo</span>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github size={14} /> {githubProfile ? "GitHub profile" : "Repository"}
                </a>
              )}
            </div>
            <span className="aps-project-index">APS / {String(index + 1).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </TiltSurface>
  );
}

function SkillCard({ skill, index, enabled }) {
  const icons = [Code2, Database, Brain, Monitor, Terminal, Cpu];
  const Icon = icons[index % icons.length];

  return (
    <motion.article className="aps-skill-card" variants={reveal}>
      <div className="aps-skill-icon"><Icon size={18} /></div>
      <div className="aps-skill-copy">
        <strong>{skill.name}</strong>
        <small>{skill.category}</small>
      </div>
      {skill.level !== null && (
        <div className="aps-skill-meter" aria-label={`${skill.level}% self-assessed level`}>
          <span style={{ width: `${skill.level}%` }} />
        </div>
      )}
      {skill.detail && <p>{skill.detail}</p>}
    </motion.article>
  );
}

function EmptyState({ icon: Icon, title, description, link }) {
  return (
    <div className="aps-empty-state">
      <div><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {link && <Link to={link.to}>{link.label} <ArrowUpRight size={14} /></Link>}
    </div>
  );
}

function HomeStyles() {
  return (
    <style>{`
      .aps-home {
        --red: #ed3448;
        --red-bright: #ff687b;
        --white: #f5f1ed;
        --muted: #aaa2a0;
        --line: rgba(255,255,255,.12);
        position: relative;
        isolation: isolate;
        min-height: 100vh;
        overflow: clip;
        color: var(--white);
        background: transparent !important;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .aps-home *, .aps-home *::before, .aps-home *::after { box-sizing: border-box; }
      .aps-home a { color: inherit; text-decoration: none; }
      .aps-home button { font: inherit; }
      .aps-home :focus-visible { outline: 2px solid var(--red-bright); outline-offset: 4px; }
      .aps-wrap { width: min(1220px, 90%); margin-inline: auto; }
      .aps-hero {
        min-height: 790px;
        position: relative;
        isolation: isolate;
        padding: 24px 0 75px;
        background: transparent !important;
      }
      /* ============================================================
         CINEMATIC HERO BACKGROUND
         Uses the existing /images/hero-bg.jpg asset when available.
         Gradient layers remain as a graceful fallback.
         ============================================================ */
      .aps-hero-cinematic {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        background: #08080b !important;
      }
      .aps-hero-background {
        position: absolute;
        inset: 0;
        z-index: -3;
        overflow: hidden;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 78% 35%, rgba(111, 22, 42, .34), transparent 48%),
          radial-gradient(ellipse at 14% 72%, rgba(35, 34, 58, .25), transparent 46%),
          #08080b;
      }
      .aps-hero-background-image {
        position: absolute;
        inset: -3%;
        background-image: url("/images/hero-bg.jpg");
        background-position: center 42%;
        background-repeat: no-repeat;
        background-size: cover;
        opacity: .34;
        filter: saturate(.72) contrast(1.12) brightness(.62);
        transform: scale(1.035);
        animation: apsHeroImageDrift 28s ease-in-out infinite alternate;
      }
      .aps-hero-background-vignette {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(5, 5, 8, .91) 0%, rgba(5, 5, 8, .69) 42%, rgba(5, 5, 8, .35) 72%, rgba(5, 5, 8, .72) 100%),
          linear-gradient(180deg, rgba(5, 5, 8, .2) 0%, rgba(5, 5, 8, .04) 46%, #08080b 100%),
          radial-gradient(ellipse at 72% 45%, transparent 0%, rgba(0,0,0,.42) 72%);
      }
      .aps-hero-background-grain {
        position: absolute;
        inset: 0;
        opacity: .11;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.24'/%3E%3C/svg%3E");
        mix-blend-mode: soft-light;
      }
      .aps-hero-background-scanline {
        position: absolute;
        inset: 0;
        opacity: .12;
        background: repeating-linear-gradient(
          180deg,
          transparent 0,
          transparent 3px,
          rgba(255,255,255,.035) 4px,
          transparent 5px
        );
      }
      .aps-hero-light-beam {
        position: absolute;
        top: -25%;
        width: 24%;
        height: 145%;
        opacity: .13;
        filter: blur(42px);
        transform: rotate(28deg);
        background: linear-gradient(180deg, transparent, rgba(255, 68, 91, .8), transparent);
        animation: apsBeamDrift 15s ease-in-out infinite alternate;
      }
      .aps-beam-one { left: 53%; }
      .aps-beam-two {
        left: 78%;
        width: 10%;
        opacity: .09;
        animation-delay: -6s;
        animation-duration: 19s;
      }
      .aps-hero-cinematic .aps-hero-word {
        color: rgba(255,255,255,.045);
        -webkit-text-stroke-color: rgba(255,255,255,.065);
        text-shadow: 0 20px 100px rgba(0,0,0,.45);
      }
      .aps-hero-cinematic .aps-topline,
      .aps-hero-cinematic .aps-hero-grid,
      .aps-hero-cinematic .aps-hero-foot,
      .aps-hero-cinematic .aps-stats {
        position: relative;
        z-index: 2;
      }
      .aps-hero-cinematic .aps-hero-copy {
        text-shadow: 0 8px 38px rgba(0,0,0,.34);
      }
      .aps-hero-cinematic .aps-hero-title {
        text-shadow: 0 18px 75px rgba(0,0,0,.62);
      }
      .aps-hero-cinematic .aps-profile-stage {
        filter: drop-shadow(0 30px 80px rgba(0,0,0,.32));
      }
      .aps-stage-depth-grid {
        position: absolute;
        inset: 3% -10% -5%;
        z-index: -1;
        opacity: .22;
        background-image:
          linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px);
        background-size: 46px 46px;
        transform: perspective(620px) rotateX(67deg) rotateZ(-16deg) scale(1.18);
        mask-image: radial-gradient(ellipse at center, black 0%, transparent 69%);
      }
      .aps-profile-orbit {
        will-change: transform;
        backface-visibility: visible;
      }
      .aps-orbit-c {
        width: 103%;
        height: 44%;
        border-color: rgba(255, 111, 129, .18);
        border-style: solid;
        transform: translate(-50%,-50%) rotateX(76deg) rotateZ(58deg);
        animation: apsOrbitC 29s linear infinite;
        box-shadow: 0 0 65px rgba(237,52,72,.07);
      }
      .aps-orbit-core {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 44%;
        aspect-ratio: 1;
        border-radius: 50%;
        transform: translate(-50%,-50%) translateZ(-30px);
        background: radial-gradient(circle at 38% 32%, rgba(255,255,255,.16), rgba(237,52,72,.07) 28%, transparent 69%);
        filter: blur(3px);
        box-shadow: 0 0 90px rgba(237,52,72,.12);
        animation: apsCorePulse 5.5s ease-in-out infinite;
      }
      .aps-orbit-particle {
        position: absolute;
        z-index: 5;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff8190;
        box-shadow: 0 0 12px #ff5068, 0 0 34px rgba(255,80,104,.7);
        pointer-events: none;
      }
      .aps-particle-one {
        top: 25%;
        left: 21%;
        animation: apsParticleFloatOne 8s ease-in-out infinite;
      }
      .aps-particle-two {
        top: 67%;
        right: 17%;
        width: 5px;
        height: 5px;
        animation: apsParticleFloatTwo 10s ease-in-out infinite;
      }
      .aps-particle-three {
        top: 17%;
        right: 29%;
        width: 4px;
        height: 4px;
        background: #fff;
        animation: apsParticleFloatThree 7s ease-in-out infinite;
      }
      .aps-profile-stage::before {
        content: "";
        position: absolute;
        inset: 13% 13% 10%;
        z-index: -2;
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(237,52,72,.18), transparent 66%);
        filter: blur(34px);
        animation: apsHaloBreath 7s ease-in-out infinite;
      }
      .aps-profile-photo-frame {
        box-shadow:
          0 35px 95px rgba(0,0,0,.52),
          0 0 0 1px rgba(255,255,255,.035),
          0 0 70px rgba(237,52,72,.09),
          inset 0 0 65px rgba(255,255,255,.035);
      }
      .aps-profile-photo-frame img {
        transform: scale(1.015);
        transition: transform 1.2s cubic-bezier(.2,.8,.2,1), filter .8s ease;
      }
      .aps-profile-stage:hover .aps-profile-photo-frame img {
        transform: scale(1.065);
        filter: saturate(1.02) contrast(1.06);
      }
      .aps-stage-chip {
        transform: translateZ(40px);
        animation: apsChipFloat 7s ease-in-out infinite;
      }
      .aps-chip-left { animation-delay: -2.2s; }
      .aps-chip-bottom { animation-delay: -4.4s; }
      .aps-chip-top { animation-delay: -1s; }
      .aps-hero-cinematic .aps-button-primary {
        position: relative;
        overflow: hidden;
      }
      .aps-hero-cinematic .aps-button-primary::after {
        content: "";
        position: absolute;
        top: -80%;
        left: -55%;
        width: 35%;
        height: 260%;
        transform: rotate(25deg);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.24), transparent);
        transition: left .7s ease;
      }
      .aps-hero-cinematic .aps-button-primary:hover::after { left: 125%; }
      .aps-hero-cinematic .aps-availability {
        padding: 9px 12px;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 40px;
        background: rgba(8,8,11,.32);
        backdrop-filter: blur(12px);
      }
      @keyframes apsHeroImageDrift {
        from { transform: scale(1.035) translate3d(-.4%, 0, 0); }
        to { transform: scale(1.12) translate3d(.8%, -1.1%, 0); }
      }
      @keyframes apsBeamDrift {
        from { transform: translate3d(-18px,0,0) rotate(28deg); }
        to { transform: translate3d(38px,0,0) rotate(28deg); }
      }
      @keyframes apsOrbitC {
        from { transform: translate(-50%,-50%) rotateX(76deg) rotateZ(0deg); }
        to { transform: translate(-50%,-50%) rotateX(76deg) rotateZ(360deg); }
      }
      @keyframes apsCorePulse {
        0%,100% { opacity: .48; transform: translate(-50%,-50%) scale(.92) translateZ(-30px); }
        50% { opacity: .9; transform: translate(-50%,-50%) scale(1.08) translateZ(-30px); }
      }
      @keyframes apsParticleFloatOne {
        0%,100% { transform: translate3d(0,0,0); }
        50% { transform: translate3d(16px,-27px,22px); }
      }
      @keyframes apsParticleFloatTwo {
        0%,100% { transform: translate3d(0,0,0); }
        50% { transform: translate3d(-20px,18px,12px); }
      }
      @keyframes apsParticleFloatThree {
        0%,100% { opacity: .4; transform: translate3d(0,0,0) scale(.8); }
        50% { opacity: 1; transform: translate3d(-11px,23px,20px) scale(1.4); }
      }
      @keyframes apsHaloBreath {
        0%,100% { opacity: .45; transform: scale(.94); }
        50% { opacity: .9; transform: scale(1.08); }
      }
      @keyframes apsChipFloat {
        0%,100% { translate: 0 0; }
        50% { translate: 0 -8px; }
      }
      .aps-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(5,6,9,.72), rgba(5,6,9,.34) 54%, rgba(5,6,9,.60)),
          linear-gradient(180deg, rgba(5,6,9,.18), rgba(5,6,9,.06) 55%, rgba(5,6,9,.80));
      }
      .aps-hero::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        opacity: .15;
        background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: linear-gradient(to bottom, black, transparent 82%);
      }
      .aps-hero-orb {
        position: absolute;
        z-index: -1;
        width: 380px;
        height: 380px;
        border-radius: 50%;
        filter: blur(100px);
        opacity: .16;
        background: var(--red);
        pointer-events: none;
        animation: apsFloat 11s ease-in-out infinite;
      }
      .aps-hero-orb.one { top: 10%; right: -120px; }
      .aps-hero-orb.two { bottom: 0; left: -220px; opacity: .10; animation-delay: -4s; }
      .aps-topline {
        width: min(1440px, 90%);
        margin-inline: auto;
        min-height: 54px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        color: rgba(255,255,255,.78);
        font-size: 9px;
        letter-spacing: 1.8px;
        line-height: 1.9;
      }
      .aps-topline small { color: rgba(255,255,255,.45); font-size: 8px; letter-spacing: 1.5px; }
      .aps-availability { display: inline-flex; align-items: center; gap: 9px; color: #d7d0ce; font-size: 9px; letter-spacing: .8px; text-align: right; }
      .aps-live-dot { display: inline-block; width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #72d89a; box-shadow: 0 0 14px #72d89a; }
      .aps-hero-word {
        position: absolute;
        top: 100px;
        left: 50%;
        width: 100%;
        z-index: -1;
        transform: translateX(-50%);
        color: rgba(255,255,255,.035);
        -webkit-text-stroke: 1px rgba(255,255,255,.055);
        font-family: Impact, "Arial Narrow", sans-serif;
        font-size: clamp(110px, 22vw, 310px);
        line-height: .85;
        letter-spacing: -.065em;
        white-space: nowrap;
        text-align: center;
        pointer-events: none;
        user-select: none;
      }
      .aps-hero-grid {
        width: min(1440px, 90%);
        min-height: 610px;
        margin-inline: auto;
        display: grid;
        grid-template-columns: .94fr 1.06fr;
        align-items: center;
        gap: 30px;
        perspective: 1500px;
      }
      .aps-hero-copy { position: relative; z-index: 3; max-width: 590px; padding: 55px 0 45px; }
      .aps-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--red-bright);
        font-size: 9px;
        font-weight: 850;
        letter-spacing: 2.2px;
      }
      .aps-eyebrow i { width: 22px; height: 1px; background: var(--red); }
      .aps-handwrite { margin: 27px 0 8px; color: #c6bcba; font: italic 17px Georgia, serif; }
      .aps-hero-title {
        margin: 0;
        max-width: 100%;
        color: #fff;
        font-size: clamp(62px, 7.6vw, 108px);
        font-weight: 950;
        line-height: .89;
        letter-spacing: -.075em;
        text-transform: uppercase;
        text-shadow: 0 15px 60px rgba(0,0,0,.55);
        overflow-wrap: anywhere;
      }
      .aps-hero-title em { color: var(--red); font-style: normal; text-shadow: 0 0 45px rgba(237,52,72,.20); }
      .aps-hero-role { margin: 23px 0 10px; color: #f2ece9; font-size: 13px; font-weight: 800; }
      .aps-hero-description { max-width: 465px; color: rgba(239,232,229,.72); font-size: 12px; line-height: 1.95; }
      .aps-hero-actions { display: flex; flex-wrap: wrap; gap: 11px; margin-top: 26px; }
      .aps-button {
        position: relative;
        min-height: 47px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 0 18px;
        border: 1px solid transparent;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 850;
        transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease, background .25s ease;
      }
      .aps-button:hover { transform: translateY(-3px); }
      .aps-button-primary { color: #fff; background: linear-gradient(115deg,#f04458,#a90e27); box-shadow: 0 12px 32px rgba(210,28,52,.24); }
      .aps-button-primary:hover { box-shadow: 0 17px 40px rgba(210,28,52,.36); }
      .aps-button-ghost { color: #eee; border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.045); backdrop-filter: blur(12px); }
      .aps-button-ghost:hover { border-color: rgba(255,100,117,.7); background: rgba(237,52,72,.09); }
      .aps-socials { display: flex; gap: 9px; margin-top: 25px; }
      .aps-socials a { width: 37px; height: 37px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 50%; color: #d3ccca; background: rgba(0,0,0,.17); transition: .25s ease; }
      .aps-socials a:hover { color: white; border-color: var(--red); background: var(--red); transform: translateY(-4px); }
      .aps-location { display: flex; align-items: center; gap: 8px; margin-top: 17px; color: rgba(255,255,255,.57); font-size: 9px; letter-spacing: .5px; }
      .aps-profile-stage {
        position: relative;
        width: min(100%, 650px);
        height: 570px;
        margin-inline: auto;
        isolation: isolate;
        perspective: 1400px;
        transform-style: preserve-3d;
      }
      .aps-profile-stage-grid {
        position: absolute;
        inset: 8% 2%;
        opacity: .22;
        background-image: linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: radial-gradient(ellipse, black, transparent 70%);
        transform: rotateX(58deg) rotateZ(-13deg) scale(1.12);
      }
      .aps-profile-orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 88%;
        aspect-ratio: 1;
        border: 1px solid rgba(255,100,117,.26);
        border-radius: 50%;
        transform: translate(-50%,-50%) rotateX(68deg) rotateZ(-24deg);
        box-shadow: 0 0 65px rgba(237,52,72,.08), inset 0 0 55px rgba(237,52,72,.05);
        animation: apsOrbit 38s linear infinite;
      }
      .aps-orbit-b { width: 70%; border-style: dashed; border-color: rgba(255,255,255,.15); animation-direction: reverse; animation-duration: 52s; }
      .aps-profile-photo-frame {
        position: absolute;
        inset: 8% 12% 7%;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 48% 48% 18px 18px;
        background: linear-gradient(145deg, rgba(29,27,30,.94), rgba(7,8,11,.84));
        box-shadow: 0 35px 95px rgba(0,0,0,.48), inset 0 0 65px rgba(255,255,255,.035);
        transform: rotateY(-7deg) rotateX(2deg) translateZ(22px);
        transform-style: preserve-3d;
      }
      .aps-profile-photo-frame::after {
        content: "";
        position: absolute;
        inset: 12px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 0 55px rgba(0,0,0,.25);
      }
      .aps-profile-photo-frame img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center 22%; filter: saturate(.88) contrast(1.04); }
      .aps-profile-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 13px; background: radial-gradient(circle at 50% 35%, rgba(237,52,72,.2), transparent 42%); }
      .aps-profile-fallback span { width: 160px; aspect-ratio: 1; display: grid; place-items: center; border: 1px solid rgba(255,100,117,.5); border-radius: 50%; color: white; background: rgba(255,255,255,.035); font-size: 54px; font-weight: 900; }
      .aps-profile-fallback small { color: #a49b99; font-size: 8px; letter-spacing: 1.7px; }
      .aps-photo-edge { position: absolute; inset: 5% 9% 4%; z-index: -1; border: 1px solid rgba(237,52,72,.35); border-radius: 48% 48% 20px 20px; transform: translateZ(-16px) rotateY(5deg); }
      .aps-photo-caption { position: absolute; left: 16%; bottom: 11%; z-index: 3; display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,.78); font-size: 8px; letter-spacing: 1.7px; text-shadow: 0 2px 8px #000; }
      .aps-stage-chip { position: absolute; z-index: 4; min-width: 125px; padding: 11px 13px; border: 1px solid rgba(255,255,255,.17); border-radius: 8px; background: rgba(12,12,15,.78); backdrop-filter: blur(18px); box-shadow: 0 16px 45px rgba(0,0,0,.32); }
      .aps-stage-chip small { display: block; margin-bottom: 6px; color: #958b89; font-size: 7px; letter-spacing: 1.6px; }
      .aps-stage-chip strong { display: flex; align-items: center; gap: 7px; color: #eee8e5; font-size: 9px; }
      .aps-stage-chip svg { color: var(--red-bright); }
      .aps-chip-top { top: 15%; right: 2%; }
      .aps-chip-left { bottom: 24%; left: 0; }
      .aps-chip-bottom { bottom: 9%; right: 5%; }
      .aps-stage-index { position: absolute; top: 8%; left: 7%; color: rgba(255,255,255,.65); font-size: 9px; letter-spacing: 2px; }
      .aps-stage-index span { color: rgba(255,255,255,.35); }
      .aps-hero-foot { width: min(1220px,90%); margin: 12px auto 28px; display: flex; justify-content: space-between; align-items: center; gap: 18px; color: rgba(255,255,255,.49); font-size: 8px; letter-spacing: 1.4px; }
      .aps-hero-foot button { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; color: #eee; font-size: 9px; letter-spacing: 1px; cursor: pointer; }
      .aps-hero-foot button:hover { color: var(--red-bright); }
      .aps-stats { position: relative; z-index: 5; width: min(1220px,90%); margin: 0 auto; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; }
      .aps-stats > * { min-width: 0; border: 1px solid var(--line); border-radius: 10px; background: rgba(15,15,18,.56); backdrop-filter: blur(14px); transition: transform .25s ease, border-color .25s ease; }
      .aps-stats > *:hover { transform: translateY(-5px); border-color: rgba(237,52,72,.45); }
      .aps-section { position: relative; width: min(1220px,90%); margin: 0 auto; padding: 100px 0; scroll-margin-top: 90px; }
      .aps-section::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent); }
      .aps-section-label { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--red-bright); font-size: 8px; font-weight: 850; letter-spacing: 2px; }
      .aps-section-label span { color: rgba(255,255,255,.48); font-variant-numeric: tabular-nums; }
      .aps-section-label i { width: 22px; height: 1px; background: var(--red); }
      .aps-section-head { display: flex; justify-content: space-between; align-items: end; gap: 25px; margin-bottom: 35px; }
      .aps-view-all { display: inline-flex; align-items: center; gap: 8px; min-height: 38px; color: #eee; font-size: 10px; white-space: nowrap; transition: .25s; }
      .aps-view-all:hover { color: var(--red-bright); transform: translateX(3px); }
      .aps-about-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 16px; }
      .aps-glass-card { position: relative; min-width: 0; min-height: 310px; padding: 30px; overflow: hidden; border: 1px solid var(--line); border-radius: 13px; background: linear-gradient(145deg,rgba(27,25,28,.86),rgba(10,11,14,.82)); backdrop-filter: blur(15px); box-shadow: 0 18px 55px rgba(0,0,0,.18); transform-style: preserve-3d; }
      .aps-glass-card::after { content: ""; position: absolute; right: -90px; bottom: -120px; width: 230px; aspect-ratio: 1; border: 1px solid rgba(237,52,72,.18); border-radius: 50%; box-shadow: 0 0 0 25px rgba(237,52,72,.025),0 0 0 50px rgba(237,52,72,.018); pointer-events: none; }
      .aps-card-icon { width: 40px; height: 40px; display: grid; place-items: center; margin: 23px 0 16px; border: 1px solid rgba(237,52,72,.25); border-radius: 10px; color: var(--red-bright); background: rgba(237,52,72,.08); }
      .aps-glass-card h3 { position: relative; z-index: 1; margin: 0 0 12px; color: #f5f0ed; font-size: clamp(22px,2.7vw,34px); line-height: 1.1; letter-spacing: -1.1px; }
      .aps-glass-card h3 em { color: var(--red-bright); font-style: normal; }
      .aps-glass-card p { position: relative; z-index: 1; color: var(--muted); font-size: 11px; line-height: 1.9; }
      .aps-facts { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 9px; margin-top: 20px; }
      .aps-fact { min-width: 0; padding: 12px; border: 1px solid rgba(255,255,255,.09); border-radius: 7px; background: rgba(255,255,255,.025); }
      .aps-fact small { display: block; margin-bottom: 6px; color: #8e8583; font-size: 7px; letter-spacing: 1.3px; text-transform: uppercase; }
      .aps-fact strong { display: block; color: #e8e1de; font-size: 10px; line-height: 1.55; overflow-wrap: anywhere; }
      .aps-card-link { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 8px; margin-top: 19px; color: #f4eeeb; font-size: 10px; font-weight: 800; transition: gap .2s,color .2s; }
      .aps-card-link:hover { gap: 12px; color: var(--red-bright); }
      .aps-skill-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 11px; }
      .aps-skill-card { min-width: 0; min-height: 132px; padding: 17px; border: 1px solid var(--line); border-radius: 10px; background: linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012)); transition: transform .25s,border-color .25s,background .25s; }
      .aps-skill-card:hover { transform: translateY(-4px); border-color: rgba(237,52,72,.4); background: rgba(237,52,72,.045); }
      .aps-skill-icon { color: var(--red-bright); }
      .aps-skill-copy { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-top: 11px; }
      .aps-skill-copy strong { color: #eee8e5; font-size: 11px; }
      .aps-skill-copy small { color: #8d8583; font-size: 8px; text-align: right; }
      .aps-skill-meter { height: 3px; margin-top: 12px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.09); }
      .aps-skill-meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#b91431,#ff687b); }
      .aps-skill-card p { margin: 7px 0 0; color: #8e8583; font-size: 8px; line-height: 1.5; }
      .aps-project-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 17px; perspective: 1300px; }
      .aps-project-card { min-width: 0; height: 100%; border: 1px solid rgba(255,255,255,.14); border-radius: 13px; background: linear-gradient(145deg,rgba(24,23,26,.94),rgba(8,9,12,.94)); box-shadow: 0 22px 65px rgba(0,0,0,.24); transform-style: preserve-3d; transition: border-color .3s,box-shadow .3s; }
      .aps-project-card:hover { border-color: rgba(237,52,72,.5); box-shadow: 0 30px 75px rgba(0,0,0,.34),0 0 35px rgba(237,52,72,.06); }
      .aps-project-card-inner { height: 100%; display: flex; flex-direction: column; transform-style: preserve-3d; }
      .aps-project-card-meta { min-height: 42px; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 0 15px; color: #ff7483; font-size: 8px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
      .aps-project-status { padding: 5px 8px; border: 1px solid rgba(255,255,255,.13); border-radius: 30px; color: #c6bfbc; font-size: 7px; letter-spacing: .3px; text-transform: none; }
      .aps-project-art { position: relative; height: 225px; overflow: hidden; border-top: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.08); background: #111115; transform: translateZ(16px); }
      .aps-project-art > img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: top center; transition: transform .8s cubic-bezier(.2,.8,.2,1),filter .4s ease; }
      .aps-project-card:hover .aps-project-art > img { transform: scale(1.055); filter: saturate(1.08); }
      .aps-project-art.is-live-preview::after { content: ""; position: absolute; inset: 45% 0 0; pointer-events: none; background: linear-gradient(180deg,transparent,rgba(5,6,9,.48)); }
      .aps-project-artwork { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; background: radial-gradient(ellipse at 72% 25%,rgba(237,52,72,.20),transparent 44%),linear-gradient(135deg,#1b171b,#0d0f13 70%); }
      .aps-artwork-1 { background: radial-gradient(ellipse at 72% 25%,rgba(81,75,183,.2),transparent 45%),linear-gradient(135deg,#171822,#0d0f13 70%); }
      .aps-artwork-2 { background: radial-gradient(ellipse at 72% 25%,rgba(51,124,153,.2),transparent 45%),linear-gradient(135deg,#151d22,#0d0f13 70%); }
      .aps-artwork-3 { background: radial-gradient(ellipse at 72% 25%,rgba(237,112,52,.18),transparent 45%),linear-gradient(135deg,#201a16,#0d0f13 70%); }
      .aps-artwork-4 { background: radial-gradient(ellipse at 72% 25%,rgba(88,143,103,.18),transparent 45%),linear-gradient(135deg,#151d19,#0d0f13 70%); }
      .aps-art-grid { position: absolute; inset: 0; opacity: .18; background-image: linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px); background-size: 30px 30px; mask-image: linear-gradient(135deg,black,transparent 90%); }
      .aps-art-orbit { position: absolute; width: 205px; aspect-ratio: 1; border: 1px solid rgba(255,255,255,.16); border-radius: 50%; transform: rotateX(68deg) rotateZ(-25deg); box-shadow: 0 0 35px rgba(237,52,72,.10); }
      .aps-art-orbit.second { width: 150px; border-style: dashed; border-color: rgba(255,100,117,.32); transform: rotateX(68deg) rotateZ(32deg); }
      .aps-art-number { position: absolute; top: 17px; left: 17px; color: rgba(255,255,255,.45); font-size: 10px; font-weight: 850; letter-spacing: 2px; }
      .aps-art-center { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--red-bright); transform: translateZ(22px); }
      .aps-art-center span { color: rgba(255,255,255,.8); font-size: 8px; font-weight: 800; letter-spacing: 1.8px; }
      .aps-art-disclaimer { position: absolute; bottom: 12px; left: 14px; color: rgba(255,255,255,.42); font-size: 7px; letter-spacing: 1.2px; }
      .aps-project-art-overlay { position: absolute; top: 13px; right: 13px; z-index: 4; display: flex; align-items: center; gap: 9px; }
      .aps-preview-kind { display: inline-flex; align-items: center; gap: 7px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.18); border-radius: 30px; color: #fff; background: rgba(8,9,12,.72); backdrop-filter: blur(12px); font-size: 7px; font-weight: 850; letter-spacing: 1px; }
      .aps-project-art-overlay a { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,100,117,.5); border-radius: 30px; color: white; background: rgba(173,20,45,.84); font-size: 7px; font-weight: 900; letter-spacing: .8px; }
      .aps-project-art-footer { position: absolute; inset: auto 13px 12px; z-index: 3; display: flex; justify-content: space-between; gap: 10px; color: rgba(255,255,255,.82); font-size: 7px; letter-spacing: 1px; text-shadow: 0 2px 8px #000; pointer-events: none; }
      .aps-project-card-content { display: flex; flex: 1; flex-direction: column; padding: 20px 19px 17px; }
      .aps-project-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .aps-project-kicker { display: block; margin-bottom: 7px; color: #9b9290; font-size: 7px; font-weight: 800; letter-spacing: 1.4px; }
      .aps-project-title-row h3 { margin: 0; color: #f5f0ed; font-size: 20px; letter-spacing: -.7px; }
      .aps-project-arrow { width: 34px; height: 34px; display: grid; flex: 0 0 34px; place-items: center; border: 1px solid rgba(237,52,72,.3); border-radius: 50%; color: var(--red-bright); background: rgba(237,52,72,.07); transition: transform .25s,background .25s; }
      .aps-project-card:hover .aps-project-arrow { transform: rotate(45deg); background: rgba(237,52,72,.17); }
      .aps-project-card-content > p { min-height: 58px; margin: 11px 0 0; color: var(--muted); font-size: 10px; line-height: 1.85; }
      .aps-project-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 15px; }
      .aps-project-stack span { padding: 6px 8px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; color: #d0c8c5; background: rgba(255,255,255,.025); font-size: 8px; }
      .aps-project-card-bottom { display: flex; align-items: end; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 18px; }
      .aps-project-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 13px; }
      .aps-project-actions a { display: inline-flex; align-items: center; gap: 6px; color: #f0eae7; font-size: 9px; font-weight: 800; transition: color .2s; }
      .aps-project-actions a:hover { color: var(--red-bright); }
      .aps-project-actions .aps-project-live { color: #ff8290; }
      .aps-project-index { color: rgba(255,255,255,.32); font-size: 7px; letter-spacing: 1px; white-space: nowrap; }
      .aps-no-link { display: inline-flex; align-items: center; gap: 6px; color: #827a78; font-size: 8px; }
      .aps-project-art > img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center; transition: transform .7s ease,filter .4s ease; }
      .aps-project-card:hover .aps-project-art > img { transform: scale(1.045); filter: saturate(1.08); }
      .aps-project-artwork { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; background: radial-gradient(ellipse at 72% 25%,rgba(237,52,72,.20),transparent 44%),linear-gradient(135deg,#1b171b,#0d0f13 70%); }
      .aps-artwork-1 { background: radial-gradient(ellipse at 72% 25%,rgba(81,75,183,.2),transparent 45%),linear-gradient(135deg,#171822,#0d0f13 70%); }
      .aps-artwork-2 { background: radial-gradient(ellipse at 72% 25%,rgba(51,124,153,.2),transparent 45%),linear-gradient(135deg,#151d22,#0d0f13 70%); }
      .aps-artwork-3 { background: radial-gradient(ellipse at 72% 25%,rgba(237,112,52,.18),transparent 45%),linear-gradient(135deg,#201a16,#0d0f13 70%); }
      .aps-artwork-4 { background: radial-gradient(ellipse at 72% 25%,rgba(88,143,103,.18),transparent 45%),linear-gradient(135deg,#151d19,#0d0f13 70%); }
      .aps-art-grid { position: absolute; inset: 0; opacity: .18; background-image: linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px); background-size: 30px 30px; mask-image: linear-gradient(135deg,black,transparent 90%); }
      .aps-art-orbit { position: absolute; width: 205px; aspect-ratio: 1; border: 1px solid rgba(255,255,255,.16); border-radius: 50%; transform: rotateX(68deg) rotateZ(-25deg); box-shadow: 0 0 35px rgba(237,52,72,.10); }
      .aps-art-orbit.second { width: 150px; border-style: dashed; border-color: rgba(255,100,117,.32); transform: rotateX(68deg) rotateZ(32deg); }
      .aps-art-number { position: absolute; top: 17px; left: 17px; color: rgba(255,255,255,.45); font-size: 10px; font-weight: 850; letter-spacing: 2px; }
      .aps-art-center { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--red-bright); transform: translateZ(22px); }
      .aps-art-center span { color: rgba(255,255,255,.8); font-size: 8px; font-weight: 800; letter-spacing: 1.8px; }
      .aps-art-disclaimer { position: absolute; bottom: 12px; left: 14px; color: rgba(255,255,255,.42); font-size: 7px; letter-spacing: 1.2px; }
      .aps-project-art-footer { position: absolute; inset: auto 13px 12px; z-index: 2; display: flex; justify-content: space-between; gap: 10px; color: rgba(255,255,255,.75); font-size: 7px; letter-spacing: 1px; text-shadow: 0 2px 8px #000; pointer-events: none; }
      .aps-project-card-content { display: flex; flex: 1; flex-direction: column; padding: 18px 18px 16px; }
      .aps-project-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .aps-project-title-row h3 { margin: 0; color: #f5f0ed; font-size: 18px; letter-spacing: -.5px; }
      .aps-project-title-row > svg { color: var(--red-bright); transition: transform .25s; }
      .aps-project-card:hover .aps-project-title-row > svg { transform: translate(3px,-3px); }
      .aps-project-card-content > p { min-height: 62px; margin: 10px 0 0; color: var(--muted); font-size: 10px; line-height: 1.8; }
      .aps-project-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
      .aps-project-stack span { padding: 5px 7px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; color: #c8c0bd; font-size: 8px; }
      .aps-project-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 13px; margin-top: auto; padding-top: 17px; }
      .aps-project-actions a { display: inline-flex; align-items: center; gap: 6px; color: #f0eae7; font-size: 9px; font-weight: 800; transition: color .2s; }
      .aps-project-actions a:hover { color: var(--red-bright); }
      .aps-no-link { display: inline-flex; align-items: center; gap: 6px; color: #827a78; font-size: 8px; }
      .aps-empty-state { grid-column: 1/-1; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; border: 1px dashed rgba(255,255,255,.19); border-radius: 12px; text-align: center; color: var(--muted); }
      .aps-empty-state > div { color: var(--red-bright); }
      .aps-empty-state h3 { margin: 12px 0 5px; color: #f3eeeb; font-size: 15px; }
      .aps-empty-state p { margin: 0; font-size: 10px; line-height: 1.7; }
      .aps-empty-state a { display: inline-flex; align-items: center; gap: 7px; margin-top: 13px; color: #fff; font-size: 10px; }
      .aps-tech-strip { width: min(1220px,90%); margin: 0 auto 45px; padding: 22px 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 17px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); color: #a9a19f; font-size: 8px; letter-spacing: 1.2px; }
      .aps-tech-strip span { display: inline-flex; align-items: center; gap: 8px; }
      .aps-tech-strip svg { color: var(--red-bright); }
      .aps-dsa-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding: 30px; border: 1px solid var(--line); border-radius: 13px; background: radial-gradient(ellipse at 85% 5%,rgba(237,52,72,.13),transparent 42%),rgba(15,15,18,.8); }
      .aps-dsa-number { margin-top: 17px; color: white; font-size: clamp(45px,6vw,70px); font-weight: 950; line-height: 1; letter-spacing: -3px; }
      .aps-dsa-number span { color: var(--red-bright); }
      .aps-dsa-caption { margin-top: 8px; color: var(--muted); font-size: 10px; }
      .aps-dsa-list { display: grid; align-content: center; }
      .aps-dsa-row { display: flex; justify-content: space-between; gap: 15px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.09); font-size: 10px; }
      .aps-dsa-row span { color: var(--muted); }
      .aps-dsa-row strong { color: #f5f0ed; }
      .aps-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; margin-top: 17px; }
      .aps-record-column h3 { display: flex; align-items: center; gap: 9px; margin: 0 0 13px; color: #eee; font-size: 12px; }
      .aps-record-column h3 svg { color: var(--red-bright); }
      .aps-record-list { display: grid; gap: 9px; }
      .aps-record { padding: 17px; border: 1px solid var(--line); border-radius: 9px; background: rgba(255,255,255,.025); }
      .aps-record h4 { margin: 0 0 7px; color: #f1ece9; font-size: 11px; }
      .aps-record p { margin: 0; color: var(--muted); font-size: 9px; line-height: 1.7; }
      .aps-record small { display: block; margin-top: 9px; color: #827a78; font-size: 8px; }
      .aps-record a { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; color: #fff; font-size: 9px; }
      .aps-timeline { position: relative; display: grid; gap: 11px; }
      .aps-timeline::before { content: ""; position: absolute; left: 13px; top: 16px; bottom: 16px; width: 1px; background: linear-gradient(var(--red),rgba(255,255,255,.08)); }
      .aps-timeline-item { position: relative; padding: 18px 20px 18px 47px; border: 1px solid var(--line); border-radius: 9px; background: rgba(255,255,255,.025); transition: border-color .2s,transform .2s; }
      .aps-timeline-item:hover { transform: translateX(3px); border-color: rgba(237,52,72,.4); }
      .aps-timeline-item::before { content: ""; position: absolute; left: 7px; top: 23px; width: 13px; height: 13px; border: 2px solid #171316; border-radius: 50%; background: var(--red-bright); box-shadow: 0 0 14px rgba(237,52,72,.5); }
      .aps-timeline-item small { color: var(--red-bright); font-size: 8px; letter-spacing: 1.2px; }
      .aps-timeline-item h3 { margin: 7px 0; color: #f3eeeb; font-size: 13px; }
      .aps-timeline-item p { margin: 0; color: var(--muted); font-size: 10px; line-height: 1.8; }
      .aps-goal-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
      .aps-goal-card { min-width: 0; padding: 20px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.025); transition: transform .25s,border-color .25s; }
      .aps-goal-card:hover { transform: translateY(-4px); border-color: rgba(237,52,72,.38); }
      .aps-goal-card > svg { color: var(--red-bright); }
      .aps-goal-card h3 { margin: 12px 0 7px; color: #f1ece9; font-size: 12px; line-height: 1.6; }
      .aps-goal-card p { margin: 0; color: var(--muted); font-size: 9px; line-height: 1.75; }
      .aps-goal-progress { height: 3px; margin-top: 14px; overflow: hidden; border-radius: 9px; background: rgba(255,255,255,.1); }
      .aps-goal-progress span { display: block; height: 100%; background: linear-gradient(90deg,#b91431,#ff687b); }
      .aps-cta { position: relative; width: min(1220px,90%); margin: 0 auto 90px; padding: clamp(28px,5vw,55px); overflow: hidden; border: 1px solid rgba(237,52,72,.3); border-radius: 15px; background: radial-gradient(ellipse at 90% 40%,rgba(237,52,72,.2),transparent 45%),linear-gradient(135deg,rgba(26,22,25,.94),rgba(9,10,13,.93)); }
      .aps-cta::after { content: ""; position: absolute; top: -180px; right: -90px; width: 360px; aspect-ratio: 1; border: 1px solid rgba(237,52,72,.18); border-radius: 50%; box-shadow: 0 0 0 35px rgba(237,52,72,.025),0 0 0 70px rgba(237,52,72,.018); pointer-events: none; }
      .aps-cta h2 { position: relative; z-index: 1; max-width: 760px; margin: 17px 0; color: #f7f2ef; font-size: clamp(34px,5vw,64px); line-height: 1.02; letter-spacing: -2px; }
      .aps-cta h2 em { color: var(--red-bright); font-style: normal; }
      .aps-cta p { position: relative; z-index: 1; max-width: 570px; color: var(--muted); font-size: 11px; line-height: 1.85; }
      .aps-cta-actions { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 23px; }
      .aps-quick-links { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 25px; }
      .aps-quick-links a { padding: 8px 10px; border: 1px solid var(--line); border-radius: 5px; color: #c5bdbb; font-size: 8px; transition: .2s; }
      .aps-quick-links a:hover { color: white; border-color: var(--red); background: rgba(237,52,72,.08); }
      .aps-back-top { position: fixed; right: 22px; bottom: 22px; z-index: 40; width: 43px; height: 43px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; color: white; background: rgba(15,15,18,.82); backdrop-filter: blur(14px); box-shadow: 0 10px 35px rgba(0,0,0,.28); cursor: pointer; transition: .25s; }
      .aps-back-top:hover { transform: translateY(-4px); border-color: var(--red); background: var(--red); }

      /* ============================================================
         APS HOME EXPERIENCE — COMPONENT FINISHING SYSTEM
         ============================================================ */
      .aps-home {
        --aps-ink: #08080b;
        --aps-panel: rgba(15,15,19,.78);
        --aps-panel-raised: rgba(23,21,25,.9);
        --aps-line-soft: rgba(255,255,255,.075);
        --aps-line-mid: rgba(255,255,255,.14);
        --aps-red-soft: rgba(237,52,72,.12);
        --aps-red-line: rgba(237,52,72,.38);
        --aps-shadow-deep: 0 26px 80px rgba(0,0,0,.34);
        --aps-radius-sm: 7px;
        --aps-radius-md: 12px;
        --aps-radius-lg: 18px;
        --aps-motion-fast: .18s;
        --aps-motion-base: .28s;
        --aps-motion-slow: .55s;
      }
      .aps-home ::selection {
        color: #fff;
        background: rgba(237,52,72,.72);
      }
      .aps-home img {
        max-width: 100%;
      }
      .aps-home button,
      .aps-home a {
        -webkit-tap-highlight-color: transparent;
      }
      .aps-home a:focus-visible,
      .aps-home button:focus-visible {
        outline: 2px solid #ff7182;
        outline-offset: 4px;
      }
      .aps-home .aps-section {
        isolation: isolate;
      }
      .aps-home .aps-section > * {
        position: relative;
      }
      .aps-home .aps-section-label {
        user-select: none;
      }
      .aps-home .aps-section-label span {
        font-feature-settings: "tnum";
      }
      .aps-home .aps-section-head > a {
        flex: 0 0 auto;
      }
      .aps-home .aps-view-all svg {
        transition: transform var(--aps-motion-base) ease;
      }
      .aps-home .aps-view-all:hover svg {
        transform: translate(3px,-3px);
      }
      .aps-home .aps-glass-card {
        transition:
          border-color var(--aps-motion-base) ease,
          background var(--aps-motion-base) ease,
          box-shadow var(--aps-motion-base) ease;
      }
      .aps-home .aps-glass-card:hover {
        border-color: var(--aps-line-mid);
        background:
          radial-gradient(ellipse at 100% 0%, rgba(237,52,72,.075), transparent 48%),
          linear-gradient(145deg,rgba(29,26,30,.92),rgba(10,11,14,.86));
        box-shadow: var(--aps-shadow-deep);
      }
      .aps-home .aps-card-icon {
        transition:
          transform var(--aps-motion-base) ease,
          border-color var(--aps-motion-base) ease,
          background var(--aps-motion-base) ease;
      }
      .aps-home .aps-glass-card:hover .aps-card-icon {
        transform: translateY(-3px) rotate(-5deg);
        border-color: rgba(255,104,123,.55);
        background: rgba(237,52,72,.14);
      }
      .aps-home .aps-fact {
        transition:
          border-color var(--aps-motion-fast) ease,
          background var(--aps-motion-fast) ease,
          transform var(--aps-motion-fast) ease;
      }
      .aps-home .aps-fact:hover {
        transform: translateY(-2px);
        border-color: rgba(255,255,255,.17);
        background: rgba(255,255,255,.045);
      }
      .aps-home .aps-skill-card {
        position: relative;
        overflow: hidden;
      }
      .aps-home .aps-skill-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 2px;
        opacity: 0;
        background: linear-gradient(180deg,transparent,var(--red-bright),transparent);
        transition: opacity var(--aps-motion-base) ease;
      }
      .aps-home .aps-skill-card:hover::before {
        opacity: 1;
      }
      .aps-home .aps-skill-icon {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(237,52,72,.18);
        border-radius: 9px;
        background: rgba(237,52,72,.055);
      }
      .aps-home .aps-skill-meter {
        position: relative;
      }
      .aps-home .aps-skill-meter span {
        position: relative;
        overflow: hidden;
      }
      .aps-home .aps-skill-meter span::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);
        animation: apsMeterShine 3.8s ease-in-out infinite;
      }
      @keyframes apsMeterShine {
        0%,55% { transform: translateX(-110%); }
        100% { transform: translateX(110%); }
      }
      .aps-home .aps-project-card {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      .aps-home .aps-project-card::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 2;
        opacity: 0;
        pointer-events: none;
        background: linear-gradient(115deg,transparent 20%,rgba(255,255,255,.055) 48%,transparent 72%);
        transform: translateX(-110%);
        transition: transform .9s ease,opacity .3s ease;
      }
      .aps-home .aps-project-card:hover::before {
        opacity: 1;
        transform: translateX(110%);
      }
      .aps-home .aps-project-card-meta b {
        color: #fff;
        font-variant-numeric: tabular-nums;
      }
      .aps-home .aps-project-status.is-live {
        border-color: rgba(114,216,154,.3);
        color: #9be4b5;
        background: rgba(66,166,108,.08);
      }
      .aps-home .aps-project-art.has-image {
        background: #0d0d11;
      }
      .aps-home .aps-project-art.has-image > img {
        object-position: top center;
      }
      .aps-home .aps-project-art.has-image::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        border: 1px solid rgba(255,255,255,.045);
        box-shadow: inset 0 -70px 80px rgba(0,0,0,.24);
      }
      .aps-home .aps-project-art-overlay a {
        transition: transform var(--aps-motion-fast) ease,background var(--aps-motion-fast) ease;
      }
      .aps-home .aps-project-art-overlay a:hover {
        transform: translateY(-2px);
        background: #e72f47;
      }
      .aps-home .aps-project-stack span {
        transition: border-color var(--aps-motion-fast) ease,color var(--aps-motion-fast) ease;
      }
      .aps-home .aps-project-stack span:hover {
        color: #fff;
        border-color: rgba(255,104,123,.42);
      }
      .aps-home .aps-project-actions a svg {
        flex: 0 0 auto;
      }
      .aps-home .aps-project-actions a:focus-visible {
        border-radius: 3px;
      }
      .aps-home .aps-dsa-panel {
        position: relative;
        overflow: hidden;
      }
      .aps-home .aps-dsa-panel::after {
        content: "DSA";
        position: absolute;
        right: 2%;
        bottom: -26%;
        color: rgba(255,255,255,.025);
        font-size: clamp(100px,20vw,240px);
        font-weight: 950;
        line-height: 1;
        letter-spacing: -.09em;
        pointer-events: none;
      }
      .aps-home .aps-dsa-number {
        position: relative;
        z-index: 1;
        text-shadow: 0 12px 45px rgba(237,52,72,.16);
      }
      .aps-home .aps-dsa-row {
        position: relative;
        z-index: 1;
        transition: padding var(--aps-motion-fast) ease,border-color var(--aps-motion-fast) ease;
      }
      .aps-home .aps-dsa-row:hover {
        padding-inline: 7px;
        border-color: rgba(255,104,123,.28);
      }
      .aps-home .aps-record {
        position: relative;
        overflow: hidden;
        transition:
          transform var(--aps-motion-base) ease,
          border-color var(--aps-motion-base) ease,
          background var(--aps-motion-base) ease;
      }
      .aps-home .aps-record:hover {
        transform: translateX(4px);
        border-color: rgba(255,104,123,.32);
        background: rgba(237,52,72,.035);
      }
      .aps-home .aps-record a {
        transition: color var(--aps-motion-fast) ease,gap var(--aps-motion-fast) ease;
      }
      .aps-home .aps-record a:hover {
        gap: 10px;
        color: var(--red-bright);
      }
      .aps-home .aps-timeline-item {
        transition:
          transform var(--aps-motion-base) ease,
          border-color var(--aps-motion-base) ease,
          background var(--aps-motion-base) ease;
      }
      .aps-home .aps-timeline-item:hover {
        background: rgba(237,52,72,.035);
      }
      .aps-home .aps-goal-card {
        position: relative;
        overflow: hidden;
      }
      .aps-home .aps-goal-card::after {
        content: "";
        position: absolute;
        top: -65px;
        right: -65px;
        width: 130px;
        aspect-ratio: 1;
        border: 1px solid rgba(255,255,255,.055);
        border-radius: 50%;
        box-shadow: 0 0 0 15px rgba(255,255,255,.012),0 0 0 30px rgba(255,255,255,.008);
        pointer-events: none;
      }
      .aps-home .aps-goal-progress {
        position: relative;
      }
      .aps-home .aps-goal-progress span {
        position: relative;
        border-radius: inherit;
        box-shadow: 0 0 14px rgba(237,52,72,.28);
      }
      .aps-home .aps-cta {
        isolation: isolate;
        box-shadow: 0 28px 90px rgba(0,0,0,.24);
      }
      .aps-home .aps-cta::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        opacity: .5;
        background-image:
          linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
        background-size: 38px 38px;
        mask-image: linear-gradient(110deg,black,transparent 75%);
      }
      .aps-home .aps-quick-links a {
        transition:
          transform var(--aps-motion-fast) ease,
          border-color var(--aps-motion-fast) ease,
          color var(--aps-motion-fast) ease,
          background var(--aps-motion-fast) ease;
      }
      .aps-home .aps-quick-links a:hover {
        transform: translateY(-2px);
      }
      .aps-home .aps-back-top {
        transition:
          transform var(--aps-motion-base) ease,
          border-color var(--aps-motion-base) ease,
          background var(--aps-motion-base) ease,
          box-shadow var(--aps-motion-base) ease;
      }
      .aps-home .aps-back-top:hover {
        box-shadow: 0 12px 34px rgba(237,52,72,.24);
      }
      .aps-home .aps-empty-state {
        background:
          radial-gradient(ellipse at 50% 0%,rgba(237,52,72,.055),transparent 65%),
          rgba(255,255,255,.012);
      }
      .aps-home .aps-empty-state > div {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(237,52,72,.2);
        border-radius: 13px;
        background: rgba(237,52,72,.06);
      }
      .aps-home .aps-tech-strip {
        position: relative;
        align-items: center;
      }
      .aps-home .aps-tech-strip span {
        transition: color var(--aps-motion-fast) ease,transform var(--aps-motion-fast) ease;
      }
      .aps-home .aps-tech-strip span:hover {
        color: #fff;
        transform: translateY(-2px);
      }
      .aps-home .aps-tech-strip span svg {
        transition: transform var(--aps-motion-fast) ease;
      }
      .aps-home .aps-tech-strip span:hover svg {
        transform: rotate(-8deg) scale(1.12);
      }
      .aps-home .aps-socials a {
        position: relative;
        overflow: hidden;
      }
      .aps-home .aps-socials a::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle,rgba(255,255,255,.18),transparent 68%);
        opacity: 0;
        transition: opacity var(--aps-motion-fast) ease;
      }
      .aps-home .aps-socials a:hover::after {
        opacity: 1;
      }
      .aps-home .aps-location svg {
        color: var(--red-bright);
        flex: 0 0 auto;
      }
      .aps-home .aps-handwrite {
        text-shadow: 0 4px 18px rgba(0,0,0,.35);
      }
      .aps-home .aps-eyebrow {
        text-shadow: 0 4px 18px rgba(237,52,72,.14);
      }
      .aps-home .aps-section-head {
        position: relative;
      }
      .aps-home .aps-section-head::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: -17px;
        left: 0;
        height: 1px;
        opacity: .55;
        background: linear-gradient(90deg,rgba(255,255,255,.13),transparent 72%);
        pointer-events: none;
      }
      .aps-home .aps-project-grid {
        align-items: stretch;
      }
      .aps-home .aps-project-grid > * {
        min-width: 0;
      }
      .aps-home .aps-project-card-inner {
        min-height: 100%;
      }
      .aps-home .aps-project-card-content {
        min-width: 0;
      }
      .aps-home .aps-project-title-row h3 {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-project-card-content > p {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-project-art-footer span:last-child {
        text-align: right;
      }
      .aps-home .aps-project-art-overlay {
        max-width: calc(100% - 26px);
      }
      .aps-home .aps-project-art-overlay a {
        white-space: nowrap;
      }
      .aps-home .aps-project-kicker {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-project-card-meta > span:first-child {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .aps-home .aps-project-status {
        flex: 0 0 auto;
      }
      .aps-home .aps-hero-foot button {
        min-height: 34px;
        padding: 4px 0;
      }
      .aps-home .aps-hero-foot button svg {
        transition: transform var(--aps-motion-fast) ease;
      }
      .aps-home .aps-hero-foot button:hover svg {
        transform: translate(3px,2px);
      }
      .aps-home .aps-hero-foot button:last-child:hover svg {
        transform: translateY(3px);
      }
      .aps-home .aps-profile-stage {
        transform-style: preserve-3d;
      }
      .aps-home .aps-profile-stage-grid {
        pointer-events: none;
      }
      .aps-home .aps-photo-caption {
        padding: 8px 10px;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 30px;
        background: rgba(8,8,11,.48);
        backdrop-filter: blur(10px);
      }
      .aps-home .aps-stage-index {
        padding: 7px 9px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 5px;
        background: rgba(8,8,11,.28);
      }
      .aps-home .aps-stage-chip {
        border-color: rgba(255,255,255,.2);
        background: linear-gradient(135deg,rgba(19,17,21,.88),rgba(8,8,11,.74));
      }
      .aps-home .aps-stage-chip strong {
        white-space: nowrap;
      }
      .aps-home .aps-profile-orbit {
        pointer-events: none;
      }
      .aps-home .aps-profile-orbit::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #ff8290;
        box-shadow: 0 0 16px rgba(255,104,123,.9);
        transform: translate(-50%,-50%) translateX(50%);
      }
      .aps-home .aps-orbit-b::after {
        width: 4px;
        height: 4px;
        background: #fff;
        box-shadow: 0 0 12px rgba(255,255,255,.8);
      }
      .aps-home .aps-orbit-c::after {
        width: 6px;
        height: 6px;
      }
      .aps-home .aps-hero-grid {
        align-items: center;
      }
      .aps-home .aps-hero-copy {
        max-width: 630px;
      }
      .aps-home .aps-hero-description {
        text-wrap: pretty;
      }
      .aps-home .aps-hero-title {
        text-wrap: balance;
      }
      .aps-home .aps-button {
        cursor: pointer;
        user-select: none;
      }
      .aps-home .aps-button:active {
        transform: translateY(0) scale(.985);
      }
      .aps-home .aps-button-ghost {
        border-color: rgba(255,255,255,.2);
      }
      .aps-home .aps-button-ghost:active {
        background: rgba(255,255,255,.08);
      }
      .aps-home .aps-section-label i {
        flex: 0 0 22px;
      }
      .aps-home .aps-record-list {
        min-width: 0;
      }
      .aps-home .aps-record h4 {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-record p {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-timeline-item h3 {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-goal-card h3 {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-fact strong {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-skill-copy {
        min-width: 0;
      }
      .aps-home .aps-skill-copy strong {
        overflow-wrap: anywhere;
      }
      .aps-home .aps-skill-copy small {
        flex: 0 0 auto;
      }
      .aps-home .aps-stats {
        align-items: stretch;
      }
      .aps-home .aps-stats > * {
        min-height: 100%;
      }
      .aps-home .aps-cta-actions .aps-button {
        min-width: 170px;
      }
      .aps-home .aps-quick-links {
        max-width: 760px;
      }
      .aps-home .aps-back-top {
        -webkit-backdrop-filter: blur(14px);
      }
      @media (max-width: 1050px) {
        .aps-home .aps-project-grid {
          gap: 13px;
        }
        .aps-home .aps-project-art {
          height: 210px;
        }
        .aps-home .aps-project-card-content {
          padding-inline: 15px;
        }
        .aps-home .aps-project-title-row h3 {
          font-size: 17px;
        }
        .aps-home .aps-profile-stage {
          transform: scale(.96);
          transform-origin: center;
        }
      }
      @media (max-width: 760px) {
        .aps-home .aps-section-head::after {
          bottom: -12px;
        }
        .aps-home .aps-project-art {
          height: 238px;
        }
        .aps-home .aps-project-card-content {
          padding: 18px;
        }
        .aps-home .aps-project-card-content > p {
          min-height: 0;
        }
        .aps-home .aps-project-card-bottom {
          align-items: flex-start;
          flex-direction: column;
        }
        .aps-home .aps-project-index {
          display: none;
        }
        .aps-home .aps-hero-title {
          max-width: 100%;
          overflow-wrap: anywhere;
        }
        .aps-home .aps-hero-actions .aps-button {
          min-width: 0;
        }
        .aps-home .aps-socials {
          margin-top: 20px;
        }
        .aps-home .aps-stats > * {
          min-height: 94px;
        }
        .aps-home .aps-dsa-panel::after {
          right: -3%;
          bottom: -12%;
          font-size: 130px;
        }
      }
      @media (max-width: 520px) {
        .aps-home .aps-project-art {
          height: 215px;
        }
        .aps-home .aps-project-art-overlay {
          top: 9px;
          right: 9px;
        }
        .aps-home .aps-preview-kind {
          padding: 6px 7px;
          font-size: 6px;
        }
        .aps-home .aps-project-art-overlay a {
          padding: 6px 7px;
          font-size: 6px;
        }
        .aps-home .aps-project-actions {
          gap: 11px;
        }
        .aps-home .aps-project-actions a {
          font-size: 8px;
        }
        .aps-home .aps-cta-actions .aps-button {
          width: 100%;
        }
        .aps-home .aps-quick-links a {
          padding: 8px 9px;
        }
      }
      @media (max-width: 360px) {
        .aps-home .aps-project-art {
          height: 190px;
        }
        .aps-home .aps-project-title-row h3 {
          font-size: 17px;
        }
        .aps-home .aps-project-card-content {
          padding: 15px;
        }
        .aps-home .aps-project-stack span {
          font-size: 7px;
        }
        .aps-home .aps-hero-title {
          font-size: 47px;
        }
        .aps-home .aps-profile-stage {
          height: 330px;
        }
        .aps-home .aps-stage-chip {
          min-width: 94px;
          padding: 8px;
        }
      }
      @media (hover: none) {
        .aps-home .aps-project-card::before {
          display: none;
        }
        .aps-home .aps-project-card:hover {
          transform: none;
        }
        .aps-home .aps-project-card:hover .aps-project-art > img {
          transform: none;
        }
        .aps-home .aps-record:hover {
          transform: none;
        }
        .aps-home .aps-glass-card:hover {
          box-shadow: none;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-home .aps-skill-meter span::after {
          animation: none !important;
        }
        .aps-home .aps-project-card::before {
          display: none !important;
        }
      }
      @media (forced-colors: active) {
        .aps-home .aps-project-status,
        .aps-home .aps-preview-kind,
        .aps-home .aps-stage-chip,
        .aps-home .aps-button {
          border: 1px solid CanvasText;
        }
        .aps-home .aps-live-dot {
          outline: 1px solid CanvasText;
        }
      }
      @media print {
        .aps-home .aps-hero-background,
        .aps-home .aps-profile-orbit,
        .aps-home .aps-orbit-particle,
        .aps-home .aps-stage-chip,
        .aps-home .aps-project-art-overlay,
        .aps-home .aps-back-top {
          display: none !important;
        }
        .aps-home .aps-project-card,
        .aps-home .aps-glass-card,
        .aps-home .aps-record,
        .aps-home .aps-timeline-item {
          break-inside: avoid;
          box-shadow: none !important;
          background: #fff !important;
          color: #111 !important;
        }
      }

      @keyframes apsFloat { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-23px,0); } }
      @keyframes apsOrbit { from { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(0); } to { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(360deg); } }
      @media (max-width: 1250px) {
        .aps-hero-background-image { background-position: 57% center; }
        .aps-hero-background-vignette {
          background:
            linear-gradient(90deg, rgba(5,5,8,.92), rgba(5,5,8,.66) 48%, rgba(5,5,8,.55)),
            linear-gradient(180deg, rgba(5,5,8,.16), transparent 48%, #08080b);
        }
      }
      @media (max-width: 760px) {
        .aps-hero-background-image {
          background-position: 62% center;
          opacity: .23;
          animation-duration: 38s;
        }
        .aps-hero-background-vignette {
          background:
            linear-gradient(180deg, rgba(5,5,8,.62), rgba(5,5,8,.56) 45%, #08080b 96%),
            linear-gradient(90deg, rgba(5,5,8,.74), rgba(5,5,8,.24));
        }
        .aps-hero-light-beam { opacity: .07; }
        .aps-profile-stage { perspective: 900px; }
        .aps-orbit-particle { opacity: .65; }
        .aps-orbit-c { width: 110%; }
      }
      @media (max-width: 420px) {
        .aps-hero-background-image { opacity: .19; background-position: 60% center; }
        .aps-stage-depth-grid { opacity: .12; }
        .aps-profile-orbit { opacity: .7; }
        .aps-orbit-particle { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-hero-background-image,
        .aps-hero-light-beam,
        .aps-orbit-c,
        .aps-orbit-core,
        .aps-orbit-particle,
        .aps-profile-stage::before,
        .aps-stage-chip {
          animation: none !important;
        }
      }
      @media (max-width: 1050px) {
        .aps-hero-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
        .aps-hero-title { font-size: clamp(55px,7.5vw,83px); }
        .aps-profile-stage { height: 510px; }
        .aps-project-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-skill-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
      }
      @media (max-width: 760px) {
        .aps-hero { min-height: auto; padding-bottom: 40px; }
        .aps-topline { align-items: flex-start; padding-top: 12px; }
        .aps-hero-grid { display: flex; flex-direction: column; align-items: stretch; min-height: 0; }
        .aps-hero-copy { padding: 65px 0 20px; }
        .aps-hero-title { font-size: clamp(57px,13vw,88px); }
        .aps-profile-stage { width: 100%; height: 440px; }
        .aps-profile-photo-frame { inset: 8% 11% 7%; }
        .aps-hero-foot { flex-wrap: wrap; }
        .aps-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-section { padding: 75px 0; }
        .aps-section-head { align-items: flex-start; flex-direction: column; gap: 10px; margin-bottom: 25px; }
        .aps-about-grid,.aps-two-col,.aps-dsa-panel { grid-template-columns: 1fr; }
        .aps-project-grid { grid-template-columns: 1fr; }
        .aps-project-art { height: 245px; }
        .aps-project-card-content > p { min-height: 0; }
        .aps-project-card-bottom { align-items: flex-start; flex-direction: column; }
        .aps-project-index { display: none; }
        .aps-skill-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-goal-grid { grid-template-columns: 1fr; }
        .aps-tech-strip { justify-content: flex-start; margin-bottom: 25px; }
        .aps-cta { margin-bottom: 65px; }
      }
      @media (max-width: 420px) {
        .aps-wrap,.aps-topline,.aps-hero-grid,.aps-hero-foot,.aps-stats,.aps-section,.aps-tech-strip,.aps-cta { width: 92%; }
        .aps-topline { font-size: 7px; letter-spacing: 1px; }
        .aps-availability { max-width: 43%; font-size: 7px; }
        .aps-hero-title { font-size: 52px; letter-spacing: -.07em; }
        .aps-profile-stage { height: 365px; }
        .aps-stage-chip { min-width: 105px; padding: 9px; }
        .aps-stage-chip strong { font-size: 8px; }
        .aps-chip-left { left: -3px; }
        .aps-chip-top { right: -3px; }
        .aps-profile-fallback span { width: 120px; font-size: 42px; }
        .aps-stats { gap: 8px; }
        .aps-glass-card { padding: 22px; }
        .aps-facts { grid-template-columns: 1fr; }
        .aps-skill-grid { gap: 8px; }
        .aps-skill-card { padding: 13px; }
        .aps-dsa-panel { padding: 20px; }
        .aps-cta { padding: 27px 21px; }
      }
      @media (hover: none) {
        .aps-project-card:hover,.aps-skill-card:hover,.aps-goal-card:hover,.aps-button:hover { transform: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-home *, .aps-home *::before, .aps-home *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
      }
      @media print {
        .aps-home { color: #111; background: #fff; }
        .aps-hero-orb,.aps-hero-word,.aps-profile-orbit,.aps-back-top { display: none !important; }
        .aps-hero { min-height: auto; background: #fff; }
        .aps-hero-grid { display: block; min-height: 0; }
        .aps-profile-stage { display: none; }
        .aps-section { padding: 25px 0; break-inside: avoid; }
        .aps-button,.aps-socials,.aps-quick-links { display: none !important; }
      }

      /* ============================================================
         APS CUTOUT HERO — transparent subject, 3D depth and scroll motion
         ============================================================ */
      .aps-hero-cinematic {
        min-height: 900px;
        background:
          radial-gradient(ellipse at 73% 42%, rgba(194, 19, 48, .19), transparent 37%),
          radial-gradient(ellipse at 52% 85%, rgba(111, 15, 34, .15), transparent 42%),
          #050507 !important;
      }
      .aps-hero-background-image {
        background-image:
          linear-gradient(90deg, rgba(4,4,7,.90), rgba(4,4,7,.38) 58%, rgba(4,4,7,.68)),
          url("/images/hero-bg.jpg");
        opacity: .28;
        filter: saturate(.7) contrast(1.1) brightness(.48);
      }
      .aps-profile-stage {
        height: min(690px, 56vw);
        min-height: 480px;
        max-width: 720px;
        perspective: 1600px;
        transform-style: preserve-3d;
        overflow: visible;
      }
      .aps-profile-stage::before {
        inset: 18% 8% 0;
        background: radial-gradient(ellipse, rgba(255,38,70,.30), rgba(105,13,34,.12) 42%, transparent 72%);
        filter: blur(48px);
      }
      .aps-profile-photo-frame.aps-cutout-frame {
        inset: 0 0 1%;
        overflow: visible;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        transform: translateZ(70px);
        transform-style: preserve-3d;
        will-change: transform;
      }
      .aps-profile-photo-frame.aps-cutout-frame::after {
        display: none;
      }
      .aps-profile-photo-frame .aps-hero-cutout {
        position: relative;
        z-index: 3;
        display: block;
        width: min(100%, 650px);
        height: 100%;
        max-height: 660px;
        object-fit: contain;
        object-position: center bottom;
        border: 0;
        border-radius: 0;
        background: transparent;
        filter:
          drop-shadow(0 0 2px rgba(255,255,255,.16))
          drop-shadow(0 15px 22px rgba(0,0,0,.55))
          drop-shadow(0 0 28px rgba(255,37,68,.25));
        transform: translateZ(48px);
        transform-origin: 50% 72%;
        backface-visibility: visible;
        user-select: none;
        pointer-events: none;
      }
      .aps-profile-photo-frame.aps-cutout-frame .aps-profile-fallback {
        display: none;
      }
      .aps-photo-edge {
        inset: 16% 8% 5%;
        z-index: -2;
        border: 1px solid rgba(255,55,83,.28);
        border-radius: 50%;
        transform: translateZ(-45px) rotateX(70deg) rotateZ(-15deg);
        box-shadow: 0 0 45px rgba(255,35,65,.16), inset 0 0 50px rgba(255,35,65,.08);
      }
      .aps-profile-orbit {
        border-color: rgba(255,69,94,.42);
        box-shadow: 0 0 32px rgba(255,31,65,.13), inset 0 0 32px rgba(255,31,65,.06);
      }
      .aps-orbit-a {
        width: 94%;
        aspect-ratio: 1.3;
        transform: translate(-50%,-50%) rotateX(72deg) rotateZ(-18deg);
        animation: apsCutoutOrbitA 22s linear infinite;
      }
      .aps-orbit-b {
        width: 78%;
        aspect-ratio: 1.2;
        transform: translate(-50%,-50%) rotateX(70deg) rotateZ(52deg);
        animation: apsCutoutOrbitB 30s linear infinite reverse;
      }
      .aps-orbit-c {
        width: 108%;
        height: 42%;
        transform: translate(-50%,-50%) rotateX(76deg) rotateZ(10deg);
        animation: apsCutoutOrbitC 26s linear infinite;
      }
      .aps-orbit-core {
        top: 60%;
        width: 62%;
        background: radial-gradient(ellipse, rgba(255,37,69,.28), rgba(145,17,42,.10) 45%, transparent 72%);
        filter: blur(8px);
      }
      .aps-photo-caption {
        bottom: 2%;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 6;
      }
      .aps-chip-top { top: 15%; right: -1%; }
      .aps-chip-left { bottom: 27%; left: -2%; }
      .aps-chip-bottom { bottom: 8%; right: 1%; }
      .aps-stage-chip {
        z-index: 7;
        border-color: rgba(255,89,110,.28);
        background: rgba(9,8,12,.72);
        box-shadow: 0 0 28px rgba(237,52,72,.10), 0 16px 45px rgba(0,0,0,.32);
      }
      .aps-hero-cinematic .aps-hero-grid {
        min-height: 690px;
        grid-template-columns: .88fr 1.12fr;
        gap: 18px;
      }
      .aps-hero-cinematic .aps-hero-copy {
        z-index: 8;
      }
      .aps-hero-cinematic .aps-hero-title {
        font-size: clamp(58px, 7.2vw, 104px);
      }
      .aps-hero-cinematic .aps-hero-word {
        top: 125px;
        left: 57%;
        opacity: .72;
      }
      .aps-hero-cinematic .aps-stats {
        margin-top: 8px;
      }
      .aps-hero-cinematic .aps-hero-background-vignette {
        background:
          linear-gradient(90deg, rgba(4,4,7,.94) 0%, rgba(4,4,7,.73) 35%, rgba(4,4,7,.16) 68%, rgba(4,4,7,.58) 100%),
          linear-gradient(180deg, rgba(4,4,7,.12), rgba(4,4,7,.04) 52%, #08080b 100%);
      }
      .aps-home {
        background:
          radial-gradient(ellipse at 8% 25%, rgba(117,13,35,.10), transparent 28%),
          radial-gradient(ellipse at 94% 56%, rgba(117,13,35,.08), transparent 25%),
          #070709 !important;
      }
      .aps-section {
        z-index: 1;
      }
      .aps-section:nth-of-type(odd) {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.012), transparent);
      }
      .aps-cta {
        position: relative;
        isolation: isolate;
      }
      .aps-cta::before {
        content: "";
        position: absolute;
        z-index: -1;
        inset: 0;
        background: radial-gradient(ellipse at 50% 100%, rgba(237,52,72,.18), transparent 62%);
        pointer-events: none;
      }
      @keyframes apsCutoutOrbitA {
        from { transform: translate(-50%,-50%) rotateX(72deg) rotateZ(-18deg); }
        to { transform: translate(-50%,-50%) rotateX(72deg) rotateZ(342deg); }
      }
      @keyframes apsCutoutOrbitB {
        from { transform: translate(-50%,-50%) rotateX(70deg) rotateZ(52deg); }
        to { transform: translate(-50%,-50%) rotateX(70deg) rotateZ(412deg); }
      }
      @keyframes apsCutoutOrbitC {
        from { transform: translate(-50%,-50%) rotateX(76deg) rotateZ(10deg); }
        to { transform: translate(-50%,-50%) rotateX(76deg) rotateZ(370deg); }
      }
      @media (max-width: 980px) {
        .aps-hero-cinematic .aps-hero-grid {
          grid-template-columns: 1fr 1fr;
          min-height: 620px;
        }
        .aps-profile-stage { height: 560px; min-height: 430px; }
        .aps-stage-chip { min-width: 108px; padding: 9px 10px; }
      }
      @media (max-width: 700px) {
        .aps-hero-cinematic { min-height: auto; padding-bottom: 45px; }
        .aps-hero-cinematic .aps-hero-grid {
          grid-template-columns: 1fr;
          min-height: auto;
          gap: 0;
        }
        .aps-hero-cinematic .aps-hero-copy { padding: 46px 0 10px; }
        .aps-hero-cinematic .aps-hero-title { font-size: clamp(54px, 15vw, 82px); }
        .aps-profile-stage {
          width: 100%;
          height: min(112vw, 520px);
          min-height: 350px;
          margin-top: -5px;
        }
        .aps-profile-photo-frame.aps-cutout-frame { inset: 0; }
        .aps-profile-photo-frame .aps-hero-cutout { width: 100%; max-height: 100%; }
        .aps-chip-top { right: 0; top: 13%; }
        .aps-chip-left { left: 0; bottom: 25%; }
        .aps-chip-bottom { right: 0; bottom: 6%; }
        .aps-photo-caption { bottom: 0; font-size: 6px; }
        .aps-hero-word { top: 40%; font-size: 24vw; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-orbit-a, .aps-orbit-b, .aps-orbit-c,
        .aps-hero-background-image, .aps-hero-light-beam {
          animation: none !important;
        }
      }


      /* ============================================================
         FULL-PAGE FLOATING PORTRAIT — persistent scroll-reactive layer
         ============================================================ */
      .aps-home { position: relative; isolation: isolate; background: #07070a !important; }
      .aps-global-portrait-scene {
        position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        perspective: 1600px; transform-style: preserve-3d;
        background: radial-gradient(ellipse at 76% 38%, rgba(130,18,42,.12), transparent 44%);
      }
      .aps-global-portrait-aura {
        position: absolute; width: min(66vw, 900px); aspect-ratio: 1; right: -6vw; top: 8%;
        border-radius: 50%; background: radial-gradient(circle, rgba(232,35,65,.18), rgba(102,15,39,.08) 42%, transparent 70%);
        filter: blur(24px); animation: apsGlobalAura 11s ease-in-out infinite alternate;
      }
      .aps-global-portrait-object {
        position: absolute; right: clamp(-5%, 3vw, 8%); top: 50%; width: min(48vw, 690px);
        height: min(88vh, 850px); display: flex; align-items: center; justify-content: center;
        transform-style: preserve-3d; will-change: transform, opacity; transform-origin: 50% 55%;
        filter: drop-shadow(0 25px 45px rgba(0,0,0,.42));
      }
      .aps-global-portrait-object img {
        display: block; width: 100%; height: 100%; object-fit: contain; object-position: center;
        user-select: none; backface-visibility: visible;
        filter: drop-shadow(0 0 28px rgba(239,42,69,.18)) drop-shadow(0 35px 32px rgba(0,0,0,.35));
      }
      .aps-global-portrait-orbit {
        position: absolute; right: 8%; top: 49%; width: min(48vw, 690px); aspect-ratio: 1.45;
        border: 1px solid rgba(255,75,100,.22); border-radius: 50%;
        transform: translateY(-50%) rotateX(69deg) rotateZ(-17deg);
        box-shadow: 0 0 45px rgba(236,35,65,.08), inset 0 0 45px rgba(236,35,65,.04);
      }
      .aps-global-orbit-one { animation: apsGlobalOrbit 34s linear infinite; }
      .aps-global-orbit-two { width: min(40vw, 570px); right: 12%; border-style: dashed; opacity: .7; animation: apsGlobalOrbitReverse 48s linear infinite; }
      .aps-global-orbit-three { width: min(55vw, 780px); right: 4%; border-color: rgba(255,255,255,.09); transform: translateY(-50%) rotateX(73deg) rotateZ(34deg); }
      .aps-global-portrait-glow {
        position: absolute; right: 12%; top: 43%; width: min(40vw, 570px); aspect-ratio: 1;
        border-radius: 50%; background: rgba(220,25,58,.08); filter: blur(100px);
      }
      .aps-home > section { position: relative; z-index: 1; }
      .aps-home .aps-hero, .aps-home .aps-section, .aps-home .aps-cta { background-color: transparent !important; }
      .aps-home .aps-hero-background { background: linear-gradient(90deg,rgba(5,5,8,.88),rgba(5,5,8,.22) 65%,rgba(5,5,8,.48)) !important; }
      .aps-home .aps-hero-background-image { opacity: .16 !important; }
      .aps-home .aps-section::before { opacity: .8; }
      .aps-home .aps-glass-card, .aps-home .aps-project-card, .aps-home .aps-skill-card,
      .aps-home .aps-stats > * { backdrop-filter: blur(18px); background-color: rgba(12,12,16,.72); }
      .aps-profile-stage { z-index: 2; }
      .aps-profile-photo-frame.aps-profile-card-frame {
        inset: 8% 16% 8%; overflow: hidden; display: block; border: 1px solid rgba(255,255,255,.2);
        border-radius: 46% 46% 22px 22px; background: linear-gradient(145deg,rgba(38,35,39,.85),rgba(8,8,12,.9));
        box-shadow: 0 28px 80px rgba(0,0,0,.48),0 0 55px rgba(237,52,72,.13);
        transform: translateZ(28px);
      }
      .aps-profile-photo-frame.aps-profile-card-frame::after { display: block; }
      .aps-profile-card-image { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center 24%; filter: saturate(.9) contrast(1.05); }
      .aps-profile-card-frame .aps-profile-fallback { display: flex; }
      @keyframes apsGlobalAura { from { transform: scale(.92) translate3d(0,0,0); opacity:.65; } to { transform: scale(1.1) translate3d(-2%,2%,0); opacity:1; } }
      @keyframes apsGlobalOrbit { from { transform: translateY(-50%) rotateX(69deg) rotateZ(0); } to { transform: translateY(-50%) rotateX(69deg) rotateZ(360deg); } }
      @keyframes apsGlobalOrbitReverse { from { transform: translateY(-50%) rotateX(69deg) rotateZ(360deg); } to { transform: translateY(-50%) rotateX(69deg) rotateZ(0); } }
      @media (max-width: 900px) {
        .aps-global-portrait-object { width: min(76vw,640px); height: 72vh; right: -10%; top: 47%; opacity: .34; }
        .aps-global-portrait-orbit { width: 66vw; right: -2%; top: 47%; }
        .aps-global-orbit-two { width: 54vw; right: 4%; }
        .aps-global-orbit-three { width: 76vw; right: -8%; }
        .aps-global-portrait-aura,.aps-global-portrait-glow { right: -15%; top: 30%; width: 80vw; }
      }
      @media (max-width: 600px) {
        .aps-global-portrait-object { width: 100vw; height: 60vh; right: -28%; top: 42%; opacity: .24; }
        .aps-global-portrait-orbit { width: 84vw; right: -25%; top: 42%; opacity: .6; }
        .aps-global-orbit-two { width: 70vw; right: -15%; }
        .aps-global-orbit-three { width: 95vw; right: -30%; }
        .aps-profile-photo-frame.aps-profile-card-frame { inset: 10% 18% 9%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-global-portrait-aura,.aps-global-orbit-one,.aps-global-orbit-two { animation: none !important; }
      }

      /* ============================================================
         TOOLKIT 2.0 — category explorer, search and premium skill tiles
         ============================================================ */
      .aps-toolkit-section { position: relative; }
      .aps-toolkit-intro {
        display:flex; align-items:center; justify-content:space-between; gap:24px;
        margin: 8px 0 22px; padding: 24px 27px; border:1px solid rgba(255,255,255,.11);
        border-radius:15px; background:
          radial-gradient(ellipse at 82% 5%,rgba(237,52,72,.16),transparent 48%),
          linear-gradient(120deg,rgba(25,22,27,.94),rgba(9,10,14,.88));
        box-shadow:0 20px 60px rgba(0,0,0,.2);
      }
      .aps-toolkit-intro-copy { min-width:0; }
      .aps-toolkit-overline { display:inline-flex; align-items:center; gap:9px; color:#ff8795; font-size:8px; font-weight:900; letter-spacing:1.7px; }
      .aps-toolkit-intro h3 { margin:12px 0 7px; color:#f7f2ef; font-size:clamp(20px,2.6vw,30px); line-height:1.12; letter-spacing:-1px; }
      .aps-toolkit-intro h3 em { color:#ff687b; font-style:normal; }
      .aps-toolkit-intro p { max-width:680px; margin:0; color:#a9a09e; font-size:10px; line-height:1.8; }
      .aps-toolkit-total { flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:13px 16px; border:1px solid rgba(255,104,123,.24); border-radius:10px; background:rgba(237,52,72,.055); }
      .aps-toolkit-total strong { color:#fff; font-size:35px; line-height:1; letter-spacing:-2px; }
      .aps-toolkit-total span { color:#b9aeb0; font-size:7px; font-weight:850; line-height:1.65; letter-spacing:1.2px; }
      .aps-skill-controls { display:flex; align-items:center; justify-content:space-between; gap:14px; margin:0 0 17px; }
      .aps-skill-filters { display:flex; flex-wrap:wrap; gap:7px; }
      .aps-skill-filter { display:inline-flex; align-items:center; gap:8px; min-height:34px; padding:0 11px; border:1px solid rgba(255,255,255,.12); border-radius:6px; color:#aaa2a0; background:rgba(255,255,255,.025); font-size:8px; font-weight:750; cursor:pointer; transition:all .22s ease; }
      .aps-skill-filter span { min-width:17px; padding:2px 4px; border-radius:4px; color:#8e8585; background:rgba(255,255,255,.06); font-size:7px; text-align:center; }
      .aps-skill-filter:hover,.aps-skill-filter.is-active { color:#fff; border-color:rgba(255,104,123,.48); background:rgba(237,52,72,.11); }
      .aps-skill-filter.is-active span { color:#fff; background:rgba(237,52,72,.35); }
      .aps-skill-search { display:flex; align-items:center; gap:8px; width:min(250px,100%); min-height:36px; padding:0 10px; border:1px solid rgba(255,255,255,.13); border-radius:6px; color:#ff788a; background:rgba(10,10,14,.62); }
      .aps-skill-search:focus-within { border-color:rgba(255,104,123,.55); box-shadow:0 0 0 3px rgba(237,52,72,.07); }
      .aps-skill-search input { width:100%; min-width:0; border:0; outline:0; color:#f7f2ef; background:transparent; font:inherit; font-size:9px; }
      .aps-skill-search input::placeholder { color:#766e70; }
      .aps-skill-search button { display:grid; place-items:center; padding:3px; border:0; color:#aaa; background:transparent; cursor:pointer; }
      .aps-skill-grid-premium { align-items:stretch; }
      .aps-skill-grid-premium > * { min-width:0; }
      .aps-skill-grid-premium .aps-skill-card { min-height:156px; padding:18px; border-color:rgba(255,255,255,.105); border-radius:12px; background:linear-gradient(145deg,rgba(24,23,28,.91),rgba(10,11,15,.88)); box-shadow:0 12px 32px rgba(0,0,0,.13); }
      .aps-skill-grid-premium .aps-skill-card::after { content:""; position:absolute; right:-36px; top:-52px; width:115px; aspect-ratio:1; border:1px solid rgba(255,104,123,.11); border-radius:50%; box-shadow:0 0 0 15px rgba(255,104,123,.018),0 0 0 30px rgba(255,104,123,.012); pointer-events:none; }
      .aps-skill-grid-premium .aps-skill-card:hover { transform:translateY(-5px); border-color:rgba(255,104,123,.42); box-shadow:0 22px 48px rgba(0,0,0,.27),0 0 30px rgba(237,52,72,.055); }
      .aps-skill-grid-premium .aps-skill-icon { width:37px; height:37px; display:grid; place-items:center; border:1px solid rgba(237,52,72,.27); border-radius:10px; color:#ff7487; background:linear-gradient(145deg,rgba(237,52,72,.15),rgba(237,52,72,.035)); }
      .aps-skill-grid-premium .aps-skill-copy { position:relative; z-index:1; margin-top:13px; }
      .aps-skill-grid-premium .aps-skill-copy strong { color:#f6f0ed; font-size:12px; }
      .aps-skill-grid-premium .aps-skill-copy small { color:#ff8493; font-size:8px; }
      .aps-skill-grid-premium .aps-skill-meter { height:5px; margin-top:13px; background:rgba(255,255,255,.09); }
      .aps-skill-grid-premium .aps-skill-meter span { background:linear-gradient(90deg,#a9102d,#f0445d 70%,#ff9aa5); box-shadow:0 0 12px rgba(237,52,72,.25); }
      .aps-skill-grid-premium .aps-skill-card p { margin-top:9px; color:#928a89; font-size:8px; }
      .aps-skill-no-results { grid-column:1/-1; display:flex; flex-direction:column; align-items:center; gap:8px; padding:35px; border:1px dashed rgba(255,255,255,.16); border-radius:12px; color:#91898a; text-align:center; }
      .aps-skill-no-results svg { color:#ff7487; }
      .aps-skill-no-results strong { color:#eee; font-size:12px; }
      .aps-skill-no-results span { font-size:9px; }
      .aps-skill-no-results button { margin-top:5px; padding:8px 12px; border:1px solid rgba(255,104,123,.35); border-radius:5px; color:#fff; background:rgba(237,52,72,.1); font-size:9px; cursor:pointer; }
      .aps-toolkit-foot { display:flex; justify-content:space-between; gap:12px; margin-top:15px; color:#807879; font-size:8px; }
      .aps-toolkit-foot span:first-child { display:inline-flex; align-items:center; gap:7px; }
      .aps-toolkit-foot svg { color:#80d6a1; }

      /* ============================================================
         DSA CONSOLE 2.0 — practice summary, difficulty and activity log
         ============================================================ */
      .aps-dsa-experience { isolation:isolate; }
      .aps-dsa-command { display:grid; grid-template-columns:1.05fr .95fr; gap:18px; padding:20px; border:1px solid rgba(255,255,255,.12); border-radius:16px; background:radial-gradient(ellipse at 13% 0%,rgba(237,52,72,.15),transparent 42%),linear-gradient(135deg,rgba(24,21,26,.96),rgba(8,10,14,.94)); box-shadow:0 24px 70px rgba(0,0,0,.24); }
      .aps-dsa-command-main { min-width:0; padding:9px 10px 8px; }
      .aps-dsa-command-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .aps-dsa-console-tag { padding:6px 8px; border:1px solid rgba(255,255,255,.1); border-radius:5px; color:#91898b; font:8px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.8px; }
      .aps-dsa-command-number { display:flex; align-items:center; gap:16px; margin:20px 0 8px; }
      .aps-dsa-command-number strong { color:#fff; font-size:clamp(58px,8vw,94px); font-weight:950; line-height:.9; letter-spacing:-6px; text-shadow:0 12px 45px rgba(237,52,72,.2); }
      .aps-dsa-command-number span { color:#a79d9e; font-size:8px; font-weight:850; line-height:1.8; letter-spacing:1.5px; }
      .aps-dsa-command-main > p { max-width:450px; margin:13px 0 20px; color:#a59c9c; font-size:10px; line-height:1.8; }
      .aps-dsa-difficulty { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; max-width:480px; }
      .aps-difficulty-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:11px 12px; border:1px solid rgba(255,255,255,.1); border-radius:7px; background:rgba(255,255,255,.025); }
      .aps-difficulty-item span { color:#a69e9d; font-size:9px; }
      .aps-difficulty-item strong { color:#f5f0ed; font-size:15px; }
      .aps-difficulty-item.easy { border-color:rgba(103,210,145,.22); }
      .aps-difficulty-item.easy strong { color:#80dba3; }
      .aps-difficulty-item.medium { border-color:rgba(242,183,91,.2); }
      .aps-difficulty-item.medium strong { color:#f1c477; }
      .aps-difficulty-item.hard { border-color:rgba(255,104,123,.22); }
      .aps-difficulty-item.hard strong { color:#ff7b8c; }
      .aps-dsa-command-side { min-width:0; align-self:stretch; overflow:hidden; border:1px solid rgba(255,255,255,.12); border-radius:11px; background:rgba(4,7,10,.72); box-shadow:inset 0 0 35px rgba(0,0,0,.22); }
      .aps-dsa-terminal-head { display:flex; align-items:center; gap:7px; min-height:42px; padding:0 13px; border-bottom:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.025); }
      .aps-dsa-terminal-head > span { display:flex; gap:4px; }
      .aps-dsa-terminal-head > span i { width:6px; height:6px; border-radius:50%; background:#f16b73; }
      .aps-dsa-terminal-head > span i:nth-child(2) { background:#e8b45c; }
      .aps-dsa-terminal-head > span i:nth-child(3) { background:#72cb91; }
      .aps-dsa-terminal-head small { flex:1; margin-left:6px; color:#a59b9d; font:8px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-terminal-head > svg { color:#ff7789; }
      .aps-dsa-terminal-body { padding:17px 16px; font:9px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-terminal-body > p:first-child { margin:0 0 16px; color:#e5dfe0; }
      .aps-dsa-terminal-body > p:first-child b { color:#ff7185; }
      .aps-terminal-line { display:flex; justify-content:space-between; gap:15px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.065); }
      .aps-terminal-line span { color:#8c9697; }
      .aps-terminal-line strong { color:#f5eeee; font-weight:700; }
      .aps-dsa-terminal-body .aps-terminal-success { display:flex; align-items:center; gap:7px; margin:17px 0 0; color:#80dba3; font-size:8px; }
      .aps-dsa-lower-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:16px; }
      .aps-dsa-profile-card,.aps-dsa-approach-card { position:relative; min-width:0; padding:23px; overflow:hidden; border:1px solid rgba(255,255,255,.11); border-radius:13px; background:linear-gradient(145deg,rgba(24,22,27,.91),rgba(10,11,15,.88)); }
      .aps-dsa-profile-card::after,.aps-dsa-approach-card::after { content:""; position:absolute; right:-75px; bottom:-115px; width:220px; aspect-ratio:1; border:1px solid rgba(237,52,72,.14); border-radius:50%; box-shadow:0 0 0 25px rgba(237,52,72,.02),0 0 0 50px rgba(237,52,72,.012); pointer-events:none; }
      .aps-dsa-card-heading { display:flex; align-items:center; gap:11px; }
      .aps-dsa-icon { width:40px; height:40px; display:grid; place-items:center; border:1px solid rgba(237,52,72,.28); border-radius:10px; color:#ff788a; background:rgba(237,52,72,.08); }
      .aps-dsa-card-kicker { color:#ff8795; font-size:7px; font-weight:900; letter-spacing:1.5px; }
      .aps-dsa-profile-card h3,.aps-dsa-approach-card h3 { position:relative; z-index:1; margin:17px 0 8px; color:#f5efed; font-size:clamp(19px,2.4vw,27px); line-height:1.16; letter-spacing:-.8px; }
      .aps-dsa-profile-card p,.aps-dsa-approach-card p { position:relative; z-index:1; margin:0; color:#a49b9a; font-size:9px; line-height:1.85; }
      .aps-dsa-profile-metrics { position:relative; z-index:1; display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:18px; }
      .aps-dsa-profile-metrics > div { padding:11px; border:1px solid rgba(255,255,255,.09); border-radius:7px; background:rgba(255,255,255,.025); }
      .aps-dsa-profile-metrics small { display:block; margin-bottom:5px; color:#807879; font-size:7px; letter-spacing:1.2px; }
      .aps-dsa-profile-metrics strong { color:#eee7e5; font-size:11px; }
      .aps-dsa-action { position:relative; z-index:2; display:inline-flex; align-items:center; gap:8px; margin-top:17px; color:#fff; font-size:9px; font-weight:850; transition:gap .2s,color .2s; }
      .aps-dsa-action:hover { gap:12px; color:#ff8291; }
      .aps-dsa-pill-row { position:relative; z-index:1; display:flex; flex-wrap:wrap; gap:6px; margin-top:17px; }
      .aps-dsa-pill-row span { padding:6px 8px; border:1px solid rgba(255,255,255,.1); border-radius:5px; color:#c4bbba; background:rgba(255,255,255,.025); font-size:7px; }
      .aps-dsa-activity { margin-top:17px; padding:22px; border:1px solid rgba(255,255,255,.1); border-radius:13px; background:rgba(12,12,16,.72); }
      .aps-dsa-activity-heading { display:flex; align-items:end; justify-content:space-between; gap:12px; margin-bottom:13px; }
      .aps-dsa-activity-heading h3 { margin:7px 0 0; color:#f4eeeb; font-size:17px; letter-spacing:-.4px; }
      .aps-dsa-activity-heading > span { color:#837a7b; font-size:8px; }
      .aps-dsa-log-list { display:grid; }
      .aps-dsa-log-row { display:flex; align-items:center; gap:13px; min-width:0; padding:13px 2px; border-top:1px solid rgba(255,255,255,.075); }
      .aps-dsa-log-index { color:#ff7487; font:9px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-log-main { display:grid; flex:1; min-width:0; gap:5px; }
      .aps-dsa-log-main strong { overflow:hidden; color:#eee8e6; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
      .aps-dsa-log-main span { color:#8d8585; font-size:8px; }
      .aps-dsa-level { padding:5px 8px; border:1px solid rgba(255,255,255,.1); border-radius:5px; color:#c9c0bf; font-size:7px; }
      .aps-dsa-level.easy { color:#80dba3; border-color:rgba(103,210,145,.22); }
      .aps-dsa-level.medium { color:#f1c477; border-color:rgba(242,183,91,.22); }
      .aps-dsa-level.hard { color:#ff7b8c; border-color:rgba(255,104,123,.22); }
      .aps-dsa-log-row > a { display:grid; place-items:center; width:29px; height:29px; border:1px solid rgba(255,255,255,.12); border-radius:50%; color:#ff8291; }
      .aps-dsa-log-platform { color:#81797a; font-size:7px; }
      .aps-dsa-empty-log { display:flex; align-items:center; gap:13px; padding:18px 0 4px; border-top:1px solid rgba(255,255,255,.075); color:#ff7b8c; }
      .aps-dsa-empty-log > div { display:grid; flex:1; gap:5px; }
      .aps-dsa-empty-log strong { color:#e9e2e0; font-size:10px; }
      .aps-dsa-empty-log span { color:#8e8585; font-size:8px; line-height:1.6; }
      .aps-dsa-empty-log a { display:inline-flex; align-items:center; gap:5px; color:#fff; font-size:8px; white-space:nowrap; }
      @media (max-width:900px) {
        .aps-skill-grid-premium { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .aps-dsa-command { grid-template-columns:1fr; }
      }
      @media (max-width:700px) {
        .aps-toolkit-intro { align-items:flex-start; flex-direction:column; }
        .aps-toolkit-total { align-self:flex-start; }
        .aps-skill-controls { align-items:stretch; flex-direction:column; }
        .aps-skill-search { width:100%; }
        .aps-skill-grid-premium { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .aps-dsa-lower-grid { grid-template-columns:1fr; }
        .aps-dsa-command { padding:13px; }
        .aps-dsa-command-main { padding:8px 5px; }
      }
      @media (max-width:420px) {
        .aps-skill-grid-premium { gap:8px; }
        .aps-skill-grid-premium .aps-skill-card { min-height:145px; padding:13px; }
        .aps-toolkit-foot { align-items:flex-start; flex-direction:column; }
        .aps-dsa-activity { padding:15px; }
        .aps-dsa-log-row { gap:8px; }
        .aps-dsa-log-main strong { max-width:145px; }
        .aps-dsa-empty-log { align-items:flex-start; flex-wrap:wrap; }
      }
      @media (prefers-reduced-motion:reduce) {
        .aps-skill-grid-premium .aps-skill-card,.aps-skill-filter,.aps-dsa-action { transition:none !important; }
      }


    `}
      </style>
  );
}

export default function Home() {
  const { content = {} } = usePortfolio();
  const { enabled = true } = useMotionPreference();
  const heroRef = useRef(null);
  const [activeSkillGroup, setActiveSkillGroup] = useState("All");
  const [skillSearch, setSkillSearch] = useState("");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Whole-page scroll drives the floating transparent portrait behind every section.
  const { scrollYProgress: pageScrollProgress } = useScroll();
  // Keep the cutout facing the visitor. Large rotateY values make a flat PNG
  // look like a thin line when the user scrolls down the page.
  const pagePortraitRotateY = useTransform(pageScrollProgress, [0, 1], [-2, 3]);
  const pagePortraitRotateX = useTransform(pageScrollProgress, [0, 0.5, 1], [1, -2, 2]);
  const pagePortraitRotateZ = useTransform(pageScrollProgress, [0, 0.5, 1], [-1, 1.5, -1]);
  const pagePortraitY = useTransform(pageScrollProgress, [0, 1], [0, -90]);
  const pagePortraitScale = useTransform(pageScrollProgress, [0, 0.45, 1], [1, 0.96, 0.90]);
  const pagePortraitOpacity = useTransform(pageScrollProgress, [0, 0.08, 0.82, 1], [0.42, 0.32, 0.26, 0.20]);
  const pagePortraitStyle = enabled ? {
    rotateY: pagePortraitRotateY, rotateX: pagePortraitRotateX, rotateZ: pagePortraitRotateZ,
    y: pagePortraitY, scale: pagePortraitScale, opacity: pagePortraitOpacity,
    transformPerspective: 1500, transformStyle: "preserve-3d",
  } : { opacity: 0.34 };
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.91]);
  const introY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  // Scroll-linked 3D movement: the transparent portrait subtly turns and
  // rises as the visitor leaves the hero section.
  const portraitRotateY = useTransform(scrollYProgress, [0, 1], [-7, 24]);
  const portraitRotateX = useTransform(scrollYProgress, [0, 1], [2, -9]);
  const portraitRotateZ = useTransform(scrollYProgress, [0, 1], [0, 7]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, -82]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const portraitStyle = enabled ? {
    rotateY: portraitRotateY,
    rotateX: portraitRotateX,
    rotateZ: portraitRotateZ,
    y: portraitY,
    scale: portraitScale,
    transformPerspective: 1200,
    transformStyle: "preserve-3d",
  } : undefined;

  const profile = content.profile || {};
  const projects = safeArray(content.projects);
  const skills = safeArray(content.skills);
  const achievements = safeArray(content.achievements);
  const certificates = safeArray(content.certificates);
  const timeline = safeArray(content.timeline);
  const goals = safeArray(content.goals);
  const dsa = safeArray(content.dsa);
  const dailyUpdates = safeArray(content.dailyUpdates);
  const notes = safeArray(content.notes);

  const featuredProjects = useMemo(() => {
    const featured = projects.filter((project) => project?.featured);
    return (featured.length ? featured : projects).slice(0, 3);
  }, [projects]);

  const normalizedSkills = useMemo(
    () => skills.map(normalizeSkill).filter(Boolean).slice(0, 24),
    [skills]
  );
  const skillGroups = useMemo(
    () => ["All", ...new Set(normalizedSkills.map((skill) => skill.category).filter(Boolean))],
    [normalizedSkills]
  );
  const visibleSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();
    return normalizedSkills.filter((skill) => {
      const matchesGroup = activeSkillGroup === "All" || skill.category === activeSkillGroup;
      const matchesQuery = !query || [skill.name, skill.category, skill.detail]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesGroup && matchesQuery;
    });
  }, [normalizedSkills, activeSkillGroup, skillSearch]);
  const dsaPreview = useMemo(() => dsa.map((entry, index) => {
    const item = entry && typeof entry === "object" ? entry : { title: String(entry || "") };
    return {
      id: entryKey(item, index, "dsa"),
      title: firstText(item.title, item.name, item.problem, item.question, "Practice entry"),
      topic: firstText(item.topic, item.category, item.pattern, "DSA practice"),
      difficulty: firstText(item.difficulty, item.level, "Practice"),
      date: firstText(item.date, item.solvedAt, item.createdAt),
      url: safeExternalUrl(item.url || item.link || item.problemUrl),
      platform: firstText(item.platform, "LeetCode"),
    };
  }).filter((item) => item.title).slice(0, 4), [dsa]);
  const dsaDifficulty = useMemo(() => ({
    easy: dsa.filter((item) => /easy/i.test(String(item?.difficulty || item?.level || ""))).length,
    medium: dsa.filter((item) => /medium/i.test(String(item?.difficulty || item?.level || ""))).length,
    hard: dsa.filter((item) => /hard/i.test(String(item?.difficulty || item?.level || ""))).length,
  }), [dsa]);
  const timelineItems = useMemo(
    () => timeline.map((item, index) => normalizeEntry(item, index, "milestone", "Learning milestone")).filter(Boolean).slice(0, 6),
    [timeline]
  );
  const achievementItems = useMemo(
    () => achievements.map((item, index) => normalizeEntry(item, index, "achievement", "Achievement")).filter(Boolean).slice(0, 6),
    [achievements]
  );
  const certificateItems = useMemo(
    () => certificates.map((item, index) => normalizeEntry(item, index, "certificate", "Certificate")).filter(Boolean).slice(0, 6),
    [certificates]
  );
  const goalItems = useMemo(
    () => goals.map((item, index) => normalizeEntry(item, index, "goal", "Learning goal")).filter(Boolean).slice(0, 6),
    [goals]
  );
  const updateItems = useMemo(
    () => dailyUpdates.map((item, index) => normalizeEntry(item, index, "update", "Learning update")).filter(Boolean).slice(0, 3),
    [dailyUpdates]
  );

  const name = firstText(profile.name, "Developer");
  const nameParts = name.split(/\s+/);
  const firstName = nameParts[0] || "Developer";
  const remainingName = nameParts.slice(1).join(" ");
  const role = firstText(profile.role, "Developer · Builder · Problem Solver");
  const location = firstText(profile.location, "India");
  const email = textValue(profile.email);
  const github = safeExternalUrl(profile.github);
  const linkedin = safeExternalUrl(profile.linkedin);
  const leetcode = safeExternalUrl(profile.leetcode);
  const degree = textValue(profile.degree);
  const college = textValue(profile.college);
  const graduation = textValue(profile.graduation);
  const cgpa = textValue(profile.cgpa);
  const availability = firstText(profile.availability, "Open to opportunities");
  const dsaCount = dsa.length;
  const achievementCount = achievements.length;
  const certificateCount = certificates.length;

  const stats = [
    { icon: Code2, value: String(projects.length).padStart(2, "0"), label: "Projects", note: "Portfolio work" },
    { icon: Trophy, value: String(achievementCount).padStart(2, "0"), label: "Achievements", note: "Admin managed" },
    { icon: Award, value: String(certificateCount).padStart(2, "0"), label: "Certificates", note: "Portfolio records" },
    { icon: Activity, value: String(dsaCount).padStart(2, "0"), label: "DSA logs", note: "Practice entries" },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: enabled ? "smooth" : "auto",
      block: "start",
    });
  };

  const goalProgress = (goal) => {
    const current = Number(goal.current);
    const target = Number(goal.target);
    if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;
    return Math.max(0, Math.min(100, (current / target) * 100));
  };

  return (
    <main className={`aps-home ${enabled ? "aps-motion-enabled" : "aps-motion-reduced"}`} id="home">
      <HomeStyles />

      <div className="aps-global-portrait-scene" aria-hidden="true">
        <div className="aps-global-portrait-aura" />
        <div className="aps-global-portrait-orbit aps-global-orbit-one" />
        <div className="aps-global-portrait-orbit aps-global-orbit-two" />
        <div className="aps-global-portrait-orbit aps-global-orbit-three" />
        <motion.div className="aps-global-portrait-object" style={pagePortraitStyle}>
          <img src="/images/hero-bg-removebg-preview.png" alt="" draggable="false" />
        </motion.div>
        <div className="aps-global-portrait-glow" />
      </div>

      <section className="aps-hero aps-hero-cinematic" id="top" ref={heroRef}>
        <div className="aps-hero-background" aria-hidden="true">
          <div className="aps-hero-background-image" />
          <div className="aps-hero-background-vignette" />
          <div className="aps-hero-background-grain" />
          <div className="aps-hero-background-scanline" />
          <div className="aps-hero-light-beam aps-beam-one" />
          <div className="aps-hero-light-beam aps-beam-two" />
        </div>
        <div className="aps-hero-orb one" />
        <div className="aps-hero-orb two" />

        <div className="aps-topline">
          <span>
            COMPUTER SCIENCE ENGINEER
            <br />
            <small>DEVELOPER / BUILDER / PROBLEM SOLVER</small>
          </span>
          <span className="aps-availability">
            <i className="aps-live-dot" />
            {availability}
          </span>
        </div>

        <motion.div
          className="aps-hero-word"
          style={enabled ? { y: titleY, scale: titleScale } : undefined}
          aria-hidden="true"
        >
          PORTFOLIO
        </motion.div>

        <div className="aps-hero-grid">
          <motion.div
            className="aps-hero-copy"
            initial={enabled ? { opacity: 0, x: -34 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            style={enabled ? { y: introY } : undefined}
          >
            <span className="aps-eyebrow"><i /> PORTFOLIO / {new Date().getFullYear()}</span>
            <p className="aps-handwrite">Hello, I'm</p>
            <h1 className="aps-hero-title">
              {firstName}
              <br />
              <em>{remainingName || "Developer"}.</em>
            </h1>
            <p className="aps-hero-role">{role}</p>
            <p className="aps-hero-description">
              {textValue(profile.intro) ||
                "I enjoy turning ideas into useful digital experiences, solving problems and continuously learning by building."}
            </p>

            <div className="aps-hero-actions">
              <button
                type="button"
                className="aps-button aps-button-primary"
                onClick={() => scrollTo("aps-projects")}
              >
                Explore my work <ArrowRight size={16} />
              </button>
              <Link className="aps-button aps-button-ghost" to="/contact">
                Let's connect <Mail size={15} />
              </Link>
            </div>

            <div className="aps-socials">
              {github && <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={17} /></a>}
              {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>}
              {leetcode && <a href={leetcode} target="_blank" rel="noopener noreferrer" aria-label="LeetCode"><Code2 size={17} /></a>}
              {email && <a href={`mailto:${email}`} aria-label="Email"><Mail size={17} /></a>}
            </div>

            <span className="aps-location"><MapPin size={13} /> {location}</span>
          </motion.div>

          <motion.div
            initial={enabled ? { opacity: 0, scale: 0.93, rotateY: 8 } : false}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.08 }}
          >
            <ProfileStage profile={profile} name={name} portraitStyle={portraitStyle} />
          </motion.div>
        </div>

        <div className="aps-hero-foot">
          <button type="button" onClick={() => scrollTo("aps-projects")}>
            SELECTED WORK <ArrowUpRight size={13} />
          </button>
          <span>{location.toUpperCase()}</span>
          <button type="button" onClick={() => scrollTo("aps-about")}>
            SCROLL TO DISCOVER <ChevronDown size={13} />
          </button>
        </div>

        <motion.div
          className="aps-stats"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={reveal}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="aps-section" id="aps-about">
        <SectionLabel number="01">ABOUT / PROFILE</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="WHO I AM"
            title="Curiosity first. Craft always."
            description="A little introduction, the education behind my journey and what motivates me to keep building."
          />
          <Link className="aps-view-all" to="/about">Full about page <ArrowUpRight size={15} /></Link>
        </div>

        <div className="aps-about-grid">
          <TiltSurface className="aps-glass-card" enabled={enabled}>
            <span className="aps-eyebrow"><i /> A LITTLE ABOUT ME</span>
            <div className="aps-card-icon"><Sparkles size={19} /></div>
            <h3>Turning ideas<br /><em>into useful things.</em></h3>
            <p>{textValue(profile.about) || textValue(profile.intro) || "I am a developer who enjoys learning, problem solving and building practical digital experiences."}</p>
            <div className="aps-facts">
              <div className="aps-fact"><small>Location</small><strong>{location}</strong></div>
              <div className="aps-fact"><small>Availability</small><strong>{availability}</strong></div>
              <div className="aps-fact"><small>Graduation</small><strong>{graduation || "Not added yet"}</strong></div>
              <div className="aps-fact"><small>CGPA</small><strong>{cgpa || "Not added yet"}</strong></div>
            </div>
            <Link className="aps-card-link" to="/about">Discover my story <ArrowRight size={14} /></Link>
          </TiltSurface>

          <TiltSurface className="aps-glass-card" enabled={enabled}>
            <span className="aps-eyebrow"><i /> EDUCATION</span>
            <div className="aps-card-icon"><GraduationCap size={20} /></div>
            <h3>{degree || "Education details"}</h3>
            <p>{college || "Add your institution through the Admin Dashboard."}</p>
            <div className="aps-facts">
              <div className="aps-fact"><small>Program</small><strong>{degree || "B.Tech"}</strong></div>
              <div className="aps-fact"><small>Institute</small><strong>{college || "Not added yet"}</strong></div>
              <div className="aps-fact"><small>Graduation</small><strong>{graduation || "Not added yet"}</strong></div>
              <div className="aps-fact"><small>Academic score</small><strong>{cgpa ? `CGPA ${cgpa}` : "Not added yet"}</strong></div>
            </div>
            <Link className="aps-card-link" to="/journey">Explore my journey <ArrowRight size={14} /></Link>
          </TiltSurface>
        </div>
         <section className="aps-section aps-toolkit-section" id="aps-skills">
        <SectionLabel number="02">CAPABILITIES / TOOLKIT</SectionLabel>
        <div className="aps-section-head aps-toolkit-heading">
          <SectionHeading
            eyebrow="TECH STACK"
            title="Tools I work with."
            description="A living snapshot of the technologies I use, practise and explore. Skill details stay connected to the Admin Dashboard."
          />
          <Link className="aps-view-all" to="/journey">Explore learning path <ArrowUpRight size={15} /></Link>
        </div>

        <div className="aps-toolkit-intro">
          <div className="aps-toolkit-intro-copy">
            <span className="aps-toolkit-overline"><span className="aps-live-dot" /> ENGINEERING TOOLKIT</span>
            <h3>Learn it. Build with it. <em>Get better every day.</em></h3>
            <p>Browse the stack by discipline or search for a technology. Progress bars are self-assessed indicators, not test scores.</p>
          </div>
          <div className="aps-toolkit-total">
            <strong>{normalizedSkills.length.toString().padStart(2, "0")}</strong>
            <span>TECHNOLOGIES<br/>IN THIS PORTFOLIO</span>
          </div>
        </div>

        {normalizedSkills.length ? (
          <>
            <div className="aps-skill-controls">
              <div className="aps-skill-filters" role="group" aria-label="Filter technologies by category">
                {skillGroups.map((group) => (
                  <button
                    type="button"
                    key={group}
                    className={`aps-skill-filter ${activeSkillGroup === group ? "is-active" : ""}`}
                    onClick={() => setActiveSkillGroup(group)}
                    aria-pressed={activeSkillGroup === group}
                  >
                    {group}
                    <span>{group === "All" ? normalizedSkills.length : normalizedSkills.filter((skill) => skill.category === group).length}</span>
                  </button>
                ))}
              </div>
              <label className="aps-skill-search">
                <Search size={15} />
                <input
                  type="search"
                  value={skillSearch}
                  onChange={(event) => setSkillSearch(event.target.value)}
                  placeholder="Find a technology..."
                  aria-label="Search technologies"
                />
                {skillSearch && <button type="button" onClick={() => setSkillSearch("")} aria-label="Clear search"><X size={14} /></button>}
              </label>
            </div>

            <motion.div
              className="aps-skill-grid aps-skill-grid-premium"
              layout
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              {visibleSkills.length ? visibleSkills.map((skill, index) => (
                <motion.div key={skill.id || `${skill.name}-${index}`} layout variants={reveal}>
                  <SkillCard skill={skill} index={index} enabled={enabled} />
                </motion.div>
              )) : (
                <div className="aps-skill-no-results">
                  <Search size={22} />
                  <strong>No matching technology</strong>
                  <span>Try another name or choose a different category.</span>
                  <button type="button" onClick={() => { setSkillSearch(""); setActiveSkillGroup("All"); }}>Reset filters</button>
                </div>
              )}
            </motion.div>
            <div className="aps-toolkit-foot">
              <span><ShieldCheck size={14}/> Skill levels are self-assessed and editable in Admin.</span>
              <span>{visibleSkills.length} of {normalizedSkills.length} shown</span>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Cpu}
            title="Skills will appear here."
            description="Add your technical skills from the Admin Dashboard to populate this section."
            link={{ to: "/admin", label: "Manage skills" }}
          />
        )}
      </section>

   </section>

      <section className="aps-section" id="aps-projects">
        <SectionLabel number="03">SELECTED WORK / PROJECTS</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="WHAT I'VE BUILT"
            title="Selected work."
            description="Real applications, experiments and hardware projects. Open the live websites or explore the complete project archive."
          />
          <Link className="aps-view-all" to="/projects">Explore complete archive <ArrowUpRight size={15} /></Link>
        </div>

        <motion.div
          className="aps-project-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
        >
          {featuredProjects.length ? (
            featuredProjects.map((project, index) => (
              <motion.div key={project.id || project.name || index} variants={reveal}>
                <HomeProjectCard project={project} index={index} enabled={enabled} />
              </motion.div>
            ))
          ) : (
            <EmptyState
              icon={Layers3}
              title="Projects are coming soon."
              description="Add your projects through the Admin Dashboard to showcase your work here."
              link={{ to: "/admin", label: "Open Admin Dashboard" }}
            />
          )}
        </motion.div>
      </section>

      <div className="aps-tech-strip" aria-label="Areas of interest">
        <span><Code2 size={15} /> DEVELOPMENT</span>
        <span><Terminal size={15} /> PROBLEM SOLVING</span>
        <span><Cpu size={15} /> TECHNOLOGY</span>
        <span><Globe size={15} /> DIGITAL EXPERIENCES</span>
        <span><Sparkles size={15} /> CONTINUOUS LEARNING</span>
      </div>

      <section className="aps-section aps-dsa-experience" id="aps-dsa">
        <SectionLabel number="04">PROBLEM SOLVING / DSA</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="CONSISTENT PRACTICE"
            title="Think. Solve. Improve."
            description="A transparent view of the DSA practice entries recorded in this portfolio. Only saved records are counted."
          />
          <a className="aps-view-all" href={leetcode || "https://leetcode.com/"} target="_blank" rel="noopener noreferrer">
            Open LeetCode <ExternalLink size={14} />
          </a>
        </div>

        <div className="aps-dsa-command">
          <div className="aps-dsa-command-main">
            <div className="aps-dsa-command-top">
              <span className="aps-toolkit-overline"><span className="aps-live-dot" /> PROBLEM SOLVING CONSOLE</span>
              <span className="aps-dsa-console-tag">APS / DSA.LOG</span>
            </div>
            <div className="aps-dsa-command-number">
              <strong>{String(dsaCount).padStart(2, "0")}</strong>
              <span>RECORDED<br/>PRACTICE ENTRIES</span>
            </div>
            <p>Every entry represents a problem or practice record saved through the portfolio dashboard.</p>
            <div className="aps-dsa-difficulty">
              <div className="aps-difficulty-item easy"><span>Easy</span><strong>{dsaDifficulty.easy}</strong></div>
              <div className="aps-difficulty-item medium"><span>Medium</span><strong>{dsaDifficulty.medium}</strong></div>
              <div className="aps-difficulty-item hard"><span>Hard</span><strong>{dsaDifficulty.hard}</strong></div>
            </div>
          </div>
          <div className="aps-dsa-command-side">
            <div className="aps-dsa-terminal-head">
              <span><i/><i/><i/></span>
              <small>practice_summary.sh</small>
              <Terminal size={14}/>
            </div>
            <div className="aps-dsa-terminal-body">
              <p><b>$</b> portfolio --practice-summary</p>
              <div className="aps-terminal-line"><span>total_entries</span><strong>{dsaCount}</strong></div>
              <div className="aps-terminal-line"><span>achievements</span><strong>{achievementCount}</strong></div>
              <div className="aps-terminal-line"><span>certificates</span><strong>{certificateCount}</strong></div>
              <div className="aps-terminal-line"><span>learning_updates</span><strong>{dailyUpdates.length}</strong></div>
              <p className="aps-terminal-success"><span>✓</span> Data synced from portfolio content</p>
            </div>
          </div>
        </div>

        <div className="aps-dsa-lower-grid">
          <article className="aps-dsa-profile-card">
            <div className="aps-dsa-card-heading">
              <div className="aps-dsa-icon"><Code2 size={20}/></div>
              <span className="aps-dsa-card-kicker">CODING PROFILE / 01</span>
            </div>
            <h3>{textValue(content.leetcode?.username) || "Problem solving journey"}</h3>
            <p>{textValue(content.leetcode?.username) ? "The coding profile is connected. Open it to explore submitted solutions and progress." : "Connect a LeetCode username and add verified profile statistics through the Admin Dashboard."}</p>
            <div className="aps-dsa-profile-metrics">
              <div><small>RATING</small><strong>{content.leetcode?.rating || "Not added"}</strong></div>
              <div><small>STREAK</small><strong>{content.leetcode?.streak ? `${content.leetcode.streak} days` : "Not added"}</strong></div>
            </div>
            <a className="aps-dsa-action" href={leetcode || "https://leetcode.com/"} target="_blank" rel="noopener noreferrer">Visit LeetCode <ExternalLink size={14}/></a>
          </article>

          <article className="aps-dsa-approach-card">
            <div className="aps-dsa-card-heading">
              <div className="aps-dsa-icon"><Brain size={20}/></div>
              <span className="aps-dsa-card-kicker">MY APPROACH / 02</span>
            </div>
            <h3>Understand the pattern. Explain the solution.</h3>
            <p>I focus on breaking a problem into smaller steps, choosing a suitable data structure, analysing time and space complexity, and communicating the reasoning clearly.</p>
            <div className="aps-dsa-pill-row">
              <span>Problem breakdown</span><span>Patterns</span><span>Complexity</span><span>Clean code</span>
            </div>
            <Link className="aps-dsa-action" to="/journey">See learning journey <ArrowRight size={14}/></Link>
          </article>
        </div>

        <div className="aps-dsa-activity">
          <div className="aps-dsa-activity-heading">
            <div>
              <span className="aps-eyebrow"><i/> RECENT PRACTICE</span>
              <h3>Latest problem log</h3>
            </div>
            <span>{dsaPreview.length} recent entries</span>
          </div>
          {dsaPreview.length ? (
            <div className="aps-dsa-log-list">
              {dsaPreview.map((item, index) => (
                <article className="aps-dsa-log-row" key={item.id}>
                  <span className="aps-dsa-log-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="aps-dsa-log-main">
                    <strong>{item.title}</strong>
                    <span>{item.topic}{item.date ? ` · ${item.date}` : ""}</span>
                  </div>
                  <span className={`aps-dsa-level ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`}><ArrowUpRight size={16}/></a> : <span className="aps-dsa-log-platform">{item.platform}</span>}
                </article>
              ))}
            </div>
          ) : (
            <div className="aps-dsa-empty-log">
              <Terminal size={20}/>
              <div><strong>No practice logs added yet</strong><span>Add problem title, topic, difficulty and optional link from Admin to build this activity feed.</span></div>
              <Link to="/admin">Update logs <ArrowUpRight size={14}/></Link>
            </div>
          )}
        </div>
      </section>

      <section className="aps-section" id="aps-achievements">
        <SectionLabel number="05">MILESTONES / RECOGNITION</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="ACHIEVEMENTS"
            title="Milestones along the way."
            description="Achievements and certificates are dynamically displayed from records added in the Admin Dashboard."
          />
          <Link className="aps-view-all" to="/journey">View full journey <ArrowUpRight size={15} /></Link>
        </div>

        <div className="aps-two-col">
          <div className="aps-record-column">
            <h3><Trophy size={16} /> Achievements</h3>
            <div className="aps-record-list">
              {achievementItems.length ? achievementItems.map((item) => (
                <article className="aps-record" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.issuer || item.organization || "Achievement details"}</p>
                  {item.date && <small>{item.date}</small>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">View achievement <ExternalLink size={12} /></a>}
                </article>
              )) : (
                <EmptyState icon={Trophy} title="No achievements added yet." description="Your verified achievements will appear here when added in Admin." />
              )}
            </div>
          </div>

          <div className="aps-record-column">
            <h3><Award size={16} /> Certificates</h3>
            <div className="aps-record-list">
              {certificateItems.length ? certificateItems.map((item) => (
                <article className="aps-record" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.issuer || item.organization || "Certificate details"}</p>
                  {item.date && <small>{item.date}</small>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">View certificate <ExternalLink size={12} /></a>}
                </article>
              )) : (
                <EmptyState icon={Award} title="No certificates added yet." description="Add certificates through the Admin Dashboard." />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="aps-section" id="aps-journey">
        <SectionLabel number="06">JOURNEY / EXPERIENCE</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="THE PATH SO FAR"
            title="Every step adds up."
            description="Education, learning milestones and experiences from your portfolio timeline."
          />
          <Link className="aps-view-all" to="/journey">Open journey page <ArrowUpRight size={15} /></Link>
        </div>

        {timelineItems.length ? (
          <div className="aps-timeline">
            {timelineItems.map((item, index) => (
              <motion.article
                className="aps-timeline-item"
                key={item.id}
                initial={enabled ? { opacity: 0, x: 16 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <small>{item.date || "MILESTONE"}</small>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarDays} title="Your journey will appear here." description="Add education, experience and milestones from the Admin Dashboard." link={{ to: "/admin", label: "Update timeline" }} />
        )}
      </section>

      <section className="aps-section" id="aps-goals">
        <SectionLabel number="07">NOW / NEXT</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="CURRENT DIRECTION"
            title="What I'm working towards."
            description="Current goals and learning priorities help visitors understand what you're exploring next."
          />
          <Link className="aps-view-all" to="/journey">Explore my journey <ArrowUpRight size={15} /></Link>
        </div>

        {goalItems.length ? (
          <div className="aps-goal-grid">
            {goalItems.map((goal) => {
              const progress = goalProgress(goal);
              return (
                <article className="aps-goal-card" key={goal.id}>
                  <Target size={19} />
                  <h3>{goal.title}</h3>
                  <p>{goal.description || goal.status || "A goal in progress."}</p>
                  {progress !== null && (
                    <>
                      <div className="aps-goal-progress"><span style={{ width: `${progress}%` }} /></div>
                      <p>{Number(goal.current)} / {Number(goal.target)} completed</p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Target} title="No goals added yet." description="Add current goals through the Admin Dashboard." />
        )}

        {updateItems.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <SectionLabel number="07A">RECENT LEARNING UPDATES</SectionLabel>
            <div className="aps-goal-grid">
              {updateItems.map((item) => (
                <article className="aps-goal-card" key={item.id}>
                  <Flame size={18} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.date && <p>{item.date}</p>}
                </article>
              ))}
            </div>
          </div>
        )}
        {notes.length > 0 && (
          <p style={{ color: "#817977", fontSize: 9, marginTop: 15 }}>
            {notes.length} learning note entries are stored in the portfolio.
          </p>
        )}
      </section>

      <section className="aps-cta" id="aps-contact">
        <span className="aps-eyebrow"><i /> HAVE AN IDEA OR OPPORTUNITY?</span>
        <h2>Let's build something<br /><em>meaningful together.</em></h2>
        <p>Whether you have an opportunity, a project idea or simply want to connect, I'd be happy to hear from you.</p>
        <div className="aps-cta-actions">
          <Link className="aps-button aps-button-primary" to="/contact">Start a conversation <MoveUpRight size={16} /></Link>
          {email && <a className="aps-button aps-button-ghost" href={`mailto:${email}`}>Email me <Mail size={15} /></a>}
        </div>
        <nav className="aps-quick-links" aria-label="Explore portfolio sections">
          <a href="#aps-about">About</a>
          <a href="#aps-skills">Skills</a>
          <a href="#aps-projects">Projects</a>
          <a href="#aps-dsa">DSA</a>
          <a href="#aps-achievements">Achievements</a>
          <a href="#aps-journey">Journey</a>
          <a href="#aps-goals">Goals</a>
        </nav>
      </section>

      <button
        type="button"
        className="aps-back-top"
        onClick={() => scrollTo("top")}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUpRight size={19} />
      </button>
    </main>
  );
}
