export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  technologies: string[];
  bullets: string[];
}

export interface Project {
  title: string;
  company: string;
  location: string;
  duration: string;
  bullets: string[];
}

export interface ResumeJSON {
  summary: string;
  experiences: Experience[];
  projects: Project[];
  skills: string[];
  generated_email?: string;
}

export interface JobAnalysis {
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  companyValues: string[];
  companyFocus: string[];
}

export interface GenerateResumeInput {
  companyName: string;
  companyDescription: string;
  jobDescription: string;
  provider?: string;
}

export interface GenerateResumeOutput {
  resumeId: string;
}

export interface ResumeGeneration {
  id: string;
  company_name: string;
  company_description: string;
  job_description: string;
  ai_model: string;
  analysis_json: JobAnalysis;
  generated_resume_json: ResumeJSON;
  generated_summary: string;
  pdf_path: string;
  created_at: string;
}
