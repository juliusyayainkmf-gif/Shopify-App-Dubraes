import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server";
import { ensureCustomDubraesProduct } from "../services/dubraes-product.server";

const money = (amount, currencyCode) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Custom";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  }).format(value);
};

const parseProducts = (edges = []) =>
  edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    status: node.status,
    totalInventory: node.totalInventory ?? 0,
    image:
      node.featuredMedia?.preview?.image?.url ||
      node.featuredImage?.url ||
      null,
    imageAlt:
      node.featuredMedia?.preview?.image?.altText ||
      node.featuredImage?.altText ||
      node.title,
    price: money(
      node.priceRangeV2?.minVariantPrice?.amount,
      node.priceRangeV2?.minVariantPrice?.currencyCode,
    ),
    variants: node.variants?.nodes?.length || 0,
  }));

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query DashboardProducts {
      products(first: 12, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
              altText
            }
            featuredMedia {
              preview {
                image {
                  url
                  altText
                }
              }
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 25) {
              nodes {
                id
              }
            }
          }
        }
      }
    }
  `);

  const json = await response.json();

  return {
    products: parseProducts(json.data?.products?.edges),
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const result = await ensureCustomDubraesProduct(admin);

    return {
      success: true,
      message: result.created
        ? "Custom Dubraes product created."
        : "Custom Dubraes product already exists.",
      setup: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Unable to setup Custom Dubraes product.",
    };
  }
};

const shellStyles = `
  .dashboard-shell {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    min-height: calc(100vh - 88px);
    background: #f6f7f8;
    border: 1px solid #e2e5e9;
    border-radius: 8px;
    overflow: hidden;
  }

  .dashboard-sidebar {
    background: #fff;
    border-right: 1px solid #e2e5e9;
    padding: 20px 14px;
  }

  .dashboard-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    font-weight: 700;
  }

  .dashboard-brand-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #111;
    color: #fff;
    font-size: 13px;
  }

  .dashboard-nav-section {
    margin: 20px 0 8px;
    color: #8a8f98;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .dashboard-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    color: #2c3037;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }

  .dashboard-nav-item.active {
    background: #e9ecef;
    color: #111;
  }

  .dashboard-content {
    padding: 20px;
  }

  .dashboard-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(180px, 360px) auto auto;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .dashboard-title {
    margin: 0;
    font-size: 28px;
    line-height: 1.1;
  }

  .dashboard-search {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #dcdfe4;
    border-radius: 8px;
    background: #fff;
    font: inherit;
  }

  .dashboard-chip {
    padding: 11px 14px;
    border: 1px solid #dcdfe4;
    border-radius: 8px;
    background: #fff;
    font-weight: 700;
  }

  .dashboard-panel {
    background: #fff;
    border: 1px solid #e2e5e9;
    border-radius: 8px;
    overflow: hidden;
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-bottom: 1px solid #eceff3;
  }

  .dashboard-stat {
    padding: 18px 20px;
    border-right: 1px solid #eceff3;
  }

  .dashboard-stat:last-child {
    border-right: 0;
  }

  .dashboard-stat-label {
    margin: 0 0 8px;
    color: #747b85;
    font-size: 13px;
  }

  .dashboard-stat-value {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
  }

  .dashboard-list {
    display: grid;
  }

  .dashboard-row {
    display: grid;
    grid-template-columns: 64px minmax(220px, 1.5fr) minmax(140px, 0.8fr) minmax(120px, 0.7fr) minmax(120px, 0.7fr);
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    border-bottom: 1px solid #eceff3;
  }

  .dashboard-row:last-child {
    border-bottom: 0;
  }

  .product-thumb {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    background: #f0f1f3;
    overflow: hidden;
    color: #777;
    font-size: 11px;
    font-weight: 700;
  }

  .product-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-title {
    margin: 0 0 4px;
    font-weight: 800;
  }

  .product-meta,
  .product-label {
    margin: 0;
    color: #747b85;
    font-size: 13px;
  }

  .performance-meter {
    width: 88px;
    height: 38px;
    border-radius: 88px 88px 0 0;
    background: repeating-conic-gradient(from 270deg, #18a957 0 8deg, #dfe5e8 8deg 13deg);
    clip-path: inset(0 0 50% 0);
  }

  .setup-card {
    margin-top: 18px;
    padding: 18px;
  }

  @media (max-width: 980px) {
    .dashboard-shell {
      grid-template-columns: 1fr;
    }

    .dashboard-sidebar {
      display: none;
    }

    .dashboard-toolbar,
    .dashboard-stats,
    .dashboard-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default function Index() {
  const { products } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    configs: 0,
    logos: 0,
    pending: 0,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/app/get-configs", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        const resources = data.resources;

        setFiles(resources);

        const pdfCount = resources.filter(
          (file) =>
            file.format === "pdf" && file.public_id.startsWith("configs"),
        ).length;

        const imageCount = resources.filter(
          (file) =>
            file.resource_type === "image" &&
            file.public_id.startsWith("configs/images"),
        ).length;

        setStats({
          configs: pdfCount,
          logos: imageCount,
          pending: 0,
        });

        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE",
  ).length;
  const totalInventory = products.reduce(
    (sum, product) => sum + product.totalInventory,
    0,
  );
  const isSettingUpProduct =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "setup-custom-dubraes-product";

  return (
    <s-page heading="Dubraes Configurator Dashboard">
      <style>{shellStyles}</style>

      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-brand">
            <span className="dashboard-brand-mark">DB</span>
            <span>Dubraes Commerce</span>
          </div>

          <a className="dashboard-nav-item" href="/app/configurator_pdf">
            <span>□</span> Orders
          </a>
          <a className="dashboard-nav-item" href="/app/configurator_settings">
            <span>□</span> Configurator
          </a>
          <a className="dashboard-nav-item" href="/app/configurator_shoes">
            <span>□</span> Summary Shoes
          </a>

          <div className="dashboard-nav-section">Product</div>
          <a className="dashboard-nav-item active" href="/app">
            <span>□</span> All Product
          </a>
          <a className="dashboard-nav-item" href="/app/configurator_pdf">
            <span>□</span> Customer Files
          </a>

          <div className="dashboard-nav-section">Store</div>
          <a className="dashboard-nav-item" href="/app/configurator_settings">
            <span>□</span> Product Category
          </a>
          <a className="dashboard-nav-item" href="/app">
            <span>□</span> Performance
          </a>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-toolbar">
            <h1 className="dashboard-title">All Product List</h1>
            <input
              className="dashboard-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Product"
              type="search"
            />
            <button className="dashboard-chip" type="button">
              Sort By
            </button>
            <button className="dashboard-chip" type="button">
              Show
            </button>
          </div>

          <section className="dashboard-panel">
            <div style={{ padding: "20px 20px 0" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "22px" }}>
                Product Statistic
              </h2>
            </div>

            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <p className="dashboard-stat-label">Active Product</p>
                <p className="dashboard-stat-value">{activeProducts}</p>
              </div>
              <div className="dashboard-stat">
                <p className="dashboard-stat-label">Configurations</p>
                <p className="dashboard-stat-value">
                  {loading ? "..." : stats.configs}
                </p>
              </div>
              <div className="dashboard-stat">
                <p className="dashboard-stat-label">Uploaded Logos</p>
                <p className="dashboard-stat-value">
                  {loading ? "..." : stats.logos}
                </p>
              </div>
              <div className="dashboard-stat">
                <p className="dashboard-stat-label">Inventory</p>
                <p className="dashboard-stat-value">{totalInventory}</p>
              </div>
            </div>

            <div className="dashboard-list">
              {filteredProducts.map((product) => (
                <div className="dashboard-row" key={product.id}>
                  <div className="product-thumb">
                    {product.image ? (
                      <img src={product.image} alt={product.imageAlt || ""} />
                    ) : (
                      "No Image"
                    )}
                  </div>

                  <div>
                    <p className="product-title">{product.title}</p>
                    <p className="product-meta">
                      Status: {product.status} · Variants: {product.variants}
                    </p>
                  </div>

                  <div>
                    <p className="product-title">Performance</p>
                    <p className="product-meta">Good</p>
                  </div>

                  <div>
                    <div className="performance-meter" aria-hidden="true" />
                  </div>

                  <div>
                    <p className="product-label">Stock</p>
                    <p className="product-title">{product.totalInventory}</p>
                    <p className="product-label">Price {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel setup-card">
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px" }}>Custom Dubraes Product</h3>
                <p style={{ fontSize: "13px", margin: 0, color: "#747b85" }}>
                  Create or verify the product, description, and two variants
                  required by the configurator.
                </p>
              </div>

              <Form method="post">
                <input
                  type="hidden"
                  name="intent"
                  value="setup-custom-dubraes-product"
                />
                <s-button
                  variant="primary"
                  type="submit"
                  disabled={isSettingUpProduct}
                >
                  {isSettingUpProduct ? "Setting up..." : "Setup Product"}
                </s-button>
              </Form>

              {actionData?.message ? (
                <div
                  style={{
                    border: `1px solid ${actionData.success ? "#b7e4c7" : "#f4b4b4"}`,
                    padding: "12px",
                    borderRadius: "8px",
                    background: actionData.success ? "#f1fff5" : "#fff5f5",
                  }}
                >
                  <p style={{ margin: 0 }}>{actionData.message}</p>

                  {actionData.success ? (
                    <div style={{ marginTop: "8px", fontSize: "12px" }}>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Product:</strong>{" "}
                        {actionData.setup.product.title}
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Dubraes Only ID:</strong>{" "}
                        {
                          actionData.setup.variants.withoutCustomization
                            .numericId
                        }
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <strong>With Custom Design ID:</strong>{" "}
                        {actionData.setup.variants.withCustomization.numericId}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </s-page>
  );
}
