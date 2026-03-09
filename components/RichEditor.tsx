"use client";
import { useEffect, useRef } from "react";

interface Props { value: string; onChange: (v: string) => void; dark: boolean; }

export default function RichEditor({ value, onChange, dark }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Only set innerHTML on first mount — never again (let contentEditable own the DOM)
  useEffect(() => {
    if (!isMounted.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      isMounted.current = true;
    }
  }, []);

  const bg = dark ? "rgba(255,255,255,.04)" : "#fff";
  const fg = dark ? "#fff" : "#111";
  const border = dark ? "rgba(255,255,255,.1)" : "#ddd";
  const toolBg = dark ? "rgba(255,255,255,.06)" : "#f5f5f5";

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    emit();
  }

  function emit() {
    onChange(editorRef.current?.innerHTML || "");
  }

  function setFontSize(size: string) {
    editorRef.current?.focus();
    document.execCommand("fontSize", false, "7");
    editorRef.current?.querySelectorAll('font[size="7"]').forEach(el => {
      (el as HTMLElement).removeAttribute("size");
      (el as HTMLElement).style.fontSize = size;
    });
    emit();
  }

  function insertLink() {
    const url = prompt("Enter URL (include https://):");
    if (url) exec("createLink", url);
  }

  function insertImage() {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  }

  const btnStyle = {
    background: "transparent", border: "none", cursor: "pointer",
    padding: "5px 8px", fontSize: 13, color: fg, borderRadius: 4,
    fontFamily: "inherit", lineHeight: 1,
  } as const;

  const Divider = () => <span style={{ width: 1, height: 18, background: border, display: "inline-block", verticalAlign: "middle", margin: "0 3px" }} />;

  function ToolBtn({ cmd, val, children, title }: { cmd: string; val?: string; children: React.ReactNode; title?: string }) {
    return (
      <button title={title} onMouseDown={e => { e.preventDefault(); exec(cmd, val); }} style={btnStyle}>
        {children}
      </button>
    );
  }

  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
      {/* TOOLBAR */}
      <div style={{ background: toolBg, borderBottom: `1px solid ${border}`, padding: "6px 8px", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>

        <select onMouseDown={e => e.stopPropagation()} onChange={e => { exec("formatBlock", e.target.value); e.target.value = ""; }}
          style={{ background: "transparent", border: "none", color: fg, fontSize: 12, cursor: "pointer", padding: "4px 6px", borderRadius: 4, outline: "none", fontFamily: "inherit" }}>
          <option value="">Format</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>

        <select onMouseDown={e => e.stopPropagation()} onChange={e => { setFontSize(e.target.value); e.target.value = ""; }}
          style={{ background: "transparent", border: "none", color: fg, fontSize: 12, cursor: "pointer", padding: "4px 6px", borderRadius: 4, outline: "none", fontFamily: "inherit" }}>
          <option value="">Size</option>
          {["12px","14px","16px","18px","20px","24px","28px","32px","40px"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select onMouseDown={e => e.stopPropagation()} onChange={e => { exec("fontName", e.target.value); e.target.value = ""; }}
          style={{ background: "transparent", border: "none", color: fg, fontSize: 12, cursor: "pointer", padding: "4px 6px", borderRadius: 4, outline: "none", fontFamily: "inherit" }}>
          <option value="">Font</option>
          {["Arial","Georgia","Verdana","Courier New","Times New Roman"].map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <Divider />
        <ToolBtn cmd="bold" title="Bold"><strong>B</strong></ToolBtn>
        <ToolBtn cmd="italic" title="Italic"><em>I</em></ToolBtn>
        <ToolBtn cmd="underline" title="Underline"><u>U</u></ToolBtn>
        <ToolBtn cmd="strikeThrough" title="Strikethrough"><s>S</s></ToolBtn>

        <Divider />
        <ToolBtn cmd="justifyLeft" title="Left">⬅</ToolBtn>
        <ToolBtn cmd="justifyCenter" title="Center">↔</ToolBtn>
        <ToolBtn cmd="justifyRight" title="Right">➡</ToolBtn>

        <Divider />
        <ToolBtn cmd="insertUnorderedList" title="Bullet list">• List</ToolBtn>
        <ToolBtn cmd="insertOrderedList" title="Numbered list">1. List</ToolBtn>

        <Divider />
        {/* Text color */}
        <label title="Text color" style={{ ...btnStyle, position: "relative", display: "inline-flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, borderBottom: `2px solid #34d399` }}>A</span>
          <input type="color" defaultValue="#34d399"
            onChange={e => exec("foreColor", e.target.value)}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
        </label>

        {/* Highlight */}
        <label title="Highlight" style={{ ...btnStyle, position: "relative", display: "inline-flex", alignItems: "center" }}>
          <span style={{ background: "#fbbf24", padding: "0 3px", borderRadius: 2, fontSize: 12 }}>H</span>
          <input type="color" defaultValue="#fbbf24"
            onChange={e => exec("hiliteColor", e.target.value)}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
        </label>

        <Divider />
        <button onMouseDown={e => { e.preventDefault(); insertLink(); }} style={btnStyle} title="Insert link">🔗</button>
        <button onMouseDown={e => { e.preventDefault(); insertImage(); }} style={btnStyle} title="Insert image">🖼</button>

        <Divider />
        <ToolBtn cmd="undo" title="Undo">↩</ToolBtn>
        <ToolBtn cmd="redo" title="Redo">↪</ToolBtn>
        <Divider />
        <ToolBtn cmd="removeFormat" title="Clear formatting">✕fmt</ToolBtn>
      </div>

      {/* EDITOR — contentEditable owns the DOM, React never touches innerHTML after mount */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyDown={e => {
          if (e.key === "Tab") { e.preventDefault(); exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); }
        }}
        style={{
          minHeight: 240,
          padding: "14px 16px",
          outline: "none",
          color: fg,
          background: bg,
          fontSize: 15,
          lineHeight: 1.9,
          direction: "ltr",
          textAlign: "left",
          wordBreak: "break-word",
        }}
      />
    </div>
  );
}
