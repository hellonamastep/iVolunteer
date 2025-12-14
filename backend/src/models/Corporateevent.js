import mongoose from "mongoose";

const corporateEventSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true, maxLength: 80 },
    opportunityType: { 
      type: String, 
      enum: [
        "Infrastructure Development",
        "Education",
        "Health & Sanitation",
        "Environment",
        "Skill Development",
        "Women Empowerment",
        "Rural Development",
        "Other"
      ],
      required: true 
    },
    csrModes: [{ 
      type: String, 
      enum: [
        "Employee Volunteering",
        "Financial Sponsorship",
        "Material Donation",
        "Skill-based Volunteering",
        "Long-term Partnership"
      ]
    }],
    // Location fields - comprehensive location information
    location: {
      country: { type: String, required: true, default: "India" },
      state: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { 
        type: String, 
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Invalid pincode format']
      },
      googleMapLocation: { type: String }
    },
    // Cover Image
    coverImage: {
      url: { type: String },
      publicId: { type: String }
    },
    
    // Project Details
    problemStatement: { type: String, required: true, maxLength: 500 },
    proposedSolution: { type: String, required: true },
    // Expected Impact - all fields optional
    expectedImpact: {
      beneficiaries: { type: Number },
      directImpact: { type: String },
      longTermOutcome: { type: String }
    },
    timeline: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    mediaUploads: [{ 
      url: { type: String },
      publicId: { type: String },
      type: { type: String } // 'image' or 'pdf'
    }],
    
    // Participation
    participationRequired: [{
      type: String,
      enum: ["Funds", "Employees", "Skilled Professionals", "Materials"]
    }],
    volunteerDetails: {
      volunteersNeeded: { type: Number },
      skillsRequired: [{ type: String }],
      timeCommitmentHours: { type: Number }
    },
    budget: {
      totalAmount: { type: Number, required: true },
      breakdown: [{ 
        category: { type: String },
        amount: { type: Number }
      }]
    },
    // NGO Contribution - optional
    ngoContribution: { type: String },
    
    // CSR Goals & Compliance
    csrActAlignment: [{
      type: String,
      enum: [
        "Education",
        "Rural Development",
        "Health & Sanitation",
        "Environmental Sustainability",
        "Skill Development"
      ]
    }],
    sdgMapping: [{ type: String }],
    reportingDocuments: [{
      type: String,
      enum: [
        "Utilization Certificate",
        "Impact Report",
        "Photographic Evidence",
        "Completion Certificate"
      ]
    }],
    legalCompliance: {
      registrationNumber: { type: String, required: true },
      has12A: { type: Boolean, required: true },
      has80G: { type: Boolean, required: true },
      hasFCRA: { type: Boolean }
    },
    
    // Review & Publish - contact person optional
    contactPerson: {
      name: { type: String },
      role: { type: String },
      email: { type: String },
      phone: { type: String }
    },
    
    // System fields
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["draft", "pending", "approved", "rejected", "active", "completed", "archived"], 
      default: "pending" 
    },
    rejectionReason: { type: String },
    bids: [{
      corporate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      corporateName: String,
      offer: String,
      contactEmail: String,
      contactNumber: String,
      createdAt: { type: Date, default: Date.now },
    }],
    selectedBid: { type: mongoose.Schema.Types.ObjectId, ref: "CorporateBid" },
  },
  { timestamps: true }
);

export const corporateEvent = mongoose.model(
  "CorporateEvent",
  corporateEventSchema
);
