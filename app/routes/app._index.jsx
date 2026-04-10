import { useEffect, useState } from "react";

export default function Index() {
  const [stats, setStats] = useState({
    configs: 0,
    logos: 0,
    pending: 0,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/app/get-configs", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        const files = data.resources;

        setFiles(files);

        const pdfCount = files.filter(
          (file) =>
            file.format === "pdf" && file.public_id.startsWith("configs"),
        ).length;

        const imageCount = files.filter(
          (file) =>
            file.resource_type === "image" &&
            file.public_id.startsWith("configs/images"),
        ).length;

        setStats({
          configs: pdfCount,
          logos: imageCount,
          pending: 12,
        });

        setLoading(false);
      });
  }, []);

  const now = new Date();

  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);

  const prev7Days = new Date();
  prev7Days.setDate(now.getDate() - 14);

  const currentConfigs = files.filter((file) => {
    const created = new Date(file.created_at);
    return (
      file.format === "pdf" &&
      file.public_id.startsWith("configs") &&
      created >= last7Days
    );
  }).length;

  const previousConfigs = files.filter((file) => {
    const created = new Date(file.created_at);
    return (
      file.format === "pdf" &&
      file.public_id.startsWith("configs") &&
      created >= prev7Days &&
      created < last7Days
    );
  }).length;

  const currentLogos = files.filter((file) => {
    const created = new Date(file.created_at);
    return (
      file.resource_type === "image" &&
      file.public_id.startsWith("configs/images") &&
      created >= last7Days
    );
  }).length;

  const previousLogos = files.filter((file) => {
    const created = new Date(file.created_at);
    return (
      file.resource_type === "image" &&
      file.public_id.startsWith("configs/images") &&
      created >= prev7Days &&
      created < last7Days
    );
  }).length;

  const getPercentage = (current, previous) => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const configPercent = getPercentage(currentConfigs, previousConfigs);
  const logoPercent = getPercentage(currentLogos, previousLogos);

  function StatCard({ title, value, percent }) {
    const isUp = percent > 0;
    const isDown = percent < 0;

    return (
      <s-card>
        <h3>{title}</h3>

        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>

        <p
          style={{
            color: isUp ? "green" : isDown ? "red" : "gray",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {isUp ? "▲" : isDown ? "▼" : "•"} {Math.abs(percent).toFixed(1)}%
        </p>
      </s-card>
    );
  }

  function SkeletonCard() {
    return (
      <s-card>
        <div style={{ display: "grid", gap: "10px" }}>
          <div style={{ height: "16px", width: "120px", background: "#eee" }} />
          <div style={{ height: "24px", width: "60px", background: "#ddd" }} />
          <div style={{ height: "14px", width: "80px", background: "#eee" }} />
        </div>
      </s-card>
    );
  }

  return (
    <s-page heading="Dubraes Configurator Dashboard">
      {/* ===================== */}
      {/* MAIN SECTION */}
      {/* ===================== */}
      <s-section heading="Overviews">
        <div style={{ display: "grid", gap: "12px" }}>
          <p>
            Welcome to your Dubraes Configurator app. Manage custom orders,
            uploaded logos, and product configurations here.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard
                  title="Total Configurations"
                  value={stats.configs}
                  percent={configPercent}
                />

                <StatCard
                  title="Uploaded Logos"
                  value={stats.logos}
                  percent={logoPercent}
                />

                <s-card>
                  <h3>Pending Orders</h3>
                  <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {stats.pending}
                  </p>
                </s-card>
              </>
            )}
          </div>
        </div>
      </s-section>

      {/* ===================== */}
      {/* PRODUCTS / CONFIG */}
      {/* ===================== */}
      <s-section heading="Product Configuration Portal">
        <p style={{ fontSize: "12px" }}>
          To ensure the app runs efficiently, please configure the necessary
          settings and product options. You can manage configurations such as
          product types, variations, and other details based on your needs. Use
          the buttons below to access each section and make updates accordingly.
        </p>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <s-button variant="primary" href="/app/configurator_shoes">
              Configure Summary Shoes
            </s-button>
          </div>

          <div>
            <s-button href="/app/configurator_settings">
              Configure Settings
            </s-button>
          </div>

          <div>
            <s-button href="/app/configurator_pdf">
              Check Customer Orders
            </s-button>
          </div>
        </div>
      </s-section>

      {/* ===================== */}
      {/* ASIDE LEFT */}
      {/* ===================== */}
      <s-section slot="aside" heading="App Info">
        <p>
          <strong>Version:</strong> 1.0.0
        </p>
        <p>
          <strong>Status:</strong> Active
        </p>
        <p>
          This app allows customers to customize dubraes with text, logos, and
          colors, including PDF and image uploads.
        </p>
      </s-section>

      {/* ===================== */}
      {/* ASIDE RIGHT */}
      {/* ===================== */}
      <s-section slot="aside" heading="Next Steps">
        <ul style={{ paddingLeft: "16px" }}>
          <li>Connect Cloudinary for uploads</li>
          <li>Setup product variants</li>
          <li>Configure cart properties</li>
          <li>Enable order webhook</li>
          <li>Customize storefront UI</li>
        </ul>
      </s-section>
    </s-page>
  );
}
