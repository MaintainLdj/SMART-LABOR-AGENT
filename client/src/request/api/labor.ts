import request from "../axios";

export interface Labor {
  id: number;
  name: string;
  work_id: string;
  position: string;
  entry_time: string;
  department: string;
  status: string;
  work_days: number;
}

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

export const laborApi = {
  getList: () => request.get<ApiResponse<Labor[]>>("/labor/list"),
  search: (work_id: string) => request.get<ApiResponse<Labor>>("/labor/search", { params: { work_id } }),
  add: (data: Partial<Labor>) => request.post("/labor/add", data),
  update: (id: number, data: Partial<Labor>) => request.put(`/labor/update/${id}`, data),
  delete: (id: number) => request.delete(`/labor/delete/${id}`)
};
