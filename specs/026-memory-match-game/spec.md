# Feature Specification: Memory Match Game (Trò chơi Lật Thẻ Tìm Cặp)

**Feature Branch**: `026-memory-match-game`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "dựa theo hướng tiếp cận số 1 bên trên: Game lật thẻ tìm cặp (Memory Match) ghép Thẻ Hình ảnh Emoji ↔ Thẻ Chữ tiếng Anh cho trẻ em lớp 1-2, lưới 12 thẻ (6 cặp), phát âm chuẩn khi lật thẻ chữ hoặc ghép đúng, đánh giá sao, theo dõi tiến độ học sinh và hỗ trợ cấu hình Admin cho giáo viên."

## Clarifications

### Session 2026-09-06

- Q: Quy tắc chấm điểm xếp hạng sao (1 đến 3 sao) dựa trên số lượt lật thẻ (cho 6 cặp thẻ) nên được quy định theo ngưỡng cụ thể nào? → A: 3 sao khi ≤ 8 lượt lật; 2 sao khi từ 9-12 lượt lật; 1 sao khi trên 12 lượt lật (với N cặp: 3 sao khi ≤ N + 2; 2 sao khi N + 3 đến 2N; 1 sao khi > 2N).
- Q: Khi người học chơi ván mới hoặc cấu hình trò chơi, số lượng cặp từ có được phép tùy chỉnh không? → A: Cho phép lựa chọn số lượng cặp từ (4, 6 hoặc 8 cặp tương ứng 8, 12 hoặc 16 thẻ, mặc định là 6 cặp); mỗi ván mới bốc ngẫu nhiên số từ tương ứng từ kho từ của chủ đề và xáo trộn vị trí.
- Q: Đối với các thẻ đã ghép cặp thành công trên bàn cờ, học sinh có được phép chạm/click vào để nghe lại phát âm tiếng Anh của từ đó không? → A: Cho phép chạm vào thẻ đã ghép để nghe lại phát âm từ vựng mà không tính thêm lượt lật và không thay đổi trạng thái thẻ.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chơi Lật Thẻ Tìm Cặp Từ Vựng (Priority: P1)

As a primary school learner (Grades 1-2), I want to play a card-matching game by turning over cards to find pairs of pictures and English words, so that I can practice vocabulary recognition and memory skills through play.

**Why this priority**: Đây là trải nghiệm cốt lõi của trò chơi (MVP). Nếu chỉ có tính năng này, người học vẫn có thể học từ vựng và giải trí hiệu quả.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở trang trò chơi, chọn một chủ đề từ vựng bất kỳ, lật các thẻ để tìm đủ 6 cặp thẻ (Hình ảnh ↔ Chữ tiếng Anh) và xem màn hình chiến thắng cùng điểm số.

**Acceptance Scenarios**:

1. **Given** người học vào trang trò chơi lật thẻ, **When** chọn một chủ đề (ví dụ: Động vật) và số lượng cặp thẻ (4, 6 hoặc 8 cặp, mặc định là 6), **Then** hệ thống hiển thị bàn cờ gồm các ô thẻ úp mặt được bốc ngẫu nhiên từ kho từ và sắp xếp ngẫu nhiên (tương ứng 8, 12 hoặc 16 thẻ).
2. **Given** một thẻ chữ tiếng Anh được lật mở, **When** người học bấm vào thẻ, **Then** hệ thống tự động phát âm chuẩn xác từ tiếng Anh của thẻ đó.
3. **Given** người học đã lật một thẻ, **When** người học lật tiếp thẻ thứ hai và hai thẻ này tạo thành một cặp đúng (1 thẻ hình ảnh và 1 thẻ chữ của cùng một từ vựng), **Then** cả hai thẻ giữ nguyên trạng thái mở, có âm thanh/hiệu ứng chúc mừng ghép đúng và không bị úp lại.
4. **Given** người học lật hai thẻ không thuộc cùng một cặp từ vựng, **When** thẻ thứ hai vừa mở, **Then** hệ thống giữ cả hai thẻ mở trong một khoảng thời gian ngắn (khoảng 1 giây) để người học ghi nhớ vị trí, sau đó tự động úp lại cả hai thẻ.
5. **Given** người học đã tìm đủ tất cả các cặp thẻ (N cặp), **When** cặp cuối cùng được ghép thành công, **Then** màn hình chúc mừng xuất hiện hiển thị số lượt lật thẻ, thời gian hoàn thành, xếp hạng sao (3 sao khi ≤ N+2 lượt, 2 sao khi từ N+3 đến 2N lượt, 1 sao khi > 2N lượt) cùng các tùy chọn "Chơi lại" hoặc "Đổi chủ đề".

---

### User Story 2 - Ghi Nhận Thành Tích và Tiến Độ Học Sinh (Priority: P2)

As a student participating in a class, I want my game completion results to be recorded to my student profile, so that my teacher can monitor my practice effort and achievements.

**Why this priority**: Giúp tích hợp trò chơi vào hệ thống quản lý học tập lớp học của GameHub, tạo động lực cho học sinh và hỗ trợ giáo viên theo dõi tiến độ.

**Independent Test**: Có thể kiểm thử độc lập bằng cách tham gia trò chơi với mã lớp học và tên học sinh hợp lệ, hoàn thành một ván chơi, sau đó xác nhận dữ liệu phiên chơi được lưu vào báo cáo lớp học.

**Acceptance Scenarios**:

1. **Given** học sinh tham gia chơi với mã lớp và tên học sinh hợp lệ, **When** hoàn thành ván chơi lật thẻ, **Then** hệ thống tự động gửi thông tin kết quả (tên trò chơi, chủ đề, số lượt lật, số sao, thời gian) đến hệ thống quản lý tiến độ.
2. **Given** người chơi tự do (không có mã lớp học), **When** hoàn thành ván chơi, **Then** màn hình chiến thắng vẫn hiển thị đầy đủ kết quả mà không phát sinh bất kỳ lỗi gián đoạn nào.

---

### User Story 3 - Giáo Viên Tùy Biến Cấu Hình Trò Chơi (Priority: P3)

As a teacher, I want to create custom configurations for the memory match game and preview them, so that I can assign targeted vocabulary practice suited to my class curriculum.

**Why this priority**: Tăng tính cá nhân hóa giảng dạy, cho phép giáo viên giới hạn chủ đề hoặc tùy chỉnh chế độ hỗ trợ âm thanh phù hợp với từng nhóm học sinh.

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập tài khoản giáo viên, vào giao diện tạo cấu hình trò chơi "Lật thẻ tìm cặp", chọn các thiết lập, bấm "Xem trước" để trải nghiệm thử, sau đó lưu cấu hình và xác nhận cấu hình xuất hiện trong danh sách.

**Acceptance Scenarios**:

1. **Given** giáo viên ở trang tạo cấu hình trò chơi, **When** chọn trò chơi "Lật thẻ tìm cặp", **Then** hệ thống hiển thị biểu mẫu cho phép đặt tên cấu hình, chọn các chủ đề từ vựng được phép chơi, chọn số lượng cặp từ (4, 6 hoặc 8 cặp), bật/tắt tự động phát âm và bật/tắt hiển thị đồng hồ thời gian.
2. **Given** giáo viên điều chỉnh các tham số cấu hình, **When** nhấn nút "Xem trước", **Then** hệ thống mở màn chơi mẫu phản ánh chính xác cấu hình vừa thiết lập kèm dải thông báo chế độ xem trước.
3. **Given** giáo viên hoàn tất việc lưu cấu hình hợp lệ, **When** lưu thành công, **Then** cấu hình hiển thị trong danh sách và cung cấp liên kết chia sẻ trực tiếp cho học sinh.

---

### Edge Cases

- **Bấm liên tục nhiều thẻ cùng lúc**: Khi người học bấm nhanh vào 3 hoặc 4 thẻ trong lúc 2 thẻ trước đó đang được so sánh, hệ thống phải tạm thời vô hiệu hóa tương tác lật của các thẻ còn lại để đảm bảo không có quá 2 thẻ chưa ghép cùng mở một lúc.
- **Bấm lại vào thẻ đang mở**: Khi người học bấm lại vào chiếc thẻ vừa lật mở đầu tiên trong lượt, hệ thống phải bỏ qua tương tác, không tính thêm lượt lật và không làm thay đổi trạng thái thẻ.
- **Bấm vào thẻ đã được ghép đôi thành công**: Khi người học bấm vào bất kỳ thẻ nào trong cặp đã ghép đúng, hệ thống phát lại âm thanh đọc từ vựng tiếng Anh để bé luyện nghe, đồng thời không tính thêm lượt lật và không làm thay đổi trạng thái thẻ.
- **Thiết bị không hỗ trợ tính năng đọc phát âm**: Nếu trình duyệt hoặc thiết bị của người dùng không hỗ trợ tính năng phát âm giọng nói tự động, hệ thống hiển thị thông báo nhẹ nhàng cho người dùng biết, đồng thời trò chơi vẫn tiếp tục hoạt động hoàn hảo thông qua nhận diện thị giác.
- **Màn hình kích thước nhỏ (Điện thoại thông minh)**: Bàn cờ (8, 12 hoặc 16 thẻ) phải tự động co dãn theo lưới responsive (ví dụ 2x4, 3x4 hoặc 4x4), đảm bảo diện tích chạm của từng ô thẻ đủ lớn để ngón tay của trẻ em bấm trúng dễ dàng.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp trò chơi lật thẻ tìm cặp với số lượng cặp từ vựng có thể lựa chọn gồm 4 cặp (8 thẻ), 6 cặp (12 thẻ - mặc định) hoặc 8 cặp (16 thẻ).
- **FR-002**: Mỗi cặp thẻ PHẢI gồm 1 thẻ hiển thị hình ảnh/biểu tượng đại diện và 1 thẻ hiển thị từ vựng tiếng Anh tương ứng.
- **FR-003**: Hệ thống PHẢI phát âm từ vựng tiếng Anh khi thẻ chữ tiếng Anh được lật mở, khi một cặp thẻ được ghép đôi chính xác, hoặc khi người học chạm vào thẻ đã ghép thành công để nghe lại (không tính thêm lượt lật).
- **FR-004**: Hệ thống PHẢI bốc ngẫu nhiên số lượng từ vựng tương ứng từ kho từ của chủ đề và xáo trộn ngẫu nhiên vị trí của tất cả các thẻ trong mỗi ván chơi mới.
- **FR-005**: Hệ thống PHẢI theo dõi và hiển thị số lượt lật thẻ và thời gian người học đang chơi ván đấu.
- **FR-006**: Khi hai thẻ được lật không khớp nhau, hệ thống PHẢI giữ mở trong khoảng thời gian ngắn (xấp xỉ 1 giây) trước khi tự động lật úp lại.
- **FR-007**: Khi tất cả các cặp thẻ (N cặp) đã được tìm ra, hệ thống PHẢI hiển thị màn hình hoàn thành kèm đánh giá sao theo ngưỡng số lượt lật tỷ lệ thuận với số cặp: 3 sao (≤ N + 2 lượt lật), 2 sao (từ N + 3 đến 2N lượt lật), 1 sao (> 2N lượt lật).
- **FR-008**: Hệ thống PHẢI cho phép người học lựa chọn chủ đề từ vựng trong danh mục các chủ đề có sẵn (Động vật, Trái cây, Gia đình, Trường học, Cơ thể).
- **FR-009**: Hệ thống PHẢI hỗ trợ giáo viên tạo cấu hình tùy chỉnh cho trò chơi (chọn chủ đề, số lượng cặp từ 4/6/8, bật/tắt phát âm tự động, bật/tắt đồng hồ thời gian) trong trang Quản trị.
- **FR-010**: Hệ thống PHẢI cung cấp chế độ xem trước (Preview) cho giáo viên để thử nghiệm cấu hình trước khi lưu hoặc gửi cho học sinh.
- **FR-011**: Hệ thống PHẢI tự động ghi nhận kết quả ván chơi vào hồ sơ học sinh nếu người học đang tham gia qua mã lớp học.

### Key Entities

- **MemoryCard**: Đại diện cho một ô thẻ trên bàn cờ. Bao gồm định danh thẻ, mã từ vựng gốc, loại thẻ (thẻ hình ảnh hoặc thẻ chữ tiếng Anh), nội dung hiển thị (biểu tượng minh họa hoặc văn bản chữ tiếng Anh), và trạng thái hiện tại (úp, đang mở, hoặc đã ghép thành công).
- **MemoryGameSession**: Đại diện cho một phiên chơi của người học. Bao gồm chủ đề từ vựng đã chọn, số lượng cặp từ (pairCount), thời điểm bắt đầu, thời điểm hoàn tất, tổng số lượt lật thẻ, số cặp đã hoàn thành và số sao đạt được.
- **MemoryGameConfig**: Đại diện cho cấu hình do giáo viên tạo ra. Bao gồm tên cấu hình, danh sách các chủ đề được phép sử dụng, số lượng cặp thẻ chỉ định (pairCount: 4, 6 hoặc 8), thiết lập bật/tắt phát âm tự động và thiết lập bật/tắt hiển thị đồng hồ thời gian.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% học sinh tiểu học (lớp 1-2) có thể tự hiểu luật chơi và hoàn thành ván lật thẻ đầu tiên mà không cần người lớn hướng dẫn trực tiếp.
- **SC-002**: Độ trễ tương tác khi chạm vào thẻ để bắt đầu hiệu ứng lật thẻ và phát âm diễn ra trong vòng dưới 100 mili-giây.
- **SC-003**: 100% các ô thẻ trên màn hình thiết bị di động đạt kích thước vùng chạm tối thiểu thân thiện với ngón tay trẻ nhỏ.
- **SC-004**: Giáo viên có thể hoàn tất việc tạo và xem trước một cấu hình trò chơi mới trong vòng dưới 1 phút.
- **SC-005**: 100% các phiên chơi của học sinh có mã lớp hợp lệ được đồng bộ kết quả chính xác vào báo cáo tiến độ của giáo viên.

## Assumptions

- Kho từ vựng tiếng Anh theo 5 chủ đề cơ bản (Động vật, Trái cây, Gia đình, Trường học, Bộ phận cơ thể) đã có sẵn trong hệ thống với đầy đủ hình ảnh biểu tượng và từ tiếng Anh.
- Người dùng sử dụng các trình duyệt hiện đại có hỗ trợ tính năng phát âm văn bản tiếng Anh; trong trường hợp thiết bị không có giọng đọc, trò chơi vẫn hoạt động bình thường thông qua nhận biết hình ảnh và chữ viết.
- Trò chơi không áp đặt giới hạn thời gian đếm ngược kết thúc ván đấu nhằm tạo môi trường học tập thoải mái, không gây áp lực cho trẻ nhỏ.
