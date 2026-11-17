#!/usr/bin/env node
// 빌드 결과가 외부 자원을 불러오지 않는지 검사한다.
// 테마는 글꼴·아이콘·검색을 모두 자체 제공한다. 외부 CDN 이 끼어들면 여기서 실패한다.
//
//   node scripts/check-external.mjs <dist 폴더> <사이트 주소>
//
// 보는 것: <script src>, 자원을 불러오는 <link href>, <img>/<source>/<video>/<audio>/<iframe> 의
// src·srcset, CSS 의 url() 과 @import.
// 보지 않는 것: <a href>(글 본문의 일반 링크), canonical·alternate·me 같은 주소 표기용 <link>,
// og:image 같은 <meta> 값.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const [dir, site] = process.argv.slice(2);
if (!dir || !site) {
  console.error("usage: check-external.mjs <dist> <site-url>");
  process.exit(2);
}
const siteHost = new URL(site).host;

// 자원을 불러오지 않고 주소만 적는 rel 값.
const POINTER_RELS = new Set(["canonical", "alternate", "me", "author", "license", "next", "prev"]);

function* walk(folder) {
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** 다른 호스트를 가리키는 절대 주소인가. data:, 상대 경로, 같은 사이트 주소는 통과. */
function isExternal(url) {
  const value = url.trim().replace(/^['"]|['"]$/g, "");
  const absolute = value.startsWith("//") ? "https:" + value : value;
  if (!/^https?:/i.test(absolute)) return false;
  try {
    return new URL(absolute).host !== siteHost;
  } catch {
    return true;
  }
}

const attr = (tag, name) =>
  tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(2).find(v => v != null);

function checkCss(css, report) {
  for (const m of css.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) {
    if (isExternal(m[1])) report(`url(${m[1]})`);
  }
  for (const m of css.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi)) {
    if (isExternal(m[1])) report(`@import ${m[1]}`);
  }
}

function checkHtml(html, report) {
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    const src = attr(tag, "src");
    if (src && isExternal(src)) report(`<script src="${src}">`);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rels = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    if (rels.length > 0 && rels.every(rel => POINTER_RELS.has(rel))) continue;
    const href = attr(tag, "href");
    if (href && isExternal(href)) report(`<link rel="${rels.join(" ")}" href="${href}">`);
  }
  for (const [tag] of html.matchAll(/<(?:img|source|video|audio|iframe|embed|track)\b[^>]*>/gi)) {
    const src = attr(tag, "src");
    if (src && isExternal(src)) report(`${tag.slice(0, tag.indexOf(" "))} src="${src}">`);
    for (const candidate of (attr(tag, "srcset") ?? "").split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url && isExternal(url)) report(`srcset ${url}`);
    }
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(m[1], report);
  for (const m of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) checkCss(m[1], report);
}

const found = [];
let files = 0;
for (const path of walk(dir)) {
  const kind = path.endsWith(".html") ? "html" : path.endsWith(".css") ? "css" : null;
  if (!kind) continue;
  files += 1;
  const report = what => found.push(`${relative(dir, path)}: ${what}`);
  const text = readFileSync(path, "utf8");
  if (kind === "html") checkHtml(text, report);
  else checkCss(text, report);
}

if (files === 0) {
  console.error(`no .html or .css files under ${dir}`);
  process.exit(2);
}
if (found.length > 0) {
  console.error(`외부 자원 ${found.length}건:`);
  for (const line of found) console.error("  " + line);
  process.exit(1);
}
console.log(`외부 자원 0건 (${files}개 파일 검사)`);
