import React, { useRef, useState, useEffect } from "react";
import "../styles/Carousel.css";
import { Link } from "react-router-dom";
import type { Product } from "../interfaces/Product";



type Props = {
  title: string;
  products?: Product[];
};

export const CategoryCarousel: React.FC<Props> = ({ title, products = [] }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [products]);

  const scrollBy = (direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) * direction;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Autoplay: scroll periodically, pause on hover/focus
  const autoplayRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tick = () => {
      if (pausedRef.current) return;
      // If can scroll more to the right, scroll; otherwise rewind to start
      if (el.scrollLeft + el.clientWidth < el.scrollWidth - 4) {
        el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: "smooth" });
      } else {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }
    };

    autoplayRef.current = window.setInterval(tick, 4200);

    const onEnter = () => { pausedRef.current = true; };
    const onLeave = () => { pausedRef.current = false; };
    const onFocusIn = () => { pausedRef.current = true; };
    const onFocusOut = () => { pausedRef.current = false; };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);

    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [products]);

  return (
    <section className="category-carousel">
      <div className="carousel-header">
        <h3 className="carousel-title">{title}</h3>
        <div className="carousel-controls">
          <button
            className="carousel-arrow"
            aria-label="Précédent"
            onClick={() => { scrollBy(-1); pausedRef.current = true; setTimeout(() => (pausedRef.current = false), 2000); }}
            disabled={!canScrollLeft}
          >
            ‹
          </button>
          <button
            className="carousel-arrow"
            aria-label="Suivant"
            onClick={() => { scrollBy(1); pausedRef.current = true; setTimeout(() => (pausedRef.current = false), 2000); }}
            disabled={!canScrollRight}
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-track" ref={trackRef} role="list">
        {products.map((p, i) => {
          const id = (p as any)?.identifiant_produit ?? (p as any)?.id ?? (p as any)?._id ?? '';
          const key = id || `prod-${i}`;
          const thumb = (p as any)?.thumbnail ?? (p as any)?.image ?? '';
          const name = (p as any)?.nom_produit ?? (p as any)?.name ?? 'Produit';
          const price = (p as any)?.prix_unitaire_produit ?? (p as any)?.prix ?? (p as any)?.price ?? '';
          return (
            <article className="carousel-item" key={key} role="listitem">
              <Link to={`/products/detail/${id}`}>
                <div className="item-image">
                  <img src={thumb} alt={name} loading="lazy" />
                </div>
                <div className="item-body">
                  <div className="item-title">{name}</div>
                  <div className="item-price">{price} FCFA</div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryCarousel;
