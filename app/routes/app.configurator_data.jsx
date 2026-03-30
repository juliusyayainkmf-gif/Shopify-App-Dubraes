import { useEffect, useState } from "react";

export default function ConfiguratorData() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredFiles = files.filter((file) =>
    file.public_id.toLowerCase().includes(search.toLowerCase()),
  );

  const getPreview = (url) => {
    return url
      .replace("/upload/", "/upload/pg_1,f_jpg/")
      .replace(".pdf", ".jpg");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    fetch("/app/get-configs", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          alert("Cloudinary error: " + data.error);
          return;
        }

        setFiles(data.resources);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <style>
        {`
            .overlay:hover,
            div:hover > .overlay {
            opacity: 1 !important;
            }
        `}
      </style>
      <s-page heading="PDF Library">
        <div style={{ padding: "16px" }}>
          {loading ? (
            <s-text>Loading...</s-text>
          ) : files.length === 0 ? (
            <s-text>No PDFs found.</s-text>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <s-search-field
                label="Search"
                labelAccessibilityVisibility="exclusive"
                placeholder="Search by ID..."
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
              ></s-search-field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {filteredFiles.map((file) => (
                  <div
                    key={file.public_id}
                    className="pdf-card"
                    onClick={() => window.open(file.secure_url, "_blank")}
                    onMouseEnter={(e) =>
                      (e.currentTarget.querySelector("img").style.transform =
                        "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.querySelector("img").style.transform =
                        "scale(1)")
                    }
                    style={{
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {/* IMAGE */}
                    <img
                      src={getPreview(file.secure_url)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "0.3s",
                      }}
                    />

                    {/* HOVER OVERLAY */}
                    <div
                      className="overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        opacity: 0,
                        transition: "0.2s",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "12px",
                      }}
                    >
                      <p style={{ color: "#ffffff", margin: "0" }}>
                        {file.public_id.split("/").pop()}
                      </p>

                      <p style={{ color: "#ffffff", margin: "0" }}>
                        {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </s-page>
    </>
  );
}
