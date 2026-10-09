import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { garmentSVG } from "../catalog.js";
export default function Admin({ onAdd, onNavigate, onLogout }) {
  const [mode, setMode] = useState("full"),
    [upload, setUpload] = useState(null),
    [status, setStatus] = useState(""),
    [generation, setGeneration] = useState("idle"),
    [fail, setFail] = useState(false),
    [error, setError] = useState("");
  const timer = useRef(),
    uploadRef = useRef();
  uploadRef.current = upload;
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (uploadRef.current) URL.revokeObjectURL(uploadRef.current);
    },
    [],
  );
  function generate() {
    if (!upload) {
      setError("Choose a product photograph first.");
      return;
    }
    setError("");
    setGeneration("processing");
    timer.current = setTimeout(
      () => setGeneration(fail ? "failed" : "review"),
      1800,
    );
  }
  async function submit(e) {
    e.preventDefault();
    if (generation === "processing") {
      setError("Wait for sample processing to finish.");
      return;
    }
    const form = e.currentTarget,
      f = new FormData(form);
    const product = {
      name: f.get("name").trim(),
      category: f.get("category"),
      type: f.get("type"),
      price: Number(f.get("price")),
      mode,
      deposit: Number(f.get("deposit")),
      availability: f.get("availability"),
      date: f.get("date"),
      description: f.get("description").trim(),
      sizes: f.getAll("sizes"),
      color: f.get("color"),
    };
    if (!product.sizes.length) {
      setError("Select at least one size.");
      return;
    }
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || "Unable to validate product.");
      onAdd({ ...product, image: upload });
      setUpload(null);
      form.reset();
      setMode("full");
      setGeneration("idle");
      setError("");
      setStatus(
        "Sample product added to the storefront for this session. Orders and conversion remain simulated.",
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <motion.main
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header>
        <a
          className="wordmark"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/");
          }}
        >
          fenimi<span>STUDIO</span>
        </a>
        <div className="nav-actions">
          <button onClick={() => onNavigate("/")}>View storefront ↗</button>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </header>
      <section className="admin-workspace">
        <span className="eyebrow">PRIVATE / COLLECTION MANAGEMENT</span>
        <h1>Collection desk.</h1>
        <p className="demo-banner">
          Authenticated admin area. Catalog edits stay in this browser session;
          photo-to-3D generation and payments remain demonstrations.
        </p>
        <form onSubmit={submit}>
          <div className="admin-grid">
            <label>
              Product name
              <input
                name="name"
                required
                maxLength="80"
                placeholder="e.g. The sculpted shirt"
              />
            </label>
            <label>
              Category
              <select name="category">
                <option>Womenswear</option>
                <option>Streetwear</option>
                <option>Occasion</option>
              </select>
            </label>
            <label>
              Garment type
              <select name="type">
                <option value="shirt">Top / shirt</option>
                <option value="trousers">Trousers</option>
                <option value="jacket">Jacket / outer layer</option>
                <option value="dress">Dress</option>
                <option value="gown">Gown</option>
                <option value="set">Complete set</option>
              </select>
            </label>
            <label>
              Preview color
              <input type="color" name="color" defaultValue="#444444" />
            </label>
            <label>
              Price (₦)
              <input
                name="price"
                type="number"
                min="100"
                max="10000000"
                defaultValue="35000"
                required
              />
            </label>
            <label>
              Purchase option
              <select
                name="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="full">Full payment</option>
                <option value="deposit">Deposit preorder</option>
                <option value="quote">Request a quote</option>
              </select>
            </label>
            {mode === "deposit" && (
              <label>
                Deposit percentage
                <input
                  name="deposit"
                  type="number"
                  min="1"
                  max="99"
                  defaultValue="40"
                  required
                />
              </label>
            )}
            <label>
              Availability
              <select name="availability">
                <option>Preorder</option>
                <option>Ready to ship</option>
                <option>Made to order</option>
              </select>
            </label>
            <label>
              Example dispatch date
              <input
                name="date"
                type="date"
                defaultValue="2026-11-06"
                required
              />
            </label>
            <label className="wide">
              Description
              <textarea
                name="description"
                required
                maxLength="2000"
                placeholder="Describe the silhouette, fabric and details."
              />
            </label>
            <fieldset className="wide">
              <legend>Available sizes</legend>
              <div className="size-checks">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      name="sizes"
                      value={s}
                      defaultChecked={["S", "M", "L"].includes(s)}
                    />{" "}
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="wide">
              Product photograph (local preview only)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files[0];
                  clearTimeout(timer.current);
                  setGeneration("idle");
                  if (upload) URL.revokeObjectURL(upload);
                  setUpload(null);
                  if (!f) return;
                  if (
                    !["image/jpeg", "image/png", "image/webp"].includes(
                      f.type,
                    ) ||
                    f.size > 8 * 1024 * 1024
                  ) {
                    setError("Choose JPG, PNG or WebP under 8 MB.");
                    e.target.value = "";
                    return;
                  }
                  setUpload(URL.createObjectURL(f));
                  setError("");
                }}
              />
              {upload && (
                <img
                  className="upload-preview"
                  src={upload}
                  alt="Uploaded product preview"
                />
              )}
            </label>
          </div>
          <div className="conversion">
            <span className="eyebrow">OPTIONAL / PHOTO TO 3D</span>
            <h3>Give your piece a new dimension.</h3>
            <p>
              Simulated generation only. No images are sent to a converter.
              Garment type controls the schematic mannequin preview.
            </p>
            <label className="failure-option">
              <input
                type="checkbox"
                checked={fail}
                onChange={(e) => setFail(e.target.checked)}
              />{" "}
              Demonstrate generation failure
            </label>
            <button
              type="button"
              className="button light"
              disabled={generation === "processing"}
              onClick={generate}
            >
              {generation === "processing"
                ? "Processing sample…"
                : generation === "failed"
                  ? "Retry sample generation ↗"
                  : "Generate sample preview ↗"}
            </button>
            <div role="status" className="generation-status">
              {generation === "processing" &&
                "Simulated processing… building a demonstration silhouette."}
              {generation === "failed" &&
                "Simulated failure: reconstruction was unsuccessful. Retry or publish with the photograph."}
              {generation === "review" && (
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: garmentSVG({
                        id: 99,
                        name: "Generic demonstration garment",
                        type: "dress",
                        color: "#444",
                      }),
                    }}
                  />
                  <p>
                    Review ready: this generic silhouette was not generated from
                    your photograph.
                  </p>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setGeneration("approved")}
                  >
                    Approve sample preview
                  </button>
                </>
              )}
              {generation === "approved" &&
                "Sample preview approved. Actual photo-to-3D integration is still pending."}
            </div>
          </div>
          <button className="button" type="submit">
            Add sample product ↗
          </button>
          {error && <p role="alert">{error}</p>}
          <p role="status">{status}</p>
        </form>
      </section>
    </motion.main>
  );
}
