const names = { textile: 'Still life', storefront: 'Storefront', market: 'Market', interior: 'Interior' };
const methods = { mobile: 'MobileComp', si: 'SI-MobileComp' };
const buttons = document.querySelectorAll('[data-scene]');
const select = document.querySelector('#method-choice');
const slider = document.querySelector('#split');
let scene = 'textile';

function setImage(id, role, description) {
  const image = document.getElementById(id);
  image.src = 'assets/' + scene + '-' + role + '.jpg';
  image.alt = names[scene] + ' — ' + description;
}
function refreshCaptures() {
  const method = select.value;
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === scene)));
  setImage('after', method, methods[method] + ' camera capture');
  setImage('before', 'before', 'uncompensated camera capture');
  setImage('desired', 'desired', 'desired frame');
  setImage('surface', 'surface', 'bare projection surface');
  document.getElementById('after-caption').textContent = methods[method];
  document.getElementById('scene-status').textContent = names[scene] + ', comparing uncompensated capture with ' + methods[method] + '.';
}
buttons.forEach(button => button.addEventListener('click', () => {
  scene = button.dataset.scene;
  refreshCaptures();
}));
select.addEventListener('change', refreshCaptures);
slider.addEventListener('input', () => {
  document.getElementById('wipe').style.setProperty('--split', slider.value + '%');
  slider.setAttribute('aria-valuetext', slider.value + ' percent uncompensated');
});

const contents = document.getElementById('contents');
contents.querySelector('nav').addEventListener('click', () => { contents.open = false; });
document.addEventListener('pointerdown', event => {
  if (!contents.contains(event.target)) contents.open = false;
});
contents.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    contents.open = false;
    contents.querySelector('summary').focus();
  }
});

// Respect the visitor's system motion preference.
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const video = document.getElementById('hero-video');
let reducedMotion = systemMotion.matches;
let userPaused = false;
let inView = false;
let automaticPause = false;

video.addEventListener('play', () => { userPaused = false; });
video.addEventListener('pause', () => {
  if (!automaticPause) userPaused = true;
  automaticPause = false;
});
function pauseAutomatically() {
  if (!video.paused) { automaticPause = true; video.pause(); }
}
function updateAutoPlayback() {
  if (!inView || document.hidden || reducedMotion) pauseAutomatically();
  else if (!userPaused) video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
}
function applyMotionPreference() {
  document.body.classList.toggle('reduced-motion', reducedMotion);
  updateAutoPlayback();
}
systemMotion.addEventListener('change', event => {
  reducedMotion = event.matches;
  applyMotionPreference();
});
applyMotionPreference();
const videoObserver = new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  updateAutoPlayback();
}, { threshold: .15 });
videoObserver.observe(video);
document.addEventListener('visibilitychange', updateAutoPlayback);

// Reveal only once; content remains visible when JavaScript is unavailable.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('pending-reveal');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .06 });
document.querySelectorAll('.reveal').forEach(element => {
  if (element.getBoundingClientRect().top > innerHeight && !reducedMotion) {
    element.classList.add('pending-reveal');
    revealObserver.observe(element);
  }
});

const uiLightbox = document.getElementById('ui-lightbox');
const uiImage = document.getElementById('ui-lightbox-image');
document.querySelectorAll('[data-ui-image]').forEach(button => {
  button.addEventListener('click', () => {
    uiImage.src = button.dataset.uiImage;
    uiImage.alt = button.querySelector('img').alt;
    document.getElementById('ui-lightbox-title').textContent = button.dataset.uiTitle;
    uiLightbox.showModal();
  });
});
document.getElementById('ui-lightbox-close').addEventListener('click', () => uiLightbox.close());
uiLightbox.addEventListener('click', event => {
  if (event.target === uiLightbox) {
    const bounds = uiLightbox.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) uiLightbox.close();
  }
});
