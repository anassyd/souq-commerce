export type Category = { slug: string; name: string };

export type Product = {
  id: string;
  name: string;
  slug: string; // `${id}-${title-slug}`, used in /products/[slug]
  description: string;
  brand: string | null;
  price: number; // cents
  compareAtPrice: number | null; // cents
  discountPercent: number;
  images: string[];
  thumbnail: string;
  stock: number;
  /** Average of all review stars (0 when there are no reviews). */
  rating: number;
  /** Sum of all review stars, so customer reviews written here can be averaged in. */
  ratingTotal: number;
  reviewCount: number;
  category: Category;
  /** Lifestyle photo (fills the tile) rather than a cut-out on a white background. */
  photo?: boolean;
};

export type ProductDetail = Product & {
  warranty: string | null;
  shipping: string | null;
  returnPolicy: string | null;
  reviews: Review[];
};

export type Review = { id: string; author: string; rating: number; comment: string; createdAt: string };
