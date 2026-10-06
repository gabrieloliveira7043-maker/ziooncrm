// Tela "Modelos oficiais": modelos de mensagem da API oficial do WhatsApp (criar, ver status, sincronizar, apagar).
// Usa as mesmas rotas do Worker que a janela Conexões → Modelos (/whatsapp/cloud-templates, -create, -delete).
// Botões nos modelos dependem do Worker: a seção só libera quando ele devolver o campo "buttons" nos modelos.
(function () {
  'use strict';

  var st = { act: '', line: '', list: [], filter: 'all', term: '', loading: false };
  var ed = null; // modelo em edição: { mode, name, category, headerType, header, body, footer, examples, buttons, readonly, status }

  var STATUS = {
    APPROVED: ['Aprovado', 'ok'], PENDING: ['Em análise', 'wait'], IN_APPEAL: ['Em recurso', 'wait'],
    REJECTED: ['Rejeitado', 'bad'], PAUSED: ['Pausado', 'wait'], DISABLED: ['Desativado', 'bad']
  };
  var CATEGORIA = { MARKETING: 'Marketing', UTILITY: 'Utilidade', AUTHENTICATION: 'Autenticação' };

  // Modelos prontos em português (seguem as regras da Meta: o texto não começa nem termina com variável).
  var PRONTOS = [
    { titulo: 'Boas-vindas ao lead', cat: 'MARKETING', name: 'boas_vindas_lead', header: '', body: 'Olá, {{1}}! Recebemos o seu contato e ficamos felizes com o seu interesse.\n\nPosso te contar em poucos minutos como funciona e tirar as suas dúvidas por aqui?', footer: 'Responda SAIR para não receber mais mensagens', ex: ['Maria'] },
    { titulo: 'Retomar conversa', cat: 'MARKETING', name: 'retomar_conversa', header: '', body: 'Oi, {{1}}, tudo bem? Passando para saber se ainda faz sentido conversarmos sobre o que você procurava.\n\nSe quiser, te mando as informações agora mesmo.', footer: '', ex: ['João'] },
    { titulo: 'Confirmação de agendamento', cat: 'UTILITY', name: 'confirmacao_agendamento', header: 'Agendamento confirmado', body: 'Olá, {{1}}! O seu horário está confirmado para {{2}}.\n\nSe precisar remarcar, é só responder esta mensagem.', footer: '', ex: ['Maria', 'terça, 14h'] },
    { titulo: 'Lembrete de compromisso', cat: 'UTILITY', name: 'lembrete_compromisso', header: 'Lembrete', body: 'Oi, {{1}}! Lembrando que o seu compromisso é {{2}}.\n\nConseguimos contar com a sua presença?', footer: '', ex: ['Carlos', 'amanhã às 10h'] },
    { titulo: 'Oferta especial', cat: 'MARKETING', name: 'oferta_especial', header: 'Condição especial', body: 'Olá, {{1}}! Separamos uma condição especial válida até {{2}}.\n\nQuer que eu te explique os detalhes?', footer: 'Responda SAIR para não receber mais mensagens', ex: ['Ana', 'sexta-feira'] },
    { titulo: 'Convite para evento', cat: 'MARKETING', name: 'convite_evento', header: 'Você está convidado', body: 'Oi, {{1}}! Vai acontecer o nosso evento {{2}} e queremos muito a sua presença.\n\nPosso reservar a sua vaga?', footer: '', ex: ['Pedro', 'no dia 20/10'] },
    { titulo: 'Pós-venda e avaliação', cat: 'MARKETING', name: 'pos_venda_avaliacao', header: '', body: 'Olá, {{1}}! Obrigado por escolher a gente.\n\nDe 0 a 10, quanto você recomendaria nosso atendimento? A sua opinião ajuda muito.', footer: '', ex: ['Juliana'] },
    { titulo: 'Reativação de cliente', cat: 'MARKETING', name: 'reativacao_cliente', header: '', body: 'Oi, {{1}}, sentimos a sua falta por aqui! Temos novidades que combinam com você.\n\nPosso te mostrar?', footer: 'Responda SAIR para não receber mais mensagens', ex: ['Fernanda'] }
  ];

  function esc(s) { return window.escapeHtml ? window.escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ico(n, s) { return window.uiIco ? window.uiIco(n, s) : ''; }
  function act() { return typeof flowAct === 'function' ? flowAct() : ''; }
  function linhasOficiais(a) { return (typeof waLines === 'function' ? waLines(a) : []).filter(function (l) { return waIsCloud(l.id); }); }
  // O Worker devolve "buttons" nos modelos quando já sabe criar modelos com botões.
  function botoesLiberados() { return st.list.some(function (t) { return Array.isArray(t.buttons); }); }
  function vars(text) { return Math.max(0, Math.max.apply(null, [0].concat((String(text || '').match(/\{\{(\d+)\}\}/g) || []).map(function (m) { return +m.replace(/\D/g, ''); })))); }

  // ---------------- Tela ----------------
  window.renderModelosView = async function () {
    var box = document.getElementById('modelos-body');
    if (!box) return;
    var a = act();
    if (!a) { box.innerHTML = '<div class="integ-empty">Escolha o cliente no topo do menu para ver os modelos da API oficial dele.</div>'; return; }
    if (!WHATSAPP_SETTINGS[a]) { try { Object.assign(WHATSAPP_SETTINGS, await window._fb.getWhatsAppSettings()); } catch (e) {} }
    var linhas = linhasOficiais(a);
    if (st.act !== a) { st.act = a; st.line = ''; st.list = []; }
    if (!linhas.length) {
      box.innerHTML = cabecalho(a, '') + '<div class="integ-empty">Este cliente ainda não tem número na API oficial. Conecte em <b>Conexões → + API oficial</b> e os modelos aparecem aqui.</div>';
      return;
    }
    if (!st.line || !linhas.some(function (l) { return l.id === st.line; })) st.line = linhas[0].id;
    box.innerHTML = cabecalho(a, linhas) + '<div id="mo-lista"><div class="integ-muted">Buscando os modelos na Meta...</div></div>';
    await carregar(false);
  };

  function cabecalho(a, linhas) {
    var sel = linhas && linhas.length > 1
      ? '<select class="field-input mo-linha" onchange="modelosTrocarLinha(this.value)">' + linhas.map(function (l) { return '<option value="' + esc(l.id) + '"' + (l.id === st.line ? ' selected' : '') + '>' + esc(l.label) + '</option>'; }).join('') + '</select>'
      : '';
    return '<div class="huv-header" style="margin-bottom:14px;"><div style="flex:1;min-width:240px;">' +
      '<div class="huv-crumb">' + esc(getClientDisplayName(a) || a) + ' / WhatsApp</div>' +
      '<div class="huv-page-title">Modelos oficiais</div>' +
      '<div class="integ-muted" style="margin-top:6px;max-width:680px;">Mensagens aprovadas pela Meta para começar conversas pela API oficial: 1ª mensagem, campanhas, automações e envios fora da janela de 24 horas.</div></div>' +
      (linhas && linhas.length ? '<div class="huv-actions">' + sel +
        '<button class="huv-btn" onclick="modelosSincronizar()">' + ico('swap', 14) + ' Sincronizar</button>' +
        '<button class="huv-btn primary" onclick="modelosNovo()">+ Novo modelo</button></div>' : '') + '</div>';
  }

  async function carregar(refresh) {
    st.loading = true;
    try { st.list = await cloudTemplatesFor(st.act, st.line, refresh); }
    catch (e) { var el = document.getElementById('mo-lista'); if (el) el.innerHTML = '<div class="integ-error">Não foi possível buscar os modelos: ' + esc(e.message) + '</div>'; st.loading = false; return; }
    st.loading = false;
    lista();
  }

  function lista() {
    var el = document.getElementById('mo-lista');
    if (!el) return;
    var conta = { all: st.list.length, APPROVED: 0, PENDING: 0, REJECTED: 0 };
    st.list.forEach(function (t) { if (conta[t.status] != null) conta[t.status]++; else if (t.status === 'IN_APPEAL') conta.PENDING++; });
    var filtros = [['all', 'Todos'], ['APPROVED', 'Aprovados'], ['PENDING', 'Em análise'], ['REJECTED', 'Rejeitados']];
    var term = st.term.toLowerCase();
    var rows = st.list.filter(function (t) {
      var okF = st.filter === 'all' || t.status === st.filter || (st.filter === 'PENDING' && t.status === 'IN_APPEAL');
      return okF && (!term || (t.name + ' ' + (t.body || '')).toLowerCase().indexOf(term) !== -1);
    });
    el.innerHTML = '<div class="mo-bar"><div class="mo-tabs">' + filtros.map(function (f) {
        return '<button class="chat-pill' + (st.filter === f[0] ? ' active' : '') + '" onclick="modelosFiltro(\'' + f[0] + '\')">' + f[1] + ' <span class="mo-n">' + conta[f[0]] + '</span></button>';
      }).join('') + '</div>' +
      '<input class="field-input mo-busca" id="mo-busca" placeholder="Buscar por nome ou texto" value="' + esc(st.term) + '" oninput="modelosBuscar(this.value)"></div>' +
      (rows.length ? '<div class="mo-tabela"><div class="mo-row mo-head"><span>Nome</span><span>Categoria</span><span>Idioma</span><span>Status</span><span></span></div>' +
        rows.map(function (t) {
          var s = STATUS[t.status] || [t.status || '—', 'wait'];
          return '<div class="mo-row" onclick="modelosAbrir(\'' + escapeJsString(t.name) + '\',\'' + escapeJsString(t.language || '') + '\')">' +
            '<span class="mo-nome"><b>' + esc(t.name) + '</b><small>' + esc(String(t.body || '').slice(0, 90)) + '</small></span>' +
            '<span><span class="mo-cat ' + (t.category === 'MARKETING' ? 'mk' : 'ut') + '">' + esc(CATEGORIA[t.category] || t.category || '') + '</span></span>' +
            '<span class="mo-idioma">' + esc(t.language || '') + '</span>' +
            '<span><span class="mo-st ' + s[1] + '">' + esc(s[0]) + '</span></span>' +
            '<span class="mo-acoes"><button class="mo-ib" title="Apagar modelo" aria-label="Apagar modelo" onclick="event.stopPropagation();modelosApagar(\'' + escapeJsString(t.name) + '\')">' + ico('trash', 15) + '</button></span></div>';
        }).join('') + '</div>'
        : '<div class="integ-empty">' + (st.list.length ? 'Nenhum modelo neste filtro.' : 'Nenhum modelo ainda. Clique em <b>+ Novo modelo</b>: a Meta costuma aprovar em minutos.') + '</div>');
  }

  window.modelosTrocarLinha = function (id) { st.line = id; var el = document.getElementById('mo-lista'); if (el) el.innerHTML = '<div class="integ-muted">Buscando os modelos na Meta...</div>'; carregar(false); };
  window.modelosFiltro = function (f) { st.filter = f; lista(); };
  window.modelosBuscar = function (v) { st.term = v; lista(); var i = document.getElementById('mo-busca'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } };
  window.modelosSincronizar = async function () { var el = document.getElementById('mo-lista'); if (el) el.innerHTML = '<div class="integ-muted">Sincronizando com a Meta...</div>'; await carregar(true); showToast('Modelos sincronizados com a Meta.', 'success'); };
  window.modelosApagar = async function (name) {
    if (!await showConfirm('O modelo "' + name + '" será apagado na Meta (em todos os idiomas). Campanhas e automações que usam esse modelo param de enviar.', 'Apagar modelo', 'Apagar', true)) return;
    try {
      await window._fb.whatsapp('/whatsapp/cloud-template-delete', st.act, { line: st.line, name: name });
      closeHuvenModal();
      showToast('Modelo apagado.', 'success');
      await carregar(true);
    } catch (e) { showToast('Erro ao apagar: ' + e.message, 'error'); }
  };

  // ---------------- Novo modelo: escolha do caminho ----------------
  window.modelosNovo = function () {
    openHuvenModal('Novo modelo', '<div class="mo-escolha">' +
      card('sparkles', 'Usar modelo pronto', 'Comece de um texto já escrito em português e ajuste do seu jeito.', 'modelosProntos()') +
      card('edit', 'Criar do zero', 'Monte o modelo com cabeçalho, texto, rodapé e botões.', 'modelosEditor()') +
      card('swap', 'Sincronizar com a Meta', 'Traga para cá os modelos criados direto no Gerenciador do WhatsApp.', 'closeHuvenModal();modelosSincronizar()') +
      '</div>', 760);
    function card(i, t, d, fn) { return '<button type="button" class="mo-card" onclick="' + fn + '"><span class="mo-card-ico">' + ico(i, 22) + '</span><b>' + t + '</b><span>' + d + '</span></button>'; }
  };

  window.modelosProntos = function () {
    openHuvenModal('Modelos prontos', '<div class="integ-muted" style="margin-bottom:12px;">Escolha um ponto de partida. Você revisa e ajusta antes de enviar para aprovação.</div><div class="mo-prontos">' +
      PRONTOS.map(function (p, i) {
        return '<button type="button" class="mo-pronto" onclick="modelosUsarPronto(' + i + ')"><span class="mo-cat ' + (p.cat === 'MARKETING' ? 'mk' : 'ut') + '">' + CATEGORIA[p.cat] + '</span><b>' + esc(p.titulo) + '</b><span>' + esc(p.body.split('\n')[0]) + '</span></button>';
      }).join('') + '</div>', 760);
  };
  window.modelosUsarPronto = function (i) {
    var p = PRONTOS[i];
    modelosEditor({ name: p.name, category: p.cat, headerType: p.header ? 'TEXT' : 'NONE', header: p.header, body: p.body, footer: p.footer, examples: p.ex.slice(), buttons: [] });
  };

  // Abre um modelo existente só para ver (a Meta não deixa trocar tudo depois de aprovado; dá para duplicar).
  window.modelosAbrir = function (name, language) {
    var t = st.list.find(function (x) { return x.name === name && (x.language || '') === language; });
    if (!t) return;
    modelosEditor({ name: t.name, category: t.category, headerType: t.header ? 'TEXT' : 'NONE', header: t.header || '', body: t.body || '', footer: t.footer || '', examples: [], buttons: Array.isArray(t.buttons) ? t.buttons : [], readonly: true, status: t.status, language: t.language, rejected: t.rejected });
  };

  // ---------------- Editor ----------------
  window.modelosEditor = function (dados) {
    ed = Object.assign({ name: '', category: 'MARKETING', headerType: 'NONE', header: '', body: '', footer: '', examples: [], buttons: [], readonly: false }, dados || {});
    var ro = ed.readonly, dis = ro ? ' disabled' : '';
    var s = ed.status ? (STATUS[ed.status] || [ed.status, 'wait']) : null;
    var linhas = linhasOficiais(st.act);
    var linhaNome = (linhas.find(function (l) { return l.id === st.line; }) || {}).label || '';
    openHuvenModal(ro ? 'Modelo' : 'Novo modelo', '<div class="mo-ed">' +
      '<div class="mo-ed-form">' +
        (s ? '<div class="mo-ed-status"><span class="mo-st ' + s[1] + '">' + esc(s[0]) + '</span>' + (ed.rejected ? '<span class="integ-muted">' + esc(ed.rejected) + '</span>' : '') + '</div>' : '') +
        '<div class="mo-2">' +
          campo('Nome do modelo', '<input class="field-input" id="me-name" maxlength="512" value="' + esc(ed.name) + '" placeholder="boas_vindas_lead" oninput="modelosAtualiza()"' + dis + '><small class="mo-dica">Sem acento; vira minúsculas_com_underline</small>') +
          campo('Idioma', '<input class="field-input" value="Português (BR)" disabled>') +
        '</div><div class="mo-2">' +
          campo('Categoria', '<select class="field-input" id="me-cat"' + dis + '><option value="MARKETING"' + (ed.category === 'MARKETING' ? ' selected' : '') + '>Marketing (ofertas, convites)</option><option value="UTILITY"' + (ed.category === 'UTILITY' ? ' selected' : '') + '>Utilidade (confirmações, avisos)</option></select>') +
          campo('Número', '<input class="field-input" value="' + esc(linhaNome) + '" disabled><small class="mo-dica">O número não muda depois de criado</small>') +
        '</div>' +
        campo('Cabeçalho', '<select class="field-input" id="me-htype" onchange="modelosAtualiza()"' + dis + '><option value="NONE"' + (ed.headerType === 'NONE' ? ' selected' : '') + '>Sem cabeçalho</option><option value="TEXT"' + (ed.headerType === 'TEXT' ? ' selected' : '') + '>Texto</option></select>') +
        '<div id="me-hbox"' + (ed.headerType === 'TEXT' ? '' : ' hidden') + '>' + campo('Texto do cabeçalho', '<input class="field-input" id="me-header" maxlength="60" value="' + esc(ed.header) + '" oninput="modelosAtualiza()"' + dis + '><small class="mo-dica" id="me-hcount"></small>') + '</div>' +
        '<div class="mo-lab-row"><label class="field-label">Corpo da mensagem</label>' + (ro ? '' : '<button type="button" class="chat-pill" onclick="modelosVariavel()">+ Adicionar variável</button>') + '</div>' +
        '<textarea class="field-input mo-body" id="me-body" rows="9" maxlength="1024" placeholder="Olá, {{1}}! ..." oninput="modelosAtualiza()"' + dis + '>' + esc(ed.body) + '</textarea>' +
        '<small class="mo-dica" id="me-bcount"></small>' +
        '<div class="integ-muted mo-regra">Use {{1}}, {{2}}... para o que muda em cada envio, como o nome. A Meta não aceita o texto começando ou terminando com variável.</div>' +
        campo('Rodapé (opcional)', '<input class="field-input" id="me-footer" maxlength="60" value="' + esc(ed.footer) + '" placeholder="Responda SAIR para não receber mais mensagens" oninput="modelosAtualiza()"' + dis + '>') +
      '</div>' +
      '<div class="mo-ed-side">' +
        '<div class="mo-painel"><div class="mo-painel-t">Prévia</div><div class="mo-wa"><div class="mo-bolha" id="me-prev"></div></div></div>' +
        '<div class="mo-painel"><div class="mo-painel-t">Botões <span class="integ-muted">até 3</span>' + (ro ? '' : '<button type="button" class="chat-pill" id="me-addbtn" onclick="modelosAddBotao()">+ Adicionar</button>') + '</div><div id="me-botoes"></div></div>' +
        '<div class="mo-painel"><div class="mo-painel-t">Exemplos das variáveis</div><div id="me-params"></div></div>' +
      '</div></div>' +
      (ro
        ? '<div class="mo-ed-acoes"><button class="huv-btn" style="color:var(--red);" onclick="modelosApagar(\'' + escapeJsString(ed.name) + '\')">' + ico('trash', 14) + ' Apagar</button><span style="flex:1"></span><button class="huv-btn" onclick="modelosDuplicar()">Duplicar como novo</button></div>'
        : '<div class="mo-ed-acoes"><span class="integ-muted" id="me-fb"></span><span style="flex:1"></span><button class="huv-btn" onclick="closeHuvenModal()">Cancelar</button><button class="huv-btn primary" id="me-enviar" onclick="modelosEnviar()">Enviar para aprovação</button></div>'),
      1080);
    modelosAtualiza();
  };
  function campo(rot, html) { return '<div class="mo-campo"><label class="field-label">' + rot + '</label>' + html + '</div>'; }

  window.modelosDuplicar = function () {
    var d = Object.assign({}, ed, { readonly: false, status: null, rejected: null, name: ed.name + '_v2', examples: [] });
    modelosEditor(d);
  };

  function lerForm() {
    if (ed.readonly) return;
    var v = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    ed.name = v('me-name'); ed.category = v('me-cat') || ed.category; ed.headerType = v('me-htype') || 'NONE';
    ed.header = v('me-header'); ed.body = v('me-body'); ed.footer = v('me-footer');
    var ex = document.querySelectorAll('#me-params input');
    if (ex.length) ed.examples = Array.prototype.map.call(ex, function (i) { return i.value; });
    document.querySelectorAll('#me-botoes .mo-bt').forEach(function (row, i) {
      var b = ed.buttons[i]; if (!b) return;
      var q = function (sel) { var el = row.querySelector(sel); return el ? el.value : ''; };
      b.type = q('.mo-bt-tipo') || b.type; b.text = q('.mo-bt-texto'); b.url = q('.mo-bt-url'); b.phone = q('.mo-bt-tel');
    });
  }

  window.modelosAtualiza = function () {
    if (!ed) return;
    lerForm();
    var hbox = document.getElementById('me-hbox'); if (hbox) hbox.hidden = ed.headerType !== 'TEXT';
    var hc = document.getElementById('me-hcount'); if (hc) hc.textContent = (ed.header || '').length + '/60';
    var bc = document.getElementById('me-bcount'); if (bc) bc.textContent = (ed.body || '').length + '/1024';
    // exemplos das variáveis
    var n = vars(ed.body), pbox = document.getElementById('me-params');
    if (pbox) {
      var html = '';
      for (var i = 1; i <= Math.min(n, 10); i++) html += '<label class="mo-param"><code>{{' + i + '}}</code><input class="field-input" value="' + esc(ed.examples[i - 1] || '') + '" placeholder="Ex.: Maria" oninput="modelosPrevia()"' + (ed.readonly ? ' disabled' : '') + '></label>';
      pbox.innerHTML = html || '<div class="integ-muted">Sem variáveis. Use "+ Adicionar variável" para personalizar com o nome, por exemplo.</div>';
    }
    botoes();
    modelosPrevia();
  };

  window.modelosPrevia = function () {
    if (!ed) return;
    var ex = Array.prototype.map.call(document.querySelectorAll('#me-params input'), function (i) { return i.value; });
    if (!ed.readonly) ed.examples = ex;
    var troca = function (t) { return esc(t).replace(/\{\{(\d+)\}\}/g, function (m, k) { var v = ex[k - 1]; return v ? '<b>' + esc(v) + '</b>' : '<span class="mo-var">{{' + k + '}}</span>'; }); };
    var wa = function (h) { return h.replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/_([^_\n]+)_/g, '<i>$1</i>').replace(/\n/g, '<br>'); };
    var prev = document.getElementById('me-prev');
    if (!prev) return;
    prev.innerHTML = (ed.headerType === 'TEXT' && ed.header ? '<div class="mo-b-h">' + troca(ed.header) + '</div>' : '') +
      '<div class="mo-b-c">' + (ed.body ? wa(troca(ed.body)) : '<span class="integ-muted">O texto da mensagem aparece aqui.</span>') + '</div>' +
      (ed.footer ? '<div class="mo-b-f">' + esc(ed.footer) + '</div>' : '') +
      '<div class="mo-b-hora">12:00</div>' +
      (ed.buttons.length ? '<div class="mo-b-bts">' + ed.buttons.map(function (b) { return '<div class="mo-b-bt">' + ico(b.type === 'URL' ? 'link' : b.type === 'PHONE_NUMBER' ? 'phone' : 'swap', 13) + ' ' + esc(b.text || 'Botão') + '</div>'; }).join('') + '</div>' : '');
  };

  window.modelosVariavel = function () {
    var ta = document.getElementById('me-body'); if (!ta) return;
    var n = vars(ta.value) + 1, tag = '{{' + n + '}}';
    var a = ta.selectionStart || ta.value.length, b = ta.selectionEnd || a;
    ta.value = ta.value.slice(0, a) + tag + ta.value.slice(b);
    ta.focus(); ta.setSelectionRange(a + tag.length, a + tag.length);
    modelosAtualiza();
  };

  // ---------------- Botões ----------------
  function botoes() {
    var box = document.getElementById('me-botoes');
    if (!box) return;
    var liberado = botoesLiberados(), add = document.getElementById('me-addbtn');
    if (add) add.disabled = !liberado || ed.buttons.length >= 3;
    if (!liberado && !ed.readonly) {
      box.innerHTML = '<div class="mo-aviso">' + ico('info', 15) + '<span>Os botões (resposta rápida, link e ligar) já estão prontos aqui, mas o servidor do CRM ainda não envia botões para a Meta. Eles ficam disponíveis assim que o Worker for atualizado. Por enquanto, o modelo é criado sem botões.</span></div>';
      return;
    }
    if (!ed.buttons.length) { box.innerHTML = '<div class="integ-muted">' + (ed.readonly ? 'Este modelo não tem botões.' : 'Nenhum botão. Exemplos: "Confirmo minha presença", "Ver no site".') + '</div>'; return; }
    var dis = ed.readonly ? ' disabled' : '';
    box.innerHTML = ed.buttons.map(function (b, i) {
      return '<div class="mo-bt">' +
        '<select class="field-input mo-bt-tipo" onchange="modelosAtualiza()"' + dis + '>' +
          '<option value="QUICK_REPLY"' + (b.type === 'QUICK_REPLY' ? ' selected' : '') + '>Resposta rápida</option>' +
          '<option value="URL"' + (b.type === 'URL' ? ' selected' : '') + '>Abrir site</option>' +
          '<option value="PHONE_NUMBER"' + (b.type === 'PHONE_NUMBER' ? ' selected' : '') + '>Ligar</option></select>' +
        '<input class="field-input mo-bt-texto" maxlength="25" placeholder="Texto do botão (até 25)" value="' + esc(b.text || '') + '" oninput="modelosPrevia();modelosLerBotoes()"' + dis + '>' +
        (b.type === 'URL' ? '<input class="field-input mo-bt-url" placeholder="https://seusite.com.br/pagina" value="' + esc(b.url || '') + '" oninput="modelosLerBotoes()"' + dis + '>' : '') +
        (b.type === 'PHONE_NUMBER' ? '<input class="field-input mo-bt-tel" placeholder="+55 61 99999-9999" value="' + esc(b.phone || '') + '" oninput="modelosLerBotoes()"' + dis + '>' : '') +
        (ed.readonly ? '' : '<button type="button" class="mo-ib" title="Remover botão" aria-label="Remover botão" onclick="modelosRemoveBotao(' + i + ')">' + ico('trash', 14) + '</button>') +
        '</div>';
    }).join('');
  }
  window.modelosLerBotoes = function () { lerForm(); modelosPrevia(); };
  window.modelosAddBotao = function () { lerForm(); if (ed.buttons.length < 3) ed.buttons.push({ type: 'QUICK_REPLY', text: '' }); modelosAtualiza(); };
  window.modelosRemoveBotao = function (i) { lerForm(); ed.buttons.splice(i, 1); modelosAtualiza(); };

  // ---------------- Envio para aprovação ----------------
  window.modelosEnviar = async function () {
    lerForm();
    var fb = document.getElementById('me-fb'), btn = document.getElementById('me-enviar');
    var erro = function (m) { fb.style.color = 'var(--red)'; fb.textContent = m; };
    var nome = String(ed.name || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    var body = String(ed.body || '').trim();
    if (!nome) return erro('Dê um nome ao modelo.');
    if (body.length < 10) return erro('Escreva o texto da mensagem.');
    if (/^\{\{\d+\}\}/.test(body) || /\{\{\d+\}\}$/.test(body)) return erro('O texto não pode começar nem terminar com variável.');
    var n = vars(body);
    for (var i = 0; i < n; i++) if (!String(ed.examples[i] || '').trim()) return erro('Preencha o exemplo da variável {{' + (i + 1) + '}}.');
    var payload = { line: st.line, name: nome, category: ed.category, header: ed.headerType === 'TEXT' ? String(ed.header || '').trim() : '', body: body, footer: String(ed.footer || '').trim(), examples: ed.examples.slice(0, n).map(function (x) { return String(x).trim(); }) };
    if (botoesLiberados() && ed.buttons.length) {
      for (var j = 0; j < ed.buttons.length; j++) {
        var b = ed.buttons[j];
        if (!String(b.text || '').trim()) return erro('Escreva o texto do botão ' + (j + 1) + '.');
        if (b.type === 'URL' && !/^https?:\/\/\S+\.\S+/.test(b.url || '')) return erro('Coloque o link completo do botão ' + (j + 1) + ', começando com https://');
        if (b.type === 'PHONE_NUMBER' && String(b.phone || '').replace(/\D/g, '').length < 10) return erro('Coloque o telefone do botão ' + (j + 1) + ' com DDD.');
      }
      payload.buttons = ed.buttons.map(function (b) {
        return b.type === 'URL' ? { type: 'URL', text: b.text.trim(), url: b.url.trim() }
          : b.type === 'PHONE_NUMBER' ? { type: 'PHONE_NUMBER', text: b.text.trim(), phone: '+' + String(b.phone).replace(/\D/g, '') }
          : { type: 'QUICK_REPLY', text: b.text.trim() };
      });
    }
    btn.disabled = true; fb.style.color = 'var(--muted)'; fb.textContent = 'Enviando para a Meta...';
    try {
      var r = await window._fb.whatsapp('/whatsapp/cloud-template-create', st.act, payload);
      closeHuvenModal();
      showToast('Modelo "' + (r.name || nome) + '" enviado para aprovação. A Meta costuma responder em minutos; use Sincronizar para ver o status.', 'success', 8000);
      st.filter = 'all';
      await carregar(true);
    } catch (e) { btn.disabled = false; erro(e.message); }
  };

  // ---------------- Estilos ----------------
  var css = document.createElement('style');
  css.textContent = [
    '.mo-linha{width:auto;min-width:180px;height:36px}',
    '.mo-painel-t .chat-pill:disabled{opacity:.4;cursor:default}',
    '.mo-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}',
    '.mo-tabs{display:flex;gap:6px;flex-wrap:wrap;flex:1}',
    '.mo-n{opacity:.7;font-variant-numeric:tabular-nums;margin-left:4px}',
    '.mo-busca{max-width:280px;height:36px}',
    '.mo-tabela{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}',
    '.mo-row{display:grid;grid-template-columns:minmax(220px,3fr) 1fr .8fr 1fr 44px;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px}',
    '.mo-row:last-child{border-bottom:none}',
    '.mo-row:not(.mo-head):hover{background:var(--surface2)}',
    '.mo-head{cursor:default;font-size:11.5px;font-weight:600;color:var(--muted);padding:10px 16px}',
    '.mo-nome{display:flex;flex-direction:column;gap:2px;min-width:0}',
    '.mo-nome b{color:var(--text);font-weight:600;overflow-wrap:anywhere}',
    '.mo-nome small{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mo-idioma{color:var(--muted2)}',
    '.mo-cat,.mo-st{display:inline-block;font-size:11.5px;font-weight:600;border-radius:99px;padding:2px 9px;white-space:nowrap}',
    '.mo-cat.mk{background:var(--purple-dim,rgba(167,139,250,.14));color:var(--purple,#A78BFA)}',
    '.mo-cat.ut{background:var(--blue-dim);color:var(--blue)}',
    '.mo-st.ok{background:var(--green-dim);color:var(--green)}',
    '.mo-st.wait{background:var(--amber-dim);color:var(--amber)}',
    '.mo-st.bad{background:var(--red-dim);color:var(--red)}',
    '.mo-acoes{display:flex;justify-content:flex-end}',
    '.mo-ib{width:32px;height:32px;border:none;background:transparent;color:var(--muted);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none}',
    '.mo-ib:hover{background:var(--red-dim);color:var(--red)}',
    '@media(max-width:760px){.mo-row{grid-template-columns:1fr auto;}.mo-row>span:nth-child(2),.mo-row>span:nth-child(3){display:none}.mo-head{display:none}.mo-busca{max-width:none;width:100%}}',
    '.mo-escolha{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
    '.mo-card,.mo-pronto{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:18px;border-radius:12px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font:inherit;cursor:pointer}',
    '.mo-card{align-items:center;text-align:center;padding:24px 16px}',
    '.mo-card:hover,.mo-pronto:hover{border-color:var(--accent)}',
    '.mo-card b,.mo-pronto b{font-size:14px}',
    '.mo-card span:last-child,.mo-pronto>span:last-child{font-size:12.5px;color:var(--muted);line-height:1.45}',
    '.mo-card-ico{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--accent-glow);color:var(--accent2)}',
    '.mo-prontos{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}',
    '@media(max-width:700px){.mo-escolha,.mo-prontos{grid-template-columns:1fr}}',
    '.mo-ed{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}',
    '@media(max-width:860px){.mo-ed{grid-template-columns:1fr}}',
    '.mo-ed-form{display:flex;flex-direction:column;gap:10px;min-width:0}',
    '.mo-ed-status{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
    '.mo-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '@media(max-width:520px){.mo-2{grid-template-columns:1fr}}',
    '.mo-campo{display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.mo-campo .field-input{width:100%;box-sizing:border-box}',
    '.mo-dica{font-size:11.5px;color:var(--muted)}',
    '.mo-lab-row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:2px}',
    '.mo-body{width:100%;box-sizing:border-box;resize:vertical;min-height:170px;line-height:1.5}',
    '.mo-regra{font-size:11.5px}',
    '.mo-ed-side{display:flex;flex-direction:column;gap:12px;min-width:0}',
    '.mo-painel{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}',
    '.mo-painel-t{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--text)}',
    '.mo-painel-t .chat-pill{margin-left:auto}',
    '.mo-wa{background:#E7DED4;border-radius:10px;padding:16px 12px;max-height:360px;overflow:auto}',
    'html[data-theme="dark"] .mo-wa{background:#0B141A}',
    '.mo-bolha{background:#FFFFFF;color:#111B21;border-radius:8px;border-top-left-radius:2px;padding:8px 10px 6px;max-width:300px;font-size:13px;line-height:1.45;box-shadow:0 1px .5px rgba(0,0,0,.13);overflow-wrap:anywhere}',
    'html[data-theme="dark"] .mo-bolha{background:#202C33;color:#E9EDEF}',
    '.mo-b-h{font-weight:700;margin-bottom:4px}',
    '.mo-b-f{font-size:12px;color:#667781;margin-top:6px}',
    '.mo-b-hora{font-size:10.5px;color:#667781;text-align:right;margin-top:2px}',
    '.mo-b-bts{margin:6px -10px -6px;border-top:1px solid rgba(0,0,0,.08)}',
    'html[data-theme="dark"] .mo-b-bts{border-top-color:rgba(255,255,255,.08)}',
    '.mo-b-bt{display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 6px;color:#027EB5;font-weight:600;font-size:13px;border-top:1px solid rgba(0,0,0,.06)}',
    'html[data-theme="dark"] .mo-b-bt{color:#53BDEB;border-top-color:rgba(255,255,255,.06)}',
    '.mo-b-bt:first-child{border-top:none}',
    '.mo-var{background:rgba(2,126,181,.12);color:#027EB5;border-radius:4px;padding:0 3px}',
    '.mo-param{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text)}',
    '.mo-param code{min-width:44px;font-size:12px;color:var(--muted2)}',
    '.mo-param .field-input{flex:1}',
    '.mo-bt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.mo-bt .field-input{flex:1;min-width:120px}',
    '.mo-bt .mo-bt-tipo{flex:0 0 150px}',
    '.mo-aviso{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--muted2);line-height:1.5}',
    '.mo-aviso .ui-ico{margin-top:2px;flex:none;color:var(--amber)}',
    '.mo-ed-acoes{display:flex;gap:8px;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid var(--border);flex-wrap:wrap}'
  ].join('\n');
  document.head.appendChild(css);
})();
