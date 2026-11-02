/* O miolo da nota é o mesmo nas quatro. Só o BLOCO DE ÊNFASE muda. */

function montarNota(enfaseHTML){
  const d = Object.assign({}, PADRAO);
  const r = conta(d);

  document.getElementById('papel').innerHTML = `
    <div class="tit">
      <h4>${d.servico.toUpperCase()}</h4>
      <p>${HOJE}</p>
    </div>
    <div class="traco">· · · · · · · · · · · · · · ·</div>

    ${enfaseHTML(r, d)}

    <div class="sec">Por que sobra isso</div>
    ${linha('Preço cobrado', rs(r.preco))}
    ${linha('Produto', '− ' + rs(r.produto))}
    ${linha('Salão <em>' + rs0(d.contaMes) + ' ÷ ' + r.atend + '</em>', '− ' + rs(r.fixo))}
    ${linha('Cartão + imposto', '− ' + rs(r.taxa))}
    ${linha('<b>sobra</b>', '<b>' + rs(r.lucro) + '</b>', 'total' + (r.paga ? ' neg' : ''))}

    <div class="mes2">
      <div class="m">
        <small>Sozinha, você faz até</small>
        <b>${rs0(r.so.liquido)}</b>
        <em>por mês · ${r.so.serv} atendimentos</em>
      </div>
      ${r.pessoas > 0 ? `
      <div class="m forte">
        <small>Com uma equipe de ${r.pessoas} ${r.pessoas === 1 ? 'pessoa' : 'pessoas'}, você poderia fazer</small>
        <b>${rs0(r.eq.liquido)}</b>
        <em>por mês · ${r.eq.serv} atendimentos</em>
        <span class="mais">+ ${rs0(r.ganho)} por mês, com o mesmo aluguel</span>
      </div>` : ''}
    </div>

    ${selo(veredito(r))}`;

  imprimir(
    document.getElementById('palco'),
    document.getElementById('papel'),
    document.getElementById('saida'),
    document.getElementById('imp')
  );
}

const cor = r => r.paga ? 'var(--vermelho)' : 'var(--verde)';

/* o selo do veredito — substitui o «conta conferida», que era de caixa */
const DESENHO = {
  check: '<path d="m4 12 6 6L20 6"/>',
  '!':   '<path d="M12 5v9"/><path d="M12 18.5v.01"/>',
  x:     '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
};
function selo(v){
  return `<div class="final veredito">
    <span class="check" style="background:${v.cor}">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2"
        stroke-linecap="round" stroke-linejoin="round">${DESENHO[v.icone]}</svg></span>
    <div class="frase" style="color:${v.cor}">${v.titulo}</div>
  </div>`;
}
const miudo = r => `${pc(r.margem)} do preço · ${rs(r.porHora)} por hora`;
