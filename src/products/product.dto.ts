export type ProductQuery = {
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  search?: string;
  page?: string;
};
