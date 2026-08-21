# Feature Specification: Quản lý Tài khoản & Cấu hình Game

**Feature Branch**: `002-game-config-management`

**Created**: 2026-08-21

**Status**: Draft

**Input**: User description: "Thêm tính năng quản lý tài khoản, cho phép admin cấu hình từng game và cho phép share, 1 game có thể có nhiều cấu hình, admin có thể đặt tên"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin đăng nhập và quản lý tài khoản (Priority: P1)

Một giáo viên (admin) truy cập trang đăng nhập của hệ thống. Sau khi đăng nhập thành công, admin được chuyển đến trang quản trị (dashboard) nơi có thể xem danh sách tất cả các game hiện có và các cấu hình đã tạo. Admin có thể quản lý tài khoản cá nhân (đổi mật khẩu, cập nhật thông tin).

**Why this priority**: Đăng nhập là điều kiện tiên quyết — không có tài khoản admin thì không thể tạo hay quản lý cấu hình game. Đây là nền tảng cho toàn bộ tính năng.

**Independent Test**: Có thể kiểm thử bằng cách truy cập trang đăng nhập, nhập thông tin tài khoản, xác nhận đăng nhập thành công và hiển thị dashboard quản trị.

**Acceptance Scenarios**:

1. **Given** admin truy cập trang đăng nhập, **When** nhập email và mật khẩu đúng, **Then** đăng nhập thành công và chuyển đến dashboard
2. **Given** admin nhập sai mật khẩu, **When** nhấn đăng nhập, **Then** hiển thị thông báo lỗi rõ ràng và không cho truy cập
3. **Given** admin đã đăng nhập, **When** truy cập dashboard, **Then** hiển thị danh sách game và các cấu hình đã tạo
4. **Given** admin đã đăng nhập, **When** chọn đổi mật khẩu, **Then** có thể cập nhật mật khẩu mới thành công
5. **Given** người dùng chưa đăng nhập, **When** truy cập trang quản trị, **Then** bị chuyển hướng về trang đăng nhập

---

### User Story 2 - Tạo và đặt tên cấu hình cho game (Priority: P1)

Admin chọn một game (ví dụ: Flashcard) từ dashboard. Admin nhấn "Tạo cấu hình mới", đặt tên cho cấu hình (ví dụ: "Lớp 1A - Tuần 3") và thiết lập các tham số riêng cho game đó (ví dụ: chọn chủ đề từ vựng, giới hạn số lượng từ, bật/tắt phát âm tự động). Admin lưu cấu hình và có thể tạo thêm nhiều cấu hình khác cho cùng game.

**Why this priority**: Khả năng tạo và đặt tên cấu hình là giá trị cốt lõi — cho phép admin tùy chỉnh nội dung game theo nhu cầu cụ thể của từng lớp hoặc nhóm học sinh.

**Independent Test**: Chọn game, tạo cấu hình mới, đặt tên, thiết lập tham số, lưu — xác nhận cấu hình xuất hiện trong danh sách.

**Acceptance Scenarios**:

1. **Given** admin đang ở dashboard, **When** chọn game Flashcard, **Then** hiển thị danh sách cấu hình hiện có của game đó và nút tạo mới
2. **Given** admin nhấn "Tạo cấu hình mới", **When** nhập tên "Lớp 1A - Tuần 3", **Then** hệ thống chấp nhận tên và hiển thị form cấu hình
3. **Given** admin đang thiết lập cấu hình Flashcard, **When** chọn chủ đề "Animals" và giới hạn 10 từ, **Then** các tham số được ghi nhận
4. **Given** admin đã thiết lập xong, **When** nhấn "Lưu", **Then** cấu hình được lưu và xuất hiện trong danh sách cấu hình của game
5. **Given** game Flashcard đã có cấu hình "Lớp 1A - Tuần 3", **When** admin tạo thêm cấu hình "Lớp 1B - Ôn tập", **Then** cả hai cấu hình cùng tồn tại trong danh sách

---

### User Story 3 - Chỉnh sửa và xóa cấu hình (Priority: P2)

Admin mở một cấu hình đã tạo từ trước (ví dụ: "Lớp 1A - Tuần 3"). Admin thay đổi tên thành "Lớp 1A - Tuần 4", cập nhật chủ đề từ vựng và lưu lại. Admin cũng có thể xóa cấu hình không còn cần thiết.

**Why this priority**: Quản lý vòng đời cấu hình (sửa, xóa) là cần thiết để admin duy trì bộ cấu hình gọn gàng và cập nhật theo chương trình giảng dạy.

**Independent Test**: Mở cấu hình đã tạo, thay đổi tên và tham số, lưu — xác nhận thay đổi được phản ánh. Xóa cấu hình — xác nhận không còn trong danh sách.

**Acceptance Scenarios**:

1. **Given** admin mở cấu hình "Lớp 1A - Tuần 3", **When** đổi tên thành "Lớp 1A - Tuần 4" và nhấn Lưu, **Then** tên mới được cập nhật trong danh sách
2. **Given** admin đang xem cấu hình, **When** thay đổi các tham số (chủ đề, số lượng từ), **Then** tham số mới được lưu thành công
3. **Given** admin muốn xóa cấu hình, **When** nhấn "Xóa" và xác nhận, **Then** cấu hình bị xóa và không còn xuất hiện trong danh sách
4. **Given** admin nhấn "Xóa", **When** hệ thống hiển thị xác nhận, **Then** admin có thể hủy thao tác xóa nếu nhầm

---

### User Story 4 - Chia sẻ cấu hình qua link (Priority: P2)

Admin mở cấu hình "Lớp 1A - Tuần 4" và nhấn nút "Chia sẻ". Hệ thống tạo ra một đường link duy nhất. Admin gửi link này cho học sinh hoặc phụ huynh. Khi người nhận mở link, họ được chuyển thẳng vào game với cấu hình đã thiết lập sẵn — không cần đăng nhập, không cần chọn cấu hình.

**Why this priority**: Chia sẻ là cầu nối giữa admin (giáo viên) và người dùng cuối (học sinh). Nếu không chia sẻ được, cấu hình tùy chỉnh chỉ có giá trị cho admin, không đến được học sinh.

**Independent Test**: Tạo cấu hình, nhấn chia sẻ, sao chép link, mở link trong trình duyệt mới (không đăng nhập) — xác nhận game hiển thị đúng cấu hình.

**Acceptance Scenarios**:

1. **Given** admin đang xem cấu hình "Lớp 1A - Tuần 4", **When** nhấn "Chia sẻ", **Then** hệ thống tạo link chia sẻ và hiển thị để sao chép
2. **Given** link chia sẻ đã được tạo, **When** admin nhấn nút sao chép, **Then** link được sao chép vào clipboard
3. **Given** học sinh mở link chia sẻ, **When** trang tải, **Then** game hiển thị đúng cấu hình (chủ đề, số từ, các thiết lập) mà không cần đăng nhập
4. **Given** admin xóa cấu hình đã chia sẻ, **When** học sinh mở link cũ, **Then** hiển thị thông báo rằng cấu hình không còn tồn tại và hướng dẫn về trang chủ

---

### User Story 5 - Học sinh chơi game với cấu hình mặc định (Priority: P1)

Học sinh truy cập trang chủ như bình thường (không qua link chia sẻ). Các game vẫn hoạt động với cấu hình mặc định — toàn bộ nội dung, không giới hạn. Trải nghiệm của học sinh không đăng nhập hoàn toàn không bị ảnh hưởng bởi tính năng quản lý cấu hình.

**Why this priority**: Đảm bảo backward compatibility — tính năng mới không được phá vỡ trải nghiệm hiện tại của học sinh đang dùng website.

**Independent Test**: Mở trang chủ, chọn game bất kỳ — xác nhận game hoạt động bình thường với toàn bộ nội dung mặc định, giống hệt trước khi có tính năng cấu hình.

**Acceptance Scenarios**:

1. **Given** học sinh truy cập trang chủ, **When** chọn game Flashcard, **Then** game hiển thị toàn bộ chủ đề và từ vựng như bình thường
2. **Given** admin đã tạo nhiều cấu hình cho Flashcard, **When** học sinh truy cập Flashcard qua trang chủ, **Then** game vẫn dùng cấu hình mặc định (toàn bộ nội dung)
3. **Given** học sinh không đăng nhập, **When** truy cập bất kỳ trang nào, **Then** không thấy giao diện quản trị hay yêu cầu đăng nhập

---

### Edge Cases

- Điều gì xảy ra khi admin tạo cấu hình với tên trùng? → Hệ thống cho phép tên trùng nhưng mỗi cấu hình có định danh riêng, hiển thị cảnh báo để admin biết
- Điều gì xảy ra khi admin tạo cấu hình rỗng (không chọn tham số nào)? → Hệ thống yêu cầu ít nhất một tham số bắt buộc trước khi cho phép lưu
- Điều gì xảy ra khi link chia sẻ bị truy cập sau khi cấu hình bị xóa? → Hiển thị trang thông báo thân thiện và hướng dẫn về trang chủ
- Điều gì xảy ra khi phiên đăng nhập hết hạn trong lúc admin đang chỉnh sửa? → Hệ thống lưu tạm thay đổi, yêu cầu đăng nhập lại, khôi phục trạng thái chỉnh sửa
- Điều gì xảy ra khi game có cập nhật nội dung mới (thêm chủ đề/từ vựng)? → Cấu hình cũ vẫn hoạt động với nội dung đã chọn, admin có thể cập nhật thủ công

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép admin đăng nhập bằng email và mật khẩu
- **FR-002**: Hệ thống PHẢI bảo vệ các trang quản trị, chỉ admin đã đăng nhập mới truy cập được
- **FR-003**: Hệ thống PHẢI hiển thị dashboard liệt kê tất cả game và cấu hình tương ứng
- **FR-004**: Admin PHẢI có thể tạo cấu hình mới cho bất kỳ game nào
- **FR-005**: Admin PHẢI có thể đặt tên tùy ý cho mỗi cấu hình
- **FR-006**: Một game PHẢI hỗ trợ nhiều cấu hình đồng thời (không giới hạn số lượng)
- **FR-007**: Admin PHẢI có thể thiết lập các tham số cấu hình riêng cho từng loại game (ví dụ: chủ đề, số lượng nội dung, bật/tắt tính năng)
- **FR-008**: Admin PHẢI có thể chỉnh sửa tên và tham số của cấu hình đã tạo
- **FR-009**: Admin PHẢI có thể xóa cấu hình với bước xác nhận
- **FR-010**: Hệ thống PHẢI tạo link chia sẻ duy nhất cho mỗi cấu hình
- **FR-011**: Người nhận link chia sẻ PHẢI có thể truy cập game với cấu hình đã thiết lập mà không cần đăng nhập
- **FR-012**: Hệ thống PHẢI giữ nguyên trải nghiệm mặc định cho người dùng không qua link chia sẻ (backward compatibility)
- **FR-013**: Admin PHẢI có thể đổi mật khẩu tài khoản
- **FR-014**: Hệ thống PHẢI hiển thị thông báo thân thiện khi link chia sẻ không còn hợp lệ

### Key Entities

- **Admin**: Người quản trị hệ thống (giáo viên), có tài khoản đăng nhập, quyền tạo/sửa/xóa cấu hình
- **Game**: Một game học tiếng Anh trong hệ thống (Flashcard, Chữ cái, v.v.), có danh sách tham số có thể cấu hình
- **Game Configuration (Cấu hình Game)**: Một bộ thiết lập tùy chỉnh cho game cụ thể, bao gồm: tên do admin đặt, tham số game, mã chia sẻ duy nhất, thuộc về một admin và một game
- **Share Link (Link Chia sẻ)**: Đường link duy nhất ánh xạ đến một cấu hình cụ thể, cho phép truy cập game với cấu hình đã thiết lập mà không cần xác thực

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin có thể tạo cấu hình mới cho bất kỳ game nào trong vòng 2 phút
- **SC-002**: Học sinh mở link chia sẻ và bắt đầu chơi game đúng cấu hình trong vòng 3 giây
- **SC-003**: 100% game hiện có vẫn hoạt động bình thường với cấu hình mặc định sau khi tính năng được thêm
- **SC-004**: Admin có thể quản lý (tạo, sửa, xóa, chia sẻ) ít nhất 50 cấu hình trên mỗi game mà không gặp vấn đề
- **SC-005**: Quy trình đăng nhập hoàn tất trong vòng 30 giây
- **SC-006**: Link chia sẻ không hợp lệ hiển thị hướng dẫn rõ ràng trong vòng 2 giây

## Assumptions

- Tài khoản admin được tạo thủ công (seed) hoặc qua giao diện admin đầu tiên, không cần tính năng đăng ký công khai
- Mỗi game sẽ định nghĩa riêng danh sách tham số có thể cấu hình (configurable parameters) phù hợp với loại game đó
- Hệ thống hiện tại không có cơ sở dữ liệu — tính năng này sẽ cần thêm persistence layer (nhưng cụ thể công nghệ nào sẽ quyết định ở phase planning)
- Link chia sẻ không có thời hạn hết hạn trừ khi cấu hình bị xóa
- Chỉ có một cấp độ quyền: admin (không phân quyền chi tiết hơn)
- Tính năng này không ảnh hưởng đến cam kết "zero tracking, zero cookies" cho học sinh — chỉ admin mới cần đăng nhập
- Giao diện quản trị dùng tiếng Việt, phù hợp với đối tượng admin là giáo viên Việt Nam
