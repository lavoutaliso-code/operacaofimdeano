/* ══════════════════════════════════════════════════════════════════════════
   O CARD DO RESULTADO — 1080×1350, pronto pra print e pra story.

   ⚠️ Tudo é SVG NATIVO, nada de foreignObject: é o que permite rasterizar em
   canvas e baixar PNG sem biblioteca nenhuma. O traço vai inline pelo mesmo
   motivo da peça (ver motor-torneira.js): fora desta página não existe o CSS.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
const NS='http://www.w3.org/2000/svg';
const LARANJA='#FA6503', VERDE='#1F9D55', TINTA='#0B0A08', T2='#6E737A', LINHA='#E7E9ED';
const SF = "-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif";

const el=(t,a,pai)=>{const e=document.createElementNS(NS,t);
  for(const k in a) e.setAttribute(k,a[k]); if(pai) pai.appendChild(e); return e;};
const txt=(pai,s,a)=>{const t=el('text',Object.assign({'font-family':SF},a),pai);
  t.textContent=s; return t;};

window.montaCartao = function(furos){
  const svg = document.getElementById('cartao');
  svg.innerHTML='';
  el('rect',{x:0,y:0,width:1080,height:1350,fill:'#FFF'},svg);
  el('rect',{x:26,y:26,width:1028,height:1298,rx:34,fill:'none',stroke:'#DADDE3',
    'stroke-width':3,'stroke-dasharray':'12 10'},svg);

  /* ── cabeçalho ── */
  txt(svg,'CHECKLIST OPERAÇÃO FIM DE ANO',{x:540,y:118,'text-anchor':'middle',
    'font-size':38,'font-weight':700,fill:TINTA,'letter-spacing':1.2});
  el('line',{x1:120,y1:150,x2:960,y2:150,stroke:LINHA,'stroke-width':3},svg);

  /* ── o número, que é o assunto do card ── */
  const cor = furos ? LARANJA : VERDE;
  txt(svg,String(furos),{x:540,y:330,'text-anchor':'middle','font-size':200,
    'font-weight':700,fill:cor,'letter-spacing':-8});
  txt(svg, furos===1 ? 'gargalo aberto no meu caixa' : 'gargalos abertos no meu caixa',
    {x:540,y:386,'text-anchor':'middle','font-size':36,'font-weight':600,fill:T2});

  /* ── a lista das 5, com o sinal que ela marcou ── */
  const y0=452, passo=68;
  PERGUNTAS.forEach((p,k)=>{
    const y=y0+k*passo, marcou=window.__resp[k], ruim = marcou==='nao';
    const c = ruim?LARANJA:VERDE;
    el('circle',{cx:176,cy:y-10,r:21,fill:c},svg);
    if(ruim) el('path',{d:`M169 ${y-17} L183 ${y-3} M183 ${y-17} L169 ${y-3}`,
      stroke:'#FFF','stroke-width':4.6,'stroke-linecap':'round'},svg);
    else el('path',{d:`M167 ${y-10} l6.5 6.5 L185 ${y-19}`,fill:'none',
      stroke:'#FFF','stroke-width':4.6,'stroke-linecap':'round','stroke-linejoin':'round'},svg);
    txt(svg,p.furo,{x:214,y:y,'font-size':34,'font-weight':700,fill:TINTA});
    txt(svg, ruim?'furou':'ok', {x:904,y:y,'text-anchor':'end','font-size':30,
      'font-weight':600,fill:c});
    if(k<4) el('line',{x1:176,y1:y+22,x2:904,y2:y+22,stroke:LINHA,'stroke-width':2},svg);
  });

  /* ── a torneira DELA, com os furos dela ── */
  const caixa = el('g',{transform:'translate(0 790)'},svg);
  const fora = document.getElementById('canoCartao');
  const peca = fora.cloneNode(true);
  peca.removeAttribute('id'); peca.removeAttribute('style');
  peca.setAttribute('x',40); peca.setAttribute('y',0);
  peca.setAttribute('width',1000); peca.setAttribute('height',350);
  peca.setAttribute('preserveAspectRatio','xMidYMid meet');
  caixa.appendChild(peca);

  el('line',{x1:120,y1:1172,x2:960,y2:1172,stroke:LINHA,'stroke-width':3},svg);
  txt(svg, furos ? 'Cada furo desses é dinheiro que entra e não chega em mim.'
                 : 'Meu cano está inteiro — o que entra chega inteiro.',
    {x:540,y:1224,'text-anchor':'middle','font-size':31,'font-weight':600,fill:T2});
  txt(svg,'@izabelalaila',{x:540,y:1286,'text-anchor':'middle','font-size':33,
    'font-weight':700,fill:LARANJA,'letter-spacing':.6});
};

/* ── baixar como PNG, sem biblioteca ── */
window.baixarCartao = function(){
  const svg = document.getElementById('cartao');
  // ⚠️ o motor pinta o furo com `var(--fundo)`. Fora desta página essa variável
  // não existe e o furo sai sem cor — vira cor literal antes de rasterizar.
  // ⚠️ MEDIDO: sem width/height EXPLÍCITOS no <svg> raiz, o data-URL carrega
  // (onload dispara) e o canvas desenha um NADA — o PNG saía todo branco.
  // viewBox sozinho não dá dimensão intrínseca à imagem.
  const s = new XMLSerializer().serializeToString(svg)
    .replaceAll('var(--fundo)','#F2F3F6')
    .replace('<svg','<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"');
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width=1080; c.height=1350;
    const x = c.getContext('2d');
    x.fillStyle='#FFF'; x.fillRect(0,0,1080,1350);
    x.drawImage(img,0,0,1080,1350);
    const a = document.createElement('a');
    a.download = 'meu-checklist-fim-de-ano.png';
    a.href = c.toDataURL('image/png');
    a.click();
  };
  img.onerror = () => {
    const b = document.getElementById('baixarCard');
    b.textContent = 'Não deu pra gerar a imagem — tire um print da tela.';
  };
  img.src = url;
};
})();
