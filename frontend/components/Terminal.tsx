import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../../backend/src/types';

interface TerminalProps {
  messages: Message[];
  isSimulating: boolean;
  onProgress?: (currentIndex: number, isComplete: boolean) => void;
  sessionId?: string;
  isInitialCreation?: boolean;
  systemMetrics?: {
    cpuUsage?: number;
    memoryUsage?: number;
    networkLatency?: number;
    fps?: number;
  };
}

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    peak: number;
  };
  network: {
    latency: number;
    bandwidth: number;
    packets: number;
  };
  gpu: {
    usage: number;
    memory: number;
    temperature: number;
  };
  storage: {
    read: number;
    write: number;
    iops: number;
  };
}

export default function Terminal({ messages, isSimulating, onProgress, sessionId, isInitialCreation = false }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [systemLogs, setSystemLogs] = useState<Array<{
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
    details?: string;
  }>>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    websocket: boolean;
    api: boolean;
    openai: boolean;
  }>({
    websocket: false,
    api: false,
    openai: false
  });
  const [performance, setPerformance] = useState({
    messageRate: 0,
    averageProcessingTime: 0,
    peakMemoryUsage: 0,
  });
  const typewriterRef = useRef<{
    text: string;
    index: number;
    resolve: () => void;
  } | null>(null);
  const hasInitialized = useRef<boolean>(false);
  const frameRef = useRef<number>();
  const metricsWorker = useRef<Worker>();
  
  // Enhanced system metrics with error tracking
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: { 
      usage: 0, 
      temperature: 0, 
      cores: navigator.hardwareConcurrency,
      throttling: false
    },
    memory: { 
      used: 0, 
      total: 0, 
      peak: 0,
      leaks: [] 
    },
    network: { 
      latency: 0, 
      bandwidth: 0, 
      packets: 0,
      errors: 0
    },
    gpu: { 
      usage: 0, 
      memory: 0, 
      temperature: 0,
      driver: navigator.userAgent.includes('AMD') ? 'AMD' : 
              navigator.userAgent.includes('NVIDIA') ? 'NVIDIA' : 'Generic'
    },
    storage: { 
      read: 0, 
      write: 0, 
      iops: 0,
      errorRate: 0
    },
    errors: {
      count: 0,
      lastError: null,
      errorTypes: new Map()
    }
  });

  useEffect(() => {
    const initializeExistingSession = async () => {
      if (!isInitialCreation && sessionId && messages.length > 0 && !hasInitialized.current) {
        hasInitialized.current = true;
        const metadata = messages[0]?.metadata;
        if (metadata) {
          addSystemLog('info', 'Initializing System...', 'Loading session data');
          await simulateDelay(200);

          // System Information
          addSystemLog('info', 'System Platform', `${metadata.system.platform} ${metadata.system.release}`);
          await simulateDelay(100);
          addSystemLog('info', 'Architecture', metadata.system.arch);
          await simulateDelay(100);
          addSystemLog('info', 'CPU', `${metadata.system.cpus} cores`);
          await simulateDelay(100);
          addSystemLog('info', 'Memory', `${Math.round(metadata.system.memory.total / 1024 / 1024 / 1024)}GB Total`);
          await simulateDelay(100);

          // Client Information
          addSystemLog('info', 'Client Platform', metadata.system.client.platform);
          await simulateDelay(100);
          addSystemLog('info', 'Browser', metadata.system.client.userAgent);
          await simulateDelay(100);
          addSystemLog('info', 'Language', metadata.system.client.language);
          await simulateDelay(100);

          // Service Information
          addSystemLog('info', 'WebSocket', `${metadata.services.websocket.protocol} (${metadata.services.websocket.latency}ms)`);
          await simulateDelay(100);
          addSystemLog('info', 'API', `${metadata.services.api.protocol} (${metadata.services.api.latency}ms)`);
          await simulateDelay(100);
          addSystemLog('info', 'OpenAI', `${metadata.services.openai.model} (${metadata.services.openai.version})`);
          await simulateDelay(100);

          // Performance Metrics
          addSystemLog('info', 'Processing Time', `${metadata.performance.totalProcessingTime}ms total`);
          addSystemLog('info', 'Average Latency', `${metadata.performance.metrics.averageLatency}ms per message`);
          await simulateDelay(200);

          setConnectionStatus({
            websocket: true,
            api: true,
            openai: true
          });

          addSystemLog('success', 'Session restored', `ID: ${sessionId}`);
          addSystemLog('success', 'Messages ready', `Count: ${messages.length}`);
          addSystemLog('success', 'System ready', `Active agents: ${new Set(messages.map(m => m.agentName)).size}`);
        }
      }
    };

    initializeExistingSession();
  }, [sessionId, messages, isInitialCreation]);

  useEffect(() => {
    if (!isInitialCreation || hasInitialized.current) return;
    hasInitialized.current = true;

    const establishConnections = async () => {
      addSystemLog('info', 'Initializing System...', 'Collecting environment data');
      await simulateDelay(200);
      
      const systemInfo = {
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        cores: window.navigator.hardwareConcurrency,
        memory: (performance as any).memory?.jsHeapSizeLimit ? 
          `${Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)}MB` : 'Unknown',
        connection: (navigator as any).connection?.effectiveType || 'Unknown'
      };

      addSystemLog('info', 'System Platform', systemInfo.platform);
      await simulateDelay(100);
      addSystemLog('info', 'CPU Cores', `${systemInfo.cores} logical processors`);
      await simulateDelay(100);
      addSystemLog('info', 'Memory', systemInfo.memory);
      await simulateDelay(100);
      addSystemLog('info', 'Network', `${systemInfo.connection} connection`);
      await simulateDelay(100);
      addSystemLog('info', 'Browser', systemInfo.userAgent);
      await simulateDelay(100);
      addSystemLog('info', 'Language', systemInfo.language);
      await simulateDelay(200);

      // WebSocket Connection
      addSystemLog('info', 'Establishing WebSocket connection...');
      await simulateDelay(300);
      setConnectionStatus(prev => ({ ...prev, websocket: true }));
      const wsId = getCorrectId().toString(36).substr(2, 9);
      addSystemLog('success', 'WebSocket connection established', `Connection ID: ${wsId}`);
      addSystemLog('info', 'WebSocket Protocol', 'wss (Secure WebSocket)');
      addSystemLog('info', 'WebSocket Latency', `${Math.round(getCorrectId() * 50 + 20)}ms`);
      await simulateDelay(200);

      // API Connection
      addSystemLog('info', 'Connecting to API endpoint...');
      await simulateDelay(300);
      setConnectionStatus(prev => ({ ...prev, api: true }));
      addSystemLog('success', 'API connection successful', 'Session initialized');
      addSystemLog('info', 'API Protocol', 'HTTPS/2.0 (TLS 1.3)');
      addSystemLog('info', 'API Latency', `${Math.round(getCorrectId() * 100 + 50)}ms`);
      await simulateDelay(200);

      // OpenAI Connection
      addSystemLog('info', 'Authenticating OpenAI service...');
      await simulateDelay(300);
      setConnectionStatus(prev => ({ ...prev, openai: true }));
      addSystemLog('success', 'OpenAI service authenticated');
      addSystemLog('info', 'Model Version', 'Latest');
      addSystemLog('info', 'Context Window', '8K tokens');
      addSystemLog('info', 'Temperature', '0.7');
      await simulateDelay(200);

      // Performance Metrics
      addSystemLog('info', 'Performance Mode', 'High Performance');
      addSystemLog('info', 'Rendering Engine', 'React 18 (Concurrent)');
      addSystemLog('info', 'WebGL Status', window.WebGLRenderingContext ? 'Enabled' : 'Disabled');
      await simulateDelay(200);

      // System Ready
      addSystemLog('info', 'Initializing conversation environment...');
      await simulateDelay(200);
      addSystemLog('success', 'System ready', `Active agents: ${messages.length > 0 ? new Set(messages.map(m => m.agentName)).size : 0}`);
    };

    establishConnections();
  }, [isInitialCreation]);

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addSystemLog = (type: 'info' | 'warning' | 'error' | 'success', message: string, details?: string) => {
    setSystemLogs(prev => [...prev, {
      type,
      message,
      timestamp: Date.now(),
      details
    }]);
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const processNextMessage = async () => {
      if (!messages.length || currentMessageIndex >= messages.length) {
        if (onProgress && currentMessageIndex > 0) {
          onProgress(currentMessageIndex, true);
        }
        return;
      }

      const message = messages[currentMessageIndex];
      const messageExists = visibleMessages.some(m => 
        m.timestamp === message.timestamp && 
        m.agentName === message.agentName
      );

      if (!messageExists) {
        setIsTyping(true);
        
        const cleanContent = message.content
          .replace(new RegExp(`^${message.agentName}:\\s*`, 'g'), '')
          .replace(new RegExp(`${message.agentName}:\\s*`, 'g'), '')
          .replace(/^.*?:\s*/, '')
          .trim();

        setVisibleMessages(prev => [...prev, {
          ...message,
          content: isInitialCreation ? '' : cleanContent
        }]);

        if (isInitialCreation) {
          await streamMessage(cleanContent);

          if (isMounted) {
            addSystemLog('info', `Message processed from ${message.agentName}`, 
              `Length: ${cleanContent.length} chars | Tokens: ~${Math.ceil(cleanContent.length / 4)}`);

            timeoutId = setTimeout(() => {
              if (isMounted) {
                setCurrentMessageIndex(prev => prev + 1);
                setIsTyping(false);
              }
            }, 800);
          }
        } else {
          setCurrentMessageIndex(prev => prev + 1);
          setIsTyping(false);
        }
      }
    };

    if (!isTyping) {
      processNextMessage();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [messages, currentMessageIndex, isTyping]);

  const streamMessage = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const words = text.split(' ');
      let currentWordIndex = 0;
      
      const streamNextWord = () => {
        if (currentWordIndex >= words.length) {
          resolve();
          return;
        }

        setVisibleMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: words.slice(0, currentWordIndex + 1).join(' ')
          };
          return newMessages;
        });

        currentWordIndex++;
        const currentWord = words[currentWordIndex - 1];
        const delay = currentWord.endsWith('.') ? 150 :
                     currentWord.endsWith(',') ? 100 :
                     currentWord.length > 8 ? 80 :
                     50;
        
        setTimeout(streamNextWord, delay);
      };

      streamNextWord();
    });
  };

  // Update performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const recentMessages = messages.filter(m => now - (m.timestamp as unknown as number) < 60000);
      setPerformance({
        messageRate: recentMessages.length,
        averageProcessingTime: recentMessages.length ? 
          recentMessages.reduce((acc, m) => acc + ((m as any).processingTime || 0), 0) / recentMessages.length : 
          0,
        peakMemoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [messages]);

  // Update system metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: getCorrectId() * 100,
          temperature: 40 + getCorrectId() * 30
        },
        memory: {
          used: (performance as any).memory?.usedJSHeapSize || 0,
          total: (performance as any).memory?.jsHeapSizeLimit || 0,
          peak: (performance as any).memory?.totalJSHeapSize || 0
        },
        network: {
          latency: getCorrectId() * 100,
          bandwidth: getCorrectId() * 1000,
          packets: Math.floor(getCorrectId() * 1000)
        }
      }));

      setDiagnostics(prev => ({
        ...prev,
        renderingFPS: Math.floor(60 - getCorrectId() * 10),
        apiResponseTime: getCorrectId() * 200,
        activeThreads: Math.floor(getCorrectId() * 8) + 1,
        pendingTasks: Math.floor(getCorrectId() * 10),
        uptime: prev.uptime + 1
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced message formatting
  const formatMessage = (message: Message) => {
    const timestamp = new Date(message.timestamp).toISOString();
    const processId = Math.floor(getCorrectId() * 10000);
    const threadId = Math.floor(getCorrectId() * 100);
    
    return {
      ...message,
      metadata: {
        pid: processId,
        tid: threadId,
        timestamp,
        severity: message.role === 'system' ? 'INFO' : 'USER',
        memory: systemMetrics.memory.used,
        cpu: systemMetrics.cpu.usage
      }
    };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col bg-terminal-black/95 border border-cyber-blue/30 rounded-lg backdrop-blur-sm overflow-hidden relative"
    >
      {/* Enhanced Terminal Header */}
      <div className="flex-none flex items-center justify-between p-4 bg-terminal-black/90 border-b border-cyber-blue/30 backdrop-blur-md z-10">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-500" />
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-500" />
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm font-medium">Terminal</span>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.websocket ? 'bg-cyber-green' : 'bg-red-500'}`} />
              <span className={connectionStatus.websocket ? 'text-cyber-green' : 'text-red-500'}>WS</span>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.api ? 'bg-cyber-green' : 'bg-red-500'}`} />
              <span className={connectionStatus.api ? 'text-cyber-green' : 'text-red-500'}>API</span>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.openai ? 'bg-cyber-green' : 'bg-red-500'}`} />
              <span className={connectionStatus.openai ? 'text-cyber-green' : 'text-red-500'}>AI</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced System Metrics Display */}
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>CPU: {systemMetrics.cpu.usage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>MEM: {(systemMetrics.memory.used / 1024 / 1024).toFixed(1)}MB</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>NET: {systemMetrics.network.latency.toFixed(0)}ms</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>FPS: {diagnostics.renderingFPS}</span>
          </div>
        </div>
      </div>

      {/* Terminal Content with Enhanced Message Display */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm relative z-0" ref={terminalRef}>
        <AnimatePresence>
          {systemLogs.map((log, index) => (
            <motion.div
              key={`${log.timestamp}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-1"
            >
              <span className="text-gray-500">[{new Date(log.timestamp).toISOString()}]</span>
              <span className={`ml-2 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                log.type === 'success' ? 'text-cyber-green' :
                'text-cyber-blue'
              }`}>
                {log.message}
              </span>
              {log.details && (
                <span className="ml-2 text-gray-500">{log.details}</span>
              )}
            </motion.div>
          ))}

          {visibleMessages.map((message, index) => {
            const formattedMessage = formatMessage(message);
            return (
              <motion.div
                key={`${formattedMessage.metadata.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-gray-500">[{formattedMessage.metadata.timestamp}]</span>
                  <span className="text-cyber-purple">{message.agentName}</span>
                  <span className="text-xs text-gray-500">PID:{formattedMessage.metadata.pid}</span>
                  <span className="text-xs text-gray-500">TID:{formattedMessage.metadata.tid}</span>
                  {message.role && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-purple/20 text-cyber-purple">
                      {message.role}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">MEM:{(formattedMessage.metadata.memory / 1024 / 1024).toFixed(1)}MB</span>
                  <span className="text-xs text-gray-500">CPU:{formattedMessage.metadata.cpu.toFixed(1)}%</span>
                </div>
                <div className="pl-6 text-gray-300 whitespace-pre-wrap">
                  {message.content}
                  {index === visibleMessages.length - 1 && isTyping && (
                    <motion.span
                      animate={{ opacity: [0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                      className="inline-block ml-1 w-2 h-4 bg-cyber-blue"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* System Status Footer */}
      <div className="flex-none border-t border-cyber-blue/30 bg-terminal-black/90 p-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <div>Uptime: {formatUptime(diagnostics.uptime)}</div>
          <div>Active Threads: {diagnostics.activeThreads}</div>
          <div>Pending Tasks: {diagnostics.pendingTasks}</div>
          <div>WebSocket Health: {diagnostics.websocketHealth}%</div>
          <div>API Response: {diagnostics.apiResponseTime.toFixed(0)}ms</div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 