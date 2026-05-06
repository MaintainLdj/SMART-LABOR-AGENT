import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface LogItem {
    id: number;
    optType: string;
    content: string;
    operator: string;
    createTime: string;
}

export const getSystemLogs = async (): Promise<LogItem[]> => {
    const res = await axios.get(`${baseUrl}/system/logs`);
    return res.data.data || [];
};
