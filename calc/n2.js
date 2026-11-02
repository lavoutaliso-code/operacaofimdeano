/* N2 · Ficha técnica — a conta mais os quatro indicadores do serviço. */
montar(`
  <div class="secao">A conta deste atendimento</div>
  <div class="l"><span class="nome">Preço cobrado</span><span class="pct"></span>
    <span class="val">${m(r.preco)}</span></div>
  <div class="l"><span class="nome">Custo total</span><span class="pct">${p1(1-r.pSobra)}</span>
    <span class="val">− ${m(r.custoTotal)}</span></div>
  <div class="l forte"><span class="nome">Lucro líquido</span><span class="pct">${p1(r.pSobra)}</span>
    <span class="val">${m(r.lucro)}</span></div>

  <div class="tracejo"></div>
  <div class="secao">Ficha técnica</div>
  <div class="ind">
    <div><small>Cada hora de cadeira rende</small><b>${m(r.porHoraCadeira)}</b></div>
    <div><small>Atendimentos pra pagar o salão</small><b>${r.equilibrio} por mês</b></div>
    <div><small>Preço mínimo (lucro zero)</small><b>${m(r.minimo)}</b></div>
    <div><small>Produto por atendimento</small><b>${m(r.produto)}</b></div>
  </div>`);
