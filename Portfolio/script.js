// ============================================================
//   ADITYA PRATAP SINGH — PORTFOLIO JS
//   Ultra Premium Interactions & Animations
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  // ===== PRELOADER =====
  window.addEventListener("load", function () {
    setTimeout(function () {
      const pre = document.getElementById("preloader");
      if (pre) pre.classList.add("hide");
    }, 2400);
  });


  // ===== CUSTOM CURSOR =====
  // Only run on devices with a real mouse (touch has no mousemove,
  // so on phones this would just hide the cursor forever — skip it).
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const cursor = document.getElementById("cursor");
  const trail  = document.getElementById("cursor-trail");

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;
  let cursorRAFQueued = false;

  if (hasFinePointer) {
    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Batch the DOM write into the next frame instead of writing
      // on every single mousemove event (which can fire 100+/sec).
      if (!cursorRAFQueued) {
        cursorRAFQueued = true;
        requestAnimationFrame(function () {
          if (cursor) {
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
          }
          cursorRAFQueued = false;
        });
      }
    });

    // Smooth trailing cursor
    function animateTrail() {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      if (trail) {
        trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Hover effect on interactive elements
    const interactives = document.querySelectorAll("a, button, .skill-card, .proj-card, input, textarea");
    interactives.forEach(function (el) {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    // Hide cursor when leaving window
    document.addEventListener("mouseleave", () => {
      if (cursor) cursor.style.opacity = "0";
      if (trail)  trail.style.opacity  = "0";
    });
    document.addEventListener("mouseenter", () => {
      if (cursor) cursor.style.opacity = "1";
      if (trail)  trail.style.opacity  = "1";
    });
  }


  // ===== PARTICLES CANVAS =====
  const canvas = document.getElementById("particles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Fewer particles + skip the O(n^2) connecting-line pass on small
    // screens (phones), where it does nothing visually useful anyway.
    const isSmallScreen = window.innerWidth < 768;
    const PARTICLE_COUNT = isSmallScreen ? 25 : 60;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.8 + 0.4,
        vx:   (Math.random() - 0.5) * 0.35,
        vy:   (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.45 + 0.1,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);

      // Connect nearby particles (skipped on small screens — see above)
      if (!isSmallScreen) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255,184,0,${0.08 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,184,0,${p.alpha})`;
        ctx.fill();
      });

      particlesRAF = requestAnimationFrame(drawParticles);
    }

    let particlesRAF = requestAnimationFrame(drawParticles);

    // Stop burning CPU/battery when the tab isn't visible.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        cancelAnimationFrame(particlesRAF);
      } else {
        particlesRAF = requestAnimationFrame(drawParticles);
      }
    });

    window.addEventListener("resize", function () {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  }


  // ===== DARK / LIGHT THEME TOGGLE =====
  const themeBtn = document.getElementById("theme-toggle");

  // Default: dark mode (no class)
  const saved = localStorage.getItem("aps-theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    if (themeBtn) themeBtn.textContent = "🌙";
  } else {
    if (themeBtn) themeBtn.textContent = "☀️";
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      themeBtn.textContent = isLight ? "🌙" : "☀️";
      localStorage.setItem("aps-theme", isLight ? "light" : "dark");
    });
  }


  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector(".custom-navbar");

  function handleNavbar() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  handleNavbar();


  // ===== ACTIVE NAV LINK =====
  const sections  = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav-link");

  function setActiveLink() {
    let current = "";
    sections.forEach(function (sec) {
      const top    = sec.offsetTop - 160;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        current = sec.getAttribute("id");
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove("active-link");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active-link");
      }
    });
  }


  // ===== SCROLL REVEAL (IntersectionObserver) =====
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(function (el) { revealObs.observe(el); });


  // ===== SKILL BARS ANIMATION =====
  let skillsAnimated = false;
  const skillSection = document.getElementById("skills");
  const skillFills   = document.querySelectorAll(".skill-fill");

  const skillObs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !skillsAnimated) {
      skillsAnimated = true;
      skillFills.forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-skill");
      });
    }
  }, { threshold: 0.25 });

  if (skillSection) skillObs.observe(skillSection);


  // ===== HERO COUNTER ANIMATION =====
  const hstats   = document.querySelectorAll(".hstat-num[data-count]");
  let countDone  = false;
  const countObs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countDone) {
      countDone = true;
      hstats.forEach(function (el) {
        const target = parseInt(el.getAttribute("data-count"));
        let current  = 0;
        const step   = Math.ceil(target / 30);
        const suffix = el.textContent.includes("+") ? "+" : "";
        const timer  = setInterval(function () {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current + suffix;
        }, 45);
      });
    }
  }, { threshold: 0.5 });

  const heroSec = document.getElementById("home");
  if (heroSec) countObs.observe(heroSec);


  // ===== TYPEWRITER EFFECT =====
  const phrases = [
    "AI & Machine Learning Enthusiast.",
    "Full Stack Web Developer.",
    "Building Automation AI. 🚀",
    "Creating SkillSwap. ⚡",
    "Turning ideas into products.",
    "Always shipping. 🔥"
  ];
  let phraseIndex  = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  const twEl       = document.getElementById("typewriter-text");

  function typeLoop() {
    if (!twEl) return;
    const current = phrases[phraseIndex];
    if (!isDeleting) {
      twEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeLoop, 2000);
        return;
      }
    } else {
      twEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting   = false;
        phraseIndex  = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, isDeleting ? 45 : 75);
  }

  // Start after preloader
  setTimeout(typeLoop, 2600);


  // ===== MOBILE NAV AUTO CLOSE =====
  const navbarCollapse = document.querySelector(".navbar-collapse");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        new bootstrap.Collapse(navbarCollapse).hide();
      }
    });
  });


  // ===== SMOOTH HOVER ON SKILL CARDS (mouse glow) =====
  // ===== PROJECT CARD TILT EFFECT =====
  // Both are pointer-only effects — pointless (and wasted listeners) on
  // touch devices since touch never fires mousemove.
  if (hasFinePointer) {
    document.querySelectorAll(".skill-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect  = card.getBoundingClientRect();
        const x     = e.clientX - rect.left;
        const y     = e.clientY - rect.top;
        const glow  = card.querySelector(".skill-card-glow");
        if (glow) {
          glow.style.left = (x - 100) + "px";
          glow.style.top  = (y - 100) + "px";
        }
      });
    });

    document.querySelectorAll(".proj-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect  = card.getBoundingClientRect();
        const x     = (e.clientX - rect.left) / rect.width  - 0.5;
        const y     = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-12px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
        card.style.transition = "transform 0.1s ease";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        card.style.transition = "transform 0.45s cubic-bezier(0.4,0,0.2,1)";
      });
    });
  }


  // ===== CONTACT FORM =====
  window.handleForm = function (e) {
    e.preventDefault();
    const btn     = e.target.querySelector(".form-submit-btn");
    const success = document.getElementById("form-success");
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;
    }
    setTimeout(function () {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        setTimeout(function () {
          btn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
          btn.disabled  = false;
        }, 3000);
      }
      if (success) success.style.display = "block";
      e.target.reset();
    }, 1500);
  };


  // ===== SCROLL EVENT AGGREGATOR =====
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        handleNavbar();
        setActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });


  // ===== FLOATING SOCIALS ANIMATION =====
  // Moved to a CSS @keyframes animation (see style.css) — a JS rAF loop
  // that never stops was doing this same 8px wobble at real CPU cost.


  // ===== NAVBAR BRAND CLICK — scroll to top =====
  const brand = document.querySelector(".navbar-brand");
  if (brand) {
    brand.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }


  // ===== RIPPLE EFFECT ON BUTTONS =====
  document.querySelectorAll(".btn-hero-primary, .btn-hero-outline, .proj-btn.primary, .form-submit-btn, .resume-dl-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        width:10px; height:10px;
        background:rgba(255,255,255,0.4);
        top:${e.clientY - rect.top - 5}px;
        left:${e.clientX - rect.left - 5}px;
        animation:rippleAnim 0.7s ease forwards;
        pointer-events:none;
      `;
      if (!btn.style.position || btn.style.position === "static") {
        btn.style.position = "relative";
      }
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Ripple keyframe (inject once)
  if (!document.getElementById("ripple-style")) {
    const s = document.createElement("style");
    s.id = "ripple-style";
    s.textContent = `
      @keyframes rippleAnim {
        0%   { transform:scale(1); opacity:0.6; }
        100% { transform:scale(28); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }

}); // End DOMContentLoaded