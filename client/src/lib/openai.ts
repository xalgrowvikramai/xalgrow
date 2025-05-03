import { apiRequest } from './queryClient';

// Interface for code generation response
interface CodeGenerationResponse {
  code: string;
}

/**
 * Generates code using OpenAI's API
 * @param prompt The prompt to send to the API
 * @returns The generated code as a string
 */
export async function generateCodeWithOpenAI(prompt: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/generate', {
      prompt,
      model: 'openai'
    });
    
    const data: CodeGenerationResponse = await response.json();
    return data.code;
  } catch (error) {
    console.error("OpenAI code generation error:", error);
    throw new Error(`Failed to generate code with OpenAI: ${error}`);
  }
}

/**
 * Analyzes code using OpenAI's API
 * @param code The code to analyze
 * @returns Analysis of the code
 */
export async function analyzeCodeWithOpenAI(code: string): Promise<string> {
  try {
    const prompt = `Analyze the following code and provide insights on improvements:
    
    ${code}`;
    
    const response = await apiRequest('POST', '/api/ai/generate', {
      prompt,
      model: 'openai'
    });
    
    const data: CodeGenerationResponse = await response.json();
    return data.code;
  } catch (error) {
    console.error("OpenAI code analysis error:", error);
    throw new Error(`Failed to analyze code with OpenAI: ${error}`);
  }
}
