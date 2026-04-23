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

export const getLaborList = async (): Promise<Labor[]> => {
    const res = await axios.get(`${baseUrl}/labor/list`);
    return res.data.data;
};

export const searchLabor = async (work_id: string) => {
    const res = await axios.get(`${baseUrl}/labor/search`, {
        params: { work_id }
    });
    return res.data;
};

export const addLabor = async (data: Partial<Labor>) => {
    const res = await axios.post(`${baseUrl}/labor/add`, data);
    return res.data;
};

export const updateLabor = async (id: number, data: Partial<Labor>) => {
    const res = await axios.put(`${baseUrl}/labor/update/${id}`, data);
    return res.data;
};

export const deleteLabor = async (id: number) => {
    const res = await axios.delete(`${baseUrl}/labor/delete/${id}`);
    return res.data;
};