import { authenticate } from "../shopify.server";
import { getConfiguratorData } from "../services/metaobjects.server";
import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { useFetcher } from "react-router";


export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  return await getConfiguratorData(admin);
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const actionType = formData.get("action");

  if (actionType === "updateSettings") {
    const currentShoe = formData.get("current_shoe");

    const data = await getConfiguratorData(admin);
    const settingsId = data.settings[0]?.id;

    const selected = data.shoes.find((s) => s.name === currentShoe);
    const shoesLink = selected?.shoes_link || "";

    return await admin.graphql(
      `
      mutation UpdateConfiguratorSettings($settingsId: ID!, $currentShoe: String!, $shoesLink: String!) {
        metaobjectUpdate(
          id: $settingsId,
          metaobject: {
            fields: [
              { key: "current_shoe", value: $currentShoe },
              { key: "current_shoe_link", value: $shoesLink }
            ]
          }
        ) {
          metaobject { id }
        }
      }
    `,
      {
        variables: {
          settingsId,
          currentShoe,
          shoesLink,
        },
      },
    );
  }

  return null;
};

export default function Index() {
  const { shoes = [], settings = [] } = useLoaderData();
  const fetcher = useFetcher();

  const currentShoe = settings[0]?.current_shoe;

  useEffect(() => {
    if (!currentShoe) return;

    const parts = currentShoe.split("_");

    setModel(parts[0]);

    if (parts.length === 4) {
      setType(parts[1]);
      setLogo(parts[2]);
      setColor(parts[3]);
    } else {
      setLogo(parts[1]);
      setColor(parts[2]);
    }
  }, [currentShoe]);

  const [MODEL_LINKS, setModelLinks] = useState({});

  useEffect(() => {
    const map = {};

    shoes.forEach((item) => {
      map[item.name] = item.shoes_link;
    });

    setModelLinks(map);
  }, [shoes]);

  function generateLink() {
    try {
      let key = "";

      if (model === "superstar") {
        key = `${model}_${logo}_${color}`;
      } else {
        key = `${model}_${type}_${logo}_${color}`;
      }

      return MODEL_LINKS[key] || "No model found";
    } catch {
      return "No model found";
    }
  }

  const [model, setModel] = useState("af1");
  const [type, setType] = useState("low");
  const [logo, setLogo] = useState("withLogo");
  const [color, setColor] = useState("white");

  const [copied, setCopied] = useState(false);

  function applyChanges() {
    let key = "";

    if (model === "superstar") {
      key = `${model}_${logo}_${color}`;
    } else {
      key = `${model}_${type}_${logo}_${color}`;
    }

    fetcher.submit(
      {
        action: "updateSettings",
        current_shoe: key,
      },
      { method: "post" },
    );
  }

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Select Choices</h2>
        <s-button variant="primary" onClick={applyChanges}>
          Apply Changes
        </s-button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          minHeight: "500px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "grid", gap: "20px" }}>
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
              <s-url-field value={generateLink()} label="3D Model Shoes URL" />
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
