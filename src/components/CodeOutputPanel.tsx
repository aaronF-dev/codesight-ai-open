import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, GitCompare, CheckCircle, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeOutputPanelProps {
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  originalCode?: string;
  optimizedCode?: string;
  language?: string;
}

export const CodeOutputPanel: React.FC<CodeOutputPanelProps> = ({ 
  className,
  isExpanded,
  onToggleExpand,
  originalCode = '',
  optimizedCode = '',
  language = 'javascript'
}) => {
  const [outputCode, setOutputCode] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load saved output from localStorage
  useEffect(() => {
    const savedOutput = localStorage.getItem('codesight-output-code');
    if (savedOutput) setOutputCode(savedOutput);
  }, []);

  // Save output to localStorage
  useEffect(() => {
    localStorage.setItem('codesight-output-code', outputCode);
  }, [outputCode]);

  // Update output code when optimizedCode prop changes
  useEffect(() => {
    if (optimizedCode) {
      setOutputCode(optimizedCode);
      setIsProcessing(false);
    }
  }, [optimizedCode]);

  const generateImprovedCode = (code: string, lang: string): string => {
    // Simple simulation of code improvement
    if (lang === 'javascript') {
      return code
        .replace(/var /g, 'const ')
        .replace(/function /g, 'const ')
        .replace(/\{/g, ' => {')
        .replace(/console\.log/g, '// Optimized: console.log')
        + '\n\n// AI Suggestions:\n// - Used const instead of var for better scoping\n// - Converted to arrow functions for cleaner syntax\n// - Added performance optimizations';
    }
    
    return code + '\n\n// AI Analysis: Code reviewed and optimized for better performance and readability';
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      toast({
        title: "Code copied",
        description: "Code has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-code-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: "File saved as a .txt file",
    });
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'csharp': 'cs',
      'go': 'go',
      'rust': 'rs',
      'php': 'php',
      'ruby': 'rb',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
      'json': 'json',
    };
    return extensions[lang] || 'txt';
  };

  const getDiffStats = () => {
    if (!originalCode || !outputCode) return null;
    
    const originalLines = originalCode.split('\n').length;
    const outputLines = outputCode.split('\n').length;
    const improvement = Math.round(((outputLines - originalLines) / originalLines) * 100);
    
    return {
      linesAdded: Math.max(0, outputLines - originalLines),
      linesChanged: Math.min(originalLines, outputLines),
      improvement: improvement > 0 ? `+${improvement}%` : `${improvement}%`
    };
  };

  const diffStats = getDiffStats();

  return (
    <div className={cn("flex flex-col bg-card border border-panel-border rounded-lg shadow-soft", className)} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-panel-border bg-gradient-subtle rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Optimized Code</h3>
            <p className="text-xs text-muted-foreground">Enhanced by CodeSight AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {diffStats && (
            <Badge variant="secondary" className="text-xs">
              {diffStats.improvement} optimized
            </Badge>
          )}
          
          {isProcessing && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1"></div>
              Processing...
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="shrink-0 hover:bg-accent transition-colors"
            title={isExpanded ? "Collapse output panel" : "Expand output panel"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Code Output Area */}
      <div className="flex-1 p-4">
        {isProcessing ? (
          <div className="h-full flex items-center justify-center bg-gradient-code rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-foreground mb-2">AI is analyzing your code...</h4>
              <p className="text-muted-foreground">Please wait while we optimize and improve your code</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {showDiff && originalCode && outputCode ? (
              <div className="h-full grid grid-cols-2 gap-4">
                <div className="bg-destructive/10 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 text-destructive">Original</h4>
                  <Textarea
                    value={originalCode}
                    readOnly
                    className="h-full font-mono text-sm bg-transparent border-0 resize-none overflow-y-auto scrollbar-none"
                    style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
                  />
                </div>
                <div className="bg-success/10 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 text-success">Optimized</h4>
                  <Textarea
                    value={outputCode}
                    onChange={(e) => setOutputCode(e.target.value)}
                    className="h-full font-mono text-sm bg-transparent border-0 resize-none overflow-y-auto scrollbar-none"
                    style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
                  />
                </div>
              </div>
            ) : (
              <Textarea
                value={outputCode}
                onChange={(e) => setOutputCode(e.target.value)}
                placeholder={`// AI-optimized ${language} code will appear here...
// The AI will analyze your code and provide:
// - Performance improvements
// - Best practice suggestions
// - Code optimization
// - Error detection and fixes

// Start by sending code from the input panel!`}
                className="w-full h-full p-4 bg-gradient-code text-editor-foreground border-0 resize-none font-mono text-sm focus:ring-0 focus:outline-none overflow-y-auto scrollbar-none"
                style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-panel-border bg-gradient-subtle rounded-b-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            disabled={!outputCode || isProcessing}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCode}
            disabled={!outputCode || isProcessing}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
            disabled={!originalCode || !outputCode || isProcessing}
            className={cn(
              "flex items-center gap-2",
              showDiff && "bg-primary/10 text-primary border-primary"
            )}
          >
            <GitCompare className="w-4 h-4" />
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </Button>

          {outputCode && !isProcessing && (
            <div className="flex items-center gap-2 ml-auto">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};