'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ExportButton({ 
  onClick, 
  disabled = false, 
  className = '',
  children = 'Export as PDF'
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`bg-blue-400 hover:bg-blue-500 text-slate-900 font-medium ${className}`}
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Generating PDF...' : children}
    </Button>
  );
}