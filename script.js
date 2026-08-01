/* ============================================================
   FOR MY QUEEN BETH — script.js
   Vanilla JS only. No frameworks, no dependencies.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initAmbientBackground();
  initNav();
  initHeroSlideshow();
  initRelationshipCounter();
  initLoveMessages();
  initScrollReveal();
  initPolaroidWall();
  initMusicPlayer();
  initTerminal();
  initEnvelopes();
  initDateInvitation();
  initEasterEggs();
  initFinale();
  initGallery(); // no-ops safely if gallery elements aren't on this page
});

/* ============================================================
   Custom cursor
   ============================================================ */
function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .polaroid, .envelope, input[type="range"]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

/* ============================================================
   Ambient animated background: canvas particles
   (hearts, sparkles, floating petals, twinkling stars)
   ============================================================ */
function initAmbientBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = REDUCE_MOTION ? 0 : (window.innerWidth < 700 ? 34 : 60);
  const glyphs = ['❤', '✦', '✧', '❀', '·'];
  const particles = Array.from({ length: count }, () => spawnParticle());

  function spawnParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: 8 + Math.random() * 14,
      speedY: 0.15 + Math.random() * 0.4,
      speedX: (Math.random() - 0.5) * 0.3,
      drift: Math.random() * Math.PI * 2,
      glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
      opacity: 0.15 + Math.random() * 0.35,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    const scrollY = window.scrollY;
    particles.forEach(p => {
      p.drift += 0.01;
      p.twinkle += 0.05;
      p.y -= p.speedY;
      p.x += Math.sin(p.drift) * 0.3 + p.speedX;
      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      const screenY = p.y;
      if (screenY < scrollY - 50 || screenY > scrollY + window.innerHeight + 50) return;

      ctx.globalAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.glyph === '❤' ? '#ff4f9a' : (p.glyph === '❀' ? '#ffb4cf' : '#d9b579');
      ctx.fillText(p.glyph, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  if (!REDUCE_MOTION) tick();
}

/* ============================================================
   Floating nav: mobile toggle + active-section highlight
   ============================================================ */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.floating-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const links = document.querySelectorAll('.floating-nav a[href^="#"]');
  const sections = Array.from(links)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ============================================================
   Hero slideshow — cycles images placed in /images/
   Falls back to a gentle gradient if an image is missing.
   ============================================================ */
function initHeroSlideshow() {
  const wrap = document.querySelector('.hero-slideshow');
  if (!wrap) return;
  const total = 8; // expects images/hero1.jpg ... hero8.jpg
  const slides = [];

  for (let i = 1; i <= total; i++) {
    const div = document.createElement('div');
    div.className = 'slide';
    const img = document.createElement('img');
    img.src = `images/hero${i}.jpg`;
    img.alt = 'A memory of us';
    img.loading = i === 1 ? 'eager' : 'lazy';
    img.onerror = () => {
      img.remove();
      const fb = document.createElement('div');
      fb.className = 'slide-fallback';
      fb.textContent = '♡';
      div.appendChild(fb);
    };
    div.appendChild(img);
    wrap.appendChild(div);
    slides.push(div);
  }
  slides[0].classList.add('active');
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
  }, 4500);
}

/* ============================================================
   Relationship counter — EDIT THIS DATE
   ============================================================ */
function initRelationshipCounter() {
  const root = document.querySelector('.counter-wrap');
  if (!root) return;

  // ---- EDIT ME: set the date you two started ----
  const START_DATE = new Date('2024-02-14T00:00:00');

  const els = {
    years: root.querySelector('[data-unit="years"]'),
    months: root.querySelector('[data-unit="months"]'),
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]'),
  };

  function update() {
    const now = new Date();
    let years = now.getFullYear() - START_DATE.getFullYear();
    let months = now.getMonth() - START_DATE.getMonth();
    let days = now.getDate() - START_DATE.getDate();
    let hours = now.getHours() - START_DATE.getHours();
    let minutes = now.getMinutes() - START_DATE.getMinutes();
    let seconds = now.getSeconds() - START_DATE.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth; months--;
    }
    if (months < 0) { months += 12; years--; }

    if (els.years) els.years.textContent = String(Math.max(years, 0));
    if (els.months) els.months.textContent = String(Math.max(months, 0));
    if (els.days) els.days.textContent = String(Math.max(days, 0));
    if (els.hours) els.hours.textContent = String(Math.max(hours, 0)).padStart(2, '0');
    if (els.minutes) els.minutes.textContent = String(Math.max(minutes, 0)).padStart(2, '0');
    if (els.seconds) els.seconds.textContent = String(Math.max(seconds, 0)).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

/* ============================================================
   Rotating love messages
   ============================================================ */
const LOVE_MESSAGES = [
  "I still smile whenever your name appears.",
  "You make ordinary days unforgettable.",
  "I'll always choose you.",
  "You make my world brighter.",
  "I treasure every little moment with you.",
  "I don't just love you. I admire you.",
  "You are my safe place.",
  "I still get butterflies.",
  "You turned my routine into something worth looking forward to.",
  "Every inside joke with you feels like a small treasure.",
  "I love how easy it is to just be myself with you.",
  "You make me want to be a better version of me.",
  "Even on my worst days, you're my favorite part.",
  "I catch myself thinking about you at the strangest times.",
  "Your laugh is my favorite sound in the world.",
  "You feel like home, even in unfamiliar places.",
  "I never knew ordinary conversations could feel like this good.",
  "You're the calm in every storm I've walked through.",
  "I love the way you see the world.",
  "You make quiet moments feel like enough.",
  "I fall for you a little more every single day.",
  "You are proof that good things do happen.",
  "I love the way you say my name.",
  "Being chosen by you is my favorite kind of lucky.",
  "You make the little things feel like everything.",
  "I never get tired of learning new things about you.",
  "You're the first person I want to tell good news to.",
  "Loving you has never once felt like work.",
  "You make me believe in soft, steady things.",
  "I love watching you get excited about things you love.",
  "You are the best decision I never had to think twice about.",
  "You make me feel completely, unapologetically myself.",
  "I love the way your hand fits in mine.",
  "You're my favorite person to do absolutely nothing with.",
  "Every memory with you feels worth keeping.",
  "I love how you make hard days feel lighter.",
  "You are patient with me in ways I don't deserve.",
  "I think you're beautiful even on your most ordinary days.",
  "You make me want to build a whole future.",
  "I love your mind as much as I love your heart.",
  "You're kind in a world that doesn't always ask for it.",
  "I love the version of me that exists around you.",
  "You've become my favorite habit.",
  "I still remember exactly how it felt to fall for you.",
  "You make distance feel smaller and time feel softer.",
  "I love you on the loud days and the quiet ones.",
  "You're the reason I believe in timing.",
  "I love how safe your arms feel.",
  "You make effort look like love, every time.",
  "I'm endlessly proud to be yours.",
  "You are my favorite story to keep telling.",
  "I love how you remember the little things I say.",
  "You make me laugh harder than anyone else can.",
  "I love the plans we haven't even made yet.",
  "You are worth every mile, every minute, every wait.",
  "I love you in ways I'm still learning to say.",
  "You make my heart feel understood.",
  "I choose you today, and I'll choose you tomorrow.",
  "You are my favorite kind of forever.",
  "I love the way you love the people around you.",
  "You are, simply, my favorite person.",
];

function initLoveMessages() {
  const el = document.querySelector('.message-carousel');
  if (!el) return;
  const nodes = LOVE_MESSAGES.map(msg => {
    const p = document.createElement('p');
    p.className = 'message-text';
    p.textContent = msg;
    el.appendChild(p);
    return p;
  });
  let i = 0;
  nodes[0].classList.add('active');
  setInterval(() => {
    nodes[i].classList.remove('active');
    i = (i + 1) % nodes.length;
    nodes[i].classList.add('active');
  }, 4200);
}

/* ============================================================
   IntersectionObserver-driven scroll reveal
   ============================================================ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));
}

/* ============================================================
   Polaroid memory wall + modal
   ============================================================ */
const MEMORIES = [
  { title: '', date: ' 2026', caption: "I didn't know a simple hello could change my whole life." },
  { title: '', date: ' 2026', caption: "I was so nervous ." },
  { title: '', date: ' 2026', caption: "That's when I knew I loved you." },
  { title: '', date: ' 2026', caption: "never felt so warm." },
  { title: '', date: ' 2026', caption: "I remember your head on my shoulder." },
  { title: '', date: ' 2026', caption: "We talked until night fall." },
  { title: '', date: ' 2026', caption: "I like you." },
  { title: '', date: ' 2026', caption: "New places feel better when you're the one next to me." },
  { title: 'You Called Me Yours', date: ' 2026', caption: "Three words that made everything official and everything better." },
  { title: '', date: ' 2026', caption: "." },
  { title: 'Your Birthday', date: ' 2026', caption: "Watching you light up is my favorite kind of celebration." },
  { title: 'The Long Distance Week', date: ' 2026', caption: "Missing you taught me how much space you take up in my life." },
  { title: 'Beach Day', date: ' 2026', caption: "Sunburnt, salty, and completely happy." },
  { title: '', date: ' 2026', caption: "We learned how to come back to each other." },
  { title: '', date: ' 2026', caption: "You made deadlines feel less lonely." },
  { title: 'Holiday Lights', date: ' 2026', caption: "You look very beautiful" },
  { title: '', date: ' 2026', caption: "I need more of this." },
  { title: '', date: ' 2026', caption: "Doing nothing with you still feels like everything." },
  { title: '', date: ' 2026', caption: "A whole year, and I'd still pick you first, every time." },
  { title: '', date: '2026', caption: "Still writing our story, one favorite day at a time." },
];

function initPolaroidWall() {
  const grid = document.querySelector('.polaroid-grid');
  const overlay = document.querySelector('.modal-overlay');
  if (!grid || !overlay) return;

  const modalImg = overlay.querySelector('.modal-media');
  const modalTitle = overlay.querySelector('.modal-title');
  const modalDate = overlay.querySelector('.modal-date');
  const modalCaption = overlay.querySelector('.modal-caption');

  MEMORIES.forEach((m, idx) => {
    const fig = document.createElement('figure');
    fig.className = 'polaroid';
    const rotation = (idx % 2 === 0 ? -1 : 1) * (3 + (idx % 4) * 2);
    fig.style.transform = `rotate(${rotation}deg)`;
    fig.dataset.rotation = rotation;

    const img = document.createElement('img');
    img.src = `images/memory${idx + 1}.jpg`;
    img.alt = m.title;
    img.loading = 'lazy';
    img.onerror = () => {
      img.remove();
      const fb = document.createElement('div');
      fb.className = 'ph-fallback';
      fb.textContent = '♡';
      fig.insertBefore(fb, fig.firstChild);
    };
    const cap = document.createElement('figcaption');
    cap.textContent = m.title;

    fig.appendChild(img);
    fig.appendChild(cap);
    fig.addEventListener('mouseenter', () => { fig.style.transform = 'translateY(-10px) rotate(0deg) scale(1.05)'; });
    fig.addEventListener('mouseleave', () => { fig.style.transform = `rotate(${rotation}deg)`; });

    fig.addEventListener('click', () => {
      modalImg.innerHTML = '';
      const bigImg = document.createElement('img');
      bigImg.src = `images/memory${idx + 1}.jpg`;
      bigImg.alt = m.title;
      bigImg.onerror = () => {
        bigImg.remove();
        const fb = document.createElement('div');
        fb.className = 'ph-fallback';
        fb.textContent = '♡';
        modalImg.appendChild(fb);
      };
      modalImg.appendChild(bigImg);
      modalTitle.textContent = m.title;
      modalDate.textContent = m.date;
      modalCaption.textContent = m.caption;
      overlay.classList.add('open');
    });

    grid.appendChild(fig);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('modal-close')) {
      overlay.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
}

/* ============================================================
   Music player
   ============================================================ */
function initMusicPlayer() {
  const player = document.querySelector('.player-card');
  if (!player) return;

  const audio = player.querySelector('audio');
  const playBtn = player.querySelector('.play-btn');
  const nextBtn = player.querySelector('.next-btn');
  const prevBtn = player.querySelector('.prev-btn');
  const seek = player.querySelector('.seek-bar');
  const curTime = player.querySelector('.cur-time');
  const durTime = player.querySelector('.dur-time');
  const volume = player.querySelector('.volume-bar');
  const vinyl = player.querySelector('.vinyl');
  const arm = player.querySelector('.vinyl-arm');
  const eq = player.querySelector('.equalizer');
  const trackTitleEl = player.querySelector('.track-title');
  const trackSubEl = player.querySelector('.track-sub');

  const tracks = [
    { src: 'music/song1.mp3', title: 'Our Song', sub: 'Track 1 · for the both of us' },
    { src: 'music/song2.mp3', title: 'The One That Reminds Me Of You', sub: 'Track 2 · for the both of us' },
  ];
  let idx = 0;
  let noteTimer = null;

  function loadTrack(i, autoplay) {
    idx = (i + tracks.length) % tracks.length;
    audio.src = tracks[idx].src;
    trackTitleEl.textContent = tracks[idx].title;
    trackSubEl.textContent = tracks[idx].sub;
    if (autoplay) audio.play().catch(() => {});
  }
  loadTrack(0, false);

  function formatTime(t) {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function setPlayingUI(playing) {
    vinyl.classList.toggle('spinning', playing);
    arm.classList.toggle('playing', playing);
    eq.classList.toggle('paused', !playing);
    playBtn.textContent = playing ? '⏸' : '▶';
    if (playing) {
      noteTimer = setInterval(spawnMusicNote, 700);
    } else {
      clearInterval(noteTimer);
    }
  }

  function spawnMusicNote() {
    const note = document.createElement('div');
    note.className = 'music-note';
    note.textContent = Math.random() > 0.5 ? '♪' : '♫';
    const rect = player.querySelector('.vinyl-wrap').getBoundingClientRect();
    note.style.left = (rect.left + rect.width / 2 + (Math.random() * 60 - 30)) + 'px';
    note.style.top = rect.top + 'px';
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3600);
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {
      // No audio file present yet — still animate for the demo.
      setPlayingUI(true);
    });
    else audio.pause();
  });
  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('ended', () => loadTrack(idx + 1, true));

  nextBtn.addEventListener('click', () => loadTrack(idx + 1, !audio.paused));
  prevBtn.addEventListener('click', () => loadTrack(idx - 1, !audio.paused));

  audio.addEventListener('loadedmetadata', () => {
    seek.max = audio.duration || 0;
    durTime.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    seek.value = audio.currentTime;
    curTime.textContent = formatTime(audio.currentTime);
  });
  seek.addEventListener('input', () => { audio.currentTime = seek.value; });
  volume.addEventListener('input', () => { audio.volume = volume.value; });
  audio.volume = volume.value;
}

/* ============================================================
   Fake Linux terminal — typewriter reveal
   ============================================================ */
const TERMINAL_LINES = [
  { cmd: 'whoami', out: 'the_luckiest_boyfriend_alive' },
  { cmd: 'pwd', out: '/home/our_future' },
  { cmd: 'ls -la our_life/', out: 'our_memories/\nour_dreams/\nour_future/\nour_adventures/' },
  { cmd: 'git log --oneline', out: 'f7a91c2  forever isn\'t enough\nb31d0e4  still falling\n9c02aa1  fell deeper in love\n1a0f3d5  first date\n0000001  met my queen' },
  { cmd: 'echo $LOVE_LEVEL', out: 'undefined (cannot be measured, only felt)' },
  { cmd: 'sudo apt-get install more-time-together', out: 'Reading state information... Done\nyou already have this — it just keeps updating.' },
];

function initTerminal() {
  const body = document.querySelector('.terminal-body');
  if (!body) return;
  body.innerHTML = '';
  let li = 0;

  function typeLine() {
    if (li >= TERMINAL_LINES.length) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor-blink';
      const promptLine = document.createElement('div');
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = 'beth@forever:~$ ';
      promptLine.appendChild(promptSpan);
      promptLine.appendChild(cursor);
      body.appendChild(promptLine);
      return;
    }
    const { cmd, out } = TERMINAL_LINES[li];
    const line = document.createElement('div');
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = 'beth@forever:~$ ';
    const cmdSpan = document.createElement('span');
    cmdSpan.className = 'cmd';
    line.appendChild(prompt);
    line.appendChild(cmdSpan);
    body.appendChild(line);

    let ci = 0;
    const typeChar = setInterval(() => {
      cmdSpan.textContent += cmd[ci];
      ci++;
      if (ci >= cmd.length) {
        clearInterval(typeChar);
        const outEl = document.createElement('div');
        outEl.className = 'out';
        outEl.textContent = out;
        body.appendChild(outEl);
        li++;
        setTimeout(typeLine, 450);
      }
    }, 35);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { typeLine(); obs.disconnect(); }
    });
  }, { threshold: 0.4 });
  obs.observe(body);
}

/* ============================================================
   Secret love letter envelopes
   ============================================================ */
const LOVE_LETTERS = {
  sad: `My love,

If you're reading this, something is sitting heavy on you, and I wish I could carry it for you.

You don't have to be okay right now. You're allowed to feel exactly what you're feeling. But I need you to know that whatever this is, it doesn't change one thing about how I see you. You're still the most remarkable person I know.

Breathe. Rest if you need to. I'm not going anywhere.

Always yours.`,
  miss: `Hey, Sunshine.

I know you clicked this because I'm not there right now, and I wish I was. Distance is the one thing about us I've never learned to like.

But here's what I know for certain: missing you is proof of how much I love you. So let it ache a little, and then remember — every mile between us is temporary. I'm always coming back to you.

Talk soon. Think of me.`,
  stressed: `My Queen,

Take a breath with me. In... and out.

Whatever's piling up right now, you are still going to be fine. You always are. You are one of the most capable, resilient people I've ever watched navigate hard things.

You don't have to carry it perfectly. You just have to keep going, and I'll be right here cheering you on the entire time.

I believe in you completely.`,
  sleep: `Goodnight, my favorite person.

If you're wide awake and your mind won't slow down, I hope these words find you and settle something in your chest.

Wherever you are, however far, picture me right beside you — one arm under your pillow, telling you it's okay to close your eyes now. You're safe. You're loved. Tomorrow can wait.

Sleep well. I'll be thinking of you until you wake up.`,
  anytime: `To whoever is reading this, whenever you're reading it —

I just wanted you to know that you are loved, thoroughly and on purpose, not because of anything you did today, but simply because you exist and you're you.

Thank you for letting me love you. Thank you for loving me back. Out of every ordinary day, I'm glad this is one of ours.

Forever, easily, always.`,
};

function initEnvelopes() {
  const envelopes = document.querySelectorAll('.envelope');
  if (!envelopes.length) return;
  envelopes.forEach(env => {
    const key = env.dataset.letter;
    const paper = document.createElement('div');
    paper.className = 'letter-paper';
    paper.style.marginTop = '14px';
    paper.style.display = 'none';
    paper.style.gridColumn = '1 / -1';
    env.insertAdjacentElement('afterend', paper);

    env.addEventListener('click', () => {
      const opening = !env.classList.contains('opened');
      env.classList.toggle('opened');
      if (opening) {
        if (!paper.textContent.trim()) paper.textContent = LOVE_LETTERS[key] || '';
        paper.style.display = 'block';
      } else {
        paper.style.display = 'none';
      }
    });
  });
}

/* ============================================================
   Date invitation
   ============================================================ */
function initDateInvitation() {
  const card = document.querySelector('.invite-card');
  if (!card) return;
  const buttons = card.querySelectorAll('.btn-yes');
  const question = card.querySelector('.invite-question, .invite-buttons');
  const result = card.querySelector('.invite-result');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      card.querySelector('.invite-question').style.display = 'none';
      card.querySelector('.invite-buttons').style.display = 'none';
      result.classList.add('show');
      burstHearts(18);
      burstConfetti(40);
      bloomFlowers(10);
    });
  });
}

/* ============================================================
   Easter eggs: typed words + Konami code
   ============================================================ */
function initEasterEggs() {
  let buffer = '';
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiPos = 0;

  document.addEventListener('keydown', (e) => {
    // Konami code
    const key = e.key;
    if (key === konami[konamiPos]) {
      konamiPos++;
      if (konamiPos === konami.length) {
        konamiPos = 0;
        unlockForever();
      }
    } else {
      konamiPos = (key === konami[0]) ? 1 : 0;
    }

    // Typed phrases (ignore when typing in an input)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (key.length === 1) {
      buffer = (buffer + key.toLowerCase()).slice(-20);
      if (buffer.endsWith('i love you')) { rosesFall(24); buffer = ''; }
      if (buffer.endsWith('beth')) { heartsTakeover(); buffer = ''; }
      if (buffer.endsWith('queen')) { queenAnimation(); buffer = ''; }
    }
  });
}

function unlockForever() {
  const banner = document.createElement('div');
  banner.textContent = 'Our Forever.';
  Object.assign(banner.style, {
    position: 'fixed', inset: '0', zIndex: '2000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15,15,15,0.92)', color: '#ff86b8',
    fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 8vw, 5rem)',
    opacity: '0', transition: 'opacity 1s ease',
  });
  document.body.appendChild(banner);
  requestAnimationFrame(() => { banner.style.opacity = '1'; });
  burstHearts(40);
  setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 1000);
  }, 3200);
}

function rosesFall(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnFloaty('🌹', true), i * 60);
  }
}
function heartsTakeover() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => spawnFloaty('❤️', true), i * 30);
  }
}
function queenAnimation() {
  const crown = document.createElement('div');
  crown.textContent = '👑';
  Object.assign(crown.style, {
    position: 'fixed', top: '-10%', left: '50%', fontSize: '5rem', zIndex: '2000',
    transform: 'translateX(-50%)', transition: 'top 1.8s cubic-bezier(.22,1,.36,1)',
  });
  document.body.appendChild(crown);
  requestAnimationFrame(() => { crown.style.top = '40%'; });
  setTimeout(() => { crown.style.top = '-15%'; }, 2200);
  setTimeout(() => crown.remove(), 4000);
}

function spawnFloaty(glyph, big) {
  const el = document.createElement('div');
  el.className = 'floaty';
  el.textContent = glyph;
  el.style.left = Math.random() * 100 + 'vw';
  el.style.top = '-40px';
  el.style.fontSize = (big ? 22 + Math.random() * 20 : 14 + Math.random() * 10) + 'px';
  el.style.opacity = '0.9';
  document.body.appendChild(el);
  const duration = 3500 + Math.random() * 2500;
  const drift = (Math.random() - 0.5) * 200;
  el.animate([
    { transform: 'translate(0,0) rotate(0deg)', opacity: 0.9 },
    { transform: `translate(${drift}px, 100vh) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0 }
  ], { duration, easing: 'ease-in' });
  setTimeout(() => el.remove(), duration + 100);
}

function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnFloaty('❤️'), i * 40);
}
function bloomFlowers(n) {
  const flowers = ['🌸', '🌷', '🌹', '🌺'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnFloaty(flowers[Math.floor(Math.random() * flowers.length)], true), i * 80);
  }
}
function burstConfetti(n) {
  const colors = ['#ff4f9a', '#d9b579', '#ffb4cf', '#ffffff'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'floaty';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-20px';
    el.style.width = '8px';
    el.style.height = '14px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = '2px';
    document.body.appendChild(el);
    const duration = 2500 + Math.random() * 2000;
    el.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${(Math.random() - 0.5) * 300}px, 100vh) rotate(${Math.random() * 720}deg)`, opacity: 0.9 }
    ], { duration, easing: 'ease-in' });
    setTimeout(() => el.remove(), duration + 100);
  }
}

/* ============================================================
   Finale sequence — "One More Thing"
   ============================================================ */
function initFinale() {
  const finale = document.querySelector('.finale');
  if (!finale) return;
  const lines = finale.querySelectorAll('.finale-line');
  const heart = finale.querySelector('.glow-heart');
  const finalLine = finale.querySelector('.finale-final');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('show'), i * 1400 + 400);
      });
      setTimeout(() => heart && heart.classList.add('show'), lines.length * 1400 + 800);
      obs.disconnect();
    });
  }, { threshold: 0.5 });
  obs.observe(finale);

  if (heart) {
    heart.addEventListener('click', () => {
      burstHearts(30);
      bloomFlowers(14);
      burstConfetti(50);
      finalLine.classList.add('show');
    });
  }
}

/* ============================================================
   Gallery page — morphing slideshow (gallery.html)
   Safe no-op if these elements don't exist on the current page.
   ============================================================ */
function initGallery() {
  const stage = document.querySelector('.morph-frame');
  if (!stage) return;

  const captions = [
    'The day it all began',
    'Somewhere we got lost on purpose',
    'You, mid-laugh, unaware I was staring',
    'Golden hour looks better on you',
    'The trip we still talk about',
    'A quiet Tuesday that felt like everything',
    'Dressed up, hearts fuller than usual',
    'Right where I want to be',
  ];
  const total = 8;
  const slidesWrap = document.createElement('div');
  slidesWrap.style.position = 'absolute';
  slidesWrap.style.inset = '0';

  const slides = [];
  for (let i = 1; i <= total; i++) {
    const div = document.createElement('div');
    div.className = 'morph-slide';
    const img = document.createElement('img');
    img.src = `images/gallery${i}.jpg`;
    img.alt = captions[i - 1];
    img.loading = 'lazy';
    img.onerror = () => {
      img.remove();
      const fb = document.createElement('div');
      fb.className = 'ph-fallback';
      fb.textContent = '♡';
      div.insertBefore(fb, div.firstChild);
    };
    const cap = document.createElement('div');
    cap.className = 'morph-caption';
    cap.textContent = captions[i - 1];
    div.appendChild(img);
    div.appendChild(cap);
    stage.appendChild(div);
    slides.push(div);
  }
  const reflection = document.createElement('div');
  reflection.className = 'morph-reflection';
  stage.appendChild(reflection);

  slides[0].classList.add('active');

  const indicators = document.querySelector('.morph-indicators');
  const thumbs = document.querySelector('.gallery-thumbs');
  const indicatorBtns = [];
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => goTo(i));
    indicators.appendChild(b);
    indicatorBtns.push(b);

    if (thumbs) {
      const tb = document.createElement('button');
      if (i === 0) tb.classList.add('active');
      const timg = document.createElement('img');
      timg.src = `images/gallery${i + 1}.jpg`;
      timg.alt = captions[i];
      timg.onerror = () => { timg.style.background = 'linear-gradient(135deg,#3a2530,#211318)'; };
      tb.appendChild(timg);
      tb.addEventListener('click', () => goTo(i));
      thumbs.appendChild(tb);
    }
  });

  let current = 0;
  let autoTimer = null;

  function goTo(i) {
    slides[current].classList.remove('active');
    indicatorBtns[current].classList.remove('active');
    thumbs && thumbs.children[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    indicatorBtns[current].classList.add('active');
    thumbs && thumbs.children[current].classList.add('active');
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { autoTimer = setInterval(next, 4200); }
  function stopAuto() { clearInterval(autoTimer); }
  startAuto();

  const stageWrap = document.querySelector('.gallery-stage');
  stageWrap.addEventListener('mouseenter', stopAuto);
  stageWrap.addEventListener('mouseleave', startAuto);

  document.querySelector('.morph-next').addEventListener('click', () => { next(); stopAuto(); startAuto(); });
  document.querySelector('.morph-prev').addEventListener('click', () => { prev(); stopAuto(); startAuto(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    if (e.key === 'ArrowLeft') { prev(); stopAuto(); startAuto(); }
  });

  // Touch swipe support
  let touchStartX = 0;
  stage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? prev() : next();
      stopAuto(); startAuto();
    }
  }, { passive: true });
}
