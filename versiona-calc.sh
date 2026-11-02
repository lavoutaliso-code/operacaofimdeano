#!/bin/bash
# ⛔ 02/11 — SEM ISTO, EDIÇÃO NA CALCULADORA NÃO CHEGA NA CLIENTE.
# As telas de dentro do aparelho carregam nucleo.js, estado.js, telas.css, nav.js…
# sem versão nenhuma. O GitHub Pages manda guardar por 10 minutos, então uma
# correção publicada continuava mostrando o arquivo velho — foi assim que o
# «1 profissionais» sobreviveu a um deploy. Agora cada publicação carimba todos.
V="$1"
cd "$(dirname "$0")/calc" || exit 1
for f in *.html; do
  perl -0pi -e "s{(src|href)=\"([a-zA-Z0-9._-]+\.(?:js|css))(\?v=\d+)?\"}{\$1=\"\$2?v=$V\"}g" "$f"
done
echo "calc: $(ls *.html | wc -l | tr -d ' ') telas carimbadas com v=$V"
