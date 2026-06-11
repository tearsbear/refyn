-- Profile Data Table
-- Stores the master resume
create table profile_data (
  id uuid primary key default gen_random_uuid(),
  summary text,
  resume_json jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resume Generations Table
-- Stores complete generation history
create table resume_generations (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_description text,
  job_description text,
  ai_model text not null,
  analysis_json jsonb not null,
  generated_resume_json jsonb not null,
  generated_summary text,
  pdf_path text,
  created_at timestamptz default now()
);

-- Note: pdf_path is nullable since PDFs are now exported via browser print
-- instead of being uploaded to storage
