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

    // Slider mapping: 0% progress = Outer / fully folded,
    // 100% progress = Inner / fully unfolded.
    // Reverse the original animation curve so the automatic cycle is
    // Outer -> Inner -> Outer.
    source = source.replace(
      `if (ready && playing) {
    phase = (phase + delta) % 8.6;
    let value;
    if (phase < 1.2) value = 180;
    else if (phase < 4.3) value = 90 * (1 + Math.cos((phase - 1.2) / 3.1 * Math.PI));
    else if (phase < 5.5) value = 0;
    else value = 90 * (1 - Math.cos((phase - 5.5) / 3.1 * Math.PI));
    setAngle(value);
  }`,
      `if (ready && playing) {
    phase = (phase + delta) % 8.6;
    let value;
    if (phase < 1.2) value = 0;
    else if (phase < 4.3) value = 90 * (1 - Math.cos((phase - 1.2) / 3.1 * Math.PI));
    else if (phase < 5.5) value = 180;
    else value = 90 * (1 + Math.cos((phase - 5.5) / 3.1 * Math.PI));
    setAngle(value);
  }`
    );

    // Keep manual Play behavior, but let the initial automatic start begin
    // exactly at phase 0 so the first 1.2s is the fully folded Outer state.
    source = source.replace(
      `if (!playing) phase = 1.2 + Math.acos(2 * angle / 180 - 1) / Math.PI * 3.1;`,
      `if (!playing) {
    phase = window.__iphoneDuoAutoStart ? 0 : 1.2 + Math.acos(2 * angle / 180 - 1) / Math.PI * 3.1;
    window.__iphoneDuoAutoStart = false;
  }`
    );

    // The source normally initializes to 180°. Use 0° so the slider and
    // rendered model start at Outer / fully folded.
    source = source.replace('setAngle(180);', 'setAngle(0);');

    const blob = new Blob([source], { type: 'text/javascript' });
    const moduleUrl = URL.createObjectURL(blob);
    try {
      await import(moduleUrl);
    } finally {
      URL.revokeObjectURL(moduleUrl);
    }

    const play = document.querySelector('#play');
    if (play) {
      const start = () => {
        if (!play.disabled) {
          window.__iphoneDuoAutoStart = true;
          if (play.getAttribute('aria-label') !== 'Pause animation') {
            play.click();
          }
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
