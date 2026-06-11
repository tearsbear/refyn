import { JOB_ANALYSIS_PROMPT, RESUME_TAILORING_PROMPT, EMAIL_GENERATION_PROMPT } from "./prompts";
import { getAIProviderConfig, type AIProvider } from "./config";
import type { JobAnalysis, ResumeJSON } from "../types";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenAI(
  messages: OpenAIMessage[],
  provider?: AIProvider,
): Promise<string> {
  const { config } = getAIProviderConfig(provider);

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0].message.content;
}

export async function analyzeJob(
  companyName: string,
  companyDescription: string,
  jobDescription: string,
  provider?: AIProvider,
): Promise<JobAnalysis> {
  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: JOB_ANALYSIS_PROMPT,
    },
    {
      role: "user",
      content: `Company: ${companyName}

Company Description:
${companyDescription}

Job Description:
${jobDescription}

Analyze this job posting and return the analysis as JSON.`,
    },
  ];

  const response = await callOpenAI(messages, provider);

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch =
    response.match(/```json\n?([\s\S]*?)\n?```/) ||
    response.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;

  return JSON.parse(jsonStr);
}

export async function tailorResume(
  masterResume: ResumeJSON,
  analysis: JobAnalysis,
  provider?: AIProvider,
): Promise<ResumeJSON> {
  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: RESUME_TAILORING_PROMPT,
    },
    {
      role: "user",
      content: `Job Analysis:
${JSON.stringify(analysis, null, 2)}

Master Resume:
${JSON.stringify(masterResume, null, 2)}

Tailor this resume for the analyzed job. Return the complete tailored resume as JSON.`,
    },
  ];

  const response = await callOpenAI(messages, provider);

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch =
    response.match(/```json\n?([\s\S]*?)\n?```/) ||
    response.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;

  return JSON.parse(jsonStr);
}

export async function generateEmail(
  companyName: string,
  jobDescription: string,
  resume: ResumeJSON,
  provider?: AIProvider,
): Promise<string> {
  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: EMAIL_GENERATION_PROMPT,
    },
    {
      role: "user",
      content: `Company Name: ${companyName}
      
Job Description:
${jobDescription}

Tailored Resume Details:
- Summary: ${resume.summary}
- Skills: ${resume.skills.join(", ")}
- Experiences: ${JSON.stringify(resume.experiences, null, 2)}
- Projects: ${JSON.stringify(resume.projects, null, 2)}

Write the tailored application email. Do NOT wrap it in JSON. Return the final email text directly.`,
    },
  ];

  const response = await callOpenAI(messages, provider);
  return response.trim();
}
