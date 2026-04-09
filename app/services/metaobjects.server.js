// app/services/metaobjects.server.js

export async function getConfiguratorData(admin) {
  const response = await admin.graphql(`
    {
      models: metaobjects(type: "configurator_model", first: 50) {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }

      colors: metaobjects(type: "configurator_color", first: 50) {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }

      logoColors: metaobjects(type: "configurator_color_logo", first: 50) {
        edges {
          node {
            id
            fields { key value }
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
                  sources { url format }
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

      shoes: metaobjects(type: "configurator_shoes", first: 50) {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }

      settings: metaobjects(type: "configurator_settings", first: 1) {
        edges {
          node {
            id
            fields { key value }
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
      } else if (f.reference?.url) {
        data[f.key] = f.reference.url;
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
    shoes: json.data.shoes.edges.map((e) => parseFields(e.node)),
    colors: json.data.colors.edges.map((e) => parseFields(e.node)),
    logoColors: json.data.logoColors.edges.map((e) => parseFields(e.node)),
    logos: json.data.logos.edges.map((e) => parseFields(e.node)),
    fonts: json.data.fonts.edges.map((e) => parseFields(e.node)),
    settings: json.data.settings.edges.map((e) => parseFields(e.node)),
  };
}
