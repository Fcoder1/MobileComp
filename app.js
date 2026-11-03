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
