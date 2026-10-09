import { useRef, lazy, Suspense } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Art, Reveal } from "../components/UI.jsx";
import { money } from "../catalog.js";
const Mannequin = lazy(() => import("../components/Mannequin.jsx"));
export default function Storefront({
  products,
  filter,
  onFilter,
  onProduct,
  onPreview,
  selectionItems,
  onOpenPreview,
  onBag,
  bagCount,
}) {
  const hero = useRef(),
    reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 130]),
    textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const visible = products.filter(
    (p) => filter === "All" || p.category === filter,
  );
  return (
    <>
      <motion.div
        className="intro-curtain"
        aria-hidden="true"
        initial={reduced ? false : { scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.1, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="scroll-progress"
        style={{ scaleX: useScroll().scrollYProgress }}
      />
      <header>
        <a className="wordmark" href="#">
          fenimi<span>FASHION</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#collection">Collection</a>
          <a href="#atelier">The atelier</a>
          <a href="#story">Our perspective</a>
        </nav>
        <div className="nav-actions">
          <button onClick={onOpenPreview}>
            My look <span>{selectionItems.length}</span>
          </button>
          <button onClick={onBag}>
            Bag <span id="bagCount">{bagCount}</span>
          </button>
        </div>
      </header>
      <main>
        <section ref={hero} className="hero">
          <div className="hero-kicker">
            <span>ILE-IFE, NIGERIA</span>
            <span>COLLECTION STUDY / 001</span>
          </div>
          <motion.h1 style={reduced ? undefined : { y: textY }}>
            {["THE ART", "OF BEING."].map((line, i) => (
              <span className="line-mask" key={line}>
                <motion.span
                  initial={reduced ? false : { y: "115%", rotate: 4 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 1.3,
                    delay: 0.25 + i * 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {i === 0 ? (
                    line
                  ) : (
                    <>
                      OF <em>BEING.</em>
                    </>
                  )}
                </motion.span>
              </span>
            ))}
          </motion.h1>
          <motion.div
            className="hero-image"
            style={reduced ? undefined : { y: imageY }}
            initial={reduced ? false : { clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="/assets/editorial.jpg"
              alt="Editorial sample: a model wearing a belted coat in an architectural setting"
              animate={reduced ? {} : { scale: [1, 1.06, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="image-caption">FORM. FEELING. FENIMI.</span>
            <div className="image-index">01 — 06</div>
          </motion.div>
          <div className="hero-bottom">
            <p>
              Considered silhouettes.
              <br />
              Uncompromising expression.
            </p>
            <motion.a
              className="round-link"
              href="#collection"
              whileHover={reduced ? {} : { x: 8 }}
            >
              <span>Explore the collection</span>
              <b>↗</b>
            </motion.a>
            <span className="vertical-note">SCROLL TO DISCOVER ↓</span>
          </div>
          <div className="hero-outline" aria-hidden="true">
            F
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <span>
            A STUDY IN SILHOUETTE &nbsp; ✳ &nbsp; MADE TO BE YOU &nbsp; ✳
            &nbsp; A STUDY IN SILHOUETTE &nbsp; ✳ &nbsp; MADE TO BE YOU &nbsp;
            ✳ &nbsp;
          </span>
        </div>
        <section id="collection" className="collection section">
          <Reveal className="section-heading">
            <div>
              <span className="eyebrow">01 / THE COLLECTION</span>
              <h2>
                Pieces with <em>presence.</em>
              </h2>
            </div>
            <p>
              From everyday expression to extraordinary moments.
              <br />
              Choose a piece. Build a look. Make it yours.
            </p>
          </Reveal>
          <div className="collection-toolbar">
            <div className="filters" aria-label="Filter collection">
              {["All", "Womenswear", "Streetwear", "Occasion"].map((f) => (
                <button
                  key={f}
                  onClick={() => onFilter(f)}
                  className={filter === f ? "active" : ""}
                >
                  {f === "All" ? "All pieces" : f}
                </button>
              ))}
            </div>
            <span id="productCount">{visible.length} PIECES</span>
          </div>
          <motion.div layout className="product-grid">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => (
                <motion.article
                  layout
                  key={p.id}
                  data-product={p.id}
                  className="product-card"
                  initial={reduced ? false : { opacity: 0, y: 70, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{
                    duration: 0.7,
                    delay: (i % 3) * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <motion.button
                    className="product-art"
                    onClick={() => onProduct(p)}
                    aria-label={`View ${p.name}`}
                    whileHover={reduced ? {} : { scale: 0.98 }}
                  >
                    <span className="product-tag">
                      {p.mode === "quote"
                        ? "BESPOKE / SAMPLE"
                        : p.mode === "deposit"
                          ? "DEPOSIT PREORDER"
                          : p.availability.toUpperCase()}
                    </span>
                    <Art product={p} />
                    <span className="product-number">
                      {String(p.id).padStart(2, "0")} / FORM STUDY
                    </span>
                  </motion.button>
                  <div className="product-info">
                    <div>
                      <button
                        className="product-title"
                        onClick={() => onProduct(p)}
                      >
                        {p.name}
                      </button>
                      <p>{p.category}</p>
                    </div>
                    <span className="price">
                      {p.mode === "quote" ? "Guide " : ""}
                      {money(p.price)}
                    </span>
                  </div>
                  <button
                    className="catalog-preview"
                    onClick={() => onPreview(p)}
                  >
                    Preview on mannequin <span>↗</span>
                  </button>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <p className="demo-note">
            DESIGN SAMPLE — Illustrative products, prices and dispatch dates.
            Final collection follows brand review.
          </p>
        </section>
        <section id="atelier" className="atelier section">
          <Reveal className="atelier-copy">
            <span className="eyebrow">02 / YOUR VIRTUAL ATELIER</span>
            <h2>
              Style it.
              <br />
              Spin it.
              <br />
              <em>Make it yours.</em>
            </h2>
            <p>
              Every piece has a new perspective. Combine a top and trousers from
              the collection, layer a jacket, or choose a complete look.
            </p>
            <span className="small-note">
              OUTFIT PREVIEW · DEMONSTRATION GARMENTS
              <br />A visual styling experience; personal fit is not predicted.
            </span>
            <div className="look-buttons">
              <button
                onClick={() =>
                  onPreview(products.find((p) => p.type === "shirt"))
                }
              >
                Start with a top ↗
              </button>
              <button
                onClick={() =>
                  onPreview(products.find((p) => p.type === "trousers"))
                }
              >
                Choose trousers ↗
              </button>
            </div>
            <button className="button light" onClick={onOpenPreview}>
              {selectionItems.length
                ? "Preview my selected pieces"
                : "Build your own look"}{" "}
              ↗
            </button>
          </Reveal>
          <Reveal className="atelier-scene">
            <Suspense
              fallback={
                <div className="scene-wrap loading-scene">
                  Preparing the atelier…
                </div>
              }
            >
              <Mannequin
                items={
                  selectionItems.length
                    ? selectionItems
                    : [{ product: products[0], size: "M" }]
                }
              />
            </Suspense>
          </Reveal>
        </section>
        <section id="story" className="story section">
          <span className="eyebrow">03 / OUR PERSPECTIVE</span>
          <Reveal>
            <h2>
              Less noise.
              <br />
              More <em>expression.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p>
              Fashion as a way of being. A space for clean lines, bold
              proportions, and pieces that feel unmistakably yours.
            </p>
            <p className="small-note">
              An imagined creative direction for Fenimi Fashion.
              <br />
              Rooted in Ile-Ife. Open to possibility.
            </p>
            <a href="#collection" className="text-link">
              Find your silhouette ↗
            </a>
          </Reveal>
        </section>
      </main>
      <footer>
        <a href="#" className="footer-logo">
          fenimi.
        </a>
        <div>
          <span>FASHION, IN YOUR OWN FORM.</span>
          <p>Ile-Ife, Osun State, Nigeria</p>
        </div>
        <div>
          <p>© 2026 Fenimi Fashion · Design prototype</p>
        </div>
      </footer>
      <AnimatePresence>
        {selectionItems.length > 0 && (
          <motion.button
            className="selection-tray"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={onOpenPreview}
          >
            <span>
              {selectionItems.length}{" "}
              {selectionItems.length === 1 ? "piece" : "pieces"} in your look
            </span>
            <strong>Preview selected items on mannequin ↗</strong>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
