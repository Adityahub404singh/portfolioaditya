// ================= DOCUMENT READY =================
document.addEventListener("DOMContentLoaded", function () {

    // ================= PRELOADER =================
    window.addEventListener("load", function () {
        document.body.classList.add("loaded");
    });


    // ================= DARK MODE TOGGLE =================
    const themeToggle = document.getElementById("theme-toggle");

    // Check saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML = "☀️";
    }

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            themeToggle.innerHTML = "☀️";
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.innerHTML = "🌙";
            localStorage.setItem("theme", "light");
        }
    });


    // ================= SKILL BAR ANIMATION =================
    const skillSection = document.getElementById("skills");
    const skillBars = document.querySelectorAll(".skill-bar-fill");
    let skillsAnimated = false;

    function animateSkills() {
        const sectionTop = skillSection.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (sectionTop < screenHeight - 100 && !skillsAnimated) {
            skillBars.forEach(function (bar) {
                const value = bar.getAttribute("data-skill");
                bar.style.width = value;
            });
            skillsAnimated = true;
        }
    }


    // ================= FADE IN ANIMATION =================
    const fadeElements = document.querySelectorAll(".section, .project-card, .skill-card");

    function revealOnScroll() {
        const windowHeight = window.innerHeight;

        fadeElements.forEach(function (element) {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - 100) {
                element.classList.add("fade-in");
                element.classList.add("active");
            }
        });
    }


    // ================= NAVBAR SCROLL EFFECT =================
    const navbar = document.querySelector(".custom-navbar");

    function navbarScroll() {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(0,0,0,0.95)";
            navbar.style.padding = "8px 0";
        } else {
            navbar.style.background = "rgba(0,0,0,0.75)";
            navbar.style.padding = "12px 0";
        }
    }


    // ================= ACTIVE NAV LINK =================
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    function activeLink() {
        let current = "";

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove("text-warning");
            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("text-warning");
            }
        });
    }


    // ================= MOBILE NAV AUTO CLOSE =================
    const navItems = document.querySelectorAll(".nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navItems.forEach(function (item) {
        item.addEventListener("click", function () {
            if (navbarCollapse.classList.contains("show")) {
                new bootstrap.Collapse(navbarCollapse).hide();
            }
        });
    });


    // ================= CURSOR GLOW EFFECT =================
    const cursorGlow = document.createElement("div");
    cursorGlow.classList.add("cursor-glow");
    document.body.appendChild(cursorGlow);

    document.addEventListener("mousemove", function (e) {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
    });


    // ================= SCROLL EVENTS =================
    window.addEventListener("scroll", function () {
        animateSkills();
        revealOnScroll();
        navbarScroll();
        activeLink();
    });

});
