import Image from "next/image";
import Link from "next/link";
import { formatEuro } from "@/lib/format";
import { getProducts } from "@/lib/products";
import styles from "./produits.module.css";
import admin from "../../admin.module.css";

export default async function AdminProducts() {
  const products = await getProducts();

  return (
    <>
      <div className={admin.header}>
        <div>
          <h1 className={admin.title}>Produits</h1>
          <p className={admin.subtitle}>
            {products.length} pièce{products.length > 1 ? "s" : ""} au catalogue.
          </p>
        </div>
        <Link href="/admin/produits/nouveau" className={styles.newBtn}>
          + Nouvelle pièce
        </Link>
      </div>

      <div className={admin.panel}>
        <div className={admin.tableScroll}>
          <table className={admin.table}>
            <thead>
              <tr>
                <th>Pièce</th>
                <th>Matière</th>
                <th className={admin.right}>Prix</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug}>
                  <td>
                    <div className={styles.pieceCell}>
                      {product.photo?.src ? (
                        <span className={styles.thumb}>
                          <Image src={product.photo.src} alt="" width={44} height={56} />
                        </span>
                      ) : (
                        <span className={styles.thumbStriped} aria-hidden />
                      )}
                      <div>
                        <div className={styles.pieceName}>{product.nom}</div>
                        <div className={styles.pieceSlug}>/{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.matiere}</td>
                  <td className={`${admin.right} ${admin.mono}`}>
                    {formatEuro(product.prix)}
                  </td>
                  <td>
                    <span className={product.paragraphes?.length ? admin.tag : admin.tagMuted}>
                      {product.paragraphes?.length ? "complète" : "phrase seule"}
                    </span>
                  </td>
                  <td className={admin.right}>
                    <Link href={`/admin/produits/${product.slug}`} className={styles.edit}>
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
