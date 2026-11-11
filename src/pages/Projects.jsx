import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Search, X, ExternalLink, Github, ChevronRight,
  ChevronDown, SlidersHorizontal, LayoutGrid, List, Sparkles, Globe2,
  Code2, Layers3, Cpu, Clock3, CheckCircle2, Maximize2, Copy, Share2,
  MonitorPlay, Image as ImageIcon, Zap, Filter, RotateCcw, Eye,
  Terminal, Database, Brain, CalendarDays, Tag, MousePointer2
} from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { usePortfolio } from "../hooks/usePortfolio";
import { useMotionPreference } from "../hooks/MotionPreference";

const EASE = [0.22, 1, 0.36, 1];
const FALLBACK_IMAGE = "/images/fire-robot.jpg";
const PREVIEW_WIDTH = 1200;

const safeArray = value => Array.isArray(value) ? value : [];
const clean = value => typeof value === "string" ? value.trim() : "";
const safeUrl = value => {
  const raw = clean(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const getStack = project => {
  if (Array.isArray(project?.stack)) return project.stack.filter(Boolean).map(String);
  if (typeof project?.stack === "string") return project.stack.split(",").map(item => item.trim()).filter(Boolean);
  return [];
};
const getProjectTitle = project => clean(project?.name || project?.title) || "Untitled project";
const getProjectDescription = project => clean(project?.description || project?.summary) || "Project details will be added soon.";
const getProjectCategory = project => clean(project?.category) || "Project";
const getProjectStatus = project => clean(project?.status) || "In progress";
const isLive = project => Boolean(safeUrl(project?.liveUrl || project?.demoUrl));
const getLiveUrl = project => safeUrl(project?.liveUrl || project?.demoUrl);
const getRepoUrl = project => safeUrl(project?.githubUrl || project?.repoUrl || project?.sourceUrl);
const isHardware = project => /hardware|iot|robot|arduino|electronics/i.test(`${project?.category || ""} ${project?.name || ""} ${getStack(project).join(" ")}`);

function getPreviewUrl(project) {
  const liveUrl = getLiveUrl(project);
  if (liveUrl) {
    return `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=${PREVIEW_WIDTH}&viewport.height=760`;
  }
  const image = clean(project?.imageUrl || project?.image);
  if (image.startsWith("/") || image.startsWith("./")) return image;
  return safeUrl(image);
}

function PreviewFallback({ project, compact = false }) {
  const hardware = isHardware(project);
  const Icon = hardware ? Cpu : /ai|machine|data/i.test(`${project?.name} ${project?.category}`) ? Brain : /web|app|edtech/i.test(project?.category || "") ? Globe2 : Code2;
  return (
    <div className={`project-preview-fallback ${compact ? "compact" : ""} ${hardware ? "hardware" : ""}`}>
      <div className="project-fallback-grid" />
      <span className="project-fallback-index">APS / {String(project?.id || "WORK").slice(-4).toUpperCase()}</span>
      <div className="project-fallback-icon"><Icon size={compact ? 24 : 34} /></div>
      <div className="project-fallback-copy">
        <small>{getProjectCategory(project).toUpperCase()} / SELECTED WORK</small>
        <strong>{getProjectTitle(project)}</strong>
        <span>{getStack(project).slice(0, 3).join(" · ") || "Design · Development · Learning"}</span>
      </div>
      <span className="project-fallback-watermark">PROJECT</span>
    </div>
  );
}

function ProjectPreview({ project, className = "", compact = false }) {
  const [failed, setFailed] = useState(false);
  const src = getPreviewUrl(project);
  const localImage = !isLive(project) && src;
  const shouldShowImage = Boolean(src) && !failed;
  return (
    <div className={`project-preview ${className}`}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={`${getProjectTitle(project)} ${isLive(project) ? "live website preview" : "project image"}`}
          loading="lazy"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <PreviewFallback project={project} compact={compact} />
      )}
      {isLive(project) && <span className="project-preview-live"><i /> LIVE WEBSITE</span>}
      {!isLive(project) && localImage && <span className="project-preview-label"><ImageIcon size={11} /> PROJECT IMAGE</span>}
      <span className="project-preview-shade" />
    </div>
  );
}

function TiltSurface({ children, className = "", enabled = true, onClick }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springX = useSpring(rx, { stiffness: 180, damping: 22 });
  const springY = useSpring(ry, { stiffness: 180, damping: 22 });

  const move = event => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    rx.set((0.5 - y) * 5);
    ry.set((x - 0.5) * 5);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <motion.article
      ref={ref}
      className={className}
      onMouseMove={move}
      onMouseLeave={reset}
      onClick={onClick}
      style={enabled ? { rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" } : {}}
    >
      {children}
    </motion.article>
  );
}

function ProjectModal({ project, onClose, motionEnabled }) {
  const dialogRef = useRef(null);
  const [previewMode, setPreviewMode] = useState("image");
  const [copied, setCopied] = useState(false);
  const liveUrl = getLiveUrl(project);
  const repoUrl = getRepoUrl(project);
  const stack = getStack(project);

  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl || repoUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareProject = async () => {
    const shareData = {
      title: getProjectTitle(project),
      text: getProjectDescription(project),
      url: liveUrl || repoUrl || window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* User cancelled sharing. */ }
    } else {
      copyLink();
    }
  };

  return (
    <motion.div
      className="project-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        ref={dialogRef}
        className="project-modal-advanced"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        tabIndex={-1}
        initial={motionEnabled ? { opacity: 0, y: 28, scale: .975 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: .985 }}
        transition={{ duration: .32, ease: EASE }}
      >
        <header className="project-modal-header">
          <div><span className="project-modal-kicker">APS / PROJECT CASE STUDY</span><span className="project-modal-id">{project.id || "PROJECT"}</span></div>
          <button type="button" className="project-icon-button" onClick={onClose} aria-label="Close project details"><X size={19} /></button>
        </header>

        <div className="project-modal-preview-wrap">
          <div className="project-preview-switch">
            <button type="button" className={previewMode === "image" ? "active" : ""} onClick={() => setPreviewMode("image")}><ImageIcon size={13} /> Preview</button>
            {liveUrl && <button type="button" className={previewMode === "website" ? "active" : ""} onClick={() => setPreviewMode("website")}><MonitorPlay size={13} /> Website</button>}
          </div>
          {previewMode === "website" && liveUrl ? (
            <div className="project-iframe-note">
              <MonitorPlay size={26} />
              <strong>Open the live experience</strong>
              <p>Some websites block embedded previews for security. Open the project in a new tab to interact with the complete website.</p>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">Visit live website <ExternalLink size={15} /></a>
            </div>
          ) : <ProjectPreview project={project} className="project-modal-preview" />}
        </div>

        <div className="project-modal-content">
          <div className="project-modal-main">
            <div className="project-modal-meta"><span>{getProjectCategory(project)}</span><span className={`project-status status-${getProjectStatus(project).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{getProjectStatus(project)}</span></div>
            <h2 id="project-modal-title">{getProjectTitle(project)}</h2>
            <p className="project-modal-description">{getProjectDescription(project)}</p>
            {clean(project.longDescription || project.details) && <div className="project-long-description">{project.longDescription || project.details}</div>}
            <div className="project-modal-subheading"><Layers3 size={15} /> TECHNOLOGY STACK</div>
            <div className="project-tech-tags">{stack.length ? stack.map(item => <span key={item}>{item}</span>) : <span>Stack not specified</span>}</div>
            {clean(project.role) && <div className="project-extra-row"><strong>MY ROLE</strong><span>{project.role}</span></div>}
            {clean(project.duration) && <div className="project-extra-row"><strong>DURATION</strong><span>{project.duration}</span></div>}
            {clean(project.date || project.year) && <div className="project-extra-row"><strong>PERIOD</strong><span>{project.date || project.year}</span></div>}
          </div>
          <aside className="project-modal-sidebar">
            <span className="project-modal-subheading">PROJECT LINKS</span>
            {liveUrl ? <a className="project-modal-action primary" href={liveUrl} target="_blank" rel="noopener noreferrer">Visit live website <ArrowUpRight size={16} /></a> : <div className="project-link-unavailable">No live website added yet</div>}
            {repoUrl ? <a className="project-modal-action" href={repoUrl} target="_blank" rel="noopener noreferrer">View source / GitHub <Github size={16} /></a> : <div className="project-link-unavailable">No repository link added yet</div>}
            <button type="button" className="project-modal-action" onClick={copyLink}><Copy size={15} /> {copied ? "Copied!" : "Copy project link"}</button>
            <button type="button" className="project-modal-action" onClick={shareProject}><Share2 size={15} /> Share project</button>
            <p className="project-modal-note">Project information is maintained through the portfolio admin dashboard.</p>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}

function ProjectCard({ project, index, onOpen, motionEnabled, viewMode }) {
  const liveUrl = getLiveUrl(project);
  const repoUrl = getRepoUrl(project);
  const stack = getStack(project);
  const featured = Boolean(project.featured);

  return (
    <TiltSurface
      className={`project-advanced-card ${viewMode === "list" ? "list-card" : ""}`}
      enabled={motionEnabled}
      onClick={() => onOpen(project)}
    >
      <button type="button" className="project-card-hitarea" onClick={() => onOpen(project)} aria-label={`View ${getProjectTitle(project)} details`} />
      <div className="project-card-visual">
        <ProjectPreview project={project} />
        <span className="project-card-number">P{String(index + 1).padStart(2, "0")}</span>
        {featured && <span className="project-featured-badge"><Sparkles size={11} /> FEATURED</span>}
        <span className="project-card-open"><ArrowUpRight size={18} /></span>
      </div>
      <div className="project-card-body">
        <div className="project-card-meta">
          <span>{getProjectCategory(project)}</span>
          <span className={`project-status status-${getProjectStatus(project).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{getProjectStatus(project)}</span>
        </div>
        <h3>{getProjectTitle(project)}</h3>
        <p>{getProjectDescription(project)}</p>
        <div className="project-card-stack">
          {stack.slice(0, 4).map(item => <span key={item}>{item}</span>)}
          {stack.length > 4 && <span>+{stack.length - 4}</span>}
        </div>
        <div className="project-card-footer">
          <span>EXPLORE PROJECT <ChevronRight size={14} /></span>
          <div className="project-card-mini-links">
            {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${getProjectTitle(project)} live website`} onClick={event => event.stopPropagation()}><Globe2 size={14} /></a>}
            {repoUrl && <a href={repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${getProjectTitle(project)} repository`} onClick={event => event.stopPropagation()}><Github size={14} /></a>}
          </div>
        </div>
      </div>
    </TiltSurface>
  );
}


/*
 * PROJECTS PAGE IMPLEMENTATION NOTES
 *
 * The project archive is data-driven. It reads the projects array from the
 * existing usePortfolio hook and does not introduce a second data source.
 *
 * Preview behavior:
 * - A project with a valid liveUrl gets a remote website screenshot preview.
 * - A project without a live URL uses its local image or imageUrl.
 * - A missing or blocked preview gets a designed fallback cover.
 * - The original website is always opened in a new tab from its action link.
 *
 * Safety and reliability:
 * - Only HTTP and HTTPS links are accepted for external destinations.
 * - External links use noopener and noreferrer.
 * - Empty project arrays and incomplete project records are supported.
 * - Stack values may be stored as arrays or comma-separated strings.
 * - The modal restores body scrolling and keyboard focus when it closes.
 *
 * Customization:
 * - Change the color tokens in the ProjectsPage style block.
 * - Add project fields in the existing Admin Dashboard as needed.
 * - Existing project records remain compatible with this page.
 */

const PROJECTS_PAGE_CONFIG = Object.freeze({
  initialLimit: 9,
  increment: 6,
  featuredLimit: 3,
  previewViewport: {
    width: 1200,
    height: 760,
  },
  searchShortcut: {
    key: "k",
    modifier: true,
  },
  categoriesFallback: "Project",
  statusFallback: "In progress",
});

function normalizeProjectRecord(project, index = 0) {
  const record = project && typeof project === "object" ? project : {};
  return {
    ...record,
    id: record.id || `project-${index + 1}`,
    name: getProjectTitle(record),
    category: getProjectCategory(record),
    description: getProjectDescription(record),
    status: getProjectStatus(record),
    stack: getStack(record),
    liveUrl: getLiveUrl(record),
    githubUrl: getRepoUrl(record),
    featured: Boolean(record.featured),
  };
}

function getProjectAccessibilityLabel(project) {
  const title = getProjectTitle(project);
  const category = getProjectCategory(project);
  const status = getProjectStatus(project);
  return `${title}, ${category}, ${status}. Open project details.`;
}

function getProjectLinkAvailability(project) {
  return {
    live: Boolean(getLiveUrl(project)),
    repository: Boolean(getRepoUrl(project)),
    preview: Boolean(getPreviewUrl(project)),
  };
}

function getProjectSearchText(project) {
  return [
    getProjectTitle(project),
    getProjectCategory(project),
    getProjectDescription(project),
    getProjectStatus(project),
    getStack(project).join(" "),
    clean(project?.role),
    clean(project?.duration),
    clean(project?.year),
    clean(project?.longDescription),
    clean(project?.details),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function sortProjectRecords(projects, sortMode) {
  const items = [...safeArray(projects)];

  if (sortMode === "featured") {
    return items.sort(
      (first, second) =>
        Number(Boolean(second.featured)) - Number(Boolean(first.featured))
    );
  }

  if (sortMode === "live") {
    return items.sort(
      (first, second) => Number(isLive(second)) - Number(isLive(first))
    );
  }

  if (sortMode === "name") {
    return items.sort((first, second) =>
      getProjectTitle(first).localeCompare(getProjectTitle(second))
    );
  }

  if (sortMode === "category") {
    return items.sort((first, second) =>
      getProjectCategory(first).localeCompare(getProjectCategory(second))
    );
  }

  return items;
}

function filterProjectRecords(projects, category, searchTerm) {
  const normalizedSearch = clean(searchTerm).toLocaleLowerCase();

  return safeArray(projects).filter((project) => {
    const categoryMatches =
      category === "All" || getProjectCategory(project) === category;

    if (!categoryMatches) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return getProjectSearchText(project).includes(normalizedSearch);
  });
}

function getProjectStatistics(projects) {
  const items = safeArray(projects);
  const technologies = new Set();

  items.forEach((project) => {
    getStack(project).forEach((technology) => {
      technologies.add(technology);
    });
  });

  return {
    total: items.length,
    live: items.filter(isLive).length,
    hardware: items.filter(isHardware).length,
    featured: items.filter((project) => Boolean(project.featured)).length,
    technologies: technologies.size,
  };
}

function getProjectStatusClass(status) {
  return `status-${clean(status)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function shouldReduceProjectMotion(enabled) {
  return !enabled;
}

function isValidProjectImageSource(source) {
  if (typeof source !== "string" || !source.trim()) {
    return false;
  }

  const value = source.trim();

  if (value.startsWith("/") || value.startsWith("./")) {
    return true;
  }

  return Boolean(safeUrl(value));
}

function getProjectPreviewDescription(project) {
  if (isLive(project)) {
    return `Live website preview for ${getProjectTitle(project)}`;
  }

  return `Project artwork for ${getProjectTitle(project)}`;
}

function getProjectExternalLinkProps(url) {
  const destination = safeUrl(url);

  if (!destination) {
    return null;
  }

  return {
    href: destination,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

function getProjectCardKey(project, index) {
  return project?.id || project?.slug || project?.name || `project-${index}`;
}

function getProjectModalMetadata(project) {
  return [
    {
      label: "MY ROLE",
      value: clean(project?.role),
    },
    {
      label: "DURATION",
      value: clean(project?.duration),
    },
    {
      label: "PERIOD",
      value: clean(project?.date || project?.year),
    },
  ].filter((item) => item.value);
}

function formatProjectCount(value) {
  return String(Math.max(0, Number(value) || 0)).padStart(2, "0");
}

function getProjectPreviewModeLabel(mode) {
  return mode === "website" ? "Live website" : "Project preview";
}

function getProjectCallToAction(project) {
  if (getLiveUrl(project)) {
    return "Visit live website";
  }

  if (getRepoUrl(project)) {
    return "Explore source code";
  }

  return "View project details";
}

export default function Projects() {
  const { content = {} } = usePortfolio();
  const { enabled } = useMotionPreference();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PROJECTS_PAGE_CONFIG.initialLimit);
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);

  const allProjects = safeArray(content.projects).map(normalizeProjectRecord);
  const categories = useMemo(() => ["All", ...new Set(allProjects.map(project => getProjectCategory(project)).filter(Boolean))], [allProjects]);
  const featuredProjects = useMemo(() => allProjects.filter(project => project.featured), [allProjects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = allProjects.filter(project => {
      const categoryMatch = filter === "All" || getProjectCategory(project) === filter;
      const searchable = [
        getProjectTitle(project), getProjectCategory(project), getProjectDescription(project),
        getProjectStatus(project), getStack(project).join(" "),
        clean(project.role), clean(project.longDescription)
      ].join(" ").toLowerCase();
      return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return result.sort((a, b) => {
      if (sort === "featured") return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (sort === "live") return Number(isLive(b)) - Number(isLive(a));
      if (sort === "name") return getProjectTitle(a).localeCompare(getProjectTitle(b));
      if (sort === "category") return getProjectCategory(a).localeCompare(getProjectCategory(b));
      return 0;
    });
  }, [allProjects, filter, query, sort]);

  const visibleProjects = filteredProjects.slice(0, limit);
  const liveCount = allProjects.filter(isLive).length;
  const hardwareCount = allProjects.filter(isHardware).length;
  const techCount = new Set(allProjects.flatMap(getStack)).size;

  const openProject = useCallback(project => setSelected(project), []);
  const closeProject = useCallback(() => setSelected(null), []);
  const clearFilters = () => {
    setFilter("All");
    setQuery("");
    setSort("featured");
    setLimit(PROJECTS_PAGE_CONFIG.initialLimit);
  };

  useEffect(() => {
    const onKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="page-section container projects-page-advanced">
      {/* The page styles are scoped to this component to avoid changing other routes. */}
      <style>{`

        .projects-page-advanced {
        --pa-red:#ed3448;
        --pa-red-soft:rgba(237,52,72,.13);
        --pa-bg:#090909;
        --pa-panel:#111113;
        --pa-muted:#aaa3a1;
        position:relative;
        color:#f5f1ed;
        padding-bottom:100px;
        }
        .projects-page-advanced * {
        box-sizing:border-box;
      }
        .projects-page-advanced button,.projects-page-advanced input,.projects-page-advanced select {
        font:inherit;
      }
        .projects-page-advanced button {
        cursor:pointer;
      }
        .projects-hero-advanced {
        min-height:440px;
        position:relative;
        display:flex;
        align-items:center;
        overflow:hidden;
        padding:80px 0 70px;
        border-bottom:1px solid rgba(255,255,255,.12);
        background:radial-gradient(ellipse at 78% 48%,rgba(125,15,35,.24),transparent 42%);
        }
        .projects-hero-advanced:before {
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        opacity:.16;
        background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
        background-size:58px 58px;
        mask-image:linear-gradient(90deg,transparent,#000 45%,transparent);
        }
        .projects-hero-watermark {
        position:absolute;
        right:-2%;
        top:40px;
        font-family:Impact,"Arial Narrow",sans-serif;
        font-size:clamp(130px,22vw,300px);
        line-height:.8;
        letter-spacing:-.06em;
        color:rgba(255,255,255,.025);
        pointer-events:none;
        user-select:none;
        }
        .projects-hero-copy {
        position:relative;
        z-index:2;
        max-width:760px;
      }
        .projects-hero-kicker {
        display:flex;
        align-items:center;
        gap:10px;
        color:#ff7180;
        font-size:10px;
        font-weight:800;
        letter-spacing:2px;
      }
        .projects-hero-kicker:before {
        content:"";
        width:25px;
        height:1px;
        background:var(--pa-red);
      }
        .projects-hero-advanced h1 {
        margin:26px 0 20px;
        font-size:clamp(58px,8.4vw,112px);
        font-weight:950;
        line-height:.88;
        letter-spacing:-.075em;
        text-transform:uppercase;
        max-width:850px;
        }
        .projects-hero-advanced h1 em {
        font-style:normal;
        color:var(--pa-red);
      }
        .projects-hero-advanced p {
        max-width:560px;
        color:var(--pa-muted);
        font-size:13px;
        line-height:1.9;
      }
        .projects-hero-bottom {
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        gap:22px;
        margin-top:30px;
        color:#918987;
        font-size:9px;
        letter-spacing:1.2px;
      }
        .projects-hero-bottom span {
        display:flex;
        align-items:center;
        gap:8px;
      }
        .projects-hero-bottom b {
        color:#f5f1ed;
        font-size:18px;
        letter-spacing:0;
      }
        .projects-hero-bottom i {
        width:6px;
        height:6px;
        border-radius:50%;
        background:#65d89a;
        box-shadow:0 0 12px #65d89a;
      }
        .projects-overview-grid {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:12px;
        margin:26px 0 85px;
      }
        .projects-overview-item {
        padding:18px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:8px;
        background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.012));
      }
        .projects-overview-item small {
        display:block;
        color:#8f8886;
        font-size:8px;
        letter-spacing:1.3px;
        text-transform:uppercase;
      }
        .projects-overview-item strong {
        display:block;
        margin-top:8px;
        color:#f7f2ef;
        font-size:27px;
        letter-spacing:-1px;
      }
        .projects-overview-item span {
        color:#8f8886;
        font-size:9px;
      }
        .projects-archive-head {
        display:flex;
        justify-content:space-between;
        align-items:end;
        gap:20px;
        margin:0 0 25px;
      }
        .projects-archive-kicker {
        color:#ff7180;
        font-size:9px;
        letter-spacing:2px;
        font-weight:800;
      }
        .projects-archive-head h2 {
        margin:10px 0 0;
        font-size:clamp(28px,4vw,45px);
        letter-spacing:-1.7px;
      }
        .projects-archive-head p {
        margin:9px 0 0;
        color:#9f9794;
        font-size:12px;
        line-height:1.7;
      }
        .projects-toolbar-advanced {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        flex-wrap:wrap;
        padding:13px 0;
        border-top:1px solid rgba(255,255,255,.12);
        border-bottom:1px solid rgba(255,255,255,.12);
        }
        .projects-filter-row {
        display:flex;
        align-items:center;
        gap:5px;
        flex-wrap:wrap;
      }
        .projects-filter-chip {
        position:relative;
        padding:10px 12px;
        border:0;
        border-radius:4px;
        background:transparent;
        color:#a8a09d;
        font-size:10px;
        transition:.25s;
        }
        .projects-filter-chip:hover,.projects-filter-chip.active {
        color:#fff;
        background:rgba(237,52,72,.1);
      }
        .projects-filter-chip.active:after {
        content:"";
        position:absolute;
        left:12px;
        right:12px;
        bottom:3px;
        height:2px;
        background:var(--pa-red);
      }
        .projects-toolbar-tools {
        display:flex;
        align-items:center;
        gap:8px;
        flex-wrap:wrap;
      }
        .projects-search-advanced {
        width:230px;
        height:39px;
        display:flex;
        align-items:center;
        gap:8px;
        padding:0 11px;
        border:1px solid rgba(255,255,255,.14);
        border-radius:22px;
        color:#999;
        background:rgba(255,255,255,.025);
        }
        .projects-search-advanced:focus-within {
        border-color:rgba(237,52,72,.7);
        box-shadow:0 0 0 3px rgba(237,52,72,.08);
      }
        .projects-search-advanced input {
        width:100%;
        min-width:0;
        border:0;
        outline:0;
        background:transparent;
        color:#fff;
        font-size:10px;
      }
        .projects-search-advanced input::placeholder {
        color:#777;
      }
        .projects-search-advanced kbd {
        white-space:nowrap;
        padding:3px 5px;
        border:1px solid rgba(255,255,255,.12);
        border-radius:3px;
        color:#777;
        font-size:8px;
      }
        .projects-select-advanced,.projects-tool-button {
        height:39px;
        padding:0 11px;
        border:1px solid rgba(255,255,255,.14);
        border-radius:5px;
        background:#111;
        color:#c9c1bd;
        font-size:10px;
        }
        .projects-tool-button {
        display:inline-flex;
        align-items:center;
        gap:7px;
      }
        .projects-tool-button.active {
        border-color:var(--pa-red);
        color:#fff;
        background:var(--pa-red-soft);
      }
        .projects-result-line {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin:17px 0;
        color:#88817f;
        font-size:10px;
      }
        .projects-result-line strong {
        color:#f0eae7;
      }
        .projects-grid-advanced {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:19px;
        perspective:1300px;
      }
        .project-advanced-card {
        min-width:0;
        position:relative;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        border-radius:13px;
        background:linear-gradient(160deg,#151416,#0d0d0e);
        transition:border-color .3s,box-shadow .3s,transform .3s;
        transform-style:preserve-3d;
        }
        .project-advanced-card:hover {
        border-color:rgba(237,52,72,.6);
        box-shadow:0 22px 60px rgba(0,0,0,.3),0 0 35px rgba(237,52,72,.07);
      }
        .project-card-hitarea {
        position:absolute;
        inset:0;
        z-index:2;
        width:100%;
        height:100%;
        border:0;
        background:transparent;
        text-align:left;
      }
        .project-card-visual {
        height:215px;
        position:relative;
        overflow:hidden;
        background:#151416;
      }
        .project-preview {
        height:100%;
        width:100%;
        position:relative;
        overflow:hidden;
        background:#151416;
      }
        .project-preview>img {
        width:100%;
        height:100%;
        display:block;
        object-fit:cover;
        object-position:top center;
        transition:transform .7s cubic-bezier(.2,.8,.2,1),filter .4s;
      }
        .project-advanced-card:hover .project-preview>img {
        transform:scale(1.045);
        filter:saturate(1.08);
      }
        .project-preview-shade {
        position:absolute;
        inset:35% 0 0;
        background:linear-gradient(180deg,transparent,rgba(8,8,9,.38));
        pointer-events:none;
      }
        .project-preview-live,.project-preview-label {
        position:absolute;
        top:12px;
        left:12px;
        z-index:2;
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:7px 9px;
        border:1px solid rgba(255,255,255,.17);
        border-radius:20px;
        color:#eee;
        background:rgba(13,13,15,.82);
        backdrop-filter:blur(10px);
        font-size:8px;
        font-weight:800;
        letter-spacing:.4px;
        }
        .project-preview-live i {
        width:6px;
        height:6px;
        border-radius:50%;
        background:#69d99b;
        box-shadow:0 0 9px #69d99b;
      }
        .project-preview-label {
        color:#d9d2cf;
      }
        .project-preview-fallback {
        height:100%;
        min-height:170px;
        position:relative;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        padding:23px;
        overflow:hidden;
        background:radial-gradient(ellipse at 78% 18%,rgba(119,36,65,.34),transparent 44%),linear-gradient(140deg,#17171b,#0c0d10);
      }
        .project-preview-fallback.hardware {
        background:radial-gradient(ellipse at 75% 20%,rgba(15,105,100,.3),transparent 45%),linear-gradient(140deg,#111a1c,#0b0d10);
      }
        .project-fallback-grid {
        position:absolute;
        inset:0;
        opacity:.22;
        background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);
        background-size:28px 28px;
        mask-image:linear-gradient(130deg,#000,transparent);
      }
        .project-fallback-index {
        position:relative;
        color:#938b89;
        font-size:8px;
        letter-spacing:2px;
      }
        .project-fallback-icon {
        position:relative;
        width:53px;
        height:53px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.17);
        border-radius:12px;
        color:#ff6475;
        background:rgba(255,255,255,.04);
      }
        .project-fallback-copy {
        position:relative;
        display:grid;
        gap:7px;
        max-width:90%;
      }
        .project-fallback-copy small {
        color:#ff7583;
        font-size:7px;
        letter-spacing:1.5px;
      }
        .project-fallback-copy strong {
        font-size:clamp(18px,2vw,25px);
        line-height:1.1;
        letter-spacing:-.8px;
      }
        .project-fallback-copy span {
        color:#aaa3a1;
        font-size:9px;
      }
        .project-fallback-watermark {
        position:absolute;
        right:-7px;
        top:40%;
        font-family:Impact,sans-serif;
        font-size:50px;
        color:rgba(255,255,255,.045);
        transform:rotate(-90deg);
      }
        .project-card-number {
        position:absolute;
        right:17px;
        top:13px;
        color:rgba(255,255,255,.25);
        font-size:22px;
        font-weight:900;
        letter-spacing:-1px;
        pointer-events:none;
      }
        .project-featured-badge {
        position:absolute;
        right:12px;
        bottom:12px;
        display:flex;
        align-items:center;
        gap:5px;
        padding:6px 8px;
        border-radius:4px;
        background:rgba(12,12,14,.8);
        color:#ffbd78;
        font-size:8px;
        letter-spacing:.7px;
      }
        .project-card-open {
        position:absolute;
        right:15px;
        top:50%;
        width:34px;
        height:34px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.3);
        border-radius:50%;
        background:rgba(10,10,12,.6);
        color:#fff;
        opacity:0;
        transform:translateY(8px);
        transition:.3s;
      }
        .project-advanced-card:hover .project-card-open {
        opacity:1;
        transform:translateY(0);
      }
        .project-card-body {
        position:relative;
        z-index:3;
        padding:17px 17px 15px;
        pointer-events:none;
      }
        .project-card-meta {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        color:#89817f;
        font-size:8px;
        letter-spacing:.9px;
        text-transform:uppercase;
      }
        .project-status {
        display:inline-flex;
        align-items:center;
        padding:5px 8px;
        border-radius:20px;
        background:rgba(255,255,255,.07);
        color:#c9c1bd;
        font-size:8px;
        letter-spacing:0;
        white-space:nowrap;
        text-transform:uppercase;
      }
        .status-live,.status-built,.status-completed {
        background:rgba(30,180,111,.12);
        color:#6ee0a5;
      }
        .status-in-progress,.status-learning-project {
        background:rgba(58,137,232,.13);
        color:#79b8ff;
      }
        .status-concept {
        background:rgba(221,164,62,.13);
        color:#e8bd69;
      }
        .project-card-body h3 {
        margin:14px 0 8px;
        color:#f6f1ee;
        font-size:18px;
        letter-spacing:-.55px;
      }
        .project-card-body>p {
        min-height:48px;
        margin:0;
        color:#aaa3a1;
        font-size:10px;
        line-height:1.75;
      }
        .project-card-stack {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin:15px 0 14px;
      }
        .project-card-stack span {
        padding:5px 7px;
        border:1px solid rgba(255,255,255,.12);
        border-radius:4px;
        color:#c6bfbc;
        font-size:8px;
      }
        .project-card-footer {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding-top:12px;
        border-top:1px solid rgba(255,255,255,.1);
        color:#ff596d;
        font-size:8px;
        font-weight:800;
        letter-spacing:.7px;
      }
        .project-card-footer>span {
        display:flex;
        align-items:center;
        gap:5px;
      }
        .project-card-mini-links {
        display:flex;
        gap:6px;
        pointer-events:auto;
      }
        .project-card-mini-links a {
        width:27px;
        height:27px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.13);
        border-radius:50%;
        color:#bcb4b1;
        transition:.2s;
      }
        .project-card-mini-links a:hover {
        color:#fff;
        border-color:var(--pa-red);
        background:var(--pa-red);
      }
        .projects-grid-advanced.list-view {
        grid-template-columns:1fr;
      }
        .list-card {
        display:grid;
        grid-template-columns:minmax(220px,.8fr) 1.2fr;
        align-items:stretch;
      }
        .list-card .project-card-visual {
        height:100%;
        min-height:245px;
      }
        .list-card .project-card-body {
        padding:22px 24px;
      }
        .list-card .project-card-body>p {
        min-height:0;
        max-width:650px;
      }
        .projects-empty-state {
        padding:55px 20px;
        border:1px dashed rgba(255,255,255,.18);
        border-radius:12px;
        text-align:center;
        color:#aaa3a1;
      }
        .projects-empty-state h3 {
        color:#f5f1ed;
        font-size:18px;
      }
        .projects-empty-state button {
        margin-top:10px;
        padding:10px 14px;
        border:1px solid rgba(237,52,72,.5);
        border-radius:5px;
        background:rgba(237,52,72,.1);
        color:#fff;
        font-size:10px;
      }
        .projects-load-more {
        display:flex;
        justify-content:center;
        align-items:center;
        gap:15px;
        margin:32px 0 0;
      }
        .projects-load-more span {
        color:#888;
        font-size:10px;
      }
        .projects-load-more button {
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:12px 17px;
        border:1px solid rgba(255,255,255,.18);
        border-radius:5px;
        background:transparent;
        color:#eee;
        font-size:10px;
        transition:.25s;
      }
        .projects-load-more button:hover {
        border-color:var(--pa-red);
        background:var(--pa-red-soft);
      }
        .projects-bottom-cta {
        position:relative;
        overflow:hidden;
        margin-top:100px;
        padding:44px;
        border:1px solid rgba(237,52,72,.25);
        border-radius:13px;
        background:radial-gradient(ellipse at 90% 50%,rgba(237,52,72,.18),transparent 42%),#121011;
      }
        .projects-bottom-cta small {
        color:#ff7180;
        font-size:9px;
        letter-spacing:2px;
        font-weight:800;
      }
        .projects-bottom-cta h2 {
        max-width:650px;
        margin:15px 0;
        font-size:clamp(30px,5vw,55px);
        line-height:1.04;
        letter-spacing:-2px;
      }
        .projects-bottom-cta p {
        max-width:530px;
        color:#aaa3a1;
        font-size:12px;
        line-height:1.8;
      }
        .projects-bottom-cta a {
        display:inline-flex;
        align-items:center;
        gap:9px;
        margin-top:13px;
        padding:13px 17px;
        border-radius:5px;
        background:var(--pa-red);
        color:#fff;
        font-size:10px;
        font-weight:800;
      }
        .project-modal-backdrop {
        position:fixed;
        inset:0;
        z-index:1000;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:22px;
        background:rgba(0,0,0,.82);
        backdrop-filter:blur(12px);
      }
        .project-modal-advanced {
        width:min(1050px,100%);
        max-height:min(92vh,900px);
        overflow:auto;
        border:1px solid rgba(255,255,255,.16);
        border-radius:14px;
        background:#101012;
        box-shadow:0 35px 100px rgba(0,0,0,.6);
        outline:none;
      }
        .project-modal-header {
        position:sticky;
        top:0;
        z-index:5;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:13px 17px;
        border-bottom:1px solid rgba(255,255,255,.1);
        background:rgba(16,16,18,.94);
        backdrop-filter:blur(14px);
      }
        .project-modal-header>div {
        display:flex;
        align-items:center;
        gap:14px}.project-modal-kicker{color:#ff7180;
        font-size:8px;
        letter-spacing:1.7px;
        font-weight:800}.project-modal-id{color:#777;
        font-size:8px;
      }
        .project-icon-button {
        width:34px;
        height:34px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.15);
        border-radius:50%;
        background:transparent;
        color:#eee;
      }
        .project-icon-button:hover {
        background:var(--pa-red);
        border-color:var(--pa-red);
      }
        .project-modal-preview-wrap {
        height:350px;
        position:relative;
        background:#080809;
      }
        .project-modal-preview {
        height:100%;
      }
        .project-preview-switch {
        position:absolute;
        top:13px;
        right:13px;
        z-index:5;
        display:flex;
        gap:5px;
        padding:4px;
        border:1px solid rgba(255,255,255,.14);
        border-radius:7px;
        background:rgba(10,10,12,.8);
        backdrop-filter:blur(10px);
      }
        .project-preview-switch button {
        display:flex;
        align-items:center;
        gap:6px;
        padding:7px 9px;
        border:0;
        border-radius:4px;
        background:transparent;
        color:#aaa;
        font-size:9px;
      }
        .project-preview-switch button.active {
        background:var(--pa-red);
        color:#fff;
      }
        .project-iframe-note {
        height:100%;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:25px;
        text-align:center;
        color:#aaa;
      }
        .project-iframe-note svg {
        color:#ff6475}.project-iframe-note strong{margin-top:12px;
        color:#fff;
        font-size:17px;
      }
        .project-iframe-note p {
        max-width:450px;
        font-size:11px;
        line-height:1.8;
      }
        .project-iframe-note a {
        display:inline-flex;
        align-items:center;
        gap:8px;
        margin-top:8px;
        color:#ff7180;
        font-size:11px;
      }
        .project-modal-content {
        display:grid;
        grid-template-columns:1fr 260px;
        gap:32px;
        padding:27px;
      }
        .project-modal-meta {
        display:flex;
        align-items:center;
        gap:10px;
        color:#ff7180;
        font-size:9px;
        letter-spacing:1px;
        text-transform:uppercase;
      }
        .project-modal-main h2 {
        margin:13px 0 10px;
        font-size:clamp(27px,4vw,42px);
        letter-spacing:-1.5px;
      }
        .project-modal-description,.project-long-description {
        color:#aaa3a1;
        font-size:12px;
        line-height:1.9;
      }
        .project-long-description {
        margin-top:13px;
        white-space:pre-line;
      }
        .project-modal-subheading {
        display:flex;
        align-items:center;
        gap:8px;
        margin:25px 0 12px;
        color:#ff7180;
        font-size:9px;
        font-weight:800;
        letter-spacing:1.4px;
      }
        .project-tech-tags {
        display:flex;
        flex-wrap:wrap;
        gap:7px;
      }
        .project-tech-tags span {
        padding:7px 9px;
        border:1px solid rgba(255,255,255,.13);
        border-radius:4px;
        color:#ddd;
        font-size:9px;
      }
        .project-extra-row {
        display:flex;
        justify-content:space-between;
        gap:15px;
        padding:11px 0;
        border-bottom:1px solid rgba(255,255,255,.08);
        font-size:10px;
      }
        .project-extra-row strong {
        color:#888;
        font-size:8px;
        letter-spacing:1px}.project-extra-row span{color:#eee;
        text-align:right;
      }
        .project-modal-sidebar {
        padding:18px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:9px;
        background:rgba(255,255,255,.025);
        align-self:start;
      }
        .project-modal-sidebar .project-modal-subheading {
        margin:0 0 15px;
      }
        .project-modal-action {
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        margin:8px 0;
        padding:11px;
        border:1px solid rgba(255,255,255,.13);
        border-radius:5px;
        background:transparent;
        color:#ddd;
        text-align:left;
        font-size:9px;
        text-decoration:none;
        cursor:pointer;
      }
        .project-modal-action:hover {
        border-color:var(--pa-red);
        color:#fff;
        background:var(--pa-red-soft);
      }
        .project-modal-action.primary {
        border-color:var(--pa-red);
        background:var(--pa-red);
        color:#fff;
      }
        .project-link-unavailable {
        padding:10px 0;
        color:#777;
        font-size:9px;
      }
        .project-modal-note {
        margin-top:17px;
        color:#777;
        font-size:9px;
        line-height:1.7;
      }
        @media(max-width:1000px){.projects-grid-advanced{grid-template-columns:repeat(2,minmax(0,1fr))}.projects-hero-advanced{min-height:390px}}
        @media(max-width:720px){
          .projects-hero-advanced {
        min-height:360px;
        padding:65px 0 50px}.projects-overview-grid{grid-template-columns:repeat(2,1fr);
        margin-bottom:65px;
      }
          .projects-archive-head {
        align-items:flex-start;
        flex-direction:column}.projects-toolbar-advanced{align-items:stretch;
      }
          .projects-filter-row {
        overflow-x:auto;
        flex-wrap:nowrap;
        padding-bottom:5px}.projects-filter-chip{white-space:nowrap;
      }
          .projects-toolbar-tools {
        display:grid;
        grid-template-columns:1fr auto auto}.projects-search-advanced{width:100%;
        grid-column:1/-1;
      }
          .projects-grid-advanced {
        grid-template-columns:1fr}.list-card{display:block}.list-card .project-card-visual{height:210px;
        min-height:0;
      }
          .project-modal-backdrop {
        padding:8px}.project-modal-advanced{max-height:96vh;
      }
          .project-modal-preview-wrap {
        height:230px}.project-modal-content{grid-template-columns:1fr;
        padding:20px;
        gap:10px;
      }
          .projects-bottom-cta {
        padding:30px 23px;
        margin-top:70px;
      }
        }
        @media(prefers-reduced-motion:reduce){
          .projects-page-advanced *, .projects-page-advanced *:before,.projects-page-advanced *:after {
        scroll-behavior:auto!important;
        transition-duration:.01ms!important;
        animation-duration:.01ms!important;
        animation-iteration-count:1!important;
      }
        }
      
      
/* ================================================================
   APS PROJECTS — EDITORIAL REDESIGN
   A calmer, more spacious project journal with strong visual rhythm.
   ================================================================ */
.projects-page-advanced {
  --pa-red: #ff5a4e;
  --pa-red-soft: rgba(255, 90, 78, .12);
  --pa-bg: #090a0b;
  --pa-panel: #111315;
  --pa-panel-2: #171a1d;
  --pa-muted: #a4a8aa;
  --pa-line: rgba(255, 255, 255, .12);
  --pa-ink: #f4f1eb;
  width: min(1480px, calc(100% - 72px)) !important;
  max-width: 1480px !important;
  margin-inline: auto !important;
  padding: 0 0 112px !important;
  color: var(--pa-ink);
  overflow: visible;
  isolation: isolate;
}
.projects-page-advanced,
.projects-page-advanced * {
  box-sizing: border-box;
}
.projects-page-advanced button,
.projects-page-advanced input,
.projects-page-advanced select {
  font: inherit;
}
.projects-page-advanced button {
  cursor: pointer;
}
.projects-page-advanced a {
  text-decoration: none;
}
.projects-page-advanced :focus-visible {
  outline: 2px solid var(--pa-red);
  outline-offset: 4px;
}

/* Hero — asymmetric editorial composition */
.projects-hero-advanced {
  min-height: min(690px, calc(100svh - 90px));
  padding: clamp(72px, 9vw, 138px) 0 clamp(58px, 7vw, 96px);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--pa-line);
  background:
    radial-gradient(ellipse at 76% 46%, rgba(255, 90, 78, .13), transparent 34%),
    radial-gradient(ellipse at 10% 80%, rgba(95, 115, 125, .10), transparent 38%),
    linear-gradient(180deg, #0b0d0f 0%, #090a0b 100%);
}
.projects-hero-advanced:before {
  opacity: .22;
  background-size: 76px 76px;
  mask-image: linear-gradient(90deg, #000 0%, transparent 82%);
}
.projects-hero-advanced:after {
  content: "";
  position: absolute;
  width: min(44vw, 650px);
  aspect-ratio: 1;
  right: 3%;
  top: 50%;
  transform: translateY(-45%);
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 50%;
  box-shadow:
    0 0 0 42px rgba(255, 255, 255, .018),
    0 0 0 84px rgba(255, 255, 255, .012),
    inset 0 0 90px rgba(255, 90, 78, .035);
  pointer-events: none;
}
.projects-hero-watermark {
  right: -1%;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(180px, 29vw, 430px);
  letter-spacing: -.095em;
  color: rgba(255, 255, 255, .025);
}
.projects-hero-copy {
  width: min(100%, 900px);
  max-width: 900px;
  z-index: 2;
}
.projects-hero-kicker {
  gap: 13px;
  font-size: 11px;
  letter-spacing: 2.8px;
  color: #ff8c83;
}
.projects-hero-kicker:before {
  width: 38px;
  height: 2px;
}
.projects-hero-advanced h1 {
  max-width: 980px;
  margin: 32px 0 26px;
  font-size: clamp(72px, 10.4vw, 154px);
  line-height: .82;
  letter-spacing: -.095em;
  font-weight: 850;
}
.projects-hero-advanced h1 em {
  color: var(--pa-red);
  display: inline-block;
}
.projects-hero-advanced p {
  max-width: 570px;
  margin: 0;
  font-size: clamp(14px, 1.25vw, 17px);
  line-height: 1.85;
  color: #aeb2b3;
}
.projects-hero-bottom {
  margin-top: 42px;
  gap: 34px;
  font-size: 10px;
  letter-spacing: 1.5px;
}
.projects-hero-bottom span {
  gap: 11px;
}
.projects-hero-bottom b {
  font-size: 23px;
  font-weight: 650;
}
.projects-hero-bottom i {
  width: 7px;
  height: 7px;
}

/* Overview — compact but legible, no dashboard clutter */
.projects-overview-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0 0 clamp(90px, 10vw, 142px);
  border: 1px solid var(--pa-line);
  border-top: 0;
  background: var(--pa-line);
}
.projects-overview-item {
  min-height: 130px;
  padding: 25px 28px;
  border: 0;
  border-radius: 0;
  background: #0d0f10;
  transition: background .25s ease;
}
.projects-overview-item:hover {
  background: #151719;
}
.projects-overview-item small {
  font-size: 10px;
  letter-spacing: 1.7px;
  color: #858b8d;
}
.projects-overview-item strong {
  margin-top: 12px;
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1;
  letter-spacing: -.06em;
  font-weight: 700;
}
.projects-overview-item span {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: #92989a;
}

/* Section headings */
.projects-archive-head {
  align-items: end;
  margin: 0 0 34px;
}
.projects-archive-kicker {
  font-size: 10px;
  letter-spacing: 2.4px;
  color: #ff8178;
}
.projects-archive-head h2 {
  margin: 14px 0 0;
  font-size: clamp(38px, 5.2vw, 68px);
  line-height: .98;
  letter-spacing: -.075em;
  font-weight: 750;
}
.projects-archive-head p {
  max-width: 560px;
  margin-top: 15px;
  font-size: 14px;
  line-height: 1.8;
  color: #9da2a4;
}

/* Featured cards and archive cards share a consistent visual system */
.projects-grid-advanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  perspective: none;
}
.project-advanced-card {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: 15px;
  background: linear-gradient(155deg, #151819 0%, #0e1011 70%);
  box-shadow: 0 18px 55px rgba(0, 0, 0, .18);
  transform-style: flat;
  transition:
    transform .35s cubic-bezier(.2, .75, .25, 1),
    border-color .35s ease,
    box-shadow .35s ease,
    background .35s ease;
}
.project-advanced-card:hover {
  transform: translateY(-7px);
  border-color: rgba(255, 90, 78, .48);
  box-shadow: 0 28px 70px rgba(0, 0, 0, .34), 0 0 35px rgba(255, 90, 78, .06);
  background: linear-gradient(155deg, #1a1d1e 0%, #101213 75%);
}
.project-preview {
  aspect-ratio: 16 / 10;
  min-height: 230px;
  max-height: 390px;
  background: #171a1c;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
}
.project-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform .7s cubic-bezier(.2, .75, .25, 1), filter .5s ease;
}
.project-advanced-card:hover .project-preview img {
  transform: scale(1.035);
  filter: saturate(1.08);
}
.project-preview-shade {
  background: linear-gradient(180deg, rgba(0, 0, 0, .02) 35%, rgba(0, 0, 0, .46) 100%);
}
.project-preview-live,
.project-preview-label {
  top: 17px;
  left: 17px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 30px;
  background: rgba(7, 9, 10, .76);
  backdrop-filter: blur(14px);
  font-size: 9px;
  letter-spacing: 1.1px;
}
.project-preview-live i {
  width: 6px;
  height: 6px;
}
.project-fallback-grid {
  opacity: .24;
  background-size: 34px 34px;
}
.project-preview-fallback {
  min-height: 230px;
  background:
    radial-gradient(ellipse at 70% 30%, rgba(255, 90, 78, .16), transparent 45%),
    linear-gradient(135deg, #1a1e20, #0c0f10);
}
.project-fallback-icon {
  width: 76px;
  height: 76px;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 22px;
  background: rgba(255, 255, 255, .045);
  color: #ff8c83;
  box-shadow: 0 18px 60px rgba(0, 0, 0, .22);
}
.project-fallback-copy {
  left: 28px;
  bottom: 25px;
  gap: 8px;
}
.project-fallback-copy small {
  font-size: 9px;
  letter-spacing: 1.8px;
  color: #ff9188;
}
.project-fallback-copy strong {
  font-size: clamp(20px, 2vw, 27px);
  letter-spacing: -.045em;
}
.project-fallback-copy span {
  font-size: 11px;
  color: #b1b7b8;
}
.project-fallback-watermark {
  font-size: clamp(52px, 7vw, 92px);
  letter-spacing: -.08em;
}

/* Card information hierarchy */
.project-card-body {
  padding: 24px 25px 21px;
}
.project-card-topline {
  margin-bottom: 12px;
}
.project-card-category {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: #ff8c83;
}
.project-card-status {
  font-size: 9px;
  letter-spacing: .7px;
  padding: 6px 9px;
  border-radius: 30px;
}
.project-card-title {
  margin: 0 0 10px;
  font-size: clamp(22px, 2.1vw, 29px);
  line-height: 1.12;
  letter-spacing: -.055em;
  font-weight: 720;
}
.project-card-description {
  max-width: 620px;
  font-size: 13px;
  line-height: 1.75;
  color: #aab0b1;
}
.project-card-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.project-card-stack span {
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 5px;
  background: rgba(255, 255, 255, .025);
  color: #c6cbcc;
  font-size: 10px;
}
.project-card-footer {
  margin-top: 21px;
  padding-top: 17px;
  border-top: 1px solid rgba(255, 255, 255, .1);
}
.project-card-footer > span {
  gap: 8px;
  font-size: 10px;
  letter-spacing: 1.3px;
  color: #ff8279;
}
.project-card-mini-links {
  gap: 8px;
}
.project-card-mini-links a {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .16);
  color: #c9cecf;
  transition: .25s ease;
}
.project-card-mini-links a:hover {
  color: #fff;
  border-color: var(--pa-red);
  background: var(--pa-red-soft);
}

/* Archive controls — generous touch targets and clear grouping */
.projects-archive-section {
  scroll-margin-top: 35px;
}
.projects-toolbar-advanced {
  align-items: center;
  gap: 18px;
  padding: 18px 0;
  border-top: 1px solid var(--pa-line);
  border-bottom: 1px solid var(--pa-line);
}
.projects-filter-row {
  gap: 7px;
}
.projects-filter-chip {
  padding: 11px 15px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #aab0b1;
  font-size: 12px;
  transition: color .2s ease, background .2s ease, border-color .2s ease;
}
.projects-filter-chip:hover {
  color: #fff;
  background: rgba(255, 255, 255, .055);
}
.projects-filter-chip.active {
  color: #fff;
  border-color: rgba(255, 90, 78, .34);
  background: var(--pa-red-soft);
}
.projects-filter-chip.active:after {
  display: none;
}
.projects-toolbar-tools {
  gap: 9px;
}
.projects-search-advanced {
  width: min(260px, 24vw);
  height: 44px;
  padding: 0 14px;
  border-radius: 7px;
  background: #111416;
}
.projects-search-advanced input {
  font-size: 12px;
}
.projects-search-advanced kbd {
  font-size: 9px;
}
.projects-select-advanced,
.projects-tool-button {
  height: 44px;
  border-radius: 7px;
  padding-inline: 13px;
  font-size: 12px;
  background: #111416;
}
.projects-tool-button {
  justify-content: center;
}
.projects-result-line {
  margin: 20px 0 22px;
  font-size: 10px;
  letter-spacing: 1.2px;
  color: #899092;
}
.projects-result-line strong {
  color: #f4f1eb;
  font-size: 12px;
}
.projects-result-line .projects-tool-button {
  height: 36px;
  font-size: 11px;
}

/* List view is intentionally different from the card grid */
.projects-grid-advanced.list-view {
  grid-template-columns: 1fr;
  gap: 13px;
}
.projects-grid-advanced.list-view .project-advanced-card {
  display: grid;
  grid-template-columns: minmax(230px, 34%) minmax(0, 1fr);
  align-items: stretch;
}
.projects-grid-advanced.list-view .project-preview {
  height: 100%;
  min-height: 220px;
  max-height: none;
  aspect-ratio: auto;
  border-right: 1px solid rgba(255, 255, 255, .1);
  border-bottom: 0;
}
.projects-grid-advanced.list-view .project-card-body {
  align-self: center;
  padding: 25px 30px;
}
.projects-grid-advanced.list-view .project-card-title {
  font-size: 27px;
}

/* Empty state and pagination */
.projects-empty-state {
  min-height: 300px;
  border: 1px dashed rgba(255, 255, 255, .18);
  border-radius: 14px;
  background: rgba(255, 255, 255, .018);
}
.projects-empty-state h3 {
  font-size: 25px;
  letter-spacing: -.04em;
}
.projects-empty-state p {
  font-size: 13px;
  color: #a4a8aa;
}
.projects-empty-state button,
.projects-load-more button {
  min-height: 46px;
  padding: 0 19px;
  border: 1px solid rgba(255, 90, 78, .42);
  border-radius: 7px;
  background: var(--pa-red-soft);
  color: #fff;
  font-size: 12px;
  transition: .25s ease;
}
.projects-empty-state button:hover,
.projects-load-more button:hover {
  background: var(--pa-red);
  border-color: var(--pa-red);
}
.projects-load-more {
  margin-top: 40px;
  gap: 18px;
}
.projects-load-more span {
  color: #92999a;
  font-size: 11px;
}

/* Contact close — deliberate visual ending */
.projects-bottom-cta {
  position: relative;
  margin-top: clamp(100px, 13vw, 170px);
  padding: clamp(48px, 7vw, 92px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 18px;
  background:
    radial-gradient(ellipse at 88% 15%, rgba(255, 90, 78, .18), transparent 36%),
    linear-gradient(125deg, #171a1c, #0e1011 70%);
}
.projects-bottom-cta:before {
  content: "LET'S BUILD";
  position: absolute;
  right: -15px;
  bottom: -34px;
  color: rgba(255, 255, 255, .025);
  font-size: clamp(75px, 13vw, 190px);
  font-weight: 900;
  letter-spacing: -.09em;
  line-height: 1;
  pointer-events: none;
}
.projects-bottom-cta small {
  color: #ff8c83;
  font-size: 10px;
  letter-spacing: 2.3px;
}
.projects-bottom-cta h2 {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 22px 0 18px;
  font-size: clamp(42px, 6.4vw, 82px);
  line-height: .96;
  letter-spacing: -.075em;
}
.projects-bottom-cta p {
  max-width: 560px;
  color: #aeb3b4;
  font-size: 14px;
  line-height: 1.8;
}
.projects-bottom-cta a {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  margin-top: 18px;
  padding: 0 18px;
  border-radius: 7px;
  background: var(--pa-red);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  transition: transform .25s ease, box-shadow .25s ease;
}
.projects-bottom-cta a:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 90, 78, .22);
}

/* Modal typography and surfaces */
.project-modal-backdrop {
  padding: 28px;
  backdrop-filter: blur(14px);
  background: rgba(3, 5, 6, .82);
}
.project-modal-advanced {
  width: min(1040px, 100%);
  max-height: min(90vh, 900px);
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 18px;
  background: #101314;
  box-shadow: 0 35px 120px rgba(0, 0, 0, .6);
}
.project-modal-advanced h2 {
  font-size: clamp(30px, 4vw, 48px);
  letter-spacing: -.065em;
}
.project-modal-advanced p {
  font-size: 14px;
  line-height: 1.85;
}

/* Large screens */
@media (min-width: 1500px) {
  .projects-page-advanced {
    width: min(1520px, calc(100% - 112px)) !important;
  }
  .projects-grid-advanced {
    gap: 28px;
  }
  .project-preview {
    min-height: 280px;
  }
}

/* Laptop and tablet */
@media (max-width: 1100px) {
  .projects-page-advanced {
    width: min(100% - 48px, 1080px) !important;
  }
  .projects-hero-advanced {
    min-height: 590px;
  }
  .projects-hero-watermark {
    right: -6%;
    opacity: .75;
  }
  .projects-grid-advanced {
    gap: 18px;
  }
  .project-card-body {
    padding: 21px;
  }
  .projects-toolbar-advanced {
    align-items: flex-start;
  }
  .projects-filter-row {
    width: 100%;
  }
  .projects-toolbar-tools {
    width: 100%;
  }
  .projects-search-advanced {
    flex: 1;
    width: auto;
  }
}

/* Mobile */
@media (max-width: 700px) {
  .projects-page-advanced {
    width: calc(100% - 34px) !important;
    padding-bottom: 70px !important;
  }
  .projects-hero-advanced {
    min-height: 560px;
    padding: 76px 0 58px;
  }
  .projects-hero-advanced:after {
    width: 90vw;
    right: -38%;
    top: 28%;
    opacity: .55;
  }
  .projects-hero-watermark {
    top: 28%;
    right: -10%;
    font-size: 46vw;
  }
  .projects-hero-advanced h1 {
    margin: 27px 0 22px;
    font-size: clamp(64px, 17vw, 105px);
  }
  .projects-hero-advanced p {
    font-size: 14px;
  }
  .projects-hero-bottom {
    gap: 18px 24px;
    margin-top: 30px;
  }
  .projects-hero-bottom b {
    font-size: 20px;
  }
  .projects-overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 78px;
  }
  .projects-overview-item {
    min-height: 112px;
    padding: 19px;
  }
  .projects-overview-item strong {
    font-size: 32px;
  }
  .projects-archive-head {
    margin-bottom: 25px;
  }
  .projects-archive-head h2 {
    font-size: clamp(37px, 10vw, 52px);
  }
  .projects-archive-head p {
    font-size: 13px;
  }
  .projects-grid-advanced {
    grid-template-columns: 1fr;
    gap: 17px;
  }
  .project-preview {
    min-height: 215px;
    aspect-ratio: 16 / 10;
  }
  .project-card-body {
    padding: 21px;
  }
  .project-card-title {
    font-size: 25px;
  }
  .project-card-description {
    font-size: 13px;
  }
  .projects-toolbar-advanced {
    padding: 15px 0;
  }
  .projects-filter-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 2px 1px 9px;
    scrollbar-width: thin;
  }
  .projects-filter-chip {
    flex: 0 0 auto;
    padding: 10px 13px;
    font-size: 11px;
  }
  .projects-toolbar-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .projects-search-advanced {
    grid-column: 1 / -1;
    width: 100%;
    height: 46px;
  }
  .projects-select-advanced {
    width: 100%;
  }
  .projects-result-line {
    align-items: flex-start;
    font-size: 9px;
  }
  .projects-grid-advanced.list-view .project-advanced-card {
    grid-template-columns: 1fr;
  }
  .projects-grid-advanced.list-view .project-preview {
    min-height: 205px;
    aspect-ratio: 16 / 9;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
  }
  .projects-grid-advanced.list-view .project-card-body {
    padding: 20px;
  }
  .projects-bottom-cta {
    margin-top: 85px;
    padding: 34px 25px;
    border-radius: 14px;
  }
  .projects-bottom-cta h2 {
    font-size: clamp(42px, 11vw, 60px);
  }
  .projects-bottom-cta p {
    font-size: 13px;
  }
  .project-modal-backdrop {
    padding: 10px;
  }
  .project-modal-advanced {
    max-height: 94vh;
    border-radius: 13px;
  }
}

/* Narrow phones */
@media (max-width: 390px) {
  .projects-page-advanced {
    width: calc(100% - 26px) !important;
  }
  .projects-hero-advanced h1 {
    font-size: 16vw;
  }
  .projects-overview-item {
    padding: 16px;
  }
  .projects-overview-item small {
    font-size: 9px;
  }
  .projects-overview-item strong {
    font-size: 28px;
  }
  .project-preview {
    min-height: 185px;
  }
  .project-card-body {
    padding: 18px;
  }
  .project-card-title {
    font-size: 22px;
  }
}

/* Motion preference and reduced-motion safety */
@media (prefers-reduced-motion: reduce) {
  .projects-page-advanced *,
  .projects-page-advanced *:before,
  .projects-page-advanced *:after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}

      `}</style>

      <section className="projects-hero-advanced">
        <div className="projects-hero-watermark">WORK</div>
        <div className="projects-hero-copy">
          <span className="projects-hero-kicker">02 / SELECTED WORK & EXPERIMENTS</span>
          <h1>Ideas become<br /><em>real projects.</em></h1>
          <p>A collection of applications, experiments and hardware projects. Explore live experiences, technologies and the thinking behind each build.</p>
          <div className="projects-hero-bottom">
            <span><i /> <b>{String(allProjects.length).padStart(2, "0")}</b> PROJECTS IN THE PORTFOLIO</span>
            <span><b>{String(liveCount).padStart(2, "0")}</b> LIVE EXPERIENCES</span>
            <span><b>{String(techCount).padStart(2, "0")}</b> TECHNOLOGIES</span>
          </div>
        </div>
      </section>

      <div className="projects-overview-grid">
        <div className="projects-overview-item"><small>All projects</small><strong>{String(allProjects.length).padStart(2, "0")}</strong><span>Across all categories</span></div>
        <div className="projects-overview-item"><small>Live websites</small><strong>{String(liveCount).padStart(2, "0")}</strong><span>Open and explore</span></div>
        <div className="projects-overview-item"><small>Hardware builds</small><strong>{String(hardwareCount).padStart(2, "0")}</strong><span>Physical prototypes</span></div>
        <div className="projects-overview-item"><small>Tech stack</small><strong>{String(techCount).padStart(2, "0")}</strong><span>Unique technologies</span></div>
      </div>

      {featuredProjects.length > 0 && (
        <section className="projects-featured-section" style={{ marginBottom: 85 }}>
          <div className="projects-archive-head">
            <div><span className="projects-archive-kicker">HANDPICKED / 01</span><h2>Featured work.</h2><p>A closer look at selected projects from the portfolio.</p></div>
          </div>
          <div className="projects-grid-advanced">
            {featuredProjects.slice(0, 3).map((project, index) => (
              <ProjectCard key={project.id || project.name || index} project={project} index={index} onOpen={openProject} motionEnabled={enabled} viewMode="grid" />
            ))}
          </div>
        </section>
      )}

      <section className="projects-archive-section" id="project-archive">
        <div className="projects-archive-head">
          <div><span className="projects-archive-kicker">THE COLLECTION / 02</span><h2>Explore the archive.</h2><p>Search, filter and sort all projects. Select any card to open its detailed case study.</p></div>
        </div>

        <div className="projects-toolbar-advanced">
          <div className="projects-filter-row" role="group" aria-label="Filter projects by category">
            {categories.map(category => (
              <button key={category} type="button" className={`projects-filter-chip ${filter === category ? "active" : ""}`} aria-pressed={filter === category} onClick={() => { setFilter(category); setLimit(PROJECTS_PAGE_CONFIG.initialLimit); }}>
                {category}
              </button>
            ))}
          </div>
          <div className="projects-toolbar-tools">
            <label className="projects-search-advanced">
              <Search size={14} />
              <input ref={searchRef} value={query} onChange={event => { setQuery(event.target.value); setLimit(PROJECTS_PAGE_CONFIG.initialLimit); }} placeholder="Search projects..." aria-label="Search projects" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}
              {!query && <kbd>CTRL K</kbd>}
            </label>
            <select className="projects-select-advanced" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort projects">
              <option value="featured">Featured first</option><option value="live">Live first</option><option value="name">Name A–Z</option><option value="category">Category</option>
            </select>
            <button type="button" className={`projects-tool-button ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode(value => value === "grid" ? "list" : "grid")} aria-label="Toggle grid or list view">
              {viewMode === "grid" ? <List size={15} /> : <LayoutGrid size={15} />}
            </button>
          </div>
        </div>

        <div className="projects-result-line">
          <span>SHOWING <strong>{visibleProjects.length}</strong> OF <strong>{filteredProjects.length}</strong> PROJECTS</span>
          {(filter !== "All" || query || sort !== "featured") && <button type="button" className="projects-tool-button" onClick={clearFilters}><RotateCcw size={13} /> Reset filters</button>}
        </div>

        {visibleProjects.length ? (
          <motion.div layout className={`projects-grid-advanced ${viewMode === "list" ? "list-view" : ""}`}>
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id || project.name || index}
                  layout
                  initial={enabled ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .97 }}
                  transition={{ duration: enabled ? .35 : 0, delay: (index % 3) * .035, ease: EASE }}
                >
                  <ProjectCard project={project} index={index} onOpen={openProject} motionEnabled={enabled} viewMode={viewMode} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="projects-empty-state">
            <Search size={28} /><h3>No projects found.</h3><p>Try another search term or reset the category filter.</p>
            <button type="button" onClick={clearFilters}>Clear search and filters</button>
          </div>
        )}

        {visibleProjects.length < filteredProjects.length && (
          <div className="projects-load-more"><span>{visibleProjects.length} / {filteredProjects.length} projects</span><button type="button" onClick={() => setLimit(value => value + PROJECTS_PAGE_CONFIG.increment)}>Load more projects <ChevronDown size={15} /></button></div>
        )}
      </section>

      <section className="projects-bottom-cta">
        <small>HAVE AN IDEA / LET'S CONNECT</small>
        <h2>Good work starts<br />with a conversation.</h2>
        <p>Interested in collaborating, discussing a project or sharing an opportunity? Let's connect and explore what we can build.</p>
        <a href="/contact">Start a conversation <ArrowUpRight size={16} /></a>
      </section>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={closeProject} motionEnabled={enabled} />}
      </AnimatePresence>
    </main>
  );
}
