/* As 4 versões finais do extrato em árvore. */
const d = Object.assign({}, PADRAO);
const x = extrato(d);
const r = conta(d);
const m  = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const GRUPOS = [
  [x.titulos[0], x.produtos, x.tProduto],
  [x.titulos[1], x.salao,    x.tSalao],
  [x.titulos[2], x.taxas,    x.tTaxas],
];
const CODIGO = String(Math.round(x.sobra*100)).padStart(6,'0') + String(x.atend).padStart(3,'0');

const CAPA = `
  <div class="capa">
    <h1>Calculadora<br>de Precificação</h1>
    <div class="fio"></div>
    <p>Extrato do seu preço</p>
  </div>`;

const IDENT = `
  <div class="ident"><span>Nº ${numeroDoc(r)}</span><span>${HOJE}</span></div>
  <div class="servico">${d.servico} <em>· ${String(d.horas).replace('.',',')}h</em></div>`;

const SELOS = `
  <div class="selos">
    <span class="cb am g"><small>Seu lucro líquido</small>
      <b>${m(x.sobra)}</b><i>por ${d.servico.toLowerCase()}</i></span>
    <div class="par">
      <span class="cb vm"><small>No mês você faz até</small>
        <b>${m0(r.so.liquido)}</b><i>sozinha</i></span>
      <span class="cb vd"><small>Com ${r.pessoas}, até</small>
        <b>${m0(r.eq.liquido)}</b><i>por mês</i></span>
    </div>
  </div>`;

const BARRAS = `
  <div class="barras">
    <svg width="236" height="46" viewBox="0 0 236 46">${
      Array.from({length:56},(_,i)=>{const w=1.3+((i*7+x.atend*13+Math.round(x.sobra))%3)*1.05;
        return `<rect x="${(i*4.2).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="46" fill="#1C1C1E"/>`;
      }).join('')}</svg>
    <span>${CODIGO}</span>
  </div>`;

const PRECO = `<div class="preco"><span>Preço cobrado</span><span class="v">${m(x.preco)}</span></div>`;
const SOBRA = `<div class="sobra"><span>Sobra pra você</span><b>${m(x.sobra)}</b></div>`;
const mae = (tit, tot) => `<div class="mae"><span>${tit}</span><span class="v">− ${m(tot)}</span></div>`;

/* ── os quatro miolos ── */
const arvoreCheia = GRUPOS.map(([t, itens, tot]) => mae(t, tot)
  + itens.map(i => `<div class="filha"><span class="n">${i.nome}
      <small>· ${i.detalhe}</small></span><span class="v">${m(i.v)}</span></div>`).join('')).join('');

const arvore2col = GRUPOS.map(([t, itens, tot]) => mae(t, tot)
  + `<div class="filhas">${itens.map(i => `<div class="filha">
      <span class="n">${i.nome}</span><span class="v">${m(i.v)}</span></div>`).join('')}</div>`).join('');

const arvoreCorrida = GRUPOS.map(([t, itens, tot]) => mae(t, tot)
  + `<p class="corrida">${itens.map(i =>
      `${i.nome} <b>${m(i.v)}</b>`).join('<span>·</span>')}</p>`).join('');

const MIOLOS = {
  f1: `<div class="f1">${PRECO}${arvoreCheia}${SOBRA}</div>`,
  f2: `<div class="f2">${PRECO}${arvore2col}${SOBRA}</div>`,
  f3: `<div class="f3">${PRECO}${arvoreCorrida}${SOBRA}</div>`,
  f4: `<div class="f4">${PRECO}${arvoreCheia}${SOBRA}</div>`,
};

function montarFinal(v){
  const corpo = v === 'f4'
    ? `${IDENT}<div class="tracejo"></div>${SELOS}<div class="tracejo"></div>${MIOLOS.f4}
       <div class="tracejo"></div>${BARRAS}`
    : `${IDENT}<div class="tracejo"></div>${MIOLOS[v]}
       <div class="tracejo"></div>${SELOS}<div class="tracejo"></div>${BARRAS}`;
  document.getElementById('alvo').outerHTML =
    `<div class="sombra"><div class="papel">${CAPA}<div class="corpo">${corpo}</div></div></div>`;
}
