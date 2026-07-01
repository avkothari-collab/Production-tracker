import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Factory,
  FileSpreadsheet,
  Filter,
  Image as ImageIcon,
  Layers,
  Lock,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  Truck,
  Upload,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`;
const CSS = `
:root, [data-theme="paper"] {
  --ink:#1f1f1d; --bg:#f7f3ea; --surface:#fffdf8; --accent:#c96f16; --accent-tint:#fff4e3;
  --danger:#b42318; --success:#1f6f54; --info:#2563a6;
  --muted-1:#9b9488; --muted-2:#7d766b; --muted-3:#655f56; --muted-4:#4f493f; --muted-5:#403a32; --muted-6:#c8c0b4; --muted-7:#b8afa3;
  --line-1:#e5ded2; --line-2:#d4cabd; --line-3:#eee7dc;
  --toolbar-bg:#fffaf1; --toolbar-line:#e3d7c7; --toolbar-subtle:#f1eadf;
  --pill-shadow:0 1px 0 rgba(31,31,29,0.06); --card-shadow:0 1px 2px rgba(31,31,29,0.04);
  --on-dark:#d8d1c4; --on-dark-2:#a9a095; --on-dark-line:#4a463e;
  --tint-ok:#e5f1ea; --fg-ok:#1c6048; --tint-warn:#f8e9b7; --fg-warn:#7a560f; --tint-late:#f6d3cb; --fg-late:#8c241a;
  --blue:#e8f0fb; --blue-fg:#174a7c; --purple:#eee7fb; --purple-fg:#5b3f8d;
}
html, body, #root { margin:0; min-height:100%; background:var(--bg); color:var(--ink); }
* { box-sizing:border-box; }
button, input, select, textarea { font-family:inherit; }
button { min-height:34px; min-width:34px; touch-action:manipulation; }
.mt-app { font-family:'JetBrains Mono', monospace; min-height:100vh; background:var(--bg); }
.mt-top { background:var(--ink); color:var(--bg); border-bottom:1px solid var(--ink); }
.mt-shell { max-width:1560px; margin:0 auto; }
.mt-header { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; padding:18px 22px 12px; flex-wrap:wrap; }
.mt-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:24px; letter-spacing:-0.4px; }
.mt-sub { font-size:11px; color:var(--on-dark-2); margin-top:3px; line-height:1.4; }
.mt-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
.mt-tabs { display:flex; gap:6px; overflow-x:auto; overflow-y:hidden; padding:7px 22px 0; scrollbar-width:thin; }
.mt-tabs button { flex:0 0 auto; border:1px solid transparent; border-bottom:3px solid transparent; border-radius:9px 9px 0 0; background:transparent; color:#b8afa3; padding:10px 15px; min-height:38px; font-family:'Archivo',sans-serif; font-size:12px; font-weight:800; letter-spacing:0.3px; cursor:pointer; }
.mt-tabs button:hover { background:rgba(255,255,255,0.06); color:var(--bg); }
.mt-tabs button.active { color:var(--bg); border-color:var(--accent); border-bottom-color:var(--accent); background:rgba(255,255,255,0.08); }
.mt-page { padding:18px 22px 34px; }
.mt-card { background:var(--surface); border:1px solid var(--line-2); border-radius:14px; box-shadow:var(--card-shadow); }
.mt-section { padding:14px; }
.mt-section + .mt-section { border-top:1px solid var(--line-3); }
.mt-panel-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; margin:0; }
.mt-panel-sub { font-size:10.5px; color:var(--muted-2); margin-top:3px; line-height:1.45; }
.mt-toolbar { display:flex; align-items:center; gap:7px; flex-wrap:wrap; background:var(--toolbar-bg); border:1px solid var(--toolbar-line); border-radius:8px; padding:7px 9px; }
.mt-toolbar-label { font-size:9px; font-weight:800; color:var(--muted-2); text-transform:uppercase; letter-spacing:.4px; }
.mt-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid var(--ink); background:var(--surface); color:var(--ink); padding:6px 10px; font-size:11px; font-weight:800; cursor:pointer; text-decoration:none; }
.mt-btn.primary { background:var(--accent); }
.mt-btn.dark { background:var(--ink); color:var(--bg); }
.mt-btn.ghost { border-color:var(--line-2); color:var(--muted-3); }
.mt-btn:disabled { opacity:.5; cursor:not-allowed; }
.mt-input, .mt-select { border:1px solid var(--ink); background:var(--surface); color:var(--ink); padding:7px 9px; font-size:11px; min-height:34px; outline:none; }
.mt-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
.mt-two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.mt-kpi { padding:14px; border:1px solid var(--line-2); background:var(--surface); border-radius:14px; }
.mt-kpi .label { font-size:9.5px; color:var(--muted-2); text-transform:uppercase; letter-spacing:.45px; font-weight:800; }
.mt-kpi .value { margin-top:6px; font-family:'Archivo',sans-serif; font-size:25px; font-weight:800; line-height:1; }
.mt-kpi .note { margin-top:6px; font-size:10px; color:var(--muted-3); line-height:1.35; }
.mt-table-wrap { overflow:auto; border:1px solid var(--ink); background:var(--surface); }
table.mt-table { width:100%; border-collapse:separate; border-spacing:0; min-width:1120px; }
.mt-table th { position:sticky; top:0; z-index:2; background:var(--ink); color:var(--bg); border-right:1px solid var(--on-dark-line); border-bottom:1px solid var(--ink); padding:9px 8px; font-size:10px; text-align:left; font-weight:800; white-space:nowrap; }
.mt-table td { border-right:1px solid var(--line-3); border-bottom:1px solid var(--line-3); padding:8px; vertical-align:top; font-size:11px; background:var(--surface); }
.mt-table tr:hover td { background:#fffaf1; }
.mt-sticky { position:sticky; left:0; z-index:1; box-shadow:1px 0 0 var(--line-2); }
.mt-table th.mt-sticky { z-index:3; background:var(--ink); }
.mt-chip { display:inline-flex; align-items:center; gap:4px; border:1px solid rgba(31,31,29,.1); border-radius:999px; padding:3px 8px; font-size:9.5px; font-weight:800; white-space:nowrap; box-shadow:var(--pill-shadow); }
.mt-ok { background:var(--tint-ok); color:var(--fg-ok); }
.mt-warn { background:var(--tint-warn); color:var(--fg-warn); }
.mt-late { background:var(--tint-late); color:var(--fg-late); }
.mt-info { background:var(--blue); color:var(--blue-fg); }
.mt-muted { background:#efefea; color:var(--muted-4); }
.mt-orange { background:#fff0df; color:#94440f; }
.mt-purple { background:var(--purple); color:var(--purple-fg); }
.mt-small { font-size:10px; color:var(--muted-2); }
.mt-stage-cell { display:flex; flex-direction:column; gap:4px; min-width:116px; cursor:pointer; }
.mt-stage-top { display:flex; align-items:center; justify-content:space-between; gap:4px; }
.mt-stage-title { font-size:9px; text-transform:uppercase; color:var(--muted-2); font-weight:800; letter-spacing:.35px; }
.mt-cell-numbers { display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
.mt-num { border-radius:7px; padding:3px 5px; font-weight:800; font-size:10.5px; border:1px solid rgba(31,31,29,.07); }
.mt-num.good { background:#e7f1e8; color:#1f6f54; }
.mt-num.open { background:#f8e9b7; color:#7a560f; }
.mt-num.loss { background:#f6d3cb; color:#8c241a; }
.mt-num.extra { background:#eee7fb; color:#5b3f8d; }
.mt-cell-note { font-size:9px; color:var(--muted-2); line-height:1.2; }
.mt-status-stack { display:flex; flex-direction:column; gap:5px; min-width:130px; }
.mt-status-line { display:flex; align-items:center; flex-wrap:wrap; gap:4px; font-size:9.5px; color:var(--muted-3); line-height:1.2; }
.mt-status-pct { color:var(--muted-2); font-weight:800; }
.mt-drawer { position:fixed; right:0; top:0; bottom:0; width:min(760px, 94vw); background:var(--surface); border-left:1px solid var(--ink); box-shadow:-8px 0 30px rgba(31,31,29,.18); z-index:80; display:flex; flex-direction:column; }
.mt-drawer-head { background:var(--ink); color:var(--bg); padding:16px; display:flex; justify-content:space-between; gap:12px; }
.mt-drawer-body { padding:16px; overflow:auto; }
.mt-cell-input { width:86px; border:1px solid var(--line-2); background:#fff; padding:6px; font-size:11px; text-align:right; }
.mt-cell-input:focus { outline:2px solid var(--accent-tint); border-color:var(--accent); }
.mt-cell-input.dirty { background:#fff4db; border-color:#d58a1e; }
.mt-cell-input.blocked { background:#fde7e2; border-color:#b42318; }
.mt-print-sheet { background:white; border:1px solid var(--line-2); padding:14px; }

.mt-style-main { display:flex; align-items:center; gap:9px; min-width:275px; }
.mt-thumb { width:42px; height:42px; border:1px solid var(--line-2); border-radius:10px; object-fit:cover; background:#f2eadf; flex:0 0 auto; display:flex; align-items:center; justify-content:center; color:var(--muted-2); overflow:hidden; }
.mt-thumb.small { width:32px; height:32px; border-radius:8px; }
.mt-thumb.large { width:100%; height:220px; border-radius:14px; margin-bottom:12px; }
.mt-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.mt-photo-empty { font-size:9px; font-weight:800; text-align:center; line-height:1.1; padding:3px; }
.mt-speed-note { border:1px dashed var(--line-2); background:#fffaf1; color:var(--muted-3); border-radius:10px; padding:10px; font-size:10.5px; line-height:1.45; }


.mt-backdate-box { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.mt-locked-note { border-left:4px solid var(--danger); background:#fff1ee; padding:9px 10px; font-size:10.5px; color:var(--fg-late); line-height:1.45; }
.mt-editor-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
.mt-delta-pos { color:var(--fg-ok); font-weight:800; }
.mt-delta-neg { color:var(--fg-late); font-weight:800; }
.mt-edit-panel { border:1px solid var(--line-2); border-radius:14px; background:#fffdf8; overflow:hidden; margin-top:12px; }
.mt-edit-panel-head { padding:12px; background:#fff7ea; border-bottom:1px solid var(--line-3); }
.mt-entry-date { border:2px solid var(--accent); background:white; font-weight:800; }


.mt-dash-grid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px; margin-bottom:12px; }
.mt-dash-card { padding:12px; border:1px solid var(--line-2); background:var(--surface); border-radius:14px; cursor:pointer; transition:transform .08s ease, border-color .08s ease, background .08s ease; min-height:92px; }
.mt-dash-card:hover { transform:translateY(-1px); border-color:var(--accent); background:#fffaf1; }
.mt-dash-card .label { font-size:9.5px; color:var(--muted-2); text-transform:uppercase; letter-spacing:.45px; font-weight:800; }
.mt-dash-card .value { margin-top:6px; font-family:'Archivo',sans-serif; font-size:23px; font-weight:800; line-height:1; }
.mt-dash-card .note { margin-top:6px; font-size:10px; color:var(--muted-3); line-height:1.35; }
.mt-mini-board { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:12px; }
.mt-table tr.drillable td { cursor:pointer; }
.mt-table tr.drillable:hover td { background:#fff4e3; }
.mt-clickable-cell { cursor:pointer; }
.mt-clickable-cell:hover { background:#fff4e3 !important; box-shadow: inset 0 0 0 1px #f1b15d; }
.mt-drill-hint { display:inline-flex; margin-top:5px; font-size:10px; color:#9a6b2b; border-bottom:1px dotted #c08b3a; }
.mt-drill-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
.mt-drill-meta { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }

.mt-filter-row { display:flex; align-items:center; gap:7px; flex-wrap:wrap; background:var(--toolbar-bg); border:1px solid var(--toolbar-line); border-radius:10px; padding:8px; margin-bottom:10px; }
.mt-filter-group { display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding-right:8px; border-right:1px solid var(--line-2); }
.mt-filter-group:last-child { border-right:0; }
.mt-quick-chip { border:1px solid var(--line-2); background:var(--surface); color:var(--muted-4); border-radius:999px; padding:6px 10px; font-size:10px; font-weight:800; cursor:pointer; min-height:30px; }
.mt-quick-chip.active { background:var(--ink); color:var(--bg); border-color:var(--ink); }
.mt-sort-th { cursor:pointer; user-select:none; }
.mt-sort-th:hover { background:#34302a !important; }
.mt-subrow td { background:#fffaf1 !important; }
.mt-size-strip { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
.mt-size-box { border:1px solid var(--line-2); background:white; border-radius:8px; padding:6px 8px; min-width:78px; }
.mt-size-box b { display:block; font-size:10px; }
.mt-size-box span { display:block; color:var(--muted-2); font-size:9px; margin-top:2px; }
.mt-page-filter-note { font-size:10px; color:var(--muted-2); margin-left:auto; }
.mt-summary-strip { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; margin-bottom:10px; }
.mt-summary-tile { border:1px solid var(--line-2); background:var(--surface); border-radius:12px; padding:10px; cursor:pointer; text-align:left; }
.mt-summary-tile:hover { border-color:var(--accent); background:#fffaf1; }
.mt-summary-tile.active { outline:2px solid var(--accent); background:#fff7ea; }
.mt-summary-tile .label { font-size:9px; text-transform:uppercase; color:var(--muted-2); font-weight:800; letter-spacing:.3px; }
.mt-summary-tile .value { font-family:'Archivo',sans-serif; font-weight:800; font-size:20px; margin-top:5px; }
.mt-month-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-bottom:12px; }

@media print { .mt-top,.mt-toolbar,.no-print,.mt-tabs { display:none !important; } .mt-page{padding:0;} .mt-card,.mt-table-wrap{border:0; box-shadow:none;} .mt-table th{background:#111 !important; color:#fff !important;} }
@media (max-width:1180px){ .mt-dash-grid{grid-template-columns:repeat(3,minmax(0,1fr));} .mt-mini-board{grid-template-columns:1fr;} .mt-summary-strip,.mt-month-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
@media (max-width:980px){ .mt-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-two{grid-template-columns:1fr;} }
@media (max-width:620px){ .mt-grid{grid-template-columns:1fr;} .mt-dash-grid,.mt-summary-strip,.mt-month-grid{grid-template-columns:1fr;} .mt-page{padding:14px 12px 28px;} .mt-header{padding:15px 12px 10px;} .mt-tabs{padding-left:12px; padding-right:12px;} }
`;

const SIZE_SETS = {
  alpha: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y"],
  waist: ["30", "32", "34", "36", "38"],
};

const STAGES = [
  { key: "cutting", label: "Cutting", short: "Cut", owner: "Cutting HOD" },
  { key: "printing", label: "Printing", short: "Print", owner: "Printing HOD" },
  { key: "embroidery", label: "Embroidery", short: "Emb", owner: "Embroidery HOD" },
  { key: "stitching", label: "Stitching", short: "Stitch", owner: "Stitching HOD" },
  { key: "checking", label: "Checking", short: "Check", owner: "Checking HOD" },
  { key: "iron", label: "Iron", short: "Iron", owner: "Finishing HOD" },
  { key: "packing", label: "Packing", short: "Pack", owner: "Packing HOD" },
  { key: "dispatch", label: "Dispatch", short: "Disp", owner: "Dispatch HOD" },
];
const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));
const BASE_ROUTE = ["cutting", "stitching", "checking", "iron", "packing", "dispatch"];

function n(v){ return Number(v || 0) || 0; }
function fmt(v){ return n(v).toLocaleString("en-IN"); }

function initials(row){
  const text = [row.buyer, row.style_no].filter(Boolean).join(" ").trim() || "ST";
  return text.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
}
function LazyStylePhoto({ row, large=false }){
  const [err, setErr] = useState(false);
  const src = row?.photo_url || "";
  const cls = `mt-thumb ${large ? "large" : ""}`;
  if (!src || err) return <div className={cls}><div className="mt-photo-empty"><ImageIcon size={large ? 28 : 16}/><br/>{initials(row)}</div></div>;
  return <div className={cls}><img src={src} alt={`${row.style_no || "style"} photo`} loading="lazy" decoding="async" fetchPriority="low" onError={()=>setErr(true)} /></div>;
}
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`; }
function today(){ return new Date().toISOString().slice(0,10); }
function dateDiff(a,b){
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / 86400000);
}
function backdateRisk(entryDate){
  const d = dateDiff(entryDate, today());
  if (d <= 0) return { days:d, label:"Today", tone:"ok", approval:"not_required", locked:false };
  if (d === 1) return { days:d, label:"Backdated 1 day", tone:"warn", approval:"reason_required", locked:false };
  if (d <= 3) return { days:d, label:`Backdated ${d} days`, tone:"warn", approval:"production_head_review", locked:false };
  return { days:d, label:`Backdated ${d} days`, tone:"late", approval:"manager_approval_required", locked:true };
}
function entryTypeForField(field){ return field === "received" ? "receive" : field === "output" ? "good_output" : field === "issued" ? "issue" : field; }
function stageLabel(k){ return STAGE_BY_KEY[k]?.label || k; }
function stageOwner(k){ return STAGE_BY_KEY[k]?.owner || "Production Owner"; }
function hodAndCoordinator(k){ return `${stageOwner(k)} + Production Coordinator`; }
function sizesFor(row){ return SIZE_SETS[row.size_set] || SIZE_SETS.alpha; }
function buildRouteFromToggles(row){
  const route = ["cutting"];
  if (!!row.print_required) route.push("printing");
  if (!!row.embroidery_required) route.push("embroidery");
  route.push("stitching","checking","iron","packing","dispatch");
  return route;
}
function routeFor(row){
  // Route toggles must always control the active route.
  // Earlier V5 stored `route` on each row, so routeFor returned that old cached array
  // and Print/Emb buttons looked changed but the route/WIP columns did not update.
  return buildRouteFromToggles(row || {});
}
function blankStage(){ return { received:0, output:0, issued:0, reject:0, alter:0, missing:0, party:"", idle:0 }; }
function sdata(row, key){ return { ...blankStage(), ...(row.stages?.[key] || {}) }; }
function loss(stage){ return n(stage.reject) + n(stage.alter) + n(stage.missing); }
function stageFeed(row, stageKey){
  const route = routeFor(row);
  const idx = route.indexOf(stageKey);
  if (idx <= 0) return n(row.order_qty);
  const prev = sdata(row, route[idx - 1]);
  return n(prev.issued);
}
function accountableTotal(row){ return n(sdata(row, "cutting").output) || n(row.order_qty); }
function receivingPct(feed, received){ return feed > 0 ? Math.round((received * 1000) / feed) / 10 : 0; }
function ownerForIssuedNotReceived(stageKey, feed, received){
  const bal = Math.max(0, feed - received);
  if (!bal) return "—";
  return hodAndCoordinator(stageKey);
}
function cellBreakup(row, stageKey){
  const route = routeFor(row);
  const idx = route.indexOf(stageKey);
  if (idx === -1) return { skipped:true, received:0, open:0, ram:0, extra:0, note:"Skipped" };
  const st = sdata(row, stageKey);
  const ram = loss(st);
  if (stageKey === "cutting") {
    const extra = Math.max(0, n(st.output) - n(row.order_qty));
    const open = Math.max(0, n(row.order_qty) - n(st.output) - ram);
    return { skipped:false, received:n(st.output), open, ram, extra, note: extra ? `Extra cut ${fmt(extra)}` : "Cut qty" };
  }
  const feed = stageFeed(row, stageKey);
  const received = n(st.received);
  const open = Math.max(0, feed - received - ram);
  const over = Math.max(0, received + ram - feed);
  return { skipped:false, received, open, ram, extra:over, note: over ? `Over ${fmt(over)}` : `Feed ${fmt(feed)}` };
}

function issueBuckets(row){
  const route = routeFor(row);
  const buckets = [];
  for (let i = 0; i < route.length; i++) {
    const key = route[i];
    const st = sdata(row, key);
    const stageLoss = loss(st);
    if (key === "cutting") {
      const overCut = Math.max(0, n(st.output) - n(row.order_qty));
      if (overCut) buckets.push({ type:"extra_cut", status:"Extra Cut", qty:overCut, owner:hodAndCoordinator(key), support:"Production Manager escalation if over tolerance", stage:key, tone:"purple", action:"Extra cut allowed; check tolerance", idle:n(st.idle) });
    } else {
      const feed = stageFeed(row, key);
      const totalReceived = n(st.received) + stageLoss;
      const totalJump = Math.max(0, totalReceived - feed);
      if (totalJump > 0) {
        buckets.push({ type:"reconcile", status:"Reconcile", qty:totalJump, owner:hodAndCoordinator(key), support:"Production Manager escalation / approval only", stage:key, tone:"late", action:`${stageLabel(key)} total is above issued quantity. Adjustment required.`, idle:n(st.idle) });
      }
      const issuedNotReceived = Math.max(0, feed - n(st.received) - stageLoss);
      if (issuedNotReceived > 0) {
        buckets.push({ type:"issued_not_received", status:`Pending ${stageLabel(key)} Receipt`, qty:issuedNotReceived, owner:ownerForIssuedNotReceived(key, feed, n(st.received)), support:"Production Coordinator after 95% receiving", stage:key, tone:"warn", action:`${stageLabel(key)} to receive/confirm balance`, idle:n(st.idle) });
      }
    }
    if (i < route.length - 1) {
      const nextKey = route[i + 1];
      const completedNotIssued = Math.max(0, n(st.output) - n(st.issued) - stageLoss);
      if (completedNotIssued > 0) {
        buckets.push({ type:"completed_not_issued", status:`Ready for ${stageLabel(nextKey)}`, qty:completedNotIssued, owner:`Production Coordinator + ${stageOwner(key)}`, support:"Coordinator closes / HOD supports movement", stage:key, toStage:nextKey, tone:"info", action:`Issue completed stock to ${stageLabel(nextKey)}`, idle:n(st.idle) });
      }
    }
    const receivedNotProcessed = Math.max(0, n(st.received) - n(st.output) - stageLoss);
    if (key !== "cutting" && receivedNotProcessed > 0) {
      buckets.push({ type:"received_not_processed", status:`With ${stageLabel(key)}`, qty:receivedNotProcessed, owner:hodAndCoordinator(key), support:"Production Manager escalation if overdue", stage:key, tone:n(st.idle) >= 7 ? "warn" : "info", action:`${stageLabel(key)} to complete/process and issue forward`, idle:n(st.idle) });
    }
    if (stageLoss > 0) {
      buckets.push({ type:"ram", status:`R/A/M in ${stageLabel(key)}`, qty:stageLoss, owner:key === "checking" ? "Checking HOD + Production Coordinator" : hodAndCoordinator(key), support:"Production Manager escalation if overdue", stage:key, tone:"late", action:"Close reject / alter / missing breakup", idle:n(st.idle) });
    }
  }
  return buckets.sort((a,b)=> (b.qty * Math.max(1,b.idle||1)) - (a.qty * Math.max(1,a.idle||1)) || b.qty-a.qty);
}
function rowStatus(row){
  const buckets = issueBuckets(row).filter(b => b.type !== "extra_cut" || b.qty > (n(row.order_qty) * .05));
  const critical = buckets.find(b => b.type === "reconcile");
  const main = critical || buckets[0];
  if (!main) return { status:"Closed / Balanced", owner:"—", qty:0, idle:0, tone:"ok", action:"No open production issue", stage:"dispatch" };
  return { status:main.status, owner:main.owner, qty:main.qty, idle:main.idle||0, tone:main.tone, action:main.action, stage:main.stage, support:main.support };
}
function bucketDenominator(row, bucket){
  if (!bucket) return accountableTotal(row) || n(row.order_qty) || 1;
  if (bucket.type === "extra_cut") return n(row.order_qty) || 1;
  if (bucket.type === "completed_not_issued") return n(sdata(row, bucket.stage).output) || accountableTotal(row) || 1;
  if (bucket.type === "received_not_processed") return n(sdata(row, bucket.stage).received) || stageFeed(row, bucket.stage) || accountableTotal(row) || 1;
  return stageFeed(row, bucket.stage) || accountableTotal(row) || n(row.order_qty) || 1;
}
function bucketPct(row, bucket){
  const denom = bucketDenominator(row, bucket);
  return denom > 0 ? Math.round((n(bucket.qty) * 1000) / denom) / 10 : 0;
}
function statusBreakdown(row){
  const all = issueBuckets(row).filter(b => b.type !== "extra_cut" || b.qty > (n(row.order_qty) * .05));
  const reconcile = all.find(b => b.type === "reconcile");
  const current = all.find(b => b.type !== "reconcile");
  const rest = all.filter(b => b !== reconcile && b !== current).slice(0, 1);
  return [reconcile, current, ...rest].filter(Boolean);
}
function shortStatusLabel(bucket){
  if (!bucket) return "Closed / Balanced";
  return bucket.status.replace("Pending ", "Pending ").replace(" Receipt", " Receipt");
}
function statusText(row){
  const parts = statusBreakdown(row);
  if (!parts.length) return "Closed / Balanced";
  return parts.map(b => `${shortStatusLabel(b)} ${fmt(b.qty)} (${bucketPct(row,b)}%)`).join(" | ");
}
function StatusCell({ row }){
  const parts = statusBreakdown(row);
  if (!parts.length) return <div className="mt-status-stack"><span className="mt-chip mt-ok">Closed / Balanced</span><div className="mt-status-line">No open production issue</div></div>;
  return <div className="mt-status-stack">
    {parts.map((b, idx) => <div className="mt-status-line" key={`${b.type}-${b.stage}-${idx}`}>
      <span className={`mt-chip ${statusClass(b.tone)}`}>{shortStatusLabel(b)}</span>
      <b>{fmt(b.qty)}</b>
      <span className="mt-status-pct">{bucketPct(row,b)}%</span>
    </div>)}
  </div>;
}
function statusClass(tone){ return tone === "late" ? "mt-late" : tone === "warn" ? "mt-warn" : tone === "ok" ? "mt-ok" : tone === "purple" ? "mt-purple" : tone === "info" ? "mt-info" : "mt-muted"; }

function uniqueList(values){ return Array.from(new Set(values.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b))); }
function ownerNamesFromBucket(bucket){ return String(bucket?.owner || "").split("+").map(x=>x.trim()).filter(Boolean); }
function rowOwnerNames(row){ return uniqueList(issueBuckets(row).flatMap(ownerNamesFromBucket)); }
function routeType(row){ const p=!!row.print_required, e=!!row.embroidery_required; return p && e ? "Print + Emb" : p ? "Print" : e ? "Embroidery" : "Plain"; }
function bucketTypeLabel(type){
  return ({ issued_not_received:"Pending Receipt", completed_not_issued:"Ready for Next Dept", received_not_processed:"With Department", ram:"Reject / Alter / Missing", reconcile:"Reconcile", extra_cut:"Extra Cut" })[type] || type;
}
function typeFromStatusFilter(status){
  if (status === "ready") return "completed_not_issued";
  if (status === "pending_receipt") return "issued_not_received";
  if (status === "with_dept") return "received_not_processed";
  if (status === "reconcile") return "reconcile";
  if (status === "ram") return "ram";
  return "";
}
function rowMatchesBucketFilter(row, issueType){
  if (!issueType || issueType === "all") return true;
  if (issueType === "closed") return issueBuckets(row).filter(b=>b.type!=="extra_cut").length === 0;
  return issueBuckets(row).some(b=>b.type === issueType);
}
function compareValue(row, key){
  const rs = rowStatus(row);
  if (key === "style") return row.style_no || "";
  if (key === "buyer") return row.buyer || "";
  if (key === "status") return rs.status || "";
  if (key === "owner") return rs.owner || "";
  if (key === "open") return n(rs.qty);
  if (key === "idle") return n(rs.idle);
  if (key === "route") return routeType(row);
  if (key === "currentDept") return stageLabel(rs.stage);
  return row.style_no || "";
}

function parseYmd(value){
  const d = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
function ymd(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0,10);
}
function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0,0,0,0);
  return d;
}
function mondayOnOrBefore(date){
  const d = parseYmd(ymd(date));
  const day = d.getDay(); // Sun 0, Mon 1
  const back = day === 0 ? 6 : day - 1;
  return addDays(d, -back);
}
function monthName(date){ return date.toLocaleString("en-US", { month:"short" }); }
function fullMonthLabel(date){ return date.toLocaleString("en-US", { month:"short", year:"numeric" }); }
function dateRangeLabel(start, end){
  const s = new Date(start), e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth ? `${s.getDate()}–${e.getDate()} ${monthName(e)}` : `${s.getDate()} ${monthName(s)}–${e.getDate()} ${monthName(e)}`;
}
function latestActivityDate(ledger=[]){
  const dates = (ledger || []).map(x => x.entry_date || x.entryDate || x.date || "").filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : today();
}
function fiscalStartFor(date, startMonth=3){ // default Apr, JS month index
  const d = parseYmd(ymd(date));
  let year = d.getFullYear();
  if (d.getMonth() < startMonth) year -= 1;
  return new Date(year, startMonth, 1);
}
function productionCalendar445(date, startMonth=3){
  const selected = parseYmd(date);
  const weekStart = mondayOnOrBefore(selected);
  const weekEnd = addDays(weekStart, 5); // Mon–Sat; Sunday excluded unless separately configured
  const fyStart = fiscalStartFor(weekStart, startMonth);
  let anchor = mondayOnOrBefore(fyStart);
  if (weekStart < anchor) anchor = mondayOnOrBefore(new Date(fyStart.getFullYear() - 1, startMonth, 1));
  const diffWeeks = Math.max(0, Math.floor((weekStart - anchor) / (7 * 86400000)));
  const pattern = [4,4,5,4,4,5,4,4,5,4,4,5];
  let remaining = diffWeeks;
  let prodMonthIndex = 0;
  let weekInMonth = 1;
  for (let i=0; i<pattern.length; i++){
    if (remaining < pattern[i]) { prodMonthIndex = i; weekInMonth = remaining + 1; break; }
    remaining -= pattern[i];
  }
  const labelDate = new Date(anchor.getFullYear(), anchor.getMonth() + prodMonthIndex, 1);
  const label = `${monthName(labelDate)} W${weekInMonth}`;
  return {
    weekStart: ymd(weekStart),
    weekEnd: ymd(weekEnd),
    label,
    fullLabel: `${label} · ${dateRangeLabel(weekStart, weekEnd)}`,
    productionMonth: fullMonthLabel(labelDate),
    weekInProductionMonth: weekInMonth,
    fyAnchor: ymd(anchor),
    calendarMonthStart: ymd(new Date(selected.getFullYear(), selected.getMonth(), 1)),
    calendarMonthEnd: ymd(new Date(selected.getFullYear(), selected.getMonth()+1, 0)),
  };
}
function inDateRange(dateValue, start, end){
  const d = String(dateValue || "").slice(0,10);
  return !!d && d >= start && d <= end;
}
function rowSnapshotNumbers(rows, label, periodKey, dateRange="Snapshot"){
  return {
    period:periodKey,
    Period:label,
    Date_Range:dateRange,
    Cutting:rows.reduce((a,row)=>a+cellBreakup(row,"cutting").received,0),
    Stitching_Receiving:rows.reduce((a,row)=>a+cellBreakup(row,"stitching").received,0),
    Checking:rows.reduce((a,row)=>a+cellBreakup(row,"checking").received,0),
    Packing:rows.reduce((a,row)=>a+cellBreakup(row,"packing").received,0),
    Dispatch:rows.reduce((a,row)=>a+cellBreakup(row,"dispatch").received,0),
    RAM:rows.reduce((a,row)=>a+routeFor(row).reduce((sum,stage)=>sum+cellBreakup(row,stage).ram,0),0),
    Rows:rows.length,
  };
}
function ledgerPeriodNumbers(ledgerRows, rows, label, periodKey, start, end){
  const inRows = (ledgerRows || []).filter(x => inDateRange(x.entry_date || x.entryDate || x.date, start, end));
  const qty = (stage, types=[]) => inRows.filter(x => String(x.stage) === stage && (!types.length || types.includes(String(x.entry_type || x.entryType || "")))).reduce((a,x)=>a+Math.max(0,n(x.qty ?? x.delta)),0);
  const ram = inRows.filter(x => ["reject","alter","missing","ram"].includes(String(x.entry_type || x.entryType || ""))).reduce((a,x)=>a+Math.abs(n(x.qty ?? x.delta)),0);
  return {
    period:periodKey,
    Period:label,
    Date_Range:dateRangeLabel(parseYmd(start), parseYmd(end)),
    Cutting:qty("cutting", ["good_output","receive","output"]),
    Stitching_Receiving:qty("stitching", ["receive"]),
    Checking:qty("checking", ["good_output","receive","output"]),
    Packing:qty("packing", ["good_output","receive","output"]),
    Dispatch:qty("dispatch", ["receive","dispatch","good_output","output"]),
    RAM:ram,
    Rows:inRows.length || rows.length,
  };
}
function dailyWeeklyMonthlyRows(rows, ledger=[], selectedDate=today()){
  const cal = productionCalendar445(selectedDate);
  const hasLedger = Array.isArray(ledger) && ledger.length > 0;
  const monthLabel = `Calendar Month · ${fullMonthLabel(parseYmd(selectedDate))}`;
  if (hasLedger) {
    return [
      ledgerPeriodNumbers(ledger, rows, `Daily · ${selectedDate}`, "daily", selectedDate, selectedDate),
      ledgerPeriodNumbers(ledger, rows, `Production Week · ${cal.fullLabel}`, "production_week", cal.weekStart, cal.weekEnd),
      ledgerPeriodNumbers(ledger, rows, monthLabel, "calendar_month", cal.calendarMonthStart, cal.calendarMonthEnd),
    ];
  }
  return [
    rowSnapshotNumbers(rows, `Daily · ${selectedDate}`, "daily", selectedDate),
    rowSnapshotNumbers(rows, `Production Week · ${cal.fullLabel}`, "production_week", `${cal.weekStart} to ${cal.weekEnd}`),
    rowSnapshotNumbers(rows, monthLabel, "calendar_month", `${cal.calendarMonthStart} to ${cal.calendarMonthEnd}`),
  ];
}
function departmentCurrentRows(rows){
  return STAGES.map(stage => {
    const buckets = rows.flatMap(row => issueBuckets(row).filter(b=>b.stage===stage.key && b.type!=="extra_cut"));
    const production = buckets.filter(b=>["issued_not_received","completed_not_issued","received_not_processed"].includes(b.type)).reduce((a,b)=>a+n(b.qty),0);
    const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
    const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
    const styles = new Set(rows.filter(row => issueBuckets(row).some(b=>b.stage===stage.key && b.type!=="extra_cut")).map(r=>r.id)).size;
    const oldest = buckets.reduce((a,b)=>Math.max(a,n(b.idle)),0);
    return { stage:stage.key, Dept:stage.label, Production_Qty:production, Reconcile_Qty:reconcile, RAM_Qty:ram, Total_Open:production+reconcile+ram, Styles:styles, Oldest_Idle:`${oldest}d` };
  }).filter(r=>r.Total_Open>0 || r.Styles>0);
}
function departmentIssueRows(rows){
  const map = new Map();
  rows.forEach(row => issueBuckets(row).filter(b=>b.type!=="extra_cut").forEach(bucket => {
    const key = `${bucket.stage}|${bucket.type}`;
    const curr = map.get(key) || { stage:bucket.stage, type:bucket.type, Dept:stageLabel(bucket.stage), Issue:bucketTypeLabel(bucket.type), Qty:0, Styles:new Set(), Oldest:0, Owner:bucket.owner };
    curr.Qty += n(bucket.qty); curr.Styles.add(row.id); curr.Oldest = Math.max(curr.Oldest, n(bucket.idle)); curr.Owner = curr.Owner || bucket.owner;
    map.set(key,curr);
  }));
  return Array.from(map.values()).map(x=>({ stage:x.stage, type:x.type, Dept:x.Dept, Issue:x.Issue, Qty:x.Qty, Styles:x.Styles.size, Oldest_Idle:`${x.Oldest}d`, Owner:x.Owner })).sort((a,b)=>b.Qty-a.Qty);
}
function ownerActivityRows(rows){
  const map = new Map();
  rows.forEach(row => issueBuckets(row).filter(b=>b.type!=="extra_cut").forEach(bucket => {
    ownerNamesFromBucket(bucket).forEach(owner => {
      const curr = map.get(owner) || { Owner:owner, Production_Qty:0, Reconcile_Qty:0, RAM_Qty:0, Styles:new Set(), Oldest:0, Main_Issue:"" };
      if (bucket.type === "reconcile") curr.Reconcile_Qty += n(bucket.qty);
      else if (bucket.type === "ram") curr.RAM_Qty += n(bucket.qty);
      else curr.Production_Qty += n(bucket.qty);
      curr.Styles.add(row.id); curr.Oldest = Math.max(curr.Oldest, n(bucket.idle)); curr.Main_Issue = curr.Main_Issue || bucketTypeLabel(bucket.type);
      map.set(owner,curr);
    });
  }));
  return Array.from(map.values()).map(x=>({ Owner:x.Owner, Production_Qty:x.Production_Qty, Reconcile_Qty:x.Reconcile_Qty, RAM_Qty:x.RAM_Qty, Total_Qty:x.Production_Qty+x.Reconcile_Qty+x.RAM_Qty, Styles:x.Styles.size, Oldest_Idle:`${x.Oldest}d`, Main_Issue:x.Main_Issue })).sort((a,b)=>b.Total_Qty-a.Total_Qty);
}
function meetingFocusRows(rows){
  return rows.flatMap(row => issueBuckets(row).filter(b=>b.type!=="extra_cut").map(bucket => ({
    Dept:stageLabel(bucket.stage),
    Issue:bucketTypeLabel(bucket.type),
    Order:row.order_no,
    Style:row.style_no,
    Colour:row.colour,
    Component:row.component,
    Qty:n(bucket.qty),
    Idle:`${n(bucket.idle)}d`,
    Owner:bucket.owner,
    Action:bucket.action,
    Score:n(bucket.qty) * Math.max(1,n(bucket.idle)),
  }))).sort((a,b)=>b.Score-a.Score).slice(0,18).map(({Score,...r})=>r);
}

function SortTh({ label, sortKey, sort, setSort, sticky=false }){
  const active = sort.key === sortKey;
  const dir = active && sort.dir === "asc" ? "▲" : active ? "▼" : "";
  return <th className={`${sticky ? "mt-sticky " : ""}mt-sort-th`} onClick={()=>setSort(s=>s.key===sortKey ? { key:sortKey, dir:s.dir==="asc"?"desc":"asc" } : { key:sortKey, dir:"asc" })}>{label} {dir}</th>;
}
function SizeBreakupStrip({ row, stage }){
  if (!row || !stage) return null;
  const rec = Object.fromEntries(sizeMatrix(row, stage, stage === "cutting" ? "received" : "received").map(x=>[x.size,x.qty]));
  const output = Object.fromEntries(sizeMatrix(row, stage, "output").map(x=>[x.size,x.qty]));
  const issued = Object.fromEntries(sizeMatrix(row, stage, "issued").map(x=>[x.size,x.qty]));
  return <div className="mt-size-strip">
    <span className="mt-chip mt-info">{stageLabel(stage)} size breakup</span>
    {sizesFor(row).map(size=><div className="mt-size-box" key={size}><b>{size}</b><span>Rec {fmt(rec[size]||0)}</span><span>Out {fmt(output[size]||0)}</span><span>Iss {fmt(issued[size]||0)}</span></div>)}
  </div>;
}
function distribute(total, sizes){
  const weights = sizes.map((_,i)=> (i===0 || i===sizes.length-1) ? 1 : 2);
  const totalW = weights.reduce((a,b)=>a+b,0);
  let used = 0;
  return Object.fromEntries(sizes.map((sz,idx)=>{
    const v = idx === sizes.length - 1 ? total - used : Math.round((total * weights[idx]) / totalW);
    used += v;
    return [sz, Math.max(0, v)];
  }));
}
function sizeMatrix(row, stageKey, field="received"){
  const sizes = sizesFor(row);
  const base = stageKey === "cutting" && field === "received" ? sdata(row,"cutting").output : sdata(row, stageKey)[field];
  const split = row.size_stage?.[stageKey]?.[field] || distribute(n(base), sizes);
  return sizes.map(size => ({ size, qty:n(split[size]) }));
}
function orderToSupabase(row){
  return {
    id:String(row.id).startsWith("demo") ? undefined : row.id,
    order_no:row.order_no, style_no:row.style_no, buyer:row.buyer, brand:row.buyer,
    photo_url:row.photo_url || null,
    colour:row.colour, component:row.component, set_id:row.set_id || null,
    order_qty:n(row.order_qty), size_set:row.size_set, default_line:row.line || null,
    print_required:!!row.print_required, embroidery_required:!!row.embroidery_required,
    route:routeFor(row),
    stage_qty:Object.fromEntries(routeFor(row).map(k=>[k, sdata(row,k)])),
    idle_by_stage:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).idle)])),
    party_by_stage:Object.fromEntries(routeFor(row).filter(k=>sdata(row,k).party).map(k=>[k, sdata(row,k).party])),
    reject_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).reject)])),
    alter_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).alter)])),
    missing_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).missing)])),
  };
}
function supabaseToOrder(row){
  const raw = row.stage_qty || {};
  const route = Array.isArray(row.route) ? row.route : BASE_ROUTE;
  const stages = Object.fromEntries(route.map(k=>{
    const v = raw[k] || {};
    if (typeof v === "number") return [k, { ...blankStage(), received:v, output:v, issued:v }];
    return [k, { ...blankStage(), ...v, reject:n(row.reject_qty?.[k] ?? v.reject), alter:n(row.alter_qty?.[k] ?? v.alter), missing:n(row.missing_qty?.[k] ?? v.missing), party:row.party_by_stage?.[k] || v.party || "", idle:n(row.idle_by_stage?.[k] ?? v.idle) }];
  }));
  return { id:row.id, order_no:row.order_no, style_no:row.style_no, buyer:row.buyer || row.brand || "", colour:row.colour || "", component:row.component || "", photo_url:row.photo_url || "", order_qty:n(row.order_qty), size_set:row.size_set || "alpha", set_id:row.set_id || "", line:row.default_line || "", print_required:!!row.print_required || route.includes("printing"), embroidery_required:!!row.embroidery_required || route.includes("embroidery"), route, stages };
}
async function exportXlsx(filename, sheets){
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.json_to_sheet(rows && rows.length ? rows : [{ Note:"No rows" }]);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31));
  });
  XLSX.writeFile(wb, filename);
}

const demoRows = [
  {
    id:"demo_jam_black", order_no:"SO/25-26/94", style_no:"FREEDOM JAMAICA BARM", buyer:"FREEDOM", colour:"BLACK", component:"BARMUDA", order_qty:3360, size_set:"alpha", line:"STF-5", photo_url:"", print_required:true, embroidery_required:false,
    stages:{
      cutting:{ output:3500, issued:3500, idle:1 },
      printing:{ received:3500, output:3500, issued:3500, idle:1 },
      stitching:{ received:3400, output:3325, issued:3300, reject:25, idle:3 },
      checking:{ received:3300, output:3200, issued:3180, reject:30, alter:20, idle:2 },
      iron:{ received:3180, output:3120, issued:3120, idle:1 },
      packing:{ received:3120, output:3000, issued:0, idle:1 },
      dispatch:{ received:0, output:0, issued:0, idle:0 },
    }
  },
  {
    id:"demo_comfy_mint", order_no:"SO/25-26/85", style_no:"COMFY TEES", buyer:"COMFY", colour:"MINT", component:"TEE", order_qty:351, size_set:"alpha", line:"STF-1", photo_url:"", print_required:false, embroidery_required:false,
    stages:{
      cutting:{ output:351, issued:0, idle:9 },
      stitching:{ received:0, output:0, issued:0, idle:9 },
      checking:{ received:0, output:0, issued:0 },
      iron:{ received:0, output:0, issued:0 },
      packing:{ received:0, output:0, issued:0 },
      dispatch:{ received:0, output:0, issued:0 },
    }
  },
  {
    id:"demo_s651_top", order_no:"SO/25-26/93", style_no:"S-651 C1", buyer:"EXPORT", colour:"C1", component:"TOP", order_qty:648, size_set:"alpha", set_id:"S651C1", line:"STF-3", photo_url:"", print_required:true, embroidery_required:false,
    stages:{
      cutting:{ output:662, issued:662, idle:1 },
      printing:{ received:662, output:639, issued:639, reject:23, party:"Sagar Print House", idle:3 },
      stitching:{ received:635, output:620, issued:611, idle:2 },
      checking:{ received:611, output:611, issued:611, idle:1 },
      iron:{ received:611, output:611, issued:611 },
      packing:{ received:611, output:611, issued:0 },
      dispatch:{ received:0, output:0, issued:0 },
    }
  },
  {
    id:"demo_hop_emb", order_no:"SO/25-26/78", style_no:"SS26IG5680", buyer:"HOPSCOTCH", colour:"BUTTER", component:"TOP", order_qty:400, size_set:"kids", line:"STF-2", photo_url:"", print_required:false, embroidery_required:true,
    stages:{
      cutting:{ output:416, issued:416, idle:1 },
      embroidery:{ received:416, output:390, issued:360, reject:8, party:"City Embroidery", idle:4 },
      stitching:{ received:350, output:330, issued:300, idle:2 },
      checking:{ received:300, output:290, issued:290, reject:4, alter:6 },
      iron:{ received:290, output:280, issued:280 },
      packing:{ received:280, output:0, issued:0 },
      dispatch:{ received:0, output:0, issued:0 },
    }
  },
  {
    id:"demo_uber", order_no:"SO/25-26/75", style_no:"UBER WOMENS TROUSER 5595", buyer:"UBER", colour:"GREY", component:"TROUSER", order_qty:1300, size_set:"waist", line:"STF-6", photo_url:"", print_required:false, embroidery_required:false,
    stages:{
      cutting:{ output:1300, issued:1300 },
      stitching:{ received:1300, output:1300, issued:1300 },
      checking:{ received:1300, output:1271, issued:1271, reject:29, idle:1 },
      iron:{ received:1271, output:1271, issued:1271 },
      packing:{ received:1271, output:1271, issued:0 },
      dispatch:{ received:0, output:0, issued:0 },
    }
  },
];

function Kpi({ label, value, note, tone }){
  return <div className="mt-kpi"><div className="label">{label}</div><div className="value">{value}</div><div className="note">{note}</div>{tone && <div style={{marginTop:8}}><span className={`mt-chip ${statusClass(tone)}`}>{tone}</span></div>}</div>;
}
function StageCell({ row, stageKey, onOpen }){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return <td><div className="mt-stage-cell"><span className="mt-chip mt-muted">Skip</span><div className="mt-cell-note">Route not active</div></div></td>;
  const feed = stageKey === "cutting" ? n(row.order_qty) : stageFeed(row, stageKey);
  const pct = feed > 0 ? Math.round((n(c.received) * 1000) / feed) / 10 : 0;
  return <td className="mt-clickable-cell" onClick={() => onOpen?.(row, stageKey)} title="Click for department detail / size-wise WIP entry">
    <div className="mt-stage-cell">
      <div className="mt-stage-top"><span className="mt-stage-title">{STAGE_BY_KEY[stageKey].short}</span><span className="mt-chip mt-muted">{pct}%</span>{c.extra ? <AlertTriangle size={13} color="var(--danger)"/> : null}</div>
      <div className="mt-cell-numbers">
        <span className="mt-num good">{fmt(c.received)}</span>
        <span className="mt-num open">{fmt(c.open)}</span>
        <span className="mt-num loss">{fmt(c.ram)}R</span>
        {c.extra ? <span className="mt-num extra">+{fmt(c.extra)}</span> : null}
      </div>
      <div className="mt-cell-note">{c.note} · {fmt(c.received)}/{fmt(feed || c.received)}</div>
    </div>
  </td>;
}

function bucketRowsForDrill(rows, predicate){
  const allSizes = allReportSizes(rows);
  return rows.flatMap(row => issueBuckets(row).filter(predicate).map(bucket => horizontalBucketRow(row, bucket, allSizes)));
}
function stageRowsForDrill(rows, stageKey){
  const allSizes = allReportSizes(rows);
  return rows.filter(row => routeFor(row).includes(stageKey)).map(row => horizontalStageRow(row, stageKey, allSizes));
}
function ownerRowsDetailed(rows, owner){
  const allSizes = allReportSizes(rows);
  return rows.flatMap(row => issueBuckets(row).filter(bucket => String(bucket.owner || "").split("+").map(x=>x.trim()).includes(owner)).map(bucket => horizontalBucketRow(row, bucket, allSizes)));
}
function styleRowsForDrill(rows, predicate){
  return rows.filter(predicate).map(row => {
    const rs = rowStatus(row);
    return {
      Order: row.order_no,
      Style: row.style_no,
      Buyer: row.buyer,
      Colour: row.colour,
      Component: row.component,
      Status: rs.status,
      Status_Breakup: statusText(row),
      Owner: rs.owner,
      Open_Qty: rs.qty,
      Idle_Days: rs.idle,
      Route: routeFor(row).map(stageLabel).join(" > "),
      Action: rs.action,
    };
  });
}
function dashboardDrillRows(rows, drill){
  if (!drill) return [];
  if (drill.kind === "all_styles") return styleRowsForDrill(rows, () => true);
  if (drill.kind === "open_qty") return bucketRowsForDrill(rows, b => b.type !== "extra_cut");
  if (drill.kind === "reconcile") return bucketRowsForDrill(rows, b => b.type === "reconcile");
  if (drill.kind === "issued_not_received") return bucketRowsForDrill(rows, b => b.type === "issued_not_received");
  if (drill.kind === "completed_not_issued") return bucketRowsForDrill(rows, b => b.type === "completed_not_issued");
  if (drill.kind === "received_not_processed") return bucketRowsForDrill(rows, b => b.type === "received_not_processed");
  if (drill.kind === "ram") return bucketRowsForDrill(rows, b => b.type === "ram");
  if (drill.kind === "coordinator") return bucketRowsForDrill(rows, b => String(b.owner || "").includes("Production Coordinator"));
  if (drill.kind === "stage") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type !== "extra_cut");
  if (drill.kind === "stage_open") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type !== "extra_cut");
  if (drill.kind === "issue_type") return bucketRowsForDrill(rows, b => b.type === drill.type);
  if (drill.kind === "dept_issue") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type === drill.type);
  if (drill.kind === "owner") return ownerRowsDetailed(rows, drill.owner);
  if (drill.kind === "period") return styleRowsForDrill(rows, () => true).map(r=>({ ...r, Period:drill.period || "snapshot" }));
  if (drill.kind === "meeting_focus") return bucketRowsForDrill(rows, b => b.type !== "extra_cut").slice(0, 50);
  return [];
}

function DrillKpi({ label, value, note, tone, onClick }){
  return <button type="button" className="mt-dash-card" onClick={onClick} style={{textAlign:"left"}}>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    <div className="note">{note}</div>
    {tone && <div style={{marginTop:8}}><span className={`mt-chip ${statusClass(tone)}`}>Drill</span></div>}
  </button>;
}
function Dashboard({ rows, ledger=[], onDrill }){
  const activityDate = latestActivityDate(ledger);
  const [selectedDate, setSelectedDate] = useState(activityDate);
  useEffect(()=>{ setSelectedDate(d => d || activityDate); }, [activityDate]);
  const cal = productionCalendar445(selectedDate || activityDate);
  const buckets = rows.flatMap(row => issueBuckets(row).map(bucket => ({ ...bucket, row })));
  const openBuckets = buckets.filter(b=>b.type!=="extra_cut");
  const openQty = openBuckets.reduce((a,b)=>a+n(b.qty),0);
  const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
  const issuedNotReceived = buckets.filter(b=>b.type==="issued_not_received").reduce((a,b)=>a+n(b.qty),0);
  const completedNotIssued = buckets.filter(b=>b.type==="completed_not_issued").reduce((a,b)=>a+n(b.qty),0);
  const receivedNotProcessed = buckets.filter(b=>b.type==="received_not_processed").reduce((a,b)=>a+n(b.qty),0);
  const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
  const deptRows = departmentCurrentRows(rows);
  const issueDeptRows = departmentIssueRows(rows);
  const ownerRows = ownerActivityRows(rows);
  const periodRows = dailyWeeklyMonthlyRows(rows, ledger, selectedDate || activityDate);
  const meetingRows = meetingFocusRows(rows);
  return <>
    <div className="mt-dash-grid">
      <DrillKpi label="Active Styles" value={rows.length} note="All styles in current dashboard filter." tone="info" onClick={()=>onDrill?.({kind:"all_styles", title:"Active Styles"})}/>
      <DrillKpi label="Total Open WIP" value={fmt(openQty)} note="Current bins only; quantity moves to next bin once issued/received." tone={openQty?"warn":"ok"} onClick={()=>onDrill?.({kind:"open_qty", title:"Total Open WIP — Current Bins"})}/>
      <DrillKpi label="Pending Receipt" value={fmt(issuedNotReceived)} note="Issued to dept but not received. Receiving HOD + Coordinator after 95%." tone={issuedNotReceived?"warn":"ok"} onClick={()=>onDrill?.({kind:"issued_not_received", title:"Pending Receipt"})}/>
      <DrillKpi label="Ready / Not Issued" value={fmt(completedNotIssued)} note="Completed but not issued forward. Coordinator + HOD follow-up." tone={completedNotIssued?"info":"ok"} onClick={()=>onDrill?.({kind:"completed_not_issued", title:"Ready / Not Issued"})}/>
      <DrillKpi label="With Department" value={fmt(receivedNotProcessed)} note="Received by department but not processed / issued ahead." tone={receivedNotProcessed?"info":"ok"} onClick={()=>onDrill?.({kind:"received_not_processed", title:"With Department"})}/>
      <DrillKpi label="Reconcile / Blocked" value={fmt(reconcile)} note="Total jump or impossible movement; manager approval only." tone={reconcile?"late":"ok"} onClick={()=>onDrill?.({kind:"reconcile", title:"Reconcile / Blocked"})}/>
    </div>
    <div className="mt-card" style={{marginBottom:12}}>
      <div className="mt-section"><h3 className="mt-panel-title">Daily / 4-4-5 Weekly / Monthly Production Numbers</h3><div className="mt-panel-sub">Calendar opens to the latest activity date. Daily = selected date. Weekly = 4-4-5 production week, Monday–Saturday. Monthly = exact calendar month dates. Rows are drillable.</div><div className="mt-toolbar" style={{marginTop:10}}><span className="mt-toolbar-label">Activity date</span><input className="mt-input mt-entry-date" type="date" value={selectedDate || activityDate} onChange={e=>setSelectedDate(e.target.value)} /><span className="mt-chip mt-info">{cal.fullLabel}</span><span className="mt-chip mt-muted">Calendar month {fullMonthLabel(parseYmd(selectedDate || activityDate))}</span></div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Period</th><th>Date Range</th><th>Cutting</th><th>Stitching Receiving</th><th>Checking</th><th>Packing</th><th>Dispatch</th><th>R/A/M</th><th>Rows</th></tr></thead><tbody>{periodRows.map(r=><tr key={r.period} className="drillable" onClick={()=>onDrill?.({kind:"period", period:r.period, title:`${r.Period} Production Numbers`})}><td><b>{r.Period}</b></td><td>{r.Date_Range}</td><td>{fmt(r.Cutting)}</td><td>{fmt(r.Stitching_Receiving)}</td><td>{fmt(r.Checking)}</td><td>{fmt(r.Packing)}</td><td>{fmt(r.Dispatch)}</td><td>{fmt(r.RAM)}</td><td>{r.Rows}</td></tr>)}</tbody></table></div>
    </div>
    <div className="mt-mini-board">
      <SimpleTable title="Department WIP — Current Bins" sub="Correct bin logic: once a stage activity moves on, the qty leaves that old bin and appears only in the next active bin. Rows are drillable by department." rows={deptRows.map(({stage,...r})=>r)} empty="No department WIP." onRowClick={(r)=>{ const match = deptRows.find(x=>x.Dept===r.Dept); onDrill?.({kind:"stage", stage:match?.stage, title:`${r.Dept} Current WIP Bins`}); }}/>
      <SimpleTable title="Department × Issue Type Board" sub="Issue type without department is not useful; this shows exactly which department has which issue. Rows drill to style/size detail." rows={issueDeptRows.map(({stage,type,...r})=>r)} empty="No open issue by department." onRowClick={(r)=>{ const match = issueDeptRows.find(x=>x.Dept===r.Dept && x.Issue===r.Issue); onDrill?.({kind:"dept_issue", stage:match?.stage, type:match?.type, title:`${r.Dept} — ${r.Issue}`}); }}/>
      <SimpleTable title="Owner Activity Board" sub="Owner-wise breakup separates normal production WIP, R/A/M and reconciliation so chase is clear." rows={ownerRows.slice(0,10)} empty="No owner activity." onRowClick={(r)=>onDrill?.({kind:"owner", owner:r.Owner, title:`Owner Activity — ${r.Owner}`})}/>
    </div>
    <div style={{marginTop:12}}>
      <SimpleTable title="Production Meeting Focus" sub="Replaces confusing critical buckets. Use this list in the meeting: blocker first, then biggest open qty × idle days." rows={meetingRows} empty="No open meeting focus rows." onRowClick={()=>onDrill?.({kind:"meeting_focus", title:"Production Meeting Focus"})}/>
    </div>
  </>;
}

function DashboardDrillDrawer({ drill, rows, onClose }){
  if (!drill) return null;
  const detailRows = dashboardDrillRows(rows, drill);
  const totalQty = detailRows.reduce((a,r)=>a+n(r.Total_Open ?? r.Open_Qty ?? r.Open ?? r.Gap ?? r.Total ?? r.Qty),0);
  return <div className="mt-drawer">
    <div className="mt-drawer-head"><div><h2 style={{margin:"0 0 4px"}}>{drill.title || "Dashboard Drilldown"}</h2><div className="mt-sub">Every dashboard number opens to its underlying horizontal style/size rows.</div></div><button className="mt-btn" onClick={onClose}><X size={15}/>Close</button></div>
    <div className="mt-drawer-body">
      <div className="mt-drill-head"><div><h3 className="mt-panel-title">Drilldown Detail</h3><div className="mt-panel-sub">Rows: {detailRows.length}. Total open / relevant qty: {fmt(totalQty)}.</div><div className="mt-drill-meta"><span className="mt-chip mt-info">Horizontal format</span><span className="mt-chip mt-muted">Filter-respecting</span><span className="mt-chip mt-muted">Exportable from Reports</span></div></div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{(detailRows[0] ? Object.keys(detailRows[0]) : ["Note"]).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{detailRows.length ? detailRows.map((r,i)=><tr key={i}>{Object.keys(detailRows[0]).map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}</tr>) : <tr><td style={{padding:18}}>No rows for this drilldown.</td></tr>}</tbody></table></div>
    </div>
  </div>;
}

function WipStatus({ rows, onOpen }){
  const [localSearch,setLocalSearch] = useState("");
  const [dept,setDept] = useState("all");
  const [issue,setIssue] = useState("all");
  const [owner,setOwner] = useState("all");
  const [route,setRoute] = useState("all");
  const [sizeBreak,setSizeBreak] = useState(false);
  const [sort,setSort] = useState({ key:"open", dir:"desc" });
  const owners = ["all", ...uniqueList(rows.flatMap(rowOwnerNames))];
  const searchText = localSearch.trim().toLowerCase();
  const filtered = rows.filter(row=>{
    const routeOk = route === "all" || routeType(row) === route;
    const deptOk = dept === "all" || routeFor(row).includes(dept);
    const issueOk = rowMatchesBucketFilter(row, issue);
    const ownerOk = owner === "all" || rowOwnerNames(row).includes(owner);
    const text = [row.order_no,row.style_no,row.buyer,row.colour,row.component,statusText(row),rowStatus(row).owner,routeType(row)].join(" ").toLowerCase();
    const searchOk = !searchText || text.includes(searchText);
    return routeOk && deptOk && issueOk && ownerOk && searchOk;
  }).sort((a,b)=>{
    const av = compareValue(a, sort.key), bv = compareValue(b, sort.key);
    const res = typeof av === "number" || typeof bv === "number" ? n(av)-n(bv) : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? res : -res;
  });
  const allBuckets = rows.flatMap(row=>issueBuckets(row).map(bucket=>({row,bucket}))).filter(x=>x.bucket.type!=="extra_cut");
  const summary = [
    { key:"all", label:"All", value:rows.length, note:"visible styles" },
    { key:"completed_not_issued", label:"Ready for Next Dept", value:allBuckets.filter(x=>x.bucket.type==="completed_not_issued").reduce((a,x)=>a+n(x.bucket.qty),0), note:"completed not issued" },
    { key:"issued_not_received", label:"Pending Receipt", value:allBuckets.filter(x=>x.bucket.type==="issued_not_received").reduce((a,x)=>a+n(x.bucket.qty),0), note:"issued but not received" },
    { key:"received_not_processed", label:"With Department", value:allBuckets.filter(x=>x.bucket.type==="received_not_processed").reduce((a,x)=>a+n(x.bucket.qty),0), note:"received not processed" },
    { key:"reconcile", label:"Reconcile", value:allBuckets.filter(x=>x.bucket.type==="reconcile").reduce((a,x)=>a+n(x.bucket.qty),0), note:"total jump / mismatch" },
  ];
  const selectedDeptForSize = dept === "all" ? null : dept;
  return <div className="mt-card">
    <div className="mt-section"><h3 className="mt-panel-title">Live WIP Status</h3><div className="mt-panel-sub">Page-specific WIP filters, sortable columns, quick status buckets, and optional size breakup. Click status, owner, action, or any department cell for drilldown. Main department cells stay simple: received/done · open · R/A/M.</div></div>
    <div className="mt-section no-print">
      <div className="mt-summary-strip">{summary.map(s=><button key={s.key} className={`mt-summary-tile ${issue===s.key || (s.key==="all"&&issue==="all") ? "active" : ""}`} onClick={()=>setIssue(s.key)}><div className="label">{s.label}</div><div className="value">{typeof s.value === "number" && s.key!=="all" ? fmt(s.value) : s.value}</div><div className="mt-small">{s.note}</div></button>)}</div>
      <div className="mt-filter-row">
        <div className="mt-filter-group"><span className="mt-toolbar-label">WIP Search</span><Search size={14}/><input className="mt-input" value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="style / order / status / owner" style={{minWidth:230}}/></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Issue</span><select className="mt-select" value={issue} onChange={e=>setIssue(e.target.value)}><option value="all">All open/closed</option><option value="completed_not_issued">Ready for next dept</option><option value="issued_not_received">Pending receipt</option><option value="received_not_processed">With department</option><option value="ram">R/A/M</option><option value="reconcile">Reconcile</option><option value="closed">Closed / balanced</option></select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Owner</span><select className="mt-select" value={owner} onChange={e=>setOwner(e.target.value)}>{owners.map(o=><option key={o} value={o}>{o === "all" ? "All owners" : o}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Route</span><select className="mt-select" value={route} onChange={e=>setRoute(e.target.value)}><option value="all">All routes</option><option>Plain</option><option>Print</option><option>Embroidery</option><option>Print + Emb</option></select></div>
        <button className={`mt-btn ${sizeBreak?"primary":"ghost"}`} onClick={()=>setSizeBreak(v=>!v)}><Layers size={14}/>Size breakup</button>
        <button className="mt-btn ghost" onClick={()=>{setLocalSearch("");setDept("all");setIssue("all");setOwner("all");setRoute("all");setSort({key:"open",dir:"desc"});}}>Reset</button>
        <span className="mt-page-filter-note">{filtered.length} rows · WIP filters are page-specific</span>
      </div>
    </div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><SortTh sticky label="Style" sortKey="style" sort={sort} setSort={setSort}/><SortTh label="Status / Current" sortKey="status" sort={sort} setSort={setSort}/><SortTh label="Owner" sortKey="owner" sort={sort} setSort={setSort}/><SortTh label="Route" sortKey="route" sort={sort} setSort={setSort}/>{STAGES.map(s=><th key={s.key}>{s.short}</th>)}<SortTh label="Open" sortKey="open" sort={sort} setSort={setSort}/><SortTh label="Idle" sortKey="idle" sort={sort} setSort={setSort}/><th>Next Action</th></tr></thead><tbody>
      {filtered.map(row => { const rs = rowStatus(row); const sizeStage = selectedDeptForSize || rs.stage; const openRowDrill = () => onOpen?.(row, rs.stage || routeFor(row)[0] || "cutting"); return <React.Fragment key={row.id}>
        <tr>
          <td className="mt-sticky mt-clickable-cell" onClick={openRowDrill} title="Click to open style/current status drilldown"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{row.set_id ? <span className="mt-chip mt-purple"><Layers size={11}/>Set {row.set_id}</span> : null}<div className="mt-drill-hint">Open detail</div></div></div></td>
          <td className="mt-clickable-cell" onClick={openRowDrill} title="Click to open status/current bucket drilldown"><StatusCell row={row}/><div className="mt-small">Idle {rs.idle}d</div><div className="mt-drill-hint">Drill status</div></td>
          <td className="mt-clickable-cell" onClick={openRowDrill} title="Click to open owner/current WIP drilldown"><b>{rs.owner}</b>{rs.support ? <div className="mt-small">Support: {rs.support}</div> : null}<div className="mt-drill-hint">Drill owner</div></td>
          <td className="mt-clickable-cell" onClick={openRowDrill} title="Click to open route/stage detail"><span className="mt-chip mt-info">{routeType(row)}</span><div style={{marginTop:4}}>{routeFor(row).map(k=><span key={k} className="mt-chip mt-muted" style={{margin:"0 3px 3px 0"}}>{STAGE_BY_KEY[k].short}</span>)}</div><div className="mt-drill-hint">Drill route</div></td>
          {STAGES.map(s=><StageCell key={s.key} row={row} stageKey={s.key} onOpen={onOpen}/>) }
          <td className="mt-clickable-cell" onClick={openRowDrill}><b>{fmt(rs.qty)}</b></td><td className="mt-clickable-cell" onClick={openRowDrill}>{rs.idle}d</td><td className="mt-clickable-cell" onClick={openRowDrill}>{rs.action}<div className="mt-drill-hint">Drill action</div></td>
        </tr>
        {sizeBreak && <tr className="mt-subrow"><td colSpan={STAGES.length + 8}><SizeBreakupStrip row={row} stage={sizeStage}/></td></tr>}
      </React.Fragment>;})}
      {!filtered.length && <tr><td colSpan={STAGES.length + 8} style={{padding:18}}>No rows match current WIP filters.</td></tr>}
    </tbody></table></div>
    <div className="mt-section"><span className="mt-chip mt-ok">Green = received/done</span> <span className="mt-chip mt-warn">Yellow = open balance</span> <span className="mt-chip mt-late">Red = rejection/alter/missing</span> <span className="mt-chip mt-purple">Purple = extra/override marker</span></div>
  </div>;
}


function ownerRowsFromBuckets(buckets){
  const map = new Map();
  buckets.filter(b=>b.type!=="extra_cut" || b.qty>0).forEach(b=>{
    const owners = String(b.owner || "Unassigned").split("+").map(x=>x.trim()).filter(Boolean);
    owners.forEach(owner=>{
      const old = map.get(owner) || { Owner:owner, OpenStyles:new Set(), OpenQty:0, OldestIdle:0, Critical:0, MainReason:"" };
      old.OpenStyles.add(`${b.stage}-${b.status}`);
      old.OpenQty += n(b.qty);
      old.OldestIdle = Math.max(old.OldestIdle, n(b.idle));
      if (b.type === "reconcile") old.Critical += 1;
      old.MainReason = old.MainReason || b.status;
      map.set(owner, old);
    });
  });
  return Array.from(map.values()).map(x=>({ Owner:x.Owner, OpenStyles:x.OpenStyles.size, OpenQty:x.OpenQty, OldestIdle:`${x.OldestIdle}d`, Critical:x.Critical, MainReason:x.MainReason })).sort((a,b)=>n(b.OpenQty)-n(a.OpenQty));
}
function WhoToChase({ rows }){
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [q, setQ] = useState("");
  const [issue, setIssue] = useState("all");
  const [dept, setDept] = useState("all");
  const search = q.trim().toLowerCase();
  const baseBuckets = rows.flatMap(row => issueBuckets(row).map(b=>({ ...b, row })) ).filter(b=>b.type!=="extra_cut" || b.qty>0);
  const buckets = baseBuckets.filter(b=>{
    const okIssue = issue === "all" || b.type === issue;
    const okDept = dept === "all" || b.stage === dept;
    const hay = [b.owner,b.status,b.action,b.row.style_no,b.row.order_no,b.row.buyer,b.row.colour,b.row.component,stageLabel(b.stage)].join(" ").toLowerCase();
    const okSearch = !search || hay.includes(search);
    return okIssue && okDept && okSearch;
  });
  const ownerRows = ownerRowsFromBuckets(buckets);
  const ownersToShow = selectedOwner ? [selectedOwner] : ownerRows.map(r=>r.Owner);
  const detailBuckets = buckets.flatMap(b=>String(b.owner).split("+").map(owner=>({ ...b, ownerName:owner.trim() }))).filter(b=>ownersToShow.includes(b.ownerName));
  return <>
    <div className="mt-card no-print" style={{marginBottom:12}}>
      <div className="mt-section">
        <div className="mt-filter-row">
          <span className="mt-toolbar-label">Owner Chase Filters</span>
          <Search size={14}/><input className="mt-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="owner / style / status / action" style={{minWidth:250}}/>
          <select className="mt-select" value={issue} onChange={e=>{setIssue(e.target.value); setSelectedOwner(null);}}>
            <option value="all">All issue types</option>
            <option value="issued_not_received">Pending Receipt</option>
            <option value="completed_not_issued">Ready / Not Issued</option>
            <option value="received_not_processed">With Department</option>
            <option value="ram">Reject / Alter / Missing</option>
            <option value="reconcile">Reconcile</option>
          </select>
          <select className="mt-select" value={dept} onChange={e=>{setDept(e.target.value); setSelectedOwner(null);}}>
            <option value="all">All departments</option>
            {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {selectedOwner && <button className="mt-btn ghost" onClick={()=>setSelectedOwner(null)}>Show all owners</button>}
          <span className="mt-page-filter-note">{ownerRows.length} owners · {detailBuckets.length} chase rows</span>
        </div>
      </div>
    </div>
    <div className="mt-two">
      <SimpleTable title="Owner Chase Summary" sub="Click an owner to drill the detail list. Production Coordinator + Department HOD can both appear on the same issue when needed." rows={ownerRows} empty="No owner chase." onRowClick={(r)=>setSelectedOwner(r.Owner)} />
      <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Owner Chase Detail {selectedOwner ? `— ${selectedOwner}` : "— All Owners"}</h3><div className="mt-panel-sub">Individual owner chase is calculated from issue type, receiving %, and stage owner. Closure follow-up stays with Production Coordinator; Production Manager is escalation/WIP approval only.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Owner</th><th>Style</th><th>Status</th><th>Stage</th><th>Qty</th><th>%</th><th>Idle</th><th>Action</th></tr></thead><tbody>{detailBuckets.length ? detailBuckets.map((b,idx)=><tr key={`${b.row.id}-${b.type}-${b.ownerName}-${idx}`}><td><b>{b.ownerName}</b></td><td>{b.row.style_no}<div className="mt-small">{b.row.order_no} · {b.row.colour} · {b.row.component}</div></td><td><span className={`mt-chip ${statusClass(b.tone)}`}>{b.status}</span></td><td>{stageLabel(b.stage)}</td><td>{fmt(b.qty)}</td><td>{bucketPct(b.row,b)}%</td><td>{b.idle || 0}d</td><td>{b.action}</td></tr>) : <tr><td colSpan="8" style={{padding:18}}>No chase rows for current filters.</td></tr>}</tbody></table></div></div>
    </div>
  </>;
}

function cumulativeAllowedTotal(row, stage, field){
  if (stage === "cutting") return n(row.order_qty) * 1.08;
  if (field === "received") return stageFeed(row, stage);
  if (field === "output") return n(sdata(row, stage).received);
  if (field === "issued") return n(sdata(row, stage).output);
  return stageFeed(row, stage) || n(sdata(row,stage).received) || n(row.order_qty);
}
function changedSizeRows(row, stage, field, getVal){
  return sizesFor(row).map(size => {
    const oldQty = sizeMatrix(row, stage, field).find(x=>x.size===size)?.qty || 0;
    const newQty = n(getVal(row,size));
    return newQty !== oldQty ? { row, size, oldQty, newQty, delta:newQty-oldQty } : null;
  }).filter(Boolean);
}
function applyCumulativeSizeEdits({ rows, targetRows, stage, field, getVal }){
  const targetIds = new Set(targetRows.map(r=>r.id));
  return rows.map(row => {
    if (!targetIds.has(row.id)) return row;
    const sizes = Object.fromEntries(sizesFor(row).map(size=>[size, n(getVal(row,size))]));
    const total = Object.values(sizes).reduce((a,b)=>a+n(b),0);
    const stages = { ...(row.stages || {}) };
    stages[stage] = { ...blankStage(), ...sdata(row,stage), [field]:total };
    return { ...row, stages, size_stage:{ ...(row.size_stage||{}), [stage]:{ ...(row.size_stage?.[stage]||{}), [field]:sizes } } };
  });
}
function buildLedgerRows({ changes, stage, field, entryDate, reason, source }){
  const risk = backdateRisk(entryDate);
  const created = new Date().toISOString();
  return changes.map(c => ({
    id:uid("led"),
    entry_date:entryDate,
    created_at:created,
    order_no:c.row.order_no,
    style_no:c.row.style_no,
    buyer:c.row.buyer,
    colour:c.row.colour,
    component:c.row.component,
    size:c.size,
    stage,
    dept:stageLabel(stage),
    entry_type:entryTypeForField(field),
    qty:c.delta,
    old_qty:c.oldQty,
    new_qty:c.newQty,
    is_backdated:risk.days > 0,
    backdate_reason:risk.days > 0 ? reason : "",
    approval_status:risk.approval,
    entry_source:source,
    validation_scope:"size_wise_as_of_entry_date",
    remarks:`${source}: cumulative size-cell edit. Entry date ${entryDate}; actual saved ${created.slice(0,10)}.`
  }));
}
async function saveLedgerToSupabase(newLedger, field){
  if (!isSupabaseConfigured || !supabase || !newLedger.length) return;
  const payload = newLedger.map(({id,...x})=>({
    ...x,
    qty:n(x.qty),
    good_qty:field==="output" ? n(x.qty) : 0,
    validation_snapshot:{ old_qty:x.old_qty, new_qty:x.new_qty, entry_source:x.entry_source, is_backdated:x.is_backdated, approval_status:x.approval_status }
  }));
  const { error } = await supabase.from("production_entries").insert(payload);
  if(error) console.warn(error);
}
function SizeCumulativeEditor({ row, rows, setRows, ledger, setLedger, stage, initialField="received", source="wip_cell", onSaved }){
  const [field, setField] = useState(initialField);
  const [entryDate, setEntryDate] = useState(latestActivityDate(ledger));
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState({});
  useEffect(()=>setDraft({}), [row?.id, stage, field]);
  if (!row) return null;
  const sizes = sizesFor(row);
  function getVal(_, size){
    const key = `${row.id}|${size}`;
    if (draft[key] !== undefined) return draft[key];
    return sizeMatrix(row, stage, field).find(x=>x.size===size)?.qty || 0;
  }
  function setVal(size, value){ setDraft(d=>({ ...d, [`${row.id}|${size}`]:String(value).replace(/[^0-9]/g,"") })); }
  const oldTotal = sizeMatrix(row, stage, field).reduce((a,x)=>a+n(x.qty),0);
  const newTotal = sizes.reduce((a,size)=>a+n(getVal(row,size)),0);
  const allowed = cumulativeAllowedTotal(row, stage, field);
  const totalJump = stage !== "cutting" && newTotal > allowed;
  const overCut = stage === "cutting" && newTotal > n(row.order_qty);
  const changes = changedSizeRows(row, stage, field, getVal);
  const risk = backdateRisk(entryDate);
  const needsReason = risk.days > 0;
  const reasonMissing = needsReason && !reason.trim();
  function save(){
    if (!changes.length) { alert("No size change to save."); return; }
    if (reasonMissing) { alert("Backdated entry needs a reason before save."); return; }
    if (totalJump) { alert("Blocked: downstream total jump is not allowed. Correct cutting/opening stock or create approved adjustment first."); return; }
    const newLedger = buildLedgerRows({ changes, stage, field, entryDate, reason, source });
    setRows(prev => applyCumulativeSizeEdits({ rows:prev, targetRows:[row], stage, field, getVal }));
    setLedger(prev => [...newLedger, ...prev]);
    saveLedgerToSupabase(newLedger, field);
    setDraft({});
    onSaved?.(newLedger);
  }
  return <div className="mt-edit-panel">
    <div className="mt-edit-panel-head">
      <h3 className="mt-panel-title">Editable WIP Cell → Size-wise Cumulative Entry</h3>
      <div className="mt-panel-sub">Editing here does not overwrite totals directly. It calculates the size-wise delta and writes production ledger rows using the selected entry date.</div>
    </div>
    <div className="mt-section no-print"><div className="mt-backdate-box">
      <span className="mt-toolbar-label">Entry Date</span><input className="mt-input mt-entry-date" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} />
      <span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span>
      <span className="mt-toolbar-label">Field</span><select className="mt-select" value={field} onChange={e=>setField(e.target.value)}><option value="received">Receive cumulative</option><option value="output">Completed/output cumulative</option><option value="issued">Issued forward cumulative</option></select>
      {needsReason && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate reason required" style={{minWidth:250}} />}
    </div>{risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated date: this version records it as manager approval required. In live ERP we will enforce approval by role and validate stock/WIP as-of this date before posting.</div>}</div>
    <div className="mt-section"><div className="mt-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))"}}><Kpi label="Allowed as-of date" value={fmt(allowed)} note={stage === "cutting" ? "Cutting can overcut within tolerance" : "Checked against previous active route/stage"}/><Kpi label="Old cumulative" value={fmt(oldTotal)} note="Current value before edit"/><Kpi label="New cumulative" value={fmt(newTotal)} note={`Delta ${fmt(newTotal-oldTotal)}`} tone={totalJump?"late":overCut?"purple":changes.length?"warn":"ok"}/><Kpi label="Validation" value={totalJump?"Blocked":"OK"} note={totalJump?"Downstream total jump not allowed":"Size-wise delta will be saved"} tone={totalJump?"late":"ok"}/></div></div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Size</th><th>Previous</th><th>New Cumulative</th><th>Delta</th><th>Status</th></tr></thead><tbody>{sizes.map(size=>{ const oldQty=sizeMatrix(row,stage,field).find(x=>x.size===size)?.qty||0; const newQty=n(getVal(row,size)); const delta=newQty-oldQty; return <tr key={size}><td><b>{size}</b></td><td>{fmt(oldQty)}</td><td><input className={`mt-cell-input ${draft[`${row.id}|${size}`]!==undefined?"dirty":""} ${totalJump?"blocked":""}`} value={getVal(row,size)} onChange={e=>setVal(size,e.target.value)} /></td><td className={delta<0?"mt-delta-neg":"mt-delta-pos"}>{delta>0?"+":""}{fmt(delta)}</td><td>{delta ? <span className="mt-chip mt-warn">Changed</span> : <span className="mt-chip mt-muted">No change</span>}</td></tr>;})}</tbody></table></div>
    <div className="mt-section no-print"><button className="mt-btn primary" onClick={save} disabled={!changes.length || totalJump || reasonMissing}><CheckCircle2 size={14}/>Save Size-wise Entry</button> <span className="mt-small">Qty check is applied size-wise and total-wise. Backdated entries store entry date + actual created time for audit.</span></div>
  </div>;
}
function QuickEntry({ rows, setRows, ledger, setLedger }){
  const [stage, setStage] = useState("stitching");
  const [field, setField] = useState("received");
  const [entryDate, setEntryDate] = useState(latestActivityDate(ledger));
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState({});
  const activeRows = rows.filter(r => routeFor(r).includes(stage));
  const risk = backdateRisk(entryDate);
  function getVal(row, size){
    const key = `${row.id}|${size}`;
    if (draft[key] !== undefined) return draft[key];
    const matrix = sizeMatrix(row, stage, field);
    return matrix.find(x=>x.size===size)?.qty || 0;
  }
  function setVal(row, size, val){ setDraft(d => ({ ...d, [`${row.id}|${size}`]: val.replace(/[^0-9]/g,'') })); }
  function rowNewTotal(row){ return sizesFor(row).reduce((a,s)=>a+n(getVal(row,s)),0); }
  function rowOldTotal(row){ return sizeMatrix(row, stage, field).reduce((a,x)=>a+n(x.qty),0); }
  function validate(row){
    const total = rowNewTotal(row);
    const old = rowOldTotal(row);
    const allowed = cumulativeAllowedTotal(row, stage, field);
    const totalJump = stage !== "cutting" && total > allowed;
    const overCut = stage === "cutting" && total > n(row.order_qty);
    return { total, old, allowed, totalJump, overCut, delta:total-old };
  }
  function save(){
    const changed = activeRows.flatMap(row => changedSizeRows(row, stage, field, getVal));
    const blocked = activeRows.filter(r=>validate(r).totalJump);
    if (blocked.length) { alert(`Blocked: ${blocked.length} row(s) have downstream total jump. Correct cutting/opening stock or create approved adjustment first.`); return; }
    if (risk.days > 0 && !reason.trim()) { alert("Backdated entry needs a reason before save."); return; }
    if (!changed.length) { alert("No changed size cells to save."); return; }
    setRows(prev => applyCumulativeSizeEdits({ rows:prev, targetRows:activeRows, stage, field, getVal }));
    const newLedger = buildLedgerRows({ changes:changed, stage, field, entryDate, reason, source:"dpr_quick_entry" });
    setLedger(prev => [...newLedger, ...prev]);
    saveLedgerToSupabase(newLedger, field);
    setDraft({});
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">DPR Quick Entry — Horizontal Size Matrix</h3><div className="mt-panel-sub">Option A: user edits cumulative size cells like Excel. The app calculates delta and stores size-level ledger entries with selected entry date.</div></div>
    <div className="mt-section no-print"><div className="mt-toolbar"><span className="mt-toolbar-label">Entry Setup</span><input className="mt-input mt-entry-date" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /><span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span><select className="mt-select" value={stage} onChange={e=>{setStage(e.target.value); setDraft({});}}>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select><select className="mt-select" value={field} onChange={e=>{setField(e.target.value); setDraft({});}}><option value="received">Receive cumulative</option><option value="output">Completed/output cumulative</option><option value="issued">Issued forward cumulative</option></select>{risk.days>0 && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate reason required" style={{minWidth:240}}/>}<button className="mt-btn primary" onClick={save}><CheckCircle2 size={14}/>Save Changed Cells</button></div>{risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated entries are recorded as manager-approval-required. Future live procurement/stores/production stock checks must validate availability as-of the selected date before posting.</div>}</div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Allowed</th><th>Old Total</th>{Array.from(new Set(activeRows.flatMap(sizesFor))).map(sz=><th key={sz}>{sz}</th>)}<th>New Total</th><th>Validation</th></tr></thead><tbody>{activeRows.map(row=>{ const sizes = sizesFor(row); const allSizes = Array.from(new Set(activeRows.flatMap(sizesFor))); const v=validate(row); return <tr key={row.id}><td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.colour} · {row.component}</div></div></div></td><td>{fmt(v.allowed)}</td><td>{fmt(v.old)}</td>{allSizes.map(sz=> sizes.includes(sz) ? <td key={sz}><input className={`mt-cell-input ${draft[`${row.id}|${sz}`]!==undefined?"dirty":""} ${v.totalJump?"blocked":""}`} value={getVal(row,sz)} onChange={e=>setVal(row,sz,e.target.value)} /></td> : <td key={sz} className="mt-small">—</td>)}<td><b>{fmt(v.total)}</b><div className="mt-small">Δ {fmt(v.delta)}</div></td><td>{v.totalJump ? <span className="mt-chip mt-late">Blocked total jump</span> : v.overCut ? <span className="mt-chip mt-purple">Extra cut warning</span> : v.delta ? <span className="mt-chip mt-warn">Changed</span> : <span className="mt-chip mt-ok">OK</span>}<div className="mt-small">{stage==="cutting"?"Cutting can overcut within tolerance":"Qty checked against previous active route/stage"}</div></td></tr>;})}</tbody></table></div>
  </div>;
}

function ProcessRoutes({ rows, setRows }){
  function toggle(rowId, key){
    setRows(prev=>prev.map(r=>{
      if (r.id !== rowId) return r;
      const next = { ...r, [key]:!r[key] };
      next.route = routeFor(next);
      next.stages = { ...next.stages };
      next.route.forEach(k=>{ if(!next.stages[k]) next.stages[k]=blankStage(); });
      return next;
    }));
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style-wise Print / Embroidery Route Toggles</h3><div className="mt-panel-sub">Same idea as Merch Tracker optional stages. Validation follows the active route, not hard-coded columns.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Print Required</th><th>Embroidery Required</th><th>Active Route</th><th>Rule</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.colour} · {row.component}</div></td><td><button className={`mt-btn ${row.print_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"print_required")}>{row.print_required?"Print ON":"Print OFF"}</button></td><td><button className={`mt-btn ${row.embroidery_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"embroidery_required")}>{row.embroidery_required?"Emb ON":"Emb OFF"}</button></td><td>{routeFor(row).map(k=><span className="mt-chip mt-muted" key={k} style={{marginRight:4}}>{STAGE_BY_KEY[k].short}</span>)}</td><td>Next stage check uses previous active route stage.</td></tr>)}</tbody></table></div></div>;
}

function sheetCell(row, stageKey){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return "SKIP";
  const suffix = c.extra ? ` / +${fmt(c.extra)}` : "";
  return `${fmt(c.received)} / ${fmt(c.open)} / ${fmt(c.ram)}R${suffix}`;
}
function allReportSizes(rows){
  const preferred = ["XS","S","M","L","XL","XXL","2-3Y","3-4Y","4-5Y","5-6Y","7-8Y","9-10Y","30","32","34","36","38"];
  const seen = new Set(rows.flatMap(sizesFor));
  return preferred.filter(s => seen.has(s)).concat(Array.from(seen).filter(s => !preferred.includes(s)).sort());
}
function withHorizontalSizes(row, qtyBySize, allSizes){
  return Object.fromEntries(allSizes.map(size => [size, n(qtyBySize?.[size]) || 0]));
}
function horizontalStageRow(row, stageKey, allSizes){
  const c = cellBreakup(row, stageKey);
  const st = sdata(row, stageKey);
  const sizeQty = Object.fromEntries(sizeMatrix(row, stageKey, stageKey === "cutting" ? "received" : "received").map(x => [x.size, x.qty]));
  const rs = rowStatus(row);
  return {
    Order: row.order_no,
    Style: row.style_no,
    Buyer: row.buyer,
    Colour: row.colour,
    Component: row.component,
    Set_ID: row.set_id || "",
    Dept_Stage: stageLabel(stageKey),
    Status: rs.status,
    Owner: rs.owner,
    Action: rs.action,
    ...withHorizontalSizes(row, sizeQty, allSizes),
    Total_Received_Done: c.received,
    Open: c.open,
    Reject: n(st.reject),
    Alter: n(st.alter),
    Missing: n(st.missing),
    RAM_Total: c.ram,
    Idle_Days: n(st.idle),
    Feed_Qty: stageKey === "cutting" ? n(row.order_qty) : stageFeed(row, stageKey),
    Cell_View: sheetCell(row, stageKey),
  };
}
function horizontalBucketRow(row, bucket, allSizes){
  const qtyBySize = distribute(n(bucket.qty), sizesFor(row));
  return {
    Owner: bucket.owner,
    Support: bucket.support || "",
    Status: bucket.status,
    Dept_Stage: stageLabel(bucket.stage),
    Order: row.order_no,
    Style: row.style_no,
    Buyer: row.buyer,
    Colour: row.colour,
    Component: row.component,
    Set_ID: row.set_id || "",
    ...withHorizontalSizes(row, qtyBySize, allSizes),
    Total_Open: n(bucket.qty),
    Idle_Days: n(bucket.idle),
    Action: bucket.action,
  };
}
function buildReportSheets(rows, ledger){
  const allSizes = allReportSizes(rows);
  const allBuckets = rows.flatMap(row => issueBuckets(row).map(bucket => ({ row, bucket })));
  const activeStageRows = STAGES.flatMap(stage => rows.filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)));
  const deptSheets = STAGES.map(stage => ({
    name: `${stage.short} WIP`,
    rows: rows.filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)),
  }));
  const factorySummary = STAGES.map(stage => {
    const stageRows = rows.filter(row => routeFor(row).includes(stage.key));
    const received = stageRows.reduce((a,row)=>a+cellBreakup(row, stage.key).received,0);
    const open = stageRows.reduce((a,row)=>a+cellBreakup(row, stage.key).open,0);
    const ram = stageRows.reduce((a,row)=>a+cellBreakup(row, stage.key).ram,0);
    const reconcile = stageRows.reduce((a,row)=>a+Math.max(0, cellBreakup(row, stage.key).extra),0);
    return { Dept: stage.label, Styles: stageRows.length, Received_Done: received, Open, RAM_Total: ram, Reconcile_Over: reconcile, Main_Owner: stage.owner };
  });
  const wipStatus = rows.map(row => {
    const rs = rowStatus(row);
    return {
      Order: row.order_no,
      Style: row.style_no,
      Buyer: row.buyer,
      Colour: row.colour,
      Component: row.component,
      Set_ID: row.set_id || "",
      Photo_URL: row.photo_url || "",
      Current_Status: rs.status, Status_Breakup: statusText(row),
      Current_Owner: rs.owner,
      Open_Qty: rs.qty,
      Idle_Days: rs.idle,
      Next_Action: rs.action,
      Route: routeFor(row).map(stageLabel).join(" > "),
      Cut: sheetCell(row, "cutting"),
      Print: routeFor(row).includes("printing") ? sheetCell(row, "printing") : "SKIP",
      Embroidery: routeFor(row).includes("embroidery") ? sheetCell(row, "embroidery") : "SKIP",
      Stitch: sheetCell(row, "stitching"),
      Check: sheetCell(row, "checking"),
      Iron: sheetCell(row, "iron"),
      Pack: sheetCell(row, "packing"),
      Dispatch: sheetCell(row, "dispatch"),
    };
  });
  const bucketSheet = (type) => allBuckets.filter(x => x.bucket.type === type).map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const ramRows = allBuckets.filter(x => x.bucket.type === "ram").map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const ownerRows = allBuckets.filter(x => x.bucket.type !== "extra_cut").map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const processRows = STAGES.filter(s => ["printing","embroidery"].includes(s.key)).flatMap(stage => rows.filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)));
  const partyRows = STAGES.flatMap(stage => rows.filter(row => routeFor(row).includes(stage.key) && sdata(row, stage.key).party).map(row => ({
    Party: sdata(row, stage.key).party,
    Process: stage.label,
    ...horizontalStageRow(row, stage.key, allSizes),
  })));
  const dispatchRows = rows.map(row => horizontalStageRow(row, "dispatch", allSizes));
  const monthlyRows = rows.map(row => {
    const rs = rowStatus(row);
    return {
      Month: today().slice(0,7),
      Buyer: row.buyer,
      Order: row.order_no,
      Style: row.style_no,
      Colour: row.colour,
      Component: row.component,
      ...withHorizontalSizes(row, Object.fromEntries(sizeMatrix(row, "stitching", "received").map(x=>[x.size,x.qty])), allSizes),
      Stitched_Total: cellBreakup(row,"stitching").received,
      Packed_Total: cellBreakup(row,"packing").received,
      Dispatched_Total: cellBreakup(row,"dispatch").received,
      Current_Status: rs.status,
      Owner: rs.owner,
      Open_Qty: rs.qty,
    };
  });
  const ledgerRows = (ledger || []).map(x => ({
    Entry_Date: x.entry_date || x.entryDate || "",
    Created_At: x.created_at || x.createdAt || "",
    Source: x.source || "",
    Order: x.order_no || x.order || "",
    Style: x.style_no || x.style || "",
    Colour: x.colour || "",
    Component: x.component || "",
    Stage: x.stage || "",
    Size: x.size || "",
    Old_Qty: x.old_qty ?? x.oldQty ?? "",
    New_Qty: x.new_qty ?? x.newQty ?? "",
    Delta: x.qty ?? x.delta ?? "",
    Backdated: x.is_backdated ?? x.isBackdated ?? "",
    Reason: x.backdate_reason || x.reason || "",
    Approval: x.approval_status || x.approval || "",
  }));
  return {
    allSizes,
    factorySummary,
    wipStatus,
    activeStageRows,
    deptSheets,
    issuedNotReceived: bucketSheet("issued_not_received"),
    completedNotIssued: bucketSheet("completed_not_issued"),
    receivedNotProcessed: bucketSheet("received_not_processed"),
    reconcile: bucketSheet("reconcile"),
    ramRows,
    ownerRows,
    processRows,
    partyRows,
    closureRows: rows.map(row => {
      const rs = rowStatus(row);
      return { Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, Status:rs.status, Closure_Owner:"Production Coordinator", WIP_Owner:rs.owner, Open_Qty:rs.qty, Can_Close:rs.qty ? "No" : "Yes", Action: rs.qty ? `${rs.action} · Coordinator to close/follow up style` : "Coordinator can verify and close" };
    }),
    dispatchRows,
    monthlyRows,
    ledgerRows,
  };
}
function MonthlyComparison({ rows }){
  const [month,setMonth] = useState(today().slice(0,7));
  const [buyer,setBuyer] = useState("All");
  const [focus,setFocus] = useState("all");
  const [route,setRoute] = useState("all");
  const [sizeBreak,setSizeBreak] = useState(true);
  const buyers = ["All", ...uniqueList(rows.map(r=>r.buyer))];
  const allSizes = allReportSizes(rows);
  const baseRows = rows.filter(row => (buyer === "All" || row.buyer === buyer) && (route === "all" || routeType(row) === route));
  const summary = {
    stitched: baseRows.reduce((a,row)=>a+cellBreakup(row,"stitching").received,0),
    packed: baseRows.reduce((a,row)=>a+cellBreakup(row,"packing").received,0),
    dispatched: baseRows.reduce((a,row)=>a+cellBreakup(row,"dispatch").received,0),
    afterStitch: baseRows.reduce((a,row)=>a+Math.max(0, cellBreakup(row,"stitching").received - cellBreakup(row,"packing").received),0),
    packedNotDispatch: baseRows.reduce((a,row)=>a+Math.max(0, cellBreakup(row,"packing").received - cellBreakup(row,"dispatch").received),0),
    reconcile: baseRows.flatMap(issueBuckets).filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0),
  };
  const tiles = [
    { key:"all", label:"All Month Styles", value:baseRows.length, note:"comparison rows" },
    { key:"stitched", label:"Stitching Receiving", value:summary.stitched, note:"main monthly comparison base" },
    { key:"after_stitch", label:"Still After Stitching", value:summary.afterStitch, note:"stitched but not packed" },
    { key:"packed_pending", label:"Packed Not Dispatched", value:summary.packedNotDispatch, note:"dispatch follow-up" },
    { key:"reconcile", label:"Reconcile", value:summary.reconcile, note:"mismatch / blocked" },
  ];
  const filtered = baseRows.filter(row=>{
    if (focus === "all" || focus === "stitched") return true;
    if (focus === "after_stitch") return Math.max(0, cellBreakup(row,"stitching").received - cellBreakup(row,"packing").received) > 0;
    if (focus === "packed_pending") return Math.max(0, cellBreakup(row,"packing").received - cellBreakup(row,"dispatch").received) > 0;
    if (focus === "reconcile") return issueBuckets(row).some(b=>b.type==="reconcile");
    return true;
  });
  const tableRows = filtered.map(row=>{
    const rs = rowStatus(row);
    const sizes = Object.fromEntries(sizeMatrix(row,"stitching","received").map(x=>[x.size,x.qty]));
    const core = {
      Month: month,
      Buyer: row.buyer,
      Order: row.order_no,
      Style: row.style_no,
      Colour: row.colour,
      Component: row.component,
      Route: routeType(row),
      Status: rs.status,
      Owner: rs.owner,
    };
    const sizeCols = sizeBreak ? withHorizontalSizes(row, sizes, allSizes) : {};
    return {
      ...core,
      ...sizeCols,
      Stitched_Received: cellBreakup(row,"stitching").received,
      Packed: cellBreakup(row,"packing").received,
      Dispatched: cellBreakup(row,"dispatch").received,
      Balance_After_Stitch: Math.max(0, cellBreakup(row,"stitching").received - cellBreakup(row,"packing").received),
      Packed_Not_Dispatched: Math.max(0, cellBreakup(row,"packing").received - cellBreakup(row,"dispatch").received),
      Open_Qty: rs.qty,
      Next_Action: rs.action,
    };
  });
  return <div className="mt-card">
    <div className="mt-section"><h3 className="mt-panel-title">Monthly Comparison — Stitching Receiving</h3><div className="mt-panel-sub">Separate monthly report tab. Default comparison is against Stitching Receiving for the selected month; every summary tile filters/drills the table below. Future live data will use production_entries.entry_date.</div></div>
    <div className="mt-section no-print">
      <div className="mt-filter-row"><span className="mt-toolbar-label">Month</span><input className="mt-input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><span className="mt-toolbar-label">Buyer</span><select className="mt-select" value={buyer} onChange={e=>setBuyer(e.target.value)}>{buyers.map(b=><option key={b}>{b}</option>)}</select><span className="mt-toolbar-label">Route</span><select className="mt-select" value={route} onChange={e=>setRoute(e.target.value)}><option value="all">All routes</option><option>Plain</option><option>Print</option><option>Embroidery</option><option>Print + Emb</option></select><button className={`mt-btn ${sizeBreak?"primary":"ghost"}`} onClick={()=>setSizeBreak(v=>!v)}><Layers size={14}/>Horizontal sizes</button><span className="mt-page-filter-note">{tableRows.length} rows</span></div>
      <div className="mt-summary-strip">{tiles.map(t=><button key={t.key} className={`mt-summary-tile ${focus===t.key?"active":""}`} onClick={()=>setFocus(t.key)}><div className="label">{t.label}</div><div className="value">{typeof t.value === "number" && t.key!=="all" ? fmt(t.value) : t.value}</div><div className="mt-small">{t.note}</div></button>)}</div>
    </div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{(tableRows[0] ? Object.keys(tableRows[0]) : ["Note"]).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{tableRows.length ? tableRows.map((r,i)=><tr key={i}>{Object.keys(tableRows[0]).map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}</tr>) : <tr><td style={{padding:18}}>No monthly rows for this filter.</td></tr>}</tbody></table></div>
  </div>;
}

function Reports({ rows, ledger }){
  const pack = buildReportSheets(rows, ledger);
  function exportDailyPack(){
    exportXlsx("daily_production_pack_horizontal.xlsx",[
      { name:"Factory Summary", rows:pack.factorySummary },
      ...pack.deptSheets,
      { name:"Owner Chase", rows:pack.ownerRows },
      { name:"Reconcile", rows:pack.reconcile },
    ]);
  }
  function exportIssueReceive(){
    exportXlsx("issue_receive_control_horizontal.xlsx",[
      { name:"Issued Not Received", rows:pack.issuedNotReceived },
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Handover Aging", rows:pack.ownerRows.filter(r => String(r.Status).includes("Receipt") || String(r.Status).includes("Ready")) },
    ]);
  }
  function exportQualityLoss(){
    exportXlsx("quality_loss_pack_horizontal.xlsx",[
      { name:"Reject Alter Missing", rows:pack.ramRows },
      { name:"Reconcile", rows:pack.reconcile },
      { name:"Audit Ledger", rows:pack.ledgerRows },
    ]);
  }
  function exportManagementMonthly(){
    exportXlsx("management_monthly_pack_horizontal.xlsx",[
      { name:"WIP Status", rows:pack.wipStatus },
      { name:"Monthly Comparison", rows:pack.monthlyRows },
      { name:"Process Print Emb", rows:pack.processRows },
      { name:"Party Pending", rows:pack.partyRows },
      { name:"Dispatch Ready", rows:pack.dispatchRows },
      { name:"Closure Pending", rows:pack.closureRows },
      { name:"Backdated Audit", rows:pack.ledgerRows },
    ]);
  }
  function exportAllReports(){
    exportXlsx("production_dpr_all_reports_horizontal.xlsx",[
      { name:"Factory Summary", rows:pack.factorySummary },
      { name:"Live WIP", rows:pack.wipStatus },
      { name:"Size Wise WIP", rows:pack.activeStageRows },
      { name:"Issued Not Received", rows:pack.issuedNotReceived },
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Reject Alter Missing", rows:pack.ramRows },
      { name:"Reconcile", rows:pack.reconcile },
      { name:"Owner Chase", rows:pack.ownerRows },
      { name:"Print Embroidery", rows:pack.processRows },
      { name:"Party Pending", rows:pack.partyRows },
      { name:"Dispatch Ready", rows:pack.dispatchRows },
      { name:"Closure Pending", rows:pack.closureRows },
      { name:"Monthly Comparison", rows:pack.monthlyRows },
      { name:"Backdated Audit", rows:pack.ledgerRows },
      ...pack.deptSheets,
    ]);
  }
  const reportCards = [
    { title:"Daily Production Pack", desc:"Factory summary + one horizontal WIP sheet per department + owner chase + reconcile.", action:exportDailyPack },
    { title:"Issue / Receive Control", desc:"Issued not received, completed not issued, received not processed, and handover aging.", action:exportIssueReceive },
    { title:"Quality Loss Pack", desc:"Reject / alter / missing, reconcile, and audit entries.", action:exportQualityLoss },
    { title:"Management Monthly Pack", desc:"WIP status, monthly comparison, print/emb, party pending, dispatch, closure, backdated audit.", action:exportManagementMonthly },
    { title:"All Reports Workbook", desc:"Everything above in one workbook, all user-facing sheets horizontal.", action:exportAllReports },
  ];
  return <div className="mt-two"><div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Excel Reports — Horizontal Format</h3><div className="mt-panel-sub">All team-facing size-wise reports use one row per style/order/colour/component/stage with size columns across and auto totals. Vertical format is only used for the audit ledger.</div></div><div className="mt-section" style={{display:"grid", gap:10}}>{reportCards.map(card=><div key={card.title} className="mt-card" style={{boxShadow:"none"}}><div className="mt-section"><h3 className="mt-panel-title" style={{fontSize:13}}>{card.title}</h3><div className="mt-panel-sub">{card.desc}</div><button className="mt-btn primary" style={{marginTop:9}} onClick={card.action}><Download size={14}/>Export</button></div></div>)}</div></div><PrintableHodSheet rows={rows}/></div>;
}

function PrintableHodSheet({ rows }){
  const [dept,setDept] = useState("stitching");
  const deptRows = rows.filter(r=>routeFor(r).includes(dept));
  const allSizes = allReportSizes(deptRows);
  return <div className="mt-card"><div className="mt-section no-print"><h3 className="mt-panel-title">Printable Department Head WIP</h3><div className="mt-panel-sub">Daily HOD sheet in horizontal size format. One row per style/component; sizes across columns.</div><div style={{marginTop:10}}><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select> <button className="mt-btn" onClick={()=>window.print()}><Printer size={14}/>Print</button></div></div><div className="mt-section mt-print-sheet"><h3 style={{marginTop:0}}>{stageLabel(dept)} WIP Sheet — {today()}</h3><table className="mt-table" style={{minWidth:980}}><thead><tr><th>Order</th><th>Style</th><th>Colour</th><th>Component</th><th>Status</th>{allSizes.map(size=><th key={size}>{size}</th>)}<th>Total</th><th>Open</th><th>R/A/M</th><th>Idle</th><th>Owner</th><th>Action</th></tr></thead><tbody>{deptRows.map(row=>{ const st=sdata(row,dept); const c=cellBreakup(row,dept); const rs=rowStatus(row); const sizeQty=Object.fromEntries(sizeMatrix(row,dept,"received").map(x=>[x.size,x.qty])); return <tr key={row.id}><td>{row.order_no}</td><td><b>{row.style_no}</b></td><td>{row.colour}</td><td>{row.component}</td><td>{rs.status}</td>{allSizes.map(size=><td key={size}>{fmt(sizeQty[size] || 0)}</td>)}<td><b>{fmt(c.received)}</b></td><td>{fmt(c.open)}</td><td>{fmt(c.ram)}</td><td>{n(st.idle)}d</td><td>{rs.owner}</td><td>{rs.action}</td></tr>; })}</tbody></table></div></div>;
}

function SimpleTable({ title, sub, rows, empty, onRowClick }){
  const cols = rows.length ? Object.keys(rows[0]) : [];
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">{title}</h3><div className="mt-panel-sub">{sub}</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.length ? rows.map((r,i)=><tr key={i} className={onRowClick ? "drillable" : ""} onClick={()=>onRowClick?.(r)}>{cols.map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}</tr>) : <tr><td style={{padding:18}}>{empty}</td></tr>}</tbody></table></div></div>;
}

function DetailDrawer({ row, rows, setRows, ledger, setLedger, stageKey, onClose }){
  const rs = rowStatus(row);
  const stage = stageKey || rs.stage;
  const st = sdata(row,stage);
  const c = cellBreakup(row,stage);
  const buckets = issueBuckets(row).filter(b=>b.stage===stage);
  return <div className="mt-drawer"><div className="mt-drawer-head"><div><div style={{fontFamily:"'Archivo',sans-serif", fontSize:20, fontWeight:800}}>{row.style_no}</div><div className="mt-sub">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div></div><button className="mt-btn" onClick={onClose}><X size={16}/></button></div><div className="mt-drawer-body">
    <LazyStylePhoto row={row} large/>
    <div className="mt-grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))", marginBottom:12}}><Kpi label="Status" value={rs.status} note={rs.action} tone={rs.tone}/><Kpi label="Owner" value={rs.owner} note={rs.support || "Primary owner"}/><Kpi label="Open Qty" value={fmt(rs.qty)} note={`${rs.idle || 0} days idle`}/></div>
    <div className="mt-card" style={{marginBottom:12}}><div className="mt-section"><h3 className="mt-panel-title">{stageLabel(stage)} Department Detail</h3><div className="mt-panel-sub">Main WIP cell stays simple; edit size-wise values below when the cell itself is used as entry.</div></div><div className="mt-section"><span className="mt-chip mt-ok">Received/Done {fmt(c.received)}</span> <span className="mt-chip mt-warn">Open {fmt(c.open)}</span> <span className="mt-chip mt-late">R/A/M {fmt(c.ram)}</span> {c.extra ? <span className="mt-chip mt-purple">Extra/Over {fmt(c.extra)}</span> : null}</div><div className="mt-section mt-two"><div><b>Quantities</b><p className="mt-small">Feed / issued to stage: {fmt(stageFeed(row,stage))}<br/>Received: {fmt(st.received)}<br/>Completed/output: {fmt(st.output)}<br/>Issued forward: {fmt(st.issued)}<br/>Reject: {fmt(st.reject)} · Alter: {fmt(st.alter)} · Missing: {fmt(st.missing)}</p></div><div><b>Safe validation</b><p className="mt-small">Cutting can overcut. After cutting, downstream total cannot jump above prior issued quantity. Backdated edits must pass as-of-date quantity checks and store audit date separately from created time.</p></div></div></div>
    <SimpleTable title="Status / Current Drilldown" sub="Shows reconcile plus the current production bucket with qty and percentage. This is the same logic used in the Status column." rows={statusBreakdown(row).map(b=>({ Status:b.status, Stage:stageLabel(b.stage), Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open status bucket." />
    <div style={{height:12}} />
    <SizeCumulativeEditor row={row} rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} stage={stage} initialField="received" source="wip_view_cell_edit" />
    <div style={{height:12}} />
    <SimpleTable title="Open Buckets for this Department" sub="Each bucket can become an owner chase item." rows={buckets.map(b=>({ Status:b.status, Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open bucket for this department." />
  </div></div>;
}

function PhotoManager({ rows, setRows }){
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState("");
  useEffect(()=>{
    setDraft(Object.fromEntries(rows.map(r=>[r.id, r.photo_url || ""])));
  }, [rows]);
  function setUrl(rowId, value){ setDraft(d=>({ ...d, [rowId]:value })); }
  async function save(){
    const nextRows = rows.map(r=>({ ...r, photo_url:draft[r.id] || "" }));
    setRows(prev=>prev.map(r=>Object.prototype.hasOwnProperty.call(draft, r.id) ? ({ ...r, photo_url:draft[r.id] || "" }) : r));
    setMsg("Photos saved locally. Seed/Pull will sync once Supabase column exists.");
    if (isSupabaseConfigured && supabase) {
      const payload = nextRows.map(orderToSupabase);
      const { error } = await supabase.from("production_orders").upsert(payload, { onConflict:"order_no,style_no,colour,component" });
      setMsg(error ? error.message : "Photo URLs saved to Supabase production_orders.photo_url.");
    }
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style Photos</h3><div className="mt-panel-sub">Add one optimized style photo URL per style/component. Main pages show tiny lazy-loaded thumbnails only, so the WIP grid stays fast on slow internet.</div></div>
    <div className="mt-section"><div className="mt-speed-note"><b>Performance rule:</b> store compressed WebP/JPG thumbnails in Supabase Storage later; table uses 42px thumbnails with <code>loading="lazy"</code>. Full/larger photo is shown only inside the detail drawer.</div></div>
    <div className="mt-section no-print"><button className="mt-btn primary" onClick={save}><CheckCircle2 size={14}/>Save Photo URLs</button> {msg && <span className="mt-chip mt-info">{msg}</span>}</div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Preview</th><th>Photo URL</th><th>Usage</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div></td><td><LazyStylePhoto row={{...row, photo_url:draft[row.id]}}/></td><td><input className="mt-input" style={{width:"min(640px,70vw)"}} value={draft[row.id] || ""} onChange={e=>setUrl(row.id,e.target.value)} placeholder="https://.../style-thumbnail.webp" /></td><td><span className="mt-chip mt-muted">Thumbnail in WIP</span> <span className="mt-chip mt-muted">Large in detail</span></td></tr>)}</tbody></table></div>
  </div>;
}

function SettingsView(){
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">ERP / Supabase Reference</h3><div className="mt-panel-sub">Separate app now, future module inside mega ERP. Production owns movement/WIP; Style Master/BOM/Procurement will own master/material truth.</div></div><div className="mt-section mt-two"><div><b>Included in V5 logic</b><ul className="mt-small"><li>Option A cumulative size-wise entry</li><li>Print / embroidery route toggles</li><li>Department cells max 3 numbers</li><li>Cutting over allowed; downstream total jump blocked</li><li>Issued-not-received owner = receiving HOD</li><li>95% tail balance adds Production Coordinator</li><li>Individual owner chase: Production Coordinator + Department HOD shown together for open WIP</li><li>Style closure owner = Production Coordinator; Production Manager only WIP/escalation</li><li>WIP table page-specific filters, sorting, quick status buckets, and size-breakup toggle</li><li>Dashboard uses current-bin WIP logic: once a quantity moves to the next stage, it leaves the previous department bin.</li><li>Dashboard includes daily / 4-4-5 weekly / calendar-month production numbers, department × issue-type board, owner activity breakup, and production meeting focus.</li><li>Monthly comparison tab against Stitching Receiving with drillable summary filters</li><li>Printable HOD WIP / horizontal Excel reports</li><li>Style photo support with lazy-loading thumbnails</li><li>Editable WIP cells create entries instead of raw overwrite</li><li>Entry date / backdated audit logic with reason and approval status</li><li>Future procurement/stores quantity checks must validate as-of entry date</li><li>Slow-internet rule: tables use thumbnails only; heavy image/detail loads on click</li></ul></div><div><b>Future shared keys</b><ul className="mt-small"><li>style_id / order_id later</li><li>production_file_id from Merch Tracker</li><li>bom_id from Costing/BOM</li><li>order_no, style_no, colour, component, size, set_id</li></ul></div></div><div className="mt-section"><span className="mt-chip mt-info"><Lock size={12}/> Future RLS</span> <span className="mt-small">Keep this as a development app. We tighten RLS before real users and live factory data.</span></div></div>;
}


function PageFilters({ tab, query, setQuery, buyer, setBuyer, buyers, visibleRows }){
  if (["wip","entry","owners","monthly"].includes(tab)) return null;
  const title = tab === "dashboard" ? "Dashboard Filters" : tab === "routes" ? "Route Page Filters" : tab === "photos" ? "Photo Page Filters" : tab === "reports" ? "Report Scope" : "Page Filters";
  const placeholder = tab === "photos" ? "Search style / photo / buyer" : "Search style / order / buyer / colour";
  return <div className="mt-toolbar no-print" style={{marginBottom:12}}>
    <span className="mt-toolbar-label">{title}</span>
    <Search size={14}/>
    <input className="mt-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder} style={{minWidth:260}}/>
    <select className="mt-select" value={buyer} onChange={e=>setBuyer(e.target.value)}>{buyers.map(b=><option key={b}>{b}</option>)}</select>
    {tab === "dashboard" && <span className="mt-chip mt-info">All cards drillable — click any KPI/table row</span>}
    {tab === "reports" && <span className="mt-chip mt-info">Horizontal Excel exports</span>}
    <span className="mt-chip mt-muted">{visibleRows.length} rows</span>
  </div>;
}

export default function App(){
  const [tab,setTab] = useState("dashboard");
  const [rows,setRows] = useState(demoRows.map(r=>({ ...r, route:routeFor(r) })));
  const [ledger,setLedger] = useState([]);
  const [query,setQuery] = useState("");
  const [buyer,setBuyer] = useState("All");
  const [drawer,setDrawer] = useState(null);
  const [dashboardDrill,setDashboardDrill] = useState(null);
  const [notice,setNotice] = useState(null);
  const buyers = ["All", ...Array.from(new Set(rows.map(r=>r.buyer).filter(Boolean))).sort()];
  const visibleRows = useMemo(()=>rows.filter(r=>{
    const q = query.trim().toLowerCase();
    const okBuyer = buyer === "All" || r.buyer === buyer;
    if (!q) return okBuyer;
    const hay = [r.order_no,r.style_no,r.buyer,r.colour,r.component,r.set_id].join(" ").toLowerCase();
    return okBuyer && hay.includes(q);
  }),[rows,query,buyer]);
  async function pullSupabase(){
    if(!isSupabaseConfigured || !supabase){ setNotice({tone:"warn", text:"Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel first."}); return; }
    const {data,error} = await supabase.from("production_orders").select("*").limit(500).order("created_at",{ascending:false});
    if(error){ setNotice({tone:"late", text:error.message}); return; }
    if(data?.length) setRows(data.map(supabaseToOrder));
    setNotice({tone:"ok", text:`Pulled ${data?.length || 0} production orders.`});
  }
  async function seedSupabase(){
    if(!isSupabaseConfigured || !supabase){ setNotice({tone:"warn", text:"Add Supabase env variables first. App still works in local demo mode."}); return; }
    const {error} = await supabase.from("production_orders").upsert(rows.map(orderToSupabase), { onConflict:"order_no,style_no,colour,component" });
    if(error){ setNotice({tone:"late", text:error.message}); return; }
    setNotice({tone:"ok", text:"Seeded/updated demo production orders in Supabase."});
  }
  function exportAll(){
    const pack = buildReportSheets(visibleRows, ledger);
    exportXlsx("production_dpr_v6_horizontal_quick_export.xlsx",[
      { name:"Factory Summary", rows:pack.factorySummary },
      { name:"Live WIP", rows:pack.wipStatus },
      { name:"Owner Chase", rows:pack.ownerRows },
      { name:"Issued Not Received", rows:pack.issuedNotReceived },
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Reject Alter Missing", rows:pack.ramRows },
      { name:"Reconcile", rows:pack.reconcile },
      { name:"Backdated Audit", rows:pack.ledgerRows },
    ]);
  }
  const tabs = [
    ["dashboard","Dashboard",BarChart3], ["wip","Live WIP",Warehouse], ["entry","DPR Entry",ClipboardList], ["owners","Who to Chase",Users], ["monthly","Monthly",FileSpreadsheet], ["routes","Routes",Filter], ["photos","Photos",ImageIcon], ["reports","Reports",FileSpreadsheet], ["settings","Settings",Settings]
  ];
  return <div className="mt-app" data-theme="paper"><style>{FONT + CSS}</style><div className="mt-top"><div className="mt-shell"><div className="mt-header"><div><div className="mt-title">Production DPR & WIP Control <span style={{color:"var(--accent)"}}>V6.3</span></div><div className="mt-sub">Excel-speed cumulative size-wise entry · 4-4-5 production calendar · latest-activity date picker · correct WIP bins · meeting dashboards · working drilldowns · editable WIP cells · backdated audit · horizontal reports · Supabase-ready.</div></div><div className="mt-actions"><button className="mt-btn" onClick={pullSupabase}><RefreshCw size={14}/>Pull</button><button className="mt-btn primary" onClick={seedSupabase}><Upload size={14}/>Seed Supabase</button><button className="mt-btn" onClick={exportAll}><Download size={14}/>Export</button></div></div><div className="mt-tabs">{tabs.map(([k,label,Icon])=><button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}><Icon size={14}/> {label}</button>)}</div></div></div>
    <div className="mt-shell mt-page">
      {notice && <div className={`mt-card no-print`} style={{marginBottom:12}}><div className="mt-section"><span className={`mt-chip ${statusClass(notice.tone)}`}>{notice.text}</span> <button className="mt-btn ghost" onClick={()=>setNotice(null)} style={{float:"right"}}>Dismiss</button></div></div>}
      <PageFilters tab={tab} query={query} setQuery={setQuery} buyer={buyer} setBuyer={setBuyer} buyers={buyers} visibleRows={visibleRows}/>
      {tab === "dashboard" && <Dashboard rows={visibleRows} ledger={ledger} onDrill={setDashboardDrill}/>} 
      {tab === "wip" && <WipStatus rows={visibleRows} onOpen={(row,stage)=>setDrawer({row,stage})}/>} 
      {tab === "entry" && <QuickEntry rows={visibleRows} setRows={setRows} ledger={ledger} setLedger={setLedger}/>} 
      {tab === "owners" && <WhoToChase rows={visibleRows}/>} 
      {tab === "monthly" && <MonthlyComparison rows={visibleRows}/>} 
      {tab === "routes" && <ProcessRoutes rows={visibleRows} setRows={setRows}/>} 
      {tab === "photos" && <PhotoManager rows={visibleRows} setRows={setRows}/>} 
      {tab === "reports" && <Reports rows={visibleRows} ledger={ledger}/>} 
      {tab === "settings" && <SettingsView/>}
    </div>
    {drawer && <DetailDrawer row={drawer.row} rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} stageKey={drawer.stage} onClose={()=>setDrawer(null)}/>} 
    {dashboardDrill && <DashboardDrillDrawer drill={dashboardDrill} rows={visibleRows} onClose={()=>setDashboardDrill(null)}/>} 
  </div>;
}
