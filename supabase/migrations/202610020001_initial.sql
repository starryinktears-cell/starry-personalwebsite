create extension if not exists "pgcrypto";

do $$ begin create type public.project_status as enum ('draft', 'published', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.asset_kind as enum ('image', 'video'); exception when duplicate_object then null; end $$;
do $$ begin create type public.asset_status as enum ('uploading', 'uploaded', 'processing', 'ready', 'failed', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.inquiry_status as enum ('unread', 'read', 'archived'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null, title text not null, summary text, body text, year int,
  category text not null, tags text[] not null default '{}', status public.project_status not null default 'draft',
  featured boolean not null default false, cover_asset_id uuid, location text, client text,
  sort_order int not null default 0, published_at timestamptz, deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique(owner_id, slug)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  kind public.asset_kind not null, name text not null, storage_path text not null, poster_path text,
  mime_type text not null, byte_size bigint not null default 0, width int, height int, duration_ms int,
  alt_text text not null default '', status public.asset_status not null default 'uploading',
  processing_error text, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

alter table public.projects drop constraint if exists projects_cover_asset_id_fkey;
alter table public.projects add constraint projects_cover_asset_id_fkey foreign key (cover_asset_id) references public.assets(id) on delete set null;

create table if not exists public.project_assets (
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  position int not null default 0,
  primary key(project_id, asset_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, unique(owner_id, name)
);

create table if not exists public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(project_id, tag_id)
);

create table if not exists public.site_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  site_name text not null default 'STUDIO / 01', short_bio text, contact_email text, hero_title text,
  hero_subtitle text, hero_asset_id uuid references public.assets(id) on delete set null,
  accent text not null default '#626a4c', social_links jsonb not null default '[]'::jsonb,
  navigation jsonb not null default '{}'::jsonb, seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete cascade,
  name text not null, email text not null, project_type text, budget text, desired_date date, message text not null,
  consent_at timestamptz not null, status public.inquiry_status not null default 'unread', private_note text,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.upload_tasks (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null, storage_path text not null,
  status public.asset_status not null default 'uploading', bytes_uploaded bigint not null default 0, bytes_total bigint not null default 0,
  error text, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete set null,
  action text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_public_idx on public.projects(status, featured, sort_order);
create index if not exists assets_owner_status_idx on public.assets(owner_id, status);
create index if not exists inquiries_owner_status_idx on public.inquiries(owner_id, status, created_at desc);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists assets_updated_at on public.assets;
create trigger assets_updated_at before update on public.assets for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists inquiries_updated_at on public.inquiries;
create trigger inquiries_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
drop trigger if exists upload_tasks_updated_at on public.upload_tasks;
create trigger upload_tasks_updated_at before update on public.upload_tasks for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.assets enable row level security;
alter table public.project_assets enable row level security;
alter table public.tags enable row level security;
alter table public.project_tags enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;
alter table public.upload_tasks enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public" on public.projects for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists "owners manage projects" on public.projects;
create policy "owners manage projects" on public.projects for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "published project assets are public" on public.project_assets;
create policy "published project assets are public" on public.project_assets for select to anon, authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published' and p.deleted_at is null));
drop policy if exists "owners manage project assets" on public.project_assets;
create policy "owners manage project assets" on public.project_assets for all to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

drop policy if exists "published assets are public" on public.assets;
create policy "published assets are public" on public.assets for select to anon, authenticated using (status = 'ready' and exists (select 1 from public.project_assets pa join public.projects p on p.id = pa.project_id where pa.asset_id = assets.id and p.status = 'published' and p.deleted_at is null));
drop policy if exists "owners manage assets" on public.assets;
create policy "owners manage assets" on public.assets for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "owners manage tags" on public.tags;
create policy "owners manage tags" on public.tags for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "owners manage project tags" on public.project_tags;
create policy "owners manage project tags" on public.project_tags for all to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
drop policy if exists "owners manage settings" on public.site_settings;
create policy "owners manage settings" on public.site_settings for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "owners read inquiries" on public.inquiries;
create policy "owners read inquiries" on public.inquiries for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "owners update inquiries" on public.inquiries;
create policy "owners update inquiries" on public.inquiries for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "public can create inquiries" on public.inquiries;
create policy "public can create inquiries" on public.inquiries for insert to anon, authenticated with check (owner_id is null);
drop policy if exists "owners manage upload tasks" on public.upload_tasks;
create policy "owners manage upload tasks" on public.upload_tasks for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "owners read audit logs" on public.audit_logs;
create policy "owners read audit logs" on public.audit_logs for select to authenticated using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public) values ('portfolio-media', 'portfolio-media', false) on conflict (id) do nothing;
drop policy if exists "owners upload private media" on storage.objects;
create policy "owners upload private media" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners read private media" on storage.objects;
create policy "owners read private media" on storage.objects for select to authenticated using (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners update private media" on storage.objects;
create policy "owners update private media" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners delete private media" on storage.objects;
create policy "owners delete private media" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
