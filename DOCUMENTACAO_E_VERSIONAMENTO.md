# Documentação do Painel e Versionamento (CGB Dashboard)

**Sistema:** Gestão e Acompanhamento de Pátio - COA  
**Aeroporto:** Aeroporto Internacional de Cuiabá / Marechal Rondon (CGB - SBCY)  
**Versão Atual:** `v1.6.0`  
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

### Versão 1.6.0 — (08/09/2026)
- **Fluxo de Aprovação de Novos Usuários:** Implementado sistema onde novos cadastros iniciam como pendentes (`approved: false`) e exigem aprovação explícita de um Administrador na tela de Gestão de Equipe.
- **Restrição de Acessos por Nível (RBAC):** Usuários comuns (`operator`) agora têm acesso restrito estritamente a Pátio, Pousos, Relatórios e Segurança (ocultando painéis de Administração e Gestão de Equipe).
- **Proteção Antirregressão de Administradores:** Adicionada trava de segurança na interface e no banco de dados que impede a exclusão ou rebaixamento do último administrador ativo no sistema.
- **Importação Web de Backup:** Adicionado botão e suporte completo para importação de arquivos de backup `.json` na versão web.
- **Validação de Duplicidade:** Tratamento e mensagens amigáveis em português para tentativas de cadastro com e-mails já existentes.

### Versão 1.5.0 — (13/08/2026)
- **Integração Supabase (Cloud):** Início da migração para arquitetura Cloud Sync.
- **Autenticação de Usuários:** Implementação de tela de Login e controle de acesso (Operador vs Administrador).
- **Offline-First Sync:** Sistema de fila de sincronização para garantir funcionamento sem internet e envio automático de dados ao detectar conexão.
- **Base de Dados Online:** Migração dos registros de LocalStorage para PostgreSQL (Supabase) com redundância local.
- **Painel Administrativo Multiusuário:** Visualização consolidada de dados de toda a equipe de pátio.

### Versão 1.3.1 — (09/08/2026)
- **Nova Identidade Visual:** Sistema renomeado para **"Gestão e Acompanhamento de Pátio - COA"**.
- **Header Unificado:** Versão do sistema e nome oficial integrados diretamente na faixa azul superior.
- **Otimização de PDF:** Implementada compressão de arquivos PDF (JPEG 75% e escala 1.5). Redução de até 70% no peso dos arquivos.
- **Inclusão da FAB:** Adicionada a "Forças Armadas Brasileiras" à lista oficial com identidade visual militar dedicada.
- **BI Refinado:** Novo filtro "Somente Companhias Aéreas" na administração.

### Versão 1.3.0 — (09/08/2026)
- **Gestão Total de Ativos:** Capacidade de Adicionar, Editar e Excluir **Empresas**, **Prefixos** e **Posições** diretamente pelo celular.
- **Filtros Rápidos:** Botões Hoje, Semana e Mês com lógica de autolimpeza de conflitos.
- **Grid Simétrico:** Reorganização dos números de pátio em grade fixa centralizada.

### Versão 1.1.2 — (30/07/2026)
- **Central de Segurança & Backup:** Nova tela independente para gestão de resiliência.
- **Máquina do Tempo:** Sistema de snapshots internos no celular.
- **Salvaguarda de Saída:** Pergunta automática de backup antes de fechar o aplicativo.

### Versão 1.1.0 — (29/07/2026)
- **Exportação Nativa:** Implementação de compartilhamento via Capacitor Share no Android.
- **Correção 'oklch':** Sanitização de CSS para compatibilidade de cores.

### Versão 1.0.0 — (22/07/2026)
- **Lançamento Inicial:** Dashboards executivos, gráficos Recharts e tabela analítica.
