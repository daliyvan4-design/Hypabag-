"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { useCart } from "@/lib/cart";
import { LOGO_MARK } from "@/lib/media";
import styles from "./nav.module.css";

const LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/collection", label: "Collection" },
  { href: "/atelier", label: "Atelier" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const { count, hydrated, toggleDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);

  // Collapse the pill when the route changes, without an effect round-trip.
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  // On phones the pill starts collapsed: the first tap on the mark opens it,
  // and only a second tap navigates home.
  function handleLogoClick(event: MouseEvent) {
    const phone = window.matchMedia("(max-width: 860px)").matches;
    if (phone && !open) {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <nav className={styles.nav} data-open={open}>
      <Link
        href="/"
        className={styles.logo}
        onClick={handleLogoClick}
        aria-label="HYPA, retour à l'accueil"
      >
        <span className={styles.mark}>
          <Image src={LOGO_MARK} alt="" width={30} height={30} priority />
        </span>
        <span className={styles.hint} aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width="10"
            height="10"
            fill="none"
            stroke="#632434"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </Link>

      <div className={styles.collapse}>
        <div className={styles.links}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${isActive(pathname, link.href) ? styles.linkActive : ""}`}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleDrawer}
          className={styles.cartBtn}
          aria-label={
            hydrated && count > 0
              ? `Panier, ${count} pièce${count > 1 ? "s" : ""}`
              : "Panier"
          }
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#F4EEE4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
          </svg>
          {hydrated && count > 0 ? (
            <span className={styles.badge}>{count}</span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}
