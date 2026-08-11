# Face Detection V2

Mobile-friendly face detection for GitHub Pages.

Features: smartphone camera, front/rear camera switch, real-time detection, bounding boxes, text labels with confidence, face count, average confidence, FPS, Start/Stop, and useful camera errors.

## GitHub Pages
1. Create a public repository.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Settings -> Pages -> Deploy from a branch -> `main` -> `/ (root)` -> Save.
4. Open the generated HTTPS URL on your phone.
5. Press Start Camera and allow permission.

The detector uses MediaPipe Tasks Vision in VIDEO mode with CPU processing for compatibility. An internet connection is needed to load the library/model.
