import request from "../axios";

export interface Checkin {
  id: number;
  labor_id: number;
  work_id: string;
  name: string;
  checkin_type: string;
  time: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export const checkinApi = {
  getList: () => request.get<ApiResponse<Checkin[]>>("/checkin/list"),
  submit: (data: { labor_id: number; checkin_type: string; work_id: string; name: string }) => request.post("/checkin/submit", data)
};
