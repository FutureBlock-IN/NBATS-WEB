export const VALIDATION_MESSAGES = {
  ImageValidation:{
    supportedFormats : 'Unsupported file type. Only JPEG, JPG, and PNG are allowed.',
    fileSizeLimit: 'File size exceeds the 3 MB limit.'
  },
  timeInvalid: {
    invalid: 'Time should be greater than the current time if the start date is today.'
  },
  weekdays: {
    invalid: 'Please select valid weekdays within the date range.'
  },
  accessDenied: {
    error: 'You do not have permission to access this page.'
  },
  address: {
    required: 'Address is required.',
    maxlength: 'Address cannot exceed 256 characters.',
  },
  city: {
    required: 'City is required.',
    maxlength: 'City cannot exceed 50 characters.',
  },
  role: {
    required: 'Role is required',
  },
  day: {
    required: 'Please select at least one weekday.'
  },
  description: {
    required: 'Description is required.',
  },
  duration: {
    required: 'Duration is required.',
  },
  email: {
    required: 'Email is required.',
    email: 'Invalid email format.',
    maxlength: 'Email cannot exceed 100 characters.',
  },
  endDate: {
    required: 'End Date is required and must be after Start Date.',
  },
  firstName: {
    required: 'First Name is required.',
    maxlength: 'First Name cannot exceed 50 characters.',
  },
  generalError: {
    errorMessage: 'An error occurred. Please try again.',
  },
  guardianEmailsMatchedError: {
    cannotMatch: 'Guardian emails cannot be same.'
  },
  lastName: {
    required: 'Last Name is required.',
    maxlength: 'Last Name cannot exceed 50 characters.',
  },
  location: {
    required: 'Location is required',
  },
  participantAndGuardianEmailsMatchError:{
    cannotMatch: "Participant and Guardian emails cannot be same."
  },
  phone: {
    required: 'Phone number is required.',
    pattern: 'Invalid phone number format.',
  },
  repeat: {
    required: 'Please select a repeat frequency.'
  },
  startDate: {
    required: 'Start Date is required and must be a valid date.',
  },
  startTime: {
    required: 'Start Time is required.',
  },
  state: {
    required: 'State is required.'
  },
  title: {
    required: 'Title is required.',
    minlength: 'Title must be at least 3 characters long',
  },
  zip: {
    required: 'Zip is required.',
    pattern: 'Zip must be 5 digits.',
  },
};
