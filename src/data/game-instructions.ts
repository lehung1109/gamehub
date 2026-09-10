export interface GameInstruction {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  emoji: string;
  summary: string;
  goal: string;
  steps: string[];
  controls: {
    mouse?: string;
    keyboard?: string;
    touch?: string;
  };
  tips: string[];
  quickSummary?: string;
  howToPlay?: string[];
  benefits?: string[];
}

export const GAME_INSTRUCTIONS: Record<string, GameInstruction> = {
  flashcard: {
    id: "flashcard",
    slug: "flashcard",
    titleVi: "Học từ vựng",
    titleEn: "Flashcard",
    emoji: "🃏",
    summary: "Học từ vựng trực quan qua thẻ lật hai mặt kèm phát âm chuẩn bản xứ.",
    goal: "Làm quen, ghi nhớ cách viết, nghĩa tiếng Việt và phát âm của các từ vựng theo chủ đề.",
    steps: [
      "Chọn chủ đề từ vựng bạn yêu thích (Động vật, Trái cây, Gia đình, Trường học, Bộ phận cơ thể).",
      "Nhấn vào thẻ từ vựng để lật mặt thẻ: xem hình ảnh, từ vựng tiếng Anh, phiên âm và nghĩa tiếng Việt.",
      "Nhấn vào biểu tượng loa để nghe phát âm chuẩn tiếng Anh bản xứ và luyện đọc theo.",
      "Sử dụng nút mũi tên hoặc phím điều hướng để chuyển qua lại giữa các từ trong bộ thẻ.",
    ],
    controls: {
      mouse: "Nhấp chuột vào thẻ để lật thẻ. Bấm nút mũi tên hoặc nút loa trên màn hình.",
      touch: "Chạm vào thẻ để lật. Vuốt hoặc chạm nút điều hướng để đổi thẻ.",
      keyboard: "Phím Mũi tên Trái / Phải để chuyển thẻ từ, phím Space để lật thẻ.",
    },
    tips: [
      "Hãy nghe phát âm và lặp lại to rõ 2-3 lần trước khi lật xem nghĩa tiếng Việt.",
      "Học hết một lượt rồi lật lại từ đầu để kiểm tra xem bạn đã nhớ được bao nhiêu từ!",
    ],
  },

  alphabet: {
    id: "alphabet",
    slug: "alphabet",
    titleVi: "Chữ cái & Phonics",
    titleEn: "Alphabet & Phonics",
    emoji: "🔤",
    summary: "Làm quen với bảng 26 chữ cái tiếng Anh, phát âm ngữ âm (phonics) và đố vui tương tác.",
    goal: "Nhận biết mặt chữ cái, cách phát âm chuẩn và các từ vựng minh họa bắt đầu bằng chữ cái đó.",
    steps: [
      "Khám phá bảng chữ cái: Nhấn vào từng chữ cái từ A đến Z để nghe cách đọc và xem hình minh họa.",
      "Tập nghe và phát âm theo giọng đọc mẫu để ghi nhớ ngữ âm (Phonics).",
      "Chuyển sang tab Đố vui (Quiz): Lắng nghe âm thanh chữ cái và chọn 1 trong 4 đáp án đúng.",
      "Theo dõi số câu đúng và đạt điểm tuyệt đối 10/10 để nhận huy hiệu chiến thắng.",
    ],
    controls: {
      mouse: "Nhấp chuột chọn chữ cái trên bảng hoặc chọn đáp án trong phần đố vui.",
      touch: "Chạm trực tiếp vào các ô chữ cái và nút phát âm.",
      keyboard: "Sử dụng phím mũi tên và Enter để lựa chọn đáp án.",
    },
    tips: [
      "Luyện nghe kỹ ngữ âm của từng chữ cái trước khi làm bài đố vui.",
      "Để ý từ vựng minh họa đi kèm mỗi chữ cái để mở rộng thêm vốn từ mới nhé!",
    ],
  },

  listening: {
    id: "listening",
    slug: "listening",
    titleVi: "Nghe hiểu",
    titleEn: "Listening",
    emoji: "👂",
    summary: "Rèn luyện đôi tai qua việc nghe phát âm tiếng Anh và chọn hình ảnh chính xác.",
    goal: "Phản xạ nhanh với âm thanh tiếng Anh bản ngữ và nhận diện đúng đồ vật, con vật tương ứng.",
    steps: [
      "Hệ thống sẽ tự động phát âm một từ vựng tiếng Anh khi câu hỏi bắt đầu.",
      "Nếu chưa nghe rõ, bấm vào nút Loa phát âm lớn ở giữa màn hình để nghe lại nhiều lần.",
      "Quan sát 4 bức tranh minh họa bên dưới và chọn bức tranh đúng với từ vừa nghe.",
      "Chọn đúng sẽ nhận điểm cộng và chuyển sang câu tiếp theo; nếu sai bạn sẽ được xem lại đáp án đúng.",
    ],
    controls: {
      mouse: "Nhấp chuột vào biểu tượng loa để nghe lại và nhấp chọn 1 trong 4 hình ảnh.",
      touch: "Chạm vào loa phát âm hoặc chạm trực tiếp vào hình ảnh muốn chọn.",
      keyboard: "Nhấn các phím số 1, 2, 3, 4 để chọn nhanh đáp án.",
    },
    tips: [
      "Đừng vội chọn ngay, hãy bấm nghe lại 1-2 lần nếu cảm thấy chưa chắc chắn.",
      "Chú ý các âm đuôi (ending sounds) của từ để không bị nhầm lẫn giữa các từ có âm gần giống nhau.",
    ],
  },

  spelling: {
    id: "spelling",
    slug: "spelling",
    titleVi: "Đánh vần",
    titleEn: "Spelling",
    emoji: "✏️",
    summary: "Ghép các mảnh chữ cái rời rạc thành từ tiếng Anh hoàn chỉnh theo hình ảnh gợi ý.",
    goal: "Ghi nhớ chính xác từng ký tự và thứ tự chữ cái của từ vựng tiếng Anh.",
    steps: [
      "Quan sát hình ảnh và các ô trống gợi ý độ dài của từ tiếng Anh.",
      "Bấm vào biểu tượng loa nếu muốn nghe lại cách phát âm chuẩn của từ.",
      "Kéo thả các chữ cái từ ngân hàng ký tự vào đúng ô trống, hoặc nhấp vào chữ cái để tự động điền vào ô kế tiếp.",
      "Nếu xếp nhầm chữ cái, nhấp vào chữ cái đó trên ô để đưa nó quay lại ngân hàng từ.",
      "Điền đúng toàn bộ chữ cái để hoàn thành từ và ghi điểm!",
    ],
    controls: {
      mouse: "Kéo thả (drag & drop) chữ cái vào ô hoặc nhấp chuột vào chữ cái để chọn/bỏ chọn.",
      touch: "Chạm và kéo các khối chữ cái hoặc chạm nhanh để điền vào ô trống.",
    },
    tips: [
      "Hãy đọc nhẩm từ vựng trong đầu và đánh vần từng âm một theo thứ tự từ trái sang phải.",
      "Nếu gặp từ khó, bấm nút nghe phát âm để phán đoán âm đầu và âm cuối trước.",
    ],
  },

  "numbers-colors": {
    id: "numbers-colors",
    slug: "numbers-colors",
    titleVi: "Số & Màu sắc",
    titleEn: "Numbers & Colors",
    emoji: "🔢",
    summary: "Khám phá thế giới số đếm từ 1 đến 20 và các màu sắc rực rỡ bằng tiếng Anh.",
    goal: "Nhận biết mặt số, cách đọc số đếm, tên gọi và phát âm của các màu sắc cơ bản.",
    steps: [
      "Lựa chọn chế độ bạn muốn khám phá: 'Số đếm' (Numbers) hoặc 'Màu sắc' (Colors).",
      "Nhấn vào từng ô số hoặc ô màu sắc để nghe giọng đọc bản ngữ chuẩn và xem tên tiếng Anh.",
      "Chuyển sang phần bài tập / đố vui để kiểm tra phản xạ đếm đồ vật hoặc phân biệt màu sắc.",
      "Hoàn thành các câu hỏi để đạt huy chương rực rỡ!",
    ],
    controls: {
      mouse: "Nhấp chuột vào ô số/màu để nghe phát âm và chọn đáp án trắc nghiệm.",
      touch: "Chạm ngón tay vào các thẻ số hoặc bảng màu trên màn hình cảm ứng.",
    },
    tips: [
      "Vừa bấm nghe vừa đếm to số ngón tay hoặc tìm đồ vật có màu tương ứng quanh bạn để nhớ lâu hơn.",
    ],
  },

  sentences: {
    id: "sentences",
    slug: "sentences",
    titleVi: "Câu đơn giản",
    titleEn: "Simple Sentences",
    emoji: "💬",
    summary: "Sắp xếp các từ bị xáo trộn để tạo thành câu tiếng Anh đúng ngữ pháp.",
    goal: "Làm quen với trật tự từ cơ bản trong câu tiếng Anh (Chủ ngữ + Động từ + Tân ngữ).",
    steps: [
      "Quan sát tranh minh họa và nghe câu mẫu nếu có.",
      "Các từ trong câu đang bị đảo lộn vị trí ngẫu nhiên ở phần dưới màn hình.",
      "Bấm hoặc kéo thả các khối từ theo đúng trật tự ngữ pháp lên khung ghép câu phía trên.",
      "Bấm nút 'Kiểm tra' để chấm điểm. Hệ thống sẽ chúc mừng nếu đúng hoặc chỉ ra lỗi sai để bạn thử lại.",
    ],
    controls: {
      mouse: "Nhấp chuột chọn khối từ để đưa vào câu, hoặc nhấp vào từ đã chọn để gỡ bỏ.",
      touch: "Chạm vào các thẻ từ ngữ để sắp xếp thành câu hoàn chỉnh.",
    },
    tips: [
      "Tìm từ bắt đầu viết hoa để đặt ở đầu câu, và tìm từ có dấu chấm câu để đặt ở cuối câu nhé!",
      "Nhớ quy tắc vàng: Ai làm gì (Chủ ngữ + Động từ) trước tiên.",
    ],
  },

  "memory-match": {
    id: "memory-match",
    slug: "memory-match",
    titleVi: "Lật thẻ tìm cặp",
    titleEn: "Memory Match",
    emoji: "🧠",
    summary: "Thử thách trí nhớ siêu phàm bằng việc tìm cặp ghép giữa hình ảnh và từ vựng tiếng Anh.",
    goal: "Ghi nhớ vị trí các thẻ bài và ghép đôi chính xác từ vựng với hình ảnh trong thời gian ngắn nhất.",
    steps: [
      "Quan sát lưới các thẻ bài đang úp mặt trên màn hình.",
      "Nhấp vào một thẻ bất kỳ để lật mở mặt thẻ (có thể là hình ảnh hoặc từ tiếng Anh).",
      "Nhấp tiếp vào thẻ thứ hai: Nếu hai thẻ tạo thành một cặp từ - hình tương ứng, chúng sẽ giữ nguyên mở và bạn nhận điểm!",
      "Nếu hai thẻ không khớp, chúng sẽ tự động úp lại sau 1 giây. Hãy ghi nhớ vị trí của chúng!",
      "Lật mở thành công tất cả các cặp thẻ trên bàn cờ để hoàn thành màn chơi.",
    ],
    controls: {
      mouse: "Nhấp chuột vào ô thẻ bài cần lật mở.",
      touch: "Chạm ngón tay trực tiếp vào từng thẻ bài.",
    },
    tips: [
      "Hãy tập trung ghi nhớ vị trí của những tấm thẻ vừa bị úp lại để khi lật được từ tương ứng bạn có thể ghép ngay.",
      "Cố gắng hoàn thành với số lần lật (moves) ít nhất để ghi điểm kỷ lục!",
    ],
  },

  "word-search": {
    id: "word-search",
    slug: "word-search",
    titleVi: "Săn tìm từ vựng",
    titleEn: "Word Search",
    emoji: "🔍",
    summary: "Truy tìm các từ tiếng Anh ẩn nấp theo hàng ngang, dọc hoặc chéo trong ma trận chữ cái.",
    goal: "Rèn luyện mắt tinh tường và kỹ năng nhận diện chính tả từ vựng nhanh nhạy.",
    steps: [
      "Đọc danh sách các từ vựng cần tìm kiếm hiển thị ở bảng bên cạnh.",
      "Quan sát ma trận chữ cái và tìm chữ cái đầu tiên của từ cần săn.",
      "Nhấn giữ chuột (hoặc chạm tay) từ chữ cái đầu tiên và kéo một đường thẳng đến chữ cái cuối cùng của từ.",
      "Khi quét đúng từ, từ đó sẽ được tô sáng bằng dải màu đẹp mắt và được đánh dấu hoàn thành trong danh sách.",
      "Tìm đủ tất cả các từ trong danh sách trước khi thời gian kết thúc.",
    ],
    controls: {
      mouse: "Nhấn giữ chuột trái tại chữ cái đầu, kéo đến chữ cái cuối rồi thả chuột.",
      touch: "Chạm và vuốt ngón tay dọc theo hàng chữ cái cần nối.",
    },
    tips: [
      "Các từ có thể nằm theo chiều Ngang (trái sang phải), Dọc (trên xuống dưới) hoặc Chéo.",
      "Hãy tìm các chữ cái ít phổ biến trong từ (như Z, X, Q, K, V) trên bảng chữ trước để phát hiện vị trí từ nhanh hơn.",
    ],
  },

  "grammar-detective": {
    id: "grammar-detective",
    slug: "grammar-detective",
    titleVi: "Thám tử sửa lỗi",
    titleEn: "Grammar Detective",
    emoji: "🕵️",
    summary: "Hóa thân thành thám tử ngôn ngữ, soi và sửa các lỗi sai ngữ pháp trong email và văn bản.",
    goal: "Nâng cao kỹ năng biên tập, phát hiện lỗi sai thì, giới từ, chia động từ và sửa lại chính xác.",
    steps: [
      "Đọc kỹ đoạn văn bản hoặc email tình huống công sở xuất hiện trên màn hình.",
      "Rà soát và bấm vào từ hoặc cụm từ mà bạn nghi ngờ bị sai ngữ pháp.",
      "Một menu gợi ý sửa lỗi sẽ xuất hiện: Hãy chọn phương án sửa chính xác nhất.",
      "Đọc phần phân tích chi tiết của thám tử để hiểu rõ lý do vì sao câu sai và quy tắc ngữ pháp tương ứng.",
      "Sửa đúng tất cả các lỗi trong văn bản để phá án thành công!",
    ],
    controls: {
      mouse: "Nhấp chuột vào từ bị lỗi trong đoạn văn và nhấp chọn phương án sửa đúng.",
      touch: "Chạm trực tiếp vào từ ngữ trên màn hình cảm ứng.",
    },
    tips: [
      "Chú ý kỹ chủ ngữ (số ít hay số nhiều) để kiểm tra sự hòa hợp với động từ (Subject-Verb Agreement).",
      "Để ý các từ chỉ thời gian (yesterday, tomorrow, every day) để xác định đúng thì của câu.",
    ],
  },

  "vocab-defense": {
    id: "vocab-defense",
    slug: "vocab-defense",
    titleVi: "Hiệp sĩ Từ vựng",
    titleEn: "Word Knight: RPG Battle",
    emoji: "⚔️",
    summary: "Game nhập vai hiệp sĩ đánh quái theo lượt: Dùng kiến thức từ vựng và ngữ pháp để tung chiêu!",
    goal: "Trả lời đúng các thử thách tiếng Anh để tung đòn tấn công tiêu diệt quái vật và bảo vệ vương quốc.",
    steps: [
      "Trong mỗi lượt đấu, quái vật sẽ xuất hiện cùng một câu hỏi thử thách tiếng Anh.",
      "Đọc kỹ câu hỏi và chọn đòn tấn công tương ứng với đáp án chính xác.",
      "Nếu trả lời ĐÚNG: Hiệp sĩ sẽ tung tuyệt chiêu gây sát thương mạnh mẽ lên quái vật!",
      "Nếu trả lời SAI: Đòn tấn công thất bại và quái vật sẽ phản công làm giảm thanh máu của hiệp sĩ.",
      "Hạ gục quái vật để nhận vàng, điểm kinh nghiệm (XP) và mở khóa trang bị mới.",
    ],
    controls: {
      mouse: "Nhấp chuột chọn kỹ năng / đáp án tấn công trên bảng điều khiển phía dưới.",
      touch: "Chạm vào nút kỹ năng hoặc phương án trả lời.",
      keyboard: "Nhấn các phím số 1, 2, 3, 4 để kích hoạt kỹ năng tương ứng.",
    },
    tips: [
      "Tận dụng các câu trả lời đúng liên tiếp để tạo đòn chí mạng (Critical Strike) gây sát thương gấp đôi!",
      "Luôn chú ý thanh máu của hiệp sĩ; nếu máu xuống thấp hãy cẩn trọng chọn đáp án chắc chắn nhất.",
    ],
  },

  crossword: {
    id: "crossword",
    slug: "crossword",
    titleVi: "Giải đố Ô chữ",
    titleEn: "Crossword Master",
    emoji: "🧩",
    summary: "Giải đố các ô chữ tiếng Anh đan xen thông minh theo chủ đề với gợi ý ngữ cảnh.",
    goal: "Điền kín các ô chữ theo hàng ngang và hàng dọc dựa trên các gợi ý nghĩa và phát âm audio.",
    steps: [
      "Nhấp vào một ô trên lưới hoặc chọn một mục trong danh sách gợi ý Hàng ngang (Across) / Hàng dọc (Down).",
      "Đọc kỹ phần mô tả gợi ý và bấm biểu tượng loa để nghe phát âm của từ nếu cần.",
      "Sử dụng bàn phím máy tính hoặc bàn phím ảo trên màn hình để gõ từng ký tự vào ô trống.",
      "Nhấn phím Space hoặc nhấp lại vào ô đang chọn để đảo chiều gõ giữa Ngang và Dọc.",
      "Sử dụng nút Gợi ý (Hint: Tiết lộ chữ cái / Tiết lộ từ) khi gặp câu đố quá khó khăn.",
      "Hoàn thành toàn bộ ô chữ để nhận bảng tổng kết điểm và thời gian phá đảo!",
    ],
    controls: {
      keyboard: "Các phím chữ A-Z để điền chữ. Phím Backspace để xóa. Phím Space để đổi hướng. Các phím mũi tên để di chuyển ô.",
      mouse: "Nhấp chuột vào ô chữ hoặc vào dòng gợi ý. Nhấp vào bàn phím ảo trên màn hình.",
      touch: "Chạm vào ô chữ để kích hoạt bàn phím ảo trên điện thoại / máy tính bảng.",
    },
    tips: [
      "Bắt đầu giải các từ ngắn và có gợi ý rõ ràng trước để lấy các chữ cái giao nhau làm mỏ neo cho các từ dài hơn.",
      "Hạn chế dùng nút Gợi ý (Hint) nếu bạn muốn đạt số sao và điểm tuyệt đối!",
    ],
  },

  "falling-words": {
    id: "falling-words",
    slug: "falling-words",
    titleVi: "Mưa Từ Vựng",
    titleEn: "Falling Words",
    emoji: "🌧️",
    summary: "Luyện gõ nhanh và phản xạ tức thì với các từ tiếng Anh đang rơi xuống với tốc độ cao.",
    goal: "Gõ chính xác các chữ cái của từ trước khi từ rơi chạm đáy màn hình để bảo toàn mạng sống.",
    steps: [
      "Các từ vựng tiếng Anh sẽ xuất hiện và rơi dần từ đỉnh màn hình xuống dưới.",
      "Quan sát từ đang ở gần đáy nhất và dùng bàn phím gõ chính xác từng chữ cái của từ đó.",
      "Mỗi ký tự gõ đúng sẽ sáng lên; gõ xong toàn bộ từ sẽ làm từ nổ tung kèm âm thanh phát âm chuẩn.",
      "Gõ đúng liên tiếp sẽ kích hoạt chuỗi Combo Streak giúp nhân bội số điểm thưởng.",
      "Nếu từ rơi chạm đáy, bạn sẽ bị mất 1 mạng (Trái tim). Trò chơi kết thúc khi bạn hết mạng.",
      "Bấm phím Space hoặc nút Bom khi có nhiều từ rơi cùng lúc để kích nổ toàn màn hình cứu nguy!",
    ],
    controls: {
      keyboard: "Gõ các phím chữ cái A-Z trực tiếp trên bàn phím. Phím Space để kích hoạt Bom nổ.",
      mouse: "Nhấp chọn phím trên bàn phím ảo hiển thị ở đáy màn hình (trên thiết bị di động).",
      touch: "Gõ các chữ cái trên bàn phím cảm ứng được thiết kế riêng.",
    },
    tips: [
      "Ưu tiên tiêu diệt các từ đang ở vị trí thấp nhất gần chạm đáy màn hình trước.",
      "Dành bom cho những thời điểm nguy cấp khi có từ 3-4 từ cùng rơi sát vạch đỏ.",
    ],
  },

  hangman: {
    id: "hangman",
    slug: "hangman",
    titleVi: "Giải Cứu Nhà Thám Hiểm",
    titleEn: "Word Explorer: Balloon Hangman",
    emoji: "🎈",
    summary: "Đoán chữ cái để giải mã từ vựng bí ẩn và giữ cho khinh khí cầu bay cao an toàn.",
    goal: "Đoán đúng toàn bộ các chữ cái trong từ tiếng Anh bí mật trước khi bóng bay của khinh khí cầu bị vỡ hết.",
    steps: [
      "Quan sát số lượng ô trống đại diện cho các chữ cái của từ bí mật và đọc gợi ý chủ đề.",
      "Dùng bàn phím hoặc nhấp vào các chữ cái trên bảng chữ cái ảo để đoán.",
      "Nếu chữ cái bạn đoán CÓ trong từ: Chữ cái sẽ xuất hiện tại đúng vị trí tương ứng.",
      "Nếu chữ cái bạn đoán KHÔNG CÓ trong từ: Một quả bóng của khinh khí cầu sẽ bị nổ!",
      "Tìm ra toàn bộ từ trước khi tất cả bóng bay nổ hết để cứu nhà thám hiểm hạ cánh an toàn!",
    ],
    controls: {
      keyboard: "Nhấn các phím chữ cái A-Z trên bàn phím máy tính để đoán.",
      mouse: "Nhấp chuột vào các nút chữ cái trên bàn phím ảo.",
      touch: "Chạm trực tiếp vào các chữ cái trên màn hình.",
    },
    tips: [
      "Bắt đầu bằng việc đoán các nguyên âm phổ biến nhất trong tiếng Anh: A, E, I, O, U.",
      "Sau đó thử các phụ âm thường gặp như T, N, S, R, H, L.",
    ],
  },

  typing: {
    id: "typing",
    slug: "typing",
    titleVi: "Luyện Gõ Động Từ",
    titleEn: "Verb Typing Practice",
    emoji: "⌨️",
    summary: "Luyện tập gõ nhanh dạng chia đúng của động từ tiếng Anh theo ngữ cảnh câu thực tế.",
    goal: "Vận dụng ngữ pháp thì hiện tại đơn, gõ chuẩn xác dạng chia động từ theo chủ ngữ.",
    steps: [
      "Đọc câu tiếng Anh và chú ý từ động từ nguyên mẫu trong phần gợi ý bên cạnh ô trống.",
      "Xác định chủ ngữ của câu (ngôi thứ ba số ít hay số nhiều) để chia động từ đúng thì.",
      "Gõ đáp án vào ô nhập liệu và nhấn Enter (hoặc bấm nút Kiểm tra).",
      "Hệ thống sẽ hiển thị phản hồi ngay lập tức kèm giải thích quy tắc ngữ pháp chi tiết.",
      "Nhấn 'Next' để chuyển sang câu tiếp theo và tích lũy điểm số tối đa.",
    ],
    controls: {
      keyboard: "Gõ từ bàn phím và nhấn phím Enter để nộp bài kiểm tra.",
      touch: "Chạm vào ô nhập liệu để mở bàn phím ảo trên thiết bị di động.",
    },
    tips: [
      "Nhớ quy tắc thêm -s hoặc -es khi chủ ngữ là He, She, It hoặc danh từ số ít!",
      "Đọc kỹ phần giải thích quy tắc bên dưới mỗi câu để củng cố kiến thức ngữ pháp.",
    ],
  },

  roleplay: {
    id: "roleplay",
    slug: "roleplay",
    titleVi: "Hội Thoại Giao Tiếp",
    titleEn: "Roleplay Conversation",
    emoji: "🎭",
    summary: "Tương tác nhập vai hội thoại thực tế bằng tiếng Anh (gọi món, mua sắm, hỏi đường).",
    goal: "Phát triển phản xạ đối thoại tiếng Anh tự nhiên theo các kịch bản tình huống đời sống.",
    steps: [
      "Đọc và lắng nghe nhân vật đối thoại mở đầu tình huống bằng tiếng Anh.",
      "Bấm vào biểu tượng loa cạnh bong bóng chat nếu bạn muốn nghe lại lời thoại.",
      "Đọc các phương án phản hồi và chọn câu trả lời tự nhiên, lịch sự và phù hợp nhất với ngữ cảnh.",
      "Hệ thống sẽ tính điểm cho lựa chọn chính xác và tiếp tục câu chuyện theo mạch đối thoại.",
      "Hoàn thành trọn vẹn cuộc trò chuyện với số lỗi sai ít nhất để đạt điểm tuyệt đối!",
    ],
    controls: {
      mouse: "Nhấp chuột chọn câu thoại phản hồi và nhấp vào biểu tượng loa để nghe phát âm.",
      touch: "Chạm vào các thẻ phản hồi trên màn hình cảm ứng.",
    },
    tips: [
      "Nghe phát âm chuẩn của đối phương và nhẩm nói theo trước khi đưa ra câu trả lời.",
      "Để ý ngữ cảnh tình huống (trang trọng hay thân mật) để chọn câu thoại tự nhiên nhất.",
    ],
  },

  reading: {
    id: "reading",
    slug: "reading",
    titleVi: "Đọc hiểu tiếng Anh",
    titleEn: "Reading Comprehension",
    emoji: "📖",
    summary: "Đọc các mẩu chuyện ngắn, bài văn tiếng Anh thú vị và trả lời câu hỏi trắc nghiệm.",
    goal: "Nâng cao vốn từ vựng theo văn cảnh và rèn luyện kỹ năng đọc hiểu, suy luận thông tin.",
    steps: [
      "Đọc kỹ đoạn văn ngắn hoặc câu chuyện tiếng Anh trên màn hình.",
      "Có thể bấm vào các từ vựng nổi bật để nghe phát âm hoặc xem giải nghĩa ngữ cảnh.",
      "Đọc câu hỏi trắc nghiệm kiểm tra nội dung bài đọc ở phần bên dưới.",
      "Chọn đáp án đúng nhất dựa vào các chi tiết được nêu trong bài đọc.",
      "Xem kết quả chấm điểm và lời giải thích chi tiết cho từng câu hỏi.",
    ],
    controls: {
      mouse: "Cuộn chuột để đọc đoạn văn bản và nhấp chọn đáp án trắc nghiệm.",
      touch: "Vuốt màn hình để đọc văn bản và chạm vào đáp án bạn chọn.",
    },
    tips: [
      "Đọc lướt một lượt câu hỏi trước khi đọc văn bản để biết thông tin quan trọng nào cần tìm kiếm (kỹ thuật Skimming & Scanning).",
    ],
  },

  wordle: {
    id: "wordle",
    slug: "wordle",
    titleVi: "Thử Thách Đoán Từ",
    titleEn: "Wordle Master",
    emoji: "🟩",
    summary: "Đoán từ tiếng Anh bí ẩn qua gợi ý màu sắc, trau dồi chính tả, phát âm và từ vựng.",
    quickSummary: "Đoán từ tiếng Anh bí ẩn qua gợi ý màu sắc trong 6 lượt thử.",
    goal: "Đoán chính xác từ tiếng Anh bí ẩn trong số lượt thử giới hạn (mặc định 6 lượt) dựa trên phản hồi màu sắc của từng ô chữ.",
    steps: [
      "Nhập một từ tiếng Anh hợp lệ có độ dài tương ứng (mặc định 5 chữ cái) và nhấn Enter.",
      "Quan sát màu sắc các ô chữ: Xanh lá = đúng vị trí, Vàng = sai vị trí, Xám = không có trong từ.",
      "Sử dụng thông tin gợi ý từ các lượt đoán trước để suy luận và đưa ra từ tiếp theo.",
      "Sử dụng các quyền trợ giúp nếu cần: Gợi ý nghĩa tiếng Việt (Hint), Lật mở một chữ cái (Reveal), hoặc Nghe phát âm từ (Audio).",
      "Đoán đúng toàn bộ chữ cái (tất cả ô chuyển màu xanh lá) để giành chiến thắng trước khi hết lượt!",
    ],
    howToPlay: [
      "Nhập từ tiếng Anh hợp lệ gồm 4, 5 hoặc 6 chữ cái và nhấn Enter / Type a valid English word and press Enter.",
      "Màu Xanh lá (Green): Chữ cái đúng và nằm đúng vị trí trong từ / Letter is correct and in the right spot.",
      "Màu Vàng (Yellow): Chữ cái có trong từ nhưng đang ở sai vị trí / Letter is in the word but in the wrong spot.",
      "Màu Xám (Gray): Chữ cái hoàn toàn không có trong từ bí mật / Letter is not in the word in any spot.",
      "Sử dụng các trợ giúp thông minh (Gợi ý nghĩa tiếng Việt, Mở chữ cái ngẫu nhiên, Phát âm bản xứ) khi gặp khó khăn.",
      "Đoán đúng từ trước khi dùng hết 6 lượt thử để chiến thắng và ghi điểm streak!",
    ],
    controls: {
      keyboard: "Gõ các phím chữ cái A-Z trên bàn phím máy tính, bấm Enter để nộp từ, bấm Backspace để xoá ký tự.",
      mouse: "Nhấp chuột vào các phím trên bàn phím ảo hiển thị trên màn hình.",
      touch: "Chạm vào các phím trên bàn phím ảo hiển thị trên thiết bị di động.",
    },
    tips: [
      "Bắt đầu với các từ có nhiều nguyên âm phổ biến như CRANE, AUDIO, TEARS, SLATE để nhanh chóng loại suy các chữ cái.",
      "Chú ý các chữ cái màu xám trên bàn phím ảo - chúng đã bị loại bỏ và không nên dùng lại ở các lượt tiếp theo.",
      "Tận dụng nút 'Hint' để xem gợi ý nghĩa tiếng Việt hoặc ngữ cảnh khi bị mắc kẹt.",
      "Sau khi hoàn thành, hãy nghe lại phát âm bản xứ và xem định nghĩa chi tiết để mở rộng vốn từ vựng.",
    ],
    benefits: [
      "Mở rộng vốn từ vựng tiếng Anh học thuật và đời sống theo nhiều chủ đề đa dạng.",
      "Rèn luyện kỹ năng chính tả và phản xạ nhận diện mẫu từ (phonics & word patterns).",
      "Nâng cao khả năng suy luận logic, tư duy phản biện và phán đoán theo ngữ cảnh.",
      "Luyện nghe phát âm chuẩn bản ngữ và củng cố nghĩa từ vựng qua thẻ tóm tắt kết quả.",
    ],
  },
};

export function getGameInstruction(gameIdOrSlug?: string | null): GameInstruction | undefined {
  if (!gameIdOrSlug) return undefined;
  
  // Normalize: remove leading/trailing slashes if passed as a route
  const cleanId = gameIdOrSlug.replace(/^\/games\/?/, "").replace(/\/.*$/, "").trim().toLowerCase();
  
  return GAME_INSTRUCTIONS[cleanId] || Object.values(GAME_INSTRUCTIONS).find(
    (g) => g.slug.toLowerCase() === cleanId || g.id.toLowerCase() === cleanId
  );
}
