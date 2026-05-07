import request from "../axios";

export interface BlackListItem {
  id: string;
  name: string;
  work_id: string;
  reason: string;
  create_time: string;
}

export interface AddBlackParams {
  name: string;
  work_id: string;
  reason: string;
}

export const blackApi = {
  getList: () => request.get<BlackListItem[]>("/black/list"),
  add: (data: AddBlackParams) => request.post("/black/add", data)
};
