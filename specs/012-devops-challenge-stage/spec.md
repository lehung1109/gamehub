# Feature Specification: Thêm Chặng 4: DevOps Challenge (Lập trình Web & DevOps)

**Feature Branch**: `012-devops-challenge-stage`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "ý tưởng bên trên (Thêm Chặng 4 dạng Mixed kết hợp Chia động từ, Săn lỗi, Ghép câu nhưng với bối cảnh thực tế của lập trình viên và DevOps)"

## Clarifications

### Session 2026-08-26
- Q: Về cấu trúc dữ liệu, các câu hỏi của Chặng 4 nên được lưu trữ như thế nào trong file JSON? (FR-002) → A: Lưu tất cả trong một mảng `devOpsChallenge`, mỗi câu hỏi có thêm trường `challengeType` (vd: "conjugation") để phân biệt.
- Q: Thuộc tính `devOpsChallenge` trong cấu trúc bài học nên là bắt buộc hay tùy chọn? (FR-002) → A: Chặng 4 là tùy chọn (Optional) - nếu bài học nào không có dữ liệu cho Chặng 4 thì tự động ẩn Chặng 4 đi.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Luyện tập ngữ pháp tiếng Anh với ngữ cảnh IT/DevOps (Mixed Format) (Priority: P1)

Người học (đặc biệt là lập trình viên) muốn thử thách tiếng Anh chuyên ngành thông qua các tình huống thực tế của IT/DevOps (như deploy code, review PR, fix bug, v.v.). Khi người dùng vào Chặng 4, hệ thống sẽ trộn ngẫu nhiên các loại câu hỏi (Chia động từ, Săn lỗi sai, Ghép câu) từ ngân hàng câu hỏi IT.

**Why this priority**: Đây là cốt lõi của tính năng, mang lại trải nghiệm chuyên ngành và mới lạ cho người dùng làm trong lĩnh vực công nghệ.

**Independent Test**: Người dùng chọn "Chặng 4", màn hình hiển thị câu hỏi đầu tiên thuộc dạng A (vd: Chia động từ) với ngữ cảnh IT. Sau khi làm xong, câu tiếp theo tự động chuyển sang dạng B (vd: Săn lỗi sai) hoặc vẫn là A nhưng đều mang nội dung IT.

**Acceptance Scenarios**:

1. **Given** người dùng bắt đầu Chặng 4, **When** hệ thống tải bài tập, **Then** hiển thị ngẫu nhiên các câu hỏi từ ngân hàng bài tập mở rộng dành riêng cho ngữ cảnh IT.
2. **Given** người dùng đang ở một câu hỏi trong Chặng 4, **When** chuyển sang câu tiếp theo, **Then** giao diện tương tác tự động thay đổi (từ điền từ, chọn đáp án sang kéo thả) tương ứng với loại câu hỏi đó.

---

### User Story 2 - Lưu trữ và quản lý tiến độ riêng cho Chặng 4 (Priority: P1)

Hệ thống lưu lại tiến độ hoàn thành và điểm số của Chặng 4 lên bảng tổng kết tương tự như 3 chặng đầu, đồng thời duy trì sự tương thích ngược cho những người dùng đã lưu dữ liệu từ trước.

**Why this priority**: Đảm bảo trải nghiệm liền mạch, người dùng thấy được thành tích của mình và không bị mất điểm của các chặng trước.

**Independent Test**: Hoàn thành Chặng 4, xem bảng tổng kết hiển thị điểm của chặng này và điểm tổng được cộng dồn chính xác. Người dùng cũ chưa làm chặng 4 thì chặng 4 hiển thị trạng thái chưa bắt đầu.

**Acceptance Scenarios**:

1. **Given** người dùng hoàn thành Chặng 4, **When** xem bảng tổng kết, **Then** điểm Chặng 4 được cập nhật và hiển thị rõ ràng cùng với các chặng khác.
2. **Given** hệ thống đang có dữ liệu tiến độ cũ, **When** tải ứng dụng phiên bản mới, **Then** điểm số cũ không bị mất và hệ thống mặc định điểm Chặng 4 là 0.

---

### User Story 3 - Tái sử dụng giao diện lõi cho các dạng câu hỏi (Priority: P2)

Để xây dựng Chặng 4 dạng tổng hợp một cách hiệu quả, phần giao diện của từng loại câu hỏi sẽ được tách ra độc lập để có thể dùng chung. Chặng 1, 2, 3 và Chặng 4 sẽ sử dụng chung các khối giao diện này.

**Why this priority**: Ngăn ngừa lặp code, giúp việc bảo trì hoặc nâng cấp giao diện sau này diễn ra đồng bộ trên tất cả các chặng.

**Independent Test**: Kiểm tra Chặng 1, 2, 3 vẫn hoạt động bình thường, và Chặng 4 có thể hiển thị mượt mà các giao diện này.

**Acceptance Scenarios**:

1. **Given** hệ thống được cập nhật giao diện dùng chung, **When** kiểm thử thủ công Chặng 1, 2, 3, **Then** tất cả hoạt động ổn định không có lỗi hiển thị.

### Edge Cases

- **Thiếu loại bài tập trong ngân hàng câu hỏi**: Nếu ngân hàng câu hỏi IT vô tình chỉ có 1 hoặc 2 dạng bài (thay vì cả 3), hệ thống vẫn hoạt động bình thường với các dạng bài có sẵn.
- **Xử lý dữ liệu tiến trình lỗi**: Nếu dữ liệu tiến trình cũ bị hỏng hoặc không đúng định dạng, hệ thống tự động thiết lập lại trạng thái tiến trình về mức 0 cho Chặng 4 mà không gây lỗi ứng dụng.
- **Không có dữ liệu Chặng 4**: Nếu một bài học không có dữ liệu cho Chặng 4, hệ thống tự động ẩn Chặng 4 đi mà không báo lỗi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST hỗ trợ một chặng học mới (Chặng 4) tập trung vào DevOps.
- **FR-002**: Hệ thống dữ liệu bài tập MUST hỗ trợ thêm một mảng chung `devOpsChallenge` (tùy chọn) dành riêng cho Chặng 4, mỗi câu hỏi trong mảng có thêm trường `challengeType` (vd: "conjugation", "errorHunting") để phân biệt.
- **FR-003**: Khi vào Chặng 4, hệ thống MUST chọn ngẫu nhiên một số lượng câu hỏi nhất định (vd: 6 hoặc 8 câu) từ tập hợp câu hỏi mở rộng.
- **FR-004**: Màn hình làm bài của Chặng 4 MUST tự động hiển thị giao diện tương ứng (Chia động từ, Săn lỗi, hay Ghép câu) dựa vào loại của câu hỏi hiện hành.
- **FR-005**: Hệ thống lưu trữ tiến độ MUST được cập nhật để theo dõi điểm cho Chặng 4, và có cơ chế xử lý tương thích ngược cho dữ liệu lưu trữ hiện tại.
- **FR-006**: Phải bổ sung ít nhất 9 câu hỏi mẫu (chia đều 3 dạng, mỗi dạng 3 câu) thuộc ngữ cảnh lập trình vào hệ thống dữ liệu bài tập.
- **FR-007**: Màn hình danh sách chặng học MUST hiển thị "Chặng 4: Thử thách IT & DevOps" nếu bài học đó có dữ liệu `devOpsChallenge`. Nếu không có, tự động ẩn Chặng 4.

### Key Entities

- **DevOps Challenge Item**: Thực thể lưu trữ nội dung câu hỏi trong mảng `devOpsChallenge`, có thêm trường `challengeType` để nhận diện loại bài tập.
- **User Progress**: Dữ liệu lưu tiến độ người dùng, được mở rộng để theo dõi thêm số liệu của Chặng 4.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các câu hỏi trong Chặng 4 chuyển đổi giao diện chính xác dựa trên loại câu hỏi mà không xảy ra lỗi gián đoạn ứng dụng.
- **SC-002**: 100% dữ liệu tiến trình cũ của người dùng được bảo toàn nguyên vẹn sau khi cập nhật hệ thống.
- **SC-003**: Không có mã nguồn giao diện nhập liệu (form) nào bị lặp lại (duplicate) giữa Chặng 4 và 3 chặng học hiện tại.
- **SC-004**: Tự động ẩn Chặng 4 thành công 100% đối với các bài học không có dữ liệu DevOps.

## Assumptions

- Việc thiết kế lại các thành phần giao diện không làm thay đổi luồng trải nghiệm người dùng ở các chặng 1, 2, 3.
- Số lượng câu hỏi của Chặng 4 trong một phiên làm bài mặc định là 6 câu (tương đương với các chặng ghép câu hoặc săn lỗi sai).
- Tất cả các câu hỏi mới đều được cung cấp đầy đủ thông tin về ngữ cảnh, đáp án, và giải thích ngữ pháp.
