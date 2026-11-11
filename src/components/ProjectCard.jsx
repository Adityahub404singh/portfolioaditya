import React, { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  Layers3,
  Sparkles,
  Code2,
  Globe2,
  Cpu,
  GraduationCap,
  BrainCircuit,
  Database,
  ShieldCheck,
  ImageOff,
  Eye,
} from "lucide-react";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

/* ============================================================
   PROJECT CARD — REAL MEDIA / REAL LINKS / ACCESSIBLE 3D
   - Never invent screenshots or silently reuse a fallback image.
   - Only show a photo when the project's own image URL loads.
   - Distinguish a GitHub profile URL from an actual repository URL.
   - Keep click analytics compatible with the existing Supabase setup.
============================================================ */

const CATEGORY_ICONS = {
  "web app": Globe2,
  "ai product": BrainCircuit,
  "edtech": GraduationCap,
  "iot / hardware": Cpu,
  "ai / data": Database,
};

function safeExternalUrl(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  if (!candidate) return "";

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return parsed.href;
  } catch {
    return "";
  }
}

function isGitHubProfile(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    if (!/(^|\.)github\.com$/i.test(parsed.hostname)) return false;

    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.length < 2;
  } catch {
    return false;
  }
}

function trackProjectClick(project, action) {
  if (typeof window === "undefined") return;

  const event = {
    event_type: "project_click",
    page_path: window.location.pathname,
    metadata: {
      project: project.name || project.title || "Untitled Project",
      action,
      destination:
        action === "live" ? project.liveUrl || "" : project.githubUrl || "",
    },
  };

  if (isSupabaseConfigured && supabase) {
    supabase
      .from("portfolio_events")
      .insert(event)
      .then(({ error }) => {
        if (error) {
          console.warn("Project click was not recorded:", error.message);
        }
      })
      .catch((error) => {
        console.warn("Project analytics error:", error);
      });
    return;
  }

  try {
    const key = "aps-analytics-preview";
    const current = JSON.parse(
      window.localStorage.getItem(key) ||
        '{"visits":[],"projectClicks":[]}'
    );

    const clickEvent = {
      ...event,
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    current.projectClicks = [
      clickEvent,
      ...(Array.isArray(current.projectClicks)
        ? current.projectClicks
        : []),
    ].slice(0, 300);

    window.localStorage.setItem(key, JSON.stringify(current));
  } catch (error) {
    console.warn("Local project analytics unavailable:", error);
  }
}

function getCategoryIcon(category) {
  const key = String(category || "").trim().toLowerCase();
  return CATEGORY_ICONS[key] || Layers3;
}

function getProjectImage(project) {
  const raw = project?.image || project?.imageUrl || project?.thumbnail;
  if (typeof raw !== "string") return "";

  const value = raw.trim();
  if (!value) return "";

  // Local public assets and safe HTTP(S) URLs are supported.
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return safeExternalUrl(value);
}

function ProjectMedia({ project, name, category, index }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const image = getProjectImage(project);
  const Icon = getCategoryIcon(category);
  const showImage = Boolean(image) && !failed;

  return (
    <div className={`pc-media ${showImage ? "has-real-image" : "no-real-image"}`}>
      {showImage ? (
        <>
          {!loaded && <div className="pc-media-loading" aria-hidden="true" />}
          <img
            className={`pc-real-image ${loaded ? "is-loaded" : ""}`}
            src={image}
            alt={`${name} — actual project image`}
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
          <span className="pc-media-caption">
            <Eye size={12} />
            ACTUAL PROJECT IMAGE
          </span>
        </>
      ) : (
        <div className="pc-media-unavailable">
          <div className="pc-media-grid" aria-hidden="true" />
          <div className="pc-media-emblem">
            <span className="pc-media-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Icon size={34} strokeWidth={1.35} />
            <strong>{category || "PROJECT"}</strong>
            <small>
              {image && failed ? "IMAGE COULD NOT LOAD" : "NO PREVIEW IMAGE UPLOADED"}
            </small>
          </div>
          <span className="pc-media-caption">
            <ImageOff size={12} />
            {image && failed ? "IMAGE UNAVAILABLE" : "PROJECT DETAILS"}
          </span>
        </div>
      )}

      <div className="pc-media-edge" aria-hidden="true" />
    </div>
  );
}

function ProjectAction({ href, children, onClick, primary = false, label }) {
  if (!href) return null;

  return (
    <a
      className={`pc-action ${primary ? "pc-action-primary" : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

export default function ProjectCard({ project = {}, index = 0 }) {
  const cardRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);

  const springX = useSpring(rotateX, {
    stiffness: 180,
    damping: 24,
    mass: 0.65,
  });
  const springY = useSpring(rotateY, {
    stiffness: 180,
    damping: 24,
    mass: 0.65,
  });

  const name = project.name || project.title || "Untitled Project";
  const description =
    project.description || "Project details have not been added yet.";
  const category = project.category || "Development";
  const status = project.status || "Status not specified";

  const stack = useMemo(
    () =>
      Array.isArray(project.stack)
        ? project.stack.filter(
            (item) => typeof item === "string" && item.trim()
          )
        : [],
    [project.stack]
  );

  const liveUrl = safeExternalUrl(project.liveUrl);
  const githubUrl = safeExternalUrl(project.githubUrl);
  const githubIsProfile = isGitHubProfile(githubUrl);
  const Icon = getCategoryIcon(category);

  const handlePointerMove = (event) => {
    if (reducedMotion || !cardRef.current) return;
    if (event.pointerType === "touch") return;

    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    rotateX.set((0.5 - y) * 9);
    rotateY.set((x - 0.5) * 11);
    pointerX.set(x * 100);
    pointerY.set(y * 100);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    pointerX.set(50);
    pointerY.set(50);
  };

  const handleAction = (action) => {
    trackProjectClick(project, action);
  };

  return (
    <>
      <style>{`
        .pc-card {
          --pc-accent: 239, 65, 84;
          --pc-pointer-x: 50%;
          --pc-pointer-y: 50%;
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100%;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 18px;
          color: #f6f1ef;
          background:
            linear-gradient(145deg, rgba(26,24,26,.96), rgba(10,11,14,.96));
          transform-style: preserve-3d;
          box-shadow:
            0 24px 70px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.055);
          transition:
            border-color .35s ease,
            box-shadow .4s ease,
            background .4s ease;
          isolation: isolate;
        }

        .pc-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            360px circle at var(--pc-pointer-x) var(--pc-pointer-y),
            rgba(255,255,255,.105),
            transparent 62%
          );
          transition: opacity .3s ease;
        }

        .pc-card:hover {
          border-color: rgba(239,65,84,.48);
          box-shadow:
            0 34px 90px rgba(0,0,0,.42),
            0 0 42px rgba(239,65,84,.075),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .pc-card:hover::before {
          opacity: 1;
        }

        .pc-card-inner {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
          transform-style: preserve-3d;
        }

        .pc-media {
          position: relative;
          height: clamp(205px, 21vw, 270px);
          overflow: hidden;
          background: #111115;
          transform: translateZ(18px);
          isolation: isolate;
        }

        .pc-media::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.15), transparent 30%, rgba(0,0,0,.38)),
            linear-gradient(90deg, rgba(0,0,0,.12), transparent 55%);
        }

        .pc-real-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0;
          filter: saturate(.88) contrast(1.04);
          transform: scale(1.015);
          transition:
            opacity .35s ease,
            transform .85s cubic-bezier(.2,.8,.2,1),
            filter .5s ease;
        }

        .pc-real-image.is-loaded {
          opacity: 1;
        }

        .pc-card:hover .pc-real-image {
          transform: scale(1.055);
          filter: saturate(1.04) contrast(1.05);
        }

        .pc-media-loading {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(110deg, #111115 8%, #222026 18%, #111115 33%);
          background-size: 200% 100%;
          animation: pcShimmer 1.5s linear infinite;
        }

        @keyframes pcShimmer {
          to { background-position-x: -200%; }
        }

        .pc-media-unavailable {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 76% 22%, rgba(239,65,84,.18), transparent 43%),
            linear-gradient(135deg, #1c171b 0%, #111216 58%, #0c0d10 100%);
        }

        .pc-media-grid {
          position: absolute;
          inset: 0;
          opacity: .20;
          background-image:
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
          background-size: 34px 34px;
          mask-image: linear-gradient(135deg, black, transparent 85%);
        }

        .pc-media-unavailable::before,
        .pc-media-unavailable::after {
          content: "";
          position: absolute;
          width: 240px;
          aspect-ratio: 1;
          border: 1px solid rgba(239,65,84,.22);
          border-radius: 50%;
          transform: rotateX(66deg) rotateZ(-18deg);
        }

        .pc-media-unavailable::after {
          width: 178px;
          border-style: dashed;
          border-color: rgba(255,255,255,.12);
        }

        .pc-media-emblem {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 11px;
          color: #ff6878;
          text-align: center;
          transform: translateZ(22px);
        }

        .pc-media-index {
          position: absolute;
          top: -36px;
          left: -58px;
          color: rgba(255,255,255,.35);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .pc-media-emblem strong {
          max-width: 80%;
          color: rgba(255,255,255,.82);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .pc-media-emblem small {
          color: rgba(255,255,255,.42);
          font-size: 8px;
          letter-spacing: 1.7px;
        }

        .pc-media-caption {
          position: absolute;
          z-index: 2;
          left: 17px;
          bottom: 15px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 9px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 5px;
          color: rgba(255,255,255,.8);
          background: rgba(0,0,0,.38);
          backdrop-filter: blur(12px);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.25px;
        }

        .pc-media-edge {
          position: absolute;
          z-index: 3;
          inset: auto 0 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(239,65,84,.7), transparent);
          opacity: .7;
        }

        .pc-content {
          position: relative;
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 22px 23px 20px;
          transform-style: preserve-3d;
        }

        .pc-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pc-category {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #ff7886;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }

        .pc-status {
          margin-left: auto;
          padding: 6px 9px;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 30px;
          color: #d1c8c7;
          background: rgba(255,255,255,.035);
          font-size: 9px;
          white-space: nowrap;
        }

        .pc-title {
          margin: 0 0 10px;
          color: #f7f2ef;
          font-size: clamp(20px, 2vw, 25px);
          font-weight: 780;
          letter-spacing: -.8px;
          line-height: 1.2;
          transform: translateZ(15px);
        }

        .pc-description {
          min-height: 66px;
          margin: 0;
          color: #aaa3a2;
          font-size: 12px;
          line-height: 1.85;
        }

        .pc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 18px;
        }

        .pc-tag {
          padding: 6px 9px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 4px;
          color: #d2c9c7;
          background: rgba(255,255,255,.025);
          font-size: 9px;
          transition: border-color .25s ease, color .25s ease;
        }

        .pc-card:hover .pc-tag {
          border-color: rgba(239,65,84,.25);
        }

        .pc-divider {
          height: 1px;
          margin: 21px 0 15px;
          background: linear-gradient(
            90deg,
            rgba(239,65,84,.46),
            rgba(255,255,255,.10),
            transparent
          );
        }

        .pc-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: auto;
        }

        .pc-action {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 6px;
          color: #eee7e5;
          background: rgba(255,255,255,.035);
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          transition:
            color .25s ease,
            background .25s ease,
            border-color .25s ease,
            transform .25s ease;
        }

        .pc-action:hover {
          color: white;
          border-color: rgba(239,65,84,.55);
          background: rgba(239,65,84,.12);
          transform: translateY(-2px);
        }

        .pc-action-primary {
          border-color: rgba(239,65,84,.42);
          color: #fff;
          background: linear-gradient(135deg, rgba(239,65,84,.22), rgba(239,65,84,.08));
        }

        .pc-link-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #807a79;
          font-size: 9px;
          line-height: 1.5;
        }

        @media (max-width: 760px) {
          .pc-media { height: 225px; }
          .pc-content { padding: 19px; }
          .pc-title { font-size: 20px; }
          .pc-description { min-height: 0; }
          .pc-actions { justify-content: flex-start; }
        }

        @media (hover: none), (prefers-reduced-motion: reduce) {
          .pc-card,
          .pc-card *,
          .pc-real-image {
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <motion.article
        ref={cardRef}
        className="pc-card project-card"
        style={{
          rotateX: reducedMotion ? 0 : springX,
          rotateY: reducedMotion ? 0 : springY,
          transformPerspective: 1100,
          "--pc-pointer-x": `${pointerX.get()}%`,
          "--pc-pointer-y": `${pointerY.get()}%`,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="pc-card-inner">
          <ProjectMedia
            project={project}
            name={name}
            category={category}
            index={index}
          />

          <div className="pc-content">
            <div className="pc-meta">
              <span className="pc-category">
                <Sparkles size={12} />
                {category}
              </span>
              <span className="pc-status">{status}</span>
            </div>

            <h3 className="pc-title">{name}</h3>
            <p className="pc-description">{description}</p>

            {stack.length > 0 && (
              <div className="pc-tags" aria-label="Technology stack">
                {stack.map((tag, tagIndex) => (
                  <span className="pc-tag" key={`${tag}-${tagIndex}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pc-divider" />

            <div className="pc-actions">
              {liveUrl && (
                <ProjectAction
                  href={liveUrl}
                  primary
                  onClick={() => handleAction("live")}
                  label={`Open ${name} live website in a new tab`}
                >
                  <ExternalLink size={14} />
                  Live website
                </ProjectAction>
              )}

              {githubUrl && (
                <ProjectAction
                  href={githubUrl}
                  onClick={() => handleAction("github")}
                  label={
                    githubIsProfile
                      ? `Open GitHub profile for ${name} in a new tab`
                      : `Open ${name} GitHub repository in a new tab`
                  }
                >
                  <Github size={14} />
                  {githubIsProfile ? "GitHub profile" : "Repository"}
                  <ArrowUpRight size={13} />
                </ProjectAction>
              )}

              {!liveUrl && !githubUrl && (
                <span className="pc-link-note">
                  <ShieldCheck size={13} />
                  No public project link has been added.
                </span>
              )}
            </div>

            {githubIsProfile && (
              <p className="pc-link-note">
                <Code2 size={12} />
                This opens the developer's GitHub profile, not a project-specific repository.
              </p>
            )}

            {!liveUrl && (
              <p className="pc-link-note">
                <Eye size={12} />
                No live demo is currently available for this project.
              </p>
            )}
          </div>
        </div>
      </motion.article>
    </>
  );
}
