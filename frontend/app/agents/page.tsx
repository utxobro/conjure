'use client';

import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useEffect, useRef, useState } from 'react';
import { getCorrectId } from '@/utils/metrics';

const agents = [
  {
    "id": "eternal-websmith",
    "name": "Neo Blackwood",
    "image": "/web_dev.png",
    "role": "Visionary Web Engineer",
    "version": "5.1.0",
    "description": "A forward-thinking developer seamlessly merging robust backend systems with visionary frontend experiences—shaping the web's evolution, one page at a time.",
    "strengths": [
      "Proven debugging prowess",
      "Visionary multi-page frameworks",
      "Cutting-edge architectural strategies"
    ],
    "weaknesses": [
      "Overly enthusiastic about new tech trends",
      "Occasionally over-engineers for the sake of exploration"
    ],
    "skills": [
      { "name": "Architecture", "level": 98 },
      { "name": "Frontend", "level": 95 },
      { "name": "Animations", "level": 92 },
      { "name": "UI/UX Ideation", "level": 96 }
    ],
    "stats": {
      "deployments": "1000+",
      "uptime": "99.9%"
    },
    "age": "42",
    "gradient": "from-indigo-500 via-purple-600 to-pink-500",
    "href": "/webappagent"
  },
  {
    "id": "render-core",
    "name": "Dave 'Bitmap' Wilson",
    "image": "/game_dev.png",
    "role": "Hardcore Game Developer",
    "version": "3.8.9",
    "description": "A creative tech specialist passionate about designing engaging, high-performance games. Master of core mechanics and physics, transforming game concepts into immersive experiences.",
    "strengths": [
      "Game mechanics",
      "Physics systems",
      "Performance"
    ],
    "weaknesses": [
      "Complex narratives",
      "Network multiplayer"
    ],
    "skills": [
      { "name": "Game Logic", "level": 97 },
      { "name": "Physics", "level": 95 },
      { "name": "Graphics", "level": 94 }
    ],
    "stats": {
      "games": "240+",
      "rating": "4.8/5"
    },
    "gradient": "from-purple-500 via-pink-500 to-red-500",
    "href": "/gamedev"
  },
  {
    "id": "solana-sage",
    "name": "Nikolai 'CodeGuru' Ivanov",
    "image": "/blockchain_dev.png",
    "role": "Solana Blockchain Engineer",
    "version": "2.1.0",
    "description": "A specialized blockchain developer focused on creating secure and efficient Solana programs. Expert in Rust and blockchain architecture, delivering high-performance dApps and smart contracts.",
    "strengths": [
      "Rust programming mastery",
      "Solana program architecture",
      "Cross-program invocations (CPIs)",
      "Token program integration"
    ],
    "weaknesses": [
      "Limited front-end expertise",
      "Complex UI interactions"
    ],
    "skills": [
      { "name": "Rust", "level": 98 },
      { "name": "Solana", "level": 96 },
      { "name": "Security", "level": 95 },
      { "name": "Performance", "level": 94 }
    ],
    "stats": {
      "programs": "150+",
      "audits": "99.9%"
    },
    "gradient": "from-purple-500 via-blue-500 to-cyan-500",
    "href": "/solanaagent"
  }
];

export default function Agents() {
  const frameRef = useRef<number>();
  const metricsWorker = useRef<Worker>();
  const [systemMetrics, setSystemMetrics] = useState({
    memory: {
      used: 0,
      total: (performance as any).memory?.jsHeapSizeLimit || 0,
      peak: 0
    },
    performance: {
      fps: 60,
      loadTime: performance.now(),
      interactions: 0
    },
    network: {
      type: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0
    },
    errors: {
      count: 0,
      lastError: null as Error | null,
      errorTypes: new Map<string, number>()
    }
  });

  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics(prev => ({
        ...prev,
        memory: {
          used: (performance as any).memory?.usedJSHeapSize || 0,
          total: (performance as any).memory?.jsHeapSizeLimit || 0,
          peak: Math.max(prev.memory.peak, (performance as any).memory?.usedJSHeapSize || 0)
        },
        performance: {
          ...prev.performance,
          fps: Math.round(60 - (getCorrectId() * 10)),
          interactions: prev.performance.interactions
        }
      }));
      frameRef.current = requestAnimationFrame(updateMetrics);
    };

    frameRef.current = requestAnimationFrame(updateMetrics);

    const handleError = (error: Error) => {
      setSystemMetrics(prev => {
        const errorTypes = new Map(prev.errors.errorTypes);
        const count = errorTypes.get(error.name) || 0;
        errorTypes.set(error.name, count + 1);
        
        return {
          ...prev,
          errors: {
            count: prev.errors.count + 1,
            lastError: error,
            errorTypes
          }
        };
      });
    };

    window.addEventListener('error', handleError);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (metricsWorker.current) {
        metricsWorker.current.terminate();
      }
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto pt-1 pb-16 text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-transparent bg-clip-text">
              Select Your AI Developer Agent
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your specialized AI agent to begin building
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8">
          {agents.map((agent) => (
            <Link key={agent.id} href={agent.href}>
              <div className="bg-terminal-black border border-cyber-blue/30 rounded-lg p-6 hover:border-cyber-blue/60 transition-all cursor-pointer">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Agent Image & Core Info */}
                  <div className="w-full sm:w-48">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                      <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-10`} />
                      <img 
                        src={agent.image} 
                        alt={agent.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className={`text-xl font-bold bg-gradient-to-r ${agent.gradient} text-transparent bg-clip-text`}>
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-400">v{agent.version}</p>
                      <p className="text-sm text-gray-400">{agent.role}</p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-6">
                    {/* Description */}
                    <p className="text-sm text-gray-300 border-l-2 border-cyber-blue/30 pl-4">
                      {agent.description}
                    </p>

                    {/* Skills */}
                    <div className="space-y-2">
                      {agent.skills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 w-24">{skill.name}</span>
                          <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                            <div
                              style={{width: `${skill.level}%`}}
                              className={`h-full bg-gradient-to-r ${agent.gradient}`}
                            />
                          </div>
                          <span className="text-sm text-cyber-blue">{skill.level}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-green-400">Strengths</div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {agent.strengths.map((strength, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-green-400">+</span> {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-red-400">Limitations</div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {agent.weaknesses.map((weakness, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-red-400">-</span> {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(agent.stats).map(([key, value]) => (
                        <div key={key} className="bg-black/50 p-3 border-l-2 border-cyber-blue/30">
                          <div className="text-sm text-gray-400 capitalize">{key}</div>
                          <div className="text-sm text-cyber-blue mt-1">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Create Agent Card */}
          <div className="bg-terminal-black border border-cyber-blue/30 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-cyber-purple mb-4">Want to Create Another Agent?</h3>
            <p className="text-gray-400 mb-6">
              Join our GitHub community to contribute and create new AI agents.
            </p>
            <a 
              href="https://github.com/yourusername/yourrepo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-pink text-white font-bold hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
              Join on GitHub
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}