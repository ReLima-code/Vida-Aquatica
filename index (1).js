// ===== Menu mobile =====
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menuToggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// ===== Mapa das ONGs (Leaflet) =====
// Cada ONG tem uma "key" que também aparece no atributo data-key do card,
// no HTML. É assim que ligamos o botão "Ver no mapa" ao marcador certo.
const ongPoints = {
  acaju: {
    name: 'ACAJU — Associação Caiçara Juqueriquerê (Caraguatatuba)',
    lat: -23.6203,
    lng: -45.4297,
    desc: 'Preservação do rio Juqueriquerê e do manguezal, com mutirões de limpeza e educação ambiental desde 2000.',
    site: 'https://www.instagram.com/acajucaraguatatuba'
  },
  argonauta: {
    name: 'Instituto Argonauta (Ubatuba)',
    lat: -23.433,
    lng: -45.083,
    desc: 'Pesquisa, educação ambiental e conservação no litoral norte de SP.',
    site: 'https://www.institutoargonauta.org/'
  },
  seashepherd: {
    name: 'Sea Shepherd Brasil (Santos/SP)',
    lat: -23.964,
    lng: -46.333,
    desc: 'Ações de combate à pesca ilegal e defesa dos oceanos.',
    site: 'https://seashepherd.org.br/'
  },
  mirpuri: {
    name: 'Mirpuri Foundation (parceria global)',
    lat: -23.5505,
    lng: -46.6333,
    desc: 'Projetos internacionais de conservação marinha e educação.',
    site: 'https://mirpurifoundation.org/'
  },
  valeverde: {
    name: 'Vale Verde — Associação de Defesa do Meio Ambiente',
    lat: -23.2237,
    lng: -45.9009,
    desc: 'OSC ambientalista em São José dos Campos.',
    site: 'https://www.instagram.com/ongvaleverde/'
  },
  ecovilla: {
    name: 'Eco Villa — Ecovila Sustentar',
    lat: -23.829,
    lng: -46.813,
    desc: 'Ecovila na área de proteção de mananciais (Mata Atlântica) em Embu-Guaçu/SP.',
    site: 'https://www.ecovilasustentar.eco.br/'
  }
};

let ongMap;
const ongMarkers = {};

function iniciarMapaOngs() {
  const mapaEl = document.getElementById('ongMap');
  if (!mapaEl || !window.L) return;

  ongMap = L.map('ongMap', { scrollWheelZoom: false }).setView([-23.7, -46.0], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(ongMap);

  const grupo = L.featureGroup();

  for (const key in ongPoints) {
    const ong = ongPoints[key];
    const marcador = L.marker([ong.lat, ong.lng]).addTo(ongMap).bindPopup(`
      <b>${ong.name}</b><br>
      ${ong.desc}<br>
      <a href="${ong.site}" target="_blank" rel="noopener">Site oficial</a>
    `);
    ongMarkers[key] = marcador;
    grupo.addLayer(marcador);
  }

  ongMap.fitBounds(grupo.getBounds(), { padding: [20, 20] });
}

function adicionarBotaoVerNoMapa() {
  document.querySelectorAll('.card-ong').forEach((card) => {
    const key = card.dataset.key;
    if (!key || !ongMarkers[key]) return;

    const links = card.querySelector('.card-links');
    const botao = document.createElement('a');
    botao.href = '#ongMap';
    botao.textContent = 'Ver no mapa';
    links.appendChild(botao);

    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      const marcador = ongMarkers[key];
      ongMap.setView(marcador.getLatLng(), 11, { animate: true });
      marcador.openPopup();
      document.getElementById('ongMap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

iniciarMapaOngs();
adicionarBotaoVerNoMapa();

// ===== Ações Comunitárias =====
const acoesData = [
  {
    id: 'argonauta',
    nome: 'Instituto Argonauta — Mutirões de Limpeza (Projeto Lixo Marinho)',
    tipo: 'Mutirão de limpeza de praias + educação ambiental',
    img: './imagens/logofoot23.png',
    desc: 'A organização promove ações de limpeza e monitoramento de resíduos nas praias do Litoral Norte (Ubatuba, Caraguatatuba, Ilhabela).',
    site: 'https://institutoargonauta.org/',
    agenda: { rotulo: "Página 'Participe' / Eventos", url: 'https://institutoargonauta.org/' },
    email: 'contato@institutoargonauta.org.br',
    telefone: '(12) 3833-4863',
    instagram: 'https://www.instagram.com/institutoargonauta/',
    cidade: 'Ubatuba, SP',
    lat: -23.433,
    lng: -45.083
  },
  {
    id: 'seashepherd',
    nome: 'Sea Shepherd Brasil — Operação Ondas Limpas',
    tipo: 'Mutirões de limpeza + ciência cidadã',
    img: './imagens/seashepherd.png',
    desc: 'Série de limpezas de praia e pesquisa sobre resíduos marinhos ao longo da costa.',
    site: 'https://seashepherd.org.br/ondaslimpas/',
    agenda: { rotulo: 'Operação Ondas Limpas (agenda/notícias)', url: 'https://seashepherd.org.br/category/operacao-ondas-limpas/' },
    email: 'info@seashepherd.org.br',
    instagram: 'https://www.instagram.com/seashepherdbrasil/',
    cidade: 'Santos, SP (ex.: Praia do Gonzaga)',
    lat: -23.967,
    lng: -46.328
  },
  {
    id: 'biopesca',
    nome: 'Instituto Biopesca — Ações e Educação Ambiental',
    tipo: 'Mutirões locais + educação e monitoramento',
    img: './imagens/biopesca.png',
    desc: 'Atua na Baixada Santista e apoia limpezas e educação ambiental.',
    site: 'http://biopesca.org.br/index.htm',
    agenda: { rotulo: 'Notícias/agenda local', url: 'https://www2.praiagrande.sp.gov.br/' },
    email: 'contato@biopesca.org.br',
    telefone: '0800 642 3341',
    instagram: 'https://www.instagram.com/institutobiopesca/',
    cidade: 'Praia Grande, SP (Canto do Forte)',
    lat: -24.0,
    lng: -46.401
  },
  {
    id: 'gremar',
    nome: 'Instituto Gremar — Limpeza de Rios e Praias',
    tipo: 'Mutirões anuais + mobilização regional',
    img: './imagens/institutogremar.jpg',
    desc: 'Organiza limpezas na Baixada Santista durante o mês de setembro e campanhas de sensibilização.',
    site: 'https://gremar.org.br/',
    agenda: { rotulo: "Projeto 'Limpeza de Rios e Praias'", url: 'https://gremar.org.br/projetos-realizados/limpezade-rios-e-praias/' },
    email: 'contato@gremar.org.br',
    telefone: '(13) 99711-4120',
    instagram: 'https://www.instagram.com/institutogremar/',
    cidade: 'Itanhaém / Guarujá, SP',
    lat: -24.183,
    lng: -46.788
  },
  {
    id: 'ecosurf',
    nome: 'Instituto Ecosurf — Limpezas & Parcerias',
    tipo: 'Mutirões, mobilização de surfistas e parcerias',
    img: './imagens/ecosurf2.jpg',
    desc: 'Promove limpezas, educação e campanhas de combate ao lixo no mar.',
    site: 'https://www.ecosurf.org.br/',
    agenda: { rotulo: 'Notícia & agenda local', url: 'https://www.santos.sp.gov.br/' },
    email: 'ecosurf@ecosurf.org.br',
    telefone: '+55 (13) 99708-0989',
    instagram: 'https://www.instagram.com/ecosurfoficial/',
    cidade: 'Santos, SP (Ponta da Praia)',
    lat: -23.995,
    lng: -46.301
  }
];

function criarCardAcao(acao) {
  const card = document.createElement('article');
  card.className = 'action-card';

  card.innerHTML = `
    <div class="action-media">
      <img src="${acao.img}" alt="${acao.nome}">
    </div>
    <div class="action-body">
      <h3>${acao.nome}</h3>
      <div class="action-meta"><strong>Tipo:</strong> ${acao.tipo} · <strong>Local:</strong> ${acao.cidade}</div>
      <p>${acao.desc}</p>
      <div class="action-links">
        <a href="${acao.site}" target="_blank" rel="noopener">Site oficial</a>
        <a href="${acao.agenda.url}" target="_blank" rel="noopener">${acao.agenda.rotulo}</a>
        <a href="#acoesMap" data-jump="${acao.id}">Ver no mapa</a>
      </div>
      <div class="contact-list">
        ${acao.email ? `<div><strong>E-mail:</strong> <a href="mailto:${acao.email}">${acao.email}</a></div>` : ''}
        ${acao.telefone ? `<div><strong>Telefone:</strong> ${acao.telefone}</div>` : ''}
        ${acao.instagram ? `<div><strong>Instagram:</strong> <a href="${acao.instagram}" target="_blank" rel="noopener">Ver perfil</a></div>` : ''}
      </div>
    </div>
  `;

  return card;
}

function renderizarAcoes() {
  const carrossel = document.getElementById('acoesCarousel');
  if (!carrossel) return;

  acoesData.forEach((acao) => {
    carrossel.appendChild(criarCardAcao(acao));
  });

  carrossel.querySelectorAll('[data-jump]').forEach((link) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      focarMarcadorAcao(link.dataset.jump);
      document.getElementById('acoesMap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

let acoesMap;
const acoesMarkers = {};

function iniciarMapaAcoes() {
  const mapaEl = document.getElementById('acoesMap');
  if (!mapaEl || !window.L) return;

  acoesMap = L.map('acoesMap', { scrollWheelZoom: false }).setView([-23.9, -46.3], 9);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(acoesMap);

  const grupo = L.featureGroup();

  acoesData.forEach((acao) => {
    const marcador = L.marker([acao.lat, acao.lng]).addTo(acoesMap).bindPopup(`
      <b>${acao.nome}</b><br>${acao.cidade}<br>
      <a href="${acao.site}" target="_blank" rel="noopener">Site oficial</a>
    `);
    acoesMarkers[acao.id] = marcador;
    grupo.addLayer(marcador);
  });

  acoesMap.fitBounds(grupo.getBounds(), { padding: [24, 24] });
}

function focarMarcadorAcao(id) {
  const marcador = acoesMarkers[id];
  if (!marcador) return;
  acoesMap.setView(marcador.getLatLng(), 12, { animate: true });
  marcador.openPopup();
}

renderizarAcoes();
iniciarMapaAcoes();
