/**
 * Formats a raw error object into a user-friendly string message.
 * Handles Axios errors, Fetch errors, arrays of message strings, and custom error formats.
 */
export const formatError = (error: any, defaultMsg = 'An unexpected error occurred'): string => {
  if (!error) return defaultMsg;

  // Handle nested Axios/Fetch response structures
  const rawMessage = 
    error.response?.data?.message || 
    error.response?.data?.error?.message ||
    error.response?.data?.error ||
    error.message || 
    (typeof error === 'string' ? error : null);

  // If it's an array of errors (like class-validator errors from the NestJS backend), join them
  if (Array.isArray(rawMessage)) {
    return rawMessage.join(', ');
  }

  if (typeof rawMessage === 'string') {
    const lowerMessage = rawMessage.toLowerCase();
    // Translate common technical error strings to user-friendly messages
    if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('network error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }
    if (lowerMessage.includes('network request failed')) {
      return 'Kết nối mạng thất bại. Vui lòng kiểm tra kết nối internet.';
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('exceeded')) {
      return 'Yêu cầu kết nối quá hạn. Vui lòng thử lại.';
    }
    return rawMessage;
  }

  return defaultMsg;
};

/**
 * Extracts a friendly error message from a fetch Response.
 */
export async function getFetchErrorMessage(response: Response, defaultMsg = 'Request failed'): Promise<string> {
  try {
    const errorData = await response.json().catch(() => null);
    if (errorData) {
      return formatError(errorData, defaultMsg);
    }
  } catch (e) {
    // Ignore JSON parsing failure
  }
  
  // Fallback for specific HTTP status codes if no message is found
  if (response.status === 401) {
    return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (response.status === 403) {
    return 'Bạn không có quyền thực hiện hành động này.';
  }
  if (response.status === 404) {
    return 'Không tìm thấy dữ liệu yêu cầu.';
  }
  if (response.status >= 500) {
    return 'Lỗi máy chủ hệ thống. Vui lòng thử lại sau.';
  }

  return `${defaultMsg} (Status: ${response.status})`;
}
