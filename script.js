/* ════════════════════════════════════════════════════
   script.js – Invitación de Graduación
   ════════════════════════════════════════════════════

   CLAVE: La clase `.playing` en `.box-wrapper`
   activa TODOS los @keyframes de los elementos hijos.
   No necesitamos timers para añadir clases individuales.
   Las animaciones @keyframes funcionan correctamente
   incluso cuando el padre cambia de display:none → flex.
   ════════════════════════════════════════════════════ */

let isOpen = false;

/* ── Escala dinámica para móvil ────────────────────── */
function applyCardScale() {
  const boxWrapper = document.getElementById('boxWrapper');
  if (!boxWrapper) return;

  const vw = window.innerWidth;

  // En pantallas muy pequeñas (<= 380px) usamos layout vertical — sin escala
  if (vw <= 380) {
    boxWrapper.style.removeProperty('--card-scale');
    boxWrapper.style.marginBottom = '';
    return;
  }

  // Ancho total del card según breakpoint activo
  const cardWidth = vw <= 480 ? 408   // place(88)+gap(6)+msg(220)+gap(6)+time(88)
                  : vw <= 580 ? 464   // 104+6+256+6+104
                  : vw <= 720 ? 568   // 128+6+306+6+128
                  : 674;              // 150+6+362+6+150

  const scale = vw < cardWidth ? (vw - 24) / cardWidth : 1;
  boxWrapper.style.setProperty('--card-scale', scale.toFixed(4));

  // Compensar el espacio vacío que deja el scale() para que no empuje el contenido abajo.
  // Cuando scale < 1, el elemento sigue ocupando su tamaño original en el flujo.
  // Añadimos un margin-bottom negativo igual a la altura "perdida".
  if (scale < 1) {
    const naturalH = boxWrapper.scrollHeight;
    const scaledH  = naturalH * scale;
    const lost     = naturalH - scaledH;
    boxWrapper.style.marginBottom = `-${lost.toFixed(0)}px`;
  } else {
    boxWrapper.style.marginBottom = '';
  }
}

/* ── Partículas flotantes ──────────────────────────── */
(function spawnParticles() {
  const wrap = document.getElementById('particles');
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.classList.add('p');
    const sz = (Math.random() * 4 + 1.5).toFixed(1);
    p.style.cssText = [
      `width:${sz}px`,
      `height:${sz}px`,
      `left:${(Math.random() * 100).toFixed(1)}%`,
      `bottom:-${sz}px`,
      `--d:${(Math.random() * 10 + 9).toFixed(1)}s`,
      `--dl:${(Math.random() * 16).toFixed(1)}s`
    ].join(';');
    wrap.appendChild(p);
  }
})();

/* ── ABRIR ─────────────────────────────────────────── */
function openCard() {
  if (isOpen) return;
  isOpen = true;

  const capWrapper = document.getElementById('capWrapper');
  const boxWrapper = document.getElementById('boxWrapper');
  const mainBtn    = document.getElementById('mainBtn');

  // 1. Ocultar birrete con transición CSS
  capWrapper.classList.add('out');
  mainBtn.style.opacity = '0';
  mainBtn.style.pointerEvents = 'none';

  // 2. Esperar que termine la transición del birrete (400ms)
  setTimeout(() => {
    capWrapper.style.display  = 'none';
    mainBtn.style.display     = 'none';

    // 3. Aplicar escala antes de mostrar para evitar flash de contenido cortado
    applyCardScale();

    // 4. Añadir .playing → display:flex + TODAS las animaciones @keyframes se activan
    boxWrapper.classList.add('playing');

    // 5. Confetti con un poco de delay
    setTimeout(launchConfetti, 750);
  }, 400);
}

/* ── CERRAR ────────────────────────────────────────── */
function closeCard() {
  if (!isOpen) return;
  isOpen = false;

  const capWrapper = document.getElementById('capWrapper');
  const boxWrapper = document.getElementById('boxWrapper');
  const mainBtn    = document.getElementById('mainBtn');

  // Fade-out del box con inline style
  const currentScale = parseFloat(
    getComputedStyle(boxWrapper).getPropertyValue('--card-scale') || '1'
  ) || 1;
  boxWrapper.style.transition = 'opacity .35s, transform .35s';
  boxWrapper.style.opacity    = '0';
  boxWrapper.style.transform  = `scale(${(currentScale * 0.88).toFixed(4)})`;

  setTimeout(() => {
    // Quitar .playing → vuelve a display:none
    boxWrapper.classList.remove('playing');
    // Limpiar inline styles para que las animaciones vuelvan al estado inicial
    boxWrapper.style.transition = '';
    boxWrapper.style.opacity    = '';
    boxWrapper.style.transform  = '';
    boxWrapper.style.removeProperty('--card-scale');

    // Mostrar birrete
    capWrapper.style.display = '';
    mainBtn.style.display    = '';

    // Pequeño delay para que el browser pinte antes de quitar .out
    setTimeout(() => {
      capWrapper.classList.remove('out');
      mainBtn.style.opacity       = '';
      mainBtn.style.pointerEvents = '';
    }, 40);
  }, 360);
}

/* ── Confetti ───────────────────────────────────────── */
function launchConfetti() {
  const colors = ['#c8993e','#e8c878','#7a1a28','#9b2030','#fffef5','#f0d090'];
  const wrap   = document.createElement('div');
  wrap.classList.add('confetti-wrap');
  document.body.appendChild(wrap);

  for (let i = 0; i < 70; i++) {
    const el    = document.createElement('div');
    el.classList.add('cf');
    const sz    = (Math.random() * 9 + 4).toFixed(1);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = 20 + Math.random() * 60;
    const angle  = Math.random() * 360;
    const dist   = 180 + Math.random() * 280;
    const rad    = angle * Math.PI / 180;
    const isCircle = Math.random() > .5;

    el.style.cssText = [
      `width:${sz}px`,
      `height:${sz}px`,
      `background:${color}`,
      `border-radius:${isCircle ? '50%' : '2px'}`,
      `left:${startX.toFixed(1)}%`,
      `top:42%`,
      `transform:rotate(${(Math.random()*360).toFixed(0)}deg)`
    ].join(';');

    wrap.appendChild(el);

    // Doble rAF para garantizar que el estado inicial se pinte
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(${(Math.cos(rad) * dist).toFixed(0)}px, ${(Math.sin(rad) * dist - 110).toFixed(0)}px) rotate(${(angle + 540).toFixed(0)}deg)`;
      el.style.opacity   = '0';
    }));
  }

  setTimeout(() => wrap.remove(), 2200);
}

/* ── Teclado ────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
    e.preventDefault();
    openCard();
  }
  if (e.key === 'Escape' && isOpen) {
    closeCard();
  }
});

/* ── Recalcular escala al rotar/redimensionar ────────── */
window.addEventListener('resize', () => {
  if (isOpen) applyCardScale();
});
