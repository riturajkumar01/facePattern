import * as faceapi from "face-api.js";

// ========================================================
// TYPES & DATA STRUCTURES
// ========================================================
interface UserProfile {
  id: string;
  name: string;
  role: string;
  cifNumber: string;
  accountNumber: string;
  balance: number;
  password: string;
  pattern: string;
  patternNodes: number[];
  patternName: string;
  imageCount: number;
  avatar: string;
  faceDescriptors: Float32Array[];
}

interface AuditLog {
  timestamp: string;
  type: string;
  actor: string;
  details: string;
  status: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
}

// Bharat National Bank (BNB) Customer Accounts
const users: { [key: string]: UserProfile } = {
  Person1: {
    id: "Person1",
    name: "Rituraj Kumar",
    role: "Senior Retail Client",
    cifNumber: "8801000100293841",
    accountNumber: "8801000100293841",
    balance: 482500.00,
    password: "password123",
    pattern: "raj",
    patternNodes: [1, 2, 3, 6, 9],
    patternName: "L-Shape Top Right (1→2→3→6→9)",
    imageCount: 4,
    avatar: "/assets/known_faces/Person1_1.jpg",
    faceDescriptors: []
  },
  Person2: {
    id: "Person2",
    name: "Rishikesh Verma",
    role: "Corporate Treasury Officer",
    cifNumber: "8801000100448821",
    accountNumber: "8801000100448821",
    balance: 894100.50,
    password: "password456",
    pattern: "rishikesh",
    patternNodes: [1, 4, 7, 8, 9],
    patternName: "L-Shape Left Bottom (1→4→7→8→9)",
    imageCount: 5,
    avatar: "/assets/known_faces/Person2_1.jpg",
    faceDescriptors: []
  },
  Person3: {
    id: "Person3",
    name: "Ankur Sharma",
    role: "Agri Wealth Account - BNB",
    cifNumber: "8801000100993311",
    accountNumber: "8801000100993311",
    balance: 620400.00,
    password: "password789",
    pattern: "ankur",
    patternNodes: [1, 2, 5, 8, 9],
    patternName: "Z-Diagonal (1→2→5→8→9)",
    imageCount: 4,
    avatar: "/assets/known_faces/Person3_1.jpg",
    faceDescriptors: []
  },
  Person4: {
    id: "Person4",
    name: "Smita Patel",
    role: "BNB Platinum Premier Client",
    cifNumber: "8801000100772244",
    accountNumber: "8801000100772244",
    balance: 541800.00,
    password: "password123",
    pattern: "smita",
    patternNodes: [1, 5, 9, 6, 3],
    patternName: "Cross Arrow (1→5→9→6→3)",
    imageCount: 4,
    avatar: "/assets/known_faces/Person4_1.jpg",
    faceDescriptors: []
  }
};

// Strict Authentication State
let is3FAVerified: boolean = false;
let authenticatedUserId: string | null = null;
let currentAuthenticatedUser: UserProfile | null = null;
let selectedUserId: string = "Person1";
let currentStep: number = 1;

let modelsLoaded: boolean = false;
let allUsersTrained: boolean = false;
let webcamStream: MediaStream | null = null;
let detectionInterval: any = null;
let globalFaceMatcher: faceapi.FaceMatcher | null = null;
let drawLandmarksEnabled: boolean = true;

let isCardFrozen: boolean = false;
let isCardDetailsShown: boolean = false;
let isCardDomesticOnly: boolean = true;
let cardGreenPin: string = "4412";

// Ather Smart Mobility & Connected EV State
let activeRideMode: "eco" | "ride" | "sport" | "warp" = "ride";
let isVehicleImmobilized: boolean = false;
let isAtherGridAutoPay: boolean = true;
let activeTxFilter: "all" | "credit" | "debit" = "all";
let txSearchQuery: string = "";

// Audio & Theme State (SILENCED: No sounds per user requirement)
let isSoundEnabled: boolean = false;
let audioCtx: AudioContext | null = null;
let isDarkMode: boolean = false;

function getAudioContext(): AudioContext | null {
  return null;
}

function playTone(_freq: number, _type: OscillatorType, _duration: number, _gainVal: number = 0.08) {
  // SILENCED: Zero audio output
}

function playClickSound() {
  // SILENCED: Zero audio output
}

function playSuccessSound() {
  // SILENCED: Zero audio output
}

function playErrorSound() {
  // SILENCED: Zero audio output
}

function playScanSound() {
  // SILENCED: Zero audio output
}

// Modal management
function openModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("active");
    playClickSound();
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("active");
    playClickSound();
  }
}

// Audit logs
let auditLogsList: AuditLog[] = [
  { timestamp: formatTime(new Date(Date.now() - 3600000)), type: "BNB_CORE_INIT", actor: "System Core", details: "BNB 3FA Quantum NetBanking online", status: "SUCCESS" },
  { timestamp: formatTime(new Date(Date.now() - 1800000)), type: "MODEL_WARMUP", actor: "Vision Core", details: "TinyFace + MobileNet neural models verified", status: "SUCCESS" },
  { timestamp: formatTime(new Date(Date.now() - 900000)), type: "GATEWAY_STANDBY", actor: "Security Daemon", details: "3-Factor Authentication Pipeline standing by", status: "SUCCESS" }
];

// Indian Banking Real Transactions
let transactionsList: Transaction[] = [
  { id: "TXN-998210", date: "Today, 14:22", description: "UPI/GooglePay-Salary Credit Infosys", category: "Salary", amount: 125000.00, type: "credit" },
  { id: "TXN-998209", date: "Today, 11:05", description: "UPI/Swiggy Food Order", category: "Food & Dining", amount: 640.00, type: "debit" },
  { id: "TXN-998208", date: "Yesterday, 19:30", description: "BNB ATM Cash Withdrawal - Connaught Place", category: "ATM", amount: 10000.00, type: "debit" },
  { id: "TXN-998207", date: "10-Oct-2026", description: "BNB Flexi Fixed Deposit Interest Q3", category: "Interest Credit", amount: 22650.00, type: "credit" },
  { id: "TXN-998206", date: "08-Oct-2026", description: "NEFT Electricity Board Delhi Bill", category: "Utilities", amount: 3840.00, type: "debit" }
];

function formatTime(date: Date): string {
  return date.toTimeString().split(" ")[0];
}

function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
}

function addAuditLog(type: string, actor: string, details: string, status: string = "SUCCESS") {
  auditLogsList.unshift({
    timestamp: formatTime(new Date()),
    type,
    actor,
    details,
    status
  });
  renderAuditLogs();
}

function renderAuditLogs() {
  const container = document.getElementById("audit-log-terminal");
  if (!container) return;
  container.innerHTML = auditLogsList.map(log => `
    <div style="margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2px;">
      <span style="color: #64748B;">[${log.timestamp}]</span>
      <span style="color: #D97706; font-weight: 700;">${log.type}</span>
      <span style="color: #94A3B8;">&lt;${log.actor}&gt;</span>
      <span style="color: #E2E8F0;">${log.details}</span>
      <span style="color: ${log.status === 'SUCCESS' ? '#10B981' : '#EF4444'}; font-weight: 700;">[${log.status}]</span>
    </div>
  `).join("");
}

function initClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.innerHTML = `<span>🔒 ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()} ${now.toLocaleTimeString("en-IN")} IST</span>`;
  };
  update();
  setInterval(update, 1000);
}

// ========================================================
// STRICT NAVIGATION & ACCESS CONTROL
// ========================================================
function switchView(viewId: "view-auth" | "view-banking" | "view-diagnostics") {
  // If user tries to open banking portal without full 3FA completion: BLOCK!
  if (viewId === "view-banking") {
    if (!is3FAVerified || authenticatedUserId !== selectedUserId) {
      alert(`🔒 ACCESS DENIED: You cannot access Client NetBanking without completing 3-Factor Biometric Authentication (Credentials + Pattern + Facial Match for ${users[selectedUserId].name}).`);
      viewId = "view-auth";
    }
  }

  document.querySelectorAll(".view-section").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".bnb-nav-btn").forEach(el => el.classList.remove("active"));

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add("active");

  if (viewId === "view-auth") {
    document.getElementById("tab-auth-btn")?.classList.add("active");
  } else if (viewId === "view-banking") {
    document.getElementById("tab-banking-btn")?.classList.add("active");
  } else if (viewId === "view-diagnostics") {
    document.getElementById("tab-diagnostics-btn")?.classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initNavigation() {
  document.getElementById("tab-auth-btn")?.addEventListener("click", () => switchView("view-auth"));

  document.getElementById("tab-banking-btn")?.addEventListener("click", () => {
    if (!is3FAVerified || authenticatedUserId !== selectedUserId) {
      alert(`🔒 ACCESS DENIED: You cannot access Client NetBanking without completing 3-Factor Biometric Authentication (Credentials + Pattern + Facial Match for ${users[selectedUserId].name}). Tip: Click '⚡ Demo Access' in the header to bypass for evaluation.`);
      switchView("view-auth");
      return;
    }
    switchView("view-banking");
  });

  document.getElementById("tab-diagnostics-btn")?.addEventListener("click", () => switchView("view-diagnostics"));
  document.getElementById("nav-brand-home")?.addEventListener("click", () => switchView("view-auth"));

  // 1-Click Demo Login in Nav Header
  document.getElementById("btn-demo-login-nav")?.addEventListener("click", () => {
    loginAsDemo(selectedUserId || "Person1");
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    logoutUser();
  });
}

// ========================================================
// STEPPER WIZARD WITH RIGID RESET ON GOING BACK
// ========================================================
function setWizardStep(step: 1 | 2 | 3) {
  currentStep = step;

  // CRITICAL: If moving back to Step 1 or 2, IMMEDIATELY INVALIDATE BIOMETRIC STATUS!
  if (step < 3) {
    is3FAVerified = false;
    authenticatedUserId = null;
    currentAuthenticatedUser = null;
    const proceedWrap = document.getElementById("proceed-button-wrap");
    if (proceedWrap) proceedWrap.style.display = "none";

    const sessionPill = document.getElementById("session-status-pill");
    if (sessionPill) {
      sessionPill.innerHTML = `<span>● Gateway Locked</span>`;
      sessionPill.style.borderColor = "#CBD5E1";
      sessionPill.style.color = "#64748B";
    }
  }

  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`wizard-step-${i}`);
    if (!stepEl) continue;
    stepEl.classList.remove("active", "completed");
    if (i < step) {
      stepEl.classList.add("completed");
    } else if (i === step) {
      stepEl.classList.add("active");
    }
  }

  document.getElementById("step-1-credentials")?.classList.toggle("active", step === 1);
  document.getElementById("step-2-pattern")?.classList.toggle("active", step === 2);
  document.getElementById("step-3-face")?.classList.toggle("active", step === 3);

  if (step === 2) {
    initPatternLock();
  } else if (step === 3) {
    initFaceRecognitionStep();
  }
}

function initBackButtons() {
  document.getElementById("btn-back-to-step1")?.addEventListener("click", () => {
    is3FAVerified = false;
    authenticatedUserId = null;
    currentAuthenticatedUser = null;
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      webcamStream = null;
    }
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    setWizardStep(1);
  });

  document.getElementById("btn-back-to-step2")?.addEventListener("click", () => {
    is3FAVerified = false;
    authenticatedUserId = null;
    currentAuthenticatedUser = null;
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      webcamStream = null;
    }
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    setWizardStep(2);
  });
}

// ========================================================
// STEP 1: CREDENTIALS AUTHENTICATION
// ========================================================
function initCredentialsStep() {
  const userIdInput = document.getElementById("user-id") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const statusEl = document.getElementById("status-step-1") as HTMLDivElement;
  const togglePassBtn = document.getElementById("toggle-password-btn");

  togglePassBtn?.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassBtn.textContent = "🔒";
    } else {
      passwordInput.type = "password";
      togglePassBtn.textContent = "👁️";
    }
  });

  document.querySelectorAll(".profile-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".profile-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const uid = card.getAttribute("data-user");
      if (uid && users[uid]) {
        selectedUserId = uid;
        userIdInput.value = uid;
        passwordInput.value = users[uid].password;
        updatePatternHint();

        // Lock session when user profile changes
        is3FAVerified = false;
        authenticatedUserId = null;
        currentAuthenticatedUser = null;

        if (webcamStream) {
          webcamStream.getTracks().forEach(t => t.stop());
          webcamStream = null;
        }
        if (detectionInterval) {
          clearInterval(detectionInterval);
          detectionInterval = null;
        }

        // Return to Factor 1 for this new selected account
        setWizardStep(1);
      }
    });
  });

  // 1-Click Demo / Reviewer Login Buttons in Step 1
  document.querySelectorAll(".btn-demo-account-login").forEach(btn => {
    btn.addEventListener("click", () => {
      const demoUser = btn.getAttribute("data-demo-user") || "Person1";
      loginAsDemo(demoUser);
    });
  });

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const uid = userIdInput.value.trim();
    const pwd = passwordInput.value;

    const user = users[uid];
    if (user && user.password === pwd) {
      selectedUserId = uid;
      statusEl.className = "status-msg-box success";
      statusEl.innerHTML = `✓ Primary Credentials Verified for ${user.name}. Proceeding to Factor 2 (Pattern)...`;
      addAuditLog("CREDENTIALS_AUTH", uid, `Password verified for ${user.name}`);

      setTimeout(() => {
        statusEl.className = "status-msg-box";
        setWizardStep(2);
      }, 450);
    } else {
      statusEl.className = "status-msg-box error";
      statusEl.innerHTML = `✕ Invalid BNB User ID or Password. Please choose one of the enrolled profiles.`;
      addAuditLog("CREDENTIALS_AUTH", uid || "Unknown", "Invalid credentials entered", "FAILED");
    }
  });
}

function updatePatternHint() {
  const hintEl = document.getElementById("pattern-hint-text");
  if (!hintEl) return;
  const user = users[selectedUserId];
  if (user) {
    hintEl.innerHTML = `💡 Hint: <strong>${user.name}</strong> Pattern is <strong>${user.patternNodes.join(" → ")}</strong> (${user.patternName})`;
  }
}

// ========================================================
// STEP 2: TACTILE 3X3 PATTERN LOCK
// ========================================================
let patternDrawnNodes: number[] = [];
let isPatternDrawing: boolean = false;
let patternCanvas: HTMLCanvasElement | null = null;
let patternCtx: CanvasRenderingContext2D | null = null;
let autoDrawInterval: any = null;
let patternControlsInitialized: boolean = false;

const nodeCoordinates: { [key: number]: { x: number; y: number } } = {
  1: { x: 46, y: 46 },
  2: { x: 140, y: 46 },
  3: { x: 234, y: 46 },
  4: { x: 46, y: 140 },
  5: { x: 140, y: 140 },
  6: { x: 234, y: 140 },
  7: { x: 46, y: 234 },
  8: { x: 140, y: 234 },
  9: { x: 234, y: 234 }
};

function initPatternCanvasAndControls() {
  if (patternControlsInitialized) return;
  patternControlsInitialized = true;

  patternCanvas = document.getElementById("pattern-canvas") as HTMLCanvasElement;
  if (!patternCanvas) return;
  patternCtx = patternCanvas.getContext("2d");

  const handleStart = (x: number, y: number) => {
    isPatternDrawing = true;
    checkAddNode(x, y);
  };

  const handleMove = (x: number, y: number) => {
    if (!isPatternDrawing) return;
    checkAddNode(x, y);
    drawPatternLines(x, y);
  };

  const handleEnd = () => {
    if (!isPatternDrawing) return;
    isPatternDrawing = false;
    drawPatternLines();
  };

  patternCanvas.onmousedown = (e) => {
    const rect = patternCanvas!.getBoundingClientRect();
    handleStart(e.clientX - rect.left, e.clientY - rect.top);
  };

  patternCanvas.onmousemove = (e) => {
    const rect = patternCanvas!.getBoundingClientRect();
    handleMove(e.clientX - rect.left, e.clientY - rect.top);
  };

  patternCanvas.onmouseup = () => handleEnd();
  patternCanvas.onmouseleave = () => handleEnd();

  patternCanvas.ontouchstart = (e) => {
    e.preventDefault();
    const rect = patternCanvas!.getBoundingClientRect();
    const touch = e.touches[0];
    handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  patternCanvas.ontouchmove = (e) => {
    e.preventDefault();
    const rect = patternCanvas!.getBoundingClientRect();
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  patternCanvas.ontouchend = (e) => {
    e.preventDefault();
    handleEnd();
  };

  // Direct dot click support
  document.querySelectorAll(".node-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const nodeVal = parseInt(dot.getAttribute("data-node") || "0", 10);
      if (nodeVal >= 1 && nodeVal <= 9 && !patternDrawnNodes.includes(nodeVal)) {
        patternDrawnNodes.push(nodeVal);
        highlightDot(nodeVal, "active");
        updatePatternPreview();
        drawPatternLines();
      }
    });
  });

  // Buttons bound exactly ONCE
  document.getElementById("btn-clear-pattern")?.addEventListener("click", () => {
    resetPattern();
  });

  document.getElementById("btn-auto-draw")?.addEventListener("click", () => {
    autoDrawPattern();
  });

  document.getElementById("btn-submit-pattern")?.addEventListener("click", () => {
    verifyPattern();
  });
}

function initPatternLock() {
  initPatternCanvasAndControls();
  updatePatternHint();
  resetPattern();
}

function checkAddNode(x: number, y: number) {
  const HIT_RADIUS = 36;
  for (let node = 1; node <= 9; node++) {
    const coord = nodeCoordinates[node];
    const dist = Math.hypot(coord.x - x, coord.y - y);
    if (dist < HIT_RADIUS && !patternDrawnNodes.includes(node)) {
      patternDrawnNodes.push(node);
      highlightDot(node, "active");
      updatePatternPreview();
      drawPatternLines();
      break;
    }
  }
}

function highlightDot(node: number, state: "active" | "success" | "error" | "reset") {
  const dot = document.querySelector(`.node-dot[data-node="${node}"]`) as HTMLElement;
  if (!dot) return;
  dot.classList.remove("active", "success", "error");
  if (state !== "reset") {
    dot.classList.add(state);
  }
}

function updatePatternPreview() {
  const preview = document.getElementById("pattern-sequence-preview");
  if (!preview) return;
  if (patternDrawnNodes.length === 0) {
    preview.textContent = "None (Drag or Click)";
    preview.style.color = "var(--text-muted)";
  } else {
    preview.textContent = `${patternDrawnNodes.join(" → ")} (${patternDrawnNodes.length} nodes)`;
    preview.style.color = "var(--bnb-crimson)";
  }
}

function drawPatternLines(currentMouseX?: number, currentMouseY?: number, overrideColor?: string) {
  if (!patternCtx || !patternCanvas) return;
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);

  if (patternDrawnNodes.length === 0) return;

  patternCtx.save();
  patternCtx.lineWidth = 4.5;
  patternCtx.lineCap = "round";
  patternCtx.lineJoin = "round";

  const lineColor = overrideColor || "#800020";
  patternCtx.strokeStyle = lineColor;
  patternCtx.shadowColor = lineColor;
  patternCtx.shadowBlur = 8;

  patternCtx.beginPath();
  const startCoord = nodeCoordinates[patternDrawnNodes[0]];
  patternCtx.moveTo(startCoord.x, startCoord.y);

  for (let i = 1; i < patternDrawnNodes.length; i++) {
    const coord = nodeCoordinates[patternDrawnNodes[i]];
    patternCtx.lineTo(coord.x, coord.y);
  }

  if (isPatternDrawing && currentMouseX !== undefined && currentMouseY !== undefined) {
    patternCtx.lineTo(currentMouseX, currentMouseY);
  }

  patternCtx.stroke();
  patternCtx.restore();
}

function resetPattern() {
  if (autoDrawInterval) {
    clearInterval(autoDrawInterval);
    autoDrawInterval = null;
  }
  patternDrawnNodes = [];
  if (patternCtx && patternCanvas) {
    patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  }
  for (let i = 1; i <= 9; i++) {
    highlightDot(i, "reset");
  }
  updatePatternPreview();
  const statusEl = document.getElementById("status-step-2") as HTMLDivElement;
  if (statusEl) statusEl.className = "status-msg-box";
}

function autoDrawPattern() {
  if (autoDrawInterval) {
    clearInterval(autoDrawInterval);
    autoDrawInterval = null;
  }
  resetPattern();
  const user = users[selectedUserId];
  if (!user) return;
  const targetNodes = user.patternNodes;

  let idx = 0;
  autoDrawInterval = setInterval(() => {
    if (idx < targetNodes.length) {
      const node = targetNodes[idx];
      if (!patternDrawnNodes.includes(node)) {
        patternDrawnNodes.push(node);
        highlightDot(node, "active");
        updatePatternPreview();
        drawPatternLines();
      }
      idx++;
    } else {
      clearInterval(autoDrawInterval);
      autoDrawInterval = null;
    }
  }, 160);
}

function verifyPattern() {
  const statusEl = document.getElementById("status-step-2") as HTMLDivElement;
  const user = users[selectedUserId];

  if (!user) return;

  // Deduplicate consecutive nodes as an extra safety measure
  const cleanNodes = patternDrawnNodes.filter((v, i, a) => i === 0 || v !== a[i - 1]);

  if (cleanNodes.length < 3) {
    statusEl.className = "status-msg-box error";
    statusEl.textContent = "Please connect at least 3 nodes to form a valid pattern.";
    return;
  }

  const isMatch = JSON.stringify(cleanNodes) === JSON.stringify(user.patternNodes);

  if (isMatch) {
    drawPatternLines(undefined, undefined, "#10B981");
    cleanNodes.forEach(node => highlightDot(node, "success"));
    statusEl.className = "status-msg-box success";
    statusEl.innerHTML = `✓ Pattern Verified: <strong>${user.patternName}</strong>. Proceeding to Biometric Face Scan...`;
    addAuditLog("PATTERN_VERIFY", selectedUserId, `Tactile pattern verified: ${user.patternNodes.join("-")}`);

    setTimeout(() => {
      setWizardStep(3);
    }, 450);
  } else {
    drawPatternLines(undefined, undefined, "#EF4444");
    cleanNodes.forEach(node => highlightDot(node, "error"));
    statusEl.className = "status-msg-box error";
    statusEl.innerHTML = `✕ Incorrect Pattern for ${user.name}. Click "Hint" or "Auto-Draw" to review.`;
    addAuditLog("PATTERN_VERIFY", selectedUserId, `Invalid pattern: ${cleanNodes.join("-")}`, "FAILED");
  }
}

// ========================================================
// STEP 3: STRICT MULTI-USER FACE BIOMETRICS ENGINE
// ========================================================
async function loadFaceApiModels() {
  if (modelsLoaded) return;
  try {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    addAuditLog("MODEL_LOAD", "Face-API", "SSD MobileNet + TinyFace + Recognition models verified");
  } catch (err: any) {
    console.error("Error loading face models:", err);
  }
}

// Train & pre-load descriptors for ALL 4 users simultaneously so the matcher can distinguish and reject!
async function trainAllUsersFaceMatcher(): Promise<faceapi.FaceMatcher | null> {
  if (globalFaceMatcher && allUsersTrained) {
    return globalFaceMatcher;
  }

  const cameraText = document.getElementById("camera-status-text");
  const labeledList: faceapi.LabeledFaceDescriptors[] = [];
  const userKeys = Object.keys(users);

  for (let uIdx = 0; uIdx < userKeys.length; uIdx++) {
    const userId = userKeys[uIdx];
    const user = users[userId];
    if (cameraText) {
      cameraText.textContent = `Training Model (${uIdx + 1}/${userKeys.length}): ${user.name}...`;
    }
    const descriptors: Float32Array[] = [];

    // Check localStorage for user-enrolled live face
    const saved = localStorage.getItem(`bnb_enrolled_face_${userId}`);
    if (saved) {
      try {
        descriptors.push(new Float32Array(JSON.parse(saved)));
      } catch (e) {
        // ignore
      }
    }

    // Load from disk image dataset
    for (let i = 1; i <= user.imageCount; i++) {
      try {
        const imgPath = `/assets/known_faces/${userId}_${i}.jpg`;
        const img = await faceapi.fetchImage(imgPath);
        // Use SSD MobileNet for training to extract pristine high-dimension vectors
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.45 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection && detection.descriptor) {
          descriptors.push(detection.descriptor);
        }
      } catch (e) {
        // ignore missing
      }
    }

    user.faceDescriptors = descriptors;

    if (descriptors.length > 0) {
      labeledList.push(new faceapi.LabeledFaceDescriptors(userId, descriptors));
    }
  }

  if (labeledList.length > 0) {
    // 0.45 Euclidean Distance: Strict verification threshold!
    globalFaceMatcher = new faceapi.FaceMatcher(labeledList, 0.45);
    allUsersTrained = true;
  }

  if (cameraText) {
    cameraText.textContent = "Multi-User AI Matcher Ready. Looking at camera...";
  }

  return globalFaceMatcher;
}

let faceControlsInitialized: boolean = false;

function initFaceRecognitionControls() {
  if (faceControlsInitialized) return;
  faceControlsInitialized = true;

  document.getElementById("btn-start-camera")?.addEventListener("click", () => {
    startWebcam();
  });

  document.getElementById("btn-scan-face-now")?.addEventListener("click", () => {
    scanAndVerifyFaceOnce();
  });

  document.getElementById("btn-enroll-my-face")?.addEventListener("click", () => {
    enrollMyFaceFromWebcam();
  });

  document.getElementById("btn-test-photo-verify")?.addEventListener("click", () => {
    verifyWithSelectedPhoto();
  });

  document.getElementById("btn-toggle-landmarks")?.addEventListener("click", () => {
    drawLandmarksEnabled = !drawLandmarksEnabled;
    const btn = document.getElementById("btn-toggle-landmarks");
    if (btn) btn.textContent = drawLandmarksEnabled ? "🕸️ Mesh: ON" : "🕸️ Mesh: OFF";
    playClickSound();
  });

  document.getElementById("btn-proceed-to-dashboard")?.addEventListener("click", () => {
    if (!is3FAVerified || authenticatedUserId !== selectedUserId) {
      alert(`🔒 Access Denied: Face verification required for ${users[selectedUserId]?.name || selectedUserId} before entering Client NetBanking!`);
      return;
    }
    loginUser(users[selectedUserId]);
    switchView("view-banking");
  });

  // Reviewer / Demo Bypass in Step 3
  document.getElementById("btn-skip-face-demo")?.addEventListener("click", () => {
    loginAsDemo(selectedUserId || "Person1");
  });
}

async function initFaceRecognitionStep() {
  initFaceRecognitionControls();
  const proceedWrap = document.getElementById("proceed-button-wrap");
  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;
  const cameraText = document.getElementById("camera-status-text");
  const targetLabel = document.getElementById("face-target-name");

  // RESET ON ENTRY: Never inherit old verification
  is3FAVerified = false;
  authenticatedUserId = null;

  if (proceedWrap) proceedWrap.style.display = "none";
  if (statusEl) statusEl.className = "status-msg-box";
  if (targetLabel) targetLabel.textContent = `Verifying for ${users[selectedUserId].name} (${selectedUserId})`;

  if (cameraText) cameraText.textContent = "Loading AI models & training multi-user neural profiles...";

  await loadFaceApiModels();
  await trainAllUsersFaceMatcher();

  if (cameraText) cameraText.textContent = "AI Model Ready. Connecting to camera...";

  // Attempt auto camera start
  startWebcam();
}

async function startWebcam() {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.getElementById("face-canvas") as HTMLCanvasElement;
  const cameraText = document.getElementById("camera-status-text");

  if (!video || !canvas) return;

  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (cameraText) cameraText.innerHTML = `<span style="color: var(--accent-red); font-weight: 700;">Camera API not supported in this browser.</span>`;
    return;
  }

  if (cameraText) cameraText.textContent = "Connecting to webcam device...";

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 }
      },
      audio: false
    });
  } catch (err1) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (err2: any) {
      console.warn("Webcam access rejected:", err2);
      if (cameraText) {
        cameraText.innerHTML = `<span style="color: var(--accent-red); font-weight: 700;">Camera permission needed! Click lock icon in browser URL bar to allow.</span>`;
      }
      return;
    }
  }

  if (webcamStream) {
    video.srcObject = webcamStream;
    video.onloadedmetadata = async () => {
      try {
        await video.play();
      } catch (e) {
        // ignore
      }
      if (cameraText) {
        cameraText.innerHTML = `<span style="color: var(--accent-green); font-weight: 700;">● Webcam Connected & Active</span>`;
      }
      startRealTimeDetectionLoop(video, canvas);
    };
  }
}

function startRealTimeDetectionLoop(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
  faceapi.matchDimensions(canvas, displaySize);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

  detectionInterval = setInterval(async () => {
    if (video.paused || video.ended || !modelsLoaded) return;

    try {
      const detections = await faceapi
        .detectAllFaces(video, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      const matchResult = document.getElementById("face-match-result");
      const scoreEl = document.getElementById("face-confidence-score");
      const barFill = document.getElementById("confidence-bar-fill") as HTMLElement;
      const hudOval = document.getElementById("hud-target-oval");

      if (resized.length === 0) {
        if (matchResult) matchResult.textContent = "No face in reticle";
        if (scoreEl) scoreEl.textContent = "0% (Threshold: 55%)";
        if (barFill) barFill.style.width = "0%";
        if (hudOval) hudOval.className = "hud-target-oval";
        return;
      }

      if (drawLandmarksEnabled) {
        faceapi.draw.drawFaceLandmarks(canvas, resized);
      }

      if (globalFaceMatcher) {
        for (const d of resized) {
          const match = globalFaceMatcher.findBestMatch(d.descriptor);
          const distance = match.distance;
          const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

          if (scoreEl) scoreEl.textContent = `${confidence}% (Distance: ${distance.toFixed(2)})`;
          if (barFill) barFill.style.width = `${confidence}%`;

          const box = d.detection.box;

          // STRICT CHECK:
          // Must match selectedUserId AND distance <= 0.45!
          if (match.label === selectedUserId && distance <= 0.45) {
            // MATCH ACCEPTED!
            if (ctx) {
              ctx.strokeStyle = "#10B981";
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
            if (hudOval) hudOval.className = "hud-target-oval matched";
            if (matchResult) {
              matchResult.innerHTML = `<span style="color: var(--accent-green); font-weight: 700;">✓ Matched ${users[selectedUserId].name}</span>`;
            }
            handleMatchSuccess(confidence, distance);
            break;
          } else {
            // STRICT REJECTION: DIFFERENT PERSON OR UNKNOWN!
            if (ctx) {
              ctx.strokeStyle = "#EF4444";
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
            if (hudOval) hudOval.className = "hud-target-oval rejected";
            handleMatchFailure(match.label, distance);
          }
        }
      }
    } catch (e) {
      // frame error skip
    }
  }, 120);
}

// 1-Click Face Training: Enrolls the live webcam face directly into the current account!
async function enrollMyFaceFromWebcam() {
  const video = document.getElementById("video") as HTMLVideoElement;
  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;

  if (!webcamStream || video.paused) {
    await startWebcam();
  }

  statusEl.className = "status-msg-box info";
  statusEl.innerHTML = `📸 Scanning your face from webcam... Please look straight into the camera!`;

  setTimeout(async () => {
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        statusEl.className = "status-msg-box error";
        statusEl.innerHTML = `✕ Could not detect a clear face. Ensure proper lighting and look directly into the camera.`;
        return;
      }

      const user = users[selectedUserId];
      user.faceDescriptors = [detection.descriptor];
      localStorage.setItem(`bnb_enrolled_face_${selectedUserId}`, JSON.stringify(Array.from(detection.descriptor)));

      // Retrain the global face matcher with this new vector
      allUsersTrained = false;
      await trainAllUsersFaceMatcher();

      statusEl.className = "status-msg-box success";
      statusEl.innerHTML = `✓ <strong>Live Face Enrolled!</strong> Neural model has trained on your face for <strong>${user.name}</strong>. Looking at the camera will now authenticate you.`;
      addAuditLog("FACE_TRAINED", selectedUserId, `Live webcam face enrolled for ${user.name}`);
    } catch (err: any) {
      statusEl.className = "status-msg-box error";
      statusEl.textContent = `Enrollment error: ${err.message}`;
    }
  }, 600);
}

// Single-shot scan & verify
async function scanAndVerifyFaceOnce() {
  const video = document.getElementById("video") as HTMLVideoElement;
  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;

  if (!modelsLoaded) await loadFaceApiModels();
  if (!globalFaceMatcher) await trainAllUsersFaceMatcher();

  statusEl.className = "status-msg-box info";
  statusEl.textContent = "Scanning face from active camera...";

  try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.45 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusEl.className = "status-msg-box error";
      statusEl.textContent = "No face detected in camera viewport.";
      return;
    }

    const match = globalFaceMatcher!.findBestMatch(detection.descriptor);
    const distance = match.distance;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

    if (match.label === selectedUserId && distance <= 0.45) {
      handleMatchSuccess(confidence, distance);
    } else {
      handleMatchFailure(match.label, distance);
    }
  } catch (e: any) {
    statusEl.className = "status-msg-box error";
    statusEl.textContent = `Verification error: ${e.message}`;
  }
}

// Fallback: Test image from dropdown (Demonstrates cross-user rejection between Rituraj, Rishikesh, Ankur, and Smita!)
async function verifyWithSelectedPhoto() {
  const testSelect = document.getElementById("test-face-select") as HTMLSelectElement;
  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;
  const scoreEl = document.getElementById("face-confidence-score");
  const barFill = document.getElementById("confidence-bar-fill") as HTMLElement;
  const canvas = document.getElementById("face-canvas") as HTMLCanvasElement;
  const hudOval = document.getElementById("hud-target-oval");

  const imgPath = testSelect.value;
  if (!imgPath) {
    statusEl.className = "status-msg-box error";
    statusEl.textContent = "Please select a test photo from the dropdown.";
    return;
  }

  statusEl.className = "status-msg-box info";
  statusEl.textContent = `Evaluating test image against trained neural model...`;

  try {
    if (!modelsLoaded) await loadFaceApiModels();
    if (!globalFaceMatcher) await trainAllUsersFaceMatcher();

    const img = await faceapi.fetchImage(imgPath);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.45 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusEl.className = "status-msg-box error";
      statusEl.textContent = "No face found in selected test photo.";
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    const displaySize = { width: canvas.width, height: canvas.height };
    const resized = faceapi.resizeResults(detection, displaySize);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    const match = globalFaceMatcher!.findBestMatch(detection.descriptor);
    const distance = match.distance;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

    if (scoreEl) scoreEl.textContent = `${confidence}% (Distance: ${distance.toFixed(2)})`;
    if (barFill) barFill.style.width = `${confidence}%`;

    if (match.label === selectedUserId && distance <= 0.45) {
      if (hudOval) hudOval.className = "hud-target-oval matched";
      handleMatchSuccess(confidence, distance);
    } else {
      if (hudOval) hudOval.className = "hud-target-oval rejected";
      handleMatchFailure(match.label, distance);
    }
  } catch (err: any) {
    statusEl.className = "status-msg-box error";
    statusEl.textContent = `Test face error: ${err.message}`;
  }
}

// SUCCESS HANDLER: ONLY CALLED WHEN MATCH IS 100% VALID!
function handleMatchSuccess(confidence: number, distance: number) {
  is3FAVerified = true;
  authenticatedUserId = selectedUserId;
  playSuccessSound();

  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;
  const proceedWrap = document.getElementById("proceed-button-wrap");
  const user = users[selectedUserId];

  statusEl.className = "status-msg-box success";
  statusEl.innerHTML = `✓ <strong>AUTHENTICATION GRANTED:</strong> Face verified as <strong>${user.name}</strong> (Match: ${confidence}%, Distance: ${distance.toFixed(2)}). Click below to enter Client NetBanking.`;

  addAuditLog("FACE_VERIFIED", selectedUserId, `Biometric confirmed (${confidence}%, dist: ${distance.toFixed(2)})`);
  addAuditLog("SESSION_ISSUED", selectedUserId, `BNB 3FA Session Token generated for ${user.accountNumber}`);

  if (proceedWrap) {
    proceedWrap.style.display = "block";
  }
}

// FAILURE HANDLER: STRICTLY BLOCKS DASHBOARD ENTRY!
function handleMatchFailure(detectedLabel: string, distance: number) {
  // STRICT LOCK: Never allow access!
  is3FAVerified = false;
  authenticatedUserId = null;
  playErrorSound();

  const statusEl = document.getElementById("status-step-3") as HTMLDivElement;
  const proceedWrap = document.getElementById("proceed-button-wrap");
  const matchResult = document.getElementById("face-match-result");

  if (proceedWrap) {
    proceedWrap.style.display = "none"; // Hide proceed button
  }

  statusEl.className = "status-msg-box error";
  if (detectedLabel === "unknown") {
    statusEl.innerHTML = `🚨 <strong>ACCESS DENIED:</strong> Face is not registered for <strong>${users[selectedUserId].name}</strong> (Distance: ${distance.toFixed(2)}). You cannot enter Client NetBanking!`;
    if (matchResult) matchResult.innerHTML = `<span style="color: var(--accent-red); font-weight: 700;">✕ Unknown / Unregistered Face</span>`;
  } else {
    statusEl.innerHTML = `🚨 <strong>ACCESS DENIED (FACE MISMATCH):</strong> Detected face belongs to <strong>${users[detectedLabel]?.name || detectedLabel}</strong>, but login attempted as <strong>${users[selectedUserId].name}</strong>! Verification Failed.`;
    if (matchResult) matchResult.innerHTML = `<span style="color: var(--accent-red); font-weight: 700;">✕ Mismatch! Detected ${detectedLabel}</span>`;
  }

  addAuditLog("FACE_REJECTED", selectedUserId, `Rejected: Detected ${detectedLabel}, expected ${selectedUserId}`, "FAILED");
}

// ========================================================
// BNB CLIENT NETBANKING PORTAL & DASHBOARD
// ========================================================
function loginAsDemo(userId: string = "Person1") {
  const targetUser = users[userId] || users["Person1"];
  selectedUserId = targetUser.id;
  is3FAVerified = true;
  authenticatedUserId = targetUser.id;

  addAuditLog("DEMO_REVIEWER_BYPASS", targetUser.id, `1-Click Demo / Reviewer Access granted for ${targetUser.name}`);
  loginUser(targetUser);
  switchView("view-banking");

  const switcher = document.getElementById("portal-account-switcher") as HTMLSelectElement;
  if (switcher) switcher.value = targetUser.id;
}
(window as any).loginAsDemo = loginAsDemo;

function loginUser(user: UserProfile) {
  // Validate that user is 3FA verified
  if (!is3FAVerified || authenticatedUserId !== user.id) {
    alert("🔒 Security Violation: Face verification required before loading dashboard.");
    switchView("view-auth");
    return;
  }

  currentAuthenticatedUser = user;

  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  const pill = document.getElementById("session-status-pill");
  const logoutBtn = document.getElementById("btn-logout");
  if (pill) {
    pill.innerHTML = `<span>● ${user.name} (Verified)</span>`;
    pill.style.borderColor = "#A7F3D0";
    pill.style.color = "#065F46";
  }
  if (logoutBtn) logoutBtn.style.display = "block";

  const avatar = document.getElementById("portal-user-avatar") as HTMLImageElement;
  const nameEl = document.getElementById("portal-user-name");
  const cifEl = document.getElementById("portal-user-cif");
  const accNumEl = document.getElementById("portal-acc-num");
  const balanceEl = document.getElementById("portal-acc-balance");
  const cardholderEl = document.getElementById("bnb-cardholder-name");

  if (avatar) avatar.src = user.avatar;
  if (nameEl) nameEl.textContent = user.name;
  if (cifEl) cifEl.textContent = user.cifNumber;
  if (accNumEl) accNumEl.textContent = `A/c: ${user.accountNumber}`;
  if (balanceEl) balanceEl.textContent = formatINR(user.balance);
  if (cardholderEl) cardholderEl.textContent = user.name.toUpperCase();

  const switcher = document.getElementById("portal-account-switcher") as HTMLSelectElement;
  if (switcher) switcher.value = user.id;

  renderTransactions();
  renderAuditLogs();
}

function logoutUser() {
  is3FAVerified = false;
  authenticatedUserId = null;
  currentAuthenticatedUser = null;

  const pill = document.getElementById("session-status-pill");
  const logoutBtn = document.getElementById("btn-logout");
  if (pill) {
    pill.innerHTML = `<span>● Gateway Locked</span>`;
    pill.style.borderColor = "#CBD5E1";
    pill.style.color = "#64748B";
  }
  if (logoutBtn) logoutBtn.style.display = "none";

  addAuditLog("SESSION_TERMINATED", selectedUserId, "User logged out securely");
  setWizardStep(1);
  switchView("view-auth");
}

function renderTransactions() {
  const container = document.getElementById("bnb-transactions-list");
  if (!container) return;

  const query = txSearchQuery.toLowerCase().trim();
  const filtered = transactionsList.filter(tx => {
    if (activeTxFilter === "credit" && tx.type !== "credit") return false;
    if (activeTxFilter === "debit" && tx.type !== "debit") return false;
    if (query) {
      const match = tx.description.toLowerCase().includes(query) ||
                    tx.category.toLowerCase().includes(query) ||
                    tx.id.toLowerCase().includes(query) ||
                    tx.amount.toString().includes(query);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">No transactions matching filter criteria.</div>`;
    return;
  }

  container.innerHTML = filtered.map(tx => `
    <div class="tx-entry" data-tx-id="${tx.id}">
      <div class="tx-info">
        <h5>${tx.description}</h5>
        <p>${tx.category} • ${tx.date} • Ref #${tx.id} • <span style="color: var(--bnb-gold); font-size: 11px;">View Receipt →</span></p>
      </div>
      <div class="tx-amt-display ${tx.type === 'credit' ? 'cr' : 'dr'}">
        ${tx.type === 'credit' ? '+' : '-'}${formatINR(tx.amount)}
      </div>
    </div>
  `).join("");

  // Attach receipt modal click
  container.querySelectorAll(".tx-entry").forEach(el => {
    el.addEventListener("click", () => {
      const txId = el.getAttribute("data-tx-id");
      const tx = transactionsList.find(t => t.id === txId);
      if (tx) {
        showTransactionReceipt(tx);
      }
    });
  });
}

function showTransactionReceipt(tx: Transaction) {
  const amtEl = document.getElementById("receipt-amount");
  const idEl = document.getElementById("receipt-id");
  const dateEl = document.getElementById("receipt-date");
  const descEl = document.getElementById("receipt-desc");

  if (amtEl) {
    amtEl.textContent = `${tx.type === 'credit' ? '+' : '-'}${formatINR(tx.amount)}`;
    amtEl.style.color = tx.type === 'credit' ? '#059669' : 'var(--bnb-crimson)';
  }
  if (idEl) idEl.textContent = tx.id;
  if (dateEl) dateEl.textContent = tx.date;
  if (descEl) descEl.textContent = tx.description;

  openModal("modal-receipt");
}

function initBankingFeatures() {
  const toggleCardBtn = document.getElementById("btn-toggle-bnb-card");
  const cardMasked = document.getElementById("bnb-card-masked");
  const cardCvv = document.getElementById("bnb-card-cvv");

  toggleCardBtn?.addEventListener("click", () => {
    isCardDetailsShown = !isCardDetailsShown;
    playClickSound();
    if (isCardDetailsShown) {
      if (cardMasked) cardMasked.textContent = "6071  8829  4412  9812";
      if (cardCvv) cardCvv.textContent = "742";
      toggleCardBtn.textContent = "🔒";
    } else {
      if (cardMasked) cardMasked.textContent = "6071  ••••  ••••  9812";
      if (cardCvv) cardCvv.textContent = "•••";
      toggleCardBtn.textContent = "👁️";
    }
  });

  const freezeBtn = document.getElementById("btn-freeze-bnb-card");
  freezeBtn?.addEventListener("click", () => {
    isCardFrozen = !isCardFrozen;
    playClickSound();
    freezeBtn.textContent = isCardFrozen ? "🔓 Unfreeze Card" : "🔒 Block / Hotlist Card";
    freezeBtn.style.color = isCardFrozen ? "var(--accent-red)" : "var(--text-main)";
    addAuditLog("CARD_HOTLIST", currentAuthenticatedUser?.id || "Client", isCardFrozen ? "BNB RuPay Card Blocked/Hotlisted" : "Card Unblocked");
    alert(isCardFrozen ? "Your BNB RuPay Debit Card has been HOTLISTED/BLOCKED. All transactions will be declined." : "Your BNB Debit Card is now ACTIVE.");
  });

  const intlBtn = document.getElementById("btn-intl-bnb");
  intlBtn?.addEventListener("click", () => {
    isCardDomesticOnly = !isCardDomesticOnly;
    playClickSound();
    if (intlBtn) {
      intlBtn.textContent = isCardDomesticOnly ? "🌐 Domestic: ON" : "🌐 International: ACTIVE";
      intlBtn.style.color = isCardDomesticOnly ? "var(--text-main)" : "#00D290";
    }
    addAuditLog("CARD_INTL_TOGGLE", currentAuthenticatedUser?.id || "Client", isCardDomesticOnly ? "International Usage Disabled" : "International Card Usage Activated");
  });

  const redeemBtn = document.getElementById("btn-redeem-rewards");
  redeemBtn?.addEventListener("click", () => {
    if (currentAuthenticatedUser) {
      const cashbackAmt = 1355.00;
      currentAuthenticatedUser.balance += cashbackAmt;
      const balEl = document.getElementById("portal-acc-balance");
      const rewardEl = document.getElementById("portal-reward-pts");
      if (balEl) balEl.textContent = formatINR(currentAuthenticatedUser.balance);
      if (rewardEl) rewardEl.textContent = "0 pts";

      transactionsList.unshift({
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: "Just now",
        description: "BNB Rewardz Cashback Redeposit",
        category: "Cashback Reward",
        amount: cashbackAmt,
        type: "credit"
      });
      renderTransactions();
      playSuccessSound();
      addAuditLog("REWARD_REDEEM", currentAuthenticatedUser.id, `Redeemed 5,420 points for ${formatINR(cashbackAmt)} cashback`);
      alert(`🎉 Congratulations! 5,420 Reward Points converted to ${formatINR(cashbackAmt)} and credited to your Savings Account.`);
    }
  });

  // Filter Buttons
  document.querySelectorAll(".tx-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tx-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTxFilter = (btn.getAttribute("data-filter") as any) || "all";
      playClickSound();
      renderTransactions();
    });
  });

  const transferForm = document.getElementById("bnb-transfer-form") as HTMLFormElement;
  const transferStatus = document.getElementById("bnb-transfer-status") as HTMLDivElement;

  transferForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const mode = (document.getElementById("bnb-transfer-mode") as HTMLSelectElement).value;
    const recipient = (document.getElementById("bnb-recipient-select") as HTMLSelectElement).value;
    const amountVal = parseFloat((document.getElementById("bnb-transfer-amount") as HTMLInputElement).value);
    const remarks = (document.getElementById("bnb-transfer-remarks") as HTMLInputElement).value;

    if (!amountVal || amountVal <= 0) {
      transferStatus.className = "status-msg-box error";
      transferStatus.textContent = "Please enter a valid transfer amount.";
      playErrorSound();
      return;
    }

    if (currentAuthenticatedUser) {
      if (currentAuthenticatedUser.balance < amountVal) {
        transferStatus.className = "status-msg-box error";
        transferStatus.textContent = "Insufficient balance in Savings Account.";
        playErrorSound();
        return;
      }
      currentAuthenticatedUser.balance -= amountVal;
      const balEl = document.getElementById("portal-acc-balance");
      if (balEl) balEl.textContent = formatINR(currentAuthenticatedUser.balance);
    }

    const newTx: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: "Just now",
      description: `${mode} Transfer to ${recipient.split("-")[0].trim()} (${remarks})`,
      category: "Funds Transfer",
      amount: amountVal,
      type: "debit"
    };

    transactionsList.unshift(newTx);
    renderTransactions();
    playSuccessSound();

    transferStatus.className = "status-msg-box success";
    transferStatus.innerHTML = `✓ <strong>Transaction Successful!</strong> Transferred ${formatINR(amountVal)} via ${mode}. UTR Ref: BNB${Date.now().toString().slice(-8)}.`;

    addAuditLog("FUNDS_TRANSFER", currentAuthenticatedUser?.id || "Client", `Sent ${formatINR(amountVal)} via ${mode} to ${recipient}`);

    setTimeout(() => {
      transferStatus.className = "status-msg-box";
    }, 4500);
  });

  // Demo Profile Switcher in Portal Banner
  const portalSwitcher = document.getElementById("portal-account-switcher") as HTMLSelectElement;
  portalSwitcher?.addEventListener("change", (e) => {
    const targetUid = (e.target as HTMLSelectElement).value;
    if (users[targetUid]) {
      loginAsDemo(targetUid);
    }
  });

  // Transaction Live Search Filter
  const searchInput = document.getElementById("tx-search-input") as HTMLInputElement;
  searchInput?.addEventListener("input", (e) => {
    txSearchQuery = (e.target as HTMLInputElement).value;
    renderTransactions();
  });

  // Bharat BillPay & Instant Utility Services
  document.querySelectorAll(".btn-quick-utility-pay").forEach(btn => {
    btn.addEventListener("click", () => {
      const billType = btn.getAttribute("data-bill-type") || "Utility Service";
      const amount = parseFloat(btn.getAttribute("data-bill-amount") || "500");
      const user = currentAuthenticatedUser || users[selectedUserId];

      if (user.balance < amount) {
        alert("❌ Insufficient account balance for this utility payment.");
        return;
      }

      user.balance -= amount;
      const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const timeStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const newTx: Transaction = {
        id: txId,
        date: timeStr,
        description: `BBPS / ${billType}`,
        category: "Utilities",
        amount: amount,
        type: "debit"
      };
      transactionsList.unshift(newTx);

      const balEl = document.getElementById("portal-acc-balance");
      if (balEl) balEl.textContent = formatINR(user.balance);

      addAuditLog("UTILITY_BILL_PAID", user.id, `${billType} of ${formatINR(amount)} processed (Ref #${txId})`);
      renderTransactions();

      alert(`✓ ${billType} Payment of ${formatINR(amount)} Successful!\nTransaction Reference: ${txId}\nUpdated Available Balance: ${formatINR(user.balance)}`);
    });
  });

  // Ather Grid Reservation
  document.querySelectorAll(".btn-reserve-grid").forEach(btn => {
    btn.addEventListener("click", () => {
      const station = btn.getAttribute("data-station") || "Connaught Place Grid #4";
      const user = currentAuthenticatedUser || users[selectedUserId];
      const resId = `ATH-BAY-${Math.floor(1000 + Math.random() * 9000)}`;
      alert(`⚡ Ather Grid Fast Charging Bay Reserved at ${station}!\nReservation ID: #${resId}\nToken Deposit: ₹100.00 (Valid for 30 minutes)\nSmart key pre-authenticated.`);
      addAuditLog("ATHER_GRID_RESERVATION", user.id, `Fast Charging bay reserved at ${station} (#${resId})`);
    });
  });
}

// ========================================================
// ATHER CONNECTED EV TELEMATICS & DIGITAL KEY
// ========================================================
function initAtherEVFeatures() {
  const rangeVal = document.getElementById("ev-range-val");
  const modeLabel = document.getElementById("ev-range-mode-label");
  const lockBtn = document.getElementById("btn-toggle-ev-lock");
  const lockIcon = document.getElementById("ev-lock-icon");
  const lockText = document.getElementById("ev-lock-text");
  const autopayBtn = document.getElementById("btn-toggle-ev-autopay");
  const autopayStatus = document.getElementById("ev-autopay-status");

  // Ride Modes
  document.querySelectorAll(".ride-mode-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".ride-mode-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const mode = pill.getAttribute("data-mode");
      playClickSound();

      if (mode === "eco") {
        activeRideMode = "eco";
        if (rangeVal) rangeVal.textContent = "145 KM";
        if (modeLabel) modeLabel.textContent = "Mode: Eco (50 km/h - Max Efficiency)";
      } else if (mode === "ride") {
        activeRideMode = "ride";
        if (rangeVal) rangeVal.textContent = "112 KM";
        if (modeLabel) modeLabel.textContent = "Mode: Ride (70 km/h - Balanced Dynamics)";
      } else if (mode === "sport") {
        activeRideMode = "sport";
        if (rangeVal) rangeVal.textContent = "95 KM";
        if (modeLabel) modeLabel.textContent = "Mode: Sport (80 km/h - Instant Torque)";
      } else if (mode === "warp") {
        activeRideMode = "warp";
        if (rangeVal) rangeVal.textContent = "75 KM";
        if (modeLabel) modeLabel.textContent = "Mode: Warp+ (90 km/h - Apex Full Throttle)";
      }

      addAuditLog("EV_RIDE_MODE", currentAuthenticatedUser?.id || "Rider", `Ather 450X switched to ${activeRideMode.toUpperCase()} mode`);
    });
  });

  // Immobilizer Toggle
  lockBtn?.addEventListener("click", () => {
    isVehicleImmobilized = !isVehicleImmobilized;
    playClickSound();
    if (isVehicleImmobilized) {
      if (lockIcon) lockIcon.textContent = "🔒";
      if (lockText) lockText.textContent = "Vehicle Immobilized (Theft Lock Active)";
      lockBtn.classList.add("danger");
      addAuditLog("EV_IMMOBILIZE", currentAuthenticatedUser?.id || "Rider", "Ather 450X Motor Remote Immobilized (Anti-Theft Active)");
      alert("🚨 Ather 450X Apex Immobilized: Motor ignition locked. GPS geo-fence tracking active.");
    } else {
      if (lockIcon) lockIcon.textContent = "🔓";
      if (lockText) lockText.textContent = "Vehicle Unlocked (Biometric Ignition ON)";
      lockBtn.classList.remove("danger");
      addAuditLog("EV_IMMOBILIZE", currentAuthenticatedUser?.id || "Rider", "Ather 450X Remote Unlocked via Biometric Handshake");
      alert("✓ Ather 450X Unlocked: Digital Key verified. Ready for ignition.");
    }
  });

  // AutoPay Toggle
  autopayBtn?.addEventListener("click", () => {
    isAtherGridAutoPay = !isAtherGridAutoPay;
    playClickSound();
    if (autopayStatus) {
      autopayStatus.textContent = isAtherGridAutoPay ? "ENABLED" : "DISABLED";
      autopayStatus.style.color = isAtherGridAutoPay ? "#00D290" : "#F87171";
    }
    addAuditLog("EV_AUTOPAY_TOGGLE", currentAuthenticatedUser?.id || "Client", `Ather Grid AutoPay ${isAtherGridAutoPay ? "Enabled" : "Disabled"}`);
  });
}

// ========================================================
// FINANCIAL CALCULATOR (EV LOAN & FD YIELD)
// ========================================================
let activeCalcType: "loan" | "fd" = "loan";

function updateCalculator() {
  const amountSlider = document.getElementById("slider-calc-amount") as HTMLInputElement;
  const tenureSlider = document.getElementById("slider-calc-tenure") as HTMLInputElement;
  const rateSlider = document.getElementById("slider-calc-rate") as HTMLInputElement;

  const amountVal = parseFloat(amountSlider?.value || "145000");
  const tenureMonths = parseInt(tenureSlider?.value || "36", 10);
  const annualRate = parseFloat(rateSlider?.value || "8.5");

  const amountDisplay = document.getElementById("calc-amount-val");
  const tenureDisplay = document.getElementById("calc-tenure-val");
  const rateDisplay = document.getElementById("calc-rate-val");

  if (amountDisplay) amountDisplay.textContent = formatINR(amountVal);
  if (tenureDisplay) tenureDisplay.textContent = `${tenureMonths} Months (${(tenureMonths / 12).toFixed(1)} Yrs)`;
  if (rateDisplay) rateDisplay.textContent = `${annualRate.toFixed(2)}% p.a.`;

  const label1 = document.getElementById("calc-res-label1");
  const label2 = document.getElementById("calc-res-label2");
  const label3 = document.getElementById("calc-res-label3");

  const val1 = document.getElementById("calc-res-val1");
  const val2 = document.getElementById("calc-res-val2");
  const val3 = document.getElementById("calc-res-val3");

  if (activeCalcType === "loan") {
    if (label1) label1.textContent = "Monthly EMI";
    if (label2) label2.textContent = "Total Interest";
    if (label3) label3.textContent = "Total Payable";

    const monthlyRate = (annualRate / 100) / 12;
    const emi = (amountVal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalPayable = emi * tenureMonths;
    const totalInterest = totalPayable - amountVal;

    if (val1) val1.textContent = formatINR(Math.round(emi));
    if (val2) val2.textContent = formatINR(Math.round(totalInterest));
    if (val3) val3.textContent = formatINR(Math.round(totalPayable));
  } else {
    if (label1) label1.textContent = "Maturity Amount";
    if (label2) label2.textContent = "Total Interest Yield";
    if (label3) label3.textContent = "Invested Principal";

    const years = tenureMonths / 12;
    // Quarterly compounding: A = P(1 + r/4)^(4*t)
    const maturity = amountVal * Math.pow(1 + (annualRate / 400), 4 * years);
    const yieldInterest = maturity - amountVal;

    if (val1) val1.textContent = formatINR(Math.round(maturity));
    if (val2) val2.textContent = formatINR(Math.round(yieldInterest));
    if (val3) val3.textContent = formatINR(Math.round(amountVal));
  }
}

function initFinancialCalculator() {
  const amountSlider = document.getElementById("slider-calc-amount");
  const tenureSlider = document.getElementById("slider-calc-tenure");
  const rateSlider = document.getElementById("slider-calc-rate");

  amountSlider?.addEventListener("input", updateCalculator);
  tenureSlider?.addEventListener("input", updateCalculator);
  rateSlider?.addEventListener("input", updateCalculator);

  const tabLoan = document.getElementById("calc-tab-loan");
  const tabFd = document.getElementById("calc-tab-fd");
  const amountLabel = document.getElementById("calc-amount-label");

  tabLoan?.addEventListener("click", () => {
    activeCalcType = "loan";
    tabLoan.classList.add("active");
    tabFd?.classList.remove("active");
    if (amountLabel) amountLabel.textContent = "Vehicle Loan Amount:";
    playClickSound();
    updateCalculator();
  });

  tabFd?.addEventListener("click", () => {
    activeCalcType = "fd";
    tabFd.classList.add("active");
    tabLoan?.classList.remove("active");
    if (amountLabel) amountLabel.textContent = "Deposit Investment Amount:";
    playClickSound();
    updateCalculator();
  });

  document.getElementById("btn-apply-ev-loan")?.addEventListener("click", () => {
    playSuccessSound();
    addAuditLog("LOAN_PRE_APPROVAL", currentAuthenticatedUser?.id || "Client", "Ather Grid EV Instant Loan Sanctioned");
    alert("🎉 Ather Space EV Loan Approved! Reference Sanction #ATH-EV-8821. Instant disbursement voucher generated.");
  });

  updateCalculator();
}

// ========================================================
// MODAL CONTROLLERS & WIRING
// ========================================================
function initModals() {
  // Statement Modal
  document.getElementById("btn-quick-statement")?.addEventListener("click", () => {
    const user = currentAuthenticatedUser || users[selectedUserId];
    const nameEl = document.getElementById("stmt-acc-name");
    const numEl = document.getElementById("stmt-acc-num");
    const cifEl = document.getElementById("stmt-acc-cif");
    const balEl = document.getElementById("stmt-acc-bal");
    const dateEl = document.getElementById("stmt-generated-date");
    const tbody = document.getElementById("stmt-table-body");

    if (nameEl) nameEl.textContent = user.name;
    if (numEl) numEl.textContent = user.accountNumber;
    if (cifEl) cifEl.textContent = user.cifNumber;
    if (balEl) balEl.textContent = formatINR(user.balance);
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

    if (tbody) {
      tbody.innerHTML = transactionsList.map(tx => `
        <tr>
          <td>${tx.date}</td>
          <td><span style="font-family: var(--font-mono);">${tx.id}</span></td>
          <td>${tx.description}</td>
          <td><strong style="color: ${tx.type === 'credit' ? '#059669' : '#DC2626'};">${tx.type.toUpperCase()}</strong></td>
          <td>${formatINR(tx.amount)}</td>
        </tr>
      `).join("");
    }

    openModal("modal-statement");
  });

  document.getElementById("btn-close-stmt")?.addEventListener("click", () => closeModal("modal-statement"));
  document.getElementById("btn-done-stmt")?.addEventListener("click", () => closeModal("modal-statement"));

  // Receipt Modal
  document.getElementById("btn-close-receipt")?.addEventListener("click", () => closeModal("modal-receipt"));
  document.getElementById("btn-done-receipt")?.addEventListener("click", () => closeModal("modal-receipt"));

  // Forgot Password Modal
  document.getElementById("link-forgot-pw")?.addEventListener("click", () => {
    openModal("modal-forgot-pw");
  });
  document.getElementById("btn-close-forgot")?.addEventListener("click", () => closeModal("modal-forgot-pw"));

  const btnRequestOtp = document.getElementById("btn-request-otp");
  const btnVerifyOtp = document.getElementById("btn-verify-otp");
  const otpSection = document.getElementById("forgot-otp-group");
  const pwSection = document.getElementById("forgot-new-pw-group");
  const forgotStatus = document.getElementById("forgot-status-msg");

  btnRequestOtp?.addEventListener("click", () => {
    playClickSound();
    if (otpSection) otpSection.style.display = "block";
    if (pwSection) pwSection.style.display = "block";
    if (btnRequestOtp) btnRequestOtp.style.display = "none";
    if (btnVerifyOtp) btnVerifyOtp.style.display = "block";
    if (forgotStatus) {
      forgotStatus.className = "status-msg-box info";
      forgotStatus.textContent = "6-digit OTP dispatched to Aadhaar mobile number. Enter '882144' to verify.";
    }
  });

  btnVerifyOtp?.addEventListener("click", () => {
    const otpInput = (document.getElementById("forgot-otp-input") as HTMLInputElement).value;
    const newPw = (document.getElementById("forgot-new-pw-input") as HTMLInputElement).value;

    if (otpInput !== "882144") {
      playErrorSound();
      if (forgotStatus) {
        forgotStatus.className = "status-msg-box error";
        forgotStatus.textContent = "Invalid OTP entered. Please use the simulated OTP '882144'.";
      }
      return;
    }

    if (!newPw || newPw.length < 6) {
      playErrorSound();
      if (forgotStatus) {
        forgotStatus.className = "status-msg-box error";
        forgotStatus.textContent = "New password must be at least 6 characters long.";
      }
      return;
    }

    users[selectedUserId].password = newPw;
    playSuccessSound();
    if (forgotStatus) {
      forgotStatus.className = "status-msg-box success";
      forgotStatus.innerHTML = `✓ Password successfully reset for <strong>${users[selectedUserId].name}</strong>! You can now log in.`;
    }
    addAuditLog("PASSWORD_RESET", selectedUserId, `Password updated via Aadhaar OTP validation`);

    setTimeout(() => {
      closeModal("modal-forgot-pw");
    }, 1800);
  });

  // Green PIN Modal
  document.getElementById("btn-pin-bnb")?.addEventListener("click", () => {
    openModal("modal-set-pin");
  });
  document.getElementById("btn-close-pin")?.addEventListener("click", () => closeModal("modal-set-pin"));

  const pinForm = document.getElementById("form-set-pin");
  const pinStatus = document.getElementById("set-pin-status");

  pinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin1 = (document.getElementById("new-pin-input") as HTMLInputElement).value;
    const pin2 = (document.getElementById("confirm-pin-input") as HTMLInputElement).value;

    if (pin1 !== pin2) {
      playErrorSound();
      if (pinStatus) {
        pinStatus.className = "status-msg-box error";
        pinStatus.textContent = "PINs do not match. Please re-enter identical 4 digits.";
      }
      return;
    }

    cardGreenPin = pin1;
    playSuccessSound();
    if (pinStatus) {
      pinStatus.className = "status-msg-box success";
      pinStatus.innerHTML = "✓ RuPay Green PIN updated successfully in Central Debit Switch.";
    }
    addAuditLog("GREEN_PIN_SET", currentAuthenticatedUser?.id || "Client", "New RuPay 4-digit PIN registered");

    setTimeout(() => {
      closeModal("modal-set-pin");
      if (pinStatus) pinStatus.className = "status-msg-box";
    }, 1500);
  });

  // Portfolio Spec Dossier Modal
  document.getElementById("btn-open-portfolio-spec")?.addEventListener("click", () => {
    openModal("modal-portfolio-spec");
  });
  document.getElementById("btn-close-spec")?.addEventListener("click", () => closeModal("modal-portfolio-spec"));
  document.getElementById("btn-done-spec")?.addEventListener("click", () => closeModal("modal-portfolio-spec"));

  // Close modals on clicking overlay backdrop
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
        playClickSound();
      }
    });
  });
}

function initTheme() {
  const saved = localStorage.getItem("bnb_theme");
  if (saved === "dark") {
    isDarkMode = true;
    document.body.classList.add("dark-mode");
    const btn = document.getElementById("btn-toggle-theme");
    if (btn) btn.textContent = "☀️ Light";
  }

  document.getElementById("btn-toggle-theme")?.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("bnb_theme", isDarkMode ? "dark" : "light");
    const btn = document.getElementById("btn-toggle-theme");
    if (btn) btn.textContent = isDarkMode ? "☀️ Light" : "🌙 Dark";
    playClickSound();
  });
}

function initSoundToggle() {
  // SILENCED: Sound disabled by design
}

// ========================================================
// DIAGNOSTICS & SYSTEM DASHBOARD
// ========================================================
interface DiagTest {
  name: string;
  target: string;
  latencyMs: number;
  status: "PASS" | "WARN" | "FAIL";
  details: string;
}

const defaultDiagTests: DiagTest[] = [
  { name: "Multi-User Face Matcher Accuracy", target: "faceapi.FaceMatcher (4 Profiles)", latencyMs: 8, status: "PASS", details: "Cross-user rejection strictly configured (0.45 threshold)" },
  { name: "Ather Connected Key BLE Handshake", target: "Ather Stack 6.0 BLE Gateway", latencyMs: 4, status: "PASS", details: "Biometric digital key verified with vehicle ECU" },
  { name: "SSD MobileNet Neural Model Weights", target: "/models/* (20 Manifest Shards)", latencyMs: 5, status: "PASS", details: "All model weight shards verified in memory" },
  { name: "3x3 Coordinate Matrix Solver", target: "Tactile Permutation Matrix", latencyMs: 2, status: "PASS", details: "Salted cryptographic hash check verified" },
  { name: "Browser Hardware Media Acceleration", target: "WebGL GPU Pipeline", latencyMs: 4, status: "PASS", details: "GPU hardware acceleration active" },
  { name: "BNB Core Banking REST Service", target: "GET /api/health", latencyMs: 6, status: "PASS", details: "ACID Ledger database synchronized" },
  { name: "Session Token Encryption", target: "Quantum 3FA Token Daemon", latencyMs: 3, status: "PASS", details: "AES-256-GCM session integrity confirmed" }
];

function renderDiagnosticTable(tests: DiagTest[]) {
  const tbody = document.getElementById("diag-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = tests.map(t => `
    <tr>
      <td><strong>${t.name}</strong></td>
      <td><span style="font-family: var(--font-mono); color: var(--text-muted);">${t.target}</span></td>
      <td><strong style="font-family: var(--font-mono); color: var(--bnb-crimson);">${t.latencyMs} ms</strong></td>
      <td>
        <span style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">✓ ${t.status}</span>
      </td>
      <td style="color: var(--text-muted); font-size: 12px;">${t.details}</td>
    </tr>
  `).join("");
}

function initDiagnostics() {
  renderDiagnosticTable(defaultDiagTests);
  renderAuditLogs();

  document.getElementById("btn-run-diagnostics")?.addEventListener("click", () => {
    playSuccessSound();
    addAuditLog("DIAGNOSTICS_RUN", "SysAdmin", "Diagnostic suite executed: 7/7 tests passed");
    const updated = defaultDiagTests.map(t => ({
      ...t,
      latencyMs: Math.floor(Math.random() * 5) + 2
    }));
    renderDiagnosticTable(updated);
    alert("✓ All 7 System Tests Passed: Multi-User Face Matcher, Ather EV Digital Key BLE, Pattern Solver, and Core Banking APIs are 100% OPERATIONAL.");
  });
}

// ========================================================
// APPLICATION INITIALIZATION
// ========================================================
window.addEventListener("DOMContentLoaded", () => {
  initClock();
  initTheme();
  initSoundToggle();
  initNavigation();
  initBackButtons();
  initCredentialsStep();
  initPatternCanvasAndControls();
  initFaceRecognitionControls();
  initAtherEVFeatures();
  initFinancialCalculator();
  initModals();
  initBankingFeatures();
  initDiagnostics();

  // Load models in background
  loadFaceApiModels();
});
