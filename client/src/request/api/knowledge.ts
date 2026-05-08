import request from "../axios";

export interface Knowledge {
  id: number;
  title: string;
  category: string;
  content: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export const knowledgeApi = {
  getList: () => request.get<ApiResponse<Knowledge[]>>("/knowledge/list"),
  add: (data: Partial<Knowledge>) => request.post("/knowledge/add", data),
  update: (id: number, data: Partial<Knowledge>) => request.post(`/knowledge/edit/${id}`, data),
  delete: (id: number) => request.delete(`/knowledge/del/${id}`)
};
