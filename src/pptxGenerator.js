import pptxgen from "pptxgenjs";

// BDB Design System tokens (from Emico deck analysis)
const COLORS = {
  black: "000000",
  white: "FFFFFF",
  accent: "F3C11B", // yellow
  darkBg: "111111",
  lightGray: "F5F5F5",
  medGray: "888888",
  lineGray: "CCCCCC",
};

const FONT = "Plus Jakarta Sans";
const SLIDE_W = 10;
const SLIDE_H = 5.625;

function addFooter(slide, pres, slideNum) {
  // separator line
  slide.addShape(pres.shapes.LINE, { x: 0.25, y: 4.85, w: 9.5, h: 0, line: { color: COLORS.lineGray, width: 0.75 } });
  // left: company name
  slide.addText("Banana Digital Boost", { x: 0.35, y: 4.92, w: 2, h: 0.25, fontSize: 6, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  // middle: confidential
  slide.addText("This document is confidential and intended solely for the use of Banana Digital Boost.", { x: 3.2, y: 4.92, w: 4, h: 0.25, fontSize: 6, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  // left: //
  slide.addText("//", { x: 0.2, y: 4.92, w: 0.2, h: 0.25, fontSize: 6, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  // right: slide number
  slide.addText(String(slideNum).padStart(2, "0"), { x: 9.3, y: 4.92, w: 0.5, h: 0.25, fontSize: 6, fontFace: FONT, bold: true, color: COLORS.black, align: "right", margin: 0 });
  // far left dash + pitching deck
  slide.addText([
    { text: "– ", options: { bold: false } },
    { text: "Pitching Deck", options: { bold: false } },
  ], { x: 1.1, y: 4.92, w: 1.5, h: 0.25, fontSize: 6, fontFace: FONT, color: COLORS.black, margin: 0 });
}

function addSlideHeader(slide, pres, title) {
  slide.addText(title, { x: 0.45, y: 0.2, w: 8, h: 0.5, fontSize: 24, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: 0.45, y: 0.7, w: 9.1, h: 0, line: { color: COLORS.lineGray, width: 0.75 } });
}

function makeSectionBox(title, items) {
  return { title, items };
}

// SLIDE BUILDERS

function buildCover(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  // accent subtitle bar area
  slide.addText("Pitching Deck", { x: 0.9, y: 0.5, w: 2, h: 0.35, fontSize: 15, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addText("Corporate Website Strategy", { x: 0.9, y: 1.8, w: 8, h: 0.7, fontSize: 38, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addText("Confirm Brief \u2022 Align Positioning \u2022 Proposed Approach", { x: 0.4, y: 2.55, w: 9, h: 0.4, fontSize: 15, fontFace: FONT, color: COLORS.accent, margin: 0 });
  slide.addText(data.namaPerusahaan || "Client Name", { x: 2.8, y: 2.95, w: 4.5, h: 0.3, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, align: "center", margin: 0 });
  // bottom
  slide.addText("Prepared by Banana Digital Boost", { x: 7.3, y: 4.85, w: 2.5, h: 0.2, fontSize: 8, fontFace: FONT, bold: true, color: COLORS.black, align: "right", margin: 0 });
  slide.addText("Pitching Deck", { x: 0.15, y: 4.85, w: 1.5, h: 0.2, fontSize: 8, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
}

function buildUnderstandingBusiness(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Understanding the Business");
  addFooter(slide, pres, num);

  // Left: Industry section
  slide.addText("Industry", { x: 0.5, y: 0.85, w: 4, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const industryText = content.industry || data.deskripsiBisnis || `${data.namaPerusahaan} beroperasi di industri ${data.industri}`;
  slide.addText(industryText, { x: 0.5, y: 1.25, w: 4, h: 3.2, fontSize: 11, fontFace: FONT, color: COLORS.black, valign: "top", margin: 0, lineSpacingMultiple: 1.3 });

  // Right: Target Market
  slide.addText("Target Market", { x: 5.1, y: 0.85, w: 4, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const targets = (data.targetMarket || "B2B, B2C").split(",").map(t => t.trim());
  const targetItems = targets.map((t, i) => ({
    text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < targets.length - 1 }
  }));
  slide.addText(targetItems, { x: 5.1, y: 1.25, w: 4, h: 2.5, valign: "top", margin: 0 });
}

function buildPositioning(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Corporate Positioning Framework");
  addFooter(slide, pres, num);

  // Current Perception
  slide.addText("Current Perception", { x: 0.5, y: 0.88, w: 3, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const currentPerceptions = content.currentPerception || ["Belum dikenal secara digital", "Kredibilitas online rendah", "Informasi tidak terstruktur"];
  const cpItems = currentPerceptions.map((t, i) => ({
    text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < currentPerceptions.length - 1 }
  }));
  slide.addText(cpItems, { x: 0.5, y: 1.3, w: 3, h: 1.5, valign: "top", margin: 0 });

  // Target Positioning
  slide.addText("Target Positioning", { x: 4, y: 0.88, w: 5.5, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addText(content.targetPositioning || `Strategic ${data.industri} Partner in Indonesia`, { x: 4, y: 1.3, w: 5.5, h: 0.5, fontSize: 11, fontFace: FONT, color: COLORS.black, valign: "top", margin: 0 });

  // Positioning Statement
  slide.addText("Positioning Statement", { x: 0.5, y: 2.3, w: 9, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addText(content.positioningStatement || `${data.namaPerusahaan} adalah mitra strategis yang mendukung kebutuhan industri melalui layanan profesional, dukungan teknis, dan kolaborasi.`, {
    x: 0.5, y: 2.7, w: 9, h: 1, fontSize: 11, fontFace: FONT, color: COLORS.black, valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
}

function buildWhyMatters(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Why this Website Matters");
  addFooter(slide, pres, num);

  // Why Now
  slide.addText("Why Now?", { x: 0.45, y: 1, w: 4, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const whyNow = content.whyNow || ["Meningkatnya kebutuhan kredibilitas digital", "Partner melakukan digital due diligence", "Modernisasi komunikasi korporasi", "Mendukung visi jangka panjang"];
  const wnItems = whyNow.map((t, i) => ({
    text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < whyNow.length - 1 }
  }));
  slide.addText(wnItems, { x: 0.45, y: 1.45, w: 4, h: 2.5, valign: "top", margin: 0 });

  // Risk
  slide.addText("Risiko jika tidak dilakukan", { x: 5, y: 1, w: 4.5, h: 0.35, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const risks = content.risks || ["Kurang terlihat profesional", "Sulit membangun trust", "Tidak memiliki representasi online"];
  const rItems = risks.map((t, i) => ({
    text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < risks.length - 1 }
  }));
  slide.addText(rItems, { x: 5, y: 1.45, w: 4.5, h: 2.5, valign: "top", margin: 0 });
}

function buildReferensi(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Referensi Website");
  addFooter(slide, pres, num);

  slide.addText("Referensi Website", { x: 0.4, y: 0.8, w: 9, h: 0.35, fontSize: 12, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });

  const refs = content.references || [
    { name: "Referensi 1", url: "https://example.com", reasons: "Struktur navigasi yang rapi dan profesional." },
    { name: "Referensi 2", url: "https://example.com", reasons: "Design modern dan enterprise-ready." },
    { name: "Referensi 3", url: "https://example.com", reasons: "Fokus pada kapabilitas dan solusi." },
  ];

  refs.forEach((ref, i) => {
    const xPos = 0.4 + i * 3.1;
    slide.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.3, w: 2.8, h: 1.5, fill: { color: COLORS.lightGray }, rectRadius: 0.05 });
    slide.addText(ref.url || ref.name, { x: xPos, y: 2.85, w: 2.8, h: 0.25, fontSize: 8, fontFace: FONT, color: COLORS.medGray, margin: 0 });
    slide.addText("Alasan dijadikan referensi:", { x: xPos, y: 3.15, w: 2.8, h: 0.2, fontSize: 7, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
    slide.addText(ref.reasons, { x: xPos, y: 3.4, w: 2.8, h: 1.2, fontSize: 7, fontFace: FONT, color: COLORS.black, valign: "top", margin: 0, lineSpacingMultiple: 1.3 });
  });
}

function buildSitemap(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Website Structure (Proposed Sitemap)");
  addFooter(slide, pres, num);

  slide.addShape(pres.shapes.RECTANGLE, { x: 1.9, y: 0.85, w: 6, h: 0.4, fill: { color: COLORS.darkBg } });
  slide.addText("Struktur Website", { x: 1.9, y: 0.85, w: 6, h: 0.4, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.white, align: "center", margin: 0 });

  const pages = content.sitemap || ["Home", "About Us", "Services", "Projects / Portfolio", "Partners", "Contact"];
  const cols = Math.min(pages.length, 3);
  const rows = Math.ceil(pages.length / cols);

  pages.forEach((page, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const xPos = 1.5 + col * 2.5;
    const yPos = 1.6 + row * 0.9;
    slide.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 2.2, h: 0.6, fill: { color: COLORS.lightGray }, line: { color: COLORS.lineGray, width: 0.5 } });
    slide.addText(page, { x: xPos, y: yPos, w: 2.2, h: 0.6, fontSize: 10, fontFace: FONT, bold: true, color: COLORS.black, align: "center", valign: "middle", margin: 0 });
  });
}

function buildHomepage(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Homepage Strategy");
  addFooter(slide, pres, num);

  slide.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 0.85, w: 4, h: 0.4, fill: { color: COLORS.darkBg } });
  slide.addText("Homepage Structure", { x: 0.45, y: 0.85, w: 4, h: 0.4, fontSize: 11, fontFace: FONT, bold: true, color: COLORS.white, align: "center", margin: 0 });

  const sections = content.homepageSections || [
    { title: "Hero Section", desc: "Headline strategis + tagline" },
    { title: "Company Snapshot", desc: "Ringkasan identitas dan pengalaman" },
    { title: "Core Capabilities", desc: "Overview layanan utama" },
    { title: "Selected Projects", desc: "Highlight pengalaman strategis" },
    { title: "Partnerships", desc: "Jejaring dan kolaborasi" },
    { title: "Call to Action", desc: "Contact & Inquiry" },
  ];

  const sectionItems = sections.map((s, i) => ([
    { text: s.title, options: { fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, breakLine: true } },
    { text: s.desc, options: { fontSize: 11, fontFace: FONT, color: COLORS.medGray, breakLine: i < sections.length - 1, paraSpaceAfter: 8 } },
  ])).flat();

  slide.addText(sectionItems, { x: 0.45, y: 1.4, w: 4, h: 3.2, valign: "top", margin: [4, 8, 4, 8] });

  slide.addText("Homepage harus langsung menunjukkan kredibilitas dan pengalaman.", { x: 0.45, y: 4.35, w: 4, h: 0.3, fontSize: 10, fontFace: FONT, italic: true, color: COLORS.medGray, margin: 0 });
}

function buildTechnical(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Technical Strategy");
  addFooter(slide, pres, num);

  // Technical Scope
  slide.addText("Technical Scope", { x: 0.45, y: 1, w: 4.2, h: 0.4, fontSize: 13, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const techScope = content.techScope || ["Responsive Design", "Basic SEO setup", "Contact form integration", "Inquiry management", "Security setup (SSL + basic hardening)"];
  const tsItems = techScope.map((t, i) => ({
    text: t, options: { fontSize: 13, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < techScope.length - 1 }
  }));
  slide.addText(tsItems, { x: 0.5, y: 1.5, w: 4, h: 2.5, valign: "top", margin: 0 });

  // Additional features
  const features = content.features || data.fiturKhusus || "";
  if (features) {
    slide.addText("Fitur Khusus", { x: 4.8, y: 1, w: 4.5, h: 0.4, fontSize: 13, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
    const fList = (typeof features === "string" ? features.split(",") : features).map(f => f.trim());
    const fItems = fList.map((t, i) => ({
      text: t, options: { fontSize: 13, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < fList.length - 1 }
    }));
    slide.addText(fItems, { x: 4.85, y: 1.5, w: 4.5, h: 2.5, valign: "top", margin: 0 });
  }
}

function buildDataRequirement(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Data & Asset Requirement");
  addFooter(slide, pres, num);

  // Client must prepare
  slide.addText("Client harus menyiapkan", { x: 0.6, y: 1, w: 3.8, h: 0.35, fontSize: 12, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const clientPrep = content.clientPrep || ["Logo HD", "Ringkasan profil perusahaan", "Foto fasilitas (high resolution)", "Foto aktivitas teknis", "List partner resmi", "Alamat & kontak resmi"];
  const cpItems2 = clientPrep.map((t, i) => ({
    text: t, options: { fontSize: 12, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < clientPrep.length - 1 }
  }));
  slide.addText(cpItems2, { x: 0.6, y: 1.45, w: 3.8, h: 2.8, valign: "top", margin: 0 });

  // If data not complete
  slide.addText("Jika Data Belum Lengkap", { x: 4.6, y: 1, w: 4.5, h: 0.35, fontSize: 12, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const fallback = content.fallback || ["Menggunakan company profile sebagai dasar awal", "Penyusunan ulang narasi secara bertahap", "Menggunakan konten dummy dahulu", "Update konten berkala setelah website live"];
  const fbItems = fallback.map((t, i) => ({
    text: t, options: { fontSize: 12, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < fallback.length - 1 }
  }));
  slide.addText(fbItems, { x: 4.6, y: 1.45, w: 4.5, h: 2.8, valign: "top", margin: 0 });
}

function buildTimeline(pres, data, content, num) {
  const slide = pres.addSlide();
  addSlideHeader(slide, pres, "Timeline & Risk");
  addFooter(slide, pres, num);

  // Timeline
  slide.addText(`Timeline (${data.timeline || "1-2 Bulan"})`, { x: 0.45, y: 1, w: 4.2, h: 0.4, fontSize: 12, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const phases = content.phases || ["Phase 1: Strategy & Asset Collection", "Phase 2: UI Design", "Phase 3: Development", "Phase 4: Integration & Testing", "Phase 5: Go Live"];
  const phItems = phases.map((t, i) => ({
    text: t, options: { fontSize: 12, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < phases.length - 1 }
  }));
  slide.addText(phItems, { x: 0.5, y: 1.5, w: 4, h: 2, valign: "top", margin: 0 });

  // Risk
  slide.addText("Risk & Mitigation", { x: 4.8, y: 1, w: 4.5, h: 0.4, fontSize: 12, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  const riskText = [
    { text: "Risiko:", options: { fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, breakLine: true } },
    ...(content.risks2 || ["Keterlambatan aset", "Approval konten", "Konten sensitif"]).map((t, i, a) => ({
      text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: true }
    })),
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Solusi:", options: { fontSize: 11, fontFace: FONT, bold: true, color: COLORS.black, breakLine: true } },
    ...(content.solutions || ["Checklist awal yang jelas", "Satu PIC untuk approval", "Batasan konten sejak awal"]).map((t, i, a) => ({
      text: t, options: { fontSize: 11, fontFace: FONT, color: COLORS.black, bullet: true, breakLine: i < a.length - 1 }
    })),
  ];
  slide.addText(riskText, { x: 4.85, y: 1.5, w: 4.5, h: 3, valign: "top", margin: 0 });
}

function buildClosing(pres) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addFooter(slide, pres, "");

  slide.addText("Let\u2019s Kick Start", { x: 1.2, y: 2, w: 5, h: 0.7, fontSize: 38, fontFace: FONT, bold: true, color: COLORS.black, margin: 0 });
  slide.addText("Your Achievement!", { x: 2.7, y: 2.6, w: 5.5, h: 0.7, fontSize: 38, fontFace: FONT, bold: true, color: COLORS.accent, margin: 0 });
}

// Parse AI text output into structured content
function parseAIContent(text) {
  const content = {
    industry: "", targetPositioning: "", positioningStatement: "",
    currentPerception: [], whyNow: [], risks: [],
    references: [], sitemap: [],
    homepageSections: [], techScope: [], features: [],
    clientPrep: [], fallback: [], phases: [], risks2: [], solutions: [],
  };

  if (!text) return content;

  const slides = text.split(/##\s*SLIDE\s*\d+/i);

  slides.forEach((slideText) => {
    const lines = slideText.split("\n").map(l => l.replace(/^[-*\u2022\d.]+\s*/, "").trim()).filter(l => l && !l.startsWith("#") && l.length > 3);

    if (/understanding|business/i.test(slideText)) {
      content.industry = lines.slice(0, 8).join("\n");
    }
    if (/positioning/i.test(slideText)) {
      const stmtIdx = lines.findIndex(l => /statement/i.test(l));
      if (stmtIdx >= 0 && lines[stmtIdx + 1]) content.positioningStatement = lines.slice(stmtIdx + 1, stmtIdx + 3).join(" ");
      content.currentPerception = lines.filter(l => /provider|supplier|contractor|belum|kurang/i.test(l)).slice(0, 3);
      content.targetPositioning = lines.find(l => /strategic|partner|mitra/i.test(l)) || "";
    }
    if (/why.*matter|why.*now|mengapa/i.test(slideText)) {
      const riskIdx = lines.findIndex(l => /risiko|risk/i.test(l));
      if (riskIdx > 0) {
        content.whyNow = lines.slice(0, riskIdx).slice(0, 4);
        content.risks = lines.slice(riskIdx + 1).slice(0, 4);
      } else {
        content.whyNow = lines.slice(0, 4);
      }
    }
    if (/referensi|benchmark|competitive/i.test(slideText)) {
      const urlMatches = slideText.match(/https?:\/\/[^\s)]+/g) || [];
      content.references = urlMatches.slice(0, 3).map((url, i) => ({
        name: `Referensi ${i + 1}`, url,
        reasons: lines.find(l => l.includes(url.replace(/https?:\/\/(www\.)?/, "").split("/")[0])) || lines[i * 3 + 1] || "Website referensi relevan"
      }));
      if (content.references.length === 0) {
        content.references = lines.filter(l => l.length > 20).slice(0, 3).map((l, i) => ({
          name: `Referensi ${i + 1}`, url: "", reasons: l
        }));
      }
    }
    if (/sitemap|struktur|navigasi/i.test(slideText)) {
      content.sitemap = lines.filter(l => l.length < 40 && !/proposed|struktur|berikut/i.test(l)).slice(0, 8);
    }
    if (/homepage/i.test(slideText)) {
      const pairs = [];
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].length < 35 && lines[i + 1].length > 15) {
          pairs.push({ title: lines[i], desc: lines[i + 1] });
          i++;
        }
      }
      if (pairs.length >= 3) content.homepageSections = pairs.slice(0, 6);
    }
    if (/technical|teknis/i.test(slideText)) {
      content.techScope = lines.filter(l => l.length < 60 && !/technical|teknis|scope|berikut/i.test(l)).slice(0, 7);
    }
    if (/data.*asset|requirement|aset/i.test(slideText)) {
      const splitIdx = lines.findIndex(l => /jika|belum lengkap|fallback/i.test(l));
      if (splitIdx > 0) {
        content.clientPrep = lines.slice(0, splitIdx).filter(l => !/client|harus|menyiapkan/i.test(l)).slice(0, 8);
        content.fallback = lines.slice(splitIdx + 1).slice(0, 5);
      } else {
        content.clientPrep = lines.slice(0, 8);
      }
    }
    if (/timeline|risk.*mitigat/i.test(slideText)) {
      const rIdx = lines.findIndex(l => /^risiko|^risk/i.test(l));
      const sIdx = lines.findIndex(l => /^solusi|^mitigat/i.test(l));
      content.phases = lines.filter(l => /phase|tahap|minggu|bulan/i.test(l)).slice(0, 5);
      if (rIdx >= 0 && sIdx >= 0) {
        content.risks2 = lines.slice(rIdx + 1, sIdx).slice(0, 4);
        content.solutions = lines.slice(sIdx + 1).slice(0, 4);
      }
    }
  });

  return content;
}

export async function generatePPTX(data, aiText) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Banana Digital Boost";
  pres.title = `Website Strategy - ${data.namaPerusahaan}`;

  const content = parseAIContent(aiText);

  buildCover(pres, data);
  buildUnderstandingBusiness(pres, data, content, 1);
  buildPositioning(pres, data, content, 2);
  buildWhyMatters(pres, data, content, 3);
  buildReferensi(pres, data, content, 4);
  buildSitemap(pres, data, content, 5);
  buildHomepage(pres, data, content, 6);
  buildTechnical(pres, data, content, 7);
  buildDataRequirement(pres, data, content, 8);
  buildTimeline(pres, data, content, 9);
  buildClosing(pres);

  const fileName = `Strategy_Website_${data.namaPerusahaan.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
  await pres.writeFile({ fileName });
  return fileName;
}
