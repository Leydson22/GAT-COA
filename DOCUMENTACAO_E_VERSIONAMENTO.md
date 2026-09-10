# Documentação do Painel e Versionamento (CGB Dashboard)

**Sistema:** Gestão e Acompanhamento de Pátio - COA  
**Aeroporto:** Aeroporto Internacional de Cuiabá / Marechal Rondon (CGB - SBCY)  
**Versão Atual:** `v1.7.3`  
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

### Versão 1.7.3 — (08/09/2026)
- **Correção no Filtro de Relatórios (ExportModal):** Ajustado o escopo de dados enviado ao modal de relatórios para utilizar a base completa autorizada (`movimentacoesPermitidas`) em vez de dados pré-filtrados pelo painel principal. Isso corrige definitivamente a geração de documentos em branco e garante que os filtros de período (Hoje, Semana, Mês, Customizado) e de Companhia funcionem corretamente no celular e desktop.

### Versão 1.7.2 — (08/09/2026)
- **Correção no Container de Relatórios PDF:** Adicionado o atributo `id="report-container"` no elemento container DOM responsável pela renderização e captura de relatórios para exportação PDF (`html2canvas`), solucionando o erro *"Container do relatório não encontrado"*.

### Versão 1.7.1 — (08/09/2026)
- **Sessão Persistente Offline:** Acesso contínuo offline sem nova exigência de login/senha após o primeiro acesso, preservando a sessão localmente até que o usuário decida sair explicitamente (`Sair`).
- **Sincronização Cloud Condicional:** Integração e envio de dados para o Supabase restritos exclusivamente a momentos em que o dispositivo está conectado online à rede.

### Versão 1.7.0 — (08/09/2026)
- **Modo Offline-First com Sincronização Inteligente:** Arquitetura robusta onde todos os dados inseridos ou editados são salvos localmente e sincronizados automaticamente com o Supabase ao restabelecer a conexão com a internet.
- **Indicador Sutil de Conexão no Ícone (Header):** O ícone de avião (`Plane`) no cabeçalho superior esquerdo (`Header.tsx`) indica dinamicamente o status de conectividade e sincronização.
- **Barra de Progresso de Sincronização:** Adicionada barra de progresso em tempo real na tela de Segurança durante o envio em lote da base local para o Supabase.
- **Gestão de Usuários por Ícones:** Tela de administração de equipe reformulada com botões baseados em ícones compactos e intuitivos.
- **Atribuição de Usuários e Logs:** Rastreabilidade completa de qual operador inseriu ou modificou cada registro no sistema.

### Versão 1.6.0 — (08/09/2026)
- **Fluxo de Aprovação de Novos Usuários:** Implementado sistema onde novos cadastros iniciam como pendentes (`approved: false`) e exigem aprovação explícita de um Administrador.
- **Restrição de Acessos por Nível (RBAC):** Usuários comuns (`operator`) agora têm acesso restrito estritamente a Pátio, Pousos, Relatórios e Segurança.

### Versão 1.5.0 — (13/08/2026)
- **Integração Supabase (Cloud) & Autenticação:** Início da migração para arquitetura Cloud Sync.

### Versão 1.3.1 — (09/08/2026)
- **Nova Identidade Visual & Otimização de PDF:** Sistema renomeado para "Gestão e Acompanhamento de Pátio - COA" com compressão JPEG/PDF otimizada.

### Versão 1.0.0 — (22/07/2026)
- **Lançamento Inicial:** Dashboards executivos, gráficos Recharts e tabela analítica.
