import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
export default function Mannequin({ items }) {
  const host = useRef(),
    engine = useRef(),
    latest = useRef(items);
  latest.current = items;
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false),
    [auto, setAuto] = useState(!reduced);
  useEffect(() => {
    setAuto(!reduced);
  }, [reduced]);
  useEffect(() => {
    let cancelled = false;
    import("../scene.js")
      .then(({ createScene }) => {
        if (cancelled) return;
        try {
          engine.current = createScene(host.current, () => setFailed(true));
          engine.current.setOutfit(latest.current.map((x) => x.product));
          engine.current.setAuto(!reduced);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    engine.current?.setOutfit(items.map((x) => x.product));
  }, [items]);
  useEffect(() => {
    engine.current?.setAuto(auto);
  }, [auto]);
  return (
    <div className="scene-wrap">
      <div
        ref={host}
        className="scene"
        role="img"
        aria-label={`Mannequin outfit preview: ${items.map((x) => x.product.name).join(", ") || "no garments selected"}`}
      />
      {failed && (
        <div className="scene-fallback">
          <div className="fallback-mannequin">
            ◯<br />
            ╱▰╲
            <br />╱ ╲
          </div>
          <p>
            3D preview unavailable. Your selected pieces and shopping remain
            available.
          </p>
        </div>
      )}
      <div className="scene-top">
        <span>FENIMI / YOUR FORM STUDY</span>
        <button
          disabled={failed}
          aria-pressed={auto}
          onClick={() => setAuto(!auto)}
        >
          {auto ? "Pause rotation" : "Resume rotation"}
        </button>
      </div>
      <div className="scene-bottom">
        <span>DRAG TO ROTATE</span>
        <div>
          <button
            disabled={failed}
            onClick={() => engine.current?.rotate(-0.4)}
            aria-label="Rotate mannequin left"
          >
            ←
          </button>
          <button
            disabled={failed}
            onClick={() => engine.current?.rotate(0.4)}
            aria-label="Rotate mannequin right"
          >
            →
          </button>
        </div>
        <span>
          {items.length} SELECTED {items.length === 1 ? "PIECE" : "PIECES"}
        </span>
      </div>
    </div>
  );
}
