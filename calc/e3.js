/* E3 · Em árvore — a linha-mãe fecha o grupo, as filhas mostram de onde veio. */
montarExtrato(`
  <div class="e3">
    <div class="precoTopo"><span>Preço cobrado</span><span class="v">${m(x.preco)}</span></div>
    ${GRUPOS.map(([tit, itens, tot]) => `
      <div class="mae"><span>${tit}</span><span class="v">− ${m(tot)}</span></div>
      ${itens.map(i => `<div class="filha"><span class="n">${i.nome}
         <small>· ${i.detalhe}</small></span><span class="v">${m(i.v)}</span></div>`).join('')}
    `).join('')}
    <div class="sobra"><span>Sobra pra você</span><b>${m(x.sobra)}</b></div>
  </div>`);
