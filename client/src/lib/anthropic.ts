import { apiRequest } from './queryClient';

// Interface for code generation response
interface CodeGenerationResponse {
  code: string;
}

interface CodeAnalysisResponse {
  analysis: string;
}

/**
 * Generates code using Anthropic's API
 * @param prompt The prompt to send to the API
 * @returns The generated code as a string
 */
export async function generateCodeWithAnthropic(prompt: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/generate', {
      prompt,
      model: 'anthropic'
    });
    
    const data: CodeGenerationResponse = await response.json();
    return data.code;
  } catch (error) {
    console.error("Anthropic code generation error:", error);
    throw new Error(`Failed to generate code with Anthropic: ${error}`);
  }
}

/**
 * Analyzes code using Anthropic's API
 * @param code The code to analyze
 * @returns Analysis of the code
 */
export async function analyzeCodeWithAnthropic(code: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/analyze', {
      code,
      model: 'anthropic'
    });

    const data: CodeAnalysisResponse = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Anthropic code analysis error:", error);
    throw new Error(`Failed to analyze code with Anthropic: ${error}`);
  }
}
