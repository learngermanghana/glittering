import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

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
          borderRadius: 14,
          background: "linear-gradient(135deg, #F59EBC 0%, #BE185D 100%)",
          position: "relative",
          color: "#FFF7ED",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        INT
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            color: "#FDE68A",
            fontSize: 10,
            letterSpacing: "0.06em",
            fontWeight: 800,
          }}
        >
          SPA
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
