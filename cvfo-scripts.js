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

  /* ============================================================
     2a. MOBILE MENU WIDTH FIX
     Zoho renders the burger menu as position:absolute inside a
     flex container that collapses to ~23px. We watch for the
     menu opening and force the containing block to full width.
     ============================================================ */

  function initMobileMenuFix() {
    const header = document.querySelector('.zpheader-style-01');
    if (!header) return;

    function fixMenuWidth() {
      const menuPanel = header.querySelector('.theme-responsive-menu-area .theme-responsive-menu .theme-menu');
      if (!menuPanel) return;

      const pill = header.querySelector('.theme-header');
      const pillRect = pill ? pill.getBoundingClientRect() : null;
      if (!pillRect) return;

      // Nav is always pill — always use scrolled measurements
      const isScrolled = true;
      const menuTop = 101;
      const menuLeft  = Math.round(pillRect.left);
      const menuWidth = Math.round(pillRect.width);

      menuPanel.style.setProperty('position', 'fixed', 'important');
      menuPanel.style.setProperty('top', menuTop + 'px', 'important');
      menuPanel.style.setProperty('left', menuLeft + 'px', 'important');
      menuPanel.style.setProperty('right', 'auto', 'important');
      menuPanel.style.setProperty('width', menuWidth + 'px', 'important');
      menuPanel.style.setProperty('border-radius', '14px 14px 14px 14px', 'important');
      menuPanel.style.setProperty('border-top', '1px solid rgba(255,255,255,0.1)', 'important');

      // background + blur set here so they override Zoho's inline styles
      // and render correctly on a fixed element outside pill stacking context
      menuPanel.style.setProperty('background', 'rgba(13, 28, 58, 0.55)', 'important');
      menuPanel.style.setProperty('backdrop-filter', 'blur(32px) saturate(200%)', 'important');
      menuPanel.style.setProperty('-webkit-backdrop-filter', 'blur(32px) saturate(200%)', 'important');
    }

    // Watch for Zoho adding/removing the open state class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('theme-toggle-animate')) {
            fixMenuWidth();
          }
        }
      });
    });

    // Observe the menu element for class changes
    const menuEl = header.querySelector('.theme-responsive-menu .theme-menu');
    if (menuEl) {
      observer.observe(menuEl, { attributes: true });
    }

    // Also run on burger button click as a fallback
    const burger = header.querySelector('[data-zp-burger-clickable-area]');
    if (burger) {
      burger.addEventListener('click', () => {
        // Single measurement after Zoho's open animation (0.2s) plus buffer
        setTimeout(fixMenuWidth, 250);
      });
    }
  }


  function initNavScroll() {
    // Always-pill: nav is permanently in pill/floating state.
    // No scroll threshold, no bar-to-pill transition.
    // The pill floats over page content from load — hero sections
    // should have 100px top padding to ensure content clears it.
    const header = document.querySelector('.theme-header');
    if (!header) return;
    header.classList.add('scrolled');
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

          // Zoho sometimes leaks broken inline CSS into element textContent.
          // We look for a data-count attribute first (most reliable), then
          // fall back to scanning for the LAST standalone number in the text.
          // "Standalone" = digits optionally followed by +/% at a word boundary.
          let targetNum;
          let suffix = '';

          if (el.dataset.count) {
            // Preferred: <h2 class="count-up" data-count="75" data-suffix="+">
            targetNum = parseInt(el.dataset.count, 10);
            suffix = el.dataset.suffix || '';
          } else {
            // Fallback: find the last sequence of digits + optional suffix in text.
            // This skips any hex colors or IDs in leaked Zoho CSS.
            const raw = el.textContent;
            const match = raw.match(/(\d+)([+%]?)(?!\d)(?=[^a-zA-Z0-9]|$)/g);
            if (!match) return; // nothing countable, skip
            const last = match[match.length - 1];
            targetNum = parseInt(last, 10);
            suffix = last.replace(/\d/g, '');
          }

          if (isNaN(targetNum)) return;

          // Find the text node to update — avoids wiping child elements
          // Zoho headings sometimes have child spans/divs we must preserve
          let textNode = null;
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              textNode = node;
              break;
            }
          }
          // If no direct text node, fall back to a wrapper span
          if (!textNode) {
            const span = document.createElement('span');
            span.textContent = targetNum + suffix;
            el.innerHTML = '';
            el.appendChild(span);
            textNode = span.childNodes[0];
          }

          const duration = 1400;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * targetNum);
            textNode.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              textNode.textContent = targetNum + suffix;
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
     8. MAP ACCORDION (optional)
     Apply class "hiw-accordion-section" to the section wrapper
     that contains all step columns.

     ZOHO STRUCTURE for accordion mode:
     Each step is a Row (1 col) with the column having "hiw-step".
     Inside the column:
       - Box: "hiw-step-toggle" → contains badge + icon + H3
       - Box: "hiw-step-body"   → contains body text + deliverables + role

     JS opens the first step on load, toggles others on click.
     ============================================================ */

  function initMapAccordion() {
    const sections = document.querySelectorAll('.hiw-accordion-section');
    if (!sections.length) return;

    sections.forEach(section => {
      const steps = section.querySelectorAll('.hiw-step');
      if (!steps.length) return;

      // Open first step by default
      steps[0].classList.add('hiw-open');

      steps.forEach(step => {
        const toggle = step.querySelector('.hiw-step-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
          const isOpen = step.classList.contains('hiw-open');

          // Close all steps in this section
          steps.forEach(s => s.classList.remove('hiw-open'));

          // If it wasn't open, open it
          if (!isOpen) {
            step.classList.add('hiw-open');
          }
        });
      });
    });
  }

  /* ============================================================
     7. INIT — Run everything on DOM ready
     ============================================================ */

  function init() {
    initScrollReveal();
    initMobileMenuFix();
    initNavScroll();
    initSmoothScroll();
    initTiltCards();
    initCounters();
    initActiveNav();
    initMapAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
