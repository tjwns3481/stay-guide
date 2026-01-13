import { useState, useCallback } from 'react';

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [timeout]);

  return { copied, copyToClipboard };
}
