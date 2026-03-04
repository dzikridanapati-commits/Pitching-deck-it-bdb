import { useState, useEffect, useRef, useCallback } from "react";
import { generatePPTX } from "./pptxGenerator.js";

const API_KEY = typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_ANTHROPIC_API_KEY || "") : "";

const STEPS = [
  { id: "jasa", label: "Jenis Jasa" },
  { id: "upload", label: "Upload File" },
  { id: "client", label: "Info Client" },
  { id: "detail", label: "Detail Project" },
  { id: "revamp", label: "Website Existing" },
  { id: "aset", label: "Aset & Catatan" },
  { id: "review", label: "Review & Generate" },
];

const JASA_OPTIONS = [
  { id: "website_baru", title: "Pembuatan Website Baru", desc: "Client belum punya website atau ingin dari nol", icon: "\u{1f310}" },
  { id: "revamp", title: "Revamp / Redesign Website", desc: "Client sudah punya website tapi ingin diperbaiki", icon: "\u{1f504}" },
  { id: "maintenance", title: "Maintenance & Retainer", desc: "Client butuh support ongoing untuk website", icon: "\u{1f6e0}\ufe0f" },
];

const FILE_TYPES = [
  { id: "compro", label: "Company Profile", accept: ".pdf,.pptx,.ppt,.docx,.doc", icon: "\u{1f4c4}" },
  { id: "screenshot", label: "Screenshot Website", accept: ".png,.jpg,.jpeg,.webp,.gif", icon: "\u{1f5bc}\ufe0f" },
  { id: "logo", label: "Logo / Brand Assets", accept: ".png,.jpg,.jpeg,.svg,.webp", icon: "\u{2b50}" },
  { id: "brief", label: "Brief Document", accept: ".pdf,.docx,.doc,.txt", icon: "\u{1f4dd}" },
];

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function getMediaType(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const map = {
    pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

function isImageFile(file) {
  return file.type.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.name);
}

function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function buildPromptText(data, fileCount) {
  const jasaLabel = JASA_OPTIONS.find((j) => j.id === data.jasa)?.title || data.jasa;
  let slideStructure = "";
  let extraInstructions = "";

  if (data.jasa === "website_baru") {
    slideStructure = `STRUKTUR SLIDE:
## SLIDE 1: Cover
- Judul: "Corporate Website Strategy"
- Nama perusahaan: "${data.namaPerusahaan}"

## SLIDE 2: Understanding the Business
- Analisis MENDALAM industri ${data.industri}: ekosistem, lanskap kompetitif, tren digital di industri ini
- JANGAN hanya copy deskripsi bisnis dari input. Elaborasi menjadi 3-4 poin strategis tentang: karakteristik industri, tantangan digital, peluang pasar, dan posisi client di ekosistem
- Target Market: breakdown siapa saja, apa pain points mereka, bagaimana mereka mencari provider/partner secara digital

## SLIDE 3: Corporate Positioning Framework
- Current Perception: analisis bagaimana pasar saat ini melihat ${data.namaPerusahaan} (berdasarkan konteks industri dan bisnis, BUKAN copy dari input user)
- Target Positioning: posisi ideal yang realistis dan spesifik untuk industri ${data.industri}
- Positioning Statement: kalimat kuat 1-2 baris yang menyatukan value proposition, differensiator, dan target audience

## SLIDE 4: Why This Website Matters
- "Why Now?": 4-5 alasan STRATEGIS dan SPESIFIK untuk industri ${data.industri}, bukan generik. Hubungkan dengan tren industri, perilaku buyer, dan kebutuhan digital saat ini
- "Risiko jika tidak dilakukan": 3-4 risiko KONKRET yang relevan dengan konteks bisnis client, bukan generik seperti "kurang profesional"

## SLIDE 5: Referensi Website
- Rekomendasikan 3 website NYATA dari industri serupa atau adjacent yang bisa dijadikan benchmark
- Setiap referensi harus punya URL valid dan 2-3 alasan SPESIFIK kenapa dijadikan referensi (struktur, UX, konten strategy, teknologi)
${data.referensiWebsite ? `- User menyebutkan referensi: ${data.referensiWebsite}. Analisis referensi ini DAN tambahkan rekomendasi lain jika perlu` : "- Carikan referensi terbaik dari industri serupa"}

## SLIDE 6: Website Structure (Sitemap)
- Buat sitemap yang STRATEGIS, bukan generik. Sesuaikan halaman dengan kebutuhan spesifik industri ${data.industri}
- Jelaskan ALASAN di balik setiap halaman: apa fungsi strategisnya
- Maksimal 6-8 halaman utama

## SLIDE 7: Homepage Strategy
- Breakdown section-by-section homepage dengan ALASAN strategis per section
- Setiap section harus punya: nama section, deskripsi konten, dan TUJUAN strategis (membangun trust, showcase kapabilitas, generate inquiry, dll)
- Urutkan berdasarkan user journey dan conversion funnel

## SLIDE 8: Technical Strategy
- Technical Scope yang RELEVAN untuk industri ${data.industri} dan skala bisnis client
- Fitur khusus: ${data.fiturKhusus || "sesuaikan dengan kebutuhan industri dan target market"}
- Jelaskan KENAPA setiap fitur penting untuk mencapai tujuan website

## SLIDE 9: Data & Asset Requirement
- "Client harus menyiapkan": list SPESIFIK berdasarkan jenis konten yang dibutuhkan untuk industri ${data.industri}
- "Jika Data Belum Lengkap": solusi PRAKTIS dan timeline pengumpulan aset

## SLIDE 10: Timeline & Risk
- Timeline: breakdown per fase yang realistis untuk scope project ini (${data.timeline || "1-2 bulan"})
- Risk: identifikasi risiko SPESIFIK untuk project ini (bukan generik), dan berikan mitigasi yang actionable

## SLIDE 11: Closing
- "Let's Kick Start Your Achievement!"`;
    extraInstructions = `INSTRUKSI ANALISIS TAMBAHAN:
- Riset dan pahami industri ${data.industri}: siapa pemain utama, bagaimana digital presence mereka, apa standar industri
- Carikan 3 website referensi NYATA yang relevan dengan industri ${data.industri}
- Buat positioning statement yang UNIK dan SPESIFIK untuk ${data.namaPerusahaan}, bukan template generik
- Pastikan SEMUA poin di setiap slide saling KONSISTEN dan mendukung narasi keseluruhan deck`;
  } else if (data.jasa === "revamp") {
    slideStructure = `STRUKTUR SLIDE:
## SLIDE 1: Cover - "Website Revamp Strategy" + "${data.namaPerusahaan}"
## SLIDE 2: Understanding the Business - Analisis mendalam industri, bukan copy paste input
## SLIDE 3: Current Website Audit - Analisis kelebihan & kekurangan berdasarkan standar industri ${data.industri}. ${data.urlExisting ? `Analisis website: ${data.urlExisting}` : ""}
## SLIDE 4: Why Revamp Now - Alasan STRATEGIS spesifik, bukan generik
## SLIDE 5: Competitive Benchmark - 3 referensi website NYATA dari industri serupa
## SLIDE 6: Revamp Goals & KPI - Target TERUKUR dan realistis
## SLIDE 7: Proposed Changes - ${data.yangDiubah || "design, structure, content, technical"} — jelaskan KENAPA setiap perubahan penting
## SLIDE 8: New Sitemap - Struktur baru yang strategis
## SLIDE 9: Homepage Redesign Strategy - Section by section dengan alasan strategis
## SLIDE 10: Technical Upgrade Plan - Fitur: ${data.fiturKhusus || "responsive, SEO, performance"} — dengan justifikasi
## SLIDE 11: Data & Asset Requirement
## SLIDE 12: Timeline & Risk - Realistis untuk scope revamp
## SLIDE 13: Closing`;
    extraInstructions = `INSTRUKSI ANALISIS TAMBAHAN:
- ${data.urlExisting ? `Analisis mendalam website existing ${data.urlExisting}: apa yang sudah baik, apa yang harus diubah, dan kenapa` : "Berikan framework audit website yang relevan"}
- Pertahankan: ${data.yangDipertahankan || "identifikasi sendiri berdasarkan analisis"}
- Ubah: ${data.yangDiubah || "identifikasi berdasarkan gap analysis dengan standar industri"}
- Bandingkan dengan best practices industri ${data.industri}`;
  } else {
    slideStructure = `STRUKTUR SLIDE:
## SLIDE 1: Cover - "Website Maintenance & Support" + "${data.namaPerusahaan}"
## SLIDE 2: Understanding Current Setup - Analisis kebutuhan maintenance untuk industri ${data.industri}
## SLIDE 3: Why Ongoing Maintenance Matters - Data dan insight kenapa maintenance kritikal
## SLIDE 4: Scope of Services - Detail layanan SPESIFIK, bukan generik
## SLIDE 5: Service Level Tiers - 3 tier dengan harga value proposition yang jelas dan diferensiasi tajam
## SLIDE 6: Reporting & Communication - Framework komunikasi yang profesional
## SLIDE 7: Timeline & Onboarding - Proses onboarding yang terstruktur
## SLIDE 8: Risk & Mitigation - Risiko spesifik untuk maintenance dan mitigasinya
## SLIDE 9: Closing`;
    extraInstructions = `INSTRUKSI ANALISIS TAMBAHAN:
- Buat 3 tier paket (Basic/Standard/Premium) dengan scope yang jelas dan value proposition berbeda
- SLA realistis per tier berdasarkan standar industri
- Include metrics dan KPI untuk setiap tier`;
  }

  return `PERAN: Kamu adalah SENIOR DIGITAL STRATEGIST dari Banana Digital Boost, sebuah digital agency yang menangani corporate website strategy. Kamu memiliki pengalaman 10+ tahun di digital strategy dan memahami berbagai industri.

TUGAS: Buatkan KONTEN STRATEGIS MENDALAM untuk pitching deck "${jasaLabel}" dalam Bahasa Indonesia.

ATURAN PENTING:
1. JANGAN copy-paste jawaban dari input client. Input client adalah BAHAN MENTAH yang harus kamu ANALISIS, ELABORASI, dan TRANSFORMASI menjadi insight strategis
2. Setiap poin harus menunjukkan KEDALAMAN ANALISIS — bukan sekadar rephrasing input
3. KONSISTENSI: pastikan narasi dari slide 1 sampai terakhir saling mendukung dan tidak kontradiktif
4. Gunakan bahasa PROFESIONAL tapi tidak bertele-tele. Setiap kalimat harus punya value
5. Jika ada file yang diupload, PRIORITASKAN informasi dari file tersebut dan CROSS-CHECK dengan input form
6. Berikan insight yang menunjukkan kamu MEMAHAMI industri client, bukan template generik
7. Setiap slide harus punya BENANG MERAH yang menghubungkan ke tujuan utama website

INPUT DATA CLIENT (bahan mentah — JANGAN copy langsung, ANALISIS dan ELABORASI):
- Nama Perusahaan: ${data.namaPerusahaan}
- Industri: ${data.industri}
- Target Market: ${data.targetMarket || "belum ditentukan — analisis berdasarkan industri"}
- Lokasi: ${data.lokasi || "Indonesia"}
- Deskripsi Bisnis: ${data.deskripsiBisnis || "belum tersedia — riset berdasarkan industri"}
- Pembeda kompetitor: ${data.pembeda || "belum diidentifikasi — analisis berdasarkan konteks"}
- Masalah utama: ${data.masalahUtama || "butuh kehadiran digital profesional"}
- Tujuan website: ${data.tujuanWebsite || "meningkatkan kredibilitas dan generate leads"}
- Target audience: ${data.targetAudience || data.targetMarket || "B2B dan B2C"}
- Fitur khusus: ${data.fiturKhusus || "belum ditentukan — rekomendasikan berdasarkan industri"}
- Referensi: ${data.referensiWebsite || "belum ada — carikan referensi website terbaik dari industri serupa"}
- Timeline: ${data.timeline || "1-2 bulan"}
${data.jasa === "revamp" ? `- URL existing: ${data.urlExisting || "belum tersedia"}` : ""}
${data.catatanTambahan ? `- Catatan tambahan: ${data.catatanTambahan}` : ""}

ASET TERSEDIA: Company profile: ${data.adaCompanyProfile ? "Ada" : "Tidak"} | Logo: ${data.adaLogo ? "Ada" : "Tidak"} | Foto: ${data.adaFoto ? "Ada" : "Tidak"} | Konten: ${data.adaKonten ? "Ada" : "Tidak"}

${fileCount > 0 ? `FILE YANG DIUPLOAD: ${fileCount} file telah dilampirkan.
INSTRUKSI FILE:
- BACA dan ANALISIS setiap file secara menyeluruh
- EXTRACT semua informasi relevan: profil perusahaan, layanan, portofolio, client list, sertifikasi, visi misi, struktur organisasi
- GUNAKAN data dari file sebagai SUMBER UTAMA — lebih akurat daripada input form
- Jika ada kontradiksi antara file dan input form, PRIORITASKAN informasi dari file
- CROSS-REFERENCE informasi antar file untuk insight yang lebih kaya
` : "CATATAN: Tidak ada file yang diupload. Gunakan input form dan pengetahuanmu tentang industri untuk menghasilkan konten strategis yang relevan.\n"}

${slideStructure}

FORMAT OUTPUT:
- Tulis konten per slide dengan header "## SLIDE [nomor]: [judul]"
- Setiap poin harus SUBSTANTIF (bukan bullet generik)
- Untuk referensi website, gunakan URL yang NYATA dan VALID
- Setiap slide minimal 4-6 poin strategis yang saling terhubung

${extraInstructions}`;
}

async function buildMessages(data, files) {
  const textPrompt = buildPromptText(data, files.length);
  const contentParts = [];

  for (const fileObj of files) {
    try {
      const base64 = await fileToBase64(fileObj.file);
      if (isPdfFile(fileObj.file)) {
        contentParts.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        });
      } else if (isImageFile(fileObj.file)) {
        const mediaType = getMediaType(fileObj.file);
        if (mediaType !== "image/svg+xml") {
          contentParts.push({
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          });
        }
      }
    } catch (err) {
      console.error("Error processing file:", fileObj.file.name, err);
    }
  }

  contentParts.push({ type: "text", text: textPrompt });
  return [{ role: "user", content: contentParts }];
}

export default function App() {
  const [step, setStep] = useState(0);
  const initData = {
    jasa: "", namaPerusahaan: "", industri: "", targetMarket: "", lokasi: "", deskripsiBisnis: "", pembeda: "", masalahUtama: "",
    tujuanWebsite: "", targetAudience: "", fiturKhusus: "", referensiWebsite: "", timeline: "",
    urlExisting: "", masalahWebsite: "", yangDipertahankan: "", yangDiubah: "",
    adaCompanyProfile: false, adaLogo: false, adaFoto: false, adaKonten: false, catatanTambahan: "",
    brandPrimary: "#F5A623", brandSecondary: "#F3C11B",
  };
  const [data, setData] = useState(initData);
  const [files, setFiles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [generatingPptx, setGeneratingPptx] = useState(false);
  const resultRef = useRef(null);
  const fileInputRefs = useRef({});

  const update = useCallback((key, val) => setData((prev) => ({ ...prev, [key]: val })), []);
  const toggleCheck = useCallback((key) => setData((prev) => ({ ...prev, [key]: !prev[key] })), []);

  const visibleSteps = STEPS.filter((s) => s.id !== "revamp" || data.jasa === "revamp");
  const currentStepData = visibleSteps[step];

  const canNext = () => {
    if (currentStepData.id === "jasa") return !!data.jasa;
    if (currentStepData.id === "client") return !!data.namaPerusahaan && !!data.industri;
    return true;
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total

  const handleFileAdd = (categoryId, e) => {
    const incoming = Array.from(e.target.files);
    const currentTotal = files.reduce((sum, f) => sum + f.size, 0);
    const validFiles = [];
    const errors = [];

    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} terlalu besar (${formatSize(file.size)}). Max 10MB per file.`);
        continue;
      }
      const newTotal = currentTotal + validFiles.reduce((s, f) => s + f.size, 0) + file.size;
      if (newTotal > MAX_TOTAL_SIZE) {
        errors.push(`Total file melebihi 25MB. ${file.name} tidak ditambahkan.`);
        continue;
      }
      validFiles.push({ id: Date.now() + Math.random(), category: categoryId, file, name: file.name, size: file.size });
    }

    if (errors.length > 0) setError(errors.join(" "));
    else setError("");
    if (validFiles.length > 0) setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const handleFileRemove = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleGenerate = async () => {
    if (!API_KEY) { setError("API Key belum diset. Tambahkan VITE_ANTHROPIC_API_KEY di environment variables."); return; }
    setGenerating(true); setError(""); setResult("");
    try {
      const messages = await buildMessages(data, files);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 12000, messages }),
      });
      const rd = await response.json();
      if (rd.content) { setResult(rd.content.map((item) => (item.type === "text" ? item.text : "")).filter(Boolean).join("\n")); }
      else if (rd.error) { setError(rd.error.message || "Terjadi error dari API"); }
      else { setError("Response tidak valid"); }
    } catch (err) { setError("Gagal menghubungi API: " + err.message); }
    setGenerating(false);
  };

  const handleCopy = (text, setter) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); }).catch(() => {
        fallbackCopy(text, setter);
      });
    } else {
      fallbackCopy(text, setter);
    }
  };
  const fallbackCopy = (text, setter) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (e) {
      setError("Gagal copy: " + e.message);
    }
  };

  const handleDownloadPptx = async () => {
    setGeneratingPptx(true);
    setError("");
    try {
      if (!result) { setError("Belum ada konten. Generate dulu sebelum download PPTX."); setGeneratingPptx(false); return; }
      await generatePPTX(data, result);
    } catch (err) {
      console.error("PPTX Error:", err);
      setError("Gagal generate PPTX: " + (err.message || String(err)));
    }
    setGeneratingPptx(false);
  };
  const goNext = () => { if (step < visibleSteps.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" }); }, [result]);
  const resetAll = () => { setResult(""); setStep(0); setError(""); setData(initData); setFiles([]); };

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #E2E2E2", borderRadius: "10px",
    fontSize: "14px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", outline: "none",
    background: "#fff", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s", color: "#111",
  };

  const renderInput = (label, key, placeholder, opts = {}) => (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#222", marginBottom: "7px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}{opts.optional && <span style={{ color: "#AAA", fontWeight: 400, marginLeft: "6px", fontSize: "12px" }}>opsional</span>}
      </label>
      {opts.multiline ? (
        <textarea value={data[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          onFocus={(e) => { e.target.style.borderColor = "#F3C11B"; e.target.style.boxShadow = "0 0 0 3px rgba(243,193,27,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E2E2E2"; e.target.style.boxShadow = "none"; }} />
      ) : (
        <input type="text" value={data[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "#F3C11B"; e.target.style.boxShadow = "0 0 0 3px rgba(243,193,27,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E2E2E2"; e.target.style.boxShadow = "none"; }} />
      )}
    </div>
  );

  const renderCheck = (label, key) => {
    const isChecked = data[key];
    return (
      <div onClick={() => toggleCheck(key)} role="checkbox" aria-checked={isChecked} tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleCheck(key); } }}
        style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "10px",
          cursor: "pointer", userSelect: "none",
          background: isChecked ? "rgba(243,193,27,0.06)" : "#fff",
          border: isChecked ? "1.5px solid #F3C11B" : "1px solid #E8E8E8",
          transition: "all 0.15s ease", marginBottom: "10px",
        }}>
        <div style={{
          width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
          border: isChecked ? "none" : "2px solid #CCC",
          background: isChecked ? "#F3C11B" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
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
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Apa yang dibutuhkan client?</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {JASA_OPTIONS.map((opt) => {
              const sel = data.jasa === opt.id;
              return (
                <button key={opt.id} onClick={() => update("jasa", opt.id)}
                  style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", border: sel ? "2px solid #111" : "1px solid #E8E8E8", borderRadius: "14px", background: sel ? "#FAFAF5" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: sel ? "0 2px 12px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: sel ? "#F3C11B" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#111" }}>{opt.title}</div>
                    <div style={{ fontSize: "13px", color: "#888", marginTop: "3px" }}>{opt.desc}</div>
                  </div>
                  {sel && <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#F3C11B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>}
                </button>
              );
            })}
          </div>
        </div>);

      case "upload":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload File Client</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>AI akan membaca & menganalisis file untuk memperkaya konten deck. Opsional tapi sangat direkomendasikan.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {FILE_TYPES.map((ft) => {
              const categoryFiles = files.filter((f) => f.category === ft.id);
              return (
                <div key={ft.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E8E8E8", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "22px" }}>{ft.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{ft.label}</div>
                        <div style={{ fontSize: "11px", color: "#AAA", marginTop: "2px" }}>{ft.accept.replace(/\./g, "").toUpperCase()}</div>
                      </div>
                    </div>
                    <div>
                      <input type="file" accept={ft.accept} multiple ref={(el) => (fileInputRefs.current[ft.id] = el)} onChange={(e) => handleFileAdd(ft.id, e)} style={{ display: "none" }} />
                      <button onClick={() => fileInputRefs.current[ft.id]?.click()}
                        style={{ padding: "8px 16px", background: "#F7F7F5", color: "#333", border: "1px solid #E2E2E2", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        + Upload
                      </button>
                    </div>
                  </div>
                  {categoryFiles.length > 0 && (
                    <div style={{ borderTop: "1px solid #F0F0F0", padding: "0" }}>
                      {categoryFiles.map((f) => (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid #FAFAFA" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                            <span style={{ fontSize: "11px", color: "#BBB", flexShrink: 0 }}>{formatSize(f.size)}</span>
                          </div>
                          <button onClick={() => handleFileRemove(f.id)}
                            style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: "18px", padding: "4px 8px", lineHeight: 1 }}>&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(243,193,27,0.06)", borderRadius: "10px", border: "1px solid rgba(243,193,27,0.15)", fontSize: "13px", color: "#666" }}>
              <strong style={{ color: "#111" }}>{files.length} file</strong> siap dianalisis oleh AI
              <span style={{ marginLeft: "8px", color: "#AAA" }}>({formatSize(files.reduce((s, f) => s + f.size, 0))} / 25MB)</span>
            </div>
          )}
          {error && currentStepData.id === "upload" && (
            <div style={{ marginTop: "10px", padding: "12px 16px", background: "#FFF5F5", borderRadius: "10px", border: "1px solid #FED7D7", fontSize: "13px", color: "#C53030" }}>
              {error}
            </div>
          )}
          {files.length === 0 && (
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "#FAFAFA", borderRadius: "10px", fontSize: "13px", color: "#AAA", textAlign: "center" }}>
              Belum ada file \u2014 kamu bisa skip step ini dan lanjut isi form manual
            </div>
          )}
        </div>);

      case "client":
        return (<div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Informasi Client</h2>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Isi sebisanya \u2014 {files.length > 0 ? "AI juga akan extract info dari file yang diupload" : "yang kosong diisi otomatis oleh AI"}</p>
          </div>
          {renderInput("Nama Perusahaan", "namaPerusahaan", "PT Contoh Maju Bersama")}
          {renderInput("Industri / Bidang", "industri", "contoh: Pertahanan, F&B, Logistik")}
          {renderInput("Target Market", "targetMarket", "contoh: Kemhan, TNI, B2B enterprise", { optional: true })}
          {renderInput("Lokasi", "lokasi", "Jakarta, Indonesia", { optional: true })}
          {renderInput("Deskripsi Bisnis", "deskripsiBisnis", "Jelaskan singkat tentang bisnis client...", { multiline: true, optional: true })}
          {renderInput("Pembeda dari kompetitor", "pembeda", "Keunggulan unik, sertifikasi, pengalaman", { optional: true })}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#222", marginBottom: "7px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Warna Brand <span style={{ color: "#AAA", fontWeight: 400, marginLeft: "6px", fontSize: "12px" }}>slide menyesuaikan warna brand client</span>
            </label>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", border: "2px solid #E2E2E2", cursor: "pointer", flexShrink: 0 }}>
                  <input type="color" value={data.brandPrimary} onChange={(e) => update("brandPrimary", e.target.value)} style={{ position: "absolute", inset: "-8px", width: "calc(100% + 16px)", height: "calc(100% + 16px)", cursor: "pointer", border: "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#444", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Primary</div>
                  <input type="text" value={data.brandPrimary} onChange={(e) => update("brandPrimary", e.target.value)} placeholder="#F5A623" style={{ ...inputStyle, width: "100px", padding: "6px 8px", fontSize: "12px", fontFamily: "monospace" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", border: "2px solid #E2E2E2", cursor: "pointer", flexShrink: 0 }}>
                  <input type="color" value={data.brandSecondary} onChange={(e) => update("brandSecondary", e.target.value)} style={{ position: "absolute", inset: "-8px", width: "calc(100% + 16px)", height: "calc(100% + 16px)", cursor: "pointer", border: "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#444", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Secondary</div>
                  <input type="text" value={data.brandSecondary} onChange={(e) => update("brandSecondary", e.target.value)} placeholder="#F3C11B" style={{ ...inputStyle, width: "100px", padding: "6px 8px", fontSize: "12px", fontFamily: "monospace" }} />
                </div>
              </div>
            </div>
          </div>
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
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Pastikan informasi sudah benar</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", border: "1px solid #EBEBEB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "#111", color: "#F3C11B", fontSize: "12px", fontWeight: 700, marginBottom: "16px" }}>{jLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[["Perusahaan", data.namaPerusahaan], ["Industri", data.industri], ["Target Market", data.targetMarket], ["Timeline", data.timeline], ["Tujuan", data.tujuanWebsite], ["Fitur", data.fiturKhusus], ["Warna Brand", data.brandPrimary + " / " + data.brandSecondary]].filter(([, v]) => v).map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{l}</div>
                  <div style={{ fontSize: "14px", color: "#222", fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F0F0F0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>File Uploaded ({files.length})</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {files.map((f) => (
                    <span key={f.id} style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "12px", background: "#F0FAF0", color: "#2D7A3A", border: "1px solid #C6F0C6", fontWeight: 500 }}>
                      {f.name.length > 25 ? f.name.slice(0, 22) + "..." : f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              style={{ flex: 1, padding: "16px", background: generating ? "#555" : "#111", color: "#F3C11B", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: generating ? "none" : "0 2px 8px rgba(0,0,0,0.15)" }}>
              {generating ? (files.length > 0 ? "\u23f3 Menganalisis file & generating..." : "\u23f3 Generating...") : "\u26a1 Generate Deck"}
            </button>
            <button onClick={() => handleCopy(buildPromptText(data, files.length), setCopiedPrompt)}
              style={{ padding: "16px 20px", background: copiedPrompt ? "#111" : "#fff", color: copiedPrompt ? "#F3C11B" : "#333", border: "1px solid #DDD", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
              {copiedPrompt ? "\u2713 Copied!" : "Copy Prompt"}
            </button>
          </div>
          {generating && files.length > 0 && (
            <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(243,193,27,0.06)", borderRadius: "10px", fontSize: "13px", color: "#666", textAlign: "center" }}>
              AI sedang membaca {files.length} file dan menyusun konten deck... ini mungkin butuh waktu lebih lama.
            </div>
          )}
          {error && <div style={{ marginTop: "16px", padding: "16px", background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "12px", color: "#C53030", fontSize: "13px", lineHeight: 1.5 }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: "8px", color: "#888", fontSize: "12px" }}>Tip: Coba kurangi jumlah/ukuran file, atau paste prompt ke chat Claude langsung.</div>
          </div>}
        </div>);
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: "#111", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #F3C11B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F3C11B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px", color: "#111" }}>D</div>
          <div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.3px" }}>Deck IT Strategy</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Banana Digital Boost</div>
          </div>
        </div>
        {result && <button onClick={resetAll} style={{ padding: "8px 18px", background: "transparent", color: "#F3C11B", border: "1px solid rgba(243,193,27,0.4)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ New Project</button>}
      </div>
      {!result && (
        <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "16px 24px 0" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "4px" }}>
            {visibleSteps.map((s, i) => (
              <div key={s.id} style={{ flex: 1, textAlign: "center", paddingBottom: "12px" }}>
                <div style={{ height: "3px", borderRadius: "2px", marginBottom: "8px", background: i === step ? "#F3C11B" : i < step ? "#111" : "#EBEBEB", transition: "all 0.3s ease" }} />
                <span style={{ fontSize: "11px", fontWeight: i === step ? 700 : 500, color: i === step ? "#111" : i < step ? "#666" : "#CCC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "28px 20px 40px" }}>
        {!result ? (
          <>
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px 24px", border: "1px solid #EBEBEB", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: "20px" }}>
              {renderStep()}
            </div>
            {currentStepData.id !== "review" && (
              <div style={{ display: "flex", gap: "10px" }}>
                {step > 0 && <button onClick={goBack} style={{ padding: "14px 24px", background: "#fff", color: "#333", border: "1px solid #DDD", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{"\u2190"} Kembali</button>}
                <button onClick={goNext} disabled={!canNext()} style={{ flex: 1, padding: "14px 24px", background: canNext() ? "#111" : "#E5E5E5", color: canNext() ? "#F3C11B" : "#AAA", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: canNext() ? "0 2px 8px rgba(0,0,0,0.12)" : "none" }}>Lanjut {"\u2192"}</button>
              </div>
            )}
          </>
        ) : (
          <div ref={resultRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0", color: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Konten Pitching Deck</h2>
                <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0 0" }}>{data.namaPerusahaan} {"\u2014"} {JASA_OPTIONS.find((j) => j.id === data.jasa)?.title}{files.length > 0 ? ` \u2022 ${files.length} file dianalisis` : ""}</p>
              </div>
            </div>

            {/* PRIMARY: Download PPTX */}
            <div style={{ background: "#111", borderRadius: "16px", padding: "24px", marginBottom: "16px", border: "2px solid #F3C11B" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F3C11B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{"\u{1F4CA}"}</div>
                <div>
                  <div style={{ color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Download Pitching Deck</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "2px" }}>File PPTX dengan design system BDB (hitam/kuning/Plus Jakarta Sans)</div>
                </div>
              </div>
              <button onClick={handleDownloadPptx} disabled={generatingPptx}
                style={{
                  width: "100%", padding: "14px", background: generatingPptx ? "#333" : "#F3C11B",
                  color: generatingPptx ? "#888" : "#111", border: "none", borderRadius: "10px",
                  fontSize: "15px", fontWeight: 800, cursor: generatingPptx ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.3px",
                  transition: "all 0.2s",
                }}>
                {generatingPptx ? "\u23F3 Generating PPTX..." : "\u2B07 Download .PPTX"}
              </button>
            </div>

            {/* SECONDARY: Copy text + view */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button onClick={() => handleCopy(result, setCopied)}
                style={{ flex: 1, padding: "12px", background: copied ? "#111" : "#fff", color: copied ? "#F3C11B" : "#333", border: "1px solid #DDD", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}>
                {copied ? "\u2713 Copied!" : "\u{1F4CB} Copy Konten Teks"}
              </button>
            </div>

            {/* Collapsible text result */}
            <details style={{ marginBottom: "16px" }}>
              <summary style={{ cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#888", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "8px 0" }}>
                Lihat konten teks lengkap
              </summary>
              <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #EBEBEB", fontSize: "13px", lineHeight: "1.8", whiteSpace: "pre-wrap", color: "#222", maxHeight: "50vh", overflow: "auto", marginTop: "8px" }}>{result}</div>
            </details>

            <div style={{ padding: "14px 16px", background: "rgba(243,193,27,0.06)", borderRadius: "12px", border: "1px solid rgba(243,193,27,0.15)", fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
              <strong style={{ color: "#111" }}>Tips:</strong> Download PPTX {"\u2192"} buka di Google Slides atau PowerPoint {"\u2192"} sesuaikan visual & tambahkan gambar. File sudah menggunakan design system BDB.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
