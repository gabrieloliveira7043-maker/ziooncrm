/* Assistente de ajuda do CRM: botão flutuante + conversa com IA.
 *
 * Como funciona:
 *  1. A base de conhecimento (KB abaixo) descreve o sistema inteiro.
 *  2. A cada pergunta, o navegador escolhe os tópicos mais parecidos e manda para o Worker (/ai/help),
 *     que responde com o Workers AI usando só esse material.
 *  3. Se o Worker ainda não tiver a rota, ou estiver fora do ar, o assistente mostra direto os tópicos
 *     da base (modo sem IA), então o botão nunca fica mudo.
 *
 * Para ensinar algo novo ao assistente, edite a lista KB. Não precisa mexer em mais nada.
 */
(function () {
  'use strict';
  if (window.__ajudaIA) return;
  window.__ajudaIA = true;

  var metaApp = document.querySelector('meta[name="application-name"]');
  var MARCA = ((metaApp && metaApp.content) || 'CRM').replace(/\s*CRM\s*$/i, '') || 'CRM';
  var ENDPOINT = '/ai/help';

  /* ------------------------------------------------------------------ */
  /* Base de conhecimento                                                */
  /* t = título, k = palavras-chave extras, x = conteúdo                  */
  /* ------------------------------------------------------------------ */
  var KB = [
    {
      t: 'Visão geral do menu e dos acessos',
      k: 'menu sidebar áreas acesso admin cliente login permissão onde fica',
      x: 'O menu lateral tem estas áreas. Principal: Clientes (só admin), Dashboard e Atendimento. Vendas: Funil, Chat, Contatos, Automações e Prospecção. WhatsApp: Campanhas, Cadência, Conexões e Agente de IA. Redes sociais: Instagram e Postagens. Ajustes: Conversões Meta e Integrações. Depois vêm Conta, Ajuda e, para o admin, Configurar clientes. No topo do menu fica o seletor de cliente: as telas mostram sempre os dados do cliente escolhido. O admin enxerga todos os clientes; o login de cliente enxerga só o dele. Logins extras (equipe do cliente) só abrem as áreas que o responsável liberou; Conta e Ajuda ficam sempre liberadas. Se aparecer "Seu login não tem acesso a esta área", peça a quem administra a conta para liberar a área em Conta > cartão do cliente. Algumas telas (Clientes, Configurar clientes, formulários da Meta em Integrações) são só do admin.'
    },
    {
      t: 'Dashboard (resultados dos anúncios)',
      k: 'dashboard métricas meta anúncios período atualizar relatório resultados investimento custo lead',
      x: 'O Dashboard mostra os resultados dos anúncios do cliente, buscados da Meta. Passo a passo: entre no app, escolha o período nos campos de data, clique em Atualizar para buscar os dados da Meta e use o seletor de Métricas para mostrar ou esconder indicadores. Se não aparecer nada, confira se o cliente tem conta de anúncios cadastrada (Conta > Clientes, ou Configurar clientes) e se o período escolhido tem dados. Trocar a conta de anúncios muda só de onde vêm as métricas; os leads do CRM continuam os mesmos. Para gerar o relatório em PDF, use o botão Relatório PDF no menu: ele monta um PDF com os números do cliente no período selecionado, com a tabela dos melhores anúncios.'
    },
    {
      t: 'Atendimento: tempo de resposta e leads sem resposta',
      k: 'atendimento análise tempo primeiro contato sem resposta equipe expediente analisar mediana espera',
      x: 'Abra Atendimento no menu e clique em Analisar. Escolha o período (De / Até) e, se quiser, marque "Contar só o horário de expediente" definindo o horário (e se o sábado entra). O cartão "Tempo até o 1º contato" mostra a média e a mediana só de quem já foi respondido. O cartão vermelho "Sem resposta da equipe" mostra quantos leads com conversa ninguém respondeu e há quanto tempo o mais antigo espera. "Tempo incluindo quem espera" conta também os leads ainda sem resposta e é o retrato mais fiel do atendimento. A análise olha só as conversas dos leads que chegaram (formulário, landing page, planilha ou mensagem no WhatsApp); conversas de contatos que não viraram card ficam de fora. Quando a equipe responde, o lead sai da lista de sem resposta.'
    },
    {
      t: 'Funil (CRM em colunas): ver, mover e ordenar leads',
      k: 'funil crm kanban coluna etapa card arrastar mover ordenar prioridade filtro renomear mês lead',
      x: 'O Funil mostra os leads em colunas de etapa; cada card é um contato e pode trazer nome, telefone, e-mail, campanha, origem, observações e data de entrada. Para mudar a etapa, arraste o card para outra coluna ou use o botão Mover do card. Arrastar dentro da mesma coluna muda a prioridade/sequência. Também dá para arrastar as colunas para reordená-las e renomear uma coluna. O layout padrão do funil é Novo lead, Em contato, Proposta, Fechado e Perdido; o layout Clínica é Novo lead, Conversando, Não respondeu, Agendou, Compareceu e Fechou (escolhido ao cadastrar o cliente). Há busca e filtros no topo e um filtro por mês. No celular cada coluna tem rolagem própria. Escolha o cliente no seletor do menu antes de mexer no funil.'
    },
    {
      t: 'Botões dentro do card do lead',
      k: 'card botão editar mover histórico hist primeira mensagem 1ª msg remover excluir apagar whatsapp conversa',
      x: 'Em cada card do funil: Editar altera as informações do lead; Mover troca de etapa; Hist. mostra o histórico de mudanças; 1ª msg abre/envia a primeira mensagem no WhatsApp, quando disponível; o botão do WhatsApp abre a conversa no Chat do CRM; X remove o lead do CRM (cuidado: apaga o card).'
    },
    {
      t: 'Novo lead manual, importar e exportar leads',
      k: 'novo lead adicionar manual importar planilha excel exportar baixar backup arquivo csv xlsx',
      x: 'Novo lead manual: na aba Funil clique em Novo lead, preencha os dados principais e salve; ele entra na coluna inicial do cliente selecionado. Importar em lote: no Funil clique em Importar, escolha o arquivo com os leads, confira se os campos principais foram reconhecidos e finalize; os contatos entram no funil. Exportar: use Exportar Excel para baixar uma planilha com os leads do cliente e do período selecionado (serve para conferência, repasse e backup).'
    },
    {
      t: 'Mover vários leads de uma vez e começar automação da coluna',
      k: 'mover em massa vários leads coluna começar automação funil destino selecionar todos',
      x: 'No Funil, clique no botão ⇄ no topo da coluna, marque os leads (ou use "todos"), escolha a coluna ou o funil de destino e confirme: todos mudam de etapa juntos. O botão ▶ Começar da coluna inicia a automação dessa coluna nos leads que já estão nela. Se a coluna ainda não tem automação, aparece o atalho "Criar automação para esta coluna".'
    },
    {
      t: 'Notificações de lead novo',
      k: 'notificação aviso alerta lead novo centro de notificações sino',
      x: 'Quando chegam leads novos, o app mostra um aviso no Funil e no centro de notificações. Mover ou reorganizar cards manualmente não deve gerar alerta de lead novo.'
    },
    {
      t: 'Chat: conversar com os leads pelo WhatsApp',
      k: 'chat conversa mensagem whatsapp enviar áudio imagem vídeo figurinha contato agendar editar apagar nova etiqueta resposta rápida lembrete',
      x: 'No Chat, escolha a conversa à esquerda ou clique em + Nova para falar com um número novo. Dá para enviar texto, imagem, vídeo, áudio, figurinha e cartão de contato, e também editar, apagar e agendar mensagens. As mensagens do lead aparecem na hora e o histórico fica guardado. Há filtros e etiquetas de conversa, respostas rápidas (modelos de texto que você cadastra e reutiliza), emojis e lembretes: um lembrete avisa com "Abrir conversa", "Concluir" ou "Adiar 1 h". Se a conversa ainda não está no funil, o painel de informações tem o botão "Criar lead no funil". Quando a equipe responde, o lead sai da lista de sem resposta do Atendimento. O Chat só funciona com o WhatsApp conectado (veja Conexões).'
    },
    {
      t: 'Contatos: buscar, etiquetar e enviar para o funil',
      k: 'contatos etiqueta tag filtrar origem data selecionar todos lista enviar funil organizar',
      x: 'Em Contatos busque por nome ou telefone e filtre por origem e pela data de entrada. Crie etiquetas em "🏷️ Etiquetas" e marque os contatos para organizar listas. Use "Selecionar todos" para aplicar uma etiqueta ou enviar vários contatos ao funil de uma vez. Escolha o cliente no topo do menu antes de enviar ao funil. As etiquetas também servem para escolher o público das Campanhas.'
    },
    {
      t: 'Automações: criar fluxos que rodam sozinhos',
      k: 'automação fluxo bloco esperar mensagem respondeu mover card gatilho criar com ia pausar versões sorteadas bloqueio follow-up',
      x: 'Em Automações clique em + Nova automação (ou ✨ Criar com IA, que monta um fluxo para você). Passo a passo: 1) escolha a coluna do funil que dispara o fluxo ("quando o lead entrar em…"); 2) monte os blocos arrastando e ligando as saídas; 3) defina o que acontece se o lead responder (parar ou seguir); 4) ligue a automação. Os blocos são: Gatilho (a coluna que dispara; vale para leads novos e para cards movidos para a coluna depois que a automação foi salva), Esperar (minutos, horas ou dias), Mensagem (texto, imagem, vídeo ou áudio; você pode cadastrar várias versões e uma é sorteada a cada envio para evitar bloqueio), Respondeu? (confere se o lead mandou mensagem desde que entrou no fluxo; tem saída Sim e saída Não), Mover card (leva o lead para outra coluna; se essa coluna tiver automação própria, ela começa quando este fluxo terminar) e Agente de IA (a IA assume a conversa; encerra o fluxo, sem saída). Acompanhe quantos leads estão no fluxo e pause quando quiser. O CRM já protege o número contra bloqueio com intervalos seguros. Para iniciar a automação em leads que já estão numa coluna, use o ▶ Começar da coluna no Funil.'
    },
    {
      t: 'Primeira mensagem automática para leads novos',
      k: 'primeira mensagem automática lead novo variáveis primeiro_nome nome rede_social origem versões ativar whatsapp boas-vindas',
      x: 'Abra Conexões e vá em Primeira mensagem. Cadastre várias versões do texto: a cada envio uma é sorteada, o que ajuda a evitar bloqueio. Variáveis disponíveis: {primeiro_nome}, {nome}, {rede_social} e {origem}. Salve. Vale para todo lead novo que chegar com WhatsApp ativo. A mensagem automática precisa estar ativada para o cliente (se aparecer "desativada", o admin ativa). Isso só funciona com o WhatsApp conectado.'
    },
    {
      t: 'Conectar o WhatsApp (QR Code) e outros números',
      k: 'whatsapp conectar qr code aparelhos conectados desconectou caiu conexão número linha api oficial fora do ar',
      x: 'Abra Conexões e clique em conectar. Leia o QR Code com o WhatsApp do celular (WhatsApp > Aparelhos conectados > Conectar um aparelho). Quando aparecer "conectado", o Chat, as automações e as campanhas já funcionam. Se a conexão cair, repita a leitura do QR Code. É possível conectar mais de um número ("+ Conectar outro WhatsApp") e, quando o cliente usa a API oficial do WhatsApp, ela aparece com a marca "API oficial". Se aparecer "Servidor do WhatsApp fora do ar", o problema é no servidor, não no seu celular: aguarde alguns minutos e, se continuar, avise o suporte. Dica: mantenha o celular com internet e não desconecte o aparelho manualmente.'
    },
    {
      t: 'Prospecção: achar empresas e levar para o funil',
      k: 'prospecção prospectar empresas cnpj cnae receita federal estado cidade bairro porte telefone celular email matriz enviar funil',
      x: 'Em Prospecção escolha Estado, Atividade (CNAE), cidade, bairro e porte. Marque "só com telefone", "só celular", "só com e-mail" ou "só matriz" e clique em Buscar empresas. Selecione as empresas (de 100 a 500 de uma vez) e envie ao funil. Empresas repetidas (mesmo CNPJ ou telefone) não entram duas vezes. Para uma empresa específica, use a aba "CNPJ ou nome". A base é de empresas ativas da Receita Federal e é atualizada por mês.'
    },
    {
      t: 'Campanhas: disparos de WhatsApp em lista',
      k: 'campanha disparo lista massa envio mensagem pausar retomar público etiqueta resposta',
      x: 'Em Campanhas clique em + Nova campanha, escolha a lista de contatos (dá para filtrar por etiquetas) e escreva a mensagem. O envio sai aos poucos, no ritmo seguro do número, e você acompanha o andamento (enviadas, respondidas, sem resposta). Pause ou retome quando precisar. Se o cliente usa a API oficial do WhatsApp, a campanha usa modelos de mensagem aprovados, com variáveis do tipo {{1}}.'
    },
    {
      t: 'Cadência: mensagens programadas em grupos',
      k: 'cadência grupo programar envio agendar dia hora semana grupos whatsapp',
      x: 'Em Cadência clique em + Programar envio, escolha o grupo do WhatsApp e o conteúdo (texto, imagem, vídeo ou áudio), defina o dia e a hora. O CRM envia sozinho no horário. Há visão em semana e em lista para acompanhar o que está programado.'
    },
    {
      t: 'Receber leads dos anúncios do Facebook/Instagram (formulários)',
      k: 'facebook meta formulário lead ads conectar páginas leadgen anúncio receber leads automático',
      x: 'Em Conexões, na caixa "Facebook e formulários de anúncio", clique em Conectar Facebook, entre com o seu login do Facebook e autorize. Marque as páginas que são desta empresa e clique em Ligar selecionadas. Escolha a coluna onde o lead entra e quais formulários valem. Quem preencher cai direto no funil, em segundos, sem planilha. Para parar de receber, use Pausar ou Desconectar. O cliente faz isso sozinho na tela Conexões. O administrador também pode ligar páginas em Integrações > Formulários da Meta (configuração técnica única com app, webhook e token).'
    },
    {
      t: 'Integrações: formulário de landing page e planilhas',
      k: 'integração landing page lp formulário html endereço webhook planilha apps script sheets código inbound',
      x: 'Em Integrações > Formulários de landing page, cada integração gera um endereço exclusivo. O formulário da LP envia os dados para ele e o lead cai direto no funil do cliente, com a 1ª mensagem do WhatsApp se estiver ligada. Clique em "+ Nova integração" para criar o endereço e o código prontos. Há três opções de código: "Formulário HTML pronto", "Formulário que já existe" (um trecho para colar antes de </body> na LP) e "Teste técnico". A integração antiga por planilhas com Apps Script continua funcionando durante a migração: depois de ligar a página do cliente na aba Formulários da Meta e testar, mude a coluna ativo do cliente para NÃO na planilha de configuração para o mesmo lead não entrar duas vezes. Esta área é do admin.'
    },
    {
      t: 'Agente de IA (atendente no WhatsApp)',
      k: 'agente ia inteligência artificial atendente responde qualifica agenda call regras horário conversa teste bloco',
      x: 'Em Agente de IA (escolha o cliente no menu) clique em "+ Configurar agente" para dizer quem ele é, o que sabe sobre a empresa e como deve conduzir a conversa. O agente responde os leads no WhatsApp com as regras do cliente, qualifica a conversa, passa para a equipe e marca a call na agenda. A tela mostra leads atendidos, calls marcadas e o horário de funcionamento; o botão "💬 Conversa teste" deixa você testar as respostas antes de ligar de verdade. Também dá para usar o bloco Agente de IA dentro de uma Automação: a partir dali a IA assume a conversa (se o lead responder antes de o fluxo chegar no bloco, a IA assume na hora).'
    },
    {
      t: 'Instagram (mensagens viram cards no funil)',
      k: 'instagram direct dm mensagem conectar permissões login conta card funil',
      x: 'Em Instagram (escolha o cliente no menu) conecte o login do Instagram do cliente e marque todas as permissões pedidas, principalmente as de mensagens. A tela avisa "Permissões de mensagens ok" ou lista o que falta; se faltar, conecte a conta de novo e marque tudo. Depois de conectado, cada pessoa nova que falar com a conta vira um card no funil.'
    },
    {
      t: 'Postagens (planejamento de posts)',
      k: 'postagens posts planejar calendário redes sociais conteúdo',
      x: 'A área Postagens, em Redes sociais, serve para planejar as postagens do cliente. Escolha o cliente no topo do menu antes de usar.'
    },
    {
      t: 'Conversões Meta (API de Conversões / pixel)',
      k: 'conversões meta capi pixel api conversões evento compra lead qualificado token código de teste otimizar anúncios',
      x: 'Em Conversões Meta (Ajustes) você avisa a Meta quando o lead avança no funil (compra, lead qualificado, agendamento), para ela otimizar os anúncios para quem realmente fecha. Passo a passo: 1) escolha o cliente; 2) em "Conexão com o pixel" ligue "Enviar eventos para a Meta" e preencha o ID do pixel (conjunto de dados) e o Token de acesso da API de Conversões, que ficam no Gerenciador de Eventos da Meta (escolha o pixel > Configurações > API de Conversões > Gerar token de acesso); o Código de teste (opcional) fica na aba Testar eventos; 3) salve (o token é guardado só no servidor e não aparece de novo); 4) use "Enviar evento de teste" (Lead ou Purchase) para conferir na aba Testar eventos da Meta, sem entrar nos dados reais; 5) em "Eventos por coluna" clique em + Adicionar evento e escolha qual evento sai quando o lead chegar em cada coluna. O evento sai uma única vez, com o valor do card e os dados do cliente criptografados. Para Compra, deixe "Só com valor" ligado: se o card ainda não tem valor, o envio espera. Os envios são feitos a cada minuto e a lista "Últimos envios" mostra o que saiu.'
    },
    {
      t: 'Conta: trocar senha e logins extras da equipe',
      k: 'conta senha trocar alterar login extra equipe acesso áreas novo login excluir permissão',
      x: 'Em Conta você altera a senha de acesso (senha atual, nova senha e confirmação). Para dar acesso à equipe do cliente: em Conta, no cartão do cliente, clique em + Novo login, informe o nome da pessoa, o login e a senha, e marque as áreas que esse login pode abrir (Conta e Ajuda ficam sempre liberadas). Depois é possível mudar os acessos, trocar a senha ou excluir o login; a mudança vale no próximo acesso da pessoa. Todos os logins do cliente enxergam os mesmos leads. Em Conta > Clientes (admin) dá para editar o nome e a conta de anúncios de cada cliente ou definir nova senha.'
    },
    {
      t: 'Configurar clientes (somente admin)',
      k: 'configurar clientes novo cliente cadastrar layout padrão clínica excluir cliente admin login senha conta de anúncios',
      x: 'Em Configurar clientes (admin) cadastre um novo cliente: nome, login (sem espaços), senha, conta de anúncios (opcional) e o layout do CRM (Padrão: Novo lead, Em contato, Proposta, Fechado, Perdido; ou Clínica: Novo lead, Conversando, Não respondeu, Agendou, Compareceu, Fechou). O cliente aparece no menu lateral e ganha login próprio. Em "Clientes adicionados" você vê os cadastrados. Atenção: Excluir apaga login, leads, conversas e conexões do cliente, e não dá para desfazer. A tela Clientes (admin) mostra o painel de cada cliente: leads no mês, negociando, fechados, e se o WhatsApp está conectado.'
    },
    {
      t: 'Usar no celular e instalar como app',
      k: 'celular mobile app instalar pwa barra inferior ipad tablet atualizar versão antiga',
      x: 'No celular a barra inferior tem Funil, Chat, Contatos, Campanhas e "Mais", que abre as demais áreas (Dashboard, Atendimento, Automações, Prospecção, Agente de IA, Conexões, Conta, Ajuda etc.). No Funil, role a página para escolher a coluna e role dentro da coluna para achar os leads. Dá para instalar como app: no navegador use "Adicionar à tela inicial". Se o app parecer com uma versão antiga, feche e abra de novo ou atualize a página.'
    },
    {
      t: 'Problemas comuns e o que fazer',
      k: 'problema erro não funciona não aparece sumiu lead duplicado whatsapp caiu sem dados acesso negado ajuda suporte travou',
      x: 'Lead não apareceu: confira se o cliente certo está selecionado no menu, se o filtro de mês/busca do Funil não está escondendo, e se a conexão com o Facebook/formulário está ativa em Conexões. Mensagens não saem: veja em Conexões se o WhatsApp está "conectado"; se não, leia o QR Code de novo. Dashboard vazio: clique em Atualizar, confira o período e a conta de anúncios do cliente. "Seu login não tem acesso": a área não foi liberada para esse login. Empresas duplicadas na Prospecção não entram duas vezes (mesmo CNPJ ou telefone). Se nada resolver, descreva o que aparece na tela ao suporte; anote o cliente, a tela e a mensagem de erro.'
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Busca simples dentro da base                                         */
  /* ------------------------------------------------------------------ */
  var STOP = {};
  ('a o as os um uma de do da dos das em no na nos nas por para com sem que qual quais como onde quando e ou se eu meu minha meus ' +
   'minhas voce você vc pra pro ao aos ja já mais muito mas é ser esta está isso essa esse tem ter fazer faço posso pode quero ' +
   'preciso gostaria sobre favor ajuda ajudar').split(' ').forEach(function (w) { STOP[w] = 1; });

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function tokens(s) {
    return norm(s).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && !STOP[w]; });
  }
  var INDEX = KB.map(function (e) {
    return { e: e, title: tokens(e.t), kw: tokens(e.k), body: norm(e.x) };
  });

  function search(question, n) {
    var qs = tokens(question);
    if (!qs.length) return [];
    var scored = INDEX.map(function (it) {
      var s = 0;
      qs.forEach(function (w) {
        var stem = w.length > 5 ? w.slice(0, w.length - 1) : w;
        if (it.title.some(function (t) { return t.indexOf(stem) === 0 || stem.indexOf(t) === 0; })) s += 5;
        if (it.kw.some(function (t) { return t.indexOf(stem) === 0 || stem.indexOf(t) === 0; })) s += 3;
        if (it.body.indexOf(stem) !== -1) s += 1;
      });
      return { e: it.e, s: s };
    }).filter(function (r) { return r.s > 0; });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, n || 4).map(function (r) { return r.e; });
  }

  function brand(s) { return String(s).replace(/\{\{MARCA\}\}/g, MARCA); }

  /* ------------------------------------------------------------------ */
  /* Interface                                                            */
  /* ------------------------------------------------------------------ */
  var CSS = '' +
    '#aj-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;' +
    'background:var(--btn-bg,#111);color:var(--btn-text,#fff);box-shadow:0 6px 22px rgba(0,0,0,.28);display:none;align-items:center;justify-content:center;transition:transform .15s}' +
    '#aj-fab:hover{transform:scale(1.07)}#aj-fab:focus-visible{outline:3px solid #6aa7ff;outline-offset:2px}' +
    '#aj-fab svg{width:26px;height:26px}' +
    '#aj-panel{position:fixed;right:20px;bottom:90px;z-index:2147483000;width:380px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 110px);' +
    'display:none;flex-direction:column;background:var(--surface,#fff);color:var(--text,#111);border:1px solid var(--border2,#d8d8d8);border-radius:16px;' +
    'box-shadow:0 14px 48px rgba(0,0,0,.3);overflow:hidden;font-family:inherit}' +
    '#aj-panel.open{display:flex}' +
    '#aj-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border2,#e3e3e3)}' +
    '#aj-head b{font-size:14.5px;flex:1}#aj-head small{display:block;font-weight:400;opacity:.65;font-size:11.5px;margin-top:2px}' +
    '#aj-head button{background:none;border:0;color:inherit;cursor:pointer;font-size:20px;line-height:1;padding:4px 8px;border-radius:8px;opacity:.7}' +
    '#aj-head button:hover{opacity:1;background:rgba(127,127,127,.15)}' +
    '#aj-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:13.5px;line-height:1.5}' +
    '.aj-m{max-width:88%;padding:10px 12px;border-radius:14px;word-wrap:break-word;overflow-wrap:anywhere}' +
    '.aj-m.bot{align-self:flex-start;background:rgba(127,127,127,.14);border-bottom-left-radius:4px}' +
    '.aj-m.me{align-self:flex-end;background:var(--btn-bg,#111);color:var(--btn-text,#fff);border-bottom-right-radius:4px}' +
    '.aj-m p{margin:0 0 6px}.aj-m p:last-child{margin:0}.aj-m ul,.aj-m ol{margin:4px 0 6px;padding-left:20px}.aj-m li{margin:2px 0}' +
    '.aj-note{font-size:11.5px;opacity:.7;margin-top:6px}' +
    '.aj-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}' +
    '.aj-chip{border:1px solid var(--border2,#d0d0d0);background:transparent;color:inherit;border-radius:999px;padding:6px 11px;font-size:12px;cursor:pointer}' +
    '.aj-chip:hover{background:rgba(127,127,127,.15)}' +
    '#aj-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--border2,#e3e3e3);align-items:flex-end}' +
    '#aj-in{flex:1;resize:none;max-height:96px;min-height:38px;border:1px solid var(--border2,#d0d0d0);background:transparent;color:inherit;border-radius:12px;padding:9px 11px;font:inherit;font-size:13.5px}' +
    '#aj-in:focus{outline:2px solid #6aa7ff;outline-offset:0}' +
    '#aj-send{border:0;border-radius:12px;padding:0 14px;height:38px;cursor:pointer;background:var(--btn-bg,#111);color:var(--btn-text,#fff);font-weight:700;font-size:13px}' +
    '#aj-send:disabled{opacity:.5;cursor:default}' +
    '.aj-dots span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:currentColor;opacity:.4;animation:ajb 1s infinite}' +
    '.aj-dots span:nth-child(2){animation-delay:.15s}.aj-dots span:nth-child(3){animation-delay:.3s}' +
    '@keyframes ajb{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-4px);opacity:.9}}' +
    '@media(max-width:768px){#aj-fab{right:14px;bottom:84px;width:52px;height:52px}#aj-panel{right:8px;left:8px;width:auto;bottom:146px;height:auto;max-height:calc(100vh - 170px);top:auto;min-height:340px}}' +
    '@media print{#aj-fab,#aj-panel{display:none!important}}';

  var SUGGESTIONS = [
    'Como conecto o WhatsApp?',
    'Como crio uma automação?',
    'Como dou acesso para a equipe do cliente?',
    'Como receber leads do Facebook?'
  ];

  var fab, panel, msgs, input, sendBtn, chipsBox;
  var history = []; // {role, content}
  var busy = false;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Markdown mínimo e seguro: escapa tudo e só depois aplica negrito, listas e quebras de linha.
  function md(text) {
    var lines = esc(text).split(/\r?\n/);
    var out = [], list = null;
    function close() { if (list) { out.push('</' + list + '>'); list = null; } }
    lines.forEach(function (ln) {
      var li = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/.exec(ln);
      if (li) {
        var type = li[1] ? 'ol' : 'ul';
        if (list !== type) { close(); out.push('<' + type + '>'); list = type; }
        out.push('<li>' + inline(li[2]) + '</li>');
      } else if (!ln.trim()) { close(); }
      else { close(); out.push('<p>' + inline(ln) + '</p>'); }
    });
    close();
    return out.join('');
  }
  function inline(s) { return s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }

  function addMsg(role, html) {
    var m = el('div', { 'class': 'aj-m ' + (role === 'me' ? 'me' : 'bot') }, html);
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  }

  function currentView() {
    var a = document.querySelector('.nav-item.active');
    return a && a.id ? a.id.replace(/^nav-/, '') : '';
  }
  function userRole() {
    var r = document.getElementById('sidebar-user-role');
    var t = r ? r.textContent.trim() : '';
    return !t ? '' : /^admin/i.test(t) ? 'admin' : 'cliente';
  }

  function offlineAnswer(question, why) {
    var found = search(question, 2);
    if (!found.length) {
      return '<p>Não achei esse assunto na minha base. Tente usar outras palavras (por exemplo: <b>WhatsApp</b>, <b>automação</b>, <b>funil</b>, <b>importar</b>) ou abra a página <b>Ajuda</b> no menu.</p>' +
        (why ? '<div class="aj-note">' + esc(why) + '</div>' : '');
    }
    var html = found.map(function (e) {
      return '<p><b>' + esc(e.t) + '</b></p><p>' + esc(brand(e.x)) + '</p>';
    }).join('');
    return html + '<div class="aj-note">' + esc(why || 'Resposta direta da base de ajuda.') + '</div>';
  }

  async function ask(question) {
    var related = search(question + ' ' + history.slice(-2).map(function (h) { return h.content; }).join(' '), 5);
    var context = related.map(function (e) { return '## ' + e.t + '\n' + brand(e.x); }).join('\n\n');
    var index = KB.map(function (e) { return '- ' + e.t; }).join('\n');
    var fb = window._fb;
    if (!fb || typeof fb.adminApi !== 'function') throw new Error('sem-api');
    var r = await fb.adminApi(ENDPOINT, {
      question: question,
      history: history.slice(-8),
      context: context,
      index: index,
      brand: MARCA,
      view: currentView(),
      role: userRole()
    });
    var reply = r && (r.reply || r.text || r.response);
    if (!reply) throw new Error('vazio');
    return String(reply);
  }

  async function submit(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    if (chipsBox) { chipsBox.style.display = 'none'; }
    addMsg('me', esc(text));
    var typing = addMsg('bot', '<span class="aj-dots"><span></span><span></span><span></span></span>');
    input.value = ''; input.style.height = 'auto';
    var htmlOut;
    try {
      var reply = await ask(text);
      htmlOut = md(reply);
      history.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
    } catch (e) {
      var msg = String((e && e.message) || e || '');
      var why = /sem-api|n[ãa]o autenticado/i.test(msg) ? 'Entre no sistema para falar com a IA.'
        : 'A IA não respondeu agora; mostrei direto o que está na base de ajuda.';
      htmlOut = offlineAnswer(text, why);
      history.push({ role: 'user', content: text });
    }
    typing.innerHTML = htmlOut;
    msgs.scrollTop = msgs.scrollHeight;
    busy = false; sendBtn.disabled = false;
    input.focus();
  }

  function open() {
    panel.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() {
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  function build() {
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);

    fab = el('button', {
      id: 'aj-fab', type: 'button', 'aria-label': 'Abrir assistente de ajuda', 'aria-expanded': 'false', title: 'Tire dúvidas com a IA'
    }, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
       '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"/>' +
       '<path d="M9.2 9.4a2.8 2.8 0 1 1 3.9 2.6c-.7.4-1.1.8-1.1 1.6M12 16.6h.01"/></svg>');

    panel = el('div', { id: 'aj-panel', role: 'dialog', 'aria-label': 'Assistente de ajuda' });
    var head = el('div', { id: 'aj-head' }, '<b>Assistente ' + esc(MARCA) + '<small>Tire dúvidas sobre como usar e configurar o sistema</small></b>');
    var closeBtn = el('button', { type: 'button', 'aria-label': 'Fechar' }, '×');
    head.appendChild(closeBtn);
    msgs = el('div', { id: 'aj-msgs', 'aria-live': 'polite' });
    chipsBox = el('div', { 'class': 'aj-chips' });
    SUGGESTIONS.forEach(function (s) {
      var c = el('button', { type: 'button', 'class': 'aj-chip' }); c.textContent = s;
      c.addEventListener('click', function () { submit(s); });
      chipsBox.appendChild(c);
    });
    var form = el('form', { id: 'aj-form' });
    input = el('textarea', { id: 'aj-in', rows: '1', placeholder: 'Escreva sua dúvida...', 'aria-label': 'Sua dúvida', maxlength: '600' });
    sendBtn = el('button', { id: 'aj-send', type: 'submit' }, 'Enviar');
    form.appendChild(input); form.appendChild(sendBtn);
    panel.appendChild(head); panel.appendChild(msgs); panel.appendChild(chipsBox); panel.appendChild(form);
    document.body.appendChild(fab); document.body.appendChild(panel);

    addMsg('bot', '<p>Oi! Eu sei como o ' + esc(MARCA) + ' funciona por dentro. Pergunte como <b>criar</b>, <b>configurar</b> ou <b>alterar</b> qualquer coisa: funil, WhatsApp, automações, anúncios, acessos...</p>');

    fab.addEventListener('click', function () { panel.classList.contains('open') ? close() : open(); });
    closeBtn.addEventListener('click', close);
    form.addEventListener('submit', function (ev) { ev.preventDefault(); submit(input.value); });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); submit(input.value); }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 96) + 'px';
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && panel.classList.contains('open')) close();
    });
  }

  // O botão só aparece com o usuário dentro do sistema: tela de login fechada e menu já preenchido.
  function syncVisibility() {
    var login = document.getElementById('login-overlay');
    var loginOpen = !!login && getComputedStyle(login).display !== 'none';
    var side = document.querySelector('.sidebar');
    var sideOn = !!side && side.getClientRects().length > 0;
    var logged = sideOn && !loginOpen && userRole() !== '';
    fab.style.display = logged ? 'flex' : 'none';
    if (!logged && panel.classList.contains('open')) panel.classList.remove('open');
  }

  function start() {
    build();
    syncVisibility();
    setInterval(syncVisibility, 1200);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  // Para testes e ajustes manuais pelo console.
  window.__ajudaIA = { kb: KB, search: search, ask: submit };
})();
