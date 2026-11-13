import React, { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Github,
  Mail,
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
  MoveUpRight,
  ShieldCheck,
  Eye,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";
import SectionHeading from "../components/SectionHeading";
import HeroSection from "../components/HeroSection";
import { usePortfolio } from "../hooks/usePortfolio";
import { useMotionPreference } from "../hooks/MotionPreference";

const EASE = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

/* ---------------------------------------------------------------- helpers */
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

const entryKey = (entry, index, prefix) =>
  entry?.id || entry?.slug || entry?.title || entry?.name || `${prefix}-${index}`;
const entryTitle = (entry, fallback) =>
  firstText(entry?.title, entry?.name, entry?.role, entry?.topic, fallback);
const entryDescription = (entry) =>
  firstText(entry?.description, entry?.details, entry?.content, entry?.note, entry?.summary);
const entryDate = (entry) => firstText(entry?.date, entry?.year, entry?.period, entry?.createdAt);

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
    level: Number.isFinite(numericLevel) ? Math.max(0, Math.min(100, numericLevel)) : null,
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

/* ------------------------------------------------------------- components */
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
    x.set((0.5 - (event.clientY - rect.top) / rect.height) * 7);
    y.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
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
  const liveScreenshot = getLiveWebsiteScreenshot(liveUrl);
  const isKnownDuplicate = /\/(skillswap|ai-project|tutormitra)\.jpg(?:$|\?)/i.test(rawImage);
  const localImage = isRobot ? "/images/fire-robot.jpg" : !isKnownDuplicate ? rawImage : "";
  const image = liveScreenshot || localImage;
  const showImage = Boolean(image) && !failed;

  const visualLabel = isRobot
    ? "HARDWARE BUILD"
    : /skillswap/i.test(name)
    ? "PEER LEARNING PLATFORM"
    : /automation/i.test(name)
    ? "AI AUTOMATION PRODUCT"
    : /tutormitra/i.test(name)
    ? "EDTECH CONCEPT"
    : /data/i.test(name)
    ? "DATA & MACHINE LEARNING"
    : "PROJECT CASE STUDY";

  const ArtIcon = isRobot
    ? Cpu
    : /ai|automation/i.test(name)
    ? Brain
    : /tutor|education/i.test(name)
    ? GraduationCap
    : /data/i.test(name)
    ? Database
    : Globe;

  return (
    <div className={`aps-project-art ${showImage ? "has-image" : "no-image"} ${liveUrl ? "is-live-preview" : ""}`}>
      {showImage ? (
        <img
          src={image}
          alt={liveUrl ? `${name} live website screenshot` : `${name} project photograph`}
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
            <ArtIcon size={34} />
            <span>{visualLabel}</span>
          </div>
          <small className="aps-art-disclaimer">
            {liveUrl ? "LIVE PREVIEW UNAVAILABLE · OPEN WEBSITE" : "PROJECT IDENTITY GRAPHIC · NO LIVE DEMO"}
          </small>
        </div>
      )}
      <div className="aps-project-art-overlay">
        <span className="aps-preview-kind">
          {liveUrl ? (
            <>
              <span className="aps-live-dot" /> LIVE WEBSITE CAPTURE
            </>
          ) : isRobot ? (
            "ACTUAL HARDWARE PHOTO"
          ) : (
            "PROJECT OVERVIEW"
          )}
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
  const description = firstText(project.description, project.details, "Project details will be updated soon.");
  const stack = safeArray(project.stack || project.techStack || project.technologies)
    .filter((item) => typeof item === "string" && item.trim())
    .slice(0, 5);
  const liveUrl = safeExternalUrl(project.liveUrl || project.demoUrl || project.website);
  const githubUrl = safeExternalUrl(project.githubUrl || project.repoUrl || project.repositoryUrl);
  const githubProfile = (() => {
    if (!githubUrl) return false;
    try {
      const u = new URL(githubUrl);
      return u.hostname.endsWith("github.com") && u.pathname.split("/").filter(Boolean).length < 2;
    } catch {
      return false;
    }
  })();

  return (
    <TiltSurface className="aps-project-card" enabled={enabled}>
      <div className="aps-project-card-inner">
        <div className="aps-project-card-meta">
          <span>
            <b>{String(index + 1).padStart(2, "0")}</b> / {category}
          </span>
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
            <span className="aps-project-arrow">
              <ArrowUpRight size={19} />
            </span>
          </div>
          <p>{description}</p>
          {stack.length > 0 && (
            <div className="aps-project-stack">
              {stack.map((item, i) => (
                <span key={`${item}-${i}`}>{item}</span>
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
                <span className="aps-no-link">
                  <Eye size={13} /> No live demo
                </span>
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

const SKILL_ICONS = [Code2, Database, Brain, Monitor, Terminal, Cpu];

function SkillCard({ skill, index }) {
  const Icon = SKILL_ICONS[index % SKILL_ICONS.length];
  return (
    <motion.article className="aps-skill-card" variants={reveal} layout>
      <div className="aps-skill-icon">
        <Icon size={18} />
      </div>
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
      <div>
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {link && (
        <Link to={link.to}>
          {link.label} <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- styles
   Hero styles live inside HeroSection.jsx (aps-hx-*). This block only
   styles the sections below the hero. */
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
        background:
          radial-gradient(ellipse at 8% 25%, rgba(117,13,35,.10), transparent 28%),
          radial-gradient(ellipse at 94% 56%, rgba(117,13,35,.08), transparent 25%),
          #07070a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .aps-home *, .aps-home *::before, .aps-home *::after { box-sizing: border-box; }
      .aps-home a { color: inherit; text-decoration: none; }
      .aps-home button { font: inherit; }
      .aps-home img { max-width: 100%; }
      .aps-home ::selection { color: #fff; background: rgba(237,52,72,.72); }
      .aps-home :focus-visible { outline: 2px solid var(--red-bright); outline-offset: 4px; }

      .aps-live-dot { display: inline-block; width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #72d89a; box-shadow: 0 0 14px #72d89a; }
      .aps-eyebrow { display: inline-flex; align-items: center; gap: 10px; color: var(--red-bright); font-size: 10px; font-weight: 850; letter-spacing: 2.2px; }
      .aps-eyebrow i { width: 22px; height: 1px; background: var(--red); }

      /* stats */
      .aps-stats { position: relative; z-index: 5; width: min(1220px,90%); margin: 24px auto 0; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; }
      .aps-stats > * { min-width: 0; border: 1px solid var(--line); border-radius: 10px; background: rgba(15,15,18,.72); backdrop-filter: blur(14px); transition: transform .25s ease, border-color .25s ease; }
      .aps-stats > *:hover { transform: translateY(-5px); border-color: rgba(237,52,72,.45); }

      /* sections */
      .aps-section { position: relative; z-index: 1; width: min(1220px,90%); margin: 0 auto; padding: 100px 0; scroll-margin-top: 90px; }
      .aps-section::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); }
      .aps-section-label { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--red-bright); font-size: 10px; font-weight: 850; letter-spacing: 2px; user-select: none; }
      .aps-section-label span { color: rgba(255,255,255,.48); font-variant-numeric: tabular-nums; }
      .aps-section-label i { flex: 0 0 22px; height: 1px; background: var(--red); }
      .aps-section-head { position: relative; display: flex; justify-content: space-between; align-items: end; gap: 25px; margin-bottom: 35px; }
      .aps-section-head::after { content: ""; position: absolute; right: 0; bottom: -17px; left: 0; height: 1px; opacity: .55; background: linear-gradient(90deg,rgba(255,255,255,.13),transparent 72%); pointer-events: none; }
      .aps-view-all { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; min-height: 38px; color: #eee; font-size: 12px; white-space: nowrap; transition: .25s; }
      .aps-view-all:hover { color: var(--red-bright); transform: translateX(3px); }

      /* about */
      .aps-about-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 16px; }
      .aps-glass-card { position: relative; min-width: 0; min-height: 310px; padding: 30px; overflow: hidden; border: 1px solid var(--line); border-radius: 13px; background: linear-gradient(145deg,rgba(27,25,28,.86),rgba(10,11,14,.82)); backdrop-filter: blur(15px); box-shadow: 0 18px 55px rgba(0,0,0,.18); transform-style: preserve-3d; transition: border-color .28s ease, box-shadow .28s ease; }
      .aps-glass-card:hover { border-color: rgba(255,255,255,.2); box-shadow: 0 26px 80px rgba(0,0,0,.34); }
      .aps-glass-card::after { content: ""; position: absolute; right: -90px; bottom: -120px; width: 230px; aspect-ratio: 1; border: 1px solid rgba(237,52,72,.18); border-radius: 50%; box-shadow: 0 0 0 25px rgba(237,52,72,.025),0 0 0 50px rgba(237,52,72,.018); pointer-events: none; }
      .aps-card-icon { width: 40px; height: 40px; display: grid; place-items: center; margin: 23px 0 16px; border: 1px solid rgba(237,52,72,.25); border-radius: 10px; color: var(--red-bright); background: rgba(237,52,72,.08); transition: transform .28s ease; }
      .aps-glass-card:hover .aps-card-icon { transform: translateY(-3px) rotate(-5deg); }
      .aps-glass-card h3 { position: relative; z-index: 1; margin: 0 0 12px; color: #f5f0ed; font-size: clamp(22px,2.7vw,34px); line-height: 1.1; letter-spacing: -1.1px; }
      .aps-glass-card h3 em { color: var(--red-bright); font-style: normal; }
      .aps-glass-card p { position: relative; z-index: 1; color: var(--muted); font-size: 13px; line-height: 1.85; }
      .aps-facts { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 9px; margin-top: 20px; }
      .aps-fact { min-width: 0; padding: 12px; border: 1px solid rgba(255,255,255,.09); border-radius: 7px; background: rgba(255,255,255,.025); }
      .aps-fact small { display: block; margin-bottom: 6px; color: #8e8583; font-size: 9px; letter-spacing: 1.3px; text-transform: uppercase; }
      .aps-fact strong { display: block; color: #e8e1de; font-size: 12px; line-height: 1.55; overflow-wrap: anywhere; }
      .aps-card-link { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 8px; margin-top: 19px; color: #f4eeeb; font-size: 12px; font-weight: 800; transition: gap .2s,color .2s; }
      .aps-card-link:hover { gap: 12px; color: var(--red-bright); }

      /* toolkit */
      .aps-toolkit-section { margin-top: 0; }
      .aps-toolkit-intro { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: 8px 0 22px; padding: 24px 27px; border: 1px solid rgba(255,255,255,.11); border-radius: 15px; background: radial-gradient(ellipse at 82% 5%,rgba(237,52,72,.16),transparent 48%),linear-gradient(120deg,rgba(25,22,27,.94),rgba(9,10,14,.88)); box-shadow: 0 20px 60px rgba(0,0,0,.2); }
      .aps-toolkit-overline { display: inline-flex; align-items: center; gap: 9px; color: #ff8795; font-size: 10px; font-weight: 900; letter-spacing: 1.7px; }
      .aps-toolkit-intro h3 { margin: 12px 0 7px; color: #f7f2ef; font-size: clamp(20px,2.6vw,30px); line-height: 1.12; letter-spacing: -1px; }
      .aps-toolkit-intro h3 em { color: #ff687b; font-style: normal; }
      .aps-toolkit-intro p { max-width: 680px; margin: 0; color: #a9a09e; font-size: 12px; line-height: 1.8; }
      .aps-toolkit-total { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; padding: 13px 16px; border: 1px solid rgba(255,104,123,.24); border-radius: 10px; background: rgba(237,52,72,.055); }
      .aps-toolkit-total strong { color: #fff; font-size: 35px; line-height: 1; letter-spacing: -2px; }
      .aps-toolkit-total span { color: #b9aeb0; font-size: 9px; font-weight: 850; line-height: 1.65; letter-spacing: 1.2px; }
      .aps-skill-controls { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 0 0 17px; }
      .aps-skill-filters { display: flex; flex-wrap: wrap; gap: 7px; }
      .aps-skill-filter { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 11px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; color: #aaa2a0; background: rgba(255,255,255,.025); font-size: 11px; font-weight: 750; cursor: pointer; transition: all .22s ease; }
      .aps-skill-filter span { min-width: 17px; padding: 2px 4px; border-radius: 4px; color: #8e8585; background: rgba(255,255,255,.06); font-size: 9px; text-align: center; }
      .aps-skill-filter:hover, .aps-skill-filter.is-active { color: #fff; border-color: rgba(255,104,123,.48); background: rgba(237,52,72,.11); }
      .aps-skill-filter.is-active span { color: #fff; background: rgba(237,52,72,.35); }
      .aps-skill-search { display: flex; align-items: center; gap: 8px; width: min(250px,100%); min-height: 36px; padding: 0 10px; border: 1px solid rgba(255,255,255,.13); border-radius: 6px; color: #ff788a; background: rgba(10,10,14,.62); }
      .aps-skill-search:focus-within { border-color: rgba(255,104,123,.55); box-shadow: 0 0 0 3px rgba(237,52,72,.07); }
      .aps-skill-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: #f7f2ef; background: transparent; font: inherit; font-size: 12px; }
      .aps-skill-search input::placeholder { color: #766e70; }
      .aps-skill-search button { display: grid; place-items: center; padding: 3px; border: 0; color: #aaa; background: transparent; cursor: pointer; }
      .aps-skill-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 11px; align-items: stretch; }
      .aps-skill-grid > * { min-width: 0; }
      .aps-skill-card { position: relative; overflow: hidden; min-width: 0; min-height: 156px; padding: 18px; border: 1px solid rgba(255,255,255,.105); border-radius: 12px; background: linear-gradient(145deg,rgba(24,23,28,.91),rgba(10,11,15,.88)); box-shadow: 0 12px 32px rgba(0,0,0,.13); transition: transform .25s,border-color .25s,box-shadow .25s; }
      .aps-skill-card::after { content: ""; position: absolute; right: -36px; top: -52px; width: 115px; aspect-ratio: 1; border: 1px solid rgba(255,104,123,.11); border-radius: 50%; box-shadow: 0 0 0 15px rgba(255,104,123,.018),0 0 0 30px rgba(255,104,123,.012); pointer-events: none; }
      .aps-skill-card:hover { transform: translateY(-5px); border-color: rgba(255,104,123,.42); box-shadow: 0 22px 48px rgba(0,0,0,.27); }
      .aps-skill-icon { width: 37px; height: 37px; display: grid; place-items: center; border: 1px solid rgba(237,52,72,.27); border-radius: 10px; color: #ff7487; background: linear-gradient(145deg,rgba(237,52,72,.15),rgba(237,52,72,.035)); }
      .aps-skill-copy { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-width: 0; margin-top: 13px; }
      .aps-skill-copy strong { color: #f6f0ed; font-size: 14px; overflow-wrap: anywhere; }
      .aps-skill-copy small { flex: 0 0 auto; color: #ff8493; font-size: 10px; text-align: right; }
      .aps-skill-meter { height: 5px; margin-top: 13px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.09); }
      .aps-skill-meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#a9102d,#f0445d 70%,#ff9aa5); box-shadow: 0 0 12px rgba(237,52,72,.25); }
      .aps-skill-card p { margin: 9px 0 0; color: #928a89; font-size: 11px; line-height: 1.5; }
      .aps-skill-no-results { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 35px; border: 1px dashed rgba(255,255,255,.16); border-radius: 12px; color: #91898a; text-align: center; }
      .aps-skill-no-results svg { color: #ff7487; }
      .aps-skill-no-results strong { color: #eee; font-size: 14px; }
      .aps-skill-no-results span { font-size: 12px; }
      .aps-skill-no-results button { margin-top: 5px; padding: 8px 12px; border: 1px solid rgba(255,104,123,.35); border-radius: 5px; color: #fff; background: rgba(237,52,72,.1); font-size: 12px; cursor: pointer; }
      .aps-toolkit-foot { display: flex; justify-content: space-between; gap: 12px; margin-top: 15px; color: #807879; font-size: 11px; }
      .aps-toolkit-foot span:first-child { display: inline-flex; align-items: center; gap: 7px; }
      .aps-toolkit-foot svg { color: #80d6a1; }

      /* projects */
      .aps-project-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 17px; perspective: 1300px; align-items: stretch; }
      .aps-project-grid > * { min-width: 0; }
      .aps-project-card { position: relative; overflow: hidden; min-width: 0; height: 100%; border: 1px solid rgba(255,255,255,.14); border-radius: 13px; background: linear-gradient(145deg,rgba(24,23,26,.94),rgba(8,9,12,.94)); box-shadow: 0 22px 65px rgba(0,0,0,.24); transform-style: preserve-3d; transition: border-color .3s,box-shadow .3s; }
      .aps-project-card:hover { border-color: rgba(237,52,72,.5); box-shadow: 0 30px 75px rgba(0,0,0,.34),0 0 35px rgba(237,52,72,.06); }
      .aps-project-card-inner { min-height: 100%; display: flex; flex-direction: column; }
      .aps-project-card-meta { min-height: 42px; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 0 15px; color: #ff7483; font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
      .aps-project-card-meta b { color: #fff; font-variant-numeric: tabular-nums; }
      .aps-project-status { flex: 0 0 auto; padding: 5px 8px; border: 1px solid rgba(255,255,255,.13); border-radius: 30px; color: #c6bfbc; font-size: 9px; letter-spacing: .3px; text-transform: none; }
      .aps-project-status.is-live { border-color: rgba(114,216,154,.3); color: #9be4b5; background: rgba(66,166,108,.08); }
      .aps-project-art { position: relative; height: 225px; overflow: hidden; border-top: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.08); background: #111115; }
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
      .aps-art-number { position: absolute; top: 17px; left: 17px; color: rgba(255,255,255,.45); font-size: 11px; font-weight: 850; letter-spacing: 2px; }
      .aps-art-center { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--red-bright); }
      .aps-art-center span { color: rgba(255,255,255,.8); font-size: 10px; font-weight: 800; letter-spacing: 1.8px; }
      .aps-art-disclaimer { position: absolute; bottom: 12px; left: 14px; color: rgba(255,255,255,.42); font-size: 9px; letter-spacing: 1.2px; }
      .aps-project-art-overlay { position: absolute; top: 13px; right: 13px; z-index: 4; display: flex; align-items: center; gap: 9px; max-width: calc(100% - 26px); }
      .aps-preview-kind { display: inline-flex; align-items: center; gap: 7px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.18); border-radius: 30px; color: #fff; background: rgba(8,9,12,.72); backdrop-filter: blur(12px); font-size: 9px; font-weight: 850; letter-spacing: 1px; }
      .aps-project-art-overlay a { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,100,117,.5); border-radius: 30px; color: #fff; background: rgba(173,20,45,.84); font-size: 9px; font-weight: 900; letter-spacing: .8px; white-space: nowrap; transition: transform .18s,background .18s; }
      .aps-project-art-overlay a:hover { transform: translateY(-2px); background: #e72f47; }
      .aps-project-art-footer { position: absolute; inset: auto 13px 12px; z-index: 3; display: flex; justify-content: space-between; gap: 10px; color: rgba(255,255,255,.82); font-size: 9px; letter-spacing: 1px; text-shadow: 0 2px 8px #000; pointer-events: none; }
      .aps-project-card-content { min-width: 0; display: flex; flex: 1; flex-direction: column; padding: 20px 19px 17px; }
      .aps-project-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .aps-project-kicker { display: block; margin-bottom: 7px; color: #9b9290; font-size: 9px; font-weight: 800; letter-spacing: 1.4px; overflow-wrap: anywhere; }
      .aps-project-title-row h3 { margin: 0; color: #f5f0ed; font-size: 21px; letter-spacing: -.7px; overflow-wrap: anywhere; }
      .aps-project-arrow { width: 34px; height: 34px; display: grid; flex: 0 0 34px; place-items: center; border: 1px solid rgba(237,52,72,.3); border-radius: 50%; color: var(--red-bright); background: rgba(237,52,72,.07); transition: transform .25s,background .25s; }
      .aps-project-card:hover .aps-project-arrow { transform: rotate(45deg); background: rgba(237,52,72,.17); }
      .aps-project-card-content > p { min-height: 58px; margin: 11px 0 0; color: var(--muted); font-size: 12px; line-height: 1.8; overflow-wrap: anywhere; }
      .aps-project-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 15px; }
      .aps-project-stack span { padding: 6px 8px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; color: #d0c8c5; background: rgba(255,255,255,.025); font-size: 10px; }
      .aps-project-card-bottom { display: flex; align-items: end; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 18px; }
      .aps-project-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 13px; }
      .aps-project-actions a { display: inline-flex; align-items: center; gap: 6px; color: #f0eae7; font-size: 11px; font-weight: 800; transition: color .2s; }
      .aps-project-actions a:hover { color: var(--red-bright); }
      .aps-project-actions .aps-project-live { color: #ff8290; }
      .aps-project-index { color: rgba(255,255,255,.32); font-size: 9px; letter-spacing: 1px; white-space: nowrap; }
      .aps-no-link { display: inline-flex; align-items: center; gap: 6px; color: #827a78; font-size: 10px; }

      /* shared empty state */
      .aps-empty-state { grid-column: 1/-1; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; border: 1px dashed rgba(255,255,255,.19); border-radius: 12px; text-align: center; color: var(--muted); background: radial-gradient(ellipse at 50% 0%,rgba(237,52,72,.055),transparent 65%); }
      .aps-empty-state > div { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid rgba(237,52,72,.2); border-radius: 13px; color: var(--red-bright); background: rgba(237,52,72,.06); }
      .aps-empty-state h3 { margin: 12px 0 5px; color: #f3eeeb; font-size: 16px; }
      .aps-empty-state p { margin: 0; font-size: 12px; line-height: 1.7; }
      .aps-empty-state a { display: inline-flex; align-items: center; gap: 7px; margin-top: 13px; color: #fff; font-size: 12px; }

      .aps-tech-strip { position: relative; z-index: 1; width: min(1220px,90%); margin: 0 auto 45px; padding: 22px 0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 17px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); color: #a9a19f; font-size: 10px; letter-spacing: 1.2px; }
      .aps-tech-strip span { display: inline-flex; align-items: center; gap: 8px; transition: color .2s,transform .2s; }
      .aps-tech-strip span:hover { color: #fff; transform: translateY(-2px); }
      .aps-tech-strip svg { color: var(--red-bright); }

      /* DSA */
      .aps-dsa-command { display: grid; grid-template-columns: 1.05fr .95fr; gap: 18px; padding: 20px; border: 1px solid rgba(255,255,255,.12); border-radius: 16px; background: radial-gradient(ellipse at 13% 0%,rgba(237,52,72,.15),transparent 42%),linear-gradient(135deg,rgba(24,21,26,.96),rgba(8,10,14,.94)); box-shadow: 0 24px 70px rgba(0,0,0,.24); }
      .aps-dsa-command-main { min-width: 0; padding: 9px 10px 8px; }
      .aps-dsa-command-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .aps-dsa-console-tag { padding: 6px 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 5px; color: #91898b; font: 10px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing: .8px; }
      .aps-dsa-command-number { display: flex; align-items: center; gap: 16px; margin: 20px 0 8px; }
      .aps-dsa-command-number strong { color: #fff; font-size: clamp(58px,8vw,94px); font-weight: 950; line-height: .9; letter-spacing: -6px; text-shadow: 0 12px 45px rgba(237,52,72,.2); }
      .aps-dsa-command-number span { color: #a79d9e; font-size: 10px; font-weight: 850; line-height: 1.8; letter-spacing: 1.5px; }
      .aps-dsa-command-main > p { max-width: 450px; margin: 13px 0 20px; color: #a59c9c; font-size: 12px; line-height: 1.8; }
      .aps-dsa-difficulty { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; max-width: 480px; }
      .aps-difficulty-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 7px; background: rgba(255,255,255,.025); }
      .aps-difficulty-item span { color: #a69e9d; font-size: 11px; }
      .aps-difficulty-item strong { color: #f5f0ed; font-size: 16px; }
      .aps-difficulty-item.easy { border-color: rgba(103,210,145,.22); } .aps-difficulty-item.easy strong { color: #80dba3; }
      .aps-difficulty-item.medium { border-color: rgba(242,183,91,.2); } .aps-difficulty-item.medium strong { color: #f1c477; }
      .aps-difficulty-item.hard { border-color: rgba(255,104,123,.22); } .aps-difficulty-item.hard strong { color: #ff7b8c; }
      .aps-dsa-command-side { min-width: 0; align-self: stretch; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 11px; background: rgba(4,7,10,.72); box-shadow: inset 0 0 35px rgba(0,0,0,.22); }
      .aps-dsa-terminal-head { display: flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 13px; border-bottom: 1px solid rgba(255,255,255,.09); background: rgba(255,255,255,.025); }
      .aps-dsa-terminal-head > span { display: flex; gap: 4px; }
      .aps-dsa-terminal-head > span i { width: 6px; height: 6px; border-radius: 50%; background: #f16b73; }
      .aps-dsa-terminal-head > span i:nth-child(2) { background: #e8b45c; }
      .aps-dsa-terminal-head > span i:nth-child(3) { background: #72cb91; }
      .aps-dsa-terminal-head small { flex: 1; margin-left: 6px; color: #a59b9d; font: 10px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-terminal-head > svg { color: #ff7789; }
      .aps-dsa-terminal-body { padding: 17px 16px; font: 11px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-terminal-body > p:first-child { margin: 0 0 16px; color: #e5dfe0; }
      .aps-dsa-terminal-body > p:first-child b { color: #ff7185; }
      .aps-terminal-line { display: flex; justify-content: space-between; gap: 15px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.065); }
      .aps-terminal-line span { color: #8c9697; }
      .aps-terminal-line strong { color: #f5eeee; font-weight: 700; }
      .aps-dsa-terminal-body .aps-terminal-success { display: flex; align-items: center; gap: 7px; margin: 17px 0 0; color: #80dba3; font-size: 10px; }
      .aps-dsa-lower-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 16px; }
      .aps-dsa-profile-card, .aps-dsa-approach-card { position: relative; min-width: 0; padding: 23px; overflow: hidden; border: 1px solid rgba(255,255,255,.11); border-radius: 13px; background: linear-gradient(145deg,rgba(24,22,27,.91),rgba(10,11,15,.88)); }
      .aps-dsa-profile-card::after, .aps-dsa-approach-card::after { content: ""; position: absolute; right: -75px; bottom: -115px; width: 220px; aspect-ratio: 1; border: 1px solid rgba(237,52,72,.14); border-radius: 50%; box-shadow: 0 0 0 25px rgba(237,52,72,.02),0 0 0 50px rgba(237,52,72,.012); pointer-events: none; }
      .aps-dsa-card-heading { display: flex; align-items: center; gap: 11px; }
      .aps-dsa-icon { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(237,52,72,.28); border-radius: 10px; color: #ff788a; background: rgba(237,52,72,.08); }
      .aps-dsa-card-kicker { color: #ff8795; font-size: 9px; font-weight: 900; letter-spacing: 1.5px; }
      .aps-dsa-profile-card h3, .aps-dsa-approach-card h3 { position: relative; z-index: 1; margin: 17px 0 8px; color: #f5efed; font-size: clamp(19px,2.4vw,27px); line-height: 1.16; letter-spacing: -.8px; }
      .aps-dsa-profile-card p, .aps-dsa-approach-card p { position: relative; z-index: 1; margin: 0; color: #a49b9a; font-size: 12px; line-height: 1.85; }
      .aps-dsa-profile-metrics { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 18px; }
      .aps-dsa-profile-metrics > div { padding: 11px; border: 1px solid rgba(255,255,255,.09); border-radius: 7px; background: rgba(255,255,255,.025); }
      .aps-dsa-profile-metrics small { display: block; margin-bottom: 5px; color: #807879; font-size: 9px; letter-spacing: 1.2px; }
      .aps-dsa-profile-metrics strong { color: #eee7e5; font-size: 13px; }
      .aps-dsa-action { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 8px; margin-top: 17px; color: #fff; font-size: 12px; font-weight: 850; transition: gap .2s,color .2s; }
      .aps-dsa-action:hover { gap: 12px; color: #ff8291; }
      .aps-dsa-pill-row { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 17px; }
      .aps-dsa-pill-row span { padding: 6px 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 5px; color: #c4bbba; background: rgba(255,255,255,.025); font-size: 10px; }
      .aps-dsa-activity { margin-top: 17px; padding: 22px; border: 1px solid rgba(255,255,255,.1); border-radius: 13px; background: rgba(12,12,16,.72); }
      .aps-dsa-activity-heading { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 13px; }
      .aps-dsa-activity-heading h3 { margin: 7px 0 0; color: #f4eeeb; font-size: 18px; letter-spacing: -.4px; }
      .aps-dsa-activity-heading > span { color: #837a7b; font-size: 10px; }
      .aps-dsa-log-list { display: grid; }
      .aps-dsa-log-row { display: flex; align-items: center; gap: 13px; min-width: 0; padding: 13px 2px; border-top: 1px solid rgba(255,255,255,.075); }
      .aps-dsa-log-index { color: #ff7487; font: 11px ui-monospace,SFMono-Regular,Menlo,monospace; }
      .aps-dsa-log-main { display: grid; flex: 1; min-width: 0; gap: 5px; }
      .aps-dsa-log-main strong { overflow: hidden; color: #eee8e6; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
      .aps-dsa-log-main span { color: #8d8585; font-size: 10px; }
      .aps-dsa-level { padding: 5px 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 5px; color: #c9c0bf; font-size: 9px; }
      .aps-dsa-level.easy { color: #80dba3; border-color: rgba(103,210,145,.22); }
      .aps-dsa-level.medium { color: #f1c477; border-color: rgba(242,183,91,.22); }
      .aps-dsa-level.hard { color: #ff7b8c; border-color: rgba(255,104,123,.22); }
      .aps-dsa-log-row > a { display: grid; place-items: center; width: 29px; height: 29px; border: 1px solid rgba(255,255,255,.12); border-radius: 50%; color: #ff8291; }
      .aps-dsa-log-platform { color: #81797a; font-size: 9px; }
      .aps-dsa-empty-log { display: flex; align-items: center; gap: 13px; padding: 18px 0 4px; border-top: 1px solid rgba(255,255,255,.075); color: #ff7b8c; }
      .aps-dsa-empty-log > div { display: grid; flex: 1; gap: 5px; }
      .aps-dsa-empty-log strong { color: #e9e2e0; font-size: 12px; }
      .aps-dsa-empty-log span { color: #8e8585; font-size: 10px; line-height: 1.6; }
      .aps-dsa-empty-log a { display: inline-flex; align-items: center; gap: 5px; color: #fff; font-size: 10px; white-space: nowrap; }

      /* achievements / certificates */
      .aps-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; margin-top: 17px; }
      .aps-record-column h3 { display: flex; align-items: center; gap: 9px; margin: 0 0 13px; color: #eee; font-size: 14px; }
      .aps-record-column h3 svg { color: var(--red-bright); }
      .aps-record-list { display: grid; gap: 9px; min-width: 0; }
      .aps-record { position: relative; overflow: hidden; padding: 17px; border: 1px solid var(--line); border-radius: 9px; background: rgba(255,255,255,.025); transition: transform .28s,border-color .28s,background .28s; }
      .aps-record:hover { transform: translateX(4px); border-color: rgba(255,104,123,.32); background: rgba(237,52,72,.035); }
      .aps-record h4 { margin: 0 0 7px; color: #f1ece9; font-size: 13px; overflow-wrap: anywhere; }
      .aps-record p { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
      .aps-record small { display: block; margin-top: 9px; color: #827a78; font-size: 10px; }
      .aps-record a { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; color: #fff; font-size: 11px; transition: color .2s,gap .2s; }
      .aps-record a:hover { gap: 10px; color: var(--red-bright); }

      /* timeline */
      .aps-timeline { position: relative; display: grid; gap: 11px; }
      .aps-timeline::before { content: ""; position: absolute; left: 13px; top: 16px; bottom: 16px; width: 1px; background: linear-gradient(var(--red),rgba(255,255,255,.08)); }
      .aps-timeline-item { position: relative; padding: 18px 20px 18px 47px; border: 1px solid var(--line); border-radius: 9px; background: rgba(255,255,255,.025); transition: border-color .28s,transform .28s,background .28s; }
      .aps-timeline-item:hover { transform: translateX(3px); border-color: rgba(237,52,72,.4); background: rgba(237,52,72,.035); }
      .aps-timeline-item::before { content: ""; position: absolute; left: 7px; top: 23px; width: 13px; height: 13px; border: 2px solid #171316; border-radius: 50%; background: var(--red-bright); box-shadow: 0 0 14px rgba(237,52,72,.5); }
      .aps-timeline-item small { color: var(--red-bright); font-size: 10px; letter-spacing: 1.2px; }
      .aps-timeline-item h3 { margin: 7px 0; color: #f3eeeb; font-size: 15px; overflow-wrap: anywhere; }
      .aps-timeline-item p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.8; }

      /* goals */
      .aps-goal-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
      .aps-goal-card { position: relative; overflow: hidden; min-width: 0; padding: 20px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.025); transition: transform .25s,border-color .25s; }
      .aps-goal-card:hover { transform: translateY(-4px); border-color: rgba(237,52,72,.38); }
      .aps-goal-card::after { content: ""; position: absolute; top: -65px; right: -65px; width: 130px; aspect-ratio: 1; border: 1px solid rgba(255,255,255,.055); border-radius: 50%; pointer-events: none; }
      .aps-goal-card > svg { color: var(--red-bright); }
      .aps-goal-card h3 { margin: 12px 0 7px; color: #f1ece9; font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
      .aps-goal-card p { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.75; }
      .aps-goal-progress { height: 3px; margin-top: 14px; overflow: hidden; border-radius: 9px; background: rgba(255,255,255,.1); }
      .aps-goal-progress span { display: block; height: 100%; background: linear-gradient(90deg,#b91431,#ff687b); box-shadow: 0 0 14px rgba(237,52,72,.28); }

      /* CTA */
      .aps-cta { position: relative; z-index: 1; isolation: isolate; width: min(1220px,90%); margin: 0 auto 90px; padding: clamp(28px,5vw,55px); overflow: hidden; border: 1px solid rgba(237,52,72,.3); border-radius: 15px; background: radial-gradient(ellipse at 90% 40%,rgba(237,52,72,.2),transparent 45%),linear-gradient(135deg,rgba(26,22,25,.94),rgba(9,10,13,.93)); box-shadow: 0 28px 90px rgba(0,0,0,.24); }
      .aps-cta::after { content: ""; position: absolute; top: -180px; right: -90px; width: 360px; aspect-ratio: 1; border: 1px solid rgba(237,52,72,.18); border-radius: 50%; box-shadow: 0 0 0 35px rgba(237,52,72,.025),0 0 0 70px rgba(237,52,72,.018); pointer-events: none; }
      .aps-cta h2 { position: relative; z-index: 1; max-width: 760px; margin: 17px 0; color: #f7f2ef; font-size: clamp(34px,5vw,64px); line-height: 1.02; letter-spacing: -2px; }
      .aps-cta h2 em { color: var(--red-bright); font-style: normal; }
      .aps-cta p { position: relative; z-index: 1; max-width: 570px; color: var(--muted); font-size: 13px; line-height: 1.85; }
      .aps-cta-actions { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 23px; }
      .aps-button { min-width: 170px; min-height: 47px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 0 18px; border: 1px solid transparent; border-radius: 6px; font-size: 12px; font-weight: 850; cursor: pointer; user-select: none; transition: transform .25s,box-shadow .25s,border-color .25s,background .25s; }
      .aps-button:hover { transform: translateY(-3px); }
      .aps-button-primary { color: #fff; background: linear-gradient(115deg,#f04458,#a90e27); box-shadow: 0 12px 32px rgba(210,28,52,.24); }
      .aps-button-ghost { color: #eee; border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.045); backdrop-filter: blur(12px); }
      .aps-button-ghost:hover { border-color: rgba(255,100,117,.7); background: rgba(237,52,72,.09); }
      .aps-quick-links { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; max-width: 760px; margin-top: 25px; }
      .aps-quick-links a { padding: 8px 10px; border: 1px solid var(--line); border-radius: 5px; color: #c5bdbb; font-size: 10px; transition: .2s; }
      .aps-quick-links a:hover { color: #fff; border-color: var(--red); background: rgba(237,52,72,.08); transform: translateY(-2px); }
      .aps-back-top { position: fixed; right: 22px; bottom: 22px; z-index: 40; width: 43px; height: 43px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; color: #fff; background: rgba(15,15,18,.82); backdrop-filter: blur(14px); box-shadow: 0 10px 35px rgba(0,0,0,.28); cursor: pointer; transition: .25s; }
      .aps-back-top:hover { transform: translateY(-4px); border-color: var(--red); background: var(--red); }

      /* responsive */
      @media (max-width: 1050px) {
        .aps-project-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-skill-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
      }
      @media (max-width: 900px) {
        .aps-dsa-command { grid-template-columns: 1fr; }
      }
      @media (max-width: 760px) {
        .aps-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-section { padding: 75px 0; }
        .aps-section-head { align-items: flex-start; flex-direction: column; gap: 10px; margin-bottom: 25px; }
        .aps-about-grid, .aps-two-col, .aps-dsa-lower-grid { grid-template-columns: 1fr; }
        .aps-project-grid, .aps-goal-grid { grid-template-columns: 1fr; }
        .aps-project-art { height: 240px; }
        .aps-project-card-content > p { min-height: 0; }
        .aps-project-card-bottom { align-items: flex-start; flex-direction: column; }
        .aps-project-index { display: none; }
        .aps-skill-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .aps-toolkit-intro { align-items: flex-start; flex-direction: column; }
        .aps-skill-controls { align-items: stretch; flex-direction: column; }
        .aps-skill-search { width: 100%; }
        .aps-tech-strip { justify-content: flex-start; }
        .aps-cta { margin-bottom: 65px; }
      }
      @media (max-width: 520px) {
        .aps-cta-actions .aps-button { width: 100%; }
        .aps-facts { grid-template-columns: 1fr; }
        .aps-glass-card { padding: 22px; }
        .aps-dsa-command { padding: 13px; }
        .aps-dsa-activity { padding: 15px; }
        .aps-toolkit-foot { align-items: flex-start; flex-direction: column; }
      }
      @media (hover: none) {
        .aps-project-card:hover, .aps-skill-card:hover, .aps-goal-card:hover, .aps-button:hover, .aps-record:hover { transform: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aps-home *, .aps-home *::before, .aps-home *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
      }
    `}</style>
  );
}

/* ------------------------------------------------------------------- page */
export default function Home() {
  const { content = {} } = usePortfolio();
  const { enabled = true } = useMotionPreference();
  const [activeSkillGroup, setActiveSkillGroup] = useState("All");
  const [skillSearch, setSkillSearch] = useState("");

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
      const matchesQuery =
        !query ||
        [skill.name, skill.category, skill.detail].some((v) => String(v || "").toLowerCase().includes(query));
      return matchesGroup && matchesQuery;
    });
  }, [normalizedSkills, activeSkillGroup, skillSearch]);

  const dsaPreview = useMemo(
    () =>
      dsa
        .map((entry, index) => {
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
        })
        .filter((item) => item.title)
        .slice(0, 4),
    [dsa]
  );
  const dsaDifficulty = useMemo(() => {
    const count = (re) => dsa.filter((item) => re.test(String(item?.difficulty || item?.level || ""))).length;
    return { easy: count(/easy/i), medium: count(/medium/i), hard: count(/hard/i) };
  }, [dsa]);

  const timelineItems = useMemo(
    () => timeline.map((item, i) => normalizeEntry(item, i, "milestone", "Learning milestone")).filter(Boolean).slice(0, 6),
    [timeline]
  );
  const achievementItems = useMemo(
    () => achievements.map((item, i) => normalizeEntry(item, i, "achievement", "Achievement")).filter(Boolean).slice(0, 6),
    [achievements]
  );
  const certificateItems = useMemo(
    () => certificates.map((item, i) => normalizeEntry(item, i, "certificate", "Certificate")).filter(Boolean).slice(0, 6),
    [certificates]
  );
  const goalItems = useMemo(
    () => goals.map((item, i) => normalizeEntry(item, i, "goal", "Learning goal")).filter(Boolean).slice(0, 6),
    [goals]
  );
  const updateItems = useMemo(
    () => dailyUpdates.map((item, i) => normalizeEntry(item, i, "update", "Learning update")).filter(Boolean).slice(0, 3),
    [dailyUpdates]
  );

  const name = firstText(profile.name, "Developer");
  const role = firstText(profile.role, "Developer • Builder • Problem Solver");
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

      {/* ---------- HERO ---------- */}
      <HeroSection
        name={name}
        role={role}
        intro={textValue(profile.intro)}
        location={location}
        github={github}
        linkedin={linkedin}
        leetcode={leetcode}
        email={email}
        enabled={enabled}
        onExplore={() => scrollTo("aps-projects")}
        onDiscover={() => scrollTo("aps-about")}
      />

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

      {/* ---------- 01 ABOUT ---------- */}
      <section className="aps-section" id="aps-about">
        <SectionLabel number="01">ABOUT / PROFILE</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="WHO I AM"
            title="Curiosity first. Craft always."
            description="A little introduction, the education behind my journey and what motivates me to keep building."
          />
          <Link className="aps-view-all" to="/about">
            Full about page <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="aps-about-grid">
          <TiltSurface className="aps-glass-card" enabled={enabled}>
            <span className="aps-eyebrow"><i /> A LITTLE ABOUT ME</span>
            <div className="aps-card-icon"><Sparkles size={19} /></div>
            <h3>
              Turning ideas
              <br />
              <em>into useful things.</em>
            </h3>
            <p>
              {textValue(profile.about) ||
                textValue(profile.intro) ||
                "I am a developer who enjoys learning, problem solving and building practical digital experiences."}
            </p>
            <div className="aps-facts">
              <div className="aps-fact"><small>Location</small><strong>{location}</strong></div>
              <div className="aps-fact"><small>Availability</small><strong>{availability}</strong></div>
              <div className="aps-fact"><small>Graduation</small><strong>{graduation || "Not added yet"}</strong></div>
              <div className="aps-fact"><small>CGPA</small><strong>{cgpa || "Not added yet"}</strong></div>
            </div>
            <Link className="aps-card-link" to="/about">
              Discover my story <ArrowRight size={14} />
            </Link>
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
            <Link className="aps-card-link" to="/journey">
              Explore my journey <ArrowRight size={14} />
            </Link>
          </TiltSurface>
        </div>
      </section>

      {/* ---------- 02 SKILLS (now a sibling, no longer nested in About) ---------- */}
      <section className="aps-section aps-toolkit-section" id="aps-skills">
        <SectionLabel number="02">CAPABILITIES / TOOLKIT</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="TECH STACK"
            title="Tools I work with."
            description="A living snapshot of the technologies I use, practise and explore. Skill details stay connected to the Admin Dashboard."
          />
          <Link className="aps-view-all" to="/journey">
            Explore learning path <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="aps-toolkit-intro">
          <div>
            <span className="aps-toolkit-overline"><span className="aps-live-dot" /> ENGINEERING TOOLKIT</span>
            <h3>
              Learn it. Build with it. <em>Get better every day.</em>
            </h3>
            <p>Browse the stack by discipline or search for a technology. Progress bars are self-assessed indicators, not test scores.</p>
          </div>
          <div className="aps-toolkit-total">
            <strong>{normalizedSkills.length.toString().padStart(2, "0")}</strong>
            <span>
              TECHNOLOGIES
              <br />
              IN THIS PORTFOLIO
            </span>
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
                    <span>
                      {group === "All"
                        ? normalizedSkills.length
                        : normalizedSkills.filter((s) => s.category === group).length}
                    </span>
                  </button>
                ))}
              </div>
              <label className="aps-skill-search">
                <Search size={15} />
                <input
                  type="search"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Find a technology..."
                  aria-label="Search technologies"
                />
                {skillSearch && (
                  <button type="button" onClick={() => setSkillSearch("")} aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>

            <motion.div
              className="aps-skill-grid"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              {visibleSkills.length ? (
                visibleSkills.map((skill, index) => (
                  <SkillCard key={`${skill.name}-${index}`} skill={skill} index={index} />
                ))
              ) : (
                <div className="aps-skill-no-results">
                  <Search size={22} />
                  <strong>No matching technology</strong>
                  <span>Try another name or choose a different category.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSkillSearch("");
                      setActiveSkillGroup("All");
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </motion.div>
            <div className="aps-toolkit-foot">
              <span><ShieldCheck size={14} /> Skill levels are self-assessed and editable in Admin.</span>
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

      {/* ---------- 03 PROJECTS ---------- */}
      <section className="aps-section" id="aps-projects">
        <SectionLabel number="03">SELECTED WORK / PROJECTS</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="WHAT I'VE BUILT"
            title="Selected work."
            description="Real applications, experiments and hardware projects. Open the live websites or explore the complete project archive."
          />
          <Link className="aps-view-all" to="/projects">
            Explore complete archive <ArrowUpRight size={15} />
          </Link>
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

      {/* ---------- 04 DSA ---------- */}
      <section className="aps-section" id="aps-dsa">
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
              <span>
                RECORDED
                <br />
                PRACTICE ENTRIES
              </span>
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
              <span><i /><i /><i /></span>
              <small>practice_summary.sh</small>
              <Terminal size={14} />
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
              <div className="aps-dsa-icon"><Code2 size={20} /></div>
              <span className="aps-dsa-card-kicker">CODING PROFILE / 01</span>
            </div>
            <h3>{textValue(content.leetcode?.username) || "Problem solving journey"}</h3>
            <p>
              {textValue(content.leetcode?.username)
                ? "The coding profile is connected. Open it to explore submitted solutions and progress."
                : "Connect a LeetCode username and add verified profile statistics through the Admin Dashboard."}
            </p>
            <div className="aps-dsa-profile-metrics">
              <div><small>RATING</small><strong>{content.leetcode?.rating || "Not added"}</strong></div>
              <div><small>STREAK</small><strong>{content.leetcode?.streak ? `${content.leetcode.streak} days` : "Not added"}</strong></div>
            </div>
            <a className="aps-dsa-action" href={leetcode || "https://leetcode.com/"} target="_blank" rel="noopener noreferrer">
              Visit LeetCode <ExternalLink size={14} />
            </a>
          </article>

          <article className="aps-dsa-approach-card">
            <div className="aps-dsa-card-heading">
              <div className="aps-dsa-icon"><Brain size={20} /></div>
              <span className="aps-dsa-card-kicker">MY APPROACH / 02</span>
            </div>
            <h3>Understand the pattern. Explain the solution.</h3>
            <p>I focus on breaking a problem into smaller steps, choosing a suitable data structure, analysing time and space complexity, and communicating the reasoning clearly.</p>
            <div className="aps-dsa-pill-row">
              <span>Problem breakdown</span><span>Patterns</span><span>Complexity</span><span>Clean code</span>
            </div>
            <Link className="aps-dsa-action" to="/journey">
              See learning journey <ArrowRight size={14} />
            </Link>
          </article>
        </div>

        <div className="aps-dsa-activity">
          <div className="aps-dsa-activity-heading">
            <div>
              <span className="aps-eyebrow"><i /> RECENT PRACTICE</span>
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
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`}>
                      <ArrowUpRight size={16} />
                    </a>
                  ) : (
                    <span className="aps-dsa-log-platform">{item.platform}</span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="aps-dsa-empty-log">
              <Terminal size={20} />
              <div>
                <strong>No practice logs added yet</strong>
                <span>Add problem title, topic, difficulty and optional link from Admin to build this activity feed.</span>
              </div>
              <Link to="/admin">Update logs <ArrowUpRight size={14} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* ---------- 05 ACHIEVEMENTS ---------- */}
      <section className="aps-section" id="aps-achievements">
        <SectionLabel number="05">MILESTONES / RECOGNITION</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="ACHIEVEMENTS"
            title="Milestones along the way."
            description="Achievements and certificates are dynamically displayed from records added in the Admin Dashboard."
          />
          <Link className="aps-view-all" to="/journey">
            View full journey <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="aps-two-col">
          <div className="aps-record-column">
            <h3><Trophy size={16} /> Achievements</h3>
            <div className="aps-record-list">
              {achievementItems.length ? (
                achievementItems.map((item) => (
                  <article className="aps-record" key={item.id}>
                    <h4>{item.title}</h4>
                    <p>{item.description || item.issuer || item.organization || "Achievement details"}</p>
                    {item.date && <small>{item.date}</small>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        View achievement <ExternalLink size={12} />
                      </a>
                    )}
                  </article>
                ))
              ) : (
                <EmptyState icon={Trophy} title="No achievements added yet." description="Your verified achievements will appear here when added in Admin." />
              )}
            </div>
          </div>

          <div className="aps-record-column">
            <h3><Award size={16} /> Certificates</h3>
            <div className="aps-record-list">
              {certificateItems.length ? (
                certificateItems.map((item) => (
                  <article className="aps-record" key={item.id}>
                    <h4>{item.title}</h4>
                    <p>{item.description || item.issuer || item.organization || "Certificate details"}</p>
                    {item.date && <small>{item.date}</small>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        View certificate <ExternalLink size={12} />
                      </a>
                    )}
                  </article>
                ))
              ) : (
                <EmptyState icon={Award} title="No certificates added yet." description="Add certificates through the Admin Dashboard." />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 06 JOURNEY ---------- */}
      <section className="aps-section" id="aps-journey">
        <SectionLabel number="06">JOURNEY / EXPERIENCE</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="THE PATH SO FAR"
            title="Every step adds up."
            description="Education, learning milestones and experiences from your portfolio timeline."
          />
          <Link className="aps-view-all" to="/journey">
            Open journey page <ArrowUpRight size={15} />
          </Link>
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
          <EmptyState
            icon={CalendarDays}
            title="Your journey will appear here."
            description="Add education, experience and milestones from the Admin Dashboard."
            link={{ to: "/admin", label: "Update timeline" }}
          />
        )}
      </section>

      {/* ---------- 07 GOALS ---------- */}
      <section className="aps-section" id="aps-goals">
        <SectionLabel number="07">NOW / NEXT</SectionLabel>
        <div className="aps-section-head">
          <SectionHeading
            eyebrow="CURRENT DIRECTION"
            title="What I'm working towards."
            description="Current goals and learning priorities help visitors understand what you're exploring next."
          />
          <Link className="aps-view-all" to="/journey">
            Explore my journey <ArrowUpRight size={15} />
          </Link>
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
          <p style={{ color: "#817977", fontSize: 11, marginTop: 15 }}>
            {notes.length} learning note entries are stored in the portfolio.
          </p>
        )}
      </section>

      {/* ---------- CTA ---------- */}
      <section className="aps-cta" id="aps-contact">
        <span className="aps-eyebrow"><i /> HAVE AN IDEA OR OPPORTUNITY?</span>
        <h2>
          Let's build something
          <br />
          <em>meaningful together.</em>
        </h2>
        <p>Whether you have an opportunity, a project idea or simply want to connect, I'd be happy to hear from you.</p>
        <div className="aps-cta-actions">
          <Link className="aps-button aps-button-primary" to="/contact">
            Start a conversation <MoveUpRight size={16} />
          </Link>
          {email && (
            <a className="aps-button aps-button-ghost" href={`mailto:${email}`}>
              Email me <Mail size={15} />
            </a>
          )}
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

      <button type="button" className="aps-back-top" onClick={() => scrollTo("top")} aria-label="Back to top" title="Back to top">
        <ArrowUpRight size={19} />
      </button>
    </main>
  );
}
