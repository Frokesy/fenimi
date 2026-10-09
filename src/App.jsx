import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Storefront from "./pages/Storefront.jsx";
import { products as initialProducts } from "./catalog.js";
import { selectOutfit, outfitItems } from "./outfit.js";
import { ProductDetails, Bag, Checkout } from "./components/Shopping.jsx";
const OutfitPreview = lazy(() => import("./components/OutfitPreview.jsx"));
const AdminGate = lazy(() => import("./components/AdminGate.jsx"));
export default function App() {
  const [products, setProducts] = useState(initialProducts),
    [path, setPath] = useState(location.pathname),
    [filter, setFilter] = useState("All"),
    [selection, setSelection] = useState({}),
    [bag, setBag] = useState([]),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState("");
  const toastTimer = useRef(),
    uploads = useRef([]);
  useEffect(() => {
    const changed = () => {
      setPath(location.pathname);
      setModal(null);
    };
    addEventListener("popstate", changed);
    return () => {
      removeEventListener("popstate", changed);
      clearTimeout(toastTimer.current);
      uploads.current.forEach(URL.revokeObjectURL);
    };
  }, []);
  const navigate = (p) => {
    history.pushState({}, "", p);
    setPath(p);
    setModal(null);
    window.scrollTo(0, 0);
  };
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const selected = useMemo(
    () => outfitItems(selection, products),
    [selection, products],
  );
  function add(p, size) {
    setBag((old) => {
      const match = old.find((x) => x.id === p.id && x.size === size);
      return match
        ? old.map((x) => (x === match ? { ...x, quantity: x.quantity + 1 } : x))
        : [...old, { id: p.id, size, quantity: 1 }];
    });
  }
  function preview(p, size = "") {
    setSelection((old) => selectOutfit(old, p, size));
    setModal({ kind: "outfit" });
  }
  function quote(p, size) {
    setModal({ kind: "checkout", order: { kind: "quote", product: p, size } });
  }
  const close = () => setModal(null);
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ ease: [0.22, 1, 0.36, 1] }}
    >
      {path.startsWith("/admin") ? (
        <Suspense fallback={<div className="admin-login">Opening Studio…</div>}>
          <AdminGate
            path={path}
            onNavigate={navigate}
            onAdd={(p) => {
              if (p.image) uploads.current.push(p.image);
              setProducts((old) => [
                ...old,
                { ...p, id: Math.max(...old.map((x) => x.id)) + 1 },
              ]);
              notify("Sample product added to the collection.");
            }}
          />
        </Suspense>
      ) : path === "/" ? (
        <Storefront
          products={products}
          filter={filter}
          onFilter={setFilter}
          onProduct={(p) => setModal({ kind: "product", product: p })}
          onPreview={preview}
          selectionItems={selected}
          onOpenPreview={() => setModal({ kind: "outfit" })}
          onBag={() => setModal({ kind: "bag" })}
          bagCount={bag.reduce((n, x) => n + x.quantity, 0)}
        />
      ) : (
        <main className="admin-login">
          <h1>Page not found.</h1>
          <button className="button" onClick={() => navigate("/")}>
            Return to Fenimi ↗
          </button>
        </main>
      )}
      <AnimatePresence mode="wait">
        {modal?.kind === "product" && (
          <ProductDetails
            key="product"
            product={modal.product}
            onClose={close}
            onPreview={preview}
            onQuote={quote}
            onAdd={(p, size) => {
              add(p, size);
              close();
              notify(`${p.name} added to your bag.`);
            }}
          />
        )}
        {modal?.kind === "bag" && (
          <Bag
            key="bag"
            bag={bag}
            products={products}
            onClose={close}
            onPreview={preview}
            onChange={(item, delta) =>
              setBag((old) =>
                old
                  .map((x) =>
                    x === item ? { ...x, quantity: x.quantity + delta } : x,
                  )
                  .filter((x) => x.quantity > 0),
              )
            }
            onCheckout={(total) =>
              setModal({ kind: "checkout", order: { kind: "order", total } })
            }
          />
        )}{" "}
        {modal?.kind === "checkout" && (
          <Checkout
            key="checkout"
            order={modal.order}
            bag={bag}
            products={products}
            onClose={close}
            onComplete={() => setBag([])}
          />
        )}{" "}
        {modal?.kind === "outfit" && (
          <Suspense key="outfit" fallback={null}>
            <OutfitPreview
              selection={selection}
              products={products}
              onSelect={(p) => setSelection((old) => selectOutfit(old, p))}
              onRemove={(slot) =>
                setSelection((old) => {
                  const next = { ...old };
                  delete next[slot];
                  return next;
                })
              }
              onSize={(slot, size) =>
                setSelection((old) => ({
                  ...old,
                  [slot]: { ...old[slot], size },
                }))
              }
              onAdd={(items) => {
                items.forEach((x) => add(x.product, x.size));
                close();
                notify("Your selected pieces were added to the bag.");
              }}
              onQuote={quote}
              onClose={close}
            />
          </Suspense>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
