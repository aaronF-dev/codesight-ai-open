import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SyntaxHighlightedCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Enhanced language detection with better accuracy
const detectLanguage = (code: string): string => {
  if (!code.trim()) return 'text';
  
  const codeLines = code.split('\n');
  const firstLine = codeLines[0].trim();
  const codeContent = code.toLowerCase();
  
  // Check for specific file headers/shebang lines
  if (firstLine.startsWith('#!/usr/bin/env python') || firstLine.startsWith('#!/usr/bin/python')) {
    return 'python';
  }
  if (firstLine.startsWith('#!/bin/bash') || firstLine.startsWith('#!/bin/sh')) {
    return 'bash';
  }
  
  // JSON detection (improved)
  if (/^\s*[{\[]/.test(code.trim()) && /[}\]]\s*$/.test(code.trim())) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Continue to other checks
    }
  }
  
  // XML/HTML detection (improved)
  if (/^\s*<\?xml/.test(code) || /<!DOCTYPE html/i.test(code)) {
    return code.includes('<!DOCTYPE html') ? 'html' : 'xml';
  }
  
  // HTML patterns (improved)
  if (/<(html|head|body|div|span|p|a|img|script|style|link|meta)\b[^>]*>/i.test(code)) {
    return 'html';
  }
  
  // CSS patterns (improved)
  if (/^\s*@(import|media|keyframes|font-face|charset)/m.test(code) ||
      /[.#][\w-]+\s*\{[^}]*[\w-]+\s*:\s*[^}]+\}/s.test(code) ||
      /^\s*[\w-]+\s*:\s*[^;]+;/m.test(code)) {
    return 'css';
  }
  
  // JavaScript/TypeScript patterns (enhanced)
  if (/\b(function|const|let|var|class|import|export|require|module\.exports)\s/.test(code) ||
      /\b(console\.|document\.|window\.|process\.|global\.)\w+/.test(code) ||
      /=>\s*[{(]/.test(code) ||
      /\$\(/.test(code) ||  // jQuery
      /\bnew\s+\w+\s*\(/.test(code)) {
    
    // TypeScript specific patterns
    if (/\b(interface|type\s+\w+\s*=|enum\s+\w+|declare\s+|as\s+\w+)\b/.test(code) ||
        /<\w+>/.test(code) ||  // Generic types
        /:\s*(string|number|boolean|void|any|unknown|never)\b/.test(code)) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Python patterns (enhanced)
  if (/\b(def|class|import|from|print\(|if\s+__name__|range\(|len\()\b/.test(code) ||
      /^\s*#(?!\s*include)/m.test(code) ||  // Python comments (not C includes)
      /\bself\.\w+/.test(code) ||
      /\b(True|False|None)\b/.test(code) ||
      /\bfor\s+\w+\s+in\s+/.test(code)) {
    return 'python';
  }
  
  // Java patterns (enhanced)
  if (/\b(public\s+class|private\s+|protected\s+|static\s+|final\s+)\w+/.test(code) ||
      /\b(String|int|boolean|void|double|float|long|char)\s+\w+/.test(code) ||
      /System\.(out|in)\./.test(code) ||
      /\bpackage\s+[\w.]+;/.test(code) ||
      /\bnew\s+\w+\s*\[\s*\d*\s*\]/.test(code)) {
    return 'java';
  }
  
  // C++ patterns (enhanced)
  if (/#include\s*<[\w./]+>/.test(code) ||
      /\b(std::|cout|cin|endl|vector|string|namespace\s+std)\b/.test(code) ||
      /\b(class|struct)\s+\w+\s*\{/.test(code) ||
      /\btemplate\s*</.test(code)) {
    return 'cpp';
  }
  
  // C patterns
  if (/#include\s*<[\w./]+\.h>/.test(code) ||
      /\b(printf|scanf|malloc|free|NULL)\s*\(/.test(code) ||
      /\b(int|char|float|double|void)\s+\w+\s*\(/.test(code)) {
    return 'c';
  }
  
  // C# patterns (enhanced)
  if (/\b(using\s+System|namespace\s+\w+|Console\.(WriteLine|ReadLine)|public\s+static\s+void\s+Main)\b/.test(code) ||
      /\b(var|string|int|bool|double|decimal)\s+\w+\s*=/.test(code) ||
      /\[[\w.]+\]/.test(code) ||  // Attributes
      /\bget\s*;\s*set\s*;/.test(code)) {  // Properties
    return 'csharp';
  }
  
  // Go patterns (enhanced)
  if (/\b(package\s+main|func\s+main|import\s+"[^"]+"|fmt\.(Print|Scan))\b/.test(code) ||
      /\bvar\s+\w+\s+\w+/.test(code) ||
      /\bgo\s+func\s*\(/.test(code) ||
      /\bchan\s+\w+/.test(code)) {
    return 'go';
  }
  
  // Rust patterns (enhanced)
  if (/\b(fn\s+main|use\s+std::|println!|let\s+(mut\s+)?\w+|struct\s+\w+)\b/.test(code) ||
      /\bmatch\s+\w+\s*\{/.test(code) ||
      /\bimpl\s+\w+/.test(code) ||
      /&(str|mut)/.test(code)) {
    return 'rust';
  }
  
  // PHP patterns (enhanced)
  if (/^\s*<\?php/.test(code) ||
      /\$\w+/.test(code) ||
      /\b(echo|print|var_dump|isset|empty)\s/.test(code) ||
      /->/.test(code) && !/console\.log/.test(code) ||
      /::/.test(code) && !/std::/.test(code)) {
    return 'php';
  }
  
  // Ruby patterns (enhanced)
  if (/\b(def\s+\w+|puts\s+|require\s+['"]|class\s+\w+\s*<|attr_reader|attr_writer|attr_accessor)\b/.test(code) ||
      /@\w+/.test(code) ||
      /\bend\s*$/.test(code) ||
      /\bdo\s*\|/.test(code)) {
    return 'ruby';
  }
  
  // Swift patterns
  if (/\b(import\s+\w+|func\s+\w+|var\s+\w+:|let\s+\w+:|class\s+\w+:|struct\s+\w+:)\b/.test(code) ||
      /\bprint\s*\(/.test(code) && /Swift|UIKit|Foundation/.test(code)) {
    return 'swift';
  }
  
  // Kotlin patterns
  if (/\b(fun\s+\w+|val\s+\w+|var\s+\w+|class\s+\w+|object\s+\w+)\b/.test(code) ||
      /\bprintln\s*\(/.test(code)) {
    return 'kotlin';
  }
  
  // SQL patterns (enhanced)
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|GROUP\s+BY|ORDER\s+BY)\b/i.test(code)) {
    return 'sql';
  }
  
  // YAML patterns
  if (/^\s*[\w-]+\s*:\s*[^{]/.test(code) && !/\{.*\}/.test(code)) {
    return 'yaml';
  }
  
  // Shell/Bash patterns
  if (/^\s*#!\/bin\/(bash|sh)/.test(code) ||
      /\b(echo|cd|ls|grep|awk|sed|chmod|chown)\s/.test(code) ||
      /\$\{?\w+\}?/.test(code) && !/\$\(/.test(code)) {
    return 'bash';
  }
  
  return 'text';
};

export const SyntaxHighlightedCodeInput: React.FC<SyntaxHighlightedCodeInputProps> = ({
  value,
  onChange,
  placeholder,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguage] = useState('text');

  useEffect(() => {
    const detectedLang = detectLanguage(value);
    setLanguage(detectedLang);
  }, [value]);

  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '14px',
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
      overflow: 'auto',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
    }
  };

  if (isEditing || !value.trim()) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        placeholder={placeholder}
        className={cn(
          "w-full h-full p-4 border-0 bg-transparent resize-none font-mono text-sm focus:ring-0 focus:outline-none custom-scrollbar",
          className
        )}
        style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
        autoFocus
      />
    );
  }

  return (
    <div 
      className={cn("w-full h-full cursor-text relative", className)}
      onClick={() => setIsEditing(true)}
    >
      <div className="w-full h-full overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          customStyle={{
            background: 'transparent',
            margin: 0,
            padding: '1rem',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            minHeight: '100%',
            overflow: 'visible',
          }}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
      {language !== 'text' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20">
          {language}
        </div>
      )}
    </div>
  );
};