/**
 * fetch-quangtri-exact.ts — Vòng 3: tải ảnh theo TÊN FILE CHÍNH XÁC trên Wikimedia Commons
 * (chạy sau khi đã chọn tay qua API search)
 */
import * as fs from "fs";
import * as path from "path";

const TOPIC = "QuangTri1972";
const API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = { "User-Agent": "RemotionVideoSkill/1.0 (educational video)" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// sceneId -> tên file chính xác trên Commons
const PICKS: Record<string, string> = {
  scene11_b: "File:Le duc Tho and Henry Kissinger White House photo.jpg",
};

interface ImageRecord {
  id: string;
  file: string;
  title: string;
  credit: string;
  license: string;
  source: string;
  width: number;
  height: number;
}

async function fetchWithRetry(url: string, retries = 4): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res;
    lastErr = new Error(`HTTP ${res.status}`);
    if (res.status === 429) {
      await sleep(5000 * (i + 1));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

async function main() {
  const topicDir = path.resolve(process.cwd(), "public", "images", TOPIC);
  const manifestPath = path.join(topicDir, "images.json");
  const manifest: ImageRecord[] = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  for (const [sceneId, title] of Object.entries(PICKS)) {
    const params = new URLSearchParams({
      action: "query",
      titles: title,
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "1400",
      format: "json",
    });
    try {
      const res = await fetchWithRetry(`${API}?${params}`);
      const data = await res.json();
      const pages = Object.values<any>(data?.query?.pages ?? {});
      const ii = pages[0]?.imageinfo?.[0];
      if (!ii) throw new Error("no imageinfo");

      const dlUrl = ii.thumburl || ii.url;
      const dest = path.join(topicDir, `${sceneId}.jpg`);
      const imgRes = await fetchWithRetry(dlUrl);
      fs.writeFileSync(dest, Buffer.from(await imgRes.arrayBuffer()));

      const meta = ii.extmetadata ?? {};
      const record: ImageRecord = {
        id: sceneId,
        file: `images/${TOPIC}/${sceneId}.jpg`,
        title: title.replace(/^File:/, "").replace(/\.(jpg|jpeg|png|webp)$/i, ""),
        credit: (meta.Artist?.value ?? "Wikimedia Commons").replace(/<[^>]+>/g, "").trim(),
        license: (meta.LicenseShortName?.value ?? "see Commons").trim(),
        source: ii.descriptionurl ?? "https://commons.wikimedia.org",
        width: ii.width,
        height: ii.height,
      };

      const idx = manifest.findIndex((m) => m.id === sceneId);
      if (idx >= 0) manifest[idx] = record;
      else manifest.push(record);

      console.log(`✓ ${sceneId}: ${title} (${ii.width}x${ii.height}, ${record.license})`);
    } catch (err) {
      console.warn(`⚠️ ${sceneId}: ${(err as Error).message}`);
    }
    await sleep(2500);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📊 manifest giờ có ${manifest.length} ảnh`);
}

void main();
