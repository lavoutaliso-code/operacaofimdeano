/* O cupom com três carimbos. O arranjo vem da classe (c1..c4). */
function montarCarimbos(arranjo){
  const d = Object.assign({}, PADRAO), r = conta(d);
  const m  = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

  const AM = `<span class="cb am g"><small>Seu lucro líquido</small>
    <b>${m(r.lucro)}</b><i>por ${d.servico.toLowerCase()}</i></span>`;
  const VM = `<span class="cb vm m"><small>No mês você faz até</small>
    <b>${m0(r.so.liquido)}</b><i>sozinha</i></span>`;
  const VD = `<span class="cb vd m"><small>Com ${r.pessoas} na equipe, até</small>
    <b>${m0(r.eq.liquido)}</b><i>por mês</i></span>`;

  const conta3 = `
    <div class="ln"><span>Produto</span><span>− ${m(r.produto)}</span></div>
    <div class="ln"><span>Salão</span><span>− ${m(r.fixo)}</span></div>
    <div class="ln"><span>Cartão + imposto</span><span>− ${m(r.taxa)}</span></div>`;

  const miolo = {
    c1: `${AM}${VM}${VD}`,
    c2: `${AM}<div class="par">${VM}${VD}</div>`,
    c3: `${AM}${VM}${VD}`,
    c4: `${AM}<div class="par">${VM}${VD}</div>`,
  }[arranjo];

  document.getElementById('alvo').outerHTML = `
    <div class="sombra"><div class="papel">
      <div class="topo">${d.servico}</div>
      <div class="cobra">Você cobra <b>${m(r.preco)}</b></div>
      <div class="tracejo"></div>
      ${conta3}
      <div class="tracejo"></div>
      <div class="${arranjo}">${miolo}</div>
    </div></div>`;
}
