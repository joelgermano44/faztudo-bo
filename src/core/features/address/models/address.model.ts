import { Address, AddressRequest } from '../../../shared/models/common.model';

/**
 * `Address` é usado por várias features (clients, professionals, orders) e
 * por isso vive em `core/shared/models`. Este ficheiro apenas reexporta os
 * contratos desta feature para consistência com a estrutura pedida
 * (`address/models`), sem duplicar a definição.
 */
export type { Address, AddressRequest };

/** Corpo de `POST /addresses`. */
export type CreateAddressRequest = Required<Pick<AddressRequest, 'municiple' | 'province' | 'address'>> &
  Pick<AddressRequest, 'lat' | 'lng'>;

/** Corpo de `PUT /addresses/:id`. Todos os campos são opcionais. */
export type UpdateAddressRequest = AddressRequest;
