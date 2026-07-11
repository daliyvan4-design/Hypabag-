import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "../nav";
import { isAuthenticated } from "@/lib/admin-auth";
import { LOGO_MARK } from "@/lib/media";
import styles from "../admin.module.css";

// Defense in depth: middleware already redirects, but never render the shell
// (or run its data loaders) for an unauthenticated request.
export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark}>
            <Image src={LOGO_MARK} alt="" width={26} height={26} />
          </span>
          HYPA
        </Link>
        <div className={styles.brandSub}>ATELIER</div>
        <AdminNav />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
