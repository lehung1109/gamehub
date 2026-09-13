'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'
import type { StudentInventory } from '@/types/shop'
import {
  evaluateSpeakingTurn,
  calculateSpeakingStars,
  calculateSpeakingRewards,
  wordSimilarity,
} from '@/lib/speaking-engine'
import type {
  SendSpeakingTurnInput,
  SpeakingTurnResponse,
  CompleteSpeakingSessionInput,
  SpeakingSessionResult,
  SpeakingScaffoldingHint,
  SpeakingScenario,
} from '@/types/speaking'
import rawScenarios from '@/data/speaking/scenarios.json'

const SCENARIOS = rawScenarios as SpeakingScenario[]

interface OfflineTurnStep {
  tutorMessage: string
  hints: SpeakingScaffoldingHint[]
}

const OFFLINE_DIALOGUE_TREES: Record<string, OfflineTurnStep[]> = {
  'ordering-cafe': [
    {
      tutorMessage: 'Great choice! Would you like that hot or iced, and what size would you prefer?',
      hints: [
        {
          level: 'starter',
          textEn: 'Hot and medium size, please.',
          textVi: 'Một ly nóng cỡ vừa, làm ơn.',
          phoneticHint: '/hɒt ænd ˈmiːdiəm saɪz pliːz/',
        },
        {
          level: 'natural',
          textEn: "I'd like a large iced one, please.",
          textVi: 'Cho mình một ly đá cỡ lớn nhé.',
          phoneticHint: '/aɪd laɪk ə lɑːdʒ aɪst wʌn pliːz/',
        },
        {
          level: 'expressive',
          textEn: 'Can I get a large iced version with a pump of vanilla syrup?',
          textVi: 'Cho mình một ly đá cỡ lớn thêm một chút siro vani nhé!',
          phoneticHint: '/kæn aɪ get ə lɑːdʒ aɪst ˈvɜːʃn wɪð ə pʌmp əv vəˈnɪlə ˈsɪrəp/',
        },
      ],
    },
    {
      tutorMessage: 'Perfect! Would you care for any pastries or snacks to go with that today?',
      hints: [
        {
          level: 'starter',
          textEn: 'A croissant, please.',
          textVi: 'Một chiếc bánh sừng bò, làm ơn.',
          phoneticHint: '/ə krwɑːˈsɒŋ pliːz/',
        },
        {
          level: 'natural',
          textEn: 'No thank you, just the coffee for me.',
          textVi: 'Không cảm ơn, mình chỉ lấy cà phê thôi.',
          phoneticHint: '/nəʊ θæŋk juː dʒʌst ðə ˈkɒfi fɔː miː/',
        },
        {
          level: 'expressive',
          textEn: "I'll also have a warm chocolate muffin, thank you!",
          textVi: 'Mình lấy thêm một bánh muffin sô-cô-la ấm nóng nữa nhé, cảm ơn bạn!',
          phoneticHint: '/aɪl ˈɔːlsəʊ hæv ə wɔːm ˈtʃɒklət ˈmʌfɪn θæŋk juː/',
        },
      ],
    },
    {
      tutorMessage: 'All set! That comes to $4.50. Will you be paying with cash or card?',
      hints: [
        {
          level: 'starter',
          textEn: "I'll pay with cash.",
          textVi: 'Tôi sẽ thanh toán bằng tiền mặt.',
          phoneticHint: '/aɪl peɪ wɪð kæʃ/',
        },
        {
          level: 'natural',
          textEn: 'Card, please. Here you go.',
          textVi: 'Bằng thẻ, xin gửi bạn.',
          phoneticHint: '/kɑːd pliːz hɪər juː ɡəʊ/',
        },
        {
          level: 'expressive',
          textEn: "I'll pay by card, and could I also get a receipt?",
          textVi: 'Mình thanh toán thẻ, và cho mình xin hóa đơn được không?',
          phoneticHint: '/aɪl peɪ baɪ kɑːd ænd kʊd aɪ ˈɔːlsəʊ get ə rɪˈsiːt/',
        },
      ],
    },
    {
      tutorMessage: 'Thank you so much! Here is your order. Enjoy your drink and have a wonderful day!',
      hints: [
        {
          level: 'starter',
          textEn: 'Thank you, bye!',
          textVi: 'Cảm ơn, tạm biệt!',
          phoneticHint: '/θæŋk juː baɪ/',
        },
        {
          level: 'natural',
          textEn: 'Thanks a lot! Have a great day too.',
          textVi: 'Cảm ơn nhiều! Chúc bạn một ngày tốt lành nhé.',
          phoneticHint: '/θæŋks ə lɒt hæv ə ɡreɪt deɪ tuː/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you so much! Your service is wonderful. Have a lovely day!',
          textVi: 'Cảm ơn bạn rất nhiều! Phục vụ thật tuyệt vời. Chúc bạn một ngày vui vẻ!',
          phoneticHint: '/θæŋk juː səʊ mʌtʃ jɔː ˈsɜːvɪs ɪz ˈwʌndəfl hæv ə ˈlʌvli deɪ/',
        },
      ],
    },
  ],
  'making-friends': [
    {
      tutorMessage: 'Nice to meet you! How long have you lived in this neighborhood?',
      hints: [
        {
          level: 'starter',
          textEn: 'I have lived here for two years.',
          textVi: 'Tôi đã sống ở đây 2 năm rồi.',
          phoneticHint: '/aɪ hæv lɪvd hɪər fɔː tuː jɪəz/',
        },
        {
          level: 'natural',
          textEn: 'I was born here and have lived here my whole life.',
          textVi: 'Mình sinh ra ở đây và đã sống ở đây cả đời.',
          phoneticHint: '/aɪ wɒz bɔːn hɪər ænd hæv lɪvd hɪər maɪ həʊl laɪf/',
        },
        {
          level: 'expressive',
          textEn: "I've been living here for about five years now, and I really love this friendly community!",
          textVi: 'Mình sống ở đây khoảng 5 năm rồi và mình thực sự rất thích cộng đồng thân thiện này!',
          phoneticHint: '/aɪv biːn ˈlɪvɪŋ hɪər fɔːr əˈbaʊt faɪv jɪəz naʊ ænd aɪ ˈrɪəli lʌv ðɪs ˈfrendli kəˈmjuːnəti/',
        },
      ],
    },
    {
      tutorMessage: "That's awesome! What hobbies or sports do you enjoy doing on weekends?",
      hints: [
        {
          level: 'starter',
          textEn: 'I like playing soccer.',
          textVi: 'Mình thích chơi bóng đá.',
          phoneticHint: '/aɪ laɪk ˈpleɪɪŋ ˈsɒkər/',
        },
        {
          level: 'natural',
          textEn: 'I love reading books and playing basketball with friends.',
          textVi: 'Mình thích đọc sách và chơi bóng rổ cùng bạn bè.',
          phoneticHint: '/aɪ lʌv ˈriːdɪŋ bʊks ænd ˈpleɪɪŋ ˈbɑːskɪtbɔːl wɪð frendz/',
        },
        {
          level: 'expressive',
          textEn: "I'm really passionate about photography and swimming whenever I get free time!",
          textVi: 'Mình thực sự đam mê nhiếp ảnh và bơi lội bất cứ khi nào có thời gian rảnh!',
          phoneticHint: '/aɪm ˈrɪəli ˈpæʃənət əˈbaʊt fəˈtɒɡrəfi ænd ˈswɪmɪŋ wenˈevər aɪ get friː taɪm/',
        },
      ],
    },
    {
      tutorMessage: 'Sounds fun! Would you like to hang out together at the park this Saturday?',
      hints: [
        {
          level: 'starter',
          textEn: 'Yes, I would love to.',
          textVi: 'Vâng, mình rất muốn.',
          phoneticHint: '/jes aɪ wʊd lʌv tuː/',
        },
        {
          level: 'natural',
          textEn: 'That sounds great! What time should we meet?',
          textVi: 'Nghe tuyệt đấy! Chúng mình nên gặp lúc mấy giờ?',
          phoneticHint: '/ðæt saʊndz ɡreɪt wɒt taɪm ʃʊd wiː miːt/',
        },
        {
          level: 'expressive',
          textEn: "I'd love that! Let's meet around two in the afternoon near the main gate.",
          textVi: 'Tuyệt quá! Chúng mình gặp lúc 2 giờ chiều ở gần cổng chính nhé.',
          phoneticHint: '/aɪd lʌv ðæt lets miːt əˈraʊnd tuː ɪn ðiː ˌɑːftəˈnuːn nɪər ðə meɪn ɡeɪt/',
        },
      ],
    },
    {
      tutorMessage: "Brilliant! I'm really looking forward to it. See you on Saturday!",
      hints: [
        {
          level: 'starter',
          textEn: 'See you then!',
          textVi: 'Hẹn gặp lại bạn khi đó!',
          phoneticHint: '/siː juː ðen/',
        },
        {
          level: 'natural',
          textEn: 'Sounds like a plan, see you soon!',
          textVi: 'Nhất trí nhé, hẹn sớm gặp lại bạn!',
          phoneticHint: '/saʊndz laɪk ə plæn siː juː suːn/',
        },
        {
          level: 'expressive',
          textEn: 'Awesome! Catch you on Saturday. Take good care!',
          textVi: 'Tuyệt vời! Hẹn gặp lại thứ Bảy nhé. Chúc bạn mọi điều tốt lành!',
          phoneticHint: '/ˈɔːsəm kætʃ juː ɒn ˈsætədeɪ teɪk ɡʊd keər/',
        },
      ],
    },
  ],
  'asking-directions': [
    {
      tutorMessage: 'The City Museum is just about four blocks north. Are you planning to walk or take the bus?',
      hints: [
        {
          level: 'starter',
          textEn: 'I want to walk there.',
          textVi: 'Tôi muốn đi bộ đến đó.',
          phoneticHint: '/aɪ wɒnt tuː wɔːk ðeər/',
        },
        {
          level: 'natural',
          textEn: 'I prefer walking if the weather is nice.',
          textVi: 'Tôi thích đi bộ nếu thời tiết đẹp.',
          phoneticHint: '/aɪ prɪˈfɜː ˈwɔːkɪŋ ɪf ðə ˈweðər ɪz naɪs/',
        },
        {
          level: 'expressive',
          textEn: "I'd prefer to walk so I can explore the city sights. Is it an easy route?",
          textVi: 'Tôi thích đi bộ hơn để có thể ngắm cảnh thành phố. Tuyến đường có dễ đi không ạ?',
          phoneticHint: '/aɪd prɪˈfɜː tuː wɔːk səʊ aɪ kæn ɪkˈsplɔː ðə ˈsɪti saɪts ɪz ɪt ən ˈiːzi ruːt/',
        },
      ],
    },
    {
      tutorMessage: 'Yes, just walk straight down King Street and turn right at the traffic lights. Do you see that big clock tower?',
      hints: [
        {
          level: 'starter',
          textEn: 'Yes, I see the clock tower.',
          textVi: 'Có, tôi thấy tháp đồng hồ.',
          phoneticHint: '/jes aɪ siː ðə klɒk ˈtaʊər/',
        },
        {
          level: 'natural',
          textEn: 'I see it clearly right over there.',
          textVi: 'Tôi thấy nó rất rõ ngay đằng kia.',
          phoneticHint: '/aɪ siː ɪt ˈklɪəli raɪt ˈəʊvə ðeər/',
        },
        {
          level: 'expressive',
          textEn: 'Yes, I can clearly spot the clock tower right past the intersection!',
          textVi: 'Vâng, tôi thấy rõ tháp đồng hồ ngay qua ngã tư rồi ạ!',
          phoneticHint: '/jes aɪ kæn ˈklɪəli spɒt ðə klɒk ˈtaʊər raɪt pɑːst ðiː ˌɪntəˈsekʃn/',
        },
      ],
    },
    {
      tutorMessage: 'Walk past the tower, and the museum will be directly on your left. It has grand marble pillars.',
      hints: [
        {
          level: 'starter',
          textEn: 'Is it open today?',
          textVi: 'Hôm nay nó có mở cửa không?',
          phoneticHint: '/ɪz ɪt ˈəʊpən təˈdeɪ/',
        },
        {
          level: 'natural',
          textEn: 'How long does the walk take?',
          textVi: 'Đi bộ mất bao lâu ạ?',
          phoneticHint: '/haʊ lɒŋ dʌz ðə wɔːk teɪk/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you! Do you know if admission tickets are available at the entrance?',
          textVi: 'Cảm ơn chú! Chú có biết vé vào cửa có bán ngay tại cổng không ạ?',
          phoneticHint: '/θæŋk juː duː juː nəʊ ɪf ədˈmɪʃn ˈtɪkɪts ɑːr əˈveɪləbl æt ðiː ˈentrəns/',
        },
      ],
    },
    {
      tutorMessage: 'Yes, it is open until 5 PM and tickets are sold right inside the lobby.',
      hints: [
        {
          level: 'starter',
          textEn: 'Thank you for your help!',
          textVi: 'Cảm ơn chú đã giúp đỡ!',
          phoneticHint: '/θæŋk juː fɔː jɔː help/',
        },
        {
          level: 'natural',
          textEn: 'Thank you officer, that was very helpful.',
          textVi: 'Cảm ơn sĩ quan, thông tin rất hữu ích.',
          phoneticHint: '/θæŋk juː ˈɒfɪsər ðæt wɒz ˈveri ˈhelpfl/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you so much officer, I appreciate your detailed guidance! Have a great day!',
          textVi: 'Cảm ơn sĩ quan rất nhiều, cháu rất biết ơn sự hướng dẫn tận tình! Chúc chú một ngày tốt lành!',
          phoneticHint: '/θæŋk juː səʊ mʌtʃ ˈɒfɪsər aɪ əˈpriːʃieɪt jɔː dɪˈteɪld ˈɡaɪdns hæv ə ɡreɪt deɪ/',
        },
      ],
    },
    {
      tutorMessage: "You're very welcome! Have a safe and enjoyable visit to the museum.",
      hints: [
        {
          level: 'starter',
          textEn: 'Goodbye!',
          textVi: 'Tạm biệt!',
          phoneticHint: '/ɡʊdˈbaɪ/',
        },
        {
          level: 'natural',
          textEn: 'Thanks again, goodbye!',
          textVi: 'Cảm ơn chú lần nữa, tạm biệt chú!',
          phoneticHint: '/θæŋks əˈɡen ɡʊdˈbaɪ/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you very much, take care!',
          textVi: 'Cháu cảm ơn rất nhiều, chúc chú giữ gìn sức khỏe!',
          phoneticHint: '/θæŋk juː ˈveri mʌtʃ teɪk keər/',
        },
      ],
    },
  ],
  'school-life': [
    {
      tutorMessage: 'Renewable energy is a great topic! Should we focus on solar power or wind power?',
      hints: [
        {
          level: 'starter',
          textEn: "Let's focus on solar power.",
          textVi: 'Chúng mình hãy tập trung vào năng lượng mặt trời đi.',
          phoneticHint: '/lets ˈfəʊkəs ɒn ˈsəʊlər ˈpaʊər/',
        },
        {
          level: 'natural',
          textEn: 'I think solar energy is very practical and popular.',
          textVi: 'Mình nghĩ năng lượng mặt trời rất thực tế và phổ biến.',
          phoneticHint: '/aɪ θɪŋk ˈsəʊlər ˈenədʒi ɪz ˈveri ˈpræktɪkl ænd ˈpɒpjələr/',
        },
        {
          level: 'expressive',
          textEn: 'Solar power sounds fantastic because we can demonstrate how solar cells work!',
          textVi: 'Năng lượng mặt trời nghe rất tuyệt vì chúng mình có thể minh họa pin mặt trời hoạt động thế nào!',
          phoneticHint: '/ˈsəʊlər ˈpaʊər saʊndz fænˈtæstɪk bɪˈkɒz wiː kæn ˈdemənstreɪt haʊ ˈsəʊlər selz wɜːk/',
        },
      ],
    },
    {
      tutorMessage: 'Awesome idea! How should we split the workload between research and presentation slides?',
      hints: [
        {
          level: 'starter',
          textEn: 'I can make the slides.',
          textVi: 'Mình có thể làm slide.',
          phoneticHint: '/aɪ kæn meɪk ðə slaɪdz/',
        },
        {
          level: 'natural',
          textEn: 'I can do the research if you make the slides.',
          textVi: 'Mình có thể nghiên cứu tài liệu nếu bạn làm slide.',
          phoneticHint: '/aɪ kæn duː ðə rɪˈsɜːtʃ ɪf juː meɪk ðə slaɪdz/',
        },
        {
          level: 'expressive',
          textEn: "Why don't I gather the data and case studies while you design the visual slides?",
          textVi: 'Hay là mình thu thập dữ liệu và ví dụ thực tế còn bạn thiết kế hình ảnh cho slide nhé?',
          phoneticHint: '/waɪ dəʊnt aɪ ˈɡæðər ðə ˈdeɪtə ænd keɪs ˈstʌdiz waɪl juː dɪˈzaɪn ðə ˈvɪʒuəl slaɪdz/',
        },
      ],
    },
    {
      tutorMessage: 'Sounds like a solid plan! When should we finish our first draft?',
      hints: [
        {
          level: 'starter',
          textEn: 'By Thursday evening.',
          textVi: 'Trước tối thứ Năm nhé.',
          phoneticHint: '/baɪ ˈθɜːzdeɪ ˈiːvnɪŋ/',
        },
        {
          level: 'natural',
          textEn: "Let's finish it by Wednesday night so we can rehearse.",
          textVi: 'Hãy hoàn thành trước tối thứ Tư để chúng mình có thể tập dượt nhé.',
          phoneticHint: '/lets ˈfɪnɪʃ ɪt baɪ ˈwenzdeɪ naɪt səʊ wiː kæn rɪˈhɜːs/',
        },
        {
          level: 'expressive',
          textEn: 'I suggest having the draft ready by Wednesday night so we have plenty of time for practice.',
          textVi: 'Mình đề xuất hoàn thành bản nháp trước tối thứ Tư để có nhiều thời gian luyện tập.',
          phoneticHint: '/aɪ səˈdʒest ˈhævɪŋ ðə drɑːft ˈredi baɪ ˈwenzdeɪ naɪt/',
        },
      ],
    },
    {
      tutorMessage: 'Agreed! Should we meet at the library to put it all together?',
      hints: [
        {
          level: 'starter',
          textEn: 'Yes, at the school library.',
          textVi: 'Được, tại thư viện trường.',
          phoneticHint: '/jes æt ðə skuːl ˈlaɪbrəri/',
        },
        {
          level: 'natural',
          textEn: 'The school library at four o’clock sounds perfect.',
          textVi: 'Thư viện trường lúc 4 giờ nghe rất hợp lý.',
          phoneticHint: '/ðə skuːl ˈlaɪbrəri æt fɔːr əˈklɒk saʊndz ˈpɜːfɪkt/',
        },
        {
          level: 'expressive',
          textEn: 'Yes, the library quiet study room would be ideal for rehearsing our presentation.',
          textVi: 'Đúng vậy, phòng tự học yên tĩnh ở thư viện sẽ rất lý tưởng để tập dượt bài thuyết trình.',
          phoneticHint: '/jes ðə ˈlaɪbrəri ˈkwaɪət ˈstʌdi ruːm wʊd biː aɪˈdɪəl fɔː rɪˈhɜːsɪŋ ˈaʊər ˌpreznˈteɪʃn/',
        },
      ],
    },
    {
      tutorMessage: 'Fantastic team work! See you at the library on Wednesday!',
      hints: [
        {
          level: 'starter',
          textEn: 'See you then!',
          textVi: 'Hẹn gặp bạn khi đó!',
          phoneticHint: '/siː juː ðen/',
        },
        {
          level: 'natural',
          textEn: "See you Chloe, let's do this!",
          textVi: 'Hẹn gặp bạn nhé Chloe, cố lên nào!',
          phoneticHint: '/siː juː ˈkləʊi lets duː ðɪs/',
        },
        {
          level: 'expressive',
          textEn: 'Great plan Chloe, really looking forward to working on it together!',
          textVi: 'Kế hoạch tuyệt vời lắm Chloe, rất mong chờ được làm việc cùng bạn!',
          phoneticHint: '/ɡreɪt plæn ˈkləʊi ˈrɪəli ˈlʊkɪŋ ˈfɔːwəd tuː ˈwɜːkɪŋ ɒn ɪt təˈɡeðər/',
        },
      ],
    },
  ],
  'hotel-checkin': [
    {
      tutorMessage: 'Certainly! May I please see your passport or photo identification to complete the check-in?',
      hints: [
        {
          level: 'starter',
          textEn: 'Here is my passport.',
          textVi: 'Hộ chiếu của tôi đây.',
          phoneticHint: '/hɪər ɪz maɪ ˈpɑːspɔːt/',
        },
        {
          level: 'natural',
          textEn: 'Sure, here is my passport and confirmation number.',
          textVi: 'Chắc chắn rồi, đây là hộ chiếu và mã xác nhận đặt phòng của tôi.',
          phoneticHint: '/ʃʊər hɪər ɪz maɪ ˈpɑːspɔːt ænd ˌkɒnfəˈmeɪʃn ˈnʌmbər/',
        },
        {
          level: 'expressive',
          textEn: 'Here is my passport along with my booking voucher. Everything is under my name.',
          textVi: 'Đây là hộ chiếu cùng phiếu xác nhận phòng. Mọi thông tin đều dưới tên tôi.',
          phoneticHint: '/hɪər ɪz maɪ ˈpɑːspɔːt əˈlɒŋ wɪð maɪ ˈbʊkɪŋ ˈvaʊtʃər/',
        },
      ],
    },
    {
      tutorMessage: 'Thank you! You are booked in a Deluxe King Room for three nights. Would you like breakfast included?',
      hints: [
        {
          level: 'starter',
          textEn: 'Yes, please include breakfast.',
          textVi: 'Có, vui lòng bao gồm bữa sáng.',
          phoneticHint: '/jes pliːz ɪnˈkluːd ˈbrekfəst/',
        },
        {
          level: 'natural',
          textEn: 'How much is the buffet breakfast per day?',
          textVi: 'Bữa sáng buffet bao nhiêu một ngày ạ?',
          phoneticHint: '/haʊ mʌtʃ ɪz ðə ˈbʊfeɪ ˈbrekfəst pɜː deɪ/',
        },
        {
          level: 'expressive',
          textEn: 'Yes please, could you let me know what time and where breakfast is served each morning?',
          textVi: 'Vâng làm ơn, bạn có thể cho tôi biết bữa sáng phục vụ ở đâu và vào khung giờ nào mỗi sáng không?',
          phoneticHint: '/jes pliːz kʊd juː let miː nəʊ wɒt taɪm ænd weər ˈbrekfəst ɪz sɜːvd/',
        },
      ],
    },
    {
      tutorMessage: 'Breakfast is served at the Palm Restaurant from 6:30 to 10:30 AM. Here is your keycard for room 812.',
      hints: [
        {
          level: 'starter',
          textEn: 'Where is the elevator?',
          textVi: 'Thang máy ở đâu ạ?',
          phoneticHint: '/weər ɪz ðiː ˈelɪveɪtər/',
        },
        {
          level: 'natural',
          textEn: 'Could you tell me the Wi-Fi password?',
          textVi: 'Bạn có thể cho tôi biết mật khẩu Wi-Fi không?',
          phoneticHint: '/kʊd juː tel miː ðə ˈwaɪfaɪ ˈpɑːswɜːd/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you! Could you please tell me where the elevators are and how to access the gym?',
          textVi: 'Cảm ơn bạn! Cho tôi hỏi thang máy ở đâu và cách vào phòng tập gym thế nào ạ?',
          phoneticHint: '/θæŋk juː kʊd juː pliːz tel miː weər ðiː ˈelɪveɪtəz ɑːr ænd haʊ tuː ˈækses ðə dʒɪm/',
        },
      ],
    },
    {
      tutorMessage: 'Elevators are to your right, and Wi-Fi connects automatically in your room. May the bellhop assist with your luggage?',
      hints: [
        {
          level: 'starter',
          textEn: 'No thank you, I can take it.',
          textVi: 'Không cảm ơn, tôi tự mang được.',
          phoneticHint: '/nəʊ θæŋk juː aɪ kæn teɪk ɪt/',
        },
        {
          level: 'natural',
          textEn: 'Yes please, that would be very kind.',
          textVi: 'Vâng làm ơn, thế thì tốt quá.',
          phoneticHint: '/jes pliːz ðæt wʊd biː ˈveri kaɪnd/',
        },
        {
          level: 'expressive',
          textEn: 'I would really appreciate that, thank you! Here are my two suitcases.',
          textVi: 'Tôi rất cảm ơn điều đó! Đây là hai chiếc vali của tôi.',
          phoneticHint: '/aɪ wʊd ˈrɪəli əˈpriːʃieɪt ðæt θæŋk juː hɪər ɑː maɪ tuː ˈsuːtkeɪsɪz/',
        },
      ],
    },
    {
      tutorMessage: 'Our team will bring them right up. We wish you an exceptional stay with us at the Grand Palace Hotel!',
      hints: [
        {
          level: 'starter',
          textEn: 'Thank you very much!',
          textVi: 'Cảm ơn bạn rất nhiều!',
          phoneticHint: '/θæŋk juː ˈveri mʌtʃ/',
        },
        {
          level: 'natural',
          textEn: 'Thank you for your help, have a good day.',
          textVi: 'Cảm ơn sự giúp đỡ của bạn, chúc bạn ngày làm việc vui vẻ.',
          phoneticHint: '/θæŋk juː fɔː jɔː help hæv ə ɡʊd deɪ/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you so much for your warm hospitality and assistance! Have a wonderful day.',
          textVi: 'Cảm ơn bạn rất nhiều vì sự đón tiếp nồng hậu và chu đáo! Chúc bạn một ngày tuyệt vời.',
          phoneticHint: '/θæŋk juː səʊ mʌtʃ fɔː jɔː wɔːm ˌhɒspɪˈtæləti ænd əˈsɪstəns hæv ə ˈwʌndəfl deɪ/',
        },
      ],
    },
  ],
  'free-talk': [
    {
      tutorMessage: 'That is so fascinating! What inspired your passion or interest in that topic?',
      hints: [
        {
          level: 'starter',
          textEn: 'I read about it in a book.',
          textVi: 'Tôi đọc về nó trong một cuốn sách.',
          phoneticHint: '/aɪ red əˈbaʊt ɪt ɪn ə bʊk/',
        },
        {
          level: 'natural',
          textEn: "I've always been curious about how it affects our daily lives.",
          textVi: 'Tôi luôn tò mò về cách nó ảnh hưởng đến cuộc sống hàng ngày của chúng ta.',
          phoneticHint: '/aɪv ˈɔːlweɪz biːn ˈkjʊəriəs əˈbaʊt haʊ ɪt əˈfekts ˈaʊə ˈdeɪli laɪvz/',
        },
        {
          level: 'expressive',
          textEn: "Ever since I was young, I've loved exploring creative ideas and seeing how they shape the world!",
          textVi: 'Kể từ khi còn nhỏ, tôi đã thích khám phá những ý tưởng sáng tạo và cách chúng định hình thế giới!',
          phoneticHint: '/ˈevər sɪns aɪ wɒz jʌŋ aɪv lʌvd ɪkˈsplɔːrɪŋ kriˈeɪtɪv aɪˈdɪəz/',
        },
      ],
    },
    {
      tutorMessage: 'I completely agree! How do you usually practice or learn more about this in your free time?',
      hints: [
        {
          level: 'starter',
          textEn: 'I watch videos online.',
          textVi: 'Tôi xem video trên mạng.',
          phoneticHint: '/aɪ wɒtʃ ˈvɪdiəʊz ˈɒnlaɪn/',
        },
        {
          level: 'natural',
          textEn: 'I spend some time each week reading articles and watching documentaries.',
          textVi: 'Mỗi tuần tôi dành chút thời gian đọc bài báo và xem phim tài liệu.',
          phoneticHint: '/aɪ spend sʌm taɪm iːtʃ wiːk ˈriːdɪŋ ˈɑːtɪklz ænd ˈwɒtʃɪŋ ˌdɒkjuˈmentriz/',
        },
        {
          level: 'expressive',
          textEn: 'I love diving deep into tutorials, listening to podcasts, and exchanging thoughts with peers!',
          textVi: 'Tôi thích tìm hiểu sâu qua hướng dẫn, nghe podcast và trao đổi ý kiến cùng bạn bè!',
          phoneticHint: '/aɪ lʌv ˈdaɪvɪŋ diːp ˈɪntuː tjuːˈtɔːriəlz ˈlɪsnɪŋ tuː ˈpɒdkɑːsts/',
        },
      ],
    },
    {
      tutorMessage: 'That shows genuine dedication! What is the biggest goal you want to accomplish next?',
      hints: [
        {
          level: 'starter',
          textEn: 'I want to speak English fluently.',
          textVi: 'Tôi muốn nói tiếng Anh lưu loát.',
          phoneticHint: '/aɪ wɒnt tuː spiːk ˈɪŋɡlɪʃ ˈfluːəntli/',
        },
        {
          level: 'natural',
          textEn: 'My main goal is to communicate with confidence and travel abroad.',
          textVi: 'Mục tiêu chính của tôi là giao tiếp tự tin và đi du lịch nước ngoài.',
          phoneticHint: '/maɪ meɪn ɡəʊl ɪz tuː kəˈmjuːnɪkeɪt wɪð ˈkɒnfɪdəns ænd ˈtrævl əˈbrɔːd/',
        },
        {
          level: 'expressive',
          textEn: 'My ultimate aspiration is to connect effortlessly with people from all cultures and express myself freely!',
          textVi: 'Khát vọng lớn nhất của tôi là kết nối tự nhiên với mọi người từ các nền văn hóa và tự do bộc lộ bản thân!',
          phoneticHint: '/maɪ ˈʌltɪmət ˌæspəˈreɪʃn ɪz tuː kəˈnekt ˈefətləsli/',
        },
      ],
    },
    {
      tutorMessage: 'You are definitely on the right track! What is one habit that keeps you consistent?',
      hints: [
        {
          level: 'starter',
          textEn: 'Practicing a little bit every day.',
          textVi: 'Luyện tập một chút mỗi ngày.',
          phoneticHint: '/ˈpræktɪsɪŋ ə ˈlɪtl bɪt ˈevri deɪ/',
        },
        {
          level: 'natural',
          textEn: 'Setting daily micro-goals keeps me motivated and focused.',
          textVi: 'Đặt ra những mục tiêu nhỏ mỗi ngày giúp tôi có động lực và tập trung.',
          phoneticHint: '/ˈsetɪŋ ˈdeɪli ˈmaɪkrəʊ ɡəʊlz kiːps miː ˈməʊtɪveɪtɪd/',
        },
        {
          level: 'expressive',
          textEn: 'Reminding myself of my long-term purpose and celebrating small wins every single day!',
          textVi: 'Tự nhắc nhở bản thân về mục tiêu dài hạn và ăn mừng những tiến bộ nhỏ mỗi ngày!',
          phoneticHint: '/rɪˈmaɪndɪŋ maɪˈself əv maɪ lɒŋ tɜːm ˈpɜːpəs/',
        },
      ],
    },
    {
      tutorMessage: 'That mindset is truly commendable! What advice would you give to someone just starting out?',
      hints: [
        {
          level: 'starter',
          textEn: 'Never give up and practice daily.',
          textVi: 'Đừng bao giờ bỏ cuộc và luyện tập hàng ngày.',
          phoneticHint: '/ˈnevər ɡɪv ʌp ænd ˈpræktɪs ˈdeɪli/',
        },
        {
          level: 'natural',
          textEn: "Don't fear making mistakes, because every mistake is a lesson.",
          textVi: 'Đừng sợ mắc lỗi, bởi vì mỗi lỗi sai là một bài học.',
          phoneticHint: '/dəʊnt fɪər ˈmeɪkɪŋ mɪˈsteɪks bɪˈkɒz ˈevri mɪˈsteɪk ɪz ə ˈlesn/',
        },
        {
          level: 'expressive',
          textEn: 'Embrace every mistake as proof of courage, stay curious, and savor every milestone along the journey!',
          textVi: 'Hãy coi mỗi lỗi sai là minh chứng cho sự can đảm, giữ vững sự tò mò và tận hưởng từng cột mốc trên hành trình!',
          phoneticHint: '/ɪmˈbreɪs ˈevri mɪˈsteɪk æz pruːf əv ˈkʌrɪdʒ steɪ ˈkjʊəriəs/',
        },
      ],
    },
    {
      tutorMessage: 'What an inspiring conversation! You expressed your thoughts with great clarity and enthusiasm. Keep shining!',
      hints: [
        {
          level: 'starter',
          textEn: 'Thank you Sunny, goodbye!',
          textVi: 'Cảm ơn Sunny, tạm biệt nhé!',
          phoneticHint: '/θæŋk juː ˈsʌni ɡʊdˈbaɪ/',
        },
        {
          level: 'natural',
          textEn: 'Thanks for the great talk Sunny, see you soon!',
          textVi: 'Cảm ơn buổi trò chuyện tuyệt vời nhé Sunny, hẹn sớm gặp lại!',
          phoneticHint: '/θæŋks fɔː ðə ɡreɪt tɔːk ˈsʌni siː juː suːn/',
        },
        {
          level: 'expressive',
          textEn: 'Thank you so much Sunny! This conversation was truly uplifting. I look forward to our next chat!',
          textVi: 'Cảm ơn Sunny rất nhiều! Cuộc trò chuyện này thực sự truyền cảm hứng. Tôi rất mong đợi buổi trò chuyện tiếp theo!',
          phoneticHint: '/θæŋk juː səʊ mʌtʃ ˈsʌni ðɪs ˌkɒnvəˈseɪʃn wɒz ˈtruːli ʌpˈlɪftɪŋ/',
        },
      ],
    },
  ],
}

function findBestMatchingTargetPhrase(userMessage: string, candidateHints: string[]): string {
  if (!candidateHints.length) return userMessage

  let bestPhrase = userMessage
  let bestSim = 0

  for (const candidate of candidateHints) {
    const sim = wordSimilarity(candidate.toLowerCase(), userMessage.toLowerCase())
    if (sim > bestSim) {
      bestSim = sim
      bestPhrase = candidate
    }
  }

  // If candidate is a plausible match (similarity >= 30%), use candidate as reference target
  if (bestSim >= 30) {
    return bestPhrase
  }

  return userMessage
}

function getOfflineTurnStep(
  scenarioId: string,
  turnIndex: number
): { tutorMessage: string; hints: SpeakingScaffoldingHint[] } {
  const scenarioSteps = OFFLINE_DIALOGUE_TREES[scenarioId]
  if (scenarioSteps && scenarioSteps.length > 0) {
    const safeIndex = Math.min(turnIndex, scenarioSteps.length - 1)
    return scenarioSteps[safeIndex]
  }

  return {
    tutorMessage: "That's really interesting! Could you tell me more about that?",
    hints: [
      {
        level: 'starter',
        textEn: 'Yes, of course.',
        textVi: 'Vâng, tất nhiên rồi.',
        phoneticHint: '/jes əv kɔːs/',
      },
      {
        level: 'natural',
        textEn: 'I would be happy to share more details.',
        textVi: 'Mình rất vui lòng chia sẻ thêm chi tiết.',
        phoneticHint: '/aɪ wʊd biː ˈhæpi tuː ʃeər mɔː dɪˈteɪlz/',
      },
      {
        level: 'expressive',
        textEn: 'Certainly! There are a couple of intriguing aspects I can highlight.',
        textVi: 'Chắc chắn rồi! Có một vài khía cạnh rất thú vị mà mình có thể chia sẻ thêm.',
        phoneticHint: '/ˈsɜːtnli ðeər ɑːr ə ˈkʌpl əv ɪnˈtriːɡɪŋ ˈæspekts/',
      },
    ],
  }
}

interface GeminiTurnOutput {
  tutorMessage: string
  hints: SpeakingScaffoldingHint[]
}

async function callGeminiForTurn(
  scenario: SpeakingScenario,
  userMessage: string,
  turnHistory: Array<{ sender: 'tutor' | 'student'; text: string }>,
  apiKey: string
): Promise<GeminiTurnOutput> {
  const persona = scenario.persona
  const historyText = turnHistory
    .map((t) => `${t.sender === 'tutor' ? persona.name : 'Student'}: ${t.text}`)
    .join('\n')

  const prompt = `You are ${persona.name}, role "${persona.role}" with accent "${persona.accent}" and persona tone: "${persona.toneVi}".
The learner is practicing in dialogue scenario: "${scenario.titleEn}" (CEFR level: ${scenario.level}).
Context: "${scenario.descriptionVi}".

Conversation history:
${historyText}
Student: "${userMessage}"

Respond as ${persona.name} with the next dialogue response and 3 graduated scaffolding hints for the student's next turn.
Return ONLY a valid JSON object matching this schema:
{
  "tutorMessage": string (1-2 friendly, conversational sentences matching CEFR ${scenario.level}),
  "hints": [
    {
      "level": "starter",
      "textEn": string (simple beginner response),
      "textVi": string (Vietnamese translation),
      "phoneticHint": string (phonetic/IPA guide)
    },
    {
      "level": "natural",
      "textEn": string (natural conversational response),
      "textVi": string (Vietnamese translation),
      "phoneticHint": string (phonetic/IPA guide)
    },
    {
      "level": "expressive",
      "textEn": string (expressive/idiomatic response),
      "textVi": string (Vietnamese translation),
      "phoneticHint": string (phonetic/IPA guide)
    }
  ]
}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('Gemini API response did not contain text')
  }

  const parsed = JSON.parse(rawText) as GeminiTurnOutput
  if (
    !parsed ||
    typeof parsed.tutorMessage !== 'string' ||
    !Array.isArray(parsed.hints) ||
    parsed.hints.length === 0
  ) {
    throw new Error('Gemini response format invalid')
  }

  return parsed
}

/**
 * Server Action: Process a speaking turn, evaluate user pronunciation,
 * generate next tutor dialogue + scaffolding hints with Gemini or offline fallback.
 */
export async function sendSpeakingTurnAction(
  payload: SendSpeakingTurnInput
): Promise<SpeakingTurnResponse> {
  try {
    if (!payload.userMessage || !payload.userMessage.trim()) {
      return { success: false, error: 'Vui lòng nhập tin nhắn hoặc nói vào micro' }
    }

    if (!payload.scenarioId || !payload.scenarioId.trim()) {
      return { success: false, error: 'Thiếu mã tình huống hội thoại' }
    }

    const scenario = SCENARIOS.find((s) => s.id === payload.scenarioId.trim())
    if (!scenario) {
      return { success: false, error: 'Không tìm thấy tình huống hội thoại' }
    }

    const studentTurnsInHistory = payload.turnHistory
      ? payload.turnHistory.filter((t) => t.sender === 'student').length
      : 0
    const currentStudentTurnIndex = studentTurnsInHistory

    // Determine target phrase for pronunciation assessment
    let candidateHints: string[] = []
    if (currentStudentTurnIndex === 0) {
      candidateHints = scenario.initialHints.map((h) => h.textEn)
    } else {
      const prevStep = OFFLINE_DIALOGUE_TREES[scenario.id]?.[currentStudentTurnIndex - 1]
      if (prevStep) {
        candidateHints = prevStep.hints.map((h) => h.textEn)
      }
    }

    const targetPhrase =
      scenario.id === 'free-talk'
        ? payload.userMessage.trim()
        : findBestMatchingTargetPhrase(payload.userMessage.trim(), candidateHints)

    const evaluation = evaluateSpeakingTurn(targetPhrase, payload.userMessage.trim(), payload.elapsedMs)

    // Check completion condition
    const isCompleted =
      studentTurnsInHistory + 1 >= scenario.targetTurns ||
      (payload.turnHistory && payload.turnHistory.length >= scenario.targetTurns * 2 - 1)

    // Generate tutor message and hints with offline default
    const offlineStep = getOfflineTurnStep(scenario.id, currentStudentTurnIndex)
    let tutorMessage = offlineStep.tutorMessage
    let hints = offlineStep.hints

    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const geminiResult = await callGeminiForTurn(
          scenario,
          payload.userMessage.trim(),
          payload.turnHistory || [],
          apiKey
        )
        tutorMessage = geminiResult.tutorMessage
        hints = geminiResult.hints
      } catch (err) {
        console.warn('Gemini turn generation failed, activating offline pedagogical fallback:', err)
      }
    }

    return {
      success: true,
      tutorMessage,
      tutorAudioText: tutorMessage,
      hints,
      wordBreakdown: evaluation.wordBreakdown,
      accuracyScore: evaluation.accuracyScore,
      feedbackVi: evaluation.feedbackVi,
      isCompleted,
    }
  } catch (err) {
    console.error('[sendSpeakingTurnAction] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi xử lý lượt nói',
    }
  }
}

/**
 * Server Action: Complete speaking session, award stars & XP,
 * and persist transcript to student_speaking_sessions if authenticated.
 */
export async function completeSpeakingSessionAction(
  payload: CompleteSpeakingSessionInput
): Promise<{ success: boolean; data?: SpeakingSessionResult; error?: string }> {
  try {
    if (!payload.scenarioId) {
      return { success: false, error: 'Thiếu mã tình huống' }
    }

    const stars = calculateSpeakingStars(payload.overallScore, payload.pronunciationScore)
    const rewards = calculateSpeakingRewards(stars, payload.totalTurns)
    const xpEarned = rewards.xpEarned

    const sessionResult: SpeakingSessionResult = {
      scenarioId: payload.scenarioId,
      personaId: payload.personaId || 'sunny',
      totalTurns: payload.totalTurns,
      overallScore: payload.overallScore,
      pronunciationScore: payload.pronunciationScore,
      fluencyScore: payload.fluencyScore,
      stars,
      xpEarned,
      mispronouncedWords: payload.mispronouncedWords || [],
      turns: payload.turns || [],
    }

    if (!payload.studentId) {
      return {
        success: true,
        data: sessionResult,
      }
    }

    const supabase = createAdminClient()

    const { error: sessionError } = await supabase
      .from('student_speaking_sessions')
      .insert({
        student_id: payload.studentId,
        scenario_id: payload.scenarioId,
        persona_id: payload.personaId || 'sunny',
        total_turns: payload.totalTurns,
        overall_score: payload.overallScore,
        pronunciation_score: payload.pronunciationScore,
        fluency_score: payload.fluencyScore,
        stars,
        turns_transcript: (payload.turns || []) as unknown as Json,
        mispronounced_words: (payload.mispronouncedWords || []) as unknown as Json,
      })

    if (sessionError) {
      console.error('[completeSpeakingSessionAction] Session insert error:', sessionError)
      return { success: false, error: 'Không thể lưu phiên luyện nói' }
    }

    // Update gamification profile if student has one
    const { data: gamRow } = await supabase
      .from('student_gamification')
      .select('id, inventory')
      .eq('student_id', payload.studentId)
      .maybeSingle()

    if (gamRow) {
      const currentInv = (typeof gamRow.inventory === 'string'
        ? JSON.parse(gamRow.inventory)
        : gamRow.inventory || {}) as StudentInventory & { xp?: number }

      const updatedInv = {
        ...currentInv,
        bonusStars: (currentInv.bonusStars || 0) + stars,
        xp: (currentInv.xp || 0) + xpEarned,
      }

      const { error: updateError } = await supabase
        .from('student_gamification')
        .update({
          inventory: updatedInv as unknown as Json,
        })
        .eq('student_id', payload.studentId)

      if (updateError) {
        console.warn('[completeSpeakingSessionAction] Gamification update warning:', updateError)
      }
    }

    return {
      success: true,
      data: sessionResult,
    }
  } catch (err) {
    console.error('[completeSpeakingSessionAction] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi hoàn thành phiên luyện nói',
    }
  }
}

/**
 * Server Action: Retrieve aggregated speaking metrics for a student.
 */
export async function getStudentSpeakingStatsAction(
  studentId?: string
): Promise<{
  success: boolean
  data?: {
    totalSessions: number
    totalMinutes: number
    averageAccuracy: number
    totalStars: number
  }
  error?: string
}> {
  const defaultStats = {
    totalSessions: 0,
    totalMinutes: 0,
    averageAccuracy: 0,
    totalStars: 0,
  }

  try {
    if (!studentId || !studentId.trim()) {
      return { success: true, data: defaultStats }
    }

    const supabase = createAdminClient()
    const { data: sessions, error } = await supabase
      .from('student_speaking_sessions')
      .select('total_turns, pronunciation_score, stars')
      .eq('student_id', studentId.trim())

    if (error) {
      console.error('[getStudentSpeakingStatsAction] Query error:', error)
      return { success: true, data: defaultStats }
    }

    if (!sessions || sessions.length === 0) {
      return { success: true, data: defaultStats }
    }

    const totalSessions = sessions.length
    const totalStars = sessions.reduce((sum, s) => sum + (s.stars || 0), 0)
    const sumAccuracy = sessions.reduce((sum, s) => sum + (s.pronunciation_score || 0), 0)
    const averageAccuracy = Math.round(sumAccuracy / totalSessions)
    const totalTurns = sessions.reduce((sum, s) => sum + (s.total_turns || 0), 0)
    const totalMinutes = Math.round(totalTurns * 0.5)

    return {
      success: true,
      data: {
        totalSessions,
        totalMinutes,
        averageAccuracy,
        totalStars,
      },
    }
  } catch (err) {
    console.error('[getStudentSpeakingStatsAction] Unexpected error:', err)
    return { success: true, data: defaultStats }
  }
}
