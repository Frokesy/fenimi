import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { garmentSVG } from "../catalog.js";
export function Art({ product }) {
  return product.image ? (
    <img src={product.image} alt={product.name} />
  ) : (
    <div
      className="garment-art"
      dangerouslySetInnerHTML={{ __html: garmentSVG(product) }}
    />
  );
}
export function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 55, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Modal({ children, onClose, className = "", label }) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const cancel = (e) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", cancel);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.close();
      previous?.focus();
    };
  }, []);
  const reduced = useReducedMotion();
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 35, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, y: 30 }}
        transition={{ duration: 0.35 }}
      >
        <button
          className="close"
          onClick={onClose}
          aria-label={`Close ${label}`}
        >
          ×
        </button>
        {children}
      </motion.div>
    </dialog>
  );
}
