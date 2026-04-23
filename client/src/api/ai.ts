import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export const autoWork = async (question: string) => {
    const res = await axios.post(`${baseUrl}/agent/auto_work`, { question });
    return res.data;
};