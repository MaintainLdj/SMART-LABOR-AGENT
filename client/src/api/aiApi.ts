import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export const askAI = async (question: string) => {
    return await axios.post(`${baseUrl}/ai/chat`, { question });
};