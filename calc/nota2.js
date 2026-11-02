/* As 4 notas-documento. Cabeçalho, carimbos (arranjo C2) e rodapé são iguais;
   o miolo é o que muda. */
const d = Object.assign({}, PADRAO);
const r = indicadores(d);
const m  = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const p1 = v => (v*100).toFixed(1).replace('.',',') + '%';

const CABECA = `
  <div class="marca">
    <h1>Calculadora de<br>Precificação</h1>
    <p>Lavou tá liso</p>
  </div>
  <div class="tracejo"></div>
  <div class="doc"><span>Nº ${numeroDoc(r)}</span><span>${HOJE}</span></div>
  <div class="servico">${d.servico} <em>· ${String(d.horas).replace('.',',')}h de cadeira</em></div>`;

const SELOS = `
  <div class="selos">
    <span class="cb am g"><small>Seu lucro líquido</small>
      <b>${m(r.lucro)}</b><i>por ${d.servico.toLowerCase()}</i></span>
    <div class="par">
      <span class="cb vm"><small>No mês você faz até</small>
        <b>${m0(r.so.liquido)}</b><i>sozinha</i></span>
      <span class="cb vd"><small>Com ${r.pessoas}, até</small>
        <b>${m0(r.eq.liquido)}</b><i>por mês</i></span>
    </div>
  </div>`;

const barras = `<svg width="104" height="20" viewBox="0 0 150 34">${
  Array.from({length:44},(_,i)=>{const w=1+((i*7+r.atend*13)%3);
    return `<rect x="${i*3.4}" y="0" width="${w}" height="34" fill="#1C1C1E"/>`;}).join('')}</svg>`;

const RODAPE = `
  <div class="rodape">
    <p class="frase">Conta fechada com as 8 respostas que você deu.<br>
       Guarde esta nota para comparar no próximo mês.</p>
    ${barras}
    <p class="assina">Calculadora de Precificação</p>
  </div>`;

function montar(miolo){
  document.getElementById('alvo').outerHTML = `
    <div class="sombra"><div class="papel">
      ${CABECA}
      <div class="tracejo"></div>
      ${miolo}
      <div class="tracejo"></div>
      ${SELOS}
      <div class="tracejo"></div>
      ${RODAPE}
    </div></div>`;
}
