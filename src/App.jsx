import { useState, useEffect, useRef } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const STEPS = [
  { id: "jasa", label: "Jenis Jasa" },
  { id: "client", label: "Info Client" },
  { id: "detail", label: "Detail Project" },
  { id: "revamp", label: "Website Existing" },
  { id: "aset", label: "Aset Tersedia" },
  { id: "review", label: "Review & Generate" },
];

const JASA_OPTIONS = [
  { id: "website_baru", title: "Pembuatan Website Baru", desc: "Client belum punya website atau ingin website dari nol", icon: "\U0001f310" },
  { id: "revamp", title: "Revamp / Redesign Website", desc: "Client sudah punya website tapi ingin diperbaiki", icon: "\U0001f504" },
  { id: "maintenance", title: "Maintenance & Retainer", desc: "Client butuh support ongoing untuk website yang sudah ada", icon: "\U0001f6e0\ufe0f" },
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

const StepIndicator = ({ steps, current }) => (
  <div style={{ display: "flex", gap: "2px", marginBottom: "32px", padding: "0 4px" }}>
    {steps.map((step, i) => (
      <div key={step.id} style={{ flex: 1, textAlign: "center" }}>
        <div style={{ height: "3px", background: i === current ? "#F3C11B" : i < current ? "#000" : "rgba(0,0,0,0.08)", borderRadius: "2px", transition: "all 0.3s ease" }} />
        <span style={{ fontSize: "10px", fontWeight: i === current ? 700 : 500, color: i <= current ? "#000" : "rgba(0,0,0,0.3)", marginTop: "6px", display: "block", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.label}</span>
      </div>
    ))}
  </div>
);

const InputField = ({ label, value, onChange, placeholder, multiline, optional }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#000", marginBottom: "6px", letterSpacing: "0.3px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {label}{optional && <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 400, marginLeft: "6px", fontSize: "11px" }}>opsional</span>}
    </label>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "8px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFAFA", boxSizing: "border-box" }}
        onFocus={(e) => (e.target.style.borderColor = "#F3C11B")} onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />
    ) : (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "8px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", background: "#FAFAFA", boxSizing: "border-box" }}
        onFocus={(e) => (e.target.style.borderColor = "#F3C11B")} onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />
    )}
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", background: checked ? "rgba(243,193,27,0.08)" : "#FAFAFA", border: checked ? "1.5px solid #F3C11B" : "1.5px solid rgba(0,0,0,0.08)", transition: "all 0.2s", marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: checked ? "2px solid #F3C11B" : "2px solid rgba(0,0,0,0.2)", background: checked ? "#F3C11B" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {checked && <span style={{ color: "#000", fontSize: "12px", fontWeight: 700 }}>{"\u2713"}</span>}
    </div>
    <span style={{ fontSize: "13px", color: "#000" }}>{label}</span>
  </label>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    jasa: "", namaPerusahaan: "", industri: "", targetMarket: "", lokasi: "", deskripsiBisnis: "", pembeda: "", masalahUtama: "",
    tujuanWebsite: "", targetAudience: "", fiturKhusus: "", referensiWebsite: "", timeline: "",
    urlExisting: "", masalahWebsite: "", yangDipertahankan: "", yangDiubah: "",
    adaCompanyProfile: false, adaLogo: false, adaFoto: false, adaKonten: false, catatanTambahan: "",
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const resultRef = useRef(null);

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const visibleSteps = STEPS.filter((s) => s.id !== "revamp" || data.jasa === "revamp");
  const currentStepData = visibleSteps[step];

  const canNext = () => {
    if (currentStepData.id === "jasa") return !!data.jasa;
    if (currentStepData.id === "client") return !!data.namaPerusahaan && !!data.industri;
    return true;
  };

  const handleGenerate = async () => {
    if (!API_KEY) { setError("API Key belum diset. Tambahkan VITE_ANTHROPIC_API_KEY di file .env"); return; }
    setGenerating(true); setError(""); setResult("");
    const prompt = buildPrompt(data);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
      });
      const rd = await response.json();
      if (rd.content) {
        setResult(rd.content.map((item) => (item.type === "text" ? item.text : "")).filter(Boolean).join("\n"));
      } else if (rd.error) { setError(rd.error.message || "Terjadi error dari API");
      } else { setError("Response tidak valid"); }
    } catch (err) { setError("Gagal menghubungi API: " + err.message); }
    setGenerating(false);
  };

  const handleCopy = (text, setter) => { navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); }); };
  const goNext = () => { if (step < visibleSteps.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" }); }, [result]);

  const resetAll = () => {
    setResult(""); setStep(0); setError("");
    setData({ jasa: "", namaPerusahaan: "", industri: "", targetMarket: "", lokasi: "", deskripsiBisnis: "", pembeda: "", masalahUtama: "", tujuanWebsite: "", targetAudience: "", fiturKhusus: "", referensiWebsite: "", timeline: "", urlExisting: "", masalahWebsite: "", yangDipertahankan: "", yangDiubah: "", adaCompanyProfile: false, adaLogo: false, adaFoto: false, adaKonten: false, catatanTambahan: "" });
  };

  const renderStep = () => {
    switch (currentStepData.id) {
      case "jasa":
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pilih Jenis Jasa</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Apa yang dibutuhkan client?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {JASA_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => update("jasa", opt.id)}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", border: data.jasa === opt.id ? "2px solid #000" : "1.5px solid rgba(0,0,0,0.1)", borderRadius: "12px", background: data.jasa === opt.id ? "rgba(243,193,27,0.06)" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span style={{ fontSize: "28px" }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#000" }}>{opt.title}</div>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{opt.desc}</div>
                </div>
                {data.jasa === opt.id && <div style={{ marginLeft: "auto", width: "22px", height: "22px", borderRadius: "50%", background: "#F3C11B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: "#000", fontSize: "13px", fontWeight: 700 }}>{"\u2713"}</span></div>}
              </button>
            ))}
          </div>
        </div>);
      case "client":
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Informasi Client</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Isi sebisanya — yang kosong akan diisi otomatis oleh AI</p>
          <InputField label="Nama Perusahaan" value={data.namaPerusahaan} onChange={(v) => update("namaPerusahaan", v)} placeholder="PT Contoh Maju Bersama" />
          <InputField label="Industri / Bidang" value={data.industri} onChange={(v) => update("industri", v)} placeholder="contoh: Pertahanan, F&B, Logistik" />
          <InputField label="Target Market" value={data.targetMarket} onChange={(v) => update("targetMarket", v)} placeholder="contoh: Kemhan, TNI, B2B enterprise" optional />
          <InputField label="Lokasi" value={data.lokasi} onChange={(v) => update("lokasi", v)} placeholder="Jakarta, Indonesia" optional />
          <InputField label="Deskripsi Bisnis" value={data.deskripsiBisnis} onChange={(v) => update("deskripsiBisnis", v)} placeholder="Jelaskan singkat tentang bisnis client..." multiline optional />
          <InputField label="Pembeda dari kompetitor" value={data.pembeda} onChange={(v) => update("pembeda", v)} placeholder="Keunggulan unik, sertifikasi, pengalaman" optional />
        </div>);
      case "detail":
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Detail Project</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Informasi tentang kebutuhan website</p>
          <InputField label="Masalah / Kebutuhan Utama" value={data.masalahUtama} onChange={(v) => update("masalahUtama", v)} placeholder="contoh: Belum punya representasi digital profesional" multiline />
          <InputField label="Tujuan Utama Website" value={data.tujuanWebsite} onChange={(v) => update("tujuanWebsite", v)} placeholder="contoh: Meningkatkan kredibilitas, generate leads" optional />
          <InputField label="Target Audience Website" value={data.targetAudience} onChange={(v) => update("targetAudience", v)} placeholder="contoh: Partner B2B internasional, investor" optional />
          <InputField label="Fitur Khusus" value={data.fiturKhusus} onChange={(v) => update("fiturKhusus", v)} placeholder="contoh: Multi-language, portfolio, inquiry form" optional />
          <InputField label="Referensi Website" value={data.referensiWebsite} onChange={(v) => update("referensiWebsite", v)} placeholder="URL referensi, pisahkan dengan koma" optional />
          <InputField label="Timeline" value={data.timeline} onChange={(v) => update("timeline", v)} placeholder="contoh: 1-2 bulan" optional />
        </div>);
      case "revamp":
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Website Existing</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Informasi website yang akan di-revamp</p>
          <InputField label="URL Website Existing" value={data.urlExisting} onChange={(v) => update("urlExisting", v)} placeholder="https://www.contoh.com" />
          <InputField label="Masalah Utama Website Saat Ini" value={data.masalahWebsite} onChange={(v) => update("masalahWebsite", v)} placeholder="contoh: Design outdated, tidak responsive" multiline />
          <InputField label="Yang Ingin Dipertahankan" value={data.yangDipertahankan} onChange={(v) => update("yangDipertahankan", v)} placeholder="contoh: Konten blog, domain, brand colors" optional />
          <InputField label="Yang Ingin Diubah" value={data.yangDiubah} onChange={(v) => update("yangDiubah", v)} placeholder="contoh: Layout, navigasi, visual design" optional />
        </div>);
      case "aset":
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Aset yang Tersedia</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Centang aset yang sudah dimiliki client</p>
          <CheckboxField label="Company Profile (PDF/PPTX)" checked={data.adaCompanyProfile} onChange={() => update("adaCompanyProfile", !data.adaCompanyProfile)} />
          <CheckboxField label="Logo HD" checked={data.adaLogo} onChange={() => update("adaLogo", !data.adaLogo)} />
          <CheckboxField label="Foto-foto (fasilitas, produk, tim)" checked={data.adaFoto} onChange={() => update("adaFoto", !data.adaFoto)} />
          <CheckboxField label="Konten / Copy Existing" checked={data.adaKonten} onChange={() => update("adaKonten", !data.adaKonten)} />
          <div style={{ marginTop: "16px" }}>
            <InputField label="Catatan Tambahan" value={data.catatanTambahan} onChange={(v) => update("catatanTambahan", v)} placeholder="Informasi lain yang relevan..." multiline optional />
          </div>
        </div>);
      case "review":
        const jLabel = JASA_OPTIONS.find((j) => j.id === data.jasa)?.title || "-";
        return (<div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review & Generate</h2>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", margin: "0 0 20px 0" }}>Cek ringkasan sebelum generate</p>
          <div style={{ background: "#FAFAFA", borderRadius: "12px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Jenis Jasa</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{jLabel}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[["Perusahaan", data.namaPerusahaan], ["Industri", data.industri], ["Target Market", data.targetMarket], ["Timeline", data.timeline], ["Tujuan", data.tujuanWebsite], ["Fitur", data.fiturKhusus]].filter(([, v]) => v).map(([l, v]) => (
                <div key={l}><div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>{l}</div><div style={{ fontSize: "13px" }}>{v}</div></div>
              ))}
            </div>
            {data.jasa === "revamp" && data.urlExisting && <div style={{ marginTop: "12px" }}><div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Website Existing</div><div style={{ fontSize: "13px" }}>{data.urlExisting}</div></div>}
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Aset Tersedia</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "12px" }}>
                {[["Compro", data.adaCompanyProfile], ["Logo", data.adaLogo], ["Foto", data.adaFoto], ["Konten", data.adaKonten]].map(([l, h]) => (
                  <span key={l} style={{ padding: "3px 10px", borderRadius: "20px", background: h ? "rgba(243,193,27,0.15)" : "rgba(0,0,0,0.05)", color: h ? "#000" : "rgba(0,0,0,0.35)", fontWeight: h ? 600 : 400 }}>{h ? "\u2713" : "\u2717"} {l}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleGenerate} disabled={generating}
              style={{ flex: 1, padding: "14px", background: generating ? "#666" : "#000", color: generating ? "#ccc" : "#F3C11B", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.5px" }}>
              {generating ? "\u23f3 Generating konten deck..." : "\u26a1 Generate Pitching Deck"}
            </button>
            <button onClick={() => handleCopy(buildPrompt(data), setCopiedPrompt)}
              style={{ padding: "14px 18px", background: "#fff", color: "#000", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
              {copiedPrompt ? "\u2713 Copied!" : "\U0001f4cb Copy Prompt"}
            </button>
          </div>
          {error && <div style={{ marginTop: "16px", padding: "14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", color: "#991B1B", fontSize: "13px" }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>{"\U0001f4a1"} Tip: Klik "Copy Prompt" lalu paste langsung ke chat Claude sebagai alternatif.</div>
          </div>}
        </div>);
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: "#000", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F3C11B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", color: "#000" }}>B</div>
          <div>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.3px" }}>BDB Deck Agent</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "0.5px" }}>BANANA DIGITAL BOOST</div>
          </div>
        </div>
        {result && <button onClick={resetAll} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "#F3C11B", border: "1px solid rgba(243,193,27,0.3)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ New Project</button>}
      </div>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px" }}>
        {!result ? (
          <>
            <StepIndicator steps={visibleSteps} current={step} />
            {renderStep()}
            {currentStepData.id !== "review" && (
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                {step > 0 && <button onClick={goBack} style={{ padding: "12px 24px", background: "#fff", color: "#000", border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{"\u2190"} Kembali</button>}
                <button onClick={goNext} disabled={!canNext()} style={{ flex: 1, padding: "12px 24px", background: canNext() ? "#000" : "rgba(0,0,0,0.1)", color: canNext() ? "#F3C11B" : "rgba(0,0,0,0.3)", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.3px" }}>Lanjut {"\u2192"}</button>
              </div>
            )}
          </>
        ) : (
          <div ref={resultRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Konten Pitching Deck</h2>
                <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "12px", margin: "4px 0 0 0" }}>{data.namaPerusahaan} {"\u2014"} {JASA_OPTIONS.find((j) => j.id === data.jasa)?.title}</p>
              </div>
              <button onClick={() => handleCopy(result, setCopied)} style={{ padding: "10px 18px", background: copied ? "#000" : "#fff", color: copied ? "#F3C11B" : "#000", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{copied ? "\u2713 Copied!" : "\U0001f4cb Copy All"}</button>
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid rgba(0,0,0,0.06)", fontSize: "13px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "#1a1a1a", maxHeight: "70vh", overflow: "auto" }}>{result}</div>
            <div style={{ marginTop: "16px", padding: "14px", background: "rgba(243,193,27,0.08)", borderRadius: "10px", border: "1px solid rgba(243,193,27,0.2)", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: "1.6" }}>
              <strong style={{ color: "#000" }}>{"\U0001f4a1"} Next step:</strong> Copy konten di atas {"\u2192"} Buka Google Slides template BDB {"\u2192"} Paste konten ke masing-masing slide. Atau paste ke Claude chat dan minta "buatkan PPTX dari konten ini dengan design system BDB" untuk generate file langsung.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
