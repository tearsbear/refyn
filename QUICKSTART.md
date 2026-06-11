# Quick Start Guide

Follow these steps to get Refyn up and running:

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_AI_PROVIDER`: AI provider to use (`openagentic` or `bluesminds`)
- `OPENAGENTIC_API_KEY`: Your OpenAgentic API key (if using OpenAgentic)
- `OPENAGENTIC_BASE_URL`: OpenAgentic API base URL
- `OPENAGENTIC_MODEL`: Model name for OpenAgentic (e.g., `claude-sonnet-4.6`)
- `BLUESMINDS_API_KEY`: Your BluesMinds API key (if using BluesMinds)
- `BLUESMINDS_BASE_URL`: BluesMinds API base URL
- `BLUESMINDS_MODEL`: Model name for BluesMinds
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**Note**: You only need to configure the provider(s) you plan to use. You can switch providers in the UI dropdown.

## 3. Setup Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create tables

Note: Storage bucket setup is no longer required as PDFs are exported via browser print.

## 4. Update Master Resume

Edit `data/master-resume.json` with your own resume information. This is the source of truth that will be used to generate tailored resumes.

## 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

## 6. Generate Your First Resume

1. Select your preferred AI provider from the dropdown (OpenAgentic or BluesMinds)
2. Enter a company name (e.g., "OpenAI")
3. Optionally add a company description
4. Paste a job description
5. Click "Generate Resume"
6. Review the generated resume preview
7. Click "Export PDF" and use browser's "Save as PDF"

## AI Provider Selection

### OpenAgentic

- Uses Claude Sonnet 4.6 by default
- High-quality resume generation
- Requires OpenAgentic API key

### BluesMinds

- Alternative AI provider
- Configure with your BluesMinds credentials
- Supports custom model selection

You can switch between providers at any time using the dropdown in the navigation bar. The selected provider will be used for all AI operations (job analysis and resume tailoring).

## Troubleshooting

### AI API Issues

Check that:

- Your selected AI provider's API key is correct
- The API base URL is properly configured
- The model name is valid for your provider
- You have sufficient API credits

### Supabase Issues

Make sure:

- Your Supabase project is active
- The database tables are created (run `supabase-schema.sql`)
- Your API keys are correct in `.env.local`

### PDF Export Issues

If the PDF export doesn't look right:

- Check your browser's print preview
- Adjust print settings (margins, scale)
- Try a different browser (Chrome/Edge recommended)
- Ensure CSS is not blocked

### Provider Switching

If you get errors after switching providers:

- Verify the new provider's credentials are configured
- Check that the API endpoint is accessible
- Ensure the model name is correct

## Next Steps

- Customize the resume template in `app/resume/[id]/page.tsx`
- Adjust AI prompts in `lib/ai/prompts.ts`
- Update the master resume format in `data/master-resume.json`
- Explore the design system in `design.md`
- Review anti-slop guidelines in `skill.md`
- Add more AI providers by extending `lib/ai/config.ts`
