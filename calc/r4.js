/* R4 · Sem caixa nenhuma — só tipografia e linhas finas. */
const d = Object.assign({}, PADRAO), r = conta(d);
const m = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0 = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

document.getElementById('alvo').outerHTML = `
<div class="nu">
  <div class="cobra" style="text-align:left">Você cobra <b>${m(r.preco)}</b> pela ${d.servico.toLowerCase()}</div>
  <div class="rotulo" style="text-align:left;margin-top:18px">Sobra pra você</div>
  <div class="grande" style="text-align:left;font-size:52px;letter-spacing:-2.4px;
       color:${r.paga?'var(--vermelho)':'var(--preto)'}">${m(r.lucro)}</div>

  <div class="sep" style="margin-top:24px"></div>
  <div class="ln"><span class="q">Produto</span><span class="q">− ${m(r.produto)}</span></div>
  <div class="ln"><span class="q">Salão</span><span class="q">− ${m(r.fixo)}</span></div>
  <div class="ln"><span class="q">Cartão + imposto</span><span class="q">− ${m(r.taxa)}</span></div>

  <div class="sep" style="margin-top:24px"></div>
  <div class="ln"><span>Sozinha, no mês</span><span>${m0(r.so.liquido)}</span></div>
  <div class="ln forte"><span>Com ${r.pessoas} na equipe</span><span>${m0(r.eq.liquido)}</span></div>
</div>`;
