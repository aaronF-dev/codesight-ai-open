import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, MessageSquare, Copy, Code, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SyntaxHighlightedCodeInput } from './SyntaxHighlightedCodeInput';

interface CodeInputPanelProps {
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSendToChat?: (code: string) => void;
}


export const CodeInputPanel: React.FC<CodeInputPanelProps> = ({ 
  className, 
  isExpanded,
  onToggleExpand,
  onSendToChat 
}) => {
  const [code, setCode] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem('codesight-input-code');
    if (savedCode) setCode(savedCode);
  }, []);

  // Save code to localStorage
  useEffect(() => {
    localStorage.setItem('codesight-input-code', code);
  }, [code]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${file.name}`,
      });
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
      toast({
        title: "Code pasted",
        description: "Code has been pasted from clipboard",
      });
    } catch (error) {
      toast({
        title: "Paste failed",
        description: "Could not access clipboard",
        variant: "destructive",
      });
    }
  };


  const handleSendToChat = () => {
    if (!code.trim()) {
      toast({
        title: "No code to send",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }

    // Check word limit (300 words max)
    const wordCount = code.trim().split(/\s+/).length;
    if (wordCount > 300) {
      toast({
        title: "Code too long",
        description: `Please reduce your code to 300 words or less (currently ${wordCount} words)`,
        variant: "destructive",
      });
      return;
    }

    onSendToChat?.(code);
    toast({
      title: "Code sent to chat",
      description: "Your code has been shared with the AI assistant",
    });
  };

  return (
    <div className={cn("flex flex-col bg-card border border-panel-border rounded-lg shadow-soft", className)} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-panel-border bg-gradient-subtle rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Code className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Code Input</h3>
            <p className="text-xs text-muted-foreground">Enter or upload your code</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="shrink-0 hover:bg-accent transition-colors"
          title={isExpanded ? "Collapse input panel" : "Expand input panel"}
        >
          {isExpanded ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 p-4">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all duration-200",
            isDragOver 
              ? "border-primary bg-primary/5 shadow-glow" 
              : "border-border bg-editor-bg/5"
          )}
          style={{ height: '400px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <SyntaxHighlightedCodeInput
            value={code}
            onChange={setCode}
            placeholder={`// Enter your code here (max 300 words)...
// You can also drag & drop a file or paste from clipboard

function example() {
  console.log("Hello, CodeSight AI!");
}`}
            className="w-full h-full"
          />
          
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
              <div className="text-center">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">Drop your code file here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-panel-border bg-gradient-subtle rounded-b-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Paste Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Upload File
          </Button>

          <Button
            size="sm"
            onClick={handleSendToChat}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-200 ml-auto"
          >
            <MessageSquare className="w-4 h-4" />
            Send to Chat
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".js,.ts,.py,.java,.cpp,.cs,.go,.rs,.php,.rb,.html,.css,.sql,.json,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>
    </div>
  );
};