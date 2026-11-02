/* O miolo do cupom e a impressão. Mesmas regras do «fechar caixa». */

const rs = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',
  { minimumFractionDigits:2, maximumFractionDigits:2 });
const rs0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

const linha = (lab, val, cls = '') =>
  `<div class="ln ${cls}"><span class="lab">${lab}</span><span class="val">${val}</span></div>`;

const CHECK = `<span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff"
  stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="m4 12 6 6L20 6"/></svg></span>`;

/* ⚠️ sem Math.random: o mesmo cálculo imprime o mesmo código */
function barras(semente){
  return `<svg width="92" height="16" viewBox="0 0 150 34">${
    Array.from({length:44}, (_, i) => {
      const w = 1 + ((i * 7 + semente * 13) % 3);
      return `<rect x="${i * 3.4}" y="0" width="${w}" height="34" fill="#1C1C1E"/>`;
    }).join('')}</svg>`;
}

/* ⚠️ o alvo da altura é MEDIDO, nunca fixo — e o papel comprido demora mais */
function imprimir(palco, papel, saida, imp, aoPronto){
  palco.style.setProperty('--alvo', (Math.ceil(papel.scrollHeight) + 24) + 'px');
  palco.style.setProperty('--dur',
    Math.min(6, Math.max(2.2, papel.scrollHeight / 300)).toFixed(1) + 's');
  imp.classList.add('imprimindo');
  /* setTimeout e não rAF: precisa disparar mesmo com a aba escondida */
  setTimeout(() => saida.classList.add('aberta'), 16);
  setTimeout(() => { palco.classList.add('pronto'); aoPronto && aoPronto(); }, 1200);
}
