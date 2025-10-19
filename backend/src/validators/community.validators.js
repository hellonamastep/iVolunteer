import { body, param, query } from 'express-validator';
import { validateRequest } from './validator.js';

// Community Validators
export const createCommunityValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Community name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Community description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['environmental', 'education', 'healthcare', 'social-welfare', 'animal-welfare', 'arts-culture', 'community-development', 'other'])
        .withMessage('Invalid category'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required'),
    validateRequest
];

export const updateCommunityValidator = [
    param('id').isMongoId().withMessage('Invalid community ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .optional()
        .trim()
        .isIn(['environmental', 'education', 'healthcare', 'social-welfare', 'animal-welfare', 'arts-culture', 'community-development', 'other'])
        .withMessage('Invalid category'),
    validateRequest
];

// Event Validators
export const createEventValidator = [
    param('communityId').isMongoId().withMessage('Invalid community ID'),
    body('title')
        .trim()
        .notEmpty().withMessage('Event title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Event description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('date')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('duration')
        .isInt({ min: 1, max: 12 }).withMessage('Duration must be between 1 and 12 hours'),
    body('maxParticipants')
        .isInt({ min: 1, max: 1000 }).withMessage('Maximum participants must be between 1 and 1000'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['environmental', 'education', 'healthcare', 'community', 'animal-welfare', 'other'])
        .withMessage('Invalid category'),
    body('eventType')
        .optional()
        .trim()
        .isIn(['community', 'virtual', 'in-person'])
        .withMessage('Invalid event type. Must be one of: community, virtual, in-person'),
    validateRequest
];

export const updateEventValidator = [
    param('communityId').isMongoId().withMessage('Invalid community ID'),
    param('eventId').isMongoId().withMessage('Invalid event ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('date')
        .optional()
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),
    validateRequest
];

// Application Validators
export const createApplicationValidator = [
    param('communityId').isMongoId().withMessage('Invalid community ID'),
    param('eventId').isMongoId().withMessage('Invalid event ID'),
    body('motivation')
        .trim()
        .notEmpty().withMessage('Motivation is required')
        .isLength({ min: 20, max: 500 }).withMessage('Motivation must be between 20 and 500 characters'),
    body('skills')
        .optional()
        .isArray().withMessage('Skills must be an array'),
    body('experience')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Experience cannot exceed 1000 characters'),
    body('questionsOrComments')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Questions/comments cannot exceed 500 characters'),
    validateRequest
];

export const updateApplicationStatusValidator = [
    param('communityId').isMongoId().withMessage('Invalid community ID'),
    param('eventId').isMongoId().withMessage('Invalid event ID'),
    param('applicationId').isMongoId().withMessage('Invalid application ID'),
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['accepted', 'rejected', 'cancelled']).withMessage('Invalid status'),
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
    validateRequest
];

// Query Validators
export const listQueryValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validateRequest
];