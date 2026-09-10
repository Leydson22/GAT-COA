# 🤖 AI Handover & Continuity Guide (CGB Dashboard - v1.7.1)

Este documento foi gerado especificamente para guiar qualquer futura Inteligência Artificial ou desenvolvedor que venha a assumir este repositório. Ele resume o estado atual da arquitetura, regras de negócio implementadas, histórico de versões e o passo a passo para continuar o desenvolvimento.

---

## 📌 1. Visão Geral do Projeto
- **Nome:** Gestão e Acompanhamento de Pátio - COA (Aeroporto de Cuiabá / CGB - SBCY)
- **Versão Atual:** `v1.7.1`
- **Stack Tecnológica:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Supabase (PostgreSQL), Ionic Capacitor v8 (Android), jsPDF & html2canvas.

---

## 🚀 2. Últimas Funcionalidades e Ajustes Implementados (v1.7.0 & v1.7.1)

1. **Sessão Persistente Offline (v1.7.1):**
   - Implementado cache local robusto (`cgb_cached_session` e `cgb_cached_profile`) no `App.tsx`.
   - Uma vez autenticado ou cadastrado, o operador/administrador entra diretamente no app mesmo sem internet, sem precisar refazer o login. O login só é exigido novamente caso o usuário clique explicitamente em **"Sair"** (`handleExitApp`) ou altere de dispositivo.

2. **Sincronização Cloud Condicional & Offline-First (v1.7.0 / v1.7.1):**
   - Arquitetura offline-first onde todas as movimentações e cadastros são salvos instantaneamente no `LocalStorage` e enfileirados em `cgb_pending_sync_v1`.
   - As chamadas de sincronização com o Supabase (`syncData`, `syncAllLocalData`) verificam rigorosamente `navigator.onLine` antes de tentar qualquer requisição à nuvem.

3. **Indicador Visual Sutil de Conexão no Ícone (v1.7.0):**
   - O ícone de avião (`Plane`) no cabeçalho superior esquerdo (`Header.tsx`) muda dinamicamente de cor para refletir a conectividade:
     - 🟢 **Verde:** Online e totalmente sincronizado.
     - 🔴 **Vermelho:** Offline.
     - 🟡 **Amarelo (Pulsando):** Online com registros pendentes de envio para o Supabase.

4. **Barra de Progresso e Botão Online-Only na Segurança (v1.7.0):**
   - Na tela de Segurança (`DataManagementPanel.tsx`), o botão "Sincronizar Tudo" é desativado quando offline.
   - Adicionada barra de progresso em tempo real durante a sincronização em lote com o Supabase (*"Enviando X de Y registros (Z%)"*).

5. **Gestão de Usuários por Ícones (v1.7.0):**
   - A tela de administração de equipe (`UserManagement.tsx`) utiliza botões baseados em ícones compactos (`UserCheck`, `UserX`, `ShieldCheck`, `ShieldAlert`, `Trash2`) com tooltips para aprovar/bloquear, alterar papéis e excluir usuários.

6. **Atribuição de Usuários & RBAC:**
   - Cada movimentação e log registra o `user_id` e `user_email`.
   - Operadores (`operator`) visualizam e modificam apenas seus próprios registros; Administradores (`admin`) possuem acesso global e gerenciamento de equipe.

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
- [App.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/App.tsx): Gerenciamento de sessão persistente offline, cache local e permissões RBAC.
- [Header.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/Header.tsx): Cabeçalho com indicador de status no ícone de avião.
- [DataManagementPanel.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/DataManagementPanel.tsx): Painel de segurança com barra de progresso e botão online-only.
- [UserManagement.tsx](file:///home/leydson/development/COA/dashboard-cgb/src/components/UserManagement.tsx): Administração de usuários com ícones intuitivos.
- [syncService.ts](file:///home/leydson/development/COA/dashboard-cgb/src/services/syncService.ts): Lógica de sincronização offline-first com Supabase e controle de progresso.
- [DOCUMENTACAO_E_VERSIONAMENTO.md](file:///home/leydson/development/COA/dashboard-cgb/DOCUMENTACAO_E_VERSIONAMENTO.md): Histórico oficial de versões até `v1.7.1`.
