import { authenticate } from "../shopify.server";
import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
  {
    models: metaobjects(type: "configurator_model", first: 50) {
      edges {
        node {
          id
          fields {
            key
            value
          }
        }
      }
    }

    colors: metaobjects(type: "configurator_color", first: 50) {
      edges {
        node {
          id
          fields {
            key
            value
          }
        }
      }
    }

    logos: metaobjects(type: "configurator_logo", first: 50) {
      edges {
        node {
          id
          fields {
            key
            value
                          reference {
                ... on Model3d {
                    filename
                    sources {
                    url
                    format
                    }
                }
                }
          }
        }
      }
    }

    fonts: metaobjects(type: "configurator_font", first: 50) {
      edges {
        node {
          id
          fields {
            key
            value
                        reference {
              ... on GenericFile {
                url
              }
            }
          }
        }
      }
    }
  }
  `);

  const json = await response.json();

  const parseFields = (node) => {
    const data = {};

    node.fields.forEach((f) => {
      if (f.reference?.sources) {
        data[f.key] = {
          name: f.reference.filename,
          url: f.reference.sources[0].url,
        };
      } else {
        data[f.key] = f.value;
      }
    });

    return {
      id: node.id,
      ...data,
    };
  };

  return {
    models: json.data.models.edges.map((e) => parseFields(e.node)),
    colors: json.data.colors.edges.map((e) => parseFields(e.node)),
    logos: json.data.logos.edges.map((e) => parseFields(e.node)),
    fonts: json.data.fonts.edges.map((e) => parseFields(e.node)),
  };
};

async function publishMetaobject(admin, id) {
  const mutation = `
    mutation UpdateMetaobject($id: ID!) {
      metaobjectUpdate(
        id: $id
        metaobject: {
          capabilities: {
            publishable: {
              status: ACTIVE
            }
          }
        }
      ) {
        metaobject {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await admin.graphql(mutation, {
    variables: { id },
  });

  const json = await res.json();

  if (json.data.metaobjectUpdate.userErrors.length > 0) {
    console.log("Publish Errors:", json.data.metaobjectUpdate.userErrors);
  }
}

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const actionType = formData.get("action");

  if (actionType === "addModel") {
    const name = formData.get("name");
    const modelLink = formData.get("model_link");

    const mutation = `
    mutation CreateModel($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const response = await admin.graphql(mutation, {
      variables: {
        metaobject: {
          type: "configurator_model",
          fields: [
            { key: "name", value: name },
            { key: "model_link", value: modelLink },
          ],
        },
      },
    });

    const json = await response.json();

    const errors = json.data.metaobjectCreate.userErrors;
    if (errors.length > 0) {
      console.log("Shopify Errors:", errors);
      return null;
    }

    const id = json.data.metaobjectCreate.metaobject.id;
    await publishMetaobject(admin, id);
  }

  if (actionType === "deleteModel") {
    const id = formData.get("id");

    const mutation = `
      mutation DeleteModel($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `;

    await admin.graphql(mutation, {
      variables: { id },
    });
  }

  if (actionType === "addColor") {
    const name = formData.get("name");
    const hex = formData.get("hex");

    const mutation = `
      mutation CreateColor($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await admin.graphql(mutation, {
      variables: {
        metaobject: {
          type: "configurator_color",
          fields: [
            { key: "name", value: name },
            { key: "hex", value: hex },
          ],
        },
      },
    });

    const json = await response.json();

    const errors = json.data.metaobjectCreate.userErrors;
    if (errors.length > 0) {
      console.log("Shopify Errors:", errors);
      return null;
    }

    const id = json.data.metaobjectCreate.metaobject.id;
    await publishMetaobject(admin, id);
  }

  if (actionType === "deleteColor") {
    const id = formData.get("id");

    const mutation = `
      mutation DeleteColor($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `;

    await admin.graphql(mutation, {
      variables: { id },
    });
  }

  if (actionType === "addLogo") {
    const name = formData.get("name");
    const logo = formData.get("logo_link");

    await admin.graphql(
      `
    mutation CreateLogo($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `,
      {
        variables: {
          metaobject: {
            type: "configurator_logo",
            fields: [
              { key: "name", value: name },
              { key: "logo_link", value: logo },
            ],
          },
        },
      },
    );
  }

  if (actionType === "addFont") {
    const name = formData.get("name");
    const font = formData.get("font_link");

    await admin.graphql(
      `
    mutation CreateFont($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `,
      {
        variables: {
          metaobject: {
            type: "configurator_font",
            fields: [
              { key: "name", value: name },
              { key: "font_link", value: font },
            ],
          },
        },
      },
    );
  }

  return null;
};

export default function ConfiguratorAdmin() {
  const { models, colors, logos, fonts } = useLoaderData();
  const fetcher = useFetcher();

  const [modelName, setModelName] = useState("");
  const [modelLink, setModelLink] = useState("");

  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("");

  const [logoName, setLogoName] = useState("");
  const [logoLink, setLogoLink] = useState("");

  const [fontName, setFontName] = useState("");
  const [fontLink, setFontLink] = useState("");

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

  return (
    <s-page heading="Dubrae Configurator Data">
      <s-section heading="Models">
        <s-stack direction="block" gap="base">
          {models.map((item) => (
            <s-box
              key={item.id}
              padding="base"
              borderWidth="base"
              borderRadius="base"
            >
              <s-stack direction="inline" gap="base" align="center">
                <strong>{item.name}</strong>

                <a href={item.model_link} target="_blank">
                  {item.model_link}
                </a>

                <s-button tone="critical" onClick={() => deleteModel(item.id)}>
                  Delete
                </s-button>
              </s-stack>
            </s-box>
          ))}

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="inline" gap="base">
              <input
                placeholder="Model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />

              <input
                placeholder="Model URL (.glb)"
                value={modelLink}
                onChange={(e) => setModelLink(e.target.value)}
              />

              <s-button type="button" onClick={addModel}>
                Add Model
              </s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
      <s-section heading="Colors">
        <s-stack direction="block" gap="base">
          {colors.map((item) => (
            <s-box
              key={item.id}
              padding="base"
              borderWidth="base"
              borderRadius="base"
            >
              <s-stack direction="inline" gap="base" align="center">
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
                <span>{item.hex}</span>

                <s-button tone="critical" onClick={() => deleteColor(item.id)}>
                  Delete
                </s-button>
              </s-stack>
            </s-box>
          ))}

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="inline" gap="base">
              <input
                placeholder="Color name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
              />

              <input
                placeholder="#FFFFFF"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
              />

              <s-button onClick={addColor}>Add Color</s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Logos">
        <s-stack direction="block" gap="base">
          {logos.map((item) => (
            <s-box
              key={item.id}
              padding="base"
              borderWidth="base"
              borderRadius="base"
            >
              <s-stack direction="block">
                <strong>{item.name}</strong>

                <a href={item.logo_file} target="_blank">
                  {item.logo_file}
                </a>
              </s-stack>
            </s-box>
          ))}

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="inline" gap="base">
              <input
                placeholder="Logo name"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
              />

              <input
                placeholder="Logo URL"
                value={logoLink}
                onChange={(e) => setLogoLink(e.target.value)}
              />

              <s-button onClick={addLogo}>Add Logo</s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Fonts">
        <s-stack direction="block" gap="base">
          {fonts.map((item) => (
            <s-box
              key={item.id}
              padding="base"
              borderWidth="base"
              borderRadius="base"
            >
              <strong>{item.name}</strong>
            </s-box>
          ))}

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="inline" gap="base">
              <input
                placeholder="Font name"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
              />

              <input
                placeholder="Font URL"
                value={fontLink}
                onChange={(e) => setFontLink(e.target.value)}
              />

              <s-button onClick={addFont}>Add Font</s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
    </s-page>
  );
}
