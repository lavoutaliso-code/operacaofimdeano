/* N1 · Demonstrativo — cada linha com o peso dela no preço. */
montar(`
  <div class="secao">Demonstrativo por atendimento</div>
  <div class="l"><span class="nome">Preço cobrado</span><span class="pct">100%</span>
    <span class="val">${m(r.preco)}</span></div>
  <div class="l"><span class="nome">Produto</span><span class="pct">${p1(r.pProduto)}</span>
    <span class="val">− ${m(r.produto)}</span></div>
  <div class="l"><span class="nome">Salão (rateio)</span><span class="pct">${p1(r.pSalao)}</span>
    <span class="val">− ${m(r.fixo)}</span></div>
  <div class="l"><span class="nome">Cartão + imposto</span><span class="pct">${p1(r.pTaxa)}</span>
    <span class="val">− ${m(r.taxa)}</span></div>
  <div class="l forte"><span class="nome">Lucro líquido</span><span class="pct">${p1(r.pSobra)}</span>
    <span class="val">${m(r.lucro)}</span></div>

  <div class="barra100" style="margin-top:12px">
    <i style="flex:${r.pProduto};background:#C7C7CA"></i>
    <i style="flex:${r.pSalao};background:#9FA0A5"></i>
    <i style="flex:${r.pTaxa};background:#DCDCDE"></i>
    <i style="flex:${r.pSobra};background:var(--verde)"></i>
  </div>
  <p style="font-size:9px;color:var(--cinza);text-align:center">
    produto · salão · taxas · o que fica com você</p>`);
