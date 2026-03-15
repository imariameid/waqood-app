"use client";
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════
// البيانات
// ══════════════════════════════════════════
const LAYERS = [
  {
    id: 1, icon: "🧠", name: "العقل",
    intro: "في أعماق كل إنسان — جملة تحكمه.",
    question: "ما الجملة التي تقولها لنفسك حين تفشل؟",
    hint: "اكتب بصدق تام — لا يراك أحد سواك",
    color: "#B8860B",
  },
  {
    id: 2, icon: "🩹", name: "الجرح",
    intro: "الجروح لا تختفي — تتنكر.",
    question: "ما الجملة التي تخاف أن يقولها الناس عنك؟",
    hint: "الخوف من الحكم يكشف أعمق ما نحمله",
    color: "#8B3A3A",
  },
  {
    id: 3, icon: "✨", name: "الروح",
    intro: "الروح تعرف ما تريد — قبل أن يعرف العقل.",
    question: "ما الشيء الذي تحلم به منذ زمن ولم تبدأه بعد؟",
    hint: "الحلم الذي يعود دائماً رغم كل المحاولات لنسيانه",
    color: "#5A3A8B",
  },
  {
    id: 4, icon: "🫀", name: "الجسد",
    intro: "الجسد يتذكر ما ينسى العقل.",
    question: "حين تفكر في حلمك الأكبر — أين تشعر بالثقل في جسدك؟",
    hint: "الصدر، الحلق، المعدة، الكتفين — كلها أماكن تخزّن المعيق",
    color: "#1A5A5A",
  },
  {
    id: 5, icon: "⏳", name: "الزمن",
    intro: "كل إنسان يعيش في زمن نفسي مختلف.",
    question: "حين تجلس وحدك بلا هاتف — أين يذهب عقلك أولاً؟",
    hint: "إلى الماضي؟ إلى المستقبل؟ أم يبقى هنا؟",
    color: "#3A5A1A",
  },
  {
    id: 6, icon: "🪞", name: "العلاقات",
    intro: "الناس من حولنا مرايا — تكشف ما لا نراه.",
    question: "من الشخص الذي يُخرج أسوأ ما فيك؟ ومن الذي يُخرج أفضل ما فيك؟",
    hint: "لا حكم على أحد — فقط ملاحظة صادقة",
    color: "#5A1A3A",
  },
  {
    id: 7, icon: "🔊", name: "الصوت",
    intro: "الآن — ستسمع نفسك بعيون مختلفة.",
    question: null, // dynamic — shows back all answers
    hint: "اقرأ ببطء — دع الكلمات تصل",
    color: "#1A3A5A",
  },
];

const CREATION_Q = {
  icon: "✦",
  name: "الخلق",
  intro: "بعد كل ما رأيت —",
  question: "من تختار أن تكون؟",
  hint: "ليس من أنت — بل من تقرر",
  color: "#B8860B",
};

// ══════════════════════════════════════════
// تحليل محلي ذكي (بدون API)
// ══════════════════════════════════════════
function analyzeAnswers(answers, creationAnswer) {
  const allText = Object.values(answers).join(" ").toLowerCase();

  // نوع الوقود
  const fuelTypes = [
    { type: "وقود الخوف", keywords: ["خوف", "أخاف", "خايف", "قلق", "أقلق", "فشل", "سقوط", "يضحكون", "يحكمون"], desc: "تتحرك هرباً من شيء — لا نحو شيء. طاقتك حقيقية، لكنها تحتاج اتجاهاً." },
    { type: "وقود الإرث", keywords: ["دائماً", "أبداً", "هكذا", "عائلة", "ناس", "كلهم", "عادة", "من زمان"], desc: "تحمل قناعات ورثتها ولم تختبرها بنفسك. السؤال الحقيقي: هل هذا ما تؤمن به أنت؟" },
    { type: "وقود الجرح", keywords: ["ألم", "أذى", "جرح", "خذلان", "وحيد", "مش كافي", "ما يكفي", "مش كافية"], desc: "تفعل من مكان لم يُشفَ بعد. الجرح ليس ضعفاً — هو إشارة لما يحتاج رعاية." },
    { type: "وقود الشك", keywords: ["ما أقدر", "مستحيل", "صعب", "لا أستطيع", "غير قادر", "مو قادر", "ما قدرت"], desc: "تؤمن بالحلم لكن لا تؤمن بنفسك. الشك ليس حقيقة — هو عادة تفكير." },
    { type: "وقود الكمالية", keywords: ["مثالي", "صح", "خطأ", "مو صح", "لازم", "يجب", "ما يصير", "وقت مناسب"], desc: "تنتظر لحظة مثالية لا تأتي. الكمال وهم — البداية هي الكمال الوحيد." },
  ];

  let detectedFuel = fuelTypes[3]; // default: شك
  let maxCount = 0;
  for (const fuel of fuelTypes) {
    const count = fuel.keywords.filter(k => allText.includes(k)).length;
    if (count > maxCount) { maxCount = count; detectedFuel = fuel; }
  }

  // مركز الثقل الزمني
  const timeAnswer = answers[5] || "";
  let timeCenter = "الحاضر";
  let timeDesc = "نادر ومقدّر — أنت تعيش اللحظة. هذا وعي حقيقي.";
  if (timeAnswer.includes("ماضي") || timeAnswer.includes("قبل") || timeAnswer.includes("كان") || timeAnswer.includes("لو") || timeAnswer.includes("ندم")) {
    timeCenter = "الماضي";
    timeDesc = "تحمل معك ما مضى. المصالحة مع الماضي لا تعني نسيانه — تعني أن تتوقف عن دفع ثمنه.";
  } else if (timeAnswer.includes("مستقبل") || timeAnswer.includes("بعدين") || timeAnswer.includes("لما") || timeAnswer.includes("قلق") || timeAnswer.includes("خوف")) {
    timeCenter = "المستقبل";
    timeDesc = "عقلك يسبق الزمن دائماً. القلق من المستقبل طاقة تُهدر — ما يحتاجه الحلم هو حضورك الآن.";
  }

  // المعيق الأعمق — من تقاطع الإجابات
  const failureJml = answers[1] || "";
  const fearJml = answers[2] || "";

  let deepBlock = "";
  if (failureJml.length > 0 && fearJml.length > 0) {
    // استخرج الكلمة المشتركة أو الأقوى
    const words1 = failureJml.split(" ").filter(w => w.length > 3);
    const words2 = fearJml.split(" ").filter(w => w.length > 3);
    const common = words1.find(w => fearJml.includes(w));
    if (common) {
      deepBlock = `كلمة "${common}" ظهرت في طبقتين مختلفتين — هذا ليس صدفة. هذه الكلمة هي قلب المعيق.`;
    } else {
      deepBlock = `حين تقول "${failureJml.slice(0, 40)}..." — أنت لا تصف فشلاً. أنت تصف معتقداً عن نفسك.`;
    }
  }

  // جملة الخلق
  const creationTrimmed = creationAnswer?.trim() || "";
  const creationSentence = creationTrimmed.length > 10
    ? `"${creationTrimmed}"`
    : "إنسان يرى نفسه ويختار وقوده بوعي";

  // سؤال التحرر
  const liberationQs = [
    "ما الشيء الواحد الذي لو فعلته اليوم — سيثبت لك أنك قادر على الاختيار؟",
    "لو كان المعيق الذي رأيته اليوم يتكلم — ماذا يريد أن يقول لك؟",
    "ما الفرق بين من أنت اليوم ومن تريد أن تكون — وماذا يفصل بينهما؟",
    "لو لم يكن الخوف موجوداً — ما أول شيء كنت ستفعله؟",
  ];
  const liberationQ = liberationQs[Math.floor(Math.random() * liberationQs.length)];

  return { detectedFuel, timeCenter, timeDesc, deepBlock, creationSentence, liberationQ };
}

// ══════════════════════════════════════════
// مكونات
// ══════════════════════════════════════════

function FloatingOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(184,134,11,${0.03 + i * 0.01}) 0%, transparent 70%)`,
          width: `${200 + i * 80}px`,
          height: `${200 + i * 80}px`,
          left: `${10 + i * 15}%`,
          top: `${5 + i * 12}%`,
          animation: `orbFloat ${8 + i * 2}s ease-in-out infinite`,
          animationDelay: `${i * 1.5}s`,
        }} />
      ))}
    </div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40 }}>
      {[...Array(total)].map((_, i) => (
        <div key={i} style={{
          width: i < current ? 20 : 8,
          height: 8,
          borderRadius: 4,
          background: i < current ? "#B8860B" : i === current ? "rgba(184,134,11,0.6)" : "rgba(255,255,255,0.1)",
          transition: "all 0.5s ease",
        }} />
      ))}
    </div>
  );
}

function LandingScreen({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative", zIndex: 1,
      opacity: visible ? 1 : 0, transition: "opacity 1.2s ease",
    }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 20, animation: "gentlePulse 4s ease infinite" }}>✦</div>
        <h1 style={{
          fontFamily: "'Amiri', serif", fontSize: "clamp(2.8rem, 8vw, 4.5rem)",
          color: "#E8DCC8", lineHeight: 1.2, marginBottom: 12,
          textShadow: "0 0 60px rgba(184,134,11,0.3)",
        }}>مرآة الروح</h1>
        <p style={{
          fontFamily: "'Noto Naskh Arabic', serif", fontSize: "1.1rem",
          color: "#B8860B", marginBottom: 16, letterSpacing: "0.05em",
        }}>بصمة وعيك الكاملة</p>

        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #B8860B, transparent)", margin: "24px auto" }} />

        <p style={{
          fontFamily: "'Noto Naskh Arabic', serif", fontSize: "1.05rem",
          color: "rgba(232,220,200,0.7)", lineHeight: 1.9, marginBottom: 40,
        }}>
          سبع طبقات من الكشف — وسؤال واحد يغيّر كل شيء.
          <br />
          الأداة لا تخبرك من أنت — تريك ما قلته أنت.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 48 }}>
          {["١٥ دقيقة", "٧ أسئلة", "تقرير فريد"].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Amiri', serif", color: "#B8860B", fontSize: "1rem" }}>{item}</div>
            </div>
          ))}
        </div>

        <button onClick={onStart} style={{
          background: "linear-gradient(135deg, #B8860B, #8B6500)",
          border: "none", borderRadius: 16,
          padding: "18px 52px",
          color: "#000", fontFamily: "'Amiri', serif",
          fontSize: "1.3rem", fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 0 40px rgba(184,134,11,0.3)",
          transition: "all 0.3s",
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 8px 50px rgba(184,134,11,0.5)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 40px rgba(184,134,11,0.3)"; }}
        >
          اكتشف الآن ✦
        </button>

        <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", marginTop: 20 }}>
          مجاني بالكامل — لا تسجيل مطلوب
        </p>
      </div>
    </div>
  );
}

function LayerScreen({ layer, layerIndex, totalLayers, answer, answers, onChange, onNext, onBack }) {
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef(null);
  const isReflection = layer.id === 7;
  const isCreation = layer.id === "creation";

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setVisible(true);
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [layer.id]);

  const currentColor = layer.color || "#B8860B";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px 40px", position: "relative", zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "all 0.6s ease",
    }}>
      <div style={{ width: "100%", maxWidth: 580 }}>

        <ProgressDots current={layerIndex} total={totalLayers} />

        {/* الطبقة */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "6px 20px",
            border: `1px solid ${currentColor}40`,
            borderRadius: 20,
            marginBottom: 28,
          }}>
            <span style={{ fontSize: "1.2rem" }}>{layer.icon}</span>
            <span style={{ fontFamily: "'Noto Naskh Arabic', serif", color: currentColor, fontSize: "0.9rem" }}>
              {isCreation ? "✦ سؤال الخلق" : `الطبقة ${layerIndex + 1} — ${layer.name}`}
            </span>
          </div>

          {/* المقدمة */}
          <p style={{
            fontFamily: "'Amiri', serif", fontSize: "1.15rem",
            color: "rgba(232,220,200,0.6)", marginBottom: 32,
            fontStyle: "italic",
          }}>{layer.intro}</p>

          {/* انعكاس الطبقة السابعة */}
          {isReflection ? (
            <div style={{
              background: "rgba(184,134,11,0.05)",
              border: "1px solid rgba(184,134,11,0.2)",
              borderRadius: 16, padding: 24, marginBottom: 32,
              textAlign: "right",
            }}>
              <p style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "rgba(184,134,11,0.8)", fontSize: "0.85rem", marginBottom: 16 }}>
                إجاباتك — اقرأها ببطء:
              </p>
              {Object.entries(answers).slice(0, 6).map(([id, ans]) => {
                const l = LAYERS.find(x => x.id === parseInt(id));
                return ans ? (
                  <div key={id} style={{ marginBottom: 12, padding: "10px 14px", borderRight: `3px solid ${l?.color || "#B8860B"}40`, }}>
                    <span style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", display: "block", marginBottom: 4 }}>{l?.name}</span>
                    <span style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "rgba(232,220,200,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>{ans}</span>
                  </div>
                ) : null;
              })}
            </div>
          ) : null}

          {/* السؤال */}
          <h2 style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
            color: "#E8DCC8", lineHeight: 1.5, marginBottom: 12,
            padding: "20px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
          }}>
            {isReflection
              ? "الآن — وأنت ترى كل هذا معاً — ماذا تلاحظ؟"
              : layer.question}
          </h2>

          <p style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "rgba(184,134,11,0.6)", fontSize: "0.82rem", marginBottom: 24 }}>
            {layer.hint}
          </p>
        </div>

        {/* مربع الكتابة */}
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => onChange(e.target.value)}
          placeholder="اكتب هنا بصدق تام..."
          dir="rtl"
          style={{
            width: "100%", minHeight: 140,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${answer ? currentColor + "60" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14, padding: "18px",
            color: "#E8DCC8",
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: "1rem", lineHeight: 1.8,
            resize: "vertical", outline: "none",
            transition: "border-color 0.3s",
            boxSizing: "border-box",
            boxShadow: answer ? `0 0 20px ${currentColor}15` : "none",
          }}
        />

        {/* الأزرار */}
        <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
          {layerIndex > 0 && (
            <button onClick={onBack} style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 24px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Noto Naskh Arabic', serif",
              fontSize: "0.9rem", cursor: "pointer",
              transition: "all 0.3s",
            }}>← رجوع</button>
          )}
          <button
            onClick={onNext}
            disabled={!answer?.trim()}
            style={{
              background: answer?.trim()
                ? `linear-gradient(135deg, ${currentColor}, ${currentColor}99)`
                : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: 12,
              padding: "14px 40px",
              color: answer?.trim() ? "#000" : "rgba(255,255,255,0.2)",
              fontFamily: "'Amiri', serif",
              fontSize: "1.1rem", fontWeight: 700,
              cursor: answer?.trim() ? "pointer" : "not-allowed",
              transition: "all 0.4s",
              boxShadow: answer?.trim() ? `0 4px 24px ${currentColor}40` : "none",
            }}
            onMouseEnter={e => { if (answer?.trim()) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {isCreation ? "اكشف بصمتي ✦" : "التالي ›"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportScreen({ answers, creationAnswer, onRestart }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const report = analyzeAnswers(answers, creationAnswer);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
    const interval = setInterval(() => {
      setStep(s => s < 5 ? s + 1 : s);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      icon: "🔥", title: "وقودك السائد",
      value: report.detectedFuel.type,
      desc: report.detectedFuel.desc,
      color: "#B8860B",
    },
    {
      icon: "⏳", title: "مركز ثقلك الزمني",
      value: `تعيش في ${report.timeCenter}`,
      desc: report.timeDesc,
      color: "#5A8B3A",
    },
    {
      icon: "🔍", title: "أعمق معيق لديك",
      value: "من كلامك أنت",
      desc: report.deepBlock || "المعيق يختبئ في الجمل التي تكررت — ليس في الظروف.",
      color: "#8B3A5A",
    },
    {
      icon: "✦", title: "جملة الخلق",
      value: report.creationSentence,
      desc: "هذه هي جملتك — وقودك الجديد. احفظها.",
      color: "#B8860B",
      isQuote: true,
    },
    {
      icon: "🌿", title: "سؤال التحرر",
      value: report.liberationQ,
      desc: "دعه يبقى معك أياماً — لا تستعجل الإجابة.",
      color: "#3A5A8B",
      isQuote: true,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", padding: "60px 24px 80px",
      position: "relative", zIndex: 1,
      opacity: visible ? 1 : 0, transition: "opacity 1s ease",
      direction: "rtl",
    }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        {/* الرأس */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: "2rem", marginBottom: 16, animation: "gentlePulse 3s ease infinite" }}>✦</div>
          <h1 style={{
            fontFamily: "'Amiri', serif", fontSize: "2.5rem",
            color: "#B8860B", marginBottom: 8,
          }}>بصمة وعيك</h1>
          <p style={{
            fontFamily: "'Noto Naskh Arabic', serif",
            color: "rgba(232,220,200,0.5)", fontSize: "0.9rem",
          }}>
            مبنية من كلامك أنت — لا من كلام الأداة
          </p>
        </div>

        {/* البطاقات */}
        {cards.map((card, i) => (
          <div key={i} style={{
            background: i < step ? "rgba(26,26,46,0.9)" : "rgba(26,26,46,0.3)",
            border: `1px solid ${i < step ? card.color + "40" : "rgba(255,255,255,0.05)"}`,
            borderRadius: 18, padding: "24px 28px",
            marginBottom: 16,
            opacity: i < step ? 1 : 0.2,
            transform: i < step ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.6s ease",
            boxShadow: i < step ? `0 4px 30px ${card.color}10` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "1.3rem" }}>{card.icon}</span>
              <span style={{
                fontFamily: "'Noto Naskh Arabic', serif",
                color: "rgba(184,134,11,0.7)", fontSize: "0.8rem",
              }}>{card.title}</span>
            </div>
            <p style={{
              fontFamily: "'Amiri', serif",
              fontSize: card.isQuote ? "1.2rem" : "1.1rem",
              color: card.isQuote ? card.color : "#E8DCC8",
              marginBottom: 10, lineHeight: 1.6,
              fontStyle: card.isQuote ? "italic" : "normal",
              borderRight: card.isQuote ? `3px solid ${card.color}` : "none",
              paddingRight: card.isQuote ? 14 : 0,
            }}>{card.value}</p>
            <p style={{
              fontFamily: "'Noto Naskh Arabic', serif",
              color: "rgba(232,220,200,0.5)", fontSize: "0.88rem", lineHeight: 1.7,
            }}>{card.desc}</p>
          </div>
        ))}

        {/* الختام */}
        {step >= 5 && (
          <div style={{
            textAlign: "center", marginTop: 48,
            animation: "fadeUp 0.8s ease forwards",
          }}>
            <div style={{
              padding: "28px",
              border: "1px solid rgba(184,134,11,0.3)",
              borderRadius: 20,
              background: "rgba(184,134,11,0.04)",
              marginBottom: 32,
            }}>
              <p style={{
                fontFamily: "'Amiri', serif",
                fontSize: "1.3rem", color: "#B8860B",
                lineHeight: 1.7, marginBottom: 8,
              }}>
                أنت كيان خلقه الله.
              </p>
              <p style={{
                fontFamily: "'Amiri', serif",
                fontSize: "1.1rem", color: "rgba(232,220,200,0.7)",
                lineHeight: 1.7,
              }}>
                معجز، محفوظ، وآمن.
                <br />
                والوقود = الفكرة التي اخترتها.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={onRestart} style={{
                background: "transparent",
                border: "1px solid rgba(184,134,11,0.4)",
                borderRadius: 12, padding: "13px 28px",
                color: "#B8860B",
                fontFamily: "'Noto Naskh Arabic', serif",
                fontSize: "0.95rem", cursor: "pointer",
                transition: "all 0.3s",
              }}>أعد التجربة</button>
              <button style={{
                background: "linear-gradient(135deg, #B8860B, #8B6500)",
                border: "none", borderRadius: 12,
                padding: "13px 28px",
                color: "#000", fontFamily: "'Amiri', serif",
                fontSize: "1rem", fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(184,134,11,0.4)",
              }}>
                أكمل رحلتك مع وقود الإنسان ✦
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// App
// ══════════════════════════════════════════
export default function MiraatAlRooh() {
  const [screen, setScreen] = useState("landing"); // landing | layer | creation | report
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [creationAnswer, setCreationAnswer] = useState("");

  const allScreens = [...LAYERS, { ...CREATION_Q, id: "creation" }];
  const currentScreen = allScreens[currentLayerIndex];

  const handleNext = () => {
    const isCreation = currentScreen.id === "creation";
    if (isCreation) {
      setCreationAnswer(currentAnswer);
      setScreen("report");
    } else {
      setAnswers(prev => ({ ...prev, [currentScreen.id]: currentAnswer }));
      setCurrentAnswer("");
      setCurrentLayerIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (currentLayerIndex === 0) { setScreen("landing"); return; }
    setCurrentLayerIndex(i => i - 1);
    const prevLayer = allScreens[currentLayerIndex - 1];
    setCurrentAnswer(answers[prevLayer.id] || "");
  };

  const handleStart = () => {
    setCurrentLayerIndex(0);
    setAnswers({});
    setCurrentAnswer("");
    setCreationAnswer("");
    setScreen("layer");
  };

  const handleRestart = () => {
    setAnswers({});
    setCreationAnswer("");
    setCurrentAnswer("");
    setCurrentLayerIndex(0);
    setScreen("landing");
  };

  useEffect(() => {
    if (screen === "layer") {
      const ans = currentScreen.id === "creation"
        ? creationAnswer
        : (answers[currentScreen.id] || "");
      setCurrentAnswer(ans);
    }
  }, [currentLayerIndex, screen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          min-height: 100%;
          background: #080810;
          color: #E8DCC8;
          direction: rtl;
        }

        body {
          background:
            radial-gradient(ellipse at 20% 20%, rgba(184,134,11,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(90,58,139,0.04) 0%, transparent 50%),
            #080810;
        }

        @keyframes gentlePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -15px); }
          66% { transform: translate(-10px, 20px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        textarea:focus { box-shadow: 0 0 0 1px rgba(184,134,11,0.3) !important; }
        textarea::placeholder { color: rgba(232,220,200,0.25) !important; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.3); border-radius: 2px; }

        button:active { transform: scale(0.97) !important; }
      `}</style>

      <FloatingOrbs />

      {screen === "landing" && <LandingScreen onStart={handleStart} />}

      {screen === "layer" && (
        <LayerScreen
          layer={currentScreen}
          layerIndex={currentLayerIndex}
          totalLayers={allScreens.length}
          answer={currentAnswer}
          answers={answers}
          onChange={setCurrentAnswer}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {screen === "report" && (
        <ReportScreen
          answers={answers}
          creationAnswer={creationAnswer}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}