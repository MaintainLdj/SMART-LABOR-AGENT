import { useEffect, useState } from "react";
import { Card, Table, Typography, Tag } from "antd";
import { getSystemLogs, type LogItem } from "../../api/system";

const { Title } = Typography;

// 表格列配置
const columns = [
    {
        title: "序号",
        dataIndex: "id",
        key: "id",
        width: 70,
    },
    {
        title: "操作类型",
        dataIndex: "optType",
        key: "optType",
        width: 120,
        render: (type: string) => {
        let color = "blue";
        if (type === "人员管理") color = "green";
        if (type === "考勤打卡") color = "orange";
        if (type === "AI自治") color = "purple";
        if (type === "系统") color = "cyan";
        return <Tag color={color}>{type}</Tag>;
        },
    },
    {
        title: "操作内容",
        dataIndex: "content",
        key: "content",
    },
    {
        title: "操作人",
        dataIndex: "operator",
        key: "operator",
        width: 100,
    },
    {
        title: "操作时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 180,
    },
];

export default function LogPage() {
    const [data, setData] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
        const result = await getSystemLogs();
        setData(result);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            fetchLogs();
        }, 0);
    }, []);

    return (
        <Card>
        <Title level={5}>📋 系统操作日志（审计留痕）</Title>
        <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 500 }}
        />
        </Card>
    );
}