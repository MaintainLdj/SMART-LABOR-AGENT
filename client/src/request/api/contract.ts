import request from "../axios";

export const contractApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/upload/contract", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
