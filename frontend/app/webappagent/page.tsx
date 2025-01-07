"use client";

import React, { useState, useCallback, useEffect } from "react";
import ChatBox from "@/components/ChatBox";
import Browser from "@/components/Browser";
import Terminal from "@/components/Terminal";
import SiteStructure from "@/components/SiteStructure";
import AppLayout from "@/components/AppLayout";
import { apiService } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  timestamp?: Date;
  metadata?: {
    type: 'system' | 'user' | 'assistant' | 'error';
    memory?: number;
    processId?: number;
    threadId?: number;
    contextIndex?: number;
    responseTime?: number;
    error?: string;
    stack?: string;
  };
}

interface NewPage {
  name: string;
  path: string;
  html: string;
}

interface UpdatedPage extends NewPage {
  reason: string;
}

interface DeletedPage extends NewPage {
  reason: string;
}

interface ChatResponse {
  response: string;
  newPages?: NewPage[];
  updatedPages?: UpdatedPage[];
  deletedPages?: DeletedPage[];
}

interface Page {
  name: string;
  path: string;
  html: string;
  isActive: boolean;
  metadata?: {
    created?: string;
    lastModified?: string;
    size?: number;
    checksum?: string;
  };
}

export default function WebAppAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHtml, setCurrentHtml] = useState("");
  const [terminalMessages, setTerminalMessages] = useState<any[]>([]);
  const [pages, setPages] = useState<Page[]>([
    {
      name: "Home",
      path: "/index.html",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Dark Theme Placeholder</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    /* RESET */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Consolas", monospace;
    }

    html, body {
      width: 100%;
      height: 100%;
      background: #0d0d0d;
      overflow: hidden; /* No scrolling needed for placeholder */
    }

    /* ANIMATED BACKGROUND */
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(120deg, #0d0d0d, #181818, #111111, #0d0d0d);
      background-size: 300% 300%;
      animation: cyberGradient 15s ease-in-out infinite;
    }

    @keyframes cyberGradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    /* WRAPPER / CONTAINER */
    .container {
      text-align: center;
      max-width: 600px;
      width: 90%;
    }

    /* HEADING */
    h1 {
      color: #00f4f4;
      font-size: 3rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      text-shadow:
        0 0 5px #00f4f4,
        0 0 10px #00ffff66,
        0 0 20px #00ffff44;
    }

    /* SUBTEXT */
    p {
      color: #e4e4e4;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

  </style>
</head>
<body>
  <div class="container">
    <h1>Create your masterpiece...</h1>
  </div>
</body>
</html>
`,
      isActive: true,
    },
  ]);
  const [currentPage, setCurrentPage] = useState("/index.html");

  // Set initial HTML content
  useEffect(() => {
    const indexPage = pages.find((p) => p.path === "/index.html");
    if (indexPage) {
      setCurrentHtml(indexPage.html);
    }
  }, []);

  // Normalize path helper function
  const normalizePath = (path: string) => {
    // Handle relative paths by adding a leading slash if not present
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    // Remove any double slashes
    path = path.replace(/\/+/g, "/");
    // Add .html extension if not present
    if (!path.endsWith(".html")) {
      path = path === "/" ? "/index.html" : `${path}.html`;
    }
    return path;
  };

  // Handle messages from Browser component
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "terminal") {
        setTerminalMessages((prev) => [...prev, event.data.message]);
      } else if (event.data.type === "navigation") {
        // Use the same handlePageSelect function that SiteStructure uses
        handlePageSelect(event.data.path);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pages]);

  const handlePageSelect = (path: string) => {
    const normalizedPath = normalizePath(path);
    const targetPage = pages.find((p) => p.path === normalizedPath);

    if (targetPage) {
      // Update active states
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          isActive: p.path === normalizedPath,
        }))
      );
      setCurrentPage(normalizedPath);
      setCurrentHtml(targetPage.html);

      // Add terminal message
      setTerminalMessages((prev) => [
        ...prev,
        {
          agentName: "System",
          content: `Switched to page: ${normalizedPath}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);

        // Add initial terminal message with enhanced metrics
        const startTime = performance.now();
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
        
        setTerminalMessages(prev => [...prev, {
          agentName: 'WebAppAgent',
          content: `Received prompt (${content.length} chars)
System Status:
- Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB
- Timestamp: ${new Date().toISOString()}
- Session ID: ${getCorrectId().toString(36).substr(2, 9)}
Processing request...`,
          timestamp: new Date(),
          metadata: {
            type: 'system',
            memory: initialMemory,
            processId: Math.floor(getCorrectId() * 10000),
            threadId: Math.floor(getCorrectId() * 100)
          }
        }]);

        // Add user message with metadata
        const userMessage: Message = {
          role: 'user',
          content,
          agentName: 'User',
          timestamp: new Date(),
          metadata: {
            type: 'user',
            memory: initialMemory,
            processId: Math.floor(getCorrectId() * 10000),
            threadId: Math.floor(getCorrectId() * 100)
          }
        };
        setMessages(prev => [...prev, userMessage]);

        // Get last 5 messages for context with metadata
        const recentMessages = [...messages.slice(-4), userMessage].map(msg => ({
          ...msg,
          metadata: {
            ...msg.metadata,
            contextIndex: messages.length
          }
        }));

        // Add processing message with metrics
        setTerminalMessages(prev => [...prev, {
          agentName: 'WebAppAgent',
          content: `Analyzing context and generating response...
Context size: ${recentMessages.length} messages
Memory delta: ${((performance as any).memory?.usedJSHeapSize - initialMemory) / 1024 / 1024}MB
Processing time: ${(performance.now() - startTime).toFixed(2)}ms`,
          timestamp: new Date(),
          metadata: {
            type: 'system',
            memory: (performance as any).memory?.usedJSHeapSize || 0,
            processId: Math.floor(getCorrectId() * 10000),
            threadId: Math.floor(getCorrectId() * 100)
          }
        }]);

        // Call API with enhanced monitoring
        const apiStartTime = performance.now();
        const response = await apiService.sendChatMessage(
          content,
          recentMessages,
          pages
        );
        const apiEndTime = performance.now();

        // Add response metrics
        setTerminalMessages(prev => [...prev, {
          agentName: 'WebAppAgent',
          content: `Generated response (${response.response.length} chars)
API Metrics:
- Response time: ${(apiEndTime - apiStartTime).toFixed(2)}ms
- Memory usage: ${((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Response size: ${new TextEncoder().encode(JSON.stringify(response)).length} bytes
Processing changes...`,
          timestamp: new Date(),
          metadata: {
            type: 'system',
            memory: (performance as any).memory?.usedJSHeapSize || 0,
            processId: Math.floor(getCorrectId() * 10000),
            threadId: Math.floor(getCorrectId() * 100)
          }
        }]);

        // Add AI response with metadata
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.response,
            agentName: 'WebAppAgent',
            timestamp: new Date(),
            metadata: {
              type: 'assistant',
              memory: (performance as any).memory?.usedJSHeapSize || 0,
              processId: Math.floor(getCorrectId() * 10000),
              threadId: Math.floor(getCorrectId() * 100),
              responseTime: apiEndTime - apiStartTime
            }
          }
        ]);

        // Handle changes with enhanced monitoring
        if (response.changes?.length) {
          let updatedPages = [...pages];
          let newCurrentPage = currentPage;
          let newCurrentHtml = currentHtml;
          let hasCreateAction = response.changes.some((change: { action: string }) => change.action === 'create');
          const changeStartTime = performance.now();

          const calculateChecksum = async (code: string) => {
            const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
            return Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
          };

          for (const change of response.changes) {
            const normalizedPath = normalizePath(change.name);
            const changeMetrics = {
              startTime: performance.now(),
              initialSize: pages.find(p => p.path === normalizedPath)?.html.length || 0
            };

            if (change.action === 'create') {
              setTerminalMessages(prev => [...prev, {
                agentName: 'WebAppAgent',
                content: `Creating new page: ${normalizedPath}...
Page Metrics:
- Size: ${change.html.length} bytes
- Scripts: ${(change.html.match(/<script/g) || []).length}
- Styles: ${(change.html.match(/<style|class=/g) || []).length}
- Links: ${(change.html.match(/<a /g) || []).length}`,
                timestamp: new Date(),
                metadata: {
                  type: 'system',
                  memory: (performance as any).memory?.usedJSHeapSize || 0,
                  processId: Math.floor(getCorrectId() * 10000),
                  threadId: Math.floor(getCorrectId() * 100)
                }
              }]);

              const checksum = await calculateChecksum(change.html);
              updatedPages.push({
                name: change.name,
                path: normalizedPath,
                html: change.html,
                isActive: true,
                metadata: {
                  created: new Date().toISOString(),
                  size: change.html.length,
                  checksum
                }
              });

              newCurrentPage = normalizedPath;
              newCurrentHtml = change.html;
              updatedPages = updatedPages.map(p => ({
                ...p,
                isActive: p.path === normalizedPath
              }));

            } else if (change.action === 'update') {
              setTerminalMessages(prev => [...prev, {
                agentName: 'WebAppAgent',
                content: `Updating page: ${normalizedPath}...
Update Metrics:
- Size delta: ${change.html.length - changeMetrics.initialSize} bytes
- Processing time: ${(performance.now() - changeMetrics.startTime).toFixed(2)}ms
- Memory impact: ${((performance as any).memory?.usedJSHeapSize - initialMemory) / 1024 / 1024}MB`,
                timestamp: new Date(),
                metadata: {
                  type: 'system',
                  memory: (performance as any).memory?.usedJSHeapSize || 0,
                  processId: Math.floor(getCorrectId() * 10000),
                  threadId: Math.floor(getCorrectId() * 100)
                }
              }]);

              const checksum = await calculateChecksum(change.html);
              updatedPages = updatedPages.map(p => ({
                ...p,
                html: p.path === normalizedPath ? change.html : p.html,
                isActive: !hasCreateAction && p.path === normalizedPath,
                metadata: p.path === normalizedPath ? {
                  lastModified: new Date().toISOString(),
                  size: change.html.length,
                  checksum
                } : p.metadata
              }));

              if (!hasCreateAction) {
                newCurrentPage = normalizedPath;
                newCurrentHtml = change.html;
              }

            } else if (change.action === 'delete') {
              setTerminalMessages(prev => [...prev, {
                agentName: 'WebAppAgent',
                content: `Deleting page: ${normalizedPath}...
Delete Metrics:
- Size removed: ${changeMetrics.initialSize} bytes
- Processing time: ${(performance.now() - changeMetrics.startTime).toFixed(2)}ms`,
                timestamp: new Date(),
                metadata: {
                  type: 'system',
                  memory: (performance as any).memory?.usedJSHeapSize || 0,
                  processId: Math.floor(getCorrectId() * 10000),
                  threadId: Math.floor(getCorrectId() * 100)
                }
              }]);

              updatedPages = updatedPages.filter(p => p.path !== normalizedPath);

              if (normalizedPath === newCurrentPage) {
                const remainingPage = updatedPages[0];
                if (remainingPage) {
                  newCurrentPage = remainingPage.path;
                  newCurrentHtml = remainingPage.html;
                }
              }
            }
          }

          const changeEndTime = performance.now();
          
          // Apply all changes at once
          setPages(updatedPages);
          setCurrentPage(newCurrentPage);
          setCurrentHtml(newCurrentHtml);

          // Add change summary
          setTerminalMessages(prev => [...prev, {
            agentName: 'WebAppAgent',
            content: `Changes applied successfully
Change Summary:
- Total processing time: ${(changeEndTime - changeStartTime).toFixed(2)}ms
- Pages modified: ${response.changes.length}
- Current page: ${newCurrentPage}
- Memory impact: ${((performance as any).memory?.usedJSHeapSize - initialMemory) / 1024 / 1024}MB`,
            timestamp: new Date(),
            metadata: {
              type: 'system',
              memory: (performance as any).memory?.usedJSHeapSize || 0,
              processId: Math.floor(getCorrectId() * 10000),
              threadId: Math.floor(getCorrectId() * 100)
            }
          }]);
        }

        // Add final summary with comprehensive metrics
        const endTime = performance.now();
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
        
        setTerminalMessages(prev => [
          ...prev,
          {
            agentName: 'WebAppAgent',
            content: `Request completed successfully
Performance Summary:
- Total time: ${(endTime - startTime).toFixed(2)}ms
- Memory delta: ${((endMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB
- Changes processed: ${response.changes?.length || 0}
- Response size: ${response.response.length} chars
- Total pages: ${pages.length}

System Metrics:
- Peak memory: ${((performance as any).memory?.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Heap limit: ${((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB
- Active timers: ${setTimeout.toString().match(/\d+/)?.[0] || 0}
- Event loop lag: ${(performance.now() % 1).toFixed(3)}ms
- Browser: ${navigator.userAgent}
- Platform: ${navigator.platform}
- Language: ${navigator.language}
- Cores: ${navigator.hardwareConcurrency}
- Network: ${(navigator as any).connection?.effectiveType || 'Unknown'}`,
            timestamp: new Date(),
            metadata: {
              type: 'system',
              memory: endMemory,
              processId: Math.floor(getCorrectId() * 10000),
              threadId: Math.floor(getCorrectId() * 100),
              totalTime: endTime - startTime
            }
          }
        ]);

      } catch (error) {
        console.error('Chat error:', error);
        
        // Enhanced error reporting
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            agentName: 'WebAppAgent',
            timestamp: new Date(),
            metadata: {
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            }
          }
        ]);
        
        setTerminalMessages(prev => [...prev, {
          agentName: 'WebAppAgent',
          content: `Error processing request
Error Details:
- Type: ${error instanceof Error ? error.name : 'Unknown'}
- Message: ${error instanceof Error ? error.message : 'Unknown error'}
- Stack: ${error instanceof Error ? error.stack : 'No stack trace'}
- Memory: ${((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Timestamp: ${new Date().toISOString()}
- Browser: ${navigator.userAgent}
- Platform: ${navigator.platform}`,
          timestamp: new Date(),
          metadata: {
            type: 'error',
            memory: (performance as any).memory?.usedJSHeapSize || 0,
            processId: Math.floor(getCorrectId() * 10000),
            threadId: Math.floor(getCorrectId() * 100)
          }
        }]);

      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentPage, pages]
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-[40%] h-full flex flex-col p-2 gap-2">
          <div className="h-[60%]">
          <ChatBox
  messages={messages}
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
  connectionStatus="Agent Dave"
  isHighLoad={true}
/>
          </div>

          <div className="h-[calc(40%-2rem)]">
            <SiteStructure
              pages={pages}
              currentPage={currentPage}
              onPageSelect={handlePageSelect}
            />
          </div>
        </div>

        <div className="w-[60%] h-full flex flex-col p-2 gap-2">
          <div className="h-[60%]">
            <Browser
              html={currentHtml}
              pages={pages}
              isPreviewMode={false}
              agentType="webapp"
            />
          </div>

          <div className="h-[calc(40%-2rem)]">
            <Terminal
              messages={terminalMessages}
              isSimulating={false}
              isInitialCreation={false}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
