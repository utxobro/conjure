export interface Message {
  role: 'user' | 'assistant';
  content: string;
  agentName: string;
  timestamp: Date;
}

export interface Page {
  name: string;
  path: string;
  html: string;
  isActive: boolean;
  children?: Page[];
}

export interface GameFile extends Page {
  code: string;
  type: 'file' | 'directory';
  children?: GameFile[];
}

export interface GameProject {
  structure: GameFile[];
  currentFile: string;
} 