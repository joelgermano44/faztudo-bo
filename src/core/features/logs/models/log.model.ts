/**
 * A API não documenta o schema devolvido por `GET /logs` (nenhum DTO, nenhuma
 * anotação Swagger no `LoggerController`/`LoggerService`). Tipado como
 * `unknown` de propósito, para não inventar propriedades que a API não
 * garante.
 */
export type LogEntry = unknown;
