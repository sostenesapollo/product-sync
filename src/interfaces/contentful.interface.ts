export interface ContentfulProduct {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    sku: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    color: string;
    price?: number;
    currency?: string;
    stock: number;
  };
}

export interface ContentfulResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: ContentfulProduct[];
}
