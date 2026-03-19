"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import { useEffect, useCallback, useRef } from "react";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarBtn({ onClick, active, title, children }: any) {
  return (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={title}
      style={{ background: active ? "rgba(52,211,153,.2)" : "transparent", border: active ? "1px solid rgba(52,211,153,.4)" : "1px solid transparent", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 13, color: active ? "#34d399" : "var(--fg)", fontFamily: "inherit", fontWeight: 600, lineHeight: 1, transition: "all .15s", minWidth: 28 }}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />;
}

export default function RichPostEditor({ content, onChange, placeholder = "Start writing...", minHeight = 320 }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { style: "color:#34d399;text-decoration:underline;" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
      Image.configure({ HTMLAttributes: { style: "max-width:100%;border-radius:10px;margin:12px 0;" } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate({ editor }) { onChange(editor.getHTML()); },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px;outline:none;padding:16px;font-size:15px;line-height:1.8;color:var(--fg);font-family:system-ui,sans-serif;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  async function insertImageFromFile(file: File) {
    if (!editor) return;
    try {
      const storageRef = ref(storage, `post-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch(e) { alert("Image upload failed."); }
  }

  async function insertImageFromUrl() {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() || 0;
  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--card)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "8px 10px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", background: "rgba(255,255,255,.02)" }}>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><b>B</b></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><i>I</i></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><u>U</u></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">{"<>"}</ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">⬅</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">≡</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">➡</ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• —</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1.</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">"</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">{"{}"}</ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Add link">🔗</ToolbarBtn>
        <Divider />
        {/* Image buttons */}
        <ToolbarBtn onClick={() => imageInputRef.current?.click()} active={false} title="Upload image from device">🖼 Upload</ToolbarBtn>
        <ToolbarBtn onClick={insertImageFromUrl} active={false} title="Insert image from URL">🌐 Image URL</ToolbarBtn>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => e.target.files?.[0] && insertImageFromFile(e.target.files[0])} />
        <Divider />
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">—</ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolbarBtn>
      </div>

      <EditorContent editor={editor} />

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 14px", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,.02)" }}>
        <span style={{ fontSize: 11, color: "var(--sub)" }}>{wordCount} words · {charCount} chars</span>
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: var(--sub); pointer-events: none; height: 0; opacity: .5; }
        .ProseMirror h1 { font-size: 28px; font-weight: 900; margin: 20px 0 10px; color: var(--fg); }
        .ProseMirror h2 { font-size: 22px; font-weight: 800; margin: 18px 0 8px; color: var(--fg); }
        .ProseMirror h3 { font-size: 18px; font-weight: 700; margin: 16px 0 6px; color: var(--fg); }
        .ProseMirror p { margin: 0 0 12px; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 0 0 12px; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror blockquote { border-left: 3px solid #34d399; padding-left: 16px; margin: 16px 0; color: var(--sub); font-style: italic; }
        .ProseMirror code { background: rgba(255,255,255,.08); border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 13px; color: #34d399; }
        .ProseMirror pre { background: #111; border-radius: 10px; padding: 16px; margin: 16px 0; overflow-x: auto; }
        .ProseMirror pre code { background: none; padding: 0; color: #e5e7eb; font-size: 13px; }
        .ProseMirror strong { font-weight: 800; }
        .ProseMirror a { color: #34d399; text-decoration: underline; }
        .ProseMirror hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
        .ProseMirror img { max-width: 100%; border-radius: 10px; margin: 12px 0; cursor: pointer; }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid #34d399; }
      `}</style>
    </div>
  );
}
