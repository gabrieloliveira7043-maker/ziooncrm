// Combinações de cores do CRM. A escolha fica guardada neste aparelho e muda a cor de destaque
// (botões, item aberto do menu, etiquetas ativas, foco). As cores de cada combinação estão no tema-novo.css.
(function () {
  var CHAVE = 'crm_paleta', CHAVE_TOTAL = 'crm_paleta_total';
  var PALETAS = [
    { id: 'dourado',   nome: 'Dourado',   escuro: '#C9A24A', claro: '#8A6A1F' },
    { id: 'marinho',   nome: 'Marinho',   escuro: '#5B7BFF', claro: '#001645' },
    { id: 'esmeralda', nome: 'Esmeralda', escuro: '#34C38F', claro: '#0F7B57' },
    { id: 'oceano',    nome: 'Oceano',    escuro: '#4FA3E8', claro: '#0B5FA5' },
    { id: 'violeta',   nome: 'Violeta',   escuro: '#9B87F5', claro: '#5B32C8' },
    { id: 'rubi',      nome: 'Rubi',      escuro: '#F2667A', claro: '#B4123A' },
    { id: 'ambar',     nome: 'Âmbar',     escuro: '#F2994A', claro: '#B4470A' },
    { id: 'turquesa',  nome: 'Turquesa',  escuro: '#2EC4B6', claro: '#0B7A72' },
    { id: 'rosa',      nome: 'Rosa',      escuro: '#E879B9', claro: '#B0256E' },
    { id: 'grafite',   nome: 'Grafite',   escuro: '#E4E2DD', claro: '#18181B' }
  ];
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="application-name"]');
  var PADRAO = meta && /zioon/i.test(meta.content) ? 'marinho' : 'dourado';

  function atual() {
    try { return localStorage.getItem(CHAVE) || PADRAO; } catch (e) { return PADRAO; }
  }
  // "CRM inteiro": a cor tinge fundo, menu, cartões e colunas. Desligado, muda só os destaques.
  function total() {
    try { return localStorage.getItem(CHAVE_TOTAL) === '1'; } catch (e) { return false; }
  }
  // Só destaques com a cor da marca: sem atributo, vale exatamente o visual da marca.
  function aplica() {
    var id = atual(), t = total();
    if (id === PADRAO && !t) html.removeAttribute('data-paleta');
    else html.setAttribute('data-paleta', id);
    if (t) html.setAttribute('data-paleta-total', ''); else html.removeAttribute('data-paleta-total');
  }
  aplica();

  window.escolherPaleta = function (id) {
    try { localStorage.setItem(CHAVE, id); } catch (e) {}
    aplica();
    window.renderPaletas();
  };
  window.escolherAlcancePaleta = function (inteiro) {
    try { localStorage.setItem(CHAVE_TOTAL, inteiro ? '1' : '0'); } catch (e) {}
    aplica();
    window.renderPaletas();
  };

  window.renderPaletas = function () {
    var box = document.getElementById('paleta-picker');
    if (!box) return;
    var sel = atual(), t = total();
    var claro = html.getAttribute('data-theme') === 'light';
    var alcance = document.getElementById('paleta-alcance');
    if (alcance) alcance.innerHTML =
      '<button type="button" class="' + (t ? '' : 'on') + '" aria-pressed="' + !t + '" onclick="escolherAlcancePaleta(false)">Só os destaques<small>botões, ícones e itens ativos</small></button>' +
      '<button type="button" class="' + (t ? 'on' : '') + '" aria-pressed="' + t + '" onclick="escolherAlcancePaleta(true)">CRM inteiro<small>fundo, menu, cartões e colunas</small></button>';
    box.innerHTML = PALETAS.map(function (p) {
      var on = p.id === sel;
      return '<button type="button" class="paleta-op' + (on ? ' on' : '') + '" onclick="escolherPaleta(\'' + p.id + '\')" aria-pressed="' + on + '" title="' + p.nome + '">' +
        '<span class="paleta-cor" style="background:' + (claro ? p.claro : p.escuro) + '">' + (on && window.uiIco ? window.uiIco('check', 14) : '') + '</span>' +
        '<span class="paleta-nome">' + p.nome + (p.id === PADRAO ? ' <small>padrão</small>' : '') + '</span></button>';
    }).join('');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.renderPaletas); else window.renderPaletas();
  // Ao trocar entre claro e escuro, as amostras acompanham.
  new MutationObserver(function () { window.renderPaletas(); }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
})();
