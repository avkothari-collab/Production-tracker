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

const APP_VERSION = "V7.5.36";
const APP_COMMIT_MESSAGE = "Production DPR V7.5.36 register filter fix";

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
.mt-primary-stage-card { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:150px; max-width:190px; border:1px solid rgba(31,31,29,.14); border-radius:11px; background:var(--dept-tint,#fffaf1); color:var(--dept-fg,var(--ink)); padding:7px 8px; cursor:pointer; }
.mt-primary-stage-card .big { font-family:'Archivo',sans-serif; font-size:16px; font-weight:800; color:var(--ink); }
.mt-cut-breakup-mini { max-width:240px; min-width:170px; }
.mt-status-link:hover { outline:2px solid rgba(201,111,22,.18); }
.mt-status-link .dept-name { font-weight:800; font-size:10px; }
.mt-status-link .dept-qty { font-family:'Archivo',sans-serif; font-weight:800; font-size:13px; color:var(--ink); }
.mt-status-link .dept-pct { font-size:9px; color:var(--muted-2); font-weight:800; }
.mt-current-split-note { font-size:9px; color:var(--muted-2); margin-top:4px; }
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

@media print { .mt-top,.mt-toolbar,.no-print,.mt-tabs { display:none !important; } .mt-page{padding:0;} .mt-card,.mt-table-wrap{border:0; box-shadow:none;} .mt-table th{background:#111 !important; color:#fff !important;} }
@media (max-width:1180px){ .mt-dash-grid{grid-template-columns:repeat(3,minmax(0,1fr));} .mt-mini-board{grid-template-columns:1fr;} .mt-summary-strip,.mt-month-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
@media (max-width:980px){ .mt-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-two{grid-template-columns:1fr;} }
@media (max-width:620px){ .mt-entry-metrics{grid-template-columns:1fr;} .mt-grid{grid-template-columns:1fr;} .mt-dash-grid,.mt-summary-strip,.mt-month-grid{grid-template-columns:1fr;} .mt-page{padding:14px 12px 28px;} .mt-header{padding:15px 12px 10px;} .mt-tabs{padding-left:12px; padding-right:12px;} }
`;

const DEFAULT_SIZE_SETS = {
  alpha: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y"],
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
function stableProductionOrderId(row){
  const existing = String(row?.id || "").trim();
  if (existing && !existing.startsWith("demo") && !existing.startsWith("supabase_connection_test")) return existing;
  const key = [row?.order_no, row?.style_no, row?.colour, row?.component].map(x=>String(x||"").trim().toUpperCase()).join("|");
  return `prod_${stableHash(key)}`;
}
function today(){ return new Date().toISOString().slice(0,10); }
function dateDiff(a,b){
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / 86400000);
}
function previousWorkingDay(from=today()){
  const d = new Date(`${from}T00:00:00`);
  do { d.setDate(d.getDate() - 1); } while (d.getDay() === 0); // Sunday normally non-working
  return d.toISOString().slice(0,10);
}
function currentUserName(){
  try { return localStorage.getItem("production_user_name") || localStorage.getItem("mt_user_name") || "Current user"; }
  catch { return "Current user"; }
}
function defaultEntryDate(ledger=[]){
  // Factory reality: production is normally entered next day. Use latest activity date if present,
  // otherwise open entry calendars to previous working day, not today.
  const latest = latestActivityDate(ledger);
  return latest && latest !== today() ? latest : previousWorkingDay();
}
function backdateRisk(entryDate){
  const d = dateDiff(entryDate, today());
  if (d < 0) return { days:d, label:"Future date", tone:"late", approval:"blocked_future_date", locked:true, sameDay:false, future:true };
  if (d === 0) return { days:d, label:"Same-day entry — unusual", tone:"warn", approval:"same_day_confirmation_required", locked:false, sameDay:true, future:false };
  if (d === 1) return { days:d, label:"Normal next-day entry", tone:"ok", approval:"not_required", locked:false, sameDay:false, future:false };
  if (d <= 3) return { days:d, label:`Backdated ${d} days`, tone:"warn", approval:"production_head_review", locked:false, sameDay:false, future:false };
  return { days:d, label:`Backdated ${d} days`, tone:"late", approval:"manager_approval_required", locked:true, sameDay:false, future:false };
}
function entryTypeForField(field){
  if (field === "received") return "receive";
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
  { key:"issued", label:"Dept Issue Forward", help:"Good quantity handed to the next active department." },
];
const RAM_ENTRY_FIELDS = [
  { key:"reject", label:"Rejection", help:"Rejected/lost quantity by size." },
  { key:"missing", label:"Missing", help:"Missing/untraceable quantity by size." },
  { key:"alter", label:"Alter Defect", help:"Alter/repair quantity raised by size." },
  { key:"alter_clear", label:"Alter Clear", help:"Alter quantity repaired and returned to good output." },
];
const HIDDEN_ENTRY_FIELDS = [
  { key:"received", label:"Dept Receive", help:"Hidden/manual only. In this factory flow, Dept Issue Forward already means the next department has accepted it." },
];
const ALL_ENTRY_FIELDS = [...ENTRY_FIELDS, ...RAM_ENTRY_FIELDS, ...HIDDEN_ENTRY_FIELDS];
function fieldLabel(field){ return ALL_ENTRY_FIELDS.find(f=>f.key===field)?.label || field; }
function fieldHelp(field){ return ALL_ENTRY_FIELDS.find(f=>f.key===field)?.help || ""; }

function stageFeedBySize(row, stageKey){
  const sizes = sizesFor(row);
  if (stageKey === "cutting") return orderSizeQtyMap(row);
  const route = routeFor(row);
  const idx = route.indexOf(stageKey);
  if (idx <= 0) return orderSizeQtyMap(row);
  const prevStage = route[idx - 1];
  const issuedMap = Object.fromEntries(sizeMatrix(row, prevStage, "issued").map(x=>[x.size, n(x.qty)]));
  if (stageKey === "dispatch" && dispatchRejectAllowed()) {
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
  const feed = stage === "cutting" ? n(row.order_qty) : stageFeed(row, stage);
  const ram = loss(st);
  if (field === "received") {
    const available = stage === "cutting" ? n(row.order_qty) : feed;
    return {
      mode:"receive",
      available, previous:n(st.received), open:Math.max(0, available - n(st.received)), updatedLabel:"Updated received",
      availableLabel: stage === "cutting" ? "Order quantity" : `Available from ${stageLabel(prevStage)}`,
      previousLabel:`Already received in ${stageLabel(stage)}`, openLabel:"Open to receive",
      note: stage === "cutting" ? "Cutting usually uses Completed / Output, not receive." : `Receive balance from ${stageLabel(prevStage)} into ${stageLabel(stage)}.`
    };
  }
  if (field === "issued") {
    return {
      mode:"issue", available:n(st.output), previous:n(st.issued), open:Math.max(0, n(st.output) - n(st.issued)), updatedLabel:"Updated issued",
      availableLabel:`Completed in ${stageLabel(stage)}`, previousLabel:`Already issued ${nextStage ? `to ${stageLabel(nextStage)}` : "forward"}`, openLabel:`Open in ${stageLabel(stage)} / ready to issue`,
      note: nextStage ? `Issue completed quantity from ${stageLabel(stage)} to ${stageLabel(nextStage)}.` : `Issue/dispatch completed quantity from ${stageLabel(stage)}.`
    };
  }
  if (field === "output") {
    const available = stage === "cutting" ? n(row.order_qty) : feed;
    const dispatchRejectNote = stage === "dispatch" && dispatchRejectAllowed() ? " Includes approved rejection qty because Settings allows rejection dispatch." : "";
    return {
      mode:"output", available, previous:n(st.output), open: stage === "cutting" ? cuttingAccountableOpen(row) : Math.max(0, available - n(st.output) - ram), updatedLabel:"Updated output",
      availableLabel: stage === "cutting" ? "Order qty to cut" : (stage === "dispatch" && dispatchRejectAllowed() ? "Good issued + approved rejection" : `With ${stageLabel(stage)} / feed`),
      previousLabel:`Already completed in ${stageLabel(stage)}`, openLabel:`Open work in ${stageLabel(stage)}`,
      note: stage === "cutting" ? "Enter new cut quantity by size." : `Complete the open work currently with ${stageLabel(stage)}.${dispatchRejectNote}`
    };
  }
  if (["reject","missing","alter"].includes(field)) {
    const available = stage === "cutting" ? n(row.order_qty) : feed;
    const openWork = Math.max(0, available - n(st.output) - ram);
    return {
      mode:"ram", available, previous:n(st[field]), open:openWork, updatedLabel:`Updated ${fieldLabel(field)}`,
      availableLabel: stage === "cutting" ? "Order/cut accountable qty" : `With ${stageLabel(stage)} / feed`,
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
  if (field === "output") { const cutSizeQty = n(orderSizeQtyMap(row)[size]); return { available: stage === "cutting" ? cutSizeQty : feed, previous:output, open:Math.max(0, (stage === "cutting" ? cutSizeQty : feed)-output-ram) }; }
  if (["reject","missing","alter"].includes(field)) return { available:feed, previous: n({reject,missing,alter}[field]), open:Math.max(0, feed-output-ram) };
  if (field === "alter_clear") return { available:alter, previous:output, open:alter };
  return { available:0, previous:0, open:0 };
}
function entryOpenQty(row, stage, field){ return n(entryFieldContext(row, stage, field).open); }
function sizeOpenTotalForField(row, stage, field){ return sizesFor(row).reduce((a,size)=>a+n(entryFieldSizeContext(row,stage,field,size).open),0); }

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
  return ({ received:"Receive", output:"Complete", issued:"Issue forward", reject:"Reject", missing:"Mark missing", alter:"Raise alter", alter_clear:"Clear alter" })[field] || "Enter";
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
function normalizeSizeQtyMap(map, sizes){
  const out = {};
  const sizeList = Array.isArray(sizes) ? sizes : [];
  sizeList.forEach(size=>{
    const directVal = map?.[size];
    const lowerVal = map?.[String(size).toLowerCase()];
    out[size] = Math.max(0, n(directVal ?? lowerVal ?? 0));
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
  if (idx <= 0) return n(row.order_qty);
  const prev = sdata(row, route[idx - 1]);
  const rejectDispatchQty = stageKey === "dispatch" && dispatchRejectAllowed() ? preDispatchRejectQty(row) : 0;
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
  return Math.max(0, n(row.order_qty) - n(st.output) - loss(st) - cuttingShortCloseQty(row));
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
function dispatchRejectAllowed(){ return !!PROD_SETTINGS.dispatchRejectAllowed; }
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
  // Since issued-to-department = received/accepted in this workflow, the department's accountable feed is previous stage issued.
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
  const rejectAllowedQty = dispatchRejectAllowed() ? preDispatchRejectQty(row) : 0;
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
  const dispatchableRejectQty = dispatchRejectAllowed() ? preDispatchRejectQty(row) : 0;
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
      const overCut = Math.max(0, n(st.output) - n(row.order_qty));
      const cutPending = cuttingAccountableOpen(row);
      if (cutPending > 0) {
        buckets.push({ type:"cutting_pending", status:"Cutting Pending", qty:cutPending, owner:stageOwner(key), support:"Production Coordinator follow-up; option to short close genuine balance", stage:key, tone:idle >= 3 ? "warn" : "info", action:"Cut remaining order quantity or short close approved balance from Cutting detail.", idle });
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
      const tailDue = accountedPct >= 95;
      const atParty = !!st.party;
      buckets.push(tailDue
        ? { type:"tail_balance", status:`Tail / Close Due in ${stageLabel(key)}`, qty:workNotCompleted, owner:hodAndCoordinator(key), support:"Small closure balance: close, explain, or convert to R/A/M. Not reconcile.", stage:key, tone:"warn", action:`${stageLabel(key)} is ${Math.round(accountedPct)}% accounted. Close/explain the remaining tail balance.`, idle, closePct:accountedPct }
        : { type:"received_not_processed", status: atParty ? `Pending at ${st.party}` : `With ${stageLabel(key)}`, qty:workNotCompleted, owner: atParty ? `Production Coordinator + ${st.party}` : stageOwner(key), support: atParty ? "Follow up with outsource party; Production Manager escalation if overdue" : "Production Coordinator follow-up for closure; Production Manager escalation if overdue", stage:key, tone:idle >= 7 ? "warn" : "info", action: atParty ? `Follow ${st.party} to return ${stageLabel(key)} balance` : `${stageLabel(key)} to complete/process or explain open balance`, idle, party: atParty ? st.party : "" }
      );
    }
    if (stageLoss > 0) {
      const approvedRejectDispatch = dispatchRejectAllowed() && key !== "dispatch" ? n(st.reject) : 0;
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
  const buckets = issueBuckets(row).filter(b => isActionableBucket(row,b));
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
  const all = issueBuckets(row).filter(b => isActionableBucket(row,b));
  const reconcile = all.find(b => b.type === "reconcile");
  const current = all.find(b => b.type !== "reconcile");
  const rest = all.filter(b => b !== reconcile && b !== current).slice(0, 1);
  return [reconcile, current, ...rest].filter(Boolean);
}
function shortStatusLabel(bucket){
  if (!bucket) return "Closed / Balanced";
  return bucket.status;
}
function statusText(row){
  const parts = statusBreakdown(row);
  if (!parts.length) return "Closed / Balanced";
  return parts.map(b => `${shortStatusLabel(b)} ${fmt(b.qty)} (${bucketPct(row,b)}%)`).join(" | ");
}
function StatusCell({ row, onOpen }){
  const parts = statusDistribution(row);
  if (!parts.length) return <div className="mt-status-stack"><span className="mt-chip mt-ok">Closed / Balanced</span><div className="mt-status-line">No open production issue</div></div>;
  return <div className="mt-status-stack"><StatusDeptLinks row={row} onOpen={onOpen} compact={false}/></div>;
}
function PrimaryPendingStage({ row, onOpen }){
  const bucket = statusDistribution(row)[0];
  if (!bucket) return <button className="mt-primary-stage-card mt-dept-dispatch" onClick={(e)=>e.stopPropagation()} title="No pending stage"><span><b>Closed</b><br/><span className="mt-small">Balanced</span></span><span className="big">100%</span></button>;
  const base = statusCutBaseQty(row);
  const pctBase = base > 0 ? Math.round((n(bucket.qty) * 1000) / base) / 10 : bucketPct(row,bucket);
  const isCutPending = bucket.type === "cutting_pending";
  const cutDonePct = base > 0 ? Math.round((n(sdata(row,"cutting").output) * 1000) / base) / 10 : 0;
  const pctText = isCutPending ? `${pctBase}% pending` : `${pctBase}% of cut/order`;
  const title = isCutPending
    ? `Cutting pending · ${fmt(bucket.qty)} pcs still not cut/short-closed · Cut done ${cutDonePct}%`
    : `Primary pending stage · ${fmt(bucket.qty)} pcs · ${pctBase}% of cut/order`;
  return <button className={`mt-primary-stage-card ${deptClass(bucket.stage)}`} onClick={(e)=>{e.stopPropagation(); onOpen?.(bucket.stage,bucket);}} title={title}>
    <span><b>{stageLabel(bucket.stage)}</b><br/><span className="mt-small">{isCutPending ? "Pending to Cut" : shortStatusLabel(bucket)}</span></span>
    <span style={{textAlign:"right"}}><span className="big">{fmt(bucket.qty)}</span><br/><span className="mt-small">{pctText}</span>{isCutPending ? <><br/><span className="mt-small">Cut done {cutDonePct}%</span></> : null}</span>
  </button>;
}
function statusClass(tone){ return tone === "late" ? "mt-late" : tone === "warn" ? "mt-warn" : tone === "ok" ? "mt-ok" : tone === "purple" ? "mt-purple" : tone === "info" ? "mt-info" : "mt-muted"; }
function deptClass(stageKey){ return stageKey ? `mt-dept-${stageKey}` : ""; }
function statusDistribution(row){
  const buckets = issueBuckets(row).filter(b => isActionableBucket(row,b));
  const normal = buckets.filter(b => b.type !== "dispatch_hold");
  const total = normal.reduce((a,b)=>a+n(b.qty),0) || buckets.reduce((a,b)=>a+n(b.qty),0) || 0;
  const source = normal.length ? normal : buckets;
  return source.map((b,idx)=>({ ...b, pct: total>0 ? Math.round((n(b.qty)*1000)/total)/10 : bucketPct(row,b), rank:idx })).sort((a,b)=>{
    const pri = (x)=> x.type === "reconcile" ? 5 : x.type === "dispatch_hold" ? 4 : x.type === "completed_not_issued" ? 3 : x.type === "tail_balance" ? 2.5 : x.type === "received_not_processed" ? 2 : x.type === "ram" ? 1 : x.type === "approved_reject_dispatch" ? 0.5 : 0;
    return pri(b)-pri(a) || n(b.qty)-n(a.qty);
  });
}
function statusCutBaseQty(row){
  const cut = sdata(row, "cutting");
  return Math.max(n(cut.output), n(cut.issued), n(cut.received), n(row.order_qty));
}
function statusDistributionByCut(row){
  const base = statusCutBaseQty(row);
  return statusDistribution(row).map(b => ({
    ...b,
    cutBase: base,
    pctCut: base > 0 ? Math.round((n(b.qty) * 1000) / base) / 10 : 0,
  }));
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
  const base = statusCutBaseQty(row);
  const rawParts = statusDistributionByCut(row);
  const allParts = excludePrimary ? rawParts.slice(1) : rawParts;
  const parts = allParts.slice(0, compact ? 4 : 8);
  if (!parts.length) return <div className="mt-cut-breakup-mini"><span className="mt-chip mt-ok">No other open split</span><div className="mt-small">Base: {fmt(base)} cut/order</div></div>;
  return <div className="mt-status-cell-wrap compact-wrap mt-cut-status-wrap mt-cut-breakup-mini">
    <div className="mt-current-split-note" style={{width:"100%"}}>{excludePrimary ? "Other open split" : "All open split"} vs cut/order: {fmt(base)}</div>
    {parts.map((b,idx)=><button key={`cut-${b.type}-${b.stage}-${idx}`} className={`mt-status-link compact ${deptClass(b.stage)}`} onClick={(e)=>{e.stopPropagation(); onOpen?.(b.stage,b);}} title={`Open ${stageLabel(b.stage)} detail · ${fmt(b.qty)} = ${b.pctCut}% of cut/order`}>
      <span><span className="dept-name">{STAGE_BY_KEY[b.stage]?.short || stageLabel(b.stage)}</span><br/><span className="mt-small">{bucketTypeLabel(b.type)}</span></span>
      <span style={{textAlign:"right"}}><span className="dept-qty">{fmt(b.qty)}</span><br/><span className="dept-pct">{b.pctCut}%</span></span>
    </button>)}
    {allParts.length > parts.length ? <span className="mt-chip mt-muted">+{allParts.length-parts.length}</span> : null}
  </div>;
}

function uniqueList(values){ return Array.from(new Set(values.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b))); }
function ownerNamesFromBucket(bucket){ return String(bucket?.owner || "").split("+").map(x=>x.trim()).filter(Boolean); }
function rowOwnerNames(row){ return uniqueList(issueBuckets(row).flatMap(ownerNamesFromBucket)); }
function routeType(row){ const p=!!row.print_required, e=!!row.embroidery_required; return p && e ? "Print + Emb" : p ? "Print" : e ? "Embroidery" : "Plain"; }
function bucketTypeLabel(type){
  return ({ completed_not_issued:"Ready for Next Dept", received_not_processed:"With Department", tail_balance:"Tail / Closure Due", cutting_pending:"Cutting Pending", short_closed:"Short Closed", ram:"Reject / Alter / Missing", approved_reject_dispatch:"Approved Reject Dispatch", reconcile:"Reconcile", extra_cut:"Extra Cut" })[type] || type;
}
function typeFromStatusFilter(status){
  if (status === "ready") return "completed_not_issued";
  if (status === "with_dept") return "received_not_processed";
  if (status === "reconcile") return "reconcile";
  if (status === "ram") return "ram";
  return "";
}
function rowMatchesBucketFilter(row, issueType){
  if (!issueType || issueType === "all") return true;
  if (issueType === "closed") return issueBuckets(row).filter(b=>isActionableBucket(row,b)).length === 0;
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
    Stitching_Receiving:0,
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
  const ram = inRows
    .filter(x => ["reject","alter","missing","ram"].includes(entryType(x)))
    .reduce((a,x)=>a+Math.abs(n(x.qty ?? x.delta)),0);
  return {
    period:periodKey,
    Period:label,
    Date_Range:dateRangeLabel(parseYmd(start), parseYmd(end)),
    Start_Date:start,
    End_Date:end,
    Cutting:qty("cutting", ["good_output","receive","output"]),
    Stitching_Receiving:qty("stitching", ["receive","good_output","output"]),
    Checking:qty("checking", ["good_output","receive","output"]),
    Packing:qty("packing", ["good_output","receive","output"]),
    Dispatch:qty("dispatch", ["receive","dispatch","good_output","output","issue"]),
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
    const received = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).received),0);
    const reject = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).reject),0);
    const alter = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).alter),0);
    const missing = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).missing),0);
    const ram = reject + alter + missing;
    const denom = accountable || received;
    return { stage:stage.key, Dept:stage.label, Accountable_Feed:accountable, Received_Qty:received, Reject:reject, Alter:alter, Missing:missing, RAM_Total:ram, Loss_Rate: denom ? `${Math.round((ram*1000)/denom)/10}%` : "0%", Styles:stageRows.filter(r=>loss(sdata(r,stage.key))>0).length };
  }).filter(r=>r.RAM_Total>0 || r.Accountable_Feed>0 || r.Received_Qty>0).sort((a,b)=>b.RAM_Total-a.RAM_Total);
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
    const received = stageRows.reduce((a,row)=>a+n(sdata(row,stage.key).received || (stage.key==="cutting" ? sdata(row,stage.key).output : 0)),0);
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
    return { stage:stage.key, Dept:stage.label, Inflow_or_Feed:inflow, Received:received, Output:output, Issued_Forward:issued, Queue_WIP:queue, Reconcile_Qty:reconcile, RAM_Qty:ram, Recent_Output_7d:recentOutput, Daily_Rate:Math.round(dailyRate*10)/10, Days_Cover: queue ? Math.round((queue / dailyRate)*10)/10 : 0, Bottleneck_Score: queue + reconcile*2 + ram };
  }).filter(r=>r.Queue_WIP || r.Reconcile_Qty || r.RAM_Qty || r.Received || r.Output).sort((a,b)=>b.Bottleneck_Score-a.Bottleneck_Score);
}
function lineEfficiencyRows(rows, ledger=[], start=today(), end=today()){
  const period = (ledger || []).filter(x => inDateRange(x.entry_date || x.entryDate || x.date, start, end) && String(x.stage)==="stitching" && ["good_output","output","receive"].includes(String(x.entry_type || x.entryType || "")));
  const map = new Map();
  if (period.length) {
    period.forEach(e => {
      const row = findRowForLedger(rows, e) || {};
      const line = e.line || row.line || "Unassigned";
      const curr = map.get(line) || { Line:line, Plan_Target:n(e.plan_qty || e.target_qty), Achieved:0, Styles:new Set(), Dept:"Stitching" };
      const entryQty = e.qty ?? e.delta;
      curr.Achieved += Math.max(0,n(entryQty));
      curr.Plan_Target += n(e.plan_qty || e.target_qty);
      curr.Styles.add(row.id || e.style_no || e.style);
      map.set(line,curr);
    });
  } else {
    rows.forEach(row => {
      const line = row.line || "Unassigned";
      const curr = map.get(line) || { Line:line, Plan_Target:n(row.plan_qty || row.daily_target || 0), Achieved:0, Styles:new Set(), Dept:"Stitching" };
      curr.Achieved += n(sdata(row,"stitching").output); curr.Plan_Target += n(row.plan_qty || row.daily_target || 0); curr.Styles.add(row.id);
      map.set(line,curr);
    });
  }
  return Array.from(map.values()).map(x=>({ Line:x.Line, Dept:x.Dept, Plan_Target:x.Plan_Target || "Set plan", Achieved:x.Achieved, Variance: x.Plan_Target ? x.Achieved - x.Plan_Target : "—", Efficiency: x.Plan_Target ? `${Math.round((x.Achieved*1000)/x.Plan_Target)/10}%` : "Plan pending", Styles:x.Styles.size })).sort((a,b)=>n(b.Achieved)-n(a.Achieved));
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
  const printFallback = !!row.print_required || route.includes("printing");
  const embroideryFallback = !!row.embroidery_required || route.includes("embroidery");
  return {
    id:row.id, order_no:row.order_no, style_no:row.style_no, buyer:row.buyer || row.brand || "", colour:row.colour || "", component:row.component || "",
    photo_url:row.photo_url || "", photo_thumb_url:row.photo_thumb_url || row.photo_url || "", photo_folder_url:row.photo_folder_url || "",
    order_qty:n(row.order_qty), order_size_qty:normalizeSizeQtyMap(orderSizeRaw, sizeList), size_set:sizeSet, set_id:row.set_id || "",
    line:row.default_line || raw.__default_line || "", difficulty:row.difficulty || raw.__difficulty || "Normal", priority:row.priority || raw.__priority || "Normal",
    daily_target:n(dailyTargetRaw), cutting_short_close_qty:n(row.cutting_short_close_qty || raw.__cutting_short_close_qty), cutting_short_close_reason:row.cutting_short_close_reason || raw.__cutting_short_close_reason || "",
    print_required:(printRequiredRaw ?? printFallback),
    embroidery_required:(embroideryRequiredRaw ?? embroideryFallback),
    route, stages
  };
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
  if (Array.isArray(saved) && saved.length) return saved.map(r=>({ ...r, route:routeFor(r) }));
  return demoRows.map(r=>({ ...r, route:routeFor(r) }));
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
function StageCell({ row, stageKey, onOpen }){
  const c = cellBreakup(row, stageKey);
  if (c.skipped) return <td><div className="mt-stage-cell"><span className="mt-chip mt-muted">Skip</span><div className="mt-cell-note">Route not active</div></div></td>;
  const feed = stageKey === "cutting" ? n(row.order_qty) : stageFeed(row, stageKey);
  const pct = feed > 0 ? Math.round((n(c.received) * 1000) / feed) / 10 : 0;
  return <td className={`mt-clickable-cell dept-focus ${deptClass(stageKey)}`} onClick={() => onOpen?.(row, stageKey)} title="Click for department detail / size-wise WIP entry">
    <div className={`mt-stage-cell dept-focus ${deptClass(stageKey)}`}>
      <div className="mt-stage-top"><span className="mt-stage-title dept-focus-title">{STAGE_BY_KEY[stageKey].short}</span><span className="mt-chip mt-muted">{pct}%</span>{c.extra ? <AlertTriangle size={13} color="var(--danger)"/> : null}</div>
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



// V7.5.16 keeps V7.5.15 stable and improves selected-department output cards with full Good/R/A/M/accounted picture.
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
  const stitchTypes = ["receive","good_output","output"];
  const checkTypes = ["receive","good_output","output"];
  const packTypes = ["receive","good_output","output"];
  const dispatchTypes = ["receive","dispatch","good_output","output","issue"];
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
    const stitchingTypes = ["receive","good_output","output"];
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
      Stitching_Receiving_In_Period: flow.stitched,
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
  }).filter(r=>n(r.Stitching_Receiving_In_Period)+n(r.Checking_In_Period)+n(r.Packing_In_Period)+n(r.Dispatch_In_Period)+n(r.RAM_Posted_In_Period)>0)
    .sort((a,b)=>String(a.Buyer).localeCompare(String(b.Buyer)) || String(a.Order).localeCompare(String(b.Order)) || String(a.Style).localeCompare(String(b.Style)));
}

function buildReportSheets(rows, ledger){
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
    lineEfficiencyRows: lineEfficiencyRows(rows, ledger),
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
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style-wise Print / Embroidery Route Toggles</h3><div className="mt-panel-sub">Optional process stages. Validation follows the active route: Cutting → optional Print/Emb → Stitching → Checking → Packing → Dispatch.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Print Required</th><th>Embroidery Required</th><th>Active Route</th><th>Rule</th></tr></thead><tbody>{(rows||[]).map(row=><tr key={row.id}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.colour} · {row.component}</div></td><td><button className={`mt-btn ${row.print_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"print_required")}>{row.print_required?"Print ON":"Print OFF"}</button></td><td><button className={`mt-btn ${row.embroidery_required?"primary":"ghost"}`} onClick={()=>toggle(row.id,"embroidery_required")}>{row.embroidery_required?"Emb ON":"Emb OFF"}</button></td><td>{routeFor(row).map(k=><span className="mt-chip mt-muted" key={k} style={{marginRight:4}}>{STAGE_BY_KEY[k]?.short || k}</span>)}</td><td>Next stage checks use the previous active route stage.</td></tr>)}</tbody></table></div></div>;
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

function reconciliationBoardRows(rows){
  return (rows || []).flatMap(row =>
    issueBuckets(row)
      .filter(bucket => bucket.type === "reconcile")
      .map(bucket => {
        const stage = bucket.stage;
        const st = sdata(row, stage);
        const feed = stage === "cutting" ? n(row.order_qty) : stageFeed(row, stage);
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
  ).sort((a,b)=>n(b.Difference)-n(a.Difference) || String(a.Dept).localeCompare(String(b.Dept)));
}

function dashboardDrillRows(rows, ledger, drill){
  if (!drill) return [];
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
function Dashboard({ rows, ledger=[], onDrill }){
  const activityDate = latestActivityDate(ledger);
  const [selectedDate, setSelectedDate] = useState(()=>safeJsonLoad(uiStorageKey("dashboard_selected_date"), activityDate));
  useEffect(()=>{ setSelectedDate(d => d || activityDate); }, [activityDate]);
  useEffect(()=>safeJsonSave(uiStorageKey("dashboard_selected_date"), selectedDate), [selectedDate]);
  const cal = productionCalendar445(selectedDate || activityDate);
  const buckets = rows.flatMap(row => issueBuckets(row).map(bucket => ({ ...bucket, row })));
  const openBuckets = buckets.filter(b=>b.type!=="extra_cut" && b.type!=="dispatch_hold");
  const openQty = openBuckets.reduce((a,b)=>a+n(b.qty),0);
  const reconcile = buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0);
  const completedNotIssued = buckets.filter(b=>b.type==="completed_not_issued").reduce((a,b)=>a+n(b.qty),0);
  const receivedNotProcessed = buckets.filter(b=>b.type==="received_not_processed").reduce((a,b)=>a+n(b.qty),0);
  const ram = buckets.filter(b=>b.type==="ram").reduce((a,b)=>a+n(b.qty),0);
  const deptRows = departmentCurrentRows(rows);
  const issueDeptRows = departmentIssueRows(rows);
  const ownerRows = ownerActivityRows(rows);
  const periodRows = dailyWeeklyMonthlyRows(rows, ledger, selectedDate || activityDate);
  const reconciliationRows = reconciliationBoardRows(rows);
  const meetingRows = meetingFocusRows(rows);
  const lineRows = lineEfficiencyRows(rows, ledger, cal.weekStart, cal.weekEnd);
  const bottleneckRows = flowBottleneckRows(rows, ledger);
  const agingRows = agingStuckRows(rows);
  const qualityRows = qualityLossRows(rows);
  const partyRows = partyPendingRows(rows);
  const setRows = setConvergenceRows(rows);
  const setsUnmatched = setRows.reduce((a,r)=>a+n(r.Unmatched),0);
  const orderRows = orderSummaryRows(rows);
  const [dashView, setDashView] = useState(()=>safeJsonLoad(uiStorageKey("dashboard_view"), "summary"));
  useEffect(()=>safeJsonSave(uiStorageKey("dashboard_view"), dashView), [dashView]);
  const issueMixRows = [
    { Issue:"With Dept", Qty:receivedNotProcessed, kind:"received_not_processed" },
    { Issue:"Ready / Not Issued", Qty:completedNotIssued, kind:"completed_not_issued" },
    { Issue:"R/A/M", Qty:ram, kind:"ram" },
    { Issue:"Reconcile", Qty:reconcile, kind:"reconcile" },
  ].filter(x=>x.Qty>0);
  const deptChartRows = deptRows.map(r=>({ Dept:r.Dept, Qty:n(r.Total_Qty || r.Open_Qty || r.Qty), stage:r.stage })).filter(r=>r.Qty>0);
  return <>
    <div className="mt-card" style={{marginBottom:12}}><div className="mt-section"><div className="mt-drill-head"><div><h3 className="mt-panel-title">Dashboard Mode</h3><div className="mt-panel-sub">Summary first, chart second, style rows only in drilldown. Use Table mode only when you want deep data.</div></div><div className="mt-toggle-row"><button className={`mt-btn ${dashView==="summary"?"active":""}`} onClick={()=>setDashView("summary")}>Summary</button><button className={`mt-btn ${dashView==="charts"?"active":""}`} onClick={()=>setDashView("charts")}>Charts</button><button className={`mt-btn ${dashView==="tables"?"active":""}`} onClick={()=>setDashView("tables")}>Tables</button></div></div></div></div>
    <div className="mt-dash-grid">
      <DrillKpi label="Active Styles" value={rows.length} note="All styles in current dashboard filter." tone="info" onClick={()=>onDrill?.({kind:"all_styles", title:"Active Styles"})}/>
      <DrillKpi label="Total Open WIP" value={fmt(openQty)} note="Current bins only; issued to dept means accepted/with dept." tone={openQty?"warn":"ok"} onClick={()=>onDrill?.({kind:"open_qty", title:"Total Open WIP — Current Bins"})}/>
      <DrillKpi label="With Dept" value={fmt(receivedNotProcessed)} note="Issued/accepted by dept but work not completed." tone={receivedNotProcessed?"info":"ok"} onClick={()=>onDrill?.({kind:"received_not_processed", title:"With Department"})}/>
      <DrillKpi label="Ready / Not Issued" value={fmt(completedNotIssued)} note="Completed but not issued forward. Coordinator + Production Manager." tone={completedNotIssued?"info":"ok"} onClick={()=>onDrill?.({kind:"completed_not_issued", title:"Ready / Not Issued"})}/>
      <DrillKpi label="Sets Unmatched" value={fmt(setsUnmatched)} note="Set pieces packed on one component with no partner component yet. A set ships only min(components)." tone={setsUnmatched?"warn":"ok"} onClick={()=>onDrill?.({kind:"sets", title:"Sets Convergence"})}/>
      <DrillKpi label="Reconcile / Blocked" value={fmt(reconcile)} note="Total jump or impossible movement; manager approval only." tone={reconcile?"late":"ok"} onClick={()=>onDrill?.({kind:"reconcile", title:"Reconcile / Blocked"})}/>
    </div>
    {dashView !== "tables" && <div className="mt-context-grid">
      <MiniBarCard title="Top risky orders" sub="Order-wise open/reconcile pressure before style drilldown." rows={orderRows.map(r=>({ Order:r.Order, Qty:n(r.Open_WIP)+n(r.Reconcile)*2+n(r.RAM), Raw:r })).filter(r=>r.Qty>0)} labelKey="Order" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"order", order:r.Order, title:`Order Summary — ${r.Order}`})}/>
      <MiniBarCard title="Department open load" sub="Open WIP by department. Click to drill style/size only when needed." rows={deptChartRows} labelKey="Dept" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:"stage", stage:r.stage, title:`${r.Dept} Current WIP Bins`})}/>
      <DonutCard title="Issue mix" sub="Part-to-whole split of current production issues." rows={issueMixRows} labelKey="Issue" valueKey="Qty" onRowClick={(r)=>onDrill?.({kind:r.kind, title:r.Issue})}/>
    </div>}
    <details className="mt-fold" open={dashView==="tables" || dashView==="summary"}><summary>Order-wise Production Summary</summary><SimpleTable title="Order-wise Production Summary" sub="Use this first when many styles are active. Orders group styles/components so dashboards stay manageable. Click any order to drill into its styles." rows={orderRows} empty="No orders in current dashboard scope." onRowClick={(r)=>onDrill?.({kind:"order", order:r.Order, title:`Order Summary — ${r.Order}`})}/></details>
    <div className="mt-card" style={{marginBottom:12}}>
      <div className="mt-section"><h3 className="mt-panel-title">Daily / 4-4-5 Weekly / Monthly Production Numbers</h3><div className="mt-panel-sub">Calendar opens to the latest activity date. Daily = selected date. Weekly = 4-4-5 production week, Monday–Saturday. Monthly = exact calendar month dates. Rows are drillable.</div><div className="mt-toolbar" style={{marginTop:10}}><span className="mt-toolbar-label">Activity date</span><input className="mt-input mt-entry-date" type="date" value={selectedDate || activityDate} onChange={e=>setSelectedDate(e.target.value)} /><span className="mt-chip mt-info">{cal.fullLabel}</span><span className="mt-chip mt-muted">Calendar month {fullMonthLabel(parseYmd(selectedDate || activityDate))}</span></div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Period</th><th>Date Range</th><th>Cutting</th><th>Stitching Receiving</th><th>Checking</th><th>Packing</th><th>Dispatch</th><th>R/A/M</th><th>Rows</th></tr></thead><tbody>{periodRows.map(r=><tr key={r.period} className="drillable" onClick={()=>onDrill?.({kind:"period", period:r.period, start:r.Start_Date, end:r.End_Date, title:`${r.Period} Activity Entries`})}><td><b>{r.Period}</b></td><td>{r.Date_Range}</td><td>{fmt(r.Cutting)}</td><td>{fmt(r.Stitching_Receiving)}</td><td>{fmt(r.Checking)}</td><td>{fmt(r.Packing)}</td><td>{fmt(r.Dispatch)}</td><td>{fmt(r.RAM)}</td><td>{r.Rows}</td></tr>)}</tbody></table></div>
    </div>
    {dashView !== "charts" && <>
    <div className="mt-mini-board">
      <SimpleTable title="Plan vs Achieved / Line Efficiency" sub="Department-first production meeting spine. Uses ledger plan where present; otherwise achieved is shown and plan is marked pending." rows={lineRows.slice(0,12)} empty="No line output yet." onRowClick={()=>onDrill?.({kind:"line_efficiency", start:cal.weekStart, end:cal.weekEnd, title:`Line Efficiency — ${cal.fullLabel}`})}/>
      <SimpleTable title="Bottleneck / Flow Board" sub="Daily Rate = recent 7-day average output. Days Cover = Queue WIP ÷ Daily Rate. Bottleneck Score = Queue WIP + 2×Reconcile + R/A/M. Highest risk first." rows={bottleneckRows.map(({stage,...r})=>r).slice(0,12)} empty="No bottleneck rows." onRowClick={()=>onDrill?.({kind:"bottleneck", title:"Bottleneck / Flow Drilldown"})}/>
      <SimpleTable title="Aging / Stuck WIP" sub="Dept-wise WIP by aging bucket: 0–2d, 3–6d, 7–13d, 14d+. Uses live idle where ledger exists." rows={agingRows.map(({stage,...r})=>r).slice(0,12)} empty="No aged WIP." onRowClick={()=>onDrill?.({kind:"aging", title:"Aging / Stuck WIP"})}/>
    </div>
    <div className="mt-mini-board" style={{marginTop:12}}>
      <SimpleTable title="Department WIP — Current Bins" sub="Correct bin logic: once a stage activity moves on, the qty leaves that old bin and appears only in the next active bin. Rows are drillable by department." rows={deptRows.map(({stage,...r})=>r)} empty="No department WIP." onRowClick={(r)=>{ const match = deptRows.find(x=>x.Dept===r.Dept); onDrill?.({kind:"stage", stage:match?.stage, title:`${r.Dept} Current WIP Bins`}); }}/>
      <SimpleTable title="Department × Issue Type Board" sub="Issue type without department is not useful; this shows exactly which department has which issue. Rows drill to style/size detail." rows={issueDeptRows.map(({stage,type,...r})=>r)} empty="No open issue by department." onRowClick={(r)=>{ const match = issueDeptRows.find(x=>x.Dept===r.Dept && x.Issue===r.Issue); onDrill?.({kind:"dept_issue", stage:match?.stage, type:match?.type, title:`${r.Dept} — ${r.Issue}`}); }}/>
      <SimpleTable title="Owner Activity Board" sub="Owner-wise breakup separates normal production WIP, R/A/M and reconciliation so chase is clear." rows={ownerRows.slice(0,10)} empty="No owner activity." onRowClick={(r)=>onDrill?.({kind:"owner", owner:r.Owner, title:`Owner Activity — ${r.Owner}`})}/>
    </div>
    <div className="mt-mini-board" style={{marginTop:12}}>
      <SimpleTable title="Quality / Loss Rate" sub="Reject, alter, missing and loss-rate by department. Rows drill to R/A/M style-size detail." rows={qualityRows.map(({stage,...r})=>r).slice(0,12)} empty="No quality/loss rows." onRowClick={()=>onDrill?.({kind:"quality_loss", title:"Quality / Loss Drilldown"})}/>
      <SimpleTable title="Party / Outsource Pending" sub="Print/emb/pack outsourced WIP by party, process, pending qty and age." rows={partyRows.map(({stage,...r})=>r).slice(0,12)} empty="No party pending rows." onRowClick={()=>onDrill?.({kind:"party_pending", title:"Party / Outsource Pending"})}/>
      <SimpleTable title="Reconciliation Dashboard" sub="Separate reconciliation board. Only impossible/blocked quantity movements appear here; rows drill to the exact style-size issue." rows={reconciliationRows.map(({stage,type,...r})=>r)} empty="No reconciliation blockers." onRowClick={(r)=>{ const match = reconciliationRows.find(x=>x.Dept===r.Dept && x.Reconcile_Type===r.Reconcile_Type); onDrill?.({kind:"dept_issue", stage:match?.stage, type:"reconcile", title:`Reconciliation — ${r.Dept}`}); }}/>
    </div>
    <div style={{marginTop:12}}>
      <SimpleTable title="Sets Convergence — packable = min(components)" sub="For set styles (top+bottom etc.), a set can only pack and dispatch as many as the lagging component. Packable Sets = lowest component; Unmatched = ahead-component pieces with no partner yet." rows={setRows} empty="No multi-component set styles in view." onRowClick={()=>onDrill?.({kind:"sets", title:"Sets Convergence"})}/>
    </div>
    <div style={{marginTop:12}}>
      <SimpleTable title="Production Meeting Focus" sub="Meeting action list: blocker first, then biggest open qty × idle days. Every row drills to the useful style/size detail." rows={meetingRows} empty="No open meeting focus rows." onRowClick={()=>onDrill?.({kind:"meeting_focus", title:"Production Meeting Focus"})}/>
    </div>
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
  const sortBy = (key) => setSort(s => s.key === key ? { key, dir:s.dir === "asc" ? "desc" : "asc" } : { key, dir:"asc" });
  const clearFilters = () => { setSearch(""); setOwner("all"); setDept("all"); setStatus("all"); setSort({ key:"", dir:"asc" }); };
  const sortMark = (key) => sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return <div className="mt-drawer">
    <div className="mt-drawer-head"><div><h2 style={{margin:"0 0 4px"}}>{drill.title || "Dashboard Drilldown"}</h2><div className="mt-sub">Every dashboard number opens to its own relevant detail rows. Period drilldowns use production_entries.entry_date, not created_at.</div></div><button className="mt-btn" onClick={onClose}><X size={15}/>Close</button></div>
    <div className="mt-drawer-body">
      <div className="mt-drill-head"><div><h3 className="mt-panel-title">Drilldown Detail</h3><div className="mt-panel-sub">Rows: {filteredRows.length} / {rawRows.length}. Total open / relevant qty: {fmt(totalQty)}.</div><div className="mt-drill-meta"><span className="mt-chip mt-info">Dashboard-specific columns</span><span className="mt-chip mt-muted">Filter-respecting</span><span className="mt-chip mt-muted">Filterable + sortable</span><span className="mt-chip mt-muted">Exportable from Reports</span></div></div></div>
      <div className="mt-toolbar" style={{margin:"0 0 10px"}}>
        <span className="mt-toolbar-label">Drill filters</span>
        <input className="mt-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drill rows..." style={{minWidth:220}} />
        <select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All depts/stages</option>{deptOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select className="mt-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All status/issues</option>{statusOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select className="mt-select" value={owner} onChange={e=>setOwner(e.target.value)}><option value="all">All owners</option>{ownerOptions.filter(x=>x!=="all").map(x=><option key={x} value={x}>{x}</option>)}</select>
        <button className="mt-btn" onClick={clearFilters}>Clear</button>
      </div>
      {drillSummaryRows(filteredRows).length > 1 && <div style={{marginBottom:10}}><SimpleTable title="Drill Subtotals — Dept / Owner / Buyer" sub="Quick meeting summary of the filtered drilldown before the style-size detail." rows={drillSummaryRows(filteredRows)} empty="No subtotal rows." /></div>}
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{columns.map(c=><th key={c} className="mt-clickable-cell" onClick={()=>sortBy(c)} title="Click to sort">{c}{sortMark(c)}</th>)}</tr></thead><tbody>{filteredRows.length ? filteredRows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}</tr>) : <tr><td style={{padding:18}} colSpan={columns.length}>No rows for this drilldown/filter.</td></tr>}</tbody></table></div>
    </div>
  </div>;
}

function WipStatus({ rows, onOpen }){
  const [localSearch,setLocalSearch] = useState(()=>safeJsonLoad(uiStorageKey("wip_search"), ""));
  const [dept,setDept] = useState(()=>safeJsonLoad(uiStorageKey("wip_dept"), "all"));
  const [issue,setIssue] = useState(()=>safeJsonLoad(uiStorageKey("wip_issue"), "all"));
  const [owner,setOwner] = useState(()=>safeJsonLoad(uiStorageKey("wip_owner"), "all"));
  const [route,setRoute] = useState(()=>safeJsonLoad(uiStorageKey("wip_route"), "all"));
  const [viewMode,setViewMode] = useState(()=>safeJsonLoad(uiStorageKey("wip_view_mode"), "matrix"));
  useEffect(()=>safeJsonSave(uiStorageKey("wip_search"), localSearch), [localSearch]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_dept"), dept), [dept]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_issue"), issue), [issue]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_owner"), owner), [owner]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_route"), route), [route]);
  useEffect(()=>safeJsonSave(uiStorageKey("wip_view_mode"), viewMode), [viewMode]);
  const [showCutActivity,setShowCutActivity] = useState(false);
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
    { key:"received_not_processed", label:"With Department", value:allBuckets.filter(x=>x.bucket.type==="received_not_processed").reduce((a,x)=>a+n(x.bucket.qty),0), note:"work not completed" },
    { key:"reconcile", label:"Reconcile", value:allBuckets.filter(x=>x.bucket.type==="reconcile").reduce((a,x)=>a+n(x.bucket.qty),0), note:"total jump / mismatch" },
  ];
  const selectedDeptForSize = dept === "all" ? null : dept;
  const controlRows = wipControlRows(filtered);
  const openRowDrill = (row, stage) => onOpen?.(row, stage || rowStatus(row).stage || routeFor(row)[0] || "cutting");
  const modeRows = viewMode === "order" ? wipOrderViewRows(filtered) : viewMode === "department" ? departmentCurrentRows(filtered).map(({stage,...r})=>r) : viewMode === "issue" ? departmentIssueRows(filtered).map(({stage,type,...r})=>r) : [];
  return <div className="mt-card">
    <div className="mt-section"><h3 className="mt-panel-title">Live WIP Status — Grid / Open Control</h3><div className="mt-panel-sub">Pending Stage = one main action. Optional Other Open Split shows smaller leftover/tail/R-A-M buckets by cut/order %, so it can be hidden when the sheet feels busy.</div></div>
    <div className="mt-section no-print">
      <div className="mt-summary-strip">{summary.map(s=><button key={s.key} className={`mt-summary-tile ${issue===s.key || (s.key==="all"&&issue==="all") ? "active" : ""}`} onClick={()=>setIssue(s.key)}><div className="label">{s.label}</div><div className="value">{typeof s.value === "number" && s.key!=="all" ? fmt(s.value) : s.value}</div><div className="mt-small">{s.note}</div></button>)}</div>
      <div className="mt-filter-row">
        <div className="mt-filter-group"><span className="mt-toolbar-label">WIP Search</span><Search size={14}/><input className="mt-input" value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="order / style / buyer / status / owner" style={{minWidth:230}}/></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Issue</span><select className="mt-select" value={issue} onChange={e=>setIssue(e.target.value)}><option value="all">All open/closed</option><option value="completed_not_issued">Ready for next dept</option><option value="received_not_processed">With department</option><option value="ram">R/A/M</option><option value="reconcile">Reconcile</option><option value="dispatch_hold">Dispatch Hold</option><option value="closed">Closed / balanced</option></select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Owner</span><select className="mt-select" value={owner} onChange={e=>setOwner(e.target.value)}>{owners.map(o=><option key={o} value={o}>{o === "all" ? "All owners" : o}</option>)}</select></div>
        <div className="mt-filter-group"><span className="mt-toolbar-label">Route</span><select className="mt-select" value={route} onChange={e=>setRoute(e.target.value)}><option value="all">All routes</option><option>Plain</option><option>Print</option><option>Embroidery</option><option>Print + Emb</option></select></div>
        <button className={`mt-btn ${sizeBreak?"primary":"ghost"}`} onClick={()=>setSizeBreak(v=>!v)}><Layers size={14}/>Size breakup</button>
        <button className="mt-btn ghost" onClick={()=>{setLocalSearch("");setDept("all");setIssue("all");setOwner("all");setRoute("all");setSort({key:"open",dir:"desc"});}}>Reset</button>
        <span className="mt-page-filter-note">{filtered.length} rows · {controlRows.length} open/control rows</span>
      </div>
      <div className="mt-view-mode-bar"><span className="mt-toolbar-label">Sheet View</span>{[["matrix","Grid View"],["control","Open Control"],["order","Order View"],["department","Department View"],["issue","Issue View"]].map(([k,l])=><button key={k} className={`mt-btn ${viewMode===k?"active":"ghost"}`} onClick={()=>setViewMode(k)}>{l}</button>)}<button className={`mt-btn ${showCutActivity?"active":"ghost"}`} onClick={()=>setShowCutActivity(v=>!v)}>{showCutActivity ? "Hide Other Open Split" : "Show Other Open Split"}</button></div>
    </div>
    {viewMode === "order" || viewMode === "department" || viewMode === "issue" ? <SimpleTable title={viewMode==="order"?"Order-wise WIP summary":viewMode==="department"?"Department open summary":"Issue-wise open summary"} sub="Summary view first. Click Full Matrix or drill dashboards only when style-level detail is needed." rows={modeRows} empty="No rows in this view." /> : viewMode === "control" ? <div className="mt-table-wrap"><table className="mt-table mt-compact-wip-table"><thead><tr><th className="mt-sticky">Open Style / Order</th><th>Pending Stage</th><th>Next Action</th>{showCutActivity && <th>Other Open Split</th>}<th>Open Qty</th><th>R/A/M</th><th>Idle</th><th>Owner</th></tr></thead><tbody>{controlRows.length ? controlRows.map(({row,status})=>{ const stage=status.stage || routeFor(row)[0] || "cutting"; const st=sdata(row,stage); const c=cellBreakup(row,stage); return <React.Fragment key={row.id}><tr className="drillable" onClick={()=>openRowDrill(row,stage)}><td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{row.set_id ? (()=>{ const si=setPackInfo(row, rows); return <span className="mt-chip mt-purple" title="Set can only ship min(components)"><Layers size={11}/>Set {row.set_id}{si ? ` · pack ${fmt(si.cap)}${si.unmatched>0?` · ${fmt(si.unmatched)} unmatched`:""}` : ""}</span>; })() : null}</div></div></td><td><PrimaryPendingStage row={row} onOpen={(st)=>openRowDrill(row,st)}/></td><td><div className="mt-small">{status.action}</div></td>{showCutActivity && <td><StatusByCutQty row={row} compact={true} excludePrimary={true} onOpen={(st)=>openRowDrill(row,st)}/></td>}<td><div className="mt-open-big">{fmt(status.qty)}</div><div className="mt-small">{c.note}</div></td><td>{fmt(c.ram)}</td><td>{status.idle}d</td><td><b>{status.owner}</b>{status.support ? <div className="mt-small">Support: {status.support}</div> : null}</td></tr>{sizeBreak && <tr className="mt-subrow"><td colSpan={showCutActivity ? 8 : 7}><SizeBreakupStrip row={row} stage={selectedDeptForSize || stage}/></td></tr>}</React.Fragment>; }) : <tr><td colSpan={showCutActivity ? 8 : 7} style={{padding:18}}>No open/control rows in the current WIP filters.</td></tr>}</tbody></table></div> : <div className="mt-table-wrap"><table className="mt-table"><thead><tr><SortTh sticky label="Style" sortKey="style" sort={sort} setSort={setSort}/><SortTh label="Pending Stage" sortKey="status" sort={sort} setSort={setSort}/>{showCutActivity && <th>Other Open Split</th>}<SortTh label="Owner" sortKey="owner" sort={sort} setSort={setSort}/><SortTh label="Route" sortKey="route" sort={sort} setSort={setSort}/>{STAGES.map(s=><th key={s.key}>{s.short}</th>)}<SortTh label="Open" sortKey="open" sort={sort} setSort={setSort}/><SortTh label="Idle" sortKey="idle" sort={sort} setSort={setSort}/><th>Next Action</th></tr></thead><tbody>
      {filtered.map(row => { const rs = rowStatus(row); const sizeStage = selectedDeptForSize || rs.stage; const openDrill = () => openRowDrill(row, rs.stage || routeFor(row)[0] || "cutting"); return <React.Fragment key={row.id}>
        <tr>
          <td className="mt-sticky mt-clickable-cell" onClick={openDrill} title="Click to open selected/current department"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{row.set_id ? (()=>{ const si=setPackInfo(row, rows); return <span className="mt-chip mt-purple" title="Set can only ship min(components)"><Layers size={11}/>Set {row.set_id}{si ? ` · pack ${fmt(si.cap)}${si.unmatched>0?` · ${fmt(si.unmatched)} unmatched`:""}` : ""}</span>; })() : null}<div className="mt-drill-hint">Open detail</div></div></div></td>
          <td className="mt-clickable-cell" onClick={openDrill}><PrimaryPendingStage row={row} onOpen={(stage)=>onOpen?.(row, stage)}/><div className="mt-small">Idle {rs.idle}d</div></td>
          {showCutActivity && <td><StatusByCutQty row={row} compact={true} excludePrimary={true} onOpen={(stage)=>onOpen?.(row, stage)}/></td>}
          <td className="mt-clickable-cell" onClick={openDrill}><b>{rs.owner}</b>{rs.support ? <div className="mt-small">Support: {rs.support}</div> : null}</td>
          <td className="mt-clickable-cell" onClick={openDrill}><span className="mt-chip mt-info">{routeType(row)}</span><div style={{marginTop:4}}>{routeFor(row).map(k=><span key={k} className="mt-chip mt-muted" style={{margin:"0 3px 3px 0"}}>{STAGE_BY_KEY[k].short}</span>)}</div></td>
          {STAGES.map(s=><StageCell key={s.key} row={row} stageKey={s.key} onOpen={onOpen}/>) }
          <td className="mt-clickable-cell" onClick={openDrill}><b>{fmt(rs.qty)}</b></td><td className="mt-clickable-cell" onClick={openDrill}>{rs.idle}d</td><td className="mt-clickable-cell" onClick={openDrill}>{rs.action}</td>
        </tr>
        {sizeBreak && <tr className="mt-subrow"><td colSpan={STAGES.length + (showCutActivity ? 9 : 8)}><SizeBreakupStrip row={row} stage={sizeStage}/></td></tr>}
      </React.Fragment>;})}
      {!filtered.length && <tr><td colSpan={STAGES.length + (showCutActivity ? 9 : 8)} style={{padding:18}}>No rows match current WIP filters.</td></tr>}
    </tbody></table></div>}
    <div className="mt-section"><span className="mt-chip mt-ok">Pending Stage = main action</span> <span className="mt-chip mt-info">Other Open Split = toggleable</span> <span className="mt-chip mt-warn">Click any row/cell for selected department only</span></div>
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
  const risk = backdateRisk(entryDate);
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
  if (stage === "cutting") return n(row.order_qty) * (1 + cuttingToleranceFrac());
  const st = sdata(row, stage);
  const backdated = ledger && asOfDate && asOfDate < today();
  const feed = backdated ? asOfFeed(row, ledger, stage, asOfDate) : stageFeed(row, stage);
  if (["received","reject","alter","missing"].includes(field)) return feed;
  if (field === "output") return feed;
  if (field === "issued") return backdated ? asOfStageFieldQty(row, ledger, stage, "output", asOfDate).qty : n(st.output);
  return feed || n(st.received) || n(row.order_qty);
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
    if (stage !== "cutting" && field === "output") {
      nextStage.received = Math.max(n(prevStage.received), stageFeed(row, stage));
    }
    stages[stage] = nextStage;
    return { ...row, stages, size_stage:{ ...(row.size_stage||{}), [stage]:{ ...(row.size_stage?.[stage]||{}), [field]:sizes } } };
  });
}
function getDailyEntryQty(getVal, row, size){
  return n(getVal(row, size));
}
function dailySizeRows(row, stage, field, getVal){
  return sizesFor(row).map(size => {
    const entryQty = getDailyEntryQty(getVal, row, size);
    if (!entryQty) return null;
    const baseField = field === "alter_clear" ? "output" : field;
    const oldQty = sizeMatrix(row, stage, baseField).find(x=>x.size===size)?.qty || 0;
    return { row, size, oldQty, newQty:oldQty + entryQty, delta:entryQty, entryQty };
  }).filter(Boolean);
}
function rowDailyEntryTotal(row, getVal){
  return sizesFor(row).reduce((a,size)=>a+getDailyEntryQty(getVal,row,size),0);
}
function validateDailyEntry(row, stage, field, getVal, ledger=null, entryDate=null){
  const entryTotal = rowDailyEntryTotal(row, getVal);
  const messages = [];
  if (!entryTotal) return { allowed:cumulativeAllowedTotal(row, stage, field === "alter_clear" ? "output" : field, ledger, entryDate), entryTotal:0, oldTotal:0, updatedTotal:0, blocked:false, messages, overCut:false };
  if (field === "alter_clear") {
    const oldAlterBySize = Object.fromEntries(sizeMatrix(row, stage, "alter").map(x=>[x.size,n(x.qty)]));
    const overSizes = sizesFor(row).filter(size => getDailyEntryQty(getVal,row,size) > n(oldAlterBySize[size]));
    const oldAlter = Object.values(oldAlterBySize).reduce((a,b)=>a+n(b),0);
    const oldOutput = sizeMatrix(row, stage, "output").reduce((a,x)=>a+n(x.qty),0);
    const updatedOutput = oldOutput + entryTotal;
    const feed = stage === "cutting" ? n(row.order_qty) : stageFeed(row, stage);
    const st = sdata(row, stage);
    const updatedRam = n(st.reject) + Math.max(0, oldAlter - entryTotal) + n(st.missing);
    if (overSizes.length) messages.push(`Alter clear above pending alter in size(s): ${overSizes.join(", ")}`);
    if (stage !== "cutting" && updatedOutput + updatedRam > feed) messages.push(`Output + pending R/A/M would exceed feed by ${fmt(updatedOutput + updatedRam - feed)}`);
    return { allowed:oldAlter, entryTotal, oldTotal:oldOutput, updatedTotal:updatedOutput, blocked:messages.length>0, messages, overCut:false, oldAlter, updatedAlter:Math.max(0, oldAlter-entryTotal) };
  }
  const oldTotal = sizeMatrix(row, stage, field).reduce((a,x)=>a+n(x.qty),0);
  const updatedTotal = oldTotal + entryTotal;
  const validation = validateCumulativeEdit(row, stage, field, updatedTotal, ledger, entryDate);
  const overCut = stage === "cutting" && updatedTotal > n(row.order_qty);
  return { ...validation, entryTotal, oldTotal, updatedTotal, blocked:validation.blocked, overCut };
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
      if (stage !== "cutting" && field === "output") nextStage.received = Math.max(n(prevStage.received), stageFeed(row, stage));
      stageSizes[field] = newMap;
    }
    stages[stage] = nextStage;
    sizeStage[stage] = stageSizes;
    return { ...row, stages, size_stage:sizeStage };
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
    changed_by:currentUserName(),
    entry_source:source,
    validation_scope:"size_wise_as_of_entry_date",
    remarks:`${source}: positive size-wise day entry. Entry date ${entryDate}; actual saved ${created.slice(0,10)} by ${currentUserName()}.`
  }));
}
async function saveLedgerToSupabase(newLedger, field){
  if (!newLedger.length) return;
  const payload = newLedger.map(({id, changed_by, ...x})=>({
    ...x,
    qty:n(x.qty),
    good_qty:["output","alter_clear"].includes(field) ? n(x.qty) : 0,
    reject_qty:field==="reject" ? n(x.qty) : 0,
    alter_qty:field==="alter" ? n(x.qty) : 0,
    missing_qty:field==="missing" ? n(x.qty) : 0,
    validation_snapshot:{ old_qty:x.old_qty, new_qty:x.new_qty, entry_source:x.entry_source, is_backdated:x.is_backdated, approval_status:x.approval_status, changed_by }
  }));
  const result = await robustInsertEntriesToSupabase(payload);
  if(result?.error) console.warn("Supabase production_entries save failed", result.error);
}
function receivingHistoryRows(row, stage, ledger=[]){
  if (!row || stage === "cutting") return [];
  const route = routeFor(row);
  const idx = route.indexOf(stage);
  const prevStage = idx > 0 ? route[idx-1] : null;
  if (!prevStage) return [];
  const sizes = sizesFor(row);
  const matching = (ledger||[]).filter(e=>ledgerRowMatchesStyle(e,row)).filter(e=>{
    const stg = String(e.stage||"");
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    return (stg === prevStage && ["issue","issued"].includes(typ)) || (stg === stage && ["receive","received"].includes(typ));
  }).sort((a,b)=>String(b.entry_date||b.date||"").localeCompare(String(a.entry_date||a.date||""))).slice(0,400);

  // User-facing history must stay horizontal: one activity/date row with sizes across columns.
  // Vertical one-size-per-row is only acceptable in raw audit ledgers, not WIP/detail screens.
  const grouped = new Map();
  matching.forEach(e=>{
    const stg = String(e.stage || "");
    const typ = String(e.entry_type || e.entryType || e.type || "").toLowerCase();
    const isPrevIssue = stg === prevStage;
    const entryDate = e.entry_date || e.date || "";
    const meaning = isPrevIssue ? `${stageLabel(prevStage)} issue to ${stageLabel(stage)}` : `${stageLabel(stage)} manual receive`;
    const key = [entryDate, stg, typ, meaning, e.created_at || "", e.changed_by || e.created_by || "—"].join("|::|");
    if (!grouped.has(key)) {
      grouped.set(key, {
        Entry_Date:entryDate,
        Source_Dept:stageLabel(stg),
        Meaning:meaning,
        _sizeQty:Object.fromEntries(sizes.map(size=>[size,0])),
        Total:0,
        Created_At:e.created_at || "",
        By:e.changed_by || e.created_by || "—"
      });
    }
    const g = grouped.get(key);
    const size = e.size || "Total";
    const qty = n(e.qty ?? e.delta ?? e.good_qty);
    if (sizes.includes(size)) g._sizeQty[size] = n(g._sizeQty[size]) + qty;
    else g.Total = n(g.Total) + qty;
  });

  return Array.from(grouped.values()).map(g=>{
    const sizeCols = withHorizontalSizes(row, g._sizeQty, sizes);
    const sizeTotal = Object.values(sizeCols).reduce((a,b)=>a+n(b),0);
    const { _sizeQty, ...rest } = g;
    return {
      Entry_Date:rest.Entry_Date,
      Source_Dept:rest.Source_Dept,
      Meaning:rest.Meaning,
      ...sizeCols,
      Total:n(rest.Total) + sizeTotal,
      Created_At:rest.Created_At,
      By:rest.By
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
    const key = [entryDate, typ, e.entry_source || e.source || "", createdAt, by].join("|::|");
    if (!grouped.has(key)) {
      grouped.set(key, {
        Entry_Date:entryDate,
        Department:stageLabel(stage),
        Activity:typeLabel(typ),
        Source:e.entry_source || e.source || "",
        _sizeQty:Object.fromEntries(sizes.map(size=>[size,0])),
        Total:0,
        Created_At:createdAt,
        By:by,
        Reason:e.backdate_reason || e.reason || ""
      });
    }
    const g = grouped.get(key);
    const size = e.size || "Total";
    const qty = n(e.qty ?? e.delta ?? e.good_qty);
    if (sizes.includes(size)) g._sizeQty[size] = n(g._sizeQty[size]) + qty;
    else g.Total = n(g.Total) + qty;
  });
  return Array.from(grouped.values()).map(g=>{
    const sizeCols = withHorizontalSizes(row, g._sizeQty, sizes);
    const sizeTotal = Object.values(sizeCols).reduce((a,b)=>a+n(b),0);
    const { _sizeQty, ...rest } = g;
    return {
      Entry_Date:rest.Entry_Date,
      Department:rest.Department,
      Activity:rest.Activity,
      Source:rest.Source,
      ...sizeCols,
      Total:n(rest.Total) + sizeTotal,
      Created_At:rest.Created_At,
      By:rest.By,
      Reason:rest.Reason
    };
  });
}

function SizeCumulativeEditor({ row, rows, setRows, ledger, setLedger, stage, initialField="output", source="wip_cell", onSaved }){
  const [field, setField] = useState(initialField);
  const [entryDate, setEntryDate] = useState(defaultEntryDate(ledger));
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState({});
  useEffect(()=>setDraft({}), [row?.id, stage, field]);
  if (!row) return null;
  const sizes = sizesFor(row);
  const risk = backdateRisk(entryDate);
  const needsReason = risk.days > 1;
  const reasonMissing = needsReason && !reason.trim();
  function getVal(_, size){ const key = `${row.id}|${size}`; return draft[key] !== undefined ? draft[key] : ""; }
  function setVal(size, value){ setDraft(d=>({ ...d, [`${row.id}|${size}`]:String(value).replace(/[^0-9]/g,"") })); }
  const validation = validateDailyEntry(row, stage, field, getVal, ledger, entryDate);
  const ctx = entryFieldContext(row, stage, field);
  const orderVariance = sizeVarianceInfo(row.order_qty, normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row)));
  const changes = dailySizeRows(row, stage, field, getVal);
  const newQty = changes.reduce((a,c)=>a+n(c.delta),0);
  const sizeContexts = sizes.map(size=>({ size, ...entryFieldSizeContext(row,stage,field,size), entry:n(getVal(row,size)) }));
  const fillOpen = () => setDraft(d=>{ const nd={...d}; sizeContexts.forEach(x=>{ nd[`${row.id}|${x.size}`]=String(Math.max(0,n(x.open))); }); return nd; });
  const clear = () => setDraft({});
  function save(){
    if (!changes.length) { alert("No new size-wise quantity entered."); return; }
    if (reasonMissing) { alert("Backdated entry older than normal next-day needs a reason before save."); return; }
    if (validation.blocked) { alert(`Blocked: ${validation.messages.join("; ") || "impossible sequence"}. Correct upstream/opening stock or create approved adjustment first.`); return; }
    if (!confirmEntryChecks({ entryDate, changes, stage, field, reason })) return;
    const newLedger = buildLedgerRows({ changes, stage, field, entryDate, reason, source });
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:[row], stage, field, getVal }));
    setLedger(prev => [...newLedger, ...prev]);
    saveLedgerToSupabase(newLedger, field);
    setDraft({});
    onSaved?.(newLedger);
  }
  return <div className="mt-edit-panel">
    <div className="mt-edit-panel-head"><h3 className="mt-panel-title">{stageLabel(stage)} — {fieldLabel(field)}</h3><div className="mt-panel-sub">Selected department only. Enter new quantity by size for the selected date. The updated total is shown as a cross-check, not as editable cumulative entry.</div></div>
    <div className="mt-section no-print"><div className="mt-backdate-box"><span className="mt-toolbar-label">Entry Date</span><input className="mt-input mt-entry-date mandatory" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /><span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span><span className="mt-toolbar-label">Dept</span><span className="mt-chip mt-info">{stageLabel(stage)}</span><span className="mt-toolbar-label">Entry Field</span><select className="mt-select" value={field} onChange={e=>setField(e.target.value)}>{(ENTRY_FIELDS.some(f=>f.key===field) ? ENTRY_FIELDS : [{key:field,label:fieldLabel(field)}, ...ENTRY_FIELDS]).map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select>{needsReason && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate reason required" style={{minWidth:250}} />}</div><div className="mt-ram-action-bar"><span className="mt-toolbar-label">R/A/M closure rows</span>{RAM_ENTRY_FIELDS.map(f=><button key={f.key} className={`mt-btn ghost ${field===f.key?"active":""}`} onClick={()=>{setField(f.key); setDraft({});}}>{f.label}</button>)}<span className="mt-small">Use these only to close/explain small balances; normal production entry stays Output / Issue.</span></div>{risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated date: validated against stock/WIP as-of this entry date and stamped manager-approval-required. Requires explicit approval confirmation before save.</div>}</div>
    <div className="mt-section"><div className="mt-entry-hero"><div className="mt-entry-hero-title"><span>{row.style_no}</span><span className="mt-chip mt-muted">{row.order_no}</span><span className="mt-chip mt-info">{stageLabel(stage)}</span><span className="mt-chip mt-warn">{fieldLabel(field)}</span></div><div className="mt-entry-hero-sub">{ctx.note} Reductions/corrections are not normal entry and must go through approval.</div>{orderVariance.diff !== 0 && <div className={`mt-chip ${statusClass(orderVariance.tone)}`} style={{marginTop:8}}>{orderVariance.text}</div>}<div className="mt-mandatory-note"><AlertTriangle size={14}/> Highlighted size boxes are open/mandatory when entering this row. Blank means no quantity entered for that size.</div></div><div className="mt-entry-metrics"><div className="mt-entry-metric"><div className="label">{ctx.availableLabel}</div><div className="value">{fmt(ctx.available)}</div><div className="note">source / feed</div></div><div className="mt-entry-metric"><div className="label">{ctx.previousLabel}</div><div className="value">{fmt(ctx.previous)}</div><div className="note">already entered</div></div><div className="mt-entry-metric"><div className="label">{ctx.openLabel}</div><div className="value">{fmt(ctx.open)}</div><div className="note">balance before entry</div></div><div className="mt-entry-metric"><div className="label">New Entry</div><div className="value">{fmt(newQty)}</div><div className="note">selected date</div></div><div className="mt-entry-metric"><div className="label">Cumulative After</div><div className="value">{fmt(validation.updatedTotal)}</div><div className="note">{fmt(validation.updatedTotal)} / {fmt(ctx.available)} total</div></div><div className="mt-entry-metric"><div className="label">Remaining After</div><div className="value">{fmt(Math.max(0, n(ctx.open)-newQty))}</div><div className="note">after saving</div></div></div><div className="mt-entry-row-actions"><button className="mt-btn" onClick={fillOpen}>Auto-fill open qty</button><button className="mt-btn ghost" onClick={clear}>Clear entry</button><button className="mt-btn primary" onClick={save} disabled={!changes.length || validation.blocked || reasonMissing}><CheckCircle2 size={14}/>Save Day Entry</button></div></div>
    <div className="mt-section"><div className="mt-dept-size-grid">{sizeContexts.map(x=>{ const remaining=Math.max(0,n(x.open)-n(x.entry)); const baseField=field==="alter_clear"?"output":field; const prev=n(sizeMatrix(row,stage,baseField).find(v=>v.size===x.size)?.qty); const updated=prev+n(x.entry); const blocked=field==="alter_clear" && n(x.entry)>n(x.open); return <div key={x.size} className="mt-dept-size-box"><div className="size">{x.size}</div><div className="line"><span>Open</span><b>{fmt(x.open)}</b></div><input className={`mt-cell-input ${n(x.open)>0?"mandatory":""} ${draft[`${row.id}|${x.size}`]!==undefined?"dirty":""} ${blocked||validation.blocked?"blocked":""}`} value={getVal(row,x.size)} onChange={e=>setVal(x.size,e.target.value)} placeholder="0" style={{width:"100%", marginTop:6}}/><div className="line"><span>Remaining</span><b>{fmt(remaining)}</b></div><div className="line"><span>Updated total</span><b>{fmt(updated)}</b></div></div>;})}</div>{validation.blocked && <div className="mt-locked-note" style={{marginTop:10}}>Blocked: {validation.messages.join("; ")}</div>}</div>
  </div>;
}

function QuickEntry({ rows, setRows, ledger, setLedger }){
  const [stage, setStage] = useState(()=>safeJsonLoad(uiStorageKey("entry_stage"), "stitching"));
  const [field, setField] = useState(()=>safeJsonLoad(uiStorageKey("entry_field"), "output"));
  const [entryDate, setEntryDate] = useState(()=>safeJsonLoad(uiStorageKey("entry_date"), defaultEntryDate(ledger)));
  const [reason, setReason] = useState(()=>safeJsonLoad(uiStorageKey("entry_reason"), ""));
  const [draft, setDraft] = useState(()=>safeJsonLoad(uiStorageKey("entry_draft"), {}));
  useEffect(()=>safeJsonSave(uiStorageKey("entry_stage"), stage), [stage]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_field"), field), [field]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_date"), entryDate), [entryDate]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_reason"), reason), [reason]);
  useEffect(()=>safeJsonSave(uiStorageKey("entry_draft"), draft), [draft]);
  const allStageRows = rows.filter(r => routeFor(r).includes(stage));
  const activeRows = allStageRows.filter(r => entryOpenQty(r, stage, field) > 0);
  const risk = backdateRisk(entryDate);
  const allSizes = Array.from(new Set(activeRows.flatMap(sizesFor)));
  function getVal(row, size){ const key = `${row.id}|${size}`; return draft[key] !== undefined ? draft[key] : ""; }
  function setVal(row, size, val){ setDraft(d => ({ ...d, [`${row.id}|${size}`]: String(val).replace(/[^0-9]/g,"") })); }
  function validate(row){ return validateDailyEntry(row, stage, field, getVal, ledger, entryDate); }
  function rowChanges(row){ return dailySizeRows(row, stage, field, getVal); }
  function fillRowOpen(row){ setDraft(d=>{ const nd={...d}; sizesFor(row).forEach(sz=>{ nd[`${row.id}|${sz}`]=String(Math.max(0,n(entryFieldSizeContext(row,stage,field,sz).open))); }); return nd; }); }
  function clearRow(row){ setDraft(d=>{ const nd={...d}; sizesFor(row).forEach(sz=>delete nd[`${row.id}|${sz}`]); return nd; }); }
  function fillAllOpen(){ setDraft(d=>{ const nd={...d}; activeRows.forEach(row=>sizesFor(row).forEach(sz=>{ nd[`${row.id}|${sz}`]=String(Math.max(0,n(entryFieldSizeContext(row,stage,field,sz).open))); })); return nd; }); }
  function save(){
    const changed = activeRows.flatMap(row => dailySizeRows(row, stage, field, getVal));
    const blocked = activeRows.filter(r=>validate(r).blocked);
    if (blocked.length) { alert(`Blocked: ${blocked.length} row(s) have impossible quantity sequence: ${blocked.map(r=>`${r.style_no}: ${validate(r).messages.join(", ")}`).slice(0,3).join(" | ")}. Correct upstream/opening stock or create approved adjustment first.`); return; }
    if (risk.days > 1 && !reason.trim()) { alert("Backdated entry older than normal next-day needs a reason before save."); return; }
    if (!changed.length) { alert("No new size-wise quantity entered."); return; }
    if (!confirmEntryChecks({ entryDate, changes:changed, stage, field, reason })) return;
    setRows(prev => applyDailySizeEntries({ rows:prev, targetRows:activeRows, stage, field, getVal }));
    const newLedger = buildLedgerRows({ changes:changed, stage, field, entryDate, reason, source:"dpr_quick_entry" });
    setLedger(prev => [...newLedger, ...prev]);
    saveLedgerToSupabase(newLedger, field);
    setDraft({});
  }
  const totalOpenForField = activeRows.reduce((a,row)=>a+entryOpenQty(row,stage,field),0);
  const totalNewEntry = activeRows.reduce((a,row)=>a+validate(row).entryTotal,0);
  const totals = entryContextTotals(activeRows, stage, field);
  const remainingAfter = Math.max(0, totalOpenForField - totalNewEntry);
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">DPR Quick Entry — Open Styles Only</h3><div className="mt-panel-sub">Select date, department and entry field. The sheet shows only rows with open quantity for that exact action. Enter new quantity by size; updated totals are shown only for cross-check.</div></div>
    <div className="mt-section no-print"><div className="mt-toolbar"><span className="mt-toolbar-label">Entry Date</span><input className="mt-input mt-entry-date mandatory" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /><span className={`mt-chip ${statusClass(risk.tone)}`}>{risk.label}</span><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={stage} onChange={e=>{setStage(e.target.value); setDraft({});}}>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select><span className="mt-toolbar-label">Entry Field</span><select className="mt-select" value={field} onChange={e=>{setField(e.target.value); setDraft({});}}>{(ENTRY_FIELDS.some(f=>f.key===field) ? ENTRY_FIELDS : [{key:field,label:fieldLabel(field)}, ...ENTRY_FIELDS]).map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select>{risk.days>1 && <input className="mt-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Backdate reason required" style={{minWidth:240}}/>}<button className="mt-btn" onClick={fillAllOpen}>Auto-fill all open</button><button className="mt-btn primary" onClick={save}><CheckCircle2 size={14}/>Save Day Entry</button></div><div className="mt-ram-action-bar"><span className="mt-toolbar-label">R/A/M closure rows</span>{RAM_ENTRY_FIELDS.map(f=><button key={f.key} className={`mt-btn ghost ${field===f.key?"active":""}`} onClick={()=>{setField(f.key); setDraft({});}}>{f.label}</button>)}<span className="mt-small">Rejection / Missing / Alter are not in the main dropdown; use these rows when closing/explaining balance.</span></div>{risk.locked && <div className="mt-locked-note" style={{marginTop:8}}>Older backdated entries are validated as-of the selected date and stamped manager-approval-required; explicit approval confirmation is required before save.</div>}
    <div className="mt-entry-hero" style={{marginTop:10}}><div className="mt-entry-hero-title"><span>{entryDate}</span><span className="mt-chip mt-info">{stageLabel(stage)}</span><span className="mt-chip mt-warn">{fieldLabel(field)}</span><span className="mt-chip mt-muted">{activeRows.length} open rows</span></div><div className="mt-entry-hero-sub">{fieldHelp(field)} Showing only styles where this action still has open quantity. Normal entry is positive/new quantity only; reductions go to approval.</div><div className="mt-mandatory-note"><AlertTriangle size={14}/> Mandatory entry context: confirm Date, Dept and Action before saving. Highlighted cells are open quantities.</div></div>
    <div className="mt-entry-metrics"><div className="mt-entry-metric"><div className="label">Available / source</div><div className="value">{fmt(totals.available)}</div><div className="note">previous dept or feed</div></div><div className="mt-entry-metric"><div className="label">Already entered</div><div className="value">{fmt(totals.previous)}</div><div className="note">same field before entry</div></div><div className="mt-entry-metric"><div className="label">Open now</div><div className="value">{fmt(totalOpenForField)}</div><div className="note">only shown rows</div></div><div className="mt-entry-metric"><div className="label">New entry</div><div className="value">{fmt(totalNewEntry)}</div><div className="note">selected date</div></div><div className="mt-entry-metric"><div className="label">Cumulative after</div><div className="value">{fmt(totals.previous + totalNewEntry)}</div><div className="note">{fmt(totals.previous + totalNewEntry)} / {fmt(totals.available)} total</div></div><div className="mt-entry-metric"><div className="label">Remaining after</div><div className="value">{fmt(remainingAfter)}</div><div className="note">after save</div></div></div></div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Open Style / Order</th><th>Open Qty</th>{allSizes.map(sz=><th key={sz}>{sz}</th>)}<th>New Entry</th><th>Remaining</th><th>Save Status</th></tr></thead><tbody>{activeRows.length ? activeRows.map(row=>{ const sizes = sizesFor(row); const v=validate(row); const ctx=entryFieldContext(row,stage,field); const rowNew=v.entryTotal; const rowRemaining=Math.max(0,n(ctx.open)-rowNew); return <tr key={row.id}><td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div>{(()=>{ const ov=sizeVarianceInfo(row.order_qty, normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row))); return ov.diff!==0 ? <div className={`mt-chip ${statusClass(ov.tone)}`} style={{marginTop:4}}>{ov.text}</div> : null; })()}<div className="mt-entry-row-actions"><button className="mt-btn" onClick={()=>fillRowOpen(row)}>Fill row open</button><button className="mt-btn ghost" onClick={()=>clearRow(row)}>Clear</button></div></div></div></td><td><div className="mt-open-big">{fmt(ctx.open)}</div><div className="mt-small">{ctx.openLabel}</div><div className="mt-small">{ctx.availableLabel}: {fmt(ctx.available)}</div></td>{allSizes.map(sz=> sizes.includes(sz) ? <td key={sz} className="mt-entry-size-cell">{(()=>{ const szCtx=entryFieldSizeContext(row,stage,field,sz); const entry=n(getVal(row,sz)); const remain=Math.max(0,n(szCtx.open)-entry); return <><div className="mt-entry-size-open">Open <b>{fmt(szCtx.open)}</b><br/>Prev {fmt(szCtx.previous)} · Avl {fmt(szCtx.available)}</div><input className={`mt-cell-input ${n(szCtx.open)>0?"mandatory":""} ${draft[`${row.id}|${sz}`]!==undefined?"dirty":""} ${v.blocked?"blocked":""}`} value={getVal(row,sz)} onChange={e=>setVal(row,sz,e.target.value)} placeholder="0" /><div className={`mt-entry-remain ${entry?"warn":""}`}>Rem {fmt(remain)}</div></>; })()}</td> : <td key={sz} className="mt-small">—</td>)}<td><b>{fmt(rowNew)}</b></td><td><b>{fmt(rowRemaining)}</b><div className="mt-small">cumulative after {fmt(v.updatedTotal)} / {fmt(ctx.available)}</div></td><td>{v.blocked ? <span className="mt-chip mt-late">Blocked</span> : v.overCut ? <span className="mt-chip mt-purple">Extra cut warning</span> : v.entryTotal ? <span className="mt-chip mt-warn">Ready to save</span> : <span className="mt-chip mt-ok">OK</span>}<div className="mt-small">{v.messages?.join("; ") || "Positive day entry only"}</div></td></tr>;}) : <tr><td colSpan={allSizes.length+5} style={{padding:18}}>No open styles for {stageLabel(stage)} · {fieldLabel(field)} in the current filter.</td></tr>}</tbody></table></div>
  </div>;
}



function registerActivityLabel(type){
  const t = String(type || "").toLowerCase();
  if (["good_output","output","completed","complete","done"].includes(t)) return "Completed / Output";
  if (["issue","issued"].includes(t)) return "Dept Issue Forward";
  if (["receive","received"].includes(t)) return "Dept Receive";
  if (["reject","rejection"].includes(t)) return "Rejection";
  if (t === "missing") return "Missing";
  if (t === "alter" || t === "alter_issue") return "Alter Defect";
  if (t === "alter_clear") return "Alter Clear";
  return t || "Entry";
}
function correctionFieldToEntryType(field){
  if (field === "output") return "good_output";
  if (field === "issued") return "issue";
  if (field === "received") return "receive";
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
      if (stage !== "cutting" && baseField === "output") nextStage.received = Math.max(n(prevStage.received), stageFeed(row, stage));
      stageSizes[baseField] = newMap;
    }
    stages[stage] = nextStage;
    sizeStage[stage] = stageSizes;
    return { ...row, stages, size_stage:sizeStage };
  });
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
        _stage:stage,
        Created_At:entry.created_at || entry.createdAt || "",
        By:entry.changed_by || entry.created_by || entry.user || "—",
        Reason:entry.backdate_reason || entry.reason || "",
      });
    }
    const g = map.get(groupKey);
    const size = String(entry.size || "NO_SIZE").toUpperCase();
    const qty = n(entry.qty ?? entry.delta ?? entry.good_qty ?? entry.reject_qty ?? entry.alter_qty ?? entry.missing_qty);
    if (["Completed / Output"].includes(label)) g.Completed_Output += qty;
    else if (label === "Dept Issue Forward") g.Issue_Forward += qty;
    else if (label === "Dept Receive") g.Receive += qty;
    else if (label === "Rejection") { g.Rejection += qty; g.R_A_M_Total += qty; }
    else if (label === "Missing") { g.Missing += qty; g.R_A_M_Total += qty; }
    else if (label === "Alter Defect") { g.Alter_Defect += qty; g.R_A_M_Total += qty; }
    else if (label === "Alter Clear") g.Alter_Clear += qty;
    g.Total_Activity += qty;
    g._sizes[size] = n(g._sizes[size]) + qty;
    if (!g.Created_At || String(entry.created_at || entry.createdAt || "") < g.Created_At) g.Created_At = entry.created_at || entry.createdAt || g.Created_At;
  });
  return Array.from(map.values()).map(r=>{
    const sizeCols = withHorizontalSizes({}, r._sizes, allSizes);
    const {_sizes, ...core} = r;
    return { ...core, ...sizeCols };
  }).sort((a,b)=>String(a.Entry_Date).localeCompare(String(b.Entry_Date)) || String(a.Department).localeCompare(String(b.Department)) || String(a.Style).localeCompare(String(b.Style)));
}
function OutputRegisterView({ rows, setRows, ledger, setLedger, focus }){
  const defaultFrom = today().slice(0,7) + "-01";
  const [from,setFrom] = useState(()=>safeJsonLoad(uiStorageKey("register_from"), defaultFrom));
  const [to,setTo] = useState(()=>safeJsonLoad(uiStorageKey("register_to"), today()));
  const [dept,setDept] = useState(()=>safeJsonLoad(uiStorageKey("register_dept"), "all"));
  const [activity,setActivity] = useState(()=>safeJsonLoad(uiStorageKey("register_activity"), "all"));
  const [query,setQuery] = useState(()=>safeJsonLoad(uiStorageKey("register_query"), ""));
  useEffect(()=>safeJsonSave(uiStorageKey("register_from"), from), [from]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_to"), to), [to]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_dept"), dept), [dept]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_activity"), activity), [activity]);
  useEffect(()=>safeJsonSave(uiStorageKey("register_query"), query), [query]);
  useEffect(()=>{
    if (!focus) return;
    const nextDept = focus.stage || "all";
    setDept(nextDept);
    setActivity(focus.activity || "all");
    const nextQuery = [focus.order_no, focus.style_no, focus.colour, focus.component].filter(Boolean).join(" ");
    setQuery(nextQuery);
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
  }, [focus?.id]);
  const activities = useMemo(()=>["all", ...Array.from(new Set((ledger||[]).map(e=>registerActivityLabel(e.entry_type || e.entryType || e.type)).filter(Boolean))).sort()], [ledger]);
  const registerRows = useMemo(()=>outputRegisterRows(rows, ledger, {from,to,dept,activity,query}), [rows, ledger, from, to, dept, activity, query]);
  const totalOutput = registerRows.reduce((a,r)=>a+n(r.Completed_Output),0);
  const totalIssue = registerRows.reduce((a,r)=>a+n(r.Issue_Forward),0);
  const totalRAM = registerRows.reduce((a,r)=>a+n(r.R_A_M_Total),0);
  const allSizes = allReportSizes(rows);
  function exportRegister(){ exportXlsx(`production_output_register_${from}_to_${to}.xlsx`, [{name:"Output Register", rows:registerRows.map(({_stage, ...r})=>r)}]); }
  function correctOldEntry(r){
    const stage = r._stage || STAGES.find(s=>s.label===r.Department)?.key || "cutting";
    const field = (window.prompt(`Correction field for ${r.Style} on ${r.Entry_Date}: output / issued / received / reject / missing / alter / alter_clear`, "output") || "").trim().toLowerCase();
    if (!["output","issued","received","reject","missing","alter","alter_clear"].includes(field)) { alert("Correction cancelled: invalid field."); return; }
    const text = window.prompt(`Enter size corrections for ${r.Style} (${stageLabel(stage)} ${fieldLabel(field)}). Use + or - by size, e.g. S=+10, M=-5`, "");
    const sizeMap = parseRegisterSizeQtyText(text || "");
    const total = Object.values(sizeMap).reduce((a,b)=>a+n(b),0);
    if (!Object.keys(sizeMap).length || !total) { alert("No correction quantity entered."); return; }
    const reason = window.prompt("Reason / approval note for editing old entry:", "Register correction") || "Register correction";
    if (!window.confirm(`Create audit-safe correction?\n\nDate: ${r.Entry_Date}\nDept: ${stageLabel(stage)}\nField: ${fieldLabel(field)}\nCorrection total: ${fmt(total)}\nReason: ${reason}\n\nThis adds a correction ledger row and updates current WIP immediately; it does not silently overwrite history.`)) return;
    const targetRow = rows.find(x=>String(x.order_no||"")===String(r.Order||"") && String(x.style_no||"")===String(r.Style||"") && String(x.colour||"")===String(r.Colour||"") && String(x.component||"")===String(r.Component||""));
    if (!targetRow) { alert("Matching style row not found in current filtered rows."); return; }
    const changes = Object.entries(sizeMap).map(([size, delta])=>{
      const baseField = field === "alter_clear" ? "output" : field;
      const oldQty = sizeMatrix(targetRow, stage, baseField).find(x=>String(x.size).toUpperCase()===String(size).toUpperCase())?.qty || 0;
      return { row:targetRow, size:String(size).toUpperCase(), oldQty:n(oldQty), newQty:n(oldQty)+n(delta), delta:n(delta), entryQty:n(delta) };
    });
    const newLedger = buildLedgerRows({ changes, stage, field, entryDate:r.Entry_Date, reason, source:"register_old_entry_correction" });
    setRows(prev=>applyRegisterCorrectionToRows({ rows:prev, target:r, stage, field, sizeMap }));
    setLedger(prev=>[...newLedger, ...(prev||[])]);
    saveLedgerToSupabase(newLedger, field);
  }
  const displayRows = registerRows.map(({_stage, ...r})=>r);
  const cols = displayRows.length ? Object.keys(displayRows[0]) : ["Entry_Date","Department","Order","Style","Completed_Output","Issue_Forward","R_A_M_Total"];
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Output / Issue-Receive Register</h3><div className="mt-panel-sub">Precise horizontal register for all departments. One row per date + department + order/style/component. R/A/M is shown in simple columns, not separate rows. Old entries are corrected through audit-safe correction rows.</div>{focus && <div className="mt-context-strip" style={{marginTop:8}}><span className="mt-chip mt-info">Opened from WIP</span><span className="mt-chip mt-muted">{focus.order_no}</span><span className="mt-chip mt-muted">{focus.style_no}</span><span className="mt-chip mt-muted">{stageLabel(focus.stage)}</span><span className="mt-small">Use Correct on the matching row to edit by audit-safe correction.</span></div>}</div>
    <div className="mt-section no-print"><div className="mt-toolbar"><span className="mt-toolbar-label">From</span><input className="mt-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /><span className="mt-toolbar-label">To</span><input className="mt-input" type="date" value={to} onChange={e=>setTo(e.target.value)} /><span className="mt-toolbar-label">Dept</span><select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select><span className="mt-toolbar-label">Activity</span><select className="mt-select" value={activity} onChange={e=>setActivity(e.target.value)}>{activities.map(a=><option key={a} value={a}>{a==="all"?"All activities":a}</option>)}</select><input className="mt-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order / style / buyer / colour" style={{minWidth:260}}/><button className="mt-btn" onClick={()=>{setDept("all");setActivity("all");setQuery("");}}>Clear</button><button className="mt-btn" onClick={exportRegister}><Download size={14}/>Export</button></div></div>
    <div className="mt-section"><div className="mt-entry-metrics"><div className="mt-entry-metric"><div className="label">Rows</div><div className="value">{fmt(registerRows.length)}</div><div className="note">date first</div></div><div className="mt-entry-metric"><div className="label">Completed / Output</div><div className="value">{fmt(totalOutput)}</div><div className="note">filtered period</div></div><div className="mt-entry-metric"><div className="label">Issue Forward</div><div className="value">{fmt(totalIssue)}</div><div className="note">filtered period</div></div><div className="mt-entry-metric"><div className="label">R/A/M</div><div className="value">{fmt(totalRAM)}</div><div className="note">simple columns</div></div></div></div>
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}<th className="no-print">Edit</th></tr></thead><tbody>{displayRows.length ? displayRows.map((r,i)=><tr key={`${r.Entry_Date}-${r.Order}-${r.Style}-${i}`}>{cols.map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}<td className="no-print"><button className="mt-btn ghost" onClick={()=>correctOldEntry(registerRows[i])}>Correct</button></td></tr>) : <tr><td colSpan={cols.length+1} style={{padding:18}}>No activity entries found for this filter.</td></tr>}</tbody></table></div>
    <div className="mt-speed-note"><b>Correction rule:</b> old output/issue/R/A/M entries are edited by adding a dated correction ledger row, so history remains auditable and WIP updates immediately.</div>
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
  sources.push({ key:"dept_received", label:`${stageLabel(dept)} received/accepted`, qty:n(st.received || feed), readyType:"Dept accepted", status:n(st.received || feed)>0?"Ready":"Not ready" });
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

function planRowEffectiveQty(p){
  const target = n(p.eight_hr_target);
  if (!p.changeover || !target) return n(p.planned_qty);
  const hourly = target / 8;
  // Factory rule: on changeover, next style gets 70% of the hours it actually runs that day.
  // Do not subtract a separate 2.5h here; remaining_hours is already the planner-entered run window.
  const effectiveHours = Math.max(0, n(p.remaining_hours)) * 0.70;
  return Math.round(hourly * effectiveHours);
}
function achievedForPlan(plan, rows, ledger=[]){
  const date = String(plan.plan_date||"").slice(0,10);
  const style = plan.style_no;
  const dept = plan.dept;
  const line = plan.line || "";
  const fromLedger = (ledger||[]).filter(e=>String(e.entry_date||"").slice(0,10)===date && String(e.style_no||e.style||"")===style && String(e.stage||"")===dept && ["good_output","output","receive","received"].includes(String(e.entry_type||e.type||"").toLowerCase()));
  if (fromLedger.length) return fromLedger.reduce((a,e)=>a+n(e.qty ?? e.delta ?? e.good_qty),0);
  const row = rows.find(r=>r.id===plan.row_id || (r.style_no===style && r.order_no===plan.order_no));
  if (!row) return 0;
  const st = sdata(row, dept);
  if (dept === "stitching" && line && row.line !== line) return 0;
  return Math.min(n(plan.planned_qty), n(st.output));
}
function planVsAchievedRows(planRows, rows, ledger=[]){
  return (planRows||[]).map(p=>{
    const achieved = achievedForPlan(p, rows, ledger);
    const plan = n(p.planned_qty);
    const sameStyleActual = achieved > 0;
    return { Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line || "Dept total", Planned_Style:p.style_no, Buyer:p.buyer, Source:p.source_label || p.source, Source_Type:p.source_type, Difficulty:p.difficulty, Planned:plan, Achieved:achieved, Variance:achieved-plan, Qty_Achievement:plan?`${Math.round(achieved*1000/plan)/10}%`:"—", Style_Adherence:sameStyleActual?"Matched / partial":"No matching actual yet", Plan_Status:p.status || "Draft", Remarks:p.remarks || "" };
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
      const base = { Dept:stageLabel(stage), Order:row.order_no, Style:row.style_no, Buyer:row.buyer, Colour:row.colour, Component:row.component, Owner:"Production Coordinator", HOD:stageOwner(stage), Received:n(st.received), Output:n(st.output), Issued:n(st.issued), Open:n(c.open), RAM:n(c.ram), Idle:`${n(st.idle)}d` };
      const buckets = issueBuckets(row).filter(b=>b.stage===stage);
      const hasRecon = buckets.some(b=>b.type==="reconcile");
      if (hasRecon) reconcile.push({ ...base, Problem:buckets.filter(b=>b.type==="reconcile").map(b=>b.status).join(" | "), Difference:buckets.filter(b=>b.type==="reconcile").reduce((a,b)=>a+n(b.qty),0), Action:"Correct entry or approved adjustment" });
      else if (n(c.open)===0 && n(c.ram)===0 && (n(st.received)>0 || n(st.output)>0 || n(st.issued)>0)) ready.push({ ...base, Closure_Status:"Ready to close", Action:"Coordinator to close department/style" });
      else if (n(c.open)>0) cannotClose.push({ ...base, Closure_Status:"Cannot close - open balance", Action:"Explain balance / issue forward / receive confirm" });
      if (n(c.ram)>0) ram.push({ ...base, Issue_Type:"R/A/M", Total_RAM:n(c.ram), Action:"Close rejection / alter / missing reason and recovery" });
    });
  });
  const riskyLedger = ledger || [];
  const risky = riskyLedger.filter(e=>e.is_backdated || e.backdate_reason || e.approval_status || e.validation_snapshot?.backdate_reason).map(e=>{
    const qtyVal = e.qty ?? e.delta;
    return { Entry_Date:e.entry_date, Created_At:e.created_at, User:e.changed_by || e.created_by || e.validation_snapshot?.changed_by || "—", Dept:stageLabel(e.stage), Style:e.style_no || e.style, Size:e.size || "Total", Qty:qtyVal, Reason:e.backdate_reason || e.validation_snapshot?.backdate_reason || "", Approval:e.approval_status || e.validation_snapshot?.approval_status || "" };
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

function PlanPrintGrid({ gridRows, weekDays, activeDept, line, planRows, setWeekQty }){
  const blocks = [weekDays.slice(0,3), weekDays.slice(3,6)];
  return <div className="mt-plan-print-block">{blocks.map((days,idx)=><div key={idx} className="mt-table-wrap"><table className="mt-table mt-plan-week-table mt-plan-print-table"><thead><tr><th className="mt-sticky mt-plan-row-label">Style / {activeDept==="stitching"?"line":"dept"}</th>{days.map(day=><th key={day} className="day-col">{shortDayLabel(day)}</th>)}<th>Notes</th></tr></thead><tbody>{gridRows.length ? gridRows.map(gr=><tr key={`${idx}-${gr.row_id}-${gr.line||"dept"}`}><td className="mt-sticky"><b>{gr.style_no}</b><div className="mt-small">{gr.order_no} · {gr.buyer} · {gr.colour} · {gr.component}</div><span className="mt-chip mt-info">{activeDept==="stitching" ? (gr.line||line) : stageLabel(activeDept)}</span></td>{days.map(day=>{ const existing=(planRows||[]).find(p=>samePlanRow(p,gr,day)); return <td key={day} className="day-col"><div className="mt-plan-cell"><input className="mt-input mandatory" value={existing?.planned_qty || ""} onChange={e=>setWeekQty(gr,day,e.target.value)} placeholder="0"/><span className="hint">total day target</span>{existing?.achieved_qty_snapshot ? <span className="hint">ach {fmt(existing.achieved_qty_snapshot)}</span> : null}</div></td>; })}<td><span className="mt-small">Printable {idx===0?"top":"bottom"} half. Type total daily target; no SMV required.</span></td></tr>) : <tr><td colSpan={days.length+2}>Select a style from the pool to start the weekly grid.</td></tr>}</tbody></table></div>)}</div>;
}

function PlanningView({ rows, planRows, setPlanRows, ledger, setRows }){
  const [mode,setMode] = useState("stitching");
  const [dept,setDept] = useState("printing");
  const [date,setDate] = useState(defaultEntryDate(ledger));
  const [line,setLine] = useState(productionLineNames()[0] || "STF-1");
  const [selectedRow,setSelectedRow] = useState(rows[0]?.id || "");
  const [manualQty,setManualQty] = useState("");
  const [eightHr,setEightHr] = useState("1200");
  const [remainingHours,setRemainingHours] = useState("8");
  const [changeover,setChangeover] = useState(false);
  const activeDept = mode === "stitching" ? "stitching" : dept;
  const pool = planningPoolRows(rows, activeDept, planRows);
  const row = rows.find(r=>r.id===selectedRow) || rows[0];
  const sourceOptions = row ? stagePlanSources(row, activeDept) : [];
  const [source,setSource] = useState("manual_future");
  useEffect(()=>{ if (row) setSource(bestPlanSource(row, activeDept).key); }, [selectedRow, activeDept]);
  const chosenSource = sourceOptions.find(s=>s.key===source) || sourceOptions[0] || {qty:0,label:"Manual future plan",readyType:"Manual / not yet ready"};
  const recommended = changeover ? planRowEffectiveQty({eight_hr_target:eightHr,changeover,remaining_hours:remainingHours,planned_qty:manualQty}) : Math.min(n(chosenSource.qty)||n(row?.order_qty), n(manualQty)||n(chosenSource.qty)||n(row?.order_qty));
  function addPlan(){
    if (!row) return;
    const qty = n(manualQty) || recommended || n(chosenSource.qty) || Math.round(n(row.order_qty)*0.25);
    const p = { id:uid("plan"), plan_date:date, dept:activeDept, line:activeDept==="stitching"?line:"", row_id:row.id, order_no:row.order_no, style_no:row.style_no, buyer:row.buyer, colour:row.colour, component:row.component, source:source, source_label:chosenSource.label, source_type:chosenSource.readyType, available_qty:chosenSource.qty, planned_qty:qty, eight_hr_target:n(eightHr), changeover, remaining_hours:n(remainingHours), difficulty:row.difficulty || "Normal", priority:"Normal", status: chosenSource.readyType?.includes("Manual") ? "Manual future / risk" : "Draft", remarks: chosenSource.readyType?.includes("Manual") ? "Manual style + quantity selected; readiness may be pending." : "" };
    setPlanRows(prev=>[...prev,p]);
    setManualQty("");
  }
  function updatePlan(id, patch){ setPlanRows(prev=>prev.map(p=>p.id===id?{...p,...patch}:p)); }
  const visiblePlans = (planRows||[]).filter(p=>p.dept===activeDept).sort((a,b)=>String(a.plan_date).localeCompare(String(b.plan_date)) || String(a.line).localeCompare(String(b.line)));
  const pva = planVsAchievedRows(visiblePlans, rows, ledger);
  const weekDays = planningSixDays(date);
  const gridRows = useMemo(()=>{
    const map = new Map();
    visiblePlans.forEach(p=>{
      const key = `${p.row_id}|${p.line||"dept"}`;
      if(!map.has(key)) map.set(key,{ row: rows.find(r=>r.id===p.row_id), row_id:p.row_id, line:p.line||"", dept:p.dept, style_no:p.style_no, order_no:p.order_no, buyer:p.buyer, colour:p.colour, component:p.component });
    });
    if(row){
      const key = `${row.id}|${activeDept==="stitching"?line:"dept"}`;
      if(!map.has(key)) map.set(key,{ row, row_id:row.id, line:activeDept==="stitching"?line:"", dept:activeDept, style_no:row.style_no, order_no:row.order_no, buyer:row.buyer, colour:row.colour, component:row.component });
    }
    return Array.from(map.values()).filter(x=>x.row);
  }, [visiblePlans, rows, row, activeDept, line]);
  function setWeekQty(base, day, raw){
    const qty = n(String(raw).replace(/[^0-9]/g,""));
    setPlanRows(prev=>{
      const exists = (prev||[]).find(p=>samePlanRow(p,base,day));
      if (exists) return prev.map(p=>p.id===exists.id?{...p, planned_qty:qty, eight_hr_target:qty, status: qty?"Draft":"Zero / no plan"}:p);
      if (!qty) return prev;
      const r = base.row;
      return [...prev,{ id:uid("plan"), plan_date:day, dept:activeDept, line:activeDept==="stitching"?base.line:"", row_id:r.id, order_no:r.order_no, style_no:r.style_no, buyer:r.buyer, colour:r.colour, component:r.component, source:"manual_future", source_label:"Manual Excel-style day target", source_type:"Manual / not yet ready", available_qty:0, planned_qty:qty, eight_hr_target:qty, changeover:false, remaining_hours:8, difficulty:"Normal", priority:r.priority||"Normal", status:"Draft", remarks:"Entered from 6-day planning grid; SMV/OPS not required." }];
    });
  }
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Production Planning</h3><div className="mt-panel-sub">Rolling plan. Stitching is line-wise; other departments are day-wise. Manual means you can select style + quantity even if upstream is not ready yet, and the row is marked as Manual Future / Risk.</div></div>
    <div className="mt-section no-print"><div className="mt-filter-row"><button className={`mt-btn ${mode==="stitching"?"primary":"ghost"}`} onClick={()=>setMode("stitching")}>Stitching line-wise</button><button className={`mt-btn ${mode==="dept"?"primary":"ghost"}`} onClick={()=>setMode("dept")}>Other dept day-wise</button>{mode==="dept" && <select className="mt-select" value={dept} onChange={e=>setDept(e.target.value)}>{STAGES.filter(s=>!["stitching"].includes(s.key)).map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select>}<span className="mt-chip mt-info">Changeover rule · next style = 70% of remaining run hours</span><span className="mt-chip mt-muted">Actuals will roll shortfall forward</span></div></div>
    <div className="mt-two"><div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">{stageLabel(activeDept)} Planning Pool</h3><div className="mt-panel-sub">Department-specific pool. Ready quantities come from route/WIP; manual future planning is allowed but marked at risk.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Style</th><th>Source</th><th>Available</th><th>Planned</th><th>Status</th><th>Action</th></tr></thead><tbody>{pool.map(p=><tr key={p.row.id} onClick={()=>setSelectedRow(p.row.id)} className={selectedRow===p.row.id?"drillable":""}><td><b>{p.Style}</b><div className="mt-small">{p.Order} · {p.Buyer} · {p.Colour} · {p.Component}</div></td><td>{p.Source}<div className="mt-small">{p.Source_Type}</div></td><td>{fmt(p.Available)}</td><td>{fmt(p.Already_Planned)}</td><td>{p.Status}</td><td><button className="mt-btn ghost" onClick={(e)=>{e.stopPropagation();setSelectedRow(p.row.id);}}>Select</button></td></tr>)}</tbody></table></div></div>
      <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Add / Manual Plan Row</h3><div className="mt-panel-sub">Fast add. For manual future plan, choose source = Manual Future Plan and enter quantity. This can place a style in printing plan even if cutting is not done yet.</div></div><div className="mt-section" style={{display:"grid", gap:8}}><label className="mt-small">Plan date</label><input className="mt-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>{activeDept==="stitching" && <><label className="mt-small">Line</label><select className="mt-select" value={line} onChange={e=>setLine(e.target.value)}>{productionLineNames().map(l=><option key={l} value={l}>{l}</option>)}</select><div className="mt-small">Edit/add line names in Settings → Production Rules.</div></>}<label className="mt-small">Style</label><select className="mt-select" value={selectedRow} onChange={e=>setSelectedRow(e.target.value)}>{rows.map(r=><option key={r.id} value={r.id}>{r.style_no} · {r.buyer} · {r.colour} · {r.component}</option>)}</select><label className="mt-small">Source</label><select className="mt-select" value={source} onChange={e=>setSource(e.target.value)}>{sourceOptions.map(s=><option key={s.key} value={s.key}>{s.label} · {fmt(s.qty)} · {s.readyType}</option>)}</select><div className="mt-two"><div><label className="mt-small">Plan qty</label><input className="mt-input" value={manualQty} onChange={e=>setManualQty(e.target.value.replace(/[^0-9]/g,""))} placeholder={`Suggested ${fmt(recommended)}`}/></div><div><label className="mt-small">8hr target</label><input className="mt-input" value={eightHr} onChange={e=>setEightHr(e.target.value.replace(/[^0-9]/g,""))}/></div></div><div className="mt-two"><label className="mt-small"><input type="checkbox" checked={changeover} onChange={e=>setChangeover(e.target.checked)}/> Changeover after previous style</label><div><label className="mt-small">Remaining hours after current style completes</label><input className="mt-input" value={remainingHours} onChange={e=>setRemainingHours(e.target.value.replace(/[^0-9.]/g,""))}/></div></div><div className="mt-speed-note">If changeover is checked: target = (8hr target ÷ 8) × remaining run hours × 70%. Current suggested qty: <b>{fmt(recommended)}</b>.</div><button className="mt-btn primary" onClick={addPlan}>Add to {stageLabel(activeDept)} plan</button></div></div></div>
    <div className="mt-section"><h3 className="mt-panel-title">Printable 6-Day Planning Grid</h3><div className="mt-panel-sub">Excel-style printable plan entry. Six days are split 3 on top and 3 below for clean printouts. Applies to Stitching and all other departments; Stitching uses editable line names from Settings.</div><PlanPrintGrid gridRows={gridRows} weekDays={weekDays} activeDept={activeDept} line={line} planRows={planRows} setWeekQty={setWeekQty}/></div>
    <div className="mt-section"><SimpleTable title={`${stageLabel(activeDept)} Plan Rows`} sub="Detailed plan rows remain available for source/risk/changeover notes; daily targets can be edited faster in the 6-day grid above." rows={visiblePlans.map(p=>({ Date:p.plan_date, Dept:stageLabel(p.dept), Line:p.line||"Dept total", Style:p.style_no, Buyer:p.buyer, Source:p.source_label, Source_Type:p.source_type, Plan_Qty:p.planned_qty, Target_8hr:p.eight_hr_target||"—", Changeover:p.changeover?"Yes":"No", Remaining_Hours:p.remaining_hours, Status:p.status, Remarks:p.remarks }))} empty="No plan rows for this department yet." /></div>
    <div className="mt-section"><SimpleTable title="Plan vs Achieved / Style Adherence" sub="Production is not only total qty. If easier styles are produced instead of the planned style, this table exposes style/mix adherence gaps." rows={pva} empty="No plan rows yet." /></div>
    <div className="mt-section"><h3 className="mt-panel-title">Bulk Order / Style Update</h3><div className="mt-panel-sub">Planned workflow: upload/copy order sheet with Order, Style, Buyer, Colour, Component, Size, Qty, Route, Print/Emb toggles, SMV/8hr target. This will update the planning pool and production orders in one go. Full parser comes with the next Supabase import patch.</div><div className="mt-speed-note">For now this screen defines the format and workflow; keep using GitHub/Supabase seed for demo rows until the importer is added.</div></div>
  </div>;
}
function ReviewView({ rows, ledger, planRows }){
  const [section,setSection] = useState("cannotClose");
  const rb = reviewBuckets(rows, ledger, planRows);
  const sectionMap = {
    ready:{ title:"Ready to Close", sub:"Numbers are clean; Production Coordinator should close these department/style balances.", rows:rb.ready },
    cannotClose:{ title:"Cannot Close — Open Balance", sub:"Main daily closure pain list. Department has unexplained/open balance; coordinator follows until explained/closed.", rows:rb.cannotClose },
    reconcile:{ title:"Reconcile Review", sub:"Impossible sequences or total jumps. These are data-integrity blockers, not normal WIP.", rows:rb.reconcile },
    ram:{ title:"Reject / Alter / Missing Review", sub:"Quality/loss/recovery control. Main list is horizontal/summary; reason breakup comes next.", rows:rb.ram },
    risky:{ title:"Backdated / Risky Entry Review", sub:"Entry date is production activity date; created_at is actual entry time. Same-day/old backdated/corrections are reviewed here.", rows:rb.risky },
    planDev:{ title:"Plan Deviation Review", sub:"Catches shortfalls and planned difficult styles being replaced by easier/unplanned output.", rows:rb.planDev },
  };
  const active = sectionMap[section];
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Review — Coordinator Control Room</h3><div className="mt-panel-sub">Review is not normal WIP viewing. It is where the Production Coordinator clears closures, open balances, reconcile, R/A/M, risky entries, and plan deviations after daily entries are done.</div></div><div className="mt-section no-print"><div className="mt-summary-strip">{Object.entries(sectionMap).map(([k,v])=><button key={k} className={`mt-summary-tile ${section===k?"active":""}`} onClick={()=>setSection(k)}><div className="label">{v.title}</div><div className="value">{v.rows.length}</div><div className="mt-small">drill review</div></button>)}</div></div><div className="mt-section"><SimpleTable title={active.title} sub={active.sub} rows={active.rows} empty="Nothing pending in this review section." /></div><div className="mt-section"><span className="mt-chip mt-info">Closing owner: Production Coordinator</span> <span className="mt-chip mt-muted">Department HOD owns work completion</span> <span className="mt-chip mt-muted">Production Manager only WIP escalation / approvals</span></div></div>;
}

function MonthlyComparison({ rows, ledger=[] }){
  const [month,setMonth] = useState(()=>safeJsonLoad(uiStorageKey("monthly_month"), latestActivityDate(ledger).slice(0,7)));
  const [buyer,setBuyer] = useState(()=>safeJsonLoad(uiStorageKey("monthly_buyer"), "All"));
  const [focus,setFocus] = useState(()=>safeJsonLoad(uiStorageKey("monthly_focus"), "all"));
  const [route,setRoute] = useState(()=>safeJsonLoad(uiStorageKey("monthly_route"), "all"));
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_month"), month), [month]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_buyer"), buyer), [buyer]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_focus"), focus), [focus]);
  useEffect(()=>safeJsonSave(uiStorageKey("monthly_route"), route), [route]);
  const [sizeBreak,setSizeBreak] = useState(true);
  const buyers = ["All", ...uniqueList(rows.map(r=>r.buyer))];
  const { start, end, label } = monthRangeFromYm(month);
  const rawPeriodRows = monthlyComparisonRows(rows, ledger, month);
  const baseRows = rawPeriodRows.filter(row => (buyer === "All" || row.Buyer === buyer) && (route === "all" || row.Route === route));
  const summary = {
    styles: baseRows.length,
    stitched: baseRows.reduce((a,row)=>a+n(row.Stitching_Receiving_In_Period),0),
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
    { key:"stitched", label:"Stitching Receiving", value:summary.stitched, note:"only posted in this month" },
    { key:"checked", label:"Checking In Period", value:summary.checked, note:"can include old stitched WIP" },
    { key:"old_wip_checked", label:"Old WIP Checked", value:summary.oldWipChecked, note:"checking done from opening stitched WIP" },
    { key:"old_wip_used", label:"Opening WIP Used", value:summary.oldWipUsed, note:"old WIP processed in later stages" },
    { key:"after_stitch", label:"New Stitch Pending Check", value:summary.afterStitch, note:"period stitch not yet checked" },
    { key:"packed_pending", label:"Month Packed Not Dispatch", value:summary.packedNotDispatch, note:"period packed minus period dispatch" },
    { key:"ram", label:"R/A/M Posted", value:summary.ram, note:"period reject/alter/missing" },
  ];
  const filtered = baseRows.filter(row=>{
    if (focus === "all") return true;
    if (focus === "stitched") return n(row.Stitching_Receiving_In_Period) > 0;
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
    <div className="mt-table-wrap"><table className="mt-table"><thead><tr>{(tableRows[0] ? Object.keys(tableRows[0]) : ["Note"]).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{tableRows.length ? tableRows.map((r,i)=><tr key={i}>{Object.keys(tableRows[0]).map(c=><td key={c}>{typeof r[c] === "number" ? fmt(r[c]) : String(r[c] ?? "")}</td>)}</tr>) : <tr><td style={{padding:18}}>No period activity rows for this filter.</td></tr>}</tbody></table></div>
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

function DetailDrawer({ row, rows, setRows, ledger, setLedger, stageKey, onClose, onOpenRegister }){
  const rs = rowStatus(row);
  const stage = stageKey || rs.stage;
  const st = sdata(row,stage);
  const c = cellBreakup(row,stage);
  const feed = stage === "cutting" ? n(row.order_qty) : stageFeed(row,stage);
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
  return <div className="mt-drawer"><div className="mt-drawer-head"><div><div style={{fontFamily:"'Archivo',sans-serif", fontSize:20, fontWeight:800}}>{stageLabel(stage)} · {row.style_no}</div><div className="mt-sub">{row.order_no} · {row.buyer} · {row.colour} · {row.component}</div></div><button className="mt-btn" onClick={onClose}><X size={16}/></button></div><div className="mt-drawer-body">
    <div className="mt-entry-highlight"><strong>Focused WIP cell: {stageLabel(stage)}</strong><div className="mt-context-strip"><span className="mt-chip mt-info">Selected dept only</span><span className="mt-chip mt-muted">Order {row.order_no}</span><span className="mt-chip mt-muted">{row.colour} · {row.component}</span>{primaryBucket && <span className={`mt-chip ${statusClass(primaryBucket.tone)}`}>{primaryBucket.status}</span>}</div><div className="mt-panel-sub" style={{marginTop:6}}>Only the clicked department's breakup is shown first. Full style/route detail is collapsed below.</div></div>
    <div className="mt-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))", marginBottom:12}}>
      <Kpi label={stage === "cutting" ? "Order Qty" : "Feed to Dept"} value={fmt(feed)} note={stage === "cutting" ? "Cutting base" : "Previous dept issued/accepted"}/>
      <Kpi label="Completed / Output" value={`Good ${fmt(n(st.output))}`} note={<span>Reject {fmt(rejectQty)} · Missing {fmt(missingQty)} · Alter {fmt(alterQty)}<br/>Accounted {fmt(accountedQty)} / {fmt(feed)}</span>} tone={ramQty ? "warn" : "ok"}/>
      <Kpi label="Open / Tail Action" value={fmt(c.open)} note={<span>Work open {fmt(c.open)} · Tail {fmt(tailQty)}<br/>Use R/A/M rows if balance is not production.</span>} tone={c.open || tailQty ? "warn" : "ok"}/>
      <Kpi label="Ready to Issue" value={fmt(readyToIssue)} note="Completed but not moved forward" tone={readyToIssue?"info":"ok"}/>
    </div>
    <div className="mt-section mt-card" style={{marginBottom:12}}><h3 className="mt-panel-title">{stageLabel(stage)} breakup</h3><div className="mt-context-strip"><span className="mt-chip mt-ok">Done {fmt(c.received)}</span><span className="mt-chip mt-warn">Open {fmt(c.open)}</span><span className="mt-chip mt-late">R/A/M {fmt(c.ram)}</span>{c.shortClose ? <span className="mt-chip mt-purple">Short Closed {fmt(c.shortClose)}</span> : null}{c.extra ? <span className="mt-chip mt-purple">Extra/Over {fmt(c.extra)}</span> : null}<span className="mt-chip mt-info">Owner {primaryBucket?.owner || stageOwner(stage)}</span></div>{stage==="cutting" && c.open>0 ? <div style={{marginTop:10}}><button className="mt-btn ghost" onClick={shortCloseCutting}>Short close cutting balance</button><div className="mt-small">Use only when management approves cutting less than order qty. This removes balance from Cutting Pending; it does not add production.</div></div> : null}</div>
    <SizeCumulativeEditor row={row} rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} stage={stage} initialField={c.open ? "output" : readyToIssue ? "issued" : "output"} source="wip_view_cell_day_entry" />
    <div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Open Register to edit this dept history</button><span className="mt-small" style={{marginLeft:8}}>Register opens filtered to this order/style/department; use Correct for audit-safe edits.</span></div>
    {stage!=="cutting" && <details className="mt-fold" open={stage==="stitching"}><summary>Receiving / previous department issue history for {stageLabel(stage)}</summary><div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}><button className="mt-btn ghost" onClick={()=>onOpenRegister?.(row, "all", "all")}><FileSpreadsheet size={14}/>Open Register for full receive trail</button></div><SimpleTable title={`${stageLabel(stage)} receiving history`} sub="Previous department issue / receiving trail, horizontal by date/activity with size columns across. Vertical one-size-per-row is reserved only for raw audit ledgers." rows={receivingRows} empty="No receiving / issue history found in ledger yet." /></details>}
    <details className="mt-fold" open={false}><summary>Complete {stageLabel(stage)} output / issue / R-A-M history</summary><div className="mt-section no-print" style={{paddingLeft:0,paddingRight:0}}><button className="mt-btn ghost" onClick={()=>openRegisterForEdit("all")}><FileSpreadsheet size={14}/>Open Register to correct output / issue / R-A-M</button></div><SimpleTable title={`${stageLabel(stage)} complete output history`} sub="Good output, issue-forward, rejection, missing, alter defect and alter clear entries for this department. Always grouped horizontally by activity/date with sizes across." rows={outputHistoryRows} empty="No output / issue / R-A-M ledger history found for this department yet." /></details>
    <details className="mt-fold"><summary>View {stageLabel(stage)} size breakup</summary><SimpleTable title={`${stageLabel(stage)} size-wise open quantities`} sub="Only the selected/clicked department. Use this to see what is open by size before entering." rows={sizeRows} empty="No size rows." /></details>
    <details className="mt-fold"><summary>View full style detail / route / history</summary><div className="mt-section"><LazyStylePhoto row={row} large/><div className="mt-grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))", marginBottom:12}}><Kpi label="Overall Status" value={rs.status} note={rs.action} tone={rs.tone}/><Kpi label="Overall Owner" value={rs.owner} note={rs.support || "Primary owner"}/><Kpi label="Overall Open Qty" value={fmt(rs.qty)} note={`${rs.idle || 0} days idle`}/></div></div><SimpleTable title="Open buckets for selected department" sub="Owner chase items for this department." rows={buckets.map(b=>({ Status:b.status, Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open bucket for this department." /><div style={{height:12}}/><SimpleTable title="Full current status drilldown" sub="Full status logic across this style/component." rows={statusBreakdown(row).map(b=>({ Status:b.status, Stage:stageLabel(b.stage), Qty:b.qty, Percent:`${bucketPct(row,b)}%`, Owner:b.owner, Support:b.support, Action:b.action, Idle:`${b.idle||0}d` }))} empty="No open status bucket." /></details>
  </div></div>;
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

function PhotoManager({ rows, setRows }){
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

async function fetchRestUpsertToSupabase(table, payloadRows, onConflict){
  const base = supabaseEnvBaseUrl();
  const anon = supabaseEnvAnonKey();
  if (!base || !anon) return { skipped:true, warning:supabaseConfigWarning() };
  let rows = Array.isArray(payloadRows) ? payloadRows : [payloadRows];
  if (!rows.length) return { error:null, via:"rest", savedCount:0 };
  const removed = [];
  const url = `${base}/rest/v1/${encodeURIComponent(table)}?on_conflict=${encodeURIComponent(onConflict)}`;
  for (let attempt=0; attempt<8; attempt++){
    try {
      const res = await fetch(url, {
        method:"POST",
        headers:{
          apikey:anon,
          Authorization:`Bearer ${anon}`,
          "Content-Type":"application/json",
          Prefer:"resolution=merge-duplicates,return=minimal"
        },
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
  return excelValue(raw, [size, `Size ${size}`, `${size} Qty`, `Qty ${size}`, `Order ${size}`, `Order Qty ${size}`]);
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
  if (s.includes("kid")) return "kids";
  if (s.includes("waist") || s.includes("pant") || s.includes("trouser")) return "waist";
  return "alpha";
}
function styleFromExcelRow(raw, existing){
  const order_no = String(excelValue(raw,["Order No","Order","PO","SO","Order Number"]) || existing?.order_no || "").trim().toUpperCase();
  const style_no = String(excelValue(raw,["Style No","Style","Style Number","Style Code"]) || existing?.style_no || "").trim().toUpperCase();
  const buyer = String(excelValue(raw,["Buyer","Brand","Buyer / Brand","Customer"]) || existing?.buyer || "").trim().toUpperCase();
  const colour = String(excelValue(raw,["Colour","Color"]) || existing?.colour || "").trim().toUpperCase();
  const component = String(excelValue(raw,["Component","Garment","Part"]) || existing?.component || "").trim().toUpperCase();
  const oq = excelValue(raw,["Order Qty","Qty","Quantity","Order Quantity"]);
  const sizeSet = excelValue(raw,["Size Set","SizeSet","Sizes"]);
  const sizeSetNorm = sizeSet === "" ? (existing?.size_set || "alpha") : normalizeSizeSetName(sizeSet);
  const orderSizeQty = extractOrderSizeQtyFromExcel(raw, sizeSetNorm, existing);
  const orderSizeTotal = qtyMapTotal(orderSizeQty);
  const line = excelValue(raw,["Planning Line Override","Default Line","Line","Stitching Line"]);
  const printVal = excelValue(raw,["Print Required","Print","Printing"]);
  const embVal = excelValue(raw,["Embroidery Required","Embroidery","Emb"]);
  const photo = excelValue(raw,["Photo URL","Photo","Thumbnail URL","Photo Thumb URL"]);
  const folder = excelValue(raw,["OneDrive Folder URL","Folder URL","Photo Folder URL","OneDrive URL"]);
  return {
    ...(existing || {}),
    order_no, style_no, buyer, colour, component,
    order_qty: oq === "" ? n(existing?.order_qty) : n(oq),
    order_size_qty: orderSizeQty,
    size_set: sizeSetNorm,
    set_id: String(excelValue(raw,["Set ID","Set","SetId"]) || existing?.set_id || "").trim().toUpperCase(),
    line: String(line || existing?.line || "").trim(),
    print_required: printVal === "" ? !!existing?.print_required : parseExcelBool(printVal),
    embroidery_required: embVal === "" ? !!existing?.embroidery_required : parseExcelBool(embVal),
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
function styleTemplateRows(){
  const allSizes = Array.from(new Set(Object.values(getSizeSets()).flat())).slice(0,40);
  const blankSizeCols = Object.fromEntries(allSizes.map(size=>[`Size ${size}`, ""]));
  return [
    { Action:"ADD_UPDATE", "Order No":"SO/25-26/100", "Style No":"STYLE-001", Buyer:"VMM", Colour:"BLACK", Component:"TOP", "Order Qty":1200, "Size Set":"alpha", ...blankSizeCols, "Size XS":100, "Size S":200, "Size M":300, "Size L":300, "Size XL":200, "Size XXL":100, "Set ID":"", "Planning Line Override":"", "Print Required":"No", "Embroidery Required":"No", Priority:"Normal", Difficulty:"Normal", "Photo URL":"", "OneDrive Folder URL":"" },
    { Action:"ADD_UPDATE", "Order No":"SO/25-26/101", "Style No":"KIDS-001", Buyer:"HOPSCOTCH", Colour:"PINK", Component:"TOP", "Order Qty":400, "Size Set":"kids", ...blankSizeCols, "Size 2-3Y":80, "Size 3-4Y":80, "Size 4-5Y":80, "Size 5-6Y":80, "Size 7-8Y":80, "Order Size Breakup":"", "Set ID":"", "Planning Line Override":"", "Print Required":"No", "Embroidery Required":"Yes", Priority:"Normal", Difficulty:"Normal", "Photo URL":"", "OneDrive Folder URL":"" },
    { Action:"HARD_DELETE", "Order No":"SO/25-26/OLD", "Style No":"WRONG-STYLE", Buyer:"", Colour:"BLACK", Component:"TOP", "Order Qty":"", "Size Set":"", ...blankSizeCols, "Order Size Breakup":"", "Set ID":"", "Planning Line Override":"", "Print Required":"", "Embroidery Required":"", Priority:"", Difficulty:"", "Photo URL":"", "OneDrive Folder URL":"" },
  ];
}

function StyleManager({ rows, allRows, setRows, ledger, setLedger }){
  const emptyForm = {
    id:"", order_no:"", style_no:"", buyer:"", colour:"", component:"", order_qty:"", order_size_qty:{}, size_set:"alpha", set_id:"", line:"",
    print_required:false, embroidery_required:false, priority:"Normal", difficulty:"Normal", photo_url:"", photo_folder_url:""
  };
  const [form,setForm] = useState(emptyForm);
  const [q,setQ] = useState("");
  const [msg,setMsg] = useState(null);
  const [busy,setBusy] = useState(false);
  const [bulkMsg,setBulkMsg] = useState(null);
  const [allowHardDelete,setAllowHardDelete] = useState(true);
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
  function edit(row){
    setForm({
      id:row.id || "", order_no:row.order_no || "", style_no:row.style_no || "", buyer:row.buyer || "", colour:row.colour || "", component:row.component || "", order_qty:String(n(row.order_qty)||""),
      order_size_qty:normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row)),
      size_set:row.size_set || "alpha", set_id:row.set_id || "", line:row.line || "",
      print_required:!!row.print_required, embroidery_required:!!row.embroidery_required, priority:row.priority || "Normal", difficulty:row.difficulty || "Normal",
      photo_url:row.photo_url || row.photo_thumb_url || "", photo_folder_url:row.photo_folder_url || ""
    });
    setMsg({ tone:"info", text:`Editing ${row.style_no} · ${row.colour} · ${row.component}` });
    window.scrollTo({ top:0, behavior:"smooth" });
  }
  function reset(){ setForm(emptyForm); setMsg(null); }
  async function save(){
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
      line:String(form.line||"").trim(),
      order_qty:n(form.order_qty),
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
    const prevRow = editing ? (allRows||[]).find(r=>String(r.id)===String(form.id)) : null;
    const duplicate = (allRows||[]).find(r=>styleCompositeKey(r)===styleCompositeKey(clean) && String(r.id)!==String(form.id));
    if (duplicate) { setMsg({ tone:"late", text:"Duplicate Order No + Style No + Colour + Component already exists. Edit that row instead of adding another." }); return; }
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
    const newRow = {
      ...(prevRow || {}),
      ...clean,
      id:editing ? form.id : uid("demo_manual_style"),
      stages: editing ? safeStagesForEditedRow(prevRow, clean) : blankStagesForRoute(clean),
      route:routeFor(clean),
    };
    setBusy(true);
    try {
      setRows(prev=>{
        const exists = prev.some(r=>String(r.id)===String(newRow.id));
        if (exists) return prev.map(r=>String(r.id)===String(newRow.id) ? newRow : r);
        return [newRow, ...prev];
      });
      const { error, skipped, warning, via, recoveredFrom } = await upsertOneStyleToSupabase(newRow);
      if (editing && prevRow && styleCompositeKey(prevRow) !== styleCompositeKey(newRow) && !skipped) {
        await deleteOneStyleFromSupabase(prevRow);
      }
      if (error) setMsg({ tone:"late", text:`Saved in browser, Supabase save failed: ${error.message}` });
      else if (warning) setMsg({ tone:"warn", text:`${editing ? "Updated" : "Added"} ${newRow.style_no} in browser. ${warning}` });
      else setMsg({ tone:variance.diff ? "warn" : "ok", text:`${editing ? "Updated" : "Added"} ${newRow.style_no}. ${variance.diff ? variance.text + " " : ""}${skipped ? "Browser/demo save only." : supabaseSaveLabel({via})}${shortRecoveredSupabaseNote(recoveredFrom)}` });
      if (!editing) setForm(emptyForm);
    } finally { setBusy(false); }
  }
  async function remove(row){
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
      setRows(prev=>prev.filter(r=>String(r.id)!==String(row.id)));
      setLedger?.(prev=>(prev||[]).filter(x=>!ledgerRowMatchesStyle(x,row)));
      setMsg(cleanupWarning ? { tone:"warn", text:`${hasActivity ? "Hard deleted" : "Deleted"} locally/demo. ${cleanupWarning}. If Pull brings it back, delete the Supabase row manually or check table RLS.` } : { tone:"ok", text:`${hasActivity ? "Hard deleted" : "Deleted"} ${row.style_no}. ${isSupabaseConfigured ? "Supabase cleanup completed." : "Local/demo cleanup only."}` });
      if (String(form.id)===String(row.id)) reset();
    } finally { setBusy(false); }
  }
  function downloadTemplate(){
    exportXlsx("production_style_bulk_template.xlsx", [
      { name:"Bulk Update", rows:styleTemplateRows() },
      { name:"Instructions", rows:[
        { Rule:"Action", Detail:"Use ADD_UPDATE to add/update rows. Use HARD_DELETE to remove a style/order/colour/component from demo data." },
        { Rule:"Unique key", Detail:"Order No + Style No + Colour + Component identifies the row." },
        { Rule:"Size Set", Detail:`Allowed: ${Object.keys(getSizeSets()).join(", ")}. Add/edit groups in Settings.` },
        { Rule:"Order size breakup", Detail:"Order Qty is mandatory and remains master. Fill horizontal Size XS / Size S / Size M columns; app warns if size total is less/more than Order Qty." },
        { Rule:"Booleans", Detail:"Print Required / Embroidery Required accept Yes/No, TRUE/FALSE, 1/0." },
        { Rule:"Hard delete", Detail:"For demo cleanup only. Live production should archive/approve instead of hard deleting." },
      ]}
    ]);
  }
  async function bulkUploadExcel(file){
    if (!file) return;
    setBusy(true); setBulkMsg({ tone:"info", text:"Reading Excel bulk update..." });
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type:"array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval:"" });
      if (!rawRows.length) { setBulkMsg({ tone:"late", text:"No rows found in first sheet." }); return; }
      let added=0, updated=0, deleted=0, skipped=0;
      const errors=[];
      const upserts=[];
      const deletes=[];
      let nextRows=[...(allRows||[])];
      for (const [idx,raw] of rawRows.entries()) {
        const rowNo = idx + 2;
        const action = styleExcelAction(raw);
        const keyProbe = styleFromExcelRow(raw, {});
        if (!keyProbe.order_no || !keyProbe.style_no || !keyProbe.colour || !keyProbe.component) { skipped++; errors.push(`Row ${rowNo}: missing Order No / Style No / Colour / Component.`); continue; }
        const existing = nextRows.find(r=>styleCompositeKey(r)===styleCompositeKey(keyProbe));
        if (["DELETE","HARD_DELETE","REMOVE"].includes(action)) {
          if (!existing) { skipped++; errors.push(`Row ${rowNo}: delete target not found.`); continue; }
          nextRows = nextRows.filter(r=>styleCompositeKey(r)!==styleCompositeKey(existing));
          deletes.push(existing); deleted++; continue;
        }
        const clean = styleFromExcelRow(raw, existing);
        if (!clean.buyer || !clean.order_qty) { skipped++; errors.push(`Row ${rowNo}: Buyer and Order Qty are mandatory for add/update.`); continue; }
        const variance = sizeVarianceInfo(clean.order_qty, normalizeSizeQtyMap(clean.order_size_qty || {}, getSizeSets()[clean.size_set] || getSizeSets().alpha || DEFAULT_SIZE_SETS.alpha));
        if (variance.diff !== 0) errors.push(`Row ${rowNo} ${clean.order_no}/${clean.style_no}: ${variance.text}`);
        const merged = {
          ...(existing || {}), ...clean, id:existing?.id || uid("demo_bulk_style"),
          stages: existing ? safeStagesForEditedRow(existing, clean) : blankStagesForRoute(clean),
          route:routeFor(clean),
        };
        if (existing) { nextRows = nextRows.map(r=>styleCompositeKey(r)===styleCompositeKey(existing) ? merged : r); updated++; }
        else { nextRows.unshift(merged); added++; }
        upserts.push(merged);
      }
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
      setBulkMsg({ tone:errors.length ? "warn" : "ok", text:`Bulk update done. Added ${added}, updated ${updated}, hard deleted ${deleted}, skipped ${skipped}.${errors.length ? " Issues: "+errors.slice(0,4).join(" | ")+(errors.length>4?` | +${errors.length-4} more`:"") : ""}` });
    } catch(e) {
      setBulkMsg({ tone:"late", text:e?.message || "Bulk Excel update failed." });
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
        <div className="mt-order-size-card"><div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap", alignItems:"center"}}><div><b>Order Size Breakup</b><div className="mt-small">Order Qty is master. Size entries subtract from it; missing balance is shown instead of changing Order Qty.</div></div><div style={{display:"flex", gap:6, flexWrap:"wrap"}}><span className={`mt-chip ${statusClass(formSizeVariance.tone)}`}>{formSizeVariance.text}</span><span className="mt-chip mt-muted">Size total {fmt(formSizeTotal)} / Order {fmt(form.order_qty)}</span><button className="mt-btn ghost" type="button" onClick={distributeFormOrderQty}>Distribute Order Qty</button><button className="mt-btn ghost" type="button" onClick={clearFormOrderSizes}>Clear Sizes</button></div></div><div className="mt-order-size-row">{formSizes.map(size=><div className="mt-order-size-cell" key={size}><label>{size}</label><input className="mt-cell-input" style={{width:"100%"}} value={formOrderSizeQty[size] || ""} onChange={e=>setOrderSizeQty(size,e.target.value)} placeholder="0" /></div>)}</div><div className="mt-small">Bulk Excel uses the same size columns. Order Qty is mandatory; upload summary warns if size breakup is short/excess.</div></div>
        <div className="mt-two"><div><label className="mt-small">Planning line override</label><select className="mt-select" value={form.line} onChange={e=>setField("line",e.target.value)}><option value="">Not fixed — decide in Planning</option>{productionLineNames().map(l=><option key={l} value={l}>{l}</option>)}</select><div className="mt-small">Stitching line is normally decided later in Planning, not locked in Style Master.</div></div><div><label className="mt-small">Priority</label><select className="mt-select" value={form.priority} onChange={e=>setField("priority",e.target.value)}>{["Low","Normal","High","Urgent"].map(x=><option key={x}>{x}</option>)}</select></div></div>
        <div className="mt-two"><label className="mt-small"><input type="checkbox" checked={!!form.print_required} onChange={e=>setField("print_required",e.target.checked)}/> Print required</label><label className="mt-small"><input type="checkbox" checked={!!form.embroidery_required} onChange={e=>setField("embroidery_required",e.target.checked)}/> Embroidery required</label></div>
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
      </div>
    </div>
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Style List / Edit / Hard Delete</h3><div className="mt-panel-sub">Search, edit, delete unused rows, or hard delete demo rows with activity. For live production, hard delete should be replaced by archive/approval governance.</div></div>
      <div className="mt-section no-print"><div className="mt-toolbar"><Search size={14}/><input className="mt-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search order / style / buyer / colour"/><span className="mt-chip mt-muted">{tableRows.length} rows</span></div></div>
      <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Order</th><th>Buyer</th><th>Colour</th><th>Component</th><th>Qty</th><th>Route</th><th>Activity</th><th>Action</th></tr></thead><tbody>{tableRows.map(row=>{ const hasLedger=(ledger||[]).some(x=>ledgerRowMatchesStyle(x,row)); const hasActivity=styleHasStageActivity(row)||hasLedger; return <tr key={row.id}><td className="mt-sticky"><div className="mt-style-main"><LazyStylePhoto row={row}/><div><b>{row.style_no}</b><div className="mt-small">{row.set_id ? `Set ${row.set_id} · ` : ""}{row.size_set}</div></div></div></td><td>{row.order_no}</td><td>{row.buyer}</td><td>{row.colour}</td><td>{row.component}</td><td><b>{fmt(row.order_qty)}</b><div className="mt-small">{explicitOrderSizeQtyTotal(row) ? sizesFor(row).map(sz=>`${sz} ${fmt(normalizeSizeQtyMap(row.order_size_qty || {}, sizesFor(row))[sz]||0)}`).join(" · ") : <span style={{color:"var(--fg-warn)", fontWeight:800}}>Size breakup missing</span>}</div></td><td>{routeFor(row).map(stageLabel).join(" → ")}</td><td>{hasActivity ? <span className="mt-chip mt-warn">Has activity</span> : <span className="mt-chip mt-ok">Unused</span>}</td><td><button className="mt-btn" onClick={()=>edit(row)}>Edit</button> <button className="mt-btn ghost" disabled={busy} onClick={()=>remove(row)}>{hasActivity ? "Hard Delete" : "Delete"}</button>{hasActivity && <div className="mt-small">Demo cleanup only; removes matching ledger locally.</div>}</td></tr>; })}</tbody></table></div>
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
      <div className="mt-toolbar"><span className="mt-toolbar-label">Allow rejection dispatch</span><label className="mt-chip mt-info" style={{cursor:"pointer"}}><input type="checkbox" checked={dispatchReject} onChange={e=>applyDispatchReject(e.target.checked)} style={{marginRight:6}}/> Rejection can be dispatched after approval</label><span className="mt-small">OFF by default. When ON, pre-dispatch Rejection qty is added to Dispatch feed by size and excluded from the R/A/M dispatch hold. Missing, Alter and Reconcile still block.</span></div>
      <div className="mt-toolbar" style={{alignItems:"flex-start"}}><span className="mt-toolbar-label">Stitching line names</span><textarea className="mt-input" style={{minWidth:260, minHeight:110}} value={linesText} onChange={e=>setLinesText(e.target.value)} placeholder={'STF-1\nSTF-2\nSTF-3'} /><button className="mt-btn primary" onClick={saveLines}>Save Lines</button><span className="mt-small">One line per row, or comma separated. Planning uses this list for line-wise stitching plans.</span></div>
      <div className="mt-toolbar" style={{alignItems:"flex-start"}}><span className="mt-toolbar-label">Size groups</span><textarea className="mt-input" style={{minWidth:360, minHeight:140}} value={sizeSetsText} onChange={e=>setSizeSetsText(e.target.value)} placeholder={'alpha = XS, S, M, L, XL, XXL\nkids = 2-3Y, 3-4Y, 4-5Y\nwaist = 30, 32, 34, 36'} /><div style={{display:"grid",gap:8}}><button className="mt-btn primary" onClick={saveSizeSets}>Save Size Groups</button><button className="mt-btn ghost" onClick={resetSizeSets}>Reset Defaults</button></div><span className="mt-small">Format: group = size, size, size. Add buyer/category groups anytime, then select them in Styles or bulk upload.</span></div>
    </div>
    <div className="mt-section"><h3 className="mt-panel-title">Bottleneck metric guide</h3><div className="mt-panel-sub">Daily Rate = recent 7-day average output from ledger for that department. Days Cover = queue/open WIP ÷ Daily Rate. Bottleneck Score = Queue WIP + 2×Reconcile Qty + R/A/M Qty, so impossible movements and quality loss rank higher than normal queue.</div></div>
    <div className="mt-section"><h3 className="mt-panel-title">ERP / Supabase Reference</h3><div className="mt-panel-sub">Separate app now, future module inside mega ERP. Production owns movement/WIP; Style Master/BOM/Procurement will own master/material truth.</div></div><div className="mt-section mt-two"><div><b>Included through V7.5.23 logic</b><ul className="mt-small"><li>Add/edit production styles manually with horizontal order-size breakup; Order Qty remains master and size shortage/excess is warned in manual and bulk upload.</li><li>Browser fallback persistence keeps style updates after refresh even when Supabase URL/key is not configured correctly.</li><li>Cutting Pending now appears correctly until cut/output/R/A/M/short-close accounts for order qty; Cutting short-close action is available in Cutting detail.</li><li>Editable size groups in Settings; Styles and bulk upload can use custom buyer/category size sets.</li><li>Optional rejection dispatch toggle in Settings: approved rejected pieces can be included in Dispatch feed by size.</li><li>WIP Other Open Split column is now toggleable and hidden by default to avoid duplicate/confusing status reading.</li><li>Simple 6-day Excel-style planning grid: enter total day target by style/line without SMV/OPS complexity</li><li>WIP now separates one Pending Stage from All Activity by Cut %, so the grid stays narrow while still showing the full cut/order breakup</li><li>Selected department detail shows Good Output together with Reject/Missing/Alter and accounted/tail quantities for a complete HOD picture</li><li>Size-wise day entry with previous/updated total cross-check</li><li>Print / embroidery route toggles</li><li>Standard route changed to Checking → Packing → Dispatch; Iron removed as a normal department</li><li>Department cells max 3 numbers</li><li>Cutting over allowed; downstream total jump blocked</li><li>Dispatch hold: no dispatch when reconcile exists or dispatch-blocking R/A/M exceeds configured order %. Optional setting allows approved rejection to be dispatched while Missing/Alter still block.</li><li>Editable stitching line names in Settings used by Planning</li><li>Issued-to-department means accepted/with department; no normal issued-not-received bucket</li><li>Completed-not-issued-forward owner = Production Coordinator + Production Manager</li><li>Individual owner chase: Department HOD owns work-not-completed; Coordinator + Production Manager own completed-not-issued-forward</li><li>Style closure owner = Production Coordinator + Dept HOD; Production Manager handles movement/escalation/approval</li><li>WIP table page-specific filters, sorting, quick status buckets, and size-breakup toggle</li><li>Dashboard uses current-bin WIP logic: once a quantity moves to the next stage, it leaves the previous department bin.</li><li>Dashboard includes daily / 4-4-5 weekly / calendar-month production numbers, department × issue-type board, owner activity breakup, and production meeting focus.</li><li>Department-first dashboard pack: plan-vs-achieved/line efficiency, bottleneck/flow, aging/stuck WIP, quality/loss rate, party/outsource pending.</li><li>Dashboard drilldowns now use dashboard-specific rows, subtotal summaries, real size-stage data where available, and a visible size-source indicator.</li><li>Monthly comparison tab against Stitching Receiving with drillable summary filters</li><li>Printable HOD WIP / horizontal Excel reports</li><li>Style photo support with lazy-loading thumbnails</li><li>Open-first WIP sheet modes: Open Control, Order View, Department View, Issue View, and Full Matrix</li><li>Focused WIP cell drawer shows selected department only; DPR entry shows only open styles for selected department/field; entry cells show open, previous, available, new entry, remaining and updated total; reductions/corrections require approval workflow later</li><li>Entry date / backdated audit logic with next-day default, same-day confirmation, reason and approval status</li><li>Live idle recalculation from production ledger where activity exists</li><li>Set convergence: a set packs/ships only min(components); Sets board + WIP chip show packable sets and unmatched pieces</li><li>Backdated entries validate feed as-of the entry date from the ledger; locked (older) backdated entries require reason + explicit manager-approval confirmation and are stamped in the audit ledger</li><li>Single configurable cutting tolerance replaces the old 8%/5%/0% mismatch</li><li>Party/outsource pending is consistent with the WIP open bucket (feed − output − R/A/M); outsourced stages label the with-department bucket as Pending at party</li><li>R/A/M day-entry path and impossible sequence reconcile checks</li><li>Planning tab: stitching line-wise rolling plan, department day-wise plan, department-specific planning pool, manual future plan, changeover remaining-hours formula, plan-vs-achieved style adherence, and Review control room. Future procurement/stores quantity checks must validate as-of entry date</li><li>Slow-internet rule: tables use thumbnails only; heavy image/detail loads on click</li></ul></div><div><b>Future shared keys</b><ul className="mt-small"><li>style_id / order_id later</li><li>production_file_id from Merch Tracker</li><li>bom_id from Costing/BOM</li><li>order_no, style_no, colour, component, size, set_id</li></ul></div></div><div className="mt-section"><span className="mt-chip mt-info"><Lock size={12}/> Future RLS</span> <span className="mt-small">Keep this as a development app. We tighten RLS before real users and live factory data.</span></div></div>;
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
  const [drawer,setDrawer] = useState(null);
  const [dashboardDrill,setDashboardDrill] = useState(null);
  const [registerFocus,setRegisterFocus] = useState(null);
  const [notice,setNotice] = useState(null);
  const [showUpdatePopup,setShowUpdatePopup] = useState(()=>{
    try { return localStorage.getItem("production_app_seen_version") !== APP_VERSION; } catch { return true; }
  });
  useEffect(()=>{ safeJsonSave(LOCAL_ROWS_KEY, rows); }, [rows]);
  useEffect(()=>{ safeJsonSave(LOCAL_LEDGER_KEY, ledger); }, [ledger]);
  useEffect(()=>{ safeJsonSave(LOCAL_PLAN_KEY, planRows); }, [planRows]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_query"), query), [query]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_buyer"), buyer), [buyer]);
  useEffect(()=>safeJsonSave(uiStorageKey("global_order"), order), [order]);
  useEffect(()=>safeJsonSave(uiStorageKey("clean_mode"), cleanMode), [cleanMode]);
  useEffect(()=>{
    safeJsonSave(uiStorageKey("active_tab"), tab);
    const history = safeJsonLoad(uiStorageKey("tab_history"), []);
    const next = [tab, ...history.filter(x=>x!==tab)].slice(0,8);
    safeJsonSave(uiStorageKey("tab_history"), next);
  }, [tab]);
  const calcRows = useMemo(()=>withLiveIdle(rows, ledger, today()), [rows, ledger]);
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
  function markVersionSeen(){
    try { localStorage.setItem("production_app_seen_version", APP_VERSION); } catch {}
    setShowUpdatePopup(false);
  }
  async function pullSupabase(){
    if(!isSupabaseConfigured || !supabase || !hasValidSupabaseEnv()){ setNotice({tone:"warn", text:supabaseConfigWarning()}); return; }
    const {data,error} = await supabase.from("production_orders").select("*").limit(500).order("created_at",{ascending:false});
    if(error){ setNotice({tone:"late", text:error.message}); return; }
    if(data?.length) setRows(data.map(supabaseToOrder));
    const {data:entryData,error:entryError} = await supabase.from("production_entries").select("*").limit(5000).order("entry_date",{ascending:false});
    if(entryError){ setNotice({tone:"warn", text:`Pulled orders, but entries failed: ${entryError.message}`}); return; }
    setLedger(entryData || []);
    setNotice({tone:"ok", text:`Pulled ${data?.length || 0} production orders and ${entryData?.length || 0} activity entries.`});
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
  const tabs = [
    ["dashboard","Dashboard",BarChart3], ["planning","Planning",ClipboardList], ["wip","Live WIP",Warehouse], ["entry","DPR Entry",ClipboardList], ["register","Register",FileSpreadsheet], ["review","Review",ShieldCheck], ["owners","Who to Chase",Users], ["monthly","Monthly",FileSpreadsheet], ["styles","Styles",Shirt], ["routes","Routes",Filter], ["photos","Photos",ImageIcon], ["reports","Reports",FileSpreadsheet], ["settings","Settings",Settings]
  ];
  return <div className={`mt-app ${cleanMode?"clean-mode":""}`} data-theme="paper" data-settings-tick={settingsTick}><style>{FONT + CSS}</style>{showUpdatePopup && <div className="mt-update-backdrop no-print"><div className="mt-update-popup"><div className="head"><span>Update available</span><span className="mt-chip mt-info">{APP_VERSION}</span></div><div className="body"><div><b>New production app version is loaded.</b></div><div className="mt-small">Cleaner precise screens, remembered active tab/filters/drafts, cumulative totals, horizontal output register, WIP-to-Register edit links, and fixed Register filtering so WIP links show all matching department entries.</div><div className="mt-speed-note"><b>Commit:</b> {APP_COMMIT_MESSAGE}</div></div><div className="actions"><button className="mt-btn ghost" onClick={()=>window.location.reload()}><RefreshCw size={14}/>Refresh now</button><button className="mt-btn primary" onClick={markVersionSeen}><CheckCircle2 size={14}/>Got it</button></div></div></div>}<div className="mt-top"><div className="mt-shell"><div className="mt-header"><div><div className="mt-title">Production DPR & WIP Control <span style={{color:"var(--accent)"}}>{APP_VERSION}</span></div><div className="mt-sub">Live WIP · DPR Entry · Register · Planning · Reports. Precise views, horizontal data, remembered tab/drafts.</div></div><div className="mt-actions"><button className={`mt-btn ${cleanMode?"active":"ghost"}`} onClick={()=>setCleanMode(v=>!v)} title="Clean mode hides helper text and keeps screens precise">Clean mode</button><button className="mt-btn" onClick={pullSupabase}><RefreshCw size={14}/>Pull</button><button className="mt-btn primary" onClick={seedSupabase} title="Manual backup/sync of current browser rows. Normal Add/Edit Style and DPR Entry save to Supabase when you press their Save buttons."><Upload size={14}/>Sync Browser Rows</button><button className="mt-btn" onClick={testSupabaseConnection} title="Checks Supabase read, test save, read-back and verified delete"><ShieldCheck size={14}/>Test Supabase</button><button className="mt-btn" onClick={exportAll}><Download size={14}/>Export</button></div></div><div className="mt-tabs">{tabs.map(([k,label,Icon])=><button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}><Icon size={14}/> {label}</button>)}</div></div></div>
    <div className="mt-shell mt-page">
      {notice && <div className={`mt-card no-print`} style={{marginBottom:12}}><div className="mt-section"><span className={`mt-chip ${statusClass(notice.tone)}`}>{notice.text}</span> <button className="mt-btn ghost" onClick={()=>setNotice(null)} style={{float:"right"}}>Dismiss</button></div></div>}
      <PageFilters tab={tab} query={query} setQuery={setQuery} buyer={buyer} setBuyer={setBuyer} buyers={buyers} order={order} setOrder={setOrder} orders={orders} visibleRows={visibleRows}/>
      <div className="mt-keepalive-note slim no-print"><span className="mt-chip mt-info">Remembered tab/draft</span><span className="mt-small">This browser remembers your last tab and DPR entry draft by user until saved or cleared.</span></div>
      <div className="mt-tab-panel" style={{display:tab==="dashboard"?"block":"none"}} aria-hidden={tab!=="dashboard"}><Dashboard rows={visibleRows} ledger={ledger} onDrill={setDashboardDrill}/></div>
      <div className="mt-tab-panel" style={{display:tab==="planning"?"block":"none"}} aria-hidden={tab!=="planning"}><PlanningView rows={visibleRows} planRows={planRows} setPlanRows={setPlanRows} ledger={ledger}/></div>
      <div className="mt-tab-panel" style={{display:tab==="wip"?"block":"none"}} aria-hidden={tab!=="wip"}><WipStatus rows={visibleRows} onOpen={(row,stage)=>setDrawer({row,stage})}/></div>
      <div className="mt-tab-panel" style={{display:tab==="entry"?"block":"none"}} aria-hidden={tab!=="entry"}><QuickEntry rows={visibleRows} setRows={setRows} ledger={ledger} setLedger={setLedger}/></div>
      <div className="mt-tab-panel" style={{display:tab==="register"?"block":"none"}} aria-hidden={tab!=="register"}><OutputRegisterView rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} focus={registerFocus}/></div>
      <div className="mt-tab-panel" style={{display:tab==="review"?"block":"none"}} aria-hidden={tab!=="review"}><ReviewView rows={visibleRows} ledger={ledger} planRows={planRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="owners"?"block":"none"}} aria-hidden={tab!=="owners"}><WhoToChase rows={visibleRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="monthly"?"block":"none"}} aria-hidden={tab!=="monthly"}><MonthlyComparison rows={visibleRows} ledger={ledger}/></div>
      <div className="mt-tab-panel" style={{display:tab==="styles"?"block":"none"}} aria-hidden={tab!=="styles"}><StyleManager rows={visibleRows} allRows={calcRows} setRows={setRows} ledger={ledger} setLedger={setLedger}/></div>
      <div className="mt-tab-panel" style={{display:tab==="routes"?"block":"none"}} aria-hidden={tab!=="routes"}><ProcessRoutes rows={visibleRows} setRows={setRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="photos"?"block":"none"}} aria-hidden={tab!=="photos"}><PhotoManager rows={visibleRows} setRows={setRows}/></div>
      <div className="mt-tab-panel" style={{display:tab==="reports"?"block":"none"}} aria-hidden={tab!=="reports"}><Reports rows={visibleRows} ledger={ledger}/></div>
      <div className="mt-tab-panel" style={{display:tab==="settings"?"block":"none"}} aria-hidden={tab!=="settings"}><SettingsView onChanged={()=>setSettingsTick(t=>t+1)}/></div>
    </div>
    {drawer && <DetailDrawer row={drawer.row} rows={rows} setRows={setRows} ledger={ledger} setLedger={setLedger} stageKey={drawer.stage} onClose={()=>setDrawer(null)} onOpenRegister={openRegisterFromWip}/>} 
    {dashboardDrill && <DashboardDrillDrawer drill={dashboardDrill} rows={visibleRows} ledger={ledger} onClose={()=>setDashboardDrill(null)}/>} 
  </div>;
}
