/* R3 · Cartões de app — sai o papel, entra hierarquia e ar. */
const d = Object.assign({}, PADRAO), r = conta(d);
const m = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="cartoes">
  <div class="cartao">
    <div class="antes"><span>Você cobra</span><b>${m(r.preco)}</b></div>
    <div class="k">Sobra pra você</div>
    <div class="big" style="color:${r.paga?'var(--vermelho)':'var(--verde)'}">${m(r.lucro)}</div>
  </div>

  <div class="cartao">
    <div class="ln"><span class="q">Produto</span><span class="q">− ${m(r.produto)}</span></div>
    <div class="ln"><span class="q">Salão</span><span class="q">− ${m(r.fixo)}</span></div>
    <div class="ln"><span class="q">Cartão + imposto</span><span class="q">− ${m(r.taxa)}</span></div>
  </div>

  <div class="duo">
    <div class="cartao"><div class="k">Sozinha</div><div class="v">${m0(r.so.liquido)}</div></div>
    <div class="cartao escuro"><div class="k">Com ${r.pessoas}</div><div class="v">${m0(r.eq.liquido)}</div></div>
  </div>
</div>`;
