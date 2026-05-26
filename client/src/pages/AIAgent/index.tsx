import { useState, useRef } from "react";
import { Card, Input, Button, Space, Tag, message, Typography, Row, Col } from "antd";
import { RobotOutlined, AudioOutlined, FileExcelOutlined, WarningOutlined, ThunderboltOutlined, SafetyOutlined, FileTextOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { aiApi } from "../../request/api/ai";

const { Title, Text, Paragraph } = Typography;

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

  const handleAI = async () => {
    if (!question.trim()) {
      message.warning("请输入问题或使用语音提问");
      return;
    }
    setAgentData(null);
    setWarningList([]);
    setLoading(true);
    try {
      const res = await aiApi.autoWork(question);
      setAgentData(res.data);
      setWarningList(res.data.warning_msg || []);
      message.success("AI自治分析完成");
    } catch {
      message.error("AI请求异常");
    }
    setLoading(false);
  };

  const exportReport = async () => {
    try {
      const res = await aiApi.exportReport();
      const a = document.createElement("a");
      a.href = res.data.url;
      a.download = res.data.fileName;
      a.click();
      message.success("Excel报表下载成功");
    } catch {
      message.error("报表生成失败");
    }
  };

  const checkAutoWarning = async () => {
    try {
      await aiApi.checkAutoWarning();
      message.info("已完成全项目合规风险巡检");
    } catch {
      message.error("巡检异常");
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            <RobotOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            AI自治自动化中心
          </Title>
          <Text type="secondary">智能化的劳务管理AI助手，支持语音交互、自动分析和风险预警</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: 8, 
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "100%"
              }}
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: "#1890ff" }} />
                  <span>智能问答</span>
                </Space>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ position: "relative" }}>
                  <Input.TextArea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={10}
                    placeholder="示例问题：
1. 查询所有工人信息
2. 筛查本月异常员工
3. 计算全员工资
4. 查询施工一组人员
5. 劳务合同法律要求
• 生成本周劳务管理周报
• 全项目合规风险排查
• 上一问继续补充说明"
                    style={{ 
                      borderRadius: 8,
                      resize: "none",
                      fontSize: 14
                    }}
                  />
                  <Button
                    icon={<AudioOutlined />}
                    onClick={startVoiceRecognition}
                    style={{
                      position: "absolute",
                      right: 12,
                      bottom: 12,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderColor: "transparent",
                      color: "#fff"
                    }}
                  >
                    语音提问
                  </Button>
                </div>

                <Button
                  type="primary"
                  onClick={handleAI}
                  loading={loading}
                  size="large"
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderColor: "transparent",
                    fontSize: 16,
                    fontWeight: 500
                  }}
                >
                  启动AI自治分析
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card 
                bordered={false} 
                style={{ 
                  borderRadius: 8, 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
                title={
                  <Space>
                    <FileExcelOutlined style={{ color: "#52c41a" }} />
                    <span>报表管理</span>
                  </Space>
                }
              >
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={exportReport}
                  size="large"
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 8,
                    borderColor: "#52c41a",
                    color: "#52c41a",
                    fontSize: 15
                  }}
                >
                  AI导出Excel报表
                </Button>
              </Card>

              <Card 
                bordered={false} 
                style={{ 
                  borderRadius: 8, 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
                title={
                  <Space>
                    <SafetyOutlined style={{ color: "#ff4d4f" }} />
                    <span>风险巡检</span>
                  </Space>
                }
              >
                <Button
                  icon={<WarningOutlined />}
                  onClick={checkAutoWarning}
                  danger
                  size="large"
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 8,
                    fontSize: 15
                  }}
                >
                  全局合规自动巡检
                </Button>
              </Card>
            </Space>
          </Col>
        </Row>

        {warningList.length > 0 && (
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 8, 
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: "#fff2f0",
              border: "1px solid #ffccc7"
            }}
            title={
              <Space>
                <WarningOutlined style={{ color: "#ff4d4f" }} />
                <span style={{ color: "#ff4d4f", fontWeight: 500 }}>风险预警</span>
              </Space>
            }
          >
            <Space wrap>
              {warningList.map((item, idx) => (
                <Tag 
                  key={idx} 
                  color="error"
                  style={{ 
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 14,
                    marginBottom: 8
                  }}
                >
                  {item}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {agentData && (
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 8, 
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>自治分析结果</span>
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {agentData.audit_result && (
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                    合规审计
                  </Title>
                  <Paragraph style={{ 
                    background: "#f5f5f5", 
                    padding: "16px", 
                    borderRadius: 6,
                    margin: 0
                  }}>
                    {agentData.audit_result}
                  </Paragraph>
                </div>
              )}

              {agentData.salary_result && (
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <FileExcelOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                    薪资核算
                  </Title>
                  <Paragraph style={{ 
                    background: "#f5f5f5", 
                    padding: "16px", 
                    borderRadius: 6,
                    margin: 0,
                    fontFamily: "monospace"
                  }}>
                    {JSON.stringify(agentData.salary_result, null, 2)}
                  </Paragraph>
                </div>
              )}

              {agentData.rag_context && (
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <FileTextOutlined style={{ marginRight: 8, color: "#faad14" }} />
                    法规参考
                  </Title>
                  <Paragraph style={{ 
                    background: "#f5f5f5", 
                    padding: "16px", 
                    borderRadius: 6,
                    margin: 0
                  }}>
                    {agentData.rag_context}
                  </Paragraph>
                </div>
              )}

              {agentData.final_answer && (
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <RobotOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                    AI解答
                  </Title>
                  <Paragraph style={{ 
                    background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)", 
                    padding: "16px", 
                    borderRadius: 6,
                    margin: 0,
                    borderLeft: "4px solid #667eea"
                  }}>
                    {agentData.final_answer}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}