/* D · MEDALHA + CAMADAS */
cupom(`
  <div class="centro">
    <div class="medalha">
      <small>Seu lucro<br>líquido</small>
      <b>${m(x.sobra)}</b>
      <em>por ${d.servico.toLowerCase()}</em>
    </div>
    <div class="camada a"><small>No mês, sozinha,<br>você chega a</small>
      <b>${m0(r.so.liquido)}</b></div>
    <div class="camada b"><small>Com uma equipe<br>de ${r.pessoas} pessoas</small>
      <b>${m0(r.eq.liquido)}</b></div>
    <span class="maisZ">+ ${m0(r.ganho)} por mês</span>
  </div>`);
