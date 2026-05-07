import request from "../axios";

export interface AttendanceException {
  id: number;
  name: string;
  check_time: string;
  status: string;
  create_time: string;
}

export interface AiAnalyzeParams {
  name: string;
  check_time: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export const attendanceApi = {
  getExceptionList: () => request.get<ApiResponse<AttendanceException[]>>("/attendance/exception-list"),
  aiAnalyze: (data: AiAnalyzeParams) => request.post("/attendance/ai-analyze", data)
};
