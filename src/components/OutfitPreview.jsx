import { lazy, Suspense, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Modal, Art } from "./UI.jsx";
import { money } from "../catalog.js";
import { outfitItems, slotFor } from "../outfit.js";
const Mannequin = lazy(() => import("./Mannequin.jsx"));
export default function OutfitPreview({
  selection,
  products,
  onSelect,
  onRemove,
  onSize,
  onAdd,
  onQuote,
  onClose,
}) {
  const items = outfitItems(selection, products);
  const [error, setError] = useState("");
  return (
    <Modal onClose={onClose} className="outfit-dialog" label="outfit preview">
      <div className="outfit-heading">
        <span className="eyebrow">FENIMI / YOUR VIRTUAL FITTING ROOM</span>
        <h2>
          Your pieces.
          <br />
          <em>Your perspective.</em>
        </h2>
        <p>
          Choose a top and trousers separately, or explore a complete
          silhouette. Selecting a piece replaces another in the same garment
          slot.
        </p>
      </div>
      <div className="outfit-layout">
        <Suspense
          fallback={
            <div className="scene-wrap loading-scene">
              Preparing your mannequin…
            </div>
          }
        >
          <Mannequin items={items} />
        </Suspense>
        <div className="outfit-controls">
          <span className="eyebrow">YOUR SELECTED PIECES</span>
          <AnimatePresence mode="popLayout">
            {items.map(({ slot, product: p, size }) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 25 }}
                className="outfit-item"
                key={p.id}
              >
                <Art product={p} />
                <div>
                  <h3>{p.name}</h3>
                  <span>{money(p.price)}</span>
                  <label>
                    Size
                    <select
                      aria-label={`Size for ${p.name}`}
                      value={size || ""}
                      onChange={(e) => {
                        onSize(slot, e.target.value);
                        setError("");
                      }}
                    >
                      <option value="">Choose size</option>
                      {p.sizes.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <button className="text-link" onClick={() => onRemove(slot)}>
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!items.length && <p>Select a piece below to begin.</p>}
          <p className="small-note">
            Schematic demonstration garments. This previews styling, not
            personal sizing or actual fabric drape.
          </p>
          {error && <p role="alert">{error}</p>}
          <button
            className="button"
            disabled={!items.length}
            onClick={() => {
              if (items.some((x) => !x.size)) {
                setError("Choose a size for every selected piece.");
                return;
              }
              const buy = items.filter((x) => x.product.mode !== "quote");
              if (buy.length) onAdd(buy);
              else if (items.length) onQuote(items[0].product, items[0].size);
            }}
          >
            {items.length && items.every((x) => x.product.mode === "quote")
              ? "Request sample quote"
              : "Add selected pieces to bag"}{" "}
            ↗
          </button>
          {items.some((x) => x.product.mode === "quote") &&
            items.some((x) => x.product.mode !== "quote") && (
              <p className="small-note">
                Quote-only pieces require a separate request.
              </p>
            )}
        </div>
      </div>
      <div className="outfit-picker">
        <span className="eyebrow">BUILD YOUR LOOK / SELECT ANY PIECE</span>
        <div>
          {products.map((p) => (
            <button
              className={
                items.some((x) => x.product.id === p.id) ? "active" : ""
              }
              key={p.id}
              onClick={() => {
                onSelect(p);
                setError("");
              }}
              aria-pressed={items.some((x) => x.product.id === p.id)}
            >
              <Art product={p} />
              <span>{p.name}</span>
              <small>
                {slotFor(p) === "complete" ? "Complete look" : slotFor(p)}
              </small>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
