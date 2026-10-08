function initNavigation(root = document) {
  const button = root.querySelector('.menu-toggle');
  const nav = root.querySelector('#navigation');
  if (!button || !nav) return;
  const mobile = window.matchMedia('(max-width: 800px)');
  root.documentElement.classList.add('js-nav');
  button.hidden = false;
  function setOpen(open, focus = false) {
    button.setAttribute('aria-expanded', String(open));
    nav.hidden = mobile.matches && !open;
    if (focus) button.focus();
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);
}
initNavigation();
