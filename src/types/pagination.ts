import type { PAGE_SIZES } from "@/constants/pagination";

export type PageSize = (typeof PAGE_SIZES)[number];

export interface PaginationParams {
  page: number;
  pageSize: PageSize;
}

export interface PaginationMeta {
  current_page: number;
  page_size: PageSize;
  total_count: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
