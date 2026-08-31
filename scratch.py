import json

def generate_json():
    # Past Perfect Continuous: had been + V-ing
    # 50% IT/DevOps, 50% Office/Business
    # 20 items per category
    
    metadata = {
        "id": "past-perfect-continuous",
        "slug": "past-perfect-continuous",
        "name": "Past Perfect Continuous",
        "vietnameseName": "Thì Quá Khứ Hoàn Thành Tiếp Diễn",
        "group": "past",
        "status": "active",
        "level": "B1-B2 (Intermediate)",
        "description": "Sử dụng để nhấn mạnh khoảng thời gian của một hành động đã diễn ra liên tục cho tới một thời điểm hoặc một hành động khác trong quá khứ.",
        "estimatedMinutes": 15,
        "challengeCount": 80
    }
    
    quick_rules = [
        {
            "id": "qr-1",
            "category": "action-verbs",
            "titleVi": "Cấu trúc chung",
            "titleEn": "General Structure",
            "summaryVi": "Sử dụng had been + V-ing cho tất cả các ngôi.",
            "formulas": [
                {
                    "label": "Khẳng định (+)",
                    "structure": "S + had been + V-ing",
                    "example": "We had been debugging for hours before we found the root cause.",
                    "vietnameseTranslation": "Chúng tôi đã debug trong nhiều giờ trước khi tìm ra nguyên nhân gốc rễ."
                },
                {
                    "label": "Phủ định (-)",
                    "structure": "S + hadn't been + V-ing",
                    "example": "They hadn't been using the new system properly until the training.",
                    "vietnameseTranslation": "Họ đã không sử dụng hệ thống mới đúng cách cho đến khi có buổi đào tạo."
                },
                {
                    "label": "Nghi vấn (?)",
                    "structure": "Had + S + been + V-ing?",
                    "example": "Had she been working on that report before the meeting?",
                    "vietnameseTranslation": "Cô ấy có đang làm báo cáo đó trước cuộc họp không?"
                }
            ],
            "rulesList": [
                {
                    "ruleVi": "Nhấn mạnh tính liên tục của hành động kéo dài đến một thời điểm trong quá khứ.",
                    "condition": "Dùng với for, since, how long...",
                    "examples": [
                        {"en": "I had been waiting for 30 minutes when he arrived.", "vi": "Tôi đã đợi được 30 phút thì anh ấy đến."}
                    ]
                }
            ]
        },
        {
            "id": "qr-2",
            "category": "workplace-usage",
            "titleVi": "Ứng dụng nơi công sở",
            "titleEn": "Workplace Usage",
            "summaryVi": "Giải thích nguyên nhân của một kết quả trong quá khứ hoặc báo cáo thời gian đã bỏ ra cho một dự án trước khi có sự cố.",
            "workplaceTips": [
                "Sử dụng trong các buổi họp post-mortem (rút kinh nghiệm) để giải thích tình trạng hệ thống hoặc công việc trước khi sự cố xảy ra.",
                "Thường đi kèm với các từ chỉ nguyên nhân kết quả như because."
            ],
            "rulesList": [
                {
                    "ruleVi": "Nguyên nhân của một kết quả trong quá khứ",
                    "condition": "Hành động kéo dài gây ra kết quả có thể thấy được.",
                    "examples": [
                        {"en": "The server crashed because it had been processing too many requests.", "vi": "Máy chủ bị sập vì nó đã và đang xử lý quá nhiều yêu cầu."}
                    ]
                }
            ]
        },
        {
            "id": "qr-3",
            "category": "spelling-rules",
            "titleVi": "Quy tắc thêm -ing",
            "titleEn": "Spelling Rules for -ing",
            "summaryVi": "Cách thêm đuôi -ing vào động từ (tương tự các thì tiếp diễn khác).",
            "rulesList": [
                {
                    "ruleVi": "Bỏ e rồi thêm ing",
                    "condition": "Động từ tận cùng bằng 1 chữ e (trừ ee, oe, ye)",
                    "examples": [
                        {"en": "update -> updating", "vi": "cập nhật"},
                        {"en": "write -> writing", "vi": "viết"}
                    ]
                }
            ]
        }
    ]
    
    conjugations = []
    error_hunting = []
    sentence_building = []
    devops_challenge = []
    
    # 1. Conjugation (20 items: 10 IT, 10 Business)
    for i in range(1, 11):
        conjugations.append({
            "id": f"past-perfect-cont-conj-{i}",
            "contextType": "email",
            "scenarioVi": f"Giải thích lý do sập hệ thống (IT)",
            "textBefore": "The database failed because it ",
            "baseVerb": "run",
            "textAfter": " out of memory for hours.",
            "correctAnswer": "had been running",
            "options": ["had been running", "was running", "had run"],
            "explanation": {"ruleVi": "Quá khứ hoàn thành tiếp diễn", "detailedAnalysisVi": "Hành động xảy ra và kéo dài liên tục trước một thời điểm quá khứ (database failed)."}
        })
    for i in range(11, 21):
        conjugations.append({
            "id": f"past-perfect-cont-conj-{i}",
            "contextType": "report",
            "scenarioVi": f"Báo cáo dự án (Business)",
            "textBefore": "We ",
            "baseVerb": "negotiate",
            "textAfter": " with the client for months before they signed.",
            "correctAnswer": "had been negotiating",
            "options": ["had been negotiating", "had negotiated", "were negotiating"],
            "explanation": {"ruleVi": "Quá khứ hoàn thành tiếp diễn nhấn mạnh khoảng thời gian.", "detailedAnalysisVi": "Hành động thương lượng diễn ra liên tục trước khi họ ký hợp đồng."}
        })
        
    # 2. Error Hunting (20 items: 10 IT, 10 Business)
    for i in range(1, 11):
        error_hunting.append({
            "id": f"past-perfect-cont-err-{i}",
            "scenarioVi": "Kiểm tra log sự cố",
            "tokens": ["The", "API", "has", "been", "failing", "before", "we", "restarted", "it"],
            "errorTokenIndex": 2,
            "correctToken": "had",
            "options": [
                {"value": "has", "label": "has", "isCorrect": False},
                {"value": "had", "label": "had", "isCorrect": True}
            ],
            "fullCorrectSentence": "The API had been failing before we restarted it",
            "vietnameseMeaning": "API đã và đang bị lỗi trước khi chúng tôi khởi động lại nó.",
            "explanation": {"whyWrongVi": "Phải dùng had cho sự việc diễn ra trước hành động trong quá khứ.", "workplaceImpactVi": "Sai thì sẽ làm sai lệch trình tự thời gian báo cáo sự cố."}
        })
    for i in range(11, 21):
        error_hunting.append({
            "id": f"past-perfect-cont-err-{i}",
            "scenarioVi": "Email giải trình khách hàng",
            "tokens": ["She", "was", "been", "waiting", "for", "the", "approval"],
            "errorTokenIndex": 1,
            "correctToken": "had",
            "options": [
                {"value": "was", "label": "was", "isCorrect": False},
                {"value": "had", "label": "had", "isCorrect": True}
            ],
            "fullCorrectSentence": "She had been waiting for the approval",
            "vietnameseMeaning": "Cô ấy đã và đang chờ phê duyệt.",
            "explanation": {"whyWrongVi": "Cấu trúc đúng là had been + V-ing, không phải was been.", "workplaceImpactVi": "Lỗi ngữ pháp cơ bản làm giảm tính chuyên nghiệp."}
        })
        
    # 3. Sentence Building (20 items: 10 IT, 10 Business)
    for i in range(1, 11):
        sentence_building.append({
            "id": f"past-perfect-cont-sent-{i}",
            "scenarioVi": "Trình bày lý do trễ deadline deploy",
            "vietnameseMeaning": "Họ đã và đang sửa lỗi cả đêm trước khi phát hành.",
            "scrambledTokens": [{"id": "1", "text": "before"}, {"id": "2", "text": "the release"}, {"id": "3", "text": "all night"}, {"id": "4", "text": "had been fixing"}, {"id": "5", "text": "bugs"}, {"id": "6", "text": "They"}],
            "correctTokenOrder": ["6", "4", "5", "3", "1", "2"],
            "fullSentenceEn": "They had been fixing bugs all night before the release.",
            "grammarTip": {"titleVi": "Trình tự sự kiện", "tipVi": "Mệnh đề quá khứ hoàn thành tiếp diễn đứng trước từ nối before."}
        })
    for i in range(11, 21):
        sentence_building.append({
            "id": f"past-perfect-cont-sent-{i}",
            "scenarioVi": "Kể về sự chuẩn bị cho chiến dịch",
            "vietnameseMeaning": "Nhóm marketing đã nghiên cứu thị trường trong 3 tháng.",
            "scrambledTokens": [{"id": "1", "text": "for 3 months"}, {"id": "2", "text": "researching"}, {"id": "3", "text": "The marketing team"}, {"id": "4", "text": "had been"}, {"id": "5", "text": "the market"}],
            "correctTokenOrder": ["3", "4", "2", "5", "1"],
            "fullSentenceEn": "The marketing team had been researching the market for 3 months.",
            "grammarTip": {"titleVi": "Khoảng thời gian", "tipVi": "Sử dụng for + khoảng thời gian."}
        })

    # 4. DevOps Challenge (20 items: Mix of 3 types)
    for i in range(1, 8): # 7 conjugation
        devops_challenge.append({
            "id": f"past-perfect-cont-devops-{i}",
            "challengeType": "conjugation",
            "contextType": "chat",
            "scenarioVi": "Chat trên Slack về vấn đề memory leak",
            "textBefore": "The pod ",
            "baseVerb": "consume",
            "textAfter": " too much CPU before it was killed.",
            "correctAnswer": "had been consuming",
            "options": ["had been consuming", "has been consuming", "was consumed"],
            "explanation": {"ruleVi": "Qúa khứ hoàn thành tiếp diễn", "detailedAnalysisVi": "Nhấn mạnh quá trình tiêu thụ CPU kéo dài trước khi bị hệ thống kill."}
        })
    for i in range(8, 15): # 7 error hunting
        devops_challenge.append({
            "id": f"past-perfect-cont-devops-{i}",
            "challengeType": "errorHunting",
            "scenarioVi": "Đọc log phân tích RCA",
            "tokens": ["The", "worker", "had", "processing", "the", "queue"],
            "errorTokenIndex": 2,
            "correctToken": "had been",
            "options": [
                {"value": "had", "label": "had", "isCorrect": False},
                {"value": "had been", "label": "had been", "isCorrect": True}
            ],
            "fullCorrectSentence": "The worker had been processing the queue",
            "vietnameseMeaning": "Worker đã và đang xử lý hàng đợi.",
            "explanation": {"whyWrongVi": "Thiếu been trong cấu trúc hoàn thành tiếp diễn.", "workplaceImpactVi": "Sai cấu trúc ngữ pháp."}
        })
    for i in range(15, 21): # 6 sentence building
        devops_challenge.append({
            "id": f"past-perfect-cont-devops-{i}",
            "challengeType": "sentenceBuilding",
            "scenarioVi": "Viết ticket Jira về CI/CD",
            "vietnameseMeaning": "Pipeline đã thất bại trong nhiều giờ trước khi tôi nhận thấy.",
            "scrambledTokens": [{"id": "1", "text": "failing"}, {"id": "2", "text": "for hours"}, {"id": "3", "text": "before I noticed"}, {"id": "4", "text": "The pipeline"}, {"id": "5", "text": "had been"}],
            "correctTokenOrder": ["4", "5", "1", "2", "3"],
            "fullSentenceEn": "The pipeline had been failing for hours before I noticed.",
            "grammarTip": {"titleVi": "Hành động liên tục", "tipVi": "Mô tả trạng thái lỗi liên tục của CI pipeline."}
        })

    data = {
        "metadata": metadata,
        "quickRules": quick_rules,
        "challenges": {
            "conjugation": conjugations,
            "errorHunting": error_hunting,
            "sentenceBuilding": sentence_building,
            "devOpsChallenge": devops_challenge
        }
    }
    
    with open("F:/projects/gamehub/src/data/tenses/past-perfect-continuous.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

generate_json()
