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
  DollarSign,
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
  const source = searchParams.get('source') || 'fundraiser'; // Default to fundraiser
  
  // Determine if this is a fundraiser or donation event based on source
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

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        const savedImages = localStorage.getItem(IMAGES_STORAGE_KEY);
        
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          
          // Check if draft has meaningful data (not just defaults and _savedAt)
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
          
          // Only restore if there's meaningful data
          if (meaningfulKeys.length > 0) {
            // Restore form fields (excluding FileList fields)
            Object.keys(draftData).forEach((key) => {
              if (key !== 'coverImage' && key !== 'governmentId' && key !== 'proofOfNeed' && key !== 'supportingMedia') {
                setValue(key as any, draftData[key]);
              }
            });
            
            // Restore image previews
            if (savedImages) {
              const imageData = JSON.parse(savedImages);
              if (imageData.coverImage) setCoverImagePreview(imageData.coverImage);
              if (imageData.governmentId) setGovernmentIdPreview(imageData.governmentId);
              if (imageData.proofOfNeed) setProofOfNeedPreview(imageData.proofOfNeed);
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

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        // Check storage usage before saving
        clearStorageIfNeeded(0.8); // Clear if over 80% full
        
        const formData = { ...watchedFields, _savedAt: new Date().toISOString() };
        
        // Save form data (excluding FileList objects)
        const dataToSave: any = {};
        Object.keys(formData).forEach((key) => {
          const value = formData[key as keyof typeof formData];
          if (!(value instanceof FileList)) {
            dataToSave[key] = value;
          }
        });
        
        // Save form data
        const formDataStr = JSON.stringify(dataToSave);
        localStorage.setItem(STORAGE_KEY, formDataStr);
        
        // Save image previews separately (compressed)
        const imageData = {
          coverImage: coverImagePreview,
          governmentId: governmentIdPreview,
          proofOfNeed: proofOfNeedPreview === 'PDF_UPLOADED' ? 'PDF_UPLOADED' : proofOfNeedPreview,
        };
        
        try {
          const imageDataStr = JSON.stringify(imageData);
          localStorage.setItem(IMAGES_STORAGE_KEY, imageDataStr);
          setLastSaved(new Date());
          
          // Update storage usage display
          const usage = getStorageUsage();
          setStorageUsage({ usedMB: usage.usedMB, totalMB: usage.totalMB });
        } catch (imageError) {
          if (imageError instanceof DOMException && imageError.name === 'QuotaExceededError') {
            console.warn('Image storage quota exceeded, skipping image save but keeping form data');
            // Try saving without images
            localStorage.removeItem(IMAGES_STORAGE_KEY);
            toast.warning('Draft saved, but image previews too large. Images will need to be re-uploaded.', {
              autoClose: 3000
            });
            setLastSaved(new Date());
          } else {
            throw imageError;
          }
        }
      } catch (error) {
        console.error("Error saving draft:", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error('Storage quota exceeded. Please clear some browser data or reduce image sizes.', {
            autoClose: 5000
          });
          // Show storage usage
          const usage = getStorageUsage();
          console.error(`Storage usage: ${usage.usedMB}MB / ${usage.totalMB}MB`);
        }
      }
    }, 1000); // Auto-save after 1 second of inactivity
    
    return () => clearTimeout(saveTimeout);
  }, [watchedFields, coverImagePreview, governmentIdPreview, proofOfNeedPreview]);

  React.useEffect(() => {
    let score = 0;
    // Check both file upload and preview (for restored drafts)
    if ((governmentId && governmentId.length > 0) || governmentIdPreview) score += 50;
    if ((proofOfNeed && proofOfNeed.length > 0) || proofOfNeedPreview) score += 30;
    if (confirmCheckbox) score += 20;
    setTrustScore(score);
  }, [governmentId, proofOfNeed, confirmCheckbox, governmentIdPreview, proofOfNeedPreview]);

  // Compress and preview cover image
  React.useEffect(() => {
    if (coverImage && coverImage[0]) {
      const file = coverImage[0];
      compressImage(file, 800, 600, 0.7)
        .then((compressedDataUrl) => {
          setCoverImagePreview(compressedDataUrl);
        })
        .catch((error) => {
          console.error('Error compressing cover image:', error);
          // Fallback to original if compression fails
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

  // Handle supporting media previews - append new files to existing ones (max 5)
  React.useEffect(() => {
    // Only process if we actually have files selected
    if (!supportingMedia || supportingMedia.length === 0) return;
    
    const newFiles = Array.from(supportingMedia);
    
    // Check if these are truly new files (not already in our state)
    const existingFileNames = supportingMediaFiles.map(f => f.name + f.size);
    const filesToAdd = newFiles.filter(file => 
      !existingFileNames.includes(file.name + file.size)
    );
    
    if (filesToAdd.length === 0) {
      // Clear the input even if no new files to add
      if (supportingMediaInputRef.current) {
        supportingMediaInputRef.current.value = "";
      }
      return;
    }
    
    // Check if adding new files would exceed the 5 file limit
    const currentCount = supportingMediaFiles.length;
    const availableSlots = 5 - currentCount;
    
    if (availableSlots <= 0) {
      toast.warning("Maximum 5 files allowed for supporting media");
      if (supportingMediaInputRef.current) {
        supportingMediaInputRef.current.value = "";
      }
      return;
    }
    
    // Only take files that fit within the limit
    const filesToProcess = filesToAdd.slice(0, availableSlots);
    
    if (filesToAdd.length > availableSlots) {
      toast.info(`Only ${availableSlots} more file(s) can be added (5 max total)`);
    }
    
    const loadPreviews = async () => {
      const newPreviews: string[] = [];
      
      for (const file of filesToProcess) {
        try {
          if (file.type.startsWith('image/')) {
            const compressed = await compressImage(file, 400, 300, 0.6);
            newPreviews.push(compressed);
          } else if (file.type.startsWith('video/')) {
            // For videos, just store a placeholder or file name
            newPreviews.push('VIDEO_FILE');
          }
        } catch (error) {
          console.error('Error processing supporting media:', error);
          // Fallback to file reader
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
      
      // Append new files and previews to existing ones
      setSupportingMediaFiles(prev => [...prev, ...filesToProcess]);
      setSupportingMediaPreviews(prev => [...prev, ...newPreviews]);
    };
    
    loadPreviews();
  }, [supportingMedia]);

  // Handle deletion of supporting media
  const handleDeleteSupportingMedia = (index: number) => {
    // Remove from state arrays
    const newFiles = supportingMediaFiles.filter((_, i) => i !== index);
    const newPreviews = supportingMediaPreviews.filter((_, i) => i !== index);
    
    setSupportingMediaFiles(newFiles);
    setSupportingMediaPreviews(newPreviews);
    
    // Clear the file input to prevent re-adding deleted files
    if (supportingMediaInputRef.current) {
      supportingMediaInputRef.current.value = "";
    }
    
    toast.success("Image removed successfully");
  };

  // Handle document selection with confirmation
  const handleDocumentSelection = async (e: React.ChangeEvent<HTMLInputElement>, type: 'governmentId' | 'proofOfNeed') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate preview
    let preview: string;
    if (file.type.startsWith('image/')) {
      try {
        preview = await compressImage(file, 600, 800, 0.6);
      } catch (error) {
        // Fallback to original
        preview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    } else {
      // For PDFs, create a placeholder
      preview = 'PDF_FILE';
    }

    // Store pending document and show confirmation
    setPendingDocument({ file, preview, type });
    setShowDocumentConfirmation(true);

    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  // Confirm document upload
  const confirmDocumentUpload = () => {
    if (!pendingDocument) return;

    const { file, preview, type } = pendingDocument;

    // Create a DataTransfer object to hold the file (needed for React Hook Form FileList)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileList = dataTransfer.files;

    // Set the file in React Hook Form
    setValue(type, fileList, { shouldValidate: true });

    // Set the appropriate preview
    if (type === 'governmentId') {
      setGovernmentIdPreview(preview);
    } else {
      setProofOfNeedPreview(preview);
    }

    // Close dialog
    setShowDocumentConfirmation(false);
    setPendingDocument(null);
    
    toast.success(`${type === 'governmentId' ? 'Government ID' : 'Proof of Need'} uploaded successfully!`);
  };

  // Cancel document upload
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
      
      // Add customCategory validation if "Other" is selected
      if (selectedCategory === "Other") {
        fieldsToValidate.push("customCategory");
      }
      
      // Check cover image: either file is uploaded or preview exists
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
      // Scroll to top of the form section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Header back button - always exits the form
  const handleBack = () => {
    setShowBackConfirmation(true);
  };

  // Form previous button - navigates to previous step
  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
    // Scroll to top of the form section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmBack = () => {
    // Always navigate away from the form
    window.history.back();
    setShowBackConfirmation(false);
  };

  const cancelBack = () => {
    setShowBackConfirmation(false);
  };

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      formData.append('title', data.title);
      formData.append('category', data.category);
      // Store custom category separately if "Other" is selected
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
      
      // Add UPI ID if provided
      if (data.upiId) {
        formData.append('upiId', data.upiId);
      }
      
      // Calculate trust score
      let calculatedTrustScore = 0;
      if (data.governmentId && data.governmentId.length > 0) calculatedTrustScore += 50;
      if (data.proofOfNeed && data.proofOfNeed.length > 0) calculatedTrustScore += 30;
      if (data.confirmCheckbox) calculatedTrustScore += 20;
      formData.append('trustScore', calculatedTrustScore.toString());
      
      // Add bank details
      if (data.accountNumber) {
        formData.append('bankAccount[accountNumber]', data.accountNumber);
        formData.append('bankAccount[ifsc]', data.ifscCode);
        formData.append('bankAccount[accountHolder]', data.accountHolder);
      }
      
      // Use supportingMediaFiles array instead of form FileList
      if (supportingMediaFiles.length > 0) {
        supportingMediaFiles.forEach(file => {
          formData.append('supportingMedia', file);
        });
      }
      
      await addEvent(formData as any);
      
      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      
      toast.success("Donation campaign created successfully!");
      
      // Reset form state
      reset();
      setActiveStep(1);
      setCoverImagePreview(null);
      setGovernmentIdPreview(null);
      setProofOfNeedPreview(null);
      setSupportingMediaFiles([]);
      setSupportingMediaPreviews([]);
      setLastSaved(null);
      
      // Redirect to donation events page after 1.5 seconds
      setTimeout(() => {
        router.push('/donate');
      }, 1500);
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || "Failed to create campaign");
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
      toast.info("Draft cleared successfully!");
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

      {/* Main Content - Form content goes here (truncated for brevity) */}
      {/* ... Rest of the JSX from the original component ... */}
      
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

// Main component with Suspense wrapper
const AddEventPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#7DD9A6] mx-auto mb-4" />
          <p className="text-gray-600">Loading donation form...</p>
        </div>
      </div>
    }>
      <AddEventForm />
    </Suspense>
  );
};

export default AddEventPage;