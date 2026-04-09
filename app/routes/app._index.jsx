export default function Index() {
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
            <s-card>
              <h3>Total Configurations</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>128</p>
            </s-card>

            <s-card>
              <h3>Pending Orders</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>12</p>
            </s-card>

            <s-card>
              <h3>Uploaded Logos</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>54</p>
            </s-card>
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
            <s-button variant="primary" href="/app/configurator_shoes">Configure Summary Shoes</s-button>
          </div>

          <div>
            <s-button href="/app/configurator_settings">Configure Settings</s-button>
          </div>

          <div>
            <s-button href="/app/configurator_pdf">Check Customer Orders</s-button>
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
