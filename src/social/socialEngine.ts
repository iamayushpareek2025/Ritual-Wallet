import { MockSocialProvider } from './provider';
import type { ISocialProvider } from './provider';
import { ProfileManager } from './profile';
import { AgentManager } from './agent';
import { FeedManager } from './feed';
import { CommunityManager } from './community';
import { ReputationManager } from './reputation';
import { NotificationManager } from './notification';

export class SocialEngine {
  private static instance: SocialEngine;
  private provider: ISocialProvider;

  private constructor() {
    this.provider = new MockSocialProvider();
  }

  public static getInstance(): SocialEngine {
    if (!SocialEngine.instance) {
      SocialEngine.instance = new SocialEngine();
    }
    return SocialEngine.instance;
  }

  public setProvider(provider: ISocialProvider) {
    this.provider = provider;
  }

  // Exposed facade methods for easy consumption
  
  public async getMyProfile(address: string) {
    return await ProfileManager.getProfile(address, this.provider);
  }

  public async getAgent(address: string) {
    return await AgentManager.getAgent(address, this.provider);
  }

  public async getProfile(address: string) {
    return this.provider.getProfile(address);
  }

  public async getGlobalFeed(limit?: number) {
    // For now, global feed is just pulling from a designated global address or all posts
    // Since MockProvider uses a single feed, we can just call getFeed with a dummy address
    return this.provider.getFeed('global', limit);
  }

  public async getMyFeed(address: string, limit?: number) {
    return await FeedManager.getUserFeed(address, this.provider, limit);
  }

  public async postContent(address: string, content: string, isAiGenerated: boolean = false) {
    return await FeedManager.createPost(address, content, isAiGenerated, this.provider);
  }

  public async getMyCommunities(address: string) {
    return await CommunityManager.getUserCommunities(address, this.provider);
  }

  public async getMyReputation(address: string) {
    return await ReputationManager.getScore(address, this.provider);
  }

  public async getMyNotifications(address: string) {
    return await NotificationManager.getNotifications(address, this.provider);
  }
}
