"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/media", label: "Média & vidéos" },
  { href: "/admin/commandes", label: "Commandes" },
];

function active(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className={styles.nav} aria-label="Navigation du backoffice">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={active(pathname, link.href) ? styles.navLinkActive : styles.navLink}
          aria-current={active(pathname, link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
      <div className={styles.sidebarFoot}>
        <Link href="/" className={styles.viewSite} target="_blank">
          Voir le site ↗
        </Link>
        <button type="button" className={styles.logout} onClick={logout}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
