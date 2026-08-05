/**
 * Hand-written meta title / description overrides supplied by the business
 * (see "FF meta title and description.docx"). These take priority over the
 * auto-generated SEO title/description in the category and product
 * generateMetadata() functions. Anything not listed here keeps using the
 * existing auto-generated formula — this file only overrides the specific
 * pages listed below, nothing else.
 *
 * Keys are lowercase URL slugs (the same slugs used in the route, e.g.
 * /vegetables/tomato-bangalore -> category "vegetables", product
 * "tomato-bangalore").
 */

type MetaOverride = { title: string; description: string };

export const CATEGORY_META_OVERRIDES: Record<string, MetaOverride> = {
  vegetables: {
    title: 'Fresh Farm Vegetables Online | Organic & Fresh Vegetables | Farmers Factory',
    description:
      'Buy fresh farm vegetables online from Farmers Factory. Explore a wide range of organic, naturally grown vegetables harvested fresh from the farm and delivered to your doorstep with guaranteed quality and freshness.',
  },
};

export const PRODUCT_META_OVERRIDES: Record<string, Record<string, MetaOverride>> = {
  vegetables: {
    'tomato-bangalore': {
      title: 'Fresh Bangalore Tomatoes| Farm to Home Delivery | Farmers Factory',
      description:
        'Buy fresh Bangalore tomatoes directly from Farmers Factory. Enjoy premium-quality, farm-fresh tomatoes delivered to your doorstep with guaranteed freshness, hygienic packing, and fast farm-to-home delivery across Bangalore.',
    },
    'zucchini-green': {
      title: 'Premium Green Zucchini Online | Fresh & Healthy Vegetables | Farmers Factory',
      description:
        'Discover premium green zucchini from Farmers Factory. Fresh, healthy, and carefully selected vegetables sourced directly from farms for superior taste and nutrition.',
    },
    'tomato-country': {
      title: 'Buy Fresh Country Tomato Online | Farm Fresh Desi Tomatoes | Farmers Factory',
      description:
        'Shop farm-fresh country tomatoes online at Farmers Factory. Get naturally grown desi tomatoes packed with authentic taste, freshness, and nutritional goodness.',
    },
    'zucchini-yellow': {
      title: 'Buy Fresh Yellow Zucchini Online | Farm Fresh & Organic | Farmers Factory',
      description:
        'Discover fresh Yellow Zucchini at Farmers Factory. Farm-fresh, organic, and packed with nutrition. Order online for fast, reliable doorstep delivery.',
    },
    'raw-mango': {
      title: 'Buy Farm Fresh Raw Mango Online at Best Price | Farmers Factory',
      description:
        'Buy farm fresh raw mango online at the best price from Farmers Factory. Enjoy naturally grown, premium-quality green mangoes with hygienic packing and fresh doorstep delivery.',
    },
    sweetcorn: {
      title: 'Premium Fresh Sweetcorn | Farm Fresh Vegetables | Farmers Factory',
      description:
        'Discover premium farm-fresh sweetcorn at Farmers Factory. Freshly harvested, naturally grown, and packed with nutrition for delicious meals.',
    },
    ridgegourd: {
      title: 'Fresh Ridge Gourd Online | Farm Fresh & Organic | Farmers Factory',
      description:
        'Order premium fresh ridge gourd online from Farmers Factory. Enjoy naturally grown, farm-fresh vegetables with fast 24-hour delivery and assured quality.',
    },
    radish: {
      title: 'Buy Fresh Radish Online | Farm Fresh Vegetables Delivered | Farmers Factory',
      description:
        'Order fresh radish online from Farmers Factory. Naturally grown, quality-checked, and hygienically packed farm-fresh vegetables delivered fresh to your home.',
    },
    'purple-cabbage': {
      title: 'Order Purple Cabbage Online | Fresh & Healthy Vegetables | Farmers Factory',
      description:
        'Order fresh Purple Cabbage online from Farmers Factory. Rich in nutrients, crisp, and naturally grown. Get premium-quality vegetables delivered fresh to your doorstep.',
    },
    'pumpkin-yellow': {
      title: 'Fresh Yellow Pumpkin – Buy Organic Farm Fresh Vegetables | Farmers Factory',
      description:
        'Order premium Yellow Pumpkin online from Farmers Factory. Freshly harvested, naturally grown vegetables delivered to your doorstep for healthy everyday cooking.',
    },
    'spring-onion': {
      title: 'Fresh Spring Onion Online | Farm Fresh Green Onions | Farmers Factory',
      description:
        'Order premium fresh spring onion online from Farmers Factory. Naturally grown, farm-fresh green onions packed with flavor and delivered straight from our farms.',
    },
    seppankizhangu: {
      title: 'Premium Seppankizhangu (Taro Root) – Fresh & Healthy | Farmers Factory',
      description:
        'Shop premium Seppankizhangu (Colocasia/Taro Root) at Farmers Factory. Freshly harvested, rich in nutrients, and perfect for healthy, flavorful recipes.',
    },
    'raw-banana': {
      title: 'Premium Raw Banana Online | Fresh Farm Vegetables | Farmers Factory',
      description:
        'Order fresh premium raw banana from Farmers Factory. Farm-fresh quality, naturally grown vegetables, hygienically packed, and delivered fresh.',
    },
  },
};
