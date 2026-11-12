/* ------------------------------------------------------------------
   ScrollStoryController + ElementDeliveryController (Home page).
   Every reveal is a GSAP timeline scrubbed by real scroll progress
   (reversible, fast-scroll safe). Each reveal is registered as a
   "delivery": the engine reads its live progress and sends cursors to
   the exact edge of the reveal, so cursors visibly carry the content in.
   The real HTML/images are never replaced; we only animate clip-path.
------------------------------------------------------------------- */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
if (typeof window !== "undefined" && /cursordebug/.test(window.location.search)) window.__apsST = ScrollTrigger;

const REVEAL = {
  wipe:  { from: "inset(0% 100% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
  lines: { from: "inset(0% 0% 100% 0%)", to: "inset(0% 0% 0% 0%)" },
  mask:  { from: "inset(100% 0% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
  ring:  { from: "circle(0% at 50% 50%)", to: "circle(75% at 50% 50%)" },
};
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const q = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const one = (sel, scope = document) => scope.querySelector(sel);
// clip-path would also cut box-shadows/glows, so drop it once a reveal is complete
const settle = (el, p) => { if (p >= 0.999) el.style.clipPath = "none"; };

const SCENES = [
  ["hero", "#top"], ["about", "#aps-about"], ["skills", "#aps-skills"], ["projects", "#aps-projects"],
  ["dsa", "#aps-dsa"], ["achievements", "#aps-achievements"], ["journey", "#aps-journey"],
  ["goals", "#aps-goals"], ["contact", "#aps-contact"],
];

export function createStory(engine) {
  let destroyed = false, ctx = null, heroCtx = null, heroDeliveries = [], deliveries = [], seq = 0, cleanups = [], mo = null, sig = "", rebuildT = 0, waitRaf = 0;

  const signature = () => [
    q(".aps-skill-grid > *").length, q(".aps-project-grid > *").length,
    q(".aps-timeline-item").length, q(".aps-facts").length, one(".aps-timeline") ? 1 : 0,
  ].join("-");

  /* ----- scroll-scrubbed reveal (+ optional inner stagger phase) ----- */
  function scrollReveal(el, kind, o = {}) {
    if (!el) return null;
    const r = REVEAL[kind];
    let tl = null;
    // GSAP suppresses onUpdate while ScrollTrigger syncs on load/refresh, so also settle from ScrollTrigger callbacks
    const settleDone = () => {
      if (tl && tl.progress() >= 0.999) { el.style.clipPath = "none"; (o.inner || []).forEach((k) => k && (k.el.style.clipPath = "none")); }
    };
    tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el, scrub: 0.5, invalidateOnRefresh: true,
        start: () => `top ${o.s ?? 90}%`,
        end: () => (el.offsetHeight > window.innerHeight * 0.55 ? "top 22%" : `top ${o.e ?? 55}%`),
        onRefresh: settleDone, onUpdate: settleDone,
      },
    });
    const split = o.inner && o.inner.length ? 0.45 : 1;
    tl.fromTo(el, { clipPath: r.from }, { clipPath: r.to, duration: split }, 0);
    if (o.inner && o.inner.length) {
      const kids = o.inner.filter(Boolean);
      kids.forEach((k, i) => {
        const kr = REVEAL[k.kind || "wipe"];
        const at = split - 0.05 + i * ((1 - split) / (kids.length + 0.4));
        tl.fromTo(k.el, { clipPath: kr.from }, { clipPath: kr.to, duration: (1 - split) / (kids.length + 0.4) + 0.08 }, at);
        k.el.dataset.storyKid = "1";
      });
    }
    tl.eventCallback("onUpdate", settleDone);
    deliveries.push({ id: "d" + seq++, kind, el, agents: o.agents || 6, getP: () => clamp(tl.progress() / split) });
    if (o.group) deliveries.push({ id: "d" + seq++, kind: "lines", el: o.group, agents: 5, getP: () => clamp((tl.progress() - split) / (1 - split)) });
    return tl;
  }

  /* ----- time-based hero entrance ----- */
  function introReveal(el, kind, delay, dur, agents) {   // registered in heroDeliveries (survives rebuilds)
    if (!el) return;
    const r = REVEAL[kind];
    const tw = gsap.fromTo(el, { clipPath: r.from }, {
      clipPath: r.to, duration: dur, delay, ease: "power2.inOut",
      onUpdate() { settle(el, this.progress()); }, onComplete: () => { el.style.clipPath = "none"; },
    });
    heroDeliveries.push({ id: "h" + heroDeliveries.length, kind, el, agents, intro: true, getP: () => tw.progress() });
  }

  function build() {
    if (destroyed) return;
    cleanups.forEach((f) => f()); cleanups = [];
    if (ctx) ctx.revert();
    deliveries = []; seq = 0; sig = signature();

    if (!heroCtx) heroCtx = gsap.context(() => {
      /* SCENE 01: HERO. Swarm enters, cursors write the name, then bring role, intro, CTAs, photo. */
      const hero = one("#top");
      if (hero) {
        introReveal(one(".aps-hero-title", hero), "lines", 0.45, 1.5, 9);
        introReveal(one(".aps-hero-role", hero), "wipe", 1.5, 0.6, 5);
        introReveal(one(".aps-hero-description", hero), "lines", 1.9, 0.9, 7);
        introReveal(one(".aps-hero-actions", hero), "wipe", 2.6, 0.6, 6);
        introReveal(one(".aps-socials", hero), "wipe", 3.0, 0.5, 4);
        introReveal(one(".aps-profile-photo-frame", hero), "ring", 0.7, 1.9, 14);
      }

    });

    ctx = gsap.context(() => {
      /* Section headings: every section's heading is carried in by cursors */
      q(".aps-section-head").forEach((el) => scrollReveal(el, "lines", { agents: 7 }));

      /* SCENE 02: ABOUT. Heading, cards (mask) and fact blocks assemble one after another. */
      q(".aps-about-grid > *").forEach((card, i) => {
        const facts = one(".aps-facts", card);
        scrollReveal(card, "mask", {
          agents: 8, s: 92 - (i % 2) * 4,
          inner: facts ? q(".aps-fact", facts).map((el) => ({ el, kind: "wipe" })) : [],
          group: facts,
        });
      });

      /* SCENE 03: EXPERTISE. Intro, then each technology card one by one. */
      scrollReveal(one(".aps-toolkit-intro"), "lines", { agents: 6 });
      q(".aps-skill-grid > *").forEach((el, i) => scrollReveal(el, "mask", { agents: 2, s: 94 - (i % 4) * 3, e: 62 }));

      /* SCENE 04: PROJECTS. Card mask, then title / stack / links arrive in order. */
      q(".aps-project-grid > *").forEach((wrap, i) => {
        const card = one(".aps-project-card", wrap) || wrap;
        const content = one(".aps-project-card-content", card);
        scrollReveal(card, "mask", {
          agents: 9, s: 94 - (i % 2) * 3,
          inner: content ? [one(".aps-project-title-row", content), one(".aps-project-stack", content), one(".aps-project-actions", card)].filter(Boolean).map((el) => ({ el, kind: "wipe" })) : [],
          group: content,
        });
      });

      /* SCENE 05: JOURNEY. A cursor draws the timeline; milestones appear in sequence. */
      const tlEl = one(".aps-timeline");
      if (tlEl) {
        const line = document.createElement("span");
        line.className = "story-line"; tlEl.appendChild(line); tlEl.classList.add("story-armed");
        cleanups.push(() => { line.remove(); tlEl.classList.remove("story-armed"); });
        const tw = gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: tlEl, scrub: 0.5, invalidateOnRefresh: true, start: "top 78%", end: "bottom 62%" },
        });
        deliveries.push({ id: "d" + seq++, kind: "line", el: tlEl, agents: 8, getP: () => tw.progress() });
        q(".aps-timeline-item", tlEl).forEach((el) => scrollReveal(el, "wipe", { agents: 3, s: 92, e: 68 }));
      }

      /* SCENE 06: CONTACT. Typography assembles, then the whole swarm converges on the CTA. */
      const cta = one("#aps-contact");
      if (cta) {
        scrollReveal(one(".aps-eyebrow", cta), "wipe", { agents: 3, s: 95, e: 75 });
        scrollReveal(one("h2", cta), "lines", { agents: 8, s: 92, e: 62 });
        scrollReveal(one(":scope > p", cta), "wipe", { agents: 4, s: 92, e: 62 });
        const actions = one(".aps-cta-actions", cta);
        scrollReveal(actions, "mask", { agents: 6, s: 92, e: 66 });
        scrollReveal(one(".aps-quick-links", cta), "wipe", { agents: 4, s: 94, e: 70 });
        if (actions) {
          let fp = 0;
          ScrollTrigger.create({ trigger: cta, start: "top 75%", end: "bottom bottom", onUpdate: (s) => { fp = s.progress; } });
          const primary = one(".aps-button-primary", actions) || actions;      // swarm converges on the main CTA button
          deliveries.push({ id: "d" + seq++, kind: "finale", el: primary, agents: 44, getP: () => clamp(fp) });
        }
      }

      /* scene tracking (smallest section containing the viewport midline wins: skills sits inside about) */
      let raf = 0;
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          engine.setScroll(self.getVelocity());
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            const mid = window.innerHeight * 0.5; let best = null, bh = 1e9;
            for (const [name, sel] of SCENES) {
              const e = one(sel); if (!e) continue;
              const r = e.getBoundingClientRect();
              if (r.top <= mid && r.bottom >= mid && r.height < bh) { bh = r.height; best = [name, e]; }
            }
            if (best) engine.setScene(best[0], best[0] === "hero"
              ? () => { const f = one(".aps-profile-photo-frame"); if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
              : best[0] === "contact"
                ? () => { const f = one(".aps-cta-actions .aps-button-primary") || one(".aps-cta-actions"); if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
                : null);
          });
        },
      });
      engine.setScene("hero", () => { const f = one(".aps-profile-photo-frame"); if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    });

    engine.setDeliveries(heroDeliveries.concat(deliveries));
    ScrollTrigger.refresh();
  }

  // A story failure must never take the page down: revert everything so content stays visible.
  function safeBuild() {
    try { build(); } catch (err) {
      console.error("[cursor-story] build failed, content left unanimated", err);
      cleanups.forEach((f) => f()); cleanups = [];
      if (ctx) ctx.revert();
      engine.setDeliveries([]);
    }
  }

  /* Home content arrives asynchronously (data, images, fonts). Rebuild only when the structure changes. */
  function start() {
    const tryBuild = (n = 0) => {
      if (destroyed) return;
      if (one("#aps-about") && one("#top")) { safeBuild(); watch(); return; }
      if (n < 180) waitRaf = requestAnimationFrame(() => tryBuild(n + 1));
    };
    tryBuild();
  }
  function watch() {
    const main = one("main") || document.body;
    mo = new MutationObserver(() => {
      clearTimeout(rebuildT);
      rebuildT = setTimeout(() => { if (destroyed) return; signature() !== sig ? safeBuild() : ScrollTrigger.refresh(); }, 350);
    });
    mo.observe(main, { childList: true, subtree: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => !destroyed && ScrollTrigger.refresh());
    window.addEventListener("load", onLoad);
  }
  const onLoad = () => !destroyed && ScrollTrigger.refresh();
  start();

  return {
    destroy() {
      destroyed = true; cancelAnimationFrame(waitRaf); clearTimeout(rebuildT);
      if (mo) mo.disconnect(); window.removeEventListener("load", onLoad);
      cleanups.forEach((f) => f()); cleanups = [];
      if (ctx) ctx.revert();
      if (heroCtx) heroCtx.revert();
      q("[data-story-kid]").forEach((el) => { el.style.clipPath = ""; delete el.dataset.storyKid; });
      engine.setDeliveries([]);
    },
  };
}
