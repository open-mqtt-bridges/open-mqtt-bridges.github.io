// A failed storage operation must never prevent content or navigation from loading.
(() => {
  let preference = 'system';
  try {
    const saved = localStorage.getItem('omb-color-mode');
    if (['light', 'dark', 'system'].includes(saved)) preference = saved;
  } catch {
    /* Color mode works without persistent browser storage. */
  }
  document.documentElement.dataset.theme = preference;
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    const label = document.getElementById('theme-label');
    const icon = document.getElementById('theme-icon');
    if (!toggle || !label || !icon) return;
    const modes = ['system', 'light', 'dark'];
    const update = () => {
      document.documentElement.dataset.theme = preference;
      label.textContent = preference[0].toUpperCase() + preference.slice(1);
      icon.textContent = { system: '◐', light: '☼', dark: '☾' }[preference];
      toggle.setAttribute(
        'aria-label',
        `Color mode: ${preference}. Switch to ${modes[(modes.indexOf(preference) + 1) % modes.length]}.`,
      );
    };
    update();
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      preference = modes[(modes.indexOf(preference) + 1) % modes.length];
      update();
      try {
        localStorage.setItem('omb-color-mode', preference);
      } catch {
        /* Session-only color mode remains available. */
      }
    });
  });
})();
