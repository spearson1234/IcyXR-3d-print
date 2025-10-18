lucide.createIcons();

// Floating Hearts
setInterval(() => {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.textContent = ['💖', '💞', '💘'][Math.floor(Math.random() * 3)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (16 + Math.random() * 20) + 'px';
  heart.style.animationDuration = (4 + Math.random() * 3) + 's';
  document.querySelector('.hearts').appendChild(heart);
  setTimeout(() => heart.remove(), 7000);
}, 700);

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.page).classList.add('active');
  });
});

// Reflection System
const prompts = {
  love: ["What made you smile today?", "How can you express your affection?", "What do you adore most about Brooke?"],
  communication: ["What was your best conversation this week?", "How can you improve your listening?", "Write one kind message you'd love to share."],
  growth: ["How have you both grown lately?", "What challenge strengthened your bond?", "Describe a lesson learned together."]
};
const category = document.getElementById('category');
const promptText = document.getElementById('prompt-text');
const input = document.getElementById('reflection-input');
const submit = document.getElementById('submit-reflection');
const bar = document.getElementById('progress-bar');
const levelText = document.getElementById('level-text');
const reflectionList = document.getElementById('reflection-list');
let reflections = JSON.parse(localStorage.getItem('reflections')) || [];

function randomPrompt() {
  const arr = prompts[category.value];
  promptText.textContent = arr[Math.floor(Math.random() * arr.length)];
}
randomPrompt();
category.addEventListener('change', randomPrompt);

function updateProgress() {
  const total = reflections.length;
  const percent = Math.min((total / 10) * 100, 100);
  bar.style.width = percent + '%';
  document.getElementById('reflection-count').textContent = total;

  let level = "Lv 1 – Warm Heart 💗";
  if (total >= 3) level = "Lv 2 – Caring Soul 💞";
  if (total >= 6) level = "Lv 3 – Devoted Partner 💍";
  if (total >= 10) level = "Lv MAX – Infinite Love 💫";

  levelText.textContent = level;
  document.getElementById('profile-level').textContent = level;

  reflectionList.innerHTML = reflections
    .map(r => `<li>${r.date} — <strong>${r.category}</strong>: ${r.text}</li>`)
    .join('');
}
updateProgress();

submit.addEventListener('click', () => {
  if (!input.value.trim()) return alert('Please write something lovely 💕');
  reflections.push({ category: category.value, text: input.value.trim(), date: new Date().toLocaleDateString() });
  localStorage.setItem('reflections', JSON.stringify(reflections));
  input.value = '';
  updateProgress();
  alert('Reflection saved successfully 💖');
});

// Gifts
const giftMessages = {
  1: "✨ A sparkle of kindness blooms.",
  2: "🌙 A moonlit wish whispers love.",
  3: "🔑 You’ve unlocked a heart secret.",
  4: "👑 You both reign in love’s realm.",
  5: "🤝 Unity achieved — love eternal."
};
document.querySelectorAll('.gift').forEach(gift => {
  gift.addEventListener('click', () => {
    document.getElementById('gift-message').textContent = giftMessages[gift.dataset.id];
  });
});

// Hubby Panel
const panel = document.getElementById('hubby-panel');
document.getElementById('hubby-panel-btn').onclick = () => panel.style.display = 'flex';
document.getElementById('close-hubby').onclick = () => panel.style.display = 'none';
const pinInput = document.getElementById('hubby-pin');
const pinBtn = document.getElementById('submit-pin');
const hubbyData = document.getElementById('hubby-data');

pinBtn.addEventListener('click', () => {
  if (pinInput.value === '0420') hubbyData.classList.remove('hidden');
  else alert('❌ Incorrect PIN');
});

document.getElementById('reset-progress').addEventListener('click', () => {
  if (confirm('Reset all reflections?')) {
    localStorage.removeItem('reflections');
    reflections = [];
    updateProgress();
  }
});
