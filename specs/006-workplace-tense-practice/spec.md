# Feature Specification: Workplace English Tense Practice - Present Simple

**Feature Branch**: `006-workplace-tense-practice`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Mở rộng độ tuổi đến người đi làm, cho phép ôn luyện các thì, thiết kế cho thì hiện tại đơn theo Phương án 1 (Modular Stage-Based Hub), đảm bảo data không phụ thuộc vào history của convention."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khám phá Hub 12 Thì và Vào Học Thì Hiện Tại Đơn (Priority: P1)

Một người đi làm muốn cải thiện kỹ năng viết email và giao tiếp tiếng Anh chuẩn ngữ pháp. Từ trang chủ của GameHub, họ nhìn thấy khu vực nổi bật "Luyện Thì Tiếng Anh Cho Người Đi Làm & Sinh Viên". Khi nhấn vào, họ được chuyển đến Hub 12 Thì (`/tenses`), nơi hiển thị bản đồ trực quan 12 thì tiếng Anh được phân nhóm theo Hiện tại, Quá khứ, Tương lai. Mô-đun "Thì Hiện Tại Đơn (Present Simple)" đã sẵn sàng để truy cập với các huy hiệu tóm tắt nội dung và tiến độ. Người dùng nhấn vào thẻ "Thì Hiện Tại Đơn" để mở ngay không gian ôn luyện chuyên biệt.

**Why this priority**: Đây là cửa ngõ điều hướng chính cho đối tượng người đi làm, tách biệt khỏi các game thiếu nhi và dẫn dắt người học vào hệ thống ôn luyện thì một cách chuyên nghiệp.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở trang chủ, nhấp vào liên kết/banner dẫn đến Hub 12 Thì, xác nhận các thì hiển thị đầy đủ, và nhấp vào Thì Hiện Tại Đơn để mở trang chi tiết bài học.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập trang chủ GameHub, **When** trang tải xong, **Then** hiển thị thẻ/banner chuyên biệt dẫn tới phân khu "Luyện Thì Tiếng Anh".
2. **Given** người dùng nhấn vào thẻ "Luyện Thì Tiếng Anh", **When** hệ thống chuyển hướng, **Then** hiển thị trang Hub 12 Thì (`/tenses`) với 3 nhóm chính (Hiện tại, Quá khứ, Tương lai).
3. **Given** trang Hub 12 Thì hiển thị, **When** người dùng quan sát, **Then** thẻ "Thì Hiện Tại Đơn" ở trạng thái hoạt động (Active), kèm mô tả ngắn và số lượng thử thách; các thì còn lại hiển thị trạng thái "Sắp ra mắt".
4. **Given** người dùng nhấn vào thẻ "Thì Hiện Tại Đơn", **When** hệ thống điều hướng, **Then** chuyển vào trang học Thì Hiện Tại Đơn (`/tenses/present-simple`) với đầy đủ các chặng học và thanh tiến độ.

---

### User Story 2 - Tra Cứu Quy Tắc Ngữ Pháp Nhanh & Tình Huống Công Sở (Priority: P1)

Người học bắt đầu bài học Thì Hiện Tại Đơn và muốn xem lại nhanh công thức trước khi làm bài tập. Họ mở tab "Quy Tắc Cốt Lõi (Quick Rules)". Màn hình hiển thị bảng tóm tắt mạch lạc: cấu trúc với Động từ To Be, cấu trúc với Động từ Thường (Khẳng định, Phủ định, Nghi vấn), quy tắc thêm đuôi `-s/-es`, bảng trạng từ chỉ tần suất (always, usually, sometimes, never...) và các trường hợp sử dụng tiêu biểu trong môi trường công sở (mô tả công việc, lịch họp, quy trình làm việc, sự thật hiển nhiên). Mỗi quy tắc đều có ví dụ tiếng Anh thực tế đính kèm bản dịch tiếng Việt và nút phát âm.

**Why this priority**: Người đi làm cần nắm bản chất và công thức nhanh gọn mà không phải đọc tài liệu dài dòng, làm cơ sở lý thuyết vững chắc trước khi bước vào các bài tập thực hành.

**Independent Test**: Mở tab "Quy Tắc Cốt Lõi", kiểm tra các thẻ kiến thức (To Be, Động từ thường, Thêm s/es, Trạng từ tần suất), nghe phát âm ví dụ và xem bản dịch.

**Acceptance Scenarios**:

1. **Given** người học ở trang Thì Hiện Tại Đơn, **When** chọn tab "Quy Tắc Cốt Lõi", **Then** hệ thống hiển thị các thẻ lý thuyết cô đọng được phân mục rõ ràng.
2. **Given** người học xem quy tắc thêm `-s/-es`, **When** đọc chi tiết, **Then** thấy rõ các quy tắc kết thúc bằng `-ch, -sh, -x, -s, -z, -o`, nguyên âm + y, phụ âm + y kèm ví dụ công sở thực tế.
3. **Given** người học xem ví dụ câu tiếng Anh, **When** nhấn biểu tượng loa, **Then** hệ thống phát âm câu ví dụ bằng giọng đọc tiếng Anh chuẩn xác, không bị chồng âm.

---

### User Story 3 - Thử Thách 1: Chia Động Từ & Điền Email Công Sở (Priority: P1)

Người học vào Chặng 1 của bài học để rèn luyện kỹ năng chia động từ chuẩn xác theo chủ ngữ và ngữ cảnh. Màn hình đưa ra các tình huống công sở thực tế (ví dụ: đoạn email thông báo lịch họp, mô tả trách nhiệm công việc của đồng nghiệp, email cập nhật dự án). Tại các chỗ trống, người học có thể chọn đáp án trắc nghiệm hoặc gõ trực tiếp dạng đúng của động từ trong ngoặc (ví dụ: `approve` $\rightarrow$ `approves`, `not have` $\rightarrow$ `does not have`). Sau khi trả lời, hệ thống kiểm tra ngay lập tức, đổi màu phản hồi và đưa ra lời giải thích chi tiết vì sao chia như vậy (ví dụ: "Chủ ngữ 'The marketing manager' là ngôi thứ 3 số ít $\rightarrow$ thêm 's'").

**Why this priority**: Lỗi không chia động từ ngôi thứ 3 số ít hoặc nhầm lẫn trợ động từ là lỗi phổ biến nhất của người Việt đi làm khi viết email.

**Independent Test**: Vào Chặng 1, làm các câu hỏi chia động từ, nộp đáp án đúng/sai và xác nhận hệ thống hiển thị giải thích ngữ pháp chính xác.

**Acceptance Scenarios**:

1. **Given** người học bắt đầu Chặng 1, **When** câu hỏi hiển thị, **Then** xuất hiện ngữ cảnh công việc cụ thể (email, tin nhắn công việc) chứa chỗ trống và động từ nguyên thể cần chia.
2. **Given** người học chọn hoặc nhập đáp án đúng, **When** nhấn "Kiểm tra", **Then** hệ thống báo đúng với màu sắc tích cực, hiển thị lời giải thích ngữ pháp và cộng điểm.
3. **Given** người học trả lời sai, **When** nhấn "Kiểm tra", **Then** hệ thống chỉ ra lỗi sai, hiển thị đáp án đúng cùng giải thích chi tiết quy tắc ngữ pháp tương ứng và cho phép chuyển câu tiếp theo hoặc làm lại.
4. **Given** người học hoàn thành tất cả câu hỏi của Chặng 1, **When** kết thúc chặng, **Then** hiển thị màn hình tổng kết điểm số và mở khóa/đề xuất chuyển sang Chặng 2.

---

### User Story 4 - Thử Thách 2: Săn Lỗi Sai Văn Phòng (Workplace Error Hunter) (Priority: P2)

Người học muốn nâng cao khả năng rà soát và sửa lỗi (proofreading) cho văn bản/email của mình. Họ bước vào Chặng 2 "Săn Lỗi Sai". Màn hình hiển thị một câu tiếng Anh văn phòng có chứa 1 lỗi ngữ pháp về thì Hiện tại đơn (ví dụ: *"She don't agree with the proposal."* hoặc *"The CEO always attend the Monday briefing."*). Người học chạm/click vào từ bị sai trong câu, sau đó chọn cách sửa đúng từ danh sách gợi ý. Khi sửa đúng, câu hoàn chỉnh được highlight sáng lên kèm giải thích vì sao câu ban đầu bị sai.

**Why this priority**: Rèn luyện tư duy phản biện và khả năng tự sửa lỗi (self-correction) trực tiếp trên các lỗi thực tế người đi làm thường mắc phải.

**Independent Test**: Vào Chặng 2, bấm vào từ bị sai trong câu, chọn phương án sửa đúng và kiểm tra hệ thống ghi nhận kết quả kèm phân tích lỗi.

**Acceptance Scenarios**:

1. **Given** người học vào Chặng 2, **When** câu hỏi xuất hiện, **Then** các từ trong câu có thể tương tác (clickable/tappable).
2. **Given** người học chạm vào từ có lỗi sai, **When** từ được chọn, **Then** hệ thống mở menu/lựa chọn các phương án sửa đúng cho từ đó.
3. **Given** người học chọn đúng từ sai và sửa đúng, **When** xác nhận, **Then** câu hiển thị ở dạng chuẩn xác, kèm phần giải thích "Tại sao sai và cách khắc phục trong môi trường công sở".
4. **Given** người học chọn từ không chứa lỗi, **When** kiểm tra, **Then** hệ thống thông báo từ đó đã đúng ngữ pháp và gợi ý người học xem xét các vị trí khác trong câu.

---

### User Story 5 - Thử Thách 3: Ghép Câu Lịch Trình & Giao Tiếp Công Sở (Priority: P2)

Người học muốn luyện phản xạ cấu trúc câu hoàn chỉnh để áp dụng vào viết báo cáo hoặc trao đổi hàng ngày. Họ bước vào Chặng 3 "Ghép Câu & Lịch Trình". Màn hình hiển thị một tình huống/hình ảnh biểu tượng và bản dịch tiếng Việt yêu cầu (ví dụ: *"Công ty chúng tôi luôn tổ chức buổi họp toàn thể vào sáng thứ Hai"*). Bên dưới là các cụm từ/từ tiếng Anh bị xáo trộn. Người học kéo thả hoặc nhấn chọn các mảnh từ theo đúng trật tự ngữ pháp (S + Adverb of Frequency + V(s/es) + Object + Time). Khi ghép đúng, toàn bộ câu phát âm mẫu chuẩn và hệ thống hiển thị mẹo ghi nhớ vị trí trạng từ tần suất.

**Why this priority**: Giúp người học làm chủ trật tự từ tự nhiên trong câu tiếng Anh, đặc biệt là vị trí của trạng từ chỉ tần suất và cụm thời gian.

**Independent Test**: Vào Chặng 3, tương tác ghép từ bằng cả chuột và cảm ứng touch, nộp câu và xác nhận trật tự từ được đánh giá chính xác.

**Acceptance Scenarios**:

1. **Given** người học ở Chặng 3, **When** bài tập tải lên, **Then** hiển thị nghĩa câu tiếng Việt mục tiêu và danh sách các khối từ tiếng Anh xáo trộn.
2. **Given** người học nhấn hoặc kéo thả từng khối từ, **When** từ được xếp vào hàng câu, **Then** từ hiển thị mượt mà theo đúng thứ tự lựa chọn.
3. **Given** người học bấm bỏ chọn một từ đã xếp, **When** nhấn vào từ trên hàng kết quả, **Then** từ đó quay trở lại danh sách lựa chọn bên dưới.
4. **Given** người học xếp đúng trọn vẹn câu, **When** kiểm tra, **Then** hệ thống phát âm câu hoàn chỉnh, hiển thị thông báo thành công và mẹo cấu trúc liên quan.

---

### User Story 6 - Xem Tổng Kết Bài Học & Lưu Tiến Độ Tự Động (Priority: P3)

Sau khi hoàn thành các chặng, người học được chuyển đến màn hình Tổng Kết (Completion Dashboard). Tại đây hiển thị tỉ lệ hoàn thành, số câu trả lời đúng trên tổng số câu của từng chặng, danh sách các chủ điểm/từ vựng cần lưu ý, và nút "Luyện tập lại" hoặc "Quay về Hub 12 Thì". Tiến độ học tập của bài học được lưu tự động trên thiết bị của người dùng để khi quay lại Hub 12 Thì, thẻ "Thì Hiện Tại Đơn" hiển thị trạng thái hoàn thành (ví dụ: "Đã hoàn thành 3/3 chặng - 90% chính xác").

**Why this priority**: Tạo động lực hoàn thành và cung cấp cái nhìn tổng quan về mức độ thuần thục của người học mà không bắt buộc phải tạo tài khoản phức tạp.

**Independent Test**: Hoàn thành bài học, kiểm tra màn hình tổng kết, tải lại trang và kiểm tra tiến độ được lưu trên Hub 12 Thì.

**Acceptance Scenarios**:

1. **Given** người học hoàn thành bài học Thì Hiện Tại Đơn, **When** vào màn hình tổng kết, **Then** hiển thị điểm số chi tiết từng chặng và đánh giá tổng quan.
2. **Given** người học quay lại trang Hub 12 Thì (`/tenses`), **When** trang tải, **Then** thẻ Thì Hiện Tại Đơn cập nhật badge tiến độ tương ứng.
3. **Given** người học muốn ôn luyện lại để cải thiện điểm số, **When** nhấn "Luyện tập lại", **Then** hệ thống cho phép làm lại bài tập từ đầu hoặc chọn chặng cụ thể.

---

### Edge Cases

- **Mất kết nối mạng**: Dữ liệu bài học và logic tương tác được tải sẵn dạng tĩnh; bài học vẫn hoạt động mượt mà không cần mạng liên tục.
- **Trình duyệt không hỗ trợ Web Speech API**: Hệ thống ẩn nút loa hoặc hiển thị tooltip nhẹ "Tính năng phát âm không hỗ trợ trên trình duyệt này", không làm gián đoạn việc làm bài tập.
- **Nhập liệu linh hoạt (Dạng bài tự gõ)**: Tự động loại bỏ khoảng trắng thừa ở đầu/cuối chuỗi, không phân biệt chữ hoa/thường đối với các từ không phải danh từ riêng hoặc đầu câu (ví dụ: `Works` và `works` đều được chấp nhận nếu ở giữa câu).
- **Thiết bị màn hình hẹp (Mobile 360px - 414px)**: Các khối từ ghép câu tự động xuống dòng linh hoạt, không bị tràn màn hình (overflow), vùng bấm tối thiểu 44px để dễ chạm bằng ngón tay.
- **Rời bài tập giữa chừng**: Lưu tạm thời trạng thái câu hỏi hiện tại trong phiên làm việc để người dùng không bị mất tiến độ nếu vô tình chạm reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI có lối vào phân khu "Luyện Thì Tiếng Anh" từ trang chủ, với định vị rõ ràng cho người đi làm và sinh viên.
- **FR-002**: Hệ thống PHẢI cung cấp trang Hub 12 Thì (`/tenses`) trực quan, phân nhóm thành 3 nhóm thời gian: Thì Hiện Tại (Present Tenses), Thì Quá Khứ (Past Tenses), Thì Tương Lai (Future Tenses).
- **FR-003**: Trang Hub 12 Thì PHẢI kích hoạt đầy đủ mô-đun "Thì Hiện Tại Đơn" (`/tenses/present-simple`) và hiển thị 11 thì còn lại ở trạng thái chuẩn bị (Coming Soon badge).
- **FR-004**: Mô-đun Thì Hiện Tại Đơn PHẢI cung cấp phần tóm tắt lý thuyết (Quick Rules & Cheat Sheet) bao gồm: Công thức Động từ To Be, Công thức Động từ Thường, Quy tắc thêm `-s/-es`, Trạng từ chỉ tần suất, và Ngữ cảnh ứng dụng công sở.
- **FR-005**: Hệ thống PHẢI có Chặng 1 (Chia động từ trong ngữ cảnh/Email) với tối thiểu 8 câu hỏi tình huống thực tế văn phòng.
- **FR-006**: Hệ thống PHẢI có Chặng 2 (Săn lỗi sai văn phòng - Error Hunter) cho phép người học tương tác chọn từ sai trong câu và chọn phương án sửa đúng với tối thiểu 6 câu hỏi.
- **FR-007**: Hệ thống PHẢI có Chặng 3 (Ghép câu & Lịch trình - Sentence Builder) hỗ trợ kéo thả/chọn khối từ để tạo câu hoàn chỉnh với tối thiểu 6 câu hỏi.
- **FR-008**: Tất cả câu hỏi trong mọi chặng PHẢI có phần giải thích ngữ pháp chi tiết (Grammar Explanation) hiển thị ngay sau khi người học nộp đáp án.
- **FR-009**: Hệ thống PHẢI hỗ trợ phát âm tiếng Anh chuẩn cho các câu ví dụ và câu bài tập thông qua Web Speech API.
- **FR-010**: Hệ thống PHẢI hỗ trợ giao diện song ngữ chuyên nghiệp: ngữ cảnh và câu hỏi tiếng Anh, hướng dẫn và phân tích ngữ pháp tiếng Việt.
- **FR-011**: Dữ liệu nội dung của phân hệ thì PHẢI hoàn toàn độc lập (Decoupled & Self-contained), được cấu trúc theo schema mở chuẩn hóa, không phụ thuộc vào bất kỳ quy ước kế thừa (legacy conventions) nào của các game thiếu nhi trước đó.
- **FR-012**: Hệ thống PHẢI lưu trữ tiến độ và điểm số hoàn thành cục bộ trên trình duyệt của người dùng (Local Session / Storage) mà không bắt buộc đăng nhập.
- **FR-013**: Giao diện PHẢI responsive toàn diện, hỗ trợ tối ưu trên mobile (từ 360px), tablet và desktop với phong cách thiết kế hiện đại, tinh gọn, phù hợp cho người đi làm.

### Key Entities *(Standalone Data Schema)*

- **TenseMetadata**: Đại diện thông tin tổng quan của một thì tiếng Anh trong Hub (mã định danh `id`, tên tiếng Anh `name`, tên tiếng Việt `vietnameseName`, nhóm `group`: present/past/future, mô tả ngắn `description`, trạng thái `status`: active/coming_soon, cấp độ `level`: beginner/intermediate/advanced).
- **TenseModuleData**: Đại diện toàn bộ nội dung của một bài học thì cụ thể, chứa:
  - `metadata`: Thông tin thì (`TenseMetadata`)
  - `quickRules`: Danh sách các thẻ quy tắc ngữ pháp (`GrammarRuleCard`)
  - `challenges`: Danh sách 3 chặng bài tập chuyên biệt:
    1. `conjugation`: Danh sách bài tập chia động từ trong email/câu (`ConjugationItem`)
    2. `errorHunting`: Danh sách bài tập săn lỗi sai công sở (`ErrorHunterItem`)
    3. `sentenceBuilding`: Danh sách bài tập ghép câu & lịch trình (`SentenceBuilderItem`)
- **GrammarRuleCard**: Thẻ lý thuyết tóm tắt (tiêu đề `title`, công thức `formula`, quy tắc chi tiết `rules`, ví dụ thực tế `examples` gồm câu tiếng Anh, dịch nghĩa tiếng Việt, ghi chú ngữ cảnh).
- **ConjugationItem**: Bài tập chia động từ (mã `id`, ngữ cảnh `contextType`: email/meeting/routine, đoạn văn/câu `text` chứa chỗ trống, động từ gốc `baseVerb`, đáp án đúng `correctAnswer`, các lựa chọn trắc nghiệm `options`, giải thích chi tiết `explanation`).
- **ErrorHunterItem**: Bài tập tìm lỗi sai (mã `id`, câu tiếng Anh hoàn chỉnh có lỗi `sentenceWithTokens`, vị trí token sai `errorTokenIndex`, từ đúng thay thế `correctToken`, các lựa chọn sửa `options`, giải thích lỗi sai công sở `explanation`).
- **SentenceBuilderItem**: Bài tập ghép câu (mã `id`, nghĩa tiếng Việt `vietnameseMeaning`, các mảnh từ/cụm từ xáo trộn `scrambledTokens`, thứ tự từ đúng `correctSentence`, mẹo ngữ pháp `grammarTip`).
- **TenseUserProgress**: Trạng thái tiến độ người học cho từng thì (mã thì `tenseId`, điểm từng chặng `stageScores`, trạng thái hoàn thành `completed`, lần học cuối `lastStudiedAt`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể truy cập Hub 12 Thì và bắt đầu bài học Thì Hiện Tại Đơn trong vòng dưới 3 cú nhấp chuột từ trang chủ.
- **SC-002**: Người học hoàn thành một chặng bài tập (6-8 câu) trong thời gian trung bình từ 3 đến 5 phút, phù hợp với thời gian nghỉ giải lao của người đi làm.
- **SC-003**: 100% câu hỏi bài tập đều hiển thị giải thích ngữ pháp tức thì và rõ ràng sau khi nộp đáp án.
- **SC-004**: Tất cả tương tác học tập và bài tập hoạt động trơn tru trên cả thiết bị di động (từ 360px trở lên) và máy tính để bàn mà không bị lỗi tràn giao diện hay vỡ bố cục.
- **SC-005**: Dữ liệu cấu trúc bài học hoàn toàn tách rời thành schema JSON độc lập, cho phép mở rộng thêm các thì mới (như Past Simple, Present Continuous) mà không cần thay đổi cấu trúc mã nguồn giao diện.
- **SC-006**: Đạt tỉ lệ hoàn thành trên 85% đối với người học trải nghiệm bài học lần đầu mà không cần hướng dẫn phụ trợ.

## Assumptions

- Người học là người đi làm, sinh viên hoặc người lớn có nhu cầu củng cố căn bản ngữ pháp tiếng Anh ứng dụng trong công việc và đời sống.
- Không yêu cầu người học phải tạo tài khoản hoặc đăng nhập để làm bài; tiến độ học được lưu cục bộ trên thiết bị của họ.
- Nội dung câu hỏi và ví dụ tập trung vào bối cảnh công sở hiện đại: trao đổi công việc, lịch trình, viết email, báo cáo tiến độ, quy trình văn phòng.
- Kiến trúc dữ liệu JSON được thiết kế mới hoàn toàn độc lập tại `src/data/tenses/`, không dùng chung hoặc phụ thuộc vào cấu trúc dữ liệu của các game thiếu nhi hiện có trong `src/data/`.
- Phát âm sử dụng Web Speech API có sẵn của trình duyệt.
