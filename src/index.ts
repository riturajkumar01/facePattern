import * as faceapi from "face-api.js";

interface User {
  password: string;
  pattern:string;
  faceDescriptors: Float32Array[];
}

const users: { [key: string]: User } = {
  Person1: { password: "password123", pattern: "raj", faceDescriptors: [] },
  Person2: { password: "password456", pattern: "rishikesh", faceDescriptors: [] },
  Person3: { password: "password789", pattern: "ankur", faceDescriptors: [] },
  Person4: { password: "password123", pattern: "smita", faceDescriptors: [] },
};

// Load models for face-api.js
async function loadModels() {
  const MODEL_URL = "/models"; // Ensure the model files are available at this location
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
}

// Load labeled images dynamically
async function loadLabeledImages() {
  for (const label in users) {
    const descriptors = [];
    let i = 1;

    while (true) {
      try {
        const imgPath = `/assets/known_faces/${label}_${i}.jpg`;
        const img = await faceapi.fetchImage(imgPath);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          descriptors.push(detection.descriptor);
        }
        i++; // Move to the next image
      } catch (error) {
        break; // Stop when no more images are found
      }
    }

    if (descriptors.length > 0) {
      users[label].faceDescriptors = descriptors;
    } else {
      throw new Error(`No faces detected for ${label}`);
    }
  }
}

// Handle login form
document
  .getElementById("login-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = (document.getElementById("user-id") as HTMLInputElement)
      .value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    const status = document.getElementById("status") as HTMLDivElement;
    const enteredPattern = (document.getElementById("pattern-input")as HTMLInputElement).value;
    const storedPattern = users[userId].pattern;
    // Validate login credentials
    if (userId in users && users[userId].password === password && enteredPattern === storedPattern) {
      status.style.color = "green";
      status.textContent = "Login successful! Please enter your pattern.";
      // videoContainer.style.display = "block";
      // status.textContent = "Login successful! Please verify your face.";
      loadModels().then(() => {
        loadLabeledImages().then(() => {
          startRealTimeDetection(userId);
        });
      });
    } else {
      status.style.color = "red";
      status.textContent = "Invalid credentials.";
    }
  });

// Start webcam and face detection
async function startRealTimeDetection(userId: string) {
  const video = document.getElementById("video") as HTMLVideoElement;
  const videoContainer = document.getElementById(
    "video-container"
  ) as HTMLDivElement;
  const videoStatus = document.getElementById("video-status") as HTMLDivElement;

  videoContainer.style.display = "block";

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
        videoStatus.textContent = "Unable to access webcam.";
      });
  } else {
    videoStatus.textContent = "Your browser does not support getUserMedia.";
    return;
  }

  video.addEventListener("play", async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    
    // Append the canvas inside the video-container instead of the body
    const videoContainer = document.getElementById("video-container");
    videoContainer?.appendChild(canvas);
  
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
  
    // Ensure proper positioning of canvas over video
    Object.assign(canvas.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none", // Prevents blocking interactions
    });
  
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();
  
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  
      const faceMatcher = new faceapi.FaceMatcher(users[userId].faceDescriptors, 0.6);
      const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
  
      // Draw the detections and landmarks
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  
      results.forEach((result, index) => {
        const box = resizedDetections[index].detection.box;
        new faceapi.draw.DrawTextField(
          [""], // Empty text
          { x: box.x, y: box.y - 10 }, // Position above the box
          { fontSize: 16, fontColor: "green" }
        ).draw(canvas);
      });
  
      let faceMatched = results.some(result => result.distance <= 0.6);
  
      if (faceMatched) {
        videoStatus.textContent = "Face matched! Authentication successful.";
        document.body.style.background = "#000000";
        document.body.style.transition = "background 0.5s ease";
      } else {
        videoStatus.textContent = "Face did not match. Access denied.";
        document.body.style.backgroundColor = "#FFFFFF";
      }
    }, 100);
  });
  
}
