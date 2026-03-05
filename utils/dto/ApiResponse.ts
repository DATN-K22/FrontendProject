export type ApiResponse<T = unknown> = {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data: T;
};
