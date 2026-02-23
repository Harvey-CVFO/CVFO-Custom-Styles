/* ============================================================
   CVFO SCRIPTS
   Hosted on GitHub Pages — referenced in Zoho Sites head code
   
   USAGE IN ZOHO SITES:
   Settings → Custom Code → Head → paste (after stylesheet link):
   <script defer src="YOUR_GITHUB_PAGES_URL/cvfo-scripts.js"></script>
   
   WHAT THIS DOES:
   - Scroll-triggered reveal animations (IntersectionObserver)
   - Staggered children animation
   - Smooth nav behavior
   - No dependencies, no jQuery, vanilla JS only
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. SCROLL REVEAL
     Watches for elements with scroll animation classes.
     Adds "is-visible" class when they enter the viewport.
     ============================================================ */

  const REVEAL_CLASSES = [
    '.scroll-reveal',
    '.scroll-reveal-left',
    '.scroll-reveal-right',
    '.scroll-reveal-scale',
    '.stagger-children',
  ];

  function initScrollReveal() {
    const targets = document.querySelectorAll(REVEAL_CLASSES.join(', '));

    if (!targets.length) return;

    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve after triggering — animation plays once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,      // Trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px', // Offset so it triggers slightly before edge
      }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     2. NAVBAR SCROLL BEHAVIOR
     Adds "scrolled" class to header when page is scrolled.
     Lets you style the nav differently once user leaves top.
     
     CSS to add in cvfo-styles.css if you want this effect:
     .zpheader.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
     ============================================================ */

  function initNavScroll() {
    const header = document.querySelector('.theme-header');
    if (!header) return;

    const THRESHOLD = 80;
    let isScrolled = false;

    function onScroll() {
      const shouldBeScrolled = window.scrollY > THRESHOLD;
      if (shouldBeScrolled === isScrolled) return;
      isScrolled = shouldBeScrolled;

      if (shouldBeScrolled) {
        // Hide nav, swap to pill state off-screen, then fade back in
        header.classList.add('nav-hidden');
        setTimeout(() => {
          header.classList.add('scrolled');
          header.classList.remove('nav-hidden');
        }, 200);
      } else {
        // Same on the way back — hide, revert to bar, fade in
        header.classList.add('nav-hidden');
        setTimeout(() => {
          header.classList.remove('scrolled');
          header.classList.remove('nav-hidden');
        }, 200);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ============================================================
     3. SMOOTH SCROLL FOR ANCHOR LINKS
     Catches any href="#section-id" links and smooth scrolls.
     Zoho Sites sometimes uses these for in-page navigation.
     ============================================================ */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        const offset = 80; // Account for fixed nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ============================================================
     4. CARD TILT EFFECT (Optional — subtle 3D on hover)
     Apply class "tilt-card" to any card element.
     Creates a gentle perspective tilt following the mouse.
     ============================================================ */

  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    // Skip on touch devices
    if ('ontouchstart' in window) return;

    cards.forEach(card => {
      card.style.transition = 'transform 0.15s ease';
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }


  /* ============================================================
     5. COUNTER ANIMATION
     Apply class "count-up" to any element containing a number.
     It will animate from 0 to that number when scrolled into view.
     
     Example: <span class="count-up">75</span>
     ============================================================ */

  function initCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseInt(el.textContent.replace(/\D/g, ''), 10);
          const suffix = el.textContent.replace(/[0-9]/g, '').trim(); // preserve "+" or "%"
          const duration = 1400;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target + suffix;
            }
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  }


  /* ============================================================
     6. ACTIVE NAV LINK HIGHLIGHTING
     Adds "active" class to nav links matching current page URL.
     ============================================================ */

  function initActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '');

    document.querySelectorAll('.zpnav-link, .zpnavbar-nav a').forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      const cleanLink = linkPath.replace(/\/$/, '');

      if (cleanLink === currentPath || (currentPath === '' && cleanLink === '')) {
        link.classList.add('nav-active');
        link.closest('li')?.classList.add('nav-active');
      }
    });
  }


  /* ============================================================
     7. INIT — Run everything on DOM ready
     ============================================================ */

  function init() {
    initScrollReveal();
    initNavScroll();
    initSmoothScroll();
    initTiltCards();
    initCounters();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
