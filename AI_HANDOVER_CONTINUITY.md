# 🤖 AI Handover & Continuity Guide (CGB Dashboard - v1.8.1)

Este documento foi gerado especificamente para guiar qualquer futura Inteligência Artificial ou desenvolvedor que venha a assumir este repositório. Ele resume o estado atual da arquitetura, regras de negócio implementadas, histórico de versões e o passo a passo para continuar o desenvolvimento.

---

## 📌 1. Visão Geral do Projeto
- **Nome:** Gestão e Acompanhamento de Pátio - COA (Aeroporto de Cuiabá / CGB - SBCY)
- **Versão Atual:** `v1.8.1`
- **Stack Tecnológica:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Supabase (PostgreSQL), Ionic Capacitor v8 (Android), jsPDF & html2canvas.

---

## 🚀 2. Últimas Funcionalidades e Ajustes Implementados (v1.8.1)

1. **Estabilização da Conexão Supabase no Mobile (v1.8.1):**
   - Configurado explicitamente o storage de persistência (`storage: window.localStorage`) na inicialização do cliente Supabase (`lib/supabase.ts`) para compatibilidade perfeita com Capacitor Android WebView.
   - Adicionado parâmetro `{ onConflict: 'id_registro' }` nas chamadas `.upsert()` em `syncService.ts` para garantir upserts consistentes sem erros de conflito.

2. **Sessão Persistente Offline & Restrições por Perfil:**
   - Cache local robusto (`cgb_cached_session` e `cgb_cached_profile`) mantendo o usuário logado offline.
   - Operadores sincronizam apenas seus próprios dados (`user_id`), e ações de limpeza definitiva são exclusivas para Administradores.

3. **Baixar da Nuvem & Progresso Circular:**
   - Opção de download reverso do Supabase (`pullDataFromCloud`) com indicador de progresso circular (`0%` a `100%` com valor centralizado).

4. **Navegação por Recência:**
   - Listagens ordenadas por padrão do mais recente para o mais antigo, com botão **"Recentes" / "Antigos"** e setas Up/Down.

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
- [supabase.ts](file:///home/leydson/development/COA/dashboard-cgb/src/lib/supabase.ts): Configuração do cliente Supabase com `localStorage` explícito para Capacitor.
- [syncService.ts](file:///home/leydson/development/COA/dashboard-cgb/src/services/syncService.ts): Upsert otimizado com `{ onConflict: 'id_registro' }` e tratamento de erros aprimorado.
- [App.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/App.tsx): Sessão offline, `#report-container` e dataset base para exportação.
- [RecentLandingsScreen.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/RecentLandingsScreen.tsx): Ordenação por recência com toggle Up/Down.
- [DataManagementPanel.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/DataManagementPanel.tsx): Painel de segurança com download da nuvem e barra de progresso circular.
- [DOCUMENTACAO_E_VERSIONAMENTO.md](file:///home/leydson/development/COA/dashboard-cgb/DOCUMENTACAO_E_VERSIONAMENTO.md): Histórico oficial até `v1.8.1`.
- [AI_HANDOVER_CONTINUITY.md](file:///home/leydson/development/COA/dashboard-cgb/AI_HANDOVER_CONTINUITY.md): Guia de continuidade para IA.
