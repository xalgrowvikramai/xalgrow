import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useProject } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { AIModel, modelOptions } from '@/types';
import { generateApplication } from '@/lib/app-generator';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bot, Sparkles } from 'lucide-react';

interface AppGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (files: any[]) => void;
}

/**
 * Dialog for generating application code with AI
 * This is the core feature of Xalgrow - using AI to generate entire applications
 */
export function AppGeneratorDialog({ open, onOpenChange, onSuccess }: AppGeneratorDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentProject } = useProject();
  
  const [appDescription, setAppDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const generatingSteps = [
    'Analyzing requirements...',
    'Designing architecture...',
    'Generating code...',
    'Creating files...',
    'Finalizing application...'
  ];
  
  // Timer to simulate AI thinking steps
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start the generation process with steps
  const startGenerationSteps = () => {
    setGeneratingStep(0);
    
    // Simulate steps with timeouts
    const simulateSteps = (step: number) => {
      if (step < generatingSteps.length - 1) {
        timerRef.current = setTimeout(() => {
          setGeneratingStep(step + 1);
          simulateSteps(step + 1);
        }, 1500); // 1.5 seconds between steps
      }
    };
    
    simulateSteps(0);
  };
  
  // Clean up timer if dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onOpenChange(open);
  };
  
  const handleGenerateApp = async () => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before generating an app.",
        variant: "destructive"
      });
      return;
    }
    
    if (!appDescription) {
      toast({
        title: "Description Required",
        description: "Please provide a detailed description of the app you want to generate.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      startGenerationSteps();
      
      // Make API call to generate the application
      const result = await generateApplication(
        appDescription,
        currentProject.id,
        selectedModel
      );
      
      toast({
        title: "Application Generated",
        description: `Your application has been generated with ${result.files.length} files.`,
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result.files);
      }
      
    } catch (error: any) {
      console.error("Error generating application:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred while generating the application.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      // Clean up the timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Generate Application with AI
          </DialogTitle>
          <DialogDescription>
            Describe your application in detail and our AI will generate a complete working application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ai-model" className="text-right">
              AI Model
            </Label>
            <Select 
              value={selectedModel} 
              onValueChange={(value) => setSelectedModel(value as AIModel)}
              disabled={isGenerating}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="app-description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="app-description"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="col-span-3 h-24"
              placeholder="Describe your application in detail, e.g. 'Create a food delivery app with a menu, cart, and checkout.'"
              disabled={isGenerating}
            />
          </div>
          
          {isGenerating && (
            <div className="bg-muted p-4 rounded-md mt-2">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="font-medium text-primary">
                  {generatingSteps[generatingStep]}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-in-out"
                  style={{ width: `${(generatingStep + 1) / generatingSteps.length * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateApp}
            disabled={isGenerating || !appDescription}
            className="gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Application</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}