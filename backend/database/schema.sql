-- Schema for the Finvo application database

BEGIN;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables
\ir functions.sql
\ir create_companies_table.sql
\ir create_clients_table.sql
\ir create_projects_table.sql
\ir create_invoices_table.sql
\ir create_invoice_details_table.sql
\ir create_links_table.sql
\ir create_user_preferences_table.sql
\ir create_invoice_counters_table.sql
\ir create_invoice_counters.sql

COMMIT;

-- Create the projects table
create table if not exists public.projects (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    project_name text not null,
    client_name text not null,
    number_of_files bigint not null,
    unit_price numeric(12,2) not null,
    total numeric(15,2) not null,
    project_status text not null,
    payment_status text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create an index on user_id for better query performance
create index if not exists projects_user_id_idx on public.projects(user_id);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;

-- Create RLS policies
-- Allow users to select only their own projects
create policy "Users can view their own projects"
    on public.projects
    for select
    using (auth.uid() = user_id);

-- Allow users to insert only their own projects
create policy "Users can create their own projects"
    on public.projects
    for insert
    with check (auth.uid() = user_id);

-- Allow users to update only their own projects
create policy "Users can update their own projects"
    on public.projects
    for update
    using (auth.uid() = user_id);

-- Allow users to delete only their own projects
create policy "Users can delete their own projects"
    on public.projects
    for delete
    using (auth.uid() = user_id);

-- Create the companies table
create table if not exists public.companies (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    address text not null,
    email text,
    phone text,
    gst text,
    pan text,
    bank_details jsonb default '{}'::jsonb,
    logo_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create an index on user_id for better query performance
create index if not exists companies_user_id_idx on public.companies(user_id);

-- Enable Row Level Security (RLS)
alter table public.companies enable row level security;

-- Create RLS policies
-- Allow users to select only their own companies
create policy "Users can view their own companies"
    on public.companies
    for select
    using (auth.uid() = user_id);

-- Allow users to insert only their own companies
create policy "Users can create their own companies"
    on public.companies
    for insert
    with check (auth.uid() = user_id);

-- Allow users to update only their own companies
create policy "Users can update their own companies"
    on public.companies
    for update
    using (auth.uid() = user_id);

-- Allow users to delete only their own companies
create policy "Users can delete their own companies"
    on public.companies
    for delete
    using (auth.uid() = user_id);

-- Create storage bucket for company logos
insert into storage.buckets (id, name, public) values ('company_logos', 'company_logos', true)
on conflict (id) do nothing;

-- Enable RLS for storage
create policy "Users can view any company logo"
    on storage.objects for select
    using ( bucket_id = 'company_logos' );

create policy "Users can upload company logos"
    on storage.objects for insert
    with check ( bucket_id = 'company_logos' AND auth.role() = 'authenticated' );

create policy "Users can update their own company logos"
    on storage.objects for update
    using ( bucket_id = 'company_logos' AND auth.uid() = owner );

create policy "Users can delete their own company logos"
    on storage.objects for delete
    using ( bucket_id = 'company_logos' AND auth.uid() = owner );

-- Create updated_at trigger function if not exists
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create trigger for updated_at on projects
create trigger handle_projects_updated_at
    before update on public.projects
    for each row
    execute function public.handle_updated_at();

-- Create trigger for updated_at on companies
create trigger handle_companies_updated_at
    before update on public.companies
    for each row
    execute function public.handle_updated_at();

-- Create the clients table
create table if not exists public.clients (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    company_details text not null,
    has_gst text not null,
    gst_number text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create an index on user_id for better query performance
create index if not exists clients_user_id_idx on public.clients(user_id);

-- Enable Row Level Security (RLS)
alter table public.clients enable row level security;

-- Create RLS policies
-- Allow users to select only their own clients
create policy "Users can view their own clients"
    on public.clients
    for select
    using (auth.uid() = user_id);

-- Allow users to insert only their own clients
create policy "Users can create their own clients"
    on public.clients
    for insert
    with check (auth.uid() = user_id);

-- Allow users to update only their own clients
create policy "Users can update their own clients"
    on public.clients
    for update
    using (auth.uid() = user_id);

-- Allow users to delete only their own clients
create policy "Users can delete their own clients"
    on public.clients
    for delete
    using (auth.uid() = user_id);

-- Create trigger for updated_at on clients
create trigger handle_clients_updated_at
    before update on public.clients
    for each row
    execute function public.handle_updated_at(); 