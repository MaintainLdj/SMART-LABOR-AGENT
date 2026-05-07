import { useState } from "react";
import { Card, Upload, Button, List, message } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { contractApi } from "../../request/api/contract";

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
        <Card title="📄 劳务合同 & 安全协议管理">
            <Upload customRequest={handleUpload} fileList={fileList} onChange={e=>setFileList(e.fileList)}>
                <Button icon={<UploadOutlined />}>上传合同/附件</Button>
            </Upload>
            <List style={{marginTop:20}} bordered dataSource={fileList} renderItem={item=>(
                <List.Item>{item.name}</List.Item>
            )}/>
        </Card>
    )
}