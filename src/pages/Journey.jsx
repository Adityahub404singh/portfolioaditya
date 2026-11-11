
import { useMemo } from "react";

import {
  Code2,
  Trophy,
  Award,
  CalendarDays,
  ExternalLink,
  Target,
  Flame,
  TrendingUp,
  Medal,
  BookOpen,
  Github,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Zap,
  GraduationCap,
  Clock3,
  Activity,
  Layers3,
} from "lucide-react";

import { motion, useReducedMotion } from "framer-motion";

import SectionHeading from "../components/SectionHeading";
import { usePortfolio } from "../hooks/usePortfolio";

// ======================================================
// ANIMATION CONFIGURATION
// ======================================================

const reveal = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ======================================================
// REUSABLE SECTION HEADING
// ======================================================

function PanelHeading({ icon: Icon, title, label, action }) {
  return (
    <div className="journey-panel-heading">

      <div className="journey-panel-heading-left">

        <div className="journey-panel-icon">
          <Icon size={19} />
        </div>

        <div>
          <h3>{title}</h3>
          {label && <span>{label}</span>}
        </div>

      </div>

      {action && (
        <div className="journey-panel-action">
          {action}
        </div>
      )}

    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function JourneyStat({
  icon: Icon,
  label,
  value,
  description,
  accent = "red",
}) {
  return (
    <motion.div
      className={`journey-stat-card accent-${accent}`}
      variants={reveal}
    >

      <div className="journey-stat-top">

        <div className="journey-stat-icon">
          <Icon size={19} />
        </div>

        <TrendingUp size={16} className="journey-stat-trend" />

      </div>

      <div className="journey-stat-value">
        {value}
      </div>

      <div className="journey-stat-label">
        {label}
      </div>

      <div className="journey-stat-description">
        {description}
      </div>

    </motion.div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="journey-empty-state">

      <div className="journey-empty-icon">
        <Icon size={25} />
      </div>

      <h4>{title}</h4>

      <p>{description}</p>

    </div>
  );
}

// ======================================================
// MAIN JOURNEY PAGE
// ======================================================

export default function Journey() {
  const { content } = usePortfolio();

  const prefersReducedMotion = useReducedMotion();

  // ====================================================
  // SAFE DATA
  // ====================================================

  const profile = content?.profile || {};

  const dsa = Array.isArray(content?.dsa)
    ? content.dsa
    : [];

  const timeline = Array.isArray(content?.timeline)
    ? content.timeline
    : [];

  const certificates = Array.isArray(content?.certificates)
    ? content.certificates
    : [];

  const achievements = Array.isArray(content?.achievements)
    ? content.achievements
    : [];

  const updates = Array.isArray(content?.dailyUpdates)
    ? content.dailyUpdates
    : [];

  const leetcode = content?.leetcode || {};

  // ====================================================
  // DSA STATISTICS
  // ====================================================

  const easy = dsa.filter(
    (item) =>
      String(item.difficulty || "").toLowerCase() === "easy"
  ).length;

  const medium = dsa.filter(
    (item) =>
      String(item.difficulty || "").toLowerCase() === "medium"
  ).length;

  const hard = dsa.filter(
    (item) =>
      String(item.difficulty || "").toLowerCase() === "hard"
  ).length;

  const solved = dsa.length;

  const difficultyStats = [
    {
      name: "Easy",
      count: easy,
      color: "#22c55e",
      percentage: solved ? (easy / solved) * 100 : 0,
    },
    {
      name: "Medium",
      count: medium,
      color: "#f59e0b",
      percentage: solved ? (medium / solved) * 100 : 0,
    },
    {
      name: "Hard",
      count: hard,
      color: "#ef4444",
      percentage: solved ? (hard / solved) * 100 : 0,
    },
  ];

  // ====================================================
  // TIMELINE SORTING
  // ====================================================

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => {
      return String(a.date || "").localeCompare(
        String(b.date || "")
      );
    });
  }, [timeline]);

  // ====================================================
  // LEETCODE DATA
  // ====================================================

  const rating = leetcode.rating || "—";

  const streak = Number(leetcode.streak) || 0;

  const leetcodeUsername = leetcode.username || "";

  const leetcodeUrl = profile.leetcode
    ? profile.leetcode
    : leetcodeUsername
      ? `https://leetcode.com/u/${encodeURIComponent(leetcodeUsername)}/`
      : null;

  // ====================================================
  // ANIMATION SETTINGS
  // ====================================================

  const animationTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: "easeOut" };

  return (
    <>
      {/* =================================================
          JOURNEY PAGE STYLES
      ================================================= */}

      <style>{`

        .journey-premium {
          position: relative;
          isolation: isolate;
          padding-bottom: 100px;
          overflow: hidden;
        }

        .journey-premium *,
        .journey-premium *::before,
        .journey-premium *::after {
          box-sizing: border-box;
        }

        .journey-premium::before {
          content: "";
          position: absolute;
          top: 120px;
          left: -260px;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: rgba(220,38,38,0.055);
          filter: blur(110px);
          z-index: -1;
          pointer-events: none;
        }

        .journey-premium::after {
          content: "";
          position: absolute;
          right: -280px;
          top: 650px;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: rgba(153,27,27,0.06);
          filter: blur(120px);
          z-index: -1;
          pointer-events: none;
        }

        /* COMMON PANEL */

        .journey-premium .panel {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(25,25,25,0.97),
              rgba(12,12,12,0.97)
            );
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 21px;
          box-shadow:
            0 20px 55px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.035);
          transition:
            border-color 0.3s ease,
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .journey-premium .panel:hover {
          border-color: rgba(239,68,68,0.3);
          box-shadow:
            0 25px 65px rgba(0,0,0,0.28),
            0 0 30px rgba(220,38,38,0.045);
          transform: translateY(-4px);
        }

        /* TOP STATS */

        .journey-premium .journey-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin: 38px 0 25px;
        }

        .journey-premium .journey-stat-card {
          position: relative;
          overflow: hidden;
          padding: 23px;
          min-width: 0;
          background: linear-gradient(
            145deg,
            rgba(26,26,26,0.98),
            rgba(12,12,12,0.98)
          );
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          transition: all 0.3s ease;
        }

        .journey-premium .journey-stat-card::after {
          content: "";
          position: absolute;
          right: -35px;
          bottom: -50px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(239,68,68,0.08);
          filter: blur(25px);
          pointer-events: none;
        }

        .journey-premium .journey-stat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(239,68,68,0.4);
        }

        .journey-premium .journey-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .journey-premium .journey-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.17);
          border-radius: 12px;
        }

        .journey-premium .accent-green .journey-stat-icon {
          color: #4ade80;
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.17);
        }

        .journey-premium .accent-gold .journey-stat-icon {
          color: #fbbf24;
          background: rgba(245,158,11,0.1);
          border-color: rgba(245,158,11,0.17);
        }

        .journey-premium .journey-stat-trend {
          color: #555;
        }

        .journey-premium .journey-stat-value {
          margin-top: 22px;
          color: #fff;
          font-size: clamp(27px, 3vw, 37px);
          font-weight: 850;
          letter-spacing: -1.7px;
          overflow-wrap: anywhere;
        }

        .journey-premium .journey-stat-label {
          margin-top: 5px;
          color: #ddd;
          font-size: 13px;
          font-weight: 700;
        }

        .journey-premium .journey-stat-description {
          margin-top: 7px;
          color: #777;
          font-size: 11px;
          line-height: 1.6;
        }

        /* MAIN DASHBOARD GRID */

        .journey-premium .journey-dashboard {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .journey-premium .journey-dashboard > .panel {
          padding: 27px;
          min-width: 0;
        }

        /* PANEL HEADING */

        .journey-premium .journey-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .journey-premium .journey-panel-heading-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .journey-premium .journey-panel-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          color: #f87171;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 12px;
        }

        .journey-premium .journey-panel-heading h3 {
          margin: 0;
          color: #f2f2f2;
          font-size: 15px;
          font-weight: 800;
        }

        .journey-premium .journey-panel-heading span {
          display: block;
          margin-top: 4px;
          color: #777;
          font-size: 10px;
        }

        .journey-premium .journey-panel-action a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #f87171;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .journey-premium .journey-panel-action a:hover {
          color: #fff;
        }

        /* DSA OVERVIEW */

        .journey-premium .dsa-overview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
        }

        .journey-premium .dsa-total {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .journey-premium .dsa-total strong {
          color: #fff;
          font-size: 43px;
          font-weight: 850;
          letter-spacing: -2px;
          line-height: 1;
        }

        .journey-premium .dsa-total span {
          color: #888;
          font-size: 11px;
        }

        .journey-premium .dsa-total-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f87171;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .journey-premium .dsa-circle {
          display: grid;
          place-items: center;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 50%;
          background: conic-gradient(
            #22c55e 0% 33%,
            #f59e0b 33% 70%,
            #ef4444 70% 100%
          );
          position: relative;
        }

        .journey-premium .dsa-circle::before {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: #151515;
        }

        .journey-premium .dsa-circle-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .journey-premium .dsa-circle-inner strong {
          color: #fff;
          font-size: 23px;
          font-weight: 850;
        }

        .journey-premium .dsa-circle-inner small {
          color: #777;
          font-size: 9px;
        }

        /* DIFFICULTY */

        .journey-premium .difficulty-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
          margin-top: 20px;
        }

        .journey-premium .difficulty-item {
          padding: 15px 12px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 13px;
        }

        .journey-premium .difficulty-item strong {
          display: block;
          color: #fff;
          font-size: 23px;
          font-weight: 850;
        }

        .journey-premium .difficulty-item span {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          font-weight: 700;
        }

        .journey-premium .difficulty-item.easy span {
          color: #4ade80;
        }

        .journey-premium .difficulty-item.medium span {
          color: #fbbf24;
        }

        .journey-premium .difficulty-item.hard span {
          color: #f87171;
        }

        .journey-premium .difficulty-track {
          height: 5px;
          margin-top: 11px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
        }

        .journey-premium .difficulty-fill {
          height: 100%;
          border-radius: inherit;
          transition: width 0.6s ease;
        }

        .journey-premium .difficulty-item.easy .difficulty-fill {
          background: #22c55e;
        }

        .journey-premium .difficulty-item.medium .difficulty-fill {
          background: #f59e0b;
        }

        .journey-premium .difficulty-item.hard .difficulty-fill {
          background: #ef4444;
        }

        /* TIMELINE */

        .journey-premium .journey-timeline {
          position: relative;
          padding-left: 9px;
        }

        .journey-premium .timeline-item {
          position: relative;
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 16px;
          padding: 0 0 27px 22px;
          border-left: 1px solid rgba(239,68,68,0.25);
        }

        .journey-premium .timeline-item:last-child {
          padding-bottom: 0;
          border-left-color: transparent;
        }

        .journey-premium .timeline-item::before {
          content: "";
          position: absolute;
          top: 4px;
          left: -5px;
          width: 9px;
          height: 9px;
          background: #ef4444;
          border: 2px solid #171717;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(239,68,68,0.45);
        }

        .journey-premium .timeline-date {
          color: #f87171;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .journey-premium .timeline-content h4 {
          margin: 0;
          color: #eee;
          font-size: 13px;
          font-weight: 750;
        }

        .journey-premium .timeline-content p {
          margin: 7px 0 0;
          color: #888;
          font-size: 11px;
          line-height: 1.8;
        }

        /* CERTIFICATES AND ACHIEVEMENTS */

        .journey-premium .journey-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .journey-premium .journey-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px;
          min-width: 0;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 13px;
          transition: all 0.25s ease;
        }

        .journey-premium .journey-list-item:hover {
          background: rgba(239,68,68,0.045);
          border-color: rgba(239,68,68,0.2);
          transform: translateX(4px);
        }

        .journey-premium .journey-list-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .journey-premium .journey-list-content strong {
          color: #eee;
          font-size: 12px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .journey-premium .journey-list-content small {
          color: #777;
          font-size: 10px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .journey-premium .journey-list-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          color: #f87171;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .journey-premium .journey-list-link:hover {
          color: #fff;
          background: #dc2626;
        }

        /* EMPTY STATE */

        .journey-premium .journey-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 185px;
          padding: 25px;
          text-align: center;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 15px;
        }

        .journey-premium .journey-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 47px;
          height: 47px;
          color: #f87171;
          background: rgba(239,68,68,0.09);
          border-radius: 14px;
        }

        .journey-premium .journey-empty-state h4 {
          margin: 14px 0 6px;
          color: #ddd;
          font-size: 13px;
        }

        .journey-premium .journey-empty-state p {
          max-width: 270px;
          margin: 0;
          color: #777;
          font-size: 11px;
          line-height: 1.8;
        }

        /* EXTRA GRID */

        .journey-premium .journey-extra-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 20px;
          margin-top: 20px;
        }

        .journey-premium .journey-extra-panel {
          padding: 27px;
          min-width: 0;
        }

        /* LEETCODE METRICS */

        .journey-premium .journey-metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .journey-premium .journey-metric-row span {
          color: #929292;
          font-size: 12px;
        }

        .journey-premium .journey-metric-row strong {
          color: #fff;
          font-size: 17px;
          font-weight: 800;
        }

        .journey-premium .journey-profile-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 11px 15px;
          color: #f87171;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 11px;
          font-size: 11px;
          font-weight: 750;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .journey-premium .journey-profile-link:hover {
          color: #fff;
          background: #dc2626;
        }

        /* DAILY LOG */

        .journey-premium .journey-update-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 13px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255,255,255,0.065);
        }

        .journey-premium .journey-update-item:first-child {
          padding-top: 0;
        }

        .journey-premium .journey-update-item:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .journey-premium .journey-update-content {
          min-width: 0;
        }

        .journey-premium .journey-update-content strong {
          display: block;
          color: #eee;
          font-size: 12px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .journey-premium .journey-update-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
          color: #f87171;
          font-size: 10px;
        }

        .journey-premium .journey-update-content p {
          margin: 8px 0 0;
          color: #858585;
          font-size: 11px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .journey-premium .journey-update-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          color: #f87171;
          background: rgba(239,68,68,0.08);
          border-radius: 9px;
          text-decoration: none;
        }

        /* FOOTER NOTE */

        .journey-premium .journey-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 35px;
          color: #777;
          font-size: 11px;
          text-align: center;
          line-height: 1.7;
        }

        .journey-premium .journey-note svg {
          flex-shrink: 0;
          color: #f87171;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .journey-premium .journey-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 850px) {
          .journey-premium .journey-dashboard,
          .journey-premium .journey-extra-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 550px) {
          .journey-premium {
            padding-bottom: 65px;
          }

          .journey-premium .journey-stats-grid {
            gap: 11px;
            margin-top: 27px;
          }

          .journey-premium .journey-stat-card {
            padding: 16px;
            border-radius: 15px;
          }

          .journey-premium .journey-stat-value {
            margin-top: 17px;
            font-size: 29px;
          }

          .journey-premium .journey-stat-description {
            font-size: 10px;
          }

          .journey-premium .journey-dashboard > .panel,
          .journey-premium .journey-extra-panel {
            padding: 19px;
          }

          .journey-premium .dsa-overview {
            padding: 15px;
          }

          .journey-premium .dsa-circle {
            width: 82px;
            height: 82px;
          }

          .journey-premium .dsa-total strong {
            font-size: 36px;
          }

          .journey-premium .difficulty-grid {
            gap: 7px;
          }

          .journey-premium .difficulty-item {
            padding: 12px 9px;
          }

          .journey-premium .timeline-item {
            grid-template-columns: 1fr;
            gap: 5px;
            padding-left: 18px;
          }

          .journey-premium .journey-panel-heading {
            gap: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .journey-premium *,
          .journey-premium *::before,
          .journey-premium *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>

      <section className="page-section container journey-premium">

        {/* =============================================
            PAGE HEADING
        ============================================= */}

        <SectionHeading
          eyebrow="PROGRESS / CREDENTIALS"
          title="The work behind the work."
          description="A transparent log of problem solving, learning milestones, certifications and achievements. Every small step contributes to the bigger picture."
        />

        {/* =============================================
            TOP STATISTICS
        ============================================= */}

        <motion.div
          className="journey-stats-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >

          <JourneyStat
            icon={Code2}
            label="DSA Problems"
            value={solved}
            description="Problems logged in the dashboard"
            accent="red"
          />

          <JourneyStat
            icon={Award}
            label="Certificates"
            value={certificates.length}
            description="Learning and professional credentials"
            accent="gold"
          />

          <JourneyStat
            icon={Trophy}
            label="Achievements"
            value={achievements.length}
            description="Milestones and accomplishments"
            accent="gold"
          />

          <JourneyStat
            icon={Flame}
            label="Current Streak"
            value={`${streak} Days`}
            description="LeetCode streak maintained in admin"
            accent="green"
          />

        </motion.div>

        {/* =============================================
            MAIN DASHBOARD
        ============================================= */}

        <div className="journey-dashboard">

          {/* DSA PANEL */}

          <motion.div
            className="panel dsa-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={Code2}
              title="DSA / LeetCode Progress"
              label="PROBLEM SOLVING OVERVIEW"
              action={
                leetcodeUrl ? (
                  <a
                    href={leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LeetCode
                    <ExternalLink size={13} />
                  </a>
                ) : null
              }
            />

            <div className="dsa-overview">

              <div className="dsa-total">

                <div className="dsa-total-label">
                  <Activity size={13} />
                  TOTAL PROGRESS
                </div>

                <strong>{solved}</strong>

                <span>Problems logged</span>

              </div>

              <div
                className="dsa-circle"
                style={{
                  background: solved
                    ? `conic-gradient(
                        #22c55e 0% ${(easy / solved) * 100}%,
                        #f59e0b ${(easy / solved) * 100}% ${((easy + medium) / solved) * 100}%,
                        #ef4444 ${((easy + medium) / solved) * 100}% 100%
                      )`
                    : "rgba(255,255,255,0.1)",
                }}
                aria-label={`${solved} DSA problems logged`}
              >

                <div className="dsa-circle-inner">
                  <strong>{solved}</strong>
                  <small>LOGGED</small>
                </div>

              </div>

            </div>

            {/* DIFFICULTY BREAKDOWN */}

            <div className="difficulty-grid">

              {difficultyStats.map((item) => (
                <div
                  key={item.name}
                  className={`difficulty-item ${item.name.toLowerCase()}`}
                >

                  <strong>{item.count}</strong>

                  <span>{item.name}</span>

                  <div className="difficulty-track">
                    <div
                      className="difficulty-fill"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                </div>
              ))}

            </div>

            <p className="muted-note">
              <Sparkles size={13} />
              Counts reflect entries added through the private
              admin dashboard.
            </p>

          </motion.div>

          {/* LEARNING TIMELINE */}

          <motion.div
            className="panel timeline-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={CalendarDays}
              title="Learning Timeline"
              label="MILESTONES & EXPERIENCES"
            />

            {sortedTimeline.length > 0 ? (

              <div className="journey-timeline">

                {sortedTimeline.map((item, index) => (
                  <div
                    className="timeline-item"
                    key={item.id || `${item.title}-${index}`}
                  >

                    <span className="timeline-date">
                      {item.date || "Date not specified"}
                    </span>

                    <div className="timeline-content">

                      <h4>{item.title || "Learning milestone"}</h4>

                      <p>
                        {item.detail || "More details coming soon."}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

            ) : (

              <EmptyState
                icon={CalendarDays}
                title="Journey is just getting started"
                description="Learning milestones and experiences will appear here when added through Admin."
              />

            )}

          </motion.div>

          {/* CERTIFICATES */}

          <motion.div
            className="panel credential-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={Award}
              title="Certificates"
              label={`${certificates.length} CREDENTIALS`}
            />

            {certificates.length > 0 ? (

              <div className="journey-list">

                {certificates.map((item, index) => (
                  <div
                    className="journey-list-item"
                    key={item.id || `${item.title}-${index}`}
                  >

                    <div className="journey-list-content">

                      <strong>
                        {item.title || "Untitled Certificate"}
                      </strong>

                      <small>
                        {item.issuer || "Issuer not specified"}
                        {item.date ? ` · ${item.date}` : ""}
                      </small>

                    </div>

                    {item.url && (
                      <a
                        href={item.url}
                        className="journey-list-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${item.title || "certificate"}`}
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}

                  </div>
                ))}

              </div>

            ) : (

              <EmptyState
                icon={GraduationCap}
                title="No certificates yet"
                description="Certificates will automatically appear here when added in Admin."
              />

            )}

          </motion.div>

          {/* ACHIEVEMENTS */}

          <motion.div
            className="panel achievement-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={Trophy}
              title="Achievements"
              label={`${achievements.length} MILESTONES`}
            />

            {achievements.length > 0 ? (

              <div className="journey-list">

                {achievements.map((item, index) => (
                  <div
                    className="journey-list-item"
                    key={item.id || `${item.title}-${index}`}
                  >

                    <div className="journey-list-content">

                      <strong>
                        {item.title || "Achievement"}
                      </strong>

                      <small>
                        {item.detail || ""}
                        {item.date ? ` · ${item.date}` : ""}
                      </small>

                    </div>

                    <div className="journey-list-link">
                      <Medal size={17} />
                    </div>

                  </div>
                ))}

              </div>

            ) : (

              <EmptyState
                icon={Trophy}
                title="Achievements coming soon"
                description="Your accomplishments and milestones will be showcased here."
              />

            )}

          </motion.div>

        </div>

        {/* =============================================
            EXTRA INFORMATION
        ============================================= */}

        <div className="journey-extra-grid">

          {/* LEETCODE SNAPSHOT */}

          <motion.div
            className="panel journey-extra-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={Target}
              title="LeetCode Snapshot"
              label="CODING PROFILE"
            />

            <div className="journey-metric-row">
              <span>Contest Rating</span>
              <strong>{rating}</strong>
            </div>

            <div className="journey-metric-row">
              <span>Current Streak</span>
              <strong>{streak} Days</strong>
            </div>

            <div className="journey-metric-row">
              <span>Problems Logged</span>
              <strong>{solved}</strong>
            </div>

            {leetcodeUrl && (
              <a
                className="journey-profile-link"
                href={leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View LeetCode Profile
                <ArrowUpRight size={15} />
              </a>
            )}

            <p className="muted-note">
              <Activity size={13} />
              Metrics are maintained through the private admin dashboard.
            </p>

          </motion.div>

          {/* DAILY BUILD LOG */}

          <motion.div
            className="panel journey-extra-panel"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={animationTransition}
          >

            <PanelHeading
              icon={CalendarDays}
              title="Daily Build Log"
              label="RECENT LEARNING & DEVELOPMENT"
            />

            {updates.length > 0 ? (

              <div>

                {updates.slice(0, 5).map((item, index) => (
                  <div
                    className="journey-update-item"
                    key={item.id || `${item.title}-${index}`}
                  >

                    <div className="journey-update-content">

                      <strong>
                        {item.title || "Development update"}
                      </strong>

                      <div className="journey-update-meta">

                        {item.date && (
                          <span>{item.date}</span>
                        )}

                        {item.category && (
                          <span>· {item.category}</span>
                        )}

                      </div>

                      {item.detail && (
                        <p>{item.detail}</p>
                      )}

                    </div>

                    {item.githubUrl && (
                      <a
                        className="journey-update-link"
                        href={item.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source code"
                      >
                        <Github size={16} />
                      </a>
                    )}

                  </div>
                ))}

              </div>

            ) : (

              <EmptyState
                icon={BookOpen}
                title="No build updates yet"
                description="Your recent projects, learning activities and development updates will appear here."
              />

            )}

          </motion.div>

        </div>

        {/* =============================================
            CLOSING MESSAGE
        ============================================= */}

        <div className="journey-note">
          <Zap size={15} />
          <span>
            Consistency over perfection. Every line of code
            is another step forward.
          </span>
        </div>

      </section>
    </>
  );
}
