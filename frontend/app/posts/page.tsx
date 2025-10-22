'use client';

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreatePost } from '@/components/create-post';
import { PostDisplay } from '@/components/post-display';
import { usePosts } from '@/contexts/post-context';
import { useAuth } from '@/contexts/auth-context';
import { useGroups } from '@/contexts/groups-context';
import { Header } from '@/components/header';
import Footer from '@/components/Footer';
import { Loader2, RefreshCcw, MessageSquare, Users, Sparkles, Globe, Search, MapPin, TrendingUp, Clock, FileText, User, Trophy, BookOpen, X, CheckCircle } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { CreateGroup } from '@/components/create-group';
import { GroupList } from '@/components/group-display';
import { GroupDetails } from '@/components/group-details';
import { PeopleNearby } from '@/components/people-nearby';
import Blogheader from '@/components/Blogheader';
import Bloghero from '@/components/Bloghero';
import Blogstories from '@/components/Blogstories';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

// Category options (should match categoryConfig in post-display)
const categoryOptions = [
    'All',
    'Volunteer Experience',
    'Community Service',
    'Environmental Action',
    'Healthcare Initiative',
    'Education Support',
    'Animal Welfare',
    'Disaster Relief',
    'Fundraising',
    'Social Impact',
    'Personal Story',
    'Achievement',
    'Other',
];

// Group category options (matching create-group.tsx)
const groupCategoryOptions = [
    'All',
    'Environmental Action',
    'Community Service',
    'Healthcare Initiative',
    'Education Support',
    'Animal Welfare',
    'Disaster Relief',
    'Fundraising',
    'Social Impact',
    'Skills Development',
    'General Discussion',
    'Other',
];

const timeOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
];

// Reusable Sign-In Prompt Component
function SignInPrompt({ title, description }: { title: string; description: string }) {
    return (
        <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 px-4">
            <div className="mb-4 sm:mb-6">
                <Image
                    src="/mascots/mascot_connect.png"
                    alt="Sign in required"
                    width={120}
                    height={120}
                    className="mx-auto opacity-70 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
                />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">{title}</h3>
            <p className="text-slate-500 text-base sm:text-lg mb-4 sm:mb-6 px-4">{description}</p>
            <button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
                Sign In
            </button>
        </div>
    );
}

// Separate component that uses useSearchParams
function PostsPageContent() {
    const { posts, loading, error, getPosts } = usePosts();
    const { groups, getGroups, loading: groupsLoading } = useGroups();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTime, setSelectedTime] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'people' | 'leaderboard' | 'blogs'>('posts');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [showAllPosts, setShowAllPosts] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');
    const [postFilter, setPostFilter] = useState<'all' | 'regional'>('regional');
    const [selectedCity, setSelectedCity] = useState('All');
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
    
    // Group-specific filters
    const [selectedGroupCategory, setSelectedGroupCategory] = useState('All');
    const [groupSearchText, setGroupSearchText] = useState('');
    
    // Mobile filter visibility
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Refs for scrolling to specific posts
    const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const mobileFilterRef = useRef<HTMLDivElement>(null);
    
    // Dismissed banners state (stores group IDs that have been dismissed)
    const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dismissedGroupBanners');
            if (stored) {
                try {
                    return new Set(JSON.parse(stored));
                } catch {
                    return new Set();
                }
            }
        }
        return new Set();
    });

    // Get unique cities from posts with post counts
    const availableCities = useMemo(() => {
        const cityCountMap = new Map<string, number>();
        posts.forEach(post => {
            if (post.city && post.city !== 'global') {
                cityCountMap.set(post.city, (cityCountMap.get(post.city) || 0) + 1);
            }
        });
        return Array.from(cityCountMap.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => a.city.localeCompare(b.city));
    }, [posts]);

    // Filtering logic
    const filteredPosts = useMemo(() => {
        let filtered = posts;
        
        if (postFilter === 'regional' && user?.city) {
            filtered = filtered.filter(post => 
                post.city?.toLowerCase() === user.city?.toLowerCase()
            );
        }
        
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }
        
        if (selectedTime !== 'all') {
            const now = new Date();
            let compareDate = null;
            if (selectedTime === '24h') compareDate = subDays(now, 1);
            else if (selectedTime === '7d') compareDate = subDays(now, 7);
            else if (selectedTime === '30d') compareDate = subDays(now, 30);
            if (compareDate) {
                filtered = filtered.filter(post => isAfter(new Date(post.createdAt), compareDate));
            }
        }
        
        if (postFilter === 'all' && selectedCity !== 'All') {
            filtered = filtered.filter(post => 
                post.city?.toLowerCase() === selectedCity?.toLowerCase()
            );
        }
        
        if (searchText.trim() !== '') {
            const lower = searchText.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(lower) ||
                post.description.toLowerCase().includes(lower) ||
                post.city.toLowerCase().includes(lower)
            );
        }
        
        return filtered;
    }, [posts, selectedCategory, selectedTime, selectedCity, searchText, postFilter, user?.city]);

    const myGroups = useMemo(() => {
        return groups.filter(group => group.isMember);
    }, [groups]);

    const filteredGroups = useMemo(() => {
        let filtered = groups;
        
        filtered = filtered.filter(group => group.status === 'approved');
        
        if (user?.city && user?.role !== 'admin') {
            filtered = filtered.filter(group => {
                const groupCity = group.city || group.creator?.city;
                return groupCity?.toLowerCase() === user.city?.toLowerCase() || 
                       groupCity?.toLowerCase() === 'global';
            });
        }
        
        if (selectedGroupCategory !== 'All') {
            filtered = filtered.filter(group => group.category === selectedGroupCategory);
        }
        
        if (groupSearchText.trim() !== '') {
            const lower = groupSearchText.toLowerCase();
            filtered = filtered.filter(group =>
                group.name.toLowerCase().includes(lower) ||
                group.description.toLowerCase().includes(lower) ||
                group.category.toLowerCase().includes(lower) ||
                (group.tags && group.tags.some(tag => tag.toLowerCase().includes(lower)))
            );
        }
        
        return filtered;
    }, [groups, selectedGroupCategory, groupSearchText, user?.city, user?.role]);

    const loadPosts = async (page = 1) => {
        try {
            const response = await getPosts(page, showAllPosts);
            setHasMore(response.currentPage < response.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (activeTab === 'posts') {
            await loadPosts(1);
        } else {
            await getGroups();
        }
        setIsRefreshing(false);
    };

    const toggleShowAll = async () => {
        setShowAllPosts(!showAllPosts);
    };

    const handleDismissBanner = (groupId: string) => {
        const newDismissed = new Set(dismissedBanners).add(groupId);
        setDismissedBanners(newDismissed);
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('dismissedGroupBanners', JSON.stringify(Array.from(newDismissed)));
        }
    };

    useEffect(() => {
        // Only fetch data if user is logged in
        if (user) {
            if (activeTab === 'posts') {
                loadPosts();
            } else if (activeTab === 'groups') {
                getGroups();
            }
        }
    }, [activeTab, showAllPosts, user]);

    useEffect(() => {
        if (postFilter === 'regional') {
            setSelectedCity('All');
        }
    }, [postFilter]);

    useEffect(() => {
        const postId = searchParams.get('postId');
        const groupId = searchParams.get('groupId');
        
        if (postId) {
            if (activeTab !== 'posts') {
                setActiveTab('posts');
            }
            
            setHighlightedPostId(postId);
            
            const scrollToPost = () => {
                const postElement = postRefs.current.get(postId);
                if (postElement) {
                    setTimeout(() => {
                        postElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                    
                    setTimeout(() => {
                        setHighlightedPostId(null);
                    }, 3000);
                }
            };
            
            if (posts.length > 0) {
                scrollToPost();
            }
        } else if (groupId) {
            if (activeTab !== 'groups') {
                setActiveTab('groups');
            }
            setSelectedGroupId(groupId);
        }
    }, [searchParams, posts.length, activeTab]);

    // Handle click outside mobile filters
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileFilterRef.current && !mobileFilterRef.current.contains(event.target as Node)) {
                setShowMobileFilters(false);
            }
        };

        const handleScroll = () => {
            setShowMobileFilters(false);
        };

        if (showMobileFilters) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [showMobileFilters]);

    if (error) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
                <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-gradient-to-tr from-pink-300/30 via-yellow-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-[-80px] w-80 h-80 bg-gradient-to-br from-blue-300/20 via-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "7s" }}></div>

                <Header />
                <main className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 max-w-4xl mx-auto flex-1">
                    <div className="text-center py-12 sm:py-16 space-y-4 sm:space-y-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
                            <Image
                                src="/mascots/mascot_shy.png"
                                alt=""
                                width={96}
                                height={96}
                                className="animate-pulse"
                            />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-serif px-4">Oops! Something went wrong</h2>
                        <p className="text-slate-600 text-base sm:text-lg px-4">Failed to load community posts</p>
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            {isRefreshing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Try Again
                                </>
                            )}
                        </Button>
                    </div>
                </main>
                <div className="mt-auto">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex flex-col">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(148, 163, 184, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #2dd4bf, #06b6d4);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #14b8a6, #0891b2);
                }
                
                /* Show text on extra small screens */
                @media (min-width: 400px) {
                    .xs\:inline {
                        display: inline !important;
                    }
                }
            `}</style>

            <div className="navbar fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <Header />
            </div>

            <main className="main-content relative z-10 px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 w-full pt-[72px] flex-1">
                {/* All your existing content - I'm keeping the structure but truncating for brevity */}
                {/* The rest of your JSX remains exactly the same */}
                <section className="hero-section z-40 mt-6 sm:mt-10 mb-4 sm:mb-6">
                    <div className="w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                                    <Image
                                        src={activeTab === 'posts' ? "/mascots/mascot_volunteer.png" :
                                            activeTab === 'groups' ? "/mascots/mascot_group.png" :
                                                activeTab === 'people' ? "/mascots/mascot_connect.png" :
                                                    activeTab === 'leaderboard' ? "/mascots/mascot_star.png" :
                                                        "/mascots/mascot_reading.png"}
                                        alt="Community Logo"
                                        width={48}
                                        height={48}
                                        className="rounded-full transition-all duration-500"
                                    />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                                    {activeTab === 'posts' ? 'Community' :
                                        activeTab === 'groups' ? 'Groups' :
                                            activeTab === 'people' ? 'People Nearby' :
                                                activeTab === 'leaderboard' ? 'Leaderboard' :
                                                    'Blogs'}
                                </h1>
                            </div>
                            <div className="search-bar-wrapper w-full sm:flex-1 sm:max-w-xl lg:max-w-2xl order-last sm:order-none">
                                <div className="relative">
                                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={activeTab === 'groups' ? groupSearchText : searchText}
                                        onChange={e => activeTab === 'groups' ? setGroupSearchText(e.target.value) : setSearchText(e.target.value)}
                                        placeholder={activeTab === 'groups' ? "Search groups..." : "Search posts..."}
                                        className="search-input w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                    />
                                </div>
                            </div>
                            {user && activeTab === 'posts' && (
                                <button
                                    onClick={() => setShowCreatePostForm(true)}
                                    className="create-post-button w-full sm:w-auto bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <span className="text-lg sm:text-xl">+</span> Create Post
                                </button>
                            )}
                            {user && activeTab === 'groups' && (
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="create-group-button w-full sm:w-auto bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-lg sm:text-xl">+</span> Create Group
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Navigation Tabs - Sticky */}
                <section className="tabs-section sticky top-[72px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm my-4 sm:my-6 lg:my-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="w-full">
                        <div className="flex gap-2 sm:gap-4 lg:gap-8 px-0 sm:px-6 overflow-x-auto custom-scrollbar pb-0.5">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`py-3 sm:py-4 px-2 sm:px-2 font-semibold text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'posts'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-600 hover:text-teal-600'
                                    }`}
                            >
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline">Posts</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`py-3 sm:py-4 px-2 sm:px-2 font-semibold text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'groups'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-600 hover:text-teal-600'
                                    }`}
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline">Groups</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('people')}
                                className={`py-3 sm:py-4 px-2 sm:px-2 font-semibold text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'people'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-600 hover:text-teal-600'
                                    }`}
                            >
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline">People</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={`py-3 sm:py-4 px-2 sm:px-2 font-semibold text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'leaderboard'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-600 hover:text-teal-600'
                                    }`}
                            >
                                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline">Leaderboard</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('blogs')}
                                className={`py-3 sm:py-4 px-2 sm:px-2 font-semibold text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'blogs'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-600 hover:text-teal-600'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline">Blogs</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Desktop Filters Bar - Horizontal on top - Sticky - Only for Posts and Groups */}
                {(activeTab === 'posts' || activeTab === 'groups') && (
                <section className="desktop-filters hidden lg:block z-20 px-0 lg:px-4 xl:px-6 2xl:px-8 -mx-4 sm:-mx-6 md:-mx-8 lg:mx-0">
                    <div className="w-full">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-lg border border-teal-100 my-4 lg:my-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-lg border border-teal-100">
                                <div className="flex items-start gap-3 lg:gap-4">
                                    <div className="flex items-center gap-2 min-w-fit">
                                        <Image
                                            src={activeTab === 'posts' ? "/mascots/mascot_search.png" :
                                                activeTab === 'groups' ? "/mascots/mascot_clarity.png" :
                                                    "/mascots/mascot_guess.png"}
                                            alt=""
                                            width={32}
                                            height={32}
                                            className="animate-bounce w-6 h-6 lg:w-8 lg:h-8"
                                            style={{ animationDuration: "2s" }}
                                        />
                                        <h3 className="font-bold text-sm lg:text-base text-slate-800 flex items-center gap-2">
                                            <span className="text-teal-500 text-sm lg:text-base">⚙️</span> Filters
                                        </h3>
                                    </div>

                                    {/* All Filters in a Row */}
                                    <div className="flex-1 flex gap-2 lg:gap-3 items-center flex-wrap">
                                        {/* Post Filter Toggle */}
                                        {activeTab === 'posts' && (
                                            <>
                                                <div className="flex gap-1.5 lg:gap-2 bg-gray-100 rounded-lg p-1">
                                                    <button
                                                        onClick={() => {
                                                            setPostFilter('all');
                                                            setShowAllPosts(true);
                                                        }}
                                                        className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-all ${
                                                            postFilter === 'all'
                                                                ? 'bg-white text-teal-600 shadow-md'
                                                                : 'text-gray-600 hover:text-gray-800'
                                                        }`}
                                                    >
                                                        <Globe className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-1.5" />
                                                        All Posts
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPostFilter('regional');
                                                            setShowAllPosts(false);
                                                        }}
                                                        className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-all ${
                                                            postFilter === 'regional'
                                                                ? 'bg-white text-teal-600 shadow-md'
                                                                : 'text-gray-600 hover:text-gray-800'
                                                        }`}
                                                    >
                                                        <MapPin className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-1.5" />
                                                        Regional
                                                    </button>
                                                </div>

                                                {/* City Filter - Dynamic (only show for All Posts) */}
                                                {postFilter === 'all' && (
                                                    <div className="flex-1 min-w-[120px] lg:min-w-[150px]">
                                                        <select
                                                            value={selectedCity}
                                                            onChange={e => setSelectedCity(e.target.value)}
                                                            className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-200 bg-white text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-all"
                                                        >
                                                            <option value="All">📍 All Cities</option>
                                                            {availableCities.map(({ city, count }) => (
                                                                <option key={city} value={city}>
                                                                    📍 {city} ({count})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Category Filter */}
                                                <div className="flex-1 min-w-[140px] lg:min-w-[180px]">
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={e => setSelectedCategory(e.target.value)}
                                                        className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-200 bg-white text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-all"
                                                    >
                                                        {categoryOptions.map((category) => (
                                                            <option key={category} value={category}>
                                                                ✨ {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Time Period Filter */}
                                                <div className="flex-1 min-w-[120px] lg:min-w-[150px]">
                                                    <select
                                                        value={selectedTime}
                                                        onChange={e => setSelectedTime(e.target.value)}
                                                        className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-200 bg-white text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-all"
                                                    >
                                                        {timeOptions.map(option => (
                                                            <option key={option.value} value={option.value}>
                                                                ⏰ {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {/* Filters - For Groups */}
                                        {activeTab === 'groups' && (
                                            <>
                                                {/* Category Filter */}
                                                <div className="flex-1 min-w-[140px] lg:min-w-[180px]">
                                                    <select
                                                        value={selectedGroupCategory}
                                                        onChange={e => setSelectedGroupCategory(e.target.value)}
                                                        className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-200 bg-white text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-all"
                                                    >
                                                        {groupCategoryOptions.map((category) => (
                                                            <option key={category} value={category}>
                                                                ✨ {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {/* Sort By Buttons */}
                                        <div className="flex gap-1.5 lg:gap-2 min-w-fit ml-auto">
                                            <button
                                                onClick={() => setSortBy('recent')}
                                                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all ${sortBy === 'recent'
                                                        ? 'bg-gray-800 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Clock className="w-3 h-3 lg:w-4 lg:h-4 inline mr-0.5 lg:mr-1" />
                                                Recent
                                            </button>
                                            <button
                                                onClick={() => setSortBy('trending')}
                                                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all ${sortBy === 'trending'
                                                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 inline mr-0.5 lg:mr-1" />
                                                Trending
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                )}

                {/* Main Content Area */}
                <div className="content-area flex flex-col xl:flex-row gap-4 lg:gap-6">
                    {/* Center Content - Full Width */}
                    <div className="center-content flex-1 min-w-0">
                        {/* Mobile Filter Button - Only for Posts and Groups */}
                        {(activeTab === 'posts' || activeTab === 'groups') && (
                            <div className="lg:hidden mb-3 sm:mb-4 flex justify-end relative" ref={mobileFilterRef}>
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all shadow-md ${
                                        showMobileFilters
                                            ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200'
                                    }`}
                                    aria-label="Toggle filters"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                        />
                                    </svg>
                                </button>

                            {/* Mobile Filters Dropdown */}
                            {showMobileFilters && (
                                <div className="absolute top-full right-0 mt-2 z-30 bg-white rounded-xl shadow-2xl border border-teal-100 p-4 animate-in slide-in-from-top-2 duration-200 w-80 max-w-[calc(100vw-2rem)]">
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                                        <Image
                                            src={activeTab === 'posts' ? "/mascots/mascot_search.png" : "/mascots/mascot_clarity.png"}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className="flex-shrink-0"
                                        />
                                        <h3 className="font-semibold text-gray-700 text-sm">Filter Options</h3>
                                    </div>
                                    
                                    {activeTab === 'posts' ? (
                                        <div className="space-y-2.5">
                                            {/* Post Type Toggle */}
                                            <div className="flex flex-col gap-1.5 bg-gray-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => {
                                                        setPostFilter('all');
                                                        setShowAllPosts(true);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                                                        postFilter === 'all'
                                                            ? 'bg-white text-teal-600 shadow-md'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                >
                                                    <Globe className="w-3.5 h-3.5 inline mr-1" />
                                                    All Posts
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPostFilter('regional');
                                                        setShowAllPosts(false);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                                                        postFilter === 'regional'
                                                            ? 'bg-white text-teal-600 shadow-md'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                >
                                                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                                                    Regional Posts
                                                </button>
                                            </div>

                                            {/* City Filter (only show for All Posts) */}
                                            {postFilter === 'all' && (
                                                <select
                                                    value={selectedCity}
                                                    onChange={e => setSelectedCity(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                                                >
                                                    <option value="All">📍 All Cities</option>
                                                    {availableCities.map(({ city, count }) => (
                                                        <option key={city} value={city}>
                                                            📍 {city} ({count})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Category Filter */}
                                            <select
                                                value={selectedCategory}
                                                onChange={e => setSelectedCategory(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                                            >
                                                {categoryOptions.map((category) => (
                                                    <option key={category} value={category}>
                                                        ✨ {category}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Time Filter */}
                                            <select
                                                value={selectedTime}
                                                onChange={e => setSelectedTime(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                                            >
                                                {timeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        ⏰ {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : activeTab === 'groups' && (
                                        <div className="space-y-2.5">
                                            {/* Category Filter */}
                                            <select
                                                value={selectedGroupCategory}
                                                onChange={e => setSelectedGroupCategory(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                                            >
                                                {groupCategoryOptions.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                            </div>
                        )}

                        {/* Posts/Groups Display */}
                        <div className="posts-header mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 flex items-center justify-between">
                            <span>
                                {activeTab === 'posts' ? `${filteredPosts.length} posts found` :
                                    activeTab === 'groups' ? `${filteredGroups.length} groups found` :
                                        'Results'}
                            </span>
                            <div className="flex gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${sortBy === 'recent'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    Recent
                                </button>
                                <button
                                    onClick={() => setSortBy('trending')}
                                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${sortBy === 'trending'
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    Trending
                                </button>
                            </div>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === 'posts' ? (
                            <>
                                {!user ? (
                                    <SignInPrompt 
                                        title="Sign in to view community posts"
                                        description="Join our community to share and discover inspiring volunteer stories!"
                                    />
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                    {loading && currentPage === 1 ? (
                                        <div className="flex flex-col items-center justify-center h-full py-12 sm:py-16">
                                            <div className="mb-4 sm:mb-6">
                                                <Image
                                                    src="/mascots/video_mascots/mascot_walking_video.gif"
                                                    alt="Loading..."
                                                    width={200}
                                                    height={200}
                                                    unoptimized
                                                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
                                                />
                                            </div>
                                            <p className="text-slate-600 text-base sm:text-lg font-semibold">Loading community posts...</p>
                                            <p className="text-slate-400 text-xs sm:text-sm mt-2">Preparing something amazing! ✨</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 sm:space-y-6">
                                            {filteredPosts.map((post) => (
                                                <div 
                                                    key={post._id}
                                                    ref={(el) => {
                                                        if (el) {
                                                            postRefs.current.set(post._id, el);
                                                        } else {
                                                            postRefs.current.delete(post._id);
                                                        }
                                                    }}
                                                    className={`transition-all duration-300 ${
                                                        highlightedPostId === post._id 
                                                            ? 'ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 rounded-xl shadow-xl sm:shadow-2xl' 
                                                            : ''
                                                    }`}
                                                >
                                                    <PostDisplay post={post} searchText={searchText} showCityTag={true} />
                                                </div>
                                            ))}

                                            {filteredPosts.length === 0 && (
                                                <div className="text-center py-12 sm:py-16">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4">
                                                        <Image
                                                            src="/mascots/mascot_sleep.png"
                                                            alt=""
                                                            width={80}
                                                            height={80}
                                                            className="animate-pulse"
                                                        />
                                                    </div>
                                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">No posts found</h3>
                                                    <p className="text-slate-500 text-base sm:text-lg">
                                                        {user ? 'Try changing your filter criteria.' : 'Sign in to create the first post!'}
                                                    </p>
                                                </div>
                                            )}

                                            {filteredPosts.length > 0 && hasMore && (
                                                <div className="text-center pt-6 sm:pt-8 pb-3 sm:pb-4">
                                                    <button
                                                        onClick={() => loadPosts(currentPage + 1)}
                                                        disabled={loading}
                                                        className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                                                Loading...
                                                            </>
                                                        ) : (
                                                            'Load More Posts'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'groups' ? (
                            <>
                                {!user ? (
                                    <SignInPrompt 
                                        title="Sign in to view groups"
                                        description="Connect with like-minded volunteers and join groups in your community!"
                                    />
                                ) : (
                            <div className="space-y-6 sm:space-y-8">
                                {selectedGroupId ? (
                                    <GroupDetails
                                        groupId={selectedGroupId}
                                        onBack={() => setSelectedGroupId(null)}
                                    />
                                ) : (
                                    <>
                                        {/* Group Status Banners - NOT shown for admins */}
                                        {user && user.role !== 'admin' && (() => {
                                            const myCreatedGroups = groups.filter(g => g.creator._id === user.id || g.creator._id === user._id);
                                            const pendingGroups = myCreatedGroups.filter(g => g.status === 'pending'); // Pending not dismissible
                                            const rejectedGroups = myCreatedGroups.filter(g => g.status === 'rejected' && !dismissedBanners.has(g._id));
                                            const approvedGroups = myCreatedGroups.filter(g => g.status === 'approved' && !dismissedBanners.has(g._id));
                                            
                                            if (pendingGroups.length === 0 && rejectedGroups.length === 0 && approvedGroups.length === 0) return null;
                                            
                                            return (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {/* Approved Banner */}
                                                    {approvedGroups.length > 0 && (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 animate-in fade-in duration-500">
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-sm sm:text-base text-green-900 mb-1">
                                                                        {approvedGroups.length} Group{approvedGroups.length > 1 ? 's' : ''} Approved!
                                                                    </h4>
                                                                    <p className="text-xs sm:text-sm text-green-800 mb-2">
                                                                        Congratulations! Your group{approvedGroups.length > 1 ? 's have' : ' has'} been approved and {approvedGroups.length > 1 ? 'are' : 'is'} now visible to all users.
                                                                    </p>
                                                                    <div className="space-y-2 mt-2 sm:mt-3">
                                                                        {approvedGroups.map(group => (
                                                                            <div key={group._id} className="bg-white rounded-md p-2 text-xs sm:text-sm flex items-center justify-between gap-2">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <span className="font-medium text-gray-900 truncate block">{group.name}</span>
                                                                                    <span className="text-[10px] sm:text-xs text-gray-500">• {group.category}</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleDismissBanner(group._id)}
                                                                                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                                                                    aria-label="Dismiss"
                                                                                >
                                                                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                
                                                    {/* Pending Banner - NOT Dismissible */}
                                                    {pendingGroups.length > 0 && (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-sm sm:text-base text-yellow-900 mb-1">
                                                                        {pendingGroups.length} Group{pendingGroups.length > 1 ? 's' : ''} Awaiting Approval
                                                                    </h4>
                                                                    <p className="text-xs sm:text-sm text-yellow-800 mb-2">
                                                                        Your group{pendingGroups.length > 1 ? 's are' : ' is'} pending admin approval and will be visible once approved.
                                                                    </p>
                                                                    <div className="space-y-2 mt-2 sm:mt-3">
                                                                        {pendingGroups.map(group => (
                                                                            <div key={group._id} className="bg-white rounded-md p-2 text-xs sm:text-sm">
                                                                                <span className="font-medium text-gray-900 truncate block">{group.name}</span>
                                                                                <span className="text-[10px] sm:text-xs text-gray-500">• {group.category}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Rejected Banner */}
                                                    {rejectedGroups.length > 0 && (
                                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-sm sm:text-base text-red-900 mb-1">
                                                                        {rejectedGroups.length} Group{rejectedGroups.length > 1 ? 's' : ''} Rejected
                                                                    </h4>
                                                                    <p className="text-xs sm:text-sm text-red-800 mb-2">
                                                                        The following group{rejectedGroups.length > 1 ? 's were' : ' was'} not approved by the admin.
                                                                    </p>
                                                                    <div className="space-y-2 mt-2 sm:mt-3">
                                                                        {rejectedGroups.map(group => (
                                                                            <div key={group._id} className="bg-white rounded-md p-2 sm:p-3 text-xs sm:text-sm">
                                                                                <div className="flex items-start justify-between gap-2">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <span className="font-medium text-gray-900 block truncate">{group.name}</span>
                                                                                        <span className="text-[10px] sm:text-xs text-gray-500">{group.category}</span>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => handleDismissBanner(group._id)}
                                                                                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                                                                        aria-label="Dismiss"
                                                                                    >
                                                                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                                    </button>
                                                                                </div>
                                                                                {group.rejectionReason && (
                                                                                    <div className="mt-2 text-[10px] sm:text-xs text-red-700 bg-red-50 p-2 rounded break-words">
                                                                                        <strong>Reason:</strong> {group.rejectionReason}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        
                                        <GroupList
                                            groups={filteredGroups}
                                            loading={groupsLoading}
                                            onView={(group) => setSelectedGroupId(group._id)}
                                            onJoin={(group) => console.log('Joined group:', group)}
                                            searchText={groupSearchText}
                                        />
                                    </>
                                )}
                            </div>
                                )}
                            </>
                        ) : activeTab === 'people' ? (
                            <PeopleNearby autoLoad={true} />
                        ) : activeTab === 'leaderboard' ? (
                            <>
                                {!user ? (
                                    <SignInPrompt 
                                        title="Sign in to view leaderboard"
                                        description="See top volunteers and track your community impact!"
                                    />
                                ) : (
                                    <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4">
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">Coming Soon!</h3>
                                        <p className="text-slate-500 text-base sm:text-lg">This feature is under development.</p>
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'blogs' ? (
                            <div className="space-y-8">
                                {/* <Blogheader />
                                <Bloghero /> */}
                                <Blogstories />
                            </div>
                        ) : null}
                    </div>

                    {/* Right Sidebar - Sticky */}
                    <aside className="right-sidebar hidden xl:block w-80 space-y-4 sticky top-[180px] lg:top-[200px] xl:top-[220px] self-start max-h-[calc(100vh-230px)] overflow-y-auto custom-scrollbar">
                        {/* Conditional Content: My Groups for Groups tab, Trending for others */}
                        {activeTab === 'groups' ? (
                            <div className="my-groups-widget bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-teal-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-teal-600" />
                                    <h3 className="font-bold text-slate-800 text-base">My Groups</h3>
                                    {myGroups.length > 0 && (
                                        <span className="ml-auto bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-1 rounded-full">
                                            {myGroups.length}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {myGroups.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8 text-gray-500">
                                            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                                            <p className="text-xs sm:text-sm">You haven't joined any groups yet.</p>
                                        </div>
                                    ) : (
                                        myGroups.map((group) => (
                                            <div
                                                key={group._id}
                                                onClick={() => setSelectedGroupId(group._id)}
                                                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] border border-teal-100"
                                            >
                                                <div className="flex items-start gap-2">
                                                    {group.imageUrl ? (
                                                        <img 
                                                            src={group.imageUrl} 
                                                            alt={group.name}
                                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Users className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                            {group.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 line-clamp-1">
                                                            {group.description.split(' ').slice(0, 5).join(' ')}
                                                            {group.description.split(' ').length > 5 && '...'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {group.memberCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="trending-widget bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-teal-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="animate-pulse">
                                        <Image
                                            src="/mascots/mascot_kite.png"
                                            alt=""
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm">Trending Topics</h3>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { topic: '#EcoChallenge', icon: '/mascots/mascot_watering.png', gradient: 'from-green-300 to-emerald-400' },
                                        { topic: '#CommunityCleanup', icon: '/mascots/mascot_sweaping.png', gradient: 'from-blue-300 to-cyan-400' },
                                        { topic: '#ZeroWaste', icon: '/mascots/mascot_trashpick.png', gradient: 'from-purple-300 to-pink-400' }
                                    ].map((item, index) => (
                                        <div
                                            key={item.topic}
                                            className={`bg-gradient-to-r ${item.gradient} rounded-lg px-3 py-2 font-semibold text-xs text-slate-800 hover:shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-105 animate-pulse`}
                                            style={{ animationDuration: `${2 + index * 0.5}s` }}
                                        >
                                            <Image src={item.icon} alt="" width={20} height={20} className="animate-bounce" style={{ animationDuration: `${2.5 + index * 0.3}s` }} />
                                            {item.topic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Near You */}
                        <div className="activity-widget bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-teal-100">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-teal-500" />
                                <h3 className="font-bold text-slate-800 text-sm">Activity Near You</h3>
                            </div>
                            <div className="bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 rounded-lg h-32 flex flex-col items-center justify-center text-gray-500 relative overflow-hidden">
                                <div className="absolute top-1 left-1 opacity-20">
                                    <Image
                                        src="/mascots/mascot_volunteer.png"
                                        alt=""
                                        width={24}
                                        height={24}
                                        className="animate-bounce"
                                        style={{ animationDuration: "3s" }}
                                    />
                                </div>
                                <div className="absolute top-1 right-1 opacity-20">
                                    <Image
                                        src="/mascots/mascot_help.png"
                                        alt=""
                                        width={24}
                                        height={24}
                                        className="animate-pulse"
                                        style={{ animationDuration: "4s" }}
                                    />
                                </div>
                                <div className="text-center z-10">
                                    <Image
                                        src="/mascots/mascot_walk.png"
                                        alt=""
                                        width={50}
                                        height={50}
                                        className="mx-auto mb-1 animate-bounce"
                                        style={{ animationDuration: "2.5s" }}
                                    />
                                    <p className="text-xs font-semibold">Map View Coming Soon!</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Discover volunteers near you</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Create Post Dialog */}
            <Dialog open={showCreatePostForm} onOpenChange={setShowCreatePostForm}>
                <DialogContent className="create-post-dialog max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Image
                                    src="/mascots/mascot_volunteer.png"
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
                                />
                            </div>
                            <span className="truncate">Create New Post</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 text-sm sm:text-base">
                            Share your volunteer experience, story, or achievement with the community! ✨
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-3 sm:mt-4">
                        <CreatePost onSuccess={() => setShowCreatePostForm(false)} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Group Dialog */}
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogContent className="create-group-dialog max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="truncate">Create New Group</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 text-sm sm:text-base">
                            Bring volunteers together around a shared cause or interest! 🤝
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-3 sm:mt-4">
                        <CreateGroup
                            onClose={() => setShowCreateGroup(false)}
                            onSuccess={() => {
                                setShowCreateGroup(false);
                                getGroups(); // Refresh the groups list
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}

// Main page component wrapped in Suspense
export default function PostsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex flex-col items-center justify-center">
                <Image
                    src="/mascots/video_mascots/mascot_joyDance_video.gif"
                    alt="Loading..."
                    width={200}
                    height={200}
                    unoptimized
                />
                <p className="text-slate-600 text-lg font-semibold mt-6">Loading page...</p>
            </div>
        }>
            <PostsPageContent />
        </Suspense>
    );
}