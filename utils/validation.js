function validatePoll(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object']
    };
  }

  // Validate question
  if (!data.question) {
    errors.push('Question is required');
  } else if (typeof data.question !== 'string') {
    errors.push('Question must be a string');
  } else if (data.question.trim().length === 0) {
    errors.push('Question cannot be empty');
  } else if (data.question.trim().length > 500) {
    errors.push('Question must be 500 characters or less');
  }

  // Validate options
  if (!data.options) {
    errors.push('Options are required');
  } else if (!Array.isArray(data.options)) {
    errors.push('Options must be an array');
  } else if (data.options.length < 2) {
    errors.push('At least 2 options are required');
  } else if (data.options.length > 10) {
    errors.push('Maximum 10 options allowed');
  } else {
    // Validate each option
    const optionErrors = [];
    const trimmedOptions = [];
    
    data.options.forEach((option, index) => {
      if (typeof option !== 'string') {
        optionErrors.push(`Option ${index + 1} must be a string`);
      } else if (option.trim().length === 0) {
        optionErrors.push(`Option ${index + 1} cannot be empty`);
      } else if (option.trim().length > 100) {
        optionErrors.push(`Option ${index + 1} must be 100 characters or less`);
      } else {
        trimmedOptions.push(option.trim());
      }
    });

    if (optionErrors.length > 0) {
      errors.push(...optionErrors);
    } else {
      // Check for duplicate options
      const uniqueOptions = [...new Set(trimmedOptions)];
      if (uniqueOptions.length !== trimmedOptions.length) {
        errors.push('Duplicate options are not allowed');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      question: data.question,
      options: data.options
    } : null
  };
}

function validateUpdatePoll(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object']
    };
  }

  // At least one field must be provided
  if (!data.question && !data.options) {
    return {
      isValid: false,
      errors: ['At least one field (question or options) must be provided for update']
    };
  }

  const validatedData = {};

  // Validate question if provided
  if (data.question !== undefined) {
    if (typeof data.question !== 'string') {
      errors.push('Question must be a string');
    } else if (data.question.trim().length === 0) {
      errors.push('Question cannot be empty');
    } else if (data.question.trim().length > 500) {
      errors.push('Question must be 500 characters or less');
    } else {
      validatedData.question = data.question;
    }
  }

  // Validate options if provided
  if (data.options !== undefined) {
    if (!Array.isArray(data.options)) {
      errors.push('Options must be an array');
    } else if (data.options.length < 2) {
      errors.push('At least 2 options are required');
    } else if (data.options.length > 10) {
      errors.push('Maximum 10 options allowed');
    } else {
      // Validate each option
      const optionErrors = [];
      const trimmedOptions = [];
      
      data.options.forEach((option, index) => {
        if (typeof option !== 'string') {
          optionErrors.push(`Option ${index + 1} must be a string`);
        } else if (option.trim().length === 0) {
          optionErrors.push(`Option ${index + 1} cannot be empty`);
        } else if (option.trim().length > 100) {
          optionErrors.push(`Option ${index + 1} must be 100 characters or less`);
        } else {
          trimmedOptions.push(option.trim());
        }
      });

      if (optionErrors.length > 0) {
        errors.push(...optionErrors);
      } else {
        // Check for duplicate options
        const uniqueOptions = [...new Set(trimmedOptions)];
        if (uniqueOptions.length !== trimmedOptions.length) {
          errors.push('Duplicate options are not allowed');
        } else {
          validatedData.options = data.options;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : null
  };
}

module.exports = {
  validatePoll,
  validateUpdatePoll
};