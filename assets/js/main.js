// Studio Dentistico Ceraldi – interazioni della pagina
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Orari: giorno (0 = domenica) -> [apertura, chiusura] in ore
  const HOURS = { 1: [15, 20], 2: [9, 13], 3: [15, 20], 4: [15, 20], 5: [9, 13] };
  const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const WA_NUMBER = '393311939977';

  // Ora italiana, indipendente dal fuso del visitatore
  function nowInRome() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Rome', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  }
  const hh = (h) => `${h}:00`;

  // Stato ricevimento nell'apertura + giorno corrente in tabella
  function updateStatus() {
    const { day, minutes } = nowInRome();
    const el = document.querySelector('[data-status]');
    const text = document.querySelector('[data-status-text]');
    const today = HOURS[day];
    let msg;
    let open = false;

    if (today && minutes >= today[0] * 60 && minutes < today[1] * 60) {
      open = true;
      msg = `Ora in orario di ricevimento, fino alle ${hh(today[1])}`;
    } else if (today && minutes < today[0] * 60) {
      msg = `Oggi dalle ${hh(today[0])} alle ${hh(today[1])}, su appuntamento`;
    } else {
      let d = day;
      for (let i = 1; i <= 7; i++) {
        d = (day + i) % 7;
        if (HOURS[d]) break;
      }
      const when = d === (day + 1) % 7 ? 'domani' : DAYS[d];
      msg = `Riceviamo ${when} dalle ${hh(HOURS[d][0])}, su appuntamento`;
    }
    if (el && text) {
      text.textContent = msg;
      el.classList.toggle('is-open', open);
    }
    document.querySelectorAll('.hours-table tr').forEach((tr) => {
      tr.classList.toggle('is-today', Number(tr.dataset.day) === day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60_000);

  // Titolo dell'apertura diviso in parole per l'ingresso
  const title = document.querySelector('[data-split]');
  if (title && !reduced) {
    let i = 0;
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/( )/).forEach((part) => {
            if (part === ' ') { frag.append(' '); return; }
            if (!part) return;
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrapWords(child);
        }
      });
    };
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    wrapWords(title);
    [...title.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  // Header al scroll + barra azioni mobile dopo l'apertura
  const header = document.querySelector('[data-header]');
  const bar = document.querySelector('.action-bar');
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', scrollY > 8);
    if (bar && hero) bar.classList.toggle('is-visible', hero.getBoundingClientRect().bottom < 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  const toggle = document.querySelector('[data-nav-toggle]');
  const list = document.querySelector('[data-nav-list]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Chiudi' : 'Menu';
    list.classList.toggle('is-open', open);
    root.classList.toggle('nav-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  list?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Rivelazione delle foto all'ingresso, una volta
  document.querySelectorAll('.t-list .t-item').forEach((el, k) => el.style.setProperty('--k', k));
  const reveals = document.querySelectorAll('.reveal, .steps, .section-head, .rooms-title, .t-list, .booking');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('is-in'));
  }

  // Richiesta appuntamento -> messaggio WhatsApp precompilato
  const form = document.querySelector('[data-booking]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.elements.nome;
    const err = document.getElementById('f-nome-err');
    if (!nome.value.trim()) {
      nome.setAttribute('aria-invalid', 'true');
      err.hidden = false;
      nome.focus();
      return;
    }
    nome.removeAttribute('aria-invalid');
    err.hidden = true;

    const motivo = form.elements.motivo.value;
    const quando = form.querySelector('input[name="quando"]:checked')?.value || "quando c'è posto";
    const note = form.elements.note.value.trim();
    let text = `Buongiorno, sono ${nome.value.trim()}. Vorrei prenotare un appuntamento per: ${motivo.toLowerCase()}. Preferirei venire ${quando}.`;
    if (note) text += ` ${note}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  form?.elements.nome.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      e.target.removeAttribute('aria-invalid');
      document.getElementById('f-nome-err').hidden = true;
    }
  });

  // Mappa Google caricata solo su richiesta
  document.querySelector('[data-map-load]')?.addEventListener('click', () => {
    const map = document.querySelector('[data-map]');
    const iframe = document.createElement('iframe');
    iframe.title = 'Mappa: Studio Dentistico Ceraldi, Viale Trieste, Sessa Aurunca';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = 'https://www.google.com/maps?q=41.230587,13.929343&z=17&output=embed';
    map.replaceChildren(iframe);
  });

  // ---- Movimento legato a scroll e mouse (un solo ciclo rAF) ----
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Frase dello studio: parole che si accendono con lo scroll
  const statement = document.querySelector('[data-words]');
  let words = [];
  if (statement && !reduced) {
    const split = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'sw';
            w.textContent = part;
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) split(child);
      });
    };
    split(statement);
    words = [...statement.querySelectorAll('.sw')];
  }

  const parallaxImgs = [...document.querySelectorAll('[data-parallax]')];
  const heroVisual = document.querySelector('[data-hero-visual]');
  const depthEls = heroVisual ? [...heroVisual.querySelectorAll('[data-depth]')] : [];
  const ring = heroVisual?.querySelector('.scallop-ring');
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  if (finePointer && heroVisual && !reduced) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width - 0.5;
      mouse.ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('pointerleave', () => { mouse.tx = 0; mouse.ty = 0; });
  }

  // Tecnologie: sezione bloccata che avanza voce per voce (solo desktop)
  const track = document.querySelector('[data-tech]');
  const techItems = track ? [...track.querySelectorAll('.tech-list li')] : [];
  const glyphs = track ? [...track.querySelectorAll('.tech-glyph')] : [];
  const techDots = track ? [...track.querySelectorAll('.tech-dots li')] : [];
  const badge = track?.querySelector('.tech-badge');
  const pinMq = matchMedia('(min-width: 961px)');
  let pinned = false;
  let activeTech = -1;
  const setTech = (i) => {
    if (i === activeTech) return;
    activeTech = i;
    techItems.forEach((li, k) => li.classList.toggle('is-active', k === i));
    glyphs.forEach((g, k) => g.classList.toggle('is-on', k === i));
    techDots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    if (badge) badge.style.setProperty('--rot', `${i * 30}deg`);
  };
  const setPin = () => {
    pinned = pinMq.matches && !reduced && !!track;
    root.classList.toggle('pin-tech', pinned);
    if (pinned) { activeTech = -1; setTech(0); }
  };
  setPin();
  pinMq.addEventListener('change', setPin);
  techItems.forEach((li, k) => li.addEventListener('click', () => {
    if (!pinned) return;
    const top = track.getBoundingClientRect().top + scrollY;
    const span = track.offsetHeight - innerHeight;
    scrollTo({ top: top + span * ((k + 0.5) / techItems.length), behavior: 'smooth' });
  }));

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;

    // apertura: profondità col mouse + deriva con lo scroll
    if (heroVisual && !reduced) {
      mouse.x = lerp(mouse.x, mouse.tx, 0.08);
      mouse.y = lerp(mouse.y, mouse.ty, 0.08);
      const hr = hero.getBoundingClientRect();
      const out = clamp(-hr.top / hr.height, 0, 1);
      depthEls.forEach((el) => {
        const d = Number(el.dataset.depth);
        el.style.translate = `${(mouse.x * d * 22).toFixed(2)}px ${(mouse.y * d * 22 - out * d * 40).toFixed(2)}px`;
      });
      if (ring) ring.style.rotate = `${(out * 70).toFixed(2)}deg`;
      heroVisual.style.translate = `0 ${(out * 60).toFixed(1)}px`;
      if (Math.abs(mouse.x - mouse.tx) > 0.001 || Math.abs(mouse.y - mouse.ty) > 0.001) request();
    }

    // frase dello studio
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, k) => w.classList.toggle('is-lit', k < lit));
    }

    // parallasse delle foto
    if (!reduced) {
      parallaxImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${(p * -7).toFixed(2)}%`;
      });
    }

    // avanzamento Tecnologie
    if (pinned) {
      const r = track.getBoundingClientRect();
      const span = track.offsetHeight - vh;
      const p = clamp(-r.top / span, 0, 0.999);
      setTech(Math.floor(p * techItems.length));
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  if (finePointer) hero?.addEventListener('pointermove', request);
  request();

  // Bottoni magnetici
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
        btn.classList.add('is-pulled');
        btn.style.translate = `${clamp(dx, -10, 10).toFixed(1)}px ${clamp(dy, -8, 8).toFixed(1)}px`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-pulled');
        btn.style.translate = '0 0';
      });
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
