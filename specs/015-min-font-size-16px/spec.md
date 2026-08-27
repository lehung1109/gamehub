# Feature Specification: Đảm bảo Font Size không nhỏ hơn 16px Toàn Ứng Dụng (Global Minimum 16px Font Size)

**Feature Branch**: `015-min-font-size-16px`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "đảm bảo font size không nhỏ hơn 16px toàn ứng dụng (Global Theme: từ games cho học sinh đến admin dashboard, UI components, badge, tooltip, form, modal)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trải nghiệm đọc rõ ràng và không mỏi mắt cho học sinh khi học tập và chơi game (Priority: P1)

Học sinh (đặc biệt là lứa tuổi thiếu nhi) khi tham gia các trò chơi học tập và luyện ngữ pháp (Alphabet, Flashcard, Listening, Numbers & Colors, Sentences, Spelling, Workplace Tenses, v.v.) có thể đọc rõ ràng toàn bộ nội dung từ vựng, câu hỏi, nhãn hướng dẫn, phản hồi kết quả và thông tin tiến độ với cỡ chữ luôn từ 16px trở lên, đảm bảo tính dễ đọc và bảo vệ thị giác trên mọi thiết bị.

**Why this priority**: Trọng tâm cốt lõi của nền tảng GameHub là phục vụ học sinh học tiếng Anh qua trò chơi. Cỡ chữ đủ lớn (≥16px) giúp trẻ nhỏ không bị căng mắt, dễ dàng nhận diện mặt chữ và tập trung tối đa vào bài học.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở lần lượt tất cả các màn hình trò chơi (Flashcard, Spelling, Quiz, Workplace Tenses, Bản đồ bài học, Huy hiệu hồ sơ cá nhân) và kiểm tra mọi đoạn văn bản, nhãn phụ, tag tiến độ đều hiển thị với kích thước chữ không nhỏ hơn 16px, không bị chồng chéo hay che khuất.

**Acceptance Scenarios**:

1. **Given** học sinh đang ở bất kỳ màn hình trò chơi nào (Alphabet, Flashcard, Numbers & Colors, Spelling, Listening, Sentences, Workplace Tenses), **When** hệ thống hiển thị văn bản hướng dẫn, nhãn trạng thái, số thứ tự câu hỏi, gợi ý hoặc banner thông báo, **Then** tất cả các phần tử văn bản này đều hiển thị với kích thước chữ tối thiểu 16px, rõ nét và dễ đọc.
2. **Given** học sinh xem huy hiệu hồ sơ cá nhân, cấp độ hoặc hộp thoại chúc mừng thăng cấp (Level Up Celebration), **When** các thông tin chi tiết như điểm số, cấp độ, thông điệp động viên và nhãn trạng thái "Tối đa" xuất hiện, **Then** toàn bộ các dòng chữ và nhãn phụ đều có kích thước tối thiểu 16px và bố cục hiển thị thoáng đãng.

---

### User Story 2 - Trải nghiệm quản trị và quản lý lớp học thoải mái cho giáo viên và quản trị viên (Priority: P2)

Giáo viên và Quản trị viên khi truy cập các trang quản trị (Admin Dashboard, Quản lý cấu hình game, Danh sách lớp học, Chi tiết học sinh, Báo cáo phân tích từ khó) có thể theo dõi và thao tác trên các bảng biểu, biểu mẫu nhập liệu và báo cáo thống kê một cách thuận tiện, không cần phóng to màn hình, trong khi bố cục thông tin vẫn cân đối và trực quan.

**Why this priority**: Giáo viên và quản trị viên thường xuyên làm việc với lượng thông tin nhiều trên dashboard; cỡ chữ tối thiểu 16px giúp nâng cao trải nghiệm người dùng, giảm thiểu sai sót khi cấu hình và theo dõi học sinh.

**Independent Test**: Có thể kiểm thử độc lập bằng cách truy cập các trang trong khu vực Quản trị (Admin) và kiểm tra các bảng dữ liệu, danh sách lớp học, biểu mẫu cấu hình trò chơi, các thẻ tóm tắt và hộp thoại chia sẻ/xóa để xác nhận toàn bộ nội dung đều có cỡ chữ ≥16px.

**Acceptance Scenarios**:

1. **Given** Quản trị viên/Giáo viên đang xem bảng danh sách cấu hình, danh sách lớp học hoặc chi tiết học sinh, **When** các hàng dữ liệu, nhãn phân loại, huy hiệu trạng thái, chú thích và nút thao tác được hiển thị, **Then** toàn bộ chữ bên trong đều đạt kích thước tối thiểu 16px và các cột dữ liệu không bị tràn viền hoặc đè lên nhau.
2. **Given** Giáo viên đang tạo mới hoặc chỉnh sửa cấu hình trò chơi, **When** điền biểu mẫu với các nhãn trường, văn bản hướng dẫn phụ (helper text) và thông báo lỗi hợp lệ, **Then** toàn bộ văn bản hướng dẫn và nhãn trường hiển thị ở mức tối thiểu 16px, giúp người dùng đọc rõ ràng các quy tắc cấu hình.

---

### User Story 3 - Chuẩn hóa kích thước chữ trên toàn bộ các thành phần giao diện dùng chung (Priority: P3)

Tất cả các thành phần giao diện nền tảng dùng chung (Nút bấm, Huy hiệu, Chú giải công cụ/Tooltip, Thẻ tóm tắt, Hộp thoại/Dialog, Khung chuyển đổi/Toggle, Thanh thông báo) đều tuân thủ quy tắc kích thước chữ tối thiểu 16px trên mọi biến thể kích cỡ mà không làm méo hình dáng, cắt xén văn bản hoặc phá vỡ cấu trúc thẩm mỹ chung.

**Why this priority**: Đảm bảo tính nhất quán của hệ thống thiết kế (Design System), ngăn ngừa việc các thành phần phụ hoặc biến thể kích thước nhỏ vô tình làm giảm kích thước chữ xuống dưới 16px.

**Independent Test**: Có thể kiểm thử độc lập bằng cách render và tương tác với từng thành phần UI (Button các size, Badge các variant, Tooltip khi hover, Dialog khi mở) và đo lường kích thước chữ hiển thị thực tế đều từ 16px trở lên.

**Acceptance Scenarios**:

1. **Given** người dùng tương tác với nút bấm (Button) hoặc nút chuyển đổi (Toggle) ở kích thước nhỏ (compact/sm), **When** thành phần được hiển thị, **Then** văn bản bên trong nút có cỡ chữ tối thiểu 16px và khoảng cách đệm (padding) tự động co giãn phù hợp để chứa đầy đủ nội dung chữ và biểu tượng kèm theo.
2. **Given** người dùng rê chuột qua một phần tử có Chú giải công cụ (Tooltip) hoặc xem các Huy hiệu (Badge), **When** Tooltip hoặc Badge xuất hiện, **Then** nội dung văn bản bên trong hiển thị với cỡ chữ tối thiểu 16px, độ tương phản cao và không bị cắt cụt (clipping).

---

### Edge Cases

- **Màn hình thiết bị di động có chiều rộng hẹp (320px - 375px)**: Khi nâng cỡ chữ lên tối thiểu 16px, các nhãn hoặc nút bấm trong thanh tiêu đề/thanh điều hướng nhỏ có thể có nguy cơ tràn dòng; hệ thống cần đảm bảo ngắt dòng hợp lý, cho phép co giãn vùng chứa mà không làm vỡ bố cục tổng thể.
- **Bảng dữ liệu nhiều cột trong trang Quản trị**: Bảng danh sách học sinh và phân tích từ khó khi hiển thị ở font chữ 16px cần có cơ chế cuộn ngang (horizontal scroll) mượt mà trên màn hình nhỏ để tránh ép hẹp nội dung cột.
- **Nội dung thẻ ngắn trong giao diện trò chơi dạng lưới (như Lưới chữ cái Alphabet, Thẻ màu sắc/Số)**: Khi các nhãn phụ bên dưới thẻ đạt 16px, thẻ game phải duy trì tỷ lệ hình vuông/chữ nhật hài hòa, không che mất phần hình ảnh minh họa hoặc biểu tượng chính.
- **Chế độ Sáng và Tối (Light & Dark Mode)**: Việc đồng nhất font size tối thiểu 16px phải giữ nguyên độ tương phản chuẩn và phân cấp thị giác rõ ràng trên cả hai giao diện nền sáng và tối.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI thiết lập quy tắc kích thước phông chữ cơ sở và kích thước phông chữ tối thiểu cho toàn bộ ứng dụng là 16px (1rem).
- **FR-002**: Toàn bộ hệ thống định dạng kiểu chữ (Typography Theme) của ứng dụng—bao gồm cả các cấp độ định nghĩa văn bản nhỏ nhất—PHẢI có kích thước tối thiểu là 16px (1rem) kèm theo chiều cao dòng (line-height) tương ứng tối thiểu 24px (1.5rem) để đảm bảo độ thoáng và dễ đọc.
- **FR-003**: Hệ thống PHẢI loại bỏ và chuẩn hóa tất cả các định nghĩa cỡ chữ tùy chỉnh nhỏ hơn 16px (chẳng hạn như các kích thước 10px, 11px, 12px, 14px) trên toàn bộ các trang và thành phần giao diện.
- **FR-004**: Tất cả các thành phần giao diện dùng chung (Nút bấm, Huy hiệu, Chú giải công cụ, Khung chọn, Biểu mẫu, Hộp thoại thông báo) PHẢI hiển thị văn bản với cỡ chữ từ 16px trở lên trên mọi biến thể kích thước.
- **FR-005**: Toàn bộ các màn hình trò chơi và học tập (Alphabet, Flashcard, Listening, Numbers & Colors, Sentences, Spelling, Workplace Tenses, Hồ sơ học sinh, Hộp thoại chúc mừng) PHẢI hiển thị mọi nội dung từ 16px trở lên.
- **FR-006**: Toàn bộ các màn hình quản trị và báo cáo lớp học (Admin Dashboard, Quản lý cấu hình, Chi tiết học sinh, Báo cáo từ khó) PHẢI hiển thị dữ liệu bảng, biểu mẫu, nhãn trạng thái và phân tích với cỡ chữ từ 16px trở lên.
- **FR-007**: Hệ thống PHẢI tự động điều chỉnh khoảng đệm và kích thước tối thiểu của các vùng chứa (cards, buttons, badges, dialogs) để chứa trọn vẹn văn bản 16px mà không gây cắt xén (clipping) hay tràn lề không kiểm soát.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các đoạn văn bản hiển thị trên tất cả các trang của ứng dụng đều có kích thước phông chữ thực tế (computed font-size) tối thiểu đạt 16px (1rem).
- **SC-002**: 0% hiện tượng vỡ bố cục, chữ bị cắt xén (text clipping) hoặc tràn ngoài vùng chứa (container overflow) trên mọi kích thước màn hình từ 320px đến 1920px.
- **SC-003**: 100% các bài kiểm thử tự động (Unit Tests, E2E Tests) và quy trình build của hệ thống hoàn thành thành công và không phát sinh lỗi liên quan đến giao diện.
- **SC-004**: Độ dễ đọc và khả năng tiếp cận (readability/accessibility) được cải thiện rõ rệt cho học sinh nhỏ tuổi và giáo viên, không còn bất kỳ chi tiết giao diện nào có cỡ chữ khó đọc.

## Assumptions

- Kích thước phông chữ mặc định của trình duyệt là 16px tương đương 1rem.
- Hệ thống hỗ trợ tốt các thiết bị hiển thị có độ phân giải chiều rộng từ 320px trở lên.
- Việc chuẩn hóa cỡ chữ tối thiểu 16px chỉ tác động lên tầng hiển thị và hệ thống thiết kế giao diện, không làm thay đổi logic nghiệp vụ, cấu trúc cơ sở dữ liệu hay phân quyền người dùng.
