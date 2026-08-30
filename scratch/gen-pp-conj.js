const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'tenses', 'present-perfect.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const verbs = [
  { v: 'finish', v3: 'finished', s: 'I', textBefore: 'I ', textAfter: ' the Q3 financial report.', extVi: 'Tôi đã hoàn thành báo cáo tài chính Q3.' },
  { v: 'deploy', v3: 'deployed', s: 'We', textBefore: 'We ', textAfter: ' the new feature to production.', extVi: 'Chúng tôi đã triển khai tính năng mới lên production.' },
  { v: 'review', v3: 'reviewed', s: 'She', textBefore: 'She ', textAfter: ' the pull request yet.', isNeg: true, extVi: 'Cô ấy vẫn chưa review pull request.' },
  { v: 'approve', v3: 'approved', s: 'The manager', textBefore: 'The manager ', textAfter: ' our budget proposal.', extVi: 'Quản lý đã phê duyệt đề xuất ngân sách của chúng ta.' },
  { v: 'fix', v3: 'fixed', s: 'They', textBefore: 'They ', textAfter: ' the critical bug in the login system.', extVi: 'Họ đã sửa lỗi nghiêm trọng trong hệ thống đăng nhập.' },
  { v: 'receive', v3: 'received', s: 'I', textBefore: 'I ', textAfter: ' any feedback from the client.', isNeg: true, extVi: 'Tôi vẫn chưa nhận được bất kỳ phản hồi nào từ khách hàng.' },
  { v: 'update', v3: 'updated', s: 'He', textBefore: 'He ', textAfter: ' the project documentation.', extVi: 'Anh ấy đã cập nhật tài liệu dự án.' },
  { v: 'schedule', v3: 'scheduled', s: 'We', textBefore: 'We ', textAfter: ' a meeting with the stakeholders.', extVi: 'Chúng tôi đã lên lịch một cuộc họp với các bên liên quan.' },
  { v: 'resolve', v3: 'resolved', s: 'The IT support team', textBefore: 'The IT support team ', textAfter: ' the network issue.', extVi: 'Đội ngũ hỗ trợ IT đã giải quyết sự cố mạng.' },
  { v: 'submit', v3: 'submitted', s: 'I', textBefore: 'I ', textAfter: ' my timesheet for this week.', extVi: 'Tôi đã nộp bảng chấm công tuần này.' },
  { v: 'launch', v3: 'launched', s: 'The marketing team', textBefore: 'The marketing team ', textAfter: ' the new campaign.', extVi: 'Đội marketing đã tung ra chiến dịch mới.' },
  { v: 'test', v3: 'tested', s: 'We', textBefore: 'We ', textAfter: ' the API endpoints thoroughly.', extVi: 'Chúng tôi đã kiểm thử kỹ lưỡng các API endpoints.' },
  { v: 'hire', v3: 'hired', s: 'HR', textBefore: 'HR ', textAfter: ' three new senior developers.', extVi: 'Phòng nhân sự đã tuyển ba lập trình viên cấp cao mới.' },
  { v: 'merge', v3: 'merged', s: 'I', textBefore: 'I ', textAfter: ' the feature branch into main.', extVi: 'Tôi đã merge nhánh tính năng vào main.' },
  { v: 'upgrade', v3: 'upgraded', s: 'The sysadmin', textBefore: 'The sysadmin ', textAfter: ' the database servers.', extVi: 'Quản trị viên hệ thống đã nâng cấp các máy chủ cơ sở dữ liệu.' },
  { v: 'respond', v3: 'responded', s: 'The vendor', textBefore: 'The vendor ', textAfter: ' to our inquiry.', isNeg: true, extVi: 'Nhà cung cấp vẫn chưa phản hồi yêu cầu của chúng tôi.' },
  { v: 'complete', v3: 'completed', s: 'We', textBefore: 'We ', textAfter: ' the first sprint successfully.', extVi: 'Chúng tôi đã hoàn thành sprint đầu tiên một cách thành công.' },
  { v: 'install', v3: 'installed', s: 'I', textBefore: 'I ', textAfter: ' the required software dependencies.', extVi: 'Tôi đã cài đặt các dependencies phần mềm được yêu cầu.' },
  { v: 'migrate', v3: 'migrated', s: 'They', textBefore: 'They ', textAfter: ' the legacy data to the new system.', extVi: 'Họ đã migrate dữ liệu cũ sang hệ thống mới.' },
  { v: 'create', v3: 'created', s: 'She', textBefore: 'She ', textAfter: ' a new Jira ticket for the issue.', extVi: 'Cô ấy đã tạo một ticket Jira mới cho vấn đề này.' }
];

const conjugation = verbs.map((v, idx) => {
  const isSingular = ['She', 'He', 'The manager', 'The IT support team', 'The marketing team', 'HR', 'The sysadmin', 'The vendor'].includes(v.s);
  const aux = isSingular ? (v.isNeg ? "hasn't" : "has") : (v.isNeg ? "haven't" : "have");
  const ans = `${aux} ${v.v3}`;
  
  const options = [
    ans,
    `${isSingular ? (v.isNeg ? "haven't" : "have") : (v.isNeg ? "hasn't" : "has")} ${v.v3}`, // wrong aux
    `${aux} ${v.v}`, // wrong verb form
    `${isSingular ? (v.isNeg ? "haven't" : "have") : (v.isNeg ? "hasn't" : "has")} ${v.v}` // wrong aux and form
  ].sort(() => Math.random() - 0.5);

  return {
    id: `pp-conj-${String(idx + 1).padStart(2, '0')}`,
    contextType: "email",
    scenarioVi: v.extVi,
    sender: "employee@company.com",
    recipient: "team@company.com",
    subject: "Project Update",
    textBefore: v.textBefore,
    baseVerb: v.isNeg ? `not ${v.v}` : v.v,
    textAfter: v.textAfter,
    correctAnswer: ans,
    acceptableAlternatives: [ans.toUpperCase(), ans.toLowerCase()],
    options,
    explanation: {
      ruleVi: `Chủ ngữ '${v.s}' đi với trợ động từ '${aux}' và động từ chính ở dạng phân từ 2 (${v.v3}).`,
      detailedAnalysisVi: `Trong thì Hiện Tại Hoàn Thành, ta dùng have/has + V3/ed để diễn tả hành động đã hoàn thành.`
    }
  };
});

data.challenges.conjugation = conjugation;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added 20 conjugation challenges.');
