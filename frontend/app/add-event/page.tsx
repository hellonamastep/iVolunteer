"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useNGO } from "@/contexts/ngo-context";
import { toast } from "react-toastify";
import {
  Upload,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Tag,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Activity,
  Settings,
  AlertCircle,
  Save,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { compressImage, clearStorageIfNeeded } from "@/lib/imageCompression";
import api from "@/lib/api";

interface EventFormValues {
  title: string;
  description: string;
  category: string;
  customCategory?: string;
  location: string;
  detailedAddress?: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  eventType: string;
  eventStatus: string;
  requirements: string;
  sponsorshipRequired: boolean;
  sponsorshipAmount: number;
  sponsorshipContactEmail?: string;
  sponsorshipContactNumber?: string;
  eventImage?: FileList;
  confirmCheckbox: boolean;
}

const STORAGE_KEY = "volunteer_event_draft";
const IMAGES_STORAGE_KEY = "volunteer_event_images";

const CreateEventPage: React.FC = () => {
  const { createEvent } = useNGO();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'dashboard';
  
  // Determine if this is a special event or regular volunteer event
  const isSpecialEvent = source === 'special';
  const formTitle = isSpecialEvent ? "Create Special Event" : "Create Volunteer Event";
  const titleLabel = isSpecialEvent ? "Special Event Title" : "Event Title";
  const submitButtonText = isSpecialEvent ? "Submit Special Event" : "Submit Volunteer Event";
  const defaultTitlePlaceholder = isSpecialEvent ? "Your Special Event Title" : "Your Volunteer Event Title";
  
  const [activeStep, setActiveStep] = useState(1);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [requirementInputs, setRequirementInputs] = useState([""]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  // Custom time picker state
  const [selectedHour, setSelectedHour] = useState<string>("09");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("AM");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    mode: "onChange",
    defaultValues: {
      sponsorshipRequired: false,
      sponsorshipAmount: 0,
      duration: 3,
      maxParticipants: 50,
      eventStatus: "upcoming",
      eventType: "community",
      location: "",
    },
  });

  const watchedFields = watch();
  const confirmCheckbox = watch("confirmCheckbox");
  const eventImage = watch("eventImage");
  const selectedCategory = watch("category");
  const sponsorshipRequired = watch("sponsorshipRequired");

  // Dynamic categories based on event type
  const categories = isSpecialEvent 
    ? [
        "Birthday",
        "Wedding",
        "Anniversary",
        "Retirement",
        "Graduation",
        "Baby Shower",
        "Engagement",
        "Corporate Celebration",
        "Milestone Celebration",
        "Memorial",
        "Other",
      ]
    : [
        "Environmental",
        "Education",
        "Healthcare",
        "Community",
        "Animals",
        "Eldercare",
        "Disability",
        "Arts",
        "Other",
      ];

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
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchDefaultLocation();
  }, [setValue]);

  // Sync custom time picker with form time field
  useEffect(() => {
    const convert12to24 = (hour: string, minute: string, period: string) => {
      let hour24 = parseInt(hour);
      if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, '0')}:${minute}`;
    };
    
    const time24 = convert12to24(selectedHour, selectedMinute, selectedPeriod);
    setValue("time", time24);
  }, [selectedHour, selectedMinute, selectedPeriod, setValue]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        const savedImages = localStorage.getItem(IMAGES_STORAGE_KEY);
        
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          
          const meaningfulKeys = Object.keys(draftData).filter(
            key => key !== '_savedAt' && 
                   key !== 'sponsorshipRequired' && 
                   key !== 'sponsorshipAmount' && 
                   key !== 'duration' &&
                   key !== 'maxParticipants' &&
                   key !== 'eventStatus' &&
                   key !== 'eventType' &&
                   key !== 'location' &&
                   draftData[key] !== undefined &&
                   draftData[key] !== null &&
                   draftData[key] !== ''
          );
          
          if (meaningfulKeys.length > 0) {
            Object.keys(draftData).forEach((key) => {
              if (key !== 'eventImage') {
                setValue(key as any, draftData[key]);
              }
            });
            
            if (savedImages) {
              const imageData = JSON.parse(savedImages);
              if (imageData.eventImage) setEventImagePreview(imageData.eventImage);
            }
            
            toast.info("Draft restored successfully!", { autoClose: 2000 });
            setLastSaved(new Date(draftData._savedAt));
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    
    loadDraft();
  }, [setValue]);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        clearStorageIfNeeded(0.8);
        
        const formData = { ...watchedFields, _savedAt: new Date().toISOString() };
        
        const dataToSave: any = {};
        Object.keys(formData).forEach((key) => {
          const value = formData[key as keyof typeof formData];
          if (!(value instanceof FileList)) {
            dataToSave[key] = value;
          }
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        
        const imageData: any = {};
        if (eventImagePreview) imageData.eventImage = eventImagePreview;
        if (Object.keys(imageData).length > 0) {
          localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(imageData));
        }
        
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [watchedFields, eventImagePreview]);

  const steps = [
    { number: 1, name: "Basic Info" },
    { number: 2, name: "Details" },
    { number: 3, name: "Participation" },
    { number: 4, name: "Sponsorship" },
    { number: 5, name: "Review" },
  ];

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    if (activeStep === 1) {
      fieldsToValidate = ["title", "category", "description", "location", "date", "time"];
      if (selectedCategory === "Other" || selectedCategory === "other") {
        fieldsToValidate.push("customCategory");
      }
    } else if (activeStep === 2) {
      fieldsToValidate = ["duration", "eventType", "eventStatus", "detailedAddress"];
    } else if (activeStep === 3) {
      fieldsToValidate = ["maxParticipants", "requirements"];
    } else if (activeStep === 4) {
      if (sponsorshipRequired) {
        fieldsToValidate = ["sponsorshipAmount", "sponsorshipContactEmail", "sponsorshipContactNumber"];
      }
    } else if (activeStep === 5) {
      fieldsToValidate = ["confirmCheckbox"];
    }

    const result = await trigger(fieldsToValidate as any);

    if (result) {
      if (activeStep < 5) {
        setActiveStep(activeStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const hasUnsavedChanges = Object.keys(watchedFields).some(
      key => watchedFields[key as keyof typeof watchedFields] && 
             key !== 'sponsorshipRequired' && 
             key !== 'sponsorshipAmount'
    );
    
    if (hasUnsavedChanges) {
      setShowBackConfirmation(true);
    } else {
      router.back();
    }
  };

  const confirmLeave = () => {
    setShowBackConfirmation(false);
    router.back();
  };

  const cancelLeave = () => {
    setShowBackConfirmation(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    }
  };

  const removeImage = () => {
    setEventImagePreview(null);
    setValue("eventImage", undefined as any);
  };

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      let imageData: any = null;

      if (eventImage && eventImage.length > 0) {
        const formData = new FormData();
        formData.append("image", eventImage[0]);

        const response = await api.post(
          "/v1/upload/single",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
            },
          }
        );

        imageData = response.data;
      }

      // Determine category value
      let categoryValue: string;
      if (data.category === "Other" || data.category === "other") {
        categoryValue = data.customCategory || "other";
      } else {
        categoryValue = data.category.toLowerCase().replace(/ /g, '-');
      }

      const formattedData = {
        title: data.title,
        description: data.description,
        location: data.location,
        detailedAddress: data.detailedAddress || "",
        date: new Date(`${data.date}T${data.time}`).toISOString(),
        time: data.time,
        duration: Number(data.duration),
        category: categoryValue,
        maxParticipants: Number(data.maxParticipants),
        requirements: requirementInputs.filter((req) => req.trim() !== ""),
        sponsorshipRequired: data.sponsorshipRequired,
        sponsorshipAmount: data.sponsorshipRequired ? Number(data.sponsorshipAmount) : 0,
        image: imageData ? {
          url: imageData.url,
          caption: "Event Image",
          publicId: imageData.publicId,
        } : undefined,
        eventStatus: data.eventStatus,
        eventType: data.eventType,
        participants: [],
        pointsOffered: 0,
        sponsorshipContactEmail: data.sponsorshipContactEmail,
        sponsorshipContactNumber: data.sponsorshipContactNumber,
      };

      await createEvent(formattedData);
      
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      
      toast.success(isSpecialEvent ? "Special event created successfully!" : "Event created successfully!");
      
      reset();
      setActiveStep(1);
      setEventImagePreview(null);
      setRequirementInputs([""]);
      setLastSaved(null);
      
      setTimeout(() => {
        router.push('/volunteer');
      }, 1500);
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || "Failed to create event");
    }
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear the draft? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      reset();
      setEventImagePreview(null);
      setRequirementInputs([""]);
      setActiveStep(1);
      setLastSaved(null);
      toast.info("Draft cleared successfully!");
    }
  };

  const addRequirement = () => {
    setRequirementInputs([...requirementInputs, ""]);
  };

  const updateRequirement = (index: number, value: string) => {
    const newInputs = [...requirementInputs];
    newInputs[index] = value;
    setRequirementInputs(newInputs);
  };

  const removeRequirement = (index: number) => {
    if (requirementInputs.length > 1) {
      const newInputs = requirementInputs.filter((_, i) => i !== index);
      setRequirementInputs(newInputs);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6]">
      {/* Leave Confirmation Dialog */}
      {showBackConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {isSpecialEvent ? "Leave Special Event Creation?" : "Leave Event Creation?"}
            </h3>
            <p className="text-gray-600 mb-6">
              Your progress has been auto-saved. You can continue where you left off when you return.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLeave}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Stay
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 px-4 py-2.5 bg-[#7DD9A6] text-white rounded-lg hover:bg-[#6BC995] font-medium transition-all"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-transparent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <button 
                type="button" 
                onClick={handleBack} 
                className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-white/50 transition-all text-sm flex items-center space-x-2 backdrop-blur-sm"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            </div>
            <div className="text-center flex-1 justify-center">
              <h1 className="text-xl font-semibold text-gray-700">{formTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">Make doing good fun, rewarding & impactful</p>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    activeStep === step.number
                      ? "bg-[#7DD9A6] text-white shadow-md"
                      : activeStep > step.number
                      ? "bg-[#7DD9A6] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {activeStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 font-medium hidden sm:block">
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    activeStep > step.number ? "bg-[#7DD9A6]" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={clearDraft}
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Clear Draft
            </button>
          </div>
        </div>
      )}

      {/* Form with Live Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            
            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Step 1: Basic Info</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us about your event</p>
                </div>

                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {titleLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("title", {
                        required: "Title is required",
                        minLength: { value: 10, message: "Title must be at least 10 characters" },
                        maxLength: { value: 100, message: "Title cannot exceed 100 characters" }
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                      placeholder={defaultTitlePlaceholder}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  {/* Event Image */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Event Image
                    </label>
                    {eventImagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={eventImagePreview}
                          alt="Event preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#7DD9A6] transition-all bg-gray-50">
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload className="h-10 w-10 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload event image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          {...register("eventImage")}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("category", { required: "Category is required" })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm text-gray-600"
                    >
                      <option value="">{isSpecialEvent ? "Select event type" : "Select a category"}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    
                    {/* Custom Category Input */}
                    {(selectedCategory === "Other" || selectedCategory === "other") && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Please specify category <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("customCategory", {
                            required: (selectedCategory === "Other" || selectedCategory === "other") ? "Please specify the category" : false,
                            minLength: { value: 3, message: "Category must be at least 3 characters" },
                            maxLength: { value: 50, message: "Category must be less than 50 characters" }
                          })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                          placeholder="Enter your category"
                        />
                        {errors.customCategory && <p className="text-red-500 text-xs mt-1">{errors.customCategory.message}</p>}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Event Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                        minLength: { value: 50, message: "Description must be at least 50 characters" },
                        maxLength: { value: 1000, message: "Description cannot exceed 1000 characters" }
                      })}
                      rows={5}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm resize-none"
                      placeholder="Describe your event in detail..."
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                      <p className="text-xs text-gray-500 ml-auto">{watch("description")?.length || 0}/1000</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register("location", { required: "Location is required" })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="City name"
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          {...register("date", { required: "Date is required" })}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                        />
                      </div>
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative w-1/2">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <div className="flex gap-2">
                          {/* Hour Dropdown */}
                          <select
                            value={selectedHour}
                            onChange={(e) => setSelectedHour(e.target.value)}
                            className="flex-1 pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = (i + 1).toString().padStart(2, '0');
                              return <option key={hour} value={hour}>{hour}</option>;
                            })}
                          </select>

                          {/* Minute Dropdown */}
                          <select
                            value={selectedMinute}
                            onChange={(e) => setSelectedMinute(e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                          >
                            {Array.from({ length: 60 }, (_, i) => {
                              const minute = i.toString().padStart(2, '0');
                              return <option key={minute} value={minute}>{minute}</option>;
                            })}
                          </select>

                          {/* AM/PM Dropdown */}
                          <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-20 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                      <p className="text-xs text-gray-500 mt-1">Select hour, minute, and AM/PM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Step 2: Event Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Provide additional information</p>
                </div>

                <div className="space-y-5">
                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Duration (hours) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("duration", {
                        required: "Duration is required",
                        min: { value: 1, message: "Duration must be at least 1 hour" },
                        max: { value: 12, message: "Duration cannot exceed 12 hours" }
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                      placeholder="3"
                    />
                    {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("eventType", { required: "Event type is required" })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm text-gray-600"
                    >
                      <option value="community">Community Event</option>
                      <option value="virtual">Virtual Event</option>
                      <option value="in-person">In-Person Event</option>
                    </select>
                    {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType.message}</p>}
                  </div>

                  {/* Event Status */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Event Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("eventStatus", { required: "Event status is required" })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm text-gray-600"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="postponed">Postponed</option>
                    </select>
                    {errors.eventStatus && <p className="text-red-500 text-xs mt-1">{errors.eventStatus.message}</p>}
                  </div>

                  {/* Detailed Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Detailed Address
                    </label>
                    <textarea
                      {...register("detailedAddress")}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm resize-none"
                      placeholder="Street address, building name, landmarks..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Participation */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Step 3: Participation Info</h2>
                  <p className="text-sm text-gray-500 mt-1">Set capacity and requirements</p>
                </div>

                <div className="space-y-5">
                  {/* Max Participants */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Maximum Participants <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        {...register("maxParticipants", {
                          required: "Maximum participants is required",
                          min: { value: 1, message: "Must allow at least 1 participant" },
                          max: { value: 1000, message: "Cannot exceed 1000 participants" }
                        })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="50"
                      />
                    </div>
                    {errors.maxParticipants && <p className="text-red-500 text-xs mt-1">{errors.maxParticipants.message}</p>}
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Requirements <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {requirementInputs.map((req, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement(index, e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder={`Requirement ${index + 1}`}
                          />
                          {requirementInputs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRequirement}
                        className="text-sm text-[#7DD9A6] hover:text-[#6BC995] font-medium flex items-center gap-1"
                      >
                        + Add Requirement
                      </button>
                    </div>
                    <input
                      type="hidden"
                      {...register("requirements", {
                        validate: () => requirementInputs.some(req => req.trim() !== "") || "At least one requirement is needed"
                      })}
                    />
                    {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Sponsorship */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Step 4: Sponsorship</h2>
                  <p className="text-sm text-gray-500 mt-1">Optional sponsorship details</p>
                </div>

                <div className="space-y-5">
                  {/* Sponsorship Required Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Require Sponsorship</h3>
                      <p className="text-xs text-gray-500 mt-1">Does this event need sponsors?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("sponsorshipRequired")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7DD9A6]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DD9A6]"></div>
                    </label>
                  </div>

                  {/* Conditional Sponsorship Fields */}
                  {sponsorshipRequired && (
                    <div className="space-y-5 animate-in slide-in-from-top-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Sponsorship Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            {...register("sponsorshipAmount", {
                              required: sponsorshipRequired ? "Sponsorship amount is required" : false,
                              min: { value: 100, message: "Minimum amount is ₹100" }
                            })}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="5000"
                          />
                        </div>
                        {errors.sponsorshipAmount && <p className="text-red-500 text-xs mt-1">{errors.sponsorshipAmount.message}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Contact Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          {...register("sponsorshipContactEmail", {
                            required: sponsorshipRequired ? "Contact email is required" : false,
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
                          })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                          placeholder="contact@example.com"
                        />
                        {errors.sponsorshipContactEmail && <p className="text-red-500 text-xs mt-1">{errors.sponsorshipContactEmail.message}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          {...register("sponsorshipContactNumber", {
                            required: sponsorshipRequired ? "Contact number is required" : false,
                            pattern: { value: /^[0-9]{10}$/, message: "Must be a 10-digit number" }
                          })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                          placeholder="9876543210"
                        />
                        {errors.sponsorshipContactNumber && <p className="text-red-500 text-xs mt-1">{errors.sponsorshipContactNumber.message}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Step 5: Review & Submit</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your event details</p>
                </div>

                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">{watch("title") || defaultTitlePlaceholder}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Category</p>
                        <p className="text-gray-800">{watch("category") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Location</p>
                        <p className="text-gray-800">{watch("location") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Date</p>
                        <p className="text-gray-800">{watch("date") ? new Date(watch("date")).toLocaleDateString() : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Time</p>
                        <p className="text-gray-800">{watch("time") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Duration</p>
                        <p className="text-gray-800">{watch("duration") || "0"} hours</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Max Participants</p>
                        <p className="text-gray-800">{watch("maxParticipants") || "0"} people</p>
                      </div>
                    </div>

                    {watch("description") && (
                      <div>
                        <p className="text-gray-600 font-medium text-sm">Description</p>
                        <p className="text-gray-800 text-sm mt-1 line-clamp-3">{watch("description")}</p>
                      </div>
                    )}

                    {sponsorshipRequired && (
                      <div className="pt-4 border-t border-gray-300/50">
                        <p className="text-gray-600 font-medium text-sm mb-2">Sponsorship Required</p>
                        <p className="text-gray-800 text-sm">Amount: ₹{watch("sponsorshipAmount") || 0}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("confirmCheckbox", {
                          required: "You must confirm the details are correct"
                        })}
                        className="mt-1 h-4 w-4 text-[#7DD9A6] focus:ring-[#7DD9A6] border-gray-300 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">I confirm that all details are correct</p>
                        <p className="text-xs text-gray-600 mt-1">
                          By submitting, you agree that the information provided is accurate and complies with our terms of service.
                        </p>
                      </div>
                    </label>
                    {errors.confirmCheckbox && <p className="text-red-500 text-xs mt-2">{errors.confirmCheckbox.message}</p>}
                  </div>

                  {/* Info Note */}
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Review Period</p>
                      <p className="mt-1">Your event will be reviewed by our team and published within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Previous
              </button>
            )}
            
            {activeStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-[#7DD9A6] text-white rounded-lg hover:bg-[#6BC995] font-medium transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !confirmCheckbox}
                className="ml-auto px-6 py-3 bg-[#7DD9A6] text-white rounded-lg hover:bg-[#6BC995] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {submitButtonText}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

          {/* Live Preview Column - Sticky */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] rounded-2xl shadow-lg overflow-hidden sticky top-8 self-start">
              {/* Header */}
              <div className="bg-[#7DD9A6] p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Live Preview</h3>
                </div>
                <p className="text-sm text-white/90">
                  {isSpecialEvent ? "See how your special event will appear" : "See how your event will appear to volunteers"}
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-white p-6 w-full">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  {/* Event Image */}
                  <div className="h-48 bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] relative overflow-hidden flex items-center justify-center">
                    {eventImagePreview ? (
                      <img src={eventImagePreview} alt="Event preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-white/50 mx-auto mb-2" />
                        <p className="text-sm text-white/70">Event image preview</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Category Badge */}
                    {watch("category") && (
                      <span className="inline-block px-3 py-1 bg-[#7DD9A6] text-white text-xs font-medium rounded-full">
                        {(watch("category") === "Other" || watch("category") === "other") && watch("customCategory") 
                          ? watch("customCategory") 
                          : watch("category")}
                      </span>
                    )}

                    {/* Title */}
                    <h4 className="text-lg font-bold text-gray-800 line-clamp-2">
                      {watch("title") || defaultTitlePlaceholder}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {watch("description") || "Your event description will appear here..."}
                    </p>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("location") || "City"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("date") ? new Date(watch("date")).toLocaleDateString() : "TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("time") || "TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Max Participants</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("maxParticipants") || "0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    {watch("duration") && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                        <Activity className="w-4 h-4" />
                        <span>{watch("duration")} hours</span>
                      </div>
                    )}

                    {/* Sponsorship Badge */}
                    {sponsorshipRequired && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-amber-700">Sponsorship Required</span>
                        </div>
                        {watch("sponsorshipAmount") && (
                          <p className="text-xs text-gray-600 mt-1">
                            ₹{watch("sponsorshipAmount").toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Join Button */}
                    <button
                      type="button"
                      className="w-full bg-[#7DD9A6] text-white py-2.5 rounded-lg font-medium hover:bg-[#6BC995] transition-colors text-sm"
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
