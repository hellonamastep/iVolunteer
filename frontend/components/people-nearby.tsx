'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Train, User } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface NearbyUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    city?: string;
    profession?: string;
    nearestRailwayStation?: string;
    createdAt: string;
}

interface PeopleNearbyProps {
    autoLoad?: boolean;
}

export function PeopleNearby({ autoLoad = false }: PeopleNearbyProps) {
    const { user } = useAuth();
    const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserData, setCurrentUserData] = useState<any>(null);

    // Fetch fresh user data to ensure we have latest profile info
    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/v1/auth/user');
            const data = response.data as { data?: { user?: any } };
            const userData = data?.data?.user;
            if (userData) {
                setCurrentUserData(userData);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const loadNearbyUsers = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const response = await api.get('/v1/auth/nearby-users');
            const data = response.data as { data?: { users?: NearbyUser[] } };
            setNearbyUsers(data?.data?.users || []);
        } catch (error) {
            console.error('Error loading nearby users:', error);
            setNearbyUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCurrentUser();
        }
    }, [user]);

    useEffect(() => {
        if (autoLoad && currentUserData) {
            loadNearbyUsers();
        }
    }, [autoLoad, currentUserData]);

    if (!user) {
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
                <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">
                    Sign in to discover people
                </h3>
                <p className="text-slate-500 text-base sm:text-lg mb-4 sm:mb-6 px-4">
                    Find and connect with amazing volunteers near you!
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Sign In
                </button>
            </div>
        );
    }

    // Use fresh user data if available, fallback to context user
    const activeUser = currentUserData || user;
    const userRailwayStation = activeUser?.nearestRailwayStation;
    const userCity = activeUser?.city || activeUser?.address?.city;
    const isVolunteer = activeUser?.role === 'user';

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with railway station info for volunteers, city for others */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 sm:p-3 bg-teal-100 rounded-lg">
                        {isVolunteer ? (
                            <Train className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                        ) : (
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-teal-900">People Nearby</h3>
                        <p className="text-xs sm:text-sm text-teal-700">
                            {isVolunteer ? (
                                userRailwayStation 
                                    ? `Volunteers near ${userRailwayStation} station`
                                    : 'Set your nearest railway station in profile to find nearby volunteers'
                            ) : (
                                userCity
                                    ? `Users in ${userCity}`
                                    : 'Set your city in profile to find nearby users'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-12 sm:py-16">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto text-teal-500 mb-3 sm:mb-4" />
                    <p className="text-slate-600 text-sm sm:text-base">Finding {isVolunteer ? 'volunteers' : 'users'} near you...</p>
                </div>
            ) : (isVolunteer && !userRailwayStation) || (!isVolunteer && !userCity) ? (
                // No railway station/city set
                <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4">
                    <div className="mb-4 sm:mb-6">
                        <Image
                            src="/mascots/mascot_connect.png"
                            alt="Set location"
                            width={120}
                            height={120}
                            className="mx-auto opacity-70 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
                        />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">
                        {isVolunteer ? 'Set Your Railway Station' : 'Set Your City'}
                    </h3>
                    <p className="text-slate-500 text-base sm:text-lg mb-4 sm:mb-6 px-4">
                        {isVolunteer 
                            ? 'Add your nearest railway station in your profile to discover volunteers in your area!'
                            : 'Add your city in your profile to discover users in your area!'}
                    </p>
                    <button
                        onClick={() => window.location.href = '/profile'}
                        className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Go to Profile
                    </button>
                </div>
            ) : nearbyUsers.length === 0 ? (
                // No nearby users found
                <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4">
                    <div className="mb-4 sm:mb-6">
                        <Image
                            src="/mascots/mascot_sleep.png"
                            alt="No users found"
                            width={120}
                            height={120}
                            className="mx-auto opacity-70 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
                        />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3">
                        No {isVolunteer ? 'Volunteers' : 'Users'} Found
                    </h3>
                    <p className="text-slate-500 text-base sm:text-lg px-4">
                        {isVolunteer 
                            ? `No volunteers found near ${userRailwayStation} station yet. Check back later!`
                            : `No users found in ${userCity} yet. Check back later!`}
                    </p>
                </div>
            ) : (
                // Display nearby users
                <div className="space-y-3 sm:space-y-4">
                    {nearbyUsers.map((nearbyUser) => (
                        <div
                            key={nearbyUser._id}
                            onClick={() => window.location.href = `/profile/${nearbyUser._id}`}
                            className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100 hover:border-teal-300 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0">
                                    {nearbyUser.profilePicture ? (
                                        <img
                                            src={nearbyUser.profilePicture}
                                            alt={nearbyUser.name}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-teal-200 group-hover:border-teal-400 transition-all"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center border-2 border-teal-200 group-hover:border-teal-400 transition-all">
                                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate mb-1 sm:mb-2">
                                        {nearbyUser.name}
                                    </h4>
                                    
                                    {/* Location Info */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {nearbyUser.city && (
                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-teal-700 bg-teal-100/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                <span className="truncate font-medium">{nearbyUser.city}</span>
                                            </div>
                                        )}
                                        {nearbyUser.nearestRailwayStation && (
                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-cyan-700 bg-cyan-100/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                                <Train className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                <span className="truncate font-medium">
                                                    {nearbyUser.nearestRailwayStation}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
