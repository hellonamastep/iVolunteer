'use client';

import React, { useState } from 'react';
import { useGroups } from '@/contexts/groups-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2, X, Upload, Users, Target, Globe, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreateGroupProps {
    onClose?: () => void;
    onSuccess?: (group: any) => void;
}

const categoryOptions = [
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
    'Other'
];

export function CreateGroup({ onClose, onSuccess }: CreateGroupProps) {
    const { createGroup, loading } = useGroups();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: categoryOptions[0],
        isPrivate: false,
        maxMembers: 50,
        tags: '',
        allowMemberInvites: true,
        requireApproval: false
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please select an image smaller than 5MB',
                    variant: 'destructive'
                });
                return;
            }
            
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to create a group',
                variant: 'destructive'
            });
            return;
        }

        if (formData.name.trim().length < 3) {
            toast({
                title: 'Invalid group name',
                description: 'Group name must be at least 3 characters long',
                variant: 'destructive'
            });
            return;
        }

        if (formData.description.trim().length < 10) {
            toast({
                title: 'Invalid description',
                description: 'Group description must be at least 10 characters long',
                variant: 'destructive'
            });
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('category', formData.category);
            submitData.append('isPrivate', formData.isPrivate.toString());
            submitData.append('maxMembers', formData.maxMembers.toString());
            submitData.append('tags', formData.tags);
            submitData.append('allowMemberInvites', formData.allowMemberInvites.toString());
            submitData.append('requireApproval', formData.requireApproval.toString());
            
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const newGroup = await createGroup(submitData);
            
            toast({
                title: 'Group created successfully!',
                description: `${newGroup.name} is ready for volunteers to join`,
            });

            if (onSuccess) {
                onSuccess(newGroup);
            }
            if (onClose) {
                onClose();
            }
        } catch (error: any) {
            toast({
                title: 'Failed to create group',
                description: error.message || 'Please try again',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Volunteer Group</h2>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Group Image */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Group Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img 
                                    src={imagePreview} 
                                    alt="Group preview" 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="group-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="group-image"
                                className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium"
                            >
                                Choose image
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG</p>
                        </div>
                    </div>
                </div>

                {/* Group Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Group Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter a descriptive group name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                        minLength={3}
                        maxLength={100}
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the purpose and goals of your group"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        required
                        minLength={10}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/500 characters
                    </p>
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                        <Target className="w-4 h-4 inline mr-1" />
                        Category *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                    >
                        {categoryOptions.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tags (Optional)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="youth, environment, education (comma-separated)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Add relevant tags to help others find your group
                    </p>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Privacy */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Privacy Settings
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="isPrivate"
                                    checked={!formData.isPrivate}
                                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                                    className="text-primary focus:ring-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm">Public - Anyone can join</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                                    className="text-primary focus:ring-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm">Private - Invite only</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Max Members */}
                    <div>
                        <label htmlFor="maxMembers" className="block text-sm font-semibold text-gray-700 mb-2">
                            Max Members
                        </label>
                        <select
                            id="maxMembers"
                            name="maxMembers"
                            value={formData.maxMembers}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                            <option value={25}>25 members</option>
                            <option value={50}>50 members</option>
                            <option value={100}>100 members</option>
                            <option value={200}>200 members</option>
                            <option value={500}>500 members</option>
                        </select>
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Settings</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="allowMemberInvites"
                                checked={formData.allowMemberInvites}
                                onChange={handleInputChange}
                                className="rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">Allow members to invite others</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="requireApproval"
                                checked={formData.requireApproval}
                                onChange={handleInputChange}
                                className="rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">Require approval for new members</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                    {onClose && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white px-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Users className="w-4 h-4 mr-2" />
                                Create Group
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}