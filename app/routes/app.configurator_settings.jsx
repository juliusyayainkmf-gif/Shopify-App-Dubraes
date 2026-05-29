import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { getConfiguratorData } from "../services/metaobjects.server";
import {
  createMetaobject,
  deleteMetaobject,
} from "../services/metaobjects.actions.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  return await getConfiguratorData(admin);
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const actionType = formData.get("action");

  // -------- CREATE --------
  if (actionType === "addModel") {
    return createMetaobject(admin, {
      type: "configurator_model",
      fields: [
        { key: "name", value: formData.get("name") },
        { key: "model_link", value: formData.get("model_link") },
      ],
      successMessage: "Model added successfully",
    });
  }

  if (actionType === "addColor") {
    return createMetaobject(admin, {
      type: "configurator_color",
      fields: [
        { key: "name", value: formData.get("name") },
        { key: "hex", value: formData.get("hex") },
      ],
      successMessage: "Color added successfully",
    });
  }

  if (actionType === "addLogoColor") {
    return createMetaobject(admin, {
      type: "configurator_color_logo",
      fields: [
        { key: "name", value: formData.get("name") },
        { key: "hex_color", value: formData.get("hex_color") },
      ],
      successMessage: "Logo Color added successfully",
    });
  }

  if (actionType === "addLogo") {
    return createMetaobject(admin, {
      type: "configurator_logo",
      fields: [
        { key: "name", value: formData.get("name") },
        { key: "logo_file", value: formData.get("logo_link") },
      ],
      successMessage: "Logo added successfully",
    });
  }

  if (actionType === "addFont") {
    return createMetaobject(admin, {
      type: "configurator_font",
      fields: [
        { key: "name", value: formData.get("name") },
        { key: "font_file", value: formData.get("font_link") },
      ],
      successMessage: "Font added successfully",
    });
  }

  // -------- DELETE --------
  if (
    actionType === "deleteModel" ||
    actionType === "deleteColor" ||
    actionType === "deleteLogo" ||
    actionType === "deleteFont" ||
    actionType === "deleteLogoColor"
  ) {
    return deleteMetaobject(admin, formData.get("id"));
  }

  return {
    success: false,
    message: "Invalid action",
  };
};

export default function ConfiguratorAdmin() {
  const {
    models = [],
    colors = [],
    logos = [],
    fonts = [],
    logoColors = [],
  } = useLoaderData();
  const fetcher = useFetcher();

  // ---------------- STATE ----------------
  const [modelName, setModelName] = useState("");
  const [modelLink, setModelLink] = useState("");

  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("");

  const [logoName, setLogoName] = useState("");
  const [logoLink, setLogoLink] = useState("");

  const [fontName, setFontName] = useState("");
  const [fontLink, setFontLink] = useState("");

  const [logoColorName, setLogoColorName] = useState("");
  const [logoColorHex, setLogoColorHex] = useState("");

  const [banner, setBanner] = useState(null);
  const isLoading = fetcher.state !== "idle";

  const addModel = () => {
    fetcher.submit(
      {
        action: "addModel",
        name: modelName,
        model_link: modelLink,
      },
      { method: "post" },
    );
  };

  const deleteModel = (id) => {
    fetcher.submit(
      {
        action: "deleteModel",
        id,
      },
      { method: "post" },
    );
  };

  const addColor = () => {
    fetcher.submit(
      {
        action: "addColor",
        name: colorName,
        hex: colorHex,
      },
      { method: "post" },
    );
  };

  const deleteColor = (id) => {
    fetcher.submit(
      {
        action: "deleteColor",
        id,
      },
      { method: "post" },
    );
  };

  const addLogoColor = () => {
    fetcher.submit(
      {
        action: "addLogoColor",
        name: logoColorName,
        hex: logoColorHex,
      },
      { method: "post" },
    );
  };

  const deleteLogoColor = (id) => {
    fetcher.submit(
      {
        action: "deleteLogoColor",
        id,
      },
      { method: "post" },
    );
  };

  const addLogo = () => {
    fetcher.submit(
      {
        action: "addLogo",
        name: logoName,
        logo_link: logoLink,
      },
      { method: "post" },
    );
  };

  const deleteLogo = (id) => {
    fetcher.submit(
      {
        action: "deleteLogo",
        id,
      },
      { method: "post" },
    );
  };

  const addFont = () => {
    fetcher.submit(
      {
        action: "addFont",
        name: fontName,
        font_link: fontLink,
      },
      { method: "post" },
    );
  };

  const deleteFont = (id) => {
    fetcher.submit(
      {
        action: "deleteFont",
        id,
      },
      { method: "post" },
    );
  };

  // ---------------- RESPONSE HANDLER ----------------
  useEffect(() => {
    if (fetcher.data) {
      setBanner({
        type: fetcher.data.success ? "success" : "error",
        message: fetcher.data.message,
      });
    }
  }, [fetcher.data]);

  // auto hide banner
  useEffect(() => {
    if (banner) {
      const t = setTimeout(() => setBanner(null), 3000);
      return () => clearTimeout(t);
    }
  }, [banner]);

  return (
    <>
      {/* ---------------- SPINNER ---------------- */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <s-stack alignItems="center" gap="base" padding="large">
            <s-spinner
              accessibilityLabel="Loading products"
              size="large"
            ></s-spinner>
            <s-text>Loading...</s-text>
          </s-stack>
        </div>
      )}

      {/* ---------------- BANNER ---------------- */}
      {banner && (
        <s-banner
          heading="Update was Successfully"
          tone="success"
          dismissible="true"
        >
          {banner.message}
        </s-banner>
      )}

      {/* ---------------- UI ---------------- */}
      <s-page heading="Dubraes Configurator Settings">
        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <h2>Models</h2>

            <s-button variant="primary" commandFor="modelModal">
              Add Model
            </s-button>

            <s-modal id="modelModal" heading="Add Model">
              <s-box padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Model Name"
                    value={modelName}
                    placeholder="Small"
                    onInput={(e) => setModelName(e.target.value)}
                  ></s-text-field>

                  <s-url-field
                    label="Model URL (.glb)"
                    value={modelLink}
                    // details="Enter your business website"
                    placeholder="https://cdn.shopify.com/3d/models/91b15463ef682c15/small.glb"
                    onInput={(e) => setModelLink(e.target.value)}
                  ></s-url-field>

                  <s-button type="button" icon="plus" onClick={addModel}>
                    Add Model
                  </s-button>
                </s-stack>
              </s-box>
            </s-modal>
          </s-stack>
          <s-stack direction="block" gap="base">
            {models.map((item) => (
              <s-box
                key={item.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="base"
                >
                  <strong>{item.name}</strong>

                  <a href={item.model_link} target="_blank" rel="noreferrer">
                    {item.model_link}
                  </a>

                  <s-button
                    tone="critical"
                    onClick={() => deleteModel(item.id)}
                  >
                    Delete
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-section>

        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <h2>Logos</h2>
            <s-button variant="primary" commandFor="LogoModal">
              Add Logo
            </s-button>
            <s-modal id="LogoModal" heading="Add Logo">
              <s-box padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Logo Name"
                    value={logoName}
                    placeholder="Nike"
                    onChange={(e) => setLogoName(e.target.value)}
                  ></s-text-field>

                  <s-text-field
                    label="Logo URL"
                    placeholder="https://cdn.shopify.com/3d/models/0ef92ba60f004339/Nike.glb"
                    value={logoLink}
                    onChange={(e) => setLogoLink(e.target.value)}
                  ></s-text-field>

                  <s-button type="button" icon="plus" onClick={addLogo}>
                    Add Logo
                  </s-button>
                </s-stack>
              </s-box>
            </s-modal>
          </s-stack>
          <s-stack direction="block" gap="base">
            {logos.map((item) => (
              <s-box
                key={item.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="base"
                >
                  <strong>{item.name}</strong>

                  <a href={item.logo_file} target="_blank" rel="noreferrer">
                    {item.logo_file}
                  </a>

                  <s-button tone="critical" onClick={() => deleteLogo(item.id)}>
                    Delete
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-section>

        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <h2>Fonts</h2>
            <s-button variant="primary" commandFor="FontModal">
              Add Font
            </s-button>
            <s-modal id="FontModal" heading="Add Logo">
              <s-box padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Font Name"
                    placeholder="Helvetia"
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value)}
                  ></s-text-field>

                  <s-text-field
                    label="Font URL"
                    placeholder="https://cdn.shopify.com/s/files/1/0135/5966/0608/files/helve.json?v=1773256094"
                    value={fontLink}
                    onChange={(e) => setFontLink(e.target.value)}
                  ></s-text-field>

                  <s-button type="button" icon="plus" onClick={addFont}>
                    Add Font
                  </s-button>
                </s-stack>
              </s-box>
            </s-modal>
          </s-stack>

          <s-stack direction="block" gap="base">
            {fonts.map((item) => (
              <s-box
                key={item.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="base"
                >
                  <strong>{item.name}</strong>
                  <s-button tone="critical" onClick={() => deleteFont(item.id)}>
                    Delete
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-section>

        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <h2>Colors</h2>

            <s-button variant="primary" commandFor="colorModal">
              Add Color
            </s-button>

            <s-modal id="colorModal" heading="Add Model">
              <s-box padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Color Name"
                    value={colorName}
                    placeholder="Black"
                    onInput={(e) => setColorName(e.target.value)}
                  ></s-text-field>

                  <s-text-field
                    label="Color Hex Value"
                    value={colorHex}
                    placeholder="#FFFFFF"
                    onInput={(e) => setColorHex(e.target.value)}
                  ></s-text-field>

                  <s-button type="button" icon="plus" onClick={addColor}>
                    Add Color
                  </s-button>
                </s-stack>
              </s-box>
            </s-modal>
          </s-stack>
          <s-stack direction="block" gap="base">
            {colors.map((item) => (
              <s-box
                key={item.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="base"
                >
                  <s-stack direction="inline" gap="large-100">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        background: item.hex,
                        border: "1px solid #ccc",
                      }}
                    />
                    <strong>{item.name}</strong>
                  </s-stack>

                  <s-button
                    tone="critical"
                    onClick={() => deleteColor(item.id)}
                  >
                    Delete
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-section>

        <s-section>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <h2>Logo Colors</h2>

            <s-button variant="primary" commandFor="logoColorModal">
              Add Logo Color
            </s-button>

            <s-modal id="logoColorModal" heading="Add Logo Color">
              <s-box padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Logo Color Name"
                    value={logoColorName}
                    placeholder="Black"
                    onInput={(e) => setLogoColorName(e.target.value)}
                  ></s-text-field>

                  <s-text-field
                    label="Color Hex Value"
                    value={logoColorHex}
                    placeholder="#FFFFFF"
                    onInput={(e) => setLogoColorHex(e.target.value)}
                  ></s-text-field>

                  <s-button type="button" icon="plus" onClick={addLogoColor}>
                    Add Logo Color
                  </s-button>
                </s-stack>
              </s-box>
            </s-modal>
          </s-stack>
          <s-stack direction="block" gap="base">
            {logoColors.map((item) => (
              <s-box
                key={item.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="base"
                >
                  <s-stack direction="inline" gap="large-100">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        background: item.hex_color,
                        border: "1px solid #ccc",
                      }}
                    />
                    <p>{item.hex}</p>
                    <strong>{item.name}</strong>
                  </s-stack>

                  <s-button
                    tone="critical"
                    onClick={() => deleteLogoColor(item.id)}
                  >
                    Delete
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-section>
      </s-page>
    </>
  );
}
