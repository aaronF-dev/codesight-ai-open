import React from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Code, Zap, Brain, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/de4275d6-68ea-4e53-bf59-52ec231af08b.png" 
              alt="CodeSight AI Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">About CodeSight AI</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your intelligent, real-time coding partner designed to think with you, not for you.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card className="border-panel-border bg-card shadow-soft">
            <CardContent className="p-8">
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Whether you're stuck on a tricky bug, looking to refactor for elegance, or just want a second pair of eyes, 
                CodeSight AI is here to help.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                Think of it as a <span className="font-semibold text-primary">free alternative to Copilot</span> and other paid AI coding assistants 
                but with a sharper focus on interactive problem-solving, step-by-step explanations, and code that actually makes sense.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-panel-border bg-card shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">X.T Agent</h3>
                </div>
                <p className="text-muted-foreground">
                  Deep, thoughtful analysis for complex problems that require careful consideration and detailed solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-panel-border bg-card shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">Sentinel Agent</h3>
                </div>
                <p className="text-muted-foreground">
                  Lightning-fast suggestions for quick fixes and immediate feedback on your code.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Universal Language Support */}
          <Card className="border-panel-border bg-card shadow-soft">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Universal Language Support</h2>
              <p className="text-lg text-muted-foreground text-center mb-6">
                CodeSight AI is capable of understanding and working with almost any programming language, 
                making it your versatile coding companion regardless of your tech stack.
              </p>
              <div className="text-center">
                <p className="text-muted-foreground italic">
                  Supporting virtually all programming languages and frameworks
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What CodeSight AI Does */}
          <Card className="border-panel-border bg-card shadow-soft">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Code className="w-6 h-6 text-primary" />
                CodeSight AI is built to:
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">Understand your code context deeply.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">Provide clear, optimized solutions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">Teach as it solves, so you grow as a developer.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">Keep your workflow seamless with its chat + code update interface.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Section */}
          <Card className="border-panel-border bg-card shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-foreground">Built with passion</h2>
              </div>
              <p className="text-lg text-foreground mb-6">
                Developed by <span className="font-semibold text-primary">Aaron Frndz</span>, this platform was made for coders who want 
                professional-grade assistance without the paywall — great code should be within everyone's reach.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" asChild>
                  <a 
                    href="https://aaronportfolio.framer.ai/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Portfolio
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                
                <Button variant="outline" asChild>
                  <a 
                    href="https://x.com/AronFernandes8" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Follow on X
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center py-8">
            <Button asChild size="lg" className="text-lg px-8">
              <a href="/">Start Coding with AI</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;