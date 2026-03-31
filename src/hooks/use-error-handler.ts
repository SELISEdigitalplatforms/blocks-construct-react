import { useTranslation } from 'react-i18next';
import { useToast } from './use-toast';

/** Normalized error response structure supporting multiple backend error patterns. */
export interface ErrorResponse {
  error?: {
    error?: string;
    message?: string;
    code?: number;
    details?: Record<string, string | string[]>;
  };
  error_description?: string;
  status?: number;
  message?: string;
}

/** Configuration options for error handling. */
interface ErrorHandlerOptions {
  messageMap?: Record<string, string>;
  defaultMessage?: string;
  duration?: number;
  translate?: boolean;
  variant?: 'default' | 'destructive' | 'success';
  title?: string;
}

/** HTTP status codes for specific error handling. */
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
} as const;

/** Default error message mappings. */
const DEFAULT_ERROR_MESSAGES = {
  invalid_request: 'EMAIL_PASSWORD_NOT_VALID',
} as const;

/** Authentication error codes requiring special handling. */
const AUTH_ERROR_CODES = ['invalid_request', 'invalid_username_password'] as const;

/** Regex to identify translation keys (uppercase with underscores). */
const TRANSLATION_KEY_PATTERN = /^[A-Z_]+$/;

/**
 * Centralized error handling hook with consistent message extraction and toast notifications.
 * @returns {handleError, getErrorMessage}
 */
export const useErrorHandler = (defaultOptions: ErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // ==================== JSON Parsing Utilities ====================

  /** Safely parses JSON string to ErrorResponse, returns null on failure. */
  const parseJsonError = (jsonString: string): ErrorResponse | null => {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        error: parsed?.error,
        error_description: parsed?.error_description,
        message: parsed?.message,
      };
    } catch {
      return null;
    }
  };

  // ==================== Error Description Processing ====================

  /** Processes error_description field (JSON or plain text). */
  const processErrorDescription = (err: any): ErrorResponse | null => {
    if (!err.error_description) return null;

    const parsedDescription = parseJsonError(err.error_description);
    if (parsedDescription) {
      return {
        error: parsedDescription.error ?? err.error,
        error_description: parsedDescription.error_description,
        message: parsedDescription.message ?? err.message,
      };
    }

    return {
      error: err.error,
      error_description: err.error_description,
      message: err.message,
    };
  };

  // ==================== Response Data Processing ====================

  /** Checks if errors field is a GraphQL errors array. */
  const isGraphQLErrorsArray = (errors: any): boolean => {
    return Array.isArray(errors) && errors.length > 0;
  };

  /** Checks if errors field is a validation errors object. */
  const isValidationErrorsObject = (errors: any): boolean => {
    return errors && typeof errors === 'object' && !Array.isArray(errors);
  };

  /** Processes GraphQL errors array and joins messages. */
  const processGraphQLErrors = (errors: any[]): ErrorResponse => {
    const errorMessages = errors
      .map((e: any) => e.message)
      .filter(Boolean)
      .join('; ');

    return {
      error: { message: errorMessages },
      message: errorMessages,
    };
  };

  /** Builds error object from response data handling multiple backend patterns. */
  const buildErrorObject = (responseData: any): ErrorResponse['error'] | undefined => {
    if (isValidationErrorsObject(responseData.errors)) {
      return { details: responseData.errors };
    }

    if (responseData.error) {
      return responseData.error;
    }

    return undefined;
  };

  /** Extracts error_description from multiple locations. */
  const extractErrorDescription = (responseData: any): string | undefined => {
    return (
      responseData.error_description ||
      (typeof responseData.error === 'object' ? responseData.error.error_description : undefined)
    );
  };

  /** Extracts error message from multiple locations. */
  const extractErrorMessage = (
    responseData: any,
    errorDescription?: string
  ): string | undefined => {
    return (
      responseData.message ||
      (typeof responseData.error === 'object' ? responseData.error.message : undefined) ||
      errorDescription
    );
  };

  /** Processes and normalizes API error response data. */
  const processResponseData = (responseData: any): ErrorResponse | null => {
    if (!responseData) return null;

    if (typeof responseData === 'string') {
      const parsed = parseJsonError(responseData);
      return parsed || { message: responseData };
    }

    if (typeof responseData === 'object') {
      if (isGraphQLErrorsArray(responseData.errors)) {
        return processGraphQLErrors(responseData.errors);
      }

      const errorObject = buildErrorObject(responseData);
      const errorDescription = extractErrorDescription(responseData);
      const message = extractErrorMessage(responseData, errorDescription);

      return {
        error: errorObject,
        error_description: errorDescription,
        message: message,
      };
    }

    return null;
  };

  // ==================== Error Object Processing ====================

  /** Extracts status code from error object. */
  const extractStatusCode = (err: any): number | undefined => {
    return err.response?.status ?? err.status;
  };

  /** Processes error objects with nested error information. */
  const processErrorObject = (err: any): ErrorResponse => {
    const status = extractStatusCode(err);

    const errorDescriptionResult = processErrorDescription(err);
    if (errorDescriptionResult) {
      return { ...errorDescriptionResult, status };
    }

    const responseDataResult = processResponseData(err.response?.data);
    if (responseDataResult) {
      return { ...responseDataResult, status };
    }

    return {
      error: err.error,
      error_description: err.error_description,
      message: err.message || t('UNKNOWN_ERROR_OCCURRED'),
      status,
    };
  };

  // ==================== Error Normalization ====================

  /** Processes Error instances (including HttpError). */
  const processErrorInstance = (error: Error): ErrorResponse => {
    const parsed = parseJsonError(error.message);
    const errorObj = error as any;
    const status = extractStatusCode(errorObj);

    if (errorObj.error) {
      const errorResponse = errorObj.error;
      return {
        ...(parsed || {}),
        error: errorResponse.error ?? errorResponse,
        error_description: errorResponse.error_description,
        message: errorResponse.error_description || error.message,
        status,
      };
    }

    return parsed ? { ...parsed, status } : { message: error.message, status };
  };

  /** Normalizes any error type into consistent ErrorResponse structure. */
  const normalizeError = (error: unknown): ErrorResponse => {
    if (error instanceof Error) {
      return processErrorInstance(error);
    }

    if (typeof error === 'string') {
      const parsed = parseJsonError(error);
      return parsed || { message: error };
    }

    if (typeof error === 'object' && error !== null) {
      return processErrorObject(error as any);
    }

    return { message: t('UNKNOWN_ERROR_OCCURRED') };
  };

  // ==================== Error Message Extraction ====================

  /** Extracts error messages from error details object. */
  const extractDetailsMessages = (
    details: Record<string, string | string[]>,
    errorMap: Record<string, string>
  ): string[] => {
    return Object.entries(details)
      .map(([key, value]) => errorMap[key] || (Array.isArray(value) ? value.join(', ') : value))
      .filter(Boolean) as string[];
  };

  /** Extracts primary error string from various error fields. */
  const extractErrorString = (error: ErrorResponse): string | undefined => {
    return error.message ?? (typeof error.error === 'string' ? error.error : error.error?.message);
  };

  /** Extracts human-readable error message with message mappings. */
  const getErrorMessage = (
    error: ErrorResponse,
    messageMap: Record<string, string> = {}
  ): string => {
    const errorMap: Record<string, string> = {
      ...DEFAULT_ERROR_MESSAGES,
      ...messageMap,
    };

    if (error.error_description) {
      return error.error_description;
    }

    if (error.error?.code && errorMap[`code_${error.error.code}`]) {
      return errorMap[`code_${error.error.code}`];
    }

    if (error.error?.details) {
      const messages = extractDetailsMessages(error.error.details, errorMap);
      if (messages.length) return messages.join('. ');
    }

    const errorString = extractErrorString(error);
    if (errorString && errorMap[errorString]) {
      return errorMap[errorString];
    }

    return errorString ?? defaultOptions.defaultMessage ?? t('SOMETHING_WENT_WRONG');
  };

  // ==================== Specific Error Handlers ====================

  /** Extracts first message from error detail (string or array). */
  const extractFirstDetailMessage = (detailValue: string | string[]): string => {
    return Array.isArray(detailValue) ? detailValue[0] : detailValue;
  };

  /** Handles 403 Forbidden errors. */
  const handleForbiddenError = (
    duration: number,
    variant: ErrorHandlerOptions['variant']
  ): string => {
    const message = t('YOU_ARE_NOT_ALLOWED_PERFORM_ACTION');
    toast({
      title: t('FORBIDDEN'),
      description: message,
      duration,
      variant,
    });
    return message;
  };

  /** Handles activation code errors (400 with Code field). */
  const handleActivationCodeError = (
    codeDetail: string | string[],
    duration: number,
    variant: ErrorHandlerOptions['variant']
  ): string => {
    const message = extractFirstDetailMessage(codeDetail);
    toast({
      title: t('ACTIVATION_EXPIRED'),
      description: message,
      duration,
      variant,
    });
    return message;
  };

  /** Handles password restriction errors (400 with Password field). */
  const handlePasswordError = (
    passwordDetail: string | string[],
    duration: number,
    variant: ErrorHandlerOptions['variant']
  ): string => {
    const message = extractFirstDetailMessage(passwordDetail);
    toast({
      title: t('INVALID_PASSWORD'),
      description: message,
      duration,
      variant,
    });
    return message;
  };

  /** Checks if error is an authentication error. */
  const isAuthenticationError = (errorDetails: ErrorResponse): boolean => {
    const errorCode =
      typeof errorDetails.error === 'string' ? errorDetails.error : errorDetails.error?.error;
    return AUTH_ERROR_CODES.includes(errorCode as any);
  };

  /** Determines if message should be translated (uppercase with underscores). */
  const shouldTranslateMessage = (message: string): boolean => {
    return TRANSLATION_KEY_PATTERN.test(message);
  };

  /** Processes and formats final error message with translation. */
  const formatErrorMessage = (
    error: unknown,
    errorDetails: ErrorResponse,
    messageMap: Record<string, string>,
    translate: boolean
  ): string => {
    if (typeof error === 'string' && translate) {
      return t(error);
    }

    const errorMessage = getErrorMessage(errorDetails, messageMap);
    const isTranslationKey = shouldTranslateMessage(errorMessage);
    return translate && isTranslationKey ? t(errorMessage) : errorMessage;
  };

  // ==================== Main Error Handler ====================

  /** Main error handler - processes errors and displays toast notifications. */
  const handleError = (error: unknown, options: ErrorHandlerOptions = {}): string => {
    const {
      messageMap = {},
      duration = 3000,
      variant = 'destructive',
      title = t('SOMETHING_WENT_WRONG'),
      translate = true,
    } = {
      ...defaultOptions,
      ...options,
    };

    const errorDetails = normalizeError(error);

    if (errorDetails.status === HTTP_STATUS.FORBIDDEN) {
      return handleForbiddenError(duration, variant);
    }

    if (errorDetails.status === HTTP_STATUS.BAD_REQUEST) {
      if (errorDetails.error?.details?.Code) {
        return handleActivationCodeError(errorDetails.error.details.Code, duration, variant);
      }

      if (errorDetails.error?.details?.Password) {
        return handlePasswordError(errorDetails.error.details.Password, duration, variant);
      }
    }

    const finalTitle = translate ? t(title) : title;
    const finalMessage = formatErrorMessage(error, errorDetails, messageMap, translate);

    const isBackendError = errorDetails.error_description ?? errorDetails.error;
    if (isBackendError) {
      const isAuthError = isAuthenticationError(errorDetails);
      toast({
        title: isAuthError ? t('INVALID_CREDENTIALS') : t('SOMETHING_WENT_WRONG'),
        description: finalMessage,
        duration,
        variant,
      });
      return finalMessage;
    }

    toast({
      title: finalTitle,
      description: finalMessage,
      duration,
      variant,
    });

    return finalMessage;
  };

  return { handleError, getErrorMessage };
};
