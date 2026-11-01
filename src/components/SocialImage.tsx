import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };

export function socialImage({ title, description, label }: { title: string; description: string; label: string }) {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f8f8f6", color: "#18181b", padding: "56px 64px", fontFamily: "sans-serif", borderTop: "12px solid #7c3aed" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 23, color: "#52525b" }}>
        <span>DECK CREATOR</span><span>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
        <div style={{ fontSize: title.length > 65 ? 50 : 64, fontWeight: 700, lineHeight: 1.12, letterSpacing: -2 }}>{title}</div>
        <div style={{ fontSize: 27, lineHeight: 1.4, color: "#52525b", marginTop: 24 }}>{description.length > 175 ? `${description.slice(0, 172)}…` : description}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #d4d4d8", paddingTop: 22, fontSize: 22 }}>
        <span>decks.zboina.pl</span><span style={{ color: "#7c3aed" }}>Wiedza, do której możesz wracać.</span>
      </div>
    </div>,
    socialImageSize,
  );
}
