import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** A field mark: a live market struck on the night ground. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050f0b",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 28,
            height: 28,
            borderRadius: 14,
            background: "#2ee27b",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
