import { useState } from "react";
import { Art, Modal } from "./UI.jsx";
import { money, due } from "../catalog.js";
export function ProductDetails({
  product: p,
  onClose,
  onAdd,
  onPreview,
  onQuote,
}) {
  const [size, setSize] = useState(""),
    [error, setError] = useState("");
  return (
    <Modal onClose={onClose} className="product-dialog" label="product">
      <div className="detail-layout">
        <div className="detail-art">
          <Art product={p} />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{p.category} / DESIGN SAMPLE</span>
          <h2>{p.name}</h2>
          <div className="detail-price">
            {p.mode === "quote" ? "Guide price · " : ""}
            {money(p.price)}
          </div>
          <p>{p.description}</p>
          <label>Select your size</label>
          <div className="sizes">
            {p.sizes.map((s) => (
              <button
                key={s}
                className={size === s ? "active" : ""}
                aria-pressed={size === s}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p>
            {p.availability} · Example dispatch:{" "}
            {new Date(p.date + "T12:00:00").toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {p.mode === "deposit" && (
            <p>
              <strong>
                {p.deposit}% deposit: {money(due(p))}
              </strong>
              <br />
              Example balance: {money(p.price - due(p))}, due before dispatch.
            </p>
          )}
          {p.mode === "quote" && (
            <p>
              Final price and measurements are confirmed after consultation.
            </p>
          )}
          <button
            className="button light preview-action"
            onClick={() => onPreview(p, size)}
          >
            Preview on mannequin ↗
          </button>
          <button
            className="button"
            onClick={() => {
              if (!size) {
                setError("Choose a size to continue.");
                return;
              }
              p.mode === "quote" ? onQuote(p, size) : onAdd(p, size);
            }}
          >
            {p.mode === "quote"
              ? "Request a sample quote"
              : p.mode === "deposit"
                ? "Preorder with deposit"
                : "Add to bag"}{" "}
            ↗
          </button>
          {error && <p role="alert">{error}</p>}
          <p className="small-note">
            Demonstration product. Orders and payments are simulated.
          </p>
        </div>
      </div>
    </Modal>
  );
}
export function Bag({
  bag,
  products,
  onClose,
  onChange,
  onCheckout,
  onPreview,
}) {
  const total = bag.reduce(
    (n, x) => n + due(products.find((p) => p.id === x.id)) * x.quantity,
    0,
  );
  return (
    <Modal onClose={onClose} className="bag-dialog" label="bag">
      <h2>Your bag ({bag.reduce((n, x) => n + x.quantity, 0)})</h2>
      {!bag.length ? (
        <>
          <p>Your next expression starts here.</p>
          <button className="button" onClick={onClose}>
            Explore the collection ↗
          </button>
        </>
      ) : (
        <>
          {bag.map((x) => {
            const p = products.find((p) => p.id === x.id);
            return (
              <div className="bag-row" key={x.id + x.size}>
                <Art product={p} />
                <div>
                  <h3>{p.name}</h3>
                  <p>
                    Size {x.size} ·{" "}
                    {p.mode === "deposit"
                      ? p.deposit + "% deposit"
                      : "Full payment"}
                  </p>
                  <div className="quantity">
                    <button
                      aria-label={`Decrease ${p.name} quantity`}
                      onClick={() => onChange(x, -1)}
                    >
                      −
                    </button>
                    <span>{x.quantity}</span>
                    <button
                      aria-label={`Increase ${p.name} quantity`}
                      onClick={() => onChange(x, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove"
                    onClick={() => onChange(x, -x.quantity)}
                  >
                    Remove
                  </button>
                  <button
                    className="remove"
                    onClick={() => onPreview(p, x.size)}
                  >
                    Preview this piece ↗
                  </button>
                </div>
                <span>{money(due(p) * x.quantity)}</span>
              </div>
            );
          })}
          <div className="totals">
            <span>Due today</span>
            <strong>{money(total)}</strong>
          </div>
          <p className="small-note">
            Example delivery area: Ile-Ife. Delivery fees await confirmation.
            <br />
            Deposit balances are separate from today's total.
          </p>
          <button className="button" onClick={() => onCheckout(total)}>
            Continue to sample checkout ↗
          </button>
          <p className="demo-note">No real payment will be collected.</p>
        </>
      )}
    </Modal>
  );
}
export function Checkout({ order, bag, products, onClose, onComplete }) {
  const [complete, setComplete] = useState(false);
  const quote = order.kind === "quote";
  const balance = bag.reduce((n, x) => {
    const p = products.find((p) => p.id === x.id);
    return n + (p.mode === "deposit" ? p.price - due(p) : 0) * x.quantity;
  }, 0);
  const [finalBalance, setFinalBalance] = useState(0);
  return (
    <Modal onClose={onClose} label="checkout">
      {complete ? (
        <>
          <div className="success-icon">↗</div>
          <span className="eyebrow">
            SAMPLE {quote ? "REQUEST" : "ORDER"} / COMPLETE
          </span>
          <h2>{quote ? "Your vision, imagined." : "A beautiful beginning."}</h2>
          <p>
            {quote
              ? "No request was sent and no payment was collected."
              : "Your simulated order is complete. No payment was taken and no order was sent to Fenimi Fashion."}
          </p>
          {!quote && (
            <p>
              Sample amount paid: <strong>{money(order.total)}</strong>
              {finalBalance > 0 && (
                <>
                  <br />
                  Sample balance before dispatch: {money(finalBalance)}
                </>
              )}
            </p>
          )}
          <button className="button" onClick={onClose}>
            Keep exploring ↗
          </button>
        </>
      ) : (
        <>
          <span className="eyebrow">
            DEMONSTRATION {quote ? "QUOTE REQUEST" : "CHECKOUT"}
          </span>
          <h2>{quote ? "Made for your moment." : "Your next expression."}</h2>
          {quote ? (
            <p>
              {order.product.name} · Size {order.size}
              <br />
              Illustrative guide price: {money(order.product.price)}
            </p>
          ) : (
            <div className="totals">
              <span>Sample amount due today</span>
              <strong>{money(order.total)}</strong>
            </div>
          )}
          <form
            className="form-fields"
            onSubmit={(e) => {
              e.preventDefault();
              setFinalBalance(balance);
              setComplete(true);
              if (!quote) onComplete();
            }}
          >
            <label>
              Name
              <input
                name="customer"
                defaultValue="Sample customer"
                required
                autoComplete="off"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                defaultValue="sample@example.com"
                required
                autoComplete="off"
              />
            </label>
            {quote ? (
              <label>
                Tell us about your occasion
                <textarea placeholder="Example: an evening celebration" />
              </label>
            ) : (
              <label>
                Delivery address in Ile-Ife
                <input
                  defaultValue="Example address, Ile-Ife"
                  required
                  autoComplete="off"
                />
              </label>
            )}
            <p className="demo-banner">
              Use the sample details provided. Nothing is sent or stored; no
              payment details are requested.
            </p>
            <button className="button" type="submit">
              {quote ? "Preview quote request" : "Simulate payment"} ↗
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}
