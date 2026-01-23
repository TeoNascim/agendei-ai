
import React from 'react';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { PortfolioPost } from '../types.ts';

interface FeedProps {
  posts: PortfolioPost[];
  onProviderClick: (id: string) => void;
  onBookClick: (id: string) => void;
}

const Feed: React.FC<FeedProps> = ({ posts, onProviderClick, onBookClick }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {posts.map((post) => (
        <article key={post.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center space-x-3 cursor-pointer" onClick={() => onProviderClick(post.providerId)}>
            <img src={post.providerAvatar} className="w-10 h-10 rounded-full" />
            <h4 className="font-bold">{post.providerName}</h4>
          </div>
          <img src={post.imageUrl} className="w-full aspect-square object-cover" />
          <div className="p-4 space-y-3">
             <div className="flex space-x-4">
               <button><Heart /></button>
               <button><MessageCircle /></button>
             </div>
             <p className="text-sm"><b>{post.providerName}</b> {post.caption}</p>
             <button onClick={() => onBookClick(post.providerId)} className="w-full bg-slate-50 py-3 rounded-2xl font-black text-indigo-600">AGENDAR HORÁRIO</button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Feed;
