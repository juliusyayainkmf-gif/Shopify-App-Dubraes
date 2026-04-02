import { useEffect, useState } from "react";

export default function ConfiguratorData() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  // 📄 PDF FILTER
  const pdfFiles = files
    .filter(
      (file) => file.format === "pdf" && file.public_id.startsWith("configs"),
    )
    .filter((file) =>
      file.public_id.toLowerCase().includes(search.toLowerCase()),
    );

  // 🖼️ IMAGE FILTER
  const imageFiles = files
    .filter(
      (file) =>
        file.resource_type === "image" &&
        file.public_id.startsWith("configs/images"),
    )
    .filter((file) =>
      file.public_id.toLowerCase().includes(search.toLowerCase()),
    );

  const getPdfPreview = (url) => {
    return url
      .replace("/upload/", "/upload/pg_1,f_jpg/")
      .replace(".pdf", ".jpg");
  };

  const getOptimizedImage = (url) => {
    return url.replace("/upload/", "/upload/w_400,q_auto/");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const handleDelete = async (file) => {
    const confirmDelete = confirm("Delete this file?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/delete-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: file.public_id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert("Delete failed: " + (data.error || "Unknown error"));
        return;
      }

      // ✅ remove from UI instantly
      setFiles((prev) => prev.filter((f) => f.public_id !== file.public_id));
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleRename = async (file) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    try {
      const res = await fetch("/api/rename-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: file.public_id,
          new_name: newName,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert("Rename failed: " + (data.error || "Unknown error"));
        return;
      }

      // ✅ update UI instantly
      setFiles((prev) =>
        prev.map((f) =>
          f.public_id === file.public_id
            ? {
                ...f,
                public_id: data.result.public_id, // updated name
                secure_url: data.result.secure_url, // updated URL
              }
            : f,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
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

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <>
      <s-page heading="Configurator Library">
        <div style={{ padding: "16px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh", // or "100vh" if you want full screen
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div className="spinner"></div>
              <s-text>Loading...</s-text>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <s-search-field
                label="Search"
                labelAccessibilityVisibility="exclusive"
                placeholder="Search by ID..."
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
              ></s-search-field>

              <div>
                <h2>PDF Library</h2>

                {pdfFiles.length === 0 ? (
                  <s-text>No PDFs found.</s-text>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {pdfFiles.map((file) => (
                      <div
                        key={file.public_id}
                        style={{
                          position: "relative",
                          borderRadius: "16px",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        {/* THREE DOTS */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(file.public_id);
                          }}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            zIndex: 10,
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ⋮
                        </div>

                        {/* DROPDOWN */}
                        {openMenu === file.public_id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              top: "40px",
                              right: "8px",
                              background: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                              zIndex: 20,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              onClick={() => handleRename(file)}
                              style={menuItemStyle}
                            >
                              Rename
                            </div>
                            <div
                              onClick={() => handleDelete(file)}
                              style={{ ...menuItemStyle, color: "red" }}
                            >
                              Delete
                            </div>
                          </div>
                        )}

                        {/* CLICK AREA */}
                        <div
                          onClick={() => window.open(file.secure_url, "_blank")}
                        >
                          <img
                            src={getPdfPreview(file.secure_url)}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "0.3s",
                            }}
                          />

                          <div className="overlay" style={overlayStyle}>
                            <p>{file.public_id.split("/").pop()}</p>
                            <p>{formatDate(file.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2>Custom Logos</h2>

                {imageFiles.length === 0 ? (
                  <s-text>No logos found.</s-text>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {imageFiles.map((file) => (
                      <div
                        key={file.public_id}
                        style={{
                          position: "relative",
                          borderRadius: "16px",
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* THREE DOTS */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(file.public_id);
                          }}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            zIndex: 10,
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ⋮
                        </div>

                        {/* DROPDOWN */}
                        {openMenu === file.public_id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              top: "40px",
                              right: "8px",
                              background: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                              zIndex: 20,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              onClick={() => handleRename(file)}
                              style={menuItemStyle}
                            >
                              Rename
                            </div>
                            <div
                              onClick={() => handleDelete(file)}
                              style={{ ...menuItemStyle, color: "red" }}
                            >
                              Delete
                            </div>
                          </div>
                        )}

                        {/* CLICK AREA */}
                        <div
                          onClick={() => window.open(file.secure_url, "_blank")}
                        >
                          <img
                            src={getOptimizedImage(file.secure_url)}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "0.3s",
                            }}
                          />

                          <div className="overlay" style={overlayStyle}>
                            <p>{file.public_id.split("/").pop()}</p>
                            <p>{formatDate(file.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </s-page>
    </>
  );
}

const overlayStyle = {
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
};

const menuItemStyle = {
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "14px",
  borderBottom: "1px solid #eee",
};
