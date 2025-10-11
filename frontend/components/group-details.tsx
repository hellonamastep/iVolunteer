'use client';

import React, { useState, useEffect } from 'react';
import { useGroups } from '@/contexts/groups-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    MessageSquare, 
    Calendar, 
    Globe, 
    Lock, 
    UserPlus, 
    Crown,
    ArrowLeft,
    Settings,
    UserMinus,
    Trash2,
    Info,
    Edit2,
    Save,
    X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { GroupChat } from './group-chat';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface GroupDetailsProps {
    groupId: string;
    onBack?: () => void;
}

export function GroupDetails({ groupId, onBack }: GroupDetailsProps) {
    const { currentGroup, getGroup, joinGroup, leaveGroup, deleteGroup, updateGroup, promoteMemberToAdmin, demoteMemberFromAdmin, removeMemberFromGroup, loading } = useGroups();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'info'>('chat');
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        name: '',
        description: '',
        category: '',
        tags: '',
        isPrivate: false,
        maxMembers: 100,
        allowMemberInvites: true,
        requireApproval: false
    });

    useEffect(() => {
        if (groupId) {
            getGroup(groupId);
        }
    }, [groupId]);

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
            setActionLoading(true);
            await joinGroup(groupId);
            // Refetch group details to update the UI with new membership status
            await getGroup(groupId);
            toast({
                title: 'Successfully joined!',
                description: `Welcome to ${currentGroup?.name}`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to join group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!currentGroup) return;

        try {
            setActionLoading(true);
            await leaveGroup(groupId);
            toast({
                title: 'Left group',
                description: `You've left ${currentGroup.name}`,
            });
            if (onBack) onBack();
        } catch (error: any) {
            toast({
                title: 'Failed to leave group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentGroup) return;

        if (!confirm(`Are you sure you want to delete ${currentGroup.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            setActionLoading(true);
            await deleteGroup(groupId);
            toast({
                title: 'Group deleted',
                description: `${currentGroup.name} has been deleted`,
            });
            if (onBack) onBack();
        } catch (error: any) {
            toast({
                title: 'Failed to delete group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handlePromoteMember = async (memberId: string, memberName: string) => {
        try {
            setActionLoading(true);
            await promoteMemberToAdmin(groupId, memberId);
            // Refetch group details to update the UI
            await getGroup(groupId);
            toast({
                title: 'Member promoted',
                description: `${memberName} is now an admin`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to promote member',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDemoteMember = async (memberId: string, memberName: string) => {
        try {
            setActionLoading(true);
            await demoteMemberFromAdmin(groupId, memberId);
            // Refetch group details to update the UI
            await getGroup(groupId);
            toast({
                title: 'Admin demoted',
                description: `${memberName} is now a regular member`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to demote admin',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
            return;
        }

        try {
            setActionLoading(true);
            await removeMemberFromGroup(groupId, memberId);
            // Refetch group details to update the UI
            await getGroup(groupId);
            toast({
                title: 'Member removed',
                description: `${memberName} has been removed from the group`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to remove member',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditDescription = () => {
        if (currentGroup) {
            setEditedDescription(currentGroup.description);
            setIsEditingDescription(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingDescription(false);
        setEditedDescription('');
    };

    const handleSaveDescription = async () => {
        if (!editedDescription.trim()) {
            toast({
                title: 'Description required',
                description: 'Please enter a description',
                variant: 'destructive'
            });
            return;
        }

        try {
            setActionLoading(true);
            await updateGroup(groupId, { description: editedDescription.trim() });
            await getGroup(groupId);
            setIsEditingDescription(false);
            toast({
                title: 'Description updated',
                description: 'Group description has been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Failed to update description',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenSettings = () => {
        if (!currentGroup) return;
        
        setSettingsForm({
            name: currentGroup.name,
            description: currentGroup.description,
            category: currentGroup.category,
            tags: currentGroup.tags?.join(', ') || '',
            isPrivate: currentGroup.isPrivate || false,
            maxMembers: currentGroup.maxMembers || 100,
            allowMemberInvites: currentGroup.settings?.allowMemberInvites ?? true,
            requireApproval: currentGroup.settings?.requireApproval ?? false
        });
        setShowSettingsDialog(true);
    };

    const handleSaveSettings = async () => {
        if (!settingsForm.name.trim()) {
            toast({
                title: 'Group name is required',
                variant: 'destructive'
            });
            return;
        }

        if (!settingsForm.description.trim()) {
            toast({
                title: 'Description is required',
                variant: 'destructive'
            });
            return;
        }

        try {
            setActionLoading(true);
            
            const updateData: any = {
                name: settingsForm.name.trim(),
                description: settingsForm.description.trim(),
                category: settingsForm.category,
                tags: settingsForm.tags,
                isPrivate: settingsForm.isPrivate,
                maxMembers: settingsForm.maxMembers,
                settings: {
                    allowMemberInvites: settingsForm.allowMemberInvites,
                    requireApproval: settingsForm.requireApproval
                }
            };

            await updateGroup(groupId, updateData);
            await getGroup(groupId);
            setShowSettingsDialog(false);
            
            toast({
                title: 'Settings updated',
                description: 'Group settings have been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Failed to update settings',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(false);
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

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[700px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Users className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-gray-600">Loading group details...</p>
                </div>
            </div>
        );
    }

    if (!currentGroup) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[700px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Group not found</p>
                    {onBack && (
                        <Button onClick={onBack} variant="outline">
                            Go Back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const isCreator = currentGroup.userRole === 'creator' || currentGroup.creator?._id === user?._id || currentGroup.creator?._id === user?.id;
    const isMember = currentGroup.isMember;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[700px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-blue-500/10 p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="mt-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    
                    <div className="flex items-start gap-4 flex-1">
                        <div className="relative">
                            {currentGroup.imageUrl ? (
                                <img 
                                    src={currentGroup.imageUrl} 
                                    alt={currentGroup.name}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                                {currentGroup.isPrivate ? (
                                    <Lock className="w-4 h-4 text-orange-600" />
                                ) : (
                                    <Globe className="w-4 h-4 text-emerald-600" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {currentGroup.name}
                                        {isCreator && <Crown className="w-5 h-5 text-yellow-500 inline ml-2" />}
                                    </h1>
                                    <p className="text-gray-600 mb-3">by {currentGroup.creator?.name || 'Deleted User'}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{currentGroup.memberCount} members</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(currentGroup.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(currentGroup.category)}`}>
                                        {currentGroup.category}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    {!isMember ? (
                                        <Button
                                            onClick={handleJoin}
                                            disabled={actionLoading}
                                            className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Join Group
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {isCreator ? (
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleOpenSettings}
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleDelete}
                                                        disabled={actionLoading}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleLeave}
                                                    disabled={actionLoading}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <UserMinus className="w-4 h-4 mr-2" />
                                                    Leave
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8 px-6">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'chat'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'members'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Members ({currentGroup.memberCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'info'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Info className="w-4 h-4 inline mr-2" />
                        About
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
                {activeTab === 'chat' && (
                    <div className="h-[500px]">
                        <GroupChat groupId={groupId} />
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="p-6">
                        <div className="space-y-4">
                            {currentGroup.members?.map((member) => {
                                const isHost = member.user?._id === currentGroup.creator?._id;
                                const isAdmin = member.role === 'admin' && !isHost;
                                const currentAdminCount = currentGroup.members.filter(m => 
                                    m.role === 'admin' && m.user?._id !== currentGroup.creator?._id
                                ).length;
                                const canPromote = isCreator && !isHost && member.role !== 'admin' && currentAdminCount < 2;
                                const canDemote = isCreator && isAdmin;
                                const canRemove = isCreator && !isHost;

                                return (
                                    <div key={member.user?._id || `deleted-member-${member.joinedAt}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {member.user?.name?.charAt(0).toUpperCase() || 'D'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900">{member.user?.name || 'Deleted User'}</p>
                                                {isHost && (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                        <Crown className="w-3 h-3" />
                                                        Host
                                                    </span>
                                                )}
                                                {isAdmin && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        {/* Admin management buttons - only visible to host */}
                                        {isCreator && !isHost && member.user && (
                                            <div className="flex flex-wrap gap-2">
                                                {canPromote && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePromoteMember(member.user._id, member.user.name)}
                                                        disabled={actionLoading}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-1" />
                                                        Make Admin
                                                    </Button>
                                                )}
                                                {canDemote && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDemoteMember(member.user._id, member.user.name)}
                                                        disabled={actionLoading}
                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                    >
                                                        <UserMinus className="w-4 h-4 mr-1" />
                                                        Remove Admin
                                                    </Button>
                                                )}
                                                {canRemove && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveMember(member.user._id, member.user.name)}
                                                        disabled={actionLoading}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {isCreator && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Group Management:</strong> You can promote up to 2 members as admins and remove any member from the group.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                                {isCreator && !isEditingDescription && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleEditDescription}
                                        className="text-primary hover:text-primary/80"
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                            
                            {isEditingDescription ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        rows={4}
                                        placeholder="Enter group description..."
                                        maxLength={500}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            {editedDescription.length}/500 characters
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={actionLoading}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDescription}
                                                disabled={actionLoading || !editedDescription.trim()}
                                                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white"
                                            >
                                                <Save className="w-4 h-4 mr-1" />
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed">{currentGroup.description}</p>
                            )}
                        </div>

                        {currentGroup.tags && currentGroup.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {currentGroup.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Information</h3>
                            <div className="space-y-2 text-sm">
                                {currentGroup.city && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="flex items-center gap-1 font-medium text-gray-900">
                                            📍 {currentGroup.city}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Privacy:</span>
                                    <span className="flex items-center gap-1">
                                        {currentGroup.isPrivate ? (
                                            <>
                                                <Lock className="w-4 h-4 text-orange-600" />
                                                Private
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="w-4 h-4 text-emerald-600" />
                                                Public
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Max Members:</span>
                                    <span>{currentGroup.maxMembers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Member Invites:</span>
                                    <span>{currentGroup.settings?.allowMemberInvites ? 'Allowed' : 'Not Allowed'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Join Approval:</span>
                                    <span>{currentGroup.settings?.requireApproval ? 'Required' : 'Not Required'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Messaging:</span>
                                    <span className="flex items-center gap-1">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        Host & Admins Only
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Settings Dialog */}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Group Settings</DialogTitle>
                        <DialogDescription>
                            Update your group settings and preferences
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="groupName">Group Name *</Label>
                                <Input
                                    id="groupName"
                                    value={settingsForm.name}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                    placeholder="Enter group name"
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="groupDescription">Description *</Label>
                                <Textarea
                                    id="groupDescription"
                                    value={settingsForm.description}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                    placeholder="Enter group description"
                                    maxLength={500}
                                    rows={4}
                                />
                                <span className="text-xs text-gray-500">
                                    {settingsForm.description.length}/500 characters
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={settingsForm.category}
                                    onValueChange={(value) => setSettingsForm({ ...settingsForm, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Environmental Action">Environmental Action</SelectItem>
                                        <SelectItem value="Community Service">Community Service</SelectItem>
                                        <SelectItem value="Healthcare Initiative">Healthcare Initiative</SelectItem>
                                        <SelectItem value="Education Support">Education Support</SelectItem>
                                        <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                                        <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                                        <SelectItem value="Fundraising">Fundraising</SelectItem>
                                        <SelectItem value="Social Impact">Social Impact</SelectItem>
                                        <SelectItem value="Skills Development">Skills Development</SelectItem>
                                        <SelectItem value="General Discussion">General Discussion</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={settingsForm.tags}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, tags: e.target.value })}
                                    placeholder="e.g., environment, cleanup, community"
                                />
                            </div>
                        </div>

                        {/* Privacy & Limits */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Privacy & Limits</h3>
                            
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Private Group</Label>
                                    <p className="text-sm text-gray-500">
                                        Only invited members can join
                                    </p>
                                </div>
                                <Switch
                                    checked={settingsForm.isPrivate}
                                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, isPrivate: checked })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxMembers">Maximum Members</Label>
                                <Input
                                    id="maxMembers"
                                    type="number"
                                    min="2"
                                    max="500"
                                    value={settingsForm.maxMembers}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, maxMembers: parseInt(e.target.value) || 100 })}
                                />
                                <span className="text-xs text-gray-500">
                                    Between 2 and 500 members
                                </span>
                            </div>
                        </div>

                        {/* Group Permissions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Group Permissions</h3>
                            
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Allow Member Invites</Label>
                                    <p className="text-sm text-gray-500">
                                        Members can invite others to join
                                    </p>
                                </div>
                                <Switch
                                    checked={settingsForm.allowMemberInvites}
                                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allowMemberInvites: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Require Join Approval</Label>
                                    <p className="text-sm text-gray-500">
                                        Host must approve new members
                                    </p>
                                </div>
                                <Switch
                                    checked={settingsForm.requireApproval}
                                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, requireApproval: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setShowSettingsDialog(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={actionLoading}
                            className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white"
                        >
                            {actionLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}