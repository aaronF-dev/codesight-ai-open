import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Maximize2, Minimize2, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroqService } from '@/services/groqService';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isCode?: boolean;
}

interface ChatPanelProps {
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  currentCode?: string;
  onCodeUpdate?: (code: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className, isExpanded, onToggleExpand, currentCode, onCodeUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m CodeSight AI. Please send your code from the input panel first, then I can help you analyze, optimize, and improve it.',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('xt');
  const [hasCodeBeenSent, setHasCodeBeenSent] = useState(false);
  const [groqService] = useState(() => new GroqService());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Load saved messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('codesight-chat');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('codesight-chat', JSON.stringify(messages));
  }, [messages]);

  // Handle receiving code from CodeInputPanel
  useEffect(() => {
    if (currentCode && !hasCodeBeenSent) {
      const codeMessage: Message = {
        id: Date.now().toString(),
        content: `Code Snippet Attached 🖇️`,
        sender: 'user',
        timestamp: new Date(),
        isCode: true,
      };

      setMessages(prev => [...prev, codeMessage]);
      setHasCodeBeenSent(true);
    }
  }, [currentCode, hasCodeBeenSent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!hasCodeBeenSent) {
      toast.error('Please send code from the input panel first before chatting with agents.');
      return;
    }

    // Check word limit (40 words max)
    const wordCount = inputValue.trim().split(/\s+/).length;
    if (wordCount > 40) {
      toast.error(`Message too long. Please keep it under 40 words (currently ${wordCount} words).`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // Include the current code in the message for context
      const messageWithCode = `Code context:\n\`\`\`\n${currentCode}\n\`\`\`\n\nUser instruction: ${userMessage.content}`;
      
      const response = await groqService.chat(
        selectedAgent as 'xt' | 'sentinel',
        messageWithCode,
        conversationHistory
      );

      // Extract any code from the response
      const extractedCode = groqService.extractCodeFromResponse(response);
      if (extractedCode && onCodeUpdate) {
        onCodeUpdate(extractedCode);
      }

      // Filter out code blocks from response for display
      let responseWithoutCode = response.replace(/```[\s\S]*?```/g, '').trim();
      
      // Normalize line spacing - remove excessive line breaks
      responseWithoutCode = responseWithoutCode
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ line breaks with 2
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks with whitespace
        .trim();
      
      // Ensure we have at least some meaningful response
      if (!responseWithoutCode || responseWithoutCode.length < 20) {
        responseWithoutCode = extractedCode 
          ? "I've updated your code in the output panel with the requested changes."
          : "I've analyzed your request and provided the necessary solution.";
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseWithoutCode,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response from AI agent. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Reset chat when agent changes but preserve code sent status
  useEffect(() => {
    const newMessages = [];
    
    // Add code attachment message if code has been sent
    if (hasCodeBeenSent) {
      newMessages.push({
        id: 'code-attachment',
        content: `Code Snippet Attached 🖇️`,
        sender: 'user' as const,
        timestamp: new Date(),
        isCode: true,
      });
    }
    
    // Add agent greeting
    newMessages.push({
      id: '1',
      content: hasCodeBeenSent 
        ? `Hello! I'm ${selectedAgent === 'xt' ? 'X.T' : 'Sentinel'}. I can see you've shared code with me. How can I help you analyze, optimize, or improve it?`
        : 'Hello! I\'m CodeSight AI. Please send your code from the input panel first, then I can help you analyze, optimize, and improve it.',
      sender: 'ai',
      timestamp: new Date(),
    });
    
    setMessages(newMessages);
  }, [selectedAgent, hasCodeBeenSent]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col bg-card border border-panel-border rounded-lg shadow-soft", className)} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-panel-border bg-gradient-subtle rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">CodeSight AI</h3>
            <p className="text-xs text-muted-foreground">AI Code Assistant</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="shrink-0 hover:bg-accent transition-colors"
          title={isExpanded ? "Collapse chat panel" : "Expand chat panel"}
        >
          {isExpanded ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 scrollbar-none" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mt-1 shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3 shadow-soft transition-all duration-200 hover:shadow-elegant",
                  message.sender === 'user'
                    ? message.isCode 
                      ? 'bg-accent text-accent-foreground ml-auto border border-border'
                      : 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {message.isCode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📎</span>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{message.content}</p>
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-1 shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mt-1 shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3 shadow-soft">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-panel-border bg-gradient-subtle rounded-b-lg flex-shrink-0">
        {/* Agent Selection */}
        <div className="mb-3">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xt">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>X.T - Deep Thinking</span>
                </div>
              </SelectItem>
              <SelectItem value="sentinel">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Sentinel - Quick Processing</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasCodeBeenSent ? "Ask me about your code (max 40 words)..." : "Send code first from input panel..."}
            className="flex-1 bg-background border-border focus:ring-primary"
            disabled={isTyping || !hasCodeBeenSent}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping || !hasCodeBeenSent}
            size="icon"
            className="shrink-0 bg-gradient-primary hover:shadow-glow transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};