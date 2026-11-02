/* S4 · MEDALHA + CAMADAS — um selo para o lucro, dois cartões para o mês. */
document.body.className='limpo';
const d=Object.assign({},PADRAO), x=extrato(d), r=conta(d);
const m=v=>'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="folha">
  <div class="capa"><h1>Calculadora de Precificação</h1><div class="fio"></div><p>Seu resultado</p></div>
  <div class="corpo centro">
    <div class="medalha">
      <small>Seu lucro<br>líquido</small>
      <b>${m(x.sobra)}</b>
      <em>por ${d.servico.toLowerCase()}</em>
    </div>
    <div class="camadas">
      <div class="camada a"><small>No mês, sozinha,<br>você chega a</small>
        <b>${m0(r.so.liquido)}</b></div>
      <div class="camada b"><small>Com uma equipe<br>de ${r.pessoas} pessoas</small>
        <b>${m0(r.eq.liquido)}</b></div>
    </div>
    <span class="maisZ">+ ${m0(r.ganho)} por mês</span>
  </div>
</div>`;
