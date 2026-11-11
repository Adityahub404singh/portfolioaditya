
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Activity, Award, BarChart3, BookOpen, CalendarDays, Check, Code2,
  Download, FolderKanban, Gauge, GraduationCap, ImagePlus, KeyRound,
  LogOut, Plus, Save, Settings, ShieldCheck, StickyNote, Target, Trash2,
  Trophy, UploadCloud, UserRound, X, Globe, ExternalLink
} from "lucide-react";

import { supabase, adminEmail } from "../lib/supabase";
import { usePortfolio } from "../hooks/usePortfolio";

const today = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `aps-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const emptyDsa = () => ({
  title: "", platform: "LeetCode", difficulty: "Medium",
  topic: "", url: "", date: today(), timeSpent: ""
});

const emptyProject = () => ({
  name: "", category: "Web App", status: "In progress",
  description: "", stack: "", liveUrl: "", githubUrl: "",
  image: "", featured: false
});

const emptyCertificate = () => ({
  title: "", issuer: "", date: today(), url: "", file: ""
});

const emptyAchievement = () => ({
  title: "", detail: "", date: today(), category: "Competition", url: ""
});

const emptyUpdate = () => ({
  date: today(), title: "", detail: "", category: "Learning", githubUrl: ""
});

const emptyTimeline = () => ({
  date: "", title: "", detail: "", type: "Milestone"
});

const emptyGoal = () => ({
  title: "", current: 0, target: 1
});

const emptyNote = () => ({
  title: "", body: "", pinned: false
});

const SOCIAL_FIELDS = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/username", hint: "Code, repositories and contributions" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username", hint: "Professional profile and networking" },
  { key: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/u/username", hint: "DSA practice and problem-solving" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username", hint: "Personal updates and visual posts" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username", hint: "Videos, demos and walkthroughs" },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/username", hint: "Short updates and tech conversations" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username", hint: "Public profile or page" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/invite-or-profile", hint: "Community or public profile link" },
  { key: "codechef", label: "CodeChef", placeholder: "https://www.codechef.com/users/username", hint: "Competitive programming" },
  { key: "codeforces", label: "Codeforces", placeholder: "https://codeforces.com/profile/username", hint: "Competitive programming contests" },
  { key: "geeksforgeeks", label: "GeeksforGeeks", placeholder: "https://www.geeksforgeeks.org/user/username", hint: "Practice and articles" },
  { key: "hackerrank", label: "HackerRank", placeholder: "https://www.hackerrank.com/profile/username", hint: "Coding practice and skills" },
  { key: "devto", label: "Dev.to", placeholder: "https://dev.to/username", hint: "Technical writing" },
  { key: "medium", label: "Medium", placeholder: "https://medium.com/@username", hint: "Long-form articles" },
  { key: "kaggle", label: "Kaggle", placeholder: "https://www.kaggle.com/username", hint: "Datasets and machine learning" },
  { key: "portfolioUrl", label: "Other website", placeholder: "https://your-domain.com", hint: "Personal site or another public profile" }
];

const DEFAULT_ARRAYS = [
  "projects", "skills", "dsa", "certificates", "achievements",
  "timeline", "dailyUpdates", "goals", "notes"
];

const isValidHttpUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

function Field({ label, children, wide = false }) {
  return (
    <label className={`admin-field ${wide ? "field-wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, icon: Icon, children, action }) {
  return (
    <section className="admin-panel panel">
      <div className="admin-panel-title">
        <Icon size={19} />
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function TextInput({
  value, onChange, placeholder = "", type = "text",
  required = false, min, max, step
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
    />
  );
}

function TextArea({ value, onChange, placeholder = "", rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function ItemRows({ items = [], onDelete, primary, secondary }) {
  return (
    <div className="admin-item-list">
      {items.map((item) => (
        <div className="admin-list-row" key={item.id}>
          <span>
            <b>{primary(item)}</b>
            <small>{secondary(item)}</small>
          </span>

          <button
            className="icon-danger"
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${primary(item)}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {!items.length && (
        <p className="empty-copy">Nothing added yet. Add your first entry using the form.</p>
      )}
    </div>
  );
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeBackup(parsed, current) {
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !parsed.profile ||
    typeof parsed.profile !== "object" ||
    Array.isArray(parsed.profile)
  ) {
    throw new Error("Invalid backup: profile information is missing.");
  }

  for (const key of ["projects", "dsa"]) {
    if (!Array.isArray(parsed[key])) {
      throw new Error(`Invalid backup: "${key}" must be an array.`);
    }
  }

  const normalized = {
    ...current,
    ...parsed,
    profile: {
      ...(current.profile || {}),
      ...parsed.profile
    },
    settings: {
      ...(current.settings || {}),
      ...(parsed.settings || {})
    },
    leetcode: {
      ...(current.leetcode || {}),
      ...(parsed.leetcode || {})
    }
  };

  DEFAULT_ARRAYS.forEach((key) => {
    normalized[key] = safeArray(parsed[key] ?? current[key]);
  });

  return normalized;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminDashboard() {
  const { content, saveContent, session, isCloud } = usePortfolio();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [draft, setDraft] = useState(content);

  const [forms, setForms] = useState({
    dsa: emptyDsa(),
    project: emptyProject(),
    certificate: emptyCertificate(),
    achievement: emptyAchievement(),
    update: emptyUpdate(),
    timeline: emptyTimeline(),
    goal: emptyGoal(),
    note: emptyNote()
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analytics, setAnalytics] = useState({
    visits: [],
    projectClicks: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [importText, setImportText] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  const messageTimer = useRef(null);
  const busyRef = useRef(false);

  const showMessage = useCallback((text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    if (messageTimer.current) {
      window.clearTimeout(messageTimer.current);
    }

    messageTimer.current = window.setTimeout(() => {
      setMessage("");
    }, 6500);
  }, []);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  useEffect(() => {
    return () => {
      if (messageTimer.current) {
        window.clearTimeout(messageTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadAnalytics() {
      if (!isCloud) {
        try {
          const raw = localStorage.getItem("aps-analytics-preview");

          if (raw && alive) {
            const parsed = JSON.parse(raw);

            setAnalytics({
              visits: safeArray(parsed.visits),
              projectClicks: safeArray(parsed.projectClicks)
            });
          }
        } catch {
          if (alive) {
            setAnalytics({ visits: [], projectClicks: [] });
          }
        }

        return;
      }

      setAnalyticsLoading(true);

      try {
        const { data, error } = await supabase
          .from("portfolio_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000);

        if (error) throw error;

        if (alive) {
          const events = safeArray(data);

          setAnalytics({
            visits: events.filter((item) => item.event_type === "page_view"),
            projectClicks: events.filter((item) => item.event_type === "project_click")
          });
        }
      } catch (error) {
        if (alive) {
          showMessage(
            `Analytics could not be loaded: ${error.message || "Unknown error"}`,
            "error"
          );
        }
      } finally {
        if (alive) setAnalyticsLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      alive = false;
    };
  }, [isCloud, showMessage]);

  const setForm = (key, value) => {
    setForms((old) => ({
      ...old,
      [key]: value
    }));
  };

  const publish = async (next = draft, success = "Changes published successfully.") => {
    if (busyRef.current) return false;

    busyRef.current = true;
    setBusy(true);
    setMessage("");

    try {
      await saveContent(next);
      setDraft(next);
      showMessage(success);
      return true;
    } catch (error) {
      showMessage(error?.message || "Could not publish changes.", "error");
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/admin");
    } catch (error) {
      showMessage(error.message || "Could not sign out.", "error");
    }
  };

  const removeItem = async (key, id) => {
    const item = safeArray(draft[key]).find((entry) => entry.id === id);
    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.title || item.name || "this item"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const next = {
      ...draft,
      [key]: safeArray(draft[key]).filter((entry) => entry.id !== id)
    };

    const success = await publish(next, "Item deleted successfully.");

    if (success && key === "projects" && editingProjectId === id) {
      cancelProjectEdit();
    }
  };

  async function uploadAsset(file, folder = "media") {
    if (!file) return "";

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File is too large. Maximum upload size is 10 MB.");
    }

    if (!isCloud) {
      throw new Error("File upload requires Supabase Storage. Configure Supabase first.");
    }

    const allowed =
      folder === "resume"
        ? file.type === "application/pdf"
        : folder === "certificates"
          ? file.type === "application/pdf" || file.type.startsWith("image/")
          : file.type.startsWith("image/");

    if (!allowed) {
      throw new Error(
        folder === "resume"
          ? "Please select a PDF resume."
          : "Please select a supported image or PDF file."
      );
    }

    setUploading(true);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${folder}/${uid()}-${safeName}`;

      const { error } = await supabase.storage
        .from("portfolio-assets")
        .upload(path, file, {
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("portfolio-assets")
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error("Upload completed, but the public URL could not be created.");
      }

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function addDsa(event) {
    event.preventDefault();

    const next = {
      ...draft,
      dsa: [
        { ...forms.dsa, id: uid() },
        ...safeArray(draft.dsa)
      ]
    };

    if (await publish(next, "DSA problem added.")) {
      setForm("dsa", emptyDsa());
    }
  }

  async function addProject(event) {
    event.preventDefault();

    const stack = String(forms.project.stack || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!isValidHttpUrl(forms.project.liveUrl) || !isValidHttpUrl(forms.project.githubUrl)) {
      showMessage("Please enter valid HTTP or HTTPS project URLs.", "error");
      return;
    }

    let next;

    if (editingProjectId) {
      next = {
        ...draft,
        projects: safeArray(draft.projects).map((item) =>
          item.id === editingProjectId
            ? { ...forms.project, id: editingProjectId, stack }
            : item
        )
      };

      if (await publish(next, "Project updated.")) {
        cancelProjectEdit();
      }
    } else {
      next = {
        ...draft,
        projects: [
          { ...forms.project, id: uid(), stack },
          ...safeArray(draft.projects)
        ]
      };

      if (await publish(next, "Project added.")) {
        setForm("project", emptyProject());
      }
    }
  }

  function startEditProject(item) {
    setEditingProjectId(item.id);

    setForm("project", {
      ...emptyProject(),
      ...item,
      stack: safeArray(item.stack).join(", ")
    });

    setTab("projects");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelProjectEdit() {
    setEditingProjectId(null);
    setForm("project", emptyProject());
  }

  async function addCertificate(event) {
    event.preventDefault();

    const next = {
      ...draft,
      certificates: [
        { ...forms.certificate, id: uid() },
        ...safeArray(draft.certificates)
      ]
    };

    if (await publish(next, "Certificate added.")) {
      setForm("certificate", emptyCertificate());
    }
  }

  async function addAchievement(event) {
    event.preventDefault();

    const next = {
      ...draft,
      achievements: [
        { ...forms.achievement, id: uid() },
        ...safeArray(draft.achievements)
      ]
    };

    if (await publish(next, "Achievement added.")) {
      setForm("achievement", emptyAchievement());
    }
  }

  async function addUpdate(event) {
    event.preventDefault();

    const next = {
      ...draft,
      dailyUpdates: [
        { ...forms.update, id: uid() },
        ...safeArray(draft.dailyUpdates)
      ]
    };

    if (await publish(next, "Daily update published.")) {
      setForm("update", emptyUpdate());
    }
  }

  async function addTimeline(event) {
    event.preventDefault();

    const next = {
      ...draft,
      timeline: [
        ...safeArray(draft.timeline),
        { ...forms.timeline, id: uid() }
      ]
    };

    if (await publish(next, "Timeline milestone added.")) {
      setForm("timeline", emptyTimeline());
    }
  }

  async function addGoal(event) {
    event.preventDefault();

    const current = Math.max(0, Number(forms.goal.current) || 0);
    const target = Math.max(1, Number(forms.goal.target) || 1);

    const next = {
      ...draft,
      goals: [
        ...safeArray(draft.goals),
        { ...forms.goal, id: uid(), current, target }
      ]
    };

    if (await publish(next, "Goal added.")) {
      setForm("goal", emptyGoal());
    }
  }

  async function addNote(event) {
    event.preventDefault();

    const next = {
      ...draft,
      notes: [
        { ...forms.note, id: uid(), createdAt: new Date().toISOString() },
        ...safeArray(draft.notes)
      ]
    };

    if (await publish(next, "Note saved.")) {
      setForm("note", emptyNote());
    }
  }

  async function handleProfilePhoto(file) {
    try {
      const url = await uploadAsset(file, "profile");

      if (url) {
        await publish({
          ...draft,
          profile: { ...draft.profile, photoUrl: url }
        }, "Profile photo uploaded.");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  }

  async function handleResume(file) {
    try {
      const url = await uploadAsset(file, "resume");

      if (url) {
        await publish({
          ...draft,
          profile: { ...draft.profile, resumeUrl: url }
        }, "Resume uploaded.");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  }

  async function handleCertificateFile(file) {
    try {
      const url = await uploadAsset(file, "certificates");

      if (url) {
        setForm("certificate", {
          ...forms.certificate,
          url,
          file: file.name
        });

        showMessage("Certificate uploaded. Save the certificate entry to publish it.");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  }

  async function handleProjectImage(file) {
    try {
      const url = await uploadAsset(file, "projects");

      if (url) {
        setForm("project", {
          ...forms.project,
          image: url
        });

        showMessage("Project image uploaded. Save the project to publish it.");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  }

  function exportBackup() {
    const blob = new Blob(
      [JSON.stringify(draft, null, 2)],
      { type: "application/json" }
    );

    downloadBlob(blob, `aps-portfolio-backup-${today()}.json`);
    showMessage("Portfolio backup downloaded.");
  }

  function exportCsv() {
    const rows = [
      ["Date", "Problem", "Difficulty", "Topic", "Platform", "URL"],
      ...safeArray(draft.dsa).map((item) => [
        item.date,
        item.title,
        item.difficulty,
        item.topic,
        item.platform,
        item.url
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\r\n");

    downloadBlob(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
      "aps-dsa-logs.csv"
    );

    showMessage("DSA CSV exported.");
  }

  async function importBackup() {
    if (!importText.trim()) {
      showMessage("Paste your JSON backup before importing.", "error");
      return;
    }

    const confirmed = window.confirm(
      "Importing a backup will replace the current portfolio content. Have you exported a backup of your current data?"
    );

    if (!confirmed) return;

    try {
      const parsed = JSON.parse(importText);
      const normalized = normalizeBackup(parsed, draft);

      if (await publish(normalized, "Backup imported successfully.")) {
        setImportText("");
      }
    } catch (error) {
      showMessage(`Import failed: ${error.message}`, "error");
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const password = form.password.value;

    if (password.length < 8) {
      showMessage("Password must contain at least 8 characters.", "error");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      form.reset();
      showMessage("Password updated successfully.");
    } catch (error) {
      showMessage(error.message || "Could not update password.", "error");
    }
  }

  const safeDraft = {
    ...draft,
    profile: draft.profile || {},
    settings: draft.settings || {},
    leetcode: draft.leetcode || {},
    projects: safeArray(draft.projects),
    skills: safeArray(draft.skills),
    dsa: safeArray(draft.dsa),
    certificates: safeArray(draft.certificates),
    achievements: safeArray(draft.achievements),
    timeline: safeArray(draft.timeline),
    dailyUpdates: safeArray(draft.dailyUpdates),
    goals: safeArray(draft.goals),
    notes: safeArray(draft.notes)
  };

  const filteredVisits = useMemo(() => {
    const cutoff = Date.now() - Number(dateRange) * 86400000;

    return safeArray(analytics.visits).filter((item) => {
      const timestamp = new Date(item.created_at || item.createdAt || 0).getTime();
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  }, [analytics.visits, dateRange]);

  const projectClickCounts = useMemo(() => {
    const counts = {};

    safeArray(analytics.projectClicks).forEach((item) => {
      const name = item.metadata?.project || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [analytics.projectClicks]);

  if (!session) return <Navigate to="/admin" replace />;

  if (
    adminEmail &&
    session.user?.email?.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    return <Navigate to="/admin" replace />;
  }

  const visitCount = analytics.visits.length;

  const tabs = [
    ["overview", "Dashboard", Activity],
    ["dsa", "DSA / LeetCode", Code2],
    ["updates", "Daily Updates", CalendarDays],
    ["projects", "Projects", FolderKanban],
    ["skills", "Skills Overview", Gauge],
    ["certificates", "Certificates", Award],
    ["achievements", "Achievements", Trophy],
    ["timeline", "Timeline & Roadmap", GraduationCap],
    ["profile", "Profile Settings", UserRound],
    ["socials", "Social Media Links", Globe],
    ["analytics", "Analytics", BarChart3],
    ["goals", "Notes & Goals", Target],
    ["system", "System", Settings]
  ];

  const kpis = [
    [Code2, safeDraft.dsa.length, "DSA solved / logged"],
    [FolderKanban, safeDraft.projects.length, "Projects"],
    [Award, safeDraft.certificates.length, "Certificates"],
    [Trophy, safeDraft.achievements.length, "Achievements"],
    [Activity, visitCount, "Portfolio visits"],
    [
      Gauge,
      Math.min(
        100,
        Math.round(
          safeDraft.projects.length * 8 +
          safeDraft.dsa.length * 0.2 +
          safeDraft.certificates.length * 2 +
          safeDraft.achievements.length * 3
        )
      ),
      "Portfolio score"
    ]
  ];

  const dsaStats = ["Easy", "Medium", "Hard"].map((level) => ({
    level,
    count: safeDraft.dsa.filter((item) => item.difficulty === level).length
  }));

  const todayUpdates = safeDraft.dailyUpdates.filter(
    (item) => item.date === today()
  );

  return (
    <>
      <style>{`
        .admin-app .social-admin-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px 20px; }
        .admin-app .social-admin-grid .admin-field { min-width:0; }
        .admin-app .social-admin-grid .muted-note { display:block; margin:6px 0 0; font-size:11px; }
        .admin-app .social-preview-link { display:inline-flex; align-items:center; gap:6px; margin-top:7px; color:#f87171; font-size:11px; text-decoration:none; }
        .admin-app .social-preview-link:hover { color:#fff; }
        .admin-app .social-checklist { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 18px; }
        .admin-app .social-connected { color:#4ade80; }
        .admin-app .social-invalid { color:#fbbf24; }
        .admin-app .social-empty { color:#858585; }
        @media(max-width:720px) { .admin-app .social-admin-grid,.admin-app .social-checklist { grid-template-columns:1fr; } }
      `}</style>
      <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="brand-mark">APS<span>.</span></div>
        <p>PORTFOLIO STUDIO</p>

        <div className="admin-user">
          <img
            src={safeDraft.profile.photoUrl || "/images/profile.jpg"}
            alt={safeDraft.profile.name || "Administrator"}
            onError={(event) => {
              event.currentTarget.src = "/images/profile.jpg";
            }}
          />
          <b>{safeDraft.profile.name || "Portfolio Admin"}</b>
          <small>Portfolio administrator</small>
        </div>

        <nav aria-label="Admin navigation">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <a
          className="admin-public-link"
          href="/"
          target="_blank"
          rel="noreferrer"
        >
          View live portfolio ↗
        </a>

        <button className="admin-logout" type="button" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">
              <i /> PRIVATE ADMIN WORKSPACE
            </span>
            <h1>{tabs.find((item) => item[0] === tab)?.[1]}</h1>
          </div>

          <div className="admin-top-actions">
            <span className="cloud-status">
              {isCloud ? "● CLOUD SYNC" : "● LOCAL PREVIEW"}
            </span>

            <button
              className="button button-primary button-small"
              type="button"
              onClick={() => publish()}
              disabled={busy || uploading}
            >
              <Save size={15} />
              {busy ? "Saving..." : "Publish changes"}
            </button>
          </div>
        </header>

        {message && (
          <div
            className={`admin-message ${messageType === "error" ? "error" : ""}`}
            role="status"
          >
            {messageType === "error" ? <X size={15} /> : <Check size={15} />}
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
              <X size={14} />
            </button>
          </div>
        )}

        {uploading && (
          <div className="admin-message">
            <Activity size={15} />
            Uploading file. Please wait...
          </div>
        )}

        {tab === "overview" && (
          <>
            <div className="admin-kpis">
              {kpis.map(([Icon, value, label]) => (
                <div key={label}>
                  <Icon />
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="admin-overview-grid">
              <Panel title="DSA difficulty breakdown" icon={Code2}>
                <div className="analytics-bars">
                  {dsaStats.map((item) => (
                    <div key={item.level}>
                      <span>{item.level}</span>
                      <div>
                        <i
                          style={{
                            width: `${
                              safeDraft.dsa.length
                                ? (item.count / safeDraft.dsa.length) * 100
                                : 0
                            }%`
                          }}
                        />
                      </div>
                      <b>{item.count}</b>
                    </div>
                  ))}
                </div>

                <div className="admin-inline-stat">
                  <span>LeetCode rating</span>
                  <b>{safeDraft.leetcode.rating || "—"}</b>
                  <span>Current streak</span>
                  <b>{safeDraft.leetcode.streak || 0} days</b>
                </div>
              </Panel>

              <Panel title="Today's plan" icon={CalendarDays}>
                <p className="admin-today-count">
                  {todayUpdates.length} updates published today
                </p>

                {safeDraft.goals.slice(0, 4).map((goal) => (
                  <div className="goal-mini" key={goal.id}>
                    <div>
                      <span>{goal.title}</span>
                      <b>{goal.current}/{goal.target}</b>
                    </div>
                    <div className="goal-track">
                      <i
                        style={{
                          width: `${
                            Math.min(
                              100,
                              (Number(goal.current) / Math.max(1, Number(goal.target))) * 100
                            )
                          }%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel title="Recent activity" icon={Activity}>
                {[
                  ...safeDraft.dailyUpdates,
                  ...safeDraft.dsa,
                  ...safeDraft.projects
                ]
                  .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                  .slice(0, 7)
                  .map((item) => (
                    <div className="admin-list-row" key={item.id}>
                      <span>{item.title || item.name}</span>
                      <small>{item.date || item.status || ""}</small>
                    </div>
                  ))}

                {!safeDraft.dailyUpdates.length &&
                  !safeDraft.dsa.length &&
                  !safeDraft.projects.length && (
                    <p className="empty-copy">No recent activity yet.</p>
                  )}
              </Panel>

              <Panel title="Quick actions" icon={Plus}>
                <div className="admin-quick-actions">
                  {tabs.slice(1).map(([id, label, Icon]) => (
                    <button key={id} type="button" onClick={() => setTab(id)}>
                      <Icon /> {label}
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}

        {tab === "dsa" && (
          <div className="admin-content-grid">
            <Panel title="Add daily DSA problem" icon={Code2}>
              <form className="admin-form" onSubmit={addDsa}>
                <Field label="Problem title">
                  <TextInput
                    value={forms.dsa.title}
                    onChange={(v) => setForm("dsa", { ...forms.dsa, title: v })}
                    placeholder="Two Sum"
                    required
                  />
                </Field>

                <Field label="Platform">
                  <select
                    value={forms.dsa.platform}
                    onChange={(e) => setForm("dsa", { ...forms.dsa, platform: e.target.value })}
                  >
                    <option>LeetCode</option>
                    <option>GeeksforGeeks</option>
                    <option>CodeStudio</option>
                    <option>HackerRank</option>
                    <option>Other</option>
                  </select>
                </Field>

                <Field label="Difficulty">
                  <select
                    value={forms.dsa.difficulty}
                    onChange={(e) => setForm("dsa", { ...forms.dsa, difficulty: e.target.value })}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </Field>

                <Field label="Topic">
                  <TextInput
                    value={forms.dsa.topic}
                    onChange={(v) => setForm("dsa", { ...forms.dsa, topic: v })}
                    placeholder="Array / HashMap"
                  />
                </Field>

                <Field label="Problem URL">
                  <TextInput
                    value={forms.dsa.url}
                    onChange={(v) => setForm("dsa", { ...forms.dsa, url: v })}
                    placeholder="https://..."
                  />
                </Field>

                <Field label="Date solved">
                  <TextInput
                    type="date"
                    value={forms.dsa.date}
                    onChange={(v) => setForm("dsa", { ...forms.dsa, date: v })}
                  />
                </Field>

                <Field label="Time spent (minutes)">
                  <TextInput
                    type="number"
                    min="0"
                    value={forms.dsa.timeSpent}
                    onChange={(v) => setForm("dsa", { ...forms.dsa, timeSpent: v })}
                  />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Add problem
                </button>
              </form>
            </Panel>

            <Panel title="LeetCode profile metrics" icon={BarChart3}>
              <form
                className="admin-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;

                  publish({
                    ...draft,
                    leetcode: {
                      ...safeDraft.leetcode,
                      username: form.username.value,
                      rating: Math.max(0, Number(form.rating.value) || 0),
                      streak: Math.max(0, Number(form.streak.value) || 0),
                      lastSynced: today()
                    }
                  }, "LeetCode metrics saved.");
                }}
              >
                <Field label="Username">
                  <input name="username" defaultValue={safeDraft.leetcode.username || ""} placeholder="LeetCode username" />
                </Field>
                <Field label="Contest rating">
                  <input name="rating" type="number" min="0" defaultValue={safeDraft.leetcode.rating || 0} />
                </Field>
                <Field label="Current streak (days)">
                  <input name="streak" type="number" min="0" defaultValue={safeDraft.leetcode.streak || 0} />
                </Field>
                <button className="button button-primary" disabled={busy}>
                  <Save size={15} /> Save metrics
                </button>
              </form>

              <div className="difficulty-grid">
                {dsaStats.map((item) => (
                  <div key={item.level}>
                    <b>{item.count}</b>
                    <span>{item.level}</span>
                  </div>
                ))}
              </div>

              <button className="button button-ghost button-small" type="button" onClick={exportCsv}>
                <Download size={14} /> Export DSA CSV
              </button>
            </Panel>

            <Panel title="Problem history" icon={Activity}>
              <ItemRows
                items={safeDraft.dsa}
                onDelete={(id) => removeItem("dsa", id)}
                primary={(item) => item.title}
                secondary={(item) => `${item.difficulty} · ${item.topic || "No topic"} · ${item.platform} · ${item.date}`}
              />
            </Panel>

            <Panel title="Streak & consistency" icon={CalendarDays}>
              <div className="admin-large-number">
                {safeDraft.leetcode.streak || 0}
                <small>day streak</small>
              </div>
              <p className="muted-note">
                Streak is manually maintained in your LeetCode profile metrics.
              </p>
            </Panel>
          </div>
        )}

        {tab === "updates" && (
          <div className="admin-content-grid">
            <Panel title="Publish today's update" icon={CalendarDays}>
              <form className="admin-form" onSubmit={addUpdate}>
                <Field label="Date">
                  <TextInput type="date" value={forms.update.date} onChange={(v) => setForm("update", { ...forms.update, date: v })} />
                </Field>

                <Field label="Update type">
                  <select value={forms.update.category} onChange={(e) => setForm("update", { ...forms.update, category: e.target.value })}>
                    <option>Learning</option>
                    <option>Building</option>
                    <option>DSA</option>
                    <option>GitHub</option>
                    <option>Career</option>
                  </select>
                </Field>

                <Field label="Title">
                  <TextInput value={forms.update.title} onChange={(v) => setForm("update", { ...forms.update, title: v })} placeholder="Solved two graph problems" required />
                </Field>

                <Field label="GitHub activity URL">
                  <TextInput value={forms.update.githubUrl} onChange={(v) => setForm("update", { ...forms.update, githubUrl: v })} placeholder="Commit / PR URL" />
                </Field>

                <Field label="What did you learn or build?" wide>
                  <TextArea value={forms.update.detail} onChange={(v) => setForm("update", { ...forms.update, detail: v })} placeholder="Write a short progress summary..." />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Publish update
                </button>
              </form>
            </Panel>

            <Panel title="Daily update history" icon={BookOpen}>
              <ItemRows
                items={safeDraft.dailyUpdates}
                onDelete={(id) => removeItem("dailyUpdates", id)}
                primary={(item) => item.title}
                secondary={(item) => `${item.date} · ${item.category} · ${item.detail}`}
              />
            </Panel>
          </div>
        )}

        {tab === "projects" && (
          <div className="admin-content-grid">
            <Panel title={editingProjectId ? "Edit project" : "Add a project"} icon={FolderKanban}>
              <form className="admin-form" onSubmit={addProject}>
                <Field label="Project name">
                  <TextInput value={forms.project.name} onChange={(v) => setForm("project", { ...forms.project, name: v })} required />
                </Field>

                <Field label="Category">
                  <TextInput value={forms.project.category} onChange={(v) => setForm("project", { ...forms.project, category: v })} />
                </Field>

                <Field label="Status">
                  <TextInput value={forms.project.status} onChange={(v) => setForm("project", { ...forms.project, status: v })} />
                </Field>

                <Field label="Tech stack (comma separated)" wide>
                  <TextInput value={forms.project.stack} onChange={(v) => setForm("project", { ...forms.project, stack: v })} placeholder="React, Java, Supabase" />
                </Field>

                <Field label="Description" wide>
                  <TextArea value={forms.project.description} onChange={(v) => setForm("project", { ...forms.project, description: v })} required />
                </Field>

                <Field label="Live demo URL">
                  <TextInput value={forms.project.liveUrl} onChange={(v) => setForm("project", { ...forms.project, liveUrl: v })} placeholder="https://..." />
                </Field>

                <Field label="GitHub URL">
                  <TextInput value={forms.project.githubUrl} onChange={(v) => setForm("project", { ...forms.project, githubUrl: v })} placeholder="https://github.com/..." />
                </Field>

                <Field label="Image URL / path">
                  <TextInput value={forms.project.image} onChange={(v) => setForm("project", { ...forms.project, image: v })} placeholder="/images/project.jpg" />
                </Field>

                <Field label="Upload project image">
                  <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleProjectImage(e.target.files?.[0])} />
                </Field>

                {forms.project.image && (
                  <div className="media-preview">
                    <img src={forms.project.image} alt="Project preview" />
                  </div>
                )}

                <label className="check-field">
                  <input type="checkbox" checked={Boolean(forms.project.featured)} onChange={(e) => setForm("project", { ...forms.project, featured: e.target.checked })} />
                  Show as featured project
                </label>

                <div className="row-actions">
                  <button className="button button-primary" disabled={busy || uploading}>
                    <Plus size={15} />
                    {editingProjectId ? "Save project changes" : "Add project"}
                  </button>

                  {editingProjectId && (
                    <button className="button button-ghost" type="button" onClick={cancelProjectEdit}>
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </Panel>

            <Panel title="Manage projects" icon={FolderKanban}>
              <div className="admin-item-list">
                {safeDraft.projects.map((item) => (
                  <div className="admin-list-row" key={item.id}>
                    <span>
                      <b>{item.name}</b>
                      <small>{item.category} · {item.status} · {safeArray(item.stack).join(", ")}</small>
                    </span>

                    <div className="row-actions">
                      <button className="button button-ghost button-small" type="button" onClick={() => startEditProject(item)}>
                        Edit
                      </button>
                      <button className="icon-danger" type="button" onClick={() => removeItem("projects", item.id)} aria-label={`Delete ${item.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {!safeDraft.projects.length && <p className="empty-copy">No projects added yet.</p>}
              </div>
            </Panel>
          </div>
        )}

        {tab === "skills" && (
          <div className="admin-content-grid">
            <Panel title="Skills overview" icon={Gauge}>
              <div className="skill-admin-list">
                {safeDraft.skills.map((skill) => (
                  <div className="skill-admin-row" key={skill.id}>
                    <div>
                      <b>{skill.name}</b>
                      <small>{skill.group} · {skill.level}%</small>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.max(0, Math.min(100, Number(skill.level) || 0))}
                      onChange={(e) => setDraft({
                        ...draft,
                        skills: safeDraft.skills.map((item) =>
                          item.id === skill.id
                            ? { ...item, level: Number(e.target.value) }
                            : item
                        )
                      })}
                    />

                    <button className="icon-danger" type="button" onClick={() => setDraft({
                      ...draft,
                      skills: safeDraft.skills.filter((item) => item.id !== skill.id)
                    })}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="button button-primary" type="button" onClick={() => publish()} disabled={busy}>
                <Save size={15} /> Save skill levels
              </button>
            </Panel>

            <Panel title="Add skill" icon={Plus}>
              <form
                className="admin-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);

                  const next = {
                    ...draft,
                    skills: [
                      ...safeDraft.skills,
                      {
                        id: uid(),
                        name: form.get("name"),
                        group: form.get("group"),
                        level: Number(form.get("level")),
                        detail: form.get("detail")
                      }
                    ]
                  };

                  publish(next, "Skill added.");
                  event.currentTarget.reset();
                }}
              >
                <Field label="Skill name">
                  <input name="name" required placeholder="Spring Boot" />
                </Field>

                <Field label="Group">
                  <select name="group">
                    <option>Languages</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Core CS</option>
                    <option>AI / ML</option>
                    <option>DevOps</option>
                    <option>Tools</option>
                  </select>
                </Field>

                <Field label="Proficiency (0–100)">
                  <input name="level" type="number" min="0" max="100" defaultValue="50" />
                </Field>

                <Field label="Details">
                  <input name="detail" placeholder="Frameworks / concepts" />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Add skill
                </button>
              </form>
            </Panel>
          </div>
        )}

        {tab === "certificates" && (
          <div className="admin-content-grid">
            <Panel title="Add certificate" icon={Award}>
              <form className="admin-form" onSubmit={addCertificate}>
                <Field label="Certificate title">
                  <TextInput value={forms.certificate.title} onChange={(v) => setForm("certificate", { ...forms.certificate, title: v })} required />
                </Field>

                <Field label="Issuer">
                  <TextInput value={forms.certificate.issuer} onChange={(v) => setForm("certificate", { ...forms.certificate, issuer: v })} required />
                </Field>

                <Field label="Issue date">
                  <TextInput type="date" value={forms.certificate.date} onChange={(v) => setForm("certificate", { ...forms.certificate, date: v })} />
                </Field>

                <Field label="Verification URL">
                  <TextInput value={forms.certificate.url} onChange={(v) => setForm("certificate", { ...forms.certificate, url: v })} />
                </Field>

                <Field label="Upload certificate (PDF/image)" wide>
                  <input type="file" accept=".pdf,image/*" disabled={uploading} onChange={(e) => handleCertificateFile(e.target.files?.[0])} />
                </Field>

                {forms.certificate.file && (
                  <p className="muted-note">Attached: {forms.certificate.file}</p>
                )}

                <button className="button button-primary" disabled={busy || uploading}>
                  <Plus size={15} /> Add certificate
                </button>
              </form>
            </Panel>

            <Panel title="Certificate library" icon={Award}>
              {safeDraft.certificates.map((item) => (
                <div className="admin-list-row" key={item.id}>
                  <span>
                    <b>{item.title}</b>
                    <small>{item.issuer} · {item.date}</small>
                  </span>

                  <div className="row-actions">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer">Preview</a>
                    )}
                    <button className="icon-danger" type="button" onClick={() => removeItem("certificates", item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!safeDraft.certificates.length && <p className="empty-copy">No certificates added yet.</p>}
            </Panel>
          </div>
        )}

        {tab === "achievements" && (
          <div className="admin-content-grid">
            <Panel title="Add achievement" icon={Trophy}>
              <form className="admin-form" onSubmit={addAchievement}>
                <Field label="Achievement title">
                  <TextInput value={forms.achievement.title} onChange={(v) => setForm("achievement", { ...forms.achievement, title: v })} required />
                </Field>

                <Field label="Category">
                  <select value={forms.achievement.category} onChange={(e) => setForm("achievement", { ...forms.achievement, category: e.target.value })}>
                    <option>Competition</option>
                    <option>Hackathon</option>
                    <option>Internship</option>
                    <option>Academic</option>
                    <option>Community</option>
                    <option>Other</option>
                  </select>
                </Field>

                <Field label="Date">
                  <TextInput type="date" value={forms.achievement.date} onChange={(v) => setForm("achievement", { ...forms.achievement, date: v })} />
                </Field>

                <Field label="Proof URL">
                  <TextInput value={forms.achievement.url} onChange={(v) => setForm("achievement", { ...forms.achievement, url: v })} />
                </Field>

                <Field label="Details" wide>
                  <TextArea value={forms.achievement.detail} onChange={(v) => setForm("achievement", { ...forms.achievement, detail: v })} />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Add achievement
                </button>
              </form>
            </Panel>

            <Panel title="Achievement wall" icon={Trophy}>
              <ItemRows
                items={safeDraft.achievements}
                onDelete={(id) => removeItem("achievements", id)}
                primary={(item) => item.title}
                secondary={(item) => `${item.category} · ${item.date} · ${item.detail}`}
              />
            </Panel>
          </div>
        )}

        {tab === "timeline" && (
          <div className="admin-content-grid">
            <Panel title="Add learning milestone" icon={GraduationCap}>
              <form className="admin-form" onSubmit={addTimeline}>
                <Field label="Date / period">
                  <TextInput value={forms.timeline.date} onChange={(v) => setForm("timeline", { ...forms.timeline, date: v })} placeholder="2026 — 2027" required />
                </Field>

                <Field label="Milestone type">
                  <select value={forms.timeline.type} onChange={(e) => setForm("timeline", { ...forms.timeline, type: e.target.value })}>
                    <option>Milestone</option>
                    <option>Education</option>
                    <option>Project</option>
                    <option>Internship</option>
                    <option>Placement</option>
                  </select>
                </Field>

                <Field label="Title" wide>
                  <TextInput value={forms.timeline.title} onChange={(v) => setForm("timeline", { ...forms.timeline, title: v })} required />
                </Field>

                <Field label="Description" wide>
                  <TextArea value={forms.timeline.detail} onChange={(v) => setForm("timeline", { ...forms.timeline, detail: v })} />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Add milestone
                </button>
              </form>
            </Panel>

            <Panel title="Learning journey & roadmap" icon={CalendarDays}>
              <ItemRows
                items={safeDraft.timeline}
                onDelete={(id) => removeItem("timeline", id)}
                primary={(item) => item.title}
                secondary={(item) => `${item.date} · ${item.type} · ${item.detail}`}
              />
            </Panel>
          </div>
        )}

        {tab === "profile" && (
          <div className="admin-content-grid">
            <Panel title="Profile identity & bio" icon={UserRound}>
              <form className="admin-form" onSubmit={(event) => {
                event.preventDefault();
                publish(draft, "Profile settings saved.");
              }}>
                {Object.entries(safeDraft.profile)
                  .filter(([key]) =>
                    [
                      "name", "role", "headline", "intro", "about", "location",
                      "college", "degree", "graduation", "cgpa", "email",
                      "github", "linkedin", "leetcode", "instagram", "youtube", "x",
                      "facebook", "discord", "codechef", "codeforces", "geeksforgeeks",
                      "hackerrank", "devto", "medium", "kaggle", "portfolioUrl", "availability"
                    ].includes(key)
                  )
                  .map(([key, value]) => (
                    <Field
                      key={key}
                      label={key}
                      wide={["headline", "intro", "about"].includes(key)}
                    >
                      {["intro", "about"].includes(key) ? (
                        <TextArea
                          value={value}
                          onChange={(v) => setDraft({
                            ...draft,
                            profile: { ...safeDraft.profile, [key]: v }
                          })}
                        />
                      ) : (
                        <TextInput
                          value={value}
                          onChange={(v) => setDraft({
                            ...draft,
                            profile: { ...safeDraft.profile, [key]: v }
                          })}
                        />
                      )}
                    </Field>
                  ))}

                <button className="button button-primary" disabled={busy}>
                  <Save size={15} /> Save profile
                </button>
              </form>
            </Panel>

            <Panel title="Profile media" icon={ImagePlus}>
              <div className="media-preview">
                <img
                  src={safeDraft.profile.photoUrl || "/images/profile.jpg"}
                  alt="Profile preview"
                />
              </div>

              <Field label="Upload profile photo">
                <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleProfilePhoto(e.target.files?.[0])} />
              </Field>

              <div className="admin-separator" />

              <Field label="Upload resume PDF">
                <input type="file" accept=".pdf,application/pdf" disabled={uploading} onChange={(e) => handleResume(e.target.files?.[0])} />
              </Field>

              {safeDraft.profile.resumeUrl && (
                <a href={safeDraft.profile.resumeUrl} target="_blank" rel="noreferrer">
                  View current resume ↗
                </a>
              )}

              <p className="muted-note">
                Uploads require the Supabase portfolio-assets public bucket.
              </p>
            </Panel>
          </div>
        )}

        {tab === "socials" && (
          <div className="admin-content-grid">
            <Panel title="Connect your public profiles" icon={Globe}>
              <p className="muted-note">
                Add the public profile URLs you want visitors to find. Leave a field empty to keep that profile hidden.
                Use your own profile URL, not a platform homepage. Changes are saved with your portfolio content.
              </p>
              <form
                className="admin-form social-admin-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const invalid = SOCIAL_FIELDS.find(({ key }) => {
                    const value = String(safeDraft.profile[key] || "").trim();
                    return value && !isValidHttpUrl(value);
                  });
                  if (invalid) {
                    showMessage(`${invalid.label}: enter a valid http:// or https:// URL.`, "error");
                    return;
                  }
                  publish(draft, "Social media links saved successfully.");
                }}
              >
                <div className="social-admin-grid">
                  {SOCIAL_FIELDS.map((field) => (
                    <Field key={field.key} label={field.label}>
                      <TextInput
                        value={safeDraft.profile[field.key] || ""}
                        onChange={(value) => setDraft((previous) => ({
                          ...previous,
                          profile: { ...(previous.profile || {}), [field.key]: value.trimStart() }
                        }))}
                        placeholder={field.placeholder}
                      />
                      <small className="muted-note">{field.hint}</small>
                      {safeDraft.profile[field.key] && isValidHttpUrl(safeDraft.profile[field.key]) && (
                        <a className="social-preview-link" href={safeDraft.profile[field.key]} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={13} /> Open profile
                        </a>
                      )}
                    </Field>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="button button-primary" type="submit" disabled={busy}>
                    <Save size={15} /> {busy ? "Saving links..." : "Save all social links"}
                  </button>
                  <button
                    className="button button-ghost"
                    type="button"
                    onClick={() => setDraft((previous) => ({
                      ...previous,
                      profile: { ...(previous.profile || {}), ...Object.fromEntries(SOCIAL_FIELDS.map(({ key }) => [key, ""])) }
                    }))}
                  >
                    Clear fields
                  </button>
                </div>
              </form>
            </Panel>

            <Panel title="Public profile checklist" icon={ShieldCheck}>
              <p className="muted-note">These are links only. This dashboard does not sign in to social platforms or import their private data.</p>
              <div className="social-checklist">
                {SOCIAL_FIELDS.map(({ key, label }) => {
                  const value = String(safeDraft.profile[key] || "").trim();
                  const valid = value && isValidHttpUrl(value);
                  return (
                    <div className="connection-row" key={key}>
                      <span>{label}</span>
                      <b className={valid ? "social-connected" : value ? "social-invalid" : "social-empty"}>
                        {valid ? "Link added" : value ? "Check URL" : "Not added"}
                      </b>
                    </div>
                  );
                })}
              </div>
              <p className="muted-note">
                After saving, your public pages must render these profile fields to display every icon. GitHub, LinkedIn and LeetCode are already used by the current Home hero.
              </p>
            </Panel>
          </div>
        )}

        {tab === "analytics" && (
          <div className="admin-content-grid">
            <Panel
              title="Portfolio traffic"
              icon={BarChart3}
              action={
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              }
            >
              <div className="analytics-summary">
                <div>
                  <b>{filteredVisits.length}</b>
                  <span>Page views in range</span>
                </div>
                <div>
                  <b>{visitCount}</b>
                  <span>Tracked page views</span>
                </div>
                <div>
                  <b>{analytics.projectClicks.length}</b>
                  <span>Project clicks</span>
                </div>
              </div>

              {analyticsLoading && <p className="muted-note">Loading analytics...</p>}

              <p className="muted-note">
                Visitor tracking starts after you deploy the site with the
                portfolio_events table configured. Counts are event totals,
                not unique people.
              </p>
            </Panel>

            <Panel title="Popular projects" icon={FolderKanban}>
              {projectClickCounts.length ? (
                projectClickCounts.map(([name, count]) => (
                  <div className="admin-list-row" key={name}>
                    <b>{name}</b>
                    <strong>{count} clicks</strong>
                  </div>
                ))
              ) : (
                <p className="empty-copy">No project click events recorded yet.</p>
              )}
            </Panel>

            <Panel title="Recent visitor events" icon={Activity}>
              <div className="admin-item-list">
                {filteredVisits.slice(0, 15).map((item) => (
                  <div className="admin-list-row" key={item.id}>
                    <span>
                      <b>{item.page_path || "Page view"}</b>
                      <small>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "Unknown date"}
                      </small>
                    </span>
                    <small>
                      {item.referrer
                        ? (() => {
                            try {
                              return new URL(item.referrer).hostname;
                            } catch {
                              return "Unknown source";
                            }
                          })()
                        : "Direct"}
                    </small>
                  </div>
                ))}

                {!filteredVisits.length && !analyticsLoading && (
                  <p className="empty-copy">No visitor events in this date range.</p>
                )}
              </div>
            </Panel>

            <Panel title="Analytics setup" icon={ShieldCheck}>
              <p className="muted-note">
                Run the updated Supabase schema to create event tracking.
                Analytics avoids collecting names, email addresses or raw IP addresses.
              </p>
            </Panel>
          </div>
        )}

        {tab === "goals" && (
          <div className="admin-content-grid">
            <Panel title="Add goal / milestone" icon={Target}>
              <form className="admin-form" onSubmit={addGoal}>
                <Field label="Goal title" wide>
                  <TextInput value={forms.goal.title} onChange={(v) => setForm("goal", { ...forms.goal, title: v })} required placeholder="Solve 150 DSA problems" />
                </Field>

                <Field label="Current progress">
                  <TextInput type="number" min="0" value={forms.goal.current} onChange={(v) => setForm("goal", { ...forms.goal, current: v })} />
                </Field>

                <Field label="Target">
                  <TextInput type="number" min="1" value={forms.goal.target} onChange={(v) => setForm("goal", { ...forms.goal, target: v })} />
                </Field>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Add goal
                </button>
              </form>

              <div className="admin-separator" />

              {safeDraft.goals.map((goal) => (
                <div className="goal-editor" key={goal.id}>
                  <div>
                    <b>{goal.title}</b>
                    <span>{goal.current} / {goal.target}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, Number(goal.target) || 1)}
                    value={Math.min(Number(goal.current) || 0, Math.max(1, Number(goal.target) || 1))}
                    onChange={(e) => setDraft({
                      ...draft,
                      goals: safeDraft.goals.map((item) =>
                        item.id === goal.id
                          ? { ...item, current: Number(e.target.value) }
                          : item
                      )
                    })}
                  />

                  <button className="icon-danger" type="button" onClick={() => setDraft({
                    ...draft,
                    goals: safeDraft.goals.filter((item) => item.id !== goal.id)
                  })}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button className="button button-primary" type="button" onClick={() => publish()} disabled={busy}>
                <Save size={15} /> Save goal progress
              </button>
            </Panel>

            <Panel title="Personal notes" icon={StickyNote}>
              <form className="admin-form" onSubmit={addNote}>
                <Field label="Note title">
                  <TextInput value={forms.note.title} onChange={(v) => setForm("note", { ...forms.note, title: v })} required />
                </Field>

                <Field label="Note details" wide>
                  <TextArea value={forms.note.body} onChange={(v) => setForm("note", { ...forms.note, body: v })} required />
                </Field>

                <label className="check-field">
                  <input type="checkbox" checked={forms.note.pinned} onChange={(e) => setForm("note", { ...forms.note, pinned: e.target.checked })} />
                  Pin note
                </label>

                <button className="button button-primary" disabled={busy}>
                  <Plus size={15} /> Save note
                </button>
              </form>

              {safeDraft.notes.map((note) => (
                <div className="note-card" key={note.id}>
                  <div>
                    <b>{note.title}</b>
                    {note.pinned && <span className="pinned-label">PINNED</span>}
                  </div>
                  <p>{note.body}</p>
                  <button className="icon-danger" type="button" onClick={() => removeItem("notes", note.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </Panel>
          </div>
        )}

        {tab === "system" && (
          <div className="admin-content-grid">
            <Panel title="Backup & export" icon={Download}>
              <p className="muted-note">
                Export your entire portfolio content as JSON. Keep a copy before making major edits.
              </p>

              <div className="system-actions">
                <button className="button button-primary" type="button" onClick={exportBackup}>
                  <Download size={15} /> Export full JSON backup
                </button>

                <button className="button button-ghost" type="button" onClick={exportCsv}>
                  <Download size={15} /> Export DSA CSV
                </button>
              </div>

              <Field label="Import JSON backup">
                <textarea
                  rows="7"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste a previously exported JSON backup here..."
                />
              </Field>

              <button className="button button-ghost" type="button" onClick={importBackup} disabled={busy}>
                <UploadCloud size={15} /> Validate & import backup
              </button>
            </Panel>

            <Panel title="Account security" icon={KeyRound}>
              <form className="admin-form" onSubmit={changePassword}>
                <Field label="New password" wide>
                  <input
                    name="password"
                    type="password"
                    minLength="8"
                    required
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </Field>

                <button className="button button-primary">
                  <KeyRound size={15} /> Update password
                </button>
              </form>

              <p className="muted-note">
                This updates the password of your currently authenticated Supabase account.
              </p>
            </Panel>

            <Panel title="Portfolio settings" icon={Settings}>
              <form
                className="admin-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  publish(draft, "System settings saved.");
                }}
              >
                <Field label="Portfolio title" wide>
                  <input
                    value={safeDraft.settings.portfolioTitle || ""}
                    onChange={(e) => setDraft({
                      ...draft,
                      settings: {
                        ...safeDraft.settings,
                        portfolioTitle: e.target.value
                      }
                    })}
                  />
                </Field>

                {[
                  ["publicEmail", "Show email on public portfolio"],
                  ["showDsaStats", "Show DSA stats"],
                  ["showCertificates", "Show certificates"],
                  ["maintenanceMode", "Maintenance mode (flag only)"]
                ].map(([key, label]) => (
                  <label className="check-field" key={key}>
                    <input
                      type="checkbox"
                      checked={Boolean(safeDraft.settings[key])}
                      onChange={(e) => setDraft({
                        ...draft,
                        settings: {
                          ...safeDraft.settings,
                          [key]: e.target.checked
                        }
                      })}
                    />
                    {label}
                  </label>
                ))}

                <button className="button button-primary" disabled={busy}>
                  <Save size={15} /> Save settings
                </button>
              </form>
            </Panel>

            <Panel title="Connection status" icon={ShieldCheck}>
              <div className="connection-row">
                <span>Database</span>
                <b>{isCloud ? "Supabase connected" : "Local browser storage"}</b>
              </div>

              <div className="connection-row">
                <span>Authenticated user</span>
                <b>{session.user?.email || "Unknown"}</b>
              </div>

              <div className="connection-row">
                <span>Storage uploads</span>
                <b>{isCloud ? "Available after bucket setup" : "Not configured"}</b>
              </div>

              <button className="button button-ghost" type="button" onClick={logout}>
                <LogOut size={15} /> Sign out
              </button>
            </Panel>
          </div>
        )}

        <footer className="admin-footer">
          APS Portfolio Studio ·{" "}
          {isCloud
            ? "Supabase cloud publishing enabled"
            : "Local preview mode — configure Supabase before public deployment"}
        </footer>
      </main>
      </div>
    </>
  );
}
