// menu mobile
const menu = document.getElementById('menu');
const toggle = document.getElementById('menuToggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// opcional: botões que “pulam” um cartão no carrossel
function attachCarouselJump(containerId, stepPx = 360){
  const el = document.getElementById(containerId);
  if (!el) return;
  el.dataset.step = stepPx;
  // exemplo: chame el.scrollBy({left: stepPx, behavior:'smooth'}) em botões
}
attachCarouselJump('ongCarousel', 340);
attachCarouselJump('eduCarousel', 460);

// ====== Mapa ONGs (Leaflet) ======
(function initONGMap(){
  const mapEl = document.getElementById('ongMap');
  if (!mapEl || !window.L) return; // não quebra caso o Leaflet não carregue

  // Pontos (com extras)
  const ongPoints = [
    {
      key: 'instituto-argonauta',
      name: 'Instituto Argonauta (Ubatuba)',
      lat: -23.433, lng: -45.083,
      url: 'https://www.institutoargonauta.org/',
      desc: 'Pesquisa, educação ambiental e conservação no litoral norte de SP.'
    },
    {
      key: 'sea-shepherd-brasil',
      name: 'Sea Shepherd Brasil (Santos/SP)',
      lat: -23.964, lng: -46.333,
      url: 'https://seashepherd.org.br/',
      desc: 'Ações de combate à pesca ilegal e defesa dos oceanos.'
    },
    {
      key: 'mirpuri-foundation',
      name: 'Mirpuri Foundation (parceria global)',
      lat: -23.5505, lng: -46.6333, // São Paulo (ref.)
      url: 'https://mirpurifoundation.org/',
      desc: 'Projetos internacionais de conservação marinha e educação.'
    },
    {
      key: 'vale-verde-associacao-de-defesa-do-meio-ambiente',
      name: 'Vale Verde — Associação de Defesa do Meio Ambiente',
      lat: -23.2237, lng: -45.9009, // São José dos Campos (aprox.)
      url: 'https://www.instagram.com/ongvaleverde/',
      desc: 'OSC ambientalista em São José dos Campos (cadastrada como Entidade Ambientalista).',
      extra: `
        <a href="https://www.instagram.com/ongvaleverde/" target="_blank" rel="noopener">Fale pelo Instagram (DM)</a><br>
        <a href="https://mapaosc.ipea.gov.br/detalhar/656069" target="_blank" rel="noopener">Conheça a OSC no Mapa OSC</a>
      `
    },
    {
      key: 'eco-villa-ecovila-sustentar',
      name: 'Eco Villa — Ecovila Sustentar',
      lat: -23.829, lng: -46.813, // Embu-Guaçu (aprox.)
      url: 'https://www.ecovilasustentar.eco.br/',
      desc: 'Ecovila na área de proteção de mananciais (Mata Atlântica) em Embu-Guaçu/SP.',
      extra: `
        <a href="https://www.ecovilasustentar.eco.br/" target="_blank" rel="noopener">Site oficial</a> ·
        <a href="https://www.ecovilasustentar.eco.br/contato" target="_blank" rel="noopener">Contato</a><br>
        <a href="mailto:ecovilasustentar@gmail.com">ecovilasustentar@gmail.com</a> ·
        <a href="https://www.instagram.com/ecovilasustentar/" target="_blank" rel="noopener">@ecovilasustentar</a>
      `
    }
  ];

  const map = L.map('ongMap', { scrollWheelZoom:false }).setView([-23.7, -46.0], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const markers = {};
  const group = L.featureGroup();

  // POPUP com suporte a "extra"
  ongPoints.forEach(p => {
    const html = `
      <b>${p.name}</b><br>
      ${p.desc}<br>
      ${p.extra ? p.extra : `<a href="${p.url}" target="_blank" rel="noopener">Site oficial</a>`}
    `;
    const m = L.marker([p.lat, p.lng]).addTo(map).bindPopup(html);
    markers[p.key] = m;
    group.addLayer(m);
  });

  // Ajusta o mapa para conter todos os marcadores
  if (ongPoints.length > 1) {
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  }

  // ====== Integração com os cards: "Ver no mapa" (robusta + fuzzy) ======
  (function integrateCardLinksWithMap(){
    // normaliza string -> slug estável (remove acentos, parênteses, etc.)
    const norm = s => String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // acentos
      .replace(/\([^)]*\)/g, '')                        // remove ( ... )
      .replace(/—|–/g, '-')                             // travessões -> hífen
      .replace(/[^a-z0-9]+/g, '-')                      // não alfanumérico -> -
      .replace(/(^-|-$)/g, '');

    // índice auxiliar: mapeia várias formas de nome -> key do marcador
    const keyIndex = {};
    const normNameIndex = {}; // guarda nome normalizado de cada key
    ongPoints.forEach(p => {
      const n = norm(p.name);
      keyIndex[p.key] = p.key;     // a própria key
      keyIndex[n] = p.key;         // nome normalizado
      normNameIndex[p.key] = n;
    });

    // fuzzy: escolhe a key cujo nome tem mais tokens do título
    function bestMatchByTokens(titleNorm){
      const tokens = titleNorm.split('-').filter(t => t && t.length >= 3 && !['associacao','de','da','do','dos','das','meio','e'].includes(t));
      let best = { key:null, score:0 };
      for (const p of ongPoints) {
        const nn = normNameIndex[p.key];
        let score = 0;
        tokens.forEach(t => { if (nn.includes(t)) score++; });
        if (score > best.score) best = { key: p.key, score };
      }
      return best.score > 0 ? best.key : null;
    }

    document.querySelectorAll('.card-ong').forEach(card => {
      const titleEl = card.querySelector('h3');
      if (!titleEl) return;

      const explicitKey = card.getAttribute('data-key')?.trim();
      const derivedNorm = norm(titleEl.textContent || '');

      // ordem de resolução
      let resolvedKey =
        (explicitKey && keyIndex[explicitKey]) ||    // data-key válido
        keyIndex[derivedNorm] ||                     // nome normalizado igual
        explicitKey ||                               // data-key mesmo que não mapeado
        derivedNorm;                                 // slug do título

      // se ainda não houver marker, tenta fuzzy por tokens
      if (!markers[resolvedKey]) {
        const fuzzy = bestMatchByTokens(derivedNorm);
        if (fuzzy) resolvedKey = fuzzy;
      }

      // cria (ou reaproveita) o link
      let link = card.querySelector('.card-links .ver-no-mapa');
      if (!link) {
        let links = card.querySelector('.card-links');
        if (!links) {
          links = document.createElement('div');
          links.className = 'card-links';
          card.appendChild(links);
        }
        link = document.createElement('a');
        link.className = 'ver-no-mapa';
        link.href = '#ongMap';
        link.textContent = 'Ver no mapa';
        links.appendChild(link);
      }

      link.dataset.key = resolvedKey;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        let k = link.dataset.key;

        // último fallback: rederiva e tenta fuzzy
        if (!markers[k]) {
          const alt = keyIndex[norm(titleEl.textContent || '')] || bestMatchByTokens(norm(titleEl.textContent || ''));
          if (alt) k = alt;
        }

        const m = markers[k];
        if (!m) {
          console.warn('Marcador não encontrado. key:', k, ' title:', titleEl.textContent);
          alert('Não encontrei esse ponto no mapa. Verifique a chave do card (data-key) e o ongPoints.');
          return;
        }
        map.setView(m.getLatLng(), 11, { animate: true });
        m.openPopup();
        document.getElementById('ongMap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, { once: false });
    });
  })();

})(); // fecha a IIFE do initONGMap

// ====== Ações Comunitárias: dados reais ======
const acoesData = [
  {
    id: "argonauta",
    nome: "Instituto Argonauta — Mutirões de Limpeza (Projeto Lixo Marinho)",
    tipo: "Mutirão de limpeza de praias + educação ambiental",
    img: "./imagens/logofoot23.png",
    imgAlt: "Logo do site oficial",
    desc: "A organização promove ações de limpeza e monitoramento de resíduos nas praias do Litoral Norte (Ubatuba, Caraguatatuba, Ilhabela).",
    agenda: { rotulo: "Página 'Participe' / Eventos", url: "https://institutoargonauta.org/" },
    site: "https://institutoargonauta.org/",
    contato: {
      email: "contato@institutoargonauta.org.br",
      fone: "(12) 3833-4863",
      instagram: "https://www.instagram.com/institutoargonauta/"
    },
    cidade: "Ubatuba, SP",
    coords: { lat: -23.433, lng: -45.083 },
    fontes: ["argonauta-site", "argonauta-contato"]
  },
  {
    id: "seashepherd",
    nome: "Sea Shepherd Brasil — Operação Ondas Limpas",
    tipo: "Mutirões de limpeza + ciência cidadã",
    img: "./imagens/seashepherd.png",
    imgAlt: "Logo do site oficial",
    desc: "Série de limpezas de praia e pesquisa sobre resíduos marinhos ao longo da costa. A agenda traz novas datas regularmente.",
    agenda: { rotulo: "Operação Ondas Limpas (agenda/notícias)", url: "https://seashepherd.org.br/category/operacao-ondas-limpas/" },
    site: "https://seashepherd.org.br/ondaslimpas/",
    contato: {
      email: "info@seashepherd.org.br",
      voluntariado: "voluntariado@seashepherd.org.br",
      instagram: "https://www.instagram.com/seashepherdbrasil/"
    },
    cidade: "Santos, SP (ex.: Praia do Gonzaga)",
    coords: { lat: -23.967, lng: -46.328 },
    fontes: ["ssb-ondas", "ssb-contato"]
  },
  {
    id: "biopesca",
    nome: "Instituto Biopesca — Ações e Educação Ambiental",
    tipo: "Mutirões locais + educação e monitoramento",
    img: "./imagens/biopesca.png",
    imgAlt: "Sacos de lixo recolhidos em limpeza de praia",
    desc: "Atua na Baixada Santista e apoia limpezas e educação ambiental. Rede de resgate e orientação sobre fauna marinha.",
    agenda: { rotulo: "Notícias/agenda local", url: "https://www2.praiagrande.sp.gov.br/noticia/pg-realiza-mutirao-de-limpeza-da-praia-no-dia-de-conscientizacao-sobre-mudancas-climaticas" },
    site: "http://biopesca.org.br/index.htm",
    contato: {
      email: "contato@biopesca.org.br",
      fone: "0800 642 3341 (comercial) | (13) 99601-2570",
      instagram: "https://www.instagram.com/institutobiopesca/"
    },
    cidade: "Praia Grande, SP (Canto do Forte)",
    coords: { lat: -24.000, lng: -46.401 },
    fontes: ["biopesca-site", "biopesca-fale", "biopesca-ig", "pg-noticia"]
  },
  {
    id: "gremar",
    nome: "Instituto Gremar — Limpeza de Rios e Praias (Setembro)",
    tipo: "Mutirões anuais + mobilização regional",
    img: "./imagens/institutogremar.jpg",
    imgAlt: "logo do site oficial",
    desc: "Organiza limpezas na Baixada Santista durante o mês de setembro e campanhas de sensibilização.",
    agenda: { rotulo: "Projeto 'Limpeza de Rios e Praias'", url: "https://gremar.org.br/projetos-realizados/limpezade-rios-e-praias/" },
    site: "https://gremar.org.br/",
    contato: {
      email: "contato@gremar.org.br",
      fone: "(13) 99711-4120",
      instagram: "https://www.instagram.com/institutogremar/"
    },
    cidade: "Itanhaém / Guarujá, SP",
    coords: { lat: -24.183, lng: -46.788 },
    fontes: ["gremar-proj", "gremar-contato"]
  },
  {
    id: "ecosurf",
    nome: "Instituto Ecosurf — Limpezas & Parcerias (Blue Keepers / Sprite)",
    tipo: "Mutirões, mobilização de surfistas e parcerias",
    img: "./imagens/ecosurf2.jpg",
    imgAlt: "Mutirão de limpeza em Santos (parceria Ecosurf)",
    desc: "Promove limpezas, educação e campanhas de combate ao lixo no mar, com parceiros como Blue Keepers. Eventos frequentes na região.",
    agenda: { rotulo: "Notícia & agenda local (exemplo)", url: "https://www.santos.sp.gov.br/?q=noticia%2Fmutirao-de-limpeza-de-praias-da-sprite-faz-sua-terceira-acao-em-santos" },
    site: "https://www.ecosurf.org.br/",
    contato: {
      email: "ecosurf@ecosurf.org.br",
      fone: "+55 (13) 99708-0989",
      instagram: "https://www.instagram.com/ecosurfoficial/"
    },
    cidade: "Santos, SP (Ponta da Praia)",
    coords: { lat: -23.995, lng: -46.301 },
    fontes: ["ecosurf-site", "santos-noticia", "ecosurf-ig"]
  }
];

// ====== Render dos cards ======
(function renderAcoesCarousel(){
  const wrap = document.getElementById('acoesCarousel');
  if (!wrap) return;
  const frag = document.createDocumentFragment();

  acoesData.forEach(item => {
    const card = document.createElement('article');
    card.className = 'action-card';

    const media = document.createElement('div');
    media.className = 'action-media';
    const img = document.createElement('img');
    img.src = item.img; img.alt = item.imgAlt || item.nome;
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'action-body';
    body.innerHTML = `
      <h3>${item.nome}</h3>
      <div class="action-meta"><strong>Tipo:</strong> ${item.tipo} · <strong>Local:</strong> ${item.cidade}</div>
      <p>${item.desc}</p>
      <div class="action-links">
        <a href="${item.site}" target="_blank" rel="noopener">Site oficial</a>
        <a href="${item.agenda.url}" target="_blank" rel="noopener">${item.agenda.rotulo}</a>
        <a href="#acoesMap" data-jump="${item.id}">Ver no mapa</a>
      </div>
      <div class="contact-list">
        ${item.contato.email ? `<div><strong>E-mail:</strong> <a href="mailto:${item.contato.email}">${item.contato.email}</a></div>` : ``}
        ${item.contato.voluntariado ? `<div><strong>Voluntariado:</strong> <a href="mailto:${item.contato.voluntariado}">${item.contato.voluntariado}</a></div>` : ``}
        ${item.contato.fone ? `<div><strong>Telefone:</strong> ${item.contato.fone}</div>` : ``}
        ${item.contato.instagram ? `<div><strong>Instagram:</strong> <a href="${item.contato.instagram}" target="_blank" rel="noopener">@${new URL(item.contato.instagram).pathname.replace(/\//g,'')}</a></div>` : ``}
      </div>
    `;

    card.appendChild(media);
    card.appendChild(body);
    frag.appendChild(card);
  });

  wrap.appendChild(frag);

  // integra “Ver no mapa”
  wrap.querySelectorAll('[data-jump]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('data-jump');
      focusMarker(id);
      document.getElementById('acoesMap')?.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
})();

// ====== Mapa (Leaflet) ======
let acoesMap, acoesMarkers = {};
function initAcoesMap(){
  const el = document.getElementById('acoesMap');
  if (!el || !window.L) return;
  acoesMap = L.map('acoesMap', { scrollWheelZoom:false }).setView([-23.9,-46.3], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(acoesMap);

  const group = L.featureGroup();
  acoesData.forEach(item=>{
    const m = L.marker([item.coords.lat, item.coords.lng]).addTo(acoesMap)
      .bindPopup(`<b>${item.nome}</b><br>${item.cidade}<br><a href="${item.site}" target="_blank" rel="noopener">Site oficial</a>`);
    acoesMarkers[item.id] = m;
    group.addLayer(m);
  });
  acoesMap.fitBounds(group.getBounds(), { padding:[24,24] });
}
function focusMarker(id){
  const m = acoesMarkers[id]; if(!m || !acoesMap) return;
  acoesMap.setView(m.getLatLng(), 12, { animate:true });
  m.openPopup();
}
initAcoesMap();

// Preview de imagem para os botões de ecossistemas
(function(){
  const preview = document.getElementById('ecoPreview');
  const img = document.getElementById('ecoImg');
  const cap = document.getElementById('ecoCaption');

  document.querySelectorAll('.eco-btn').forEach(btn=>{
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', ()=>{
      const src = btn.dataset.img;
      const caption = btn.dataset.caption || btn.textContent.trim();
      if (!src) return;

      img.src = src;
      img.alt = caption;
      cap.textContent = caption;
      preview.style.display = 'block';
      preview.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
  });
})();

