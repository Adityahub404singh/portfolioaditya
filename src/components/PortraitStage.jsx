
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Code2,
  Sparkles,
  Zap,
  MoveUpRight,
} from "lucide-react";

import { usePortfolio } from "../hooks/usePortfolio";
import { useMotionPreference } from "../hooks/MotionPreference";

const EASE = [0.22, 1, 0.36, 1];

export default function PortraitStage() {
  const { content } = usePortfolio();
  const { enabled } = useMotionPreference();

  const profile = content?.profile || {};

  const stageRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, {
    stiffness: 120,
    damping: 18,
    mass: 0.7,
  });

  const springY = useSpring(rotateY, {
    stiffness: 120,
    damping: 18,
    mass: 0.7,
  });

  const handleMouseMove = (event) => {
    if (!enabled || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    rotateX.set((0.5 - y) * 15);
    rotateY.set((x - 0.5) * 18);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const name = profile.name || "Developer";
  const photo = profile.photoUrl || "/images/profile.jpg";

  return (
    <div
      className="portrait-stage portrait-stage-3d"
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`${name} portrait`}
    >
      <style>{`
        .portrait-stage-3d {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          display: grid;
          place-items: center;
          perspective: 1400px;
          isolation: isolate;
          transform-style: preserve-3d;
          overflow: visible;
        }

        .portrait-stage-3d .portrait-backdrop {
          position: absolute;
          width: 75%;
          height: 75%;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(228,35,63,.18),
            rgba(228,35,63,.04) 48%,
            transparent 72%
          );
          filter: blur(15px);
          z-index: -3;
        }

        .portrait-stage-3d .portrait-glow {
          position: absolute;
          width: 55%;
          height: 75%;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          background: linear-gradient(
            145deg,
            rgba(242,56,82,.24),
            rgba(70,28,53,.1),
            transparent
          );
          filter: blur(55px);
          border-radius: 50%;
          z-index: -2;
        }

        .portrait-stage-3d .portrait-orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          pointer-events: none;
          transform-style: preserve-3d;
        }

        .portrait-stage-3d .orbit-a {
          width: 96%;
          aspect-ratio: 1;
          border: 1px solid rgba(237,52,72,.27);
          transform: translate(-50%,-50%) rotateX(67deg) rotateZ(-20deg);
          box-shadow: 0 0 35px rgba(237,52,72,.06);
        }

        .portrait-stage-3d .orbit-b {
          width: 78%;
          aspect-ratio: 1;
          border: 1px dashed rgba(255,255,255,.18);
          transform: translate(-50%,-50%) rotateX(67deg) rotateZ(28deg);
        }

        .portrait-stage-3d .portrait-image-wrap {
          position: relative;
          width: min(76%, 360px);
          height: min(80%, 460px);
          min-height: 350px;
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
          border-radius: 180px 180px 28px 28px;
          border: 1px solid rgba(255,255,255,.19);
          background:
            linear-gradient(150deg,rgba(255,255,255,.12),rgba(255,255,255,.015)),
            #121012;
          box-shadow:
            0 35px 90px rgba(0,0,0,.55),
            0 0 65px rgba(222,35,62,.12),
            inset 0 0 25px rgba(255,255,255,.025);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .portrait-stage-3d .portrait-image-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.18),
              transparent 30%,
              transparent 70%,
              rgba(237,52,72,.15)
            );
        }

        .portrait-stage-3d .portrait-image-wrap::after {
          content: "";
          position: absolute;
          z-index: 2;
          top: -30%;
          left: -100%;
          width: 55%;
          height: 160%;
          transform: rotate(25deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.10),
            transparent
          );
          animation: portraitLightSweep 7s ease-in-out infinite;
          pointer-events: none;
        }

        .portrait-stage-3d .portrait-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          border-radius: inherit;
          filter: saturate(.88) contrast(1.08);
          transform: translateZ(25px);
        }

        .portrait-stage-3d .portrait-fallback {
          width: 100%;
          height: 100%;
          min-height: 350px;
          display: grid;
          place-items: center;
          text-align: center;
          color: #f4e9e8;
          background:
            radial-gradient(circle at 50% 35%,rgba(237,52,72,.24),transparent 45%),
            linear-gradient(145deg,#21171a,#0d0d0e);
        }

        .portrait-stage-3d .portrait-fallback strong {
          display: block;
          font-size: 90px;
          line-height: 1;
          color: #f04458;
          letter-spacing: -8px;
        }

        .portrait-stage-3d .portrait-fallback span {
          display: block;
          margin-top: 15px;
          font-size: 10px;
          letter-spacing: 3px;
          color: #bcb0ae;
        }

        .portrait-stage-3d .portrait-caption {
          position: absolute;
          z-index: 5;
          left: 50%;
          bottom: 4%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 17px;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 30px;
          background: rgba(12,12,14,.83);
          backdrop-filter: blur(18px);
          box-shadow: 0 12px 35px rgba(0,0,0,.3);
          color: #e7dfdc;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .portrait-stage-3d .portrait-caption .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6be29c;
          box-shadow: 0 0 13px #6be29c;
        }

        .portrait-stage-3d .portrait-orbit-icon {
          position: absolute;
          z-index: 6;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #ff7180;
          background: rgba(18,15,17,.88);
          border: 1px solid rgba(237,52,72,.3);
          box-shadow: 0 12px 35px rgba(0,0,0,.35);
          backdrop-filter: blur(15px);
        }

        .portrait-stage-3d .orbit-icon-one {
          top: 18%;
          left: 5%;
        }

        .portrait-stage-3d .orbit-icon-two {
          right: 3%;
          bottom: 25%;
        }

        .portrait-stage-3d .orbit-icon-three {
          right: 9%;
          top: 15%;
        }

        @keyframes portraitLightSweep {
          0%, 30% { left: -100%; }
          65%, 100% { left: 150%; }
        }

        @media(max-width:760px) {
          .portrait-stage-3d {
            min-height: 440px;
          }

          .portrait-stage-3d .portrait-image-wrap {
            width: min(72%,300px);
            height: 350px;
            min-height: 350px;
          }

          .portrait-stage-3d .orbit-icon-one { left: 3%; }
          .portrait-stage-3d .orbit-icon-two { right: 1%; }
          .portrait-stage-3d .portrait-caption {
            bottom: 1%;
            font-size: 8px;
          }
        }

        @media(prefers-reduced-motion:reduce) {
          .portrait-stage-3d .portrait-image-wrap::after {
            animation: none;
          }
        }
      `}</style>

      {/* BACKGROUND LIGHTING */}

      <div className="portrait-backdrop" />
      <div className="portrait-glow" />

      {/* 3D ORBIT SYSTEM */}

      <motion.div
        className="portrait-orbit orbit-a"
        animate={enabled ? { rotateZ: [-20, 340] } : {}}
        transition={{
          duration: 40,
          repeat: enabled ? Infinity : 0,
          ease: "linear",
        }}
      />

      <motion.div
        className="portrait-orbit orbit-b"
        animate={enabled ? { rotateZ: [28, -332] } : {}}
        transition={{
          duration: 55,
          repeat: enabled ? Infinity : 0,
          ease: "linear",
        }}
      />

      {/* FLOATING TECHNOLOGY ICONS */}

      <motion.div
        className="portrait-orbit-icon orbit-icon-one"
        animate={enabled ? { y: [0, -12, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Code2 size={19} />
      </motion.div>

      <motion.div
        className="portrait-orbit-icon orbit-icon-two"
        animate={enabled ? { y: [0, 10, 0] } : {}}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Zap size={19} />
      </motion.div>

      <motion.div
        className="portrait-orbit-icon orbit-icon-three"
        animate={enabled ? { y: [0, -9, 0] } : {}}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={18} />
      </motion.div>

      {/* MAIN 3D PORTRAIT */}

      <motion.div
        className="portrait-image-wrap"
        style={enabled ? {
          rotateX: springX,
          rotateY: springY,
        } : {}}
        animate={enabled ? {
          y: [0, -10, 0],
          rotateZ: [-0.5, 0.5, -0.5],
        } : {}}
        transition={{
          duration: 8,
          repeat: enabled ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {!imageError ? (
          <img
            src={photo}
            alt={`${name} portrait`}
            className="portrait-image"
            loading="eager"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="portrait-fallback">
            <div>
              <strong>
                {name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </strong>
              <span>DEVELOPER / BUILDER</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* STATUS LABEL */}

      <div className="portrait-caption">
        <span className="status-dot" />
        OPEN TO OPPORTUNITIES
      </div>
    </div>
  );
}
