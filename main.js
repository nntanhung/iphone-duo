const SOURCE = 'https://raw.githubusercontent.com/vinhcatba/iphone-duo/978e73eafb093334eb6a37c95977cee8e1223675/main.js';

(async () => {
  try {
    const response = await fetch(SOURCE, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load animation source (${response.status})`);
    let source = await response.text();

    const origin = window.location.origin;
    source = source
      .replaceAll("from 'three'", `from '${origin}/vendor/three/build/three.module.js'`)
      .replaceAll("from 'three/addons/", `from '${origin}/vendor/three/examples/jsm/`)
      .replaceAll("from './ui.js'", `from '${origin}/ui.js'`)
      .replaceAll("'./assets/", `'${origin}/assets/`);

    const blob = new Blob([source], { type: 'text/javascript' });
    const moduleUrl = URL.createObjectURL(blob);
    try {
      await import(moduleUrl);
    } finally {
      URL.revokeObjectURL(moduleUrl);
    }

    // Start the default animation automatically once the original module has
    // finished loading the model and enabled the Play button.
    const play = document.querySelector('#play');
    if (play) {
      const start = () => {
        if (!play.disabled && play.getAttribute('aria-label') !== 'Pause animation') {
          play.click();
          return true;
        }
        return false;
      };
      if (!start()) {
        const observer = new MutationObserver(() => {
          if (start()) observer.disconnect();
        });
        observer.observe(play, { attributes: true, attributeFilter: ['disabled', 'aria-label'] });
      }
    }
  } catch (error) {
    console.error('Animation bootstrap failed', error);
    alert('Unable to load the animation. Refresh the page to try again.');
  }
})();
