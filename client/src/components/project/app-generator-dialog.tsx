import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AppGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (files: any[]) => void;
}

/**
 * A dialog component for generating a new application using AI
 * This is the core interface for Xalgrow's app generation capabilities
 */
export function AppGeneratorDialog({ open, onOpenChange, onSuccess }: AppGeneratorDialogProps) {
  const { toast } = useToast();
  
  const [appDescription, setAppDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  // Reset dialog state when it opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If closing without generating, reset the state
      setAppDescription('');
      setSelectedModel('openai');
      setProgress(0);
      setCurrentStep('');
    }
    onOpenChange(open);
  };
  
  // Handle generation of the application
  const handleGenerateApp = async () => {
    if (!appDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the application you want to generate.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setProgress(10);
    setCurrentStep('Initializing AI model...');
    
    try {
      // Incremental progress updates to provide user feedback
      const updateProgress = (step: string, percent: number) => {
        setCurrentStep(step);
        setProgress(percent);
      };
      
      updateProgress('Analyzing requirements...', 20);
      await new Promise(resolve => setTimeout(resolve, 800)); // Visual delay
      
      updateProgress('Designing application architecture...', 35);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Visual delay
      
      updateProgress('Generating code...', 60);
      
      // Call our API to generate the application
      const result = await generateApplication(appDescription, 1, selectedModel);
      
      updateProgress('Finalizing application...', 90);
      await new Promise(resolve => setTimeout(resolve, 500)); // Visual delay
      
      updateProgress('Complete!', 100);
      
      // Show success message
      toast({
        title: "Application Generated",
        description: `Your application has been successfully generated with ${result.files.length} files.`,
      });
      
      // Call the success callback with the generated files
      if (onSuccess) {
        onSuccess(result.files);
      }
      
      // Close the dialog after a short delay
      setTimeout(() => {
        handleOpenChange(false);
        setIsGenerating(false);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error generating application:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating your application.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Generate Your App with AI
          </DialogTitle>
          <DialogDescription>
            Describe your application and our AI will generate all the necessary code files for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="app-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="app-description"
              placeholder="Create an Ola-like cab booking app with ride booking, driver tracking, and payment features"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="col-span-3 h-32"
              disabled={isGenerating}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ai-model" className="text-right">
              AI Model
            </Label>
            <Select
              value={selectedModel}
              onValueChange={(value: AIModel) => setSelectedModel(value)}
              disabled={isGenerating}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isGenerating && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateApp}
            disabled={isGenerating || !appDescription.trim()}
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
            ) : (
              'Generate App'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}