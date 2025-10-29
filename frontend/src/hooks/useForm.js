import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler function
 * @param {Function} validate - Validation function (optional)
 * @returns {Object} - Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    
    setValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  }, [errors]);

  // Handle input blur (mark as touched)
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate on blur if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [validate, values]);

  // Set a specific field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  // Set a specific field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  }, []);

  // Set a field as touched programmatically
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: isTouched,
    }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // If there are errors, don't submit
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    // Submit form
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // If error is an object with field-specific errors
      if (typeof error === 'object' && !error.message) {
        setErrors(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  // Get field props for easy spreading
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    getFieldProps,
  };
};

export default useForm;
