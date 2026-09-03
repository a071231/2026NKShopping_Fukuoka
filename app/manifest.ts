import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "福岡旅行 2026",
    short_name: "福岡旅行",
    description: "家庭福岡旅行行程、資訊、記帳與準備清單",
    start_url: "/",
    display: "standalone",
    background_color: "#eef8ff",
    theme_color: "#8cc63f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
