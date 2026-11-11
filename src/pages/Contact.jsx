
import { useState, useRef } from "react";

import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  MessageCircle,
  Sparkles,
  Clock3,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Globe,
  Zap,
  MoveUpRight,
} from "lucide-react";

import { motion, useReducedMotion } from "framer-motion";

import SectionHeading from "../components/SectionHeading";
import { usePortfolio } from "../hooks/usePortfolio";

// ======================================================
// FORMSPREE CONFIGURATION
// ======================================================

const CONTACT_ENDPOINT = "https://formspree.io/f/xqerkanb";

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

// ======================================================
// ANIMATION CONFIGURATION
// ======================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// ======================================================
// MAIN CONTACT COMPONENT
// ======================================================

export default function Contact() {
  const { content } = usePortfolio();

  const p = content?.profile || {};

  const prefersReducedMotion = useReducedMotion();

  const formRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [status, setStatus] = useState("idle");

  const [feedback, setFeedback] = useState("");

  const [copied, setCopied] = useState(false);

  const isSending = status === "sending";

  const email = p.email || "";

  // ====================================================
  // PROFILE LINKS
  // ====================================================

  const socialLinks = [
    {
      name: "GitHub",
      url: p.github,
      icon: Github,
      description: "Explore my code",
    },
    {
      name: "LinkedIn",
      url: p.linkedin,
      icon: Linkedin,
      description: "Connect professionally",
    },
  ].filter((item) => item.url);

  // ====================================================
  // FORM INPUT HANDLER
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setFeedback("");
    }
  };

  // ====================================================
  // COPY EMAIL
  // ====================================================

  const handleCopyEmail = async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  // ====================================================
  // FORM VALIDATION
  // ====================================================

  const validateForm = () => {
    const name = formData.name.trim();
    const userEmail = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !userEmail || !subject || !message) {
      return "Please complete all fields before sending.";
    }

    if (name.length < 2) {
      return "Please enter a valid name.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(userEmail)) {
      return "Please enter a valid email address.";
    }

    if (message.length < 10) {
      return "Your message should contain at least 10 characters.";
    }

    return null;
  };

  // ====================================================
  // FORM SUBMISSION
  // ====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSending) return;

    const validationError = validateForm();

    if (validationError) {
      setStatus("error");
      setFeedback(validationError);
      return;
    }

    setStatus("sending");
    setFeedback("");

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const payload = new FormData();

      payload.append("name", formData.name.trim());

      payload.append("email", formData.email.trim());

      payload.append("subject", formData.subject.trim());

      payload.append("message", formData.message.trim());

      payload.append("_replyto", formData.email.trim());

      payload.append(
        "_subject",
        `New Portfolio Message: ${formData.subject.trim()}`
      );

      // Honeypot field for basic spam protection.
      // Real users should leave this empty.
      const honeypot = formRef.current?.elements.namedItem("_gotcha");

      if (honeypot?.value) {
        setStatus("success");
        setFeedback("Thank you! Your message has been received.");
        setFormData(INITIAL_FORM);
        formRef.current?.reset();
        return;
      }

      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMessage =
          result?.errors?.map((item) => item.message).join(", ");

        throw new Error(
          serverMessage ||
          "Unable to send your message. Please try again."
        );
      }

      setStatus("success");

      setFeedback(
        "Your message has been sent successfully! Thank you for reaching out. I'll get back to you soon."
      );

      setFormData(INITIAL_FORM);

      formRef.current?.reset();

    } catch (error) {
      setStatus("error");

      if (error.name === "AbortError") {
        setFeedback(
          "The request took too long. Please check your internet connection and try again."
        );
      } else {
        setFeedback(
          error.message ||
          "Something went wrong. Please try again or contact me directly."
        );
      }

    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  // ====================================================
  // MOTION SETTINGS
  // ====================================================

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.65, ease: "easeOut" };

  return (
    <>
      {/* =================================================
          CONTACT PAGE STYLES
      ================================================= */}

      <style>{`

        .contact-premium {
          position: relative;
          isolation: isolate;
          padding-bottom: 100px;
          overflow: hidden;
        }

        .contact-premium *,
        .contact-premium *::before,
        .contact-premium *::after {
          box-sizing: border-box;
        }

        .contact-premium::before {
          content: "";
          position: absolute;
          width: 550px;
          height: 550px;
          top: 120px;
          left: -280px;
          border-radius: 50%;
          background: rgba(220,38,38,0.055);
          filter: blur(100px);
          pointer-events: none;
          z-index: -1;
        }

        .contact-premium::after {
          content: "";
          position: absolute;
          width: 450px;
          height: 450px;
          right: -250px;
          bottom: 100px;
          border-radius: 50%;
          background: rgba(127,29,29,0.08);
          filter: blur(100px);
          pointer-events: none;
          z-index: -1;
        }

        .contact-premium .contact-layout {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          align-items: stretch;
          gap: 26px;
          margin-top: 45px;
          perspective: 1400px;
        }

        /* LEFT CARD */

        .contact-premium .contact-info-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
          padding: 38px;
          border-radius: 25px;
          background:
            radial-gradient(
              circle at 15% 5%,
              rgba(220,38,38,0.15),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              rgba(27,27,27,0.98),
              rgba(12,12,12,0.98)
            );
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 25px 70px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.055);
          transition:
            border-color 0.4s ease,
            transform 0.4s ease,
            box-shadow 0.4s ease;
        }

        .contact-premium .contact-info-card:hover {
          border-color: rgba(239,68,68,0.35);
          box-shadow:
            0 30px 85px rgba(0,0,0,0.4),
            0 0 35px rgba(220,38,38,0.07);
          transform: translateY(-5px);
        }

        .contact-premium .contact-info-card::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          right: -150px;
          top: -150px;
          border-radius: 50%;
          border: 1px solid rgba(239,68,68,0.16);
          box-shadow:
            0 0 0 30px rgba(239,68,68,0.025),
            0 0 0 60px rgba(239,68,68,0.018);
          pointer-events: none;
        }

        .contact-premium .contact-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          color: #f87171;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .contact-premium .contact-eyebrow-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 12px rgba(239,68,68,0.8);
        }

        .contact-premium .contact-info-title {
          margin: 28px 0 15px;
          color: #fff;
          font-size: clamp(30px, 3vw, 43px);
          font-weight: 800;
          letter-spacing: -1.8px;
          line-height: 1.16;
        }

        .contact-premium .contact-info-title em {
          color: #ef4444;
          font-style: normal;
        }

        .contact-premium .contact-info-description {
          max-width: 440px;
          margin: 0 0 32px;
          color: #999;
          font-size: 14px;
          line-height: 1.9;
        }

        /* AVAILABILITY */

        .contact-premium .contact-availability {
          display: flex;
          align-items: center;
          gap: 12px;
          width: fit-content;
          padding: 11px 15px;
          margin-bottom: 28px;
          border-radius: 30px;
          background: rgba(34,197,94,0.065);
          border: 1px solid rgba(34,197,94,0.18);
        }

        .contact-premium .contact-availability-dot {
          position: relative;
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34,197,94,0.8);
        }

        .contact-premium .contact-availability-dot::after {
          content: "";
          position: absolute;
          inset: -5px;
          border: 1px solid rgba(34,197,94,0.5);
          border-radius: 50%;
          animation: contactPulse 2s infinite;
        }

        @keyframes contactPulse {
          0% {
            transform: scale(0.7);
            opacity: 1;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .contact-premium .contact-availability span {
          color: #b4f2c5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        /* CONTACT DETAILS */

        .contact-premium .contact-details {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .contact-premium .contact-detail {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 15px;
          background: rgba(255,255,255,0.025);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .contact-premium .contact-detail:hover {
          background: rgba(239,68,68,0.065);
          border-color: rgba(239,68,68,0.3);
          transform: translateX(5px);
        }

        .contact-premium .contact-detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          background: rgba(239,68,68,0.09);
        }

        .contact-premium .contact-detail-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .contact-premium .contact-detail-content small {
          color: #777;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .contact-premium .contact-detail-content strong {
          overflow-wrap: anywhere;
          color: #eee;
          font-size: 13px;
          font-weight: 600;
        }

        .contact-premium .contact-detail-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          color: #888;
          background: rgba(255,255,255,0.04);
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .contact-premium .contact-detail-action:hover {
          color: #fff;
          background: #dc2626;
        }

        /* SOCIAL LINKS */

        .contact-premium .contact-social-area {
          margin-top: 30px;
        }

        .contact-premium .contact-social-heading {
          margin-bottom: 13px;
          color: #777;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .contact-premium .contact-socials {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .contact-premium .contact-social-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          color: #c5c5c5;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .contact-premium .contact-social-link:hover {
          color: #fff;
          border-color: rgba(239,68,68,0.45);
          background: rgba(239,68,68,0.1);
          transform: translateY(-4px);
        }

        .contact-premium .contact-social-link svg:first-child {
          color: #f87171;
        }

        /* BOTTOM NOTE */

        .contact-premium .contact-info-note {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: auto;
          padding: 20px 0 0;
        }

        .contact-premium .contact-note-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          color: #f87171;
          border-radius: 11px;
          background: rgba(239,68,68,0.1);
        }

        .contact-premium .contact-info-note span {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .contact-premium .contact-info-note strong {
          color: #ddd;
          font-size: 12px;
        }

        .contact-premium .contact-info-note small {
          color: #777;
          font-size: 11px;
          line-height: 1.7;
        }

        /* RIGHT FORM CARD */

        .contact-premium .contact-form-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          padding: 38px;
          border-radius: 25px;
          background:
            linear-gradient(
              145deg,
              rgba(24,24,24,0.98),
              rgba(13,13,13,0.98)
            );
          border: 1px solid rgba(255,255,255,0.105);
          box-shadow:
            0 25px 70px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .contact-premium .contact-form-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #ef4444,
            #991b1b,
            transparent
          );
        }

        .contact-premium .contact-form-heading {
          margin-bottom: 27px;
        }

        .contact-premium .contact-form-heading .contact-eyebrow {
          margin-bottom: 16px;
        }

        .contact-premium .contact-form-title {
          margin: 0 0 9px;
          color: #fff;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .contact-premium .contact-form-subtitle {
          margin: 0;
          color: #858585;
          font-size: 13px;
          line-height: 1.8;
        }

        /* FORM GRID */

        .contact-premium .contact-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 19px;
        }

        .contact-premium .contact-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
          margin-bottom: 19px;
        }

        .contact-premium .contact-field.full {
          grid-column: 1 / -1;
        }

        .contact-premium .contact-field label {
          color: #d5d5d5;
          font-size: 12px;
          font-weight: 700;
        }

        .contact-premium .contact-field label span {
          color: #ef4444;
        }

        .contact-premium .contact-input {
          width: 100%;
          min-width: 0;
          padding: 15px 16px;
          color: #fff;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.105);
          border-radius: 12px;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .contact-premium .contact-input::placeholder {
          color: #626262;
        }

        .contact-premium .contact-input:hover {
          border-color: rgba(255,255,255,0.2);
        }

        .contact-premium .contact-input:focus {
          border-color: rgba(239,68,68,0.75);
          background: rgba(239,68,68,0.035);
          box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
        }

        .contact-premium textarea.contact-input {
          min-height: 145px;
          resize: vertical;
          line-height: 1.7;
        }

        .contact-premium .contact-character-count {
          display: flex;
          justify-content: flex-end;
          margin-top: -3px;
          color: #666;
          font-size: 10px;
        }

        /* SUBMIT BUTTON */

        .contact-premium .contact-submit {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          width: 100%;
          min-height: 53px;
          margin-top: 3px;
          padding: 14px 20px;
          overflow: hidden;
          color: #fff;
          background: linear-gradient(110deg, #dc2626, #991b1b);
          border: 1px solid rgba(248,113,113,0.4);
          border-radius: 12px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.4px;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(220,38,38,0.17);
          transition: all 0.3s ease;
        }

        .contact-premium .contact-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 13px 35px rgba(220,38,38,0.3);
          background: linear-gradient(110deg, #ef4444, #b91c1c);
        }

        .contact-premium .contact-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .contact-premium .contact-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .contact-premium .contact-submit:focus-visible {
          outline: 2px solid #f87171;
          outline-offset: 4px;
        }

        .contact-premium .contact-spin {
          animation: contactSpin 1s linear infinite;
        }

        @keyframes contactSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* FEEDBACK */

        .contact-premium .contact-feedback {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px;
          margin: 0 0 17px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.7;
        }

        .contact-premium .contact-feedback svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .contact-premium .contact-feedback.success {
          color: #a7f3d0;
          background: rgba(16,185,129,0.09);
          border: 1px solid rgba(16,185,129,0.25);
        }

        .contact-premium .contact-feedback.error {
          color: #fca5a5;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.24);
        }

        /* PRIVACY NOTE */

        .contact-premium .contact-privacy {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 17px;
          color: #777;
          font-size: 10px;
          line-height: 1.7;
        }

        .contact-premium .contact-privacy svg {
          flex-shrink: 0;
          color: #22c55e;
        }

        /* ANIMATION */

        @media (prefers-reduced-motion: no-preference) {
          .contact-premium .contact-info-card,
          .contact-premium .contact-form-card {
            animation: contactAppear 0.8s ease both;
          }

          @keyframes contactAppear {
            from {
              opacity: 0;
              transform: translateY(22px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .contact-premium .contact-layout {
            grid-template-columns: 1fr;
          }

          .contact-premium .contact-info-card {
            min-height: 0;
          }
        }

        @media (max-width: 600px) {
          .contact-premium {
            padding-bottom: 65px;
          }

          .contact-premium .contact-layout {
            gap: 18px;
            margin-top: 28px;
          }

          .contact-premium .contact-info-card,
          .contact-premium .contact-form-card {
            padding: 24px 20px;
            border-radius: 19px;
          }

          .contact-premium .contact-info-title {
            font-size: 32px;
          }

          .contact-premium .contact-form-title {
            font-size: 22px;
          }

          .contact-premium .contact-form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .contact-premium .contact-field.full {
            grid-column: auto;
          }

          .contact-premium .contact-socials {
            gap: 8px;
          }

          .contact-premium .contact-social-link {
            padding: 11px 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-premium *,
          .contact-premium *::before,
          .contact-premium *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>

      <section className="page-section container contact-page contact-premium">

        {/* ===============================================
            SECTION HEADING
        =============================================== */}

        <SectionHeading
          eyebrow="LET'S BUILD SOMETHING"
          title="Have an idea? Let's talk."
          description="I'm open to meaningful projects, internships, collaborations and conversations about technology. Tell me what you're working on."
        />

        <div className="contact-layout">

          {/* =============================================
              LEFT: PERSONAL CONTACT CARD
          ============================================= */}

          <motion.div
            className="contact-info-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={transition}
          >

            <div className="contact-eyebrow">
              <span className="contact-eyebrow-dot" />
              GET IN TOUCH
            </div>

            <h2 className="contact-info-title">
              Good work starts
              <br />
              <em>with a conversation.</em>
            </h2>

            <p className="contact-info-description">
              Have a project idea, an opportunity, or simply want
              to discuss technology? I'd love to hear from you.
              Let's turn your ideas into something meaningful.
            </p>

            {/* AVAILABILITY STATUS */}

            <div className="contact-availability">
              <span className="contact-availability-dot" />
              <span>OPEN TO OPPORTUNITIES</span>
            </div>

            {/* CONTACT INFORMATION */}

            <div className="contact-details">

              {email && (
                <div className="contact-detail">

                  <div className="contact-detail-icon">
                    <Mail size={19} />
                  </div>

                  <div className="contact-detail-content">
                    <small>EMAIL ADDRESS</small>
                    <strong>{email}</strong>
                  </div>

                  <button
                    type="button"
                    className="contact-detail-action"
                    onClick={handleCopyEmail}
                    title="Copy email address"
                    aria-label="Copy email address"
                  >
                    {copied ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                </div>
              )}

              {p.location && (
                <div className="contact-detail">

                  <div className="contact-detail-icon">
                    <MapPin size={19} />
                  </div>

                  <div className="contact-detail-content">
                    <small>LOCATION</small>
                    <strong>{p.location}</strong>
                  </div>

                  <Globe size={17} color="#777" />

                </div>
              )}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <Clock3 size={19} />
                </div>

                <div className="contact-detail-content">
                  <small>RESPONSE TIME</small>
                  <strong>Usually within 24–48 hours</strong>
                </div>

                <Zap size={17} color="#f87171" />

              </div>

            </div>

            {/* SOCIAL LINKS */}

            {socialLinks.length > 0 && (
              <div className="contact-social-area">

                <div className="contact-social-heading">
                  FIND ME ONLINE
                </div>

                <div className="contact-socials">

                  {socialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        className="contact-social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                      >
                        <Icon size={17} />
                        {social.name}
                        <ArrowUpRight size={13} />
                      </a>
                    );
                  })}

                </div>

              </div>
            )}

            {/* BOTTOM NOTE */}

            <div className="contact-info-note">

              <div className="contact-note-icon">
                <Sparkles size={18} />
              </div>

              <span>
                <strong>Let's create something great.</strong>

                <small>
                  Every meaningful collaboration starts with
                  a simple conversation.
                </small>
              </span>

            </div>

          </motion.div>

          {/* =============================================
              RIGHT: CONTACT FORM
          ============================================= */}

          <motion.div
            className="contact-form-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              ...transition,
              delay: prefersReducedMotion ? 0 : 0.12,
            }}
          >

            <div className="contact-form-heading">

              <div className="contact-eyebrow">
                <MessageCircle size={15} />
                SEND A MESSAGE
              </div>

              <h3 className="contact-form-title">
                Let's start a conversation.
              </h3>

              <p className="contact-form-subtitle">
                Have something in mind? Share the details below
                and I'll get back to you.
              </p>

            </div>

            {/* FORM */}

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
            >

              {/* HONEYPOT SPAM FIELD */}

              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <label htmlFor="contact-gotcha">
                  Leave this field empty
                </label>

                <input
                  id="contact-gotcha"
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="contact-form-grid">

                {/* NAME */}

                <div className="contact-field">

                  <label htmlFor="contact-name">
                    Your name <span>*</span>
                  </label>

                  <input
                    id="contact-name"
                    className="contact-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                    autoComplete="name"
                    required
                    disabled={isSending}
                  />

                </div>

                {/* EMAIL */}

                <div className="contact-field">

                  <label htmlFor="contact-email">
                    Email address <span>*</span>
                  </label>

                  <input
                    id="contact-email"
                    className="contact-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    maxLength={150}
                    autoComplete="email"
                    required
                    disabled={isSending}
                  />

                </div>

              </div>

              {/* SUBJECT */}

              <div className="contact-field">

                <label htmlFor="contact-subject">
                  Subject <span>*</span>
                </label>

                <input
                  id="contact-subject"
                  className="contact-input"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What would you like to discuss?"
                  maxLength={150}
                  required
                  disabled={isSending}
                />

              </div>

              {/* MESSAGE */}

              <div className="contact-field">

                <label htmlFor="contact-message">
                  Your message <span>*</span>
                </label>

                <textarea
                  id="contact-message"
                  className="contact-input"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, idea or opportunity..."
                  maxLength={5000}
                  required
                  disabled={isSending}
                />

                <div className="contact-character-count">
                  {formData.message.length}/5000 characters
                </div>

              </div>

              {/* FEEDBACK */}

              {feedback && (
                <motion.div
                  className={`contact-feedback ${status}`}
                  role={status === "error" ? "alert" : "status"}
                  aria-live="polite"
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                >

                  {status === "success" ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <AlertCircle size={19} />
                  )}

                  <span>{feedback}</span>

                </motion.div>
              )}

              {/* SUBMIT BUTTON */}

              <button
                className="contact-submit"
                type="submit"
                disabled={isSending}
              >

                {isSending ? (
                  <>
                    Sending your message...
                    <Loader2
                      className="contact-spin"
                      size={18}
                    />
                  </>
                ) : status === "success" ? (
                  <>
                    Message sent successfully
                    <CheckCircle2 size={18} />
                  </>
                ) : (
                  <>
                    Send message
                    <Send size={17} />
                  </>
                )}

              </button>

              {/* PRIVACY NOTE */}

              <div className="contact-privacy">

                <ShieldCheck size={15} />

                <span>
                  Your message is submitted through Formspree.
                  Your email application does not need to open.
                  Your information is handled by the connected
                  form service.
                </span>

              </div>

            </form>

          </motion.div>

        </div>

      </section>
    </>
  );
}
