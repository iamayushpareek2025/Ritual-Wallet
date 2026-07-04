import type { ISocialProvider, UserProfile, AgentProfile } from './provider';

export class ProfileManager {
  /**
   * Fetch a user or agent profile by address.
   */
  public static async getProfile(address: string, provider: ISocialProvider): Promise<UserProfile | AgentProfile | null> {
    return await provider.getProfile(address);
  }

  /**
   * Check if a profile is an AI Agent.
   */
  public static isAgent(profile: UserProfile | AgentProfile): profile is AgentProfile {
    return (profile as AgentProfile).isAgent !== undefined;
  }

  /**
   * Follow another user or agent.
   */
  public static async followUser(follower: string, target: string, provider: ISocialProvider): Promise<boolean> {
    return await provider.follow(follower, target);
  }
}
