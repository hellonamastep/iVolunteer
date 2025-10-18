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
  role: Joi.string().valid("user", "ngo", "admin", "corporate").default("user"),

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

  websiteUrl: Joi.string().uri().trim().allow("").optional(),
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

    city: Joi.when('role', {
        is: 'user',
        then: Joi.string().trim().min(2).max(100).required().messages({
            "any.required": "City is required for volunteers",
            "string.empty": "City cannot be empty",
            "string.min": "City name must be at least 2 characters long",
            "string.max": "City name cannot exceed 100 characters"
        }),
        otherwise: Joi.string().optional()
    }),

    profession: Joi.when('role', {
        is: 'user',
        then: Joi.string().trim().max(100).required().messages({
            "any.required": "Profession is required for volunteers",
            "string.empty": "Profession cannot be empty",
            "string.max": "Profession cannot exceed 100 characters"
        }),
        otherwise: Joi.string().optional()
    }),

    contactNumber: Joi.alternatives().conditional('role', {
        switch: [
            {
                is: 'user',
                then: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required().messages({
                    "any.required": "Contact number is required for volunteers",
                    "string.empty": "Contact number cannot be empty",
                    "string.pattern.base": "Please provide a valid contact number"
                })
            },
            {
                is: Joi.valid('ngo', 'corporate'),
                then: Joi.string().custom((value, helpers) => {
                    const digitsOnly = value.replace(/\D/g, '');
                    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                        return helpers.error('string.pattern.base', { 
                            message: 'Contact number must be 7-15 digits long' 
                        });
                    }
                    if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
                        return value;
                    }
                    if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
                        const areaCodes = ['011', '022', '033', '040', '044', '080', '020', '079', '0484', '0471'];
                        const hasValidAreaCode = areaCodes.some(code => digitsOnly.startsWith(code));
                        if (hasValidAreaCode) {
                            return value;
                        }
                    }
                    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
                        return value;
                    }
                    return helpers.error('string.pattern.base', { 
                        message: 'Please enter a valid mobile number (10 digits) or landline number' 
                    });
                }).required().messages({
                    "any.required": "Contact number is required"
                })
            }
        ],
        otherwise: Joi.string().optional()
    }),

    nearestRailwayStation: Joi.when('role', {
        is: 'user',
        then: Joi.string().trim().max(100).required().messages({
            "any.required": "Nearest railway station is required for volunteers",
            "string.empty": "Nearest railway station cannot be empty",
            "string.max": "Railway station name cannot exceed 100 characters"
        }),
        otherwise: Joi.string().optional()
    }),

    // NGO-specific fields (conditionally required when role is 'ngo')
    organizationType: Joi.when('role', {
        is: 'ngo',
        then: Joi.string().valid("non-profit", "charity", "foundation", "trust", "society", "other").required().messages({
            "any.required": "Organization type is required for NGOs",
            "any.only": "Organization type must be one of: non-profit, charity, foundation, trust, society, other"
        }),
        otherwise: Joi.string().optional()
    }),

    websiteUrl: Joi.string().uri().trim().allow('').optional().messages({
        "string.uri": "Website or social media URL must be a valid URL"
    }),

    yearEstablished: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional().messages({
        "number.min": "Year established must be after 1800",
        "number.max": "Year established cannot be in the future"
    }),

    // This contactNumber is for NGO and Corporate (more detailed validation)
    // Note: There's another contactNumber validation above for volunteers (simpler validation)
    // Joi will use the first matching 'when' condition, so we need to handle this differently
    // We'll rename this or handle it in the NGO/Corporate section


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

    ngoDescription: Joi.when('role', {
        is: 'ngo',
        then: Joi.string().trim().min(10).max(1000).required().messages({
            "any.required": "Organization description is required for NGOs",
            "string.min": "Description must be at least 10 characters long",
            "string.max": "Description cannot exceed 1000 characters",
            "string.empty": "Description cannot be empty"
        }),
        otherwise: Joi.string().optional()
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

    companyDescription: Joi.when('role', {
        is: 'corporate',
        then: Joi.string().trim().min(10).max(1000).required().messages({
            "any.required": "Company description is required for corporate accounts",
            "string.min": "Description must be at least 10 characters long",
            "string.max": "Description cannot exceed 1000 characters",
            "string.empty": "Description cannot be empty"
        }),
        otherwise: Joi.string().optional()
    }),

    csrFocusAreas: Joi.when('role', {
        is: 'corporate',
        then: Joi.array().items(
            Joi.string().valid(
                "employee-volunteering", "community-development", "education-skill-development", 
                "environment-sustainability", "healthcare", "disaster-relief", 
                "women-empowerment", "rural-development", "other"
            )
        ).min(1).required().messages({
            "any.required": "At least one CSR focus area is required for corporate accounts",
            "array.min": "Please select at least one CSR focus area",
            "any.only": "Invalid CSR focus area selected"
        }),
        otherwise: Joi.array().optional()
    })

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

export const authValidator = {
  registerSchema,
  loginSchema,
  verifyOtpSchema, // <-- export it
};
