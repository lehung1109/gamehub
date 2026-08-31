# Feature Specification: Future Tenses

**Feature Branch**: `[not-applicable]`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Hoàn thiện thì tương lai đang bị thiếu trong dự án (dựa trên ý tưởng: cập nhật status thành active trong index.json và tạo 4 file JSON dữ liệu cho future-simple, future-continuous, future-perfect, future-perfect-continuous)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kích hoạt luồng học các thì tương lai trên giao diện (Priority: P1)

Người dùng có thể truy cập 4 thì tương lai từ giao diện chính của phần Luyện thì tiếng Anh thay vì thấy trạng thái "coming_soon".

**Why this priority**: Đây là bước bản lề để mở khóa nội dung cho người học.

**Independent Test**: Có thể test độc lập bằng cách mở `index.json` để kiểm tra trạng thái và truy cập vào đường dẫn của các thì tương lai.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập trang `/tenses`, **When** cuộn xuống nhóm "Tương lai", **Then** 4 thì (Future Simple, Future Continuous, Future Perfect, Future Perfect Continuous) hiển thị là thẻ có thể click được (không bị khóa hay báo coming_soon).

---

### User Story 2 - Học lý thuyết và làm bài tập thì Tương Lai (Priority: P2)

Người dùng có thể học các quy tắc ngữ pháp (Quick Rules) và làm bài tập (Challenges) liên quan đến 4 thì tương lai trong môi trường công sở.

**Why this priority**: Cốt lõi của ứng dụng là nội dung học tập. Mở khóa mà không có nội dung thì vô nghĩa.

**Independent Test**: Kiểm tra xem nội dung bài tập và lý thuyết của 4 thì được nạp thành công và có thể hoàn thành trọn vẹn luồng học không.

**Acceptance Scenarios**:

1. **Given** người dùng chọn thì "Tương lai đơn" từ danh sách, **When** chuyển sang tab lý thuyết, **Then** hiển thị đúng cấu trúc ngữ pháp và ứng dụng công sở.
2. **Given** người dùng bắt đầu làm bài tập của một thì tương lai bất kỳ, **When** hoàn thành tất cả câu hỏi, **Then** kết quả được ghi nhận và không gặp lỗi thiếu dữ liệu.

### Edge Cases

- What happens when một file JSON bị lỗi cú pháp? (Ứng dụng cần có cơ chế bắt lỗi khi parse JSON hoặc build time sẽ báo lỗi).
- How does system handle các trường hợp ID câu hỏi bài tập bị trùng lặp với các thì khác? (Cần đảm bảo ID bài tập là duy nhất, ví dụ bắt đầu bằng `fs-` hoặc `fc-`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cập nhật thuộc tính `status` của 4 thì tương lai (Future Simple, Future Continuous, Future Perfect, Future Perfect Continuous) từ `coming_soon` sang `active` trong file `src/data/tenses/index.json`.
- **FR-002**: Hệ thống MUST cung cấp 4 file dữ liệu JSON mới cho 4 thì tương lai đặt tại thư mục `src/data/tenses/`.
- **FR-003**: Mỗi file JSON MUST tuân thủ nghiêm ngặt schema hiện tại của ứng dụng (bao gồm `metadata`, `quickRules`, `challenges`).
- **FR-004**: Nội dung bài tập (challenges) MUST xoay quanh bối cảnh công sở (workplace/IT) tương tự như các thì hiện tại/quá khứ.

### Key Entities *(include if feature involves data)*

- **TenseData (JSON file)**: Lưu trữ metadata, quy tắc ngữ pháp, và các câu hỏi bài tập liên quan đến một thì cụ thể.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Có 4 file JSON hợp lệ được tạo trong thư mục `src/data/tenses/`.
- **SC-002**: `status` của 4 thì tương lai trong `index.json` được chuyển sang `active`.
- **SC-003**: Dữ liệu có thể được load vào giao diện Next.js thành công mà không gây ra lỗi render hay lỗi type checking (có thể xác minh qua quá trình build và chạy test tự động).

## Assumptions

- Ứng dụng đã có sẵn logic xử lý UI và data fetching cho cấu trúc JSON hiện tại. Việc thêm file JSON với schema tương tự sẽ tự động hoạt động trên giao diện.
- Người dùng chấp nhận việc AI tự động tạo sinh (generate) toàn bộ nội dung tiếng Anh và tiếng Việt cho các câu hỏi bài tập và lý thuyết trong phạm vi môi trường công sở.
