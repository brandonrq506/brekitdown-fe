export interface ApiQueryOptions<TFilters> {
  filter?: TFilters;
}

export interface FilterOperators<T> {
  "==": T;
  "!=": T;
  "<": T;
  "<=": T;
  ">": T;
  ">=": T;
  in: T[];
  not_in: T[];
  empty: boolean;
  not_empty: boolean;
}

export type ApiFilter<TValue, TOperator extends keyof FilterOperators<TValue>> = Partial<
  Pick<FilterOperators<TValue>, TOperator>
>;
