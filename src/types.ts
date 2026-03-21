export interface TestCase {
  id: string;
  input: string;
}

export interface Criterion {
  id: string;
  text: string;
  weight: 1 | 2 | 3 | 4 | 5;
}

export interface CriterionResult {
  criterion: string;
  pass: boolean;
  score: 1 | 2 | 3 | 4 | 5;
  reasoning: string;
}

export interface JudgmentResult {
  overallScore: number;
  results: CriterionResult[];
}

export interface EvaluationResult {
  testCase: string;
  response: string;
  judgment: JudgmentResult;
}

export type EvaluationStatus = "idle" | "loading" | "complete" | "error";
