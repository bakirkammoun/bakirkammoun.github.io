'use strict';

/* ── TYPED TEXT ─────────────────────────────── */
class TypedText {
  constructor(el, texts, speed = 80, deleteSpeed = 45, pause = 2000) {
    this.el = el; this.texts = texts;
    this.speed = speed; this.deleteSpeed = deleteSpeed; this.pause = pause;
    this.i = 0; this.j = 0; this.deleting = false;
    if (el) this.tick();
  }
  tick() {
    const cur = this.texts[this.i];
    if (this.deleting) {
      this.el.textContent = cur.slice(0, --this.j);
    } else {
      this.el.textContent = cur.slice(0, ++this.j);
    }
    let delay = this.deleting ? this.deleteSpeed : this.speed;
    if (!this.deleting && this.j === cur.length) {
      delay = this.pause; this.deleting = true;
    } else if (this.deleting && this.j === 0) {
      this.deleting = false;
      this.i = (this.i + 1) % this.texts.length;
      delay = 400;
    }
    setTimeout(() => this.tick(), delay);
  }
}

/* ── COUNTER ─────────────────────────────────── */
function animateCounter(el, target, suffix = '', duration = 1600) {
  const start = performance.now();
  const run = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

/* ── SCROLL REVEAL ───────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── SKILL BARS ──────────────────────────────── */
function initSkillBars() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const bar = e.target;
      const pct = bar.dataset.pct;
      setTimeout(() => { bar.style.width = pct + '%'; }, 150);
      io.unobserve(bar);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.sk-bar').forEach(b => io.observe(b));
}

/* ── COUNTERS ────────────────────────────────── */
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      animateCounter(el, +el.dataset.target, el.dataset.suffix || '');
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => io.observe(el));
}

/* ── EXPERIENCE ACCORDION ────────────────────── */
function initAccordion() {
  document.querySelectorAll('.exp-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.exp-item');
      const body = item.querySelector('.exp-body');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.exp-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.exp-body').style.maxHeight = '0';
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ── SKILLS FILTER ───────────────────────────── */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.s-tab');
  const cards = document.querySelectorAll('.skill-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;

      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        if (match) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        }
      });
    });
  });

  // Apply smooth transitions to skill cards
  cards.forEach(c => {
    c.style.transition = 'opacity .3s ease, transform .3s ease, box-shadow .25s ease, border-color .25s ease';
  });
}

/* ── NAVBAR ──────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    document.getElementById('scroll-top').classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = toggle.classList.toggle('active');
    links.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
  });

  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
    });
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = links?.querySelectorAll('a[href^="#"]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navLinks?.forEach(a => a.classList.toggle('active-link', a.getAttribute('href') === `#${cur}`));
  }, { passive: true });
}

/* ── SMOOTH SCROLL ───────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
      }
    });
  });
}

/* ── CONTACT FORM ────────────────────────────── */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('form-submit-btn');
    btn.textContent = '✓ Message sent!';
    btn.disabled = true;
    btn.style.background = '#22c55e';
    showNotif('✅ Thank you! Your message has been received.');
    setTimeout(() => {
      form.reset();
      btn.innerHTML = 'Send Message →';
      btn.disabled = false;
      btn.style.background = '';
    }, 3500);
  });
}

/* ── NOTIFICATION ────────────────────────────── */
function showNotif(msg) {
  const old = document.querySelector('.notif');
  if (old) old.remove();
  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `<span class="notif-ic">✦</span>${msg}`;
  document.body.appendChild(n);
  requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('show')));
  setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 500); }, 3500);
}

/* ── SCROLL TOP ──────────────────────────────── */
function initScrollTop() {
  document.getElementById('scroll-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── GALLERY LIGHTBOX ────────────────────────── */
function initGallery() {
  document.querySelectorAll('.gal-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <div class="lb-close">×</div>
        <img src="${src}" alt="${alt}">
        <div class="lb-cap">${alt}</div>
      `;
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => lb.classList.add('active'), 10);
      
      const close = () => {
        lb.classList.remove('active');
        setTimeout(() => { lb.remove(); document.body.style.overflow = ''; }, 300);
      };
      
      lb.addEventListener('click', close);
      lb.querySelector('.lb-close').addEventListener('click', close);
    });
  });
}

function initHeroFloat() {
  const badges = document.querySelectorAll('.hero-badge');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    badges.forEach((b, i) => {
      const factor = (i + 1) * 0.5;
      b.style.transform = `translate(${x * factor}px, ${y * factor}px) rotate(${x * 0.1}deg)`;
    });
  });
}

/* ── HOVER TILT on project cards ─────────────── */
function initTilt() {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translate(-3px,-3px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.boxShadow = `${6 + x * 4}px ${6 + y * 4}px 0 #191a23`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

/* ── INIT ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initScrollTop();
  initReveal();
  initSkillBars();
  initCounters();
  initAccordion();
  initSkillsFilter();
  initForm();
  initTilt();
  initGallery();
  initHeroFloat();

  // Open first accordion item
  const firstBody = document.querySelector('.exp-item .exp-body');
  if (firstBody) firstBody.style.maxHeight = firstBody.scrollHeight + 'px';

  console.log('%c Bakir Kammoun Portfolio ', 'background:#b9ff66;color:#191a23;font-size:13px;font-weight:bold;padding:4px 8px;border-radius:4px;border:2px solid #191a23');
});
