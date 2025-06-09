export type WithSomeRequired<T, K extends keyof T> = Required<Pick<T, K>> &
  Partial<Omit<T, K>>;

export interface Entity {
  _id?: string;
}
