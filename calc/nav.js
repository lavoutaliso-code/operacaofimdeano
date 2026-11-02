/* ⚠️ A NAVEGAÇÃO ACONTECE DENTRO DA TELA. Cada tela avisa o aparelho que o
   botão foi tocado; quem troca o src do iframe é o mockup, não a tela. Assim a
   calculadora funciona clicando no próprio telefone. */
addEventListener('click', e => {
  if (e.target.closest('.btn, .bt, .semEquipe')) {
    if (e.target.closest('.semEquipe')) return;      /* esse é escolha, não avanço */
    parent.postMessage({ calc: 'prox' }, '*');
  } else if (e.target.closest('.volta')) {
    parent.postMessage({ calc: 'ant' }, '*');
  }
});
