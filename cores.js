// Combinações de cores do CRM. A escolha fica guardada neste aparelho e muda a cor de destaque
// (botões, item aberto do menu, etiquetas ativas, foco). As cores de cada combinação estão no tema-novo.css.
(function () {
  var CHAVE = 'crm_paleta';
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
  // A cor padrão da marca não leva atributo: vale exatamente o visual da marca.
  function aplica(id) {
    if (!id || id === PADRAO) html.removeAttribute('data-paleta');
    else html.setAttribute('data-paleta', id);
  }
  aplica(atual());

  window.escolherPaleta = function (id) {
    try { localStorage.setItem(CHAVE, id); } catch (e) {}
    aplica(id);
    window.renderPaletas();
  };

  window.renderPaletas = function () {
    var box = document.getElementById('paleta-picker');
    if (!box) return;
    var sel = atual();
    var claro = html.getAttribute('data-theme') === 'light';
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
