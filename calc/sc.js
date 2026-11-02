/* C · ESCADA */
cupom(`
  <div class="destaque" style="padding-bottom:8px">
    <span class="rot">Seu lucro líquido</span>
    <b>${m(x.sobra)}</b>
    <em>em cada ${d.servico.toLowerCase()}</em>
  </div>
  <div class="tracejo"></div>
  <p class="rot centro">Até onde isso te leva</p>
  <div class="degraus">
    <div class="deg d1"><small>Por<br>atendimento</small><b>${m(x.sobra)}</b></div>
    <div class="deg d2"><small>No mês<br>sozinha</small><b>${m0(r.so.liquido)}</b></div>
    <div class="deg d3"><small>No mês com<br>${r.pessoas} pessoas</small><b>${m0(r.eq.liquido)}</b></div>
  </div>
  <p class="setaSobe">Com equipe você sobe <b>+ ${m0(r.ganho)}</b> por mês</p>`);
