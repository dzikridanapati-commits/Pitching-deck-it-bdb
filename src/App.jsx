import { useState, useEffect, useRef, useCallback } from "react";

const STEPS = [
  { id: "jasa", label: "Jenis Jasa" },
  { id: "client", label: "Info Client" },
  { id: "detail", label: "Detail Project" },
  { id: "revamp", label: "Website Existing" },
  { id: "aset", label: "Aset & Catatan" },
  { id: "review", label: "Review & Generate" },
];

const JASA_OPTIONS = [
  { id: "website_baru", title: "Pembuatan Website Baru", desc: "Client belum punya website atau ingin website dari nol", icon: "\u{1F310}" },
  { id: "revamp", title: "Revamp / Redesign Website", desc: "Client sudah punya website tapi ingin diperbaiki", icon: "\u{1F504}" },
  { id: "maintenance", title: "Maintenance & Retainer", desc: "Client butuh support ongoing untuk website yang sudah ada", icon: "\u{1F6E0}\uFE0F" },
];

function buildPrompt(data) {
  const jasaLabel = JASA_OPTIONS.find((j) => j.id === data.jasa)?.title || data.jasa;
  let slideStructure = "";
  let extraInstructions = "";

  if (data.jasa === "website_baru") {
    slideStructure = `STRUKTUR SLIDE:
1. Cover - "Corporate Website Strategy" + "${data.namaPerusahaan}"
2. Understanding the Business - Industri ${data.industri}, core business, target market ${data.targetMarket}
3. Corporate Positioning Framework - Current perception vs target positioning + positioning statement
4. Why This Website Matters - Alasan "why now" + risiko jika tidak dilakukan
5. Referensi Website - 3 referensi dengan alasan pemilihan dan relevansi
6. Website Structure (Sitemap) - Proposed sitemap/navigasi
7. Homepage Strategy - Struktur homepage section by section
8. Technical Strategy - Scope + fitur: ${data.fiturKhusus || "responsive design, contact form, basic SEO"}
9. Data & Asset Requirement - Yang harus disiapkan client + solusi jika belum lengkap
10. Timeline & Risk - Phase timeline + risk & mitigation
11. Closing - "Let's Kick Start Your Achievement!"`;
    extraInstructions = `- Riset industri ${data.industri} dan kompetitornya
- Cari 3 website referensi relevan, jelaskan alasan dan relevansinya
- Buat positioning statement spesifik untuk ${data.namaPerusahaan}
- Homepage strategy sesuai industri ${data.industri}`;
  } else if (data.jasa === "revamp") {
    slideStructure = `STRUKTUR SLIDE:
1. Cover - "Website Revamp Strategy" + "${data.namaPerusahaan}"
2. Understanding the Business - Industri ${data.industri}, core business, target market
3. Current Website Audit - Analisis ${data.urlExisting || "website existing"}: ${data.masalahWebsite || "perlu dianalisis"}
4. Why Revamp Now - Alasan strategis + risiko
5. Competitive Benchmark - 3 kompetitor/referensi
6. Revamp Goals & KPI - Target + metrics
7. Proposed Changes - ${data.yangDiubah || "design, structure, content, technical"}
8. New Sitemap - Struktur navigasi baru
9. Homepage Redesign Strategy - Layout baru section by section
10. Technical Upgrade Plan - Fitur: ${data.fiturKhusus || "responsive, SEO, performance"}
11. Data & Asset Requirement
12. Timeline & Risk
13. Closing - "Let's Kick Start Your Achievement!"`;
    extraInstructions = `- Analisis website: ${data.urlExisting || "[URL belum tersedia]"}
- Pertahankan: ${data.yangDipertahankan || "perlu ditentukan"}
- Ubah: ${data.yangDiubah || "perlu dianalisis"}
- Cari 3 referensi benchmark`;
  } else {
    slideStructure = `STRUKTUR SLIDE:
1. Cover - "Website Maintenance & Support" + "${data.namaPerusahaan}"
2. Understanding Current Setup - Platform, tech stack, kondisi saat ini
3. Why Ongoing Maintenance Matters - Risiko tanpa maintenance
4. Scope of Services - Detail layanan
5. Service Level Tiers - Basic / Standard / Premium
6. Reporting & Communication - Report, komunikasi, SLA
7. Timeline & Onboarding - Onboarding + monthly workflow
8. Risk & Mitigation
9. Closing - "Let's Kick Start Your Achievement!"`;
    extraInstructions = `- Buat 3 tier paket yang jelas value proposition-nya
- Sertakan SLA realistis per tier
- Buat workflow bulanan yang terstruktur`;
  }

  return `Kamu adalah strategist senior dari Banana Digital Boost, sebuah digital agency.
Buatkan KONTEN LENGKAP untuk pitching deck ${jasaLabel} dalam Bahasa Indonesia.

KONTEKS CLIENT:
- Nama Perusahaan: ${data.namaPerusahaan}
- Industri: ${data.industri}
- Target Market: ${data.targetMarket || "belum ditentukan"}
- Lokasi: ${data.lokasi || "Indonesia"}
- Deskripsi Bisnis: ${data.deskripsiBisnis || "belum tersedia"}
- Pembeda kompetitor: ${data.pembeda || "belum diidentifikasi"}
- Masalah utama: ${data.masalahUtama || "butuh kehadiran digital profesional"}
- Tujuan website: ${data.tujuanWebsite || "meningkatkan kredibilitas dan generate leads"}
- Target audience: ${data.targetAudience || data.targetMarket || "B2B dan B2C"}
- Fitur khusus: ${data.fiturKhusus || "belum ditentukan"}
- Referensi: ${data.referensiWebsite || "belum ada, tolong carikan"}
- Timeline: ${data.timeline || "1-2 bulan"}
${data.jasa === "revamp" ? `- URL existing: ${data.urlExisting || "belum tersedia"}` : ""}
${data.catatanTambahan ? `- Catatan: ${data.catatanTambahan}` : ""}

ASET: Company profile: ${data.adaCompanyProfile ? "Ada" : "Tidak"} | Logo: ${data.adaLogo ? "Ada" : "Tidak"} | Foto: ${data.adaFoto ? "Ada" : "Tidak"} | Konten: ${data.adaKonten ? "Ada" : "Tidak"}

${slideStructure}

OUTPUT: Tulis konten LENGKAP per slide dengan header "## SLIDE [nomor]: [judul]". Bahasa profesional & strategis. Positioning statement harus spesifik & powerful.

${extraInstructions}`;
}

const API_KEY = typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_ANTHROPIC_API_KEY || "") : "";

export default function App() {
  const [step, setStep] = useState(0);
  const initData = {
    jasa: "", namaPerusahaan: "", industri: "", targetMarket: "", lokasi: "", deskripsiBisnis: "", pembeda: "", masalahUtama: "",
    tujuanWebsite: "", targetAudience: "", fiturKhusus: "", referensiWebsite: "", timeline: "",
    urlExisting: "", masalahWebsite: "", yangDipertahankan: "", yangDiubah: "",
    adaCompanyProfile: false, adaLogo: false, adaFoto: false, adaKonten: false, catatanTambahan: "",
  };
  const [data, setData] = useState(initData);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const resultRef = useRef(null);

  const update = useCallback((key, val) => {
    setData((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleCheck = useCallback((key) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const visibleSteps = STEPS.filter((s) => s.id !== "revamp" || data.jasa === "revamp");
  const currentStepData = visibleSteps[step];

  const canNext = () => {
    if (currentStepData.id === "jasa") return !!data.jasa;
    if (currentStepData.id === "client") return !!data.namaPerusahaan && !!data.industri;
    return true;
  };

  const handleGenerate = async () => {
    if (!API_KEY) { setError("API Key belum diset. Tambahkan VITE_ANTHROPIC_API_KEY di environment variables."); return; }
    setGenerating(true); setError(""); setResult("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 8000, messages: [{ role: "user", content: buildPrompt(data) }] }),
      });
      const rd = await response.json();
      if (rd.content) { setResult(rd.content.map((item) => (item.type === "text" ? item.text : "")).filter(Boolean).join("\n")); }
      else if (rd.error) { setError(rd.error.message || "Terjadi error dari API"); }
      else { setError("Response tidak valid"); }
    } catch (err) { setError("Gagal menghubungi API: " + err.message); }
    setGenerating(false);
  };

  const handleCopy = (text, setter) => { navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); }); };
  const goNext = () => { if (step < visibleSteps.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" }); }, [result]);
  const resetAll = () => { setResult(""); setStep(0); setError(""); setData(initData); };

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #E2E2E2", borderRadius: "10px",
    fontSize: "14px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", outline: "none",
    background: "#fff", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#111",
  };

  const renderInput = (label, key, placeholder, opts = {}) => (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#222", marginBottom: "7px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
        {opts.optional && <span style={{ color: "#AAA", fontWeight: 400, marginLeft: "6px", fontSize: "12px" }}>opsional</span>}
      </label>
      {opts.multiline ? (
        <textarea value={data[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          onFocus={(e) => { e.target.style.borderColor = "#F3C11B"; e.target.style.boxShadow = "0 0 0 3px rgba(243,193,27,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E2E2E2"; e.target.style.boxShadow = "none"; }} />
      ) : (
        <input type="text" value={data[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "#F3C11B"; e.target.style.boxShadow = "0 0 0 3px rgba(243,193,27,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E2E2E2"; e.target.style.boxShadow = "none"; }} />
      )}
    </div>
  );

  const renderCheck = (label, key) => {
    const isChecked = data[key];
    return (
      <div
        onClick={() => toggleCheck(key)}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleCheck(key); }}}
        style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "10px",
          cursor: "pointer", userSelect: "none",
          background: isChecked ? "rgba(243,193,27,0.06)" : "#fff",
          border: isChecked ? "1.5px solid #F3C11B" : "1px solid #E8E8E8",
          transition: "all 0.15s ease", marginBottom: "10px",
        }}
      >
        <div style={{
          width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
          border: isChecked ? "none" : "2px solid #CCC",
          background: isChecked ? "#F3C11B" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s ease",
        }}>
          {isChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span style={{ fontSize: "14px", color: "#222", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: isChecked ? 600 : 400 }}>{label}</span>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStepData.id) {
      case "jasa":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pilih Jenis Jasa</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>Apa yang dibutuhkan client?</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {JASA_OPTIONS.map((opt) => {
              const sel = data.jasa === opt.id;
              return (
                <button key={opt.id} onClick={() => update("jasa", opt.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px",
                    border: sel ? "2px solid #111" : "1px solid #E8E8E8",
                    borderRadius: "14px", background: sel ? "#FAFAF5" : "#fff",
                    cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: sel ? "0 2px 12px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
                  }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: sel ? "#F3C11B" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, transition: "all 0.2s" }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#111" }}>{opt.title}</div>
                    <div style={{ fontSize: "13px", color: "#888", marginTop: "3px", lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                  {sel && <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#F3C11B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>}
                </button>
              );
            })}
          </div>
        </div>);

      case "client":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Informasi Client</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Isi sebisanya \u2014 yang kosong akan diisi otomatis oleh AI</p>
          </div>
          {renderInput("Nama Perusahaan", "namaPerusahaan", "PT Contoh Maju Bersama")}
          {renderInput("Industri / Bidang", "industri", "contoh: Pertahanan, F&B, Logistik")}
          {renderInput("Target Market", "targetMarket", "contoh: Kemhan, TNI, B2B enterprise", { optional: true })}
          {renderInput("Lokasi", "lokasi", "Jakarta, Indonesia", { optional: true })}
          {renderInput("Deskripsi Bisnis", "deskripsiBisnis", "Jelaskan singkat tentang bisnis client...", { multiline: true, optional: true })}
          {renderInput("Pembeda dari kompetitor", "pembeda", "Keunggulan unik, sertifikasi, pengalaman", { optional: true })}
        </div>);

      case "detail":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Detail Project</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Informasi tentang kebutuhan website</p>
          </div>
          {renderInput("Masalah / Kebutuhan Utama", "masalahUtama", "contoh: Belum punya representasi digital profesional", { multiline: true })}
          {renderInput("Tujuan Utama Website", "tujuanWebsite", "contoh: Meningkatkan kredibilitas, generate leads", { optional: true })}
          {renderInput("Target Audience Website", "targetAudience", "contoh: Partner B2B internasional, investor", { optional: true })}
          {renderInput("Fitur Khusus", "fiturKhusus", "contoh: Multi-language, portfolio, inquiry form", { optional: true })}
          {renderInput("Referensi Website", "referensiWebsite", "URL referensi, pisahkan dengan koma", { optional: true })}
          {renderInput("Timeline", "timeline", "contoh: 1-2 bulan", { optional: true })}
        </div>);

      case "revamp":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Website Existing</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Informasi website yang akan di-revamp</p>
          </div>
          {renderInput("URL Website Existing", "urlExisting", "https://www.contoh.com")}
          {renderInput("Masalah Utama Website Saat Ini", "masalahWebsite", "contoh: Design outdated, tidak responsive", { multiline: true })}
          {renderInput("Yang Ingin Dipertahankan", "yangDipertahankan", "contoh: Konten blog, domain, brand colors", { optional: true })}
          {renderInput("Yang Ingin Diubah", "yangDiubah", "contoh: Layout, navigasi, visual design", { optional: true })}
        </div>);

      case "aset":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Aset yang Tersedia</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Centang aset yang sudah dimiliki client</p>
          </div>
          {renderCheck("Company Profile (PDF/PPTX)", "adaCompanyProfile")}
          {renderCheck("Logo HD", "adaLogo")}
          {renderCheck("Foto-foto (fasilitas, produk, tim)", "adaFoto")}
          {renderCheck("Konten / Copy Existing", "adaKonten")}
          <div style={{ marginTop: "20px" }}>
            {renderInput("Catatan Tambahan", "catatanTambahan", "Informasi lain yang relevan...", { multiline: true, optional: true })}
          </div>
        </div>);

      case "review":
        const jLabel = JASA_OPTIONS.find((j) => j.id === data.jasa)?.title || "-";
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review & Generate</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Pastikan informasi sudah benar sebelum generate</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", border: "1px solid #EBEBEB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "#111", color: "#F3C11B", fontSize: "12px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.3px" }}>{jLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[["Perusahaan", data.namaPerusahaan], ["Industri", data.industri], ["Target Market", data.targetMarket], ["Timeline", data.timeline], ["Tujuan", data.tujuanWebsite], ["Fitur", data.fiturKhusus]].filter(([, v]) => v).map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{l}</div>
                  <div style={{ fontSize: "14px", color: "#222", fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {data.jasa === "revamp" && data.urlExisting && <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F0F0F0" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Website Existing</div>
              <div style={{ fontSize: "14px", color: "#222", fontWeight: 500 }}>{data.urlExisting}</div>
            </div>}
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F0F0F0" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Aset</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[["Compro", data.adaCompanyProfile], ["Logo", data.adaLogo], ["Foto", data.adaFoto], ["Konten", data.adaKonten]].map(([l, h]) => (
                  <span key={l} style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: h ? "rgba(243,193,27,0.12)" : "#F5F5F5", color: h ? "#111" : "#BBB", border: h ? "1px solid rgba(243,193,27,0.3)" : "1px solid #EEE" }}>
                    {h ? "\u2713" : "\u2717"} {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleGenerate} disabled={generating}
              style={{
                flex: 1, padding: "16px", background: generating ? "#555" : "#111", color: "#F3C11B",
                border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                cursor: generating ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "0.3px", transition: "all 0.2s",
                boxShadow: generating ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
              }}>
              {generating ? "\u23F3 Generating..." : "\u26A1 Generate Deck"}
            </button>
            <button onClick={() => handleCopy(buildPrompt(data), setCopiedPrompt)}
              style={{
                padding: "16px 20px", background: copiedPrompt ? "#111" : "#fff",
                color: copiedPrompt ? "#F3C11B" : "#333",
                border: "1px solid #DDD", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}>
              {copiedPrompt ? "\u2713 Copied!" : "Copy Prompt"}
            </button>
          </div>
          {error && <div style={{ marginTop: "16px", padding: "16px", background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "12px", color: "#C53030", fontSize: "13px", lineHeight: 1.5 }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: "8px", color: "#888", fontSize: "12px" }}>Tip: Klik "Copy Prompt" lalu paste langsung ke chat Claude sebagai alternatif.</div>
          </div>}
        </div>);
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "#111", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #F3C11B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F3C11B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>D</div>
          <div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.3px" }}>Deck IT Strategy</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Banana Digital Boost</div>
          </div>
        </div>
        {result && <button onClick={resetAll} style={{ padding: "8px 18px", background: "transparent", color: "#F3C11B", border: "1px solid rgba(243,193,27,0.4)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}>+ New Project</button>}
      </div>

      {/* STEP BAR */}
      {!result && (
        <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "16px 24px 0" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "4px" }}>
            {visibleSteps.map((s, i) => (
              <div key={s.id} style={{ flex: 1, textAlign: "center", paddingBottom: "12px" }}>
                <div style={{ height: "3px", borderRadius: "2px", marginBottom: "8px", background: i === step ? "#F3C11B" : i < step ? "#111" : "#EBEBEB", transition: "all 0.3s ease" }} />
                <span style={{ fontSize: "11px", fontWeight: i === step ? 700 : 500, color: i === step ? "#111" : i < step ? "#666" : "#CCC", letterSpacing: "0.3px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "28px 20px 40px" }}>
        {!result ? (
          <>
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px 24px", border: "1px solid #EBEBEB", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: "20px" }}>
              {renderStep()}
            </div>
            {currentStepData.id !== "review" && (
              <div style={{ display: "flex", gap: "10px" }}>
                {step > 0 && <button onClick={goBack} style={{ padding: "14px 24px", background: "#fff", color: "#333", border: "1px solid #DDD", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>\u2190 Kembali</button>}
                <button onClick={goNext} disabled={!canNext()} style={{
                  flex: 1, padding: "14px 24px",
                  background: canNext() ? "#111" : "#E5E5E5",
                  color: canNext() ? "#F3C11B" : "#AAA",
                  border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700,
                  cursor: canNext() ? "pointer" : "not-allowed",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: canNext() ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.2s",
                }}>Lanjut \u2192</button>
              </div>
            )}
          </>
        ) : (
          <div ref={resultRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Konten Pitching Deck</h2>
                <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0 0" }}>{data.namaPerusahaan} \u2014 {JASA_OPTIONS.find((j) => j.id === data.jasa)?.title}</p>
              </div>
              <button onClick={() => handleCopy(result, setCopied)} style={{ padding: "10px 20px", background: copied ? "#111" : "#fff", color: copied ? "#F3C11B" : "#333", border: "1px solid #DDD", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}>{copied ? "\u2713 Copied!" : "Copy All"}</button>
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid #EBEBEB", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap", color: "#222", maxHeight: "70vh", overflow: "auto", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>{result}</div>
            <div style={{ marginTop: "16px", padding: "16px 18px", background: "rgba(243,193,27,0.06)", borderRadius: "12px", border: "1px solid rgba(243,193,27,0.15)", fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
              <strong style={{ color: "#111" }}>Next step:</strong> Copy konten di atas \u2192 Buka Google Slides template BDB \u2192 Paste per slide. Atau paste ke Claude dan minta "buatkan PPTX dari konten ini dengan design system BDB".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
