import { useState } from "react";
import { Card, Input, Button, Space, Tag, message } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

// 定义 AI 自治结果数据类型
interface AgentData {
  checkin: {
    normal: number;
    abnormal: number;
  };
  salary: unknown;
  answer: string;
  warning: string[];
}

export default function AIAgentPage() {
  const [question, setQuestion] = useState("");
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [warningList, setWarningList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAI = async () => {
    if (!question.trim()) { message.warning("请输入问题"); return; }
    setLoading(true);
    try {
      const res = await api.post("/agent/auto_work", { question });
      setAgentData(res.data.data);
      setWarningList(res.data.data.warning);
      message.success("AI自治完成");
    } catch { message.error("异常"); }
    setLoading(false);
  };

  return (
    <Card title="AI自治自动化中心" extra={<RobotOutlined />}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input.TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={6}
            placeholder="可查询：
        • 劳务合规审计、实名制核验
        • 建筑安全规范、工资支付条例
        • 合同风险、纠纷预警
        • 考勤硬件状态、电子签履约"
        />
        <Button type="primary" danger onClick={handleAI} loading={loading} style={{ alignSelf: "flex-end" }}>启动AI自治流程</Button>

        <Space wrap>{warningList.map((item, idx) => <Tag key={idx} color="warning">{item}</Tag>)}</Space>

        {agentData && (
          <Card size="small" title="自治结果" style={{ background: "#f7f8fa" }}>
            <p>考勤：正常 {agentData.checkin.normal} 人，异常 {agentData.checkin.abnormal} 人</p>
            <p>薪资：{JSON.stringify(agentData.salary)}</p>
            <p>AI：{agentData.answer}</p>
          </Card>
        )}
      </Space>
    </Card>
  );
}