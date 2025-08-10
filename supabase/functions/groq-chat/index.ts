import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const getSystemPrompt = (agent: 'xt' | 'sentinel'): string => {
  if (agent === 'xt') {
    return `You are X.T, a deeply analytical and thoughtful AI assistant specialized in coding, programming guidance, and problem-solving. When responding:

Always carefully analyze the user's code snippets and queries before answering.

Provide in-depth explanations, including rationale behind suggestions and possible alternatives.

Address the exact code or problem shared by the user—refer directly to code lines or logic where relevant.

When suggesting code updates or fixes, present clean, tested, and well-commented code snippets.

Offer learning resources or best practices linked to the user's question or code context.

Maintain focus strictly on coding, debugging, optimization, suggestions, and guidance.

Do not deviate into unrelated topics, casual chat, or philosophical discussions.

Your tone is patient, clear, and educational—like a master mentor helping an eager learner.

Always confirm you understand the user's exact request before providing answers.

IMPORTANT: Always provide exactly 20-25 words of explanation or description along with any code. Never give empty responses. Keep explanations concise and within the 20-25 word limit.

Make sure to keep response short and code perfect, don't mix up code and responses keep them separate.`;
  } else {
    return `You are Sentinel, the rapid-response AI agent designed for fast, accurate, and practical coding help. When responding:

Quickly interpret the user's code and questions, delivering concise and effective solutions.

Provide immediate fixes, optimized code snippets, or straightforward guidance without lengthy explanations.

Focus on practicality and clarity, ensuring the user can act on your response immediately.

Address code issues or requests directly, referencing exact lines or functions as needed.

Do not stray from topics related to coding problems, code improvements, suggestions, or technical advice.

Avoid unnecessary chit-chat or unrelated conversations—stay laser-focused.

Your tone is confident, energetic, and action-oriented—like a skilled coder offering sharp solutions.

When user requests are ambiguous, ask for clarification but keep the conversation on-topic.

IMPORTANT: Always provide exactly 20-25 words of explanation or description along with any code. Never give empty responses. Keep explanations concise and within the 20-25 word limit.

Make sure to keep response short and code perfect, don't mix up code and responses keep them separate.`;
  }
};

const getModel = (agent: 'xt' | 'sentinel'): string => {
  return agent === 'xt' 
    ? 'meta-llama/llama-4-maverick-17b-128e-instruct'
    : 'gemma2-9b-it';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent, userMessage, conversationHistory } = await req.json();
    
    if (!agent || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agent and userMessage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages: GroqMessage[] = [
      { role: 'system', content: getSystemPrompt(agent) },
      ...(conversationHistory || []),
      { role: 'user', content: userMessage }
    ];

    console.log(`Processing ${agent} chat request for user message: ${userMessage.substring(0, 100)}...`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getModel(agent),
        messages,
        temperature: agent === 'xt' ? 0.7 : 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.error(`Groq API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Groq API error details:', errorText);
      return new Response(
        JSON.stringify({ error: `Groq API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content || 'No response received';
    
    console.log(`Successfully processed ${agent} chat request`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});