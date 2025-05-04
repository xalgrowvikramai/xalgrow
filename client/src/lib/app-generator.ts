import { apiRequest } from './queryClient';

/**
 * Generates a complete application based on a description
 * This is the core functionality of Xalgrow - generating apps dynamically using AI
 * 
 * @param description The description of the app to generate
 * @param projectId The ID of the project to associate the generated files with
 * @param model The AI model to use ('openai' or 'anthropic')
 * @returns An object containing the generated files
 */
export async function generateApplication(
  description: string, 
  projectId: number, 
  model: 'openai' | 'anthropic' = 'openai'
): Promise<{ message: string, files: any[] }> {
  try {
    console.log(`Generating application with description: ${description}`);
    
    const response = await apiRequest('POST', '/api/ai/generate-app', {
      description,
      projectId,
      model
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate application');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Application generation error:", error);
    throw new Error(`Failed to generate application: ${error.message}`);
  }
}