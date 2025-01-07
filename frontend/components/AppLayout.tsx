import Link from 'next/link';
import RecentSitesBanner from './RecentSitesBanner';
import ParticlesBackground from './ParticlesBackground';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0B0E]">
      {/* Particles.js Background */}
      <ParticlesBackground />

      {/* Top Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-xl border-b border-[#00FF94]/20">
        <RecentSitesBanner />
      </div>

      {/* Futuristic Side Navigation */}
      <div className="fixed left-0 top-0 h-full w-72 bg-black/40 backdrop-blur-xl border-r border-[#00FF94]/20">
        {/* Push content down to account for banner */}
        <div className="h-12"></div>
        
        {/* AI Logo */}
        <Link href="/" className="flex items-center p-6 border-b border-[#00FF94]/20">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 bg-[#00FF94]/20 rounded-xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="1.5">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold text-white tracking-wider">Conjure<span className="text-[#00FF94]">AI</span></span>
            <div className="text-xs text-[#00FF94]/60">Agent Interface</div>
          </div>
        </Link>

        {/* Neural Nav Links */}
        <nav className="p-4 space-y-2">
          <Link href="/agents" 
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative"> 
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V17.5C7.5 17.5 6 15 6 13.5 6 12 7 11 8 11s2 .5 2 1.5V15c0 1 1 2 2 2s2-1 2-2v-2.5c0-1 1-1.5 2-1.5s2 1 2 2.5c0 1.5-1.5 4-4.438 4v4.379c4.781-.751 8.438-4.888 8.438-9.879 0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="font-medium">AI Agents Library</div>
              <div className="text-xs text-gray-500">Select an Agent</div>
            </div>
          </Link>

          <Link href="/sites" 
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="font-medium">Agent Creations Vault</div>
              <div className="text-xs text-gray-500">View past creations</div>
            </div>
          </Link>

          <a href="https://github.com/a0xsimsd/SamAI" target="_blank" rel="noopener noreferrer"
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.29 2.747-1.022 2.747-1.022.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </div>
            <div className="ml-3">
              <div className="font-medium">GitHub</div>
              <div className="text-xs text-gray-500">View Source Code</div>
            </div>
          </a>

          <a href="https://x.com/Samsssssai" target="_blank" rel="noopener noreferrer"
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </div>
            <div className="ml-3">
              <div className="font-medium">Twitter</div>
              <div className="text-xs text-gray-500">Latest Updates</div>
            </div>
          </a>

          <a href="https://Samai.gisok.io/Samai" target="_blank" rel="noopener noreferrer"
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"/><path d="M7 7H17M7 12H17M7 17H13"/></svg>
            </div>
            <div className="ml-3">
              <div className="font-medium">Documentation</div>
              <div className="text-xs text-gray-500">Learn More</div>
            </div>
          </a>

          <a href="https://discord.gg/samai" target="_blank" rel="noopener noreferrer"
            className="flex items-center p-4 rounded-xl text-gray-300 hover:text-[#00FF94] hover:bg-[#00FF94]/10 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#00FF94]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="https://iili.io/2UBgdjn.png" alt="Pump.fun" className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <div className="font-medium">Pump.fun</div>
            </div>
          </a>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="ml-72 mt-12">
        {/* Content Area */}
        <main className="p-8">
          <div className="relative">
            {children}
          </div>
        </main>
      </div>

      {/* Ambient Effects */}
    </div>
  );
}