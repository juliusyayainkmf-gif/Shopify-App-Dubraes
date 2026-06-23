import { useEffect, useState } from "react";

const homeStyles = `
  .home-copy {
    margin: 0;
    color: #4f5661;
    font-size: 13px;
    line-height: 1.5;
  }

  .overview-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    margin-top: 26px;
  }

  .overview-stat {
    min-width: 120px;
  }

  .overview-stat-title {
    margin: 0 0 18px;
    color: #3f4247;
    font-size: 14px;
    font-weight: 700;
  }

  .overview-stat-value {
    margin: 0 0 14px;
    color: #33363a;
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
  }

  .overview-stat-trend {
    margin: 0;
    color: #6d7175;
    font-size: 13px;
    font-weight: 700;
  }

  .overview-stat-trend.up {
    color: #108043;
  }

  .overview-stat-trend.down {
    color: #d72c0d;
  }

  .portal-actions {
    display: grid;
    gap: 12px;
    justify-items: start;
    margin-top: 16px;
  }

  .next-steps-list {
    margin: 0;
    padding-left: 16px;
    color: #3f4247;
    font-size: 13px;
    line-height: 1.5;
  }
`;

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
          pending: 0,
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
  function StatBlock({ title, value, percent }) {
    const isUp = percent > 0;
    const isDown = percent < 0;

    return (
      <div className="overview-stat">
        <p className="overview-stat-title">{title}</p>
        <p className="overview-stat-value">{value}</p>
        <p
          className={`overview-stat-trend ${
            isUp ? "up" : isDown ? "down" : ""
          }`}
        >
          {isUp ? "^" : isDown ? "v" : "-"} {Math.abs(percent).toFixed(1)}%
        </p>
      </div>
    );
  }

  function SkeletonStat() {
    return (
      <div className="overview-stat">
        <div style={{ height: "16px", width: "120px", background: "#eee" }} />
        <div
          style={{
            height: "24px",
            width: "60px",
            background: "#ddd",
            margin: "18px 0 14px",
          }}
        />
        <div style={{ height: "14px", width: "80px", background: "#eee" }} />
      </div>
    );
  }

  return (
    <s-page heading="Dubraes Configurator Dashboard">
      <style>{homeStyles}</style>
      {/* ===================== */}
      {/* MAIN SECTION */}
      {/* ===================== */}
      <s-section heading="Overviews">
        <div style={{ display: "grid", gap: "12px" }}>
          <p className="home-copy">
            Welcome to your Dubraes Configurator app. Manage custom orders,
            uploaded logos, and product configurations here.
          </p>

          <div className="overview-stats">
            {loading ? (
              <>
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
              </>
            ) : (
              <>
                <StatBlock
                  title="Total Configurations"
                  value={stats.configs}
                  percent={configPercent}
                />

                <StatBlock
                  title="Uploaded Logos"
                  value={stats.logos}
                  percent={logoPercent}
                />

                <div className="overview-stat">
                  <p className="overview-stat-title">Pending Orders</p>
                  <p className="overview-stat-value">{stats.pending}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </s-section>

      {/* ===================== */}
      {/* PRODUCTS / CONFIG */}
      {/* ===================== */}
      <s-section heading="Product Configuration Portal">
        <p className="home-copy">
          To ensure the app runs efficiently, please configure the necessary
          settings and product options. You can manage configurations such as
          product types, variations, and other details based on your needs. Use
          the buttons below to access each section and make updates accordingly.
        </p>
        <div className="portal-actions">
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
        <p className="home-copy">
          <strong>Version:</strong> 1.0.0
        </p>
        <p className="home-copy">
          <strong>Status:</strong> Active
        </p>
        <p className="home-copy">
          This app allows customers to customize dubraes with text, logos, and
          colors, including PDF and image uploads.
        </p>
      </s-section>

      {/* ===================== */}
      {/* ASIDE RIGHT */}
      {/* ===================== */}
      <s-section slot="aside" heading="Next Steps">
        <ul className="next-steps-list">
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
