"use client";
import { getTagColor } from "../lib/tags";

interface Props {
  tag: string;
  onClick?: () => void;
  small?: boolean;
}

export default function TagBadge({ tag, onClick, small }: Props) {
  const color = getTagColor(tag);
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: small ? "2px 8px" : "3px 10px",
        borderRadius: 999,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        background: color + "18",
        color: color,
        border: `1px solid ${color}33`,
        cursor: onClick ? "pointer" : "default",
        letterSpacing: ".03em",
        transition: "all .2s"
      }}
    >
      #{tag}
    </span>
  );
}
