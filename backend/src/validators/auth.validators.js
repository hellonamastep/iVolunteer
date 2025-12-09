import Joi from "joi";

const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
  }),
  name: Joi.string().trim().min(2).max(50).required(),
  password: Joi.string().min(8).max(16).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).optional().messages({
    "any.only": "Passwords must match",
  }),
  role: Joi.string().valid("user", "ngo", "admin", "corporate").default("user"),
  otp: Joi.string().pattern(/^\d{6}$/).optional().messages({
    "string.pattern.base": "OTP must be 6 digits",
  }),
  state: Joi.string().trim().optional(),

  age: Joi.when("role", {
    is: "user",
    then: Joi.number().integer().min(13).max(120).required(),
    otherwise: Joi.number().optional(),
  }),
  city: Joi.when("role", {
    is: "user",
    then: Joi.string().trim().min(2).max(100).required(),
    otherwise: Joi.string().optional(),
  }),
  profession: Joi.when("role", {
    is: "user",
    then: Joi.string().trim().max(100).required(),
    otherwise: Joi.string().optional(),
  }),

  organizationType: Joi.when("role", {
    is: "ngo",
    then: Joi.string()
      .valid("non-profit", "charity", "foundation", "trust", "society", "other")
      .required(),
    otherwise: Joi.string().optional(),
  }),

  websiteUrl: Joi.string().trim().allow("").optional(),
  yearEstablished: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),

  contactNumber: Joi.when("role", {
    is: Joi.valid("ngo", "corporate"),
    then: Joi.string()
      .custom((value, helpers) => {
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 7 || digitsOnly.length > 15)
          return helpers.error("string.pattern.base", { message: "Contact number must be 7-15 digits long" });
        if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) return value;
        if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
          const areaCodes = ["011", "022", "033", "040", "044", "080", "020", "079", "0484", "0471"];
          if (areaCodes.some((c) => digitsOnly.startsWith(c))) return value;
        }
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) return value;
        return helpers.error("string.pattern.base", { message: "Please enter a valid mobile or landline number" });
      })
      .required(),
    otherwise: Joi.string().optional(),
  }),


  address: Joi.when("role", {
    is: Joi.valid("ngo", "corporate"),
    then: Joi.object({
      street: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      state: Joi.string().trim().required(),
      zip: Joi.string()
        .trim()
        .required()
        .custom((value, helpers) => {
          const country = helpers.state.ancestors[1].country?.toLowerCase();
          if (country === "india" || !country) {
            if (!/^\d{6}$/.test(value)) {
              return helpers.error("string.pattern.base", { message: "Indian PIN code must be 6 digits" });
            }
          }
          return value;
        }),
      country: Joi.string().trim().default("India"),
    }).required(),
    otherwise: Joi.object().optional(),
  }),

  nearestRailwayStation: Joi.when("role", {
    is: "user",
    then: Joi.string().trim().max(100).required().messages({
      "any.required": "Nearest railway station is required for volunteers",
      "string.empty": "Nearest railway station cannot be empty",
      "string.max": "Railway station name cannot exceed 100 characters",
    }),
    otherwise: Joi.string().optional(),
  }),


  ngoDescription: Joi.when("role", {
    is: "ngo",
    then: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .custom((value, helpers) => {
        const words = value.trim().split(/\s+/).filter(Boolean);
        if (words.length < 10) {
          return helpers.error("string.custom", {
            message: `Description must contain at least 10 words (currently ${words.length} words)`,
          });
        }
        return value;
      })
      .messages({ "string.custom": "{{#message}}" }),
    otherwise: Joi.string().optional(),
  }),


  focusAreas: Joi.when("role", {
    is: "ngo",
    then: Joi.array()
      .items(
        Joi.string().valid(
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
          "other"
        )
      )
      .min(1)
      .required(),
    otherwise: Joi.array().optional(),
  }),

  organizationSize: Joi.when("role", {
    is: "ngo",
    then: Joi.string().valid("1-10", "11-50", "51-100", "101-500", "500+").required(),
    otherwise: Joi.string().optional(),
  }),

  companyType: Joi.when("role", {
    is: "corporate",
    then: Joi.string()
      .valid("private-limited", "public-limited", "llp", "partnership", "sole-proprietorship", "mnc", "startup", "other")
      .required(),
    otherwise: Joi.string().optional(),
  }),

  industrySector: Joi.when("role", {
    is: "corporate",
    then: Joi.string()
      .valid("it-software", "healthcare", "finance", "manufacturing", "retail", "education", "consulting", "real-estate", "other")
      .required(),
    otherwise: Joi.string().optional(),
  }),

  companySize: Joi.when("role", {
    is: "corporate",
    then: Joi.string().valid("1-10", "11-50", "51-200", "201-1000", "1000+").required(),
    otherwise: Joi.string().optional(),
  }),

  companyDescription: Joi.when("role", {
    is: "corporate",
    then: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .custom((value, helpers) => {
        const words = value.trim().split(/\s+/).filter(Boolean);
        if (words.length < 10) {
          return helpers.error("string.custom", {
            message: `Company description must contain at least 10 words (currently ${words.length} words)`,
          });
        }
        return value;
      })
      .messages({ "string.custom": "{{#message}}" }),
    otherwise: Joi.string().optional(),
  }),


  csrFocusAreas: Joi.when("role", {
    is: "corporate",
    then: Joi.array()
      .items(
        Joi.string().valid(
          "employee-volunteering",
          "community-development",
          "education-skill-development",
          "environment-sustainability",
          "healthcare",
          "disaster-relief",
          "women-empowerment",
          "rural-development",
          "other"
        )
      )
      .min(1)
      .required(),
    otherwise: Joi.array().optional(),
  }),

});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
  password: Joi.string().min(8).max(16).required(),
});

// ✅ new: /auth/login/verify
const verifyOtpSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    "string.pattern.base": "OTP must be 6 digits",
  }),
});
const resendOtpSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
});

// POST /auth/verify-email
const verifyEmailSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    "string.pattern.base": "OTP must be 6 digits",
  }),
});


export const authValidator = {
  registerSchema,
  loginSchema,
  verifyOtpSchema, // <-- export it
      verifyEmailSchema,   // for /verify-email
  resendOtpSchema,  
};
