const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect-continuous.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const sentences = [
  { s: "I have been working on this feature all week.", vi: "Tôi đã và đang làm tính năng này cả tuần nay." },
  { s: "She has been reviewing code since morning.", vi: "Cô ấy đã ngồi review code từ sáng." },
  { s: "We have been trying to fix the bug.", vi: "Chúng tôi đã liên tục cố gắng sửa lỗi." },
  { s: "They have not been responding to our emails.", vi: "Dạo này họ không phản hồi email của chúng ta." },
  { s: "How long have you been monitoring the server?", vi: "Bạn đã theo dõi máy chủ được bao lâu rồi?" },
  { s: "The system has been running smoothly lately.", vi: "Hệ thống vẫn đang chạy mượt mà dạo gần đây." },
  { s: "I have been designing the new interface.", vi: "Tôi đã liên tục thiết kế giao diện mới." },
  { s: "Has he been attending the daily standups?", vi: "Dạo này anh ấy có tham gia các buổi họp hằng ngày không?" },
  { s: "We have been developing this product for months.", vi: "Chúng tôi đã và đang phát triển sản phẩm này trong nhiều tháng." },
  { s: "The client has been complaining about the speed.", vi: "Khách hàng liên tục phàn nàn về tốc độ." },
  { s: "I have been analyzing the data recently.", vi: "Gần đây tôi liên tục phân tích dữ liệu." },
  { s: "They have been upgrading the infrastructure.", vi: "Họ đã và đang nâng cấp cơ sở hạ tầng." },
  { s: "Our team has been performing exceptionally well.", vi: "Team của chúng ta đã và đang thể hiện cực kỳ tốt." },
  { s: "Have we been allocating enough resources?", vi: "Chúng ta có đang phân bổ đủ nguồn lực không?" },
  { s: "She has been leading the project successfully.", vi: "Cô ấy đã và đang dẫn dắt dự án rất thành công." },
  { s: "I have been investigating the security breach.", vi: "Tôi đã và đang điều tra lỗ hổng bảo mật." },
  { s: "The application has been crashing continuously.", vi: "Ứng dụng liên tục bị sập." },
  { s: "We have not been communicating effectively.", vi: "Chúng ta đã không giao tiếp hiệu quả dạo gần đây." },
  { s: "He has been managing the team remotely.", vi: "Anh ấy đã và đang quản lý team từ xa." },
  { s: "Have you been backing up the database?", vi: "Bạn có liên tục sao lưu cơ sở dữ liệu không?" }
];

const sentenceBuilding = sentences.map((item, idx) => {
  const tokens = item.s.split(" ");
  const scrambled = [];
  tokens.forEach((t, i) => scrambled.push({ id: `t${i}`, text: t }));
  scrambled.sort(() => Math.random() - 0.5);
  
  const correctOrder = [];
  const used = new Set();
  
  tokens.forEach(t => {
    const found = scrambled.find(s => s.text === t && !used.has(s.id));
    if (found) {
      correctOrder.push(found.id);
      used.add(found.id);
    }
  });

  return {
    id: `ppc-sb-${String(idx + 1).padStart(2, '0')}`,
    scenarioVi: "Sắp xếp lại câu đúng ngữ pháp",
    vietnameseMeaning: item.vi,
    scrambledTokens: scrambled.map(t => ({ id: t.id, text: t.text })),
    correctTokenOrder: correctOrder,
    fullSentenceEn: item.s,
    grammarTip: {
      titleVi: "Cấu trúc Hiện Tại Hoàn Thành Tiếp Diễn",
      tipVi: "Nhớ cấu trúc: S + have/has + been + V-ing."
    }
  };
});

data.challenges.sentenceBuilding = sentenceBuilding;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 PPC sentence building challenges.');
