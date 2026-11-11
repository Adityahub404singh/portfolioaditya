import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Download, Pause, Play, ArrowUpRight } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { useMotionPreference } from "../hooks/MotionPreference";

const links = [
  ["Home", "/"], ["About", "/about"], ["Projects", "/projects"],
  ["Journey", "/journey"], ["Contact", "/contact"]
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { content } = usePortfolio();
  const { enabled, toggle } = useMotionPreference();
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">APS<span>.</span></span>
          <span className="brand-copy"><strong>{content.profile.name}</strong><small>DEVELOPER · BUILDER · LEARNER</small></span>
        </Link>
        <div className="header-tools">
          <button className="motion-toggle" onClick={toggle} aria-pressed={!enabled} aria-label={enabled ? "Turn motion off" : "Turn motion on"}>
            {enabled ? <Pause size={13}/> : <Play size={13}/>}<span>Motion {enabled ? "ON" : "OFF"}</span>
          </button>
          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
          <a className="resume-link" href={content.profile.resumeUrl} target="_blank" rel="noreferrer">
            <Download size={15}/> Resume <ArrowUpRight size={13}/>
          </a>
        </nav>
      </div>
    </header>
  );
}
