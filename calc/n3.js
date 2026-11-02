/* N3 · Cenários — o que acontece com o lucro em três preços. */
const linhas = [
  ['Preço mínimo', r.minimo, 'não sobra nada'],
  ['Você cobra hoje', r.preco, 'hoje'],
  ['Se cobrasse +10%', r.preco * 1.10, ''],
  ['Se cobrasse +20%', r.preco * 1.20, ''],
];
montar(`
  <div class="secao">A conta deste atendimento</div>
  <div class="l"><span class="nome">Preço cobrado</span><span class="pct"></span>
    <span class="val">${m(r.preco)}</span></div>
  <div class="l"><span class="nome">Custo total</span><span class="pct">${p1(1-r.pSobra)}</span>
    <span class="val">− ${m(r.custoTotal)}</span></div>
  <div class="l forte"><span class="nome">Lucro líquido</span><span class="pct">${p1(r.pSobra)}</span>
    <span class="val">${m(r.lucro)}</span></div>

  <div class="tracejo"></div>
  <div class="secao">E se o preço fosse outro</div>
  <div class="cen">
    <div class="cab"><span>Preço</span><span>Cobrando</span><span>Sobra</span></div>
    ${linhas.map(([rot, preco, tag]) => {
      const sobra = r.cenario(preco);
      const hoje = tag === 'hoje';
      return `<div class="r${hoje ? ' hoje' : ''}">
        <span>${rot}</span><span>${m0(preco)}</span><span>${m0(sobra)}</span></div>`;
    }).join('')}
  </div>`);
