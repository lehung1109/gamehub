# Feature Specification: Student Progress Tracking

**Feature Branch**: `004-student-progress-tracking`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "Tính năng theo dõi tiến trình học tập — Hướng A (tất cả trên Supabase). Giáo viên tạo mã lớp, học sinh nhập mã lớp + tên trước khi chơi (popup, có thể bỏ qua). Lưu kết quả chi tiết từng câu hỏi. Dashboard giáo viên với tổng quan lớp, chi tiết từng học sinh, phân tích từ khó, và xuất báo cáo CSV. Học sinh không cần thấy tiến trình."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Giáo viên tạo và quản lý lớp học (Priority: P1)

Giáo viên đăng nhập vào admin, tạo một lớp học mới với tên lớp tùy chọn. Hệ thống tự động sinh mã lớp ngắn, dễ nhớ (VD: `LOPA-2025`). Giáo viên chia sẻ mã lớp này cho học sinh (đọc to, viết bảng, hoặc in ra). Giáo viên có thể xem danh sách lớp đã tạo, đổi tên, hoặc vô hiệu hóa lớp cũ.

**Why this priority**: Lớp học là nền tảng để gắn kết học sinh với giáo viên. Không có lớp, không có cách nào liên kết kết quả chơi game của học sinh với giáo viên cụ thể. Đây là yêu cầu tiên quyết cho mọi user story khác.

**Independent Test**: Có thể kiểm tra hoàn chỉnh bằng cách đăng nhập admin, tạo lớp, xem mã lớp được sinh ra, đổi tên lớp, và vô hiệu hóa lớp. Mang lại giá trị: giáo viên có hạ tầng tổ chức lớp sẵn sàng.

**Acceptance Scenarios**:

1. **Given** giáo viên đã đăng nhập, **When** giáo viên tạo lớp với tên "Lớp 1A - 2025", **Then** hệ thống tạo lớp thành công và hiển thị mã lớp ngắn gồm 6-8 ký tự chữ-số viết hoa.
2. **Given** giáo viên đã tạo lớp, **When** giáo viên mở danh sách lớp, **Then** lớp mới hiển thị với tên, mã lớp, ngày tạo, và số lượng học sinh (ban đầu là 0).
3. **Given** giáo viên có lớp đang hoạt động, **When** giáo viên vô hiệu hóa lớp, **Then** lớp chuyển sang trạng thái không hoạt động, mã lớp không còn nhận học sinh mới, nhưng dữ liệu lịch sử vẫn được bảo toàn.
4. **Given** giáo viên nhập tên lớp trống hoặc vượt quá 200 ký tự, **When** giáo viên nhấn tạo, **Then** hệ thống hiển thị lỗi validation phù hợp.

---

### User Story 2 - Học sinh nhập mã lớp và tên trước khi chơi (Priority: P2)

Khi học sinh mở một game bất kỳ, hệ thống hiện popup nhẹ nhàng hỏi mã lớp và tên học sinh. Học sinh có thể nhập mã lớp + tên để kết quả được ghi nhận, hoặc bỏ qua để chơi ẩn danh (giống trải nghiệm hiện tại). Sau khi nhập thành công lần đầu, thông tin được lưu vào session — các lần chơi sau không hỏi lại.

**Why this priority**: Đây là cầu nối giữa hệ thống lớp (US1) và việc ghi nhận kết quả (US3). Nếu không có bước này, không có cách nào biết ai đang chơi.

**Independent Test**: Mở trang game, xác nhận popup hiện lên, nhập mã lớp hợp lệ + tên, popup đóng, chuyển sang game khác và xác nhận popup không hỏi lại. Thử bỏ qua popup và xác nhận game vẫn hoạt động bình thường.

**Acceptance Scenarios**:

1. **Given** học sinh chưa nhập thông tin (session trống), **When** học sinh mở bất kỳ trang game nào, **Then** popup hiển thị với 2 trường: mã lớp và tên học sinh, cùng nút "Vào lớp" và "Bỏ qua".
2. **Given** học sinh nhập mã lớp hợp lệ và tên, **When** học sinh nhấn "Vào lớp", **Then** hệ thống xác thực mã lớp, lưu thông tin vào session, đóng popup, và game bắt đầu bình thường. Tên học sinh hiển thị nhỏ gọn trên giao diện game.
3. **Given** học sinh nhập mã lớp không tồn tại hoặc đã vô hiệu hóa, **When** học sinh nhấn "Vào lớp", **Then** hệ thống hiển thị thông báo lỗi thân thiện: "Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍".
4. **Given** học sinh đã nhập thông tin trước đó (session có dữ liệu), **When** học sinh mở game khác, **Then** popup không hiện, game bắt đầu ngay.
5. **Given** học sinh nhấn "Bỏ qua", **When** game tải, **Then** game hoạt động bình thường như hiện tại (ẩn danh), không ghi nhận kết quả.
6. **Given** học sinh đã nhập thông tin và muốn đổi, **When** học sinh nhấn vào tên hiển thị trên game, **Then** popup mở lại cho phép nhập thông tin mới hoặc chuyển sang ẩn danh.

---

### User Story 3 - Ghi nhận kết quả chi tiết từng câu hỏi (Priority: P3)

Khi học sinh (đã nhập mã lớp + tên) hoàn thành một phiên chơi game, hệ thống tự động ghi nhận kết quả chi tiết: game nào, chủ đề gì, từng câu hỏi đúng/sai, nội dung câu hỏi (từ vựng/chữ cái/số/câu), đáp án đã chọn, đáp án đúng, và thời gian trả lời mỗi câu. Quá trình ghi nhận hoàn toàn tự động, không ảnh hưởng đến trải nghiệm chơi.

**Why this priority**: Dữ liệu chi tiết từng câu là nền tảng cho mọi báo cáo và phân tích. Không có dữ liệu, dashboard giáo viên không có gì để hiển thị.

**Independent Test**: Đăng nhập học sinh với mã lớp, chơi hoàn thành 1 game, kiểm tra database xác nhận dữ liệu phiên chơi và từng câu trả lời được lưu đúng. Chơi ẩn danh và xác nhận không có dữ liệu nào được ghi.

**Acceptance Scenarios**:

1. **Given** học sinh đã nhập mã lớp hợp lệ, **When** học sinh hoàn thành một phiên chơi Listening quiz với 10 câu (7 đúng, 3 sai), **Then** hệ thống lưu 1 bản ghi phiên chơi (game=listening, topic, score=7/10, thời gian) và 10 bản ghi chi tiết (mỗi câu: nội dung prompt, đáp án chọn, đáp án đúng, đúng/sai, thời gian trả lời).
2. **Given** học sinh đang chơi ẩn danh (đã bỏ qua popup), **When** học sinh hoàn thành game, **Then** không có bản ghi nào được lưu vào hệ thống.
3. **Given** kết nối mạng bị gián đoạn khi ghi nhận kết quả, **When** việc lưu thất bại, **Then** lỗi được ghi nhận im lặng (không hiện thông báo lỗi cho trẻ), game vẫn hiển thị kết quả bình thường.
4. **Given** học sinh chơi game Spelling (kéo thả, không phải quiz), **When** học sinh hoàn thành, **Then** hệ thống vẫn ghi nhận kết quả mỗi từ: từ đã ghép, đúng/sai, số lần thử.

---

### User Story 4 - Dashboard tổng quan lớp cho giáo viên (Priority: P4)

Giáo viên truy cập trang dashboard lớp học trong admin. Trang hiển thị thống kê tổng quan: tổng số học sinh đã chơi, tổng lượt chơi, điểm trung bình theo từng game, game được chơi nhiều nhất, và hoạt động gần đây. Giáo viên có thể lọc theo khoảng thời gian.

**Why this priority**: Sau khi có dữ liệu (US3), giáo viên cần cách xem tổng quan để đánh giá hiệu quả. Đây là view đầu tiên và phổ biến nhất mà giáo viên sẽ dùng.

**Independent Test**: Tạo lớp, có vài học sinh chơi game, mở dashboard lớp và xác nhận hiển thị đúng số liệu tổng hợp. Lọc theo thời gian và xác nhận dữ liệu thay đổi phù hợp.

**Acceptance Scenarios**:

1. **Given** lớp có 5 học sinh đã chơi tổng cộng 20 lượt, **When** giáo viên mở dashboard lớp, **Then** hiển thị: 5 học sinh, 20 lượt chơi, điểm trung bình theo game (VD: Flashcard: 85%, Listening: 72%).
2. **Given** giáo viên đang xem dashboard, **When** giáo viên lọc theo "7 ngày qua", **Then** chỉ hiển thị dữ liệu trong khoảng thời gian đó.
3. **Given** lớp chưa có học sinh nào chơi, **When** giáo viên mở dashboard, **Then** hiển thị trạng thái trống thân thiện với hướng dẫn chia sẻ mã lớp.

---

### User Story 5 - Chi tiết tiến trình từng học sinh (Priority: P5)

Giáo viên bấm vào tên một học sinh trong danh sách lớp để xem chi tiết: lịch sử các phiên chơi, điểm từng phiên, game đã chơi, và danh sách từ/câu mà học sinh hay sai nhất.

**Why this priority**: Giúp giáo viên cá nhân hóa hỗ trợ cho từng học sinh. Phụ thuộc vào US4 (danh sách học sinh).

**Independent Test**: Mở dashboard lớp, bấm vào tên học sinh, xem lịch sử phiên chơi và từ hay sai. Xác nhận dữ liệu khớp với những gì học sinh đã chơi.

**Acceptance Scenarios**:

1. **Given** học sinh "Minh" đã chơi 8 phiên, **When** giáo viên bấm vào tên "Minh", **Then** hiển thị danh sách 8 phiên (ngày, game, chủ đề, điểm) sắp xếp theo thời gian mới nhất.
2. **Given** học sinh đã chơi nhiều phiên Listening, **When** giáo viên xem chi tiết, **Then** hiển thị top 5 từ học sinh sai nhiều nhất với số lần sai.

---

### User Story 6 - Phân tích từ khó toàn lớp (Priority: P6)

Giáo viên xem bảng phân tích từ/câu khó nhất của cả lớp: từ nào có tỷ lệ sai cao nhất, bao nhiêu học sinh sai, thuộc game/chủ đề nào. Giúp giáo viên biết cần ôn lại nội dung gì.

**Why this priority**: Đây là insight giá trị nhất cho việc điều chỉnh giảng dạy, nhưng phụ thuộc vào đủ dữ liệu từ US3-US5.

**Independent Test**: Có nhiều học sinh chơi cùng game, mở trang phân tích từ khó, xác nhận danh sách từ khó hiển thị đúng với tỷ lệ sai, số lượng học sinh sai.

**Acceptance Scenarios**:

1. **Given** 10 học sinh đã chơi Listening và 7 em sai từ "giraffe", **When** giáo viên mở trang phân tích từ khó, **Then** từ "giraffe" hiển thị ở top với tỷ lệ sai 70%, số lần sai, thuộc chủ đề Animals.
2. **Given** giáo viên xem phân tích, **When** giáo viên lọc theo game "Spelling", **Then** chỉ hiển thị từ khó từ game Spelling.

---

### User Story 7 - Xuất báo cáo CSV (Priority: P7)

Giáo viên nhấn nút "Xuất báo cáo" trên dashboard lớp để tải xuống file CSV chứa kết quả chi tiết của lớp. File bao gồm: tên học sinh, game, chủ đề, điểm, ngày chơi.

**Why this priority**: Tính năng tiện ích, cho phép giáo viên lưu trữ hoặc xử lý dữ liệu ngoài hệ thống. Ít ưu tiên hơn vì dashboard đã cung cấp đủ thông tin.

**Independent Test**: Mở dashboard lớp có dữ liệu, nhấn "Xuất báo cáo", xác nhận file CSV tải về đúng định dạng và chứa dữ liệu chính xác.

**Acceptance Scenarios**:

1. **Given** lớp có dữ liệu nhiều phiên chơi, **When** giáo viên nhấn "Xuất báo cáo", **Then** trình duyệt tải xuống file CSV với mã hóa UTF-8 BOM (hỗ trợ tiếng Việt trong Excel), chứa các cột: Tên học sinh, Game, Chủ đề, Điểm, Tổng câu, Ngày chơi.
2. **Given** lớp chưa có dữ liệu, **When** giáo viên nhấn "Xuất báo cáo", **Then** nút bị vô hiệu hóa hoặc hiển thị thông báo "Chưa có dữ liệu để xuất".

---

### Edge Cases

- Học sinh nhập cùng tên trong cùng lớp: hệ thống tạo bản ghi riêng biệt cho mỗi lần nhập (phân biệt nội bộ bằng ID), nhưng giáo viên thấy cùng tên — cần gộp hiển thị khi trùng tên trong cùng lớp.
- Mã lớp hết hạn hoặc lớp bị vô hiệu hóa khi học sinh đang chơi: phiên hiện tại vẫn lưu kết quả, phiên sau sẽ thông báo lớp không còn hoạt động.
- Học sinh chơi rất nhanh và gửi nhiều kết quả liên tiếp: hệ thống chấp nhận tất cả, không giới hạn tốc độ (trẻ em không phải mối đe dọa abuse).
- Session hết hạn (đóng trình duyệt): học sinh cần nhập lại mã lớp + tên lần sau — đây là hành vi mong đợi.
- Giáo viên xóa lớp: chỉ vô hiệu hóa (soft delete), dữ liệu lịch sử vẫn giữ nguyên.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép giáo viên đã đăng nhập tạo lớp học với tên lớp và nhận mã lớp tự động sinh (6-8 ký tự chữ-số viết hoa, duy nhất).
- **FR-002**: Hệ thống PHẢI cho phép giáo viên xem danh sách lớp đã tạo, đổi tên lớp, và vô hiệu hóa lớp.
- **FR-003**: Hệ thống PHẢI hiển thị popup nhập mã lớp + tên học sinh khi mở trang game lần đầu (session trống), với tùy chọn bỏ qua để chơi ẩn danh.
- **FR-004**: Hệ thống PHẢI xác thực mã lớp theo thời gian thực và thông báo lỗi thân thiện nếu mã không hợp lệ hoặc lớp đã vô hiệu hóa.
- **FR-005**: Hệ thống PHẢI lưu thông tin học sinh (mã lớp, tên) vào browser session để không hỏi lại trong các lần chơi tiếp theo.
- **FR-006**: Hệ thống PHẢI ghi nhận kết quả chi tiết từng câu hỏi/từ khi học sinh (đã nhập mã lớp) hoàn thành phiên chơi, bao gồm: nội dung prompt, đáp án đã chọn, đáp án đúng, kết quả đúng/sai, và thời gian trả lời.
- **FR-007**: Hệ thống PHẢI ghi nhận kết quả im lặng — lỗi ghi nhận không được hiển thị cho học sinh hoặc ảnh hưởng đến trải nghiệm chơi.
- **FR-008**: Hệ thống KHÔNG ĐƯỢC ghi nhận bất kỳ kết quả nào khi học sinh chơi ẩn danh.
- **FR-009**: Hệ thống PHẢI hiển thị dashboard tổng quan lớp cho giáo viên, bao gồm: tổng số học sinh, tổng lượt chơi, điểm trung bình theo game.
- **FR-010**: Hệ thống PHẢI cho phép giáo viên lọc dữ liệu dashboard theo khoảng thời gian (7 ngày, 30 ngày, tất cả).
- **FR-011**: Hệ thống PHẢI cho phép giáo viên xem chi tiết từng học sinh: lịch sử phiên chơi, điểm, và từ hay sai.
- **FR-012**: Hệ thống PHẢI hiển thị bảng phân tích từ/câu khó nhất toàn lớp, sắp xếp theo tỷ lệ sai, có thể lọc theo game.
- **FR-013**: Hệ thống PHẢI cho phép giáo viên xuất báo cáo lớp dưới dạng file CSV (UTF-8 BOM) chứa kết quả phiên chơi.
- **FR-014**: Hệ thống PHẢI đảm bảo giáo viên chỉ xem được dữ liệu của lớp mình tạo — không truy cập được dữ liệu lớp của giáo viên khác.
- **FR-015**: Hệ thống PHẢI gộp hiển thị kết quả khi có học sinh trùng tên trong cùng lớp (hệ thống phân biệt nội bộ bằng ID).

### Key Entities

- **Classroom (Lớp học)**: Đại diện một lớp học do giáo viên tạo. Thuộc tính chính: tên lớp, mã lớp (duy nhất), trạng thái hoạt động, giáo viên sở hữu. Một giáo viên có thể tạo nhiều lớp.
- **Student (Học sinh)**: Đại diện một học sinh trong lớp. Thuộc tính: tên, lớp học thuộc về. Một lớp có nhiều học sinh. Học sinh được tạo tự động khi nhập mã lớp + tên lần đầu.
- **Game Session (Phiên chơi)**: Đại diện một lượt chơi hoàn chỉnh của học sinh. Thuộc tính: học sinh, game, chủ đề, điểm, tổng câu, thời gian bắt đầu, thời gian kết thúc, config ID (nếu có). Một học sinh có nhiều phiên chơi.
- **Answer Detail (Chi tiết câu trả lời)**: Đại diện kết quả từng câu trong phiên chơi. Thuộc tính: phiên chơi, nội dung prompt, đáp án đã chọn, đáp án đúng, đúng/sai, thời gian trả lời (mili giây). Mỗi phiên chơi có nhiều chi tiết câu trả lời.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Giáo viên có thể tạo lớp và nhận mã lớp trong vòng 30 giây.
- **SC-002**: Học sinh nhập mã lớp + tên và bắt đầu chơi trong vòng 15 giây (popup đến game bắt đầu).
- **SC-003**: 100% phiên chơi của học sinh đã nhập mã lớp được ghi nhận thành công (trong điều kiện mạng ổn định).
- **SC-004**: Giáo viên có thể xem tổng quan lớp và xác định game yếu nhất trong vòng 1 phút.
- **SC-005**: Giáo viên có thể xem chi tiết từng học sinh và xác định 3 từ khó nhất trong vòng 2 phút.
- **SC-006**: File CSV xuất ra mở đúng tiếng Việt trong Excel không bị lỗi font.
- **SC-007**: Trải nghiệm chơi game của học sinh ẩn danh không bị ảnh hưởng — mọi game hoạt động giống hệt như trước khi có tính năng này.
- **SC-008**: Giáo viên không thể truy cập dữ liệu lớp của giáo viên khác dưới bất kỳ hình thức nào.

## Assumptions

- Học sinh sử dụng thiết bị có kết nối internet ổn định khi chơi game (không cần hỗ trợ offline).
- Quy mô mỗi lớp khoảng 20-40 học sinh — không cần tối ưu cho hàng nghìn học sinh cùng lúc.
- Giáo viên sẽ đọc/viết/in mã lớp cho học sinh — không cần tính năng gửi mã qua email hay tin nhắn.
- Session dùng browser sessionStorage — đóng tab/trình duyệt sẽ mất session, phải nhập lại. Đây là hành vi chấp nhận được.
- Hệ thống authentication hiện có (Supabase Auth) được tái sử dụng cho giáo viên, không tạo tài khoản cho học sinh.
- Dữ liệu kết quả không có thời hạn xóa tự động — giáo viên giữ dữ liệu vĩnh viễn trừ khi xóa thủ công.
- Game Flashcard và Alphabet (chế độ learn) không có kết quả đúng/sai rõ ràng nên không ghi nhận chi tiết từng câu — chỉ ghi nhận phiên chơi (đã xem bao nhiêu thẻ/chữ).
- Tất cả 6 game hiện tại (flashcard, alphabet, listening, spelling, numbers-colors, sentences) đều được hỗ trợ ghi nhận kết quả ở mức phù hợp với cơ chế chơi của từng game.
