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

// Respect system preferences, with an explicit control for this page.
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.getElementById('motion-toggle');
const video = document.getElementById('hero-video');
const playback = document.getElementById('demo-toggle');
let reducedMotion = systemMotion.matches;
let userMotionPreference = false;
let userPaused = false;
let inView = false;
let automaticPause = false;

playback.hidden = false;
function syncPlayback() {
  const playing = !video.paused;
  playback.classList.toggle('is-playing', playing);
  playback.querySelector('span').textContent = playing ? 'Pause' : 'Play';
  playback.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' video compensation');
}
video.addEventListener('play', () => { userPaused = false; syncPlayback(); });
video.addEventListener('pause', () => {
  if (!automaticPause) userPaused = true;
  automaticPause = false;
  syncPlayback();
});
function pauseAutomatically() {
  if (!video.paused) { automaticPause = true; video.pause(); }
}
function updateAutoPlayback() {
  if (!inView || document.hidden || reducedMotion) pauseAutomatically();
  else if (!userPaused) video.play().catch(() => { syncPlayback(); });
}
playback.addEventListener('click', () => {
  if (video.paused) {
    userPaused = false;
    video.play().catch(syncPlayback);
  } else { userPaused = true; video.pause(); }
});
function applyMotionPreference() {
  document.body.classList.toggle('reduced-motion', reducedMotion);
  motionButton.setAttribute('aria-pressed', String(reducedMotion));
  motionButton.setAttribute('aria-label', reducedMotion ? 'Enable motion' : 'Reduce motion');
  motionButton.querySelector('span').textContent = reducedMotion ? 'Motion off' : 'Motion on';
  updateAutoPlayback();
}
motionButton.addEventListener('click', () => {
  userMotionPreference = true;
  reducedMotion = !reducedMotion;
  applyMotionPreference();
});
systemMotion.addEventListener('change', event => {
  if (!userMotionPreference) { reducedMotion = event.matches; applyMotionPreference(); }
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

let progressFrame = 0;
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0);
  progressFrame = 0;
}
addEventListener('scroll', () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
