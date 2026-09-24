# 🗄️ Supabase Database Schema & RLS Policies Reference (CGB Dashboard - v1.8.1)

Este documento (`supabase.md`) rastreia a estrutura do banco de dados no **Supabase (PostgreSQL)** e traz a correção definitiva para as políticas de **Row Level Security (RLS)**, garantindo que as operações de `.upsert()` (utilizadas na sincronização offline-first) funcionem sem falhas.

---

## 🛠️ Script SQL para Correção das Políticas RLS no Supabase

Copie e execute o script abaixo no **SQL Editor** do seu painel no Supabase. 

> ⚠️ **Por que ocorria a falha de sincronização (0 arquivos enviados)?**  
> O PostgreSQL não reconhece o comando `FOR UPSERT` em políticas RLS. Como o método `.upsert()` do Supabase realiza internamente uma operação de **INSERT** ou **UPDATE** (conforme a existência da chave primária `id_registro`), o banco exigia políticas separadas de `FOR INSERT` e `FOR UPDATE`. O script abaixo corrige exatamente isso.

```sql
-- =====================================================================
-- CGB DASHBOARD - CORREÇÃO DE POLÍTICAS RLS (Versão 1.8.1)
-- =====================================================================

-- 1. Garantir que RLS está habilitado nas tabelas
alter table public.profiles enable row level security;
alter table public.movimentacoes enable row level security;

-- =====================================================================
-- 2. POLÍTICAS PARA A TABELA 'profiles'
-- =====================================================================
drop policy if exists "Permitir leitura de perfis" on public.profiles;
create policy "Permitir leitura de perfis"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Permitir inserção de perfil no cadastro" on public.profiles;
create policy "Permitir inserção de perfil no cadastro"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Permitir atualização de perfis" on public.profiles;
create policy "Permitir atualização de perfis"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Permitir exclusão de perfis" on public.profiles;
create policy "Permitir exclusão de perfis"
  on public.profiles for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- =====================================================================
-- 3. POLÍTICAS PARA A TABELA 'movimentacoes' (Correção do Upsert)
-- =====================================================================

-- Remover políticas antigas incorretas
drop policy if exists "Permitir leitura de movimentações" on public.movimentacoes;
drop policy if exists "Permitir inserção e atualização de movimentações" on public.movimentacoes;
drop policy if exists "Permitir exclusão de movimentações" on public.movimentacoes;
drop policy if exists "Permitir inserção de movimentações" on public.movimentacoes;
drop policy if exists "Permitir atualização de movimentações" on public.movimentacoes;

-- A. Política de LEITURA (SELECT)
create policy "Permitir leitura de movimentações"
  on public.movimentacoes for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );

-- B. Política de INSERÇÃO (INSERT) - Obrigatória para novos registros no Upsert
create policy "Permitir inserção de movimentações"
  on public.movimentacoes for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );

-- C. Política de ATUALIZAÇÃO (UPDATE) - Obrigatória para atualizar registros existentes no Upsert
create policy "Permitir atualização de movimentações"
  on public.movimentacoes for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );

-- D. Política de EXCLUSÃO (DELETE)
create policy "Permitir exclusão de movimentações"
  on public.movimentacoes for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );
