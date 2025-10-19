'use client';

import React from 'react';
import { Users, MessageSquare, Calendar, Globe, Lock, UserPlus, UserMinus, Crown, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/contexts/groups-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Group {
    _id: string;
    name: string;
    description: string;
    creator: {
        _id: string;
        name: string;
        email: string;
        city?: string;
    };
    category: string;
    imageUrl?: string;
    isPrivate: boolean;
    memberCount: number;
    userRole?: 'creator' | 'admin' | 'member' | null;
    isMember?: boolean;
    createdAt: string;
    tags: string[];
    city?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

interface GroupCardProps {
    group: Group;
    onJoin?: (group: Group) => void;
    onView?: (group: Group) => void;
    searchText?: string;
}

// Helper function to highlight matching text
const highlightText = (text: string, searchText: string) => {
    if (!searchText.trim()) return text;
    
    const regex = new RegExp(`(${searchText.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

export function GroupCard({ group, onJoin, onView, searchText = '' }: GroupCardProps) {
    const { joinGroup, leaveGroup, loading } = useGroups();
    const { user } = useAuth();

    // Debug logging
    React.useEffect(() => {
        console.log('GroupCard Debug:', {
            groupId: group._id,
            groupName: group.name,
            isMember: group.isMember,
            userRole: group.userRole,
            userId: user?.id || user?._id
        });
    }, [group, user]);

    const handleJoin = async () => {
        if (!user) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to join groups',
                variant: 'destructive'
            });
            return;
        }

        try {
            await joinGroup(group._id);
            toast({
                title: 'Successfully joined!',
                description: `Welcome to ${group.name}`,
            });
            if (onJoin) {
                onJoin(group);
            }
        } catch (error: any) {
            toast({
                title: 'Failed to join group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        }
    };

    const handleLeave = async () => {
        if (!user) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to leave groups',
                variant: 'destructive'
            });
            return;
        }

        // Don't allow creator to leave their own group
        if (group.userRole === 'creator') {
            toast({
                title: 'Cannot leave group',
                description: 'You are the creator of this group. Delete the group instead.',
                variant: 'destructive'
            });
            return;
        }

        try {
            await leaveGroup(group._id);
            toast({
                title: 'Left group',
                description: `You have left ${group.name}`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to leave group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        }
    };

    const handleView = () => {
        if (onView) {
            onView(group);
        }
    };

    const handleShare = async () => {
        const groupUrl = `${window.location.origin}/posts?groupId=${group._id}`;
        console.log('Sharing group URL:', groupUrl);
        
        try {
            if (navigator.share) {
                // Use native share API if available
                await navigator.share({
                    title: group.name,
                    text: group.description || 'Join this volunteer group',
                    url: groupUrl,
                });
                console.log('Group shared successfully via native share');
                
                toast({
                    title: 'Success',
                    description: 'Group shared successfully',
                });
            } else {
                // Fallback to copying link to clipboard
                if (!navigator.clipboard) {
                    throw new Error('Clipboard API not available');
                }
                
                await navigator.clipboard.writeText(groupUrl);
                console.log('Group URL copied to clipboard');
                
                toast({
                    title: 'Link copied!',
                    description: 'Group link copied to clipboard',
                });
            }
        } catch (error) {
            console.error('Share failed:', error);
            
            // Only show error if it's not a user cancellation
            if (error instanceof Error && error.name !== 'AbortError') {
                toast({
                    title: 'Failed to share',
                    description: error instanceof Error ? error.message : 'Please try again',
                    variant: 'destructive'
                });
            }
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Environmental Action': 'bg-green-100 text-green-800',
            'Community Service': 'bg-blue-100 text-blue-800',
            'Healthcare Initiative': 'bg-red-100 text-red-800',
            'Education Support': 'bg-purple-100 text-purple-800',
            'Animal Welfare': 'bg-orange-100 text-orange-800',
            'Disaster Relief': 'bg-yellow-100 text-yellow-800',
            'Fundraising': 'bg-pink-100 text-pink-800',
            'Social Impact': 'bg-indigo-100 text-indigo-800',
            'Skills Development': 'bg-emerald-100 text-emerald-800',
            'General Discussion': 'bg-gray-100 text-gray-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Image Header */}
            <div className="relative h-32 bg-gradient-to-br from-teal-400 to-cyan-500 overflow-hidden">
                {group.imageUrl ? (
                    <img 
                        src={group.imageUrl} 
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-white/80" />
                    </div>
                )}
                {/* Global Badge (higher priority than Privacy Badge) */}
                {group.city === 'global' ? (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-600 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                        <Globe className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">GLOBAL</span>
                    </div>
                ) : (
                    /* Privacy Badge */
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                        {group.isPrivate ? (
                            <>
                                <Lock className="w-3 h-3 text-orange-600" />
                                <span className="text-xs font-medium text-orange-600">Private</span>
                            </>
                        ) : (
                            <>
                                <Globe className="w-3 h-3 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-600">Public</span>
                            </>
                        )}
                    </div>
                )}
                {/* Creator Badge */}
                {group.userRole === 'creator' && (
                    <div className="absolute top-3 left-3 bg-yellow-500 rounded-full px-3 py-1 flex items-center gap-1.5">
                        <Crown className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">Creator</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title and Category */}
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {highlightText(group.name, searchText)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(group.category)}`}>
                        {highlightText(group.category, searchText)}
                    </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {highlightText(group.description, searchText)}
                </p>

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {group.tags.slice(0, 3).map((tag, index) => (
                            <span 
                                key={index}
                                className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs rounded-md font-medium border border-teal-200"
                            >
                                #{highlightText(tag, searchText)}
                            </span>
                        ))}
                        {group.tags.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                                +{group.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{group.memberCount}</span>
                            <span className="text-xs text-gray-400">members</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            {format(new Date(group.createdAt), 'MMM d, yyyy')}
                        </div>
                    </div>
                    {(group.city || group.creator?.city) && (
                        <div className="flex items-center gap-1.5">
                            {group.city === 'global' ? (
                                <>
                                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                                        Global • Visible to All
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm">📍</span>
                                    <span className="text-xs font-medium text-teal-600">{group.city || group.creator?.city}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {group.isMember ? (
                        <>
                            <Button
                                onClick={handleView}
                                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Open
                            </Button>
                            {/* Show Leave button only for non-creators */}
                            {group.userRole !== 'creator' && (
                                <Button
                                    onClick={handleLeave}
                                    disabled={loading}
                                    variant="outline"
                                    className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleView}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                View
                            </Button>
                            <Button
                                onClick={handleJoin}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Join
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface GroupListProps {
    groups: Group[];
    loading?: boolean;
    onJoin?: (group: Group) => void;
    onView?: (group: Group) => void;
    searchText?: string;
}

export function GroupList({ groups, loading, onJoin, onView, searchText = '' }: GroupListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">No groups found</h3>
                <p className="text-gray-500 text-lg">
                    Be the first to create a volunteer group!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
                <GroupCard
                    key={group._id}
                    group={group}
                    onJoin={onJoin}
                    onView={onView}
                    searchText={searchText}
                />
            ))}
        </div>
    );
}