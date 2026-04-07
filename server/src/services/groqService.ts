import Groq from "groq-sdk";
import { ParsedJobData, ResumeSuggestions } from "../types/index.js";

let groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

export const parseJobDescription = async (
  jobDescription: string
): Promise<ParsedJobData> => {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a job description parser. Extract structured information from job descriptions and return ONLY valid JSON. No markdown, no extra text.

Return exactly this JSON structure:
{
  "company": "company name or empty string if not found",
  "role": "job title",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "seniority": "Junior | Mid | Senior | Staff | Principal | Lead | Manager | Director | VP | C-Level or empty string",
  "location": "location or Remote or Hybrid or empty string"
}`,
      },
      {
        role: "user",
        content: `Parse this job description:\n\n${jobDescription}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const cleaned = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as ParsedJobData;

  return {
    company: String(parsed.company ?? ""),
    role: String(parsed.role ?? ""),
    requiredSkills: Array.isArray(parsed.requiredSkills)
      ? parsed.requiredSkills.map(String)
      : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills)
      ? parsed.niceToHaveSkills.map(String)
      : [],
    seniority: String(parsed.seniority ?? ""),
    location: String(parsed.location ?? ""),
  };
};

export const generateResumeSuggestions = async (
  jobDescription: string,
  parsedData: ParsedJobData
): Promise<ResumeSuggestions> => {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer. Generate specific, impactful resume bullet points tailored to a job description. Return ONLY valid JSON. No markdown, no extra text.

Return exactly this JSON structure:
{
  "bullets": ["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"]
}

Each bullet should:
- Start with a strong action verb
- Include specific metrics or outcomes where possible
- Be tailored to the specific role and required skills
- Be 1-2 sentences max
- NOT be generic — reference the actual skills/technologies from the job`,
      },
      {
        role: "user",
        content: `Generate 4-5 resume bullet points for this ${parsedData.seniority} ${parsedData.role} position at ${parsedData.company}.

Key required skills: ${parsedData.requiredSkills.slice(0, 8).join(", ")}

Job description context:
${jobDescription.slice(0, 2000)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const cleaned = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as ResumeSuggestions;

  return {
    bullets: Array.isArray(parsed.bullets)
      ? parsed.bullets.map(String).slice(0, 5)
      : [],
  };
};
