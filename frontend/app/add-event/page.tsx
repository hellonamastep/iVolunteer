"use client";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  PlusCircle,
  DollarSign,
  Tag,
  AlertCircle,
  Clock,
  Activity,
  Image as ImageIcon,
  X,
  Upload,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNGO } from "@/contexts/ngo-context";
import api from "@/lib/api";
import axios from "axios";

type EventFormData = {
  title: string;
  description: string;
  location: string;
  detailedAddress?: string;
  date: string;
  time: string;
  duration: number;
  category: string;
  maxParticipants: number;
  requirements: string;
  sponsorshipRequired: boolean;
  sponsorshipAmount: number;
  eventStatus: string;
  eventType: string;
  imageCaption?: string;
  sponsorshipContactEmail?: string;
  sponsorshipContactNumber?: string;
};

const CreateEventPage = () => {
  const { createEvent, loading, error } = useNGO();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormData>({
    defaultValues: {
      sponsorshipRequired: true,
      sponsorshipAmount: 0,
      duration: 3,
      maxParticipants: 50,
      eventStatus: "upcoming",
      eventType: "community",
      location: "",
    },
  });

  const sponsorshipRequired = watch("sponsorshipRequired");
  const [requirementInputs, setRequirementInputs] = useState([""]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState<{ url: string; publicId: string } | null>(null);

  // Fetch default location from user's profile
  useEffect(() => {
    const fetchDefaultLocation = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        const response = await api.get("/v1/event/default-location", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const data = response.data as { success: boolean; defaultLocation: string };
        if (data.success && data.defaultLocation) {
          setValue("location", data.defaultLocation);
        }
      } catch (err) {
        console.error("Failed to fetch default location:", err);
        // Don't show error to user, just leave location empty for manual entry
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchDefaultLocation();
  }, [setValue]);

  const addRequirementInput = () => {
    setRequirementInputs([...requirementInputs, ""]);
  };

  const removeRequirementInput = (index: number) => {
    if (requirementInputs.length > 1) {
      setRequirementInputs(requirementInputs.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEventImage(null);
    setEventImagePreview(null);
    setUploadedImageData(null);
  };

  const uploadEventImage = async () => {
    if (!eventImage) return null;

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("auth-token");
      const formData = new FormData();
      formData.append("eventImage", eventImage);

      const response = await api.post(
        `/v1/event/upload-event-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageData = (response.data as any).data;
      setUploadedImageData(imageData);
      return imageData;
    } catch (error: any) {
      console.error("Error uploading event image:", error);
      throw new Error(error.response?.data?.message || "Failed to upload event image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      // Upload image first if one is selected
      let imageData = uploadedImageData;
      if (eventImage && !uploadedImageData) {
        imageData = await uploadEventImage();
      }

      // Format the data to match the API structure
      const formattedData = {
        title: data.title,
        description: data.description,
        location: data.location,
        detailedAddress: data.detailedAddress || "",
        date: new Date(`${data.date}T${data.time}`).toISOString(),
        time: data.time,
        duration: Number(data.duration),
        category: data.category,
        maxParticipants: Number(data.maxParticipants),
        requirements: requirementInputs.filter((req) => req.trim() !== ""),
        sponsorshipRequired: data.sponsorshipRequired,
        sponsorshipAmount: data.sponsorshipRequired
          ? Number(data.sponsorshipAmount)
          : 0,
        image: imageData ? {
          url: imageData.url,
          caption: "Event Image",
          publicId: imageData.publicId,
        } : undefined,
        eventStatus: data.eventStatus,
        eventType: data.eventType,
        participants: [], // required by EventData
        pointsOffered: 0, // added default to satisfy TypeScript
        sponsorshipContactEmail: data.sponsorshipContactEmail,
        sponsorshipContactNumber: data.sponsorshipContactNumber,
      };

      await createEvent(formattedData);
      setSuccessMessage("Event created successfully!");
      reset(); // clear form after successful submission
      setRequirementInputs([""]); // reset requirements
      removeImage(); // reset image
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const categories = [
    "environmental",
    "education",
    "healthcare",
    "community",
    "animals",
    "eldercare",
    "disability",
    "arts",
    "other",
  ];

  const eventStatuses = [
    { value: "upcoming", label: "Upcoming" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "postponed", label: "Postponed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Enhanced Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-1">
                    Create New Event
                  </h1>
                  <p className="text-blue-100 text-sm font-medium">
                    Organize a volunteer opportunity and make an impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-6 rounded-xl border-l-4 border-red-500 bg-red-50 text-red-800 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-6 rounded-xl border-l-4 border-green-500 bg-green-50 text-green-800 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 md:p-10 space-y-10"
          >
            {/* Basic Info */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Basic Information
                  </h3>
                  <p className="text-xs text-gray-500">Essential event details</p>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-5">
                {/* Event Image */}
                <motion.div variants={itemVariants} className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Image <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  
                  {!eventImagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="event-image-upload"
                      />
                      <label
                        htmlFor="event-image-upload"
                        className="group flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-indigo-50/50"
                      >
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-base text-gray-700 font-semibold mt-4">
                          Click to upload event image
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: 1200x630px for best results
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                      <img
                        src={eventImagePreview}
                        alt="Event preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {uploadedImageData && (
                        <div className="absolute bottom-3 left-3 px-4 py-2 bg-green-500 text-white text-sm rounded-lg font-semibold shadow-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Uploaded Successfully
                        </div>
                      )}
                    </div>
                  )}
                  
                  {eventImagePreview && !uploadedImageData && (
                    <button
                      type="button"
                      onClick={uploadEventImage}
                      disabled={isUploadingImage}
                      className="mt-3 w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Image
                        </>
                      )}
                    </button>
                  )}

                  {/* Image Caption */}
                  {eventImagePreview && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Caption <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        {...register("imageCaption")}
                        className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-4 py-2.5 shadow-sm hover:border-gray-300 transition"
                        placeholder="Add a descriptive caption for this image"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants} className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Event Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("title", {
                        required: "Event title is required",
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-10 py-2.5 shadow-sm placeholder:text-gray-400"
                      placeholder="Enter event title"
                    />

                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants} className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message:
                            "Description should be at least 10 characters",
                        },
                      })}
                      className="w-full min-h-[110px] rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-10 py-2.5 shadow-sm placeholder:text-gray-400"
                      placeholder="Describe the event, its purpose, and what volunteers will be doing..."
                    />

                    <FileText className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </motion.div>

                {/* Location */}
                <motion.div variants={itemVariants} className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Location
                    <span className="text-gray-500 text-xs ml-1 font-normal">
                      (Pre-filled with your city, can be changed)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("location", {
                        required: "Location is required",
                      })}
                      disabled={loadingLocation}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-10 py-2.5 shadow-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-wait"
                      placeholder={loadingLocation ? "Loading your city..." : "Enter event location"}
                    />

                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </motion.div>

                {/* Detailed Address */}
                <motion.div variants={itemVariants} className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Detailed Address
                    <span className="text-gray-500 text-xs ml-1 font-normal">
                      (Street, Building, Landmarks)
                    </span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register("detailedAddress")}
                      className="w-full min-h-[80px] rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-10 py-2.5 shadow-sm placeholder:text-gray-400"
                      placeholder="Enter full address with street name, building number, nearby landmarks, etc."
                    />

                    <MapPin className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Schedule */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Schedule
                  </h3>
                  <p className="text-xs text-gray-500">When will this event take place?</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Date of the Event */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Date of Event
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register("date", { required: "Date is required" })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-4 py-2.5 shadow-sm"
                    />

                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </motion.div>

                {/* Time of the Event */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Time of Event
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      {...register("time", { required: "Time is required" })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-4 py-2.5 shadow-sm"
                    />

                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.time && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.time.message}
                    </p>
                  )}
                </motion.div>

                {/* Duration */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Duration (hours)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E"].includes(e.key))
                          e.preventDefault();
                      }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        if (el.value && Number(el.value) < 1) el.value = "1";
                      }}
                      {...register("duration", {
                        required: "Duration is required",
                        min: {
                          value: 1,
                          message: "Duration must be at least 1 hour",
                        },
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-4 py-2.5 shadow-sm"
                      placeholder="Duration in hours"
                    />

                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.duration.message}
                    </p>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Event Details */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Event Details
                  </h3>
                  <p className="text-xs text-gray-500">Category, status, and type</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Category */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-10 py-2.5 shadow-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22><path fill=%22%236b7280%22 d=%22M5.5 7.5L10 12l4.5-4.5%22/></svg>')] bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center]"
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </motion.div>

                {/* Event Status */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Event Status
                  </label>
                  <div className="relative">
                    <select
                      {...register("eventStatus", {
                        required: "Event status is required",
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-10 py-2.5 shadow-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22><path fill=%22%236b7280%22 d=%22M5.5 7.5L10 12l4.5-4.5%22/></svg>')] bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center]"
                    >
                      {eventStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.eventStatus && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventStatus.message}
                    </p>
                  )}
                </motion.div>

                {/* Event Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Event Type
                  </label>
                  <div className="relative">
                    <select
                      {...register("eventType", {
                        required: "Event type is required",
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-10 py-2.5 shadow-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22><path fill=%22%236b7280%22 d=%22M5.5 7.5L10 12l4.5-4.5%22/></svg>')] bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center]"
                    >
                      <option value="community">Community Event</option>
                      <option value="virtual">Virtual Event</option>
                      <option value="in-person">In-Person Event</option>
                    </select>
                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.eventType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventType.message}
                    </p>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Participation Info */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Participation Info
                  </h3>
                  <p className="text-xs text-gray-500">Capacity and rewards</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Max Participants */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Max Participants
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register("maxParticipants", {
                        required: "Number of participants is required",
                        min: {
                          value: 1,
                          message: "At least 1 participant is required",
                        },
                      })}
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none pl-10 pr-4 py-2.5 shadow-sm"
                      placeholder="Maximum number of participants"
                    />
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.maxParticipants.message}
                    </p>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Requirements */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Requirements
                  </h3>
                  <p className="text-xs text-gray-500">What volunteers need to know</p>
                </div>
              </header>

              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  {requirementInputs.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...requirementInputs];
                          newReqs[index] = e.target.value;
                          setRequirementInputs(newReqs);
                        }}
                        className="flex-1 rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-3 py-2 shadow-sm"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirementInput(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirementInput}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    + Add requirement
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Sponsorship */}
            <section className="space-y-5">
              <header className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Sponsorship
                  </h3>
                  <p className="text-xs text-gray-500">Financial support needs</p>
                </div>
              </header>

              <motion.div variants={itemVariants}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("sponsorshipRequired")} />
                  Sponsorship Required
                </label>

                {sponsorshipRequired && (
                  <div className="mt-2">
                    <input
                      type="number"
                      {...register("sponsorshipAmount", {
                        required: "Sponsorship amount is required",
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                      placeholder="Sponsorship Amount"
                      className="w-full rounded-xl border-gray-200 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none px-3 py-2 shadow-sm"
                    />
                    {errors.sponsorshipAmount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sponsorshipAmount.message}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </section>

            {/* Conditional fields */}
            {watch("sponsorshipRequired") && (
              <>
                <div>
                  <label className="block font-semibold mb-1">
                    Sponsorship Contact Email
                  </label>
                  <input
                    type="email"
                    {...register("sponsorshipContactEmail", {
                      required: "Email is required when sponsorship is enabled",
                    })}
                    className="border p-2 rounded w-full"
                    placeholder="Enter contact email"
                  />
                  {errors.sponsorshipContactEmail && (
                    <p className="text-red-500 text-sm">
                      {errors.sponsorshipContactEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Sponsorship Contact Number
                  </label>
                  <input
                    type="text"
                    {...register("sponsorshipContactNumber", {
                      required:
                        "Contact number is required when sponsorship is enabled",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit number",
                      },
                    })}
                    className="border p-2 rounded w-full"
                    placeholder="Enter contact number"
                  />
                  {errors.sponsorshipContactNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.sponsorshipContactNumber.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit */}
            <motion.div
              variants={itemVariants}
              className="pt-4"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </motion.button>
              
              {/* Hint text */}
              <p className="mt-3 text-center text-xs text-gray-500">
                All fields marked with <span className="text-red-500">*</span> are required
              </p>
            </motion.div>
          </motion.form>
        </div>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-700 font-medium">
              Your event will be reviewed and published within 24 hours
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateEventPage;
