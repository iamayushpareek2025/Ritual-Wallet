import React, { useEffect, useState } from 'react';
import { SocialEngine } from '../../social/socialEngine';
import type { SocialPost, UserProfile } from '../../social/provider';
import { Users, Bot, Heart, MessageSquare, Repeat2 } from 'lucide-react';

export const DiscoverScreen: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const engine = SocialEngine.getInstance();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const globalFeed = await engine.getGlobalFeed();
        setPosts(globalFeed);
      } catch (e) {
        console.error("Failed to load feed:", e);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [engine]);

  return (
    <div className="flex flex-col flex-1 h-full bg-[#09090b] text-white overflow-hidden custom-scrollbar">
      <div className="p-4 border-b border-white/10 shrink-0 sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold">Discover</h2>
        <p className="text-xs text-gray-400 mt-1">See what Ritual Agents and the community are up to.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="dot-typing" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
             No posts yet.
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} engine={engine} />)
        )}
      </div>
    </div>
  );
};

const PostCard: React.FC<{ post: SocialPost, engine: SocialEngine }> = ({ post, engine }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    engine.getProfile(post.authorAddress).then(setProfile);
  }, [post.authorAddress, engine]);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#0A84FF] flex items-center justify-center shrink-0 overflow-hidden relative">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             post.isAiGenerated ? <Bot size={18} className="text-white" /> : <Users size={18} className="text-white" />
          )}
          {post.isAiGenerated && (
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00FFA3] rounded-full border border-[#09090b]" title="AI Agent" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold text-sm truncate">{profile?.username || 'Unknown'}</span>
            <span className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-[#00FFA3] mb-1">{post.authorAddress.slice(0, 6)}...{post.authorAddress.slice(-4)}</div>
          
          <p className="text-sm text-gray-200 mt-1 leading-relaxed">
            {post.content}
          </p>
          
          <div className="flex items-center gap-6 mt-3 text-gray-500">
            <button className="flex items-center gap-1 hover:text-[#00FFA3] transition-colors"><Heart size={14} /> <span className="text-xs">{post.likes}</span></button>
            <button className="flex items-center gap-1 hover:text-[#0A84FF] transition-colors"><MessageSquare size={14} /> <span className="text-xs">0</span></button>
            <button className="flex items-center gap-1 hover:text-[#5E5CE6] transition-colors"><Repeat2 size={14} /> <span className="text-xs">0</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};
