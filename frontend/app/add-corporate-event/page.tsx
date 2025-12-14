"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, MapPin, Users, Upload, X, CheckCircle, 
  IndianRupee, AlertCircle, Save, Trash2, RefreshCw,
  Briefcase, Building2, Target, TrendingUp, Image as ImageIcon,
  FileText, Activity
} from "lucide-react";
import Image from "next/image";
import { useNGO } from "@/contexts/ngo-context";
import api from "@/lib/api";
import { indianStatesData } from "@/lib/locationData";

// Types for the form
interface ExpectedImpact {
  beneficiaries?: number;
  directImpact?: string;
  longTermOutcome?: string;
}

interface Timeline {
  startDate: string;
  endDate: string;
}

interface VolunteerDetails {
  volunteersNeeded: number;
  skillsRequired: string[];
  timeCommitmentHours: number;
}

interface BudgetBreakdown {
  category: string;
  amount: number;
}

interface Budget {
  totalAmount: number;
  breakdown: BudgetBreakdown[];
}

interface LegalCompliance {
  registrationNumber: string;
  has12A: boolean;
  has80G: boolean;
  hasFCRA?: boolean;
}

interface ContactPerson {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

interface CoverImage {
  url: string;
  publicId: string;
}

interface Location {
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  googleMapLocation?: string;
}

interface CSROpportunityFormValues {
  // Step 1: Basic Info
  title: string;
  opportunityType: string;
  csrModes: string[];
  location: Location;
  coverImage?: CoverImage;
  
  // Step 2: Project Details
  problemStatement: string;
  proposedSolution: string;
  expectedImpact?: ExpectedImpact;
  timeline: Timeline;
  mediaUploads?: File[];
  
  // Step 3: Participation
  participationRequired: string[];
  volunteerDetails?: VolunteerDetails;
  budget: Budget;
  ngoContribution?: string;
  
  // Step 4: CSR Goals & Compliance
  csrActAlignment: string[];
  sdgMapping?: string[];
  reportingDocuments: string[];
  legalCompliance: LegalCompliance;
  
  // Step 5: Review & Publish
  contactPerson?: ContactPerson;
  termsAccepted: boolean;
}

const opportunityTypes = [
  "Infrastructure Development",
  "Education",
  "Health & Sanitation",
  "Environment",
  "Skill Development",
  "Women Empowerment",
  "Rural Development",
  "Other"
];

const csrModeOptions = [
  "Employee Volunteering",
  "Financial Sponsorship",
  "Material Donation",
  "Skill-based Volunteering",
  "Long-term Partnership"
];

const participationOptions = [
  "Funds",
  "Employees",
  "Skilled Professionals",
  "Materials"
];

const csrActOptions = [
  "Education",
  "Rural Development",
  "Health & Sanitation",
  "Environmental Sustainability",
  "Skill Development"
];

const sdgOptions = [
  "SDG 1 – No Poverty",
  "SDG 2 – Zero Hunger",
  "SDG 3 – Good Health & Well-being",
  "SDG 4 – Quality Education",
  "SDG 5 – Gender Equality",
  "SDG 6 – Clean Water & Sanitation",
  "SDG 7 – Affordable & Clean Energy",
  "SDG 8 – Decent Work & Economic Growth",
  "SDG 10 – Reduced Inequalities",
  "SDG 11 – Sustainable Cities",
  "SDG 13 – Climate Action"
];

const reportingOptions = [
  "Utilization Certificate",
  "Impact Report",
  "Photographic Evidence",
  "Completion Certificate"
];

const skillOptions = [
  "Teaching/Training",
  "Medical/Healthcare",
  "Construction/Engineering",
  "IT/Technology",
  "Management/Administration",
  "Legal/Compliance",
  "Marketing/Communications",
  "Finance/Accounting",
  "Design/Creative",
  "Social Work",
  "Other"
];

// Budget Breakdown Table Component
const BudgetBreakdownTable: React.FC = () => {
  const [rows, setRows] = useState<{category: string, amount: string}[]>([
    { category: "", amount: "" }
  ]);

  const addRow = () => {
    if (rows.length < 10) {
      setRows([...rows, { category: "", amount: "" }]);
    }
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index: number, field: 'category' | 'amount', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const total = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 px-2">
        <div className="col-span-6">Category</div>
        <div className="col-span-4">Amount (₹)</div>
        <div className="col-span-2"></div>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-center">
          <input
            type="text"
            value={row.category}
            onChange={(e) => updateRow(index, 'category', e.target.value)}
            className="col-span-6 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            placeholder="e.g., Materials"
          />
          <input
            type="number"
            value={row.amount}
            onChange={(e) => updateRow(index, 'amount', e.target.value)}
            className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            placeholder="0"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="col-span-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
            disabled={rows.length === 1}
          >
            <X className="h-4 w-4 mx-auto" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= 10}
          className="text-xs text-[#8B5CF6] hover:text-[#7C3AED] font-medium disabled:opacity-50"
        >
          + Add Row
        </button>
        {total > 0 && (
          <span className="text-sm font-medium text-gray-700">
            Subtotal: ₹{total.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

const CreateCSROpportunityForm: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{url: string, type: string, name: string}[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const STORAGE_KEY = "csrOpportunityFormDraft";

  const steps = [
    { number: 1, name: "Basic Info" },
    { number: 2, name: "Project Details" },
    { number: 3, name: "Participation" },
    { number: 4, name: "CSR Goals" },
    { number: 5, name: "Review" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
    getValues,
  } = useForm<CSROpportunityFormValues>({
    mode: "onChange",
    defaultValues: {
      csrModes: [],
      participationRequired: [],
      csrActAlignment: [],
      sdgMapping: [],
      reportingDocuments: [],
      budget: {
        totalAmount: 0,
        breakdown: []
      },
      expectedImpact: {
        beneficiaries: undefined,
        directImpact: "",
        longTermOutcome: ""
      },
      volunteerDetails: {
        volunteersNeeded: 0,
        skillsRequired: [],
        timeCommitmentHours: 0
      },
      legalCompliance: {
        registrationNumber: "",
        has12A: false,
        has80G: false,
        hasFCRA: false
      },
      contactPerson: {
        name: "",
        role: "",
        email: "",
        phone: ""
      },
      termsAccepted: false,
      location: {
        country: "India",
        state: "",
        district: "",
        city: "",
        pincode: "",
        googleMapLocation: ""
      }
    },
  });

  const watchedFields = watch();
  const selectedCsrModes = watch("csrModes") || [];
  const selectedParticipation = watch("participationRequired") || [];

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

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        
        // Handle old format where location was a string or had different structure
        if (draft.location) {
          if (typeof draft.location === 'string') {
            // Old string format - clear it
            delete draft.location;
          } else if (typeof draft.location === 'object') {
            // New object format - set state/district for UI
            if (draft.location.state) {
              setSelectedState(draft.location.state);
            }
            if (draft.location.district) {
              setSelectedDistrict(draft.location.district);
            }
          }
        }
        
        // Also check for old state/city fields at root level
        if (draft.state && typeof draft.state === 'string' && !draft.location) {
          delete draft.state;
        }
        if (draft.city && typeof draft.city === 'string' && !draft.location) {
          delete draft.city;
        }
        
        Object.keys(draft).forEach((key) => {
          if (key !== 'coverImage' && key !== 'mediaUploads') {
            setValue(key as keyof CSROpportunityFormValues, draft[key], { shouldDirty: true, shouldTouch: true });
          }
        });
        toast.info("Draft restored! Please re-select images if needed.", { autoClose: 3000, toastId: "draft-restored" });
      } catch (error) {
        console.error("Error loading draft:", error);
        // Clear corrupted draft
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [setValue]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      const formData = getValues();
      const dataToSave: Record<string, unknown> = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof CSROpportunityFormValues];
        if (!(value instanceof FileList) && !(value instanceof File)) {
          dataToSave[key] = value;
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      if (Object.keys(watchedFields).some(key => watchedFields[key as keyof typeof watchedFields])) {
        setLastSaved(new Date());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [watchedFields, getValues]);

  // Handle checkbox group changes
  const handleCheckboxGroupChange = (fieldName: keyof CSROpportunityFormValues, value: string, checked: boolean) => {
    const currentValues = (watch(fieldName) as string[]) || [];
    if (checked) {
      setValue(fieldName, [...currentValues, value] as never);
    } else {
      setValue(fieldName, currentValues.filter((v: string) => v !== value) as never);
    }
  };

  // Handle multi-select changes for skills
  const handleSkillsChange = (value: string, checked: boolean) => {
    const currentSkills = watch("volunteerDetails.skillsRequired") || [];
    if (checked) {
      setValue("volunteerDetails.skillsRequired", [...currentSkills, value]);
    } else {
      setValue("volunteerDetails.skillsRequired", currentSkills.filter(s => s !== value));
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB", { toastId: "cover-size" });
      return;
    }

    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (mediaFiles.length + newFiles.length >= 5) {
        toast.warning("Maximum 5 files allowed", { toastId: "max-files" });
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        toast.error(`${file.name} is not a valid file type. Only images and PDFs are allowed.`, { toastId: "invalid-file" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`, { toastId: "file-size" });
        return;
      }

      newFiles.push(file);
      
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, { url: reader.result as string, type: 'image', name: file.name }]);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreviews(prev => [...prev, { url: '', type: 'pdf', name: file.name }]);
      }
    });

    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Validation for steps
  const handleNext = async () => {
    if (activeStep === 1) {
      // Manually validate Step 1 fields - use getValues() for accurate values
      const formValues = getValues();
      const title = formValues.title;
      const opportunityType = formValues.opportunityType;
      const locationState = formValues.location?.state;
      const locationDistrict = formValues.location?.district;
      const locationCity = formValues.location?.city;
      const locationPincode = formValues.location?.pincode;
      
      if (!title || title.trim() === "") {
        toast.error("Please enter a title", { toastId: "title-required" });
        return;
      }
      
      if (!opportunityType) {
        toast.error("Please select an opportunity type", { toastId: "type-required" });
        return;
      }
      
      if (selectedCsrModes.length === 0) {
        toast.error("Please select at least one CSR Mode", { toastId: "csr-modes-required" });
        return;
      }
      
      if (!locationState) {
        toast.error("Please select a state", { toastId: "state-required" });
        return;
      }
      
      if (!locationDistrict || locationDistrict.trim() === "") {
        toast.error("Please enter a district", { toastId: "district-required" });
        return;
      }
      
      if (!locationCity) {
        toast.error("Please select a city", { toastId: "city-required" });
        return;
      }
      
      if (!locationPincode || !/^[1-9][0-9]{5}$/.test(locationPincode)) {
        toast.error("Please enter a valid 6-digit pincode", { toastId: "pincode-required" });
        return;
      }
      
      if (!coverImageFile && !coverImagePreview) {
        toast.error("Please upload a cover image", { toastId: "cover-required" });
        return;
      }
      
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    let fieldsToValidate: string[] = [];

    if (activeStep === 2) {
      fieldsToValidate = ["problemStatement", "proposedSolution", "timeline.startDate", "timeline.endDate"];
      
      const startDate = watch("timeline.startDate");
      const endDate = watch("timeline.endDate");
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        toast.error("End date must be after start date", { toastId: "timeline-error" });
        return;
      }
    } else if (activeStep === 3) {
      fieldsToValidate = ["budget.totalAmount"];
      
      if (selectedParticipation.length === 0) {
        toast.error("Please select at least one participation type", { toastId: "participation-required" });
        return;
      }
      
      if (selectedParticipation.includes("Employees")) {
        fieldsToValidate.push("volunteerDetails.volunteersNeeded", "volunteerDetails.timeCommitmentHours");
      }
    } else if (activeStep === 4) {
      fieldsToValidate = ["legalCompliance.registrationNumber"];
      
      if ((watch("csrActAlignment") || []).length === 0) {
        toast.error("Please select at least one CSR Act alignment", { toastId: "csr-act-required" });
        return;
      }
      
      if ((watch("reportingDocuments") || []).length === 0) {
        toast.error("Please select at least one reporting document type", { toastId: "reporting-required" });
        return;
      }
    } else if (activeStep === 5) {
      fieldsToValidate = ["termsAccepted"];
    }

    const result = await trigger(fieldsToValidate as (keyof CSROpportunityFormValues)[]);

    if (result) {
      if (activeStep < 5) {
        setActiveStep(activeStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Please fill in all required fields correctly", { toastId: "fields-required" });
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
      key => watchedFields[key as keyof typeof watchedFields]
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

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear the draft? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      reset();
      setMediaFiles([]);
      setMediaPreviews([]);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setActiveStep(1);
      setLastSaved(null);
      toast.info("Draft cleared successfully!", { toastId: "draft-cleared" });
    }
  };

  const onSubmit: SubmitHandler<CSROpportunityFormValues> = async (data) => {
    try {
      setIsSubmitting(true);

      // Upload cover image
      let coverImageData: CoverImage | undefined;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("image", coverImageFile);

        const response: { data: { url: string; publicId: string } } = await api.post("/v1/upload/single", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        });

        coverImageData = {
          url: response.data.url,
          publicId: response.data.publicId
        };
      }

      // Upload media files
      const uploadedMedia: { url: string; publicId: string; type: string }[] = [];
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append("image", file);

          const response: { data: { url: string; publicId: string } } = await api.post("/v1/upload/single", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
            },
          });

          uploadedMedia.push({
            url: response.data.url,
            publicId: response.data.publicId,
            type: file.type.startsWith('image/') ? 'image' : 'pdf'
          });
        }
      }

      const formattedData = {
        ...data,
        coverImage: coverImageData,
        mediaUploads: uploadedMedia,
        timeline: {
          startDate: new Date(data.timeline.startDate).toISOString(),
          endDate: new Date(data.timeline.endDate).toISOString()
        }
      };

      await api.post("/v1/corporate-events", formattedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      
      localStorage.removeItem(STORAGE_KEY);
      
      toast.success("CSR Opportunity created successfully!", { toastId: "event-created" });
      
      setTimeout(() => {
        toast.info("Your opportunity has been sent to admin for approval.", { 
          toastId: "admin-approval-info",
          autoClose: 6000 
        });
      }, 500);
      
      reset();
      setActiveStep(1);
      setMediaFiles([]);
      setMediaPreviews([]);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setLastSaved(null);
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: unknown) {
      console.error('Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create CSR opportunity";
      toast.error(errorMessage, { toastId: "create-event-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5FF] via-[#FFFFFF] to-[#D4BBF7]">
      {/* Leave Confirmation Dialog */}
      {showBackConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Leave CSR Opportunity Creation?
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
                className="flex-1 px-4 py-2.5 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] font-medium transition-all"
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
              <h1 className="text-xl font-semibold text-gray-700">Create CSR Opportunity</h1>
              <p className="text-sm text-gray-600 mt-1">Partner with corporates for impactful CSR initiatives</p>
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
                      ? "bg-[#8B5CF6] text-white shadow-md"
                      : activeStep > step.number
                      ? "bg-[#8B5CF6] text-white"
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
                    activeStep > step.number ? "bg-[#8B5CF6]" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
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
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#8B5CF6]" />
                        Step 1: Basic Info
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Provide basic details about your CSR opportunity</p>
                    </div>

                    <div className="space-y-5">
                      {/* Opportunity Title */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Opportunity Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("title", {
                            required: "Opportunity title is required",
                            maxLength: { value: 80, message: "Title cannot exceed 80 characters" }
                          })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                          placeholder="Rural Government School Renovation – Nashik"
                          maxLength={80}
                        />
                        <div className="flex justify-between mt-1">
                          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                          <p className="text-xs text-gray-500 ml-auto">{watch("title")?.length || 0}/80</p>
                        </div>
                      </div>

                      {/* Cover Image */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Cover Image <span className="text-red-500">*</span>
                        </label>
                        {coverImagePreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={coverImagePreview}
                              alt="Cover preview"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#8B5CF6] transition-all bg-gray-50">
                            <div className="flex flex-col items-center justify-center py-6">
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="text-sm text-gray-600 font-medium">Click to upload cover image</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              onChange={handleCoverImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        )}
                        {!coverImagePreview && !coverImageFile && (
                          <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Cover image is required to proceed
                          </p>
                        )}
                      </div>

                      {/* Opportunity Type */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Opportunity Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("opportunityType", { required: "Opportunity type is required" })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm text-gray-600"
                        >
                          <option value="">Select opportunity type</option>
                          {opportunityTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.opportunityType && <p className="text-red-500 text-xs mt-1">{errors.opportunityType.message}</p>}
                      </div>

                      {/* CSR Modes - Checkbox Group */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          CSR Mode <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Select all applicable CSR modes for this opportunity</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {csrModeOptions.map((mode) => (
                            <label 
                              key={mode} 
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedCsrModes.includes(mode)
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCsrModes.includes(mode)}
                                onChange={(e) => handleCheckboxGroupChange("csrModes", mode, e.target.checked)}
                                className="w-4 h-4 text-[#8B5CF6] rounded border-gray-300 focus:ring-[#8B5CF6]"
                              />
                              <span className="text-sm text-gray-700">{mode}</span>
                            </label>
                          ))}
                        </div>
                        {selectedCsrModes.length === 0 && (
                          <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Please select at least one CSR mode
                          </p>
                        )}
                      </div>

                      {/* Location Section */}
                      <div className="space-y-4 border-t border-gray-200 pt-4">
                        <label className="text-sm font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                          Location Details
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Country Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register("location.country", { required: "Country is required" })}
                              defaultValue="India"
                              readOnly
                              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm cursor-not-allowed"
                            />
                          </div>

                          {/* State Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              State <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...register("location.state", { required: "State is required" })}
                              onChange={(e) => {
                                setSelectedState(e.target.value);
                                setValue("location.district", "");
                                setValue("location.city", "");
                                setSelectedDistrict("");
                              }}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm appearance-none"
                            >
                              <option value="">Select State</option>
                              {Object.keys(indianStatesData)
                                .sort()
                                .map((state) => (
                                  <option key={state} value={state}>
                                    {state}
                                  </option>
                                ))}
                            </select>
                            {errors.location?.state && <p className="text-red-500 text-xs mt-1">{errors.location.state.message}</p>}
                          </div>

                          {/* District Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              District <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register("location.district", { required: "District is required" })}
                              disabled={!selectedState}
                              onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setValue("location.city", "");
                              }}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="Enter district name"
                            />
                            {errors.location?.district && <p className="text-red-500 text-xs mt-1">{errors.location.district.message}</p>}
                          </div>

                          {/* City Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              City <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...register("location.city", { required: "City is required" })}
                              disabled={!selectedState}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">Select City</option>
                              {selectedState &&
                                indianStatesData[selectedState]?.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                            </select>
                            {errors.location?.city && <p className="text-red-500 text-xs mt-1">{errors.location.city.message}</p>}
                          </div>

                          {/* Pincode Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register("location.pincode", { 
                                required: "Pincode is required",
                                pattern: { 
                                  value: /^[1-9][0-9]{5}$/, 
                                  message: "Invalid pincode format" 
                                },
                                minLength: { value: 6, message: "Pincode must be 6 digits" },
                                maxLength: { value: 6, message: "Pincode must be 6 digits" }
                              })}
                              type="text"
                              maxLength={6}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="Enter 6-digit pincode"
                              onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                            {errors.location?.pincode && <p className="text-red-500 text-xs mt-1">{errors.location.pincode.message}</p>}
                          </div>

                          {/* Google Map Location - Optional */}
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Google Map Location <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                              {...register("location.googleMapLocation")}
                              type="url"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="Paste Google Maps link (e.g., https://maps.google.com/...)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Share a Google Maps link to help people find your exact location</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PART_4_PLACEHOLDER */}

                {/* Step 2: Project Details */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#8B5CF6]" />
                        Step 2: Project Details
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Describe the project, its impact, and timeline</p>
                    </div>

                    <div className="space-y-5">
                      {/* Problem Statement */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Problem Statement <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Describe the problem or need this project addresses</p>
                        <textarea
                          {...register("problemStatement", {
                            required: "Problem statement is required",
                            maxLength: { value: 500, message: "Problem statement cannot exceed 500 characters" }
                          })}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm resize-none"
                          placeholder="Example: The government school in Sinnar village has deteriorating infrastructure with broken windows, damaged roofs, and lack of basic sanitation facilities affecting 500+ students..."
                          maxLength={500}
                        />
                        <div className="flex justify-between mt-1">
                          {errors.problemStatement && <p className="text-red-500 text-xs">{errors.problemStatement.message}</p>}
                          <p className="text-xs text-gray-500 ml-auto">{watch("problemStatement")?.length || 0}/500</p>
                        </div>
                      </div>

                      {/* Proposed Solution */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Proposed Solution <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Describe your proposed solution and approach</p>
                        <textarea
                          {...register("proposedSolution", {
                            required: "Proposed solution is required",
                            minLength: { value: 50, message: "Please provide a detailed solution (min 50 characters)" }
                          })}
                          rows={5}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm resize-none"
                          placeholder="Example: We plan to renovate the school building including: 1) Roof repair and waterproofing 2) Window and door replacement 3) Construction of new toilets 4) Painting and beautification..."
                        />
                        {errors.proposedSolution && <p className="text-red-500 text-xs mt-1">{errors.proposedSolution.message}</p>}
                      </div>

                      {/* Expected Impact - OPTIONAL */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#8B5CF6]" />
                          Expected Impact <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Number of Beneficiaries</label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                {...register("expectedImpact.beneficiaries", { 
                                  valueAsNumber: true
                                })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                                placeholder="500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Direct Impact</label>
                            <input
                              {...register("expectedImpact.directImpact")}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                              placeholder="Improved learning environment for 500+ students"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Long-term Outcome</label>
                            <input
                              {...register("expectedImpact.longTermOutcome")}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                              placeholder="Increased attendance and improved academic performance"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Project Timeline */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                          Project Timeline <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Start Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              {...register("timeline.startDate", { required: "Start date is required" })}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                            />
                            {errors.timeline?.startDate && <p className="text-red-500 text-xs mt-1">{errors.timeline.startDate.message}</p>}
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">End Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              {...register("timeline.endDate", { required: "End date is required" })}
                              min={watch("timeline.startDate") || new Date().toISOString().split("T")[0]}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                            />
                            {errors.timeline?.endDate && <p className="text-red-500 text-xs mt-1">{errors.timeline.endDate.message}</p>}
                          </div>
                        </div>
                        {watch("timeline.startDate") && watch("timeline.endDate") && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration: {Math.ceil((new Date(watch("timeline.endDate")).getTime() - new Date(watch("timeline.startDate")).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        )}
                      </div>

                      {/* Supporting Media */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Supporting Media <span className="text-gray-400">(Optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Upload images or PDFs to support your proposal (max 5 files, 5MB each)</p>
                        
                        {mediaPreviews.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {mediaPreviews.map((preview, index) => (
                              <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                {preview.type === 'image' ? (
                                  <div className="h-24 relative">
                                    <Image
                                      src={preview.url}
                                      alt={`Preview ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-24 flex flex-col items-center justify-center p-2">
                                    <FileText className="w-8 h-8 text-red-500 mb-1" />
                                    <p className="text-xs text-gray-600 truncate w-full text-center">{preview.name}</p>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeMedia(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {mediaPreviews.length < 5 && (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#8B5CF6] transition-all bg-gray-50">
                            <div className="flex flex-col items-center justify-center py-4">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 font-medium">Click to upload files</p>
                              <p className="text-xs text-gray-500 mt-1">Images (PNG, JPG) or PDFs</p>
                            </div>
                            <input
                              type="file"
                              onChange={handleMediaUpload}
                              accept="image/*,application/pdf"
                              multiple
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Participation */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#8B5CF6]" />
                        Step 3: Participation
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Define corporate participation requirements and budget</p>
                    </div>

                    <div className="space-y-5">
                      {/* Corporate Participation Required */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Corporate Participation Required <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Select what kind of participation you need from corporates</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {participationOptions.map((option) => (
                            <label 
                              key={option} 
                              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedParticipation.includes(option)
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedParticipation.includes(option)}
                                onChange={(e) => handleCheckboxGroupChange("participationRequired", option, e.target.checked)}
                                className="w-4 h-4 text-[#8B5CF6] rounded border-gray-300 focus:ring-[#8B5CF6]"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                        {selectedParticipation.length === 0 && (
                          <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Please select at least one participation type
                          </p>
                        )}
                      </div>

                      {/* Volunteer Details - Conditional */}
                      {selectedParticipation.includes("Employees") && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Volunteer Details
                          </label>
                          <p className="text-xs text-gray-500 mb-4">Since you selected &quot;Employees&quot;, please provide volunteer requirements</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Volunteers Needed <span className="text-red-500">*</span></label>
                              <input
                                type="number"
                                {...register("volunteerDetails.volunteersNeeded", { 
                                  required: selectedParticipation.includes("Employees") ? "Number of volunteers is required" : false,
                                  min: { value: 1, message: "At least 1 volunteer required" },
                                  valueAsNumber: true
                                })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                                placeholder="20"
                              />
                              {errors.volunteerDetails?.volunteersNeeded && <p className="text-red-500 text-xs mt-1">{errors.volunteerDetails.volunteersNeeded.message}</p>}
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Time Commitment (Hours) <span className="text-red-500">*</span></label>
                              <input
                                type="number"
                                {...register("volunteerDetails.timeCommitmentHours", { 
                                  required: selectedParticipation.includes("Employees") ? "Time commitment is required" : false,
                                  min: { value: 1, message: "At least 1 hour required" },
                                  valueAsNumber: true
                                })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                                placeholder="8"
                              />
                              {errors.volunteerDetails?.timeCommitmentHours && <p className="text-red-500 text-xs mt-1">{errors.volunteerDetails.timeCommitmentHours.message}</p>}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="text-xs text-gray-600 mb-2 block">Skills Required <span className="text-gray-400">(Optional)</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {skillOptions.map((skill) => (
                                <label 
                                  key={skill} 
                                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                                    (watch("volunteerDetails.skillsRequired") || []).includes(skill)
                                      ? "border-blue-400 bg-blue-100"
                                      : "border-gray-200 bg-white hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={(watch("volunteerDetails.skillsRequired") || []).includes(skill)}
                                    onChange={(e) => handleSkillsChange(skill, e.target.checked)}
                                    className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700">{skill}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Estimated Budget */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-[#8B5CF6]" />
                          Estimated Budget <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Total Amount (₹) <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                {...register("budget.totalAmount", { 
                                  required: "Total budget amount is required",
                                  min: { value: 1000, message: "Minimum budget is ₹1,000" },
                                  valueAsNumber: true
                                })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                                placeholder="500000"
                              />
                            </div>
                            {errors.budget?.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.budget.totalAmount.message}</p>}
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-2 block">Budget Breakdown <span className="text-gray-400">(Optional)</span></label>
                            <BudgetBreakdownTable />
                          </div>
                        </div>
                      </div>

                      {/* NGO Contribution - OPTIONAL */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          NGO Contribution <span className="text-gray-400">(Optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Describe what your NGO will contribute to this project</p>
                        <textarea
                          {...register("ngoContribution")}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm resize-none"
                          placeholder="Example: Our NGO will provide project management, local coordination, community mobilization, and monitoring support. We will deploy 5 staff members full-time for the project duration..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: CSR Goals & Compliance */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#8B5CF6]" />
                        Step 4: CSR Goals & Compliance
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Align with CSR Act and provide legal compliance details</p>
                    </div>

                    <div className="space-y-5">
                      {/* CSR Act Alignment */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          CSR Act Alignment (Schedule VII) <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Select applicable areas under Companies Act 2013, Schedule VII</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {csrActOptions.map((option) => (
                            <label 
                              key={option} 
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                (watch("csrActAlignment") || []).includes(option)
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(watch("csrActAlignment") || []).includes(option)}
                                onChange={(e) => handleCheckboxGroupChange("csrActAlignment", option, e.target.checked)}
                                className="w-4 h-4 text-[#8B5CF6] rounded border-gray-300 focus:ring-[#8B5CF6]"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                        {(watch("csrActAlignment") || []).length === 0 && (
                          <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Please select at least one CSR Act alignment
                          </p>
                        )}
                      </div>

                      {/* UN SDG Alignment - Optional */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          UN SDG Alignment <span className="text-gray-400">(Optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Select UN Sustainable Development Goals this project aligns with</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sdgOptions.map((option) => (
                            <label 
                              key={option} 
                              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                (watch("sdgMapping") || []).includes(option)
                                  ? "border-green-400 bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(watch("sdgMapping") || []).includes(option)}
                                onChange={(e) => handleCheckboxGroupChange("sdgMapping", option, e.target.checked)}
                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-xs text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Reporting & Documentation */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Reporting & Documentation <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Select documents you will provide to corporates</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {reportingOptions.map((option) => (
                            <label 
                              key={option} 
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                (watch("reportingDocuments") || []).includes(option)
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(watch("reportingDocuments") || []).includes(option)}
                                onChange={(e) => handleCheckboxGroupChange("reportingDocuments", option, e.target.checked)}
                                className="w-4 h-4 text-[#8B5CF6] rounded border-gray-300 focus:ring-[#8B5CF6]"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                        {(watch("reportingDocuments") || []).length === 0 && (
                          <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Please select at least one reporting document type
                          </p>
                        )}
                      </div>

                      {/* Legal Compliance */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#8B5CF6]" />
                          Tax & Legal Information <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">NGO Registration Number <span className="text-red-500">*</span></label>
                            <input
                              {...register("legalCompliance.registrationNumber", { 
                                required: "Registration number is required"
                              })}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-sm"
                              placeholder="MH/2020/12345"
                            />
                            {errors.legalCompliance?.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.legalCompliance.registrationNumber.message}</p>}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              watch("legalCompliance.has12A")
                                ? "border-green-400 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}>
                              <input
                                type="checkbox"
                                {...register("legalCompliance.has12A")}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-700">12A Certificate</span>
                                <p className="text-xs text-gray-500">Tax exemption</p>
                              </div>
                            </label>
                            
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              watch("legalCompliance.has80G")
                                ? "border-green-400 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}>
                              <input
                                type="checkbox"
                                {...register("legalCompliance.has80G")}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-700">80G Certificate</span>
                                <p className="text-xs text-gray-500">Donor tax benefit</p>
                              </div>
                            </label>
                            
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              watch("legalCompliance.hasFCRA")
                                ? "border-green-400 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}>
                              <input
                                type="checkbox"
                                {...register("legalCompliance.hasFCRA")}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-700">FCRA</span>
                                <p className="text-xs text-gray-500">Foreign contribution</p>
                              </div>
                            </label>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Note: 12A and 80G certificates are typically required for CSR partnerships
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Publish */}
                {activeStep === 5 && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#8B5CF6]" />
                        Step 5: Review & Publish
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Review your opportunity and optionally provide contact details</p>
                    </div>

                    <div className="space-y-5">
                      {/* Internal NGO Contact - OPTIONAL */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#8B5CF6]" />
                          Internal NGO Contact <span className="text-gray-400">(Optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Optionally provide contact details for the person managing this opportunity</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Contact Name</label>
                            <input
                              {...register("contactPerson.name")}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="John Doe"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Role/Designation</label>
                            <input
                              {...register("contactPerson.role")}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="Program Manager"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Email</label>
                            <input
                              type="email"
                              {...register("contactPerson.email", { 
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
                              })}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="john@ngo.org"
                            />
                            {errors.contactPerson?.email && <p className="text-red-500 text-xs mt-1">{errors.contactPerson.email.message}</p>}
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Contact Number</label>
                            <input
                              type="tel"
                              {...register("contactPerson.phone", { 
                                pattern: { value: /^[0-9]*$/, message: "Only numbers are allowed" }
                              })}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white transition-all text-sm"
                              placeholder="9876543210"
                              maxLength={10}
                              onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                            {errors.contactPerson?.phone && <p className="text-red-500 text-xs mt-1">{errors.contactPerson.phone.message}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Summary Review */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Opportunity Summary
                        </label>
                        <div className="bg-gradient-to-br from-[#E8F5FF] to-[#D4BBF7] rounded-xl p-5 space-y-4">
                          {/* Title & Type */}
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-6 h-6 text-[#8B5CF6] flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800">{watch("title") || "Opportunity Title"}</h3>
                              <p className="text-sm text-gray-600">{watch("opportunityType") || "Type not selected"}</p>
                            </div>
                          </div>
                          
                          {/* Location & Timeline */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {watch("location.city") && watch("location.state") ? `${watch("location.city")}, ${watch("location.district")}, ${watch("location.state")} - ${watch("location.pincode")}` : "Location not set"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {watch("timeline.startDate") ? new Date(watch("timeline.startDate")).toLocaleDateString() : "Start"} - {watch("timeline.endDate") ? new Date(watch("timeline.endDate")).toLocaleDateString() : "End"}
                              </span>
                            </div>
                          </div>
                          
                          {/* CSR Modes */}
                          {selectedCsrModes.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-600 mb-2">CSR Modes:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedCsrModes.map((mode, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-white/70 rounded-full text-xs text-gray-700">{mode}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Budget & Beneficiaries */}
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-300/30">
                            <div>
                              <p className="text-xs text-gray-600">Estimated Budget</p>
                              <p className="text-lg font-bold text-[#8B5CF6]">₹{(watch("budget.totalAmount") || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Expected Beneficiaries</p>
                              <p className="text-lg font-bold text-[#8B5CF6]">{(watch("expectedImpact.beneficiaries") || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {/* Legal Compliance Badges */}
                          <div className="flex gap-2 pt-3 border-t border-gray-300/30">
                            {watch("legalCompliance.has12A") && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">12A ✓</span>
                            )}
                            {watch("legalCompliance.has80G") && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">80G ✓</span>
                            )}
                            {watch("legalCompliance.hasFCRA") && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">FCRA ✓</span>
                            )}
                            {watch("legalCompliance.registrationNumber") && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Reg: {watch("legalCompliance.registrationNumber")}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Terms Confirmation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register("termsAccepted", {
                              required: "You must accept the terms to submit"
                            })}
                            className="mt-1 h-5 w-5 text-[#8B5CF6] focus:ring-[#8B5CF6] border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              I confirm that the information provided is accurate and will be used for CSR collaboration
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              By submitting, you agree to our terms of service and confirm that all details are correct. 
                              Your opportunity will be reviewed by the admin team before being published.
                            </p>
                          </div>
                        </label>
                        {errors.termsAccepted && <p className="text-red-500 text-xs mt-2 ml-8">{errors.termsAccepted.message}</p>}
                      </div>

                      {/* Info Note */}
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Review Period</p>
                          <p className="mt-1">Your CSR opportunity will be reviewed by our team and published within 24-48 hours. You will receive a notification once approved.</p>
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
                    className="ml-auto px-6 py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] font-medium transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto px-6 py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Submit Opportunity
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Live Preview Column - Sticky */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-gradient-to-br from-[#E8F5FF] to-[#D4BBF7] rounded-2xl shadow-lg overflow-hidden sticky top-8 self-start">
              {/* Header */}
              <div className="bg-[#8B5CF6] p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Live Preview</h3>
                </div>
                <p className="text-sm text-white/90">
                  See how your opportunity will appear to corporates
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-white p-6 w-full">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-[#E8F5FF] to-[#D4BBF7] relative overflow-hidden flex items-center justify-center">
                    {coverImagePreview ? (
                      <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-white/50 mx-auto mb-2" />
                        <p className="text-sm text-white/70">Cover image preview</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Type Badge */}
                    {watch("opportunityType") && (
                      <span className="inline-block px-3 py-1 bg-[#8B5CF6] text-white text-xs font-medium rounded-full">
                        {watch("opportunityType")}
                      </span>
                    )}

                    {/* Title */}
                    <h4 className="text-lg font-bold text-gray-800 line-clamp-2">
                      {watch("title") || "Your Opportunity Title"}
                    </h4>

                    {/* Problem Statement Preview */}
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {watch("problemStatement") || "Your problem statement will appear here..."}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("location.city") && watch("location.state") 
                              ? `${watch("location.city")}, ${watch("location.state")}` 
                              : "City, State"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Timeline</p>
                          <p className="text-sm font-medium text-gray-800">
                            {watch("timeline.startDate") ? new Date(watch("timeline.startDate")).toLocaleDateString() : "TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="text-sm font-medium text-gray-800">
                            ₹{(watch("budget.totalAmount") || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Beneficiaries</p>
                          <p className="text-sm font-medium text-gray-800">
                            {(watch("expectedImpact.beneficiaries") || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CSR Modes */}
                    {selectedCsrModes.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">CSR Modes:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCsrModes.slice(0, 3).map((mode, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{mode}</span>
                          ))}
                          {selectedCsrModes.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">+{selectedCsrModes.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      className="w-full bg-[#8B5CF6] text-white py-2.5 rounded-lg font-medium hover:bg-[#7C3AED] transition-colors text-sm"
                    >
                      Express Interest
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

// Main component with Suspense wrapper
const CreateCSROpportunityPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5FF] via-[#FFFFFF] to-[#D4BBF7] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#8B5CF6] mx-auto mb-4" />
          <p className="text-gray-600">Loading CSR opportunity form...</p>
        </div>
      </div>
    }>
      <CreateCSROpportunityForm />
    </Suspense>
  );
};

export default CreateCSROpportunityPage;
