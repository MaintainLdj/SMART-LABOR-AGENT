import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface HeartbeatResponse {
    deviceCode: string;
}

export const getMCPHeartbeat = async (): Promise<HeartbeatResponse> => {
    const res = await axios.get(`${baseUrl}/mcp/heartbeat`);
    return res.data;
};
