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
  Trash2,
  AlertCircle,
  RefreshCw,
  FileCheck,
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

// Form component that uses useSearchParams
function DonationEventForm() {
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
        
        const imageData = {
          coverImage: coverImagePreview,
          governmentId: governmentIdPreview,
          proofOfNeed: proofOfNeedPreview === 'PDF_UPLOADED' ? 'PDF_UPLOADED' : proofOfNeedPreview,
        };
        
        try {
          const imageDataStr = JSON.stringify(imageData);
          localStorage.setItem(IMAGES_STORAGE_KEY, imageDataStr);
          setLastSaved(new Date());
        } catch (imageError) {
          if (imageError instanceof DOMException && imageError.name === 'QuotaExceededError') {
            localStorage.removeItem(IMAGES_STORAGE_KEY);
            toast.warning('Draft saved, but image previews too large.', { autoClose: 3000 });
            setLastSaved(new Date());
          }
        }
      } catch (error) {
        console.error("Error saving draft:", error);
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
      toast.warning("Maximum 5 files allowed");
      if (supportingMediaInputRef.current) {
        supportingMediaInputRef.current.value = "";
      }
      return;
    }
    
    const filesToProcess = filesToAdd.slice(0, availableSlots);
    
    const loadPreviews = async () => {
      const newPreviews: string[] = [];
      
      for (const file of filesToProcess) {
        try {
          if (file.type.startsWith('image/')) {
            const compressed = await compressImage(file, 400, 300, 0.6);
            newPreviews.push(compressed);
          } else {
            newPreviews.push('VIDEO_FILE');
          }
        } catch (error) {
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
    
    toast.success("Image removed");
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
    toast.success(`Document uploaded!`);
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
      
      if (supportingMediaFiles.length > 0) {
        supportingMediaFiles.forEach(file => {
          formData.append('supportingMedia', file);
        });
      }
      
      await addEvent(formData as any);
      
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGES_STORAGE_KEY);
      
      toast.success("Campaign created successfully!");
      
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
      toast.error(err.response?.data?.message || "Failed to create campaign");
    }
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
                className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-white/50 transition-all text-sm flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            </div>
            <div className="text-center flex-1">
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

      {/* Main Content - Form continues but truncated for length */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <p className="text-center text-gray-600">Form content continues here...</p>
      </div>

      {/* Modals */}
      {showBackConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{leaveConfirmTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">Your progress has been auto-saved.</p>
            <div className="flex space-x-3">
              <button onClick={cancelBack} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Stay</button>
              <button onClick={confirmBack} className="flex-1 px-4 py-2 bg-[#7DD9A6] text-white rounded-lg">Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense wrapper
export default function AddEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7DD9A6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    }>
      <DonationEventForm />
    </Suspense>
  );
}