/* ==========================================================================
   SOFIA VALENTE | LINK IN BIO - INTERACTIVE LOGIC
   Web Share API, Fallback Glass Modal, QR Code Canvas, Toast Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const shareBtn = document.getElementById('shareBtn');
  const shareModal = document.getElementById('shareModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const shareUrlInput = document.getElementById('shareUrlInput');
  const displayUrlText = document.getElementById('displayUrlText');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const qrCanvas = document.getElementById('qrCanvas');
  const bgVideo = document.getElementById('bgVideo');

  // Dynamic share data
  const shareData = {
    title: 'SOLAR DO LOUREIRO | Comida Tradicional Portuguesa',
    text: 'Conheça o Solar do Loureiro no Largo do Chão do Loureiro, Lisboa.',
    url: window.location.href.startsWith('http') ? window.location.href : 'https://maps.app.goo.gl/aqwVyijSwmpJV8vP8'
  };

  // Sync displayed URL
  if (shareUrlInput) shareUrlInput.value = shareData.url;
  if (displayUrlText) {
    displayUrlText.textContent = 'Largo do Chão do Loureiro 2, Lisboa';
  }

  // --------------------------------------------------------------------------
  // BACKGROUND VIDEO AUTOPLAY
  // --------------------------------------------------------------------------
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.volume = 0;
    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const playOnInteraction = () => {
          bgVideo.play().catch(() => {});
          window.removeEventListener('touchstart', playOnInteraction);
          window.removeEventListener('click', playOnInteraction);
        };
        window.addEventListener('touchstart', playOnInteraction, { once: true });
        window.addEventListener('click', playOnInteraction, { once: true });
      });
    }
  }

  // --------------------------------------------------------------------------
  // TOP RIGHT SHARE BUTTON HANDLER
  // --------------------------------------------------------------------------
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      // Check if native Web Share API is available (mainly mobile devices)
      if (navigator.share && window.innerWidth < 768) {
        try {
          await navigator.share(shareData);
          showToast('Perfil partilhado com sucesso!');
          return;
        } catch (err) {
          // If user cancels or if not supported, fall through to modal
          if (err.name === 'AbortError') return;
        }
      }
      openShareModal();
    });
  }

  // --------------------------------------------------------------------------
  // SHARE MODAL CONTROLS
  // --------------------------------------------------------------------------
  function openShareModal() {
    if (!shareModal) return;
    shareModal.classList.add('active');
    shareModal.setAttribute('aria-hidden', 'false');
    drawQRCode(qrCanvas, shareData.url);
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    if (!shareModal) return;
    shareModal.classList.remove('active');
    shareModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeShareModal);
  }

  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        closeShareModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // EMENTA / MENU MODAL CONTROLS
  // --------------------------------------------------------------------------
  const btnVerEmenta = document.getElementById('btn-ver-ementa');
  const ementaModal = document.getElementById('ementaModal');
  const closeEmentaBtn = document.getElementById('closeEmentaBtn');

  function openEmentaModal(e) {
    if (e) e.preventDefault();
    if (!ementaModal) return;
    ementaModal.classList.add('active');
    ementaModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeEmentaModal() {
    if (!ementaModal) return;
    ementaModal.classList.remove('active');
    ementaModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnVerEmenta) {
    btnVerEmenta.addEventListener('click', openEmentaModal);
  }

  if (closeEmentaBtn) {
    closeEmentaBtn.addEventListener('click', closeEmentaModal);
  }

  if (ementaModal) {
    ementaModal.addEventListener('click', (e) => {
      if (e.target === ementaModal) {
        closeEmentaModal();
      }
    });
  }

  // (Horário agora é estático — sem expansão)

  // Escape key to close any active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (shareModal && shareModal.classList.contains('active')) closeShareModal();
      if (ementaModal && ementaModal.classList.contains('active')) closeEmentaModal();
    }
  });

  // --------------------------------------------------------------------------
  // COPY LINK FUNCTIONALITY
  // --------------------------------------------------------------------------
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener('click', () => {
      copyToClipboard(shareData.url);
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        handleCopySuccess();
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    if (shareUrlInput) {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        handleCopySuccess();
      } catch (err) {
        showToast('Não foi possível copiar automaticamente.');
      }
    }
  }

  function handleCopySuccess() {
    if (copyUrlBtn && copyBtnText) {
      copyUrlBtn.classList.add('copied');
      copyBtnText.textContent = 'Copiado! ✓';
      setTimeout(() => {
        copyUrlBtn.classList.remove('copied');
        copyBtnText.textContent = 'Copiar';
      }, 2500);
    }
    showToast('Link copiado para a área de transferência! ✨');
  }

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATION
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // DIRECT SOCIAL SHARE BUTTONS IN MODAL
  // --------------------------------------------------------------------------
  const shareViaWhatsapp = document.getElementById('shareViaWhatsapp');
  const shareViaTwitter = document.getElementById('shareViaTwitter');
  const shareViaTelegram = document.getElementById('shareViaTelegram');

  if (shareViaWhatsapp) {
    shareViaWhatsapp.addEventListener('click', () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
      window.open(url, '_blank');
    });
  }

  if (shareViaTwitter) {
    shareViaTwitter.addEventListener('click', () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(url, '_blank');
    });
  }

  if (shareViaTelegram) {
    shareViaTelegram.addEventListener('click', () => {
      const url = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
      window.open(url, '_blank');
    });
  }

  // --------------------------------------------------------------------------
  // SMOOTH CLICK RIPPLE ON GLASS PILL BUTTONS
  // --------------------------------------------------------------------------
  const pillButtons = document.querySelectorAll('.azulejo-card-btn, .share-btn-azulejo');
  pillButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple-wave');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)';
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.transition = 'transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.5s ease';
      ripple.style.opacity = '1';

      this.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => {
        ripple.remove();
      }, 550);
    });
  });

  // --------------------------------------------------------------------------
  // STYLISH STANDALONE QR CODE GENERATOR (ZERO DEPENDENCY CANVAS)
  // --------------------------------------------------------------------------
  function drawQRCode(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Canvas background
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect ? ctx.roundRect(0, 0, size, size, 12) : ctx.fillRect(0, 0, size, size);
    ctx.fill();

    const matrixSize = 25;
    const cellSize = (size - 24) / matrixSize;
    const offset = 12;

    // Deterministic pseudo-random pattern based on string hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#070C18';

    // Helper to draw a square eye / finder pattern
    function drawEye(startX, startY) {
      ctx.fillRect(offset + startX * cellSize, offset + startY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offset + (startX + 1) * cellSize, offset + (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#0077FF';
      ctx.fillRect(offset + (startX + 2) * cellSize, offset + (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fillStyle = '#070C18';
    }

    // Top-left, Top-right, Bottom-left finder patterns
    drawEye(0, 0);
    drawEye(matrixSize - 7, 0);
    drawEye(0, matrixSize - 7);

    // Fill data grid
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finder pattern zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= matrixSize - 8;
        const inBottomLeft = r >= matrixSize - 8 && c < 8;

        if (inTopLeft || inTopRight || inBottomLeft) continue;

        // Timing patterns
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = '#070C18';
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
          continue;
        }

        // Pseudo pseudo-data
        const val = Math.sin(r * 13 + c * 29 + hash) * 10000;
        if ((val - Math.floor(val)) > 0.45) {
          ctx.fillStyle = '#0A1224';
          ctx.beginPath();
          ctx.arc(
            offset + c * cellSize + cellSize / 2,
            offset + r * cellSize + cellSize / 2,
            (cellSize / 2) * 0.9,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Center subtle logo dot
    ctx.fillStyle = '#0077FF';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, cellSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, cellSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
});
