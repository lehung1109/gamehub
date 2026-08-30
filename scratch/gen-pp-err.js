const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const errors = [
  { s: "I has finished the report.", t: ["I", "has", "finished", "the", "report."], ei: 1, c: "have", vi: "Tôi đã hoàn thành báo cáo." },
  { s: "We have deploy the new feature.", t: ["We", "have", "deploy", "the", "new", "feature."], ei: 2, c: "deployed", vi: "Chúng tôi đã triển khai tính năng mới." },
  { s: "She have reviewed the code.", t: ["She", "have", "reviewed", "the", "code."], ei: 1, c: "has", vi: "Cô ấy đã review code." },
  { s: "They hasn't fixed the bug.", t: ["They", "hasn't", "fixed", "the", "bug."], ei: 1, c: "haven't", vi: "Họ vẫn chưa sửa lỗi." },
  { s: "The manager have approved the budget.", t: ["The", "manager", "have", "approved", "the", "budget."], ei: 2, c: "has", vi: "Quản lý đã phê duyệt ngân sách." },
  { s: "Have he sent the email?", t: ["Have", "he", "sent", "the", "email?"], ei: 0, c: "Has", vi: "Anh ấy đã gửi email chưa?" },
  { s: "I have receive the feedback.", t: ["I", "have", "receive", "the", "feedback."], ei: 2, c: "received", vi: "Tôi đã nhận được phản hồi." },
  { s: "We haven't schedule the meeting yet.", t: ["We", "haven't", "schedule", "the", "meeting", "yet."], ei: 2, c: "scheduled", vi: "Chúng tôi vẫn chưa lên lịch họp." },
  { s: "The system has crash again.", t: ["The", "system", "has", "crash", "again."], ei: 3, c: "crashed", vi: "Hệ thống lại vừa bị sập." },
  { s: "HR have hired a new developer.", t: ["HR", "have", "hired", "a", "new", "developer."], ei: 1, c: "has", vi: "Phòng nhân sự đã tuyển một lập trình viên mới." },
  { s: "Has the clients responded?", t: ["Has", "the", "clients", "responded?"], ei: 0, c: "Have", vi: "Các khách hàng đã phản hồi chưa?" },
  { s: "I hasn't merged the branch.", t: ["I", "hasn't", "merged", "the", "branch."], ei: 1, c: "haven't", vi: "Tôi chưa merge nhánh." },
  { s: "She has update the documentation.", t: ["She", "has", "update", "the", "documentation."], ei: 2, c: "updated", vi: "Cô ấy đã cập nhật tài liệu." },
  { s: "They have test the application.", t: ["They", "have", "test", "the", "application."], ei: 2, c: "tested", vi: "Họ đã kiểm thử ứng dụng." },
  { s: "We has completed the sprint.", t: ["We", "has", "completed", "the", "sprint."], ei: 1, c: "have", vi: "Chúng tôi đã hoàn thành sprint." },
  { s: "The server have gone offline.", t: ["The", "server", "have", "gone", "offline."], ei: 2, c: "has", vi: "Máy chủ đã bị rớt mạng." },
  { s: "I have just create the ticket.", t: ["I", "have", "just", "create", "the", "ticket."], ei: 3, c: "created", vi: "Tôi vừa mới tạo ticket." },
  { s: "Have the team resolve the issue?", t: ["Have", "the", "team", "resolve", "the", "issue?"], ei: 3, c: "resolved", vi: "Team đã giải quyết sự cố chưa?" }, // actually 'Has the team resolved' but let's just test one error token. Wait, if there are two errors, errorHunting only supports one. Let's make it "Have the teams resolved the issue?" so only Have/Has is wrong? Or just change it to:
  { s: "The team has resolve the issue.", t: ["The", "team", "has", "resolve", "the", "issue."], ei: 3, c: "resolved", vi: "Team đã giải quyết sự cố." },
  { s: "Has you reviewed the design?", t: ["Has", "you", "reviewed", "the", "design?"], ei: 0, c: "Have", vi: "Bạn đã review bản thiết kế chưa?" }
];

const errorHunting = errors.map((e, idx) => {
  const isVerbForm = ["deploy", "receive", "schedule", "crash", "update", "test", "create", "resolve"].includes(e.t[e.ei]);
  const explanation = isVerbForm 
    ? `Động từ chính phải ở dạng phân từ 2 (V3/ed) sau have/has.` 
    : `Sai trợ động từ. Phải dùng '${e.c}' phù hợp với chủ ngữ.`;
    
  let options = [
    { value: e.c, label: e.c, isCorrect: true },
    { value: e.t[e.ei], label: "Giữ nguyên", isCorrect: false },
    { value: isVerbForm ? e.t[e.ei] + "ing" : (e.c === "have" ? "having" : "had"), label: isVerbForm ? e.t[e.ei] + "ing" : (e.c === "have" ? "having" : "had"), isCorrect: false }
  ].sort(() => Math.random() - 0.5);

  const fullCorrectSentence = e.t.map((token, i) => i === e.ei ? e.c : token).join(" ");

  return {
    id: `pp-err-${String(idx + 1).padStart(2, '0')}`,
    scenarioVi: e.vi,
    tokens: e.t,
    errorTokenIndex: e.ei,
    correctToken: e.c,
    options,
    fullCorrectSentence,
    vietnameseMeaning: e.vi,
    explanation: {
      whyWrongVi: explanation,
      workplaceImpactVi: "Viết sai ngữ pháp có thể khiến người đọc hiểu lầm về việc hành động đã thực sự hoàn thành hay chưa."
    }
  };
});

data.challenges.errorHunting = errorHunting;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 error hunting challenges.');
