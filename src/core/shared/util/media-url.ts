import { Media } from '../models/common.model';

/**
 * `Media.path` já vem completo (ex.: `uploads/services/x.jpg`), só falta o
 * domínio. A API corre em Windows e por vezes devolve o caminho com `\`
 * (separador do SO) em vez de `/`, por isso normalizamos antes de juntar.
 */
export function buildMediaUrl(baseUrl: string, media: Media): string {
  const normalizedPath = media.path.replace(/\\/g, '/').replace(/^\/+/, '');
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  return `${normalizedBase}/${normalizedPath}`;
}
