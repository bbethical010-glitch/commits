import { useState, useMemo, useCallback, useEffect } from "react";

// ============================================================
// MASTER DATA
// ============================================================
const GROUPS = [
  { id: 'g1', name: 'Capital Account', nature: 'liability' },
  { id: 'g2', name: 'Loans (Liability)', nature: 'liability' },
  { id: 'g3', name: 'Sundry Creditors', nature: 'liability' },
  { id: 'g4', name: 'Current Liabilities', nature: 'liability' },
  { id: 'g5', name: 'Fixed Assets', nature: 'asset' },
  { id: 'g6', name: 'Current Assets', nature: 'asset' },
  { id: 'g7', name: 'Sundry Debtors', nature: 'asset' },
  { id: 'g8', name: 'Bank Accounts', nature: 'asset' },
  { id: 'g9', name: 'Cash-in-Hand', nature: 'asset' },
  { id: 'g10', name: 'Sales Account', nature: 'income' },
  { id: 'g11', name: 'Purchase Account', nature: 'expense' },
  { id: 'g12', name: 'Direct Expenses', nature: 'expense' },
  { id: 'g13', name: 'Indirect Expenses', nature: 'expense' },
  { id: 'g14', name: 'Indirect Income', nature: 'income' },
  { id: 'g15', name: 'Duties & Taxes', nature: 'liability' },
];

const DEFAULT_LEDGERS = [
  { id: 'l1', name: 'Capital A/c', groupId: 'g1', ob: 2000000, obType: 'Cr' },
  { id: 'l2', name: 'Bank of India', groupId: 'g8', ob: 850000, obType: 'Dr' },
  { id: 'l3', name: 'Cash', groupId: 'g9', ob: 125000, obType: 'Dr' },
  { id: 'l4', name: 'Sales', groupId: 'g10', ob: 0, obType: 'Cr' },
  { id: 'l5', name: 'Purchase', groupId: 'g11', ob: 0, obType: 'Dr' },
  { id: 'l6', name: 'Akash Components Ltd.', groupId: 'g7', ob: 0, obType: 'Dr' },
  { id: 'l7', name: 'Sigma Raw Materials', groupId: 'g3', ob: 0, obType: 'Cr' },
  { id: 'l8', name: 'Ravi Logistics', groupId: 'g13', ob: 0, obType: 'Dr' },
  { id: 'l9', name: 'BlueStar Electronics', groupId: 'g7', ob: 0, obType: 'Dr' },
  { id: 'l10', name: 'Plant & Machinery', groupId: 'g5', ob: 1200000, obType: 'Dr' },
  { id: 'l11', name: 'Depreciation', groupId: 'g12', ob: 0, obType: 'Dr' },
  { id: 'l12', name: 'CGST Payable', groupId: 'g15', ob: 0, obType: 'Cr' },
  { id: 'l13', name: 'SGST Payable', groupId: 'g15', ob: 0, obType: 'Cr' },
  { id: 'l14', name: 'IGST Payable', groupId: 'g15', ob: 0, obType: 'Cr' },
  { id: 'l15', name: 'Salary Expenses', groupId: 'g13', ob: 0, obType: 'Dr' },
  { id: 'l16', name: 'Rent Expenses', groupId: 'g13', ob: 0, obType: 'Dr' },
  { id: 'l17', name: 'GenX Industrial', groupId: 'g7', ob: 0, obType: 'Dr' },
  { id: 'l18', name: 'Loan from HDFC', groupId: 'g2', ob: 500000, obType: 'Cr' },
  { id: 'l19', name: 'Interest Received', groupId: 'g14', ob: 0, obType: 'Cr' },
  { id: 'l20', name: 'Furniture & Fixtures', groupId: 'g5', ob: 180000, obType: 'Dr' },
];

const DEFAULT_VOUCHERS = [
  {
    id: 'v1', date: '2025-11-28', type: 'Sales', no: 'SI/2025-26/0892', narration: 'Supply of Copper Fittings per PO#4421', party: 'l6',
    entries: [{ ledgerId: 'l6', type: 'Dr', amount: 348000 }, { ledgerId: 'l4', type: 'Cr', amount: 295000 }, { ledgerId: 'l12', type: 'Cr', amount: 26550 }, { ledgerId: 'l13', type: 'Cr', amount: 26450 }],
    items: [{ id: 'i1', name: 'Copper Fittings Grade A', hsn: '7412', qty: 100, rate: 2950, gstRate: 18, taxable: 295000, gstAmt: 53100, total: 348100 }], gstAmount: 53100, totalAmount: 348000
  },
  {
    id: 'v2', date: '2025-11-27', type: 'Payment', no: 'PV/2025-26/0341', narration: 'Freight charges — Oct batch', party: 'l8',
    entries: [{ ledgerId: 'l8', type: 'Dr', amount: 68250 }, { ledgerId: 'l2', type: 'Cr', amount: 68250 }], items: [], gstAmount: 0, totalAmount: 68250
  },
  {
    id: 'v3', date: '2025-11-26', type: 'Purchase', no: 'PI/2025-26/0204', narration: 'Raw aluminium ingots 2.4MT', party: 'l7',
    entries: [{ ledgerId: 'l5', type: 'Dr', amount: 185000 }, { ledgerId: 'l14', type: 'Dr', amount: 33300 }, { ledgerId: 'l7', type: 'Cr', amount: 218300 }],
    items: [{ id: 'i2', name: 'Aluminium Ingots', hsn: '7601', qty: 2400, rate: 77.08, gstRate: 18, taxable: 185000, gstAmt: 33300, total: 218300 }], gstAmount: 33300, totalAmount: 218300
  },
  {
    id: 'v4', date: '2025-11-25', type: 'Journal', no: 'JV/2025-26/0055', narration: 'Monthly depreciation entry Nov 25',
    entries: [{ ledgerId: 'l11', type: 'Dr', amount: 32400 }, { ledgerId: 'l10', type: 'Cr', amount: 32400 }], items: [], gstAmount: 0, totalAmount: 32400
  },
  {
    id: 'v5', date: '2025-11-24', type: 'Receipt', no: 'RC/2025-26/0108', narration: 'Advance payment — Q4 order', party: 'l9',
    entries: [{ ledgerId: 'l2', type: 'Dr', amount: 500000 }, { ledgerId: 'l9', type: 'Cr', amount: 500000 }], items: [], gstAmount: 0, totalAmount: 500000
  },
  {
    id: 'v6', date: '2025-11-23', type: 'Sales', no: 'SI/2025-26/0891', narration: 'Stainless fittings — Inv GEN-221', party: 'l17',
    entries: [{ ledgerId: 'l17', type: 'Dr', amount: 182900 }, { ledgerId: 'l4', type: 'Cr', amount: 155000 }, { ledgerId: 'l12', type: 'Cr', amount: 13950 }, { ledgerId: 'l13', type: 'Cr', amount: 13950 }],
    items: [{ id: 'i3', name: 'SS Fittings 316L', hsn: '7307', qty: 50, rate: 3100, gstRate: 18, taxable: 155000, gstAmt: 27900, total: 182900 }], gstAmount: 27900, totalAmount: 182900
  },
  {
    id: 'v7', date: '2025-11-20', type: 'Payment', no: 'PV/2025-26/0340', narration: 'Salary payment for November 2025',
    entries: [{ ledgerId: 'l15', type: 'Dr', amount: 250000 }, { ledgerId: 'l2', type: 'Cr', amount: 250000 }], items: [], gstAmount: 0, totalAmount: 250000
  },
  {
    id: 'v8', date: '2025-11-15', type: 'Payment', no: 'PV/2025-26/0339', narration: 'Rent for November 2025',
    entries: [{ ledgerId: 'l16', type: 'Dr', amount: 45000 }, { ledgerId: 'l2', type: 'Cr', amount: 45000 }], items: [], gstAmount: 0, totalAmount: 45000
  },
  {
    id: 'v9', date: '2025-11-10', type: 'Receipt', no: 'RC/2025-26/0107', narration: 'Full payment received for Inv SI-0882', party: 'l6',
    entries: [{ ledgerId: 'l2', type: 'Dr', amount: 125000 }, { ledgerId: 'l6', type: 'Cr', amount: 125000 }], items: [], gstAmount: 0, totalAmount: 125000
  },
  {
    id: 'v10', date: '2025-11-05', type: 'Contra', no: 'CT/2025-26/0012', narration: 'Cash withdrawn from bank for petty cash',
    entries: [{ ledgerId: 'l3', type: 'Dr', amount: 20000 }, { ledgerId: 'l2', type: 'Cr', amount: 20000 }], items: [], gstAmount: 0, totalAmount: 20000
  },
];

const DEFAULT_STOCK = [
  { id: 's1', name: 'Copper Fittings Grade A', unit: 'PCS', rate: 2950, qty: 450, hsn: '7412', gstRate: 18, group: 'Finished Goods' },
  { id: 's2', name: 'SS Fittings 316L', unit: 'PCS', rate: 3100, qty: 220, hsn: '7307', gstRate: 18, group: 'Finished Goods' },
  { id: 's3', name: 'Aluminium Ingots', unit: 'KG', rate: 77.08, qty: 2400, hsn: '7601', gstRate: 18, group: 'Raw Materials' },
  { id: 's4', name: 'Brass Nipples', unit: 'PCS', rate: 185, qty: 1500, hsn: '7412', gstRate: 12, group: 'Finished Goods' },
  { id: 's5', name: 'PVC Pipes 4"', unit: 'MTR', rate: 320, qty: 800, hsn: '3917', gstRate: 12, group: 'Raw Materials' },
];

const DEMO_USERS = [
  { id: 'u1', name: 'Rahul Agarwal', email: 'admin@meridian.com', password: 'admin123', role: 'Admin', company: 'Meridian Exports Pvt. Ltd.' },
  { id: 'u2', name: 'Priya Sharma', email: 'accounts@meridian.com', password: 'acc2025', role: 'Accountant', company: 'Meridian Exports Pvt. Ltd.' },
  { id: 'u3', name: 'Demo User', email: 'demo@ledgeros.com', password: 'demo', role: 'Viewer', company: 'Demo Company' },
];

// ============================================================
// HELPERS
// ============================================================
const fmt = n => '₹' + (Math.abs(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = n => (Math.abs(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };
const uid = () => 'x' + Math.random().toString(36).substr(2, 8);
const todayStr = () => new Date().toISOString().split('T')[0];
const VTYPES = ['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra'];
const VPFX = { Sales: 'SI', Purchase: 'PI', Receipt: 'RC', Payment: 'PV', Journal: 'JV', Contra: 'CT' };
const VTAG = { Sales: 'tag-s', Purchase: 'tag-p', Payment: 'tag-pay', Receipt: 'tag-r', Journal: 'tag-j', Contra: 'tag-c' };

// ============================================================
// CSS
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0f14;--sf:#13161e;--sf2:#1a1e2a;--sf3:#1f2435;
  --bd:#252a38;--bd2:#2e3448;
  --ac:#00e5a0;--ac2:#0099ff;--warn:#ff6b35;
  --tx:#e8ecf4;--tx2:#8892a4;--tx3:#4f5a6e;
  --gr:#00c97a;--rd:#ff4d6d;--yl:#ffd166;
  --mono:'IBM Plex Mono',monospace;--sans:'IBM Plex Sans',sans-serif;
}
body{background:var(--bg);color:var(--tx);font-family:var(--sans);font-size:13px;min-height:100vh}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:2px}

/* ===== LOGIN ===== */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
.login-bg{position:absolute;inset:0;pointer-events:none}
.login-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,160,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.04) 1px,transparent 1px);background-size:40px 40px}
.login-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,160,.06) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%)}
.login-card{position:relative;width:420px;background:var(--sf);border:1px solid var(--bd2);border-radius:14px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.5);animation:loginIn .4s ease}
@keyframes loginIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.login-top{padding:28px 30px 24px;border-bottom:1px solid var(--bd)}
.login-logo{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.login-icon{width:36px;height:36px;background:var(--ac);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:15px;font-weight:700;color:#000;clip-path:polygon(0 0,85% 0,100% 15%,100% 100%,0 100%)}
.login-brand{font-family:var(--mono);font-size:20px;font-weight:600}
.login-brand span{color:var(--ac)}
.login-tagline{font-size:12px;color:var(--tx3);margin-top:2px}
.login-title{font-size:18px;font-weight:600;margin-bottom:4px}
.login-sub{font-size:12px;color:var(--tx3)}
.login-body{padding:24px 30px 28px}
.login-err{background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.25);color:var(--rd);font-size:12px;padding:9px 12px;border-radius:6px;margin-bottom:14px}
.login-hint{background:rgba(0,229,160,.06);border:1px solid rgba(0,229,160,.15);color:var(--tx2);font-size:11px;padding:9px 12px;border-radius:6px;margin-bottom:16px;font-family:var(--mono)}
.login-hint b{color:var(--ac)}
.lbtn{width:100%;padding:11px;background:var(--ac);color:#000;border:none;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px}
.lbtn:hover{background:#00ffb2;transform:translateY(-1px)}
.lbtn:active{transform:none}
.login-divider{text-align:center;font-size:11px;color:var(--tx3);margin:16px 0;position:relative}
.login-divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:var(--bd)}
.login-divider span{background:var(--sf);padding:0 10px;position:relative}
.demo-btns{display:flex;flex-direction:column;gap:6px}
.demo-btn{padding:8px 12px;background:var(--sf2);border:1px solid var(--bd);border-radius:6px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:10px}
.demo-btn:hover{border-color:var(--ac);background:rgba(0,229,160,.04)}
.demo-role{font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-family:var(--mono);color:var(--ac)}
.demo-name{font-size:12px;font-weight:500;color:var(--tx)}
.demo-email{font-size:11px;color:var(--tx3)}

/* ===== APP ===== */
.app{display:flex;height:100vh;overflow:hidden}
.sb{width:216px;min-width:216px;background:var(--sf);border-right:1px solid var(--bd);display:flex;flex-direction:column;height:100vh;overflow-y:auto}
.sb-logo{padding:14px 14px 12px;border-bottom:1px solid var(--bd)}
.sb-logo-row{display:flex;align-items:center;gap:8px}
.sb-icon{width:26px;height:26px;background:var(--ac);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:700;color:#000;clip-path:polygon(0 0,85% 0,100% 15%,100% 100%,0 100%)}
.sb-title{font-family:var(--mono);font-size:14px;font-weight:600}
.sb-title span{color:var(--ac)}
.sb-co{margin-top:8px;font-size:10px;color:var(--tx3)}
.sb-co b{display:block;color:var(--tx2);font-size:11px;margin-top:2px;font-weight:500}
.sb-sec{padding:10px 8px 0}
.sb-lbl{font-size:9px;letter-spacing:.12em;color:var(--tx3);text-transform:uppercase;padding:0 8px 3px;font-family:var(--mono);display:block}
.sb-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:5px;cursor:pointer;color:var(--tx2);font-size:12px;transition:all .15s;margin-bottom:1px;border:1px solid transparent}
.sb-item:hover{background:var(--sf2);color:var(--tx)}
.sb-item.act{background:rgba(0,229,160,.08);color:var(--ac);border-color:rgba(0,229,160,.15)}
.sb-item svg{width:14px;height:14px;flex-shrink:0}
.sb-badge{margin-left:auto;background:var(--ac);color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px;font-family:var(--mono)}
.sb-footer{margin-top:auto;padding:8px;border-top:1px solid var(--bd)}
.sb-user{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:5px;cursor:pointer}
.sb-user:hover{background:var(--sf2)}
.sb-av{width:28px;height:28px;background:linear-gradient(135deg,var(--ac2),var(--ac));border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000;flex-shrink:0}
.sb-un{font-size:11px;font-weight:500}
.sb-ur{font-size:10px;color:var(--tx3)}
.main{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden}
.tb{display:flex;align-items:center;padding:0 18px;height:48px;border-bottom:1px solid var(--bd);background:var(--sf);gap:10px;flex-shrink:0}
.tb-title{font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.04em}
.tb-bc{font-size:11px;color:var(--tx3);margin-left:2px}
.tb-bc span{color:var(--tx2)}
.tb-r{margin-left:auto;display:flex;align-items:center;gap:8px}
.tb-fy{font-family:var(--mono);font-size:10px;color:var(--tx3);border:1px solid var(--bd2);padding:3px 8px;border-radius:4px}
.tb-fy span{color:var(--ac)}
.sw{display:flex;align-items:center;gap:6px;background:var(--sf2);border:1px solid var(--bd);border-radius:5px;padding:5px 10px}
.sw input{background:none;border:none;outline:none;color:var(--tx);font-size:12px;font-family:var(--sans);width:140px}
.sw input::placeholder{color:var(--tx3)}
.btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:5px;border:none;cursor:pointer;font-size:12px;font-weight:500;font-family:var(--sans);transition:all .15s;white-space:nowrap}
.btn-p{background:var(--ac);color:#000}.btn-p:hover{background:#00ffb2}
.btn-o{background:transparent;border:1px solid var(--bd2);color:var(--tx2)}.btn-o:hover{border-color:var(--tx3);color:var(--tx)}
.btn-d{background:transparent;border:1px solid rgba(255,77,109,.3);color:var(--rd)}.btn-d:hover{background:rgba(255,77,109,.1)}
.btn-warn{background:rgba(255,107,53,.1);border:1px solid rgba(255,107,53,.3);color:var(--warn)}.btn-warn:hover{background:rgba(255,107,53,.2)}
.btn-logout{background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2);color:var(--rd)}.btn-logout:hover{background:rgba(255,77,109,.15)}
.btn-sm{padding:4px 10px;font-size:11px}
.btn-ic{width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center}
.content{flex:1;overflow-y:auto;background:var(--bg)}
.page{padding:18px}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:8px;overflow:hidden}
.card-hd{display:flex;align-items:center;padding:11px 14px;border-bottom:1px solid var(--bd);gap:10px}
.card-title{font-family:var(--mono);font-size:12px;font-weight:600}
.card-act{margin-left:auto;display:flex;gap:6px;align-items:center}
.card-bd{padding:14px}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.kpi{background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:14px;position:relative;overflow:hidden;cursor:default}
.kpi-lbl{font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;font-family:var(--mono);margin-bottom:6px}
.kpi-val{font-family:var(--mono);font-size:19px;font-weight:600;letter-spacing:-.02em}
.kpi-sub{display:flex;align-items:center;gap:5px;margin-top:6px;font-size:11px;color:var(--tx3)}
.up{color:var(--gr)}.dn{color:var(--rd)}
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:8px 12px;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3);font-family:var(--mono);border-bottom:1px solid var(--bd);white-space:nowrap}
td{padding:9px 12px;font-size:12px;color:var(--tx2);border-bottom:1px solid rgba(37,42,56,.5)}
tr:last-child td{border-bottom:none}
tbody tr:hover td{background:rgba(255,255,255,.02)}
.td-p{color:var(--tx);font-weight:500}
.td-m{font-family:var(--mono);font-size:11px}
.td-dr{color:var(--rd);font-family:var(--mono);font-size:11px}
.td-cr{color:var(--gr);font-family:var(--mono);font-size:11px}
.tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:3px;font-size:10px;font-weight:600;font-family:var(--mono);letter-spacing:.04em}
.tag-s{background:rgba(0,201,122,.1);color:var(--gr)}
.tag-p{background:rgba(255,107,53,.1);color:var(--warn)}
.tag-pay{background:rgba(255,77,109,.1);color:var(--rd)}
.tag-r{background:rgba(0,229,160,.1);color:var(--ac)}
.tag-j{background:rgba(255,209,102,.1);color:var(--yl)}
.tag-c{background:rgba(0,153,255,.1);color:var(--ac2)}
.fg{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.flbl{font-size:11px;color:var(--tx3);font-family:var(--mono);letter-spacing:.04em}
.fc{background:var(--sf2);border:1px solid var(--bd);border-radius:5px;padding:7px 10px;color:var(--tx);font-size:12px;font-family:var(--sans);outline:none;transition:border-color .15s;width:100%}
.fc:focus{border-color:var(--ac)}
.fc option{background:var(--sf2)}
textarea.fc{resize:vertical;min-height:58px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:flex-start;justify-content:center;z-index:100;overflow-y:auto;padding:20px}
.mod{background:var(--sf);border:1px solid var(--bd2);border-radius:10px;width:100%;max-width:820px;margin:auto}
.mod-lg{max-width:1050px}
.mod-hd{display:flex;align-items:center;padding:15px 18px;border-bottom:1px solid var(--bd)}
.mod-title{font-family:var(--mono);font-size:13px;font-weight:600}
.mod-cl{margin-left:auto;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;color:var(--tx3);background:none;border:none;font-size:18px;line-height:1}
.mod-cl:hover{background:var(--sf2);color:var(--tx)}
.mod-bd{padding:18px}
.mod-ft{padding:12px 18px;border-top:1px solid var(--bd);display:flex;justify-content:flex-end;gap:8px;align-items:center}
.tabs{display:flex;border-bottom:1px solid var(--bd);padding:0 14px}
.tab{padding:9px 13px;font-size:12px;color:var(--tx3);cursor:pointer;border-bottom:2px solid transparent;font-family:var(--mono);margin-bottom:-1px;transition:all .15s}
.tab:hover{color:var(--tx2)}
.tab.act{color:var(--ac);border-bottom-color:var(--ac)}
.sbar{display:flex;align-items:center;gap:14px;padding:0 18px;height:24px;background:var(--sf);border-top:1px solid var(--bd);font-family:var(--mono);font-size:10px;color:var(--tx3);flex-shrink:0}
.sdot{width:5px;height:5px;border-radius:50%;background:var(--gr)}
.sbar-r{margin-left:auto;display:flex;gap:14px}
.toast{position:fixed;bottom:32px;right:20px;padding:10px 16px;border-radius:6px;font-size:12px;font-weight:500;z-index:200;display:flex;align-items:center;gap:8px;animation:toastIn .2s ease;max-width:340px}
.toast-ok{background:rgba(0,201,122,.12);border:1px solid var(--gr);color:var(--gr)}
.toast-err{background:rgba(255,77,109,.12);border:1px solid var(--rd);color:var(--rd)}
.toast-warn{background:rgba(255,107,53,.12);border:1px solid var(--warn);color:var(--warn)}
@keyframes toastIn{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}
.rrow{display:flex;align-items:center;padding:7px 14px;border-bottom:1px solid rgba(37,42,56,.4);font-size:12px}
.rrow:hover{background:rgba(255,255,255,.02)}
.rrow.rhead{background:var(--sf2);font-weight:600;color:var(--tx);font-family:var(--mono);font-size:11px;letter-spacing:.04em}
.rrow.rsub{padding-left:28px;color:var(--tx2)}
.rrow.rtot{background:var(--sf2);border-top:1px solid var(--bd);font-weight:600;font-family:var(--mono);font-size:12px}
.rv{margin-left:auto;font-family:var(--mono);font-size:11px;white-space:nowrap}
.rv-dr{color:var(--rd)}.rv-cr{color:var(--gr)}
.itbl{width:100%;border-collapse:collapse;margin-top:10px}
.itbl th{background:var(--sf2);padding:6px 8px;font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;font-family:var(--mono);border:1px solid var(--bd)}
.itbl td{padding:5px 6px;border:1px solid rgba(37,42,56,.5);vertical-align:middle}
.itbl input,.itbl select{background:transparent;border:none;outline:none;color:var(--tx);font-size:12px;font-family:var(--sans);width:100%;padding:1px 2px}
.itbl input:focus{background:rgba(0,229,160,.05);border-radius:2px}
.el{display:grid;grid-template-columns:2fr 80px 140px 36px;gap:6px;align-items:center;padding:5px 0;border-bottom:1px solid rgba(37,42,56,.3)}
.el:last-child{border-bottom:none}
.mb12{margin-bottom:12px}
.flex{display:flex;align-items:center;gap:10px}
.text-ac{color:var(--ac);font-family:var(--mono);font-size:12px;cursor:pointer}
.text-ac:hover{text-decoration:underline}
.text-rd{color:var(--rd)}
.text-gr{color:var(--gr)}
.text-m{font-family:var(--mono);font-size:11px}
.text-sm{font-size:11px;color:var(--tx3)}
.sect-title{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--tx3);text-transform:uppercase;margin-bottom:8px;margin-top:4px}
.v-sep{height:1px;background:var(--bd);margin:14px 0}
.qbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:14px 8px;background:var(--sf2);border:1px solid var(--bd);border-radius:6px;cursor:pointer;transition:all .15s;text-align:center}
.qbtn:hover{border-color:var(--ac);background:rgba(0,229,160,.04)}
.qbtn-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.qbtn-lbl{font-size:11px;color:var(--tx2);font-weight:500;line-height:1.3}
.sum-box{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--sf2);border-radius:5px;margin-top:6px}
.sum-lbl{font-size:11px;color:var(--tx3);font-family:var(--mono)}
.sum-val{font-family:var(--mono);font-size:13px;font-weight:600}
.alert-w{padding:8px 12px;border-radius:5px;font-size:12px;margin-bottom:8px;background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2);color:var(--rd)}
.empty-st{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:var(--tx3);gap:12px}
.bal-box{display:grid;grid-template-columns:1fr 1fr;gap:0}
.bal-col{padding:16px}
.bal-col:first-child{border-right:1px solid var(--bd)}
.bal-col-title{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--tx3);text-transform:uppercase;margin-bottom:12px}

/* CONFIRM DIALOG */
.confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:300;animation:fadeIn .15s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.confirm-box{background:var(--sf);border:1px solid var(--bd2);border-radius:10px;padding:24px;width:380px;animation:loginIn .2s ease}
.confirm-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.confirm-title{font-size:15px;font-weight:600;margin-bottom:6px}
.confirm-desc{font-size:12px;color:var(--tx3);line-height:1.6;margin-bottom:18px}
.confirm-btns{display:flex;gap:8px;justify-content:flex-end}
`;

// ============================================================
// ICONS
// ============================================================
const I = {
  dash: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>,
  voucher: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5" /><path d="M5 6h6M5 9h4" /></svg>,
  ledger: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8" /></svg>,
  book: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h8a1 1 0 011 1v11a1 1 0 01-1 1H4a2 2 0 01-2-2V3a1 1 0 011-1zM9 2v12" /></svg>,
  trial: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h12M2 9h12M5 2v12M11 2v12" /></svg>,
  pnl: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12l3-4 3 2 3-5 3 2" /></svg>,
  bs: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M2 8h12" /><circle cx="8" cy="5" r="2" /><circle cx="8" cy="11" r="2" /></svg>,
  gst: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5l-3-3H5z" /><path d="M9 2v3h3M5 8h6M5 11h4" /></svg>,
  stock: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /><path d="M7 4.5h2a2 2 0 012 2v.5" /></svg>,
  edit: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3l3 3-7 7H3v-3l7-7z" /></svg>,
  del: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h10M6 5V3h4v2M4 5l1 8h6l1-8" /></svg>,
  search: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" /></svg>,
  eye: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>,
  logout: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M6 8h7" /></svg>,
  trash: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M5 4V2h6v2M3 4l1 10h8l1-10M6 7v4M10 7v4" /></svg>,
  warn: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L1 14h14L8 2z" /><path d="M8 6v4M8 11.5v.5" /></svg>,
};

// ============================================================
// CONFIRM DIALOG
// ============================================================
function ConfirmDialog({ icon, iconBg, title, desc, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-box">
        <div className="confirm-icon" style={{ background: iconBg }}>{icon}</div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-desc">{desc}</div>
        <div className="confirm-btns">
          <button className="btn btn-o" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = (u) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(u); }, 600);
  };

  const handleSubmit = () => {
    setErr('');
    const u = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (!u) { setErr('Invalid email or password. Try a demo account below.'); return; }
    doLogin(u);
  };

  return (
    <div className="login-wrap">
      <div className="login-bg">
        <div className="login-grid"></div>
        <div className="login-glow"></div>
      </div>
      <div className="login-card">
        <div className="login-top">
          <div className="login-logo">
            <div className="login-icon">L</div>
            <div>
              <div className="login-brand">Ledger<span>OS</span></div>
              <div className="login-tagline">Enterprise Accounting ERP</div>
            </div>
          </div>
          <div className="login-title">Welcome back</div>
          <div className="login-sub">Sign in to your accounting workspace</div>
        </div>
        <div className="login-body">
          {err && <div className="login-err">⚠ {err}</div>}
          <div className="login-hint">
            Demo credentials — <b>admin@meridian.com</b> / <b>admin123</b>
          </div>
          <div className="fg">
            <label className="flbl">Email Address</label>
            <input className="fc" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="fg">
            <label className="flbl">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="fc" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ paddingRight: 36 }} />
              <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', fontSize: 11, fontFamily: 'var(--mono)' }}>
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
          <button className="lbtn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span style={{ fontFamily: 'var(--mono)', letterSpacing: '.1em' }}>SIGNING IN...</span> : <>Sign In →</>}
          </button>
          <div className="login-divider"><span>or sign in as demo user</span></div>
          <div className="demo-btns">
            {DEMO_USERS.map(u => (
              <div key={u.id} className="demo-btn" onClick={() => doLogin(u)}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,var(--ac2),var(--ac))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="demo-name">{u.name}</div>
                    <span className="demo-role">{u.role}</span>
                  </div>
                  <div className="demo-email">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return () => document.head.removeChild(s);
  }, []);

  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [ledgers, setLedgers] = useState(DEFAULT_LEDGERS);
  const [vouchers, setVouchers] = useState(DEFAULT_VOUCHERS);
  const [stock, setStock] = useState(DEFAULT_STOCK);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [activeVTab, setActiveVTab] = useState('All');
  const [selectedLedgerId, setSelectedLedgerId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const handleLogout = () => {
    setConfirm({
      icon: '🚪', iconBg: 'rgba(255,77,109,.1)', title: 'Sign Out',
      desc: 'Are you sure you want to sign out of LedgerOS?',
      confirmLabel: 'Sign Out', confirmClass: 'btn-logout',
      onConfirm: () => { setUser(null); setPage('dashboard'); setModal(null); setConfirm(null); showToast('Signed out successfully'); }
    });
  };

  const handleClearData = () => {
    setConfirm({
      icon: '🗑️', iconBg: 'rgba(255,107,53,.1)', title: 'Clear All Data',
      desc: 'This will permanently delete ALL vouchers, ledgers, and stock items. This action cannot be undone. Are you absolutely sure?',
      confirmLabel: 'Yes, Clear Everything', confirmClass: 'btn-warn',
      onConfirm: () => {
        setVouchers([]);
        setLedgers([{ id: 'l1', name: 'Capital A/c', groupId: 'g1', ob: 0, obType: 'Cr' }, { id: 'l2', name: 'Bank', groupId: 'g8', ob: 0, obType: 'Dr' }, { id: 'l3', name: 'Cash', groupId: 'g9', ob: 0, obType: 'Dr' }]);
        setStock([]);
        setModal(null); setConfirm(null); setPage('dashboard');
        showToast('All data cleared. Starting fresh.', 'warn');
      }
    });
  };

  const ledgerMap = useMemo(() => Object.fromEntries(ledgers.map(l => [l.id, l])), [ledgers]);
  const groupMap = useMemo(() => Object.fromEntries(GROUPS.map(g => [g.id, g])), []);

  const getLedgerBalance = useCallback((id) => {
    const l = ledgerMap[id]; if (!l) return 0;
    const ob = l.obType === 'Dr' ? l.ob : -l.ob;
    return vouchers.reduce((sum, v) => {
      v.entries.forEach(e => { if (e.ledgerId === id) sum += e.type === 'Dr' ? e.amount : -e.amount; });
      return sum;
    }, ob);
  }, [ledgerMap, vouchers]);

  const fin = useMemo(() => {
    const bals = {};
    ledgers.forEach(l => { bals[l.id] = getLedgerBalance(l.id); });
    const sum = (gids) => ledgers.filter(l => gids.includes(l.groupId)).reduce((s, l) => s + Math.abs(bals[l.id] || 0), 0);
    const income = sum(['g10', 'g14']); const cogs = sum(['g11']); const opex = sum(['g12', 'g13']);
    const netProfit = income - cogs - opex;
    const totalAssets = sum(['g5', 'g6', 'g7', 'g8', 'g9']); const totalLiab = sum(['g1', 'g2', 'g3', 'g4', 'g15']);
    const cashbal = bals['l3'] || 0; const bankbal = bals['l2'] || 0;
    const receivables = sum(['g7']); const payables = sum(['g3']);
    return { bals, income, cogs, opex, netProfit, totalAssets, totalLiab, cashbal, bankbal, receivables, payables };
  }, [ledgers, vouchers, getLedgerBalance]);

  const vCounters = useMemo(() => {
    const c = { Sales: 0, Purchase: 0, Receipt: 0, Payment: 0, Journal: 0, Contra: 0 };
    vouchers.forEach(v => { if (c[v.type] !== undefined) c[v.type]++; });
    return c;
  }, [vouchers]);

  const nextVNo = (type) => `${VPFX[type]}/2025-26/${String(vCounters[type] + 901).padStart(4, '0')}`;

  const saveVoucher = useCallback((v) => {
    if (v.id && vouchers.find(x => x.id === v.id)) setVouchers(prev => prev.map(x => x.id === v.id ? v : x));
    else setVouchers(prev => [{ ...v, id: uid() }, ...prev]);
    showToast('Voucher saved successfully'); setModal(null);
  }, [vouchers, showToast]);

  const deleteVoucher = useCallback((id) => {
    setConfirm({
      icon: '🗑️', iconBg: 'rgba(255,77,109,.1)', title: 'Delete Voucher', desc: 'This voucher will be permanently deleted.', confirmLabel: 'Delete', confirmClass: 'btn-d',
      onConfirm: () => { setVouchers(prev => prev.filter(v => v.id !== id)); setModal(null); setConfirm(null); showToast('Voucher deleted'); }
    });
  }, [showToast]);

  const saveLedger = useCallback((l) => {
    if (l.id && ledgers.find(x => x.id === l.id)) setLedgers(prev => prev.map(x => x.id === l.id ? l : x));
    else setLedgers(prev => [...prev, { ...l, id: uid() }]);
    showToast('Ledger saved'); setModal(null);
  }, [ledgers, showToast]);

  const deleteLedger = useCallback((id) => {
    if (vouchers.some(v => v.entries.some(e => e.ledgerId === id))) { showToast('Cannot delete: ledger used in vouchers', 'err'); return; }
    setConfirm({
      icon: '🗑️', iconBg: 'rgba(255,77,109,.1)', title: 'Delete Ledger', desc: 'This ledger will be permanently deleted.', confirmLabel: 'Delete', confirmClass: 'btn-d',
      onConfirm: () => { setLedgers(prev => prev.filter(l => l.id !== id)); setConfirm(null); showToast('Ledger deleted'); }
    });
  }, [vouchers, showToast]);

  const saveStock = useCallback((s) => {
    if (s.id && stock.find(x => x.id === s.id)) setStock(prev => prev.map(x => x.id === s.id ? s : x));
    else setStock(prev => [...prev, { ...s, id: uid() }]);
    showToast('Stock item saved'); setModal(null);
  }, [stock, showToast]);

  const deleteStock = useCallback((id) => {
    setConfirm({
      icon: '🗑️', iconBg: 'rgba(255,77,109,.1)', title: 'Delete Stock Item', desc: 'This stock item will be permanently deleted.', confirmLabel: 'Delete', confirmClass: 'btn-d',
      onConfirm: () => { setStock(prev => prev.filter(s => s.id !== id)); setConfirm(null); showToast('Stock item deleted'); }
    });
  }, [showToast]);

  const openNewVoucher = (type) => setModal({ type: 'voucher', data: { type, date: todayStr(), no: nextVNo(type), narration: '', party: '', entries: [{ ledgerId: '', type: 'Dr', amount: '' }, { ledgerId: '', type: 'Cr', amount: '' }], items: [], gstAmount: 0, totalAmount: 0 } });
  const nav = (p) => { setPage(p); setSearch(''); };

  if (!user) return <LoginPage onLogin={u => { setUser(u); showToast(`Welcome, ${u.name}!`); }} />;

  const PAGE_TITLES = { dashboard: 'Dashboard', vouchers: 'Vouchers', 'ledger-master': 'Ledger Master', 'ledger-book': 'Ledger Book', 'trial-balance': 'Trial Balance', 'profit-loss': 'Profit & Loss', 'balance-sheet': 'Balance Sheet', 'gst-report': 'GST Report', 'stock-items': 'Stock Items' };
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const pages = {
    dashboard: <Dashboard fin={fin} vouchers={vouchers} ledgers={ledgers} ledgerMap={ledgerMap} openNewVoucher={openNewVoucher} nav={nav} />,
    vouchers: <VoucherList vouchers={vouchers} ledgerMap={ledgerMap} search={search} activeTab={activeVTab} setActiveTab={setActiveVTab} onNew={openNewVoucher} onEdit={v => setModal({ type: 'voucher', data: { ...v } })} onDelete={deleteVoucher} onView={v => setModal({ type: 'view', data: v })} />,
    'ledger-master': <LedgerMaster ledgers={ledgers} groupMap={groupMap} getLedgerBalance={getLedgerBalance} search={search} onNew={() => setModal({ type: 'ledger', data: { name: '', groupId: 'g7', ob: 0, obType: 'Dr' } })} onEdit={l => setModal({ type: 'ledger', data: { ...l } })} onDelete={deleteLedger} onBook={id => { setSelectedLedgerId(id); nav('ledger-book'); }} />,
    'ledger-book': <LedgerBook ledgerId={selectedLedgerId} ledgers={ledgers} vouchers={vouchers} ledgerMap={ledgerMap} groupMap={groupMap} getLedgerBalance={getLedgerBalance} onSelectLedger={setSelectedLedgerId} />,
    'trial-balance': <TrialBalance ledgers={ledgers} getLedgerBalance={getLedgerBalance} groupMap={groupMap} />,
    'profit-loss': <ProfitLoss ledgers={ledgers} getLedgerBalance={getLedgerBalance} fin={fin} />,
    'balance-sheet': <BalanceSheet ledgers={ledgers} getLedgerBalance={getLedgerBalance} groupMap={groupMap} fin={fin} />,
    'gst-report': <GSTReport vouchers={vouchers} ledgerMap={ledgerMap} />,
    'stock-items': <StockItems stock={stock} search={search} onNew={() => setModal({ type: 'stock', data: { name: '', unit: 'PCS', rate: 0, qty: 0, hsn: '', gstRate: 18, group: 'Finished Goods' } })} onEdit={s => setModal({ type: 'stock', data: { ...s } })} onDelete={deleteStock} />,
  };

  return (
    <div className="app">
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-logo-row">
            <div className="sb-icon">L</div>
            <div className="sb-title">Ledger<span>OS</span></div>
          </div>
          <div className="sb-co">Active Company<b>{user.company}</b></div>
        </div>
        <div className="sb-sec">
          <span className="sb-lbl">Overview</span>
          <div className={`sb-item ${page === 'dashboard' ? 'act' : ''}`} onClick={() => nav('dashboard')}>{I.dash} Dashboard</div>
        </div>
        <div className="sb-sec">
          <span className="sb-lbl">Transactions</span>
          <div className={`sb-item ${page === 'vouchers' ? 'act' : ''}`} onClick={() => nav('vouchers')}>{I.voucher} Vouchers <span className="sb-badge">{vouchers.length}</span></div>
        </div>
        <div className="sb-sec">
          <span className="sb-lbl">Master</span>
          <div className={`sb-item ${page === 'ledger-master' ? 'act' : ''}`} onClick={() => nav('ledger-master')}>{I.ledger} Ledger Master</div>
          <div className={`sb-item ${page === 'ledger-book' ? 'act' : ''}`} onClick={() => nav('ledger-book')}>{I.book} Ledger Book</div>
          <div className={`sb-item ${page === 'stock-items' ? 'act' : ''}`} onClick={() => nav('stock-items')}>{I.stock} Stock Items</div>
        </div>
        <div className="sb-sec">
          <span className="sb-lbl">Reports</span>
          <div className={`sb-item ${page === 'trial-balance' ? 'act' : ''}`} onClick={() => nav('trial-balance')}>{I.trial} Trial Balance</div>
          <div className={`sb-item ${page === 'profit-loss' ? 'act' : ''}`} onClick={() => nav('profit-loss')}>{I.pnl} Profit & Loss</div>
          <div className={`sb-item ${page === 'balance-sheet' ? 'act' : ''}`} onClick={() => nav('balance-sheet')}>{I.bs} Balance Sheet</div>
          <div className={`sb-item ${page === 'gst-report' ? 'act' : ''}`} onClick={() => nav('gst-report')}>{I.gst} GST Report</div>
        </div>
        <div className="sb-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button className="btn btn-warn btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 6 }} onClick={handleClearData}>
              {I.trash} Clear All Data
            </button>
            <button className="btn btn-logout btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 6 }} onClick={handleLogout}>
              {I.logout} Sign Out
            </button>
          </div>
          <div className="sb-user" style={{ marginTop: 4 }}>
            <div className="sb-av">{initials}</div>
            <div>
              <div className="sb-un">{user.name}</div>
              <div className="sb-ur">{user.role} · F.Y. 2025–26</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="tb">
          <div>
            <div className="tb-title">{PAGE_TITLES[page] || page}</div>
            <div className="tb-bc">Home / <span>{PAGE_TITLES[page]}</span></div>
          </div>
          <div className="tb-r">
            <div className="tb-fy">F.Y. <span>2025–26</span> | Apr–Mar</div>
            <div className="sw">{I.search}<input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <button className="btn btn-warn btn-sm" style={{ gap: 4 }} onClick={handleClearData}>{I.trash} Clear Data</button>
            <button className="btn btn-p btn-sm" onClick={() => openNewVoucher('Sales')} style={{ gap: 4 }}>+ New Voucher</button>
          </div>
        </div>
        <div className="content">{pages[page] || <div className="page"><p>Page not found</p></div>}</div>
        <div className="sbar">
          <div className="sdot"></div>
          <span>{user.company}</span>
          <span>{user.role}: {user.name}</span>
          <span style={{ color: 'var(--ac)' }}>Live</span>
          <div className="sbar-r">
            <span>Vouchers: {vouchers.length}</span>
            <span>Ledgers: {ledgers.length}</span>
            <span>LedgerOS v1.0</span>
          </div>
        </div>
      </div>

      {modal?.type === 'voucher' && <VoucherModal data={modal.data} ledgers={ledgers} stock={stock} nextVNo={nextVNo} onSave={saveVoucher} onClose={() => setModal(null)} />}
      {modal?.type === 'view' && <VoucherViewModal data={modal.data} ledgerMap={ledgerMap} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'voucher', data: { ...modal.data } })} onDelete={() => deleteVoucher(modal.data.id)} />}
      {modal?.type === 'ledger' && <LedgerModal data={modal.data} onSave={saveLedger} onClose={() => setModal(null)} />}
      {modal?.type === 'stock' && <StockModal data={modal.data} onSave={saveStock} onClose={() => setModal(null)} />}

      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'ok' ? '✓' : toast.type === 'warn' ? '⚠' : '✕'} {toast.msg}</div>}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ fin, vouchers, ledgers, ledgerMap, openNewVoucher, nav }) {
  return (
    <div className="page">
      <div className="kpi-grid">
        {[
          { lbl: 'Total Revenue', val: fmt(fin.income), sub: <span className="up">↑ 14.2% vs last qtr</span>, c: 'var(--ac)' },
          { lbl: 'Total Expenses', val: fmt(fin.cogs + fin.opex), sub: <span className="dn">↑ 6.8% vs last qtr</span>, c: 'var(--ac2)' },
          { lbl: 'Receivables', val: fmt(fin.receivables), sub: <span>Sundry debtors</span>, c: 'var(--warn)' },
          { lbl: 'Net Profit', val: fmt(fin.netProfit), sub: <span className={fin.netProfit >= 0 ? 'up' : 'dn'}>{fin.netProfit >= 0 ? 'Profit' : 'Loss'}</span>, c: 'var(--yl)' },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c }}></div>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={k.lbl === 'Net Profit' ? { color: fin.netProfit >= 0 ? 'var(--gr)' : 'var(--rd)' } : {}}>{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-hd"><div className="card-title">Income vs Expense — FY 2025–26</div></div>
          <div style={{ padding: 16 }}>
            <MiniChart />
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--tx2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: 'var(--ac)', borderRadius: 2, display: 'inline-block' }}></span>Income</span>
              <span style={{ fontSize: 11, color: 'var(--tx2)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: 'rgba(0,153,255,.5)', borderRadius: 2, display: 'inline-block' }}></span>Expense</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-hd"><div className="card-title">Quick Entry</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12 }}>
              {[{ type: 'Sales', icon: '🧾', c: 'rgba(0,229,160,.1)' }, { type: 'Purchase', icon: '📦', c: 'rgba(255,107,53,.1)' }, { type: 'Payment', icon: '💸', c: 'rgba(255,77,109,.1)' }, { type: 'Receipt', icon: '✅', c: 'rgba(0,201,122,.1)' }, { type: 'Journal', icon: '📝', c: 'rgba(255,209,102,.1)' }, { type: 'Contra', icon: '🔄', c: 'rgba(0,153,255,.1)' }].map(q => (
                <div key={q.type} className="qbtn" onClick={() => openNewVoucher(q.type)}>
                  <div className="qbtn-icon" style={{ background: q.c }}>{q.icon}</div>
                  <div className="qbtn-lbl">{q.type}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-title">Cash & Bank</div></div>
            <div style={{ padding: '8px 14px' }}>
              <div className="sum-box"><span className="sum-lbl">Cash Balance</span><span className="sum-val text-gr">{fmt(fin.cashbal)}</span></div>
              <div className="sum-box" style={{ marginTop: 6 }}><span className="sum-lbl">Bank Balance</span><span className="sum-val text-gr">{fmt(fin.bankbal)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hd">
          <div className="card-title">Recent Vouchers</div>
          <div className="card-act"><span className="text-ac" onClick={() => nav('vouchers')}>View all →</span></div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Voucher No.</th><th>Date</th><th>Type</th><th>Party</th><th>Narration</th><th>Amount</th></tr></thead>
            <tbody>{vouchers.slice(0, 8).map(v => (
              <tr key={v.id}>
                <td className="td-m">{v.no}</td>
                <td className="td-m">{fmtDate(v.date)}</td>
                <td><span className={`tag ${VTAG[v.type]}`}>{v.type.toUpperCase()}</span></td>
                <td className="td-p">{v.party ? (ledgerMap[v.party]?.name || '—') : '—'}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--tx3)' }}>{v.narration}</td>
                <td className="td-m">{fmt(v.totalAmount)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const d = [{ m: 'APR', i: 62, e: 38 }, { m: 'MAY', i: 74, e: 46 }, { m: 'JUN', i: 55, e: 34 }, { m: 'JUL', i: 88, e: 52 }, { m: 'AUG', i: 70, e: 44 }, { m: 'SEP', i: 95, e: 60 }, { m: 'OCT', i: 80, e: 50 }, { m: 'NOV', i: 108, e: 65 }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {d.map(x => (
          <div key={x.m} style={{ flex: 1, display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%' }}>
            <div style={{ flex: 1, background: 'var(--ac)', borderRadius: '3px 3px 0 0', height: `${x.i}px`, minHeight: 4 }}></div>
            <div style={{ flex: 1, background: 'rgba(0,153,255,.45)', borderRadius: '3px 3px 0 0', height: `${x.e}px`, minHeight: 4 }}></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {d.map(x => <div key={x.m} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{x.m}</div>)}
      </div>
    </div>
  );
}

// ============================================================
// VOUCHER LIST
// ============================================================
function VoucherList({ vouchers, ledgerMap, search, activeTab, setActiveTab, onNew, onEdit, onDelete, onView }) {
  const filtered = vouchers.filter(v => {
    const matchType = activeTab === 'All' || v.type === activeTab;
    const q = search.toLowerCase();
    const ms = !q || v.no?.toLowerCase().includes(q) || v.narration?.toLowerCase().includes(q) || (v.party && ledgerMap[v.party]?.name?.toLowerCase().includes(q));
    return matchType && ms;
  });
  return (
    <div className="page">
      <div className="card">
        <div className="card-hd">
          <div className="card-title">All Vouchers</div>
          <div className="card-act">
            {['All', ...VTYPES].map(t => <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-p' : 'btn-o'}`} onClick={() => setActiveTab(t)}>{t}</button>)}
          </div>
        </div>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--bd)', display: 'flex', gap: 8 }}>
          {VTYPES.map(t => <button key={t} className="btn btn-sm btn-o" onClick={() => onNew(t)} style={{ fontSize: 10 }}>+ {t}</button>)}
        </div>
        {filtered.length === 0 ? (
          <div className="empty-st"><div style={{ color: 'var(--tx2)' }}>No vouchers found</div></div>
        ) : (
          <div className="tw">
            <table>
              <thead><tr><th>Voucher No.</th><th>Date</th><th>Type</th><th>Party</th><th>Narration</th><th>Dr</th><th>Cr</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(v => {
                const dr = v.entries.filter(e => e.type === 'Dr').reduce((s, e) => s + e.amount, 0);
                const cr = v.entries.filter(e => e.type === 'Cr').reduce((s, e) => s + e.amount, 0);
                return (<tr key={v.id}>
                  <td className="td-m td-p" style={{ cursor: 'pointer', color: 'var(--ac)' }} onClick={() => onView(v)}>{v.no}</td>
                  <td className="td-m">{fmtDate(v.date)}</td>
                  <td><span className={`tag ${VTAG[v.type]}`}>{v.type.toUpperCase()}</span></td>
                  <td className="td-p">{v.party ? (ledgerMap[v.party]?.name || '—') : '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--tx3)', fontSize: 11 }}>{v.narration}</td>
                  <td className="td-dr">{dr > 0 ? fmtN(dr) : '—'}</td>
                  <td className="td-cr">{cr > 0 ? fmtN(cr) : '—'}</td>
                  <td><div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ic btn-o btn-sm" onClick={() => onView(v)}>{I.eye}</button>
                    <button className="btn btn-ic btn-o btn-sm" onClick={() => onEdit(v)}>{I.edit}</button>
                    <button className="btn btn-ic btn-d btn-sm" onClick={() => onDelete(v.id)}>{I.del}</button>
                  </div></td>
                </tr>);
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VOUCHER MODAL
// ============================================================
function VoucherModal({ data, ledgers, stock, nextVNo, onSave, onClose }) {
  const [v, setV] = useState({ ...data, no: data.no || nextVNo(data.type), date: data.date || todayStr(), entries: data.entries?.length ? data.entries.map(e => ({ ...e })) : [{ ledgerId: '', type: 'Dr', amount: '' }, { ledgerId: '', type: 'Cr', amount: '' }], items: data.items?.length ? data.items.map(i => ({ ...i })) : [] });
  const [err, setErr] = useState('');
  const cashBankLedgers = ledgers.filter(l => ['g8', 'g9'].includes(l.groupId));
  const debtorLedgers = ledgers.filter(l => l.groupId === 'g7');
  const creditorLedgers = ledgers.filter(l => l.groupId === 'g3');
  const salesLedgers = ledgers.filter(l => l.groupId === 'g10');
  const purchLedgers = ledgers.filter(l => l.groupId === 'g11');
  const isItemBased = ['Sales', 'Purchase'].includes(v.type);

  useEffect(() => {
    if (!isItemBased || v.items.length === 0) return;
    const taxable = v.items.reduce((s, i) => s + (parseFloat(i.taxable) || 0), 0);
    const gst = v.items.reduce((s, i) => s + (parseFloat(i.gstAmt) || 0), 0);
    const total = taxable + gst;
    if (v.type === 'Sales') {
      const entries = [];
      if (v.party) entries.push({ ledgerId: v.party, type: 'Dr', amount: total });
      const sl = salesLedgers[0];
      if (sl) entries.push({ ledgerId: sl.id, type: 'Cr', amount: taxable });
      if (gst > 0) { entries.push({ ledgerId: 'l12', type: 'Cr', amount: Math.round(gst / 2) }); entries.push({ ledgerId: 'l13', type: 'Cr', amount: Math.round(gst / 2) }); }
      setV(prev => ({ ...prev, entries, gstAmount: gst, totalAmount: total }));
    } else {
      const entries = [];
      const pl = purchLedgers[0];
      if (pl) entries.push({ ledgerId: pl.id, type: 'Dr', amount: taxable });
      if (gst > 0) entries.push({ ledgerId: 'l14', type: 'Dr', amount: gst });
      if (v.party) entries.push({ ledgerId: v.party, type: 'Cr', amount: total });
      setV(prev => ({ ...prev, entries, gstAmount: gst, totalAmount: total }));
    }
  }, [v.items, v.party, v.type]);

  const addItem = () => setV(prev => ({ ...prev, items: [...prev.items, { id: uid(), name: '', hsn: '', qty: 1, rate: 0, gstRate: 18, taxable: 0, gstAmt: 0, total: 0 }] }));
  const updateItem = (idx, field, val) => setV(prev => ({
    ...prev, items: prev.items.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: val };
      const qty = parseFloat(u.qty) || 0, rate = parseFloat(u.rate) || 0, gr = parseFloat(u.gstRate) || 0;
      const tax = qty * rate, gst = tax * gr / 100;
      return { ...u, taxable: Math.round(tax), gstAmt: Math.round(gst), total: Math.round(tax + gst) };
    })
  }));
  const removeItem = (idx) => setV(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const addEntry = () => setV(prev => ({ ...prev, entries: [...prev.entries, { ledgerId: '', type: 'Dr', amount: '' }] }));
  const removeEntry = (idx) => setV(prev => ({ ...prev, entries: prev.entries.filter((_, i) => i !== idx) }));
  const updateEntry = (idx, field, val) => setV(prev => ({ ...prev, entries: prev.entries.map((e, i) => i === idx ? { ...e, [field]: field === 'amount' ? parseFloat(val) || '' : val } : e) }));
  const drTotal = v.entries.filter(e => e.type === 'Dr').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const crTotal = v.entries.filter(e => e.type === 'Cr').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const balanced = Math.abs(drTotal - crTotal) < 0.01;
  const handleSave = () => {
    if (!v.date) { setErr('Date required'); return; }
    if (v.entries.some(e => !e.ledgerId || !(parseFloat(e.amount) > 0))) { setErr('Fill all entry lines'); return; }
    if (!balanced) { setErr(`Not balanced! Dr: ${fmt(drTotal)} Cr: ${fmt(crTotal)}`); return; }
    onSave({ ...v, totalAmount: isItemBased ? v.totalAmount : drTotal, no: v.no || nextVNo(v.type) });
  };
  const handleTypeChange = (type) => { setV(prev => ({ ...prev, type, no: nextVNo(type), party: '', items: [], entries: [{ ledgerId: '', type: 'Dr', amount: '' }, { ledgerId: '', type: 'Cr', amount: '' }], gstAmount: 0, totalAmount: 0 })); setErr(''); };
  const itemTaxable = v.items.reduce((s, i) => s + (parseFloat(i.taxable) || 0), 0);
  const itemGst = v.items.reduce((s, i) => s + (parseFloat(i.gstAmt) || 0), 0);

  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod mod-lg">
        <div className="mod-hd"><div className="mod-title">{data.id ? 'Edit' : 'New'} Voucher</div><button className="mod-cl" onClick={onClose}>×</button></div>
        <div className="mod-bd" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {err && <div className="alert-w">{err}</div>}
          <div className="g3 mb12">
            <div className="fg"><label className="flbl">Type</label><select className="fc" value={v.type} onChange={e => handleTypeChange(e.target.value)}>{VTYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="fg"><label className="flbl">Date</label><input type="date" className="fc" value={v.date} onChange={e => setV(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="fg"><label className="flbl">Voucher No.</label><input className="fc" value={v.no} onChange={e => setV(p => ({ ...p, no: e.target.value }))} style={{ fontFamily: 'var(--mono)', fontSize: 11 }} /></div>
          </div>
          {['Sales', 'Purchase', 'Receipt', 'Payment'].includes(v.type) && (
            <div className="g2 mb12">
              <div className="fg">
                <label className="flbl">{v.type === 'Sales' ? 'Bill To' : v.type === 'Purchase' ? 'Bill From' : v.type === 'Receipt' ? 'Received From' : 'Paid To'}</label>
                <select className="fc" value={v.party} onChange={e => setV(p => ({ ...p, party: e.target.value }))}>
                  <option value="">— Select Party —</option>
                  {[...debtorLedgers, ...creditorLedgers, ...ledgers.filter(l => ['g12', 'g13'].includes(l.groupId))].map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              {['Payment', 'Receipt'].includes(v.type) && (
                <div className="fg">
                  <label className="flbl">{v.type === 'Payment' ? 'Paid Via' : 'Deposited Into'}</label>
                  <select className="fc" onChange={e => { const lid = e.target.value; setV(p => ({ ...p, entries: v.type === 'Payment' ? [{ ledgerId: p.party || '', type: 'Dr', amount: p.totalAmount || '' }, ...(lid ? [{ ledgerId: lid, type: 'Cr', amount: p.totalAmount || '' }] : [])] : [...(lid ? [{ ledgerId: lid, type: 'Dr', amount: p.totalAmount || '' }] : []), { ledgerId: p.party || '', type: 'Cr', amount: p.totalAmount || '' }] })); }}>
                    <option value="">— Select —</option>
                    {cashBankLedgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="fg mb12"><label className="flbl">Narration</label><textarea className="fc" value={v.narration} onChange={e => setV(p => ({ ...p, narration: e.target.value }))} placeholder="Description..." /></div>
          <div className="v-sep" />
          {isItemBased && (
            <div className="mb12">
              <div className="sect-title">Item Lines</div>
              <table className="itbl">
                <thead><tr><th style={{ minWidth: 150 }}>Item</th><th style={{ width: 70 }}>HSN</th><th style={{ width: 55 }}>Qty</th><th style={{ width: 80 }}>Rate</th><th style={{ width: 60 }}>GST%</th><th style={{ width: 90 }}>Taxable</th><th style={{ width: 80 }}>GST</th><th style={{ width: 90 }}>Total</th><th style={{ width: 28 }}></th></tr></thead>
                <tbody>{v.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td><input list="stock-list" value={it.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Item name" /></td>
                    <td><input value={it.hsn} onChange={e => updateItem(idx, 'hsn', e.target.value)} /></td>
                    <td><input type="number" value={it.qty} min="0" onChange={e => updateItem(idx, 'qty', e.target.value)} /></td>
                    <td><input type="number" value={it.rate} min="0" step="0.01" onChange={e => updateItem(idx, 'rate', e.target.value)} /></td>
                    <td><select value={it.gstRate} onChange={e => updateItem(idx, 'gstRate', e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--tx)', fontSize: 12, width: '100%' }}>{[0, 3, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}</select></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.taxable)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--ac2)', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.gstAmt)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--gr)', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.total)}</td>
                    <td><button className="btn btn-ic btn-d" style={{ width: 22, height: 22 }} onClick={() => removeItem(idx)}>×</button></td>
                  </tr>
                ))}</tbody>
              </table>
              <datalist id="stock-list">{stock.map(s => <option key={s.id} value={s.name} />)}</datalist>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-o btn-sm" onClick={addItem}>+ Add Item</button>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, fontFamily: 'var(--mono)' }}>
                  <span style={{ color: 'var(--tx3)' }}>Taxable: <b style={{ color: 'var(--tx)' }}>{fmt(itemTaxable)}</b></span>
                  <span style={{ color: 'var(--tx3)' }}>GST: <b style={{ color: 'var(--ac2)' }}>{fmt(itemGst)}</b></span>
                  <span style={{ color: 'var(--tx3)' }}>Total: <b style={{ color: 'var(--gr)' }}>{fmt(itemTaxable + itemGst)}</b></span>
                </div>
              </div>
              <div className="v-sep" />
            </div>
          )}
          <div>
            <div className="sect-title">Accounting Entries</div>
            {v.entries.map((e, idx) => (
              <div key={idx} className="el">
                <select className="fc" value={e.ledgerId} onChange={ev => updateEntry(idx, 'ledgerId', ev.target.value)}>
                  <option value="">— Select Ledger —</option>
                  {GROUPS.map(g => (
                    <optgroup key={g.id} label={g.name}>
                      {ledgers.filter(l => l.groupId === g.id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <select className="fc" value={e.type} onChange={ev => updateEntry(idx, 'type', ev.target.value)}><option value="Dr">Dr</option><option value="Cr">Cr</option></select>
                <input type="number" className="fc" value={e.amount} min="0" step="0.01" placeholder="Amount" onChange={ev => updateEntry(idx, 'amount', ev.target.value)} style={{ fontFamily: 'var(--mono)' }} />
                <button className="btn btn-ic btn-d btn-sm" onClick={() => removeEntry(idx)} disabled={v.entries.length <= 2}>×</button>
              </div>
            ))}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-o btn-sm" onClick={addEntry}>+ Add Line</button>
              <div style={{ display: 'flex', gap: 10, fontSize: 12, fontFamily: 'var(--mono)' }}>
                <span style={{ color: 'var(--tx3)' }}>Dr: <b style={{ color: 'var(--rd)' }}>{fmtN(drTotal)}</b></span>
                <span style={{ color: 'var(--tx3)' }}>Cr: <b style={{ color: 'var(--gr)' }}>{fmtN(crTotal)}</b></span>
                {balanced ? <span style={{ color: 'var(--gr)' }}>✓ Balanced</span> : <span style={{ color: 'var(--rd)' }}>✗ Diff: {fmtN(Math.abs(drTotal - crTotal))}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="mod-ft">
          <span style={{ fontSize: 11 }}>{balanced ? <span style={{ color: 'var(--gr)' }}>✓ Balanced</span> : <span style={{ color: 'var(--rd)' }}>✗ Not balanced</span>}</span>
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={handleSave}>Save Voucher</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VOUCHER VIEW MODAL
// ============================================================
function VoucherViewModal({ data, ledgerMap, onClose, onEdit, onDelete }) {
  const drTotal = data.entries.filter(e => e.type === 'Dr').reduce((s, e) => s + e.amount, 0);
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod">
        <div className="mod-hd">
          <div><div className="mod-title">{data.no}</div><div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>{fmtDate(data.date)} · <span className={`tag ${VTAG[data.type]}`}>{data.type.toUpperCase()}</span></div></div>
          <button className="mod-cl" onClick={onClose}>×</button>
        </div>
        <div className="mod-bd">
          {data.narration && <div style={{ color: 'var(--tx2)', fontSize: 12, marginBottom: 14, fontStyle: 'italic' }}>"{data.narration}"</div>}
          {data.items?.length > 0 && (
            <div className="mb12">
              <div className="sect-title">Items</div>
              <table className="itbl">
                <thead><tr><th>Item</th><th>HSN</th><th>Qty</th><th>Rate</th><th>GST%</th><th>Taxable</th><th>GST</th><th>Total</th></tr></thead>
                <tbody>{data.items.map((it, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--tx)' }}>{it.name}</td>
                    <td style={{ color: 'var(--tx3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{it.hsn}</td>
                    <td style={{ textAlign: 'right' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.rate)}</td>
                    <td style={{ color: 'var(--ac2)' }}>{it.gstRate}%</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.taxable)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--ac2)', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.gstAmt)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--gr)', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtN(it.total)}</td>
                  </tr>
                ))}</tbody>
              </table>
              <div className="v-sep" />
            </div>
          )}
          <div className="sect-title">Accounting Entries</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--bd)', letterSpacing: '.08em' }}>LEDGER</th><th style={{ width: 60, textAlign: 'center', padding: '6px 10px', fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--bd)' }}>DR/CR</th><th style={{ textAlign: 'right', padding: '6px 10px', fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--bd)' }}>AMOUNT</th></tr></thead>
            <tbody>{data.entries.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(37,42,56,.4)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--tx)', fontWeight: 500 }}>{ledgerMap[e.ledgerId]?.name || e.ledgerId}</td>
                <td style={{ textAlign: 'center', padding: '8px 10px' }}><span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', color: e.type === 'Dr' ? 'var(--rd)' : 'var(--gr)', background: e.type === 'Dr' ? 'rgba(255,77,109,.1)' : 'rgba(0,201,122,.1)', padding: '2px 6px', borderRadius: 3 }}>{e.type}</span></td>
                <td style={{ textAlign: 'right', padding: '8px 10px', fontFamily: 'var(--mono)', fontSize: 12, color: e.type === 'Dr' ? 'var(--rd)' : 'var(--gr)' }}>{fmtN(e.amount)}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{ background: 'var(--sf2)' }}><td style={{ padding: '8px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>TOTAL</td><td></td><td style={{ textAlign: 'right', padding: '8px 10px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gr)', fontWeight: 600 }}>{fmt(drTotal)}</td></tr></tfoot>
          </table>
        </div>
        <div className="mod-ft">
          <button className="btn btn-d btn-sm" onClick={onDelete}>Delete</button>
          <button className="btn btn-o" onClick={onClose}>Close</button>
          <button className="btn btn-p" onClick={onEdit}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LEDGER MASTER
// ============================================================
function LedgerMaster({ ledgers, groupMap, getLedgerBalance, search, onNew, onEdit, onDelete, onBook }) {
  const [gf, setGf] = useState('All');
  const filtered = ledgers.filter(l => {
    const q = search.toLowerCase();
    return (!q || l.name.toLowerCase().includes(q) || (groupMap[l.groupId]?.name || '').toLowerCase().includes(q)) && (gf === 'All' || l.groupId === gf);
  });
  return (
    <div className="page">
      <div className="card">
        <div className="card-hd">
          <div className="card-title">Ledger Accounts</div>
          <div className="card-act">
            <select className="fc" style={{ width: 'auto', padding: '4px 8px', fontSize: 11 }} value={gf} onChange={e => setGf(e.target.value)}>
              <option value="All">All Groups</option>
              {GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button className="btn btn-p btn-sm" onClick={onNew}>+ New Ledger</button>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Ledger Name</th><th>Group</th><th>Nature</th><th>Opening Bal</th><th>Current Bal</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(l => {
              const bal = getLedgerBalance(l.id); const g = groupMap[l.groupId];
              return (<tr key={l.id}>
                <td className="td-p" style={{ cursor: 'pointer', color: 'var(--ac)' }} onClick={() => onBook(l.id)}>{l.name}</td>
                <td style={{ fontSize: 11, color: 'var(--tx3)' }}>{g?.name}</td>
                <td><span className="tag" style={{ background: 'rgba(79,90,110,.2)', color: 'var(--tx3)' }}>{g?.nature?.toUpperCase()}</span></td>
                <td className="td-m">{fmt(l.ob)} {l.obType}</td>
                <td className={bal >= 0 ? 'td-dr' : 'td-cr'}>{fmt(Math.abs(bal))} {bal >= 0 ? 'Dr' : 'Cr'}</td>
                <td><div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ic btn-o btn-sm" onClick={() => onBook(l.id)}>{I.book}</button>
                  <button className="btn btn-ic btn-o btn-sm" onClick={() => onEdit(l)}>{I.edit}</button>
                  <button className="btn btn-ic btn-d btn-sm" onClick={() => onDelete(l.id)}>{I.del}</button>
                </div></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LEDGER MODAL
// ============================================================
function LedgerModal({ data, onSave, onClose }) {
  const [l, setL] = useState({ name: '', groupId: 'g7', ob: 0, obType: 'Dr', ...data });
  const [err, setErr] = useState('');
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod" style={{ maxWidth: 480 }}>
        <div className="mod-hd"><div className="mod-title">{data.id ? 'Edit' : 'New'} Ledger</div><button className="mod-cl" onClick={onClose}>×</button></div>
        <div className="mod-bd">
          {err && <div className="alert-w">{err}</div>}
          <div className="fg"><label className="flbl">Ledger Name *</label><input className="fc" value={l.name} onChange={e => setL(p => ({ ...p, name: e.target.value }))} placeholder="e.g. ABC Pvt. Ltd." /></div>
          <div className="fg"><label className="flbl">Group</label><select className="fc" value={l.groupId} onChange={e => setL(p => ({ ...p, groupId: e.target.value }))}>{GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="g2">
            <div className="fg"><label className="flbl">Opening Balance</label><input type="number" className="fc" value={l.ob} min="0" step="0.01" onChange={e => setL(p => ({ ...p, ob: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="fg"><label className="flbl">Balance Type</label><select className="fc" value={l.obType} onChange={e => setL(p => ({ ...p, obType: e.target.value }))}><option value="Dr">Dr (Debit)</option><option value="Cr">Cr (Credit)</option></select></div>
          </div>
        </div>
        <div className="mod-ft">
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => { if (!l.name.trim()) { setErr('Ledger name required'); return; } onSave(l); }}>Save Ledger</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LEDGER BOOK
// ============================================================
function LedgerBook({ ledgerId, ledgers, vouchers, ledgerMap, groupMap, getLedgerBalance, onSelectLedger }) {
  const [selId, setSelId] = useState(ledgerId || ledgers[0]?.id);
  const ledger = ledgers.find(l => l.id === selId);
  const group = ledger ? groupMap[ledger.groupId] : null;
  const txns = vouchers.filter(v => v.entries.some(e => e.ledgerId === selId)).sort((a, b) => a.date.localeCompare(b.date));
  let running = ledger ? (ledger.obType === 'Dr' ? ledger.ob : -ledger.ob) : 0;
  const rows = [];
  if (ledger) rows.push({ date: '—', no: 'Opening Balance', type: '—', dr: ledger.obType === 'Dr' ? ledger.ob : 0, cr: ledger.obType === 'Cr' ? ledger.ob : 0, bal: running, isOB: true });
  txns.forEach(v => {
    v.entries.filter(e => e.ledgerId === selId).forEach(e => {
      const dr = e.type === 'Dr' ? e.amount : 0, cr = e.type === 'Cr' ? e.amount : 0;
      running += dr - cr;
      rows.push({ date: v.date, no: v.no, type: v.type, narration: v.narration, dr, cr, bal: running });
    });
  });
  const finalBal = getLedgerBalance(selId);
  return (
    <div className="page">
      <div className="g2 mb12">
        <div className="fg"><label className="flbl">Select Ledger</label>
          <select className="fc" value={selId} onChange={e => { setSelId(e.target.value); onSelectLedger && onSelectLedger(e.target.value); }}>
            {GROUPS.map(g => (<optgroup key={g.id} label={g.name}>{ledgers.filter(l => l.groupId === g.id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</optgroup>))}
          </select>
        </div>
        {ledger && <div style={{ display: 'flex', alignItems: 'flex-end' }}><div className="sum-box" style={{ flex: 1 }}><span className="sum-lbl">{ledger.name}</span><span className="sum-val" style={{ color: finalBal >= 0 ? 'var(--rd)' : 'var(--gr)' }}>{fmt(Math.abs(finalBal))} {finalBal >= 0 ? 'Dr' : 'Cr'}</span></div></div>}
      </div>
      <div className="card">
        <div className="card-hd">
          <div className="card-title">{ledger?.name || 'Select a ledger'}</div>
          <div className="card-act">{group && <span className="tag" style={{ background: 'rgba(79,90,110,.2)', color: 'var(--tx3)' }}>{group.name}</span>}</div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Date</th><th>Voucher No.</th><th>Type</th><th>Narration</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i} style={r.isOB ? { background: 'rgba(0,229,160,.04)' } : {}}>
                <td className="td-m">{r.isOB ? 'OB' : fmtDate(r.date)}</td>
                <td className="td-m td-p">{r.no}</td>
                <td>{!r.isOB && r.type && r.type !== '—' && <span className={`tag ${VTAG[r.type] || ''}`}>{r.type.toUpperCase()}</span>}</td>
                <td style={{ fontSize: 11, color: 'var(--tx3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.narration}</td>
                <td className="td-dr">{r.dr > 0 ? fmtN(r.dr) : '—'}</td>
                <td className="td-cr">{r.cr > 0 ? fmtN(r.cr) : '—'}</td>
                <td className={r.bal >= 0 ? 'td-dr' : 'td-cr'}>{fmtN(Math.abs(r.bal))} {r.bal >= 0 ? 'Dr' : 'Cr'}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{ background: 'var(--sf2)' }}>
              <td colSpan={4} style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>CLOSING BALANCE</td>
              <td></td><td></td>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: finalBal >= 0 ? 'var(--rd)' : 'var(--gr)', padding: '8px 12px' }}>{fmt(Math.abs(finalBal))} {finalBal >= 0 ? 'Dr' : 'Cr'}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TRIAL BALANCE
// ============================================================
function TrialBalance({ ledgers, getLedgerBalance, groupMap }) {
  const rows = ledgers.map(l => { const bal = getLedgerBalance(l.id); return { ...l, bal, dr: bal > 0 ? bal : 0, cr: bal < 0 ? Math.abs(bal) : 0, group: groupMap[l.groupId] }; }).filter(r => r.dr > 0 || r.cr > 0 || r.bal !== 0);
  const totDr = rows.reduce((s, r) => s + r.dr, 0), totCr = rows.reduce((s, r) => s + r.cr, 0);
  return (
    <div className="page">
      <div className="card">
        <div className="card-hd"><div className="card-title">Trial Balance — As on {fmtDate(todayStr())}</div><div className="card-act"><span style={{ fontSize: 11, color: Math.abs(totDr - totCr) < 1 ? 'var(--gr)' : 'var(--rd)', fontFamily: 'var(--mono)' }}>{Math.abs(totDr - totCr) < 1 ? '✓ Balanced' : '✗ Not Balanced'}</span></div></div>
        <div>
          <div className="rrow rhead"><span style={{ flex: 1 }}>LEDGER NAME</span><span style={{ width: 140 }}>GROUP</span><span className="rv" style={{ width: 120, textAlign: 'right' }}>DEBIT</span><span className="rv" style={{ width: 120, textAlign: 'right' }}>CREDIT</span></div>
          {GROUPS.map(g => {
            const gRows = rows.filter(r => r.groupId === g.id); if (!gRows.length) return null;
            return (<div key={g.id}>
              <div className="rrow" style={{ background: 'rgba(37,42,56,.3)' }}><span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>{g.name}</span><span style={{ width: 140, fontSize: 10, color: 'var(--tx3)' }}>{g.nature}</span><span style={{ width: 120 }}></span><span style={{ width: 120 }}></span></div>
              {gRows.map(r => <div key={r.id} className="rrow rsub"><span style={{ flex: 1 }}>{r.name}</span><span style={{ width: 140 }}></span><span className="rv rv-dr" style={{ width: 120, textAlign: 'right' }}>{r.dr > 0 ? fmtN(r.dr) : '—'}</span><span className="rv rv-cr" style={{ width: 120, textAlign: 'right' }}>{r.cr > 0 ? fmtN(r.cr) : '—'}</span></div>)}
            </div>);
          })}
          <div className="rrow rtot"><span style={{ flex: 1 }}>TOTAL</span><span style={{ width: 140 }}></span><span className="rv rv-dr" style={{ width: 120, textAlign: 'right' }}>{fmtN(totDr)}</span><span className="rv rv-cr" style={{ width: 120, textAlign: 'right' }}>{fmtN(totCr)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFIT & LOSS
// ============================================================
function ProfitLoss({ ledgers, getLedgerBalance, fin }) {
  const getGroup = (ids) => ledgers.filter(l => ids.includes(l.groupId)).map(l => ({ ...l, bal: Math.abs(getLedgerBalance(l.id)) })).filter(l => l.bal > 0);
  const sales = getGroup(['g10']), otherInc = getGroup(['g14']), cogs = getGroup(['g11']), dExp = getGroup(['g12']), iExp = getGroup(['g13']);
  const S = ({ title, rows, colorcls }) => (
    <div style={{ marginBottom: 12 }}>
      <div className="rrow rhead"><span style={{ flex: 1 }}>{title}</span><span className="rv" style={{ width: 140, textAlign: 'right' }}>AMOUNT</span></div>
      {rows.map(r => <div key={r.id} className="rrow rsub"><span style={{ flex: 1 }}>{r.name}</span><span className={`rv ${colorcls}`} style={{ width: 140, textAlign: 'right' }}>{fmtN(r.bal)}</span></div>)}
      <div className="rrow" style={{ background: 'rgba(37,42,56,.2)' }}><span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>Sub-Total</span><span className={`rv ${colorcls}`} style={{ width: 140, textAlign: 'right', fontWeight: 600 }}>{fmtN(rows.reduce((s, r) => s + r.bal, 0))}</span></div>
    </div>
  );
  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card"><div className="card-hd"><div className="card-title">Income</div></div><div style={{ padding: '8px 0' }}><S title="Sales / Revenue" rows={sales} colorcls="rv-cr" /><S title="Other Income" rows={otherInc} colorcls="rv-cr" /><div className="rrow rtot"><span style={{ flex: 1 }}>TOTAL INCOME</span><span className="rv rv-cr" style={{ width: 140, textAlign: 'right' }}>{fmtN(fin.income)}</span></div></div></div>
        <div className="card"><div className="card-hd"><div className="card-title">Expenditure</div></div><div style={{ padding: '8px 0' }}><S title="Cost of Goods Sold" rows={cogs} colorcls="rv-dr" /><S title="Direct Expenses" rows={dExp} colorcls="rv-dr" /><S title="Indirect Expenses" rows={iExp} colorcls="rv-dr" /><div className="rrow rtot"><span style={{ flex: 1 }}>TOTAL EXPENSES</span><span className="rv rv-dr" style={{ width: 140, textAlign: 'right' }}>{fmtN(fin.cogs + fin.opex)}</span></div></div></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '14px 18px', borderRight: '1px solid var(--bd)' }}><div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>GROSS PROFIT</div><div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: fin.income - fin.cogs >= 0 ? 'var(--gr)' : 'var(--rd)' }}>{fmt(Math.abs(fin.income - fin.cogs))} {fin.income - fin.cogs >= 0 ? '(Profit)' : '(Loss)'}</div></div>
          <div style={{ padding: '14px 18px' }}><div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>NET PROFIT / (LOSS)</div><div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: fin.netProfit >= 0 ? 'var(--gr)' : 'var(--rd)' }}>{fmt(Math.abs(fin.netProfit))} {fin.netProfit >= 0 ? '(Profit)' : '(Loss)'}</div></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BALANCE SHEET
// ============================================================
function BalanceSheet({ ledgers, getLedgerBalance, groupMap, fin }) {
  const getRows = (ids) => ledgers.filter(l => ids.includes(l.groupId)).map(l => ({ ...l, bal: Math.abs(getLedgerBalance(l.id)) })).filter(l => l.bal > 0);
  const cap = getRows(['g1']), loans = getRows(['g2']), cred = getRows(['g3']), curL = getRows(['g4', 'g15']);
  const fixed = getRows(['g5']), curA = getRows(['g6', 'g8', 'g9']), deb = getRows(['g7']);
  const np = fin.netProfit, liabTot = fin.totalLiab + (np > 0 ? np : 0), assetTot = fin.totalAssets;
  const GB = ({ title, rows, extra }) => (
    <div style={{ marginBottom: 10 }}>
      <div className="rrow rhead" style={{ padding: '6px 14px' }}><span style={{ flex: 1 }}>{title}</span><span className="rv" style={{ width: 120, textAlign: 'right' }}>AMOUNT</span></div>
      {rows.map(r => <div key={r.id} className="rrow rsub" style={{ padding: '5px 14px 5px 24px' }}><span style={{ flex: 1 }}>{r.name}</span><span className="rv" style={{ width: 120, textAlign: 'right' }}>{fmtN(r.bal)}</span></div>)}
      {extra}
      <div className="rrow" style={{ padding: '5px 14px', background: 'rgba(37,42,56,.15)' }}><span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11 }}></span><span className="rv" style={{ width: 120, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx2)', fontWeight: 600 }}>{fmtN(rows.reduce((s, r) => s + r.bal, 0) + (extra ? Math.max(np, 0) : 0))}</span></div>
    </div>
  );
  return (
    <div className="page">
      <div className="card">
        <div className="card-hd"><div className="card-title">Balance Sheet — As on {fmtDate(todayStr())}</div><div className="card-act"><span style={{ fontSize: 11, color: Math.abs(assetTot - liabTot) < 10 ? 'var(--gr)' : 'var(--rd)', fontFamily: 'var(--mono)' }}>{Math.abs(assetTot - liabTot) < 10 ? '✓ Tallied' : '✗ Diff: ' + fmt(Math.abs(assetTot - liabTot))}</span></div></div>
        <div className="bal-box">
          <div className="bal-col"><div className="bal-col-title">Liabilities & Equity</div>
            <GB title="Capital Account" rows={cap} extra={np !== 0 && <div className="rrow rsub" style={{ padding: '5px 14px 5px 24px' }}><span style={{ flex: 1 }}>Add: Net {np >= 0 ? 'Profit' : 'Loss'}</span><span className="rv" style={{ width: 120, textAlign: 'right', color: np >= 0 ? 'var(--gr)' : 'var(--rd)' }}>{fmtN(Math.abs(np))}</span></div>} />
            <GB title="Loans" rows={loans} /><GB title="Sundry Creditors" rows={cred} /><GB title="Current Liabilities" rows={curL} />
            <div className="rrow rtot"><span style={{ flex: 1 }}>TOTAL LIABILITIES</span><span className="rv rv-dr" style={{ width: 120, textAlign: 'right' }}>{fmtN(liabTot)}</span></div>
          </div>
          <div className="bal-col"><div className="bal-col-title">Assets</div>
            <GB title="Fixed Assets" rows={fixed} /><GB title="Current Assets & Bank" rows={curA} /><GB title="Sundry Debtors" rows={deb} />
            <div className="rrow rtot"><span style={{ flex: 1 }}>TOTAL ASSETS</span><span className="rv rv-cr" style={{ width: 120, textAlign: 'right' }}>{fmtN(assetTot)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GST REPORT
// ============================================================
function GSTReport({ vouchers, ledgerMap }) {
  const [tab, setTab] = useState('gstr1');
  const sv = vouchers.filter(v => v.type === 'Sales'), pv = vouchers.filter(v => v.type === 'Purchase');
  const g1 = sv.reduce((s, v) => s + v.gstAmount, 0), g2 = pv.reduce((s, v) => s + v.gstAmount, 0), net = g1 - g2;
  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        {[{ l: 'GST on Sales (Output)', v: fmt(g1), c: 'var(--gr)' }, { l: 'GST on Purchase (Input)', v: fmt(g2), c: 'var(--ac2)' }, { l: 'Net GST Payable', v: fmt(Math.abs(net)) + ' ' + (net >= 0 ? 'Payable' : 'Refund'), c: net >= 0 ? 'var(--warn)' : 'var(--gr)' }].map((k, i) => (
          <div key={i} className="kpi"><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c }}></div><div className="kpi-lbl">{k.l}</div><div className="kpi-val" style={{ color: k.c }}>{k.v}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="tabs"><div className={`tab ${tab === 'gstr1' ? 'act' : ''}`} onClick={() => setTab('gstr1')}>GSTR-1 (Sales)</div><div className={`tab ${tab === 'gstr2' ? 'act' : ''}`} onClick={() => setTab('gstr2')}>GSTR-2 (Purchase)</div><div className={`tab ${tab === 'sum' ? 'act' : ''}`} onClick={() => setTab('sum')}>Summary</div></div>
        {tab !== 'sum' && <div className="tw"><table>
          <thead><tr><th>Voucher No.</th><th>Date</th><th>Party</th><th>Item</th><th>HSN</th><th>Taxable</th><th>GST%</th><th>CGST</th><th>SGST</th><th>Total Tax</th></tr></thead>
          <tbody>{(tab === 'gstr1' ? sv : pv).map(v => (v.items || []).length > 0 ? v.items.map((it, i) => (
            <tr key={v.id + i}>
              <td className="td-m">{i === 0 ? v.no : '↳'}</td><td className="td-m">{i === 0 ? fmtDate(v.date) : ''}</td>
              <td className="td-p">{i === 0 ? (ledgerMap[v.party]?.name || '—') : ''}</td>
              <td style={{ color: 'var(--tx)' }}>{it.name}</td><td className="td-m">{it.hsn}</td>
              <td className="td-m">{fmtN(it.taxable)}</td><td style={{ color: 'var(--ac2)' }}>{it.gstRate}%</td>
              <td className="td-m">{fmtN(it.gstAmt / 2)}</td><td className="td-m">{fmtN(it.gstAmt / 2)}</td>
              <td className="td-dr">{fmtN(it.gstAmt)}</td>
            </tr>
          )) : (
            <tr key={v.id}><td className="td-m">{v.no}</td><td className="td-m">{fmtDate(v.date)}</td><td className="td-p">{ledgerMap[v.party]?.name || '—'}</td><td style={{ fontStyle: 'italic', color: 'var(--tx3)' }}>No items</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="td-dr">{fmtN(v.gstAmount)}</td></tr>
          ))}</tbody>
        </table></div>}
        {tab === 'sum' && <div style={{ padding: 16 }}>
          {[0, 5, 12, 18, 28].map(rate => {
            const sti = sv.flatMap(v => v.items || []).filter(i => i.gstRate == rate);
            const pti = pv.flatMap(v => v.items || []).filter(i => i.gstRate == rate);
            const stax = sti.reduce((s, i) => s + (i.gstAmt || 0), 0), ptax = pti.reduce((s, i) => s + (i.gstAmt || 0), 0);
            if (!stax && !ptax) return null;
            return <div key={rate} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--bd)', alignItems: 'center' }}>
              <span className="tag" style={{ background: 'rgba(0,153,255,.1)', color: 'var(--ac2)' }}>{rate}% GST</span>
              <span style={{ fontSize: 11, color: 'var(--tx2)' }}>Output: <b style={{ color: 'var(--gr)', fontFamily: 'var(--mono)' }}>{fmt(stax)}</b></span>
              <span style={{ fontSize: 11, color: 'var(--tx2)' }}>Input: <b style={{ color: 'var(--ac2)', fontFamily: 'var(--mono)' }}>{fmt(ptax)}</b></span>
              <span style={{ fontSize: 11, color: 'var(--tx2)' }}>Net: <b style={{ color: stax - ptax >= 0 ? 'var(--warn)' : 'var(--gr)', fontFamily: 'var(--mono)' }}>{fmt(Math.abs(stax - ptax))} {stax - ptax >= 0 ? 'Pay' : 'Refund'}</b></span>
            </div>;
          })}
          <div style={{ marginTop: 14, padding: '12px 0', borderTop: '2px solid var(--bd)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: 'var(--tx3)' }}>NET GST LIABILITY</span><span style={{ color: net >= 0 ? 'var(--warn)' : 'var(--gr)' }}>{fmt(Math.abs(net))} {net >= 0 ? 'Payable' : 'Refund'}</span>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ============================================================
// STOCK ITEMS
// ============================================================
function StockItems({ stock, search, onNew, onEdit, onDelete }) {
  const filtered = stock.filter(s => { const q = search.toLowerCase(); return !q || s.name.toLowerCase().includes(q) || s.hsn?.toLowerCase().includes(q) || s.group?.toLowerCase().includes(q); });
  const totalValue = stock.reduce((s, i) => s + (i.qty * i.rate), 0);
  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[{ l: 'Total Items', v: stock.length, c: 'var(--ac)' }, { l: 'Total Stock Value', v: fmt(totalValue), c: 'var(--ac2)' }, { l: 'Low Stock (<100)', v: stock.filter(s => s.qty < 100).length, c: 'var(--warn)' }].map((k, i) => (
          <div key={i} className="kpi"><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c }}></div><div className="kpi-lbl">{k.l}</div><div className="kpi-val" style={{ color: k.c }}>{k.v}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="card-hd"><div className="card-title">Stock Items</div><div className="card-act"><button className="btn btn-p btn-sm" onClick={onNew}>+ New Item</button></div></div>
        <div className="tw"><table>
          <thead><tr><th>Item Name</th><th>Group</th><th>HSN</th><th>Unit</th><th>Rate</th><th>Quantity</th><th>GST%</th><th>Stock Value</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(s => (
            <tr key={s.id}>
              <td className="td-p">{s.name}</td><td style={{ fontSize: 11, color: 'var(--tx3)' }}>{s.group}</td>
              <td className="td-m">{s.hsn}</td><td style={{ color: 'var(--tx2)' }}>{s.unit}</td>
              <td className="td-m">{fmtN(s.rate)}</td>
              <td style={{ color: s.qty < 100 ? 'var(--warn)' : 'var(--tx2)', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: s.qty < 100 ? 600 : 400 }}>{s.qty.toLocaleString('en-IN')} {s.qty < 100 ? '⚠' : ''}</td>
              <td style={{ color: 'var(--ac2)' }}>{s.gstRate}%</td>
              <td className="td-m" style={{ color: 'var(--gr)' }}>{fmtN(s.qty * s.rate)}</td>
              <td><div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ic btn-o btn-sm" onClick={() => onEdit(s)}>{I.edit}</button>
                <button className="btn btn-ic btn-d btn-sm" onClick={() => onDelete(s.id)}>{I.del}</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

// ============================================================
// STOCK MODAL
// ============================================================
function StockModal({ data, onSave, onClose }) {
  const [s, setS] = useState({ name: '', unit: 'PCS', rate: 0, qty: 0, hsn: '', gstRate: 18, group: 'Finished Goods', ...data });
  const [err, setErr] = useState('');
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod" style={{ maxWidth: 520 }}>
        <div className="mod-hd"><div className="mod-title">{data.id ? 'Edit' : 'New'} Stock Item</div><button className="mod-cl" onClick={onClose}>×</button></div>
        <div className="mod-bd">
          {err && <div className="alert-w">{err}</div>}
          <div className="fg"><label className="flbl">Item Name *</label><input className="fc" value={s.name} onChange={e => setS(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="g2">
            <div className="fg"><label className="flbl">HSN Code</label><input className="fc" value={s.hsn} onChange={e => setS(p => ({ ...p, hsn: e.target.value }))} /></div>
            <div className="fg"><label className="flbl">Unit</label><select className="fc" value={s.unit} onChange={e => setS(p => ({ ...p, unit: e.target.value }))}>{['PCS', 'KG', 'MTR', 'LTR', 'BOX', 'SET', 'NOS', 'TON'].map(u => <option key={u}>{u}</option>)}</select></div>
          </div>
          <div className="g3">
            <div className="fg"><label className="flbl">Rate (₹)</label><input type="number" className="fc" value={s.rate} min="0" step="0.01" onChange={e => setS(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="fg"><label className="flbl">Opening Qty</label><input type="number" className="fc" value={s.qty} min="0" onChange={e => setS(p => ({ ...p, qty: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="fg"><label className="flbl">GST %</label><select className="fc" value={s.gstRate} onChange={e => setS(p => ({ ...p, gstRate: parseFloat(e.target.value) }))}>{[0, 3, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}</select></div>
          </div>
          <div className="fg"><label className="flbl">Group</label><select className="fc" value={s.group} onChange={e => setS(p => ({ ...p, group: e.target.value }))}>{['Raw Materials', 'Finished Goods', 'Semi-Finished', 'Consumables', 'Packing Material'].map(g => <option key={g}>{g}</option>)}</select></div>
          <div className="sum-box"><span className="sum-lbl">Stock Value</span><span className="sum-val text-gr">{fmt(s.qty * s.rate)}</span></div>
        </div>
        <div className="mod-ft">
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => { if (!s.name.trim()) { setErr('Name required'); return; } onSave(s); }}>Save Item</button>
        </div>
      </div>
    </div>
  );
}
