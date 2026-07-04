export interface UserProfile {
  address: string;
  username: string;
  bio: string;
  avatarUrl: string;
  followers: number;
  following: number;
  reputationScore: number;
}

export interface AgentProfile extends UserProfile {
  isAgent: boolean;
  traits: string[];
  creatorAddress: string;
}

export interface SocialPost {
  id: string;
  authorAddress: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: number;
  isAiGenerated: boolean;
  communityId?: string;
}

export interface SocialNotification {
  id: string;
  type: 'follow' | 'mention' | 'reply' | 'like';
  fromAddress: string;
  timestamp: number;
  read: boolean;
  referenceId?: string;
}

export interface CommunityInfo {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  isDao: boolean;
}

export interface ISocialProvider {
  getProfile(address: string): Promise<UserProfile | AgentProfile | null>;
  getFeed(address: string, limit?: number): Promise<SocialPost[]>;
  getCommunityFeed(communityId: string, limit?: number): Promise<SocialPost[]>;
  getNotifications(address: string): Promise<SocialNotification[]>;
  getCommunities(address: string): Promise<CommunityInfo[]>;
  getReputation(address: string): Promise<number>;
  
  createPost(address: string, content: string, isAiGenerated?: boolean): Promise<SocialPost>;
  follow(follower: string, target: string): Promise<boolean>;
}

export class MockSocialProvider implements ISocialProvider {
  private posts: SocialPost[] = [];

  async getProfile(address: string): Promise<UserProfile | AgentProfile> {
    return {
      address,
      username: 'User_' + address.slice(2, 6),
      bio: 'Decentralized identity on Ritual',
      avatarUrl: '',
      followers: Math.floor(Math.random() * 100),
      following: Math.floor(Math.random() * 50),
      reputationScore: await this.getReputation(address)
    };
  }

  async getFeed(address: string, limit: number = 10): Promise<SocialPost[]> {
    return this.posts.filter(p => p.authorAddress === address).slice(0, limit);
  }

  async getCommunityFeed(communityId: string, limit: number = 10): Promise<SocialPost[]> {
    return this.posts.filter(p => p.communityId === communityId).slice(0, limit);
  }

  async getNotifications(address: string): Promise<SocialNotification[]> {
    return [];
  }

  async getCommunities(address: string): Promise<CommunityInfo[]> {
    return [
      { id: 'c1', name: 'Ritual General', description: 'General discussion', membersCount: 1500, isDao: false }
    ];
  }

  async getReputation(address: string): Promise<number> {
    return 75; // Mock base score
  }

  async createPost(address: string, content: string, isAiGenerated: boolean = false): Promise<SocialPost> {
    const post: SocialPost = {
      id: 'post_' + Date.now(),
      authorAddress: address,
      content,
      timestamp: Date.now(),
      likes: 0,
      replies: 0,
      isAiGenerated
    };
    this.posts.unshift(post);
    return post;
  }

  async follow(follower: string, target: string): Promise<boolean> {
    return true;
  }
}
