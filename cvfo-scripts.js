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
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     2. NAVBAR SCROLL BEHAVIOR
     Adds "scrolled" class to header when page is scrolled.
     
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

      const isScrolled = pillRect.left > 0;

      // top: measured values — 91px at top of page, 101px when scrolled (pill state)
      const menuTop = isScrolled ? 101 : 91;
      // left/width: match pill exactly
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
        setTimeout(fixMenuWidth, 250);
      });
    }
  }


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
     ============================================================ */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ============================================================
     4. CARD TILT EFFECT
     Apply class "tilt-card" to any card element.
     ============================================================ */

  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

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

        const rotateX = ((y - centerY) / centerY) * -6;
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

          let targetNum;
          let suffix = '';

          if (el.dataset.count) {
            targetNum = parseInt(el.dataset.count, 10);
            suffix = el.dataset.suffix || '';
          } else {
            const raw = el.textContent;
            const match = raw.match(/(\d+)([+%]?)(?!\d)(?=[^a-zA-Z0-9]|$)/g);
            if (!match) return;
            const last = match[match.length - 1];
            targetNum = parseInt(last, 10);
            suffix = last.replace(/\d/g, '');
          }

          if (isNaN(targetNum)) return;

          let textNode = null;
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              textNode = node;
              break;
            }
          }
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
     7. MAP ACCORDION (optional)
     Apply "hiw-accordion-section" to section wrapping steps.
     ============================================================ */

  function initMapAccordion() {
    const sections = document.querySelectorAll('.hiw-accordion-section');
    if (!sections.length) return;

    sections.forEach(section => {
      const steps = section.querySelectorAll('.hiw-step');
      if (!steps.length) return;

      steps[0].classList.add('hiw-open');

      steps.forEach(step => {
        const toggle = step.querySelector('.hiw-step-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
          const isOpen = step.classList.contains('hiw-open');
          steps.forEach(s => s.classList.remove('hiw-open'));
          if (!isOpen) {
            step.classList.add('hiw-open');
          }
        });
      });
    });
  }


  /* ============================================================
     9. ADDITIONAL SCROLL REVEAL VARIANTS
     Registers blur, drop, flip, zoom, slow, fast + repeat.
     ============================================================ */

  const EXTRA_REVEAL_CLASSES = [
    '.scroll-reveal-blur',
    '.scroll-reveal-drop',
    '.scroll-reveal-flip',
    '.scroll-reveal-zoom',
    '.scroll-reveal-slow',
    '.scroll-reveal-fast',
    '.stagger-fast',
    '.stagger-slow',
  ];

  function initExtraScrollReveal() {
    const targets = document.querySelectorAll(EXTRA_REVEAL_CLASSES.join(', '));
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }

  /* Repeat variant — re-animates every viewport entry */
  function initScrollRevealRepeat() {
    const targets = document.querySelectorAll('.scroll-reveal-repeat');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Start all in hidden state
    targets.forEach(el => el.classList.add('is-hidden'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-hidden');
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
            entry.target.classList.add('is-hidden');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     10. HIGHLIGHT DRAW
     Triggers the animated underline highlight on scroll.
     Apply .highlight-draw to any inline <span>.
     ============================================================ */

  function initHighlightDraw() {
    const targets = document.querySelectorAll('.highlight-draw, .highlight-draw-gold');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Slight delay so it trails the heading reveal
            setTimeout(() => entry.target.classList.add('is-visible'), 300);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     11. TYPEWRITER EFFECT
     Apply .typewriter to any element.
     Set data-text="Your text here" or it uses existing textContent.
     Optional: data-speed="60" (ms per character, default 55)
     Optional: data-delay="400" (ms before starting, default 0)
     ============================================================ */

  function initTypewriter() {
    const targets = document.querySelectorAll('.typewriter');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const el = entry.target;
          const text = el.dataset.text || el.textContent;
          const speed = parseInt(el.dataset.speed || '55', 10);
          const delay = parseInt(el.dataset.delay || '0', 10);

          el.textContent = '';
          el.classList.add('typewriter-cursor');

          let i = 0;
          function type() {
            if (i < text.length) {
              el.textContent += text[i++];
              setTimeout(type, speed);
            } else {
              // Remove cursor after done (optional — remove this line to keep it)
              setTimeout(() => el.classList.remove('typewriter-cursor'), 1200);
            }
          }

          setTimeout(type, delay);
        });
      },
      { threshold: 0.5 }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     12. SCROLL PROGRESS BAR
     Add an element with class .scroll-progress-bar anywhere in
     the body (ideally at the very top).
     ============================================================ */

  function initScrollProgressBar() {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(2) + '%');
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ============================================================
     13. RIPPLE EFFECT
     Apply .ripple-host to any button or clickable element.
     For light buttons, also add .ripple-dark.
     ============================================================ */

  function initRipple() {
    document.querySelectorAll('.ripple-host').forEach(el => {
      el.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;

        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }


  /* ============================================================
     14. MAGNETIC ELEMENTS
     Apply .magnetic to any element.
     data-strength="0.3" controls pull strength (default 0.35).
     Automatically disabled on touch devices.
     ============================================================ */

  function initMagnetic() {
    const els = document.querySelectorAll('.magnetic');
    if (!els.length) return;
    if ('ontouchstart' in window) return;

    els.forEach(el => {
      const strength = parseFloat(el.dataset.strength || '0.35');

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }


  /* ============================================================
     15. PARALLAX
     .parallax-slow  — moves at 0.3× scroll speed
     .parallax-fast  — moves at 0.6× scroll speed
     .parallax-reverse — moves opposite scroll direction at 0.25×
     Applied via CSS custom property --parallax-y on each element.
     Disabled on mobile (< 768px) and reduced-motion.
     ============================================================ */

  function initParallax() {
    const slow    = document.querySelectorAll('.parallax-slow');
    const fast    = document.querySelectorAll('.parallax-fast');
    const reverse = document.querySelectorAll('.parallax-reverse');

    if (!slow.length && !fast.length && !reverse.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    function update() {
      const scrollY = window.scrollY;
      slow.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 + scrollY - window.innerHeight / 2;
        el.style.setProperty('--parallax-y', (center * -0.3).toFixed(2) + 'px');
      });
      fast.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 + scrollY - window.innerHeight / 2;
        el.style.setProperty('--parallax-y', (center * -0.6).toFixed(2) + 'px');
      });
      reverse.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 + scrollY - window.innerHeight / 2;
        el.style.setProperty('--parallax-y', (center * 0.25).toFixed(2) + 'px');
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ============================================================
     16. HOVER DIM GROUP
     Apply .hover-dim-group to a parent container.
     Apply .hover-dim-item to each child card/item.
     When any item is hovered, siblings dim.
     ============================================================ */

  function initHoverDimGroup() {
    document.querySelectorAll('.hover-dim-group').forEach(group => {
      const items = group.querySelectorAll('.hover-dim-item');
      items.forEach(item => {
        item.addEventListener('mouseenter', () => {
          group.classList.add('hover-dim-group-active');
        });
        item.addEventListener('mouseleave', () => {
          group.classList.remove('hover-dim-group-active');
        });
      });
    });
  }


  /* ============================================================
     17. SKEW SCROLL REVEAL + WORD REVEAL
     ============================================================ */

  function initSkewReveal() {
    const targets = document.querySelectorAll(
      '.scroll-reveal-skew, .scroll-reveal-skew-right'
    );
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(el => observer.observe(el));
  }

  function initWordReveal() {
    const targets = document.querySelectorAll('.word-reveal');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Split each element's text into word spans
    targets.forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.textContent = '';
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.classList.add('word');
        const inner = document.createElement('span');
        inner.classList.add('word-inner');
        inner.textContent = word;
        inner.style.transitionDelay = (i * 80) + 'ms';
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode('\u00A0'));
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     18. TEXT SCRAMBLE
     Apply .text-scramble to any short heading or label.
     Characters randomize rapidly then settle to the real text.
     Optional: data-delay="200" (ms before starting)
     ============================================================ */

  /* ============================================================
     20. STAGGER GRID
     Like stagger-children but uses grid-position-aware delays.
     Apply .stagger-grid to a grid parent container.
     JS adds .is-visible; CSS handles the staggered delays.
     ============================================================ */

  function initStaggerGrid() {
    const targets = document.querySelectorAll('.stagger-grid');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     21. REVEAL LINE
     A horizontal line that draws left-to-right on scroll entry.
     Apply .reveal-line (+ optional variant) to any <hr> or block.
     ============================================================ */

  function initRevealLine() {
    const targets = document.querySelectorAll(
      '.reveal-line, .reveal-line-teal, .reveal-line-gold, .reveal-line-sky, .reveal-line-white'
    );
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     22. SECTION IN-VIEW
     Adds .section-visible to <section> or .section-in-view
     elements when they're 30%+ in the viewport.
     Use CSS hooks to trigger child effects:
       .section-visible .my-element { ... }
     ============================================================ */

  function initSectionInView() {
    const targets = document.querySelectorAll('section, .section-in-view');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('section-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          }
          // Note: class stays once added — use scroll-reveal-repeat for re-triggering
        });
      },
      { threshold: 0.3 }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     23. PROGRESS FILL BAR
     Fills a .progress-fill-bar element to --fill-width
     when it enters the viewport.
     Set width via inline style: style="--fill-width: 73%"
     ============================================================ */

  function initProgressFillBars() {
    const targets = document.querySelectorAll('.progress-fill-bar');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => {
        el.classList.add('is-visible');
        el.style.width = el.style.getPropertyValue('--fill-width') || '100%';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    targets.forEach(el => observer.observe(el));
  }


  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';


  function scrambleText(el) {
    const original = el.dataset.text || el.textContent.trim();
    const delay    = parseInt(el.dataset.delay || '0', 10);
    const duration = 700; // total ms to settle

    setTimeout(() => {
      const start = performance.now();
      const chars  = original.split('');

      function frame(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // How many characters have settled (left to right)
        const settled  = Math.floor(progress * chars.length);

        const display = chars.map((ch, i) => {
          if (i < settled || ch === ' ') return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('');

        el.textContent = display;

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = original;
        }
      }

      requestAnimationFrame(frame);
    }, delay);
  }

  function initTextScramble() {
    const targets = document.querySelectorAll('.text-scramble');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Store original text in data attribute before observing
    targets.forEach(el => {
      if (!el.dataset.text) el.dataset.text = el.textContent.trim();
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            scrambleText(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    targets.forEach(el => observer.observe(el));
  }


  /* ============================================================
     19. IMPROVED COUNT-UP
     Extends existing counter with:
     - Comma formatting (1000 → 1,000)
     - Decimal support via data-decimals="1"
     - Prefix support via data-prefix="$"
     ============================================================ */

  function initCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function formatNumber(num, decimals, prefix, suffix) {
      const fixed = num.toFixed(decimals);
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (prefix || '') + parts.join('.') + (suffix || '');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const el = entry.target;
          const targetNum  = parseFloat(el.dataset.count || el.textContent.replace(/[^0-9.]/g, ''));
          const suffix     = el.dataset.suffix  || el.textContent.replace(/[0-9,.]/g, '').replace(/^[^a-zA-Z+%]*/, '') || '';
          const prefix     = el.dataset.prefix  || '';
          const decimals   = parseInt(el.dataset.decimals || '0', 10);
          const dur        = parseInt(el.dataset.duration || '1400', 10);

          if (isNaN(targetNum)) return;

          const start = performance.now();

          function update(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / dur, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = formatNumber(eased * targetNum, decimals, prefix, suffix);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = formatNumber(targetNum, decimals, prefix, suffix);
            }
          }

          requestAnimationFrame(update);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  }


  /* ============================================================
     20. SCROLL-TRIGGERED BODY CLASS
     Adds class to <body> based on scroll position.
     Useful for targeting styles when past the hero or fold.

     Usage in CSS:
       body.past-hero .some-element { ... }
       body.at-bottom .back-to-top { opacity: 1; }
     ============================================================ */

  function initScrollBodyClass() {
    // Read breakpoints from data attributes on <body> or use defaults
    const heroHeight = parseInt(document.body.dataset.heroHeight || '600', 10);
    const foldHeight = parseInt(document.body.dataset.foldHeight || '200', 10);

    function update() {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;

      document.body.classList.toggle('scrolled',        y > foldHeight);
      document.body.classList.toggle('past-hero',       y > heroHeight);
      document.body.classList.toggle('at-bottom',       y + winH >= docH - 100);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ============================================================
     8. INIT — Run everything on DOM ready
     ============================================================ */

  function init() {
    initScrollReveal();
    initExtraScrollReveal();
    initScrollRevealRepeat();
    initSkewReveal();
    initWordReveal();
    initTextScramble();
    initStaggerGrid();
    initRevealLine();
    initSectionInView();
    initProgressFillBars();
    initHighlightDraw();
    initTypewriter();
    initScrollProgressBar();
    initScrollBodyClass();
    initRipple();
    initMagnetic();
    initParallax();
    initHoverDimGroup();
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


/* ============================================================
   TEAM CARD RENDERER
   Fetches static JSON from GitHub Pages, renders team member
   cards with bio modal into a target container element.

   USAGE (Zoho Sites Code Snippet):
   <div id="cvfo-team-ppt"></div>
   <script>
     renderTeamCards({
       containerId: 'cvfo-team-ppt',
       jsonUrl: 'https://harvey-cvfo.github.io/CVFO-Custom-Styles/team-ppt.json'
     });
   </script>
   ============================================================ */

(function () {
  'use strict';

  /* ── MODAL ─────────────────────────────────────────────── */

  let modalOverlay = null;

  function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'team-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Team member bio');

    overlay.innerHTML = `
      <div class="team-modal">
        <div class="team-modal-header">
          <img class="team-modal-photo" src="" alt="">
          <button class="team-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="team-modal-body">
          <div class="team-modal-name"></div>
          <div class="team-modal-title"></div>
          <div class="team-modal-bio"></div>
        </div>
      </div>
    `;

    // Close on overlay click (outside modal box)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Close on × button
    overlay.querySelector('.team-modal-close').addEventListener('click', closeModal);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function openModal(member) {
    if (!modalOverlay) modalOverlay = createModal();

    const photo = modalOverlay.querySelector('.team-modal-photo');
    photo.src = member.photo || '';
    photo.alt = member.name || '';

    modalOverlay.querySelector('.team-modal-name').textContent  = member.name  || '';
    modalOverlay.querySelector('.team-modal-title').textContent = member.title || '';

    const bioEl = modalOverlay.querySelector('.team-modal-bio');
    if (member.bio) {
      bioEl.textContent = member.bio;
      bioEl.classList.remove('team-modal-no-bio');
    } else {
      bioEl.textContent = 'Full bio coming soon.';
      bioEl.classList.add('team-modal-no-bio');
    }

    // Trigger open animation on next frame
    requestAnimationFrame(() => {
      modalOverlay.classList.add('is-open');
    });

    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }


  /* ── CARD BUILDER ───────────────────────────────────────── */

  function buildCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card scroll-reveal';

    const photoSrc  = member.photo  || '';
    const photoAlt  = member.name   || 'Team member';
    const name      = member.name   || '';
    const title     = member.title  || '';
    const btnLabel  = member.buttonLabel || 'Bio';

    card.innerHTML = `
      <div class="team-card-header"></div>
      <div class="team-card-body">
        <img class="team-card-photo" src="${photoSrc}" alt="${photoAlt}" loading="lazy">
        <div class="team-card-name">${name}</div>
        <div class="team-card-title">${title}</div>
        <button class="team-card-btn">${btnLabel}</button>
      </div>
    `;

    card.querySelector('.team-card-btn').addEventListener('click', function () {
      openModal(member);
    });

    return card;
  }


  /* ── MAIN FUNCTION ──────────────────────────────────────── */

  window.renderTeamCards = function (options) {
    const { containerId, jsonUrl } = options || {};

    if (!containerId || !jsonUrl) {
      console.warn('renderTeamCards: containerId and jsonUrl are required.');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`renderTeamCards: element #${containerId} not found.`);
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="team-loading">Loading team...</div>';

    fetch(jsonUrl)
      .then(function (res) {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(function (data) {
        const members = data.members || [];

        if (!members.length) {
          container.innerHTML = '<div class="team-error">No team members found.</div>';
          return;
        }

        const grid = document.createElement('div');
        grid.className = 'team-grid';

        members.forEach(function (member) {
          grid.appendChild(buildCard(member));
        });

        container.innerHTML = '';
        container.appendChild(grid);

        // Re-run scroll reveal for newly inserted cards
        if (typeof initScrollReveal === 'function') {
          initScrollReveal();
        }
      })
      .catch(function (err) {
        console.error('renderTeamCards fetch error:', err);
        container.innerHTML = '<div class="team-error">Unable to load team data. Please try refreshing.</div>';
      });
  };

})();
