import { FaceDetector, FilesetResolver } from
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs";

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");
const faceCount = document.getElementById("faceCount");
const cameraState = document.getElementById("cameraState");

let stream = null;
let detector = null;
let running = false;
let lastVideoTime = -1;

async function createDetector() {
  statusEl.textContent = "Loading face detector…";
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
  );

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.5
  });
}

async function startCamera() {
  try {
    if (!detector) await createDetector();

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    cameraState.textContent = "On";
    statusEl.textContent = "Detecting faces…";
    requestAnimationFrame(detect);
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Camera permission/error";
    cameraState.textContent = "Error";
    alert("Could not access the camera. Allow camera permission and make sure the site is using HTTPS.");
  }
}

function stopCamera() {
  running = false;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceCount.textContent = "0";
  cameraState.textContent = "Off";
  statusEl.textContent = "Camera is off";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

function drawDetections(result) {
  const rect = video.getBoundingClientRect();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = Math.max(3, canvas.width / 320);
  ctx.strokeStyle = "#38bdf8";
  ctx.fillStyle = "#38bdf8";
  ctx.font = `${Math.max(16, canvas.width / 45)}px sans-serif`;

  for (const detection of result.detections) {
    const b = detection.boundingBox;
    if (!b) continue;

    ctx.strokeRect(b.originX, b.originY, b.width, b.height);
    ctx.fillText("Pundachi Detected", b.originX, b.originY - 10);
    const score = detection.categories?.[0]?.score;
    if (score != null) {
      ctx.fillText(`${Math.round(score * 100)}%`, b.originX + 6, Math.max(22, b.originY - 8));
    }
  }

  faceCount.textContent = result.detections.length;
}

function detect() {
  if (!running || !detector) return;

  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    const result = detector.detectForVideo(video, performance.now());
    drawDetections(result);
    lastVideoTime = video.currentTime;
  }

  requestAnimationFrame(detect);
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);

window.addEventListener("beforeunload", stopCamera);
