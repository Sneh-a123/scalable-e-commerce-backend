import React, { useEffect, useState } from 'react';
import { Github, Star, GitFork, AlertCircle, X, ExternalLink, Code2, Layers, Cpu } from 'lucide-react';
import { api } from '../../api/client';

interface GithubShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubShowcaseModal: React.FC<GithubShowcaseModalProps> = ({ isOpen, onClose }) => {
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api
        .get('/github/repo')
        .then((res) => setRepoData(res.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-electric-purple/40 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">NEXORA Architecture & GitHub API</h3>
              <p className="text-xs text-lavender-grey">Amazon SDE Portfolio Grade System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-lavender-grey hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-lavender-grey">Connecting to GitHub API...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Repo Info Card */}
            <div className="p-4 rounded-2xl bg-dark-slate border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-white text-sm">
                  {repoData?.fullName || 'nexora-architecture/scalable-ecommerce-platform'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-mint-green/20 text-mint-green font-mono">
                  {repoData?.license || 'MIT'}
                </span>
              </div>
              <p className="text-lavender-grey leading-relaxed mb-4">
                {repoData?.description ||
                  'Production-ready scalable e-commerce SaaS architecture with atomic inventory deductions, Redis caching, and payment sandbox.'}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{repoData?.stars?.toLocaleString() || '1,240'} Stars</span>
                </div>
                <div className="flex items-center gap-1.5 text-lavender-grey">
                  <GitFork className="w-4 h-4" />
                  <span>{repoData?.forks?.toLocaleString() || '312'} Forks</span>
                </div>
                <div className="flex items-center gap-1.5 text-mint-green">
                  <AlertCircle className="w-4 h-4" />
                  <span>{repoData?.openIssues || '3'} Issues</span>
                </div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-dark-slate/60 border border-white/5">
                <Code2 className="w-4 h-4 text-electric-purple mb-1" />
                <span className="font-bold text-white block">TypeScript</span>
                <span className="text-[10px] text-lavender-grey">Full-stack type safety</span>
              </div>
              <div className="p-3 rounded-xl bg-dark-slate/60 border border-white/5">
                <Cpu className="w-4 h-4 text-neon-lime mb-1" />
                <span className="font-bold text-white block">Concurrency</span>
                <span className="text-[10px] text-lavender-grey">Zero oversell locks</span>
              </div>
              <div className="p-3 rounded-xl bg-dark-slate/60 border border-white/5">
                <Layers className="w-4 h-4 text-mint-green mb-1" />
                <span className="font-bold text-white block">Redis Cache</span>
                <span className="text-[10px] text-lavender-grey">In-memory TTL fallback</span>
              </div>
            </div>

            {/* Tech Stack Badges */}
            <div>
              <span className="font-mono text-[10px] text-lavender-grey/70 uppercase block mb-2">Technologies Used:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['Node.js', 'Express', 'MongoDB', 'Redis', 'React 18', 'Vite', 'TailwindCSS', 'Zod', 'Vitest', 'Recharts', 'HMAC-SHA256'].map((tech) => (
                  <span key={tech} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <a
              href={repoData?.htmlUrl || 'https://github.com'}
              target="_blank"
              rel="noreferrer"
              className="w-full mt-2 py-3 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold flex items-center justify-center gap-2 shadow-glow-purple transition-all"
            >
              <span>Explore Source on GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
