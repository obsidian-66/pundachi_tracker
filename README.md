# Face Detection Web App

A mobile-friendly face detection website using the phone camera and MediaPipe Face Detector.

## Run locally

Because browsers restrict camera access on insecure pages, use a local HTTPS server or localhost.

If you have Python installed:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

For phone testing on the same Wi-Fi, use an HTTPS development server or deploy to GitHub Pages.

## Deploy to GitHub Pages

1. Create a new GitHub repository, for example `face-detection`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Save.
6. Wait for GitHub Pages to publish the site.
7. Open the generated HTTPS URL on your phone.
8. Press **Start Camera** and allow camera permission.

## Notes

- The page uses the MediaPipe Face Detector from a CDN.
- The camera stream is processed in the browser; this project does not upload the camera feed to a server.
- Internet access is needed to download the detector library/model unless you later make the project fully self-contained.
