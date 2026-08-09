import { iApiResponse } from "@/types/backend/apiResponse.types";

export function ApiResponse<T = unknown>(success: boolean, message: string, data?: T): iApiResponse<T> {
  return { success, message, data: data || ({} as T) }
}