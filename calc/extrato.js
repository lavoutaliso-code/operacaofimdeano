/* As 4 versões do extrato. Capa, carimbos e código de barras são iguais. */
const d = Object.assign({}, PADRAO);
const x = extrato(d);
const r = conta(d);
const m  = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

/* ⚠️ código de barras grande, e sem Math.random: o mesmo cálculo imprime o mesmo código */
const CODIGO = String(Math.round(x.sobra * 100)).padStart(6,'0') + String(x.atend).padStart(3,'0');
const BARRAS = `
  <div class="barras">
    <svg width="248" height="58" viewBox="0 0 248 58">${
      Array.from({length:58},(_,i)=>{
        const w = 1.4 + ((i*7 + x.atend*13 + Math.round(x.sobra)) % 3) * 1.1;
        return `<rect x="${(i*4.26).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="58" fill="#1C1C1E"/>`;
      }).join('')}</svg>
    <span>${CODIGO}</span>
  </div>`;

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

function montarExtrato(miolo){
  document.getElementById('alvo').outerHTML = `
    <div class="sombra"><div class="papel">
      ${CAPA}
      <div class="corpo">
        ${IDENT}
        <div class="tracejo"></div>
        ${miolo}
        <div class="tracejo"></div>
        ${SELOS}
        <div class="tracejo"></div>
        ${BARRAS}
      </div>
    </div></div>`;
}

/* grupos prontos para quem quiser usar */
const GRUPOS = [
  ['Produto que você usou', x.produtos, x.tProduto],
  ['Rateio do salão',       x.salao,    x.tSalao],
  ['Banco e governo',       x.taxas,    x.tTaxas],
];
