const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const sentences = [
  { s: "I have finished the presentation.", vi: "Tôi đã hoàn thành bài thuyết trình." },
  { s: "She has already left the office.", vi: "Cô ấy đã rời khỏi văn phòng rồi." },
  { s: "We have just launched the new app.", vi: "Chúng tôi vừa mới ra mắt ứng dụng mới." },
  { s: "They have not responded to our email.", vi: "Họ chưa phản hồi email của chúng ta." },
  { s: "Have you seen the latest sales report?", vi: "Bạn đã xem báo cáo doanh số mới nhất chưa?" },
  { s: "The server has been down since morning.", vi: "Máy chủ đã bị sập từ sáng." },
  { s: "I have worked here for five years.", vi: "Tôi đã làm việc ở đây được 5 năm." },
  { s: "Has he submitted the project proposal?", vi: "Anh ấy đã nộp đề xuất dự án chưa?" },
  { s: "We have successfully migrated the database.", vi: "Chúng tôi đã migrate cơ sở dữ liệu thành công." },
  { s: "The client has agreed to the new terms.", vi: "Khách hàng đã đồng ý với các điều khoản mới." },
  { s: "I have never used this framework before.", vi: "Tôi chưa bao giờ sử dụng framework này trước đây." },
  { s: "They have updated the company policies recently.", vi: "Gần đây họ đã cập nhật chính sách công ty." },
  { s: "Our team has achieved all the sprint goals.", vi: "Team của chúng ta đã đạt được tất cả mục tiêu của sprint." },
  { s: "Have we received any feedback yet?", vi: "Chúng ta đã nhận được phản hồi nào chưa?" },
  { s: "She has been a great mentor to me.", vi: "Cô ấy đã là một người hướng dẫn tuyệt vời đối với tôi." },
  { s: "I have reviewed all the pull requests.", vi: "Tôi đã review tất cả các pull request." },
  { s: "The marketing campaign has generated many leads.", vi: "Chiến dịch marketing đã tạo ra nhiều khách hàng tiềm năng." },
  { s: "We have not tested the payment gateway yet.", vi: "Chúng tôi vẫn chưa kiểm thử cổng thanh toán." },
  { s: "He has fixed the bug in the authentication module.", vi: "Anh ấy đã sửa lỗi trong module xác thực." },
  { s: "Have you installed the required software?", vi: "Bạn đã cài đặt phần mềm được yêu cầu chưa?" }
];

const sentenceBuilding = sentences.map((item, idx) => {
  const tokens = item.s.split(" ");
  const scrambled = tokens.map((t, i) => ({ id: `t${i}`, text: t })).sort(() => Math.random() - 0.5);
  const correctOrder = tokens.map((t, i) => {
    return scrambled.find(sc => sc.text === t && !sc.used) || scrambled.find(sc => sc.text === t);
  }).map(sc => sc.id); // this is a simple naive mapping assuming unique words or accepting duplicate identical tokens if any

  return {
    id: `pp-sb-${String(idx + 1).padStart(2, '0')}`,
    scenarioVi: "Sắp xếp lại câu đúng ngữ pháp",
    vietnameseMeaning: item.vi,
    scrambledTokens: scrambled.map(t => ({ id: t.id, text: t.text })),
    correctTokenOrder: correctOrder,
    fullSentenceEn: item.s,
    grammarTip: {
      titleVi: "Cấu trúc Hiện Tại Hoàn Thành",
      tipVi: "Nhớ đặt have/has trước động từ phân từ 2 (V3/ed)."
    }
  };
});

// Fix duplicate tokens issue in mapping
sentences.forEach((item, idx) => {
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
  
  sentenceBuilding[idx].scrambledTokens = scrambled;
  sentenceBuilding[idx].correctTokenOrder = correctOrder;
});

data.challenges.sentenceBuilding = sentenceBuilding;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 sentence building challenges.');
