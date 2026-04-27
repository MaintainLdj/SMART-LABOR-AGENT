import { useState, useRef } from "react";
import { Card, Input, Button, Space, Tag, message } from "antd";
import { RobotOutlined, AudioOutlined, FileExcelOutlined, WarningOutlined } from "@ant-design/icons";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

export default function AIAgentPage() {
  const [question, setQuestion] = useState("");
  const [agentData, setAgentData] = useState<{
    question?: string;
    labor_data?: Array<{
      id: number;
      name: string;
      work_id: string;
      position: string;
      department: string;
      status: string;
      work_days: number;
    }>;
    checkin_data?: Array<{
      name: string;
      type: string;
      time: string;
    }>;
    salary_result?: Record<string, string>;
    warning_msg?: string[];
    audit_result?: string;
    rag_context?: string;
    final_answer?: string;
    task_intent?: string;
  } | null>(null);
  const [warningList, setWarningList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<unknown | null>(null);

  // ========== 1. AI语音问答 核心 ==========
  const startVoiceRecognition = () => {
    const SpeechRecognitionConstructor = (window as Window & { SpeechRecognition?: { new(): unknown }; webkitSpeechRecognition?: { new(): unknown } }).SpeechRecognition || (window as Window & { SpeechRecognition?: { new(): unknown }; webkitSpeechRecognition?: { new(): unknown } }).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      message.error("当前浏览器不支持语音识别，请使用Chrome");
      return;
    }
    const recog = new SpeechRecognitionConstructor() as { lang: string; onresult: (e: unknown) => void; start: () => void };
    recog.lang = "zh-CN";
    recog.onresult = (e: unknown) => {
      const event = e as { results: { 0: { 0: { transcript: string } } } };
      const text = event.results[0][0].transcript;
      setQuestion(text);
      message.success(`语音识别完成：${text}`);
    };
    recog.start();
    recognitionRef.current = recog;
  };

  // ========== 2. AI自治问答 ==========
  const handleAI = async () => {
    if (!question.trim()) {
      message.warning("请输入问题或使用语音提问");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/agent/auto_work", { question });
      setAgentData(res.data.data);
      setWarningList(res.data.data.warning_msg || []);
      message.success("AI自治分析完成");
    } catch {
      message.error("AI请求异常");
    }
    setLoading(false);
  };

  // ========== 3. AI生成Excel报表 ==========
  const exportReport = async () => {
    try {
      const res = await api.get("/export/labor-report");
      // 前端触发下载
      const a = document.createElement("a");
      a.href = res.data.url;
      a.download = res.data.fileName;
      a.click();
      message.success("Excel报表下载成功");
    } catch {
      message.error("报表生成失败");
    }
  };

  // ========== 4. 系统主动全局预警巡检 ==========
  const checkAutoWarning = async () => {
    try {
      await api.post("/system/auto-warning");
      message.info("已完成全项目合规风险巡检");
    } catch {
      message.error("巡检异常");
    }
  };

  return (
    <Card title="AI自治自动化中心" extra={<RobotOutlined style={{fontSize:20}} />}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* 语音+输入区域 */}
        <Space.Compact style={{width:"100%"}}>
          <Input.TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="AI语音/文字提问：核算薪资、合规审计、法规咨询、风险排查"
            style={{flex:1}}
          />
          <Button 
            icon={<AudioOutlined />} 
            onClick={startVoiceRecognition}
            style={{height:"auto"}}
          >
            语音提问
          </Button>
        </Space.Compact>

        {/* 功能按钮组 */}
        <Space wrap>
          <Button type="primary" danger onClick={handleAI} loading={loading}>
            启动AI自治分析
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportReport}>
            AI导出Excel报表
          </Button>
          <Button icon={<WarningOutlined />} onClick={checkAutoWarning} danger>
            全局合规自动巡检
          </Button>
        </Space>

        {/* 风险预警标签 */}
        <Space wrap>
          {warningList.map((item, idx) => (
            <Tag key={idx} color="red">{item}</Tag>
          ))}
        </Space>

        {/* AI返回结果 */}
        {agentData && (
          <Card size="small" title="自治分析结果" style={{ background: "#f7f8fa" }}>
            <p>🔍 合规审计：{agentData.audit_result}</p>
            <p>📊 薪资核算：{JSON.stringify(agentData.salary_result)}</p>
            <p>📜 法规参考：{agentData.rag_context}</p>
            <p>🤖 AI解答：{agentData.final_answer}</p>
          </Card>
        )}
      </Space>
    </Card>
  );
}