#!/usr/bin/env node
/**
 * 站点技术自检：JSON-LD、内部链接、canonical、sitemap、robots。
 * 用法：node tools/site-check/validate_site.js output/luhenggang-site
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const pages = walk(root)
  .map((f) => path.relative(root, f).split(path.sep).join("/"))
  .sort();
let errors = 0;
let warnings = 0;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

console.log(`site root: ${root}`);

for (const page of pages) {
  if (page.startsWith("admin/")) continue;
  if (!fs.existsSync(path.join(root, page))) {
    console.log(`[FAIL] missing page: ${page}`);
    errors++;
    continue;
  }
  const html = read(page);
  const dir = path.dirname(page);

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) {
    console.log(`[WARN] ${page}: no JSON-LD`);
    warnings++;
  }
  blocks.forEach((m, i) => {
    try {
      const data = JSON.parse(m[1]);
      const types = data["@graph"]
        ? data["@graph"].map((x) => x["@type"]).join("+")
        : data["@type"];
      console.log(`[OK]   ${page} JSON-LD #${i + 1}: ${types}`);
    } catch (e) {
      console.log(`[FAIL] ${page} JSON-LD #${i + 1}: ${e.message}`);
      errors++;
    }
  });

  // canonical
  if (!/<link rel="canonical" href="https?:\/\/[^"]+">/.test(html)) {
    console.log(`[WARN] ${page}: canonical missing`);
    warnings++;
  }

  // title / description / h1
  for (const [name, re] of [
    ["title", /<title>[^<]{5,}<\/title>/],
    ["description", /<meta name="description" content="[^"]{20,}">/],
    ["h1", /<h1[\s>]/],
  ]) {
    if (!re.test(html)) {
      console.log(`[FAIL] ${page}: ${name} missing or too short`);
      errors++;
    }
  }

  // internal links
  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((x) => !/^(https?:|#|mailto:|tel:)/.test(x));
  for (const link of links) {
    const target = path.normalize(path.join(dir, link.split("#")[0]));
    if (!fs.existsSync(path.join(root, target))) {
      console.log(`[FAIL] ${page}: broken link -> ${link}`);
      errors++;
    }
  }
}

// sitemap
const sitemapPath = path.join(root, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const count = (sitemap.match(/<url>/g) || []).length;
  console.log(`[OK]   sitemap.xml: ${count} urls`);
  for (const loc of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const rel = loc[1].replace(/^https?:\/\/[^/]+\//, "");
    const file = rel === "" ? "index.html" : rel;
    if (!fs.existsSync(path.join(root, file))) {
      console.log(`[FAIL] sitemap.xml: url has no local file -> ${loc[1]}`);
      errors++;
    }
  }
} else {
  console.log("[FAIL] sitemap.xml missing");
  errors++;
}

// robots
const robotsPath = path.join(root, "robots.txt");
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!/Sitemap:\s*https?:\/\/\S+/.test(robots)) {
    console.log("[WARN] robots.txt: sitemap not declared");
    warnings++;
  } else {
    console.log("[OK]   robots.txt: sitemap declared");
  }
} else {
  console.log("[FAIL] robots.txt missing");
  errors++;
}

console.log(`\nresult: ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
