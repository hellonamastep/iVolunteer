'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface PostDeletionNotification {
    _id: string;
    title: string;
    message: string;
    metadata: {
        postTitle: string;
        reason: string;
        deletedBy: string;
    };
    createdAt: string;
}

export function PostDeletionAlert() {
    const { user } = useAuth();
    const [deletionNotification, setDeletionNotification] = useState<PostDeletionNotification | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const checkForDeletionNotifications = async () => {
            if (!user) return;

            try {
                // Fetch unread notifications
                const response = await api.get('/v1/notifications', {
                    params: {
                        unreadOnly: true,
                        limit: 50
                    }
                });

                // Get shown notification IDs from localStorage
                const shownNotificationsStr = localStorage.getItem('shown_deletion_notifications');
                const shownNotifications: string[] = shownNotificationsStr ? JSON.parse(shownNotificationsStr) : [];

                // Find the most recent post deletion notification that hasn't been shown as popup
                const postDeletionNotif = response.data.data.find(
                    (notif: any) => 
                        notif.type === 'post_deleted_by_admin' && 
                        !notif.read && 
                        !shownNotifications.includes(notif._id)
                );

                if (postDeletionNotif) {
                    setDeletionNotification(postDeletionNotif);
                    setShowAlert(true);
                    
                    // Add to shown notifications list
                    const updatedShown = [...shownNotifications, postDeletionNotif._id];
                    localStorage.setItem('shown_deletion_notifications', JSON.stringify(updatedShown));
                }
            } catch (error) {
                console.error('Error checking deletion notifications:', error);
            }
        };

        // Check when user logs in or component mounts
        if (user) {
            checkForDeletionNotifications();
        }
    }, [user]);

    const handleClose = async () => {
        if (deletionNotification) {
            try {
                // Mark notification as read using the correct endpoint
                await api.put('/v1/notifications/mark-read', {
                    notificationIds: [deletionNotification._id]
                });
            } catch (error) {
                // Silently fail - notification will still be in their list
                console.log('Could not mark notification as read');
            }
        }
        setShowAlert(false);
        setDeletionNotification(null);
    };

    if (!deletionNotification) return null;

    return (
        <AlertDialog open={showAlert} onOpenChange={(open) => !open && handleClose()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Post Deleted by Admin
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 pt-2">
                            <div>
                                <span className="text-sm text-gray-600 block mb-1">Your post was removed:</span>
                                <span className="font-semibold text-gray-900 block">"{deletionNotification.metadata?.postTitle || 'Unknown Post'}"</span>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <span className="text-xs font-medium text-amber-800 block mb-1">Reason for deletion:</span>
                                <span className="text-sm text-amber-900 block">{deletionNotification.metadata?.reason || 'No reason provided'}</span>
                            </div>

                            <span className="text-xs text-gray-500 block">
                                Deleted by: {deletionNotification.metadata?.deletedBy || 'Admin'}
                            </span>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={handleClose}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        I Understand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
