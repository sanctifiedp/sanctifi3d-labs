"use client";
import { useRef } from "react";

const FONTS = ["Default","Arial","Georgia","Courier New","Verdana","Trebuchet MS"];
const SIZES = ["12px","14px","16px","18px","20px","24px","28px","32px"];
const COLORS = ["#fff","#000","#34d399","#fbbf24","#f472b6","#38bdf8","#f87171","#a78bfa","#fb923c"];

export default function RichEditor({ value, onChange, dark }: { value:string; onChange:(v:string)=>void; dark:boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const fg = dark?"#fff":"#111";
  const border = dark?"rgba(255,255,255,.1)":"#ddd";
  const bg = dark?"rgba(255,255,255,.04)":"#fff";
  const toolBg = dark?"#1a1a1a":"#f5f5f5";

  function exec(cmd:string, val?:string) {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    onChange(ref.current?.innerHTML||"");
  }

  function insertImage() {
    const url = prompt("Image URL:");
    if (url) exec("insertImage", url);
  }

  function insertLink() {
    const url = prompt("Link URL:");
    if (url) exec("createLink", url);
  }

  const btn = (label:string, cmd:string, val?:string) => (
    <button key={label} onMouseDown={e=>{ e.preventDefault(); exec(cmd,val); }}
      title={label}
      style={{ background:"transparent", border:"none", color:fg, cursor:"pointer", padding:"4px 7px", fontSize:13, borderRadius:4, fontFamily:"inherit" }}>
      {label}
    </button>
  );

  return (
    <div style={{ border:`1px solid ${border}`, borderRadius:10, overflow:"hidden" }}>
      {/* TOOLBAR */}
      <div style={{ background:toolBg, padding:"6px 8px", display:"flex", flexWrap:"wrap", gap:2, borderBottom:`1px solid ${border}`, alignItems:"center" }}>
        {/* Headings */}
        {[["H1","1"],["H2","2"],["H3","3"]].map(([l,v])=>btn(l,"formatBlock",`h${v}`))}
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {/* Font */}
        <select onChange={e=>exec("fontName",e.target.value)} style={{ background:"transparent", border:"none", color:fg, fontSize:12, cursor:"pointer", outline:"none" }}>
          {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        {/* Size */}
        <select onChange={e=>{ exec("fontSize","7"); if(ref.current){ const els=ref.current.querySelectorAll('font[size="7"]'); els.forEach(el=>{ (el as HTMLElement).removeAttribute("size"); (el as HTMLElement).style.fontSize=e.target.value; }); } onChange(ref.current?.innerHTML||""); }} style={{ background:"transparent", border:"none", color:fg, fontSize:12, cursor:"pointer", outline:"none" }}>
          {SIZES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {btn("B","bold")} {btn("I","italic")} {btn("U","underline")} {btn("S","strikeThrough")}
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {btn("≡L","justifyLeft")} {btn("≡C","justifyCenter")} {btn("≡R","justifyRight")}
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {btn("• List","insertUnorderedList")} {btn("1. List","insertOrderedList")}
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {btn("\" Quote","formatBlock","blockquote")}
        <button onMouseDown={e=>{e.preventDefault();insertLink();}} style={{ background:"transparent", border:"none", color:fg, cursor:"pointer", padding:"4px 7px", fontSize:13, borderRadius:4 }}>🔗</button>
        <button onMouseDown={e=>{e.preventDefault();insertImage();}} style={{ background:"transparent", border:"none", color:fg, cursor:"pointer", padding:"4px 7px", fontSize:13, borderRadius:4 }}>🖼️</button>
        {/* Colors */}
        <span style={{ color:border, padding:"0 4px" }}>|</span>
        {COLORS.map(c=>(
          <button key={c} onMouseDown={e=>{e.preventDefault();exec("foreColor",c);}} style={{ background:c, border:"1px solid rgba(128,128,128,.3)", width:16, height:16, borderRadius:"50%", cursor:"pointer", padding:0 }} />
        ))}
      </div>
      {/* EDITOR */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={()=>onChange(ref.current?.innerHTML||"")}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight:260, padding:"16px", color:fg, background:bg, outline:"none", fontSize:15, lineHeight:1.8 }}
      />
    </div>
  );
}
