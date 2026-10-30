/* ATLAS DE LUZ — comportamento
   CONFIG abaixo é o único lugar com dados que você precisa trocar.
   ------------------------------------------------------------------------
   1. CIDADES  → nome, latitude, longitude e fuso, para o cálculo da luz
   2. FOTOS    → a fita do carregador (imagens mini já baixadas em img/)
   3. CONTATO → e-mail e WhatsApp do mailto do formulário
   As constellations, textos e tabelas ficam no index.html.
   ------------------------------------------------------------------------ */

const CONFIG = {
  cidades: {
    "sao-paulo": {
      nome: "São Paulo",
      lat: -23.5505,
      lon: -46.6333,
      tz: "America/Sao_Paulo",
    },
    rio: {
      nome: "Rio de Janeiro",
      lat: -22.9068,
      lon: -43.1729,
      tz: "America/Sao_Paulo",
    },
    lisboa: { nome: "Lisboa", lat: 38.7223, lon: -9.1393, tz: "Europe/Lisbon" },
    "nova-york": {
      nome: "Nova York",
      lat: 40.7128,
      lon: -74.006,
      tz: "America/New_York",
    },
  },
  contato: {
    email: "ola@seudominio.com.br",
    zap: "5511900000000",
  },
  fotos: [
    "retrato-01",
    "retrato-02",
    "retrato-03",
    "retrato-04",
    "editorial-01",
    "editorial-02",
    "editorial-03",
    "editorial-04",
    "arq-01",
    "arq-02",
    "arq-03",
    "arq-04",
    "arq-05",
    "retrato-05",
    "hero",
  ],
};

const LIGAS = [
  ["r1", "e1"],
  ["e1", "r3"],
  ["r3", "e3"],
  ["e3", "e4"],
  ["r3", "a2"],
  ["r1", "r2"],
  ["r2", "a1"],
  ["a1", "a3"],
  ["a3", "a4"],
  ["a2", "e2"],
  ["e2", "r4"],
  ["r4", "a3"],
  ["a4", "e3"],
  ["r2", "e2"],
  ["a1", "a4"],
];

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ------------------------------------------------------------------ */
/* 1. carregador — fita de contato que enche conforme as imagens entram */
/* ------------------------------------------------------------------ */

function carregador() {
  const el = $("#carregador");
  if (!el) return;

  const fita = $("#carregadorFita");
  const barra = $("#trilhoBarra");
  const contador = $("#contador");
  const totalEl = $("#contadorTotal");
  const imagens = $$('img[src]:not([loading="lazy"])');
  if (totalEl) totalEl.textContent = String(imagens.length).padStart(2, "0");
  const quadros = CONFIG.fotos.map((nome) => {
    const i = document.createElement("i");
    i.style.backgroundImage = `url(img/${nome}-mini.jpg)`;
    fita.appendChild(i);
    return i;
  });

  let prontas = 0;
  const marcar = () => {
    prontas++;
    const pct = Math.min(1, prontas / imagens.length);
    barra.style.width = pct * 100 + "%";
    contador.textContent = String(Math.min(prontas, 99)).padStart(2, "0");
    quadros.forEach((q, i) => {
      if (i / quadros.length < pct) q.classList.add("on");
    });
  };

  let feitas = 0;
  imagens.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      feitas++;
      marcar();
      return;
    }
    img.addEventListener(
      "load",
      () => {
        feitas++;
        marcar();
      },
      { once: true },
    );
    img.addEventListener(
      "error",
      () => {
        feitas++;
        marcar();
      },
      { once: true },
    );
  });

  if (imagens.length === 0) {
    contador.textContent = "00";
    barra.style.width = "100%";
  }

  const sair = () => {
    el.classList.add("saiu");
    document.body.classList.add("pronto");
    setTimeout(() => el.remove(), reduced ? 60 : 1100);
  };

  const saiu = performance.now();
  const esperar = () => {
    const passou = performance.now() - saiu > (reduced ? 200 : 900);
    const nada = performance.now() - saiu > 5000;
    if ((feitas >= imagens.length && passou) || nada) setTimeout(sair, 160);
    else setTimeout(esperar, 90);
  };
  esperar();
}

/* ------------------------------------------------------------------ */
/* 2. relógio, nascer/pôr do sol, hora dourada e altura do sol          */
/*    fórmulas NOAA simplificadas — erro de ~2 minutos                 */
/* ------------------------------------------------------------------ */

const R = Math.PI / 180;
const ZENITE = 90.833;

function diaDoAno(d) {
  const ini = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d - ini) / 86400000);
}

function equacaoTempo(N) {
  const g = ((2 * Math.PI) / 365) * (N - 1 + 0.5);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g))
  );
}

function declinacao(N) {
  const g = ((2 * Math.PI) / 365) * (N - 1 + 0.5);
  return (
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g)
  );
}

function anguloHora(lat, dec) {
  const c =
    (Math.cos(ZENITE * R) - Math.sin(lat * R) * Math.sin(dec)) /
    (Math.cos(lat * R) * Math.cos(dec));
  if (c > 1 || c < -1) return NaN;
  return Math.acos(c) / R;
}

function offsetFuso(tz) {
  try {
    const txt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName").value;
    const m = txt.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const s = m[1][0] === "-" ? -1 : 1;
    return s * (Math.abs(+m[1]) * 60 + +(m[2] || 0));
  } catch {
    return 0;
  }
}

function minutosLocaisEmUTC(tz, agora) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(agora);
  const h = +p.find((x) => x.type === "hour").value % 24;
  const m = +p.find((x) => x.type === "minute").value;
  return h * 60 + m - offsetFuso(tz);
}

function horaNaCidade(dataUTC, tz) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dataUTC);
}

function luz(cidade) {
  const agora = new Date();
  const lat = cidade.lat,
    lon = cidade.lon;
  const local = new Date(
    agora.toLocaleString("en-US", { timeZone: cidade.tz }),
  );
  const N = diaDoAno(local);
  const eq = equacaoTempo(N);
  const dec = declinacao(N);
  const H = anguloHora(lat, dec);

  const d = new Date(
    Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()),
  );
  const meiaNoiteSolar = 720 - 4 * lon - eq;

  let nascer = null,
    por = null;
  if (!Number.isNaN(H)) {
    nascer = meiaNoiteSolar - 4 * H;
    por = meiaNoiteSolar + 4 * H;
  }

  const utcMin = minutosLocaisEmUTC(cidade.tz, agora) + agora.getSeconds() / 60;
  const ts = utcMin + eq + 4 * lon;
  const ah = (ts / 4 - 180) * R;
  const altura =
    Math.asin(
      Math.sin(lat * R) * Math.sin(dec) +
        Math.cos(lat * R) * Math.cos(dec) * Math.cos(ah),
    ) / R;

  const paraData = (min) =>
    min == null ? null : new Date(d.getTime() + min * 60000);

  let estado = "NOITE",
    cor = "var(--cobre)";
  if (altura > 45) {
    estado = "SOL A PINCO";
    cor = "var(--lata)";
  } else if (altura > 15) {
    estado = "LUZ ALTA";
    cor = "var(--lata)";
  } else if (altura > 6) {
    estado = "HORA DOURADA";
    cor = "var(--lata)";
  } else if (altura > -4) {
    estado = "HORA AZUL";
    cor = "var(--cobre)";
  } else if (altura > -12) {
    estado = "CREPÚSCULO";
    cor = "var(--cobre)";
  } else {
    estado = "LUZ DE SEGURANÇA";
    cor = "var(--texto-fraco)";
  }

  return {
    estado,
    cor,
    altura,
    nascer: paraData(nascer),
    por: paraData(por),
    dourada: por ? [paraData(por - 60), paraData(por)] : null,
  };
}

function painelLuz() {
  const sel = $("#cidade");
  const rel = $("#relogio"),
    txtEstado = $("#estadoLuzTexto"),
    pip = $(".pip");
  const elNascer = $("#nascer"),
    elPor = $("#por"),
    elDourada = $("#dourada"),
    elAltura = $("#altura");
  if (!sel) return;

  const hhmm = (d) =>
    d ? horaNaCidade(d, CONFIG.cidades[sel.value].tz) : "--:--";

  const pintar = () => {
    const l = luz(CONFIG.cidades[sel.value]);
    rel.textContent = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    txtEstado.textContent =
      l.estado.toLowerCase() + " · " + CONFIG.cidades[sel.value].nome;
    if (pip) pip.style.background = l.cor;
    elNascer.textContent = hhmm(l.nascer);
    elPor.textContent = hhmm(l.por);
    elDourada.textContent = l.dourada
      ? `${hhmm(l.dourada[0])} – ${hhmm(l.dourada[1])}`
      : "--:--";
    elAltura.textContent =
      (l.altura >= 0 ? "+" : "") + l.altura.toFixed(1) + "°";
  };

  sel.addEventListener("change", pintar);
  pintar();
  setInterval(pintar, 1000);
}

/* ------------------------------------------------------------------ */
/* 3. revelação por rolagem                                             */
/* ------------------------------------------------------------------ */

function revelacao() {
  const alvos = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduced) {
    alvos.forEach((a) => a.classList.add("visivel"));
    return;
  }
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const atraso = +(e.target.dataset.atraso || 0);
        setTimeout(() => e.target.classList.add("visivel"), atraso * 1000);
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );
  alvos.forEach((a) => io.observe(a));
}

/* ------------------------------------------------------------------ */
/* 4. navegação ativa                                                  */
/* ------------------------------------------------------------------ */

function navAtiva() {
  const links = $$(".barra__nav a");
  const secoes = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if (!secoes.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle(
            "ativo",
            l.getAttribute("href") === "#" + e.target.id,
          ),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  secoes.forEach((s) => io.observe(s));
}

/* ------------------------------------------------------------------ */
/* 5. constelações — as linhas são medidas no layout real               */
/* ------------------------------------------------------------------ */

function constelacoes() {
  const mapa = $("#mapa");
  const svg = $("#ligas");
  if (!mapa || !svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const estrelas = $$(".estrela", mapa);
  const por = new Map(estrelas.map((e) => [e.dataset.id, e]));
  const grupos = [];

  LIGAS.forEach(([a, b]) => {
    const A = por.get(a),
      B = por.get(b);
    if (!A || !B) return;

    const no = document.createElementNS(NS, "circle");
    no.setAttribute("class", "no");
    no.setAttribute("r", "3");
    svg.appendChild(no);

    const p = document.createElementNS(NS, "path");
    p.setAttribute("class", "liga");
    svg.appendChild(p);

    grupos.push({ a, b, p, no, A, B });
  });

  const desenhar = () => {
    const base = mapa.getBoundingClientRect();
    const largura = svg.clientWidth || base.width;
    const alturaSvg = svg.clientHeight || base.height;
    svg.setAttribute("viewBox", `0 0 ${largura} ${alturaSvg}`);

    grupos.forEach((g, i) => {
      const ra = g.A.getBoundingClientRect();
      const rb = g.B.getBoundingClientRect();
      const ax = ra.left - base.left + ra.width / 2;
      const ay = ra.top - base.top + ra.height / 2;
      const bx = rb.left - base.left + rb.width / 2;
      const by = rb.top - base.top + rb.height / 2;

      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      const dx = bx - ax,
        dy = by - ay;
      const dist = Math.hypot(dx, dy) || 1;
      const desvio = Math.min(26, dist * 0.09);
      const cx = mx - (dy / dist) * desvio;
      const cy = my + (dx / dist) * desvio;

      g.p.setAttribute(
        "d",
        `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`,
      );
      g.no.setAttribute("cx", ax.toFixed(1));
      g.no.setAttribute("cy", ay.toFixed(1));

      g.i = i;
      g.len = g.p.getTotalLength ? g.p.getTotalLength() : 600;
      if (reduced) {
        g.p.style.strokeDasharray = "none";
        g.p.style.strokeDashoffset = "0";
      } else {
        g.p.style.strokeDasharray = String(g.len);
        g.p.style.strokeDashoffset = String(g.len);
      }
    });

    if (reduced) return;

    const inicio = base.top - window.innerHeight * 0.8;
    const total = Math.max(1, alturaSvg * 0.6);

    const aoRolar = () => {
      const avanco = Math.max(
        0,
        Math.min(1.35, (window.scrollY - inicio) / total),
      );
      grupos.forEach((g) => {
        const f = Math.max(0, Math.min(1, (avanco - g.i * 0.02) / 0.85));
        g.p.style.strokeDashoffset = String(g.len * (1 - f));
      });
    };
    aoRolar();
    mapa._rolar = aoRolar;
  };

  const recalcular = () => {
    if (mapa._rolar) {
      window.removeEventListener("scroll", mapa._rolar);
      mapa._rolar = null;
    }
    desenhar();
    if (mapa._rolar)
      window.addEventListener("scroll", mapa._rolar, { passive: true });
  };

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(recalcular, 180);
  });
  if (document.fonts) document.fonts.ready.then(recalcular);
  recalcular();

  const acender = (id, ligado) => {
    grupos.forEach((g) => {
      if (g.a !== id && g.b !== id) return;
      g.p.classList.toggle("acesa", ligado);
      if (ligado) g.p.style.strokeDashoffset = "0";
      if (g.a === id) g.no.classList.toggle("acesa", ligado);
    });
    if (!ligado && mapa._rolar) mapa._rolar();
  };

  estrelas.forEach((e) => {
    e.addEventListener("mouseenter", () => acender(e.dataset.id, true));
    e.addEventListener("mouseleave", () => acender(e.dataset.id, false));
    e.addEventListener("focusin", () => acender(e.dataset.id, true));
    e.addEventListener("focusout", () => acender(e.dataset.id, false));
  });
}

/* ------------------------------------------------------------------ */
/* 6. ficha flutuante (dados do quadro)                                 */
/* ------------------------------------------------------------------ */

const DADOS = {
  r1: {
    tit: "Sala de Espera",
    leg: "retrato · 2025",
    d: [
      ["local", "Casa do modelo"],
      ["luz", "janela, 16h40"],
      ["lente", "50 mm f/1.8"],
      ["filme", "Tri-X 400"],
    ],
  },
  e1: {
    tit: "Corte de Verão",
    leg: "editorial · campanha · 2025",
    d: [
      ["cliente", "confidencial"],
      ["local", "ateliê, Vila Madalena"],
      ["luz", "flash editorial"],
      ["entrega", "60 quadros"],
    ],
  },
  a1: {
    tit: "Casa em Terraço",
    leg: "arquitetura · 2025",
    d: [
      ["comissão", "estúdio Aster"],
      ["local", "Alto de Pinheiros"],
      ["luz", "fim de tarde"],
      ["entrega", "12 quadros"],
    ],
  },
  r2: {
    tit: "Depois do Último Trem",
    leg: "retrato · 2025",
    d: [
      ["local", "Luz"],
      ["luz", "luminária de plataforma"],
      ["lente", "35 mm f/1.4"],
      ["filme", "HP5 Plus"],
    ],
  },
  a2: {
    tit: "Sala de Reuniões, 07h40",
    leg: "interiores · 2026",
    d: [
      ["comissão", "construtora"],
      ["local", "Vila Olímpia"],
      ["luz", "natural + rebatedor"],
      ["entrega", "14 quadros"],
    ],
  },
  r3: {
    tit: "Ana, Três Vezes",
    leg: "série · 2024",
    d: [
      ["série", "3 cenários"],
      ["luz", "difusa, sem rebatedor"],
      ["lente", "85 mm f/2"],
      ["papel", "fibra 310 g/m²"],
    ],
  },
  e2: {
    tit: "Segundo Plano",
    leg: "editorial · 2024",
    d: [
      ["cliente", "revista Foco"],
      ["local", "Vila Madalena"],
      ["luz", "1/8000 f/1.4"],
      ["entrega", "8 quadros"],
    ],
  },
  a3: {
    tit: "Apartamento com Pouca Luz",
    leg: "interiores · 2025",
    d: [
      ["comissão", "particular"],
      ["local", "Higienópolis"],
      ["luz", "3 janelas, tarde"],
      ["entrega", "12 quadros"],
    ],
  },
  e3: {
    tit: "Pausa",
    leg: "beleza · 2025",
    d: [
      ["cliente", "agência"],
      ["local", "estúdio de cheiro"],
      ["luz", "difusor grande"],
      ["entrega", "20 quadros"],
    ],
  },
  r4: {
    tit: "Costas",
    leg: "estudo de luz · 2026",
    d: [
      ["série", "estudo de silhueta"],
      ["local", "ateliê do autor"],
      ["luz", "1 flash, 45°"],
      ["filme", "Portra 400"],
    ],
  },
  a4: {
    tit: "Fachada Sul",
    leg: "arquitetura · 2024",
    d: [
      ["comissão", "estúdio Aster"],
      ["local", "Jardins"],
      ["luz", "sol rasante"],
      ["entrega", "10 quadros"],
    ],
  },
  e4: {
    tit: "Réplica",
    leg: "casting · 2026",
    d: [
      ["cliente", "produtora de elenco"],
      ["local", "cenografia"],
      ["luz", "3 fontes"],
      ["entrega", "casting + 30"],
    ],
  },
};

function ficha() {
  const placa = $("#placaDados");
  if (!placa || !fino) return;
  const elId = $("#pdId"),
    elTit = $("#pdTit"),
    elDl = $("#pdDados");

  $$(".estrela").forEach((e) => {
    const mostrar = () => {
      const d = DADOS[e.dataset.id];
      if (!d) return;
      const img = $("img", e);
      elId.textContent = $(".estrela__id", e).textContent;
      elTit.textContent = d.tit;
      elDl.innerHTML = d.d
        .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
        .join("");

      const r = e.getBoundingClientRect();
      const largura = placa.offsetWidth || 250;
      const altura = placa.offsetHeight || 180;
      let x = r.right + 18;
      if (x + largura > window.innerWidth - 24) x = r.left - largura - 18;
      if (x < 24) x = 24;
      const y = Math.min(
        Math.max(r.top, 84),
        Math.max(84, window.innerHeight - altura - 24),
      );
      placa.style.left = x + "px";
      placa.style.top = y + "px";
      placa.classList.add("visivel");
      placa.setAttribute("aria-hidden", "false");
    };
    const esconder = () => {
      placa.classList.remove("visivel");
      placa.setAttribute("aria-hidden", "true");
    };
    e.addEventListener("mouseenter", mostrar);
    e.addEventListener("mouseleave", esconder);
    const b = $(".quadro", e);
    b.addEventListener("focus", mostrar);
    b.addEventListener("blur", esconder);
  });
}

/* ------------------------------------------------------------------ */
/* 7. filtros                                                          */
/* ------------------------------------------------------------------ */

function filtros() {
  const mapa = $("#mapa");
  if (!mapa) return;
  $$(".filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filtro").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      mapa.dataset.cat = btn.dataset.cat;
    });
  });
}

/* ------------------------------------------------------------------ */
/* 8. lupa                                                             */
/* ------------------------------------------------------------------ */

function lupa() {
  const dlg = $("#lupa");
  if (!dlg) return;
  const img = $("#lupaImg");
  const elId = $("#lupaId"),
    elTit = $("#lupaTit"),
    elLeg = $("#lupaLeg"),
    elDl = $("#lupaDados");
  const estrelas = $$(".estrela");
  let atual = 0;

  const montar = (i) => {
    const e = estrelas[i];
    if (!e) return;
    atual = (i + estrelas.length) % estrelas.length;
    const src = $("img", e);
    const d = DADOS[e.dataset.id] || { tit: "", leg: "", d: [] };
    img.src = src.src;
    img.alt = src.alt;
    elId.textContent = $(".estrela__id", e).textContent;
    elTit.textContent = d.tit;
    elLeg.textContent = d.leg;
    elDl.innerHTML = d.d.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  };

  estrelas.forEach((e, i) => {
    $(".quadro", e).addEventListener("click", () => {
      if (getComputedStyle(e).opacity < 0.4) return;
      montar(i);
      if (!dlg.open) dlg.showModal();
    });
  });

  $(".lupa__fecha").addEventListener("click", () => dlg.close());
  $(".lupa__nav--ant").addEventListener("click", () => montar(atual - 1));
  $(".lupa__nav--pro").addEventListener("click", () => montar(atual + 1));
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") montar(atual - 1);
    if (e.key === "ArrowRight") montar(atual + 1);
  });
}

/* ------------------------------------------------------------------ */
/* 9. mira dentro do atlas                                              */
/* ------------------------------------------------------------------ */

function mira() {
  const el = $("#reticulo");
  const mapa = $("#mapa");
  if (!el || !fino || reduced) return;

  let x = 0,
    y = 0,
    dx = 0,
    dy = 0,
    ligado = false,
    ativo = false;
  el.appendChild(document.createElement("i"));

  const liga = (v) => {
    if (v === ligado) return;
    ligado = v;
    document.body.dataset.mira = v ? "1" : "0";
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!ligado) {
        dx = x;
        dy = y;
      }
      if (!mapa) return;
      const r = mapa.getBoundingClientRect();
      const dentro =
        e.clientX > r.left - 40 &&
        e.clientX < r.right + 40 &&
        e.clientY > r.top - 40 &&
        e.clientY < r.bottom + 40;
      liga(dentro);
      ativo = dentro;
    },
    { passive: true },
  );

  const laco = () => {
    dx += (x - dx) * 0.18;
    dy += (y - dy) * 0.18;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(laco);
  };
  requestAnimationFrame(laco);
}

/* ------------------------------------------------------------------ */
/* 10. miniatura flutuante da tabela                                    */
/* ------------------------------------------------------------------ */

function miniTabela() {
  const tabela = $(".tabela");
  if (!tabela || !fino) return;
  const img = document.createElement("img");
  img.className = "mini";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  document.body.appendChild(img);

  $$(".linha[data-thumb]", tabela).forEach((linha) => {
    linha.addEventListener("mouseenter", () => {
      img.src = linha.dataset.thumb;
      const r = linha.getBoundingClientRect();
      img.style.left = Math.max(20, r.left - 172) + "px";
      img.style.top = Math.min(r.top, window.innerHeight - 120) + "px";
      img.classList.add("visivel");
    });
    linha.addEventListener("mouseleave", () => img.classList.remove("visivel"));
  });
}

/* ------------------------------------------------------------------ */
/* 11. formulário → abre no cliente de e-mail                           */
/* ------------------------------------------------------------------ */

function formulario() {
  const form = $("#formulario");
  if (!form) return;
  const aviso = $("#formAviso");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const nome = (dados.get("nome") || "").toString().trim();
    const email = (dados.get("email") || "").toString().trim();
    const tipo = (dados.get("tipo") || "").toString().trim();
    const data = (dados.get("data") || "").toString().trim();
    const msg = (dados.get("mensagem") || "").toString().trim();

    if (!nome || !email || !msg) {
      aviso.textContent = "preencha nome, e-mail e o que você precisa.";
      aviso.classList.add("erro");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      aviso.textContent = "esse e-mail não parece completo.";
      aviso.classList.add("erro");
      return;
    }

    aviso.classList.remove("erro");
    aviso.textContent = "abrindo seu e-mail…";

    const corpo = [
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Tipo: ${tipo}`,
      `Data pretendida: ${data || "a combinar"}`,
      "",
      msg,
    ].join("\n");

    window.location.href =
      `mailto:${CONFIG.contato.email}` +
      `?subject=${encodeURIComponent(`Encomenda 2026 — ${tipo} — ${nome}`)}` +
      `&body=${encodeURIComponent(corpo)}`;
  });
}

/* ------------------------------------------------------------------ */
/* 12. nitidez progressiva + aperto do título na rolagem                */
/* ------------------------------------------------------------------ */

function nitidez() {
  $$("img[data-mini]").forEach((img) => {
    const mini = `url(${img.dataset.mini})`;
    img.parentElement.style.backgroundImage = mini;
    img.parentElement.style.backgroundSize = "cover";
    img.parentElement.style.backgroundPosition = "center";
    const subir = () => {
      img.parentElement.style.backgroundImage = "none";
      img.removeEventListener("load", subir);
    };
    if (img.complete && img.naturalWidth)
      img.parentElement.style.backgroundImage = "none";
    else img.addEventListener("load", subir, { once: true });
  });
}

function tituloAperta() {
  const t = $(".placa__titulo");
  if (!t || reduced) return;
  let pendente = false;
  const ao = () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => {
      const p = Math.min(
        1,
        window.scrollY / Math.max(1, window.innerHeight * 0.7),
      );
      t.style.letterSpacing = (-0.018 - p * 0.012).toFixed(4) + "em";
      pendente = false;
    });
  };
  window.addEventListener("scroll", ao, { passive: true });
  ao();
}

carregador();
revelacao();
navAtiva();
constelacoes();
ficha();
filtros();
lupa();
mira();
miniTabela();
formulario();
nitidez();
painelLuz();
tituloAperta();
