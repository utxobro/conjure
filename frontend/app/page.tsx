'use client';

import Link from 'next/link';
import AppLayout from '../components/AppLayout';
import { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  type: 'bot' | 'user' | 'terminal' | 'success';
  content: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const demoSequence: TerminalLine[] = [
    { type: 'bot', content: "Hi! I'm your AI developer. What would you like to build?" },
    { type: 'user', content: "Create a full-stack e-commerce platform with React and Node.js" },
    { type: 'bot', content: "I'll help you build that e-commerce platform. Let me break this down and handle everything." },
    { type: 'terminal', content: "🤔 Analyzing project requirements..." },
    { type: 'terminal', content: "📋 Breaking down components needed:" },
    { type: 'terminal', content: "  • User authentication system" },
    { type: 'terminal', content: "  • Product catalog" },
    { type: 'terminal', content: "  • Shopping cart" },
    { type: 'terminal', content: "  • Payment processing" },
    { type: 'terminal', content: "  • Order management" },
    { type: 'bot', content: "I've analyzed the requirements. Let me start setting up the development environment." },
    { type: 'terminal', content: "> Initializing development workspace..." },
    { type: 'terminal', content: "> Setting up Git repository..." },
    { type: 'terminal', content: "> Installing dependencies..." },
    { type: 'bot', content: "Now I'll create the frontend with React." },
    { type: 'terminal', content: "> Creating React.js frontend structure..." },
    { type: 'terminal', content: "> Setting up Tailwind CSS for styling..." },
    { type: 'terminal', content: "> Implementing responsive layouts..." },
    { type: 'terminal', content: "> Creating component library..." },
    { type: 'bot', content: "Frontend is ready. Moving on to the backend setup." },
    { type: 'terminal', content: "> Configuring Node.js backend..." },
    { type: 'terminal', content: "> Setting up Express server..." },
    { type: 'terminal', content: "> Implementing JWT authentication..." },
    { type: 'terminal', content: "> Creating RESTful API routes..." },
    { type: 'bot', content: "Now setting up the database and connections." },
    { type: 'terminal', content: "> Initializing PostgreSQL database..." },
    { type: 'terminal', content: "> Creating database schema..." },
    { type: 'terminal', content: "> Setting up migrations..." },
    { type: 'terminal', content: "> Implementing data models..." },
    { type: 'bot', content: "Almost done! Setting up deployment and testing." },
    { type: 'terminal', content: "> Configuring deployment pipeline..." },
    { type: 'terminal', content: "> Running test suites..." },
    { type: 'terminal', content: "> Optimizing performance..." },
    { type: 'terminal', content: "> Deploying to production..." },
    { type: 'success', content: "✨ Development complete!" },
    { type: 'success', content: "🚀 Your e-commerce platform is live at: https://your-store.demo" },
    { type: 'bot', content: "Your e-commerce platform is ready! I've implemented all core features with best practices and security measures." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < demoSequence.length) {
        const step = demoSequence[currentStep];
        setTerminalLines(prev => [...prev, step]);
        setCurrentStep(prev => prev + 1);
        
        // Scroll to bottom
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      } else {
        // Reset after a longer delay
        setTimeout(() => {
          setCurrentStep(0);
          setTerminalLines([]);
        }, 3000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh)] bg-[#080808] overflow-hidden">
        {/* Main Content */}
        <div className="relative ">
          {/* Terminal-style Header */}
          <div className="border-b border-[#1a1a1a]">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[#666] text-sm font-mono">conjure_ai@localhost:~</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-[#666]">AGENTS: 2 ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative h-[90vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-[90%] lg:max-w-[80%] xl:max-w-[1000px]">
              <div className="flex justify-center">
                {/* Command Interface */}
                <div className="relative w-full">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-mono text-center">
                      <span className="text-cyan-400">Conjure</span>
                      <span className="text-white">AI</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-[#666] mb-6 sm:mb-8 font-mono text-center">
                      Just describe what you want to build. Our AI agents will handle the rest.
                    </p>
                    
                    {/* Command Input Simulation */}
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                      <div 
                        ref={terminalRef}
                        className="space-y-2 h-[40vh] overflow-y-auto scrollbar-hide flex flex-col"
                      >
                        <div className="flex-1">
                          {terminalLines.map((line, i) => (
                            <div key={i} className={`
                              font-mono text-sm mb-2
                              ${line.type === 'bot' ? 'text-cyan-400' : ''}
                              ${line.type === 'user' ? 'text-purple-400' : ''}
                              ${line.type === 'terminal' ? 'text-[#666]' : ''}
                              ${line.type === 'success' ? 'text-green-400' : ''}
                            `}>
                              {line.type === 'terminal' && !line.content.startsWith('  ') && <span className="text-green-400">{">"} </span>}
                              {line.content}
                            </div>
                          ))}
                        </div>
                        <div className="text-cyan-400 animate-pulse">_</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <Link
                        href="/agents"
                        className="group w-full sm:w-44 bg-gradient-to-br from-cyan-500 via-cyan-400 to-cyan-300 text-black px-5 py-3 rounded-xl font-mono font-bold hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 ease-out flex items-center justify-center text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Get Started
                        </span>
                      </Link>

                      <Link
                        href="/sites"
                        className="group w-full sm:w-44 bg-[#0a0a0a] text-cyan-400 px-5 py-3 rounded-xl font-mono font-bold border border-cyan-500/20 hover:border-cyan-400/40 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 ease-out flex items-center justify-center text-sm backdrop-blur-sm"
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5s2.238-5 5-5 5 2.239 5 5-2.238 5-5 5z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                          View Demos
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
} 