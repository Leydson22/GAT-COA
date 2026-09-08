# Gestão e Acompanhamento de Pátio - COA

Sistema executivo e operacional para monitoramento de movimentações de aeronaves no **Aeroporto Internacional de Cuiabá (CGB - SBCY)**.

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.6.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-8-emerald)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-cyan)

## ✈️ Visão Geral
Este aplicativo foi desenvolvido para auxiliar a fiscalização de pátio e a gerência aeroportuária na coleta de dados de pousos, análise de performance (BI), controle multiousuário e geração de relatórios oficiais. O sistema opera de forma híbrida, integrando-se ao ecossistema Supabase Cloud com sincronização offline-first e ferramentas de backup profissional.

## 🚀 Funcionalidades Principais
- **Lançamento de Pátio:** Fluxo de cadastro rápido e simplificado em 5 etapas otimizado para celulares.
- **Business Intelligence:** Gráficos interativos de Market Share, Volumetria e Tendência de Performance (acesso exclusivo para administradores).
- **Controle de Acessos & Aprovação:** Sistema de aprovação de novos cadastros e permissões granulares por perfil (`admin` vs `operator`).
- **Relatórios Profissionais:** Geração de PDFs (Turno, BI, Operacional) e planilhas CSV com compartilhamento nativo.
- **Segurança de Dados:** Sistema de "Máquina do Tempo" com snapshots internos, importação/exportação de JSON e sincronização com Supabase.
- **Modo Offline:** Funciona totalmente sem internet, enfileirando dados localmente para sincronização automática ao detectar conexão.

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend / Auth:** Supabase (PostgreSQL, Auth RLS).
- **Gráficos:** Recharts.
- **Mobile:** Ionic Capacitor.
- **PDF:** jsPDF & html2canvas.

## 📂 Documentação Detalhada
Para detalhes técnicos sobre o banco de dados, fórmulas e histórico de mudanças, consulte:
- [Documentação Técnica e Modelagem](DOCUMENTACAO_CGB.md)
- [Histórico de Versões e Mudanças](DOCUMENTACAO_E_VERSIONAMENTO.md)

## 💻 Desenvolvimento Local
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Gere o APK de Debug:
   ```bash
   ./executar_android.sh
   ```

---
*© 2026 Centro-Oeste Airports (COA) - Área de Operações CGB*
