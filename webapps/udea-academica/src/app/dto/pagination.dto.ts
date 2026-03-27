// src/app/dto/pagination.dto.ts
export interface PageResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
