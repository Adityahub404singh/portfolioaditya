import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.section
      className="page-section container not-found"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="eyebrow"><i /> 404 / NOT FOUND</span>
      <p className="hero-handwrite">Looks like a detour.</p>
      <h1>This page took<br /><em>a wrong turn.</em></h1>
      <p className="muted-note">The page may have moved, or the link may be incorrect.</p>
      <Link className="button button-primary" to="/"><Home size={16} /> Back to home</Link>
    </motion.section>
  );
}
