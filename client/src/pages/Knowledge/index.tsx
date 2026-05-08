import { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Select, message } from "antd";
import { knowledgeApi } from "../../request/api/knowledge";
import type { Knowledge } from "../../request/api/knowledge";

const { TextArea } = Input;
const { Option } = Select;

export default function Knowledge() {
    const [list, setList] = useState<Knowledge[]>([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchList = async () => {
        const res = await knowledgeApi.getList() as unknown as { data: Knowledge[] };
        setList(res.data);
    };

    useEffect(() => {
        setTimeout(() => {
        fetchList();
        }, 0)
    }, []);

    const handleAdd = () => {
        setEditId(null);
        form.resetFields();
        setOpen(true);
    };

    const handleEdit = (record: Knowledge) => {
        setEditId(record.id);
        form.setFieldsValue(record);
        setOpen(true);
    };

    const handleSubmit = async () => {
        const vals = await form.validateFields();
        if (editId) {
        await knowledgeApi.update(editId, vals);
        message.success("编辑成功");
        } else {
        await knowledgeApi.add(vals);
        message.success("新增成功");
        }
        setOpen(false);
        fetchList();
    };

    const handleDel = async (id: number) => {
        await knowledgeApi.delete(id);
        message.success("删除成功");
        fetchList();
    };

    const columns = [
        { title: "ID", dataIndex: "id", width: 60 },
        { title: "法规标题", dataIndex: "title" },
        { title: "分类", dataIndex: "category", width: 120 },
        { title: "内容摘要", dataIndex: "content", ellipsis: true },
        {
        title: "操作", width: 180,
        render: (_: unknown, record: Knowledge) => (
            <>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Button type="link" danger onClick={() => handleDel(record.id)}>删除</Button>
            </>
        )
        }
    ];

    return (
        <Card title="📚 RAG 劳务知识库管理">
        <Button type="primary" onClick={handleAdd} style={{marginBottom:16}}>新增法规条目</Button>
        <Table columns={columns} dataSource={list} rowKey="id" pagination={{ pageSize: 10 }} />

        <Modal
            open={open}
            title={editId ? "编辑法规" : "新增法规"}
            onOk={handleSubmit}
            onCancel={() => setOpen(false)}
            width={600}
        >
            <Form form={form} layout="vertical">
            <Form.Item name="title" label="法规标题" rules={[{required:true}]}>
                <Input placeholder="如：建筑工人实名制管理办法" />
            </Form.Item>
            <Form.Item name="category" label="分类" rules={[{required:true}]}>
                <Select placeholder="请选择分类">
                <Option value="合规监管">合规监管</Option>
                <Option value="合同管理">合同管理</Option>
                <Option value="安全管理">安全管理</Option>
                <Option value="薪资合规">薪资合规</Option>
                <Option value="风险处置">风险处置</Option>
                </Select>
            </Form.Item>
            <Form.Item name="content" label="法规内容" rules={[{required:true}]}>
                <TextArea rows={6} placeholder="输入详细法规说明" />
            </Form.Item>
            </Form>
        </Modal>
        </Card>
    );
}
