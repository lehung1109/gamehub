const fs = require('fs');

const path = 'src/data/tenses/present-simple.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newItems = [
  {
    "id": "conj-09",
    "contextType": "email",
    "scenarioVi": "Email xác nhận quy trình phê duyệt tài liệu",
    "sender": "Project Manager",
    "recipient": "Design Team",
    "subject": "Approval Process",
    "textBefore": "The lead designer ",
    "baseVerb": "review",
    "textAfter": " all creative assets before they go live.",
    "correctAnswer": "reviews",
    "acceptableAlternatives": ["REVIEWS"],
    "options": ["review", "reviews", "reviewing", "is review"],
    "explanation": {
      "ruleVi": "Chủ ngữ ngôi thứ ba số ít cần thêm '-s'.",
      "detailedAnalysisVi": "'The lead designer' là ngôi thứ 3 số ít, nên động từ 'review' thêm 's' thành 'reviews'."
    }
  },
  {
    "id": "conj-10",
    "contextType": "meeting",
    "scenarioVi": "Giải thích quy trình báo cáo trong cuộc họp",
    "sender": "HR Manager",
    "recipient": "New Hires",
    "subject": "Onboarding Session",
    "textBefore": "Our managers usually ",
    "baseVerb": "hold",
    "textAfter": " one-on-one sessions every Friday.",
    "correctAnswer": "hold",
    "acceptableAlternatives": ["HOLD"],
    "options": ["hold", "holds", "holding", "is hold"],
    "explanation": {
      "ruleVi": "Chủ ngữ số nhiều đi với động từ nguyên thể.",
      "detailedAnalysisVi": "'Our managers' là danh từ số nhiều, nên động từ 'hold' được giữ nguyên."
    }
  },
  {
    "id": "conj-11",
    "contextType": "chat",
    "scenarioVi": "Hỏi đồng nghiệp về lịch trình chuyến bay",
    "sender": "Alex",
    "recipient": "Sarah",
    "subject": "Business Trip",
    "textBefore": "What time ",
    "baseVerb": "the flight / depart",
    "textAfter": " tomorrow morning?",
    "correctAnswer": "does the flight depart",
    "acceptableAlternatives": ["DOES THE FLIGHT DEPART"],
    "options": ["does the flight depart", "do the flight depart", "the flight departs", "is the flight depart"],
    "explanation": {
      "ruleVi": "Câu hỏi với chủ ngữ số ít dùng trợ động từ 'does'.",
      "detailedAnalysisVi": "'The flight' là chủ ngữ số ít nên dùng 'does', động từ chính ở dạng nguyên thể."
    }
  },
  {
    "id": "conj-12",
    "contextType": "routine",
    "scenarioVi": "Mô tả giờ làm việc cố định",
    "sender": "Admin",
    "recipient": "All Employees",
    "subject": "Office Hours",
    "textBefore": "The main entrance ",
    "baseVerb": "not open",
    "textAfter": " until 7:30 AM on weekdays.",
    "correctAnswer": "does not open",
    "acceptableAlternatives": ["doesn't open", "DOES NOT OPEN", "DOESN'T OPEN"],
    "options": ["do not open", "does not open", "not open", "is not open"],
    "explanation": {
      "ruleVi": "Câu phủ định với chủ ngữ số ít dùng 'does not + V'.",
      "detailedAnalysisVi": "'The main entrance' là danh từ số ít nên dùng trợ động từ 'does not' kết hợp động từ nguyên thể 'open'."
    }
  },
  {
    "id": "conj-13",
    "contextType": "report",
    "scenarioVi": "Báo cáo phân tích dữ liệu hàng tuần",
    "sender": "Data Team",
    "recipient": "Management",
    "subject": "Weekly Analytics",
    "textBefore": "These metrics clearly ",
    "baseVerb": "show",
    "textAfter": " a steady increase in user engagement.",
    "correctAnswer": "show",
    "acceptableAlternatives": ["SHOW"],
    "options": ["shows", "show", "showing", "are show"],
    "explanation": {
      "ruleVi": "Chủ ngữ số nhiều đi với động từ không chia.",
      "detailedAnalysisVi": "'These metrics' là chủ ngữ số nhiều nên động từ 'show' được giữ nguyên mẫu."
    }
  },
  {
    "id": "conj-14",
    "contextType": "email",
    "scenarioVi": "Email nhắc nhở về chính sách bảo mật",
    "sender": "IT Security",
    "recipient": "All Staff",
    "subject": "Password Policy",
    "textBefore": "The company system ",
    "baseVerb": "require",
    "textAfter": " a password change every 90 days.",
    "correctAnswer": "requires",
    "acceptableAlternatives": ["REQUIRES"],
    "options": ["require", "requires", "requiring", "is require"],
    "explanation": {
      "ruleVi": "Chủ ngữ ngôi thứ ba số ít thêm '-s'.",
      "detailedAnalysisVi": "'The company system' là số ít nên động từ 'require' thêm đuôi '-s'."
    }
  },
  {
    "id": "conj-15",
    "contextType": "chat",
    "scenarioVi": "Tin nhắn thông báo công việc đang chờ xử lý",
    "sender": "Jane (QA)",
    "recipient": "Dev Team",
    "subject": "Pending Bugs",
    "textBefore": "I ",
    "baseVerb": "not think",
    "textAfter": " we have enough time to fix this before release.",
    "correctAnswer": "do not think",
    "acceptableAlternatives": ["don't think", "DO NOT THINK", "DON'T THINK"],
    "options": ["do not think", "does not think", "not think", "am not think"],
    "explanation": {
      "ruleVi": "Chủ ngữ 'I' đi với trợ động từ phủ định 'do not'.",
      "detailedAnalysisVi": "Ngôi thứ nhất 'I' dùng trợ động từ 'do not' kết hợp động từ nguyên thể 'think'."
    }
  }
];

data.challenges.conjugation = data.challenges.conjugation.concat(newItems);

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Successfully added 7 items to conjugation challenges.');
