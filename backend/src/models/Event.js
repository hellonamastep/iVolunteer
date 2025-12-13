import mongoose from "mongoose";

// Query helpers
const findApprovedUpcoming = function () {
  return this.find({
    status: "approved",
    date: { $gt: new Date() },
  }).sort({ date: 1 });
};

const findByOrganization = function (organizationId) {
  return this.find({ organizationId }).sort({ date: -1 });
};

const findAvailableByCategory = function (category) {
  return this.find({
    category,
    status: "approved",
    date: { $gt: new Date() },
    $expr: { $lt: ["$participants", "$maxParticipants"] },
  }).sort({ date: 1 });
};

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    organization: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organization ID is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    detailedAddress: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide a valid time in HH:MM format",
      ],
    },
    duration: {
      type: Number,
      required: [true, "Event duration is required"],
      min: [1, "Duration must be at least 1 hour"],
      max: [12, "Duration cannot exceed 12 hours"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
      // Removed strict enum to allow custom categories
      validate: {
        validator: function(value) {
          // Accept predefined categories or custom ones
          const predefinedCategories = [
            "environmental",
            "education",
            "healthcare",
            "community",
            "animal-welfare",
            "animals",
            "eldercare",
            "disability",
            "arts",
            "birthday",
            "wedding",
            "anniversary",
            "retirement",
            "graduation",
            "baby-shower",
            "engagement",
            "corporate-celebration",
            "milestone-celebration",
            "memorial",
            "other"
          ];
          // Allow predefined categories or any custom category string
          return typeof value === 'string' && value.length >= 2 && value.length <= 50;
        },
        message: "Category must be between 2 and 50 characters",
      },
    },
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants is required"],
      min: [1, "Must allow at least 1 participant"],
      max: [1000, "Cannot exceed 1000 participants"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "completed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    eventStatus: {
      type: String,
      enum: {
        values: ["ongoing", "completed", "upcoming", "cancelled", "postponed"],
        message: "{VALUE} is not a valid event status",
      },
      default: "upcoming",
    },
    eventType: {
      type: String,
      enum: {
        values: ["community", "virtual", "in-person", "special", "corporate-partnership", "corporate-csr", "employee-engagement", "community-outreach"],
        message: "{VALUE} is not a valid event type",
      },
      required: [true, "Event type is required"],
      default: "community",
    },
    pointsOffered: {
      type: Number,
      required: [true, "Points reward must be specified"],
      min: [0, "Points cannot be negative"],
      default: 50,
    },
    scoringRule: {
      basePoints: { type: Number, default: 0 },
      difficultyMultiplier: { type: Number, default: 1 },
      durationFactor: { type: Number, default: 1 },
      totalPoints: { type: Number, default: 0 }, // pre-calculated final value
    },

    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    image: {
      url: String,
      caption: String,
      publicId: String,
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    completionProof: {
      type: {
        url: {
          type: String,
          required: function () {
            // Only required if completion is pending
            return this.completionStatus === "pending";
          },
        },
        caption: String,
      },
      required: false,
    },
    completionStatus: {
      type: String,
      enum: ["none", "pending", "accepted", "rejected", "approved"],
      default: "none",
    },
    completionRequestedAt: {
      type: Date,
      default: null,
    },
    completionApprovedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    attendedParticipants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    sponsorshipRequired: {
      type: Boolean,
      default: true,
    },
  sponsorshipContactEmail: {
  type: String,
  validate: {
    validator: function (value) {
      if (this.sponsorshipRequired) {
        return !!value; // must be provided if sponsorshipRequired = true
      }
      return true;
    },
    message: "Contact email is required when sponsorship is enabled",
  },
},

sponsorshipContactNumber: {
  type: String,
  validate: {
    validator: function (value) {
      if (this.sponsorshipRequired) {
        return !!value;
      }
      return true;
    },
    message: "Contact number is required when sponsorship is enabled",
  },
},

    sponsorshipAmount: {
      type: Number,
      min: [0, "Sponsorship amount cannot be negative"],
      default: 1000,
      validate: {
        validator: function (value) {
          if (this.sponsorshipRequired) {
            return value > 0;
          }
          return true;
        },
        message: "Sponsorship amount must be > 0 if sponsorship is required",
      },
    },
    
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    
    // Corporate Partnership Fields
    corporatePartner: {
      type: String,
      trim: true,
    },
    csrObjectives: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    virtuals: {
      isOpen: {
        get() {
          return (
            this.status === "approved" &&
            this.date > new Date() &&
            this.participants < this.maxParticipants
          );
        },
      },
      participantsNeeded: {
        get() {
          return Math.max(0, this.maxParticipants - this.participants);
        },
      },
      participationRate: {
        get() {
          return ((this.participants / this.maxParticipants) * 100).toFixed(1);
        },
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Instance methods
eventSchema.methods.isFull = function () {
  return this.participants >= this.maxParticipants;
};

eventSchema.methods.canAcceptApplications = function () {
  return this.isOpen && !this.isFull();
};

eventSchema.methods.hasUserApplied = async function (userId) {
  const application = await mongoose.model("Application").findOne({
    event: this._id,
    user: userId,
  });
  return !!application;
};

eventSchema.methods.acceptApplication = async function (applicationId) {
  if (!this.canAcceptApplications()) {
    throw new Error("Event cannot accept more applications");
  }

  const application = await mongoose
    .model("Application")
    .findByIdAndUpdate(applicationId, { status: "accepted" }, { new: true });

  if (!application) {
    throw new Error("Application not found");
  }

  this.participants += 1;
  await this.save();

  return application;
};

// Pre-save hook to validate participant count
eventSchema.pre("save", function (next) {
  if (this.participants > this.maxParticipants) {
    next(new Error("Participants count cannot exceed maximum participants"));
  } else {
    next();
  }
});

// Pre-save hook to handle status changes
eventSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
    // If event is cancelled, update all pending applications
    if (this.status === "cancelled") {
      await mongoose
        .model("Application")
        .updateMany(
          { event: this._id, status: "pending" },
          { status: "cancelled" }
        );
    }

    // If event is completed, calculate and award points
    if (this.status === "completed") {
      const applications = await mongoose
        .model("Application")
        .find({ event: this._id, status: "accepted" });

      for (const app of applications) {
        const user = await mongoose.model("User").findById(app.user);
        if (user) {
          user.points += this.pointsOffered;
          await user.save();
        }
      }
    }
  }
  next();
});

// Add indexes
eventSchema.index({ status: 1, date: 1 }); // For querying upcoming approved events
eventSchema.index({ organizationId: 1, date: -1 }); // For organization's events
eventSchema.index({ category: 1, status: 1, date: 1 }); // For category-based queries

// Add query helpers
eventSchema.statics.findApprovedUpcoming = findApprovedUpcoming;
eventSchema.statics.findByOrganization = findByOrganization;
eventSchema.statics.findAvailableByCategory = findAvailableByCategory;

export const Event = mongoose.model("Event", eventSchema);
