'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { usePoints } from './points-context';
import { toast } from 'react-toastify';

interface ApiError {
    message: string;
}

export interface Post {
    _id: string;
    user: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    title: string;
    category: string;
    description: string;
    city: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    comments: Comment[];
    reactions: Reaction[];
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    user: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    content: string;
    createdAt: string;
}

export interface Reaction {
    _id: string;
    user: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    type: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
    createdAt: string;
}

interface PostContextType {
    posts: Post[];
    loading: boolean;
    error: string | null;
    getPosts: (page?: number, showAll?: boolean) => Promise<{ posts: Post[]; currentPage: number; totalPages: number; totalPosts: number }>;
    createPost: (formData: FormData) => Promise<Post>;
    updatePost: (postId: string, formData: FormData) => Promise<Post>;
    addComment: (postId: string, content: string) => Promise<Comment>;
    deleteComment: (postId: string, commentId: string) => Promise<void>;
    toggleReaction: (postId: string, type: Reaction['type']) => Promise<Reaction[]>;
    deletePost: (postId: string, reason?: string) => Promise<void>;
}

interface PostProviderProps {
    children: ReactNode;
}

const PostContext = createContext<PostContextType | null>(null);

const handleError = (err: unknown) => {
    const error = err as Error;
    if (error instanceof Error) {
        if ('response' in error && typeof error.response === 'object' && error.response) {
            const axiosError = error.response as { data?: { message?: string } };
            return axiosError.data?.message;
        }
        return error.message;
    }
    return 'An unknown error occurred';
};

export function PostProvider({ children }: PostProviderProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

     const { earnPoints } = usePoints(); 

    const getPosts = async (page = 1, showAll = false) => {
        try {
            
            setLoading(true);
            const showAllParam = showAll ? '&showAll=true' : '';
            const response = await api.get<{
                posts: Post[];
                currentPage: number;
                totalPages: number;
                totalPosts: number;
            }>(`/v1/posts?page=${page}${showAllParam}`);
            setPosts(response.data.posts);
            return response.data;
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error fetching posts');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (formData: FormData) => {
        try {
            setLoading(true);
            const response = await api.post<Post>('/v1/posts', formData);
            setPosts(prevPosts => [response.data, ...prevPosts]);

             await earnPoints("addPost", response.data._id);
             toast.success("5+ points");

            return response.data;
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error creating post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async (postId: string, formData: FormData) => {
        try {
            setLoading(true);
            const response = await api.put<Post>(`/v1/posts/${postId}`, formData);
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? response.data : post
                )
            );
            return response.data;
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error updating post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (postId: string, content: string) => {
        try {
            const response = await api.post<Comment>(`/v1/posts/${postId}/comments`, { content });
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: [...post.comments, response.data] }
                        : post
                )
            );
            return response.data;
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error adding comment');
            throw err;
        }
    };

    const deleteComment = async (postId: string, commentId: string) => {
        try {
            await api.delete(`/v1/posts/${postId}/comments/${commentId}`);
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: post.comments.filter(comment => comment._id !== commentId) }
                        : post
                )
            );
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error deleting comment');
            throw err;
        }
    };

    const toggleReaction = async (postId: string, type: Reaction['type']) => {
        try {
            const response = await api.post<Reaction[]>(`/v1/posts/${postId}/reactions`, { type });
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, reactions: response.data }
                        : post
                )
            );
            return response.data;
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error toggling reaction');
            throw err;
        }
    };

    const deletePost = async (postId: string, reason?: string) => {
        try {
            const config = reason ? { data: { reason } } : {};
            await api.delete(`/v1/posts/${postId}`, config);
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        } catch (err) {
            const message = handleError(err);
            setError(message || 'Error deleting post');
            throw err;
        }
    };

    return (
        <PostContext.Provider
            value={{
                posts,
                loading,
                error,
                getPosts,
                createPost,
                updatePost,
                addComment,
                deleteComment,
                toggleReaction,
                deletePost,
            }}
        >
            {children}
        </PostContext.Provider>
    );
}

export function usePosts() {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePosts must be used within a PostProvider');
    }
    return context;
}