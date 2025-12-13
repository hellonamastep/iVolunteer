"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useGroups } from "@/contexts/groups-context";
import { Header } from "@/components/header";

interface Group {
  _id: string;
  name: string;
  description?: string;
  creator: {
    _id: string;
    name: string;
  };
  city?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

const PendingGroupsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { approveGroup, rejectGroup, getPendingGroups } = useGroups();
  const [pendingGroups, setPendingGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});
  const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Load pending groups
  const loadPendingGroups = async () => {
    try {
      setIsLoading(true);
      const data = await getPendingGroups();
      setPendingGroups(data);
    } catch (error) {
      console.error('Failed to load pending groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    } else {
      // Load pending groups immediately
      loadPendingGroups();
    }
  }, [user, router]);

  const onApprove = async (id: string) => {
    setLoadingAction(id);
    try {
      await approveGroup(id);
      // Reload pending groups after approval
      await loadPendingGroups();
    } finally {
      setLoadingAction(null);
      setShowApproveConfirm(null);
    }
  };

  const onReject = async (id: string) => {
    const reason = rejectionReasons[id];
    if (!reason?.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    
    setLoadingAction(id);
    try {
      await rejectGroup(id, reason);
      setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
      setShowRejectInput(null);
      // Reload pending groups after rejection
      await loadPendingGroups();
    } finally {
      setLoadingAction(null);
      setShowRejectConfirm(null);
    }
  };

  const startRejectProcess = (id: string) => {
    setShowRejectInput(id);
    setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
  };

  const cancelRejectProcess = (id: string) => {
    setShowRejectInput(null);
    setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Groups</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and manage group submissions awaiting approval. Ensure all groups meet community guidelines.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-50 rounded-full">
              <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-purple-700">
                {pendingGroups.length} group{pendingGroups.length !== 1 ? 's' : ''} pending review
              </span>
            </div>
          </div>

          {/* Groups Table */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="mx-auto flex items-center justify-center h-20 w-20 mb-4">
                  <svg className="animate-spin h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading pending groups...</h3>
                <p className="text-gray-500">Please wait while we fetch the data.</p>
              </div>
            </div>
          ) : pendingGroups.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-4">
                  <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500 text-lg">
                  No pending groups to review. New submissions will appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Group Details
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Creator
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingGroups.map((group) => (
                      <tr key={group._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-8 py-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                  {group.name}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Pending
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {group.description || "No description provided"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                              {group.creator?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium bg-purple-50 px-3 py-1 rounded-lg">
                              {group.city || "Not specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col space-y-3 min-w-[200px]">
                            {/* Approve Button */}
                            <button
                              onClick={() => setShowApproveConfirm(group._id)}
                              disabled={loadingAction === group._id}
                              className="group relative inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {loadingAction === group._id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve Group
                                </>
                              )}
                            </button>

                            {/* Reject Button & Input */}
                            {showRejectInput === group._id ? (
                              <div className="space-y-3 animate-in fade-in duration-200">
                                <div className="relative">
                                  <textarea
                                    placeholder="Optionally provide a reason for rejection..."
                                    className="block w-full px-4 py-3 text-sm border border-red-200 rounded-xl placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                                    rows={3}
                                    value={rejectionReasons[group._id] || ""}
                                    onChange={(e) =>
                                      setRejectionReasons((prev) => ({ ...prev, [group._id]: e.target.value }))
                                    }
                                    maxLength={500}
                                    autoFocus
                                  />
                                  <div className="text-xs text-gray-400 mt-1 text-right">
                                    {(rejectionReasons[group._id] || "").length}/500
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setShowRejectConfirm(group._id)}
                                    disabled={loadingAction === group._id || !rejectionReasons[group._id]?.trim() || rejectionReasons[group._id].length < 10}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Confirm Reject
                                  </button>
                                  <button
                                    onClick={() => cancelRejectProcess(group._id)}
                                    disabled={loadingAction === group._id}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => startRejectProcess(group._id)}
                                disabled={loadingAction === group._id}
                                className="group relative inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject Group
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Approve Confirmation Modal */}
        {showApproveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Approve Group?</h3>
              <p className="text-gray-600 text-center mb-6">
                This will make the group visible to all users. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveConfirm(null)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onApprove(showApproveConfirm)}
                  disabled={loadingAction === showApproveConfirm}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loadingAction === showApproveConfirm ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Reject Group?</h3>
              <p className="text-gray-600 text-center mb-6">
                The group creator will be notified with your rejection reason. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectConfirm(null)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onReject(showRejectConfirm)}
                  disabled={loadingAction === showRejectConfirm}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loadingAction === showRejectConfirm ? "Rejecting..." : "Yes, Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PendingGroupsPage;
