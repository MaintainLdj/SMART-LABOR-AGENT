import { useState } from "react";
import { Card, Input, Button, Space, Tag, message } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { autoWork } from "../../api/ai";

// 定义 AI 自治结果数据类型
interface AgentData {
  question: string;
  labor_data: Array<{
    id: number;
    name: string;
    work_id: string;
    status: string;
    work_days: number;
  }>;
  checkin_data: Record<string, unknown>;
  salary_result: Record<string, number>;
  warning_msg: string[];
  audit_result: string;
  rag_context: string;
  final_answer: string;
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
      const res = await autoWork(question);
      setAgentData({...res.data});
      setWarningList(res.data.warning_msg);
      message.success("AI自治完成");
    } catch { message.error("异常"); }
    setLoading(false);
  };

  return (
    <Card title="AI自治自动化中心" extra={<RobotOutlined />}>
      <Space orientation="vertical" style={{ width: "100%" }}>
        <Input.TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={10}
          placeholder="请输入你要AI自治执行的任务：
• 查询所有人员信息
• 核算本月薪资
• 检查考勤异常
• 劳务合规审计
• 咨询实名制/合同/安全/工资法规
• 生成劳务风险报告"
        />
        <Button type="primary" danger onClick={handleAI} loading={loading} style={{ alignSelf: "flex-end" }}>启动AI自治流程</Button>

        <Space wrap>{warningList.map((item, idx) => <Tag key={idx} color="warning">{item}</Tag>)}</Space>
        {agentData && (
          <Card size="small" title="自治结果" style={{ background: "#f7f8fa" }}>
            <p><strong>审计结果：</strong>{agentData.audit_result}</p>
            <p><strong>薪资明细：</strong>{JSON.stringify(agentData.salary_result)}</p>
            <p><strong>法规参考：</strong>{agentData.rag_context}</p>
            <p><strong>AI回答：</strong></p>
            <div style={{ whiteSpace: "pre-wrap", background: "#fff", padding: "12px", borderRadius: "4px" }}>
              {agentData.final_answer}
            </div>
          </Card>
        )}
      </Space>
    </Card>
  );
}