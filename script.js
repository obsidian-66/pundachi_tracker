import {FaceDetector,FilesetResolver} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs";

const video=document.getElementById("video"),canvas=document.getElementById("overlay"),ctx=canvas.getContext("2d");
const startBtn=document.getElementById("startBtn"),switchBtn=document.getElementById("switchBtn"),stopBtn=document.getElementById("stopBtn");
const statusEl=document.getElementById("status"),loading=document.getElementById("loading"),loadingText=document.getElementById("loadingText"),cameraOff=document.getElementById("cameraOff"),errorBox=document.getElementById("errorBox");
const faceCountEl=document.getElementById("faceCount"),confidenceEl=document.getElementById("confidence"),cameraStateEl=document.getElementById("cameraState"),fpsEl=document.getElementById("fps");

let detector=null,stream=null,running=false,facingMode="user",lastVideoTime=-1,frameCounter=0,fpsStart=performance.now();

function showError(message){errorBox.textContent=message;errorBox.classList.remove("hidden")}
function clearError(){errorBox.textContent="";errorBox.classList.add("hidden")}

async function loadDetector(){
 if(detector)return;
 loading.classList.remove("hidden");loadingText.textContent="Loading face detector…";
 try{
  const vision=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm");
  detector=await FaceDetector.createFromOptions(vision,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",delegate:"CPU"},runningMode:"VIDEO",minDetectionConfidence:.5,minSuppressionThreshold:.3});
  loading.classList.add("hidden");
 }catch(e){loading.classList.add("hidden");throw new Error("Face detector could not be loaded. Check your internet connection and reload the page.")}
}

async function openCamera(){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("This browser cannot access the camera. Open the GitHub Pages HTTPS URL in a modern Chrome, Safari, or Edge browser.");
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facingMode},width:{ideal:1280},height:{ideal:720}}});
 video.srcObject=stream;
 await new Promise(resolve=>{if(video.readyState>=1)resolve();else video.onloadedmetadata=resolve});
 await video.play();canvas.width=video.videoWidth;canvas.height=video.videoHeight;
}

async function startCamera(){
 startBtn.disabled=true;statusEl.textContent="Starting…";clearError();
 try{
  await loadDetector();await openCamera();running=true;lastVideoTime=-1;frameCounter=0;fpsStart=performance.now();
  cameraOff.classList.add("hidden");cameraStateEl.textContent="On";statusEl.textContent="Detecting";switchBtn.disabled=false;stopBtn.disabled=false;requestAnimationFrame(detect);
 }catch(e){
  console.error(e);running=false;cameraStateEl.textContent="Error";statusEl.textContent="Camera error";startBtn.disabled=false;switchBtn.disabled=true;stopBtn.disabled=true;cameraOff.classList.remove("hidden");
  let m=e.message;if(e.name==="NotAllowedError")m="Camera permission was denied. Allow camera access for this site, then reload the page.";else if(e.name==="NotFoundError")m="No camera was found on this device.";else if(e.name==="NotReadableError")m="The camera is already being used by another application.";else if(e.name==="SecurityError")m="Camera access was blocked. Make sure you are using the HTTPS GitHub Pages URL.";showError(m);
 }
}

function stopCamera(){
 running=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}video.srcObject=null;ctx.clearRect(0,0,canvas.width,canvas.height);
 faceCountEl.textContent="0";confidenceEl.textContent="—";fpsEl.textContent="0";cameraStateEl.textContent="Off";statusEl.textContent="Camera is off";
 cameraOff.classList.remove("hidden");startBtn.disabled=false;switchBtn.disabled=true;stopBtn.disabled=true;
}

async function switchCamera(){
 if(!running)return;running=false;
 try{facingMode=facingMode==="user"?"environment":"user";await openCamera();running=true;statusEl.textContent="Detecting";requestAnimationFrame(detect)}
 catch(e){running=false;showError("Could not switch cameras: "+e.message)}
}

function drawDetections(result){
 canvas.width=video.videoWidth;canvas.height=video.videoHeight;ctx.clearRect(0,0,canvas.width,canvas.height);
 const detections=result.detections||[];faceCountEl.textContent=detections.length;
 if(!detections.length){confidenceEl.textContent="—";return}
 const scores=detections.map(d=>d.categories?.[0]?.score).filter(s=>typeof s==="number");
 const avg=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0;confidenceEl.textContent=`${Math.round(avg*100)}%`;
 const scale=canvas.width/640;ctx.lineWidth=Math.max(3,3*scale);ctx.font=`bold ${Math.max(18,18*scale)}px system-ui`;ctx.textBaseline="top";
 detections.forEach((d,i)=>{
  const b=d.boundingBox;if(!b)return;ctx.strokeStyle="#67d5ff";ctx.strokeRect(b.originX,b.originY,b.width,b.height);ctx.fillText("Pundachi Detected", b.originX, b.originY - 10);
  const score=d.categories?.[0]?.score??0,label=`Face ${i+1} • ${Math.round(score*100)}%`,pad=7*scale,w=ctx.measureText(label).width,h=Math.max(28,27*scale);
  let x=b.originX,y=b.originY-h;if(y<0)y=b.originY;
  ctx.fillStyle="#67d5ff";ctx.fillRect(x,y,w+pad*2,h);ctx.fillStyle="#06111c";ctx.fillText(label,x+pad,y+pad/2);
 });
}

function updateFPS(){frameCounter++;const now=performance.now();if(now-fpsStart>=1000){fpsEl.textContent=frameCounter;frameCounter=0;fpsStart=now}}

function detect(){
 if(!running||!detector)return;
 if(video.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA&&video.videoWidth>0&&video.currentTime!==lastVideoTime){
  try{drawDetections(detector.detectForVideo(video,performance.now()));updateFPS();lastVideoTime=video.currentTime}catch(e){console.error("Detection error:",e)}
 }
 requestAnimationFrame(detect);
}

startBtn.addEventListener("click",startCamera);stopBtn.addEventListener("click",stopCamera);switchBtn.addEventListener("click",switchCamera);window.addEventListener("beforeunload",stopCamera);
if(!window.isSecureContext&&location.hostname!=="localhost")showError("This page is not running in a secure context. Use the HTTPS GitHub Pages URL for camera access.");
