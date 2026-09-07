import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { Category, CategoryWithServices, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

/** Gestão do catálogo de categorias de serviços. */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/categories`;

  /** `POST /categories` — cria uma categoria. */
  create(body: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.resource, body);
  }

  /** `GET /categories` — lista todas as categorias. */
  findAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.resource);
  }

  /** `GET /categories/with-services` — lista categorias com os serviços vinculados. */
  findAllWithServices(): Observable<CategoryWithServices[]> {
    return this.http.get<CategoryWithServices[]>(`${this.resource}/with-services`);
  }

  /** `GET /categories/:id` — obtém uma categoria pelo ID. */
  findOne(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.resource}/${id}`);
  }

  /** `PATCH /categories/:id` — atualiza os campos enviados. */
  update(id: number, body: UpdateCategoryRequest): Observable<Category> {
    return this.http.patch<Category>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /categories/:id` — elimina a categoria. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }
}
