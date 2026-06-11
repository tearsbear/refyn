# Refyn - AI Resume Tailor

Transform your master resume into company-specific resumes with AI-powered tailoring.

## Overview

Refyn is a personal AI-powered resume tailoring system that generates company-specific resumes from a structured master resume. The system analyzes company information and job descriptions to rewrite every summary, experience bullet, and project bullet while preserving factual accuracy and maintaining ATS compatibility.

## Features

- 🤖 **AI-Powered Analysis**: Analyzes job descriptions to extract key requirements and company values
- ✍️ **Smart Tailoring**: Rewrites every bullet point to emphasize relevant experience
- 🖨️ **Browser-Native Export**: Export resumes as PDF using the browser's print dialog
- 💾 **Generation History**: Saves all generated resumes and analysis data
- 🔄 **Instant Preview**: View and regenerate resume previews without additional AI calls
- 🎯 **ATS Compatible**: Clean, professional resume layout optimized for ATS systems

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS v4
- **Backend**: Next.js Route Handlers, Supabase
- **AI Providers**:
  - OpenAgentic (Claude Sonnet 4.6)
  - BluesMinds
- **PDF Export**: Browser-native window.print()
- **Form Validation**: React Hook Form + Zod

## Prerequisites

- Node.js 18+ or Bun
- pnpm package manager
- Supabase account
- OpenAgentic API key

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# AI Provider Selection (openagentic or bluesminds)
NEXT_PUBLIC_AI_PROVIDER=openagentic

# OpenAgentic Provider
OPENAGENTIC_API_KEY=your_api_key_here
OPENAGENTIC_BASE_URL=https://openagentic.id/api/v1
OPENAGENTIC_MODEL=claude-sonnet-4.6

# BluesMinds Provider
BLUESMINDS_API_KEY=your_api_key_here
BLUESMINDS_BASE_URL=https://t.co/7YjY0T6R1I
BLUESMINDS_MODEL=your_model_name

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**AI Provider Configuration:**

- Set `NEXT_PUBLIC_AI_PROVIDER` to either `openagentic` or `bluesminds` to choose your default provider
- You can also switch providers on-the-fly using the dropdown in the UI
- Configure API keys for all providers you want to use

### 3. Setup Supabase

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in the Supabase SQL Editor
3. This will create:
   - `profile_data` table for master resumes
   - `resume_generations` table for generation history

Note: Storage bucket is no longer required since PDFs are exported via browser print.

### 4. Prepare Master Resume

Update the master resume data in `data/master-resume.json` with your own information. This is your source of truth that the AI will use to generate tailored resumes.

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Generate Resume**:

   - Enter the company name
   - Optionally add company description
   - Paste the job description
   - Click "Generate Resume"

2. **Export PDF**:

   - Review the generated resume preview
   - Click "Export PDF" button
   - Use browser's print dialog
   - Select "Save as PDF" as destination
   - Save your tailored resume

3. **View History**:
   - Switch to the "History" tab
   - See all previously generated resumes
   - Click "View Resume" to see any past generation
   - Export any previous resume as PDF

## Project Structure

```
refyn/
├── app/
│   ├── api/
│   │   └── resume/
│   │       ├── generate/route.ts    # Generate resume endpoint
│   │       ├── history/route.ts     # Get history endpoint
│   │       └── [id]/route.ts        # Get single resume
│   ├── resume/
│   │   └── [id]/page.tsx           # Resume preview & export page
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│ ├── assets/
│   └── resume-template.html         # Resume HTML template (reference)
├── components/
│   ├── ResumeForm.tsx              # Resume generation form
│   └── ResumeHistory.tsx           # History display
├── data/
│   └── master-resume.json          # Master resume data
├── lib/
│   ├── ai/
│   │   ├── client.ts               # AI API client
│   │   └── prompts.ts              # AI prompts
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   └── server.ts               # Supabase server client
│   └── types.ts                    # TypeScript types
├── design.md                        # Design system reference
├── skill.md                         # Anti-slop writing guidelines
├── implementation.md                # Implementation plan
└── supabase-schema.sql             # Database schema
```

## AI Rules

The AI follows strict rules to ensure quality output:

### Rewrite Everything

- Every summary sentence is rewritten
- Every experience bullet is rewritten
- Every project bullet is rewritten

### Preserve Facts

- May rephrase, reorder, and reframe
- May NOT invent metrics, achievements, technologies, dates, or responsibilities

### Improve Impact

- Transforms responsibility statements into impact-oriented achievements
- Focuses on outcomes and value delivered
- Avoids empty marketing language

### Anti-Slop Requirements

The AI avoids generic buzzwords and AI-generated phrasing:

- No "passionate developer", "results-driven", "team player", etc.
- No keyword stuffing or vague intensifiers
- Human and conversational tone
- Specific and concrete details
- Technical precision

## Database Schema

### profile_data

Stores the master resume:

- `id`: UUID primary key
- `summary`: Text summary
- `resume_json`: JSONB resume data
- `created_at`, `updated_at`: Timestamps

### resume_generations

Stores generation history:

- `id`: UUID primary key
- `company_name`: Target company
- `company_description`: Company info
- `job_description`: Job posting
- `ai_model`: AI model used
- `analysis_json`: Job analysis results
- `generated_resume_json`: Tailored resume
- `generated_summary`: Tailored summary
- `pdf_path`: Null (PDFs exported via browser)
- `created_at`: Timestamp

## API Routes

### POST `/api/resume/generate`

Generate a tailored resume.

**Request:**

```json
{
  "companyName": "Company Name",
  "companyDescription": "Optional description",
  "jobDescription": "Full job posting"
}
```

**Response:**

```json
{
  "resumeId": "uuid",
  "analysis": { ... },
  "tailoredResume": { ... }
}
```

### GET `/api/resume/history`

Get all generated resumes.

### GET `/api/resume/:id`

Get a specific resume generation.

## PDF Export Flow

The application uses a browser-native approach for PDF generation:

1. User generates a resume via the form
2. Application redirects to `/resume/[id]` preview page
3. Resume renders as clean HTML with print-optimized CSS
4. User clicks "Export PDF" button
5. `window.print()` triggers browser print dialog
6. User selects "Save as PDF" and saves locally

This approach:

- Eliminates server-side PDF generation complexity
- Reduces infrastructure dependencies
- Gives users control over PDF export settings
- Ensures consistent cross-platform results
- Works on all modern browsers

## Future Features

- Cover Letter Generator
- LinkedIn Optimization
- Interview Preparation
- Resume Diff View

## License

MIT

## Credits

Built with Next.js, Supabase, and OpenAgentic.
