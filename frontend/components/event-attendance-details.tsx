'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, XCircle, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Participant {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  location?: string;
}

interface EventAttendanceDetailsProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventAttendanceDetails: React.FC<EventAttendanceDetailsProps> = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [attendedParticipants, setAttendedParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchParticipantDetails();
    }
  }, [isOpen, eventId]);

  const fetchParticipantDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Fetch event details with populated participants and attendedParticipants
      const response = await api.get(`/v1/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.event) {
        const event = response.data.event;
        setAllParticipants(event.participants || []);
        setAttendedParticipants(event.attendedParticipants || []);
      }
    } catch (error: any) {
      console.error('Error fetching participant details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch participant details');
    } finally {
      setLoading(false);
    }
  };

  const isAttended = (participantId: string): boolean => {
    return attendedParticipants.some((p) => p._id === participantId);
  };

  if (!isOpen) return null;

  const attendedCount = attendedParticipants.length;
  const notAttendedCount = allParticipants.length - attendedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-white truncate">
              Participant Attendance
            </h2>
            <p className="text-sm text-white/90 truncate mt-1">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-[#7DD9A6] animate-spin mb-4" />
              <p className="text-gray-600">Loading participant details...</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Total Registered</p>
                      <p className="text-2xl font-bold text-gray-900">{allParticipants.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-lg p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Attended</p>
                      <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 rounded-lg p-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Did Not Attend</p>
                      <p className="text-2xl font-bold text-red-600">{notAttendedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants List */}
              <div className="p-6">
                {allParticipants.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No participants registered for this event</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allParticipants.map((participant) => {
                      const attended = isAttended(participant._id);
                      return (
                        <div
                          key={participant._id}
                          className={`rounded-xl p-4 border-2 transition-all ${
                            attended
                              ? 'bg-green-50 border-green-200 shadow-sm'
                              : 'bg-red-50 border-red-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <div
                                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    attended ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                >
                                  {attended ? (
                                    <CheckCircle className="h-6 w-6 text-white" />
                                  ) : (
                                    <XCircle className="h-6 w-6 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {participant.name}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      attended
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {attended ? '✓ Attended' : '✗ Did Not Attend'}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-13">
                                {participant.email && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{participant.email}</span>
                                  </div>
                                )}

                                {participant.contactNumber && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span>{participant.contactNumber}</span>
                                  </div>
                                )}

                                {participant.location && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-700 sm:col-span-2">
                                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{participant.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Note:</span> Only participants marked as attended will receive points for this event.
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAttendanceDetails;
