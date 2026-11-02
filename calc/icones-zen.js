/* Um ícone por pergunta. Traço preto, mesma gramática das duas referências. */
const t = p => `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor"
  stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

const ICO = {
  /* preço cobrado — etiqueta */
  preco: () => t(`<path d="M52 18H78v26L44 78 18 52z"/><circle cx="66" cy="30" r="5"/>`),
  /* tempo — relógio */
  horas: () => t(`<circle cx="50" cy="52" r="30"/><path d="M50 32v20l13 8"/>`),
  /* produto — frasco */
  produto: () => t(`<path d="M40 18h20"/>
    <path d="M42 18v8l-7 9a11 11 0 0 0-2 7v30a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V42a11 11 0 0 0-2-7l-7-9v-8"/>
    <path d="M34 50h32"/>`),
  /* sua hora — tesoura */
  hora: () => t(`<circle cx="31" cy="74" r="9"/><circle cx="69" cy="74" r="9"/>
    <path d="M37 67 71 22"/><path d="M63 67 29 22"/>`),
  /* salão por mês — fachada */
  contaMes: () => t(`<path d="M24 44h52v38H24z"/><path d="M18 44 28 26h44l10 18"/>
    <path d="M42 82V62h16v20"/>`),
  /* atendimentos — calendário */
  atend: () => t(`<rect x="22" y="30" width="56" height="50" rx="6"/><path d="M22 46h56"/>
    <path d="M36 22v12"/><path d="M64 22v12"/>
    <path d="M34 60h7"/><path d="M46 60h7"/><path d="M58 60h7"/>`),
  /* cartão + imposto — maquininha */
  taxas: () => t(`<rect x="28" y="34" width="44" height="50" rx="7"/>
    <rect x="37" y="45" width="26" height="14" rx="2"/>
    <path d="M38 71h5"/><path d="M53 71h5"/>
    <path d="M42 34V18h28v16"/>`),
  /* profissionais — duas pessoas */
  pessoas: () => t(`<circle cx="38" cy="34" r="11"/>
    <path d="M18 80v-6a16 16 0 0 1 16-16h8a16 16 0 0 1 16 16v6"/>
    <path d="M64 24a11 11 0 0 1 0 20"/><path d="M68 58a16 16 0 0 1 14 16v6"/>`),
  /* comissão — divisão */
  comissao: () => t(`<circle cx="34" cy="34" r="9"/><circle cx="66" cy="66" r="9"/>
    <path d="M74 26 26 74"/>`),
};
