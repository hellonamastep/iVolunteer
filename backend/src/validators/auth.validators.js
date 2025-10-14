import Joi from "joi";

const registerSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: false}}).trim().lowercase().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
        "string.base": "Email must be a string",
        "string.empty": "Email cannot be empty"
    }),

    name: Joi.string().trim().min(2).max(50).required().messages({
        "any.required": "Name is required",
        "string.base": "Name must be a string",
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must be at most 50 characters long",
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 16 characters",
        "string.empty": "Password cannot be empty",
    }),

    role: Joi.string().valid("user", "ngo", "admin", "corporate").default("user").messages({
        "any.only": "Role must be one of: user, ngo, admin, corporate"
    }),

    // Volunteer (user) specific fields (conditionally required when role is 'user')
    age: Joi.when('role', {
        is: 'user',
        then: Joi.number().integer().min(13).max(120).required().messages({
            "any.required": "Age is required for volunteers",
            "number.base": "Age must be a number",
            "number.min": "You must be at least 13 years old to register",
            "number.max": "Please enter a valid age"
        }),
        otherwise: Joi.number().optional()
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

    contactNumber: Joi.when('role', {
        is: Joi.valid('ngo', 'corporate'),
        then: Joi.string().custom((value, helpers) => {
            // Remove all non-digit characters for validation
            const digitsOnly = value.replace(/\D/g, '');
            
            // Check length (7-15 digits)
            if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                return helpers.error('string.pattern.base', { 
                    message: 'Contact number must be 7-15 digits long' 
                });
            }
            
            // Indian mobile number (10 digits starting with 6-9)
            if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
                return value;
            }
            
            // Indian landline with area code (10-11 digits)
            if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
                const areaCodes = ['011', '022', '033', '040', '044', '080', '020', '079', '0484', '0471'];
                const hasValidAreaCode = areaCodes.some(code => digitsOnly.startsWith(code));
                if (hasValidAreaCode) {
                    return value;
                }
            }
            
            // International or other valid formats (7-15 digits)
            if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
                return value;
            }
            
            return helpers.error('string.pattern.base', { 
                message: 'Please enter a valid mobile number (10 digits) or landline number' 
            });
        }).required().messages({
            "any.required": "Contact number is required"
        }),
        otherwise: Joi.string().optional()
    }),

    address: Joi.when('role', {
        is: Joi.valid('ngo', 'corporate'),
        then: Joi.object({
            street: Joi.string().trim().required().messages({
                "any.required": "Street address is required",
                "string.empty": "Street address cannot be empty"
            }),
            city: Joi.string().trim().required().messages({
                "any.required": "City is required",
                "string.empty": "City cannot be empty"
            }),
            state: Joi.string().trim().required().messages({
                "any.required": "State is required",
                "string.empty": "State cannot be empty"
            }),
            zip: Joi.string().trim().required().custom((value, helpers) => {
                const country = helpers.state.ancestors[1].country?.toLowerCase();
                
                // For India, ZIP code should be 6 digits
                if (country === 'india' || !country) {
                    if (!/^\d{6}$/.test(value)) {
                        return helpers.error('string.pattern.base', { message: 'Indian PIN code must be 6 digits' });
                    }
                }
                
                return value;
            }).messages({
                "any.required": "ZIP code is required",
                "string.empty": "ZIP code cannot be empty"
            }),
            country: Joi.string().trim().default("India").messages({
                "string.empty": "Country cannot be empty"
            })
        }).required().messages({
            "any.required": "Address is required"
        }),
        otherwise: Joi.object().optional()
    }),

    ngoDescription: Joi.when('role', {
        is: 'ngo',
        then: Joi.string().trim().min(10).max(1000).required().custom((value, helpers) => {
            // Count words by splitting on whitespace and filtering empty strings
            const words = value.trim().split(/\s+/).filter(word => word.length > 0);
            
            if (words.length < 10) {
                return helpers.error('string.custom', { 
                    message: `Description must contain at least 10 words (currently ${words.length} words)` 
                });
            }
            
            return value;
        }).messages({
            "any.required": "Organization description is required for NGOs",
            "string.min": "Description must be at least 10 characters long",
            "string.max": "Description cannot exceed 1000 characters",
            "string.empty": "Description cannot be empty",
            "string.custom": "{{#message}}"
        }),
        otherwise: Joi.string().optional()
    }),

    focusAreas: Joi.when('role', {
        is: 'ngo',
        then: Joi.array().items(
            Joi.string().valid(
                "environment", "education", "health", "poverty", "children", 
                "elderly", "animal-welfare", "disaster-relief", "community-development", 
                "women-empowerment", "skill-development", "other"
            )
        ).min(1).required().messages({
            "any.required": "At least one focus area is required for NGOs",
            "array.min": "Please select at least one focus area",
            "any.only": "Invalid focus area selected"
        }),
        otherwise: Joi.array().optional()
    }),

    organizationSize: Joi.when('role', {
        is: 'ngo',
        then: Joi.string().valid("1-10", "11-50", "51-100", "101-500", "500+").required().messages({
            "any.required": "Organization size is required for NGOs",
            "any.only": "Organization size must be one of: 1-10, 11-50, 51-100, 101-500, 500+"
        }),
        otherwise: Joi.string().optional()
    }),

    // Corporate-specific fields
    companyType: Joi.when('role', {
        is: 'corporate',
        then: Joi.string().valid("private-limited", "public-limited", "llp", "partnership", "sole-proprietorship", "mnc", "startup", "other").required().messages({
            "any.required": "Company type is required for corporate accounts",
            "any.only": "Company type must be one of: private-limited, public-limited, llp, partnership, sole-proprietorship, mnc, startup, other"
        }),
        otherwise: Joi.string().optional()
    }),

    industrySector: Joi.when('role', {
        is: 'corporate',
        then: Joi.string().valid("it-software", "healthcare", "finance", "manufacturing", "retail", "education", "consulting", "real-estate", "other").required().messages({
            "any.required": "Industry sector is required for corporate accounts",
            "any.only": "Industry sector must be one of: it-software, healthcare, finance, manufacturing, retail, education, consulting, real-estate, other"
        }),
        otherwise: Joi.string().optional()
    }),

    companySize: Joi.when('role', {
        is: 'corporate',
        then: Joi.string().valid("1-10", "11-50", "51-200", "201-1000", "1000+").required().messages({
            "any.required": "Company size is required for corporate accounts",
            "any.only": "Company size must be one of: 1-10, 11-50, 51-200, 201-1000, 1000+"
        }),
        otherwise: Joi.string().optional()
    }),

    companyDescription: Joi.when('role', {
        is: 'corporate',
        then: Joi.string().trim().min(10).max(1000).required().custom((value, helpers) => {
            // Count words by splitting on whitespace and filtering empty strings
            const words = value.trim().split(/\s+/).filter(word => word.length > 0);
            
            if (words.length < 10) {
                return helpers.error('string.custom', { 
                    message: `Company description must contain at least 10 words (currently ${words.length} words)` 
                });
            }
            
            return value;
        }).messages({
            "any.required": "Company description is required for corporate accounts",
            "string.min": "Description must be at least 10 characters long",
            "string.max": "Description cannot exceed 1000 characters",
            "string.empty": "Description cannot be empty",
            "string.custom": "{{#message}}"
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
    email: Joi.string().email().trim().lowercase().required().messages({
        "string.email": "Email must be valid",
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty"
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Password is required",
        "string.empty": "Password cannot be empty",
    })
});

export const authValidator = {
    registerSchema,
    loginSchema
}
