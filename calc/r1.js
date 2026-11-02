/* R1 · Três andares — o número, a conta, o mês. Nada mais. */
const d = Object.assign({}, PADRAO), r = conta(d);
const m = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="sombra"><div class="papel">
  <div class="topo">${d.servico} · ${HOJE}</div>
  <div class="tracejo"></div>

  <div class="cobra">Você cobra <b>${m(r.preco)}</b></div>
  <div class="rotulo">Sobra pra você</div>
  <div class="grande${r.paga?' neg':''}">${m(r.lucro)}</div>

  <div class="tracejo"></div>
  <div class="ln"><span class="q">Produto</span><span class="q">− ${m(r.produto)}</span></div>
  <div class="ln"><span class="q">Salão</span><span class="q">− ${m(r.fixo)}</span></div>
  <div class="ln"><span class="q">Cartão + imposto</span><span class="q">− ${m(r.taxa)}</span></div>

  <div class="tracejo"></div>
  <div class="ln"><span>Sozinha, no mês</span><span>${m0(r.so.liquido)}</span></div>
  <div class="ln forte"><span>Com ${r.pessoas} na equipe</span><span>${m0(r.eq.liquido)}</span></div>
</div></div>`;
