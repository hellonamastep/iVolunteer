'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePosts } from '@/contexts/post-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const POST_CATEGORIES = [
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
    'Other'
];

interface CreatePostProps {
    onSuccess?: () => void;
}

export function CreatePost({ onSuccess }: CreatePostProps = {}) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { createPost } = usePosts();
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: 'Error',
                    description: 'Image size should be less than 5MB',
                    variant: 'destructive'
                });
                fileInputRef.current!.value = '';
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Error',
                    description: 'Please upload an image file',
                    variant: 'destructive'
                });
                fileInputRef.current!.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

        const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast({
                title: "Missing Title",
                description: "Please provide a title for your post.",
                variant: "destructive",
                duration: 4000,
            });
            return;
        }
        
        if (!category) {
            toast({
                title: "Missing Category",
                description: "Please select a category for your post.",
                variant: "destructive",
                duration: 4000,
            });
            return;
        }
        
        if (!description.trim()) {
            toast({
                title: "Missing Description",
                description: "Please provide a description for your post.",
                variant: "destructive",
                duration: 4000,
            });
            return;
        }

        const selectedFile = fileInputRef.current?.files?.[0];
        
        // Validate file if provided
        if (selectedFile) {
            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (selectedFile.size > maxSize) {
                toast({
                    title: "File Too Large",
                    description: "Please choose an image smaller than 5MB.",
                    variant: "destructive",
                    duration: 4000,
                });
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(selectedFile.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please select a JPG, PNG, or GIF image.",
                    variant: "destructive",
                    duration: 4000,
                });
                return;
            }
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('category', category);
            formData.append('description', description.trim());
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            await createPost(formData);
            
            // Show success message
            toast({
                title: "Post Published! 🎉",
                description: "Your story has been shared with the community successfully.",
                duration: 5000,
            });
            
            // Reset form
            setTitle('');
            setCategory('');
            setDescription('');
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Call onSuccess callback to close the dialog
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error creating post:', error);
            
            // Handle specific error types
            let errorTitle = "Publication Failed";
            let errorDescription = "Something went wrong while publishing your post. Please try again.";
            
            if (error?.message?.includes('network') || error?.message?.includes('Network')) {
                errorTitle = "Network Error";
                errorDescription = "Please check your internet connection and try again.";
            } else if (error?.message?.includes('file') || error?.message?.includes('image') || error?.message?.includes('upload')) {
                errorTitle = "Image Upload Failed";
                errorDescription = "There was an issue uploading your image. Please try with a different photo.";
            } else if (error?.response?.data?.message) {
                errorDescription = error.response.data.message;
            } else if (error?.message) {
                errorDescription = error.message;
            }
            
            toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
                duration: 6000,
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImagePlus className="w-5 h-5" />
                        Share Your Story
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Title Field */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                            Title *
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your post a catchy title..."
                            required
                            disabled={isUploading}
                            maxLength={200}
                            className="h-10 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category Field */}
                    <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                            Category *
                        </Label>
                        <Select
                            value={category}
                            onValueChange={setCategory}
                            disabled={isUploading}
                        >
                            <SelectTrigger className="h-10 border border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {POST_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">
                                                {cat === 'Volunteer Experience' && '🤝'}
                                                {cat === 'Community Service' && '🏘️'}
                                                {cat === 'Environmental Action' && '🌱'}
                                                {cat === 'Healthcare Initiative' && '🏥'}
                                                {cat === 'Education Support' && '📚'}
                                                {cat === 'Animal Welfare' && '🐾'}
                                                {cat === 'Disaster Relief' && '🆘'}
                                                {cat === 'Fundraising' && '💰'}
                                                {cat === 'Social Impact' && '🌟'}
                                                {cat === 'Personal Story' && '📖'}
                                                {cat === 'Achievement' && '🏆'}
                                                {cat === 'Other' && '📝'}
                                            </span>
                                            {cat}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Description *
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Share your story, experience, or thoughts..."
                            required
                            disabled={isUploading}
                            className="min-h-[100px] resize-none border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">
                            Photo <span className="text-gray-400">(optional)</span>
                        </Label>
                        
                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                <div 
                                    className="p-4 text-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-12 h-12 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                        <ImagePlus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Add a photo to your post
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isUploading}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                        Choose Photo
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        Max 5MB • JPG, PNG, GIF
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-300">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    {!isUploading && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                                            onClick={() => {
                                                setImagePreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                        <Button 
                            type="submit" 
                            disabled={isUploading || !title.trim() || !category || !description.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    Publish Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}