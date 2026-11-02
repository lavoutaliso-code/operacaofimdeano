/* S3 · ESCADA — os três números como degraus que sobem. */
const d=Object.assign({},PADRAO), x=extrato(d), r=conta(d);
const m=v=>'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="folha">
  <div class="capa"><h1>Calculadora<br>de Precificação</h1><div class="fio"></div><p>Seu resultado</p></div>
  <div class="corpo">
    <p class="serv">Serviço: <b>${d.servico}</b></p>
    <div class="destaque" style="padding-bottom:10px">
      <span class="rot">Seu lucro líquido</span>
      <b>${m(x.sobra)}</b>
      <em>em cada ${d.servico.toLowerCase()}</em>
    </div>
    <div class="tracejo"></div>
    <p class="rot centro" style="margin-bottom:4px">Até onde isso te leva</p>
    <div class="degraus">
      <div class="deg d1"><small>Por<br>atendimento</small><b>${m(x.sobra)}</b></div>
      <div class="deg d2"><small>No mês<br>sozinha</small><b>${m0(r.so.liquido)}</b></div>
      <div class="deg d3"><small>No mês com<br>${r.pessoas} pessoas</small><b>${m0(r.eq.liquido)}</b></div>
    </div>
    <p class="setaSobe">Montando equipe, você sobe <b>+ ${m0(r.ganho)}</b> por mês</p>
  </div>
</div>`;
