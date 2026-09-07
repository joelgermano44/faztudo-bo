import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../models/address.model';

/**
 * Gestão de moradas.
 *
 * `POST /addresses/testBody` não está mapeado: é um endpoint de teste que
 * apenas ecoa o corpo enviado, sem qualquer efeito ou valor para o backoffice.
 */
@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/addresses`;

  /** `POST /addresses` — cria uma morada. */
  create(body: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(this.resource, body);
  }

  /** `GET /addresses` — lista todas as moradas. */
  findAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.resource);
  }

  /** `GET /addresses/:id` — obtém uma morada pelo ID. */
  findOne(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.resource}/${id}`);
  }

  /** `PUT /addresses/:id` — atualiza os campos enviados. */
  update(id: number, body: UpdateAddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /addresses/:id` — elimina a morada. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }
}
