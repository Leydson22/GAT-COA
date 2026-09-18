# Documentação do Painel e Versionamento (CGB Dashboard)

**Sistema:** Gestão e Acompanhamento de Pátio - COA  
**Aeroporto:** Aeroporto Internacional de Cuiabá / Marechal Rondon (CGB - SBCY)  
**Versão Atual:** `v1.8.1`  
**Data:** 18 de Setembro de 2026  
**Linguagem & Frameworks:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, Capacitor v8  

---

## 1. Visão Geral do Projeto

Este dashboard foi projetado sob medida para a equipe de fiscalização de pátio, administração aeroportuária e executivos de operações do **Aeroporto Internacional de Cuiabá (CGB - SBCY)**. A aplicação consome, sincroniza e gerencia os dados de pousos, companhias operantes, modalidade de desembarque e controle multiousuário.

---

## 2. Estrutura da Base de Dados (Híbrida & Cloud Sync)

O sistema opera com múltiplas camadas de dados para garantir resiliência, segurança e sincronização:
1. **LocalStorage:** Cache de alta performance para operação diária e offline.
2. **Supabase (PostgreSQL):** Banco de dados relacional em nuvem com sincronização offline-first (`syncService`) e políticas RLS avançadas.
3. **Capacitor Filesystem:** Armazenamento de snapshots permanentes (Máquina do Tempo) na memória física do dispositivo Android.
4. **Exportação Externa:** Geração de arquivos JSON e CSV para arquivamento externo.

---

## 3. Fórmulas e Regras de Negócio

### A. Taxa de Desembarque Híbrido (%)
- **Lógica:** Razão entre voos com status "Sim" e o total de registros filtrados.
- **Formatação:** Percentual com 1 casa decimal.

### B. Filtro ISO 8601 (Comercial)
- **Padrão:** O filtro de "Semana" inicia obrigatoriamente na **Segunda-feira** e termina no Domingo, seguindo a norma internacional de calendários corporativos.

---

## 4. Histórico de Versões e Versionamento

### Versão 1.8.1 — (18/09/2026)
- **Correção e Estabilização da Conexão com o Supabase:** Configuração explícita de persistência de sessão auth no cliente Supabase para Capacitor (`storage: window.localStorage`), adição de `{ onConflict: 'id_registro' }` nas requisições `.upsert()`, e tratamento robusto de erros para envio contínuo de dados na nuvem.
- **Sincronização Cloud Restrita por Perfil (Operator vs Admin):** Operadores realizam upload e download restritos aos seus próprios registros (`user_id`), e ações definitivas de limpeza restritas exclusivamente a Administradores.
- **Baixar da Nuvem & Progresso Circular:** Sincronização reversa com barra de progresso em formato de círculo e valor centralizado.
- **Ordenação Padrão por Recência & Toggle ("Recentes" / "Antigos"):** Listagens organizadas por padrão do mais recente para o mais antigo, com botão de alternância com setas Up/Down.
- **Correção de Relatórios & PDF:** Ajuste no escopo de dados do `ExportModal` e no wrapper `#report-container` para exportação de PDFs.

### Versão 1.8.0 — (18/09/2026)
- **Dashboard Interativo e Moderno:** Aprimoramento visual completo dos gráficos analíticos (`VisualCharts.tsx`) e cartões KPI (`KPIScorecards.tsx`).
- **Defesas Avançadas contra Bots (Segurança):** Implementação de Honeypot e Rate Limiting no formulário de cadastro e autenticação.
- **Fluxo Robusto de Aprovação de Usuários:** Controles rigorosos de aprovação de contas e restrições de acesso por perfil (RBAC).

### Versão 1.6.0 — (08/09/2026)
- **Fluxo de Aprovação de Novos Usuários:** Implementado sistema onde novos cadastros iniciam como pendentes (`approved: false`).

### Versão 1.5.0 — (13/08/2026)
- **Integração Supabase (Cloud) & Autenticação:** Início da migração para arquitetura Cloud Sync.

### Versão 1.3.1 — (09/08/2026)
- **Nova Identidade Visual & Otimização de PDF:** Sistema renomeado para "Gestão e Acompanhamento de Pátio - COA".

### Versão 1.0.0 — (22/07/2026)
- **Lançamento Inicial:** Dashboards executivos, gráficos Recharts e tabela analítica.
