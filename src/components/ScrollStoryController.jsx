import { useEffect } from "react";
import { useMotionPreference } from "../hooks/MotionPreference";
import "./scroll-story.css";

/**
 * ScrollStoryController
 * Scroll is the timeline: no forced scrolling and no blanket section pinning.
 * Existing HTML remains the source of truth; GSAP only animates its presentation.
 */
export default function ScrollStoryController() {
  const { enabled } = useMotionPreference();

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let gsap, ScrollTrigger, context;

    const setup = async () => {
      const gsapModule = await import("gsap");
      const triggerModule = await import("gsap/ScrollTrigger");
      if (disposed) return;
      gsap = gsapModule.gsap || gsapModule.default;
      ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const sections = gsap.utils.toArray("main section");
        sections.forEach((section, sectionIndex) => {
          section.dataset.storySection = String(sectionIndex);
          const heading = section.querySelector("h1,h2");
          const words = heading ? Array.from(heading.querySelectorAll(".word, [data-story-word]")) : [];
          const media = Array.from(section.querySelectorAll("img, picture, .portrait-stage, .project-image, .project-visual"));
          const text = Array.from(section.querySelectorAll("p, .eyebrow, .aps-section-label, .skill-item, .timeline-item, .project-card, .panel"))
            .filter((el) => !el.closest(".aps-cursor-swarm"));

          // The first viewport stays immediate; later scenes are scroll-scrubbed.
          if (sectionIndex === 0) {
            if (heading) {
              gsap.fromTo(heading, { clipPath: "inset(0 0 22% 0)", y: 24 }, {
                clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.1, ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top top", end: "top -35%", scrub: 0.7 }
              });
            }
          } else {
            if (heading) {
              gsap.fromTo(heading, { clipPath: "inset(0 0 100% 0)", y: 34 }, {
                clipPath: "inset(0 0 0% 0)", y: 0, ease: "none",
                scrollTrigger: { trigger: section, start: "top 82%", end: "top 35%", scrub: 0.8 }
              });
            }
          }

          if (media.length) {
            gsap.fromTo(media, {
              clipPath: "inset(12% 10% 12% 10% round 18px)",
              scale: 0.94, y: 26, filter: "saturate(.65) brightness(.8)"
            }, {
              clipPath: "inset(0% 0% 0% 0% round 12px)",
              scale: 1, y: 0, filter: "saturate(1) brightness(1)",
              stagger: 0.08, ease: "none",
              scrollTrigger: { trigger: section, start: "top 78%", end: "center 45%", scrub: 0.9 }
            });
          }

          if (text.length) {
            gsap.fromTo(text, {
              clipPath: "inset(0 0 100% 0)",
              y: 22, opacity: 0.35
            }, {
              clipPath: "inset(0 0 0% 0)",
              y: 0, opacity: 1,
              stagger: { each: 0.035, from: "start" },
              ease: "none",
              scrollTrigger: { trigger: section, start: "top 75%", end: "center 38%", scrub: 0.75 }
            });
          }

          // Expose scene progress to the Canvas engine for coordinated choreography.
          ScrollTrigger.create({
            trigger: section, start: "top bottom", end: "bottom top",
            onUpdate: (self) => {
              document.documentElement.style.setProperty("--aps-story-progress", self.progress.toFixed(4));
              document.documentElement.style.setProperty("--aps-story-index", String(sectionIndex));
              document.dispatchEvent(new CustomEvent("aps:story-progress", {
                detail: { sectionIndex, progress: self.progress, direction: self.direction }
              }));
            }
          });
        });

        // Project cards receive a restrained cinematic assembly, not a generic fade.
        gsap.utils.toArray(".project-card, .project-featured-card, .skill-group, .education-panel, .journey-note").forEach((el) => {
          gsap.fromTo(el, { clipPath: "inset(8% 4% 8% 4% round 16px)", y: 24, scale: 0.985 }, {
            clipPath: "inset(0% 0% 0% 0% round 16px)", y: 0, scale: 1, ease: "none",
            scrollTrigger: { trigger: el, start: "top 88%", end: "top 48%", scrub: 0.65 }
          });
        });

        ScrollTrigger.refresh();
      });
    };

    setup().catch((error) => console.error("[APS Scroll Story] Could not initialize GSAP:", error));
    return () => {
      disposed = true;
      if (context) context.revert();
      if (ScrollTrigger) ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      document.documentElement.style.removeProperty("--aps-story-progress");
      document.documentElement.style.removeProperty("--aps-story-index");
    };
  }, [enabled]);

  return null;
}
