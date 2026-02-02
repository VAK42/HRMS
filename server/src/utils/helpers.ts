import { PaginationQuery } from '../types/index.js';
export const buildPagination = (query: PaginationQuery, allowedSortFields: string[]) => {
  const page = Math.max(1, parseInt(String(query.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10));
  const offset = (page - 1) * limit;
  const sortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  return { page, limit, offset, sortBy, sortOrder };
};
export const buildSearchCondition = (search: string | undefined, fields: string[]): { condition: string; params: string[] } => {
  if (!search || search.trim() === '') {
    return { condition: '', params: [] };
  }
  const searchTerm = `%${search.trim()}%`;
  const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
  const params = fields.map(() => searchTerm);
  return { condition: `(${conditions})`, params };
};
export const now = (): string => new Date().toISOString();