import type { TestCase, Criterion, EvaluationResult, JudgmentResult } from "../types";

const API_URL = "https://api.anthropic.com/v1/messages";
const JUDGE_MODEL = "claude-sonnet-4-20250514";

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };
}

async function callClaude(systemPrompt: string, userMessage: string, model: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  return data.content[0].text as string;
}

// 1. Runner — execute user's system prompt against a single test case
async function runTestCase(systemPrompt: string, testCase: TestCase, model: string): Promise<string> {
  return callClaude(systemPrompt, testCase.input, model);
}

// 2. Judge — score a response against criteria, returns structured JSON
async function judgeResponse(
  response: string,
  testCaseInput: string,
  criteria: Criterion[]
): Promise<JudgmentResult> {
  const criteriaList = criteria
    .map((c, i) => `${i + 1}. "${c.text}" (weight: ${c.weight}/5)`)
    .join("\n");

  const system = `You are an expert evaluator. Given an AI response and evaluation criteria, score the response strictly.
You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.

Response format:
{
  "overallScore": <0-100 number>,
  "results": [
    {
      "criterion": "<criterion text>",
      "pass": <true|false>,
      "score": <1-5>,
      "reasoning": "<one sentence>"
    }
  ]
}`;

  const user = `Test case input: ${testCaseInput}

AI response to evaluate:
${response}

Criteria to evaluate against:
${criteriaList}

Return the JSON scorecard now.`;

  const raw = await callClaude(system, user, JUDGE_MODEL);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Judge returned no valid JSON");

  return JSON.parse(jsonMatch[0]) as JudgmentResult;
}

// 3. Auto-Improver — rewrite the prompt based on all failures
async function improvePrompt(
  originalPrompt: string,
  results: EvaluationResult[]
): Promise<string> {
  const failures = results
    .map((r) => {
      const failedCriteria = r.judgment.results
        .filter((c) => !c.pass)
        .map((c) => `  - ${c.criterion}: ${c.reasoning}`)
        .join("\n");
      return `Test case: "${r.testCase}"\nScore: ${r.judgment.overallScore}/100\nFailures:\n${failedCriteria}`;
    })
    .join("\n\n");

  const system = `You are an expert prompt engineer. You will be given a system prompt and a list of evaluation failures.
Rewrite the system prompt to fix all failures while preserving what works.
Respond with ONLY the improved system prompt — no explanation, no preamble, no markdown code fences.`;

  const user = `Original system prompt:
${originalPrompt}

Evaluation failures:
${failures}

Write the improved system prompt now.`;

  return callClaude(system, user, JUDGE_MODEL);
}

// Main evaluation runner — runs all test cases in parallel for a given model
export async function runEvaluation(
  systemPrompt: string,
  testCases: TestCase[],
  criteria: Criterion[],
  model: string
): Promise<EvaluationResult[]> {
  return Promise.all(
    testCases.map(async (tc) => {
      const response = await runTestCase(systemPrompt, tc, model);
      const judgment = await judgeResponse(response, tc.input, criteria);
      return { testCase: tc.input, response, judgment };
    })
  );
}

export async function autoImprovePrompt(
  originalPrompt: string,
  results: EvaluationResult[]
): Promise<string> {
  return improvePrompt(originalPrompt, results);
}
