import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Template } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface PremiumTemplatesProps {
  className?: string;
}

const PremiumTemplates: React.FC<PremiumTemplatesProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'instamojo' | 'upi' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch premium templates from API
  const { data: templates, isLoading, error } = useQuery<Template[]>({
    queryKey: ['/api/templates/premium'],
  });

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowDialog(true);
  };

  const handlePayment = (method: 'instamojo' | 'upi') => {
    if (!selectedTemplate) return;
    
    setPaymentMethod(method);
    setIsProcessing(true);
    
    // In a real implementation, this would redirect to the payment gateway
    setTimeout(() => {
      setIsProcessing(false);
      setShowDialog(false);
      
      toast({
        title: "Payment Initiated",
        description: `Payment for ${selectedTemplate.name} has been initiated via ${method === 'instamojo' ? 'Instamojo' : 'UPI'}`,
      });
    }, 1500);
  };
  
  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="text-center p-8 text-red-500">
          <p>Failed to load premium templates</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 p-4 ${className} mb-8`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-medium text-lg">{t('premiumTemplates')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('purchaseTemplates')}</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex items-center gap-2 py-2 px-4 bg-[#FF9933] hover:bg-orange-500 text-white rounded-lg">
            <i className="ri-bank-card-line"></i>
            <span>{t('payWithInstamojo')}</span>
          </Button>
          <Button className="flex items-center gap-2 py-2 px-4 bg-[#138808] hover:bg-green-700 text-white rounded-lg">
            <i className="ri-secure-payment-line"></i>
            <span>{t('payWithUPI')}</span>
          </Button>
        </div>
      </div>
      
      {/* Template Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates && templates.map((template) => (
          <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
              {template.imageUrl && (
                <img 
                  src={template.imageUrl} 
                  alt={template.name} 
                  className="w-full h-full object-cover"
                />
              )}
              {template.isPremium && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs py-1 px-2 rounded-full">
                  Premium
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-1">{template.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">{formatCurrency(template.price)}</span>
                <Button 
                  onClick={() => handlePreviewTemplate(template)}
                  variant="ghost" 
                  className="text-sm bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 py-1 px-3 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800"
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Template Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTemplate.name}</DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
                  {selectedTemplate.imageUrl && (
                    <img 
                      src={selectedTemplate.imageUrl} 
                      alt={selectedTemplate.name} 
                      className="w-full h-56 object-cover"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Price</h4>
                    <p className="text-lg font-bold">{formatCurrency(selectedTemplate.price)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Includes</h4>
                    <ul className="text-sm">
                      <li className="flex items-center gap-1">
                        <i className="ri-check-line text-green-500"></i>
                        <span>Source Code</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <i className="ri-check-line text-green-500"></i>
                        <span>Documentation</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <i className="ri-check-line text-green-500"></i>
                        <span>6 Months Support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  onClick={() => handlePayment('instamojo')} 
                  disabled={isProcessing}
                  className="bg-[#FF9933] hover:bg-orange-500 text-white"
                >
                  {isProcessing && paymentMethod === 'instamojo' ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-bank-card-line mr-2"></i>
                      {t('payWithInstamojo')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handlePayment('upi')}
                  disabled={isProcessing}
                  className="bg-[#138808] hover:bg-green-700 text-white"
                >
                  {isProcessing && paymentMethod === 'upi' ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line mr-2"></i>
                      {t('payWithUPI')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PremiumTemplates };
