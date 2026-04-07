"use client";

import { useState } from "react";

export default function Index() {
  const MODEL_LINKS = {
    af1: {
      low: {
        withLogo: {
          white:
            "https://cdn.shopify.com/3d/models/.../airforce1_withLogo_white.glb",
          black:
            "https://cdn.shopify.com/3d/models/.../airforce1_withLogo_black.glb",
        },
        withoutLogo: {
          white:
            "https://cdn.shopify.com/3d/models/.../airforce1_noLogo_white.glb",
          black:
            "https://cdn.shopify.com/3d/models/.../airforce1_noLogo_black.glb",
        },
      },
      mid: {
        withLogo: {
          white:
            "https://cdn.shopify.com/3d/models/.../airforce1_mid_withLogo_white.glb",
          black:
            "https://cdn.shopify.com/3d/models/.../airforce1_mid_withLogo_black.glb",
        },
        withoutLogo: {
          white:
            "https://cdn.shopify.com/3d/models/.../airforce1_mid_noLogo_white.glb",
          black:
            "https://cdn.shopify.com/3d/models/.../airforce1_mid_noLogo_black.glb",
        },
      },
    },

    superstar: {
      withLogo: {
        white:
          "https://cdn.shopify.com/3d/models/.../superstar_withLogo_white.glb",
        black:
          "https://cdn.shopify.com/3d/models/.../superstar_withLogo_black.glb",
      },
      withoutLogo: {
        white:
          "https://cdn.shopify.com/3d/models/.../superstar_noLogo_white.glb",
        black:
          "https://cdn.shopify.com/3d/models/.../superstar_noLogo_black.glb",
      },
    },
  };

  function generateLink() {
    try {
      if (model === "superstar") {
        return MODEL_LINKS.superstar[logo][color];
      }
      return MODEL_LINKS.af1[type][logo][color];
    } catch {
      return "No model found";
    }
  }

  const [model, setModel] = useState("af1");
  const [type, setType] = useState("low");
  const [logo, setLogo] = useState("withLogo");
  const [color, setColor] = useState("white");

  const [copied, setCopied] = useState(false);

  function cardStyle(active) {
    return {
      padding: "14px",
      borderRadius: "12px",
      border: active ? "2px solid #0070f3" : "1px solid #ddd",
      cursor: "pointer",
      background: active ? "#eef6ff" : "#fff",
      width: "80%",
      textAlign: "center",
    };
  }

  function sectionRow() {
    return {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginTop: "8px",
    };
  }

  return (
    <s-page heading="Dubraes Configurator">
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Select Choices</h2>

        <s-button variant="primary">Apply Changes</s-button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          minHeight: "500px",
        }}
      >
        {/* ================= LEFT SIDE (SETTINGS) ================= */}
        <div
          style={{
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "grid", gap: "20px" }}>
            {/* MODEL */}
            <div>
              <h4>Model</h4>
              <div style={sectionRow()}>
                <div
                  style={cardStyle(model === "af1")}
                  onClick={() => setModel("af1")}
                >
                  AF1
                </div>
                <div
                  style={cardStyle(model === "superstar")}
                  onClick={() => setModel("superstar")}
                >
                  Superstar
                </div>
              </div>
            </div>

            {/* TYPE */}
            {model === "af1" && (
              <div>
                <h4>Type</h4>
                <div style={sectionRow()}>
                  <div
                    style={cardStyle(type === "low")}
                    onClick={() => setType("low")}
                  >
                    Low
                  </div>
                  <div
                    style={cardStyle(type === "mid")}
                    onClick={() => setType("mid")}
                  >
                    Mid
                  </div>
                </div>
              </div>
            )}

            {/* LOGO */}
            <div>
              <h4>Logo</h4>
              <div style={sectionRow()}>
                <div
                  style={cardStyle(logo === "withLogo")}
                  onClick={() => setLogo("withLogo")}
                >
                  With
                </div>
                <div
                  style={cardStyle(logo === "withoutLogo")}
                  onClick={() => setLogo("withoutLogo")}
                >
                  Without
                </div>
              </div>
            </div>

            {/* COLOR */}
            <div style={{ marginBottom: "40px" }}>
              <h4>Color</h4>
              <div style={sectionRow()}>
                <div
                  style={cardStyle(color === "white")}
                  onClick={() => setColor("white")}
                >
                  ⚪ White
                </div>
                <div
                  style={cardStyle(color === "black")}
                  onClick={() => setColor("black")}
                >
                  ⚫ Black
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <s-url-field
                value={generateLink()}
                label="3D Model Shoes URL"
              ></s-url-field>
            </div>

            <s-button
              onClick={() => {
                navigator.clipboard.writeText(generateLink());
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </s-button>
          </div>
        </div>

        {/* ================= RIGHT SIDE (OUTPUT / PREVIEW) ================= */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            fontSize: "18px",
            color: "#666",
          }}
        >
          {/* PLACEHOLDER */}
          <div style={{ textAlign: "center" }}>
            <div>🖼 Preview Area</div>
            <div style={{ fontSize: "14px", marginTop: "10px" }}>
              {model} {type} / {logo} / {color}
            </div>
          </div>
        </div>
      </div>
    </s-page>
  );
}
