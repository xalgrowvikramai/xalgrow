import { AIModel } from '@/types';

interface GeneratedFile {
  name: string;
  path: string;
  content: string;
}

interface GeneratedApplication {
  files: GeneratedFile[];
}

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
  model: AIModel = 'openai'
): Promise<GeneratedApplication> {
  try {
    // Call the server API to generate the application
    const response = await fetch(`/api/ai/generate-app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description,
        projectId,
        model
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Application generation error:", error);
    throw new Error(`Failed to generate application: ${error.message || 'Unknown error'}`);
  }
}