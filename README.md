# iPhone Duo · Fold Preview

A browser-based study of foldable screen transitions, built with Three.js.

> **Key changes from the original fork**
>
> This project is based on the original [`jadon7/iphone-duo`](https://github.com/jadon7/iphone-duo) fork, with the following changes:
>
> - Added **Wallpaper, Launcher, and Custom** screen modes.
> - Added **custom screen image uploads**, including separate images for the outer and inner screens.
> - Added persistent custom-image handling within the current browser tab, with sensible fallback behavior when only one custom image is supplied.
> - Added **projected front-view screen rendering** that keeps screen content aligned to the hinge-side edge during folding.
> - Added image-coordinate **blur and darkening** effects that follow the projected screen content during the transition.
> - Added responsive **desktop and mobile controls**, including the fold slider, playback controls, and screen-mode controls.
> - Added **Full HD (1920 × 1080) recording at 60 fps**, with an 8.6-second WebM animation export.
> - Changed the default animation direction to follow the slider's `--progress` mapping: **0% = Outer / fully folded → 100% = Inner / fully unfolded → 0% = Outer / fully folded**.
> - Changed the initial animation state to **Outer / fully folded** and made the demo autoplay through the complete Outer → Inner → Outer cycle.
> - Added a local Three.js/vendor setup and Vercel asset-preparation workflow so the project can be deployed as a static site without committing Apple's reference assets.
>
> See the sections below for the current controls, source layout, and deployment details.

[Live demo](https://iphone-duo-tawny.vercel.app/)

## Features

- Only the cover half rotates; the rear-camera half stays fixed.
- Screen content uses a fixed front-view projection during folding. The outer UI stays aligned with its hinge-side left edge.
- Blur and darkening follow the image coordinates, including the image edges. Maximum blur radius is 72 source pixels; darkening uses twice the transition strength, capped at black.
- Wallpaper, Launcher, and Custom modes. Custom lets the user either use one image for both screens or upload separate images for the outer and inner screens.
- Drag to orbit, scroll to zoom, or use the play button and slider to fold the device.
- Responsive controls for desktop and mobile. Uploaded images stay in the current browser tab.

## Run locally

The application is static HTML, CSS, and JavaScript. No Node.js build step is required. Three.js is bundled locally.

The Apple reference assets are downloaded separately. Use Python 3.12 to prepare them:

```sh
git clone https://github.com/jadon7/iphone-duo.git
cd iphone-duo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-assets.txt
python scripts/prepare-assets.py
python -m http.server 8766 --bind 127.0.0.1
```

On Windows, activate the environment with `.venv\Scripts\activate`.

Open [http://127.0.0.1:8766/](http://127.0.0.1:8766/). Serve the directory over HTTP; opening `index.html` as a local file cannot load the model.

The preparation script downloads the original Star White USDZ and UI images from Apple, selects the model's Landscape pose, flattens its references, and rewrites texture paths for the browser. The resulting files stay in the ignored `assets/` directory. Asset URLs were verified on September 10, 2026.

## Screen controls

Choose **Wallpaper** or **Launcher** for the default screen layouts. Choose **Custom** to choose between **Single image** and **Separate images**.

- **Single image:** upload one image and use it on both screens, preserving the previous custom-image behavior.
- **Separate images:** upload one image for the outer screen and one for the inner screen.
- **Inner screen:** recommended **1600 × 1125 px**.
- **Outer screen:** recommended **775 × 1125 px**.

These dimensions match the screen projection aspect ratios used by the 3D model. Other image sizes are accepted and will be fitted to the target screen.

The slider controls the fold from closed to open. The default view is fully open and paused. The outer screen turns off at full opening.

## Source map

| File | Purpose |
| --- | --- |
| `index.html` | Screen-mode tabs and fold controls |
| `main.js` | Three.js scene, fold deformation, projected UI, blur, and darkening |
| `ui.js` | Default screen layouts |
| `style.css` | Desktop and mobile layout |
| `scripts/prepare-assets.py` | Download and prepare the reference assets |
| `vercel.json` | Install and prepare assets during Vercel builds |
| `vendor/three/` | Three.js runtime and required add-ons |

## Deploy

The Vercel project is connected to this GitHub repository. Pushes to `main` publish the production site; other branches create preview deployments.

`vercel.json` installs the asset tools and runs `scripts/prepare-assets.py` during each build. Git deployments therefore include the model and screen images without storing those assets in the repository.

For a manual Vercel deployment:

```sh
vercel link
vercel --prod
```

`.vercelignore` keeps local credentials and Git metadata out of deployments while including the prepared assets.

For other static hosts, prepare the assets locally before publishing the project directory.

## License and sources

Original application code is released under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for bundled libraries and reference assets.

Apple models and imagery are excluded from the repository and the MIT license. The preparation script links to their original sources; their use is subject to Apple's terms. This project is an independent animation study.

- [Apple iPhone Duo](https://www.apple.com/iphone-duo/)
- [Apple HIG: Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
- [Three.js](https://threejs.org/)
