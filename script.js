"use strict";

const heartsContainer = document.getElementById("hearts");
const startReflectionBtn = document.getElementById("startReflection");
const quickWinBtn = document.getElementById("quickWinBtn");
const homeHero = document.getElementById("homeHero");
const statsRibbon = document.getElementById("statsRibbon");
const featureDeck = document.getElementById("featureDeck");
const reflectionSection = document.getElementById("reflectionSection");
const completionSection = document.getElementById("completionSection");
const questionTitle = document.getElementById("questionTitle");
const answerInput = document.getElementById("answerInput");
const nextBtn = document.getElementById("nextBtn");
const closeReflectionBtn = document.getElementById("closeReflection");
const goHomeBtn = document.getElementById("goHomeBtn");
const startAgainBtn = document.getElementById("startAgainBtn");

const statLessons = document.getElementById("statLessons");
const statLovePoints = document.getElementById("statLovePoints");
const statStreak = document.getElementById("statStreak");
const statLevel = document.getElementById("statLevel");

const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileBtn = document.getElementById("closeProfile");
const profileLessons = document.getElementById("profileLessons");
const profileStreak = document.getElementById("profileStreak");
const profileLevel = document.getElementById("profileLevel");
const profileNameDisplay = document.getElementById("profileNameDisplay");
const profileModalName = document.getElementById("profileModalName");
const profileNameInput = document.getElementById("profileNameInput");
const lofiToggleBtn = document.getElementById("lofiToggle");

const featureCards = document.querySelectorAll(".feature-card");
const featureModal = document.getElementById("featureModal");
const featureIcon = document.getElementById("featureIcon");
const featureTitle = document.getElementById("featureTitle");
const featureBody = document.getElementById("featureBody");
const featureActionBtn = document.getElementById("featureActionBtn");
const closeFeatureBtn = document.getElementById("closeFeature");
const openAdminBtn = document.getElementById("openAdmin");
const adminModal = document.getElementById("adminModal");
const closeAdminBtn = document.getElementById("closeAdmin");
const adminLock = document.getElementById("adminLock");
const adminBody = document.getElementById("adminBody");
const adminPasswordInput = document.getElementById("adminPassword");
const unlockAdminBtn = document.getElementById("unlockAdmin");
const lockAdminBtn = document.getElementById("lockAdmin");
const resetStatsBtn = document.getElementById("resetStats");
const adminLessons = document.getElementById("adminLessons");
const adminStreak = document.getElementById("adminStreak");
const adminPoints = document.getElementById("adminPoints");
const adminLevel = document.getElementById("adminLevel");
const adminProgressFill = document.getElementById("adminProgressFill");
const adminProgressCopy = document.getElementById("adminProgressCopy");
const adminRecentAnswers = document.getElementById("adminRecentAnswers");
const shopCards = document.querySelectorAll(".shop-card");
const shopLedger = document.getElementById("shopLedger");
const shopPurchases = document.getElementById("shopPurchases");

const storage = (() => {
  try {
    const testKey = "__hubby_hw_test__";
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return {
      get: (key, fallback = null) => window.localStorage.getItem(key) ?? fallback,
      set: (key, value) => window.localStorage.setItem(key, value)
    };
  } catch (error) {
    const memoryStore = {};
    return {
      get: (key, fallback = null) =>
        Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback,
      set: (key, value) => {
        memoryStore[key] = value;
      }
    };
  }
})();

const QUESTIONS = [
  "What small moment with him recently made you smile big?",
  "How could you show appreciation for something he did this week?",
  "What is one way you can lighten his load tomorrow?",
  "What quality of his do you want to affirm today?",
  "How can you invite more laughter into the next 24 hours?",
  "Which shared dream can you speak life into tonight?",
  "How can you respond with softness the next time tension appears?",
  "What do you want to thank him for that you haven’t said out loud yet?",
  "How can you carve out intentional time for just the two of you?",
  "What boundary can you honour for yourself so you show up rested?",
  "What is a new memory you’d like to create together soon?",
  "How can you celebrate a recent win in his world?",
  "What will make ur hubby happy?",
  "What will make u happy that hubby can do?",
  "What is the most difficult struggle that you and hubby had?",
  "Would you put everyone down for hubby?"
];

const PROFILE_MAX_NAME = 24;

const defaultProfile = {
  displayName: "MyGirl"
};

const FEATURE_CONTENT = {
  challenge: {
    title: "Daily Love Challenge",
    icon: "fa-bolt",
    messagePool: [
      "Leave a sticky note with three reasons you admire him somewhere he’ll find it.",
      "Tidy a chore he normally handles and add a quick “I’ve got you” text.",
      "Order or make his favourite snack and serve it with a smile tonight.",
      "Plan a five-minute forehead-to-forehead hug break before bedtime.",
      "Ask about one of his current goals and brainstorm ways you can support it."
    ]
  },
  loveNote: {
    title: "Love Note",
    icon: "fa-envelope",
    action: "copy",
    messagePool: [
      "You make ordinary moments feel like our own private universe.",
      "I’m so proud to be loved by you—thank you for choosing me daily.",
      "Every version of my future has you smiling back at me.",
      "Your love is my favourite calm and my favourite adventure.",
      "You are proof that home can be a person; thank you for being mine."
    ]
  },
  affirmation: {
    title: "Glow Affirmation",
    icon: "fa-sun",
    messagePool: [
      "I nurture our love with intention, presence, and play.",
      "I radiate patience and tenderness every time I speak to him.",
      "Our connection flourishes because I choose curiosity over criticism.",
      "I’m worthy of giving and receiving a love that feels gentle and sure.",
      "I create safety by showing up as my most authentic, joyful self."
    ]
  },
  dateIdea: {
    title: "Date Night Idea",
    icon: "fa-champagne-glasses",
    messagePool: [
      "Create a living-room tasting menu of snacks from your first dates.",
      "Visit a bookstore or library together and pick a prompt for each other.",
      "Build a playlist together and dance through one song in each room.",
      "Take a twilight stroll, swap favourite memories, and snap selfies.",
      "Plan a themed movie night complete with matching drinks and desserts."
    ]
  },
  gratitude: {
    title: "Gratitude Prompt",
    icon: "fa-gift",
    messagePool: [
      "Name one way he has protected your peace lately and tell him tonight.",
      "Remember a time he believed in you—share how it changed your day.",
      "Notice a habit he keeps that makes you feel loved and spotlight it.",
      "Identify a dream he’s holding for you and thank him for cheering.",
      "Share one thing you love about the way he loves the people you love."
    ]
  },
  playlist: {
    title: "Playlist Vibes",
    icon: "fa-music",
    action: "copy",
    messagePool: [
      "Start with “Golden Hour” by JVKE while you cook together.",
      "Play “Best Part” by H.E.R. for your cuddle break tonight.",
      "Queue “Adore You” by Harry Styles and slow dance in the kitchen.",
      "Open with “Electric” by Alina Baraz while you both unwind.",
      "End the night with “Beyond” by Leon Bridges for mellow magic."
    ]
  },
  memoryVault: {
    title: "Memory Vault",
    icon: "fa-camera-retro",
    messagePool: [
      "Pull up your very first photo together and recreate the pose tonight.",
      "Tell him the story of when you first realised he was your safe place.",
      "Share three favourite micro-moments from the last month and why they stuck.",
      "Scroll back to a message that made you swoon and read it back to him.",
      "Print or save a screenshot of a cherished exchange and tuck it in his bag."
    ]
  },
  supportBoost: {
    title: "Support Boost",
    icon: "fa-hand-holding-heart",
    messagePool: [
      "Text him: “I believe in you because…” and finish with a reason tied to his dream.",
      "Ask what would feel supportive this week and carve out time to make it happen.",
      "Write a short manifesto cheering on a goal he’s quietly working toward.",
      "Offer to be his sounding board for one decision he’s juggling right now.",
      "Send a calendar invite titled “I’m in your corner” with a mini pep talk."
    ]
  },
  celebration: {
    title: "Celebrate Him",
    icon: "fa-confetti-ball",
    messagePool: [
      "Set a 5-minute celebration timer tonight: list every win he stacked lately.",
      "Create a tiny award (“Most Thoughtful Coffee Maker”) and present it playfully.",
      "Share a selfie with a caption bragging about something he accomplished.",
      "Plan a surprise toast for finishing a task—complete with a cheesy speech.",
      "Hide a handwritten “You crushed it” card where he’ll find it in the morning."
    ]
  }
};

const SESSION_SIZE = 4;
const STATE_KEY = "hubby_hw_state_v2";
const RECENT_KEY = "hubby_hw_recent_v2";
const STORE_KEY = "hubby_hw_store_v1";
const CLICK_SOUND_SRC =
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5b5388e79c.mp3?filename=click-124467.mp3";
const LOFI_TRACK_SRC =
  "https://cdn.pixabay.com/download/audio/2021/10/11/audio_8a99564f2a.mp3?filename=lofi-study-112191.mp3";
const audioSupported = typeof Audio === "function";
let clickSound = null;
let lofiTrack = null;
let lofiIsPlaying = false;
let lofiPermissionAlertShown = false;
let audioEnhancementsInitialized = false;

if (audioSupported) {
  try {
    clickSound = new Audio(CLICK_SOUND_SRC);
    clickSound.volume = 0.32;
    clickSound.preload = "auto";
  } catch (error) {
    clickSound = null;
  }
  try {
    lofiTrack = new Audio(LOFI_TRACK_SRC);
    lofiTrack.loop = true;
    lofiTrack.volume = 0.2;
    lofiTrack.preload = "auto";
  } catch (error) {
    lofiTrack = null;
  }
}
function normalizeProfile(rawProfile) {
  const name =
    typeof rawProfile?.displayName === "string"
      ? rawProfile.displayName.trim().slice(0, PROFILE_MAX_NAME)
      : "";
  return {
    displayName: name.length ? name : defaultProfile.displayName
  };
}

const defaultState = {
  finishedLessons: 0,
  streak: 0,
  lastCompletion: "",
  spentPoints: 0,
  profile: { ...defaultProfile }
};

function loadState() {
  try {
    const raw = storage.get(STATE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      finishedLessons: Number(parsed.finishedLessons) || 0,
      streak: Number(parsed.streak) || 0,
      lastCompletion: parsed.lastCompletion || "",
      spentPoints: Number(parsed.spentPoints) || 0,
      profile: normalizeProfile(parsed.profile || {})
    };
  } catch (error) {
    return { ...defaultState, profile: { ...defaultProfile } };
  }
}

const state = loadState();
if (typeof state.spentPoints !== "number" || Number.isNaN(state.spentPoints)) {
  state.spentPoints = 0;
}
if (!state.profile) {
  state.profile = { ...defaultProfile };
} else {
  state.profile = normalizeProfile(state.profile);
}

function persistState() {
  storage.set(STATE_KEY, JSON.stringify(state));
}

let recentAnswers = (() => {
  try {
    const raw = storage.get(RECENT_KEY, "[]");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
})();

function persistRecent() {
  storage.set(RECENT_KEY, JSON.stringify(recentAnswers));
}

let purchasedRewards = (() => {
  try {
    const raw = storage.get(STORE_KEY, "[]");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
})();

function persistStore() {
  storage.set(STORE_KEY, JSON.stringify(purchasedRewards));
}

let questionDeck = [];
let currentQuestion = "";

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function refillQuestionDeck() {
  questionDeck = shuffle(QUESTIONS).slice(0, SESSION_SIZE);
}

function prepareNextQuestion() {
  if (questionDeck.length === 0) {
    refillQuestionDeck();
  }
  currentQuestion = questionDeck.pop();
  if (questionTitle) questionTitle.textContent = currentQuestion;
  if (answerInput) {
    answerInput.value = "";
    answerInput.focus();
  }
}

function computeLevel() {
  return Math.max(1, Math.floor(state.finishedLessons / 4) + 1);
}

function computeLovePoints() {
  const earned = state.finishedLessons * 35;
  const remaining = earned - (state.spentPoints || 0);
  return Math.max(0, Math.floor(remaining));
}

function getEffectiveName(raw) {
  if (typeof raw !== "string") return defaultProfile.displayName;
  const trimmed = raw.trim().slice(0, PROFILE_MAX_NAME);
  return trimmed.length ? trimmed : defaultProfile.displayName;
}

function formatModalName(name) {
  const trimmed = name.trim();
  return trimmed.endsWith("💕") ? trimmed : `${trimmed} 💕`;
}

function syncProfileUI() {
  const profile = state.profile || defaultProfile;
  const name = getEffectiveName(profile.displayName);
  if (profileNameDisplay) {
    profileNameDisplay.textContent = name;
  }
  if (profileModalName) {
    profileModalName.textContent = formatModalName(name);
  }
  if (profileNameInput && document.activeElement !== profileNameInput) {
    profileNameInput.value = profile.displayName;
  }
}

function previewProfileName(value) {
  const name = getEffectiveName(value);
  if (profileNameDisplay) profileNameDisplay.textContent = name;
  if (profileModalName) profileModalName.textContent = formatModalName(name);
}

function commitProfileName() {
  if (!profileNameInput) return;
  const nextName = getEffectiveName(profileNameInput.value);
  if (state.profile.displayName === nextName) {
    profileNameInput.value = state.profile.displayName;
    previewProfileName(nextName);
    return;
  }
  state.profile.displayName = nextName;
  profileNameInput.value = nextName;
  persistState();
  syncProfileUI();
}

function syncStatsUI() {
  const level = computeLevel();
  const lovePoints = computeLovePoints();

  if (statLessons) statLessons.textContent = state.finishedLessons.toString();
  if (statLovePoints) statLovePoints.textContent = lovePoints.toString();
  if (statStreak) statStreak.textContent = state.streak.toString();
  if (statLevel) statLevel.textContent = level.toString();

  if (profileLessons) profileLessons.textContent = state.finishedLessons.toString();
  if (profileStreak) profileStreak.textContent = state.streak.toString();
  if (profileLevel) profileLevel.textContent = level.toString();
  syncProfileUI();
}

function recordCompletion() {
  const today = new Date();
  const todayKey = today.toDateString();
  const yesterdayKey = new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();

  if (state.lastCompletion === todayKey) {
    state.streak = Math.max(1, state.streak);
  } else if (state.lastCompletion === yesterdayKey) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }

  state.lastCompletion = todayKey;
  state.finishedLessons += 1;
  persistState();
  syncStatsUI();
  fillAdminDashboard();
}

function ensureStreakFreshness() {
  const todayKey = new Date().toDateString();
  const yesterdayKey = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  if (state.lastCompletion !== todayKey && state.lastCompletion !== yesterdayKey) {
    state.streak = 0;
    persistState();
  }
}

function setHidden(element, shouldHide) {
  if (!element) return;
  element.classList.toggle("hidden", shouldHide);
}

function showHome() {
  setHidden(homeHero, false);
  setHidden(statsRibbon, false);
  setHidden(featureDeck, false);
  setHidden(reflectionSection, true);
  setHidden(completionSection, true);
}

function openReflection() {
  questionDeck = [];
  setHidden(homeHero, true);
  setHidden(statsRibbon, true);
  setHidden(featureDeck, true);
  setHidden(completionSection, true);
  setHidden(reflectionSection, false);
  prepareNextQuestion();
}

function showCompletion() {
  setHidden(reflectionSection, true);
  setHidden(completionSection, false);
}

function handleNextQuestion() {
  if (!answerInput) return;
  const answer = answerInput.value.trim();
  if (!answer) {
    alert("Please add a thought before moving on, lovely 💕");
    return;
  }

  recentAnswers.unshift({
    question: currentQuestion,
    answer,
    timestamp: new Date().toISOString()
  });
  persistRecent();

  recordCompletion();

  if (questionDeck.length === 0) {
    showCompletion();
  } else {
    prepareNextQuestion();
  }
}

function openFeatureModal(featureKey) {
  const config = FEATURE_CONTENT[featureKey];
  if (!config) return;

  const message =
    config.messagePool[Math.floor(Math.random() * config.messagePool.length)];

  if (featureIcon) featureIcon.innerHTML = `<i class="fa-solid ${config.icon}"></i>`;
  if (featureTitle) featureTitle.textContent = config.title;
  if (featureBody) featureBody.textContent = message;

  if (featureActionBtn) {
    if (config.action === "copy") {
      featureActionBtn.classList.remove("hidden");
      featureActionBtn.dataset.copyText = message;
      featureActionBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy for Later`;
    } else {
      featureActionBtn.classList.add("hidden");
      featureActionBtn.dataset.copyText = "";
    }
  }

  setHidden(featureModal, false);
}

function shuffleQuickFeature() {
  const quickOptions = ["challenge", "loveNote", "affirmation", "supportBoost", "celebration"];
  const choice = quickOptions[Math.floor(Math.random() * quickOptions.length)];
  openFeatureModal(choice);
}

function fillAdminDashboard() {
  const level = computeLevel();
  const lovePoints = computeLovePoints();
  const lessonsCompleted = state.finishedLessons;
  const progressTowardsNext = lessonsCompleted % 4;
  const nextLevelLessons = 4 - progressTowardsNext || 4;
  const progressPercent = (progressTowardsNext / 4) * 100;

  if (adminLessons) adminLessons.textContent = lessonsCompleted.toString();
  if (adminStreak) adminStreak.textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  if (adminPoints) adminPoints.textContent = lovePoints.toString();
  if (adminLevel) adminLevel.textContent = level.toString();
  if (adminProgressFill) adminProgressFill.style.width = `${progressPercent}%`;
  if (adminProgressCopy) {
    adminProgressCopy.textContent = `${progressTowardsNext}/4 lessons banked · ${nextLevelLessons} to next level`;
  }

  if (adminRecentAnswers) {
    adminRecentAnswers.innerHTML = "";
    if (recentAnswers.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No reflections logged yet. Time to start shining ✨";
      adminRecentAnswers.appendChild(li);
    } else {
      recentAnswers.forEach((entry) => {
        const li = document.createElement("li");
        const time = new Date(entry.timestamp).toLocaleString();
        li.innerHTML = `<strong>${entry.question}</strong><br>${entry.answer}<br><small>${time}</small>`;
        adminRecentAnswers.appendChild(li);
      });
    }
  }

  updateShopLedger();
}

function openAdminPanel() {
  if (!adminModal) return;
  setHidden(adminModal, false);
  if (adminBody && !adminBody.classList.contains("hidden")) {
    fillAdminDashboard();
  }
  if (adminPasswordInput && adminBody && adminBody.classList.contains("hidden")) {
    adminPasswordInput.focus();
  }
}

function closeAdminPanel() {
  setHidden(adminModal, true);
}

function unlockAdmin() {
  if (!adminPasswordInput || !adminBody || !adminLock) return;
  if (adminPasswordInput.value === "password") {
    adminLock.classList.add("hidden");
    adminBody.classList.remove("hidden");
    fillAdminDashboard();
  } else {
    adminPasswordInput.classList.add("shake");
    setTimeout(() => adminPasswordInput.classList.remove("shake"), 450);
  }
}

function lockAdmin() {
  if (!adminBody || !adminLock || !adminPasswordInput) return;
  adminBody.classList.add("hidden");
  adminLock.classList.remove("hidden");
  adminPasswordInput.value = "";
  adminPasswordInput.focus();
}

function resetProgress() {
  if (
    !confirm("Reset all progress? Love points, streaks, and reflections will be cleared.")
  )
    return;
  state.finishedLessons = 0;
  state.streak = 0;
  state.lastCompletion = "";
  state.spentPoints = 0;
  recentAnswers = [];
  purchasedRewards = [];
  persistState();
  persistRecent();
  persistStore();
  markPurchasedCards();
  updateShopLedger();
  syncStatsUI();
  fillAdminDashboard();
}

function updateShopLedger() {
  if (!shopLedger || !shopPurchases) return;
  shopPurchases.innerHTML = "";
  if (purchasedRewards.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No rewards unlocked yet. Keep collecting those hearts! 💖";
    shopPurchases.appendChild(li);
    shopLedger.classList.add("hidden");
  } else {
    shopLedger.classList.remove("hidden");
    purchasedRewards.slice().reverse().forEach((reward) => {
      const li = document.createElement("li");
      const time = new Date(reward.timestamp).toLocaleString();
      li.innerHTML = `<strong>${reward.name}</strong> – cost ${reward.cost} hearts<br><small>Unlocked ${time}</small>`;
      shopPurchases.appendChild(li);
    });
  }
}

function markPurchasedCards() {
  if (!shopCards.length) return;
  const owned = new Set(purchasedRewards.map((reward) => reward.name));
  shopCards.forEach((card) => {
    const prizeName = card.dataset.prize;
    const button = card.querySelector(".shop-btn");
    if (!button) return;
    if (owned.has(prizeName)) {
      card.classList.add("purchased");
      button.textContent = "Unlocked";
    } else {
      card.classList.remove("purchased");
      button.textContent = "Unlock";
    }
  });
}

function handlePurchase(card) {
  const cost = parseInt(card.dataset.cost, 10);
  const prize = card.dataset.prize;
  if (!Number.isFinite(cost) || !prize) return;

  if (card.classList.contains("purchased")) {
    alert("Already unlocked! Check the ledger for your reward ❤️");
    return;
  }

  const available = computeLovePoints();
  if (available < cost) {
    alert("Keep stacking love points to unlock this prize 💕");
    return;
  }

  state.spentPoints = (state.spentPoints || 0) + cost;
  purchasedRewards.push({
    name: prize,
    cost,
    timestamp: new Date().toISOString()
  });
  persistState();
  persistStore();
  syncStatsUI();
  fillAdminDashboard();
  markPurchasedCards();
  updateShopLedger();

  const button = card.querySelector(".shop-btn");
  if (button) button.textContent = "Unlocked";
  alert(`Reward unlocked: ${prize}! You have ${computeLovePoints()} hearts left.`);
}

function closeModal(modal) {
  setHidden(modal, true);
}

function playClickTone() {
  if (!clickSound) return;
  try {
    clickSound.currentTime = 0;
  } catch (error) {
    // Safari can throw while resetting currentTime on a paused element; ignore.
  }
  clickSound.play().catch(() => {
    // Ignore autoplay rejections; sound is just a sweet-to-have.
  });
}

function renderLofiToggle() {
  if (!lofiToggleBtn) return;
  const icon = lofiIsPlaying ? "fa-circle-pause" : "fa-headphones-simple";
  const label = lofiIsPlaying ? "Pause Lofi" : "Play Lofi";
  lofiToggleBtn.innerHTML = `<i class="fa-solid ${icon}"></i><span class="btn-text">${label}</span>`;
  lofiToggleBtn.classList.toggle("is-playing", lofiIsPlaying);
  lofiToggleBtn.setAttribute("aria-pressed", lofiIsPlaying ? "true" : "false");
  if (!lofiToggleBtn.classList.contains("needs-permission")) {
    lofiToggleBtn.title = lofiIsPlaying ? "Pause the lofi beat" : "Play the lofi beat";
  }
}

function toggleLofiPlayback() {
  if (!lofiTrack) return;
  if (lofiIsPlaying) {
    lofiTrack.pause();
    lofiIsPlaying = false;
    renderLofiToggle();
    return;
  }

  lofiTrack.play().then(() => {
    lofiIsPlaying = true;
    if (lofiToggleBtn) {
      lofiToggleBtn.classList.remove("needs-permission");
      lofiToggleBtn.title = "Pause the lofi beat";
    }
    renderLofiToggle();
  }).catch(() => {
    lofiIsPlaying = false;
    if (lofiToggleBtn) {
      lofiToggleBtn.classList.add("needs-permission");
      lofiToggleBtn.title = "Enable audio in your browser and tap again";
    }
    if (!lofiPermissionAlertShown) {
      alert("If the music didn’t start, allow audio for this page and tap again 💕");
      lofiPermissionAlertShown = true;
    }
    renderLofiToggle();
  });
}

function initAudioEnhancements() {
  if (audioEnhancementsInitialized) return;
  audioEnhancementsInitialized = true;

  if (clickSound) {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      playClickTone();
    });
  }

  if (lofiToggleBtn) {
    if (lofiTrack) {
      renderLofiToggle();
      lofiToggleBtn.addEventListener("click", toggleLofiPlayback);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && lofiIsPlaying && lofiTrack) {
          lofiTrack.pause();
          lofiIsPlaying = false;
          renderLofiToggle();
        }
      });
    } else {
      lofiToggleBtn.classList.add("is-disabled");
      lofiToggleBtn.setAttribute("disabled", "true");
      lofiToggleBtn.setAttribute("aria-pressed", "false");
      lofiToggleBtn.innerHTML =
        '<i class="fa-solid fa-headphones-simple"></i><span class="btn-text">Audio Unavailable</span>';
      lofiToggleBtn.title = "Audio is not supported in this browser";
    }
  }
}

function initEventListeners() {
  if (startReflectionBtn) {
    startReflectionBtn.addEventListener("click", openReflection);
  }

  if (closeReflectionBtn) {
    closeReflectionBtn.addEventListener("click", showHome);
  }

  if (startAgainBtn) {
    startAgainBtn.addEventListener("click", () => {
      questionDeck = [];
      openReflection();
    });
  }

  if (goHomeBtn) {
    goHomeBtn.addEventListener("click", () => {
      questionDeck = [];
      showHome();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", handleNextQuestion);
  }

  if (answerInput) {
    answerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleNextQuestion();
      }
    });
  }

  if (profileBtn && profileModal) {
    profileBtn.addEventListener("click", () => setHidden(profileModal, false));
  }
  if (closeProfileBtn && profileModal) {
    closeProfileBtn.addEventListener("click", () => closeModal(profileModal));
    profileModal.addEventListener("click", (event) => {
      if (event.target === profileModal) closeModal(profileModal);
    });
  }

  if (profileNameInput) {
    profileNameInput.addEventListener("input", () => previewProfileName(profileNameInput.value));
    profileNameInput.addEventListener("blur", commitProfileName);
    profileNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitProfileName();
        profileNameInput.blur();
      }
    });
  }

  if (featureCards.length) {
    featureCards.forEach((card) => {
      card.addEventListener("click", () => openFeatureModal(card.dataset.feature));
    });
  }

  if (shopCards.length) {
    shopCards.forEach((card) => {
      const button = card.querySelector(".shop-btn");
      if (!button) return;
      button.addEventListener("click", () => handlePurchase(card));
    });
  }

  if (quickWinBtn) {
    quickWinBtn.addEventListener("click", shuffleQuickFeature);
  }

  if (closeFeatureBtn && featureModal) {
    closeFeatureBtn.addEventListener("click", () => closeModal(featureModal));
    featureModal.addEventListener("click", (event) => {
      if (event.target === featureModal) closeModal(featureModal);
    });
  }

  if (featureActionBtn) {
    featureActionBtn.addEventListener("click", async () => {
      const text = featureActionBtn.dataset.copyText;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        featureActionBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => {
          featureActionBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy for Later`;
        }, 1800);
      } catch (error) {
        alert("Clipboard wasn’t available, but you can copy it manually 💕");
      }
    });
  }

  if (openAdminBtn) {
    openAdminBtn.addEventListener("click", openAdminPanel);
  }

  if (closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener("click", closeAdminPanel);
    adminModal.addEventListener("click", (event) => {
      if (event.target === adminModal) closeAdminPanel();
    });
  }

  if (unlockAdminBtn && adminPasswordInput) {
    unlockAdminBtn.addEventListener("click", unlockAdmin);
    adminPasswordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        unlockAdmin();
      }
    });
  }

  if (lockAdminBtn) {
    lockAdminBtn.addEventListener("click", lockAdmin);
  }

  if (resetStatsBtn) {
    resetStatsBtn.addEventListener("click", resetProgress);
  }
}

function initHearts() {
  if (!heartsContainer) return;
  function createHeart() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${Math.random() * 24 + 14}px`;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
  }
  setInterval(createHeart, 800);
}

function initApp() {
  ensureStreakFreshness();
  syncStatsUI();
  markPurchasedCards();
  updateShopLedger();
  fillAdminDashboard();
  initEventListeners();
  initAudioEnhancements();
  initHearts();
}

initApp();
