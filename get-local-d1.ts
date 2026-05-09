import fs from "node:fs";
import path from "node:path";

export function getLocalD1Path() {
  const d1Dir = path.resolve(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  if (!fs.existsSync(d1Dir)) {
    throw new Error("Local D1 database not found. Please run 'bun run dev' once to initialize it.");
  }
  const files = fs.readdirSync(d1Dir);
  const sqliteFiles = files.filter((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite");
  if (sqliteFiles.length === 0) {
    throw new Error("No SQLite database found in .wrangler/state.");
  }
  // 複数ある場合は最新のものを取得
  const latestDb = sqliteFiles
    .map((f) => ({ file: f, mtime: fs.statSync(path.join(d1Dir, f)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime)[0].file;
    
  return path.join(d1Dir, latestDb);
}
