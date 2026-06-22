const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ----- Theme -----
const themeToggle = $('#themeToggle');
const rootEl = document.documentElement;

function setTheme(theme){
  if(theme === 'light') rootEl.setAttribute('data-theme','light');
  else rootEl.removeAttribute('data-theme');
  localStorage.setItem('theme', theme);
  const icon = themeToggle?.querySelector('.theme-toggle__icon');
  if(icon){
    icon.textContent = theme === 'light' ? '☀' : '☾';
  }
}

(function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved === 'light') setTheme('light');
  else setTheme('dark');
})();

themeToggle?.addEventListener('click', () => {
  const nowLight = rootEl.getAttribute('data-theme') === 'light';
  setTheme(nowLight ? 'dark' : 'light');
});

// ----- Mobile nav -----
const navToggle = $('.nav__toggle');
const navMenu = $('#navMenu');

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

$$('#navMenu a').forEach(a => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// ----- Smooth scroll + active hash (basic) -----
function setupSmoothScroll(){
  $$('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if(!href || href === '#') return;
    a.addEventListener('click', (e) => {
      const target = $(href);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      history.replaceState(null, '', href);
    });
  });
}
setupSmoothScroll();

// ----- Typewriter -----
(function initTypewriter(){
  const el = $('.typewriter');
  if(!el) return;
  const words = (el.dataset.words || '').split(',').map(s => s.trim()).filter(Boolean);
  if(!words.length) return;

  let i = 0;
  let current = 0;
  let deleting = false;
  const typeSpeed = 70;
  const deleteSpeed = 45;
  const holdTime = 900;

  function tick(){
    const word = words[i];
    if(!deleting){
      current++;
      el.textContent = word.slice(0, current);
      if(current === word.length){
        setTimeout(() => { deleting = true; tick(); }, holdTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      current--;
      el.textContent = word.slice(0, current);
      if(current === 0){
        deleting = false;
        i = (i + 1) % words.length;
        setTimeout(tick, 200);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  tick();
})();

// ----- Count up stats -----
(function initCounts(){
  const els = $$('[data-count]');
  if(!els.length) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = new IntersectionObserver((entries) => {
    for(const entry of entries){
      if(!entry.isIntersecting) continue;
      const el = entry.target;
      const target = Number(el.dataset.count || '0');
      if(reduceMotion){
        el.textContent = String(target);
        observer.disconnect();
        return;
      }
      let start = 0;
      const duration = 900;
      const startTime = performance.now();

      function step(now){
        const t = Math.min(1, (now - startTime)/duration);
        const eased = 1 - Math.pow(1 - t, 3);
        start = Math.floor(target * eased);
        el.textContent = String(start);
        if(t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.disconnect();
    }
  }, {threshold: 0.25});

  els.forEach(el => observer.observe(el));
})();

// ----- Project filtering -----
const chips = $$('.chip[data-filter]');
const cards = $$('.project-card');

function applyFilter(filter){
  const normalized = String(filter || 'all');
  chips.forEach(c => c.classList.toggle('chip--active', c.dataset.filter === normalized));

  cards.forEach(card => {
    const categories = (card.dataset.category || '').split(' ').map(s => s.trim());
    const show = normalized === 'all' || categories.includes(normalized);
    card.style.display = show ? '' : 'none';
  });
}

chips.forEach(chip => {
  chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
});

// ----- Project modal -----
const modalOverlay = $('#modalOverlay');
const projectModal = $('#projectModal');
const modalClose = $('#modalClose');
const modalTitle = $('#modalTitle');
const modalDesc = $('#modalDesc');
const modalTech = $('#modalTech');
const modalBullets = $('#modalBullets');
const modalLive = $('#modalLive');
const modalRepo = $('#modalRepo');

const modalContent = {
  'modal-1': {
    title: 'Example Dashboard',
    desc: 'A responsive dashboard with charts, filters, and accessible UI components.',
    tech: ['HTML', 'CSS', 'JavaScript', 'ARIA'],
    bullets: ['Filterable widgets and cards', 'Keyboard-friendly navigation', 'Clean layout system using CSS grid'],
    live: '#',
    repo: '#'
  },
  'modal-2': {
    title: 'Portfolio Builder',
    desc: 'An interactive landing page that uses reusable sections to speed up portfolio creation.',
    tech: ['HTML', 'CSS', 'JS', 'Components'],
    bullets: ['Reusable sections', 'Smooth scrolling and theme toggle', 'Form UX patterns'],
    live: '#',
    repo: '#'
  },
  'modal-3': {
    title: 'API Service',
    desc: 'REST API endpoints with validation, pagination, and structured responses.',
    tech: ['Backend', 'Validation', 'REST'],
    bullets: ['Consistent response format', 'Pagination and filtering', 'Input validation and error handling'],
    live: '#',
    repo: '#'
  },
  'modal-4': {
    title: 'Data Analyzer',
    desc: 'Python utilities for cleaning datasets and generating summary reports.',
    tech: ['Python', 'Pandas', 'Data Cleaning'],
    bullets: ['Automated cleaning pipelines', 'Summary reporting templates', 'Export-ready outputs'],
    live: '#',
    repo: '#'
  },
  'modal-5': {
    title: 'Booking UI',
    desc: 'UX-focused booking flow with validation, accessible controls, and micro-interactions.',
    tech: ['UI/UX', 'Forms', 'Validation'],
    bullets: ['Smart input validation', 'Accessible labels and controls', 'Responsive layout for mobile'],
    live: '#',
    repo: '#'
  },
  'modal-6': {
    title: 'Auth Starter',
    desc: 'Starter kit for authentication flows with roles and protected sections.',
    tech: ['Auth', 'Roles', 'Security'],
    bullets: ['Role-based access control', 'Protected routes patterns', 'Session/token handling'],
    live: '#',
    repo: '#'
  },
  'modal-7': {
    title: 'mtonga.free.je',
    desc: 'Proof screenshots for another website project hosted on mtonga.free.je.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive UI'],
    bullets: ['Mobile-friendly layout', 'Consistent styling system', 'Clear navigation and UI sections'],
    live: '#',
    repo: '#'
  }
};


let lastFocused = null;

function openModal(key){
  const data = modalContent[key];
  if(!data) return;

  lastFocused = document.activeElement;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.desc;

  modalTech.innerHTML = '';
  data.tech.forEach(t => {
    const s = document.createElement('span');
    s.className = 'tag';
    s.textContent = t;
    modalTech.appendChild(s);
  });

  modalBullets.innerHTML = '';
  data.bullets.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b;
    modalBullets.appendChild(li);
  });

  modalLive.href = data.live;
  modalRepo.href = data.repo;

  modalOverlay.hidden = false;
  projectModal.hidden = false;
  modalClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  projectModal.hidden = true;
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
  if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

$$('.project-card').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openModal(card.dataset.modal);
    }
  });
});

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && !projectModal.hidden) closeModal();
});

// ----- Contact helpers (copy) -----
function copyText(text){
  return navigator.clipboard?.writeText(text);
}

const email = 'yourname@email.com';
const phone = '+000 000 0000';

$('#emailLink')?.addEventListener('click', async () => {
  try{
    await copyText(email);
    setStatus('Copied email to clipboard ✅');
  } catch{
    setStatus('Copy failed. Please copy manually.');
  }
});

$('#phoneLink')?.addEventListener('click', async () => {
  try{
    await copyText(phone);
    setStatus('Copied phone to clipboard ✅');
  } catch{
    setStatus('Copy failed. Please copy manually.');
  }
});

$('#copyEmailBtn')?.addEventListener('click', async () => {
  try{
    await copyText(email);
    setStatus('Copied email to clipboard ✅');
  } catch{
    setStatus('Copy failed. Please copy manually.');
  }
});

function setStatus(msg){
  const statusEl = $('.form-status');
  if(!statusEl) return;
  statusEl.textContent = msg;
}

// ----- Contact form demo submit -----
const form = $('#contactForm');
const status = $('.form-status');

function setFieldError(fieldName, message){
  const err = $(`.field-error[data-error-for="${fieldName}"]`);
  if(err) err.textContent = message || '';
}

function validate(){
  let ok = true;
  $$('#name,#email,#topic,#message').forEach(inp => {
    const name = inp.id;
    const value = inp.value.trim();
    setFieldError(name, '');

    if(name === 'name'){
      if(value.length < 2){ setFieldError(name, 'Please enter at least 2 characters.'); ok = false; }
    }
    if(name === 'email'){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){ setFieldError(name, 'Please enter a valid email address.'); ok = false; }
    }
    if(name === 'topic'){
      if(!value){ setFieldError(name, 'Please choose a topic.'); ok = false; }
    }
    if(name === 'message'){
      if(value.length < 10){ setFieldError(name, 'Please write at least 10 characters.'); ok = false; }
    }
  });
  return ok;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!validate()){
    if(status) status.textContent = 'Please fix the highlighted fields.';
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  // Demo: create a mailto link instead of backend
  const subject = encodeURIComponent(`[Portfolio] ${data.topic} from ${data.name}`);
  const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

  if(status){
    status.textContent = 'Opening your email client…';
  }
  window.location.href = mailto;
});

$('#fillDemo')?.addEventListener('click', () => {
  $('#name').value = 'Grace';
  $('#email').value = 'grace@example.com';
  $('#topic').value = 'Project inquiry';
  $('#message').value = 'Hi! I found your portfolio and would love to discuss a web project. Let’s connect.';
  status && (status.textContent = 'Demo message filled. You can submit now.');
});

// ----- Footer year -----
$('#year').textContent = String(new Date().getFullYear());

