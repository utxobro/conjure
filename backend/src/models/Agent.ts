import { Agent } from '../types';

export class AgentModel implements Agent {
  constructor(
    public name: string,
    public personality: string,
    public background: string,
    public traits: string[]
  ) {}

  public toJSON(): string {
    return JSON.stringify({
      name: this.name,
      personality: this.personality,
      background: this.background,
      traits: this.traits
    }, null, 2);
  }

  public static fromJSON(json: string): AgentModel {
    const data = JSON.parse(json);
    return new AgentModel(
      data.name,
      data.personality,
      data.background,
      data.traits
    );
  }
}
