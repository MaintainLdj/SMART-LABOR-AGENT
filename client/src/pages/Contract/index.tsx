import { useState } from "react";
import { Card, Upload, List, message, Space, Typography } from "antd";
import type { UploadProps } from "antd";
import { FileTextOutlined, InboxOutlined } from "@ant-design/icons";
import { contractApi } from "../../request/api/contract";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ContractPage() {
    const [fileList, setFileList] = useState<Array<{ name: string; uid: string }>>([]);

    const handleUpload: UploadProps["customRequest"] = async (options) => {
        try {
            await contractApi.upload(options.file as File);
            message.success("合同上传成功");
            setFileList([...fileList, { name: (options.file as File).name, uid: String(Date.now()) }]);
            options.onSuccess?.(options.file);
        } catch {
            message.error("合同上传失败，请重试");
            options.onError?.(new Error("上传失败"));
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        劳务合同 & 安全协议管理
                    </Title>
                    <Text type="secondary">上传和管理劳务合同、安全协议等重要文档</Text>
                </div>

                <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <Dragger
                        customRequest={handleUpload}
                        fileList={fileList}
                        onChange={e => setFileList(e.fileList)}
                        style={{ padding: "40px 20px" }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                            点击或拖拽文件到此处上传
                        </p>
                        <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                            支持单个或批量上传合同文件、安全协议等文档
                        </p>
                    </Dragger>
                </Card>

                {fileList.length > 0 && (
                    <Card 
                        bordered={false} 
                        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                        title={
                            <Space>
                                <FileTextOutlined style={{ color: "#1890ff" }} />
                                <span>已上传文件</span>
                            </Space>
                        }
                    >
                        <List
                            dataSource={fileList}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: 4,
                                        transition: "background-color 0.2s",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <Space>
                                        <FileTextOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                                        <Text>{item.name}</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Card>
                )}
            </Space>
        </div>
    )
}