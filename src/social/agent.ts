import type { ISocialProvider, AgentProfile } from './provider';
import { ProfileManager } from './profile';

export class AgentManager {
  /**
   * Fetches the agent profile.
   */
  public static async getAgent(address: string, provider: ISocialProvider): Promise<AgentProfile | null> {
    const profile = await ProfileManager.getProfile(address, provider);
    if (profile && ProfileManager.isAgent(profile)) {
      return profile;
    }
    return null;
  }
}
