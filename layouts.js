/* =====================================================================
   Layouts do CRM: monta o menu em pílula no topo, a barra lateral de bolinhas,
   o fundo, as animações e a tela "Aparência" (Conta). Visual em layouts.css.
   Preferência por login: guardada no servidor (/ui/prefs) e copiada no aparelho
   (localStorage "crm_ui") para o layout já aparecer certo antes do login.
   Os botões do menu novo só "clicam" nos itens do menu lateral original, então
   permissões, telas e contadores continuam vindo do CRM de sempre.
   ===================================================================== */
(function () {
  'use strict';
  var KEY = 'crm_ui';
  var BGS = [
    ['por-do-sol', 'Pôr do sol'], ['sala', 'Sala'], ['noite', 'Noite'],
    ['oceano', 'Oceano'], ['grafite', 'Grafite'], ['areia', 'Areia']
  ];
  // Itens que ficam à mostra no topo e nas bolinhas (o resto vai em "Mais").
  var TOP = ['report', 'crm', 'chat', 'calendario', 'campanhas', 'automacoes'];
  var DOCK = ['report', 'crm', 'chat', 'calendario', 'contatos', 'campanhas', 'automacoes', 'integracoes'];
  var H = document.documentElement;
  var prefs = read();
  var built = false, loadedUid = '', counterObs = null;

  function read() {
    try { var p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (p && p.theme) return p; } catch (e) {}
    return { theme: 'atual', bg: 'por-do-sol', calm: false };
  }
  function store(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function bgUrl(bg) { return /^https:\/\//.test(bg || '') ? bg : '/fundos/' + (bg || 'por-do-sol') + '.jpg'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- Aplicar ----------
  function apply(p) {
    prefs = p;
    var on = p.theme === 'vidro' || p.theme === 'quente';
    H.classList.toggle('ui-vidro', p.theme === 'vidro');
    H.classList.toggle('ui-quente', p.theme === 'quente');
    H.classList.toggle('ui-top', on);
    H.classList.toggle('ui-calm', !!p.calm);
    H.classList.toggle('ui-anim', on && !p.calm);
    H.style.setProperty('--ui-bg-img', 'url("' + bgUrl(p.bg).replace(/"/g, '') + '")');
    ensureBg();
    if (on) { build(); sync(); } else teardown();
    renderAparencia();
  }
  function ensureBg() {
    if (document.querySelector('.ui-bg')) return;
    var d = document.createElement('div');
    d.className = 'ui-bg';
    d.innerHTML = '<div class="ui-bg-img"></div>';
    document.body.insertBefore(d, document.body.firstChild);
  }

  // Botão claro/escuro do topo: lua acesa (preenchida, na cor de destaque) = modo noturno ligado; sol = modo claro.
  function syncThemeBtn() {
    var b = document.getElementById('ui-theme');
    if (!b) return;
    var dark = H.getAttribute('data-theme') !== 'light';
    b.classList.toggle('is-dark', dark);
    b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    b.title = dark ? 'Modo noturno ligado (clique para o modo claro)' : 'Modo claro ligado (clique para o modo noturno)';
    b.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>';
  }

  // ---------- Itens do menu original ----------
  function navItems() {
    var out = [];
    document.querySelectorAll('.sidebar .nav-group').forEach(function (g) {
      var label = (g.querySelector('.nav-group-label') || {}).textContent || '';
      g.querySelectorAll('.nav-item[id^="nav-"]').forEach(function (el) {
        if (el.style.display === 'none') return;
        var svg = el.querySelector('svg');
        var text = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join(' ').replace(/\s+/g, ' ').trim();
        out.push({ id: el.id.replace('nav-', ''), el: el, group: label.trim(), label: text || el.textContent.trim(), icon: svg ? svg.outerHTML : '', active: el.classList.contains('active') });
      });
    });
    return out;
  }
  function go(id) {
    closeMenus();
    var el = document.getElementById('nav-' + id);
    if (el) el.click();
  }

  // ---------- Montagem ----------
  function build() {
    if (built) return;
    built = true;
    var logo = document.querySelector('.sidebar-logo img');
    var brand = (document.querySelector('.sidebar-logo .logo-text') || {}).textContent || 'CRM';
    var top = document.createElement('header');
    top.className = 'ui-topnav';
    top.innerHTML =
      '<div class="ui-chip ui-brand">' + (logo ? '<img src="' + logo.getAttribute('src') + '" alt="">' : '') + '<b>' + esc(brand) + '</b></div>' +
      '<nav class="ui-pills" id="ui-pills"><span class="ui-ind" id="ui-ind"></span></nav>' +
      '<div class="ui-right">' +
        '<span id="ui-client-slot"></span>' +
        '<button type="button" class="ui-round" id="ui-bell" title="Notificações"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="ui-badge" id="ui-bell-badge"></span></button>' +
        '<button type="button" class="ui-round" id="ui-theme" title="Claro / escuro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>' +
        '<button type="button" class="ui-round ui-avatar" id="ui-me" title="Conta">?</button>' +
      '</div>';
    document.body.appendChild(top);
    var dock = document.createElement('aside');
    dock.className = 'ui-dock';
    dock.id = 'ui-dock';
    document.body.appendChild(dock);
    document.getElementById('ui-bell').onclick = function () { if (window.openNotificationsCenter) window.openNotificationsCenter(); };
    document.getElementById('ui-theme').onclick = function () { if (window.toggleHuvenTheme) window.toggleHuvenTheme(); syncThemeBtn(); };
    syncThemeBtn();
    if (!syncThemeBtn.obs) { syncThemeBtn.obs = new MutationObserver(syncThemeBtn); syncThemeBtn.obs.observe(H, { attributes: true, attributeFilter: ['data-theme'] }); }
    document.getElementById('ui-me').onclick = function (ev) { ev.stopPropagation(); openMe(ev.currentTarget); };
    // Troca de cliente: o mesmo botão do menu lateral passa para o topo (e volta ao sair do layout).
    var cs = document.getElementById('client-switch');
    if (cs) { cs.dataset.uiHome = '1'; document.getElementById('ui-client-slot').appendChild(cs); }
    // Badge das notificações: espelha o do menu lateral.
    var nb = document.getElementById('notifications-badge');
    if (nb) new MutationObserver(syncBadge).observe(nb, { childList: true, characterData: true, subtree: true, attributes: true });
    // Permissões ou itens que aparecem/somem depois do login: refaz o menu.
    var sb = document.querySelector('.sidebar');
    if (sb) new MutationObserver(debounce(function () { if (built) renderNav(); }, 120)).observe(sb, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', debounce(moveInd, 100));
    renderNav();
    startCounters();
  }
  function teardown() {
    if (!built) return;
    built = false;
    var cs = document.getElementById('client-switch');
    var home = document.querySelector('.sidebar .sidebar-section');
    if (cs && home) home.insertBefore(cs, home.firstChild);
    ['.ui-topnav', '.ui-dock'].forEach(function (s) { var e = document.querySelector(s); if (e) e.remove(); });
    closeMenus();
    if (counterObs) { counterObs.disconnect(); counterObs = null; }
  }
  function renderNav() {
    var pills = document.getElementById('ui-pills');
    var dock = document.getElementById('ui-dock');
    if (!pills || !dock) return;
    var items = navItems();
    var byId = {};
    items.forEach(function (i) { byId[i.id] = i; });
    var top = TOP.map(function (id) { return byId[id]; }).filter(Boolean);
    var rest = items.filter(function (i) { return TOP.indexOf(i.id) < 0; });
    // Só refaz quando a lista muda (trocar de tela só move o destaque, com animação).
    var sig = items.map(function (i) { return i.id + ':' + i.label; }).join('|');
    pills._rest = rest;
    if (pills._sig === sig) { sync(); return; }
    pills._sig = sig;
    pills.innerHTML = '<span class="ui-ind" id="ui-ind"></span>' +
      top.map(function (i) { return '<button type="button" class="ui-pill" data-id="' + i.id + '">' + esc(i.label) + '</button>'; }).join('') +
      (rest.length ? '<button type="button" class="ui-pill" data-id="__mais" id="ui-more">Mais <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>' : '');
    pills.querySelectorAll('.ui-pill').forEach(function (b) {
      b.onclick = function (ev) { ev.stopPropagation(); if (b.dataset.id === '__mais') openMore(b, pills._rest || rest); else go(b.dataset.id); };
    });
    var dk = DOCK.map(function (id) { return byId[id]; }).filter(Boolean);
    dock.innerHTML = dk.map(function (i) { return '<button type="button" class="ui-dot" data-id="' + i.id + '" data-tip="' + esc(i.label) + '" aria-label="' + esc(i.label) + '">' + i.icon + '</button>'; }).join('') +
      '<div class="ui-dock-sep"></div><button type="button" class="ui-dot" data-id="conta" data-tip="Conta e aparência" aria-label="Conta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></button>';
    dock.querySelectorAll('.ui-dot').forEach(function (b) { b.onclick = function () { go(b.dataset.id); }; });
    sync();
  }
  function activeId() {
    var a = document.querySelector('.sidebar .nav-item.active');
    return a ? a.id.replace('nav-', '') : '';
  }
  function sync() {
    if (!built) return;
    var id = activeId();
    var inTop = TOP.indexOf(id) >= 0;
    document.querySelectorAll('#ui-pills .ui-pill').forEach(function (b) {
      b.classList.toggle('on', b.dataset.id === id || (!inTop && id && b.dataset.id === '__mais'));
    });
    document.querySelectorAll('#ui-dock .ui-dot').forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); });
    var me = document.getElementById('ui-me');
    var p = window._fb && window._fb.getProfile && window._fb.getProfile();
    if (me && p) me.textContent = initials(p.personName || p.name || p.login || '?');
    syncBadge();
    moveInd();
  }
  function moveInd() {
    var ind = document.getElementById('ui-ind');
    var on = document.querySelector('#ui-pills .ui-pill.on');
    if (!ind) return;
    if (!on) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1';
    ind.style.left = on.offsetLeft + 'px';
    ind.style.width = on.offsetWidth + 'px';
  }
  function syncBadge() {
    var nb = document.getElementById('notifications-badge');
    var ub = document.getElementById('ui-bell-badge');
    if (!nb || !ub) return;
    var n = parseInt(nb.textContent, 10) || 0;
    var vis = nb.style.display !== 'none' && n > 0;
    ub.textContent = n > 99 ? '99+' : String(n);
    ub.style.display = vis ? 'flex' : 'none';
  }
  function initials(n) { return String(n).trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?'; }

  // ---------- Menus suspensos ----------
  function closeMenus() { document.querySelectorAll('.ui-menu').forEach(function (m) { m.remove(); }); }
  function placeMenu(menu, anchor, alignRight) {
    document.body.appendChild(menu);
    var r = anchor.getBoundingClientRect();
    var w = menu.offsetWidth;
    var left = alignRight ? r.right - w : r.left + r.width / 2 - w / 2;
    menu.style.left = Math.max(8, Math.min(left, window.innerWidth - w - 8)) + 'px';
    menu.style.top = (r.bottom + 10) + 'px';
  }
  function openMore(anchor, rest) {
    var had = document.querySelector('.ui-menu.more');
    closeMenus();
    if (had) return;
    var groups = {};
    rest.forEach(function (i) { (groups[i.group] = groups[i.group] || []).push(i); });
    var id = activeId();
    var m = document.createElement('div');
    m.className = 'ui-menu more';
    m.innerHTML = '<div class="ui-menu-cols">' + Object.keys(groups).map(function (g) {
      return '<div><div class="ui-menu-group">' + esc(g) + '</div>' + groups[g].map(function (i) {
        return '<button type="button" class="ui-menu-item' + (i.id === id ? ' on' : '') + '" data-id="' + i.id + '">' + i.icon + esc(i.label) + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    m.querySelectorAll('.ui-menu-item').forEach(function (b) { b.onclick = function () { go(b.dataset.id); }; });
    m.onclick = function (ev) { ev.stopPropagation(); };
    placeMenu(m, anchor, false);
  }
  function openMe(anchor) {
    var had = document.querySelector('.ui-menu.me');
    closeMenus();
    if (had) return;
    var p = (window._fb && window._fb.getProfile && window._fb.getProfile()) || {};
    var admin = typeof window.isAdmin !== 'undefined' ? window.isAdmin : p.role === 'admin';
    var m = document.createElement('div');
    m.className = 'ui-menu me';
    m.innerHTML = '<div style="padding:8px 10px 10px;"><b style="font-size:14px;">' + esc(p.personName || p.name || p.login || '') + '</b><div style="font-size:12px;color:var(--muted);">' + esc(admin ? 'Administrador' : (p.login || '')) + '</div></div>' +
      '<button type="button" class="ui-menu-item" data-a="conta">Minha conta</button>' +
      '<button type="button" class="ui-menu-item" data-a="aparencia">Aparência (layout e fundo)</button>' +
      (admin ? '<button type="button" class="ui-menu-item" data-a="config">Configurar clientes</button>' : '') +
      '<button type="button" class="ui-menu-item" data-a="tema">Alternar claro / escuro</button>' +
      '<button type="button" class="ui-menu-item" data-a="sair" style="color:#EF4444;">Sair</button>';
    m.querySelectorAll('.ui-menu-item').forEach(function (b) {
      b.onclick = function () {
        closeMenus();
        var a = b.dataset.a;
        if (a === 'conta') go('conta');
        else if (a === 'aparencia') { if (window.switchView) window.switchView('conta'); setTimeout(function () { var e = document.getElementById('ui-aparencia'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }
        else if (a === 'config' && window.openConfig) window.openConfig();
        else if (a === 'tema' && window.toggleHuvenTheme) window.toggleHuvenTheme();
        else if (a === 'sair' && window.doLogout) window.doLogout();
      };
    });
    m.onclick = function (ev) { ev.stopPropagation(); };
    placeMenu(m, anchor, true);
  }
  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });

  // ---------- Animações: entrada das telas e números contando ----------
  function animateView() {
    if (!H.classList.contains('ui-anim')) return;
    var views = Array.prototype.slice.call(document.querySelectorAll('.main > .content, .main > [id$="-view"], .main .huv-view, #crm-view'));
    views.filter(function (v) { return v.offsetParent !== null; }).forEach(function (v) {
      v.classList.remove('ui-enter');
      void v.offsetWidth;
      v.classList.add('ui-enter');
      clearTimeout(v._uiT);
      v._uiT = setTimeout(function () { v.classList.remove('ui-enter'); }, 1200);
    });
  }
  var NUM = /(-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?)/;
  function countUp(el) {
    if (!H.classList.contains('ui-anim') || el._uiBusy) return;
    var final = el.textContent;
    if (final === el._uiDone) return;
    var m = final.match(NUM);
    if (!m) { el._uiDone = final; return; }
    var raw = m[1], dec = (raw.split(',')[1] || '').length;
    var target = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!isFinite(target) || Math.abs(target) < 2) { el._uiDone = final; return; }
    var pre = final.slice(0, m.index), post = final.slice(m.index + raw.length);
    var t0 = performance.now(), dur = 900;
    el._uiBusy = true;
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      if (k < 1) {
        el.textContent = pre + (target * e).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
        requestAnimationFrame(step);
      } else {
        el.textContent = final;
        el._uiDone = final;
        el._uiBusy = false;
      }
    })(t0);
  }
  function startCounters() {
    if (counterObs) return;
    var sel = '.metric-value, .huv-stat-value, .rp-kpi b';
    counterObs = new MutationObserver(function (list) {
      var seen = [];
      list.forEach(function (r) {
        var n = r.target.nodeType === 3 ? r.target.parentElement : r.target;
        if (!n || !n.closest) return;
        var el = n.closest(sel);
        if (el && seen.indexOf(el) < 0) seen.push(el);
        if (r.type === 'childList') r.addedNodes.forEach(function (a) { if (a.querySelectorAll) a.querySelectorAll(sel).forEach(function (x) { if (seen.indexOf(x) < 0) seen.push(x); }); });
      });
      seen.forEach(function (el) { if (!el._uiBusy) countUp(el); });
    });
    var main = document.querySelector('.main');
    if (main) counterObs.observe(main, { childList: true, subtree: true, characterData: true });
  }

  // ---------- Ganchos no CRM ----------
  function hook() {
    if (typeof window.switchView === 'function' && !window.switchView._ui) {
      var orig = window.switchView;
      window.switchView = function () {
        var r = orig.apply(this, arguments);
        if (built) { sync(); animateView(); }
        if (arguments[0] === 'conta') renderAparencia();
        return r;
      };
      window.switchView._ui = true;
    }
    if (typeof window.applyViewPermissions === 'function' && !window.applyViewPermissions._ui) {
      var ap = window.applyViewPermissions;
      window.applyViewPermissions = function () { var r = ap.apply(this, arguments); onLogin(); return r; };
      window.applyViewPermissions._ui = true;
    }
  }
  // Depois do login: busca a preferência guardada no servidor (vale em qualquer aparelho).
  function onLogin() {
    if (built) renderNav();
    var p = window._fb && window._fb.getProfile && window._fb.getProfile();
    var uid = p && (p.uid || p.login);
    if (!uid || uid === loadedUid || !window._fb.adminApi) return;
    loadedUid = uid;
    window._fb.adminApi('/ui/prefs', {}).then(function (r) {
      if (r && r.prefs && r.prefs.theme) {
        var np = { theme: r.prefs.theme, bg: r.prefs.bg || 'por-do-sol', calm: !!r.prefs.calm };
        if (JSON.stringify(np) !== JSON.stringify({ theme: prefs.theme, bg: prefs.bg, calm: !!prefs.calm })) { store(np); apply(np); }
      } else if (r && prefs.theme !== 'atual') {
        // Este login nunca escolheu um layout: fica no visual de sempre, mesmo que outra pessoa tenha escolhido outro neste aparelho.
        var def = { theme: 'atual', bg: 'por-do-sol', calm: false };
        store(def); apply(def);
      }
    }).catch(function () {});
  }
  function save(np) {
    store(np);
    apply(np);
    if (window._fb && window._fb.adminApi) window._fb.adminApi('/ui/prefs', { save: true, prefs: np }).catch(function (e) { if (window.showToast) window.showToast('A aparência ficou só neste aparelho: ' + e.message, 'warning'); });
  }

  // ---------- Conta → Aparência ----------
  function renderAparencia() {
    var box = document.getElementById('ui-aparencia');
    if (!box) return;
    var p = prefs;
    var opt = function (id, title, sub) {
      return '<button type="button" class="ui-ap-opt' + (p.theme === id ? ' on' : '') + '" data-theme="' + id + '"><div class="ui-prev ui-prev-' + id + '"><i></i><i></i><i></i><i></i></div><b>' + title + '</b><small>' + sub + '</small></button>';
    };
    var custom = /^https:\/\//.test(p.bg || '');
    box.innerHTML = '<div class="ui-ap"><h3>Aparência</h3><div class="ui-ap-sub">Escolha o layout do CRM. Fica salvo no seu login e vale no computador e no celular.</div>' +
      '<div class="ui-ap-layouts">' + opt('atual', 'Atual', 'Menu lateral, como sempre') + opt('vidro', 'Vidro', 'Fundo com foto, menu no topo e bolinhas') + opt('quente', 'Escuro quente', 'Marrom e laranja, menu no topo') + '</div>' +
      (p.theme === 'vidro' ? '<div class="ui-ap-sub" style="margin-bottom:8px;"><b style="color:var(--text);">Fundo</b> · escolha um ou suba uma foto sua (JPG ou PNG, até 6 MB)</div><div class="ui-ap-bgs">' +
        BGS.map(function (b) { return '<button type="button" class="ui-ap-bg' + (p.bg === b[0] ? ' on' : '') + '" data-bg="' + b[0] + '" style="background-image:url(\'/fundos/' + b[0] + '-mini.jpg\')"><span>' + b[1] + '</span></button>'; }).join('') +
        (custom ? '<button type="button" class="ui-ap-bg on" data-bg="' + esc(p.bg) + '" style="background-image:url(\'' + esc(p.bg) + '\')"><span>Sua foto</span></button>' : '') +
        '<label class="ui-ap-bg ui-ap-up"><input type="file" accept="image/jpeg,image/png,image/webp" id="ui-ap-file" style="display:none;"><b style="font-size:18px;">+</b>Subir foto</label></div>' : '') +
      '<label class="integ-toggle"><input type="checkbox" id="ui-ap-calm"' + (p.calm ? ' checked' : '') + '> Reduzir efeitos (sem desfoque nem animações, para aparelhos mais lentos)</label></div>';
    box.querySelectorAll('.ui-ap-opt').forEach(function (b) { b.onclick = function () { save({ theme: b.dataset.theme, bg: prefs.bg || 'por-do-sol', calm: !!prefs.calm }); }; });
    box.querySelectorAll('.ui-ap-bg[data-bg]').forEach(function (b) { b.onclick = function () { save({ theme: prefs.theme, bg: b.dataset.bg, calm: !!prefs.calm }); }; });
    var calm = document.getElementById('ui-ap-calm');
    if (calm) calm.onchange = function () { save({ theme: prefs.theme, bg: prefs.bg, calm: calm.checked }); };
    var file = document.getElementById('ui-ap-file');
    if (file) file.onchange = function () { upload(file.files[0]); };
  }
  function upload(f) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return window.showToast && window.showToast('Use uma foto JPG, PNG ou WEBP.', 'warning');
    if (f.size > 6 * 1024 * 1024) return window.showToast && window.showToast('A foto passa de 6 MB. Use uma menor.', 'warning');
    var p = (window._fb && window._fb.getProfile && window._fb.getProfile()) || {};
    var act = p.act || (typeof window.flowAct === 'function' && window.flowAct()) || 'act_admin';
    if (window.showToast) window.showToast('Enviando a foto...', 'info');
    window._fb.uploadCampaignMedia(act, f, true).then(function (m) {
      save({ theme: 'vidro', bg: m.url, calm: !!prefs.calm });
      if (window.showToast) window.showToast('Fundo trocado.', 'success');
    }).catch(function (e) { if (window.showToast) window.showToast('Não consegui enviar: ' + e.message, 'error'); });
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  // ---------- Tela de entrar: cartão que inclina acompanhando o mouse ----------
  // Inclinação 3D + reflexo de luz no ponto do cursor + a foto do fundo se mexendo um pouco ao contrário.
  // Só com mouse (no celular não há "passar o mouse") e respeitando quem pediu menos movimento no sistema.
  function setupLoginTilt() {
    var ov = document.getElementById('login-overlay');
    var box = ov && ov.querySelector('.login-box');
    if (!box || ov._uiTilt) return;
    ov._uiTilt = true;
    if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A animação de entrada do cartão segura o "transform"; depois que ela termina, a inclinação assume.
    box.addEventListener('animationend', function (e) { if (e.target === box) box.classList.add('ui-tilt-ready'); });
    setTimeout(function () { box.classList.add('ui-tilt-ready'); }, 1600);
    var raf = 0, px = 0, py = 0;
    var clamp = function (v) { return Math.max(-1, Math.min(1, v)); };
    function update() {
      raf = 0;
      var r = box.getBoundingClientRect();
      if (!r.width) return;
      var x = clamp((px - (r.left + r.width / 2)) / (r.width * 0.75));
      var y = clamp((py - (r.top + r.height / 2)) / (r.height * 0.75));
      box.style.setProperty('--ui-rx', (-y * 8).toFixed(2) + 'deg');
      box.style.setProperty('--ui-ry', (x * 10).toFixed(2) + 'deg');
      box.style.setProperty('--ui-gx', ((px - r.left) / r.width * 100).toFixed(1) + '%');
      box.style.setProperty('--ui-gy', ((py - r.top) / r.height * 100).toFixed(1) + '%');
      ov.style.setProperty('--ui-px', (-x * 14).toFixed(1) + 'px');
      ov.style.setProperty('--ui-py', (-y * 10).toFixed(1) + 'px');
      box.classList.add('ui-tilting');
    }
    ov.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(update); });
    ov.addEventListener('mouseleave', function () {
      ['--ui-rx', '--ui-ry'].forEach(function (k) { box.style.setProperty(k, '0deg'); });
      ov.style.setProperty('--ui-px', '0px'); ov.style.setProperty('--ui-py', '0px');
      box.classList.remove('ui-tilting');
    });
  }

  // ---------- Início ----------
  function boot() {
    hook();
    apply(prefs);
    setupLoginTilt();
    var tries = 0;
    var t = setInterval(function () { hook(); if (++tries > 40 || (window.switchView && window.switchView._ui && window.applyViewPermissions && window.applyViewPermissions._ui)) clearInterval(t); }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.uiLayouts = { apply: save, get: function () { return prefs; } };
})();
