/**
 * Faz scroll suave até um elemento pelo id, ou até ao topo quando `sectionId`
 * é `null`. Só chamar quando `isPlatformBrowser` for `true` — em SSR não há
 * `window`/`document`.
 */
export function scrollToSection(sectionId: string | null): void {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}
