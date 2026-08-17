export type ObjectValues<T> = T[keyof T];

export interface ApiResource {
  reference_xid: string;
  inserted_at: string;
  updated_at: string;
}
