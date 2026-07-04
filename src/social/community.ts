import type { ISocialProvider, CommunityInfo, SocialPost } from './provider';

export class CommunityManager {
  /**
   * Retrieves communities that a user is part of.
   */
  public static async getUserCommunities(address: string, provider: ISocialProvider): Promise<CommunityInfo[]> {
    return await provider.getCommunities(address);
  }

  /**
   * Retrieves the community-specific feed.
   */
  public static async getFeed(communityId: string, provider: ISocialProvider, limit: number = 20): Promise<SocialPost[]> {
    return await provider.getCommunityFeed(communityId, limit);
  }
}
