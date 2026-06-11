# Migration to Browser-Native PDF Export

This document summarizes the changes made to migrate from server-side PDF generation (Playwright) to browser-native PDF export (window.print).

## Changes Made

### Removed

1. **Playwright dependency** - Removed from `package.json`
2. **PDF generator service** - Deleted `lib/pdf/generator.ts`
3. **Download API route** - Deleted `app/api/resume/[id]/download/route.ts`
4. **Storage bucket setup** - Removed from `supabase-schema.sql`
5. **PDF upload logic** - Removed from `app/api/resume/generate/route.ts`

### Added

1. **Resume preview page** - New `app/resume/[id]/page.tsx`
   - Displays generated resume as HTML
   - Includes "Export PDF" button
   - Print-optimized CSS with `@media print`
   - Hides non-resume UI elements during print

### Modified

1. **ResumeForm component** (`components/ResumeForm.tsx`)

   - Now redirects to resume preview page after generation
   - Removed PDF download link display

2. **ResumeHistory component** (`components/ResumeHistory.tsx`)

   - Changed "Download" button to "View Resume"
   - Links to resume preview page instead of download endpoint

3. **Generate API route** (`app/api/resume/generate/route.ts`)

   - Removed PDF generation logic
   - Removed storage upload logic
   - Sets `pdf_path` to `null` in database

4. **Types** (`lib/types.ts`)

   - Removed `pdfUrl` from `GenerateResumeOutput`

5. **Documentation**
   - Updated `README.md` with new flow
   - Updated `QUICKSTART.md` to remove Playwright steps
   - Updated `supabase-schema.sql` to remove storage policies

## New User Flow

### Before (Playwright)

```
Generate Resume JSON
  ↓
AI Analysis & Tailoring
  ↓
Server-side PDF Generation (Playwright)
  ↓
Upload PDF to Supabase Storage
  ↓
Return PDF URL
  ↓
User downloads PDF
```

### After (Browser Print)

```
Generate Resume JSON
  ↓
AI Analysis & Tailoring
  ↓
Save to Database
  ↓
Redirect to Preview Page
  ↓
User clicks "Export PDF"
  ↓
window.print()
  ↓
Browser Save as PDF
```

## Benefits

1. **Simpler Architecture**: No server-side PDF generation infrastructure
2. **Reduced Dependencies**: No Playwright or Chromium required
3. **Lower Infrastructure Costs**: No storage bucket or bandwidth costs
4. **User Control**: Users control PDF export settings
5. **Cross-Platform Consistency**: Browser handles rendering
6. **Faster Development**: No PDF generation debugging
7. **Better Privacy**: PDFs never touch the server

## Technical Details

### Print-Optimized CSS

The resume preview page includes print-specific styles:

```css
@media print {
  @page {
    margin: 0.4in;
    size: A4;
  }

  .no-print {
    display: none !important;
  }
}
```

### PDF Export Button

```typescript
const handleExportPDF = () => {
  window.print();
};
```

### Resume Preview Route

- Route: `/resume/[id]`
- Fetches resume data from database
- Renders clean HTML resume
- Includes export button
- Print-optimized layout

## Database Changes

The `pdf_path` column in `resume_generations` table is now nullable and set to `null` for all new entries, as PDFs are no longer stored in Supabase Storage.

## Migration Steps for Existing Deployments

If you have an existing Refyn deployment:

1. Remove Playwright from your deployment
2. Delete the `generated-resumes` storage bucket (optional)
3. Update environment variables (remove storage-related vars if any)
4. Deploy new code
5. Test PDF export with browser print dialog

## Browser Compatibility

The browser print approach works on all modern browsers:

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Users need to select "Save as PDF" in the print destination.

## Future Enhancements

Potential improvements to the browser print approach:

- Custom print CSS per resume template
- Print preview within the app
- Suggested print settings instructions
- Browser-specific export tips
