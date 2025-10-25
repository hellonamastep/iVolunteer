'use client'

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Upload,
  X as CloseIcon,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";

interface Participant {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  location?: string;
  userType?: string;
  points?: number;
}

interface EventAttendanceVerificationProps {
  eventId: string;
  eventTitle: string;
  pointsOffered: number;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const EventAttendanceVerification: React.FC<EventAttendanceVerificationProps> = ({
  eventId,
  eventTitle,
  pointsOffered,
  onClose,
  onSubmitSuccess,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendedParticipants, setAttendedParticipants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completionProof, setCompletionProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // Fetch participants data
  const fetchParticipants = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/v1/event/${eventId}/participants`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      if (response.data.success) {
        const participantsList = response.data.participants || [];
        setParticipants(participantsList);
        
        // Initially select all participants
        const allIds = new Set(participantsList.map((p: Participant) => p._id));
        setAttendedParticipants(allIds);
      }
    } catch (err: any) {
      console.error("Error fetching participants:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch participants data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  // Handle checkbox toggle
  const toggleAttendance = (participantId: string) => {
    setAttendedParticipants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  // Select/Deselect all
  const selectAll = () => {
    const allIds = new Set(participants.map((p) => p._id));
    setAttendedParticipants(allIds);
  };

  const deselectAll = () => {
    setAttendedParticipants(new Set());
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setCompletionProof(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setCompletionProof(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Submit attendance verification
  const handleSubmit = async () => {
    if (!completionProof) {
      toast.error("Please upload a completion proof image");
      return;
    }

    if (attendedParticipants.size === 0) {
      toast.error("Please select at least one participant who attended");
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("completionProof", completionProof);
      formData.append("attendedParticipants", JSON.stringify(Array.from(attendedParticipants)));

      const response = await api.post(
        `/v1/event/end/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Event completion request submitted successfully!");
        onSubmitSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("Error submitting attendance:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit attendance verification";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const attendedCount = attendedParticipants.size;
  const totalParticipants = participants.length;
  const attendanceRate = totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Verify Event Attendance
                </h2>
              </div>
              <p className="text-white/90 text-sm ml-11">
                {eventTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-1 ml-4"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7DD9A6]"></div>
              <span className="ml-4 text-gray-600 text-lg font-medium">Loading participants...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-bold text-base">Error</h4>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-[#E8F5A5] to-[#D4E7B8] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-[#7DD9A6]" />
              </div>
              <h3 className="text-gray-800 text-xl font-bold mb-2">
                No Participants
              </h3>
              <p className="text-gray-600 text-base">
                This event has no registered participants
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-blue-900 font-bold text-base mb-2">Important Instructions</h4>
                    <ul className="text-blue-800 text-sm space-y-1.5 list-disc list-inside">
                      <li>Check the boxes for participants who actually attended the event</li>
                      <li>Upload a completion proof image (group photo, event certificate, etc.)</li>
                      <li>Only verified participants will receive the {pointsOffered} points reward</li>
                      <li>This action will be reviewed by admin before points are awarded</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#E8F5A5] to-[#D4E7B8] rounded-xl p-5 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white rounded-xl p-3 shadow-md">
                      <Users className="h-6 w-6 text-[#7DD9A6]" />
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm font-semibold">
                        Total Registered
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {totalParticipants}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] rounded-xl p-5 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-md">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-semibold">
                        Marked Present
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {attendedCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-5 shadow-lg border-2 border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white rounded-xl p-3 shadow-md">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm font-semibold">
                        Attendance Rate
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {attendanceRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center justify-between border-b-2 border-[#D4E7B8] pb-4">
                <h4 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-[#7DD9A6]" />
                  Participants Attendance
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-[#7DD9A6] text-white rounded-lg hover:bg-[#6BC794] transition-all duration-200 text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Participants List */}
              <div className="space-y-3">
                {participants.map((participant, index) => {
                  const isAttended = attendedParticipants.has(participant._id);
                  
                  return (
                    <div
                      key={participant._id}
                      className={`border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                        isAttended
                          ? "border-[#7DD9A6] bg-gradient-to-r from-[#E8F5A5]/30 to-[#7DD9A6]/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => toggleAttendance(participant._id)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                              isAttended
                                ? "bg-[#7DD9A6] border-[#7DD9A6]"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isAttended && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {participant.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        </div>

                        {/* Participant Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="text-gray-900 font-bold text-base">
                              {participant.name || "Unknown User"}
                            </h5>
                            {participant.userType && (
                              <span className="px-3 py-1 bg-gradient-to-r from-[#E8F5A5] to-[#D4E7B8] text-gray-700 text-xs rounded-full font-semibold capitalize">
                                {participant.userType}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {participant.email && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="truncate font-medium">
                                  {participant.email}
                                </span>
                              </div>
                            )}

                            {participant.contactNumber && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Phone className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="font-medium">
                                  {participant.contactNumber}
                                </span>
                              </div>
                            )}

                            {participant.location && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="truncate font-medium">
                                  {participant.location}
                                </span>
                              </div>
                            )}

                            {participant.points !== undefined && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Award className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="font-medium">
                                  {participant.points} points
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Number Badge */}
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Proof Upload */}
              <div className="border-t-2 border-[#D4E7B8] pt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-[#7DD9A6]" />
                  Upload Completion Proof *
                </h4>

                {!completionProof ? (
                  <div className="border-2 border-dashed border-[#7DD9A6] rounded-xl p-8 text-center hover:border-[#6BC794] transition-all duration-200 bg-gradient-to-br from-[#E8F5A5]/20 to-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="completion-proof-upload"
                    />
                    <label
                      htmlFor="completion-proof-upload"
                      className="cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-700 font-semibold mb-2">
                        Click to upload completion proof
                      </p>
                      <p className="text-gray-500 text-sm">
                        Group photo, event certificate, or any proof of completion
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-[#7DD9A6] rounded-xl overflow-hidden">
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Completion proof"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          onClick={removeFile}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                        >
                          <CloseIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    <div className="p-4 bg-gradient-to-r from-[#E8F5A5] to-[#D4E7B8]">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-[#7DD9A6]" />
                        <div className="flex-1">
                          <p className="text-gray-900 font-semibold text-sm truncate">
                            {completionProof.name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {(completionProof.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t-2 border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{attendedCount}</span> of{" "}
              <span className="font-semibold">{totalParticipants}</span>{" "}
              participants marked present
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !completionProof || attendedCount === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white rounded-lg hover:from-[#6BC794] hover:to-[#5AB583] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAttendanceVerification;
