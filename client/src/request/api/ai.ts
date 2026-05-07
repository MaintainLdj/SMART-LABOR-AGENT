import request from "../axios";

export const aiApi = {
  autoWork: (question: string) => request.post("/agent/auto_work", { question }),
  exportReport: () => request.get("/export/labor-report"),
  checkAutoWarning: () => request.post("/system/auto-warning")
};
