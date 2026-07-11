import React, { useEffect, useMemo, useRef, useState } from "react";
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
  LogOut,
  UserCheck,
  Shirt,
  Truck,
  Upload,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const APP_VERSION = "V51_RECONCILE_EDITABLE_P0_CONSERVATION";
const APP_COMMIT_MESSAGE = "Moves P0 stock/date and conservation issues into editable Reconcile review; clicking reconcile rows opens the exact Register correction context.";


const PRODUCTION_APP_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1f1f1d"/>
  <path d="M10 48h44v7H10z" fill="#f7f3ea"/>
  <path d="M13 48V30l10 6v-6l10 6v-6l10 6V20h8v28H13z" fill="#c96f16"/>
  <path d="M18 42h5v6h-5zm10 0h5v6h-5zm10 0h5v6h-5zm10 0h5v6h-5z" fill="#fff4e3"/>
  <path d="M43 16h10l-2-6h-6z" fill="#f7f3ea"/>
</svg>`;

function setProductionAppBrowserIdentity(){
  if (typeof document === "undefined") return;
  document.title = "Production DPR / WIP";
  const svg = PRODUCTION_APP_FAVICON_SVG.trim();
  const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const selectors = ['link[rel="icon"]','link[rel="shortcut icon"]'];
  selectors.forEach(sel=>document.querySelectorAll(sel).forEach(node=>node.parentNode?.removeChild(node)));
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/svg+xml";
  icon.href = href;
  document.head.appendChild(icon);
  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = href;
}

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
.mt-sub { font-size:10.5px; color:var(--on-dark-2); margin-top:3px; line-height:1.35; max-width:760px; }
.mt-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
.mt-tabs { display:flex; gap:6px; overflow-x:auto; overflow-y:hidden; padding:7px 22px 0; scrollbar-width:thin; }
.mt-tabs button { flex:0 0 auto; border:1px solid transparent; border-bottom:3px solid transparent; border-radius:9px 9px 0 0; background:transparent; color:#b8afa3; padding:10px 15px; min-height:38px; font-family:'Archivo',sans-serif; font-size:12px; font-weight:800; letter-spacing:0.3px; cursor:pointer; }
.mt-tabs button:hover { background:rgba(255,255,255,0.06); color:var(--bg); }
.mt-tabs button.active { color:var(--bg); border-color:var(--accent); border-bottom-color:var(--accent); background:rgba(255,255,255,0.08); }
.mt-keepalive-note { display:flex; align-items:center; gap:8px; margin:-2px 0 10px; padding:6px 9px; border:1px dashed var(--line-2); background:#fffaf1; }
.mt-keepalive-note.slim { padding:4px 8px; opacity:.88; }
.mt-clean-hint { font-size:10px; color:var(--muted-2); line-height:1.35; }
.mt-app.clean-mode .mt-panel-sub, .mt-app.clean-mode .mt-clean-hint, .mt-app.clean-mode .mt-speed-note { display:none !important; }
.mt-app.clean-mode .mt-section { padding-top:10px; padding-bottom:10px; }
.mt-app.clean-mode .mt-sub { max-width:640px; }
.mt-tab-panel { min-height:260px; }
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

.mt-readable-table .mt-table th { white-space:nowrap; font-size:10px; }
.mt-readable-table .mt-table td { white-space:normal; overflow-wrap:normal; word-break:normal; max-width:220px; line-height:1.35; }
.mt-readable-feed .mt-table td, .mt-readable-plan .mt-table td, .mt-readable-achieved .mt-table td { font-size:10.5px; }
.mt-cell-tone-ok { background:#eef8f1 !important; color:#1f6f54; font-weight:800; }
.mt-cell-tone-warn { background:#fff7d6 !important; color:#7a560f; font-weight:800; }
.mt-cell-tone-late { background:#fff0ec !important; color:#8c241a; font-weight:800; }
.mt-table-note { padding:7px 10px; border-top:1px dashed var(--line-2); color:var(--muted-2); font-size:10px; background:#fffaf1; }
.mt-plan-action-card { min-height:112px; }
.mt-plan-action-reading { display:flex; gap:5px; flex-wrap:wrap; }
.mt-plan-reading-pill.danger { background:#fff0ec; color:#8c241a; }
.mt-plan-reading-pill.warn { background:#fff7d6; color:#7a560f; }
.mt-plan-reading-pill.ok { background:#eef8f1; color:#1f6f54; }

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
.mt-style-main b, .mt-style-title { font-family:'Archivo',sans-serif; font-size:15.5px; font-weight:800; letter-spacing:-.1px; }
.mt-style-main .mt-small, .mt-style-detail { font-size:11px; font-weight:800; color:var(--muted-3); line-height:1.35; }
.mt-thumb { width:42px; height:42px; border:1px solid var(--line-2); border-radius:10px; object-fit:cover; background:#f2eadf; flex:0 0 auto; display:flex; align-items:center; justify-content:center; color:var(--muted-2); overflow:hidden; }
.mt-thumb.small { width:32px; height:32px; border-radius:8px; }
.mt-thumb.large { width:100%; height:220px; border-radius:14px; margin-bottom:12px; }
.mt-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.mt-photo-empty { font-size:9px; font-weight:800; text-align:center; line-height:1.1; padding:3px; }
.mt-speed-note { border:1px dashed var(--line-2); background:#fffaf1; color:var(--muted-3); border-radius:10px; padding:10px; font-size:10.5px; line-height:1.45; }


.mt-backdate-box { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.mt-locked-note { border-left:4px solid var(--danger); background:#fff1ee; padding:9px 10px; font-size:10.5px; color:var(--fg-late); line-height:1.45; }
.mt-save-banner { border:2px solid #1f6f54; background:#e9f8ef; color:#14533e; border-radius:12px; padding:10px 12px; font-size:12px; font-weight:900; display:flex; align-items:center; gap:8px; margin-top:10px; }
.mt-save-banner.warn { border-color:#d59a24; background:#fff8df; color:#7a560f; }
.mt-conservation-alert { border:2px solid #b42318; background:#fff1ee; border-radius:12px; padding:10px 12px; margin:8px 0; color:#8c241a; font-size:10.5px; font-weight:800; line-height:1.45; }
.mt-correction-control { border:2px solid var(--accent); background:#fff7ea; border-radius:14px; padding:12px; margin:10px 0 12px; }
.mt-correction-control-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:8px; margin-top:8px; }
.mt-correction-control-card { border:1px solid var(--line-2); background:#fffdf8; border-radius:12px; padding:9px; display:grid; gap:4px; }
.mt-correction-control-card .label { font-size:8.5px; text-transform:uppercase; letter-spacing:.35px; color:var(--muted-2); font-weight:900; }
.mt-correction-control-card .value { font-family:'Archivo',sans-serif; font-size:18px; font-weight:800; }
.mt-issue-list { border:1px solid var(--line-2); border-radius:14px; overflow:hidden; background:var(--surface); margin:8px 0 12px; }
.mt-issue-list-head { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; background:#fff7ea; border-bottom:1px solid var(--line-3); padding:10px 12px; }
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
.mt-col-filter-row th { top:46px; z-index:4; background:#2b2722 !important; padding:5px 6px !important; border-bottom:1px solid var(--on-dark-line); }
.mt-col-filter-input, .mt-col-filter-select { width:100%; min-width:74px; border:1px solid var(--on-dark-line); background:var(--surface); color:var(--ink); padding:5px 6px; min-height:28px; font-size:9.5px; font-weight:700; }
.mt-col-filter-input.stage { min-width:86px; }
.mt-col-filter-clear { font-size:9px; white-space:nowrap; }
.mt-grid-filter-active { outline:2px solid rgba(201,111,22,.22); background:#fff7ea; }
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

.mt-context-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:12px; }
.mt-context-card { background:var(--surface); border:1px solid var(--line-2); border-radius:14px; padding:12px; min-height:160px; }
.mt-context-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:8px; }
.mt-context-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:14px; margin:0; }
.mt-context-sub { font-size:10px; color:var(--muted-2); line-height:1.35; margin-top:2px; }
.mt-bar-row { display:grid; grid-template-columns:112px 1fr 68px; align-items:center; gap:8px; margin:7px 0; font-size:10px; }
.mt-bar-track { height:10px; border-radius:999px; background:#efe9df; border:1px solid var(--line-3); overflow:hidden; }
.mt-bar-fill { height:100%; background:var(--accent); border-radius:999px; }
.mt-donut-wrap { display:flex; align-items:center; gap:12px; }
.mt-donut { width:112px; height:112px; border-radius:50%; border:1px solid var(--line-2); flex:0 0 auto; }
.mt-legend { display:grid; gap:6px; font-size:10px; min-width:0; flex:1; }
.mt-legend-row { display:flex; align-items:center; justify-content:space-between; gap:10px; border-bottom:1px dashed var(--line-3); padding-bottom:4px; }
.mt-dot { width:9px; height:9px; border-radius:50%; display:inline-block; margin-right:5px; flex:0 0 auto; }
.mt-toggle-row { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin:10px 0 12px; }
.mt-toggle-row .active { background:var(--ink); color:var(--bg); }
.mt-focus-panel { border:1px solid var(--line-2); border-radius:14px; background:#fffaf1; padding:12px; margin-bottom:12px; }
.mt-compact-hero { display:grid; grid-template-columns:1.3fr repeat(4,minmax(0,1fr)); gap:10px; align-items:stretch; }
.mt-context-strip { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
details.mt-fold { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); margin-top:12px; overflow:hidden; }
details.mt-fold > summary { cursor:pointer; padding:12px 14px; font-family:'Archivo',sans-serif; font-weight:800; background:#fff7ea; }
details.mt-fold[open] > summary { border-bottom:1px solid var(--line-3); }
.mt-entry-highlight { border:2px solid var(--accent); background:#fff7ea; border-radius:14px; padding:10px; margin-bottom:10px; }
.mt-entry-highlight strong { font-family:'Archivo',sans-serif; font-size:14px; }
.mt-open-pill { border:1px solid var(--line-2); border-radius:10px; background:#fffaf1; padding:7px 9px; display:inline-flex; flex-direction:column; gap:2px; min-width:96px; }
.mt-open-pill b { font-family:'Archivo',sans-serif; font-size:15px; }
.mt-open-pill span { font-size:9px; color:var(--muted-2); font-weight:800; text-transform:uppercase; letter-spacing:.25px; }

.mt-view-mode-bar { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin:8px 0 10px; padding:7px; border:1px solid var(--line-2); background:#fffaf1; border-radius:10px; }
.mt-view-mode-bar .mt-btn.active, .mt-btn.active { background:var(--ink); color:var(--bg); }
.mt-entry-hero { border:2px solid var(--ink); background:#fff7ea; border-radius:16px; padding:12px; margin-bottom:10px; }
.mt-entry-hero-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:17px; margin:0 0 5px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.mt-entry-hero-sub { font-size:10.5px; color:var(--muted-3); line-height:1.45; }
.mt-entry-metrics { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; margin:10px 0; }
.mt-entry-metric { border:1px solid var(--line-2); background:var(--surface); border-radius:12px; padding:9px; }
.mt-entry-metric .label { color:var(--muted-2); text-transform:uppercase; letter-spacing:.35px; font-size:8.8px; font-weight:800; }
.mt-entry-metric .value { font-family:'Archivo',sans-serif; font-size:18px; font-weight:800; margin-top:4px; }
.mt-entry-metric .note { font-size:9px; color:var(--muted-2); margin-top:4px; line-height:1.3; }
.mt-entry-size-cell { min-width:96px; }
.mt-entry-size-open { font-size:9px; color:var(--muted-2); line-height:1.25; }
.mt-entry-size-open b { color:var(--ink); font-size:11px; }
.mt-entry-remain { margin-top:3px; font-size:9px; color:var(--muted-2); }
.mt-entry-remain.warn { color:var(--fg-warn); font-weight:800; }
.mt-cell-input.today-entered { background:#eaf2ff; border-color:#3a72c4; }
.mt-today-badge { display:inline-block; font-size:9px; font-weight:800; color:#2255a4; background:#eaf2ff; border:1px solid #b9d3f5; border-radius:6px; padding:1px 5px; margin-top:4px; }
.mt-entry-summary { display:flex; flex-wrap:wrap; gap:14px; align-items:center; border:1px solid var(--line-2); background:var(--surface); border-radius:12px; padding:10px 12px; margin:10px 0; font-size:11.5px; }
.mt-entry-summary b { font-family:'Archivo',sans-serif; font-size:15px; }
.mt-entry-summary .sep { color:var(--muted-2); }
.mt-entry-row-actions { display:flex; gap:5px; flex-wrap:wrap; margin-top:6px; }
.mt-compact-wip-table td { padding:10px 8px; }
.mt-action-pill { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--line-2); background:#fffaf1; border-radius:999px; padding:4px 8px; font-size:9.5px; font-weight:800; }
.mt-open-big { font-family:'Archivo',sans-serif; font-size:20px; font-weight:800; }
.mt-dept-focus-card { border:2px solid var(--accent); border-radius:16px; padding:12px; background:#fff7ea; margin-bottom:12px; }
.mt-dept-focus-title { font-family:'Archivo',sans-serif; font-size:18px; font-weight:800; margin:0; }
.mt-dept-size-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:8px; }
.mt-dept-size-box { border:1px solid var(--line-2); border-radius:12px; background:white; padding:8px; }
.mt-dept-size-box .size { font-family:'Archivo',sans-serif; font-weight:800; }
.mt-dept-size-box .line { font-size:9.5px; color:var(--muted-2); margin-top:3px; display:flex; justify-content:space-between; gap:8px; }


.mt-style-entry-panel { border:2px solid var(--accent); background:#fff7ea; border-radius:16px; padding:12px; margin:10px 0 12px; box-shadow:0 2px 0 rgba(31,31,29,.04); }
.mt-style-entry-head { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:8px; }
.mt-style-entry-head b { font-family:'Archivo',sans-serif; font-size:15px; }
.mt-style-entry-controls { display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:10px; }
.mt-style-entry-controls label { display:flex; flex-direction:column; gap:4px; font-size:9px; color:var(--muted-2); font-weight:900; text-transform:uppercase; letter-spacing:.35px; }
.mt-style-entry-size-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(112px,1fr)); gap:8px; }
.mt-style-entry-size { border:1px solid var(--line-2); background:white; border-radius:12px; padding:8px; }
.mt-style-entry-size .sz { font-family:'Archivo',sans-serif; font-weight:800; font-size:14px; margin-bottom:3px; }
.mt-style-entry-size .mt-cell-input { width:100%; margin-top:5px; }
.mt-style-entry-total { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:10px; border-top:1px dashed var(--line-2); padding-top:8px; font-size:11px; }
.mt-style-entry-total b { font-family:'Archivo',sans-serif; font-size:17px; }

.mt-dept-cutting { --dept-tint:#fff3df; --dept-fg:#8a4a0a; }
.mt-dept-printing { --dept-tint:#e9f2ff; --dept-fg:#174a7c; }
.mt-dept-embroidery { --dept-tint:#f1e8ff; --dept-fg:#5b3f8d; }
.mt-dept-stitching { --dept-tint:#e9f7ee; --dept-fg:#1f6f54; }
.mt-dept-checking { --dept-tint:#fff7d7; --dept-fg:#785900; }
.mt-dept-packing { --dept-tint:#e9f7f8; --dept-fg:#12626b; }
.mt-dept-dispatch { --dept-tint:#eef0f5; --dept-fg:#35435d; }
.mt-stage-cell.dept-focus, td.dept-focus { background:var(--dept-tint,#fffdf8); }
.mt-stage-title.dept-focus-title, .mt-status-link .dept-name { color:var(--dept-fg,var(--muted-3)); }
.mt-status-link { width:100%; border:1px solid rgba(31,31,29,.12); border-radius:10px; background:var(--dept-tint,#fffaf1); color:var(--dept-fg,var(--ink)); padding:6px 8px; display:flex; align-items:center; justify-content:space-between; gap:8px; margin:4px 0; cursor:pointer; text-align:left; }
.mt-status-link.compact { width:auto; min-width:0; padding:4px 6px; margin:2px; display:inline-flex; gap:5px; border-radius:999px; vertical-align:top; }
.mt-status-link.compact .dept-name { font-size:9px; }
.mt-status-link.compact .dept-qty { font-size:11px; }
.mt-status-link.compact .dept-pct { font-size:8px; }
.mt-status-link.compact .mt-small { font-size:8.5px; line-height:1.15; }
.mt-status-cell-wrap.compact-wrap .mt-status-link.compact { max-width:260px; min-width:170px; }
.mt-primary-stage-card { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:150px; max-width:190px; border:1px solid rgba(31,31,29,.14); border-radius:11px; background:var(--dept-tint,#fffaf1); color:var(--dept-fg,var(--ink)); padding:7px 8px; cursor:pointer; }
.mt-primary-stage-card .big { font-family:'Archivo',sans-serif; font-size:16px; font-weight:800; color:var(--ink); }
.mt-cut-breakup-mini { max-width:240px; min-width:170px; }
.mt-status-link:hover { outline:2px solid rgba(201,111,22,.18); }
.mt-status-link.mt-route-balance-late { background:#fee2e2; border-color:#fca5a5; color:#991b1b; }
.mt-status-link .dept-name { font-weight:800; font-size:10px; }
.mt-status-link .dept-qty { font-family:'Archivo',sans-serif; font-weight:800; font-size:13px; color:var(--ink); }
.mt-status-link .dept-pct { font-size:9px; color:var(--muted-2); font-weight:800; }
.mt-current-split-note { font-size:9px; color:var(--muted-2); margin-top:4px; }
.mt-issue-focus-cell { min-width:170px; display:grid; gap:5px; }
.mt-issue-focus-card { border:1px solid var(--line-2); border-radius:11px; background:#fffdf8; padding:7px 8px; display:flex; justify-content:space-between; align-items:flex-start; gap:8px; cursor:pointer; }
.mt-issue-focus-card:hover { outline:2px solid rgba(201,111,22,.16); background:#fffaf1; }
.mt-issue-focus-title { font-size:9px; font-weight:900; text-transform:uppercase; color:var(--muted-2); letter-spacing:.25px; }
.mt-issue-focus-main { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; color:var(--ink); }
.mt-tail-status-cell { min-width:145px; display:grid; gap:5px; }
.mt-tail-card { border:1px solid #e7c061; background:#fff7db; color:#7a560f; border-radius:11px; padding:7px 8px; display:flex; justify-content:space-between; gap:8px; align-items:flex-start; cursor:pointer; }
.mt-tail-card:hover { outline:2px solid rgba(201,111,22,.18); }
.mt-tail-card .stage { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.25px; }
.mt-tail-card .qty { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; color:var(--ink); }

.mt-current-crisp { display:grid; gap:3px; min-width:172px; }
.mt-current-line { width:100%; border:1px solid rgba(31,31,29,.12); border-radius:8px; background:#fffdf8; padding:4px 6px; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px; align-items:center; cursor:pointer; text-align:left; }
.mt-current-line:hover { outline:2px solid rgba(201,111,22,.18); }
.mt-current-line .txt { font-size:9.2px; line-height:1.12; font-weight:900; color:var(--muted-4); }
.mt-current-line .num { font-family:'Archivo',sans-serif; font-size:13.5px; font-weight:800; color:var(--ink); white-space:nowrap; }
.mt-current-muted { font-size:8.2px; color:var(--muted-2); line-height:1.14; }
.mt-filter-focus-pill { border:1px solid #d99a45; background:#fff0df; color:#8a4a0a; border-radius:8px; padding:4px 6px; display:flex; justify-content:space-between; gap:8px; align-items:center; font-size:9px; font-weight:900; }
.mt-filter-focus-pill b { font-family:'Archivo',sans-serif; font-size:14px; color:var(--ink); }
.mt-filter-focus-pill.late { border-color:#e1a095; background:#fff1ee; color:#8c241a; }
.mt-filter-focus-pill.ok { border-color:#bcd7c9; background:#f4fbf6; color:#1f6f54; }
.mt-tail-status-cell { min-width:145px; display:grid; gap:5px; }
.mt-tail-card { border:1px solid #e7c061; background:#fff7db; color:#7a560f; border-radius:11px; padding:7px 8px; display:flex; justify-content:space-between; gap:8px; align-items:flex-start; cursor:pointer; }
.mt-tail-card:hover { outline:2px solid rgba(201,111,22,.18); }
.mt-tail-card .stage { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.25px; }
.mt-tail-card .qty { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; color:var(--ink); }
.mt-size-repair-chip { border-color:#d99a45 !important; background:#fff7ea !important; color:#7a4a0f !important; }
.mt-plan-week-table { min-width:1080px; }
.mt-plan-week-table th.day-col, .mt-plan-week-table td.day-col { min-width:118px; text-align:center; }
.mt-plan-cell { display:flex; flex-direction:column; gap:4px; align-items:stretch; }
.mt-plan-cell input { width:100%; text-align:right; }
.mt-plan-cell .hint { font-size:8.8px; color:var(--muted-2); line-height:1.2; }
.mt-plan-row-label { min-width:260px; }
.mt-status-cell-wrap { display:grid; gap:4px; min-width:130px; }
.mt-status-cell-wrap.compact-wrap { display:flex; flex-wrap:wrap; align-items:center; gap:3px; min-width:0; }
.mt-status-split-note { width:100%; border:1px dashed var(--line-2); border-radius:9px; background:#fffaf1; padding:6px 8px; color:var(--muted-3); font-size:9.5px; line-height:1.35; }
.mt-update-backdrop { position:fixed; inset:0; z-index:80; background:rgba(20,18,15,0.45); display:flex; align-items:center; justify-content:center; padding:20px; }
.mt-update-popup { width:min(520px,96vw); background:var(--surface); border:1px solid var(--line-2); border-radius:18px; box-shadow:0 18px 50px rgba(0,0,0,.24); overflow:hidden; }
.mt-update-popup .head { background:var(--ink); color:var(--bg); padding:14px 16px; font-family:'Archivo',sans-serif; font-weight:800; font-size:17px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
.mt-update-popup .body { padding:16px; display:grid; gap:10px; }
.mt-update-popup .actions { display:flex; justify-content:flex-end; gap:8px; padding:0 16px 16px; flex-wrap:wrap; }

.mt-manager-decision-modal { width:min(720px,96vw); max-height:92vh; overflow:auto; background:var(--surface); border:1px solid var(--line-2); border-radius:18px; box-shadow:0 18px 60px rgba(0,0,0,.28); }
.mt-manager-decision-modal .head { background:var(--ink); color:var(--bg); padding:14px 16px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.mt-manager-decision-modal .body { padding:16px; display:grid; gap:12px; }
.mt-manager-decision-modal .actions { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
.mt-manager-decision-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
.mt-manager-decision-kpis div { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:9px; }
.mt-manager-decision-kpis span { display:block; font-size:9px; color:var(--muted-2); font-weight:800; text-transform:uppercase; letter-spacing:.35px; }
.mt-manager-decision-kpis b { display:block; margin-top:4px; font-family:'Archivo',sans-serif; font-size:18px; }
.mt-check-row { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:800; color:var(--muted-3); }
.mt-file-release-cell { display:grid; gap:5px; min-width:160px; border:1px solid var(--line-2); border-radius:12px; background:#fffdf8; padding:8px; }
.mt-file-release-cell .top { display:flex; align-items:center; justify-content:space-between; gap:8px; font-weight:900; color:var(--muted-3); text-transform:uppercase; letter-spacing:.25px; font-size:9px; }
.mt-file-release-cell .top b { font-family:'Archivo',sans-serif; color:var(--ink); font-size:17px; }
.mt-file-release-cell .meta { color:var(--muted-2); font-size:9.5px; line-height:1.25; }
.mt-file-release-cell.ok { background:#eef8f1; border-color:#b8d9c4; }
.mt-file-release-cell.info { background:#eaf2ff; border-color:#bdd4f4; }
.mt-file-release-cell.warn { background:#fff7db; border-color:#e7c061; }
.mt-file-release-cell.late { background:#fff0ed; border-color:#e6a098; }
.mt-update-backdrop:has(.mt-release-modal-v42) { z-index:9999; background:rgba(20,18,15,.62); align-items:center; justify-content:center; padding:18px; }
.mt-release-modal-v42 { width:min(1180px,98vw) !important; height:min(820px,92vh); max-height:92vh; background:var(--surface); border:2px solid var(--ink); border-radius:18px; box-shadow:0 28px 90px rgba(0,0,0,.36); overflow:hidden; display:flex; flex-direction:column; }
.mt-release-modal-v42 .head { flex:0 0 auto; background:var(--ink); color:var(--bg); padding:16px 20px; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; border-bottom:4px solid var(--accent); }
.mt-release-modal-v42 .head .mt-sub { color:var(--on-dark-2); font-size:11px; }
.mt-release-modal-v42 .body { flex:1 1 auto; overflow:auto; padding:18px 22px 0; display:grid; grid-template-columns:1fr; gap:14px; background:#fffdf8; }
.mt-release-help { border:1px solid #9fc2ec; background:#eef6ff; color:#174a7c; border-radius:12px; padding:11px 13px; font-size:12px; line-height:1.45; font-weight:800; }
.mt-release-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
.mt-release-kpis div { border:1px solid var(--line-2); background:#fffaf1; border-radius:14px; padding:13px 14px; min-height:82px; box-shadow:0 1px 0 rgba(31,31,29,.05); }
.mt-release-kpis span { display:block; font-size:9.5px; color:var(--muted-2); font-weight:900; text-transform:uppercase; letter-spacing:.35px; line-height:1.2; }
.mt-release-kpis b { display:block; margin-top:8px; font-family:'Archivo',sans-serif; font-size:28px; line-height:1; color:var(--ink); }
.mt-release-fastfill { display:flex; gap:10px; flex-wrap:wrap; align-items:center; border:1px solid var(--line-2); background:#fff7ea; border-radius:14px; padding:12px; }
.mt-release-fastfill .mt-btn { min-height:42px; padding:9px 14px; font-size:12px; }
.mt-release-modal-v42 .mt-two { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mt-release-big-input { width:100%; font-size:22px !important; font-weight:900; min-height:56px; border-width:3px !important; background:#fffaf1 !important; }
.mt-release-note-input { width:100%; min-height:48px; font-size:12px; }
.mt-release-modal-v42 .mt-context-strip { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:8px; }
.mt-release-actions { display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap; position:sticky; bottom:0; z-index:5; background:linear-gradient(180deg,rgba(255,253,248,.92),var(--surface)); border-top:1px solid var(--line-2); margin:0 -22px; padding:14px 22px; box-shadow:0 -8px 22px rgba(31,31,29,.08); }
.mt-release-actions .mt-btn { min-height:42px; padding:9px 16px; font-size:12px; }
.mt-release-size-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(128px,1fr)); gap:10px; padding-bottom:6px; }
.mt-release-size-cell { border:1px solid var(--line-2); background:#fffaf1; border-radius:14px; padding:12px; min-height:70px; }
.mt-release-size-cell b { display:block; font-family:'Archivo',sans-serif; font-size:24px; line-height:1; color:var(--ink); }
.mt-release-size-cell span { display:block; margin-top:7px; font-size:10px; color:var(--muted-2); font-weight:900; text-transform:uppercase; letter-spacing:.25px; }
.mt-release-modal-v42 .mt-panel-title { font-size:17px; }
.mt-release-modal-v42 .mt-panel-sub { font-size:11px; }
@media (max-width:900px){ .mt-release-kpis{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-release-modal-v42 .mt-two{grid-template-columns:1fr;} }
@media (max-width:640px){ .mt-update-backdrop:has(.mt-release-modal-v42){padding:6px;} .mt-release-modal-v42{width:100vw !important;height:96vh;border-radius:10px;} .mt-release-kpis{grid-template-columns:1fr;} .mt-release-size-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }


.mt-p0-audit-panel { border:1px solid #e2a59b; background:#fff4f1; border-radius:14px; margin-top:10px; overflow:hidden; }
.mt-p0-audit-panel summary { cursor:pointer; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-family:'Archivo',sans-serif; font-weight:800; }
.mt-p0-audit-panel[open] summary { border-bottom:1px solid #f0c5bd; }
.mt-p0-audit-body { padding:10px 12px 12px; }
.mt-p0-audit-row { display:grid; grid-template-columns:120px 1.2fr 110px 1.6fr; gap:8px; padding:7px 0; border-bottom:1px dashed #efc7bf; font-size:10px; align-items:start; }
.mt-p0-audit-row:last-child { border-bottom:0; }
.mt-p0-audit-main { font-weight:900; color:#8c241a; }
.mt-p0-audit-meta { color:var(--muted-3); line-height:1.35; }
.mt-p0-inline-warning { border:1px dashed #e2a59b; background:#fff4f1; color:#8c241a; border-radius:10px; padding:8px 10px; font-size:10.5px; line-height:1.35; margin-top:8px; }
@media (max-width:720px){ .mt-manager-decision-kpis{grid-template-columns:repeat(2,minmax(0,1fr));} }

@media (max-width:1180px){ .mt-entry-metrics{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-context-grid{grid-template-columns:1fr 1fr;} .mt-compact-hero{grid-template-columns:1fr 1fr;} }
@media (max-width:720px){ .mt-context-grid,.mt-compact-hero{grid-template-columns:1fr;} .mt-bar-row{grid-template-columns:84px 1fr 54px;} }



.mt-cell-input.mandatory, .mt-input.mandatory { border:2px solid var(--accent) !important; background:#fff8e8; box-shadow:0 0 0 2px rgba(201,111,22,0.12); }
.mt-mandatory-note { display:flex; align-items:center; gap:8px; border:1px solid #e0aa62; background:#fff8e8; color:#7a4a0f; border-radius:10px; padding:8px 10px; font-size:10.5px; font-weight:800; margin-top:8px; }
.mt-ram-subrow td { background:#fffaf1 !important; border-top:1px dashed var(--line-2); }
.mt-ram-entry-wrap { display:grid; gap:8px; }
.mt-ram-entry-row { display:grid; grid-template-columns:120px repeat(8,minmax(72px,1fr)); gap:6px; align-items:center; }
.mt-ram-entry-label { font-family:'Archivo',sans-serif; font-size:11px; font-weight:800; }
.mt-plan-print-block { display:grid; grid-template-columns:1fr; gap:12px; }
.mt-plan-print-table { min-width:760px !important; }
.mt-plan-print-table th.day-col, .mt-plan-print-table td.day-col { min-width:160px; }
.mt-entry-action-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 7px; border:1px solid var(--line-2); border-radius:999px; background:#fff7ea; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.3px; }
.mt-order-size-card { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:10px; display:grid; gap:8px; }
.mt-order-size-row { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
.mt-order-size-cell { min-width:96px; border:1px solid var(--line-2); background:white; border-radius:10px; padding:8px; }
.mt-order-size-cell label { display:block; font-size:9px; color:var(--muted-2); font-weight:800; text-transform:uppercase; letter-spacing:.3px; margin-bottom:5px; }

.mt-correction-row td { background:#fff8eb; border-top:2px solid var(--accent); border-bottom:2px solid var(--accent); }
.mt-inline-correction { padding:12px; border:1px dashed var(--accent); border-radius:14px; background:#fffaf1; }
.mt-correction-head { display:flex; gap:12px; align-items:baseline; flex-wrap:wrap; margin-bottom:10px; }
.mt-correction-controls { display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px; }
.mt-correction-controls label { display:flex; flex-direction:column; gap:4px; font-size:11px; text-transform:uppercase; color:var(--muted-3); font-weight:800; letter-spacing:.03em; }
.mt-correction-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(128px,1fr)); gap:10px; }
.mt-correction-size { border:1px solid var(--line-2); border-radius:12px; padding:8px; background:#fffdf8; }
.mt-correction-size .sz { font-weight:900; font-size:16px; margin-bottom:4px; }
.mt-small.warn { color:var(--danger); font-weight:900; }

.mt-layout { display:grid; grid-template-columns:230px minmax(0,1fr); gap:14px; align-items:start; }
.mt-layout.nav-collapsed { grid-template-columns:58px minmax(0,1fr); }
.mt-side-nav { position:sticky; top:10px; align-self:start; background:var(--surface); border:1px solid var(--line-2); border-radius:14px; overflow:hidden; box-shadow:var(--card-shadow); }
.mt-side-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px; border-bottom:1px solid var(--line-3); background:#fff7ea; }
.mt-side-title { font-family:'Archivo',sans-serif; font-size:12px; font-weight:800; letter-spacing:.25px; }
.mt-side-nav button.mt-side-tab { width:100%; display:flex; align-items:center; justify-content:flex-start; gap:9px; border:0; border-bottom:1px solid var(--line-3); background:transparent; color:var(--muted-4); padding:10px 11px; min-height:40px; font-family:'Archivo',sans-serif; font-size:12px; font-weight:800; cursor:pointer; text-align:left; }
.mt-side-nav button.mt-side-tab:hover { background:#fffaf1; color:var(--ink); }
.mt-side-nav button.mt-side-tab.active { background:var(--ink); color:var(--bg); }
.mt-side-nav button.mt-side-tab:disabled { opacity:.45; cursor:not-allowed; }
.mt-layout.nav-collapsed .mt-side-title, .mt-layout.nav-collapsed .mt-side-label, .mt-layout.nav-collapsed .mt-side-lock { display:none; }
.mt-layout.nav-collapsed .mt-side-head { justify-content:center; }
.mt-layout.nav-collapsed .mt-side-nav button.mt-side-tab { justify-content:center; padding:10px 8px; }
.mt-main-area { min-width:0; }
.mt-review-mode-bar { display:flex; align-items:center; flex-wrap:wrap; gap:7px; padding:8px; border:1px solid var(--line-2); background:#fffaf1; border-radius:10px; margin-bottom:10px; }
.mt-review-split { display:grid; grid-template-columns:minmax(0,1fr); gap:12px; }
.mt-history-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:10px; }
.mt-history-kpi { border:1px solid var(--line-2); background:var(--surface); border-radius:12px; padding:10px; }
.mt-history-kpi .label { font-size:9px; text-transform:uppercase; color:var(--muted-2); font-weight:800; letter-spacing:.3px; }
.mt-history-kpi .value { font-family:'Archivo',sans-serif; font-size:19px; font-weight:800; margin-top:4px; }
.mt-excel-filter-pick { min-width:118px; }

.mt-login-page { position:fixed; inset:0; z-index:9999; background:linear-gradient(135deg,#fffaf1 0%,#f4eadc 100%); display:flex; align-items:center; justify-content:center; padding:24px; }
.mt-login-card { width:min(860px,96vw); min-height:460px; display:grid; grid-template-columns:1.05fr 1fr; background:#fffdf8; border:0; border-radius:18px; box-shadow:10px 10px 0 #26231f, 0 22px 60px rgba(31,31,29,.12); overflow:hidden; }
.mt-login-left { background:#fbf4e8; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; gap:24px; }
.mt-login-brand { font-family:'Archivo',sans-serif; font-weight:800; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; }
.mt-login-product { font-family:'Archivo',sans-serif; font-weight:800; font-size:33px; letter-spacing:-1.1px; margin:12px 0 8px; }
.mt-login-copy { font-size:11px; line-height:1.55; max-width:430px; }
.mt-login-feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:22px; }
.mt-login-feature { background:rgba(255,255,255,.72); border:1px solid rgba(31,31,29,.04); border-radius:12px; padding:13px; min-height:58px; }
.mt-login-feature b { display:block; font-family:'Archivo',sans-serif; font-size:17px; }
.mt-login-feature span { display:block; margin-top:4px; font-size:9px; color:var(--muted-3); font-weight:800; }
.mt-login-note { background:rgba(255,255,255,.75); border-radius:12px; padding:12px; font-size:10.5px; line-height:1.45; }
.mt-login-right { padding:42px 36px; display:flex; flex-direction:column; justify-content:center; }
.mt-login-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:25px; letter-spacing:-.5px; margin-bottom:4px; }
.mt-login-subcopy { font-size:11px; color:var(--muted-3); margin-bottom:18px; }
.mt-login-field-label { display:block; font-size:9px; font-weight:900; letter-spacing:.55px; text-transform:uppercase; margin:12px 0 6px; color:var(--ink); }
.mt-login-input { width:100%; border:0; border-bottom:1px solid var(--line-2); background:transparent; padding:10px 8px; min-height:42px; font-size:12px; outline:none; }
.mt-login-input:focus { border-bottom-color:var(--ink); background:#fffaf1; }
.mt-login-submit { width:100%; border:0; border-bottom:1px solid var(--line-2); border-radius:0 0 10px 10px; background:#fffdf8; color:var(--ink); margin-top:18px; padding:12px; min-height:44px; font-weight:900; cursor:pointer; }
.mt-login-submit:hover { background:#fff7ea; }
.mt-login-submit:disabled { opacity:.55; cursor:not-allowed; }
.mt-login-minor { display:flex; justify-content:center; gap:10px; margin-top:12px; font-size:10px; font-weight:900; }
.mt-login-link { border:0; background:transparent; cursor:pointer; font-weight:900; text-decoration:none; color:var(--ink); }
.mt-login-msg { margin-top:14px; border-radius:10px; padding:10px; font-size:10.5px; line-height:1.4; }
.mt-login-access-panel { margin-top:14px; border:1px solid var(--line-2); border-radius:12px; background:#fffaf1; padding:12px; }
.mt-login-access-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.mt-wip-sticky-tools { position:sticky; top:0; z-index:18; background:var(--surface); border-bottom:1px solid var(--line-3); box-shadow:0 2px 10px rgba(31,31,29,.04); }
.mt-wip-table-wrap { max-height:calc(100vh - 260px); overflow:auto; }
/* Header + filter rows are both sticky. The filter row's top offset MUST equal the
   real header height, or a wrapped 2-line header ("Current Status / Entry") pushes the
   filter row down over the first data row. Pin header height so the offset is exact. */
.mt-wip-table-wrap .mt-table thead th { top:0; height:46px; vertical-align:middle; }
.mt-wip-table-wrap .mt-col-filter-row th { top:46px; height:auto; vertical-align:middle; }
.mt-wip-table-wrap .mt-table thead th:not(.mt-col-filter-row th) { white-space:normal; overflow-wrap:anywhere; }
.mt-wip-fit-table table.mt-table { min-width:max(100%, 1380px); table-layout:auto; }
.mt-wip-fit-table .mt-style-main { min-width:170px; }
.mt-wip-fit-table .mt-table th, .mt-wip-fit-table .mt-table td { white-space:normal; overflow-wrap:anywhere; padding:8px; }
.mt-wip-fit-table .mt-stage-cell { min-width:86px; }
.mt-sticky-col { position:sticky !important; left:var(--sticky-left,0px); z-index:6; background:var(--surface) !important; box-shadow:2px 0 0 var(--line-2); min-width:var(--sticky-width,auto); width:var(--sticky-width,auto); }
.mt-table th.mt-sticky-col { z-index:12; background:var(--ink) !important; }
.mt-table td.mt-sticky-col { z-index:5; background:var(--surface) !important; }
.mt-table tr:hover td.mt-sticky-col { background:#fffaf1 !important; }
.mt-col-filter-row th.mt-sticky-col { z-index:11; background:#2b2722 !important; }
.mt-wip-table-wrap.freeze-active { isolation:isolate; }
.mt-wip-table-wrap.freeze-active .mt-style-main { min-width:0; }
/* V6: freeze must behave like Excel: every row in the frozen columns stays locked,
   header/filter/body share the same left offsets, and stage cells scroll under the frozen pane. */
.mt-wip-table-wrap.freeze-active .mt-table { border-collapse:separate; border-spacing:0; }
.mt-wip-table-wrap.freeze-active .mt-table thead th.mt-sticky-col { z-index:32 !important; }
.mt-wip-table-wrap.freeze-active .mt-col-filter-row th.mt-sticky-col { z-index:31 !important; }
.mt-wip-table-wrap.freeze-active .mt-table tbody td.mt-sticky-col { z-index:20 !important; }
.mt-wip-table-wrap.freeze-active .mt-sticky-col { background-clip:padding-box; outline:1px solid var(--line-2); }
.mt-wip-table-wrap.freeze-active .mt-table tbody td.mt-sticky-col::after,
.mt-wip-table-wrap.freeze-active .mt-table thead th.mt-sticky-col::before { content:""; position:absolute; right:-1px; top:0; bottom:0; width:1px; background:var(--line-2); }
.mt-wip-table-wrap.freeze-active .mt-subrow td { position:relative; z-index:1; }

.mt-wip-resizable { --wip-default-col:132px; --wip-stage-col:150px; --wip-style-col:320px; --wip-status-col:230px; --wip-owner-col:190px; --wip-route-col:170px; --wip-action-col:220px; }
.mt-wip-compact { --wip-default-col:108px; --wip-stage-col:122px; --wip-style-col:260px; --wip-status-col:190px; --wip-owner-col:150px; --wip-route-col:140px; --wip-action-col:180px; }
.mt-wip-comfort { --wip-default-col:132px; --wip-stage-col:150px; --wip-style-col:320px; --wip-status-col:230px; --wip-owner-col:190px; --wip-route-col:170px; --wip-action-col:220px; }
.mt-wip-wide { --wip-default-col:162px; --wip-stage-col:184px; --wip-style-col:400px; --wip-status-col:280px; --wip-owner-col:230px; --wip-route-col:210px; --wip-action-col:280px; }
.mt-wip-resizable .mt-table th { resize:horizontal; overflow:hidden; min-width:var(--wip-default-col); position:relative; }
.mt-wip-resizable .mt-table td { min-width:var(--wip-default-col); }
.mt-wip-resizable .mt-table th:first-child, .mt-wip-resizable .mt-table td:first-child { min-width:var(--wip-style-col); }
.mt-wip-resizable .mt-stage-cell { min-width:var(--wip-stage-col); }
.mt-wip-resizable .mt-status-link { min-width:0; }
.mt-wip-resizable .mt-style-main { min-width:calc(var(--wip-style-col) - 30px); }
.mt-wip-resizable .mt-table td { line-height:1.35; }
.mt-wip-resizable .mt-table th { line-height:1.25; }
.mt-wip-resizable .mt-table td .mt-small { line-height:1.35; }
/* Keep manual column resize, but hide the browser's big orange native resizer box.
   The grid uses a thin hover edge instead, so stage/filter headers do not look blocked. */
.mt-wip-resizable .mt-table th::-webkit-resizer { background:transparent; width:3px; height:3px; }
.mt-wip-resizable .mt-table th::after { content:""; position:absolute; right:0; top:0; bottom:0; width:3px; background:transparent; pointer-events:none; }
.mt-wip-resizable .mt-table th:hover::after { background:rgba(201,111,22,.55); }
.mt-wip-resizable .mt-col-filter-row th::after { display:none; }
.mt-wip-fit-table.mt-wip-resizable .mt-table th, .mt-wip-fit-table.mt-wip-resizable .mt-table td { vertical-align:top; }
.mt-wip-resize-hint { border-color:#bfd7f2 !important; background:#eef6ff !important; color:#174a7c !important; }

.mt-excel-filter-menu { position:relative; display:block; width:100%; }
.mt-excel-filter-button { width:100%; list-style:none; cursor:pointer; border:1px solid var(--on-dark-line); background:var(--surface); color:var(--ink); min-height:28px; padding:5px 7px; font-size:9.5px; font-weight:800; display:flex; align-items:center; justify-content:space-between; gap:6px; text-align:left; }
.mt-excel-filter-button.active { outline:2px solid rgba(201,111,22,.22); border-color:var(--accent); background:#fff7ea; }
.mt-excel-filter-button .filter-title { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mt-excel-filter-button .filter-caret { opacity:.72; font-size:10px; }
.mt-excel-filter-pop { background:var(--surface); color:var(--ink); border:1px solid var(--ink); box-shadow:0 14px 34px rgba(31,31,29,.24); border-radius:0; padding:0; overflow:hidden; }
.mt-excel-filter-pop-fixed { position:fixed; z-index:99999; max-height:min(430px, calc(100vh - 18px)); display:flex; flex-direction:column; }
.mt-excel-filter-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 9px; background:#fffaf1; border-bottom:1px solid var(--line-2); }
.mt-excel-filter-head b { font-family:'Archivo',sans-serif; font-size:12px; }
.mt-excel-filter-close { border:1px solid var(--line-2); background:white; min-height:26px; min-width:26px; cursor:pointer; font-weight:900; }
.mt-excel-filter-pop .search { width:100%; min-height:34px; border:0; border-bottom:1px solid var(--line-2); background:white; padding:8px 10px; font-size:11px; outline:none; }
.mt-excel-filter-actions { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:8px; border-bottom:1px solid var(--line-3); }
.mt-excel-filter-actions button { min-height:31px; padding:6px 8px; font-size:9.5px; border:1px solid var(--line-2); background:#fffaf1; cursor:pointer; font-weight:900; }
.mt-excel-filter-actions button.dark { background:var(--ink); color:var(--bg); border-color:var(--ink); }
.mt-excel-filter-options { display:grid; gap:0; max-height:230px; overflow:auto; border-top:0; padding:0; }
.mt-excel-filter-options label { display:grid; grid-template-columns:22px minmax(0,1fr) auto; align-items:center; gap:6px; font-size:11px; line-height:1.2; padding:8px 9px; cursor:pointer; border-bottom:1px solid var(--line-3); }
.mt-excel-filter-options label:hover { background:#fffaf1; }
.mt-excel-filter-options .option-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mt-excel-filter-count { color:var(--muted-2); font-size:8.5px; font-weight:800; }
.mt-excel-filter-only { border:1px solid var(--line-2); background:white; min-height:25px; padding:3px 7px; font-size:9px; font-weight:900; cursor:pointer; }
.mt-excel-filter-footer { display:flex; gap:6px; padding:8px; background:#fffaf1; border-top:1px solid var(--line-2); }
.mt-excel-filter-footer button { flex:1; min-height:34px; border:1px solid var(--ink); background:white; font-weight:900; cursor:pointer; }
.mt-excel-filter-footer button.primary { background:var(--ink); color:var(--bg); }
.mt-wip-table-wrap .mt-col-filter-row th { overflow:visible !important; }
.mt-wip-table-wrap .mt-table thead { position:relative; z-index:30; }
.mt-wip-table-wrap .mt-table tbody { position:relative; z-index:1; }
.mt-wip-table-wrap .mt-table th { font-size:9.5px; letter-spacing:.15px; }
.mt-wip-table-wrap .mt-table td { font-size:10.5px; }
.mt-wip-table-wrap .mt-col-filter-input { border-color:#4a463e; min-height:30px; font-weight:800; }
.mt-wip-polish-note { color:#174a7c !important; background:#eef6ff !important; border-color:#bfd7f2 !important; }
.mt-resize-th { position:relative; }
.mt-resize-grip { position:absolute; top:0; right:-3px; width:7px; height:100%; cursor:col-resize; z-index:40; touch-action:none; }
.mt-resize-grip::after { content:""; position:absolute; right:2px; top:18%; bottom:18%; border-right:1px solid rgba(201,111,22,.45); opacity:.45; }
.mt-resize-th:hover .mt-resize-grip::after { border-right:2px solid var(--accent); opacity:1; }

.mt-column-menu { border:1px solid var(--line-2); background:#fffaf1; border-radius:10px; padding:7px 9px; }
.mt-column-menu summary { cursor:pointer; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.3px; }
.mt-column-choice { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--line-2); background:white; border-radius:999px; padding:5px 8px; font-size:9.5px; font-weight:900; margin:6px 5px 0 0; }
@media (max-width:760px){ .mt-login-card{grid-template-columns:1fr; min-height:0;} .mt-login-left{padding:22px;} .mt-login-right{padding:26px 22px;} .mt-login-product{font-size:27px;} }

@media (max-width:980px){ .mt-layout,.mt-layout.nav-collapsed{grid-template-columns:1fr;} .mt-side-nav{position:relative;top:auto;} .mt-side-scroll{display:flex; overflow-x:auto;} .mt-side-nav button.mt-side-tab{width:auto; min-width:118px; border-right:1px solid var(--line-3);} .mt-layout.nav-collapsed .mt-side-label{display:inline;} }



.mt-presence-strip { display:flex; align-items:center; gap:7px; flex-wrap:wrap; padding:8px 22px; border-top:1px solid rgba(255,255,255,.06); background:#171511; }
.mt-presence-pill { display:inline-flex; align-items:center; gap:6px; border:1px solid var(--on-dark-line); background:rgba(255,255,255,.05); color:var(--bg); border-radius:999px; padding:4px 8px; font-size:9.5px; max-width:280px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.mt-presence-pill span:last-child { color:var(--on-dark-2); overflow:hidden; text-overflow:ellipsis; }
.mt-presence-dot { width:7px; height:7px; background:#64d99b; border-radius:50%; box-shadow:0 0 0 3px rgba(100,217,155,.12); flex:0 0 auto; }
.mt-plan-board-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
.mt-plan-board-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:17px; }
.mt-plan-excel-table { min-width:1180px; table-layout:fixed; }
.mt-plan-excel-table th.day-col, .mt-plan-excel-table td.day-col { min-width:250px; width:250px; vertical-align:top; }
.mt-plan-excel-table th.line-col, .mt-plan-excel-table td.line-col { min-width:145px; width:145px; }
.mt-plan-line-name { font-family:'Archivo',sans-serif; font-size:14px; font-weight:800; }
.mt-plan-cell-board { min-height:136px; display:grid; gap:5px; align-content:start; }
.mt-plan-cell-board input, .mt-plan-cell-board select { width:100%; min-height:28px; padding:5px 6px; font-size:9.5px; border:1px solid var(--line-2); background:white; }
.mt-plan-cell-board .style-input { font-weight:900; font-size:10.5px; border:2px solid var(--accent); background:#fffaf1; }
.mt-plan-mini-row { display:grid; grid-template-columns:1.25fr .75fr .65fr; gap:5px; }
.mt-plan-mini-row.two { grid-template-columns:1fr 1fr; }
.mt-plan-cell-actions { display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
.mt-plan-cell-actions .mt-btn { min-height:24px; padding:3px 6px; font-size:8.8px; }
.mt-plan-signal { border:1px dashed var(--line-2); border-radius:8px; padding:4px 6px; font-size:8.8px; line-height:1.22; color:var(--muted-3); background:#fffdf8; }
.mt-plan-signal.ok { border-color:#b8d9c4; background:#eef8f1; color:#1f6f54; }
.mt-plan-signal.warn { border-color:#e7c061; background:#fff7db; color:#785900; }
.mt-plan-signal.late { border-color:#e6a098; background:#fff0ed; color:#8c241a; }
.mt-plan-signal.purple { border-color:#cab5ea; background:#f4efff; color:#5b3f8d; }
.mt-plan-need-mini { display:grid; grid-template-columns:repeat(5,minmax(70px,1fr)); gap:6px; border:1px solid var(--line-2); background:#fffaf1; border-radius:10px; padding:7px; margin-top:6px; }
.mt-plan-need-mini div { border-right:1px dashed var(--line-2); padding-right:5px; min-width:0; }
.mt-plan-need-mini div:last-child { border-right:0; }
.mt-plan-need-mini span { display:block; font-size:8px; color:var(--muted-2); text-transform:uppercase; font-weight:800; letter-spacing:.25px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mt-plan-need-mini b { display:block; font-family:'Archivo',sans-serif; font-size:12px; margin-top:2px; }
.mt-style-drill-head { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.mt-style-drill-kpis { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; margin:10px 0; }
.mt-style-drill-kpi { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:9px; }
.mt-style-drill-kpi .label { font-size:8px; color:var(--muted-2); text-transform:uppercase; letter-spacing:.35px; font-weight:800; }
.mt-style-drill-kpi .value { font-family:'Archivo',sans-serif; font-size:18px; font-weight:800; margin-top:4px; }
@media (max-width:900px){ .mt-plan-need-mini,.mt-style-drill-kpis{grid-template-columns:repeat(2,minmax(0,1fr));} }
.mt-plan-total-row td { background:#fff7ea !important; font-weight:800; }
.mt-plan-day-total { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.mt-plan-board-wrap.fit .mt-plan-excel-table th.day-col, .mt-plan-board-wrap.fit .mt-plan-excel-table td.day-col { min-width:190px; width:190px; }
.mt-plan-board-wrap.fit .mt-plan-cell-board { min-height:120px; }
.mt-plan-board-wrap.printable .mt-plan-cell-actions, .mt-plan-board-wrap.printable .mt-plan-signal { display:none; }
.mt-plan-cascade-note { border:1px solid var(--line-2); background:#fffaf1; border-radius:12px; padding:10px; font-size:10px; line-height:1.45; color:var(--muted-3); }

.mt-plan-view-toggle { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:8px; }
.mt-plan-simple-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:10px; }
.mt-plan-simple-card { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); overflow:hidden; }
.mt-plan-simple-head { background:#fff7ea; border-bottom:1px solid var(--line-3); padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.mt-plan-simple-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:14px; }
.mt-plan-simple-body { padding:10px; display:grid; gap:8px; }
.mt-plan-simple-slot { border:1px solid var(--line-3); border-radius:10px; background:#fffdf8; padding:8px; display:grid; gap:5px; }
.mt-plan-simple-style { font-family:'Archivo',sans-serif; font-weight:800; font-size:13px; }
.mt-plan-simple-meta { display:flex; gap:5px; flex-wrap:wrap; font-size:9px; color:var(--muted-3); }
.mt-plan-simple-empty { color:var(--muted-2); font-size:10px; padding:8px; border:1px dashed var(--line-2); border-radius:10px; background:#fffaf1; }
.mt-plan-simple-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:10px; }
.mt-plan-simple-kpi { border:1px solid var(--line-2); background:#fffdf8; border-radius:12px; padding:10px; }
.mt-plan-simple-kpi .label { font-size:8.5px; text-transform:uppercase; letter-spacing:.35px; color:var(--muted-2); font-weight:900; }
.mt-plan-simple-kpi .value { font-family:'Archivo',sans-serif; font-weight:800; font-size:20px; margin-top:4px; }

.mt-plan-action-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:8px; margin:10px 0; }
.mt-plan-action-card { border:1px solid var(--line-2); background:#fffdf8; border-radius:12px; padding:10px; display:grid; gap:5px; }
.mt-plan-action-card.ok { border-color:#bcd7c9; background:#f4fbf6; }
.mt-plan-action-card.warn { border-color:#e7c46e; background:#fff9e6; }
.mt-plan-action-card.late { border-color:#e1a095; background:#fff1ee; }
.mt-plan-action-top { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:10px; color:var(--muted-2); font-weight:900; text-transform:uppercase; letter-spacing:.25px; }
.mt-plan-action-style { font-family:'Archivo',sans-serif; font-weight:800; font-size:13px; line-height:1.15; }
.mt-plan-action-reading { font-size:10.5px; color:var(--muted-3); line-height:1.35; }
.mt-plan-action-next { font-size:10px; color:var(--ink); font-weight:800; }
.mt-plan-reading-strip { display:flex; flex-wrap:wrap; gap:7px; margin:8px 0 10px; }
.mt-plan-reading-pill { border:1px solid var(--line-2); background:#fffaf1; border-radius:999px; padding:5px 8px; font-size:10px; font-weight:900; color:var(--muted-4); }
.mt-plan-slot-status { margin-top:4px; display:flex; flex-wrap:wrap; gap:4px; }
.mt-plan-mini-table-toggle { margin-top:10px; }
@media (max-width:760px){ .mt-plan-simple-kpis{grid-template-columns:repeat(2,minmax(0,1fr));} }

.mt-plan-excel-table th.day-col, .mt-plan-excel-table td.day-col { min-width:285px; width:285px; }
.mt-plan-cell-board.columnar { min-height:238px; gap:6px; }
.mt-plan-field { display:grid; grid-template-columns:78px minmax(0,1fr); align-items:center; gap:8px; }
.mt-plan-field label { font-size:9.5px; font-weight:900; color:var(--muted-2); text-transform:uppercase; letter-spacing:.35px; }
.mt-plan-field input, .mt-plan-field select { min-width:0; width:100%; }
.mt-plan-field .style-input { grid-column:2; font-weight:800; }
.mt-plan-calc-box { border:1px dashed var(--line-2); background:#fffaf1; border-radius:10px; padding:6px; display:grid; gap:5px; }
.mt-plan-calc-box .mt-plan-field { grid-template-columns:88px minmax(0,1fr); }
.mt-plan-calc-meta { display:flex; justify-content:space-between; gap:6px; align-items:center; flex-wrap:wrap; font-size:8.5px; color:var(--muted-3); }
.mt-plan-calc-meta b { font-family:'Archivo',sans-serif; font-size:13px; color:var(--ink); }
.mt-plan-action-row { display:flex; gap:4px; flex-wrap:wrap; align-items:center; }
.mt-plan-action-row .mt-btn { min-height:24px; padding:3px 6px; font-size:8.6px; }
.mt-plan-add-style { border:1px solid #d99a45; background:#fff7ea; color:#7a4a0f; border-radius:9px; padding:6px; display:grid; gap:5px; font-size:8.8px; }
.mt-plan-slot-card { border:1px solid var(--line-2); background:#fffdf8; border-radius:12px; padding:7px; display:grid; gap:6px; }
.mt-plan-slot-card + .mt-plan-slot-card { margin-top:7px; }
.mt-plan-slot-head { display:flex; align-items:center; justify-content:space-between; gap:6px; font-size:9px; font-weight:900; color:var(--muted-3); text-transform:uppercase; letter-spacing:.25px; }
.mt-plan-day-capacity { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; font-size:8.6px; }
.mt-plan-day-capacity span { border:1px solid var(--line-3); border-radius:8px; background:#fffaf1; padding:4px 5px; color:var(--muted-3); }
.mt-plan-day-capacity b { display:block; font-family:'Archivo',sans-serif; font-size:12px; color:var(--ink); }
.mt-plan-readonly { border:1px dashed var(--line-2); background:#f8f5ee; color:var(--muted-4); border-radius:8px; padding:5px 6px; min-height:28px; font-size:9.5px; display:flex; align-items:center; justify-content:space-between; gap:6px; }
.mt-plan-auto-hint { font-size:8.5px; color:var(--muted-2); line-height:1.2; }
.mt-plan-add-slot { width:100%; border-style:dashed; }

.mt-plan-board-wrap.fit .mt-plan-excel-table th.day-col, .mt-plan-board-wrap.fit .mt-plan-excel-table td.day-col { min-width:230px; width:230px; }
.mt-plan-board-wrap.fit .mt-plan-cell-board.columnar { min-height:210px; }
.mt-plan-board-wrap.fit .mt-plan-field { grid-template-columns:58px minmax(0,1fr); gap:4px; }
.mt-plan-board-wrap.fit .mt-plan-calc-box .mt-plan-field { grid-template-columns:70px minmax(0,1fr); }
.mt-plan-line-stack { display:grid; gap:12px; }
.mt-plan-line-card { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); overflow:hidden; }
.mt-plan-line-card > summary { cursor:pointer; list-style:none; padding:12px 14px; background:#fff7ea; border-bottom:1px solid var(--line-3); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.mt-plan-line-card > summary::-webkit-details-marker { display:none; }
.mt-plan-line-card[open] > summary { border-bottom:1px solid var(--line-2); }
.mt-plan-line-summary-main { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.mt-plan-line-summary-main:before { content:'▸'; font-weight:900; transition:transform .12s ease; color:var(--accent); }
.mt-plan-line-card[open] .mt-plan-line-summary-main:before { transform:rotate(90deg); }
.mt-plan-line-summary-metrics { display:flex; gap:6px; flex-wrap:wrap; }
.mt-plan-line-summary-metrics span, .mt-plan-week-total-strip span { border:1px solid var(--line-2); background:#fffdf8; border-radius:999px; padding:4px 8px; font-size:9px; font-weight:900; color:var(--muted-3); }
.mt-plan-line-body { padding:12px; }
.mt-plan-week-total-strip { display:flex; gap:6px; flex-wrap:wrap; margin:0 0 10px; }
.mt-plan-day-card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(305px,1fr)); gap:10px; align-items:start; }
.mt-plan-day-card { border:1px solid var(--line-2); border-radius:14px; background:#fffdf8; overflow:hidden; }
.mt-plan-day-card-head { padding:9px 10px; background:var(--ink); color:var(--bg); display:flex; justify-content:space-between; gap:8px; align-items:center; flex-wrap:wrap; }
.mt-plan-day-card-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:13px; }
.mt-plan-day-card .mt-plan-cell-board { padding:9px; min-height:0; }
.mt-plan-board-wrap.fit .mt-plan-day-card-grid { grid-template-columns:repeat(auto-fit,minmax(255px,1fr)); }
.mt-plan-board-wrap.fit .mt-plan-day-card .mt-plan-cell-board.columnar { min-height:0; }
.mt-plan-board-wrap.fit .mt-plan-day-card .mt-plan-slot-card { padding:6px; }


.mt-plan-board-wrap.compact-excel .mt-plan-board-head { align-items:flex-start; }
.mt-compact-board-scroll { overflow:auto; border:1px solid var(--ink); border-radius:12px; background:var(--surface); max-height:72vh; }
.mt-compact-plan-table { width:100%; min-width:980px; border-collapse:separate; border-spacing:0; table-layout:fixed; }
.mt-compact-plan-table { width:auto; min-width:var(--plan-table-min-width,980px); }
.mt-compact-plan-table th.day-head, .mt-compact-plan-table td.compact-plan-cell { width:var(--plan-day-col,145px); min-width:var(--plan-day-col,145px); max-width:var(--plan-day-col,145px); }
.mt-compact-plan-table th.line-head, .mt-compact-plan-table td.line-cell { width:var(--plan-line-col,104px); min-width:var(--plan-line-col,104px); max-width:var(--plan-line-col,104px); }
.mt-compact-plan-table th.week-head, .mt-compact-plan-table td.week-total { width:var(--plan-week-col,86px); min-width:var(--plan-week-col,86px); max-width:var(--plan-week-col,86px); }
.mt-plan-width-control { display:inline-flex; align-items:center; gap:4px; border:1px solid var(--line-2); background:#fffdf8; border-radius:8px; padding:4px 6px; font-size:9px; font-weight:900; color:var(--muted-3); }
.mt-plan-width-control input { width:56px; min-height:24px; border:1px solid var(--line-2); background:white; padding:2px 4px; font-size:9px; text-align:right; }
.mt-compact-plan-table th { position:sticky; top:0; z-index:4; background:var(--ink); color:var(--bg); border-right:1px solid var(--on-dark-line); border-bottom:1px solid var(--ink); padding:8px 7px; font-size:10px; text-align:center; }
.mt-compact-plan-table th small { display:block; color:var(--on-dark-2); font-size:9px; margin-top:2px; }
.mt-compact-plan-table th.line-head, .mt-compact-plan-table td.line-cell { position:sticky; left:0; z-index:5; width:104px; min-width:104px; }
.mt-compact-plan-table td { border-right:1px solid var(--line-3); border-bottom:1px solid var(--line-3); padding:0; height:64px; vertical-align:top; background:var(--surface); }
.mt-compact-plan-table td.line-cell { background:#fff8eb; padding:8px; font-size:10px; color:var(--ink); border-right:1px solid var(--line-2); }
.mt-compact-plan-table td.line-cell b { display:block; font-family:'Archivo',sans-serif; font-size:12px; }
.mt-compact-plan-table td.line-cell span { display:block; margin-top:3px; color:var(--muted-2); font-size:9px; }
.compact-plan-cell-btn { width:100%; height:100%; min-height:64px; display:block; text-align:left; border:0; background:#fffdf8; color:var(--ink); cursor:pointer; padding:6px 7px; overflow:hidden; }
.compact-plan-cell.ok .compact-plan-cell-btn { background:#eef8f2; }
.compact-plan-cell.warn .compact-plan-cell-btn { background:#fff6d9; }
.compact-plan-cell.late .compact-plan-cell-btn { background:#fde9e4; }
.compact-plan-cell.changeover .compact-plan-cell-btn { background:#fff0df; box-shadow:inset 0 0 0 2px rgba(201,111,22,.46); }
.compact-plan-cell.changeover.late .compact-plan-cell-btn { background:#fde9e4; box-shadow:inset 0 0 0 2px rgba(180,35,24,.48); }
.compact-plan-cell .c-ready { margin-top:2px; display:inline-flex; align-items:center; max-width:100%; border:1px solid rgba(31,31,29,.1); border-radius:999px; padding:1px 5px; font-size:8.5px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.compact-plan-cell .c-ready.ok { background:#e7f1e8; color:#1f6f54; }
.compact-plan-cell .c-ready.warn { background:#fff0c7; color:#7a560f; }
.compact-plan-cell .c-ready.late { background:#f6d3cb; color:#8c241a; }
.compact-plan-cell .c-ready.info { background:#e7eefc; color:#2b4d8c; }
.c-daytotal { margin-top:4px; font-size:8.5px; font-weight:800; border-top:1px dashed var(--line-3); padding-top:3px; }
.c-daytotal.ok { color:#1f6f54; }
.c-daytotal.warn { color:#a35b06; }
.mt-plan-actual-sync { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; border:1px solid var(--line-2); border-radius:12px; padding:8px 10px; margin:8px 0; font-size:11px; }
.mt-plan-actual-sync.ok { background:#eef6ef; border-color:#bcdcc2; }
.mt-plan-actual-sync.warn { background:#fff8e8; border-color:#f1d69a; }
.mt-plan-actual-sync.late { background:#fdefec; border-color:#f3c2b6; }
.mt-plan-actual-sync.info { background:#eef2fb; border-color:#c7d5f2; }
.mt-plan-slim-note { border:1px dashed var(--line-2); background:#fffaf1; border-radius:10px; padding:8px 10px; font-size:10px; color:var(--muted-3); line-height:1.4; }
.mt-plan-collapse { border:1px solid var(--line-2); border-radius:12px; background:var(--surface); margin-top:10px; overflow:hidden; }
.mt-plan-collapse > summary { cursor:pointer; padding:10px 12px; background:#fff7ea; font-family:'Archivo',sans-serif; font-weight:800; list-style:none; display:flex; justify-content:space-between; gap:8px; align-items:center; }
.mt-plan-collapse > summary::-webkit-details-marker { display:none; }
.mt-plan-collapse[open] > summary { border-bottom:1px solid var(--line-3); }
.mt-plan-collapse-body { padding:10px 12px; }
.mt-plan-available-picker { margin-top:8px; border:1px solid var(--line-2); border-radius:12px; background:#fffdf8; overflow:hidden; }
.mt-plan-available-picker > summary { cursor:pointer; padding:8px 10px; font-size:10px; font-weight:900; color:var(--muted-3); background:#fffaf1; }
.mt-plan-style-picks { display:grid; gap:5px; padding:8px; max-height:210px; overflow:auto; }
.mt-plan-style-pick { border:1px solid var(--line-2); background:white; border-radius:9px; padding:6px 7px; text-align:left; cursor:pointer; font-size:10px; }
.mt-plan-style-pick b { display:block; font-size:11px; color:var(--ink); }
.mt-plan-style-pick span { color:var(--muted-2); }
.mt-plan-style-pick.ok { border-color:#b7d8c7; background:#f2fbf5; }
.mt-plan-style-pick.warn { border-color:#ead28a; background:#fffaf0; }
.mt-plan-style-pick.late { border-color:#ebb2a8; background:#fff4f1; }

.compact-plan-cell-btn:hover { outline:2px solid rgba(201,111,22,.22); outline-offset:-2px; }
.compact-add { display:flex; height:100%; align-items:center; justify-content:center; color:var(--muted-1); font-weight:800; font-size:12px; }
.c-style { font-family:'Archivo',sans-serif; font-size:11.5px; font-weight:800; line-height:1.1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c-brand { font-size:9px; color:var(--muted-2); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-transform:uppercase; }
.c-metrics { display:flex; justify-content:space-between; gap:5px; align-items:baseline; margin-top:3px; font-size:10.5px; }
.c-metrics b { font-family:'Archivo',sans-serif; font-size:13px; }
.c-metrics span, .c-note, .c-auto { color:var(--muted-2); font-size:9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c-auto { color:var(--blue-fg); margin-top:1px; }
.c-changeover { display:inline-flex; align-items:center; gap:4px; margin-top:3px; border:1px solid #f1b15d; background:#fff7ea; color:#94440f; border-radius:999px; padding:2px 6px; font-size:8.5px; font-weight:900; text-transform:uppercase; letter-spacing:.2px; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c-changeover .left { color:#5f3a07; font-weight:900; }
.c-changeover .lost { color:#8c241a; font-weight:900; }
.c-changeover .free { color:#1f6f54; font-weight:900; }
.mt-plan-changeover-read { border:1px solid #f1b15d; background:#fff7ea; color:#94440f; border-radius:10px; padding:8px 10px; font-size:10px; font-weight:800; line-height:1.35; margin-top:8px; }
.week-total { background:#f7f1e8 !important; font-family:'Archivo',sans-serif; font-size:13px; font-weight:800; text-align:right; padding:8px !important; }
.compact-total-row td { background:#eee7dc !important; padding:8px !important; font-size:10px; }
.compact-total-row td span { display:block; color:var(--muted-2); font-size:9px; margin-top:2px; }
.mt-plan-editor-backdrop { position:fixed; inset:0; background:rgba(20,18,15,.5); display:flex; align-items:center; justify-content:center; padding:18px; z-index:90; }
.mt-plan-editor { width:min(660px,96vw); max-height:92vh; overflow:hidden; background:var(--surface); border:1px solid var(--ink); border-radius:18px; box-shadow:0 24px 80px rgba(0,0,0,.3); display:flex; flex-direction:column; }
.mt-plan-editor-head { background:var(--ink); color:var(--bg); padding:16px 18px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
.mt-plan-editor-head b { font-family:'Archivo',sans-serif; font-size:17px; letter-spacing:-.1px; }
.mt-plan-editor-head span { display:block; color:var(--on-dark-2); font-size:11px; margin-top:3px; font-weight:600; }
.mt-plan-editor-body { padding:18px; overflow:auto; display:flex; flex-direction:column; gap:14px; }
.mt-editor-fields-grid { display:grid; grid-template-columns:1.3fr .8fr .62fr .55fr; gap:12px 14px; align-items:end; }
.mt-editor-fields-grid .wide { grid-column:span 2; }
.mt-editor-fields-grid.compact { grid-template-columns:repeat(4,minmax(0,1fr)); }
.mt-plan-engine-toggle { width:100%; margin:0; border:1px solid var(--line-2); background:#fff7ea; color:var(--ink); border-radius:10px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center; text-align:left; cursor:pointer; font-weight:800; font-size:12px; }
.mt-plan-engine-toggle b { color:var(--muted-2); }
.mt-plan-editor-engine { border:1px solid var(--line-2); border-radius:12px; padding:14px; background:#fffaf1; display:flex; flex-direction:column; gap:10px; }
.mt-plan-editor-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:2px; padding-top:14px; border-top:1px solid var(--line-2); }
.mt-btn.danger { color:var(--danger); border-color:#e8b8ae; }
.mt-plan-need-mini.expanded { grid-template-columns:repeat(5,minmax(0,1fr)); margin-top:9px; }
@media (max-width:900px){ .mt-editor-fields-grid,.mt-editor-fields-grid.compact{grid-template-columns:1fr 1fr;} .mt-editor-fields-grid .wide{grid-column:span 2;} .mt-compact-plan-table{min-width:820px;} }


.mt-manager-impact-list { display:grid; gap:10px; }
.mt-manager-card { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); padding:12px; }
.mt-manager-card.late { border-color:#e7aaa0; background:#fff7f5; }
.mt-manager-card.warn { border-color:#dfc16a; background:#fffaf0; }
.mt-manager-card-head { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; margin-bottom:8px; }
.mt-manager-card-head b { font-family:'Archivo',sans-serif; font-size:15px; }
.mt-manager-metrics { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
.mt-manager-metrics span { border:1px solid var(--line-2); background:#fffdf8; border-radius:9px; padding:5px 8px; font-size:10px; }
.mt-manager-metrics b { font-family:'Archivo',sans-serif; font-size:13px; }
.mt-manager-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
.mt-manager-dept-grid { display:grid; gap:10px; }
.mt-manager-dept-card { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); overflow:hidden; }
.mt-manager-dept-card > summary { cursor:pointer; list-style:none; padding:12px; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; background:#fffaf1; }
.mt-manager-dept-card > summary::-webkit-details-marker { display:none; }
.mt-manager-dept-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; }
.mt-manager-dept-sub { font-size:10px; color:var(--muted-2); margin-top:3px; line-height:1.35; }
.mt-manager-task-row { display:grid; grid-template-columns:1.4fr repeat(4,minmax(80px,.6fr)) 1.8fr; gap:8px; padding:9px 12px; border-top:1px solid var(--line-3); align-items:start; font-size:10.5px; }
.mt-manager-task-row:hover { background:#fffaf1; }
.mt-manager-task-row b { font-family:'Archivo',sans-serif; font-size:13px; }
.mt-manager-info-note { border:1px dashed var(--line-2); background:#fffdf8; border-radius:12px; padding:10px; color:var(--muted-3); font-size:10.5px; line-height:1.45; margin-top:10px; }
@media (max-width:900px){ .mt-manager-task-row{grid-template-columns:1fr;} }


.mt-bulk-preview-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:10px; }
.mt-bulk-preview-card { border:1px solid var(--line-2); border-radius:14px; background:var(--surface); overflow:hidden; }
.mt-bulk-preview-card.error { border-color:#e7aaa0; background:#fff7f5; }
.mt-bulk-preview-card.warn { border-color:#dfc16a; background:#fffaf0; }
.mt-bulk-preview-head { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; padding:10px; background:#fffaf1; border-bottom:1px solid var(--line-3); }
.mt-bulk-preview-title { font-family:'Archivo',sans-serif; font-size:14px; font-weight:800; }
.mt-bulk-change-list { display:grid; gap:6px; padding:10px; }
.mt-bulk-change { border:1px solid var(--line-3); border-radius:10px; padding:7px 8px; background:white; }
.mt-bulk-change b { display:block; font-size:9px; text-transform:uppercase; color:var(--muted-2); letter-spacing:.3px; margin-bottom:3px; }
.mt-bulk-old { color:#9a3412; text-decoration:line-through; margin-right:6px; }
.mt-bulk-new { color:#166534; font-weight:800; }
.mt-size-set-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 8px; border-radius:999px; border:1px solid var(--line-2); background:#eef7f2; color:#166534; font-size:9.5px; font-weight:800; }

@media print { .mt-top,.mt-toolbar,.no-print,.mt-tabs { display:none !important; } .mt-page{padding:0;} .mt-card,.mt-table-wrap{border:0; box-shadow:none;} .mt-table th{background:#111 !important; color:#fff !important;} }
@media (max-width:1180px){ .mt-dash-grid{grid-template-columns:repeat(3,minmax(0,1fr));} .mt-mini-board{grid-template-columns:1fr;} .mt-summary-strip,.mt-month-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
@media (max-width:980px){ .mt-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-two{grid-template-columns:1fr;} }
@media (max-width:620px){ .mt-entry-metrics{grid-template-columns:1fr;} .mt-grid{grid-template-columns:1fr;} .mt-dash-grid,.mt-summary-strip,.mt-month-grid{grid-template-columns:1fr;} .mt-page{padding:14px 12px 28px;} .mt-header{padding:15px 12px 10px;} .mt-tabs{padding-left:12px; padding-right:12px;} }
`;

const DEFAULT_SIZE_SETS = {
  alpha: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y"],
  infants: ["4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"],
  baby: ["3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2-4Y", "4-6Y", "6-8Y"],
  waist: ["30", "32", "34", "36", "38"],
};
function cleanSizeToken(v){ return String(v || "").trim().toUpperCase(); }
function normalizeSizeGroupKey(v){
  return String(v || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g,"_").replace(/^_+|_+$/g,"") || "custom";
}
function getCustomSizeSets(){
  try {
    const parsed = JSON.parse(localStorage.getItem("production_size_sets") || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    const out = {};
    Object.entries(parsed).forEach(([k,arr])=>{
      const key = normalizeSizeGroupKey(k);
      const sizes = Array.isArray(arr) ? arr.map(cleanSizeToken).filter(Boolean) : [];
      if (key && sizes.length) out[key] = Array.from(new Set(sizes));
    });
    return out;
  } catch { return {}; }
}
function getSizeSets(){ return { ...DEFAULT_SIZE_SETS, ...getCustomSizeSets() }; }
function sizeSetsToText(sets=getSizeSets()){
  return Object.entries(sets).map(([k,v])=>`${k} = ${(v||[]).join(", ")}`).join("\n");
}
function parseSizeSetsText(text){
  const out = {};
  String(text || "").split(/\r?\n/).forEach(line=>{
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/[:=]/);
    if (parts.length < 2) return;
    const key = normalizeSizeGroupKey(parts.shift());
    const sizes = parts.join("=").split(/[,/|]+/).map(cleanSizeToken).filter(Boolean);
    if (key && sizes.length) out[key] = Array.from(new Set(sizes));
  });
  return out;
}
function saveCustomSizeSets(allSets){
  const clean = {};
  Object.entries(allSets || {}).forEach(([k,arr])=>{
    const key = normalizeSizeGroupKey(k);
    const sizes = Array.isArray(arr) ? arr.map(cleanSizeToken).filter(Boolean) : [];
    if (key && sizes.length) clean[key] = Array.from(new Set(sizes));
  });
  try { localStorage.setItem("production_size_sets", JSON.stringify(clean)); } catch {}
}

const STAGES = [
  { key: "cutting", label: "Cutting", short: "Cut", owner: "Cutting HOD" },
  { key: "printing", label: "Printing", short: "Print", owner: "Printing HOD" },
  { key: "embroidery", label: "Embroidery", short: "Emb", owner: "Embroidery HOD" },
  { key: "stitching", label: "Stitching", short: "Stitch", owner: "Stitching HOD" },
  { key: "checking", label: "Checking", short: "Check", owner: "Checking HOD" },
  { key: "packing", label: "Packing", short: "Pack", owner: "Packing HOD" },
  { key: "dispatch", label: "Dispatch", short: "Disp", owner: "Dispatch HOD" },
];
const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));
const BASE_ROUTE = ["cutting", "stitching", "checking", "packing", "dispatch"];

function n(v){ return Number(v || 0) || 0; }
function fmt(v){ return n(v).toLocaleString("en-IN"); }

function initials(row){
  const text = [row.buyer, row.style_no].filter(Boolean).join(" ").trim() || "ST";
  return text.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
}
function LazyStylePhoto({ row, large=false }){
  const [err, setErr] = useState(false);
  const src = row?.photo_thumb_url || row?.photo_url || "";
  const cls = `mt-thumb ${large ? "large" : ""}`;
  if (!src || err) return <div className={cls}><div className="mt-photo-empty"><ImageIcon size={large ? 28 : 16}/><br/>{initials(row)}</div></div>;
  return <div className={cls}><img src={src} alt={`${row.style_no || "style"} photo`} loading="lazy" decoding="async" fetchPriority="low" onError={()=>setErr(true)} /></div>;
}
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`; }
function stableHash(text){
  let h = 2166136261;
  const s = String(text || "");
  for (let i=0; i<s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
function isUuid(v){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || "").trim());
}
function hash32Hex(text, seed=0){
  let h = (2166136261 ^ seed) >>> 0;
  const s = String(text || "");
  for (let i=0; i<s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8,"0");
}
function stableUuidFromText(text){
  const base = String(text || "production-order");
  let hex = hash32Hex(base,1) + hash32Hex(base,2) + hash32Hex(base,3) + hash32Hex(base,4);
  hex = hex.slice(0,12) + "4" + hex.slice(13);
  const variant = (8 + (parseInt(hex[16] || "0", 16) % 4)).toString(16);
  hex = hex.slice(0,16) + variant + hex.slice(17);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}
function stableProductionOrderId(row){
  const existing = String(row?.id || "").trim();
  // Supabase production_orders.id is UUID. Old browser/demo ids like prod_xxx/demo_xxx
  // must never be sent to Supabase or Postgres rejects them as invalid uuid syntax.
  if (isUuid(existing)) return existing;
  const key = [row?.order_no, row?.style_no, row?.colour, row?.component].map(x=>String(x||"").trim().toUpperCase()).join("|");
  return stableUuidFromText(key);
}
function parseComponentList(text){
  return Array.from(new Set(String(text || "").split(/[,/|+]+/).map(x=>String(x||"").trim().toUpperCase()).filter(Boolean)));
}
function todayIST(){
  return new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Kolkata", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
}
function today(){ return todayIST(); }
function dateDiff(a,b){
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / 86400000);
}
function dateToYMDLocal(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function previousWorkingDay(from=today()){
  const d = new Date(`${from}T12:00:00`);
  do { d.setDate(d.getDate() - 1); } while (d.getDay() === 0); // Sunday normally non-working
  return dateToYMDLocal(d);
}
const PRODUCTION_PERMISSIONS = [
  ["production.view", "View production app"],
  ["production.entry_dpr", "Enter DPR / WIP movements"],
  ["production.correct_entry", "Correct old register entries"],
  ["production.edit_styles", "Add / edit styles"],
  ["production.delete_styles", "Delete / hard-delete styles"],
  ["production.export", "Export reports"],
  ["production.manage_photos", "Manage photos"],
  ["production.manage_routes", "Manage routes"],
  ["production.manage_settings", "Manage settings"],
  ["production.manage_users", "Manage users / permissions"],
  ["production.audit_view", "View audit history"],
];
const ALL_PRODUCTION_PERMISSION_KEYS = PRODUCTION_PERMISSIONS.map(p=>p[0]);
const ROLE_PERMISSIONS = {
  "Super Admin": ALL_PRODUCTION_PERMISSION_KEYS,
  Admin: ALL_PRODUCTION_PERMISSION_KEYS,
  "Production Manager": ALL_PRODUCTION_PERMISSION_KEYS,
  "Production Coordinator": ["production.view","production.entry_dpr","production.correct_entry","production.edit_styles","production.delete_styles","production.export","production.manage_photos","production.manage_routes","production.audit_view"],
  "Data Operator": ["production.view","production.entry_dpr"],
  Management: ["production.view","production.export","production.audit_view"],
  "Cutting HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Printing HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Embroidery HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Stitching HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Checking HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Packing HOD": ["production.view","production.entry_dpr","production.correct_entry","production.audit_view"],
  "Dispatch User": ["production.view","production.entry_dpr","production.audit_view"],
  "Merchant Read-only": ["production.view"],
};
const PRODUCTION_ROLES = Object.keys(ROLE_PERMISSIONS);
function normalizeUserEmail(email){ return String(email || "").trim().toLowerCase(); }
function emailLooksValid(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeUserEmail(email)); }
function displayNameFromEmail(email){ return normalizeUserEmail(email).split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,m=>m.toUpperCase()); }
function defaultUserProfile(){
  return { name:"", email:"", role:"Data Operator", department:"Production", permissions:[], access_status:"approved", password_hash:"", requested_role:"Data Operator", requested_department:"Production" };
}
function currentUserProfile(){
  try {
    const raw = localStorage.getItem("production_user_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      const email = normalizeUserEmail(parsed?.email || "");
      return { ...defaultUserProfile(), ...parsed, email, name:String(parsed?.name || parsed?.display_name || displayNameFromEmail(email) || "").trim() };
    }
    const legacy = localStorage.getItem("production_user_name") || localStorage.getItem("mt_user_name") || "";
    if (legacy) return { ...defaultUserProfile(), name:legacy, email:normalizeUserEmail(localStorage.getItem("production_user_email") || ""), role:localStorage.getItem("production_user_role") || "Data Operator", department:localStorage.getItem("production_user_department") || "Production" };
  } catch {}
  return defaultUserProfile();
}
function saveCurrentUserProfile(profile){
  const email = normalizeUserEmail(profile?.email || "");
  const clean = { ...defaultUserProfile(), ...profile, email, name:String(profile?.name || displayNameFromEmail(email) || "").trim(), role:profile?.role || "Data Operator", department:profile?.department || "Production" };
  try {
    localStorage.setItem("production_user_profile", JSON.stringify(clean));
    localStorage.setItem("production_user_name", clean.name);
    localStorage.setItem("production_user_role", clean.role);
    localStorage.setItem("production_user_email", clean.email);
    localStorage.setItem("production_user_department", clean.department);
  } catch {}
  return clean;
}
function clearCurrentUserProfile(){
  try {
    localStorage.removeItem("production_user_profile");
    localStorage.removeItem("production_user_name");
    localStorage.removeItem("production_user_role");
    localStorage.removeItem("production_user_email");
    localStorage.removeItem("production_user_department");
  } catch {}
}
function currentUserName(){
  const p = currentUserProfile();
  return p.name || "Not logged in";
}
function currentUserRole(){ return currentUserProfile().role || "Data Operator"; }
function isFullAccessRole(role){ return ["Super Admin","Admin","Production Manager"].includes(role); }
function rolePermissions(role){ return new Set([...(ROLE_PERMISSIONS[role] || []), ...((currentUserProfile().permissions || []))]); }
function currentUserCan(permission){
  const p = currentUserProfile();
  if (!p.name) return false;
  if (p.access_status && p.access_status !== "approved") return false;
  if (isFullAccessRole(p.role)) return true;
  return rolePermissions(p.role).has(permission);
}
function requireCurrentPermission(permission, actionLabel="this action"){
  if (currentUserCan(permission)) return null;
  return { error:{ message:`Permission blocked: ${currentUserName()} (${currentUserRole()}) cannot ${actionLabel}. Required: ${permission}` } };
}
function productionBrowserId(){
  try {
    let id = localStorage.getItem("production_browser_id");
    if (!id) { id = `browser_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`; localStorage.setItem("production_browser_id", id); }
    return id;
  } catch { return "browser_unknown"; }
}
function userAuditBase(extra={}){
  const p = currentUserProfile();
  return {
    user_name:p.name || "Not logged in", user_email:p.email || "", user_role:p.role || "", user_department:p.department || "",
    browser_id:productionBrowserId(), app_version:APP_VERSION, created_at:new Date().toISOString(), ...extra
  };
}

function productionTabLabel(tab){
  const map = { dashboard:"Dashboard", planning:"Planning", wip:"Live WIP", entry:"DPR Entry", register:"Register", review:"Review", owners:"Who to Chase", monthly:"Monthly", styles:"Styles", routes:"Routes", photos:"Photos", reports:"Reports", users:"Users/Audit", settings:"Settings" };
  return map[tab] || String(tab || "Dashboard");
}
function productionPresenceContext(tab, drawer=null, drill=null){
  const base = productionTabLabel(tab);
  if (drawer?.row) {
    const row = drawer.row || {};
    const stage = drawer.stage || rowStatus(row).stage || "";
    return `${base} · ${row.style_no || "Style"}${row.order_no ? ` / ${row.order_no}` : ""}${stage ? ` · ${stageLabel(stage)}` : ""}`;
  }
  if (drill?.title) return `${base} · ${drill.title}`;
  return base;
}
function buildProductionPresencePayload(profile, tab, drawer=null, drill=null){
  const p = profile || currentUserProfile();
  const row = drawer?.row || {};
  const stage = drawer?.stage || "";
  return {
    user_name:p.name || displayNameFromEmail(p.email) || "Unknown user",
    user_email:normalizeUserEmail(p.email),
    user_role:p.role || "",
    user_department:p.department || "",
    page_key:tab || "dashboard",
    page:productionTabLabel(tab),
    context:productionPresenceContext(tab, drawer, drill),
    order_no:row.order_no || "",
    style_no:row.style_no || "",
    colour:row.colour || "",
    component:row.component || "",
    stage:stage || "",
    stage_label:stage ? stageLabel(stage) : "",
    browser_id:productionBrowserId(),
    app_version:APP_VERSION,
    online_at:new Date().toISOString(),
  };
}
function flattenProductionPresenceState(state){
  // Supabase presence can keep several metas for the same user/browser when track() is called repeatedly
  // or when React remounts during deploy/hot refresh. Show one clean row per signed-in user.
  const rawRows = Object.values(state || {}).flat().map((p,idx)=>({
    User:p.user_name || displayNameFromEmail(p.user_email) || "Unknown user",
    Role:p.user_role || "",
    Department:p.user_department || "",
    Page:p.page || productionTabLabel(p.page_key),
    Context:p.context || p.page || "",
    Order:p.order_no || "",
    Style:p.style_no || "",
    Colour:p.colour || "",
    Component:p.component || "",
    Stage:p.stage_label || stageLabel(p.stage || ""),
    Email:normalizeUserEmail(p.user_email || ""),
    Browser:p.browser_id || "",
    Seen:p.online_at || "",
    _presenceIdx:idx,
  }));
  const byUser = new Map();
  rawRows.forEach(row=>{
    const key = row.Email || row.User || row.Browser || `peer_${row._presenceIdx}`;
    const prev = byUser.get(key);
    if (!prev || String(row.Seen || "") >= String(prev.Seen || "")) byUser.set(key, row);
  });
  return Array.from(byUser.values()).sort((a,b)=>String(a.User).localeCompare(String(b.User)) || String(b.Seen).localeCompare(String(a.Seen)));
}
function presenceSummaryText(peers=[]){
  const count = (peers || []).length;
  if (!count) return "Realtime presence starting";
  const pages = uniqueList((peers || []).map(p=>p.Page).filter(Boolean));
  return `${count} live user${count===1?"":"s"}${pages.length ? ` · ${pages.slice(0,3).join(", ")}${pages.length>3?"…":""}` : ""}`;
}
function PresenceStrip({ peers=[] }){
  const rows = (peers || []).slice(0,8);
  return <div className="mt-presence-strip no-print">
    <span className="mt-toolbar-label">Live presence</span>
    {rows.length ? rows.map((p,idx)=><span key={`${p.Email}-${p.Browser}-${idx}`} className="mt-presence-pill" title={`${p.User} · ${p.Context}${p.Style ? ` · ${p.Style}` : ""}`}>
      <span className="mt-presence-dot"/> <b>{p.User}</b><span>{p.Context}</span>
    </span>) : <span className="mt-chip mt-muted">Realtime users will appear here after Supabase presence connects.</span>}
  </div>;
}
async function upsertProductionAppUser(profile=currentUserProfile()){
  if (!profile?.name || !hasValidSupabaseEnv()) return { skipped:true };
  const row = {
    display_name:profile.name || displayNameFromEmail(profile.email),
    email:normalizeUserEmail(profile.email) || null,
    role:profile.role || "Data Operator",
    department:profile.department || "Production",
    access_status:profile.access_status || "approved",
    requested_role:profile.requested_role || profile.role || "Data Operator",
    requested_department:profile.requested_department || profile.department || "Production",
    password_hash:profile.password_hash || undefined,
    is_active:true,
    browser_id:productionBrowserId(), last_seen_at:new Date().toISOString(), app_version:APP_VERSION
  };
  return fetchRestUpsertToSupabase("production_app_users", [row], row.email ? "email" : "display_name");
}
async function recordUserSession(event_type, profile=currentUserProfile(), extra={}){
  if (!profile?.name || !hasValidSupabaseEnv()) return { skipped:true };
  const row = userAuditBase({ event_type, action:event_type, metadata:extra });
  const result = await fetchRestInsertToSupabase("production_user_sessions", [row]);
  await upsertProductionAppUser(profile);
  return result;
}
async function recordProductionAudit(action, meta={}){
  if (!hasValidSupabaseEnv()) return { skipped:true };
  const row = userAuditBase({ action, event_type:action, table_name:meta.table_name || "", order_no:meta.order_no || "", style_no:meta.style_no || "", colour:meta.colour || "", component:meta.component || "", stage:meta.stage || "", entry_type:meta.entry_type || "", entry_date:meta.entry_date || null, qty:n(meta.qty || 0), source:meta.source || "app", before_data:meta.before_data || null, after_data:meta.after_data || null, metadata:meta.metadata || {} });
  return fetchRestInsertToSupabase("production_audit_log", [row]);
}
async function fetchProductionAudit(limit=250){
  return fetchRestSelectFromSupabase("production_audit_log", `select=*&order=created_at.desc&limit=${limit}`);
}
async function fetchProductionUsers(){
  return fetchRestSelectFromSupabase("production_app_users", "select=*&order=last_seen_at.desc&limit=500");
}
async function hashLoginPassword(email, password){
  const cleanEmail = normalizeUserEmail(email);
  const cleanPass = String(password || "");
  const text = `production-dpr-login::${cleanEmail}::${cleanPass}`;
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  } catch {
    let h = 0;
    for (let i=0; i<text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
    return `fallback_${Math.abs(h)}`;
  }
}
async function fetchProductionUserByEmail(email){
  const clean = normalizeUserEmail(email);
  if (!clean || !hasValidSupabaseEnv()) return { data:null, skipped:true };
  const q = `select=*&email=eq.${encodeURIComponent(clean)}&limit=1`;
  const res = await fetchRestSelectFromSupabase("production_app_users", q);
  return { ...res, data:Array.isArray(res.data) ? res.data[0] || null : null };
}
async function requestProductionAccess(form){
  const email = normalizeUserEmail(form.email);
  const passwordHash = await hashLoginPassword(email, form.password || "");
  const row = {
    display_name:String(form.name || displayNameFromEmail(email)).trim(),
    email,
    role:"Pending Approval",
    department:form.department || form.requested_department || "Production",
    requested_role:form.requested_role || "Data Operator",
    requested_department:form.department || form.requested_department || "Production",
    password_hash:passwordHash,
    access_status:"pending",
    is_active:false,
    browser_id:productionBrowserId(),
    last_seen_at:new Date().toISOString(),
    app_version:APP_VERSION
  };
  return fetchRestUpsertToSupabase("production_app_users", [row], "email");
}
async function updateProductionUserAccess(email, patch){
  const clean = normalizeUserEmail(email);
  if (!clean || !hasValidSupabaseEnv()) return { error:{ message:"Missing email or Supabase config" } };
  const existing = await fetchProductionUserByEmail(clean);
  const row = { ...(existing.data || {}), email:clean, ...patch, last_seen_at:new Date().toISOString(), app_version:APP_VERSION };
  return fetchRestUpsertToSupabase("production_app_users", [row], "email");
}
function defaultEntryDate(ledger=[]){
  // Factory reality: production is normally entered next day. Use latest activity date if present,
  // otherwise open entry calendars to previous working day, not today.
  const latest = latestActivityDate(ledger);
  return latest && latest !== today() ? latest : previousWorkingDay();
}
function backdateRisk(entryDate){
  const d = dateDiff(entryDate, today());
  if (d < 0) return { days:d, label:"Future date", tone:"late", approval:"blocked_future_date", locked:true, sameDay:false, future:true, reportOnly:false };
  if (d === 0) return { days:d, label:"Same-day flag", tone:"warn", approval:"date_flag_report_only", locked:false, sameDay:true, future:false, reportOnly:true };
  if (d === 1) return { days:d, label:"Normal next-day entry", tone:"ok", approval:"not_required", locked:false, sameDay:false, future:false, reportOnly:false };
  return { days:d, label:`Backdate flag ${d}d`, tone:d>3?"warn":"info", approval:"date_flag_report_only", locked:false, sameDay:false, future:false, reportOnly:true };
}
function entryTypeForField(field){
  if (field === "received") return "legacy_feed";
  if (field === "output") return "good_output";
  if (field === "issued") return "issue";
  if (field === "reject") return "reject";
  if (field === "alter") return "alter_issue";
  if (field === "alter_clear") return "alter_clear";
  if (field === "missing") return "missing";
  return field;
}
const ENTRY_FIELDS = [
  { key:"output", label:"Completed / Output", help:"Good quantity completed by the selected department." },
  { key:"issued", label:"Issue / Feed Next Dept", help:"Good quantity handed to the next active department. This is the next department feed in your factory flow." },
];
const RAM_ENTRY_FIELDS = [
  { key:"reject", label:"Rejection", help:"Rejected/lost quantity by size." },
  { key:"missing", label:"Missing", help:"Missing/untraceable quantity by size." },
  { key:"alter", label:"Alter Defect", help:"Alter/repair quantity raised by size." },
  { key:"alter_clear", label:"Alter Clear", help:"Alter quantity repaired and returned to good output." },
];
const HIDDEN_ENTRY_FIELDS = [];
const ALL_ENTRY_FIELDS = [...ENTRY_FIELDS, ...RAM_ENTRY_FIELDS];
function fieldLabel(field){ return ALL_ENTRY_FIELDS.find(f=>f.key===field)?.label || field; }
function fieldHelp(field){ return ALL_ENTRY_FIELDS.find(f=>f.key===field)?.help || ""; }

function stageFeedBySize(row, stageKey){
  const sizes = sizesFor(row);
  if (stageKey === "cutting") return fileReleaseSizeQtyMap(row);
  const route = routeFor(row);
  const idx = route.indexOf(stageKey);
  if (idx <= 0) return orderSizeQtyMap(row);
  const prevStage = route[idx - 1];
  const issuedMap = Object.fromEntries(sizeMatrix(row, prevStage, "issued").map(x=>[x.size, n(x.qty)]));
  if (stageKey === "dispatch" && dispatchRejectAllowed(row)) {
    const rejectMap = preDispatchRejectBySize(row);
    return Object.fromEntries(sizes.map(size=>[size, n(issuedMap[size]) + n(rejectMap[size])]));
  }
  return issuedMap;
}
function stageRamBySize(row, stageKey){
  const reject = Object.fromEntries(sizeMatrix(row, stageKey, "reject").map(x=>[x.size,n(x.qty)]));
  const alter = Object.fromEntries(sizeMatrix(row, stageKey, "alter").map(x=>[x.size,n(x.qty)]));
  const missing = Object.fromEntries(sizeMatrix(row, stageKey, "missing").map(x=>[x.size,n(x.qty)]));
  return Object.fromEntries(sizesFor(row).map(size=>[size, n(reject[size])+n(alter[size])+n(missing[size])]));
}
function entryFieldContext(row, stage, field){
  const st = sdata(row, stage);
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  const prevStage = idx > 0 ? route[idx-1] : null;
  const nextStage = idx >= 0 && idx < route.length-1 ? route[idx+1] : null;
  const feed = stage === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stage);
  const ram = loss(st);
  if (field === "received") {
    const available = stage === "cutting" ? cuttingBaseQty(row) : feed;
    return {
      mode:"receive",
      available, previous:n(st.received), open:Math.max(0, available - n(st.received)), updatedLabel:"Updated feed",
      availableLabel: stage === "cutting" ? "Production file release qty" : `Feed from ${stageLabel(prevStage)}`,
      previousLabel:`Already fed to ${stageLabel(stage)}`, openLabel:"Open feed balance",
      note: stage === "cutting" ? "Cutting starts only after Production File Release. Use Completed / Output for cut quantity." : `Feed balance from ${stageLabel(prevStage)} into ${stageLabel(stage)}.`
    };
  }
  if (field === "issued") {
    return {
      mode:"issue", available:n(st.output), previous:n(st.issued), open:Math.max(0, n(st.output) - n(st.issued)), updatedLabel:"Updated issued",
      availableLabel:`Completed in ${stageLabel(stage)}`, previousLabel:`Already issued / fed ${nextStage ? `to ${stageLabel(nextStage)}` : "forward"}`, openLabel:`Ready to feed next dept from ${stageLabel(stage)}`,
      note: nextStage ? `Feed completed quantity from ${stageLabel(stage)} to ${stageLabel(nextStage)}.` : `Issue/dispatch completed quantity from ${stageLabel(stage)}.`
    };
  }
  if (field === "output") {
    const available = stage === "cutting" ? cuttingBaseQty(row) : feed;
    const dispatchRejectNote = stage === "dispatch" && dispatchRejectAllowed(row) ? " Includes approved rejection qty because Settings allows rejection dispatch." : "";
    return {
      mode:"output", available, previous:n(st.output), open: stage === "cutting" ? cuttingAccountableOpen(row) : Math.max(0, available - n(st.output) - ram), updatedLabel:"Updated output",
      availableLabel: stage === "cutting" ? "Production file released to cut" : (stage === "dispatch" && dispatchRejectAllowed(row) ? "Good issued + approved rejection" : `With ${stageLabel(stage)} / feed`),
      previousLabel:`Already completed in ${stageLabel(stage)}`, openLabel:`Open work in ${stageLabel(stage)}`,
      note: stage === "cutting" ? (isProductionFileReleased(row) ? "Enter new cut quantity by size against released file qty." : "Production file is not released yet — release it first.") : `Complete the open work currently with ${stageLabel(stage)}.${dispatchRejectNote}`
    };
  }
  if (["reject","missing","alter"].includes(field)) {
    const available = stage === "cutting" ? cuttingBaseQty(row) : feed;
    const openWork = Math.max(0, available - n(st.output) - ram);
    return {
      mode:"ram", available, previous:n(st[field]), open:openWork, updatedLabel:`Updated ${fieldLabel(field)}`,
      availableLabel: stage === "cutting" ? "Released/cut accountable qty" : `With ${stageLabel(stage)} / feed`,
      previousLabel:`Already ${fieldLabel(field)}`, openLabel:"Open balance available to explain",
      note:`Use ${fieldLabel(field)} to explain open balance by size. This affects R/A/M and closure.`
    };
  }
  if (field === "alter_clear") {
    return {
      mode:"alter_clear", available:n(st.alter), previous:n(st.output), open:n(st.alter), updatedLabel:"Updated good output",
      availableLabel:"Pending alter to clear", previousLabel:"Current good output", openLabel:"Alter still pending",
      note:"Alter Clear moves repaired pieces back into good output and reduces pending alter."
    };
  }
  return { available:0, previous:0, open:0, availableLabel:"Available", previousLabel:"Already entered", openLabel:"Open", updatedLabel:"Updated", note:"" };
}
function entryFieldSizeContext(row, stage, field, size){
  const feedMap = stageFeedBySize(row, stage);
  const feed = n(feedMap[size]);
  const st = sdata(row, stage);
  const output = n(sizeMatrix(row,stage,"output").find(x=>x.size===size)?.qty);
  const issued = n(sizeMatrix(row,stage,"issued").find(x=>x.size===size)?.qty);
  const received = n(sizeMatrix(row,stage,"received").find(x=>x.size===size)?.qty);
  const reject = n(sizeMatrix(row,stage,"reject").find(x=>x.size===size)?.qty);
  const alter = n(sizeMatrix(row,stage,"alter").find(x=>x.size===size)?.qty);
  const missing = n(sizeMatrix(row,stage,"missing").find(x=>x.size===size)?.qty);
  const ram = reject + alter + missing;
  if (field === "received") return { available:feed, previous:received, open:Math.max(0, feed-received) };
  if (field === "issued") return { available:output, previous:issued, open:Math.max(0, output-issued) };
  if (field === "output") { const cutSizeQty = n(fileReleaseSizeQtyMap(row)[size]); return { available: stage === "cutting" ? cutSizeQty : feed, previous:output, open:Math.max(0, (stage === "cutting" ? cutSizeQty : feed)-output-ram) }; }
  if (["reject","missing","alter"].includes(field)) return { available:feed, previous: n({reject,missing,alter}[field]), open:Math.max(0, feed-output-ram) };
  if (field === "alter_clear") return { available:alter, previous:output, open:alter };
  return { available:0, previous:0, open:0 };
}
function entryOpenQty(row, stage, field){ return n(entryFieldContext(row, stage, field).open); }
function sizeOpenTotalForField(row, stage, field){ return sizesFor(row).reduce((a,size)=>a+n(entryFieldSizeContext(row,stage,field,size).open),0); }
function isOperatorEntryMode(){ return currentUserRole() === "Data Operator"; }
function masterSizeSetForRow(row){ return new Set(sizesFor(row).map(sz=>cleanSizeToken(sz))); }
function entrySizeGateMessages(changes=[], opts={}){
  const allowNegativeLegacy = opts.allowNegativeLegacy !== false;
  const messages = [];
  (changes || []).forEach(c=>{
    const size = cleanSizeToken(c.size);
    if (!size) return;
    const allowed = masterSizeSetForRow(c.row);
    if (allowed.has(size)) return;
    if (allowNegativeLegacy && n(c.delta) < 0) return;
    messages.push(`${c.row?.style_no || "Style"} / ${c.row?.colour || ""} / ${c.row?.component || ""}: size ${size} is not in master size set (${sizesFor(c.row).join(" / ")}). Map/fix the style size set before saving.`);
  });
  return Array.from(new Set(messages));
}
function cleanPositiveEntryInput(value){ return Math.max(0, n(String(value || "").replace(/[^0-9]/g,""))); }
function cappedEntryInputValue(row, stage, field, size, value){
  const requested = cleanPositiveEntryInput(value);
  const open = Math.max(0, n(entryFieldSizeContext(row, stage, field, size).open));
  return String(Math.min(requested, open));
}
function dayCloseSummaryRows(ledger=[], entryDate=today()){
  const map = new Map();
  (ledger || []).forEach(e=>{
    if (ledgerDate(e) !== entryDate) return;
    const stage = ledgerStage(e);
    const type = ledgerType(e);
    const key = `${stage}|${type}`;
    if (!map.has(key)) map.set(key, { Entry_Date:entryDate, Dept:stageLabel(stage), Activity:registerActivityLabel(type), Qty:0, Entry_Rows:0, Styles:new Set(), Users:new Set() });
    const g = map.get(key);
    g.Qty += n(e.qty ?? e.delta);
    g.Entry_Rows += 1;
    g.Styles.add([e.order_no || e.order || "", e.style_no || e.style || "", e.colour || "", e.component || ""].filter(Boolean).join(" / "));
    g.Users.add(e.changed_by || e.created_by || "");
  });
  return Array.from(map.values()).map(g=>({ Entry_Date:g.Entry_Date, Dept:g.Dept, Activity:g.Activity, Qty:g.Qty, Entry_Rows:g.Entry_Rows, Styles:g.Styles.size, Users:Array.from(g.Users).filter(Boolean).join(", ") })).sort((a,b)=>String(a.Dept).localeCompare(String(b.Dept)) || String(a.Activity).localeCompare(String(b.Activity)));
}
function conservationViolationsForRow(row){
  const out = [];
  routeFor(row).forEach(stage=>{
    const c = cellBreakup(row, stage);
    if (c.skipped) return;
    const orderQty = n(row.order_qty);
    const allowedCutQty = orderQty * (1 + cuttingToleranceFrac());
    const feed = stage === "cutting" ? orderQty : stageFeed(row, stage);
    const allowedFeed = stage === "cutting" ? allowedCutQty : feed;
    const good = n(c.received);
    const ram = n(c.ram);
    const open = n(c.open);
    const shortClose = stage === "cutting" ? n(c.shortClose) : 0;
    const accountable = good + ram + shortClose;
    const accounted = accountable + open;
    let diff = 0;
    let over = 0;
    let kind = "";
    if (stage === "cutting") {
      // Cutting below order/file-release is normal open cutting work, not a wrong entry.
      // Only flag cutting when accountable cut/R-A-M/short-close exceeds order + tolerance.
      over = Math.max(0, accountable - allowedFeed);
      diff = over;
      kind = over ? "over_tolerance" : "";
    } else {
      over = Math.max(0, accountable - feed);
      diff = Math.abs(accounted - feed);
      kind = over ? "over_feed" : (diff > 0.5 ? "feed_output_mismatch" : "");
    }
    if (diff > 0.5) out.push({
      row, stage, feed, allowedFeed, good, ram, open, shortClose, accounted, accountable, diff, over, kind,
      message:`${row.style_no} ${stageLabel(stage)}: Good ${fmt(good)} + Open ${fmt(open)} + R/A/M ${fmt(ram)}${shortClose ? ` + Short Close ${fmt(shortClose)}` : ""} vs Feed ${fmt(feed)}${stage === "cutting" ? ` (allowed up to ${fmt(allowedFeed)})` : ""}${over ? `; over ${fmt(over)}` : ""}`
    });
  });
  return out;
}
function conservationViolationRows(rows=[]){ return (rows || []).flatMap(row=>conservationViolationsForRow(row)); }
function conservationIssueTableRows(alerts=[]){
  return (alerts || []).map(a=>({
    Stage:stageLabel(a.stage),
    Order:a.row?.order_no || "",
    Style:a.row?.style_no || "",
    Buyer:a.row?.buyer || "",
    Colour:a.row?.colour || "",
    Component:a.row?.component || "",
    Feed:n(a.feed),
    "Allowed Feed":a.stage === "cutting" ? n(a.allowedFeed) : "—",
    Good:n(a.good),
    "R/A/M":n(a.ram),
    Open:n(a.open),
    "Short Close":n(a.shortClose),
    Difference:n(a.diff),
    Reading:a.kind === "over_tolerance" ? "Cutting exceeds configured tolerance" : a.kind === "unaccounted_cutting" ? "Cutting order/feed not fully accounted" : a.kind === "over_feed" ? "Output/RAM exceeds feed" : "Feed/output/RAM/open mismatch",
    Action:a.stage === "cutting" ? "Open detail → edit cutting output/RAM or open Style Entry for order/feed qty" : "Open detail → correct feed source or output/RAM in Register"
  }));
}
function mismatchedExcelSizeValues(raw, sizeSet){
  const allowed = new Set((getSizeSets()[sizeSet] || []).map(cleanSizeToken));
  const allSizes = Array.from(new Set(Object.values(getSizeSets()).flat())).map(cleanSizeToken);
  return allSizes.filter(size=>!allowed.has(size) && excelSizeNumericValue(raw, size) > 0).map(size=>`${size} ${fmt(excelSizeNumericValue(raw, size))}`);
}

function entryContextTotals(rows, stage, field){
  return (rows||[]).reduce((acc,row)=>{
    const ctx = entryFieldContext(row, stage, field);
    acc.available += n(ctx.available);
    acc.previous += n(ctx.previous);
    acc.open += n(ctx.open);
    return acc;
  }, { available:0, previous:0, open:0 });
}
function entryFieldVerb(field){
  return ({ received:"Legacy feed", output:"Complete", issued:"Issue / feed next", reject:"Reject", missing:"Mark missing", alter:"Raise alter", alter_clear:"Clear alter" })[field] || "Enter";
}
function defaultFieldForStage(row, stage){
  const st = sdata(row, stage), c = cellBreakup(row, stage);
  const readyToIssue = Math.max(0, n(st.output) - n(st.issued));
  if (readyToIssue > 0) return "issued";
  if (n(c.open) > 0) return "output";
  if (n(st.alter) > 0) return "alter_clear";
  return "output";
}
function wipControlRows(rows){
  return (rows||[]).map(row=>({ row, status:rowStatus(row) }))
    .filter(x=>n(x.status.qty)>0 || x.status.status !== "Closed / Balanced")
    .sort((a,b)=> n(b.status.qty)-n(a.status.qty) || n(b.status.idle)-n(a.status.idle));
}
function wipOrderViewRows(rows){
  return orderSummaryRows(rows).map(r=>({
    Order:r.Order, Buyer:r.Buyer, Styles:r.Styles, Order_Qty:r.Order_Qty,
    Cut:r.Cut, Stitch:r.Stitch, Pack:r.Pack, Dispatch:r.Dispatch,
    Open_WIP:r.Open_WIP, Tail_Close_Due:r.Tail_Close_Due||0, RAM:r.RAM, Reconcile:r.Reconcile, Risk_Score:n(r.Open_WIP)+n(r.Tail_Close_Due||0)+n(r.RAM)+n(r.Reconcile)*2,
  })).sort((a,b)=>n(b.Risk_Score)-n(a.Risk_Score));
}

function stageLabel(k){ return STAGE_BY_KEY[k]?.label || k; }
function stageOwner(k){ return STAGE_BY_KEY[k]?.owner || "Production Owner"; }
function hodAndCoordinator(k){ return `${stageOwner(k)} + Production Coordinator`; }
function sizesFor(row){ const sets = getSizeSets(); return sets[row?.size_set] || sets.alpha || DEFAULT_SIZE_SETS.alpha; }
function normalizedLooseKey(v){
  return String(v || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function sizeKeyAliases(size){
  const s = cleanSizeToken(size);
  const noY = s.replace(/Y$/i, "");
  const compact = s.replace(/\s+/g, "");
  const slash = s.replace(/-/g, "/");
  const dashNoSpace = s.replace(/\s*-\s*/g, "-");
  return Array.from(new Set([
    s, compact, slash, dashNoSpace, noY,
    `Size ${s}`, `Size ${compact}`, `${s} Qty`, `Qty ${s}`, `Order ${s}`, `Order Qty ${s}`,
    `Size ${noY}`, `${noY} Qty`, `Qty ${noY}`,
  ].filter(Boolean)));
}
function normalizeSizeQtyMap(map, sizes){
  const out = {};
  const sizeList = Array.isArray(sizes) ? sizes : [];
  const source = {};
  Object.entries(map || {}).forEach(([k,v])=>{
    source[String(k)] = v;
    source[String(k).toLowerCase()] = v;
    source[normalizedLooseKey(k)] = v;
  });
  sizeList.forEach(size=>{
    let val = "";
    for (const alias of sizeKeyAliases(size)) {
      const keys = [alias, String(alias).toLowerCase(), normalizedLooseKey(alias)];
      const hit = keys.find(k=>Object.prototype.hasOwnProperty.call(source, k) && String(source[k] !== undefined && source[k] !== null ? source[k] : "").trim() !== "");
      if (hit !== undefined) { val = source[hit]; break; }
    }
    out[size] = Math.max(0, n(val));
  });
  return out;
}
function qtyMapTotal(map){ return Object.values(map || {}).reduce((a,b)=>a+n(b),0); }
function orderSizeQtyMap(row){
  const sizes = sizesFor(row);
  const direct = normalizeSizeQtyMap(row?.order_size_qty || row?.order_sizes || row?.size_qty || row?.orderSizeQty, sizes);
  if (qtyMapTotal(direct) > 0) return direct;
  return distribute(n(row?.order_qty), sizes);
}
function explicitOrderSizeQtyTotal(row){
  const sizes = sizesFor(row);
  return qtyMapTotal(normalizeSizeQtyMap(row?.order_size_qty || row?.order_sizes || row?.size_qty || row?.orderSizeQty, sizes));
}
function orderSizeQtyTotal(row){ return qtyMapTotal(orderSizeQtyMap(row)); }
function sizeVarianceInfo(orderQty, sizeMap){
  const oq = n(orderQty);
  const total = qtyMapTotal(sizeMap || {});
  const diff = oq - total;
  if (!oq) return { orderQty:oq, sizeTotal:total, diff, tone:"muted", text:"Enter Order Qty first." };
  if (total === 0) return { orderQty:oq, sizeTotal:total, diff, tone:"warn", text:`Size breakup missing: ${fmt(oq)} pcs still unallocated.` };
  if (diff > 0) return { orderQty:oq, sizeTotal:total, diff, tone:"warn", text:`Size breakup short by ${fmt(diff)} pcs. Order Qty remains ${fmt(oq)}.` };
  if (diff < 0) return { orderQty:oq, sizeTotal:total, diff, tone:"late", text:`Size breakup exceeds Order Qty by ${fmt(Math.abs(diff))} pcs.` };
  return { orderQty:oq, sizeTotal:total, diff:0, tone:"ok", text:"Size breakup matches Order Qty." };
}
function naturalKeyLabel(row){ return `${row?.order_no || "?"} / ${row?.style_no || "?"} / ${row?.colour || "?"} / ${row?.component || "?"}`; }
function suggestSetIdFor(draft, rows=[]){
  const baseOrder = String(draft?.order_no || "ORD").replace(/[^A-Z0-9]+/gi, "").slice(-6) || "ORD";
  const baseStyle = String(draft?.style_no || "STYLE").replace(/[^A-Z0-9]+/gi, "").slice(0,12) || "STYLE";
  const prefix = `SET-${baseOrder}-${baseStyle}`.toUpperCase();
  const existingSameKey = (rows||[]).find(r => String(r.order_no||"").toUpperCase()===String(draft?.order_no||"").toUpperCase() && String(r.style_no||"").toUpperCase()===String(draft?.style_no||"").toUpperCase() && r.set_id);
  if (existingSameKey) return existingSameKey.set_id;
  const used = new Set((rows||[]).map(r=>String(r.set_id||"").toUpperCase()).filter(Boolean));
  let idx = 1;
  let candidate = `${prefix}-${String(idx).padStart(2,"0")}`;
  while (used.has(candidate)) { idx += 1; candidate = `${prefix}-${String(idx).padStart(2,"0")}`; }
  return candidate;
}
function buildRouteFromToggles(row){
  const route = ["cutting"];
  if (!!row.print_required) route.push("printing");
  if (!!row.embroidery_required) route.push("embroidery");
  route.push("stitching","checking","packing","dispatch");
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
  if (idx <= 0) return stageKey === "cutting" ? cuttingBaseQty(row) : n(row.order_qty);
  const prev = sdata(row, route[idx - 1]);
  const rejectDispatchQty = stageKey === "dispatch" && dispatchRejectAllowed(row) ? preDispatchRejectQty(row) : 0;
  return n(prev.issued) + rejectDispatchQty;
}
function accountableTotal(row){ return n(sdata(row, "cutting").output) || n(row.order_qty); }
function receivingPct(feed, received){ return feed > 0 ? Math.round((received * 1000) / feed) / 10 : 0; }
// In this factory workflow, issuing to a department means the receiving department has accepted it.
// Therefore there is no normal "issued but not received" bucket; the quantity is treated as with that department.
function coordinationOwner(){ return "Production Coordinator + Production Manager"; }
function cuttingShortCloseQty(row){ return Math.max(0, n(row?.cutting_short_close_qty || row?.short_close_qty || row?.stages?.cutting?.short_close)); }
function cuttingAccountableOpen(row){
  const st = sdata(row, "cutting");
  return Math.max(0, cuttingBaseQty(row) - n(st.output) - loss(st) - cuttingShortCloseQty(row));
}

// ---- Configurable production rules (single source of truth) ----
function loadLineNames(){
  try {
    const saved = JSON.parse(localStorage.getItem("production_line_names") || "[]");
    if (Array.isArray(saved) && saved.length) return saved.map(x=>String(x).trim()).filter(Boolean);
  } catch {}
  return ["STF-1","STF-2","STF-3","STF-4","STF-5","STF-6"];
}
function loadDispatchRejectAllowed(){
  try { return localStorage.getItem("production_dispatch_reject_allowed") === "true"; } catch {}
  return false;
}
const PROD_SETTINGS = { cuttingTolerancePct: 5, dispatchRamHoldPct: 2, dispatchRejectAllowed: loadDispatchRejectAllowed(), lineNames: loadLineNames() };
function cuttingToleranceFrac(){ return Math.max(0, n(PROD_SETTINGS.cuttingTolerancePct)) / 100; }
function dispatchRamHoldFrac(){ return Math.max(0, n(PROD_SETTINGS.dispatchRamHoldPct)) / 100; }
function dispatchRejectAllowed(row=null){
  if (row && typeof row.dispatch_reject_allowed === "boolean") return !!row.dispatch_reject_allowed;
  if (row && row.stage_qty && typeof row.stage_qty.__dispatch_reject_allowed === "boolean") return !!row.stage_qty.__dispatch_reject_allowed;
  // Settings is only the default for new/unspecified orders; actual rejection-dispatch approval is order/style-wise.
  return !!PROD_SETTINGS.dispatchRejectAllowed;
}
function productionLineNames(){ return Array.isArray(PROD_SETTINGS.lineNames) && PROD_SETTINGS.lineNames.length ? PROD_SETTINGS.lineNames : ["STF-1"]; }

// ---- Set convergence: a set can only pack/dispatch min(components) ----
function setSiblings(row, rows){ return row?.set_id ? (rows||[]).filter(r=>r.set_id===row.set_id) : (row?[row]:[]); }
function setPackInfo(row, rows){
  const sibs = setSiblings(row, rows);
  if (sibs.length <= 1) return null;
  const comps = sibs.map(r=>({ comp:r.component||"?", packed:n(sdata(r,"packing").output) }));
  const cap = Math.min(...comps.map(c=>c.packed));
  const lag = comps.slice().sort((a,b)=>a.packed-b.packed)[0];
  const thisPacked = n(sdata(row,"packing").output);
  return { cap, lag, comps, thisPacked, unmatched: Math.max(0, thisPacked - cap), balanced: comps.every(c=>c.packed===cap) };
}
function setConvergenceRows(rows){
  const seen = new Set(); const out = [];
  (rows||[]).forEach(row=>{
    if (!row.set_id || seen.has(row.set_id)) return;
    seen.add(row.set_id);
    const info = setPackInfo(row, rows); if (!info) return;
    const maxPacked = Math.max(...info.comps.map(c=>c.packed));
    const base = { Set_ID:row.set_id, Style:row.style_no, Buyer:row.buyer, Order:row.order_no, Components:info.comps.length, Packable_Sets:info.cap, Lagging:info.lag.comp, Unmatched:maxPacked-info.cap };
    info.comps.forEach(c=>{ base[`Pack_${c.comp}`]=c.packed; });
    out.push(base);
  });
  return out.sort((a,b)=>n(b.Unmatched)-n(a.Unmatched));
}

// ---- As-of-date validation from ledger (for backdated entries) ----
function ledgerMatchesRow(e, row){
  return String(e.order_no||e.order||"")===String(row.order_no||"") &&
         String(e.style_no||e.style||"")===String(row.style_no||"") &&
         String(e.colour||"")===String(row.colour||"") &&
         String(e.component||"")===String(row.component||"");
}
function asOfStageFieldQty(row, ledger, stage, field, asOfDate){
  const et = entryTypeForField(field);
  const rowsL = (ledger||[]).filter(e => ledgerMatchesRow(e,row) && ledgerStage(e)===stage && String(e.entry_type||e.entryType||"")===et && ledgerDate(e) && ledgerDate(e) <= asOfDate);
  if (!rowsL.length) return { hasLedger:false, qty:n(sdata(row,stage)[field]) };
  return { hasLedger:true, qty: rowsL.reduce((a,e)=>a+n(e.qty ?? e.delta),0) };
}
function asOfFeed(row, ledger, stage, asOfDate){
  const route = routeFor(row); const idx = route.indexOf(stage);
  if (idx <= 0) return n(row.order_qty);
  return asOfStageFieldQty(row, ledger, route[idx-1], "issued", asOfDate).qty;
}

function cellBreakup(row, stageKey){
  const route = routeFor(row);
  const idx = route.indexOf(stageKey);
  if (idx === -1) return { skipped:true, received:0, open:0, ram:0, extra:0, note:"Skipped" };
  const st = sdata(row, stageKey);
  const ram = loss(st);
  if (stageKey === "cutting") {
    const shortClose = cuttingShortCloseQty(row);
    const extra = Math.max(0, n(st.output) - n(row.order_qty));
    const open = cuttingAccountableOpen(row);
    const note = extra ? `Extra cut ${fmt(extra)}` : (shortClose ? `Short closed ${fmt(shortClose)}` : "Cut qty");
    return { skipped:false, received:n(st.output), open, ram, extra, shortClose, note };
  }
  const feed = stageFeed(row, stageKey);
  // Since issued-to-department = fed/accountable in this workflow, the department's accountable feed is previous stage issued.
  // Main cell shows completed/good output, open work, and R/A/M.
  const done = n(st.output);
  const open = Math.max(0, feed - done - ram);
  const over = Math.max(0, done + ram - feed);
  return { skipped:false, received:done, open, ram, extra:over, note: over ? `Over ${fmt(over)}` : `Feed ${fmt(feed)}` };
}

function rawReconcileQty(row){
  return routeFor(row).reduce((total,key)=>{
    if (key === "cutting") return total;
    const st = sdata(row,key);
    const feed = stageFeed(row,key);
    const stageLoss = loss(st);
    const totalJump = Math.max(0, n(st.output) + stageLoss - feed);
    const issuedOverOutput = Math.max(0, n(st.issued) - n(st.output));
    return total + totalJump + issuedOverOutput;
  },0);
}
function totalRamQty(row){
  return routeFor(row).reduce((a,key)=>a+loss(sdata(row,key)),0);
}
function totalRejectQty(row){
  return routeFor(row).reduce((a,key)=>a+n(sdata(row,key).reject),0);
}
function preDispatchRejectQty(row){
  return routeFor(row).filter(key=>key !== "dispatch").reduce((a,key)=>a+n(sdata(row,key).reject),0);
}
function preDispatchRejectBySize(row){
  const out = Object.fromEntries(sizesFor(row).map(size=>[size,0]));
  routeFor(row).filter(key=>key !== "dispatch").forEach(key=>{
    sizeMatrix(row, key, "reject").forEach(x=>{ out[x.size] = n(out[x.size]) + n(x.qty); });
  });
  return out;
}
function dispatchHoldRamQty(row){
  const rejectAllowedQty = dispatchRejectAllowed(row) ? preDispatchRejectQty(row) : 0;
  return Math.max(0, totalRamQty(row) - rejectAllowedQty);
}
function tailBalanceQty(row){
  return issueBuckets(row).filter(b=>b.type==="tail_balance").reduce((a,b)=>a+n(b.qty),0);
}
function dispatchHoldInfo(row){
  const route = routeFor(row);
  if (!route.includes("dispatch")) return { blocked:false, reasons:[], reconcileQty:0, ramQty:0, totalRamQty:0, dispatchableRejectQty:0, ramLimit:0 };
  const reconcileQty = rawReconcileQty(row);
  const totalRam = totalRamQty(row);
  const dispatchableRejectQty = dispatchRejectAllowed(row) ? preDispatchRejectQty(row) : 0;
  const ramQty = dispatchHoldRamQty(row);
  const ramLimit = n(row.order_qty) * dispatchRamHoldFrac();
  const reasons = [];
  if (reconcileQty > 0) reasons.push(`reconcile pending ${fmt(reconcileQty)}`);
  if (ramQty > ramLimit) {
    const label = dispatchableRejectQty ? `R/A/M after approved rejection dispatch ${fmt(ramQty)}` : `R/A/M ${fmt(ramQty)}`;
    reasons.push(`${label} above ${n(PROD_SETTINGS.dispatchRamHoldPct)}% order limit (${fmt(ramLimit)})`);
  }
  return { blocked:reasons.length>0, reasons, reconcileQty, ramQty, totalRamQty:totalRam, dispatchableRejectQty, ramLimit };
}
function fileReleaseQty(row){ return n(row.file_released_qty || row.production_file_released_qty || row.cutting_file_released_qty || 0); }
function fileReleaseDate(row){ return row.file_released_date || row.production_file_released_date || row.cutting_file_released_date || ""; }
function isProductionFileReleased(row){ return fileReleaseQty(row) > 0; }
function hasFileReleaseGate(row){ return fileReleaseQty(row) > 0 || !!fileReleaseDate(row); }
function cuttingBaseQty(row){
  // V32: Cutting feed is a deliberate Production File Release. Do not silently use order qty as feed.
  return Math.max(0, fileReleaseQty(row));
}
function fileReleaseSizeQtyMap(row){
  const sizes = sizesFor(row);
  const releaseQty = fileReleaseQty(row);
  if (releaseQty <= 0) return Object.fromEntries(sizes.map(size=>[size,0]));
  const orderMap = orderSizeQtyMap(row);
  const orderTotal = qtyMapTotal(orderMap) || n(row.order_qty) || releaseQty;
  if (!orderTotal || Math.abs(orderTotal - releaseQty) <= 0.001) return normalizeSizeQtyMap(orderMap, sizes);
  let used = 0;
  return Object.fromEntries(sizes.map((size,idx)=>{
    const qty = idx === sizes.length - 1 ? releaseQty - used : Math.round((releaseQty * n(orderMap[size])) / orderTotal);
    used += qty;
    return [size, Math.max(0, qty)];
  }));
}
function fileReleaseStatusText(row){
  const rel = fileReleaseQty(row);
  if (rel <= 0) return "File not released";
  return `File released ${fmt(rel)}${fileReleaseDate(row)?` · ${fileReleaseDate(row)}`:""}`;
}
function fileReleaseNeedText(row){
  return `Release production file to Cutting before DPR cutting output. Order qty ${fmt(row?.order_qty)}.`;
}

function issueBuckets(row){
  const route = routeFor(row);
  const buckets = [];
  for (let i = 0; i < route.length; i++) {
    const key = route[i];
    const st = sdata(row, key);
    const stageLoss = loss(st);
    const idle = n(st.idle);
    if (key === "cutting") {
      const shortClose = cuttingShortCloseQty(row);
      const cutBase = cuttingBaseQty(row);
      const overCut = cutBase > 0 ? Math.max(0, n(st.output) - cutBase) : Math.max(0, n(st.output));
      if (!isProductionFileReleased(row) && n(row.order_qty) > 0) {
        buckets.push({ type:"cutting_pending", status:"File not released", qty:n(row.order_qty), owner:stageOwner(key), support:"Production Coordinator / Manager must release production file", stage:key, tone:"warn", action:"Release production file to Cutting before cutting output.", idle });
      }
      const cutPending = Math.max(0, cutBase - n(st.output) - loss(st) - cuttingShortCloseQty(row));
      if (cutPending > 0) {
        buckets.push({ type:"cutting_pending", status:"Cut open", qty:cutPending, owner:stageOwner(key), support:"Production Coordinator follow-up; option to short close genuine balance", stage:key, tone:idle >= 3 ? "warn" : "info", action:"Cut remaining released quantity or short close approved tail.", idle });
      }
      if (shortClose > 0) {
        buckets.push({ type:"short_closed", status:"Cutting Short Closed", qty:shortClose, owner:hodAndCoordinator(key), support:"Keep reason/approval until governance queue is added", stage:key, tone:"purple", action:"Short-closed balance is removed from cutting pending, not treated as produced.", idle });
      }
      if (overCut) buckets.push({ type:"extra_cut", status:"Extra Cut", qty:overCut, owner:hodAndCoordinator(key), support:"Production Manager escalation if over tolerance", stage:key, tone:"purple", action:"Extra cut allowed; check tolerance", idle });
    } else {
      const feed = stageFeed(row, key);
      const done = n(st.output);
      const totalJump = Math.max(0, done + stageLoss - feed);
      if (totalJump > 0) {
        buckets.push({ type:"reconcile", status:"Reconcile", qty:totalJump, owner:hodAndCoordinator(key), support:"Production Manager escalation / approval only", stage:key, tone:"late", action:`${stageLabel(key)} output + R/A/M is above issued/accepted feed. Adjustment required.`, idle });
      }
      const issuedOverOutput = Math.max(0, n(st.issued) - done);
      if (issuedOverOutput > 0) {
        buckets.push({ type:"reconcile", status:`Issued > Output in ${stageLabel(key)}`, qty:issuedOverOutput, owner:hodAndCoordinator(key), support:"Production Manager escalation / approval only", stage:key, tone:"late", action:`${stageLabel(key)} issued more than completed/output. Correct entry or approve adjustment.`, idle });
      }
    }
    if (i < route.length - 1) {
      const nextKey = route[i + 1];
      const completedNotIssued = Math.max(0, n(st.output) - n(st.issued));
      if (completedNotIssued > 0) {
        buckets.push({ type:"completed_not_issued", status:`Ready for ${stageLabel(nextKey)}`, qty:completedNotIssued, owner:coordinationOwner(), support:`${stageOwner(key)} supports location/handover`, stage:key, toStage:nextKey, tone:"info", action:`Move/issue completed stock to ${stageLabel(nextKey)}`, idle });
      }
    }
    const workNotCompleted = key === "cutting" ? 0 : Math.max(0, stageFeed(row, key) - n(st.output) - stageLoss);
    if (key !== "cutting" && workNotCompleted > 0) {
      const feedForStage = stageFeed(row, key);
      const accountedPct = feedForStage > 0 ? ((n(st.output) + stageLoss) / feedForStage) * 100 : 0;
      const tailThresholdQty = Math.max(50, Math.round(feedForStage * 0.03));
      const isSmallTailBalance = workNotCompleted > 0 && workNotCompleted <= tailThresholdQty;
      const tailDue = accountedPct >= 97 && isSmallTailBalance;
      const atParty = !!st.party;
      buckets.push(tailDue
        ? { type:"tail_balance", status:`Tail Closure Review in ${stageLabel(key)}`, qty:workNotCompleted, owner:hodAndCoordinator(key), support:"Tail-ending balance only: small residual balance after main production is effectively accounted. Not triggered by idle days or normal pending issue.", stage:key, tone:"warn", action:`${stageLabel(key)} small tail balance ${fmt(workNotCompleted)} remains after ${Math.round(accountedPct)}% accounted. Close, explain, R/A/M, or short-close with reason if genuine.`, idle, closePct:accountedPct, tailThresholdQty }
        : { type:"received_not_processed", status: atParty ? `Pending at ${st.party}` : `With ${stageLabel(key)}`, qty:workNotCompleted, owner: atParty ? `Production Coordinator + ${st.party}` : stageOwner(key), support: atParty ? "Follow up with outsource party if plan/return is at risk" : "Normal WIP aging / department work balance unless it blocks plan or shows discrepancy", stage:key, tone:idle >= 7 ? "warn" : "info", action: atParty ? `Follow ${st.party} to return ${stageLabel(key)} balance if needed` : `${stageLabel(key)} to complete/process balance as normal WIP`, idle, party: atParty ? st.party : "" }
      );
    }
    if (stageLoss > 0) {
      const approvedRejectDispatch = dispatchRejectAllowed(row) && key !== "dispatch" ? n(st.reject) : 0;
      const blockingLoss = Math.max(0, stageLoss - approvedRejectDispatch);
      if (blockingLoss > 0) {
        buckets.push({ type:"ram", status:`R/A/M in ${stageLabel(key)}`, qty:blockingLoss, owner:hodAndCoordinator(key), support:"Production Manager escalation if overdue", stage:key, tone:"late", action:"Close reject / alter / missing breakup and reason", idle });
      }
      if (approvedRejectDispatch > 0) {
        buckets.push({ type:"approved_reject_dispatch", status:`Approved Reject for Dispatch in ${stageLabel(key)}`, qty:approvedRejectDispatch, owner:coordinationOwner(), support:`${stageOwner(key)} to keep rejected qty separately identified by size`, stage:key, tone:"purple", action:"Rejection is allowed for dispatch by Settings toggle; keep buyer/manager approval reference in remarks until governance workflow is added.", idle });
      }
    }
  }
  const dispatchHold = dispatchHoldInfo(row);
  if (dispatchHold.blocked) {
    const st = sdata(row,"dispatch");
    buckets.push({
      type:"dispatch_hold",
      status:"Dispatch Hold",
      qty:Math.max(dispatchHold.reconcileQty, dispatchHold.ramQty, 1),
      owner:coordinationOwner(),
      support:"Dispatch HOD support; Production Manager approval/escalation",
      stage:"dispatch",
      tone:"late",
      action:`Do not dispatch until ${dispatchHold.reasons.join(" and ")}.`,
      idle:n(st.idle),
    });
  }
  return buckets.sort((a,b)=> (b.qty * Math.max(1,b.idle||1)) - (a.qty * Math.max(1,a.idle||1)) || b.qty-a.qty);
}
function isActionableBucket(row,b){ return b && b.type !== "short_closed" && (b.type !== "extra_cut" || b.qty > (n(row.order_qty) * cuttingToleranceFrac())); }
function rowStatus(row){
  const buckets = issueBuckets(row).filter(b => isActionableBucket(row,b) && b.type !== "tail_balance");
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
  const all = issueBuckets(row).filter(b => isActionableBucket(row,b) && b.type !== "tail_balance");
  const reconcile = all.find(b => b.type === "reconcile");
  const current = all.find(b => b.type !== "reconcile");
  const rest = all.filter(b => b !== reconcile && b !== current).slice(0, 1);
  return [reconcile, current, ...rest].filter(Boolean);
}
function shortStatusLabel(bucket){
  if (!bucket) return "Balanced";
  const st = String(bucket.stage || "");
  if (bucket.type === "completed_not_issued") return `${STAGE_BY_KEY[st]?.short || stageLabel(st)} open`;
  if (bucket.type === "received_not_processed") return `${STAGE_BY_KEY[st]?.short || stageLabel(st)} open`;
  if (bucket.type === "tail_balance") return `Tail`;
  if (bucket.type === "cutting_pending") return bucket.status === "File not released" ? "File not released" : "Cut open";
  if (bucket.type === "ram") return `R/A/M ${STAGE_BY_KEY[st]?.short || stageLabel(st)}`;
  if (bucket.type === "reconcile") return "P0 check";
  return bucket.status;
}
function statusText(row){
  const parts = statusBreakdown(row);
  if (!parts.length) return "Balanced";
  return parts.map(b => `${shortStatusLabel(b)} ${fmt(b.qty)}`).join(" · ");
}
function StatusCell({ row, onOpen }){
  const parts = statusDistribution(row);
  if (!parts.length) return <div className="mt-status-stack"><span className="mt-chip mt-ok">Closed / Balanced</span><div className="mt-status-line">No open production issue</div></div>;
  return <div className="mt-status-stack"><StatusDeptLinks row={row} onOpen={onOpen} compact={false}/></div>;
}
function PrimaryPendingStage({ row, onOpen, onEntry, onRelease }){
  return <CurrentStatusLinks row={row} onEntry={onEntry} onOpen={onOpen} onRelease={onRelease} compact={true}/>;
}
function statusClass(tone){ return tone === "late" ? "mt-late" : tone === "warn" ? "mt-warn" : tone === "ok" ? "mt-ok" : tone === "purple" ? "mt-purple" : tone === "info" ? "mt-info" : "mt-muted"; }
function deptClass(stageKey){ return stageKey ? `mt-dept-${stageKey}` : ""; }
function statusDistribution(row){
  const buckets = issueBuckets(row).filter(b => isActionableBucket(row,b) && b.type !== "tail_balance");
  const normal = buckets.filter(b => b.type !== "dispatch_hold");
  const total = normal.reduce((a,b)=>a+n(b.qty),0) || buckets.reduce((a,b)=>a+n(b.qty),0) || 0;
  const source = normal.length ? normal : buckets;
  return source.map((b,idx)=>({ ...b, pct: total>0 ? Math.round((n(b.qty)*1000)/total)/10 : bucketPct(row,b), rank:idx })).sort((a,b)=>{
    const pri = (x)=> x.type === "reconcile" ? 5 : x.type === "dispatch_hold" ? 4 : x.type === "completed_not_issued" ? 3 : x.type === "tail_balance" ? 2.5 : x.type === "received_not_processed" ? 2 : x.type === "ram" ? 1 : x.type === "approved_reject_dispatch" ? 0.5 : 0;
    return pri(b)-pri(a) || n(b.qty)-n(a.qty);
  });
}
function statusOrderBaseQty(row){ return n(row.order_qty) || statusCutBaseQty(row) || 1; }
function statusCutBaseQty(row){
  const cut = sdata(row, "cutting");
  const actualCut = Math.max(n(cut.output), n(cut.issued), n(cut.received));
  return actualCut > 0 ? actualCut : (n(row.order_qty) || 1);
}
function pctOf(qty, base){ return n(base) > 0 ? Math.round((n(qty) * 1000) / n(base)) / 10 : 0; }
function dualBaseText(row, qty){
  const orderBase = statusOrderBaseQty(row);
  const cutBase = statusCutBaseQty(row);
  const orderPct = pctOf(qty, orderBase);
  const cutPct = pctOf(qty, cutBase);
  if (Math.abs(orderBase - cutBase) > 0.001) return `${orderPct}% order · ${cutPct}% cut`;
  return `${orderPct}% order/cut`;
}
function statusDistributionByCut(row){
  const orderBase = statusOrderBaseQty(row);
  const cutBase = statusCutBaseQty(row);
  return statusDistribution(row).map(b => ({
    ...b,
    orderBase,
    cutBase,
    pctOrder: pctOf(b.qty, orderBase),
    pctCut: pctOf(b.qty, cutBase),
  }));
}


function tailStatusParts(row){
  const route = routeFor(row);
  const parts = issueBuckets(row).filter(b=>b.type === "tail_balance" && n(b.qty)>0);
  const cut = sdata(row,"cutting");
  const cutBase = cuttingBaseQty(row);
  const cutOpen = isProductionFileReleased(row) ? cuttingAccountableOpen(row) : 0;
  const cutTailLimit = Math.max(50, Math.round(Math.max(cutBase, n(row.order_qty)) * 0.03));
  if (cutOpen > 0 && cutBase > 0 && cutOpen <= cutTailLimit && n(cut.output) >= Math.max(0, cutBase - cutTailLimit)) {
    const nextStage = route[route.indexOf("cutting") + 1];
    parts.unshift({ type:"tail_balance", status:"Cutting tail review", qty:cutOpen, owner:hodAndCoordinator("cutting"), stage:"cutting", toStage:nextStage, tone:"warn", action:"Cut/short-close small cutting tail balance." });
  }
  return parts.sort((a,b)=>route.indexOf(a.stage)-route.indexOf(b.stage) || n(b.qty)-n(a.qty));
}
function TailStatusCell({ row, onOpen, compact=false }){
  const parts = tailStatusParts(row).slice(0, compact ? 2 : 4);
  if (!parts.length) return <div className="mt-tail-status-cell"><span className="mt-chip mt-ok">No tail</span><div className="mt-small">Tail ignored from Current Status</div></div>;
  return <div className="mt-tail-status-cell">{parts.map((p,idx)=><button key={`${p.stage}-${idx}`} className="mt-tail-card" onClick={(e)=>{e.stopPropagation(); onOpen?.(p.stage,p);}} title={p.action || "Open tail detail"}>
    <span><span className="stage">{stageLabel(p.stage)}</span><br/><span className="mt-small">Tail review</span></span><span className="qty">{fmt(p.qty)}</span>
  </button>)}{tailStatusParts(row).length>parts.length ? <span className="mt-chip mt-muted">+{tailStatusParts(row).length-parts.length} more</span> : null}</div>;
}
function selectedIssueStageFocus(row, stageKey, issueType){
  if (!issueType || issueType === "all" || issueType === "closed") return null;
  const route = routeFor(row);
  const st = sdata(row, stageKey);
  const feed = stageKey === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stageKey);
  const output = n(st.output);
  const issued = n(st.issued);
  const ram = n(st.reject) + n(st.alter) + n(st.missing);
  const nextStage = route[route.indexOf(stageKey)+1];
  const open = stageKey === "cutting" ? cuttingAccountableOpen(row) : Math.max(0, feed - output - ram);
  const ready = nextStage ? Math.max(0, output - issued) : 0;
  const reconcile = stageKey === "cutting" ? 0 : Math.max(0, output + ram - feed);
  if (issueType === "completed_not_issued" && ready > 0) return { label:`Issue pending${nextStage ? ` → ${STAGE_BY_KEY[nextStage]?.short || stageLabel(nextStage)}` : ""}`, qty:ready, tone:"ok" };
  if (issueType === "received_not_processed") {
    const tail = tailStatusParts(row).some(p=>p.stage === stageKey && n(p.qty) === open);
    if (open > 0 && !tail) return { label:"Output pending", qty:open, tone:"late" };
  }
  if (issueType === "tail_balance") {
    const tailQty = tailStatusParts(row).filter(p=>p.stage===stageKey).reduce((a,p)=>a+n(p.qty),0);
    if (tailQty > 0) return { label:"Tail review", qty:tailQty, tone:"late" };
  }
  if (issueType === "ram" && ram > 0) return { label:"R/A/M", qty:ram, tone:"late" };
  if (issueType === "reconcile" && reconcile > 0) return { label:"Reconcile", qty:reconcile, tone:"late" };
  if (issueType === "dispatch_hold" && stageKey === "dispatch" && dispatchHoldInfo(row).blocked) return { label:"Dispatch hold", qty:dispatchHoldInfo(row).qty || dispatchHoldInfo(row).ramQty || dispatchHoldInfo(row).reconcileQty || 1, tone:"late" };
  return null;
}
function currentStatusTailLimit(base){ return Math.max(50, Math.round(Math.max(0,n(base)) * 0.03)); }
function nonTailActionQty(qty, base, accountedPct){
  const q = Math.max(0,n(qty));
  const b = Math.max(0,n(base));
  if (!q) return 0;
  // Tail balances are managed in Tail Status, not Current Status.
  // A small residual only becomes tail after the stage is substantially complete.
  if (b > 0 && q <= currentStatusTailLimit(b) && n(accountedPct) >= 97) return 0;
  return q;
}
function currentStatusCrispText(row, part){
  if (!part) return "";
  const next = part.toStage ? (STAGE_BY_KEY[part.toStage]?.short || stageLabel(part.toStage)) : "";
  const target = part.toStage ? stageLabel(part.toStage) : stageLabel(part.stage);
  const source = stageLabel(part.stage);
  if (part.type === "file_release_pending") return "Release file pending";
  if (part.type === "cutting_pending") return "Cutting output pending";
  if (part.type === "output_pending" || part.type === "with_dept") return `${source} output pending`;
  if (part.type === "issue_pending" || part.type === "ready_next") return `${target} issue pending`;
  if (part.type === "issued_forward") return `${target} receive/output pending`;
  if (part.type === "ram") return `${source} R/A/M pending`;
  if (part.type === "reconcile") return `${source} reconcile`;
  if (part.type === "dispatch_hold") return "Dispatch hold";
  return part.label || shortStatusLabel(part);
}

function currentStatusEntryField(part){
  if (!part) return "output";
  if (part.type === "file_release_pending" || part.type === "cutting_pending") return "output";
  if (part.type === "issue_pending" || part.type === "ready_next" || part.type === "issued_forward") return "issued";
  if (part.type === "output_pending" || part.type === "with_dept") return "output";
  if (part.type === "ram") return "reject";
  return "output";
}
function currentMovementStatusParts(row){
  const route = routeFor(row);
  const parts = [];
  const cut = sdata(row, "cutting");
  const releaseBase = cuttingBaseQty(row);
  if (!isProductionFileReleased(row)) {
    // Production File Release is now tracked in its own WIP column, not inside Current Status.
    // Current Status should only show pending production movements after the file has been released.
    return parts;
  }

  // Cutting output pending = released/cut feed not yet cut. Do not show tiny tail here.
  const cutLoss = loss(cut) + cuttingShortCloseQty(row);
  const cutAccounted = n(cut.output) + cutLoss;
  const cutPct = releaseBase > 0 ? (cutAccounted / releaseBase) * 100 : 0;
  const cutOutputPending = nonTailActionQty(Math.max(0, releaseBase - cutAccounted), releaseBase, cutPct);
  if (cutOutputPending > 0) parts.push({ type:"cutting_pending", stage:"cutting", label:"Cutting output pending", qty:cutOutputPending, tone:"info", field:"output", note:"Cut remaining released quantity" });

  // Pending issue to next department = completed good qty not yet fed forward.
  route.forEach((stage, idx)=>{
    const st = sdata(row, stage);
    const nextStage = route[idx + 1];
    if (!nextStage) return;
    const good = n(st.output);
    const issued = n(st.issued);
    const issuePct = good > 0 ? (issued / good) * 100 : 0;
    const issuePending = nonTailActionQty(Math.max(0, good - issued), good, issuePct);
    if (issuePending > 0) parts.push({
      type:"issue_pending",
      stage,
      toStage:nextStage,
      label:`${stageLabel(nextStage)} issue pending`,
      qty:issuePending,
      tone:"info",
      field:"issued",
      note:`Issue ${stageLabel(stage)} output to ${stageLabel(nextStage)}`
    });
  });

  // Department output pending = feed received by dept but not yet completed/accounted.
  route.forEach((stage)=>{
    if (stage === "cutting") return;
    const st = sdata(row, stage);
    const feed = stageFeed(row, stage);
    const ram = loss(st);
    const output = n(st.output);
    const accounted = output + ram;
    const accountedPct = feed > 0 ? (accounted / feed) * 100 : 0;
    const outputPending = nonTailActionQty(Math.max(0, feed - accounted), feed, accountedPct);
    if (outputPending > 0) parts.push({
      type:"output_pending",
      stage,
      label:`${stageLabel(stage)} output pending`,
      qty:outputPending,
      tone:"info",
      field:"output",
      note:`Complete/account for ${stageLabel(stage)} feed`
    });
  });

  // Blocking quality/reconcile remains visible, but only after normal action gaps.
  issueBuckets(row)
    .filter(b=>isActionableBucket(row,b) && b.type !== "tail_balance" && ["reconcile","dispatch_hold","ram"].includes(b.type))
    .forEach(b=>{
      const exists = parts.some(p=>p.type===b.type && p.stage===b.stage && n(p.qty)===n(b.qty));
      if (!exists) parts.push({ ...b, label:shortStatusLabel(b), field: b.type === "ram" ? "reject" : "output" });
    });

  const stageIdx = (st)=>{ const i = route.indexOf(st); return i < 0 ? 99 : i; };
  const typePri = (p)=> p.type === "file_release_pending" ? 0 : p.type === "cutting_pending" ? 1 : p.type === "issue_pending" ? 2 : p.type === "output_pending" ? 3 : p.type === "ram" ? 4 : p.type === "reconcile" ? 5 : 6;
  return parts.sort((a,b)=> stageIdx(a.stage)-stageIdx(b.stage) || typePri(a)-typePri(b) || n(b.qty)-n(a.qty));
}
function movementStatusMeta(row, part){
  if (!part) return "";
  const stage = part.stage;
  const st = sdata(row, stage);
  const route = routeFor(row);
  const nextStage = part.toStage || route[route.indexOf(stage)+1];
  const feed = stage === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stage);
  const output = n(st.output);
  const ram = n(st.reject) + n(st.alter) + n(st.missing);
  const issued = n(st.issued);
  const openWork = stage === "cutting" ? cuttingAccountableOpen(row) : Math.max(0, feed - output - ram);
  const pendingIssue = Math.max(0, output - issued);
  if (part.type === "file_release_pending") return `Order ${fmt(row.order_qty)} · release file first`;
  if (part.type === "cutting_pending") return `Feed ${fmt(feed)} · cut ${fmt(output)} · open ${fmt(part.qty)}`;
  if (part.type === "output_pending" || part.type === "with_dept") return `Feed ${fmt(feed)} · output ${fmt(output)} · pending ${fmt(part.qty)}`;
  if (part.type === "issue_pending" || part.type === "ready_next") return `Output ${fmt(output)} · issued ${fmt(issued)} · pending ${fmt(part.qty)}${nextStage ? ` to ${stageLabel(nextStage)}` : ""}`;
  if (part.type === "issued_forward") {
    const next = nextStage ? sdata(row, nextStage) : null;
    const nextAccounted = next ? n(next.output) + n(next.reject) + n(next.alter) + n(next.missing) : 0;
    return `${fmt(issued)} feed sent${nextStage ? ` to ${stageLabel(nextStage)}` : ""}${nextStage ? ` · next pending ${fmt(Math.max(0, issued - nextAccounted))}` : ""}`;
  }
  if (part.type === "ram") return `Feed ${fmt(feed)} · R/A/M ${fmt(ram)} · open ${fmt(openWork)}`;
  return feed ? `Feed ${fmt(feed)} · open ${fmt(openWork)} · pending issue ${fmt(pendingIssue)}` : "";
}

function CurrentStatusLinks({ row, onEntry, onOpen, onRelease, compact=false }){
  const allParts = currentMovementStatusParts(row);
  const parts = allParts.slice(0, compact ? 8 : 12);
  if (!parts.length && !isProductionFileReleased(row)) return <div className="mt-current-crisp"><span className="mt-chip mt-warn">Not active</span><span className="mt-current-muted">Release file column controls Cutting handover.</span></div>;
  if (!parts.length) return <div className="mt-current-crisp"><span className="mt-chip mt-ok">Closed / balanced</span><span className="mt-current-muted">Main status excludes tail; check Tail Status separately.</span></div>;
  return <div className="mt-current-crisp">{parts.map((p,idx)=><button key={`${p.type}-${p.stage}-${idx}`} className={`mt-current-line ${deptClass(p.stage)}`} onClick={(e)=>{ e.stopPropagation(); if ((p.type === "file_release_pending" || p.type === "cutting_pending") && p.stage === "cutting" && !isProductionFileReleased(row) && onRelease) onRelease(row, "wip_current_status"); else onEntry ? onEntry(row, p.stage, p.field || currentStatusEntryField(p)) : onOpen?.(p.stage,p); }} title={p.type === "file_release_pending" ? "Release production file to Cutting" : `${movementStatusMeta(row,p)}. Click to open ${stageLabel(p.stage)} ${fieldLabel(p.field || currentStatusEntryField(p))}`}>
    <span><span className="txt">{currentStatusCrispText(row,p)}</span><br/><span className="mt-current-muted">{movementStatusMeta(row,p)}</span></span>
    <span className="num">{fmt(p.qty)}</span>
  </button>)}{allParts.length>parts.length ? <span className="mt-chip mt-muted">+{allParts.length-parts.length} more</span> : null}</div>;
}
function FileReleaseStatusCell({ row, onRelease, compact=false }){
  const orderTotal = n(row?.order_qty);
  const released = fileReleaseQty(row);
  const relDate = fileReleaseDate(row);
  const toleranceQty = orderTotal ? Math.floor(orderTotal * (1 + cuttingToleranceFrac())) : 0;
  const cutAccounted = n(sdata(row,"cutting").output) + loss(sdata(row,"cutting"));
  const notReleased = !isProductionFileReleased(row);
  const overOrder = orderTotal > 0 && released > orderTotal;
  const overAllowed = orderTotal > 0 && released > toleranceQty;
  const underCut = released > 0 && cutAccounted > released;
  const tone = notReleased ? "warn" : overAllowed || underCut ? "late" : overOrder ? "info" : "ok";
  const label = notReleased ? "Release pending" : overOrder ? "Released within tolerance" : "Released";
  return <div className={`mt-file-release-cell ${tone}`}>
    <div className="top"><span>{label}</span><b>{fmt(released || 0)}</b></div>
    <div className="meta">Order {fmt(orderTotal)} · Max normal {fmt(toleranceQty || orderTotal)}{relDate ? ` · ${relDate}` : ""}</div>
    {cutAccounted ? <div className="meta">Cut accounted {fmt(cutAccounted)}</div> : null}
    {overAllowed ? <div className="mt-small warn">Above tolerance — manager override saved/needed</div> : overOrder ? <div className="mt-small">Over order but inside cutting tolerance.</div> : null}
    {underCut ? <div className="mt-small warn">Release below existing cut. Edit release/correct cut.</div> : null}
    <button className={`mt-btn ${notReleased ? "primary" : "ghost"}`} onClick={(e)=>{e.stopPropagation(); onRelease?.(row, notReleased ? "wip_release_column" : "wip_release_column_edit");}}>{notReleased ? "Release File" : "Edit Release"}</button>
  </div>;
}

function routeProgressSnapshot(row){
  const route = routeFor(row);
  const orderQty = n(row.order_qty);
  const cutSt = sdata(row,"cutting");
  const cutQty = Math.max(n(cutSt.output), n(cutSt.received));
  const cutBase = cuttingBaseQty(row);
  const parts = [];
  parts.push({ stage:"cutting", label:fileReleaseStatusText(row), qty:fileReleaseQty(row) || n(row.order_qty), tone:isProductionFileReleased(row)?"info":"warn", title:"Production file release controls what Cutting is allowed to start." });
  if (cutQty > 0) parts.push({ stage:"cutting", label:`Cut done ${fmt(cutQty)}`, qty:cutQty, tone:"ok", title:`${pctOf(cutQty, cutBase)}% of released/cut base · ${pctOf(cutQty, orderQty)}% of order` });
  const cutOpen = Math.max(0, cutQty - n(cutSt.issued));
  if (cutOpen > 0) parts.push({ stage:"cutting", label:`Cut open ${fmt(cutOpen)}`, qty:cutOpen, tone:cutOpen <= Math.max(10, Math.round((cutQty||orderQty)*0.05))?"warn":"info", title:"Cut quantity not yet issued forward." });
  route.filter(stage=>stage!=="cutting").forEach(stage=>{
    const st = sdata(row, stage);
    const feed = stageFeed(row, stage);
    const good = n(st.output);
    const ram = n(st.reject)+n(st.alter)+n(st.missing);
    const accounted = good + ram;
    const issued = n(st.issued);
    if (feed > 0) parts.push({ stage, label:`${STAGE_BY_KEY[stage]?.short || stageLabel(stage)} feed ${fmt(feed)}`, qty:feed, tone:"info", title:`${pctOf(feed, cutQty||orderQty)}% of cut/order base` });
    if (accounted > 0) parts.push({ stage, label:`${STAGE_BY_KEY[stage]?.short || stageLabel(stage)} acct ${fmt(accounted)}`, qty:accounted, tone:ram?"warn":"ok", title:`Good ${fmt(good)} + R/A/M ${fmt(ram)} = accounted ${fmt(accounted)} · local ${pctOf(accounted, feed)}% · overall ${pctOf(accounted, cutQty||orderQty)}%` });
    if (issued > 0) parts.push({ stage, label:`${STAGE_BY_KEY[stage]?.short || stageLabel(stage)} issue ${fmt(issued)}`, qty:issued, tone:"purple", title:`Issued forward from ${stageLabel(stage)}` });
    const open = Math.max(0, feed - accounted);
    if (open > 0) parts.push({ stage, label:`${STAGE_BY_KEY[stage]?.short || stageLabel(stage)} open ${fmt(open)}`, qty:open, tone:open <= Math.max(10, Math.round(feed*0.05))?"warn":"late", title:`Pending to output/account for ${fmt(open)} from ${stageLabel(stage)}` });
  });
  return parts;
}

function RouteProgressSnapshot({ row, onOpen, compact=false }){
  const parts = routeProgressSnapshot(row).slice(0, compact ? 8 : 12);
  const orderBase = statusOrderBaseQty(row);
  const cutBase = statusCutBaseQty(row);
  if (!parts.length) return <div className="mt-cut-breakup-mini"><span className="mt-chip mt-muted">No route progress yet</span><div className="mt-small">Order {fmt(orderBase)}</div></div>;
  return <div className="mt-status-cell-wrap compact-wrap mt-cut-status-wrap mt-cut-breakup-mini"><div className="mt-current-split-note" style={{width:"100%"}}>Route progress · Order {fmt(orderBase)} · Cut {fmt(cutBase)}</div>{parts.map((p,idx)=><button key={`route-progress-${p.stage}-${idx}`} className={`mt-status-link compact ${deptClass(p.stage)} ${p.tone==="late"?"mt-route-balance-late":""}`} onClick={(e)=>{ e.stopPropagation(); onOpen?.(p.stage,p); }} title={p.title || `Open ${stageLabel(p.stage)} detail`}>
    <span><span className="dept-name">{p.label}</span></span>
    <span style={{textAlign:"right"}}><span className="dept-pct">{dualBaseText(row,p.qty)}</span></span>
  </button>)}</div>;
}

function StatusDeptLinks({ row, onOpen, compact=false }){
  const parts = statusDistribution(row).slice(0, compact ? 3 : 5);
  if (!parts.length) return <span className="mt-chip mt-ok">Closed / Balanced</span>;
  return <div className="mt-status-cell-wrap">{parts.map((b,idx)=><button key={`${b.type}-${b.stage}-${idx}`} className={`mt-status-link ${deptClass(b.stage)}`} onClick={(e)=>{e.stopPropagation(); onOpen?.(b.stage,b);}} title={`Open ${stageLabel(b.stage)} detail`}>
    <span><span className="dept-name">{stageLabel(b.stage)}</span><br/><span className="mt-small">{shortStatusLabel(b)}</span></span>
    <span style={{textAlign:"right"}}><span className="dept-qty">{fmt(b.qty)}</span><br/><span className="dept-pct">{b.pct}%</span></span>
  </button>)}{parts.length>1 && <div className="mt-current-split-note">Split across {parts.length} departments · click dept to open</div>}</div>;
}
function StatusByCutQty({ row, onOpen, compact=false, excludePrimary=false }){
  const orderBase = statusOrderBaseQty(row);
  const cutBase = statusCutBaseQty(row);
  const rawParts = statusDistributionByCut(row);
  const allParts = excludePrimary ? rawParts.slice(1) : rawParts;
  const parts = allParts.slice(0, compact ? 4 : 8);
  const baseLabel = Math.abs(orderBase - cutBase) > 0.001 ? `Order ${fmt(orderBase)} · Cut ${fmt(cutBase)}` : `Order/Cut ${fmt(orderBase)}`;
  if (!parts.length) return <div className="mt-cut-breakup-mini"><span className="mt-chip mt-ok">No other open split</span><div className="mt-small">Base: {baseLabel}</div></div>;
  return <div className="mt-status-cell-wrap compact-wrap mt-cut-status-wrap mt-cut-breakup-mini">
    <div className="mt-current-split-note" style={{width:"100%"}}>{excludePrimary ? "Other open split" : "All open split"}: {baseLabel}</div>
    {parts.map((b,idx)=><button key={`cut-${b.type}-${b.stage}-${idx}`} className={`mt-status-link compact ${deptClass(b.stage)}`} onClick={(e)=>{e.stopPropagation(); onOpen?.(b.stage,b);}} title={`Open ${stageLabel(b.stage)} detail · ${fmt(b.qty)} = ${b.pctOrder}% of order / ${b.pctCut}% of cut`}>
      <span><span className="dept-name">{STAGE_BY_KEY[b.stage]?.short || stageLabel(b.stage)}</span><br/><span className="mt-small">{bucketTypeLabel(b.type)}</span></span>
      <span style={{textAlign:"right"}}><span className="dept-qty">{fmt(b.qty)}</span><br/><span className="dept-pct">{Math.abs(orderBase-cutBase)>0.001 ? `${b.pctOrder}% ord` : `${b.pctCut}%`}</span>{Math.abs(orderBase-cutBase)>0.001 ? <><br/><span className="dept-pct">{b.pctCut}% cut</span></> : null}</span>
    </button>)}
    {allParts.length > parts.length ? <span className="mt-chip mt-muted">+{allParts.length-parts.length}</span> : null}
  </div>;
}

function uniqueList(values){ return Array.from(new Set(values.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b))); }
function ownerNamesFromBucket(bucket){ return String(bucket?.owner || "").split("+").map(x=>x.trim()).filter(Boolean); }
function rowOwnerNames(row){ return uniqueList(issueBuckets(row).flatMap(ownerNamesFromBucket)); }
function routeType(row){ const p=!!row.print_required, e=!!row.embroidery_required; return p && e ? "Print + Emb" : p ? "Print" : e ? "Embroidery" : "Plain"; }
function tokenSearchMatch(haystack, query){
  const text = String(haystack || "").toLowerCase();
  return String(query || "").toLowerCase().split(/\s+/).filter(Boolean).every(token => text.includes(token));
}
function wipStageFilterText(row, stageKey){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return `${stageLabel(stageKey)} ${STAGE_BY_KEY[stageKey]?.short || ""} skip inactive route not active`;
  const st = sdata(row, stageKey);
  const feed = stageKey === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stageKey);
  const pct = feed > 0 ? Math.round((n(c.received) * 1000) / feed) / 10 : 0;
  return [
    stageLabel(stageKey), STAGE_BY_KEY[stageKey]?.short, c.note, `${pct}%`,
    `output ${fmt(c.received)}`, `done ${fmt(c.received)}`, `output ${fmt(c.received)}`,
    `open ${fmt(c.open)}`, `ram ${fmt(c.ram)}`, `${fmt(c.ram)}r`,
    c.extra ? `extra ${fmt(c.extra)}` : "",
    st.party ? `party ${st.party}` : "",
    `legacy feed ${fmt(st.received)}`, `issued ${fmt(st.issued)}`, `reject ${fmt(st.reject)}`,
    `missing ${fmt(st.missing)}`, `alter ${fmt(st.alter)}`, `clear ${fmt(st.alter_clear)}`
  ].filter(Boolean).join(" ");
}
function wipMatrixColumnText(row, key){
  if (String(key || "").startsWith("stage:")) return wipStageFilterText(row, String(key).slice(6));
  const rs = rowStatus(row);
  if (key === "style") return [row.order_no,row.style_no,row.buyer,row.colour,row.component,row.set_id,routeType(row)].join(" ");
  if (key === "release") { const rel=fileReleaseQty(row), order=n(row.order_qty), max=order?Math.floor(order*(1+cuttingToleranceFrac())):0; return !isProductionFileReleased(row) ? `pending release file not released order ${order}` : `${rel>max?"above tolerance":rel>order?"over order within tolerance":"released"} released ${rel} order ${order} max ${max} ${fileReleaseDate(row)}`; }
  if (key === "status") return [statusText(row), stageLabel(rs.stage), rs.status, rs.qty, rs.idle, rs.action, ...currentMovementStatusParts(row).map(p=>[stageLabel(p.stage), p.label, p.qty, p.note, fieldLabel(p.field || currentStatusEntryField(p))].join(" "))].join(" ");
  if (key === "tail") return tailStatusParts(row).length ? tailStatusParts(row).map(p=>["tail", stageLabel(p.stage), STAGE_BY_KEY[p.stage]?.short, p.qty, p.status, p.action].join(" ")).join(" | ") : "no tail closed balanced";
  if (key === "other") return routeProgressSnapshot(row).map(p=>[stageLabel(p.stage), STAGE_BY_KEY[p.stage]?.short, p.label, p.qty, p.title].join(" ")).join(" | ");
  if (key === "owner") return [rs.owner, rs.support, ...rowOwnerNames(row)].join(" ");
  if (key === "route") return [routeType(row), ...routeFor(row).map(k=>`${stageLabel(k)} ${STAGE_BY_KEY[k]?.short || ""}`)].join(" ");
  if (key === "open") return `${fmt(rs.qty)} ${rs.qty}`;
  if (key === "idle") return `${rs.idle}d ${rs.idle}`;
  if (key === "action") return rs.action;
  return "";
}
function hasWipColumnFilters(filters){
  return Object.values(filters || {}).some(v => String(v || "").trim());
}
function wipMatchesGridColumnFilters(row, filters){
  return Object.entries(filters || {}).every(([key,value]) => {
    const q = String(value || "").trim();
    if (!q) return true;
    const text = wipMatrixColumnText(row, key);
    if (q.startsWith("multi::")) {
      const picks = q.slice(7).split("||").map(x=>x.trim()).filter(Boolean);
      return !picks.length || picks.some(pick=>tokenSearchMatch(text, pick));
    }
    return tokenSearchMatch(text, q);
  });
}
function bucketTypeLabel(type){
  return ({ completed_not_issued:"Ready for Next Dept", received_not_processed:"With Department", tail_balance:"Tail Closure Review", cutting_pending:"Cutting Pending", short_closed:"Short Closed", ram:"Reject / Alter / Missing", approved_reject_dispatch:"Approved Reject Dispatch", reconcile:"Reconcile", extra_cut:"Extra Cut" })[type] || type;
}
function typeFromStatusFilter(status){
  if (status === "ready") return "completed_not_issued";
  if (status === "with_dept") return "received_not_processed";
  if (status === "reconcile") return "reconcile";
  if (status === "ram") return "ram";
  if (status === "tail") return "tail_balance";
  return "";
}
function rowMatchesBucketFilter(row, issueType){
  if (!issueType || issueType === "all") return true;
  if (issueType === "closed") return issueBuckets(row).filter(b=>isActionableBucket(row,b) && b.type !== "tail_balance").length === 0;
  return issueBuckets(row).some(b=>b.type === issueType);
}
function compareValue(row, key){
  const rs = rowStatus(row);
  if (key === "style") return row.style_no || "";
  if (key === "buyer") return row.buyer || "";
  if (key === "release") return fileReleaseQty(row);
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
function ledgerDate(x){ return String(x.entry_date || x.entryDate || x.date || "").slice(0,10); }
function ledgerStage(x){ return String(x.stage || x.stage_key || x.dept_key || ""); }
function ledgerType(x){ return String(x.entry_type || x.entryType || x.type || "").toLowerCase(); }
function ledgerQty(x){ return n(x.good_qty ?? x.qty ?? x.delta ?? 0); }
function recentStageOutputQty(ledger=[], stageKey, endDate=today(), lookbackDays=7){
  const end = parseYmd(endDate);
  const start = addDays(end, -(Math.max(1, lookbackDays)-1));
  const startY = ymd(start), endY = ymd(end);
  return (ledger || []).filter(x => {
    const d = ledgerDate(x);
    const t = ledgerType(x);
    return d && d >= startY && d <= endY && ledgerStage(x) === stageKey && ["good_output","output"].includes(t);
  }).reduce((a,x)=>a+ledgerQty(x),0);
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
    Start_Date:"",
    End_Date:"",
    Cutting:0,
    Stitching_Feed:0,
    Checking:0,
    Packing:0,
    Dispatch:0,
    RAM:0,
    Rows:0,
    Note:"No activity ledger yet",
  };
}
function ledgerPeriodNumbers(ledgerRows, rows, label, periodKey, start, end){
  const inRows = (ledgerRows || []).filter(x => inDateRange(x.entry_date || x.entryDate || x.date, start, end));
  const entryType = (x) => String(x.entry_type || x.entryType || "").toLowerCase();
  const qty = (stage, types=[]) => inRows
    .filter(x => String(x.stage) === stage && (!types.length || types.includes(entryType(x))))
    .reduce((a,x)=>a+Math.max(0,n(x.qty ?? x.delta)),0);
  // Factory truth: the previous department's Issue Forward is the next department's Feed.
  // Legacy receive rows are intentionally not added into Feed to avoid double counting.
  const feedQty = (targetStage) => inRows
    .filter(x => ["issue","issued"].includes(entryType(x)))
    .filter(x => {
      const row = findRowForLedger(rows, x);
      if (!row) return false;
      const route = routeFor(row);
      const idx = route.indexOf(String(x.stage || ""));
      return idx >= 0 && route[idx + 1] === targetStage;
    })
    .reduce((a,x)=>a+Math.max(0,n(x.qty ?? x.delta)),0);
  const ram = inRows
    .filter(x => ["reject","alter","missing","ram"].includes(entryType(x)))
    .reduce((a,x)=>a+Math.abs(n(x.qty ?? x.delta)),0);
  return {
    period:periodKey,
    Period:label,
    Date_Range:dateRangeLabel(parseYmd(start), parseYmd(end)),
    Start_Date:start,
    End_Date:end,
    Cutting_Output:qty("cutting", ["good_output","output"]),
    Stitching_Output:qty("stitching", ["good_output","output"]),
    Stitching_Feed:feedQty("stitching"),
    Checking_Output:qty("checking", ["good_output","output"]),
    Checking_Feed:feedQty("checking"),
    Packing_Output:qty("packing", ["good_output","output"]),
    Packing_Feed:feedQty("packing"),
    Dispatch_Output:qty("dispatch", ["dispatch","good_output","output","issue"]),
    Dispatch_Feed:feedQty("dispatch"),
    RAM:ram,
    Rows:inRows.length,
    Note:"Based on production_entries.entry_date",
  };
}
function dailyWeeklyMonthlyRows(rows, ledger=[], selectedDate=today()){
  const cal = productionCalendar445(selectedDate);
  const monthLabel = `Calendar Month · ${fullMonthLabel(parseYmd(selectedDate))}`;
  return [
    ledgerPeriodNumbers(ledger, rows, `Daily · ${selectedDate}`, "daily", selectedDate, selectedDate),
    ledgerPeriodNumbers(ledger, rows, `Production Week · ${cal.fullLabel}`, "production_week", cal.weekStart, cal.weekEnd),
    ledgerPeriodNumbers(ledger, rows, monthLabel, "calendar_month", cal.calendarMonthStart, cal.calendarMonthEnd),
  ];
}
function departmentCurrentRows(rows){
  return STAGES.map(stage => {
    const buckets = rows.flatMap(row => issueBuckets(row).filter(b=>b.stage===stage.key && b.type!=="extra_cut"));
    const production = buckets.filter(b=>["completed_not_issued","received_not_processed"].includes(b.type)).reduce((a,b)=>a+n(b.qty),0);
    const tail = buckets.filter(b=>b.type==="tail_balance").reduce((a,b)=>a+n(b.qty),0);
    const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
    const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
    const styles = new Set(rows.filter(row => issueBuckets(row).some(b=>b.stage===stage.key && b.type!=="extra_cut")).map(r=>r.id)).size;
    const oldest = buckets.reduce((a,b)=>Math.max(a,n(b.idle)),0);
    return { stage:stage.key, Dept:stage.label, Production_Qty:production, Tail_Close_Due:tail, Reconcile_Qty:reconcile, RAM_Qty:ram, Total_Open:production+tail+reconcile+ram, Styles:styles, Oldest_Idle:`${oldest}d` };
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
      const curr = map.get(owner) || { Owner:owner, Production_Qty:0, Tail_Close_Due:0, Reconcile_Qty:0, RAM_Qty:0, Styles:new Set(), Oldest:0, Main_Issue:"" };
      if (bucket.type === "reconcile") curr.Reconcile_Qty += n(bucket.qty);
      else if (bucket.type === "ram") curr.RAM_Qty += n(bucket.qty);
      else if (bucket.type === "tail_balance") curr.Tail_Close_Due += n(bucket.qty);
      else curr.Production_Qty += n(bucket.qty);
      curr.Styles.add(row.id); curr.Oldest = Math.max(curr.Oldest, n(bucket.idle)); curr.Main_Issue = curr.Main_Issue || bucketTypeLabel(bucket.type);
      map.set(owner,curr);
    });
  }));
  return Array.from(map.values()).map(x=>({ Owner:x.Owner, Production_Qty:x.Production_Qty, Tail_Close_Due:x.Tail_Close_Due||0, Reconcile_Qty:x.Reconcile_Qty, RAM_Qty:x.RAM_Qty, Total_Qty:x.Production_Qty+(x.Tail_Close_Due||0)+x.Reconcile_Qty+x.RAM_Qty, Styles:x.Styles.size, Oldest_Idle:`${x.Oldest}d`, Main_Issue:x.Main_Issue })).sort((a,b)=>b.Total_Qty-a.Total_Qty);
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
function agingBucket(days){
  const d = n(days);
  if (d >= 14) return "14d+";
  if (d >= 7) return "7–13d";
  if (d >= 3) return "3–6d";
  return "0–2d";
}
function agingStuckRows(rows){
  const map = new Map();
  rows.forEach(row => issueBuckets(row).filter(b=>b.type!=="extra_cut").forEach(bucket => {
    const a = agingBucket(bucket.idle);
    const key = `${bucket.stage}|${a}`;
    const curr = map.get(key) || { stage:bucket.stage, Dept:stageLabel(bucket.stage), Aging:a, Production_Qty:0, Reconcile_Qty:0, RAM_Qty:0, Total_Qty:0, Styles:new Set(), Oldest:0, Owner:bucket.owner };
    if (bucket.type === "reconcile") curr.Reconcile_Qty += n(bucket.qty);
    else if (bucket.type === "ram") curr.RAM_Qty += n(bucket.qty);
    else curr.Production_Qty += n(bucket.qty);
    curr.Total_Qty += n(bucket.qty); curr.Styles.add(row.id); curr.Oldest=Math.max(curr.Oldest,n(bucket.idle)); curr.Owner = curr.Owner || bucket.owner;
    map.set(key,curr);
  }));
  return Array.from(map.values()).map(x=>({ stage:x.stage, Dept:x.Dept, Aging:x.Aging, Production_Qty:x.Production_Qty, Reconcile_Qty:x.Reconcile_Qty, RAM_Qty:x.RAM_Qty, Total_Qty:x.Total_Qty, Styles:x.Styles.size, Oldest_Idle:`${x.Oldest}d`, Owner:x.Owner })).sort((a,b)=> { const order={"14d+":4,"7–13d":3,"3–6d":2,"0–2d":1}; return (order[b.Aging]-order[a.Aging]) || b.Total_Qty-a.Total_Qty; });
}
function qualityLossRows(rows){
  return STAGES.map(stage => {
    const stageRows = rows.filter(row => routeFor(row).includes(stage.key));
    const accountable = stageRows.reduce((a,row)=>a+(stage.key === "cutting" ? n(row.order_qty) : stageFeed(row, stage.key)),0);
    const reject = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).reject),0);
    const alter = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).alter),0);
    const missing = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).missing),0);
    const ram = reject + alter + missing;
    const denom = accountable;
    return { stage:stage.key, Dept:stage.label, Feed_Qty:accountable, Reject:reject, Alter:alter, Missing:missing, RAM_Total:ram, Loss_Rate: denom ? `${Math.round((ram*1000)/denom)/10}%` : "0%", Styles:stageRows.filter(r=>loss(sdata(r,stage.key))>0).length };
  }).filter(r=>r.RAM_Total>0 || r.Feed_Qty>0).sort((a,b)=>b.RAM_Total-a.RAM_Total);
}
function partyPendingRows(rows){
  return STAGES.flatMap(stage => rows.filter(row => routeFor(row).includes(stage.key) && sdata(row, stage.key).party).map(row => {
    const st=sdata(row,stage.key);
    const c=cellBreakup(row,stage.key);
    // Consistent with WIP: pending-at-party = feed − completed output − R/A/M (same as the department "open" bucket).
    const sentToParty = n(st.issued) || stageFeed(row, stage.key);
    return { stage:stage.key, Party:st.party, Process:stage.label, Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, Sent_To_Party:sentToParty, Returned_Good:n(st.output), Pending_At_Party:c.open, RAM:loss(st), Idle_Days:n(st.idle), Owner:`Production Coordinator + ${st.party}`, Action:`Follow ${st.party} / ${stage.label}` };
  })).sort((a,b)=>(b.Pending_At_Party+b.RAM)-(a.Pending_At_Party+a.RAM));
}
function flowBottleneckRows(rows, ledger=[], referenceDate=today(), lookbackDays=7){
  return STAGES.map(stage => {
    const stageRows = rows.filter(row => routeFor(row).includes(stage.key));
    const inflow = stageRows.reduce((a,row)=>a+(stage.key==="cutting"?n(row.order_qty):stageFeed(row, stage.key)),0);
    const feed = inflow;
    const output = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).output),0);
    const issued = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).issued),0);
    const buckets = stageRows.flatMap(row=>issueBuckets(row).filter(b=>b.stage===stage.key && b.type!=="extra_cut"));
    const queue = buckets.filter(b=>["completed_not_issued","received_not_processed"].includes(b.type)).reduce((a,b)=>a+n(b.qty),0);
    const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
    const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
    const recentOutput = recentStageOutputQty(ledger, stage.key, referenceDate, lookbackDays);
    const realDailyRate = recentOutput > 0 ? recentOutput / Math.max(1, lookbackDays) : 0;
    const fallbackDailyRate = output > 0 ? output / Math.max(1, lookbackDays) : 0;
    const dailyRate = Math.max(1, realDailyRate || fallbackDailyRate);
    return { stage:stage.key, Dept:stage.label, Inflow_or_Feed:inflow, Feed:feed, Output:output, Issued_Forward:issued, Queue_WIP:queue, Reconcile_Qty:reconcile, RAM_Qty:ram, Recent_Output_7d:recentOutput, Daily_Rate:Math.round(dailyRate*10)/10, Days_Cover: queue ? Math.round((queue / dailyRate)*10)/10 : 0, Bottleneck_Score: queue + reconcile*2 + ram };
  }).filter(r=>r.Queue_WIP || r.Reconcile_Qty || r.RAM_Qty || r.Feed || r.Output).sort((a,b)=>b.Bottleneck_Score-a.Bottleneck_Score);
}
function lineEfficiencyRows(rows, ledger=[], start=today(), end=today(), planRows=[]){
  const map = new Map();
  (planRows || []).filter(p=>String(p.dept||"")==="stitching" && inDateRange(String(p.plan_date||"").slice(0,10), start, end)).forEach(p=>{
    const line = p.line || "Unassigned";
    const curr = map.get(line) || { Line:line, Plan_Target:0, Achieved:0, Styles:new Set(), Dept:"Stitching" };
    curr.Plan_Target += coverAdjustedPlanQty ? n(coverAdjustedPlanQty(p, planRows, rows, ledger)) : n(p.planned_qty);
    curr.Styles.add(p.style_no || p.style_input || p.row_id || line);
    map.set(line,curr);
  });
  const period = (ledger || []).filter(x => inDateRange(x.entry_date || x.entryDate || x.date, start, end) && String(x.stage)==="stitching" && ["good_output","output"].includes(String(x.entry_type || x.entryType || "")));
  period.forEach(e => {
    const row = findRowForLedger(rows, e) || {};
    const line = e.line || e.stitching_line || row.line || "Unassigned";
    const curr = map.get(line) || { Line:line, Plan_Target:0, Achieved:0, Styles:new Set(), Dept:"Stitching" };
    curr.Achieved += Math.max(0,n(e.qty ?? e.delta));
    curr.Styles.add(row.id || e.style_no || e.style || line);
    map.set(line,curr);
  });
  if (!map.size) {
    rows.forEach(row => {
      const line = row.line || "Unassigned";
      const curr = map.get(line) || { Line:line, Plan_Target:n(row.plan_qty || row.daily_target || 0), Achieved:0, Styles:new Set(), Dept:"Stitching" };
      curr.Achieved += n(sdata(row,"stitching").output); curr.Styles.add(row.id);
      map.set(line,curr);
    });
  }
  return Array.from(map.values()).map(x=>({ Line:x.Line, Dept:x.Dept, Plan_Target:x.Plan_Target || "Set plan", Achieved:x.Achieved, Variance: x.Plan_Target ? x.Achieved - x.Plan_Target : "—", Efficiency: x.Plan_Target ? `${Math.round((x.Achieved*1000)/x.Plan_Target)/10}%` : "Plan pending", Styles:x.Styles.size })).sort((a,b)=>n(b.Achieved)-n(a.Achieved));
}


const DASHBOARD_OUTPUT_TYPES = new Set(["good_output","output"]);
const DASHBOARD_DISPATCH_OUTPUT_TYPES = new Set(["dispatch","good_output","output","issue","issued"]);
const DASHBOARD_RAM_TYPES = new Set(["reject","rejection","missing","alter","alter_issue","ram"]);
function dashboardEntryQty(e){ return Math.max(0, n(e?.qty ?? e?.delta ?? e?.good_qty ?? e?.output ?? 0)); }
function dashboardIsOutputEntry(e){
  const type = ledgerType(e);
  const stage = ledgerStage(e);
  if (stage === "dispatch") return DASHBOARD_DISPATCH_OUTPUT_TYPES.has(type);
  return DASHBOARD_OUTPUT_TYPES.has(type);
}
function dashboardIsRamEntry(e){ return DASHBOARD_RAM_TYPES.has(ledgerType(e)); }
function dashboardLineLabel(e, row={}){
  const direct = e?.line || e?.stitching_line || e?.line_name || e?.production_line || e?.metadata?.line || row?.line;
  const text = String(direct || "").trim();
  if (text) return text;
  return ledgerStage(e) === "stitching" ? "Unassigned line" : "Dept total";
}
function periodLedgerEntries(ledger=[], start=today(), end=today()){
  return (ledger || []).filter(e=>inDateRange(ledgerDate(e), start, end));
}
function periodOutputEntries(ledger=[], start=today(), end=today()){
  return periodLedgerEntries(ledger,start,end).filter(dashboardIsOutputEntry);
}
function periodRamEntries(ledger=[], start=today(), end=today()){
  return periodLedgerEntries(ledger,start,end).filter(dashboardIsRamEntry);
}
function periodProductionDeptRows(rows=[], ledger=[], start=today(), end=today()){
  const map = new Map();
  const ensure = (stage) => {
    const key = String(stage || "unknown");
    if (!map.has(key)) map.set(key, { stage:key, Dept:stageLabel(key), Output:0, RAM:0, Styles:new Set(), Rows:0 });
    return map.get(key);
  };
  periodOutputEntries(ledger,start,end).forEach(e=>{
    const row = findRowForLedger(rows,e) || {};
    const stage = ledgerStage(e) || "unknown";
    const curr = ensure(stage);
    curr.Output += dashboardEntryQty(e);
    curr.Rows += 1;
    curr.Styles.add(row.id || e.style_no || e.style || `${e.order_no || ""}|${e.colour || ""}|${e.component || ""}`);
  });
  periodRamEntries(ledger,start,end).forEach(e=>{
    const row = findRowForLedger(rows,e) || {};
    const stage = ledgerStage(e) || "unknown";
    const curr = ensure(stage);
    curr.RAM += Math.abs(n(e.qty ?? e.delta ?? e.reject_qty ?? e.alter_qty ?? e.missing_qty));
    curr.Rows += 1;
    curr.Styles.add(row.id || e.style_no || e.style || `${e.order_no || ""}|${e.colour || ""}|${e.component || ""}`);
  });
  return Array.from(map.values()).map(x=>({
    stage:x.stage,
    Dept:x.Dept,
    Output:x.Output,
    RAM:x.RAM,
    "R/A/M %": x.Output ? `${Math.round((x.RAM*1000)/x.Output)/10}%` : (x.RAM ? "No output" : "0%"),
    RAM_Percent_Value: x.Output ? Math.round((x.RAM*1000)/x.Output)/10 : 0,
    Styles:x.Styles.size,
    Rows:x.Rows,
    Start_Date:start,
    End_Date:end,
  })).filter(r=>n(r.Output) || n(r.RAM)).sort((a,b)=>n(b.Output)-n(a.Output)||n(b.RAM)-n(a.RAM)||String(a.Dept).localeCompare(String(b.Dept)));
}
function periodProductionLineRows(rows=[], ledger=[], start=today(), end=today()){
  const map = new Map();
  periodOutputEntries(ledger,start,end).forEach(e=>{
    const row = findRowForLedger(rows,e) || {};
    const stage = ledgerStage(e) || "unknown";
    const hasExplicitLine = !!String(e?.line || e?.stitching_line || e?.line_name || e?.production_line || e?.metadata?.line || row?.line || "").trim();
    if (!hasExplicitLine && stage !== "stitching") return;
    const line = dashboardLineLabel(e,row);
    const key = `${stage}|::|${line}`;
    const curr = map.get(key) || { stage, Dept:stageLabel(stage), Line:line, Output:0, Styles:new Set(), Rows:0 };
    curr.Output += dashboardEntryQty(e);
    curr.Styles.add(row.id || e.style_no || e.style || `${e.order_no || ""}|${e.colour || ""}|${e.component || ""}`);
    curr.Rows += 1;
    map.set(key,curr);
  });
  return Array.from(map.values()).map(x=>({
    stage:x.stage,
    Dept:x.Dept,
    Line:x.Line,
    Output:x.Output,
    Styles:x.Styles.size,
    Rows:x.Rows,
    Start_Date:start,
    End_Date:end,
  })).filter(r=>n(r.Output)).sort((a,b)=>String(a.Dept).localeCompare(String(b.Dept)) || n(b.Output)-n(a.Output) || String(a.Line).localeCompare(String(b.Line)));
}
function periodRamVsOutputRows(rows=[], ledger=[], start=today(), end=today()){
  return periodProductionDeptRows(rows, ledger, start, end)
    .map(r=>({ ...r, Output:n(r.Output), RAM:n(r.RAM), "R/A/M %": r["R/A/M %"], Note:n(r.Output) ? `${fmt(r.RAM)} R/A/M against ${fmt(r.Output)} output` : `${fmt(r.RAM)} R/A/M with no output posted` }))
    .sort((a,b)=>n(b.RAM_Percent_Value)-n(a.RAM_Percent_Value)||n(b.RAM)-n(a.RAM));
}
function filterDashboardDrillLedger(rows=[], ledger=[], drill={}){
  const start = drill.start || today();
  const end = drill.end || start;
  let list = periodLedgerEntries(ledger,start,end);
  if (drill.types === "output") list = list.filter(dashboardIsOutputEntry);
  if (drill.types === "ram") list = list.filter(dashboardIsRamEntry);
  if (drill.stage) list = list.filter(e=>String(ledgerStage(e)) === String(drill.stage));
  if (drill.line) list = list.filter(e=>{
    const row = findRowForLedger(rows,e) || {};
    return String(dashboardLineLabel(e,row)) === String(drill.line);
  });
  return list;
}

function drillSummaryRows(rows){
  const map = new Map();
  rows.forEach(r => {
    const key = `${r.Dept || r.Stage || "Other"}|${r.Owner || "—"}|${r.Buyer || "—"}`;
    const curr = map.get(key) || { Dept:r.Dept || r.Stage || "Other", Owner:r.Owner || "—", Buyer:r.Buyer || "—", Rows:0, Total_Qty:0 };
    curr.Rows += 1; curr.Total_Qty += n(r.Total_Qty ?? r.Total_Open ?? r.Open_Qty ?? r.Open ?? r.Gap ?? r.Qty);
    map.set(key,curr);
  });
  return Array.from(map.values()).sort((a,b)=>b.Total_Qty-a.Total_Qty).slice(0,12);
}

function SortTh({ label, sortKey, sort, setSort, sticky=false, stickyStyle=null, extraClassName="" }){
  const active = sort.key === sortKey;
  const dir = active && sort.dir === "asc" ? "▲" : active ? "▼" : "";
  const cls = `${sticky ? "mt-sticky " : ""}${extraClassName ? `${extraClassName} ` : ""}mt-sort-th`;
  return <th className={cls} style={stickyStyle || undefined} onClick={()=>setSort(s=>s.key===sortKey ? { key:sortKey, dir:s.dir==="asc"?"desc":"asc" } : { key:sortKey, dir:"asc" })}>{label} {dir}</th>;
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
function parseSizeRatioText(text, sizes){
  const cleanSizes = (sizes || []).map(cleanSizeToken).filter(Boolean);
  const raw = String(text || "").trim().toUpperCase();
  if (!raw || !cleanSizes.length) return { weights:{}, totalWeight:0, error:"Enter ratio like 1:2:2:1 or XS=1,S=2,M=2." };
  const bySize = {};
  let foundNamed = false;
  raw.split(/[,;|]+/).forEach(part=>{
    const bits = String(part || "").trim().split(/[:=]/);
    if (bits.length < 2) return;
    const key = cleanSizeToken(bits[0]);
    const val = Number(String(bits.slice(1).join(":")).replace(/[^0-9.]/g,""));
    if (cleanSizes.includes(key) && val > 0) { bySize[key] = val; foundNamed = true; }
  });
  if (foundNamed) {
    const weights = Object.fromEntries(cleanSizes.map(sz=>[sz, Number(bySize[sz] || 0)]));
    const totalWeight = Object.values(weights).reduce((a,b)=>a+b,0);
    return totalWeight > 0 ? { weights, totalWeight, error:"" } : { weights:{}, totalWeight:0, error:"Named ratio has no positive values." };
  }
  const nums = raw.split(/[\s/:,;|]+/).map(x=>Number(String(x).replace(/[^0-9.]/g,""))).filter(x=>x>0);
  if (!nums.length) return { weights:{}, totalWeight:0, error:"Ratio should contain positive numbers." };
  if (nums.length !== cleanSizes.length) return { weights:{}, totalWeight:0, error:`Ratio has ${nums.length} parts but size set has ${cleanSizes.length} sizes (${cleanSizes.join(" / ")}).` };
  const weights = Object.fromEntries(cleanSizes.map((sz,i)=>[sz, nums[i]]));
  return { weights, totalWeight:nums.reduce((a,b)=>a+b,0), error:"" };
}
function distributeByRatio(total, sizes, ratioText){
  const parsed = parseSizeRatioText(ratioText, sizes);
  if (parsed.error) return { qty:{}, ...parsed };
  let used = 0;
  const cleanSizes = (sizes || []).map(cleanSizeToken).filter(Boolean);
  const qty = Object.fromEntries(cleanSizes.map((sz,idx)=>{
    const v = idx === cleanSizes.length - 1 ? n(total) - used : Math.round((n(total) * n(parsed.weights[sz])) / parsed.totalWeight);
    used += v;
    return [sz, Math.max(0, v)];
  }));
  return { qty, ...parsed };
}
function ratioTextFromSizeQty(map, sizes){
  const clean = normalizeSizeQtyMap(map || {}, sizes || []);
  const vals = (sizes || []).map(sz=>n(clean[sz]));
  const positive = vals.filter(v=>v>0);
  if (!positive.length) return "";
  const gcd2 = (a,b)=> b ? gcd2(b, a % b) : Math.abs(a);
  const g = positive.reduce((a,b)=>gcd2(a,b), positive[0]);
  return vals.map(v=>v>0 && g>0 ? Math.round(v/g) : 0).join(":");
}
function ratioSummaryText(ratioText, sizes){
  const parsed = parseSizeRatioText(ratioText, sizes);
  if (parsed.error) return parsed.error;
  return (sizes || []).map(sz=>`${sz} ${n(parsed.weights[cleanSizeToken(sz)])}`).join(" : " );
}
function sizeMatrix(row, stageKey, field="received"){
  const sizes = sizesFor(row);
  const base = stageKey === "cutting" && field === "received" ? sdata(row,"cutting").output : sdata(row, stageKey)[field];
  const split = row.size_stage?.[stageKey]?.[field] || distribute(n(base), sizes);
  return sizes.map(size => ({ size, qty:n(split[size]) }));
}
function normalizeSizeStageSnapshot(row){
  const out = {};
  const src = row?.size_stage || {};
  routeFor(row).forEach(stage=>{
    const stageSrc = src[stage] || {};
    const stageOut = {};
    ["received","output","issued","reject","alter","missing"].forEach(field=>{
      if (!stageSrc[field]) return;
      const clean = normalizeSizeQtyMap(stageSrc[field], sizesFor(row));
      if (Object.values(clean).some(v=>n(v)!==0)) stageOut[field] = clean;
    });
    if (Object.keys(stageOut).length) out[stage] = stageOut;
  });
  return out;
}
function orderToSupabase(row){
  const stageQty = Object.fromEntries(routeFor(row).map(k=>[k, sdata(row,k)]));
  stageQty.__order_size_qty = normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row));
  stageQty.__cutting_short_close_qty = cuttingShortCloseQty(row);
  stageQty.__cutting_short_close_reason = row.cutting_short_close_reason || row.short_close_reason || "";
  // Keep newer planning/style metadata inside existing JSON so old Supabase schemas
  // do not reject saves with schema-cache errors like missing daily_target/default_line.
  stageQty.__daily_target = n(row.daily_target || row.plan_qty || 0) || 0;
  stageQty.__default_line = row.line || "";
  stageQty.__difficulty = row.difficulty || "Normal";
  stageQty.__priority = row.priority || "Normal";
  stageQty.__print_required = !!row.print_required;
  stageQty.__embroidery_required = !!row.embroidery_required;
  stageQty.__dispatch_reject_allowed = !!row.dispatch_reject_allowed;
  stageQty.__size_ratio = row.size_ratio || "";
  stageQty.__size_stage = normalizeSizeStageSnapshot(row);
  stageQty.__file_released_qty = n(row.file_released_qty || row.production_file_released_qty || row.cutting_file_released_qty || 0);
  stageQty.__file_released_date = row.file_released_date || row.production_file_released_date || row.cutting_file_released_date || "";
  stageQty.__set_piece_count = n(row.set_piece_count || 0);
  return {
    // production_orders.id is NOT NULL in the current Supabase schema.
    // Always send a stable text id derived from Order+Style+Colour+Component for manual/demo rows.
    id:stableProductionOrderId(row),
    order_no:row.order_no, style_no:row.style_no, buyer:row.buyer, brand:row.buyer,
    photo_url:row.photo_url || null,
    photo_thumb_url:row.photo_thumb_url || row.photo_url || null,
    photo_folder_url:row.photo_folder_url || null,
    colour:row.colour, component:row.component, set_id:row.set_id || null,
    order_qty:n(row.order_qty), size_set:row.size_set,
    route:routeFor(row),
    stage_qty:stageQty,
    idle_by_stage:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).idle)])),
    party_by_stage:Object.fromEntries(routeFor(row).filter(k=>sdata(row,k).party).map(k=>[k, sdata(row,k).party])),
    reject_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).reject)])),
    alter_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).alter)])),
    missing_qty:Object.fromEntries(routeFor(row).map(k=>[k, n(sdata(row,k).missing)])),
    updated_by:currentUserName(),
    updated_by_role:currentUserRole(),
  };
}
function supabaseToOrder(row){
  const raw = row.stage_qty || {};
  const route = Array.isArray(row.route) ? row.route : BASE_ROUTE;
  const sizeSet = row.size_set || "alpha";
  const sizeList = getSizeSets()[sizeSet] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
  const stages = Object.fromEntries(route.map(k=>{
    const v = raw[k] || {};
    if (typeof v === "number") return [k, { ...blankStage(), received:v, output:v, issued:v }];
    const rejectVal = row.reject_qty?.[k] ?? v.reject;
    const alterVal = row.alter_qty?.[k] ?? v.alter;
    const missingVal = row.missing_qty?.[k] ?? v.missing;
    const idleVal = row.idle_by_stage?.[k] ?? v.idle;
    return [k, { ...blankStage(), ...v, reject:n(rejectVal), alter:n(alterVal), missing:n(missingVal), party:row.party_by_stage?.[k] || v.party || "", idle:n(idleVal) }];
  }));
  const orderSizeRaw = row.order_size_qty || raw.__order_size_qty || raw.order_size_qty || row.size_qty || {};
  const dailyTargetRaw = row.daily_target ?? raw.__daily_target;
  const printRequiredRaw = raw.__print_required;
  const embroideryRequiredRaw = raw.__embroidery_required;
  const dispatchRejectAllowedRaw = raw.__dispatch_reject_allowed;
  const printFallback = !!row.print_required || route.includes("printing");
  const embroideryFallback = !!row.embroidery_required || route.includes("embroidery");
  return {
    id:row.id, order_no:row.order_no, style_no:row.style_no, buyer:row.buyer || row.brand || "", colour:row.colour || "", component:row.component || "",
    photo_url:row.photo_url || "", photo_thumb_url:row.photo_thumb_url || row.photo_url || "", photo_folder_url:row.photo_folder_url || "",
    order_qty:n(row.order_qty), order_size_qty:normalizeSizeQtyMap(orderSizeRaw, sizeList), size_set:sizeSet, size_ratio:row.size_ratio || raw.__size_ratio || "", set_id:row.set_id || "",
    file_released_qty:n(row.file_released_qty || raw.__file_released_qty || 0), file_released_date:row.file_released_date || raw.__file_released_date || "", set_piece_count:n(row.set_piece_count || raw.__set_piece_count || 0),
    line:row.default_line || raw.__default_line || "", difficulty:row.difficulty || raw.__difficulty || "Normal", priority:row.priority || raw.__priority || "Normal",
    daily_target:n(dailyTargetRaw), cutting_short_close_qty:n(row.cutting_short_close_qty || raw.__cutting_short_close_qty), cutting_short_close_reason:row.cutting_short_close_reason || raw.__cutting_short_close_reason || "",
    print_required:(printRequiredRaw ?? printFallback),
    embroidery_required:(embroideryRequiredRaw ?? embroideryFallback),
    dispatch_reject_allowed: typeof dispatchRejectAllowedRaw === "boolean" ? dispatchRejectAllowedRaw : false,
    route, stages, size_stage: raw.__size_stage || row.size_stage || {}
  };
}
async function exportXlsx(filename, sheets){
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const safeRows = rows && rows.length ? rows : [{ Note:"No rows" }];
    const ws = XLSX.utils.json_to_sheet(safeRows);
    const cols = Object.keys(safeRows[0] || {});
    ws["!cols"] = cols.map(c=>{
      const sample = safeRows.slice(0,80).map(r=>String(r?.[c] ?? "").length);
      return { wch:Math.max(10, Math.min(42, Math.max(c.length + 2, ...sample.map(x=>x+2)))) };
    });
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
    id:"demo_s651_bottom", order_no:"SO/25-26/93", style_no:"S-651 C1", buyer:"EXPORT", colour:"C1", component:"BOTTOM", order_qty:648, size_set:"alpha", set_id:"S651C1", line:"STF-3", photo_url:"", print_required:true, embroidery_required:false,
    stages:{
      cutting:{ output:660, issued:660, idle:1 },
      printing:{ received:660, output:648, issued:648, reject:12, party:"Sagar Print House", idle:3 },
      stitching:{ received:648, output:600, issued:590, idle:2 },
      checking:{ received:590, output:560, issued:555, reject:5, idle:1 },
      iron:{ received:555, output:550, issued:545 },
      packing:{ received:545, output:540, issued:0 },
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

const LOCAL_ROWS_KEY = "production_dpr_rows_local_v1";
const LOCAL_LEDGER_KEY = "production_dpr_ledger_local_v1";
const LOCAL_PLAN_KEY = "production_dpr_plan_rows_local_v1";
const DELETED_STYLE_KEYS_KEY = "production_dpr_deleted_style_tombstones_v1";
function deletedStyleKeys(){ return safeJsonLoad(DELETED_STYLE_KEYS_KEY, []); }
function rememberDeletedStyle(row){ const key=styleCompositeKey(row); if(!key) return; const next=Array.from(new Set([key, ...deletedStyleKeys()])).slice(0,500); safeJsonSave(DELETED_STYLE_KEYS_KEY, next); }
function forgetDeletedStyle(row){ const key=styleCompositeKey(row); if(!key) return; safeJsonSave(DELETED_STYLE_KEYS_KEY, deletedStyleKeys().filter(k=>k!==key)); }
function isDeletedStyle(row){ return deletedStyleKeys().includes(styleCompositeKey(row)); }
function filterDeletedStyles(rows){ const tomb=deletedStyleKeys(); if(!tomb.length) return rows || []; return (rows||[]).filter(r=>!tomb.includes(styleCompositeKey(r))); }
function uiStorageKey(name){
  const user = String(currentUserName()).replace(/[^a-z0-9]+/gi,"_").toLowerCase() || "current_user";
  return `production_dpr_ui_${user}_${name}`;
}
function safeJsonLoad(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch { return fallback; }
}
function safeJsonSave(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function loadInitialRows(){
  const saved = safeJsonLoad(LOCAL_ROWS_KEY, null);
  if (Array.isArray(saved) && saved.length) return filterDeletedStyles(saved.map(r=>({ ...r, route:routeFor(r) })));
  return filterDeletedStyles(demoRows.map(r=>({ ...r, route:routeFor(r) })));
}
function loadInitialLedger(){
  const saved = safeJsonLoad(LOCAL_LEDGER_KEY, null);
  return Array.isArray(saved) ? saved : [];
}
function loadInitialPlanRows(){
  const saved = safeJsonLoad(LOCAL_PLAN_KEY, null);
  return Array.isArray(saved) && saved.length ? saved : demoPlanRowsFromRows(demoRows);
}


function Kpi({ label, value, note, tone }){
  return <div className="mt-kpi"><div className="label">{label}</div><div className="value">{value}</div><div className="note">{note}</div>{tone && <div style={{marginTop:8}}><span className={`mt-chip ${statusClass(tone)}`}>{tone}</span></div>}</div>;
}
function StageCell({ row, stageKey, onOpen, style=null, issueFocus="all" }){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return <td style={style||undefined}><div className="mt-stage-cell"><span className="mt-chip mt-muted">Skip</span><div className="mt-cell-note">Route not active</div></div></td>;
  const feed = stageKey === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stageKey);
  const pct = feed > 0 ? Math.round((n(c.received) * 1000) / feed) / 10 : 0;
  const focus = selectedIssueStageFocus(row, stageKey, issueFocus);
  return <td style={style||undefined} className={`mt-clickable-cell dept-focus ${deptClass(stageKey)} ${focus ? "mt-grid-filter-active" : ""}`} onClick={() => onOpen?.(row, stageKey)} title="Click for department detail / size-wise WIP entry">
    <div className={`mt-stage-cell dept-focus ${deptClass(stageKey)}`}>
      <div className="mt-stage-top"><span className="mt-stage-title dept-focus-title">{STAGE_BY_KEY[stageKey].short}</span><span className="mt-chip mt-muted">{pct}%</span>{c.extra ? <AlertTriangle size={13} color="var(--danger)"/> : null}</div>
      {focus ? <div className={`mt-filter-focus-pill ${focus.tone === "late" ? "late" : focus.tone === "ok" ? "ok" : ""}`}><span>{focus.label}</span><b>{fmt(focus.qty)}</b></div> : null}
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



// V6 keeps V6 stable and improves selected-department output cards with full Good/R/A/M/accounted picture.
// These were accidentally dropped during the open-first sheet refactor. Keeping them
// together avoids hidden runtime ReferenceErrors in dashboards/reports/monthly tabs.
function sheetCell(row, stageKey){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return "SKIP";
  const suffix = c.extra ? ` / +${fmt(c.extra)}` : "";
  return `${fmt(c.received)} / ${fmt(c.open)} / ${fmt(c.ram)}R${suffix}`;
}
function allReportSizes(rows){
  const preferred = ["XS","S","M","L","XL","XXL","2-3Y","3-4Y","4-5Y","5-6Y","7-8Y","9-10Y","30","32","34","36","38"];
  const seen = new Set((rows || []).flatMap(sizesFor));
  return preferred.filter(s => seen.has(s)).concat(Array.from(seen).filter(s => !preferred.includes(s)).sort());
}
function withHorizontalSizes(row, qtyBySize, allSizes){
  return Object.fromEntries((allSizes || []).map(size => [size, n(qtyBySize?.[size]) || 0]));
}

function dateOnly(v){ return String(v || "").slice(0,10); }
function actualActivityDate(e){ return dateOnly(e?.actual_date || e?.activity_date || e?.production_date || e?.entry_date || e?.entryDate || e?.date || e?.created_at || e?.createdAt); }
function entryTypedAt(e){ return e?.created_at || e?.createdAt || e?.typed_at || e?.updated_at || ""; }
function entryUser(e){ return e?.changed_by || e?.created_by || e?.user || e?.user_name || e?.validation_snapshot?.changed_by || "—"; }
function entrySource(e){ return e?.entry_source || e?.source || e?.validation_snapshot?.source || ""; }
function entryTypeRaw(e){ return String(e?.entry_type || e?.entryType || e?.type || "").toLowerCase(); }
function entryQty(e){ return n(e?.qty ?? e?.delta ?? e?.good_qty ?? e?.reject_qty ?? e?.alter_qty ?? e?.missing_qty); }
function entryTypeLabelFromRaw(raw){
  const t = String(raw || "").toLowerCase();
  if (["output","good_output","completed","complete","done"].includes(t)) return "Completed / Output";
  if (["issue","issued"].includes(t)) return "Dept Issue Forward";
  if (["receive","received","legacy_feed"].includes(t)) return "Legacy Receive / Feed";
  if (["reject","rejection"].includes(t)) return "Rejection";
  if (t === "missing") return "Missing";
  if (t === "alter") return "Alter Defect";
  if (t === "alter_clear") return "Alter Clear";
  return fieldLabel(t || "entry");
}
function ledgerMatchesSearch(e,row,q){
  const hay = [actualActivityDate(e), entryTypedAt(e), entryUser(e), entrySource(e), e?.order_no || e?.order || row?.order_no, e?.style_no || e?.style || row?.style_no, e?.buyer || row?.buyer, e?.colour || row?.colour, e?.component || row?.component, stageLabel(e?.stage || ""), entryTypeLabelFromRaw(entryTypeRaw(e))].join(" ").toLowerCase();
  const tokens = String(q || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  return !tokens.length || tokens.every(t=>hay.includes(t));
}
function entryLogRows(rows, ledger=[], opts={}){
  const mode = opts.mode || "summary";
  const q = opts.search || "";
  const dept = opts.dept || "all";
  const activity = opts.activity || "all";
  const allSizes = allReportSizes(rows);
  const map = new Map();
  (ledger || []).forEach(e=>{
    const row = findRowForLedger(rows, e) || {};
    const stage = String(e.stage || "");
    const type = entryTypeRaw(e);
    const label = entryTypeLabelFromRaw(type);
    const activityDate = actualActivityDate(e);
    if (!activityDate) return;
    if (dept !== "all" && stage !== dept) return;
    if (activity !== "all" && label !== activity) return;
    if (!ledgerMatchesSearch(e,row,q)) return;
    const styleKey = mode === "detail" ? [e.order_no || e.order || row.order_no || "", e.style_no || e.style || row.style_no || "", e.colour || row.colour || "", e.component || row.component || "", entrySource(e) || ""].join("|::|") : "SUMMARY";
    // Deliberately group by the production actual/activity date, not the typed/created date.
    const key = [activityDate, stage, label, styleKey].join("|::|");
    if (!map.has(key)) {
      map.set(key, {
        Activity_Date:activityDate,
        Department:stageLabel(stage),
        Activity:label,
        Order:e.order_no || e.order || row.order_no || "",
        Style:e.style_no || e.style || row.style_no || "",
        Buyer:e.buyer || row.buyer || "",
        Colour:e.colour || row.colour || "",
        Component:e.component || row.component || "",
        Source:entrySource(e),
        Entries:0,
        Styles:new Set(),
        Orders:new Set(),
        Users:new Set(),
        Total_Qty:0,
        R_A_M:0,
        First_Typed_At:"",
        Last_Typed_At:"",
        _sizes:{},
      });
    }
    const g = map.get(key);
    const qty = entryQty(e);
    g.Entries += 1;
    g.Total_Qty += qty;
    if (["reject","rejection","missing","alter"].includes(type)) g.R_A_M += qty;
    g.Styles.add(String(e.style_no || e.style || row.style_no || ""));
    g.Orders.add(String(e.order_no || e.order || row.order_no || ""));
    g.Users.add(entryUser(e));
    const typedAt = entryTypedAt(e);
    if (typedAt && (!g.First_Typed_At || String(typedAt) < String(g.First_Typed_At))) g.First_Typed_At = typedAt;
    if (typedAt && (!g.Last_Typed_At || String(typedAt) > String(g.Last_Typed_At))) g.Last_Typed_At = typedAt;
    const size = String(e.size || "").toUpperCase();
    if (size) g._sizes[size] = n(g._sizes[size]) + qty;
  });
  return Array.from(map.values()).map(g=>{
    const base = mode === "detail" ? {
      Activity_Date:g.Activity_Date, Department:g.Department, Activity:g.Activity, Order:g.Order, Style:g.Style, Buyer:g.Buyer, Colour:g.Colour, Component:g.Component, Source:g.Source,
    } : {
      Activity_Date:g.Activity_Date, Department:g.Department, Activity:g.Activity, Orders:g.Orders.size, Styles:g.Styles.size,
    };
    const sizeCols = mode === "detail" ? withHorizontalSizes({}, g._sizes, allSizes) : {};
    return { ...base, ...sizeCols, Total_Qty:g.Total_Qty, R_A_M:g.R_A_M, Entries:g.Entries, Users:Array.from(g.Users).filter(Boolean).join(", "), First_Typed_At:g.First_Typed_At, Last_Typed_At:g.Last_Typed_At };
  }).sort((a,b)=>String(b.Activity_Date).localeCompare(String(a.Activity_Date)) || String(a.Department).localeCompare(String(b.Department)) || String(a.Style||"").localeCompare(String(b.Style||"")));
}
function receivingDaySummaryRows(rows, ledger=[], opts={}){
  const q = opts.search || "";
  const map = new Map();
  (ledger || []).forEach(e=>{
    const typ = entryTypeRaw(e);
    if (!["issue","issued","receive","received","legacy_feed"].includes(typ)) return;
    const row = findRowForLedger(rows, e) || {};
    if (!ledgerMatchesSearch(e,row,q)) return;
    const route = row && row.id ? routeFor(row) : [];
    const sourceStage = String(e.stage || "");
    const idx = route.indexOf(sourceStage);
    const isIssueFeed = ["issue","issued"].includes(typ) && idx >= 0 && route[idx + 1];
    const dept = isIssueFeed ? route[idx + 1] : sourceStage;
    const date = actualActivityDate(e);
    const key = [date, dept].join("|::|");
    if (!map.has(key)) map.set(key, { Actual_Date:date, Department:stageLabel(dept), Feed_Qty:0, Legacy_Manual_Receive:0, Orders:new Set(), Styles:new Set(), Entries:0, Users:new Set() });
    const g = map.get(key);
    const qty = entryQty(e);
    if (isIssueFeed) g.Feed_Qty += qty;
    else g.Legacy_Manual_Receive += qty;
    g.Orders.add(String(e.order_no || e.order || row.order_no || ""));
    g.Styles.add(String(e.style_no || e.style || row.style_no || ""));
    g.Users.add(entryUser(e));
    g.Entries += 1;
  });
  return Array.from(map.values()).map(g=>({ Actual_Date:g.Actual_Date, Department:g.Department, Feed_Qty:g.Feed_Qty, Legacy_Manual_Receive:g.Legacy_Manual_Receive, Orders:g.Orders.size, Styles:g.Styles.size, Entries:g.Entries, Users:Array.from(g.Users).filter(Boolean).join(", ") })).sort((a,b)=>String(b.Actual_Date).localeCompare(String(a.Actual_Date)) || String(a.Department).localeCompare(String(b.Department)));
}

function changeLogRows(rows, ledger=[], opts={}){
  const q = opts.search || "";
  return (ledger || []).filter(e=>{
    const flags = [e.is_backdated, e.backdate_reason, e.approval_status, e.validation_status, e.validation_scope, e.validation_snapshot?.validation_status, e.old_qty, e.new_qty].some(Boolean);
    const row = findRowForLedger(rows,e) || {};
    return flags && ledgerMatchesSearch(e,row,q);
  }).map(e=>{
    const row = findRowForLedger(rows,e) || {};
    return {
      Activity_Date:actualActivityDate(e),
      Typed_At:entryTypedAt(e),
      User:entryUser(e),
      Change_Type:String(e.validation_status || e.validation_scope || e.approval_status || (e.is_backdated ? "Backdated" : "Quantity change")),
      Department:stageLabel(e.stage || ""),
      Activity:entryTypeLabelFromRaw(entryTypeRaw(e)),
      Order:e.order_no || e.order || row.order_no || "",
      Style:e.style_no || e.style || row.style_no || "",
      Colour:e.colour || row.colour || "",
      Component:e.component || row.component || "",
      Size:e.size || "",
      Old_Qty:e.old_qty ?? e.oldQty ?? "",
      New_Qty:e.new_qty ?? e.newQty ?? "",
      Delta:entryQty(e),
      Reason:e.backdate_reason || e.reason || e.validation_snapshot?.backdate_reason || "",
      Approval:e.approval_status || e.approval || e.validation_status || e.validation_snapshot?.validation_status || "",
    };
  }).sort((a,b)=>String(b.Activity_Date).localeCompare(String(a.Activity_Date)) || String(b.Typed_At).localeCompare(String(a.Typed_At)));
}
function actualSizeSource(row, stageKey, field){
  return !!row?.size_stage?.[stageKey]?.[field];
}
function sizeQtyMap(row, stageKey, field){
  return Object.fromEntries(sizeMatrix(row, stageKey, field).map(x => [x.size, n(x.qty)]));
}
function addSizeMaps(...maps){
  const out = {};
  maps.forEach(map => Object.entries(map || {}).forEach(([k,v]) => { out[k] = n(out[k]) + n(v); }));
  return out;
}
function subtractSizeMaps(a, b){
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out = {};
  keys.forEach(k => { out[k] = Math.max(0, n(a?.[k]) - n(b?.[k])); });
  return out;
}
function sizeMapTotal(map){ return Object.values(map || {}).reduce((a,v)=>a+n(v),0); }
function sizeMapForBucket(row, bucket){
  const stage = bucket.stage;
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  let map = {};
  if (bucket.type === "completed_not_issued") {
    map = subtractSizeMaps(sizeQtyMap(row, stage, "output"), sizeQtyMap(row, stage, "issued"));
  } else if (bucket.type === "received_not_processed") {
    const feedMap = stageFeedBySize(row, stage);
    const accounted = addSizeMaps(sizeQtyMap(row, stage, "output"), sizeQtyMap(row, stage, "reject"), sizeQtyMap(row, stage, "alter"), sizeQtyMap(row, stage, "missing"));
    map = subtractSizeMaps(feedMap, accounted);
  } else if (bucket.type === "ram") {
    map = addSizeMaps(sizeQtyMap(row, stage, "reject"), sizeQtyMap(row, stage, "alter"), sizeQtyMap(row, stage, "missing"));
  } else if (bucket.type === "reconcile") {
    const feed = idx > 0 ? stageFeedBySize(row, stage) : orderSizeQtyMap(row);
    const accounted = addSizeMaps(sizeQtyMap(row, stage, "output"), sizeQtyMap(row, stage, "reject"), sizeQtyMap(row, stage, "alter"), sizeQtyMap(row, stage, "missing"));
    map = subtractSizeMaps(accounted, feed);
  } else if (bucket.type === "extra_cut") {
    map = subtractSizeMaps(sizeQtyMap(row, "cutting", "output"), orderSizeQtyMap(row));
  } else if (bucket.type === "cutting_pending") {
    const accounted = addSizeMaps(sizeQtyMap(row, "cutting", "output"), sizeQtyMap(row, "cutting", "reject"), sizeQtyMap(row, "cutting", "alter"), sizeQtyMap(row, "cutting", "missing"));
    map = subtractSizeMaps(orderSizeQtyMap(row), accounted);
  } else if (bucket.type === "dispatch_hold") {
    map = distribute(n(bucket.qty), sizesFor(row));
  }
  const total = qtyMapTotal(map);
  if (!total && n(bucket.qty) > 0) map = distribute(n(bucket.qty), sizesFor(row));
  return map;
}
function sizeTruthLabel(row, bucket){
  const stage = bucket?.stage;
  if (!stage) return "—";
  const fields = bucket.type === "ram" ? ["reject","alter","missing"]
    : bucket.type === "completed_not_issued" ? ["output","issued"]
    : bucket.type === "received_not_processed" ? ["output","reject","alter","missing"]
    : ["output","issued","reject","alter","missing"];
  return fields.some(f => actualSizeSource(row, stage, f)) ? "Actual size ledger" : "Derived until size entries exist";
}
function horizontalStageRow(row, stageKey, allSizes){
  const c = cellBreakup(row, stageKey);
  const st = sdata(row, stageKey);
  const field = stageKey === "cutting" ? "output" : "output";
  const sizeQty = Object.fromEntries(sizeMatrix(row, stageKey, field).map(x => [x.size, x.qty]));
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
    Total_Done_Output: n(st.output),
    Issued_Forward: n(st.issued),
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
  const qtyBySize = sizeMapForBucket(row, bucket);
  return {
    Dept_Stage: stageLabel(bucket.stage),
    Issue_Type: bucketTypeLabel(bucket.type),
    Status: bucket.status,
    Order: row.order_no,
    Style: row.style_no,
    Buyer: row.buyer,
    Colour: row.colour,
    Component: row.component,
    Set_ID: row.set_id || "",
    ...withHorizontalSizes(row, qtyBySize, allSizes),
    Total_Qty: n(bucket.qty),
    Percent: `${bucketPct(row,bucket)}%`,
    Idle_Days: n(bucket.idle),
    Idle_Bucket: agingBucket(n(bucket.idle)),
    Owner: bucket.owner,
    Support: bucket.support || "",
    Action: bucket.action,
    Size_Source: sizeTruthLabel(row, bucket),
  };
}
function findRowForLedger(rows, entry){
  return (rows || []).find(row =>
    String(row.order_no || "") === String(entry.order_no || entry.order || "") &&
    String(row.style_no || "") === String(entry.style_no || entry.style || "") &&
    String(row.colour || "") === String(entry.colour || "") &&
    String(row.component || "") === String(entry.component || "")
  ) || null;
}
function ledgerHorizontalRows(rows, ledgerRows, start, end){
  const periodRows = (ledgerRows || []).filter(x => inDateRange(x.entry_date || x.entryDate || x.date, start, end));
  if (!periodRows.length) {
    return [{ Message:`No production activity entries found for ${start === end ? start : `${start} to ${end}`}. Daily/weekly/monthly dashboards use activity entry_date, not when the entry was typed.` }];
  }
  const allSizes = allReportSizes(rows);
  const map = new Map();
  periodRows.forEach(entry => {
    const row = findRowForLedger(rows, entry) || {};
    const key = [entry.entry_date || entry.entryDate || entry.date, entry.stage, entry.entry_type || entry.entryType || "", entry.order_no || entry.order, entry.style_no || entry.style, entry.colour, entry.component, entry.entry_source || entry.source || ""].join("|");
    const old = map.get(key) || {
      Entry_Date: entry.entry_date || entry.entryDate || entry.date || "",
      Stage: stageLabel(entry.stage),
      Entry_Type: entry.entry_type || entry.entryType || "",
      Order: entry.order_no || entry.order || row.order_no || "",
      Style: entry.style_no || entry.style || row.style_no || "",
      Buyer: entry.buyer || row.buyer || "",
      Colour: entry.colour || row.colour || "",
      Component: entry.component || row.component || "",
      Line: dashboardLineLabel(entry, row),
      Source: entry.entry_source || entry.source || "",
      Backdated: entry.is_backdated || entry.isBackdated ? "Yes" : "No",
      Reason: entry.backdate_reason || entry.reason || "",
      Approval: entry.approval_status || entry.approval || "",
      Created_At: entry.created_at || entry.createdAt || "",
      _sizes:{},
      Total_Qty:0,
    };
    const size = entry.size || "NO_SIZE";
    old._sizes[size] = n(old._sizes[size]) + n(entry.qty ?? entry.delta);
    old.Total_Qty += n(entry.qty ?? entry.delta);
    map.set(key, old);
  });
  return Array.from(map.values()).map(r => {
    const sizeCols = withHorizontalSizes({}, r._sizes, allSizes);
    const {_sizes, ...core} = r;
    return { ...core, ...sizeCols, Total_Qty: core.Total_Qty };
  }).sort((a,b)=>String(a.Entry_Date).localeCompare(String(b.Entry_Date)) || String(a.Stage).localeCompare(String(b.Stage)) || String(a.Style).localeCompare(String(b.Style)));
}

function monthRangeFromYm(month){
  const safe = /^\d{4}-\d{2}$/.test(String(month||"")) ? String(month) : today().slice(0,7);
  const [yy,mm] = safe.split("-").map(Number);
  const start = ymd(new Date(yy, mm-1, 1));
  const end = ymd(new Date(yy, mm, 0));
  return { month:safe, start, end, label:fullMonthLabel(parseYmd(start)) };
}
function ledgerEntryInPeriod(entry, start, end){
  const d = ledgerDate(entry);
  return !!d && d >= start && d <= end;
}
function ledgerTypeIn(entry, types=[]){
  return !types.length || types.includes(ledgerType(entry));
}
function ledgerStageIn(entry, stage){
  return String(ledgerStage(entry)) === String(stage);
}
function sumLedger(entries, stage, types=[]){
  return (entries||[]).filter(e=>ledgerStageIn(e, stage) && ledgerTypeIn(e, types)).reduce((a,e)=>a+Math.max(0, ledgerQty(e)),0);
}
function sumLedgerTypes(entries, types=[]){
  return (entries||[]).filter(e=>ledgerTypeIn(e, types)).reduce((a,e)=>a+Math.abs(ledgerQty(e)),0);
}
function ledgerSizeMap(entries, stage, types=[]){
  const out = {};
  (entries||[]).filter(e=>ledgerStageIn(e, stage) && ledgerTypeIn(e, types)).forEach(e=>{
    const size = String(e.size || "").trim();
    if (!size) return;
    out[size] = n(out[size]) + Math.max(0, ledgerQty(e));
  });
  return out;
}
function ledgerNaturalKey(entry, row={}){
  return [
    entry?.order_no || entry?.order || row?.order_no || "",
    entry?.style_no || entry?.style || row?.style_no || "",
    entry?.colour || row?.colour || "",
    entry?.component || row?.component || "",
  ].map(v=>String(v || "")).join("|::|");
}
function ledgerSameNaturalKey(entry, refKey, row={}){
  return ledgerNaturalKey(entry, row) === refKey;
}
function ledgerBeforeDate(entry, date){
  const d = ledgerDate(entry);
  return !!d && d < date;
}
function sumLedgerBefore(entries, stage, types=[], start){
  return (entries||[])
    .filter(e=>ledgerBeforeDate(e, start) && ledgerStageIn(e, stage) && ledgerTypeIn(e, types))
    .reduce((a,e)=>a+Math.max(0, ledgerQty(e)),0);
}
function stagePeriodFlow(periodEntries, allKeyEntries, start){
  const stitchTypes = ["good_output","output"];
  const checkTypes = ["good_output","output"];
  const packTypes = ["good_output","output"];
  const dispatchTypes = ["dispatch","good_output","output","issue"];
  const stitched = sumLedger(periodEntries, "stitching", stitchTypes);
  const checked = sumLedger(periodEntries, "checking", checkTypes);
  const packed = sumLedger(periodEntries, "packing", packTypes);
  const dispatched = sumLedger(periodEntries, "dispatch", dispatchTypes);
  const openingAfterStitch = Math.max(0, sumLedgerBefore(allKeyEntries, "stitching", stitchTypes, start) - sumLedgerBefore(allKeyEntries, "checking", checkTypes, start));
  const openingAfterCheck = Math.max(0, sumLedgerBefore(allKeyEntries, "checking", checkTypes, start) - sumLedgerBefore(allKeyEntries, "packing", packTypes, start));
  const openingPacked = Math.max(0, sumLedgerBefore(allKeyEntries, "packing", packTypes, start) - sumLedgerBefore(allKeyEntries, "dispatch", dispatchTypes, start));
  const checkingFromOpening = Math.min(checked, openingAfterStitch);
  const packingFromOpening = Math.min(packed, openingAfterCheck);
  const dispatchFromOpening = Math.min(dispatched, openingPacked);
  return {
    stitched,
    checked,
    packed,
    dispatched,
    openingAfterStitch,
    openingAfterCheck,
    openingPacked,
    checkingFromOpening,
    checkingFromCurrent: Math.max(0, checked - checkingFromOpening),
    packingFromOpening,
    packingFromCurrent: Math.max(0, packed - packingFromOpening),
    dispatchFromOpening,
    dispatchFromCurrent: Math.max(0, dispatched - dispatchFromOpening),
  };
}
function monthlyComparisonRows(rows, ledger=[], month=today().slice(0,7)){
  const { start, end } = monthRangeFromYm(month);
  const periodEntries = (ledger||[]).filter(e=>ledgerEntryInPeriod(e, start, end));
  if (!periodEntries.length) return [];
  const allSizes = allReportSizes(rows);
  const grouped = new Map();
  periodEntries.forEach(entry=>{
    const row = findRowForLedger(rows, entry) || {};
    const key = ledgerNaturalKey(entry, row);
    const curr = grouped.get(key) || { row, entries:[] };
    if (!curr.row?.style_no && row?.style_no) curr.row = row;
    curr.entries.push(entry);
    grouped.set(key,curr);
  });
  return Array.from(grouped.entries()).map(([key, {row, entries}])=>{
    const rs = row?.style_no ? rowStatus(row) : { status:"", owner:"", qty:0, action:"" };
    const stitchingTypes = ["good_output","output"];
    const productionRamTypes = ["reject","alter","alter_issue","missing","ram"];
    const allKeyEntries = (ledger||[]).filter(e=>ledgerSameNaturalKey(e, key, row));
    const flow = stagePeriodFlow(entries, allKeyEntries, start);
    const ram = sumLedgerTypes(entries, productionRamTypes);
    const sizeMap = ledgerSizeMap(entries, "stitching", stitchingTypes);
    const openingWipUsed = flow.checkingFromOpening + flow.packingFromOpening + flow.dispatchFromOpening;
    return {
      Month: month,
      Period_Start: start,
      Period_End: end,
      Buyer: row.buyer || entries[0]?.buyer || "",
      Order: row.order_no || entries[0]?.order_no || entries[0]?.order || "",
      Style: row.style_no || entries[0]?.style_no || entries[0]?.style || "",
      Colour: row.colour || entries[0]?.colour || "",
      Component: row.component || entries[0]?.component || "",
      Route: row.style_no ? routeType(row) : "",
      ...withHorizontalSizes(row, sizeMap, allSizes),
      Stitching_Feed_In_Period: flow.stitched,
      Checking_In_Period: flow.checked,
      Packing_In_Period: flow.packed,
      Dispatch_In_Period: flow.dispatched,
      Opening_After_Stitch_WIP: flow.openingAfterStitch,
      Checking_From_Opening_WIP: flow.checkingFromOpening,
      Checking_From_Current_Month_Stitch: flow.checkingFromCurrent,
      Opening_After_Checking_WIP: flow.openingAfterCheck,
      Packing_From_Opening_WIP: flow.packingFromOpening,
      Packing_From_Current_Month_Checking: flow.packingFromCurrent,
      Opening_Packed_Not_Dispatched_WIP: flow.openingPacked,
      Dispatch_From_Opening_WIP: flow.dispatchFromOpening,
      Dispatch_From_Current_Month_Packing: flow.dispatchFromCurrent,
      Opening_WIP_Used_In_Month: openingWipUsed,
      RAM_Posted_In_Period: ram,
      Month_Flow_After_Stitch: Math.max(0, flow.stitched - flow.checked),
      Month_Checked_Not_Packed: Math.max(0, flow.checked - flow.packed),
      Month_Packed_Not_Dispatched: Math.max(0, flow.packed - flow.dispatched),
      Entry_Rows: entries.length,
      Current_Status_Snapshot: rs.status,
      Current_Owner_Snapshot: rs.owner,
      Current_Open_Qty_Snapshot: rs.qty,
      Next_Action: rs.action,
    };
  }).filter(r=>n(r.Stitching_Feed_In_Period)+n(r.Checking_In_Period)+n(r.Packing_In_Period)+n(r.Dispatch_In_Period)+n(r.RAM_Posted_In_Period)>0)
    .sort((a,b)=>String(a.Buyer).localeCompare(String(b.Buyer)) || String(a.Order).localeCompare(String(b.Order)) || String(a.Style).localeCompare(String(b.Style)));
}

function buildReportSheets(rows, ledger, planRows=[]){
  const allSizes = allReportSizes(rows);
  const allBuckets = (rows || []).flatMap(row => issueBuckets(row).map(bucket => ({ row, bucket })));
  const activeStageRows = STAGES.flatMap(stage => (rows || []).filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)));
  const deptSheets = STAGES.map(stage => ({
    name: `${stage.short} WIP`,
    rows: (rows || []).filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)),
  }));
  const factorySummary = STAGES.map(stage => {
    const stageRows = (rows || []).filter(row => routeFor(row).includes(stage.key));
    const done = stageRows.reduce((a,row)=>a+n(sdata(row, stage.key).output),0);
    const issued = stageRows.reduce((a,row)=>a+n(sdata(row, stage.key).issued),0);
    const open = stageRows.reduce((a,row)=>a+cellBreakup(row, stage.key).open,0);
    const ram = stageRows.reduce((a,row)=>a+cellBreakup(row, stage.key).ram,0);
    const reconcile = stageRows.reduce((a,row)=>a+Math.max(0, cellBreakup(row, stage.key).extra),0);
    return { Dept: stage.label, Styles: stageRows.length, Done_Output: done, Issued_Forward: issued, Open: open, RAM_Total: ram, Reconcile_Over: reconcile, Main_Owner: stage.owner };
  });
  const wipStatus = (rows || []).map(row => {
    const rs = rowStatus(row);
    const stageCols = Object.fromEntries(STAGES.map(stage => [stage.short, routeFor(row).includes(stage.key) ? sheetCell(row, stage.key) : "SKIP"]));
    return {
      Order: row.order_no,
      Style: row.style_no,
      Buyer: row.buyer,
      Colour: row.colour,
      Component: row.component,
      Set_ID: row.set_id || "",
      Photo_URL: row.photo_url || "",
      Current_Status: rs.status,
      Status_Breakup: statusText(row),
      Current_Owner: rs.owner,
      Open_Qty: rs.qty,
      Idle_Days: rs.idle,
      Next_Action: rs.action,
      Route: routeFor(row).map(stageLabel).join(" > "),
      ...stageCols,
    };
  });
  const bucketSheet = (type) => allBuckets.filter(x => x.bucket.type === type).map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const ramRows = allBuckets.filter(x => x.bucket.type === "ram").map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const ownerRows = allBuckets.filter(x => x.bucket.type !== "extra_cut").map(x => horizontalBucketRow(x.row, x.bucket, allSizes));
  const processRows = STAGES.filter(s => ["printing","embroidery"].includes(s.key)).flatMap(stage => (rows || []).filter(row => routeFor(row).includes(stage.key)).map(row => horizontalStageRow(row, stage.key, allSizes)));
  const partyRows = STAGES.flatMap(stage => (rows || []).filter(row => routeFor(row).includes(stage.key) && sdata(row, stage.key).party).map(row => ({
    Party: sdata(row, stage.key).party,
    Process: stage.label,
    ...horizontalStageRow(row, stage.key, allSizes),
  })));
  const dispatchRows = (rows || []).map(row => horizontalStageRow(row, "dispatch", allSizes));
  const monthlyPeriod = latestActivityDate(ledger).slice(0,7);
  const monthlyRows = monthlyComparisonRows(rows, ledger, monthlyPeriod);
  const ledgerRows = (ledger || []).map(x => ({
    Entry_Date: x.entry_date || x.entryDate || "",
    Created_At: x.created_at || x.createdAt || "",
    Source: x.source || x.entry_source || "",
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
    Line: x.line || x.stitching_line || "",
    Reason: x.backdate_reason || x.reason || "",
    Approval: x.approval_status || x.approval || "",
  }));
  return {
    allSizes,
    factorySummary,
    wipStatus,
    activeStageRows,
    deptSheets,
    completedNotIssued: bucketSheet("completed_not_issued"),
    receivedNotProcessed: bucketSheet("received_not_processed"),
    reconcile: bucketSheet("reconcile"),
    dispatchHold: bucketSheet("dispatch_hold"),
    ramRows,
    ownerRows,
    lineEfficiencyRows: lineEfficiencyRows(rows, ledger, undefined, undefined, planRows),
    bottleneckRows: flowBottleneckRows(rows, ledger),
    agingRows: agingStuckRows(rows),
    qualityRows: qualityLossRows(rows),
    processRows,
    partyRows,
    closureRows: (rows || []).map(row => {
      const rs = rowStatus(row);
      return { Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, Status:rs.status, Closure_Owner:"Production Coordinator + Dept HOD", WIP_Owner:rs.owner, Open_Qty:rs.qty, Can_Close:rs.qty ? "No" : "Yes", Action: rs.qty ? `${rs.action} · Coordinator to close/follow up style` : "Coordinator can verify and close" };
    }),
    dispatchRows,
    monthlyRows,
    ledgerRows,
  };
}
function ProcessRoutes({ rows, setRows }){
  const [routeMsg,setRouteMsg] = useState(null);
  async function toggle(rowId, key){
    const row = (rows||[]).find(r=>String(r.id)===String(rowId));
    if (!row) return;
    const next = { ...row, [key]:!row[key] };
    next.route = routeFor(next);
    next.stages = { ...(next.stages || {}) };
    next.route.forEach(k=>{ if(!next.stages[k]) next.stages[k]=blankStage(); });
    next.route_toggle_updated_at = new Date().toISOString();
    next.route_toggle_updated_by = currentUserName();
    setRows(prev=>prev.map(r=>String(r.id)===String(rowId)?next:r));
    const res = await upsertOneStyleToSupabase(next);
    recordProductionAudit("route_toggle_update", { table_name:"production_orders", order_no:next.order_no, style_no:next.style_no, colour:next.colour, component:next.component, source:"Routes", before_data:{ print_required:row.print_required, embroidery_required:row.embroidery_required, route:routeFor(row) }, after_data:{ print_required:next.print_required, embroidery_required:next.embroidery_required, route:next.route } });
    setRouteMsg(res?.error ? {tone:"late", text:`Route changed locally, Supabase failed: ${res.error.message}`} : res?.warning ? {tone:"warn", text:`Route changed locally. ${res.warning}`} : {tone:"ok", text:`Route saved for ${next.style_no} · history kept`});
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style-wise / Component-wise Print & Embroidery Route Toggles</h3><div className="mt-panel-sub">Optional stages are controlled per style component. Turning a route OFF removes it from active WIP but keeps old history/audit; turning it ON again reuses history.</div>{routeMsg && <span className={`mt-chip ${statusClass(routeMsg.tone)}`}>{routeMsg.text}</span>}</div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style / Component</th><th>Print Required</th><th>Embroidery Required</th><th>Active Route</th><th>History Rule</th></tr></thead><tbody>{(rows||[]).map(row=><tr key={row.id}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.colour} · {row.component}{row.set_id?` · Set ${row.set_id}`:""}</div></td><td><button className={`mt-btn ${row.print_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"print_required")}>{row.print_required?"Print ON":"Print OFF"}</button></td><td><button className={`mt-btn ${row.embroidery_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"embroidery_required")}>{row.embroidery_required?"Emb ON":"Emb OFF"}</button></td><td>{routeFor(row).map(k=><span className="mt-chip mt-muted" key={k} style={{marginRight:4}}>{STAGE_BY_KEY[k]?.short || k}</span>)}</td><td><span className="mt-chip mt-info">Old data retained</span><div className="mt-small">Next-stage checks use the active route only.</div></td></tr>)}</tbody></table></div></div>;
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
function orderSummaryRows(rows){
  const map = new Map();
  (rows||[]).forEach(row => {
    const key = row.order_no || "NO ORDER";
    const rs = rowStatus(row);
    const old = map.get(key) || { Order:key, Buyer:row.buyer || "", Styles:0, Order_Qty:0, Open_WIP:0, Ready_Not_Issued:0, Tail_Close_Due:0, RAM:0, Reconcile:0, Oldest_Idle:0, Critical:0 };
    old.Styles += 1;
    old.Order_Qty += n(row.order_qty);
    old.Open_WIP += n(rs.qty);
    old.Tail_Close_Due += tailBalanceQty(row);
    old.RAM += totalRamQty(row);
    old.Reconcile += rawReconcileQty(row);
    old.Oldest_Idle = Math.max(old.Oldest_Idle, n(rs.idle));
    old.Critical += rs.tone === "late" ? 1 : 0;
    routeFor(row).forEach(stage => { const b=cellBreakup(row,stage); old.Ready_Not_Issued += Math.max(0, n(sdata(row,stage).output)-n(sdata(row,stage).issued)); });
    map.set(key, old);
  });
  return Array.from(map.values()).map(x=>({ ...x, Oldest_Idle:`${x.Oldest_Idle}d` })).sort((a,b)=>n(b.Reconcile)-n(a.Reconcile)||n(b.Open_WIP)-n(a.Open_WIP)||String(a.Order).localeCompare(String(b.Order)));
}

function reconciliationBoardRows(rows, ledger=[]){
  const rowRecon = (rows || []).flatMap(row =>
    issueBuckets(row)
      .filter(bucket => bucket.type === "reconcile")
      .map(bucket => {
        const stage = bucket.stage;
        const st = sdata(row, stage);
        const feed = stage === "cutting" ? cuttingBaseQty(row) : stageFeed(row, stage);
        return {
          stage,
          type: bucket.type,
          Dept: stageLabel(stage),
          Order: row.order_no,
          Style: row.style_no,
          Buyer: row.buyer,
          Colour: row.colour,
          Component: row.component,
          Reconcile_Type: bucket.status || "Reconcile",
          Difference: n(bucket.qty),
          Feed: feed,
          Output: n(st.output),
          Issued_Forward: n(st.issued),
          RAM: loss(st),
          Owner: bucket.owner || "Production Coordinator + Production Manager",
          Idle_Days: `${n(bucket.idle)}d`,
          Action: bucket.action || "Correct upstream entry or create approved adjustment",
        };
      })
  );
  const p0Recon = (ledger || []).filter(e=>String(e.validation_status || e.validation_snapshot?.validation_status || "").includes("p0_date_sequence") || String(e.validation_scope || "").includes("p0_date_sequence")).map(e=>({
    stage:e.stage,
    type:"p0_date_sequence",
    Dept:stageLabel(e.stage),
    Order:e.order_no || e.order || "",
    Style:e.style_no || e.style || "",
    Buyer:e.buyer || "",
    Colour:e.colour || "",
    Component:e.component || "",
    Reconcile_Type:"P0 date-sequence override",
    Difference:n(e.qty !== undefined ? e.qty : e.delta),
    Feed:"dated feed check",
    Output:"see Register",
    Issued_Forward:"see Register",
    RAM:0,
    Owner:"Production Manager + Coordinator",
    Idle_Days:"—",
    Action:"Correct date/quantity sequence from Register; override was confirmed and must be reviewed.",
  }));
  return [...rowRecon, ...p0Recon].sort((a,b)=>n(b.Difference)-n(a.Difference) || String(a.Dept).localeCompare(String(b.Dept)));
}

function dashboardDrillRows(rows, ledger, drill){
  if (!drill) return [];
  if (["period_dept","period_line","period_ram_dept","period_output"].includes(drill.kind)) return ledgerHorizontalRows(rows, filterDashboardDrillLedger(rows, ledger, drill), drill.start || today(), drill.end || drill.start || today());
  if (drill.kind === "period") return ledgerHorizontalRows(rows, ledger, drill.start, drill.end);
  if (drill.kind === "line_efficiency") return lineEfficiencyRows(rows, ledger, drill.start || today(), drill.end || today());
  if (drill.kind === "bottleneck") return flowBottleneckRows(rows, ledger);
  if (drill.kind === "aging") return agingStuckRows(rows);
  if (drill.kind === "quality_loss") return qualityLossRows(rows);
  if (drill.kind === "party_pending") return partyPendingRows(rows);
  if (drill.kind === "sets") return setConvergenceRows(rows);
  if (drill.kind === "order") return styleRowsForDrill(rows, row => String(row.order_no||"") === String(drill.order||""));
  if (drill.kind === "all_styles") return styleRowsForDrill(rows, () => true);
  if (drill.kind === "open_qty") return bucketRowsForDrill(rows, b => b.type !== "extra_cut" && b.type !== "dispatch_hold");
  if (drill.kind === "reconcile") return bucketRowsForDrill(rows, b => b.type === "reconcile");
    if (drill.kind === "completed_not_issued") return bucketRowsForDrill(rows, b => b.type === "completed_not_issued");
  if (drill.kind === "received_not_processed") return bucketRowsForDrill(rows, b => b.type === "received_not_processed");
  if (drill.kind === "ram") return bucketRowsForDrill(rows, b => b.type === "ram");
  if (drill.kind === "coordinator") return bucketRowsForDrill(rows, b => String(b.owner || "").includes("Production Coordinator"));
  if (drill.kind === "stage") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type !== "extra_cut");
  if (drill.kind === "stage_open") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type !== "extra_cut");
  if (drill.kind === "issue_type") return bucketRowsForDrill(rows, b => b.type === drill.type);
  if (drill.kind === "dept_issue") return bucketRowsForDrill(rows, b => b.stage === drill.stage && b.type === drill.type);
  if (drill.kind === "owner") return ownerRowsDetailed(rows, drill.owner);
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
function MiniBarCard({ title, sub, rows, labelKey="label", valueKey="value", onRowClick }){
  const max = Math.max(1, ...rows.map(r=>n(r[valueKey])));
  return <div className="mt-context-card"><div className="mt-context-head"><div><h3 className="mt-context-title">{title}</h3><div className="mt-context-sub">{sub}</div></div><span className="mt-chip mt-muted">Top {Math.min(rows.length,8)}</span></div>{rows.length ? rows.slice(0,8).map((r,i)=><div key={i} className="mt-bar-row" onClick={()=>onRowClick?.(r)} style={{cursor:onRowClick?"pointer":"default"}}><div title={String(r[labelKey])}>{String(r[labelKey]).slice(0,18)}</div><div className="mt-bar-track"><div className="mt-bar-fill" style={{width:`${Math.max(2,(n(r[valueKey])*100)/max)}%`}} /></div><b>{fmt(r[valueKey])}</b></div>) : <div className="mt-small">No data in current filter.</div>}</div>;
}
function DonutCard({ title, sub, rows, labelKey="label", valueKey="value", onRowClick }){
  const colors=["#c96f16","#f0c36d","#d96f5f","#9b84d9","#2563a6","#1f6f54"];
  const total = rows.reduce((a,r)=>a+n(r[valueKey]),0);
  let acc = 0;
  const gradient = total ? rows.map((r,i)=>{ const start=acc; const deg=(n(r[valueKey])*360)/total; acc += deg; return `${colors[i%colors.length]} ${start}deg ${acc}deg`; }).join(", ") : "#efe9df 0deg 360deg";
  return <div className="mt-context-card"><div className="mt-context-head"><div><h3 className="mt-context-title">{title}</h3><div className="mt-context-sub">{sub}</div></div><span className="mt-chip mt-info">{fmt(total)}</span></div><div className="mt-donut-wrap"><div className="mt-donut" style={{background:`conic-gradient(${gradient})`}}/><div className="mt-legend">{rows.slice(0,6).map((r,i)=><div key={i} className="mt-legend-row" onClick={()=>onRowClick?.(r)} style={{cursor:onRowClick?"pointer":"default"}}><span><span className="mt-dot" style={{background:colors[i%colors.length]}}/> {String(r[labelKey]).slice(0,20)}</span><b>{fmt(r[valueKey])}</b></div>)}</div></div></div>;
}

function DashboardActionCard({ title, value, sub, tone="info", onClick }){
  return <button type="button" className="mt-card" onClick={onClick} style={{textAlign:"left", padding:0, cursor:onClick?"pointer":"default", borderColor:tone==="late"?"#e8aaa2":tone==="warn"?"#e4c46f":tone==="ok"?"#a7cdbb":"var(--line-2)", background:tone==="late"?"#fff4f1":tone==="warn"?"#fff9e5":tone==="ok"?"#f0fbf6":"var(--surface)"}}>
    <div className="mt-section" style={{minHeight:104}}>
      <div className="mt-panel-sub" style={{textTransform:"uppercase", fontWeight:800, letterSpacing:.4, margin:0}}>{title}</div>
      <div className="mt-kpi" style={{border:0, padding:0, boxShadow:"none", background:"transparent"}}><div className="value" style={{fontSize:26}}>{value}</div></div>
      <div className="mt-small" style={{lineHeight:1.35}}>{sub}</div>
      {onClick ? <div style={{marginTop:8}}><span className={`mt-chip ${statusClass(tone)}`}>Open detail</span></div> : null}
    </div>
  </button>;
}
function DashboardBarPanel({ title, sub, rows, labelKey="label", valueKey="value", onRowClick, maxRows=8 }){
  const cleanRows = (rows||[]).filter(r=>n(r[valueKey])>0).slice(0,maxRows);
  const max = Math.max(1, ...cleanRows.map(r=>n(r[valueKey])));
  return <div className="mt-card"><div className="mt-section"><div className="mt-drill-head"><div><h3 className="mt-panel-title">{title}</h3><div className="mt-panel-sub">{sub}</div></div><span className="mt-chip mt-muted">{cleanRows.length} rows</span></div>
    <div style={{display:"grid", gap:8, marginTop:10}}>{cleanRows.length ? cleanRows.map((r,i)=><button key={i} type="button" onClick={()=>onRowClick?.(r)} style={{border:"1px solid var(--line-2)", background:"var(--surface)", borderRadius:12, padding:9, cursor:onRowClick?"pointer":"default", textAlign:"left"}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"baseline"}}><b style={{fontFamily:"Archivo, sans-serif"}}>{String(r[labelKey] || "—")}</b><b>{fmt(r[valueKey])}</b></div>
      <div className="mt-bar-track" style={{height:9, marginTop:6}}><div className="mt-bar-fill" style={{width:`${Math.max(2,(n(r[valueKey])*100)/max)}%`}} /></div>
      {r.note || r.Note ? <div className="mt-small" style={{marginTop:5}}>{r.note || r.Note}</div> : null}
    </button>) : <div className="mt-small">No data in current filter.</div>}</div>
  </div></div>;
}
function DashboardQuickTable({ title, sub, rows, empty, onRowClick, exportName }){
  return <details className="mt-fold"><summary>{title} <span className="mt-small" style={{fontFamily:"JetBrains Mono, monospace", marginLeft:8}}>{Array.isArray(rows)?rows.length:0} rows</span></summary><SimpleTable title={title} sub={sub} rows={rows} empty={empty} onRowClick={onRowClick} exportName={exportName}/></details>;
}
function Dashboard({ rows, ledger=[], planRows=[], onDrill, clearTick=0 }){
  const activityDate = latestActivityDate(ledger);
  const [selectedDate, setSelectedDate] = useState(()=>safeJsonLoad(uiStorageKey("dashboard_selected_date"), activityDate));
  useEffect(()=>{ setSelectedDate(d => d || activityDate); }, [activityDate]);
  useEffect(()=>safeJsonSave(uiStorageKey("dashboard_selected_date"), selectedDate), [selectedDate]);
  const selectedDay = selectedDate || activityDate;
  const cal = productionCalendar445(selectedDay);
  const dailyDeptProductionRows = periodProductionDeptRows(rows, ledger, selectedDay, selectedDay);
  const weeklyDeptProductionRows = periodProductionDeptRows(rows, ledger, cal.weekStart, cal.weekEnd);
  const dailyLineProductionRows = periodProductionLineRows(rows, ledger, selectedDay, selectedDay);
  const weeklyLineProductionRows = periodProductionLineRows(rows, ledger, cal.weekStart, cal.weekEnd);
  const dailyRamVsOutputRows = periodRamVsOutputRows(rows, ledger, selectedDay, selectedDay);
  const weeklyRamVsOutputRows = periodRamVsOutputRows(rows, ledger, cal.weekStart, cal.weekEnd);
  const dailyTotalOutput = dailyDeptProductionRows.reduce((a,r)=>a+n(r.Output),0);
  const weeklyTotalOutput = weeklyDeptProductionRows.reduce((a,r)=>a+n(r.Output),0);
  const buckets = rows.flatMap(row => issueBuckets(row).map(bucket => ({ ...bucket, row })));
  const openBuckets = buckets.filter(b=>b.type!=="extra_cut" && b.type!=="dispatch_hold");
  const openQty = openBuckets.reduce((a,b)=>a+n(b.qty),0);
  const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
  const completedNotIssued = buckets.filter(b=>b.type==="completed_not_issued").reduce((a,b)=>a+n(b.qty),0);
  const receivedNotProcessed = buckets.filter(b=>b.type==="received_not_processed").reduce((a,b)=>a+n(b.qty),0);
  const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
  const tailQty = buckets.filter(b=>b.type==="tail_balance").reduce((a,b)=>a+n(b.qty),0);
  const deptRows = departmentCurrentRows(rows);
  const issueDeptRows = departmentIssueRows(rows);
  const ownerRows = ownerActivityRows(rows);
  const periodRows = dailyWeeklyMonthlyRows(rows, ledger, selectedDay);
  const reconciliationRows = reconciliationBoardRows(rows, ledger);
  const meetingRows = meetingFocusRows(rows);
  const lineRows = lineEfficiencyRows(rows, ledger, cal.weekStart, cal.weekEnd, planRows);
  const bottleneckRows = flowBottleneckRows(rows, ledger);
  const agingRows = agingStuckRows(rows);
  const qualityRows = qualityLossRows(rows);
  const partyRows = partyPendingRows(rows);
  const setRows = setConvergenceRows(rows);
  const setsUnmatched = setRows.reduce((a,r)=>a+n(r.Unmatched),0);
  const orderRows = orderSummaryRows(rows);
  const [dashView, setDashView] = useState(()=>safeJsonLoad(uiStorageKey("dashboard_view"), "summary"));
  useEffect(()=>safeJsonSave(uiStorageKey("dashboard_view"), dashView), [dashView]);
  useEffect(()=>{ if (!clearTick) return; setDashView("summary"); setSelectedDate(activityDate); }, [clearTick]);
  const issueMixRows = [
    { Issue:"With department", Qty:receivedNotProcessed, kind:"received_not_processed", note:"Normal WIP being processed." },
    { Issue:"Ready to move", Qty:completedNotIssued, kind:"completed_not_issued", note:"Information unless it blocks plan." },
    { Issue:"R/A/M", Qty:ram, kind:"ram", note:"Reject / alter / missing." },
    { Issue:"Reconcile", Qty:reconcile, kind:"reconcile", note:"Needs correction/review." },
  ].filter(x=>x.Qty>0);
  const deptChartRows = deptRows.map(r=>({ Dept:r.Dept, Qty:n(r.Total_Open || r.Open_Qty || r.Qty), stage:r.stage, note:`${r.Styles || 0} styles` })).filter(r=>r.Qty>0);
  const daily = periodRows[0] || {};
  const hardActionQty = reconcile + ram + setsUnmatched;
  const normalInfoQty = Math.max(0, openQty - hardActionQty);
  const topActionRows = [
    reconcile ? { title:"Reconcile / blocked", qty:reconcile, tone:"late", action:"Fix impossible quantity movement", drill:{kind:"reconcile", title:"Reconcile / Blocked"} } : null,
    ram ? { title:"R/A/M", qty:ram, tone:"warn", action:"Review rejection/alter/missing", drill:{kind:"ram", title:"Reject / Alter / Missing"} } : null,
    setsUnmatched ? { title:"Set mismatch", qty:setsUnmatched, tone:"warn", action:"Match top/bottom components", drill:{kind:"sets", title:"Sets Convergence"} } : null,
    meetingRows.length ? { title:"Meeting focus", qty:meetingRows.length, tone:"info", action:"Open exception list", drill:{kind:"meeting_focus", title:"Production Meeting Focus"} } : null,
  ].filter(Boolean);
  const todayOutputRows = dailyDeptProductionRows.map(r=>({ Dept:r.Dept, Qty:n(r.Output), RAM:n(r.RAM), stage:r.stage, note:`R/A/M ${fmt(r.RAM)} · ${r["R/A/M %"]}` })).filter(x=>x.Qty>0 || x.RAM>0);
  const ramTypes = new Set(["reject","rejection","missing","alter","alter_issue"]);
  function ramPeriodRows(start,end){
    const map = new Map();
    (ledger||[]).filter(e=>ramTypes.has(ledgerType(e)) && inDateRange(ledgerDate(e), start, end)).forEach(e=>{
      const row = findRowForLedger(rows,e) || {};
      const dept = stageLabel(ledgerStage(e));
      const curr = map.get(dept) || { Dept:dept, Qty:0, Styles:new Set(), stage:ledgerStage(e) };
      curr.Qty += Math.max(0,n(e.qty ?? e.delta ?? e.reject_qty ?? e.alter_qty ?? e.missing_qty));
      curr.Styles.add(row.id || e.style_no || e.style || "?");
      map.set(dept,curr);
    });
    return Array.from(map.values()).map(x=>({ Dept:x.Dept, Qty:x.Qty, Styles:x.Styles.size, stage:x.stage })).sort((a,b)=>n(b.Qty)-n(a.Qty));
  }
  function ramStyleRows(start,end){
    const map = new Map();
    (ledger||[]).filter(e=>ramTypes.has(ledgerType(e)) && inDateRange(ledgerDate(e), start, end)).forEach(e=>{
      const row = findRowForLedger(rows,e) || {};
      const key = [e.order_no || row.order_no, e.style_no || row.style_no, e.colour || row.colour, e.component || row.component].join("|::|");
      const curr = map.get(key) || { Order:e.order_no || row.order_no || "", Style:e.style_no || row.style_no || "", Buyer:row.buyer || e.buyer || "", Colour:e.colour || row.colour || "", Component:e.component || row.component || "", RAM_Qty:0, Rows:0 };
      curr.RAM_Qty += Math.max(0,n(e.qty ?? e.delta ?? e.reject_qty ?? e.alter_qty ?? e.missing_qty));
      curr.Rows += 1;
      map.set(key,curr);
    });
    return Array.from(map.values()).sort((a,b)=>n(b.RAM_Qty)-n(a.RAM_Qty));
  }
  const todayRamRows = ramPeriodRows(selectedDate || activityDate, selectedDate || activityDate);
  const weekRamRows = ramPeriodRows(cal.weekStart, cal.weekEnd);
  const weekRamStyleRows = ramStyleRows(cal.weekStart, cal.weekEnd);
  const todayRamTotal = todayRamRows.reduce((a,r)=>a+n(r.Qty),0);
  const weekRamTotal = weekRamRows.reduce((a,r)=>a+n(r.Qty),0);
  const weekGapRows = lineRows.map(r=>({ Line:r.Line, Dept:r.Dept, Gap:Math.max(0,n(r.Plan_Target)-n(r.Achieved)), Plan_Target:r.Plan_Target, Achieved:r.Achieved, Efficiency:r.Efficiency })).filter(r=>n(r.Gap)>0).sort((a,b)=>n(b.Gap)-n(a.Gap));
  const pushFocus = weekGapRows[0] || null;
  return <>
    <div className="mt-card" style={{marginBottom:12}}><div className="mt-section">
      <div className="mt-drill-head"><div><h3 className="mt-panel-title">Factory Whiteboard</h3><div className="mt-panel-sub"><b>WHITEBOARD MODE ACTIVE</b> · floor-glance summary first. Normal WIP is separate from manager action. Every card and row is drillable.</div></div><div className="mt-toggle-row"><button className={`mt-btn ${dashView==="summary"?"active":""}`} onClick={()=>setDashView("summary")}>Whiteboard</button><button className={`mt-btn ${dashView==="charts"?"active":""}`} onClick={()=>setDashView("charts")}>Graphs</button><button className={`mt-btn ${dashView==="tables"?"active":""}`} onClick={()=>setDashView("tables")}>Tables</button></div></div>
      <div className="mt-toolbar" style={{marginTop:10}}><span className="mt-toolbar-label">Activity date</span><input className="mt-input mt-entry-date" type="date" value={selectedDay} onChange={e=>setSelectedDate(e.target.value)} /><span className="mt-chip mt-info">{cal.fullLabel}</span><span className="mt-chip mt-muted">Month {fullMonthLabel(parseYmd(selectedDate || activityDate))}</span></div>
    </div></div>

    {dashView === "summary" && <>
      <div className="mt-grid" style={{marginBottom:12}}>
        <DashboardActionCard title="Today vs plan" value={fmt(dailyTotalOutput)} sub={`${selectedDay} actual output. Plan comparison appears line-wise below.`} tone="ok" onClick={()=>onDrill?.({kind:"period", period:"daily", start:selectedDay, end:selectedDay, title:`Daily Activity — ${selectedDay}`})}/>
        <DashboardActionCard title="Week vs target" value={pushFocus ? `${fmt(pushFocus.Achieved)} / ${fmt(pushFocus.Plan_Target)}` : fmt(weeklyTotalOutput || lineRows.reduce((a,r)=>a+n(r.Achieved),0))} sub={pushFocus ? `Push ${pushFocus.Line}: gap ${fmt(pushFocus.Gap)}` : "Weekly line target OK / not set."} tone={pushFocus?"warn":"ok"} onClick={()=>onDrill?.({kind:"line_efficiency", start:cal.weekStart, end:cal.weekEnd, title:`Line Output — ${cal.fullLabel}`})}/>
        <DashboardActionCard title="Push focus" value={pushFocus ? fmt(pushFocus.Gap) : "OK"} sub={pushFocus ? `${pushFocus.Line} is most behind weekly target` : "No weekly push gap found."} tone={pushFocus?"late":"ok"} onClick={()=>onDrill?.({kind:"line_efficiency", start:cal.weekStart, end:cal.weekEnd, title:`Where to push this week`})}/>
        <DashboardActionCard title="Today R/A/M" value={fmt(todayRamTotal)} sub={todayRamRows[0] ? `${todayRamRows[0].Dept} highest today` : "No R/A/M posted today."} tone={todayRamTotal?"warn":"ok"} onClick={()=>onDrill?.({kind:"quality_loss", title:"R/A/M today by department"})}/>
        <DashboardActionCard title="Week R/A/M" value={fmt(weekRamTotal)} sub={weekRamStyleRows[0] ? `${weekRamStyleRows[0].Style} highest this week` : "No R/A/M this week."} tone={weekRamTotal?"warn":"ok"} onClick={()=>onDrill?.({kind:"quality_loss", title:"R/A/M highest styles this week"})}/>
        <DashboardActionCard title="Action items" value={fmt(hardActionQty)} sub={hardActionQty ? "True exceptions only: P0/reconcile/RAM/set mismatch." : "No hard blocker in current filter."} tone={hardActionQty?"late":"ok"} onClick={()=>onDrill?.(hardActionQty ? {kind:"meeting_focus", title:"Dashboard Action List"} : {kind:"all_styles", title:"All Styles"})}/>
      </div>
      <div className="mt-two" style={{marginBottom:12}}>
        <div className="mt-card"><div className="mt-section"><div className="mt-drill-head"><div><h3 className="mt-panel-title">Today’s factory reading</h3><div className="mt-panel-sub">Plain-language meeting list. These are summaries; click for rows.</div></div><span className="mt-chip mt-muted">{topActionRows.length || 1} items</span></div>
          <div style={{display:"grid", gap:8, marginTop:10}}>{topActionRows.length ? topActionRows.map((r,i)=><button key={i} className="mt-card" style={{boxShadow:"none", textAlign:"left", cursor:"pointer"}} onClick={()=>onDrill?.(r.drill)}><div className="mt-section" style={{padding:10}}><div style={{display:"flex", justifyContent:"space-between", gap:8}}><b>{r.title}</b><span className={`mt-chip ${statusClass(r.tone)}`}>{fmt(r.qty)}</span></div><div className="mt-small" style={{marginTop:5}}>{r.action}</div></div></button>) : <div className="mt-card" style={{boxShadow:"none"}}><div className="mt-section" style={{padding:10}}><b>Looks clear</b><div className="mt-small" style={{marginTop:5}}>No hard blocker in this filter. Use Normal WIP to monitor flow.</div></div></div>}</div>
        </div></div>
        <DashboardBarPanel title="Department load" sub="Where the quantity is sitting now. Click a department for style detail." rows={deptChartRows} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"stage", stage:r.stage, title:`${r.Dept} Current WIP`})}/>
      </div>
      <div className="mt-two">
        <SimpleTable title="Order summary" sub="Order-level first so many styles do not become noise. Click order for style rows." rows={orderRows.slice(0,10)} empty="No orders in current dashboard scope." onRowClick={(r)=>onDrill?.({kind:"order", order:r.Order, title:`Order — ${r.Order}`})}/>
        <SimpleTable title="Where to push this week" sub="Line-wise plan vs actual. Stitching DPR line entry updates this." rows={lineRows.slice(0,10)} empty="No line output yet." onRowClick={()=>onDrill?.({kind:"line_efficiency", start:cal.weekStart, end:cal.weekEnd, title:`Line Output — ${cal.fullLabel}`})}/>
      </div>
      <div className="mt-two" style={{marginTop:12}}>
        <SimpleTable title="Daily production — department wise" sub="Output posted on selected activity date. Click a department for style/size breakup." rows={dailyDeptProductionRows} empty="No production output on selected date." onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} production — ${selectedDay}`})}/>
        <SimpleTable title="Daily production — line wise" sub="Line-wise output for selected activity date. Click a line for style/size breakup." rows={dailyLineProductionRows} empty="No line output on selected date." onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:selectedDay, end:selectedDay, title:`${r.Line} production — ${selectedDay}`})}/>
      </div>
      <div className="mt-two" style={{marginTop:12}}>
        <SimpleTable title="Weekly production — department wise" sub={`${cal.fullLabel}. Click a department for detail.`} rows={weeklyDeptProductionRows} empty="No production output this production week." onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} production — ${cal.fullLabel}`})}/>
        <SimpleTable title="Weekly production — line wise" sub={`${cal.fullLabel}. Click a line for detail.`} rows={weeklyLineProductionRows} empty="No line output this production week." onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:cal.weekStart, end:cal.weekEnd, title:`${r.Line} production — ${cal.fullLabel}`})}/>
      </div>
      <div className="mt-two" style={{marginTop:12}}>
        <SimpleTable title="Daily R/A/M % vs output" sub="R/A/M divided by same-day output, department-wise. Click department for R/A/M rows." rows={dailyRamVsOutputRows} empty="No R/A/M today." onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} R/A/M — ${selectedDay}`})}/>
        <SimpleTable title="Weekly R/A/M % vs output" sub="R/A/M divided by weekly output, department-wise. Click department for R/A/M rows." rows={weeklyRamVsOutputRows} empty="No R/A/M this week." onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} R/A/M — ${cal.fullLabel}`})}/>
      </div>
    </>}

    {dashView === "charts" && <>
      <div className="mt-grid" style={{marginBottom:12}}>
        <DashboardBarPanel title="Daily dept production" sub="Output posted on selected date." rows={dailyDeptProductionRows.map(r=>({ ...r, Qty:n(r.Output), note:`RAM ${fmt(r.RAM)} · ${r["R/A/M %"]}` }))} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} production — ${selectedDay}`})}/>
        <DashboardBarPanel title="Daily line production" sub="Line-wise output on selected date." rows={dailyLineProductionRows.map(r=>({ ...r, Qty:n(r.Output), note:`${r.Dept} · ${r.Styles} styles` }))} labelKey="Line" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:selectedDay, end:selectedDay, title:`${r.Line} production — ${selectedDay}`})}/>
        <DashboardBarPanel title="Weekly dept production" sub={cal.fullLabel} rows={weeklyDeptProductionRows.map(r=>({ ...r, Qty:n(r.Output), note:`RAM ${fmt(r.RAM)} · ${r["R/A/M %"]}` }))} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} production — ${cal.fullLabel}`})}/>
        <DashboardBarPanel title="Weekly line production" sub={cal.fullLabel} rows={weeklyLineProductionRows.map(r=>({ ...r, Qty:n(r.Output), note:`${r.Dept} · ${r.Styles} styles` }))} labelKey="Line" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:cal.weekStart, end:cal.weekEnd, title:`${r.Line} production — ${cal.fullLabel}`})}/>
      </div>
      <div className="mt-grid" style={{marginBottom:12}}>
        <DashboardBarPanel title="Daily R/A/M vs output" sub="Department-wise quality pressure." rows={dailyRamVsOutputRows.map(r=>({ ...r, Qty:n(r.RAM), note:`${r["R/A/M %"]} of ${fmt(r.Output)} output` }))} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} R/A/M — ${selectedDay}`})}/>
        <DashboardBarPanel title="Weekly R/A/M vs output" sub="Department-wise quality pressure." rows={weeklyRamVsOutputRows.map(r=>({ ...r, Qty:n(r.RAM), note:`${r["R/A/M %"]} of ${fmt(r.Output)} output` }))} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} R/A/M — ${cal.fullLabel}`})}/>
        <DashboardBarPanel title="Department WIP" sub="Current open quantity by department." rows={deptChartRows} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"stage", stage:r.stage, title:`${r.Dept} Current WIP`})}/>
        <DashboardBarPanel title="Issue mix" sub="Normal info vs true issues." rows={issueMixRows} labelKey="Issue" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:r.kind, title:r.Issue})}/>
      </div>
      <div className="mt-two"><DashboardBarPanel title="Bottleneck score" sub="Queue + R/A/M + reconcile pressure." rows={bottleneckRows.map(r=>({ Dept:r.Dept, Qty:n(r.Bottleneck_Score), stage:r.stage, note:`Queue ${fmt(r.Queue_WIP)} · cover ${r.Days_Cover}d` }))} labelKey="Dept" valueKey="Qty" onRowClick={()=>onDrill?.({kind:"bottleneck", title:"Bottleneck / Flow"})}/><DashboardBarPanel title="Top risky orders" sub="Open WIP + higher weight for reconcile/RAM." rows={orderRows.map(r=>({ Order:r.Order, Qty:n(r.Open_WIP)+n(r.Reconcile)*2+n(r.RAM), Raw:r })).filter(r=>r.Qty>0)} labelKey="Order" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"order", order:r.Order, title:`Order — ${r.Order}`})}/></div>
    </>}

    {dashView === "tables" && <>
      <DashboardQuickTable title="Order-wise summary" sub="Grouped order view. Expand only when needed." rows={orderRows} empty="No orders in current scope." onRowClick={(r)=>onDrill?.({kind:"order", order:r.Order, title:`Order — ${r.Order}`})} exportName="dashboard_order_summary"/>
      <DashboardQuickTable title="Daily / weekly / monthly output" sub="Period numbers use activity entry date." rows={periodRows} empty="No period activity rows." onRowClick={(r)=>onDrill?.({kind:"period", period:r.period, start:r.Start_Date, end:r.End_Date, title:`${r.Period} Activity`})} exportName="dashboard_period_output"/>
      <DashboardQuickTable title="Daily production — department wise" sub="Selected date output, with R/A/M percent." rows={dailyDeptProductionRows} empty="No production output on selected date." onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} production — ${selectedDay}`})} exportName="dashboard_daily_dept_production"/>
      <DashboardQuickTable title="Daily production — line wise" sub="Selected date line output." rows={dailyLineProductionRows} empty="No line output on selected date." onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:selectedDay, end:selectedDay, title:`${r.Line} production — ${selectedDay}`})} exportName="dashboard_daily_line_production"/>
      <DashboardQuickTable title="Weekly production — department wise" sub={`${cal.fullLabel}, with R/A/M percent.`} rows={weeklyDeptProductionRows} empty="No production output this week." onRowClick={(r)=>onDrill?.({kind:"period_dept", types:"output", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} production — ${cal.fullLabel}`})} exportName="dashboard_weekly_dept_production"/>
      <DashboardQuickTable title="Weekly production — line wise" sub={cal.fullLabel} rows={weeklyLineProductionRows} empty="No line output this week." onRowClick={(r)=>onDrill?.({kind:"period_line", types:"output", stage:r.stage, line:r.Line, start:cal.weekStart, end:cal.weekEnd, title:`${r.Line} production — ${cal.fullLabel}`})} exportName="dashboard_weekly_line_production"/>
      <DashboardQuickTable title="Daily R/A/M % vs output" sub="Selected date quality pressure against output." rows={dailyRamVsOutputRows} empty="No R/A/M today." onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:selectedDay, end:selectedDay, title:`${r.Dept} R/A/M — ${selectedDay}`})} exportName="dashboard_daily_ram_percent"/>
      <DashboardQuickTable title="Weekly R/A/M % vs output" sub="Weekly quality pressure against output." rows={weeklyRamVsOutputRows} empty="No R/A/M this week." onRowClick={(r)=>onDrill?.({kind:"period_ram_dept", types:"ram", stage:r.stage, start:cal.weekStart, end:cal.weekEnd, title:`${r.Dept} R/A/M — ${cal.fullLabel}`})} exportName="dashboard_weekly_ram_percent"/>
      <DashboardQuickTable title="Department WIP" sub="Department-wise current bins. Normal WIP is information; exceptions are highlighted separately." rows={deptRows.map(({stage,...r})=>r)} empty="No department WIP." onRowClick={(r)=>{ const match = deptRows.find(x=>x.Dept===r.Dept); onDrill?.({kind:"stage", stage:match?.stage, title:`${r.Dept} Current WIP`}); }} exportName="dashboard_department_wip"/>
      <DashboardQuickTable title="Department issue summary" sub="Issue by department. Click for style/size rows." rows={issueDeptRows.map(({stage,type,...r})=>r)} empty="No issue rows." onRowClick={(r)=>{ const match = issueDeptRows.find(x=>x.Dept===r.Dept && x.Issue===r.Issue); onDrill?.({kind:"dept_issue", stage:match?.stage, type:match?.type, title:`${r.Dept} — ${r.Issue}`}); }} exportName="dashboard_dept_issue"/>
      <DashboardQuickTable title="Owner summary" sub="Owner-wise activity. Use this after department summary." rows={ownerRows} empty="No owner rows." onRowClick={(r)=>onDrill?.({kind:"owner", owner:r.Owner, title:`Owner — ${r.Owner}`})} exportName="dashboard_owner_summary"/>
      <DashboardQuickTable title="Quality / R/A/M" sub="Reject, alter, missing and loss reading." rows={qualityRows.map(({stage,...r})=>r)} empty="No quality/loss rows." onRowClick={()=>onDrill?.({kind:"quality_loss", title:"Quality / Loss"})} exportName="dashboard_quality"/>
      <DashboardQuickTable title="Party / outsource" sub="Outsource pending by party/process." rows={partyRows.map(({stage,...r})=>r)} empty="No party pending rows." onRowClick={()=>onDrill?.({kind:"party_pending", title:"Party / Outsource"})} exportName="dashboard_party"/>
      <DashboardQuickTable title="Reconcile blockers" sub="Only impossible/blocked movements. True manager task." rows={reconciliationRows.map(({stage,type,...r})=>r)} empty="No reconciliation blockers." onRowClick={(r)=>{ const match = reconciliationRows.find(x=>x.Dept===r.Dept && x.Reconcile_Type===r.Reconcile_Type); onDrill?.({kind:"dept_issue", stage:match?.stage, type:"reconcile", title:`Reconciliation — ${r.Dept}`}); }} exportName="dashboard_reconcile"/>
      <DashboardQuickTable title="Production meeting focus" sub="Exception list for meeting. Not normal WIP aging." rows={meetingRows} empty="No meeting focus rows." onRowClick={()=>onDrill?.({kind:"meeting_focus", title:"Production Meeting Focus"})} exportName="dashboard_meeting_focus"/>
    </>}
  </>;
}

function DashboardDrillDrawer({ drill, rows, ledger=[], onClose }){
  if (!drill) return null;
  const rawRows = useMemo(()=>dashboardDrillRows(rows, ledger, drill), [rows, ledger, drill]);
  const [search,setSearch] = useState("");
  const [owner,setOwner] = useState("all");
  const [dept,setDept] = useState("all");
  const [status,setStatus] = useState("all");
  const [sort,setSort] = useState({ key:"", dir:"asc" });

  const columns = useMemo(()=> rawRows[0] ? Object.keys(rawRows[0]) : ["Note"], [rawRows]);
  const ownerOptions = useMemo(()=>["all", ...uniqueList(rawRows.map(r=>r.Owner).filter(Boolean))], [rawRows]);
  const deptOptions = useMemo(()=>["all", ...uniqueList(rawRows.map(r=>r.Dept || r.Stage).filter(Boolean))], [rawRows]);
  const statusOptions = useMemo(()=>["all", ...uniqueList(rawRows.map(r=>r.Status || r.Issue || r.Type).filter(Boolean))], [rawRows]);

  useEffect(()=>{
    setSearch(""); setOwner("all"); setDept("all"); setStatus("all"); setSort({ key:"", dir:"asc" });
  }, [drill]);

  const filteredRows = useMemo(()=>{
    const q = search.trim().toLowerCase();
    let list = rawRows.filter(r=>{
      const ownerOk = owner === "all" || String(r.Owner || "") === owner;
      const deptValue = String(r.Dept || r.Stage || "");
      const deptOk = dept === "all" || deptValue === dept;
      const statusValue = String(r.Status || r.Issue || r.Type || "");
      const statusOk = status === "all" || statusValue === status;
      const textOk = !q || Object.values(r).join(" ").toLowerCase().includes(q);
      return ownerOk && deptOk && statusOk && textOk;
    });
    if (sort.key) {
      list = [...list].sort((a,b)=>{
        const av = a[sort.key];
        const bv = b[sort.key];
        const an = Number(String(av ?? "").replace(/,/g,""));
        const bn = Number(String(bv ?? "").replace(/,/g,""));
        let cmp;
        const avText = String(av ?? "");
        const bvText = String(bv ?? "");
        if (!Number.isNaN(an) && !Number.isNaN(bn) && avText.trim() !== "" && bvText.trim() !== "") cmp = an - bn;
        else cmp = avText.localeCompare(bvText, undefined, { numeric:true, sensitivity:"base" });
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rawRows, search, owner, dept, status, sort]);

  const totalQty = filteredRows.reduce((a,r)=>a+n(r.Total_Open ?? r.Open_Qty ?? r.Open ?? r.Gap ?? r.Total ?? r.Qty),0);
  const displayRows = simplifiedRowsForTable(drill.title || "Dashboard Drilldown", filteredRows);
  const displayColumns = displayRows[0] ? Object.keys(displayRows[0]) : columns;
  const sortBy = (key) => setSort(s => s.key === key ? { key, dir:s.dir === "asc" ? "desc" : "asc" } : { key, dir:"asc" });
  const clearFilters = () => { setSearch(""); setOwner("all"); setDept("all"); setStatus("all"); setSort({ key:"", dir:"asc" }); };
  const sortMark = (key) => sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return <div className="mt-drawer">
    <div className="mt-drawer-head"><div><h2 style={{margin:"0 0 4px"}}>{drill.title || "Dashboard Drilldown"}</h2><div className="mt-sub">Readable rows first. Full technical detail remains available below/export.</div></div><button className="mt-btn" onClick={onClose}><X size={15}/>Close</button></div>
    <div className="mt-drawer-body">
      <div className="mt-drill-head"><div><h3 className="mt-panel-title">Drilldown</h3><div className="mt-panel-sub">Rows: {filteredRows.length} / {rawRows.length}. Relevant qty: {fmt(totalQty)}.</div><div className="mt-drill-meta"><span className="mt-chip mt-info">Readable summary</span><span className="mt-chip mt-muted">Filtered</span><span className="mt-chip mt-muted">Sortable</span><span className="mt-chip mt-muted">Full detail below</span></div></div></div>
      <div className="mt-toolbar" style={{margin:"0 0 10px"}}>
        <span className="mt-toolbar-label">Drill filters</span>
        <input className="mt-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drill rows..." style={{minWidth:220}} />
        <select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All depts/stages</option>{deptOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select className="mt-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All status/issues</option>{statusOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select className="mt-select" value={owner} onChange={e=>setOwner(e.target.value)}><option value="all">All owners</option>{ownerOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <button className="mt-btn" onClick={clearFilters}>Clear</button>
      </div>
      {drillSummaryRows(filteredRows).length > 1 && <div style={{marginBottom:10}}><SimpleTable title="Quick subtotal" sub="Dept / owner / buyer subtotal before row detail." rows={drillSummaryRows(filteredRows)} empty="No subtotal rows." /></div>}
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{displayColumns.map(c=><th key={c} className="mt-clickable-cell" onClick={()=>sortBy(c)} title="Click to sort">{friendlyTableHeader(c)}{sortMark(c)}</th>)}</tr></thead><tbody>{displayRows.length ? displayRows.map((r,i)=><tr key={i}>{displayColumns.map(c=>{ const val = r[c]; return <td key={c} className={simpleTableCellTone(c,val)}>{typeof val === "number" ? fmt(val) : String(val === undefined || val === null ? "" : val)}</td>; })}</tr>) : <tr><td style={{padding:18}} colSpan={Math.max(1,displayColumns.length)}>No rows for this drilldown/filter.</td></tr>}</tbody></table></div>
      <details className="mt-fold"><summary>Open full technical detail</summary><div className="mt-table-wrap"><table className="mt-table"><thead><tr>{columns.map(c=><th key={c} className="mt-clickable-cell" onClick={()=>sortBy(c)} title="Click to sort">{friendlyTableHeader(c)}{sortMark(c)}</th>)}</tr></thead><tbody>{filteredRows.length ? filteredRows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] === undefined || r[c] === null ? "" : r[c])}</td>)}</tr>) : <tr><td style={{padding:18}} colSpan={columns.length}>No rows for this drilldown/filter.</td></tr>}</tbody></table></div></details>
    </div>
  </div>;
}

function WipStatus({ rows, ledger=[], onOpen, onEntry, onRelease, clearTick=0 }){
  const [localSearch,setLocalSearch] = useState(()=>safeJsonLoad(uiStorageKey("wip_search"), ""));
  const [dept,setDept] = useState(()=>safeJsonLoad(uiStorageKey("wip_dept"), "all"));
  const [issue,setIssue] = useState(()=>safeJsonLoad(uiStorageKey("wip_issue"), "all"));
  const [readyTarget,setReadyTarget] = useState(()=>safeJsonLoad(uiStorageKey("wip_ready_target"), "all"));
  const [owner,setOwner] = useState(()=>safeJsonLoad(uiStorageKey("wip_owner"), "all"));
  const [route,setRoute] = useState(()=>safeJsonLoad(uiStorageKey("wip_route"), "all"));
  const [viewMode,setViewMode] = useState(()=>safeJsonLoad(uiStorageKey("wip_view_mode"), "matrix"));
  const [columnFilters,setColumnFilters] = useState(()=>safeJsonLoad(uiStorageKey("wip_column_filters"), {}));
  const [colWidths,setColWidths] = useState(()=>safeJsonLoad(uiStorageKey("wip_col_widths"), {}));
  const [fitColumns,setFitColumns] = useState(()=>safeJsonLoad(uiStorageKey("wip_fit_columns"), true));
  const [freezeCols,setFreezeCols] = useState(()=>safeJsonLoad(uiStorageKey("wip_freeze_cols"), 1));
  const [widthMode,setWidthMode] = useState(()=>safeJsonLoad(uiStorageKey("wip_width_mode"), "comfort"));
  const [visibleCols,setVisibleCols] = useState(()=>({ release:true, status:true, tail:true, owner:true, route:true, stages:true, open:true, idle:false, action:true, ...safeJsonLoad(uiStorageKey("wip_visible_cols"), {}) }));
  useEffect(()=>safeJsonSave(uiStorageKey("wip_search"), localSearch), [localSearch]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_dept"), dept), [dept]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_issue"), issue), [issue]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_ready_target"), readyTarget), [readyTarget]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_owner"), owner), [owner]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_route"), route), [route]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_view_mode"), viewMode), [viewMode]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_column_filters"), columnFilters), [columnFilters]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_col_widths"), colWidths), [colWidths]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_fit_columns"), fitColumns), [fitColumns]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_freeze_cols"), freezeCols), [freezeCols]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_width_mode"), widthMode), [widthMode]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_visible_cols"), visibleCols), [visibleCols]);
  useEffect(()=>{ if (!clearTick) return; setLocalSearch(""); setDept("all"); setIssue("all"); setReadyTarget("all"); setOwner("all"); setRoute("all"); setViewMode("matrix"); setColumnFilters({}); setFreezeCols(1); setVisibleCols({ release:true, status:true, tail:true, owner:true, route:true, stages:true, open:true, idle:false, action:true }); setSort({key:"open",dir:"desc"}); }, [clearTick]);
  const [showCutActivity,setShowCutActivity] = useState(false);
  const [sizeBreak,setSizeBreak] = useState(false);
  const [sort,setSort] = useState({ key:"open", dir:"desc" });
  const owners = ["all", ...uniqueList(rows.flatMap(rowOwnerNames))];
  const searchText = localSearch.trim().toLowerCase();
  const filtered = rows.filter(row=>{
    const routeOk = route === "all" || routeType(row) === route;
    const deptOk = dept === "all" || routeFor(row).includes(dept);
    const issueOk = rowMatchesBucketFilter(row, issue) && (issue !== "completed_not_issued" || rowReadyForTargetDept(row, readyTarget));
    const ownerOk = owner === "all" || rowOwnerNames(row).includes(owner);
    const text = [row.order_no,row.style_no,row.buyer,row.colour,row.component,statusText(row),rowStatus(row).owner,routeType(row)].join(" ").toLowerCase();
    const searchOk = !searchText || text.includes(searchText);
    const columnOk = viewMode !== "matrix" || wipMatchesGridColumnFilters(row, columnFilters);
    return routeOk && deptOk && issueOk && ownerOk && searchOk && columnOk;
  }).sort((a,b)=>{
    const av = compareValue(a, sort.key), bv = compareValue(b, sort.key);
    const res = typeof av === "number" || typeof bv === "number" ? n(av)-n(bv) : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? res : -res;
  });
  const conservationAlerts = conservationViolationRows(rows);
  const p0AuditIssues = p0StockAuditIssues(rows, ledger);
  const allBuckets = rows.flatMap(row=>issueBuckets(row).map(bucket=>({row,bucket}))).filter(x=>x.bucket.type!=="extra_cut");
  const summary = [
    { key:"all", label:"All", value:rows.length, note:"visible styles" },
    { key:"completed_not_issued", label:"Ready for Next Dept", value:allBuckets.filter(x=>x.bucket.type==="completed_not_issued").reduce((a,x)=>a+n(x.bucket.qty),0), note:"completed not issued" },
    { key:"received_not_processed", label:"With Department", value:allBuckets.filter(x=>x.bucket.type==="received_not_processed").reduce((a,x)=>a+n(x.bucket.qty),0), note:"work not completed" },
    { key:"tail_balance", label:"Tail Status", value:rows.reduce((a,row)=>a+tailStatusParts(row).reduce((x,p)=>x+n(p.qty),0),0), note:"separate closure tail" },
    { key:"reconcile", label:"Reconcile", value:allBuckets.filter(x=>x.bucket.type==="reconcile").reduce((a,x)=>a+n(x.bucket.qty),0), note:"total jump / mismatch" },
  ];
  const selectedDeptForSize = dept === "all" ? null : dept;
  const hasGridColumnFilters = hasWipColumnFilters(columnFilters);
  const setGridColumnFilter = (key, value) => setColumnFilters(prev => ({ ...(prev || {}), [key]:value }));
  const toggleWipCol = (key) => setVisibleCols(prev => ({ ...(prev || {}), [key]: !prev?.[key] }));
  const resetWipCols = () => setVisibleCols({ release:true, status:true, tail:true, owner:true, route:true, stages:true, open:true, idle:false, action:true });
  const clearWipFilters = () => { setLocalSearch(""); setDept("all"); setIssue("all"); setReadyTarget("all"); setOwner("all"); setRoute("all"); setColumnFilters({}); setSort({key:"open",dir:"desc"}); };
  const controlRows = wipControlRows(filtered);
  const openRowDrill = (row, stage) => onOpen?.(row, stage || rowStatus(row).stage || routeFor(row)[0] || "cutting");
  const modeRows = viewMode === "order" ? wipOrderViewRows(filtered) : viewMode === "department" ? departmentCurrentRows(filtered).map(({stage,...r})=>r) : viewMode === "issue" ? departmentIssueRows(filtered).map(({stage,type,...r})=>r) : [];
  const currentWipExportRows = () => viewMode === "order" || viewMode === "department" || viewMode === "issue" ? modeRows : filtered.map(row=>{
    const rs = rowStatus(row);
    return { Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, File_Released_Qty:fileReleaseQty(row), File_Released_Date:fileReleaseDate(row), Current_Status:statusText(row), Current_Summary:rs.status, Current_Dept:stageLabel(rs.stage), Open_Qty:rs.qty, Idle_Days:rs.idle, Owner:rs.owner, Route:routeFor(row).map(stageLabel).join(" > "), Next_Action:rs.action };
  });
  const stageWipExportRows = () => {
    const allSizes = allReportSizes(filtered);
    const stages = dept === "all" ? STAGES.map(s=>s.key) : [dept];
    return filtered.flatMap(row => stages.filter(stage=>routeFor(row).includes(stage)).map(stage=>horizontalStageRow(row, stage, allSizes)));
  };
  function exportCurrentWip(){ exportXlsx(`production_wip_${viewMode}_${today()}.xlsx`, [{ name:`WIP ${viewMode}`, rows:currentWipExportRows() }]); }
  function exportStageWip(){ exportXlsx(`production_wip_stage_detail_${dept}_${today()}.xlsx`, [{ name:"Style Stage Detail", rows:stageWipExportRows() }]); }
  const matrixColumnCount = 1 + (visibleCols.release?1:0) + (visibleCols.status?1:0) + (visibleCols.tail?1:0) + (showCutActivity?1:0) + (visibleCols.owner?1:0) + (visibleCols.route?1:0) + (visibleCols.stages?STAGES.length:0) + (visibleCols.open?1:0) + (visibleCols.idle?1:0) + (visibleCols.action?1:0);
  const controlColumnCount = showCutActivity ? 9 : 8;
  const widthProfiles = { compact:{ style:260, release:170, status:190, tail:150, routeProgress:190, owner:150, route:140, next:180 }, comfort:{ style:320, release:205, status:230, tail:170, routeProgress:230, owner:190, route:170, next:220 }, wide:{ style:400, release:245, status:280, tail:210, routeProgress:280, owner:230, route:210, next:280 } };
  const baseColWidth = (key) => (widthProfiles[widthMode] || widthProfiles.comfort)[key] || (widthMode === "wide" ? 162 : widthMode === "compact" ? 108 : 132);
  const colWidth = (key) => Math.max(76, n(colWidths?.[key]) || baseColWidth(key));
  const colStyle = (key, extra={}) => ({ minWidth:`${colWidth(key)}px`, width:`${colWidth(key)}px`, ...extra });
  const buildStickyMap = (cols) => { let left=0, count=0, map={}; cols.filter(c=>c.visible).forEach(c=>{ if (count < n(freezeCols)) { const width=colWidth(c.key); map[c.key]={ className:"mt-sticky-col", style:{ "--sticky-left":`${left}px`, "--sticky-width":`${width}px`, left:`${left}px`, minWidth:`${width}px`, width:`${width}px` } }; left += width; count += 1; } }); return map; };
  function startResize(key, e){
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX; const startW = colWidth(key);
    const move = (ev)=> setColWidths(prev=>({ ...(prev||{}), [key]:Math.max(76, Math.round(startW + ev.clientX - startX)) }));
    const up = ()=>{ window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  }
  function resizeGrip(key){ return <span className="mt-resize-grip" onMouseDown={(e)=>startResize(key,e)} title="Drag to resize column"/>; }
  function RTh({ k, children, className="", style=null }){ return <th className={`${className||""} mt-resize-th`} style={{ ...(style||{}), ...colStyle(k, style||{}) }}>{children}{resizeGrip(k)}</th>; }
  function RSortTh({ label, sortKey, className="", style=null }){ const active=sort.key===sortKey; const dir=active && sort.dir==="asc"?"▲":active?"▼":""; return <RTh k={sortKey} className={`${className||""} mt-sort-th`} style={style} ><span onClick={()=>setSort(s=>s.key===sortKey?{key:sortKey,dir:s.dir==="asc"?"desc":"asc"}:{key:sortKey,dir:"asc"})}>{label} {dir}</span></RTh>; }
  function excelMultiValue(arr){ const picks=(arr||[]).filter(Boolean); return picks.length ? `multi::${picks.join("||")}` : ""; }
  function ExcelFilter({ label, value, onChange, options }){
    const picks = String(value||"").startsWith("multi::") ? String(value).slice(7).split("||").filter(Boolean) : (String(value||"").trim() ? [String(value).trim()] : []);
    const [q,setQ]=useState("");
    const [open,setOpen]=useState(false);
    const [pos,setPos]=useState({ top:0, left:0, width:286 });
    const btnRef=useRef(null);
    const popRef=useRef(null);
    const allOptions=(options||[]).filter(o=>o && o.value !== undefined && o.value !== null);
    const shown=allOptions.filter(o=>String(o.label||o.value).toLowerCase().includes(q.toLowerCase()));
    const shownValues=shown.map(o=>String(o.value));
    const toggle=(val)=>{ const set=new Set(picks); set.has(val)?set.delete(val):set.add(val); onChange(excelMultiValue(Array.from(set))); };
    const setAll=()=>onChange(excelMultiValue(allOptions.map(o=>String(o.value))));
    const clear=()=>onChange("");
    const addShown=()=>{ const set=new Set(picks); shownValues.forEach(v=>set.add(v)); onChange(excelMultiValue(Array.from(set))); };
    const removeShown=()=>{ const set=new Set(picks); shownValues.forEach(v=>set.delete(v)); onChange(excelMultiValue(Array.from(set))); };
    const only=(val)=>onChange(excelMultiValue([String(val)]));
    const openMenu=(e)=>{
      e.preventDefault(); e.stopPropagation();
      const r=btnRef.current?.getBoundingClientRect?.();
      const width=Math.min(330, Math.max(286, r?.width || 286));
      const left=Math.min(Math.max(8, (r?.left || 8)), Math.max(8, window.innerWidth - width - 8));
      const top=Math.min((r?.bottom || 0) + 5, Math.max(8, window.innerHeight - 440));
      setPos({ top, left, width });
      setOpen(v=>!v);
    };
    useEffect(()=>{
      if(!open) return undefined;
      const close=(ev)=>{ if(btnRef.current?.contains(ev.target) || popRef.current?.contains(ev.target)) return; setOpen(false); };
      const key=(ev)=>{ if(ev.key === "Escape") setOpen(false); };
      const reposition=()=>{ const r=btnRef.current?.getBoundingClientRect?.(); if(!r) return; const width=Math.min(330, Math.max(286, r.width || 286)); setPos({ top:Math.min(r.bottom + 5, Math.max(8, window.innerHeight - 440)), left:Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8)), width }); };
      document.addEventListener("mousedown", close, true);
      document.addEventListener("keydown", key, true);
      window.addEventListener("scroll", reposition, true);
      window.addEventListener("resize", reposition);
      return ()=>{ document.removeEventListener("mousedown", close, true); document.removeEventListener("keydown", key, true); window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
    }, [open]);
    const title = picks.length ? `${picks.length}/${allOptions.length || picks.length} selected` : label;
    return <div className="mt-excel-filter-menu"><button ref={btnRef} type="button" className={`mt-excel-filter-button ${open || picks.length ? "active" : ""}`} onClick={openMenu}><span className="filter-title">{title}</span><span className="filter-caret">▾</span></button>{open && <div ref={popRef} className="mt-excel-filter-pop mt-excel-filter-pop-fixed" style={{ top:pos.top, left:pos.left, width:pos.width }}><div className="mt-excel-filter-head"><b>Column filter</b><span className="mt-small">{picks.length || 0} of {allOptions.length}</span><button type="button" className="mt-excel-filter-close" onClick={()=>setOpen(false)}>×</button></div><input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="type to filter values..." autoFocus/><div className="mt-excel-filter-actions"><button type="button" className="dark" onClick={setAll}>All / clear</button><button type="button" onClick={clear}>Clear filter</button><button type="button" onClick={addShown}>Add matches</button><button type="button" onClick={removeShown}>Uncheck matches</button></div><div className="mt-excel-filter-options">{shown.length ? shown.map(o=><label key={o.value}><input type="checkbox" checked={picks.includes(String(o.value))} onChange={()=>toggle(String(o.value))}/><span className="option-label">{o.label}</span><button className="mt-excel-filter-only" type="button" onClick={(e)=>{e.preventDefault(); e.stopPropagation(); only(o.value);}}>only</button>{o.count!=null?<span className="mt-excel-filter-count">{o.count}</span>:null}</label>) : <div className="mt-small" style={{padding:12}}>No matching values.</div>}</div><div className="mt-excel-filter-footer"><button type="button" onClick={clear}>Clear</button><button type="button" className="primary" onClick={()=>setOpen(false)}>Done</button></div></div>}</div>;
  }
  const stickyClass = (map,key,base="") => `${base ? `${base} ` : ""}${map[key]?.className || ""}`.trim();
  const stickyStyle = (map,key) => map[key]?.style || undefined;
  const matrixSticky = buildStickyMap([{key:"style",visible:true},{key:"release",visible:!!visibleCols.release},{key:"status",visible:!!visibleCols.status},{key:"tail",visible:!!visibleCols.tail},{key:"routeProgress",visible:!!showCutActivity},{key:"owner",visible:!!visibleCols.owner},{key:"route",visible:!!visibleCols.route}]);
  const controlSticky = buildStickyMap([{key:"style",visible:true},{key:"status",visible:true},{key:"next",visible:true},{key:"routeProgress",visible:!!showCutActivity}]);
  return <div className="mt-card">
    <div className="mt-section"><h3 className="mt-panel-title">Live WIP Status — Grid / Open Control</h3><div className="mt-panel-sub">Pending Stage = one main action. P0 stock audit checks every dated ledger movement: previous feed, same-dept output, future clashes and saved reconcile overrides.</div>{p0AuditIssues.length ? <details className="mt-p0-audit-panel" open><summary><span><AlertTriangle size={14}/> P0 stock/date reconcile issues — {p0AuditIssues.length}</span><span className="mt-chip mt-late">Collapsible</span></summary><div className="mt-p0-audit-body"><div className="mt-small">These are not normal open balances. They can affect stock/WIP truth and are also listed under Review → Reconcile for editable correction. Cutting short is not listed here; it remains cutting pending.</div><SimpleTable title="P0 stock/date issue list" sub="Dated quantity audit across all departments. Click row to open that style/stage detail." rows={p0AuditTableRows(p0AuditIssues).slice(0,80)} empty="No P0 stock/date issues." onRowClick={(r)=>{ const issue = p0AuditIssues.find(x=>String(x.row?.order_no||"")===String(r.Order||"") && String(x.row?.style_no||"")===String(r.Style||"") && String(x.row?.colour||"")===String(r.Colour||"") && String(x.row?.component||"")===String(r.Component||"") && stageLabel(x.stage)===String(r.Dept||"")); if (issue) openRowDrill(issue.row, issue.stage); }} /></div></details> : <span className="mt-chip mt-ok">P0 stock/date audit OK</span>} {conservationAlerts.length ? <details className="mt-p0-audit-panel"><summary><span><AlertTriangle size={14}/> Conservation snapshot warning — {conservationAlerts.length}</span><span className="mt-chip mt-warn">Open details</span></summary><div className="mt-p0-audit-body"><SimpleTable title="WIP correction issue list" sub="Snapshot feed/output mismatches. These also flow to Review → Reconcile so they can be edited/corrected from one control room." rows={conservationIssueTableRows(conservationAlerts)} empty="No conservation issues." onRowClick={(r)=>{ const alert = conservationAlerts.find(a=>String(a.row?.order_no||"")===String(r.Order||"") && String(a.row?.style_no||"")===String(r.Style||"") && String(a.row?.colour||"")===String(r.Colour||"") && String(a.row?.component||"")===String(r.Component||"") && stageLabel(a.stage)===String(r.Stage||"")); if (alert) openRowDrill(alert.row, alert.stage); }} /></div></details> : <span className="mt-chip mt-ok">Conservation OK: Good + Open + R/A/M balances against feed</span>}</div>
    <div className="mt-section no-print">
      <div className="mt-summary-strip">{summary.map(s=><button key={s.key} className={`mt-summary-tile ${issue===s.key || (s.key==="all"&&issue==="all") ? "active" : ""}`} onClick={()=>setIssue(s.key)}><div className="label">{s.label}</div><div className="value">{typeof s.value === "number" && s.key!=="all" ? fmt(s.value) : s.value}</div><div className="mt-small">{s.note}</div></button>)}</div>
      <div className="mt-filter-row">
        <div className="mt-filter-group"><span className="mt-toolbar-label">WIP Search</span><Search size={14}/><input className="mt-input" value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="order / style / buyer / status / owner" style={{minWidth:230}}/></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Issue</span><select className="mt-select" value={issue} onChange={e=>setIssue(e.target.value)}><option value="all">All open/closed</option><option value="completed_not_issued">Ready for next dept</option><option value="received_not_processed">With department</option><option value="ram">R/A/M</option><option value="reconcile">Reconcile</option><option value="dispatch_hold">Dispatch Hold</option><option value="tail_balance">Tail Status</option><option value="closed">Closed / balanced</option></select></div>{issue === "completed_not_issued" && <div className="mt-filter-group"><span className="mt-toolbar-label">Ready to</span><select className="mt-select" value={readyTarget} onChange={e=>setReadyTarget(e.target.value)}><option value="all">Any next dept</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>}
        <div className="mt-filter-group"><span className="mt-toolbar-label">Owner</span><select className="mt-select" value={owner} onChange={e=>setOwner(e.target.value)}>{owners.map(o=><option key={o} value={o}>{o === "all" ? "All owners" : o}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Route</span><select className="mt-select" value={route} onChange={e=>setRoute(e.target.value)}><option value="all">All routes</option><option>Plain</option><option>Print</option><option>Embroidery</option><option>Print + Emb</option></select></div>
        <button className={`mt-btn ${sizeBreak?"primary":"ghost"}`} onClick={()=>setSizeBreak(v=>!v)}><Layers size={14}/>Size breakup</button>
        <button className={`mt-btn ${hasGridColumnFilters ? "primary" : "ghost"}`} onClick={clearWipFilters}>Clear WIP Filters</button>
        <span className="mt-page-filter-note">{filtered.length} rows · {controlRows.length} open/control rows</span>
      </div>
      <div className="mt-view-mode-bar mt-wip-sticky-tools"><span className="mt-toolbar-label">Sheet View</span>{[["matrix","Grid View"],["control","Open Control"],["order","Order View"],["department","Department View"],["issue","Issue View"]].map(([k,l])=><button key={k} className={`mt-btn ${viewMode===k?"active":"ghost"}`} onClick={()=>setViewMode(k)}>{l}</button>)}<button className={`mt-btn ${showCutActivity?"active":"ghost"}`} onClick={()=>setShowCutActivity(v=>!v)}>{showCutActivity ? "Hide Route Progress" : "Show Route Progress"}</button><button className={`mt-btn ${fitColumns?"active":"ghost"}`} onClick={()=>setFitColumns(v=>!v)} title="Fit visible columns into screen like the Merch Tracker grid">{fitColumns ? "Fit columns: on" : "Fit columns: off"}</button><span className="mt-toolbar-label">Width</span><select className="mt-select" value={widthMode} onChange={e=>setWidthMode(e.target.value)} title="Readable column width preset"><option value="compact">Compact</option><option value="comfort">Comfort</option><option value="wide">Wide</option></select><span className="mt-toolbar-label">Freeze</span><select className="mt-select" value={freezeCols} onChange={e=>setFreezeCols(Number(e.target.value))} title="Freeze first N visible columns"><option value={0}>No freeze</option><option value={1}>1 column</option><option value={2}>2 columns</option><option value={3}>3 columns</option><option value={4}>4 columns</option><option value={5}>5 columns</option></select><details className="mt-column-menu"><summary>Columns</summary><div>{[["release","File Release"],["status","Current Status"],["tail","Tail Status"],["owner","Owner"],["route","Route"],["stages","Stage cells"],["open","Open Qty"],["idle","Idle"],["action","Next Action"]].map(([k,l])=><label key={k} className="mt-column-choice"><input type="checkbox" checked={!!visibleCols[k]} onChange={()=>toggleWipCol(k)} />{l}</label>)}<button className="mt-btn ghost" style={{marginTop:6}} onClick={resetWipCols}>Reset columns</button></div></details>{currentUserCan("production.export") && <button className="mt-btn primary" onClick={exportCurrentWip}><Download size={14}/>Export Current View</button>}{currentUserCan("production.export") && <button className="mt-btn" onClick={exportStageWip}><Download size={14}/>Export Style Stage Detail</button>}<span className="mt-chip mt-wip-polish-note">Merch-style filters: fixed popup, search, only, select-all, column resize</span></div>
    </div>
    {viewMode === "order" || viewMode === "department" || viewMode === "issue" ? <SimpleTable title={viewMode==="order"?"Order-wise WIP summary":viewMode==="department"?"Department open summary":"Issue-wise open summary"} sub="Summary view first. Click Full Matrix or drill dashboards only when style-level detail is needed." rows={modeRows} empty="No rows in this view." /> : viewMode === "control" ? <div className={`mt-table-wrap mt-wip-table-wrap mt-wip-resizable mt-wip-${widthMode} ${fitColumns?"mt-wip-fit-table":""} ${freezeCols>0?"freeze-active":""}`}><table className="mt-table mt-compact-wip-table"><thead><tr><th className={stickyClass(controlSticky,"style")} style={stickyStyle(controlSticky,"style")}>Open Style / Order</th><th className={stickyClass(controlSticky,"status")} style={stickyStyle(controlSticky,"status")}>Current Status / Entry</th><th>File Release</th><th className={stickyClass(controlSticky,"next")} style={stickyStyle(controlSticky,"next")}>Next Action</th>{showCutActivity && <th className={stickyClass(controlSticky,"routeProgress")} style={stickyStyle(controlSticky,"routeProgress")}>Route Progress / Balance</th>}<th>Open Qty</th><th>R/A/M</th><th>Idle</th><th>Owner</th></tr></thead><tbody>{controlRows.length ? controlRows.map(({row,status})=>{ const stage=status.stage || routeFor(row)[0] || "cutting"; const st=sdata(row,stage); const c=cellBreakup(row,stage); return <React.Fragment key={row.id}><tr className="drillable" onClick={()=>openRowDrill(row,stage)}><td className={stickyClass(controlSticky,"style")} style={stickyStyle(controlSticky,"style")}><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{row.set_id ? (()=>{ const si=setPackInfo(row, rows); return <span className="mt-chip mt-purple" title="Set can only ship min(components)"><Layers size={11}/>Set {row.set_id}{si ? ` · pack ${fmt(si.cap)}${si.unmatched>0?` · ${fmt(si.unmatched)} unmatched`:""}` : ""}</span>; })() : null}</div></div></td><td className={stickyClass(controlSticky,"status")} style={stickyStyle(controlSticky,"status")}><PrimaryPendingStage row={row} onOpen={(st)=>openRowDrill(row,st)} onEntry={onEntry}/></td><td><FileReleaseStatusCell row={row} onRelease={onRelease}/></td><td className={stickyClass(controlSticky,"next")} style={stickyStyle(controlSticky,"next")}><div className="mt-small">{status.action}</div></td>{showCutActivity && <td className={stickyClass(controlSticky,"routeProgress")} style={stickyStyle(controlSticky,"routeProgress")}><RouteProgressSnapshot row={row} compact={true} onOpen={(st)=>openRowDrill(row,st)}/></td>}<td><div className="mt-open-big">{fmt(status.qty)}</div><div className="mt-small">{c.note}</div></td><td>{fmt(c.ram)}</td><td>{status.idle}d</td><td><b>{status.owner}</b>{status.support ? <div className="mt-small">Support: {status.support}</div> : null}</td></tr>{sizeBreak && <tr className="mt-subrow"><td colSpan={controlColumnCount}><SizeBreakupStrip row={row} stage={selectedDeptForSize || stage}/></td></tr>}</React.Fragment>; }) : <tr><td colSpan={controlColumnCount} style={{padding:18}}>No open/control rows in the current WIP filters.</td></tr>}</tbody></table></div> : <div className={`mt-table-wrap mt-wip-table-wrap mt-wip-resizable mt-wip-${widthMode} ${fitColumns?"mt-wip-fit-table":""} ${freezeCols>0?"freeze-active":""}`}><table className="mt-table"><thead><tr><RSortTh label="Style" sortKey="style" className={stickyClass(matrixSticky,"style")} style={stickyStyle(matrixSticky,"style")}/>{visibleCols.release && <RTh k="release" className={stickyClass(matrixSticky,"release")} style={stickyStyle(matrixSticky,"release")}>File Release</RTh>}{visibleCols.status && <RSortTh label="Current Status / Entry" sortKey="status" className={stickyClass(matrixSticky,"status")} style={stickyStyle(matrixSticky,"status")}/>} {visibleCols.tail && <RTh k="tail" className={stickyClass(matrixSticky,"tail")} style={stickyStyle(matrixSticky,"tail")}>Tail Status</RTh>} {showCutActivity && <RTh k="routeProgress" className={stickyClass(matrixSticky,"routeProgress")} style={stickyStyle(matrixSticky,"routeProgress")}>Route Progress / Balance</RTh>} {visibleCols.owner && <RSortTh label="Owner" sortKey="owner" className={stickyClass(matrixSticky,"owner")} style={stickyStyle(matrixSticky,"owner")}/>}  {visibleCols.route && <RSortTh label="Route" sortKey="route" className={stickyClass(matrixSticky,"route")} style={stickyStyle(matrixSticky,"route")}/>}  {visibleCols.stages && STAGES.map(stage=><RTh key={stage.key} k={`stage:${stage.key}`}>{stage.short}</RTh>)} {visibleCols.open && <RSortTh label="Open" sortKey="open"/>} {visibleCols.idle && <RSortTh label="Idle" sortKey="idle"/>} {visibleCols.action && <RTh k="action">Next Action</RTh>}</tr><tr className="mt-col-filter-row"><th className={stickyClass(matrixSticky,"style")} style={stickyStyle(matrixSticky,"style")}><input className="mt-col-filter-input" value={columnFilters.style || ""} onChange={e=>setGridColumnFilter("style", e.target.value)} placeholder="order/style/buyer/colour" /></th>{visibleCols.release && <th className={stickyClass(matrixSticky,"release")} style={stickyStyle(matrixSticky,"release")}><ExcelFilter label="All release" value={columnFilters.release || ""} onChange={v=>setGridColumnFilter("release", v)} options={[{value:"pending",label:"Pending"},{value:"released",label:"Released"},{value:"over order",label:"Over order/in tolerance"},{value:"above tolerance",label:"Above tolerance"}]} /></th>}{visibleCols.status && <th className={stickyClass(matrixSticky,"status")} style={stickyStyle(matrixSticky,"status")}><ExcelFilter label="All status" value={columnFilters.status || ""} onChange={v=>setGridColumnFilter("status", v)} options={[{value:"with",label:"With dept"},{value:"ready",label:"Ready next"},{value:"issued",label:"Issued"},{value:"reconcile",label:"Reconcile"},{value:"ram",label:"R/A/M"},{value:"closed",label:"Closed"}]} /></th>} {visibleCols.tail && <th className={stickyClass(matrixSticky,"tail")} style={stickyStyle(matrixSticky,"tail")}><ExcelFilter label="All tail" value={columnFilters.tail || ""} onChange={v=>setGridColumnFilter("tail", v)} options={[{value:"tail",label:"Has tail"},{value:"no tail",label:"No tail"},{value:"cut",label:"Cut tail"},{value:"stitch",label:"Stitch tail"},{value:"check",label:"Check tail"},{value:"pack",label:"Pack tail"}]} /></th>} {showCutActivity && <th className={stickyClass(matrixSticky,"routeProgress")} style={stickyStyle(matrixSticky,"routeProgress")}><input className="mt-col-filter-input" value={columnFilters.other || ""} onChange={e=>setGridColumnFilter("other", e.target.value)} placeholder="route progress" /></th>} {visibleCols.owner && <th className={stickyClass(matrixSticky,"owner")} style={stickyStyle(matrixSticky,"owner")}><input className="mt-col-filter-input" value={columnFilters.owner || ""} onChange={e=>setGridColumnFilter("owner", e.target.value)} placeholder="owner" /></th>} {visibleCols.route && <th className={stickyClass(matrixSticky,"route")} style={stickyStyle(matrixSticky,"route")}><input className="mt-col-filter-input" value={columnFilters.route || ""} onChange={e=>setGridColumnFilter("route", e.target.value)} placeholder="route" /></th>} {visibleCols.stages && STAGES.map(stage=><th key={`filter-${stage.key}`} style={colStyle(`stage:${stage.key}`)}><ExcelFilter label="All" value={columnFilters[`stage:${stage.key}`] || ""} onChange={v=>setGridColumnFilter(`stage:${stage.key}`, v)} options={[{value:"open",label:"Open"},{value:"ram",label:"R/A/M"},{value:"skip",label:"Skip"},{value:"over",label:"Over"},{value:"feed",label:"Feed"},{value:"good",label:"Good"}]} /></th>)} {visibleCols.open && <th style={colStyle("open")}><input className="mt-col-filter-input" value={columnFilters.open || ""} onChange={e=>setGridColumnFilter("open", e.target.value)} placeholder="qty" /></th>} {visibleCols.idle && <th style={colStyle("idle")}><input className="mt-col-filter-input" value={columnFilters.idle || ""} onChange={e=>setGridColumnFilter("idle", e.target.value)} placeholder="idle" /></th>} {visibleCols.action && <th style={colStyle("action")}><div style={{display:"flex",gap:4}}><input className="mt-col-filter-input" value={columnFilters.action || ""} onChange={e=>setGridColumnFilter("action", e.target.value)} placeholder="action" /><button className="mt-btn ghost mt-col-filter-clear" onClick={()=>setColumnFilters({})} title="Clear only grid column filters">Clear</button></div></th>}</tr></thead><tbody>
      {filtered.map(row => { const rs = rowStatus(row); const sizeStage = selectedDeptForSize || rs.stage; const openDrill = () => openRowDrill(row, rs.stage || routeFor(row)[0] || "cutting"); return <React.Fragment key={row.id}>
        <tr>
          <td className={stickyClass(matrixSticky,"style","mt-clickable-cell")} style={{...colStyle("style"), ...(stickyStyle(matrixSticky,"style")||{})}} onClick={openDrill} title="Click to open selected/current department"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{row.set_id ? (()=>{ const si=setPackInfo(row, rows); return <span className="mt-chip mt-purple" title="Set can only ship min(components)"><Layers size={11}/>Set {row.set_id}{si ? ` · pack ${fmt(si.cap)}${si.unmatched>0?` · ${fmt(si.unmatched)} unmatched`:""}` : ""}</span>; })() : null}<div className="mt-drill-hint">Open detail</div></div></div></td>
          {visibleCols.release && <td className={stickyClass(matrixSticky,"release","mt-clickable-cell")} style={{...colStyle("release"), ...(stickyStyle(matrixSticky,"release")||{})}} onClick={openDrill}><FileReleaseStatusCell row={row} onRelease={onRelease}/></td>}
          {visibleCols.status && <td className={stickyClass(matrixSticky,"status","mt-clickable-cell")} style={{...colStyle("status"), ...(stickyStyle(matrixSticky,"status")||{})}} onClick={openDrill}><PrimaryPendingStage row={row} onOpen={(stage)=>onOpen?.(row, stage)} onEntry={onEntry} onRelease={onRelease}/><div className="mt-small">Idle {rs.idle}d</div></td>}
          {visibleCols.tail && <td className={stickyClass(matrixSticky,"tail","mt-clickable-cell")} style={{...colStyle("tail"), ...(stickyStyle(matrixSticky,"tail")||{})}} onClick={openDrill}><TailStatusCell row={row} compact={true} onOpen={(stage)=>onOpen?.(row, stage)}/></td>}
          {showCutActivity && <td className={stickyClass(matrixSticky,"routeProgress")} style={{...colStyle("routeProgress"), ...(stickyStyle(matrixSticky,"routeProgress")||{})}}><RouteProgressSnapshot row={row} compact={true} onOpen={(stage)=>onOpen?.(row, stage)}/></td>}
          {visibleCols.owner && <td className={stickyClass(matrixSticky,"owner","mt-clickable-cell")} style={{...colStyle("owner"), ...(stickyStyle(matrixSticky,"owner")||{})}} onClick={openDrill}><b>{rs.owner}</b>{rs.support ? <div className="mt-small">Support: {rs.support}</div> : null}</td>}
          {visibleCols.route && <td className={stickyClass(matrixSticky,"route","mt-clickable-cell")} style={{...colStyle("route"), ...(stickyStyle(matrixSticky,"route")||{})}} onClick={openDrill}><span className="mt-chip mt-info">{routeType(row)}</span><div style={{marginTop:4}}>{routeFor(row).map(k=><span key={k} className="mt-chip mt-muted" style={{margin:"0 3px 3px 0"}}>{STAGE_BY_KEY[k].short}</span>)}</div></td>}
          {visibleCols.stages && STAGES.map(s=><StageCell key={s.key} row={row} stageKey={s.key} onOpen={onOpen} style={colStyle(`stage:${s.key}`)} issueFocus={issue}/>) }
          {visibleCols.open && <td className="mt-clickable-cell" style={colStyle("open")} onClick={openDrill}><b>{fmt(rs.qty)}</b></td>}{visibleCols.idle && <td className="mt-clickable-cell" style={colStyle("idle")} onClick={openDrill}>{rs.idle}d</td>}{visibleCols.action && <td className="mt-clickable-cell" style={colStyle("action")} onClick={openDrill}>{!isProductionFileReleased(row) ? <button className="mt-btn primary" onClick={(e)=>{e.stopPropagation(); onRelease?.(row, "wip_matrix_action");}}>Release File</button> : rs.action}</td>}
        </tr>
        {sizeBreak && <tr className="mt-subrow"><td colSpan={matrixColumnCount}><SizeBreakupStrip row={row} stage={sizeStage}/></td></tr>}
      </React.Fragment>;})}
      {!filtered.length && <tr><td colSpan={matrixColumnCount} style={{padding:18}}>No rows match current WIP filters.</td></tr>}
    </tbody></table></div>}
    <div className="mt-section"><span className="mt-chip mt-ok">Current Status = clickable DPR entry context</span> <span className="mt-chip mt-info">Route Progress / Balance = toggleable</span> <span className="mt-chip mt-warn">Click any row/cell for selected department only</span></div>
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
  const [selectedOwner, setSelectedOwner] = useState(()=>safeJsonLoad(uiStorageKey("chase_selected_owner"), null));
  const [q, setQ] = useState(()=>safeJsonLoad(uiStorageKey("chase_q"), ""));
  const [issue, setIssue] = useState(()=>safeJsonLoad(uiStorageKey("chase_issue"), "all"));
  const [dept, setDept] = useState(()=>safeJsonLoad(uiStorageKey("chase_dept"), "all"));
  useEffect(()=>safeJsonSave(uiStorageKey("chase_selected_owner"), selectedOwner), [selectedOwner]);
  useEffect(()=>safeJsonSave(uiStorageKey("chase_q"), q), [q]);
  useEffect(()=>safeJsonSave(uiStorageKey("chase_issue"), issue), [issue]);
  useEffect(()=>safeJsonSave(uiStorageKey("chase_dept"), dept), [dept]);
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
            
            <option value="completed_not_issued">Ready / Not Issued</option>
            <option value="received_not_processed">With Department</option>
            <option value="ram">Reject / Alter / Missing</option>
            <option value="reconcile">Reconcile</option>
            <option value="dispatch_hold">Dispatch Hold</option>
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

function stageTotalsAfterEdit(row, stage, field, newTotal, ledger=null, asOfDate=null){
  const st = { ...sdata(row, stage), [field]:n(newTotal) };
  const ram = loss(st);
  const backdated = ledger && asOfDate && asOfDate < today();
  const feed = stage === "cutting" ? n(row.order_qty) : (backdated ? asOfFeed(row, ledger, stage, asOfDate) : stageFeed(row, stage));
  const receiveAccounted = n(st.output) + ram;
  return {
    st,
    ram,
    feed,
    receiveAccounted,
    totalJump: stage !== "cutting" && Math.max(0, receiveAccounted - feed),
    // In this workflow issued-to-dept means accepted/with dept, so output is validated against feed, not a separate received field.
    outputOverReceived: 0,
    issuedOverOutput: Math.max(0, n(st.issued) - n(st.output)),
  };
}
function validateCumulativeEdit(row, stage, field, newTotal, ledger=null, asOfDate=null){
  const allowed = cumulativeAllowedTotal(row, stage, field, ledger, asOfDate);
  const t = stageTotalsAfterEdit(row, stage, field, newTotal, ledger, asOfDate);
  const dispatchHold = stage === "dispatch" && ["output","issued"].includes(field) ? dispatchHoldInfo(row) : { blocked:false, reasons:[] };
  const blocked = !!(t.totalJump || t.outputOverReceived || t.issuedOverOutput || (stage !== "cutting" && field === "received" && newTotal > allowed) || dispatchHold.blocked);
  const messages = [];
  if (t.totalJump) messages.push(`Total jump +${fmt(t.totalJump)} above feed`);
  if (t.outputOverReceived) messages.push(`Output > received by ${fmt(t.outputOverReceived)}`);
  if (t.issuedOverOutput) messages.push(`Issued > output by ${fmt(t.issuedOverOutput)}`);
  if (stage !== "cutting" && field === "received" && newTotal > allowed) messages.push(`Received above issued feed`);
  if (dispatchHold.blocked) messages.push(`Dispatch hold: ${dispatchHold.reasons.join("; ")}`);
  return { allowed, blocked, messages, ...t, dispatchHold };
}
function confirmEntryChecks({ entryDate, changes, stage, field, reason }){
  const risk = entryDate ? backdateRisk(entryDate) : { days:0, label:"All dates review", tone:"info", locked:false, sameDay:false, future:false, reportOnly:true };
  if (risk.future) { alert("Future-dated production entries are blocked."); return false; }
  const notes = [];
  if (risk.sameDay) notes.push("Same-day entry: factory rule says production entries are normally done next day. Confirm only if this is intentional.");
  if (risk.locked) notes.push("Older backdated entry: manager approval will be required and audit will record the actual created time.");
  if (changes.some(c=>c.delta < 0)) notes.push("Negative delta/correction: this reduces a previously recorded value and should go through approval.");
  if (["reject","alter","missing"].includes(field)) notes.push(`${fieldLabel(field)} entry: confirm the R/A/M quantity has been checked department-wise.`);
  if (stage === "cutting" && ["output","good_output"].includes(field)) {
    const byRow = new Map();
    (changes || []).forEach(c=>{
      const key = c?.row?.id || styleNaturalKey(c?.row || {});
      const prev = byRow.get(key) || { row:c.row, delta:0, sizes:[] };
      prev.delta += n(c.delta);
      prev.sizes.push(c);
      byRow.set(key, prev);
    });
    const overNotes = [];
    byRow.forEach(group=>{
      const row = group.row || {};
      const oldTotal = sizeMatrix(row, "cutting", "output").reduce((a,x)=>a+n(x.qty),0);
      const newTotal = oldTotal + n(group.delta);
      const orderQty = n(row.order_qty);
      const overOverall = Math.max(0, newTotal - orderQty);
      const sizePlan = normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row));
      const overSizes = group.sizes.map(c=>{
        const planned = n(sizePlan[c.size]);
        return planned && n(c.newQty) > planned ? `${c.size}: ${fmt(c.newQty)} / ${fmt(planned)} (+${fmt(n(c.newQty)-planned)})` : null;
      }).filter(Boolean);
      if (overOverall > 0 || overSizes.length) {
        overNotes.push(`${row.order_no || ""} · ${row.style_no || ""}: cut after entry ${fmt(newTotal)} / order ${fmt(orderQty)}${overOverall>0 ? `, overall extra ${fmt(overOverall)}` : ""}${overSizes.length ? `; size extra: ${overSizes.join(", ")}` : ""}`);
      }
    });
    if (overNotes.length) notes.push(`OVER-CUT ALERT: ${overNotes.join(" | ")}. Confirm extra cutting size-wise/overall is intentional.`);
  }
  if (risk.locked && !window.confirm(`MANAGER APPROVAL REQUIRED\n\nThis entry is backdated ${risk.days} days (${entryDate}). It is validated against stock/WIP as-of that date and is stamped manager-approval-required in the audit ledger.\n\nProceed only if this has been approved.`)) return false;
  if (!notes.length) return true;
  return window.confirm(`Confirm production entry before saving\n\n${notes.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n\nStage: ${stageLabel(stage)}\nField: ${fieldLabel(field)}\nEntry date: ${entryDate}${reason ? `\nReason: ${reason}` : ""}`);
}
function cumulativeAllowedTotal(row, stage, field, ledger=null, asOfDate=null){
  if (stage === "cutting") return cuttingBaseQty(row) * (1 + cuttingToleranceFrac());
  const hasDate = !!(ledger && asOfDate);
  const feed = hasDate ? feedAsOfDate(row, ledger, stage, asOfDate).qty : stageFeed(row, stage);
  if (["received","reject","alter","missing"].includes(field)) return feed;
  if (field === "output") return feed;
  if (field === "issued") return hasDate ? fieldQtyAsOfDate(row, ledger, stage, "output", asOfDate).qty : n(sdata(row, stage).output);
  return feed || n(sdata(row, stage).received) || n(row.order_qty);
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
    const prevStage = { ...blankStage(), ...sdata(row,stage) };
    const nextStage = { ...prevStage, [field]:total };
    // Output entry must not auto-create a receive entry.
    // Receiving is a separate movement and issue-forward is the accountable feed for next dept.
    stages[stage] = nextStage;
    return { ...row, stages, size_stage:{ ...(row.size_stage||{}), [stage]:{ ...(row.size_stage?.[stage]||{}), [field]:sizes } } };
  });
}
function getDailyEntryQty(getVal, row, size){
  return n(getVal(row, size));
}
function dailySizeRows(row, stage, field, getVal, ledger=null, entryDate=null){
  const baseField = field === "alter_clear" ? "output" : field;
  const oldAsOf = ledger && entryDate ? fieldQtyAsOfDate(row, ledger, stage, baseField, entryDate).sizes : null;
  return sizesFor(row).map(size => {
    const entryQty = getDailyEntryQty(getVal, row, size);
    if (!entryQty) return null;
    const oldQty = oldAsOf ? n(oldAsOf[size]) : (sizeMatrix(row, stage, baseField).find(x=>x.size===size)?.qty || 0);
    return { row, size, oldQty, newQty:oldQty + entryQty, delta:entryQty, entryQty };
  }).filter(Boolean);
}
function rowDailyEntryTotal(row, getVal){
  return sizesFor(row).reduce((a,size)=>a+getDailyEntryQty(getVal,row,size),0);
}
function ledgerTypesForFieldForDate(field){
  if (field === "output" || field === "alter_clear") return ["good_output", "output", "completed", "complete", "done"];
  if (field === "issued") return ["issue", "issued"];
  if (field === "received") return ["receive", "received"];
  if (field === "reject") return ["reject", "rejection"];
  if (field === "alter") return ["alter", "alter_issue"];
  if (field === "missing") return ["missing"];
  return [entryTypeForField(field)];
}
function ledgerQtyAsOfDate(row, ledger, stage, types, asOfDate){
  const typeSet = new Set((types || []).map(x=>String(x).toLowerCase()));
  const matches = (ledger || []).filter(e=>ledgerMatchesRow(e,row) && ledgerStage(e) === stage && ledgerDate(e) && ledgerDate(e) <= asOfDate && typeSet.has(ledgerType(e)));
  return { hasLedger:matches.length>0, qty:matches.reduce((a,e)=>a+n(e.qty ?? e.delta),0) };
}
function ledgerSizeQtyAsOfDate(row, ledger, stage, types, asOfDate){
  const typeSet = new Set((types || []).map(x=>String(x).toLowerCase()));
  const out = {};
  let hasLedger = false;
  (ledger || []).forEach(e=>{
    if (!ledgerMatchesRow(e,row) || ledgerStage(e) !== stage || !ledgerDate(e) || ledgerDate(e) > asOfDate || !typeSet.has(ledgerType(e))) return;
    const size = String(e.size || e.size_code || e.size_name || "").trim();
    if (!size) return;
    hasLedger = true;
    out[size] = n(out[size]) + n(e.qty ?? e.delta);
  });
  return { hasLedger, sizes:out, qty:Object.values(out).reduce((a,v)=>a+n(v),0) };
}
function fieldQtyAsOfDate(row, ledger, stage, field, asOfDate){
  const types = ledgerTypesForFieldForDate(field);
  const fromLedger = ledgerSizeQtyAsOfDate(row, ledger, stage, types, asOfDate);
  if (fromLedger.hasLedger) return fromLedger;
  const fallback = Object.fromEntries(sizeMatrix(row, stage, field === "alter_clear" ? "output" : field).map(x=>[x.size, n(x.qty)]));
  return { hasLedger:false, sizes:fallback, qty:Object.values(fallback).reduce((a,v)=>a+n(v),0) };
}
function feedAsOfDate(row, ledger, stage, asOfDate){
  if (stage === "cutting") {
    const sizes = fileReleaseSizeQtyMap(row);
    const total = qtyMapTotal(sizes) || cuttingBaseQty(row);
    return { hasLedger:false, sizes, qty:total };
  }
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  if (idx <= 0) return { hasLedger:false, sizes:normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row)), qty:n(row.order_qty) };
  return fieldQtyAsOfDate(row, ledger, route[idx-1], "issued", asOfDate);
}
function p0StrictFieldQtyAsOfDate(row, ledger, stage, field, asOfDate){
  const types = ledgerTypesForFieldForDate(field);
  const fromLedger = ledgerSizeQtyAsOfDate(row, ledger || [], stage, types, asOfDate || "9999-12-31");
  const cleanSizes = Object.fromEntries(sizesFor(row).map(size=>[size, n(fromLedger.sizes?.[size])]));
  return { hasLedger:!!fromLedger.hasLedger, sizes:cleanSizes, qty:Object.values(cleanSizes).reduce((a,v)=>a+n(v),0) };
}
function p0StrictFeedAsOfDate(row, ledger, stage, asOfDate){
  if (stage === "cutting") {
    const sizes = fileReleaseSizeQtyMap(row);
    const total = qtyMapTotal(sizes) || cuttingBaseQty(row);
    return { hasLedger:isProductionFileReleased(row), sizes, qty:total };
  }
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  if (idx <= 0) return { hasLedger:false, sizes:Object.fromEntries(sizesFor(row).map(size=>[size,0])), qty:0 };
  return p0StrictFieldQtyAsOfDate(row, ledger, route[idx-1], "issued", asOfDate || "9999-12-31");
}
function p0AsOfStageSnapshot(row, ledger, stage, asOfDate){
  const feed = p0StrictFeedAsOfDate(row, ledger, stage, asOfDate);
  const output = p0StrictFieldQtyAsOfDate(row, ledger, stage, "output", asOfDate);
  const issued = p0StrictFieldQtyAsOfDate(row, ledger, stage, "issued", asOfDate);
  const reject = p0StrictFieldQtyAsOfDate(row, ledger, stage, "reject", asOfDate);
  const alter = p0StrictFieldQtyAsOfDate(row, ledger, stage, "alter", asOfDate);
  const missing = p0StrictFieldQtyAsOfDate(row, ledger, stage, "missing", asOfDate);
  const ram = n(reject.qty) + n(alter.qty) + n(missing.qty);
  const accounted = n(output.qty) + ram;
  return { feed, output, issued, reject, alter, missing, ram, accounted };
}
function p0EntryImpactIssues(row, ledger, stage, field, entryDate, sizeMap){
  if (!entryDate) return [];
  const messages = [];
  const sizes = sizesFor(row);
  const entryBySize = Object.fromEntries(sizes.map(size=>[size, n(sizeMap?.[size])]));
  const baseField = field === "alter_clear" ? "output" : field;
  const oldAsOf = p0StrictFieldQtyAsOfDate(row, ledger, stage, baseField, entryDate);
  const updatedBySize = Object.fromEntries(sizes.map(size=>[size, n(oldAsOf.sizes[size]) + n(entryBySize[size])]));
  const updatedTotal = qtyMapTotal(updatedBySize);
  const route = routeFor(row);
  if (stage === "cutting" && ["output","reject","alter","missing","alter_clear"].includes(field)) {
    const maxCut = Math.ceil(n(cuttingBaseQty(row)) * (1 + cuttingToleranceFrac()));
    if (updatedTotal > maxCut) messages.push(`Cutting ${fieldLabel(field)} dated ${entryDate} exceeds released/order qty plus tolerance. Max normal ${fmt(maxCut)}, after entry ${fmt(updatedTotal)}.`);
  }
  if (stage !== "cutting" && ["received","output","reject","alter","missing","alter_clear"].includes(field)) {
    const feed = p0StrictFeedAsOfDate(row, ledger, stage, entryDate);
    const existingOutput = field === "output" || field === "alter_clear" ? updatedBySize : p0StrictFieldQtyAsOfDate(row, ledger, stage, "output", entryDate).sizes;
    const existingReject = field === "reject" ? updatedBySize : p0StrictFieldQtyAsOfDate(row, ledger, stage, "reject", entryDate).sizes;
    const existingAlter = field === "alter" ? updatedBySize : p0StrictFieldQtyAsOfDate(row, ledger, stage, "alter", entryDate).sizes;
    const existingMissing = field === "missing" ? updatedBySize : p0StrictFieldQtyAsOfDate(row, ledger, stage, "missing", entryDate).sizes;
    const accountedBySize = Object.fromEntries(sizes.map(size=>[size, n(existingOutput[size]) + n(existingReject[size]) + n(existingAlter[size]) + n(existingMissing[size])]));
    const overSizes = sizes.map(size=>{ const over=n(accountedBySize[size])-n(feed.sizes[size]); return over>0 ? `${size} +${fmt(over)}` : null; }).filter(Boolean);
    const overTotal = qtyMapTotal(accountedBySize) - n(feed.qty);
    if (overTotal > 0) messages.push(`${stageLabel(stage)} accounted qty dated ${entryDate} exceeds previous department issue/feed as-of that date by ${fmt(overTotal)}${overSizes.length ? ` (${overSizes.join(", ")})` : ""}.`);
    if (!feed.hasLedger && qtyMapTotal(accountedBySize) > 0) messages.push(`${stageLabel(stage)} has dated activity on ${entryDate} but no dated upstream issue/feed exists before/on that date. This must be reviewed/reconciled.`);
  }
  if (field === "issued") {
    const outputAsOf = p0StrictFieldQtyAsOfDate(row, ledger, stage, "output", entryDate);
    const overSizes = sizes.map(size=>{ const over=n(updatedBySize[size])-n(outputAsOf.sizes[size]); return over>0 ? `${size} +${fmt(over)}` : null; }).filter(Boolean);
    const overTotal = updatedTotal - n(outputAsOf.qty);
    if (overTotal > 0) messages.push(`${stageLabel(stage)} issue-forward dated ${entryDate} exceeds ${stageLabel(stage)} output available as-of that date by ${fmt(overTotal)}${overSizes.length ? ` (${overSizes.join(", ")})` : ""}.`);
    if (!outputAsOf.hasLedger && updatedTotal > 0) messages.push(`${stageLabel(stage)} issue-forward dated ${entryDate} has no dated ${stageLabel(stage)} output before/on that date. This must be reviewed/reconciled.`);
  }
  messages.push(...futureDependentEntryMessages(row, ledger, stage, field, entryDate));
  return Array.from(new Set(messages));
}
function p0StockAuditIssues(rows=[], ledger=[]){
  const issues=[];
  const maxDate="9999-12-31";
  (rows||[]).forEach(row=>{
    const route = routeFor(row);
    const relevant = (ledger||[]).filter(e=>ledgerMatchesRow(e,row) && ledgerDate(e));
    const datesByStage = new Map();
    relevant.forEach(e=>{
      const st=ledgerStage(e); if(!route.includes(st)) return;
      const key=st; const set=datesByStage.get(key)||new Set(); set.add(ledgerDate(e)); datesByStage.set(key,set);
    });
    // Current cutting over tolerance is the only cutting conservation error; short cutting is open work.
    const cutOut = p0StrictFieldQtyAsOfDate(row, ledger, "cutting", "output", maxDate).qty || n(sdata(row,"cutting").output);
    const maxCut = Math.ceil(n(cuttingBaseQty(row)) * (1 + cuttingToleranceFrac()));
    if (cutOut > maxCut) issues.push({ row, stage:"cutting", date:"Current", severity:"block", qty:cutOut-maxCut, type:"cutting_over_tolerance", message:`Cutting output ${fmt(cutOut)} exceeds release/order tolerance max ${fmt(maxCut)}.` });
    route.forEach(stage=>{
      if(stage === "cutting") return;
      const dates = Array.from(datesByStage.get(stage)||[]).sort();
      dates.forEach(date=>{
        const snap = p0AsOfStageSnapshot(row, ledger, stage, date);
        const overAccounted = n(snap.accounted) - n(snap.feed.qty);
        if (overAccounted > 0) issues.push({ row, stage, date, severity:"block", qty:overAccounted, type:"accounted_over_feed", message:`${stageLabel(stage)} accounted ${fmt(snap.accounted)} is above dated feed ${fmt(snap.feed.qty)} as of ${date}.` });
        const issueOverOutput = n(snap.issued.qty) - n(snap.output.qty);
        if (issueOverOutput > 0) issues.push({ row, stage, date, severity:"block", qty:issueOverOutput, type:"issue_over_output", message:`${stageLabel(stage)} issued ${fmt(snap.issued.qty)} but output as-of date is ${fmt(snap.output.qty)}.` });
        if (!snap.feed.hasLedger && n(snap.accounted)>0) issues.push({ row, stage, date, severity:"review", qty:n(snap.accounted), type:"missing_dated_feed", message:`${stageLabel(stage)} has activity but no dated upstream issue/feed before/on ${date}.` });
      });
    });
    // Entries already saved with P0 override remain visible until fixed.
    relevant.filter(e=>String(e.validation_status || e.validation_snapshot?.validation_status || "").includes("p0_date_sequence") || e.requires_reconcile || e.validation_snapshot?.requires_reconcile).forEach(e=>{
      issues.push({ row, stage:ledgerStage(e), date:ledgerDate(e)||"—", severity:"review", qty:n(e.qty ?? e.delta), type:"saved_p0_override", message:`Saved P0 override/reconcile entry remains open: ${stageLabel(ledgerStage(e))} ${registerActivityLabel(ledgerType(e))} ${fmt(e.qty ?? e.delta)}.` });
    });
  });
  const seen=new Set();
  return issues.filter(x=>{ const key=[styleCompositeKey(x.row),x.stage,x.date,x.type,Math.round(n(x.qty))].join("|"); if(seen.has(key)) return false; seen.add(key); return true; }).sort((a,b)=>(a.severity==="block"?-1:1)-(b.severity==="block"?-1:1) || n(b.qty)-n(a.qty));
}
function p0AuditTableRows(issues=[]){
  return (issues||[]).map(x=>({
    Severity:x.severity === "block" ? "P0 Block" : "Review",
    Date:x.date,
    Order:x.row?.order_no,
    Style:x.row?.style_no,
    Colour:x.row?.colour,
    Component:x.row?.component,
    Dept:stageLabel(x.stage),
    Qty:n(x.qty),
    Issue:x.message,
    _row:x.row,
    _stage:x.stage
  }));
}
function dateLevelQuantityIssues(row, ledger, stage, field, entryDate, sizeEntries){
  if (!entryDate) return [];
  const entryTotal = Object.values(sizeEntries || {}).reduce((a,v)=>a+n(v),0);
  if (!entryTotal) return [];
  return p0EntryImpactIssues(row, ledger || [], stage, field, entryDate, sizeEntries || {});
}
function ledgerHasAnyStageTypes(row, ledger, stage, types){
  const typeSet = new Set((types || []).map(x=>String(x).toLowerCase()));
  return (ledger || []).some(e=>ledgerMatchesRow(e,row) && ledgerStage(e) === stage && ledgerDate(e) && typeSet.has(ledgerType(e)));
}
function chronologicalEntryIssues(row, ledger, stage, field, updatedTotal, entryDate){
  if (!entryDate || !Array.isArray(ledger) || !ledger.length) return [];
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  const messages = [];
  if (idx > 0 && ["received","output","reject","alter","missing","alter_clear"].includes(field)) {
    const prevStage = route[idx - 1];
    const prevIssueTypes = ["issue", "issued"];
    const anyPrevIssue = ledgerHasAnyStageTypes(row, ledger, prevStage, prevIssueTypes);
    const prevIssuedAsOf = ledgerQtyAsOfDate(row, ledger, prevStage, prevIssueTypes, entryDate);
    if (anyPrevIssue && prevIssuedAsOf.qty < n(updatedTotal)) {
      messages.push(`${stageLabel(stage)} ${fieldLabel(field)} dated ${entryDate} is before enough ${stageLabel(prevStage)} issue-forward qty. Available as-of date ${fmt(prevIssuedAsOf.qty)}, after entry ${fmt(updatedTotal)}.`);
    }
  }
  if (field === "issued") {
    const outputTypes = ledgerTypesForFieldForDate("output");
    const anyOutput = ledgerHasAnyStageTypes(row, ledger, stage, outputTypes);
    const outputAsOf = ledgerQtyAsOfDate(row, ledger, stage, outputTypes, entryDate);
    if (anyOutput && outputAsOf.qty < n(updatedTotal)) {
      messages.push(`${stageLabel(stage)} issue-forward dated ${entryDate} is before enough ${stageLabel(stage)} output date. Output available as-of date ${fmt(outputAsOf.qty)}, issued after entry ${fmt(updatedTotal)}.`);
    }
  }
  return messages;
}
function hardBlockMessages(validation){
  const dateSet = new Set(validation?.dateMessages || []);
  return (validation?.messages || []).filter(m=>!dateSet.has(m));
}
function p0DateViolationText(validation, limit=6){
  const msgs = validation?.dateMessages || [];
  return msgs.slice(0, limit).join("\n");
}
function confirmP0DateViolation({ validation, entryDate, stage, field, reason }){
  const msgs = validation?.dateMessages || [];
  if (!msgs.length) return true;
  if (!String(reason || "").trim()) { alert("P0 date-sequence override needs a reason. This will appear in Reconcile Review."); return false; }
  return window.confirm(`P0 DATE-SEQUENCE VIOLATION\n\nThe selected date ${entryDate} is before enough upstream/same-department dated quantity.\n\n${msgs.slice(0,8).join("\n")}\n\nIf you confirm, the entry will save as a manager-confirmed reconcile exception and appear in Review → Reconcile until corrected from Register.\n\nConfirm override for ${stageLabel(stage)} · ${fieldLabel(field)}?`);
}
function validationOverrideForP0(validation){
  if (!validation?.p0DateViolation) return null;
  return {
    validation_status:"p0_date_sequence_override",
    validation_scope:"p0_date_sequence_confirmed_reconcile",
    validation_messages:validation.dateMessages || [],
    requires_reconcile:true,
  };
}
function validateDailyEntry(row, stage, field, getVal, ledger=null, entryDate=null){
  const entryTotal = rowDailyEntryTotal(row, getVal);
  const messages = [];
  const sizeEntries = Object.fromEntries(sizesFor(row).map(size=>[size, getDailyEntryQty(getVal,row,size)]));
  if (!entryTotal) return { allowed:cumulativeAllowedTotal(row, stage, field === "alter_clear" ? "output" : field, ledger, entryDate), entryTotal:0, oldTotal:0, updatedTotal:0, blocked:false, messages, overCut:false };
  if (stage === "cutting" && !isProductionFileReleased(row)) messages.push("Production file is not released to Cutting yet. Release the file first from Live WIP, DPR Entry, or Styles.");
  if (field === "alter_clear") {
    const oldAlterAsOf = ledger && entryDate ? fieldQtyAsOfDate(row, ledger, stage, "alter", entryDate) : { sizes:Object.fromEntries(sizeMatrix(row, stage, "alter").map(x=>[x.size,n(x.qty)])), qty:sizeMatrix(row, stage, "alter").reduce((a,x)=>a+n(x.qty),0), hasLedger:false };
    const oldOutputAsOf = ledger && entryDate ? fieldQtyAsOfDate(row, ledger, stage, "output", entryDate) : { qty:sizeMatrix(row, stage, "output").reduce((a,x)=>a+n(x.qty),0) };
    const overSizes = sizesFor(row).filter(size => getDailyEntryQty(getVal,row,size) > n(oldAlterAsOf.sizes[size]));
    const oldAlter = n(oldAlterAsOf.qty);
    const oldOutput = n(oldOutputAsOf.qty);
    const updatedOutput = oldOutput + entryTotal;
    const feed = stage === "cutting" ? { qty:cuttingBaseQty(row), sizes:fileReleaseSizeQtyMap(row) } : feedAsOfDate(row, ledger, stage, entryDate);
    const st = sdata(row, stage);
    const updatedRam = n(st.reject) + Math.max(0, oldAlter - entryTotal) + n(st.missing);
    if (overSizes.length) messages.push(`Alter clear above pending alter as-of ${entryDate} in size(s): ${overSizes.join(", ")}`);
    if (stage !== "cutting" && updatedOutput + updatedRam > n(feed.qty)) messages.push(`Output + pending R/A/M would exceed dated feed by ${fmt(updatedOutput + updatedRam - n(feed.qty))}`);
    const dateMessages = dateLevelQuantityIssues(row, ledger, stage, field, entryDate, sizeEntries);
    messages.push(...dateMessages);
    return { allowed:oldAlter, entryTotal, oldTotal:oldOutput, updatedTotal:updatedOutput, blocked:messages.length>0, messages, dateMessages, p0DateViolation:dateMessages.length>0, overCut:false, oldAlter, updatedAlter:Math.max(0, oldAlter-entryTotal) };
  }
  const oldAsOf = ledger && entryDate ? fieldQtyAsOfDate(row, ledger, stage, field, entryDate) : { qty:sizeMatrix(row, stage, field).reduce((a,x)=>a+n(x.qty),0) };
  const oldTotal = n(oldAsOf.qty);
  const updatedTotal = oldTotal + entryTotal;
  const validation = validateCumulativeEdit(row, stage, field, updatedTotal, ledger, entryDate);
  const dateMessages = dateLevelQuantityIssues(row, ledger, stage, field, entryDate, sizeEntries);
  const overCut = stage === "cutting" && updatedTotal > cuttingBaseQty(row);
  return { ...validation, messages:[...(validation.messages || []), ...dateMessages], dateMessages, p0DateViolation:dateMessages.length>0, entryTotal, oldTotal, updatedTotal, blocked:validation.blocked || dateMessages.length>0, overCut };
}
function applyDailySizeEntries({ rows, targetRows, stage, field, getVal }){
  const targetIds = new Set(targetRows.map(r=>r.id));
  return rows.map(row => {
    if (!targetIds.has(row.id)) return row;
    const entries = Object.fromEntries(sizesFor(row).map(size=>[size, getDailyEntryQty(getVal,row,size)]));
    const entryTotal = Object.values(entries).reduce((a,b)=>a+n(b),0);
    if (!entryTotal) return row;
    const stages = { ...(row.stages || {}) };
    const prevStage = { ...blankStage(), ...sdata(row,stage) };
    const nextStage = { ...prevStage };
    const sizeStage = { ...(row.size_stage || {}) };
    const stageSizes = { ...(sizeStage[stage] || {}) };
    if (field === "alter_clear") {
      const oldOutput = Object.fromEntries(sizeMatrix(row, stage, "output").map(x=>[x.size,n(x.qty)]));
      const oldAlter = Object.fromEntries(sizeMatrix(row, stage, "alter").map(x=>[x.size,n(x.qty)]));
      const newOutput = {}; const newAlter = {};
      sizesFor(row).forEach(size => {
        const qty = n(entries[size]);
        newOutput[size] = n(oldOutput[size]) + qty;
        newAlter[size] = Math.max(0, n(oldAlter[size]) - qty);
      });
      nextStage.output = Object.values(newOutput).reduce((a,b)=>a+n(b),0);
      nextStage.alter = Object.values(newAlter).reduce((a,b)=>a+n(b),0);
      stageSizes.output = newOutput;
      stageSizes.alter = newAlter;
    } else {
      const oldMap = Object.fromEntries(sizeMatrix(row, stage, field).map(x=>[x.size,n(x.qty)]));
      const newMap = {};
      sizesFor(row).forEach(size => { newMap[size] = n(oldMap[size]) + n(entries[size]); });
      nextStage[field] = Object.values(newMap).reduce((a,b)=>a+n(b),0);
      // Output entry must not auto-create receiving.
      stageSizes[field] = newMap;
    }
    stages[stage] = nextStage;
    sizeStage[stage] = stageSizes;
    return { ...row, stages, size_stage:sizeStage };
  });
}
function buildLedgerRows({ changes, stage, field, entryDate, reason, source, line="", validationOverride=null }){
  const risk = backdateRisk(entryDate);
  const created = new Date().toISOString();
  const profile = currentUserProfile();
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
    changed_by:profile.name || currentUserName(),
    changed_by_role:profile.role || "",
    changed_by_department:profile.department || "",
    entry_source:source,
    line: line || c.row.line || "",
    stitching_line: stage === "stitching" ? (line || c.row.line || "") : "",
    validation_scope:validationOverride?.validation_scope || "size_wise_as_of_entry_date",
    validation_status:validationOverride?.validation_status || "ok",
    validation_messages:validationOverride?.validation_messages || [],
    validation_requires_reconcile:!!validationOverride?.requires_reconcile,
    remarks:`${source}: size-wise ledger entry. Entry date ${entryDate}; actual saved ${created.slice(0,10)} by ${profile.name || currentUserName()}.${validationOverride?.requires_reconcile ? " P0 date-sequence override: review in Reconcile." : ""}`
  }));
}
async function saveLedgerToSupabase(newLedger, field){
  if (!newLedger.length) return { skipped:true, warning:"No ledger rows to save." };
  const isCorrection = (newLedger || []).some(x=>String(x.entry_source || "").toLowerCase().includes("correction") || n(x.qty) < 0);
  const perm = requireCurrentPermission(isCorrection ? "production.correct_entry" : "production.entry_dpr", isCorrection ? "correct old register entries" : "enter DPR / WIP movements");
  if (perm) return perm;
  const profile = currentUserProfile();
  const payload = newLedger.map(({id, ...x})=>({
    ...x,
    changed_by:x.changed_by || profile.name || currentUserName(),
    changed_by_role:x.changed_by_role || profile.role || "",
    changed_by_department:x.changed_by_department || profile.department || "",
    qty:n(x.qty),
    good_qty:["output","alter_clear"].includes(field) ? n(x.qty) : 0,
    reject_qty:field==="reject" ? n(x.qty) : 0,
    alter_qty:field==="alter" ? n(x.qty) : 0,
    missing_qty:field==="missing" ? n(x.qty) : 0,
    validation_status:x.validation_status || "ok",
    validation_messages:x.validation_messages || [],
    validation_snapshot:{ old_qty:x.old_qty, new_qty:x.new_qty, entry_source:x.entry_source, is_backdated:x.is_backdated, approval_status:x.approval_status, validation_status:x.validation_status || "ok", validation_messages:x.validation_messages || [], validation_requires_reconcile:!!x.validation_requires_reconcile, changed_by:x.changed_by || profile.name, changed_by_role:x.changed_by_role || profile.role, changed_by_department:x.changed_by_department || profile.department }
  }));
  const result = await robustInsertEntriesToSupabase(payload);
  if(result?.error) console.warn("Supabase production_entries save failed", result.error);
  if(!result?.error && !result?.skipped && !result?.warning) {
    const first = payload[0] || {};
    recordProductionAudit(isCorrection ? "ledger_correction" : "ledger_insert", {
      table_name:"production_entries", order_no:first.order_no, style_no:first.style_no, colour:first.colour, component:first.component, stage:first.stage, entry_type:first.entry_type, entry_date:first.entry_date, qty:payload.reduce((a,b)=>a+n(b.qty),0), source:first.entry_source || "DPR Entry", metadata:{ row_count:payload.length, field, via:result.via || "supabase", line:first.line || first.stitching_line || "" }
    });
  }
  return result;
}
function receivingHistoryRows(row, stage, ledger=[]){
  if (!row) return [];
  if (stage === "cutting") {
    const sizes = sizesFor(row);
    const sizeCols = withHorizontalSizes(row, orderSizeQtyMap(row), sizes);
    return [{ Actual_Date:row.file_released_date || row.production_file_released_date || row.cutting_file_released_date || "Style Entry", Source_Dept:"Style Entry", Meaning:"Cutting feed = order qty / production file release", ...sizeCols, Total:Object.values(sizeCols).reduce((a,b)=>a+n(b),0), First_Typed_At:"", Last_Typed_At:"", Users:"Style master" }];
  }
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  const prevStage = idx > 0 ? route[idx-1] : null;
  if (!prevStage) return [];
  const sizes = sizesFor(row);
  const matching = (ledger||[]).filter(e=>ledgerRowMatchesStyle(e,row)).filter(e=>{
    const stg = String(e.stage||"");
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    return (stg === prevStage && ["issue","issued"].includes(typ)) || (stg === stage && ["receive","received","legacy_feed"].includes(typ));
  }).sort((a,b)=>String(b.entry_date||b.date||"").localeCompare(String(a.entry_date||a.date||""))).slice(0,400);

  // User-facing history must stay horizontal: one activity/date row with sizes across columns.
  // Vertical one-size-per-row is only acceptable in raw audit ledgers, not WIP/detail screens.
  const grouped = new Map();
  matching.forEach(e=>{
    const stg = String(e.stage || "");
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    const isPrevIssue = stg === prevStage;
    const entryDate = e.entry_date || e.date || "";
    const meaning = isPrevIssue ? `${stageLabel(prevStage)} issue / feed to ${stageLabel(stage)}` : `${stageLabel(stage)} legacy manual feed`;
    const key = [entryDate, stg, typ, meaning].join("|::|");
    if (!grouped.has(key)) {
      grouped.set(key, {
        Actual_Date:entryDate,
        Source_Dept:stageLabel(stg),
        Meaning:meaning,
        _sizeQty:Object.fromEntries(sizes.map(size=>[size,0])),
        Total:0,
        First_Typed_At:e.created_at || "",
        Last_Typed_At:e.created_at || "",
        Users:new Set([e.changed_by || e.created_by || "—"])
      });
    }
    const g = grouped.get(key);
    const size = e.size || "Total";
    const qty = n(e.qty ?? e.delta ?? e.good_qty);
    const typedAt = e.created_at || "";
    if (typedAt && (!g.First_Typed_At || String(typedAt) < String(g.First_Typed_At))) g.First_Typed_At = typedAt;
    if (typedAt && (!g.Last_Typed_At || String(typedAt) > String(g.Last_Typed_At))) g.Last_Typed_At = typedAt;
    g.Users.add(e.changed_by || e.created_by || "—");
    if (sizes.includes(size)) g._sizeQty[size] = n(g._sizeQty[size]) + qty;
    else g.Total = n(g.Total) + qty;
  });

  return Array.from(grouped.values()).map(g=>{
    const sizeCols = withHorizontalSizes(row, g._sizeQty, sizes);
    const sizeTotal = Object.values(sizeCols).reduce((a,b)=>a+n(b),0);
    const { _sizeQty, Users, ...rest } = g;
    return {
      Actual_Date:rest.Actual_Date,
      Source_Dept:rest.Source_Dept,
      Meaning:rest.Meaning,
      ...sizeCols,
      Total:n(rest.Total) + sizeTotal,
      First_Typed_At:rest.First_Typed_At,
      Last_Typed_At:rest.Last_Typed_At,
      Users:Array.from(Users || []).filter(Boolean).join(", ")
    };
  });
}


function departmentOutputHistoryRows(row, stage, ledger=[]){
  if (!row || !stage) return [];
  const sizes = sizesFor(row);
  const activityTypes = new Set([
    "output", "good_output", "completed", "complete", "done",
    "issue", "issued",
    "reject", "rejection", "missing", "alter", "alter_clear"
  ]);
  const typeLabel = (typ)=>{
    const t = String(typ||"").toLowerCase();
    if (["output","good_output","completed","complete","done"].includes(t)) return "Completed / Output";
    if (["issue","issued"].includes(t)) return "Dept Issue Forward";
    if (["reject","rejection"].includes(t)) return "Rejection";
    if (t === "missing") return "Missing";
    if (t === "alter") return "Alter Defect";
    if (t === "alter_clear") return "Alter Clear";
    return fieldLabel(t);
  };
  const matching = (ledger||[]).filter(e=>ledgerRowMatchesStyle(e,row)).filter(e=>{
    const stg = String(e.stage||"");
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    return stg === stage && activityTypes.has(typ);
  }).sort((a,b)=>String(b.entry_date||b.date||"").localeCompare(String(a.entry_date||a.date||""))).slice(0,600);

  // HOD / coordinator drilldowns must show complete output movement horizontally.
  // This covers good output, issue-forward, rejection, missing, alter and alter-clear.
  const grouped = new Map();
  matching.forEach(e=>{
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    const entryDate = e.entry_date || e.date || "";
    const createdAt = e.created_at || e.createdAt || "";
    const by = e.changed_by || e.created_by || e.user || "—";
    const key = [entryDate, typ, e.entry_source || e.source || ""].join("|::|");
    if (!grouped.has(key)) {
      grouped.set(key, {
        Actual_Date:entryDate,
        Department:stageLabel(stage),
        Activity:typeLabel(typ),
        Source:e.entry_source || e.source || "",
        _sizeQty:Object.fromEntries(sizes.map(size=>[size,0])),
        Total:0,
        First_Typed_At:createdAt,
        Last_Typed_At:createdAt,
        Users:new Set([by]),
        Reason:e.backdate_reason || e.reason || ""
      });
    }
    const g = grouped.get(key);
    const size = e.size || "Total";
    const qty = n(e.qty ?? e.delta ?? e.good_qty);
    if (createdAt && (!g.First_Typed_At || String(createdAt) < String(g.First_Typed_At))) g.First_Typed_At = createdAt;
    if (createdAt && (!g.Last_Typed_At || String(createdAt) > String(g.Last_Typed_At))) g.Last_Typed_At = createdAt;
    g.Users.add(by);
    if (sizes.includes(size)) g._sizeQty[size] = n(g._sizeQty[size]) + qty;
    else g.Total = n(g.Total) + qty;
  });
  return Array.from(grouped.values()).map(g=>{
    const sizeCols = withHorizontalSizes(row, g._sizeQty, sizes);
    const sizeTotal = Object.values(sizeCols).reduce((a,b)=>a+n(b),0);
    const { _sizeQty, Users, ...rest } = g;
    return {
      Actual_Date:rest.Actual_Date,
      Department:rest.Department,
      Activity:rest.Activity,
      Source:rest.Source,
      ...sizeCols,
      Total:n(rest.Total) + sizeTotal,
      First_Typed_At:rest.First_Typed_At,
      Last_Typed_At:rest.Last_Typed_At,
      Users:Array.from(Users || []).filter(Boolean).join(", "),
      Reason:rest.Reason
    };
  });
}


function ledgerLocalUniqueKey(e){
  return [
    ledgerDate(e), ledgerStage(e), ledgerType(e),
    String(e.order_no || e.order || "").trim().toUpperCase(),
    String(e.style_no || e.style || "").trim().toUpperCase(),
    String(e.colour || "").trim().toUpperCase(),
    String(e.component || "").trim().toUpperCase(),
    String(e.size || e.size_code || e.size_name || "").trim().toUpperCase(),
    String(e.entry_source || e.source || "").trim().toLowerCase(),
    n(e.qty ?? e.delta)
  ].join("|::|");
}
function mergeLedgerPrependUnique(prev=[], incoming=[]){
  const seen = new Set((prev || []).map(ledgerLocalUniqueKey));
  const cleanIncoming = [];
  (incoming || []).forEach(e=>{
    const key = ledgerLocalUniqueKey(e);
    if (seen.has(key)) return;
    seen.add(key);
    cleanIncoming.push(e);
  });
  return [...cleanIncoming, ...(prev || [])];
}

function SizeCumulativeEditor({ row, rows, setRows, ledger, setLedger, stage, initialField="output", source="wip_cell", onSaved, onSharedSave }){
  const [field, setField] = useState(initialField);
  const [entryDate, setEntryDate] = useState(defaultEntryDate(ledger));
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState({});
  const saveLockRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveMsg, setLastSaveMsg] = useState(null);
  const operatorSimpleMode = isOperatorEntryMode();
  useEffect(()=>{ if (operatorSimpleMode && ["reject","missing","alter","alter_clear","received"].includes(field)) { setField("output"); setDraft({}); } }, [operatorSimpleMode, field]);
  useEffect(()=>setDraft({}), [row?.id, stage, field]);
  if (!row) return null;
  const sizes = sizesFor(row);
  const risk = backdateRisk(entryDate);
  const needsReason = false;
  const reasonMissing = false;
  const entryStageIsAll = stage === "all";
  const entryFieldIsAll = field === "all_movement" || field === "all";
  function getVal(_, size){ const key = `${row.id}|${size}`; return draft[key] !== undefined ? draft[key] : ""; }
  function setVal(size, value){ setDraft(d=>({ ...d, [`${row.id}|${size}`]:cappedEntryInputValue(row, stage, field, size, value) })); }
  const validation = validateDailyEntry(row, stage, field, getVal, ledger, entryDate);
  const ctx = entryFieldContext(row, stage, field);
  const orderVariance = sizeVarianceInfo(row.order_qty, normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row)));
  const changes = dailySizeRows(row, stage, field, getVal, ledger, entryDate);
  const newQty = changes.reduce((a,c)=>a+n(c.delta),0);
  const sizeContexts = sizes.map(size=>({ size, ...entryFieldSizeContext(row,stage,field,size), entry:n(getVal(row,size)) }));
  const fillOpen = () => setDraft(d=>{ const nd={...d}; sizeContexts.forEach(x=>{ nd[`${row.id}|${x.size}`]=String(Math.max(0,n(x.open))); }); return nd; });
  const clear = () => setDraft({});
  async function save(){
    if (!entryDate) { alert("Choose entry date before saving. Date is optional only for review tables, not for posting DPR quantity."); return; }
    if (entryStageIsAll || entryFieldIsAll) { alert("Choose one department and one action before saving. All departments/action mode is for review only."); return; }
    if (saveLockRef.current) { alert("Save already in progress. Please wait."); return; }
    if (!changes.length) { alert("No new size-wise quantity entered."); return; }
    const sizeGate = entrySizeGateMessages(changes, { allowNegativeLegacy:false });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    if (reasonMissing) { alert("Backdated entry older than normal next-day needs a reason before save."); return; }
    const hardMessages = hardBlockMessages(validation);
    if (hardMessages.length) { alert(`Blocked: ${hardMessages.join("; ")}. Correct upstream/opening stock or create approved adjustment first.`); return; }
    if (!confirmP0DateViolation({ validation, entryDate, stage, field, reason })) return;
    if (!confirmEntryChecks({ entryDate, changes, stage, field, reason })) return;
    saveLockRef.current = true;
    setIsSaving(true);
    try {
      const newLedger = buildLedgerRows({ changes, stage, field, entryDate, reason, source, validationOverride:validationOverrideForP0(validation) });
      const sharedResult = await saveLedgerToSupabase(newLedger, field);
      if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
        const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
        if (!window.confirm(`Shared Supabase save did not confirm: ${msg}

Save locally in this browser anyway? Other users will not see it until Supabase is fixed/synced.`)) return;
      }
      setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage, field, getVal }));
      setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
      setDraft({});
      setLastSaveMsg({ tone:"ok", text:`Saved: ${fmt(newLedger.reduce((a,e)=>a+n(e.qty),0))} pcs · ${stageLabel(stage)} · ${fieldLabel(field)} · ${entryDate}` });
      onSaved?.(newLedger);
      onSharedSave?.(sharedResult, "WIP day entry");
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }
  return <div className="mt-edit-panel">
    <div className="mt-edit-panel-head"><h3 className="mt-panel-title">{stageLabel(stage)} — {fieldLabel(field)}</h3><div className="mt-panel-sub">Selected department only. Enter new quantity by size for the selected date. The updated total is shown as a cross-check, not as editable cumulative entry.</div>{lastSaveMsg && <div className={`mt-save-banner ${lastSaveMsg.tone === "warn" ? "warn" : ""}`}><CheckCircle2 size={16}/>{lastSaveMsg.text}</div>}</div>
    <div className="mt-section no-print"><div className="mt-backdate-box"><span className="mt-toolbar-label">Entry Date</span><input className="mt-input mt-entry-date mandatory" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /><span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span><span className="mt-toolbar-label">Dept</span><span className="mt-chip mt-info">{stageLabel(stage)}</span><span className="mt-toolbar-label">Entry Field</span>{operatorSimpleMode ? <span className="mt-chip mt-info">{fieldLabel(field)}</span> : <select className="mt-select" value={field} onChange={e=>setField(e.target.value)}>{(ENTRY_FIELDS.some(f=>f.key===field) ? ENTRY_FIELDS : [{key:field,label:fieldLabel(field)}, ...ENTRY_FIELDS]).map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select>}{risk.days>1 && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate note optional/report flag" style={{minWidth:250}} />}</div>{!operatorSimpleMode && <div className="mt-ram-action-bar"><span className="mt-toolbar-label">R/A/M closure rows</span>{RAM_ENTRY_FIELDS.map(f=><button key={f.key} className={`mt-btn ghost ${field===f.key?"active":""}`} onClick={()=>{setField(f.key); setDraft({});}}>{f.label}</button>)}<span className="mt-small">Use these only to close/explain small balances; normal production entry stays Output / Issue-Feed. No separate Receive entry.</span></div>}{risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated date: report flag only. Quantity/feed/P0 sequence clashes still require reconcile review.</div>}</div>
    <div className="mt-section"><div className="mt-entry-hero"><div className="mt-entry-hero-title"><span>{row.style_no}</span><span className="mt-chip mt-muted">{row.order_no}</span><span className="mt-chip mt-info">{stageLabel(stage)}</span><span className="mt-chip mt-warn">{fieldLabel(field)}</span></div><div className="mt-entry-hero-sub">{ctx.note} Reductions/corrections are not normal entry and must go through approval.</div>{orderVariance.diff !== 0 && <div className={`mt-chip ${statusClass(orderVariance.tone)}`} style={{marginTop:8}}>{orderVariance.text}</div>}<div className="mt-mandatory-note"><AlertTriangle size={14}/> Highlighted size boxes are open/mandatory when entering this row. Blank means no quantity entered for that size.</div></div><div className="mt-entry-metrics"><div className="mt-entry-metric"><div className="label">{ctx.availableLabel}</div><div className="value">{fmt(ctx.available)}</div><div className="note">source / feed</div></div><div className="mt-entry-metric"><div className="label">{ctx.previousLabel}</div><div className="value">{fmt(ctx.previous)}</div><div className="note">already entered</div></div><div className="mt-entry-metric"><div className="label">{ctx.openLabel}</div><div className="value">{fmt(ctx.open)}</div><div className="note">balance before entry</div></div><div className="mt-entry-metric"><div className="label">New Entry</div><div className="value">{fmt(newQty)}</div><div className="note">selected date</div></div><div className="mt-entry-metric"><div className="label">Cumulative After</div><div className="value">{fmt(validation.updatedTotal)}</div><div className="note">{fmt(validation.updatedTotal)} / {fmt(ctx.available)} total</div></div><div className="mt-entry-metric"><div className="label">Remaining After</div><div className="value">{fmt(Math.max(0, n(ctx.open)-newQty))}</div><div className="note">after saving</div></div></div><div className="mt-entry-row-actions"><button className="mt-btn" onClick={fillOpen}>Auto-fill open qty</button><button className="mt-btn ghost" onClick={clear}>Clear entry</button><button className="mt-btn primary" onClick={save} disabled={isSaving || !changes.length || hardBlockMessages(validation).length || reasonMissing}><CheckCircle2 size={14}/>{isSaving ? "Saving..." : "Save Day Entry"}</button></div></div>
    <div className="mt-section"><div className="mt-dept-size-grid">{sizeContexts.map(x=>{ const remaining=Math.max(0,n(x.open)-n(x.entry)); const baseField=field==="alter_clear"?"output":field; const prev=n(sizeMatrix(row,stage,baseField).find(v=>v.size===x.size)?.qty); const updated=prev+n(x.entry); const blocked=field==="alter_clear" && n(x.entry)>n(x.open); return <div key={x.size} className="mt-dept-size-box"><div className="size">{x.size}</div><div className="line"><span>Open</span><b>{fmt(x.open)}</b></div><input className={`mt-cell-input ${n(x.open)>0?"mandatory":""} ${draft[`${row.id}|${x.size}`]!==undefined?"dirty":""} ${blocked||validation.blocked?"blocked":""}`} value={getVal(row,x.size)} onChange={e=>setVal(x.size,e.target.value)} placeholder="0" max={Math.max(0,n(x.open))} title={`Max allowed now: ${fmt(x.open)}`} style={{width:"100%", marginTop:6}}/><div className="line"><span>Remaining</span><b>{fmt(remaining)}</b></div><div className="line"><span>Updated total</span><b>{fmt(updated)}</b></div></div>;})}</div>{validation.p0DateViolation && <div className="mt-p0-inline-warning"><b>P0 review required:</b> {p0DateViolationText(validation,4)}. Save needs reason + confirmation and will appear in Reconcile.</div>}{hardBlockMessages(validation).length ? <div className="mt-locked-note" style={{marginTop:10}}>Blocked: {hardBlockMessages(validation).join("; ")}</div> : null}</div>
  </div>;
}


function dprMovementFieldKeys(field){
  if (field === "all_movement" || field === "all") return ["output", "issued"];
  return [field || "output"];
}
function dprEntryActivityRows(rows=[], ledger=[], { date="", dept="all", field="all_movement", limit=600 }={}){
  const rowByKey = new Map((rows||[]).map(r=>[styleCompositeKey(r), r]));
  const types = new Set(dprMovementFieldKeys(field).map(entryTypeForField).map(x=>String(x).toLowerCase()));
  const groups = new Map();
  (ledger||[]).forEach(e=>{
    const row = findRowForLedger(rows, e);
    if (!row) return;
    const stg = ledgerStage(e);
    const typ = String(ledgerType(e) || "").toLowerCase();
    const dt = ledgerDate(e);
    if (date && dt !== date) return;
    if (dept && dept !== "all" && stg !== dept) return;
    if (types.size && !types.has(typ)) return;
    const key = [styleCompositeKey(row), dt, stg, typ].join("|::|");
    if (!groups.has(key)) groups.set(key, {
      Date:dt || "—",
      Department:stageLabel(stg),
      Action:registerActivityLabel(typ),
      Order:row.order_no,
      Style:row.style_no,
      Buyer:row.buyer,
      Colour:row.colour,
      Component:row.component,
      Net_Total:0,
      Total:0,
      Sizes:{},
      Entry_Rows:0,
      Positive_Rows:0,
      Correction_Rows:0,
      Correction_Qty:0,
      First_Typed_At:e.created_at || e.createdAt || "",
      Last_Typed_At:e.created_at || e.createdAt || "",
      Users:new Set(),
      _sortDate:dt || "",
      _rowId:row.id,
      _rowKey:styleCompositeKey(row),
      _stageKey:stg,
      _entryType:typ
    });
    const g = groups.get(key);
    const qty = n(e.qty ?? e.delta);
    const src = String(e.entry_source || e.source || e.reason || "").toLowerCase();
    const isCorrectionRow = qty < 0 || src.includes("correction") || src.includes("void") || src.includes("reverse");
    const sz = String(e.size || e.size_code || e.size_name || "").trim().toUpperCase();
    g.Total += qty;
    g.Net_Total += qty;
    g.Entry_Rows += 1;
    if (isCorrectionRow) { g.Correction_Rows += 1; g.Correction_Qty += qty; }
    else { g.Positive_Rows += 1; }
    if (sz) g.Sizes[sz] = n(g.Sizes[sz]) + qty;
    const by = e.changed_by || e.created_by || e.user || "";
    if (by) g.Users.add(by);
    const ca = e.created_at || e.createdAt || "";
    if (ca && (!g.First_Typed_At || String(ca) < String(g.First_Typed_At))) g.First_Typed_At = ca;
    if (ca && (!g.Last_Typed_At || String(ca) > String(g.Last_Typed_At))) g.Last_Typed_At = ca;
  });
  return Array.from(groups.values()).sort((a,b)=>String(b._sortDate).localeCompare(String(a._sortDate)) || String(a.Department).localeCompare(String(b.Department)) || String(a.Style).localeCompare(String(b.Style))).slice(0, limit).map(g=>({
    Date:g.Date,
    Department:g.Department,
    Action:g.Action,
    Order:g.Order,
    Style:g.Style,
    Buyer:g.Buyer,
    Colour:g.Colour,
    Component:g.Component,
    Net_Total:g.Net_Total,
    Total:g.Total,
    Size_Breakup:Object.entries(g.Sizes||{}).filter(([,v])=>n(v)).map(([k,v])=>`${k} ${fmt(v)}`).join(" · ") || "—",
    Posting:g.Correction_Rows ? `Final after ${g.Correction_Rows} correction/reversal row(s)` : "Original entry",
    Entry_Rows:g.Entry_Rows,
    Correction_Rows:g.Correction_Rows,
    Correction_Qty:g.Correction_Rows ? g.Correction_Qty : "—",
    Edit:"Click row to correct final qty",
    Users:Array.from(g.Users||[]).join(", ") || "—",
    First_Typed_At:g.First_Typed_At || "—",
    Last_Typed_At:g.Last_Typed_At || "—",
    _rowId:g._rowId,
    _rowKey:g._rowKey,
    _stageKey:g._stageKey,
    _entryType:g._entryType,
    _sizes:g.Sizes || {}
  }));
}
function futureDependentLedgerEntries(row, ledger=[], stage, field, entryDate){
  if (!entryDate || !Array.isArray(ledger) || !ledger.length) return [];
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  const nextStage = idx >= 0 ? route[idx + 1] : null;
  const downstream = new Set(idx >= 0 ? route.slice(idx + 1) : []);
  const sameStageTypes = field === "output" ? new Set(["issue","issued"]) : new Set();
  const nextStageTypes = field === "issued" ? new Set(["good_output","output","completed","complete","done","reject","missing","alter","alter_issue","alter_clear","issue","issued"]) : new Set();
  return (ledger || []).filter(e=>{
    if (!ledgerMatchesRow(e, row)) return false;
    const d = ledgerDate(e);
    if (!d || d <= entryDate) return false;
    const st = ledgerStage(e);
    const typ = ledgerType(e);
    if (field === "output" && st === stage && sameStageTypes.has(typ)) return true;
    if (field === "output" && downstream.has(st)) return true;
    if (field === "issued" && nextStage && st === nextStage && nextStageTypes.has(typ)) return true;
    if (["reject","missing","alter","alter_clear"].includes(field) && (st === stage || downstream.has(st))) return true;
    return false;
  });
}
function futureDependentEntryMessages(row, ledger=[], stage, field, entryDate){
  const future = futureDependentLedgerEntries(row, ledger, stage, field, entryDate);
  if (!future.length) return [];
  const qty = future.reduce((a,e)=>a+n(e.qty ?? e.delta),0);
  const first = future.map(e=>`${ledgerDate(e)} ${stageLabel(ledgerStage(e))} ${registerActivityLabel(ledgerType(e))} ${fmt(e.qty ?? e.delta)}`).slice(0,3).join("; ");
  return [`Backdated ${stageLabel(stage)} ${fieldLabel(field)} dated ${entryDate} affects ${future.length} later ledger row(s) already entered (${fmt(qty)} qty): ${first}. Save only with reason; Review → Reconcile must confirm forward sequence.`];
}
function entryOpenQtyAsOf(row, stage, field, ledger=null, asOfDate=null){
  if (!asOfDate || !Array.isArray(ledger)) return entryOpenQty(row, stage, field);
  const snap = p0AsOfStageSnapshot(row, ledger, stage, asOfDate);
  if (field === "issued") return Math.max(0, n(snap.output.qty) - n(snap.issued.qty));
  if (field === "output") return stage === "cutting" ? Math.max(0, cuttingBaseQty(row) - n(snap.output.qty) - n(snap.ram)) : Math.max(0, n(snap.feed.qty) - n(snap.output.qty) - n(snap.ram));
  if (["reject","missing","alter"].includes(field)) return Math.max(0, n(snap.feed.qty) - n(snap.output.qty) - n(snap.ram));
  if (field === "alter_clear") return Math.max(0, n(snap.alter.qty));
  return entryOpenQty(row, stage, field);
}
function dprOpenActionRows(rows=[], { dept="all", field="all_movement", ledger=null, asOfDate=null, limit=800 }={}){
  const stages = dept === "all" ? STAGES.map(s=>s.key) : [dept];
  const fields = dprMovementFieldKeys(field);
  const out=[];
  (rows||[]).forEach(row=>{
    stages.forEach(stg=>{
      if (!routeFor(row).includes(stg)) return;
      fields.forEach(f=>{
        if (!ENTRY_FIELDS.some(x=>x.key===f)) return;
        const open = entryOpenQtyAsOf(row, stg, f, ledger, asOfDate);
        if (open <= 0) return;
        const ctx = asOfDate ? null : entryFieldContext(row, stg, f);
        const feedInfo = asOfDate ? (f === "issued" ? p0StrictFieldQtyAsOfDate(row, ledger, stg, "output", asOfDate) : p0StrictFeedAsOfDate(row, ledger, stg, asOfDate)) : { qty:ctx.available, hasLedger:true };
        const doneInfo = asOfDate ? (f === "issued" ? p0StrictFieldQtyAsOfDate(row, ledger, stg, "issued", asOfDate) : p0StrictFieldQtyAsOfDate(row, ledger, stg, f, asOfDate)) : { qty:ctx.previous, hasLedger:true };
        const feed = feedInfo.qty;
        const done = doneInfo.qty;
        const future = futureDependentLedgerEntries(row, ledger || [], stg, f, asOfDate);
        out.push({
          As_Of:asOfDate || "Current",
          Department:stageLabel(stg),
          Action:fieldLabel(f),
          Order:row.order_no,
          Style:row.style_no,
          Buyer:row.buyer,
          Colour:row.colour,
          Component:row.component,
          Open_Qty:open,
          Feed_or_Source:feed,
          Already_Done:done,
          Future_Entries:future.length || "—",
          P0_Status:future.length ? "Review if backdated" : (asOfDate && !feedInfo.hasLedger && stg !== "cutting" ? "Review missing dated feed" : "OK"),
          P0_Reading:future.length ? `Later activity already exists after ${asOfDate}. Backdated save/correction must go to Reconcile.` : (asOfDate && !feedInfo.hasLedger && stg !== "cutting" ? "No dated upstream issue/feed exists as-of selected date; treat as P0 review before posting." : (asOfDate ? "Date + quantity checked as-of selected date." : "Current open balance.")),
          Next_Action:f === "issued" ? `Issue/feed to ${stageLabel(routeFor(row)[routeFor(row).indexOf(stg)+1] || "next dept")}` : `${stageLabel(stg)} output entry pending`,
          _rowId:row.id,
          _rowKey:styleCompositeKey(row),
          _stageKey:stg,
          _fieldKey:f
        });
      });
    });
  });
  return out.sort((a,b)=>String(b.P0_Status).localeCompare(String(a.P0_Status)) || n(b.Open_Qty)-n(a.Open_Qty) || String(a.Department).localeCompare(String(b.Department))).slice(0, limit);
}
function rowReadyForTargetDept(row, targetDept){
  if (!targetDept || targetDept === "all") return true;
  return issueBuckets(row).some(b=>b.type === "completed_not_issued" && b.toStage === targetDept && n(b.qty)>0);
}

function QuickEntry({ rows, setRows, ledger, setLedger, focus=null, onRelease, onSharedSave }){
  const [stage, setStage] = useState(()=>safeJsonLoad(uiStorageKey("entry_stage"), "stitching"));
  const [field, setField] = useState(()=>safeJsonLoad(uiStorageKey("entry_field"), "output"));
  const [entryDate, setEntryDate] = useState(()=>safeJsonLoad(uiStorageKey("entry_date"), defaultEntryDate(ledger)));
  const [reason, setReason] = useState(()=>safeJsonLoad(uiStorageKey("entry_reason"), ""));
  const [entryLine, setEntryLine] = useState(()=>safeJsonLoad(uiStorageKey("entry_line"), productionLineNames()[0] || "STF-1"));
  const [draft, setDraft] = useState(()=>safeJsonLoad(uiStorageKey("entry_draft"), {}));
  const saveLockRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [correctRowId, setCorrectRowId] = useState(null);
  const [correctDraft, setCorrectDraft] = useState({});
  const [viewMode, setViewMode] = useState(()=>safeJsonLoad(uiStorageKey("entry_view_mode"), "date"));
  const [styleSearch, setStyleSearch] = useState("");
  const [selectedRowId, setSelectedRowId] = useState("");
  const [styleDeptFilter, setStyleDeptFilter] = useState("all");
  const [styleEditKey, setStyleEditKey] = useState(null);
  const [styleCorrectDraft, setStyleCorrectDraft] = useState({});
  const [styleCorrectReason, setStyleCorrectReason] = useState("");
  const [dprEditKey, setDprEditKey] = useState(null);
  const [dprCorrectDraft, setDprCorrectDraft] = useState({});
  const [dprCorrectReason, setDprCorrectReason] = useState("");
  const [lastSaveMsg, setLastSaveMsg] = useState(null);
  const operatorSimpleMode = isOperatorEntryMode();
  useEffect(()=>{ if (operatorSimpleMode && viewMode !== "date") setViewMode("date"); }, [operatorSimpleMode, viewMode]);
  useEffect(()=>{ if (operatorSimpleMode && ["reject","missing","alter","alter_clear","received"].includes(field)) { setField("output"); setDraft({}); } }, [operatorSimpleMode, field]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_stage"), stage), [stage]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_field"), field), [field]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_date"), entryDate), [entryDate]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_reason"), reason), [reason]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_line"), entryLine), [entryLine]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_draft"), draft), [draft]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_view_mode"), viewMode), [viewMode]);
  useEffect(()=>{
    if (!focus?.id) return;
    const nextStage = focus.stage || "cutting";
    const nextField = focus.field || "output";
    setStage(nextStage);
    setField(nextField);
    setDraft({});
    const match = rows.find(r=>String(r.id)===String(focus.rowId || "")) || (focus.rowKey ? rows.find(r=>styleCompositeKey(r)===focus.rowKey) : null);
    if (match) {
      setViewMode("style");
      setSelectedRowId(match.id);
      setStyleDeptFilter(nextStage || "all");
      setStyleSearch("");
    }
  }, [focus?.id, rows.length]);
  useEffect(()=>{ setCorrectRowId(null); setCorrectDraft({}); setDprEditKey(null); setDprCorrectDraft({}); setDprCorrectReason(""); }, [entryDate, stage, field]);
  useEffect(()=>{ setStyleEditKey(null); setStyleCorrectDraft({}); setStyleCorrectReason(""); }, [selectedRowId]);
  useEffect(()=>{ if (viewMode !== "style") { setSelectedRowId(""); setStyleEditKey(null); setStyleDeptFilter("all"); } }, [viewMode]);

  const entryStageIsAll = stage === "all";
  const entryFieldIsAll = field === "all_movement" || field === "all";
  const allStageRows = entryStageIsAll ? [] : rows.filter(r => routeFor(r).includes(stage));
  const activeRows = entryStageIsAll || entryFieldIsAll ? [] : allStageRows.filter(r => entryOpenQtyAsOf(r, stage, field, ledger, entryDate) > 0 || (stage === "cutting" && field === "output" && !isProductionFileReleased(r)));
  const dprDateActivityRows = dprEntryActivityRows(rows, ledger, { date:entryDate, dept:stage, field });
  const dprDeptActivityRows = dprEntryActivityRows(rows, ledger, { dept:stage, field, limit:800 });
  const dprOpenRowsForSelection = dprOpenActionRows(rows, { dept:stage, field, ledger, asOfDate:entryDate });

  function entryMapForRowDate(row, date){
    const matchType = String(entryTypeForField(field)).toLowerCase();
    const sizes = {};
    let total = 0;
    (ledger || []).forEach(e=>{
      if (!ledgerMatchesRow(e, row)) return;
      if (ledgerStage(e) !== stage) return;
      if (ledgerDate(e) !== date) return;
      if (ledgerType(e) !== matchType) return;
      const size = String(e.size || e.size_code || e.size_name || "").trim();
      if (!size) return;
      sizes[size] = n(sizes[size]) + n(e.qty ?? e.delta);
      total += n(e.qty ?? e.delta);
    });
    return { sizes, total };
  }
  function todayEntryMap(row){ return entryMapForRowDate(row, entryDate); }
  function fieldForEntryType(type){
    const t = String(type || "").toLowerCase();
    if (["good_output","output","completed","complete","done"].includes(t)) return "output";
    if (["issue","issued"].includes(t)) return "issued";
    if (["receive","received"].includes(t)) return "received";
    if (["reject","rejection"].includes(t)) return "reject";
    if (t === "missing") return "missing";
    if (t === "alter" || t === "alter_issue") return "alter";
    if (t === "alter_clear") return "alter_clear";
    return t || "output";
  }
  function styleHistoryRows(row, deptFilter="all"){
    const map = new Map();
    (ledger || []).forEach(e=>{
      if (!ledgerMatchesRow(e, row)) return;
      const date = ledgerDate(e); if (!date) return;
      const st = ledgerStage(e); if (!st) return;
      if (deptFilter !== "all" && st !== deptFilter) return;
      const type = ledgerType(e); if (!type) return;
      const key = `${date}|${st}|${type}`;
      if (!map.has(key)) map.set(key, { date, stage:st, type, sizes:{}, total:0 });
      const g = map.get(key);
      const size = String(e.size || e.size_code || e.size_name || "").trim();
      if (size) g.sizes[size] = n(g.sizes[size]) + n(e.qty ?? e.delta);
      g.total += n(e.qty ?? e.delta);
    });
    return Array.from(map.values()).sort((a,b)=> b.date.localeCompare(a.date) || stageLabel(a.stage).localeCompare(stageLabel(b.stage)) || registerActivityLabel(a.type).localeCompare(registerActivityLabel(b.type)));
  }
  const styleMatches = useMemo(()=>{
    const q = styleSearch.trim().toLowerCase();
    if (!q) return [];
    return rows.filter(r=>[r.style_no,r.order_no,r.buyer,r.colour,r.component].join(" ").toLowerCase().includes(q)).slice(0,30);
  }, [rows, styleSearch]);
  const selectedStyleRow = rows.find(r=>r.id===selectedRowId) || null;
  const selectedStyleHistory = selectedStyleRow ? styleHistoryRows(selectedStyleRow, styleDeptFilter) : [];
  const selectedStyleDeptOptions = selectedStyleRow ? routeFor(selectedStyleRow) : [];
  const selectedStyleSizes = selectedStyleRow ? sizesFor(selectedStyleRow) : [];
  const selectedStyleValidation = selectedStyleRow && entryDate ? validateDailyEntry(selectedStyleRow, stage, field, (r,size)=>getDailyEntryQty(()=>draft[`${selectedStyleRow.id}|${size}`], r, size), ledger, entryDate) : null;
  function findStyleFromDprRow(raw){
    return rows.find(r=>String(r.id)===String(raw?._rowId || ""))
      || (raw?._rowKey ? rows.find(r=>styleCompositeKey(r)===raw._rowKey) : null)
      || rows.find(r=>String(r.order_no||"")===String(raw?.Order||"") && String(r.style_no||"")===String(raw?.Style||"") && String(r.colour||"")===String(raw?.Colour||"") && String(r.component||"")===String(raw?.Component||""))
      || null;
  }
  function openDprHistoryForEdit(raw){
    const row = findStyleFromDprRow(raw);
    if (!row) { alert("Could not find the style row for this DPR entry."); return; }
    const stg = raw?._stageKey || stage;
    const typ = raw?._entryType || entryTypeForField(field);
    const dt = raw?.Date || raw?.date || "";
    setViewMode("style");
    setSelectedRowId(row.id);
    setStyleSearch("");
    setStyleDeptFilter(stg || "all");
    setStage(stg || "stitching");
    setField(fieldForEntryType(typ));
    if (dt) setEntryDate(dt);
    const g = styleHistoryRows(row, stg || "all").find(x=>String(x.date)===String(dt) && String(x.stage)===String(stg) && String(x.type).toLowerCase()===String(typ).toLowerCase());
    if (g) beginStyleCorrection(row, g);
  }
  function openDprOpenRowForEntry(raw){
    const row = findStyleFromDprRow(raw);
    if (!row) { alert("Could not find the style row for this open balance."); return; }
    const stg = raw?._stageKey || stage;
    const f = raw?._fieldKey || field;
    setViewMode("style");
    setSelectedRowId(row.id);
    setStyleSearch("");
    setStyleDeptFilter(stg || "all");
    setStage(stg || "stitching");
    setField(f || "output");
    setStyleEditKey(null);
  }
  function dprActivityKey(raw){
    return [raw?._rowKey || raw?._rowId || raw?.Style || "", raw?.Date || "", raw?._stageKey || raw?.Department || "", raw?._entryType || raw?.Action || ""].join("|::|");
  }
  function dprActivityGroup(raw){
    return {
      date:raw?.Date || "",
      stage:raw?._stageKey || stage,
      type:raw?._entryType || entryTypeForField(fieldForEntryType(raw?._entryType || field)),
      sizes:{ ...(raw?._sizes || {}) },
      total:n(raw?.Net_Total ?? raw?.Total)
    };
  }
  function dprActivityHasSizeSplit(raw){
    return Object.values(raw?._sizes || {}).some(v=>n(v)!==0);
  }
  function dprActivityEditableSizeKeys(row, raw){
    const fromEntry = Object.keys(raw?._sizes || {}).filter(k=>n((raw?._sizes || {})[k])!==0 || (raw?._sizes || {})[k]!==undefined);
    const fromMaster = row ? sizesFor(row) : [];
    const seen = new Set();
    const out = [];
    [...fromEntry, ...fromMaster].forEach(k=>{ const key=String(k); if (!seen.has(key)) { seen.add(key); out.push(key); } });
    return out;
  }
  function beginDprInlineCorrection(raw){
    const row = findStyleFromDprRow(raw);
    if (!row) { alert("Could not find the style row for this DPR entry."); return; }
    const key = dprActivityKey(raw);
    const nd = {};
    if (dprActivityHasSizeSplit(raw)) dprActivityEditableSizeKeys(row, raw).forEach(sz=>{ if (n((raw._sizes||{})[sz])) nd[`${key}|${sz}`] = String(n((raw._sizes||{})[sz])); });
    else nd[`${key}|__total__`] = String(n(raw?.Net_Total ?? raw?.Total));
    setDprCorrectDraft(nd);
    setDprCorrectReason("");
    setDprEditKey(key);
  }
  function dprCorrectVal(key, size){ const k = `${key}|${size}`; return dprCorrectDraft[k] !== undefined ? dprCorrectDraft[k] : ""; }
  function setDprCorrectVal(key, size, val){ setDprCorrectDraft(d=>({ ...d, [`${key}|${size}`]: String(val).replace(/[^0-9-]/g,"").replace(/(?!^)-/g,"") })); }
  async function saveDprInlineCorrection(raw){
    const row = findStyleFromDprRow(raw);
    if (!row) { alert("Could not find the style row for this DPR entry."); return; }
    const key = dprActivityKey(raw);
    const correctionStage = raw?._stageKey || stage;
    const correctionType = raw?._entryType || entryTypeForField(field);
    const correctionField = fieldForEntryType(correctionType);
    const correctionDate = raw?.Date || entryDate;
    const hasSplit = dprActivityHasSizeSplit(raw);
    let changes;
    if (!hasSplit) {
      const oldQty = n(raw?.Net_Total ?? raw?.Total);
      const rawNext = dprCorrectDraft[`${key}|__total__`];
      const newQty = rawNext === undefined ? oldQty : n(rawNext);
      const delta = newQty - oldQty;
      changes = delta ? [{ row, size:"", oldQty, newQty, delta }] : [];
    } else {
      changes = dprActivityEditableSizeKeys(row, raw).map(size=>{
        const oldQty = n((raw._sizes||{})[size]);
        const rawNext = dprCorrectDraft[`${key}|${size}`];
        const newQty = rawNext === undefined ? oldQty : n(rawNext);
        const delta = newQty - oldQty;
        if (!delta) return null;
        return { row, size, oldQty, newQty, delta };
      }).filter(Boolean);
    }
    if (!changes.length) { alert("No change made to this DPR row."); return; }
    const sizeGate = entrySizeGateMessages(changes, { allowNegativeLegacy:true });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    if (!String(dprCorrectReason||"").trim()) { alert("Reason is required to correct an old DPR entry."); return; }
    const summary = changes.map(c=>`${c.size||"Total"}: ${fmt(c.oldQty)} -> ${fmt(c.newQty)}`).join("\n");
    if (!window.confirm(`Correct this row directly in ${viewMode === "dept" ? "Dept View" : "Date View"}?

${correctionDate} · ${stageLabel(correctionStage)} · ${registerActivityLabel(correctionType)} · ${row.style_no}

${summary}

Only the difference is saved as an audit-safe correction; original history remains visible.`)) return;
    const newLedger = buildLedgerRows({ changes, stage:correctionStage, field:correctionField, entryDate:correctionDate, reason:dprCorrectReason, source:"dpr_inline_view_correction" });
    const sharedResult = await saveLedgerToSupabase(newLedger, correctionField);
    if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
      const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
      if (!window.confirm(`Shared Supabase save did not confirm: ${msg}

Save locally in this browser anyway?`)) return;
    }
    const totalDelta = changes.reduce((a,c)=>a+n(c.delta),0);
    const deltaMap = Object.fromEntries(changes.filter(c=>c.size).map(c=>[c.size, c.delta]));
    const getValForApply = hasSplit ? (r,size)=>n(deltaMap[size]) : (r,size)=>{ const list=sizesFor(r); return size===list[0] ? totalDelta : 0; };
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage:correctionStage, field:correctionField, getVal:getValForApply }));
    setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
    setDprEditKey(null);
    setDprCorrectDraft({});
    setDprCorrectReason("");
    setLastSaveMsg({ tone:"ok", text:`Corrected: ${row.style_no} · ${stageLabel(correctionStage)} · ${registerActivityLabel(correctionType)} · ${correctionDate}` });
    onSharedSave?.(sharedResult, "DPR inline view correction");
  }
  function styleCorrectVal(key, size){ const k = `${key}|${size}`; return styleCorrectDraft[k] !== undefined ? styleCorrectDraft[k] : ""; }
  function setStyleCorrectVal(key, size, val){ setStyleCorrectDraft(d=>({ ...d, [`${key}|${size}`]: String(val).replace(/[^0-9-]/g,"").replace(/(?!^)-/g,"") })); }
  function groupKeyOf(g){ return `${g.date}|${g.stage}|${g.type}`; }
  function groupHasSizeSplit(g){ return Object.values(g.sizes || {}).some(v=>n(v)!==0); }
  function editableSizeKeys(row, g){
    // Sizes that actually exist in this entry (may be legacy/mismatched names) come first,
    // then any style-master sizes not already present. This guarantees a box for every real
    // stored value, even when the ledger used a different size scheme than the style now has.
    const fromEntry = Object.keys(g.sizes || {}).filter(k=>n(g.sizes[k])!==0 || g.sizes[k]!==undefined);
    const fromMaster = sizesFor(row);
    const seen = new Set();
    const out = [];
    [...fromEntry, ...fromMaster].forEach(k=>{ const key=String(k); if (!seen.has(key)) { seen.add(key); out.push(key); } });
    return out;
  }
  async function voidStyleEntry(row, g){
    const field = fieldForEntryType(g.type);
    const hasSplit = groupHasSizeSplit(g);
    // Build reversal changes: cancel every size that has a value, or the lump total if size-less.
    const changes = hasSplit
      ? editableSizeKeys(row, g).filter(sz=>n(g.sizes[sz])!==0).map(sz=>{ const oldQty=n(g.sizes[sz]); return { row, size:sz, oldQty, newQty:0, delta:-oldQty }; })
      : [{ row, size:"", oldQty:n(g.total), newQty:0, delta:-n(g.total) }];
    if (!changes.length || changes.every(c=>!c.delta)) { alert("Nothing to delete — this entry is already zero."); return; }
    const sizeGate = entrySizeGateMessages(changes, { allowNegativeLegacy:true });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    const reAdds = n(g.total) < 0;
    const warnLine = reAdds
      ? `\nNOTE: this entry is NEGATIVE (${fmt(g.total)}) — it is itself a reversal/correction. Deleting it will ADD ${fmt(Math.abs(g.total))} back into WIP. Only do this if the reversal was a mistake.\n`
      : "";
    if (!window.confirm(`DELETE / VOID this entry?\n\n${g.date} · ${stageLabel(g.stage)} · ${registerActivityLabel(g.type)} for ${row.style_no}\nCurrent total: ${fmt(g.total)}\n${warnLine}\nThis posts a reversal that cancels it to zero and adjusts WIP accordingly. The original entry and this reversal both stay visible in Register for audit — production data is never silently erased. Continue?`)) return;
    const reason = window.prompt("Reason for deleting/voiding this entry (required):", "Wrong entry / duplicate — voided from style view") || "";
    if (!reason.trim()) { alert("A reason is required to void an entry."); return; }
    const newLedger = buildLedgerRows({ changes, stage:g.stage, field, entryDate:g.date, reason:reason.trim(), source:"dpr_style_view_void" });
    const sharedResult = await saveLedgerToSupabase(newLedger, field);
    if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
      const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
      if (!window.confirm(`Shared Supabase save did not confirm: ${msg}\n\nSave locally in this browser anyway?`)) return;
    }
    const deltaMap = Object.fromEntries(changes.filter(c=>c.size).map(c=>[c.size, c.delta]));
    const totalDelta = changes.reduce((a,c)=>a+n(c.delta),0);
    const getValForApply = hasSplit ? (r,size)=>n(deltaMap[size]) : (r,size)=>{ const list=sizesFor(r); return size===list[0] ? totalDelta : 0; };
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage:g.stage, field, getVal:getValForApply }));
    setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
    setStyleEditKey(null);
    onSharedSave?.(sharedResult, "DPR entry void");
  }
  function beginStyleCorrection(row, g){
    const key = groupKeyOf(g);
    const nd = {};
    if (groupHasSizeSplit(g)) editableSizeKeys(row, g).forEach(sz=>{ if (n(g.sizes[sz])) nd[`${key}|${sz}`] = String(n(g.sizes[sz])); });
    else nd[`${key}|__total__`] = String(n(g.total));
    setStyleCorrectDraft(nd);
    setStyleCorrectReason("");
    setStyleEditKey(key);
  }
  async function saveStyleCorrection(row, g){
    const key = groupKeyOf(g);
    const field = fieldForEntryType(g.type);
    const hasSplit = groupHasSizeSplit(g);
    let changes;
    if (!hasSplit) {
      const oldQty = n(g.total);
      const raw = styleCorrectDraft[`${key}|__total__`];
      const newQty = raw === undefined ? oldQty : n(raw);
      const delta = newQty - oldQty;
      changes = delta ? [{ row, size:"", oldQty, newQty, delta }] : [];
    } else {
      changes = editableSizeKeys(row, g).map(size=>{
        const oldQty = n(g.sizes[size]);
        const raw = styleCorrectDraft[`${key}|${size}`];
        const newQty = raw === undefined ? oldQty : n(raw);
        const delta = newQty - oldQty;
        if (!delta) return null;
        return { row, size, oldQty, newQty, delta };
      }).filter(Boolean);
    }
    if (!changes.length) { alert("No change made to this entry."); return; }
    const sizeGate = entrySizeGateMessages(changes, { allowNegativeLegacy:true });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    if (!String(styleCorrectReason||"").trim()) { alert("Reason is required to correct a past entry."); return; }
    const summary = changes.map(c=>`${c.size||"Total"}: ${fmt(c.oldQty)} -> ${fmt(c.newQty)}`).join("\n");
    if (!window.confirm(`Update ${g.date} · ${stageLabel(g.stage)} · ${registerActivityLabel(g.type)} for ${row.style_no}?\n\n${summary}\n\nOnly the difference is saved as an audit-safe correction; the original entry stays visible in Register history.`)) return;
    const newLedger = buildLedgerRows({ changes, stage:g.stage, field, entryDate:g.date, reason:styleCorrectReason, source:"dpr_style_view_correction" });
    const sharedResult = await saveLedgerToSupabase(newLedger, field);
    if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
      const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
      if (!window.confirm(`Shared Supabase save did not confirm: ${msg}\n\nSave locally in this browser anyway?`)) return;
    }
    const totalDelta = changes.reduce((a,c)=>a+n(c.delta),0);
    const deltaMap = Object.fromEntries(changes.filter(c=>c.size).map(c=>[c.size, c.delta]));
    const getValForApply = hasSplit ? (r,size)=>n(deltaMap[size]) : (r,size)=>{ const list=sizesFor(r); return size===list[0] ? totalDelta : 0; };
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage:g.stage, field, getVal:getValForApply }));
    setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
    setStyleEditKey(null);
    setStyleCorrectDraft({});
    setStyleCorrectReason("");
    onSharedSave?.(sharedResult, "DPR style-view correction");
  }

  const activeIds = new Set(activeRows.map(r=>r.id));
  const todayExtraRows = allStageRows.filter(r => !activeIds.has(r.id) && todayEntryMap(r).total !== 0);
  const displayRows = [...activeRows, ...todayExtraRows];

  const risk = backdateRisk(entryDate);
  const allSizes = Array.from(new Set(displayRows.flatMap(sizesFor)));
  function getVal(row, size){ const key = `${row.id}|${size}`; return draft[key] !== undefined ? draft[key] : ""; }
  function setVal(row, size, val){ setDraft(d => ({ ...d, [`${row.id}|${size}`]: cappedEntryInputValue(row, stage, field, size, val) })); }
  function validate(row){ return validateDailyEntry(row, stage, field, getVal, ledger, entryDate); }
  function fillRowOpen(row){ setDraft(d=>{ const nd={...d}; sizesFor(row).forEach(sz=>{ nd[`${row.id}|${sz}`]=String(Math.max(0,n(entryFieldSizeContext(row,stage,field,sz).open))); }); return nd; }); }
  function clearRow(row){ setDraft(d=>{ const nd={...d}; sizesFor(row).forEach(sz=>delete nd[`${row.id}|${sz}`]); return nd; }); }
  function fillAllOpen(){ setDraft(d=>{ const nd={...d}; activeRows.forEach(row=>sizesFor(row).forEach(sz=>{ nd[`${row.id}|${sz}`]=String(Math.max(0,n(entryFieldSizeContext(row,stage,field,sz).open))); })); return nd; }); }
  async function save(){
    if (saveLockRef.current) { notify("Save already in progress. Please wait.", "Duplicate save blocked"); return; }
    const changed = activeRows.flatMap(row => dailySizeRows(row, stage, field, getVal, ledger, entryDate));
    const sizeGate = entrySizeGateMessages(changed, { allowNegativeLegacy:false });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    const validationRows = activeRows.map(r=>({ row:r, validation:validate(r) })).filter(x=>x.validation.entryTotal);
    const hardBlocked = validationRows.filter(x=>hardBlockMessages(x.validation).length);
    if (hardBlocked.length) { alert(`Blocked: ${hardBlocked.length} row(s) have impossible quantity sequence: ${hardBlocked.map(x=>`${x.row.style_no}: ${hardBlockMessages(x.validation).join(", ")}`).slice(0,3).join(" | ")}. Correct upstream/opening stock or create approved adjustment first.`); return; }
    const p0Rows = validationRows.filter(x=>x.validation.p0DateViolation);
    if (p0Rows.length && !String(reason||"").trim()) { alert("P0 date-sequence override needs a reason. It will appear in Reconcile Review."); return; }
    if (p0Rows.length) {
      const msg = p0Rows.slice(0,5).map(x=>`${x.row.style_no}: ${p0DateViolationText(x.validation,2)}`).join("\n");
      if (!window.confirm(`P0 DATE-SEQUENCE VIOLATION\n\n${p0Rows.length} row(s) are dated before enough upstream/same-department quantity.\n\n${msg}\n\nConfirm override? These entries will save as reconcile exceptions until corrected from Register.`)) return;
    }
    if (!changed.length) { alert("No new size-wise quantity entered."); return; }
    if (!confirmEntryChecks({ entryDate, changes:changed, stage, field, reason })) return;
    saveLockRef.current = true;
    setIsSaving(true);
    try {
      const override = p0Rows.length ? { validation_status:"p0_date_sequence_override", validation_scope:"p0_date_sequence_confirmed_reconcile", validation_messages:p0Rows.flatMap(x=>x.validation.dateMessages || []), requires_reconcile:true } : null;
      const newLedger = buildLedgerRows({ changes:changed, stage, field, entryDate, reason, source:"dpr_quick_entry", line: stage === "stitching" ? entryLine : "", validationOverride:override });
      const sharedResult = await saveLedgerToSupabase(newLedger, field);
      if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
        const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
        if (!window.confirm(`Shared Supabase save did not confirm: ${msg}\n\nSave locally in this browser anyway? Other users will not see it until Supabase is fixed/synced.`)) return;
      }
      setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:activeRows, stage, field, getVal }));
      setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
      setDraft({});
      setLastSaveMsg({ tone:"ok", text:`Saved: ${fmt(newLedger.reduce((a,e)=>a+n(e.qty),0))} pcs · ${stageLabel(stage)} · ${fieldLabel(field)} · ${entryDate}` });
      onSharedSave?.(sharedResult, "DPR day entry");
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }

  async function saveSelectedStyleDayEntry(){
    if (!entryDate) { alert("Choose entry date before saving this style. Date is optional only for review tables."); return; }
    if (entryStageIsAll || entryFieldIsAll) { alert("Choose one department and one action before saving this style."); return; }
    const row = selectedStyleRow;
    if (!row) { alert("Choose a style first."); return; }
    if (saveLockRef.current) { notify("Save already in progress. Please wait.", "Duplicate save blocked"); return; }
    const changed = dailySizeRows(row, stage, field, getVal, ledger, entryDate);
    const sizeGate = entrySizeGateMessages(changed, { allowNegativeLegacy:false });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    const validation = validate(row);
    const hardMessages = hardBlockMessages(validation);
    if (hardMessages.length) { alert(`Blocked: ${hardMessages.join("; ")}. Correct upstream/opening stock or create approved adjustment first.`); return; }
    if (validation.p0DateViolation && !String(reason||"").trim()) { alert("P0 date-sequence override needs a reason. It will appear in Reconcile Review."); return; }
    if (validation.p0DateViolation && !confirmP0DateViolation({ validation, entryDate, stage, field, reason })) return;
    if (!changed.length) { alert("No new size-wise quantity entered for this style."); return; }
    if (!confirmEntryChecks({ entryDate, changes:changed, stage, field, reason })) return;
    saveLockRef.current = true;
    setIsSaving(true);
    try {
      const override = validation.p0DateViolation ? validationOverrideForP0(validation) : null;
      const newLedger = buildLedgerRows({ changes:changed, stage, field, entryDate, reason, source:"dpr_style_view_new_entry", line: stage === "stitching" ? entryLine : "", validationOverride:override });
      const sharedResult = await saveLedgerToSupabase(newLedger, field);
      if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
        const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
        if (!window.confirm(`Shared Supabase save did not confirm: ${msg}\n\nSave locally in this browser anyway? Other users will not see it until Supabase is fixed/synced.`)) return;
      }
      setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage, field, getVal }));
      setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
      clearRow(row);
      setLastSaveMsg({ tone:"ok", text:`Saved: ${fmt(newLedger.reduce((a,e)=>a+n(e.qty),0))} pcs · ${row.style_no} · ${stageLabel(stage)} · ${fieldLabel(field)} · ${entryDate}` });
      onSharedSave?.(sharedResult, "DPR style-view new entry");
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }

  function beginCorrection(row){
    const map = todayEntryMap(row);
    const nd = {};
    sizesFor(row).forEach(sz=>{ if (map.sizes[sz]) nd[`${row.id}|${sz}`] = String(map.sizes[sz]); });
    setCorrectDraft(d=>({ ...d, ...nd }));
    setCorrectRowId(row.id);
  }
  function correctVal(row, size){ const key = `${row.id}|${size}`; return correctDraft[key] !== undefined ? correctDraft[key] : ""; }
  function setCorrectVal(row, size, val){ setCorrectDraft(d=>({ ...d, [`${row.id}|${size}`]: String(val).replace(/[^0-9]/g,"") })); }
  async function saveCorrection(row){
    if (!entryDate) { alert("Choose a date to edit today's/date entry, or use Style view history to edit a past entry."); return; }
    const map = todayEntryMap(row);
    const sizes = sizesFor(row);
    const changes = sizes.map(size=>{
      const oldQty = n(map.sizes[size]);
      const raw = correctDraft[`${row.id}|${size}`];
      const newQty = raw === undefined ? oldQty : n(raw);
      const delta = newQty - oldQty;
      if (!delta) return null;
      return { row, size, oldQty, newQty, delta };
    }).filter(Boolean);
    if (!changes.length) { alert("No change made to today's entry."); return; }
    const sizeGate = entrySizeGateMessages(changes, { allowNegativeLegacy:true });
    if (sizeGate.length) { alert(`Blocked by size master gate:

${sizeGate.slice(0,8).join("\n")}`); return; }
    const summary = changes.map(c=>`${c.size}: ${fmt(c.oldQty)} -> ${fmt(c.newQty)}`).join("\n");
    if (!window.confirm(`Update ${entryDate} · ${stageLabel(stage)} · ${fieldLabel(field)} for ${row.style_no}?\n\n${summary}\n\nOnly the difference is saved as an audit-safe correction; the original entry stays visible in Register history.`)) return;
    const newLedger = buildLedgerRows({ changes, stage, field, entryDate, reason: reason || "DPR quick-entry edit", source:"dpr_quick_entry_correction" });
    const sharedResult = await saveLedgerToSupabase(newLedger, field);
    if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
      const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
      if (!window.confirm(`Shared Supabase save did not confirm: ${msg}\n\nSave locally in this browser anyway? Other users will not see it until Supabase is fixed/synced.`)) return;
    }
    const deltaMap = Object.fromEntries(changes.map(c=>[c.size, c.delta]));
    const getValForApply = (r, size)=> n(deltaMap[size]);
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage, field, getVal:getValForApply }));
    setLedger(prev => mergeLedgerPrependUnique(prev, newLedger));
    setCorrectRowId(null);
    setCorrectDraft({});
    onSharedSave?.(sharedResult, "DPR entry correction");
  }

  function DprActivityEditableTable({ title, sub, rows:activityRows, empty }){
    const raw = Array.isArray(activityRows) ? activityRows : [];
    const cols = ["Date","Department","Action","Style","Colour","Component","Net_Total","Size_Breakup","Posting"];
    return <div className="mt-card mt-readable-table mt-readable-feed">
      <div className="mt-section"><h3 className="mt-panel-title">{title}</h3><div className="mt-panel-sub">{sub}</div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{friendlyTableHeader(c)}</th>)}<th className="no-print">Edit here</th></tr></thead><tbody>
        {raw.length ? raw.map((r,i)=>{
          const key = dprActivityKey(r);
          const row = findStyleFromDprRow(r);
          const isEditing = dprEditKey === key;
          return <React.Fragment key={key || i}>
            <tr>
              {cols.map(c=>{ const val=r[c]; return <td key={c} className={simpleTableCellTone(c,val)}>{typeof val === "number" ? fmt(val) : String(val === undefined || val === null ? "" : val)}</td>; })}
              <td className="no-print"><button className={`mt-btn ${isEditing?"active":"ghost"}`} onClick={(e)=>{e.stopPropagation(); isEditing ? setDprEditKey(null) : beginDprInlineCorrection(r);}}>{isEditing ? "Close" : "Correct"}</button></td>
            </tr>
            {isEditing && <tr className="mt-correction-row"><td colSpan={cols.length+1}>
              <div className="mt-inline-correction">
                <div className="mt-correction-head"><b>Correct here: {r.Date} · {r.Department} · {r.Action}</b><span className="mt-small">No Style View jump. Enter corrected final quantity by size; system saves only the difference as an audit correction.</span></div>
                <div className="mt-correction-controls"><label>Reason <input className="mt-input" value={dprCorrectReason} onChange={e=>setDprCorrectReason(e.target.value)} placeholder="Correction reason" style={{minWidth:260}}/></label><button className="mt-btn primary" onClick={()=>saveDprInlineCorrection(r)}><CheckCircle2 size={14}/>Save correction</button><button className="mt-btn ghost" onClick={()=>setDprEditKey(null)}>Cancel</button></div>
                <div className="mt-correction-grid">
                  {!dprActivityHasSizeSplit(r) ? (()=>{
                    const oldQty = n(r.Net_Total ?? r.Total);
                    const nextQty = n(dprCorrectVal(key, "__total__") || 0);
                    const delta = nextQty - oldQty;
                    return <div className="mt-correction-size"><div className="sz">Total</div><div className="mt-small">Old {fmt(oldQty)}</div><input className="mt-cell-input" style={{width:"100%"}} value={dprCorrectVal(key,"__total__")} onChange={e=>setDprCorrectVal(key,"__total__",e.target.value)} placeholder="Correct qty"/><div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div></div>;
                  })() : dprActivityEditableSizeKeys(row, r).map(sz=>{
                    const oldQty = n((r._sizes||{})[sz]);
                    const nextQty = n(dprCorrectVal(key, sz) || 0);
                    const delta = nextQty - oldQty;
                    const masterSizes = new Set((row ? sizesFor(row) : []).map(x=>String(x).toUpperCase()));
                    const isMaster = masterSizes.has(String(sz).toUpperCase());
                    return <div className="mt-correction-size" key={sz || "__blank__"}><div className="sz">{sz || "(no size)"}</div><div className="mt-small">Old {fmt(oldQty)} {isMaster ? "" : "· not in style size set"}</div><input className="mt-cell-input" style={{width:"100%"}} value={dprCorrectVal(key, sz)} onChange={e=>setDprCorrectVal(key, sz, e.target.value)} placeholder="Correct qty"/><div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div></div>;
                  })}
                </div>
              </div>
            </td></tr>}
          </React.Fragment>;
        }) : <tr><td colSpan={cols.length+1} style={{padding:18}}>{empty}</td></tr>}
      </tbody></table></div>
    </div>;
  }

  const totalOpenForField = activeRows.reduce((a,row)=>a+entryOpenQtyAsOf(row, stage, field, ledger, entryDate),0);
  const totalNewEntry = activeRows.reduce((a,row)=>a+validate(row).entryTotal,0);
  const totals = entryContextTotals(activeRows, stage, field);
  const remainingAfter = Math.max(0, totalOpenForField - totalNewEntry);

  return <div className="mt-card">
    <div className="mt-section">
      <h3 className="mt-panel-title">DPR Quick Entry</h3>
      <div className="mt-panel-sub">{stageLabel(stage)} · {fieldLabel(field)} {entryDate ? `for ${entryDate}` : "across all dates"}. Date is optional for review; choose a date only when posting/saving a DPR entry. {operatorSimpleMode ? "Operator mode shows only the core entry task: date, department, style rows, size numbers and save confirmation." : "Rows in Date/Dept views are directly editable inline; Style View is only for full style-level detail."}</div>
      {operatorSimpleMode && <span className="mt-chip mt-info">Operator-safe mode</span>}
      {lastSaveMsg && <div className={`mt-save-banner ${lastSaveMsg.tone === "warn" ? "warn" : ""}`}><CheckCircle2 size={16}/>{lastSaveMsg.text}</div>}
    </div>
    <div className="mt-section no-print">
      <div className="mt-toolbar">
        <span className="mt-toolbar-label">Date</span>
        <input className="mt-input mt-entry-date" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} />
        <button className="mt-btn ghost" onClick={()=>setEntryDate("")}>All dates</button>
        <button className="mt-btn ghost" onClick={()=>setEntryDate(today())}>Today</button>
        <span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span>
        <span className="mt-toolbar-label">Dept</span>
        <select className="mt-select" value={stage} onChange={e=>{setStage(e.target.value); setDraft({});}}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select>
        <span className="mt-toolbar-label">Action</span>
        <select className="mt-select" value={field} onChange={e=>{setField(e.target.value); setDraft({});}}><option value="all_movement">All issued / completed</option>{(ENTRY_FIELDS.some(f=>f.key===field) ? ENTRY_FIELDS : [{key:field,label:fieldLabel(field)}, ...ENTRY_FIELDS]).map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select>
        {stage === "stitching" && <><span className="mt-toolbar-label">Line</span><select className="mt-select" value={entryLine} onChange={e=>setEntryLine(e.target.value)}>{productionLineNames().map(l=><option key={l} value={l}>{l}</option>)}</select></>}
        <button className="mt-btn" onClick={fillAllOpen}>Auto-fill all open</button>
        <button className="mt-btn primary" onClick={save} disabled={isSaving}><CheckCircle2 size={14}/>{isSaving ? "Saving..." : "Save Day Entry"}</button>
      </div>
      {!operatorSimpleMode && <details className="mt-fold" style={{marginTop:8}}>
        <summary>More: Rejection / Missing / Alter rows, backdate reason</summary>
        <div style={{padding:12}}>
          <div className="mt-ram-action-bar"><span className="mt-toolbar-label">R/A/M closure rows</span>{RAM_ENTRY_FIELDS.map(f=><button key={f.key} className={`mt-btn ghost ${field===f.key?"active":""}`} onClick={()=>{setField(f.key); setDraft({});}}>{f.label}</button>)}</div>
          {risk.days>1 && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate reason optional/report flag" style={{minWidth:240, marginTop:8}}/>}
        </div>
      </details>}
      {entryDate && risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated entries are report flags only. Quantity/feed/P0 sequence clashes still appear in Reconcile Review.</div>}
      {stage === "cutting" && field === "output" && activeRows.some(r=>!isProductionFileReleased(r)) ? <div className="mt-release-card no-print"><div className="title">Production file release needed</div><div className="mt-small">Rows below with 0 open are not released yet. Click Release File beside the style; cutting output stays blocked until release.</div></div> : null}
      {!operatorSimpleMode && <div className="mt-toggle-row" style={{marginTop:8}}>
        <span className="mt-toolbar-label">View</span>
        <button className={`mt-btn ${viewMode==="date"?"active":"ghost"}`} onClick={()=>setViewMode("date")}>Date view</button>
        <button className={`mt-btn ${viewMode==="dept"?"active":"ghost"}`} onClick={()=>setViewMode("dept")}>Dept view</button>
        <button className={`mt-btn ${viewMode==="style"?"active":"ghost"}`} onClick={()=>setViewMode("style")}>Style view</button>
        {viewMode==="style" && <span className="mt-small">Pick a style below to see its entire history — every department, every action, every date — with edit anywhere.</span>}
      </div>}
      {entryDate ? <details className="mt-fold" style={{marginTop:8}}>
        <summary><span>Day-close summary for {entryDate}</span><span className="mt-chip mt-muted">{dayCloseSummaryRows(ledger, entryDate).length} activity rows</span></summary>
        <div className="mt-plan-collapse-body"><SimpleTable title={`Day Close — ${entryDate}`} sub="Human reconciliation point: review what was entered today before closing the day." rows={dayCloseSummaryRows(ledger, entryDate)} empty="No DPR rows saved for this date yet." /></div>
      </details> : <div className="mt-speed-note" style={{marginTop:8}}>All dates review mode. Pick a date only when saving a new DPR entry or reviewing day close.</div>}
    </div>
    {viewMode === "dept" ? <div className="mt-section">
      <DprActivityEditableTable title={`${stage === "all" ? "All departments" : stageLabel(stage)} DPR history`} sub="Dept view: posted entries across dates. Open balances below are date/quantity checked as-of selected date when a date is chosen; future ledger impact is flagged for Review." rows={dprDeptActivityRows} empty="No entries match this department/action filter." />
    </div> : viewMode === "date" ? <>
    <div className="mt-section">
      <DprActivityEditableTable title={entryDate ? `Entered on ${entryDate}` : "Entered across all dates"} sub="First check: entries already posted for the selected date/dept/action filter. Date can be blank for all dates. Correct old entries directly here, even if that row already includes earlier correction/reversal entries." rows={dprDateActivityRows} empty="No entries posted yet for this filter." />
    </div>
    {entryStageIsAll || entryFieldIsAll ? <div className="mt-section"><SimpleTable title="Open to complete / issue" sub="Open balances follow P0 date + quantity rules. With a selected date, feed/output/issue are calculated as-of that date, and later entries are flagged for Reconcile review." rows={dprOpenRowsForSelection} empty="No open movement balances for this filter." onRowClick={openDprOpenRowForEntry} /></div> : null}
    {entryStageIsAll || entryFieldIsAll ? null : <>
    <div className="mt-entry-summary">
      <span><b>{displayRows.length}</b> rows <span className="sep">·</span> {activeRows.length} open{todayExtraRows.length ? `, ${todayExtraRows.length} already done today` : ""}</span>
      <span className="sep">|</span>
      <span>Open <b>{fmt(totalOpenForField)}</b></span>
      <span>New <b>{fmt(totalNewEntry)}</b></span>
      <span>Remaining after <b>{fmt(remainingAfter)}</b></span>
      <details style={{marginLeft:"auto"}}>
        <summary className="mt-small" style={{cursor:"pointer"}}>Cross-check totals</summary>
        <div className="mt-small" style={{marginTop:6}}>Available/source {fmt(totals.available)} · Already entered before today {fmt(totals.previous)} · Cumulative after {fmt(totals.previous + totalNewEntry)}</div>
      </details>
    </div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style / Order</th><th>Open</th>{allSizes.map(sz=><th key={sz}>{sz}</th>)}<th>New</th><th>Remaining</th><th>Status</th></tr></thead><tbody>
      {displayRows.length ? displayRows.map(row=>{
        const sizes = sizesFor(row);
        const v = validate(row);
        const ctx = entryFieldContext(row, stage, field);
        const rowNew = v.entryTotal;
        const rowRemaining = Math.max(0, n(ctx.open) - rowNew);
        const todayMap = todayEntryMap(row);
        const isCorrecting = correctRowId === row.id;
        return <React.Fragment key={row.id}>
        <tr className={todayMap.total ? "mt-subrow" : ""}>
          <td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>
            {todayMap.total ? <div className="mt-today-badge">Entered today: {fmt(todayMap.total)}</div> : null}
            <div className="mt-entry-row-actions">
              {stage === "cutting" && !isProductionFileReleased(row) ? <button className="mt-btn primary" onClick={()=>onRelease?.(row, "dpr_entry")}>Release File</button> : <button className="mt-btn" onClick={()=>fillRowOpen(row)}>Fill open</button>}
              <button className="mt-btn ghost" onClick={()=>clearRow(row)}>Clear</button>
              {!operatorSimpleMode && todayMap.total ? <button className={`mt-btn ghost ${isCorrecting?"active":""}`} onClick={()=>isCorrecting?setCorrectRowId(null):beginCorrection(row)}>{isCorrecting?"Close edit":"Edit today's entry"}</button> : null}
            </div>
          </div></div></td>
          <td><div className="mt-open-big">{fmt(ctx.open)}</div></td>
          {allSizes.map(sz=> sizes.includes(sz) ? <td key={sz} className="mt-entry-size-cell">
            {(()=>{ const szCtx=entryFieldSizeContext(row,stage,field,sz); const today=n(todayMap.sizes[sz]);
              return <>
                <div className="mt-entry-size-open">Open <b>{fmt(szCtx.open)}</b>{today ? <span className="mt-today-badge" style={{marginLeft:4}}>Today {fmt(today)}</span> : null}</div>
                <input className={`mt-cell-input ${n(szCtx.open)>0?"mandatory":""} ${draft[`${row.id}|${sz}`]!==undefined?"dirty":""} ${v.blocked?"blocked":""} ${today?"today-entered":""}`} value={getVal(row,sz)} onChange={e=>setVal(row,sz,e.target.value)} placeholder="0" max={Math.max(0,n(szCtx.open))} title={`Max allowed now: ${fmt(szCtx.open)}`} />
              </>;
            })()}
          </td> : <td key={sz} className="mt-small">—</td>)}
          <td><b>{fmt(rowNew)}</b></td>
          <td><b>{fmt(rowRemaining)}</b></td>
          <td>{stage === "cutting" && !isProductionFileReleased(row) ? <span className="mt-chip mt-warn">Release file first</span> : v.blocked ? <span className="mt-chip mt-late">Blocked</span> : v.overCut ? <span className="mt-chip mt-purple">Extra cut</span> : v.entryTotal ? <span className="mt-chip mt-warn">Ready</span> : <span className="mt-chip mt-ok">OK</span>}
            {v.blocked ? <div className="mt-small">{v.messages?.join("; ")}</div> : null}
          </td>
        </tr>
        {isCorrecting && <tr className="mt-correction-row"><td colSpan={allSizes.length+5}>
          <div className="mt-inline-correction">
            <div className="mt-correction-head"><b>Edit {entryDate} entry</b><span className="mt-small">Type the corrected final quantity for today. Only the difference is saved as an audit correction; original history stays visible in Register.</span></div>
            <div className="mt-correction-grid">
              {sizes.filter(sz=>n(todayMap.sizes[sz])>0 || correctDraft[`${row.id}|${sz}`]!==undefined).map(sz=>{
                const oldQty = n(todayMap.sizes[sz]);
                const nextQty = n(correctVal(row, sz) || 0);
                const delta = nextQty - oldQty;
                return <div className="mt-correction-size" key={sz}>
                  <div className="sz">{sz}</div>
                  <div className="mt-small">Old {fmt(oldQty)}</div>
                  <input className="mt-cell-input" style={{width:"100%"}} value={correctVal(row, sz)} onChange={e=>setCorrectVal(row, sz, e.target.value)} placeholder="0" />
                  <div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div>
                </div>;
              })}
            </div>
            <div className="mt-entry-row-actions" style={{marginTop:10}}>
              <button className="mt-btn primary" onClick={()=>saveCorrection(row)}><CheckCircle2 size={14}/>Save correction</button>
              <button className="mt-btn ghost" onClick={()=>{setCorrectRowId(null); setCorrectDraft({});}}>Cancel</button>
            </div>
          </div>
        </td></tr>}
        </React.Fragment>;
      }) : <tr><td colSpan={allSizes.length+5} style={{padding:18}}>No open styles, and nothing entered today, for {stageLabel(stage)} · {fieldLabel(field)}.</td></tr>}
    </tbody></table></div>
    </>}
    </> : <div className="mt-section">
      <div className="mt-toolbar no-print">
        <span className="mt-toolbar-label">Find style</span>
        <input className="mt-input" style={{minWidth:260}} value={styleSearch} onChange={e=>{setStyleSearch(e.target.value); setSelectedRowId("");}} placeholder="Type style / order / buyer / colour" />
      </div>
      {!selectedStyleRow && styleMatches.length ? <div className="mt-plan-style-picks" style={{marginTop:8}}>
        {styleMatches.map(r=><button key={r.id} className="mt-plan-style-pick ok" onClick={()=>{setSelectedRowId(r.id); setStyleSearch("");}}><b>{r.style_no}</b><span>{r.order_no} · {r.buyer} · {r.colour} · {r.component}</span></button>)}
      </div> : null}
      {!selectedStyleRow && styleSearch.trim() && !styleMatches.length ? <div className="mt-speed-note" style={{marginTop:8}}>No style matches "{styleSearch}".</div> : null}
      {selectedStyleRow ? <div style={{marginTop:12}}>
        <div className="mt-entry-hero">
          <div className="mt-entry-hero-title"><span>{selectedStyleRow.style_no}</span><span className="mt-chip mt-muted">{selectedStyleRow.order_no}</span><button className="mt-btn ghost" style={{marginLeft:"auto"}} onClick={()=>setSelectedRowId("")}>Change style</button></div>
          <div className="mt-entry-hero-sub">{selectedStyleRow.buyer} · {selectedStyleRow.colour} · {selectedStyleRow.component}. Full history — every department, every action, every date this style has any entry. Edit any row; only the difference is recorded as an audit correction.</div>
        </div>
        <div className="mt-style-entry-panel no-print">
          <div className="mt-style-entry-head"><b>New DPR entry for this style</b><span className="mt-small">Clicking Current Status opens here. Choose date/action and type sizes without going back to the top date toolbar.</span></div>
          <div className="mt-style-entry-controls">
            <label><span>Date</span><input className="mt-input mt-entry-date mandatory" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /></label>
            <label><span>Dept</span><select className="mt-select" value={stage} onChange={e=>{setStage(e.target.value); setStyleDeptFilter(e.target.value); setDraft({});}}>{selectedStyleDeptOptions.map(k=><option key={k} value={k}>{stageLabel(k)}</option>)}</select></label>
            <label><span>Action</span><select className="mt-select" value={field} onChange={e=>{setField(e.target.value); setDraft({});}}>{(ENTRY_FIELDS.some(f=>f.key===field) ? ENTRY_FIELDS : [{key:field,label:fieldLabel(field)}, ...ENTRY_FIELDS]).map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></label>
            {stage === "stitching" && <label><span>Line</span><select className="mt-select" value={entryLine} onChange={e=>setEntryLine(e.target.value)}>{productionLineNames().map(l=><option key={l} value={l}>{l}</option>)}</select></label>}
            <button className="mt-btn" onClick={()=>fillRowOpen(selectedStyleRow)}>Fill open</button>
            <button className="mt-btn ghost" onClick={()=>clearRow(selectedStyleRow)}>Clear</button>
            <button className="mt-btn primary" onClick={saveSelectedStyleDayEntry} disabled={isSaving}><CheckCircle2 size={14}/>{isSaving ? "Saving…" : "Save style entry"}</button>
          </div>
          <div className="mt-style-entry-size-grid">
            {selectedStyleSizes.map(sz=>{ const szCtx=entryFieldSizeContext(selectedStyleRow,stage,field,sz); const today=n(todayEntryMap(selectedStyleRow).sizes[sz]); return <div className="mt-style-entry-size" key={sz}>
              <div className="sz">{sz}</div>
              <div className="mt-small">Open <b>{fmt(szCtx.open)}</b>{today ? ` · today ${fmt(today)}` : ""}</div>
              <input className={`mt-cell-input ${n(szCtx.open)>0?"mandatory":""} ${draft[`${selectedStyleRow.id}|${sz}`]!==undefined?"dirty":""}`} value={getVal(selectedStyleRow,sz)} onChange={e=>setVal(selectedStyleRow,sz,e.target.value)} placeholder="0" max={Math.max(0,n(szCtx.open))} title={`Max allowed now: ${fmt(szCtx.open)}`} />
            </div>; })}
          </div>
          {selectedStyleValidation?.entryTotal ? <div className="mt-style-entry-total"><span>New entry <b>{fmt(selectedStyleValidation.entryTotal)}</b></span>{selectedStyleValidation.blocked ? <span className="mt-chip mt-late">Blocked</span> : selectedStyleValidation.overCut ? <span className="mt-chip mt-purple">Extra cut</span> : <span className="mt-chip mt-ok">Ready</span>}{selectedStyleValidation.messages?.length ? <span className="mt-small">{selectedStyleValidation.messages.slice(0,2).join(" · ")}</span> : null}</div> : null}
        </div>
        <div className="mt-toggle-row no-print">
          <span className="mt-toolbar-label">Dept</span>
          <button className={`mt-btn ${styleDeptFilter==="all"?"active":"ghost"}`} onClick={()=>setStyleDeptFilter("all")}>All depts</button>
          {selectedStyleDeptOptions.map(k=><button key={k} className={`mt-btn ${styleDeptFilter===k?"active":"ghost"}`} onClick={()=>setStyleDeptFilter(k)}>{stageLabel(k)}</button>)}
        </div>
        <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Date</th><th>Dept</th><th>Action</th><th>Total</th><th>By size</th><th>Edit</th></tr></thead><tbody>
          {selectedStyleHistory.length ? selectedStyleHistory.map(g=>{
            const key = groupKeyOf(g);
            const isEditing = styleEditKey === key;
            return <React.Fragment key={key}>
              <tr>
                <td><b>{g.date}</b></td>
                <td>{stageLabel(g.stage)}</td>
                <td>{registerActivityLabel(g.type)}</td>
                <td><b>{fmt(g.total)}</b></td>
                <td className="mt-small">{Object.keys(g.sizes||{}).filter(sz=>n(g.sizes[sz])).map(sz=>`${sz||"(blank)"} ${fmt(g.sizes[sz])}`).join(" · ") || "—"}</td>
                <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{n(g.total)!==0 || groupHasSizeSplit(g) ? <><button className={`mt-btn ghost ${isEditing?"active":""}`} onClick={()=>isEditing ? setStyleEditKey(null) : beginStyleCorrection(selectedStyleRow, g)}>{isEditing?"Close edit":"Edit"}</button><button className="mt-btn ghost danger" onClick={()=>voidStyleEntry(selectedStyleRow, g)} title="Delete / void this entry (posts an audit-safe reversal)">Delete</button></> : <span className="mt-small">already 0</span>}</div></td>
              </tr>
              {isEditing && <tr className="mt-correction-row"><td colSpan={6}>
                <div className="mt-inline-correction">
                  <div className="mt-correction-head"><b>Edit {g.date} · {stageLabel(g.stage)} · {registerActivityLabel(g.type)}</b><span className="mt-small">Type the corrected final quantity per size. Only the difference is saved as an audit correction; original history stays visible in Register.</span></div>
                  <div className="mt-correction-controls"><label>Reason <input className="mt-input" value={styleCorrectReason} onChange={e=>setStyleCorrectReason(e.target.value)} placeholder="Correction reason" style={{minWidth:240}}/></label></div>
                  <div className="mt-correction-grid">
                    {!groupHasSizeSplit(g) ? (()=>{
                      const oldQty = n(g.total);
                      const nextQty = n(styleCorrectVal(key, "__total__") || 0);
                      const delta = nextQty - oldQty;
                      return <div className="mt-correction-size">
                        <div className="sz">Total (no size split)</div>
                        <div className="mt-small">Old {fmt(oldQty)}</div>
                        <input className="mt-cell-input" style={{width:"100%"}} value={styleCorrectVal(key, "__total__")} onChange={e=>setStyleCorrectVal(key, "__total__", e.target.value)} placeholder="0" />
                        <div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div>
                      </div>;
                    })() : editableSizeKeys(selectedStyleRow, g).map(sz=>{
                      const oldQty = n(g.sizes[sz]);
                      const nextQty = n(styleCorrectVal(key, sz) || 0);
                      const delta = nextQty - oldQty;
                      return <div className="mt-correction-size" key={sz || "__blank__"}>
                        <div className="sz">{sz || "(no size)"}</div>
                        <div className="mt-small">Old {fmt(oldQty)}</div>
                        <input className="mt-cell-input" style={{width:"100%"}} value={styleCorrectVal(key, sz)} onChange={e=>setStyleCorrectVal(key, sz, e.target.value)} placeholder="0" />
                        <div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div>
                      </div>;
                    })}
                  </div>
                  <div className="mt-entry-row-actions" style={{marginTop:10}}>
                    <button className="mt-btn primary" onClick={()=>saveStyleCorrection(selectedStyleRow, g)}><CheckCircle2 size={14}/>Save correction</button>
                    <button className="mt-btn ghost" onClick={()=>setStyleEditKey(null)}>Cancel</button>
                  </div>
                </div>
              </td></tr>}
            </React.Fragment>;
          }) : <tr><td colSpan={6} style={{padding:18}}>No entries yet for this style{styleDeptFilter!=="all" ? ` in ${stageLabel(styleDeptFilter)}` : ""}.</td></tr>}
        </tbody></table></div>
      </div> : null}
    </div>}
  </div>;
}



function registerActivityLabel(type){
  const t = String(type || "").toLowerCase();
  if (["good_output","output","completed","complete","done"].includes(t)) return "Completed / Output";
  if (["issue","issued"].includes(t)) return "Dept Issue Forward";
  if (["receive","received","legacy_feed"].includes(t)) return "Legacy Receive / Feed";
  if (["reject","rejection"].includes(t)) return "Rejection";
  if (t === "missing") return "Missing";
  if (t === "alter" || t === "alter_issue") return "Alter Defect";
  if (t === "alter_clear") return "Alter Clear";
  return t || "Entry";
}
function correctionFieldToEntryType(field){
  if (field === "output") return "good_output";
  if (field === "issued") return "issue";
  if (field === "received") return "legacy_feed";
  if (field === "reject") return "reject";
  if (field === "missing") return "missing";
  if (field === "alter") return "alter";
  if (field === "alter_clear") return "alter_clear";
  return "good_output";
}
function parseRegisterSizeQtyText(text=""){
  const out = {};
  String(text || "").split(/[;,\n]+/).forEach(part=>{
    const m = part.trim().match(/^([^=:\s]+)\s*[=:]\s*([+-]?\d+(?:\.\d+)?)$/);
    if (m) out[m[1].trim().toUpperCase()] = n(m[2]);
  });
  return out;
}
function applyRegisterCorrectionToRows({ rows, target, stage, field, sizeMap }){
  return (rows||[]).map(row=>{
    const same = String(row.order_no||"")===String(target.Order||"") && String(row.style_no||"")===String(target.Style||"") && String(row.colour||"")===String(target.Colour||"") && String(row.component||"")===String(target.Component||"");
    if (!same) return row;
    const baseField = field === "alter_clear" ? "output" : field;
    const stages = { ...(row.stages || {}) };
    const prevStage = { ...blankStage(), ...sdata(row, stage) };
    const nextStage = { ...prevStage };
    const sizeStage = { ...(row.size_stage || {}) };
    const stageSizes = { ...(sizeStage[stage] || {}) };
    const oldMap = Object.fromEntries(sizeMatrix(row, stage, baseField).map(x=>[String(x.size).toUpperCase(), n(x.qty)]));
    const newMap = { ...oldMap };
    Object.entries(sizeMap || {}).forEach(([size, delta])=>{ newMap[String(size).toUpperCase()] = n(newMap[String(size).toUpperCase()]) + n(delta); });
    if (field === "alter_clear") {
      const oldAlter = Object.fromEntries(sizeMatrix(row, stage, "alter").map(x=>[String(x.size).toUpperCase(), n(x.qty)]));
      const newAlter = { ...oldAlter };
      Object.entries(sizeMap || {}).forEach(([size, delta])=>{ newAlter[String(size).toUpperCase()] = Math.max(0, n(newAlter[String(size).toUpperCase()]) - n(delta)); });
      nextStage.output = Object.values(newMap).reduce((a,b)=>a+n(b),0);
      nextStage.alter = Object.values(newAlter).reduce((a,b)=>a+n(b),0);
      stageSizes.output = newMap;
      stageSizes.alter = newAlter;
    } else {
      nextStage[baseField] = Object.values(newMap).reduce((a,b)=>a+n(b),0);
      // Register/output correction must not auto-create receiving.
      stageSizes[baseField] = newMap;
    }
    stages[stage] = nextStage;
    sizeStage[stage] = stageSizes;
    return { ...row, stages, size_stage:sizeStage };
  });
}

function ledgerEntryFieldEffects(entry){
  const t = ledgerType(entry);
  if (["good_output","output","completed","complete","done"].includes(t)) return [{ field:"output", qty:n(entry.qty ?? entry.delta) }];
  if (["issue","issued"].includes(t)) return [{ field:"issued", qty:n(entry.qty ?? entry.delta) }];
  if (["receive","received","legacy_feed"].includes(t)) return [{ field:"received", qty:n(entry.qty ?? entry.delta) }];
  if (["reject","rejection"].includes(t)) return [{ field:"reject", qty:n(entry.qty ?? entry.delta) }];
  if (["missing"].includes(t)) return [{ field:"missing", qty:n(entry.qty ?? entry.delta) }];
  if (["alter","alter_issue"].includes(t)) return [{ field:"alter", qty:n(entry.qty ?? entry.delta) }];
  if (t === "alter_clear") return [{ field:"output", qty:n(entry.qty ?? entry.delta) }, { field:"alter", qty:-n(entry.qty ?? entry.delta) }];
  return [];
}
function applySharedLedgerTotalsToRows(rows=[], ledger=[]){
  if (!Array.isArray(rows) || !rows.length || !Array.isArray(ledger) || !ledger.length) return rows || [];
  const rowKeySet = new Set(rows.map(r=>styleCompositeKey(r)));
  const stageMap = new Map();
  function ensure(rowKey, stage){
    const key = `${rowKey}|::|${stage}`;
    if (!stageMap.has(key)) stageMap.set(key, { fields:{}, sizes:{} });
    return stageMap.get(key);
  }
  (ledger || []).forEach(entry=>{
    const rowKey = styleCompositeKey({
      order_no:entry.order_no || entry.order,
      style_no:entry.style_no || entry.style,
      colour:entry.colour || "",
      component:entry.component || "",
    });
    const stage = ledgerStage(entry);
    const size = String(entry.size || entry.size_code || entry.size_name || "").trim().toUpperCase();
    if (!rowKeySet.has(rowKey) || !stage || !size) return;
    const effects = ledgerEntryFieldEffects(entry);
    if (!effects.length) return;
    const bucket = ensure(rowKey, stage);
    effects.forEach(({field, qty})=>{
      bucket.fields[field] = n(bucket.fields[field]) + n(qty);
      bucket.sizes[field] = bucket.sizes[field] || {};
      bucket.sizes[field][size] = n(bucket.sizes[field][size]) + n(qty);
    });
  });
  if (!stageMap.size) return rows;
  return rows.map(row=>{
    const rowKey = styleCompositeKey(row);
    const stages = { ...(row.stages || {}) };
    const sizeStage = { ...(row.size_stage || {}) };
    let changed = false;
    routeFor(row).forEach(stage=>{
      const bucket = stageMap.get(`${rowKey}|::|${stage}`);
      if (!bucket) return;
      const nextStage = { ...blankStage(), ...sdata(row, stage) };
      const nextStageSizes = { ...(sizeStage[stage] || {}) };
      Object.entries(bucket.fields).forEach(([field, total])=>{
        const safeTotal = field === "alter" ? Math.max(0, n(total)) : n(total);
        nextStage[field] = safeTotal;
        const bySize = { ...(bucket.sizes[field] || {}) };
        if (field === "alter") Object.keys(bySize).forEach(sz=>{ bySize[sz] = Math.max(0, n(bySize[sz])); });
        nextStageSizes[field] = bySize;
        changed = true;
      });
      // Do not synthesize receiving from output ledger rows. Receive stays explicit only.
      stages[stage] = nextStage;
      sizeStage[stage] = nextStageSizes;
    });
    return changed ? { ...row, stages, size_stage:sizeStage } : row;
  });
}

const STAGE_QTY_FIELDS_FOR_RECALC = ["received", "output", "issued", "reject", "alter", "missing"];
function normalizedLedgerRowKey(entry){
  return styleCompositeKey({
    order_no:entry?.order_no || entry?.order || "",
    style_no:entry?.style_no || entry?.style || "",
    colour:entry?.colour || "",
    component:entry?.component || "",
  });
}
function ledgerStyleKeySetForRows(rows=[], ledger=[]){
  const rowKeySet = new Set((rows || []).map(r=>styleCompositeKey(r)));
  const keys = new Set();
  (ledger || []).forEach(entry=>{
    const key = normalizedLedgerRowKey(entry);
    if (rowKeySet.has(key)) keys.add(key);
  });
  return keys;
}
function buildLedgerStageMapForRows(rows=[], ledger=[]){
  const rowKeySet = new Set((rows || []).map(r=>styleCompositeKey(r)));
  const stageMap = new Map();
  function ensure(rowKey, stage){
    const key = `${rowKey}|::|${stage}`;
    if (!stageMap.has(key)) stageMap.set(key, { fields:{}, sizes:{} });
    return stageMap.get(key);
  }
  (ledger || []).forEach(entry=>{
    const rowKey = normalizedLedgerRowKey(entry);
    const stage = ledgerStage(entry);
    const size = String(entry.size || entry.size_code || entry.size_name || "").trim().toUpperCase();
    if (!rowKeySet.has(rowKey) || !stage || !size) return;
    const effects = ledgerEntryFieldEffects(entry);
    if (!effects.length) return;
    const bucket = ensure(rowKey, stage);
    effects.forEach(({ field, qty })=>{
      bucket.fields[field] = n(bucket.fields[field]) + n(qty);
      bucket.sizes[field] = bucket.sizes[field] || {};
      bucket.sizes[field][size] = n(bucket.sizes[field][size]) + n(qty);
    });
  });
  return stageMap;
}
function deriveStageQtyFromLedgerRows(rows=[], ledger=[]){
  if (!Array.isArray(rows) || !rows.length || !Array.isArray(ledger) || !ledger.length) return rows || [];
  const ledgerKeys = ledgerStyleKeySetForRows(rows, ledger);
  if (!ledgerKeys.size) return rows || [];
  const stageMap = buildLedgerStageMapForRows(rows, ledger);
  return (rows || []).map(row=>{
    const rowKey = styleCompositeKey(row);
    if (!ledgerKeys.has(rowKey)) return row;
    const stages = {};
    const sizeStage = {};
    routeFor(row).forEach(stage=>{
      const current = sdata(row, stage);
      const nextStage = { ...blankStage(), party:current.party || "", idle:n(current.idle) };
      const nextStageSizes = {};
      const bucket = stageMap.get(`${rowKey}|::|${stage}`);
      if (bucket) {
        Object.entries(bucket.fields).forEach(([field, total])=>{
          const safeTotal = field === "alter" ? Math.max(0, n(total)) : n(total);
          nextStage[field] = safeTotal;
          const bySize = { ...(bucket.sizes[field] || {}) };
          if (field === "alter") Object.keys(bySize).forEach(sz=>{ bySize[sz] = Math.max(0, n(bySize[sz])); });
          nextStageSizes[field] = bySize;
        });
      }
      stages[stage] = nextStage;
      if (Object.keys(nextStageSizes).length) sizeStage[stage] = nextStageSizes;
    });
    return { ...row, stages, size_stage:sizeStage };
  });
}
function stageQtyTotalsSignature(row){
  return JSON.stringify(routeFor(row).map(stage=>({
    stage,
    fields:Object.fromEntries(STAGE_QTY_FIELDS_FOR_RECALC.map(field=>[field, n(sdata(row, stage)[field])]))
  })));
}
function ledgerRecalcStats(rows=[], ledger=[]){
  const ledgerKeys = ledgerStyleKeySetForRows(rows, ledger);
  const derivedRows = deriveStageQtyFromLedgerRows(rows, ledger);
  const rowsToSave = derivedRows.filter(row=>ledgerKeys.has(styleCompositeKey(row)));
  const changedRows = rowsToSave.filter(row=>{
    const oldRow = (rows || []).find(r=>styleCompositeKey(r)===styleCompositeKey(row));
    return oldRow && stageQtyTotalsSignature(oldRow) !== stageQtyTotalsSignature(row);
  });
  return {
    derivedRows,
    rowsToSave,
    changedRows,
    ledgerStyleCount:ledgerKeys.size,
    ledgerRowCount:(ledger || []).filter(entry=>ledgerKeys.has(normalizedLedgerRowKey(entry))).length,
    unchangedLedgerStyleCount:Math.max(0, ledgerKeys.size - changedRows.length),
    untouchedNoLedgerCount:Math.max(0, (rows || []).length - ledgerKeys.size),
  };
}

function outputRegisterRows(rows, ledger=[], filters={}){
  const allSizes = allReportSizes(rows);
  const visibleKeys = new Set((rows||[]).map(r=>styleCompositeKey(r)));
  const q = String(filters.query || "").trim().toLowerCase();
  const from = filters.from || "0000-01-01";
  const to = filters.to || "9999-12-31";
  const dept = filters.dept || "all";
  const activity = filters.activity || "all";
  const map = new Map();
  (ledger||[]).forEach(entry=>{
    const row = findRowForLedger(rows, entry) || {};
    const keyRow = row.id ? row : { order_no:entry.order_no||entry.order, style_no:entry.style_no||entry.style, colour:entry.colour, component:entry.component };
    if (rows?.length && !visibleKeys.has(styleCompositeKey(keyRow))) return;
    const entryDate = String(entry.entry_date || entry.entryDate || entry.date || "").slice(0,10);
    if (!entryDate || entryDate < from || entryDate > to) return;
    const stage = String(entry.stage || "").toLowerCase();
    const typ = String(entry.entry_type || entry.entryType || entry.type || "").toLowerCase();
    const label = registerActivityLabel(typ);
    if (dept !== "all" && stage !== dept) return;
    if (activity !== "all" && label !== activity) return;
    const hay = [entry.order_no||entry.order||row.order_no, entry.style_no||entry.style||row.style_no, entry.buyer||row.buyer, entry.colour||row.colour, entry.component||row.component, stageLabel(stage), label].join(" ").toLowerCase();
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      if (!tokens.every(token => hay.includes(token))) return;
    }
    const groupKey = [entryDate, stage, entry.order_no||entry.order||row.order_no||"", entry.style_no||entry.style||row.style_no||"", entry.colour||row.colour||"", entry.component||row.component||"", entry.entry_source||entry.source||""].join("|::|");
    if (!map.has(groupKey)) {
      map.set(groupKey, {
        Entry_Date:entryDate,
        Department:stageLabel(stage),
        Order:entry.order_no || entry.order || row.order_no || "",
        Style:entry.style_no || entry.style || row.style_no || "",
        Buyer:entry.buyer || row.buyer || "",
        Colour:entry.colour || row.colour || "",
        Component:entry.component || row.component || "",
        Source:entry.entry_source || entry.source || "",
        Completed_Output:0,
        Issue_Forward:0,
        Receive:0,
        Rejection:0,
        Missing:0,
        Alter_Defect:0,
        Alter_Clear:0,
        R_A_M_Total:0,
        Total_Activity:0,
        _sizes:{},
        _fieldSizes:{ output:{}, issued:{}, received:{}, reject:{}, missing:{}, alter:{}, alter_clear:{} },
        _stage:stage,
        Created_At:entry.created_at || entry.createdAt || "",
        By:entry.changed_by || entry.created_by || entry.user || "—",
        Reason:entry.backdate_reason || entry.reason || "",
      });
    }
    const g = map.get(groupKey);
    const size = String(entry.size || "NO_SIZE").toUpperCase();
    const qty = n(entry.qty ?? entry.delta ?? entry.good_qty ?? entry.reject_qty ?? entry.alter_qty ?? entry.missing_qty);
    let fieldKey = "output";
    if (["Completed / Output"].includes(label)) { g.Completed_Output += qty; fieldKey = "output"; }
    else if (label === "Dept Issue Forward") { g.Issue_Forward += qty; fieldKey = "issued"; }
    else if (label === "Legacy Receive / Feed") { g.Receive += qty; fieldKey = "received"; }
    else if (label === "Rejection") { g.Rejection += qty; g.R_A_M_Total += qty; fieldKey = "reject"; }
    else if (label === "Missing") { g.Missing += qty; g.R_A_M_Total += qty; fieldKey = "missing"; }
    else if (label === "Alter Defect") { g.Alter_Defect += qty; g.R_A_M_Total += qty; fieldKey = "alter"; }
    else if (label === "Alter Clear") { g.Alter_Clear += qty; fieldKey = "alter_clear"; }
    g.Total_Activity += qty;
    g._sizes[size] = n(g._sizes[size]) + qty;
    g._fieldSizes[fieldKey] = g._fieldSizes[fieldKey] || {};
    g._fieldSizes[fieldKey][size] = n(g._fieldSizes[fieldKey][size]) + qty;
    if (!g.Created_At || String(entry.created_at || entry.createdAt || "") < g.Created_At) g.Created_At = entry.created_at || entry.createdAt || g.Created_At;
  });
  return Array.from(map.values()).map(r=>{
    const sizeCols = withHorizontalSizes({}, r._sizes, allSizes);
    const {_sizes, ...core} = r;
    return { ...core, ...sizeCols };
  }).sort((a,b)=>String(a.Entry_Date).localeCompare(String(b.Entry_Date)) || String(a.Department).localeCompare(String(b.Department)) || String(a.Style).localeCompare(String(b.Style)));
}

function defaultCorrectionFieldForRegisterRow(row){
  if (n(row.Completed_Output)) return "output";
  if (n(row.Issue_Forward)) return "issued";
  if (n(row.Receive)) return "received";
  if (n(row.Rejection)) return "reject";
  if (n(row.Missing)) return "missing";
  if (n(row.Alter_Defect)) return "alter";
  if (n(row.Alter_Clear)) return "alter_clear";
  return "output";
}
function registerFieldSizeMap(row, field, sizes=[]){
  const fieldSizes = row?._fieldSizes?.[field] || {};
  const out = {};
  (sizes || []).forEach(sz=>{ { const primary = fieldSizes[String(sz).toUpperCase()]; const fallback = fieldSizes[sz]; out[sz] = n(primary !== undefined && primary !== null ? primary : (fallback !== undefined && fallback !== null ? fallback : 0)); } });
  Object.entries(fieldSizes || {}).forEach(([sz, qty])=>{ out[String(sz).toUpperCase()] = n(qty); });
  return out;
}
function registerCorrectionRowKey(row, index){
  return [row.Entry_Date, row.Department, row.Order, row.Style, row.Colour, row.Component, row.Source, index].join("|::|");
}
function registerCorrectionOriginalTotal(row, field, sizes=[]){
  return Object.values(registerFieldSizeMap(row, field, sizes)).reduce((a,b)=>a+n(b),0);
}
function fieldLabelCompact(field){
  return fieldLabel(field).replace("Dept ", "").replace("Completed / ", "");
}
function registerSummaryRows(registerRows=[], mode="summary"){
  const map = new Map();
  (registerRows || []).forEach(r=>{
    const key = mode === "day" ? [r.Entry_Date, r.Department].join("|::|") : [r.Department].join("|::|");
    if (!map.has(key)) map.set(key, {
      ...(mode === "day" ? { Entry_Date:r.Entry_Date } : {}),
      Department:r.Department,
      Rows:0,
      Completed_Output:0,
      Issue_Forward:0,
      Receive:0,
      Rejection:0,
      Missing:0,
      Alter_Defect:0,
      Alter_Clear:0,
      R_A_M_Total:0,
      Total_Activity:0,
    });
    const g = map.get(key);
    g.Rows += 1;
    ["Completed_Output","Issue_Forward","Receive","Rejection","Missing","Alter_Defect","Alter_Clear","R_A_M_Total","Total_Activity"].forEach(k=>{ g[k] += n(r[k]); });
  });
  return Array.from(map.values()).sort((a,b)=>String(a.Entry_Date||"").localeCompare(String(b.Entry_Date||"")) || String(a.Department).localeCompare(String(b.Department)));
}

function OutputRegisterView({ rows, setRows, ledger, setLedger, focus, clearTick=0, onSharedSave }){
  const defaultFrom = today().slice(0,7) + "-01";
  const [from,setFrom] = useState(()=>safeJsonLoad(uiStorageKey("register_from"), defaultFrom));
  const [to,setTo] = useState(()=>safeJsonLoad(uiStorageKey("register_to"), today()));
  const [dept,setDept] = useState(()=>safeJsonLoad(uiStorageKey("register_dept"), "all"));
  const [activity,setActivity] = useState(()=>safeJsonLoad(uiStorageKey("register_activity"), "all"));
  const [query,setQuery] = useState(()=>safeJsonLoad(uiStorageKey("register_query"), ""));
  const [registerMode,setRegisterMode] = useState(()=>safeJsonLoad(uiStorageKey("register_mode"), "summary"));
  const [correction,setCorrection] = useState(null);
  useEffect(()=>safeJsonSave(uiStorageKey("register_from"), from), [from]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_to"), to), [to]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_dept"), dept), [dept]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_activity"), activity), [activity]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_query"), query), [query]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_mode"), registerMode), [registerMode]);
  useEffect(()=>{
    if (!clearTick) return;
    setFrom(defaultFrom);
    setTo(today());
    setDept("all");
    setActivity("all");
    setQuery("");
    setRegisterMode("summary");
    setCorrection(null);
  }, [clearTick]);
  useEffect(()=>{
    if (!focus) return;
    const nextDept = focus.stage || "all";
    setDept(nextDept);
    setActivity(focus.activity || "all");
    const nextQuery = [focus.order_no, focus.style_no, focus.colour, focus.component].filter(Boolean).join(" ");
    setQuery(nextQuery);
    setRegisterMode("detail");
    const matchingDates = (ledger || []).filter(e=>{
      const sameOrder = String(e.order_no || e.order || "") === String(focus.order_no || "");
      const sameStyle = String(e.style_no || e.style || "") === String(focus.style_no || "");
      const sameColour = String(e.colour || "") === String(focus.colour || "");
      const sameComponent = String(e.component || "") === String(focus.component || "");
      const sameStage = nextDept === "all" || String(e.stage || "").toLowerCase() === String(nextDept).toLowerCase();
      return sameOrder && sameStyle && sameColour && sameComponent && sameStage;
    }).map(e=>String(e.entry_date || e.entryDate || e.date || "").slice(0,10)).filter(Boolean).sort();
    if (matchingDates.length) {
      setFrom(matchingDates[0]);
      setTo(matchingDates[matchingDates.length - 1] > today() ? matchingDates[matchingDates.length - 1] : today());
    }
    setCorrection(null);
  }, [focus?.id]);
  const activities = useMemo(()=>["all", ...Array.from(new Set((ledger||[]).map(e=>registerActivityLabel(e.entry_type || e.entryType || e.type)).filter(Boolean))).sort()], [ledger]);
  const registerRows = useMemo(()=>outputRegisterRows(rows, ledger, {from,to,dept,activity,query}), [rows, ledger, from, to, dept, activity, query]);
  const totalOutput = registerRows.reduce((a,r)=>a+n(r.Completed_Output),0);
  const totalIssue = registerRows.reduce((a,r)=>a+n(r.Issue_Forward),0);
  const totalRAM = registerRows.reduce((a,r)=>a+n(r.R_A_M_Total),0);
  const allSizes = allReportSizes(rows);
  function correctionSizeListForRow(r, field){
    const m = registerFieldSizeMap(r, field || defaultCorrectionFieldForRegisterRow(r), allSizes);
    return Array.from(new Set([...allSizes, ...Object.keys(m || {})].map(sz=>String(sz).toUpperCase()).filter(Boolean)));
  }
  const fieldOptions = [
    ["output", "Completed / Output"],
    ["issued", "Dept Issue Forward"],
    ["received", "Legacy Receive / Feed"],
    ["reject", "Rejection"],
    ["missing", "Missing"],
    ["alter", "Alter Defect"],
    ["alter_clear", "Alter Clear"],
  ];
  function exportRegister(){
    const exportRows = registerMode === "detail" ? registerRows.map(({_stage, _fieldSizes, ...r})=>r) : registerSummaryRows(registerRows, registerMode);
    exportXlsx(`production_output_register_${registerMode}_${from}_to_${to}.xlsx`, [{name:"Output Register", rows:exportRows}]);
  }
  function clearRegisterFilters(){
    setFrom(defaultFrom);
    setTo(today());
    setDept("all");
    setActivity("all");
    setQuery("");
    setCorrection(null);
  }
  function beginInlineCorrection(r, index){
    const key = registerCorrectionRowKey(r, index);
    const field = defaultCorrectionFieldForRegisterRow(r);
    setCorrection({
      key,
      field,
      entryDate:r.Entry_Date || today(),
      reason:"Register correction",
      values:registerFieldSizeMap(r, field, allSizes),
    });
  }
  function changeCorrectionField(r, index, field){
    const key = registerCorrectionRowKey(r, index);
    setCorrection(c=>({
      key,
      field,
      entryDate:c?.entryDate || r.Entry_Date || today(),
      reason:c?.reason || "Register correction",
      values:registerFieldSizeMap(r, field, allSizes),
    }));
  }
  function setCorrectionQty(size, value){
    const clean = String(value || "").replace(/[^0-9.]/g, "");
    setCorrection(c=>({ ...(c || {}), values:{ ...(c?.values || {}), [size]:clean } }));
  }
  async function saveInlineCorrection(r, index){
    if (!correction) return;
    const stage = r._stage || STAGES.find(s=>s.label===r.Department)?.key || "cutting";
    const field = correction.field || defaultCorrectionFieldForRegisterRow(r);
    const correctionSizes = correctionSizeListForRow(r, field);
    const original = registerFieldSizeMap(r, field, correctionSizes);
    const sizeMap = {};
    correctionSizes.forEach(sz=>{
      const oldQty = n(original[sz]);
      const newQty = n(correction.values?.[sz]);
      const delta = newQty - oldQty;
      if (delta) sizeMap[sz] = delta;
    });
    const totalDelta = Object.values(sizeMap).reduce((a,b)=>a+n(b),0);
    if (!Object.keys(sizeMap).length) { alert("No correction difference found. Change at least one size quantity."); return; }
    const reason = correction.reason || "Register correction";
    if (!window.confirm(`Create audit-safe correction?

Date: ${correction.entryDate || r.Entry_Date}
Dept: ${stageLabel(stage)}
Field: ${fieldLabel(field)}
Net correction: ${fmt(totalDelta)}
Reason: ${reason}

You entered the corrected final quantity below the original row. The app will save only the difference as a correction ledger row; old history remains visible.`)) return;
    const targetRow = rows.find(x=>String(x.order_no||"")===String(r.Order||"") && String(x.style_no||"")===String(r.Style||"") && String(x.colour||"")===String(r.Colour||"") && String(x.component||"")===String(r.Component||""));
    if (!targetRow) { alert("Matching style row not found in current data."); return; }
    const changes = Object.entries(sizeMap).map(([size, delta])=>{
      const baseField = field === "alter_clear" ? "output" : field;
      const oldQty = sizeMatrix(targetRow, stage, baseField).find(x=>String(x.size).toUpperCase()===String(size).toUpperCase())?.qty || 0;
      return { row:targetRow, size:String(size).toUpperCase(), oldQty:n(oldQty), newQty:n(oldQty)+n(delta), delta:n(delta), entryQty:n(delta) };
    });
    const p0Messages = p0EntryImpactIssues(targetRow, ledger || [], stage, field, correction.entryDate || r.Entry_Date, sizeMap);
    const validationOverride = p0Messages.length ? { validation_status:"p0_date_sequence_override", validation_scope:"p0_correction_confirmed_reconcile", validation_messages:p0Messages, requires_reconcile:true } : null;
    if (p0Messages.length && !String(reason||"").trim()) { alert("P0 correction needs a reason. It will appear in Reconcile Review."); return; }
    if (p0Messages.length && !window.confirm(`P0 CORRECTION REVIEW\n\nThis correction affects dated stock/sequence truth and will appear in Reconcile until reviewed.\n\n${p0Messages.slice(0,8).join("\n")}\n\nConfirm correction?`)) return;
    const newLedger = buildLedgerRows({ changes, stage, field, entryDate:correction.entryDate || r.Entry_Date, reason, source:"register_inline_corrected_qty", validationOverride });
    const sharedResult = await saveLedgerToSupabase(newLedger, field);
    if (sharedResult?.error || sharedResult?.warning || sharedResult?.skipped) {
      const msg = sharedResult?.error?.message || sharedResult?.warning || "Supabase was skipped";
      if (!window.confirm(`Shared Supabase correction did not confirm: ${msg}

Save locally in this browser anyway? Other users will not see it until Supabase is fixed/synced.`)) return;
    }
    setRows(prev=>applyRegisterCorrectionToRows({ rows:prev, target:r, stage, field, sizeMap }));
    setLedger(prev=>[...newLedger, ...(prev||[])]);
    setCorrection(null);
    onSharedSave?.(sharedResult, "Register correction");
  }
  const detailRows = registerRows.map(({_stage, _fieldSizes, ...r})=>r);
  const summaryRows = registerSummaryRows(registerRows, registerMode);
  const displayRows = registerMode === "detail" ? detailRows : summaryRows;
  const cols = displayRows.length ? Object.keys(displayRows[0]) : (registerMode === "day" ? ["Entry_Date","Department","Rows","Completed_Output","Issue_Forward","Receive","R_A_M_Total","Total_Activity"] : ["Department","Rows","Completed_Output","Issue_Forward","Receive","R_A_M_Total","Total_Activity"]);
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Output / Feed / Correction Register</h3><div className="mt-panel-sub">Horizontal department register. Date-first rows; feed, output, issue and R/A/M can all be corrected from Detail / Edit. Ledger-only clashing sizes also appear in the correction grid so they can be reduced to zero.</div>{focus && <div className="mt-context-strip" style={{marginTop:8}}><span className="mt-chip mt-info">Opened from WIP</span><span className="mt-chip mt-muted">{focus.order_no}</span><span className="mt-chip mt-muted">{focus.style_no}</span><span className="mt-chip mt-muted">{stageLabel(focus.stage)}</span><span className="mt-small">Register is filtered to this style/dept. Correct rows inline below the date.</span></div>}</div>
    <div className="mt-section no-print"><div className="mt-toolbar"><span className="mt-toolbar-label">View</span><div className="mt-toggle-group"><button className={`mt-btn ${registerMode==="summary"?"active":"ghost"}`} onClick={()=>{setRegisterMode("summary"); setCorrection(null);}}>Summary</button><button className={`mt-btn ${registerMode==="day"?"active":"ghost"}`} onClick={()=>{setRegisterMode("day"); setCorrection(null);}}>Day-wise</button><button className={`mt-btn ${registerMode==="detail"?"active":"ghost"}`} onClick={()=>setRegisterMode("detail")}>Detail / Edit</button></div><span className="mt-toolbar-label">From</span><input className="mt-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /><span className="mt-toolbar-label">To</span><input className="mt-input" type="date" value={to} onChange={e=>setTo(e.target.value)} /><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select><span className="mt-toolbar-label">Activity</span><select className="mt-select" value={activity} onChange={e=>setActivity(e.target.value)}>{activities.map(a=><option key={a} value={a}>{a==="all"?"All activities":a}</option>)}</select><input className="mt-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order / style / buyer / colour" style={{minWidth:260}}/><button className="mt-btn" onClick={clearRegisterFilters}><X size={14}/>Clear filters</button><button className="mt-btn" onClick={exportRegister}><Download size={14}/>Export</button></div></div>
    <div className="mt-section"><div className="mt-entry-metrics"><div className="mt-entry-metric"><div className="label">Rows</div><div className="value">{fmt(registerRows.length)}</div><div className="note">date first</div></div><div className="mt-entry-metric"><div className="label">Completed / Output</div><div className="value">{fmt(totalOutput)}</div><div className="note">filtered period</div></div><div className="mt-entry-metric"><div className="label">Issue Forward</div><div className="value">{fmt(totalIssue)}</div><div className="note">filtered period</div></div><div className="mt-entry-metric"><div className="label">R/A/M</div><div className="value">{fmt(totalRAM)}</div><div className="note">simple columns</div></div></div></div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}{registerMode === "detail" ? <th className="no-print">Edit</th> : null}</tr></thead><tbody>{displayRows.length ? displayRows.map((r,i)=>{ const fullRow = registerMode === "detail" ? registerRows[i] : null; const rowKey = registerMode === "detail" ? registerCorrectionRowKey(fullRow, i) : [registerMode, r.Entry_Date || "", r.Department || "", i].join("|::|"); const isEditing = registerMode === "detail" && correction?.key === rowKey; return <React.Fragment key={rowKey}><tr>{cols.map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] === undefined || r[c] === null ? "" : r[c])}</td>)}{registerMode === "detail" ? <td className="no-print"><button className={`mt-btn ${isEditing?"active":"ghost"}`} onClick={()=>isEditing ? setCorrection(null) : beginInlineCorrection(fullRow, i)}>{isEditing ? "Close" : "Correct"}</button></td> : null}</tr>{isEditing && <tr className="mt-correction-row"><td colSpan={cols.length+1}><div className="mt-inline-correction"><div className="mt-correction-head"><b>Correct quantity below original date</b><span className="mt-small">Enter the final correct qty by size. System saves only the difference as an audit correction.</span></div><div className="mt-correction-controls"><label>Correction Date <input className="mt-input" type="date" value={correction.entryDate || fullRow.Entry_Date} onChange={e=>setCorrection(c=>({ ...(c||{}), entryDate:e.target.value }))}/></label><label>Field <select className="mt-select" value={correction.field || defaultCorrectionFieldForRegisterRow(fullRow)} onChange={e=>changeCorrectionField(fullRow, i, e.target.value)}>{fieldOptions.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label><label>Reason <input className="mt-input" value={correction.reason || ""} onChange={e=>setCorrection(c=>({ ...(c||{}), reason:e.target.value }))} placeholder="Correction reason" style={{minWidth:240}}/></label><button className="mt-btn primary" onClick={()=>saveInlineCorrection(fullRow, i)}><CheckCircle2 size={14}/>Save correction</button><button className="mt-btn ghost" onClick={()=>setCorrection(null)}>Cancel</button></div><div className="mt-correction-grid">{correctionSizeListForRow(fullRow, correction.field || defaultCorrectionFieldForRegisterRow(fullRow)).map(sz=>{ const target = rows.find(x=>String(x.order_no||"")===String(fullRow.Order||"") && String(x.style_no||"")===String(fullRow.Style||"") && String(x.colour||"")===String(fullRow.Colour||"") && String(x.component||"")===String(fullRow.Component||"")) || {}; const masterSizes = new Set(sizesFor(target).map(x=>String(x).toUpperCase())); const original = n(registerFieldSizeMap(fullRow, correction.field || defaultCorrectionFieldForRegisterRow(fullRow), correctionSizeListForRow(fullRow, correction.field || defaultCorrectionFieldForRegisterRow(fullRow)))[sz]); const next = n(correction.values?.[sz]); const delta = next - original; const isMaster = masterSizes.has(String(sz).toUpperCase()); return <div className="mt-correction-size" key={sz}><div className="sz">{sz}</div><div className="mt-small">Old {fmt(original)} {isMaster ? "" : "· not in style size set"}</div><input className="mt-cell-input" value={Object.prototype.hasOwnProperty.call(correction.values || {}, sz) ? correction.values[sz] : ""} onChange={e=>setCorrectionQty(sz, e.target.value)} placeholder="Correct qty"/><div className={`mt-small ${delta?"warn":""}`}>Diff {delta>0?"+":""}{fmt(delta)}</div></div>; })}</div></div></td></tr>}</React.Fragment>; }) : <tr><td colSpan={cols.length + (registerMode === "detail" ? 1 : 0)} style={{padding:18}}>No activity entries found for this filter.</td></tr>}</tbody></table></div>
    <div className="mt-speed-note"><b>Register view rule:</b> Summary is default for management reading. Use Day-wise for department/date breakup. Use Detail / Edit only when correcting old entries. Correction does not overwrite old rows; it posts the difference as a correction ledger row so WIP updates immediately.</div>
  </div>;
}

function stagePlanSources(row, dept){
  const route = routeFor(row);
  const idx = route.indexOf(dept);
  const st = sdata(row, dept);
  const feed = stageFeed(row, dept);
  const prevStage = idx > 0 ? route[idx-1] : null;
  const prev = prevStage ? sdata(row, prevStage) : null;
  const sources = [];
  if (dept === "cutting") {
    sources.push({ key:"order_qty", label:"Order quantity", qty:n(row.order_qty), readyType:"Actual order qty", status:"Ready" });
  } else {
    sources.push({ key:"route_ready", label: prevStage ? `${stageLabel(prevStage)} ready / issued` : "Route ready", qty:feed, readyType:"Actual ready", status: feed > 0 ? "Ready" : "Not ready" });
    if (prevStage) sources.push({ key:"previous_output", label:`${stageLabel(prevStage)} completed`, qty:n(prev.output), readyType:"Previous dept output", status:n(prev.output)>0?"Ready":"Not ready" });
  }
  sources.push({ key:"dept_received", label:`${stageLabel(dept)} fed/accountable`, qty:n(st.received || feed), readyType:"Dept has feed", status:n(st.received || feed)>0?"Ready":"Not ready" });
  sources.push({ key:"manual_future", label:"Manual Future Plan", qty:n(row.order_qty), readyType:"Manual / risk", status:"Manual future / risk" });
  return sources;
}
function bestPlanSource(row, dept){
  const srcs = stagePlanSources(row, dept);
  return srcs.find(s=>n(s.qty)>0 && s.key!=="manual_future") || srcs[srcs.length-1] || { key:"manual_future", label:"Manual Future Plan", qty:n(row?.order_qty), readyType:"Manual / risk", status:"Manual future / risk" };
}
function planningPoolRows(rows, dept, planRows=[]){
  return (rows||[]).map(row=>{
    const src = bestPlanSource(row, dept);
    const alreadyPlanned = (planRows||[]).filter(p=>p.row_id===row.id && p.dept===dept).reduce((a,p)=>a+n(p.planned_qty),0);
    const available = Math.max(0, n(src.qty) - alreadyPlanned);
    return {
      row,
      Order:row.order_no,
      Style:row.style_no,
      Buyer:row.buyer,
      Colour:row.colour,
      Component:row.component,
      Source:src.label,
      Source_Type:src.readyType,
      Available:available,
      Already_Planned:alreadyPlanned,
      Status: src.key === "manual_future" ? "Manual future / risk" : (available>0 ? "Open to plan" : "Fully planned / no qty")
    };
  }).filter(x=>n(x.Available)>0 || x.Status.includes("risk"))
    .sort((a,b)=>n(b.Available)-n(a.Available) || String(a.Order).localeCompare(String(b.Order)));
}
function demoPlanRowsFromRows(rows=[]){
  // Safe demo seed for the Planning tab. Keep this small; real plans are user-entered.
  const baseDate = defaultEntryDate([]);
  return (rows||[]).slice(0,3).map((row,i)=>{
    const dept = i === 0 ? "stitching" : (i === 1 ? "checking" : "packing");
    const src = bestPlanSource(row, dept);
    const qty = Math.max(0, Math.min(n(src.qty) || n(row.order_qty), n(row.daily_target) || 800));
    return {
      id:uid("plan"),
      row_id:row.id,
      order_no:row.order_no,
      style_no:row.style_no,
      buyer:row.buyer,
      colour:row.colour,
      component:row.component,
      dept,
      line:dept === "stitching" ? (row.line || productionLineNames()[0] || "STF-1") : "",
      plan_date:baseDate,
      source:src.key,
      source_label:src.label,
      source_type:src.readyType,
      planned_qty:qty,
      eight_hr_target:n(row.daily_target) || 1200,
      changeover:false,
      remaining_hours:8,
      difficulty:row.difficulty || "Normal",
      status:"Demo plan",
      remarks:"Demo seed; replace with actual plan rows."
    };
  }).filter(p=>n(p.planned_qty)>0);
}

const CHANGEOVER_LOST_HOURS = 2;
const DEFAULT_PLAN_HEADCOUNT = 40;
function changeoverLostHoursForPlan(p){ return p?.changeover ? Math.min(CHANGEOVER_LOST_HOURS, Math.max(0, n(p?.remaining_hours || p?.run_hours || 8) || 8)) : 0; }
function planProductiveHours(p){ const hours = n(p?.remaining_hours || p?.run_hours || 8) || 8; return Math.max(0, hours - changeoverLostHoursForPlan(p)); }
function planAutoQtyFromTarget(p){
  const target = n(p?.eight_hr_target || p?.full_day_output || p?.daily_target || 0);
  if (!target) return 0;
  const productiveHours = planProductiveHours(p);
  return Math.max(0, Math.round((target / 8) * productiveHours));
}
function planCapacityCeilingInfo(p){
  if (p?.cover_recovery_slot) return { ceiling:Infinity, blocked:false, text:"Cover commitment slot does not consume normal OPS capacity." };
  const target = n(p?.eight_hr_target || p?.full_day_output || p?.daily_target || 0);
  const hours = n(p?.remaining_hours || p?.run_hours || p?.plan_hours || 0) || 8;
  if (!target || !hours) return { ceiling:Infinity, blocked:false, text:"Capacity target/hours missing; warning only." };
  const ceiling = planAutoQtyFromTarget(p);
  const qty = n(p?.planned_qty);
  return { ceiling, blocked:qty > ceiling && ceiling > 0, text:`Capacity ceiling ${fmt(ceiling)} from ${fmt(target)} pcs/8h × ${fmt(planProductiveHours(p))} productive hours${p?.changeover ? ` after ${fmt(changeoverLostHoursForPlan(p))}h changeover loss` : ""}.` };
}
function planRowEffectiveQty(p){
  if (p?.qty_auto_mode || p?.use_auto_qty) return planAutoQtyFromTarget(p);
  return n(p?.planned_qty) || planAutoQtyFromTarget(p);
}
function defaultFullDayOutputForStyle(row){
  return n(row?.daily_target || row?.plan_qty || row?.eight_hr_target || row?.target_8hr || 0) || 1200;
}
function defaultOpsForStyle(row){
  return n(row?.ops || row?.operator_count || row?.operators || row?.manpower || row?.headcount || row?.line_headcount || 0);
}
function achievedForPlan(plan, rows, ledger=[]){
  const date = String(plan.plan_date||"").slice(0,10);
  const style = String(planStyleText(plan) || plan.style_no || "").trim().toUpperCase();
  const dept = plan.dept;
  const line = String(plan.line || "").trim();
  const linked = resolvePlanStyle(rows, plan);
  const outputTypes = ["good_output","output","alter_clear"];
  const fromLedger = (ledger||[]).filter(e=>{
    if (String(e.entry_date||"").slice(0,10) !== date) return false;
    if (String(e.stage||"") !== dept) return false;
    if (!outputTypes.includes(String(e.entry_type||e.type||"").toLowerCase())) return false;
    if (linked) {
      if (!ledgerEntryMatchesStyle(e, linked)) return false;
    } else {
      const eStyle = String(e.style_no||e.style||"").trim().toUpperCase();
      if (eStyle !== style) return false;
    }
    if (dept === "stitching" && line) {
      const eLine = String(e.line || e.stitching_line || "").trim();
      if (eLine && eLine !== line) return false; // blank line on old ledger rows is not treated as a mismatch
    }
    return true;
  });
  if (fromLedger.length) return fromLedger.reduce((a,e)=>a+n(e.qty ?? e.delta ?? e.good_qty),0);
  const row = linked || rows.find(r=>r.id===plan.row_id || (String(r.style_no||"").trim().toUpperCase()===style && r.order_no===plan.order_no && (!plan.component || String(r.component||"").trim().toUpperCase()===String(plan.component||"").trim().toUpperCase())));
  if (!row) return 0;
  const st = sdata(row, dept);
  if (dept === "stitching" && line && row.line && row.line !== line) return 0;
  return Math.min(planReportQty(plan), n(st.output));
}
function planVsAchievedRows(planRows, rows, ledger=[]){
  return (planRows||[]).map(p=>{
    const achieved = achievedForPlan(p, rows, ledger);
    const plan = planReportQty(p);
    const sameStyleActual = achieved > 0;
    return { Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line || "Dept total", Planned_Style:p.style_no || p.style_input, Buyer:p.buyer, Source:p.source_label || p.source, Source_Type:p.source_type, Difficulty:p.difficulty, Planned:plan, Achieved:achieved, Variance:achieved-plan, Qty_Achievement:plan?`${Math.round(achieved*1000/plan)/10}%`:"—", Style_Adherence:sameStyleActual?"Matched / partial":"No matching actual yet", Plan_Status:p.status || "Draft", Remarks:p.remarks || "" };
  });
}
function planDeviationRows(planRows, rows, ledger=[]){
  return planVsAchievedRows(planRows, rows, ledger).filter(r=>n(r.Variance)!==0 || r.Style_Adherence !== "Matched / partial").map(r=>({ ...r, Review_Action: n(r.Achieved)>0 ? "Follow balance / rollover" : "Confirm why planned style not produced" }));
}
function reviewBuckets(rows, ledger=[], planRows=[]){
  const ready = [];
  const cannotClose = [];
  const reconcile = [];
  const ram = [];
  rows.forEach(row=>{
    routeFor(row).forEach(stage=>{
      const st = sdata(row,stage), c=cellBreakup(row,stage);
      const base = { Dept:stageLabel(stage), Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, Owner:"Production Coordinator", HOD:stageOwner(stage), Feed:(stage === "cutting" ? n(row.order_qty) : stageFeed(row, stage)), Output:n(st.output), Issued:n(st.issued), Open:n(c.open), RAM:n(c.ram), Idle:`${n(st.idle)}d`, _row:row, _stage:stage, _activity:"all" };
      const buckets = issueBuckets(row).filter(b=>b.stage===stage);
      const hasRecon = buckets.some(b=>b.type==="reconcile");
      if (hasRecon) reconcile.push({ ...base, Problem:buckets.filter(b=>b.type==="reconcile").map(b=>b.status).join(" | "), Difference:buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0), Action:"Correct entry or approved adjustment" });
      else if (n(c.open)===0 && n(c.ram)===0 && (n(st.received)>0 || n(st.output)>0 || n(st.issued)>0)) ready.push({ ...base, Closure_Status:"Ready to close", Action:"Coordinator to close department/style" });
      else if (n(c.open)>0) cannotClose.push({ ...base, Closure_Status:"Cannot close - open balance", Action:"Explain balance / issue forward / receive confirm" });
      if (n(c.ram)>0) ram.push({ ...base, Issue_Type:"R/A/M", Total_RAM:n(c.ram), Action:"Close rejection / alter / missing reason and recovery" });
    });
  });
  // Reconcile is the single control room for every stock-truth blocker:
  // 1) live P0 stock/date audit, 2) conservation snapshot mismatches, and
  // 3) already-saved P0/reconcile override ledger rows. Every row carries
  // _row/_stage so Review can open the exact editable Register correction context.
  p0StockAuditIssues(rows, ledger).forEach(issue=>{
    reconcile.push({
      Reconcile_Source:"P0 stock/date audit",
      Severity:issue.severity === "block" ? "P0 Block" : "Review",
      Dept:stageLabel(issue.stage), Order:issue.row?.order_no || "", Style:issue.row?.style_no || "", Buyer:issue.row?.buyer || "", Colour:issue.row?.colour || "", Component:issue.row?.component || "",
      Entry_Date:issue.date || "Current", Problem:issue.type, Difference:n(issue.qty), Message:issue.message,
      Action:"Click row → open Register correction for this style/dept. Correct source entry or post approved adjustment.",
      _row:issue.row, _stage:issue.stage, _activity:"all"
    });
  });
  conservationViolationRows(rows).forEach(v=>{
    reconcile.push({
      Reconcile_Source:"Conservation snapshot",
      Severity:v.stage === "cutting" ? "Tolerance check" : "Stock mismatch",
      Dept:stageLabel(v.stage), Order:v.row?.order_no || "", Style:v.row?.style_no || "", Buyer:v.row?.buyer || "", Colour:v.row?.colour || "", Component:v.row?.component || "",
      Entry_Date:"Current", Problem:v.kind || "conservation_mismatch", Feed:n(v.feed), Output:n(v.good), RAM:n(v.ram), Open:n(v.open), Difference:n(v.diff), Message:v.message,
      Action:v.stage === "cutting" ? "Click row → edit cutting output/RAM or style release/order feed." : "Click row → edit feed source/output/RAM in Register.",
      _row:v.row, _stage:v.stage, _activity:"all"
    });
  });
  const riskyLedger = ledger || [];
  const p0Ledger = riskyLedger.filter(e=>String(e.validation_status || e.validation_snapshot?.validation_status || "").includes("p0_date_sequence") || String(e.validation_scope || "").includes("p0_date_sequence"));
  p0Ledger.forEach(e=>{
    const linkedRow = findRowForLedger(rows, e);
    reconcile.push({
      Reconcile_Source:"Saved P0 override",
      Severity:"Review",
      Dept:stageLabel(e.stage), Order:e.order_no || e.order || "", Style:e.style_no || e.style || "", Buyer:e.buyer || "", Colour:e.colour || "", Component:e.component || "",
      Problem:"P0 date-sequence override", Difference:n(e.qty !== undefined ? e.qty : e.delta), Entry_Date:e.entry_date, Size:e.size || "Total", User:e.changed_by || e.created_by || e.validation_snapshot?.changed_by || "—",
      Action:"Click row → open Register correction. This was allowed only by confirmation and remains open until corrected/approved.",
      Message:(e.validation_messages || e.validation_snapshot?.validation_messages || []).slice(0,2).join(" | "),
      _row:linkedRow, _stage:e.stage, _activity:ledgerType(e) || "all"
    });
  });
  const risky = riskyLedger.filter(e=>e.is_backdated || e.backdate_reason || e.approval_status || e.validation_snapshot?.backdate_reason || String(e.validation_status || e.validation_snapshot?.validation_status || "").includes("p0_date_sequence")).map(e=>{
    const qtyVal = e.qty ?? e.delta;
    return { Entry_Date:e.entry_date, Created_At:e.created_at, User:e.changed_by || e.created_by || e.validation_snapshot?.changed_by || "—", Dept:stageLabel(e.stage), Line:e.line || e.stitching_line || "", Style:e.style_no || e.style, Size:e.size || "Total", Qty:qtyVal, Reason:e.backdate_reason || e.validation_snapshot?.backdate_reason || "", Flag:e.approval_status || e.validation_snapshot?.approval_status || e.validation_status || e.validation_snapshot?.validation_status || "date_flag_report_only" };
  });
  return { ready, cannotClose, reconcile, ram, risky, planDev:planDeviationRows(planRows, rows, ledger) };
}

function splitUploadLine(line){
  const sep = line.includes("\t") ? "\t" : ",";
  return line.split(sep).map(x=>x.trim().replace(/^"|"$/g,""));
}
function normHeader(h){ return String(h||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,""); }
function boolFrom(v){ return ["yes","y","true","1","required","req"].includes(String(v||"").trim().toLowerCase()); }
function parseOrderUploadText(text){
  const lines = String(text||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitUploadLine(lines[0]).map(normHeader);
  const get = (obj, names) => names.map(normHeader).map(k=>obj[k]).find(v=>v!==undefined && v!=="") || "";
  return lines.slice(1).map(line=>{
    const vals = splitUploadLine(line);
    const o = Object.fromEntries(headers.map((h,i)=>[h, vals[i] ?? ""]));
    const order_no = get(o,["order","order no","order_no","so"]);
    const style_no = get(o,["style","style no","style_no"]);
    if (!style_no && !order_no) return null;
    const buyer = get(o,["buyer","brand","customer"]);
    const colour = get(o,["colour","color"]);
    const component = get(o,["component","garment","part"]) || "Main";
    const size_set = normalizeSizeSetName(get(o,["size set","size_set"]) || "alpha");
    const sizeList = getSizeSets()[size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
    const sizeQtyRaw = {};
    sizeList.forEach(size=>{
      const val = get(o,[size, `size ${size}`, `${size} qty`, `qty ${size}`, `order ${size}`]);
      if (val !== "") sizeQtyRaw[size] = n(val);
    });
    const parsedBreakup = parseSizeQtyText(get(o,["order size breakup","size breakup","size qty"]));
    Object.entries(parsedBreakup).forEach(([k,v])=>{ if (sizeList.includes(k)) sizeQtyRaw[k]=v; });
    const order_size_qty = normalizeSizeQtyMap(sizeQtyRaw, sizeList);
    const sizeTotal = qtyMapTotal(order_size_qty);
    const qty = n(get(o,["qty","order qty","order_qty","quantity","pcs"])) || sizeTotal;
    return {
      id: uid("bulk"),
      order_no: order_no || `ORDER-${style_no}`,
      style_no: style_no || order_no,
      buyer,
      colour,
      component,
      set_id:get(o,["set","set id","set_id"]),
      order_qty: qty,
      order_size_qty,
      size_set,
      line:get(o,["line","default_line"]),
      difficulty:get(o,["difficulty"]) || "Normal",
      priority:get(o,["priority"]) || "Normal",
      daily_target:n(get(o,["8hr target","8hr_target","daily target","daily_target","target"])),
      photo_url:get(o,["photo","photo url","photo_url"]),
      photo_thumb_url:get(o,["thumbnail","thumb","photo thumb url","photo_thumb_url"]),
      photo_folder_url:get(o,["folder","photo folder","onedrive","onedrive url","photo_folder_url"]),
      print_required:boolFrom(get(o,["print","print req","print_required"])),
      embroidery_required:boolFrom(get(o,["embroidery","emb req","embroidery_required"])),
      stages:{ cutting:{ ...blankStage() }, printing:{ ...blankStage() }, embroidery:{ ...blankStage() }, stitching:{ ...blankStage() }, checking:{ ...blankStage() }, packing:{ ...blankStage() }, dispatch:{ ...blankStage() } },
    };
  }).filter(Boolean);
}
function mergeUploadedRows(rows, uploaded){
  const keyOf = r => [r.order_no,r.style_no,r.colour,r.component].map(x=>String(x||"").trim().toUpperCase()).join("|");
  const map = new Map(rows.map(r=>[keyOf(r), r]));
  uploaded.forEach(u=>{
    const k = keyOf(u);
    const existing = map.get(k);
    if (existing) map.set(k, { ...existing, ...u, id:existing.id, stages:{ ...u.stages, ...(existing.stages||{}) }, route:routeFor(u) });
    else map.set(k, { ...u, route:routeFor(u) });
  });
  return Array.from(map.values());
}
function applyPlanRollover(planRows, rows, ledger=[]){
  const sorted = [...(planRows||[])].sort((a,b)=>String(a.dept).localeCompare(String(b.dept)) || String(a.line||"").localeCompare(String(b.line||"")) || String(a.plan_date).localeCompare(String(b.plan_date)));
  const carry = new Map();
  return sorted.map(p=>{
    const key = `${p.dept}|${p.line||"dept"}`;
    const incoming = n(carry.get(key));
    const planned = n(p.planned_qty) + incoming;
    const achieved = achievedForPlan({ ...p, planned_qty:planned }, rows, ledger);
    const shortfall = Math.max(0, planned - achieved);
    carry.set(key, shortfall);
    return { ...p, planned_qty:planned, auto_rollover_qty:incoming, achieved_qty_snapshot:achieved, status: shortfall ? "Auto rollover / open" : (p.status || "Draft") };
  });
}

function planningSixDays(startDate){
  const out=[];
  const d=parseYmd(startDate || today());
  while(out.length<6){
    if(d.getDay()!==0) out.push(ymd(d));
    d.setDate(d.getDate()+1);
  }
  return out;
}
function shortDayLabel(iso){
  const d=parseYmd(iso);
  return d.toLocaleString("en-US", { weekday:"short", day:"numeric", month:"short" });
}
function samePlanRow(p, base, day){
  return p.row_id===base.row_id && p.dept===base.dept && (p.line||"")===(base.line||"") && p.plan_date===day;
}

function lineBoardWeekStart(iso){
  const d = parseYmd(iso || today());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return ymd(d);
}
function nextProductionMonday(iso=today()){
  const d = parseYmd(iso || today());
  const day = d.getDay() || 7;
  const add = day === 1 ? 7 : (8 - day);
  d.setDate(d.getDate() + add);
  return ymd(d);
}
function planCellLineKey(activeDept, line){ return activeDept === "stitching" ? String(line || "").trim() : `${activeDept}_total`; }
function planCellMatches(p, activeDept, line, day){ return String(p.dept||"")===String(activeDept) && String(p.plan_date||"").slice(0,10)===String(day||"").slice(0,10) && String(p.line || planCellLineKey(activeDept,line) || "")===String(planCellLineKey(activeDept,line)||""); }
function planExactIdentityKey(item, rows=[]){
  const linked = resolvePlanStyle(rows, item);
  const obj = linked || item || {};
  const style = String(obj.style_no || planStyleText(obj) || "").trim().toUpperCase();
  const order = String(obj.order_no || "").trim().toUpperCase();
  const colour = String(obj.colour || obj.color || "").trim().toUpperCase();
  const component = String(obj.component || "").trim().toUpperCase();
  if (style) return [order, style, colour, component].join("|");
  const id = obj.id || obj.row_id;
  return id ? `ID:${String(id).trim()}` : "";
}
function samePlanExactIdentity(a, b, rows=[]){
  const ak = planExactIdentityKey(a, rows);
  const bk = planExactIdentityKey(b, rows);
  return !!ak && !!bk && ak === bk;
}
function isSamePlanCellSlot(p, candidate, activeDept="stitching", line="", day="", slotNo=1){
  if (!p || !candidate) return false;
  const currentDay = String(day || candidate.plan_date || "").slice(0,10);
  const currentLine = String(planCellLineKey(activeDept, line) || candidate.line || "");
  const currentSlot = n(slotNo || candidate.slot_no || 1) || 1;
  if (candidate.id && String(p.id || "") === String(candidate.id)) return true;
  return String(p.dept || "") === String(activeDept || candidate.dept || "")
    && String(p.plan_date || "").slice(0,10) === currentDay
    && String(p.line || "") === currentLine
    && planSlotNo(p) === currentSlot;
}
function planAllocationHorizonStart(){ return today(); }
function isPlanAllocationRowActive(p){
  const d = String(p?.plan_date || "").slice(0,10);
  return !!d && d >= planAllocationHorizonStart();
}
function sameHorizonAllocatedPlanRows(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){
  if (!candidate || !planStyleText(candidate)) return [];
  const candidateKey = planExactIdentityKey(candidate, rows);
  if (!candidateKey) return [];
  const currentDay = String(day || candidate.plan_date || "").slice(0,10);
  return (planRows || []).filter(p=>{
    if (!p || !planStyleText(p)) return false;
    if (String(p.dept || "") !== String(activeDept || candidate.dept || "")) return false;
    if (!isPlanAllocationRowActive(p)) return false;
    if (isSamePlanCellSlot(p, candidate, activeDept, line, currentDay, slotNo)) return false;
    return samePlanExactIdentity(p, candidate, rows);
  }).sort((a,b)=>String(a.plan_date||"").localeCompare(String(b.plan_date||"")) || String(a.line||"").localeCompare(String(b.line||"")) || planSlotNo(a)-planSlotNo(b));
}
function sameHorizonAllocatedPlanQty(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){
  return sameHorizonAllocatedPlanRows(candidate, rows, planRows, activeDept, line, day, slotNo).reduce((a,p)=>a+planRowEffectiveQty(p),0);
}
// Backward-compatible names: the guard now reserves quantity across the full future planning horizon, not only the visible week/day.
function planAllocationWeekDaysFor(day){ return planningSixDays(lineBoardWeekStart(day || today())); }
function planAllocationWeekSet(day){ return new Set(planAllocationWeekDaysFor(day).map(d=>String(d).slice(0,10))); }
function sameWeekAllocatedPlanRows(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){ return sameHorizonAllocatedPlanRows(candidate, rows, planRows, activeDept, line, day, slotNo); }
function sameWeekAllocatedPlanQty(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){ return sameHorizonAllocatedPlanQty(candidate, rows, planRows, activeDept, line, day, slotNo); }
function sameDayAllocatedPlanRows(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){ return sameHorizonAllocatedPlanRows(candidate, rows, planRows, activeDept, line, day, slotNo); }
function sameDayAllocatedPlanQty(candidate, rows=[], planRows=[], activeDept="stitching", line="", day="", slotNo=1){ return sameHorizonAllocatedPlanQty(candidate, rows, planRows, activeDept, line, day, slotNo); }
function planQuantityAllocationMessage(guard){
  if (!guard) return "";
  const allocationRows = guard.horizonAllocatedRows || guard.weekAllocatedRows || guard.sameDayRows || [];
  const places = allocationRows.slice(0,5).map(p=>`${shortDayLabel(String(p.plan_date||"").slice(0,10))} ${p.line || "Dept total"} slot ${planSlotNo(p)}: ${fmt(planRowEffectiveQty(p))}`).join("; ");
  const more = allocationRows.length > 5 ? ` +${allocationRows.length - 5} more` : "";
  const used = n(guard.actualConsumedForAllocation) + n(guard.horizonAllocatedQty ?? guard.weekAllocatedQty ?? guard.sameDayAllocatedQty);
  return `Qty allocation across full future plan: available ${fmt(guard.availableForThisSlot)} after actual done ${fmt(guard.actualConsumedForAllocation)} + already planned/reserved ${fmt(guard.horizonAllocatedQty ?? guard.weekAllocatedQty ?? guard.sameDayAllocatedQty)}${places ? ` (${places}${more})` : ""}.`;
}
// Kept for old references, but split-line planning is now allowed. Quantity allocation guard handles over-planning.
function findSameDayOtherLineDuplicatePlan(){ return null; }
function planDuplicateLineMessage(){ return "Split lines are allowed. Quantity guard checks only remaining unplanned qty."; }
function planSlotNo(p){ return Math.max(1, n(p?.slot_no || p?.slot || p?.sequence || p?.metadata?.slot_no || 1) || 1); }
function lineDayPlanRows(planRows, activeDept, line, day){
  return (planRows||[]).filter(p=>planCellMatches(p, activeDept, line, day)).sort((a,b)=>planSlotNo(a)-planSlotNo(b) || String(a.updated_at||a.created_at||"").localeCompare(String(b.updated_at||b.created_at||"")));
}
function planHours(p){ return Math.max(0, Math.min(8, n(p?.remaining_hours || p?.run_hours || p?.plan_hours || 0))); }
function usedPlanHours(list=[], excludeId="", beforeSlot=999){ return (list||[]).filter(p=>p?.id!==excludeId && planSlotNo(p)<beforeSlot).reduce((a,p)=>a+planHours(p),0); }
function remainingHoursBeforeSlot(list=[], p={}){ return Math.max(0, 8 - usedPlanHours(list, p?.id || "", planSlotNo(p))); }
function totalUsedPlanHours(list=[], excludeId=""){ return (list||[]).filter(p=>p?.id!==excludeId).reduce((a,p)=>a+planHours(p),0); }
function planDayHoursCovered(list=[]){ return totalUsedPlanHours(list) >= 7.75; }
function planRowLooksManuallyCovered(p={}){
  const text = String([p?.remarks, p?.source, p?.source_label, p?.source_type, p?.status].filter(Boolean).join(" ")).toLowerCase();
  return /manual|cover|covered|continue|cascade|recovery/.test(text) || !p?.qty_auto_mode;
}
function dayRemainingAfterSlot(list=[], p={}){ return Math.max(0, 8 - (usedPlanHours(list, p?.id || "", planSlotNo(p)) + planHours(p))); }
function planStyleText(p){ return String(p?.style_input || p?.style_no || "").trim(); }
function styleKeyOf(row){ return [row?.order_no,row?.style_no,row?.colour,row?.component].map(x=>String(x||"").trim().toUpperCase()).join("|"); }
function planStyleOptionValue(row){
  return [row?.style_no, row?.order_no, row?.colour, row?.component].map(x=>String(x||"").trim()).filter(Boolean).join(" | ");
}
function planRowNaturalMatch(row, hint={}){
  if (!row || !hint) return false;
  const hs = String(hint.style_no || hint.style_input || "").trim().toUpperCase();
  if (hs && String(row.style_no||"").trim().toUpperCase() !== hs) return false;
  const fields = [["order_no","order_no"],["colour","colour"],["component","component"]];
  return fields.every(([rk,hk])=>{
    const hv = String(hint?.[hk] || "").trim().toUpperCase();
    return !hv || String(row?.[rk] || "").trim().toUpperCase() === hv;
  });
}
function resolvePlanStyle(rows, raw){
  const list = rows || [];
  const hint = raw && typeof raw === "object" ? raw : {};
  const text = raw && typeof raw === "object" ? planStyleText(raw) : String(raw || "").trim();
  const q = String(text || "").trim().toUpperCase();
  if (hint?.row_id) {
    const byId = list.find(r=>String(r.id)===String(hint.row_id));
    if (byId) return byId;
  }
  if (hint && (hint.order_no || hint.colour || hint.component || hint.style_no)) {
    const byNatural = list.find(r=>planRowNaturalMatch(r, hint));
    if (byNatural) return byNatural;
  }
  if (!q) return null;
  const optionExact = list.find(r=>planStyleOptionValue(r).toUpperCase()===q || styleKeyOf(r)===q.replace(/\s*\|\s*/g,"|"));
  if (optionExact) return optionExact;
  const parts = q.split("|").map(x=>x.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const [style, order, colour, component] = parts;
    const byParts = list.find(r=>
      String(r.style_no||"").trim().toUpperCase()===style &&
      (!order || String(r.order_no||"").trim().toUpperCase()===order) &&
      (!colour || String(r.colour||"").trim().toUpperCase()===colour) &&
      (!component || String(r.component||"").trim().toUpperCase()===component)
    );
    if (byParts) return byParts;
  }
  const exactStyleMatches = list.filter(r=>String(r.style_no||"").trim().toUpperCase()===q);
  if (exactStyleMatches.length === 1) return exactStyleMatches[0];
  if (exactStyleMatches.length > 1) return exactStyleMatches[0];
  return list.find(r=>[r.style_no,r.order_no,r.buyer,r.colour,r.component].join(" ").toUpperCase().includes(q)) || null;
}
function sumPlanQty(planRows, matcher){ return (planRows||[]).filter(matcher).reduce((a,p)=>a+n(p.planned_qty),0); }
function upstreamStageFor(row, dept){ const route=routeFor(row); const idx=route.indexOf(dept); return idx>0 ? route[idx-1] : null; }
function plannedQtyUpTo(planRows, row, dept, iso, includeSameDay=false){
  const key = styleKeyOf(row); const day = String(iso||"").slice(0,10);
  return sumPlanQty(planRows, p=>String(p.dept)===String(dept) && String(p.plan_date||"").slice(0,10) && (includeSameDay ? String(p.plan_date).slice(0,10)<=day : String(p.plan_date).slice(0,10)<day) && (p.row_id===row?.id || styleKeyOf(p)===key));
}
const DEFAULT_PLAN_FEED_BUFFERS = { cutting:0, printing:2, embroidery:1, stitching:0, checking:0, packing:0, dispatch:0 };
function planFeedBufferDays(stage){
  try {
    const saved = JSON.parse(localStorage.getItem("production_plan_feed_buffers") || "{}");
    if (saved && saved[stage] !== undefined) return Math.max(0, n(saved[stage]));
  } catch {}
  return DEFAULT_PLAN_FEED_BUFFERS[stage] ?? 0;
}
function addCalendarDaysIso(iso, days){
  const d = parseYmd(iso || today());
  d.setDate(d.getDate() + n(days));
  return ymd(d);
}
function planReadyDateForDownstream(prevStage, planDate){
  return addCalendarDaysIso(planDate, planFeedBufferDays(prevStage));
}
function projectedPlanQtyReadyBy(planRows, row, prevStage, downstreamDept, downstreamDay){
  const key = styleKeyOf(row);
  const cutoff = String(downstreamDay || "").slice(0,10);
  const matches = (planRows||[]).filter(p=>{
    const pday = String(p.plan_date||"").slice(0,10);
    if (!pday || String(p.dept) !== String(prevStage)) return false;
    if (!(p.row_id===row?.id || styleKeyOf(p)===key)) return false;
    return planReadyDateForDownstream(prevStage, pday) <= cutoff;
  });
  const qty = matches.reduce((a,p)=>a+planRowEffectiveQty(p),0);
  const lastDate = matches.map(p=>String(p.plan_date||"").slice(0,10)).sort().pop() || "";
  return { qty, rows:matches.length, last_plan_date:lastDate, buffer_days:planFeedBufferDays(prevStage), stage:prevStage, downstream:downstreamDept };
}
function ledgerEntryMatchesStyle(e, row){
  if (!row) return false;
  const eo = String(e.order_no || e.order || "").trim().toUpperCase();
  const es = String(e.style_no || e.style || "").trim().toUpperCase();
  const ec = String(e.colour || e.color || "").trim().toUpperCase();
  const comp = String(e.component || "").trim().toUpperCase();
  const ro = String(row.order_no || "").trim().toUpperCase();
  const rs = String(row.style_no || "").trim().toUpperCase();
  const rc = String(row.colour || "").trim().toUpperCase();
  const rcomp = String(row.component || "").trim().toUpperCase();
  return (!eo || eo === ro) && (!es || es === rs) && (!ec || ec === rc) && (!comp || comp === rcomp);
}
function ledgerQtyUpTo(ledger=[], row, stage, day, types=["good_output","output"]){
  const cutoff = String(day || "").slice(0,10);
  const typeSet = new Set(types.map(x=>String(x).toLowerCase()));
  return (ledger||[]).filter(e=>{
    const eDay = String(e.entry_date || e.date || e.created_at || "").slice(0,10);
    const typ = String(e.entry_type || e.type || e.field || "").toLowerCase();
    return String(e.stage || e.dept || "") === String(stage || "") && (!cutoff || eDay <= cutoff) && typeSet.has(typ) && ledgerEntryMatchesStyle(e, row);
  }).reduce((a,e)=>a+n(e.qty ?? e.delta ?? e.good_qty ?? e.output),0);
}
function actualStageOutputAsOf(row, dept, day, ledger=[]){
  // Planning must treat only DPR ledger entries as actual.
  // Do NOT fall back to production_orders.stage_qty/output here, because that snapshot may contain
  // planned/demo/recalculated values and makes the plan look achieved before real DPR is entered.
  return ledgerQtyUpTo(ledger, row, dept, day, ["good_output","output","alter_clear"]);
}
function feedAvailableAsOf(row, dept, day, planRows, ledger=[]){
  if (!row) return { feed:0, prevStage:null, actualPrev:0, plannedPrev:0, projectedPrev:0, note:"No style linked", confidence:"unlinked" };
  if (dept === "cutting") return { feed:n(row.order_qty), prevStage:null, actualPrev:n(row.order_qty), plannedPrev:0, projectedPrev:0, note:"Order qty base", confidence:"actual" };
  const prevStage = upstreamStageFor(row, dept);
  if (!prevStage) return { feed:n(row.order_qty), prevStage:null, actualPrev:n(row.order_qty), plannedPrev:0, projectedPrev:0, note:"No previous route stage", confidence:"actual" };
  const actualPrev = actualStageOutputAsOf(row, prevStage, day, ledger);
  const projected = projectedPlanQtyReadyBy(planRows, row, prevStage, dept, day);
  const projectedPrev = n(projected.qty);
  const feed = Math.min(n(row.order_qty), actualPrev + projectedPrev);
  const confidence = n(feed) <= n(actualPrev) ? "actual_ready" : "depends_on_upstream_plan";
  const note = `${stageLabel(prevStage)} actual ready ${fmt(actualPrev)} + projected from ${stageLabel(prevStage)} plan ready by ${day} ${fmt(projectedPrev)} (${projected.buffer_days}d buffer) = possible feed ${fmt(feed)}`;
  return { feed, prevStage, actualPrev, plannedPrev:projectedPrev, projectedPrev, projectedRows:projected.rows, projectedLastPlanDate:projected.last_plan_date, bufferDays:projected.buffer_days, note, confidence };
}
function remainingForStyleAsOf(row, dept, day, planRows, ledger=[]){
  if (!row) return { remaining:0, feed:0, consumed:0, prevStage:null, note:"Free text style; no master quantity linked." };
  const feedInfo = feedAvailableAsOf(row, dept, day, planRows, ledger);
  const actualDone = actualStageOutputAsOf(row, dept, day, ledger);
  const plannedBefore = plannedQtyUpTo(planRows, row, dept, day, false);
  const shortClosedBefore = (planRows||[]).some(p=>(p.row_id===row.id || styleKeyOf(p)===styleKeyOf(row)) && String(p.dept)===String(dept) && String(p.plan_date||"").slice(0,10)<String(day||"").slice(0,10) && p.short_close);
  // Ground truth is actual completed pieces, not planned qty. Adding plannedBefore on top of actualDone would
  // double-subtract the same days once real DPR entries exist for them (plan for a past day almost always has
  // a matching actual by the time we look at it), silently hiding real shortfall from cascade/remaining math.
  // Only fall back to plannedBefore for days genuinely without any actual/ledger history yet (order not started).
  const consumed = shortClosedBefore ? feedInfo.feed : (actualDone > 0 || plannedBefore === 0 ? actualDone : plannedBefore);
  return { remaining:Math.max(0, n(feedInfo.feed)-n(consumed)), feed:n(feedInfo.feed), consumed:n(consumed), actualDone, plannedBefore, prevStage:feedInfo.prevStage, note:feedInfo.note, shortClosedBefore };
}

function planNeedBreakdown(plan, rows, planRows, activeDept, line, day, ledger=[]){
  const styleText = planStyleText(plan);
  const linked = resolvePlanStyle(rows, plan);
  const qtyNeeded = planRowEffectiveQty(plan);
  if (!linked) return { linked:null, qtyNeeded, actualReadyFeed:0, projectedFeed:0, possibleFeed:0, actualDone:0, plannedBeforeDay:0, plannedBeforeWeek:0, earlierSameDayPlan:0, consumedBeforeSlot:0, availableForThisSlot:0, afterThisSlot:0, feedInfo:null, status:"Unlinked style", tone:"warn" };
  const planDay = String(day || plan?.plan_date || today()).slice(0,10);
  const weekDays = planAllocationWeekDaysFor(planDay);
  const weekStart = weekDays[0] || planDay;
  const weekEnd = weekDays[weekDays.length-1] || planDay;
  const dayBeforeWeek = addCalendarDaysIso(weekStart, -1);
  const feedInfo = feedAvailableAsOf(linked, activeDept, planDay, planRows, ledger);
  const actualDone = actualStageOutputAsOf(linked, activeDept, planDay, ledger);
  const actualDoneBeforeWeek = actualStageOutputAsOf(linked, activeDept, dayBeforeWeek, ledger);
  const plannedBeforeDay = plannedQtyUpTo(planRows, linked, activeDept, planDay, false);
  const plannedBeforeWeek = plannedQtyUpTo(planRows, linked, activeDept, weekStart, false);
  const priorConsumedBeforeWeek = Math.max(n(actualDoneBeforeWeek), n(plannedBeforeWeek));
  const lineKey = planCellLineKey(activeDept,line);
  const slotNo = planSlotNo(plan);
  const horizonAllocatedRows = sameHorizonAllocatedPlanRows({ ...plan, row_id:linked.id, order_no:linked.order_no, style_no:linked.style_no, style_input:linked.style_no, colour:linked.colour, component:linked.component }, rows, planRows, activeDept, lineKey, planDay, slotNo);
  const horizonAllocated = horizonAllocatedRows.reduce((a,p)=>a+planRowEffectiveQty(p),0);
  const allocationBaseQty = Math.max(n(feedInfo.feed), n(linked.order_qty), n(sdata(linked, upstreamStageFor(linked, activeDept)).output));
  const yesterday = addCalendarDaysIso(today(), -1);
  const actualConsumedForAllocation = actualStageOutputAsOf(linked, activeDept, yesterday, ledger);
  const consumedBeforeSlot = n(actualConsumedForAllocation) + n(horizonAllocated);
  const availableForThisSlot = Math.max(0, n(allocationBaseQty) - consumedBeforeSlot);
  const afterThisSlot = availableForThisSlot - n(qtyNeeded);
  const depends = n(feedInfo.projectedPrev) > 0 && n(feedInfo.actualPrev) < n(feedInfo.feed) && n(qtyNeeded) > Math.max(0, n(feedInfo.actualPrev) - consumedBeforeSlot);
  const over = n(qtyNeeded) > availableForThisSlot;
  const tone = over ? "late" : depends ? "warn" : "ok";
  const status = over ? `Over remaining unplanned qty by ${fmt(Math.abs(afterThisSlot))}` : depends ? "OK only if upstream plan is achieved" : "Covered by actual/projected feed and full-horizon unplanned balance";
  return { linked, qtyNeeded, actualReadyFeed:n(feedInfo.actualPrev), projectedFeed:n(feedInfo.projectedPrev), possibleFeed:n(feedInfo.feed), allocationBaseQty:n(allocationBaseQty), actualDone:n(actualDone), actualDoneBeforeWeek:n(actualDoneBeforeWeek), actualConsumedForAllocation:n(actualConsumedForAllocation), plannedBeforeDay:n(plannedBeforeDay), plannedBeforeWeek:n(plannedBeforeWeek), priorConsumedBeforeWeek:n(priorConsumedBeforeWeek), earlierSameDayPlan:n(horizonAllocated), sameDayAllocatedQty:n(horizonAllocated), sameDayRows:horizonAllocatedRows, weekAllocatedQty:n(horizonAllocated), weekAllocatedRows:horizonAllocatedRows, horizonAllocatedQty:n(horizonAllocated), horizonAllocatedRows, consumedBeforeSlot, availableForThisSlot, afterThisSlot, feedInfo, status, tone, depends, over, weekStart, weekEnd };
}
function planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger=[]){
  const b = planNeedBreakdown(plan, rows, planRows, activeDept, line, day, ledger);
  if (!b.linked) return `Need ${fmt(b.qtyNeeded)} this slot, but style is not linked to Style Master. Add style detail to calculate WIP/plan balance.`;
  const parts = [
    `Need this slot ${fmt(b.qtyNeeded)}`,
    `Actual ready feed ${fmt(b.actualReadyFeed)}`,
    `Projected upstream feed ${fmt(b.projectedFeed)}`,
    `Possible feed by ${day} ${fmt(b.possibleFeed)}`,
    `actual done before today ${fmt(b.actualConsumedForAllocation)} + all future planned/reserved ${fmt(b.horizonAllocatedQty ?? b.weekAllocatedQty ?? b.earlierSameDayPlan)}`,
    `available for this slot ${fmt(b.availableForThisSlot)}`,
    `after slot ${fmt(b.afterThisSlot)}`,
    b.status
  ];
  return parts.join(" · ");
}

function planLoadReadyInfo(plan, rows, planRows, activeDept, line, day, ledger=[]){
  const b = planNeedBreakdown(plan, rows, planRows, activeDept, line, day, ledger);
  if (!b.linked) return { tone:"warn", label:"Link style", detail:"Add style master to check load readiness.", readyDate:"", daysBefore:null, depends:false, short:n(b.qtyNeeded) };
  const planDay = String(day || plan?.plan_date || today()).slice(0,10);
  const feedInfo = b.feedInfo || feedAvailableAsOf(b.linked, activeDept, planDay, planRows, ledger);
  const requiredCum = n(b.consumedBeforeSlot) + n(b.qtyNeeded);
  const prevStage = feedInfo?.prevStage;
  if (!prevStage) return { tone:"ok", label:"Order base", detail:`Order base covers ${fmt(b.qtyNeeded)}.`, readyDate:planDay, daysBefore:0, depends:false, short:0 };
  const entries = (ledger||[])
    .filter(e=>String(e.stage || e.dept || "")===String(prevStage) && ledgerEntryMatchesStyle(e, b.linked))
    .filter(e=>["good_output","output","alter_clear"].includes(String(e.entry_type || e.type || e.field || "").toLowerCase()))
    .map(e=>({ date:String(e.entry_date || e.date || e.created_at || "").slice(0,10), qty:n(e.qty ?? e.delta ?? e.good_qty ?? e.output) }))
    .filter(e=>e.date && e.date<=planDay && e.qty)
    .sort((a,c)=>String(a.date).localeCompare(String(c.date)));
  let cum = 0;
  for (const e of entries) {
    cum += n(e.qty);
    if (cum >= requiredCum) {
      const days = dateDiff(e.date, planDay);
      const label = days > 0 ? `${days}d early` : days === 0 ? "Ready same day" : `${Math.abs(days)}d late`;
      return { tone:days>=0?"ok":"late", label, detail:`${fmt(b.qtyNeeded)} can load from actual ${stageLabel(prevStage)} ready on ${e.date}.`, readyDate:e.date, daysBefore:days, depends:false, short:0 };
    }
  }
  if (n(feedInfo.actualPrev) >= requiredCum) {
    const assumed = today() <= planDay ? today() : planDay;
    const days = dateDiff(assumed, planDay);
    return { tone:"ok", label:days>0?`${days}d early`:"Ready now", detail:`Actual ${stageLabel(prevStage)} ready stock covers this slot. Exact ready date not in ledger, treated as available now.`, readyDate:assumed, daysBefore:days, depends:false, short:0 };
  }
  // If this individual slot qty is available from old/actual stock, do not scare the user with plain "Load short".
  // The shortage is only after earlier planned slots have consumed the same stock, so show it as a balance warning.
  if (n(feedInfo.actualPrev) >= n(b.qtyNeeded)) {
    const shortAfterEarlierPlan = Math.max(0, requiredCum - n(feedInfo.actualPrev));
    const assumed = today() <= planDay ? today() : planDay;
    const days = dateDiff(assumed, planDay);
    const timing = days > 0 ? `${days}d early` : days === 0 ? "Ready now" : `${Math.abs(days)}d late`;
    return {
      tone:"ok",
      label:`Ready · ${timing}`,
      detail:`This slot qty ${fmt(b.qtyNeeded)} is available to load from actual ${stageLabel(prevStage)} stock. Earlier planned/done qty is ${fmt(b.consumedBeforeSlot)}; cumulative balance warning, if any, is ${fmt(shortAfterEarlierPlan)} and is shown in detail only, not as a scary cell shortage.`,
      readyDate:assumed,
      daysBefore:days,
      depends:false,
      short:0,
      balanceWarning:shortAfterEarlierPlan>0,
      balanceShort:shortAfterEarlierPlan
    };
  }
  let projectedCum = n(feedInfo.actualPrev);
  const key = styleKeyOf(b.linked);
  const projected = (planRows||[])
    .filter(p=>String(p.dept)===String(prevStage) && (p.row_id===b.linked.id || styleKeyOf(p)===key))
    .map(p=>({ plan:p, readyDate:planReadyDateForDownstream(prevStage, String(p.plan_date||"").slice(0,10)), qty:planRowEffectiveQty(p) }))
    .filter(x=>x.readyDate && x.readyDate<=planDay && x.qty)
    .sort((a,c)=>String(a.readyDate).localeCompare(String(c.readyDate)) || planSlotNo(a.plan)-planSlotNo(c.plan));
  for (const pr of projected) {
    projectedCum += n(pr.qty);
    if (projectedCum >= requiredCum) {
      const days = dateDiff(pr.readyDate, planDay);
      const label = days > 0 ? `${days}d early via plan` : days === 0 ? "Plan-ready same day" : `${Math.abs(days)}d late via plan`;
      return { tone:days>=0?"warn":"late", label, detail:`${fmt(b.qtyNeeded)} can load if ${stageLabel(prevStage)} plan is achieved. Ready ${pr.readyDate} after ${planFeedBufferDays(prevStage)}d buffer.`, readyDate:pr.readyDate, daysBefore:days, depends:true, short:0 };
    }
  }
  const short = Math.max(0, requiredCum - Math.max(n(feedInfo.feed), projectedCum));
  return { tone:"late", label:`Short ${fmt(short)}`, detail:`Not enough actual/projected ${stageLabel(prevStage)} feed by ${planDay}.`, readyDate:"", daysBefore:null, depends:true, short };
}
function planLoadReadyShort(plan, rows, planRows, activeDept, line, day, ledger=[]){
  const r = planLoadReadyInfo(plan, rows, planRows, activeDept, line, day, ledger);
  return r?.label || "";
}
function availableStylePickerRows(rows=[], planRows=[], activeDept="stitching", day=today(), ledger=[], line="", slotNo=1){
  return (rows||[]).map(row=>{
    const pseudo = { row_id:row.id, order_no:row.order_no, colour:row.colour, component:row.component, style_no:row.style_no, style_input:row.style_no, planned_qty:1, dept:activeDept, plan_date:day, line:planCellLineKey(activeDept,line), slot_no:slotNo };
    const b = planNeedBreakdown(pseudo, rows, planRows, activeDept, line, day, ledger);
    const ready = planLoadReadyInfo(pseudo, rows, planRows, activeDept, line, day, ledger);
    const available = Math.max(0, n(b.availableForThisSlot));
    const rank = available>0 && !ready.depends ? 0 : available>0 ? 1 : 2;
    return { row, available, ready, rank };
  }).sort((a,b)=>a.rank-b.rank || n(b.available)-n(a.available) || String(a.row.style_no).localeCompare(String(b.row.style_no)));
}
function planCellSignal(plan, rows, planRows, activeDept, line, day, ledger=[]){
  if (!plan || !planStyleText(plan)) return { tone:"muted", level:"blank", text:"Blank cell — type style, qty, end date and OPS directly." };
  const linked = resolvePlanStyle(rows, plan);
  const qty = n(plan.planned_qty);
  if (plan.short_close) return { tone:"purple", level:"override", text:"Short close override marked — next style can roll even if balance remains." };
  if (!linked) return { tone:"warn", level:"manual_unlinked", text:"Free text style — allowed, but no master qty/cascade check until linked to Styles." };
  const historicalPlanDay = isHistoricalPlanReportingRow({ ...plan, plan_date:day || plan?.plan_date });
  const qtyGuard = planNeedBreakdown(plan, rows, planRows, activeDept, line, day, ledger);
  if (historicalPlanDay && qty) return { tone:"info", level:"historical_reporting", text:`Historical plan row — reporting target preserved. Only compare Actual vs Plan; live open/allocated balance is reference only. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}` };
  if (!historicalPlanDay && qty && qtyGuard.over) return { tone:"late", level:"over_allocated_qty", text:`Planned qty exceeds unplanned balance. ${planQuantityAllocationMessage(qtyGuard)} Split line is allowed, but only remaining qty can be planned.` };
  const cap = planCapacityCeilingInfo(plan);
  if (!historicalPlanDay && qty && cap.blocked) return { tone:"late", level:"capacity_ceiling_exceeded", text:`Planned qty exceeds line/day capacity. ${cap.text} Reduce qty, increase target/hours only if real, or split across another day/line.` };
  const thisRemain = remainingForStyleAsOf(linked, activeDept, day, planRows, ledger);
  const sameDayRowsForCapacity = lineDayPlanRows(planRows, activeDept, line, day);
  const dayHoursAreCovered = planDayHoursCovered(sameDayRowsForCapacity);
  const manualOrCascadeCover = planRowLooksManuallyCovered(plan) || dayHoursAreCovered;
  const previous = (planRows||[]).filter(p=>String(p.dept)===String(activeDept) && String(p.line||"")===String(planCellLineKey(activeDept,line)) && String(p.plan_date||"").slice(0,10)<String(day||"").slice(0,10) && planStyleText(p)).sort((a,b)=>String(b.plan_date).localeCompare(String(a.plan_date)))[0];
  if (previous && !previous.short_close) {
    const prevLinked = resolvePlanStyle(rows, previous);
    const different = planStyleText(previous).toUpperCase() !== planStyleText(plan).toUpperCase();
    if (prevLinked && different) {
      const prevRemain = remainingForStyleAsOf(prevLinked, activeDept, day, planRows, ledger);
      if (prevRemain.remaining > 0 && !manualOrCascadeCover) return { tone:"late", level:"p0_line_cascade_block", text:`Previous style still has ${fmt(prevRemain.remaining)} open. Check only if the line has not already covered it with planned hours/manual output.` };
      if (prevRemain.remaining > 0 && manualOrCascadeCover) return { tone:"ok", level:"covered_by_plan_hours", text:`Line/day hours are already covered by plan/manual cascade. No manager alert needed for previous style balance.` };
    }
  }
  const dependsOnPlan = thisRemain.note && thisRemain.note.includes("projected from");
  if (!qty) return { tone:"warn", level:"missing_qty", text:`Style linked, but Qty is blank. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}` };
  if (qty > thisRemain.remaining && thisRemain.remaining > 0 && manualOrCascadeCover) return { tone:"ok", level:"covered_by_plan_hours", text:`Plan hours/manual output cover this slot. Keep balance detail in drilldown only.` };
  if (qty > thisRemain.remaining && thisRemain.remaining > 0) return { tone:"warn", level:"over_available_balance", text:`Check style balance only if no manual/line cover exists. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}` };
  if (thisRemain.remaining <= 0 && qty > 0 && manualOrCascadeCover) return { tone:"ok", level:"covered_by_plan_hours", text:`Plan hours/manual output cover this slot. No open-balance warning on main screen.` };
  if (thisRemain.remaining <= 0 && qty > 0) return { tone:"late", level:"no_open_balance", text:`No open style balance found for this slot. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}. Mark short close only if management overrides.` };
  if (dependsOnPlan && thisRemain.feed > thisRemain.actualDone) return { tone:"warn", level:"depends_on_upstream_plan", text:`Projected feed can cover this slot only if upstream plan is achieved. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}` };
  return { tone:"ok", level:"ok", text:`Cascade/feed OK for this slot. ${planNeedMessage(plan, rows, planRows, activeDept, line, day, ledger)}` };
}

function planImpactReviewRows(planRows=[], rows=[], ledger=[]){
  const todayIso = today();
  return (planRows||[])
    .filter(p=>planStyleText(p) && String(p.plan_date||"").slice(0,10) <= todayIso)
    .map(p=>{
      const planned = planReportQty(p);
      const achieved = achievedForPlan(p, rows, ledger);
      const variance = achieved - planned;
      const short = Math.max(0, planned - achieved);
      const excess = Math.max(0, achieved - planned);
      const residualOpen = n(p.cover_residual_qty || p.cover_residual_open_qty || 0);
      const residualAction = String(p.cover_residual_action || "");
      const residualStillNeedsFollowup = residualOpen > 0 && !["short_close","no_change"].includes(residualAction);
      const linked = resolvePlanStyle(rows, p);
      const futureSlots = (planRows||[]).filter(f=>
        planStyleText(f).toUpperCase() === planStyleText(p).toUpperCase()
        && String(f.dept)===String(p.dept)
        && String(f.plan_date||"").slice(0,10) > String(p.plan_date||"").slice(0,10)
      ).length;
      const futureQty = (planRows||[]).filter(f=>
        planStyleText(f).toUpperCase() === planStyleText(p).toUpperCase()
        && String(f.dept)===String(p.dept)
        && String(f.plan_date||"").slice(0,10) > String(p.plan_date||"").slice(0,10)
      ).reduce((a,f)=>a+planRowEffectiveQty(f),0);
      const hasSnapshot = p.manager_reviewed_actual_qty !== undefined && p.manager_reviewed_actual_qty !== null && p.manager_reviewed_actual_qty !== "";
      const reviewedRaw = p.manager_review_status === "reviewed" || String(p.status || "").toLowerCase().includes("manager reviewed") || String(p.status || "").toLowerCase().includes("manager short close");
      const stale = reviewedRaw && hasSnapshot && n(p.manager_reviewed_actual_qty) !== achieved;
      const reviewed = reviewedRaw && !stale && !residualStillNeedsFollowup;
      const status = stale ? "Manager reviewed — DPR changed, recheck" : residualStillNeedsFollowup ? `Manager reviewed — residual ${fmt(residualOpen)} open` : reviewed ? "Manager reviewed" : !planned ? "No plan qty" : short>0 ? "Pending manager review — short" : excess>0 ? "Pending manager review — excess" : "Matched";
      const suggested = stale
        ? `Reviewed earlier when actual was ${fmt(n(p.manager_reviewed_actual_qty))}; DPR now shows ${fmt(achieved)} for this date. Re-check the earlier decision: ${p.manager_decision || p.status || "reviewed"}.`
        : residualStillNeedsFollowup
        ? `Partial cover was saved but ${fmt(residualOpen)} pcs still need follow-up: ${residualActionLabel(residualAction) || "choose cascade / manual edit / short close / no change"}. Do not treat this short as silently closed.`
        : reviewed
        ? `Decision saved: ${p.manager_decision || p.status || "reviewed"}.`
        : short>0
          ? `Short ${fmt(short)}. Manager: apply cascade, line cover promise, short close, manual edit, or no plan change.`
          : excess>0
            ? `Excess ${fmt(excess)}. Manager can reduce future balance or keep as early recovery.`
            : "No action needed.";
      return {
        Plan_ID:p.id, Date:p.plan_date, Dept_Key:p.dept, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Slot:p.slot_no || 1, Style:planStyleText(p), Buyer:p.buyer || linked?.buyer || "",
        Planned:planned, Actual:achieved, Variance:variance, Short_Qty:short, Excess_Qty:excess,
        Future_Slots:futureSlots, Future_Qty:futureQty, Review_Status:status, Manager_Options:"Apply cascade | Part qty cover | Short close | No plan change | Manual edit", Suggested_Action:suggested,
        Manager_Decision:p.manager_decision || "", Cover_Qty:n(p.cover_qty || p.cover_commitment_qty), Cover_Date:p.cover_date || p.cover_due_date || "", Residual_Open_Qty:residualOpen, Residual_Action:residualActionLabel(residualAction) || residualAction, Reviewed_By:p.manager_reviewed_by || "",
        Data_Operator_Note:"DPR entry only records actual. Future plan changes require manager review; partial cover does not silently close residual balance."
      };
    })
    .filter(r=>r.Review_Status !== "Matched" && r.Review_Status !== "Manager reviewed")
    .sort((a,b)=>String(b.Date).localeCompare(String(a.Date)) || Math.abs(n(b.Variance))-Math.abs(n(a.Variance)));
}


function planRowsBetweenDates(planRows=[], dept="", style="", startDate="", endDate=""){
  const st = String(style || "").trim().toUpperCase();
  const start = String(startDate || "").slice(0,10);
  const end = String(endDate || "").slice(0,10);
  return (planRows||[]).filter(p=>{
    const d = String(p.plan_date||"").slice(0,10);
    if (!planStyleText(p) || planStyleText(p).toUpperCase() !== st) return false;
    if (dept && String(p.dept||"") !== String(dept)) return false;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
}
function actualForStyleDeptDate(style="", dept="", date="", rows=[], ledger=[]){
  const st = String(style || "").trim().toUpperCase();
  const day = String(date || "").slice(0,10);
  const fromLedger = (ledger||[]).filter(e=>String(e.entry_date||"").slice(0,10)===day && String(e.stage||"")===String(dept||"") && String(e.style_no||e.style||"").trim().toUpperCase()===st && ["good_output","output","alter_clear"].includes(String(e.entry_type||e.type||"").toLowerCase()));
  if (fromLedger.length) return fromLedger.reduce((a,e)=>a+n(e.qty ?? e.delta ?? e.good_qty),0);
  const row = (rows||[]).find(r=>String(r.style_no||"").trim().toUpperCase()===st);
  if (!row) return 0;
  const stg = sdata(row, dept);
  return n(stg.output);
}
function coverRecoverySnapshot(commitPlan, planRows=[], rows=[], ledger=[]){
  const style = planStyleText(commitPlan);
  const dept = String(commitPlan?.dept || "stitching");
  const sourceDate = String(commitPlan?.plan_date || today()).slice(0,10);
  const due = String(commitPlan?.cover_due_date || commitPlan?.cover_date || today()).slice(0,10);
  const committed = n(commitPlan?.cover_commitment_qty || commitPlan?.cover_qty || 0);
  const dates = [];
  const d = parseYmd(sourceDate);
  const end = parseYmd(due);
  d.setDate(d.getDate()+1);
  while (d <= end) { if (d.getDay() !== 0) dates.push(ymd(d)); d.setDate(d.getDate()+1); }
  let recovered = 0;
  const daily = dates.map(day=>{
    const dayPlans = planRowsBetweenDates(planRows, dept, style, day, day).filter(p=>!p.cover_recovery_slot && String(p.cover_source_plan_id||"") !== String(commitPlan?.id||""));
    const basePlan = dayPlans.reduce((a,p)=>a+planRowEffectiveQty(p),0);
    const actual = actualForStyleDeptDate(style, dept, day, rows, ledger);
    const extra = Math.max(0, actual - basePlan);
    const used = Math.min(Math.max(0, committed - recovered), extra);
    recovered += used;
    return { Date:day, Base_Plan:basePlan, Actual:actual, Extra_Available:extra, Used_For_Cover:used, Remaining_After:Math.max(0, committed-recovered) };
  });
  const remaining = Math.max(0, committed - recovered);
  const status = !committed ? "No cover commitment" : remaining<=0 ? "Closed / covered" : (due < today() ? "Failed / overdue" : "Open cover commitment");
  return { committed, recovered, remaining, due, status, daily };
}
function planReportQty(p){
  const base = planRowEffectiveQty(p);
  if (p?.cover_recovery_slot) return base || n(p.cover_commitment_qty || p.cover_qty || p.cover_remaining_qty);
  return base;
}
function isHistoricalPlanReportingRow(p){
  const day = String(p?.plan_date || "").slice(0,10);
  if (!day) return false;
  // Past plan rows are locked reporting targets. They must compare Plan vs Actual,
  // not today's live open balance, because live open naturally reduces after DPR entry.
  return day < today();
}
function liveOpenPlanOverage(p, linked, activeDept){
  if (!p || !linked || isHistoricalPlanReportingRow(p)) return 0;
  const liveOpen = n(entryFieldContext(linked, activeDept, "output").open);
  return Math.max(0, planReportQty(p) - liveOpen);
}
function coverAdjustedPlanQty(p, planRows=[], rows=[], ledger=[]){
  // Reporting rule: a plan row is the target that was committed.
  // Do not live-shrink it from actual/recovered/open balance, otherwise old plan-vs-actual
  // entries and cover commitments start showing less plan qty than the manager typed.
  return planReportQty(p);
}
function coverCommitmentRows(planRows=[], rows=[], ledger=[]){
  return (planRows||[]).filter(p=>n(p.cover_commitment_qty || p.cover_qty)>0 || String(p.manager_decision||"")==="part_cover" || String(p.status||"").toLowerCase().includes("cover")).map(p=>{
    const snap = coverRecoverySnapshot(p, planRows, rows, ledger);
    return { Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Style:planStyleText(p), Original_Short:n(p.cover_qty || p.cover_commitment_qty), Committed_Qty:snap.committed, Recovered_Qty:snap.recovered, Remaining_Qty:snap.remaining, Due_By:snap.due, Status:snap.status, Reason:p.cover_reason || "", Reviewed_By:p.manager_reviewed_by || "", Source_Plan_ID:p.id };
  }).filter(r=>n(r.Committed_Qty)>0).sort((a,b)=>n(b.Remaining_Qty)-n(a.Remaining_Qty) || String(a.Due_By).localeCompare(String(b.Due_By)));
}

function repeatedStyleDelayRows(planRows=[], rows=[], ledger=[]){
  const todayIso = today();
  const pastPlans = (planRows||[])
    .filter(p=>planStyleText(p) && String(p.plan_date||"").slice(0,10) <= todayIso && planRowEffectiveQty(p)>0)
    .map(p=>{
      const planned = planRowEffectiveQty(p);
      const actual = achievedForPlan(p, rows, ledger);
      const short = Math.max(0, planned - actual);
      const excess = Math.max(0, actual - planned);
      const style = planStyleText(p).toUpperCase();
      const key = [String(p.dept||""), style].join("|");
      return { p, key, style, planned, actual, short, excess, miss: short>0, excessFlag: excess>0 };
    });
  const grouped = new Map();
  pastPlans.forEach(x=>{
    if (!grouped.has(x.key)) grouped.set(x.key, []);
    grouped.get(x.key).push(x);
  });
  return Array.from(grouped.entries()).map(([key,items])=>{
    const first = items[0]?.p || {};
    const missItems = items.filter(x=>x.miss);
    const excessItems = items.filter(x=>x.excessFlag);
    const future = (planRows||[]).filter(f=>planStyleText(f).toUpperCase()===String(first.style_no || first.style_input || planStyleText(first)).toUpperCase() && String(f.dept||"")===String(first.dept||"") && String(f.plan_date||"").slice(0,10) > todayIso);
    const reviewedHints = items.filter(x=>String(x.p.manager_review_status||"").toLowerCase()==="reviewed" || String(x.p.status||"").toLowerCase().includes("manager reviewed") || String(x.p.cover_qty||"")).length;
    const datesMissed = missItems.map(x=>String(x.p.plan_date||"").slice(0,10)).filter(Boolean);
    const totalPlanned = items.reduce((a,x)=>a+n(x.planned),0);
    const totalActual = items.reduce((a,x)=>a+n(x.actual),0);
    const totalShort = items.reduce((a,x)=>a+n(x.short),0);
    const repeated = missItems.length >= 2 || (missItems.length>=1 && future.length>=2) || reviewedHints>=2;
    if (!repeated) return null;
    const linked = resolvePlanStyle(rows, first) || {};
    const signals = [];
    if (missItems.length>=2) signals.push(`${missItems.length} plan misses`);
    if (future.length) signals.push(`${future.length} future slots still planned`);
    if (reviewedHints) signals.push(`${reviewedHints} manager review/cover notes`);
    if (excessItems.length) signals.push(`${excessItems.length} excess/recovery days`);
    return {
      Dept:stageLabel(first.dept), Stage:first.dept, Style:planStyleText(first), Order:first.order_no || linked.order_no || "", Buyer:first.buyer || linked.buyer || "",
      Miss_Count:missItems.length, Miss_Dates:datesMissed.join(", "), Planned_Qty:totalPlanned, Actual_Qty:totalActual, Total_Short:totalShort,
      Future_Slots:future.length, Future_Qty:future.reduce((a,f)=>a+planRowEffectiveQty(f),0), Manager_Reviews:reviewedHints,
      Signal:signals.join(" · "), Suggested_Action:"Repeated delay pattern: reset plan/target, confirm feed, review line allocation, approve cover/short-close if needed.",
      Task:"Repeated Style Delay"
    };
  }).filter(Boolean).sort((a,b)=>n(b.Miss_Count)-n(a.Miss_Count) || n(b.Total_Short)-n(a.Total_Short));
}

function planCapacityOps(p){ return p?.cover_recovery_slot ? 0 : n(p?.ops); }
function planCapacityHours(p){ return p?.cover_recovery_slot ? 0 : planHours(p); }
function planNextActionText(p, rows=[], planRows=[], activeDept="stitching", ledger=[]){
  const qty = planReportQty(p);
  const actual = achievedForPlan(p, rows, ledger);
  const day = String(p?.plan_date || "").slice(0,10);
  const load = planLoadReadyInfo(p, rows, planRows, activeDept, p?.line || "", day, ledger);
  if (!planStyleText(p)) return "Fill style / order";
  if (!qty) return "Enter plan qty";
  if (p?.cover_recovery_slot) return actual >= qty ? "Cover achieved / close commitment" : "Track cover output; no extra OPS booking";
  const cap = planCapacityCeilingInfo(p);
  if (cap.blocked) return "Capacity exceeded: reduce qty or approve real line capacity change";
  if (day && day <= today() && actual < qty) return "DPR short: manager review / cover / cascade / short close";
  if (load?.tone === "late") return "Resolve feed or shift plan before loading";
  if (load?.depends) return "Watch upstream plan achievement";
  return "Ready for team execution";
}
function planTeamExportRows(planRows=[], rows=[], ledger=[], activeDept="stitching", weekDays=[]){
  const weekSet = new Set((weekDays||[]).map(d=>String(d).slice(0,10)));
  return (planRows||[])
    .filter(p=>String(p.dept)===String(activeDept) && weekSet.has(String(p.plan_date||"").slice(0,10)) && (planStyleText(p) || planReportQty(p)))
    .sort((a,b)=>String(a.plan_date).localeCompare(String(b.plan_date)) || String(a.line||"").localeCompare(String(b.line||"")) || planSlotNo(a)-planSlotNo(b))
    .map(p=>{
      const day = String(p.plan_date||"").slice(0,10);
      const linked = resolvePlanStyle(rows, p) || {};
      const qty = planReportQty(p);
      const actual = achievedForPlan(p, rows, ledger);
      const need = linked?.id ? planNeedBreakdown(p, [linked], planRows, activeDept, p.line || "", day, ledger) : null;
      const load = planLoadReadyInfo(p, rows, planRows, activeDept, p.line || "", day, ledger);
      const validation = planValidationSnapshot(p, rows, planRows, ledger);
      const allocation = need || (linked?.id ? planNeedBreakdown(p, [linked], planRows, activeDept, p.line || "", day, ledger) : null);
      return {
        Date:day, Day:shortDayLabel(day), Dept:stageLabel(activeDept), Line:p.line || "Dept total", Slot:planSlotNo(p),
        Qty_Allocation_Check: allocation?.over ? "OVER FUTURE PLAN RESERVED QTY" : "OK", Qty_Allocation_Detail: allocation ? planQuantityAllocationMessage(allocation) : "", Future_Planned_Other_Slots:n(allocation?.horizonAllocatedQty ?? allocation?.weekAllocatedQty ?? allocation?.sameDayAllocatedQty), Future_Available_For_This_Slot:n(allocation?.availableForThisSlot),
        Style:planStyleText(p), Order_No:p.order_no || linked.order_no || "", Buyer:p.buyer || linked.buyer || "", Colour:p.colour || linked.colour || "", Component:p.component || linked.component || "",
        Planned_Qty:qty, Actual_Qty:actual, Balance_Qty:Math.max(0, qty-actual),
        Full_Day_Target:n(p.eight_hr_target) || "", Plan_Hours:planCapacityHours(p) || "", Changeover_Lost_Hours:p.changeover ? Math.min(CHANGEOVER_LOST_HOURS, planCapacityHours(p) || CHANGEOVER_LOST_HOURS) : 0,
        OPS:planCapacityOps(p) || "", Capacity_Type:p.cover_recovery_slot ? "Cover commitment only - OPS not added" : "Normal capacity plan",
        Load_Status:load?.label || "", Feed_Reading:load?.detail || "", Actual_Ready_Feed:n(need?.feedInfo?.actualPrev), Projected_Feed:n(need?.feedInfo?.projectedPrev), Available_For_This_Slot:n(need?.availableForThisSlot), Future_Planned_Other_Slots:n(need?.horizonAllocatedQty ?? need?.weekAllocatedQty ?? need?.sameDayAllocatedQty), After_This_Slot:n(need?.afterThisSlot),
        End_Date:p.stitching_end_date || "", Short_Close:p.short_close ? "Yes" : "No", Cover_Target:p.cover_recovery_slot ? "Yes" : "No",
        Status:p.status || validation.level || "Draft", Validation:validation.message || "", Next_Action:planNextActionText(p, rows, planRows, activeDept, ledger), Remarks:p.remarks || "", Plan_ID:p.id
      };
    });
}
function planDailySummaryExportRows(teamRows=[]){
  const map = new Map();
  (teamRows||[]).forEach(r=>{
    const key = r.Date;
    const curr = map.get(key) || { Date:r.Date, Day:r.Day, Planned_Qty:0, Actual_Qty:0, Balance_Qty:0, Plan_Hours:0, OPS:0, Changeovers:0, Cover_Target_Qty:0, Styles:new Set(), Lines:new Set(), Feed_Warnings:0, DPR_Short_Rows:0 };
    curr.Planned_Qty += n(r.Planned_Qty); curr.Actual_Qty += n(r.Actual_Qty); curr.Balance_Qty += n(r.Balance_Qty); curr.Plan_Hours += n(r.Plan_Hours);
    curr.OPS += n(r.OPS); curr.Changeovers += n(r.Changeover_Lost_Hours)>0 ? 1 : 0; curr.Cover_Target_Qty += r.Cover_Target === "Yes" ? n(r.Planned_Qty) : 0;
    if (r.Style) curr.Styles.add(r.Style); if (r.Line) curr.Lines.add(r.Line);
    if (/short|depends|over|resolve|feed/i.test(String(r.Load_Status) + " " + String(r.Next_Action))) curr.Feed_Warnings += 1;
    if (/DPR short/i.test(String(r.Next_Action))) curr.DPR_Short_Rows += 1;
    map.set(key,curr);
  });
  return Array.from(map.values()).map(x=>({ Date:x.Date, Day:x.Day, Planned_Qty:x.Planned_Qty, Actual_Qty:x.Actual_Qty, Balance_Qty:x.Balance_Qty, Plan_Hours:Math.round(x.Plan_Hours*100)/100, OPS:x.OPS, Changeovers:x.Changeovers, Cover_Target_Qty:x.Cover_Target_Qty, Styles:x.Styles.size, Lines:x.Lines.size, Feed_Warnings:x.Feed_Warnings, DPR_Short_Rows:x.DPR_Short_Rows }));
}
function planLineSummaryExportRows(teamRows=[]){
  const map = new Map();
  (teamRows||[]).forEach(r=>{
    const key = r.Line || "Dept total";
    const curr = map.get(key) || { Line:key, Planned_Qty:0, Actual_Qty:0, Balance_Qty:0, Plan_Hours:0, OPS_Peak:0, Styles:new Set(), Days:new Set(), Changeovers:0, Cover_Target_Qty:0 };
    curr.Planned_Qty += n(r.Planned_Qty); curr.Actual_Qty += n(r.Actual_Qty); curr.Balance_Qty += n(r.Balance_Qty); curr.Plan_Hours += n(r.Plan_Hours); curr.OPS_Peak = Math.max(curr.OPS_Peak, n(r.OPS));
    if (r.Style) curr.Styles.add(r.Style); if (r.Date) curr.Days.add(r.Date); curr.Changeovers += n(r.Changeover_Lost_Hours)>0 ? 1 : 0; curr.Cover_Target_Qty += r.Cover_Target === "Yes" ? n(r.Planned_Qty) : 0;
    map.set(key,curr);
  });
  return Array.from(map.values()).map(x=>({ Line:x.Line, Planned_Qty:x.Planned_Qty, Actual_Qty:x.Actual_Qty, Balance_Qty:x.Balance_Qty, Plan_Hours:Math.round(x.Plan_Hours*100)/100, Peak_OPS:x.OPS_Peak, Styles:x.Styles.size, Days:x.Days.size, Changeovers:x.Changeovers, Cover_Target_Qty:x.Cover_Target_Qty }));
}
function planStyleSummaryExportRows(teamRows=[]){
  const map = new Map();
  (teamRows||[]).forEach(r=>{
    const key = [r.Style,r.Order_No,r.Colour,r.Component].join("|");
    const curr = map.get(key) || { Style:r.Style, Order_No:r.Order_No, Buyer:r.Buyer, Colour:r.Colour, Component:r.Component, Planned_Qty:0, Actual_Qty:0, Balance_Qty:0, First_Date:r.Date, Last_Date:r.Date, Lines:new Set(), Cover_Target_Qty:0, Next_Action:"" };
    curr.Planned_Qty += n(r.Planned_Qty); curr.Actual_Qty += n(r.Actual_Qty); curr.Balance_Qty += n(r.Balance_Qty); curr.First_Date = String(curr.First_Date) < String(r.Date) ? curr.First_Date : r.Date; curr.Last_Date = String(curr.Last_Date) > String(r.Date) ? curr.Last_Date : r.Date;
    if (r.Line) curr.Lines.add(r.Line); curr.Cover_Target_Qty += r.Cover_Target === "Yes" ? n(r.Planned_Qty) : 0; curr.Next_Action = curr.Next_Action || r.Next_Action;
    map.set(key,curr);
  });
  return Array.from(map.values()).map(x=>({ Style:x.Style, Order_No:x.Order_No, Buyer:x.Buyer, Colour:x.Colour, Component:x.Component, Planned_Qty:x.Planned_Qty, Actual_Qty:x.Actual_Qty, Balance_Qty:x.Balance_Qty, First_Date:x.First_Date, Last_Date:x.Last_Date, Lines:Array.from(x.Lines).join(", "), Cover_Target_Qty:x.Cover_Target_Qty, Next_Action:x.Next_Action }));
}

function projectedFeedRows(planRows=[], rows=[], activeDept="stitching", weekDays=[]){
  return (planRows||[]).filter(p=>String(p.dept)===String(activeDept) && weekDays.includes(String(p.plan_date||"").slice(0,10)) && planStyleText(p)).map(p=>{
    const linked = resolvePlanStyle(rows, p);
    const feed = linked ? feedAvailableAsOf(linked, activeDept, p.plan_date, planRows, []) : null;
    const remain = linked ? remainingForStyleAsOf(linked, activeDept, p.plan_date, planRows, []) : null;
    const qty = planRowEffectiveQty(p);
    const need = linked ? planNeedBreakdown(p, [linked], planRows, activeDept, p.line || "", p.plan_date, []) : null;
    const over = Math.max(0, qty - n(need?.availableForThisSlot ?? remain?.remaining));
    const depends = n(feed?.projectedPrev) > 0 && n(feed?.actualPrev) < qty;
    return {
      Date:p.plan_date, Dept:stageLabel(activeDept), Line:p.line||"Dept total", Style:planStyleText(p), Plan_Qty_Needed_This_Slot:qty,
      Actual_Ready_Feed:n(feed?.actualPrev), Projected_Upstream_Feed:n(feed?.projectedPrev), Projected_Available_Feed:n(feed?.feed), Already_Done_In_Dept:n(need?.actualDone), Already_Planned_Reserved:n(need?.horizonAllocatedQty ?? need?.earlierSameDayPlan), Available_For_This_Slot:n(need?.availableForThisSlot ?? remain?.remaining), After_This_Slot:n(need?.afterThisSlot),
      Feed_Status: over>0 ? `Over projected feed by ${fmt(over)}` : depends ? "Depends on upstream plan" : "Actual ready / OK",
      Upstream_Rule: feed?.prevStage ? `${stageLabel(feed.prevStage)} plan + ${feed.bufferDays} day buffer` : "Order/cutting base",
      Reading: linked ? planNeedMessage(p, [linked], planRows, activeDept, p.line || "", p.plan_date, []) : "No linked style"
    };
  });
}

function planValidationSnapshot(plan, rows=[], allPlanRows=[], ledger=[]){
  const day = String(plan?.plan_date || today()).slice(0,10);
  const dept = String(plan?.dept || "stitching");
  const line = String(plan?.line || planCellLineKey(dept, plan?.line || "") || "");
  const styleText = planStyleText(plan);
  const linked = resolvePlanStyle(rows, plan);
  const signal = planCellSignal(plan, rows, allPlanRows, dept, line, day, ledger);
  const remain = linked ? remainingForStyleAsOf(linked, dept, day, allPlanRows, ledger) : null;
  const qty = n(plan?.planned_qty);
  const messages = [];
  if (!styleText && qty) messages.push("Qty entered without style.");
  if (styleText && !qty) messages.push("Style entered without plan qty.");
  if (signal.level && !["ok","blank"].includes(signal.level)) messages.push(signal.text);
  return {
    level:signal.level || "ok", tone:signal.tone || "ok", message:messages.join(" | ") || signal.text || "OK",
    day, dept, line, style_input:styleText, linked_style:linked?.style_no || "", order_no:linked?.order_no || plan?.order_no || "",
    plan_qty:qty, feed:n(remain?.feed), available_before_day:n(remain?.remaining), consumed_before_day:n(remain?.consumed),
    actual_done_as_of:n(remain?.actualDone), planned_before:n(remain?.plannedBefore), prev_stage:remain?.prevStage || "", short_close:!!plan?.short_close, app_version:APP_VERSION, checked_at:new Date().toISOString()
  };
}
function stablePlanId(dept, line, day, slotNo=1){ return `plan_${stableHash([dept,line,day,slotNo].join("|"))}`; }
function normalizePlanRowForState(p){
  const dept = String(p?.dept || "stitching");
  const day = String(p?.plan_date || today()).slice(0,10);
  const line = String(p?.line || planCellLineKey(dept, p?.line || ""));
  const slot_no = planSlotNo(p);
  const hasStyle = !!String(p?.style_input || p?.style_no || p?.row_id || "").trim();
  const isCoverOnly = !!p?.cover_recovery_slot;
  const rawHours = p?.remaining_hours !== undefined || p?.run_hours !== undefined || p?.plan_hours !== undefined ? n(p?.remaining_hours || p?.run_hours || p?.plan_hours) : 0;
  const hours = isCoverOnly ? 0 : Math.max(0, Math.min(8, rawHours || (hasStyle ? 8 : 0)));
  const target = isCoverOnly ? 0 : (n(p?.eight_hr_target || p?.full_day_output) || (hasStyle ? defaultFullDayOutputForStyle(p) : 0));
  const withHours = { ...p, remaining_hours:hours, eight_hr_target:target };
  const autoQty = planAutoQtyFromTarget(withHours);
  const qty = isCoverOnly
    ? n(p?.planned_qty || p?.cover_commitment_qty || p?.cover_qty || p?.cover_remaining_qty)
    : ((p?.qty_auto_mode || p?.use_auto_qty) ? autoQty : (n(p?.planned_qty) || (hasStyle ? autoQty : 0)));
  const ops = isCoverOnly ? 0 : (n(p?.ops) || (hasStyle ? (defaultOpsForStyle(p) || DEFAULT_PLAN_HEADCOUNT) : 0));
  return { ...p, id:p?.id || stablePlanId(dept,line,day,slot_no), dept, plan_date:day, line, slot_no, planned_qty:qty, ops, eight_hr_target:target, remaining_hours:hours, changeover:!!p?.changeover, changeover_override:!!p?.changeover_override, qty_auto_mode:!!(p?.qty_auto_mode || p?.use_auto_qty || (!n(p?.planned_qty) && hasStyle && !isCoverOnly)), short_close:!!p?.short_close };
}
function planRowToSupabase(p, rows=[], allPlanRows=[], ledger=[]){
  const clean = normalizePlanRowForState(p);
  const linked = resolvePlanStyle(rows, clean);
  const validation = planValidationSnapshot(clean, rows, allPlanRows, ledger);
  return {
    id:clean.id || stablePlanId(clean.dept, clean.line, clean.plan_date, clean.slot_no),
    dept:clean.dept, plan_date:clean.plan_date, line:clean.line || "", slot_no:planSlotNo(clean),
    row_id:linked?.id || clean.row_id || null, order_no:linked?.order_no || clean.order_no || null, style_no:linked?.style_no || clean.style_no || planStyleText(clean) || null,
    buyer:clean.buyer || linked?.buyer || null, colour:linked?.colour || clean.colour || null, component:linked?.component || clean.component || null,
    planned_qty:n(clean.planned_qty), ops:n(clean.ops), stitching_end_date:clean.stitching_end_date || null, remarks:clean.remarks || null, short_close:!!clean.short_close,
    source:clean.source || "manual_excel_board", source_label:clean.source_label || "Excel weekly line board", source_type:clean.source_type || "Manual / cascade checked",
    status:clean.short_close ? "Short close override" : (clean.status || (validation.level === "ok" ? "Draft / valid" : "Draft / review")), validation_status:validation.level, validation_message:validation.message, validation_snapshot:validation,
    metadata:{ app_version:APP_VERSION, style_input:planStyleText(clean), route:linked ? routeFor(linked) : [], p0_guard:"cascade_as_of_plan_date", slot_no:planSlotNo(clean), full_day_output:n(clean.eight_hr_target || clean.full_day_output), eight_hr_target:n(clean.eight_hr_target || clean.full_day_output), remaining_hours:n(clean.remaining_hours || clean.run_hours || 0), day_remaining_after:n(clean.day_remaining_after), changeover:!!clean.changeover, changeover_override:!!clean.changeover_override, changeover_source:clean.changeover_override ? "manual" : "auto", qty_auto_mode:!!clean.qty_auto_mode, auto_qty:planAutoQtyFromTarget(clean), manager_review_status:clean.manager_review_status || "", manager_decision:clean.manager_decision || "", manager_reviewed_by:clean.manager_reviewed_by || "", manager_reviewed_at:clean.manager_reviewed_at || "", cover_qty:n(clean.cover_qty), cover_date:clean.cover_date || "", cover_reason:clean.cover_reason || "", cover_status:clean.cover_status || "", cover_source_plan_id:clean.cover_source_plan_id || "", cover_due_date:clean.cover_due_date || clean.cover_date || "", cover_commitment_qty:n(clean.cover_commitment_qty || clean.cover_qty), cover_recovered_qty:n(clean.cover_recovered_qty), cover_remaining_qty:n(clean.cover_remaining_qty), cover_base_plan_qty:n(clean.cover_base_plan_qty), cover_residual_qty:n(clean.cover_residual_qty || clean.cover_residual_open_qty), cover_residual_action:clean.cover_residual_action || "", cover_recovery_slot:!!clean.cover_recovery_slot },
    updated_by:currentUserName(), updated_by_role:currentUserRole(), updated_at:new Date().toISOString(), created_by:clean.created_by || currentUserName(), created_at:clean.created_at || new Date().toISOString()
  };
}
function supabaseToPlanRow(row){
  const meta = row.metadata || {};
  return normalizePlanRowForState({
    id:row.id, dept:row.dept, plan_date:row.plan_date, line:row.line || "", slot_no:planSlotNo(row), row_id:row.row_id || "", order_no:row.order_no || "", style_no:row.style_no || "", style_input:meta.style_input || row.style_no || "", buyer:row.buyer || "", colour:row.colour || "", component:row.component || "", planned_qty:n(row.planned_qty), ops:n(row.ops), stitching_end_date:row.stitching_end_date || "", remarks:row.remarks || "", short_close:!!row.short_close, eight_hr_target:n(meta.eight_hr_target || meta.full_day_output), remaining_hours:n(meta.remaining_hours || meta.run_hours || row.remaining_hours || 0), changeover:!!meta.changeover, changeover_override:!!meta.changeover_override, qty_auto_mode:!!meta.qty_auto_mode, source:row.source || "manual_excel_board", source_label:row.source_label || "Excel weekly line board", source_type:row.source_type || "Manual / cascade checked", status:row.status || "Draft", validation_status:row.validation_status || "", validation_message:row.validation_message || "", validation_snapshot:row.validation_snapshot || null, manager_review_status:meta.manager_review_status || "", manager_decision:meta.manager_decision || "", manager_reviewed_by:meta.manager_reviewed_by || "", manager_reviewed_at:meta.manager_reviewed_at || "", cover_qty:n(meta.cover_qty || meta.cover_commitment_qty), cover_date:meta.cover_date || meta.cover_due_date || "", cover_reason:meta.cover_reason || "", cover_status:meta.cover_status || "", cover_source_plan_id:meta.cover_source_plan_id || "", cover_due_date:meta.cover_due_date || meta.cover_date || "", cover_commitment_qty:n(meta.cover_commitment_qty || meta.cover_qty), cover_recovered_qty:n(meta.cover_recovered_qty), cover_remaining_qty:n(meta.cover_remaining_qty), cover_base_plan_qty:n(meta.cover_base_plan_qty), cover_residual_qty:n(meta.cover_residual_qty || meta.cover_residual_open_qty), cover_residual_action:meta.cover_residual_action || "", cover_recovery_slot:!!meta.cover_recovery_slot, updated_at:row.updated_at, created_at:row.created_at, created_by:row.created_by
  });
}
async function robustUpsertPlanRowsToSupabase(planRows, rows=[], allPlanRows=[], ledger=[]){
  if (!hasValidSupabaseEnv()) return { skipped:true, warning:supabaseConfigWarning() };
  const payload = (Array.isArray(planRows) ? planRows : [planRows]).filter(Boolean).map(p=>planRowToSupabase(p, rows, allPlanRows, ledger));
  if (!payload.length) return { error:null, savedCount:0 };
  return fetchRestUpsertToSupabase("production_plan_rows", payload, "dept,plan_date,line,slot_no");
}
async function fetchDeletePlanRowFromSupabase(plan){
  if (!hasValidSupabaseEnv()) return { skipped:true, warning:supabaseConfigWarning() };
  const p = normalizePlanRowForState(plan);
  const queries = [];
  if (p.id) queries.push(`id=eq.${encodeURIComponent(p.id)}`);
  queries.push(`${urlEncodedEqQuery({ dept:p.dept, plan_date:p.plan_date, line:p.line || "", slot_no:planSlotNo(p) })}`);
  let firstError = null;
  let deletedVia = "rest";
  for (const q of Array.from(new Set(queries))) {
    const res = await fetchRestDeleteFromSupabase("production_plan_rows", q);
    if (res?.error) firstError = firstError || res.error;
    else deletedVia = res?.via || deletedVia;
  }
  if (firstError) return { error:firstError };
  return { error:null, via:deletedVia, deleted:true };
}
function PlanExcelLineBoard({ rows, planRows, setPlanRows, setRows, activeDept, weekDays, showTargets=true, fit=false, ledger=[], onPlanUpsert, onPlanDelete }){
  const [search,setSearch] = useState("");
  const [editCell,setEditCell] = useState(null);
  const [editorAutoOpen,setEditorAutoOpen] = useState(false);
  const [notice,setNotice] = useState(null);
  const [quickAdd,setQuickAdd] = useState(null);
  const [planColWidths,setPlanColWidths] = useState(()=>safeJsonLoad(uiStorageKey("planning_board_col_widths"), { line:104, day:145, week:86 }));
  useEffect(()=>safeJsonSave(uiStorageKey("planning_board_col_widths"), planColWidths), [planColWidths]);
  function setPlanColWidth(key, value){
    const limits = { line:[72,220], day:[95,260], week:[62,160] };
    const [lo,hi] = limits[key] || [60,260];
    setPlanColWidths(prev=>({ ...prev, [key]:Math.max(lo, Math.min(hi, n(value) || (prev?.[key] || lo))) }));
  }
  const saveTimersRef = useRef({});
  useEffect(()=>()=>Object.values(saveTimersRef.current || {}).forEach(clearTimeout), []);
  function notify(message, title="Notice"){ setNotice({ kind:"info", title, message }); }
  function confirmAction(message, title, onConfirm){ setNotice({ kind:"confirm", title, message, onConfirm }); }
  const boardRows = activeDept === "stitching" ? productionLineNames() : [`${stageLabel(activeDept)} Total`];
  const datalistId = `plan-style-list-${activeDept}`;
  const filteredStyles = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return (rows||[]).filter(r=>!q || [r.style_no,r.order_no,r.buyer,r.colour,r.component].join(" ").toLowerCase().includes(q)).slice(0,160);
  }, [rows, search]);
  function findCellSlot(line, day, slotNo=1){ return lineDayPlanRows(planRows, activeDept, line, day).find(p=>planSlotNo(p)===n(slotNo)); }
  function planStyleKeyValue(v){
    if (v && typeof v === "object") {
      const linked = resolvePlanStyle(rows, v);
      return styleKeyOf(linked || v) || String(planStyleText(v)).trim().toUpperCase();
    }
    return String(v || "").trim().toUpperCase();
  }
  function previousStyleBeforeSlot(line, day, slotNo, sourceRows=planRows){
    const lineKey = planCellLineKey(activeDept,line);
    const dayIndex = weekDays.indexOf(day);
    const currentSlot = n(slotNo) || 1;
    const candidates = (sourceRows||[])
      .filter(p=>String(p.dept)===String(activeDept) && String(p.line||"")===String(lineKey))
      .map(p=>({ ...p, __dayIndex:weekDays.indexOf(String(p.plan_date||"").slice(0,10)), __slot:planSlotNo(p), __style:planStyleKeyValue(p) }))
      .filter(p=>p.__style && p.__dayIndex >= 0 && (p.__dayIndex < dayIndex || (p.__dayIndex === dayIndex && p.__slot < currentSlot)))
      .sort((a,b)=>b.__dayIndex-a.__dayIndex || b.__slot-a.__slot);
    return candidates[0]?.__style || "";
  }
  function autoChangeoverForSlot(line, day, slotNo, candidate={}, sourceRows=planRows){
    const style = planStyleKeyValue(candidate);
    if (!style) return false;
    const prevStyle = previousStyleBeforeSlot(line, day, slotNo, sourceRows);
    return !!prevStyle && prevStyle !== style;
  }
  function effectiveChangeoverForSlot(line, day, slotNo, candidate={}, sourceRows=planRows){
    if (candidate?.changeover_override) return !!candidate?.changeover;
    return autoChangeoverForSlot(line, day, slotNo, candidate, sourceRows);
  }
  function changeoverExplain(line, day, slotNo, candidate={}, sourceRows=planRows){
    const style = planStyleKeyValue(planStyleText(candidate));
    const prevStyle = previousStyleBeforeSlot(line, day, slotNo, sourceRows);
    if (!style) return "No style selected";
    if (candidate?.changeover_override) return candidate?.changeover ? "Manual override: apply fixed changeover lost time for this slot" : "Manual override: no changeover lost time for this slot";
    if (!prevStyle) return "First planned style on this line — no changeover lost time";
    if (prevStyle === style) return "Continue running — no changeover lost time";
    return `Style changed from ${prevStyle} — fixed 2h changeover lost before production starts`;
  }
  function defaultOpsForPlanSlot(linked, line){
    const styleOps = defaultOpsForStyle(linked);
    if (styleOps) return styleOps;
    const lineKey = planCellLineKey(activeDept,line);
    const prior = [...(planRows||[])].reverse().find(p=>String(p.dept)===String(activeDept) && String(p.line||"")===String(lineKey) && n(p.ops)>0);
    return n(prior?.ops) || (activeDept === "stitching" ? DEFAULT_PLAN_HEADCOUNT : 1);
  }
  function cleanPatchForStyle(base, patch){
    const text = patch.style_input !== undefined ? patch.style_input : planStyleText(base);
    // When the user changes Style from the picker, do not keep the old row_id/component as the resolver hint.
    // Otherwise a set style can visually change to BOTTOM/OTHER COMPONENT but still save the previous TOP row.
    const styleChanged = Object.prototype.hasOwnProperty.call(patch, "style_input");
    const resolveHint = styleChanged && !patch.row_id
      ? { ...patch, style_input:text, row_id:"", style_no:"", order_no:"", colour:"", component:"" }
      : { ...base, ...patch, style_input:text };
    const linked = resolvePlanStyle(rows, resolveHint);
    const out = { ...patch, style_input:text };
    if (linked) {
      Object.assign(out, {
        row_id:linked.id,
        order_no:linked.order_no,
        style_no:linked.style_no,
        style_input:linked.style_no,
        buyer:patch.buyer !== undefined ? patch.buyer : linked.buyer,
        colour:linked.colour,
        component:linked.component,
        eight_hr_target: patch.eight_hr_target !== undefined ? patch.eight_hr_target : (n(base?.eight_hr_target) || defaultFullDayOutputForStyle(linked)),
        ops: patch.ops !== undefined ? patch.ops : (n(base?.ops) || defaultOpsForPlanSlot(linked, base?.line || ""))
      });
    } else if (text) {
      Object.assign(out, { row_id:"", style_no:text.toUpperCase(), order_no:base?.order_no || "", buyer:patch.buyer !== undefined ? patch.buyer : (base?.buyer || ""), colour:base?.colour || "", component:base?.component || "" });
    } else if (Object.prototype.hasOwnProperty.call(patch, "style_input")) {
      Object.assign(out, { row_id:"", order_no:"", style_no:"", buyer:"", colour:"", component:"", planned_qty:"", eight_hr_target:"", ops:"", stitching_end_date:"", remarks:"", qty_auto_mode:false, remaining_hours:0, changeover:false, changeover_override:false, short_close:false });
    }
    return out;
  }
  function schedulePlanSave(row, line, day){
    const key = [activeDept, planCellLineKey(activeDept,line), day, planSlotNo(row)].join("|");
    clearTimeout(saveTimersRef.current[key]);
    saveTimersRef.current[key] = setTimeout(()=>onPlanUpsert?.(normalizePlanRowForState(row), { dept:activeDept, line:planCellLineKey(activeDept,line), day, slot_no:planSlotNo(row) }), 650);
  }
  function updateCell(line, day, slotNo, patch){
    const allForDay = lineDayPlanRows(planRows, activeDept, line, day);
    const existingNow = allForDay.find(p=>planSlotNo(p)===n(slotNo));
    const priorHours = usedPlanHours(allForDay, existingNow?.id || "", n(slotNo));
    const defaultHours = Math.max(0, 8 - priorHours);
    const baseNow = existingNow || { id:stablePlanId(activeDept, planCellLineKey(activeDept,line), day, slotNo), plan_date:day, dept:activeDept, line:planCellLineKey(activeDept,line), slot_no:n(slotNo)||1, source:"manual_excel_board", source_label:"Excel weekly line board", source_type:"Manual / cascade checked", remaining_hours:defaultHours, eight_hr_target:0, qty_auto_mode:false, changeover:false, difficulty:"Normal", priority:"Normal", status:"Draft", remarks:"" };
    const cleanedNow = cleanPatchForStyle(baseNow, patch);
    const styleTouched = Object.prototype.hasOwnProperty.call(patch, "style_input") && !!planStyleText(cleanedNow);
    const autoTouched = ["eight_hr_target","remaining_hours","changeover","qty_auto_mode","use_auto_qty"].some(k=>Object.prototype.hasOwnProperty.call(cleanedNow,k));
    const shouldAutoFromStyle = styleTouched && !n(baseNow.planned_qty) && !!resolvePlanStyle(rows, { ...baseNow, ...cleanedNow });
    const willAuto = cleanedNow.qty_auto_mode !== undefined ? !!cleanedNow.qty_auto_mode : (cleanedNow.use_auto_qty !== undefined ? !!cleanedNow.use_auto_qty : (!!baseNow.qty_auto_mode || shouldAutoFromStyle));
    const finalHours = Math.max(0, Math.min(8, n(cleanedNow.remaining_hours !== undefined ? cleanedNow.remaining_hours : baseNow.remaining_hours || defaultHours)));
    const draftBaseBeforeChangeover = { ...baseNow, ...cleanedNow, plan_date:day, dept:activeDept, line:planCellLineKey(activeDept,line), slot_no:n(slotNo)||1, remaining_hours:finalHours, eight_hr_target:n(cleanedNow.eight_hr_target !== undefined ? cleanedNow.eight_hr_target : baseNow.eight_hr_target || 0), qty_auto_mode: willAuto };
    const wantsAutoChangeover = Object.prototype.hasOwnProperty.call(cleanedNow, "changeover_override") && cleanedNow.changeover_override === false;
    const manualChangeoverTouched = Object.prototype.hasOwnProperty.call(cleanedNow, "changeover") && !wantsAutoChangeover;
    const changeoverOverride = wantsAutoChangeover ? false : (manualChangeoverTouched ? true : (styleTouched ? false : !!baseNow.changeover_override));
    const draftWithOverride = { ...draftBaseBeforeChangeover, changeover_override:changeoverOverride, changeover: manualChangeoverTouched ? !!cleanedNow.changeover : !!baseNow.changeover };
    const effectiveChangeover = effectiveChangeoverForSlot(line, day, slotNo, draftWithOverride);
    const draftBeforeQty = { ...draftWithOverride, changeover:effectiveChangeover };
    const manualQtyTouched = cleanedNow.planned_qty !== undefined;
    let plannedQty = manualQtyTouched
      ? n(cleanedNow.planned_qty)
      : ((willAuto || autoTouched) ? planAutoQtyFromTarget(draftBeforeQty) : n(baseNow.planned_qty));
    const preGuardDraft = { ...draftBeforeQty, planned_qty:plannedQty };
    const isPastReportingDate = isHistoricalPlanReportingRow({ ...preGuardDraft, plan_date:day });
    if (!isPastReportingDate && planStyleText(preGuardDraft) && !manualQtyTouched) {
      const autoGuard = planNeedBreakdown(preGuardDraft, rows, planRows, activeDept, line, day, ledger);
      if (autoGuard.linked && n(autoGuard.availableForThisSlot) > 0 && plannedQty > n(autoGuard.availableForThisSlot)) plannedQty = n(autoGuard.availableForThisSlot);
      if (autoGuard.linked && n(autoGuard.availableForThisSlot) <= 0 && (styleTouched || autoTouched || willAuto)) plannedQty = 0;
    }
    const nextNow = normalizePlanRowForState({ ...draftBeforeQty, planned_qty:plannedQty, day_remaining_after:Math.max(0, 8 - priorHours - finalHours), status: cleanedNow.short_close ? "Short close override" : "Draft", updated_at:new Date().toISOString() });
    const hasContentNow = planStyleText(nextNow) || n(nextNow.planned_qty) || n(nextNow.ops) || n(nextNow.eight_hr_target) || n(nextNow.remaining_hours) || nextNow.stitching_end_date || nextNow.remarks || nextNow.short_close;
    const allocationGuard = hasContentNow && planStyleText(nextNow) ? planNeedBreakdown(nextNow, rows, planRows, activeDept, line, day, ledger) : null;
    if (!isPastReportingDate && allocationGuard?.linked && n(nextNow.planned_qty) > n(allocationGuard.availableForThisSlot)) {
      notify(`${planQuantityAllocationMessage(allocationGuard)}\n\nSplit line is allowed, but you can only plan the remaining unplanned qty. Reduce this slot qty to ${fmt(allocationGuard.availableForThisSlot)} or edit the earlier planned slot.`, "Plan qty already reserved");
      return;
    }
    if (!isPastReportingDate && styleTouched && allocationGuard?.linked && n(allocationGuard.availableForThisSlot) <= 0 && !n(nextNow.planned_qty)) {
      notify(`${planQuantityAllocationMessage(allocationGuard)}\n\nThis style/component has no unplanned qty left across the future plan. Split line is allowed only when style balance remains.`, "No unplanned qty left");
      return;
    }
    setPlanRows(prev=>{
      const existing = (prev||[]).find(p=>p.id===existingNow?.id || (planCellMatches(p, activeDept, line, day) && planSlotNo(p)===n(slotNo)));
      if (!hasContentNow) return (prev||[]).filter(p=>p.id!==existing?.id);
      return existing ? (prev||[]).map(p=>p.id===existing.id ? nextNow : p) : [...(prev||[]), nextNow];
    });
    if (hasContentNow) schedulePlanSave(nextNow, line, day);
    else if (existingNow) onPlanDelete?.(existingNow, { dept:activeDept, line:planCellLineKey(activeDept,line), day, slot_no:slotNo });
  }
  function clearCellSlot(line, day, slotNo){
    const existing = findCellSlot(line, day, slotNo);
    const key = [activeDept, planCellLineKey(activeDept,line), day, slotNo].join("|");
    clearTimeout(saveTimersRef.current[key]);
    setPlanRows(prev=>(prev||[]).filter(p=>!(planCellMatches(p, activeDept, line, day) && planSlotNo(p)===n(slotNo))));
    if (existing) onPlanDelete?.(existing, { dept:activeDept, line:planCellLineKey(activeDept,line), day, slot_no:slotNo });
  }
  function carryForward(line, day, slotNo){
    const idx = weekDays.indexOf(day);
    const prevDay = idx > 0 ? weekDays[idx-1] : null;
    const prev = prevDay ? findCellSlot(line, prevDay, slotNo) : null;
    if (!prev) return;
    updateCell(line, day, slotNo, { style_input:planStyleText(prev), row_id:prev.row_id || "", order_no:prev.order_no || "", buyer:prev.buyer || "", colour:prev.colour || "", component:prev.component || "", planned_qty:prev.planned_qty || "", ops:prev.ops || "", eight_hr_target:prev.eight_hr_target || "", remaining_hours:prev.remaining_hours || 0, changeover:false, changeover_override:false, qty_auto_mode:!!prev.qty_auto_mode, stitching_end_date:prev.stitching_end_date || "", remarks:"CONTINUE RUNNING", short_close:false });
  }
  function fillNext(line, day, slotNo){
    const idx=weekDays.indexOf(day); const next=idx>=0 ? weekDays[idx+1] : null; const curr=findCellSlot(line,day,slotNo);
    if (next && curr) updateCell(line,next,slotNo,{ style_input:planStyleText(curr), row_id:curr.row_id || "", order_no:curr.order_no || "", buyer:curr.buyer||"", colour:curr.colour || "", component:curr.component || "", planned_qty:curr.planned_qty||"", ops:curr.ops||"", eight_hr_target:curr.eight_hr_target || "", remaining_hours:curr.remaining_hours || 0, changeover:false, changeover_override:false, qty_auto_mode:!!curr.qty_auto_mode, stitching_end_date:curr.stitching_end_date||"", remarks:"CONTINUE RUNNING", short_close:false });
  }
  function useRemainingHours(line, day, slotNo){
    const allForDay=lineDayPlanRows(planRows, activeDept, line, day);
    const p=findCellSlot(line,day,slotNo)||{};
    const remainingBefore = remainingHoursBeforeSlot(allForDay, { ...p, slot_no:slotNo });
    const linked=resolvePlanStyle(rows, p) || {};
    const target = n(p.eight_hr_target) || defaultFullDayOutputForStyle(linked);
    const candidate = { ...p, eight_hr_target:target, remaining_hours:remainingBefore, qty_auto_mode:true };
    updateCell(line, day, slotNo, { eight_hr_target:target, remaining_hours:remainingBefore, qty_auto_mode:true, planned_qty:planAutoQtyFromTarget({ ...candidate, changeover:effectiveChangeoverForSlot(line, day, slotNo, candidate) }) });
  }
  function addNextStyleSlot(line, day){
    const allForDay=lineDayPlanRows(planRows, activeDept, line, day);
    const nextSlot = Math.max(0, ...allForDay.map(planSlotNo)) + 1;
    const remaining = Math.max(0, 8 - allForDay.reduce((a,p)=>a+planHours(p),0));
    updateCell(line, day, nextSlot, { remaining_hours:remaining, qty_auto_mode:true, remarks:"NEXT STYLE" });
  }
  function planCascadeForwardDays(startDay, maxSlots=120){
    const out = [];
    const d = parseYmd(startDay || today());
    let guard = 0;
    while(out.length < maxSlots && guard < maxSlots + 40){
      if(d.getDay() !== 0) out.push(ymd(d));
      d.setDate(d.getDate()+1);
      guard++;
    }
    return out;
  }
  function autoFillCascadeFromSlot(line, day, slotNo){
    const current = findCellSlot(line, day, slotNo);
    const styleText = planStyleText(current);
    const linked = resolvePlanStyle(rows, current);
    if (!linked) { notify("Select/link a style from Styles master first. Free-text styles cannot auto-cascade because order qty/feed is unknown.", "Cascade needs a linked style"); return; }
    const target = n(current?.eight_hr_target) || defaultFullDayOutputForStyle(linked);
    if (!target) { notify("Enter Full-day target first. Cascade needs daily output to calculate hours and qty.", "Full-day target missing"); return; }
    const cascadeDays = planCascadeForwardDays(day, 120);
    const startIdx = 0;
    const lineKey = planCellLineKey(activeDept,line);
    const startNeed = planNeedBreakdown({ ...(current || {}), row_id:linked.id, order_no:linked.order_no, style_no:linked.style_no, style_input:linked.style_no, colour:linked.colour, component:linked.component, dept:activeDept, line:lineKey, plan_date:day, slot_no:slotNo, planned_qty:0 }, rows, planRows, activeDept, line, day, ledger);
    const startRemain = n(startNeed.availableForThisSlot) || remainingForStyleAsOf(linked, activeDept, day, planRows, ledger).remaining || n(linked.order_qty);
    let qtyLeft = Math.max(0, startRemain);
    const generated = [];
    let simulatedRows = [...(planRows||[])];
    for (let i=startIdx; i<cascadeDays.length && qtyLeft>0; i++){
      const d = cascadeDays[i];
      const allForDay = lineDayPlanRows(planRows, activeDept, line, d);
      const linkedKey = styleKeyOf(linked);
      const sameStyle = allForDay.find(p=>p.row_id===linked.id || styleKeyOf(p)===linkedKey);
      const slot = d === day ? n(slotNo) : (sameStyle ? planSlotNo(sameStyle) : Math.max(0, ...allForDay.map(planSlotNo)) + 1);
      const base = d === day ? (current || {}) : (sameStyle || {});
      const baseWithSlot = { ...base, id:base?.id || stablePlanId(activeDept, lineKey, d, slot), dept:activeDept, line:lineKey, plan_date:d, slot_no:slot };
      const availableBefore = remainingHoursBeforeSlot(allForDay, baseWithSlot);
      const preferredHours = d === day ? (planHours(current) || availableBefore || 8) : (availableBefore || 8);
      const hoursCap = Math.max(0, Math.min(8, preferredHours));
      if (!hoursCap) continue;
      const changeoverAuto = (d === day && current?.changeover_override) ? !!current.changeover : autoChangeoverForSlot(line, d, slot, { ...baseWithSlot, style_input:linked.style_no, style_no:linked.style_no }, simulatedRows);
      // Factory rule: changeover is a fixed lost setup time first. Remaining production time runs at full capacity.
      const lostHours = changeoverAuto ? Math.min(CHANGEOVER_LOST_HOURS, hoursCap) : 0;
      const productiveHours = Math.max(0, hoursCap - lostHours);
      const maxQtyForHours = Math.max(0, Math.round((target / 8) * productiveHours));
      if (!maxQtyForHours) continue;
      const dayNeed = planNeedBreakdown({ ...baseWithSlot, row_id:linked.id, order_no:linked.order_no, style_no:linked.style_no, style_input:linked.style_no, colour:linked.colour, component:linked.component, planned_qty:0 }, rows, simulatedRows, activeDept, line, d, ledger);
      const dayQtyAvailable = Math.max(0, n(dayNeed.availableForThisSlot));
      if (!dayQtyAvailable) continue;
      const qty = Math.min(qtyLeft, maxQtyForHours, dayQtyAvailable);
      const neededProductionHours = target ? (qty * 8) / target : 0;
      const neededHoursRaw = neededProductionHours + lostHours;
      const planHrs = Math.max(0.25, Math.min(hoursCap, Math.ceil(neededHoursRaw * 4) / 4));
      qtyLeft = Math.max(0, qtyLeft - qty);
      const completeHere = qtyLeft <= 0;
      const generatedRow = normalizePlanRowForState({
        ...baseWithSlot,
        row_id:linked.id,
        order_no:linked.order_no,
        style_no:linked.style_no,
        style_input:linked.style_no,
        buyer:linked.buyer,
        colour:linked.colour,
        component:linked.component,
        eight_hr_target:target,
        remaining_hours:planHrs,
        changeover:changeoverAuto,
        changeover_override:d === day ? !!current?.changeover_override : false,
        qty_auto_mode:true,
        planned_qty:qty,
        ops:current?.ops || base?.ops || defaultOpsForStyle(linked) || "",
        stitching_end_date:completeHere ? d : (base?.stitching_end_date || ""),
        remarks:completeHere ? "AUTO CASCADE FINISH" : "CONTINUE RUNNING",
        short_close:false,
        source:"auto_cascade_line_plan",
        source_label:"Auto cascade line plan",
        source_type:"Auto / cascade checked",
        updated_at:new Date().toISOString()
      });
      generated.push(generatedRow);
      simulatedRows = [...simulatedRows.filter(p=>!(String(p.dept)===String(generatedRow.dept) && String(p.line||"")===String(generatedRow.line||"") && String(p.plan_date||"").slice(0,10)===String(generatedRow.plan_date||"").slice(0,10) && planSlotNo(p)===planSlotNo(generatedRow))), generatedRow];
    }
    if (!generated.length) { notify("No available hours found in the forward planning horizon for this line. Add a slot or reduce existing planned hours.", "Cascade could not run"); return; }
    const generatedIds = new Set(generated.map(g=>String(g.id)));
    const generatedKeys = new Set(generated.map(g=>[g.dept,g.line,g.plan_date,planSlotNo(g)].join("|")));
    const linkedKeyForCascade = styleKeyOf(linked);
    const futureSameStyleRows = (planRows||[]).filter(p=>String(p.dept)===String(activeDept) && String(p.line||"")===String(lineKey) && String(p.plan_date||"").slice(0,10)>=String(day).slice(0,10) && (p.row_id===linked.id || styleKeyOf(p)===linkedKeyForCascade) && !generatedIds.has(String(p.id)) && !generatedKeys.has([p.dept,p.line,p.plan_date,planSlotNo(p)].join("|")));
    setPlanRows(prev=>{
      const removeIds = new Set([...generatedIds, ...futureSameStyleRows.map(p=>String(p.id))]);
      const removeKeys = new Set([...generatedKeys, ...futureSameStyleRows.map(p=>[p.dept,p.line,p.plan_date,planSlotNo(p)].join("|"))]);
      return [...(prev||[]).filter(p=>!removeIds.has(String(p.id)) && !removeKeys.has([p.dept,p.line,p.plan_date,planSlotNo(p)].join("|"))), ...generated];
    });
    futureSameStyleRows.forEach(old=>onPlanDelete?.(old, { dept:activeDept, line:lineKey, day:old.plan_date, slot_no:planSlotNo(old), reason:"auto_cascade_replaced_future_same_style" }));
    generated.forEach(row=>schedulePlanSave(row, line, row.plan_date));
    const msg = qtyLeft > 0
      ? `Auto-filled ${generated.length} plan slot(s). ${fmt(qtyLeft)} qty still remains after the forward planning horizon.`
      : `Auto-filled ${generated.length} plan slot(s) and finished ${linked.style_no} on ${generated[generated.length-1].plan_date}.`;
    notify(msg, "Auto cascade complete");
  }
  function quickAddStyleFromCell(line, day, slotNo){
    const p=findCellSlot(line,day,slotNo)||{};
    const style = planStyleText(p).toUpperCase();
    if (!style) { notify("Type the style number first, then add style detail.", "Style number needed"); return; }
    if (resolvePlanStyle(rows, style)) { notify("This style already exists in Styles master.", "Already exists"); return; }
    setQuickAdd({
      line, day, slotNo, style,
      order_no: p.order_no || `PLAN-${style}`,
      buyer: p.buyer || "",
      colour: p.colour || "",
      component: p.component || "MAIN",
      qty: String(n(p.planned_qty) || ""),
      target: String(n(p.eight_hr_target) || defaultFullDayOutputForStyle({})),
      ops: String(n(p.ops) || DEFAULT_PLAN_HEADCOUNT)
    });
  }
  async function submitQuickAdd(){
    if (!quickAdd) return;
    const { line, day, slotNo, style } = quickAdd;
    const orderNo = String(quickAdd.order_no||"").trim();
    if (!orderNo) { notify("Order No is required.", "Missing order no"); return; }
    const buyer = String(quickAdd.buyer||"").trim();
    const colour = String(quickAdd.colour||"").trim();
    const component = String(quickAdd.component||"MAIN").trim() || "MAIN";
    const qty = n(quickAdd.qty) || 0;
    const target = n(quickAdd.target) || defaultFullDayOutputForStyle({});
    const ops = n(quickAdd.ops) || DEFAULT_PLAN_HEADCOUNT;
    const size_set = "alpha";
    const sizeList = getSizeSets()[size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
    const rowBase = { order_no:orderNo.toUpperCase(), style_no:style, buyer:buyer.toUpperCase(), colour:colour.toUpperCase(), component:component.toUpperCase(), order_qty:qty, size_set, order_size_qty:normalizeSizeQtyMap({}, sizeList), line:activeDept === "stitching" ? line : "", daily_target:target, ops, headcount:ops, print_required:activeDept === "printing", embroidery_required:activeDept === "embroidery", stages:{} };
    const newRow = { ...rowBase, id:stableProductionOrderId(rowBase), stages:blankStagesForRoute(rowBase), route:routeFor(rowBase), difficulty:"Normal", priority:"Normal" };
    setRows?.(prev=>[newRow, ...(prev||[]).filter(r=>styleCompositeKey(r)!==styleCompositeKey(newRow))]);
    const save = await upsertOneStyleToSupabase(newRow);
    if (save?.error) notify(`Style added locally but Supabase save failed: ${save.error.message}`, "Partial save");
    recordProductionAudit("style_add_from_plan", { table_name:"production_orders", order_no:newRow.order_no, style_no:newRow.style_no, colour:newRow.colour, component:newRow.component, qty:newRow.order_qty, source:"Planning quick add", after_data:{ daily_target:target, line:newRow.line } });
    const existingCell = findCellSlot(line, day, slotNo);
    updateCell(line, day, slotNo, { style_input:newRow.style_no, row_id:newRow.id, order_no:newRow.order_no, buyer:newRow.buyer, colour:newRow.colour, component:newRow.component, eight_hr_target:target, ops, qty_auto_mode:!n(existingCell?.planned_qty) });
    setQuickAdd(null);
  }
  function exportBoard(){
    const weekPlans = (planRows||[]).filter(p=>String(p.dept)===String(activeDept) && weekDays.includes(String(p.plan_date||"").slice(0,10)));
    const teamRows = planTeamExportRows(planRows, rows, ledger, activeDept, weekDays);
    const daySummary = planDailySummaryExportRows(teamRows);
    const lineSummary = planLineSummaryExportRows(teamRows);
    const styleSummary = planStyleSummaryExportRows(teamRows);
    const out = [];
    boardRows.forEach(line=>{
      const maxSlot = Math.max(1, ...weekDays.flatMap(day=>lineDayPlanRows(planRows, activeDept, line, day).map(planSlotNo)));
      for (let slot=1; slot<=maxSlot; slot++){
        const row = { Line:line, Slot:slot };
        weekDays.forEach(day=>{
          const p=findCellSlot(line,day,slot)||{};
          row[`${shortDayLabel(day)} Style`] = planStyleText(p);
          row[`${shortDayLabel(day)} Brand`] = p.buyer || "";
          row[`${shortDayLabel(day)} Qty`] = planReportQty(p) || "";
          row[`${shortDayLabel(day)} Actual`] = planStyleText(p) ? achievedForPlan(p, rows, ledger) : "";
          row[`${shortDayLabel(day)} Balance`] = planStyleText(p) ? Math.max(0, planReportQty(p) - achievedForPlan(p, rows, ledger)) : "";
          row[`${shortDayLabel(day)} Full_Day_Target`] = n(p.eight_hr_target) || "";
          row[`${shortDayLabel(day)} Plan_Hours`] = planCapacityHours(p) || "";
          row[`${shortDayLabel(day)} Day_Remaining_After`] = p ? dayRemainingAfterSlot(lineDayPlanRows(planRows, activeDept, line, day), p) : "";
          row[`${shortDayLabel(day)} Changeover_Lost_Time`] = p.changeover ? (p.changeover_override ? "Yes - manual" : "Yes - style change") : (p.changeover_override ? "No - manual" : "No");
          row[`${shortDayLabel(day)} End Date`] = p.stitching_end_date || "";
          row[`${shortDayLabel(day)} OPS`] = planCapacityOps(p) || "";
          row[`${shortDayLabel(day)} Note`] = p.short_close ? "SHORT CLOSE" : (p.remarks || "");
        });
        out.push(row);
      }
    });
    exportXlsx(`production_${activeDept}_weekly_line_board_${weekDays[0]}.xlsx`, [
      { name:"Team Daily Board", rows:teamRows },
      { name:"Day Summary", rows:daySummary },
      { name:"Line Summary", rows:lineSummary },
      { name:"Style Summary", rows:styleSummary },
      { name:"Printable Board", rows:out },
      { name:"Plan vs Achieved", rows:planVsAchievedRows(weekPlans, rows, ledger) },
      { name:"Raw Plan Rows", rows:weekPlans.map(p=>({ ...p, Reporting_Plan_Qty:planReportQty(p), Actual_Qty:achievedForPlan(p, rows, ledger), OPS_For_Capacity:planCapacityOps(p), Plan_Hours_For_Capacity:planCapacityHours(p) })) }
    ]);
  }
  function lineDayOpsForPlan(line, day){
    // Headcount is line manpower for the day, not additive per style slot.
    // If the same line runs 2 styles in one day, use the highest OPS value on that line/day.
    const vals = lineDayPlanRows(planRows, activeDept, line, day).map(p=>planCapacityOps(p)).filter(Boolean);
    return vals.length ? Math.max(...vals) : 0;
  }
  const weekDayTotals = weekDays.map(day=>({
    day,
    qty:boardRows.reduce((a,line)=>a+lineDayPlanRows(planRows, activeDept, line, day).reduce((x,p)=>x+coverAdjustedPlanQty(p, planRows, rows, ledger),0),0),
    ops:boardRows.reduce((a,line)=>a+lineDayOpsForPlan(line, day),0),
    hours:boardRows.reduce((a,line)=>a+lineDayPlanRows(planRows, activeDept, line, day).reduce((x,p)=>x+planCapacityHours(p),0),0)
  }));
  function maxSlotsForLine(line){ return Math.max(1, ...weekDays.flatMap(day=>lineDayPlanRows(planRows, activeDept, line, day).map(planSlotNo))); }
  function compactCellPlan(line, day, slotNo){
    return findCellSlot(line, day, slotNo) || { id:stablePlanId(activeDept, planCellLineKey(activeDept,line), day, slotNo), dept:activeDept, line:planCellLineKey(activeDept,line), plan_date:day, slot_no:slotNo, remaining_hours:8, qty_auto_mode:false, source:"manual_excel_board", source_label:"Excel weekly line board" };
  }
  function changeoverHoursInfo(line, day, slotNo, candidate){
    const allForDay = lineDayPlanRows(planRows, activeDept, line, day);
    const before = remainingHoursBeforeSlot(allForDay, candidate);
    const used = planHours(candidate);
    const isChange = effectiveChangeoverForSlot(line, day, slotNo, candidate);
    const lost = isChange ? Math.min(CHANGEOVER_LOST_HOURS, used) : 0;
    const productive = Math.max(0, used - lost);
    const after = dayRemainingAfterSlot(allForDay, candidate);
    return { before, used, lost, productive, after, text:`Lost ${fmt(lost)}h · ${fmt(after)}h free` };
  }
  function cellTinyText(p){
    if (!planStyleText(p) && !n(p.planned_qty) && !n(p.ops)) return "";
    const parts = [];
    if (p.remarks) parts.push(String(p.remarks).slice(0,18));
    else if (p.stitching_end_date) parts.push(`ends ${shortDayLabel(p.stitching_end_date)}`);
    if (p.short_close) parts.push("short close");
    return parts.join(" · ");
  }
  function lineDayHoursSummary(line, day){
    const list = lineDayPlanRows(planRows, activeDept, line, day);
    const used = totalUsedPlanHours(list);
    const free = Math.max(0, 8 - used);
    return { used, free, hasAny: list.length>0 };
  }
  function cellActualInfo(p){
    if (!planStyleText(p)) return null;
    const day = String(p.plan_date||"").slice(0,10);
    if (!day || day > today()) return null; // future slot, nothing to compare yet
    const achieved = achievedForPlan(p, rows, ledger);
    const planned = planReportQty(p);
    if (!achieved && !planned) return null;
    const tone = !planned ? "info" : achieved >= planned ? "ok" : achieved > 0 ? "warn" : "late";
    return { achieved, planned, tone, done: planned>0 && achieved >= planned };
  }
  function syncFromActual(line, day, slotNo){
    const p = findCellSlot(line, day, slotNo);
    if (!p) return;
    const achieved = achievedForPlan(p, rows, ledger);
    if (!achieved) { notify("No DPR actual entry found yet for this style/date. Nothing to sync.", "Nothing to sync"); return; }
    const allForDay = lineDayPlanRows(planRows, activeDept, line, day);
    const before = remainingHoursBeforeSlot(allForDay, p);
    const bookedHours = planHours(p) || Math.max(0, 8 - before);
    const target = n(p.eight_hr_target) || defaultFullDayOutputForStyle(resolvePlanStyle(rows, p) || {});
    const ratio = target > 0 ? Math.min(1, achieved / target) : 1;
    const actualHoursUsed = Math.round(ratio * bookedHours * 100) / 100;
    const freed = Math.max(0, Math.round((bookedHours - actualHoursUsed) * 100) / 100);
    confirmAction(
      `Actual so far: ${fmt(achieved)} (target ${fmt(target)})\nBooked hours: ${fmt(bookedHours)}h → hours actually needed: ${fmt(actualHoursUsed)}h\nThis frees ${fmt(freed)}h on ${shortDayLabel(day)} · ${line} for the next style.`,
      "Sync this slot to actual DPR output?",
      () => {
        updateCell(line, day, slotNo, { planned_qty:achieved, remaining_hours:actualHoursUsed, qty_auto_mode:false, remarks:`Synced from actual (${fmt(achieved)}) — freed ${fmt(freed)}h` });
        if (freed > 0.25) addNextStyleSlot(line, day);
      }
    );
  }
  const editor = editCell ? compactCellPlan(editCell.line, editCell.day, editCell.slotNo) : null;
  const editorLinked = editor ? resolvePlanStyle(rows, editor) : null;
  const editorAll = editor ? lineDayPlanRows(planRows, activeDept, editCell.line, editCell.day) : [];
  const editorRemainingBefore = editor ? remainingHoursBeforeSlot(editorAll.length ? editorAll : [editor], editor) : 8;
  const editorRemainingAfter = editor ? dayRemainingAfterSlot(editorAll.length ? editorAll : [editor], editor) : 8;
  const editorAutoChangeover = editor ? autoChangeoverForSlot(editCell.line, editCell.day, editCell.slotNo, editor) : false;
  const editorEffectiveChangeover = editor ? effectiveChangeoverForSlot(editCell.line, editCell.day, editCell.slotNo, editor) : false;
  const editorAutoQty = editor ? planAutoQtyFromTarget({ ...editor, changeover:editorEffectiveChangeover, eight_hr_target:n(editor?.eight_hr_target) || defaultFullDayOutputForStyle(editorLinked || {}), remaining_hours:n(editor?.remaining_hours || editorRemainingBefore) }) : 0;
  const editorNeed = editor && planStyleText(editor) ? planNeedBreakdown({ ...editor, changeover:editorEffectiveChangeover }, rows, planRows, activeDept, editCell.line, editCell.day, ledger) : null;
  const planLineColWidth = n(planColWidths?.line) || 104;
  const planDayColWidth = n(planColWidths?.day) || (fit ? 120 : 145);
  const planWeekColWidth = n(planColWidths?.week) || 86;
  const planTableStyle = { "--plan-line-col":`${planLineColWidth}px`, "--plan-day-col":`${planDayColWidth}px`, "--plan-week-col":`${planWeekColWidth}px`, "--plan-table-min-width":`${planLineColWidth + (weekDays.length * planDayColWidth) + planWeekColWidth}px` };
  return <div className={`mt-plan-board-wrap compact-excel ${fit?"fit":""}`}>
    <datalist id={datalistId}>{filteredStyles.map(r=><option key={r.id} value={planStyleOptionValue(r)}>{r.buyer} · {r.colour} · {r.component}</option>)}</datalist>
    <div className="mt-plan-board-head no-print"><div><div className="mt-plan-board-title">Compact Excel Weekly Board — {stageLabel(activeDept)}</div><div className="mt-panel-sub">Default cell now shows only Style / Qty / OPS / Finish-note. Click a cell for the hidden target, changeover, projected feed and cascade tools.</div></div><div className="mt-toolbar"><span className="mt-toolbar-label">Find style</span><input className="mt-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="filter typeahead styles"/><span className="mt-toolbar-label">Width</span><label className="mt-plan-width-control">Line <input type="number" value={planLineColWidth} onChange={e=>setPlanColWidth("line", e.target.value)} /></label><label className="mt-plan-width-control">Day <input type="number" value={planDayColWidth} onChange={e=>setPlanColWidth("day", e.target.value)} /></label><label className="mt-plan-width-control">Week <input type="number" value={planWeekColWidth} onChange={e=>setPlanColWidth("week", e.target.value)} /></label><button className="mt-btn ghost" onClick={()=>setPlanColWidths({ line:104, day:145, week:86 })}>Reset widths</button><button className="mt-btn primary" onClick={exportBoard}><Download size={14}/>Export Board</button></div></div>
    <div className="mt-plan-week-total-strip no-print">{weekDayTotals.map(t=><span key={t.day}><b>{shortDayLabel(t.day)}</b> · Qty {fmt(t.qty)} · OPS {fmt(t.ops)} · Hrs {fmt(t.hours)}</span>)}</div>
    <div className="mt-compact-board-scroll">
      <table className="mt-compact-plan-table" style={planTableStyle}>
        <thead><tr><th className="line-head">Line</th>{weekDays.map(day=>{ const t=weekDayTotals.find(x=>x.day===day)||{}; return <th key={day} className="day-head"><div>{shortDayLabel(day)}</div><small>{fmt(t.qty)} pcs · {fmt(t.ops)} ops</small>{showTargets && <small> · {fmt(t.hours)}h</small>}</th>; })}<th className="week-head">Week</th></tr></thead>
        <tbody>{boardRows.flatMap(line=>{
          const maxSlot = maxSlotsForLine(line);
          return Array.from({length:maxSlot}, (_,idx)=>idx+1).map(slotNo=>{
            const linePlans = weekDays.flatMap(day=>lineDayPlanRows(planRows, activeDept, line, day)).filter(p=>planSlotNo(p)===slotNo);
            const lineQty = linePlans.reduce((a,p)=>a+coverAdjustedPlanQty(p, planRows, rows, ledger),0);
            return <tr key={`${line}-${slotNo}`}>
              <td className="line-cell"><b>{line}</b>{maxSlot>1 && <span>Slot {slotNo}</span>}</td>
              {weekDays.map(day=>{
                const p = compactCellPlan(line, day, slotNo);
                const has = !!(planStyleText(p) || n(p.planned_qty) || n(p.ops) || p.stitching_end_date || p.remarks);
                const linked = resolvePlanStyle(rows, p);
                const effChange = effectiveChangeoverForSlot(line, day, slotNo, p);
                const need = has && planStyleText(p) ? planNeedBreakdown({ ...p, changeover:effChange }, rows, planRows, activeDept, line, day, ledger) : null;
                const chInfo = has && effChange ? changeoverHoursInfo(line, day, slotNo, p) : null;
                const actualInfo = has ? cellActualInfo(p) : null;
                const overOpen = has && linked ? liveOpenPlanOverage(p, linked, activeDept) : 0;
                const allocationOver = has && !isHistoricalPlanReportingRow(p) && need?.over;
                const historicalReporting = has && isHistoricalPlanReportingRow(p);
                const daySummary = slotNo === 1 ? lineDayHoursSummary(line, day) : null;
                const tone = allocationOver ? "late" : need?.projectedFeed > 0 && need?.availableForThisSlot >= n(p.planned_qty) ? "warn" : has ? "ok" : "empty";
                return <td key={`${line}-${day}-${slotNo}`} className={`compact-plan-cell ${tone} ${effChange ? "changeover" : ""}`}>
                  <button className="compact-plan-cell-btn" onClick={()=>{ setEditCell({ line, day, slotNo }); setEditorAutoOpen(false); }}>
                    {has ? <>
                      <div className="c-style">{planStyleText(p)}{p.cover_recovery_slot ? <span className="mt-chip mt-purple" style={{marginLeft:5}}>Cover</span> : null}</div>
                      <div className="c-brand">{p.buyer || linked?.buyer || ""}{(linked?.colour || linked?.component) ? ` · ${[linked?.colour, linked?.component].filter(Boolean).join(" ")}` : ""}</div>
                      <div className="c-metrics"><b>{fmt(planReportQty(p))}</b><span>{fmt(planCapacityOps(p))} ops</span></div>
                      <div className="c-note">{cellTinyText(p) || (effChange ? "changeover" : "")}</div>
                      {actualInfo && <div className={`c-ready ${actualInfo.tone}`}>Actual {fmt(actualInfo.achieved)} / Plan {fmt(actualInfo.planned)}{actualInfo.done ? " · done" : ""}</div>}
                      {allocationOver && <div className="c-ready late">Qty over-reserved: only {fmt(need?.availableForThisSlot)} left after this week’s other planned slots.</div>}
                      {overOpen > 0 && <div className="c-ready late">Future plan exceeds current open by {fmt(overOpen)} — re-check/re-cascade.</div>}
                      {historicalReporting && actualInfo && <div className="c-ready info">Old plan: reporting target only</div>}
                      {need && <div className={`c-ready ${planLoadReadyInfo({ ...p, changeover:effChange }, rows, planRows, activeDept, line, day, ledger).tone}`}>Load: {planLoadReadyShort({ ...p, changeover:effChange }, rows, planRows, activeDept, line, day, ledger)}</div>}
                      {effChange && chInfo && <div className="c-changeover">Changeover · <span className="lost">Lost {fmt(chInfo.lost)}h</span> · <span className="left">{fmt(chInfo.productive)}h production</span> · <span className="free">{fmt(chInfo.after)}h free</span></div>}
                      {showTargets && <div className="c-auto">{p.cover_recovery_slot ? "Cover target · no OPS/hours" : `${effChange ? "CO" : "100%"} · ${fmt(planCapacityHours(p))}h · auto ${fmt(planAutoQtyFromTarget({ ...p, changeover:effChange }))}`}</div>}
                    </> : <span className="compact-add">+ add</span>}
                    {daySummary && daySummary.hasAny && <div className={`c-daytotal ${daySummary.free>0.05?"warn":"ok"}`}>{fmt(daySummary.used)}h/8h{daySummary.free>0.05?` · ${fmt(daySummary.free)}h not planned`:""}</div>}
                  </button>
                </td>;
              })}
              <td className="week-total">{fmt(lineQty)}</td>
            </tr>;
          });
        })}<tr className="compact-total-row"><td>Total</td>{weekDays.map(day=>{ const t=weekDayTotals.find(x=>x.day===day)||{}; return <td key={day}><b>{fmt(t.qty)}</b><span>{fmt(t.ops)} ops</span></td>; })}<td><b>{fmt(weekDayTotals.reduce((a,t)=>a+n(t.qty),0))}</b></td></tr></tbody>
      </table>
    </div>
    {editCell && editor && <div className="mt-plan-editor-backdrop" onClick={()=>setEditCell(null)}><div className="mt-plan-editor" onClick={e=>e.stopPropagation()}>
      <div className="mt-plan-editor-head"><div><b>{editCell.line} · {shortDayLabel(editCell.day)}</b><span>Slot {editCell.slotNo}{editorLinked ? ` · ${[editorLinked.colour, editorLinked.component].filter(Boolean).join(" · ")}` : ""}</span></div><button className="mt-btn" onClick={()=>setEditCell(null)}><X size={14}/></button></div>
      {(() => {
        const liveOpen = editorLinked ? n(entryFieldContext(editorLinked, activeDept, "output").open) : null;
        if (liveOpen === null) return null;
        const historicalReporting = isHistoricalPlanReportingRow(editor);
        const over = historicalReporting ? 0 : Math.max(0, planReportQty(editor) - liveOpen);
        return <div className={`mt-plan-actual-sync ${historicalReporting ? "info" : over>0 ? "warn" : "ok"}`}><div><b>{historicalReporting ? "Historical plan row" : `Currently open in ${stageLabel(activeDept)}`}:</b> {fmt(liveOpen)} pcs{historicalReporting ? <span className="mt-small"> — live open is shown for reference only. This old plan remains a reporting target and will not be reduced or blocked by today's open balance.</span> : over>0 ? <span className="mt-small"> — this future/current cell plans {fmt(over)} more than live open. Re-check/re-cascade before execution.</span> : <span className="mt-small"> — this cell's qty fits within what's actually still open.</span>}</div></div>;
      })()}
      {(() => {
        const allocation = editor && planStyleText(editor) ? planNeedBreakdown(editor, rows, planRows, activeDept, editCell.line, editCell.day, ledger) : null;
        return allocation?.linked && !isHistoricalPlanReportingRow({ ...editor, plan_date:editCell.day }) ? <div className={`mt-plan-actual-sync ${allocation.over ? "warn" : "ok"}`}><div><b>Qty allocation guard:</b> {planQuantityAllocationMessage(allocation)} Split line is allowed; only over-allocating the weekly remaining qty is blocked.</div></div> : null;
      })()}
      <div className="mt-plan-editor-body">
        <div className="mt-editor-fields-grid">
          <div className="mt-plan-field wide"><label>Style</label><input className="mt-input style-input" list={datalistId} value={planStyleText(editor)} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{style_input:e.target.value})} placeholder="TYPE / PICK STYLE" autoFocus/></div>
          <div className="mt-plan-field"><label>Brand</label><input className="mt-input" value={editor?.buyer || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{buyer:e.target.value})} placeholder="BRAND"/></div>
          <div className="mt-plan-field"><label>Qty</label><input className={`mt-input ${planStyleText(editor) && !n(editor?.planned_qty) ? "mandatory" : ""}`} value={editor?.planned_qty || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{planned_qty:e.target.value.replace(/[^0-9]/g,""), qty_auto_mode:false})} placeholder="DAY TARGET REQUIRED"/></div>
          <div className="mt-plan-field"><label>OPS</label><input className={`mt-input ${planStyleText(editor) && !n(editor?.ops) ? "mandatory" : ""}`} value={editor?.ops || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{ops:e.target.value.replace(/[^0-9]/g,"")})} placeholder="HEADCOUNT REQUIRED"/></div>
          <div className="mt-plan-field"><label>Finish date</label><input className="mt-input" type="date" value={editor?.stitching_end_date || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{stitching_end_date:e.target.value})}/></div>
          <div className="mt-plan-field wide"><label>Note</label><input className="mt-input" value={editor?.remarks || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{remarks:e.target.value})} placeholder="continue / reason"/></div>
        </div>
        {planStyleText(editor) && (!n(editor?.planned_qty) || !n(editor?.ops)) && <div className="mt-mandatory-note"><AlertTriangle size={14}/> Qty/output and OPS/headcount are mandatory once a style is selected. The app now auto-fills defaults; edit them if needed before final team export.</div>}
        <details className="mt-plan-available-picker no-print"><summary>Available styles to load / stitch first — cross-check by feed</summary><div className="mt-plan-style-picks">{availableStylePickerRows(rows, planRows, activeDept, editCell.day, ledger, editCell.line, editCell.slotNo).slice(0,40).map(({row,available,ready})=>{
          const noQtyLeft = n(available) <= 0 && !isHistoricalPlanReportingRow({ plan_date:editCell.day });
          return <button key={row.id} disabled={noQtyLeft} className={`mt-plan-style-pick ${noQtyLeft ? "late" : ready.tone}`} onClick={()=>updateCell(editCell.line,editCell.day,editCell.slotNo,{style_input:row.style_no, row_id:row.id, order_no:row.order_no, buyer:row.buyer, colour:row.colour, component:row.component})}><b>{row.style_no}</b><span>{row.order_no} · {row.buyer} · {row.colour} · {row.component} · future-plan unplanned qty left {fmt(available)} · {noQtyLeft ? "fully planned already in future plan" : ready.label}</span></button>;
        })}</div></details>
        {planStyleText(editor) && !editorLinked && <div className="mt-plan-add-style"><b>Not in Styles master.</b><button className="mt-btn primary" onClick={()=>quickAddStyleFromCell(editCell.line,editCell.day,editCell.slotNo)}>+ Add style detail</button></div>}
        {(() => { const ai = editor && planStyleText(editor) ? cellActualInfo(editor) : null; if (!ai) return null; return <div className={`mt-plan-actual-sync ${ai.tone}`}>
          <div><b>Actual so far:</b> {fmt(ai.achieved)} <span className="mt-small">/ plan {fmt(ai.planned)}</span>{ai.done ? <span className="mt-chip mt-ok" style={{marginLeft:6}}>Target met</span> : null}</div>
          <button className="mt-btn ghost" onClick={()=>syncFromActual(editCell.line,editCell.day,editCell.slotNo)}>Sync from actual → free hours for next style</button>
        </div>; })()}
        <button className="mt-plan-engine-toggle" onClick={()=>setEditorAutoOpen(v=>!v)}><span>⚙ Auto target, changeover lost time, projected feed & cascade</span><b>{editorAutoOpen ? "Hide ▲" : "Optional ▾"}</b></button>
        {editorAutoOpen && <div className="mt-plan-editor-engine">
          <div className="mt-editor-fields-grid compact">
            <div className="mt-plan-field"><label>Full-day target</label><input className="mt-input" value={editor?.eight_hr_target || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{eight_hr_target:e.target.value.replace(/[^0-9]/g,""), qty_auto_mode:!!editor?.qty_auto_mode})} placeholder="8hr qty"/></div>
            <div className="mt-plan-field"><label>Plan hours</label><input className="mt-input" value={editor?.remaining_hours || ""} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{remaining_hours:e.target.value.replace(/[^0-9.]/g,""), qty_auto_mode:!!editor?.qty_auto_mode})} placeholder={String(editorRemainingBefore || 8)}/></div>
            <div className="mt-plan-readonly"><span>Remaining after</span><b>{fmt(editorRemainingAfter)}h</b></div>
            <div className="mt-plan-readonly"><span>Auto qty</span><b>{fmt(editorAutoQty)}</b></div>
          </div>
          <div className="mt-plan-action-row"><button className="mt-btn ghost" onClick={()=>useRemainingHours(editCell.line,editCell.day,editCell.slotNo)}>Use remaining hrs</button><label className="mt-small"><input type="checkbox" checked={!!editorEffectiveChangeover} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{changeover:e.target.checked, changeover_override:true, qty_auto_mode:!!editor?.qty_auto_mode, planned_qty:editor?.qty_auto_mode ? planAutoQtyFromTarget({ ...editor, changeover:e.target.checked, eight_hr_target:n(editor?.eight_hr_target) || defaultFullDayOutputForStyle(editorLinked || {}), remaining_hours:n(editor?.remaining_hours || editorRemainingBefore) }) : editor?.planned_qty})}/> changeover lost time</label>{editor?.changeover_override && <button className="mt-btn ghost" onClick={()=>updateCell(editCell.line,editCell.day,editCell.slotNo,{changeover_override:false, qty_auto_mode:!!editor?.qty_auto_mode})}>Auto changeover</button>}<label className="mt-small"><input type="checkbox" checked={!!editor?.qty_auto_mode} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{qty_auto_mode:e.target.checked, planned_qty:e.target.checked ? editorAutoQty : editor?.planned_qty})}/> auto qty</label></div>
          <div className="mt-plan-auto-hint">{changeoverExplain(editCell.line, editCell.day, editCell.slotNo, editor)}. Manual Qty always wins.</div>
          {editorEffectiveChangeover && <div className="mt-plan-changeover-read">Changeover day highlight: {fmt(changeoverHoursInfo(editCell.line, editCell.day, editCell.slotNo, editor).before)}h available before this style · {fmt(planHours(editor))}h booked · <b>{fmt(changeoverHoursInfo(editCell.line, editCell.day, editCell.slotNo, editor).lost)}h lost before production starts</b> · {fmt(changeoverHoursInfo(editCell.line, editCell.day, editCell.slotNo, editor).productive)}h productive equivalent · <b>{fmt(changeoverHoursInfo(editCell.line, editCell.day, editCell.slotNo, editor).after)}h free after slot</b>.</div>}
          {editorNeed && <div className="mt-plan-need-mini expanded"><div><span>Need this slot</span><b>{fmt(editorNeed.qtyNeeded)}</b></div><div><span>Ready to load</span><b>{planLoadReadyShort({ ...editor, changeover:editorEffectiveChangeover }, rows, planRows, activeDept, editCell.line, editCell.day, ledger)}</b></div><div><span>Actual ready</span><b>{fmt(editorNeed.actualReadyFeed)}</b></div><div><span>Projected</span><b>{fmt(editorNeed.projectedFeed)}</b></div><div><span>After slot</span><b className={editorNeed.afterThisSlot < 0 ? "mt-delta-neg" : "mt-delta-pos"}>{fmt(editorNeed.afterThisSlot)}</b></div></div>}
        </div>}
        <div className="mt-plan-editor-actions no-print"><button className="mt-btn primary" onClick={()=>autoFillCascadeFromSlot(editCell.line,editCell.day,editCell.slotNo)}>Auto fill cascade</button><button className="mt-btn ghost" onClick={()=>carryForward(editCell.line,editCell.day,editCell.slotNo)}>Use previous day</button><button className="mt-btn ghost" onClick={()=>fillNext(editCell.line,editCell.day,editCell.slotNo)}>Copy to next</button><button className="mt-btn ghost" onClick={()=>addNextStyleSlot(editCell.line,editCell.day)}>+ Add next style</button><label className="mt-small"><input type="checkbox" checked={!!editor?.short_close} onChange={e=>updateCell(editCell.line,editCell.day,editCell.slotNo,{short_close:e.target.checked, remarks:e.target.checked ? "SPECIAL SHORT CLOSE" : (editor?.remarks || "")})}/> short close</label><button className="mt-btn ghost danger" onClick={()=>{ clearCellSlot(editCell.line,editCell.day,editCell.slotNo); setEditCell(null); }}>Delete slot</button></div>
      </div>
    </div></div>}
    {notice && <div className="mt-update-backdrop no-print" onClick={()=>notice.kind==="info" && setNotice(null)}><div className="mt-manager-decision-modal" style={{width:"min(460px,92vw)"}} onClick={e=>e.stopPropagation()}>
      <div className="head"><b>{notice.title}</b></div>
      <div className="body"><div className="mt-small" style={{whiteSpace:"pre-line", fontSize:12.5, lineHeight:1.5}}>{notice.message}</div>
        <div className="actions">
          {notice.kind==="confirm" ? <>
            <button className="mt-btn ghost" onClick={()=>setNotice(null)}>Cancel</button>
            <button className="mt-btn primary" onClick={()=>{ notice.onConfirm?.(); setNotice(null); }}>Confirm</button>
          </> : <button className="mt-btn primary" onClick={()=>setNotice(null)}>OK</button>}
        </div>
      </div>
    </div></div>}
    {quickAdd && <div className="mt-update-backdrop no-print" onClick={()=>setQuickAdd(null)}><div className="mt-manager-decision-modal" style={{width:"min(520px,94vw)"}} onClick={e=>e.stopPropagation()}>
      <div className="head"><div><b>Add style detail — {quickAdd.style}</b><span className="mt-small" style={{color:"var(--on-dark-2)"}}>Not yet in Styles master. Fill this in once; it's saved to Styles and linked to this plan cell.</span></div><button className="mt-btn ghost" onClick={()=>setQuickAdd(null)}><X size={14}/></button></div>
      <div className="body">
        <div className="mt-editor-fields-grid">
          <div className="mt-plan-field"><label>Order No</label><input className="mt-input" value={quickAdd.order_no} onChange={e=>setQuickAdd(q=>({ ...q, order_no:e.target.value }))} placeholder="ORDER / SO NO"/></div>
          <div className="mt-plan-field"><label>Buyer</label><input className="mt-input" value={quickAdd.buyer} onChange={e=>setQuickAdd(q=>({ ...q, buyer:e.target.value }))} placeholder="BUYER / BRAND"/></div>
          <div className="mt-plan-field"><label>Colour</label><input className="mt-input" value={quickAdd.colour} onChange={e=>setQuickAdd(q=>({ ...q, colour:e.target.value }))} placeholder="COLOUR"/></div>
          <div className="mt-plan-field"><label>Component</label><input className="mt-input" value={quickAdd.component} onChange={e=>setQuickAdd(q=>({ ...q, component:e.target.value }))} placeholder="MAIN"/></div>
          <div className="mt-plan-field"><label>Order Qty</label><input className="mt-input" value={quickAdd.qty} onChange={e=>setQuickAdd(q=>({ ...q, qty:e.target.value.replace(/[^0-9]/g,"") }))} placeholder="ORDER QTY"/></div>
          <div className="mt-plan-field"><label>8hr target</label><input className="mt-input mandatory" value={quickAdd.target} onChange={e=>setQuickAdd(q=>({ ...q, target:e.target.value.replace(/[^0-9]/g,"") }))} placeholder="FULL-DAY OUTPUT"/></div>
          <div className="mt-plan-field"><label>OPS</label><input className="mt-input mandatory" value={quickAdd.ops} onChange={e=>setQuickAdd(q=>({ ...q, ops:e.target.value.replace(/[^0-9]/g,"") }))} placeholder="HEADCOUNT"/></div>
        </div>
        <div className="actions"><button className="mt-btn ghost" onClick={()=>setQuickAdd(null)}>Cancel</button><button className="mt-btn primary" onClick={submitQuickAdd}>Save & link to this cell</button></div>
      </div>
    </div></div>}
  </div>;
}



function styleActualBreakupRows(row){
  if (!row) return [];
  return STAGES.map(st=>{
    const sd = sdata(row, st.key);
    const feed = st.key === "cutting" ? n(row.order_qty) : stageFeed(row, st.key);
    const out = n(sd.output);
    const issued = n(sd.issued);
    const ram = loss(sd);
    const open = Math.max(0, feed - out - ram);
    return { Dept:st.label, Feed_Qty:feed, Good_Output:out, Issued_Forward:issued, Reject:n(sd.reject), Alter_Pending:n(sd.alter), Missing:n(sd.missing), RAM_Total:ram, Work_Open:open, Ready_To_Issue:Math.max(0,out-issued) };
  });
}
function stylePlanDrillRows(row, planRows=[], ledger=[]){
  if (!row) return [];
  const key = styleKeyOf(row);
  const base = (planRows||[]).filter(p=>p.row_id===row.id || styleKeyOf(p)===key || planStyleText(p).toUpperCase()===String(row.style_no||"").toUpperCase()).sort((a,b)=>String(a.plan_date).localeCompare(String(b.plan_date)) || String(a.dept).localeCompare(String(b.dept)) || String(a.line).localeCompare(String(b.line)) || planSlotNo(a)-planSlotNo(b)).map(p=>{
    const need = planNeedBreakdown(p, [row], planRows, p.dept || "stitching", p.line || "", p.plan_date, ledger);
    const ach = achievedForPlan(p, [row], ledger);
    return { Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Slot:planSlotNo(p), Style:planStyleText(p), Plan_Qty:planRowEffectiveQty(p), Load_Ready:planLoadReadyShort(p, [row], planRows, p.dept || "stitching", p.line || "", p.plan_date, ledger), Achieved_Qty:ach, Balance:Math.max(0, planRowEffectiveQty(p)-ach), Actual_Ready_Feed:need.actualReadyFeed, Projected_Upstream_Feed:need.projectedFeed, Available_For_This_Slot:need.availableForThisSlot, After_This_Slot:need.afterThisSlot, Feed_Status:need.status, Hours:planHours(p), OPS:n(p.ops), Finish_Date:p.stitching_end_date||"", Short_Close:p.short_close?"Yes":"No", Remarks:p.remarks||"" };
  });
  // Cumulative plan vs actual through each date (same date's slots share one cumulative snapshot).
  const dateTotals = {};
  base.forEach(r=>{
    if (!dateTotals[r.Date]) dateTotals[r.Date] = { plan:0, ach:0 };
    dateTotals[r.Date].plan += n(r.Plan_Qty);
    dateTotals[r.Date].ach += n(r.Achieved_Qty);
  });
  const cumByDate = {};
  let cumPlan = 0, cumAch = 0;
  Object.keys(dateTotals).sort().forEach(d=>{
    cumPlan += dateTotals[d].plan;
    cumAch += dateTotals[d].ach;
    cumByDate[d] = { cumPlan, cumAch };
  });
  return base.map(r=>({ ...r, Cum_Plan_Qty:cumByDate[r.Date].cumPlan, Cum_Achieved_Qty:cumByDate[r.Date].cumAch, Cum_Balance:Math.max(0, cumByDate[r.Date].cumPlan - cumByDate[r.Date].cumAch) }));
}

function planActionToneClass(tone){ return tone === "late" ? "late" : tone === "warn" ? "warn" : "ok"; }
function planActionRowsForWeek(weekPlans, rows, planRows, ledger, activeDept, weekDays){
  return (weekPlans||[]).map(p=>{
    const day = String(p.plan_date||"").slice(0,10);
    const line = p.line || "Dept total";
    const need = planNeedBreakdown(p, rows, planRows, activeDept, line, day, ledger);
    const achieved = achievedForPlan(p, rows, ledger);
    const planQty = n(p.planned_qty);
    const balance = Math.max(0, planQty - achieved);
    const load = planLoadReadyInfo(p, rows, planRows, activeDept, line, day, ledger);
    const slotLoadShort = n(load?.short || 0);
    const slotActuallyReady = load && !slotLoadShort && !load.depends;
    const slotPlanReady = load && !slotLoadShort && load.depends;
    const balanceReview = !!load?.balanceWarning;
    let tone = slotLoadShort > 0 ? "late" : slotPlanReady ? "warn" : "ok";
    let status = slotLoadShort > 0
      ? `Feed short ${fmt(slotLoadShort)}`
      : balanceReview
        ? `Load ready · balance review ${fmt(load.balanceShort || 0)}`
        : slotPlanReady
          ? "Depends on upstream plan"
          : "Load ready";
    let action = slotLoadShort > 0
      ? "This exact slot qty is not covered by actual/projected feed. Adjust qty, wait feed, or manager override."
      : balanceReview
        ? "This slot can load, but cumulative balance needs review in detail; do not show as red shortage."
        : slotPlanReady
          ? "Can run if upstream plan is achieved before loading; confirm previous department plan."
          : "Can run if line/operator plan is okay.";
    if (day <= today() && achieved <= 0 && planQty > 0) { tone = "warn"; status = "DPR pending"; action = "Enter actual output or mark no production reason."; }
    if (day < today() && balance > 0 && achieved > 0) { tone = "warn"; status = `Balance ${fmt(balance)}`; action = "Review if balance will be covered, cascaded, or short closed."; }
    if (achieved >= planQty && planQty > 0) { tone = "ok"; status = "Achieved"; action = "No plan action unless extra output affects future balance."; }
    return {
      Date:day,
      Day:shortDayLabel(day),
      Line:line,
      Style:planStyleText(p) || "—",
      Buyer:p.buyer || need.linked?.buyer || "",
      Plan_Qty:planQty,
      Done:achieved,
      Balance:balance,
      Load:load.label,
      Status:status,
      Reading: need.over ? `Need ${fmt(planQty)} but available for this slot is ${fmt(need.availableForThisSlot)}.` : need.depends ? `Needs ${fmt(planQty)}; ${fmt(Math.max(0, planQty - Math.max(0, need.actualReadyFeed - need.consumedBeforeSlot)))} pcs depend on upstream plan.` : `Need ${fmt(planQty)} is covered by ready feed.`,
      Next_Action:action,
      tone
    };
  }).filter(r=>n(r.Plan_Qty) || r.Style !== "—");
}
function planSummaryCounts(actionRows){
  return (actionRows||[]).reduce((a,r)=>{
    if (r.Status === "Achieved") a.achieved += 1;
    else if (String(r.Status).includes("DPR")) a.dpr += 1;
    else if (String(r.Status).includes("Depends")) a.depends += 1;
    else if (String(r.Status).includes("Short")) a.short += 1;
    else a.ready += 1;
    return a;
  }, { achieved:0, dpr:0, depends:0, short:0, ready:0 });
}

function StylePlanDrilldown({ rows, planRows, ledger, selectedText, setSelectedText }){
  const linked = resolvePlanStyle(rows, selectedText) || rows.find(r=>String(r.style_no||"").toUpperCase()===String(selectedText||"").toUpperCase());
  const options = uniqueList([...(rows||[]).map(r=>r.style_no).filter(Boolean), ...(planRows||[]).map(planStyleText).filter(Boolean)]).slice(0,500);
  const planDrill = linked ? stylePlanDrillRows(linked, planRows, ledger) : [];
  const actualBreakup = linked ? styleActualBreakupRows(linked) : [];
  const stylePlans = linked ? (planRows||[]).filter(p=>p.row_id===linked.id || styleKeyOf(p)===styleKeyOf(linked) || planStyleText(p).toUpperCase()===String(linked.style_no||"").toUpperCase()).sort((a,b)=>String(a.plan_date).localeCompare(String(b.plan_date)) || planSlotNo(a)-planSlotNo(b)) : [];
  const planActionRows = linked ? planActionRowsForWeek(stylePlans, rows, planRows, ledger, stylePlans[0]?.dept || "stitching", stylePlans.map(p=>String(p.plan_date||"").slice(0,10))) : [];
  const planned = planDrill.reduce((a,r)=>a+n(r.Plan_Qty),0);
  const achieved = planDrill.reduce((a,r)=>a+n(r.Achieved_Qty),0);
  const openOrder = linked ? Math.max(0, n(linked.order_qty)-actualBreakup.reduce((a,r)=>Math.max(a,n(r.Good_Output)),0)) : 0;
  const todayIso = today();
  const cumThroughToday = planDrill.filter(r=>String(r.Date||"").slice(0,10) <= todayIso).slice(-1)[0];
  return <div className="mt-card" style={{marginTop:12}}>
    <div className="mt-section"><div className="mt-style-drill-head"><div><h3 className="mt-panel-title">Style Plan / Actual Breakup</h3><div className="mt-panel-sub">Select one style to see how it is planned, achieved, WIP-fed, projected from upstream plan, and balanced department-wise.</div></div><div className="mt-toolbar no-print"><span className="mt-toolbar-label">Style</span><input className="mt-input" list="planning-style-drill-list" value={selectedText || ""} onChange={e=>setSelectedText(e.target.value)} placeholder="Select / type style" style={{minWidth:250}}/><datalist id="planning-style-drill-list">{options.map(x=><option key={x} value={x}/>)}</datalist></div></div></div>
    {!linked ? <div className="mt-section"><span className="mt-chip mt-warn">Select a linked style to see plan and actual breakup.</span></div> : <>
      <div className="mt-section"><div className="mt-style-drill-kpis"><div className="mt-style-drill-kpi"><div className="label">Order Qty</div><div className="value">{fmt(linked.order_qty)}</div></div><div className="mt-style-drill-kpi"><div className="label">Planned</div><div className="value">{fmt(planned)}</div></div><div className="mt-style-drill-kpi"><div className="label">Achieved Against Plan</div><div className="value">{fmt(achieved)}</div></div><div className="mt-style-drill-kpi"><div className="label">Plan Balance</div><div className="value">{fmt(Math.max(0,planned-achieved))}</div></div><div className="mt-style-drill-kpi"><div className="label">Order Open Snapshot</div><div className="value">{fmt(openOrder)}</div></div></div><span className="mt-chip mt-info">{linked.order_no}</span> <span className="mt-chip mt-muted">{linked.buyer}</span> <span className="mt-chip mt-muted">{linked.colour}</span> <span className="mt-chip mt-muted">{linked.component}</span></div>
      {cumThroughToday && <div className="mt-section"><div className="mt-speed-note"><b>Cumulative through {cumThroughToday.Date}:</b> Plan {fmt(cumThroughToday.Cum_Plan_Qty)} · Actual {fmt(cumThroughToday.Cum_Achieved_Qty)} · {cumThroughToday.Cum_Balance>0 ? <span style={{color:"var(--fg-late)",fontWeight:800}}>Behind by {fmt(cumThroughToday.Cum_Balance)}</span> : <span style={{color:"var(--fg-ok)",fontWeight:800}}>On/ahead of cumulative plan</span>}. Full day-by-day cumulative trail is in the detail table below.</div></div>}
      <div className="mt-section"><div className="mt-plan-reading-strip"><span className="mt-plan-reading-pill">Planned {fmt(planned)}</span><span className="mt-plan-reading-pill">Done {fmt(achieved)}</span><span className="mt-plan-reading-pill">Balance {fmt(Math.max(0,planned-achieved))}</span><span className="mt-plan-reading-pill">Open order snapshot {fmt(openOrder)}</span></div><div className="mt-plan-action-grid">{planActionRows.slice(0,8).map((r,i)=><div key={`${r.Date}-${r.Line}-${r.Style}-${i}`} className={`mt-plan-action-card ${planActionToneClass(r.tone)}`}><div className="mt-plan-action-top"><span>{r.Day} · {r.Line}</span><span>{r.Status}</span></div><div className="mt-plan-action-style">{r.Style}</div><div className="mt-plan-action-reading">Plan {fmt(r.Plan_Qty)} · Done {fmt(r.Done)} · Bal {fmt(r.Balance)} · Load {r.Load}</div><div className="mt-plan-action-next">{r.Next_Action}</div></div>)}</div>{!planActionRows.length && <span className="mt-chip mt-muted">No plan slots found for this style.</span>}</div>
      <div className="mt-section"><details className="mt-plan-collapse" open><summary><span>Open detailed style plan table — with running cumulative</span><span className="mt-chip mt-muted">{fmt(planDrill.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Style plan slots" sub="Cum. Plan / Cum. Actual show the running total through that date, so you can see if the style is ahead or behind cumulatively — not just day-by-day." rows={planDrill} empty="No plan rows found for this style." /></div></details></div>
      <div className="mt-section"><details className="mt-plan-collapse"><summary><span>Open department actual / WIP breakup</span><span className="mt-chip mt-muted">expand</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Department actual / WIP breakup" sub="Actual production snapshot by department: feed, good output, issued forward, R/A/M and open work." rows={actualBreakup} empty="No actual breakup available." /></div></details></div>
    </>}
  </div>;
}
function SimplePlanReadingView({ rows, planRows, ledger, activeDept, weekDays, mode="summary" }){
  const lines = activeDept === "stitching" ? productionLineNames() : [`${stageLabel(activeDept)} Total`];
  const weekPlans = (planRows||[]).filter(p=>String(p.dept)===String(activeDept) && weekDays.includes(String(p.plan_date||"").slice(0,10)));
  const pvaRows = planVsAchievedRows(weekPlans, rows, ledger);
  const actionRows = planActionRowsForWeek(weekPlans, rows, planRows, ledger, activeDept, weekDays);
  const counts = planSummaryCounts(actionRows);
  const topActions = actionRows.filter(r=>r.tone!=="ok" || r.Status!=="Achieved").slice(0,8);
  const totals = weekPlans.reduce((acc,p)=>{
    const plan = n(p.planned_qty);
    const achieved = achievedForPlan(p, rows, ledger);
    acc.plan += plan; acc.achieved += achieved; acc.balance += Math.max(0, plan-achieved); acc.excess += Math.max(0, achieved-plan); acc.hours += planHours(p); acc.ops += n(p.ops);
    return acc;
  }, { plan:0, achieved:0, balance:0, excess:0, hours:0, ops:0 });
  const todayIso = today();
  let __cumPlan = 0, __cumAch = 0;
  const dayRows = weekDays.map(day=>{
    const dayPlans = weekPlans.filter(p=>String(p.plan_date||"").slice(0,10)===day);
    const plan = dayPlans.reduce((a,p)=>a+n(p.planned_qty),0);
    const achieved = dayPlans.reduce((a,p)=>a+achievedForPlan(p, rows, ledger),0);
    const styles = uniqueList(dayPlans.map(planStyleText).filter(Boolean));
    const crossed = day <= todayIso;
    __cumPlan += plan;
    if (crossed) __cumAch += achieved;
    return { Date:day, Day:shortDayLabel(day), Styles:styles.join(", "), Planned_Qty:plan, Achieved_Qty:achieved, Balance:Math.max(0,plan-achieved), Achievement:plan ? `${Math.round(achieved*1000/plan)/10}%` : "—", Cum_Plan_Qty:__cumPlan, Cum_Achieved_Qty:crossed ? __cumAch : "not yet due", Cum_Balance:crossed ? Math.max(0,__cumPlan-__cumAch) : "—", Plan_Hours:dayPlans.reduce((a,p)=>a+planHours(p),0), OPS:Object.values(dayPlans.reduce((m,p)=>{ const k=String(p.line||"Dept total"); m[k]=Math.max(n(m[k]), n(p.ops)); return m; },{})).reduce((a,v)=>a+n(v),0) };
  });
  const lineRows = lines.map(line=>{
    const lp = weekPlans.filter(p=>String(p.line || planCellLineKey(activeDept,line))===String(planCellLineKey(activeDept,line)));
    const plan = lp.reduce((a,p)=>a+coverAdjustedPlanQty(p, planRows, rows, ledger),0);
    const achieved = lp.reduce((a,p)=>a+achievedForPlan(p, rows, ledger),0);
    return { Line:line, Styles:uniqueList(lp.map(planStyleText).filter(Boolean)).join(", "), Planned_Qty:plan, Achieved_Qty:achieved, Balance:Math.max(0,plan-achieved), Achievement:plan ? `${Math.round(achieved*1000/plan)/10}%` : "—", Plan_Hours:lp.reduce((a,p)=>a+planHours(p),0), OPS:lp.reduce((a,p)=>a+n(p.ops),0) };
  }).filter(r=>n(r.Planned_Qty) || n(r.Achieved_Qty) || r.Styles);
  if (mode === "achieved") {
    return <div>
      <div className="mt-plan-simple-kpis"><div className="mt-plan-simple-kpi"><div className="label">Week planned</div><div className="value">{fmt(totals.plan)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Achieved</div><div className="value">{fmt(totals.achieved)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Balance</div><div className="value">{fmt(totals.balance)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Needs attention</div><div className="value">{fmt(counts.dpr + counts.depends + counts.short)}</div></div></div>
      <div className="mt-plan-reading-strip"><span className="mt-plan-reading-pill">Ready {fmt(counts.ready)}</span><span className="mt-plan-reading-pill">DPR pending {fmt(counts.dpr)}</span><span className="mt-plan-reading-pill">Depends upstream {fmt(counts.depends)}</span><span className="mt-plan-reading-pill">Short/feed issue {fmt(counts.short)}</span><span className="mt-plan-reading-pill">Achieved {fmt(counts.achieved)}</span></div>
      <div className="mt-plan-action-grid">{(topActions.length?topActions:actionRows.slice(0,6)).map((r,i)=><div key={`${r.Date}-${r.Line}-${r.Style}-${i}`} className={`mt-plan-action-card ${planActionToneClass(r.tone)}`}><div className="mt-plan-action-top"><span>{r.Day} · {r.Line}</span><span>{r.Status}</span></div><div className="mt-plan-action-style">{r.Style}</div><div className="mt-plan-action-reading">Plan {fmt(r.Plan_Qty)} · Done {fmt(r.Done)} · Bal {fmt(r.Balance)} · Load {r.Load}</div><div className="mt-plan-action-next">{r.Next_Action}</div></div>)}</div>
      <details className="mt-plan-collapse mt-plan-mini-table-toggle"><summary><span>Open detailed achieved table</span><span className="mt-chip mt-muted">{fmt(pvaRows.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title={`${stageLabel(activeDept)} weekly achieved summary`} sub="Detailed style-level plan vs actual table; the action cards above are the daily manager reading." rows={pvaRows} empty="No plan rows for this week yet." /></div></details>
    </div>;
  }
  return <div>
    <div className="mt-plan-simple-kpis"><div className="mt-plan-simple-kpi"><div className="label">Planned qty</div><div className="value">{fmt(totals.plan)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Achieved qty</div><div className="value">{fmt(totals.achieved)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Needs attention</div><div className="value">{fmt(counts.dpr + counts.depends + counts.short)}</div></div><div className="mt-plan-simple-kpi"><div className="label">Ready / OK</div><div className="value">{fmt(counts.ready + counts.achieved)}</div></div></div>
    <div className="mt-plan-reading-strip"><span className="mt-plan-reading-pill">DPR pending {fmt(counts.dpr)}</span><span className="mt-plan-reading-pill">Depends upstream {fmt(counts.depends)}</span><span className="mt-plan-reading-pill">Short/feed issue {fmt(counts.short)}</span><span className="mt-plan-reading-pill">Plan hours {fmt(totals.hours)}</span><span className="mt-plan-reading-pill">OPS {fmt(totals.ops)}</span></div>
    <div className="mt-plan-action-grid">{(topActions.length?topActions:actionRows.slice(0,6)).map((r,i)=><div key={`${r.Date}-${r.Line}-${r.Style}-${i}`} className={`mt-plan-action-card ${planActionToneClass(r.tone)}`}><div className="mt-plan-action-top"><span>{r.Day} · {r.Line}</span><span>{r.Status}</span></div><div className="mt-plan-action-style">{r.Style}</div><div className="mt-plan-action-reading">Plan {fmt(r.Plan_Qty)} · Done {fmt(r.Done)} · Bal {fmt(r.Balance)} · Load {r.Load}</div><div className="mt-plan-action-next">{r.Next_Action}</div></div>)}</div>
    <div className="mt-plan-simple-grid">{lines.map(line=>{
      const lp = weekPlans.filter(p=>String(p.line || planCellLineKey(activeDept,line))===String(planCellLineKey(activeDept,line)));
      const linePlan = lp.reduce((a,p)=>a+coverAdjustedPlanQty(p, planRows, rows, ledger),0);
      const lineAch = lp.reduce((a,p)=>a+achievedForPlan(p, rows, ledger),0);
      return <div key={line} className="mt-plan-simple-card"><div className="mt-plan-simple-head"><div className="mt-plan-simple-title">{line}</div><div className="mt-plan-simple-meta"><span className="mt-chip mt-info">Plan {fmt(linePlan)}</span><span className={`mt-chip ${lineAch>=linePlan && linePlan ? "mt-ok" : lineAch ? "mt-warn" : "mt-muted"}`}>Done {fmt(lineAch)}</span></div></div><div className="mt-plan-simple-body">{weekDays.map(day=>{
        const daySlots = lp.filter(p=>String(p.plan_date||"").slice(0,10)===day);
        const dPlan = daySlots.reduce((a,p)=>a+coverAdjustedPlanQty(p, planRows, rows, ledger),0);
        const dAch = daySlots.reduce((a,p)=>a+achievedForPlan(p, rows, ledger),0);
        return <div key={`${line}-${day}`} className="mt-plan-simple-slot"><div className="mt-plan-simple-meta"><b>{shortDayLabel(day)}</b><span>Plan {fmt(dPlan)}</span><span>Done {fmt(dAch)}</span><span>Bal {fmt(Math.max(0,dPlan-dAch))}</span></div>{daySlots.length ? daySlots.map(p=><div key={p.id || `${day}-${planSlotNo(p)}`}><div className="mt-plan-simple-style">{planStyleText(p) || "—"}</div><div className="mt-plan-simple-meta"><span>{p.buyer || ""}</span><span>Qty {fmt(coverAdjustedPlanQty(p, planRows, rows, ledger))}</span><span>{fmt(planHours(p))}h</span><span>OPS {fmt(p.ops)}</span><span>Load {planLoadReadyShort(p, rows, planRows, activeDept, line, day, ledger)}</span>{p.short_close ? <span className="mt-chip mt-purple">Short close</span> : null}</div></div>) : <div className="mt-plan-simple-empty">No style planned</div>}</div>;
      })}</div></div>;
    })}</div>
    <details className="mt-plan-collapse mt-plan-mini-table-toggle"><summary><span>Open day / line detail tables</span><span className="mt-chip mt-muted">optional</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Day-wise planned vs achieved" sub="Detailed day table. Main usable reading is the action cards above." rows={dayRows} empty="No plan rows for this week." /><div style={{height:12}}/><SimpleTable title="Line-wise planned vs achieved" sub="Detailed line table for export/review." rows={lineRows} empty="No line plan rows for this week." /></div></details>
  </div>;
}



function isManagerExceptionBucket(row, bucket){
  if (!bucket) return false;
  if (["reconcile","dispatch_hold","ram"].includes(bucket.type)) return true;
  if (bucket.type === "tail_balance") return true;
  if (bucket.type === "received_not_processed") return n(bucket.idle) >= 7;
  if (bucket.type === "cutting_pending") return n(bucket.idle) >= 3 && n(bucket.qty) <= Math.max(50, n(row.order_qty) * 0.08);
  if (bucket.type === "extra_cut") return n(bucket.qty) > (n(row.order_qty) * cuttingToleranceFrac());
  return false;
}
function managerTaskLabel(bucket){
  if (!bucket) return "Follow-up";
  if (bucket.type === "tail_balance") return "Tail closure review";
  if (bucket.type === "received_not_processed") return "Late production activity";
  if (bucket.type === "reconcile") return "Feed discrepancy / reconcile";
  if (bucket.type === "ram") return "R/A/M abnormal";
  if (bucket.type === "dispatch_hold") return "Dispatch hold";
  if (bucket.type === "cutting_pending") return "Tail cutting balance";
  if (bucket.type === "extra_cut") return "Extra cut over tolerance";
  return bucket.status || bucket.type;
}
function managerWipTaskRows(rows){
  return (rows||[]).flatMap(row=> issueBuckets(row).filter(b=>isManagerExceptionBucket(row,b)).map(b=>({
    Dept:stageLabel(b.stage), Stage:b.stage, Task:managerTaskLabel(b), Status:b.status, Style:row.style_no, Order:row.order_no, Buyer:row.buyer, Colour:row.colour, Component:row.component,
    Qty:n(b.qty), Idle_Days:n(b.idle), Owner:b.owner || stageOwner(b.stage), Action:b.action, Support:b.support, Tone:b.tone || "info"
  }))).sort((a,b)=>{
    const pri=x=> x.Task.includes("Feed discrepancy") ? 6 : x.Task.includes("Tail closure") ? 5 : x.Task.includes("R/A/M") ? 4 : x.Task.includes("Late") ? 3 : 1;
    return pri(b)-pri(a) || n(b.Idle_Days)-n(a.Idle_Days) || n(b.Qty)-n(a.Qty);
  });
}
function managerWipInfoRows(rows){
  return (rows||[]).flatMap(row=> issueBuckets(row)
    .filter(b=>["completed_not_issued","received_not_processed"].includes(b.type) && !isManagerExceptionBucket(row,b))
    .map(b=>({ Dept:stageLabel(b.stage), Stage:b.stage, Info:b.type === "completed_not_issued" ? "Ready / pending issue — WIP aging info" : "Normal WIP aging", Style:row.style_no, Order:row.order_no, Buyer:row.buyer, Qty:n(b.qty), Idle_Days:n(b.idle), Reading:b.status, Action:"Monitor only; not a manager task unless it blocks plan, crosses aging threshold, or shows discrepancy." })));
}
function managerDeptSummary(taskRows, infoRows=[]){
  return STAGES.map(st=>{
    const tasks = (taskRows||[]).filter(r=>r.Stage===st.key || r.Dept===st.label);
    const infos = (infoRows||[]).filter(r=>r.Stage===st.key || r.Dept===st.label);
    return { dept:st.key, Dept:st.label, tasks, infos, Styles:uniqueList(tasks.map(r=>r.Style)).length, Task_Qty:tasks.reduce((a,r)=>a+n(r.Qty),0), Action_Count:tasks.length, Info_Qty:infos.reduce((a,r)=>a+n(r.Qty),0), Info_Count:infos.length, Tail_Closure:tasks.filter(r=>String(r.Task).includes("Tail closure")).length, Feed_Discrepancy:tasks.filter(r=>String(r.Task).includes("Feed discrepancy")).length, Late_Activity:tasks.filter(r=>String(r.Task).includes("Late")).length };
  }).filter(x=>x.Action_Count || x.Info_Count || x.Task_Qty || x.Info_Qty);
}
function ManagerDeptCards({ taskRows, infoRows, query="" }){
  const q = String(query||"").trim().toLowerCase();
  const taskFiltered = (taskRows||[]).filter(r=>!q || Object.values(r).join(" ").toLowerCase().includes(q));
  const infoFiltered = (infoRows||[]).filter(r=>!q || Object.values(r).join(" ").toLowerCase().includes(q));
  const depts = managerDeptSummary(taskFiltered, infoFiltered);
  if (!depts.length) return <div className="mt-speed-note">No manager WIP exceptions. Normal pending issue stays as WIP aging info, not highlighted.</div>;
  return <div className="mt-manager-dept-grid">{depts.map(d=><details key={d.Dept} className="mt-manager-dept-card" open={d.Action_Count>0}><summary><div><div className="mt-manager-dept-title">{d.Dept}</div><div className="mt-manager-dept-sub">{d.Action_Count ? `${fmt(d.Action_Count)} action item${d.Action_Count===1?"":"s"} · ${fmt(d.Task_Qty)} pcs` : "No action item"} {d.Info_Count ? ` · ${fmt(d.Info_Qty)} pcs WIP aging info` : ""}</div></div><div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><span className={`mt-chip ${d.Action_Count?"mt-late":"mt-ok"}`}>{d.Action_Count ? "Action" : "OK"}</span>{d.Tail_Closure ? <span className="mt-chip mt-warn">Tail closure {fmt(d.Tail_Closure)}</span> : null}{d.Feed_Discrepancy ? <span className="mt-chip mt-late">Feed discrepancy {fmt(d.Feed_Discrepancy)}</span> : null}{d.Late_Activity ? <span className="mt-chip mt-warn">Late {fmt(d.Late_Activity)}</span> : null}</div></summary>
    {d.tasks.length ? d.tasks.map((r,idx)=><div key={`${r.Style}-${r.Task}-${idx}`} className="mt-manager-task-row"><div><b>{r.Style}</b><div className="mt-small">{r.Order} · {r.Buyer} · {r.Colour} {r.Component}</div></div><div><span className={`mt-chip ${statusClass(r.Tone)}`}>{r.Task}</span></div><div>Qty<br/><b>{fmt(r.Qty)}</b></div><div>Idle<br/><b>{fmt(r.Idle_Days)}d</b></div><div>Owner<br/><b>{r.Owner}</b></div><div>{r.Action}<div className="mt-small">{r.Support}</div></div></div>) : <div className="mt-manager-info-note">No exception tasks in {d.Dept}. Normal pending issue / ready-to-move quantities are WIP aging information only.</div>}
    {d.infos.length ? <details className="mt-plan-collapse" style={{margin:"10px 12px 12px"}}><summary><span>Open WIP aging info — not highlighted</span><span className="mt-chip mt-muted">{fmt(d.infos.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title={`${d.Dept} WIP aging info`} sub="Pending issue / normal WIP movement. This is monitor-only unless it crosses aging/risk thresholds." rows={d.infos} empty="No info rows." /></div></details> : null}
  </details>)}</div>;
}

const RESIDUAL_ACTIONS = [
  { key:"apply_cascade", label:"Apply cascade for the balance" },
  { key:"short_close", label:"Short close the balance" },
  { key:"no_change", label:"No plan change — line absorbs balance" },
  { key:"manual_edit", label:"Manual board edit for the balance" },
];
function residualActionLabel(key){ return RESIDUAL_ACTIONS.find(x=>x.key===key)?.label || ""; }
function ManagerDecisionPanel({ draft, onClose, onSave }){
  const [form,setForm] = useState(()=>({ cover_qty:n(draft?.impact?.Short_Qty || 0), cover_date:nextProductionMonday(today()), line:draft?.impact?.Line || "", reason:"", create_plan_slot:true, residual_action:"" }));
  if (!draft) return null;
  const impact = draft.impact || {};
  const decision = draft.decision;
  const title = decision === "part_cover" ? "Cover commitment" : decision === "short_close" ? "Short close approval" : decision === "apply_cascade" ? "Cascade instruction" : decision === "no_change" ? "No plan change" : "Manual plan note";
  const short = n(impact.Short_Qty);
  const set = (k,v)=>setForm(f=>({ ...f, [k]:v }));
  const notePlaceholder = decision === "part_cover" ? "Line agreed to recover by extra output before due date" : decision === "short_close" ? "Management approved short close" : decision === "apply_cascade" ? "Push remaining variance into future plan after review" : decision === "no_change" ? "Variance accepted / line will manage inside existing plan" : "Manager will edit weekly board manually";
  const coverQtyClamped = Math.min(n(form.cover_qty), short || n(form.cover_qty));
  const residual = decision === "part_cover" ? Math.max(0, short - coverQtyClamped) : 0;
  const needsResidualAction = residual > 0 && !form.residual_action;
  const reasonMissing = !String(form.reason||"").trim();
  const dateMissing = decision === "part_cover" && !String(form.cover_date||"").trim();
  const qtyMissing = decision === "part_cover" && !coverQtyClamped;
  const saveDisabled = reasonMissing || dateMissing || qtyMissing || needsResidualAction;
  return <div className="mt-update-backdrop no-print"><div className="mt-manager-decision-modal"><div className="head"><div><b>{title}</b><div className="mt-small">{impact.Style} · {impact.Date} · {impact.Dept} · {impact.Line}</div></div><button className="mt-btn ghost" onClick={onClose}>Close</button></div><div className="body">
    <div className="mt-manager-decision-kpis"><div><span>Plan</span><b>{fmt(impact.Planned)}</b></div><div><span>Actual</span><b>{fmt(impact.Actual)}</b></div><div><span>Short</span><b>{fmt(impact.Short_Qty)}</b></div><div><span>Future plan</span><b>{fmt(impact.Future_Qty)}</b></div></div>
    {decision === "part_cover" ? <>
      <div className="mt-speed-note"><b>Floating recovery bucket:</b> this is <u>cover by date</u>, not fixed to one day. Extra production of the same style before/on the due date automatically reduces the open cover balance.</div>
      <div className="mt-editor-grid"><label><span className="mt-toolbar-label">Cover qty</span><input className="mt-input" type="number" value={form.cover_qty} onChange={e=>set("cover_qty", e.target.value)} /></label><label><span className="mt-toolbar-label">Cover by</span><input className="mt-input" type="date" value={form.cover_date} onChange={e=>set("cover_date", e.target.value)} /></label><label><span className="mt-toolbar-label">Recovery line</span><input className="mt-input" value={form.line} onChange={e=>set("line", e.target.value)} /></label></div>
      <label className="mt-check-row"><input type="checkbox" checked={!!form.create_plan_slot} onChange={e=>set("create_plan_slot", e.target.checked)} /> Show/update recovery target in weekly plan on the due date</label>
      {residual > 0 ? <div className="mt-locked-note" style={{marginTop:8}}>
        <div style={{marginBottom:6}}><b>{fmt(residual)} pcs of this short will NOT be covered</b> by the qty above. This balance cannot be left silent — pick what happens to it before saving.</div>
        <select className="mt-select" style={{width:"100%"}} value={form.residual_action} onChange={e=>set("residual_action", e.target.value)}>
          <option value="">Choose next action for the {fmt(residual)} balance…</option>
          {RESIDUAL_ACTIONS.map(a=><option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
      </div> : <div className="mt-small" style={{marginTop:8}}>Cover qty fully matches the short — no balance left over.</div>}
    </> : null}
    <label><span className="mt-toolbar-label">Reason / manager note</span><textarea className="mt-input" rows={3} value={form.reason} placeholder={notePlaceholder} onChange={e=>set("reason", e.target.value)} /></label>
    {saveDisabled ? <div className="mt-small" style={{color:"var(--fg-late)", fontWeight:800}}>
      {reasonMissing ? "Reason is required. " : ""}{dateMissing ? "Cover-by date is required. " : ""}{qtyMissing ? "Cover qty is required. " : ""}{needsResidualAction ? "Pick a next action for the balance above. " : ""}
    </div> : null}
    <div className="actions"><button className="mt-btn ghost" onClick={onClose}>Cancel</button><button className="mt-btn primary" disabled={saveDisabled} onClick={()=>onSave({ ...form, cover_qty:coverQtyClamped, reason:String(form.reason || "").trim() })}>Save manager decision</button></div>
  </div></div></div>;
}

function ManagerActionCenter({ rows, planRows, setPlanRows, ledger, onPlanUpsert }){
  const [section,setSection] = useState("impact");
  const [q,setQ] = useState("");
  const [decisionDraft,setDecisionDraft] = useState(null);
  const canApprove = currentUserCan("production.manage_users") || isFullAccessRole(currentUserRole());
  const weekDays = planningSixDays(lineBoardWeekStart(today()));
  const impactRows = planImpactReviewRows(planRows, rows, ledger);
  const dprPendingRows = impactRows.filter(r=>n(r.Planned)>0 && n(r.Actual)===0 && String(r.Date||"").slice(0,10)<=today());
  const repeatedRows = repeatedStyleDelayRows(planRows, rows, ledger);
  const coverRows = coverCommitmentRows(planRows, rows, ledger);
  const feedRows = STAGES.flatMap(st=>projectedFeedRows(planRows, rows, st.key, weekDays)).filter(r=>!/Actual ready \/ OK/i.test(String(r.Feed_Status || "")));
  const wipTaskRows = managerWipTaskRows(rows);
  const wipInfoRows = managerWipInfoRows(rows);
  const allRows = section === "impact" ? impactRows : section === "cover" ? coverRows : section === "repeated" ? repeatedRows : section === "dpr" ? dprPendingRows : section === "feed" ? feedRows : section === "wip" ? wipTaskRows : section === "aging" ? wipInfoRows : [];
  const filtered = allRows.filter(r=>!q.trim() || Object.values(r).join(" ").toLowerCase().includes(q.trim().toLowerCase()));
  function openDecision(impact, decision){ if (!canApprove) return; setDecisionDraft({ impact, decision }); }
  function saveDecision(form){
    const draft = decisionDraft;
    if (!draft) return;
    const impact = draft.impact || {};
    const decision = draft.decision;
    const plan = (planRows||[]).find(p=>String(p.id)===String(impact.Plan_ID));
    if (!plan) return setDecisionDraft(null);
    const now = new Date().toISOString();
    let patch = { manager_review_status:"reviewed", manager_decision:decision, manager_reviewed_by:currentUserName(), manager_reviewed_at:now, manager_reviewed_actual_qty:n(impact.Actual), cover_reason:form.reason || "" };
    let extraRows = [];
    if (decision === "part_cover") {
      const coverQty = Math.min(n(form.cover_qty), n(impact.Short_Qty) || n(form.cover_qty));
      const residual = Math.max(0, n(impact.Short_Qty) - coverQty);
      if (!coverQty || !String(form.cover_date||"").trim() || !String(form.reason||"").trim()) return;
      if (residual > 0 && !String(form.residual_action||"").trim()) return; // balance cannot be left silent
      const residualNote = residual > 0 ? `BALANCE ${fmt(residual)} pcs: ${residualActionLabel(form.residual_action)}.` : "";
      patch = { ...patch, cover_qty:coverQty, cover_commitment_qty:coverQty, cover_date:form.cover_date, cover_due_date:form.cover_date, cover_status:"Open cover commitment", cover_recovered_qty:0, cover_remaining_qty:coverQty, cover_residual_qty:residual, cover_residual_action:form.residual_action || "", status:residual>0 ? `Manager reviewed - cover ${fmt(coverQty)} by ${form.cover_date}; balance ${fmt(residual)}: ${residualActionLabel(form.residual_action)}` : `Manager reviewed - cover by ${form.cover_date} (${fmt(coverQty)})`, remarks:[plan.remarks, `COVER COMMITMENT: ${fmt(coverQty)} by ${form.cover_date}. ${form.reason}`, residualNote].filter(Boolean).join(" | ") };
      if (form.create_plan_slot) {
        const line = String(form.line || impact.Line || plan.line || "Dept total");
        const existingSameDay = (planRows||[]).filter(p=>String(p.dept)===String(plan.dept) && String(p.line||"")===line && String(p.plan_date||"").slice(0,10)===String(form.cover_date).slice(0,10));
        const slotNo = Math.max(1, ...existingSameDay.map(planSlotNo)) + 1;
        const recovery = normalizePlanRowForState({ ...plan, id:stablePlanId(plan.dept, line, form.cover_date, slotNo), plan_date:form.cover_date, line, slot_no:slotNo, planned_qty:coverQty, ops:0, qty_auto_mode:false, remaining_hours:0, changeover:false, source:"manager_cover_commitment", source_label:"Manager cover commitment", source_type:"Recovery target / non-capacity", status:`Cover target open - ${fmt(coverQty)} by ${form.cover_date}`, remarks:`RECOVERY TARGET for ${planStyleText(plan)}: ${fmt(coverQty)} by ${form.cover_date}. ${form.reason}`, cover_recovery_slot:true, cover_source_plan_id:plan.id, cover_due_date:form.cover_date, cover_commitment_qty:coverQty, cover_remaining_qty:coverQty, cover_status:"Open cover commitment", cover_reason:form.reason, manager_review_status:"reviewed", manager_decision:"cover_recovery_slot", manager_reviewed_by:currentUserName(), manager_reviewed_at:now });
        extraRows.push(recovery);
      }
    } else if (decision === "short_close") {
      if (!String(form.reason||"").trim()) return;
      patch = { ...patch, short_close:true, status:"Manager short close approved", remarks:[plan.remarks, `SHORT CLOSE APPROVED: ${form.reason}`].filter(Boolean).join(" | ") };
    } else if (decision === "no_change") {
      if (!String(form.reason||"").trim()) return;
      patch = { ...patch, status:"Manager reviewed - no plan change", remarks:[plan.remarks, `NO PLAN CHANGE: ${form.reason}`].filter(Boolean).join(" | ") };
    } else if (decision === "apply_cascade") {
      if (!String(form.reason||"").trim()) return;
      patch = { ...patch, status:"Manager reviewed - cascade required", remarks:[plan.remarks, `CASCADE REQUIRED: ${form.reason}`].filter(Boolean).join(" | ") };
    } else if (decision === "manual_edit") {
      if (!String(form.reason||"").trim()) return;
      patch = { ...patch, status:"Manager reviewed - manual board edit", remarks:[plan.remarks, `MANUAL PLAN EDIT: ${form.reason}`].filter(Boolean).join(" | ") };
    }
    const updated = normalizePlanRowForState({ ...plan, ...patch, updated_at:now });
    const upserts = [updated, ...extraRows];
    setPlanRows(prev=>{
      const map = new Map((prev||[]).map(p=>[String(p.id),p]));
      upserts.forEach(r=>map.set(String(r.id), r));
      return Array.from(map.values());
    });
    upserts.forEach(r=>onPlanUpsert?.(r, { dept:r.dept, line:r.line, day:r.plan_date, slot_no:planSlotNo(r), manager_decision:decision }));
    recordProductionAudit("manager_plan_impact_decision", { table_name:"production_plan_rows", order_no:updated.order_no, style_no:updated.style_no || updated.style_input, stage:updated.dept, entry_date:updated.plan_date, qty:updated.planned_qty, source:"Manager Action Center", after_data:{ decision, ...patch, recovery_slots:extraRows.length } });
    setDecisionDraft(null);
  }
  function exportManager(){ exportXlsx(`production_manager_action_center_${today()}.xlsx`, [{ name:"Plan Impact", rows:impactRows },{ name:"Cover Commitments", rows:coverRows },{ name:"Repeated Style Delay", rows:repeatedRows },{ name:"DPR Pending", rows:dprPendingRows },{ name:"Feed Risks", rows:feedRows },{ name:"WIP Action Tasks", rows:wipTaskRows },{ name:"WIP Aging Info", rows:wipInfoRows }]); }
  const cards = [["impact","Plan Impact",impactRows.length,"DPR vs plan variance requiring manager decision"],["cover","Cover Commitments",coverRows.length,"Recovery promises: open, achieved, failed"],["repeated","Repeated Delay",repeatedRows.length,"Styles missing plan repeatedly; reset target/line/feed plan"],["dpr","DPR Pending",dprPendingRows.length,"Planned rows where actual entry is still missing"],["feed","Feed Risk",feedRows.length,"Plans depending on upstream plan or over projected feed"],["wip","WIP Follow-up",wipTaskRows.length,"Exception tasks only: tail closure, feed discrepancy, late activity, R/A/M"],["aging","WIP Aging Info",wipInfoRows.length,"Normal pending issue / ready-to-move info, not an idle-day task"]];
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Manager Action Center</h3><div className="mt-panel-sub">Important data only. Manager decisions open in an in-app review panel; no browser prompt popups. Cover commitments update the weekly plan as recovery targets and auto-reduce from extra actual output before the due date.</div></div>
    <div className="mt-section no-print"><div className="mt-summary-strip">{cards.map(([k,l,v,note])=><button key={k} className={`mt-summary-tile ${section===k?"active":""}`} onClick={()=>setSection(k)}><div className="label">{l}</div><div className="value">{fmt(v)}</div><div className="mt-small">{note}</div></button>)}</div><div className="mt-toolbar"><input className="mt-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search style / line / owner / action"/><button className="mt-btn primary" onClick={exportManager}><Download size={14}/>Export Manager Pack</button><span className={`mt-chip ${canApprove?"mt-ok":"mt-warn"}`}>{canApprove ? "Manager actions enabled" : "Read-only for this role"}</span></div></div>
    <div className="mt-section">
      {section === "impact" ? <div className="mt-manager-impact-list">{filtered.length ? filtered.map((r,idx)=><div key={`${r.Plan_ID}-${idx}`} className={`mt-manager-card ${n(r.Short_Qty)>0?"late":n(r.Excess_Qty)>0?"warn":"ok"}`}><div className="mt-manager-card-head"><div><b>{r.Style}</b><div className="mt-small">{r.Date} · {r.Dept} · {r.Line} · Slot {r.Slot}</div></div><span className={`mt-chip ${n(r.Short_Qty)>0?"mt-late":n(r.Excess_Qty)>0?"mt-warn":"mt-ok"}`}>{r.Review_Status}</span></div><div className="mt-manager-metrics"><span>Plan <b>{fmt(r.Planned)}</b></span><span>Actual <b>{fmt(r.Actual)}</b></span><span>Short <b>{fmt(r.Short_Qty)}</b></span><span>Excess <b>{fmt(r.Excess_Qty)}</b></span><span>Future <b>{fmt(r.Future_Qty)}</b></span></div><div className="mt-small">{r.Suggested_Action}</div><div className="mt-manager-actions no-print"><button className="mt-btn" disabled={!canApprove} onClick={()=>openDecision(r,"apply_cascade")}>Apply cascade instruction</button><button className="mt-btn" disabled={!canApprove || !n(r.Short_Qty)} onClick={()=>openDecision(r,"part_cover")}>Cover commitment</button><button className="mt-btn" disabled={!canApprove || !n(r.Short_Qty)} onClick={()=>openDecision(r,"short_close")}>Short close</button><button className="mt-btn ghost" disabled={!canApprove} onClick={()=>openDecision(r,"no_change")}>No plan change</button><button className="mt-btn ghost" disabled={!canApprove} onClick={()=>openDecision(r,"manual_edit")}>Manual edit note</button></div></div>) : <div className="mt-speed-note">No pending manager plan impacts.</div>}</div> :
      section === "wip" ? <ManagerDeptCards taskRows={wipTaskRows} infoRows={wipInfoRows} query={q}/> :
      <SimpleTable title={cards.find(c=>c[0]===section)?.[1] || "Manager Detail"} sub={section === "cover" ? "Floating cover commitments. Extra production above base plan before/on due date reduces remaining cover automatically; recovery target slots appear in the weekly plan." : section === "aging" ? "Monitor-only WIP aging information. Pending issue / ready-to-move stock is not highlighted just because it is idle." : section === "repeated" ? "Pattern-based manager exception. A style appears here only when repeated plan misses/reviews show the style itself needs reset, line review, feed confirmation or cover/short-close decision." : "Action-first summary. Use export for meeting pack."} rows={filtered} empty="No rows for this section." />}
    </div>
    {decisionDraft && <ManagerDecisionPanel draft={decisionDraft} onClose={()=>setDecisionDraft(null)} onSave={saveDecision}/>}  
  </div>;
}

function PlanningView({ rows, planRows, setPlanRows, ledger, setRows, onPlanUpsert, onPlanDelete, planSaveState }){
  const [mode,setMode] = useState("stitching");
  const [dept,setDept] = useState("printing");
  const [weekStart,setWeekStart] = useState(()=>nextProductionMonday(today()));
  const [showTargets,setShowTargets] = useState(false);
  const [fitBoard,setFitBoard] = useState(false);
  const [planViewMode,setPlanViewMode] = useState(()=>safeJsonLoad(uiStorageKey("plan_view_mode"), "entry"));
  const [selectedStylePlan,setSelectedStylePlan] = useState(()=>safeJsonLoad(uiStorageKey("planning_style_drill"), ""));
  useEffect(()=>safeJsonSave(uiStorageKey("plan_view_mode"), planViewMode), [planViewMode]);
  useEffect(()=>safeJsonSave(uiStorageKey("planning_style_drill"), selectedStylePlan), [selectedStylePlan]);
  const activeDept = mode === "stitching" ? "stitching" : dept;
  const normalizedWeekStart = lineBoardWeekStart(weekStart);
  const weekDays = planningSixDays(normalizedWeekStart);
  const visiblePlans = (planRows||[]).filter(p=>p.dept===activeDept).sort((a,b)=>String(a.plan_date).localeCompare(String(b.plan_date)) || String(a.line).localeCompare(String(b.line)));
  const weekPlanRows = visiblePlans.filter(p=>weekDays.includes(String(p.plan_date||"").slice(0,10)));
  const pva = planVsAchievedRows(visiblePlans, rows, ledger);
  const impactRows = planImpactReviewRows(planRows, rows, ledger).filter(r=>String(r.Dept)===stageLabel(activeDept));
  const projectedRows = projectedFeedRows(planRows, rows, activeDept, weekDays);
  const todayIso = today();
  const todayIdx = weekDays.indexOf(todayIso);
  const isCurrentWeek = todayIdx >= 0;
  const daysElapsed = isCurrentWeek ? weekDays.slice(0, todayIdx+1) : (todayIso > weekDays[weekDays.length-1] ? weekDays : []);
  const wtdPlanRows = weekPlanRows.filter(p=>daysElapsed.includes(String(p.plan_date||"").slice(0,10)));
  const wtdPlan = wtdPlanRows.reduce((a,p)=>a+coverAdjustedPlanQty(p, planRows, rows, ledger),0);
  const wtdActual = wtdPlanRows.reduce((a,p)=>a+achievedForPlan(p, rows, ledger),0);
  const todayLongLabel = isCurrentWeek ? parseYmd(todayIso).toLocaleString("en-US",{weekday:"long", day:"numeric", month:"short"}) : "";
  function exportWeekDetail(){
    const teamRows = planTeamExportRows(planRows, rows, ledger, activeDept, weekDays);
    const daySummary = planDailySummaryExportRows(teamRows);
    const lineSummary = planLineSummaryExportRows(teamRows);
    const styleSummary = planStyleSummaryExportRows(teamRows);
    const weekPva = planVsAchievedRows(weekPlanRows, rows, ledger);
    exportXlsx(`production_${activeDept}_plan_team_pack_${normalizedWeekStart}.xlsx`, [
      { name:"Team Daily Board", rows:teamRows },
      { name:"Day Summary", rows:daySummary },
      { name:"Line Summary", rows:lineSummary },
      { name:"Style Summary", rows:styleSummary },
      { name:"Plan vs Achieved", rows:weekPva },
      { name:"Manager Actions", rows:impactRows },
      { name:"Projected Feed", rows:projectedRows },
      { name:"Raw Plan Rows", rows:weekPlanRows.map(p=>({ Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Slot:p.slot_no || 1, Style:p.style_no || p.style_input, Buyer:p.buyer, Reporting_Plan_Qty:planReportQty(p), Actual_Qty:achievedForPlan(p, rows, ledger), Full_Day_Target:p.eight_hr_target || "", Plan_Hours:planCapacityHours(p) || "", Changeover_Lost_Time:p.changeover?"Yes":"No", Qty_Mode:p.qty_auto_mode?"Auto":"Manual", End_Date:p.stitching_end_date, OPS:planCapacityOps(p) || "", Capacity_Type:p.cover_recovery_slot ? "Cover commitment only - OPS not added" : "Normal capacity plan", Short_Close:p.short_close?"Yes":"No", Cover_Target:p.cover_recovery_slot?"Yes":"No", Remarks:p.remarks, Status:p.status, Plan_ID:p.id })) }
    ]);
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Production Planning — Entry Board / Simple View</h3><div className="mt-panel-sub">Use Entry Board for typing plans; switch to Simple View or Achieved Weekly for reading the week, entry-done status, target-vs-actual and balance without the heavy entry UI.</div>
      {isCurrentWeek ? <div className="mt-speed-note" style={{marginTop:8}}><b>Today is {todayLongLabel}</b> — day {todayIdx+1} of {weekDays.length} in this working week ({stageLabel(activeDept)}). Week-to-date: Plan {fmt(wtdPlan)} · Actual {fmt(wtdActual)} · {wtdPlan-wtdActual>0 ? <span style={{color:"var(--fg-late)",fontWeight:800}}>Behind by {fmt(wtdPlan-wtdActual)}</span> : <span style={{color:"var(--fg-ok)",fontWeight:800}}>On/ahead of plan</span>}.</div>
        : <div className="mt-locked-note" style={{marginTop:8}}>Viewing week of {normalizedWeekStart} — this is {todayIso < weekDays[0] ? "a future week" : "a past week"}, not the current week. <button className="mt-btn ghost" onClick={()=>setWeekStart(lineBoardWeekStart(today()))} style={{marginLeft:8}}>Jump to this week</button></div>}
    </div>
    <div className="mt-section no-print"><div className="mt-filter-row"><button className={`mt-btn ${mode==="stitching"?"primary":"ghost"}`} onClick={()=>setMode("stitching")}>Stitching line board</button><button className={`mt-btn ${mode==="dept"?"primary":"ghost"}`} onClick={()=>setMode("dept")}>Other dept board</button>{mode==="dept" && <select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}>{STAGES.filter(s=>!['stitching'].includes(s.key)).map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select>}<span className="mt-toolbar-label">Week</span><input className="mt-input" type="date" value={weekStart} onChange={e=>setWeekStart(e.target.value)}/><button className="mt-btn ghost" onClick={()=>setWeekStart(lineBoardWeekStart(today()))}>This week</button><button className="mt-btn ghost" onClick={()=>setWeekStart(nextProductionMonday(today()))}>Next week</button><button className={`mt-btn ${fitBoard?"active":"ghost"}`} onClick={()=>setFitBoard(v=>!v)}>Compact board</button><button className={`mt-btn ${showTargets?"active":"ghost"}`} onClick={()=>setShowTargets(v=>!v)}>{showTargets ? "Auto qty calculator: on" : "Auto qty calculator: off"}</button><span className="mt-toolbar-label">Plan View</span>{[["entry","Entry Board"],["simple","Simple View"],["achieved","Achieved Weekly"]].map(([k,l])=><button key={k} className={`mt-btn ${planViewMode===k?"active":"ghost"}`} onClick={()=>setPlanViewMode(k)}>{l}</button>)}<button className="mt-btn primary" onClick={exportWeekDetail}><Download size={14}/>Export plan detail</button>{planSaveState && <span className={`mt-chip ${statusClass(planSaveState.tone)}`}>{planSaveState.text}</span>}</div><div className="mt-plan-slim-note"><b>Simple mode:</b> board shows only style / qty / OPS / finish. Click a cell for auto-target, changeover, load-ready and cascade checks.</div><details className="mt-plan-collapse"><summary><span>Advanced P0 plan rules</span><span className="mt-chip mt-muted">expand</span></summary><div className="mt-plan-collapse-body mt-small">Plan cells autosave to <b>production_plan_rows</b>. Style quantity is reserved across the full future plan, not only the visible week. Earlier/later planned slots both reduce the unplanned balance. Changeover is fixed lost setup time only when style changes. Projected feed includes upstream plan that is ready by loading date with buffer days, but stays separate from actual-ready feed.</div></details></div>
    <div className="mt-section">{planViewMode === "entry" ? <PlanExcelLineBoard rows={rows} planRows={planRows} setPlanRows={setPlanRows} setRows={setRows} activeDept={activeDept} weekDays={weekDays} showTargets={showTargets} fit={fitBoard} ledger={ledger} onPlanUpsert={onPlanUpsert} onPlanDelete={onPlanDelete}/> : <SimplePlanReadingView rows={rows} planRows={planRows} ledger={ledger} activeDept={activeDept} weekDays={weekDays} mode={planViewMode}/>}</div>
    <div className="mt-section"><StylePlanDrilldown rows={rows} planRows={planRows} ledger={ledger} selectedText={selectedStylePlan} setSelectedText={setSelectedStylePlan}/></div>
    <div className="mt-section"><div className="mt-plan-week-total-strip no-print"><span><b>Impact review</b> {fmt(impactRows.length)}</span><span><b>Feed warnings</b> {fmt(projectedRows.filter(r=>String(r.Feed_Status||"").includes("Depends") || String(r.Feed_Status||"").includes("Over")).length)}</span><span><b>Plan rows</b> {fmt(weekPlanRows.length)}</span></div>
      <details className="mt-plan-collapse"><summary><span>Plan Impact Review — manager approval queue</span><span className="mt-chip mt-muted">{fmt(impactRows.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Plan Impact Review" sub="Only exceptions after DPR entry. Operator does not change future plan; manager reviews cascade, cover promise, short close or no-change." rows={impactRows} empty="No pending plan impacts for this department." /></div></details>
      <details className="mt-plan-collapse"><summary><span>Projected Feed Check</span><span className="mt-chip mt-muted">{fmt(projectedRows.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Projected Feed Check" sub="Actual-ready feed plus upstream planned feed ready by loading date. Open only when you need audit detail." rows={projectedRows} empty="No projected feed rows for this week." /></div></details>
      <details className="mt-plan-collapse"><summary><span>{stageLabel(activeDept)} Week Plan Rows</span><span className="mt-chip mt-muted">{fmt(weekPlanRows.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title={`${stageLabel(activeDept)} Week Plan Rows`} sub="Underlying plan rows used for reporting/export." rows={weekPlanRows.map(p=>({ Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Style:p.style_no || p.style_input, Buyer:p.buyer, Plan_Qty:planReportQty(p), Actual_Qty:achievedForPlan(p, rows, ledger), End_Date:p.stitching_end_date||"", OPS:planCapacityOps(p)||"", Capacity_Type:p.cover_recovery_slot ? "Cover commitment only" : "Normal", Short_Close:p.short_close?"Yes":"No", Source:p.source_label, Load_Ready:planLoadReadyShort(p, rows, planRows, activeDept, p.line || "", p.plan_date, ledger), P0_Status:p.validation_status || planValidationSnapshot(p, rows, planRows, ledger).level, Status:p.status, Remarks:p.remarks }))} empty="No weekly plan cells filled yet." /></div></details>
      <details className="mt-plan-collapse"><summary><span>Plan vs Achieved / Style Adherence</span><span className="mt-chip mt-muted">{fmt(pva.length)} rows</span></summary><div className="mt-plan-collapse-body"><SimpleTable title="Plan vs Achieved / Style Adherence" sub="Compares planned style/date/line against actual production ledger." rows={pva} empty="No plan rows yet." /></div></details>
    </div>
  </div>;
}
function ReviewView({ rows, ledger, planRows, onEditReconcile }){
  const [section,setSection] = useState("cannotClose");
  const [historyMode,setHistoryMode] = useState(()=>safeJsonLoad(uiStorageKey("review_history_mode"), "summary"));
  const [historyTab,setHistoryTab] = useState(()=>safeJsonLoad(uiStorageKey("review_history_tab"), "entry_log"));
  const [historySearch,setHistorySearch] = useState(()=>safeJsonLoad(uiStorageKey("review_history_search"), ""));
  const [historyDept,setHistoryDept] = useState(()=>safeJsonLoad(uiStorageKey("review_history_dept"), "all"));
  useEffect(()=>safeJsonSave(uiStorageKey("review_history_mode"), historyMode), [historyMode]);
  useEffect(()=>safeJsonSave(uiStorageKey("review_history_tab"), historyTab), [historyTab]);
  useEffect(()=>safeJsonSave(uiStorageKey("review_history_search"), historySearch), [historySearch]);
  useEffect(()=>safeJsonSave(uiStorageKey("review_history_dept"), historyDept), [historyDept]);
  const rb = reviewBuckets(rows, ledger, planRows);
  const sectionMap = {
    ready:{ title:"Ready to Close", sub:"Numbers are clean; Production Coordinator should close these department/style balances.", rows:rb.ready },
    cannotClose:{ title:"Cannot Close — Open Balance", sub:"Main daily closure pain list. Department has unexplained/open balance; coordinator follows until explained/closed.", rows:rb.cannotClose },
    reconcile:{ title:"Reconcile Review", sub:"Single editable list for P0 stock/date, conservation mismatch, saved overrides and impossible movement. Click any row to open exact Register correction context.", rows:rb.reconcile },
    ram:{ title:"Reject / Alter / Missing Review", sub:"Quality/loss/recovery control. Main list is horizontal/summary; reason breakup comes next.", rows:rb.ram },
    risky:{ title:"Backdate / Same-Day Entry Report", sub:"Date-only backdate/same-day entries are monitor flags, not approval blockers. P0 feed/sequence clashes stay in Reconcile Review.", rows:rb.risky },
    planDev:{ title:"Plan Deviation Review", sub:"Catches shortfalls and planned difficult styles being replaced by easier/unplanned output.", rows:rb.planDev },
  };
  const active = sectionMap[section];
  const filteredLedgerOpts = { mode:historyMode, search:historySearch, dept:historyDept };
  const entryRows = entryLogRows(rows, ledger, filteredLedgerOpts);
  const receivingRows = receivingDaySummaryRows(rows, ledger, { search:historySearch });
  const changeRows = changeLogRows(rows, ledger, { search:historySearch });
  const cellRows = entryLogRows(rows, ledger, { ...filteredLedgerOpts, mode:"detail" });
  const historyRows = historyTab === "receiving" ? receivingRows : historyTab === "changes" ? changeRows : historyTab === "cell" ? cellRows : entryRows;
  const historyTitle = historyTab === "receiving" ? "Feed / Issue Day-wise Summary" : historyTab === "changes" ? "Change Log / Corrections / Overrides" : historyTab === "cell" ? "Cell History — Style × Dept × Activity" : "Entry Log — Summary / Detailed";
  const historySub = historyTab === "receiving" ? "Day-wise by production actual/activity date, not typed/created date. Same actual dates are combined." : historyTab === "changes" ? "Backdated entries, corrections, P0 sequence overrides and approval-stamped changes." : historyTab === "cell" ? "Cell-level production history grouped by actual date/style/dept/activity with horizontal size columns." : "Summary and detailed log both combine same actual/activity dates; typed time remains audit metadata only.";
  const todayRows = entryLogRows(rows, ledger, { mode:"summary", search:"", dept:"all" }).filter(r=>r.Activity_Date===today());
  function exportReviewSection(){ exportXlsx(`production_review_${section}_${today()}.xlsx`, [{ name:active.title, rows:active.rows }]); }
  function exportHistory(){ exportXlsx(`production_review_${historyTab}_${historyMode}_${today()}.xlsx`, [{ name:historyTitle, rows:historyRows }]); }
  function clearHistoryFilters(){ setHistorySearch(""); setHistoryDept("all"); }
  return <div className="mt-review-split">
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Review — Coordinator Control Room</h3><div className="mt-panel-sub">Review now combines closure review, reconcile, plan deviation, entry log, cell history and change log. This mirrors the Merch Tracker direction: operational review first, audit trace beside it.</div></div><div className="mt-section no-print"><div className="mt-summary-strip">{Object.entries(sectionMap).map(([k,v])=><button key={k} className={`mt-summary-tile ${section===k?"active":""}`} onClick={()=>setSection(k)}><div className="label">{v.title}</div><div className="value">{v.rows.length}</div><div className="mt-small">review</div></button>)}</div><div className="mt-toolbar"><button className="mt-btn primary" onClick={exportReviewSection}><Download size={14}/>Export Selected Review</button><span className="mt-chip mt-info">Closure rows: {active.rows.length}</span><span className="mt-chip mt-muted">Today ledger groups: {todayRows.length}</span></div></div><div className="mt-section"><SimpleTable title={active.title} sub={active.sub} rows={active.rows} empty="Nothing pending in this review section." exportName={`review_${section}`} onRowClick={section === "reconcile" ? (r)=>onEditReconcile?.(r) : undefined} /></div><div className="mt-section"><span className="mt-chip mt-info">Closing owner: Production Coordinator</span> <span className="mt-chip mt-muted">Department HOD owns work completion</span> <span className="mt-chip mt-muted">Production Manager only WIP escalation / approvals</span></div></div>
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">History / Entry Log / Change Log</h3><div className="mt-panel-sub">Use this for cell history, overall production entry log, feed day summary, and change/audit review. All production quantities are grouped by actual/activity date.</div></div><div className="mt-section no-print"><div className="mt-history-kpis"><div className="mt-history-kpi"><div className="label">Ledger rows</div><div className="value">{fmt((ledger||[]).length)}</div></div><div className="mt-history-kpi"><div className="label">Entry groups</div><div className="value">{fmt(entryRows.length)}</div></div><div className="mt-history-kpi"><div className="label">Feed days</div><div className="value">{fmt(receivingRows.length)}</div></div><div className="mt-history-kpi"><div className="label">Change flags</div><div className="value">{fmt(changeRows.length)}</div></div></div><div className="mt-review-mode-bar"><span className="mt-toolbar-label">View</span>{[["entry_log","Entry Log"],["cell","Cell History"],["receiving","Feed Summary"],["changes","Change Log"]].map(([k,l])=><button key={k} className={`mt-btn ${historyTab===k?"active":"ghost"}`} onClick={()=>setHistoryTab(k)}>{l}</button>)}<span className="mt-toolbar-label">Mode</span>{[["summary","Summary"],["detail","Detailed"]].map(([k,l])=><button key={k} className={`mt-btn ${historyMode===k?"active":"ghost"}`} onClick={()=>setHistoryMode(k)} disabled={historyTab==="receiving" || historyTab==="changes"}>{l}</button>)}<span className="mt-toolbar-label">Dept</span><select className="mt-select" value={historyDept} onChange={e=>setHistoryDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select><Search size={14}/><input className="mt-input" value={historySearch} onChange={e=>setHistorySearch(e.target.value)} placeholder="style / order / user / source / date" style={{minWidth:240}}/><button className="mt-btn ghost" onClick={clearHistoryFilters}>Clear</button><button className="mt-btn primary" onClick={exportHistory}><Download size={14}/>Export History</button></div></div><div className="mt-section"><SimpleTable title={historyTitle} sub={historySub} rows={historyRows} empty="No history rows match current filters." exportName={`history_${historyTab}_${historyMode}`} /></div></div>
  </div>;
}

function MonthlyComparison({ rows, ledger=[], clearTick=0 }){
  const [month,setMonth] = useState(()=>safeJsonLoad(uiStorageKey("monthly_month"), latestActivityDate(ledger).slice(0,7)));
  const [buyer,setBuyer] = useState(()=>safeJsonLoad(uiStorageKey("monthly_buyer"), "All"));
  const [focus,setFocus] = useState(()=>safeJsonLoad(uiStorageKey("monthly_focus"), "all"));
  const [route,setRoute] = useState(()=>safeJsonLoad(uiStorageKey("monthly_route"), "all"));
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_month"), month), [month]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_buyer"), buyer), [buyer]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_focus"), focus), [focus]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_route"), route), [route]);
  useEffect(()=>{ if (!clearTick) return; setBuyer("All"); setFocus("all"); setRoute("all"); }, [clearTick]);
  const [sizeBreak,setSizeBreak] = useState(true);
  const buyers = ["All", ...uniqueList(rows.map(r=>r.buyer))];
  const { start, end, label } = monthRangeFromYm(month);
  const rawPeriodRows = monthlyComparisonRows(rows, ledger, month);
  const baseRows = rawPeriodRows.filter(row => (buyer === "All" || row.Buyer === buyer) && (route === "all" || row.Route === route));
  const summary = {
    styles: baseRows.length,
    stitched: baseRows.reduce((a,row)=>a+n(row.Stitching_Feed_In_Period),0),
    checked: baseRows.reduce((a,row)=>a+n(row.Checking_In_Period),0),
    packed: baseRows.reduce((a,row)=>a+n(row.Packing_In_Period),0),
    dispatched: baseRows.reduce((a,row)=>a+n(row.Dispatch_In_Period),0),
    afterStitch: baseRows.reduce((a,row)=>a+n(row.Month_Flow_After_Stitch),0),
    oldWipChecked: baseRows.reduce((a,row)=>a+n(row.Checking_From_Opening_WIP),0),
    oldWipUsed: baseRows.reduce((a,row)=>a+n(row.Opening_WIP_Used_In_Month),0),
    checkedNotPacked: baseRows.reduce((a,row)=>a+n(row.Month_Checked_Not_Packed),0),
    packedNotDispatch: baseRows.reduce((a,row)=>a+n(row.Month_Packed_Not_Dispatched),0),
    ram: baseRows.reduce((a,row)=>a+n(row.RAM_Posted_In_Period),0),
  };
  const tiles = [
    { key:"all", label:"Styles With Period Activity", value:summary.styles, note:"ledger rows in selected month" },
    { key:"stitched", label:"Stitching Feed", value:summary.stitched, note:"only posted in this month" },
    { key:"checked", label:"Checking In Period", value:summary.checked, note:"can include old stitched WIP" },
    { key:"old_wip_checked", label:"Old WIP Checked", value:summary.oldWipChecked, note:"checking done from opening stitched WIP" },
    { key:"old_wip_used", label:"Opening WIP Used", value:summary.oldWipUsed, note:"old WIP processed in later stages" },
    { key:"after_stitch", label:"New Stitch Pending Check", value:summary.afterStitch, note:"period stitch not yet checked" },
    { key:"packed_pending", label:"Month Packed Not Dispatch", value:summary.packedNotDispatch, note:"period packed minus period dispatch" },
    { key:"ram", label:"R/A/M Posted", value:summary.ram, note:"period reject/alter/missing" },
  ];
  const filtered = baseRows.filter(row=>{
    if (focus === "all") return true;
    if (focus === "stitched") return n(row.Stitching_Feed_In_Period) > 0;
    if (focus === "checked") return n(row.Checking_In_Period) > 0;
    if (focus === "old_wip_checked") return n(row.Checking_From_Opening_WIP) > 0;
    if (focus === "old_wip_used") return n(row.Opening_WIP_Used_In_Month) > 0;
    if (focus === "after_stitch") return n(row.Month_Flow_After_Stitch) > 0;
    if (focus === "packed_pending") return n(row.Month_Packed_Not_Dispatched) > 0;
    if (focus === "ram") return n(row.RAM_Posted_In_Period) > 0;
    return true;
  });
  const tableRows = filtered.map(row=>{
    const { Current_Status_Snapshot, Current_Owner_Snapshot, Current_Open_Qty_Snapshot, Next_Action, ...periodCols } = row;
    const sizeCols = sizeBreak ? {} : Object.fromEntries(Object.keys(periodCols).filter(k=>k.startsWith("Size_")).map(k=>[k, undefined]));
    const cleaned = { ...periodCols };
    if (!sizeBreak) Object.keys(cleaned).filter(k=>k.startsWith("Size_")).forEach(k=>delete cleaned[k]);
    return {
      ...cleaned,
      Current_Status_Snapshot,
      Current_Owner_Snapshot,
      Current_Open_Qty_Snapshot,
      Next_Action,
    };
  });
  const noLedger = !(ledger||[]).some(e=>ledgerEntryInPeriod(e, start, end));
  return <div className="mt-card">
    <div className="mt-section"><h3 className="mt-panel-title">Monthly Comparison — Period Activity + Opening WIP Flow</h3><div className="mt-panel-sub">Duration rule locked: quantities are from production_entries.entry_date inside the selected month only. If an old WIP style has only 500 stitched in July but 1,200 checked in July, the report shows Stitching 500 and Checking 1,200, with 700 marked as checking from opening stitched WIP.</div></div>
    <div className="mt-section no-print">
      <div className="mt-filter-row"><span className="mt-toolbar-label">Month</span><input className="mt-input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><span className="mt-chip mt-info">{label} · {dateRangeLabel(parseYmd(start), parseYmd(end))}</span><span className="mt-toolbar-label">Buyer</span><select className="mt-select" value={buyer} onChange={e=>setBuyer(e.target.value)}>{buyers.map(b=><option key={b}>{b}</option>)}</select><span className="mt-toolbar-label">Route</span><select className="mt-select" value={route} onChange={e=>setRoute(e.target.value)}><option value="all">All routes</option><option>Plain</option><option>Print</option><option>Embroidery</option><option>Print + Emb</option></select><button className={`mt-btn ${sizeBreak?"primary":"ghost"}`} onClick={()=>setSizeBreak(v=>!v)}><Layers size={14}/>Horizontal sizes</button><span className="mt-page-filter-note">{tableRows.length} rows</span></div>
      <div className="mt-speed-note"><b>Important:</b> this report is not a cumulative WIP snapshot. It only sums activity entries whose <code>entry_date</code> falls from {start} to {end}. If Checking/Packing/Dispatch is higher than same-month Stitching, the excess is explained in the Opening WIP columns, not treated as an error.</div>
      <div className="mt-summary-strip">{tiles.map(t=><button key={t.key} className={`mt-summary-tile ${focus===t.key?"active":""}`} onClick={()=>setFocus(t.key)}><div className="label">{t.label}</div><div className="value">{typeof t.value === "number" && t.key!=="all" ? fmt(t.value) : t.value}</div><div className="mt-small">{t.note}</div></button>)}</div>
    </div>
    {noLedger && <div className="mt-section"><span className="mt-chip mt-warn">No production activity entries found for this month</span> <span className="mt-small">Cumulative style totals are intentionally not shown here, because duration reports must show only activity posted in the selected period.</span></div>}
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{(tableRows[0] ? Object.keys(tableRows[0]) : ["Note"]).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{tableRows.length ? tableRows.map((r,i)=><tr key={i}>{Object.keys(tableRows[0]).map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] === undefined || r[c] === null ? "" : r[c])}</td>)}</tr>) : <tr><td style={{padding:18}}>No period activity rows for this filter.</td></tr>}</tbody></table></div>
  </div>;
}

function Reports({ rows, ledger }){
  const pack = buildReportSheets(rows, ledger);
  const [reportView,setReportView] = useState(()=>safeJsonLoad(uiStorageKey("reports_view"), "summary"));
  useEffect(()=>safeJsonSave(uiStorageKey("reports_view"), reportView), [reportView]);
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
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Handover Aging", rows:pack.ownerRows.filter(r => String(r.Status).includes("Ready") || String(r.Status).includes("With")) },
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
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Reject Alter Missing", rows:pack.ramRows },
      { name:"Reconcile", rows:pack.reconcile },
      { name:"Owner Chase", rows:pack.ownerRows },
      { name:"Line Efficiency", rows:pack.lineEfficiencyRows },
      { name:"Bottleneck Flow", rows:pack.bottleneckRows },
      { name:"Aging Stuck WIP", rows:pack.agingRows },
      { name:"Quality Loss Rate", rows:pack.qualityRows },
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
    { title:"Daily Production Pack", desc:"Factory summary + department sheets + owner chase + reconcile.", action:exportDailyPack },
    { title:"Issue / Receive Control", desc:"Movement control: ready, with department and handover aging.", action:exportIssueReceive },
    { title:"Quality Loss Pack", desc:"R/A/M, reconcile, and audit entries.", action:exportQualityLoss },
    { title:"Management Monthly Pack", desc:"Monthly management pack with WIP, bottleneck, party, dispatch and audit.", action:exportManagementMonthly },
    { title:"All Reports Workbook", desc:"All report sheets in one file.", action:exportAllReports },
  ];
  const wipSummary = [
    { label:"Live WIP rows", value:(pack.wipStatus||[]).length, note:"Current style rows" },
    { label:"R/A/M rows", value:(pack.ramRows||[]).length, note:"Quality/loss rows" },
    { label:"Reconcile rows", value:(pack.reconcile||[]).length, note:"True correction tasks" },
    { label:"Ledger entries", value:(pack.ledgerRows||[]).length, note:"Audit/activity entries" },
  ];
  const reportGraphRows = [
    { Report:"Live WIP", Rows:(pack.wipStatus||[]).length },
    { Report:"Department sheets", Rows:(pack.deptSheets||[]).reduce((a,s)=>a+(s.rows||[]).length,0) },
    { Report:"R/A/M", Rows:(pack.ramRows||[]).length },
    { Report:"Reconcile", Rows:(pack.reconcile||[]).length },
    { Report:"Owner chase", Rows:(pack.ownerRows||[]).length },
    { Report:"Audit ledger", Rows:(pack.ledgerRows||[]).length },
  ].filter(r=>r.Rows>0);
  return <div style={{display:"grid", gap:12}}>
    <div className="mt-card"><div className="mt-section"><div className="mt-drill-head"><div><h3 className="mt-panel-title">Reports</h3><div className="mt-panel-sub"><b>Summary</b> explains what each report is for. <b>Graphs</b> shows quick report volume/quality signals. <b>Exports</b> creates the Excel packs.</div></div><div className="mt-toggle-row"><button className={`mt-btn ${reportView==="summary"?"active":""}`} onClick={()=>setReportView("summary")}>Summary</button><button className={`mt-btn ${reportView==="graphs"?"active":""}`} onClick={()=>setReportView("graphs")}>Graphs</button><button className={`mt-btn ${reportView==="exports"?"active":""}`} onClick={()=>setReportView("exports")}>Exports</button></div></div></div></div>
    {reportView === "summary" && <>
      <div className="mt-grid">{wipSummary.map((r,i)=><DashboardActionCard key={i} title={r.label} value={fmt(r.value)} sub={r.note} tone={r.label.includes("Reconcile") && r.value?"late":r.label.includes("R/A/M") && r.value?"warn":"info"}/>)}</div>
      <div className="mt-two"><SimpleTable title="Management report summary" sub="Readable first layer before export. Use Exports for full detail." rows={pack.factorySummary || []} empty="No summary rows."/><SimpleTable title="Owner follow-up summary" sub="Who owns open WIP / action rows. Detailed chase stays in export." rows={(pack.ownerRows||[]).slice(0,10)} empty="No owner rows."/></div>
      <details className="mt-fold"><summary>Printable HOD sheet</summary><PrintableHodSheet rows={rows}/></details>
    </>}
    {reportView === "graphs" && <div className="mt-two"><DashboardBarPanel title="Report data volume" sub="Shows which report sheets currently contain data." rows={reportGraphRows} labelKey="Report" valueKey="Rows"/><DashboardBarPanel title="Management risk rows" sub="Reconcile/RAM/closure/dispatch rows that need reading before export." rows={[{Risk:"Reconcile", Qty:(pack.reconcile||[]).length},{Risk:"R/A/M", Qty:(pack.ramRows||[]).length},{Risk:"Closure", Qty:(pack.closureRows||[]).length},{Risk:"Dispatch ready", Qty:(pack.dispatchRows||[]).length}]} labelKey="Risk" valueKey="Qty"/></div>}
    {reportView === "exports" && <div className="mt-two"><div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Excel export packs</h3><div className="mt-panel-sub">Every export includes full audit/detail rows. Screen summaries stay simple.</div></div><div className="mt-section" style={{display:"grid", gap:10}}>{reportCards.map(card=><div key={card.title} className="mt-card" style={{boxShadow:"none"}}><div className="mt-section"><h3 className="mt-panel-title" style={{fontSize:13}}>{card.title}</h3><div className="mt-panel-sub">{card.desc}</div><button className="mt-btn primary" style={{marginTop:9}} onClick={card.action}><Download size={14}/>Export</button></div></div>)}</div></div><PrintableHodSheet rows={rows}/></div>}
  </div>;
}

function PrintableHodSheet({ rows }){
  const [dept,setDept] = useState("stitching");
  const deptRows = rows.filter(r=>routeFor(r).includes(dept));
  const allSizes = allReportSizes(deptRows);
  return <div className="mt-card"><div className="mt-section no-print"><h3 className="mt-panel-title">Printable Department Head WIP</h3><div className="mt-panel-sub">Daily HOD sheet in horizontal size format. One row per style/component; sizes across columns.</div><div style={{marginTop:10}}><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select> <button className="mt-btn" onClick={()=>window.print()}><Printer size={14}/>Print</button></div></div><div className="mt-section mt-print-sheet"><h3 style={{marginTop:0}}>{stageLabel(dept)} WIP Sheet — {today()}</h3><table className="mt-table" style={{minWidth:980}}><thead><tr><th>Order</th><th>Style</th><th>Colour</th><th>Component</th><th>Status</th>{allSizes.map(size=><th key={size}>{size}</th>)}<th>Total</th><th>Open</th><th>R/A/M</th><th>Idle</th><th>Owner</th><th>Action</th></tr></thead><tbody>{deptRows.map(row=>{ const st=sdata(row,dept); const c=cellBreakup(row,dept); const rs=rowStatus(row); const sizeQty=Object.fromEntries(sizeMatrix(row,dept,"received").map(x=>[x.size,x.qty])); return <tr key={row.id}><td>{row.order_no}</td><td><b>{row.style_no}</b></td><td>{row.colour}</td><td>{row.component}</td><td>{rs.status}</td>{allSizes.map(size=><td key={size}>{fmt(sizeQty[size] || 0)}</td>)}<td><b>{fmt(c.received)}</b></td><td>{fmt(c.open)}</td><td>{fmt(c.ram)}</td><td>{n(st.idle)}d</td><td>{rs.owner}</td><td>{rs.action}</td></tr>; })}</tbody></table></div></div>;
}


function friendlyTableHeader(key){
  const map = {
    Date:"Date", Day:"Day", Dept:"Dept", Stage:"Stage", Line:"Line", Style:"Style", Buyer:"Buyer", Order:"Order",
    Planned_Style:"Style", Planned:"Plan", Plan_Qty:"Plan", Plan_Qty_Needed_This_Slot:"Need", Achieved:"Done", Achieved_Qty:"Done", Done:"Done",
    Balance:"Balance", Variance:"Gap", Qty_Achievement:"Achv %", Achievement:"Achv %", Style_Adherence:"Match", Plan_Status:"Status",
    Feed_Status:"Feed", Upstream_Rule:"Rule", Reading:"Reading", Load_Ready:"Load", P0_Status:"Check", Status:"Status",
    Actual_Ready_Feed:"Ready now", Projected_Upstream_Feed:"Expected", Projected_Available_Feed:"Possible", Available_For_This_Slot:"Avail. for slot", After_This_Slot:"After slot", Earlier_Planned:"Earlier plan", Already_Done_In_Dept:"Done here",
    Source:"Source", Source_Type:"Source type", Short_Close:"Short close", Remarks:"Note", End_Date:"End", OPS:"OPS", Hours:"Hrs", Plan_Hours:"Hrs",
    Feed:"Feed", Output:"Good", Open_Work:"Open", Ready_To_Issue:"Ready", RAM:"R/A/M", Good:"Good", Issued:"Issued",
    Original_Short:"Original short", Committed_Qty:"Committed", Recovered_Qty:"Recovered", Remaining_Qty:"Open", Due_By:"Due by", Reason:"Reason", Reviewed_By:"Reviewed by",
    Task:"Task", Suggested_Action:"Action", Signal:"Signal", Miss_Count:"Misses", Total_Short:"Total short", Future_Slots:"Future slots", Future_Qty:"Future qty",
    Cum_Plan_Qty:"Cum. Plan (till date)", Cum_Achieved_Qty:"Cum. Actual (till date)", Cum_Balance:"Cum. Balance"
  };
  return map[key] || String(key || "").replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase());
}
function compactPlanStatusText(v){
  const s = String(v || "").trim();
  if (!s) return "—";
  if (/actual ready|ok/i.test(s)) return "Ready";
  if (/covered_by_plan_hours|covered/i.test(s)) return "Covered by plan";
  if (/depends_on_upstream_plan|depends/i.test(s)) return "Needs upstream";
  if (/over_available_balance|over projected|over/i.test(s)) return "Check balance";
  if (/p0_line_cascade_block/i.test(s)) return "Auto fill stopped";
  if (/draft\s*\/\s*review/i.test(s)) return "Review";
  if (/draft/i.test(s)) return "Draft";
  return s.replace(/_/g," ");
}
function compactPlanReadingFromRow(r){
  const need = n(r.Plan_Qty_Needed_This_Slot ?? r.Plan_Qty ?? r.Planned ?? r.Planned_Qty);
  const ready = n(r.Actual_Ready_Feed);
  const expected = n(r.Projected_Upstream_Feed);
  const avail = n(r.Available_For_This_Slot);
  const after = n(r.After_This_Slot);
  const done = n(r.Achieved ?? r.Achieved_Qty ?? r.Done);
  const bal = n(r.Balance);
  const status = compactPlanStatusText(r.Feed_Status || r.P0_Status || r.Plan_Status || r.Status);
  if (/covered by plan/i.test(status)) return "Covered by line plan/manual output · no action";
  if (need || ready || expected || avail || after) {
    if (need && ready >= need) return `Need ${fmt(need)} · ready now ${fmt(ready)} · after ${fmt(Math.max(0, after))}`;
    if (need && avail >= need) return `Need ${fmt(need)} · uses expected feed ${fmt(expected)} · after ${fmt(Math.max(0, after))}`;
    if (need) return `Need ${fmt(need)} · available ${fmt(avail || ready + expected)} · short ${fmt(Math.max(0, need - (avail || ready + expected)))}`;
  }
  if (r.Planned !== undefined || r.Achieved !== undefined || r.Plan_Qty !== undefined) return `Plan ${fmt(r.Planned ?? r.Plan_Qty ?? r.Planned_Qty)} · done ${fmt(done)} · gap ${fmt(bal || Math.max(0, n(r.Planned ?? r.Plan_Qty ?? r.Planned_Qty)-done))}`;
  return status || "—";
}
function tableTypeFromTitle(title=""){
  const t = String(title || "").toLowerCase();
  if (t.includes("projected feed")) return "feed";
  if (t.includes("history") || t.includes("audit trail") || t.includes("feed trail")) return "history";
  if (t.includes("plan vs achieved") || t.includes("weekly achieved")) return "achieved";
  if (t.includes("week plan rows") || t.includes("style plan slots") || t.includes("day-wise") || t.includes("line-wise")) return "plan";
  if (t.includes("actual") || t.includes("wip breakup") || t.includes("size-wise")) return "wip";
  if (t.includes("cover")) return "cover";
  if (t.includes("repeated")) return "delay";
  return "generic";
}
function signedFmt(v){ const q = n(v); return q ? `${q > 0 ? "+" : ""}${fmt(q)}` : ""; }
function isHistorySizeColumn(key){
  const k = String(key || "");
  const blocked = new Set(["Date","Actual_Date","Source_Dept","Department","Meaning","Activity","Source","Total","Qty","First_Typed_At","Last_Typed_At","Users","Reason","Line","Style","Buyer","Reading"]);
  if (blocked.has(k)) return false;
  if (k.startsWith("_")) return false;
  return true;
}
function isCorrectionHistoryRow(row={}){
  const text = `${row.Source || ""} ${row.Reason || ""} ${row.Activity || ""} ${row.Meaning || ""}`.toLowerCase();
  return text.includes("correction") || text.includes("corrected") || text.includes("reversal") || text.includes("void") || n(row.Total ?? row.Qty) < 0;
}
function compactSizeBreakup(sizeQty={}){
  const entries = Object.entries(sizeQty).filter(([,qty])=>n(qty) !== 0);
  if (!entries.length) return "—";
  const shown = entries.slice(0,8).map(([size,qty])=>`${size}: ${fmt(qty)}`);
  return `${shown.join(" · ")}${entries.length > shown.length ? ` · +${entries.length - shown.length} sizes` : ""}`;
}
function compactHistoryRows(rows=[]){
  const grouped = new Map();
  (rows || []).forEach(r=>{
    const date = r.Actual_Date || r.Date || r.entry_date || "";
    const activity = r.Activity || r.Meaning || r.Entry_Type || r.Type || "Activity";
    const dept = r.Department || r.Source_Dept || r.Dept || "";
    const key = [date, dept, activity].join("|::|");
    if (!grouped.has(key)) grouped.set(key, { Date:date, Dept:dept, Activity:activity, baseQty:0, correctionQty:0, finalQty:0, rows:0, sizeQty:{}, users:new Set(), lastTyped:"", reasons:new Set() });
    const g = grouped.get(key);
    const total = n(r.Total ?? r.Qty ?? r.Net_Qty);
    const isCorrection = isCorrectionHistoryRow(r);
    g.rows += 1;
    g.finalQty += total;
    if (isCorrection) g.correctionQty += total; else g.baseQty += total;
    Object.keys(r || {}).filter(isHistorySizeColumn).forEach(k=>{
      const val = n(r[k]);
      if (!val) return;
      g.sizeQty[k] = n(g.sizeQty[k]) + val;
    });
    String(r.Users || r.changed_by || r.created_by || "").split(",").map(x=>x.trim()).filter(Boolean).forEach(u=>g.users.add(u));
    const typed = r.Last_Typed_At || r.First_Typed_At || r.created_at || "";
    if (typed && (!g.lastTyped || String(typed) > String(g.lastTyped))) g.lastTyped = typed;
    if (r.Reason) g.reasons.add(r.Reason);
  });
  return Array.from(grouped.values()).sort((a,b)=>String(b.Date).localeCompare(String(a.Date)) || String(a.Activity).localeCompare(String(b.Activity))).map(g=>{
    const hasCorrection = n(g.correctionQty) !== 0;
    return {
      Date:g.Date,
      Dept:g.Dept,
      Activity:g.Activity,
      "Original entry":n(g.baseQty) || "",
      Correction:hasCorrection ? signedFmt(g.correctionQty) : "",
      "Final qty":n(g.finalQty),
      Sizes:compactSizeBreakup(g.sizeQty),
      Rows:g.rows,
      User:Array.from(g.users).slice(0,3).join(", ") || "—",
      Reading:hasCorrection ? `Corrected view: final ${fmt(g.finalQty)} after adjustment ${signedFmt(g.correctionQty)}.` : `Posted ${fmt(g.finalQty)}.`
    };
  });
}
function simplifiedRowsForTable(title, rows=[]){
  const type = tableTypeFromTitle(title);
  if (!Array.isArray(rows)) return [];
  if (type === "feed") return rows.map(r=>({
    Date:r.Date, Line:r.Line, Style:r.Style, Need:n(r.Plan_Qty_Needed_This_Slot || r.Plan_Qty), "Ready now":n(r.Actual_Ready_Feed), "Expected feed":n(r.Projected_Upstream_Feed), "Available for slot":n(r.Available_For_This_Slot), "After slot":n(r.After_This_Slot), Result:compactPlanStatusText(r.Feed_Status), "Manager reading":compactPlanReadingFromRow(r)
  }));
  if (type === "history") return compactHistoryRows(rows);
  if (type === "achieved") return rows.map(r=>({
    Date:r.Date, Line:r.Line, Style:r.Planned_Style || r.Style, Buyer:r.Buyer, Plan:n(r.Planned ?? r.Plan_Qty ?? r.Planned_Qty), Done:n(r.Achieved ?? r.Achieved_Qty), Gap:n(r.Variance ?? r.Balance), "%":r.Qty_Achievement || r.Achievement || "—", Result:compactPlanStatusText(r.Plan_Status || r.Style_Adherence || r.Status), "Next action": r.Remarks || (n(r.Variance)<0 ? "Check DPR / manager review" : "OK")
  }));
  if (type === "plan") return rows.map(r=>({
    Date:r.Date, Line:r.Line, Style:r.Style, Buyer:r.Buyer, Plan:n(r.Plan_Qty ?? r.Planned_Qty ?? r.Plan_Qty_Needed_This_Slot), Done:n(r.Achieved_Qty || r.Achieved || r.Done), Balance:n(r.Balance), Load:r.Load_Ready || r.Load || "", Status:compactPlanStatusText(r.P0_Status || r.Status || r.Plan_Status), Note:r.Remarks || r.Reading || ""
  }));
  if (type === "wip") return rows.map(r=>({
    Dept:r.Dept || r.Stage || "", Style:r.Style || "", Feed:n(r.Feed), Good:n(r.Output || r.Good), Issued:n(r.Issued), Ready:n(r.Ready_To_Issue || r.Ready), Open:n(r.Open_Work || r.Open), "R/A/M":n(r.RAM), Reading:r.Reading || r.Action || r.Info || ""
  }));
  if (type === "cover") return rows.map(r=>({ Date:r.Date, Line:r.Line, Style:r.Style, Committed:n(r.Committed_Qty), Recovered:n(r.Recovered_Qty), Open:n(r.Remaining_Qty), "Due by":r.Due_By, Status:compactPlanStatusText(r.Status), Reason:r.Reason || "" }));
  if (type === "delay") return rows.map(r=>({ Dept:r.Dept, Style:r.Style, Buyer:r.Buyer, Misses:n(r.Miss_Count), "Total short":n(r.Total_Short), Future:n(r.Future_Qty), Signal:r.Signal, Action:r.Suggested_Action }));
  return rows;
}
function simpleTableCellTone(key, value){
  const k = String(key || "").toLowerCase();
  const v = String(value || "").toLowerCase();
  if (k.includes("result") || k.includes("status") || k.includes("load")) {
    if (/short|failed|blocked|over|late|review/.test(v)) return " mt-cell-tone-late";
    if (/depend|pending|warning|draft/.test(v)) return " mt-cell-tone-warn";
    if (/ready|ok|achieved|closed|valid/.test(v)) return " mt-cell-tone-ok";
  }
  if (k.includes("correction")) return n(String(value).replace(/,/g,"")) < 0 ? " mt-cell-tone-late" : n(String(value).replace(/,/g,"")) > 0 ? " mt-cell-tone-warn" : "";
  if (k.includes("gap") || k.includes("balance") || k.includes("open") || k.includes("short")) return n(value)>0 ? " mt-cell-tone-warn" : "";
  return "";
}

function SimpleTable({ title, sub, rows, empty, onRowClick, exportName="" }){
  const rawRows = Array.isArray(rows) ? rows : [];
  const displayRows = simplifiedRowsForTable(title, rawRows);
  const cols = displayRows.length ? Object.keys(displayRows[0]).filter(c=>!String(c).startsWith("_")) : [];
  const canExport = !!exportName && currentUserCan("production.export");
  const type = tableTypeFromTitle(title);
  const infoSub = sub || "Summary first. Expand/use export for detailed audit when needed.";
  return <div className={`mt-card mt-readable-table mt-readable-${type}`}><div className="mt-section"><h3 className="mt-panel-title">{title}</h3><div className="mt-panel-sub">{infoSub}</div>{canExport ? <button className="mt-btn primary no-print" style={{marginTop:8}} onClick={()=>exportXlsx(`${exportName}_${today()}.xlsx`, [{ name:title, rows:rawRows }])}><Download size={14}/>Export detailed table</button> : null}</div><div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{friendlyTableHeader(c)}</th>)}</tr></thead><tbody>{displayRows.length ? displayRows.map((r,i)=><tr key={i} className={onRowClick ? "drillable" : ""} onClick={()=>onRowClick?.(rawRows[i] || r)}>{cols.map(c=>{ const val = r[c]; return <td key={c} className={simpleTableCellTone(c,val)}>{typeof val === "number" ? fmt(val) : String(val === undefined || val === null ? "" : val)}</td>; })}</tr>) : <tr><td colSpan={Math.max(1,cols.length)} style={{padding:18}}>{empty}</td></tr>}</tbody></table></div>{rawRows.length && displayRows !== rawRows ? <div className="mt-table-note no-print">Showing simplified manager-readable columns. Export keeps the full audit/detail data.</div> : null}</div>;
}

function DetailDrawer({ row, rows, setRows, ledger, setLedger, stageKey, onClose, onOpenRegister, onOpenStyle, onRelease, onSharedSave }){
  const rs = rowStatus(row);
  const stage = stageKey || rs.stage;
  const route = routeFor(row);
  const stageIdx = route.indexOf(stage);
  const prevStageForFeed = stageIdx > 0 ? route[stageIdx - 1] : null;
  const st = sdata(row,stage);
  const c = cellBreakup(row,stage);
  const feed = stage === "cutting" ? cuttingBaseQty(row) : stageFeed(row,stage);
  const readyToIssue = Math.max(0, n(st.output) - n(st.issued));
  const rejectQty = n(st.reject);
  const alterQty = n(st.alter);
  const missingQty = n(st.missing);
  const ramQty = rejectQty + alterQty + missingQty;
  const accountedQty = n(st.output) + ramQty;
  const tailQty = Math.max(0, feed - accountedQty);
  const buckets = issueBuckets(row).filter(b=>b.stage===stage);
  const primaryBucket = buckets.find(b=>b.type!=="extra_cut") || buckets[0];
  const receivingRows = receivingHistoryRows(row, stage, ledger);
  const outputHistoryRows = departmentOutputHistoryRows(row, stage, ledger);
  const openRegisterForEdit = (activity="all") => onOpenRegister?.(row, stage, activity);
  const sizeRows = sizesFor(row).map(size=>{
    const feedSz = n(stageFeedBySize(row,stage)[size]);
    const out = n(sizeMatrix(row,stage,"output").find(x=>x.size===size)?.qty);
    const iss = n(sizeMatrix(row,stage,"issued").find(x=>x.size===size)?.qty);
    const rej = n(sizeMatrix(row,stage,"reject").find(x=>x.size===size)?.qty);
    const alt = n(sizeMatrix(row,stage,"alter").find(x=>x.size===size)?.qty);
    const miss = n(sizeMatrix(row,stage,"missing").find(x=>x.size===size)?.qty);
    const ram = rej + alt + miss;
    return { Size:size, Feed:feedSz, Output:out, Open_Work:Math.max(0, feedSz-out-ram), Ready_To_Issue:Math.max(0,out-iss), RAM:ram };
  });
  async function shortCloseCutting(){
    if (stage !== "cutting") return;
    const open = cuttingAccountableOpen(row);
    if (open <= 0) { alert("No cutting balance is open to short close."); return; }
    const qty = n(window.prompt(`Cutting open is ${fmt(open)}. Enter quantity to short close:`, String(open)));
    if (!qty || qty < 0 || qty > open) { alert(`Enter a quantity between 1 and ${fmt(open)}.`); return; }
    const reason = window.prompt("Reason / approval note for cutting short close:", row.cutting_short_close_reason || "Short close approved") || "Short close approved";
    const nextQty = cuttingShortCloseQty(row) + qty;
    const updatedRow = { ...row, cutting_short_close_qty:nextQty, cutting_short_close_reason:reason, stages:{ ...(row.stages||{}), cutting:{ ...blankStage(), ...(row.stages?.cutting||{}), short_close:nextQty } } };
    setRows(prev=>prev.map(r=>String(r.id)===String(row.id) ? updatedRow : r));
    const { error } = await upsertOneStyleToSupabase(updatedRow);
    if (error) alert(`Short close saved in browser, Supabase save failed: ${error.message}`);
  }
  return <div className="mt-drawer"><div className="mt-drawer-head"><div><div style={{fontFamily:"'Archivo',sans-serif", fontSize:20, fontWeight:800}}>{stageLabel(stage)} · {row.style_no}</div><div className="mt-sub">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div></div><button className="mt-btn" onClick={onClose} title="Close"><X size={18}/></button></div><div className="mt-drawer-body">
    <div className="mt-entry-highlight"><strong>Focused WIP cell: {stageLabel(stage)}</strong><div className="mt-context-strip"><span className="mt-chip mt-info">Selected dept only</span><span className="mt-chip mt-muted">Order {row.order_no}</span><span className="mt-chip mt-muted">{row.colour} · {row.component}</span>{primaryBucket && <span className={`mt-chip ${statusClass(primaryBucket.tone)}`}>{primaryBucket.status}</span>}</div><div className="mt-panel-sub" style={{marginTop:6}}>Only the clicked department's breakup is shown first. Full style/route detail is collapsed below.</div></div>
    {stage === "cutting" && !isProductionFileReleased(row) ? <div className="mt-release-card no-print"><div className="title">Production file not released</div><div className="mt-small">Cutting feed is locked at 0 until the file is released. This prevents accidental cutting output before the production file handover.</div><button className="mt-btn primary" onClick={()=>onRelease?.(row, "wip_detail")}>Release Production File</button></div> : stage === "cutting" ? <div className="mt-release-card no-print"><div className="title">{fileReleaseStatusText(row)}</div><div className="mt-small">Released size feed is used as Cutting feed and DPR cap.</div><button className="mt-btn ghost" onClick={()=>onRelease?.(row, "wip_detail_edit")}>Edit Release</button></div> : null}
    <div className="mt-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))", marginBottom:12}}>
      <Kpi label={stage === "cutting" ? "Released Feed" : "Feed to Dept"} value={fmt(feed)} note={stage === "cutting" ? (isProductionFileReleased(row) ? "Production file released to Cutting" : "Not released yet") : "Previous dept issued/accepted"}/>
      <Kpi label="Completed / Output" value={`Good ${fmt(n(st.output))}`} note={<span>Reject {fmt(rejectQty)} · Missing {fmt(missingQty)} · Alter {fmt(alterQty)}<br/>Accounted {fmt(accountedQty)} / {fmt(feed)}</span>} tone={ramQty ? "warn" : "ok"}/>
      <Kpi label="Open / Tail Action" value={fmt(c.open)} note={<span>Work open {fmt(c.open)} · Tail {fmt(tailQty)}<br/>Use R/A/M rows if balance is not production.</span>} tone={c.open || tailQty ? "warn" : "ok"}/>
      <Kpi label="Ready to Issue" value={fmt(readyToIssue)} note="Completed but not moved forward" tone={readyToIssue?"info":"ok"}/>
    </div>
    <div className="mt-section mt-card" style={{marginBottom:12}}><h3 className="mt-panel-title">{stageLabel(stage)} breakup</h3><div className="mt-context-strip"><span className="mt-chip mt-ok">Done {fmt(c.received)}</span><span className="mt-chip mt-warn">Open {fmt(c.open)}</span><span className="mt-chip mt-late">R/A/M {fmt(c.ram)}</span>{c.shortClose ? <span className="mt-chip mt-purple">Short Closed {fmt(c.shortClose)}</span> : null}{c.extra ? <span className="mt-chip mt-purple">Extra/Over {fmt(c.extra)}</span> : null}<span className="mt-chip mt-info">Owner {primaryBucket?.owner || stageOwner(stage)}</span></div>{stage==="cutting" && c.open>0 ? <div style={{marginTop:10}}><button className="mt-btn ghost" onClick={shortCloseCutting}>Short close cutting balance</button><div className="mt-small">Use only when management approves cutting less than order qty. This removes balance from Cutting Pending; it does not add production.</div></div> : null}</div>
    <div className="mt-correction-control no-print"><h3 className="mt-panel-title">Correction control — feed and output together</h3><div className="mt-panel-sub">Use this when WIP says conservation/feed/output mismatch. Correct the source that is wrong: cutting feed comes from Style Entry order-size qty; other department feed comes from previous department Issue Forward; output/R/A/M is corrected in Register.</div><div className="mt-correction-control-grid"><div className="mt-correction-control-card"><div className="label">Feed source</div><div className="value">{fmt(feed)}</div><div className="mt-small">{stage === "cutting" ? "Order qty / cutting file release" : `${stageLabel(prevStageForFeed)} issue-forward to ${stageLabel(stage)}`}</div>{stage === "cutting" ? <><button className="mt-btn primary" onClick={()=>onRelease?.(row, "wip_correction_control")}><CheckCircle2 size={14}/>Release / Edit File</button><button className="mt-btn ghost" onClick={()=>onOpenStyle?.(row)}><Shirt size={14}/>Edit Style Master</button></> : <button className="mt-btn ghost" onClick={()=>onOpenRegister?.(row, prevStageForFeed || stage, "Dept Issue Forward")}><FileSpreadsheet size={14}/>Correct Feed Source</button>}</div><div className="mt-correction-control-card"><div className="label">Output / R-A-M</div><div className="value">{fmt(n(st.output))} / {fmt(ramQty)}</div><div className="mt-small">Good output plus rejection/missing/alter in selected department</div><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Correct Output / R-A-M</button></div><div className="mt-correction-control-card"><div className="label">Size clash repair</div><div className="value">Register</div><div className="mt-small">Detail/Edit now shows ledger-only sizes also, so old XL/M/L clashes can be corrected to zero even if not in master size set.</div><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Open Correction Grid</button></div></div></div>
    <SizeCumulativeEditor row={row} rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} stage={stage} initialField={c.open ? "output" : readyToIssue ? "issued" : "output"} source="wip_view_cell_day_entry" onSharedSave={onSharedSave} />
    <div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Open Register to edit this dept history</button><span className="mt-small" style={{marginLeft:8}}>Register opens filtered to this order/style/department; use Correct for audit-safe edits.</span></div>
    <details className="mt-fold" open={false}><summary>View feed history summary for {stageLabel(stage)}</summary><div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}>{stage === "cutting" ? <button className="mt-btn ghost" onClick={()=>onOpenStyle?.(row)}><Shirt size={14}/>Open Style Entry to edit cutting feed/order qty</button> : <button className="mt-btn ghost" onClick={()=>onOpenRegister?.(row, prevStageForFeed || stage, "Dept Issue Forward")}><FileSpreadsheet size={14}/>Open Register to correct feed source</button>}</div><SimpleTable title={`${stageLabel(stage)} feed history`} sub="Feed and output are shown separately so the wrong side can be corrected. Cutting feed is the style/order size breakup; downstream feed is previous department Issue Forward." rows={receivingRows} empty="No feed / issue history found yet." /></details>
    <details className="mt-fold" open={false}><summary>View {stageLabel(stage)} activity history summary</summary><div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Open Register to correct output / issue / R-A-M</button><span className="mt-small" style={{marginLeft:8}}>Corrections are netted here; raw positive/negative ledger rows stay in Register.</span></div><SimpleTable title={`${stageLabel(stage)} activity history`} sub="Clean history for users: Original entry + Correction = Final qty. Raw timestamps, sources and correction rows are hidden from this normal view." rows={outputHistoryRows} empty="No output / issue / R-A-M ledger history found for this department yet." /></details>
    <details className="mt-fold"><summary>View {stageLabel(stage)} size breakup</summary><SimpleTable title={`${stageLabel(stage)} size-wise open quantities`} sub="Only the selected/clicked department. Use this to see what is open by size before entering." rows={sizeRows} empty="No size rows." /></details>
    <details className="mt-fold"><summary>View full style detail / route / history</summary><div className="mt-section"><LazyStylePhoto row={row} large/><div className="mt-grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))", marginBottom:12}}><Kpi label="Overall Status" value={rs.status} note={rs.action} tone={rs.tone}/><Kpi label="Overall Owner" value={rs.owner} note={rs.support || "Primary owner"}/><Kpi label="Overall Open Qty" value={fmt(rs.qty)} note={`${rs.idle || 0} days idle`}/></div></div><SimpleTable title="Open buckets for selected department" sub="Owner chase items for this department." rows={buckets.map(b=>({ Status:b.status, Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open bucket for this department." /><div style={{height:12}}/><SimpleTable title="Full current status drilldown" sub="Full status logic across this style/component." rows={statusBreakdown(row).map(b=>({ Status:b.status, Stage:stageLabel(b.stage), Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open status bucket." /></details>
  </div></div>;
}


function ProductionFileReleaseModal({ row, source="", onClose, onSave }){
  const orderTotal = n(row?.order_qty);
  const existingCut = n(sdata(row,"cutting").output) + loss(sdata(row,"cutting"));
  const existingRelease = fileReleaseQty(row);
  const [qty,setQty] = useState(()=>String(existingRelease || existingCut || orderTotal || ""));
  const [date,setDate] = useState(()=>fileReleaseDate(row) || today());
  const [reason,setReason] = useState(()=>isProductionFileReleased(row) ? "Release correction / update" : "Production file released to Cutting");
  const [managerOverride,setManagerOverride] = useState(false);
  const cleanQty = n(qty);
  const toleranceQty = orderTotal ? Math.floor(orderTotal * (1 + cuttingToleranceFrac())) : 0;
  const previewRow = { ...(row || {}), file_released_qty:cleanQty, file_released_date:date };
  const releaseMap = fileReleaseSizeQtyMap(previewRow);
  const releaseTotal = qtyMapTotal(releaseMap);
  const overOrder = orderTotal > 0 && cleanQty > orderTotal;
  const overAllowed = orderTotal > 0 && cleanQty > orderTotal * (1 + cuttingToleranceFrac());
  const belowExisting = cleanQty > 0 && existingCut > cleanQty;
  const saveBlocked = !cleanQty || belowExisting || (overAllowed && !managerOverride);
  const fillOrder = () => { setQty(String(orderTotal || "")); setReason("Release qty autofilled from order qty"); };
  const fillCut = () => { setQty(String(existingCut || orderTotal || "")); setReason(existingCut ? "Release qty autofilled from existing cutting output" : "Release qty autofilled from order qty"); };
  const fillReleased = () => { setQty(String(existingRelease || orderTotal || "")); setReason("Release correction / update"); };
  return <div className="mt-update-backdrop no-print"><div className="mt-release-modal mt-release-modal-v42"><div className="head"><div><div style={{fontFamily:"'Archivo',sans-serif", fontWeight:800, fontSize:24}}>Release Production File to Cutting</div><div className="mt-sub">{row?.style_no} · {row?.order_no} · {row?.buyer} · {row?.colour} · {row?.component}</div></div><button className="mt-btn" onClick={onClose} title="Close"><X size={18}/></button></div>
    <div className="body">
      <div className="mt-release-help"><b>Meaning:</b> this is the Cutting feed/handover. For old styles, use <b>Use cut qty</b> if cutting is already entered, or <b>Use order qty</b> for normal release. It is not an issue-forward entry.</div>
      <div className="mt-release-kpis">
        <div><span>Order qty</span><b>{fmt(orderTotal)}</b></div>
        <div><span>Existing cut accounted</span><b>{fmt(existingCut)}</b></div>
        <div><span>Current release</span><b>{fmt(existingRelease)}</b></div>
        <div><span>Max normal release incl. tolerance</span><b>{fmt(toleranceQty || orderTotal)}</b></div>
      </div>
      <div className="mt-release-fastfill">
        <span className="mt-toolbar-label">Fast fill</span>
        <button className="mt-btn ghost" type="button" onClick={fillOrder}>Use order qty</button>
        <button className="mt-btn ghost" type="button" onClick={fillCut}>Use cut qty</button>
        {existingRelease ? <button className="mt-btn ghost" type="button" onClick={fillReleased}>Use current release</button> : null}
        <span className="mt-small">For old styles with cutting already done, use cut qty and save.</span>
      </div>
      <div className="mt-two">
        <div><label className="mt-small">Release qty</label><input className="mt-input mandatory mt-release-big-input" type="number" value={qty} onChange={e=>setQty(e.target.value)} /></div>
        <div><label className="mt-small">Release date</label><input className="mt-input mandatory mt-release-big-input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
      </div>
      <div><label className="mt-small">Reason / handover note</label><input className="mt-input mt-release-note-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Production file released to Cutting" /></div>
      <div className="mt-context-strip"><span className="mt-chip mt-muted">Order {fmt(orderTotal)}</span><span className={`mt-chip ${isProductionFileReleased(previewRow)?"mt-ok":"mt-warn"}`}>{fileReleaseStatusText(previewRow)}</span><span className="mt-chip mt-info">Generated size feed {fmt(releaseTotal)}</span>{overOrder && !overAllowed ? <span className="mt-chip mt-info">Over order, within tolerance</span> : null}{overAllowed ? <span className="mt-chip mt-late">Above tolerance</span> : null}{belowExisting ? <span className="mt-chip mt-late">Below existing cut output</span> : null}</div>
      {belowExisting ? <div className="mt-locked-note">Existing cutting accounted qty is {fmt(existingCut)}, which is above this release qty. Use cut qty or correct old cutting output/R/A/M first.</div> : null}
      {overAllowed ? <div className="mt-locked-note">Release qty is above order + configured cutting tolerance. This is normally blocked. Tick manager override only when this old style genuinely needs it.</div> : null}
      {overAllowed ? <label className="mt-check-row"><input type="checkbox" checked={managerOverride} onChange={e=>setManagerOverride(e.target.checked)} />Manager override for old style / approved over-release</label> : null}
      <div><h3 className="mt-panel-title">Released size feed preview</h3><div className="mt-panel-sub">Size split is derived from the style order size breakup and scaled to the release qty. For exact size changes, edit Style size breakup first, then release.</div><div className="mt-release-size-grid" style={{marginTop:8}}>{sizesFor(row).map(size=><div className="mt-release-size-cell" key={size}><b>{fmt(releaseMap[size])}</b><span>{size}</span></div>)}</div></div>
      <div className="mt-release-actions"><button className="mt-btn ghost" onClick={onClose}>Cancel</button><button className="mt-btn primary" disabled={saveBlocked} onClick={()=>onSave?.({ qty:cleanQty, date, reason, source, managerOverride })}><CheckCircle2 size={14}/>Save Release</button></div>
    </div></div></div>;
}

function sanitizePhotoName(text){
  return String(text || "style").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80) || "style";
}

async function compressImageFile(file, maxSide=900, quality=0.76){
  if (!file || !file.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Image is too large. Please use a photo below 12 MB before compression.");
  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve,reject)=>{
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read this image."));
      i.src = imgUrl;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width || maxSide, img.height || maxSide));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((img.width || maxSide) * scale));
    canvas.height = Math.max(1, Math.round((img.height || maxSide) * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve)=> canvas.toBlob(resolve, "image/webp", quality));
    return blob || file;
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function PhotoManager({ rows, setRows, clearTick=0 }){
  const [draft, setDraft] = useState({});
  const [folderDraft, setFolderDraft] = useState({});
  const [uploading, setUploading] = useState({});
  const [msg, setMsg] = useState("");
  useEffect(()=>{
    setDraft(Object.fromEntries(rows.map(r=>[r.id, r.photo_thumb_url || r.photo_url || ""])));
    setFolderDraft(Object.fromEntries(rows.map(r=>[r.id, r.photo_folder_url || ""])));
  }, [rows]);
  function setUrl(rowId, value){ setDraft(d=>({ ...d, [rowId]:value })); }
  function setFolder(rowId, value){ setFolderDraft(d=>({ ...d, [rowId]:value })); }
  async function uploadPhoto(row, file){
    if (!isSupabaseConfigured || !supabase) { setMsg("Supabase is not configured. Use direct photo URL for now."); return; }
    try {
      setUploading(u=>({ ...u, [row.id]:true }));
      setMsg("Compressing and uploading photo...");
      const blob = await compressImageFile(file);
      const path = `${sanitizePhotoName(row.order_no)}/${sanitizePhotoName(row.style_no)}-${sanitizePhotoName(row.colour)}-${sanitizePhotoName(row.component)}-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from("production-photos").upload(path, blob, { cacheControl:"31536000", upsert:true, contentType:"image/webp" });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("production-photos").getPublicUrl(path);
      const publicUrl = data?.publicUrl || "";
      if (!publicUrl) throw new Error("Upload finished but public URL was not returned.");
      setUrl(row.id, publicUrl);
      setRows(prev=>prev.map(r=>r.id===row.id ? ({ ...r, photo_url:publicUrl, photo_thumb_url:publicUrl }) : r));
      const result = await robustUpsertOrdersToSupabase([{ ...row, photo_url:publicUrl, photo_thumb_url:publicUrl, photo_folder_url:folderDraft[row.id] || row.photo_folder_url || "" }]);
      if (result?.error) throw result.error;
      setMsg(`Photo uploaded. Thumbnail will show in WIP/Planning/Review tables. ${supabaseSaveLabel(result)}`);
    } catch (e) {
      setMsg(e?.message || "Photo upload failed. Check Supabase Storage bucket/policies.");
    } finally {
      setUploading(u=>({ ...u, [row.id]:false }));
    }
  }
  async function save(){
    const nextRows = rows.map(r=>({ ...r, photo_url:draft[r.id] || "", photo_thumb_url:draft[r.id] || "", photo_folder_url:folderDraft[r.id] || "" }));
    setRows(prev=>prev.map(r=>Object.prototype.hasOwnProperty.call(draft, r.id) ? ({ ...r, photo_url:draft[r.id] || "", photo_thumb_url:draft[r.id] || "", photo_folder_url:folderDraft[r.id] || "" }) : r));
    setMsg("Photos saved locally. Seed/Pull will sync once Supabase columns exist.");
    if (hasValidSupabaseEnv()) {
      const result = await robustUpsertOrdersToSupabase(nextRows);
      setMsg(result.error ? result.error.message : `Photo thumbnail/folder URLs saved to Supabase. ${supabaseSaveLabel(result)}`);
    }
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style Photos</h3><div className="mt-panel-sub">Upload one style photo or paste a direct thumbnail URL. WIP/Planning/Review tables show tiny lazy-loaded thumbnails; detail drawer shows a larger preview.</div></div>
    <div className="mt-section"><div className="mt-speed-note"><b>Best workflow:</b> upload here → app compresses to WebP → saves to Supabase Storage bucket <code>production-photos</code> → writes <code>photo_url</code> and <code>photo_thumb_url</code>. Keep OneDrive only as optional folder/reference link.</div></div>
    <div className="mt-section no-print"><button className="mt-btn primary" onClick={save}><CheckCircle2 size={14}/>Save Photo URLs</button> {msg && <span className="mt-chip mt-info">{msg}</span>}</div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Preview</th><th>Upload Thumbnail</th><th>Photo / Thumb URL</th><th>OneDrive Folder URL</th><th>Usage</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div></td><td><LazyStylePhoto row={{...row, photo_url:draft[row.id], photo_thumb_url:draft[row.id]}}/></td><td><input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPhoto(row,f); e.target.value=""; }} disabled={!!uploading[row.id]} />{uploading[row.id] ? <div className="mt-small">Uploading...</div> : <div className="mt-small">Compressed before upload</div>}</td><td><input className="mt-input" style={{width:"min(520px,60vw)"}} value={draft[row.id] || ""} onChange={e=>setUrl(row.id,e.target.value)} placeholder="https://.../style-thumbnail.webp" /></td><td><input className="mt-input" style={{width:"min(420px,50vw)"}} value={folderDraft[row.id] || ""} onChange={e=>setFolder(row.id,e.target.value)} placeholder="Optional OneDrive folder/share link" /></td><td><span className="mt-chip mt-muted">Thumbnail in sheets</span> <span className="mt-chip mt-muted">Large in detail</span></td></tr>)}</tbody></table></div>
  </div>;
}


function styleCompositeKey(row){ return [row.order_no||"", row.style_no||"", row.colour||"", row.component||""].join("|::|").toLowerCase(); }
function ledgerRowMatchesStyle(x,row){
  return String(x.order_no || x.order || "") === String(row.order_no || "") &&
    String(x.style_no || x.style || "") === String(row.style_no || "") &&
    String(x.colour || "") === String(row.colour || "") &&
    String(x.component || "") === String(row.component || "");
}
function styleHasStageActivity(row){
  return routeFor(row).some(stage=>{
    const st = sdata(row, stage);
    return ["received","output","issued","reject","alter","missing"].some(k=>n(st[k])>0);
  });
}
function blankStagesForRoute(row){ return Object.fromEntries(routeFor(row).map(k=>[k, blankStage()])); }
function safeStagesForEditedRow(prevRow, draftRow){
  const next = {};
  routeFor(draftRow).forEach(k=>{ next[k] = { ...blankStage(), ...(prevRow?.stages?.[k] || {}) }; });
  return next;
}
async function upsertOneStyleToSupabase(row){
  return robustUpsertOrdersToSupabase([row]);
}
function styleNaturalKey(row){
  return {
    order_no: String(row?.order_no || "").trim(),
    style_no: String(row?.style_no || "").trim(),
    colour: String(row?.colour || "").trim(),
    component: String(row?.component || "").trim(),
  };
}
function applyStyleNaturalKeyFilter(query, row){
  const key = styleNaturalKey(row);
  if (!key.order_no || !key.style_no || !key.colour || !key.component) {
    return { query:null, error:{ message:"Delete needs Order No, Style No, Colour and Component." } };
  }
  return {
    query: query
      .eq("order_no", key.order_no)
      .eq("style_no", key.style_no)
      .eq("colour", key.colour)
      .eq("component", key.component),
    error:null
  };
}
function supabaseEnvBaseUrl(){
  const raw = String(import.meta.env?.VITE_SUPABASE_URL || "").trim();
  if (!raw) return "";
  try {
    // Always normalize to the project origin. This fixes common env mistakes such as
    // https://project.supabase.co/rest/v1 or /rest/v1/production_orders which make
    // supabase-js build an invalid request path.
    const u = new URL(raw);
    return u.origin.replace(/\/+$/, "");
  } catch {
    return raw.replace(/\/rest\/v1.*$/i, "").replace(/\/storage\/v1.*$/i, "").replace(/\/+$/, "");
  }
}
function supabaseEnvAnonKey(){ return String(import.meta.env?.VITE_SUPABASE_ANON_KEY || "").trim(); }
function hasValidSupabaseEnv(){
  try {
    const raw = supabaseEnvBaseUrl();
    if (!raw || !supabaseEnvAnonKey()) return false;
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}
function supabaseConfigWarning(){
  return "Supabase URL/key is missing or invalid. Use the project URL like https://xxxxx.supabase.co in VITE_SUPABASE_URL, not a copied REST path. Changes are saved in this browser fallback until Supabase is fixed.";
}
function urlEncodedEqQuery(key){
  return Object.entries(key).map(([k,v])=>`${encodeURIComponent(k)}=eq.${encodeURIComponent(String(v || ""))}`).join("&");
}
function missingSchemaColumnName(err){
  const msg = String(err?.message || err || "");
  return msg.match(/Could not find the '([^']+)' column/i)?.[1] ||
    msg.match(/column ["']?([a-zA-Z0-9_]+)["']? .*schema cache/i)?.[1] ||
    "";
}
function removeColumnFromPayloadRows(payloadRows, column){
  const rows = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  return rows.map(row=>{ const next = { ...row }; delete next[column]; return next; });
}
async function retrySchemaSafeSupabaseUpsert(table, payloadRows, onConflict, maxRetries=8){
  if (!isSupabaseConfigured || !supabase) return { error:{ message:"Supabase client unavailable" } };
  let payload = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  const removed = [];
  for (let i=0; i<=maxRetries; i++){
    const { error } = await supabase.from(table).upsert(payload, { onConflict });
    if (!error) return { error:null, via:"supabase-js", savedCount:payload.length, removedColumns:removed };
    const col = missingSchemaColumnName(error);
    if (!col || removed.includes(col)) return { error, removedColumns:removed };
    removed.push(col);
    payload = removeColumnFromPayloadRows(payload, col);
  }
  return { error:{ message:`Supabase save failed after removing schema-missing columns: ${removed.join(", ")}` }, removedColumns:removed };
}

async function retrySchemaSafeSupabaseInsert(table, payloadRows, maxRetries=8){
  if (!isSupabaseConfigured || !supabase) return { error:{ message:"Supabase client unavailable" } };
  let payload = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  const removed = [];
  for (let i=0; i<=maxRetries; i++){
    const { error } = await supabase.from(table).insert(payload);
    if (!error) return { error:null, via:"supabase-js", savedCount:payload.length, removedColumns:removed };
    const col = missingSchemaColumnName(error);
    if (!col || removed.includes(col)) return { error, removedColumns:removed };
    removed.push(col);
    payload = removeColumnFromPayloadRows(payload, col);
  }
  return { error:{ message:`Supabase insert failed after removing schema-missing columns: ${removed.join(", ")}` }, removedColumns:removed };
}
async function fetchRestInsertToSupabase(table, payloadRows){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  let rows = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  if (!rows.length) return { error:null, via:"rest", savedCount:0 };
  const removed = [];
  const url = `${base}/rest/v1/${encodeURIComponent(table)}`;
  for (let attempt=0; attempt<8; attempt++){
    try {
      const res = await fetch(url, {
        method:"POST",
        headers:{ apikey:anon, Authorization:`Bearer ${anon}`, "Content-Type":"application/json", Prefer:"return=minimal" },
        body:JSON.stringify(rows)
      });
      if (res.ok) return { error:null, via:"rest", savedCount:rows.length, removedColumns:removed };
      const text = await res.text().catch(()=>"");
      const col = missingSchemaColumnName({ message:text });
      if (col && !removed.includes(col)) {
        removed.push(col);
        rows = removeColumnFromPayloadRows(rows, col);
        continue;
      }
      return { error:{ message:text || `REST insert HTTP ${res.status}` }, removedColumns:removed };
    } catch (e) {
      return { error:{ message:e?.message || String(e) }, removedColumns:removed };
    }
  }
  return { error:{ message:`REST insert failed after removing schema-missing columns: ${removed.join(", ")}` }, removedColumns:removed };
}
async function robustInsertEntriesToSupabase(payloadRows){
  if (!hasValidSupabaseEnv()) return { skipped:true, warning:supabaseConfigWarning() };
  let firstError = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const result = await retrySchemaSafeSupabaseInsert("production_entries", payloadRows);
      if (!result.error) return result;
      firstError = result.error;
    } catch (e) {
      firstError = { message:e?.message || String(e) };
    }
  }
  const fallback = await fetchRestInsertToSupabase("production_entries", payloadRows);
  if (!fallback?.error) return { ...fallback, recoveredFrom:firstError?.message || "Supabase client was unavailable" };
  return { error:{ message:`${firstError?.message || "Supabase client entry insert failed"}; REST fallback also failed: ${fallback.error.message}` } };
}

function isDuplicatePrimaryKeyError(text){
  const msg = String(text || "").toLowerCase();
  return msg.includes("duplicate key value") && (msg.includes("_pkey") || msg.includes("primary key") || msg.includes("production_orders_pkey"));
}
async function fetchRestUpsertToSupabase(table, payloadRows, onConflict){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  let rows = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  if (!rows.length) return { error:null, via:"rest", savedCount:0 };
  const removed = [];
  const postRows = async (conflictTarget, postRowsPayload) => {
    const url = `${base}/rest/v1/${encodeURIComponent(table)}?on_conflict=${encodeURIComponent(conflictTarget)}`;
    return fetch(url, {
      method:"POST",
      headers:{
        apikey:anon,
        Authorization:`Bearer ${anon}`,
        "Content-Type":"application/json",
        Prefer:"resolution=merge-duplicates,return=minimal"
      },
      body:JSON.stringify(postRowsPayload)
    });
  };
  for (let attempt=0; attempt<8; attempt++){
    try {
      const res = await postRows(onConflict, rows);
      if (res.ok) return { error:null, via:"rest", savedCount:rows.length, removedColumns:removed, onConflict };
      const text = await res.text().catch(()=>"");
      if (isDuplicatePrimaryKeyError(text) && onConflict !== "id" && rows.every(r=>r && r.id)) {
        const byId = await postRows("id", rows);
        if (byId.ok) return { error:null, via:"rest", savedCount:rows.length, removedColumns:removed, onConflict:"id", recoveredFrom:text };
        const byIdText = await byId.text().catch(()=>"");
        return { error:{ message:`Primary-key recovery also failed: ${byIdText || `REST upsert HTTP ${byId.status}`}. Original: ${text}` }, removedColumns:removed };
      }
      const col = missingSchemaColumnName({ message:text });
      if (col && !removed.includes(col)) {
        removed.push(col);
        rows = removeColumnFromPayloadRows(rows, col);
        continue;
      }
      return { error:{ message:text || `REST upsert HTTP ${res.status}` }, removedColumns:removed };
    } catch (e) {
      return { error:{ message:e?.message || String(e) }, removedColumns:removed };
    }
  }
  return { error:{ message:`REST save failed after removing schema-missing columns: ${removed.join(", ")}` }, removedColumns:removed };
}
async function robustUpsertOrdersToSupabase(rows){
  if (!hasValidSupabaseEnv()) return { skipped:true, warning:supabaseConfigWarning() };
  const payload = (Array.isArray(rows) ? rows : [rows]).map(orderToSupabase);
  let firstError = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const result = await retrySchemaSafeSupabaseUpsert("production_orders", payload, "order_no,style_no,colour,component");
      if (!result.error) return result;
      firstError = result.error;
    } catch (e) {
      firstError = { message:e?.message || String(e) };
    }
  }
  const fallback = await fetchRestUpsertToSupabase("production_orders", payload, "order_no,style_no,colour,component");
  if (!fallback?.error) return { ...fallback, recoveredFrom:firstError?.message || "Supabase client was unavailable" };
  return { error:{ message:`${firstError?.message || "Supabase client save failed"}; REST fallback also failed: ${fallback.error.message}` } };
}
function supabaseSaveLabel(result){
  const stripped = result?.removedColumns?.length ? ` Schema-safe save: skipped non-table columns ${result.removedColumns.join(", ")}.` : "";
  if (result?.via === "rest") return `Saved to Supabase via REST fallback.${stripped}`;
  if (result?.via === "supabase-js") return `Saved to Supabase.${stripped}`;
  return `Saved to Supabase.${stripped}`;
}
function shortRecoveredSupabaseNote(text){
  if (!text) return "";
  const msg = String(text || "");
  if (msg.includes("null value in column \"id\"")) return " Supabase client had an id compatibility issue; REST fallback saved it.";
  if (msg.includes("Invalid path specified")) return " Supabase client path failed; REST fallback saved it.";
  if (msg.length > 160) return " Supabase client failed first; REST fallback saved it.";
  return ` Recovered from: ${msg}`;
}
async function fetchRestSelectFromSupabase(table, query="select=*&limit=1"){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  const joiner = query ? `?${query}` : "";
  try {
    const res = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}${joiner}`, { headers:{ apikey:anon, Authorization:`Bearer ${anon}` } });
    const text = await res.text().catch(()=>"");
    if (!res.ok) return { error:{ message:text || `REST select HTTP ${res.status}` } };
    return { error:null, data:text ? JSON.parse(text) : [], via:"rest" };
  } catch (e) {
    return { error:{ message:e?.message || String(e) } };
  }
}
async function fetchRestDeleteFromSupabase(table, query){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  try {
    const res = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}?${query}`, { method:"DELETE", headers:{ apikey:anon, Authorization:`Bearer ${anon}`, Prefer:"return=minimal" } });
    if (!res.ok) { const text = await res.text().catch(()=>""); return { error:{ message:text || `REST delete HTTP ${res.status}` } }; }
    return { error:null, via:"rest", deleted:true };
  } catch(e) { return { error:{ message:e?.message || String(e) } }; }
}

async function fetchRestSelectByNaturalKey(table, row){
  const key = styleNaturalKey(row);
  if (!key.order_no || !key.style_no || !key.colour || !key.component) return { error:{ message:"Select needs Order No, Style No, Colour and Component." } };
  return fetchRestSelectFromSupabase(table, `${urlEncodedEqQuery(key)}&select=order_no,style_no,colour,component&limit=1`);
}
async function fetchDeleteByNaturalKey(table, row){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  const key = styleNaturalKey(row);
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  if (!key.order_no || !key.style_no || !key.colour || !key.component) return { error:{ message:"Delete needs Order No, Style No, Colour and Component." } };
  const url = `${base}/rest/v1/${encodeURIComponent(table)}?${urlEncodedEqQuery(key)}`;
  try {
    const res = await fetch(url, { method:"DELETE", headers:{ apikey:anon, Authorization:`Bearer ${anon}`, Prefer:"return=minimal" } });
    if (!res.ok) {
      let text = await res.text().catch(()=>"");
      return { error:{ message:text || `HTTP ${res.status}` } };
    }
    return { error:null, via:"rest" };
  } catch (e) {
    return { error:{ message:e?.message || String(e) } };
  }
}
async function verifyNaturalKeyAbsent(table, row){
  let readError = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const scoped = applyStyleNaturalKeyFilter(supabase.from(table).select("order_no,style_no,colour,component").limit(1), row);
      if (!scoped.error) {
        const { data, error } = await scoped.query;
        if (!error) return { verified:true, found:(data || []).length > 0, via:"supabase-js" };
        readError = error;
      }
    } catch (e) { readError = { message:e?.message || String(e) }; }
  }
  const rest = await fetchRestSelectByNaturalKey(table, row);
  if (rest.error) return { verified:false, found:null, error:rest.error, recoveredFrom:readError?.message };
  return { verified:true, found:(rest.data || []).length > 0, via:"rest", recoveredFrom:readError?.message };
}
async function robustDeleteByNaturalKey(table, row){
  if (!hasValidSupabaseEnv()) return { skipped:true, warning:supabaseConfigWarning() };
  let firstError = null;
  let via = "rest";
  if (isSupabaseConfigured && supabase) {
    try {
      const scoped = applyStyleNaturalKeyFilter(supabase.from(table).delete(), row);
      if (scoped.error) return { error:scoped.error };
      const { error } = await scoped.query;
      if (!error) via = "supabase-js";
      else firstError = error;
    } catch (e) { firstError = { message:e?.message || String(e) }; }
  } else {
    firstError = { message:"Supabase client unavailable" };
  }
  if (firstError) {
    const fallback = await fetchDeleteByNaturalKey(table, row);
    if (fallback?.error) return { error:{ message:`${firstError.message}; REST delete fallback also failed: ${fallback.error.message}` } };
    via = fallback?.via || "rest";
  }
  const verify = await verifyNaturalKeyAbsent(table, row);
  if (verify.verified && verify.found) return { error:{ message:`Delete request finished but row still exists in ${table}. Check RLS/delete policy or natural key.` }, via, verified:false };
  if (verify.error) return { error:null, via, verified:false, warning:`Delete sent, but verification read failed: ${verify.error.message}` };
  return { error:null, via, verified:true };
}
async function deleteOneStyleFromSupabase(row){
  return robustDeleteByNaturalKey("production_orders", row);
}
async function deleteStyleLedgerFromSupabase(row){
  return robustDeleteByNaturalKey("production_entries", row);
}
async function runSupabaseSmokeTest(){
  if (!hasValidSupabaseEnv()) return { tone:"warn", text:supabaseConfigWarning() };
  const parts = [];
  const ordersRead = await fetchRestSelectFromSupabase("production_orders", "select=order_no,style_no,colour,component&limit=1");
  if (ordersRead.error) return { tone:"late", text:`Supabase check failed: production_orders read failed — ${ordersRead.error.message}` };
  parts.push("production_orders read OK");
  const entriesRead = await fetchRestSelectFromSupabase("production_entries", "select=order_no,style_no,colour,component,entry_date&limit=1");
  if (entriesRead.error) parts.push(`production_entries read warning: ${entriesRead.error.message}`);
  else parts.push("production_entries read OK");
  const testRow = { id:"supabase_connection_test", order_no:"__SUPABASE_TEST__", style_no:"CONNECTION_TEST", buyer:"SYSTEM", colour:"TEST", component:"TEST", order_qty:1, size_set:"alpha", set_id:"", print_required:false, embroidery_required:false, route:["cutting","stitching","checking","packing","dispatch"], stages:{ cutting:blankStage(), stitching:blankStage(), checking:blankStage(), packing:blankStage(), dispatch:blankStage() } };
  const up = await robustUpsertOrdersToSupabase([testRow]);
  if (up.error) return { tone:"late", text:`Supabase check failed: test upsert failed — ${up.error.message}` };
  parts.push(`test style upsert OK (${up.via || "saved"})`);
  const readBack = await fetchRestSelectByNaturalKey("production_orders", testRow);
  if (readBack.error) return { tone:"late", text:`Supabase check failed: test read-back failed — ${readBack.error.message}` };
  if (!(readBack.data || []).length) return { tone:"late", text:"Supabase check failed: test row did not read back after save." };
  parts.push("test read-back OK");
  const del = await robustDeleteByNaturalKey("production_orders", testRow);
  if (del.error) return { tone:"late", text:`Supabase check failed: test delete failed — ${del.error.message}` };
  parts.push(`test delete ${del.verified ? "verified OK" : "sent but not verified"}${del.via ? ` (${del.via})` : ""}`);
  return { tone:del.verified ? "ok" : "warn", text:`Supabase connection audit complete: ${parts.join(" · ")}.${del.warning ? " " + del.warning : ""}` };
}

function excelValue(raw, aliases){
  const map = {};
  Object.entries(raw || {}).forEach(([k,v])=>{
    const key = String(k || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    map[key] = v;
  });
  for (const alias of aliases) {
    const key = String(alias || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const mappedVal = map[key] ?? "";
      if (String(mappedVal).trim() !== "") return mappedVal;
    }
  }
  return "";
}
function parseExcelBool(v){
  const s = String(v ?? "").trim().toLowerCase();
  if (["yes","y","true","1","required","req","print","emb","embroidery"].includes(s)) return true;
  if (["no","n","false","0","not required","none","skip"].includes(s)) return false;
  return !!v && s !== "";
}
function parseSizeQtyText(text){
  const out = {};
  String(text || "").split(/[,;|]+/).forEach(part=>{
    const bits = part.split(/[=:]/);
    if (bits.length < 2) return;
    const size = cleanSizeToken(bits[0]);
    const qty = n(bits.slice(1).join(":").replace(/[^0-9.-]/g,""));
    if (size) out[size] = Math.max(0, qty);
  });
  return out;
}
function excelSizeValue(raw, size){
  return excelValue(raw, sizeKeyAliases(size));
}
function extractOrderSizeQtyFromExcel(raw, sizeSet, existing){
  const sizes = getSizeSets()[sizeSet] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
  const fromText = parseSizeQtyText(excelValue(raw, ["Order Size Breakup", "Size Breakup", "Size Qty", "Size Qty Breakup", "Order Sizes"]));
  const out = {};
  let found = false;
  sizes.forEach(size=>{
    const direct = excelSizeValue(raw, size);
    const val = direct !== "" ? direct : fromText[size];
    if (val !== undefined && val !== "") { out[size] = Math.max(0,n(val)); found = true; }
  });
  if (found) return normalizeSizeQtyMap(out, sizes);
  return normalizeSizeQtyMap(existing?.order_size_qty || {}, sizes);
}
function normalizeSizeSetName(v){
  const sets = getSizeSets();
  const s = normalizeSizeGroupKey(v || "alpha");
  if (sets[s]) return s;
  if (s.includes("infant") || s.includes("junior") || s.includes("older_kid")) return sets.infants ? "infants" : "kids";
  if (s.includes("baby") || s.includes("month") || s.includes("months")) return sets.baby ? "baby" : "kids";
  if (s.includes("kid") || s.includes("child")) return "kids";
  if (s.includes("waist") || s.includes("pant") || s.includes("trouser")) return "waist";
  return "alpha";
}
function excelHasSizeColumn(raw, size){
  const aliases = sizeKeyAliases(size);
  const keys = Object.keys(raw || {}).map(k=>normalizedLooseKey(k));
  return aliases.some(alias=>keys.includes(normalizedLooseKey(alias)));
}
function excelSizeNumericValue(raw, size){
  const val = excelSizeValue(raw, size);
  if (val === "" || val === undefined || val === null) return 0;
  return Math.max(0, n(val));
}
function sizeSetSignalFromExcel(raw, sizes){
  return (sizes || []).reduce((acc,size)=>{
    const qty = excelSizeNumericValue(raw, size);
    if (qty > 0) { acc.count += 1; acc.total += qty; acc.parts.push(`${size} ${fmt(qty)}`); }
    return acc;
  }, { count:0, total:0, parts:[] });
}
function inferSizeSetFromExcel(raw, fallback="alpha", orderQty=0){
  // IMPORTANT: infer from filled size values, not from template headers.
  // Templates contain Size XS/S/M... plus kids/infant columns; header presence alone was causing alpha to be updated by mistake.
  const sets = getSizeSets();
  const fb = normalizeSizeSetName(fallback);
  let best = { key:fb, count:0, total:0, score:0, parts:[] };
  Object.entries(sets).forEach(([key,sizes])=>{
    const sig = sizeSetSignalFromExcel(raw, sizes);
    if (!sig.count) return;
    const oq = n(orderQty);
    const exactBonus = oq && Math.abs(sig.total - oq) <= Math.max(1, oq * 0.015) ? 100 : 0;
    const nearBonus = oq && Math.abs(sig.total - oq) <= Math.max(3, oq * 0.05) ? 25 : 0;
    const fallbackBonus = key === fb ? 6 : 0;
    const alphaPenalty = key === "alpha" ? 4 : 0;
    const score = exactBonus + nearBonus + sig.count * 10 + fallbackBonus - alphaPenalty;
    if (score > best.score) best = { key, count:sig.count, total:sig.total, score, parts:sig.parts };
  });
  return best.score > 0 ? best.key : fb;
}
function sizeSetInferenceLabel(raw, sizeSet, orderQty){
  const sizes = getSizeSets()[sizeSet] || [];
  const sig = sizeSetSignalFromExcel(raw, sizes);
  return `${sizeSet} · ${sig.count} sizes · total ${fmt(sig.total)} / order ${fmt(orderQty)}`;
}
function styleFromExcelRow(raw, existing){
  const order_no = String(excelValue(raw,["Order No","Order","PO","SO","Order Number"]) || existing?.order_no || "").trim().toUpperCase();
  const style_no = String(excelValue(raw,["Style No","Style","Style Number","Style Code"]) || existing?.style_no || "").trim().toUpperCase();
  const buyer = String(excelValue(raw,["Buyer","Brand","Buyer / Brand","Customer"]) || existing?.buyer || "").trim().toUpperCase();
  const colour = String(excelValue(raw,["Colour","Color"]) || existing?.colour || "").trim().toUpperCase();
  const component = String(excelValue(raw,["Component","Garment","Part"]) || existing?.component || "").trim().toUpperCase();
  const oq = excelValue(raw,["Order Qty","Qty","Quantity","Order Quantity"]);
  const oqNum = oq === "" ? n(existing?.order_qty) : n(oq);
  const sizeSet = excelValue(raw,["Size Set","SizeSet","Sizes"]);
  const sizeSetNorm = sizeSet === "" ? inferSizeSetFromExcel(raw, existing?.size_set || "alpha", oqNum) : normalizeSizeSetName(sizeSet);
  const ratioVal = String(excelValue(raw,["Size Ratio","Ratio","Size Ratio Pattern","Order Ratio"]) || existing?.size_ratio || "").trim().toUpperCase();
  let orderSizeQty = extractOrderSizeQtyFromExcel(raw, sizeSetNorm, existing);
  const ratioApply = ratioVal ? distributeByRatio(oqNum, getSizeSets()[sizeSetNorm] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha, ratioVal) : null;
  if (ratioApply && !ratioApply.error) orderSizeQty = normalizeSizeQtyMap(ratioApply.qty, getSizeSets()[sizeSetNorm] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha);
  const orderSizeTotal = qtyMapTotal(orderSizeQty);
  const line = excelValue(raw,["Planning Line Override","Default Line","Line","Stitching Line"]);
  const printVal = excelValue(raw,["Print Required","Print","Printing"]);
  const embVal = excelValue(raw,["Embroidery Required","Embroidery","Emb"]);
  const rejectDispatchVal = excelValue(raw,["Allow Rejection Dispatch","Rejection Dispatch","Reject Dispatch","Approved Rejection Dispatch"]);
  const photo = excelValue(raw,["Photo URL","Photo","Thumbnail URL","Photo Thumb URL"]);
  const folder = excelValue(raw,["OneDrive Folder URL","Folder URL","Photo Folder URL","OneDrive URL"]);
  return {
    ...(existing || {}),
    order_no, style_no, buyer, colour, component,
    order_qty: oqNum,
    order_size_qty: orderSizeQty,
    size_set: sizeSetNorm,
    size_ratio: ratioVal,
    set_id: String(excelValue(raw,["Set ID","Set","SetId"]) || existing?.set_id || "").trim().toUpperCase(),
    line: String(line || existing?.line || "").trim(),
    print_required: printVal === "" ? !!existing?.print_required : parseExcelBool(printVal),
    embroidery_required: embVal === "" ? !!existing?.embroidery_required : parseExcelBool(embVal),
    dispatch_reject_allowed: rejectDispatchVal === "" ? !!existing?.dispatch_reject_allowed : parseExcelBool(rejectDispatchVal),
    priority: String(excelValue(raw,["Priority"]) || existing?.priority || "Normal").trim() || "Normal",
    difficulty: String(excelValue(raw,["Difficulty"]) || existing?.difficulty || "Normal").trim() || "Normal",
    photo_url: String(photo || existing?.photo_url || "").trim(),
    photo_thumb_url: String(photo || existing?.photo_thumb_url || existing?.photo_url || "").trim(),
    photo_folder_url: String(folder || existing?.photo_folder_url || "").trim(),
  };
}
function styleExcelAction(raw){
  return String(excelValue(raw,["Action","Mode","Operation"]) || "ADD_UPDATE").trim().toUpperCase().replace(/\s+/g,"_");
}

function sizeBreakupSummary(row, sizeSetOverride){
  const sizeSet = sizeSetOverride || row?.size_set || "alpha";
  const sizes = getSizeSets()[sizeSet] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
  const map = normalizeSizeQtyMap(row?.order_size_qty || {}, sizes);
  const parts = sizes.map(sz=>`${sz} ${fmt(map[sz]||0)}`);
  return parts.join(" · ");
}
function bulkValueText(v){
  if (v === undefined || v === null || v === "") return "blank";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
function boolDiffLabel(v){ return v ? "Yes" : "No"; }
function bulkStyleDiffItems(existing, clean){
  if (!existing) return [
    { label:"New style", old:"—", next:naturalKeyLabel(clean) },
    { label:"Size set", old:"—", next:`${clean.size_set} (${sizeBreakupSummary(clean)})` },
    { label:"Order Qty", old:"—", next:fmt(clean.order_qty) },
  ];
  const out = [];
  const checks = [
    ["Buyer", existing.buyer, clean.buyer],
    ["Order Qty", fmt(existing.order_qty), fmt(clean.order_qty)],
    ["Size set", existing.size_set || "alpha", clean.size_set || "alpha"],
    ["Size ratio", existing.size_ratio || "", clean.size_ratio || ""],
    ["Print required", boolDiffLabel(!!existing.print_required), boolDiffLabel(!!clean.print_required)],
    ["Embroidery required", boolDiffLabel(!!existing.embroidery_required), boolDiffLabel(!!clean.embroidery_required)],
    ["Priority", existing.priority || "Normal", clean.priority || "Normal"],
    ["Photo URL", existing.photo_url || existing.photo_thumb_url || "", clean.photo_url || clean.photo_thumb_url || ""],
  ];
  checks.forEach(([label,oldv,nextv])=>{ if (String(oldv||"") !== String(nextv||"")) out.push({ label, old:bulkValueText(oldv), next:bulkValueText(nextv) }); });
  const oldSizes = sizeBreakupSummary(existing, existing.size_set || clean.size_set);
  const newSizes = sizeBreakupSummary(clean, clean.size_set);
  if (oldSizes !== newSizes) out.push({ label:"Size breakup", old:oldSizes, next:newSizes });
  return out.length ? out : [{ label:"No visible change", old:"same", next:"same" }];
}
function bulkPreviewTone(record){
  if (record.errors?.length) return "late";
  if (record.warnings?.length) return "warn";
  if (record.action === "DELETE") return "late";
  if (record.kind === "ADD") return "ok";
  return "info";
}
function bulkPreviewClass(record){
  const tone = bulkPreviewTone(record);
  return tone === "late" ? "error" : tone === "warn" ? "warn" : "";
}

function styleTemplateRows(){
  const allSizes = Array.from(new Set(Object.values(getSizeSets()).flat())).slice(0,40);
  const blankSizeCols = Object.fromEntries(allSizes.map(size=>[`Size ${size}`, ""]));
  return [
    { Action:"ADD_UPDATE", "Order No":"SO/25-26/100", "Style No":"STYLE-001", Buyer:"VMM", Colour:"BLACK", Component:"TOP", "Order Qty":1200, "File Released Qty":1200, "File Released Date":"", "Set Piece Count":"", "Size Set":"alpha", "Size Ratio":"1:2:3:3:2:1", ...blankSizeCols, "Size XS":100, "Size S":200, "Size M":300, "Size L":300, "Size XL":200, "Size XXL":100, "Set ID":"", "Planning Line Override":"", "Print Required":"No", "Embroidery Required":"No", Priority:"Normal", Difficulty:"Normal", "Photo URL":"", "OneDrive Folder URL":"" },
    { Action:"ADD_UPDATE", "Order No":"SO/25-26/101", "Style No":"KIDS-001", Buyer:"HOPSCOTCH", Colour:"PINK", Component:"TOP", "Order Qty":400, "File Released Qty":400, "File Released Date":"", "Set Piece Count":"", "Size Set":"kids", "Size Ratio":"1:1:1:1:1:0", ...blankSizeCols, "Size 2-3Y":80, "Size 3-4Y":80, "Size 4-5Y":80, "Size 5-6Y":80, "Size 7-8Y":80, "Order Size Breakup":"", "Set ID":"", "Planning Line Override":"", "Print Required":"No", "Embroidery Required":"Yes", Priority:"Normal", Difficulty:"Normal", "Photo URL":"", "OneDrive Folder URL":"" },
    { Action:"HARD_DELETE", "Order No":"SO/25-26/OLD", "Style No":"WRONG-STYLE", Buyer:"", Colour:"BLACK", Component:"TOP", "Order Qty":"", "File Released Qty":"", "File Released Date":"", "Set Piece Count":"", "Size Set":"", "Size Ratio":"", ...blankSizeCols, "Order Size Breakup":"", "Set ID":"", "Planning Line Override":"", "Print Required":"", "Embroidery Required":"", Priority:"", Difficulty:"", "Photo URL":"", "OneDrive Folder URL":"" },
  ];
}

function StyleManager({ rows, allRows, setRows, ledger, setLedger, focus, clearTick=0, onRelease, onSharedSave }){
  const emptyForm = {
    id:"", order_no:"", style_no:"", buyer:"", colour:"", component:"", set_components:"", set_piece_count:"", order_qty:"", file_released_qty:"", file_released_date:"", order_size_qty:{}, size_set:"alpha", size_ratio:"", set_id:"", line:"", dispatch_reject_allowed:false,
    print_required:false, embroidery_required:false, priority:"Normal", difficulty:"Normal", photo_url:"", photo_folder_url:""
  };
  const [form,setForm] = useState(emptyForm);
  const [q,setQ] = useState("");
  const [msg,setMsg] = useState(null);
  const [busy,setBusy] = useState(false);
  const [bulkMsg,setBulkMsg] = useState(null);
  const [bulkReview,setBulkReview] = useState(null);
  const [allowHardDelete,setAllowHardDelete] = useState(true);
  useEffect(()=>{ if (!clearTick) return; setQ(""); }, [clearTick]);
  const editing = !!form.id;
  const tableRows = (rows||[]).filter(row=>{
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [row.order_no,row.style_no,row.buyer,row.colour,row.component,row.set_id].join(" ").toLowerCase().includes(s);
  });
  const formSizes = getSizeSets()[form.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
  const formOrderSizeQty = normalizeSizeQtyMap(form.order_size_qty || {}, formSizes);
  const formSizeTotal = qtyMapTotal(formOrderSizeQty);
  const formSizeVariance = sizeVarianceInfo(form.order_qty, formOrderSizeQty);
  const duplicateSetId = form.set_id ? (allRows||[]).find(r=>String(r.set_id||"").toUpperCase()===String(form.set_id||"").toUpperCase() && String(r.id)!==String(form.id) && (String(r.order_no||"").toUpperCase()!==String(form.order_no||"").toUpperCase() || String(r.style_no||"").toUpperCase()!==String(form.style_no||"").toUpperCase())) : null;
  function setField(k,v){
    setForm(f=>{
      if (k === "size_set") {
        const nextSizes = getSizeSets()[v] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
        return { ...f, size_set:v, order_size_qty:normalizeSizeQtyMap(f.order_size_qty || {}, nextSizes) };
      }
      return { ...f, [k]:v };
    });
  }
  function setOrderSizeQty(size, value){
    setForm(f=>{
      const next = { ...(f.order_size_qty || {}), [size]:String(value).replace(/[^0-9]/g,"") };
      return { ...f, order_size_qty:next };
    });
  }
  function distributeFormOrderQty(){ setForm(f=>({ ...f, order_size_qty:distribute(n(f.order_qty), getSizeSets()[f.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha) })); }
  function clearFormOrderSizes(){ setForm(f=>({ ...f, order_size_qty:{} })); }
  function applyFormSizeRatio(){
    setForm(f=>{
      const sizes = getSizeSets()[f.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
      const result = distributeByRatio(n(f.order_qty), sizes, f.size_ratio);
      if (result.error) { setMsg({ tone:"late", text:result.error }); return f; }
      setMsg({ tone:"ok", text:`Applied size ratio ${ratioSummaryText(f.size_ratio, sizes)} to order qty ${fmt(f.order_qty)}.` });
      return { ...f, order_size_qty:result.qty };
    });
  }
  function useCurrentSizesAsRatio(){
    setForm(f=>{
      const sizes = getSizeSets()[f.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha;
      const ratio = ratioTextFromSizeQty(f.order_size_qty || {}, sizes);
      if (!ratio) { setMsg({ tone:"warn", text:"Enter size quantities first, then use them as ratio." }); return f; }
      setMsg({ tone:"ok", text:`Size ratio set from current breakup: ${ratio}.` });
      return { ...f, size_ratio:ratio };
    });
  }
  function edit(row){
    setForm({
      id:row.id || "", order_no:row.order_no || "", style_no:row.style_no || "", buyer:row.buyer || "", colour:row.colour || "", component:row.component || "", order_qty:String(n(row.order_qty)||""), file_released_qty:String(n(row.file_released_qty || row.production_file_released_qty || row.cutting_file_released_qty)||""), file_released_date:row.file_released_date || row.production_file_released_date || row.cutting_file_released_date || "", set_piece_count:row.set_piece_count || "",
      order_size_qty:normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row)),
      size_set:row.size_set || "alpha", size_ratio:row.size_ratio || "", set_id:row.set_id || "", line:row.line || "",
      print_required:!!row.print_required, embroidery_required:!!row.embroidery_required, priority:row.priority || "Normal", difficulty:row.difficulty || "Normal",
      photo_url:row.photo_url || row.photo_thumb_url || "", photo_folder_url:row.photo_folder_url || "",
      set_components: row.set_id ? (allRows||[]).filter(r=>String(r.set_id||"").toUpperCase()===String(row.set_id||"").toUpperCase() && String(r.order_no||"").toUpperCase()===String(row.order_no||"").toUpperCase() && String(r.style_no||"").toUpperCase()===String(row.style_no||"").toUpperCase() && String(r.colour||"").toUpperCase()===String(row.colour||"").toUpperCase()).map(r=>r.component).filter(Boolean).join(", ") : ""
    });
    setMsg({ tone:"info", text:`Editing ${row.style_no} · ${row.colour} · ${row.component}` });
    window.scrollTo({ top:0, behavior:"smooth" });
  }
  useEffect(()=>{
    if (!focus) return;
    const target = (allRows || rows || []).find(r=>String(r.id)===String(focus.id || "") || styleCompositeKey(r)===String(focus.key || ""));
    if (target) edit(target);
  }, [focus?.ts]);
  function reset(){ setForm(emptyForm); setMsg(null); }
  async function save(){
    const permission = requireCurrentPermission("production.edit_styles", "add/edit production styles");
    if (permission) { setMsg({ tone:"late", text:permission.error.message }); return; }
    const cleanSizeQty = normalizeSizeQtyMap(form.order_size_qty || {}, formSizes);
    const cleanSizeTotal = qtyMapTotal(cleanSizeQty);
    const clean = {
      ...form,
      order_no:String(form.order_no||"").trim().toUpperCase(),
      style_no:String(form.style_no||"").trim().toUpperCase(),
      buyer:String(form.buyer||"").trim().toUpperCase(),
      colour:String(form.colour||"").trim().toUpperCase(),
      component:String(form.component||"").trim().toUpperCase(),
      set_id:String(form.set_id||"").trim().toUpperCase(),
      size_ratio:String(form.size_ratio||"").trim().toUpperCase(),
      line:String(form.line||"").trim(),
      order_qty:n(form.order_qty),
      file_released_qty:n(form.file_released_qty),
      file_released_date:String(form.file_released_date||"").trim(),
      set_piece_count:n(form.set_piece_count),
      order_size_qty:cleanSizeQty,
      photo_thumb_url:form.photo_url || ""
    };
    if (!clean.order_no || !clean.style_no || !clean.buyer || !clean.colour || !clean.component || !clean.order_qty) { setMsg({ tone:"late", text:"Order, style, buyer, colour, component and order qty are mandatory." }); return; }
    const variance = sizeVarianceInfo(clean.order_qty, cleanSizeQty);
    if (variance.diff !== 0) {
      const ok = window.confirm(`${variance.text}\n\nOrder Qty is the master quantity. Size breakup will not change Order Qty. Continue saving?`);
      if (!ok) { setMsg({ tone:variance.tone, text:variance.text }); return; }
    }
    if (duplicateSetId) {
      const ok = window.confirm(`Set ID ${clean.set_id} is already used by another order/style (${naturalKeyLabel(duplicateSetId)}).\n\nUse same Set ID only for real TOP/BOTTOM/set components. Continue?`);
      if (!ok) return;
    }
    let componentList = [clean.component];
    if (clean.set_id && !editing) {
      componentList = parseComponentList(form.set_components || clean.component);
      if (!componentList.includes(clean.component)) componentList.unshift(clean.component);
      componentList = Array.from(new Set(componentList));
      if (componentList.length < 2) {
        setMsg({ tone:"late", text:"Set entry requires all components in one go. Enter components like TOP, BOTTOM, JACKET, ACCESSORY in Set components." });
        return;
      }
    }
    const prevRow = editing ? (allRows||[]).find(r=>String(r.id)===String(form.id)) : null;
    const duplicate = (allRows||[]).find(r=>componentList.some(comp=>styleCompositeKey(r)===styleCompositeKey({ ...clean, component:comp })) && String(r.id)!==String(form.id));
    if (duplicate) { setMsg({ tone:"late", text:`Duplicate row already exists for ${naturalKeyLabel(duplicate)}. Edit that row instead of adding another.` }); return; }
    if (editing && prevRow) {
      const oldKey = styleCompositeKey(prevRow);
      const newKey = styleCompositeKey(clean);
      const hasActivity = styleHasStageActivity(prevRow) || (ledger||[]).some(x=>ledgerRowMatchesStyle(x, prevRow));
      const changes = [];
      if (oldKey !== newKey) changes.push(`Unique key: ${naturalKeyLabel(prevRow)} → ${naturalKeyLabel(clean)}`);
      if (n(prevRow.order_qty) !== clean.order_qty) changes.push(`Order Qty: ${fmt(prevRow.order_qty)} → ${fmt(clean.order_qty)}`);
      if (JSON.stringify(normalizeSizeQtyMap(prevRow.order_size_qty || {}, formSizes)) !== JSON.stringify(cleanSizeQty)) changes.push("Order size breakup changed");
      if (!!prevRow.print_required !== !!clean.print_required || !!prevRow.embroidery_required !== !!clean.embroidery_required) changes.push("Route toggle changed");
      if (changes.length) {
        const ok = window.confirm(`Confirm production style data change.\n\nUnique row key is Order No + Style No + Colour + Component, not Style alone.\n\n${changes.join("\n")}\n\n${hasActivity ? "This row has production activity/ledger, so confirm carefully." : ""}`);
        if (!ok) return;
      }
    }
    const rowsToSave = editing ? [{
      ...(prevRow || {}),
      ...clean,
      id:form.id,
      stages:safeStagesForEditedRow(prevRow, clean),
      route:routeFor(clean),
    }] : componentList.map(comp=>({
      ...clean,
      component:comp,
      id:uid("demo_manual_style"),
      stages:blankStagesForRoute({ ...clean, component:comp }),
      route:routeFor({ ...clean, component:comp }),
    }));
    const mainRow = rowsToSave[0];
    setBusy(true);
    try {
      setRows(prev=>{
        let next = [...prev];
        rowsToSave.forEach(rowToSave=>{ forgetDeletedStyle(rowToSave);
          const key = styleCompositeKey(rowToSave);
          const exists = next.some(r=>String(r.id)===String(rowToSave.id) || styleCompositeKey(r)===key);
          next = exists ? next.map(r=>(String(r.id)===String(rowToSave.id) || styleCompositeKey(r)===key) ? rowToSave : r) : [rowToSave, ...next];
        });
        return next;
      });
      const { error, skipped, warning, via, recoveredFrom } = rowsToSave.length > 1
        ? await robustUpsertOrdersToSupabase(rowsToSave)
        : await upsertOneStyleToSupabase(mainRow);
      if (editing && prevRow && styleCompositeKey(prevRow) !== styleCompositeKey(mainRow) && !skipped) {
        await deleteOneStyleFromSupabase(prevRow);
      }
      const saveLabel = rowsToSave.length > 1 ? `Added ${rowsToSave.length} set components (${componentList.join(", ")})` : `${editing ? "Updated" : "Added"} ${mainRow.style_no}`;
      if (error) setMsg({ tone:"late", text:`${saveLabel} in browser, Supabase save failed: ${error.message}` });
      else if (warning) setMsg({ tone:"warn", text:`${saveLabel} in browser. ${warning}` });
      else setMsg({ tone:variance.diff ? "warn" : "ok", text:`${saveLabel}. ${variance.diff ? variance.text + " " : ""}${skipped ? "Browser/demo save only." : supabaseSaveLabel({via})}${shortRecoveredSupabaseNote(recoveredFrom)}` });
      if (!error && !warning) {
        recordProductionAudit(editing ? "style_update" : "style_add", { table_name:"production_orders", order_no:mainRow.order_no, style_no:mainRow.style_no, colour:mainRow.colour, component:mainRow.component, qty:mainRow.order_qty, source:"Styles", after_data:{ rows:rowsToSave.length, components:componentList } });
        onSharedSave?.({ skipped, via, recoveredFrom }, saveLabel);
      }
      if (!editing) setForm(emptyForm);
    } finally { setBusy(false); }
  }
  async function remove(row){
    const permission = requireCurrentPermission("production.delete_styles", "delete production styles");
    if (permission) { setMsg({ tone:"late", text:permission.error.message }); return; }
    const hasLedger = (ledger||[]).some(x=>ledgerRowMatchesStyle(x,row));
    const hasActivity = styleHasStageActivity(row) || hasLedger;
    const word = hasActivity ? "HARD DELETE" : "DELETE";
    const warning = hasActivity
      ? `Hard delete will remove ${row.style_no} and its local ledger/history from this demo app. This is okay for demo cleanup, but not for live factory audit. Type HARD DELETE to confirm.`
      : `Delete unused style ${row.style_no}? Type DELETE to confirm.`;
    const confirmText = window.prompt(`${warning}

${row.order_no} / ${row.style_no} / ${row.colour} / ${row.component}`);
    if (confirmText !== word) return;
    setBusy(true);
    try {
      const orderDelete = await deleteOneStyleFromSupabase(row);
      let cleanupWarning = orderDelete?.error ? `Supabase order cleanup failed: ${orderDelete.error.message}` : "";
      if (hasActivity) {
        const led = await deleteStyleLedgerFromSupabase(row);
        if (led.error) cleanupWarning = [cleanupWarning, `Supabase ledger cleanup failed: ${led.error.message}`].filter(Boolean).join(" · ");
      }
      rememberDeletedStyle(row);
      setRows(prev=>prev.filter(r=>String(r.id)!==String(row.id) && styleCompositeKey(r)!==styleCompositeKey(row)));
      setLedger?.(prev=>(prev||[]).filter(x=>!ledgerRowMatchesStyle(x,row)));
      setMsg(cleanupWarning ? { tone:"warn", text:`${hasActivity ? "Hard deleted" : "Deleted"} locally/demo. ${cleanupWarning}. If Pull brings it back, delete the Supabase row manually or check table RLS.` } : { tone:"ok", text:`${hasActivity ? "Hard deleted" : "Deleted"} ${row.style_no}. ${isSupabaseConfigured ? "Supabase cleanup completed." : "Local/demo cleanup only."}` });
      if (!cleanupWarning) recordProductionAudit(hasActivity ? "style_hard_delete" : "style_delete", { table_name:"production_orders", order_no:row.order_no, style_no:row.style_no, colour:row.colour, component:row.component, qty:row.order_qty, source:"Styles delete", before_data:{ had_activity:hasActivity, had_ledger:hasLedger } });
      if (String(form.id)===String(row.id)) reset();
    } finally { setBusy(false); }
  }
  function ledgerWrongSizeInfo(row){
    const master = sizesFor(row).map(x=>String(x).trim()).filter(Boolean);
    const masterSet = new Set(master.map(x=>x.toUpperCase()));
    const totals = new Map();
    (ledger || []).forEach(e=>{
      if (!ledgerRowMatchesStyle(e,row)) return;
      const size = String(e.size || e.size_code || e.size_name || "").trim();
      if (!size || masterSet.has(size.toUpperCase())) return;
      totals.set(size, n(totals.get(size)) + n(e.qty ?? e.delta));
    });
    const wrong = Array.from(totals.entries()).filter(([,qty])=>Math.abs(n(qty)) > 0.001).map(([size,qty])=>({size,qty}));
    return { master, wrong };
  }
  function defaultSizeRepairMap(row){
    const { master, wrong } = ledgerWrongSizeInfo(row);
    return wrong.map((w,idx)=>({ old:w.size, next:master[idx] || "", qty:w.qty }));
  }
  function parseSizeRepairMap(text){
    return String(text || "").split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
      const [oldRaw,nextRaw] = line.split(/=>|=|→/).map(x=>String(x||"").trim());
      return { old:oldRaw, next:nextRaw };
    }).filter(x=>x.old && x.next);
  }
  function qtyColumnPatchForLedgerType(type, qty){
    const t = String(type || "").toLowerCase();
    return {
      good_qty:["good_output","output","completed","complete","done","alter_clear"].includes(t) ? n(qty) : 0,
      reject_qty:["reject","rejection"].includes(t) ? n(qty) : 0,
      alter_qty:["alter","alter_issue"].includes(t) ? n(qty) : 0,
      missing_qty:t === "missing" ? n(qty) : 0,
    };
  }
  async function repairSizeClash(row){
    const permission = requireCurrentPermission("production.correct_entry", "repair wrong size entries");
    if (permission) { setMsg({ tone:"late", text:permission.error.message }); return; }
    const info = ledgerWrongSizeInfo(row);
    if (!info.wrong.length) { setMsg({ tone:"ok", text:`No wrong ledger size labels found for ${row.style_no}.` }); return; }
    if (info.wrong.length > info.master.length) {
      setMsg({ tone:"late", text:`Cannot auto-map ${info.wrong.length} wrong sizes into ${info.master.length} master sizes. This usually means the style/order itself was entered wrong. Delete/replace the style row or correct manually in Register.` });
      window.alert(`Too many wrong sizes to auto-map.\n\nWrong ledger sizes: ${info.wrong.map(x=>x.size).join(", ")}\nMaster sizes: ${info.master.join(", ")}\n\nBecause wrong sizes are more than master sizes, do not guess. If the whole style was entered against the wrong size set/style, delete/replace the style row or correct manually in Register.`);
      return;
    }
    const defaults = defaultSizeRepairMap(row);
    const defaultText = defaults.map(m=>`${m.old}=${m.next}`).join("\n");
    const promptText = window.prompt(`Repair wrong ledger sizes for ${naturalKeyLabel(row)}.\n\nThe app will NOT edit cumulative totals directly. It will add audit correction rows: negative from old size and positive to mapped size across ALL departments / all entry types for this style.\n\nReview/edit mapping below. Format OLD=NEW, one per line.`, defaultText);
    if (promptText === null) return;
    const mappings = parseSizeRepairMap(promptText);
    const masterSet = new Set(info.master.map(x=>x.toUpperCase()));
    const wrongSet = new Set(info.wrong.map(x=>x.size.toUpperCase()));
    const errors=[];
    info.wrong.forEach(w=>{ if (!mappings.some(m=>m.old.toUpperCase()===w.size.toUpperCase())) errors.push(`Missing mapping for ${w.size}`); });
    mappings.forEach(m=>{ if (!wrongSet.has(m.old.toUpperCase())) errors.push(`${m.old} is not a wrong ledger size for this style`); if (!masterSet.has(m.next.toUpperCase())) errors.push(`${m.next} is not in master size set (${info.master.join(", ")})`); });
    if (errors.length) { window.alert(`Size repair blocked:\n\n${errors.join("\n")}`); setMsg({ tone:"late", text:`Size repair blocked: ${errors[0]}` }); return; }
    const mapByOld = new Map(mappings.map(m=>[m.old.toUpperCase(), m.next]));
    const affected = (ledger || []).filter(e=>ledgerRowMatchesStyle(e,row) && mapByOld.has(String(e.size || e.size_code || e.size_name || "").trim().toUpperCase()) && Math.abs(n(e.qty ?? e.delta)) > 0.001);
    if (!affected.length) { setMsg({ tone:"warn", text:"No live ledger rows found to repair after mapping." }); return; }
    const summary = info.wrong.map(w=>`${w.size} ${fmt(w.qty)} → ${mapByOld.get(w.size.toUpperCase())}`).join("\n");
    const ok = window.confirm(`Confirm size shift across ALL departments / ALL entries for this style?\n\n${summary}\n\nAffected ledger rows: ${affected.length}\nCorrection rows to add: ${affected.length * 2}\n\nThis preserves audit: old wrong-size rows remain, correction rows shift qty to the correct size.`);
    if (!ok) return;
    const created = new Date().toISOString();
    const profile = currentUserProfile();
    const newLedger = affected.flatMap(e=>{
      const oldSize = String(e.size || e.size_code || e.size_name || "").trim();
      const nextSize = mapByOld.get(oldSize.toUpperCase());
      const qty = n(e.qty ?? e.delta);
      const common = {
        entry_date:ledgerDate(e) || today(), created_at:created,
        order_no:row.order_no, style_no:row.style_no, buyer:row.buyer, colour:row.colour, component:row.component,
        stage:ledgerStage(e), dept:stageLabel(ledgerStage(e)), entry_type:e.entry_type || e.entryType || e.type || "good_output",
        changed_by:profile.name || currentUserName(), changed_by_role:profile.role || "", changed_by_department:profile.department || "",
        entry_source:"style_size_map_repair", approval_status:"size_repair_confirmed", validation_status:"size_label_repaired",
        validation_messages:[`Size label repaired ${oldSize} -> ${nextSize} by user confirmation`],
        remarks:`Size repair for ${naturalKeyLabel(row)}: ${oldSize} -> ${nextSize}. Source ledger ${e.id || e.created_at || "row"}.`,
        line:e.line || e.stitching_line || row.line || "", stitching_line:e.stitching_line || (ledgerStage(e)==="stitching" ? (e.line || row.line || "") : ""),
        repair_source_id:e.id || "", repair_old_size:oldSize, repair_new_size:nextSize,
      };
      const negQty = -qty;
      return [
        { id:uid("led_size_repair"), ...common, size:oldSize, qty:negQty, old_qty:qty, new_qty:0, ...qtyColumnPatchForLedgerType(common.entry_type, negQty) },
        { id:uid("led_size_repair"), ...common, size:nextSize, qty:qty, old_qty:0, new_qty:qty, ...qtyColumnPatchForLedgerType(common.entry_type, qty) },
      ];
    });
    setBusy(true);
    try {
      const payload = newLedger.map(({id, ...x})=>x);
      const result = await robustInsertEntriesToSupabase(payload);
      setLedger?.(prev=>mergeLedgerPrependUnique(prev, newLedger));
      const text = `Size repair posted for ${row.style_no}: ${mappings.map(m=>`${m.old}->${m.next}`).join(", ")} · ${newLedger.length} correction rows.`;
      if (result?.error) setMsg({ tone:"warn", text:`${text} Browser updated; Supabase insert failed: ${result.error.message}` });
      else setMsg({ tone:"ok", text });
      recordProductionAudit("style_size_map_repair", { table_name:"production_entries", order_no:row.order_no, style_no:row.style_no, colour:row.colour, component:row.component, qty:newLedger.reduce((a,e)=>a+Math.abs(n(e.qty)),0)/2, source:"Styles size repair", metadata:{ mappings, affected_rows:affected.length, correction_rows:newLedger.length, supabase:result?.via || "browser" } });
      onSharedSave?.(result || {}, "Size repair");
    } finally { setBusy(false); }
  }

  function downloadTemplate(){
    exportXlsx("production_style_bulk_template.xlsx", [
      { name:"Bulk Update", rows:styleTemplateRows() },
      { name:"Instructions", rows:[
        { Rule:"Action", Detail:"Use ADD_UPDATE to add/update rows. Use HARD_DELETE to remove a style/order/colour/component from demo data." },
        { Rule:"Unique key", Detail:"Order No + Style No + Colour + Component identifies the row." },
        { Rule:"Size Set", Detail:`Allowed: ${Object.keys(getSizeSets()).join(", ")}. Add/edit groups in Settings.` },
        { Rule:"Order size breakup", Detail:"Order Qty is mandatory and remains master. Fill only size columns belonging to the chosen Size Set. If XL/L/M quantities are uploaded against a kids size set, preview blocks the row until you map/fix the file." },
        { Rule:"Booleans", Detail:"Print Required / Embroidery Required accept Yes/No, TRUE/FALSE, 1/0." },
        { Rule:"Hard delete", Detail:"For demo cleanup only. Live production should archive/approve instead of hard deleting." },
      ]}
    ]);
  }
  async function bulkUploadExcel(file){
    const permission = requireCurrentPermission("production.edit_styles", "bulk update production styles");
    if (permission) { setBulkMsg({ tone:"late", text:permission.error.message }); return; }
    if (!file) return;
    setBusy(true); setBulkReview(null); setBulkMsg({ tone:"info", text:"Reading Excel bulk update and building visual preview..." });
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type:"array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval:"" });
      if (!rawRows.length) { setBulkMsg({ tone:"late", text:"No rows found in first sheet." }); return; }
      const records=[];
      let addCount=0, updateCount=0, deleteCount=0, errorCount=0, warnCount=0, skipped=0;
      const previewRows=[...(allRows||[])];
      for (const [idx,raw] of rawRows.entries()) {
        const rowNo = idx + 2;
        const actionRaw = styleExcelAction(raw);
        const action = ["DELETE","HARD_DELETE","REMOVE"].includes(actionRaw) ? "DELETE" : "UPSERT";
        const keyProbe = styleFromExcelRow(raw, {});
        const rec = { rowNo, action, raw, errors:[], warnings:[], changes:[], kind:"SKIP", existing:null, clean:null, merged:null };
        if (!keyProbe.order_no || !keyProbe.style_no || !keyProbe.colour || !keyProbe.component) {
          rec.errors.push("Missing Order No / Style No / Colour / Component."); skipped++; errorCount++; records.push(rec); continue;
        }
        const existing = previewRows.find(r=>styleCompositeKey(r)===styleCompositeKey(keyProbe));
        rec.existing = existing || null;
        if (action === "DELETE") {
          if (!existing) { rec.errors.push("Delete target not found."); skipped++; errorCount++; records.push(rec); continue; }
          rec.kind = "DELETE"; rec.clean = existing; rec.merged = existing;
          rec.changes = [{ label:"Delete row", old:naturalKeyLabel(existing), next:"Will remove style row" }];
          deleteCount++; records.push(rec); continue;
        }
        const clean = styleFromExcelRow(raw, existing);
        rec.clean = clean;
        const rawSizeSet = excelValue(raw,["Size Set","SizeSet","Sizes"]);
        if (!rawSizeSet) rec.warnings.push(`Size Set blank: app selected ${sizeSetInferenceLabel(raw, clean.size_set, clean.order_qty)}. This uses filled size values, not template headers.`);
        if (!clean.buyer || !clean.order_qty) rec.errors.push("Buyer and Order Qty are mandatory for add/update.");
        const mismatchedSizes = mismatchedExcelSizeValues(raw, clean.size_set);
        if (mismatchedSizes.length) rec.errors.push(`Size-set mismatch: file has quantities in ${mismatchedSizes.join(", ")} but selected/inferred size set '${clean.size_set}' allows ${(getSizeSets()[clean.size_set] || []).join(" / ")}. Change Size Set or fix/map the file before applying.`);
        const variance = sizeVarianceInfo(clean.order_qty, normalizeSizeQtyMap(clean.order_size_qty || {}, getSizeSets()[clean.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha));
        if (variance.diff !== 0) rec.warnings.push(variance.text);
        const merged = {
          ...(existing || {}), ...clean, id:existing?.id || uid("demo_bulk_style"),
          stages: existing ? safeStagesForEditedRow(existing, clean) : blankStagesForRoute(clean),
          route:routeFor(clean),
        };
        rec.merged = merged;
        rec.kind = existing ? "UPDATE" : "ADD";
        rec.changes = bulkStyleDiffItems(existing, clean);
        if (rec.errors.length) { errorCount++; skipped++; }
        else {
          if (rec.warnings.length) warnCount++;
          if (existing) updateCount++; else addCount++;
        }
        records.push(rec);
      }
      setBulkReview({ fileName:file.name || "uploaded Excel", records, addCount, updateCount, deleteCount, skipped, errorCount, warnCount });
      setBulkMsg({ tone:errorCount ? "late" : warnCount ? "warn" : "ok", text:`Preview ready: ${addCount} add, ${updateCount} update, ${deleteCount} delete, ${skipped} blocked. Review differences below, then Apply.` });
    } catch(e) {
      setBulkMsg({ tone:"late", text:e?.message || "Bulk Excel preview failed." });
    } finally { setBusy(false); }
  }
  async function applyBulkReview(){
    const permission = requireCurrentPermission("production.edit_styles", "apply bulk style changes");
    if (permission) { setBulkMsg({ tone:"late", text:permission.error.message }); return; }
    const records = bulkReview?.records || [];
    if (!records.length) { setBulkMsg({ tone:"late", text:"No preview to apply." }); return; }
    const blocked = records.filter(r=>r.errors?.length).length;
    if (blocked && !window.confirm(`${blocked} rows are blocked and will be skipped. Apply valid rows only?`)) return;
    const valid = records.filter(r=>!r.errors?.length);
    if (!valid.length) { setBulkMsg({ tone:"late", text:"No valid rows to apply." }); return; }
    if (!window.confirm(`Apply ${valid.length} valid bulk change rows? This will update style master and Supabase where configured.`)) return;
    setBusy(true); setBulkMsg({ tone:"info", text:"Applying bulk preview..." });
    try {
      let nextRows=[...(allRows||[])];
      const upserts=[], deletes=[], errors=[];
      let added=0, updated=0, deleted=0;
      valid.forEach(rec=>{
        if (rec.kind === "DELETE") {
          const row = rec.merged;
          nextRows = nextRows.filter(r=>styleCompositeKey(r)!==styleCompositeKey(row));
          deletes.push(row); rememberDeletedStyle(row); deleted++;
        } else {
          const row = rec.merged;
          forgetDeletedStyle(row);
          const existing = nextRows.find(r=>String(r.id)===String(row.id) || styleCompositeKey(r)===styleCompositeKey(row));
          nextRows = existing ? nextRows.map(r=>(String(r.id)===String(row.id) || styleCompositeKey(r)===styleCompositeKey(row)) ? row : r) : [row, ...nextRows];
          upserts.push(row); if (rec.kind === "ADD") added++; else updated++;
        }
      });
      setRows(nextRows);
      if (deletes.length) setLedger?.(prev=>(prev||[]).filter(x=>!deletes.some(row=>ledgerRowMatchesStyle(x,row))));
      if (hasValidSupabaseEnv()) {
        if (upserts.length) {
          const result = await robustUpsertOrdersToSupabase(upserts);
          if (result.error) errors.push(`Supabase upsert: ${result.error.message}`);
          else if (result.recoveredFrom) errors.push(`Supabase upsert saved via REST fallback.${shortRecoveredSupabaseNote(result.recoveredFrom)}`);
        }
        for (const row of deletes) {
          const a = await deleteOneStyleFromSupabase(row); if (a.error) errors.push(`Supabase delete ${row.style_no}: ${a.error.message}`);
          const b = await deleteStyleLedgerFromSupabase(row); if (b.error) errors.push(`Supabase ledger delete ${row.style_no}: ${b.error.message}`);
        }
      }
      setBulkMsg({ tone:errors.length ? "warn" : "ok", text:`Bulk changes applied. Added ${added}, updated ${updated}, deleted ${deleted}, skipped ${blocked}.${errors.length ? " Issues: "+errors.slice(0,4).join(" | ")+(errors.length>4?` | +${errors.length-4} more`:"") : ""}` });
      recordProductionAudit("style_bulk_update", { table_name:"production_orders", qty:upserts.length, source:"Styles bulk preview/apply", metadata:{ added, updated, deleted, skipped:blocked, error_count:errors.length } });
      setBulkReview(null);
    } catch(e) {
      setBulkMsg({ tone:"late", text:e?.message || "Bulk Excel apply failed." });
    } finally { setBusy(false); }
  }
  const formRoute = routeFor(form);
  return <div className="mt-two">
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Add / Edit Style</h3><div className="mt-panel-sub">Create or update a production style/order row. For demo cleanup, hard delete is allowed with confirmation; for live use this should become archive/approval.</div></div>
      <div className="mt-section" style={{display:"grid", gap:9}}>
        {msg && <span className={`mt-chip ${statusClass(msg.tone)}`}>{msg.text}</span>}
        <div className="mt-two"><div><label className="mt-small">Order No *</label><input className="mt-input" value={form.order_no} onChange={e=>setField("order_no",e.target.value.toUpperCase())}/></div><div><label className="mt-small">Style No *</label><input className="mt-input" value={form.style_no} onChange={e=>setField("style_no",e.target.value.toUpperCase())}/></div></div>
        <div className="mt-two"><div><label className="mt-small">Buyer / Brand *</label><input className="mt-input" value={form.buyer} onChange={e=>setField("buyer",e.target.value.toUpperCase())}/></div><div><label className="mt-small">Order Qty *</label><input className="mt-input" value={form.order_qty} onChange={e=>setField("order_qty",e.target.value.replace(/[^0-9]/g,""))}/></div></div>
        <div className="mt-two"><div><label className="mt-small">Colour *</label><input className="mt-input" value={form.colour} onChange={e=>setField("colour",e.target.value.toUpperCase())}/></div><div><label className="mt-small">Component *</label><input className="mt-input" value={form.component} onChange={e=>setField("component",e.target.value.toUpperCase())}/></div></div>
        <div className="mt-two"><div><label className="mt-small">Size Set</label><select className="mt-select" value={form.size_set} onChange={e=>setField("size_set",e.target.value)}>{Object.entries(getSizeSets()).map(([k,arr])=><option key={k} value={k}>{k} · {arr.join(" / ")}</option>)}</select></div><div><label className="mt-small">Set ID</label><div style={{display:"flex", gap:6}}><input className="mt-input" style={{flex:1}} value={form.set_id} onChange={e=>setField("set_id",e.target.value.toUpperCase())} placeholder="Optional, TOP/BOTTOM set matching"/><button className="mt-btn ghost" type="button" onClick={()=>setField("set_id", suggestSetIdFor(form, allRows))}>Suggest</button></div>{duplicateSetId ? <div className="mt-small" style={{color:"var(--fg-warn)", fontWeight:800}}>Same Set ID exists on {naturalKeyLabel(duplicateSetId)}. Use same ID only for real set components.</div> : <div className="mt-small">System can suggest a clean Set ID so unrelated duplicates are avoided.</div>}</div></div>
        {!editing && String(form.set_id||"").trim() ? <div className="mt-order-size-card"><b>Set components — create together</b><div className="mt-small">Because this is a set, enter all components in one go so TOP/BOTTOM pieces do not get missed. Example: TOP, BOTTOM, JACKET, ACCESSORY.</div><input className="mt-input" style={{width:"100%", marginTop:6}} value={form.set_components || ""} onChange={e=>setField("set_components", e.target.value.toUpperCase())} placeholder="TOP, BOTTOM, JACKET, ACCESSORY"/><div className="mt-small">Add Style will create/update one row per component using same Order Qty/size breakup/Set ID. After creation, set Print/Embroidery per component in Routes.</div></div> : null}
        <div className="mt-order-size-card"><div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap", alignItems:"center"}}><div><b>Order Size Breakup</b><div className="mt-small">Order Qty is master. Size entries subtract from it; missing balance is shown instead of changing Order Qty.</div></div><div style={{display:"flex", gap:6, flexWrap:"wrap"}}><span className={`mt-chip ${statusClass(formSizeVariance.tone)}`}>{formSizeVariance.text}</span><span className="mt-chip mt-muted">Size total {fmt(formSizeTotal)} / Order {fmt(form.order_qty)}</span><button className="mt-btn ghost" type="button" onClick={distributeFormOrderQty}>Distribute Order Qty</button><button className="mt-btn ghost" type="button" onClick={clearFormOrderSizes}>Clear Sizes</button></div></div><div className="mt-backdate-box" style={{alignItems:"flex-end"}}><div style={{minWidth:220, flex:"1 1 260px"}}><label className="mt-small">Size ratio</label><input className="mt-input" style={{width:"100%"}} value={form.size_ratio || ""} onChange={e=>setField("size_ratio", e.target.value.toUpperCase())} placeholder={`Example: ${(formSizes||[]).map((_,i)=>i===0||i===formSizes.length-1?1:2).join(":")}`} /></div><button className="mt-btn" type="button" onClick={applyFormSizeRatio}>Apply Ratio</button><button className="mt-btn ghost" type="button" onClick={useCurrentSizesAsRatio}>Use current sizes as ratio</button><span className="mt-chip mt-info">{form.size_ratio ? ratioSummaryText(form.size_ratio, formSizes) : "Ratio optional"}</span><div className="mt-small" style={{width:"100%"}}>Use simple ratio by size order, e.g. 1:2:3:3:2:1, or named ratio like XS=1,S=2,M=3. Apply ratio fills size quantities from Order Qty; manual size edits still win after that.</div></div><div className="mt-order-size-row">{formSizes.map(size=><div className="mt-order-size-cell" key={size}><label>{size}</label><input className="mt-cell-input" style={{width:"100%"}} value={formOrderSizeQty[size] || ""} onChange={e=>setOrderSizeQty(size,e.target.value)} placeholder="0" /></div>)}</div><div className="mt-small">Bulk Excel also accepts a Size Ratio column. Order Qty is mandatory; upload summary warns if size breakup is short/excess.</div></div>
        <div className="mt-two"><div><label className="mt-small">File released to Cutting qty</label><input className="mt-input" type="number" value={form.file_released_qty || ""} onChange={e=>setField("file_released_qty", e.target.value)} placeholder="Blank = use order qty"/><div className="mt-small">Order can exist before Cutting starts. This is cutting permission/release qty.</div></div><div><label className="mt-small">File released date</label><input className="mt-input" type="date" value={form.file_released_date || ""} onChange={e=>setField("file_released_date", e.target.value)} /></div></div>
        <div className="mt-two"><div><label className="mt-small">Planning line override</label><select className="mt-select" value={form.line} onChange={e=>setField("line",e.target.value)}><option value="">Not fixed — decide in Planning</option>{productionLineNames().map(l=><option key={l} value={l}>{l}</option>)}</select><div className="mt-small">Stitching line is normally decided later in Planning, not locked in Style Master.</div></div><div><label className="mt-small">Priority</label><select className="mt-select" value={form.priority} onChange={e=>setField("priority",e.target.value)}>{["Low","Normal","High","Urgent"].map(x=><option key={x}>{x}</option>)}</select></div></div>
        <div className="mt-two"><label className="mt-small"><input type="checkbox" checked={!!form.print_required} onChange={e=>setField("print_required",e.target.checked)}/> Print required</label><label className="mt-small"><input type="checkbox" checked={!!form.embroidery_required} onChange={e=>setField("embroidery_required",e.target.checked)}/> Embroidery required</label></div>
        <label className="mt-small"><input type="checkbox" checked={!!form.dispatch_reject_allowed} onChange={e=>setField("dispatch_reject_allowed",e.target.checked)}/> Allow rejection dispatch for this order/style only</label>
        <div><label className="mt-small">Photo URL / thumbnail</label><input className="mt-input" style={{width:"100%"}} value={form.photo_url} onChange={e=>setField("photo_url",e.target.value)} placeholder="Optional direct/Supabase image URL"/></div>
        <div><label className="mt-small">OneDrive / folder URL</label><input className="mt-input" style={{width:"100%"}} value={form.photo_folder_url} onChange={e=>setField("photo_folder_url",e.target.value)} placeholder="Optional folder link"/></div>
        <div className="mt-speed-note"><b>Route preview:</b> {formRoute.map(stageLabel).join(" → ")}<br/>New styles start with blank WIP. Use DPR Entry for cutting/output/movement.</div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}><button className="mt-btn primary" disabled={busy} onClick={save}><CheckCircle2 size={14}/>{editing ? "Update Style" : "Add Style"}</button>{editing && <button className="mt-btn ghost" onClick={reset}>Cancel edit</button>}</div>
      </div>
    </div>

    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Bulk Excel Add / Update / Hard Delete</h3><div className="mt-panel-sub">Upload one Excel sheet to add or update many styles at once. Use Action = HARD_DELETE to remove wrong demo rows and their local ledger entries.</div></div>
      <div className="mt-section no-print" style={{display:"grid", gap:10}}>
        {bulkMsg && <span className={`mt-chip ${statusClass(bulkMsg.tone)}`}>{bulkMsg.text}</span>}
        <div className="mt-toolbar"><button className="mt-btn" disabled={busy} onClick={downloadTemplate}><Download size={14}/>Download Template</button><label className="mt-btn primary" style={{cursor:busy?"not-allowed":"pointer"}}><Upload size={14}/>Upload Excel<input type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} disabled={busy} onChange={e=>{ const f=e.target.files?.[0]; if(f) bulkUploadExcel(f); e.target.value=""; }}/></label><span className="mt-chip mt-warn"><AlertTriangle size={12}/>Hard delete allowed for demo cleanup</span></div>
        <div className="mt-speed-note"><b>Required key:</b> Order No + Style No + Colour + Component. <b>Action:</b> ADD_UPDATE or HARD_DELETE. Bulk update preserves existing WIP where possible; hard delete removes the style row and matching ledger entries from this demo dataset.</div>
        {bulkReview && <div className="mt-order-size-card"><div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"center", flexWrap:"wrap"}}><div><b>Bulk Preview — review before entry</b><div className="mt-small">{bulkReview.fileName} · {bulkReview.addCount} add · {bulkReview.updateCount} update · {bulkReview.deleteCount} delete · {bulkReview.errorCount} blocked · {bulkReview.warnCount} warnings</div></div><div style={{display:"flex", gap:6, flexWrap:"wrap"}}><button className="mt-btn primary" disabled={busy || !bulkReview.records?.some(r=>!r.errors?.length)} onClick={applyBulkReview}><CheckCircle2 size={14}/>Apply Valid Changes</button><button className="mt-btn ghost" disabled={busy} onClick={()=>setBulkReview(null)}>Cancel Preview</button></div></div><div className="mt-bulk-preview-grid" style={{marginTop:10}}>{(bulkReview.records||[]).slice(0,60).map(rec=><div key={rec.rowNo} className={`mt-bulk-preview-card ${bulkPreviewClass(rec)}`}><div className="mt-bulk-preview-head"><div><div className="mt-bulk-preview-title">Row {rec.rowNo} · {rec.kind}</div><div className="mt-small">{rec.clean ? naturalKeyLabel(rec.clean) : rec.existing ? naturalKeyLabel(rec.existing) : "Missing key"}</div></div><span className={`mt-chip ${statusClass(bulkPreviewTone(rec))}`}>{rec.errors?.length ? "Blocked" : rec.warnings?.length ? "Review" : "OK"}</span></div><div className="mt-bulk-change-list">{rec.clean?.size_set && <span className="mt-size-set-badge">Size set: {rec.clean.size_set}</span>}{rec.errors?.map((e,i)=><div className="mt-bulk-change" key={`e${i}`}><b>Blocked</b><span className="mt-bulk-old">{e}</span></div>)}{rec.warnings?.map((w,i)=><div className="mt-bulk-change" key={`w${i}`}><b>Warning</b><span>{w}</span></div>)}{(rec.changes||[]).slice(0,8).map((ch,i)=><div className="mt-bulk-change" key={i}><b>{ch.label}</b><span className="mt-bulk-old">{ch.old}</span><span className="mt-bulk-new">→ {ch.next}</span></div>)}</div></div>)}{(bulkReview.records||[]).length > 60 && <div className="mt-small">Showing first 60 preview rows. Apply will process all valid rows.</div>}</div></div>}
      </div>
    </div>
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style List / Edit / Hard Delete</h3><div className="mt-panel-sub">Search, edit, delete unused rows, or hard delete demo rows with activity. For live production, hard delete should be replaced by archive/approval governance.</div></div>
      <div className="mt-section no-print"><div className="mt-toolbar"><Search size={14}/><input className="mt-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search order / style / buyer / colour"/><span className="mt-chip mt-muted">{tableRows.length} rows</span></div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Order</th><th>Buyer</th><th>Colour</th><th>Component</th><th>Qty</th><th>Route</th><th>Activity</th><th>Action</th></tr></thead><tbody>{tableRows.map(row=>{ const hasLedger=(ledger||[]).some(x=>ledgerRowMatchesStyle(x,row)); const hasActivity=styleHasStageActivity(row)||hasLedger; const sizeInfo=ledgerWrongSizeInfo(row); return <tr key={row.id}><td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.set_id ? `Set ${row.set_id} · ` : ""}{row.size_set}{row.size_ratio ? ` · Ratio ${row.size_ratio}` : ""}</div></div></div></td><td>{row.order_no}</td><td>{row.buyer}</td><td>{row.colour}</td><td>{row.component}</td><td><b>{fmt(row.order_qty)}</b><div className="mt-small">{fileReleaseStatusText(row)}</div><div className="mt-small">{explicitOrderSizeQtyTotal(row) ? sizesFor(row).map(sz=>`${sz} ${fmt(normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row))[sz]||0)}`).join(" · ") : <span style={{color:"var(--fg-warn)", fontWeight:800}}>Size breakup missing</span>}</div></td><td>{routeFor(row).map(stageLabel).join(" → ")}</td><td>{hasActivity ? <span className="mt-chip mt-warn">Has activity</span> : <span className="mt-chip mt-ok">Unused</span>} {sizeInfo?.wrong?.length ? <><br/><span className="mt-chip mt-size-repair-chip">Size clash {sizeInfo.wrong.map(x=>x.size).join(", ")}</span></> : null}</td><td><button className="mt-btn primary" onClick={()=>onRelease?.(row, "styles_list")}>{isProductionFileReleased(row) ? "Edit Release" : "Release File"}</button> <button className="mt-btn" onClick={()=>edit(row)}>Edit</button> {sizeInfo?.wrong?.length ? <button className="mt-btn" disabled={busy} onClick={()=>repairSizeClash(row)}>Repair Sizes</button> : null} <button className="mt-btn ghost" disabled={busy} onClick={()=>remove(row)}>{hasActivity ? "Hard Delete" : "Delete"}</button>{hasActivity && <div className="mt-small">Demo cleanup only; removes matching ledger locally.</div>}</td></tr>; })}</tbody></table></div>
    </div>
  </div>;
}

function SettingsView({ onChanged }){
  const [tol,setTol]=useState(PROD_SETTINGS.cuttingTolerancePct);
  const [dispatchHold,setDispatchHold]=useState(PROD_SETTINGS.dispatchRamHoldPct);
  const [dispatchReject,setDispatchReject]=useState(dispatchRejectAllowed());
  const [linesText,setLinesText]=useState(productionLineNames().join("\n"));
  const [sizeSetsText,setSizeSetsText]=useState(sizeSetsToText(getSizeSets()));
  function applyTol(v){ const num=Math.max(0, Number(String(v).replace(/[^0-9.]/g,"")) || 0); setTol(num); PROD_SETTINGS.cuttingTolerancePct=num; onChanged?.(); }
  function applyDispatchHold(v){ const num=Math.max(0, Number(String(v).replace(/[^0-9.]/g,"")) || 0); setDispatchHold(num); PROD_SETTINGS.dispatchRamHoldPct=num; onChanged?.(); }
  function applyDispatchReject(checked){ PROD_SETTINGS.dispatchRejectAllowed=!!checked; setDispatchReject(!!checked); try { localStorage.setItem("production_dispatch_reject_allowed", checked ? "true" : "false"); } catch {} onChanged?.(); }
  function saveLines(){
    const lines = linesText.split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);
    if (!lines.length) { alert("Add at least one stitching line name."); return; }
    PROD_SETTINGS.lineNames = Array.from(new Set(lines));
    try { localStorage.setItem("production_line_names", JSON.stringify(PROD_SETTINGS.lineNames)); } catch {}
    onChanged?.();
    alert(`Saved ${PROD_SETTINGS.lineNames.length} line name(s).`);
  }
  function saveSizeSets(){
    const parsed = parseSizeSetsText(sizeSetsText);
    if (!Object.keys(parsed).length) { alert("Add at least one size group, for example alpha = XS, S, M, L, XL"); return; }
    saveCustomSizeSets(parsed);
    onChanged?.();
    alert(`Saved ${Object.keys(parsed).length} size group(s). Styles and entry screens will use this list.`);
  }
  function resetSizeSets(){
    try { localStorage.removeItem("production_size_sets"); } catch {}
    setSizeSetsText(sizeSetsToText(DEFAULT_SIZE_SETS));
    onChanged?.();
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Production Rules</h3><div className="mt-panel-sub">Editable business rules — single source of truth used by entry validation, status flags and dashboards. Applies on the next screen render.</div></div>
    <div className="mt-section" style={{display:"grid", gap:10}}>
      <div className="mt-toolbar"><span className="mt-toolbar-label">Cutting tolerance %</span><input className="mt-input" style={{maxWidth:120}} value={tol} onChange={e=>applyTol(e.target.value)} /><span className="mt-small">Cutting may exceed order qty up to this %. One value drives entry allowed-limit, extra-cut status flag and cell marker.</span></div>
      <div className="mt-toolbar"><span className="mt-toolbar-label">Dispatch hold if R/A/M % above</span><input className="mt-input" style={{maxWidth:120}} value={dispatchHold} onChange={e=>applyDispatchHold(e.target.value)} /><span className="mt-small">Default 2%. Dispatch output/issue is blocked if any reconcile exists or dispatch-blocking R/A/M is above this % of order qty.</span></div>
      <div className="mt-toolbar"><span className="mt-toolbar-label">Allow rejection dispatch default</span><label className="mt-chip mt-info" style={{cursor:"pointer"}}><input type="checkbox" checked={dispatchReject} onChange={e=>applyDispatchReject(e.target.checked)} style={{marginRight:6}}/> Default for new/unspecified orders</label><span className="mt-small">Actual approval is order/style-wise in Add/Edit Style. Missing, Alter and Reconcile still block.</span></div>
      <div className="mt-toolbar" style={{alignItems:"flex-start"}}><span className="mt-toolbar-label">Stitching line names</span><textarea className="mt-input" style={{minWidth:260, minHeight:110}} value={linesText} onChange={e=>setLinesText(e.target.value)} placeholder={'STF-1\nSTF-2\nSTF-3'} /><button className="mt-btn primary" onClick={saveLines}>Save Lines</button><span className="mt-small">One line per row, or comma separated. Planning uses this list for line-wise stitching plans.</span></div>
      <div className="mt-toolbar" style={{alignItems:"flex-start"}}><span className="mt-toolbar-label">Size groups</span><textarea className="mt-input" style={{minWidth:360, minHeight:140}} value={sizeSetsText} onChange={e=>setSizeSetsText(e.target.value)} placeholder={'alpha = XS, S, M, L, XL, XXL\nkids = 2-3Y, 3-4Y, 4-5Y\nwaist = 30, 32, 34, 36'} /><div style={{display:"grid",gap:8}}><button className="mt-btn primary" onClick={saveSizeSets}>Save Size Groups</button><button className="mt-btn ghost" onClick={resetSizeSets}>Reset Defaults</button></div><span className="mt-small">Format: group = size, size, size. Add buyer/category groups anytime, then select them in Styles or bulk upload.</span></div>
    </div>
    <div className="mt-section"><h3 className="mt-panel-title">Bottleneck metric guide</h3><div className="mt-panel-sub">Daily Rate = recent 7-day average output from ledger for that department. Days Cover = queue/open WIP ÷ Daily Rate. Bottleneck Score = Queue WIP + 2×Reconcile Qty + R/A/M Qty, so impossible movements and quality loss rank higher than normal queue.</div></div>
    <div className="mt-section"><h3 className="mt-panel-title">ERP / Supabase Reference</h3><div className="mt-panel-sub">Separate app now, future module inside mega ERP. Production owns movement/WIP; Style Master/BOM/Procurement will own master/material truth.</div></div><div className="mt-section mt-two"><div><b>Included through V6 logic</b><ul className="mt-small"><li>Add/edit production styles manually with horizontal order-size breakup; Order Qty remains master and size shortage/excess is warned in manual and bulk upload.</li><li>Browser fallback persistence keeps style updates after refresh even when Supabase URL/key is not configured correctly.</li><li>Cutting Pending now appears correctly until cut/output/R/A/M/short-close accounts for order qty; Cutting short-close action is available in Cutting detail.</li><li>Editable size groups in Settings; Styles and bulk upload can use custom buyer/category size sets.</li><li>Order-wise rejection dispatch flag: approved rejected pieces can be included in Dispatch feed by size only for that order/style.</li><li>WIP Other Open Split column is now toggleable and hidden by default to avoid duplicate/confusing status reading.</li><li>Simple 6-day Excel-style planning grid: enter total day target by style/line without SMV/OPS complexity</li><li>WIP now separates one Pending Stage from All Activity by Cut %, so the grid stays narrow while still showing the full cut/order breakup</li><li>Selected department detail shows Good Output together with Reject/Missing/Alter and accounted/tail quantities for a complete HOD picture</li><li>Size-wise day entry with previous/updated total cross-check</li><li>Print / embroidery route toggles</li><li>Standard route changed to Checking → Packing → Dispatch; Iron removed as a normal department</li><li>Department cells max 3 numbers</li><li>Cutting over allowed; downstream total jump blocked</li><li>Dispatch hold: no dispatch when reconcile exists or dispatch-blocking R/A/M exceeds configured order %. Optional setting allows approved rejection to be dispatched while Missing/Alter still block.</li><li>Editable stitching line names in Settings used by Planning</li><li>Issue-forward is the next department feed; no separate Receive entry in normal factory flow</li><li>Completed-not-issued-forward owner = Production Coordinator + Production Manager</li><li>Individual owner chase: Department HOD owns work-not-completed; Coordinator + Production Manager own completed-not-issued-forward</li><li>Style closure owner = Production Coordinator + Dept HOD; Production Manager handles movement/escalation/approval</li><li>WIP table page-specific filters, sorting, quick status buckets, and size-breakup toggle</li><li>Dashboard uses current-bin WIP logic: once a quantity moves to the next stage, it leaves the previous department bin.</li><li>Dashboard includes daily / 4-4-5 weekly / calendar-month production numbers, department × issue-type board, owner activity breakup, and production meeting focus.</li><li>Department-first dashboard pack: plan-vs-achieved/line efficiency, bottleneck/flow, aging/stuck WIP, quality/loss rate, party/outsource pending.</li><li>Dashboard drilldowns now use dashboard-specific rows, subtotal summaries, real size-stage data where available, and a visible size-source indicator.</li><li>Monthly comparison tab against Stitching Feed with drillable summary filters</li><li>Printable HOD WIP / horizontal Excel reports</li><li>Style photo support with lazy-loading thumbnails</li><li>Open-first WIP sheet modes: Open Control, Order View, Department View, Issue View, and Full Matrix</li><li>Focused WIP cell drawer shows selected department only; DPR entry shows only open styles for selected department/field; entry cells show open, previous, available, new entry, remaining and updated total; reductions/corrections require approval workflow later</li><li>Entry date / backdated audit logic with next-day default, same-day confirmation, reason and approval status</li><li>Live idle recalculation from production ledger where activity exists</li><li>Set convergence: a set packs/ships only min(components); Sets board + WIP chip show packable sets and unmatched pieces</li><li>Backdated entries validate feed as-of the entry date from the ledger; locked (older) backdated entries require reason + explicit manager-approval confirmation and are stamped in the audit ledger</li><li>Single configurable cutting tolerance replaces the old 8%/5%/0% mismatch</li><li>Party/outsource pending is consistent with the WIP open bucket (feed − output − R/A/M); outsourced stages label the with-department bucket as Pending at party</li><li>R/A/M day-entry path and impossible sequence reconcile checks</li><li>Planning tab: stitching line-wise rolling plan, department day-wise plan, department-specific planning pool, manual future plan, style-change-only changeover remaining-hours formula, plan-vs-achieved style adherence, and Review control room. Future procurement/stores quantity checks must validate as-of entry date</li><li>Slow-internet rule: tables use thumbnails only; heavy image/detail loads on click</li></ul></div><div><b>Future shared keys</b><ul className="mt-small"><li>style_id / order_id later</li><li>production_file_id from Merch Tracker</li><li>bom_id from Costing/BOM</li><li>order_no, style_no, colour, component, size, set_id</li></ul></div></div><div className="mt-section"><span className="mt-chip mt-info"><Lock size={12}/> Future RLS</span> <span className="mt-small">Keep this as a development app. We tighten RLS before real users and live factory data.</span></div></div>;
}

function withLiveIdle(rows, ledger=[], referenceDate=today()){
  if (!ledger?.length) return rows;
  const latestBy = new Map();
  ledger.forEach(x=>{
    const key = [x.order_no || x.order, x.style_no || x.style, x.colour||"", x.component||"", ledgerStage(x)].join("|::|");
    const d = ledgerDate(x);
    if (!d || !ledgerStage(x)) return;
    if (!latestBy.has(key) || d > latestBy.get(key)) latestBy.set(key,d);
  });
  return rows.map(row=>{
    const stages = { ...(row.stages||{}) };
    routeFor(row).forEach(stage=>{
      const key = [row.order_no,row.style_no,row.colour||"",row.component||"",stage].join("|::|");
      const latest = latestBy.get(key);
      if (!latest) return;
      stages[stage] = { ...blankStage(), ...sdata(row,stage), idle:Math.max(0,dateDiff(latest, referenceDate)) };
    });
    return { ...row, stages };
  });
}

function PageFilters({ tab, query, setQuery, buyer, setBuyer, buyers, order, setOrder, orders, visibleRows }){
  const title = tab === "dashboard" ? "Dashboard Filters" : tab === "entry" ? "Entry Scope" : tab === "wip" ? "Live WIP Scope" : tab === "review" ? "Review Scope" : tab === "owners" ? "Chase Scope" : tab === "monthly" ? "Monthly Scope" : tab === "styles" ? "Style Master Scope" : tab === "routes" ? "Route Page Filters" : tab === "photos" ? "Photo Page Filters" : tab === "reports" ? "Report Scope" : "Page Filters";
  const placeholder = tab === "photos" ? "Search style / photo / buyer" : "Search order / style / buyer / colour / component";
  return <div className="mt-toolbar no-print" style={{marginBottom:12}}>
    <span className="mt-toolbar-label">{title}</span>
    <Search size={14}/>
    <input className="mt-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder} style={{minWidth:260}}/>
    <select className="mt-select" value={buyer} onChange={e=>setBuyer(e.target.value)}>{buyers.map(b=><option key={b}>{b}</option>)}</select>
    <select className="mt-select" value={order} onChange={e=>setOrder(e.target.value)}><option value="All">All Orders</option>{orders.map(o=><option key={o} value={o}>{o}</option>)}</select>
    {tab === "dashboard" && <span className="mt-chip mt-info">Order filter controls all dashboard boards/drills</span>}
    {tab === "entry" && <span className="mt-chip mt-warn">Filter order/style before entry to avoid wrong posting</span>}
    {tab === "reports" && <span className="mt-chip mt-info">Horizontal Excel exports</span>}
    {tab === "register" && <span className="mt-chip mt-info">Output / Issue-Receive Register</span>}
    <span className="mt-chip mt-muted">{visibleRows.length} rows</span>
  </div>;
}


function PermissionGate({ permission, children, label }){
  if (currentUserCan(permission)) return children;
  return <div className="mt-card"><div className="mt-section"><span className="mt-chip mt-late"><Lock size={12}/>Permission blocked</span><div className="mt-panel-sub" style={{marginTop:8}}>{currentUserName()} ({currentUserRole()}) cannot open {label || "this screen"}. Required permission: <b>{permission}</b>.</div></div></div>;
}
function LoginDialog({ open, profile, onSave, onClose, force=false }){
  const [mode,setMode] = useState("login");
  const [remember,setRemember] = useState(true);
  const [form,setForm] = useState(()=>({ ...defaultUserProfile(), ...profile, email:normalizeUserEmail(profile?.email || ""), password:"", requested_role:profile?.requested_role || "Data Operator", requested_department:profile?.requested_department || profile?.department || "Production" }));
  const [msg,setMsg] = useState(null);
  const [busy,setBusy] = useState(false);
  useEffect(()=>setForm({ ...defaultUserProfile(), ...profile, email:normalizeUserEmail(profile?.email || ""), password:"", requested_role:profile?.requested_role || "Data Operator", requested_department:profile?.requested_department || profile?.department || "Production" }), [profile?.name, profile?.email, profile?.role, profile?.department]);
  if (!open) return null;
  const departments = ["Production","Cutting","Printing","Embroidery","Stitching","Checking","Packing","Dispatch","Management","Merchandising","Admin"];
  const requestedRole = form.requested_role || "Data Operator";
  async function doLogin(){
    const email = normalizeUserEmail(form.email);
    if (!emailLooksValid(email)) { setMsg({tone:"warn", text:"Enter a valid work email."}); return; }
    if (!String(form.password || "").trim()) { setMsg({tone:"warn", text:"Password is required."}); return; }
    if (!hasValidSupabaseEnv()) { setMsg({tone:"warn", text:"Supabase is required for multi-user login. Check Vercel env and redeploy."}); return; }
    setBusy(true); setMsg({tone:"info", text:"Checking user access..."});
    try {
      const found = await fetchProductionUserByEmail(email);
      if (found.error) { setMsg({tone:"warn", text:`Could not read user registry: ${found.error.message}`}); return; }
      const user = found.data;
      if (!user) { setMsg({tone:"warn", text:"No approved user found for this email. Create account / Request Access first."}); setMode("request"); return; }
      const status = String(user.access_status || (user.is_active === false ? "pending" : "approved")).toLowerCase();
      if (status !== "approved") { setMsg({tone:"warn", text:`Access is ${status}. Ask Admin/Production Manager to approve in Users/Audit.`}); return; }
      const hash = await hashLoginPassword(email, form.password || "");
      if (user.password_hash && user.password_hash !== hash) { setMsg({tone:"warn", text:"Incorrect password for this email."}); return; }
      if (!user.password_hash) await updateProductionUserAccess(email, { password_hash:hash });
      const clean = saveCurrentUserProfile({
        name:user.display_name || user.user_name || displayNameFromEmail(email), email,
        role:user.role || "Data Operator", department:user.department || user.requested_department || "Production",
        requested_role:user.requested_role || user.role || "Data Operator", requested_department:user.requested_department || user.department || "Production",
        access_status:"approved", password_hash:hash, permissions:user.permissions || []
      });
      try { localStorage.setItem("production_login_remember", remember ? "1" : "0"); } catch {}
      await recordUserSession("login", clean, { force, remember, note:"Production DPR Merch Tracker style login" });
      onSave?.(clean);
    } finally { setBusy(false); }
  }
  async function requestAccess(){
    const email = normalizeUserEmail(form.email);
    if (!emailLooksValid(email)) { setMsg({tone:"warn", text:"Enter a valid work email."}); return; }
    if (!String(form.password || "").trim()) { setMsg({tone:"warn", text:"Create a password for this Production login request."}); return; }
    if (!String(form.name || "").trim()) { setMsg({tone:"warn", text:"Enter display name so Admin can identify the user."}); return; }
    setBusy(true); setMsg({tone:"info", text:"Saving access request..."});
    try {
      const existing = await fetchProductionUserByEmail(email);
      if (existing.data && String(existing.data.access_status || "approved").toLowerCase() === "approved") { setMsg({tone:"warn", text:"This email already has approved access. Sign in instead."}); setMode("login"); return; }
      const res = await requestProductionAccess({ ...form, email, requested_role:requestedRole, requested_department:form.requested_department || form.department || "Production" });
      if (res.error) { setMsg({tone:"warn", text:`Access request failed: ${res.error.message}`}); return; }
      setMsg({tone:"ok", text:"Account request saved. Admin / Production Manager must approve your role in Users/Audit before login."});
    } finally { setBusy(false); }
  }
  const isLogin = mode === "login";
  const submit = isLogin ? doLogin : requestAccess;
  return <div className="mt-login-page no-print">
    <div className="mt-login-card">
      <div className="mt-login-left">
        <div>
          <div className="mt-login-brand">KOTHARI SPORTS & APPARELS</div>
          <div className="mt-login-product">Production DPR</div>
          <div className="mt-login-copy">Live WIP command center for cutting, printing, embroidery, stitching, checking, packing, dispatch and review history.</div>
          <div className="mt-login-feature-grid">
            <div className="mt-login-feature"><b>WIP</b><span>Current status</span></div>
            <div className="mt-login-feature"><b>DPR</b><span>Daily entry</span></div>
            <div className="mt-login-feature"><b>REVIEW</b><span>Audit + reconcile</span></div>
            <div className="mt-login-feature"><b>REPORTS</b><span>Management clarity</span></div>
          </div>
        </div>
        <div className="mt-login-note">Use the same work email direction as Merch Tracker. Production entries are quantity truth: every save, correction, backdate and approval is stamped to the logged-in user.</div>
      </div>
      <div className="mt-login-right">
        <div className="mt-login-title">{isLogin ? "Welcome back" : "Create account"}</div>
        <div className="mt-login-subcopy">{isLogin ? "Sign in to continue to the live production tracker." : "Request access first. Admin / Production Manager assigns the final role."}</div>
        <label className="mt-login-field-label">Email</label>
        <input className="mt-login-input" value={form.email || ""} onChange={e=>setForm(f=>({ ...f, email:normalizeUserEmail(e.target.value), name:f.name || displayNameFromEmail(e.target.value) }))} placeholder="name@company.com" autoFocus />
        <label className="mt-login-field-label">Password</label>
        <input className="mt-login-input" type="password" value={form.password || ""} onChange={e=>setForm(f=>({ ...f, password:e.target.value }))} placeholder="••••••••" onKeyDown={e=>{ if(e.key === "Enter") submit(); }} />
        {!isLogin && <>
          <label className="mt-login-field-label">Display name</label>
          <input className="mt-login-input" value={form.name || ""} onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} placeholder="User name shown in audit history" />
          <div className="mt-login-access-grid">
            <div><label className="mt-login-field-label">Requested role</label><select className="mt-select" style={{width:"100%"}} value={requestedRole} onChange={e=>setForm(f=>({ ...f, requested_role:e.target.value }))}>{PRODUCTION_ROLES.filter(r=>r!=="Super Admin").map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="mt-login-field-label">Department</label><select className="mt-select" style={{width:"100%"}} value={form.requested_department || form.department || "Production"} onChange={e=>setForm(f=>({ ...f, requested_department:e.target.value, department:e.target.value }))}>{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
          </div>
        </>}
        {isLogin && <label className="mt-small" style={{display:"flex", alignItems:"center", gap:8, marginTop:12}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Keep me signed in</label>}
        {msg && <div className={`mt-login-msg ${statusClass(msg.tone)}`}>{msg.text}</div>}
        <button className="mt-login-submit" disabled={busy} onClick={submit}>{busy ? "Please wait..." : isLogin ? "Sign in" : "Submit request"}</button>
        <div className="mt-login-minor">
          {isLogin ? <><span>New here?</span><button className="mt-login-link" onClick={()=>{ setMode("request"); setMsg(null); }}>Create account</button></> : <><span>Already approved?</span><button className="mt-login-link" onClick={()=>{ setMode("login"); setMsg(null); }}>Sign in</button></>}
          {!force && <button className="mt-login-link" onClick={onClose}>Cancel</button>}
        </div>
        {!isLogin && <div className="mt-login-access-panel"><b>Access logic</b><div className="mt-small" style={{marginTop:5}}>Pending users cannot open production screens. Approval is done from Users/Audit by Super Admin, Admin or Production Manager.</div></div>}
      </div>
    </div>
  </div>;
}

function UserAuditView({ profile, onSwitchUser, onLogout, presenceRows=[] }){
  const [audit,setAudit] = useState([]);
  const [users,setUsers] = useState([]);
  const [msg,setMsg] = useState(null);
  const [loading,setLoading] = useState(false);
  async function refresh(){
    setLoading(true); setMsg({tone:"info", text:"Loading users and audit history..."});
    try {
      const u = await fetchProductionUsers();
      const a = await fetchProductionAudit(300);
      setUsers(u.data || []); setAudit(a.data || []);
      const warnings = [u.error ? `Users: ${u.error.message}` : "", a.error ? `Audit: ${a.error.message}` : ""].filter(Boolean);
      setMsg(warnings.length ? {tone:"warn", text:`Could not read all governance tables. Run the V6 SQL patch. ${warnings.join(" | ")}`} : {tone:"ok", text:`Loaded ${u.data?.length || 0} users and ${a.data?.length || 0} audit rows.`});
    } finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); }, []);
  const perms = ROLE_PERMISSIONS[profile.role] || [];
  const localHistory = safeJsonLoad(uiStorageKey("tab_history"), []);
  const canManage = isFullAccessRole(profile.role) || currentUserCan("production.manage_users");
  const pendingUsers = (users || []).filter(u=>String(u.access_status || (u.is_active === false ? "pending" : "approved")).toLowerCase() !== "approved");
  async function approveUser(u, role){
    if (!canManage) { setMsg({tone:"warn", text:"Only Super Admin/Admin/Production Manager can approve users."}); return; }
    const res = await updateProductionUserAccess(u.email, { role, department:u.requested_department || u.department || "Production", access_status:"approved", is_active:true, approved_by:profile.email || profile.name, approved_at:new Date().toISOString() });
    setMsg(res.error ? {tone:"warn", text:`Approve failed: ${res.error.message}`} : {tone:"ok", text:`Approved ${u.email} as ${role}.`});
    await recordProductionAudit("approve_user", { table_name:"production_app_users", source:"Users/Audit", metadata:{ email:u.email, role } });
    refresh();
  }
  async function rejectUser(u){
    if (!canManage) { setMsg({tone:"warn", text:"Only Super Admin/Admin/Production Manager can reject users."}); return; }
    const res = await updateProductionUserAccess(u.email, { access_status:"rejected", is_active:false, approved_by:profile.email || profile.name, rejected_at:new Date().toISOString() });
    setMsg(res.error ? {tone:"warn", text:`Reject failed: ${res.error.message}`} : {tone:"ok", text:`Rejected ${u.email}.`});
    await recordProductionAudit("reject_user", { table_name:"production_app_users", source:"Users/Audit", metadata:{ email:u.email } });
    refresh();
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Users / Login Requests / Permissions / History</h3><div className="mt-panel-sub">Proper production login flow: users request access with email/password, then Super Admin/Admin/Production Manager assigns role. SQL patch V6 adds password/status columns.</div></div><div className="mt-section no-print"><div className="mt-toolbar"><span className="mt-chip mt-info"><UserCheck size={12}/>{profile.name || "Not logged in"}</span><span className="mt-chip mt-muted">{profile.role}</span><span className="mt-chip mt-muted">{profile.department || "—"}</span><button className="mt-btn" onClick={refresh} disabled={loading}><RefreshCw size={14}/>Refresh History</button><button className="mt-btn ghost" onClick={onSwitchUser}><Users size={14}/>Switch User</button><button className="mt-btn ghost" onClick={onLogout}><LogOut size={14}/>Logout</button>{msg && <span className={`mt-chip ${statusClass(msg.tone)}`}>{msg.text}</span>}</div></div><div className="mt-section"><h3 className="mt-panel-title">Current Role Permissions</h3><div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>{PRODUCTION_PERMISSIONS.map(([key,label])=><span key={key} className={`mt-chip ${isFullAccessRole(profile.role) || perms.includes(key) ? "mt-ok" : "mt-muted"}`}>{label}</span>)}</div><div className="mt-small" style={{marginTop:8}}>Last local tab history: {localHistory.length ? localHistory.join(" → ") : "No tab history yet"}</div></div>
    <div className="mt-section"><h3 className="mt-panel-title">Pending login requests</h3><div className="mt-panel-sub">Approve user role here. Pending users cannot open production screens.</div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>User</th><th>Email</th><th>Requested Role</th><th>Department</th><th>Status</th><th>Approve As</th><th>Action</th></tr></thead><tbody>{pendingUsers.length ? pendingUsers.map(u=>{ const role=u.requested_role || "Data Operator"; return <tr key={u.email}><td>{u.display_name || u.user_name || displayNameFromEmail(u.email)}</td><td>{u.email}</td><td>{role}</td><td>{u.requested_department || u.department}</td><td><span className="mt-chip mt-warn">{u.access_status || "pending"}</span></td><td><select className="mt-select" defaultValue={role} onChange={e=>u.__approveRole=e.target.value}>{PRODUCTION_ROLES.filter(r=>r!=="Super Admin").map(r=><option key={r} value={r}>{r}</option>)}</select></td><td><button className="mt-btn" disabled={!canManage} onClick={()=>approveUser(u, u.__approveRole || role)}>Approve</button><button className="mt-btn ghost" disabled={!canManage} onClick={()=>rejectUser(u)}>Reject</button></td></tr>; }) : <tr><td colSpan="7">No pending requests.</td></tr>}</tbody></table></div></div>
    <SimpleTable title="Live presence — who is where now" sub="Supabase realtime presence. Shows current page/context, selected style/stage/drawer where available." rows={presenceRows.map(p=>({ User:p.User, Role:p.Role, Page:p.Page, Context:p.Context, Order:p.Order, Style:p.Style, Stage:p.Stage, Email:p.Email, Browser:p.Browser, Seen:p.Seen }))} empty="No live peers yet. Presence appears when multiple approved users keep the app open." exportName="production_live_presence"/><div style={{height:12}}/><SimpleTable title="Active / recent users" sub="From production_app_users. Shows approved users, requested users and recent browser access." rows={(users||[]).map(u=>({ User:u.display_name || u.user_name, Role:u.role, Requested_Role:u.requested_role, Department:u.department || u.requested_department, Email:u.email, Status:u.access_status || (u.is_active ? "approved" : "pending"), Current_Page:u.login_note || "—", Last_Seen:u.last_seen_at || u.created_at, Browser:u.browser_id }))} empty="No user rows yet. Run SQL patch and submit/approve one user." exportName="production_active_users"/><div style={{height:12}}/><SimpleTable title="Audit history — detailed" sub="Latest saves/corrections/sessions. Date column is production activity date where available; Time is when user actually typed/saved it." rows={(audit||[]).map(a=>({ Time:a.created_at, Activity_Date:a.entry_date || String(a.created_at||"").slice(0,10), User:a.user_name, Role:a.user_role, Action:a.action || a.event_type, Table:a.table_name, Order:a.order_no, Style:a.style_no, Colour:a.colour, Component:a.component, Dept:stageLabel(a.stage || ""), Activity:a.entry_type, Qty:a.qty, Source:a.source }))} empty="No audit rows yet or SQL patch not run." exportName="production_audit_history"/></div>;
}

export default function App(){
  const [tab,setTab] = useState(()=>safeJsonLoad(uiStorageKey("active_tab"), "dashboard"));
  const [settingsTick,setSettingsTick] = useState(0);
  const [rows,setRows] = useState(()=>loadInitialRows());
  const [ledger,setLedger] = useState(()=>loadInitialLedger());
  const [planRows,setPlanRows] = useState(()=>loadInitialPlanRows());
  const [query,setQuery] = useState(()=>safeJsonLoad(uiStorageKey("global_query"), ""));
  const [buyer,setBuyer] = useState(()=>safeJsonLoad(uiStorageKey("global_buyer"), "All"));
  const [order,setOrder] = useState(()=>safeJsonLoad(uiStorageKey("global_order"), "All"));
  const [cleanMode,setCleanMode] = useState(()=>safeJsonLoad(uiStorageKey("clean_mode"), true));
  const [navCollapsed,setNavCollapsed] = useState(()=>safeJsonLoad(uiStorageKey("left_nav_collapsed"), false));
  const [drawer,setDrawer] = useState(null);
  const [dashboardDrill,setDashboardDrill] = useState(null);
  const [registerFocus,setRegisterFocus] = useState(null);
  const [styleFocus,setStyleFocus] = useState(null);
  const [entryFocus,setEntryFocus] = useState(null);
  const [releaseFocus,setReleaseFocus] = useState(null);
  const [notice,setNotice] = useState(null);
  const [sharedSync,setSharedSync] = useState(()=>hasValidSupabaseEnv() ? { tone:"warn", text:"Shared sync starting…" } : { tone:"late", text:"Supabase not configured" });
  const [planSaveState,setPlanSaveState] = useState(()=>hasValidSupabaseEnv() ? { tone:"warn", text:"Plan sync starting…" } : { tone:"warn", text:"Plan browser-only" });
  const [clearFiltersTick,setClearFiltersTick] = useState(0);
  const [showUpdatePopup,setShowUpdatePopup] = useState(()=>{
    try { return localStorage.getItem("production_app_seen_version") !== APP_VERSION; } catch { return true; }
  });
  const [userProfile,setUserProfile] = useState(()=>currentUserProfile());
  const [showLogin,setShowLogin] = useState(()=>{ const p=currentUserProfile(); return !p.name || !emailLooksValid(p.email) || (p.access_status && p.access_status !== "approved"); });
  const [presenceRows,setPresenceRows] = useState([]);
  const presenceChannelRef = useRef(null);
  useEffect(()=>{ setProductionAppBrowserIdentity(); }, []);
  useEffect(()=>{ safeJsonSave(LOCAL_ROWS_KEY, rows); }, [rows]);
  useEffect(()=>{ if (userProfile?.name && emailLooksValid(userProfile.email) && (!userProfile.access_status || userProfile.access_status === "approved")) { saveCurrentUserProfile(userProfile); upsertProductionAppUser(userProfile); recordUserSession("app_open", userProfile, { tab }); } }, [userProfile?.name, userProfile?.role, userProfile?.department, userProfile?.access_status]);
  useEffect(()=>{ safeJsonSave(LOCAL_LEDGER_KEY, ledger); }, [ledger]);
  useEffect(()=>{ safeJsonSave(LOCAL_PLAN_KEY, planRows); }, [planRows]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_query"), query), [query]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_buyer"), buyer), [buyer]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_order"), order), [order]);
  useEffect(()=>safeJsonSave(uiStorageKey("clean_mode"), cleanMode), [cleanMode]);
  useEffect(()=>safeJsonSave(uiStorageKey("left_nav_collapsed"), navCollapsed), [navCollapsed]);
  useEffect(()=>{
    safeJsonSave(uiStorageKey("active_tab"), tab);
    const history = safeJsonLoad(uiStorageKey("tab_history"), []);
    const next = [tab, ...history.filter(x=>x!==tab)].slice(0,8);
    safeJsonSave(uiStorageKey("tab_history"), next);
  }, [tab]);
  useEffect(()=>{
    if (!userProfile?.name || !emailLooksValid(userProfile?.email) || (userProfile?.access_status && userProfile.access_status !== "approved") || !hasValidSupabaseEnv()) return;
    updateProductionUserAccess(userProfile.email, { login_note:`Active page: ${tab}`, browser_id:productionBrowserId(), last_seen_at:new Date().toISOString() });
  }, [tab, userProfile?.email, userProfile?.access_status]);
  useEffect(()=>{
    if (!userProfile?.name || !emailLooksValid(userProfile?.email) || (userProfile?.access_status && userProfile.access_status !== "approved") || !isSupabaseConfigured || !supabase || !hasValidSupabaseEnv()) return;
    let cancelled=false;
    const key = `${normalizeUserEmail(userProfile.email)}:${productionBrowserId()}`;
    const channel = supabase.channel("production-dpr-live-presence", { config:{ presence:{ key } } });
    presenceChannelRef.current = channel;
    const syncPresence = ()=>{ if (!cancelled) setPresenceRows(flattenProductionPresenceState(channel.presenceState())); };
    channel.on("presence", { event:"sync" }, syncPresence);
    channel.on("presence", { event:"join" }, syncPresence);
    channel.on("presence", { event:"leave" }, syncPresence);
    channel.subscribe(async (status)=>{
      if (status === "SUBSCRIBED") {
        await channel.track(buildProductionPresencePayload(userProfile, tab, drawer, dashboardDrill));
        syncPresence();
      }
    });
    const timer=setInterval(()=>channel.track(buildProductionPresencePayload(userProfile, tab, drawer, dashboardDrill)), 15000);
    return ()=>{
      cancelled=true; clearInterval(timer); setPresenceRows([]);
      try { channel.untrack(); } catch {}
      if (supabase?.removeChannel) supabase.removeChannel(channel);
      if (presenceChannelRef.current === channel) presenceChannelRef.current = null;
    };
  }, [userProfile?.email, userProfile?.name, userProfile?.role, userProfile?.access_status]);
  useEffect(()=>{
    const channel = presenceChannelRef.current;
    if (!channel || !userProfile?.name || !emailLooksValid(userProfile?.email) || (userProfile?.access_status && userProfile.access_status !== "approved")) return;
    channel.track(buildProductionPresencePayload(userProfile, tab, drawer, dashboardDrill));
    updateProductionUserAccess(userProfile.email, { login_note:`Active page: ${productionPresenceContext(tab, drawer, dashboardDrill)}`, browser_id:productionBrowserId(), last_seen_at:new Date().toISOString() });
  }, [tab, drawer?.row?.id, drawer?.stage, dashboardDrill?.title, userProfile?.email, userProfile?.access_status]);
  const sharedLedgerRows = useMemo(()=>applySharedLedgerTotalsToRows(rows, ledger), [rows, ledger]);
  const conservationCount = useMemo(()=>conservationViolationRows(sharedLedgerRows).length, [sharedLedgerRows]);
  const calcRows = useMemo(()=>withLiveIdle(sharedLedgerRows, ledger, today()), [sharedLedgerRows, ledger]);
  const buyers = ["All", ...Array.from(new Set(calcRows.map(r=>r.buyer).filter(Boolean))).sort()];
  const orders = Array.from(new Set(calcRows.map(r=>r.order_no).filter(Boolean))).sort();
  const visibleRows = useMemo(()=>calcRows.filter(r=>{
    const q = query.trim().toLowerCase();
    const okBuyer = buyer === "All" || r.buyer === buyer;
    const okOrder = order === "All" || r.order_no === order;
    if (!q) return okBuyer && okOrder;
    const hay = [r.order_no,r.style_no,r.buyer,r.colour,r.component,r.set_id].join(" ").toLowerCase();
    return okBuyer && okOrder && hay.includes(q);
  }),[calcRows,query,buyer,order]);
  async function savePlanRowShared(planRow, ctx={}){
    const row = normalizePlanRowForState(planRow);
    const validation = planValidationSnapshot(row, calcRows, planRows, ledger);
    if (!hasValidSupabaseEnv()) { setPlanSaveState({ tone:"warn", text:"Plan saved locally only — Supabase missing" }); return { skipped:true }; }
    setPlanSaveState({ tone:"warn", text:"Saving plan…" });
    const result = await robustUpsertPlanRowsToSupabase([{ ...row, validation_status:validation.level, validation_message:validation.message }], calcRows, planRows, ledger);
    if (result?.error) { setPlanSaveState({ tone:"late", text:`Plan not shared: ${result.error.message}` }); return result; }
    if (result?.warning || result?.skipped) { setPlanSaveState({ tone:"warn", text:"Plan saved locally only" }); return result; }
    setPlanSaveState({ tone:validation.tone === "late" ? "warn" : "ok", text:`Plan shared · ${validation.level}` });
    recordProductionAudit("plan_upsert", { table_name:"production_plan_rows", order_no:row.order_no, style_no:row.style_no || row.style_input, colour:row.colour, component:row.component, stage:row.dept, entry_type:"plan", entry_date:row.plan_date, qty:row.planned_qty, source:"Planning", metadata:{ line:row.line, validation, ctx } });
    return result;
  }
  async function deletePlanCellShared(planRow, ctx={}){
    const row = normalizePlanRowForState(planRow);
    if (!hasValidSupabaseEnv()) { setPlanSaveState({ tone:"warn", text:"Plan cleared locally only — Supabase missing" }); return { skipped:true }; }
    setPlanSaveState({ tone:"warn", text:"Clearing plan…" });
    const result = await fetchDeletePlanRowFromSupabase(row);
    if (result?.error) { setPlanSaveState({ tone:"late", text:`Plan clear not shared: ${result.error.message}` }); return result; }
    setPlanSaveState({ tone:"ok", text:"Plan cleared/shared" });
    recordProductionAudit("plan_delete", { table_name:"production_plan_rows", order_no:row.order_no, style_no:row.style_no || row.style_input, colour:row.colour, component:row.component, stage:row.dept, entry_type:"plan", entry_date:row.plan_date, qty:row.planned_qty, source:"Planning", metadata:{ line:row.line, ctx } });
    return result;
  }

  function markVersionSeen(){
    try { localStorage.setItem("production_app_seen_version", APP_VERSION); } catch {}
    setShowUpdatePopup(false);
  }
  async function pullSharedData(silent=true, reason="manual"){
    if(!isSupabaseConfigured || !supabase || !hasValidSupabaseEnv()) {
      const msg = supabaseConfigWarning();
      if (!silent) setNotice({tone:"warn", text:msg});
      setSharedSync({tone:"late", text:"Shared sync OFF — Supabase config issue"});
      return { error:{ message:msg } };
    }
    try {
      const {data,error} = await supabase.from("production_orders").select("*").limit(1000).order("created_at",{ascending:false});
      if(error){
        if (!silent) setNotice({tone:"late", text:error.message});
        setSharedSync({tone:"late", text:`Shared pull failed: ${error.message}`});
        return { error };
      }
      const {data:entryData,error:entryError} = await supabase.from("production_entries").select("*").limit(10000).order("entry_date",{ascending:false});
      if(entryError){
        setRows(filterDeletedStyles((data || []).map(supabaseToOrder)));
        if (!silent) setNotice({tone:"warn", text:`Pulled orders, but entries failed: ${entryError.message}`});
        setSharedSync({tone:"warn", text:`Orders shared · entries pull failed`});
        return { error:entryError };
      }
      let planData = null, planError = null;
      try {
        const planRes = await supabase.from("production_plan_rows").select("*").limit(5000).order("plan_date",{ascending:false});
        planData = planRes.data; planError = planRes.error;
      } catch(e) { planError = { message:e?.message || String(e) }; }
      setRows(filterDeletedStyles((data || []).map(supabaseToOrder)));
      setLedger(entryData || []);
      if (!planError) {
        setPlanRows((planData || []).map(supabaseToPlanRow));
        setPlanSaveState({ tone:"ok", text:`Plan shared · ${planData?.length || 0} rows` });
      } else {
        setPlanSaveState({ tone:"warn", text:"Plan local only — run V6 SQL" });
      }
      const stamp = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
      setSharedSync({tone:planError?"warn":"ok", text:`Shared live · ${data?.length || 0} orders · ${entryData?.length || 0} entries · ${planError?"plan SQL pending":`${planData?.length || 0} plans`} · ${stamp}`});
      if (!silent) setNotice({ tone:planError?"warn":"ok", text:`Pulled shared Supabase data: ${data?.length || 0} orders, ${entryData?.length || 0} entries${planError ? "; planning table not ready — run V6 SQL" : `, ${planData?.length || 0} plan rows`}. Reason: ${reason}.` });
      return { error:null, orders:data || [], entries:entryData || [], plans:planData || [] };
    } catch(e) {
      const msg = e?.message || "Shared pull failed";
      if (!silent) setNotice({tone:"late", text:msg});
      setSharedSync({tone:"late", text:msg});
      return { error:{ message:msg } };
    }
  }
  useEffect(()=>{
    if(!isSupabaseConfigured || !supabase || !hasValidSupabaseEnv()) return;
    let cancelled = false;
    let debounceTimer = null;
    function requestPull(reason="realtime"){
      if (cancelled) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(()=>{ if (!cancelled) pullSharedData(true, reason); }, 550);
    }
    const first = setTimeout(()=>pullSharedData(true, "startup"), 350);
    const timer = setInterval(()=>pullSharedData(true, "10s poll"), 10000);
    const onFocus = ()=>pullSharedData(true, "browser focus");
    const onVisible = ()=>{ if (document.visibilityState === "visible") pullSharedData(true, "tab visible"); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    let channel = null;
    try {
      channel = supabase.channel("production-dpr-shared-sync")
        .on("postgres_changes", { event:"*", schema:"public", table:"production_orders" }, ()=>requestPull("orders realtime"))
        .on("postgres_changes", { event:"*", schema:"public", table:"production_entries" }, ()=>requestPull("entries realtime"))
        .on("postgres_changes", { event:"*", schema:"public", table:"production_plan_rows" }, ()=>requestPull("plan realtime"))
        .subscribe(status=>{
          if (status === "SUBSCRIBED") setSharedSync({ tone:"ok", text:"Shared live sync ON" });
          if (["CHANNEL_ERROR","TIMED_OUT"].includes(status)) setSharedSync({ tone:"warn", text:`Realtime ${status}; 10s polling still ON` });
        });
    } catch {
      setSharedSync({ tone:"warn", text:"Realtime unavailable; 10s polling ON" });
    }
    return ()=>{
      cancelled = true;
      clearTimeout(first); clearTimeout(debounceTimer); clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      if (channel && supabase?.removeChannel) supabase.removeChannel(channel);
    };
  }, []);
  async function recalculateStageQtyFromLedger(){
    const perm = requireCurrentPermission("production.manage_settings", "recalculate production totals from ledger");
    if (perm) { setNotice({ tone:"late", text:perm.error.message }); return; }
    if(!hasValidSupabaseEnv()){ setNotice({tone:"warn", text:supabaseConfigWarning()}); return; }
    const stats = ledgerRecalcStats(rows, ledger);
    if (!stats.ledgerStyleCount || !stats.rowsToSave.length) {
      setNotice({ tone:"warn", text:"No matching production_entries ledger rows found for current styles. Nothing recalculated." });
      return;
    }
    const ok = window.confirm(`ADMIN LEDGER RECALC

This will rebuild production_orders.stage_qty from production_entries for ${stats.ledgerStyleCount} style/component row(s).

Changed snapshots: ${stats.changedRows.length}
Ledger rows used: ${stats.ledgerRowCount}
Rows with no ledger left untouched: ${stats.untouchedNoLedgerCount}

This does not delete ledger rows. It only rewrites the stored stage_qty snapshot so old totals stop disagreeing with the ledger. Take a Supabase backup first if this is live production data.

Continue?`);
    if (!ok) return;
    setNotice({ tone:"warn", text:`Recalculating ${stats.rowsToSave.length} stage_qty snapshot row(s) from ledger…` });
    const result = await robustUpsertOrdersToSupabase(stats.rowsToSave);
    if (result?.error) { setNotice({ tone:"late", text:`Ledger recalculation failed: ${result.error.message}` }); return; }
    if (result?.warning || result?.skipped) { setNotice({ tone:"warn", text:result.warning || "Ledger recalculation stayed browser-only because Supabase is unavailable." }); return; }
    setRows(stats.derivedRows);
    setSharedSync({ tone:"ok", text:`Ledger recalculated · ${stats.rowsToSave.length} snapshots saved` });
    setNotice({ tone:"ok", text:`Recalculated stage_qty from ledger for ${stats.rowsToSave.length} style/component row(s). ${stats.changedRows.length} snapshot(s) changed; ${stats.untouchedNoLedgerCount} row(s) without ledger were left untouched. ${supabaseSaveLabel(result)}` });
    recordProductionAudit("stage_qty_recalculate_from_ledger", { table_name:"production_orders", qty:stats.rowsToSave.length, source:"Admin ledger recalculation", metadata:{ changed_snapshots:stats.changedRows.length, ledger_styles:stats.ledgerStyleCount, ledger_rows_used:stats.ledgerRowCount, untouched_no_ledger:stats.untouchedNoLedgerCount, via:result.via || "supabase" } });
    setTimeout(()=>pullSharedData(true, "after ledger recalculation"), 900);
  }
  async function pullSupabase(){
    await pullSharedData(false, "manual refresh");
  }
  function handleSharedSave(result, label="Shared save"){
    if (result?.error) { setSharedSync({ tone:"late", text:`${label} not shared: ${result.error.message}` }); return; }
    if (result?.warning || result?.skipped) { setSharedSync({ tone:"warn", text:`${label}: browser-only until Supabase is fixed` }); return; }
    setSharedSync({ tone:"ok", text:`${label} saved to Supabase · refreshing shared data…` });
    setTimeout(()=>pullSharedData(true, `${label} after-save refresh`), 700);
  }
  function openReleaseFromAnyScreen(row, source=""){
    if (!row) return;
    setReleaseFocus({ row, source, ts:Date.now() });
  }
  async function saveProductionFileRelease(row, payload={}){
    const permission = requireCurrentPermission("production.edit_styles", "release production file to Cutting");
    if (permission) { setNotice({ tone:"late", text:permission.error.message }); return; }
    const qty = n(payload.qty);
    const date = String(payload.date || today()).slice(0,10);
    const reason = String(payload.reason || "Production file released to Cutting").trim();
    if (!row || !qty || qty <= 0) { setNotice({ tone:"late", text:"Release qty must be more than 0." }); return; }
    if (qty > n(row.order_qty) * (1 + cuttingToleranceFrac()) && !payload.managerOverride) {
      setNotice({ tone:"late", text:`Release qty ${fmt(qty)} is above order qty ${fmt(row.order_qty)} + cutting tolerance ${PROD_SETTINGS.cuttingTolerancePct}%. Use manager override in the release modal if this old style is approved.` });
      return;
    }
    const key = styleCompositeKey(row);
    const baseRow = rows.find(r=>styleCompositeKey(r)===key) || row;
    const calcRow = calcRows.find(r=>styleCompositeKey(r)===key) || row;
    const updatedBase = { ...baseRow, file_released_qty:qty, file_released_date:date };
    const updatedForSave = { ...calcRow, file_released_qty:qty, file_released_date:date };
    setRows(prev=>prev.map(r=>styleCompositeKey(r)===key ? { ...r, file_released_qty:qty, file_released_date:date } : r));
    setReleaseFocus(null);
    setNotice({ tone:"warn", text:`Saving production file release for ${row.style_no} · ${fmt(qty)} pcs…` });
    const result = await robustUpsertOrdersToSupabase([updatedForSave]);
    if (result?.error) { setNotice({ tone:"late", text:`Release saved locally, Supabase failed: ${result.error.message}` }); return; }
    if (result?.warning || result?.skipped) { setNotice({ tone:"warn", text:`Release saved locally only: ${result.warning || "Supabase skipped"}` }); return; }
    recordProductionAudit("production_file_release", { table_name:"production_orders", order_no:row.order_no, style_no:row.style_no, colour:row.colour, component:row.component, entry_type:"production_file_release", entry_date:date, qty, source:payload.source || releaseFocus?.source || "Release modal", metadata:{ reason, manager_override:!!payload.managerOverride, previous_qty:fileReleaseQty(baseRow), previous_date:fileReleaseDate(baseRow), released_size_qty:fileReleaseSizeQtyMap(updatedBase) } });
    setNotice({ tone:"ok", text:`Production file released: ${row.style_no} · ${fmt(qty)} pcs · ${date}. Cutting feed is now active.` });
    handleSharedSave(result, "Production file release");
  }
  async function seedSupabase(){
    if(!hasValidSupabaseEnv()){ setNotice({tone:"warn", text:supabaseConfigWarning()}); return; }
    try {
      const result = await robustUpsertOrdersToSupabase(rows);
      if(result.error){ setNotice({tone:"late", text:result.error.message}); return; }
      if(result.warning){ setNotice({tone:"warn", text:result.warning}); return; }
      setNotice({tone:result.recoveredFrom ? "warn" : "ok", text:`Synced ${result.savedCount ?? rows.length} current browser/app rows to Supabase production_orders. ${supabaseSaveLabel(result)}${shortRecoveredSupabaseNote(result.recoveredFrom)}`});
    } catch(e) {
      setNotice({tone:"late", text:e?.message || "Supabase sync failed. Check VITE_SUPABASE_URL / RLS policies."});
    }
  }
  async function testSupabaseConnection(){
    setNotice({tone:"info", text:"Testing Supabase read, upsert, read-back and verified delete..."});
    const result = await runSupabaseSmokeTest();
    setNotice(result);
  }
  function openRegisterFromWip(row, stage, activity="all"){
    setRegisterFocus({
      id:uid("regfocus"),
      order_no:row?.order_no || "",
      style_no:row?.style_no || "",
      colour:row?.colour || "",
      component:row?.component || "",
      stage:stage || "all",
      activity
    });
    setDrawer(null);
    setTab("register");
  }
  function openStyleFromWip(row){
    if (!row) return;
    setStyleFocus({ id:row.id, key:styleCompositeKey(row), ts:Date.now() });
    setDrawer(null);
    setTab("styles");
  }
  function openEntryFromWip(row, stage, field="output"){
    if (!row) return;
    // Drilldown must not mutate the global/WIP filters. Earlier versions set the
    // page-level order/query here, which made the WIP grid go to 0 rows and also
    // meant DPR Entry sometimes received an already-filtered row list before the
    // focus effect could find the style. The focus object is enough to open the
    // exact style in DPR Style View.
    setEntryFocus({
      id:uid("entryfocus"),
      rowKey:styleCompositeKey(row),
      rowId:row.id,
      stage:stage || "cutting",
      field:field || "output",
      viewMode:"style",
      order_no:row.order_no || "",
      style_no:row.style_no || "",
      colour:row.colour || "",
      component:row.component || ""
    });
    setDrawer(null);
    setTab("entry");
  }
  function clearAllScreenFilters(){
    setQuery("");
    setBuyer("All");
    setOrder("All");
    setRegisterFocus(null);
    setDashboardDrill(null);
    const keys = [
      "global_query","global_buyer","global_order",
      "wip_search","wip_dept","wip_issue","wip_owner","wip_route","wip_view_mode","wip_column_filters",
      "register_from","register_to","register_dept","register_activity","register_query",
      "monthly_buyer","monthly_focus","monthly_route",
      "chase_q","chase_issue","chase_dept"
    ];
    try { keys.forEach(k=>localStorage.removeItem(uiStorageKey(k))); } catch {}
    setClearFiltersTick(t=>t+1);
    setNotice({tone:"ok", text:"Cleared filters across screens. Draft entry quantities are kept unless you clear them inside the entry screen."});
  }
  function exportAll(){
    const pack = buildReportSheets(visibleRows, ledger);
    exportXlsx(`production_dpr_${APP_VERSION.toLowerCase().replace(/[^a-z0-9]+/g,"_")}_horizontal_quick_export.xlsx`,[
      { name:"Factory Summary", rows:pack.factorySummary },
      { name:"Live WIP", rows:pack.wipStatus },
      { name:"Owner Chase", rows:pack.ownerRows },
      { name:"Completed Not Issued", rows:pack.completedNotIssued },
      { name:"Received Not Processed", rows:pack.receivedNotProcessed },
      { name:"Reject Alter Missing", rows:pack.ramRows },
      { name:"Reconcile", rows:pack.reconcile },
      { name:"Backdated Audit", rows:pack.ledgerRows },
    ]);
  }
  function tabPermission(k){
    if (["entry"].includes(k)) return "production.entry_dpr";
    if (["register"].includes(k)) return "production.correct_entry";
    if (["styles"].includes(k)) return "production.edit_styles";
    if (["routes"].includes(k)) return "production.manage_routes";
    if (["photos"].includes(k)) return "production.manage_photos";
    if (["reports","monthly"].includes(k)) return "production.export";
    if (["settings"].includes(k)) return "production.manage_settings";
    if (["users"].includes(k)) return "production.audit_view";
    return "production.view";
  }
  function canOpenTab(k){ return currentUserCan(tabPermission(k)); }
  useEffect(()=>{ if (userProfile?.name && !canOpenTab(tab)) setTab("dashboard"); }, [userProfile?.name, userProfile?.role, tab]);
  async function logoutUser(){
    await recordUserSession("logout", userProfile, { note:"User clicked logout" });
    clearCurrentUserProfile();
    const blank = defaultUserProfile();
    setUserProfile(blank);
    setShowLogin(true);
    setNotice({ tone:"warn", text:"Logged out. Login is required before production entry/edit actions." });
  }
  const tabs = [
    ["dashboard","Dashboard",BarChart3], ["manager","Manager",ShieldCheck], ["planning","Planning",ClipboardList], ["wip", conservationCount ? `Live WIP ⚠${conservationCount}` : "Live WIP", Warehouse], ["entry","DPR Entry",ClipboardList], ["register","Register",FileSpreadsheet], ["review","Review",ShieldCheck], ["owners","Who to Chase",Users], ["monthly","Monthly",FileSpreadsheet], ["styles","Styles",Shirt], ["routes","Routes",Filter], ["photos","Photos",ImageIcon], ["reports","Reports",FileSpreadsheet], ["users","Users/Audit",UserCheck], ["settings","Settings",Settings]
  ];
  return <div className={`mt-app ${cleanMode?"clean-mode":""}`} data-theme="paper" data-settings-tick={settingsTick}>
    <style>{FONT + CSS}</style>
    <LoginDialog open={showLogin} force={!userProfile?.name || !emailLooksValid(userProfile?.email) || (userProfile?.access_status && userProfile.access_status !== "approved")} profile={userProfile} onSave={(p)=>{ setUserProfile(p); setShowLogin(false); setNotice({tone:"ok", text:`Logged in as ${p.name} · ${p.role}`}); }} onClose={()=>setShowLogin(false)}/>
    {showUpdatePopup && <div className="mt-update-backdrop no-print"><div className="mt-update-popup"><div className="head"><span>Update available</span><span className="mt-chip mt-info">{APP_VERSION}</span></div><div className="body"><div><b>New production app version is loaded.</b></div><div className="mt-small">P0 stock/date guard is active across WIP and DPR entry/correction views. Problematic dated quantity clashes go to Reconcile.</div><div className="mt-speed-note"><b>Commit:</b> {APP_COMMIT_MESSAGE}</div></div><div className="actions"><button className="mt-btn ghost" onClick={()=>window.location.reload()}><RefreshCw size={14}/>Refresh now</button><button className="mt-btn primary" onClick={markVersionSeen}><CheckCircle2 size={14}/>Got it</button></div></div></div>}
    <div className="mt-top"><div className="mt-shell"><div className="mt-header"><div><div className="mt-title">Production DPR & WIP Control <span style={{color:"var(--accent)"}}>{APP_VERSION}</span></div><div className="mt-sub">Live WIP · DPR Entry · Register · Planning · Review · Reports. Supabase-first autosave · email login · audit/cell history · Excel-like exports.</div></div><div className="mt-actions"><span className={`mt-chip ${statusClass(sharedSync.tone)}`}>{sharedSync.text}</span><span className="mt-chip mt-info">{presenceSummaryText(presenceRows)}</span><span className={`mt-chip ${userProfile?.name && emailLooksValid(userProfile?.email) ? "mt-ok" : "mt-late"}`}><UserCheck size={12}/>{userProfile?.email || userProfile?.name || "Login required"} · {userProfile?.role || "No role"}</span><button className="mt-btn ghost" onClick={()=>setShowLogin(true)}><Users size={14}/>User</button><button className={`mt-btn ${navCollapsed?"active":"ghost"}`} onClick={()=>setNavCollapsed(v=>!v)} title="Collapse / expand left navigation"><Layers size={14}/>{navCollapsed?"Expand tabs":"Collapse tabs"}</button><button className={`mt-btn ${cleanMode?"active":"ghost"}`} onClick={()=>setCleanMode(v=>!v)} title="Clean mode hides helper text and keeps screens precise">Clean mode</button><button className="mt-btn" onClick={clearAllScreenFilters}><X size={14}/>Clear Filters</button><button className="mt-btn" onClick={pullSupabase}><RefreshCw size={14}/>Refresh Shared Data</button>{currentUserCan("production.manage_settings") && <button className="mt-btn ghost" onClick={seedSupabase} title="Recovery only: pushes current browser rows to Supabase if they were saved before Supabase was connected. Normal Add/Edit/DPR/Register saves are Supabase-first."><Upload size={14}/>Recovery Sync</button>}{currentUserCan("production.manage_settings") && <button className="mt-btn ghost" onClick={recalculateStageQtyFromLedger} title="Admin recovery: rebuilds production_orders.stage_qty from production_entries ledger. Rows without ledger are left unchanged."><RefreshCw size={14}/>Recalc Totals</button>}<button className="mt-btn" onClick={testSupabaseConnection} title="Checks Supabase read, test save, read-back and verified delete"><ShieldCheck size={14}/>Test Supabase</button>{currentUserCan("production.export") && <button className="mt-btn" onClick={exportAll}><Download size={14}/>Export</button>}</div></div></div><PresenceStrip peers={presenceRows}/></div>
    <div className="mt-shell mt-page">
      {notice && <div className={`mt-card no-print`} style={{marginBottom:12}}><div className="mt-section"><span className={`mt-chip ${statusClass(notice.tone)}`}>{notice.text}</span> <button className="mt-btn ghost" onClick={()=>setNotice(null)} style={{float:"right"}}>Dismiss</button></div></div>}
      <div className={`mt-layout ${navCollapsed?"nav-collapsed":""}`}>
        <aside className="mt-side-nav no-print"><div className="mt-side-head"><span className="mt-side-title">Pages</span><button className="mt-btn ghost" onClick={()=>setNavCollapsed(v=>!v)} title="Collapse / expand tabs"><Layers size={14}/></button></div><div className="mt-side-scroll">{tabs.map(([k,label,Icon])=>{ const allowed = canOpenTab(k); return <button key={k} className={`mt-side-tab ${tab===k?"active":""}`} disabled={!allowed} title={allowed ? label : `Blocked: ${tabPermission(k)}`} onClick={()=>allowed && setTab(k)}><Icon size={15}/><span className="mt-side-label">{label}</span>{!allowed ? <span className="mt-side-lock">🔒</span> : null}</button>; })}</div></aside>
        <main className="mt-main-area">
      <PageFilters tab={tab} query={query} setQuery={setQuery} buyer={buyer} setBuyer={setBuyer} buyers={buyers} order={order} setOrder={setOrder} orders={orders} visibleRows={visibleRows}/>
      <div className="mt-keepalive-note slim no-print"><span className="mt-chip mt-info">Remembered tab/draft</span><span className="mt-small">This browser remembers your tab/drafts. Saved production data is shared through Supabase and refreshes by realtime/polling.</span></div>
      <div className="mt-tab-panel" style={{display:tab==="dashboard"?"block":"none"}} aria-hidden={tab!=="dashboard"}><Dashboard rows={visibleRows} ledger={ledger} planRows={planRows} onDrill={setDashboardDrill} clearTick={clearFiltersTick}/></div>
      <div className="mt-tab-panel" style={{display:tab==="manager"?"block":"none"}} aria-hidden={tab!=="manager"}><ManagerActionCenter rows={visibleRows} planRows={planRows} setPlanRows={setPlanRows} ledger={ledger} onPlanUpsert={savePlanRowShared}/></div>
      <div className="mt-tab-panel" style={{display:tab==="planning"?"block":"none"}} aria-hidden={tab!=="planning"}><PlanningView rows={visibleRows} planRows={planRows} setPlanRows={setPlanRows} setRows={setRows} ledger={ledger} onPlanUpsert={savePlanRowShared} onPlanDelete={deletePlanCellShared} planSaveState={planSaveState}/></div>
      <div className="mt-tab-panel" style={{display:tab==="wip"?"block":"none"}} aria-hidden={tab!=="wip"}><WipStatus rows={visibleRows} ledger={ledger} onOpen={(row,stage)=>setDrawer({row,stage})} onEntry={openEntryFromWip} onRelease={openReleaseFromAnyScreen} clearTick={clearFiltersTick}/></div>
      <div className="mt-tab-panel" style={{display:tab==="entry"?"block":"none"}} aria-hidden={tab!=="entry"}><QuickEntry rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} focus={entryFocus} onRelease={openReleaseFromAnyScreen} onSharedSave={handleSharedSave}/></div>
      <div className="mt-tab-panel" style={{display:tab==="register"?"block":"none"}} aria-hidden={tab!=="register"}><OutputRegisterView rows={calcRows} setRows={setRows} ledger={ledger} setLedger={setLedger} focus={registerFocus} clearTick={clearFiltersTick} onSharedSave={handleSharedSave}/></div>
      <div className="mt-tab-panel" style={{display:tab==="review"?"block":"none"}} aria-hidden={tab!=="review"}><ReviewView rows={visibleRows} ledger={ledger} planRows={planRows} onEditReconcile={(r)=>{ const target = r?._row || calcRows.find(row=>String(row.order_no||"")===String(r?.Order||"") && String(row.style_no||"")===String(r?.Style||"") && String(row.colour||"")===String(r?.Colour||"") && String(row.component||"")===String(r?.Component||"")); if (target) openRegisterFromWip(target, r?._stage || STAGES.find(s=>s.label===r?.Dept)?.key || "all", r?._activity || "all"); }}/></div>
      <div className="mt-tab-panel" style={{display:tab==="owners"?"block":"none"}} aria-hidden={tab!=="owners"}><WhoToChase rows={visibleRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="monthly"?"block":"none"}} aria-hidden={tab!=="monthly"}><MonthlyComparison rows={visibleRows} ledger={ledger} clearTick={clearFiltersTick}/></div>
      <div className="mt-tab-panel" style={{display:tab==="styles"?"block":"none"}} aria-hidden={tab!=="styles"}><StyleManager rows={visibleRows} allRows={calcRows} setRows={setRows} ledger={ledger} setLedger={setLedger} focus={styleFocus} clearTick={clearFiltersTick} onRelease={openReleaseFromAnyScreen} onSharedSave={handleSharedSave}/></div>
      <div className="mt-tab-panel" style={{display:tab==="routes"?"block":"none"}} aria-hidden={tab!=="routes"}><ProcessRoutes rows={visibleRows} setRows={setRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="photos"?"block":"none"}} aria-hidden={tab!=="photos"}><PhotoManager rows={visibleRows} setRows={setRows} clearTick={clearFiltersTick}/></div>
      <div className="mt-tab-panel" style={{display:tab==="reports"?"block":"none"}} aria-hidden={tab!=="reports"}>{currentUserCan("production.export") ? <Reports rows={visibleRows} ledger={ledger}/> : <PermissionGate permission="production.export" label="Reports"/>}</div>
      <div className="mt-tab-panel" style={{display:tab==="users"?"block":"none"}} aria-hidden={tab!=="users"}>{currentUserCan("production.audit_view") ? <UserAuditView profile={userProfile} presenceRows={presenceRows} onSwitchUser={()=>setShowLogin(true)} onLogout={logoutUser}/> : <PermissionGate permission="production.audit_view" label="Users / Audit"/>}</div>
      <div className="mt-tab-panel" style={{display:tab==="settings"?"block":"none"}} aria-hidden={tab!=="settings"}>{currentUserCan("production.manage_settings") ? <SettingsView onChanged={()=>setSettingsTick(t=>t+1)}/> : <PermissionGate permission="production.manage_settings" label="Settings"/>}</div>
        </main>
      </div>
    </div>
    {releaseFocus && <ProductionFileReleaseModal row={releaseFocus.row} source={releaseFocus.source} onClose={()=>setReleaseFocus(null)} onSave={(payload)=>saveProductionFileRelease(releaseFocus.row, payload)} />}
    {drawer && <DetailDrawer row={drawer.row} rows={calcRows} setRows={setRows} ledger={ledger} setLedger={setLedger} stageKey={drawer.stage} onClose={()=>setDrawer(null)} onOpenRegister={openRegisterFromWip} onOpenStyle={openStyleFromWip} onRelease={openReleaseFromAnyScreen} onSharedSave={handleSharedSave}/>} 
    {dashboardDrill && <DashboardDrillDrawer drill={dashboardDrill} rows={visibleRows} ledger={ledger} onClose={()=>setDashboardDrill(null)}/>} 
  </div>;
}
