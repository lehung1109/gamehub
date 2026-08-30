const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect-continuous.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const errors = [
  { s: "I has been working on this ticket.", t: ["I", "has", "been", "working", "on", "this", "ticket."], ei: 1, c: "have", vi: "Tôi đã và đang làm việc trên ticket này." },
  { s: "We have be testing the API.", t: ["We", "have", "be", "testing", "the", "API."], ei: 2, c: "been", vi: "Chúng tôi đã liên tục kiểm thử API." },
  { s: "She have been reviewing code.", t: ["She", "have", "been", "reviewing", "code."], ei: 1, c: "has", vi: "Cô ấy đã và đang review code." },
  { s: "They hasn't been fixing the bugs.", t: ["They", "hasn't", "been", "fixing", "the", "bugs."], ei: 1, c: "haven't", vi: "Họ không tập trung sửa lỗi dạo gần đây." },
  { s: "The system has been crash frequently.", t: ["The", "system", "has", "been", "crash", "frequently."], ei: 4, c: "crashing", vi: "Hệ thống liên tục bị sập thường xuyên." },
  { s: "Have he been sending the reports?", t: ["Have", "he", "been", "sending", "the", "reports?"], ei: 0, c: "Has", vi: "Anh ấy có liên tục gửi báo cáo không?" },
  { s: "I have been receive spam emails.", t: ["I", "have", "been", "receive", "spam", "emails."], ei: 3, c: "receiving", vi: "Tôi liên tục nhận được email rác." },
  { s: "We haven't been schedule meetings.", t: ["We", "haven't", "been", "schedule", "meetings."], ei: 3, c: "scheduling", vi: "Chúng tôi đã không lên lịch họp thường xuyên." },
  { s: "The server has be running smoothly.", t: ["The", "server", "has", "be", "running", "smoothly."], ei: 3, c: "been", vi: "Máy chủ vẫn đang chạy mượt mà." },
  { s: "HR have been hiring actively.", t: ["HR", "have", "been", "hiring", "actively."], ei: 1, c: "has", vi: "Phòng nhân sự đã và đang tuyển dụng tích cực." },
  { s: "Has the clients been complaining?", t: ["Has", "the", "clients", "been", "complaining?"], ei: 0, c: "Have", vi: "Khách hàng có liên tục phàn nàn không?" },
  { s: "I hasn't been joining the standups.", t: ["I", "hasn't", "been", "joining", "the", "standups."], ei: 1, c: "haven't", vi: "Dạo này tôi không tham gia các buổi standup." },
  { s: "She has been update the wiki.", t: ["She", "has", "been", "update", "the", "wiki."], ei: 3, c: "updating", vi: "Cô ấy liên tục cập nhật wiki." },
  { s: "They have been test the new UI.", t: ["They", "have", "been", "test", "the", "new", "UI."], ei: 3, c: "testing", vi: "Họ đã liên tục kiểm thử UI mới." },
  { s: "We has been monitoring the logs.", t: ["We", "has", "been", "monitoring", "the", "logs."], ei: 1, c: "have", vi: "Chúng tôi đã và đang theo dõi logs." },
  { s: "The database have been responding slowly.", t: ["The", "database", "have", "been", "responding", "slowly."], ei: 2, c: "has", vi: "Cơ sở dữ liệu liên tục phản hồi chậm." },
  { s: "I have been just working on it.", t: ["I", "have", "been", "just", "working", "on", "it."], ei: 3, c: "recently", vi: "Gần đây tôi luôn làm việc với nó." }, // Replace 'just' with 'recently'
  { s: "Have the team been resolve issues?", t: ["Have", "the", "team", "been", "resolve", "issues?"], ei: 4, c: "resolving", vi: "Team có liên tục giải quyết các sự cố không?" },
  { s: "The network has been drop connections.", t: ["The", "network", "has", "been", "drop", "connections."], ei: 4, c: "dropping", vi: "Mạng liên tục bị rớt kết nối." },
  { s: "Has you been reviewing the design?", t: ["Has", "you", "been", "reviewing", "the", "design?"], ei: 0, c: "Have", vi: "Bạn có liên tục review thiết kế không?" }
];

const errorHunting = errors.map((e, idx) => {
  const isBeen = e.c === "been";
  const isAux = e.c === "have" || e.c === "has" || e.c === "haven't" || e.c === "Has" || e.c === "Have";
  const isVing = e.c.endsWith("ing");
  
  let explanation = "";
  if (isBeen) explanation = "Thì Hiện Tại Hoàn Thành Tiếp Diễn cần 'been' sau have/has.";
  else if (isAux) explanation = `Sai trợ động từ. Phải dùng '${e.c}' để phù hợp với chủ ngữ.`;
  else if (isVing) explanation = "Động từ chính phải thêm '-ing' trong thì tiếp diễn.";
  else explanation = "Lỗi dùng từ không phù hợp trong cấu trúc tiếp diễn.";
    
  let options = [
    { value: e.c, label: e.c, isCorrect: true },
    { value: e.t[e.ei], label: "Giữ nguyên", isCorrect: false },
    { value: isVing ? e.t[e.ei] + "ed" : (isAux ? (e.c.toLowerCase().includes("has") ? "have" : "has") : "being"), label: isVing ? e.t[e.ei] + "ed" : (isAux ? (e.c.toLowerCase().includes("has") ? "have" : "has") : "being"), isCorrect: false }
  ].sort(() => Math.random() - 0.5);

  const fullCorrectSentence = e.t.map((token, i) => i === e.ei ? e.c : token).join(" ");

  return {
    id: `ppc-err-${String(idx + 1).padStart(2, '0')}`,
    scenarioVi: e.vi,
    tokens: e.t,
    errorTokenIndex: e.ei,
    correctToken: e.c,
    options,
    fullCorrectSentence,
    vietnameseMeaning: e.vi,
    explanation: {
      whyWrongVi: explanation,
      workplaceImpactVi: "Lỗi ngữ pháp có thể làm mờ đi tính liên tục của hành động mà bạn muốn nhấn mạnh."
    }
  };
});

data.challenges.errorHunting = errorHunting;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 PPC error hunting challenges.');
