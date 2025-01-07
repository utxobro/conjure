import { Message, ChatAnalytics, Agent } from '../types';

export class ChatRoomModel {
  private messages: Message[] = [];
  private analytics: ChatAnalytics | null = null;

  constructor(
    public readonly agents: Agent[],
    public readonly topic: string
  ) {}

  public addMessage(message: Message): void {
    this.messages.push(message);
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public setAnalytics(analytics: ChatAnalytics): void {
    this.analytics = analytics;
  }

  public getAnalytics(): ChatAnalytics | null {
    return this.analytics;
  }

  public toJSON(): string {
    return JSON.stringify({
      agents: this.agents,
      topic: this.topic,
      messages: this.messages,
      analytics: this.analytics
    }, null, 2);
  }
}
