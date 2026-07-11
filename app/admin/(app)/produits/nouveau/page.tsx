import { ProductForm } from "../product-form";
import admin from "../../../admin.module.css";

export default function NewProduct() {
  return (
    <>
      <div className={admin.header}>
        <div>
          <h1 className={admin.title}>Nouvelle pièce</h1>
          <p className={admin.subtitle}>
            L&apos;identifiant d&apos;URL est dérivé du nom automatiquement.
          </p>
        </div>
      </div>
      <ProductForm />
    </>
  );
}
