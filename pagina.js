/* ══════════════════════════════════════════════════════════════════════════
   O motor da página: o checklist, a calculadora embutida, o antes/depois,
   o relógio e o termômetro.
   ══════════════════════════════════════════════════════════════════════════ */
const g = id => document.getElementById(id);

const CHECK = `<svg viewBox="0 0 24 24"><path d="M4.5 12.6l5 5L19.5 7"/></svg>`;
const XIS   = `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

/* ─────────────── 1 · AULÃO ───────────────
   O play liga o vídeo COM SOM — é uma aula, não enfeite de fundo. */
(function aulao(){
  const q = g('quadroAulao'), v = g('videoAulao');
  if(!q) return;
  /* ⚠️ A AULA É HLS, e os dois mundos se dividem assim:
     · iPhone/Safari — toca .m3u8 NATIVO e não suporta hls.js (sem MSE). Basta
       pôr o endereço no `src`.
     · Chrome/Firefox/Android — não tocam .m3u8 sozinhos; precisam do hls.js,
       que mora aqui do lado (nada de CDN).
     Em ambos o arquivo só é buscado no play: `preload="none"` é de propósito,
     pra ninguém gastar dado de celular sem ter pedido a aula. */
  const FONTE = v.dataset.hls;
  let armado = false;
  function armar(){
    if(armado) return Promise.resolve(); armado = true;
    if(v.canPlayType('application/vnd.apple.mpegurl')){ v.src = FONTE; return Promise.resolve(); }
    return new Promise(ok => {
      const s = document.createElement('script');
      s.src = 'video/hls.min.js'; s.onload = () => {
        if(window.Hls && Hls.isSupported()){
          const h = new Hls({maxBufferLength:30}); h.loadSource(FONTE); h.attachMedia(v);
        } else { v.src = FONTE; }   /* último recurso: deixa o navegador tentar */
        ok();
      };
      s.onerror = () => { v.src = FONTE; ok(); };
      document.head.appendChild(s);
    });
  }

  /* a duração só se sabe depois que o manifesto chega */
  v.addEventListener('loadedmetadata', () => {
    if(!isFinite(v.duration) || v.duration < 60) return;
    const h = Math.floor(v.duration/3600), m = Math.round(v.duration%3600/60);
    const d = g('duracaoAulao');
    d.textContent = h ? `${h}h${String(m).padStart(2,'0')} de aula` : `${m} min de aula`;
    d.hidden = false;
  });

  const tocar = () => { q.classList.add('tocando'); v.controls = true;
    armar().then(() => v.play().catch(()=>{}));
    marcar('AulaoPlay'); };
  g('playAulao').addEventListener('click', tocar);
  v.addEventListener('pause', () => { if(v.currentTime === 0) q.classList.remove('tocando'); });

  /* ⚠️ 02/11 — TELA CHEIA. Três caminhos, porque os três existem de verdade:
     · iPhone: o Safari NÃO abre tela cheia num <div>. Só o próprio <video>
       responde, e só pelo `webkitEnterFullscreen` — com o vídeo já tocando.
     · Android/Chrome: aceita o contêiner, e aí os controles vão junto.
     · Computador: `requestFullscreen` no contêiner. */
  g('ampliarAulao').addEventListener('click', ev => {
    ev.stopPropagation();
    marcar('AulaoTelaCheia');
    if(!q.classList.contains('tocando')) tocar();
    if(typeof v.webkitEnterFullscreen === 'function' && !document.fullscreenEnabled){
      const abre = () => v.webkitEnterFullscreen();
      /* ⚠️ no iPhone o vídeo tem que ter METADADOS antes — chamar isto com o
         <video> ainda vazio não faz nada e parece que o botão quebrou. */
      v.readyState >= 1 ? abre() : v.addEventListener('loadedmetadata', abre, {once:true});
      return;
    }
    const pede = q.requestFullscreen || q.webkitRequestFullscreen;
    if(pede) Promise.resolve(pede.call(q)).catch(() => {
      if(typeof v.webkitEnterFullscreen === 'function') v.webkitEnterFullscreen();
    });
    else if(typeof v.webkitEnterFullscreen === 'function') v.webkitEnterFullscreen();
  });
})();

/* ─────────────── 2 · CHECKLIST ─────────────── */
/* ⚠️ OS MESMOS PARÂMETROS DO `torneiras/problema.html`, sem exceção: braço em
   `max(…, min(H*0.108, 100))`, eixo em 41,5% da altura, chão em 96,5%, lucro
   líquido no fim e os nomes dos gargalos acima dos furos. É o que o motor já faz
   por padrão — o que estragava era `inteira:true` numa faixa baixa. */
/* ⚠️ No celular a MESMA grade do computador deixa o cano comprido e fininho —
   atravessa a tela inteira e some. Lá a grade é menos esticada: o desenho fica
   maior e lê-se melhor. */
/* ⚠️ MEDIDO: no celular o palco sobra ~190px de altura. Com a grade alta do
   computador o desenho encolhia pra caber e ficava um fiapo no meio da faixa.
   Grade mais achatada = o cano PREENCHE a largura e fica imponente, mantendo o
   braço em ~5,6% da largura (o padrão é 5,1%). */
const grade = () => innerWidth < 760 ? {W:1040, H:440} : {W:1440, H:682};

const cano = new Torneira(g('cano'), {
  fixo: grade(),                        // a grade MEDIDA no problema.html
  traco:.74,                            // linha mais fina: desenho mais limpo
  boneco:true, chao:true, chamadas:true, comecaLisa:true,
  bracoFrac:.108, bracoMin:58, bracoMax:100, bracoLarg:.125,
  pyFrac:.415, chaoFrac:.965, fonteCham:2.2, /* o lucro líquido no celular precisa ser legível: a grade é achatada e o vão
     entre a bica e o chão encolhe, então ele ocupa mais desse vão */
  bonecoEsc: innerWidth < 760 ? .88 : .52, leva:26, maxPilha:16,
  /* ⚠️ O DINHEIRO SÓ COMEÇA A ANDAR DEPOIS DA 1ª RESPOSTA. Antes disso a moeda
     correndo rouba a atenção da pergunta. */
  auto:false
});
cano.o.nomes = PERGUNTAS.map(p => p.furo);
addEventListener('resize', () => {
  const nova = grade();
  if(nova.W !== cano.o.fixo.W){
    cano.o.fixo = nova;
    cano.o.bonecoEsc = innerWidth < 760 ? .88 : .52;
    cano.desenhar();
  }
});

/* a mesma torneira, no tamanho do card — é dela que sai a peça do print */
/* no card os rótulos saem: a lista das 5 linhas logo acima já nomeia cada furo,
   e o rótulo «Aquisição» batia no volante. */
const canoCartao = new Torneira(g('canoCartao'), {
  boneco:false, chao:true, chamadas:false, comecaLisa:true, inteira:true, traco:.78,
  bonecoT:.42, margem:8, bracoLarg:.125, bracoMax:112, leva:0, maxPilha:10, auto:false
});
// ⚠️ sem isto o card sai com os nomes PADRÃO do motor (Preço · Agenda · Cliente…)
canoCartao.o.nomes = PERGUNTAS.map(p => p.furo);

let i = 0;
const resp = window.__resp = [null,null,null,null,null];

function cartao(classe, rotulo, diz, img){
  return `<button class="op ${classe}" data-v="${classe}">
    ${img ? `<span class="art"><img src="img/${img}.png" alt=""></span>` : ''}
    <span class="rotulo"><span class="mk">${classe==='sim'?CHECK:XIS}</span>${rotulo}</span>
    ${diz ? `<span class="diz">${diz}</span>` : ''}
  </button>`;
}

/* ⚠️ A TORNEIRA É O RESULTADO DELA. A frase embaixo tem que dizer isso com o
   NOME do gargalo que ela acabou de marcar — senão o desenho parece enfeite. */
function narrar(){
  const abertos = resp.map((v,k)=>v==='nao'?PERGUNTAS[k].furo:null).filter(Boolean);
  const d = g('dica');
  if(!abertos.length){
    const ok = resp.filter(v=>v==='sim').length;
    /* antes da 1ª resposta não há o que narrar — e texto à toa é ruído */
    d.textContent = ok ? `${ok} de 5 respondidas · cano inteiro até aqui` : '';
    d.style.color = 'var(--verde)';
  }else{
    d.textContent = abertos.length === 1
      ? `você marcou ✕ em ${abertos[0]} — este furo é o seu`
      : `${abertos.length} furos abertos: ${abertos.join(' · ')}`;
    d.style.color = 'var(--laranja)';
  }
}

function render(){
  const p = PERGUNTAS[i];
  /* ⚠️ era «01 · AQUISIÇÃO», colado na pergunta. Virou só a contagem: o nome do
     gargalo já aparece no cano, acima do furo. */
  g('cat').textContent  = `${i+1}/5`;
  g('texto').textContent = p.texto;
  narrar();
  cano.destacar(i);                       // o halo mostra QUAL furo está em jogo

  if(p.dois){
    // ⚠️ A ÚNICA PERGUNTA COM DUAS IMAGENS. O desenho É a resposta aqui: a
    // torneira jorrando contra a torneira furada. A arte de cima some pra não
    // concorrer com elas.
    g('arte').innerHTML = '';
    g('arte').style.display = 'none';
    g('miolo').classList.add('sozinho');
    g('ops').className = 'ops duplo';
    g('ops').innerHTML =
      cartao('sim','SIM', p.dois.sim.diz, p.dois.sim.img) +
      cartao('nao','NÃO', p.dois.nao.diz, p.dois.nao.img);
  }else{
    g('arte').style.display = '';
    g('arte').innerHTML = `<img src="img/${p.ilu}.png" alt="">`;
    g('miolo').classList.remove('sozinho');
    g('ops').className = 'ops';
    g('ops').innerHTML = cartao('sim','SIM', p.sim) + cartao('nao','NÃO', p.nao);
  }
  pintaPass();
}

function pintaPass(){
  g('pass').innerHTML = resp.map((v,k)=>
    `<i class="${v==='sim'?'ok':v==='nao'?'furou':(k===i?'agora':'')}"></i>`).join('');

  /* o contador: número grande, barra que enche e o que falta pra chegar no fim */
  const feitas = resp.filter(v=>v!==null).length;
  g('numAtual').textContent = Math.min(i+1, 5);
  const faltam = 5 - feitas;
  g('falta').textContent = faltam === 0 ? 'pronto — veja o seu cano'
    : faltam === 1 ? 'falta 1 pra ver o seu cano'
    : `faltam ${faltam} pra ver o seu cano`;
}

g('ops').addEventListener('click', e => {
  const b = e.target.closest('.op'); if(!b) return;
  const v = b.dataset.v;
  if(resp[i] !== null) return;                       // uma resposta por pergunta
  resp[i] = v;
  g('ops').querySelectorAll('.op').forEach(x => x.classList.toggle('on', x === b));
  // ✕ abre o gargalo na frente dela; ✓ deixa o cano inteiro. É a percepção.
  if(v === 'nao'){ cano.abrirFuro(i, true);  canoCartao.abrirFuro(i, false); }
  else           { cano.alisar(i);           canoCartao.alisar(i); }
  cano.o.auto = true;                 // a água começa a correr aqui, não antes
  pintaPass(); narrar();
  setTimeout(() => { i < 4 ? (i++, render()) : fechar(); }, 760);
});

/* ⚠️ A TELA DO MEIO SAIU. Antes havia um «Dois furos abertos · ver o meu cano»
   entre a 5ª resposta e o card — um clique a mais pra dizer o que o card já diz.
   Agora a 5ª resposta leva DIRETO ao resultado. */
function fechar(){
  const furos = resp.filter(v => v === 'nao').length;
  cano.destacar(null);
  narrar();
  g('falta').textContent = 'pronto — este é o seu cano';
  g('falta').classList.add('pronta');
  marcar('ChecklistCompleto', {furos});
  g('sec-card').hidden = false;
  canoCartao.desenhar();          // garante a peça medida antes do clone
  montaCartao(furos);
  setTimeout(() => g('sec-card').scrollIntoView({behavior:'smooth', block:'start'}), 420);
}

/* ─────────────── 2 · CALCULADORA ─────────────── */
const TELAS = [
  ['calc/capa-k1.html',   'Capa'],
  ['calc/t0.html',        '01 · Procedimento'],
  ['calc/t1.html',        '02 · Preço'],
  ['calc/t2.html',        '03 · Tempo'],
  ['calc/t3.html',        '04 · Produto'],
  ['calc/t8.html',        '05 · Profissionais'],
  ['calc/t4.html',        '06 · Comissão'],
  ['calc/t5.html',        '07 · Contas'],
  ['calc/t6.html',        '08 · Atendimentos'],
  ['calc/t7.html',        '09 · Taxas'],
  ['calc/carregando.html','Calculando'],
  ['calc/sub-a.html',     'Resultado']
];
let c = 0;
function vaiCalc(k){
  c = Math.max(0, Math.min(TELAS.length-1, k));
  g('calc').src = TELAS[c][0];
}
/* ⚠️ a barra «‹ 01 · Procedimento ›» saiu: a calculadora anda pelos botões DELA,
   dentro do aparelho. Dois jogos de navegação na mesma tela confundem. */
/* as telas da calculadora avisam o pai quando o botão de dentro é tocado */
addEventListener('message', e => {
  if(e.data && e.data.calc === 'prox') vaiCalc(c+1);
  if(e.data && e.data.calc === 'ant')  vaiCalc(c-1);
});
/* ⚠️ a escala é MEDIDA, não chutada: a lente diz quanto cabe e o iframe de
   390px é reduzido na proporção exata. Sem isso a calculadora nasce espremida. */
function ajustaLente(){
  const l = g('lente'); if(!l) return;
  const esc = l.clientWidth / 390;
  l.style.setProperty('--esc', esc.toFixed(5));
  g('calc').style.setProperty('--esc', esc.toFixed(5));
}
ajustaLente();
new ResizeObserver(ajustaLente).observe(g('lente'));

vaiCalc(0);

/* ─────────────── 3 · ANTES → DEPOIS ─────────────── */
/* ⚠️ A LINHA ESTAVA GROSSA E OS GARGALOS SUMIAM. Era o mesmo erro do checklist:
   caixa pequena → braço pequeno → o piso de 8px do traço vira linha gorda, e sem
   `chamadas` não dá pra saber QUAL gargalo é cada furo. Agora os dois quadros
   usam a GRADE FIXA do padrão e nomeiam cada furo. */
const COMUM = { chamadas:true, boneco:true, chao:true, traco:.7,
                fixo:{W:1060, H:660},
                leva:26, maxPilha:14, bracoFrac:.108, bracoMin:58, bracoMax:100,
                bracoLarg:.125, pyFrac:.46, chaoFrac:.965, afastoT:1.2, fonteCham:2.2 };

const antes  = new Torneira(g('canoAntes'),  Object.assign({}, COMUM, {bonecoEsc:.58}));
const depois = new Torneira(g('canoDepois'), Object.assign({}, COMUM, {bonecoEsc:.80}));
antes.o.nomes = depois.o.nomes = PERGUNTAS.map(p => p.furo);
/* o ANTES tem os 5 gargalos escancarados; o DEPOIS tem os 5 tampados */
for(let k=0;k<5;k++){ antes.abrirFuro(k,false); depois.taparFuro(k,false); }

/* ⚠️ Estes dois números contam MOEDA DO DESENHO, não dinheiro. A própria tela
   diz isso — ver [[o-total-do-painel-nao-e-lucro]]. */
function placar(){
  const a = antes.placar(), d = depois.placar();
  const totalA = a.perdido + a.cofre;
  g('perdeu').textContent = totalA > 6 ? Math.round(a.perdido/totalA*100) + '%' : '…';
  const totalD = d.perdido + d.cofre;
  g('chegou').textContent = totalD > 6 ? Math.round(d.cofre/totalD*100) + '%' : '…';
}
setInterval(placar, 900);

/* ─────────────── 4 · PREÇO E TERMÔMETRO ─────────────── */
const reais = v => v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

(function preco(){
  const {de, por, parcelas:n, JUROS_AM:i} = PRECO;
  /* Tabela Price — a mesma conta do cartão. Com juros zero vira divisão simples. */
  const p = i > 0 ? por * i / (1 - Math.pow(1+i, -n)) : por/n;
  const total = p * n;

  g('porValor').textContent = por.toLocaleString('pt-BR');
  document.querySelector('.de s').textContent = 'R$ ' + de.toLocaleString('pt-BR');
  g('parcelaTxt').textContent = `${n}x de R$ ${reais(p)}`;
  // ⚠️ A CONTA FECHA NA TELA: parcela × n = total, e de onde vem o juro.
  g('fonteTxt').innerHTML =
    `${n} × R$ ${reais(p)} = <b>R$ ${reais(total)}</b> no parcelado · ` +
    `juros do cartão de ${(i*100).toLocaleString('pt-BR',{minimumFractionDigits:2})}% a.m., ` +
    `a taxa que a Kiwify cobra do comprador. À vista: R$ ${por.toLocaleString('pt-BR')}.`;
  // o «as 20 primeiras» já está na etiqueta vermelha logo acima — aqui só o corte
  document.querySelector('.selo-off').textContent =
    '−' + Math.round((1 - por/de)*100) + '%';
})();

/* ⛔ 02/11 — O TERMÔMETRO DE VAGAS SAIU DA TELA, por ordem dela.
   Não havia fonte pra ele: `VAGAS.restam` era um número digitado à mão, e barra
   de vaga enchendo sem fonte é afirmação de venda que não aconteceu. Se um dia
   voltar, a contagem tem que vir das vendas pagas da Kiwify — não daqui. */

/* o link do checkout. Enquanto for '#', o botão avisa em vez de enganar. */
(function liga(){
  const a = g('cta');
  if(LINK_MENTORIA && LINK_MENTORIA !== '#'){
    a.href = LINK_MENTORIA;
    a.addEventListener('click', () => {
      marcar('CliqueMentoria');
      try{ if(window.fbq) fbq('track','InitiateCheckout',
        {value: PRECO.por, currency:'BRL'}); }catch(e){}
    });
  }else{
    a.classList.add('morto');
    a.addEventListener('click', e => {
      e.preventDefault();
      g('peCta').textContent = '⚠️ O link do checkout ainda não foi colado em conteudo.js (LINK_MENTORIA).';
      g('peCta').style.color = '#FF9A54';
    });
  }
})();

g('baixarCard').addEventListener('click', () => { marcar('BaixouCard'); baixarCartao(); });

/* ─────────────── A DOCA ───────────────
   Cada seção pertence a um cômodo; a doca do rodapé acende o cômodo onde ela
   está e marca de verde os que já passaram. */
const PARTE_DA_SECAO = {
  'sec-aulao':1,
  'sec-checklist':2, 'sec-card':2,
  'sec-calc':3,
  'sec-antes':4, 'sec-mentoria':4
};
const elosTrilha = [...document.querySelectorAll('.doca a')];
let parteAtual = 0;
function acende(p){
  if(p === parteAtual) return;        // ⚠️ só mexe quando MUDA de verdade
  parteAtual = p;
  elosTrilha.forEach(a => {
    const n = +a.dataset.p;
    a.classList.toggle('on', n === p);
    a.classList.toggle('feito', n < p);
  });
}
acende(1);

/* ⚠️ A DOCA PISCAVA AO ROLAR. O observador acendia a cada cruzamento de limiar
   — 9 trocas de classe numa rolagem só, com transição de cor em cada uma. Agora
   ele decide UMA vez por quadro de animação, pela seção que ocupa o meio da
   tela, e só escreve quando a parte realmente muda. */
let pendente = false;
function decidir(){
  pendente = false;
  const meio = innerHeight / 2;
  let melhor = null, menor = Infinity;
  for(const id in PARTE_DA_SECAO){
    const s = g(id); if(!s || s.hidden) continue;
    const r = s.getBoundingClientRect();
    if(r.bottom < 0 || r.top > innerHeight) continue;
    const d = Math.abs((r.top + r.bottom)/2 - meio);
    if(d < menor){ menor = d; melhor = id; }
  }
  if(melhor) acende(PARTE_DA_SECAO[melhor]);
}
addEventListener('scroll', () => {
  if(pendente) return;
  pendente = true;
  requestAnimationFrame(decidir);
}, {passive:true});
addEventListener('resize', decidir, {passive:true});
decidir();

/* o rolar suave vive só no clique da doca — no CSS ele brigava com o dedo */
elosTrilha.forEach(a => a.addEventListener('click', e => {
  const alvo = document.querySelector(a.getAttribute('href'));
  if(!alvo) return;
  e.preventDefault();
  alvo.scrollIntoView({behavior:'smooth', block:'start'});
}));

/* ⚠️ animação fora da tela é CPU jogada fora — e num celular ela sai do quadro
   da rolagem. A seção da mentoria só anima quando está à vista. */
(function pausarForaDaTela(){
  const alvos = [g('sec-mentoria')].filter(Boolean);
  if(!window.IntersectionObserver){ return; }
  const io = new IntersectionObserver(es => es.forEach(e =>
    e.target.classList.toggle('parado', !e.isIntersecting)), {rootMargin:'80px'});
  alvos.forEach(a => { a.classList.add('parado'); io.observe(a); });
})();

/* rolagem dos botões internos */
document.querySelectorAll('[data-ir]').forEach(b =>
  b.addEventListener('click', () => document.querySelector(b.dataset.ir)
    .scrollIntoView({behavior:'smooth', block:'start'})));

render();
