import request from "../axios";

export interface DashboardData {
  total?: number;
  on_job?: number;
  leave?: number;
  checkin_total?: number;
  abnormal?: number;
}

export const dashboardApi = {
  getStatistics: () => request.get<DashboardData>("/dashboard/statistics")
};
