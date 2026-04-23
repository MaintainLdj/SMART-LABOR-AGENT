import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface DashboardData {
    total?: number;
    on_job?: number;
    leave?: number;
    checkin_total?: number;
    abnormal?: number;
}

export const getDashboardStatistics = async (): Promise<DashboardData> => {
    const res = await axios.get(`${baseUrl}/dashboard/statistics`);
    return res.data.data;
};