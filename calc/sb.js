/* B · COLUNAS num bloco escuro dentro do papel */
const hA = Math.round(112*(r.so.liquido/r.eq.liquido));
cupom(`
  <div class="destaque">
    <span class="rot">Seu lucro líquido</span>
    <b>${m(x.sobra)}</b>
    <em>em cada ${d.servico.toLowerCase()}</em>
  </div>
  <div class="blocoEsc">
    <span class="rot">No mês você chega até</span>
    <div class="colunas">
      <div class="col a"><span class="v">${m0(r.so.liquido)}</span>
        <div class="barra" style="height:${hA}px"></div></div>
      <div class="col b"><span class="v">${m0(r.eq.liquido)}</span>
        <div class="barra" style="height:112px"></div></div>
    </div>
    <div class="colLeg"><div>Sozinha</div><div>Com ${r.pessoas} pessoas</div></div>
  </div>`);
