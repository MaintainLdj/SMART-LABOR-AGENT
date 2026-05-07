import request from "../axios";

export interface LogItem {
  id: number;
  optType: string;
  content: string;
  operator: string;
  createTime: string;
}

export const systemApi = {
  getLogs: () => request.get<LogItem[]>("/system/logs")
};
