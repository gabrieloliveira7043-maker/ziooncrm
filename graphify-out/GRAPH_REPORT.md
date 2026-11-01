# Graph Report - crm-src  (2026-11-01)

## Corpus Check
- 12 files · ~147,456 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1568 nodes · 5013 edges · 85 communities (72 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Núcleo do app (estado e Meta)
- Campanhas de WhatsApp
- Automações e fluxos
- Cadência
- Login e permissões de tela
- Dashboard e relatório PDF
- Chat: figurinhas e agendadas
- Contatos e etiquetas
- Firebase (banco e login)
- Layouts (vidro, topo, bolinhas)
- Firebase: gravações
- Prospecção (busca de empresas)
- IA: textos e chamadas
- Fluxos da API oficial e alertas
- Resumo de IA e mídias
- Colunas e etapas do funil
- Chat: marcações e mídias
- Leads: importação e novos
- Agente de IA
- Ações de cancelar e excluir
- Notificações e lembretes
- Importação: mapeamento
- Atendentes e linhas do chat
- Chat: contato e lead
- Kanban: mover e auditoria
- Chat: menu da mensagem
- Ajuda com IA
- Variações de IA e MQL em massa
- Chat: cartões e textos
- Chat: lista e filtros
- Integrações (Meta, MCP, entrada)
- Admin: logins e senhas
- Funil: período e rolagem
- Análise e ajustes do WhatsApp
- Ações em massa no funil
- Chips dos cards e rascunhos
- Público e filtros de leads
- Calendário
- Sublogins
- Modelos (API oficial)
- Abrir conversas
- Assistente de cadência em massa
- Postagens: editor
- Prospecção: cidade e CNAE
- Modal do lead e datas
- Modelos da API oficial
- Métricas de atendimento
- Funis e etapas personalizadas
- Conexão do WhatsApp (QR)
- Regras de clientes antigos
- Filtro MQL
- Avisos em pop-up
- Primeira mensagem
- Integração Google Sheets
- Alerta de WhatsApp caído
- Arrastar cards
- Painel de avisos (admin)
- Lista da cadência
- Postagens: calendário
- Métricas visíveis do dashboard
- Notificações push
- Cores do CRM
- Leitura de leads
- Captura automática
- Conversões Meta (CAPI)
- Fluxo da API: resumo
- Prévia da campanha
- Excluir cadência
- Respostas rápidas
- Gráfico do dashboard
- Leitura de arquivos
- Peso dos fluxos
- Origem de campanha (Adriana)
- Tema claro/escuro
- Formatação de números
- Rascunho de cadência
- Troca de cliente
- Regras de captura
- Valor de venda

## God Nodes (most connected - your core abstractions)
1. `escapeHtml()` - 238 edges
2. `showToast()` - 222 edges
3. `escapeJsString()` - 83 edges
4. `normalizeActValue()` - 77 edges
5. `renderKanban()` - 70 edges
6. `flowAct()` - 61 edges
7. `getStages()` - 58 edges
8. `showConfirm()` - 55 edges
9. `openHuvenModal()` - 51 edges
10. `switchView()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `renderFunilChart()` --indirect_call--> `leadVisibleToMe()`  [INFERRED]
  index-script-05.js → index-script-05.js  _Bridges community 17 → community 36_
- `renderIntegLp()` --indirect_call--> `pipelinesReady()`  [INFERRED]
  index-script-05.js → index-script-05.js  _Bridges community 30 → community 19_
- `normalizeImportedLeadsFields()` --indirect_call--> `normalizeImportedLeadFields()`  [INFERRED]
  index-script-05.js → index-script-05.js  _Bridges community 49 → community 17_
- `openCampaignEditor()` --indirect_call--> `leadMonthKey()`  [INFERRED]
  index-script-05.js → index-script-05.js  _Bridges community 36 → community 1_
- `openCampaignEditor()` --indirect_call--> `campaignResumeSave()`  [INFERRED]
  index-script-05.js → index-script-05.js  _Bridges community 1 → community 3_

## Import Cycles
- None detected.

## Communities (85 total, 13 thin omitted)

### Community 0 - "Núcleo do app (estado e Meta)"
Cohesion: 0.01
Nodes (152): AD_ACCOUNT_STATUS, AD_ACCOUNTS, adStatusCache, adThumbnailCache, AI_AGENT_DEFAULTS, AI_TEMP, AI_TONES, _aiGcal (+144 more)

### Community 1 - "Campanhas de WhatsApp"
Cohesion: 0.06
Nodes (66): applyCampaignCopy(), campaignAct(), campaignDispatchHtml(), campaignResumeOpen(), campChosenLines(), campCloudLines(), campInitialMode(), campLinesOfMode() (+58 more)

### Community 2 - "Automações e fluxos"
Cohesion: 0.06
Nodes (61): activateCloudFlow(), addAutomationStep(), addAutomationVariation(), addCcStep(), addFlowNode(), aiFlowNodeCopy(), aiFlowToGraph(), applyFlowView() (+53 more)

### Community 3 - "Cadência"
Cohesion: 0.06
Nodes (51): activateCadenceDraft(), activateCadenceIds(), addCadencePollOption(), askCadenceStart(), buildCadenceEventMessages(), cadenceAct(), cadenceLeadName(), cadenceMentionLoad() (+43 more)

### Community 4 - "Login e permissões de tela"
Cohesion: 0.08
Nodes (49): applyProfileLocally(), applyViewPermissions(), closeClientSwitcher(), closeConfig(), doLogin(), ensureAdminClientSidebar(), filterHelpCards(), firstAllowedView() (+41 more)

### Community 5 - "Dashboard e relatório PDF"
Cohesion: 0.07
Nodes (46): animVal(), buildDashboardPdf(), canManageAds(), dashColsCells(), dashColsFor(), dashColsHeader(), dashColsKeys(), dashMoney() (+38 more)

### Community 6 - "Chat: figurinhas e agendadas"
Cohesion: 0.07
Nodes (40): addStickerFiles(), addStickersFromBlobs(), addWaLine(), cancelScheduled(), chatMe(), copyText(), fallback(), deleteCadenceItem() (+32 more)

### Community 7 - "Contatos e etiquetas"
Cohesion: 0.08
Nodes (40): campaignPickEntries(), clearContatosFilters(), colorSwatchesHtml(), contactOrigin(), contatosAct(), createContactTag(), createContactTagFromInput(), createTagInBulk() (+32 more)

### Community 8 - "Firebase (banco e login)"
Cohesion: 0.06
Nodes (4): app, auth, authReady, firebaseConfig

### Community 9 - "Layouts (vidro, topo, bolinhas)"
Cohesion: 0.15
Nodes (31): activeId(), animateView(), apply(), bgUrl(), boot(), build(), closeMenus(), countUp() (+23 more)

### Community 10 - "Firebase: gravações"
Cohesion: 0.06
Nodes (33): addAudit(), addChatNote(), addScheduledMessage(), createCampaign(), createGroupSchedules(), getContactTags(), getInboxChat(), getPipelines() (+25 more)

### Community 11 - "Prospecção (busca de empresas)"
Cohesion: 0.09
Nodes (33): parseFunnelTarget(), prosApplyFilters(), prosDupIndex(), prosExport(), prosExportName(), prosFetch(), prosFetchCompany(), prosFilterSig() (+25 more)

### Community 12 - "IA: textos e chamadas"
Cohesion: 0.08
Nodes (30): aiBriefFieldsHtml(), aiCampaignCopy(), aiLastBrief(), askCallResultOnReturn(), askSaleValue(), callWhatsApp(), chatDateTimeLocal(), cloudFlowPaletteHtml() (+22 more)

### Community 13 - "Fluxos da API oficial e alertas"
Cohesion: 0.11
Nodes (29): capiAddRule(), closeFlowEditor(), cloudCadenceCardHtml(), deleteFlowConfirm(), deleteGroupAlert(), flowAct(), groupAlertsOf(), igAccountSave() (+21 more)

### Community 14 - "Resumo de IA e mídias"
Cohesion: 0.10
Nodes (28): aiSummaryHtml(), attachChatMedia(), attachSchedMedia(), capiOriginsChanged(), capiOriginsHtml(), capiOriginsLabel(), diagnoseMetaPage(), escapeHtml() (+20 more)

### Community 15 - "Colunas e etapas do funil"
Cohesion: 0.14
Nodes (28): auditStageLabel(), autoStageOptions(), campaignStageOptions(), capiRenderPage(), capiRuleRowHtml(), capiSelect(), ensurePipelines(), funnelTargetOptions() (+20 more)

### Community 16 - "Chat: marcações e mídias"
Cohesion: 0.12
Nodes (28): chatApplyMentions(), chatMentionInput(), chatMentionItems(), chatMentionQuery(), chatOpenGroup(), chatQrInput(), chatTextKey(), clearChatMedia() (+20 more)

### Community 17 - "Leads: importação e novos"
Cohesion: 0.14
Nodes (24): checkForNewLeads(), closeImportModal(), closeNotificationsCenter(), confirmarImportacao(), deleteLead(), deleteLeadFromDb(), getLeadsAsync(), getLeadUniqueKey() (+16 more)

### Community 18 - "Agente de IA"
Cohesion: 0.10
Nodes (25): aiAgentConfigured(), aiAgentOf(), aiChecks(), aiDocxText(), aiExamplesCount(), aiExamplesLoad(), aiHandoffToggle(), aiMediaRemove() (+17 more)

### Community 19 - "Ações de cancelar e excluir"
Cohesion: 0.09
Nodes (24): calDisconnect(), cancelCadenceItem(), cancelCampaign(), cleanLoginInput(), closeLeadModal(), connectAiGcal(), createInboundKey(), deleteCadenceOne() (+16 more)

### Community 20 - "Notificações e lembretes"
Cohesion: 0.13
Nodes (23): addLeadNotifications(), clearNotificationsCenter(), clearUnreadLeadNotifications(), dueReminders(), formatNotificationTime(), getStoredLeadNotifications(), hideReminder(), isCrmViewOpen() (+15 more)

### Community 21 - "Importação: mapeamento"
Cohesion: 0.14
Nodes (23): addSelectOption(), atualizarStageMappingDestino(), autoMapField(), autoMapStage(), resolveStage(), getFieldConfig(), getImportFieldsForAct(), getStageColIdx() (+15 more)

### Community 22 - "Atendentes e linhas do chat"
Cohesion: 0.15
Nodes (23): attendantPeople(), attNames(), chatAllowedLineIds(), chatCloudWindowOpen(), chatLineVisible(), chatVisibleFilter(), fillLeadResponsavel(), findLeadChatKey() (+15 more)

### Community 23 - "Chat: contato e lead"
Cohesion: 0.24
Nodes (23): chatAiSideHtml(), chatAiTakeover(), chatContactFor(), chatContactIndex(), chatFirstName(), chatLeadFor(), chatLeadIndex(), chatName() (+15 more)

### Community 24 - "Kanban: mover e auditoria"
Cohesion: 0.15
Nodes (22): afterSaleMove(), auditLog(), auditMove(), bulkMoveCount(), bulkMoveToggleAll(), cardDragFinish(), commitCardOrder(), createLeadFromGroupMember() (+14 more)

### Community 25 - "Chat: menu da mensagem"
Cohesion: 0.14
Nodes (22): autoFirstMsgHtml(), closeChatMsgMenu(), cloudFlowTopHtml(), deleteChatMessage(), editChatMessage(), escapeJsString(), isAdminUser(), leadSummaryToggleHtml() (+14 more)

### Community 26 - "Ajuda com IA"
Cohesion: 0.21
Nodes (18): addMsg(), ask(), brand(), build(), close(), currentView(), el(), esc() (+10 more)

### Community 27 - "Variações de IA e MQL em massa"
Cohesion: 0.10
Nodes (21): aiVariationBrief(), aiVariationsFrom(), applyBulkTag(), applyMqlFilter(), automationAct(), calCancel(), calReschedule(), clearMqlRules() (+13 more)

### Community 28 - "Chat: cartões e textos"
Cohesion: 0.13
Nodes (21): cadenceDayLabel(), chatContactCardHtml(), chatFormatPhone(), chatLinkify(), chatMentionsHtml(), chatNoteHtml(), cloudProgressData(), groupInfoPanelHtml() (+13 more)

### Community 29 - "Chat: lista e filtros"
Cohesion: 0.15
Nodes (21): chatGroupsBarHtml(), chatGroupsOn(), chatLines(), chatMatchesFilter(), chatReminderFor(), chatReplied(), chatTime(), chatWaiting() (+13 more)

### Community 30 - "Integrações (Meta, MCP, entrada)"
Cohesion: 0.13
Nodes (21): connectMetaPage(), createMcpKey(), disconnectMetaPage(), inbPipelineOptions(), inbRefreshTarget(), inbStageOptions(), integClientOptions(), integStageOptions() (+13 more)

### Community 31 - "Admin: logins e senhas"
Cohesion: 0.15
Nodes (20): adminApi(), adminSetPassword(), callAdminApi(), changeOwnPassword(), createSubLogin(), deleteClientFull(), deleteExtraClient(), findUidByLogin() (+12 more)

### Community 32 - "Funil: período e rolagem"
Cohesion: 0.16
Nodes (20): adjustKanbanBoardScroll(), applySendToFunnel(), arrangeCrmMobileOrder(), bindCrmBoardScrollbar(), clearMqlFilter(), clientStats(), crmCustomRangeUi(), crmPeriodRange() (+12 more)

### Community 33 - "Análise e ajustes do WhatsApp"
Cohesion: 0.14
Nodes (20): anDefaultRange(), anTabsHtml(), autoAlertsHtml(), ensureWaSettings(), fmt(), leadSummaryOn(), loadTempReport(), openChatTemplate() (+12 more)

### Community 34 - "Ações em massa no funil"
Cohesion: 0.22
Nodes (20): bulkAssignCount(), bulkAssignLeads(), bulkMoveLeads(), columnAutomation(), currentPipeline(), editStageLabel(), getActForStages(), leadPipeline() (+12 more)

### Community 35 - "Chips dos cards e rascunhos"
Cohesion: 0.15
Nodes (19): aiLeadBtnHtml(), aiLeadState(), aiSummaryChip(), automationCardChip(), cadenceDraftsHtml(), cadenceSeriesKey(), cadenceShownText(), cadenceWeekStart() (+11 more)

### Community 36 - "Público e filtros de leads"
Cohesion: 0.18
Nodes (18): buildCampaignAudience(), buildContactEntries(), calLeadsForPick(), calNewAt(), currentCrmFilteredLeads(), filtrarColuna(), getCrmBaseLeads(), getLeads() (+10 more)

### Community 37 - "Calendário"
Cohesion: 0.27
Nodes (16): calAddDays(), calConnect(), calDayLabel(), calEventsOn(), calMove(), calParse(), calPerson(), calRange() (+8 more)

### Community 38 - "Sublogins"
Cohesion: 0.18
Nodes (16): createSubLogin(), deleteSubLogin(), filterAdminLogins(), mainLoginPermsLabel(), readSubChatLines(), readSubExtraPerms(), readSubFunnelScope(), readSubViews() (+8 more)

### Community 39 - "Modelos (API oficial)"
Cohesion: 0.23
Nodes (10): botoes(), botoesLiberados(), cabecalho(), campo(), card(), carregar(), esc(), ico() (+2 more)

### Community 40 - "Abrir conversas"
Cohesion: 0.20
Nodes (14): autoSyncChatContacts(), chatAct(), chatContactOpen(), chatResumeOpenLast(), loadMoreChats(), onChatClientChange(), openChat(), openChatByKey() (+6 more)

### Community 41 - "Assistente de cadência em massa"
Cohesion: 0.19
Nodes (13): buildCadenceFromWizard(), cloudBulkProblem(), cwProblem(), cwTime(), flowToCloudWizard(), readAiBrief(), renderCloudBulkList(), renderCloudWizardList() (+5 more)

### Community 42 - "Postagens: editor"
Cohesion: 0.23
Nodes (13): localInputValue(), openPostEditor(), postDelete(), postEditorClose(), postEditorRead(), postEditorRender(), postExtra(), postMediaRemove() (+5 more)

### Community 43 - "Prospecção: cidade e CNAE"
Cohesion: 0.18
Nodes (13): prosCityBlur(), prosCityKey(), prosCityMatches(), prosCitySuggest(), prosCnaeHide(), prosCnaeMatches(), prosCnaeSuggest(), prosCnaeTextMatches() (+5 more)

### Community 44 - "Modal do lead e datas"
Cohesion: 0.23
Nodes (12): applyFieldConfig(), cardArrivalLabel(), createdAtFromDateInput(), editLead(), isClinicaClient(), leadArrivalDate(), leadDateInputValue(), leadModalRefreshSummary() (+4 more)

### Community 45 - "Modelos da API oficial"
Cohesion: 0.23
Nodes (12): cloudHeaderPreviewHtml(), cloudStatusChip(), cloudTemplatesFor(), cloudToQrFlow(), createCloudTemplate(), deleteCloudTemplate(), duplicateFlowAs(), openCloudTemplates() (+4 more)

### Community 46 - "Métricas de atendimento"
Cohesion: 0.22
Nodes (11): anAvg(), anDuration(), anFmt(), anIsHuman(), anKpi(), anLeadChatKey(), anMedian(), anWho() (+3 more)

### Community 47 - "Funis e etapas personalizadas"
Cohesion: 0.29
Nodes (11): deletePipeline(), getArteStagesMigrationKey(), getStagesForArteAzulejo(), pipelinesFor(), saveCustomStages(), savePipelineEditor(), savePipelinesCfg(), saveStagesFor() (+3 more)

### Community 48 - "Conexão do WhatsApp (QR)"
Cohesion: 0.29
Nodes (10): closeWhatsAppQrModal(), deleteWaLineFromQr(), disconnectWhatsApp(), fetchWhatsAppState(), loadWhatsAppQr(), onWhatsAppConnected(), openWhatsAppConnect(), refreshAdminWhatsAppStates() (+2 more)

### Community 49 - "Regras de clientes antigos"
Cohesion: 0.33
Nodes (9): getArteAzulejoStageForBoard(), getLeadSearchText(), isAdrianaLeadCandidate(), isArteAzulejoClient(), normalizeClientNameForStages(), normalizeImportedLeadFields(), normalizeLeadAccountId(), normalizeLeadStageForClient() (+1 more)

### Community 50 - "Filtro MQL"
Cohesion: 0.36
Nodes (9): mqlAnswers(), mqlLeadIsMql(), mqlLeadMatches(), mqlNorm(), mqlPretty(), mqlRank(), mqlRulesOf(), openMqlFilter() (+1 more)

### Community 51 - "Avisos em pop-up"
Cohesion: 0.25
Nodes (9): noticeClose(), noticeGo(), noticeIsOff(), noticeOffKey(), noticesCheck(), noticeTextHtml(), previewNotice(), setIntegTab() (+1 more)

### Community 52 - "Primeira mensagem"
Cohesion: 0.36
Nodes (8): buildFirstWhatsAppMessage(), closeFirstMessageModal(), firstMessageTemplateAct(), getFirstMessageTemplate(), getFirstMessageTemplates(), getWhatsAppTemplates(), openFirstMessageModal(), saveFirstMessageTemplate()

### Community 53 - "Integração Google Sheets"
Cohesion: 0.25
Nodes (8): buildSheetsAppsScript(), copySheetsIntegrationScript(), generateSheetsIntegrationScript(), getCurrentCrmActForSheets(), getSheetsIntegrationConfig(), openIntegrationsFromNav(), openSheetsIntegrationModal(), saveSheetsIntegrationConfig()

### Community 54 - "Alerta de WhatsApp caído"
Cohesion: 0.25
Nodes (8): enableSwipeDismiss(), hideWhatsAppAlert(), renderWhatsAppAlert(), renderWhatsAppView(), unmuteWhatsAppAlert(), waAlertMuted(), waAlertTime(), whatsappDownList()

### Community 55 - "Arrastar cards"
Cohesion: 0.40
Nodes (6): bindCardDrag(), cardDragAnimateMove(), cardDragAutoScroll(), cardDragBegin(), cardDragPrime(), cardDragUpdate()

### Community 56 - "Painel de avisos (admin)"
Cohesion: 0.33
Nodes (6): deleteNotice(), readNoticeForm(), renderNoticesAdmin(), saveNoticeForm(), saveNotices(), toggleNotice()

### Community 57 - "Lista da cadência"
Cohesion: 0.33
Nodes (6): moveCadenceWeek(), renderCadenceList(), selectAllCadence(), selectCadenceSeries(), setCadenceMode(), toggleCadenceSelected()

### Community 58 - "Postagens: calendário"
Cohesion: 0.47
Nodes (6): postChipHtml(), postDate(), postsBoardHtml(), postsCalendarHtml(), postsDraw(), postsMonth()

### Community 59 - "Métricas visíveis do dashboard"
Cohesion: 0.60
Nodes (5): applyDashboardMetricVisibility(), getVisibleDashboardMetrics(), onDashboardMetricToggle(), setVisibleDashboardMetrics(), syncMetricPickerChecks()

### Community 60 - "Notificações push"
Cohesion: 0.40
Nodes (5): enablePushNotifications(), isInstalledApp(), isIosDevice(), pushKeyBytes(), pushSubscribe()

### Community 61 - "Cores do CRM"
Cohesion: 0.83
Nodes (3): aplica(), atual(), total()

### Community 62 - "Leitura de leads"
Cohesion: 0.67
Nodes (4): getLeads(), leadsQuery(), listenLeads(), mapLeads()

### Community 63 - "Captura automática"
Cohesion: 0.50
Nodes (4): addAutoCaptureRule(), autoCaptureHtml(), captureRuleRowHtml(), captureRulesFromSettings()

### Community 64 - "Conversões Meta (CAPI)"
Cohesion: 0.50
Nodes (4): capiReadRules(), disconnectCapi(), renderCapiView(), saveCapi()

### Community 65 - "Fluxo da API: resumo"
Cohesion: 0.67
Nodes (4): cloudChip(), cloudFlowInspectorHtml(), cloudFlowSummary(), cloudFlowTpl()

### Community 66 - "Prévia da campanha"
Cohesion: 0.50
Nodes (4): cloudPreview(), fillCampColumns(), syncCloudParam(), updateCloudPreview()

### Community 67 - "Excluir cadência"
Cohesion: 0.50
Nodes (4): deleteCadenceDraft(), deleteCadenceIds(), deleteCadenceSeries(), deleteSelectedCadence()

### Community 68 - "Respostas rápidas"
Cohesion: 0.50
Nodes (4): deleteQuickReply(), editQuickReply(), renderQuickRepliesManager(), saveQuickReply()

### Community 69 - "Gráfico do dashboard"
Cohesion: 0.67
Nodes (3): buildChart(), switchChartType(), switchMetric()

### Community 70 - "Leitura de arquivos"
Cohesion: 0.67
Nodes (3): fileToText(), readCloudBulkFile(), readCwFile()

### Community 71 - "Peso dos fluxos"
Cohesion: 0.67
Nodes (3): flowWeightedCycle(), flowWeightPreview(), setFlowWeight()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `escapeHtml()` connect `Resumo de IA e mídias` to `Núcleo do app (estado e Meta)`, `Campanhas de WhatsApp`, `Automações e fluxos`, `Cadência`, `Login e permissões de tela`, `Dashboard e relatório PDF`, `Chat: figurinhas e agendadas`, `Contatos e etiquetas`, `Prospecção (busca de empresas)`, `IA: textos e chamadas`, `Fluxos da API oficial e alertas`, `Colunas e etapas do funil`, `Chat: marcações e mídias`, `Agente de IA`, `Ações de cancelar e excluir`, `Notificações e lembretes`, `Importação: mapeamento`, `Atendentes e linhas do chat`, `Chat: contato e lead`, `Chat: menu da mensagem`, `Variações de IA e MQL em massa`, `Chat: cartões e textos`, `Chat: lista e filtros`, `Integrações (Meta, MCP, entrada)`, `Funil: período e rolagem`, `Análise e ajustes do WhatsApp`, `Ações em massa no funil`, `Chips dos cards e rascunhos`, `Público e filtros de leads`, `Calendário`, `Abrir conversas`, `Assistente de cadência em massa`, `Postagens: editor`, `Prospecção: cidade e CNAE`, `Modelos da API oficial`, `Métricas de atendimento`, `Conexão do WhatsApp (QR)`, `Filtro MQL`, `Avisos em pop-up`, `Alerta de WhatsApp caído`, `Painel de avisos (admin)`, `Postagens: calendário`, `Captura automática`, `Conversões Meta (CAPI)`, `Fluxo da API: resumo`, `Respostas rápidas`, `Peso dos fluxos`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `Núcleo do app (estado e Meta)` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Why does `showToast()` connect `Chat: figurinhas e agendadas` to `Núcleo do app (estado e Meta)`, `Campanhas de WhatsApp`, `Automações e fluxos`, `Cadência`, `Login e permissões de tela`, `Dashboard e relatório PDF`, `Contatos e etiquetas`, `Prospecção (busca de empresas)`, `IA: textos e chamadas`, `Fluxos da API oficial e alertas`, `Resumo de IA e mídias`, `Colunas e etapas do funil`, `Chat: marcações e mídias`, `Leads: importação e novos`, `Agente de IA`, `Ações de cancelar e excluir`, `Notificações e lembretes`, `Importação: mapeamento`, `Chat: contato e lead`, `Kanban: mover e auditoria`, `Chat: menu da mensagem`, `Variações de IA e MQL em massa`, `Chat: lista e filtros`, `Integrações (Meta, MCP, entrada)`, `Funil: período e rolagem`, `Análise e ajustes do WhatsApp`, `Ações em massa no funil`, `Público e filtros de leads`, `Calendário`, `Sublogins`, `Abrir conversas`, `Assistente de cadência em massa`, `Postagens: editor`, `Modelos da API oficial`, `Métricas de atendimento`, `Funis e etapas personalizadas`, `Conexão do WhatsApp (QR)`, `Filtro MQL`, `Primeira mensagem`, `Integração Google Sheets`, `Alerta de WhatsApp caído`, `Painel de avisos (admin)`, `Notificações push`, `Conversões Meta (CAPI)`, `Excluir cadência`, `Respostas rápidas`, `Rascunho de cadência`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `Campanhas de WhatsApp` be split into smaller, more focused modules?**
  _Cohesion score 0.05547785547785548 - nodes in this community are weakly interconnected._
- **Why does `confirmarImportacao()` connect `Leads: importação e novos` to `Núcleo do app (estado e Meta)`, `Funil: período e rolagem`, `Chat: figurinhas e agendadas`, `Modal do lead e datas`, `Colunas e etapas do funil`, `Importação: mapeamento`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Should `Automações e fluxos` be split into smaller, more focused modules?**
  _Cohesion score 0.06393442622950819 - nodes in this community are weakly interconnected._
- **Should `Cadência` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._