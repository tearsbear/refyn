# AI Resume Tailor - Final Implementation Plan

## Project Overview

A personal AI-powered resume tailoring system that generates company-specific resumes from a structured master resume.

The system should:

- Analyze company information and job descriptions
- Rewrite every summary, experience bullet, and project bullet
- Preserve factual accuracy
- Maintain ATS compatibility
- Keep the existing resume layout unchanged
- Generate PDF resumes
- Save generation history
- Allow future regeneration without additional AI calls

---

# Goals

## Primary Goal

Transform a master resume into a tailored resume for a specific company and role.

## Non-Goals

The system should not:

- Generate resumes from scratch
- Invent achievements
- Invent metrics
- Invent technologies
- Invent responsibilities
- Modify resume layout
- Parse PDFs repeatedly

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod

## Backend

- Next.js Route Handlers
- Supabase

## AI

Provider:

```text
https://openagentic.id/api/v1
```

Model:

```text
claude-sonnet-4.6
```

## PDF Generation

```text
HTML
↓
Playwright
↓
PDF
```

---

# Architecture

```text
User Input
    │
    ▼
Company Name
Company Description
Job Description
    │
    ▼
Load Master Resume JSON
    │
    ▼
AI Job Analysis
    │
    ▼
AI Resume Tailoring
    │
    ▼
Generated Resume JSON
    │
    ▼
HTML Renderer
    │
    ▼
Playwright PDF
    │
    ▼
Save History
```

---

# Source of Truth

The source of truth is:

```text
profile_data.resume_json
```

The AI must never use:

- PDF
- DOCX
- Generated Resume PDF

The AI must always use:

```text
profile_data.resume_json
```

---

# Resume Template

Store the ATS-friendly HTML template inside the project.

```text
src/
├── assets/
│   └── resume-template.html
```

Rules:

- Layout never changes
- Styling never changes
- Structure never changes
- Only content changes

---

# Resume JSON Structure

```json
{
  "summary": "",
  "experiences": [],
  "projects": [],
  "skills": []
}
```

Example:

```json
{
  "summary": "Full Stack Engineer with strong frontend expertise...",

  "experiences": [
    {
      "company": "Diquest",
      "role": "Frontend Developer",
      "startDate": "2024",
      "endDate": "Present",
      "technologies": ["Next.js", "React", "TypeScript"],
      "bullets": []
    }
  ],

  "projects": [],

  "skills": []
}
```

---

# AI Rules

## Rewrite Everything

The AI must rewrite:

- Summary
- Experience bullets
- Project bullets

No bullet should remain unchanged.

---

## Preserve Facts

AI may:

- Rephrase
- Reorder
- Reframe
- Improve clarity
- Improve relevance

AI may not:

- Invent metrics
- Invent achievements
- Invent technologies
- Invent dates
- Invent responsibilities
- Invent company information

---

## Improve Impact

Convert responsibility-based statements into impact-oriented statements.

Example:

Before:

```text
Built reusable UI components.
```

After:

```text
Built and maintained reusable UI components that improved consistency across multiple products and accelerated development workflows.
```

Without inventing outcomes.

---

# Anti AI Slop Requirements

All prompts must follow:

```text
design.md
skill.md
```

The AI should avoid:

- Generic buzzwords
- Empty marketing language
- Repetitive AI phrasing
- Keyword stuffing

Forbidden examples:

```text
Passionate developer
Results-driven engineer
Highly motivated individual
Strong communication skills
Team player
Hard-working professional
```

Desired output:

```text
Human
Specific
Credible
Professional
Impact-focused
```

---

# User Flow

## Step 1

User enters:

```text
Company Name
Company Description
Job Description
```

---

## Step 2

Load:

```text
profile_data.resume_json
```

---

## Step 3

AI Job Analysis

Input:

- Company Name
- Company Description
- Job Description

Output:

```json
{
  "role": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "companyValues": [],
  "companyFocus": []
}
```

---

## Step 4

AI Resume Tailoring

Input:

- Resume JSON
- Analysis Output

Output:

```json
{
  "summary": "",
  "experiences": [],
  "projects": [],
  "skills": []
}
```

Rules:

- Rewrite every bullet
- Preserve facts
- Improve relevance
- Improve impact
- No hallucinations

---

## Step 5

HTML Rendering

Inject generated content into:

```html
{{SUMMARY}} {{EXPERIENCES}} {{PROJECTS}} {{SKILLS}}
```

Template:

```text
src/assets/resume-template.html
```

---

## Step 6

Generate PDF

Filename:

```text
{CompanyName}_JiehanAnandika_Resume.pdf
```

Example:

```text
OpenAI_JiehanAnandika_Resume.pdf
```

---

## Step 7

Upload PDF

Storage Bucket:

```text
generated-resumes
```

Folder Structure:

```text
generated-resumes/

OpenAI/
  OpenAI_JiehanAnandika_Resume.pdf

Google/
  Google_JiehanAnandika_Resume.pdf
```

---

# Database Schema

## profile_data

Stores the master resume.

```sql
create table profile_data (
  id uuid primary key default gen_random_uuid(),

  summary text,

  resume_json jsonb not null,

  created_at timestamptz default now(),

  updated_at timestamptz default now()
);
```

---

## resume_generations

Stores complete generation history.

```sql
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
```

---

# Why Store analysis_json

Benefits:

- Debug prompt quality
- Understand AI reasoning
- Compare companies
- Improve future prompts
- Review why certain skills were emphasized

Example:

```json
{
  "role": "Frontend Engineer",

  "requiredSkills": ["React", "TypeScript"],

  "companyValues": ["Ownership", "Product Thinking"]
}
```

---

# Why Store generated_resume_json

Benefits:

- Regenerate PDFs later
- Change templates later
- Build diff views
- Compare resume versions
- Avoid unnecessary AI calls
- Reduce API costs

---

# Storage

Bucket:

```text
generated-resumes
```

No other buckets are required.

---

# API Routes

## Generate Resume

```http
POST /api/resume/generate
```

Request:

```json
{
  "companyName": "",
  "companyDescription": "",
  "jobDescription": ""
}
```

Response:

```json
{
  "resumeId": "",
  "pdfUrl": ""
}
```

---

## Get Resume History

```http
GET /api/resume/history
```

---

## Get Resume Detail

```http
GET /api/resume/:id
```

---

## Download Resume

```http
GET /api/resume/:id/download
```

---

# AI Pipeline

## Prompt 1

Job Analysis

Input:

- Company Name
- Company Description
- Job Description

Output:

```json
{
  "role": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "companyValues": [],
  "companyFocus": []
}
```

---

## Prompt 2

Resume Tailoring

Input:

- Resume JSON
- Analysis Output

Output:

```json
{
  "summary": "",
  "experiences": [],
  "projects": [],
  "skills": []
}
```

Rules:

- Rewrite every bullet
- Preserve facts
- Improve impact
- Improve relevance
- Follow design.md
- Follow skill.md
- Never hallucinate

---

# Environment Variables

```env
OPENAGENTIC_API_KEY=

OPENAGENTIC_BASE_URL=https://openagentic.id/api/v1

OPENAGENTIC_MODEL=claude-sonnet-4.6

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

# Future Features

## Cover Letter Generator

Generate:

```text
CompanyName_JiehanAnandika_CoverLetter.pdf
```

## LinkedIn Optimization

Generate:

- Headline
- About Section
- Experience Improvements

## Interview Preparation

Generate:

- Behavioral Questions
- Technical Questions
- Company-Specific Questions

## Resume Diff View

Compare:

```text
Original Resume
vs
Generated Resume
```

Display:

- Summary changes
- Bullet rewrites
- Skill emphasis changes

---

# Success Criteria

The system is successful when:

- Every bullet is rewritten
- No factual information is invented
- Resume remains ATS-friendly
- Layout remains unchanged
- PDF generation succeeds
- Resume history is stored
- Analysis history is stored
- Resume snapshots are stored
- Output feels human-written
- Output follows design.md
- Output follows skill.md
- Resume is tailored to the target company
- Future PDF regeneration does not require another AI call

```

```
