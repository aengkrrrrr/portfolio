import { useState, useEffect, useRef } from "react";

/* ── Fonts ── */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:wght@300;400;500&display=swap";

/* ── Palette ── */
const C = {
  bg:      "#0d0f1a",
  panel:   "#12151f",
  card:    "#181d2e",
  border:  "#2a2f45",
  border2: "#3a4060",
  accent:  "#52e8b4",
  purple:  "#a78bfa",
  yellow:  "#fbbf24",
  red:     "#f87171",
  blue:    "#60a5fa",
  white:   "#e8eaf0",
  mid:     "rgba(232,234,240,0.55)",
  dim:     "rgba(232,234,240,0.28)",
};

/* ── pixel font shorthand ── */
const PX = (size, color = C.white) => ({
  fontFamily: "'Press Start 2P', monospace",
  fontSize: size, color, lineHeight: 1.6,
  imageRendering: "pixelated",
});

const BODY = (size = 16, color = C.mid) => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: size, color, lineHeight: 1.75,
});

/* ── Nav sections ── */
const ZONES = [
  { id: "home",       icon: "⌂", label: "SPAWN" },
  { id: "about",      icon: "♟", label: "STATUS" },
  { id: "skills",     icon: "⚔", label: "SKILLS" },
  { id: "experience", icon: "★", label: "HISTORY" },
  { id: "projects",   icon: "◈", label: "QUESTS" },
  { id: "awards",     icon: "★", label: "AWARDS" },
  { id: "contact",    icon: "✉", label: "GUILD" },
];

/* ── useInView ── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

/* ── Scanline overlay ── */
function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

/* ── Pixel corner box ── */
function PixelBox({ children, style = {}, glowColor = C.accent, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: C.card,
        border: `2px solid ${hover ? glowColor : C.border}`,
        padding: "24px 28px",
        transition: "border-color 0.2s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {/* Corner pixels */}
      {[
        { top: -2, left: -2 }, { top: -2, right: -2 },
        { bottom: -2, left: -2 }, { bottom: -2, right: -2 },
      ].map((pos, i) => (
        <span key={i} style={{
          position: "absolute", width: 6, height: 6,
          background: hover ? glowColor : C.border2,
          transition: "background 0.2s", ...pos,
        }} />
      ))}
      {children}
    </div>
  );
}

/* ── Dialog box (game speech bubble style) ── */
function DialogBox({ lines, speed = 40 }) {
  const [displayed, setDisplayed] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (lineIdx >= lines.length) { setDone(true); return; }
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIdx] = (next[lineIdx] || "") + lines[lineIdx][charIdx];
          return next;
        });
        setCharIdx(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0); }, 300);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines, speed]);

  return (
    <PixelBox style={{ maxWidth: 640 }}>
      <div style={{ ...PX(8, C.accent), marginBottom: 14 }}>▶ SYSTEM MSG</div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        {lines.map((_, i) => (
          <p key={i} style={{ ...BODY(14, C.mid), margin: "0 0 8px" }}>
            {displayed[i] || ""}
            {i === lineIdx && !done && (
              <span style={{ animation: "blink 0.8s step-end infinite", color: C.accent }}>█</span>
            )}
          </p>
        ))}
      </div>
    </PixelBox>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  NAV                                                         */
/* ═══════════════════════════════════════════════════════════ */
function Nav({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? "rgba(13,15,26,0.96)" : "transparent",
      borderBottom: scrolled ? `2px solid ${C.border}` : "none",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      transition: "all 0.3s", padding: "0 2rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...PX(14, C.accent) }}>CHU</span>
          <span style={{
            ...PX(8, C.bg),
            background: C.accent,
            padding: "3px 7px",
            fontSize: 9,
          }}>LV.02</span>
        </div>

        {/* Zone nav */}
        <div style={{ display: "flex", gap: 4 }}>
          {ZONES.map(z => (
            <button key={z.id} onClick={() => {
              setActive(z.id);
              document.getElementById(z.id)?.scrollIntoView({ behavior: "smooth" });
            }} style={{
              background: active === z.id ? `${C.accent}18` : "transparent",
              border: `1px solid ${active === z.id ? C.accent : "transparent"}`,
              color: active === z.id ? C.accent : C.dim,
              ...PX(7, active === z.id ? C.accent : C.dim),
              padding: "6px 10px", cursor: "pointer",
              transition: "all 0.15s",
            }}>
              <span style={{ marginRight: 4 }}>{z.icon}</span>
              {z.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  HERO — SPAWN POINT                                          */
/* ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState("");
  const fullText = "> portfolio.exe --load CHU_SONGRIM";
  const [typeDone, setTypeDone] = useState(false);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    const t = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else { clearInterval(t); setTypeDone(true); setTimeout(() => setShowMain(true), 400); }
    }, 45);
    return () => clearInterval(t);
  }, [mounted]);

  return (
    <section id="home" style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center",
      padding: "30px 2rem 2rem",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.border}44 1px, transparent 1px), linear-gradient(90deg, ${C.border}44 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        mask: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 60, alignItems: "center" }}>

        {/* ── LEFT ── */}
        <div>
          {/* Terminal */}
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: C.accent, marginBottom: 32, minHeight: 20 }}>
            {typed}{!typeDone && <span style={{ animation: "blink 0.6s step-end infinite" }}>_</span>}
          </div>

          <div style={{ opacity: showMain ? 1 : 0, transform: showMain ? "none" : "translateY(20px)", transition: "all 0.8s ease" }}>
            {/* Intro line */}
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: C.dim, margin: "0 0 20px", letterSpacing: "0.1em" }}>
              PORTFOLIO / 2026
            </p>

            {/* Tagline */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "clamp(16px,2vw,22px)", color: C.mid, margin: "0 0 12px", lineHeight: 1.5 }}>
              웹 접근성과 문서화를 중시하고,
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "clamp(16px,2vw,22px)", color: C.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
              글로벌 프로젝트 경험을 가진
            </p>

            {/* Name */}
            <h1 style={{ margin: "0 0 32px" }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(32px,6vw,64px)", color: C.white, display: "block", letterSpacing: 2, lineHeight: 1.3 }}>추송림</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(12px,1.8vw,18px)", color: C.accent, display: "block", marginTop: 12, letterSpacing: "0.08em" }}>CHU SONGRIM</span>
            </h1>

            {/* Info strip */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 36, flexWrap: "wrap" }}>
              {[
                { label: "2001.03.09" },
                { label: "010-6613-5660" },
                { label: "srimm3399@gmail.com" },
              ].map((item) => (
                <span key={item.label} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.dim }}>{item.label}</span>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 14 }}>
              <button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: C.bg,
                background: C.accent, border: "none", padding: "14px 26px", cursor: "pointer", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.target.style.opacity = "0.8"}
                onMouseLeave={e => e.target.style.opacity = "1"}>
                ▶ VIEW QUESTS
              </button>
              <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: C.accent,
                background: "transparent", border: `2px solid ${C.accent}`, padding: "14px 26px", cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}18`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                ✉ CONTACT
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ opacity: showMain ? 1 : 0, transition: "all 1s ease 0.3s" }}>
          {/* CURRENTLY */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: C.dim, letterSpacing: "0.15em", margin: "0 0 14px" }}>CURRENTLY</p>
            <p style={{ margin: "0 0 10px" }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: C.white }}>Frontend Dev</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: C.dim, marginLeft: 12 }}>Freelance</span>
            </p>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: C.accent, margin: "0 0 4px", lineHeight: 2 }}>@ 아이티센 글로벌<br/>· 아이티센 재팬</p>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: C.dim }}>2024.10 — PRESENT</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, marginBottom: 28 }} />

          {/* FOCUS */}
          <div>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: C.dim, letterSpacing: "0.15em", margin: "0 0 16px" }}>FOCUS</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["React", "JavaScript","PHP", "MySql","Vue.js", "웹 접근성", "글로벌 프로젝트"].map(f => (
                <span key={f} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.mid,
                  border: `1px solid ${C.border2}`, padding: "6px 14px", borderRadius: 0,
                  background: "transparent",
                }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: "28px 0" }} />

          {/* STAT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "EXP", val: "1YR 8MO", color: C.accent },
              { label: "STATUS", val: "● HIRING", color: "#4ade80" },
            ].map(s => (
              <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, padding: "12px 16px" }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: C.dim, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll */}
      <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: C.dim }}>▼ SCROLL</div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  ABOUT — CHARACTER STATUS                                    */
/* ═══════════════════════════════════════════════════════════ */
function AboutSection() {
  const [ref, inView] = useInView();
  const stats = [
    { label: "EXP", val: "1년 8개월", max: 100, pct: 68, color: C.accent },
    { label: "PROJECTS", val: "7+", max: 10, pct: 60, color: C.purple },
    { label: "TECH STACK", val: "20+", max: 30, pct: 80, color: C.yellow },
    { label: "ACCESSIBILITY", val: "WCAG", max: 100, pct: 85, color: C.blue },
  ];

  return (
    <section id="about" ref={ref} style={{ background: C.panel, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Zone header */}
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "all 0.7s ease", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.purple, padding: "5px 10px" }}>◈ ZONE 02</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: 0 }}>CHARACTER STATUS</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, opacity: inView ? 1 : 0, transition: "all 0.8s ease 0.1s" }}>
          {/* Bio panel */}
          <PixelBox glowColor={C.purple}>
            <div style={{ ...PX(8, C.purple), marginBottom: 16 }}>◆ PROFILE</div>
            {[
              "안녕하세요! 글로벌 프로젝트 경험을 가진 프론트엔드 개발자 추송림입니다.",
              "HTML/CSS 마크업부터 React·Vue.js 기반 SPA 개발, Angular를 활용한 음성 인식 UI 시스템까지 경험했습니다. 웹 접근성 준수, 꼼꼼한 예외처리, 기능 흐름 문서화를 통해 팀 전체의 유지보수 효율을 높이는 개발자입니다.",
              "현재 Java, Python 등 새로운 기술을 공부하며 더 넓은 시야를 가진 개발자로 성장 중입니다.",
            ].map((t, i) => (
              <p key={i} style={{ ...BODY(16), margin: i < 2 ? "0 0 14px" : 0 }}>{t}</p>
            ))}
          </PixelBox>

          {/* Stat bars */}
          <PixelBox glowColor={C.yellow}>
            <div style={{ ...PX(8, C.yellow), marginBottom: 20 }}>◆ STATS</div>
            {stats.map(s => (
              <div key={s.label} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ ...PX(8, C.dim) }}>{s.label}</span>
                  <span style={{ ...PX(8, s.color) }}>{s.val}</span>
                </div>
                <div style={{ height: 8, background: C.bg, border: `1px solid ${C.border}`, position: "relative" }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, height: "100%",
                    background: s.color, width: inView ? `${s.pct}%` : "0%",
                    transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s`,
                    imageRendering: "pixelated",
                  }} />
                </div>
              </div>
            ))}
          </PixelBox>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  SKILLS — EQUIPMENT / SKILL TREE                            */
/* ═══════════════════════════════════════════════════════════ */
const SKILLS = {
  "⚔ WEAPON": [
    { name: "HTML5 / CSS3", lv: 95, tier: "S" },
    { name: "JavaScript", lv: 90, tier: "S" },
    { name: "React", lv: 85, tier: "A" },
    { name: "TypeScript", lv: 70, tier: "A" },
    { name: "Vue.js", lv: 75, tier: "A" },
    { name: "Next.js", lv: 60, tier: "B" },
    { name: "Tailwind CSS", lv: 80, tier: "A" },
    { name: "Angular", lv: 55, tier: "C" },
  ],
  "◈ ARMOR": [
    { name: "jQuery / jQuery UI", lv: 85, tier: "A" },
    { name: "Bootstrap / SASS", lv: 82, tier: "A" },
    { name: "React Query", lv: 75, tier: "B" },
    { name: "Figma / Adobe XD", lv: 82, tier: "A" },
    { name: "Photoshop / Illustrator", lv: 72, tier: "B" },
    { name: "Firebase", lv: 65, tier: "B" },
    { name: "Three.js", lv: 40, tier: "C" },
    { name: "Webpack", lv: 45, tier: "C" },
  ],
  "✦ ACCESSORY": [
    { name: "Git / GitHub", lv: 80, tier: "A" },
    { name: "PHP / MySQL", lv: 60, tier: "B" },
    { name: "Node.js", lv: 55, tier: "C" },
    { name: "Laravel", lv: 40, tier: "C" },
    { name: "AWS", lv: 45, tier: "C" },
    { name: "Linux / Apache", lv: 50, tier: "C" },
    { name: "C++", lv: 38, tier: "C" },
  ],
};

const TIER_COLOR = { S: "#fbbf24", A: "#52e8b4", B: "#a78bfa", C: "#60a5fa" };

function SkillsSection() {
  const [ref, inView] = useInView();
  const [tab, setTab] = useState("⚔ WEAPON");
  return (
    <section id="skills" ref={ref} style={{ background: C.bg, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ opacity: inView ? 1 : 0, transition: "all 0.7s ease", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.yellow, padding: "5px 10px" }}>◈ ZONE 03</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: 0 }}>SKILL TREE</h2>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {Object.keys(SKILLS).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...PX(8, tab === t ? C.bg : C.dim),
              background: tab === t ? C.yellow : "transparent",
              border: `2px solid ${tab === t ? C.yellow : C.border}`,
              padding: "8px 16px", cursor: "pointer", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        {/* Skill grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {SKILLS[tab].map((s, i) => (
            <div key={s.name} style={{
              background: C.card, border: `1px solid ${C.border}`,
              padding: "16px", transition: "border-color 0.2s",
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(20px)",
              transition: `all 0.6s ease ${i * 60}ms`,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = TIER_COLOR[s.tier]}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ ...BODY(15, C.white), fontWeight: 500 }}>{s.name}</span>
                <span style={{ ...PX(9, C.bg), background: TIER_COLOR[s.tier], padding: "2px 7px" }}>
                  {s.tier}
                </span>
              </div>
              <div style={{ height: 6, background: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{
                  height: "100%", background: TIER_COLOR[s.tier],
                  width: inView ? `${s.lv}%` : "0%",
                  transition: `width 1s ease ${i * 60 + 200}ms`,
                }} />
              </div>
              <div style={{ ...PX(8, C.dim), marginTop: 6, textAlign: "right" }}>LV.{s.lv}</div>
            </div>
          ))}
        </div>

        {/* Studying */}
        <div style={{ marginTop: 28, background: C.card, border: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ ...PX(8, C.accent) }}>► LEARNING</span>
          <div style={{ width: 1, height: 14, background: C.border }} />
          <span style={{ ...BODY(13, C.mid) }}>Java &nbsp;·&nbsp; Python</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  PROJECTS — QUEST LOG                                        */
/* ═══════════════════════════════════════════════════════════ */
const PROJECTS = [
  {
    id: 1, num: "QUEST 01",
    title: "신칸센 티켓 발매 키오스크",
    sub: "Voice Command UI System",
    period: "2024.10 — 현재",
    type: "MAIN QUEST", typeColor: C.accent,
    desc: "일본 신칸센 티켓 발권 키오스크의 음성 명령 기반 UI 시스템 개발에 참여했습니다. 음성 인식 결과를 화면 로직에 반영하고 발권 단계별 상태 흐름을 제어하는 기능을 구현했습니다.",
    role: ["음성 명령 ↔ 기능 매핑 로직 설계", "예외 처리 및 상태 제어 로직 보완", "오류 로그 분석 및 기능 연동 테스트", "이벤트 흐름 처리 구조 문서화"],
    stacks: ["Angular", "TypeScript", "JavaScript", "C++", "Java", "HTML", "CSS"],
    reward: "음성 기반 UI 안정성 향상",
    github: "private",
    demo: "",
  },
  {
    id: 2, num: "QUEST 02",
    title: "딥러닝캥거루 LMS",
    sub: "Admin Ver. — 관리자 페이지",
    period: "2024.04 — 2024.05",
    type: "PARTY QUEST", typeColor: C.yellow,
    desc: "LMS 학습 쇼핑몰의 관리자 페이지입니다. 상품·회원·주문 데이터를 한눈에 파악하고 제어할 수 있는 대시보드와 관리 기능을 구현했습니다.",
    role: ["관리자 대시보드 UI 설계 및 구현", "상품·회원·주문 CRUD 기능 개발", "Figma 기반 디자인 시스템 적용", "PHP + MySQL 연동 데이터 처리"],
    stacks: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "jQuery", "Bootstrap", "Figma"],
    reward: "어드민 운영 효율 개선",
    github: "https://github.com/aengkrrrrr/clean_kangaroo",
    demo: "http://srimm3399.dothome.co.kr/clean_kangaroo/admin/login/login.php",
    figma: "https://www.figma.com/design/y3L7Q49u1w3kv0DhYzyMOd/%EA%B9%A8%EB%81%97%ED%95%9C-%EC%95%84%EA%B8%B0-%EC%BA%A5%EA%B1%B0%EB%A3%A8%F0%9F%A6%98?node-id=0-1&p=f",
  },
  {
    id: 3, num: "QUEST 02-B",
    title: "딥러닝캥거루 LMS",
    sub: "User Ver. — 사용자 페이지",
    period: "2024.04 — 2024.05",
    type: "PARTY QUEST", typeColor: C.yellow,
    desc: "동일 LMS 프로젝트의 사용자 페이지입니다. 강의 탐색·수강신청·결제 플로우와 학습 진도 확인 기능을 구현했으며, 사용자 경험을 최우선으로 고려했습니다.",
    role: ["강의 목록·상세 페이지 UI 구현", "수강신청 및 결제 플로우 설계", "학습 진도 표시 기능 구현", "반응형 레이아웃 및 접근성 적용"],
    stacks: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "jQuery", "Bootstrap", "Figma"],
    reward: "사용자 구매 전환율 향상",
    github: "https://github.com/aengkrrrrr/clean_kangaroo",
    demo: "http://srimm3399.dothome.co.kr/clean_kangaroo/",
    figma: "https://www.figma.com/design/y3L7Q49u1w3kv0DhYzyMOd/%EA%B9%A8%EB%81%97%ED%95%9C-%EC%95%84%EA%B8%B0-%EC%BA%A5%EA%B1%B0%EB%A3%A8%F0%9F%A6%98?node-id=0-1&p=f",
  },
  {
    id: 4, num: "QUEST 03",
    title: "쪽지시험 테스트 플랫폼",
    sub: "Quiz Platform for Teachers & Students",
    period: "2026.03 — 2026.04",
    type: "VIBE QUEST", typeColor: C.purple,
    desc: "실제 학생들의 일일 테스트를 위해 제작된 시험 플랫폼입니다. 교사용과 학생용 모드를 분리하여 실시간 연동 시스템을 구축했습니다.",
    role: ["교사용 / 학생용 UI 분리 설계", "Firebase 실시간 DB 연동", "시험 생성 및 채점 로직 구현", "React 기반 SPA 구조 설계"],
    stacks: ["React", "Firebase", "GitHub", "Vercel"],
    reward: "실시간 시험 운영 자동화",
    github: "https://github.com/aengkrrrrr/history-quiz-app",
    demo: "https://history-quiz-app-lemon.vercel.app/",
  },
  {
    id: 5, num: "QUEST 04",
    title: "미래에셋그룹 리뉴얼",
    sub: "Corporate Website Redesign",
    period: "2024.03 — 2024.04",
    type: "PARTY QUEST", typeColor: C.yellow,
    desc: "시멘틱 태그와 웹 접근성을 준수하여 기획부터 디자인까지 새롭게 리뉴얼한 PC 반응형 사이트입니다.",
    role: ["기획 및 와이어프레임 설계", "Figma 디자인 시스템 구축", "시멘틱 HTML 마크업", "웹 접근성 준수 (WCAG)", "PC 반응형 레이아웃"],
    stacks: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap", "Figma", "Photoshop"],
    reward: "UI/UX 품질 향상",
    github: "https://github.com/aengkrrrrr/Team_Dongdongju",
    demo: "http://srimm3399.dothome.co.kr/miraeesset/index.html",
    figma: "https://www.figma.com/design/B29YGmx5bifWmJydk9flhv/2%EC%B0%A8-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%8F%99%EB%8F%99%EC%A3%BC?node-id=0-1&p=f",
  },
  {
    id: 6, num: "QUEST 05",
    title: "롯데웰푸드 클론코딩",
    sub: "Responsive Website Clone",
    period: "2023.04",
    type: "SOLO QUEST", typeColor: C.blue,
    desc: "시멘틱 태그와 웹 접근성을 준수하여 롯데웰푸드 사이트를 클론 코딩한 PC 반응형 사이트입니다.",
    role: ["시멘틱 HTML 마크업", "웹 접근성 준수", "PC 반응형 레이아웃 구현", "CSS 애니메이션 구현"],
    stacks: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap", "Figma", "Photoshop"],
    reward: "마크업 역량 강화",
    github: "https://github.com/aengkrrrrr/lottewellfood",
    demo: "http://srimm3399.dothome.co.kr/lottewelfood/index.html",
  },
  {
    id: 7, num: "QUEST 06",
    title: "동물의 숲 MBTI 테스트",
    sub: "나와 잘 맞는 주민은?",
    period: "2026.05",
    type: "VIBE QUEST", typeColor: C.purple,
    desc: "동물의 숲 캐릭터들과의 MBTI 궁합을 테스트하는 인터랙티브 웹 프로젝트입니다. 카카오톡 공유 API를 연동하여 결과를 친구들과 쉽게 공유할 수 있습니다.",
    role: ["MBTI 로직 설계 및 구현", "인터랙티브 UI 구현", "캐릭터 매칭 알고리즘 구현", "카카오톡 공유 API 연동", "GitHub Pages 배포"],
    stacks: ["HTML", "CSS", "JavaScript", "Kakao API"],
    reward: "인터랙티브 UI 구현 역량 강화",
    github: "https://github.com/aengkrrrrr/aengkrrrrr.github.io",
    demo: "https://aengkrrrrr.github.io/",
  },
];

function QuestCard({ p, index }) {
  const [ref, inView] = useInView(0.08);
  const [open, setOpen] = useState(false);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(32px)",
      transition: `all 0.7s ease ${index * 80}ms`,
      height: "100%",
    }}>
      <div style={{
        background: C.card, border: `2px solid ${C.border}`,
        transition: "border-color 0.2s", position: "relative",
        height: "100%", display: "flex", flexDirection: "column",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = p.typeColor}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

        {/* Top bar */}
        <div style={{ background: C.panel, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <span style={{ ...PX(7, C.dim) }}>{p.num}</span>
            {p.period && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:C.dim }}>{p.period}</span>}
          </div>
          <span style={{ ...PX(7, C.bg), background: p.typeColor, padding: "3px 10px" }}>{p.type}</span>
        </div>

        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ ...PX("clamp(12px,1.8vw,16px)", C.white), margin: "0 0 4px" }}>{p.title}</h3>
          <p style={{ ...PX(7, p.typeColor), margin: "0 0 16px" }}>{p.sub}</p>
          <p style={{ ...BODY(15), margin: "0 0 16px" }}>{p.desc}</p>

          {/* Reward */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "8px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ ...PX(7, C.yellow) }}>★ REWARD</span>
            <span style={{ ...BODY(12, C.mid) }}>{p.reward}</span>
          </div>

          {/* Toggle */}
          <button onClick={() => setOpen(!open)} style={{
            ...PX(7, p.typeColor), background: "none",
            border: `1px solid ${C.border}`, padding: "6px 14px",
            cursor: "pointer", marginBottom: open ? 12 : 0, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = p.typeColor}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            {open ? "▲ HIDE LOG" : "▼ QUEST LOG"}
          </button>

          {open && (
            <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
              {p.role.map(r => (
                <li key={r} style={{ ...BODY(15), paddingLeft: 16, position: "relative", marginBottom: 4 }}>
                  <span style={{ position: "absolute", left: 0, color: p.typeColor }}>›</span>{r}
                </li>
              ))}
            </ul>
          )}

          {/* Stacks */}
          <div style={{ paddingTop: 14, display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
            {p.stacks.map(s => (
              <span key={s} style={{ ...PX(7, C.dim), border: `1px solid ${C.border}`, padding: "3px 8px" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Buttons footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Figma button */}
              {p.figma && (
                <a href={p.figma} target="_blank" rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    textDecoration: "none",
                    background: "transparent",
                    border: "2px solid #a259ff",
                    padding: "8px 14px",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                  <svg width="14" height="14" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="#1ABCFE"/>
                    <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="#0ACF83"/>
                    <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="#FF7262"/>
                    <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="#FF3131"/>
                    <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="#A259FF"/>
                  </svg>
                  <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color: "#a259ff" }}>FIGMA</span>
                </a>
              )}
              {/* Demo button */}
              <a href={p.demo || "#"} onClick={e => !p.demo && e.preventDefault()} target="_blank" rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  textDecoration: "none",
                  background: p.demo ? p.typeColor : "transparent",
                  border: `2px solid ${p.demo ? p.typeColor : C.border}`,
                  padding: "8px 16px",
                  opacity: p.demo ? 1 : 0.25,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => { if(p.demo) e.currentTarget.style.opacity="0.7"; }}
                onMouseLeave={e => { if(p.demo) e.currentTarget.style.opacity="1"; }}>
                <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color: p.demo ? "#0d0f1a" : "rgba(232,234,240,0.28)" }}>▶ DEMO</span>
              </a>
              {/* GitHub button */}
              <a href={p.github && p.github !== "private" ? p.github : "#"} onClick={e => (!p.github || p.github === "private") && e.preventDefault()} target="_blank" rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  textDecoration: "none",
                  background: "transparent",
                  border: `2px solid ${p.github && p.github !== "private" ? C.border2 : C.border}`,
                  padding: "8px 16px",
                  opacity: p.github ? 1 : 0.25,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if(p.github) { e.currentTarget.style.borderColor=p.typeColor; e.currentTarget.style.opacity="0.8"; } }}
                onMouseLeave={e => { if(p.github) { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.opacity="1"; } }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={p.github && p.github !== "private" ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.28)"}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color: p.github && p.github !== "private" ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.28)" }}>{p.github === "private" ? "🔒 PRIVATE" : "GITHUB"}</span>
              </a>
            </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsSection() {
  const [ref, inView] = useInView();
  return (
    <section id="projects" ref={ref} style={{ background: C.panel, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ opacity: inView ? 1 : 0, transition: "all 0.7s ease", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.red, padding: "5px 10px" }}>◈ ZONE 05</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: "0 0 8px" }}>QUEST LOG</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[["MAIN", C.accent], ["PARTY", C.yellow], ["SOLO", C.blue], ["VIBE", C.purple]].map(([t, c]) => (
              <span key={t} style={{ ...PX(7, c), display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, background: c, display: "inline-block" }} />{t} QUEST
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 16, alignItems: "stretch" }}>
          {PROJECTS.map((p, i) => <QuestCard key={p.id} p={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  CONTACT — GUILD                                            */
/* ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════ */
/*  AWARDS — ACHIEVEMENT LOG                                    */
/* ═══════════════════════════════════════════════════════════ */
const AWARDS = [
  {
    date: "2024.06",
    title: "★ K-job Star 프로젝트 최우수팀",
    org: "서울지방고용노동부",
    color: C.yellow,
    icon: "★",
    desc: "그린컴퓨터아카데미 SW개발자 양성과정 수강생들이 약 25명의 실무 현업자들이 모인 서울고용노동부센터에서 각 팀별로 LMS 쇼핑몰 사이트를 발표하여 최우수상을 수상했습니다.",
  },
  {
    date: "2024.05",
    title: "3차 팀 프로젝트 최우수팀",
    org: "그린컴퓨터아카데미",
    color: C.accent,
    icon: "◈",
    desc: "3차 팀 프로젝트 발표에서 팀 최우수상을 수상했습니다.",
  },
  {
    date: "2024.05",
    title: "3차 팀 프로젝트 협업최우수 팀원",
    org: "그린컴퓨터아카데미",
    color: C.purple,
    icon: "♟",
    desc: "3차 팀 프로젝트에서 협업 역량을 인정받아 협업최우수 팀원으로 선정되었습니다.",
  },
  {
    date: "2024.04",
    title: "2차 팀 프로젝트 최우수팀",
    org: "그린컴퓨터아카데미",
    color: C.accent,
    icon: "◈",
    desc: "2차 팀 프로젝트 발표에서 팀 최우수상을 수상했습니다.",
  },
  {
    date: "2024.04",
    title: "2차 팀 프로젝트 협업최우수 팀원",
    org: "그린컴퓨터아카데미",
    color: C.purple,
    icon: "♟",
    desc: "2차 팀 프로젝트에서 협업 역량을 인정받아 협업최우수 팀원으로 선정되었습니다.",
  },
];

function AwardsSection() {
  const [ref, inView] = useInView();
  return (
    <section id="awards" ref={ref} style={{ background: C.panel, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "all 0.7s ease", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.yellow, padding: "5px 10px" }}>◈ ZONE 06</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: 0 }}>ACHIEVEMENT LOG</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {AWARDS.map((a, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`,
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(24px)",
              transition: `all 0.7s ease ${i * 80}ms`,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ background: C.panel, padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...PX(7, a.color) }}>{a.date}</span>
                <span style={{ ...PX(14, a.color) }}>{a.icon}</span>
              </div>
              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ ...PX("clamp(10px,1.4vw,12px)", C.white), margin: "0 0 10px", lineHeight: 1.8 }}>{a.title}</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, background: `${a.color}18`, border: `1px solid ${a.color}44`, padding: "3px 10px" }}>
                  <span style={{ ...PX(7, a.color) }}>{a.org}</span>
                </div>
                <p style={{ ...BODY(13), margin: 0 }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [ref, inView] = useInView();
  const contacts = [
    { icon: "✉", label: "MAIL", value: "srimm3399@gmail.com", href: "mailto:srimm3399@gmail.com", color: C.accent },
    { icon: "☎", label: "CALL", value: "010-6613-5660", href: "tel:01066135660", color: C.purple },
    { icon: "◈", label: "GITHUB", value: "aengkrrrrr", href: "https://github.com/aengkrrrrr", color: C.yellow },
  ];
  return (
    <section id="contact" ref={ref} style={{ background: C.bg, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ opacity: inView ? 1 : 0, transition: "all 0.7s ease", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.blue, padding: "5px 10px" }}>◈ ZONE 05</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: "0 0 8px" }}>GUILD CONTACT</h2>
          <p style={{ ...BODY(15), maxWidth: 440, wordBreak: "keep-all" }}>새로운 파티(팀)를 찾고 있습니다. 채용 제안이나 협업 문의를 환영합니다!</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {contacts.map((c, i) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer"
              style={{ textDecoration: "none" }}
              onClick={e => !inView && e.preventDefault()}>
              <PixelBox glowColor={c.color} style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)", transition: `all 0.7s ease ${i * 100}ms` }}>
                <div style={{ ...PX(20, c.color), marginBottom: 16 }}>{c.icon}</div>
                <div style={{ ...PX(8, C.dim), marginBottom: 8 }}>{c.label}</div>
                <div style={{ ...BODY(13, C.white) }}>{c.value}</div>
              </PixelBox>
            </a>
          ))}
        </div>

        {/* Game over / credits style footer teaser */}
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <div style={{ ...PX(10, C.dim) }}>- THANK YOU FOR VISITING -</div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════ */
/*  EXPERIENCE — ADVENTURE LOG                                  */
/* ═══════════════════════════════════════════════════════════ */
const EXPERIENCE = [
  {
    id: 1,
    company: "아이티센 글로벌 · 아이티센 재팬",
    team: "글로벌서비스팀",
    role: "Web Developer & QA Engineer (프리랜서 · 용역계약)",
    period: "2024.10 — 현재",
    color: C.accent,
    icon: "◈",
    records: [
      {
        title: "신칸센 음성인식 키오스크 개발",
        period: "2024.10 — 현재",
        tags: ["Angular", "TypeScript", "C++", "Java"],
        items: [
          "음성 인식 엔진 반환 텍스트를 수신하여 발권 단계별(노선/좌석/결제) 화면 상태 제어 로직 구현",
          "음성 명령 ↔ 기능 매핑 설계 및 인식 실패·입력 오류 예외 분기 처리로 흐름 안정성 확보",
          "일본 측 오류 이슈 분석 및 로직 개선, DD / UD / CD 검토 수행",
          "기능별 이벤트 흐름 문서화로 협업 해석 차이 최소화 및 유지보수성 향상",
        ],
      },
      {
        title: "신칸센 티켓 발매 키오스크 QA",
        period: "2024.10 — 2024.12",
        tags: ["QA", "문서화", "에러 분석"],
        items: [
          "일본 측 체크리스트 기반 기능 검증 및 비정상 동작 발생 시 에러 로그 수집·원인 분석",
          "주요 함수 실행 흐름을 플로우 다이어그램으로 시각화, 소스 변경 시 실시간 업데이트",
          "개발자 간 로직 이해도 향상 및 유지보수 효율 개선 기여",
        ],
      },
    ],
  },
  {
    id: 2,
    company: "그린컴퓨터아트학원",
    team: "교육 수료",
    role: "Frontend Developer (수강생)",
    period: "2023.12 — 2024.06",
    color: C.purple,
    icon: "♟",
    records: [
      {
        title: "기업연계 프로젝트형 프론트엔드 SW 개발자 양성",
        period: "2023.12 — 2024.06",
        tags: ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Next.js", "PHP", "MySQL", "AWS", "jQuery", "Figma", "Vue.js", "Laravel"],
        items: [
          "기업 실무 환경을 기반으로 기획–설계–개발–배포 전 과정을 경험하는 프로젝트 중심 교육 과정 수료",
          "HTML, CSS, JavaScript를 기반으로 React 등 프론트엔드 프레임워크 학습, PHP·MySQL 활용 백엔드 및 DB 연동까지 풀스택 구조 이해 확장",
          "팀 단위 기업연계 프로젝트를 통해 요구사항 분석, 일정 관리, 협업 도구 활용, 코드 리뷰 및 산출물 문서화까지 실무 프로세스 체계적 경험",
          "LMS 학습 쇼핑몰 프로젝트 — 관리자·사용자 페이지 설계 및 구현",
        ],
      },
    ],
  },
  {
    id: 3,
    company: "더조은컴퓨터아카데미",
    team: "교육 수료",
    role: "UI/UX Designer (수강생)",
    period: "2022.12 — 2023.05",
    color: C.blue,
    icon: "✦",
    records: [
      {
        title: "디지털디자인 UI/UX 웹디자인·웹퍼블리셔 실무자 양성",
        period: "2022.12 — 2023.05",
        tags: ["HTML5", "CSS3", "JavaScript", "jQuery", "Bootstrap", "Adobe XD"],
        items: [
          "스마트 기기에 적용 가능한 서비스에 대해 사용자 경험과 니즈를 분석하여 정보설계, UI설계, 화면 설계 역량 습득",
          "웹 퍼블리싱 실무 기반으로 HTML5·CSS3·JavaScript·jQuery·Bootstrap 학습",
          "Adobe XD를 활용한 UI/UX 디자인 및 프로토타이핑 실습",
        ],
      },
    ],
  },
];

function ExperienceSection() {
  const [ref, inView] = useInView();
  const [openMap, setOpenMap] = useState({});
  const toggle = (key) => setOpenMap(p => ({ ...p, [key]: !p[key] }));

  return (
    <section id="experience" ref={ref} style={{ background: C.bg, padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "all 0.7s ease", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ ...PX(9, C.bg), background: C.accent, padding: "5px 10px" }}>◈ ZONE 04</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <h2 style={{ ...PX("clamp(20px,3.5vw,36px)", C.white), margin: 0 }}>ADVENTURE LOG</h2>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 2, background: C.border, zIndex: 0 }} />

          {EXPERIENCE.map((exp, ei) => (
            <div key={exp.id} style={{
              position: "relative", paddingLeft: 52, marginBottom: 48,
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateX(-20px)",
              transition: `all 0.7s ease ${ei * 150}ms`,
            }}>
              <div style={{
                position: "absolute", left: 8, top: 6,
                width: 22, height: 22,
                background: exp.color, border: `3px solid ${C.bg}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1,
              }}>
                <span style={{ ...PX(7, C.bg) }}>{exp.icon}</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                  <h3 style={{ ...PX("clamp(10px,1.4vw,13px)", C.white), margin: 0 }}>{exp.company}</h3>
                  <span style={{ ...PX(7, C.bg), background: exp.color, padding: "3px 8px" }}>{exp.team}</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ ...BODY(13, exp.color), fontWeight: 500 }}>{exp.role}</span>
                  <span style={{ ...PX(7, C.dim) }}>{exp.period}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {exp.records.map((rec, ri) => {
                  const key = `${ei}-${ri}`;
                  const isOpen = openMap[key] !== false;
                  return (
                    <div key={ri} style={{ background: C.card, border: `1px solid ${C.border}`, transition: "border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = exp.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      <button onClick={() => toggle(key)} style={{
                        width: "100%", background: "none", border: "none",
                        borderBottom: `1px solid ${isOpen ? C.border : "transparent"}`,
                        padding: "14px 18px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        cursor: "pointer",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", textAlign: "left" }}>
                          <span style={{ ...PX(8, C.white) }}>{rec.title}</span>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {rec.tags.map(t => (
                              <span key={t} style={{ ...PX(7, exp.color), border: `1px solid ${exp.color}44`, padding: "2px 7px" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ ...PX(7, C.dim) }}>{rec.period}</span>
                          <span style={{ ...PX(8, exp.color) }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "16px 18px" }}>
                          {rec.items.map((item, ii) => (
                            <div key={ii} style={{ display: "flex", gap: 10, marginBottom: ii < rec.items.length - 1 ? 10 : 0 }}>
                              <span style={{ ...PX(8, exp.color), flexShrink: 0, marginTop: 2 }}>▷</span>
                              <p style={{ ...BODY(15), margin: 0 }}>{item}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ background: "#090b14", padding: "24px 2rem", borderTop: `2px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...PX(9, C.dim) }}>CHU<span style={{ color: C.accent }}>.</span></span>
        <span style={{ ...PX(8, C.dim) }}>© 2025 추송림</span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  ROOT                                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function Portfolio() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = FONTS; link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const handle = () => {
      const scrollY = window.scrollY + 80;
      for (let i = ZONES.length - 1; i >= 0; i--) {
        const el = document.getElementById(ZONES[i].id);
        if (el && el.offsetTop <= scrollY) { setActive(ZONES[i].id); break; }
      }
    };
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <Scanlines />
      <Nav active={active} setActive={setActive} />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <AwardsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
