import { supabase } from "@/integrations/supabase/client";

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqService {
  async chat(agent: 'xt' | 'sentinel', userMessage: string, conversationHistory: GroqMessage[] = []): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          agent,
          userMessage,
          conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to get response from AI agent');
      }

      return data.content || 'No response received';
    } catch (error) {
      console.error('Groq service error:', error);
      throw new Error('Failed to get response from AI agent');
    }
  }

  extractCodeFromResponse(response: string): string {
    // Extract code blocks from the response
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks = response.match(codeBlockRegex);
    
    if (codeBlocks) {
      // Remove the backticks and language identifiers
      return codeBlocks
        .map(block => block.replace(/```\w*\n?|```/g, '').trim())
        .join('\n\n');
    }
    
    return '';
  }
}