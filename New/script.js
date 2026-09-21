const overlay = document.getElementById('popupOverlay');
const openPopupBtn = document.getElementById('openPopup');
const timerText = document.getElementById('timerText');
const sand = document.getElementById('sand');
const sandStream = document.getElementById('sandStream');
const sandTimer = document.getElementById('sandTimer');
const proceedBtn = document.getElementById('proceedBtn');

const totalSeconds = 420; // Seven minutes
let remainingSeconds = totalSeconds;
let timerInterval = null;
let revealSequenceTimer = null;
let startCountdownTimer = null;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const setTimerCompleteState = (isComplete) => {
  if (!timerText || !sandTimer || !proceedBtn) return;
  timerText.classList.toggle('timer-complete', isComplete);
  sandTimer.classList.toggle('timer-complete', isComplete);
  proceedBtn.disabled = !isComplete;
  proceedBtn.classList.toggle('enabled', isComplete);
  
  // Update decryption status
  const headerStatus = document.getElementById('headerStatus');
  const dotSequence = document.getElementById('dotSequence');
  
  if (isComplete) {
    if (headerStatus) {
      headerStatus.textContent = '✓ 復号完了';
    }
    if (dotSequence) {
      dotSequence.style.display = 'none';
    }
  } else {
    if (headerStatus) {
      headerStatus.textContent = '復号中';
    }
    if (dotSequence) {
      dotSequence.style.display = 'inline';
    }
  }
};

const updateTimer = () => {
  if (!timerText || !sand || !sandStream) return;

  timerText.textContent = formatTime(remainingSeconds);

  const progress = remainingSeconds / totalSeconds;
  const sandHeight = `${Math.max(0, progress * 100)}%`;
  const streamHeight = `${Math.max(0, (1 - progress) * 100)}%`;

  sand.style.height = sandHeight;
  sandStream.style.height = streamHeight;
  sand.style.opacity = remainingSeconds <= 10 ? '0.82' : '0.96';
  sand.style.filter = remainingSeconds <= 10 ? 'brightness(1.08)' : 'brightness(1)';
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const startTimer = () => {
  stopTimer();
  remainingSeconds = totalSeconds;
  setTimerCompleteState(false);
  updateTimer();

  timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      stopTimer();
      remainingSeconds = 0;
      updateTimer();
      setTimerCompleteState(true);
      return;
    }

    remainingSeconds -= 1;
    updateTimer();
  }, 1000);
};

const clearSequenceTimers = () => {
  if (revealSequenceTimer) {
    clearTimeout(revealSequenceTimer);
    revealSequenceTimer = null;
  }

  if (startCountdownTimer) {
    clearTimeout(startCountdownTimer);
    startCountdownTimer = null;
  }
};

const startRevealSequence = () => {
  clearSequenceTimers();

  if (timerText && sand && sandStream && proceedBtn) {
    timerText.textContent = formatTime(totalSeconds);
    sand.style.height = '100%';
    sandStream.style.height = '0%';
  }

  if (timerText && timerText.classList) {
    timerText.classList.remove('timer-complete');
  }

  if (sandTimer) {
    sandTimer.classList.remove('timer-complete');
  }

  if (proceedBtn) {
    proceedBtn.disabled = true;
    proceedBtn.classList.remove('enabled');
    proceedBtn.classList.remove('is-visible');
  }

  const timerWrapEl = document.querySelector('.timer-wrap');
  if (timerWrapEl) {
    timerWrapEl.classList.remove('is-visible');
  }

  revealSequenceTimer = setTimeout(() => {
    if (timerWrapEl) {
      timerWrapEl.classList.add('is-visible');
    }

    if (proceedBtn) {
      proceedBtn.classList.add('is-visible');
    }

    startCountdownTimer = setTimeout(() => {
      startTimer();
    }, 2000);
  }, 3000);
};

if (openPopupBtn) {
  openPopupBtn.addEventListener('click', () => {
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    startRevealSequence();
  });
}

if (proceedBtn) {
  proceedBtn.addEventListener('click', () => {
    if (proceedBtn.disabled) return;
    // Show loading screen before redirecting
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
      setTimeout(() => {
        window.location.href = 'requirement.html';
      }, 4000);
    } else {
      // Fallback if loading overlay not found
      window.location.href = 'requirement.html';
    }
  });
}

if (overlay) {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.classList.add('hidden');
      stopTimer();
      clearSequenceTimers();
      setTimerCompleteState(false);
      const timerWrapEl = document.querySelector('.timer-wrap');
      if (timerWrapEl) {
        timerWrapEl.classList.remove('is-visible');
      }
      if (proceedBtn) {
        proceedBtn.classList.remove('is-visible');
      }
    }
  });
}

startRevealSequence();
updateTimer();
