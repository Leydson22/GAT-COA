# 🗄️ Supabase Database Schema & Migration Reference (CGB Dashboard)

Este documento (`supabase.md`) rastreia a evolução da estrutura do banco de dados relacional no **Supabase (PostgreSQL)**, contendo os scripts SQL necessários para configurar do zero todas as tabelas, políticas de segurança (RLS), índices e permissões para que o sistema funcione perfeitamente.

---

## 📌 Versão Atual: `v1.8.0`

### 📋 Visão Geral das Tabelas
1. **`profiles`**: Armazena os perfis de usuários, níveis de acesso (`admin` vs `operator`) e status de aprovação (`approved`).
2. **`movimentacoes`**: Armazena o histórico completo de pousos, movimentações em pátio, modalidade de desembarque híbrido e identificador do operador (`user_id` e `user_email`).

---

## 🛠️ Script SQL Completo (Setup Inicial / Versão 1.8.0)

Execute o script SQL abaixo no **SQL Editor** do seu projeto no Supabase para criar ou atualizar a estrutura completa:

```sql
-- =====================================================================
-- CGB DASHBOARD - SUPABASE SETUP SCRIPT (Versão 1.8.0)
-- =====================================================================

-- 1. Tabela de Perfis de Usuários (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'operator' check (role in ('admin', 'operator')),
  approved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Movimentações e Pousos (Movimentacoes)
create table if not exists public.movimentacoes (
  id_registro text primary key,
  user_id uuid references auth.users on delete set null,
  user_email text,
  matricula text not null,
  id_companhia text not null,
  nome_companhia text not null,
  desembarque_hibrido text not null check (desembarque_hibrido in ('Sim', 'Não')),
  posicao_patio text,
  horario_cadastro text not null,
  data_cadastro text not null,
  tipo_aeronave text,
  status_edicao text,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Índices para Otimização de Busca e Sincronização
create index if not exists idx_movimentacoes_user_id on public.movimentacoes(user_id);
create index if not exists idx_movimentacoes_data on public.movimentacoes(data_cadastro);
create index if not exists idx_movimentacoes_matricula on public.movimentacoes(matricula);

-- =====================================================================
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- =====================================================================

-- Habilitar RLS nas tabelas
alter table public.profiles enable row level security;
alter table public.movimentacoes enable row level security;

-- Políticas para 'profiles'
drop policy if exists "Permitir leitura de perfis para autenticados" on public.profiles;
create policy "Permitir leitura de perfis para autenticados"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Permitir atualização de perfis para administradores ou próprio usuário" on public.profiles;
create policy "Permitir atualização de perfis para administradores ou próprio usuário"
  on public.profiles for update
  using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Permitir inserção de perfil no cadastro" on public.profiles;
create policy "Permitir inserção de perfil no cadastro"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Permitir exclusão de perfis por administradores" on public.profiles;
create policy "Permitir exclusão de perfis por administradores"
  on public.profiles for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- Políticas para 'movimentacoes'
drop policy if exists "Permitir leitura de movimentações" on public.movimentacoes;
create policy "Permitir leitura de movimentações"
  on public.movimentacoes for select
  using (
    auth.role() = 'authenticated' and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or user_id = auth.uid()
    )
  );

drop policy if exists "Permitir inserção e atualização de movimentações" on public.movimentacoes;
create policy "Permitir inserção e atualização de movimentações"
  on public.movimentacoes for upsert
  with check (
    auth.role() = 'authenticated' and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or user_id = auth.uid()
    )
  );

drop policy if exists "Permitir exclusão de movimentações" on public.movimentacoes;
create policy "Permitir exclusão de movimentações"
  on public.movimentacoes for delete
  using (
    auth.role() = 'authenticated' and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or user_id = auth.uid()
    )
  );
