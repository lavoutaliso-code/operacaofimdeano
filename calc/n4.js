/* N4 · Relatório — a conta, a barra e o mês, tudo num documento só. */
montar(`
  <div class="secao">Para onde vai cada real</div>
  <div class="barra100">
    <i style="flex:${r.pProduto};background:#C7C7CA"></i>
    <i style="flex:${r.pSalao};background:#9FA0A5"></i>
    <i style="flex:${r.pTaxa};background:#DCDCDE"></i>
    <i style="flex:${r.pSobra};background:var(--verde)"></i>
  </div>
  <div class="l"><span class="nome">Produto</span><span class="pct">${p1(r.pProduto)}</span>
    <span class="val">− ${m(r.produto)}</span></div>
  <div class="l"><span class="nome">Salão</span><span class="pct">${p1(r.pSalao)}</span>
    <span class="val">− ${m(r.fixo)}</span></div>
  <div class="l"><span class="nome">Cartão + imposto</span><span class="pct">${p1(r.pTaxa)}</span>
    <span class="val">− ${m(r.taxa)}</span></div>
  <div class="l forte"><span class="nome">Fica com você</span><span class="pct">${p1(r.pSobra)}</span>
    <span class="val">${m(r.lucro)}</span></div>

  <div class="tracejo"></div>
  <div class="secao">No mês</div>
  <div class="ind">
    <div><small>Atendimentos</small><b>${r.atend}</b></div>
    <div><small>Faturamento</small><b>${m0(r.so.fat)}</b></div>
    <div><small>Pra pagar o salão</small><b>${r.equilibrio} atend.</b></div>
    <div><small>Cada hora rende</small><b>${m(r.porHoraCadeira)}</b></div>
  </div>`);
