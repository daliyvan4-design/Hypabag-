"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { Piece } from "@/lib/pieces";
import styles from "./product-form.module.css";

const ERRORS: Record<string, string> = {
  nom_requis: "Le nom est requis.",
  nom_invalide: "Ce nom ne produit pas d'identifiant valide.",
  matiere_requise: "La matière est requise.",
  phrase_requise: "La phrase de collection est requise.",
  prix_invalide: "Le prix doit être un nombre positif.",
  largeur_invalide: "La largeur doit être comprise entre 15 et 100.",
  decalage_invalide: "Le décalage doit être compris entre 0 et 200.",
  introuvable: "Cette pièce n'existe plus.",
  fichier_trop_lourd: "Image trop lourde (max 12 Mo).",
  image_attendue: "Le fichier doit être une image.",
  cloudinary_not_configured: "Cloudinary n'est pas configuré.",
};

function message(error: string | undefined): string {
  return (error && ERRORS[error]) || "Une erreur est survenue.";
}

export function ProductForm({ product }: { product?: Piece }) {
  const router = useRouter();
  const editing = Boolean(product);

  const [photo, setPhoto] = useState(product?.photo?.src ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const body = new FormData();
    body.set("file", file);
    body.set("slot", "product");

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result: unknown = await response.json().catch(() => null);
      if (response.ok) {
        setPhoto((result as { upload: { url: string } }).upload.url);
      } else {
        setError(message((result as { error?: string })?.error));
      }
    } catch {
      setError("Téléversement impossible.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");

    const payload = {
      nom: data.get("nom"),
      matiere: data.get("matiere"),
      prix: Number(data.get("prix")),
      phrase: data.get("phrase"),
      sousTitre: data.get("sousTitre"),
      largeur: Number(data.get("largeur")),
      decalage: Number(data.get("decalage")),
      stock: Number(data.get("stock")),
      paragraphes: String(data.get("paragraphes") ?? "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean),
      photo: photo ? { src: photo, alt: String(data.get("nom")), cartel: String(data.get("cartel") ?? "") } : undefined,
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/products/${product!.slug}` : "/api/admin/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result: unknown = await response.json().catch(() => null);
      if (response.ok) {
        router.push("/admin/produits");
        router.refresh();
      } else {
        setError(message((result as { error?: string })?.error));
        setSaving(false);
      }
    } catch {
      setError("Enregistrement impossible.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Supprimer « ${product.nom} » ? Cette action est définitive.`)) {
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${product.slug}`, { method: "DELETE" });
      router.push("/admin/produits");
      router.refresh();
    } catch {
      setError("Suppression impossible.");
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nom">
            Nom
          </label>
          <input id="nom" name="nom" required maxLength={80} defaultValue={product?.nom} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="prix">
            Prix (FCFA)
          </label>
          <input
            id="prix"
            name="prix"
            type="number"
            min={0}
            step={5000}
            required
            defaultValue={product?.prix}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="stock">
          Stock <span className={styles.hint}>— nombre de pièces disponibles (0 = épuisé)</span>
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min={0}
          max={9999}
          required
          defaultValue={product?.stock ?? 1}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="matiere">
          Matière
        </label>
        <input
          id="matiere"
          name="matiere"
          required
          maxLength={120}
          placeholder="Cordon bordeaux + laiton"
          defaultValue={product?.matiere}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="phrase">
          Phrase de collection
        </label>
        <input
          id="phrase"
          name="phrase"
          required
          maxLength={200}
          placeholder="Une torsade continue, refermée sur elle-même."
          defaultValue={product?.phrase}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sousTitre">
          Sous-titre (fiche) <span className={styles.hint}>— optionnel</span>
        </label>
        <input
          id="sousTitre"
          name="sousTitre"
          maxLength={160}
          placeholder="Cordon de coton tressé bordeaux · fermoir laiton brossé"
          defaultValue={product?.sousTitre}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="paragraphes">
          Description <span className={styles.hint}>— un paragraphe par bloc, séparés par une ligne vide</span>
        </label>
        <textarea
          id="paragraphes"
          name="paragraphes"
          className={styles.textarea}
          defaultValue={product?.paragraphes?.join("\n\n")}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="largeur">
            Largeur de vignette (%) <span className={styles.hint}>15–100</span>
          </label>
          <input
            id="largeur"
            name="largeur"
            type="number"
            min={15}
            max={100}
            defaultValue={product?.largeur ?? 30}
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="decalage">
            Décalage vertical (px) <span className={styles.hint}>0–200</span>
          </label>
          <input
            id="decalage"
            name="decalage"
            type="number"
            min={0}
            max={200}
            defaultValue={product?.decalage ?? 0}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Photo produit</span>
        <div className={styles.uploader}>
          {photo ? (
            <span className={styles.preview}>
              <Image src={photo} alt="" width={96} height={96} unoptimized />
            </span>
          ) : (
            <span className={styles.previewEmpty}>Bande rayée par défaut</span>
          )}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
              id="photo-file"
            />
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Téléversement…" : photo ? "Remplacer" : "Téléverser une image"}
            </button>
            {photo ? (
              <button
                type="button"
                className={styles.cancel}
                style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setPhoto("")}
              >
                Retirer
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {photo ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cartel">
            Légende de la photo
          </label>
          <input
            id="cartel"
            name="cartel"
            maxLength={160}
            placeholder="Vue n°1 · le tressage, à hauteur de fibre."
            defaultValue={product?.photo?.cartel}
            className={styles.input}
          />
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.save} disabled={saving || uploading}>
          {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer la pièce"}
        </button>
        <Link href="/admin/produits" className={styles.cancel}>
          Annuler
        </Link>
        {editing ? (
          <button type="button" className={styles.delete} onClick={handleDelete} disabled={saving}>
            Supprimer
          </button>
        ) : null}
      </div>
    </form>
  );
}
