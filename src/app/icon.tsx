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
        GS
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#FDE68A",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
