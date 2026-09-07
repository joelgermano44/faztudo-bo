import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { Media, UpdateMediaRequest, UploadMediaRequest } from '../models/media.model';

/**
 * Gestão de ficheiros enviados para a plataforma.
 *
 * `GET /medias/test` não está mapeado: é um endpoint de diagnóstico que
 * devolve sempre o `package.json` do servidor, sem qualquer valor de domínio.
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/medias`;

  /** `POST /medias/upload-image` — envia uma imagem (`multipart/form-data`). */
  upload(body: UploadMediaRequest): Observable<Media> {
    const formData = new FormData();
    formData.append('file', body.file);
    formData.append('item_id', String(body.item_id));
    formData.append('item_type', body.item_type);
    return this.http.post<Media>(`${this.resource}/upload-image`, formData);
  }

  /** `GET /medias` — lista todas as mídias. */
  findAll(): Observable<Media[]> {
    return this.http.get<Media[]>(this.resource);
  }

  /** `GET /medias/byName/:name` — descarrega um ficheiro pelo nome guardado. */
  getFileByName(name: string): Observable<Blob> {
    return this.http.get(`${this.resource}/byName/${name}`, { responseType: 'blob' });
  }

  /** `GET /medias/:id` — obtém uma mídia pelo ID. */
  findOne(id: number): Observable<Media> {
    return this.http.get<Media>(`${this.resource}/${id}`);
  }

  /** `PATCH /medias/:id` — atualiza os metadados de uma mídia. */
  update(id: number, body: UpdateMediaRequest): Observable<Media> {
    return this.http.patch<Media>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /medias/:id` — elimina uma mídia. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }
}
