"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useDonationEvent } from "@/contexts/donationevents-context";
import { toast } from "react-toastify";
import {
  Upload,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Hash,
  Share2,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Settings,
  FileCheck,
  AlertCircle,
  IndianRupeeIcon,
  Save,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { compressImage, clearStorageIfNeeded, getStorageUsage } from "@/lib/imageCompression";

interface EventFormValues {
  title: string;
  category: string;
  customCategory?: string;
  goalAmount: number;
  endDate: string;
  coverImage?: FileList;
  shortDescription: string;
  whyRaising: string;
  whoBenefits: string;
  howFundsUsed: string;
  supportingMedia?: FileList;
  governmentId: FileList;
  proofOfNeed?: FileList;
  confirmCheckbox: boolean;
  displayRaisedAmount: boolean;
  allowAnonymous: boolean;
  enableComments: boolean;
  minimumDonation: number;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  upiId?: string;
  paymentMethod: "manual" | "auto";
  socialShareMessage: string;
  hashtags: string;
  location?: string;
}

const STORAGE_KEY = "donation_event_draft";
const IMAGES_STORAGE_KEY = "donation_event_images";

// Separate component that uses useSearchParams
const AddEventForm: React.FC = () => {
  const { addEvent } = useDonationEvent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'fundraiser';
  
  const isFundraiser = source === 'fundraiser';
  const formTitle = isFundraiser ? "Create Your Fundraiser" : "Create Donation Campaign";
  const titleLabel = isFundraiser ? "Fundraiser Title" : "Campaign Title";
  const whyRaisingLabel = isFundraiser ? "Why are you raising funds?" : "Campaign Purpose";
  const whoBenefitsLabel = isFundraiser ? "Who will benefit from this fundraiser?" : "Who will benefit from this campaign?";
  const submitButtonText = isFundraiser ? "Submit Fundraiser Application" : "Submit Campaign Application";
  const previewText = isFundraiser ? "See how your fundraiser will look to donors" : "See how your campaign will look to donors";
  const leaveConfirmTitle = isFundraiser ? "Leave Fundraiser Creation?" : "Leave Campaign Creation?";
  const defaultTitlePlaceholder = isFundraiser ? "Your Fundraiser Title" : "Your Campaign Title";
  
  const [activeStep, setActiveStep] = useState(1);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [governmentIdPreview, setGovernmentIdPreview] = useState<string | null>(null);
  const [proofOfNeedPreview, setProofOfNeedPreview] = useState<string | null>(null);
  const [supportingMediaFiles, setSupportingMediaFiles] = useState<File[]>([]);
  const [supportingMediaPreviews, setSupportingMediaPreviews] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usedMB: 0, totalMB: 5 });
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showDocumentConfirmation, setShowDocumentConfirmation] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<{ file: File; preview: string; type: 'governmentId' | 'proofOfNeed' } | null>(null);
  const supportingMediaInputRef = React.useRef<HTMLInputElement>(null);

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
      displayRaisedAmount: true,
      allowAnonymous: false,
      enableComments: true,
      paymentMethod: "manual",
      minimumDonation: 10,
    },
  });

  const watchedFields = watch();
  const confirmCheckbox = watch("confirmCheckbox");
  const governmentId = watch("governmentId");
  const proofOfNeed = watch("proofOfNeed");
  const coverImage = watch("coverImage");
  const selectedCategory = watch("category");
  const supportingMedia = watch("supportingMedia");
  const title = watch("title");
  const shortDescription = watch("shortDescription");
  const whyRaising = watch("whyRaising");
  const whoBenefits = watch("whoBenefits");
  const howFundsUsed = watch("howFundsUsed");

  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        const savedImages = localStorage.getItem(IMAGES_STORAGE_KEY);
        
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          
          const meaningfulKeys = Object.keys(draftData).filter(
            key => key !== '_savedAt' && 
                   key !== 'displayRaisedAmount' && 
                   key !== 'allowAnonymous' && 
                   key !== 'enableComments' && 
                   key !== 'paymentMethod' && 
                   key !== 'minimumDonation' &&
                   draftData[key] !== undefined &&
                   draftData[key] !== null &&
                   draftData[key] !== ''
          );
          
          if (meaningfulKeys.length > 0) {
            Object.keys(draftData).forEach((key) => {
              if (key !== 'coverImage' && key !== 'governmentId' && key !== 'proofOfNeed' && key !== 'supportingMedia') {
                setValue(key as any, draftData[key]);
              }
            });
            
            // Don't restore images from draft - they cause FileList issues
            // User will need to re-select images if they restore a draft
            
            toast.info("Draft restored successfully! Please re-select your images if you had any.", { 
              autoClose: 3000,
              toastId: "draft-restored"
            });
            setLastSaved(new Date(draftData._savedAt));
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    
    loadDraft();
  }, [setValue]);

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
        
        const formDataStr = JSON.stringify(dataToSave);
        localStorage.setItem(STORAGE_KEY, formDataStr);
        
        // Don't save images to localStorage - they cause issues with FileList
        // User will need to re-select images if they restore a draft
        
        setLastSaved(new Date());
          
        const usage = getStorageUsage();
        setStorageUsage({ usedMB: usage.usedMB, totalMB: usage.totalMB });
      } catch (error) {
        console.error("Error saving draft:", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error('Storage quota exceeded. Please clear some browser data or reduce image sizes.', {
            autoClose: 5000,
            toastId: 'storage-quota-error'
          });
          const usage = getStorageUsage();
          console.error(`Storage usage: ${usage.usedMB}MB / ${usage.totalMB}MB`);
        }
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [watchedFields, coverImagePreview, governmentIdPreview, proofOfNeedPreview]);

  React.useEffect(() => {
    let score = 0;
    if ((governmentId && governmentId.length > 0) || governmentIdPreview) score += 50;
    if ((proofOfNeed && proofOfNeed.length > 0) || proofOfNeedPreview) score += 30;
    if (confirmCheckbox) score += 20;
    setTrustScore(score);
  }, [governmentId, proofOfNeed, confirmCheckbox, governmentIdPreview, proofOfNeedPreview]);

  React.useEffect(() => {
    if (coverImage && coverImage[0]) {
      const file = coverImage[0];
      compressImage(file, 800, 600, 0.7)
        .then((compressedDataUrl) => {
          setCoverImagePreview(compressedDataUrl);
        })
        .catch((error) => {
          console.error('Error compressing cover image:', error);
          const reader = new FileReader();
          reader.onloadend = () => {
            setCoverImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
    } else {
      setCoverImagePreview(null);
    }
  }, [coverImage]);

  React.useEffect(() => {
    if (!supportingMedia || supportingMedia.length === 0) return;
    
    const newFiles = Array.from(supportingMedia);
    
    const existingFileNames = supportingMediaFiles.map(f => f.name + f.size);
    const filesToAdd = newFiles.filter(file => 
      !existingFileNames.includes(file.name + file.size)
    );
    
    if (filesToAdd.length === 0) {
      if (supportingMediaInputRef.current) {
        supportingMediaInputRef.current.value = "";
      }
      return;
    }
    
    const currentCount = supportingMediaFiles.length;
    const availableSlots = 5 - currentCount;
    
    if (availableSlots <= 0) {
      toast.warning("Maximum 5 files allowed for supporting media", { toastId: 'max-files-warning' });
      if (supportingMediaInputRef.current) {
        supportingMediaInputRef.current.value = "";
      }
      return;
    }
    
    const filesToProcess = filesToAdd.slice(0, availableSlots);
    
    if (filesToAdd.length > availableSlots) {
      toast.info(`Only ${availableSlots} more file(s) can be added (5 max total)`, { toastId: 'available-slots-info' });
    }
    
    const loadPreviews = async () => {
      const newPreviews: string[] = [];
      
      for (const file of filesToProcess) {
        try {
          if (file.type.startsWith('image/')) {
            const compressed = await compressImage(file, 400, 300, 0.6);
            newPreviews.push(compressed);
          } else if (file.type.startsWith('video/')) {
            newPreviews.push('VIDEO_FILE');
          }
        } catch (error) {
          console.error('Error processing supporting media:', error);
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
      
      setSupportingMediaFiles(prev => [...prev, ...filesToProcess]);
      setSupportingMediaPreviews(prev => [...prev, ...newPreviews]);
    };
    
    loadPreviews();
  }, [supportingMedia]);

  const handleDeleteSupportingMedia = (index: number) => {
    const newFiles = supportingMediaFiles.filter((_, i) => i !== index);
    const newPreviews = supportingMediaPreviews.filter((_, i) => i !== index);
    
    setSupportingMediaFiles(newFiles);
    setSupportingMediaPreviews(newPreviews);
    
    if (supportingMediaInputRef.current) {
      supportingMediaInputRef.current.value = "";
    }
    
    toast.success("Image removed successfully", { toastId: 'image-removed' });
  };

  const handleDocumentSelection = async (e: React.ChangeEvent<HTMLInputElement>, type: 'governmentId' | 'proofOfNeed') => {
    const file = e.target.files?.[0];
    if (!file) return;

    let preview: string;
    if (file.type.startsWith('image/')) {
      try {
        preview = await compressImage(file, 600, 800, 0.6);
      } catch (error) {
        preview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    } else {
      preview = 'PDF_FILE';
    }

    setPendingDocument({ file, preview, type });
    setShowDocumentConfirmation(true);
    e.target.value = '';
  };

  const confirmDocumentUpload = () => {
    if (!pendingDocument) return;

    const { file, preview, type } = pendingDocument;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileList = dataTransfer.files;

    setValue(type, fileList, { shouldValidate: true });

    if (type === 'governmentId') {
      setGovernmentIdPreview(preview);
    } else {
      setProofOfNeedPreview(preview);
    }

    setShowDocumentConfirmation(false);
    setPendingDocument(null);
    
    toast.success(`${type === 'governmentId' ? 'Government ID' : 'Proof of Need'} uploaded successfully!`, { 
      toastId: `${type}-uploaded` 
    });
  };

  const cancelDocumentUpload = () => {
    setShowDocumentConfirmation(false);
    setPendingDocument(null);
  };

  const steps = [
    { number: 1, name: "Basic Info" },
    { number: 2, name: "Story" },
    { number: 3, name: "Verification" },
    { number: 4, name: "Settings" },
    { number: 5, name: "Review" },
  ];

  const categories = [
    "Medical",
    "Education",
    "Emergency",
    "Community",
    "Animals",
    "Environment",
    "Disaster Relief",
    "Other",
  ];

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    if (activeStep === 1) {
      fieldsToValidate = ["title", "category", "goalAmount", "endDate", "shortDescription"];
      
      if (selectedCategory === "Other") {
        fieldsToValidate.push("customCategory");
      }
      
      if (!coverImage || coverImage.length === 0) {
        if (!coverImagePreview) {
          fieldsToValidate.push("coverImage");
        }
      }
    } else if (activeStep === 2) {
      fieldsToValidate = ["whyRaising", "whoBenefits", "howFundsUsed"];
    } else if (activeStep === 3) {
      fieldsToValidate = ["governmentId", "confirmCheckbox"];
    } else if (activeStep === 4) {
      fieldsToValidate = ["minimumDonation", "accountNumber", "ifscCode", "accountHolder", "socialShareMessage"];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setShowBackConfirmation(true);
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmBack = () => {
    window.history.back();
    setShowBackConfirmation(false);
  };

  const cancelBack = () => {
    setShowBackConfirmation(false);
  };

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('category', data.category);
      if (data.category === "Other" && data.customCategory) {
        formData.append('customCategory', data.customCategory);
      }
      formData.append('goalAmount', data.goalAmount.toString());
      formData.append('endDate', data.endDate);
      formData.append('shortDescription', data.shortDescription);
      formData.append('whyRaising', data.whyRaising || '');
      formData.append('whoBenefits', data.whoBenefits || '');
      formData.append('howFundsUsed', data.howFundsUsed || '');
      formData.append('displayRaisedAmount', data.displayRaisedAmount.toString());
      formData.append('allowAnonymous', data.allowAnonymous.toString());
      formData.append('enableComments', data.enableComments.toString());
      formData.append('minimumDonation', data.minimumDonation.toString());
      formData.append('paymentMethod', data.paymentMethod || 'manual');
      formData.append('socialShareMessage', data.socialShareMessage || '');
      formData.append('hashtags', data.hashtags || '');
      formData.append('location', data.location || '');
      
      if (data.upiId) {
        formData.append('upiId', data.upiId);
      }
      
      let calculatedTrustScore = 0;
      if (data.governmentId && data.governmentId.length > 0) calculatedTrustScore += 50;
      if (data.proofOfNeed && data.proofOfNeed.length > 0) calculatedTrustScore += 30;
      if (data.confirmCheckbox) calculatedTrustScore += 20;
      formData.append('trustScore', calculatedTrustScore.toString());
      
      if (data.accountNumber) {
        formData.append('bankAccount[accountNumber]', data.accountNumber);
        formData.append('bankAccount[ifsc]', data.ifscCode);
        formData.append('bankAccount[accountHolder]', data.accountHolder);
      }
      
      // Add cover image
      if (data.coverImage && data.coverImage.length > 0) {
        formData.append('coverImage', data.coverImage[0]);
      }
      
      // Add government ID
      if (data.governmentId && data.governmentId.length > 0) {
        formData.append('governmentId', data.governmentId[0]);
      }
      
      // Add proof of need
      if (data.proofOfNeed && data.proofOfNeed.length > 0) {
        formData.append('proofOfNeed', data.proofOfNeed[0]);
      }
      
      // Add supporting media files
      if (supportingMediaFiles.length > 0) {
        supportingMediaFiles.forEach(file => {
          formData.append('supportingMedia', file);
        });
      }
      
      await addEvent(formData as any);
      
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      
      toast.success("Donation campaign request sent to admin successfully!", { toastId: "donation-created" });
      
      reset();
      setActiveStep(1);
      setCoverImagePreview(null);
      setGovernmentIdPreview(null);
      setProofOfNeedPreview(null);
      setSupportingMediaFiles([]);
      setSupportingMediaPreviews([]);
      setLastSaved(null);
      
      setTimeout(() => {
        router.push('/donate');
      }, 1500);
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || "Failed to create campaign", { toastId: 'submit-error' });
    }
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear the draft? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      reset();
      setCoverImagePreview(null);
      setGovernmentIdPreview(null);
      setProofOfNeedPreview(null);
      setSupportingMediaFiles([]);
      setSupportingMediaPreviews([]);
      setActiveStep(1);
      setLastSaved(null);
      toast.info("Draft cleared successfully!", { toastId: 'draft-cleared' });
    }
  };

  const getFieldStatus = (fieldName: keyof EventFormValues) => {
    const value = watchedFields[fieldName];
    if (!value) return "empty";
    if (value instanceof FileList) {
      return value.length > 0 ? "filled" : "empty";
    }
    return value.toString().trim() !== "" ? "filled" : "empty";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6]">
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
                <span className="text-xs mt-2 text-gray-600 font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center" style={{ marginBottom: '24px' }}>
                  <div
                    className={`h-1 w-full ${
                      activeStep > step.number ? "bg-[#7DD9A6]" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Info */}
                {activeStep === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">Step 1: Basic Info</h2>
                      <p className="text-sm text-gray-600 mt-1">Fill in the details below to continue</p>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {titleLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("title", {
                          required: "Title is required",
                          minLength: { value: 10, message: "Title must be at least 10 characters" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="Help Rebuild a Home for Flood Victims"
                      />
                      <p className="text-xs text-gray-500 mt-1">{title?.length || 0}/100 characters • Minimum 10 required</p>
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
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
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                      
                      {/* Custom Category Input */}
                      {selectedCategory === "Other" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please specify category <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("customCategory", {
                              required: selectedCategory === "Other" ? "Please specify the category" : false,
                              minLength: { value: 3, message: "Category must be at least 3 characters" },
                            })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="Enter your category"
                          />
                          {errors.customCategory && <p className="text-red-500 text-xs mt-1">{errors.customCategory.message}</p>}
                        </div>
                      )}
                    </div>

                    {/* Goal Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fundraising Goal (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">₹</span>
                        </div>
                        <input
                          {...register("goalAmount", {
                            required: "Goal amount is required",
                            min: { value: 1000, message: "Minimum goal is ₹1,000" },
                          })}
                          type="number"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                          placeholder="50000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum ₹1,000</p>
                      {errors.goalAmount && <p className="text-red-500 text-xs mt-1">{errors.goalAmount.message}</p>}
                    </div>

                    {/* Campaign End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("endDate", {
                          required: "End date is required",
                          validate: (value) => {
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return selectedDate > today || "End date must be in the future";
                          },
                        })}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm text-gray-600"
                      />
                      {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7DD9A6] transition-colors bg-gray-50">
                        <input
                          {...register("coverImage", { 
                            required: !coverImagePreview ? "Cover image is required" : false 
                          })}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="coverImage"
                        />
                        <label htmlFor="coverImage" className="cursor-pointer flex flex-col items-center">
                          {coverImagePreview ? (
                            <div className="relative w-full h-48">
                              <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 font-medium">Click to upload cover image</p>
                              <p className="text-xs text-gray-400 mt-1">Recommended: 16:9 ratio (JPG, PNG)</p>
                            </>
                          )}
                        </label>
                      </div>
                      {errors.coverImage && !coverImagePreview && <p className="text-red-500 text-xs mt-1">{errors.coverImage.message}</p>}
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description / Tagline <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register("shortDescription", {
                          required: "Short description is required",
                          maxLength: { value: 150, message: "Maximum 150 characters allowed" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all resize-none text-sm"
                        rows={3}
                        placeholder="Every child deserves access to clean water"
                      />
                      <p className="text-xs text-gray-500 mt-1">{shortDescription?.length || 0}/150 characters • Appears in campaign cards</p>
                      {errors.shortDescription && <p className="text-red-500 text-xs mt-1">{errors.shortDescription.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Story */}
                {activeStep === 2 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">Step 2: Story</h2>
                      <p className="text-sm text-gray-600 mt-1">Tell your story below to continue</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {whyRaisingLabel} <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-2">Share your story. Be specific about the situation, challenges, and impact.</p>
                      <textarea
                        {...register("whyRaising", {
                          required: "This field is required",
                          minLength: { value: 50, message: "Please provide at least 50 characters" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all resize-none text-sm"
                        rows={4}
                        placeholder="Tell your story here... Describe the background, current situation, and why this fundraiser is needed"
                      />
                      <p className="text-xs text-gray-500 mt-1">{whyRaising?.length || 0} characters • Minimum 50 required</p>
                      {errors.whyRaising && <p className="text-red-500 text-xs mt-1">{errors.whyRaising.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {whoBenefitsLabel} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register("whoBenefits", {
                          required: "This field is required",
                          minLength: { value: 30, message: "Please provide at least 30 characters" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all resize-none text-sm"
                        rows={3}
                        placeholder="Describe who or what cause this fundraiser supports. E.g., 'A family of 5 who lost their home in a flood'"
                      />
                      <p className="text-xs text-gray-500 mt-1">{whoBenefits?.length || 0} characters • Minimum 30 required</p>
                      {errors.whoBenefits && <p className="text-red-500 text-xs mt-1">{errors.whoBenefits.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How will the funds be used? <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-2">Be transparent. List items or describe allocation. This builds donor trust.</p>
                      <textarea
                        {...register("howFundsUsed", {
                          required: "This field is required",
                          minLength: { value: 50, message: "Please provide at least 50 characters" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all resize-none text-sm font-mono"
                        rows={5}
                        placeholder={`Example:\n• ₹25,000 - Medical treatment\n• ₹15,000 - Medication\n• ₹10,000 - Post-care support`}
                      />
                      <p className="text-xs text-gray-500 mt-1">{howFundsUsed?.length || 0} characters • Minimum 50 required</p>
                      {errors.howFundsUsed && <p className="text-red-500 text-xs mt-1">{errors.howFundsUsed.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Supporting Media
                      </label>
                      <p className="text-xs text-gray-600 mb-2">Photos or videos that show the cause (optional but highly recommended)</p>
                      
                      {/* Preview Grid */}
                      {supportingMediaPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {supportingMediaPreviews.map((preview, index) => (
                            <div 
                              key={index} 
                              className="relative h-24 rounded-lg overflow-hidden border border-gray-200 group hover:border-gray-400 transition-colors"
                            >
                              {preview === 'VIDEO_FILE' ? (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              ) : (
                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              )}
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteSupportingMedia(index);
                                }}
                                className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                                style={{ zIndex: 50 }}
                                title="Delete image"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload Area */}
                      {supportingMediaPreviews.length < 5 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#7DD9A6] transition-colors bg-gray-50">
                          <input 
                            {...register("supportingMedia", {
                              onChange: (e) => {
                                setTimeout(() => {
                                  if (supportingMediaInputRef.current) {
                                    supportingMediaInputRef.current.value = "";
                                  }
                                }, 100);
                              }
                            })} 
                            ref={(e) => {
                              register("supportingMedia").ref(e);
                              supportingMediaInputRef.current = e;
                            }}
                            type="file" 
                            accept="image/*,video/*" 
                            multiple 
                            className="hidden" 
                            id="supportingMedia"
                          />
                          <label htmlFor="supportingMedia" className="cursor-pointer flex flex-col items-center">
                            {supportingMediaPreviews.length > 0 ? (
                              <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">Click to upload more images/videos</p>
                                <p className="text-xs text-gray-400 mt-1">{supportingMediaPreviews.length} file(s) uploaded • Max 5 total</p>
                              </>
                            ) : (
                              <>
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">Click to upload images/videos</p>
                                <p className="text-xs text-gray-400 mt-1">Multiple files allowed (max 5)</p>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-100">
                          <div className="flex flex-col items-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Maximum files uploaded (5/5)</p>
                            <p className="text-xs text-gray-500 mt-1">Delete files above to upload different ones</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Writing Tips Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-600 text-lg">💡</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Writing Tips</h4>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Be authentic and honest in your storytelling</li>
                            <li>• Include specific details and personal touches</li>
                            <li>• Explain the urgency and impact of donations</li>
                            <li>• Add photos that emotionally connect with readers</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Verification */}
                {activeStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Documents</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Government ID Upload <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#7DD9A6] transition-colors">
                        <input
                          {...register("governmentId", { 
                            required: !governmentIdPreview ? "Government ID is required" : false 
                          })}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id="governmentId"
                          onChange={(e) => handleDocumentSelection(e, 'governmentId')}
                        />
                        <label htmlFor="governmentId" className="cursor-pointer flex flex-col items-center">
                          {governmentIdPreview ? (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                                <span>Government ID Uploaded</span>
                              </div>
                              {governmentIdPreview !== 'PDF_FILE' && governmentIdPreview !== 'PDF_UPLOADED' && (
                                <div className="mt-2 w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                                  <img src={governmentIdPreview} alt="Government ID preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">Click to change document</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">Upload Aadhaar, PAN, or Passport</p>
                              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                            </>
                          )}
                        </label>
                      </div>
                      {errors.governmentId && !governmentIdPreview && <p className="text-red-500 text-xs mt-1">{errors.governmentId.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof of Need Document (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#7DD9A6] transition-colors">
                        <input
                          {...register("proofOfNeed")}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id="proofOfNeed"
                          onChange={(e) => handleDocumentSelection(e, 'proofOfNeed')}
                        />
                        <label htmlFor="proofOfNeed" className="cursor-pointer flex flex-col items-center">
                          {proofOfNeedPreview ? (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                                <span>Proof Document Uploaded</span>
                              </div>
                              {proofOfNeedPreview !== 'PDF_FILE' && proofOfNeedPreview !== 'PDF_UPLOADED' && (
                                <div className="mt-2 w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                                  <img src={proofOfNeedPreview} alt="Proof of need preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">Click to change document</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">Medical bills, certificates, letters, etc.</p>
                              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                            </>
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Uploading proof documents increases trust and campaign success rate</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          {...register("confirmCheckbox", { required: "You must confirm the accuracy of information" })}
                          type="checkbox"
                          className="mt-1 h-5 w-5 text-[#7DD9A6] border-gray-300 rounded focus:ring-[#7DD9A6]"
                          id="confirmCheckbox"
                        />
                        <label htmlFor="confirmCheckbox" className="text-sm text-gray-700">
                          I confirm that all information provided is accurate and truthful. I understand that providing false information may result in campaign suspension. <span className="text-red-500">*</span>
                        </label>
                      </div>
                      {errors.confirmCheckbox && <p className="text-red-500 text-xs mt-2 ml-8">{errors.confirmCheckbox.message}</p>}
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Trust Score</span>
                        <span className="text-2xl font-bold text-[#7DD9A6]">{trustScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${trustScore >= 80 ? "bg-green-500" : trustScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${trustScore}%` }}
                        ></div>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${(governmentId && governmentId.length > 0) || governmentIdPreview ? "text-green-500" : "text-gray-300"}`} />
                          <span>Government ID (+50%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${(proofOfNeed && proofOfNeed.length > 0) || proofOfNeedPreview ? "text-green-500" : "text-gray-300"}`} />
                          <span>Proof of Need (+30%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${confirmCheckbox ? "text-green-500" : "text-gray-300"}`} />
                          <span>Confirmation (+20%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Settings */}
                {activeStep === 4 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Step 4: Settings</h2>
                      <p className="text-sm text-gray-600 mt-1">Configure details below to continue</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Display Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <div className="mt-0.5">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-800">Display Raised Amount Publicly</label>
                              <p className="text-xs text-gray-500 mt-0.5">Show donation progress to visitors</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input {...register("displayRaisedAmount")} type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#7DD9A6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DD9A6]"></div>
                          </label>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <div className="mt-0.5">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-800">Allow Anonymous Donations</label>
                              <p className="text-xs text-gray-500 mt-0.5">Let users hide their names if they wish</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input {...register("allowAnonymous")} type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#7DD9A6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DD9A6]"></div>
                          </label>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <div className="mt-0.5">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-800">Enable Comments & Updates</label>
                              <p className="text-xs text-gray-500 mt-0.5">Allow supporters to comment and receive updates</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input {...register("enableComments")} type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#7DD9A6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DD9A6]"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Donation Amount (₹)
                      </label>
                      <input
                        {...register("minimumDonation", {
                          required: "Minimum donation amount is required",
                          min: { value: 10, message: "Minimum amount must be at least ₹10" },
                        })}
                        type="number"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: ₹100</p>
                      {errors.minimumDonation && <p className="text-red-500 text-xs mt-1">{errors.minimumDonation.message}</p>}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Bank Account / Payment Details</h3>
                      <p className="text-xs text-gray-500 mb-3">Provide account where funds will be sent (encrypted & secure)</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Holder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("accountHolder", { required: "Account holder name is required" })}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="John Doe"
                          />
                          {errors.accountHolder && <p className="text-red-500 text-xs mt-1">{errors.accountHolder.message}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("accountNumber", { required: "Account number is required" })}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="XXXXXXXXX7890"
                          />
                          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("ifscCode", {
                              required: "IFSC code is required",
                              pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Invalid IFSC code format" },
                            })}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="SBIN0001234"
                          />
                          {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UPI ID (Optional)
                          </label>
                          <input
                            {...register("upiId")}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="yourname@bank"
                          />
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs text-yellow-800">⚠️ This information is only visible to administrators</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                      <div className="space-y-3">
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${watchedFields.paymentMethod === "manual" ? "border-[#7DD9A6] bg-[#7DD9A6]/5" : "border-gray-200 hover:border-gray-300"}`}>
                          <input {...register("paymentMethod")} type="radio" value="manual" className="w-4 h-4 text-[#7DD9A6] border-gray-300 focus:ring-[#7DD9A6]" />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-800">Manual Approval</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Funds transferred upon admin review (recommended)</p>
                          </div>
                        </label>
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${watchedFields.paymentMethod === "auto" ? "border-[#7DD9A6] bg-[#7DD9A6]/5" : "border-gray-200 hover:border-gray-300"}`}>
                          <input {...register("paymentMethod")} type="radio" value="auto" className="w-4 h-4 text-[#7DD9A6] border-gray-300 focus:ring-[#7DD9A6]" />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-800">Auto Withdrawal</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Automatic transfer to your account (requires verification)</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Visibility & Engagement</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Social Share Message
                          </label>
                          <textarea
                            {...register("socialShareMessage", { required: "Social share message is required" })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all resize-none text-sm"
                            rows={3}
                            placeholder="Help support this cause! Every contribution matters..."
                          />
                          {errors.socialShareMessage && <p className="text-red-500 text-xs mt-1">{errors.socialShareMessage.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hashtags / Tags
                          </label>
                          <input
                            {...register("hashtags")}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="#Education #ClimateAction #CommunitySupport"
                          />
                          <p className="text-xs text-gray-500 mt-1">Helps categorize and discover your campaign</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location (Optional)
                          </label>
                          <input
                            {...register("location")}
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD9A6] focus:border-transparent focus:bg-white transition-all text-sm"
                            placeholder="Mumbai, Maharashtra"
                          />
                          <p className="text-xs text-gray-500 mt-1">City or area where the cause is located</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {activeStep === 5 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Step 5: Review</h2>
                      <p className="text-sm text-gray-600 mt-1">Review your campaign details</p>
                    </div>

                    {/* Campaign Completion Progress */}
                    <div className="bg-[#E8F5A5] border border-[#D4E7B8] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Campaign Completion</h3>
                        <span className="text-sm font-semibold text-gray-700">
                          {(() => {
                            const totalFields = 13;
                            const filledFields = [
                              title, watchedFields.category, watchedFields.goalAmount, watchedFields.endDate, coverImagePreview,
                              shortDescription, whyRaising, whoBenefits, howFundsUsed,
                              watchedFields.accountHolder, watchedFields.accountNumber,
                              governmentIdPreview, confirmCheckbox
                            ].filter(f => f && (typeof f === 'boolean' ? f : (typeof f === 'string' ? f.trim() : true))).length;
                            return `${filledFields}/${totalFields}`;
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#7DD9A6] h-full transition-all duration-500"
                          style={{ 
                            width: `${(() => {
                              const totalFields = 13;
                              const filledFields = [
                                title, watchedFields.category, watchedFields.goalAmount, watchedFields.endDate, coverImagePreview,
                                shortDescription, whyRaising, whoBenefits, howFundsUsed,
                                watchedFields.accountHolder, watchedFields.accountNumber,
                                governmentIdPreview, confirmCheckbox
                              ].filter(f => f && (typeof f === 'boolean' ? f : (typeof f === 'string' ? f.trim() : true))).length;
                              return Math.round((filledFields / totalFields) * 100);
                            })()}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Complete {(() => {
                          const totalFields = 13;
                          const filledFields = [
                            title, watchedFields.category, watchedFields.goalAmount, watchedFields.endDate, coverImagePreview,
                            shortDescription, whyRaising, whoBenefits, howFundsUsed,
                            watchedFields.accountHolder, watchedFields.accountNumber,
                            governmentIdPreview, confirmCheckbox
                          ].filter(f => f && (typeof f === 'boolean' ? f : (typeof f === 'string' ? f.trim() : true))).length;
                          return totalFields - filledFields;
                        })()} more required field(s) to publish.
                      </p>
                    </div>

                    {/* Required Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Required Fields</h3>
                      <div className="space-y-2">
                        {[
                          { label: "Title", value: title },
                          { label: "Category", value: watchedFields.category },
                          { label: "Goal Amount", value: watchedFields.goalAmount },
                          { label: "End Date", value: watchedFields.endDate },
                          { label: "Cover Image", value: coverImagePreview },
                          { label: "Short Description", value: shortDescription },
                          { label: "Full Story (Why Raising)", value: whyRaising },
                          { label: "Beneficiary (Who Benefits)", value: whoBenefits },
                          { label: "Funds Usage (How Used)", value: howFundsUsed },
                          { label: "Account Holder Name", value: watchedFields.accountHolder },
                          { label: "Account Number", value: watchedFields.accountNumber },
                          { label: "Government ID", value: governmentIdPreview },
                          { label: "Consent Confirmation", value: confirmCheckbox },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                {item.value ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#7DD9A6]"></div>
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                            <span className={`text-xs font-medium ${item.value ? "text-[#6BC794]" : "text-red-600"}`}>
                              {item.value ? "✓" : "Missing"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optional (Boosts Trust) */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Optional (Boosts Trust)</h3>
                      <div className="space-y-2">
                        {[
                          { label: "Supporting Media", value: supportingMediaPreviews.length > 0 },
                          { label: "Proof of Need Document", value: proofOfNeedPreview },
                          { label: "IFSC Code", value: watchedFields.ifscCode },
                          { label: "UPI ID", value: watchedFields.upiId },
                          { label: "Location", value: watchedFields.location },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                {item.value ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#7DD9A6]"></div>
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {item.value ? "Added" : "Recommended"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Campaign Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Campaign Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">{title || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-800">{watchedFields.category || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goal:</span>
                          <span className="font-medium text-gray-800">{watchedFields.goalAmount ? `₹${watchedFields.goalAmount}` : "₹0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Holder:</span>
                          <span className="font-medium text-gray-800">{watchedFields.accountHolder || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-gray-800">Individual</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Donation:</span>
                          <span className="font-medium text-gray-800">{watchedFields.minimumDonation ? `₹${watchedFields.minimumDonation}` : "₹10"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Required Notice */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Action Required</p>
                          <p className="text-xs text-orange-700 mt-1">
                            Please complete all required fields before submitting. Use the "Previous" button to go back and fill in missing information.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full px-8 py-3.5 bg-[#7DD9A6] text-white font-semibold rounded-lg hover:bg-[#6BC794] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Creating Campaign...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>{submitButtonText}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
                  {activeStep > 1 && (
                    <button 
                      type="button" 
                      onClick={handlePrevious} 
                      className="px-5 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-all text-sm flex items-center space-x-2"
                    >
                      <span>←</span>
                      <span>Previous</span>
                    </button>
                  )}
                  
                  {activeStep < 5 ? (
                    <button 
                      type="button" 
                      onClick={handleNext} 
                      className="ml-auto px-6 py-2.5 bg-[#7DD9A6] text-white font-medium rounded-lg hover:bg-[#6BC794] transition-all shadow-sm hover:shadow-md text-sm"
                    >
                      Next Step →
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

          {/* Preview Section */}
          <div className="bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] rounded-2xl shadow-lg overflow-hidden sticky top-8 self-start max-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="bg-[#7DD9A6] p-6">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">Live Preview</h3>
              </div>
              <p className="text-sm text-white/90">{previewText}</p>
            </div>

            {/* Preview Card */}
            <div className="bg-white p-6 w-full">
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                {/* Cover Image */}
                <div className="h-64 bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] relative overflow-hidden flex items-center justify-center">
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Cover image preview</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h4 className="text-xl font-semibold text-gray-800">
                    {watchedFields.title || defaultTitlePlaceholder}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600">
                    {watchedFields.shortDescription || "Your catchy tagline will appear here"}
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Raised</p>
                        <p className="text-lg font-semibold text-gray-800">₹0</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 mb-1">Goal</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ₹{watchedFields.goalAmount ? watchedFields.goalAmount.toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                    </div>

                    <p className="text-xs text-gray-500">0% funded</p>
                  </div>

                  {/* Donate Button */}
                  <button className="w-full bg-[#7DD9A6] text-white py-3 rounded-lg font-medium hover:bg-[#6BC794] transition-colors">
                    Donate Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Confirmation Modal */}
      {showBackConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{leaveConfirmTitle}</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to leave this page?
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Your progress has been auto-saved and will be available when you return.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelBack}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Stay Here
              </button>
              <button
                onClick={confirmBack}
                className="flex-1 px-4 py-2.5 bg-[#7DD9A6] text-white font-medium rounded-lg hover:bg-[#6BC794] transition-colors text-sm"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Confirmation Modal */}
      {showDocumentConfirmation && pendingDocument && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Document Upload</h3>
                <p className="text-sm text-gray-600">
                  {pendingDocument.type === 'governmentId' 
                    ? "Upload Government ID Document" 
                    : "Upload Proof of Need Document"}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to upload this document? Please verify the document is correct before confirming.
              </p>
              
              {/* Document Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                {pendingDocument.preview === 'PDF_FILE' ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 font-medium">PDF Document</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingDocument.file.name}</p>
                    <p className="text-xs text-gray-500">Size: {(pendingDocument.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <img 
                      src={pendingDocument.preview} 
                      alt="Document preview" 
                      className="w-full h-64 object-contain rounded-lg bg-white"
                    />
                    <div className="text-center">
                      <p className="text-xs text-gray-600">{pendingDocument.file.name}</p>
                      <p className="text-xs text-gray-500">Size: {(pendingDocument.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Ensure the document is clear, complete, and contains all necessary information. 
                  {pendingDocument.type === 'governmentId' && " Make sure your ID is valid and not expired."}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDocumentUpload}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDocumentUpload}
                className="flex-1 px-4 py-2.5 bg-[#7DD9A6] text-white font-medium rounded-lg hover:bg-[#6BC794] transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Confirm Upload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with Suspense boundary
const AddEventPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-[#7DD9A6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    }>
      <AddEventForm />
    </Suspense>
  );
};

export default AddEventPage;