/* E1 · Em grupos — cada bloco com suas linhas e o subtotal embaixo. */
montarExtrato(`
  <div class="precoTopo"><span>Preço cobrado</span><span class="v">${m(x.preco)}</span></div>
  ${GRUPOS.map(([tit, itens, tot]) => `
    <div class="secao"><span>${tit}</span><span>−${m(tot)}</span></div>
    ${itens.map(i => `<div class="e"><div class="n"><b>${i.nome}</b><small>${i.detalhe}</small></div>
       <span class="v">− ${m(i.v)}</span></div>`).join('')}
    <div class="sub"><span>Subtotal</span><span class="v">− ${m(tot)}</span></div>
  `).join('<div style="height:12px"></div>')}
  <div class="sobra"><span>Sobra pra você</span><b>${m(x.sobra)}</b></div>`);
