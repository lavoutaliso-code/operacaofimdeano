/* S2 · COLUNAS numa tela escura — a comparação é a tela inteira. */
document.body.className='escuro';
const d=Object.assign({},PADRAO), x=extrato(d), r=conta(d);
const m=v=>'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');
const hA=Math.round(150*(r.so.liquido/r.eq.liquido)), hB=150;

document.getElementById('alvo').outerHTML = `
<div class="folha">
  <div class="capa"><h1>Calculadora<br>de Precificação</h1><div class="fio"></div><p>Seu resultado</p></div>
  <div class="corpo">
    <p class="serv">Serviço: <b>${d.servico}</b></p>
    <div class="destaque">
      <span class="rot">Seu lucro líquido por ${d.servico.toLowerCase()}</span>
      <b>${m(x.sobra)}</b>
      <em>é o que fica com você em cada atendimento</em>
    </div>
    <div class="tracejo"></div>
    <p class="rot centro">No mês você chega até</p>
    <div class="colunas">
      <div class="col a"><span class="v">${m0(r.so.liquido)}</span>
        <div class="barra" style="height:${hA}px"></div></div>
      <div class="col b"><span class="v">${m0(r.eq.liquido)}</span>
        <div class="barra" style="height:${hB}px"></div></div>
    </div>
    <div class="colLeg"><div>Sozinha</div><div>Com ${r.pessoas} pessoas<br>na equipe</div></div>
  </div>
</div>`;
