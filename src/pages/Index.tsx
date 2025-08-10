import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ChatPanel } from '@/components/ChatPanel';
import { CodeInputPanel } from '@/components/CodeInputPanel';
import { CodeOutputPanel } from '@/components/CodeOutputPanel';

type ExpandedPanel = 'chat' | 'input' | 'output' | null;

const Index = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);

  const handleSendToChat = (code: string) => {
    setCurrentCode(code);
  };

  const handleCodeUpdate = (code: string) => {
    setOptimizedCode(code);
  };

  const handleToggleExpand = (panel: ExpandedPanel) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  const getGridClass = () => {
    if (expandedPanel) {
      // When a panel is expanded, use flexbox for more precise control
      return 'flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] transition-all duration-300 ease-smooth';
    }
    // Normal state uses 3-column grid
    return 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] transition-all duration-300 ease-smooth';
  };

  const getPanelClass = (panel: ExpandedPanel) => {
    if (!expandedPanel) {
      // Normal state - each panel takes equal space
      return 'flex-1 transition-all duration-300 ease-smooth';
    }

    if (expandedPanel === panel) {
      // Expanded panel takes most space (70%)
      return 'flex-[0_0_70%] lg:flex-[0_0_70%] transition-all duration-300 ease-smooth';
    } else {
      // Collapsed panels split remaining space (15% each)
      return 'flex-[0_0_100%] lg:flex-[0_0_15%] transition-all duration-300 ease-smooth';
    }
  };

  const getPanelContentClass = (panel: ExpandedPanel) => {
    if (!expandedPanel) {
      return 'h-full opacity-100 transform scale-100';
    }

    if (expandedPanel === panel) {
      return 'h-full opacity-100 transform scale-100';
    } else {
      // Collapsed panels show minimal content
      return 'h-full opacity-60 transform scale-95 lg:overflow-hidden';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Responsive layout with expand/collapse functionality */}
        <div className={getGridClass()}>
          {/* Chat Panel */}
          <div className={getPanelClass('chat')}>
            <div className={getPanelContentClass('chat')}>
              <ChatPanel 
                className="h-full" 
                isExpanded={expandedPanel === 'chat'}
                onToggleExpand={() => handleToggleExpand('chat')}
                currentCode={currentCode}
                onCodeUpdate={handleCodeUpdate}
              />
            </div>
          </div>

          {/* Code Input Panel */}
          <div className={getPanelClass('input')}>
            <div className={getPanelContentClass('input')}>
              <CodeInputPanel 
                className="h-full" 
                isExpanded={expandedPanel === 'input'}
                onToggleExpand={() => handleToggleExpand('input')}
                onSendToChat={handleSendToChat}
              />
            </div>
          </div>

          {/* Code Output Panel */}
          <div className={getPanelClass('output')}>
            <div className={getPanelContentClass('output')}>
              <CodeOutputPanel 
                className="h-full"
                isExpanded={expandedPanel === 'output'}
                onToggleExpand={() => handleToggleExpand('output')}
                originalCode={currentCode}
                optimizedCode={optimizedCode}
              />
            </div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="mt-6 p-4 bg-card border border-panel-border rounded-lg shadow-soft">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>🚀 Powered by AI</span>
              <span>📝 Auto-save enabled</span>
              <span>🔄 Real-time analysis</span>
            </div>
            <div className="text-xs">
              CodeSight AI - Your intelligent coding companion
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
