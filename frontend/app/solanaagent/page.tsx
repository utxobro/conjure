'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';
import Browser from '@/components/Browser';
import Terminal from '@/components/Terminal';
import AppLayout from '@/components/AppLayout';
import { apiService } from '@/services/api';
import { Message } from '@/types';

interface Program {
  name: string;
  path: string;
  code: string;
  isActive: boolean;
  metadata?: {
    created?: string;
    lastModified?: string;
    size?: number;
    checksum?: string;
  };
}

export default function SolanaAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [terminalMessages, setTerminalMessages] = useState<any[]>([]);
  const [programs, setPrograms] = useState<Program[]>([
    {
      name: "Program",
      path: "/lib.rs",
      code: `use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

// Declare the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Add your program logic here
    Ok(())
}`,
      isActive: true,
    },
  ]);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        agentName: 'User',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get recent messages for context
      const recentMessages = [...messages.slice(-4), userMessage];

      // Call API
      const response = await apiService.sendSolanaChatMessage(
        content,
        recentMessages,
        JSON.stringify({
          name: "lib.rs",
          code: programs.find(p => p.path === '/lib.rs')?.code || ''
        })
      );

      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          agentName: 'SolanaAgent',
          timestamp: new Date()
        }
      ]);

      // Handle code updates
      if (response.changes?.length) {
        setPrograms(prev => prev.map(prog => {
          if (prog.path === '/lib.rs') {
            return {
              ...prog,
              code: response.changes[0].code
            };
          }
          return prog;
        }));
        setCurrentCode(response.changes[0].code);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
          agentName: 'SolanaAgent',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, programs]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-[45%] h-full flex flex-col p-2 gap-2">
          <div className="h-[60%]">
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              connectionStatus="Agent Nikolai"
              isHighLoad={true}
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
        <div className="w-[55%] h-full p-2">
          <Browser
            html={currentCode}
            pages={programs}
            isPreviewMode={false}
            agentType="solana"
          />
        </div>
      </div>
    </AppLayout>
  );
} 