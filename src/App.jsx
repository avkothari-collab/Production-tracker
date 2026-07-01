import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Factory,
  FileSpreadsheet,
  Filter,
  Gauge,
  Layers,
  Lock,
  PackageCheck,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  Truck,
  Upload,
  Warehouse,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`;
const THEME_CSS = `
:root, [data-theme="paper"] {
  --ink:#1f1f1d; --bg:#f7f3ea; --surface:#fffdf8; --accent:#c96f16; --accent-tint:#fff4e3;
  --danger:#b42318; --success:#1f6f54; --info:#2563a6;
  --muted-1:#9b9488; --muted-2:#7d766b; --muted-3:#655f56; --muted-4:#4f493f; --muted-5:#403a32; --muted-6:#c8c0b4; --muted-7:#b8afa3;
  --line-1:#e5ded2; --line-2:#d4cabd; --line-3:#eee7dc;
  --toolbar-bg:#fffaf1; --toolbar-line:#e3d7c7; --toolbar-subtle:#f1eadf;
  --pill-shadow:0 1px 0 rgba(31,31,29,0.06); --card-shadow:0 1px 2px rgba(31,31,29,0.04);
  --on-dark:#d8d1c4; --on-dark-2:#a9a095; --on-dark-line:#4a463e;
  --tint-ok:#e5f1ea; --fg-ok:#1c6048; --tint-warn:#f8e9b7; --fg-warn:#7a560f; --tint-late:#f6d3cb; --fg-late:#8c241a;
  --revised:#6a45a8;
}
html, body, #root { margin:0; min-height:100%; background:var(--bg); color:var(--ink); }
* { box-sizing:border-box; }
button, input, select, textarea { font-family:inherit; }
button { min-height:34px; min-width:34px; touch-action:manipulation; }
.mt-app { font-family:'JetBrains Mono', monospace; min-height:100vh; background:var(--bg); }
.mt-top { background:var(--ink); color:var(--bg); border-bottom:1px solid var(--ink); }
.mt-shell { max-width:1480px; margin:0 auto; }
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
.mt-panel-title { font-family:'Archivo',sans-serif; font-weight:800; font-size:15px; margin:0; }
.mt-panel-sub { font-size:10.5px; color:var(--muted-2); margin-top:3px; line-height:1.45; }
.mt-toolbar { display:flex; align-items:center; gap:7px; flex-wrap:wrap; background:var(--toolbar-bg); border:1px solid var(--toolbar-line); border-radius:8px; padding:7px 9px; }
.mt-toolbar-label { font-size:9px; font-weight:800; color:var(--muted-2); text-transform:uppercase; letter-spacing:.4px; }
.mt-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid var(--ink); background:var(--surface); color:var(--ink); padding:6px 10px; font-size:11px; font-weight:800; cursor:pointer; }
.mt-btn.primary { background:var(--accent); }
.mt-btn.dark { background:var(--ink); color:var(--bg); }
.mt-btn.ghost { border-color:var(--line-2); color:var(--muted-3); }
.mt-input, .mt-select { border:1px solid var(--ink); background:var(--surface); color:var(--ink); padding:7px 9px; font-size:11px; min-height:34px; outline:none; }
.mt-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
.mt-kpi { padding:14px; border:1px solid var(--line-2); background:var(--surface); border-radius:14px; }
.mt-kpi .label { font-size:9.5px; color:var(--muted-2); text-transform:uppercase; letter-spacing:.45px; font-weight:800; }
.mt-kpi .value { margin-top:6px; font-family:'Archivo',sans-serif; font-size:25px; font-weight:800; line-height:1; }
.mt-kpi .note { margin-top:6px; font-size:10px; color:var(--muted-3); line-height:1.35; }
.mt-table-wrap { overflow:auto; border:1px solid var(--ink); background:var(--surface); }
table.mt-table { width:100%; border-collapse:separate; border-spacing:0; min-width:1060px; }
.mt-table th { position:sticky; top:0; z-index:2; background:var(--ink); color:var(--bg); border-right:1px solid var(--on-dark-line); border-bottom:1px solid var(--ink); padding:9px 8px; font-size:10px; text-align:left; font-weight:800; white-space:nowrap; }
.mt-table td { border-right:1px solid var(--line-3); border-bottom:1px solid var(--line-3); padding:8px; vertical-align:top; font-size:11px; background:var(--surface); }
.mt-table tr:hover td { background:#fffaf1; }
.mt-sticky { position:sticky; left:0; z-index:1; box-shadow:1px 0 0 var(--line-2); }
.mt-table th.mt-sticky { z-index:3; background:var(--ink); }
.mt-chip { display:inline-flex; align-items:center; gap:4px; border:1px solid rgba(31,31,29,.1); border-radius:999px; padding:3px 8px; font-size:9.5px; font-weight:800; white-space:nowrap; box-shadow:var(--pill-shadow); }
.mt-ok { background:var(--tint-ok); color:var(--fg-ok); }
.mt-warn { background:var(--tint-warn); color:var(--fg-warn); }
.mt-late { background:var(--tint-late); color:var(--fg-late); }
.mt-info { background:#e8f0fb; color:#174a7c; }
.mt-muted { background:#efefea; color:var(--muted-4); }
.mt-orange { background:#fff0df; color:#94440f; }
.mt-drawer { position:fixed; right:0; top:0; bottom:0; width:min(720px, 94vw); background:var(--surface); border-left:1px solid var(--ink); box-shadow:-8px 0 30px rgba(31,31,29,.18); z-index:80; display:flex; flex-direction:column; }
.mt-drawer-head { background:var(--ink); color:var(--bg); padding:16px; display:flex; justify-content:space-between; gap:12px; }
.mt-drawer-body { padding:16px; overflow:auto; }
.mt-progress { height:7px; border-radius:999px; background:var(--line-3); overflow:hidden; }
.mt-progress > span { display:block; height:100%; background:var(--accent); }
.mt-section { padding:14px; }
.mt-section + .mt-section { border-top:1px solid var(--line-3); }
.mt-two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.mt-small { font-size:10px; color:var(--muted-2); }
.mt-cell-input { width:100%; min-width:70px; border:1px solid var(--line-2); background:#fff; padding:6px; font-size:11px; text-align:right; }
.mt-cell-input:focus { outline:2px solid var(--accent-tint); border-color:var(--accent); }
@media (max-width:920px){ .mt-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .mt-two{grid-template-columns:1fr;} }
@media (max-width:620px){ .mt-grid{grid-template-columns:1fr;} .mt-page{padding:14px 12px 28px;} .mt-header{padding:15px 12px 10px;} .mt-tabs{padding-left:12px; padding-right:12px;} }
`;

const STAGES = [
  { key: "cutting", label: "Cutting", short: "Cut", owner: "Cutting HOD" },
  { key: "printing", label: "Printing / Emb", short: "Print", owner: "Printing HOD" },
  { key: "stitching", label: "Stitching", short: "Stitch", owner: "Stitching HOD" },
  { key: "checking", label: "Checking", short: "Check", owner: "Checking HOD" },
  { key: "iron", label: "Iron", short: "Iron", owner: "Finishing HOD" },
  { key: "packing", label: "Packing", short: "Pack", owner: "Packing HOD" },
  { key: "dispatch", label: "Dispatch", short: "Disp", owner: "Dispatch" },
];
const STAGE_KEYS = STAGES.map((s) => s.key);
const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));

const SIZE_SETS = {
  alpha: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y"],
  waist: ["30", "32", "34", "36", "38"],
};

const demoRows = [
  { id:"r1", style_no:"FREEDOM JAMAICA BARM", buyer:"FREEDOM", order_no:"SO/25-26/94", colour:"BLACK", component:"BARMUDA", order_qty:3360, size_set:"alpha", set_id:"", line:"STF-5", idle_by_stage:{stitching:5, checking:5, iron:2, packing:2}, party:{}, qty:{cutting:3360, printing:3360, stitching:1324, checking:3652, iron:2832, packing:2832, dispatch:0}, reject:{}, alter:{}, missing:{} },
  { id:"r2", style_no:"FREEDOM JAMAICA BARM", buyer:"FREEDOM", order_no:"SO/25-26/94", colour:"NAVY", component:"BARMUDA", order_qty:4980, size_set:"alpha", set_id:"", line:"STF-4", idle_by_stage:{stitching:4, checking:4, iron:2, packing:2}, party:{}, qty:{cutting:4980, printing:4980, stitching:3774, checking:5992, iron:4257, packing:4257, dispatch:0}, reject:{}, alter:{}, missing:{} },
  { id:"r3", style_no:"UBER WOMENS TROUSER 5595", buyer:"UBER", order_no:"SO/25-26/75", colour:"GREY", component:"TROUSER", order_qty:1300, size_set:"waist", set_id:"", line:"STF-6", idle_by_stage:{checking:1, packing:1}, party:{}, qty:{cutting:1300, printing:1300, stitching:1300, checking:1271, iron:1271, packing:1271, dispatch:0}, reject:{checking:29}, alter:{}, missing:{} },
  { id:"r4", style_no:"COMFY TEES", buyer:"COMFY TEES", order_no:"SO/25-26/85", colour:"OLIVE", component:"TEE", order_qty:403, size_set:"alpha", set_id:"", line:"STF-1", idle_by_stage:{packing:3}, party:{iron:"Maa Tara Ironing"}, qty:{cutting:403, printing:403, stitching:403, checking:341, iron:321, packing:321, dispatch:0}, reject:{}, alter:{}, missing:{} },
  { id:"r5", style_no:"COMFY TEES", buyer:"COMFY TEES", order_no:"SO/25-26/85", colour:"MINT", component:"TEE", order_qty:351, size_set:"alpha", set_id:"", line:"STF-1", idle_by_stage:{stitching:9}, party:{}, qty:{cutting:351, printing:351, stitching:0, checking:0, iron:0, packing:0, dispatch:0}, reject:{}, alter:{}, missing:{} },
  { id:"r6", style_no:"S-651 C1", buyer:"EXPORT", order_no:"SO/25-26/93", colour:"TOP", component:"TOP", order_qty:648, size_set:"alpha", set_id:"S651C1", line:"STF-3", idle_by_stage:{printing:3, stitching:3, packing:2}, party:{printing:"Sagar Print House"}, qty:{cutting:662, printing:639, stitching:635, checking:611, iron:611, packing:611, dispatch:0}, reject:{printing:23}, alter:{}, missing:{} },
  { id:"r7", style_no:"S-651 C1", buyer:"EXPORT", order_no:"SO/25-26/93", colour:"BOTTOM", component:"BOTTOM", order_qty:648, size_set:"alpha", set_id:"S651C1", line:"STF-3", idle_by_stage:{printing:3, packing:2}, party:{printing:"Sagar Print House"}, qty:{cutting:662, printing:655, stitching:652, checking:647, iron:658, packing:658, dispatch:0}, reject:{printing:7}, alter:{}, missing:{} },
  { id:"r8", style_no:"BASKS005MT", buyer:"EASYBUY", order_no:"SO/25-26/89", colour:"BLACK", component:"TEE", order_qty:5000, size_set:"alpha", set_id:"", line:"STF-3", idle_by_stage:{cutting:1, stitching:1, checking:2}, party:{}, qty:{cutting:4592, printing:4592, stitching:4584, checking:4514, iron:4514, packing:4514, dispatch:0}, reject:{checking:70}, alter:{}, missing:{} },
  { id:"r9", style_no:"SS26_LEOPARD", buyer:"VMM", order_no:"SO/25-26/79", colour:"WHITE", component:"TOP", order_qty:5940, size_set:"kids", set_id:"", line:"STF-2", idle_by_stage:{packing:0}, party:{packing:"Verma Packing Co"}, qty:{cutting:6981, printing:6981, stitching:6951, checking:6900, iron:6900, packing:6900, dispatch:0}, reject:{checking:51}, alter:{}, missing:{} },
  { id:"r10", style_no:"SS26IB5675", buyer:"HOPSCOTCH", order_no:"SO/25-26/78", colour:"SUNSHINE", component:"TOP", order_qty:400, size_set:"kids", set_id:"", line:"STF-4", idle_by_stage:{stitching:2, packing:2}, party:{}, qty:{cutting:416, printing:416, stitching:409, checking:409, iron:408, packing:408, dispatch:0}, reject:{}, alter:{}, missing:{} },
];

const initialEntryRows = [
  { temp_id:"e1", entry_date: todayIso(), dept:"stitching", entry_type:"good_output", order_no:"SO/25-26/94", style_no:"FREEDOM JAMAICA BARM", colour:"BLACK", component:"BARMUDA", size:"M", good_qty:"", reject_qty:"", alter_qty:"", missing_qty:"", line:"STF-5", party:"", remarks:"" },
  { temp_id:"e2", entry_date: todayIso(), dept:"checking", entry_type:"receive", order_no:"SO/25-26/85", style_no:"COMFY TEES", colour:"MINT", component:"TEE", size:"L", good_qty:"", reject_qty:"", alter_qty:"", missing_qty:"", line:"STF-1", party:"", remarks:"" },
];

function todayIso(){ return new Date().toISOString().slice(0,10); }
function n(v){ const x = Number(v || 0); return Number.isFinite(x) ? x : 0; }
function fmt(v){ return n(v).toLocaleString("en-IN"); }
function pct(a,b){ return b > 0 ? Math.round((a*100)/b) : 0; }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`; }
function safeText(v){ return String(v ?? "").trim(); }
function normalizeStageQty(row, key){ return n(row.qty?.[key]); }
function stageIndex(key){ return STAGE_KEYS.indexOf(key); }

function transitions(row){
  return STAGE_KEYS.slice(1).map((toKey) => {
    const idx = stageIndex(toKey);
    const fromKey = STAGE_KEYS[idx-1];
    const fromQty = normalizeStageQty(row, fromKey);
    const toQty = normalizeStageQty(row, toKey);
    const diff = fromQty - toQty;
    const toStage = STAGE_BY_KEY[toKey];
    const fromStage = STAGE_BY_KEY[fromKey];
    const idle = n(row.idle_by_stage?.[toKey]);
    const party = row.party?.[toKey] || row.party?.[fromKey] || "";
    return {
      fromKey, toKey,
      fromLabel: fromStage.label,
      toLabel: toStage.label,
      fromShort: fromStage.short,
      toShort: toStage.short,
      fromQty, toQty, diff,
      pending: diff > 0 ? diff : 0,
      reconcile: diff < 0 ? Math.abs(diff) : 0,
      idle,
      party,
    };
  });
}

function rowSignals(row){
  const ts = transitions(row);
  const rec = ts.find(t => t.reconcile > 0);
  const activePending = [...ts].sort((a,b) => (b.pending*b.idle) - (a.pending*a.idle) || b.pending-a.pending)[0];
  const packed = normalizeStageQty(row,"packing");
  const dispatched = normalizeStageQty(row,"dispatch");
  const done = dispatched >= row.order_qty || packed >= row.order_qty;
  if(rec){
    return {
      status:"Reconcile",
      tone:"late",
      current_dept:rec.toLabel,
      qty_stuck:rec.reconcile,
      idle_days:rec.idle,
      owner:STAGE_BY_KEY[rec.toKey].owner,
      next_action:`Fix ${rec.fromShort} → ${rec.toShort}: received ${fmt(rec.reconcile)} more than fed`,
      reason:`${rec.toLabel} over-received`,
    };
  }
  const partyHit = ts.find(t => t.party && (t.pending > 0 || normalizeStageQty(row,t.toKey)>0));
  if(activePending && activePending.pending > 0){
    const stale = activePending.idle >= 7;
    return {
      status: stale ? "Stalled" : (partyHit ? "With Party" : "Open WIP"),
      tone: stale ? "warn" : (partyHit ? "orange" : "info"),
      current_dept: activePending.toLabel,
      qty_stuck: activePending.pending,
      idle_days: activePending.idle,
      owner:STAGE_BY_KEY[activePending.toKey].owner,
      next_action:`Move/receive ${fmt(activePending.pending)} into ${activePending.toLabel}`,
      reason: activePending.party ? `With ${activePending.party}` : `${activePending.fromShort} done, ${activePending.toShort} pending`,
    };
  }
  if(done){
    return { status:"Closed", tone:"ok", current_dept:"Dispatch / Pack", qty_stuck:0, idle_days:0, owner:"Production Head", next_action:"Verify dispatch closure", reason:"Order quantity covered" };
  }
  return { status:"Running", tone:"muted", current_dept:"Production", qty_stuck:0, idle_days:0, owner:"Production Head", next_action:"Continue DPR entries", reason:"No major blocker" };
}

function deptInventory(rows){
  const acc = Object.fromEntries(STAGE_KEYS.map(k => [k,{ key:k, label:STAGE_BY_KEY[k].label, qty:0, styles:0, oldest:0, reconcile:0 }]));
  rows.forEach(row => {
    transitions(row).forEach(t => {
      if(t.pending > 0){
        acc[t.toKey].qty += t.pending;
        acc[t.toKey].styles += 1;
        acc[t.toKey].oldest = Math.max(acc[t.toKey].oldest, t.idle || 0);
      }
      if(t.reconcile > 0){
        acc[t.toKey].reconcile += t.reconcile;
        acc[t.toKey].oldest = Math.max(acc[t.toKey].oldest, t.idle || 0);
      }
    });
  });
  return Object.values(acc);
}

function makeSizeSplit(row){
  const sizes = SIZE_SETS[row.size_set] || SIZE_SETS.alpha;
  const weights = sizes.map((_,i)=> i===0||i===sizes.length-1 ? 1 : 2);
  const totalW = weights.reduce((a,b)=>a+b,0);
  return sizes.map((size,idx)=>{
    const out = { size };
    STAGE_KEYS.forEach((key)=>{
      const total = normalizeStageQty(row,key);
      out[key] = idx === sizes.length-1
        ? total - sizes.slice(0,-1).reduce((sum,_,j)=> sum + Math.round(total*weights[j]/totalW),0)
        : Math.round(total*weights[idx]/totalW);
    });
    return out;
  });
}

function statusClass(tone){
  return tone === "late" ? "mt-late" : tone === "warn" ? "mt-warn" : tone === "ok" ? "mt-ok" : tone === "orange" ? "mt-orange" : tone === "info" ? "mt-info" : "mt-muted";
}

function exportXlsx(filename, sheets){
  const wb = XLSX.utils.book_new();
  sheets.forEach(({name, rows}) => {
    const ws = XLSX.utils.json_to_sheet(rows && rows.length ? rows : [{ Note:"No rows" }]);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31));
  });
  XLSX.writeFile(wb, filename);
}

function supabaseRowToUi(row){
  return {
    id: row.id,
    style_no: row.style_no,
    buyer: row.buyer || row.brand || "",
    order_no: row.order_no,
    colour: row.colour || row.color || "",
    component: row.component || "",
    order_qty: n(row.order_qty),
    size_set: row.size_set || "alpha",
    set_id: row.set_id || "",
    line: row.default_line || "",
    idle_by_stage: row.idle_by_stage || {},
    party: row.party_by_stage || {},
    qty: row.stage_qty || {},
    reject: row.reject_qty || {},
    alter: row.alter_qty || {},
    missing: row.missing_qty || {},
  };
}

function uiRowToSupabase(row){
  return {
    id: String(row.id).startsWith("r") ? undefined : row.id,
    order_no: row.order_no,
    style_no: row.style_no,
    buyer: row.buyer,
    brand: row.buyer,
    colour: row.colour,
    component: row.component,
    set_id: row.set_id || null,
    order_qty: n(row.order_qty),
    size_set: row.size_set || "alpha",
    default_line: row.line || null,
    stage_qty: row.qty || {},
    idle_by_stage: row.idle_by_stage || {},
    party_by_stage: row.party || {},
    reject_qty: row.reject || {},
    alter_qty: row.alter || {},
    missing_qty: row.missing || {},
  };
}

export default function App(){
  const [tab,setTab] = useState("dashboard");
  const [rows,setRows] = useState(demoRows);
  const [ledger,setLedger] = useState([]);
  const [query,setQuery] = useState("");
  const [buyer,setBuyer] = useState("All");
  const [selected,setSelected] = useState(null);
  const [entryRows,setEntryRows] = useState(initialEntryRows);
  const [notice,setNotice] = useState(null);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    if(!isSupabaseConfigured || !supabase) return;
    loadSupabase();
  },[]);

  async function loadSupabase(){
    setLoading(true);
    const { data, error } = await supabase.from("production_orders").select("*").order("created_at",{ascending:false}).limit(500);
    const { data: led } = await supabase.from("production_entries").select("*").order("entry_date",{ascending:false}).limit(200);
    setLoading(false);
    if(error){ setNotice({tone:"late", text:`Supabase read error: ${error.message}`}); return; }
    if(data && data.length) setRows(data.map(supabaseRowToUi));
    if(led) setLedger(led);
  }

  async function seedSupabase(){
    if(!isSupabaseConfigured || !supabase){ setNotice({tone:"warn", text:"Add Supabase URL + anon key first. Until then this runs in local demo mode."}); return; }
    setLoading(true);
    const payload = rows.map(uiRowToSupabase);
    const { error } = await supabase.from("production_orders").upsert(payload, { onConflict:"order_no,style_no,colour,component" });
    setLoading(false);
    if(error) setNotice({tone:"late", text:`Seed failed: ${error.message}`});
    else { setNotice({tone:"ok", text:"Demo production orders saved to Supabase."}); loadSupabase(); }
  }

  const buyers = useMemo(()=>["All", ...Array.from(new Set(rows.map(r=>r.buyer).filter(Boolean))).sort()], [rows]);
  const filtered = useMemo(()=> rows.filter(r => {
    const q = query.toLowerCase().trim();
    const okQ = !q || [r.style_no,r.order_no,r.buyer,r.colour,r.component,r.line].some(v => String(v||"").toLowerCase().includes(q));
    const okB = buyer === "All" || r.buyer === buyer;
    return okQ && okB;
  }), [rows,query,buyer]);
  const stats = useMemo(()=>{
    const signals = filtered.map(rowSignals);
    const totalOrder = filtered.reduce((a,r)=>a+n(r.order_qty),0);
    const totalPacked = filtered.reduce((a,r)=>a+normalizeStageQty(r,"packing"),0);
    const totalDispatch = filtered.reduce((a,r)=>a+normalizeStageQty(r,"dispatch"),0);
    const recQty = signals.filter(s=>s.status==="Reconcile").reduce((a,s)=>a+s.qty_stuck,0);
    const idleQty = signals.filter(s=>s.status!=="Reconcile").reduce((a,s)=>a+s.qty_stuck,0);
    const oldest = Math.max(0, ...signals.map(s=>s.idle_days));
    return { totalOrder,totalPacked,totalDispatch,recQty,idleQty,oldest, styles:filtered.length, reconcileStyles:signals.filter(s=>s.status==="Reconcile").length };
  },[filtered]);
  const inv = useMemo(()=>deptInventory(filtered),[filtered]);
  const reconcileRows = useMemo(()=>filtered.flatMap(row => transitions(row).filter(t=>t.reconcile>0).map(t=>({
    id:`${row.id}-${t.toKey}`,
    Style: row.style_no, Order: row.order_no, Buyer: row.buyer, Colour: row.colour, Component: row.component,
    Problem: `${t.toLabel} received more than ${t.fromLabel} fed`, Department:t.toLabel, Fed:t.fromQty, Received:t.toQty, Difference:t.reconcile, Idle:t.idle,
    Action:`Correct wrong entry / missing ${t.fromShort} output / wrong component posting`,
  }))),[filtered]);
  const issuedRows = useMemo(()=>filtered.flatMap(row => transitions(row).filter(t=>t.pending>0).map(t=>({
    id:`${row.id}-${t.toKey}`,
    Style: row.style_no, Order: row.order_no, Buyer: row.buyer, Colour: row.colour, Component: row.component,
    Flow:`${t.fromShort} → ${t.toShort}`, IssuedOrFed:t.fromQty, Received:t.toQty, Pending:t.pending, Idle:t.idle,
    Party:t.party || "", Owner:STAGE_BY_KEY[t.toKey].owner,
  }))),[filtered]);

  function updateEntryCell(id,key,value){
    setEntryRows(prev => prev.map(r => r.temp_id === id ? {...r, [key]: value} : r));
  }
  function addEntryRow(){
    setEntryRows(prev => [...prev, { temp_id:uid("tmp"), entry_date:todayIso(), dept:"cutting", entry_type:"good_output", order_no:"", style_no:"", colour:"", component:"", size:"", good_qty:"", reject_qty:"", alter_qty:"", missing_qty:"", line:"", party:"", remarks:"" }]);
  }
  async function postEntryRows(){
    const ready = entryRows.filter(r => n(r.good_qty)+n(r.reject_qty)+n(r.alter_qty)+n(r.missing_qty) > 0 && r.style_no && r.order_no);
    if(!ready.length){ setNotice({tone:"warn", text:"Enter at least one row with order/style and quantity."}); return; }
    const payload = ready.map(r => ({
      entry_date:r.entry_date || todayIso(), dept:r.dept, stage:r.dept, entry_type:r.entry_type,
      order_no:r.order_no, style_no:r.style_no, colour:r.colour, component:r.component, size:r.size,
      good_qty:n(r.good_qty), reject_qty:n(r.reject_qty), alter_qty:n(r.alter_qty), missing_qty:n(r.missing_qty),
      qty:n(r.good_qty)+n(r.reject_qty)+n(r.alter_qty)+n(r.missing_qty), line_no:r.line || null, party_name:r.party || null,
      remarks:r.remarks || null,
    }));
    setLedger(prev => [...payload.map(p=>({...p,id:uid("local")})), ...prev]);
    if(isSupabaseConfigured && supabase){
      const { error } = await supabase.from("production_entries").insert(payload);
      if(error){ setNotice({tone:"late", text:`Entries saved locally, Supabase insert failed: ${error.message}`}); return; }
    }
    setNotice({tone:"ok", text:`Posted ${payload.length} DPR row(s). This is a ledger entry; WIP summary update rules will be hardened after final Excel mapping.`});
    setEntryRows(initialEntryRows.map(r=>({...r, temp_id:uid("e")})));
  }
  function doExport(){
    exportXlsx("production_dpr_wip_control_export.xlsx", [
      { name:"WIP Status", rows: filtered.map(r => ({ Style:r.style_no, Order:r.order_no, Buyer:r.buyer, Colour:r.colour, Component:r.component, ...rowSignals(r), OrderQty:r.order_qty, Cut:normalizeStageQty(r,"cutting"), Print:normalizeStageQty(r,"printing"), Stitch:normalizeStageQty(r,"stitching"), Check:normalizeStageQty(r,"checking"), Iron:normalizeStageQty(r,"iron"), Pack:normalizeStageQty(r,"packing"), Dispatch:normalizeStageQty(r,"dispatch") })) },
      { name:"Issued Not Received", rows: issuedRows },
      { name:"Reconcile Center", rows: reconcileRows },
      { name:"Department Aging", rows: inv },
      { name:"Ledger", rows: ledger },
    ]);
  }

  return <div className="mt-app" data-theme="paper">
    <style>{FONT + THEME_CSS}</style>
    <div className="mt-top">
      <div className="mt-shell">
        <div className="mt-header">
          <div>
            <div className="mt-title">Production DPR & WIP Control <span style={{color:"var(--accent)", fontWeight:500}}>· ERP-ready</span></div>
            <div className="mt-sub">Separate Vercel app now, same UI language as Merch Tracker. Supabase-ledger ready for future mega ERP integration.</div>
          </div>
          <div className="mt-actions">
            <span className={`mt-chip ${isSupabaseConfigured ? "mt-ok" : "mt-warn"}`}><ShieldCheck size={13}/>{isSupabaseConfigured ? "Supabase connected" : "Local demo mode"}</span>
            <button className="mt-btn" onClick={loadSupabase} disabled={!isSupabaseConfigured || loading}><RefreshCw size={14}/>{loading?"Loading":"Pull"}</button>
            <button className="mt-btn primary" onClick={seedSupabase}><Upload size={14}/>Seed Supabase</button>
            <button className="mt-btn" onClick={doExport}><Download size={14}/>Export</button>
          </div>
        </div>
        <div className="mt-tabs">
          {[
            ["dashboard","Dashboard",BarChart3], ["wip","Live WIP",Warehouse], ["dpr","DPR Entry",ClipboardList], ["issued","Issued / Not Received",ArrowRight],
            ["reconcile","Reconcile",AlertTriangle], ["aging","Dept Aging",Gauge], ["closure","Closure",PackageCheck], ["reports","Reports",FileSpreadsheet], ["settings","Settings",Settings],
          ].map(([k,l,I]) => <button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}><I size={13} style={{verticalAlign:"-2px", marginRight:6}}/>{l}</button>)}
        </div>
      </div>
    </div>
    <main className="mt-shell mt-page">
      {notice && <div className="mt-card" style={{padding:10, marginBottom:12, display:"flex", justifyContent:"space-between", gap:8, alignItems:"center"}}>
        <span className={`mt-chip ${statusClass(notice.tone)}`}>{notice.text}</span><button className="mt-btn ghost" onClick={()=>setNotice(null)}><X size={13}/></button>
      </div>}
      <Filters query={query} setQuery={setQuery} buyer={buyer} setBuyer={setBuyer} buyers={buyers} />
      {tab==="dashboard" && <Dashboard stats={stats} inv={inv} rows={filtered} setTab={setTab} />}
      {tab==="wip" && <WipTable rows={filtered} onSelect={setSelected} />}
      {tab==="dpr" && <DprEntry entryRows={entryRows} updateEntryCell={updateEntryCell} addEntryRow={addEntryRow} postEntryRows={postEntryRows} rows={rows} />}
      {tab==="issued" && <SimpleTable title="Issued / Fed but Not Received" sub="Basic ERP reading: previous dept cumulative/fed qty minus next dept received/output qty. Later this becomes true issue-vs-receive challan ledger." rows={issuedRows} empty="No pending movement in current slice." />}
      {tab==="reconcile" && <SimpleTable title="Reconcile Center" sub="Impossible quantity breaks. Downstream status should not be trusted until these are corrected or manager-adjusted." rows={reconcileRows} empty="No reconcile blockers in current slice." />}
      {tab==="aging" && <DepartmentAging inv={inv} rows={filtered} />}
      {tab==="closure" && <ClosureControl rows={filtered} onSelect={setSelected} />}
      {tab==="reports" && <Reports rows={filtered} ledger={ledger} issuedRows={issuedRows} reconcileRows={reconcileRows} />}
      {tab==="settings" && <SettingsView />}
    </main>
    {selected && <StyleDrawer row={selected} onClose={()=>setSelected(null)} />}
  </div>;
}

function Filters({query,setQuery,buyer,setBuyer,buyers}){
  return <div className="mt-card" style={{padding:12, marginBottom:12}}>
    <div className="mt-toolbar">
      <span className="mt-toolbar-label"><Filter size={12} style={{verticalAlign:"-2px"}}/> Slice</span>
      <span style={{display:"inline-flex", alignItems:"center", gap:6, border:"1px solid var(--ink)", background:"var(--surface)", padding:"0 8px"}}><Search size={13}/><input className="mt-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search style / order / buyer / line" style={{border:"none", paddingLeft:0, width:270}}/></span>
      <select className="mt-select" value={buyer} onChange={e=>setBuyer(e.target.value)}>{buyers.map(b=><option key={b}>{b}</option>)}</select>
      <span className="mt-small">Same slice idea as Merch Tracker: every dashboard/report below follows this visible slice.</span>
    </div>
  </div>;
}

function Dashboard({stats,inv,rows,setTab}){
  const hot = rows.map(r=>({row:r, s:rowSignals(r)})).sort((a,b)=>(b.s.qty_stuck*b.s.idle_days)-(a.s.qty_stuck*a.s.idle_days)).slice(0,6);
  return <>
    <div className="mt-grid" style={{marginBottom:12}}>
      <Kpi label="Active Styles" value={stats.styles} note="current filtered slice" />
      <Kpi label="Packed Qty" value={fmt(stats.totalPacked)} note={`${pct(stats.totalPacked,stats.totalOrder)}% vs order qty`} />
      <Kpi label="Open WIP Qty" value={fmt(stats.idleQty)} note="pending between departments" tone="info" />
      <Kpi label="Reconcile Blockers" value={fmt(stats.recQty)} note={`${stats.reconcileStyles} style/component rows`} tone="late" />
    </div>
    <div className="mt-two">
      <div className="mt-card">
        <div className="mt-section" style={{display:"flex", justifyContent:"space-between", gap:12}}><div><h3 className="mt-panel-title">Department Load & Aging</h3><div className="mt-panel-sub">Where quantity is lying now. Oldest idle first should become the morning chase list.</div></div><button className="mt-btn" onClick={()=>setTab("aging")}>Open</button></div>
        <div className="mt-section" style={{paddingTop:0}}>{inv.filter(x=>x.qty||x.reconcile).map(d=><div key={d.key} style={{marginBottom:10}}><div style={{display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:800}}><span>{d.label}</span><span>{fmt(d.qty)} WIP · {fmt(d.reconcile)} rec · {d.oldest}d</span></div><div className="mt-progress"><span style={{width:`${Math.min(100,pct(d.qty+d.reconcile, Math.max(1, inv.reduce((a,x)=>a+x.qty+x.reconcile,0))))}%`}}/></div></div>)}</div>
      </div>
      <div className="mt-card">
        <div className="mt-section"><h3 className="mt-panel-title">Top Styles to Chase</h3><div className="mt-panel-sub">Priority = quantity stuck × idle days, with reconcile above normal WIP.</div></div>
        <div className="mt-section" style={{paddingTop:0}}>{hot.map(({row,s})=><div key={row.id} style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8, padding:"8px 0", borderBottom:"1px solid var(--line-3)"}}><div><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.colour} · {s.current_dept}</div></div><span className={`mt-chip ${statusClass(s.tone)}`}>{s.status} · {fmt(s.qty_stuck)} · {s.idle_days}d</span></div>)}</div>
      </div>
    </div>
  </>;
}
function Kpi({label,value,note,tone}){ return <div className="mt-kpi"><div className="label">{label}</div><div className="value" style={{color:tone==="late"?"var(--danger)":tone==="info"?"var(--info)":"var(--ink)"}}>{value}</div><div className="note">{note}</div></div>; }

function WipTable({rows,onSelect}){
  return <div className="mt-card">
    <div className="mt-section" style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap"}}><div><h3 className="mt-panel-title">Live WIP Status</h3><div className="mt-panel-sub">Clean main view. Click a row for department breakup, size breakup, issue/receive, rejection/alter and closure status.</div></div><span className="mt-small">Main table stays readable; ERP details move into row drawer.</span></div>
    <div className="mt-table-wrap">
      <table className="mt-table">
        <thead><tr><th className="mt-sticky" style={{minWidth:280}}>Style / Order</th><th>Status</th><th>Current Dept</th><th>Qty Stuck</th><th>Idle</th><th>Owner</th><th>Next Action</th><th>Cut</th><th>Print</th><th>Stitch</th><th>Check</th><th>Iron</th><th>Pack</th><th>Dispatch</th></tr></thead>
        <tbody>{rows.map(row=>{ const s=rowSignals(row); return <tr key={row.id} onClick={()=>onSelect(row)} style={{cursor:"pointer"}}><td className="mt-sticky"><b>{row.style_no}</b><div className="mt-small">{row.order_no} · {row.buyer} · {row.colour} · {row.component}{row.set_id?` · set ${row.set_id}`:""}</div></td><td><span className={`mt-chip ${statusClass(s.tone)}`}>{s.status}</span></td><td><b>{s.current_dept}</b><div className="mt-small">{s.reason}</div></td><td style={{fontWeight:800}}>{s.qty_stuck ? fmt(s.qty_stuck) : "—"}</td><td>{s.idle_days ? <span className={`mt-chip ${s.idle_days>=7?"mt-warn":"mt-muted"}`}>{s.idle_days}d</span> : "—"}</td><td>{s.owner}</td><td style={{maxWidth:310}}>{s.next_action}</td>{STAGE_KEYS.map(k=><td key={k} style={{textAlign:"right", fontWeight:k==="packing"?800:600}}>{fmt(normalizeStageQty(row,k))}</td>)}</tr>;})}</tbody>
      </table>
    </div>
  </div>;
}

function DprEntry({entryRows,updateEntryCell,addEntryRow,postEntryRows,rows}){
  const styleOptions = rows.map(r=>`${r.order_no} | ${r.style_no} | ${r.colour} | ${r.component}`);
  return <div className="mt-card">
    <div className="mt-section" style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap"}}>
      <div><h3 className="mt-panel-title">Daily DPR Entry</h3><div className="mt-panel-sub">Excel-like entry grid. One coordinator can enter end-of-day numbers; later this posts into production_entries ledger and updates WIP snapshots.</div></div>
      <div className="mt-actions"><button className="mt-btn" onClick={addEntryRow}><Plus size={14}/>Add row</button><button className="mt-btn primary" onClick={postEntryRows}><ClipboardList size={14}/>Post DPR Rows</button></div>
    </div>
    <div className="mt-table-wrap">
      <table className="mt-table" style={{minWidth:1360}}>
        <thead><tr>{["Date","Dept","Type","Order","Style","Colour","Component","Size","Good","Reject","Alter","Missing","Line","Party","Remarks"].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{entryRows.map(r=><tr key={r.temp_id}>
          <td><input className="mt-cell-input" type="date" value={r.entry_date} onChange={e=>updateEntryCell(r.temp_id,"entry_date",e.target.value)} style={{textAlign:"left", minWidth:130}}/></td>
          <td><select className="mt-cell-input" value={r.dept} onChange={e=>updateEntryCell(r.temp_id,"dept",e.target.value)}>{STAGE_KEYS.map(k=><option key={k} value={k}>{STAGE_BY_KEY[k].short}</option>)}</select></td>
          <td><select className="mt-cell-input" value={r.entry_type} onChange={e=>updateEntryCell(r.temp_id,"entry_type",e.target.value)} style={{minWidth:130}}>{["plan","issue","receive","good_output","reject","alter_issue","alter_receive","missing","adjustment"].map(x=><option key={x}>{x}</option>)}</select></td>
          <td><input list="prod-style-options" className="mt-cell-input" value={r.order_no} onChange={e=>updateEntryCell(r.temp_id,"order_no",e.target.value)} style={{textAlign:"left", minWidth:140}}/></td>
          <td><input className="mt-cell-input" value={r.style_no} onChange={e=>updateEntryCell(r.temp_id,"style_no",e.target.value)} style={{textAlign:"left", minWidth:220}}/></td>
          <td><input className="mt-cell-input" value={r.colour} onChange={e=>updateEntryCell(r.temp_id,"colour",e.target.value)} style={{textAlign:"left"}}/></td>
          <td><input className="mt-cell-input" value={r.component} onChange={e=>updateEntryCell(r.temp_id,"component",e.target.value)} style={{textAlign:"left"}}/></td>
          <td><input className="mt-cell-input" value={r.size} onChange={e=>updateEntryCell(r.temp_id,"size",e.target.value)} style={{textAlign:"left"}}/></td>
          {[["good_qty","Good"],["reject_qty","Reject"],["alter_qty","Alter"],["missing_qty","Missing"]].map(([k])=><td key={k}><input className="mt-cell-input" value={r[k]} onChange={e=>updateEntryCell(r.temp_id,k,e.target.value.replace(/[^0-9]/g,""))}/></td>)}
          <td><input className="mt-cell-input" value={r.line} onChange={e=>updateEntryCell(r.temp_id,"line",e.target.value)} style={{textAlign:"left"}}/></td>
          <td><input className="mt-cell-input" value={r.party} onChange={e=>updateEntryCell(r.temp_id,"party",e.target.value)} style={{textAlign:"left", minWidth:160}}/></td>
          <td><input className="mt-cell-input" value={r.remarks} onChange={e=>updateEntryCell(r.temp_id,"remarks",e.target.value)} style={{textAlign:"left", minWidth:220}}/></td>
        </tr>)}</tbody>
      </table>
      <datalist id="prod-style-options">{styleOptions.map(x=><option key={x} value={x}/>)}</datalist>
    </div>
    <div className="mt-section"><span className="mt-chip mt-info">Next build</span> <span className="mt-small">size columns can be generated from Style Master; current grid keeps one size per line for clean Supabase ledger posting.</span></div>
  </div>;
}

function SimpleTable({title,sub,rows,empty}){
  const cols = rows.length ? Object.keys(rows[0]).filter(k=>k!=="id") : [];
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">{title}</h3><div className="mt-panel-sub">{sub}</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={r.id||i}>{cols.map(c=><td key={c}>{typeof r[c]==="number"?fmt(r[c]):String(r[c]??"")}</td>)}</tr>):<tr><td style={{padding:18}}>{empty}</td></tr>}</tbody></table></div></div>;
}

function DepartmentAging({inv,rows}){
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Department Inventory & Aging</h3><div className="mt-panel-sub">Department ownership screen: WIP lying, oldest idle and reconcile load. This will become HOD default view.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Department</th><th>Qty Lying</th><th>Reconcile Qty</th><th>Open Styles</th><th>Oldest Idle</th><th>Owner</th><th>Reading</th></tr></thead><tbody>{inv.map(d=><tr key={d.key}><td><b>{d.label}</b></td><td>{fmt(d.qty)}</td><td>{d.reconcile?<span className="mt-chip mt-late">{fmt(d.reconcile)}</span>:"—"}</td><td>{d.styles}</td><td>{d.oldest?`${d.oldest}d`:"—"}</td><td>{STAGE_BY_KEY[d.key].owner}</td><td>{d.reconcile?"Fix reconciliation before closure":d.qty?"Chase pending WIP / receive entry":"No major open WIP"}</td></tr>)}</tbody></table></div><div className="mt-section"><h3 className="mt-panel-title">Department-wise Style Breakup</h3><div className="mt-panel-sub">Open rows below are generated from current slice.</div>{STAGE_KEYS.map(k=>{ const list=rows.map(r=>({r,s:rowSignals(r)})).filter(x=>x.s.current_dept===STAGE_BY_KEY[k].label); if(!list.length) return null; return <div key={k} style={{marginTop:12}}><b>{STAGE_BY_KEY[k].label}</b>{list.map(({r,s})=><div key={r.id} style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid var(--line-3)", padding:"6px 0", gap:10}}><span>{r.style_no} · {r.colour}</span><span>{fmt(s.qty_stuck)} · {s.idle_days}d · {s.status}</span></div>)}</div>;})}</div></div>;
}

function ClosureControl({rows,onSelect}){
  const items = rows.map(r=>({r,s:rowSignals(r), transitions:transitions(r)})).sort((a,b)=> (a.s.status==="Reconcile"?-1:1) - (b.s.status==="Reconcile"?-1:1) || b.s.qty_stuck-a.s.qty_stuck);
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Closure Control</h3><div className="mt-panel-sub">Prevents styles lying open across departments. Department close should require WIP, reject, alter, missing and material issue balance to be explained.</div></div><div className="mt-table-wrap"><table className="mt-table"><thead><tr><th className="mt-sticky">Style</th><th>Suggested Closure Status</th><th>Open Dept</th><th>Balance</th><th>Blocker</th><th>Action</th></tr></thead><tbody>{items.map(({r,s})=><tr key={r.id}><td className="mt-sticky"><b>{r.style_no}</b><div className="mt-small">{r.order_no} · {r.colour} · {r.component}</div></td><td><span className={`mt-chip ${statusClass(s.tone)}`}>{s.status==="Closed"?"Verified Closed":s.status==="Reconcile"?"Needs Reconcile":"Pending Closure"}</span></td><td>{s.current_dept}</td><td>{s.qty_stuck?fmt(s.qty_stuck):"—"}</td><td>{s.reason}</td><td><button className="mt-btn" onClick={()=>onSelect(r)}>Review closure</button></td></tr>)}</tbody></table></div></div>;
}

function Reports({rows,ledger,issuedRows,reconcileRows}){
  return <div className="mt-two"><div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Management Reports</h3><div className="mt-panel-sub">Summary/detail export follows the same thinking as Merch Tracker reports.</div></div><div className="mt-section"><button className="mt-btn primary" onClick={()=>exportXlsx("production_management_report.xlsx",[{name:"Summary", rows:[{ActiveStyles:rows.length, IssuedNotReceived:issuedRows.reduce((a,x)=>a+n(x.Pending),0), Reconcile:reconcileRows.reduce((a,x)=>a+n(x.Difference),0), LedgerRows:ledger.length}]},{name:"WIP Detail", rows:rows.map(r=>({Style:r.style_no,Order:r.order_no,Buyer:r.buyer,Colour:r.colour,Component:r.component,...rowSignals(r)}))},{name:"Issued Detail",rows:issuedRows},{name:"Reconcile Detail",rows:reconcileRows},{name:"Ledger",rows:ledger}])}><Download size={14}/>Export Management Report</button></div></div><div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Monthly Comparison View</h3><div className="mt-panel-sub">Will reproduce your JUNE RECEIVING / monthly stitched-out comparison: what stitched this month and where it is now.</div></div><div className="mt-section"><span className="mt-chip mt-warn">Pending final Excel mapping</span><p className="mt-small">Once we load the full production master into Supabase, this report will filter by receiving/stitching date and show current department, packed qty, dispatch qty and balance after stitching.</p></div></div></div>;
}

function SettingsView(){
  return <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">ERP / Supabase Reference</h3><div className="mt-panel-sub">This app is separate now but designed to plug into the mega ERP later.</div></div><div className="mt-section"><div className="mt-two"><div><b>Shared future keys</b><ul className="mt-small"><li>style_id / order_id later</li><li>order_no</li><li>style_no</li><li>buyer / brand</li><li>colour</li><li>component</li><li>set_id</li><li>size</li><li>production_file_id</li><li>bom_id</li></ul></div><div><b>Access areas</b><ul className="mt-small"><li>production.view</li><li>production.entry</li><li>production.hod_closure</li><li>production.adjustment_approval</li><li>production.reports</li><li>management.full_access</li></ul></div></div></div><div className="mt-section"><span className="mt-chip mt-info"><Lock size={12}/> Future RLS</span> <span className="mt-small">Current SQL opens authenticated CRUD for development. Later we tighten per department and approval role.</span></div></div>;
}

function StyleDrawer({row,onClose}){
  const s = rowSignals(row);
  const ts = transitions(row);
  const sizes = makeSizeSplit(row);
  return <div className="mt-drawer"><div className="mt-drawer-head"><div><div style={{fontFamily:"'Archivo',sans-serif", fontSize:20, fontWeight:800}}>{row.style_no}</div><div className="mt-sub">{row.order_no} · {row.buyer} · {row.colour} · {row.component} {row.set_id?`· set ${row.set_id}`:""}</div></div><button className="mt-btn" onClick={onClose}><X size={16}/></button></div><div className="mt-drawer-body">
    <div className="mt-grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))", marginBottom:12}}><Kpi label="Status" value={s.status} note={s.reason} tone={s.tone}/><Kpi label="Current Dept" value={s.current_dept} note={s.owner}/><Kpi label="Qty / Idle" value={s.qty_stuck?fmt(s.qty_stuck):"—"} note={s.idle_days?`${s.idle_days} days idle`:"no idle"}/></div>
    <div className="mt-card" style={{marginBottom:12}}><div className="mt-section"><h3 className="mt-panel-title">Department Breakup</h3><div className="mt-panel-sub">This is the detailed panel; not the main grid.</div></div><div className="mt-table-wrap" style={{borderLeft:0,borderRight:0}}><table className="mt-table" style={{minWidth:760}}><thead><tr><th>Flow</th><th>Fed / Previous</th><th>Received / Current</th><th>Reading</th><th>Idle</th><th>Party</th></tr></thead><tbody>{ts.map(t=><tr key={t.toKey}><td><b>{t.fromShort} → {t.toShort}</b></td><td>{fmt(t.fromQty)}</td><td>{fmt(t.toQty)}</td><td>{t.reconcile?<span className="mt-chip mt-late">Reconcile +{fmt(t.reconcile)}</span>:t.pending?<span className="mt-chip mt-warn">{fmt(t.pending)} pending</span>:<span className="mt-chip mt-ok">Balanced</span>}</td><td>{t.idle?`${t.idle}d`:"—"}</td><td>{t.party||"—"}</td></tr>)}</tbody></table></div></div>
    <div className="mt-card" style={{marginBottom:12}}><div className="mt-section"><h3 className="mt-panel-title">Size Breakup Placeholder</h3><div className="mt-panel-sub">Current Excel does not have true size-wise WIP everywhere; this shows the future shape. Real app will use production_order_sizes + size-wise ledger.</div></div><div className="mt-table-wrap" style={{borderLeft:0,borderRight:0}}><table className="mt-table" style={{minWidth:760}}><thead><tr><th>Size</th>{STAGE_KEYS.map(k=><th key={k}>{STAGE_BY_KEY[k].short}</th>)}</tr></thead><tbody>{sizes.map(r=><tr key={r.size}><td><b>{r.size}</b></td>{STAGE_KEYS.map(k=><td key={k} style={{textAlign:"right"}}>{fmt(r[k])}</td>)}</tr>)}</tbody></table></div></div>
    <div className="mt-card"><div className="mt-section"><h3 className="mt-panel-title">Reject / Alter / Missing</h3><div className="mt-panel-sub">Later this becomes recovery ledger with source dept, responsible dept, issue and receive.</div></div><div className="mt-section" style={{display:"flex", gap:8, flexWrap:"wrap"}}>{STAGE_KEYS.map(k=>{ const total=n(row.reject?.[k])+n(row.alter?.[k])+n(row.missing?.[k]); if(!total) return null; return <span key={k} className="mt-chip mt-late">{STAGE_BY_KEY[k].short}: rej {fmt(row.reject?.[k])} · alt {fmt(row.alter?.[k])} · miss {fmt(row.missing?.[k])}</span>;})}<span className="mt-small">No extra loss rows beyond current sample where blank.</span></div></div>
  </div></div>;
}
