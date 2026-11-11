
import {
  Github,
  Linkedin,
  Mail,
  ArrowUp,
  ArrowUpRight,
  Heart,
  Code2,
} from "lucide-react";

import { usePortfolio } from "../hooks/usePortfolio";

export default function Footer() {
  const { content } = usePortfolio();
  const p = content?.profile || {};

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      url: p.github,
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: p.linkedin,
      icon: Linkedin,
    },
    {
      name: "Email",
      url: p.email ? `mailto:${p.email}` : null,
      icon: Mail,
    },
  ].filter((item) => item.url);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        .aps-footer {
          position: relative;
          overflow: hidden;
          padding: 65px 0 25px;
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(220, 38, 38, 0.09),
              transparent 55%
            ),
            #080808;
          border-top: 1px solid rgba(255,255,255,0.09);
        }

        .aps-footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 35%;
          height: 1px;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            transparent,
            #ef4444,
            transparent
          );
          opacity: 0.8;
        }

        .aps-footer-inner {
          position: relative;
          z-index: 1;
        }

        .aps-footer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
          padding-bottom: 45px;
        }

        .aps-footer-brand {
          max-width: 390px;
        }

        .aps-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          color: #fff;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -2px;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .aps-footer-logo:hover {
          transform: translateY(-3px);
        }

        .aps-footer-logo span {
          color: #ef4444;
        }

        .aps-footer-description {
          margin-top: 14px;
          color: #929292;
          font-size: 14px;
          line-height: 1.8;
        }

        .aps-footer-code {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          color: #b5b5b5;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .aps-footer-code svg {
          color: #ef4444;
        }

        .aps-footer-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 20px;
        }

        .aps-footer-socials {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aps-footer-socials a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: #c4c4c4;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 13px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .aps-footer-socials a:hover {
          color: #fff;
          background: rgba(239,68,68,0.14);
          border-color: rgba(239,68,68,0.6);
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(239,68,68,0.12);
        }

        .aps-footer-top {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 16px;
          color: #e5e5e5;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 30px;
          font-size: 12px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .aps-footer-top:hover {
          color: #fff;
          background: #dc2626;
          border-color: #dc2626;
          transform: translateY(-3px);
        }

        .aps-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.09);
        }

        .aps-footer-copyright {
          color: #777;
          font-size: 12px;
          line-height: 1.8;
        }

        .aps-footer-credit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #929292;
          font-size: 12px;
        }

        .aps-footer-credit svg {
          color: #ef4444;
        }

        .aps-footer-credit strong {
          color: #dedede;
          font-weight: 600;
        }

        @media (max-width: 650px) {
          .aps-footer {
            padding: 48px 0 22px;
          }

          .aps-footer-main {
            flex-direction: column;
            gap: 30px;
            padding-bottom: 30px;
          }

          .aps-footer-right {
            width: 100%;
            align-items: flex-start;
          }

          .aps-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>

      <footer className="aps-footer">
        <div className="container aps-footer-inner">

          <div className="aps-footer-main">

            {/* Brand Section */}
            <div className="aps-footer-brand">
              <a
                href="#top"
                className="aps-footer-logo"
                aria-label="APS - Back to home"
              >
                APS<span>.</span>
              </a>

              <p className="aps-footer-description">
                Building with curiosity. Growing with consistency.
                Turning ideas into meaningful digital experiences
                through creativity, code and continuous learning.
              </p>

              <div className="aps-footer-code">
                <Code2 size={15} />
                <span>DESIGNED WITH PURPOSE. BUILT WITH PASSION.</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="aps-footer-right">
              <div className="aps-footer-socials">
                {socialLinks.map(({ name, url, icon: Icon }) => (
                  <a
                    key={name}
                    href={url}
                    aria-label={name}
                    title={name}
                    target={
                      name === "Email" ? undefined : "_blank"
                    }
                    rel={
                      name === "Email" ? undefined : "noreferrer"
                    }
                  >
                    <Icon size={19} />
                  </a>
                ))}
              </div>

              <button
                type="button"
                className="aps-footer-top"
                onClick={scrollToTop}
              >
                Back to top
                <ArrowUpRight size={15} />
              </button>
            </div>

          </div>

          {/* Copyright Section */}
          <div className="aps-footer-bottom">
            <small className="aps-footer-copyright">
              © {currentYear} {p.name || "APS"}. All rights reserved.
            </small>

            <div className="aps-footer-credit">
              Made with <Heart size={13} fill="currentColor" />
              by <strong>{p.name || "APS"}</strong>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
