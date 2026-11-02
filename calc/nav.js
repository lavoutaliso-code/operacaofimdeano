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

/* ══════════════════════════════════════════════════════════════════════════
   ⛔ 02/11 — O TECLADO DO CELULAR TAPAVA O «CONTINUAR».
   Medido: o aparelho tem 678px de altura na tela e o botão mora no pé dele; um
   teclado de ~300px cobre esse pé inteiro. Ela digitava o procedimento e não
   tinha como tocar no botão — a calculadora parecia travada.

   Duas saídas, e as duas precisam existir:
   1. a tecla «ir» do próprio teclado avança (é o gesto de quem acabou de
      digitar, e não depende de nada estar visível);
   2. ao ganhar foco, a tela avisa o aparelho, que rola a página até o botão
      ficar acima do teclado.

   ⚠️ TUDO POR DELEGAÇÃO, não campo a campo: as contas (t5) e os produtos (t3)
   nascem DEPOIS que este arquivo roda. Amarrar no elemento deixaria esses de
   fora, que são justamente as telas de digitar mais longas.
   ══════════════════════════════════════════════════════════════════════════ */
const digitavel = el =>
  el && el.tagName === 'INPUT' &&
  !['range', 'checkbox', 'radio', 'button', 'submit'].includes(el.type);

function avanca(){
  const b = document.querySelector('.pe .btn') || document.querySelector('.btn');
  if (!b || b.disabled) return;
  b.click();
}

addEventListener('focusin', e => {
  if (!digitavel(e.target)) return;
  /* a tecla do canto do teclado passa a dizer «ir» em vez de «enter» */
  if (!e.target.hasAttribute('enterkeyhint')) e.target.setAttribute('enterkeyhint', 'go');
  parent.postMessage({ calc: 'focou' }, '*');
});
addEventListener('focusout', e => {
  if (digitavel(e.target)) parent.postMessage({ calc: 'desfocou' }, '*');
});

addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !digitavel(e.target)) return;
  e.preventDefault();
  const campos = [...document.querySelectorAll('input')].filter(digitavel);
  const i = campos.indexOf(e.target);
  /* ⚠️ numa tela de vários campos, «ir» vai pro PRÓXIMO campo — e só no último
     é que ele avança de tela. Avançar no primeiro pularia o resto. */
  if (i > -1 && i < campos.length - 1) { campos[i + 1].focus(); return; }
  e.target.blur();              /* fecha o teclado primeiro: senão o botão
                                   continua coberto e o clique não chega */
  setTimeout(avanca, 60);
});
