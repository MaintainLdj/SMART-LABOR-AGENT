import request from "../axios";

export interface HeartbeatResponse {
  deviceCode: string;
}

export const mcpApi = {
  getHeartbeat: () => request.get<HeartbeatResponse>("/mcp/heartbeat")
};
