# 🤖 AI Handover & Continuity Guide (CGB Dashboard - v1.7.3)

Este documento foi gerado especificamente para guiar qualquer futura Inteligência Artificial ou desenvolvedor que venha a assumir este repositório. Ele resume o estado atual da arquitetura, regras de negócio implementadas, histórico de versões e o passo a passo para continuar o desenvolvimento.

---

## 📌 1. Visão Geral do Projeto
- **Nome:** Gestão e Acompanhamento de Pátio - COA (Aeroporto de Cuiabá / CGB - SBCY)
- **Versão Atual:** `v1.7.3`
- **Stack Tecnológica:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Supabase (PostgreSQL), Ionic Capacitor v8 (Android), jsPDF & html2canvas.

---

## 🚀 2. Últimas Funcionalidades e Ajustes Implementados (v1.7.0 a v1.7.3)

1. **Correção no Filtro de Relatórios / ExportModal (v1.7.3):**
   - Ajustado em `App.tsx` (`handleOpenExport`) para passar a base completa autorizada (`movimentacoesPermitidas`) em vez de dados já filtrados pelo painel principal (`movimentacoesOrdenadas`). Isso resolveu o problema de relatórios em branco ou filtros de ExportModal falhando no mobile/desktop.

2. **Correção do Container de Relatórios PDF (v1.7.2):**
   - Adicionado o atributo `id="report-container"` na `div` wrapper de relatórios em `App.tsx`, corrigindo definitivamente o erro *"Container do relatório não encontrado"* durante a geração de PDFs.

3. **Sessão Persistente Offline (v1.7.1):**
   - Implementado cache local robusto (`cgb_cached_session` e `cgb_cached_profile`) no `App.tsx`.
   - O usuário entra direto no app offline sem precisar refazer o login após o primeiro acesso, exigindo credenciais apenas ao clicar explicitamente em **"Sair"**.

4. **Sincronização Cloud Condicional & Offline-First (v1.7.0 / v1.7.1):**
   - Todos os cadastros são salvos localmente e enfileirados. Sincronizações com o Supabase (`syncData`, `syncAllLocalData`) exigem `navigator.onLine`.

5. **Indicador Visual Sutil de Conexão no Ícone (v1.7.0):**
   - O ícone de avião (`Plane`) no cabeçalho superior esquerdo (`Header.tsx`) indica o status (Verde = Sincronizado, Vermelho = Offline, Amarelo = Sincronização Pendente).

6. **Barra de Progresso e Gestão de Usuários por Ícones (v1.7.0):**
   - Barra de progresso ao sincronizar dados na tela de Segurança e botões baseados em ícones na Gestão de Usuários.

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
- [App.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/App.tsx): Gerenciamento de sessão offline, wrapper `#report-container` e correção do `handleOpenExport` enviando a base correta para o modal de relatórios.
- [ExportModal.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/ExportModal.tsx): Modal de filtros e exportação de relatórios.
- [Header.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/Header.tsx): Cabeçalho com indicador de status no ícone de avião.
- [DataManagementPanel.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/DataManagementPanel.tsx): Painel de segurança com barra de progresso.
- [UserManagement.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/UserManagement.tsx): Administração de usuários com ícones.
- [syncService.ts](file:///home/leydson/development/COA/dashboard-cgb/src/services/syncService.ts): Sincronização offline-first com Supabase.
- [DOCUMENTACAO_E_VERSIONAMENTO.md](file:///home/leydson/development/COA/dashboard-cgb/DOCUMENTACAO_E_VERSIONAMENTO.md): Histórico oficial de versões até `v1.7.3`.
- [AI_HANDOVER_CONTINUITY.md](file:///home/leydson/development/COA/dashboard-cgb/AI_HANDOVER_CONTINUITY.md): Guia de continuidade para IA.
