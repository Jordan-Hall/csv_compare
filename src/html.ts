import type { AnyReport } from "./report";

/** Render a report as a self-contained, interactive HTML document.
 * Features:
 * - Single-file output, no external dependencies
 * - Dark and light theme toggle
 * - Inline SVG charts (gauge, donut, bar, venn)
 * - Sortable, searchable tables
 * - Severity filtering for findings
 * - Responsive grid layout
 * - Side-by-side compare visualizations
 * - Risk score visualization
 */
export function renderHtmlReport(report: AnyReport): string {
      const data = JSON.stringify(report).replace(/[<\u2028\u2029]/g, (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"));
  const isProfile = "mode" in report && report.mode === "profile";
  const title = isProfile ? "CSV Profile Report" : "CSV Compare Report";

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${STYLES}</style>
</head>
<body>
<div id="app" aria-busy="true">
  <div class="boot">Rendering report…</div>
</div>
<script id="report-data" type="application/json">${data}</script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

const STYLES = String.raw`
:root {
  --bg: #f6f5f2;
  --bg-2: #ffffff;
  --panel: #efede8;
  --panel-solid: #ffffff;
  --panel-border: #e5e2da;
  --hover: #f6f4ef;
  --text: #2b2a26;
  --muted: #6e6a61;
  --faint: #a39e93;
  --accent: #46708f;
  --accent-2: #bd6b4a;
  --grid: #ebe8e1;
  --shadow: 0 1px 2px rgba(60,54,44,0.05), 0 1px 3px rgba(60,54,44,0.07);
  --shadow-hover: 0 8px 24px rgba(60,54,44,0.12);
  --radius: 14px;
  --critical: #b0453b;
  --high: #c2793c;
  --medium: #b3933a;
  --low: #4f8385;
  --info: #46708f;
  --pass: #5b8c5a;
  --fail: #b0453b;
}
[data-theme="dark"] {
  --bg: #14130f;
  --bg-2: #1b1916;
  --panel: #211e1a;
  --panel-solid: #1b1916;
  --panel-border: #2e2a24;
  --hover: #211e19;
  --text: #e8e4dc;
  --muted: #a39d90;
  --faint: #6c665b;
  --accent: #7aa2bd;
  --accent-2: #d29070;
  --grid: #2a2620;
  --shadow: 0 1px 2px rgba(0,0,0,0.32);
  --shadow-hover: 0 10px 30px rgba(0,0,0,0.48);
  --critical: #d27a6f;
  --high: #d39a5f;
  --medium: #c9ac63;
  --low: #74aaab;
  --info: #7aa2bd;
  --pass: #84b181;
  --fail: #d27a6f;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font: 14.5px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}
.boot { padding: 96px; text-align: center; color: var(--muted); }
.wrap { max-width: 1200px; margin: 0 auto; padding: 32px 24px 88px; }

header.top {
  display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap;
  padding: 26px 28px; border-radius: var(--radius);
  background: var(--panel-solid); border: 1px solid var(--panel-border); box-shadow: var(--shadow);
  position: relative;
}
header.top .grow { flex: 1 1 320px; min-width: 240px; }
header.top h1 { margin: 0 0 6px; font-size: 23px; font-weight: 650; letter-spacing: -0.02em; }
header.top .sub { color: var(--muted); font-size: 13.5px; word-break: break-all; }
header.top .meta { margin-top: 16px; display: flex; gap: 22px; flex-wrap: wrap; color: var(--muted); font-size: 12.5px; }
header.top .meta b { color: var(--faint); font-weight: 500; }

.verdict { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; padding-top: 2px; }
.badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 15px; border-radius: 9px; font-weight: 650; font-size: 12.5px;
  letter-spacing: 0.02em;
}
.badge.pass { background: color-mix(in srgb, var(--pass) 12%, transparent); color: var(--pass); border: 1px solid color-mix(in srgb, var(--pass) 30%, transparent); }
.badge.fail { background: color-mix(in srgb, var(--fail) 11%, transparent); color: var(--fail); border: 1px solid color-mix(in srgb, var(--fail) 28%, transparent); }
.badge.profile { background: color-mix(in srgb, var(--info) 11%, transparent); color: var(--info); border: 1px solid color-mix(in srgb, var(--info) 28%, transparent); }
.badge .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

.headside { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; margin-left: auto; }
.toolbar { display: flex; gap: 8px; }
.iconbtn {
  background: var(--panel-solid); border: 1px solid var(--panel-border); color: var(--muted);
  border-radius: 9px; padding: 7px 12px; cursor: pointer; font-size: 12.5px; font-weight: 500; transition: .15s;
}
.iconbtn:hover { border-color: var(--text); color: var(--text); }

.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 14px; margin: 20px 0; }
.kpi {
  background: var(--panel-solid); border: 1px solid var(--panel-border); border-radius: 12px;
  padding: 18px 18px 16px; box-shadow: var(--shadow); position: relative; transition: box-shadow .15s, transform .15s;
}
.kpi:hover { box-shadow: var(--shadow-hover); }
.kpi.warn::after, .kpi.bad::after, .kpi.good::after { content:""; position:absolute; top:18px; right:18px; width:8px; height:8px; border-radius:50%; }
.kpi.warn::after { background: var(--high); }
.kpi.bad::after { background: var(--critical); }
.kpi.good::after { background: var(--pass); }
.kpi .label { color: var(--muted); font-size: 11.5px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }
.kpi .value { font-size: 27px; font-weight: 650; margin-top: 8px; letter-spacing: -0.02em; line-height: 1.1; }
.kpi .hint { color: var(--faint); font-size: 12px; margin-top: 4px; }

nav.tabs { display: flex; gap: 2px; flex-wrap: wrap; margin: 26px 0 20px; border-bottom: 1px solid var(--panel-border); }
nav.tabs button {
  background: none; border: none; color: var(--muted); cursor: pointer;
  padding: 11px 16px; font-size: 13.5px; font-weight: 550; border-bottom: 2px solid transparent;
  transition: .15s; position: relative; top: 1px;
}
nav.tabs button:hover { color: var(--text); }
nav.tabs button.active { color: var(--text); border-bottom-color: var(--accent); }
nav.tabs button .pill { margin-left: 7px; font-size: 11px; background: var(--panel); padding: 1px 7px; border-radius: 999px; color: var(--muted); }

section.panel { display: none; animation: fade .2s ease; }
section.panel.active { display: block; }
@keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.grid { display: grid; gap: 16px; }
.grid.two { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
.grid.three { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }

.card {
  background: var(--panel-solid); border: 1px solid var(--panel-border); border-radius: 12px;
  padding: 20px 22px; box-shadow: var(--shadow);
}
.card h3 { margin: 0 0 4px; font-size: 14.5px; font-weight: 600; letter-spacing: -0.01em; }
.card .desc { color: var(--muted); font-size: 12.5px; margin-bottom: 16px; line-height: 1.5; }
.card.full { grid-column: 1 / -1; }

.empty { color: var(--faint); padding: 20px 0; text-align: center; font-size: 13px; }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--panel-border); vertical-align: top; }
th { color: var(--muted); font-weight: 550; font-size: 11.5px; text-transform: uppercase; letter-spacing: .03em; cursor: pointer; user-select: none; white-space: nowrap; position: sticky; top: 0; background: var(--panel-solid); z-index: 1; }
th.sortable::after { content: " ↕"; color: var(--faint); font-size: 10px; opacity: .6; }
th.sort-asc::after { content: " ↑"; color: var(--accent); opacity: 1; }
th.sort-desc::after { content: " ↓"; color: var(--accent); opacity: 1; }
tbody tr { transition: background .12s; }
tbody tr:hover { background: var(--hover); }
tbody tr:last-child td { border-bottom: none; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
.tablewrap { max-height: 560px; overflow: auto; border: 1px solid var(--panel-border); border-radius: 11px; }
.tablewrap.short { max-height: 380px; }

.controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
.search {
  flex: 1 1 240px; background: var(--panel-solid); border: 1px solid var(--panel-border); color: var(--text);
  border-radius: 9px; padding: 9px 13px; font-size: 13px; outline: none; transition: .15s;
}
.search::placeholder { color: var(--faint); }
.search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }
.chip {
  background: var(--panel-solid); border: 1px solid var(--panel-border); color: var(--muted);
  border-radius: 999px; padding: 6px 13px; font-size: 12px; font-weight: 500; cursor: pointer; transition: .15s; text-transform: capitalize;
}
.chip:hover { border-color: var(--text); color: var(--text); }
.chip.active { color: #fff; border-color: transparent; }
.chip[data-sev="critical"].active { background: var(--critical); }
.chip[data-sev="high"].active { background: var(--high); }
.chip[data-sev="medium"].active { background: var(--medium); }
.chip[data-sev="low"].active { background: var(--low); }
.chip[data-sev="info"].active { background: var(--info); }
.chip.all.active { background: var(--text); }

.tag {
  display: inline-block; padding: 2px 9px; border-radius: 7px; font-size: 11.5px; font-weight: 500;
  background: var(--panel); color: var(--muted); margin: 1px 3px 1px 0;
}
.sev { display:inline-flex; align-items:center; gap:6px; padding: 3px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; text-transform: capitalize; letter-spacing: .01em; }
.sev::before { content:""; width:7px; height:7px; border-radius:50%; background: currentColor; }
.sev.critical { color: var(--critical); background: color-mix(in srgb, var(--critical) 12%, transparent); }
.sev.high { color: var(--high); background: color-mix(in srgb, var(--high) 12%, transparent); }
.sev.medium { color: var(--medium); background: color-mix(in srgb, var(--medium) 14%, transparent); }
.sev.low { color: var(--low); background: color-mix(in srgb, var(--low) 12%, transparent); }
.sev.info { color: var(--info); background: color-mix(in srgb, var(--info) 12%, transparent); }

.finding {
  border: 1px solid var(--panel-border); border-radius: 12px; padding: 18px 20px; margin-bottom: 14px;
  background: var(--panel-solid); border-left: 3px solid var(--info); box-shadow: var(--shadow);
}
.finding[data-sev="critical"] { border-left-color: var(--critical); }
.finding[data-sev="high"] { border-left-color: var(--high); }
.finding[data-sev="medium"] { border-left-color: var(--medium); }
.finding[data-sev="low"] { border-left-color: var(--low); }
.finding .fhead { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px; }
.finding .ftitle { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
.finding .fsum { color: var(--text); margin: 4px 0 14px; font-size: 13.5px; }
.finding .cols { display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 16px; }
.finding .cols h5 { margin:0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing:.04em; color: var(--muted); font-weight: 600; }
.finding ul { margin: 0; padding-left: 18px; color: var(--muted); font-size: 13px; }
.finding ul li { margin: 3px 0; }
.kchip { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; }

.bar-row { display: grid; grid-template-columns: 1fr; gap: 9px; }
.bar-item { display:flex; align-items:center; gap:12px; font-size: 12.5px; }
.bar-item .blabel { flex: 0 0 36%; max-width: 36%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
.bar-item .btrack { flex: 1; height: 8px; background: var(--grid); border-radius: 999px; overflow: hidden; }
.bar-item .bfill { height: 100%; border-radius: 999px; background: var(--accent); transition: width .65s cubic-bezier(.2,.8,.2,1); }
.bar-item .bval { flex: 0 0 60px; text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; font-weight: 500; }

.legend { display:flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; justify-content:center; }
.legend span { display:inline-flex; align-items:center; gap:7px; font-size: 12px; color: var(--muted); }
.legend i { width: 9px; height: 9px; border-radius: 3px; display:inline-block; }
.center { text-align: center; }
.chartbox { display:flex; justify-content:center; align-items:center; min-height: 200px; padding: 8px 0; }
code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; background: var(--panel); padding: 1px 6px; border-radius: 6px; }
pre.json { background: var(--panel); border:1px solid var(--panel-border); border-radius: 11px; padding: 18px; overflow:auto; max-height: 640px; font-size: 12px; line-height: 1.5; font-family: ui-monospace, SFMono-Regular, monospace; color: var(--text); }
.muted { color: var(--muted); }
.right { text-align: right; }
.footer { margin-top: 44px; padding-top: 22px; border-top: 1px solid var(--panel-border); text-align: center; color: var(--faint); font-size: 12px; }
.scoretip { color: var(--muted); font-size: 12.5px; text-align:center; margin-top: 10px; }
`;

const SCRIPT = String.raw`
(function(){
"use strict";
var REPORT = JSON.parse(document.getElementById("report-data").textContent);
var IS_PROFILE = REPORT.mode === "profile";
var SEV_ORDER = { critical:0, high:1, medium:2, low:3, info:4 };
var SEV_COLOR = { critical:"var(--critical)", high:"var(--high)", medium:"var(--medium)", low:"var(--low)", info:"var(--info)" };

function el(tag, attrs, children){
  var e = document.createElement(tag);
  if (attrs) for (var k in attrs){
    if (k === "class") e.className = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else if (k.slice(0,2) === "on" && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  }
  if (children != null){
    if (!Array.isArray(children)) children = [children];
    children.forEach(function(c){ if (c == null) return; e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  }
  return e;
}
function esc(s){ return String(s == null ? "" : s); }
function fmtNum(n){ return (typeof n === "number" ? n : 0).toLocaleString(); }
function pct(r){ return (Math.round((r||0)*1000)/10) + "%"; }
function showBlank(v){ return v === "" || v == null ? "(blank)" : String(v); }
function clamp(n,a,b){ return Math.max(a, Math.min(b, n)); }

function svgEl(tag, attrs){
  var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  var style = "";
  for (var k in attrs){
    if (attrs[k] == null) continue;
    if (k === "fill" || k === "stroke"){ style += k + ":" + attrs[k] + ";"; }
    else e.setAttribute(k, attrs[k]);
  }
  if (style) e.setAttribute("style", style);
  return e;
}
function gauge(value){
  value = clamp(Math.round(value||0), 0, 100);
  var size = 200, cx = size/2, cy = size/2, r = 78, stroke = 18;
  var col = value >= 70 ? "var(--critical)" : value >= 40 ? "var(--high)" : value >= 15 ? "var(--medium)" : "var(--pass)";
  var svg = svgEl("svg", { viewBox:"0 0 "+size+" "+(size*0.66), width:"100%", style:"max-width:260px" });
  function arc(color, frac, op){
    var p = svgEl("path", {
      d: describeArc(cx, cy, r, -180, -180 + 180*frac),
      fill:"none", stroke: color, "stroke-width": stroke, "stroke-linecap":"round", opacity: op
    });
    return p;
  }
  svg.appendChild(arc("var(--grid)", 1, 1));
  svg.appendChild(arc(col, value/100, 1));
  var t = svgEl("text", { x:cx, y:cy-6, "text-anchor":"middle", fill:"var(--text)", "font-size":"40", "font-weight":"700" });
  t.textContent = value;
  svg.appendChild(t);
  var t2 = svgEl("text", { x:cx, y:cy+16, "text-anchor":"middle", fill:"var(--muted)", "font-size":"12" });
  t2.textContent = "RISK SCORE";
  svg.appendChild(t2);
  return svg;
}
function polar(cx, cy, r, deg){ var a = deg*Math.PI/180; return { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) }; }
function describeArc(cx, cy, r, startDeg, endDeg){
  var s = polar(cx, cy, r, startDeg), e = polar(cx, cy, r, endDeg);
  var large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return ["M", s.x, s.y, "A", r, r, 0, large, 1, e.x, e.y].join(" ");
}
function donut(segments){
  var total = segments.reduce(function(a,s){ return a + s.value; }, 0);
  var size = 200, cx = size/2, cy = size/2, r = 70, sw = 26;
  var svg = svgEl("svg", { viewBox:"0 0 "+size+" "+size, width:"100%", style:"max-width:220px" });
  if (total <= 0){
    svg.appendChild(svgEl("circle", { cx:cx, cy:cy, r:r, fill:"none", stroke:"var(--grid)", "stroke-width":sw }));
  } else {
    var start = -90;
    segments.forEach(function(s){
      if (s.value <= 0) return;
      var frac = s.value/total, end = start + frac*360;
      var path = svgEl("path", { d: describeArc(cx, cy, r, start, end - 0.0001), fill:"none", stroke: s.color, "stroke-width": sw });
      svg.appendChild(path);
      start = end;
    });
  }
  var t = svgEl("text", { x:cx, y:cy-2, "text-anchor":"middle", fill:"var(--text)", "font-size":"26", "font-weight":"700" });
  t.textContent = fmtNum(total);
  svg.appendChild(t);
  var t2 = svgEl("text", { x:cx, y:cy+18, "text-anchor":"middle", fill:"var(--muted)", "font-size":"11" });
  t2.textContent = "total";
  svg.appendChild(t2);
  return svg;
}
function legend(items){
  return el("div", { class:"legend" }, items.filter(function(i){return i.value>0;}).map(function(i){
    return el("span", null, [ el("i", { style:"background:"+i.color }), i.label + " (" + fmtNum(i.value) + ")" ]);
  }));
}
function barChart(items, opts){
  opts = opts || {};
  if (!items.length) return el("div", { class:"empty" }, opts.empty || "No data.");
  var max = Math.max.apply(null, items.map(function(i){ return i.value; }).concat([1]));
  return el("div", { class:"bar-row" }, items.map(function(i){
    var w = Math.max(2, (i.value/max)*100);
    return el("div", { class:"bar-item" }, [
      el("div", { class:"blabel", title:i.label }, i.label),
      el("div", { class:"btrack" }, [ el("div", { class:"bfill", style:"width:0%" , "data-w": w }) ]),
      el("div", { class:"bval" }, opts.fmt ? opts.fmt(i.value) : fmtNum(i.value))
    ]);
  }));
}
function venn(matched, missing, extra){
  var w = 360, h = 220, r = 78;
  var cxA = 130, cxB = 230, cy = 110;
  var svg = svgEl("svg", { viewBox:"0 0 "+w+" "+h, width:"100%", style:"max-width:420px" });
  var defs = svgEl("defs");
  svg.appendChild(defs);
  var cA = svgEl("circle", { cx:cxA, cy:cy, r:r, fill:"var(--accent)", "fill-opacity":"0.28", stroke:"var(--accent)", "stroke-width":"1.5" });
  var cB = svgEl("circle", { cx:cxB, cy:cy, r:r, fill:"var(--accent-2)", "fill-opacity":"0.28", stroke:"var(--accent-2)", "stroke-width":"1.5" });
  svg.appendChild(cA); svg.appendChild(cB);
  function label(x, y, big, small, anchor){
    var t = svgEl("text", { x:x, y:y, "text-anchor":anchor||"middle", fill:"var(--text)", "font-size":"20", "font-weight":"700" });
    t.textContent = big; svg.appendChild(t);
    var s = svgEl("text", { x:x, y:y+16, "text-anchor":anchor||"middle", fill:"var(--muted)", "font-size":"10" });
    s.textContent = small; svg.appendChild(s);
  }
  label(cxA-34, cy, fmtNum(missing), "source only");
  label(cxB+34, cy, fmtNum(extra), "target only");
  label((cxA+cxB)/2, cy, fmtNum(matched), "matched");
  var capA = svgEl("text", { x:cxA-30, y:cy-r-8, "text-anchor":"middle", fill:"var(--accent)", "font-size":"11", "font-weight":"700" }); capA.textContent="SOURCE";
  var capB = svgEl("text", { x:cxB+30, y:cy-r-8, "text-anchor":"middle", fill:"var(--accent-2)", "font-size":"11", "font-weight":"700" }); capB.textContent="TARGET";
  svg.appendChild(capA); svg.appendChild(capB);
  return svg;
}

function buildTable(columns, rows, opts){
  opts = opts || {};
  var state = { sortKey: opts.sortKey || null, dir: opts.dir || "desc", filter: "" };
  var wrap = el("div");
  if (opts.search){
    var input = el("input", { class:"search", type:"search", placeholder: opts.searchPlaceholder || "Search…" });
    input.addEventListener("input", function(){ state.filter = input.value.toLowerCase(); render(); });
    wrap.appendChild(el("div", { class:"controls" }, [input]));
  }
  var tw = el("div", { class:"tablewrap" + (opts.short ? " short" : "") });
  var table = el("table");
  var thead = el("thead");
  var headRow = el("tr");
  columns.forEach(function(c){
    var th = el("th", { class: "sortable" + (c.num ? " right" : "") }, c.label);
    th.addEventListener("click", function(){
      if (state.sortKey === c.key){ state.dir = state.dir === "asc" ? "desc" : "asc"; }
      else { state.sortKey = c.key; state.dir = c.num ? "desc" : "asc"; }
      render();
    });
    th._col = c;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  var tbody = el("tbody");
  table.appendChild(thead); table.appendChild(tbody);
  tw.appendChild(table); wrap.appendChild(tw);

  function sortVal(c, row){ return c.sortVal ? c.sortVal(row) : row[c.key]; }
  function render(){
    Array.prototype.forEach.call(headRow.children, function(th){
      th.classList.remove("sort-asc","sort-desc");
      if (th._col.key === state.sortKey) th.classList.add(state.dir === "asc" ? "sort-asc" : "sort-desc");
    });
    var data = rows.slice();
    if (state.filter){
      data = data.filter(function(r){ return (opts.searchText ? opts.searchText(r) : JSON.stringify(r)).toLowerCase().indexOf(state.filter) !== -1; });
    }
    if (state.sortKey){
      var c = columns.filter(function(x){ return x.key === state.sortKey; })[0];
      if (c) data.sort(function(a,b){
        var va = sortVal(c,a), vb = sortVal(c,b);
        if (typeof va === "number" && typeof vb === "number") return state.dir==="asc"? va-vb : vb-va;
        va = String(va==null?"":va).toLowerCase(); vb = String(vb==null?"":vb).toLowerCase();
        return state.dir==="asc" ? (va<vb?-1:va>vb?1:0) : (va<vb?1:va>vb?-1:0);
      });
    }
    tbody.innerHTML = "";
    if (!data.length){ tbody.appendChild(el("tr", null, [ el("td", { colspan: columns.length, class:"empty" }, opts.empty || "Nothing matched.") ])); return; }
    data.forEach(function(r){
      var tr = el("tr");
      columns.forEach(function(c){
        var content = c.render ? c.render(r) : esc(r[c.key]);
        var td = el("td", { class: c.num ? "num" : null });
        if (typeof content === "string") td.innerHTML = content; else if (content) td.appendChild(content);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  render();
  return wrap;
}

function sevBadge(s){ return el("span", { class:"sev "+s }, s); }
function tags(arr){ return el("span", null, (arr||[]).map(function(t){ return el("span", { class:"tag" }, t); })); }
function keyChips(arr){ return (arr||[]).map(function(k){ return el("span", { class:"tag kchip" }, showBlank(k)); }); }
function card(title, desc, body, full){
  var c = el("div", { class:"card" + (full ? " full" : "") });
  if (title) c.appendChild(el("h3", null, title));
  if (desc) c.appendChild(el("div", { class:"desc" }, desc));
  if (body) c.appendChild(typeof body === "string" ? el("div", { html: body }) : body);
  return c;
}
function animateBars(root){
  requestAnimationFrame(function(){
    root.querySelectorAll(".bfill[data-w]").forEach(function(b){ b.style.width = b.getAttribute("data-w") + "%"; });
  });
}

function buildTabs(defs){
  var nav = el("nav", { class:"tabs" });
  var panels = el("div");
  defs.forEach(function(d, i){
    var btn = el("button", { class: i===0?"active":"" }, [ document.createTextNode(d.label) ]);
    if (d.count != null) btn.appendChild(el("span", { class:"pill" }, String(d.count)));
    var panel = el("section", { class:"panel" + (i===0?" active":"") });
    btn.addEventListener("click", function(){
      nav.querySelectorAll("button").forEach(function(b){ b.classList.remove("active"); });
      panels.querySelectorAll("section.panel").forEach(function(p){ p.classList.remove("active"); });
      btn.classList.add("active"); panel.classList.add("active");
      if (!panel._rendered){ panel.appendChild(d.render()); panel._rendered = true; animateBars(panel); }
    });
    nav.appendChild(btn);
    if (i===0){ panel.appendChild(d.render()); panel._rendered = true; }
    panels.appendChild(panel);
  });
  var frag = document.createDocumentFragment();
  frag.appendChild(nav); frag.appendChild(panels);
  return frag;
}

/* COMPARE MODE */
function renderCompare(){
  var r = REPORT, a = r.analysis, intel = a.intelligence, an = a.analytics;
  var root = el("div", { class:"wrap" });
  var verdict = r.passed
    ? el("div", { class:"verdict" }, [ el("div", { class:"badge pass" }, [ el("span", { class:"dot" }), "Pass" ]) ])
    : el("div", { class:"verdict" }, [ el("div", { class:"badge fail" }, [ el("span", { class:"dot" }), "Fail" ]) ]);
  root.appendChild(header(r.sourcePath + "  →  " + r.targetPath, [
    ["Key field", r.keyField], ["Generated", new Date(r.generatedAt).toLocaleString()],
    ["Source rows", fmtNum(r.sourceRows)], ["Target rows", fmtNum(r.targetRows)]
  ], verdict));

  var matchRate = r.sourceRows ? r.matchedRows / r.sourceRows : 0;
  root.appendChild(el("div", { class:"kpis" }, [
    kpi("Matched rows", fmtNum(r.matchedRows), pct(matchRate) + " of source", r.matchedRows ? "good" : ""),
    kpi("Missing in target", fmtNum(r.missingInTarget.length), "absent downstream", r.missingInTarget.length ? "bad" : "good"),
    kpi("Extra in target", fmtNum(r.extraInTarget.length), "not in source", r.extraInTarget.length ? "warn" : "good"),
    kpi("Cell differences", fmtNum(r.cellDifferences.length), an.dataProfile.changedMatchedRows + " row(s) changed", r.cellDifferences.length ? "warn" : "good"),
    kpi("Risk score", String(intel.riskScore), intel.verdict.split(".")[0], intel.riskScore>=70?"bad":intel.riskScore>=40?"warn":"good")
  ]));

  var tabs = buildTabs([
    { id:"overview", label:"Overview", render: function(){ return compareOverview(r, intel, an); } },
    { id:"findings", label:"Findings", count: intel.findings.length, render: function(){ return findingsPanel(intel); } },
    { id:"columns", label:"Columns", count: r.columnStats.length, render: function(){ return columnsPanel(r, a, an); } },
    { id:"rows", label:"Rows", count: r.missingInTarget.length + r.extraInTarget.length, render: function(){ return rowsPanel(r, a, an); } },
    { id:"fields", label:"Fields", count: a.inferredFields.length, render: function(){ return fieldsPanel(a, an); } },
    { id:"values", label:"Values", count: r.columnStats.length, render: function(){ return valuesPanel(); } },
    { id:"method", label:"Method", render: function(){ return methodPanel(); } }
  ].concat(a.localAi ? [{ id:"ai", label:"AI Narrative", render: function(){ return aiPanel(a.localAi); } }] : [])
   .concat([{ id:"raw", label:"Raw JSON", render: function(){ return rawPanel(); } }]));
  root.appendChild(tabs);
  root.appendChild(footer());
  return root;
}

function compareOverview(r, intel, an){
  var grid = el("div", { class:"grid two" });
  grid.appendChild(card("Risk assessment", intel.verdict, (function(){
    var box = el("div");
    box.appendChild(el("div", { class:"chartbox" }, [ gauge(intel.riskScore) ]));
    box.appendChild(el("div", { class:"scoretip" }, sevSummaryText(intel.findings)));
    return box;
  })()));
  grid.appendChild(card("Row overlap", "How source and target key sets intersect on " + r.keyField + ".", (function(){
    var box = el("div");
    box.appendChild(el("div", { class:"chartbox" }, [ venn(r.matchedRows, r.missingInTarget.length, r.extraInTarget.length) ]));
    return box;
  })()));
  var sevCounts = {};
  intel.findings.forEach(function(f){ sevCounts[f.severity] = (sevCounts[f.severity]||0)+1; });
  var segs = ["critical","high","medium","low","info"].map(function(s){ return { label:s, value: sevCounts[s]||0, color: SEV_COLOR[s] }; });
  grid.appendChild(card("Findings by severity", "Distribution of " + intel.findings.length + " finding(s).", (function(){
    var box = el("div");
    box.appendChild(el("div", { class:"chartbox" }, [ donut(segs) ]));
    box.appendChild(legend(segs));
    return box;
  })()));
  var topChanged = (an && r.analysis.changedColumns || []).slice(0, 10).map(function(c){ return { label: c.column, value: c.changedCells }; });
  grid.appendChild(card("Most-changed columns", "Cell changes on matched rows.", barChart(topChanged, { empty:"No matched-row value changes." })));
  grid.appendChild(card("Issue layers", "Deterministic checks across data quality dimensions.", issueLayerList(an.issueLayers), true));
  return grid;
}

function sevSummaryText(findings){
  var c = {}; findings.forEach(function(f){ c[f.severity]=(c[f.severity]||0)+1; });
  var parts = ["critical","high","medium","low","info"].filter(function(s){return c[s];}).map(function(s){ return c[s]+" "+s; });
  return parts.length ? parts.join(" · ") : "No findings.";
}

function issueLayerList(layers){
  if (!layers || !layers.length) return el("div", { class:"empty" }, "No issue layers.");
  return el("div", { class:"grid three" }, layers.map(function(l){
    var c = el("div", { class:"card" });
    c.appendChild(el("div", null, [ sevBadge(l.severity), el("span", { class:"tag", style:"margin-left:8px" }, l.layer) ]));
    c.appendChild(el("div", { style:"margin:8px 0 6px;font-weight:600" }, l.summary));
    if (l.evidence && l.evidence.length) c.appendChild(el("ul", { class:"muted", style:"margin:0;padding-left:16px;font-size:12.5px" }, l.evidence.slice(0,4).map(function(e){ return el("li", null, e); })));
    return c;
  }));
}

function findingsPanel(intel){
  var root = el("div");
  var sevs = ["all","critical","high","medium","low","info"];
  var active = "all";
  var search = "";
  var controls = el("div", { class:"controls" });
  var input = el("input", { class:"search", type:"search", placeholder:"Search findings, columns, keys…" });
  input.addEventListener("input", function(){ search = input.value.toLowerCase(); draw(); });
  controls.appendChild(input);
  var chips = {};
  sevs.forEach(function(s){
    var count = s==="all" ? intel.findings.length : intel.findings.filter(function(f){return f.severity===s;}).length;
    var chip = el("div", { class:"chip" + (s==="all"?" all active":"") + (s!=="all"?"":""), "data-sev": s }, s==="all"?"All ("+count+")":s+" ("+count+")");
    chip.addEventListener("click", function(){ active=s; Object.keys(chips).forEach(function(k){ chips[k].classList.remove("active"); }); chip.classList.add("active"); draw(); });
    chips[s]=chip; controls.appendChild(chip);
  });
  root.appendChild(controls);
  var list = el("div");
  root.appendChild(list);
  function draw(){
    var items = intel.findings.filter(function(f){
      if (active!=="all" && f.severity!==active) return false;
      if (search){ return JSON.stringify(f).toLowerCase().indexOf(search) !== -1; }
      return true;
    });
    list.innerHTML = "";
    if (!items.length){ list.appendChild(el("div", { class:"empty" }, "No findings match.")); return; }
    items.forEach(function(f){ list.appendChild(findingCard(f)); });
  }
  draw();
  return root;
}

function findingCard(f){
  var c = el("div", { class:"finding", "data-sev": f.severity });
  c.appendChild(el("div", { class:"fhead" }, [
    sevBadge(f.severity),
    el("span", { class:"ftitle" }, f.title),
    el("span", { class:"tag", style:"margin-left:auto" }, "confidence: " + f.confidence)
  ]));
  c.appendChild(el("div", { class:"fsum" }, f.summary));
  var cols = el("div", { class:"cols" });
  cols.appendChild(colBlock("Evidence", f.evidence));
  cols.appendChild(colBlock("Likely causes", f.likelyCauses));
  cols.appendChild(colBlock("Next checks", f.nextChecks));
  c.appendChild(cols);
  if ((f.relatedColumns && f.relatedColumns.length) || (f.affectedKeys && f.affectedKeys.length)){
    var foot = el("div", { style:"margin-top:10px" });
    if (f.relatedColumns && f.relatedColumns.length) foot.appendChild(el("div", { style:"margin-bottom:4px" }, [ el("span", { class:"muted", style:"font-size:11px;text-transform:uppercase;letter-spacing:.05em" }, "Columns: "), tags(f.relatedColumns) ]));
    if (f.affectedKeys && f.affectedKeys.length) foot.appendChild(el("div", null, [ el("span", { class:"muted", style:"font-size:11px;text-transform:uppercase;letter-spacing:.05em" }, "Keys: ") ].concat(keyChips(f.affectedKeys))));
    c.appendChild(foot);
  }
  return c;
}
function colBlock(title, items){
  var d = el("div");
  d.appendChild(el("h5", null, title));
  if (items && items.length) d.appendChild(el("ul", null, items.map(function(i){ return el("li", null, i); })));
  else d.appendChild(el("div", { class:"muted", style:"font-size:12.5px" }, "—"));
  return d;
}

function columnsPanel(r, a, an){
  var root = el("div");
  var impact = (an.columnImpact||[]).slice(0,12).map(function(i){ return { label:i.column, value:i.score }; });
  root.appendChild(card("Column impact ranking", "Composite score from schema, fill, options and value changes (0–100).", barChart(impact, { empty:"No impactful columns." })));
  if (a.changedColumns && a.changedColumns.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Changed columns", "Matched-row value changes per column.", buildTable(
      [
        { key:"column", label:"Column" },
        { key:"changedCells", label:"Changes", num:true },
        { key:"src", label:"Top source values", render: function(r){ return topVals(r.sourceTopValues); } },
        { key:"tgt", label:"Top target values", render: function(r){ return topVals(r.targetTopValues); } },
        { key:"sampleKeys", label:"Sample keys", render: function(r){ return r.sampleKeys.map(showBlank).slice(0,6).join(", "); } }
      ], a.changedColumns, { search:true, sortKey:"changedCells", dir:"desc", short:true, searchText:function(r){return r.column+" "+r.sampleKeys.join(" ");} }
    )));
  }
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("Column statistics", "Presence, fill and option drift for every column.", buildTable(
    [
      { key:"column", label:"Column" },
      { key:"presence", label:"Presence", render: function(c){ return presenceTag(c); }, sortVal:function(c){ return (c.existsInSource?1:0)+(c.existsInTarget?1:0); } },
      { key:"sourceFilled", label:"Src filled", num:true },
      { key:"targetFilled", label:"Tgt filled", num:true },
      { key:"sourceBlank", label:"Src blank", num:true },
      { key:"targetBlank", label:"Tgt blank", num:true },
      { key:"missingOptionsInTarget", label:"Missing opts", num:true, render:function(c){return String(c.missingOptionsInTarget.length);}, sortVal:function(c){return c.missingOptionsInTarget.length;} },
      { key:"extraOptionsInTarget", label:"Extra opts", num:true, render:function(c){return String(c.extraOptionsInTarget.length);}, sortVal:function(c){return c.extraOptionsInTarget.length;} },
      { key:"optionCountDifferences", label:"Count diffs", num:true, render:function(c){return String(c.optionCountDifferences.length);}, sortVal:function(c){return c.optionCountDifferences.length;} }
    ], r.columnStats, { search:true, sortKey:"column", dir:"asc", searchText:function(c){return c.column;} }
  )));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(schemaDiffGrid(r));
  return root;
}
function topVals(arr){ return (arr||[]).slice(0,3).map(function(v){ return showBlank(v.value)+" ("+v.count+")"; }).join(", ") || "—"; }
function presenceTag(c){
  var s = c.existsInSource, t = c.existsInTarget;
  if (s && t) return '<span class="tag">both</span>';
  if (s) return '<span class="tag" style="color:var(--high);border-color:var(--high)">source only</span>';
  return '<span class="tag" style="color:var(--accent-2);border-color:var(--accent-2)">target only</span>';
}

function rowsPanel(r, a, an){
  var root = el("div");
  var gi = (an.groupInsights||[]).slice(0,10).map(function(g){ return { label: g.groupBy+"="+showBlank(g.value), value: g.count, sub:g.problem }; });
  root.appendChild(card("Largest problem groups", "Slices of the data where missing / extra / changed rows concentrate.", barChart(gi, { empty:"No grouped problems." })));
  root.appendChild(el("div", { style:"height:16px" }));
  var grid = el("div", { class:"grid two" });
  grid.appendChild(card("Missing in target", r.missingInTarget.length + " source row(s) with no match.", problemRowsTable(a.missingRows)));
  grid.appendChild(card("Extra in target", r.extraInTarget.length + " target row(s) not in source.", problemRowsTable(a.extraRows)));
  root.appendChild(grid);
  if (an.nearMatches && an.nearMatches.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Near matches", "Missing and extra rows that look like the same record under a changed key.", buildTable(
      [
        { key:"sourceKey", label:"Source key", render:function(m){return showBlank(m.sourceKey);} },
        { key:"targetKey", label:"Target key", render:function(m){return showBlank(m.targetKey);} },
        { key:"score", label:"Score", num:true, render:function(m){return m.score+"%";} },
        { key:"matchedFields", label:"Matched fields", render:function(m){return (m.matchedFields||[]).join(", ")||"—";} },
        { key:"differentFields", label:"Differences", render:function(m){return (m.differentFields||[]).map(function(d){return d.column+": "+showBlank(d.source)+"→"+showBlank(d.target);}).join("; ")||"—";} }
      ], an.nearMatches, { sortKey:"score", dir:"desc", short:true }
    )));
  }
  if ((r.duplicateKeysInSource && r.duplicateKeysInSource.length) || (r.duplicateKeysInTarget && r.duplicateKeysInTarget.length)){
    root.appendChild(el("div", { style:"height:16px" }));
    var dg = el("div", { class:"grid two" });
    dg.appendChild(card("Duplicate keys in source", r.duplicateKeysInSource.length + " group(s).", dupTable(r.duplicateKeysInSource)));
    dg.appendChild(card("Duplicate keys in target", r.duplicateKeysInTarget.length + " group(s).", dupTable(r.duplicateKeysInTarget)));
    root.appendChild(dg);
  }
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("Cell differences", r.cellDifferences.length + " differing cell(s) on matched rows.", cellDiffTable(r.cellDifferences)));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("All grouped problem counts", "Every grouped slice of missing, extra, and changed rows.", problemGroupsTable(a.problemGroups)));
  return root;
}
function problemRowsTable(rows){
  if (!rows || !rows.length) return el("div", { class:"empty" }, "None.");
  return buildTable(
    [
      { key:"key", label:"Key", render:function(r){return showBlank(r.key);} },
      { key:"rowNumber", label:"Row", num:true },
      { key:"context", label:"Context", render:function(r){ return Object.keys(r.context||{}).map(function(k){return k+"="+showBlank(r.context[k]);}).join(", ")||"—"; } }
    ], rows, { search:true, sortKey:"rowNumber", dir:"asc", short:true, searchText:function(r){return r.key+" "+JSON.stringify(r.context);} }
  );
}
function dupTable(dups){
  if (!dups || !dups.length) return el("div", { class:"empty" }, "None.");
  return buildTable(
    [ { key:"key", label:"Key", render:function(d){return showBlank(d.key);} }, { key:"rows", label:"Rows", render:function(d){return d.rows.join(", ");} } ],
    dups, { sortKey:"key", dir:"asc", short:true }
  );
}

function fieldsPanel(a, an){
  var root = el("div");
  root.appendChild(card("Inferred fields", "Locally inferred role, completeness, uniqueness and confidence for each column.", inferredTable(a.inferredFields)));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(valueSummaryCard(a.inferredFields));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(contextColumnsCard(a.contextColumns));
  if (a.columnFamilies && a.columnFamilies.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Column families", "Columns grouped by detected purpose.", familyGrid(a.columnFamilies), true));
  }
  if (an && an.relationshipInsights && an.relationshipInsights.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Relationship & audit insights", "Link / actor columns whose distribution drifted.", relInsights(an.relationshipInsights), true));
  }
  if (an && an.valueDependencies){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(valueDependencyCard(an.valueDependencies, true));
  }
  if (a.linkColumns && a.linkColumns.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Link columns", "Reference-like columns and their value drift.", buildTable(
      [
        { key:"column", label:"Column" },
        { key:"sourceDistinct", label:"Src distinct", num:true },
        { key:"targetDistinct", label:"Tgt distinct", num:true },
        { key:"missingValuesInTarget", label:"Missing", num:true, render:function(c){return String(c.missingValuesInTarget.length);}, sortVal:function(c){return c.missingValuesInTarget.length;} },
        { key:"extraValuesInTarget", label:"Extra", num:true, render:function(c){return String(c.extraValuesInTarget.length);}, sortVal:function(c){return c.extraValuesInTarget.length;} },
        { key:"countDifferences", label:"Count diffs", num:true, render:function(c){return String(c.countDifferences.length);}, sortVal:function(c){return c.countDifferences.length;} }
      ], a.linkColumns, { search:true, sortKey:"column", dir:"asc", short:true, searchText:function(c){return c.column;} }
    )));
  }
  return root;
}
function inferredTable(fields){
  var cols = [
    { key:"column", label:"Column" },
    { key:"roles", label:"Roles", render:function(f){ return tags(f.roles.slice(0,4)); }, sortVal:function(f){return f.roles[0]||"";} },
    { key:"valuePattern", label:"Pattern" }
  ];
  if (IS_PROFILE){
    cols.push({ key:"sourceCompleteness", label:"Complete", num:true, render:function(f){return pct(f.sourceCompleteness);}, sortVal:function(f){return f.sourceCompleteness;} });
    cols.push({ key:"sourceUniqueness", label:"Unique", num:true, render:function(f){return pct(f.sourceUniqueness);}, sortVal:function(f){return f.sourceUniqueness;} });
  } else {
    cols.push({ key:"sc", label:"Src complete", num:true, render:function(f){return pct(f.sourceCompleteness);}, sortVal:function(f){return f.sourceCompleteness;} });
    cols.push({ key:"tc", label:"Tgt complete", num:true, render:function(f){return pct(f.targetCompleteness);}, sortVal:function(f){return f.targetCompleteness;} });
    cols.push({ key:"su", label:"Src unique", num:true, render:function(f){return pct(f.sourceUniqueness);}, sortVal:function(f){return f.sourceUniqueness;} });
    cols.push({ key:"tu", label:"Tgt unique", num:true, render:function(f){return pct(f.targetUniqueness);}, sortVal:function(f){return f.targetUniqueness;} });
  }
  cols.push({ key:"sourceDistinct", label:"Distinct", num:true });
  cols.push({ key:"averageLength", label:"Avg len", num:true });
  cols.push({ key:"conf", label:"Confidence", render:function(f){return topConf(f.roleConfidence);}, sortVal:function(f){return topConfVal(f.roleConfidence);} });
  return buildTable(cols, fields, { search:true, sortKey:"column", dir:"asc", searchText:function(f){return f.column+" "+f.roles.join(" ");} });
}
function familyGrid(fams){
  return el("div", { class:"grid three" }, fams.map(function(f){
    var c = el("div", { class:"card" });
    c.appendChild(el("div", null, [ el("strong", null, f.label), el("span", { class:"tag", style:"margin-left:8px" }, f.columnCount + " cols") ]));
    c.appendChild(el("div", { style:"margin-top:8px" }, tags(f.columns)));
    var sub = el("div");
    famLine(sub, "Identifiers", f.identifierColumns);
    famLine(sub, "Dates/times", f.dateColumns);
    famLine(sub, "Status/categories", f.statusColumns);
    famLine(sub, "Unknown markers", f.unknownMarkerColumns);
    famLine(sub, "Flags", f.flagColumns);
    famLine(sub, "Measures", f.measureColumns);
    famLine(sub, "Text/specify", f.textColumns);
    if (sub.children.length) c.appendChild(sub);
    return c;
  }));
}
function famLine(parent, label, cols){
  if (!cols || !cols.length) return;
  parent.appendChild(el("div", { style:"font-size:12px;margin-top:7px" }, [
    el("span", { class:"muted", style:"text-transform:uppercase;letter-spacing:.04em;font-size:10.5px" }, label + ": "),
    el("span", null, cols.join(", "))
  ]));
}
function relInsights(items){
  return el("div", null, items.map(function(i){
    var c = el("div", { class:"finding", "data-sev":"medium" });
    c.appendChild(el("div", { class:"fhead" }, [ el("span", { class:"tag" }, i.role), el("span", { class:"ftitle" }, i.column) ]));
    c.appendChild(el("div", { class:"fsum" }, i.summary));
    var cols = el("div", { class:"cols" });
    cols.appendChild(colBlock("Evidence", i.evidence));
    cols.appendChild(colBlock("Next checks", i.nextChecks));
    c.appendChild(cols);
    return c;
  }));
}

function valueDependencyCard(layer, compareMode){
  var root = el("div");
  var sub = "Conditional rules A=x ⇒ B=y from value-bearing columns; identity keys and free text are skipped. No support or confidence floor is applied.";
  if (compareMode && layer.violations && layer.violations.length){
    root.appendChild(card("Broken value rules in target", layer.violations.length + " strict source rule(s) no longer hold in the target.", buildTable(
      [
        { key:"ant", label:"If", render:function(v){ return v.antecedentColumn+"="+showBlank(v.antecedentValue); }, sortVal:function(v){return v.antecedentColumn;} },
        { key:"con", label:"Then (source)", render:function(v){ return v.consequentColumn+"="+showBlank(v.expectedValue); }, sortVal:function(v){return v.consequentColumn;} },
        { key:"sourceSupport", label:"Support", num:true, render:function(v){return v.sourceSupport+"/"+v.sourceSupport;}, sortVal:function(v){return v.sourceSupport;} },
        { key:"keys", label:"Target keys breaking it", render:function(v){return v.violatingKeys.join(", ");} },
        { key:"obs", label:"Target shows", render:function(v){return formatTop(v.observedValues);} }
      ], layer.violations, { search:true, sortKey:"sourceSupport", dir:"desc", short:true, searchText:function(v){return v.antecedentColumn+" "+v.consequentColumn+" "+v.violatingKeys.join(" ");} }
    )));
    root.appendChild(el("div", { style:"height:16px" }));
  }
  root.appendChild(card("Value dependencies" + (compareMode ? " (source rules)" : ""), sub, (layer.rules && layer.rules.length) ? buildTable(
    [
      { key:"ant", label:"If", render:function(r){ return r.antecedentColumn+"="+showBlank(r.antecedentValue); }, sortVal:function(r){return r.antecedentColumn+"="+r.antecedentValue;} },
      { key:"con", label:"Then", render:function(r){ return r.consequentColumn+"="+showBlank(r.consequentValue); }, sortVal:function(r){return r.consequentColumn+"="+r.consequentValue;} },
      { key:"support", label:"Support", num:true, render:function(r){return r.matches+"/"+r.support;}, sortVal:function(r){return r.support;} },
      { key:"confidence", label:"Confidence", num:true, render:function(r){return pct(r.confidence);}, sortVal:function(r){return r.confidence;} },
      { key:"strict", label:"Strict", render:function(r){return r.strict?"yes":"no";}, sortVal:function(r){return r.strict?1:0;} }
    ], layer.rules, { search:true, sortKey:"support", dir:"desc", searchText:function(r){return r.antecedentColumn+" "+r.antecedentValue+" "+r.consequentColumn+" "+r.consequentValue;} }
  ) : el("div", { class:"empty" }, "No value-bearing column pairs were eligible.")));
  return root;
}

function aiPanel(ai){
  var root = el("div");
  var c = card("Local AI narrative", "Provider: " + ai.provider + " · model: " + ai.model + " · " + ai.promptScope, null);
  if (ai.error) c.appendChild(el("div", { class:"sev high", style:"display:inline-flex" }, "Error: " + ai.error));
  else if (ai.text) c.appendChild(el("div", { style:"white-space:pre-wrap;line-height:1.6" }, ai.text));
  else c.appendChild(el("div", { class:"empty" }, "No narrative produced."));
  root.appendChild(c);
  return root;
}

/* PROFILE MODE */
function renderProfile(){
  var r = REPORT, a = r.analysis, p = a.profile;
  var root = el("div", { class:"wrap" });
  root.appendChild(header(r.sourcePath, [
    ["Key field", r.keyField === "" ? "none inferred" : r.keyField],
    ["Generated", new Date(r.generatedAt).toLocaleString()],
    ["Rows", fmtNum(r.rows)], ["Columns", fmtNum(r.columns)]
  ], el("div", { class:"verdict" }, [ el("div", { class:"badge profile" }, [ el("span", { class:"dot" }), "Profile" ]) ])));

  root.appendChild(el("div", { class:"kpis" }, [
    kpi("Rows", fmtNum(r.rows), "records profiled", ""),
    kpi("Columns", fmtNum(r.columns), "fields", ""),
    kpi("Candidate keys", String((p.candidateKeyColumns||[]).length), "unique-looking columns", ""),
    kpi("High-blank cols", String((p.highBlankColumns||[]).length), "<80% filled", (p.highBlankColumns||[]).length?"warn":"good"),
    kpi("Duplicate key groups", String(r.duplicateKeys.length), "on " + (r.keyField||"key"), r.duplicateKeys.length?"bad":"good")
  ]));

  var tabs = buildTabs([
    { id:"overview", label:"Overview", render:function(){ return profileOverview(r, a, p); } },
    { id:"columns", label:"Columns", count:r.columnStats.length, render:function(){ return profileColumns(r, a); } },
    { id:"fields", label:"Fields", count:a.inferredFields.length, render:function(){ return profileFields(a); } },
    { id:"groups", label:"Groups", count:(a.rowGroups||[]).length, render:function(){ return profileGroups(a); } },
    { id:"values", label:"Values", count:r.columnStats.length, render:function(){ return valuesPanel(); } },
    { id:"method", label:"Method", render:function(){ return methodPanelProfile(); } },
    { id:"raw", label:"Raw JSON", render:function(){ return rawPanel(); } }
  ]);
  root.appendChild(tabs);
  root.appendChild(footer());
  return root;
}
function profileOverview(r, a, p){
  var grid = el("div", { class:"grid two" });
  var roles = p.inferredRoleCounts || {};
  var palette = ["var(--accent)","var(--accent-2)","var(--low)","var(--high)","var(--medium)","var(--pass)","var(--critical)","var(--info)"];
  var segs = Object.keys(roles).sort(function(x,y){return roles[y]-roles[x];}).slice(0,8).map(function(k,i){ return { label:k, value:roles[k], color: palette[i%palette.length] }; });
  grid.appendChild(card("Role distribution", "Inferred column roles across the file.", (function(){
    var b = el("div"); b.appendChild(el("div", { class:"chartbox" }, [ donut(segs) ])); b.appendChild(legend(segs)); return b;
  })()));
  var comp = a.inferredFields.slice().sort(function(x,y){return x.sourceCompleteness-y.sourceCompleteness;}).slice(0,10)
    .map(function(f){ return { label:f.column, value: Math.round(f.sourceCompleteness*100) }; });
  grid.appendChild(card("Least complete columns", "Fill rate (%) for the emptiest columns.", barChart(comp, { fmt:function(v){return v+"%";}, empty:"All columns complete." })));
  grid.appendChild(card("Candidate key columns", "Columns whose values are nearly all unique.", (p.candidateKeyColumns||[]).length ? el("div", null, tags(p.candidateKeyColumns)) : el("div", { class:"empty" }, "None detected.")));
  var gi = (a.groupInsights||[]).slice(0,10).map(function(g){ return { label:g.groupBy+"="+showBlank(g.value), value:g.count }; });
  grid.appendChild(card("Largest row groups", "Dominant slices by context field.", barChart(gi, { empty:"No groups." })));
  return grid;
}
function profileColumns(r, a){
  var root = el("div");
  root.appendChild(card("Column statistics", "Fill, blanks and distinct values per column.", buildTable(
    [
      { key:"column", label:"Column" },
      { key:"sourceFilled", label:"Filled", num:true },
      { key:"sourceBlank", label:"Blank", num:true },
      { key:"distinct", label:"Distinct", num:true, render:function(c){return String(Object.keys(c.sourceOptions).filter(function(v){return v!=="";}).length);}, sortVal:function(c){return Object.keys(c.sourceOptions).filter(function(v){return v!=="";}).length;} }
    ], r.columnStats, { search:true, sortKey:"column", dir:"asc", searchText:function(c){return c.column;} }
  )));
  if (a.columnFamilies && a.columnFamilies.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Column families", "Columns grouped by detected purpose.", familyGrid(a.columnFamilies), true));
  }
  if (REPORT.duplicateKeys && REPORT.duplicateKeys.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Duplicate keys", REPORT.duplicateKeys.length + " group(s) on " + (REPORT.keyField || "key") + ".", dupTable(REPORT.duplicateKeys)));
  }
  return root;
}
function profileFields(a){
  var root = el("div");
  root.appendChild(card("Inferred fields", "Role, completeness, uniqueness and confidence per column.", inferredTable(a.inferredFields)));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(valueSummaryCard(a.inferredFields));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(contextColumnsCard(a.contextColumns));
  if (a.linkColumns && a.linkColumns.length){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(card("Link and audit columns", "Reference and actor columns with likely roles and top values.", buildTable(
      [
        { key:"column", label:"Column" },
        { key:"roles", label:"Likely roles", render:function(c){ var f=findField(a, c.column); return tags(f ? f.roles.slice(0,4) : []); }, sortVal:function(c){ var f=findField(a, c.column); return f && f.roles[0] || ""; } },
        { key:"sourceDistinct", label:"Distinct", num:true },
        { key:"top", label:"Top values", render:function(c){ var f=findField(a, c.column); return formatTop(f ? f.sourceTopOptions : []); } }
      ],
      a.linkColumns, { search:true, sortKey:"column", dir:"asc", short:true, searchText:function(c){return c.column;} }
    )));
  }
  if (a.valueDependencies){
    root.appendChild(el("div", { style:"height:16px" }));
    root.appendChild(valueDependencyCard(a.valueDependencies, false));
  }
  return root;
}
function findField(a, column){ return (a.inferredFields||[]).filter(function(f){ return f.column === column; })[0]; }
function profileGroups(a){
  var root = el("div");
  if (a.groupInsights && a.groupInsights.length){
    root.appendChild(card("Group insights", "Interpretation of the dominant data slices.", buildTable(
      [
        { key:"groupBy", label:"Field" },
        { key:"value", label:"Value", render:function(g){return showBlank(g.value);} },
        { key:"count", label:"Rows", num:true },
        { key:"shareOfProblem", label:"Share", num:true, render:function(g){return pct(g.shareOfProblem);}, sortVal:function(g){return g.shareOfProblem;} },
        { key:"interpretation", label:"Interpretation" }
      ], a.groupInsights, { search:true, sortKey:"count", dir:"desc", searchText:function(g){return g.groupBy+" "+g.value+" "+g.interpretation;} }
    )));
  } else {
    root.appendChild(card("Group insights", null, el("div", { class:"empty" }, "No groups built.")));
  }
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("All grouped row counts", "Every grouped slice of the data, including multi-field combinations.", rowGroupsTable(a.rowGroups)));
  return root;
}

/* ---- value distributions (parity with markdown "Column Options") ---- */
function cmpKey(a, b){ return String(a).localeCompare(String(b), undefined, { numeric:true, sensitivity:"base" }); }
function valueRows(stats){
  if (IS_PROFILE){
    return Object.keys(stats.sourceOptions).map(function(v){ return { value:v, count:stats.sourceOptions[v] }; })
      .sort(function(a,b){ return b.count-a.count || cmpKey(a.value,b.value); });
  }
  var set = {};
  Object.keys(stats.sourceOptions).forEach(function(k){ set[k]=1; });
  Object.keys(stats.targetOptions||{}).forEach(function(k){ set[k]=1; });
  return Object.keys(set).map(function(v){ var s=stats.sourceOptions[v]||0, t=(stats.targetOptions||{})[v]||0; return { value:v, source:s, target:t, diff:t-s, total:s+t }; })
    .sort(function(a,b){ return b.total-a.total || cmpKey(a.value,b.value); });
}
function valueDistTable(stats){
  var rows = valueRows(stats);
  if (IS_PROFILE){
    return buildTable([
      { key:"value", label:"Value", render:function(r){return showBlank(r.value);} },
      { key:"count", label:"Count", num:true }
    ], rows, { sortKey:"count", dir:"desc", short:true, search: rows.length>12, searchText:function(r){return String(r.value);} });
  }
  return buildTable([
    { key:"value", label:"Value", render:function(r){return showBlank(r.value);} },
    { key:"source", label:"Source", num:true },
    { key:"target", label:"Target", num:true },
    { key:"diff", label:"Diff", num:true, render:function(r){return (r.diff>0?"+":"")+r.diff;} }
  ], rows, { short:true, search: rows.length>12, searchText:function(r){return String(r.value);} });
}
function valuesPanel(){
  var stats = REPORT.columnStats || [];
  var root = el("div");
  root.appendChild(el("div", { class:"desc", style:"margin-bottom:14px" }, IS_PROFILE
    ? "Every distinct value in each column and how many times it appears."
    : "Every distinct value in each column with source and target counts and the difference."));
  var search = el("input", { class:"search", type:"search", placeholder:"Filter columns…" });
  root.appendChild(el("div", { class:"controls" }, [search]));
  var list = el("div", { class:"grid two" });
  root.appendChild(list);
  function draw(){
    var q = (search.value || "").toLowerCase();
    list.innerHTML = "";
    var shown = stats.filter(function(s){ return s.column.toLowerCase().indexOf(q) !== -1; });
    if (!shown.length){ list.appendChild(el("div", { class:"empty" }, "No columns match.")); return; }
    shown.forEach(function(s){
      var distinct = valueRows(s).length;
      list.appendChild(card(s.column, distinct + " distinct value(s)", valueDistTable(s)));
    });
    animateBars(list);
  }
  search.addEventListener("input", draw); draw();
  return root;
}

/* ---- static (non-sortable) and key/value tables ---- */
function staticTable(headers, rows){
  var t = el("table");
  var thead = el("thead"); var hr = el("tr");
  headers.forEach(function(h){ hr.appendChild(el("th", { style:"cursor:default" }, h)); });
  thead.appendChild(hr);
  var tb = el("tbody");
  rows.forEach(function(r){
    var tr = el("tr");
    r.forEach(function(c){ var td = el("td"); if (typeof c === "string") td.textContent = c; else if (c) td.appendChild(c); tr.appendChild(td); });
    tb.appendChild(tr);
  });
  t.appendChild(thead); t.appendChild(tb);
  return el("div", { class:"tablewrap" }, [t]);
}
function kvCard(title, desc, rows, full){
  var t = el("table");
  var tb = el("tbody");
  rows.forEach(function(row){
    var v = el("td");
    if (typeof row[1] === "string") v.textContent = row[1]; else if (row[1]) v.appendChild(row[1]);
    tb.appendChild(el("tr", null, [ el("td", { style:"color:var(--muted);white-space:nowrap;width:210px" }, row[0]), v ]));
  });
  t.appendChild(tb);
  return card(title, desc, el("div", { class:"tablewrap" }, [t]), full);
}
function listOrDash(arr){ return (arr && arr.length) ? arr.join(", ") : "—"; }
function roleText(counts){
  var ks = Object.keys(counts||{}); if (!ks.length) return "—";
  return ks.sort(function(a,b){return counts[b]-counts[a];}).map(function(k){ return k+": "+counts[k]; }).join(", ");
}
function formatTop(arr){ return (arr||[]).map(function(v){ return showBlank(v.value)+" ("+v.count+")"; }).join(", ") || "—"; }
function topConf(rc){ var ks=Object.keys(rc||{}); if(!ks.length) return "—"; var best=ks.sort(function(a,b){return rc[b]-rc[a];})[0]; return best+" "+pct(rc[best]); }
function topConfVal(rc){ var ks=Object.keys(rc||{}); return ks.length ? Math.max.apply(null, ks.map(function(k){return rc[k];})) : 0; }

/* ---- context columns & value summary (parity with markdown) ---- */
function contextColumnsCard(cols){
  return card("Context columns", "Fields used to group and describe row/problem slices.",
    (cols && cols.length) ? el("div", null, tags(cols)) : el("div", { class:"empty" }, "No useful context columns were inferred."));
}
function valueSummaryCard(fields){
  var cols = IS_PROFILE
    ? [ { key:"column", label:"Column" },
        { key:"top", label:"Top values", render:function(f){return formatTop(f.sourceTopOptions);} },
        { key:"signals", label:"Signals", render:function(f){return (f.signals||[]).join("; ")||"—";} } ]
    : [ { key:"column", label:"Column" },
        { key:"src", label:"Source top values", render:function(f){return formatTop(f.sourceTopOptions);} },
        { key:"tgt", label:"Target top values", render:function(f){return formatTop(f.targetTopOptions);} },
        { key:"signals", label:"Signals", render:function(f){return (f.signals||[]).join("; ")||"—";} } ];
  return card("Value summary & signals", "Most common values and the signals behind each inferred role.",
    buildTable(cols, fields, { search:true, sortKey:"column", dir:"asc", searchText:function(f){return f.column+" "+(f.signals||[]).join(" ");} }));
}

/* ---- compare-only detail (parity with markdown) ---- */
function schemaDiffGrid(r){
  var g = el("div", { class:"grid two" });
  g.appendChild(card("Source-only columns", r.sourceOnlyColumns.length + " column(s) present only in source.",
    r.sourceOnlyColumns.length ? el("div", null, tags(r.sourceOnlyColumns)) : el("div", { class:"empty" }, "None.")));
  g.appendChild(card("Target-only columns", r.targetOnlyColumns.length + " column(s) present only in target.",
    r.targetOnlyColumns.length ? el("div", null, tags(r.targetOnlyColumns)) : el("div", { class:"empty" }, "None.")));
  return g;
}
function cellDiffTable(diffs){
  if (!diffs || !diffs.length) return el("div", { class:"empty" }, "No cell differences found for matched rows.");
  return buildTable([
    { key:"key", label:"Key", render:function(d){return showBlank(d.key);} },
    { key:"column", label:"Column" },
    { key:"source", label:"Source", render:function(d){return showBlank(d.source);} },
    { key:"target", label:"Target", render:function(d){return showBlank(d.target);} },
    { key:"context", label:"Context", render:function(d){return formatContextObj(d.sourceContext);} }
  ], diffs, { search:true, sortKey:"key", dir:"asc", searchText:function(d){return d.key+" "+d.column+" "+d.source+" "+d.target;} });
}
function formatContextObj(ctx){ ctx = ctx||{}; var ks = Object.keys(ctx); return ks.length ? ks.map(function(k){return k+"="+showBlank(ctx[k]);}).join(", ") : "—"; }
function problemGroupsTable(groups){
  if (!groups || !groups.length) return el("div", { class:"empty" }, "No grouped problems found.");
  return buildTable([
    { key:"problem", label:"Problem" },
    { key:"depth", label:"Depth", num:true },
    { key:"column", label:"Grouped by" },
    { key:"value", label:"Value", render:function(g){return showBlank(g.value);} },
    { key:"count", label:"Count", num:true },
    { key:"sampleKeys", label:"Sample keys", render:function(g){return (g.sampleKeys||[]).map(showBlank).join(", ");} }
  ], groups, { search:true, sortKey:"count", dir:"desc", searchText:function(g){return g.problem+" "+g.column+" "+g.value;} });
}
function rowGroupsTable(groups){
  if (!groups || !groups.length) return el("div", { class:"empty" }, "No grouped row patterns found.");
  return buildTable([
    { key:"depth", label:"Depth", num:true },
    { key:"column", label:"Grouped by" },
    { key:"value", label:"Value", render:function(g){return showBlank(g.value);} },
    { key:"count", label:"Rows", num:true },
    { key:"sampleKeys", label:"Sample keys", render:function(g){return (g.sampleKeys||[]).map(showBlank).join(", ");} }
  ], groups, { search:true, sortKey:"count", dir:"desc", searchText:function(g){return g.column+" "+g.value;} });
}

/* ---- method / how-it-works (parity with markdown goal + logic) ---- */
var COMPARE_STEPS = [
  ["1. Parse CSVs", "Read headers and rows, preserving each value after optional trimming.", "A reliable comparison starts from the same row and column structure the CSVs provide."],
  ["2. Resolve key", "Use the key field to identify the same business row in both files.", "This proves whether each source record has a matching target record."],
  ["3. Check key uniqueness", "Detect duplicate keys in either file.", "Duplicate keys make a one-to-one comparison unreliable."],
  ["4. Check row completeness", "Find source keys missing from target and target keys not present in source.", "This catches missing migrations, rejected rows, extra loads, or mismatched export windows."],
  ["5. Check schema", "Find columns that only exist in one file.", "This catches dropped fields, renamed fields, or new fields introduced in target."],
  ["6. Check column distributions", "Count filled, blank, every distinct option, and option count differences per column.", "This catches data drift even when individual row changes are hard to interpret."],
  ["7. Check matched cells", "Compare values column-by-column for rows with the same key.", "This proves whether matched records carry the same data."],
  ["8. Infer data shape", "Classify fields as likely keys, links, audit actors, timestamps, categories, numbers, booleans, or text.", "This gives unknown CSV data enough meaning to explain what each problem links to."],
  ["9. Explain findings", "Rank issues by severity and confidence, then list evidence, likely causes, affected keys, and next checks.", "This turns raw differences into investigation guidance."]
];
var PROFILE_STEPS = [
  ["1. Parse CSV", "Read headers and rows, preserving each value after optional trimming.", "A reliable profile starts from the actual exported structure."],
  ["2. Resolve key", "Use the provided key, a detected ID column, or a strong inferred candidate key.", "This lets the report check uniqueness and name stable row identity for future comparison."],
  ["3. Profile columns", "Count filled values, blanks, distinct options, and option counts for every column.", "This defines the value domains and completeness a target should match."],
  ["4. Infer data shape", "Classify fields as likely keys, links, audit actors, timestamps, categories, numbers, booleans, or text.", "This gives unknown CSV data enough meaning to explain what each column may control."],
  ["5. Group rows", "Group rows by useful context fields; date/datetime fields are grouped by calendar day, ignoring the time.", "This shows important slices a target should preserve, such as owner, status, account, or day counts."]
];
function methodPanel(){
  var r = REPORT, dp = r.analysis.analytics.dataProfile;
  var root = el("div");
  root.appendChild(card("Comparison goal", null, el("div", { style:"line-height:1.65" }, [
    el("p", { style:"margin:0 0 10px" }, "The goal is to prove the target CSV matches the source CSV using " + r.keyField + " as row identity: the same required rows, no unexpected rows, the same columns, matching column-level distributions, and matching values for rows that share a key."),
    el("p", { style:"margin:0" }, "When the files do not match, this report explains the issues with row context, inferred field roles, grouped patterns, likely causes, and recommended checks so the data problem can be investigated.")
  ])));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("How the comparison works", "Each step and why it matters.", staticTable(["Step", "What it checks", "Why it matters"], COMPARE_STEPS)));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(kvCard("Data profile", "Overall comparison metrics.", [
    ["Source columns", String(dp.sourceColumns)],
    ["Target columns", String(dp.targetColumns)],
    ["Shared columns", String(dp.sharedColumns)],
    ["Source match coverage", pct(dp.matchCoverageSource)],
    ["Target match coverage", pct(dp.matchCoverageTarget)],
    ["Changed matched rows", String(dp.changedMatchedRows)],
    ["Inferred roles", roleText(dp.inferredRoleCounts)],
    ["Candidate keys", listOrDash(dp.candidateKeyColumns)],
    ["High blank columns", listOrDash(dp.highBlankColumns)],
    ["High cardinality columns", listOrDash(dp.highCardinalityColumns)]
  ]));
  return root;
}
function methodPanelProfile(){
  var r = REPORT, p = r.analysis.profile;
  var root = el("div");
  root.appendChild(card("Profile goal", null, el("div", { style:"line-height:1.65" }, [
    el("p", { style:"margin:0 0 10px" }, "The goal is to understand " + r.sourcePath + " well enough to build or validate a target CSV later. This report profiles row count, columns, value options, blank rates, inferred field roles, likely keys, links, audit fields, and useful row groups."),
    el("p", { style:"margin:0" }, "No target CSV was compared. The findings describe the expected data shape a future target should preserve.")
  ])));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("How the profile works", "Each step and why it matters.", staticTable(["Step", "What it checks", "Why it matters"], PROFILE_STEPS)));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(card("Target build guidance", "What a future target CSV should preserve.", staticTable(["Check", "Expected target behavior"], [
    ["Rows", "Target should contain " + p.rows + " row(s), unless a known filter is intentionally applied."],
    ["Columns", "Target should include these " + p.columns + " profiled column(s), or documented mappings for renamed fields."],
    [r.keyField === "" ? "Key" : "Key (" + r.keyField + ")", r.keyField === "" ? "No reliable key was inferred. Provide --key for stronger future comparison." : "Target should keep " + r.keyField + " unique and stable."],
    ["Duplicate keys", r.duplicateKeys.length === 0 ? "No duplicate key groups found." : r.duplicateKeys.length + " duplicate key group(s) need review before one-to-one comparison."],
    ["Value options", "Target should preserve the listed option counts for categorical/status/link fields unless mappings are intentional."],
    ["Date buckets", "Target should preserve calendar-day distributions for date/time fields; the time part is ignored for grouping."],
    ["Column families", "Target should preserve section/family column groups, especially form sections, metadata, dates, flags, and unknown markers."]
  ])));
  root.appendChild(el("div", { style:"height:16px" }));
  root.appendChild(kvCard("Data profile", "Inferred structure summary.", [
    ["Rows", String(p.rows)],
    ["Columns", String(p.columns)],
    ["Inferred roles", roleText(p.inferredRoleCounts)],
    ["Candidate keys", listOrDash(p.candidateKeyColumns)],
    ["High blank columns", listOrDash(p.highBlankColumns)],
    ["High cardinality columns", listOrDash(p.highCardinalityColumns)],
    ["Likely link columns", listOrDash(p.likelyLinkColumns)],
    ["Likely audit columns", listOrDash(p.likelyAuditColumns)],
    ["Likely date/time columns", listOrDash(p.likelyTimestampColumns)]
  ]));
  return root;
}

/* COMMON */
function header(subtitle, meta, verdict){
  var h = el("header", { class:"top" });
  var grow = el("div", { class:"grow" });
  grow.appendChild(el("h1", null, IS_PROFILE ? "CSV Profile Report" : "CSV Compare Report"));
  grow.appendChild(el("div", { class:"sub" }, subtitle));
  grow.appendChild(el("div", { class:"meta" }, meta.map(function(m){ return el("span", null, [ el("b", null, m[0] + ": "), m[1] ]); })));
  h.appendChild(grow);
  var toolbar = el("div", { class:"toolbar" }, [
    el("button", { class:"iconbtn", title:"Toggle theme", onclick: toggleTheme }, "◐ Theme"),
    el("button", { class:"iconbtn", title:"Print / Save PDF", onclick: function(){ window.print(); } }, "⎙ Print")
  ]);
  var side = el("div", { class:"headside" }, [ toolbar, verdict || null ]);
  h.appendChild(side);
  return h;
}
function kpi(label, value, hint, cls){
  return el("div", { class:"kpi " + (cls||"") }, [
    el("div", { class:"label" }, label),
    el("div", { class:"value" }, value),
    hint ? el("div", { class:"hint" }, hint) : null
  ]);
}
function rawPanel(){
  var root = el("div");
  root.appendChild(card("Raw report data", "The complete machine-readable report (same as --format json).",
    el("pre", { class:"json" }, JSON.stringify(REPORT, null, 2))));
  return root;
}
function footer(){ return el("div", { class:"footer" }, "Generated by csv-compare · deterministic, local analysis · " + new Date(REPORT.generatedAt).toLocaleString()); }
function toggleTheme(){
  var html = document.documentElement;
  html.setAttribute("data-theme", html.getAttribute("data-theme") === "dark" ? "light" : "dark");
}

/* BOOT */
var app = document.getElementById("app");
app.innerHTML = "";
app.removeAttribute("aria-busy");
app.appendChild(IS_PROFILE ? renderProfile() : renderCompare());
animateBars(document);
})();
`;
