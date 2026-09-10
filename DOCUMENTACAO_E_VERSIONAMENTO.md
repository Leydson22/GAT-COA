# Documentação do Painel e Versionamento (CGB Dashboard)

**Sistema:** Gestão e Acompanhamento de Pátio - COA  
**Aeroporto:** Aeroporto Internacional de Cuiabá / Marechal Rondon (CGB - SBCY)  
**Versão Atual:** `v1.8.0`  
**Data:** 08 de Setembro de 2026  
**Linguagem & Frameworks:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, Capacitor v8  

---

## 1. Visão Geral do Projeto

Este dashboard foi projetado sob medida para a equipe de fiscalização de pátio, administração aeroportuária e executivos de operações do **Aeroporto Internacional de Cuiabá (CGB - SBCY)**. A aplicação consome, sincroniza e gerencia os dados de pousos, companhias operantes, modalidade de desembarque e controle multiousuário.

---

## 2. Estrutura da Base de Dados (Híbrida & Cloud Sync)

O sistema opera com múltiplas camadas de dados para garantir resiliência, segurança e sincronização:
1. **LocalStorage:** Cache de alta performance para operação diária e offline.
2. **Supabase (PostgreSQL):** Banco de dados relacional em nuvem com sincronização offline-first (`syncService`).
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

### Versão 1.8.0 — (08/09/2026)
- **Sincronização Cloud Restrita por Perfil (Operator vs Admin):** Usuários comuns (operadores) agora realizam upload e download restritos exclusivamente aos seus próprios registros (`user_id`), enquanto administradores operam sobre a base global.
- **Proteção de Limpeza Definitiva:** Ações destrutivas e de manutenção global (Limpeza de Pousos, Limpeza de Logs e Reset Total) foram restritas exclusivamente a Administradores.
- **Baixar da Nuvem & Progresso Circular:** Sincronização reversa do Supabase para o dispositivo com barra de progresso em formato de círculo e valor centralizado.
- **Ordenação Padrão por Recência & Toggle Up/Down ("Recentes" / "Antigos"):** Listagens organizadas por padrão do mais recente para o mais antigo, com botão de alternância intuitivo.
- **Correções de Relatórios & PDF:** Correção no escopo de dados do `ExportModal` e no wrapper `#report-container` para exportação de PDFs.

### Versão 1.7.3 — (08/09/2026)
- **Correção no Filtro de Relatórios (ExportModal):** Base completa autorizada repassada ao modal para evitar relatórios em branco.

### Versão 1.7.2 — (08/09/2026)
- **Correção no Container de Relatórios PDF:** Adicionado `id="report-container"` no DOM.

### Versão 1.7.1 — (08/09/2026)
- **Sessão Persistente Offline:** Acesso contínuo offline sem nova exigência de login/senha após o primeiro acesso.

### Versão 1.7.0 — (08/09/2026)
- **Modo Offline-First com Sincronização Inteligente:** Sincronização automática e indicador sutil de conexão no cabeçalho.

### Versão 1.6.0 — (08/09/2026)
- **Fluxo de Aprovação de Novos Usuários & RBAC:** Aprovação prévia por administrador e restrição por perfil.

### Versão 1.5.0 — (13/08/2026)
- **Integração Supabase (Cloud) & Autenticação:** Início da migração para arquitetura Cloud Sync.

### Versão 1.3.1 — (09/08/2026)
- **Nova Identidade Visual & Otimização de PDF:** Sistema renomeado para "Gestão e Acompanhamento de Pátio - COA".

### Versão 1.0.0 — (22/07/2026)
- **Lançamento Inicial:** Dashboards executivos, gráficos Recharts e tabela analítica.
