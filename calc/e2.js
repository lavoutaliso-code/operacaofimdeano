/* E2 · Saldo descendo — a coluna da direita mostra o que ainda resta do preço. */
let saldo = x.preco;
const todas = [].concat(
  x.produtos.map(i => ({...i, g:'Produto'})),
  x.salao.map(i => ({...i, g:'Salão'})),
  x.taxas.map(i => ({...i, g:'Taxas'})));

montarExtrato(`
  <div class="e2">
    <div class="precoTopo"><span>Preço cobrado</span><span class="v">${m(x.preco)}</span></div>
    <div class="cabCol"><span class="a">Saiu de onde</span><span class="b">Valor</span>
      <span class="c">Resta</span></div>
    ${todas.map(i => { saldo = Math.round((saldo - i.v) * 100) / 100;
      return `<div class="e"><div class="n"><b>${i.nome}</b><small>${i.g} · ${i.detalhe}</small></div>
        <span class="v">− ${m(i.v)}</span><span class="saldo">${m(saldo)}</span></div>`; }).join('')}
    <div class="sobra"><span>Sobra pra você</span><b>${m(x.sobra)}</b></div>
  </div>`);
