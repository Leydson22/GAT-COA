# Documentação do Painel e Versionamento (CGB Dashboard)

**Sistema:** Gestão e Acompanhamento de Pátio - COA  
**Aeroporto:** Aeroporto Internacional de Cuiabá / Marechal Rondon (CGB - SBCY)  
**Versão Atual:** `v1.8.2`  
**Data:** 18 de Setembro de 2026  
**Linguagem & Frameworks:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, Capacitor v8  

---

## 1. Visão Geral do Projeto

Este dashboard foi projetado sob medida para a equipe de fiscalização de pátio, administração aeroportuária e executivos de operações do **Aeroporto Internacional de Cuiabá (CGB - SBCY)**. A aplicação consome, sincroniza e gerencia os dados de pousos, companhias operantes, modalidade de desembarque e controle multiousuário.

---

## 2. Estrutura da Base de Dados (Híbrida & Cloud Sync)

O sistema opera com múltiplas camadas de dados para garantir resiliência, segurança e sincronização:
1. **LocalStorage:** Cache de alta performance para operação diária e offline.
2. **Supabase (PostgreSQL):** Banco de dados relacional em nuvem com sincronização offline-first (`syncService`) e políticas RLS avançadas para `movimentacoes` e `profiles`.
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

### Versão 1.8.2 — (18/09/2026)
- **Correção e Otimização de Sincronização Supabase:** Ajustes robustos nas políticas RLS e inclusão da coluna `user_email` na tabela `movimentacoes` para garantir sucesso absoluto no upload/sync de dados em nuvem.
- **Dashboard Interativo e Moderno:** Aprimoramento visual completo dos gráficos analíticos (`VisualCharts.tsx`) e cartões KPI (`KPIScorecards.tsx`).
- **Defesas Avançadas contra Bots (Segurança):** Implementação de Honeypot e Rate Limiting no formulário de cadastro.
- **Fluxo Robusto de Aprovação de Usuários:** Controles rigorosos de aprovação de contas e restrições de acesso por perfil (RBAC) com autocriação de perfil (*Self-Healing*).

### Versão 1.6.0 — (08/09/2026)
- **Fluxo de Aprovação de Novos Usuários:** Implementado sistema onde novos cadastros iniciam como pendentes (`approved: false`) e exigem aprovação explícita de um Administrador na tela de Gestão de Equipe.
- **Restrição de Acessos por Nível (RBAC):** Usuários comuns (`operator`) agora têm acesso restrito estritamente a Pátio, Pousos, Relatórios e Segurança.
- **Proteção Antirregressão de Administradores:** Adicionada trava de segurança na interface e no banco de dados que impede a exclusão ou rebaixamento do último administrador ativo no sistema.
- **Importação Web de Backup:** Adicionado suporte completo para importação de arquivos de backup `.json` na versão web.

### Versão 1.5.0 — (13/08/2026)
- **Integração Supabase (Cloud):** Início da migração para arquitetura Cloud Sync.
- **Autenticação de Usuários:** Implementação de tela de Login e controle de acesso (Operador vs Administrador).
- **Offline-First Sync:** Sistema de fila de sincronização para garantir funcionamento sem internet e envio automático de dados.

### Versão 1.3.1 — (09/08/2026)
- **Nova Identidade Visual:** Sistema renomeado para **"Gestão e Acompanhamento de Pátio - COA"**.
- **Header Unificado:** Versão do sistema e nome oficial integrados na faixa azul superior.
- **Otimização de PDF:** Compressão de arquivos PDF para compartilhamento mais rápido.
- **Inclusão da FAB:** Adicionada a "Forças Armadas Brasileiras" à lista oficial.

### Versão 1.0.0 — (22/07/2026)
- **Lançamento Inicial:** Dashboards executivos, gráficos Recharts e tabela analítica.
