
// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerOffset = 100; // Account for fixed header
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Fetch and display toppers
// Fetch and display toppers logic MOVED to toppers.html inline script for better filtering support
// if (window.location.pathname.endsWith('toppers.html')) { ... }

// Fetch and display events
// Fetch and display events logic MOVED to events.html inline script
// if (window.location.pathname.endsWith('events.html')) { ... }

// Inject shared footer from /footer.html on all pages
document.addEventListener('DOMContentLoaded', () => {
  fetch('/footer.html')
    .then(r => r.text())
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const footerFromFile = temp.querySelector('footer');
      if (!footerFromFile) return;

      const existingFooter = document.querySelector('footer, .footer');
      if (existingFooter) {
        existingFooter.replaceWith(footerFromFile);
      } else {
        document.body.appendChild(footerFromFile);
      }

      // Update year after injection
      const yearEl = footerFromFile.querySelector('#footerYear') || footerFromFile.querySelector('#year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })
    .catch(() => { });
});

// Inject shared header from /header.html on all pages and set active link
document.addEventListener('DOMContentLoaded', () => {
  // Helper to init the menu behavior on whatever header is currently in the DOM
  function initHeaderLogic() {
    // Mark active link
    const current = window.location.pathname;
    document.querySelectorAll('header nav a').forEach(a => {
      // Clear previous active to be safe
      a.classList.remove('active');
      const route = a.getAttribute('data-route') || a.getAttribute('href');
      // Simple exact match or root match
      if (route === current || (route === '/' && (current === '/' || current === '/index.html'))) {
        a.classList.add('active');
      } else if (current.includes(route) && route !== '/') {
        // rough match for sub-paths if needed
        a.classList.add('active');
      }
    });

    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const headerEl = document.getElementById('navbar') || document.querySelector('header');

    // Create overlay element if not present
    let navOverlay = document.querySelector('.nav-overlay');
    if (!navOverlay) {
      navOverlay = document.createElement('div');
      navOverlay.className = 'nav-overlay';
      document.body.appendChild(navOverlay);
    }

    if (menuToggle && mainNav) {
      // Remove old listeners to avoid duplicates (cloning is a quick hack, or just rely on 'once' if feasible, but here we just re-add)
      // A safer way is to assume this runs once per page load. 
      // If we are replacing the header, the old elements are gone, so fresh listeners are fine.

      menuToggle.onclick = (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        const open = mainNav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', open);
        document.body.classList.toggle('lock', open);
        navOverlay.classList.toggle('show', open);
      };

      // Close menu when clicking on a link
      mainNav.querySelectorAll('a').forEach(link => {
        link.onclick = () => {
          menuToggle.classList.remove('active');
          mainNav.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('lock');
          navOverlay.classList.remove('show');
        };
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (headerEl && !headerEl.contains(e.target) && mainNav.classList.contains('active')) {
          menuToggle.classList.remove('active');
          mainNav.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('lock');
          navOverlay.classList.remove('show');
        }
      });

      // Close when tapping overlay
      navOverlay.onclick = () => {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('lock');
        navOverlay.classList.remove('show');
      };
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
      // Remove old listener if possible or just add new one (it's global window, so duplicate is possible but minor)
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  }

  // 1. Try to fetch and replace header (for pages that don't have it or have an placeholder)
  // Check if we already have a full header. If the page is courses.html, it has a static header.
  // We'll still try to fetch to keep it consistent, OR we just init logic if fetch fails or if we want to support static.
  // Strategy: Try fetch. If it works, replace and init. If it fails, init existing.
  // Actually, for instant interactivity, let's Init Existing FIRST, then Replace (if successful).

  initHeaderLogic(); // Init whatever is currently in HTML (static header on courses.html)

  // Optional: Dynamic replacement to ensure latest header version
  fetch('/header.html')
    .then(r => r.text())
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const headerFromFile = temp.querySelector('header');
      if (!headerFromFile) return;

      const existingHeader = document.querySelector('header');
      // Only replace if the content is significantly different or if we want to enforce single-source-of-truth.
      // Replacing re-runs initialization which is fine.
      if (existingHeader) {
        existingHeader.replaceWith(headerFromFile);
        initHeaderLogic(); // Re-bind listeners to new elements
      } else {
        document.body.insertBefore(headerFromFile, document.body.firstChild);
        initHeaderLogic();
      }
    })
    .catch(err => {
      // console.log('Header fetch skipped or failed, using static header');
    });
});

// Counter animation function
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200; // The lower the faster

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText.replace('+', '');
    const increment = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment) + '+';
      setTimeout(animateCounters, 10);
    } else {
      counter.innerText = target.toLocaleString() + '+';
    }
  });
}

// Home page loaders
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
    // Initialize counter animation when stats section is in view
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(statsSection);
    }
    // Pamphlets with zoom functionality
    fetch('/api/home/pamphlets').then(r => r.json()).then(items => {
      const wrap = document.getElementById('homePamphlets');
      if (!wrap) return;

      // Create modal for image zoom
      const modal = document.createElement('div');
      modal.id = 'pamphletModal';
      modal.style.display = 'none';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
      modal.style.zIndex = '1000';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.3s ease';
      modal.style.cursor = 'zoom-out';

      const modalImg = document.createElement('img');
      modalImg.style.maxWidth = '90%';
      modalImg.style.maxHeight = '90%';
      modalImg.style.objectFit = 'contain';
      modalImg.style.transform = 'scale(0.8)';
      modalImg.style.transition = 'transform 0.3s ease';

      modal.appendChild(modalImg);
      document.body.appendChild(modal);

      // Close modal when clicking outside or pressing ESC
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.opacity = '0';
          setTimeout(() => {
            modal.style.display = 'none';
          }, 300);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
          modal.style.opacity = '0';
          setTimeout(() => {
            modal.style.display = 'none';
          }, 300);
        }
      });
      wrap.innerHTML = '';
      items.forEach(src => {
        const card = document.createElement('div');
        card.className = 'card fade-in pamphlet-card';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Pamphlet';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.sizes = '(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 300px';
        img.style.cursor = 'zoom-in';
        img.style.transition = 'transform 0.3s ease';

        // Add hover effect
        img.addEventListener('mouseenter', () => {
          img.style.transform = 'scale(1.02)';
        });

        img.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
        });

        // Add click to zoom
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          modalImg.src = src;
          modalImg.alt = 'Pamphlet';
          modal.style.display = 'flex';
          // Trigger reflow
          void modal.offsetWidth;
          modal.style.opacity = '1';
          modalImg.style.transform = 'scale(1)';
        });

        card.appendChild(img);
        wrap.appendChild(card);
      });
    }).catch(() => { });



    // Toppers preview (admin-featured only)
    fetch('/api/home/toppers').then(r => r.json()).then(data => {
      const wrap = document.getElementById('previewToppers'); if (!wrap) return;
      wrap.innerHTML = '';
      data.slice(0, 6).forEach(t => {
        const card = document.createElement('div'); card.className = 'card topper-card fade-in';
        const img = document.createElement('img'); img.src = t.photo; img.alt = t.name; img.loading = 'lazy'; img.decoding = 'async'; img.sizes = '(max-width: 600px) 90vw, (max-width: 1024px) 33vw, 280px';
        const info = document.createElement('div'); info.className = 'topper-info';
        const h3 = document.createElement('h3'); h3.textContent = t.name;
        const p1 = document.createElement('p'); p1.textContent = `Class ${t.className || t.class} • ${t.subject || ''}`;
        const p2 = document.createElement('p');
        const hasMarks = t.marksObtained != null && t.totalMarks != null;
        p2.textContent = hasMarks
          ? `Marks: ${t.marksObtained}/${t.totalMarks} • Percentage: ${t.marks}%`
          : `Percentage: ${t.marks}%`;
        info.appendChild(h3); info.appendChild(p1); info.appendChild(p2);
        card.appendChild(img); card.appendChild(info);
        wrap.appendChild(card);
      });
    }).catch(() => { });

    // Events preview (admin-featured only)
    fetch('/api/home/events').then(r => r.json()).then(events => {
      const wrap = document.getElementById('homeEvents'); if (!wrap) return;
      wrap.innerHTML = '';
      events.slice(0, 6).forEach(e => {
        const card = document.createElement('div'); card.className = 'card event-card fade-in';
        const img = document.createElement('img'); img.src = e.image; img.alt = e.title; img.loading = 'lazy'; img.decoding = 'async'; img.sizes = '(max-width: 600px) 90vw, (max-width: 1024px) 33vw, 280px';
        const info = document.createElement('div'); info.className = 'event-info';
        const date = document.createElement('span'); date.className = 'event-date'; date.textContent = String(e.year);
        const h3 = document.createElement('h3'); h3.textContent = e.title;
        info.appendChild(date); info.appendChild(h3);
        card.appendChild(img); card.appendChild(info);
        wrap.appendChild(card);
      });
    }).catch(() => { });

    // Faculty
    fetch('/api/home/faculty').then(r => r.json()).then(items => {
      const wrap = document.getElementById('homeFaculty');
      if (!wrap) return;

      wrap.innerHTML = items.map(f => `
        <div class="faculty-card fade-in">
          <div class="faculty-image">
            <img src="${f.photo}" alt="${f.name}" loading="lazy" decoding="async">
          </div>
          <div class="faculty-info">
            <h3>${f.name}</h3>
            <div class="designation">${f.degree}</div>
            <p>${f.subjects}</p>
          </div>
        </div>
      `).join('');
    }).catch(console.error);

    // Founder
    fetch('/api/home/founder').then(r => r.json()).then(obj => {
      const img = document.getElementById('founderImage'); if (!img) return;
      if (obj && obj.image) { img.src = obj.image; img.style.display = 'inline-block'; }
    }).catch(() => { });
  }

  // Scroll reveal for sections and cards
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('section, .card, .toppers-grid').forEach(el => {
      el.classList.add('reveal'); io.observe(el);
    });
  } catch (_) {/* noop */ }

  // Subtle 3D tilt on cards
  const maxTilt = 8; // degrees
  function handleTilt(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    const rx = (py - 0.5) * -2 * maxTilt; // invert for natural feel
    const ry = (px - 0.5) * 2 * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
  }
  function resetTilt(e) { e.currentTarget.style.transform = ''; }
  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('mousemove', handleTilt);
    card.addEventListener('mouseleave', resetTilt);
  });

  // Parallax hero background
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      hero.style.backgroundPosition = `${50 + px * 4}% ${50 + py * 4}%`;
    });
    hero.addEventListener('mouseleave', () => { hero.style.backgroundPosition = 'center'; });
  }

  // Horizontal auto-scroll carousels (students/events)
  function makeCarousel(rootId, fetcher, dir) {
    const root = document.getElementById(rootId); if (!root) return;
    const track = root.querySelector('.track'); if (!track) return;
    const direction = dir === 'rtl' ? -1 : 1;

    fetcher().then(items => {
      // Safety: if no items, do not build an infinite duplicator loop
      if (!items || !items.length) { root.style.display = 'none'; return; }
      const buildItem = (obj) => {
        const it = document.createElement('div'); it.className = 'item';
        const img = document.createElement('img'); img.src = obj.src; img.alt = obj.title || ''; img.loading = 'lazy'; img.decoding = 'async'; img.sizes = '(max-width: 600px) 70vw, 280px';
        const ovl = document.createElement('div'); ovl.className = 'ovl'; ovl.textContent = obj.caption || '';
        it.appendChild(img); it.appendChild(ovl); return it;
      };

      // build baseline items
      items.forEach(obj => track.appendChild(buildItem(obj)));
      // duplicate until we have enough width for looping
      const ensureWidth = () => {
        const rootW = root.clientWidth || 800;
        // Safety cap to avoid runaway loops
        let guard = 0;
        while (track.scrollWidth < rootW * 2.5 && guard < 50) {
          items.forEach(obj => track.appendChild(buildItem(obj)));
          guard++;
        }
      };
      ensureWidth();

      let pos = 0, playing = true, last = performance.now();
      function step(now) {
        const dt = Math.min(32, now - last); last = now;
        if (playing) {
          pos += direction * (0.04 * dt); // speed in px/ms
          const firstW = (track.firstElementChild && track.firstElementChild.clientWidth) || 280; // default width fallback
          if (direction > 0) {
            if (pos >= firstW + 16) {
              // move first to end
              track.appendChild(track.firstElementChild);
              pos = 0;
            }
          } else {
            if (Math.abs(pos) >= firstW + 16) {
              track.insertBefore(track.lastElementChild, track.firstElementChild);
              pos = 0;
            }
          }
          track.style.transform = `translateX(${direction > 0 ? -pos : pos}px)`;
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      // Pause on hover and handle touch swipe
      root.addEventListener('mouseenter', () => playing = false);
      root.addEventListener('mouseleave', () => playing = true);
      let sx = null, sp = 0;
      root.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sp = pos; playing = false; }, { passive: true });
      root.addEventListener('touchmove', (e) => { if (sx != null) { const dx = e.touches[0].clientX - sx; pos = sp - dx; track.style.transform = `translateX(${direction > 0 ? -pos : pos}px)`; } }, { passive: true });
      root.addEventListener('touchend', () => { sx = null; playing = true; });

      // Desktop drag
      let dragging = false, mx = 0;
      root.addEventListener('mousedown', (e) => { dragging = true; mx = e.clientX; sp = pos; playing = false; e.preventDefault(); });
      window.addEventListener('mousemove', (e) => { if (dragging) { const dx = e.clientX - mx; pos = sp - dx; track.style.transform = `translateX(${direction > 0 ? -pos : pos}px)`; } });
      window.addEventListener('mouseup', () => { if (dragging) { dragging = false; playing = true; } });

      // Manual controls
      const ctrls = document.createElement('div'); ctrls.className = 'carousel-controls';
      const prevBtn = document.createElement('button'); prevBtn.className = 'ctrl prev'; prevBtn.setAttribute('aria-label', 'Previous'); prevBtn.innerHTML = '&#10094;';
      const nextBtn = document.createElement('button'); nextBtn.className = 'ctrl next'; nextBtn.setAttribute('aria-label', 'Next'); nextBtn.innerHTML = '&#10095;';
      ctrls.appendChild(prevBtn); ctrls.appendChild(nextBtn); root.appendChild(ctrls);
      function goNext() {
        playing = false;
        if (direction > 0) { track.appendChild(track.firstElementChild); }
        else { track.insertBefore(track.lastElementChild, track.firstElementChild); }
        pos = 0; track.style.transform = `translateX(0px)`; playing = true;
      }
      function goPrev() {
        playing = false;
        if (direction > 0) { track.insertBefore(track.lastElementChild, track.firstElementChild); }
        else { track.appendChild(track.firstElementChild); }
        pos = 0; track.style.transform = `translateX(0px)`; playing = true;
      }
      prevBtn.addEventListener('click', goPrev);
      nextBtn.addEventListener('click', goNext);
      window.addEventListener('resize', ensureWidth);
    }).catch(() => { });
  }

  // Build Students carousel from featured toppers
  makeCarousel('studentsCarousel', async () => {
    const data = await fetch('/api/home/toppers').then(r => r.json());
    return data.map(t => ({
      src: t.photo,
      title: t.name,
      caption: (() => {
        const base = `${t.name} • Class ${t.className || t.class} • ${t.subject || ''}`;
        const hasMarks = t.marksObtained != null && t.totalMarks != null;
        const perf = hasMarks ? `Marks: ${t.marksObtained}/${t.totalMarks} • Percentage: ${t.marks}%` : `Percentage: ${t.marks}%`;
        return `${base} • ${perf} • ${t.year}`;
      })()
    }));
  }, 'ltr');

  // Build Events carousel from featured events (horizontal)
  makeCarousel('eventsCarousel', async () => {
    const data = await fetch('/api/home/events').then(r => r.json());
    return data.map(e => ({ src: e.image, title: e.title, caption: `${e.title} • ${e.year}` })).slice(0, 50);
  }, 'rtl');

  // Populate Founder section dynamically if present
  (async function () {
    try {
      const sec = document.querySelector('.founder-section'); if (!sec) return;
      const data = await fetch('/api/home/founder').then(r => r.json());
      if (!data) return;
      const img = sec.querySelector('.founder-photo');
      const name = sec.querySelector('.founder-details h2');
      const role = sec.querySelector('.founder-details p:nth-of-type(1)');
      const qual = sec.querySelector('.founder-details p:nth-of-type(2)');
      const contact = sec.querySelector('.founder-details p:last-of-type');
      const ig = sec.querySelector('.social-links a[href*="instagram"]');
      const wa = sec.querySelector('.social-links a[href*="wa.me"]');
      const fb = sec.querySelector('.social-links a[href*="facebook"]');
      if (img && (data.photo || data.image)) img.src = data.photo || data.image;
      if (data.name && name) name.textContent = data.name;
      if (data.title && role) role.textContent = data.title;
      if (data.qualification && qual) qual.textContent = data.qualification;
      if (data.contact && contact) contact.textContent = `Contact: ${data.contact}`;
      if (data.instagram && ig) ig.href = data.instagram;
      if (data.whatsapp && wa) wa.href = data.whatsapp.startsWith('http') ? data.whatsapp : `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`;
      if (data.facebook && fb) fb.href = data.facebook;
    } catch (_) {/* ignore */ }
  })();

  // Click-to-fullsize photo overlay (works for gallery, cards, carousels)
  (function () {
    // Store scroll position and disable body scroll when overlay is open
    let scrollPosition = 0;
    let isInitialized = false;

    // Initialize zoom functionality
    function initZoom() {
      if (isInitialized) return;
      isInitialized = true;

      // Add mutation observer to handle dynamically loaded content
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            // Small delay to ensure images are loaded
            setTimeout(initImageZoom, 100);
          }
        });
      });

      // Start observing the document
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Initial setup
      initImageZoom();
    }

    // Initialize zoom on DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZoom);
    } else {
      initZoom();
    }

    // Initialize zoom for images
    function initImageZoom() {
      // Get all images that should have zoom functionality
      const zoomableImages = document.querySelectorAll('img:not(.no-zoom):not(#studentsCarousel img):not(#eventsCarousel img):not(#featuredCards img):not(#previewToppers img):not(.toppers-section img)');

      zoomableImages.forEach(img => {
        // Remove any existing click handlers to prevent duplicates
        img.removeEventListener('click', handleImageClick);

        // Add click handler for zoom
        img.addEventListener('click', handleImageClick);

        // Add cursor pointer to indicate zoomable
        img.style.cursor = 'zoom-in';
      });
    }

    // Handle image click for zoom
    function handleImageClick(e) {
      // Prevent default behavior
      e.preventDefault();
      e.stopPropagation();

      // Store the current scroll position
      const currentScrollY = window.scrollY;

      // Open the overlay
      openOverlayFrom(this);

      // Store the scroll position for restoration
      originalScrollY = currentScrollY;
    }

    // Only enable zoom for specific images that are not in excluded sections
    const SEL = [
      '.g-item img:not(#previewToppers img)',
      '.card img:not(#featuredCards img, .toppers-section img)',
      '.topper-card img:not(#previewToppers img)',
      '.event-card img',
      '.hscroll .item img:not(#studentsCarousel img):not(#eventsCarousel img)'
    ].filter(Boolean).join(',');

    // Create overlay root once
    let overlay = document.querySelector('.photo-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'photo-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Image preview');
      overlay.tabIndex = -1;
      const big = document.createElement('img');
      overlay.appendChild(big);
      document.body.appendChild(overlay);
    }
    const bigImg = overlay.querySelector('img');

    let open = false;
    let scrollHandler = null;
    let prevFocus = null;

    function closeOverlay() {
      if (!open) return;
      open = false;

      // Get the original scroll position
      const scrollY = originalScrollY || Math.abs(parseInt(document.body.style.top || '0'));

      // Remove the overlay
      overlay.classList.remove('show');
      overlay.removeAttribute('aria-hidden');

      // Restore body styles
      const restoreStyles = () => {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.scrollBehavior = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };

      // Restore focus and remove event listeners
      if (prevFocus) prevFocus.focus();
      window.removeEventListener('keydown', onKey);
      overlay.removeEventListener('click', closeOverlay);
      overlay.removeEventListener('keydown', onTrapTab);

      // Small delay to ensure smooth transition
      requestAnimationFrame(() => {
        restoreStyles();
        // Force reflow
        void document.body.offsetHeight;
      });
    }

    function onKey(e) { if (e.key === 'Escape') closeOverlay(); }

    function onTrapTab(e) {
      if (!open) return;
      if (e.key !== 'Tab') return;
      // Only focusable is the overlay itself; keep focus there
      e.preventDefault();
      overlay.focus({ preventScroll: true });
    }

    function openOverlayFrom(imgEl) {
      // Prevent default to avoid any link following
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Get the current scroll position
      const currentScrollY = originalScrollY || window.scrollY;

      // Disable body scroll while keeping the current scroll position
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;

      const src = imgEl.src;
      const alt = imgEl.alt || '';
      const rect = imgEl.getBoundingClientRect();

      // Ensure we maintain the scroll position
      window.scrollTo(0, currentScrollY);
      // create a clone for zoom animation
      const clone = imgEl.cloneNode(false);
      clone.style.position = 'fixed';
      clone.style.left = rect.left + 'px';
      clone.style.top = rect.top + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      clone.style.objectFit = 'contain';
      clone.style.zIndex = 2001;
      clone.style.boxShadow = 'var(--shadow-xl)';
      clone.style.borderRadius = getComputedStyle(imgEl).borderRadius || '12px';
      clone.style.transition = 'all 280ms ease';
      document.body.appendChild(clone);

      // compute target size centered in viewport (95vw x 95vh)
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      // Create a temp image to know natural aspect ratio if needed (fallback to current rect)
      const iw = rect.width, ih = rect.height; // lightweight: use on-screen size; it's good enough
      const maxW = vw * 0.95, maxH = vh * 0.95;
      const scale = Math.min(maxW / iw, maxH / ih);
      const tw = Math.max(1, iw * scale);
      const th = Math.max(1, ih * scale);
      const tl = Math.round((vw - tw) / 2);
      const tt = Math.round((vh - th) / 2);

      // show overlay behind and animate clone to center
      bigImg.src = src; bigImg.alt = alt;
      overlay.classList.add('show');
      open = true;
      // focus management
      prevFocus = document.activeElement;
      overlay.focus({ preventScroll: true });
      document.addEventListener('keydown', onTrapTab, true);
      requestAnimationFrame(() => {
        clone.style.left = tl + 'px';
        clone.style.top = tt + 'px';
        clone.style.width = tw + 'px';
        clone.style.height = th + 'px';
        clone.style.borderRadius = '12px';
      });

      const cleanup = () => { clone.remove(); }; // swap to overlay image after animation
      clone.addEventListener('transitionend', cleanup, { once: true });

      // Close on first scroll
      let ticking = false;
      scrollHandler = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => { closeOverlay(); ticking = false; });
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      document.addEventListener('keydown', onKey);
    }

    // Delegate click to images
    document.addEventListener('click', (e) => {
      // try direct match or ancestor image match
      let img = (e.target && e.target.matches && e.target.matches(SEL)) ? e.target : (e.target.closest && e.target.closest(SEL));
      // if a link was clicked that wraps an image, pick that image
      if (!img) {
        const link = e.target.closest && e.target.closest('a');
        if (link) img = link.querySelector && link.querySelector(SEL);
      }
      if (!img) return; // not an image click flow
      // prevent navigation from any wrapping link (including #hash)
      const a = img.closest && img.closest('a');
      if (a) e.preventDefault();
      e.stopPropagation();
      // open with zoom-from-position
      openOverlayFrom(img);
    });

    // Close when clicking overlay itself
    overlay.addEventListener('click', closeOverlay);
  })();

  // Subtle custom cursor tracker with toggle
  (function () {
    const btn = document.getElementById('cursorToggle');
    const stateKey = 'cursorFxEnabled';
    let enabled = localStorage.getItem(stateKey);
    if (enabled == null) enabled = 'true';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    function setEnabled(v) { enabled = String(v); localStorage.setItem(stateKey, enabled); ring.style.display = v ? 'block' : 'none'; }
    setEnabled(enabled === 'true');
    let x = 0, y = 0, tx = 0, ty = 0; const lerp = (a, b, t) => a + (b - a) * t;
    function move(e) { if (enabled !== 'true') return; x = e.clientX; y = e.clientY; }
    function raf() { if (enabled === 'true') { tx = lerp(tx, x, 0.15); ty = lerp(ty, y, 0.15); ring.style.transform = `translate(${tx}px, ${ty}px)`; } requestAnimationFrame(raf); }
    document.addEventListener('mousemove', move, { passive: true }); requestAnimationFrame(raf);
    if (btn) { btn.addEventListener('click', () => setEnabled(!(enabled === 'true'))); }
  })();

  // Gallery page: tabs and labeled grid items
  (function () {
    if (!(window.location.pathname.endsWith('gallery.html') || window.location.pathname.endsWith('/gallery.html'))) return;
    const grid = document.getElementById('galleryGrid');
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    if (!grid || !tabs.length) return;

    const apis = {
      toppers: async () => {
        const data = await fetch('/api/toppers').then(r => r.json());
        return data.map(t => ({
          src: t.photo,
          cap: `${t.name} • Class ${t.className || t.class} • ${t.subject || '—'} • ${t.marks}% • ${t.year}`
        }));
      },
      events: async () => {
        const data = await fetch('/api/events').then(r => r.json());
        return data.map(e => ({ src: e.image, cap: `${e.title} • ${e.year}` }));
      },
      classroom: async () => {
        const data = await fetch('/api/home/faculty').then(r => r.json());
        return data.map(f => ({ src: f.photo || f, cap: f.name ? `${f.name} • ${f.subjects || ''}` : 'Classroom' }));
      },
      pamphlets: async () => {
        const data = await fetch('/api/home/pamphlets').then(r => r.json());
        return data.map(src => ({ src, cap: 'Pamphlet' }));
      }
    };

    async function render(kind) {
      try {
        grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        const items = await (apis[kind] ? apis[kind]() : []);
        if (!items.length) { grid.innerHTML = '<div style="text-align:center; color:var(--text-secondary); padding:2rem;">No items yet.</div>'; return; }
        grid.innerHTML = '';
        items.forEach(it => {
          const wrap = document.createElement('div'); wrap.className = 'g-item fade-in';
          const img = document.createElement('img'); img.src = it.src; img.alt = it.cap || ''; img.loading = 'lazy'; img.decoding = 'async'; img.sizes = '(max-width: 600px) 50vw, (max-width: 1024px) 25vw, 220px';
          const cap = document.createElement('div'); cap.className = 'g-cap'; cap.textContent = it.cap || '';
          wrap.appendChild(img); wrap.appendChild(cap); grid.appendChild(wrap);
        });
      } catch (_e) {
        grid.innerHTML = '<div style="text-align:center; color:var(--error); padding:2rem;">Failed to load items.</div>';
      }
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.tab);
      });
    });

    // initial
    const active = tabs.find(b => b.classList.contains('active')) || tabs[0];
    if (active) render(active.dataset.tab);
  })();
});

// Secret keyboard shortcut for admin access: Ctrl + Alt + A
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
    window.location.href = '/admin-login.html';
  }
});

// ---- GSAP + ScrollTrigger Integration ----
(function () {
  const gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  const stCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  async function setup() {
    try {
      if (!window.gsap) await loadScript(gsapCdn);
      if (!window.ScrollTrigger) await loadScript(stCdn);
      gsap.registerPlugin(ScrollTrigger);

      // Page enter animation
      document.body.classList.add('page-enter');
      requestAnimationFrame(() => { document.body.classList.add('page-enter-active'); });

      // Smooth page transitions on internal nav (safe guard)
      if (!window.__tpNavFxBound) {
        window.__tpNavFxBound = true;
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a');
          if (!a) return;
          const href = a.getAttribute('href');
          if (!href) return;
          // Ignore external, hash-only, download, new-tab, javascript: and same-route links
          const isInternal = href.startsWith('/');
          const isHashOnly = href === '/#' || href.startsWith('/#') || href.startsWith('#');
          const isSame = isInternal && (new URL(href, location.origin).pathname === location.pathname);
          if (!isInternal || isHashOnly || a.hasAttribute('download') || a.target || href.startsWith('javascript:') || isSame) return;
          e.preventDefault();
          document.body.classList.add('page-exit');
          document.body.classList.add('page-exit-active');
          setTimeout(() => { window.location.href = href; }, 300);
        });
      }

      // Hero heading split + stagger
      const heroH1 = document.querySelector('.hero h1');
      if (heroH1) {
        const text = heroH1.innerText;
        const parts = text.split(' ');
        heroH1.innerHTML = parts.map(w => `<span class="word" style="display:inline-block; opacity:0; transform:translateY(14px)">${w}</span>`).join(' ');
        gsap.to(heroH1.querySelectorAll('.word'), { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
      }

      // Stagger in section headings and paragraphs on scroll
      document.querySelectorAll('section').forEach(sec => {
        const targets = sec.querySelectorAll('h2, h3, p');
        if (targets.length) {
          gsap.from(targets, {
            scrollTrigger: { trigger: sec, start: 'top 85%' },
            opacity: 0,
            y: 18,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.08
          });
        }
      });

      // Cards rise-in on scroll
      document.querySelectorAll('.card').forEach(card => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 90%' },
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: 'power2.out'
        });
      });

      // Background parallax for hero
      const hero = document.querySelector('.hero');
      if (hero) {
        gsap.to(hero, {
          backgroundPosition: '50% 60%',
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
        });
      }

      // Hover zoom for 'Our Star Performers' cards
      document.querySelectorAll('.star-performer-card').forEach(card => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reset' }
        });
      });

      // Floating logo animation
      const logo = document.querySelector('.logo');
      if (logo) { gsap.to(logo, { y: -6, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); }
    } catch (_e) { /* fail silently if CDN blocked */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();

// ---- AOS Integration ----
(function () {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css'; document.head.appendChild(css);
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.min.js'; s.onload = () => {
    if (window.AOS) { AOS.init({ once: true, duration: 700, offset: 80, easing: 'ease-out-quart' }); }
  }; document.body.appendChild(s);
})();