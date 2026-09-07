# Feature Specification: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Feature Branch**: `027-word-search-game`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "theo phương án 1 bên trên: Game săn tìm từ vựng (Word Search Puzzle) trên lưới ô chữ 8x8 cho trẻ em tiểu học, kéo/quét hoặc chạm nối các chữ cái liền nhau (ngang trái→phải, dọc trên→dưới), danh sách từ có emoji + nghĩa tiếng Việt, phát âm chuẩn khi tìm đúng hoặc bấm nghe lại, nút Gợi ý 💡 (chớp sáng chữ cái đầu), đồng hồ bấm giờ thân thiện không giới hạn thời gian, chọn chủ đề yêu thích (4-6 từ/ván), đánh giá sao/tiến độ học sinh và hỗ trợ cấu hình Admin cho giáo viên kèm chế độ xem trước (Live Preview)."

## Clarifications

### Session 2026-09-07

- Q: Định hướng thể loại gameplay nào cho trò chơi mới? → A: Săn tìm từ trên bảng chữ cái (Word Search Puzzle) trên ma trận ký tự, rèn luyện quan sát mặt chữ và phản xạ từ vựng.
- Q: Quy tắc tìm từ và mức độ thử thách? → A: Thiết kế tối ưu cho trẻ em (Kiddie): Lưới kích thước cố định 8x8, chỉ tìm từ xuôi chiều theo hàng ngang (từ trái sang phải) và hàng dọc (từ trên xuống dưới), không có từ ngược hay đường chéo; không giới hạn thời gian đếm ngược.
- Q: Tính năng hỗ trợ học tập trong màn chơi? → A: Danh sách từ có biểu tượng minh họa (emoji) và nghĩa tiếng Việt; tự động phát âm chuẩn xác khi tìm đúng kèm nút nghe lại; có nút Gợi ý 💡 hỗ trợ chớp sáng chữ cái đầu tiên của từ cần tìm.
- Q: Lựa chọn chủ đề và số lượng từ trong một ván? → A: Cho phép người học chọn chủ đề yêu thích (Động vật, Hoa quả, Đồ dùng học tập, Gia đình...), mỗi ván tìm từ 4 đến 6 từ vựng.
- Q: Quy tắc xếp hạng sao hoàn thành ván chơi? → A: 3 sao khi hoàn thành mà không sử dụng gợi ý (0 lần gợi ý); 2 sao khi sử dụng 1 lần gợi ý; 1 sao khi sử dụng từ 2 lần gợi ý trở lên.
- Q: Khi hai từ vựng giao nhau tại một chữ cái chung trên lưới 8x8 và cả hai từ đều được tìm thấy, ô giao nhau sẽ hiển thị màu sắc nổi bật như thế nào? (FR-006) → A: Hiển thị nền phối hợp (gradient / dải màu) kết hợp màu sắc nhận diện của cả hai từ đã tìm thấy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Săn Tìm Từ Vựng Trên Lưới Ô Chữ (Priority: P1)

As a primary school learner or beginner ESL student, I want to search and highlight English vocabulary words hidden in an 8x8 letter grid by swiping or tapping letters, so that I can practice word recognition, spelling, and vocabulary retention in a fun, pressure-free way.

**Why this priority**: Đây là trải nghiệm cốt lõi của trò chơi (MVP). Người học có thể trực tiếp tương tác, tìm từ trên bảng ô chữ, nghe phát âm và hoàn thành ván chơi độc lập.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở trang trò chơi, chọn một chủ đề từ vựng (ví dụ: Hoa quả), thao tác kéo hoặc bấm chọn các chữ cái liền nhau trên lưới 8x8 để tìm đủ danh sách từ mục tiêu, nghe âm thanh đọc từ và xem màn hình chúc mừng hoàn thành.

**Acceptance Scenarios**:

1. **Given** người học bắt đầu một ván chơi mới, **When** chọn một chủ đề từ vựng và số lượng từ (4 đến 6 từ, mặc định 5 từ), **Then** hệ thống tạo ra lưới chữ cái 8x8 chứa các từ mục tiêu được giấu theo chiều ngang (trái sang phải) hoặc chiều dọc (trên xuống dưới), các ô còn lại được lấp đầy bằng các chữ cái ngẫu nhiên.
2. **Given** danh sách từ mục tiêu hiển thị bên cạnh lưới ô chữ, **When** nhìn vào danh sách, **Then** mỗi mục từ hiển thị rõ ràng biểu tượng minh họa (emoji), từ tiếng Anh, phiên âm nếu có, nghĩa tiếng Việt và biểu tượng loa phát thanh để bấm nghe phát âm.
3. **Given** người học tương tác với lưới chữ cái, **When** kéo ngón tay/chuột qua dãy chữ cái hoặc bấm lần lượt ô chữ cái đầu và ô chữ cái cuối của một từ, **Then** dãy ô đang chọn được đánh dấu nổi bật tức thời theo đường thẳng hợp lệ.
4. **Given** người học hoàn tất chọn một chuỗi chữ cái, **When** chuỗi chữ cái đó khớp chính xác với một từ trong danh sách mục tiêu chưa tìm thấy, **Then** các ô chữ của từ đó được tô màu nổi bật vĩnh viễn trên lưới (mỗi từ một màu sắc khác nhau), từ tương ứng trong danh sách được đánh dấu tích xanh hoàn thành, hệ thống tự động phát âm từ đó và hiển thị hiệu ứng khích lệ.
5. **Given** người học chọn một chuỗi chữ cái không hợp lệ hoặc không khớp với từ nào trong danh sách, **When** thả tay kết thúc thao tác, **Then** vùng chọn tự động biến mất nhẹ nhàng mà không trừ điểm hay phạt người chơi.
6. **Given** người học gặp khó khăn khi tìm kiếm, **When** nhấn vào nút Gợi ý 💡, **Then** chữ cái bắt đầu của một từ chưa được tìm thấy sẽ chớp sáng nổi bật trong 2-3 giây để dẫn hướng cho người học.
7. **Given** người học đã tìm thấy toàn bộ các từ trong danh sách, **When** từ cuối cùng được giải mã, **Then** màn hình chiến thắng xuất hiện hiển thị số từ đã tìm, tổng thời gian chơi, số lần dùng gợi ý, xếp hạng sao đạt được (3 sao nếu 0 gợi ý, 2 sao nếu 1 gợi ý, 1 sao nếu ≥ 2 gợi ý) cùng các nút "Chơi lại ván mới" hoặc "Chọn chủ đề khác".

---

### User Story 2 - Ghi Nhận Thành Tích và Tiến Độ Lớp Học (Priority: P2)

As a student participating in a structured class session, I want my word search game results, stars, and practice time to be recorded to my student profile, so that my teacher and I can track my learning progress.

**Why this priority**: Giúp kết nối trò chơi vào hệ thống theo dõi tiến độ tổng thể của GameHub, đồng bộ thành tích học sinh và báo cáo kết quả cho giáo viên.

**Independent Test**: Có thể kiểm thử độc lập bằng cách tham gia phiên chơi bằng mã lớp học và tên học sinh hợp lệ, hoàn thành một ván tìm từ, sau đó kiểm tra dữ liệu kết quả được lưu trữ chính xác trong báo cáo lớp học.

**Acceptance Scenarios**:

1. **Given** học sinh tham gia với mã lớp học và tên học sinh hợp lệ, **When** hoàn tất ván săn tìm từ vựng, **Then** hệ thống tự động lưu trữ thông tin kết quả (tên trò chơi "Word Search", chủ đề đã chọn, số lượng từ, thời gian chơi, số sao đạt được).
2. **Given** người chơi tự do không đăng nhập mã lớp, **When** kết thúc ván chơi, **Then** màn hình tổng kết vẫn hiển thị trọn vẹn kết quả, chúc mừng và cho phép tiếp tục chơi mà không xảy ra bất kỳ lỗi gián đoạn nào.

---

### User Story 3 - Giáo Viên Tùy Biến Cấu Hình Trò Chơi (Priority: P3)

As a teacher, I want to create customized configurations for the Word Search game and preview them in real time, so that I can tailor the word search challenge to match my current classroom lesson.

**Why this priority**: Cung cấp công cụ sư phạm mạnh mẽ cho giáo viên, cho phép chủ động lựa chọn chủ đề, giới hạn số từ và tùy chỉnh các trợ giúp phù hợp với trình độ học sinh trong lớp.

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập tài khoản giáo viên, truy cập mục tạo cấu hình trò chơi "Săn tìm từ vựng", chọn các thông số (chủ đề, số từ 4/5/6, bật/tắt gợi ý, bật/tắt phát âm), bấm "Xem trước" để trải nghiệm thử bàn cờ mẫu, sau đó lưu cấu hình.

**Acceptance Scenarios**:

1. **Given** giáo viên trong màn hình quản trị tạo cấu hình trò chơi, **When** chọn trò chơi "Săn tìm từ vựng" (Word Search), **Then** hệ thống hiển thị biểu mẫu cấu hình gồm: Tên cấu hình, Lựa chọn chủ đề từ vựng được phép, Số lượng từ mỗi ván (4, 5 hoặc 6 từ), Bật/Tắt tính năng gợi ý 💡, Bật/Tắt phát âm tự động và Bật/Tắt đồng hồ thời gian.
2. **Given** giáo viên thay đổi các tùy chọn cấu hình, **When** nhấn nút "Xem trước", **Then** hệ thống mở màn chơi mẫu phản ánh chính xác các thông số vừa thiết lập kèm thanh thông báo chế độ xem thử.
3. **Given** giáo viên lưu cấu hình hợp lệ, **When** lưu thành công, **Then** cấu hình mới xuất hiện trong danh sách cấu hình và sẵn sàng giao bài cho học sinh.

---

### Edge Cases

- **Tạo lưới không bị trùng lặp hoặc xung đột từ**: Thuật toán xếp từ lên lưới 8x8 phải đảm bảo các từ được xếp không bị đè chữ trái quy tắc (nếu hai từ giao nhau tại một ô, chữ cái tại ô đó phải hoàn toàn giống nhau) và 100% số lượng từ mục tiêu yêu cầu được đặt thành công lên bảng chữ cái trước khi hiển thị cho người chơi.
- **Các từ giao nhau tại chữ cái chung**: Khi hai từ cắt nhau tại một ô chữ cái và cả hai đều được tìm thấy, ô chung sẽ phản ánh sự kết hợp màu sắc của cả hai từ (gradient / dải màu), đảm bảo người học nhìn rõ liên kết của chữ cái với cả hai từ vựng mà không làm mất màu của từ tìm trước.
- **Kéo vuốt ra ngoài biên lưới**: Khi người học đang kéo ngón tay hoặc chuột nhưng vô tình trượt ra ngoài phạm vi lưới 8x8, hệ thống vẫn duy trì chuỗi chọn và chỉ xác nhận kết quả khi người học thả tay (pointer up).
- **Chọn ngược chiều hoặc theo đường chéo**: Trò chơi cho trẻ nhỏ chỉ công nhận hai hướng: ngang (từ trái sang phải) và dọc (từ trên xuống dưới). Nếu người học quét theo đường chéo hoặc quét ngược từ phải sang trái/từ dưới lên trên, hệ thống không coi là hợp lệ và bỏ qua khi thả tay mà không gây lỗi.
- **Dùng nút Gợi ý khi chỉ còn 1 từ**: Khi chỉ còn 1 từ chưa tìm, nút Gợi ý sẽ chớp sáng chữ cái đầu của từ duy nhất đó. Khi tất cả các từ đã được tìm thấy, nút Gợi ý sẽ ở trạng thái vô hiệu hóa.
- **Màn hình cảm ứng nhỏ (Smartphone)**: Lưới 8x8 phải tự động căn chỉnh tỷ lệ cân đối trên màn hình điện thoại di động, đảm bảo diện tích bấm của mỗi ô chữ cái tối thiểu 36x36px đến 44x44px để trẻ nhỏ chạm bấm chính xác mà không bị bấm nhầm ô lân cận.
- **Thiết bị không có bộ đọc phát âm giọng nói**: Nếu trình duyệt không hỗ trợ tổng hợp giọng nói, hệ thống thông báo nhẹ nhàng, đồng thời trò chơi vẫn tiếp tục hoạt động hoàn hảo thông qua quan sát thị giác và phản hồi hình ảnh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp trò chơi săn tìm từ vựng (Word Search) trên lưới chữ cái kích thước chuẩn 8x8.
- **FR-002**: Hệ thống PHẢI hỗ trợ sắp xếp các từ mục tiêu trên lưới theo 2 hướng hợp lệ: hàng ngang từ trái sang phải, và hàng dọc từ trên xuống dưới.
- **FR-003**: Hệ thống PHẢI cho phép lựa chọn hoặc cấu hình số lượng từ mục tiêu cho mỗi ván chơi từ 4 đến 6 từ (mặc định 5 từ).
- **FR-004**: Hệ thống PHẢI lấp đầy tất cả các ô trống còn lại trên lưới bằng các chữ cái ngẫu nhiên in hoa (A-Z) sau khi đã bố trí thành công tất cả các từ mục tiêu.
- **FR-005**: Hệ thống PHẢI hỗ trợ cả hai phương thức tương tác chọn từ: kéo vuốt liên tục qua các ô chữ cái, và chạm nhấp lần lượt ô đầu tiên rồi ô kết thúc.
- **FR-006**: Khi một từ mục tiêu được tìm thấy chính xác, hệ thống PHẢI tô màu vĩnh viễn cho các ô chữ của từ đó trên lưới (nếu hai từ giao nhau tại cùng một ô chữ cái, ô đó hiển thị dải màu gradient kết hợp cả hai màu sắc), đánh dấu hoàn thành từ đó trong danh sách mục tiêu, phát âm tiếng Anh của từ và phát âm thanh khích lệ.
- **FR-007**: Hệ thống PHẢI hiển thị danh sách từ mục tiêu kèm biểu tượng minh họa (emoji), từ tiếng Anh, nghĩa tiếng Việt và nút bấm để người học có thể nghe lại phát âm bất kỳ lúc nào.
- **FR-008**: Hệ thống PHẢI cung cấp nút Gợi ý 💡 cho phép làm chớp sáng chữ cái đầu tiên của một từ mục tiêu chưa được tìm thấy.
- **FR-009**: Hệ thống PHẢI hiển thị đồng hồ bấm giờ tính thời gian chơi ván đấu mà không áp đặt giới hạn đếm ngược kết thúc ván.
- **FR-010**: Khi tất cả các từ mục tiêu đã được tìm thấy, hệ thống PHẢI hiển thị màn hình hoàn thành kèm thống kê thời gian, số lần dùng gợi ý, xếp hạng sao (3 sao cho 0 lần gợi ý, 2 sao cho 1 lần gợi ý, 1 sao cho ≥ 2 lần gợi ý) cùng các tùy chọn chơi lại hoặc đổi chủ đề.
- **FR-011**: Hệ thống PHẢI cho phép người học lựa chọn các chủ đề từ vựng có sẵn trong kho dữ liệu của GameHub (Động vật, Trái cây, Gia đình, Trường học, Bộ phận cơ thể, v.v.).
- **FR-012**: Hệ thống PHẢI hỗ trợ giáo viên tạo cấu hình tùy chỉnh cho trò chơi (chọn chủ đề, số lượng từ 4-6, bật/tắt gợi ý, bật/tắt phát âm tự động, bật/tắt hiển thị đồng hồ) trong trang Quản trị và cung cấp chế độ xem trước (Live Preview).
- **FR-013**: Hệ thống PHẢI tự động ghi nhận kết quả hoàn thành vào hồ sơ học sinh nếu người học đang tham gia qua mã lớp học.

### Key Entities

- **WordSearchCell**: Đại diện cho một ô ký tự trên ma trận 8x8. Bao gồm tọa độ hàng và cột (row, col), ký tự chữ cái hiển thị (in hoa), trạng thái đang được quét chọn, và danh sách màu sắc của các từ vựng đã giải mã mà ô này thuộc về (hỗ trợ hiển thị gradient kết hợp khi là điểm giao của nhiều từ).
- **WordSearchTargetWord**: Đại diện cho một từ mục tiêu cần tìm trong ván chơi. Bao gồm định danh từ vựng, từ tiếng Anh, nghĩa tiếng Việt, biểu tượng minh họa (emoji), phiên âm, danh sách các tọa độ ô trên lưới mà từ chiếm giữ, trạng thái đã tìm thấy hay chưa, và màu sắc nhận diện riêng biệt.
- **WordSearchSession**: Đại diện cho phiên chơi của người học. Bao gồm chủ đề đã chọn, số lượng từ, thời gian bắt đầu, thời gian hoàn thành, số lần sử dụng gợi ý, số từ đã tìm thấy và số sao đạt được.
- **WordSearchConfig**: Đại diện cho cấu hình do giáo viên tạo ra. Bao gồm tên cấu hình, danh sách chủ đề được phép, số từ mỗi ván (4-6), tùy chọn bật/tắt gợi ý, tùy chọn bật/tắt phát âm tự động và tùy chọn bật/tắt hiển thị đồng hồ thời gian.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% học sinh tiểu học (lớp 1-2) có thể tự hiểu luật chơi và hoàn tất ván săn tìm từ vựng đầu tiên trong vòng dưới 4 phút mà không cần người lớn hướng dẫn trực tiếp.
- **SC-002**: Thuật toán sinh lưới ô chữ đạt tỷ lệ thành công 100% khi xếp 4 đến 6 từ lên lưới 8x8 với thời gian phát sinh lưới dưới 50 mili-giây.
- **SC-003**: Thao tác kéo vuốt và phản hồi highlight ô chữ diễn ra mượt mà với độ trễ phản hồi thị giác dưới 50 mili-giây trên mọi thiết bị máy tính, máy tính bảng và điện thoại di động.
- **SC-004**: 100% các ô chữ trên màn hình thiết bị di động đạt kích thước vùng chạm tối thiểu thân thiện với ngón tay trẻ nhỏ (≥ 36x36px).
- **SC-005**: Giáo viên có thể hoàn tất tạo mới, xem trước trực tiếp và lưu cấu hình trò chơi trong vòng dưới 1 phút.
- **SC-006**: 100% phiên chơi của học sinh có mã lớp hợp lệ được đồng bộ kết quả chính xác vào hệ thống theo dõi tiến độ của giáo viên.

## Assumptions

- Kho từ vựng tiếng Anh theo các chủ đề cơ bản (Động vật, Trái cây, Gia đình, Trường học, Bộ phận cơ thể...) đã có sẵn trong cơ sở dữ liệu và tệp dữ liệu của GameHub với đầy đủ từ tiếng Anh, phiên âm, nghĩa tiếng Việt và biểu tượng minh họa.
- Các từ mục tiêu được lựa chọn cho lưới 8x8 có độ dài phù hợp từ 3 đến 7 chữ cái để đảm bảo vừa vặn trên lưới 8 hàng 8 cột.
- Người dùng sử dụng các trình duyệt hiện đại có hỗ trợ tính năng phát âm văn bản tiếng Anh; nếu thiết bị không hỗ trợ, trò chơi vẫn hoạt động bình thường qua tương tác thị giác.
- Trò chơi không áp đặt thời gian đếm ngược kết thúc ván đấu nhằm tạo môi trường học tập nhẹ nhàng, khuyến khích sự tập trung và yêu thích học tập cho trẻ nhỏ.
