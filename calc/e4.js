/* E4 · Razão — o que sai de um lado, o que fica do outro. */
const linhas = [].concat(
  x.produtos.map(i => ({...i})), x.salao.map(i => ({...i})), x.taxas.map(i => ({...i})));
montarExtrato(`
  <div class="e4">
    <div class="precoTopo"><span>Preço cobrado</span><span class="v">${m(x.preco)}</span></div>
    <div class="cabR"><span class="a">Item</span><span class="b">Sai</span><span class="c">Fica</span></div>
    ${linhas.map(i => `<div class="r"><div class="a">${i.nome}<small>${i.detalhe}</small></div>
       <div class="b">${m(i.v)}</div><div class="c">—</div></div>`).join('')}
    <div class="r"><div class="a"><b>Sobra pra você</b></div>
      <div class="b">—</div><div class="c">${m(x.sobra)}</div></div>
    <div class="fim"><div class="a">Total</div><div class="b">${m(x.custo)}</div>
      <div class="c">${m(x.sobra)}</div></div>
  </div>`);
