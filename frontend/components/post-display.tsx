'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { EditPost } from './edit-post';
import { usePosts } from '@/contexts/post-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
    Heart, 
    MessageCircle, 
    MoreHorizontal, 
    Edit3, 
    Trash2, 
    Send,
    Clock,
    User,
    ThumbsUp,
    Smile,
    Eye,
    AlertTriangle,
    Share2,
    Copy,
    Check,
    MapPin
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import type { Post, Comment, Reaction } from '@/contexts/post-context';

interface PostDisplayProps {
    post: Post;
}

const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
    { type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-600' },
    { type: 'care', emoji: '🤗', label: 'Care', color: 'text-yellow-600' },
    { type: 'haha', emoji: '😄', label: 'Haha', color: 'text-orange-600' },
    { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-purple-600' },
    { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-gray-600' },
    { type: 'angry', emoji: '😠', label: 'Angry', color: 'text-red-800' }
] as const;

const categoryConfig = {
    'Volunteer Experience': { icon: '🤝', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Community Service': { icon: '🏘️', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Environmental Action': { icon: '🌱', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Healthcare Initiative': { icon: '🏥', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Education Support': { icon: '📚', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Animal Welfare': { icon: '🐾', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Disaster Relief': { icon: '🆘', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'Fundraising': { icon: '💰', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Social Impact': { icon: '🌟', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Personal Story': { icon: '📖', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'Achievement': { icon: '🏆', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Other': { icon: '📝', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};

// Accept optional searchText prop for highlighting
interface PostDisplayWithSearchProps extends PostDisplayProps {
    searchText?: string;
    showCityTag?: boolean;
}

export function PostDisplay({ post, searchText, showCityTag = true }: PostDisplayWithSearchProps) {
    // Highlight helper
    function highlightText(text: string, highlight: string) {
        if (!highlight || highlight.trim() === '') return text;
        const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <mark key={i} className="bg-yellow-200 text-yellow-900 px-1 rounded">{part}</mark>
                : part
        );
    }
    const [comment, setComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [copied, setCopied] = useState(false);
    const { addComment, deleteComment, toggleReaction, deletePost } = usePosts();
    const { user } = useAuth();
    const { toast } = useToast();

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: 'Error',
                description: 'Please login to comment',
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsCommenting(true);
            await addComment(post._id, comment);
            setComment('');
            toast({
                title: 'Success',
                description: 'Comment added successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add comment',
                variant: 'destructive'
            });
        } finally {
            setIsCommenting(false);
        }
    };

    const handleReaction = async (type: Reaction['type']) => {
        if (!user) {
            toast({
                title: 'Error',
                description: 'Please login to react',
                variant: 'destructive'
            });
            return;
        }

        try {
            await toggleReaction(post._id, type);
            setShowReactions(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update reaction',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async () => {
        if (!user || user._id !== post.user._id) return;

        try {
            await deletePost(post._id);
            toast({
                title: 'Success',
                description: 'Post deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete post',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;

        try {
            await deleteComment(post._id, commentId);
            toast({
                title: 'Success',
                description: 'Comment deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete comment',
                variant: 'destructive'
            });
        }
    };

    const userReaction = user 
        ? post.reactions.find(reaction => reaction.user._id === user._id)?.type 
        : null;

    const categoryStyle = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig['Other'];

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/posts?postId=${post._id}`;
        
        try {
            if (navigator.share) {
                // Use native share API if available
                await navigator.share({
                    title: post.title,
                    text: post.description,
                    url: postUrl,
                });
                toast({
                    title: 'Success',
                    description: 'Post shared successfully',
                });
            } else {
                // Fallback to copying link to clipboard
                await navigator.clipboard.writeText(postUrl);
                setCopied(true);
                toast({
                    title: 'Link Copied!',
                    description: 'Post link copied to clipboard',
                });
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            // Only show error if it's not a user cancellation
            if (error instanceof Error && error.name !== 'AbortError') {
                toast({
                    title: 'Error',
                    description: 'Failed to share post',
                    variant: 'destructive'
                });
            }
        }
    };

    return (
        <article className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
                            <Image
                                src={post.user?.profilePicture || '/placeholder-user.jpg'}
                                alt={post.user?.name || 'Deleted User'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-gray-900 text-sm">{post.user?.name || 'Deleted User'}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                <time>
                                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                                    {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
                                        <span className="ml-1 text-amber-600 font-medium">(edited)</span>
                                    )}
                                </time>
                            </div>
                        </div>
                    </div>
                    
                    {user && post.user && user._id === post.user._id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-3.5 space-y-2">
                {/* Category Badge and Location */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                        variant="secondary" 
                        className={`${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} font-medium px-2 py-0.5 text-xs`}
                    >
                        <span className="mr-0.5 text-sm">{categoryStyle.icon}</span>
                        {post.category}
                    </Badge>
                    {showCityTag && post.city && (
                        <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200 font-medium px-2 py-0.5 text-xs"
                        >
                            <MapPin className="w-3 h-3 inline mr-0.5" />
                            {post.city === 'global' ? 'Global' : post.city}
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                    {highlightText(post.title, searchText || '')}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {highlightText(post.description, searchText || '')}
                </p>
            </div>

            {/* Image */}
            {post.imageUrl && (
                <div className="relative aspect-[16/9] mx-3.5 my-2.5 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Engagement Stats */}
            <div className="px-3.5 py-2 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                        {post.reactions.length > 0 && (
                            <div className="flex items-center gap-1">
                                <div className="flex -space-x-1">
                                    {reactionTypes.slice(0, 3).map(({ emoji }) => (
                                    <span key={emoji} className="flex w-5 h-5 bg-white rounded-full border shadow-sm text-xs items-center justify-center">
                                        {emoji}
                                    </span>
                                    ))}
                                </div>
                                <span className="ml-1 font-medium">
                                    {post.reactions.length}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-medium">
                            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                        </span>
                    </div>
                </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Action Buttons */}
            <div className="px-3.5 py-2">
                <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                        <Button
                            variant={userReaction ? "default" : "ghost"}
                            size="sm"
                            className={`flex items-center gap-1.5 w-full justify-center text-sm h-8 rounded-full font-medium transition-all duration-200 ${
                                userReaction 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm hover:shadow-md' 
                                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                            }`}
                            onClick={() => setShowReactions(!showReactions)}
                        >
                            {userReaction ? (
                                <>
                                    <span className="text-base animate-bounce-subtle">
                                        {reactionTypes.find(r => r.type === userReaction)?.emoji}
                                    </span>
                                    <span className="hidden sm:inline">{reactionTypes.find(r => r.type === userReaction)?.label}</span>
                                </>
                            ) : (
                                <>
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">React</span>
                                </>
                            )}
                        </Button>
                        
                        {showReactions && (
                            <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full shadow-xl border-2 border-white z-10 backdrop-blur-sm">
                                {reactionTypes.map(({ type, emoji, label, color }) => (
                                    <button
                                        key={type}
                                        onClick={() => handleReaction(type)}
                                        className="group relative p-2 hover:scale-125 hover:-translate-y-1 transition-all duration-200 rounded-full hover:bg-white/80"
                                        title={label}
                                    >
                                        <span className="text-xl drop-shadow-sm">{emoji}</span>
                                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                                            {label}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 flex-1 justify-center hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 text-sm h-8 rounded-full font-medium transition-all duration-200"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Comment</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1.5 flex-1 justify-center text-sm h-8 rounded-full font-medium transition-all duration-200 ${
                            copied 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600' 
                                : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600'
                        }`}
                        onClick={handleShare}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 animate-pulse" />
                                <span className="hidden sm:inline">Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Comments Section */}
            {(showComments || post.comments.length > 0) && (
                <>
                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <div className="px-3.5 py-3 space-y-2.5 bg-gradient-to-b from-gray-50/50 to-white">
                        {post.comments.length > 0 && (
                            <div className="space-y-2">
                                {post.comments.map((comment: Comment, index: number) => (
                                    <div key={comment._id} className="flex gap-2 group animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                                            <Image
                                                src={comment.user?.profilePicture || '/placeholder-user.jpg'}
                                                alt={comment.user?.name || 'Deleted User'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 hover:from-blue-50 hover:to-purple-50 rounded-2xl px-3 py-2 relative transition-all duration-200 border border-transparent hover:border-blue-100 shadow-sm hover:shadow">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="font-semibold text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                        {comment.user?.name || 'Deleted User'}
                                                    </span>
                                                    <time className="text-xs text-gray-500">
                                                        {format(new Date(comment.createdAt), 'MMM d • h:mm a')}
                                                    </time>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                                {user && comment.user && (user._id === comment.user._id || user._id === post.user?._id) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="absolute top-1.5 right-1.5 h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                            <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-blue-100 shadow-sm">
                                <Image
                                    src={
                                        // user?.profilePicture || 
                                        '/placeholder-user.jpg'}
                                    alt={user?.name || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 flex gap-1.5">
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={user ? "Write a comment..." : "Please login to comment"}
                                    required
                                    disabled={!user || isCommenting}
                                    className="min-h-[36px] text-sm resize-none border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl bg-white hover:border-blue-300 transition-colors placeholder:text-gray-400"
                                />
                                <Button 
                                    type="submit" 
                                    size="sm"
                                    disabled={isCommenting || !user || !comment.trim()}
                                    className="px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-9 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                >
                                    {isCommenting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5" />
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Edit Post Modal */}
            <EditPost 
                post={post} 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Post
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                            All comments and reactions will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Post
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </article>
    );
}