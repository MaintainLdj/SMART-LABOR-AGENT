import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface Checkin {
    id: number;
    labor_id: number;
    work_id: string;
    name: string;
    checkin_type: string;
    time: string;
}

export const getCheckinList = async (): Promise<Checkin[]> => {
    const res = await axios.get(`${baseUrl}/checkin/list`);
    return res.data.data;
};

export const submitCheckin = async (data: { labor_id: number; checkin_type: string; work_id: string; name: string }) => {
    const res = await axios.post(`${baseUrl}/checkin/submit`, data);
    return res.data;
};