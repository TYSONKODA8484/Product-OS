// Sample data shared by modules

const SAMPLE_NOTES = [
  { id: "n1", title: "Q3 OKRs draft", body: "Q3 OKRs draft\n\nObjective 1: Improve onboarding completion rate to 65%\n- KR1: Reduce signup-to-first-action time by 30%\n- KR2: Add interactive walkthrough to mobile flow\n- KR3: A/B test new welcome screen variants\n\nObjective 2: Ship localization to 6 new markets\n- Brazil, Mexico, Japan, Korea, Germany, France\n- Partner with regional marketing leads", updated: Date.now() - 1000*60*30 },
  { id: "n2", title: "Sprint 24 retro notes", body: "Sprint 24 retro notes\n\nWhat went well:\n- Faster code review turnaround (avg 4h vs 9h)\n- Design QA caught 12 issues before staging\n- New feature flag system shipped on time\n\nWhat to improve:\n- Need clearer acceptance criteria on PRDs\n- Backend integration delayed iOS launch by 2 days\n\nAction items:\n- Schedule PRD walkthrough sessions every Tuesday\n- Set up async daily standups in Slack", updated: Date.now() - 1000*60*60*3 },
  { id: "n3", title: "User interview - Maya R.", body: "User interview - Maya R.\nDesigner at fitness startup, age 31\n\nKey pain points:\n- Loses context switching between Figma and Notion\n- Wants AI to summarize Slack threads daily\n- Wishes she could @ mention specs from anywhere\n\nQuotes:\n\"I have 14 tabs open right now and I'm only on my 2nd coffee.\"\n\"Why doesn't anything talk to anything else?\"", updated: Date.now() - 1000*60*60*22 },
  { id: "n4", title: "Pricing experiment ideas", body: "Pricing experiment ideas\n\n1. Annual-only on landing — push monthly to second step\n2. Show team-tier upgrade prompts when 3+ collabs added\n3. Free tier: cap at 5 projects vs current 3 — see if conversion improves\n4. Currency localization (we lose ~12% on USD-only in EU)", updated: Date.now() - 1000*60*60*24*2 },
  { id: "n5", title: "Competitive teardown", body: "Competitive teardown\n\nTool A: strong workflow editor, weak mobile\nTool B: great mobile, no AI features yet\nTool C: dominant in enterprise, slow on shipping\n\nOur wedge: AI-native + cross-platform parity from day 1.", updated: Date.now() - 1000*60*60*24*5 },
];

const APPS = ["LightX", "AI Leap", "Photocut", "StyleOn", "StorYZ"];

const SPRINTS = [
  { id: "s1", feature: "Background remover v2", app: "LightX", platforms: ["iOS","Android"], stage: "Dev", status: "Current", eta: "May 28", blocker: "", jira: "PROJ-2841", review: "PROJ-2841-R", prd: "doc/prd-bg-v2" },
  { id: "s2", feature: "Onboarding redesign", app: "AI Leap", platforms: ["iOS"], stage: "Design", status: "Current", eta: "May 24", blocker: "Waiting on illustrations", jira: "PROJ-2812", review: "", prd: "doc/onboard-r2" },
  { id: "s3", feature: "Subscription paywall A/B", app: "Photocut", platforms: ["iOS","Android","Web"], stage: "QA", status: "Current", eta: "May 22", blocker: "", jira: "PROJ-2855", review: "PROJ-2855-R", prd: "doc/paywall-ab" },
  { id: "s4", feature: "AI try-on engine", app: "StyleOn", platforms: ["iOS"], stage: "Product", status: "Next", eta: "Jun 5", blocker: "API contract pending", jira: "PROJ-2901", review: "", prd: "doc/tryon-engine" },
  { id: "s5", feature: "Story templates pack", app: "StorYZ", platforms: ["iOS","Android"], stage: "Dev", status: "Next", eta: "Jun 9", blocker: "", jira: "PROJ-2920", review: "", prd: "doc/story-templates" },
  { id: "s6", feature: "Push notif scheduler", app: "LightX", platforms: ["Android"], stage: "Dev", status: "Next", eta: "Jun 12", blocker: "", jira: "PROJ-2933", review: "", prd: "doc/push-sched" },
  { id: "s7", feature: "Photo enhancer 4x", app: "Photocut", platforms: ["iOS"], stage: "Done", status: "Done", eta: "May 8", blocker: "", jira: "PROJ-2701", review: "PROJ-2701-R", prd: "doc/enhancer-4x" },
  { id: "s8", feature: "Localization for KR/JP", app: "AI Leap", platforms: ["iOS","Android"], stage: "Done", status: "Done", eta: "May 14", blocker: "", jira: "PROJ-2780", review: "PROJ-2780-R", prd: "doc/loc-krjp" },
  { id: "s9", feature: "Camera UI refresh", app: "LightX", platforms: ["iOS"], stage: "Design", status: "Next", eta: "Jun 18", blocker: "Pending design review", jira: "PROJ-2960", review: "", prd: "doc/camera-ui" },
  { id: "s10", feature: "Outfit recommender", app: "StyleOn", platforms: ["iOS","Android"], stage: "Product", status: "Next", eta: "Jun 22", blocker: "", jira: "PROJ-2981", review: "", prd: "doc/outfit-rec" },
  { id: "s11", feature: "Bulk export tool", app: "Photocut", platforms: ["Web"], stage: "QA", status: "Current", eta: "May 27", blocker: "", jira: "PROJ-2890", review: "PROJ-2890-R", prd: "doc/bulk-export" },
  { id: "s12", feature: "Highlight reels", app: "StorYZ", platforms: ["iOS"], stage: "Dev", status: "Current", eta: "May 30", blocker: "Video codec issue on iOS 17", jira: "PROJ-2845", review: "", prd: "doc/highlight-reels" },
];

const PACK_CATEGORIES = [
  "224 - Product Photoshoot",
  "330 - Try-on / Showcase",
  "412 - Background Pack",
  "501 - Style Filter",
  "608 - Avatar Generator",
];
const PACK_DATA = [
  { id: "MDL-2241", cat: "224 - Product Photoshoot", sub: "Cosmetics", name: "Marble countertop softbox", status: "Live", apps: ["LX","PC"], comments: "Top performer in EU." },
  { id: "MDL-2242", cat: "224 - Product Photoshoot", sub: "Apparel", name: "Studio backdrop neutral", status: "Live", apps: ["LX","StyleOn"], comments: "" },
  { id: "MDL-2243", cat: "224 - Product Photoshoot", sub: "Jewelry", name: "Black velvet macro", status: "Pending", apps: ["LX"], comments: "Awaiting QA pass." },
  { id: "MDL-3301", cat: "330 - Try-on / Showcase", sub: "Tops", name: "Hoodie streetwear set", status: "Live", apps: ["StyleOn"], comments: "" },
  { id: "MDL-3302", cat: "330 - Try-on / Showcase", sub: "Dresses", name: "Cocktail dress evening", status: "Live", apps: ["StyleOn","AILeap"], comments: "Sponsored launch in JP." },
  { id: "MDL-3303", cat: "330 - Try-on / Showcase", sub: "Eyewear", name: "Aviator metal sun", status: "Inactive", apps: ["StyleOn"], comments: "Replaced by v2 (3309)." },
  { id: "MDL-3309", cat: "330 - Try-on / Showcase", sub: "Eyewear", name: "Aviator v2 wireframe", status: "Live", apps: ["StyleOn"], comments: "" },
  { id: "MDL-4121", cat: "412 - Background Pack", sub: "Nature", name: "Golden hour forest", status: "Live", apps: ["LX","PC","StorYZ"], comments: "Most-used pack Q1." },
  { id: "MDL-4122", cat: "412 - Background Pack", sub: "Urban", name: "Tokyo neon alley", status: "Pending", apps: ["LX","StorYZ"], comments: "Pending licensing on photo 3." },
  { id: "MDL-4123", cat: "412 - Background Pack", sub: "Studio", name: "Pastel paper roll", status: "Live", apps: ["LX","PC"], comments: "" },
  { id: "MDL-5012", cat: "501 - Style Filter", sub: "Cinematic", name: "Cinema teal-orange grade", status: "Live", apps: ["LX","StorYZ"], comments: "Popular with creators." },
  { id: "MDL-5013", cat: "501 - Style Filter", sub: "Vintage", name: "Kodachrome 64", status: "Live", apps: ["LX"], comments: "" },
  { id: "MDL-5014", cat: "501 - Style Filter", sub: "Mono", name: "High-contrast B&W", status: "Inactive", apps: ["LX"], comments: "Deprecated — see 5018." },
  { id: "MDL-6081", cat: "608 - Avatar Generator", sub: "Anime", name: "Studio-style portrait", status: "Live", apps: ["AILeap"], comments: "" },
  { id: "MDL-6082", cat: "608 - Avatar Generator", sub: "Professional", name: "LinkedIn headshot", status: "Pending", apps: ["AILeap"], comments: "Tuning skin-tone bias." },
  { id: "MDL-6083", cat: "608 - Avatar Generator", sub: "Fantasy", name: "Cyberpunk neon ego", status: "Live", apps: ["AILeap","StyleOn"], comments: "" },
  { id: "MDL-2244", cat: "224 - Product Photoshoot", sub: "Food", name: "Restaurant table flatlay", status: "Live", apps: ["LX","PC"], comments: "" },
  { id: "MDL-2245", cat: "224 - Product Photoshoot", sub: "Tech", name: "Minimal desk gadgets", status: "Pending", apps: ["LX"], comments: "Lighting needs work." },
  { id: "MDL-4124", cat: "412 - Background Pack", sub: "Abstract", name: "Liquid color gradient", status: "Live", apps: ["LX","StyleOn","StorYZ"], comments: "" },
  { id: "MDL-5018", cat: "501 - Style Filter", sub: "Mono", name: "True B&W silver", status: "Live", apps: ["LX","PC"], comments: "Replaces 5014." },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "id", name: "Indonesian" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "sv", name: "Swedish" },
  { code: "uk", name: "Ukrainian" },
];

const LOC_STRINGS = [
  { key: "btn_get_started", en: "Get started", es: "Empezar", fr: "Commencer", de: "Loslegen", hi: "शुरू करें", ja: "始める", ko: "시작하기", pt: "Começar", it: "Iniziare", ru: "Начать", zh: "开始", ar: "ابدأ", tr: "Başla", nl: "Beginnen", pl: "Rozpocznij", id: "Mulai", vi: "Bắt đầu", th: "เริ่ม", sv: "Kom igång", uk: "Розпочати" },
  { key: "title_welcome", en: "Welcome to your studio", es: "Bienvenido a tu estudio", fr: "Bienvenue dans votre studio", de: "Willkommen in deinem Studio", hi: "अपने स्टूडियो में आपका स्वागत है", ja: "スタジオへようこそ", ko: "스튜디오에 오신 것을 환영합니다", pt: "Bem-vindo ao seu estúdio", it: "Benvenuto nel tuo studio", ru: "Добро пожаловать в студию", zh: "欢迎来到您的工作室", ar: "مرحبا بك في الاستوديو الخاص بك", tr: "Stüdyonuza hoş geldiniz", nl: "Welkom in je studio", pl: "Witaj w swoim studiu", id: "Selamat datang di studio Anda", vi: "Chào mừng đến studio của bạn", th: "ยินดีต้อนรับสู่สตูดิโอของคุณ", sv: "Välkommen till din studio", uk: "Ласкаво просимо до студії" },
  { key: "label_email", en: "Email address", es: "Correo electrónico", fr: "Adresse e-mail", de: "E-Mail-Adresse", hi: "ईमेल पता", ja: "メールアドレス", ko: "이메일 주소", pt: "Endereço de e-mail", it: "Indirizzo e-mail", ru: "Электронная почта", zh: "电子邮件地址", ar: "البريد الإلكتروني", tr: "E-posta adresi", nl: "E-mailadres", pl: "Adres e-mail", id: "Alamat email", vi: "Địa chỉ email", th: "ที่อยู่อีเมล", sv: "E-postadress", uk: "Електронна адреса" },
  { key: "btn_continue", en: "Continue", es: "Continuar", fr: "Continuer", de: "Weiter", hi: "जारी रखें", ja: "続ける", ko: "계속하기", pt: "Continuar", it: "Continua", ru: "Продолжить", zh: "继续", ar: "متابعة", tr: "Devam", nl: "Doorgaan", pl: "Kontynuuj", id: "Lanjut", vi: "Tiếp tục", th: "ดำเนินการต่อ", sv: "Fortsätt", uk: "Продовжити" },
  { key: "msg_processing", en: "Processing your photo, this may take a moment", es: "Procesando tu foto, esto puede tardar un momento", fr: "Traitement de votre photo, cela peut prendre un instant", de: "Foto wird verarbeitet, das kann einen Moment dauern", hi: "आपकी फोटो प्रोसेस हो रही है, इसमें थोड़ा समय लग सकता है", ja: "写真を処理しています、少々お待ちください", ko: "사진을 처리하고 있습니다, 잠시만 기다려 주세요", pt: "Processando sua foto, isso pode levar um momento", it: "Elaborazione della foto, potrebbe richiedere un momento", ru: "Обрабатываем фото, это может занять минуту", zh: "正在处理您的照片，这可能需要一点时间", ar: "جارٍ معالجة صورتك، قد يستغرق هذا لحظة", tr: "Fotoğrafınız işleniyor, bu biraz sürebilir", nl: "Je foto wordt verwerkt, dit kan even duren", pl: "Przetwarzanie zdjęcia, może to chwilę potrwać", id: "Memproses foto Anda, mungkin perlu waktu", vi: "Đang xử lý ảnh của bạn, có thể mất một lúc", th: "กำลังประมวลผลรูปภาพของคุณ อาจใช้เวลาสักครู่", sv: "Bearbetar din bild, det kan ta en stund", uk: "Обробляємо ваше фото, це може зайняти хвилину" },
  { key: "btn_remove_bg", en: "Remove background", es: "Quitar fondo", fr: "Supprimer l'arrière-plan", de: "Hintergrund entfernen", hi: "पृष्ठभूमि हटाएं", ja: "背景を削除", ko: "배경 제거", pt: "Remover fundo", it: "Rimuovi sfondo", ru: "Удалить фон", zh: "移除背景", ar: "إزالة الخلفية", tr: "Arka planı kaldır", nl: "Achtergrond verwijderen", pl: "Usuń tło", id: "Hapus latar belakang", vi: "Xóa nền", th: "ลบพื้นหลัง", sv: "Ta bort bakgrund", uk: "Видалити фон" },
  { key: "label_password", en: "Password", es: "Contraseña", fr: "Mot de passe", de: "Passwort", hi: "पासवर्ड", ja: "パスワード", ko: "비밀번호", pt: "Senha", it: "Password", ru: "Пароль", zh: "密码", ar: "كلمة المرور", tr: "Şifre", nl: "Wachtwoord", pl: "Hasło", id: "Kata sandi", vi: "Mật khẩu", th: "รหัสผ่าน", sv: "Lösenord", uk: "Пароль" },
  { key: "btn_save", en: "Save", es: "Guardar", fr: "Enregistrer", de: "Speichern", hi: "सहेजें", ja: "保存", ko: "저장", pt: "Salvar", it: "Salva", ru: "Сохранить", zh: "保存", ar: "حفظ", tr: "Kaydet", nl: "Opslaan", pl: "Zapisz", id: "Simpan", vi: "Lưu", th: "บันทึก", sv: "Spara", uk: "Зберегти" },
  { key: "msg_subscribe_pitch", en: "Unlock unlimited edits, premium packs and 4K exports.", es: "Desbloquea ediciones ilimitadas, paquetes premium y exportación en 4K.", fr: "Débloquez des éditions illimitées, des packs premium et l'exportation 4K.", de: "Schalte unbegrenzte Bearbeitungen, Premium-Pakete und 4K-Export frei.", hi: "अनलिमिटेड एडिट्स, प्रीमियम पैक्स और 4K एक्सपोर्ट अनलॉक करें।", ja: "無制限の編集、プレミアムパック、4Kエクスポートを解放しましょう。", ko: "무제한 편집, 프리미엄 팩, 4K 내보내기를 잠금 해제하세요.", pt: "Desbloqueie edições ilimitadas, pacotes premium e exportação 4K.", it: "Sblocca modifiche illimitate, pacchetti premium ed esportazioni in 4K.", ru: "Откройте безлимит, премиум-пакеты и экспорт в 4K.", zh: "解锁无限编辑、高级套装和 4K 导出。", ar: "افتح تعديلات غير محدودة وحزم متميزة وتصدير 4K.", tr: "Sınırsız düzenleme, premium paketler ve 4K dışa aktarmanın kilidini açın.", nl: "Ontgrendel onbeperkte bewerkingen, premium pakketten en 4K-export.", pl: "Odblokuj nieograniczoną edycję, paczki premium i eksport 4K.", id: "Buka edit tak terbatas, paket premium, dan ekspor 4K.", vi: "Mở khóa chỉnh sửa không giới hạn, gói cao cấp và xuất 4K.", th: "ปลดล็อกการแก้ไขไม่จำกัด ชุดพรีเมียม และส่งออก 4K", sv: "Lås upp obegränsade redigeringar, premiumpaket och 4K-export.", uk: "Розблокуйте безлімітне редагування, преміум-пакети та експорт у 4K." },
  { key: "btn_share", en: "Share", es: "Compartir", fr: "Partager", de: "Teilen", hi: "साझा करें", ja: "共有", ko: "공유", pt: "Compartilhar", it: "Condividi", ru: "Поделиться", zh: "分享", ar: "مشاركة", tr: "Paylaş", nl: "Delen", pl: "Udostępnij", id: "Bagikan", vi: "Chia sẻ", th: "แชร์", sv: "Dela", uk: "Поділитися" },
  { key: "title_upgrade", en: "Go Pro", es: "Hazte Pro", fr: "Passer Pro", de: "Pro werden", hi: "प्रो बनें", ja: "プロにアップグレード", ko: "프로 업그레이드", pt: "Seja Pro", it: "Diventa Pro", ru: "Стать Pro", zh: "升级到 Pro", ar: "احصل على برو", tr: "Pro Ol", nl: "Word Pro", pl: "Zostań Pro", id: "Jadi Pro", vi: "Nâng cấp Pro", th: "อัปเกรดเป็น Pro", sv: "Bli Pro", uk: "Стати Pro" },
];

const SAMPLE_LINKS = [
  { id: "l1", name: "Product Roadmap (Master)", url: "docs.example.com/p/roadmap-master", cat: "Docs" },
  { id: "l2", name: "Q3 Planning Sheet", url: "sheets.example.com/q3-plan", cat: "Sheets" },
  { id: "l3", name: "JIRA — Active Sprint", url: "jira.example.com/sprint/active", cat: "JIRA" },
  { id: "l4", name: "Design System v3", url: "figma.example.com/ds-v3", cat: "Designs" },
  { id: "l5", name: "Onboarding Walkthrough Demo", url: "vid.example.com/onboard-demo", cat: "Videos" },
  { id: "l6", name: "Engineering Standards", url: "docs.example.com/eng-standards", cat: "Docs" },
  { id: "l7", name: "Localization Tracker", url: "sheets.example.com/loc-tracker", cat: "Sheets" },
  { id: "l8", name: "JIRA — Backlog", url: "jira.example.com/backlog", cat: "JIRA" },
  { id: "l9", name: "User Research Library", url: "notes.example.com/research", cat: "Docs" },
  { id: "l10", name: "Brand Asset Library", url: "figma.example.com/brand", cat: "Designs" },
  { id: "l11", name: "All-hands recordings", url: "vid.example.com/all-hands", cat: "Videos" },
  { id: "l12", name: "Incident postmortems", url: "docs.example.com/postmortems", cat: "Other" },
];

// Calendar events
const SAMPLE_EVENTS = [
  { id: "e1", date: "2026-05-22", title: "Paywall A/B ships", type: "sprint" },
  { id: "e2", date: "2026-05-24", title: "Onboarding redesign", type: "sprint" },
  { id: "e3", date: "2026-05-26", title: "Memorial Day (US)", type: "global" },
  { id: "e4", date: "2026-05-28", title: "BG remover v2 ETA", type: "sprint" },
  { id: "e5", date: "2026-05-27", title: "Bulk export QA", type: "sprint" },
  { id: "e6", date: "2026-05-30", title: "Highlight reels release", type: "sprint" },
  { id: "e7", date: "2026-05-19", title: "All-hands review", type: "manual" },
  { id: "e8", date: "2026-05-21", title: "1:1 with design lead", type: "manual" },
  { id: "e9", date: "2026-06-05", title: "Try-on engine kickoff", type: "sprint" },
  { id: "e10", date: "2026-06-09", title: "Story templates ship", type: "sprint" },
  { id: "e11", date: "2026-06-15", title: "Father's Day (US)", type: "global" },
  { id: "e12", date: "2026-06-19", title: "Juneteenth (US)", type: "global" },
  { id: "e13", date: "2026-05-20", title: "Quarterly OKR review", type: "manual" },
];

Object.assign(window, {
  SAMPLE_NOTES, APPS, SPRINTS, PACK_CATEGORIES, PACK_DATA,
  LANGUAGES, LOC_STRINGS, SAMPLE_LINKS, SAMPLE_EVENTS,
});
