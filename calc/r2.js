/* R2 · O carimbo e a conta. O mês cabe numa frase. */
const d = Object.assign({}, PADRAO), r = conta(d);
const m = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="sombra"><div class="papel">
  <div class="topo">${d.servico}</div>
  <div class="cobra" style="margin-top:14px">Você cobra <b>${m(r.preco)}</b></div>
  <div class="rotulo">Sobra pra você</div>
  <div class="carimbo" style="color:${r.paga?'var(--vermelho)':'var(--verde)'}">
    <b>${m(r.lucro)}</b><i>por ${d.servico.toLowerCase()}</i>
  </div>

  <div class="tracejo"></div>
  <div class="ln"><span class="q">Produto</span><span class="q">− ${m(r.produto)}</span></div>
  <div class="ln"><span class="q">Salão</span><span class="q">− ${m(r.fixo)}</span></div>
  <div class="ln"><span class="q">Cartão + imposto</span><span class="q">− ${m(r.taxa)}</span></div>

  <div class="tracejo"></div>
  <p class="fecho">No mês isso dá <b>${m0(r.so.liquido)}</b> sozinha.<br>
     Com ${r.pessoas} na equipe, <b>${m0(r.eq.liquido)}</b>.</p>
</div></div>`;
