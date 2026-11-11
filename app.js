const methods = { mobile: 'MobileComp', si: 'SI-MobileComp' };
const captureMethod = document.getElementById('method-choice');
const captureCards = document.querySelectorAll('[data-capture]');
captureMethod.addEventListener('change', () => {
  const method = captureMethod.value;
  captureCards.forEach(card => {
    const capture = card.querySelector('.compensated');
    const description = 'Result ' + card.dataset.result + ', ' + methods[method] + ' camera capture';
    if (capture.classList.contains('capture-sprite')) {
      const sourceX = method === 'mobile' ? 696 : 370;
      capture.style.setProperty('--crop-x', (-sourceX / 321 * 100) + '%');
      capture.setAttribute('aria-label', description);
    } else {
      capture.src = 'assets/' + card.dataset.capture + '-' + method + '.jpg';
      capture.alt = description;
    }
  });
  document.getElementById('capture-method-label').textContent = methods[method];
  document.getElementById('capture-status').textContent = 'All six comparisons now show ' + methods[method] + '.';
});
document.querySelectorAll('.capture-split').forEach(slider => {
  slider.addEventListener('input', () => {
    slider.closest('.wipe').style.setProperty('--split', slider.value + '%');
    slider.setAttribute('aria-valuetext', slider.value + ' percent uncompensated');
  });
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
