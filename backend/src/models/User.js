import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
    },
    // in user schema fields
    emailVerified: { type: Boolean, default: false, index: true },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      required: function () {
        return !this.isOAuthUser;
      },
    },
    isOAuthUser: { type: Boolean, default: false }, // new field,
    role: {
      type: String,
      enum: ["user", "ngo", "admin", "corporate"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    // In your User model
isEmailVerified: {
  type: Boolean,
  default: false
},
    age: {
      type: Number,
      required: function () {
        return this.role === "user" && !this.isOAuthUser;
      },
    },

    city: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      minlength: [2, "City name must be at least 2 characters"],
      maxlength: [100, "City name cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
    },
    profession: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      maxlength: [100, "Profession cannot exceed 100 characters"],
    },
    contactNumber: {
      type: String,
      required: function () {
        return (
          this.role === "user" ||
          this.role === "ngo" ||
          this.role === "corporate"
        );
      },
      validate: {
        validator: function (v) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please provide a valid contact number",
      },
    },
    nearestRailwayStation: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      lowercase: true,
      maxlength: [100, "Railway station name cannot exceed 100 characters"],
    },
    // NGO-specific fields
    organizationType: {
      type: String,
      enum: [
        "non-profit",
        "charity",
        "foundation",
        "trust",
        "society",
        "other",
      ],
      required: function () {
        return this.role === "ngo";
      },
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    yearEstablished: {
      type: Number,
      min: [1800, "Year must be after 1800"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },

    address: {
      street: {
        type: String,
        required: function () {
          return this.role === "ngo" || this.role === "corporate";
        },
      },
      city: {
        type: String,
        required: function () {
          return this.role === "ngo" || this.role === "corporate";
        },
      },
      state: {
        type: String,
        required: function () {
          return this.role === "ngo" || this.role === "corporate";
        },
      },
      zip: {
        type: String,
        required: function () {
          return this.role === "ngo" || this.role === "corporate";
        },
      },
      country: {
        type: String,
        required: function () {
          return this.role === "ngo" || this.role === "corporate";
        },
        default: "India",
      },
    },
    ngoDescription: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      type: String,
      required: function () {
        return this.role === "ngo";
      },
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    focusAreas: [
      {
        type: String,
        enum: [
          "environment",
          "education",
          "health",
          "poverty",
          "children",
          "elderly",
          "animal-welfare",
          "disaster-relief",
          "community-development",
          "women-empowerment",
          "skill-development",
          "other",
        ],
      },
    ],
    organizationSize: {
      type: String,
      enum: ["1-10", "11-50", "51-100", "101-500", "500+"],
      required: function () {
        return this.role === "ngo";
      },
    },
    // Corporate-specific fields
    companyType: {
      type: String,
      enum: [
        "private-limited",
        "public-limited",
        "llp",
        "partnership",
        "sole-proprietorship",
        "mnc",
        "startup",
        "other",
      ],
      required: function () {
        return this.role === "corporate";
      },
    },
    industrySector: {
      type: String,
      enum: [
        "it-software",
        "healthcare",
        "finance",
        "manufacturing",
        "retail",
        "education",
        "consulting",
        "real-estate",
        "other",
      ],
      required: function () {
        return this.role === "corporate";
      },
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      required: function () {
        return this.role === "corporate";
      },

      type: String,
      enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      required: function () {
        return this.role === "corporate";
      },
    },
    companyDescription: {
      type: String,
      required: function () {
        return this.role === "corporate";
      },
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    csrFocusAreas: [
      {
        type: String,
        enum: [
          "employee-volunteering",
          "community-development",
          "education-skill-development",
          "environment-sustainability",
          "healthcare",
          "disaster-relief",
          "women-empowerment",
          "rural-development",
          "other",
        ],
      },
    ],
    points: {
      type: Number,
      default: 0,
      min: [0, "Points cannot be negative"],
    },
    coins: {
      type: Number,
      default: 0,
      min: [0, "Coins cannot be negative"],
    },
    volunteeredHours: {
      type: Number,
      default: 0,
      min: [0, "Volunteered hours cannot be negative"],
    },
    completedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    pointsHistory: [
      {
        type: { type: String, required: true },
        points: { type: Number, required: true },
        referenceId: { type: String, default: null },
        date: { type: Date, default: Date.now },
      },
    ],
    badges: [
      {
        badgeId: String,
        name: String,
        tier: String,
        icon: String,
        date: { type: Date, default: Date.now },
      },
    ],

    resetPasswordToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    resetPasswordExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ points: -1 }); // For leaderboard queries

// Virtual for total rewards (points + coins)
userSchema.virtual("totalRewards").get(function () {
  return this.points + this.coins;
});

// Method to award points
userSchema.methods.awardPoints = async function (points) {
  if (points < 0) throw new Error("Cannot award negative points");
  this.points += points;
  await this.save();
  return this.points;
};

// Method to award coins
userSchema.methods.awardCoins = async function (coins) {
  if (coins < 0) throw new Error("Cannot award negative coins");
  this.coins += coins;
  await this.save();
  return this.coins;
};

// Method to spend coins
userSchema.methods.spendCoins = async function (coins) {
  if (coins < 0) throw new Error("Cannot spend negative coins");
  if (this.coins < coins) throw new Error("Insufficient coins");
  this.coins -= coins;
  await this.save();
  return this.coins;
};

// Add badge
userSchema.methods.addBadge = async function (badgeName) {
  if (!this.badges.some((badge) => badge.name === badgeName)) {
    this.badges.push({ name: badgeName });
    await this.save();
  }
  return this.badges;
};

export const User = mongoose.model("User", userSchema);
