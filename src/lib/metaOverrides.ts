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
    'ooty-carrot': {
      title: 'Fresh Ooty Carrot Online | Farm Fresh Ooty Carrots | Farmers Factory',
      description:
        'Buy fresh Ooty carrots online from Farmers Factory. Enjoy farm-fresh, naturally grown, crunchy and nutritious Ooty carrots, carefully harvested and delivered fresh to your doorstep.',
    },
    'onion-nasik': {
      title: 'Fresh Nasik Onion Online | Farm Fresh Onions | Farmers Factory',
      description:
        'Shop farm-fresh Nasik onions online from Farmers Factory. Get quality onions with natural freshness and authentic flavor for all your favorite dishes.',
    },
    'mint-leaves': {
      title: 'Fresh Mint Leaves Online | Farm Fresh Mint Leaves | Farmers Factory',
      description:
        'Get fresh mint leaves delivered to your doorstep from Farmers Factory. Shop quality, aromatic and farm-fresh mint leaves online for your everyday cooking needs.',
    },
    lemon: {
      title: 'Fresh Lemon Online | Farm Fresh Organic Lemon | Farmers Factory',
      description:
        'Buy fresh organic lemons online from Farmers Factory. Enjoy farm-fresh, naturally juicy and refreshing lemons, delivered to your doorstep.',
    },
    'maravalli-kilangu': {
      title: 'Fresh Maravalli-kilangu Online | Farm Fresh Tapioca | Farmers Factory',
      description:
        'Shop fresh Maravalli Kilangu (Tapioca) online at Farmers Factory. Enjoy farm-fresh, carefully selected tapioca with quality, freshness, and convenient delivery.',
    },
    'onion-big': {
      title: 'Fresh Big Onion Online | Farm Fresh Onions | Farmers Factory',
      description:
        'Buy fresh big onions online from Farmers Factory. Get farm-fresh, carefully selected onions with natural quality, great taste, and convenient doorstep delivery.',
    },
    onion: {
      title: 'Fresh Onion Online | Farm Fresh Onions | Farmers Factory',
      description:
        'Buy fresh onions online from Farmers Factory. Enjoy farm-fresh, naturally grown onions harvested with care and delivered fresh to your doorstep.',
    },
    nookal: {
      title: 'Fresh Nookal Online | Farm Fresh Nookal | Farmers Factory',
      description:
        'Shop fresh Nookal online at Farmers Factory. Enjoy farm-fresh, naturally grown Nookal, carefully harvested and delivered fresh to your doorstep.',
    },
    karunaikizhangu: {
      title: 'Fresh Karunai Kizhangu Online | Farm Fresh Yam | Farmers Factory',
      description:
        'Buy fresh Karunai Kizhangu online from Farmers Factory. Enjoy farm-fresh, naturally grown yam, carefully harvested and delivered fresh to your doorstep.',
    },
    'green-peas': {
      title: 'Fresh Green Peas Online | Organic Vegetables | Farmers Factory',
      description:
        'Shop fresh green peas online at Farmers Factory. Enjoy farm-fresh, quality organic vegetables carefully harvested and delivered fresh to your doorstep.',
    },
    greenchili: {
      title: 'Fresh Green Chilli Online | Organic Green Chilli | Farmers Factory',
      description:
        'Buy fresh green chilli online from Farmers Factory. Get organic, farm-fresh green chillies carefully selected for quality, freshness, flavour, and everyday cooking.',
    },
    kovaikkai: {
      title: 'Fresh Kovaikkai Online | Farm Fresh Ivy Gourd | Farmers Factory',
      description:
        'Buy fresh Kovaikkai (Ivy Gourd) online from Farmers Factory. Enjoy farm-fresh, quality-checked vegetables with hygienic packing and convenient delivery.',
    },
    'ladies-finger': {
      title: 'Fresh Ladies Finger Online | Farm Fresh Okra | Farmers Factory',
      description:
        'Buy fresh Ladies Finger (Okra) online from Farmers Factory. Get farm-fresh, quality-checked vegetables with hygienic packing and convenient delivery.',
    },
    'coriander-leaves': {
      title: 'Fresh Coriander Leaves Online | Farm Fresh Coriander | Farmers Factory',
      description:
        'Buy fresh coriander leaves online from Farmers Factory. Get farm-fresh, aromatic, quality-checked coriander, hygienically packed and delivered fresh to you.',
    },
    'capsicum-green': {
      title: 'Fresh Green Capsicum Online | Farm Fresh Capsicum | Farmers Factory',
      description:
        'Looking for fresh green capsicum online? Farmers Factory brings you quality farm-fresh capsicum with great freshness, taste, and crunch for everyday cooking.',
    },
    'cluster-beans': {
      title: 'Fresh Cluster Beans Online | Quality Farm Fresh Vegetables | Farmers Factory',
      description:
        'Order fresh cluster beans online from Farmers Factory. Get quality farm-fresh cluster beans, carefully harvested and selected for fresh, healthy everyday meals.',
    },
    'capsicum-yellow': {
      title: 'Fresh Yellow Capsicum Online | Farm Fresh Yellow Capsicum | Farmers Factory',
      description:
        'Buy fresh yellow capsicum online from Farmers Factory. Enjoy farm-fresh, crisp and premium-quality yellow capsicum, carefully selected and delivered fresh to your doorstep.',
    },
    'capsicum-red': {
      title: 'Fresh Red Capsicum Online | Farm Fresh Red Capsicum | Farmers Factory',
      description:
        'Buy fresh red capsicum online from Farmers Factory. Get farm-fresh, crisp and premium-quality red capsicum, carefully selected and delivered to your doorstep.',
    },
    'curry-leaves': {
      title: 'Fresh Curry Leaves Online | Farm Fresh Curry Leaves | Farmers Factory',
      description:
        'Buy fresh curry leaves online from Farmers Factory. Enjoy farm-fresh, aromatic and carefully selected curry leaves, hygienically packed and delivered fresh to your doorstep.',
    },
    'chow-chow': {
      title: 'Fresh Chow Chow Online | Farm Fresh Chow Chow | Farmers Factory',
      description:
        'Buy fresh Chow Chow online from Farmers Factory. Get farm-fresh, carefully selected Chow Chow, hygienically packed and delivered fresh to your doorstep.',
    },
    'bottle-gourd': {
      title: 'Fresh Bottle Gourd Online | Farm Fresh Bottle Gourd | Farmers Factory',
      description:
        'Buy fresh bottle gourd online from Farmers Factory. Enjoy farm-fresh, carefully selected bottle gourds, hygienically packed and delivered fresh to your doorstep.',
    },
    'brinjal-eggplant': {
      title: 'Fresh Brinjal Online | Farm Fresh Eggplant | Farmers Factory',
      description:
        'Buy fresh brinjal online from Farmers Factory. Enjoy farm-fresh eggplant, carefully selected, hygienically packed and delivered fresh to your doorstep.',
    },
    'ash-gourd': {
      title: 'Fresh Ash Gourd Online | Farm Fresh Ash Gourd | Farmers Factory',
      description:
        'Buy fresh Ash Gourd online from Farmers Factory. Enjoy farm-fresh, carefully selected Ash Gourd with quality, freshness, and convenient doorstep delivery.',
    },
    'banana-flower': {
      title: 'Fresh Banana Flower Online | Farm Fresh Banana Flower | Farmers Factory',
      description:
        'Buy fresh Banana Flower online from Farmers Factory. Get farm-fresh, carefully selected Banana Flowers packed for quality and freshness with convenient doorstep delivery.',
    },
    avarakkai: {
      title: 'Fresh Avarakkai Online | Farm Fresh Broad Beans | Farmers Factory',
      description:
        'Buy fresh Avarakkai (Broad Beans) online from Farmers Factory. Enjoy farm-fresh quality, natural goodness, hygienic packing, and convenient doorstep delivery.',
    },
    'baby-potato': {
      title: 'Fresh Baby Potato Online | Farm Fresh Baby Potatoes | Farmers Factory',
      description:
        'Shop fresh baby potatoes online at Farmers Factory. Get premium farm-fresh baby potatoes, hygienically packed and delivered fresh for your everyday meals.',
    },
    'brinjal-vari': {
      title: 'Fresh Brinjal Vari Online | Farm Fresh Brinjal | Farmers Factory',
      description:
        'Shop fresh Brinjal Vari online at Farmers Factory. Enjoy farm-fresh, carefully selected brinjal with quality, freshness, and convenient doorstep delivery.',
    },
    'button-mushrooms': {
      title: 'Fresh Button Mushrooms Online | Farm Fresh Mushrooms | Farmers Factory',
      description:
        'Buy fresh Button Mushrooms online at Farmers Factory. Get farm-fresh, carefully selected mushrooms with quality, freshness, and convenient doorstep delivery.',
    },
    'baji-chilli': {
      title: 'Fresh Bajji Chilli Online | Farm Fresh Bajji Chilli | Farmers Factory',
      description:
        'Shop fresh Bajji Chilli online at Farmers Factory. Get farm-fresh, carefully selected chillies with great quality, freshness, and convenient doorstep delivery.',
    },
    'banana-stem': {
      title: 'Fresh Banana Stem Online | Farm Fresh Banana Stem | Farmers Factory',
      description:
        'Buy fresh Banana Stem online at Farmers Factory. Get farm-fresh, carefully selected banana stem delivered conveniently to your doorstep for healthy everyday cooking.',
    },
    'baby-corn': {
      title: 'Fresh Baby Corn Online | Farm Fresh Baby Corn | Farmers Factory',
      description:
        'Buy fresh Baby Corn online at Farmers Factory. Get farm-fresh, carefully selected baby corn with great quality, natural freshness, and convenient doorstep delivery.',
    },
    beans: {
      title: 'Fresh Beans Online | Farm Fresh Green Beans | Farmers Factory',
      description:
        'Buy fresh beans online from Farmers Factory. Get farm-fresh, carefully selected green beans harvested for quality, freshness, and convenient doorstep delivery.',
    },
    broccoli: {
      title: 'Fresh Broccoli Online | Farm Fresh Broccoli | Farmers Factory',
      description:
        'Buy fresh broccoli online from Farmers Factory. Get farm-fresh, carefully selected broccoli with great quality, freshness, and convenient doorstep delivery.',
    },
    drumstick: {
      title: 'Fresh Drumstick Online | Farm Fresh Drumstick | Farmers Factory',
      description:
        'Buy fresh drumstick online from Farmers Factory. Get farm-fresh, carefully selected drumsticks with quality, freshness, and convenient doorstep delivery.',
    },
    cauliflower: {
      title: 'Fresh Cauliflower Online | Farm Fresh Cauliflower | Farmers Factory',
      description:
        'Shop fresh cauliflower online at Farmers Factory. Get farm-fresh, carefully selected cauliflower harvested for quality and freshness, delivered conveniently to your doorstep.',
    },
    cucumber: {
      title: 'Fresh Cucumber Online | Farm Fresh Cucumber | Farmers Factory',
      description:
        'Buy fresh cucumber online from Farmers Factory. Enjoy farm-fresh, carefully selected cucumbers with natural freshness, quality, and convenient doorstep delivery.',
    },
    cabbage: {
      title: 'Fresh Cabbage Online | Farm Fresh Cabbage | Farmers Factory',
      description:
        'Buy fresh cabbage online from Farmers Factory. Get farm-fresh, carefully selected cabbage with quality, freshness, and convenient doorstep delivery.',
    },
    'bitter-gourd': {
      title: 'Fresh Bitter Gourd Online | Farm Fresh Bitter Gourd | Farmers Factory',
      description:
        'Buy fresh Bitter Gourd online from Farmers Factory. Get farm-fresh, carefully selected bitter gourd with quality, freshness, and convenient doorstep delivery.',
    },
    garlic: {
      title: 'Fresh Garlic Online | Farm Fresh Garlic | Farmers Factory',
      description:
        'Shop fresh garlic online at Farmers Factory. Get farm-fresh, carefully selected garlic with natural flavour, reliable quality, and convenient doorstep delivery.',
    },
    'brinjal-ujala': {
      title: 'Fresh Brinjal Ujala Online | Farm Fresh Brinjal | Farmers Factory',
      description:
        'Shop fresh Brinjal Ujala online at Farmers Factory. Get farm-fresh, carefully selected brinjal with quality, freshness, and convenient doorstep delivery.',
    },
    beetroot: {
      title: 'Fresh Beetroot Online | Farm Fresh Beetroot | Farmers Factory',
      description:
        'Shop fresh beetroot online at Farmers Factory. Get farm-fresh, nutritious beetroot carefully selected for quality, freshness, and convenient doorstep delivery.',
    },
    spinach: {
      title: 'Fresh Spinach Online | Farm Fresh Spinach | Farmers Factory',
      description:
        'Shop fresh spinach online at Farmers Factory. Get farm-fresh, carefully selected spinach packed with freshness and quality, delivered conveniently to your doorstep.',
    },
    'ridge-gourd': {
      title: 'Fresh Ridge Gourd Online | Farm Fresh Ridge Gourd | Farmers Factory',
      description:
        'Buy fresh Ridge Gourd online at Farmers Factory. Get farm-fresh, carefully selected ridge gourd with natural quality, freshness, and convenient doorstep delivery.',
    },
    ginger: {
      title: 'Fresh Ginger Online | Farm Fresh Ginger | Farmers Factory',
      description:
        'Buy fresh ginger online at Farmers Factory. Get farm-fresh, carefully selected ginger with natural aroma, quality, freshness, and convenient doorstep delivery.',
    },
    'snake-gourd': {
      title: 'Fresh Snake Gourd Online | Farm Fresh Snake Gourd | Farmers Factory',
      description:
        'Buy fresh Snake Gourd online from Farmers Factory. Get farm-fresh, carefully selected snake gourd with quality, freshness, and convenient doorstep delivery.',
    },
    carrots: {
      title: 'Fresh Carrots Online | Farm Fresh Carrots | Farmers Factory',
      description:
        'Buy fresh carrots online from Farmers Factory. Enjoy farm-fresh, carefully selected carrots delivered to your doorstep with quality, freshness, and natural goodness.',
    },
  },
  fruits: {
    'watermelon-strips': {
      title: 'Buy Fresh Watermelon Strips Online | Farmers Factory',
      description:
        'Buy fresh Watermelon Strips online from Farmers Factory. Enjoy naturally fresh, juicy and quality watermelon delivered conveniently to your doorstep.',
    },
    'watermelon-kiran': {
      title: 'Buy Fresh Kiran Watermelon Online | Farmers Factory',
      description:
        'Buy fresh Kiran Watermelon online from Farmers Factory. Enjoy naturally sweet, juicy, freshly harvested watermelon delivered straight to your doorstep.',
    },
    redbanana: {
      title: 'Buy Fresh Red Banana Online | Organic Red Banana | Farmers Factory',
      description:
        'Buy fresh Red Banana online from Farmers Factory. Enjoy naturally fresh, organic, chemical-free bananas harvested with care and delivered fresh to your doorstep.',
    },
    'senthoora-mango': {
      title: 'Buy Fresh Senthoora Mango Online | Farm Fresh Mango | Farmers Factory',
      description:
        'Buy fresh Senthoora Mango online from Farmers Factory. Enjoy naturally fresh, organic mangoes harvested with care and delivered straight to your doorstep.',
    },
    'mango-banganapalli': {
      title: 'Buy Fresh Banganapalli Mango Online | Farmers Factory',
      description:
        'Buy fresh Banganapalli mangoes online from Farmers Factory. Enjoy naturally sweet, juicy, organic mangoes with no chemicals or ripening agents, delivered fresh to your doorstep.',
    },
    'musk-melon': {
      title: 'Buy Fresh Musk Melon Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh Musk Melon online from Farmers Factory. Enjoy naturally fresh, carefully harvested, quality melons delivered straight from the farm to your doorstep.',
    },
    'guava-white': {
      title: 'Buy Fresh White Guava Online | Farm Fresh Guava | Farmers Factory',
      description:
        'Buy fresh White Guava online from Farmers Factory. Enjoy naturally fresh, quality guava harvested from the farm and delivered straight to your doorstep.',
    },
    'banana-poovan': {
      title: 'Buy Fresh Poovan Banana Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh Poovan Banana online from Farmers Factory. Enjoy naturally fresh, organic bananas harvested with care and delivered straight to your doorstep.',
    },
    'banana-elakki': {
      title: 'Buy Fresh Elakki Banana Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh Elakki Bananas online from Farmers Factory. Enjoy naturally fresh, quality bananas harvested with care and conveniently delivered to your doorstep.',
    },
    'banana-karpooravalli': {
      title: 'Buy Fresh Karpooravalli Banana Online | Farmers Factory',
      description:
        'Shop fresh Karpooravalli bananas online at Farmers Factory. Enjoy naturally sweet, freshly harvested, quality bananas delivered conveniently to your doorstep.',
    },
    'banana-nendhiram': {
      title: 'Buy Fresh Nendhiram Banana Online | Farmers Factory',
      description:
        'Buy fresh Nendhiram Banana online from Farmers Factory. Enjoy naturally grown, chemical-free bananas freshly harvested and delivered straight to your doorstep.',
    },
    kiwi: {
      title: 'Buy Fresh Kiwi Online | Organic Kiwi Fruit | Farmers Factory',
      description:
        'Buy fresh kiwi online from Farmers Factory. Enjoy naturally fresh, organic, quality kiwi fruit delivered straight to your doorstep for healthy everyday eating.',
    },
    apple: {
      title: 'Buy Fresh Apples Online | Farm Fresh Apples | Farmers Factory',
      description:
        'Buy fresh, quality apples online from Farmers Factory. Enjoy naturally fresh, carefully selected apples delivered straight to your doorstep for healthy everyday eating.',
    },
    strawberry: {
      title: 'Buy Fresh Strawberries Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh strawberries online from Farmers Factory. Enjoy farm-fresh, naturally grown strawberries delivered straight to your doorstep with quality and freshness.',
    },
    pomegranate: {
      title: 'Buy Fresh Pomegranate Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh pomegranate online from Farmers Factory. Enjoy naturally fresh, organic, farm-harvested pomegranates delivered straight to your doorstep.',
    },
    orange: {
      title: 'Buy Fresh Oranges Online | Farm Fresh Orange | Farmers Factory',
      description:
        'Buy fresh oranges online from Farmers Factory. Enjoy naturally fresh, juicy, organic oranges harvested with care and delivered fresh to your doorstep.',
    },
    amla: {
      title: 'Buy Fresh Amla Online | Organic Indian Gooseberry | Farmers Factory',
      description:
        'Buy fresh organic Amla online from Farmers Factory. Enjoy naturally harvested Indian gooseberries with farm-fresh quality, carefully packed and delivered to your doorstep.',
    },
    papaya: {
      title: 'Fresh Papaya Online | Farm Fresh Organic Papaya | Farmers Factory',
      description:
        'Buy fresh papaya online from Farmers Factory. Enjoy naturally fresh, organic papaya harvested with care and delivered straight to your doorstep.',
    },
    pineapple: {
      title: 'Buy Fresh Pineapple Online | Farm Fresh Pineapple | Farmers Factory',
      description:
        'Buy fresh pineapple online from Farmers Factory. Enjoy naturally fresh, juicy, quality-selected pineapple delivered straight to your doorstep for healthy everyday eating.',
    },
    grapes: {
      title: 'Buy Fresh Grapes Online | Organic Grapes | Farmers Factory',
      description:
        'Buy fresh organic grapes online from Farmers Factory. Enjoy naturally fresh, carefully harvested grapes delivered straight from the farm to your doorstep.',
    },
    sapota: {
      title: 'Fresh Sapota Online | Farm Fresh Chikoo | Farmers Factory',
      description:
        'Buy fresh Sapota (Chikoo) online from Farmers Factory. Enjoy naturally fresh, carefully selected, farm-quality Sapota delivered conveniently to your doorstep.',
    },
    guava: {
      title: 'Fresh Guava Online | Organic & Farm Fresh Guava | Farmers Factory',
      description:
        'Buy fresh guava online from Farmers Factory. Enjoy naturally fresh, organic, Grade A guava harvested from the farm and delivered straight to your doorstep.',
    },
    'sweet-lime': {
      title: 'Buy Fresh Sweet Lime Online | Organic Mosambi | Farmers Factory',
      description:
        'Buy fresh Sweet Lime (Mosambi) online from Farmers Factory. Enjoy naturally fresh, organic, juicy sweet lime harvested with care and delivered to your doorstep.',
    },
    'dragon-fruit': {
      title: 'Buy Fresh Dragon Fruit Online | Farm Fresh | Farmers Factory',
      description:
        'Buy fresh Dragon Fruit online from Farmers Factory. Enjoy naturally fresh, farm-harvested quality delivered straight to your doorstep for a healthy lifestyle.',
    },
  },
};
