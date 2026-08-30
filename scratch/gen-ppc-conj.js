const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect-continuous.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const verbs = [
  { v: 'work', ving: 'working', s: 'I', textBefore: 'I ', textAfter: ' on this task all morning.', extVi: 'Tôi đã làm việc với tác vụ này suốt cả sáng.' },
  { v: 'debug', ving: 'debugging', s: 'We', textBefore: 'We ', textAfter: ' the core system for three hours.', extVi: 'Chúng tôi đã debug hệ thống lõi được 3 giờ đồng hồ.' },
  { v: 'monitor', ving: 'monitoring', s: 'She', textBefore: 'She ', textAfter: ' the server logs lately.', extVi: 'Dạo gần đây cô ấy liên tục theo dõi log máy chủ.' },
  { v: 'wait', ving: 'waiting', s: 'The team', textBefore: 'The team ', textAfter: ' for the client\'s approval since Monday.', extVi: 'Nhóm đã và đang chờ sự phê duyệt của khách hàng từ thứ Hai.' },
  { v: 'develop', ving: 'developing', s: 'They', textBefore: 'They ', textAfter: ' the new API all week.', extVi: 'Họ đã và đang phát triển API mới suốt cả tuần.' },
  { v: 'review', ving: 'reviewing', s: 'He', textBefore: 'He ', textAfter: ' code for the past two hours.', extVi: 'Anh ấy đã ngồi review code trong suốt 2 tiếng qua.' },
  { v: 'test', ving: 'testing', s: 'We', textBefore: 'We ', textAfter: ' the payment gateway extensively.', extVi: 'Chúng tôi đã và đang kiểm thử cổng thanh toán một cách rộng rãi.' },
  { v: 'try', ving: 'trying', s: 'I', textBefore: 'I ', textAfter: ' to reproduce the bug since yesterday.', extVi: 'Tôi đã liên tục thử tái hiện lại lỗi đó từ hôm qua.' },
  { v: 'run', ving: 'running', s: 'The script', textBefore: 'The script ', textAfter: ' in the background for 24 hours.', extVi: 'Kịch bản đã chạy ngầm được 24 giờ.' },
  { v: 'update', ving: 'updating', s: 'IT support', textBefore: 'IT support ', textAfter: ' the software on all machines.', extVi: 'Bộ phận IT đã và đang cập nhật phần mềm trên tất cả các máy.' },
  { v: 'write', ving: 'writing', s: 'She', textBefore: 'She ', textAfter: ' the project documentation all day.', extVi: 'Cô ấy đã viết tài liệu dự án suốt cả ngày.' },
  { v: 'interview', ving: 'interviewing', s: 'HR', textBefore: 'HR ', textAfter: ' candidates for the senior dev role.', extVi: 'Phòng nhân sự đã và đang phỏng vấn các ứng viên cho vị trí lập trình viên cấp cao.' },
  { v: 'plan', ving: 'planning', s: 'We', textBefore: 'We ', textAfter: ' the upcoming sprint.', extVi: 'Chúng tôi đã và đang lên kế hoạch cho sprint sắp tới.' },
  { v: 'investigate', ving: 'investigating', s: 'The security team', textBefore: 'The security team ', textAfter: ' the data breach.', extVi: 'Đội bảo mật đang điều tra vụ rò rỉ dữ liệu.' },
  { v: 'compile', ving: 'compiling', s: 'The application', textBefore: 'The application ', textAfter: ' for ten minutes.', extVi: 'Ứng dụng đã được biên dịch suốt mười phút qua.' },
  { v: 'design', ving: 'designing', s: 'He', textBefore: 'He ', textAfter: ' the new user interface lately.', extVi: 'Anh ấy đã thiết kế giao diện người dùng mới dạo gần đây.' },
  { v: 'migrate', ving: 'migrating', s: 'They', textBefore: 'They ', textAfter: ' the database since last night.', extVi: 'Họ đã và đang migrate cơ sở dữ liệu từ đêm qua.' },
  { v: 'analyze', ving: 'analyzing', s: 'I', textBefore: 'I ', textAfter: ' the performance metrics all week.', extVi: 'Tôi đã phân tích các chỉ số hiệu suất suốt cả tuần.' },
  { v: 'train', ving: 'training', s: 'The manager', textBefore: 'The manager ', textAfter: ' the new recruits.', extVi: 'Quản lý đã và đang đào tạo các nhân viên mới.' },
  { v: 'negotiate', ving: 'negotiating', s: 'We', textBefore: 'We ', textAfter: ' the contract terms for a month.', extVi: 'Chúng tôi đã đàm phán các điều khoản hợp đồng được một tháng rồi.' }
];

const conjugation = verbs.map((v, idx) => {
  const isSingular = ['She', 'He', 'The team', 'The script', 'IT support', 'HR', 'The security team', 'The application', 'The manager'].includes(v.s);
  const aux = isSingular ? "has been" : "have been";
  const ans = `${aux} ${v.ving}`;
  
  const options = [
    ans,
    `${isSingular ? "have been" : "has been"} ${v.ving}`, // wrong aux
    `${aux} ${v.v}`, // missing ing
    `${isSingular ? "has" : "have"} ${v.v}` // simple present perfect form instead of continuous
  ].sort(() => Math.random() - 0.5);

  return {
    id: `ppc-conj-${String(idx + 1).padStart(2, '0')}`,
    contextType: "email",
    scenarioVi: v.extVi,
    sender: "dev@company.com",
    recipient: "team@company.com",
    subject: "Status Update",
    textBefore: v.textBefore,
    baseVerb: v.v,
    textAfter: v.textAfter,
    correctAnswer: ans,
    acceptableAlternatives: [ans.toUpperCase(), ans.toLowerCase()],
    options,
    explanation: {
      ruleVi: `Chủ ngữ '${v.s}' đi với '${aux}' và động từ chính thêm '-ing' (${v.ving}).`,
      detailedAnalysisVi: `Thì Hiện Tại Hoàn Thành Tiếp Diễn (have/has + been + V-ing) dùng để diễn tả hành động kéo dài liên tục từ quá khứ đến hiện tại.`
    }
  };
});

data.challenges.conjugation = conjugation;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 PPC conjugation challenges.');
