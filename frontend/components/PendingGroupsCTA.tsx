import { useGroups } from "@/contexts/groups-context";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CTAButtonProps {
  className?: string;
}

const PendingGroupsCTA = ({ className = "" }: CTAButtonProps) => {
  const { getPendingGroups } = useGroups();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const hasPending = pendingCount > 0;

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        setLoading(true);
        const pendingGroups = await getPendingGroups();
        setPendingCount(pendingGroups.length);
      } catch (error) {
        console.error('Failed to fetch pending groups:', error);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();
  }, [getPendingGroups]);

  return (
    <Link href="/pendinggrouprequest" passHref>
      <div className={`
        group relative bg-white border rounded-2xl p-6 m-5 mt-5
        hover:shadow-xl transition-all duration-300
        cursor-pointer overflow-hidden
        ${hasPending 
          ? 'border-purple-200 hover:border-purple-300' 
          : 'border-gray-100 hover:border-gray-200'
        }
        ${className}
      `}>
        {/* Conditional background gradient */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          ${hasPending 
            ? 'bg-gradient-to-br from-purple-50/50 to-indigo-100/30' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100/30'
          }`} />
        
        {/* Main content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300
                ${hasPending 
                  ? 'bg-purple-100 group-hover:bg-purple-200' 
                  : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                <svg className={`w-6 h-6 transition-colors duration-300
                  ${hasPending ? 'text-purple-600' : 'text-gray-400'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-lg font-bold transition-colors
                  ${hasPending ? 'text-gray-900 group-hover:text-purple-900' : 'text-gray-500'}`}>
                  Pending Groups
                </h2>
                <p className="text-sm text-gray-500">
                  {hasPending ? 'Requires your review' : 'All caught up'}
                </p>
              </div>
            </div>
            
            {/* Count badge - only show when there are pending groups */}
            {hasPending && (
              <span className="bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {loading
              ? 'Loading pending groups...'
              : hasPending 
                ? `There ${pendingCount === 1 ? 'is' : 'are'} currently ${pendingCount} group${pendingCount !== 1 ? 's' : ''} awaiting your approval. Review and manage group submissions to ensure they meet community guidelines.`
                : 'All groups have been reviewed and approved. Check back later for new group submissions.'
            }
          </p>

          {/* Action section */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium transition-colors
              ${hasPending ? 'text-purple-600 group-hover:text-purple-700' : 'text-gray-500'}`}>
              {hasPending ? 'Review groups' : 'View groups'}
            </span>
            <svg className={`w-5 h-5 transition-colors duration-300 transform group-hover:translate-x-1
              ${hasPending ? 'text-gray-400 group-hover:text-purple-500' : 'text-gray-300'}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PendingGroupsCTA;
