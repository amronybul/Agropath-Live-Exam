import { useState, useEffect, useCallback } from "react";

// ============================================================
// MOCK DATA
// ============================================================
const SUBJECTS_FIXED = [
  { id: "s1", name: "বাংলা গ্রামার", icon: "📝", color: "#f59e0b", bg: "#fffbeb" },
  { id: "s2", name: "ইংরেজি গ্রামার", icon: "🔤", color: "#3b82f6", bg: "#eff6ff" },
  { id: "s3", name: "ভকেবলারি", icon: "📚", color: "#8b5cf6", bg: "#faf5ff" },
  { id: "s4", name: "গণিত", icon: "🔢", color: "#10b981", bg: "#ecfdf5" },
];
const TODAY_ROTATING = { id: "s7", name: "বাংলা সাহিত্য", icon: "📖", color: "#ec4899", bg: "#fdf2f8" };

const MOCK_EXAM = {
  id: "exam_001",
  title: "দৈনিক পরীক্ষা — ২২ এপ্রিল ২০২৬",
  duration: 60 * 60, // 60 minutes in seconds
  subjects: [...SUBJECTS_FIXED, TODAY_ROTATING],
  questions: [
    // বাংলা গ্রামার
    { id: "q1", subjectId: "s1", text: "'বিদ্যালয়' শব্দটি কোন সন্ধির উদাহরণ?", options: ["স্বরসন্ধি", "ব্যঞ্জনসন্ধি", "বিসর্গসন্ধি", "নিপাতনে সিদ্ধ"], correct: 0 },
    { id: "q2", subjectId: "s1", text: "'রাজা' শব্দের স্ত্রীলিঙ্গ কোনটি?", options: ["রানী", "রাণী", "রাজ্ঞী", "রাজমহিষী"], correct: 2 },
    // ইংরেজি গ্রামার
    { id: "q3", subjectId: "s2", text: "She ___ in Dhaka since 2010.", options: ["lives", "lived", "has been living", "is living"], correct: 2 },
    { id: "q4", subjectId: "s2", text: "The passive voice of 'He wrote a letter' is:", options: ["A letter was written by him", "A letter is written by him", "A letter had been written", "A letter were written by him"], correct: 0 },
    // ভকেবলারি
    { id: "q5", subjectId: "s3", text: "What is the meaning of 'Ephemeral'?", options: ["Eternal", "Short-lived", "Ancient", "Powerful"], correct: 1 },
    { id: "q6", subjectId: "s3", text: "The antonym of 'Benevolent' is:", options: ["Generous", "Kind", "Malevolent", "Charitable"], correct: 2 },
    // গণিত
    { id: "q7", subjectId: "s4", text: "x² - 5x + 6 = 0 সমীকরণের মূল দুটি কত?", options: ["2 ও 3", "3 ও 4", "1 ও 6", "2 ও 4"], correct: 0 },
    { id: "q8", subjectId: "s4", text: "একটি বৃত্তের ব্যাসার্ধ ৭ সেমি হলে ক্ষেত্রফল কত?", options: ["154 বর্গ সেমি", "44 বর্গ সেমি", "22 বর্গ সেমি", "49 বর্গ সেমি"], correct: 0 },
    // বাংলা সাহিত্য
    { id: "q9", subjectId: "s7", text: "'আমার সোনার বাংলা' গানটি কে রচনা করেন?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], correct: 1 },
    { id: "q10", subjectId: "s7", text: "মুক্তিযুদ্ধভিত্তিক উপন্যাস 'একাত্তরের দিনগুলি' কার লেখা?", options: ["হুমায়ূন আহমেদ", "আনিসুল হক", "জাহানারা ইমাম", "সেলিনা হোসেন"], correct: 2 },
  ]
};

const MOCK_HISTORY = [
  { date: "২১ এপ্রিল", title: "দৈনিক পরীক্ষা — ২১ এপ্রিল", score: 74, total: 100, rank: 3, rotating: "ভূগোল" },
  { date: "২০ এপ্রিল", title: "দৈনিক পরীক্ষা — ২০ এপ্রিল", score: 68, total: 100, rank: 5, rotating: "বিজ্ঞান" },
  { date: "১৯ এপ্রিল", title: "দৈনিক পরীক্ষা — ১৯ এপ্রিল", score: 81, total: 100, rank: 2, rotating: "বাংলাদেশ বিষয়াবলী" },
];


// ============================================================
// LEADERBOARD DATA (daily, stored in localStorage in production)
// ============================================================
const TODAY_EXAM_DATE = "২৪ এপ্রিল ২০২৬";
const TODAY_ISO = "2026-04-24";
const EXAM_START_HOUR = 22; // রাত ১০টা
const EXAM_END_HOUR   = 23; // রাত ১১টা

// Mock leaderboard entries for today's exam
const MOCK_LB_TODAY = [
  { name:"সুমাইয়া খানম",  score:94, time:"48:12", correct:47, total:50, isMe:false },
  { name:"নাফিসা আক্তার",  score:88, time:"52:33", correct:44, total:50, isMe:false },
  { name:"রাফি আহমেদ",    score:82, time:"55:01", correct:41, total:50, isMe:false },
  { name:"করিম হোসেন",    score:80, time:"49:44", correct:40, total:50, isMe:false },
  { name:"আপনি",           score:74, time:"57:20", correct:37, total:50, isMe:true  },
  { name:"তামিম ইসলাম",   score:70, time:"58:05", correct:35, total:50, isMe:false },
  { name:"মারিয়া বেগম",   score:68, time:"59:30", correct:34, total:50, isMe:false },
  { name:"সাকিব হাসান",   score:64, time:"56:14", correct:32, total:50, isMe:false },
  { name:"রিয়া চৌধুরী",   score:60, time:"60:00", correct:30, total:50, isMe:false },
  { name:"ইমরান কবীর",    score:56, time:"53:22", correct:28, total:50, isMe:false },
];

// Exam schedule helpers
function getExamStatus() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const totalMin = h * 60 + m;
  const startMin = EXAM_START_HOUR * 60;
  const endMin   = EXAM_END_HOUR * 60;
  if (totalMin < startMin)         return "upcoming";  // আগে
  if (totalMin >= startMin && totalMin < endMin) return "live"; // চলছে
  return "ended";                                              // শেষ
}

function getCountdown() {
  const now = new Date();
  const target = new Date();
  target.setHours(EXAM_START_HOUR, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, Math.floor((target - now) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ============================================================
// ARCHAIC — পূর্বের পরীক্ষার আর্কাইভ
// ============================================================
const ARCHAIC_EXAMS = [
  {
    id: "arch_001",
    date: "২২ এপ্রিল ২০২৬",
    isoDate: "2026-04-22",
    title: "দৈনিক পরীক্ষা — ২২ এপ্রিল ২০২৬",
    rotating: { name: "বাংলা সাহিত্য", icon: "📖", color: "#ec4899" },
    totalQ: 10,
    avgScore: 74,
    participants: 342,
    questions: [
      { id:"aq1", subjectId:"s1", text:"'বিদ্যালয়' শব্দটি কোন সন্ধির উদাহরণ?", options:["স্বরসন্ধি","ব্যঞ্জনসন্ধি","বিসর্গসন্ধি","নিপাতনে সিদ্ধ"], correct:0, explanation:"বিদ্যা+আলয় = বিদ্যালয়। এখানে 'আ' ও 'আ' মিলে 'আ' হয়েছে — এটি স্বরসন্ধি।" },
      { id:"aq2", subjectId:"s1", text:"'রাজা' শব্দের স্ত্রীলিঙ্গ কোনটি?", options:["রানী","রাণী","রাজ্ঞী","রাজমহিষী"], correct:2, explanation:"রাজা শব্দের শুদ্ধ স্ত্রীলিঙ্গ হলো 'রাজ্ঞী'।" },
      { id:"aq3", subjectId:"s2", text:"She ___ in Dhaka since 2010.", options:["lives","lived","has been living","is living"], correct:2, explanation:"'Since' দিয়ে নির্দিষ্ট সময় থেকে এখন পর্যন্ত চলমান কাজ বোঝায় — তাই Present Perfect Continuous (has been living) ব্যবহার হয়।" },
      { id:"aq4", subjectId:"s2", text:"The passive voice of 'He wrote a letter' is:", options:["A letter was written by him","A letter is written by him","A letter had been written","A letter were written by him"], correct:0, explanation:"Simple Past Active → Simple Past Passive: Subject + was/were + V3 + by + Object।" },
      { id:"aq5", subjectId:"s3", text:"What is the meaning of 'Ephemeral'?", options:["Eternal","Short-lived","Ancient","Powerful"], correct:1, explanation:"Ephemeral অর্থ 'ক্ষণস্থায়ী' বা Short-lived। যেমন: 'ephemeral beauty' মানে ক্ষণিকের সৌন্দর্য।" },
      { id:"aq6", subjectId:"s3", text:"The antonym of 'Benevolent' is:", options:["Generous","Kind","Malevolent","Charitable"], correct:2, explanation:"Benevolent অর্থ দয়ালু/হিতৈষী। এর বিপরীত Malevolent অর্থ হিংসাত্মক/দুর্মতি।" },
      { id:"aq7", subjectId:"s4", text:"x² - 5x + 6 = 0 সমীকরণের মূল দুটি কত?", options:["2 ও 3","3 ও 4","1 ও 6","2 ও 4"], correct:0, explanation:"x² - 5x + 6 = (x-2)(x-3) = 0, তাই x = 2 বা x = 3।" },
      { id:"aq8", subjectId:"s4", text:"একটি বৃত্তের ব্যাসার্ধ ৭ সেমি হলে ক্ষেত্রফল কত?", options:["154 বর্গ সেমি","44 বর্গ সেমি","22 বর্গ সেমি","49 বর্গ সেমি"], correct:0, explanation:"বৃত্তের ক্ষেত্রফল = πr² = (22/7) × 7 × 7 = 154 বর্গ সেমি।" },
      { id:"aq9", subjectId:"s7", text:"'আমার সোনার বাংলা' গানটি কে রচনা করেন?", options:["কাজী নজরুল ইসলাম","রবীন্দ্রনাথ ঠাকুর","জীবনানন্দ দাশ","সুকান্ত ভট্টাচার্য"], correct:1, explanation:"'আমার সোনার বাংলা' রবীন্দ্রনাথ ঠাকুরের রচিত বাংলাদেশের জাতীয় সংগীত।" },
      { id:"aq10", subjectId:"s7", text:"'একাত্তরের দিনগুলি' কার লেখা?", options:["হুমায়ূন আহমেদ","আনিসুল হক","জাহানারা ইমাম","সেলিনা হোসেন"], correct:2, explanation:"'একাত্তরের দিনগুলি' জাহানারা ইমামের লেখা মুক্তিযুদ্ধভিত্তিক স্মৃতিকথামূলক গ্রন্থ।" },
    ],
  },
  {
    id: "arch_002",
    date: "২১ এপ্রিল ২০২৬",
    isoDate: "2026-04-21",
    title: "দৈনিক পরীক্ষা — ২১ এপ্রিল ২০২৬",
    rotating: { name: "ভূগোল", icon: "🗺️", color: "#84cc16" },
    totalQ: 10,
    avgScore: 68,
    participants: 298,
    questions: [
      { id:"bq1", subjectId:"s1", text:"'আকাশ' শব্দটি কোন লিঙ্গ?", options:["পুংলিঙ্গ","স্ত্রীলিঙ্গ","ক্লীবলিঙ্গ","উভয়লিঙ্গ"], correct:2, explanation:"আকাশ একটি জড় বস্তু, তাই এটি ক্লীবলিঙ্গ (নিরপেক্ষ লিঙ্গ)।" },
      { id:"bq2", subjectId:"s1", text:"'চাঁদমুখ' কোন ধরনের সমাস?", options:["তৎপুরুষ","কর্মধারয়","বহুব্রীহি","দ্বন্দ্ব"], correct:1, explanation:"চাঁদের মতো মুখ = চাঁদমুখ। উপমান কর্মধারয় সমাস।" },
      { id:"bq3", subjectId:"s2", text:"Choose the correct sentence:", options:["He is taller than I","He is more taller than me","He is taller than me","He is most tallest"], correct:0, explanation:"Comparative এ 'than' এর পর Subject Pronoun বসে formal English এ: 'than I'।" },
      { id:"bq4", subjectId:"s2", text:"'Habit' শব্দের adjective form কী?", options:["Habitual","Habitant","Habited","Habiting"], correct:0, explanation:"Habit (noun) → Habitual (adjective)। যেমন: habitual offender।" },
      { id:"bq5", subjectId:"s3", text:"What does 'Ameliorate' mean?", options:["Worsen","Improve","Destroy","Ignore"], correct:1, explanation:"Ameliorate মানে উন্নত করা বা Improve করা। যেমন: ameliorate living conditions।" },
      { id:"bq6", subjectId:"s3", text:"Synonym of 'Eloquent' is:", options:["Silent","Fluent","Rude","Shy"], correct:1, explanation:"Eloquent অর্থ বাগ্মী বা সুবক্তা। এর Synonym হলো Fluent (প্রাঞ্জল)।" },
      { id:"bq7", subjectId:"s4", text:"একটি সংখ্যার ৩৫% হলো ৭০। সংখ্যাটি কত?", options:["১৫০","১৮০","২০০","২৫০"], correct:2, explanation:"সংখ্যা × ৩৫/১০০ = ৭০, তাই সংখ্যা = ৭০ × ১০০/৩৫ = ২০০।" },
      { id:"bq8", subjectId:"s4", text:"একটি ট্রেন ৬০ কিমি/ঘণ্টা বেগে ৪ ঘণ্টায় কত দূরত্ব অতিক্রম করবে?", options:["২০০ কিমি","২৪০ কিমি","২৮০ কিমি","৩০০ কিমি"], correct:1, explanation:"দূরত্ব = গতি × সময় = ৬০ × ৪ = ২৪০ কিমি।" },
      { id:"bq9", subjectId:"s8", text:"বাংলাদেশের বৃহত্তম নদী কোনটি?", options:["পদ্মা","মেঘনা","যমুনা","ব্রহ্মপুত্র"], correct:1, explanation:"দৈর্ঘ্য ও প্রবাহের দিক থেকে মেঘনা বাংলাদেশের বৃহত্তম নদী।" },
      { id:"bq10", subjectId:"s8", text:"সুন্দরবন কোন জেলায় অবস্থিত?", options:["পটুয়াখালী","বরিশাল","খুলনা","সাতক্ষীরা"], correct:2, explanation:"সুন্দরবনের বাংলাদেশ অংশ মূলত খুলনা জেলায় অবস্থিত।" },
    ],
  },
  {
    id: "arch_003",
    date: "১৯ এপ্রিল ২০২৬",
    isoDate: "2026-04-19",
    title: "দৈনিক পরীক্ষা — ১৯ এপ্রিল ২০২৬",
    rotating: { name: "বাংলাদেশ বিষয়াবলী", icon: "🇧🇩", color: "#f97316" },
    totalQ: 10,
    avgScore: 81,
    participants: 315,
    questions: [
      { id:"cq1", subjectId:"s1", text:"'পাথর' শব্দটি কোন ভাষা থেকে আগত?", options:["আরবি","ফারসি","পর্তুগিজ","তৎসম"], correct:1, explanation:"'পাথর' শব্দটি ফারসি 'পাথর' থেকে বাংলায় এসেছে।" },
      { id:"cq2", subjectId:"s1", text:"বাংলা বর্ণমালায় মাত্রাহীন বর্ণ কতটি?", options:["৮টি","১০টি","১১টি","১২টি"], correct:1, explanation:"বাংলা বর্ণমালায় মাত্রাহীন বর্ণ মোট ১০টি: এ, ঐ, ও, ঔ, ঙ, ঞ, ৎ, ং, ঃ, ঁ।" },
      { id:"cq3", subjectId:"s2", text:"Which sentence is grammatically correct?", options:["I have went there","I have gone there","I had go there","I went gone there"], correct:1, explanation:"Have/has এর পর Past Participle বসে। 'go' এর Past Participle হলো 'gone'।" },
      { id:"cq4", subjectId:"s2", text:"'He is too weak to walk.' — এর অর্থ:", options:["সে হাঁটতে পারে","সে হাঁটতে পারে না","সে দ্রুত হাঁটে","সে হাঁটতে চায়"], correct:1, explanation:"'Too...to' structure অর্থ 'এত...যে...পারে না'। সে এত দুর্বল যে হাঁটতে পারে না।" },
      { id:"cq5", subjectId:"s3", text:"Synonym of 'Panacea' is:", options:["Disease","Cure-all","Problem","Disaster"], correct:1, explanation:"Panacea অর্থ সর্বরোগহর বা সর্বসমস্যার সমাধান (Cure-all)।" },
      { id:"cq6", subjectId:"s3", text:"'Gregarious' means:", options:["Lonely","Sociable","Aggressive","Timid"], correct:1, explanation:"Gregarious অর্থ সামাজিক বা দলপ্রিয় (Sociable)। যেমন: humans are gregarious beings।" },
      { id:"cq7", subjectId:"s4", text:"১ থেকে ১০০ পর্যন্ত সংখ্যাগুলোর যোগফল কত?", options:["৪৯৫০","৫০০০","৫০৫০","৫১০০"], correct:2, explanation:"সূত্র: n(n+1)/2 = 100×101/2 = 5050।" },
      { id:"cq8", subjectId:"s4", text:"একটি আয়তক্ষেত্রের দৈর্ঘ্য ১২ মি ও প্রস্থ ৮ মি হলে কর্ণের দৈর্ঘ্য কত?", options:["১০ মি","১৪ মি","১৫ মি","২০ মি"], correct:1, explanation:"কর্ণ = √(দৈর্ঘ্য²+প্রস্থ²) = √(144+64) = √208 ≈ 14.4 মি ≈ ১৪ মি।" },
      { id:"cq9", subjectId:"s5a", text:"বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?", options:["১৯৭১","১৯৭২","১৯৭৩","১৯৭৫"], correct:1, explanation:"বাংলাদেশের সংবিধান ১৯৭২ সালের ৪ নভেম্বর গণপরিষদে গৃহীত হয় এবং ১৬ ডিসেম্বর থেকে কার্যকর হয়।" },
      { id:"cq10", subjectId:"s5a", text:"বাংলাদেশে মোট উপজেলার সংখ্যা কতটি?", options:["৪৮৭","৪৯২","৪৯৫","৫০০"], correct:1, explanation:"বর্তমানে বাংলাদেশে মোট ৪৯৫টি উপজেলা রয়েছে।" },
    ],
  },
];

// আগামীকালের সিলেবাস (অ্যাডমিন থেকে পাবলিশ হলে দেখাবে)
const TOMORROW_SYLLABUS = {
  examDate: "2026-04-23",
  title: "দৈনিক পরীক্ষা — ২৩ এপ্রিল ২০২৬",
  rotating: { name: "বাংলা সাহিত্য", icon: "📖", color: "#ec4899" },
  note: "পরীক্ষার্থীদের বিশেষভাবে সমাস ও Tense মনোযোগ দিয়ে পড়তে বলা হচ্ছে।",
  subjects: [
    { name: "বাংলা গ্রামার", icon: "📝", color: "#f59e0b", bg: "#fffbeb", topics: ["সন্ধি", "কারক", "সমাস", "বাগধারা"], qCount: 10 },
    { name: "ইংরেজি গ্রামার", icon: "🔤", color: "#3b82f6", bg: "#eff6ff", topics: ["Tense", "Voice", "Narration", "Preposition"], qCount: 10 },
    { name: "ভকেবলারি", icon: "📚", color: "#8b5cf6", bg: "#faf5ff", topics: ["Synonyms", "Antonyms", "Idioms (A-C)"], qCount: 10 },
    { name: "গণিত", icon: "🔢", color: "#10b981", bg: "#ecfdf5", topics: ["সরল সুদ", "চক্রবৃদ্ধি সুদ", "লাভ-ক্ষতি"], qCount: 10 },
    { name: "বাংলা সাহিত্য", icon: "📖", color: "#ec4899", bg: "#fdf2f8", topics: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ"], qCount: 10, isRotating: true },
  ],
};

const LEADERBOARD = [
  { rank: 1, name: "সুমাইয়া খানম", score: 89, exams: 28, badge: "🥇" },
  { rank: 2, name: "নাফিসা আক্তার", score: 78.9, exams: 18, badge: "🥈" },
  { rank: 3, name: "রাফি আহমেদ", score: 72.5, exams: 12, badge: "🥉" },
  { rank: 4, name: "তানভীর হোসেন", score: 68.0, exams: 9, badge: null },
  { rank: 5, name: "আপনি", score: 74.3, exams: 7, badge: null, isMe: true },
  { rank: 6, name: "করিম হোসেন", score: 65.0, exams: 6, badge: null },
];

// ============================================================
// STYLES
// ============================================================
const S = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
body{background:#f5f4f0;color:#1a1a2e;font-family:'DM Sans',sans-serif;}

.app{min-height:100vh;background:#f5f4f0;}

/* Nav */
.nav{background:#fff;border-bottom:1px solid #e8e5e0;padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
.nav-logo{font-family:'Instrument Serif',serif;font-size:20px;color:#1a1a2e;}
.nav-logo span{color:#6366f1;}
.nav-links{display:flex;gap:4px;}
.nav-link{padding:7px 16px;border-radius:100px;border:none;background:none;font-size:13px;font-weight:500;cursor:pointer;color:#6b7280;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.nav-link:hover{background:#f5f4f0;color:#1a1a2e;}
.nav-link.active{background:#1a1a2e;color:#fff;}
.nav-right{display:flex;align-items:center;gap:10px;}
.sub-badge{padding:5px 12px;border-radius:100px;background:#ecfdf5;color:#059669;font-size:12px;font-weight:600;}
.user-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;}

/* Page */
.page{max-width:900px;margin:0 auto;padding:28px 20px;}

/* Hero */
.hero{background:linear-gradient(135deg,#1a1a2e,#2d2b55);border-radius:20px;padding:28px;margin-bottom:24px;color:#fff;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(99,102,241,0.15);}
.hero::after{content:'';position:absolute;bottom:-60px;right:60px;width:160px;height:160px;border-radius:50%;background:rgba(139,92,246,0.1);}
.hero-date{font-size:12px;font-weight:500;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.hero-title{font-family:'Instrument Serif',serif;font-size:26px;margin-bottom:6px;line-height:1.3;}
.hero-sub{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;}
.hero-meta{display:flex;gap:16px;flex-wrap:wrap;}
.hero-chip{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;background:rgba(255,255,255,0.08);font-size:12px;font-weight:500;color:rgba(255,255,255,0.7);}

/* Subject strips */
.subjects-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;}
.subj-pill{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:12px;font-size:12px;font-weight:600;border:1.5px solid transparent;}

/* Start card */
.start-card{background:#fff;border-radius:20px;padding:24px;border:1px solid #e8e5e0;margin-bottom:24px;}
.start-card-title{font-size:16px;font-weight:700;margin-bottom:4px;}
.start-card-sub{font-size:13px;color:#9ca3af;margin-bottom:20px;}
.start-btn{width:100%;padding:16px;border-radius:14px;border:none;background:#1a1a2e;color:#fff;font-size:16px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.start-btn:hover{background:#2d2b55;transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,26,46,0.25);}

/* Stats row */
.mini-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
.mini-stat{background:#fff;border-radius:14px;padding:16px;border:1px solid #e8e5e0;text-align:center;}
.mini-stat-val{font-size:24px;font-weight:800;letter-spacing:-1px;color:#1a1a2e;}
.mini-stat-lbl{font-size:11px;color:#9ca3af;margin-top:3px;font-weight:500;}

/* Card */
.card{background:#fff;border-radius:20px;border:1px solid #e8e5e0;overflow:hidden;margin-bottom:20px;}
.card-head{padding:16px 20px;border-bottom:1px solid #f3f0eb;display:flex;align-items:center;justify-content:space-between;}
.card-head-title{font-size:14px;font-weight:700;}
.card-body{padding:20px;}

/* Tabs */
.tabs{display:flex;gap:4px;padding:4px;background:#f5f4f0;border-radius:12px;margin-bottom:20px;}
.tab{flex:1;padding:9px;border-radius:8px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:500;color:#6b7280;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.tab.active{background:#fff;color:#1a1a2e;box-shadow:0 1px 4px rgba(0,0,0,0.08);}

/* History list */
.hist-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f3f0eb;}
.hist-item:last-child{border-bottom:none;}
.hist-icon{width:42px;height:42px;border-radius:12px;background:#f5f4f0;display:flex;align-items:center;justify-content:center;font-size:18px;}
.hist-info{flex:1;}
.hist-title{font-size:13px;font-weight:600;margin-bottom:2px;}
.hist-sub{font-size:11px;color:#9ca3af;}
.hist-score{text-align:right;}
.hist-score-val{font-size:18px;font-weight:800;color:#1a1a2e;}
.hist-rank{font-size:11px;color:#6366f1;font-weight:600;}

/* Leaderboard */
.lb-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;transition:background 0.1s;cursor:default;}
.lb-item:hover{background:#f9f8f6;}
.lb-item.me{background:#eff6ff;border:1px solid #bfdbfe;}
.lb-rank-box{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;}
.lb-r1{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;}
.lb-r2{background:linear-gradient(135deg,#9ca3af,#6b7280);color:#fff;}
.lb-r3{background:linear-gradient(135deg,#d97706,#b45309);color:#fff;}
.lb-rn{background:#f3f0eb;color:#6b7280;}
.lb-name{flex:1;font-size:13px;font-weight:600;}
.lb-exams{font-size:11px;color:#9ca3af;width:60px;text-align:center;}
.lb-avg{font-size:15px;font-weight:800;color:#6366f1;width:50px;text-align:right;}

/* Exam */
.exam-wrap{min-height:100vh;background:#f5f4f0;padding:16px;}
.exam-top{max-width:720px;margin:0 auto 20px;display:flex;align-items:center;justify-content:space-between;}
.exam-progress-info{display:flex;flex-direction:column;gap:2px;}
.exam-counter{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6366f1;}
.exam-subject-name{font-size:13px;color:#9ca3af;font-weight:400;}
.timer-pill{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#fff;border:1px solid #e8e5e0;box-shadow:0 1px 4px rgba(0,0,0,0.05);}
.timer-pill.urgent{border-color:#fecaca;background:#fef2f2;}
.timer-num{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-0.5px;color:#1a1a2e;}
.timer-num.urgent{color:#ef4444;}

.exam-prog-bar{max-width:720px;margin:0 auto 20px;height:3px;background:#e8e5e0;border-radius:100px;overflow:hidden;}
.exam-prog-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);transition:width 0.4s;}

.exam-card{max-width:720px;margin:0 auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #e8e5e0;}
.q-text{font-family:'Hind Siliguri',sans-serif;font-size:18px;line-height:1.7;color:#1a1a2e;margin-bottom:24px;font-weight:500;}
.opts{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}
.opt-btn{display:flex;align-items:center;gap:14px;padding:15px 18px;border-radius:12px;border:1.5px solid #e8e5e0;background:#fff;color:#374151;font-family:'Hind Siliguri',sans-serif;font-size:15px;cursor:pointer;text-align:left;transition:all 0.15s;line-height:1.5;}
.opt-btn:hover:not(:disabled){border-color:#6366f1;background:#fafbff;}
.opt-btn.selected{border-color:#6366f1;background:#eff6ff;color:#1d4ed8;}
.opt-btn.correct{border-color:#10b981;background:#f0fdf4;color:#065f46;}
.opt-btn.wrong{border-color:#ef4444;background:#fef2f2;color:#991b1b;}
.opt-label{width:30px;height:30px;border-radius:8px;background:#f5f4f0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;font-family:'DM Sans',sans-serif;}
.opt-label.active-lbl{background:#1a1a2e;color:#fff;}
.opt-label.correct-lbl{background:#10b981;color:#fff;}
.opt-label.wrong-lbl{background:#ef4444;color:#fff;}
.feedback{min-height:28px;margin-bottom:14px;font-family:'Hind Siliguri',sans-serif;font-size:14px;}
.fb-correct{color:#059669;font-weight:600;}
.fb-wrong{color:#dc2626;font-weight:600;}
.next-btn{width:100%;padding:14px;border-radius:12px;border:1px solid #e8e5e0;background:#f9f8f6;color:#374151;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
.next-btn:hover{background:#1a1a2e;color:#fff;border-color:#1a1a2e;}
.skip-btn{width:100%;padding:10px;border-radius:10px;border:none;background:none;color:#9ca3af;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:8px;transition:color 0.15s;}
.skip-btn:hover{color:#374151;}

/* Section divider in exam */
.section-divider{max-width:720px;margin:0 auto 16px;display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;}
.section-divider-text{font-size:13px;font-weight:600;color:#1d4ed8;}

/* Result */
.result-wrap{min-height:100vh;background:#f5f4f0;padding:24px 20px;}
.result-inner{max-width:640px;margin:0 auto;}
.result-hero{background:linear-gradient(135deg,#1a1a2e,#2d2b55);border-radius:24px;padding:32px;text-align:center;color:#fff;margin-bottom:20px;position:relative;overflow:hidden;}
.result-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(99,102,241,0.15);}
.result-emoji{font-size:56px;margin-bottom:12px;position:relative;z-index:1;}
.result-pct{font-size:64px;font-weight:900;letter-spacing:-3px;line-height:1;position:relative;z-index:1;}
.result-grade{font-size:18px;font-weight:600;opacity:0.7;margin-bottom:8px;position:relative;z-index:1;}
.result-title-text{font-family:'Instrument Serif',serif;font-size:22px;position:relative;z-index:1;}

.result-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
.rs{background:#fff;border-radius:14px;padding:14px;text-align:center;border:1px solid #e8e5e0;}
.rs-val{font-size:22px;font-weight:800;letter-spacing:-0.5px;}
.rs-lbl{font-size:10px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-top:3px;}

.subj-results{margin-bottom:20px;}
.sr-item{background:#fff;border-radius:14px;padding:14px 16px;border:1px solid #e8e5e0;margin-bottom:8px;}
.sr-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.sr-name{font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;}
.sr-score{font-size:14px;font-weight:800;color:#6366f1;}
.mini-bar{height:5px;background:#f3f0eb;border-radius:100px;overflow:hidden;}
.mini-fill{height:100%;border-radius:100px;}

.cta-row{display:flex;gap:10px;}
.cta-btn{flex:1;padding:14px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
.cta-primary{background:#1a1a2e;color:#fff;}
.cta-primary:hover{background:#2d2b55;transform:translateY(-1px);}
.cta-outline{background:#fff;color:#374151;border:1px solid #e8e5e0;}
.cta-outline:hover{border-color:#1a1a2e;color:#1a1a2e;}

/* Syllabus card */
.syl-card{background:#fff;border-radius:20px;border:1px solid #e8e5e0;overflow:hidden;margin-bottom:20px;}
.syl-banner{background:linear-gradient(135deg,#1a1a2e,#312e81);padding:20px;color:#fff;}
.syl-banner-date{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:4px;}
.syl-banner-title{font-family:'Hind Siliguri',sans-serif;font-size:18px;font-weight:700;margin-bottom:12px;}
.syl-rotating-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;background:rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.8);}
.syl-subjects{padding:16px 20px;display:flex;flex-direction:column;gap:10px;}
.syl-subject-row{border-radius:12px;padding:12px 14px;border:1px solid transparent;}
.syl-subject-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.syl-subject-name{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;}
.syl-qcount{font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;color:#fff;}
.syl-topics{display:flex;flex-wrap:wrap;gap:5px;}
.syl-topic-tag{font-size:11px;padding:3px 9px;border-radius:6px;font-weight:500;}
.syl-note{margin:0 20px 16px;padding:12px 14px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;font-size:13px;line-height:1.6;}
.syl-note-icon{margin-right:6px;}

@keyframes spin{to{transform:rotate(360deg);}}
.spinner{width:40px;height:40px;border-radius:50%;border:3px solid #e8e5e0;border-top-color:#6366f1;animation:spin 0.8s linear infinite;margin:40px auto;}
/* Review section */
.review-section-title{display:flex;align-items:center;gap:10px;padding:14px 20px;background:#f9f8f6;border-bottom:1px solid #e8e5e0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;}
.review-item{padding:20px;border-bottom:1px solid #f3f0eb;}
.review-item:last-child{border-bottom:none;}
.review-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;}
.review-q-text{font-size:15px;font-weight:500;line-height:1.7;color:#1a1a2e;flex:1;}
.review-status{flex-shrink:0;font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px;}
.review-status.correct{background:#ecfdf5;color:#059669;}
.review-status.wrong{background:#fef2f2;color:#dc2626;}
.review-status.skipped{background:#f1f5f9;color:#64748b;}
.review-opts{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;}
.review-opt{display:flex;align-items:flex-start;gap:10px;padding:9px 12px;border-radius:10px;font-size:13px;line-height:1.5;}
.review-opt.r-correct{background:#f0fdf4;border:1.5px solid #86efac;}
.review-opt.r-wrong{background:#fef2f2;border:1.5px solid #fca5a5;}
.review-opt.r-neutral{background:#f9f8f6;border:1px solid #e8e5e0;}
.review-opt-lbl{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px;}
.review-opt-lbl.lbl-correct{background:#10b981;color:#fff;}
.review-opt-lbl.lbl-wrong{background:#ef4444;color:#fff;}
.review-opt-lbl.lbl-neutral{background:#e2e8f0;color:#64748b;}
.review-explanation{display:flex;gap:8px;padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;font-size:12px;line-height:1.6;color:#78350f;}
.review-explanation-icon{font-size:14px;flex-shrink:0;margin-top:1px;}
.review-tabs{display:flex;gap:4px;background:#f1f5f9;border-radius:12px;padding:4px;margin-bottom:20px;}
.review-tab{flex:1;padding:9px;border-radius:8px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:500;color:#64748b;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.review-tab.active{background:#fff;color:#1a1a2e;box-shadow:0 1px 4px rgba(0,0,0,0.08);}
/* ── ARCHAIC ─────────────────────────────────────────────── */
.arch-page{min-height:100vh;background:#07070f;color:#e8e4f4;}
.arch-topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;position:sticky;top:0;z-index:50;background:rgba(7,7,15,0.9);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.05);}
.arch-topbar-logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(90deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.arch-back-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.arch-back-btn:hover{background:rgba(255,255,255,0.1);color:#fff;}
.arch-hero-section{padding:56px 28px 32px;max-width:860px;margin:0 auto;}
.arch-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.arch-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:#a78bfa;box-shadow:0 0 8px #a78bfa;}
.arch-eyebrow-text{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(167,139,250,0.7);font-weight:700;}
.arch-main-title{font-size:56px;font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:14px;background:linear-gradient(135deg,#fff 0%,rgba(167,139,250,0.6) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.arch-main-sub{font-size:14px;color:rgba(255,255,255,0.3);line-height:1.7;max-width:440px;margin-bottom:36px;}
.arch-stats-strip{display:flex;gap:40px;flex-wrap:wrap;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);}
.arch-strip-num{font-size:30px;font-weight:900;letter-spacing:-1px;color:#a78bfa;line-height:1;}
.arch-strip-lbl{font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;letter-spacing:0.3px;}
.arch-search-wrap{max-width:860px;margin:0 auto;padding:0 28px 20px;}
.arch-search-box{display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;transition:all 0.2s;}
.arch-search-box:focus-within{border-color:rgba(167,139,250,0.35);background:rgba(167,139,250,0.04);box-shadow:0 0 0 3px rgba(167,139,250,0.08);}
.arch-search-icon{font-size:15px;opacity:0.35;flex-shrink:0;}
.arch-search-input{flex:1;background:none;border:none;outline:none;font-size:14px;color:#e8e4f4;font-family:'DM Sans',sans-serif;}
.arch-search-input::placeholder{color:rgba(255,255,255,0.2);}
.arch-search-count{font-size:12px;color:rgba(255,255,255,0.2);white-space:nowrap;}
.arch-list{max-width:860px;margin:0 auto;padding:0 28px 60px;}
.arch-list-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.18);padding:0 0 12px;display:flex;align-items:center;gap:12px;}
.arch-list-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.05);}
.arch-item{display:grid;grid-template-columns:32px 140px 1px 1fr auto auto;align-items:center;gap:20px;padding:18px 20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:14px;margin-bottom:6px;transition:all 0.2s;position:relative;overflow:hidden;cursor:default;}
.arch-item::after{content:'';position:absolute;left:0;top:12px;bottom:12px;width:2px;border-radius:2px;background:linear-gradient(180deg,#a78bfa,#22d3ee);opacity:0;transition:opacity 0.2s;}
.arch-item:hover{background:rgba(255,255,255,0.04);border-color:rgba(167,139,250,0.18);transform:translateX(3px);}
.arch-item:hover::after{opacity:1;}
.arch-item-idx{font-size:12px;font-weight:800;color:rgba(255,255,255,0.12);text-align:center;font-variant-numeric:tabular-nums;}
.arch-item-date-col{display:flex;flex-direction:column;}
.arch-item-date{font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);}
.arch-item-weekday{font-size:10px;color:rgba(255,255,255,0.22);margin-top:3px;letter-spacing:0.3px;}
.arch-item-rule{width:1px;height:28px;background:rgba(255,255,255,0.06);}
.arch-item-body{min-width:0;}
.arch-item-title{font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);margin-bottom:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.arch-item-tags{display:flex;gap:5px;flex-wrap:wrap;}
.arch-item-tag{display:flex;align-items:center;gap:3px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;border:1px solid;white-space:nowrap;}
.arch-item-score-col{text-align:right;}
.arch-item-score{font-size:22px;font-weight:900;letter-spacing:-0.5px;line-height:1;}
.arch-item-score-lbl{font-size:9px;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
.arch-item-btns{display:flex;gap:6px;flex-shrink:0;}
.arch-btn{padding:8px 14px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap;border:none;}
.arch-btn-view{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.09);}
.arch-btn-view:hover{background:rgba(255,255,255,0.1);color:#fff;}
.arch-btn-practice{background:linear-gradient(135deg,rgba(109,40,217,0.8),rgba(8,145,178,0.8));color:#fff;border:1px solid rgba(167,139,250,0.3);}
.arch-btn-practice:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(109,40,217,0.35);}
.arch-empty-state{padding:80px 28px;text-align:center;}
.arch-empty-ring{width:90px;height:90px;border-radius:50%;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:34px;}
.arch-empty-title{font-size:16px;font-weight:700;color:rgba(255,255,255,0.3);margin-bottom:6px;}
.arch-empty-sub{font-size:13px;color:rgba(255,255,255,0.15);}
/* Detail view */
.arch-detail-page{min-height:100vh;background:#07070f;color:#e8e4f4;}
.arch-detail-banner{background:linear-gradient(160deg,rgba(109,40,217,0.15) 0%,rgba(8,145,178,0.08) 100%);border-bottom:1px solid rgba(255,255,255,0.06);padding:32px 28px;}
.arch-detail-banner-inner{max-width:860px;margin:0 auto;}
.arch-detail-date-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:100px;background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.18);font-size:10px;font-weight:700;color:#c4b5fd;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;}
.arch-detail-title{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#fff;margin-bottom:20px;}
.arch-detail-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
.arch-detail-chip{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);font-size:12px;color:rgba(255,255,255,0.55);}
.arch-detail-btns{display:flex;gap:8px;}
.arch-detail-body{max-width:860px;margin:0 auto;padding:32px 28px 80px;}
.arch-subj-block{margin-bottom:36px;}
.arch-subj-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);}
.arch-subj-icon-box{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;}
.arch-subj-name{font-size:13px;font-weight:700;letter-spacing:0.2px;}
.arch-subj-count{font-size:11px;color:rgba(255,255,255,0.25);margin-left:auto;}
.arch-q-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin-bottom:8px;transition:border-color 0.2s;}
.arch-q-card:hover{border-color:rgba(167,139,250,0.18);}
.arch-q-num{font-size:9px;font-weight:700;color:rgba(167,139,250,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.arch-q-text{font-size:15px;font-weight:500;line-height:1.7;color:rgba(255,255,255,0.88);margin-bottom:16px;}
.arch-q-opts{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;}
.arch-q-opt{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;border:1px solid;}
.arch-q-opt.ao-correct{background:rgba(16,185,129,0.07);border-color:rgba(16,185,129,0.2);}
.arch-q-opt.ao-neutral{background:rgba(255,255,255,0.015);border-color:rgba(255,255,255,0.05);}
.arch-q-lbl{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.arch-q-lbl.aql-correct{background:#10b981;color:#fff;}
.arch-q-lbl.aql-neutral{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.25);}
.arch-q-opt-text{flex:1;font-size:13px;line-height:1.5;}
.arch-q-opt-text.aot-correct{color:#34d399;font-weight:600;}
.arch-q-opt-text.aot-neutral{color:rgba(255,255,255,0.5);}
.arch-correct-tag{font-size:10px;font-weight:700;color:#10b981;background:rgba(16,185,129,0.08);padding:2px 8px;border-radius:100px;border:1px solid rgba(16,185,129,0.18);white-space:nowrap;flex-shrink:0;}
.arch-expl{display:flex;gap:10px;padding:12px 16px;background:rgba(251,191,36,0.04);border:1px solid rgba(251,191,36,0.12);border-radius:10px;}
.arch-expl-icon{font-size:13px;flex-shrink:0;margin-top:2px;opacity:0.8;}
.arch-expl-text{font-size:12px;line-height:1.7;color:rgba(251,191,36,0.75);}
/* Confirm modal */
.arch-confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;}
.arch-confirm-box{background:#0e0e1e;border:1px solid rgba(255,255,255,0.09);border-radius:24px;padding:32px;max-width:380px;width:100%;box-shadow:0 40px 80px rgba(0,0,0,0.6);}
.arch-confirm-icon-wrap{width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,rgba(109,40,217,0.3),rgba(8,145,178,0.2));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;}
.arch-confirm-title{font-size:18px;font-weight:800;letter-spacing:-0.3px;color:#fff;text-align:center;margin-bottom:8px;}
.arch-confirm-sub{font-size:13px;color:rgba(255,255,255,0.35);text-align:center;line-height:1.6;margin-bottom:28px;}
.arch-confirm-exam-name{font-size:13px;font-weight:600;color:rgba(167,139,250,0.8);text-align:center;margin-bottom:24px;padding:10px 16px;background:rgba(167,139,250,0.06);border-radius:10px;border:1px solid rgba(167,139,250,0.12);}
.arch-confirm-actions{display:flex;gap:10px;}
.arch-confirm-cancel{flex:1;padding:13px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.5);font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
.arch-confirm-cancel:hover{background:rgba(255,255,255,0.06);color:#fff;}
.arch-confirm-go{flex:1;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#6d28d9,#0891b2);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
.arch-confirm-go:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(109,40,217,0.4);}
/* ── SUBJECT PICKER ─────────────────────────────────── */
.subj-picker-wrap{min-height:100vh;background:#f5f4f0;display:flex;flex-direction:column;}
.subj-picker-top{background:#fff;border-bottom:1px solid #e8e5e0;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
.subj-picker-title{font-size:15px;font-weight:700;color:#1a1a2e;}
.subj-picker-body{flex:1;max-width:640px;width:100%;margin:0 auto;padding:28px 20px;}
.subj-picker-intro{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:28px;}
.subj-picker-grid{display:flex;flex-direction:column;gap:10px;margin-bottom:32px;}
.subj-pick-card{display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;border:2px solid #e8e5e0;background:#fff;cursor:pointer;transition:all 0.18s;position:relative;}
.subj-pick-card:hover{border-color:#6366f1;transform:translateX(4px);box-shadow:0 4px 16px rgba(99,102,241,0.1);}
.subj-pick-card.spc-selected{border-color:currentColor;transform:translateX(4px);}
.subj-pick-card.spc-done{opacity:0.55;cursor:default;transform:none;}
.subj-pick-card.spc-done:hover{border-color:#e8e5e0;box-shadow:none;transform:none;}
.subj-pick-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
.subj-pick-info{flex:1;}
.subj-pick-name{font-size:15px;font-weight:700;margin-bottom:3px;}
.subj-pick-meta{font-size:12px;color:#9ca3af;}
.subj-pick-status{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:700;flex-shrink:0;}
.sps-pending{background:#f1f5f9;color:#64748b;}
.sps-done{background:#ecfdf5;color:#059669;}
.sps-active{color:#fff;background:#6366f1;}
.subj-order-badge{position:absolute;top:-8px;left:16px;width:22px;height:22px;border-radius:50%;background:#6366f1;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(99,102,241,0.4);}

/* Exam with subject panel */
.exam-outer{display:flex;min-height:100vh;background:#f5f4f0;}
.exam-side{width:240px;background:#1a1a2e;flex-shrink:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
.exam-side-header{padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.06);}
.exam-side-title{font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px;}
.exam-side-timer{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;font-variant-numeric:tabular-nums;}
.exam-side-timer.urgent{color:#f87171;}
.exam-side-progress{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);}
.exam-side-prog-bar{height:3px;background:rgba(255,255,255,0.08);border-radius:100px;margin-bottom:6px;overflow:hidden;}
.exam-side-prog-fill{height:100%;background:linear-gradient(90deg,#6366f1,#06b6d4);border-radius:100px;transition:width 0.4s;}
.exam-side-prog-text{font-size:11px;color:rgba(255,255,255,0.3);}
.exam-side-subjects{padding:12px 10px;flex:1;}
.exam-side-subj{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;margin-bottom:4px;cursor:pointer;transition:all 0.15s;}
.exam-side-subj:hover{background:rgba(255,255,255,0.06);}
.exam-side-subj.ess-active{background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.3);}
.exam-side-subj.ess-done{opacity:0.45;}
.exam-side-subj-icon{font-size:16px;width:20px;text-align:center;}
.exam-side-subj-name{font-size:12px;font-weight:500;color:rgba(255,255,255,0.7);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.exam-side-subj.ess-active .exam-side-subj-name{color:#fff;font-weight:700;}
.exam-side-subj-check{font-size:12px;}
.exam-main{flex:1;display:flex;flex-direction:column;min-width:0;}
.exam-main-top{background:#fff;border-bottom:1px solid #e8e5e0;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40;}
.exam-main-subj{display:flex;align-items:center;gap:8px;}
.exam-main-subj-badge{padding:5px 14px;border-radius:100px;font-size:13px;font-weight:700;border:1.5px solid;}
.exam-main-qcount{font-size:13px;color:#9ca3af;}
.exam-main-body{flex:1;padding:24px;max-width:680px;width:100%;margin:0 auto;}
@media(max-width:640px){.exam-outer{flex-direction:column;}.exam-side{width:100%;height:auto;position:relative;flex-direction:row;flex-wrap:wrap;}.exam-side-header,.exam-side-progress{flex-shrink:0;}.exam-side-subjects{display:flex;flex-direction:row;flex-wrap:wrap;gap:4px;padding:8px;}.exam-side-subj{margin-bottom:0;}.exam-side-subj-name{display:none;}.exam-main-body{padding:16px;}}

/* Leaderboard page */
.lb-page{background:#f5f4f0;min-height:calc(100vh - 60px);padding:0 0 40px;}
.lb-hero{background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:28px 20px;color:#fff;position:relative;overflow:hidden;}
.lb-hero::after{content:'🏆';position:absolute;right:-10px;top:-10px;font-size:120px;opacity:0.06;}
.lb-hero-eyebrow{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:6px;}
.lb-hero-title{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;}
.lb-hero-sub{font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:18px;}
.lb-status-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.lb-status-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;font-size:12px;font-weight:700;border:1px solid;}
.lb-pill-live{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);color:#fca5a5;}
.lb-pill-upcoming{background:rgba(250,204,21,0.1);border-color:rgba(250,204,21,0.3);color:#fde68a;}
.lb-pill-ended{background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.3);color:#6ee7b7;}
.lb-live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.lb-countdown-box{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 18px;margin-top:14px;display:inline-flex;align-items:center;gap:10px;}
.lb-countdown-label{font-size:11px;color:rgba(255,255,255,0.4);}
.lb-countdown-val{font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px;font-variant-numeric:tabular-nums;}
.lb-my-rank-bar{max-width:860px;margin:0 auto;}
.lb-my-rank-card{background:#fff;border-radius:16px;padding:16px 20px;margin:16px 20px;border:2px solid #6366f1;display:flex;align-items:center;gap:14px;}
.lb-my-rank-num{font-size:28px;font-weight:900;color:#6366f1;letter-spacing:-1px;width:48px;text-align:center;}
.lb-my-rank-info{flex:1;}
.lb-my-rank-name{font-size:14px;font-weight:700;color:#1a1a2e;}
.lb-my-rank-score{font-size:12px;color:#9ca3af;margin-top:2px;}
.lb-my-rank-score strong{color:#6366f1;}
.lb-my-rank-badge{padding:4px 12px;border-radius:100px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;}
.lb-table-wrap{max-width:860px;margin:0 auto;padding:0 20px;}
.lb-table-header{display:flex;align-items:center;gap:10px;padding:10px 16px;margin-bottom:8px;}
.lb-table-header-text{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;}
.lb-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border-radius:14px;margin-bottom:6px;border:1px solid #f0eef0;transition:all 0.15s;}
.lb-row:hover{border-color:#e0e7ff;transform:translateX(2px);}
.lb-row.lb-row-me{border-color:#6366f1;border-width:2px;background:#fafbff;}
.lb-row.lb-row-1{background:linear-gradient(135deg,#fffbeb,#fff);border-color:#fbbf24;}
.lb-row.lb-row-2{background:linear-gradient(135deg,#f8fafc,#fff);border-color:#cbd5e1;}
.lb-row.lb-row-3{background:linear-gradient(135deg,#fff7ed,#fff);border-color:#d97706;}
.lb-rank-medal{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;flex-shrink:0;}
.lb-medal-1{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;box-shadow:0 3px 8px rgba(251,191,36,0.35);}
.lb-medal-2{background:linear-gradient(135deg,#9ca3af,#6b7280);color:#fff;box-shadow:0 3px 8px rgba(107,114,128,0.25);}
.lb-medal-3{background:linear-gradient(135deg,#d97706,#b45309);color:#fff;box-shadow:0 3px 8px rgba(217,119,6,0.3);}
.lb-medal-n{background:#f1f5f9;color:#64748b;font-size:14px;}
.lb-row-name{flex:1;font-size:14px;font-weight:700;color:#1a1a2e;}
.lb-row-name.lb-me-name{color:#3730a3;}
.lb-row-details{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
.lb-row-score{font-size:18px;font-weight:900;color:#1a1a2e;letter-spacing:-0.5px;}
.lb-row-meta{font-size:11px;color:#9ca3af;}
.lb-row-bar{width:80px;height:4px;background:#f1f5f9;border-radius:100px;overflow:hidden;margin-top:2px;}
.lb-row-bar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#6366f1,#06b6d4);}
.lb-pending-state{padding:40px 20px;text-align:center;}
.lb-pending-icon{font-size:48px;margin-bottom:12px;}
.lb-pending-title{font-size:16px;font-weight:700;color:#374151;margin-bottom:6px;}
.lb-pending-sub{font-size:13px;color:#9ca3af;line-height:1.6;}

@media(max-width:640px){.arch-item{grid-template-columns:1fr;gap:10px;}.arch-item-rule,.arch-item-idx{display:none;}.arch-item-date-col{flex-direction:row;gap:8px;align-items:center;}.arch-main-title{font-size:36px;}}

`;

// ============================================================
// COMPONENTS
// ============================================================
// ============================================================
// LEADERBOARD TAB COMPONENT
// ============================================================
function LeaderboardTab() {
  const [status] = useState(getExamStatus); // upcoming | live | ended
  const [countdown, setCountdown] = useState(getCountdown());
  const [lbData] = useState(MOCK_LB_TODAY);

  // Live countdown
  useEffect(() => {
    if (status === "ended") return;
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Sort by score desc (already sorted in mock, but ensure)
  const sorted = [...lbData].sort((a, b) => b.score - a.score || a.time.localeCompare(b.time));
  const myEntry = sorted.find(e => e.isMe);
  const myRank  = myEntry ? sorted.indexOf(myEntry) + 1 : null;

  const maxScore = sorted[0]?.score || 100;

  return (
    <div className="lb-page">
      {/* Hero */}
      <div className="lb-hero">
        <div className="lb-hero-eyebrow">Daily Exam · {TODAY_EXAM_DATE}</div>
        <div className="lb-hero-title bn">{MOCK_EXAM.title}</div>
        <div className="lb-hero-sub bn">
          পরীক্ষার সময়: রাত ১০:০০ — রাত ১১:০০
        </div>
        <div className="lb-status-row">
          {status === "live" && (
            <div className="lb-status-pill lb-pill-live">
              <div className="lb-live-dot" />
              <span className="bn">পরীক্ষা চলছে</span>
            </div>
          )}
          {status === "upcoming" && (
            <div className="lb-status-pill lb-pill-upcoming">
              ⏰ <span className="bn">পরীক্ষা শুরু হয়নি</span>
            </div>
          )}
          {status === "ended" && (
            <div className="lb-status-pill lb-pill-ended">
              ✅ <span className="bn">পরীক্ষা সম্পন্ন</span>
            </div>
          )}
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }} className="bn">
            {sorted.length} জন অংশগ্রহণ করেছেন
          </div>
        </div>

        {/* Countdown if upcoming */}
        {status === "upcoming" && (
          <div className="lb-countdown-box">
            <div className="lb-countdown-label bn">শুরুতে আর</div>
            <div className="lb-countdown-val">{countdown}</div>
          </div>
        )}
      </div>

      {/* My rank card */}
      {status === "ended" && myEntry && myRank && (
        <div style={{ padding:"0 20px" }}>
          <div className="lb-my-rank-card">
            <div className="lb-my-rank-num">#{myRank}</div>
            <div className="lb-my-rank-info">
              <div className="lb-my-rank-name bn">আপনার অবস্থান</div>
              <div className="lb-my-rank-score bn">
                স্কোর: <strong>{myEntry.score}</strong>/{myEntry.total} · সময়: {myEntry.time}
              </div>
            </div>
            <div className="lb-my-rank-badge bn">
              {myRank === 1 ? "🥇 শীর্ষে" : myRank <= 3 ? "🏅 শীর্ষ ৩" : `#${myRank} অবস্থান`}
            </div>
          </div>
        </div>
      )}

      {/* Main leaderboard */}
      {status === "ended" ? (
        <div className="lb-table-wrap" style={{ marginTop:8 }}>
          <div className="lb-table-header">
            <div className="lb-table-header-text">র‍্যাংকিং — {TODAY_EXAM_DATE}</div>
          </div>
          {sorted.map((entry, i) => {
            const rank = i + 1;
            const barW = Math.round((entry.score / maxScore) * 100);
            const medalCls = rank===1?"lb-medal-1":rank===2?"lb-medal-2":rank===3?"lb-medal-3":"lb-medal-n";
            const rowCls = `lb-row ${rank===1?"lb-row-1":rank===2?"lb-row-2":rank===3?"lb-row-3":""} ${entry.isMe?"lb-row-me":""}`;
            const medal = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":rank;
            return (
              <div key={i} className={rowCls}>
                <div className={`lb-rank-medal ${medalCls}`}>{medal}</div>
                <div className="lb-row-name bn" style={entry.isMe?{color:"#3730a3"}:{}}>
                  {entry.name}
                  {entry.isMe && (
                    <span style={{ marginLeft:6, fontSize:10, background:"#eff6ff", color:"#2563eb", borderRadius:100, padding:"1px 7px", fontFamily:"'DM Sans',sans-serif" }}>আপনি</span>
                  )}
                </div>
                <div className="lb-row-details">
                  <div className="lb-row-score">{entry.score}</div>
                  <div className="lb-row-meta bn">{entry.correct}/{entry.total} · {entry.time}</div>
                  <div className="lb-row-bar">
                    <div className="lb-row-bar-fill" style={{ width:`${barW}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : status === "live" ? (
        <div className="lb-pending-state">
          <div className="lb-pending-icon">⏳</div>
          <div className="lb-pending-title bn">পরীক্ষা চলছে</div>
          <div className="lb-pending-sub bn">
            পরীক্ষা শেষ হলে (রাত ১১:০০) এখানে আজকের লিডারবোর্ড দেখাবে।<br/>
            এই মুহূর্তে পরীক্ষা দিতে থাকুন!
          </div>
        </div>
      ) : (
        <div className="lb-pending-state">
          <div className="lb-pending-icon">🌙</div>
          <div className="lb-pending-title bn">পরীক্ষা শুরু হয়নি</div>
          <div className="lb-pending-sub bn">
            আজকের পরীক্ষা রাত ১০:০০ টায় শুরু হবে।<br/>
            পরীক্ষা শেষে এখানে আজকের লিডারবোর্ড দেখাবে।
          </div>
        </div>
      )}
    </div>
  );
}

function HomePage({ onStart, doneTodayFlag }) {
  const [tab, setTab] = useState("syllabus");
  const allSubjects = [...SUBJECTS_FIXED, TODAY_ROTATING];

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-date">বুধবার, ২২ এপ্রিল ২০২৬</div>
        <div className="hero-title" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আজকের দৈনিক পরীক্ষা প্রস্তুত</div>
        <div className="hero-sub" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আজকের রোটেটিং বিষয়: <strong>বাংলা সাহিত্য</strong></div>
        <div className="hero-meta">
          <div className="hero-chip">📋 ৫০টি প্রশ্ন</div>
          <div className="hero-chip">⏱ ৬০ মিনিট</div>
          <div className="hero-chip">📊 নেগেটিভ মার্কিং নেই</div>
        </div>
      </div>

      <div className="subjects-row">
        {allSubjects.map(s => (
          <div key={s.id} className="subj-pill" style={{ background: s.bg, color: s.color, borderColor: s.color + "40" }}>
            {s.icon} <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: 12 }}>{s.name}</span>
            {s.id === TODAY_ROTATING.id && <span style={{ fontSize: 10, background: s.color, color: "#fff", borderRadius: 100, padding: "1px 6px" }}>আজকের</span>}
          </div>
        ))}
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-val">৭</div>
          <div className="mini-stat-lbl" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষা দিয়েছি</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-val" style={{ color: "#6366f1" }}>৭৪%</div>
          <div className="mini-stat-lbl" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>গড় স্কোর</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-val" style={{ color: "#f59e0b" }}>#৫</div>
          <div className="mini-stat-lbl" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>লিডারবোর্ড</div>
        </div>
      </div>

      <div className="start-card">
        <div className="start-card-title" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষা শুরু করার আগে</div>
        <div className="start-card-sub" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>নিরিবিলি জায়গায় বসুন। পরীক্ষা শুরু হলে আর থামানো যাবে না।</div>
        <button className="start-btn" onClick={!doneTodayFlag ? onStart : undefined} style={{ opacity: doneTodayFlag ? 0.5 : 1, cursor: doneTodayFlag ? "not-allowed" : "pointer" }}>
          <span>▶</span>
          <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{doneTodayFlag ? "আজকের পরীক্ষা দেওয়া হয়েছে" : "পরীক্ষা শুরু করুন"}</span>
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "syllabus" ? "active" : ""}`} onClick={() => setTab("syllabus")} style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>📋 আগামীকালের সিলেবাস</button>
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")} style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষার ইতিহাস</button>
        <button className={`tab ${tab === "leaderboard" ? "active" : ""}`} onClick={() => setTab("leaderboard")} style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>লিডারবোর্ড</button>
      </div>

      {tab === "syllabus" && (
        <div className="syl-card">
          <div className="syl-banner">
            <div className="syl-banner-date">আগামীকালের পরীক্ষা · {TOMORROW_SYLLABUS.examDate}</div>
            <div className="syl-banner-title">{TOMORROW_SYLLABUS.title}</div>
            <div className="syl-rotating-chip">
              {TOMORROW_SYLLABUS.rotating.icon} আজকের রোটেটিং বিষয়: {TOMORROW_SYLLABUS.rotating.name}
            </div>
          </div>
          <div className="syl-subjects">
            {TOMORROW_SYLLABUS.subjects.map((s, i) => (
              <div key={i} className="syl-subject-row" style={{ background: s.bg, borderColor: s.color + "30" }}>
                <div className="syl-subject-head">
                  <div className="syl-subject-name" style={{ color: s.color }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{s.name}</span>
                    {s.isRotating && <span style={{ fontSize: 10, background: s.color, color: "#fff", borderRadius: 100, padding: "1px 7px", fontFamily: "'DM Sans', sans-serif" }}>রোটেটিং</span>}
                  </div>
                  <span className="syl-qcount" style={{ background: s.color }}>{s.qCount}টি প্রশ্ন</span>
                </div>
                <div className="syl-topics">
                  {s.topics.map((t, j) => (
                    <span key={j} className="syl-topic-tag" style={{ background: s.color + "18", color: s.color }} className="bn">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {TOMORROW_SYLLABUS.note && (
            <div className="syl-note">
              <span className="syl-note-icon">💬</span>
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{TOMORROW_SYLLABUS.note}</span>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <div className="card-head"><div className="card-head-title" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>সাম্প্রতিক পরীক্ষাসমূহ</div></div>
          <div className="card-body" style={{ padding: "8px 20px" }}>
            {MOCK_HISTORY.map((h, i) => (
              <div key={i} className="hist-item">
                <div className="hist-icon">📝</div>
                <div className="hist-info">
                  <div className="hist-title" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{h.title}</div>
                  <div className="hist-sub" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>রোটেটিং: {h.rotating} · {h.date}</div>
                </div>
                <div className="hist-score">
                  <div className="hist-score-val">{h.score}<span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>/{h.total}</span></div>
                  <div className="hist-rank">র‍্যাংক #{h.rank}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "leaderboard" && <LeaderboardTab />}
    </div>
  );
}

function ExamPage({ examData, onFinish }) {
  const examSource = examData || MOCK_EXAM;
  const allQuestions = examSource.questions;

  // Build unique subjects in exam order
  const ALL_SUBJS = [...SUBJECTS_FIXED, TODAY_ROTATING,
    { id:"s5a", name:"বাংলাদেশ বিষয়াবলী", icon:"🇧🇩", color:"#f97316", bg:"#fff7ed" },
    { id:"s5b", name:"আন্তর্জাতিক বিষয়াবলী", icon:"🌍", color:"#0ea5e9", bg:"#f0f9ff" },
    { id:"s8", name:"ভূগোল", icon:"🗺️", color:"#84cc16", bg:"#f7fee7" },
  ];
  const examSubjectIds = [...new Set(allQuestions.map(q => q.subjectId))];
  const examSubjects = examSubjectIds.map(id => ALL_SUBJS.find(s => s.id === id)).filter(Boolean);

  // State
  const [phase, setPhase] = useState("pick"); // pick | exam
  const [subjectOrder, setSubjectOrder] = useState([]); // user's chosen order
  const [activeSubjId, setActiveSubjId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(examSource.duration);
  const [currentQIdx, setCurrentQIdx] = useState(0); // within active subject

  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const urgent = timeLeft <= 120;

  // Timer — only runs in exam phase
  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Questions for active subject
  const activeSubjQuestions = activeSubjId
    ? allQuestions.filter(q => q.subjectId === activeSubjId)
    : [];
  const currentQ = activeSubjQuestions[currentQIdx];

  const completedSubjIds = new Set(
    examSubjectIds.filter(id =>
      allQuestions.filter(q => q.subjectId === id).every(q => q.id in answers)
    )
  );
  const totalAnswered = Object.keys(answers).length;

  // ── PHASE: SUBJECT PICKER ───────────────────────────────
  if (phase === "pick") {
    const toggleSubject = (id) => {
      setSubjectOrder(prev => {
        if (prev.includes(id)) return prev.filter(x => x !== id);
        return [...prev, id];
      });
    };

    const startExam = () => {
      // Any unselected subjects go at the end
      const remaining = examSubjectIds.filter(id => !subjectOrder.includes(id));
      const finalOrder = [...subjectOrder, ...remaining];
      setSubjectOrder(finalOrder);
      setActiveSubjId(finalOrder[0]);
      setCurrentQIdx(0);
      setSelected(null);
      setPhase("exam");
    };

    return (
      <div className="subj-picker-wrap">
        <div className="subj-picker-top">
          <div>
            <div className="subj-picker-title bn">{examSource.title}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }} className="bn">
              {allQuestions.length}টি প্রশ্ন · {Math.floor(examSource.duration/60)} মিনিট
            </div>
          </div>
          <div className={`timer-pill`}>
            <span style={{ fontSize:14 }}>⏱</span>
            <span className="timer-num">{fmt(timeLeft)}</span>
          </div>
        </div>

        <div className="subj-picker-body">
          <div style={{ background:"#eff6ff", borderRadius:14, padding:"14px 18px", marginBottom:24, border:"1px solid #bfdbfe" }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#1d4ed8", marginBottom:4 }} className="bn">
              আপনি কোন বিষয় আগে দিতে চান?
            </div>
            <div style={{ fontSize:13, color:"#3b82f6", lineHeight:1.6 }} className="bn">
              নিচে বিষয়গুলো ট্যাপ করুন — যেটা আগে ট্যাপ করবেন সেটা আগে আসবে।
              না বেছে নিলেও পরীক্ষা শুরু হবে।
            </div>
          </div>

          <div className="subj-picker-grid">
            {examSubjects.map(subj => {
              const orderIdx = subjectOrder.indexOf(subj.id);
              const isSelected = orderIdx !== -1;
              return (
                <div
                  key={subj.id}
                  className={`subj-pick-card ${isSelected ? "spc-selected" : ""}`}
                  style={isSelected ? { borderColor: subj.color } : {}}
                  onClick={() => toggleSubject(subj.id)}
                >
                  {isSelected && (
                    <div className="subj-order-badge">{orderIdx + 1}</div>
                  )}
                  <div className="subj-pick-icon" style={{ background: subj.bg || subj.color+"15" }}>
                    {subj.icon}
                  </div>
                  <div className="subj-pick-info">
                    <div className="subj-pick-name bn" style={{ color: isSelected ? subj.color : "#1a1a2e" }}>
                      {subj.name}
                    </div>
                    <div className="subj-pick-meta bn">
                      {allQuestions.filter(q => q.subjectId === subj.id).length}টি প্রশ্ন
                    </div>
                  </div>
                  <div className={`subj-pick-status ${isSelected ? "sps-active" : "sps-pending"}`}
                    style={isSelected ? { background: subj.color } : {}}>
                    {isSelected ? `#${orderIdx+1} বেছে নেওয়া` : "বেছে নিন"}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="start-btn"
            style={{ fontFamily:"'Hind Siliguri',sans-serif" }}
            onClick={startExam}>
            {subjectOrder.length > 0
              ? `${subjectOrder[0] && examSubjects.find(s=>s.id===subjectOrder[0])?.name} থেকে শুরু করুন →`
              : "পরীক্ষা শুরু করুন →"
            }
          </button>
          {subjectOrder.length > 0 && (
            <button
              style={{ width:"100%", marginTop:10, padding:12, border:"none", background:"none", color:"#9ca3af", fontSize:13, cursor:"pointer", fontFamily:"'Hind Siliguri',sans-serif" }}
              onClick={() => setSubjectOrder([])}>
              বাছাই রিসেট করুন
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: EXAM ─────────────────────────────────────────
  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers(a => ({ ...a, [currentQ.id]: idx }));
  };

  const handleNext = () => {
    // Next question in this subject
    if (currentQIdx + 1 < activeSubjQuestions.length) {
      const nextIdx = currentQIdx + 1;
      setCurrentQIdx(nextIdx);
      setSelected(answers[activeSubjQuestions[nextIdx]?.id] ?? null);
      return;
    }
    // Subject done — go to next subject in order
    const currentOrderIdx = subjectOrder.indexOf(activeSubjId);
    const nextSubjId = subjectOrder[currentOrderIdx + 1];
    if (nextSubjId) {
      setActiveSubjId(nextSubjId);
      setCurrentQIdx(0);
      setSelected(answers[allQuestions.find(q => q.subjectId === nextSubjId)?.id] ?? null);
    } else {
      // All subjects done
      handleFinish();
    }
  };

  const handleSkip = () => handleNext();

  const switchSubject = (id) => {
    setActiveSubjId(id);
    const qs = allQuestions.filter(q => q.subjectId === id);
    // Go to first unanswered, or start
    const firstUnanswered = qs.findIndex(q => !(q.id in answers));
    const goTo = firstUnanswered >= 0 ? firstUnanswered : 0;
    setCurrentQIdx(goTo);
    setSelected(answers[qs[goTo]?.id] ?? null);
  };

  const handleFinish = () => {
    const finalAnswers = { ...answers };
    if (currentQ && selected !== null) finalAnswers[currentQ.id] = selected;
    let correct = 0;
    allQuestions.forEach(qq => { if (finalAnswers[qq.id] === qq.correct) correct++; });
    onFinish({ answers: finalAnswers, correct, total: allQuestions.length, timeTaken: examSource.duration - timeLeft, questions: allQuestions });
  };

  const activeSubj = examSubjects.find(s => s.id === activeSubjId);
  const allDone = examSubjectIds.every(id => completedSubjIds.has(id));
  const qInSubjAnswered = activeSubjQuestions.filter(q => q.id in answers).length;

  return (
    <div className="exam-outer">
      {/* Side panel */}
      <div className="exam-side">
        <div className="exam-side-header">
          <div className="exam-side-title">সময় বাকি</div>
          <div className={`exam-side-timer ${urgent?"urgent":""}`}>{fmt(timeLeft)}</div>
        </div>
        <div className="exam-side-progress">
          <div className="exam-side-prog-bar">
            <div className="exam-side-prog-fill"
              style={{ width: `${Math.round(totalAnswered/allQuestions.length*100)}%` }} />
          </div>
          <div className="exam-side-prog-text bn">
            {totalAnswered}/{allQuestions.length} উত্তর দেওয়া
          </div>
        </div>
        <div className="exam-side-subjects">
          {subjectOrder.map((id, i) => {
            const s = examSubjects.find(sx => sx.id === id);
            if (!s) return null;
            const isDone = completedSubjIds.has(id);
            const isActive = id === activeSubjId;
            const qs = allQuestions.filter(q => q.subjectId === id);
            const ans = qs.filter(q => q.id in answers).length;
            return (
              <div
                key={id}
                className={`exam-side-subj ${isActive?"ess-active":""} ${isDone?"ess-done":""}`}
                onClick={() => switchSubject(id)}
                title={s.name}
              >
                <span className="exam-side-subj-icon">{s.icon}</span>
                <span className="exam-side-subj-name bn">{s.name}</span>
                <span className="exam-side-subj-check">
                  {isDone ? "✅" : isActive ? <span style={{fontSize:10,color:"#818cf8"}}>{ans}/{qs.length}</span> : <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>{ans}/{qs.length}</span>}
                </span>
              </div>
            );
          })}
          {allDone && (
            <button
              style={{ width:"100%", marginTop:16, padding:"12px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#06b6d4)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Hind Siliguri',sans-serif" }}
              onClick={handleFinish}>
              ✅ সাবমিট করুন
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="exam-main">
        {/* Top bar */}
        <div className="exam-main-top">
          <div className="exam-main-subj">
            <span style={{ fontSize:20 }}>{activeSubj?.icon}</span>
            <span className="exam-main-subj-badge bn"
              style={{ borderColor: activeSubj?.color+"40", color: activeSubj?.color, background: activeSubj?.bg || activeSubj?.color+"10" }}>
              {activeSubj?.name}
            </span>
          </div>
          <div className="exam-main-qcount bn">
            {currentQIdx + 1}/{activeSubjQuestions.length} · {qInSubjAnswered} উত্তর দেওয়া
          </div>
        </div>

        {/* Question */}
        <div className="exam-main-body">
          {currentQ && (
            <div className="exam-card" style={{ marginTop:0 }}>
              {/* Mini progress dots */}
              <div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
                {activeSubjQuestions.map((qq, i) => (
                  <div key={qq.id}
                    style={{
                      width:8, height:8, borderRadius:"50%", flexShrink:0,
                      background: qq.id in answers
                        ? (activeSubj?.color || "#6366f1")
                        : i === currentQIdx
                        ? "#1a1a2e"
                        : "#e2e8f0",
                      transition:"all 0.2s",
                    }}
                  />
                ))}
              </div>

              <div className="q-text">{currentQ.text}</div>

              <div className="opts">
                {currentQ.options.map((opt, i) => {
                  let cls = "opt-btn";
                  let lblCls = "opt-label";
                  if (i === selected) { cls += " selected"; lblCls += " active-lbl"; }
                  return (
                    <button key={i} className={cls}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      style={{ cursor: selected !== null ? "default" : "pointer" }}>
                      <span className={lblCls}>{["ক","খ","গ","ঘ"][i]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ minHeight:16 }} />

              {selected !== null ? (
                <button className="next-btn" onClick={handleNext}>
                  {currentQIdx + 1 >= activeSubjQuestions.length
                    ? (subjectOrder.indexOf(activeSubjId) + 1 >= subjectOrder.length
                      ? "✅ সব শেষ — ফলাফল দেখুন"
                      : `পরবর্তী বিষয়: ${examSubjects.find(s=>s.id===subjectOrder[subjectOrder.indexOf(activeSubjId)+1])?.name || ""} →`)
                    : "পরের প্রশ্ন →"
                  }
                </button>
              ) : (
                <button className="skip-btn" onClick={handleSkip}>
                  এড়িয়ে যান
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultPage({ result, onRestart, isRetake }) {
  const [tab, setTab] = useState("summary"); // summary | review
  const [reviewFilter, setReviewFilter] = useState("all"); // all | correct | wrong | skipped

  const pct = Math.round((result.correct / result.total) * 100);
  const wrong = Object.keys(result.answers).length - result.correct;
  const skipped = result.total - Object.keys(result.answers).length;
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎉" : pct >= 40 ? "😊" : "📚";
  const grade = pct >= 80 ? "A+" : pct >= 70 ? "A" : pct >= 60 ? "B" : pct >= 50 ? "C" : "D";
  const labels = ["ক","খ","গ","ঘ"];

  const questions = result.questions || MOCK_EXAM.questions;

  const subjectResults = [...SUBJECTS_FIXED, TODAY_ROTATING].map(s => {
    const qs = questions.filter(q => q.subjectId === s.id);
    const c = qs.filter(q => result.answers[q.id] === q.correct).length;
    return { ...s, correct: c, total: qs.length, pct: qs.length ? Math.round((c / qs.length) * 100) : 0 };
  });

  // Build review list
  const reviewItems = questions.map(q => {
    const selected = result.answers[q.id];
    const isCorrect = selected === q.correct;
    const isSkipped = selected === undefined;
    return { ...q, selected, isCorrect, isSkipped };
  });

  const filteredReview = reviewItems.filter(q => {
    if (reviewFilter === "correct") return q.isCorrect;
    if (reviewFilter === "wrong") return !q.isCorrect && !q.isSkipped;
    if (reviewFilter === "skipped") return q.isSkipped;
    return true;
  });

  // Group by subject for review
  const allSubjects = [...SUBJECTS_FIXED, TODAY_ROTATING];

  return (
    <div className="result-wrap">
      <div className="result-inner">

        {/* Hero */}
        <div className="result-hero">
          <div className="result-emoji">{emoji}</div>
          <div className="result-pct">{pct}%</div>
          <div className="result-grade">গ্রেড {grade}</div>
          {isRetake && <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:6 }}>অনুশীলন পরীক্ষা</div>}
          <div className="result-title-text" style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>
            {pct >= 80 ? "অসাধারণ পারফরম্যান্স!" : pct >= 60 ? "বেশ ভালো করেছেন!" : pct >= 40 ? "আরো একটু পড়লে ভালো হবে" : "আরো পড়াশোনা করুন"}
          </div>
        </div>

        {/* Score stats */}
        <div className="result-stats">
          {[
            { v:result.correct, l:"সঠিক", c:"#10b981" },
            { v:wrong, l:"ভুল", c:"#ef4444" },
            { v:skipped, l:"এড়ানো", c:"#f59e0b" },
            { v:fmt(result.timeTaken), l:"সময়", c:"#6366f1" },
          ].map((s,i) => (
            <div key={i} className="rs">
              <div className="rs-val" style={{ color:s.c }}>{s.v}</div>
              <div className="rs-lbl" style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="review-tabs">
          <button className={`review-tab ${tab==="summary"?"active":""}`} onClick={()=>setTab("summary")} style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>
            📊 বিষয়ভিত্তিক ফলাফল
          </button>
          <button className={`review-tab ${tab==="review"?"active":""}`} onClick={()=>setTab("review")} style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>
            🔍 প্রশ্নভিত্তিক রিভিউ
          </button>
        </div>

        {/* ── TAB: SUMMARY ── */}
        {tab === "summary" && (
          <div className="subj-results" style={{ marginBottom:20 }}>
            {subjectResults.map(s => (
              <div key={s.id} className="sr-item">
                <div className="sr-top">
                  <div className="sr-name" style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>{s.icon} {s.name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:"#10b981", fontWeight:600 }}>✓ {s.correct}</span>
                    <span style={{ fontSize:12, color:"#ef4444", fontWeight:600 }}>✗ {s.total - s.correct}</span>
                    <div className="sr-score">{s.pct}%</div>
                  </div>
                </div>
                <div className="mini-bar"><div className="mini-fill" style={{ width:`${s.pct}%`, background:s.color }} /></div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: REVIEW ── */}
        {tab === "review" && (
          <div style={{ marginBottom:20 }}>
            {/* Filter chips */}
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {[
                { key:"all", label:`সব (${questions.length})`, color:"#6366f1" },
                { key:"correct", label:`✓ সঠিক (${result.correct})`, color:"#10b981" },
                { key:"wrong", label:`✗ ভুল (${wrong})`, color:"#ef4444" },
                { key:"skipped", label:`এড়ানো (${skipped})`, color:"#f59e0b" },
              ].map(f => (
                <button key={f.key}
                  onClick={() => setReviewFilter(f.key)}
                  style={{
                    padding:"6px 14px", borderRadius:100, border:`1.5px solid ${reviewFilter===f.key?f.color:"#e8e5e0"}`,
                    background: reviewFilter===f.key ? f.color+"15" : "#fff",
                    color: reviewFilter===f.key ? f.color : "#64748b",
                    fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Hind Siliguri',sans-serif",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Review items grouped by subject */}
            <div className="card" style={{ marginBottom:0 }}>
              {filteredReview.length === 0 ? (
                <div style={{ padding:32, textAlign:"center", color:"#9ca3af", fontFamily:"'Hind Siliguri',sans-serif" }}>
                  এই ফিল্টারে কোনো প্রশ্ন নেই
                </div>
              ) : filteredReview.map((q, idx) => {
                const subj = allSubjects.find(s => s.id === q.subjectId);
                const showSectionHeader = idx === 0 ||
                  filteredReview[idx - 1].subjectId !== q.subjectId;

                return (
                  <div key={q.id}>
                    {showSectionHeader && subj && (
                      <div className="review-section-title">
                        <span style={{ fontSize:18 }}>{subj.icon}</span>
                        <span style={{ color:subj.color, fontFamily:"'Hind Siliguri',sans-serif" }}>{subj.name}</span>
                      </div>
                    )}
                    <div className="review-item">
                      {/* Question header */}
                      <div className="review-item-top">
                        <div className="review-q-text" style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>
                          <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginRight:8 }}>
                            Q{idx + 1}
                          </span>
                          {q.text}
                        </div>
                        <span className={`review-status ${q.isSkipped?"skipped":q.isCorrect?"correct":"wrong"}`}>
                          {q.isSkipped ? "এড়ানো" : q.isCorrect ? "✓ সঠিক" : "✗ ভুল"}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="review-opts">
                        {q.options.map((opt, i) => {
                          const isCorrectOpt = i === q.correct;
                          const isSelectedOpt = i === q.selected;
                          let cls = "review-opt r-neutral";
                          let lblCls = "review-opt-lbl lbl-neutral";
                          if (isCorrectOpt) { cls = "review-opt r-correct"; lblCls = "review-opt-lbl lbl-correct"; }
                          else if (isSelectedOpt && !isCorrectOpt) { cls = "review-opt r-wrong"; lblCls = "review-opt-lbl lbl-wrong"; }
                          return (
                            <div key={i} className={cls}>
                              <span className={lblCls}>{labels[i]}</span>
                              <span style={{ fontFamily:"'Hind Siliguri',sans-serif", fontSize:13, flex:1 }}>
                                {opt}
                                {isCorrectOpt && <span style={{ marginLeft:6, fontSize:11, fontWeight:700, color:"#059669" }}>← সঠিক উত্তর</span>}
                                {isSelectedOpt && !isCorrectOpt && <span style={{ marginLeft:6, fontSize:11, fontWeight:700, color:"#dc2626" }}>← আপনার উত্তর</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="review-explanation">
                          <span className="review-explanation-icon">💡</span>
                          <span style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>
                            <strong>ব্যাখ্যা:</strong> {q.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="cta-row">
          <button className="cta-btn cta-primary" style={{ fontFamily:"'Hind Siliguri',sans-serif" }} onClick={onRestart}>← ড্যাশবোর্ড</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ARCHAIC PAGE
// ============================================================
function ArchaicPage({ onRetake }) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [retakeConfirm, setRetakeConfirm] = useState(null);
  const labels = ["ক","খ","গ","ঘ"];

  const allSubjects = [
    ...SUBJECTS_FIXED, TODAY_ROTATING,
    { id:"s5a", name:"বাংলাদেশ বিষয়াবলী", icon:"🇧🇩", color:"#f97316" },
    { id:"s5b", name:"আন্তর্জাতিক বিষয়াবলী", icon:"🌍", color:"#0ea5e9" },
    { id:"s8", name:"ভূগোল", icon:"🗺️", color:"#84cc16" },
  ];

  const filtered = ARCHAIC_EXAMS.filter(e =>
    !search ||
    e.title.includes(search) ||
    e.date.includes(search) ||
    e.rotating.name.includes(search)
  );

  const totalExams = ARCHAIC_EXAMS.length;
  const totalQ = ARCHAIC_EXAMS.reduce((a, e) => a + e.questions.length, 0);
  const totalParticipants = ARCHAIC_EXAMS.reduce((a, e) => a + e.participants, 0);

  // ── DETAIL VIEW ──────────────────────────────────────────────────────
  if (detail) {
    const subjectGroups = allSubjects
      .map(s => ({ subj: s, qs: detail.questions.filter(q => q.subjectId === s.id) }))
      .filter(g => g.qs.length > 0);

    return (
      <div className="arch-detail-page">
        {/* Topbar */}
        <div className="arch-topbar">
          <div className="arch-topbar-logo">Archaic</div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="arch-back-btn" onClick={() => setDetail(null)}>
              ← আর্কাইভে ফিরুন
            </button>
            <button
              className="arch-btn arch-btn-practice bn"
              style={{ padding:"8px 18px", fontSize:13 }}
              onClick={() => setRetakeConfirm(detail)}>
              🔄 এই পরীক্ষাটি দিন
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="arch-detail-banner">
          <div className="arch-detail-banner-inner">
            <div className="arch-detail-date-pill">📅 {detail.date}</div>
            <div className="arch-detail-title bn">{detail.title}</div>
            <div className="arch-detail-chips">
              <span className="arch-detail-chip">
                {detail.rotating.icon}
                <span className="bn">{detail.rotating.name}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>রোটেটিং</span>
              </span>
              <span className="arch-detail-chip">❓ <span className="bn">{detail.questions.length}টি প্রশ্ন</span></span>
              <span className="arch-detail-chip">👥 <span className="bn">{detail.participants} জন অংশ নিয়েছেন</span></span>
              <span className="arch-detail-chip">📊 <span className="bn">গড় স্কোর: {detail.avgScore}%</span></span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="arch-detail-body">
          {subjectGroups.map(({ subj, qs }) => (
            <div key={subj.id} className="arch-subj-block">
              <div className="arch-subj-header">
                <div className="arch-subj-icon-box" style={{ background: subj.color+"18" }}>
                  {subj.icon}
                </div>
                <div className="arch-subj-name" style={{ color: subj.color }} className="bn">
                  {subj.name}
                </div>
                <div className="arch-subj-count bn">{qs.length}টি প্রশ্ন</div>
              </div>

              {qs.map((q, qi) => (
                <div key={q.id} className="arch-q-card">
                  <div className="arch-q-num">প্রশ্ন {qi + 1}</div>
                  <div className="arch-q-text bn">{q.text}</div>
                  <div className="arch-q-opts">
                    {q.options.map((opt, i) => {
                      const isCor = i === q.correct;
                      return (
                        <div key={i} className={`arch-q-opt ${isCor?"ao-correct":"ao-neutral"}`}>
                          <span className={`arch-q-lbl ${isCor?"aql-correct":"aql-neutral"}`}>
                            {labels[i]}
                          </span>
                          <span className={`arch-q-opt-text ${isCor?"aot-correct":"aot-neutral"} bn`}>
                            {opt}
                          </span>
                          {isCor && <span className="arch-correct-tag">✓ সঠিক উত্তর</span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="arch-expl">
                      <span className="arch-expl-icon">💡</span>
                      <span className="arch-expl-text bn">
                        <strong style={{color:"rgba(251,191,36,0.9)"}}>ব্যাখ্যা:</strong> {q.explanation}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <button
            className="arch-btn arch-btn-practice bn"
            style={{ width:"100%", padding:16, fontSize:15, borderRadius:14, marginTop:8 }}
            onClick={() => setRetakeConfirm(detail)}>
            🔄 এই পরীক্ষাটি অনুশীলন করুন
          </button>
        </div>

        {retakeConfirm && <ArchaicConfirm exam={retakeConfirm} onCancel={() => setRetakeConfirm(null)} onGo={() => { setRetakeConfirm(null); onRetake(retakeConfirm); }} />}
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div className="arch-page">
      {/* Topbar */}
      <div className="arch-topbar">
        <div className="arch-topbar-logo">Archaic</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }} className="bn">
          পূর্বের পরীক্ষার আর্কাইভ
        </div>
      </div>

      {/* Hero */}
      <div className="arch-hero-section">
        <div className="arch-eyebrow">
          <div className="arch-eyebrow-dot" />
          <div className="arch-eyebrow-text">Exam Archive</div>
        </div>
        <div className="arch-main-title">Archaic</div>
        <div className="arch-main-sub bn">
          পূর্বের সকল দৈনিক পরীক্ষার প্রশ্নপত্র, সঠিক উত্তর ও ব্যাখ্যা একসাথে খুঁজে পাবেন এখানে।
        </div>
        <div className="arch-stats-strip">
          <div>
            <div className="arch-strip-num">{totalExams}</div>
            <div className="arch-strip-lbl bn">পরীক্ষা সংরক্ষিত</div>
          </div>
          <div>
            <div className="arch-strip-num">{totalQ}</div>
            <div className="arch-strip-lbl bn">মোট প্রশ্ন</div>
          </div>
          <div>
            <div className="arch-strip-num">{totalParticipants.toLocaleString()}</div>
            <div className="arch-strip-lbl bn">মোট অংশগ্রহণ</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="arch-search-wrap">
        <div className="arch-search-box">
          <span className="arch-search-icon">🔍</span>
          <input
            className="arch-search-input bn"
            placeholder="তারিখ, পরীক্ষার নাম বা বিষয় দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <span className="arch-search-count">{filtered.length} ফলাফল</span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="arch-list">
        {filtered.length === 0 ? (
          <div className="arch-empty-state">
            <div className="arch-empty-ring">📭</div>
            <div className="arch-empty-title bn">কোনো পরীক্ষা পাওয়া যায়নি</div>
            <div className="arch-empty-sub bn">অন্য শব্দ দিয়ে আবার খুঁজুন</div>
          </div>
        ) : (
          <>
            <div className="arch-list-label">{filtered.length}টি পরীক্ষা</div>
            {filtered.map((exam, idx) => {
              const scoreColor = exam.avgScore >= 75 ? "#34d399" : exam.avgScore >= 50 ? "#a78bfa" : "#f87171";
              const weekdays = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
              const d = new Date(exam.isoDate);
              const wd = weekdays[d.getDay()] || "";

              return (
                <div key={exam.id} className="arch-item">
                  {/* Index */}
                  <div className="arch-item-idx">{String(idx + 1).padStart(2, "0")}</div>

                  {/* Date */}
                  <div className="arch-item-date-col">
                    <div className="arch-item-date bn">{exam.date}</div>
                    <div className="arch-item-weekday bn">{wd}</div>
                  </div>

                  {/* Divider */}
                  <div className="arch-item-rule" />

                  {/* Info */}
                  <div className="arch-item-body">
                    <div className="arch-item-title bn">{exam.title}</div>
                    <div className="arch-item-tags">
                      <span className="arch-item-tag" style={{
                        background: exam.rotating.color+"12",
                        borderColor: exam.rotating.color+"25",
                        color: exam.rotating.color,
                      }}>
                        {exam.rotating.icon} <span className="bn">{exam.rotating.name}</span>
                      </span>
                      <span className="arch-item-tag" style={{
                        background:"rgba(255,255,255,0.03)",
                        borderColor:"rgba(255,255,255,0.08)",
                        color:"rgba(255,255,255,0.35)",
                      }}>
                        ❓ <span className="bn">{exam.questions.length}টি প্রশ্ন</span>
                      </span>
                      <span className="arch-item-tag" style={{
                        background:"rgba(255,255,255,0.03)",
                        borderColor:"rgba(255,255,255,0.08)",
                        color:"rgba(255,255,255,0.35)",
                      }}>
                        👥 <span className="bn">{exam.participants}</span>
                      </span>
                    </div>
                  </div>

                  {/* Avg score */}
                  <div className="arch-item-score-col">
                    <div className="arch-item-score" style={{ color: scoreColor }}>
                      {exam.avgScore}%
                    </div>
                    <div className="arch-item-score-lbl bn">গড় স্কোর</div>
                  </div>

                  {/* Actions */}
                  <div className="arch-item-btns">
                    <button className="arch-btn arch-btn-view bn" onClick={() => setDetail(exam)}>
                      প্রশ্ন দেখুন
                    </button>
                    <button className="arch-btn arch-btn-practice bn" onClick={() => setRetakeConfirm(exam)}>
                      পরীক্ষা দিন
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {retakeConfirm && <ArchaicConfirm exam={retakeConfirm} onCancel={() => setRetakeConfirm(null)} onGo={() => { setRetakeConfirm(null); onRetake(retakeConfirm); }} />}
    </div>
  );
}

function ArchaicConfirm({ exam, onCancel, onGo }) {
  return (
    <div className="arch-confirm-overlay" onClick={onCancel}>
      <div className="arch-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="arch-confirm-icon-wrap">🔄</div>
        <div className="arch-confirm-title bn">অনুশীলন পরীক্ষা</div>
        <div className="arch-confirm-sub bn">
          এই পরীক্ষার প্রশ্নগুলো দিয়ে অনুশীলন করতে চান?<br/>
          ফলাফলে "অনুশীলন" চিহ্নিত থাকবে।
        </div>
        <div className="arch-confirm-exam-name bn">{exam.title}</div>
        <div className="arch-confirm-actions">
          <button className="arch-confirm-cancel bn" onClick={onCancel}>বাতিল</button>
          <button className="arch-confirm-go bn" onClick={onGo}>✅ শুরু করুন</button>
        </div>
      </div>
    </div>
  );
}
// ============================================================
// MAIN
// ============================================================
export default function StudentApp() {
  const [page, setPage] = useState("home"); // home | exam | result | archaic
  const [result, setResult] = useState(null);
  const [retakeExam, setRetakeExam] = useState(null); // archaic exam being retaken

  const todayKey = new Date().toISOString().slice(0, 10);

  const handleExamFinish = (r) => {
    // Mark today's exam as done (only for today's exam, not archaic retakes)
    if (!retakeExam) {
      try { localStorage.setItem(`exam_done_${todayKey}`, "1"); } catch(e) {}
    }
    setResult(r);
    setPage("result");
  };

  const handleRetake = (archExam) => {
    setRetakeExam(archExam);
    setPage("exam");
  };

  const doneTodayFlag = (() => {
    try { return !!localStorage.getItem(`exam_done_${todayKey}`); } catch(e) { return false; }
  })();

  return (
    <>
      <style>{S}</style>
      <div className="app">
        {page !== "exam" && (
          <div className="nav">
            <div className="nav-logo">Exam<span>AI</span></div>
            <div className="nav-links">
              <button className={`nav-link ${page==="home"?"active":""}`}
                style={{ fontFamily:"'Hind Siliguri',sans-serif" }}
                onClick={() => setPage("home")}>হোম</button>
              <button className={`nav-link ${page==="archaic"?"active":""}`}
                style={{ fontFamily:"'Hind Siliguri',sans-serif" }}
                onClick={() => setPage("archaic")}>📚 Archaic</button>
              <button className={`nav-link ${page==="leaderboard"?"active":""}`}
                style={{ fontFamily:"'Hind Siliguri',sans-serif" }}
                onClick={() => { setPage("home"); /* trigger lb tab */ }}>🏆 লিডারবোর্ড</button>
            </div>
            <div className="nav-right">
              <div className="sub-badge" style={{ fontFamily:"'Hind Siliguri',sans-serif" }}>✅ সক্রিয়</div>
              <div className="user-avatar">র</div>
            </div>
          </div>
        )}

        {page === "home" && (
          <HomePage
            doneTodayFlag={doneTodayFlag}
            onStart={() => { setRetakeExam(null); setPage("exam"); }}
          />
        )}
        {page === "exam" && (
          <ExamPage
            examData={retakeExam ? { ...MOCK_EXAM, title: retakeExam.title, questions: retakeExam.questions } : MOCK_EXAM}
            onFinish={handleExamFinish}
          />
        )}
        {page === "result" && (
          <ResultPage
            result={result}
            isRetake={!!retakeExam}
            onRestart={() => { setPage("home"); setRetakeExam(null); }}
          />
        )}
        {page === "archaic" && (
          <ArchaicPage
            onRetake={handleRetake}
            onGoHome={() => setPage("home")}
          />
        )}
      </div>
    </>
  );
}
