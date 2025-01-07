import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | number;
}

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isLoading?: boolean;
  connectionStatus?: string;
  isHighLoad?: boolean;
}

export default function ChatBox({ 
  onSendMessage, 
  messages, 
  isLoading = false, 
  connectionStatus = 'AI Connected',
  isHighLoad = false 
}: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    averageResponseTime: 0,
    lastActivityTime: new Date(),
    tokensPerSecond: 0,
    responseAccuracy: 98.5,
  });

  // Action messages to display while loading
  const actions = [
    'Thinking...',
    'Coding...',
    'Searching for assets...',
    'Processing request...',
    'Analyzing code...',
    'Generating response...',
    'Reviewing changes...',
    'Optimizing solution...',
  ];

  // State to track the current action index
  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  // Effect to update the action message every 3 seconds while isLoading is true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentActionIndex((prevIndex) => {
          if (prevIndex === 0) {
            // Wait 7 seconds on first index
            setTimeout(() => {
              setCurrentActionIndex(1);
            }, 7000);
            return 0;
          }
          return (prevIndex + 1) % actions.length;
        });
      }, 3000);
    } else {
      setCurrentActionIndex(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
    updateMetrics();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTimeValue = (timestamp: Date | number | undefined): number => {
    if (!timestamp) return Date.now();
    return timestamp instanceof Date ? timestamp.getTime() : timestamp;
  };

  const updateMetrics = () => {
    const responseTimes = messages.reduce((acc, curr, idx, arr) => {
      if (idx > 0 && curr.role === 'assistant' && arr[idx - 1].role === 'user') {
        acc.push(getTimeValue(curr.timestamp) - getTimeValue(arr[idx - 1].timestamp));
      }
      return acc;
    }, [] as number[]);

    const avgTime = responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000)
      : 0;

    setMetrics((prev) => ({
      ...prev,
      totalMessages: messages.length,
      averageResponseTime: avgTime,
      lastActivityTime: new Date(),
      tokensPerSecond: avgTime > 0 ? Math.round((1000 / avgTime) * 10) : prev.tokensPerSecond,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '42px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '32px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full flex flex-col bg-terminal-black/95 border border-cyber-blue/30 rounded-lg backdrop-blur-sm overflow-hidden relative"
    >
      {/* Chat Header */}
      <div className="flex-none flex items-center justify-between p-2 sm:p-4 bg-terminal-black/90 border-b border-cyber-blue/30 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{
                scale: isConnected ? [1, 1.2, 1] : 1,
                opacity: isConnected ? 1 : 0.5,
              }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${
                isConnected ? 'bg-cyber-green' : 'bg-cyber-pink'
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-medium ${
                isConnected ? 'text-cyber-green' : 'text-cyber-pink'
              }`}
            >
              {isConnected ? connectionStatus : 'Connecting...'}
              {isHighLoad && (
                <span className="ml-2 text-cyber-pink text-[10px] sm:text-xs animate-pulse">
                  (High Load)
                </span>
              )}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2 md:space-x-4 text-xs text-cyber-blue/70">
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden md:inline">{metrics.averageResponseTime}s avg</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="hidden md:inline">{metrics.totalMessages} msgs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 space-y-2 sm:space-y-4 relative z-0">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[95%] xs:max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 ${
                  message.role === 'assistant'
                    ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30'
                    : 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                }`}
              >
                <div className="flex items-center space-x-1 xs:space-x-2 mb-0.5 xs:mb-1 text-[8px] xs:text-[10px] sm:text-xs opacity-50">
                  <span>{message.role === 'assistant' ? 'AI Assistant' : 'You'}</span>
                  <span>•</span>
                  <span>
                    {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-xs xs:text-sm sm:text-base">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex justify-start"
            >
              <div className="max-w-[95%] xs:max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                <div className="flex items-center space-x-1 xs:space-x-2 mb-0.5 xs:mb-1 text-[8px] xs:text-[10px] sm:text-xs opacity-50">
                  <span>AI Assistant</span>
                  <span>•</span>
                  <span>{actions[currentActionIndex]}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1 xs:w-1.5 sm:w-2 h-1 xs:h-1.5 sm:h-2 rounded-full bg-cyber-purple"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-1 xs:w-1.5 sm:w-2 h-1 xs:h-1.5 sm:h-2 rounded-full bg-cyber-purple"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-1 xs:w-1.5 sm:w-2 h-1 xs:h-1.5 sm:h-2 rounded-full bg-cyber-purple"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 sm:p-4 border-t border-cyber-blue/30 bg-gradient-to-b from-terminal-black/95 to-terminal-black/90 backdrop-blur-xl z-10">
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-center">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-cyber-purple/20 rounded-lg blur-md group-focus-within:bg-cyber-purple/30 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your command..."
              className="w-full bg-black/60 text-white px-3 sm:px-4 rounded-lg border-2 border-cyber-blue/40 focus:border-cyber-purple/60 focus:outline-none resize-none transition-all duration-300 backdrop-blur-sm font-mono relative z-10 placeholder:text-cyber-blue/40 text-sm sm:text-base overflow-y-auto"
              style={{ 
                height: '42px',
                minHeight: '42px',
                maxHeight: '120px',
                paddingTop: '10px',
                paddingBottom: '10px',
                lineHeight: '22px'
              }}
              maxLength={1000}
            />
            <div className="absolute right-2 sm:right-3 top-2 text-[10px] sm:text-xs text-cyber-blue/40 pointer-events-none">
              {input.length > 0 && `${input.length}/1000`}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`aspect-square h-[36px] sm:h-[42px] my-auto rounded-lg font-medium transition-all flex items-center justify-center relative overflow-hidden ${
              isLoading
                ? 'bg-cyber-purple/50 cursor-wait'
                : !input.trim()
                ? 'bg-cyber-purple/30 cursor-not-allowed'
                : 'bg-gradient-to-br from-cyber-purple to-cyber-blue hover:from-cyber-blue hover:to-cyber-purple'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-cyber-purple/20 to-cyber-blue/20 ${input.trim() ? 'animate-pulse' : ''}`} />
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <svg
                className="w-4 sm:w-5 h-4 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}