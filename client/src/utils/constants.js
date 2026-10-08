export const BRAND_NAME = 'GYAAN';
export const CURRENCY = '₹';

export const NAV_LINKS = [
  { label: 'Men', href: '/shop?gender=men' },
  { label: 'Women', href: '/shop?gender=women' },
  { label: 'Kids', href: '/shop?gender=kids' },
  { label: 'Unisex', href: '/shop?gender=unisex' },
  { label: 'New Arrivals', href: '/shop?newArrival=true' },
  { label: 'Best Sellers', href: '/shop?bestSeller=true' },
  { label: 'Sale', href: '/shop?onSale=true', isSale: true },
];

export const SORT_OPTIONS = [
  { label: 'Newest Releases', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Customer Rating', value: 'rating' },
  { label: 'Highest Discount', value: 'discount' },
  { label: 'Popularity', value: 'popular' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];
