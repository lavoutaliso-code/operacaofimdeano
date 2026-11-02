/* Esqueleto do cupom — igual nas quatro. Só o miolo muda. */
const d = EST;
const x = extrato(d);
const r = conta(d);
/* ⚠️ O SINAL NÃO PODE SUMIR. Com Math.abs, um prejuízo de R$ 2,52 era impresso
   como «R$ 2,52» em verde — medido com preço de R$ 60, onde a margem dizia
   −4,2% ao lado de um lucro aparentemente positivo. */
const m  = v => (v < 0 ? '− ' : '') + 'R$ '
  + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => (v < 0 ? '− ' : '') + 'R$ ' + Math.abs(Math.round(v)).toLocaleString('pt-BR');
const CODIGO = String(Math.round(x.sobra*100)).padStart(6,'0') + String(x.atend).padStart(3,'0');

function cupom(miolo){
  document.getElementById('alvo').outerHTML = `
  <div class="sombra"><div class="papel">
    <div class="capa">
      <h1>Calculadora<br>de Precificação</h1>
      <div class="fio"></div>
      <p>Seu resultado</p>
    </div>
    <div class="corpo">
      <div class="ident"><span>Nº ${numeroDoc(r)}</span><span>${HOJE}</span></div>
      <div class="servico">${d.servico} <em>· ${String(d.horas).replace('.',',')}h</em></div>
      <div class="tracejo"></div>
      ${miolo}
      <div class="tracejo"></div>
      <div class="barras">
        <svg width="214" height="36" viewBox="0 0 236 46">${
          Array.from({length:56},(_,i)=>{const w=1.3+((i*7+x.atend*13+Math.round(x.sobra))%3)*1.05;
            return `<rect x="${(i*4.2).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="46" fill="#1C1C1E"/>`;
          }).join('')}</svg>
        <span>${CODIGO}</span>
      </div>
    </div>
  </div></div>`;
}

const aro = (tam, larg, pct, cor) => {
  const R = (tam-larg)/2, C = 2*Math.PI*R;
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}">
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="#EDEDEF" stroke-width="${larg}"/>
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="${cor}" stroke-width="${larg}"
      stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg>`;
};
