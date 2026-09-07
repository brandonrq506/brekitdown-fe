export type FilterScalar = string | number | boolean;

export type FilterOperand = FilterScalar | readonly FilterScalar[];

export type ApiFilters = Readonly<
  Record<string, Readonly<Record<string, FilterOperand | undefined>> | undefined>
>;

/** Filters with every omitted entry and every empty operator block already removed. */
export type NormalizedFilters = Readonly<Record<string, Readonly<Record<string, FilterOperand>>>>;

// `Array.isArray` cannot narrow a readonly array out of a union, so on its own it yields `any[]`.
const isFilterList = (value: FilterOperand): value is readonly FilterScalar[] =>
  Array.isArray(value);

const normalizeOperators = (
  field: string,
  operators: Readonly<Record<string, FilterOperand | undefined>>,
): Record<string, FilterOperand> => {
  const entries: Record<string, FilterOperand> = {};
  for (const op of Object.keys(operators).sort()) {
    const value = operators[op];
    if (value === undefined) continue;
    if (isFilterList(value) && value.length === 0) {
      throw new TypeError(`Filter ${field}.${op} requires a nonempty list`);
    }
    entries[op] = isFilterList(value) ? [...value] : value;
  }
  return entries;
};

// Sorting makes the serialized query string deterministic. Dropping a field whose every operator is
// omitted is what keeps cache identity honest: TanStack's hashKey already sorts keys and ignores
// shallow undefined, but an empty operator block would still hash as a distinct key.
export const normalizeFilters = (filters: ApiFilters = {}): NormalizedFilters => {
  const normalized: Record<string, Record<string, FilterOperand>> = {};
  for (const field of Object.keys(filters).sort()) {
    const operators = filters[field];
    if (operators === undefined) continue;
    const entries = normalizeOperators(field, operators);
    if (Object.keys(entries).length > 0) normalized[field] = entries;
  }
  return normalized;
};

const appendFilter = (
  params: URLSearchParams,
  index: number,
  field: string,
  op: string,
  value: FilterOperand,
): void => {
  const prefix = `filters[${index}]`;
  params.append(`${prefix}[field]`, field);
  params.append(`${prefix}[op]`, op);
  if (isFilterList(value)) {
    for (const item of value) params.append(`${prefix}[value][]`, String(item));
    return;
  }
  params.append(`${prefix}[value]`, String(value));
};

export const serializeFilters = (filters: ApiFilters): URLSearchParams => {
  const params = new URLSearchParams();
  let index = 0;
  for (const [field, operators] of Object.entries(normalizeFilters(filters))) {
    for (const [op, value] of Object.entries(operators)) {
      appendFilter(params, index, field, op, value);
      index += 1;
    }
  }
  return params;
};
