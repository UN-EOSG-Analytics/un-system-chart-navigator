"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import EntityModal from "./EntityModal";
import { getEntityBySlug } from "@/lib/entities";
import { resolveEntityAlias } from "@/lib/entityAliases";

// Session storage key for return URL (set by EntitiesGrid before opening modal)
const RETURN_URL_KEY = "entityModalReturnUrl";

export default function ModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entitySlug = searchParams.get("entity");

  // Canonical URL form is a lowercase, non-alias slug (SEO best practice).
  // `resolveEntityAlias` already returns lowercase for known aliases; the extra
  // `toLowerCase()` covers canonical slugs typed in the wrong case.
  const canonicalSlug = entitySlug
    ? resolveEntityAlias(entitySlug).toLowerCase()
    : null;
  const needsRedirect = canonicalSlug !== null && canonicalSlug !== entitySlug;

  // Entity lookup is a synchronous map read over statically imported JSON, so
  // it is derived during render rather than mirrored into state via an effect.
  // Looking up the *canonical* slug means the modal renders correct content even
  // if the URL redirect below never lands (EntityGrid's own history.replaceState
  // can clobber it), instead of hanging on a skeleton or flashing "Not Found".
  const entity = canonicalSlug ? getEntityBySlug(canonicalSlug) : null;
  const notFound = canonicalSlug !== null && !entity;

  // Attempts to canonicalize the URL, preserving other params (`q`, `expand`).
  // NOTE: this currently has no observable effect — EntityGrid's mount effect
  // (EntityGrid.tsx:88-96) rewrites the URL via history.replaceState and wins,
  // so the address bar can keep a non-canonical slug. Rendering does not depend
  // on it; it becomes live again if that clobber is fixed.
  useEffect(() => {
    if (!needsRedirect || canonicalSlug === null) return;
    const params = new URLSearchParams(window.location.search);
    params.set("entity", canonicalSlug);
    // Replace without scrolling to avoid a page jump; the updated param re-renders this component.
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [needsRedirect, canonicalSlug, router]);

  useEffect(() => {
    if (notFound) console.warn(`Entity "${entitySlug}" not found`);
  }, [notFound, entitySlug]);

  const handleClose = () => {
    // Get stored return URL and clear it
    const returnUrl = sessionStorage.getItem(RETURN_URL_KEY) || "/";
    sessionStorage.removeItem(RETURN_URL_KEY);
    router.replace(returnUrl, { scroll: false });
  };

  // Don't render anything if no entity slug
  if (!entitySlug) return null;

  // Never loading: the lookup above is synchronous, so there is no pending state.
  return <EntityModal entity={entity} onClose={handleClose} loading={false} />;
}
