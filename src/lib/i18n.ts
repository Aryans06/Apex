// Lightweight i18n for Bharat — supports English, Hindi, Tamil, Bengali, Telugu
export type Locale = "en" | "hi" | "ta" | "bn" | "te";

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  bn: "বাংলা",
  te: "తెలుగు",
};

type TranslationKeys = {
  // Landing
  "landing.badge": string;
  "landing.headline1": string;
  "landing.headline2": string;
  "landing.subheadline": string;
  "landing.cta": string;
  "landing.howItWorks": string;
  "landing.builtFor": string;
  "landing.statsGems": string;
  "landing.statsFaster": string;
  "landing.statsTime": string;
  "landing.featuresTitle": string;
  "landing.featuresSubtitle": string;
  "landing.feature1Title": string;
  "landing.feature1Desc": string;
  "landing.feature2Title": string;
  "landing.feature2Desc": string;
  "landing.feature3Title": string;
  "landing.feature3Desc": string;
  "landing.howTitle": string;
  "landing.step1Title": string;
  "landing.step1Desc": string;
  "landing.step2Title": string;
  "landing.step2Desc": string;
  "landing.step3Title": string;
  "landing.step3Desc": string;
  "landing.footer": string;
  // Dashboard
  "dash.title": string;
  "dash.active": string;
  "dash.upload": string;
  "dash.totalPool": string;
  "dash.hiddenGems": string;
  "dash.avgProcessing": string;
  "dash.toggleHint": string;
  "dash.recommended": string;
  "dash.aiCurated": string;
  "dash.role": string;
  "dash.postJD": string;
  "dash.noResults": string;
  // Upload Modal
  "upload.title": string;
  "upload.subtitle": string;
  "upload.placeholder": string;
  "upload.cancel": string;
  "upload.analyze": string;
  "upload.uploading": string;
  "upload.analyzing": string;
  "upload.analyzeHint": string;
  "upload.done": string;
  "upload.doneHint": string;
  // JD Modal
  "jd.title": string;
  "jd.subtitle": string;
  "jd.placeholder": string;
  "jd.analyze": string;
  "jd.matching": string;
  "jd.matchHint": string;
  // Proof of Work
  "pow.title": string;
  "pow.validating": string;
  "pow.generating": string;
  "pow.generated": string;
  "pow.intent": string;
  "pow.send": string;
  "pow.cancel": string;
  // Candidate Card
  "card.hiddenGem": string;
  "card.trajectory": string;
  "card.viewProfile": string;
  "card.experience": string;
  "card.validate": string;
  "card.matchScore": string;
  "card.shortlisted": string;
};

const translations: Record<Locale, TranslationKeys> = {
  en: {
    "landing.badge": "Intelligence layer active",
    "landing.headline1": "Stop filtering.",
    "landing.headline2": "understanding.",
    "landing.subheadline": "Apex reads career trajectories, validates claims with AI, and surfaces the brilliant candidates that every other ATS filters out.",
    "landing.cta": "Enter Command Center",
    "landing.howItWorks": "How it works",
    "landing.builtFor": "Built for the future of hiring",
    "landing.statsGems": "Hidden Gems Found",
    "landing.statsFaster": "Faster Hiring",
    "landing.statsTime": "Avg Analysis Time",
    "landing.featuresTitle": "Beyond keyword matching",
    "landing.featuresSubtitle": "Three AI-powered capabilities that understand humans, not just documents.",
    "landing.feature1Title": "Hidden Gem Detection",
    "landing.feature1Desc": "Surfaces self-taught developers and career-switchers that traditional ATS systems filter out.",
    "landing.feature2Title": "Trajectory Analysis",
    "landing.feature2Desc": "Measures career velocity — how fast someone grew, not just where they started.",
    "landing.feature3Title": "Proof of Work Validation",
    "landing.feature3Desc": "Generates hyper-specific technical questions to verify every resume claim.",
    "landing.howTitle": "How Apex Works",
    "landing.step1Title": "Ingestion & Understanding",
    "landing.step1Desc": "You upload a resume. Apex parses the text and standardizes it, preserving exact phrasing and context of every technical claim.",
    "landing.step2Title": "Trajectory Analysis",
    "landing.step2Desc": "Our Gemini pipeline analyzes the candidate's timeline — rapid promotions, increasing complexity, and skill adjacency.",
    "landing.step3Title": "Dynamic Validation",
    "landing.step3Desc": "For every bullet point, Apex generates deep, probing technical questions to verify the candidate actually did the work.",
    "landing.footer": "Built with AI. For humans.",
    "dash.title": "Apex Command Center",
    "dash.active": "Intelligence layer active",
    "dash.upload": "Upload Resume",
    "dash.totalPool": "Total Pool",
    "dash.hiddenGems": "Hidden Gems",
    "dash.avgProcessing": "Avg Processing",
    "dash.toggleHint": "Click to toggle high trajectory candidates",
    "dash.recommended": "Recommended Candidates",
    "dash.aiCurated": "AI Curated",
    "dash.role": "Role",
    "dash.postJD": "Post Job Description",
    "dash.noResults": "No candidates found matching this criteria.",
    "upload.title": "Analyze Candidate",
    "upload.subtitle": "Paste resume text below to let Apex analyze their trajectory.",
    "upload.placeholder": "Paste resume text here...",
    "upload.cancel": "Cancel",
    "upload.analyze": "Analyze",
    "upload.uploading": "Uploading file...",
    "upload.analyzing": "Apex is analyzing",
    "upload.analyzeHint": "Computing trajectory and skill adjacency...",
    "upload.done": "Analysis Complete",
    "upload.doneHint": "Candidate added to pool.",
    "jd.title": "Post Job Description",
    "jd.subtitle": "Paste the JD and Apex will rank candidates by semantic fit.",
    "jd.placeholder": "Paste job description here...",
    "jd.analyze": "Find Best Matches",
    "jd.matching": "Matching candidates...",
    "jd.matchHint": "Analyzing semantic fit, trajectory, and skill adjacency...",
    "pow.title": "Dynamic Proof of Work",
    "pow.validating": "Validating Claim:",
    "pow.generating": "Gemini is generating specific technical validation questions...",
    "pow.generated": "Generated Interview Interrogation:",
    "pow.intent": "AI Intent",
    "pow.send": "Send Assessment to Candidate",
    "pow.cancel": "Cancel",
    "card.hiddenGem": "Hidden Gem",
    "card.trajectory": "High Velocity Trajectory",
    "card.viewProfile": "View Full Profile",
    "card.experience": "Experience Highlights",
    "card.validate": "Validate Claim",
    "card.matchScore": "Match Score",
    "card.shortlisted": "Shortlisted",
  },
  hi: {
    "landing.badge": "इंटेलिजेंस लेयर सक्रिय",
    "landing.headline1": "फ़िल्टर करना बंद करो।",
    "landing.headline2": "समझना शुरू करो।",
    "landing.subheadline": "Apex करियर ट्रैजेक्टरी पढ़ता है, AI से दावों को जाँचता है, और उन शानदार उम्मीदवारों को सामने लाता है जिन्हें हर ATS फ़िल्टर कर देता है।",
    "landing.cta": "कमांड सेंटर में प्रवेश करें",
    "landing.howItWorks": "कैसे काम करता है",
    "landing.builtFor": "भारत की भर्ती के भविष्य के लिए बनाया गया",
    "landing.statsGems": "हिडन जेम्स मिले",
    "landing.statsFaster": "तेज़ भर्ती",
    "landing.statsTime": "औसत विश्लेषण समय",
    "landing.featuresTitle": "कीवर्ड मैचिंग से परे",
    "landing.featuresSubtitle": "तीन AI-संचालित क्षमताएँ जो इंसानों को समझती हैं, सिर्फ दस्तावेज़ नहीं।",
    "landing.feature1Title": "हिडन जेम डिटेक्शन",
    "landing.feature1Desc": "स्व-शिक्षित डेवलपर्स और करियर-स्विचर्स को सामने लाता है जिन्हें पारंपरिक ATS फ़िल्टर कर देता है।",
    "landing.feature2Title": "ट्रैजेक्टरी एनालिसिस",
    "landing.feature2Desc": "करियर वेलोसिटी मापता है — कितनी तेज़ी से कोई बढ़ा, न कि कहाँ से शुरू किया।",
    "landing.feature3Title": "प्रूफ ऑफ वर्क वैलिडेशन",
    "landing.feature3Desc": "हर रिज़्यूम दावे को सत्यापित करने के लिए अत्यधिक विशिष्ट तकनीकी प्रश्न तैयार करता है।",
    "landing.howTitle": "Apex कैसे काम करता है",
    "landing.step1Title": "इनजेशन और समझ",
    "landing.step1Desc": "आप रिज़्यूम अपलोड करते हैं। Apex टेक्स्ट को पार्स करता है और हर तकनीकी दावे का सटीक संदर्भ सुरक्षित रखता है।",
    "landing.step2Title": "ट्रैजेक्टरी एनालिसिस",
    "landing.step2Desc": "हमारी Gemini पाइपलाइन उम्मीदवार की टाइमलाइन का विश्लेषण करती है — तेज़ प्रमोशन, बढ़ती जटिलता, और स्किल एडजेसेंसी।",
    "landing.step3Title": "डायनेमिक वैलिडेशन",
    "landing.step3Desc": "हर बुलेट पॉइंट के लिए, Apex गहरे, जाँच-परख वाले तकनीकी प्रश्न तैयार करता है।",
    "landing.footer": "AI के साथ बनाया गया। इंसानों के लिए।",
    "dash.title": "Apex कमांड सेंटर",
    "dash.active": "इंटेलिजेंस लेयर सक्रिय",
    "dash.upload": "रिज़्यूम अपलोड करें",
    "dash.totalPool": "कुल पूल",
    "dash.hiddenGems": "हिडन जेम्स",
    "dash.avgProcessing": "औसत प्रोसेसिंग",
    "dash.toggleHint": "हाई ट्रैजेक्टरी उम्मीदवारों को टॉगल करें",
    "dash.recommended": "अनुशंसित उम्मीदवार",
    "dash.aiCurated": "AI क्यूरेटेड",
    "dash.role": "भूमिका",
    "dash.postJD": "जॉब डिस्क्रिप्शन पोस्ट करें",
    "dash.noResults": "इस मापदंड से मेल खाने वाला कोई उम्मीदवार नहीं मिला।",
    "upload.title": "उम्मीदवार का विश्लेषण करें",
    "upload.subtitle": "Apex को ट्रैजेक्टरी का विश्लेषण करने दें।",
    "upload.placeholder": "रिज़्यूम टेक्स्ट यहाँ पेस्ट करें...",
    "upload.cancel": "रद्द करें",
    "upload.analyze": "विश्लेषण करें",
    "upload.uploading": "फ़ाइल अपलोड हो रही है...",
    "upload.analyzing": "Apex विश्लेषण कर रहा है",
    "upload.analyzeHint": "ट्रैजेक्टरी और स्किल एडजेसेंसी की गणना...",
    "upload.done": "विश्लेषण पूर्ण",
    "upload.doneHint": "उम्मीदवार पूल में जोड़ा गया।",
    "jd.title": "जॉब डिस्क्रिप्शन पोस्ट करें",
    "jd.subtitle": "JD पेस्ट करें और Apex सिमेंटिक फ़िट के आधार पर रैंक करेगा।",
    "jd.placeholder": "जॉब डिस्क्रिप्शन यहाँ पेस्ट करें...",
    "jd.analyze": "सर्वश्रेष्ठ मैच खोजें",
    "jd.matching": "उम्मीदवार मैच हो रहे हैं...",
    "jd.matchHint": "सिमेंटिक फ़िट, ट्रैजेक्टरी, और स्किल एडजेसेंसी का विश्लेषण...",
    "pow.title": "डायनामिक प्रूफ़ ऑफ़ वर्क",
    "pow.validating": "दावे की जाँच:",
    "pow.generating": "Gemini विशिष्ट तकनीकी सत्यापन प्रश्न तैयार कर रहा है...",
    "pow.generated": "उत्पन्न इंटरव्यू प्रश्न:",
    "pow.intent": "AI उद्देश्य",
    "pow.send": "उम्मीदवार को आकलन भेजें",
    "pow.cancel": "रद्द करें",
    "card.hiddenGem": "हिडन जेम",
    "card.trajectory": "उच्च वेलोसिटी ट्रैजेक्टरी",
    "card.viewProfile": "पूरी प्रोफ़ाइल देखें",
    "card.experience": "अनुभव हाइलाइट्स",
    "card.validate": "दावा सत्यापित करें",
    "card.matchScore": "मैच स्कोर",
    "card.shortlisted": "शॉर्टलिस्ट",
  },
  ta: {
    "landing.badge": "நுண்ணறிவு அடுக்கு செயலில்",
    "landing.headline1": "வடிகட்டுவதை நிறுத்துங்கள்.",
    "landing.headline2": "புரிந்துகொள்ளுங்கள்.",
    "landing.subheadline": "Apex தொழில் பாதைகளைப் படிக்கிறது, AI மூலம் உரிமைகோரல்களைச் சரிபார்க்கிறது, மற்ற ATS அமைப்புகள் வடிகட்டும் திறமையான விண்ணப்பதாரர்களை வெளிக்கொணர்கிறது.",
    "landing.cta": "கட்டளை மையத்தில் நுழையுங்கள்",
    "landing.howItWorks": "இது எப்படி வேலை செய்கிறது",
    "landing.builtFor": "ஆட்சேர்ப்பின் எதிர்காலத்திற்காக உருவாக்கப்பட்டது",
    "landing.statsGems": "மறைந்த ரத்தினங்கள் கண்டுபிடிக்கப்பட்டன",
    "landing.statsFaster": "வேகமான ஆட்சேர்ப்பு",
    "landing.statsTime": "சராசரி பகுப்பாய்வு நேரம்",
    "landing.featuresTitle": "முக்கிய சொல் பொருத்தத்திற்கு அப்பால்",
    "landing.featuresSubtitle": "ஆவணங்களை மட்டுமல்ல, மனிதர்களைப் புரிந்துகொள்ளும் மூன்று AI திறன்கள்.",
    "landing.feature1Title": "மறைந்த ரத்தின கண்டறிதல்",
    "landing.feature1Desc": "சுய-கற்ற டெவலப்பர்களை வெளிக்கொணர்கிறது.",
    "landing.feature2Title": "பாதை பகுப்பாய்வு",
    "landing.feature2Desc": "தொழில் வேகத்தை அளவிடுகிறது.",
    "landing.feature3Title": "வேலை சரிபார்ப்பு",
    "landing.feature3Desc": "ஒவ்வொரு ரெஸ்யூம் உரிமைகோரலையும் சரிபார்க்க தொழில்நுட்ப கேள்விகளை உருவாக்குகிறது.",
    "landing.howTitle": "Apex எப்படி வேலை செய்கிறது",
    "landing.step1Title": "உள்ளீடு & புரிதல்",
    "landing.step1Desc": "நீங்கள் ரெஸ்யூமை பதிவேற்றுகிறீர்கள். Apex உரையை பாகுபடுத்தி ஒவ்வொரு தொழில்நுட்ப உரிமைகோரலின் சூழலையும் பாதுகாக்கிறது.",
    "landing.step2Title": "பாதை பகுப்பாய்வு",
    "landing.step2Desc": "எங்கள் Gemini பைப்லைன் விண்ணப்பதாரரின் காலவரிசையை ஆராய்கிறது.",
    "landing.step3Title": "இயக்க சரிபார்ப்பு",
    "landing.step3Desc": "ஒவ்வொரு புள்ளிக்கும், Apex ஆழமான தொழில்நுட்ப கேள்விகளை உருவாக்குகிறது.",
    "landing.footer": "AI உடன் உருவாக்கப்பட்டது. மனிதர்களுக்காக.",
    "dash.title": "Apex கட்டளை மையம்",
    "dash.active": "நுண்ணறிவு அடுக்கு செயலில்",
    "dash.upload": "ரெஸ்யூம் பதிவேற்றம்",
    "dash.totalPool": "மொத்த குழு",
    "dash.hiddenGems": "மறைந்த ரத்தினங்கள்",
    "dash.avgProcessing": "சராசரி செயலாக்கம்",
    "dash.toggleHint": "உயர் பாதை விண்ணப்பதாரர்களை நிலைமாற்றவும்",
    "dash.recommended": "பரிந்துரைக்கப்பட்ட விண்ணப்பதாரர்கள்",
    "dash.aiCurated": "AI தொகுக்கப்பட்டது",
    "dash.role": "பங்கு",
    "dash.postJD": "வேலை விவரம் பதிவிடுங்கள்",
    "dash.noResults": "இந்த அளவுகோலுக்கு பொருந்தும் விண்ணப்பதாரர் இல்லை.",
    "upload.title": "விண்ணப்பதாரரை பகுப்பாய்வு செய்",
    "upload.subtitle": "ரெஸ்யூம் உரையை ஒட்டவும்.",
    "upload.placeholder": "ரெஸ்யூம் உரையை இங்கே ஒட்டவும்...",
    "upload.cancel": "ரத்துசெய்",
    "upload.analyze": "பகுப்பாய்வு",
    "upload.uploading": "கோப்பு பதிவேற்றப்படுகிறது...",
    "upload.analyzing": "Apex பகுப்பாய்வு செய்கிறது",
    "upload.analyzeHint": "பாதை மற்றும் திறன் கணக்கிடப்படுகிறது...",
    "upload.done": "பகுப்பாய்வு முடிந்தது",
    "upload.doneHint": "விண்ணப்பதாரர் குழுவில் சேர்க்கப்பட்டார்.",
    "jd.title": "வேலை விவரம் பதிவிடுங்கள்",
    "jd.subtitle": "JD ஒட்டவும், Apex தரவரிசைப்படுத்தும்.",
    "jd.placeholder": "வேலை விவரத்தை இங்கே ஒட்டவும்...",
    "jd.analyze": "சிறந்த பொருத்தங்களைக் கண்டறி",
    "jd.matching": "விண்ணப்பதாரர்கள் பொருத்தப்படுகிறார்கள்...",
    "jd.matchHint": "சிமேண்டிக் ஃபிட் பகுப்பாய்வு...",
    "pow.title": "டைனமிக் ப்ரூஃப் ஆஃப் வொர்க்",
    "pow.validating": "உரிமைகோரல் சரிபார்ப்பு:",
    "pow.generating": "Gemini தொழில்நுட்ப சரிபார்ப்பு கேள்விகளை உருவாக்குகிறது...",
    "pow.generated": "உருவாக்கப்பட்ட நேர்காணல் கேள்விகள்:",
    "pow.intent": "AI நோக்கம்",
    "pow.send": "விண்ணப்பதாரருக்கு மதிப்பீடு அனுப்பு",
    "pow.cancel": "ரத்துசெய்",
    "card.hiddenGem": "மறைந்த ரத்தினம்",
    "card.trajectory": "உயர் வேக பாதை",
    "card.viewProfile": "முழு சுயவிவரம் பார்",
    "card.experience": "அனுபவ சிறப்பம்சங்கள்",
    "card.validate": "உரிமைகோரலை சரிபார்",
    "card.matchScore": "பொருத்த மதிப்பெண்",
    "card.shortlisted": "தேர்வுப்பட்டியல்",
  },
  bn: {
    "landing.badge": "ইন্টেলিজেন্স লেয়ার সক্রিয়",
    "landing.headline1": "ফিল্টার করা বন্ধ করুন।",
    "landing.headline2": "বুঝতে শুরু করুন।",
    "landing.subheadline": "Apex ক্যারিয়ার ট্র্যাজেক্টরি পড়ে, AI দিয়ে দাবি যাচাই করে, এবং সেই উজ্জ্বল প্রার্থীদের খুঁজে বের করে যাদের প্রতিটি ATS ফিল্টার করে।",
    "landing.cta": "কমান্ড সেন্টারে প্রবেশ করুন",
    "landing.howItWorks": "কিভাবে কাজ করে",
    "landing.builtFor": "নিয়োগের ভবিষ্যতের জন্য তৈরি",
    "landing.statsGems": "হিডেন জেমস পাওয়া গেছে",
    "landing.statsFaster": "দ্রুত নিয়োগ",
    "landing.statsTime": "গড় বিশ্লেষণ সময়",
    "landing.featuresTitle": "কীওয়ার্ড ম্যাচিং-এর বাইরে",
    "landing.featuresSubtitle": "তিনটি AI-চালিত ক্ষমতা যা মানুষকে বোঝে, শুধু নথি নয়।",
    "landing.feature1Title": "হিডেন জেম ডিটেকশন",
    "landing.feature1Desc": "স্ব-শিক্ষিত ডেভেলপারদের খুঁজে বের করে।",
    "landing.feature2Title": "ট্র্যাজেক্টরি অ্যানালাইসিস",
    "landing.feature2Desc": "ক্যারিয়ার গতি পরিমাপ করে।",
    "landing.feature3Title": "প্রুফ অফ ওয়ার্ক ভ্যালিডেশন",
    "landing.feature3Desc": "প্রতিটি রেজ্যুমে দাবি যাচাই করতে প্রযুক্তিগত প্রশ্ন তৈরি করে।",
    "landing.howTitle": "Apex কিভাবে কাজ করে",
    "landing.step1Title": "ইনজেশন ও বোঝা",
    "landing.step1Desc": "আপনি রেজ্যুমে আপলোড করেন। Apex টেক্সট পার্স করে প্রতিটি প্রযুক্তিগত দাবির প্রসঙ্গ সংরক্ষণ করে।",
    "landing.step2Title": "ট্র্যাজেক্টরি অ্যানালাইসিস",
    "landing.step2Desc": "আমাদের Gemini পাইপলাইন প্রার্থীর টাইমলাইন বিশ্লেষণ করে।",
    "landing.step3Title": "ডাইনামিক ভ্যালিডেশন",
    "landing.step3Desc": "প্রতিটি বুলেট পয়েন্টের জন্য, Apex গভীর প্রযুক্তিগত প্রশ্ন তৈরি করে।",
    "landing.footer": "AI দিয়ে তৈরি। মানুষের জন্য।",
    "dash.title": "Apex কমান্ড সেন্টার",
    "dash.active": "ইন্টেলিজেন্স লেয়ার সক্রিয়",
    "dash.upload": "রেজ্যুমে আপলোড",
    "dash.totalPool": "মোট পুল",
    "dash.hiddenGems": "হিডেন জেমস",
    "dash.avgProcessing": "গড় প্রসেসিং",
    "dash.toggleHint": "উচ্চ ট্র্যাজেক্টরি প্রার্থী টগল করুন",
    "dash.recommended": "প্রস্তাবিত প্রার্থী",
    "dash.aiCurated": "AI কিউরেটেড",
    "dash.role": "ভূমিকা",
    "dash.postJD": "জব ডিস্ক্রিপশন পোস্ট করুন",
    "dash.noResults": "এই মানদণ্ডের সাথে মিলে যাওয়া কোনো প্রার্থী পাওয়া যায়নি।",
    "upload.title": "প্রার্থী বিশ্লেষণ",
    "upload.subtitle": "রেজ্যুমে টেক্সট পেস্ট করুন।",
    "upload.placeholder": "রেজ্যুমে টেক্সট এখানে পেস্ট করুন...",
    "upload.cancel": "বাতিল",
    "upload.analyze": "বিশ্লেষণ",
    "upload.uploading": "ফাইল আপলোড হচ্ছে...",
    "upload.analyzing": "Apex বিশ্লেষণ করছে",
    "upload.analyzeHint": "ট্র্যাজেক্টরি ও স্কিল গণনা হচ্ছে...",
    "upload.done": "বিশ্লেষণ সম্পূর্ণ",
    "upload.doneHint": "প্রার্থী পুলে যোগ করা হয়েছে।",
    "jd.title": "জব ডিস্ক্রিপশন পোস্ট করুন",
    "jd.subtitle": "JD পেস্ট করুন, Apex র‍্যাঙ্ক করবে।",
    "jd.placeholder": "জব ডিস্ক্রিপশন এখানে পেস্ট করুন...",
    "jd.analyze": "সেরা ম্যাচ খুঁজুন",
    "jd.matching": "প্রার্থী ম্যাচ হচ্ছে...",
    "jd.matchHint": "সিমেন্টিক ফিট বিশ্লেষণ...",
    "pow.title": "ডাইনামিক প্রুফ অফ ওয়ার্ক",
    "pow.validating": "দাবি যাচাই:",
    "pow.generating": "Gemini প্রযুক্তিগত যাচাই প্রশ্ন তৈরি করছে...",
    "pow.generated": "তৈরি ইন্টারভিউ প্রশ্ন:",
    "pow.intent": "AI উদ্দেশ্য",
    "pow.send": "প্রার্থীকে মূল্যায়ন পাঠান",
    "pow.cancel": "বাতিল",
    "card.hiddenGem": "হিডেন জেম",
    "card.trajectory": "উচ্চ গতি ট্র্যাজেক্টরি",
    "card.viewProfile": "সম্পূর্ণ প্রোফাইল দেখুন",
    "card.experience": "অভিজ্ঞতার হাইলাইটস",
    "card.validate": "দাবি যাচাই করুন",
    "card.matchScore": "ম্যাচ স্কোর",
    "card.shortlisted": "শর্টলিস্টেড",
  },
  te: {
    "landing.badge": "ఇంటెలిజెన్స్ లేయర్ యాక్టివ్",
    "landing.headline1": "ఫిల్టర్ చేయడం ఆపండి.",
    "landing.headline2": "అర్థం చేసుకోండి.",
    "landing.subheadline": "Apex కెరీర్ ట్రాజెక్టరీలను చదువుతుంది, AI తో క్లెయిమ్‌లను ధృవీకరిస్తుంది, ప్రతి ATS ఫిల్టర్ చేసే అద్భుతమైన అభ్యర్థులను వెలికితీస్తుంది.",
    "landing.cta": "కమాండ్ సెంటర్‌లో ప్రవేశించండి",
    "landing.howItWorks": "ఇది ఎలా పని చేస్తుంది",
    "landing.builtFor": "నియామకాల భవిష్యత్తు కోసం నిర్మించబడింది",
    "landing.statsGems": "హిడెన్ జెమ్స్ కనుగొనబడ్డాయి",
    "landing.statsFaster": "వేగవంతమైన నియామకం",
    "landing.statsTime": "సగటు విశ్లేషణ సమయం",
    "landing.featuresTitle": "కీవర్డ్ మ్యాచింగ్‌కు అతీతం",
    "landing.featuresSubtitle": "పత్రాలనే కాదు, మనుషులను అర్థం చేసుకునే మూడు AI సామర్థ్యాలు.",
    "landing.feature1Title": "హిడెన్ జెమ్ డిటెక్షన్",
    "landing.feature1Desc": "స్వయం-నేర్చుకున్న డెవలపర్లను వెలికితీస్తుంది.",
    "landing.feature2Title": "ట్రాజెక్టరీ అనాలిసిస్",
    "landing.feature2Desc": "కెరీర్ వేగాన్ని కొలుస్తుంది.",
    "landing.feature3Title": "ప్రూఫ్ ఆఫ్ వర్క్ వాలిడేషన్",
    "landing.feature3Desc": "ప్రతి రెజ్యూమే క్లెయిమ్‌ను ధృవీకరించడానికి సాంకేతిక ప్రశ్నలు రూపొందిస్తుంది.",
    "landing.howTitle": "Apex ఎలా పని చేస్తుంది",
    "landing.step1Title": "ఇన్‌జెషన్ & అవగాహన",
    "landing.step1Desc": "మీరు రెజ్యూమేను అప్‌లోడ్ చేస్తారు. Apex టెక్స్ట్‌ను పార్స్ చేసి ప్రతి సాంకేతిక క్లెయిమ్ యొక్క సందర్భాన్ని భద్రపరుస్తుంది.",
    "landing.step2Title": "ట్రాజెక్టరీ అనాలిసిస్",
    "landing.step2Desc": "మా Gemini పైప్‌లైన్ అభ్యర్థి టైమ్‌లైన్‌ను విశ్లేషిస్తుంది.",
    "landing.step3Title": "డైనమిక్ వాలిడేషన్",
    "landing.step3Desc": "ప్రతి బుల్లెట్ పాయింట్ కోసం, Apex లోతైన సాంకేతిక ప్రశ్నలు రూపొందిస్తుంది.",
    "landing.footer": "AI తో నిర్మించబడింది. మనుషుల కోసం.",
    "dash.title": "Apex కమాండ్ సెంటర్",
    "dash.active": "ఇంటెలిజెన్స్ లేయర్ యాక్టివ్",
    "dash.upload": "రెజ్యూమే అప్‌లోడ్",
    "dash.totalPool": "మొత్తం పూల్",
    "dash.hiddenGems": "హిడెన్ జెమ్స్",
    "dash.avgProcessing": "సగటు ప్రాసెసింగ్",
    "dash.toggleHint": "హై ట్రాజెక్టరీ అభ్యర్థులను టోగుల్ చేయండి",
    "dash.recommended": "సిఫార్సు చేయబడిన అభ్యర్థులు",
    "dash.aiCurated": "AI క్యూరేటెడ్",
    "dash.role": "పాత్ర",
    "dash.postJD": "జాబ్ డిస్క్రిప్షన్ పోస్ట్ చేయండి",
    "dash.noResults": "ఈ ప్రమాణానికి సరిపోయే అభ్యర్థి కనుగొనబడలేదు.",
    "upload.title": "అభ్యర్థిని విశ్లేషించండి",
    "upload.subtitle": "రెజ్యూమే టెక్స్ట్ పేస్ట్ చేయండి.",
    "upload.placeholder": "రెజ్యూమే టెక్స్ట్ ఇక్కడ పేస్ట్ చేయండి...",
    "upload.cancel": "రద్దు చేయి",
    "upload.analyze": "విశ్లేషించు",
    "upload.uploading": "ఫైల్ అప్‌లోడ్ అవుతోంది...",
    "upload.analyzing": "Apex విశ్లేషిస్తోంది",
    "upload.analyzeHint": "ట్రాజెక్టరీ & స్కిల్ లెక్కిస్తోంది...",
    "upload.done": "విశ్లేషణ పూర్తి",
    "upload.doneHint": "అభ్యర్థి పూల్‌లో చేర్చబడ్డారు.",
    "jd.title": "జాబ్ డిస్క్రిప్షన్ పోస్ట్ చేయండి",
    "jd.subtitle": "JD పేస్ట్ చేయండి, Apex ర్యాంక్ చేస్తుంది.",
    "jd.placeholder": "జాబ్ డిస్క్రిప్షన్ ఇక్కడ పేస్ట్ చేయండి...",
    "jd.analyze": "ఉత్తమ మ్యాచ్‌లు కనుగొనండి",
    "jd.matching": "అభ్యర్థులు మ్యాచ్ అవుతున్నారు...",
    "jd.matchHint": "సెమాంటిక్ ఫిట్ విశ్లేషణ...",
    "pow.title": "డైనమిక్ ప్రూఫ్ ఆఫ్ వర్క్",
    "pow.validating": "క్లెయిమ్ ధృవీకరణ:",
    "pow.generating": "Gemini సాంకేతిక ధృవీకరణ ప్రశ్నలు రూపొందిస్తోంది...",
    "pow.generated": "రూపొందించిన ఇంటర్వ్యూ ప్రశ్నలు:",
    "pow.intent": "AI ఉద్దేశం",
    "pow.send": "అభ్యర్థికి అంచనా పంపండి",
    "pow.cancel": "రద్దు చేయి",
    "card.hiddenGem": "హిడెన్ జెమ్",
    "card.trajectory": "హై వెలాసిటీ ట్రాజెక్టరీ",
    "card.viewProfile": "పూర్తి ప్రొఫైల్ చూడండి",
    "card.experience": "అనుభవ హైలైట్స్",
    "card.validate": "క్లెయిమ్ ధృవీకరించు",
    "card.matchScore": "మ్యాచ్ స్కోర్",
    "card.shortlisted": "షార్ట్‌లిస్టెడ్",
  },
};

export function t(key: keyof TranslationKeys, locale: Locale): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
