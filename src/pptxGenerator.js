import pptxgen from "pptxgenjs";

// Fixed BDB branding colors (footer always uses these)
const BDB = { black: "000000", white: "FFFFFF", gray: "888888", lineGray: "CCCCCC", footerGray: "999999" };
const F = "Plus Jakarta Sans";

// Convert hex #RRGGBB to pptxgenjs "RRGGBB" format
function hexToSlide(hex) {
  if (!hex) return "F5A623";
  return hex.replace(/^#/, "").toUpperCase();
}

// Darken a hex color by a percentage
function darkenHex(hex, pct) {
  var h = hex.replace(/^#/, "");
  var r = parseInt(h.substring(0, 2), 16);
  var g = parseInt(h.substring(2, 4), 16);
  var b = parseInt(h.substring(4, 6), 16);
  r = Math.round(r * (1 - pct)); g = Math.round(g * (1 - pct)); b = Math.round(b * (1 - pct));
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase();
}

// Lighten a hex color
function lightenHex(hex, pct) {
  var h = hex.replace(/^#/, "");
  var r = parseInt(h.substring(0, 2), 16);
  var g = parseInt(h.substring(2, 4), 16);
  var b = parseInt(h.substring(4, 6), 16);
  r = Math.min(255, Math.round(r + (255 - r) * pct));
  g = Math.min(255, Math.round(g + (255 - g) * pct));
  b = Math.min(255, Math.round(b + (255 - b) * pct));
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase();
}

// Determine if a color is light (for choosing white vs dark text on it)
function isLightColor(hex) {
  var h = hex.replace(/^#/, "");
  var r = parseInt(h.substring(0, 2), 16);
  var g = parseInt(h.substring(2, 4), 16);
  var b = parseInt(h.substring(4, 6), 16);
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

// Build brand theme from user input
function buildTheme(data) {
  var primary = hexToSlide(data.brandPrimary || "#F5A623");
  var secondary = hexToSlide(data.brandSecondary || "#F3C11B");
  var primaryDark = darkenHex(primary, 0.25);
  var primaryLight = lightenHex(primary, 0.85);
  var secondaryLight = lightenHex(secondary, 0.75);
  var textOnPrimary = isLightColor(primary) ? BDB.black : BDB.white;
  var textOnSecondary = isLightColor(secondary) ? BDB.black : BDB.white;
  return {
    primary: primary,
    secondary: secondary,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    secondaryLight: secondaryLight,
    textOnPrimary: textOnPrimary,
    textOnSecondary: textOnSecondary,
  };
}

// ========== HELPERS ==========

function slideTitle(s, title, theme) {
  s.addText(title, { x: 0.5, y: 0.25, w: 9, h: 0.65, fontSize: 30, fontFace: F, bold: true, color: BDB.black, margin: 0, valign: "bottom" });
  s.addShape("line", { x: 0.5, y: 0.95, w: 9, h: 0, line: { color: theme.secondary, width: 2.5 } });
}

function footer(s, num) {
  s.addShape("line", { x: 0.3, y: 5.08, w: 9.4, h: 0, line: { color: BDB.footerGray, width: 0.5 } });
  s.addText([
    { text: "//  ", options: { bold: true, color: BDB.black, fontSize: 7 } },
    { text: "Banana Digital Boost", options: { bold: true, color: BDB.black, fontSize: 7 } },
    { text: "   \u2013 Pitching Deck", options: { bold: false, color: BDB.gray, fontSize: 7 } },
  ], { x: 0.3, y: 5.12, w: 3, h: 0.3, fontFace: F, margin: 0 });
  s.addText("This document is confidential and intended solely for the use of Banana Digital Boost.", { x: 2.5, y: 5.12, w: 5.5, h: 0.3, fontSize: 6, fontFace: F, bold: true, color: BDB.black, align: "center", margin: 0 });
  if (num != null) s.addText(String(num).padStart(2, "0"), { x: 9, y: 5.12, w: 0.7, h: 0.3, fontSize: 7, fontFace: F, bold: true, color: BDB.black, align: "right", margin: 0 });
}

function brandBox(s, x, y, w, text, theme) {
  s.addShape("rect", { x, y, w, h: 0.4, fill: { color: theme.primary } });
  s.addText(text, { x, y, w, h: 0.4, fontSize: 13, fontFace: F, bold: true, color: theme.textOnPrimary, align: "center", valign: "middle", margin: 0 });
}

function bullets(items, opts) {
  return items.map(function(t, i) {
    return { text: t, options: { fontSize: (opts && opts.size) || 13, fontFace: F, color: (opts && opts.color) || BDB.black, bold: false, bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } };
  });
}

function boldBullets(items, theme) {
  var result = [];
  items.forEach(function(item, i) {
    result.push({ text: item.title, options: { fontSize: 13, fontFace: F, color: theme.primaryDark, bold: true, bullet: true, breakLine: true } });
    result.push({ text: item.desc, options: { fontSize: 12, fontFace: F, color: BDB.black, bold: false, breakLine: i < items.length - 1, paraSpaceAfter: 12 } });
  });
  return result;
}

// ========== SLIDES ==========

function sCover(pres, data, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.12, fill: { color: theme.primary } });
  s.addShape("rect", { x: 0, y: 5.51, w: 10, h: 0.12, fill: { color: theme.primary } });
  s.addText("Pitching Deck", { x: 0.5, y: 4.8, w: 2, h: 0.3, fontSize: 9, fontFace: F, bold: true, color: BDB.black, margin: 0 });
  s.addText("Corporate Website\nStrategy", { x: 1, y: 1.5, w: 8, h: 2, fontSize: 48, fontFace: F, bold: true, color: BDB.black, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.1 });
  s.addText("Confirm Brief \u2022 Align Positioning \u2022 Proposed Approach", { x: 1, y: 3.2, w: 8, h: 0.4, fontSize: 14, fontFace: F, italic: true, color: theme.secondary, align: "center", margin: 0 });
  s.addText(data.namaPerusahaan || "Client Name", { x: 2.5, y: 3.7, w: 5, h: 0.4, fontSize: 13, fontFace: F, bold: true, color: BDB.black, align: "center", margin: 0 });
  s.addText("Prepared by Banana Digital Boost", { x: 6.5, y: 4.8, w: 3, h: 0.3, fontSize: 9, fontFace: F, bold: true, color: BDB.black, align: "right", margin: 0 });
}

function sBusiness(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Understanding the Business", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Industry", theme);
  var items = c.industryItems && c.industryItems.length ? c.industryItems : [
    { title: data.industri || "Industry", desc: data.deskripsiBisnis || "Beroperasi dalam ekosistem industri yang mendukung kebutuhan bisnis melalui layanan profesional." }
  ];
  s.addText(boldBullets(items, theme), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 5.3, 1.2, 4.2, "Target Market", theme);
  var targets = (data.targetMarket || "B2B, B2C").split(",").map(function(t) { return t.trim(); });
  s.addText(bullets(targets), { x: 5.3, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
}

function sPositioning(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Corporate Positioning Framework", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Current Perception", theme);
  var cp = c.currentPerception && c.currentPerception.length ? c.currentPerception : ["Maintenance provider", "Defense supplier", "Project-based contractor"];
  s.addText(bullets(cp), { x: 0.5, y: 1.75, w: 4.2, h: 1.5, valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 5.3, 1.2, 4.2, "Target Positioning", theme);
  s.addText(c.targetPositioning || ("Strategic " + (data.industri || "") + " Partner in Indonesia"), { x: 5.3, y: 1.75, w: 4.2, h: 1, fontSize: 13, fontFace: F, color: BDB.black, align: "center", valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 2, 3.2, 6, "Positioning Statement", theme);
  s.addText(c.positioningStatement || (data.namaPerusahaan + " adalah mitra strategis industri yang mendukung kebutuhan operasional melalui layanan profesional, dukungan teknis, dan kolaborasi."), { x: 0.8, y: 3.75, w: 8.4, h: 1, fontSize: 13, fontFace: F, color: BDB.black, align: "center", valign: "top", margin: [0, 10, 0, 10], lineSpacingMultiple: 1.4 });
}

function sWhyMatters(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Why this Website Matters", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Why Now?", theme);
  var wn = c.whyNow && c.whyNow.length ? c.whyNow : ["Meningkatnya kebutuhan kredibilitas digital", "Partner melakukan digital due diligence", "Modernisasi komunikasi korporasi", "Mendukung visi jangka panjang"];
  s.addText(bullets(wn), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 5.3, 1.2, 4.2, "Risiko jika tidak dilakukan", theme);
  var risks = c.risks && c.risks.length ? c.risks : ["Kurang terlihat profesional", "Sulit membangun trust", "Tidak memiliki representasi online"];
  s.addText(bullets(risks), { x: 5.3, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
}

function sReferensi(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Referensi Website", theme);
  footer(s, num);
  var refs = c.references && c.references.length ? c.references : [
    { name: "Referensi 1", url: "https://example.com", reasons: ["Struktur navigasi rapi", "UI modern & enterprise-ready"] },
    { name: "Referensi 2", url: "https://example.com", reasons: ["Design modern", "Fokus pada kapabilitas"] },
    { name: "Referensi 3", url: "https://example.com", reasons: ["Struktur industri rapi", "Relevan untuk segmen bisnis"] },
  ];
  refs.slice(0, 3).forEach(function(ref, i) {
    var x = 0.5 + i * 3.1;
    s.addShape("rect", { x: x, y: 1.15, w: 2.8, h: 1.4, fill: { color: theme.primaryLight }, line: { color: BDB.lineGray, width: 0.5 } });
    s.addText("Screenshot", { x: x, y: 1.15, w: 2.8, h: 1.4, fontSize: 10, fontFace: F, color: BDB.lineGray, align: "center", valign: "middle", margin: 0 });
    s.addText(ref.url || ref.name, { x: x, y: 2.6, w: 2.8, h: 0.3, fontSize: 8, fontFace: F, color: BDB.gray, margin: 0 });
    s.addText("Alasan dijadikan referensi:", { x: x, y: 2.9, w: 2.8, h: 0.25, fontSize: 9, fontFace: F, bold: true, color: theme.primaryDark, margin: 0 });
    var reasons = Array.isArray(ref.reasons) ? ref.reasons : [ref.reasons || "Relevan"];
    s.addText(bullets(reasons, { size: 9 }), { x: x, y: 3.15, w: 2.8, h: 1.6, valign: "top", margin: [0, 4, 0, 4] });
  });
}

function sSitemap(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Website Structure (Proposed Sitemap)", theme);
  footer(s, num);
  brandBox(s, 2.5, 1.2, 5, "Struktur Website", theme);
  s.addShape("rect", { x: 3.8, y: 1.85, w: 2.4, h: 0.45, fill: { color: theme.primaryDark } });
  s.addText(data.namaPerusahaan || "Website", { x: 3.8, y: 1.85, w: 2.4, h: 0.45, fontSize: 10, fontFace: F, bold: true, color: BDB.white, align: "center", valign: "middle", margin: 0 });
  s.addShape("line", { x: 5, y: 2.3, w: 0, h: 0.35, line: { color: BDB.lineGray, width: 1 } });
  var pages = c.sitemap && c.sitemap.length ? c.sitemap : ["Home", "About Us", "Services", "Projects", "Partners", "Contact"];
  var count = Math.min(pages.length, 6);
  var totalW = count * 1.35 + (count - 1) * 0.15;
  var startX = (10 - totalW) / 2;
  s.addShape("line", { x: startX + 0.675, y: 2.65, w: totalW - 1.35, h: 0, line: { color: BDB.lineGray, width: 1 } });
  pages.slice(0, 6).forEach(function(page, i) {
    var px = startX + i * 1.5;
    s.addShape("line", { x: px + 0.675, y: 2.65, w: 0, h: 0.3, line: { color: BDB.lineGray, width: 1 } });
    s.addShape("rect", { x: px, y: 2.95, w: 1.35, h: 0.5, fill: { color: theme.secondary } });
    s.addText(page, { x: px, y: 2.95, w: 1.35, h: 0.5, fontSize: 9, fontFace: F, bold: true, color: theme.textOnSecondary, align: "center", valign: "middle", margin: 0 });
  });
  if (pages.length > 6) {
    s.addText("+ " + pages.slice(6).join(", "), { x: 1, y: 3.7, w: 8, h: 0.3, fontSize: 10, fontFace: F, color: BDB.gray, align: "center", margin: 0 });
  }
}

function sHomepage(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Homepage Strategy", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Homepage Structure", theme);
  var sections = c.homepageSections && c.homepageSections.length ? c.homepageSections : [
    { title: "Hero Section", desc: "Headline strategis + tagline" },
    { title: "Company Snapshot", desc: "Ringkasan identitas" },
    { title: "Core Capabilities", desc: "Overview layanan utama" },
    { title: "Selected Projects", desc: "Highlight pengalaman" },
    { title: "Partnerships", desc: "Jejaring dan kolaborasi" },
    { title: "Call to Action", desc: "Contact & Inquiry" },
  ];
  s.addText(boldBullets(sections, theme), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  s.addShape("rect", { x: 5.3, y: 1.2, w: 4.2, h: 2.5, fill: { color: theme.primaryLight }, line: { color: BDB.lineGray, width: 0.5 } });
  s.addText("Homepage Wireframe\n(tambahkan screenshot)", { x: 5.3, y: 1.2, w: 4.2, h: 2.5, fontSize: 11, fontFace: F, color: BDB.lineGray, align: "center", valign: "middle", margin: 0 });
  s.addText("Homepage harus langsung menunjukkan kredibilitas dan pengalaman.", { x: 5.3, y: 4, w: 4, h: 0.5, fontSize: 11, fontFace: F, italic: true, color: BDB.gray, margin: 0 });
}

function sTechnical(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Technical Strategy", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Technical Scope", theme);
  var scope = c.techScope && c.techScope.length ? c.techScope : ["Responsive Design", "Multi-language system", "Basic SEO setup", "Contact form integration", "Inquiry management", "Security setup (SSL + hardening)"];
  s.addText(bullets(scope), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  var featureTitle = data.fiturKhusus ? "Fitur Khusus" : "Additional Features";
  brandBox(s, 5.3, 1.2, 4.2, featureTitle, theme);
  var feats = data.fiturKhusus ? data.fiturKhusus.split(",").map(function(f) { return f.trim(); }) : ["Multi-language (ID/EN)", "Portfolio Gallery", "Blog / News", "Admin Dashboard"];
  s.addText(bullets(feats), { x: 5.3, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
}

function sAssetReq(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "Data & Asset Requirement", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Client harus menyiapkan", theme);
  var prep = c.clientPrep && c.clientPrep.length ? c.clientPrep : ["Logo HD", "Ringkasan profil perusahaan", "Foto fasilitas (high resolution)", "Foto aktivitas teknis", "List partner resmi", "Alamat & kontak resmi", "Approval konten"];
  s.addText(bullets(prep, { size: 11 }), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 5.3, 1.2, 4.2, "Jika Data Belum Lengkap", theme);
  var fb = c.fallback && c.fallback.length ? c.fallback : ["Menggunakan company profile sebagai dasar awal", "Penyusunan ulang narasi bertahap", "Menggunakan konten dummy dahulu", "Update konten berkala setelah live"];
  s.addText(bullets(fb, { size: 11 }), { x: 5.3, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
}

function sTimeline(pres, data, c, num, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  slideTitle(s, "TIMELINE & RISK", theme);
  footer(s, num);
  brandBox(s, 0.5, 1.2, 4.2, "Timeline (" + (data.timeline || "1\u20132 Bulan") + ")", theme);
  var phases = c.phases && c.phases.length ? c.phases : ["Phase 1: Strategy & Asset Collection", "Phase 2: UI Design", "Phase 3: Development", "Phase 4: Integration & Testing", "Phase 5: Go Live"];
  s.addText(bullets(phases, { size: 11 }), { x: 0.5, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
  brandBox(s, 5.3, 1.2, 4.2, "Risk & Mitigation", theme);
  var riskItems = [];
  riskItems.push({ text: "Risiko:", options: { fontSize: 11, fontFace: F, bold: true, color: theme.primaryDark, breakLine: true } });
  var r2 = c.risks2 && c.risks2.length ? c.risks2 : ["Keterlambatan aset", "Approval bahasa", "Konten sensitif"];
  r2.forEach(function(r) { riskItems.push({ text: r, options: { fontSize: 11, fontFace: F, color: BDB.black, bullet: true, breakLine: true, paraSpaceAfter: 4 } }); });
  riskItems.push({ text: "", options: { fontSize: 6, breakLine: true } });
  riskItems.push({ text: "Solusi:", options: { fontSize: 11, fontFace: F, bold: true, color: theme.primaryDark, breakLine: true } });
  var sol = c.solutions && c.solutions.length ? c.solutions : ["Checklist awal yang jelas", "Satu PIC untuk approval", "Batasan konten sejak awal"];
  sol.forEach(function(so, i) { riskItems.push({ text: so, options: { fontSize: 11, fontFace: F, color: BDB.black, bullet: true, breakLine: i < sol.length - 1, paraSpaceAfter: 4 } }); });
  s.addText(riskItems, { x: 5.3, y: 1.75, w: 4.2, h: 3, valign: "top", margin: [0, 10, 0, 10] });
}

function sClosing(pres, theme) {
  var s = pres.addSlide();
  s.background = { color: BDB.white };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.12, fill: { color: theme.primary } });
  s.addShape("rect", { x: 0, y: 5.51, w: 10, h: 0.12, fill: { color: theme.primary } });
  footer(s, null);
  s.addText("Let\u2019s Kick Start", { x: 1, y: 1.8, w: 8, h: 0.9, fontSize: 44, fontFace: F, bold: true, color: BDB.black, align: "center", valign: "bottom", margin: 0 });
  s.addText("Your Achievement!", { x: 1, y: 2.7, w: 8, h: 0.9, fontSize: 44, fontFace: F, bold: true, color: theme.secondary, align: "center", valign: "top", margin: 0 });
}

// ========== PARSER ==========

function parseAIContent(text) {
  var c = { industryItems: [], currentPerception: [], targetPositioning: "", positioningStatement: "", whyNow: [], risks: [], references: [], sitemap: [], homepageSections: [], techScope: [], clientPrep: [], fallback: [], phases: [], risks2: [], solutions: [] };
  if (!text) return c;
  var blocks = text.split(/##\s*SLIDE\s*\d+[^#\n]*/i);
  blocks.forEach(function(block) {
    var lines = block.split("\n").map(function(l) { return l.replace(/^\s*[-*\u2022\u25CF]\s*/, "").replace(/^\d+\.\s*/, "").replace(/\*\*/g, "").trim(); }).filter(function(l) { return l.length > 3 && !l.startsWith("#"); });

    if (/understanding|business/i.test(block) && !c.industryItems.length) {
      var items = [];
      for (var i = 0; i < lines.length - 1; i++) {
        if (lines[i].length < 60 && lines[i + 1].length > 20) { items.push({ title: lines[i], desc: lines[i + 1] }); i++; }
      }
      if (items.length >= 2) c.industryItems = items.slice(0, 4);
    }
    if (/positioning/i.test(block) && !c.currentPerception.length) {
      c.currentPerception = lines.filter(function(l) { return l.length < 50 && l.length > 5; }).slice(0, 3);
      var tp = lines.find(function(l) { return /strategic|mitra|partner/i.test(l) && l.length < 80; });
      if (tp) c.targetPositioning = tp;
      var long = lines.find(function(l) { return l.length > 80; });
      if (long) c.positioningStatement = long;
    }
    if (/why.*matter|why.*now|mengapa/i.test(block) && !c.whyNow.length) {
      var rIdx = lines.findIndex(function(l) { return /risiko|risk/i.test(l); });
      if (rIdx > 0) { c.whyNow = lines.slice(0, rIdx).filter(function(l) { return l.length > 10; }).slice(0, 5); c.risks = lines.slice(rIdx + 1).filter(function(l) { return l.length > 10; }).slice(0, 4); }
      else { c.whyNow = lines.filter(function(l) { return l.length > 10; }).slice(0, 4); }
    }
    if (/referensi|benchmark/i.test(block) && !c.references.length) {
      var urls = block.match(/https?:\/\/[^\s)]+/g) || [];
      var rl = lines.filter(function(l) { return l.length > 15 && l.length < 80; });
      c.references = urls.slice(0, 3).map(function(url, i) { return { name: "Ref " + (i + 1), url: url, reasons: rl.slice(i * 3, i * 3 + 3) }; });
      if (!c.references.length) c.references = rl.slice(0, 3).map(function(l, i) { return { name: "Ref " + (i + 1), url: "", reasons: [l] }; });
    }
    if (/sitemap|struktur|navigasi/i.test(block) && !c.sitemap.length) {
      c.sitemap = lines.filter(function(l) { return l.length < 35 && l.length > 2 && !/proposed|berikut|struktur/i.test(l); }).slice(0, 8);
    }
    if (/homepage/i.test(block) && !c.homepageSections.length) {
      var pairs = [];
      for (var j = 0; j < lines.length - 1; j++) { if (lines[j].length < 40 && lines[j + 1].length > 10) { pairs.push({ title: lines[j], desc: lines[j + 1] }); j++; } }
      if (pairs.length >= 3) c.homepageSections = pairs.slice(0, 6);
    }
    if (/technical|teknis/i.test(block) && !c.techScope.length) {
      c.techScope = lines.filter(function(l) { return l.length > 5 && l.length < 60 && !/technical|teknis|scope/i.test(l); }).slice(0, 7);
    }
    if (/data.*asset|requirement|aset/i.test(block) && !c.clientPrep.length) {
      var sp = lines.findIndex(function(l) { return /jika|belum lengkap|apabila/i.test(l); });
      if (sp > 0) { c.clientPrep = lines.slice(0, sp).filter(function(l) { return l.length > 5 && !/client|harus|menyiapkan/i.test(l); }).slice(0, 8); c.fallback = lines.slice(sp + 1).filter(function(l) { return l.length > 10; }).slice(0, 5); }
    }
    if (/timeline|risk.*mitigat/i.test(block) && !c.phases.length) {
      c.phases = lines.filter(function(l) { return /phase|tahap/i.test(l); }).slice(0, 5);
      var ri = lines.findIndex(function(l) { return /^risiko/i.test(l); });
      var si = lines.findIndex(function(l) { return /^solusi/i.test(l); });
      if (ri >= 0 && si > ri) { c.risks2 = lines.slice(ri + 1, si).filter(function(l) { return l.length > 5; }).slice(0, 4); c.solutions = lines.slice(si + 1).filter(function(l) { return l.length > 5; }).slice(0, 4); }
    }
  });
  return c;
}

// ========== MAIN ==========

export async function generatePPTX(data, aiText) {
  var pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Banana Digital Boost";
  pres.title = "Website Strategy - " + data.namaPerusahaan;

  var theme = buildTheme(data);
  var c = parseAIContent(aiText);

  sCover(pres, data, theme);
  sBusiness(pres, data, c, 1, theme);
  sPositioning(pres, data, c, 2, theme);
  sWhyMatters(pres, data, c, 3, theme);
  sReferensi(pres, data, c, 4, theme);
  sSitemap(pres, data, c, 5, theme);
  sHomepage(pres, data, c, 6, theme);
  sTechnical(pres, data, c, 7, theme);
  sAssetReq(pres, data, c, 8, theme);
  sTimeline(pres, data, c, 9, theme);
  sClosing(pres, theme);

  var fileName = "Strategy_Website_" + (data.namaPerusahaan || "Client").replace(/[^a-zA-Z0-9]/g, "_") + ".pptx";
  await pres.writeFile({ fileName: fileName });
  return fileName;
}
