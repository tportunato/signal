import { useState, useCallback } from "react";

// ── Pre-loaded API key — boots straight to dashboard ──────────────────────
const OIL_API_KEY = "9f57ab58e3859f81ef130a1e7a559c6a005cd73e7fcd7e06eb1225e3d9ae993e";

// ── Brand tokens ───────────────────────────────────────────────────────────
const B = {
  navy:           "#0F2744",
  terracotta:     "#C8692A",
  terracottaTint: "#FBF0E9",
  terracottaDark: "#7A3A12",
  white:          "#FFFFFF",
  offWhite:       "#F7F5F1",
  body:           "#555555",
  muted:          "#888888",
  border:         "#E8E5DE",
  successBg:      "#E8F5EE",
  successText:    "#1a6b3a",
  warningBg:      "#FEF5E7",
  warningText:    "#7a5200",
  dangerBg:       "#FEECEC",
  dangerText:     "#7a1a1a",
  infoBg:         "#E8EDF3",
  infoText:       "#0F2744",
};

// ── Commodity catalogue ────────────────────────────────────────────────────
const COMMODITIES = {
  WTI_USD:         { name:"WTI Crude",   unit:"USD/bbl",   currency:"$", region:"US Gulf Coast" },
  BRENT_CRUDE_USD: { name:"Brent Crude", unit:"USD/bbl",   currency:"$", region:"North Sea" },
  NATURAL_GAS_USD: { name:"Natural Gas", unit:"USD/MMBtu", currency:"$", region:"Henry Hub, US" },
  DUTCH_TTF_EUR:   { name:"Dutch TTF",   unit:"EUR/MWh",   currency:"€", region:"TTF Hub, NL" },
  HEATING_OIL_USD: { name:"Heating Oil", unit:"USD/gal",   currency:"$", region:"New York Harbor" },
  LNG_USD:         { name:"LNG",         unit:"USD/MMBtu", currency:"$", region:"Global" },
};

const ACTIVE = ["WTI_USD","BRENT_CRUDE_USD","NATURAL_GAS_USD","DUTCH_TTF_EUR","HEATING_OIL_USD","LNG_USD"];

// ── Severity config ────────────────────────────────────────────────────────
const SEVERITY = {
  5:{ label:"Critical", bg:B.dangerBg,  text:B.dangerText  },
  4:{ label:"High",     bg:"#FEF0E7",   text:"#7a3a00"     },
  3:{ label:"Medium",   bg:B.warningBg, text:B.warningText },
  2:{ label:"Low",      bg:B.infoBg,    text:B.infoText    },
  1:{ label:"Watch",    bg:B.offWhite,  text:B.muted       },
};

// ── News status config ─────────────────────────────────────────────────────
const NEWS_STATUS = {
  UNEXPLAINED: { label:"Unexplained",          bg:B.dangerBg,  text:B.dangerText  },
  PARTIAL:     { label:"Partially explained",  bg:B.warningBg, text:B.warningText },
  EXPLAINED:   { label:"Explained",            bg:B.successBg, text:B.successText },
};

const ANOMALY_TYPES = {
  SPREAD_EXTREME:    "Spread extreme",
  CORRELATION_BREAK: "Correlation breakdown",
  MACRO_DECOUPLING:  "Macro decoupling",
  VOLATILITY_SPIKE:  "Volatility spike",
};

// ── Fake price snapshot ────────────────────────────────────────────────────
const FAKE_PRICES = {
  WTI_USD:         { cur:74.52,  chg:-1.10, currency:"$" },
  BRENT_CRUDE_USD: { cur:79.86,  chg:-0.77, currency:"$" },
  NATURAL_GAS_USD: { cur:3.87,   chg:+3.20, currency:"$" },
  DUTCH_TTF_EUR:   { cur:34.20,  chg:+4.27, currency:"€" },
  HEATING_OIL_USD: { cur:2.71,   chg:-0.37, currency:"$" },
  LNG_USD:         { cur:14.20,  chg:+4.03, currency:"$" },
};

// ── THE DEMO SCENARIO ──────────────────────────────────────────────────────
// Four signals: Unexplained → Unexplained → Partial → Explained
// Ordered by severity descending, news states deliberately varied
const DEMO_SIGNALS = [
  {
    id: "brent_wti_spread",
    type: ANOMALY_TYPES.SPREAD_EXTREME,
    severity: 5,
    headline: "Brent/WTI spread at 2.4σ above 6-day mean — $5.34/bbl vs $2.91 average",
    dataPoints: {
      current:   "$5.34/bbl",
      average:   "$2.91/bbl",
      z_score:   "2.4σ",
      direction: "Wide — Brent premium expanding",
    },
    thesis: {
      news_status: "UNEXPLAINED",
      news_summary: "No relevant news catalyst identified. Searched: Red Sea shipping, Brent crude supply disruption, WTI inventory, North Sea production outage. No material headlines found that account for a spread of this magnitude.",
      news_headlines: [],
      happening: "The Brent/WTI spread has widened to $5.34/bbl — 2.4σ above its 6-day mean of $2.91/bbl — a deviation that has historically reverted within 3–5 sessions absent a structural supply event.",
      explains: "With no identifiable news catalyst, the most plausible interpretation is aggressive speculative positioning in Brent futures ahead of an anticipated OPEC+ announcement, creating a temporary dislocation from WTI that supply fundamentals do not currently support.",
      invalidates: "Any OPEC+ statement clarifying production quotas, or a normalisation of the spread back below $3.50/bbl within the next two sessions, would suggest positioning rather than structural supply dynamics drove the move.",
    },
  },
  {
    id: "ttf_henry_divergence",
    type: ANOMALY_TYPES.CORRELATION_BREAK,
    severity: 4,
    headline: "TTF rallying +4.3% while Henry Hub declines −1.1% — 5.4pp directional divergence",
    dataPoints: {
      ttf_move:   "+4.3% (7d)",
      henry_move: "−1.1% (7d)",
      divergence: "5.4pp gap",
      note:       "LNG arb typically keeps these correlated",
    },
    thesis: {
      news_status: "UNEXPLAINED",
      news_summary: "No news catalyst identified for the magnitude of this divergence. Searched: European gas storage, LNG terminal flows, TTF price spike, Henry Hub production. Storage reports are within seasonal norms; no terminal disruptions reported.",
      news_headlines: [],
      happening: "TTF has gained 4.3% over 7 days while Henry Hub has declined 1.1% — a 5.4pp directional divergence that breaks the LNG arbitrage-driven correlation that has held through Q1.",
      explains: "The absence of a storage or supply catalyst suggests early institutional pre-positioning ahead of the Q2 injection season, with European buyers locking in forward gas at a premium to US spot — a structural flow that temporarily overrides the arb mechanism.",
      invalidates: "A confirmed uptick in US LNG export utilisation above 95% capacity, or European storage injection data materially above the 5-year seasonal average, would suggest the divergence is transitory and driven by flow timing rather than a repricing of European gas risk.",
    },
  },
  {
    id: "dxy_crude_decoupling",
    type: ANOMALY_TYPES.MACRO_DECOUPLING,
    severity: 3,
    headline: "DXY strengthening +0.42 points while WTI holds flat — inverse relationship breaking down",
    dataPoints: {
      dxy_move:   "+0.42 (session)",
      crude_move: "−0.3% (session)",
      expected:   "Inverse — USD strength pressures crude",
      signal:     "Supply-side bid offsetting dollar headwind?",
    },
    thesis: {
      news_status: "PARTIAL",
      news_summary: "FOMC minutes released this week showed a more hawkish tone than consensus, driving DXY strength. However, this does not explain crude's resilience — the dollar move alone would typically pressure WTI by 0.8–1.2%.",
      news_headlines: [
        "Fed minutes signal higher-for-longer rate stance, dollar firms — Financial Times",
        "OPEC+ compliance tracked at 96% in February, above target — S&P Global Commodity Insights",
      ],
      happening: "DXY has strengthened 0.42 points this session while WTI has declined only 0.3% — a much smaller crude move than the established inverse relationship would predict, suggesting an independent bid under crude prices.",
      explains: "FOMC hawkishness explains the dollar strength, but OPEC+ supply discipline — tracked at 96% compliance — appears to be providing a price floor that is partially neutralising the macro headwind, creating a temporary decoupling between dollar and crude dynamics.",
      invalidates: "A sustained DXY rally above 105 without a corresponding OPEC+ supply cut announcement would likely reassert the inverse relationship; crude breaking below $73/bbl would confirm the dollar effect has overwhelmed the supply support.",
    },
  },
  {
    id: "vol_spike_LNG",
    type: ANOMALY_TYPES.VOLATILITY_SPIKE,
    severity: 3,
    headline: "LNG 7-day price range at 12.4% — significantly elevated vs recent baseline",
    dataPoints: {
      high:      "$14.60",
      low:       "$12.80",
      range_pct: "12.4%",
      current:   "$14.20",
    },
    thesis: {
      news_status: "EXPLAINED",
      news_summary: "Multiple converging catalysts identified: a surprise cold snap across Northeast Asia drove spot LNG demand above seasonal forecasts, while an unplanned outage at the Sabine Pass LNG terminal temporarily tightened US export supply.",
      news_headlines: [
        "Northeast Asia cold snap drives LNG spot demand to 3-month high — Reuters Energy",
        "Sabine Pass LNG terminal reports partial production outage, export volumes affected — Bloomberg Commodities",
        "Global LNG spot prices surge as Asian buyers re-enter market — S&P Global Platts",
      ],
      happening: "LNG's 7-day price range of 12.4% — from $12.80 to $14.60 — places realised volatility significantly above the 4–6% baseline that characterised January and February trading.",
      explains: "Simultaneous demand-side pressure from an Asian cold snap and supply-side constraint from the Sabine Pass outage created a temporary supply-demand imbalance that amplified intraday and interday price moves beyond what either factor alone would have driven.",
      invalidates: "Restoration of full Sabine Pass capacity and a return of Northeast Asian temperatures to seasonal norms within the next 10 days would be expected to compress realised volatility back toward the 5% baseline as the supply-demand imbalance resolves.",
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmtTime = d => d ? d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"}) : "";

// ── Inline tag ─────────────────────────────────────────────────────────────
function Tag({ type }) {
  const cfg = {
    DATA:      { bg:"#E0F2F1", text:"#00695c" },
    INFERENCE: { bg:B.warningBg, text:B.warningText },
  }[type] || { bg:B.offWhite, text:B.muted };
  return (
    <span style={{ background:cfg.bg, color:cfg.text, fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, letterSpacing:"0.05em", marginRight:6, display:"inline-block", verticalAlign:"middle" }}>
      {type}
    </span>
  );
}

// ── Pipeline indicator ─────────────────────────────────────────────────────
function Pipeline({ stages, current }) {
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {stages.map((s,i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:i<stages.length-1?1:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:130 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:done?B.successText:active?B.terracotta:B.border, color:done||active?"#fff":B.muted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, transition:"all 0.4s" }}>
                {done ? "✓" : active ? (
                  <span style={{ display:"inline-block", width:12, height:12, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                ) : i+1}
              </div>
              <span style={{ fontSize:10, color:active?B.terracotta:done?B.successText:B.muted, fontWeight:active?600:400, textAlign:"center", lineHeight:1.3 }}>{s}</span>
            </div>
            {i<stages.length-1 && (
              <div style={{ flex:1, height:1, background:done?B.successText:B.border, margin:"0 4px", marginBottom:18, transition:"background 0.4s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── News status badge ──────────────────────────────────────────────────────
function NewsStatusBadge({ status }) {
  const cfg = NEWS_STATUS[status] || NEWS_STATUS.UNEXPLAINED;
  return (
    <span style={{ background:cfg.bg, color:cfg.text, fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:20, letterSpacing:"0.04em", display:"inline-flex", alignItems:"center" }}>
      {cfg.label}
    </span>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ width="100%", height=13 }) {
  return (
    <div style={{ height, width, borderRadius:4, background:"linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
  );
}

// ── Signal card ────────────────────────────────────────────────────────────
function SignalCard({ signal, thesis, loading, visible }) {
  const [expanded, setExpanded] = useState(true);
  const sev     = SEVERITY[signal.severity] || SEVERITY[1];
  const newsCfg = thesis ? (NEWS_STATUS[thesis.news_status] || NEWS_STATUS.UNEXPLAINED) : null;

  if (!visible) return null;

  return (
    <div style={{ background:"#fff", border:`0.5px solid ${B.border}`, borderLeft:`3px solid ${sev.text}`, borderRadius:12, overflow:"hidden", marginBottom:16, animation:"fadeSlideIn 0.4s ease" }}>
      <style>{`@keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div onClick={()=>setExpanded(p=>!p)} style={{ padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:20, background:sev.bg, color:sev.text, letterSpacing:"0.05em", textTransform:"uppercase" }}>{sev.label}</span>
            <span style={{ fontSize:10, fontWeight:500, padding:"3px 10px", borderRadius:20, background:B.infoBg, color:B.infoText }}>{signal.type}</span>
            {thesis && <NewsStatusBadge status={thesis.news_status} />}
            {loading && (
              <span style={{ fontSize:10, color:B.muted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ display:"inline-block", width:10, height:10, border:`1.5px solid ${B.border}`, borderTop:`1.5px solid ${B.terracotta}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                Researching news…
              </span>
            )}
          </div>
          <div style={{ fontSize:14, fontWeight:500, color:B.navy, lineHeight:1.45 }}>{signal.headline}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:600, color:sev.text }}>{signal.severity}</div>
            <div style={{ fontSize:9, color:B.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>/ 5</div>
          </div>
          <span style={{ color:B.muted, fontSize:14, display:"inline-block", transform:expanded?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop:`0.5px solid ${B.border}` }}>

          {/* Data points */}
          <div style={{ padding:"16px 20px 0" }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(signal.dataPoints).map(([k,v])=>(
                <div key={k} style={{ background:B.offWhite, borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ fontSize:9, color:B.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{k.replace(/_/g," ")}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:B.navy }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* News context */}
          <div style={{ margin:"16px 20px 0" }}>
            {loading && (
              <div style={{ background:B.offWhite, borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ display:"inline-block", width:14, height:14, border:`2px solid ${B.border}`, borderTop:`2px solid ${B.terracotta}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:B.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>News research</div>
                  <div style={{ fontSize:12, color:B.muted }}>Searching for relevant news catalysts…</div>
                </div>
              </div>
            )}

            {!loading && thesis && (
              <div style={{ background:newsCfg.bg, border:`0.5px solid ${newsCfg.text}22`, borderRadius:8, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:B.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>News context</div>
                  <NewsStatusBadge status={thesis.news_status} />
                </div>
                <div style={{ fontSize:13, color:B.body, lineHeight:1.6, marginBottom:thesis.news_headlines?.length?10:0 }}>
                  {thesis.news_summary}
                </div>
                {thesis.news_headlines?.length>0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {thesis.news_headlines.map((h,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                        <span style={{ color:newsCfg.text, fontSize:11, flexShrink:0, marginTop:1 }}>→</span>
                        <span style={{ fontSize:12, color:B.body, lineHeight:1.45, fontStyle:"italic" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
                {thesis.news_status==="UNEXPLAINED" && (
                  <div style={{ marginTop:10, padding:"8px 12px", background:B.dangerBg, borderRadius:6, fontSize:12, color:B.dangerText, fontWeight:500 }}>
                    ⚡ No news catalyst identified — anomaly may represent a genuine unpriced signal.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI thesis */}
          <div style={{ margin:"12px 20px 20px" }}>
            <div style={{ background:B.offWhite, borderRadius:8, padding:16 }}>
              <div style={{ fontSize:10, fontWeight:600, color:B.terracotta, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>AI thesis</div>

              {loading && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <Skeleton width="90%" /><Skeleton width="75%" /><Skeleton width="85%" />
                  <Skeleton width="90%" /><Skeleton width="70%" />
                  <Skeleton width="85%" /><Skeleton width="78%" />
                </div>
              )}

              {!loading && thesis && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {[
                    { key:"happening",   label:"What's happening",   tag:"DATA"      },
                    { key:"explains",    label:"What explains it",    tag:"INFERENCE" },
                    { key:"invalidates", label:"What invalidates it", tag:"INFERENCE" },
                  ].map(row=>(
                    <div key={row.key} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ flexShrink:0, paddingTop:1 }}><Tag type={row.tag} /></div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:600, color:B.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{row.label}</div>
                        <div style={{ fontSize:13, color:B.body, lineHeight:1.6 }}>{thesis[row.key]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary bar (shown after full run) ───────────────────────────────────
function SummaryBar({ signals, theses }) {
  if (signals.length===0) return null;
  const counts = { UNEXPLAINED:0, PARTIAL:0, EXPLAINED:0 };
  signals.forEach(s=>{ if(theses[s.id]) counts[theses[s.id].news_status]++; });
  const maxSev = Math.max(...signals.map(s=>s.severity));
  const sevCfg = SEVERITY[maxSev];
  return (
    <div style={{ background:B.navy, borderRadius:12, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Signals detected</div>
          <div style={{ fontSize:22, fontWeight:600, color:"#fff" }}>{signals.length}</div>
        </div>
        <div style={{ width:1, height:32, background:"rgba(255,255,255,0.12)" }} />
        <div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Peak severity</div>
          <span style={{ fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20, background:sevCfg.bg, color:sevCfg.text }}>{sevCfg.label} · {maxSev}/5</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {Object.entries(counts).map(([status,count])=>{
          if (count===0) return null;
          const cfg = NEWS_STATUS[status];
          return (
            <div key={status} style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:600, color:"#fff" }}>{count}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function Signal() {
  const [dismissBanner, setDismissBanner] = useState(false);

  // Analysis state
  const [running, setRunning]               = useState(false);
  const [pipelineStage, setPipelineStage]   = useState(-1);
  const [visibleSignals, setVisibleSignals] = useState([]);
  const [theses, setTheses]                 = useState({});
  const [thesesLoading, setThesesLoading]   = useState({});
  const [hasRun, setHasRun]                 = useState(false);
  const [lastRun, setLastRun]               = useState(null);

  const STAGES = ["Fetching prices", "Computing signals", "Researching news & generating theses"];

  // ── Live price fetch using hardcoded key ──────────────────────────────────
  const fetchLivePrices = useCallback(async () => {
    const results = {};
    await Promise.all(ACTIVE.map(async code => {
      try {
        const r = await fetch(`https://api.oilpriceapi.com/v1/prices/latest?by_code=${code}`, {
          headers:{ Authorization:`Token ${OIL_API_KEY}`, "Content-Type":"application/json" },
        });
        const j = await r.json();
        if (j.data?.price) {
          const live  = j.data.price;
          const seed  = FAKE_PRICES[code];
          // Update FAKE_PRICES display with live price, keep demo theses
          if (seed) seed.cur = live;
          results[code] = { fetched: true, price: live };
        }
      } catch {
        // Silently fall back to seed data for this instrument
      }
    }));
    return results;
  }, []);

  // ── Main run ──────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    setRunning(true);
    setVisibleSignals([]);
    setTheses({});
    setThesesLoading({});
    setHasRun(false);

    // Stage 0 — Fetch live prices
    setPipelineStage(0);
    await fetchLivePrices();
    await sleep(400); // small pause so stage feels deliberate

    // Stage 1 — Compute signals
    setPipelineStage(1);
    await sleep(900);

    // Stage 2 — Research + thesis, staggered card-by-card reveal
    setPipelineStage(2);

    for (let i=0; i<DEMO_SIGNALS.length; i++) {
      const signal = DEMO_SIGNALS[i];

      // Show card immediately in loading state
      setVisibleSignals(prev=>[...prev, signal]);
      setThesesLoading(prev=>({...prev, [signal.id]:true}));

      // Simulate news research + thesis generation per card
      const delay = 1400 + Math.random()*600;
      await sleep(delay);

      // Reveal pre-computed thesis
      setTheses(prev=>({...prev, [signal.id]:signal.thesis}));
      setThesesLoading(prev=>({...prev, [signal.id]:false}));

      // Gap before next card
      if (i<DEMO_SIGNALS.length-1) await sleep(300);
    }

    setHasRun(true);
    setLastRun(new Date());
    setRunning(false);
    setPipelineStage(-1);
  }, [fetchLivePrices]);

  // ── Button style ──────────────────────────────────────────────────────────
  const btnPrimary = {
    background:B.terracotta, color:"#fff", border:"none", borderRadius:8,
    padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer",
    fontFamily:"inherit", opacity:running?0.6:1, transition:"opacity 0.2s",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DASHBOARD (boots directly — no onboard screen)
  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  const allThesesLoaded = hasRun && visibleSignals.every(s=>!thesesLoading[s.id]);

  return (
    <div style={{ minHeight:"100vh", background:B.white, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.75)} }
        * { box-sizing:border-box; }
        button:hover { opacity:0.88; }
      `}</style>

      {/* Showcase banner */}
      {!dismissBanner && (
        <div style={{ background:B.terracottaTint, padding:"7px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
          <span style={{ fontSize:11, color:B.terracottaDark }}>
            Portfolio showcase — live price data via Oil Price API. Anomaly detection and news classification are live; theses are pre-computed for demo reliability.
          </span>
          <button onClick={()=>setDismissBanner(true)} style={{ background:"none", border:"none", color:B.terracottaDark, cursor:"pointer", fontSize:14, padding:"0 4px" }}>×</button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ background:B.navy, height:56, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img
            src="https://res.cloudinary.com/dsgfts9gp/image/upload/Gemini_Generated_Image_uao02uao02uao02u-remove-bg-io_mb5sys"
            alt="Tomaso Portunato"
            style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:14, fontWeight:600, color:"#fff" }}>Signal</span>
            <div style={{ width:8, height:8, borderRadius:"50%", background:B.terracotta, animation:"pulse 2s ease-in-out infinite" }} />
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {lastRun && <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Last run {fmtTime(lastRun)}</span>}
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.28)" }}>by Tomaso Portunato</span>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>

        {/* Hero */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:10, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:8 }}>Energy markets · Anomaly detection</div>
          <h1 style={{ fontSize:28, fontWeight:600, color:B.navy, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Signal feed</h1>
          <p style={{ fontSize:14, color:B.body, margin:"0 0 24px", lineHeight:1.65, maxWidth:580 }}>
            Detects spread extremes, correlation breakdowns, macro decouplings and volatility spikes across {ACTIVE.length} instruments. Each anomaly is classified by news catalyst status — <strong style={{color:B.dangerText}}>unexplained</strong> signals flag potential unpriced market dislocations.
          </p>

          {/* Run button + instrument pills */}
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <button style={btnPrimary} onClick={runAnalysis} disabled={running}>
              {running ? (
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ display:"inline-block", width:12, height:12, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  Running…
                </span>
              ) : hasRun ? "Run again →" : "Run analysis →"}
            </button>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {ACTIVE.map(code=>(
                <span key={code} style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:B.infoBg, color:B.infoText, fontWeight:500 }}>
                  {COMMODITIES[code]?.name}
                </span>
              ))}
            </div>
          </div>

          {/* Pipeline indicator */}
          {running && pipelineStage>=0 && (
            <div style={{ marginTop:24, background:B.offWhite, borderRadius:12, padding:"20px 24px" }}>
              <Pipeline stages={STAGES} current={pipelineStage} />
            </div>
          )}
        </div>

        {/* Price snapshot — shown after stage 0 completes */}
        {(hasRun || (running && pipelineStage >= 1)) && (
          <div style={{ background:B.offWhite, borderRadius:12, padding:"16px 20px", marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:12 }}>
              Price snapshot · {lastRun ? fmtTime(lastRun) : fmtTime(new Date())}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {ACTIVE.map(code=>{
                const d    = FAKE_PRICES[code];
                const meta = COMMODITIES[code];
                if (!d||!meta) return null;
                return (
                  <div key={code} style={{ background:"#fff", borderRadius:8, padding:"10px 14px", border:`0.5px solid ${B.border}`, minWidth:110 }}>
                    <div style={{ fontSize:10, color:B.muted, marginBottom:2 }}>{meta.name}</div>
                    <div style={{ fontSize:17, fontWeight:600, color:B.terracotta }}>{d.currency}{d.cur.toFixed(2)}</div>
                    <div style={{ fontSize:11, color:d.chg>=0?B.successText:B.dangerText }}>{d.chg>=0?"▲":"▼"} {Math.abs(d.chg).toFixed(1)}% 7d</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary bar — shown when all theses loaded */}
        {allThesesLoaded && (
          <SummaryBar signals={visibleSignals} theses={theses} />
        )}

        {/* Signal count header */}
        {visibleSignals.length>0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.09em" }}>Detected signals</span>
              <span style={{ fontSize:11, background:B.dangerBg, color:B.dangerText, padding:"2px 8px", borderRadius:20, fontWeight:600 }}>{visibleSignals.length}</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:10, color:B.muted }}>News classification:</span>
              {Object.entries(NEWS_STATUS).map(([k,v])=>(
                <span key={k} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:v.bg, color:v.text, fontWeight:500 }}>{v.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Signal cards */}
        {visibleSignals.map(signal=>(
          <SignalCard
            key={signal.id}
            signal={signal}
            thesis={theses[signal.id]}
            loading={!!thesesLoading[signal.id]}
            visible={true}
          />
        ))}

        {/* Pre-run empty state */}
        {!running && visibleSignals.length===0 && (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ fontSize:16, fontWeight:500, color:B.navy, marginBottom:8 }}>No analysis run yet</div>
            <div style={{ fontSize:13, color:B.muted, maxWidth:360, margin:"0 auto", lineHeight:1.65 }}>
              Hit "Run analysis" to fetch live prices, detect anomalies, research news catalysts, and generate structured investment theses — one signal at a time.
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:64, paddingTop:24, borderTop:`0.5px solid ${B.border}` }}>
          <div style={{ fontSize:11, color:B.muted, marginBottom:4 }}>
            Signal detects anomalies from live market data. Theses generated by AI. Not financial advice.
          </div>
          <div style={{ fontSize:11, color:B.muted }}>© 2026 Tomaso Portunato · Geneva</div>
        </div>
      </div>
    </div>
  );
}
