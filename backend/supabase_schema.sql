-- ============================================================
-- MediAI — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Patients ───────────────────────────────────────────────
create table if not exists patients (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  mobile     text not null unique,
  age        int  not null check (age >= 0 and age <= 120),
  gender     text not null check (gender in ('male', 'female', 'other')),
  password   text not null,           -- bcrypt hashed
  created_at timestamptz default now()
);

-- ── Doctors ────────────────────────────────────────────────
create table if not exists doctors (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  email               text not null unique,
  mobile              text not null,
  specialization      text not null,
  registration_number text not null,
  password            text not null,  -- bcrypt hashed
  created_at          timestamptz default now()
);

-- ── Reports ────────────────────────────────────────────────
create table if not exists reports (
  id                 uuid primary key default uuid_generate_v4(),
  patient_id         uuid not null references patients(id) on delete cascade,
  file_name          text,
  file_path          text,            -- path in Supabase Storage bucket
  report_type        text not null check (report_type in ('blood','xray','ecg','ctscan','mri','other')),
  severity           text not null check (severity in ('normal','borderline','urgent')),
  summary            text,
  key_findings       text[],          -- array of findings
  what_to_do         text,
  doctor_notes       text,            -- technical notes for doctors
  raw_extracted_text text,
  created_at         timestamptz default now()
);

-- Index for fast patient report lookup
create index if not exists idx_reports_patient_id on reports(patient_id);
create index if not exists idx_reports_created_at on reports(created_at desc);
create index if not exists idx_patients_mobile    on patients(mobile);

-- ── Storage Bucket ─────────────────────────────────────────
-- Run this too — creates the bucket for file uploads
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- ── Row Level Security ─────────────────────────────────────
-- We use the service key in our backend so RLS won't block us,
-- but it's good practice to define these policies anyway.

alter table patients enable row level security;
alter table doctors  enable row level security;
alter table reports  enable row level security;

-- Allow service role to do everything (our backend uses this)
create policy "service_role_patients" on patients for all using (true);
create policy "service_role_doctors"  on doctors  for all using (true);
create policy "service_role_reports"  on reports  for all using (true);