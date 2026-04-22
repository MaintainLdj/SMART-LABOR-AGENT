import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface Labor {
    id: number;
    name: string;
    work_id: string;
    position: string;
    entry_time: string;
    department: string;
    status: string;
}

// 获取列表
export const getLaborList = async (): Promise<Labor[]> => {
    const res = await axios.get(`${baseUrl}/labor/list`);
    return res.data;
};

// 按工号搜索
export const getLaborById = async (work_id: string) => {
    const res = await axios.get(`${baseUrl}/labor/get_by_id`, {
        params: { work_id }
    });
    return res.data;
};