# Feature Specification: Student Rewards & Leveling

**Feature Branch**: `005-student-rewards`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Thêm tính năng Gamification: Hệ thống phần thưởng và tích lũy sao cho học sinh. Học sinh kiếm sao qua các lượt chơi, tổng số sao được lưu trong DB (sử dụng bảng game_sessions hiện tại) và hiển thị trên thanh điều hướng cùng với cấp độ/huy hiệu tương ứng. Dữ liệu đồng bộ xuyên thiết bị thông qua tổ hợp mã lớp và tên học sinh."

## Clarifications

### Session 2026-08-23

- Q: Cách tính điểm (sao) cho các game học tập không có câu hỏi đúng/sai (ví dụ: lướt xem Flashcard hoặc Bảng chữ cái) sẽ như thế nào? → A: Thưởng lượng sao cố định (VD: 5 sao) khi hoàn thành một lượt học trọn vẹn.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem thẻ tiến trình học sinh (Priority: P1)

Học sinh sau khi nhập mã lớp và tên (hoặc khi quay lại trang web nếu session còn hạn) sẽ thấy một "Thẻ học sinh" (Profile Badge) hiển thị trên thanh điều hướng (Navbar) ở mọi trang. Thẻ này hiển thị tên học sinh, tổng số sao (⭐) đã tích lũy từ trước đến nay, và Huy hiệu/Avatar hiện tại tương ứng với cấp độ (Level) của mình.

**Why this priority**: Đây là cách hiển thị cốt lõi của tính năng Gamification, giúp trẻ em luôn thấy được thành quả của mình ở bất kỳ đâu trên website, tạo động lực học tập.

**Independent Test**: Mở website, nhập mã lớp và tên (đã có dữ liệu điểm từ trước). Xác nhận trên thanh điều hướng hiển thị đúng tên, tổng số sao (khớp với tổng điểm trong DB) và huy hiệu tương ứng.

**Acceptance Scenarios**:

1. **Given** học sinh đã nhập mã lớp và tên hợp lệ, **When** trang tải xong, **Then** thanh điều hướng hiển thị tên học sinh, tổng số sao và huy hiệu hiện tại.
2. **Given** học sinh chơi ẩn danh (không nhập tên/mã lớp), **When** duyệt website, **Then** thẻ tiến trình không hiển thị.

---

### User Story 2 - Tích lũy sao và lên cấp (Priority: P1)

Khi học sinh hoàn thành một game, số câu trả lời đúng (điểm) sẽ được cộng vào tổng số sao. Nếu tổng số sao vượt qua một mốc (milestone) nhất định, học sinh sẽ được thăng cấp, nhận huy hiệu mới và nhìn thấy một màn hình/hiệu ứng chúc mừng (Level Up) ngay sau màn hình kết thúc game.

**Why this priority**: Đây là vòng lặp cốt lõi (core loop) của Gamification: Chơi -> Nhận điểm -> Lên cấp -> Nhận thưởng, giúp duy trì sự hứng thú của trẻ.

**Independent Test**: Hoàn thành một game sao cho tổng số sao vừa đủ để vượt qua mốc cấp độ tiếp theo. Xác nhận màn hình chúc mừng "Lên cấp" xuất hiện kèm huy hiệu mới.

**Acceptance Scenarios**:

1. **Given** học sinh đang ở Level 1 (0 sao) và cần 50 sao để lên Level 2, **When** học sinh hoàn thành game và tổng số sao đạt 55, **Then** hiển thị hiệu ứng chúc mừng thăng cấp lên Level 2 với huy hiệu mới.
2. **Given** học sinh hoàn thành game nhưng chưa đủ điểm lên cấp, **When** game kết thúc, **Then** thẻ học sinh trên thanh điều hướng cập nhật số sao mới (hiệu ứng tăng số) mà không hiện thông báo thăng cấp.

---

### User Story 3 - Đồng bộ dữ liệu xuyên thiết bị (Priority: P2)

Học sinh chơi game trên máy tính bảng ở trường và tích lũy được 100 sao. Khi về nhà, học sinh mở website trên máy tính bàn, nhập đúng mã lớp và tên. Học sinh ngay lập tức thấy 100 sao và huy hiệu sư tử của mình mà không bị mất dữ liệu.

**Why this priority**: Giải quyết đúng yêu cầu của người dùng là lưu trong DB để học sinh có thể thấy được tiến trình ở bất kỳ đâu, bất kỳ thiết bị nào.

**Independent Test**: Đăng nhập bằng mã lớp và tên trên trình duyệt A, chơi game lấy 10 sao. Mở trình duyệt B (hoặc ẩn danh), đăng nhập cùng mã lớp và tên, xác nhận tổng số sao hiển thị là 10.

**Acceptance Scenarios**:

1. **Given** học sinh dùng thiết bị mới hoàn toàn, **When** nhập chính xác mã lớp và tên đã tồn tại, **Then** hệ thống truy xuất dữ liệu và hiển thị chính xác tổng số sao và huy hiệu cũ.

### Edge Cases

- Điều gì xảy ra khi hệ thống mất kết nối mạng ngay lúc game hoàn thành? (Hệ thống lưu cục bộ và đồng bộ sau, hoặc không thăng cấp ngay lập tức).
- Điều gì xảy ra khi giáo viên đổi tên lớp hoặc xóa lớp? (Hệ thống vẫn giữ nguyên số điểm cho học sinh).
- Điều gì xảy ra khi học sinh nhập tên gần giống (ví dụ: dư khoảng trắng)? (Hệ thống cần xem là tên mới hoặc chuẩn hóa khoảng trắng trước khi tính).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI tính tổng số sao (tổng điểm) của một học sinh dựa trên dữ liệu các lượt chơi đã lưu (thông qua tổ hợp mã lớp và tên học sinh). KHÔNG TẠO khu vực lưu trữ mới mà chỉ tổng hợp từ dữ liệu hiện có.
- **FR-002**: Hệ thống PHẢI hiển thị thẻ học sinh (Student Profile Badge) trên thanh điều hướng chứa: Tên học sinh, Tổng số sao, và Huy hiệu hiện tại khi có phiên hoạt động hợp lệ.
- **FR-003**: Hệ thống PHẢI định nghĩa một hệ thống cấp độ (Levels) với các mốc điểm (Thresholds) cụ thể và huy hiệu (dùng emoji) tương ứng. (VD: Level 1: 0 sao 🐣, Level 2: 50 sao 🐱, Level 3: 150 sao 🦁, v.v.).
- **FR-004**: Hệ thống PHẢI kiểm tra và phát hiện trạng thái "Thăng cấp" (Level Up) khi học sinh hoàn thành một lượt chơi và tổng điểm vượt qua mốc của cấp độ tiếp theo.
- **FR-005**: Hệ thống PHẢI hiển thị màn hình hoặc thông báo chúc mừng nổi bật khi học sinh được thăng cấp, trước hoặc cùng lúc với màn hình kết quả game.
- **FR-006**: Hệ thống PHẢI cung cấp phương thức để hệ thống máy khách lấy dữ liệu tổng số sao hiện tại một cách tối ưu mà không cần lấy toàn bộ lịch sử chi tiết.
- **FR-007**: Hệ thống PHẢI ghi nhận một lượng sao cố định (ví dụ: 5 sao) vào bảng lưu trữ cho các game học tập không có đúng/sai (như Flashcard, Bảng chữ cái) khi học sinh hoàn thành một lượt học trọn vẹn.

### Key Entities

- **Hệ thống cấp độ (Level System)**: Một cấu hình định nghĩa các mốc sao (VD: 0, 50, 150, 300) và huy hiệu tương ứng.
- **Total Stars (Tổng sao)**: Giá trị tính toán động bằng cách tổng hợp điểm từ các lượt chơi của một học sinh.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thẻ tiến trình học sinh phải hiển thị đúng tổng số sao và huy hiệu trong vòng 1 giây sau khi tải trang (trên kết nối mạng ổn định).
- **SC-002**: Việc tính toán tổng số sao không làm ảnh hưởng đến hiệu suất người dùng, thời gian phản hồi của việc lưu kết quả kết thúc game không tăng đáng kể so với trước (không quá 200ms độ trễ thêm).
- **SC-003**: 100% học sinh khi đăng nhập trên thiết bị khác bằng đúng mã lớp và tên sẽ thấy chính xác tổng số sao của mình.
- **SC-004**: Hiệu ứng tăng sao hoặc thăng cấp hoạt động mượt mà, không giật lag trên các thiết bị di động và máy tính bảng.

## Assumptions

- Việc phân biệt học sinh hoàn toàn dựa vào chuỗi chính xác của mã lớp và tên. Nếu học sinh nhập sai tên (VD: "Minh" thay vì "Minh Nguyễn"), hệ thống sẽ tính là một người mới (điều này đã được chấp nhận từ spec 004).
- Hệ thống cấp độ (Milestones & Badges) sẽ được cấu hình linh hoạt (có thể hardcode trong mã nguồn máy khách) thay vì lưu trên cơ sở dữ liệu để đơn giản hóa.
- Việc hiển thị huy hiệu sử dụng hệ thống Emoji của hệ điều hành (không cần tải thêm tài nguyên hình ảnh) để đảm bảo tốc độ tải trang nhanh nhất.
- Bảng dữ liệu lưu lượt chơi hiện tại đã có cấu trúc tối ưu để việc tính tổng điểm (sum) diễn ra nhanh chóng.
