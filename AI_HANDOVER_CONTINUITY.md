# 🤖 AI Handover & Continuity Guide (CGB Dashboard - v1.8.0)

Este documento foi gerado especificamente para guiar qualquer futura Inteligência Artificial ou desenvolvedor que venha a assumir este repositório. Ele resume o estado atual da arquitetura, regras de negócio implementadas, histórico de versões e o passo a passo para continuar o desenvolvimento.

---

## 📌 1. Visão Geral do Projeto
- **Nome:** Gestão e Acompanhamento de Pátio - COA (Aeroporto de Cuiabá / CGB - SBCY)
- **Versão Atual:** `v1.8.0`
- **Stack Tecnológica:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Supabase (PostgreSQL), Ionic Capacitor v8 (Android), jsPDF & html2canvas.

---

## 🚀 2. Últimas Funcionalidades e Ajustes Implementados (v1.7.0 a v1.8.0)

1. **Baixar da Nuvem / Cloud Pull & Barra de Progresso Circular (v1.8.0):**
   - Adicionada opção de download de dados do Supabase (`pullDataFromCloud` em `syncService.ts`) na tela de Segurança (`DataManagementPanel.tsx`).
   - Criada barra de progresso em formato circular com porcentagem centralizada para operações de Upload e Download.

2. **Ordenação Padrão Mais Novos para Mais Antigos com Setas (v1.8.0):**
   - Listas e telas de pousos ordenadas por padrão do mais recente para o mais antigo, com botão de alternância de direção (setas Up/Down).

3. **Correções de Relatórios & PDF (v1.7.2 & v1.7.3):**
   - Atributo `id="report-container"` adicionado no wrapper de relatórios em `App.tsx`.
   - Ajuste em `handleOpenExport` passando a base completa autorizada (`movimentacoesPermitidas`) para o modal de exportação.

4. **Sessão Persistente Offline (v1.7.1):**
   - Cache local robusto (`cgb_cached_session` e `cgb_cached_profile`) permitindo uso offline contínuo sem reautenticação até que o usuário clique em "Sair".

---

## 🛠️ 3. Comandos Úteis para o Próximo Agente

- **Executar Web em Desenvolvimento:**
  ```bash
  npm run dev
  ```
- **Compilar Web e Sincronizar com Capacitor Android:**
  ```bash
  npm run cap:sync
  ```
- **Compilar APKs Android (Release & Debug):**
  Via Gradle build tool ou Gradle wrapper:
  ```bash
  cd android && ./gradlew clean assembleRelease assembleDebug
  ```
- **Executar Linter / Verificação TypeScript:**
  ```bash
  npm run lint
  ```

---

## 📂 4. Arquivos Principais Modificados
- [App.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/App.tsx): Sessão offline, `#report-container` e dataset base para exportação.
- [RecentLandingsScreen.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/RecentLandingsScreen.tsx): Ordenação padrão novos/antigos com toggle Up/Down.
- [DataManagementPanel.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/DataManagementPanel.tsx): Painel de segurança com download da nuvem e barra de progresso circular.
- [syncService.ts](file:///home/leydson/development/COA/dashboard-cgb/src/services/syncService.ts): `syncAllLocalData` e `pullDataFromCloud`.
- [DOCUMENTACAO_E_VERSIONAMENTO.md](file:///home/leydson/development/COA/dashboard-cgb/DOCUMENTACAO_E_VERSIONAMENTO.md): Histórico de versões até `v1.8.0`.
- [AI_HANDOVER_CONTINUITY.md](file:///home/leydson/development/COA/dashboard-cgb/AI_HANDOVER_CONTINUITY.md): Guia de continuidade para IA.
