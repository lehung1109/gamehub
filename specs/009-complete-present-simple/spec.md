# Feature Specification: Hoàn Thiện Thì Hiện Tại Đơn (Complete Present Simple)

**Feature Branch**: `009-complete-present-simple`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "hoàn thiện thì hiện tại đơn"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mở Rộng Ngân Hàng Câu Hỏi Chia Động Từ (Conjugation) Đa Dạng Ngữ Cảnh (Priority: P1)

Người học mở bài học Thì Hiện Tại Đơn và vào Chặng 1 (Chia Động Từ). Hiện tại chặng này có 8 câu hỏi. Sau khi hoàn thiện, ngân hàng câu hỏi mở rộng lên ít nhất 15 câu, bao phủ đầy đủ các ngữ cảnh công sở: email trao đổi nội bộ, tin nhắn chat công việc, mô tả quy trình trong tài liệu hướng dẫn, lịch trình cuộc họp định kỳ, và báo cáo tiến độ dự án. Mỗi lần luyện tập, hệ thống chọn ngẫu nhiên 8 câu từ ngân hàng để đảm bảo trải nghiệm không lặp lại.

**Why this priority**: 8 câu hiện tại khiến người học nhanh chóng thuộc đáp án sau 2-3 lần luyện; mở rộng ngân hàng câu hỏi giúp tăng giá trị luyện tập lâu dài và phản ánh đa dạng tình huống thực tế hơn.

**Independent Test**: Vào Chặng 1 nhiều lần, xác nhận mỗi phiên hiển thị bộ câu hỏi khác nhau từ ngân hàng mở rộng, và tất cả câu hỏi mới đều có giải thích ngữ pháp chính xác.

**Acceptance Scenarios**:

1. **Given** người học bắt đầu Chặng 1, **When** hệ thống tải bài tập, **Then** hiển thị 8 câu hỏi được chọn ngẫu nhiên từ ngân hàng ít nhất 15 câu.
2. **Given** người học hoàn thành Chặng 1 và bắt đầu lại, **When** hệ thống tải bài tập lần 2, **Then** thứ tự và tập hợp câu hỏi khác với lần trước (không trùng 100%).
3. **Given** ngân hàng câu hỏi mới, **When** kiểm tra tất cả câu hỏi, **Then** mỗi câu đều có ngữ cảnh công sở rõ ràng, động từ gốc, đáp án đúng, lựa chọn trắc nghiệm hợp lý (4 lựa chọn), và giải thích ngữ pháp bằng tiếng Việt.
4. **Given** ngân hàng câu hỏi mở rộng, **When** xem xét phân bố ngữ cảnh, **Then** bao phủ ít nhất 5 loại ngữ cảnh khác nhau: email, meeting, routine, report, chat.

---

### User Story 2 - Mở Rộng Ngân Hàng Bài Tập Săn Lỗi Sai (Error Hunting) (Priority: P1)

Người học vào Chặng 2 (Săn Lỗi Sai). Hiện tại có 6 câu. Sau khi hoàn thiện, ngân hàng mở rộng lên ít nhất 12 câu, phủ hết các dạng lỗi phổ biến mà người Việt hay mắc khi dùng thì Hiện Tại Đơn: quên thêm `-s/-es` ngôi thứ 3, dùng sai trợ động từ `do/does`, nhầm `don't/doesn't`, lỗi chia `to be` sai ngôi, dùng sai dạng phủ định/nghi vấn. Mỗi phiên luyện tập chọn ngẫu nhiên 6 câu từ ngân hàng.

**Why this priority**: Phủ đầy đủ các dạng lỗi phổ biến giúp người học nhận diện và tránh lỗi toàn diện hơn, thay vì chỉ lặp lại 6 lỗi cố định.

**Independent Test**: Vào Chặng 2, xác nhận bộ câu hỏi đa dạng, bao phủ các dạng lỗi khác nhau, và hệ thống chọn ngẫu nhiên mỗi phiên.

**Acceptance Scenarios**:

1. **Given** người học bắt đầu Chặng 2, **When** hệ thống tải bài tập, **Then** hiển thị 6 câu hỏi ngẫu nhiên từ ngân hàng ít nhất 12 câu.
2. **Given** ngân hàng câu hỏi mở rộng, **When** kiểm tra toàn bộ, **Then** bao phủ ít nhất 5 dạng lỗi ngữ pháp khác nhau về thì Hiện Tại Đơn.
3. **Given** người học hoàn thành và bắt đầu lại Chặng 2, **When** bài tập tải, **Then** bộ câu hỏi không trùng hoàn toàn với lần trước.

---

### User Story 3 - Mở Rộng Ngân Hàng Bài Tập Ghép Câu (Sentence Building) (Priority: P1)

Người học vào Chặng 3 (Ghép Câu). Hiện tại có 6 câu. Sau khi hoàn thiện, ngân hàng mở rộng lên ít nhất 12 câu, đa dạng về cấu trúc: câu khẳng định đơn giản, câu phủ định, câu có trạng từ tần suất ở các vị trí khác nhau, câu có cụm thời gian, và câu ghép liên kết bằng `and`/`or`. Mỗi phiên chọn ngẫu nhiên 6 câu.

**Why this priority**: Đa dạng cấu trúc câu giúp người học làm chủ trật tự từ trong nhiều kiểu câu khác nhau, không chỉ câu khẳng định đơn giản.

**Independent Test**: Vào Chặng 3, xác nhận bộ câu đa dạng cấu trúc và hệ thống chọn ngẫu nhiên.

**Acceptance Scenarios**:

1. **Given** người học bắt đầu Chặng 3, **When** bài tập tải, **Then** hiển thị 6 câu hỏi ngẫu nhiên từ ngân hàng ít nhất 12 câu.
2. **Given** ngân hàng câu hỏi mở rộng, **When** kiểm tra toàn bộ, **Then** bao phủ ít nhất 4 dạng cấu trúc câu khác nhau (khẳng định, phủ định, có trạng từ tần suất, có cụm thời gian).
3. **Given** người học hoàn thành và luyện lại, **When** bài tập tải, **Then** bộ câu không trùng hoàn toàn với lần trước.

---

### User Story 4 - Hệ Thống Chọn Ngẫu Nhiên Và Xáo Trộn Câu Hỏi (Priority: P1)

Người học muốn mỗi lần luyện tập đều có trải nghiệm mới mẻ. Khi vào bất kỳ chặng nào, hệ thống tự động chọn ngẫu nhiên một tập con câu hỏi từ ngân hàng câu hỏi mở rộng và xáo trộn thứ tự. Số lượng câu hỏi mỗi phiên giữ nguyên so với thiết kế ban đầu (8 cho Conjugation, 6 cho Error Hunting, 6 cho Sentence Building) để đảm bảo thời lượng phiên luyện tập phù hợp.

**Why this priority**: Randomization là cốt lõi để ngân hàng câu hỏi mở rộng phát huy giá trị — nếu không có randomization, việc thêm câu hỏi chỉ kéo dài thời gian phiên mà không tăng giá trị luyện tập.

**Independent Test**: Vào cùng một chặng 3 lần liên tiếp, xác nhận mỗi lần hiển thị bộ câu hỏi khác nhau với số lượng đúng quy định.

**Acceptance Scenarios**:

1. **Given** ngân hàng câu hỏi có nhiều hơn số câu yêu cầu mỗi phiên, **When** hệ thống tải bài tập, **Then** chọn đúng số lượng câu quy định và xáo trộn thứ tự.
2. **Given** ngân hàng câu hỏi mở rộng, **When** so sánh 3 phiên luyện tập liên tiếp, **Then** ít nhất 2 trong 3 phiên có bộ câu hỏi khác nhau.
3. **Given** hệ thống chọn ngẫu nhiên, **When** kiểm tra logic, **Then** tất cả câu hỏi trong ngân hàng đều có cơ hội được chọn (không có câu bị loại trừ vĩnh viễn).

---

### User Story 5 - Cập Nhật Metadata Và Dashboard Phản Ánh Nội Dung Mở Rộng (Priority: P2)

Sau khi mở rộng ngân hàng câu hỏi, metadata của module Present Simple và bảng tổng kết (Completion Dashboard) cần phản ánh chính xác tổng số câu hỏi thực tế. Thẻ Present Simple trên Hub 12 Thì hiển thị tổng số thử thách cập nhật. Dashboard tổng kết sau khi hoàn thành bài học hiển thị điểm trên tổng số câu thực tế đã làm trong phiên (ví dụ: "7/8 câu đúng" cho Conjugation).

**Why this priority**: Metadata và dashboard chính xác giúp người học có thông tin đúng về phạm vi bài tập và hiệu suất thực tế của mình.

**Independent Test**: Kiểm tra thẻ Present Simple trên Hub 12 Thì hiển thị tổng số thử thách cập nhật, và dashboard tổng kết hiển thị điểm chính xác.

**Acceptance Scenarios**:

1. **Given** ngân hàng câu hỏi đã mở rộng, **When** xem thẻ Present Simple trên Hub 12 Thì, **Then** hiển thị tổng số thử thách cập nhật (tổng của 3 chặng × số câu mỗi phiên = 8+6+6 = 20 câu/phiên).
2. **Given** người học hoàn thành 1 chặng, **When** xem dashboard tổng kết, **Then** hiển thị điểm trên tổng số câu thực tế đã làm trong phiên đó.

---

### Edge Cases

- **Ngân hàng câu hỏi nhỏ hơn số yêu cầu**: Nếu vì lý do nào đó ngân hàng có ít hơn số câu cần chọn, hệ thống sử dụng toàn bộ câu có sẵn mà không gây lỗi.
- **Random seed nhất quán trong phiên**: Trong cùng một phiên luyện tập (từ lúc bắt đầu chặng đến khi hoàn thành), bộ câu hỏi không thay đổi khi người dùng quay lại câu trước.
- **Tương thích ngược dữ liệu tiến độ**: Dữ liệu tiến độ đã lưu trong localStorage từ phiên bản cũ (20 câu cố định) vẫn được đọc và hiển thị đúng trên giao diện mới.
- **Đảm bảo chất lượng nội dung**: Tất cả câu hỏi mới phải tuân thủ đúng schema `TenseModuleData` đã định nghĩa, có giải thích ngữ pháp đầy đủ và chính xác.
- **Trạng thái scrambledTokens**: Các mảnh từ ghép câu mới phải có đủ số lượng token để tạo ra ít nhất 2 cách sắp xếp khác nhau (tránh bài quá dễ chỉ có 2 token).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ngân hàng câu hỏi Chặng 1 (Conjugation) PHẢI có ít nhất 15 câu hỏi chia động từ, bao phủ ít nhất 5 loại ngữ cảnh công sở (email, meeting, routine, report, chat).
- **FR-002**: Ngân hàng câu hỏi Chặng 2 (Error Hunting) PHẢI có ít nhất 12 câu hỏi săn lỗi sai, bao phủ ít nhất 5 dạng lỗi thì Hiện Tại Đơn phổ biến.
- **FR-003**: Ngân hàng câu hỏi Chặng 3 (Sentence Building) PHẢI có ít nhất 12 câu hỏi ghép câu, bao phủ ít nhất 4 dạng cấu trúc câu khác nhau.
- **FR-004**: Hệ thống PHẢI có logic chọn ngẫu nhiên (randomization) chọn một tập con câu hỏi từ ngân hàng mỗi phiên: 8 câu cho Conjugation, 6 câu cho Error Hunting, 6 câu cho Sentence Building.
- **FR-005**: Hệ thống PHẢI xáo trộn thứ tự câu hỏi được chọn trong mỗi phiên luyện tập.
- **FR-006**: Tất cả câu hỏi mới PHẢI tuân thủ schema `TenseModuleData` hiện tại (định nghĩa trong `src/types/tenses.ts`) và có giải thích ngữ pháp tiếng Việt đầy đủ.
- **FR-007**: Metadata `challengeCount` trong file `present-simple.json` và `index.json` PHẢI phản ánh số lượng câu hỏi mỗi phiên luyện tập (20 câu/phiên: 8+6+6), không phải tổng ngân hàng.
- **FR-008**: Hệ thống PHẢI duy trì tương thích ngược với dữ liệu tiến độ localStorage đã lưu từ phiên bản trước.
- **FR-009**: Nếu ngân hàng câu hỏi có ít hơn số lượng yêu cầu, hệ thống PHẢI sử dụng toàn bộ câu có sẵn mà không gây lỗi ứng dụng.

### Key Entities

- **Question Bank (Ngân Hàng Câu Hỏi)**: Tập hợp mở rộng các câu hỏi cho mỗi chặng, là nguồn dữ liệu để hệ thống chọn ngẫu nhiên. Được lưu trữ trong `present-simple.json` theo cấu trúc `TenseChallenges` hiện có.
- **Session Question Set (Bộ Câu Hỏi Phiên)**: Tập con câu hỏi được chọn ngẫu nhiên và xáo trộn cho mỗi phiên luyện tập. Số lượng cố định theo chặng (8/6/6).
- **Randomization Logic (Logic Ngẫu Nhiên)**: Cơ chế chọn và xáo trộn câu hỏi từ ngân hàng, đảm bảo tính công bằng (mọi câu đều có cơ hội) và tính ổn định trong phiên (bộ câu không đổi khi reload trong phiên).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ngân hàng câu hỏi đạt ít nhất 39 câu tổng cộng (15 Conjugation + 12 Error Hunting + 12 Sentence Building), tăng gấp đôi so với 20 câu hiện tại.
- **SC-002**: Người học trải nghiệm ít nhất 3 phiên luyện tập liên tiếp trên cùng một chặng mà không gặp bộ câu hỏi trùng lặp hoàn toàn.
- **SC-003**: 100% câu hỏi mới có giải thích ngữ pháp tiếng Việt đầy đủ và chính xác, đạt chuẩn schema validation.
- **SC-004**: Thời lượng mỗi phiên luyện tập duy trì trong khoảng 3-5 phút (không tăng do thêm câu hỏi vào ngân hàng, vì số câu mỗi phiên giữ nguyên).
- **SC-005**: Tất cả unit test và e2e test hiện tại vẫn pass sau khi thay đổi, và có thêm test mới cho logic randomization.

## Assumptions

- Cấu trúc dữ liệu `TenseModuleData` và các type hiện tại (`ConjugationItem`, `ErrorHunterItem`, `SentenceBuilderItem`) đã đầy đủ cho việc mở rộng nội dung, không cần thay đổi schema.
- Các component UI hiện tại (ConjugationStage, ErrorHunterStage, SentenceBuilderStage) đã hoạt động tốt và chỉ cần tích hợp logic randomization, không cần thiết kế lại giao diện.
- Logic randomization được thực hiện ở lớp service/utility, không ảnh hưởng đến cấu trúc component.
- Tất cả nội dung câu hỏi mới sử dụng bối cảnh công sở thực tế, song ngữ Anh-Việt, phù hợp với đối tượng người đi làm.
- Tiến độ lưu trong localStorage tính theo phiên (số câu đúng trên tổng câu trong phiên), nên việc mở rộng ngân hàng không ảnh hưởng cách tính điểm.
