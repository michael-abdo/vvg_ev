/**
 * Consolidated React hooks for API data management and loading states
 * 
 * This module provides reusable hooks that eliminate duplication across components
 * by consolidating common patterns for API calls, loading states, and error handling.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Configuration for API calls
 */
interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Hook state for API data management
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Options for useApiData hook
 */
interface UseApiDataOptions<T> {
  /** Whether to load data immediately on mount */
  autoLoad?: boolean;
  /** Initial data value */
  initialData?: T;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  onSuccess?: (data: T) => void;
  /** Transform response data before setting state */
  transform?: (response: any) => T;
  /** Dependency array for auto-reloading */
  deps?: any[];
}

/**
 * Consolidated hook for API data fetching with loading states
 * 
 * Eliminates duplication in components by providing:
 * - Loading state management
 * - Error handling
 * - Data state management
 * - Refresh/reload functionality
 * - Automatic loading on mount
 * 
 * @example
 * ```tsx
 * const { data: documents, loading, error, reload } = useApiData<NDADocument[]>('/api/documents', {
 *   autoLoad: true,
 *   transform: (response) => response.data || []
 * });
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * ```
 */
export function useApiData<T>(
  url: string | null,
  options: UseApiDataOptions<T> = {}
) {
  const {
    autoLoad = false,
    initialData = null,
    onError,
    onSuccess,
    transform,
    deps = []
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null
  });

  /**
   * Execute API call with consistent error handling
   */
  const execute = useCallback(async (config: ApiConfig = {}) => {
    if (!url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.body ? (
          typeof config.body === 'string' ? config.body : JSON.stringify(config.body)
        ) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      const finalData = transform ? transform(responseData) : responseData;

      setState({
        data: finalData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      onSuccess?.(finalData);
      return finalData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      } else {
        console.error(`API Error for ${url}:`, error);
      }

      throw error;
    }
  }, [url, transform, onSuccess, onError]);

  /**
   * Reload data using GET method
   */
  const reload = useCallback(() => {
    return execute({ method: 'GET' });
  }, [execute]);

  /**
   * POST data to the endpoint
   */
  const post = useCallback((body: any, headers?: Record<string, string>) => {
    return execute({ method: 'POST', body, headers });
  }, [execute]);

  /**
   * PUT data to the endpoint
   */
  const put = useCallback((body: any, headers?: Record<string, string>) => {
    return execute({ method: 'PUT', body, headers });
  }, [execute]);

  /**
   * DELETE from the endpoint
   */
  const remove = useCallback((headers?: Record<string, string>) => {
    return execute({ method: 'DELETE', headers });
  }, [execute]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, [initialData]);

  // Auto-load on mount and when dependencies change
  useEffect(() => {
    if (autoLoad && url) {
      reload();
    }
  }, [autoLoad, url, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    reload,
    post,
    put,
    remove,
    execute,
    clearError,
    reset,
    
    // Computed
    isLoaded: state.data !== null && !state.loading,
    hasError: state.error !== null,
    isEmpty: state.data === null || (Array.isArray(state.data) && state.data.length === 0)
  };
}

/**
 * Specialized hook for file uploads with progress tracking
 * 
 * @example
 * ```tsx
 * const { upload, uploading, progress, error } = useFileUpload('/api/upload', {
 *   onSuccess: (result) => {
 *     toast({ title: 'Upload successful' });
 *     onUploadComplete?.(result);
 *   }
 * });
 * 
 * const handleUpload = async (file: File) => {
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   await upload(formData);
 * };
 * ```
 */
export function useFileUpload<T = any>(
  url: string,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: number) => void;
  } = {}
) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const { onSuccess, onError, onProgress } = options;

  const upload = useCallback(async (data: FormData | Record<string, any>) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const body = data instanceof FormData ? data : 
        Object.entries(data).reduce((fd, [key, value]) => {
          fd.append(key, value);
          return fd;
        }, new FormData());

      const response = await fetch(url, {
        method: 'POST',
        body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Upload failed with status ${response.status}`);
      }

      const responseData = await response.json();
      setResult(responseData);
      setProgress(100);
      
      onSuccess?.(responseData);
      return responseData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      } else {
        console.error('Upload error:', error);
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  }, [url, onSuccess, onError]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    result,
    reset,
    hasError: error !== null,
    isComplete: progress === 100 && !uploading
  };
}

/**
 * Hook for managing operation states (like comparing, processing, etc.)
 * 
 * @example
 * ```tsx
 * const { execute: startComparison, loading: comparing, error } = useAsyncOperation(
 *   async (doc1Id: string, doc2Id: string) => {
 *     const response = await fetch('/api/compare', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ doc1Id, doc2Id })
 *     });
 *     return response.json();
 *   },
 *   {
 *     onSuccess: (result) => setComparisonResult(result),
 *     onError: (error) => toast({ title: 'Comparison failed', description: error.message })
 *   }
 * );
 * ```
 */
export function useAsyncOperation<TArgs extends any[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const { onSuccess, onError } = options;

  const execute = useCallback(async (...args: TArgs): Promise<TResult | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      setResult(result);
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setError(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      } else {
        console.error('Async operation error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [operation, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    execute,
    loading,
    error,
    result,
    reset,
    hasError: error !== null,
    isComplete: result !== null && !loading
  };
}

/**
 * Hook for polling data at regular intervals
 * 
 * @example
 * ```tsx
 * const { data: stats, loading, start, stop, isPolling } = usePolling(
 *   '/api/dashboard/stats',
 *   { interval: 30000, transform: (response) => response.data }
 * );
 * ```
 */
export function usePolling<T>(
  url: string,
  options: {
    interval?: number;
    autoStart?: boolean;
    transform?: (response: any) => T;
    onError?: (error: Error) => void;
  } = {}
) {
  const { interval = 5000, autoStart = false, transform, onError } = options;
  const [isPolling, setIsPolling] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const { data, loading, error, reload } = useApiData<T>(url, {
    autoLoad: autoStart,
    transform,
    onError
  });

  const start = useCallback(() => {
    if (intervalId) return; // Already polling

    setIsPolling(true);
    const id = setInterval(() => {
      reload();
    }, interval);
    setIntervalId(id);
  }, [intervalId, interval, reload]);

  const stop = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsPolling(false);
    }
  }, [intervalId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Auto-start polling
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => stop();
  }, [autoStart, start, stop]);

  return {
    data,
    loading,
    error,
    isPolling,
    start,
    stop,
    reload
  };
}