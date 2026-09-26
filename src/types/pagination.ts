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

/** `null` means "from the beginning"; a string is the previous page's `end_cursor`. */
export type CursorPageParam = string | null;

export interface CursorPaginationMeta {
  page_size: number;
  has_next_page: boolean;
  /** `null` on an empty page. */
  end_cursor: string | null;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}
