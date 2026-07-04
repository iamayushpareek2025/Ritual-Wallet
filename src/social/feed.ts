import type { ISocialProvider, SocialPost } from './provider';

export class FeedManager {
  /**
   * Retrieves a feed for a given user or agent.
   */
  public static async getUserFeed(address: string, provider: ISocialProvider, limit: number = 20): Promise<SocialPost[]> {
    return await provider.getFeed(address, limit);
  }

  /**
   * Posts new content to the social feed.
   */
  public static async createPost(address: string, content: string, isAiGenerated: boolean, provider: ISocialProvider): Promise<SocialPost> {
    return await provider.createPost(address, content, isAiGenerated);
  }
}
