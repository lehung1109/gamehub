# Feature Specification: English Learning Games for Kids

**Feature Branch**: `001-english-learning-games`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "Website cho học sinh tiểu học lớp 1-2 (6-7 tuổi) với các game học tiếng Anh. Monolith Games Hub approach — Next.js app, mỗi game là một route, dữ liệu JSON tĩnh, Web Speech API cho phát âm, song ngữ Việt-Anh, flat design kiểu Duolingo, responsive, không cần đăng nhập."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khám phá và chọn game từ trang chủ (Priority: P1)

Một học sinh lớp 1 mở website trên tablet của bố mẹ. Em nhìn thấy trang chủ với các game được trình bày dưới dạng thẻ (card) lớn, mỗi thẻ có hình minh họa và tên game bằng tiếng Việt. Em chạm vào thẻ "Học từ vựng" và được chuyển ngay vào game đó mà không cần đăng nhập hay thao tác phức tạp nào.

**Why this priority**: Đây là điểm tiếp xúc đầu tiên — nếu trẻ không tìm được game dễ dàng, các tính năng khác không có ý nghĩa. Trang chủ là MVP tối thiểu.

**Independent Test**: Có thể kiểm thử bằng cách mở trang chủ trên nhiều thiết bị (mobile, tablet, desktop) và xác nhận tất cả game card hiển thị đúng, có thể nhấn vào, và điều hướng đến game tương ứng.

**Acceptance Scenarios**:

1. **Given** học sinh mở trang chủ, **When** trang tải xong, **Then** hiển thị tất cả game dưới dạng thẻ lớn với hình minh họa và tên tiếng Việt
2. **Given** học sinh nhìn thấy danh sách game, **When** em chạm/click vào thẻ game bất kỳ, **Then** em được chuyển đến trang game tương ứng trong vòng 1 giây
3. **Given** học sinh dùng điện thoại hoặc tablet, **When** em xoay màn hình hoặc thay đổi kích thước, **Then** layout tự điều chỉnh phù hợp

---

### User Story 2 - Học từ vựng qua Flashcard (Priority: P1)

Học sinh vào game Flashcard. Em thấy một thẻ lớn hiển thị hình ảnh (ví dụ: con mèo). Em nhấn vào thẻ, thẻ lật và hiện từ tiếng Anh "Cat" cùng phiên âm. Em nhấn nút loa để nghe phát âm. Em vuốt hoặc nhấn mũi tên để sang từ tiếp theo. Các từ được nhóm theo chủ đề (Động vật, Trái cây, Gia đình...).

**Why this priority**: Từ vựng là nền tảng cốt lõi của việc học ngôn ngữ ở lứa tuổi này. Game Flashcard là format đơn giản nhất, dễ hiểu nhất cho trẻ 6-7 tuổi.

**Independent Test**: Mở game Flashcard, chọn chủ đề, lật thẻ, nghe phát âm, chuyển từ — tất cả hoạt động độc lập không phụ thuộc game khác.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Flashcard, **When** trang tải, **Then** hiển thị danh sách chủ đề để chọn (ví dụ: Animals, Fruits, Family)
2. **Given** học sinh chọn chủ đề "Animals", **When** game bắt đầu, **Then** hiển thị thẻ đầu tiên với hình ảnh mặt trước
3. **Given** thẻ đang hiện hình ảnh, **When** học sinh nhấn vào thẻ, **Then** thẻ lật với animation và hiện từ tiếng Anh + phiên âm
4. **Given** thẻ đã lật, **When** học sinh nhấn nút loa, **Then** phát âm từ tiếng Anh tương ứng
5. **Given** học sinh đang xem thẻ, **When** em vuốt sang phải hoặc nhấn mũi tên, **Then** chuyển sang từ tiếp theo

---

### User Story 3 - Nhận diện chữ cái & Phonics (Priority: P1)

Học sinh vào game Chữ cái. Em thấy bảng chữ cái A-Z hiển thị dưới dạng lưới các nút lớn. Em nhấn vào chữ "B", nghe phát âm chữ B, thấy hình ảnh minh họa (Ball) và từ bắt đầu bằng B. Em có thể chuyển sang chế độ quiz: hệ thống phát âm một chữ cái và em phải chọn đúng chữ đó trên bảng.

**Why this priority**: Chữ cái là kiến thức nền tảng nhất cho lớp 1, thiếu nó trẻ không thể tiến tới đánh vần hay đọc.

**Independent Test**: Mở game Chữ cái, nhấn từng chữ nghe phát âm, chuyển sang quiz mode và trả lời — hoạt động hoàn toàn độc lập.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Chữ cái, **When** trang tải, **Then** hiển thị bảng chữ cái A-Z dưới dạng lưới nút lớn, dễ nhấn
2. **Given** bảng chữ cái hiển thị, **When** học sinh nhấn vào một chữ cái, **Then** phát âm chữ cái đó và hiển thị hình ảnh minh họa + từ ví dụ
3. **Given** học sinh ở chế độ quiz, **When** hệ thống phát âm một chữ cái, **Then** học sinh phải chọn đúng chữ trên bảng
4. **Given** học sinh chọn đúng trong quiz, **When** đáp án được xác nhận, **Then** hiển thị phản hồi tích cực (ví dụ: dấu tick xanh, hiệu ứng vui)
5. **Given** học sinh chọn sai trong quiz, **When** đáp án được xác nhận, **Then** hiển thị đáp án đúng kèm khuyến khích thử lại

---

### User Story 4 - Nghe và chọn đáp án đúng (Priority: P2)

Học sinh vào game Nghe hiểu. Hệ thống phát âm một từ tiếng Anh (ví dụ: "Apple"). Màn hình hiển thị 3-4 hình ảnh. Học sinh phải chọn hình đúng (quả táo). Nếu đúng, hiện animation vui và chuyển câu tiếp. Nếu sai, highlight đáp án đúng và cho thử lại.

**Why this priority**: Kỹ năng nghe là bước tiến tự nhiên sau khi đã quen với từ vựng qua flashcard. Có thể build sau khi đã có hệ thống data từ vựng từ game Flashcard.

**Independent Test**: Mở game, nghe từ, chọn hình — kiểm thử với nhiều chủ đề từ vựng khác nhau.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Nghe hiểu, **When** game bắt đầu, **Then** hệ thống phát âm từ tiếng Anh đầu tiên và hiển thị 3-4 hình ảnh lựa chọn
2. **Given** hệ thống đã phát âm từ, **When** học sinh nhấn nút phát lại, **Then** phát âm lại từ đó
3. **Given** học sinh chọn đúng hình, **When** đáp án được xác nhận, **Then** hiện phản hồi tích cực và tự động chuyển câu tiếp sau 1.5 giây
4. **Given** học sinh chọn sai hình, **When** đáp án được xác nhận, **Then** highlight đáp án đúng, hiển thị từ tiếng Anh dưới hình đúng, và cho phép nhấn "Tiếp tục"

---

### User Story 5 - Ghép từ / Đánh vần (Priority: P2)

Học sinh vào game Đánh vần. Màn hình hiển thị hình ảnh (ví dụ: con chó) và các chữ cái rời (D, O, G cùng vài chữ nhiễu). Học sinh kéo thả hoặc nhấn các chữ cái theo thứ tự đúng để ghép thành từ "DOG". Khi ghép đúng, hệ thống phát âm từ hoàn chỉnh.

**Why this priority**: Đánh vần kết hợp cả nhận diện chữ cái và từ vựng — phù hợp sau khi trẻ đã làm quen hai kỹ năng nền tảng đó.

**Independent Test**: Mở game, xem hình, kéo thả chữ cái ghép từ — hoạt động độc lập, dùng chung dữ liệu từ vựng.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Đánh vần, **When** game bắt đầu, **Then** hiển thị hình ảnh gợi ý và các chữ cái xáo trộn (bao gồm chữ đúng + 2-3 chữ nhiễu)
2. **Given** các chữ cái hiển thị, **When** học sinh kéo thả chữ cái vào ô trống đúng thứ tự, **Then** chữ cái snap vào vị trí và hiện rõ
3. **Given** học sinh kéo chữ sai vào ô, **When** thả ra, **Then** chữ cái quay lại vị trí ban đầu với animation nhẹ
4. **Given** học sinh ghép đúng hết tất cả chữ cái, **When** từ hoàn chỉnh, **Then** phát âm từ đó và hiện phản hồi tích cực
5. **Given** học sinh dùng thiết bị cảm ứng, **When** em kéo thả chữ cái, **Then** drag & drop hoạt động mượt với touch events

---

### User Story 6 - Học số đếm & màu sắc bằng tiếng Anh (Priority: P3)

Học sinh vào game Số & Màu. Em thấy hai tab: "Numbers" và "Colors". Trong tab Numbers, hiển thị số 1-20 với hình minh họa (ví dụ: 3 quả táo) và từ tiếng Anh "Three". Trong tab Colors, hiển thị các ô màu lớn với tên tiếng Anh. Cả hai có chế độ quiz tương tự game Chữ cái.

**Why this priority**: Số và màu sắc là kiến thức bổ trợ, không phải kỹ năng ngôn ngữ cốt lõi. Tuy nhiên rất phù hợp với chương trình lớp 1-2.

**Independent Test**: Mở game, duyệt số/màu, nghe phát âm, làm quiz — hoạt động độc lập hoàn toàn.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Số & Màu, **When** trang tải, **Then** hiển thị hai tab "Số đếm" và "Màu sắc"
2. **Given** tab Số đếm được chọn, **When** học sinh nhấn vào số bất kỳ (1-20), **Then** hiển thị hình minh họa số lượng tương ứng, từ tiếng Anh, và phát âm
3. **Given** tab Màu sắc được chọn, **When** học sinh nhấn vào ô màu, **Then** hiển thị tên màu tiếng Anh và phát âm
4. **Given** học sinh chuyển sang quiz mode, **When** hệ thống đưa ra câu hỏi (ví dụ: phát âm "Five"), **Then** học sinh chọn đáp án đúng từ các lựa chọn

---

### User Story 7 - Luyện câu đơn giản (Priority: P3)

Học sinh vào game Câu đơn giản. Màn hình hiển thị một tình huống bằng hình ảnh (ví dụ: em bé đang ăn). Bên dưới là các từ rời ("I", "am", "eating") xáo trộn. Học sinh sắp xếp các từ thành câu đúng "I am eating". Khi đúng, hệ thống phát âm cả câu.

**Why this priority**: Câu đơn giản là kỹ năng nâng cao nhất trong phạm vi project, phù hợp cho học sinh đã quen với từ vựng cơ bản.

**Independent Test**: Mở game, xem hình tình huống, sắp xếp từ thành câu — hoạt động độc lập.

**Acceptance Scenarios**:

1. **Given** học sinh vào game Câu đơn giản, **When** game bắt đầu, **Then** hiển thị hình ảnh tình huống và các từ rời bên dưới
2. **Given** các từ hiển thị xáo trộn, **When** học sinh nhấn/kéo từ vào vị trí, **Then** từ snap vào ô câu theo thứ tự em chọn
3. **Given** học sinh sắp xếp đúng thứ tự, **When** câu hoàn chỉnh, **Then** phát âm cả câu, hiện bản dịch tiếng Việt, và phản hồi tích cực
4. **Given** học sinh sắp xếp sai, **When** em nhấn "Kiểm tra", **Then** highlight từ sai vị trí và cho phép sắp xếp lại

---

### Edge Cases

- Trẻ nhấn liên tục nhanh vào nút phát âm: hệ thống chỉ phát 1 lần tại mỗi thời điểm, không chồng âm thanh
- Trình duyệt không hỗ trợ Web Speech API: hiển thị thông báo yêu cầu dùng trình duyệt hỗ trợ (Chrome, Edge, Safari)
- Mất kết nối mạng sau khi trang đã tải: game vẫn hoạt động vì dùng dữ liệu tĩnh (trừ phát âm có thể bị ảnh hưởng nếu dùng online TTS)
- Màn hình quá nhỏ (dưới 320px): hiển thị thông báo khuyến khích xoay ngang hoặc dùng thiết bị lớn hơn
- Trẻ kéo thả trên thiết bị không hỗ trợ touch tốt: cung cấp phương thức thay thế (nhấn chọn thay vì kéo thả)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hiển thị trang chủ với tất cả game dưới dạng thẻ card có hình minh họa và tên tiếng Việt
- **FR-002**: Hệ thống PHẢI cho phép truy cập bất kỳ game nào từ trang chủ mà không cần đăng nhập hoặc tạo tài khoản
- **FR-003**: Hệ thống PHẢI có game Flashcard với khả năng lật thẻ, hiển thị hình ảnh, từ tiếng Anh, phiên âm, và phát âm
- **FR-004**: Hệ thống PHẢI tổ chức từ vựng theo chủ đề (tối thiểu 5 chủ đề: Animals, Fruits, Family, School, Body Parts)
- **FR-005**: Hệ thống PHẢI có game Chữ cái hiển thị bảng A-Z với hình minh họa, từ ví dụ, và phát âm cho mỗi chữ
- **FR-006**: Hệ thống PHẢI có chế độ quiz trong game Chữ cái để kiểm tra nhận diện chữ cái qua âm thanh
- **FR-007**: Hệ thống PHẢI có game Nghe hiểu phát âm từ và hiển thị 3-4 lựa chọn hình ảnh
- **FR-008**: Hệ thống PHẢI cung cấp phản hồi rõ ràng cho đáp án đúng (tích cực, khuyến khích) và sai (hiển thị đáp án đúng, khuyến khích thử lại)
- **FR-009**: Hệ thống PHẢI có game Đánh vần cho phép kéo thả hoặc nhấn chọn chữ cái để ghép từ
- **FR-010**: Hệ thống PHẢI có game Số & Màu với nội dung số 1-20 và tối thiểu 8 màu cơ bản
- **FR-011**: Hệ thống PHẢI có game Câu đơn giản cho phép sắp xếp từ thành câu hoàn chỉnh
- **FR-012**: Hệ thống PHẢI phát âm tiếng Anh sử dụng Web Speech API hoặc cơ chế tương đương
- **FR-013**: Hệ thống PHẢI hiển thị giao diện song ngữ Việt-Anh (hướng dẫn, menu bằng tiếng Việt; nội dung học bằng tiếng Anh)
- **FR-014**: Hệ thống PHẢI responsive — hoạt động tốt trên mobile (từ 360px), tablet, và desktop
- **FR-015**: Hệ thống PHẢI hỗ trợ cả click (mouse) và touch (cảm ứng) cho mọi tương tác kéo thả
- **FR-016**: Hệ thống PHẢI ngăn chặn việc phát âm chồng lấp khi người dùng nhấn nút loa nhiều lần liên tiếp
- **FR-017**: Mỗi game PHẢI có nút quay về trang chủ dễ nhìn thấy và dễ nhấn
- **FR-018**: Hệ thống PHẢI hiển thị thông báo phù hợp khi trình duyệt không hỗ trợ Web Speech API

### Key Entities

- **Game**: Đại diện một loại trò chơi học tiếng Anh (tên, mô tả, hình đại diện, route URL). Có 6 game: Flashcard, Chữ cái & Phonics, Nghe hiểu, Đánh vần, Số & Màu, Câu đơn giản.
- **Topic (Chủ đề)**: Nhóm từ vựng theo chủ đề (Animals, Fruits, Family, School, Body Parts). Mỗi chủ đề chứa nhiều Word.
- **Word (Từ vựng)**: Một từ tiếng Anh cần học — bao gồm: từ tiếng Anh, phiên âm, nghĩa tiếng Việt, hình ảnh minh họa. Được dùng chung bởi nhiều game.
- **Letter (Chữ cái)**: Một chữ cái A-Z — bao gồm: chữ cái, phát âm, từ ví dụ, hình minh họa.
- **Number (Số)**: Số 1-20 — bao gồm: chữ số, từ tiếng Anh, hình minh họa số lượng.
- **Color (Màu)**: Một màu sắc — bao gồm: mã màu, tên tiếng Anh, tên tiếng Việt.
- **Sentence (Câu)**: Một câu đơn giản — bao gồm: các từ thành phần, hình ảnh tình huống, bản dịch tiếng Việt.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Học sinh có thể tìm và bắt đầu bất kỳ game nào từ trang chủ trong vòng 10 giây kể từ khi trang tải xong
- **SC-002**: Mỗi game tải và sẵn sàng tương tác trong vòng 3 giây trên kết nối 3G trung bình
- **SC-003**: Học sinh 6-7 tuổi có thể tự sử dụng bất kỳ game nào mà không cần hướng dẫn từ người lớn (đạt tỉ lệ hoàn thành 80% trong lần thử đầu tiên)
- **SC-004**: Tất cả game hoạt động đúng trên 3 loại thiết bị chính: điện thoại (360px+), tablet (768px+), desktop (1024px+)
- **SC-005**: Phát âm tiếng Anh hoạt động trên ít nhất 3 trình duyệt phổ biến (Chrome, Safari, Edge)
- **SC-006**: Mỗi chủ đề từ vựng có tối thiểu 10 từ, tổng cộng ít nhất 50 từ vựng trên toàn hệ thống
- **SC-007**: Trẻ có thể hoàn thành một lượt chơi (10 câu hỏi/thẻ) trong bất kỳ game nào trong vòng 5 phút

## Assumptions

- Học sinh sử dụng thiết bị có kết nối internet để tải trang ban đầu
- Sau khi tải, phần lớn game có thể hoạt động offline vì dùng dữ liệu JSON tĩnh (trừ Web Speech API cần kết nối trên một số trình duyệt)
- Hình ảnh minh họa sẽ sử dụng hình vẽ/icon phong cách flat design, không dùng ảnh chụp thực tế
- Phụ huynh hoặc giáo viên sẽ giúp mở website lần đầu, sau đó trẻ tự sử dụng
- Mỗi chủ đề từ vựng ban đầu có 10-15 từ, có thể mở rộng sau bằng cách thêm JSON data
- Không cần lưu tiến độ hay điểm số giữa các phiên sử dụng — mỗi lần chơi là độc lập
- Trình duyệt mục tiêu: Chrome 90+, Safari 14+, Edge 90+, Firefox 90+
- Thiết kế UI ưu tiên mobile-first vì đa số trẻ dùng tablet/điện thoại
