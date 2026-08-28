# Feature Specification: Tùy Chọn Số Lượng Câu Hỏi Từng Chặng & Đảm Bảo Không Trùng Lặp

**Feature Branch**: `016-stage-question-config`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "/superpowers:brainstorming cho phép config số lượng câu hỏi của các chặng, đảm bảo ko câu nào trùng nhau" kèm các phản hồi thống nhất thiết kế: Người học trực tiếp chọn số lượng câu hỏi trên thẻ chặng (5, 10, 15 câu hoặc Tất cả); hệ thống đảm bảo không trùng lặp câu hỏi trong 1 phiên làm bài và ưu tiên rút các câu chưa từng làm khi luyện lại cho đến khi hết kho câu hỏi.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tùy Chọn Số Lượng Câu Hỏi Trực Tiếp Trên Thẻ Chặng (Priority: P1)

Người học tại màn hình Luyện Tập (Practice Tab) của bài học Thì có thể tùy chọn số lượng câu hỏi mong muốn trước khi bắt đầu bất kỳ chặng nào (Chặng 1, Chặng 2, Chặng 3, Chặng 4 DevOps). Giao diện trên thẻ chặng cung cấp các nút chọn nhanh phù hợp với quy mô ngân hàng câu hỏi (ví dụ: 5 câu, 10 câu, 15 câu, Tất cả) với giá trị mặc định hợp lý (10 câu hoặc toàn bộ nếu ít hơn).

**Why this priority**: Cho phép người học linh hoạt điều chỉnh thời lượng luyện tập theo quỹ thời gian hiện có (luyện nhanh 5 câu khi giải lao hoặc luyện sâu 15-20 câu khi có nhiều thời gian).

**Independent Test**: Vào trang Luyện tập của một bài học, chọn mức 5 câu trên thẻ Chặng 1 và nhấn "Vào Chặng 1", xác nhận chặng hiển thị đúng 5 câu hỏi; thử lại với mức 15 câu và xác nhận hiển thị đúng 15 câu.

**Acceptance Scenarios**:

1. **Given** người học ở màn hình Luyện Tập của bài học, **When** quan sát thẻ của một chặng, **Then** thấy bộ chọn số lượng câu hỏi với các mức tùy chọn khả dụng (ví dụ: 5 câu, 10 câu, 15 câu, Tất cả) và giá trị mặc định được chọn sẵn (10 câu hoặc tổng số câu nếu kho < 10).
2. **Given** người học chọn một mức số lượng câu hỏi khác (ví dụ: 5 câu), **When** nhấn "Vào Chặng", **Then** hệ thống khởi tạo phiên làm bài với chính xác 5 câu hỏi và tiến độ hiển thị dạng `x/5`.
3. **Given** người học đã hoàn thành chặng với số câu tuỳ chọn (ví dụ: 5 câu), **When** xem kết quả chặng hoặc màn hình tổng kết, **Then** điểm số và phần trăm được tính chính xác trên tổng số 5 câu đã làm.

---

### User Story 2 - Đảm Bảo Không Trùng Lặp Trong Phiên & Ưu Tiên Câu Mới Khi Luyện Lại (Priority: P1)

Hệ thống đảm bảo rằng trong cùng một phiên làm bài, tất cả các câu hỏi được rút ra từ ngân hàng là phân biệt hoàn toàn, không có câu nào bị trùng lặp. Đồng thời, khi người học bấm "Luyện lại chặng", hệ thống theo dõi lịch sử câu hỏi đã gặp và ưu tiên rút các câu hỏi chưa từng xuất hiện cho đến khi người học trải nghiệm hết toàn bộ ngân hàng câu hỏi của chặng đó.

**Why this priority**: Tránh cảm giác nhàm chán khi làm lại chặng, giúp người học tiếp cận tối đa toàn bộ kho kiến thức và đảm bảo chất lượng đánh giá chính xác.

**Independent Test**: Với một chặng có kho 20 câu, chọn làm 10 câu ở lượt 1, sau đó bấm "Luyện lại chặng" làm tiếp 10 câu ở lượt 2; xác nhận 10 câu ở lượt 2 hoàn toàn mới và không trùng lặp với 10 câu ở lượt 1.

**Acceptance Scenarios**:

1. **Given** một chặng có ngân hàng $M$ câu hỏi và người học chọn $N$ câu ($N \le M$), **When** hệ thống tạo đề thi, **Then** $N$ câu hỏi được chọn phải hoàn toàn khác biệt nhau trong cùng phiên.
2. **Given** người học đã làm $K$ câu hỏi trong các lượt trước ($K < M$), **When** người học bấm "Luyện lại chặng" với số câu $N \le M - K$, **Then** hệ thống chỉ chọn trong số $(M - K)$ câu hỏi chưa từng xuất hiện.
3. **Given** số câu hỏi chưa làm còn lại $R < N$, **When** người học bấm "Luyện lại chặng" với số câu $N$, **Then** hệ thống bốc toàn bộ $R$ câu chưa làm và lấy thêm $(N - R)$ câu từ phần còn lại của kho câu hỏi để đủ $N$ câu không trùng nhau trong phiên đó.
4. **Given** người học đã làm hết toàn bộ kho câu hỏi của chặng, **When** tiếp tục luyện lại, **Then** hệ thống tự động làm mới (reset) chu kỳ xoay vòng câu hỏi và tiếp tục bốc ngẫu nhiên không trùng lặp cho phiên mới.

---

### User Story 3 - Duy Trì Phiên Làm Bài Khi Tải Lại Trang Hoặc Quay Lại Câu Trước (Priority: P2)

Trong quá trình đang làm bài trong một chặng, nếu người học tải lại trang (F5 / Refresh) hoặc nhấn nút quay lại câu hỏi trước đó để kiểm tra, bộ câu hỏi của phiên hiện hành và thứ tự của chúng được giữ nguyên vẹn, không bị xáo trộn hay bốc lại bộ câu hỏi mới giữa chừng.

**Why this priority**: Đảm bảo trải nghiệm làm bài ổn định, tránh mất tiến độ hoặc thay đổi đề thi đột ngột do thao tác vô tình của người dùng.

**Independent Test**: Đang làm câu 3/10 của Chặng 2, tải lại trình duyệt, xác nhận hệ thống vẫn tiếp tục phiên làm việc với đúng 10 câu hỏi đó.

**Acceptance Scenarios**:

1. **Given** người học đang làm dở bài tập của một chặng, **When** tải lại trang (reload/refresh), **Then** danh sách câu hỏi đã được chọn cho phiên đó được giữ nguyên.
2. **Given** người học đã hoàn thành chặng và bấm "Luyện lại chặng" từ màn hình kết quả hoặc danh sách chặng, **When** chặng mới bắt đầu, **Then** phiên làm bài cũ được dọn dẹp và một bộ câu hỏi mới được khởi tạo theo cơ chế xoay vòng.

---

### Edge Cases

- **Kho câu hỏi có số lượng câu ít hơn các mức mặc định:** Nếu kho câu hỏi của một chặng chỉ có 8 câu, các tùy chọn vượt quá 8 (ví dụ 10, 15) sẽ không hiển thị hoặc bị vô hiệu hóa, chỉ cho phép chọn các mức hợp lệ (ví dụ: 5 câu, Tất cả (8 câu)).
- **Chọn số câu tối đa (Tất cả):** Khi chọn tùy chọn "Tất cả", toàn bộ câu hỏi trong ngân hàng câu hỏi của chặng sẽ được xáo trộn và đưa vào bài làm.
- **Xóa dữ liệu / Đặt lại toàn bộ tiến độ bài học (Reset All):** Khi người học bấm "Học lại từ đầu / Đặt lại tiến độ", lịch sử các câu hỏi đã làm của tất cả các chặng cũng được đặt lại về trạng thái ban đầu.
- **Áp dụng đồng bộ cho tất cả các chặng:** Tính năng áp dụng thống nhất cho cả Chặng 1 (Conjugation), Chặng 2 (Error Hunter), Chặng 3 (Sentence Builder) và Chặng 4 (DevOps Challenge nếu có).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST hiển thị bộ chọn số lượng câu hỏi trên từng thẻ Chặng tại màn hình Luyện Tập trước khi người học bắt đầu chặng.
- **FR-002**: Bộ chọn số lượng câu hỏi MUST sinh các mức lựa chọn linh hoạt dựa trên kích thước ngân hàng câu hỏi của chặng (ví dụ: các mốc 5, 10, 15, hoặc Tất cả số câu hiện có).
- **FR-003**: Hệ thống MUST đặt số lượng câu hỏi mặc định hợp lý cho mỗi chặng (mặc định 10 câu, hoặc toàn bộ ngân hàng câu hỏi nếu chặng có ít hơn 10 câu).
- **FR-004**: Hệ thống MUST đảm bảo không có bất kỳ câu hỏi nào bị trùng lặp trong cùng một phiên làm bài.
- **FR-005**: Hệ thống MUST ghi nhận danh sách ID các câu hỏi người học đã trải nghiệm qua các lần làm bài theo từng chặng.
- **FR-006**: Khi người học bắt đầu một phiên làm bài mới hoặc bấm Luyện lại, hệ thống MUST ưu tiên chọn các câu hỏi chưa từng xuất hiện trong lịch sử làm bài gần nhất của chặng đó.
- **FR-007**: Khi số câu hỏi chưa làm trong kho ít hơn số câu người học yêu cầu ($R < N$), hệ thống MUST bốc tất cả $R$ câu chưa làm và bốc bù $(N - R)$ câu từ phần còn lại của kho sao cho bộ câu hỏi trong phiên không trùng nhau.
- **FR-008**: Khi toàn bộ câu hỏi trong kho của một chặng đã được trải nghiệm hết, hệ thống MUST tự động đặt lại vòng quay lịch sử câu hỏi để tiếp tục phục vụ các lần luyện tập tiếp theo.
- **FR-009**: Hệ thống MUST duy trì danh sách câu hỏi của phiên hiện hành khi người học tải lại trang (reload) trong lúc đang làm bài.
- **FR-010**: Màn hình kết quả chặng và bảng tổng kết bài học MUST hiển thị điểm số, phần trăm chính xác và lịch sử chi tiết dựa trên đúng tổng số câu hỏi thực tế của phiên làm bài đó.
- **FR-011**: Thao tác đặt lại toàn bộ bài học (Reset Progress) MUST xóa sạch lịch sử câu hỏi đã làm của tất cả các chặng thuộc bài học đó.

---

### Key Entities

- **Stage Question Option**: Tùy chọn cấu hình số lượng câu hỏi cho một chặng cụ thể, gồm giá trị số câu ($N$) và nhãn hiển thị (ví dụ: `5 câu`, `10 câu`, `Tất cả (20 câu)`).
- **Session Question Set**: Tập hợp các câu hỏi phân biệt được bốc ngẫu nhiên cho một phiên làm bài cụ thể, có thứ tự xác định và được lưu tạm thời cho đến khi phiên kết thúc hoặc được làm lại.
- **Question History Pool**: Danh sách nhận diện các câu hỏi đã xuất hiện qua các phiên luyện tập của từng chặng, dùng để loại trừ và ưu tiên câu hỏi mới trong các lượt bốc tiếp theo.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các phiên làm bài không bao giờ chứa hai câu hỏi trùng lặp nhau trong cùng một chặng.
- **SC-002**: Người học có thể hoàn thành việc chọn số lượng câu hỏi và bắt đầu chặng trong vòng dưới 2 thao tác chạm/click.
- **SC-003**: Khi luyện lại một chặng liên tiếp, 100% các câu hỏi mới chưa làm được ưu tiên xuất hiện trước cho đến khi hết sạch kho câu hỏi của chặng đó.
- **SC-004**: Tất cả các màn hình kết quả chặng và bảng tổng kết phản ánh chính xác 100% tỉ lệ điểm dựa trên số câu đã chọn (ví dụ làm 5 câu đúng 5 câu đạt 100%, làm 15 câu đúng 12 câu đạt 80%).
- **SC-005**: Thao tác tải lại trang (F5) không làm thay đổi nội dung bộ đề thi đang làm dở của phiên hiện hành.

---

## Assumptions

- Ngân hàng câu hỏi của mỗi chặng có ít nhất 5 câu hỏi để đảm bảo tính đa dạng và ý nghĩa của việc tùy chọn số lượng.
- Thiết bị của người học hỗ trợ lưu trữ cục bộ phía trình duyệt (Local Storage / Session Storage) để theo dõi lịch sử câu hỏi và giữ trạng thái phiên làm bài.
- Số lượng câu hỏi người học chọn chỉ áp dụng cho phiên làm bài của chặng tương ứng và không làm ảnh hưởng đến cấu hình mặc định của các bài học khác.
