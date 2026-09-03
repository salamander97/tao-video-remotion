/**
 * fetch-images.ts — Tự động tìm & tải ảnh tư liệu từ Wikimedia Commons
 *
 * Cách dùng: sửa mảng QUERIES bên dưới rồi chạy `npx tsx scripts/fetch-images.ts`
 * Ảnh lưu vào public/images/<topic>/<sceneId>.jpg kèm manifest images.json
 * (file, tiêu đề gốc, tác giả, license) để hiển thị credit đúng luật.
 */

import * as fs from "fs";
import * as path from "path";

const TOPIC = "QuangTri1972";

interface ImageQuery {
  id: string;
  queries: string[];
  minWidth?: number;
  minHeight?: number;
}

const QUERIES: ImageQuery[] = [
  { id: "scene3_b", queries: ["Vietnam People's Army 1972", "PAVN soldiers 1972 flag", "Quang Tri liberated 1972"] },
  { id: "scene5_b", queries: ["Vietnam War trench soldiers", "Vietnam War bunker 1972"] },
  { id: "scene6_b", queries: ["Vietnam War bomb craters aerial", "Vietnam craters"] },
  { id: "scene7_b", queries: ["Vietnamese soldiers Vietnam War march", "North Vietnam soldiers 1972"] },
  { id: "scene11_b", queries: ["Le Duc Tho Kissinger Paris", "Paris Peace Accords 1973 Kissinger"] },
  { id: "scene12_b", queries: ["Truong Son Martyrs Cemetery", "Vietnamese cemetery memorial"] },
];

const API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = { "User-Agent": "RemotionVideoSkill/1.0 (educational video; contact: local)" };

interface CommonsPage {
  title?: string;
  imageinfo?: Array<{
    url: string;
    thumburl?: string;
    width: number;
    height: number;
    mime?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

async function searchCommons(query: string): Promise<CommonsPage[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1400",
    format: "json",
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  return Object.values(pages) as CommonsPage[];
}

function pickBest(pages: CommonsPage[], minWidth: number, minHeight: number): CommonsPage | null {
  const usable = pages.filter((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii) return false;
    if (ii.mime && !["image/jpeg", "image/png", "image/webp"].includes(ii.mime)) return false;
    return ii.width >= minWidth && ii.height >= minHeight;
  });
  // Ưu tiên ảnh ngang (đẹp cho khung video)
  usable.sort((a, b) => {
    const ra = a.imageinfo![0].width / a.imageinfo![0].height;
    const rb = b.imageinfo![0].width / b.imageinfo![0].height;
    const landscapeScore = (r: number) => (r >= 1.2 && r <= 2.2 ? 0 : 1);
    return landscapeScore(ra) - landscapeScore(rb);
  });
  return usable[0] ?? null;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res;
    lastErr = new Error(`HTTP ${res.status}`);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function download(url: string, dest: string): Promise<void> {
  const res = await fetchWithRetry(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

interface ImageRecord {
  id: string;
  file: string; // staticFile path relative to public/
  title: string;
  credit: string;
  license: string;
  source: string;
  width: number;
  height: number;
}

async function main() {
  const topicDir = path.resolve(process.cwd(), "public", "images", TOPIC);
  fs.mkdirSync(topicDir, { recursive: true });

  // Giữ lại các ảnh đã tải tốt từ vòng trước (không nằm trong QUERIES vòng này)
  const manifestPath = path.join(topicDir, "images.json");
  const manifest: ImageRecord[] = manifestPath && fs.existsSync(manifestPath)
    ? (JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ImageRecord[])
    : [];
  const keep = new Set(QUERIES.map((q) => q.id));
  const kept = manifest.filter((m) => !keep.has(m.id));
  const fresh: ImageRecord[] = [];

  for (const q of QUERIES) {
    const minWidth = q.minWidth ?? 900;
    const minHeight = q.minHeight ?? 600;
    let chosen: CommonsPage | null = null;
    let usedQuery = "";

    for (const query of q.queries) {
      try {
        const pages = await searchCommons(query);
        chosen = pickBest(pages, minWidth, minHeight);
        if (chosen) {
          usedQuery = query;
          break;
        }
      } catch (err) {
        console.warn(`  ⚠️ query "${query}" lỗi: ${(err as Error).message}`);
      }
    }

    if (!chosen) {
      console.log(`  ✗ ${q.id}: không tìm thấy ảnh phù hợp`);
      await sleep(1200);
      continue;
    }

    const ii = chosen.imageinfo![0];
    const dlUrl = ii.thumburl || ii.url;
    const ext = ii.mime === "image/png" ? "png" : "jpg";
    const fileName = `${q.id}.${ext}`;
    const dest = path.join(topicDir, fileName);

    try {
      await download(dlUrl, dest);
      const meta = ii.extmetadata ?? {};
      const artist = (meta.Artist?.value ?? "Wikimedia Commons")
        .replace(/<[^>]+>/g, "")
        .trim();
      const license = (meta.LicenseShortName?.value ?? "see Commons").trim();
      fresh.push({
        id: q.id,
        file: `images/${TOPIC}/${fileName}`,
        title: chosen.title?.replace(/^File:/, "").replace(/\.(jpg|jpeg|png|webp)$/i, "") ?? q.id,
        credit: artist,
        license,
        source: ii.descriptionurl ?? "https://commons.wikimedia.org",
        width: ii.width,
        height: ii.height,
      });
      console.log(`  ✓ ${q.id}: ${chosen.title} (${ii.width}x${ii.height}, ${license}) [${usedQuery}]`);
    } catch (err) {
      console.warn(`  ⚠️ ${q.id}: tải lỗi ${(err as Error).message}`);
    }
    await sleep(1200);
  }

  const all = [...kept, ...fresh];
  fs.writeFileSync(manifestPath, JSON.stringify(all, null, 2));
  console.log(`\n📄 manifest: ${manifestPath}`);
  console.log(`📊 Tổng số ảnh của topic: ${all.length}`);
}

void main();
