/**
 * Main Application Logic & Romantic Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const openInstruction = document.getElementById('open-instruction');
  const musicBtn = document.getElementById('music-btn');
  const customizeBtn = document.getElementById('customize-btn');
  const surpriseVerseBtn = document.getElementById('surprise-verse-btn');
  const heartBurstBtn = document.getElementById('heart-burst-btn');

  // Letter Fields
  const letterSalutation = document.getElementById('letter-salutation');
  const letterBody = document.getElementById('letter-body');
  const poeticVerse = document.getElementById('poetic-verse');
  const letterSender = document.getElementById('letter-sender');
  const letterDate = document.getElementById('letter-date');

  // Modal Fields
  const modalBackdrop = document.getElementById('modal-backdrop');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const applyCustomLetterBtn = document.getElementById('apply-custom-letter-btn');
  const inputRecipient = document.getElementById('input-recipient');
  const inputMessage = document.getElementById('input-message');
  const inputSender = document.getElementById('input-sender');

  // Oracle Elements
  const petalCountEl = document.getElementById('petal-count');
  const oracleVerdictEl = document.getElementById('oracle-verdict');

  // Set today's date dynamically in romantic format
  const today = new Date();
  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  letterDate.textContent = today.toLocaleDateString('en-US', dateOptions);

  // Romantic Poetic Verses Bank
  const romanticVerses = [
    `"Wherever the sun journeys across the sky, the sunflower keeps its promise. And wherever life leads my footsteps, my heart has already chosen you."`,
    `"In a field full of roses, you are my golden sunflower — steadfast, radiant, and turning every shadow into gold."`,
    `"Even when clouds hide the light, the sunflower stands tall knowing the dawn will break. That is how certain I am of loving you."`,
    `"You are the morning light that gently wakes my dreams, and the quiet sunset that brings my soul peace."`,
    `"If love had a color, it would be the warmth of late summer gold, reflecting endlessly in your eyes."`,
    `"Time moves, seasons surrender to winter, but like a perennial seed beneath the snow, my affection for you only waits to bloom deeper."`
  ];

  // Love Oracle Whispers for Petal Plucking
  const oracleWhispers = [
    "He/She loves you dearly...",
    "Loves you with all their heart...",
    "Admires your gentle soul...",
    "Thinks of your smile in quiet moments...",
    "Loves you beyond distance and time...",
    "Cherishes every laugh you've shared...",
    "Wants to hold your hand under the golden sun...",
    "Loves you unconditionally and forever."
  ];

  let currentVerseIdx = 0;
  let isOpen = false;

  // 1. OPEN / CLOSE ENVELOPE INTERACTION
  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    // Audio SFX
    if (window.romanticAudio) {
      window.romanticAudio.playSealBreak();
      setTimeout(() => {
        window.romanticAudio.playPaperSlide();
      }, 400);
    }

    envelope.classList.add('is-open');
    openInstruction.innerHTML = `<i class="fa-solid fa-sparkles"></i> Unsealed with endless affection`;

    // Trigger gentle heart sparkles
    triggerHeartBurst(0.6);
  }

  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelope.addEventListener('click', () => {
    if (!isOpen) {
      openEnvelope();
    }
  });

  // 2. TOGGLE ROMANTIC MELODY
  musicBtn.addEventListener('click', () => {
    const isPlaying = window.romanticAudio.toggleMusic();
    const btnText = musicBtn.querySelector('.btn-text');
    const icon = musicBtn.querySelector('i');

    if (isPlaying) {
      btnText.textContent = 'Melody: Playing';
      musicBtn.classList.add('active');
      icon.className = 'fa-solid fa-volume-high';
    } else {
      btnText.textContent = 'Melody: Off';
      musicBtn.classList.remove('active');
      icon.className = 'fa-solid fa-music';
    }
  });

  // 3. SURPRISE POETIC VERSE GENERATOR
  surpriseVerseBtn.addEventListener('click', () => {
    currentVerseIdx = (currentVerseIdx + 1) % romanticVerses.length;
    poeticVerse.style.opacity = '0';
    setTimeout(() => {
      poeticVerse.textContent = romanticVerses[currentVerseIdx];
      poeticVerse.style.opacity = '1';
    }, 300);

    if (window.romanticAudio) {
      window.romanticAudio.playPetalChime(currentVerseIdx);
    }
  });

  // 4. HEART BURST CELEBRATION (Canvas Confetti)
  function triggerHeartBurst(intensity = 1.0) {
    if (typeof confetti === 'function') {
      const count = Math.floor(40 * intensity);
      confetti({
        particleCount: count,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ffc84b', '#f5b025', '#db2b37', '#ff6b81', '#ffffff'],
        shapes: ['circle'],
        scalar: 1.2
      });
    }
  }

  heartBurstBtn.addEventListener('click', () => {
    triggerHeartBurst(1.8);
    if (window.romanticAudio) {
      window.romanticAudio.playMusicBoxNote(523.25, 1.5, 0.2);
      setTimeout(() => window.romanticAudio.playMusicBoxNote(659.25, 1.5, 0.2), 150);
      setTimeout(() => window.romanticAudio.playMusicBoxNote(783.99, 2.0, 0.25), 300);
    }
  });

  // 5. PETAL PLUCKED CALLBACK (Triggered from 3D Scene)
  window.onPetalPlucked = function (count) {
    petalCountEl.textContent = count;
    const whisper = oracleWhispers[(count - 1) % oracleWhispers.length];
    oracleVerdictEl.style.opacity = '0';
    setTimeout(() => {
      oracleVerdictEl.textContent = `"${whisper}"`;
      oracleVerdictEl.style.opacity = '1';
    }, 200);

    // Also spawn a 2D falling petal on screen
    spawnFallingPetal();
  };

  // 6. CUSTOMIZER MODAL DRAWER
  customizeBtn.addEventListener('click', () => {
    modalBackdrop.classList.add('is-active');
  });

  closeModalBtn.addEventListener('click', () => {
    modalBackdrop.classList.remove('is-active');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('is-active');
    }
  });

  applyCustomLetterBtn.addEventListener('click', () => {
    const toVal = inputRecipient.value.trim() || 'My Dearest Sunshine';
    const msgVal = inputMessage.value.trim();
    const fromVal = inputSender.value.trim() || 'Your Devoted Heart';

    letterSalutation.textContent = `${toVal},`;
    if (msgVal) {
      // Split message by newlines into paragraphs
      const paragraphs = msgVal.split('\n').filter(p => p.trim().length > 0);
      letterBody.innerHTML = '';
      paragraphs.forEach(p => {
        const pEl = document.createElement('p');
        pEl.textContent = p;
        letterBody.appendChild(pEl);
      });
      letterBody.appendChild(poeticVerse);
    }
    letterSender.textContent = fromVal;

    modalBackdrop.classList.remove('is-active');

    // Automatically open the envelope if not already open
    if (!isOpen) {
      openEnvelope();
    }
  });

  // 7. BACKGROUND FALLING PETAL GENERATOR
  const petalContainer = document.getElementById('petal-canvas-container');

  function spawnFallingPetal() {
    const petal = document.createElement('div');
    petal.classList.add('falling-petal');

    const size = Math.random() * 12 + 10;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.5}px`;
    petal.style.left = `${Math.random() * 100}vw`;

    const duration = Math.random() * 5 + 6;
    petal.style.animationDuration = `${duration}s`;

    petalContainer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, duration * 1000);
  }

  // Spawn ambient petals every 2 seconds
  setInterval(spawnFallingPetal, 2200);
  for (let i = 0; i < 4; i++) {
    setTimeout(spawnFallingPetal, i * 600);
  }
});
