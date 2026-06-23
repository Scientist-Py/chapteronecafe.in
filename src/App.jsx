import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  ChefHat,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  Flame,
  Heart,
  Home,
  Leaf,
  MapPin,
  Menu as MenuIcon,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Trash2,
  UserRound,
  Utensils,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  TrendingUp,
  Database,
} from 'lucide-react'
import './App.css'
import {
  getOrderMetadata,
  saveOrderToLocalDB,
  pollOrderStatus,
  fetchOrdersFromGS,
  updateOrderStatusInGS,
  fetchOrdersLocal,
  updateOrderStatusLocal
} from './utils/logger'

const RUPEE = '\u20b9'
const MIDDLE_DOT = '\u00b7'
const NAVIGATION_DELAY = 520

const images = {
  hero:
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=85',
  pasta:
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85',
  pizza:
    'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=85',
  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
  coffee:
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
  dessert:
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85',
  salad:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
}

const menuItems = [
  // --- Pizzas ---
  {
    id: 'chapter-one-special-pizza',
    name: 'Chapter One Special Pizza',
    note: 'Our signature gourmet pizza with loaded veggies, premium cheese, and house-special herbs.',
    tag: 'Bestseller',
    category: 'Pizzas',
    price: 229,
    sizes: { Regular: 229, Medium: 379, Large: 539 },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'tandoori-paneer-pizza',
    name: 'Tandoori Paneer Pizza',
    note: 'Spiced tandoori paneer cubes, red onions, and bell peppers with mint drizzle.',
    category: 'Pizzas',
    price: 199,
    sizes: { Regular: 199, Medium: 349, Large: 519 },
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'farmhouse-pizza',
    name: 'Farmhouse Pizza',
    note: 'Delectable combination of fresh capsicum, crunchy onion, juicy tomatoes, and mushrooms.',
    category: 'Pizzas',
    price: 199,
    sizes: { Regular: 199, Medium: 359, Large: 529 },
    image: 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'mix-topping-pizza',
    name: 'Mix Topping Pizza',
    note: 'A classic loaded pizza featuring a delicious mix of chef-selected toppings.',
    category: 'Pizzas',
    price: 149,
    sizes: { Regular: 149, Medium: 249, Large: 389 },
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'choice-topping-pizza',
    name: 'Choice of Any Topping Pizza',
    note: 'Customize your pizza by choosing your favorite combination of fresh toppings.',
    category: 'Pizzas',
    price: 129,
    sizes: { Regular: 129, Medium: 229, Large: 389 },
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    note: 'Simple yet classic pizza loaded with stringy mozzarella cheese and fresh tomato basil sauce.',
    category: 'Pizzas',
    price: 109,
    sizes: { Regular: 109, Medium: 229, Large: 359 },
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'giant-17-inch-pizza',
    name: '17-inch Giant Pizza',
    note: 'Grand Master level colossal 17-inch giant pizza perfect for sharing.',
    tag: 'Popular',
    category: 'Pizzas',
    price: 900,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },

  // --- Burgers & Subs ---
  {
    id: 'chapter-one-special-wheat-burger',
    name: 'Chapter One Special Wheat Burger',
    note: 'Healthy wheat bun with our specialty grilled patty, fresh lettuce, and unique sauce.',
    tag: 'Bestseller',
    category: 'Burgers & Subs',
    price: 149,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'double-decker-wheat-burger',
    name: 'Double Decker Wheat Burger',
    note: 'Two juicy patties layered with melted cheese, greens, and sauce in wheat buns.',
    category: 'Burgers & Subs',
    price: 139,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'paneer-tikka-wheat-burger',
    name: 'Paneer Tikka Wheat Burger',
    note: 'Rich, grilled paneer tikka patty paired with mint mayo and crisp wheat buns.',
    category: 'Burgers & Subs',
    price: 99,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'cheese-corn-wheat-burger',
    name: 'Cheese Corn Wheat Burger',
    note: 'Creamy sweet corn and cheese patty with a crispy golden outer layer in wheat buns.',
    category: 'Burgers & Subs',
    price: 79,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'aloo-tikki-wheat-burger',
    name: 'Aloo Tikki Wheat Burger',
    note: 'Classic crisp potato patty burger with onion, tomato, and sweet-spicy burger sauce.',
    category: 'Burgers & Subs',
    price: 49,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    id: 'chapter-one-special-burger',
    name: 'Chapter One Special Burger',
    note: 'Our signature burger with gourmet double-cheese, fresh tomato, and crisp lettuce.',
    tag: "Chef's Express",
    category: 'Burgers & Subs',
    price: 149,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'cheesy-paneer-sub',
    name: 'Cheesy Paneer Sub',
    note: 'Artisan sub loaded with soft paneer cubes, thick cheese sauce, and fresh salad veggies.',
    tag: "Chef's Express",
    category: 'Burgers & Subs',
    price: 149,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'cheesy-american-bbq-sub',
    name: 'Cheesy American BBQ Sub',
    note: 'Freshly baked sub filled with smokey BBQ style protein, onions, capsicum, and warm cheese.',
    category: 'Burgers & Subs',
    price: 139,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'potato-chilli-cheese-sub',
    name: 'Potato Chilli Cheese Sub',
    note: 'Spicy chilli-potato wedges topped with melted cheese, baked inside a soft sub roll.',
    category: 'Burgers & Subs',
    price: 99,
    image: 'https://images.unsplash.com/photo-1621856956402-18858b84a63c?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },

  // --- Momos ---
  {
    id: 'wheat-kurkure-paneer-momos',
    name: 'Wheat Kurkure Paneer Momos',
    note: 'Crispy, crunchy paneer momos made with wholesome wheat dough and fried to golden perfection.',
    tag: 'Bestseller',
    category: 'Momos',
    price: 179,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebedd0b40b8?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'wheat-paneer-steamed-momos',
    name: 'Wheat Paneer Steamed Momos',
    note: 'Delicate steamed wheat momos filled with seasoned, juicy paneer stuffing.',
    category: 'Momos',
    price: 139,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebedd0b40b8?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'wheat-veg-kurkure-momos',
    name: 'Wheat Veg Kurkure Momos',
    note: 'Extra crispy wheat momos stuffed with mixed vegetables, coated in crunchy batter.',
    category: 'Momos',
    price: 139,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'wheat-veg-steamed-momos',
    name: 'Wheat Veg Steamed Momos',
    note: 'Fresh steamed wheat momos packed with healthy chopped garden vegetables.',
    category: 'Momos',
    price: 109,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebedd0b40b8?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },

  // --- Pasta Bowls ---
  {
    id: 'alfredo-white-sauce-pasta',
    name: 'Alfredo White Sauce Pasta',
    note: 'Rich and creamy pasta tossed in a luxurious buttery cheese Alfredo sauce with garlic.',
    tag: 'Popular',
    category: 'Pasta Bowls',
    price: 139,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'mama-rosa-mixed-sauce-pasta',
    name: 'Mama Rosa Mixed Sauce Pasta',
    note: 'A harmonious blend of creamy Alfredo and tangy Marinara tomato sauce.',
    category: 'Pasta Bowls',
    price: 139,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'arabita-red-sauce-pasta',
    name: 'Arabita Red Sauce Pasta',
    note: 'Fiery pasta prepared in a spicy tomato sauce enriched with garlic, chili flakes, and olive oil.',
    category: 'Pasta Bowls',
    price: 129,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },

  // --- Garlic Breads & Sides ---
  {
    id: 'paneer-garlic-bread',
    name: 'Paneer Garlic Bread',
    note: 'Baked garlic bread slices topped with marinated paneer chunks and melted mozzarella.',
    category: 'Garlic Breads & Sides',
    price: 130,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'calzone-pocket',
    name: 'Calzone Pocket',
    note: 'Stuffed folded pocket pizza filled with seasoned vegetables, sauce, and cheese.',
    category: 'Garlic Breads & Sides',
    price: 120,
    image: 'https://images.unsplash.com/photo-1613564824333-c1e10419b227?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'exotic-garlic-bread',
    name: 'Exotic Garlic Bread',
    note: 'Warm bread loaded with roasted garlic, sweet corn, olives, and jalapenos.',
    category: 'Garlic Breads & Sides',
    price: 120,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'cheese-garlic-bread',
    name: 'Cheese Garlic Bread',
    note: 'Golden baked bread infused with fresh garlic butter and smothered in gooey cheese.',
    category: 'Garlic Breads & Sides',
    price: 110,
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'stuffed-garlic-bread',
    name: 'Stuffed Garlic Bread',
    note: 'Fresh dough stuffed with sweet corn, jalapenos, and mozzarella cheese, baked to golden brown.',
    category: 'Garlic Breads & Sides',
    price: 110,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'chapter-one-special-fries',
    name: 'Chapter One Special Fries',
    note: 'Signature golden fries tossed in secret spices and loaded with rich cheese dip.',
    tag: 'Bestseller',
    category: 'Garlic Breads & Sides',
    price: 99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'peri-peri-potato-tornado',
    name: 'Peri Peri Potato Tornado',
    note: 'Spiral-cut potato skewers deep-fried and dusted with fiery peri peri seasoning.',
    category: 'Garlic Breads & Sides',
    price: 89,
    image: 'https://images.unsplash.com/photo-1566818614383-93664d4b8e21?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'cheesy-potato-tornado',
    name: 'Cheesy Potato Tornado',
    note: 'Spiral potato skewer coated in a velvety, warm cheese sauce.',
    category: 'Garlic Breads & Sides',
    price: 109,
    image: 'https://images.unsplash.com/photo-1566818614383-93664d4b8e21?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'peri-peri-fries',
    name: 'Peri Peri Fries',
    note: 'Crispy classic fries seasoned with hot and spicy peri peri powder.',
    category: 'Garlic Breads & Sides',
    price: 79,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    id: 'salted-french-fries',
    name: 'Salted French Fries',
    note: 'Perfectly salted crispy golden classic French fries.',
    category: 'Garlic Breads & Sides',
    price: 69,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    rating: 4.3,
  },

  // --- Wraps & Sandwiches ---
  {
    id: 'tandoori-paneer-wrap',
    name: 'Tandoori Paneer Wrap',
    note: 'Flatbread wrap rolled with charcoal-grilled paneer and crunchy salad veggies.',
    category: 'Wraps & Sandwiches',
    price: 129,
    image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'banana-honey-peanut-sandwich',
    name: 'Banana Honey Peanut Sandwich',
    note: 'A delicious dessert sandwich filled with sweet banana slices, honey, and creamy peanut butter.',
    tag: 'New',
    category: 'Wraps & Sandwiches',
    price: 130,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'tandoori-paneer-sandwich',
    name: 'Tandoori Paneer Sandwich',
    note: 'Crisp grilled bread sandwich stuffed with tandoori paneer filling.',
    category: 'Wraps & Sandwiches',
    price: 120,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'cheese-corn-sandwich',
    name: 'Cheese Corn Sandwich',
    note: 'Warm grilled sandwich filled with tender sweet corn kernels and loaded cheese.',
    category: 'Wraps & Sandwiches',
    price: 99,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'cheese-wrap',
    name: 'Cheese Wrap',
    note: 'A simple wrap filled with loaded cheese and mild spices.',
    category: 'Wraps & Sandwiches',
    price: 99,
    image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    id: 'veg-wrap',
    name: 'Veg Wrap',
    note: 'Whole wheat wrap loaded with crunchy mixed veggies and flavorful sauces.',
    category: 'Wraps & Sandwiches',
    price: 89,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'aloo-tikki-wrap',
    name: 'Aloo Tikki Wrap',
    note: 'Spiced potato tikki, sliced onions, and sweet-sour chutney rolled in a soft wrap.',
    category: 'Wraps & Sandwiches',
    price: 70,
    image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80',
    rating: 4.3,
  },

  // --- Beverages ---
  {
    id: 'chapter-one-signature-mojito',
    name: 'Chapter One Signature Mojito',
    note: 'Our exclusive signature mocktail blending fresh mint, lime, berries, and soda.',
    tag: 'Bestseller',
    category: 'Beverages',
    price: 149,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'rainbow-fusion-mojito',
    name: 'Rainbow Fusion Mojito',
    note: 'A stunning multi-layered mocktail featuring vibrant fruit syrups and sparkling soda.',
    tag: 'New',
    category: 'Beverages',
    price: 129,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'double-colour-mojito',
    name: 'Double Colour Mojito',
    note: 'Beautifully layered dual-flavor mojito designed to refresh your senses.',
    category: 'Beverages',
    price: 119,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'green-apple-mojito',
    name: 'Green Apple Mojito',
    note: 'Tangy green apple syrup combined with mint leaves, lemon slices, and soda.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'blue-mojito',
    name: 'Blue Mojito',
    note: 'Vibrant blue curacao syrup blended with fresh lime juice, mint, and fizzy soda.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'blueberry-mint-mojito',
    name: 'Blueberry Mint Mojito',
    note: 'Sweet blueberries muddled with fresh mint and citrus, topped off with club soda.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'kitkat-shake',
    name: 'KitKat Shake',
    note: 'Thick creamy milkshake blended with crunchy KitKat bars and chocolate syrup.',
    tag: 'Popular',
    category: 'Beverages',
    price: 110,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'strawberry-shake',
    name: 'Strawberry Shake',
    note: 'Luscious, pink milkshake flavored with sweet strawberries and whipped cream.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'oreo-shake',
    name: 'Oreo Shake',
    note: 'Classic vanilla shake blended with chocolatey Oreo cookies and topped with cookie crumbs.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'vanilla-shake',
    name: 'Vanilla Shake',
    note: 'Creamy and smooth traditional vanilla bean milkshake.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    id: 'butterscotch-shake',
    name: 'Butterscotch Shake',
    note: 'Delicious milkshake infused with rich butterscotch chips and caramel drizzle.',
    category: 'Beverages',
    price: 89,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    id: 'hazelnut-cold-coffee',
    name: 'Hazelnut Cold Coffee',
    note: 'Rich espresso blended with chilled milk, ice cream, and hazelnut syrup.',
    category: 'Beverages',
    price: 110,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'classic-cold-coffee',
    name: 'Classic Cold Coffee',
    note: 'Traditional creamy whipped cold coffee served chilled.',
    tag: "Chef's Express",
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'choco-brownie-sundae',
    name: 'Choco Brownie Sundae',
    note: 'Hot chocolate fudge, warm fudge brownie, vanilla ice cream, and nuts.',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },

  // --- Feasts ---
  {
    id: 'snack-attack-bundle',
    name: 'Snack Attack Bundle',
    note: 'The ultimate combo featuring fries, momos, garlic bread, and two mocktails.',
    tag: 'Bestseller',
    category: 'Feasts',
    price: 239,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'daily-crave-combo',
    name: 'The Daily Crave Combo',
    note: 'Perfect daily personal feast featuring a sub, fries, and a classic cold coffee.',
    category: 'Feasts',
    price: 189,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'grand-family-box',
    name: 'The Grand Family Box',
    note: 'Feast box with a giant pizza, wheat burgers, garlic breads, and a mocktail set.',
    category: 'Feasts',
    price: 449,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'birthday-celebration-feast',
    name: 'Birthday Celebration Feast',
    note: 'An expansive catering bundle suitable for up to 10 people, featuring all menu highlights.',
    tag: 'New',
    category: 'Feasts',
    price: 1049,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
  },
]

const tabs = ['All', 'Popular', 'Pizzas', 'Burgers & Subs', 'Momos', 'Pasta Bowls', 'Garlic Breads & Sides', 'Wraps & Sandwiches', 'Beverages', 'Feasts']

const offers = [
  {
    title: 'Weekend Special',
    value: '20% OFF',
    text: `On all orders above ${RUPEE}599`,
    image: images.pizza,
    cta: 'Order Now',
    itemId: 'chapter-one-special-pizza',
    wide: true,
  },
  {
    title: 'Combo for Two',
    value: `${RUPEE}699`,
    text: 'Pizza, pasta, 2 drinks and garlic bread',
    image: images.coffee,
    cta: 'Add Combo',
    itemId: 'chapter-one-special-pizza',
  },
  {
    title: 'Sweet Sundae Treat',
    value: 'Up to 25% Off',
    text: 'On delicious brownie sundaes after 7 PM',
    image: images.dessert,
    cta: 'Add Sundae',
    itemId: 'choco-brownie-sundae',
  },
]

const baseTrackingSteps = [
  {
    label: 'Order Confirmed',
    text: 'Your order has been received',
    icon: ReceiptText,
  },
  {
    label: 'Preparing',
    text: 'Our chef is preparing your food',
    icon: ChefHat,
  },
  {
    label: 'Ready to Serve',
    text: 'Your order is ready',
    icon: BellRing,
  },
  {
    label: 'Completed',
    text: 'Enjoy your meal!',
    icon: PackageCheck,
  },
]

function money(amount) {
  return `${RUPEE}${amount.toLocaleString('en-IN')}`
}

function nowTime(offsetMinutes = 0) {
  const date = new Date(Date.now() + offsetMinutes * 60000)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function makeLineId(itemId, spice, extras, size) {
  const extraKey = Object.entries(extras)
    .filter(([, selected]) => selected)
    .map(([key]) => key)
    .sort()
    .join('-')
  return `${itemId}-${spice}-${size || 'plain'}-${extraKey || 'plain'}`
}

function App() {
  const [screen, setScreen] = useState(() => {
    if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
      return 'admin';
    }
    return 'home';
  })
  const [loadingScreen, setLoadingScreen] = useState(null)
  const [selectedId, setSelectedId] = useState('chapter-one-special-pizza')
  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [favorites, setFavorites] = useState(() => new Set(['chapter-one-special-pizza']))
  const [cart, setCart] = useState([])
  const [detailQty, setDetailQty] = useState(1)
  const [spice, setSpice] = useState('Medium')
  const [pizzaSize, setPizzaSize] = useState('Regular')
  const [extras, setExtras] = useState({ chicken: false, cheese: false })
  const [deliveryType, setDeliveryType] = useState('Dine In')
  const [tableNumber, setTableNumber] = useState('12')
  const [customer, setCustomer] = useState({
    name: '',
    phone: '+91 98765 43210',
    instructions: '',
  })
  const [order, setOrder] = useState(null)
  const [toast, setToast] = useState('')
  const navigationTimer = useRef(null)

  useEffect(() => {
    // Push initial state
    window.history.replaceState({ screen: 'home' }, '', '')

    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen)
        if (event.state.selectedId) {
          setSelectedId(event.state.selectedId)
        }
      }
    };

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.clearTimeout(navigationTimer.current)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const selectedItem = menuItems.find((item) => item.id === selectedId) || menuItems[0]
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0)
  const subtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
  const delivery = deliveryType === 'Takeaway' || subtotal === 0 ? 0 : 40
  const total = subtotal + delivery
  const isPizza = selectedItem.sizes !== undefined
  const basePrice = isPizza ? (selectedItem.sizes[pizzaSize] || selectedItem.price) : selectedItem.price
  const cheesePrice = isPizza
    ? (pizzaSize === 'Large' ? 80 : pizzaSize === 'Medium' ? 60 : 40)
    : 40
  const detailUnitPrice = basePrice + (extras.chicken ? 80 : 0) + (extras.cheese ? cheesePrice : 0)

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return menuItems.filter((item) => {
      const matchesTab =
        activeTab === 'All' ||
        item.category === activeTab ||
        (activeTab === 'Popular' && ['Bestseller', 'Popular'].includes(item.tag))
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.note, item.sub, item.category, item.tag]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesTab && matchesQuery
    })
  }, [activeTab, query])

  const notify = (message) => {
    setToast(message)
    window.clearTimeout(window.__cafeToast)
    window.__cafeToast = window.setTimeout(() => setToast(''), 1800)
  }

  const go = (nextScreen, stateData = {}) => {
    if (nextScreen === screen && !loadingScreen) return

    window.history.pushState({ screen: nextScreen, ...stateData }, '', '')
    window.clearTimeout(navigationTimer.current)
    setLoadingScreen(nextScreen)
    navigationTimer.current = window.setTimeout(() => {
      setScreen(nextScreen)
      setLoadingScreen(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, NAVIGATION_DELAY)
  }

  const openDetail = (itemId) => {
    setSelectedId(itemId)
    setDetailQty(1)
    setSpice('Medium')
    setPizzaSize('Regular')
    setExtras({ chicken: false, cheese: false })
    go('detail', { selectedId: itemId })
  }

  const toggleFavorite = (itemId) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
        notify('Removed from favorites')
      } else {
        next.add(itemId)
        notify('Saved to favorites')
      }
      return next
    })
  }

  const addToCart = (item, options = {}) => {
    const nextQty = options.qty || 1
    const nextSpice = options.spice || 'Medium'
    const nextExtras = options.extras || { chicken: false, cheese: false }
    const nextSize = options.size || (item.sizes ? 'Regular' : null)

    const isPizza = item.sizes !== undefined
    const basePrice = isPizza ? (item.sizes[nextSize] || item.price) : item.price
    const cheesePrice = isPizza
      ? (nextSize === 'Large' ? 80 : nextSize === 'Medium' ? 60 : 40)
      : 40

    const unitPrice = basePrice + (nextExtras.chicken ? 80 : 0) + (nextExtras.cheese ? cheesePrice : 0)
    const lineId = makeLineId(item.id, nextSpice, nextExtras, nextSize)

    setCart((current) => {
      const existing = current.find((line) => line.lineId === lineId)
      if (existing) {
        return current.map((line) =>
          line.lineId === lineId ? { ...line, qty: line.qty + nextQty } : line,
        )
      }
      return [
        ...current,
        {
          lineId,
          itemId: item.id,
          name: item.name,
          image: item.image,
          sub: item.sub || (nextSize ? `${nextSize} Size` : ''),
          qty: nextQty,
          unitPrice,
          spice: nextSpice,
          extras: nextExtras,
          size: nextSize,
        },
      ]
    })
  }

  const updateCartQty = (lineId, change) => {
    setCart((current) =>
      current
        .map((line) => (line.lineId === lineId ? { ...line, qty: line.qty + change } : line))
        .filter((line) => line.qty > 0),
    )
  }

  const removeFromCart = (lineId) => {
    setCart((current) => current.filter((line) => line.lineId !== lineId))
    notify('Item removed')
  }

  const placeOrder = async () => {
    if (!cart.length) {
      notify('Add items before checkout')
      go('menu')
      return
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      notify('Please enter your details')
      return
    }

    const metadata = await getOrderMetadata()
    const orderTimestamp = Date.now()
    const newOrder = {
      id: `#CO${Math.floor(10000 + Math.random() * 90000)}`,
      total,
      deliveryType,
      createdAt: nowTime(),
      placedAt: orderTimestamp,
      fullDate: new Date().toLocaleDateString('en-IN'),
      items: cart,
      tableNumber,
      customer: { ...customer },
      metadata,
    }

    setOrder(newOrder)
    saveOrderToLocalDB(newOrder)
    setCart([])
    go('confirmed')
  }

  const appProps = {
    activeTab,
    addToCart,
    cart,
    cartCount,
    customer,
    delivery,
    deliveryType,
    detailQty,
    detailUnitPrice,
    extras,
    favorites,
    filteredItems,
    go,
    openDetail,
    order,
    query,
    removeFromCart,
    selectedItem,
    setActiveTab,
    setCustomer,
    setDeliveryType,
    setDetailQty,
    setExtras,
    setQuery,
    setShowSearch,
    setSpice,
    setTableNumber,
    showSearch,
    spice,
    subtotal,
    tableNumber,
    tabs,
    toggleFavorite,
    total,
    updateCartQty,
    pizzaSize,
    setPizzaSize,
  }

  if (screen === 'admin') {
    return (
      <main className="app-stage admin-stage">
        <AdminPanelScreen go={go} notify={notify} />
        {toast && <div className="toast">{toast}</div>}
      </main>
    )
  }

  return (
    <main className="app-stage">
      <section className="phone-shell" aria-label="Chapter One Cafe mobile app">
        {loadingScreen ? (
          <PageSkeleton screen={loadingScreen} />
        ) : (
          <>
            {screen === 'home' && <HomeScreen {...appProps} />}
            {screen === 'menu' && <MenuScreen {...appProps} />}
            {screen === 'detail' && <DetailScreen {...appProps} />}
            {screen === 'cart' && <CartScreen {...appProps} />}
            {screen === 'collections' && <CollectionsScreen {...appProps} />}
            {screen === 'checkout' && <CheckoutScreen {...appProps} placeOrder={placeOrder} />}
            {screen === 'confirmed' && <ConfirmedScreen {...appProps} />}
            {screen === 'tracking' && <TrackingScreen {...appProps} notify={notify} />}
          </>
        )}
        {toast && <div className="toast">{toast}</div>}
        {cartCount > 0 && ['home', 'menu', 'collections'].includes(screen) && (
          <CartBanner cartCount={cartCount} subtotal={subtotal} go={go} />
        )}
      </section>
      
      {/* Hidden audio element for notifications */}
      <audio id="notification-sound" src="/audio/notification.mp3" preload="auto" />
    </main>
  )
}

function CartBanner({ cartCount, subtotal, go }) {
  return (
    <div className="zomato-cart-banner" onClick={() => go('cart')}>
      <div className="cart-left-glass">
        <div className="icon-glow" />
        <ShoppingCart size={22} className="glass-cart-icon" />
      </div>
      <div className="glass-center">
        <span className="glass-title">{cartCount} Item{cartCount > 1 ? 's' : ''}</span>
        <span className="glass-price">{money(subtotal)}</span>
      </div>
      <div className="glass-right">
        <span>Checkout</span>
        <ArrowRight size={18} />
      </div>
      <div className="glass-shimmer" />
    </div>
  )
}

function PageSkeleton({ screen }) {
  if (screen === 'home') {
    return (
      <div className="screen skeleton-screen skeleton-home" aria-label="Loading home">
        <div className="skel skel-brand" />
        <div className="skel skel-circle top-circle" />
        <div className="skel skel-pill hero-pill" />
        <div className="skel skel-title hero-title" />
        <div className="skel skel-line hero-line" />
        <div className="skel skel-button hero-button" />
        <div className="skel-card skel-feature">
          <div className="skel skel-image small" />
          <div>
            <div className="skel skel-line short" />
            <div className="skel skel-line" />
            <div className="skel skel-line tiny" />
          </div>
        </div>
        <div className="skel-card skel-trust">
          <div className="skel skel-line" />
          <div className="skel skel-line" />
          <div className="skel skel-line" />
        </div>
      </div>
    )
  }

  if (screen === 'detail') {
    return (
      <div className="screen light-screen detail-screen skeleton-screen" aria-label="Loading dish">
        <div className="skel detail-photo" />
        <div className="detail-body">
          <div className="skel skel-pill" />
          <div className="skel skel-title" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
          <div className="skeleton-segments">
            <div className="skel skel-pill" />
            <div className="skel skel-pill" />
            <div className="skel skel-pill" />
          </div>
          <div className="skel-card skel-row-card" />
          <div className="skel-card skel-row-card" />
          <div className="skeleton-actions">
            <div className="skel skel-button small-button" />
            <div className="skel skel-button" />
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'confirmed') {
    return (
      <div className="screen light-screen confirmed-screen skeleton-screen" aria-label="Confirming order">
        <div className="skel skel-circle success-skel" />
        <div className="skel skel-title centered" />
        <div className="skel skel-line centered short" />
        <div className="skel-card order-skel">
          <div className="skel skel-line tiny centered" />
          <div className="skel skel-title centered" />
          <div className="skel skel-line centered" />
        </div>
        <div className="skel skel-button wide-skel" />
      </div>
    )
  }

  const rows = screen === 'cart' ? 3 : screen === 'tracking' ? 4 : 5

  return (
    <div className="screen light-screen skeleton-screen has-nav" aria-label={`Loading ${screen}`}>
      <div className="skeleton-header">
        <div className="skel skel-circle" />
        <div className="skel skel-title header-title" />
        <div className="skel skel-circle" />
      </div>
      {screen === 'menu' && (
        <>
          <div className="skeleton-tabs">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="skel skel-pill" key={index} />
            ))}
          </div>
        </>
      )}
      {screen === 'collections' && <div className="skel-card offer-skel large" />}
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skel-card list-skel" key={index}>
          <div className="skel skel-image" />
          <div className="skel-copy">
            <div className="skel skel-line short" />
            <div className="skel skel-line" />
            <div className="skel skel-line mid" />
          </div>
        </div>
      ))}
      {['cart', 'checkout', 'tracking'].includes(screen) && <div className="skel skel-button wide-skel" />}
      <div className="bottom-nav skeleton-nav">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skel nav-dot" key={index} />
        ))}
      </div>
    </div>
  )
}

function IconButton({ label, children, onClick, className = '', disabled }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function PageHeader({ title, onBack, right }) {
  return (
    <header className="page-header">
      <IconButton label="Go back" onClick={onBack} className="ghost">
        <ArrowLeft size={20} />
      </IconButton>
      <h1>{title}</h1>
      <div className="header-action">{right}</div>
    </header>
  )
}

function PrimaryButton({ children, onClick, className = '', disabled }) {
  return (
    <button
      type="button"
      className={`primary-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function CartBadge({ count }) {
  return (
    <span className={`cart-badge ${count ? 'visible' : ''}`} aria-label={`${count} items in cart`}>
      {count}
    </span>
  )
}

function HomeScreen({ cartCount, go, openDetail }) {
  const heroItem = menuItems.find((item) => item.id === 'giant-17-inch-pizza') || menuItems[0]

  return (
    <div className="screen home-screen">
      <img className="hero-image" src={images.hero} alt="Warm grey-toned cafe interior" />
      <div className="hero-shade" />
      <div className="home-top">
        <p className="brand-mark">
          Chapter
          <br />
          One Cafe
        </p>
        <div className="top-actions">
          <IconButton label="Open cart" onClick={() => go('cart')} className="outline dark has-badge">
            <ShoppingBag size={20} />
            <CartBadge count={cartCount} />
          </IconButton>
          <IconButton label="Open menu" onClick={() => go('menu')} className="outline dark">
            <MenuIcon size={22} />
          </IconButton>
        </div>
      </div>

      <section className="hero-copy upgraded">
        <div className="open-pill">
          <span />
          Open now {MIDDLE_DOT} Table service
        </div>
        <h1>Evening plates, brewed slowly.</h1>
        <p>
          A polished cafe ordering experience with chef favorites, live cart, and smooth
          table checkout.
        </p>
        <div className="hero-actions">
          <PrimaryButton onClick={() => go('menu')} className="gold-button">
            <span>Start Order</span>
            <ArrowRight size={18} />
          </PrimaryButton>
          <button type="button" className="glass-button" onClick={() => go('collections')}>
            Specials
          </button>
        </div>
      </section>

      <section className="featured-plate" aria-label="Featured dish">
        <img src={heroItem.image} alt={heroItem.name} />
        <div>
          <span className="tiny-label">Tonight's pick</span>
          <h2>{heroItem.name}</h2>
          <p>{money(heroItem.price)} {MIDDLE_DOT} 18 min</p>
        </div>
        <button type="button" onClick={() => openDetail(heroItem.id)}>
          View
        </button>
      </section>

      <section className="trust-panel" aria-label="Cafe benefits">
        <TrustItem icon={Clock3} label="Ready Fast" note="18-25 min" />
        <TrustItem icon={Leaf} label="Fresh Kitchen" note="Made Daily" />
        <TrustItem icon={ShieldCheck} label="Easy Checkout" note="Table Safe" />
      </section>

      <div className="quick-actions" aria-label="Quick order actions">
        <button type="button" onClick={() => go('menu')}>
          <BookOpen size={17} />
          View Menu
        </button>
        <button type="button" onClick={() => go('tracking')}>
          <PackageCheck size={17} />
          Track
        </button>
      </div>
    </div>
  )
}

function TrustItem({ icon: Icon, label, note }) {
  return (
    <div className="trust-item">
      <Icon size={23} />
      <strong>{label}</strong>
      <span>{note}</span>
    </div>
  )
}

function MenuScreen({
  activeTab,
  addToCart,
  cartCount,
  favorites,
  filteredItems,
  go,
  openDetail,
  query,
  setActiveTab,
  setQuery,
  setShowSearch,
  showSearch,
  tabs,
  toggleFavorite,
}) {
  return (
    <div className="screen light-screen has-nav">
      <header className="menu-header">
        <div>
          <span className="screen-kicker">Premium Selection</span>
          <h1>Our Menu</h1>
        </div>
        <div className="top-actions">
          <IconButton
            label={showSearch ? 'Close search' : 'Search menu'}
            className="ghost"
            onClick={() => setShowSearch((value) => !value)}
          >
            {showSearch ? <X size={22} /> : <Search size={22} />}
          </IconButton>
          <IconButton label="Open cart" className="ghost has-badge" onClick={() => go('cart')}>
            <ShoppingBag size={20} />
            <CartBadge count={cartCount} />
          </IconButton>
        </div>
      </header>

      {showSearch && (
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pizza, burger, momos, coffee..."
            autoFocus
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
        </label>
      )}

      <nav className="tab-row" aria-label="Menu categories">
        {tabs.map((tab) => (
          <button
            type="button"
            className={tab === activeTab ? 'active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="menu-list" aria-label="Featured dishes">
        {filteredItems.map((item) => (
          <article className="food-card" key={item.id}>
            <button type="button" className="food-open" onClick={() => openDetail(item.id)}>
              <img src={item.image} alt={item.name} />
              <div>
                <div className="food-meta">
                  {item.tag && <span className="mini-tag">{item.tag}</span>}
                  <span>
                    <Star size={12} fill="currentColor" />
                    {item.rating}
                  </span>
                </div>
                <h2>{item.name}</h2>
                <p>{item.note}</p>
                <strong>{item.sizes ? `From ${money(item.price)}` : money(item.price)}</strong>
              </div>
            </button>
            <IconButton
              label={`${favorites.has(item.id) ? 'Remove' : 'Save'} ${item.name}`}
              className={`heart-button ${favorites.has(item.id) ? 'saved' : ''}`}
              onClick={() => toggleFavorite(item.id)}
            >
              <Heart size={16} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton
              label={`Add ${item.name}`}
              className="add-button"
              onClick={() => addToCart(item)}
            >
              <Plus size={18} />
            </IconButton>
          </article>
        ))}
        {!filteredItems.length && (
          <section className="empty-state">
            <Search size={24} />
            <h2>No dishes found</h2>
            <p>Try another search or category.</p>
            <button type="button" onClick={() => setQuery('')}>
              Clear Search
            </button>
          </section>
        )}
      </section>
      <BottomNav active="menu" cartCount={cartCount} onNavigate={go} />
    </div>
  )
}

function DetailScreen({
  addToCart,
  cartCount,
  detailQty,
  detailUnitPrice,
  extras,
  favorites,
  go,
  selectedItem,
  setDetailQty,
  setExtras,
  setSpice,
  spice,
  toggleFavorite,
  pizzaSize,
  setPizzaSize,
}) {
  const lineTotal = detailUnitPrice * detailQty

  return (
    <div className="screen light-screen detail-screen">
      <div className="detail-photo">
        <img src={selectedItem.image} alt={selectedItem.name} />
        <IconButton label="Back to menu" onClick={() => go('menu')} className="floating left">
          <ArrowLeft size={20} />
        </IconButton>
        <IconButton
          label="Favorite dish"
          className={`floating right ${favorites.has(selectedItem.id) ? 'saved' : ''}`}
          onClick={() => toggleFavorite(selectedItem.id)}
        >
          <Heart size={19} fill={favorites.has(selectedItem.id) ? 'currentColor' : 'none'} />
        </IconButton>
      </div>
      <section className="detail-body">
        <span className="mini-tag">{selectedItem.tag || selectedItem.category}</span>
        <div className="title-price">
          <h1>{selectedItem.name}</h1>
          <strong>{money(detailUnitPrice)}</strong>
        </div>
        <p>{selectedItem.note}</p>
        <div className="detail-stats">
          <span>
            <Star size={13} fill="currentColor" />
            {selectedItem.rating}
          </span>
          <span>
            <Clock3 size={13} />
            18-25 min
          </span>
          <span>
            <Flame size={13} />
            420 kcal
          </span>
        </div>
        <hr />
        <h2>Customize</h2>
        {selectedItem.sizes && (
          <>
            <label className="form-label">Pizza Size</label>
            <div className="segmented-control" style={{ marginBottom: '15px' }}>
              {['Regular', 'Medium', 'Large'].map((size) => (
                <button
                  type="button"
                  className={pizzaSize === size ? 'active' : ''}
                  key={size}
                  onClick={() => setPizzaSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </>
        )}
        <label className="form-label">Spice Level</label>
        <div className="segmented-control">
          {['Mild', 'Medium', 'Spicy'].map((level) => (
            <button
              type="button"
              className={spice === level ? 'active' : ''}
              key={level}
              onClick={() => setSpice(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <label className="form-label">Add Extras</label>
        <ExtraToggle
          checked={extras.chicken}
          label="Grilled Chicken"
          price={80}
          onClick={() => setExtras((current) => ({ ...current, chicken: !current.chicken }))}
        />
        <ExtraToggle
          checked={extras.cheese}
          label="Extra Cheese"
          price={selectedItem.sizes ? (pizzaSize === 'Large' ? 80 : pizzaSize === 'Medium' ? 60 : 40) : 40}
          onClick={() => setExtras((current) => ({ ...current, cheese: !current.cheese }))}
        />
        <div className="sticky-actions">
          <QuantityControl value={detailQty} min={1} onChange={setDetailQty} />
          <PrimaryButton
            onClick={() => {
              addToCart(selectedItem, { qty: detailQty, spice, extras, size: selectedItem.sizes ? pizzaSize : null })
              go('cart')
            }}
          >
            <span>Add to Cart</span>
            <span>{money(lineTotal)}</span>
          </PrimaryButton>
        </div>
        <button type="button" className="cart-link-button" onClick={() => go('cart')}>
          View cart {MIDDLE_DOT} {cartCount} items
        </button>
      </section>
    </div>
  )
}

function ExtraToggle({ checked, label, price, onClick }) {
  return (
    <button type="button" className={`check-row as-button ${checked ? '' : 'muted'}`} onClick={onClick}>
      <span>{checked ? <Check size={14} /> : <span className="empty-check" />} {label}</span>
      <strong>+{money(price)}</strong>
    </button>
  )
}

function CartScreen({
  cart,
  delivery,
  go,
  removeFromCart,
  subtotal,
  total,
  updateCartQty,
}) {
  return (
    <div className="screen light-screen">
      <PageHeader title="My Cart" onBack={() => go('menu')} />
      {cart.length ? (
        <>
          <section className="cart-list" aria-label="Cart items">
            {cart.map((line) => (
              <article className="cart-card" key={line.lineId}>
                <img src={line.image} alt={line.name} />
                <div className="cart-copy">
                  <h2>{line.name}</h2>
                  <p>{line.spice} {MIDDLE_DOT} {[line.size ? `${line.size} Size` : '', describeExtras(line.extras)].filter(Boolean).join(' + ') || line.sub}</p>
                  <strong>{money(line.unitPrice)}</strong>
                </div>
                <IconButton
                  label={`Remove ${line.name}`}
                  className="ghost trash"
                  onClick={() => removeFromCart(line.lineId)}
                >
                  <Trash2 size={17} />
                </IconButton>
                <QuantityControl
                  small
                  value={line.qty}
                  onChange={(nextQty) => updateCartQty(line.lineId, nextQty - line.qty)}
                />
              </article>
            ))}
          </section>
          <section className="bill-panel">
            <BillRow label="Subtotal" value={money(subtotal)} />
            <BillRow label="Delivery Fee" value={delivery ? money(delivery) : 'Free'} />
            <BillRow label="Total" value={money(total)} strong />
          </section>
          <PrimaryButton onClick={() => go('checkout')} className="wide-cta">
            Proceed to Checkout
          </PrimaryButton>
        </>
      ) : (
        <section className="empty-state tall">
          <ShoppingBag size={30} />
          <h2>Your cart is empty</h2>
          <p>Add dishes from the menu to checkout.</p>
          <PrimaryButton onClick={() => go('menu')}>Browse Menu</PrimaryButton>
        </section>
      )}
    </div>
  )
}

function describeExtras(extras) {
  return [
    extras.chicken ? 'Grilled Chicken' : '',
    extras.cheese ? 'Extra Cheese' : '',
  ]
    .filter(Boolean)
    .join(', ')
}

function CollectionsScreen({ addToCart, cartCount, go, openDetail }) {
  return (
    <div className="screen light-screen collections-screen has-nav">
      <header className="collections-header">
        <div>
          <span className="screen-kicker">Cafe rewards</span>
          <h1>Collections</h1>
        </div>
        <button type="button" onClick={() => go('menu')}>
          View All
        </button>
      </header>
      <section className="offer-grid">
        {offers.map((offer) => {
          const item = menuItems.find((menuItem) => menuItem.id === offer.itemId)
          return (
            <article className={`offer-card ${offer.wide ? 'wide' : ''}`} key={offer.title}>
              <img src={offer.image} alt="" />
              <div className="offer-tint" />
              <div className="offer-copy">
                <h2>{offer.title}</h2>
                <strong>{offer.value}</strong>
                <p>{offer.text}</p>
                <PrimaryButton
                  onClick={() => {
                    if (item) addToCart(item)
                  }}
                  className="gold-button compact"
                >
                  {offer.cta}
                  <Plus size={16} />
                </PrimaryButton>
              </div>
            </article>
          )
        })}
      </section>

      <section className="profile-panel">
        <div>
          <span className="avatar">
            <UserRound size={20} />
          </span>
          <div>
            <h2>Welcome</h2>
            <p>Cafe Member</p>
          </div>
        </div>
        <button type="button" onClick={() => openDetail('chapter-one-special-pizza')}>
          Favorite Dish
        </button>
      </section>

      <section className="profile-actions">
        <button type="button" onClick={() => go('tracking')}>
          <PackageCheck size={18} />
          Track latest order
        </button>
        <button type="button" onClick={() => go('checkout')}>
          <CalendarDays size={18} />
          Book table checkout
        </button>
        <button type="button" onClick={() => go('admin')}>
          <ShieldCheck size={18} />
          Admin Dashboard
        </button>
      </section>
      <BottomNav active="collections" cartCount={cartCount} onNavigate={go} />
    </div>
  )
}

function CheckoutScreen({
  cart,
  customer,
  deliveryType,
  placeOrder,
  setCustomer,
  setDeliveryType,
  setTableNumber,
  tableNumber,
  total,
  go,
}) {
  return (
    <div className="screen light-screen checkout-screen">
      <PageHeader title="Checkout" onBack={() => go('cart')} />
      {cart.length ? (
        <>
          <section className="checkout-form">
            <label className="form-label">Delivery Type</label>
            <div className="choice-row">
              {[
                ['Dine In', Utensils],
                ['Takeaway', ShoppingBag],
              ].map(([type, Icon]) => (
                <button
                  type="button"
                  className={deliveryType === type ? 'active' : ''}
                  key={type}
                  onClick={() => setDeliveryType(type)}
                >
                  <Icon size={15} />
                  {type}
                </button>
              ))}
            </div>
            {deliveryType === 'Dine In' ? (
              <>
                <label className="form-label" htmlFor="table-number">Table Number</label>
                <div className="select-wrap">
                  <select
                    id="table-number"
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                  >
                    {['5', '8', '12', '14', '21'].map((table) => (
                      <option value={table} key={table}>
                        Table {table}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={17} />
                </div>
              </>
            ) : (
              <section className="pickup-card">
                <Store size={18} />
                <div>
                  <h2>Pickup counter</h2>
                  <p>Ready near the front bar in 25 minutes.</p>
                </div>
              </section>
            )}
            <h2>Your Details</h2>
            <div className="two-fields">
              <Field
                label="Name"
                value={customer.name}
                onChange={(value) => setCustomer((current) => ({ ...current, name: value }))}
              />
              <Field
                label="Phone Number"
                value={customer.phone}
                onChange={(value) => setCustomer((current) => ({ ...current, phone: value }))}
              />
            </div>
            <Field
              label="Special Instructions (Optional)"
              value={customer.instructions}
              placeholder="Any special requests?"
              onChange={(value) =>
                setCustomer((current) => ({ ...current, instructions: value }))
              }
              wide
            />
          </section>
          <PrimaryButton onClick={placeOrder} className="wide-cta checkout-cta">
            <span>Place Order</span>
            <span>{money(total)}</span>
            <ArrowRight size={20} />
          </PrimaryButton>
        </>
      ) : (
        <section className="empty-state tall">
          <ShoppingBag size={30} />
          <h2>No items to checkout</h2>
          <p>Add something fresh from the menu.</p>
          <PrimaryButton onClick={() => go('menu')}>Go to Menu</PrimaryButton>
        </section>
      )}
    </div>
  )
}

function ConfirmedScreen({ go, order }) {
  return (
    <div className="screen light-screen confirmed-screen">
      <div className="success-mark">
        <Check size={36} />
      </div>
      <h1>Order Confirmed!</h1>
      <p>Your order has been placed successfully.</p>
      <section className="order-card">
        <span>Order ID</span>
        <strong>{order?.id || '#CO12345'}</strong>
        <div className="fine-line" />
        <p>
          {order
            ? `${order.deliveryType} order for ${money(order.total)} is being prepared.`
            : 'We will notify you when your order is ready.'}
        </p>
      </section>
      <PrimaryButton onClick={() => go('tracking')} className="wide-cta">
        Track Order
      </PrimaryButton>
      <button type="button" className="text-button" onClick={() => go('home')}>
        Back to Home
      </button>
    </div>
  )
}

const STATUS_MAP = {
  'Ordered': 0,
  'Confirmed': 1,
  'Preparing': 2,
  'Ready to Serve': 3,
  'Completed': 4,
  'Cancelled': -1,
}

const STATUS_LABELS = {
  'Ordered': { title: 'Order placed', eta: 'Waiting for confirmation...' },
  'Confirmed': { title: 'Order confirmed', eta: 'Your order has been accepted!' },
  'Preparing': { title: 'Preparing your meal', eta: 'Arriving in approx. 18 mins' },
  'Ready to Serve': { title: 'Ready to serve!', eta: 'Come pick up your order' },
  'Completed': { title: 'Order completed', eta: 'Enjoy your meal! \u2764\ufe0f' },
  'Cancelled': { title: 'Order cancelled', eta: 'Contact support for help' },
}

const liveTrackingSteps = [
  { label: 'Order Placed', text: 'Your order has been received', icon: ReceiptText },
  { label: 'Confirmed', text: 'Restaurant accepted your order', icon: ShieldCheck },
  { label: 'Preparing', text: 'Chef is cooking your food', icon: ChefHat },
  { label: 'Ready', text: 'Your order is ready', icon: BellRing },
  { label: 'Completed', text: 'Enjoy your meal!', icon: PackageCheck },
]

function TrackingScreen({ cartCount, go, order, notify }) {
  const [liveStatus, setLiveStatus] = useState(order ? 'Ordered' : null)
  const [statusTime, setStatusTime] = useState('')

  useEffect(() => {
    if (!order) return
    let cancelled = false

    // Request notification permission and subscribe to Push Service
    if ("Notification" in window && "serviceWorker" in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          navigator.serviceWorker.ready.then(async registration => {
            try {
              let subscription = await registration.pushManager.getSubscription();
              if (!subscription) {
                // Convert base64 VAPID key to Uint8Array
                const publicVapidKey = 'BBZ5GvoqaxRLR2hilJBhK3EnhkEZnJ1GV7gyfNRwAAsaIe5Ef1_cPJKGiKGhzBc65_elag8gBdC5U6JKoKbq3YQ';
                const padding = '='.repeat((4 - publicVapidKey.length % 4) % 4);
                const base64 = (publicVapidKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                  outputArray[i] = rawData.charCodeAt(i);
                }
                
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: outputArray
                });
              }
              
              // Send subscription to backend
              await fetch('http://localhost:3001/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription, orderId: order.id })
              });
            } catch (err) {
              console.error('Push registration failed:', err);
            }
          });
        }
      });
    }

    const poll = async () => {
      const result = await pollOrderStatus(order.id)
      if (result && !cancelled) {
        if (typeof result === 'object') {
          setLiveStatus((prev) => {
            if (prev !== result.status) {
              const info = STATUS_LABELS[result.status]
              if (info) {
                notify(`${info.title}`)
                
                // Trigger System Notification and Sound if it's an important update
                if (['Preparing', 'Ready to Serve', 'Completed'].includes(result.status)) {
                  try {
                    const audioEl = document.getElementById('notification-sound');
                    if (audioEl) {
                      audioEl.currentTime = 0;
                      audioEl.play().catch(e => console.log('Audio play blocked:', e));
                    }
                  } catch (e) {}
                  
                  if ("Notification" in window && Notification.permission === "granted") {
                    try {
                      navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(`Order ${result.status}`, {
                          body: info.eta,
                          icon: '/vite.svg',
                          vibrate: [200, 100, 200]
                        });
                      }).catch(() => {
                        // Fallback if no service worker
                        new Notification(`Order ${result.status}`, {
                          body: info.eta,
                          icon: '/vite.svg'
                        });
                      });
                    } catch (e) {
                      new Notification(`Order ${result.status}`, {
                        body: info.eta,
                        icon: '/vite.svg'
                      });
                    }
                  }
                }
              }
            }
            return result.status
          })
          setStatusTime(result.updatedAt || '')
        } else {
          setLiveStatus(result)
        }
      }
    }

    poll()
    const interval = setInterval(poll, 10000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [order])

  const activeStep = STATUS_MAP[liveStatus] ?? 0
  const statusInfo = STATUS_LABELS[liveStatus] || STATUS_LABELS['Ordered']

  // Format any timestamp to clean 12-hour time like "1:08 PM"
  const formatTime = (raw) => {
    if (!raw) return ''
    try {
      const d = new Date(raw)
      if (isNaN(d.getTime())) return raw
      return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    } catch { return raw }
  }

  // Only show real times: order placed time for step 0, sheet time for current step
  const getTimeForStep = (index) => {
    if (index === 0 && order) return order.createdAt
    if (index === activeStep && statusTime) return formatTime(statusTime)
    if (index < activeStep) return '\u2713'
    return ''
  }

  return (
    <div className="screen light-screen tracking-screen has-nav">
      <PageHeader title="Order Tracking" onBack={() => go(order ? 'confirmed' : 'home')} />
      
      {order ? (
        <>
          <section className="live-status-card">
            <div className="status-pulse-ring" />
            <div className="status-badge">{liveStatus === 'Completed' ? '\u2705' : 'Live'}</div>
            <div className="status-info">
              <span className="status-title">{statusInfo.title}</span>
              <p className="status-eta">{statusInfo.eta}</p>
            </div>
            <div className="status-order-id">{order.id}</div>
          </section>

          <section className="tracking-summary-v2">
            <div className="order-brief">
              <strong>{order.deliveryType} Order</strong>
              <span>{order.items.length} items {MIDDLE_DOT} {money(order.total)}</span>
            </div>
          </section>

          <section className="timeline-v2">
            {liveTrackingSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index < activeStep
              const isCurrent = index === activeStep
              const statusClass = isCurrent ? 'current' : isActive ? 'active' : 'pending'
              
              return (
                <article className={`timeline-item-v2 ${statusClass}`} key={step.label}>
                  <div className="timeline-left">
                    <div className="timeline-connector" />
                    <div className="timeline-dot">
                      <Icon size={14} />
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-text">
                      <h2>{step.label}</h2>
                      <p>{step.text}</p>
                    </div>
                    <time>{getTimeForStep(index)}</time>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="support-panel">
            <div className="support-info">
              <h3>Something went wrong?</h3>
              <p>Our support team is here 24/7</p>
            </div>
            <a href="tel:+919876543210" className="support-link">
              <Phone size={18} />
              Call Support
            </a>
          </section>
        </>
      ) : (
        <section className="empty-state tracking-empty">
          <div className="empty-icon-wrap">
            <ClipboardList size={40} />
          </div>
          <h2>No active orders</h2>
          <p>You haven't placed any orders recently. Start browsing our menu to get started!</p>
          <PrimaryButton onClick={() => go('menu')} className="gold-button">
            Go to Menu
          </PrimaryButton>
        </section>
      )}
      <BottomNav active="tracking" cartCount={cartCount} onNavigate={go} />
    </div>
  )
}

function Field({ label, value, onChange, wide, placeholder }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function BillRow({ label, value, strong }) {
  return (
    <div className={`bill-row ${strong ? 'strong' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function QuantityControl({ small, value, onChange, min = 0 }) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(value + 1)

  return (
    <div className={`quantity-control ${small ? 'small' : ''}`} aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" onClick={decrease}>
        <Minus size={small ? 14 : 16} />
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={increase}>
        <Plus size={small ? 14 : 16} />
      </button>
    </div>
  )
}

function BottomNav({ active, cartCount, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: BookOpen },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'tracking', label: 'Orders', icon: ClipboardList },
    { id: 'collections', label: 'Profile', icon: UserRound },
  ]

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            type="button"
            className={active === item.id ? 'active' : ''}
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon-wrap">
              <Icon size={18} />
              {item.id === 'cart' && <CartBadge count={cartCount} />}
            </span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function AdminPanelScreen({ go, notify }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('All')
  const [isMuted, setIsMuted] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [newOrderPopup, setNewOrderPopup] = useState(null) // Holds { id, customerName, total }
  
  const isFirstLoadRef = useRef(true)
  const notifiedOrdersRef = useRef(new Set())

  // Fetch orders from Sheets first, fall back to Local Server
  // Merges both sources and syncs any status differences back to local
  const fetchAllOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    setError(null);
    try {
      let gsOrders = [];
      let localOrders = [];

      // Fetch from both sources in parallel
      const [gsResult, localResult] = await Promise.allSettled([
        fetchOrdersFromGS().catch(() => []),
        fetchOrdersLocal().catch(() => [])
      ]);

      gsOrders = gsResult.status === 'fulfilled' ? (gsResult.value || []) : [];
      localOrders = localResult.status === 'fulfilled' ? (localResult.value || []) : [];

      // Merge: use Google Sheets as the primary source of truth for status,
      // but include any orders only present in the local DB
      let mergedOrders = [];
      const seenIds = new Set();

      // First pass: add all GS orders and sync status to local if different
      for (const gsOrder of gsOrders) {
        seenIds.add(gsOrder.id);
        const localMatch = localOrders.find(o => o.id === gsOrder.id);

        if (localMatch) {
          // Merge: GS status overrides local if they differ
          const merged = { ...localMatch, ...gsOrder };
          // Preserve local rich fields (items array, metadata object etc.)
          if (localMatch.items && localMatch.items.length > 0) {
            merged.items = localMatch.items;
          }
          if (localMatch.metadata) {
            merged.metadata = localMatch.metadata;
          }
          if (localMatch.customer) {
            merged.customer = { ...localMatch.customer, ...gsOrder.customer };
          }
          mergedOrders.push(merged);

          // If status is different, sync GS status back to local Express DB
          if (gsOrder.status && localMatch.status !== gsOrder.status) {
            updateOrderStatusLocal(gsOrder.id, gsOrder.status).catch(() => {});
          }
        } else {
          mergedOrders.push(gsOrder);
        }
      }

      // Second pass: add any local-only orders not found in GS
      for (const localOrder of localOrders) {
        if (!seenIds.has(localOrder.id)) {
          seenIds.add(localOrder.id);
          mergedOrders.push(localOrder);
        }
      }

      // If both sources were empty, nothing to show
      if (mergedOrders.length === 0) {
        mergedOrders = localOrders.length > 0 ? localOrders : gsOrders;
      }

      // Sort orders descending so newest are on top
      mergedOrders.sort((a, b) => {
        const aTime = a.placedAt || 0;
        const bTime = b.placedAt || 0;
        if (aTime && bTime) return bTime - aTime;
        return (b.id || '').localeCompare(a.id || '');
      });

      setOrders(mergedOrders);

      // Check for new orders to play sound
      if (!isFirstLoadRef.current) {
        const newOrderedOrders = mergedOrders.filter(
          o => o.status === 'Ordered' && !orders.some(prev => prev.id === o.id)
        );
        if (newOrderedOrders.length > 0) {
          const freshOrders = newOrderedOrders.filter(o => !notifiedOrdersRef.current.has(o.id));
          if (freshOrders.length > 0) {
            freshOrders.forEach(o => notifiedOrdersRef.current.add(o.id));
            if (!isMuted) playNotificationSound();
            // Show large modal popup
            setNewOrderPopup({
              id: freshOrders[0].id,
              customerName: freshOrders[0].customer?.name || 'Walk-in Customer',
              total: freshOrders[0].total
            });
            notify(`New Order Received: ${freshOrders[0].id}`);
          }
        }
      } else {
        // Initialize notified list on first load
        notifiedOrdersRef.current = new Set(mergedOrders.filter(o => o.status === 'Ordered').map(o => o.id));
        isFirstLoadRef.current = false;
      }
      
      // Default select the first order if none selected
      if (mergedOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(mergedOrders[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not fetch orders from Google Sheets or local server.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // Poll every 5 seconds for permanent live-updating!
    const interval = setInterval(() => {
      fetchAllOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    try {
      const audioEl = document.getElementById('admin-notification-sound');
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log('Audio playback blocked/failed:', e));
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    notify(`Updating ${orderId} to ${nextStatus}...`);
    setSelectedOrderId(orderId); // Lock selection to prevent jumps
    
    // 1. Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus, statusUpdatedAt: new Date().toLocaleString('en-IN') } : o));

    try {
      // 2. Update Sheets and Local Server in parallel
      await Promise.all([
        updateOrderStatusInGS(orderId, nextStatus).catch(e => console.error('Sheets status update error:', e)),
        updateOrderStatusLocal(orderId, nextStatus).catch(e => console.error('Local status update error:', e))
      ]);
      notify(`Order ${orderId} updated to ${nextStatus}!`);
    } catch (err) {
      console.error('Failed to update status:', err);
      notify('Failed to update status on server, synced back.');
      fetchAllOrders(true);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = 
        activeTab === 'All' ||
        (activeTab === 'New' && order.status === 'Ordered') ||
        (activeTab === 'Preparing' && order.status === 'Preparing') ||
        (activeTab === 'Ready' && order.status === 'Ready to Serve') ||
        (activeTab === 'Archived' && ['Completed', 'Cancelled'].includes(order.status));

      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !cleanQuery ||
        (order.id || '').toLowerCase().includes(cleanQuery) ||
        (order.customer?.name || '').toLowerCase().includes(cleanQuery) ||
        (order.customer?.phone || '').toLowerCase().includes(cleanQuery) ||
        (order.itemsSummary || '').toLowerCase().includes(cleanQuery);

      const matchesDelivery =
        deliveryFilter === 'All' ||
        order.deliveryType === deliveryFilter;

      return matchesTab && matchesSearch && matchesDelivery;
    });
  }, [orders, activeTab, searchQuery, deliveryFilter]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0];

  // Calculate statistics
  const stats = useMemo(() => {
    const revenue = orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const pending = orders.filter(o => ['Ordered', 'Confirmed', 'Preparing'].includes(o.status)).length;
    const ready = orders.filter(o => o.status === 'Ready to Serve').length;
    const completed = orders.filter(o => o.status === 'Completed').length;

    return { revenue, pending, ready, completed, total: orders.length };
  }, [orders]);

  // Helper to parse items summary into array if it's text
  const getOrderItemsList = (order) => {
    if (!order) return [];
    if (order.items && order.items.length) return order.items;
    
    // Parse from itemsSummary text: "Truffle Mushroom Pasta x1 (₹349), Classic Burger x2 (₹498)"
    if (order.itemsSummary) {
      try {
        return order.itemsSummary.split(', ').map((str, idx) => {
          const match = str.match(/(.*?)\s+x(\d+)\s+\(₹?(\d+)\)/);
          if (match) {
            return {
              lineId: `${order.id}-item-${idx}`,
              name: match[1],
              qty: Number(match[2]),
              unitPrice: Number(match[3]) / Number(match[2] || 1),
              total: Number(match[3])
            };
          }
          return { lineId: `item-${idx}`, name: str, qty: 1, unitPrice: 0 };
        });
      } catch (e) {
        return [{ lineId: 'err-1', name: order.itemsSummary, qty: 1, unitPrice: 0 }];
      }
    }
    return [];
  };

  const currentItems = getOrderItemsList(selectedOrder);
  const statusSlug = (status = 'Ordered') => status.replace(/\s+/g, '-').toLowerCase();
  const liveQueue = orders
    .filter((order) => ['Ordered', 'Confirmed', 'Preparing'].includes(order.status || 'Ordered'))
    .slice(0, 8);
  const getTabCount = (tab) => {
    if (tab === 'All') return orders.length;
    if (tab === 'New') return orders.filter((order) => order.status === 'Ordered').length;
    if (tab === 'Preparing') return orders.filter((order) => order.status === 'Preparing').length;
    if (tab === 'Ready') return orders.filter((order) => order.status === 'Ready to Serve').length;
    return orders.filter((order) => ['Completed', 'Cancelled'].includes(order.status)).length;
  };
  const getQuickAction = (status = 'Ordered') => {
    const actions = {
      Ordered: { status: 'Confirmed', label: 'Confirm', Icon: ShieldCheck, className: 'quick-confirm' },
      Confirmed: { status: 'Preparing', label: 'Start', Icon: ChefHat, className: 'quick-start' },
      Preparing: { status: 'Ready to Serve', label: 'Ready', Icon: BellRing, className: 'quick-ready' },
      'Ready to Serve': { status: 'Completed', label: 'Complete', Icon: PackageCheck, className: 'quick-done' },
    };
    return actions[status] || null;
  };

  return (
    <div className="admin-container">
      {/* Header bar */}
      <header className="admin-header">
        <div className="header-left">
          <IconButton label="Back to Client" onClick={() => go('home')} className="admin-icon-button">
            <ArrowLeft size={18} />
          </IconButton>
          <div className="header-logo-mark">
            <Store size={20} />
          </div>
          <div>
            <h1>Kitchen & Order Control</h1>
            <p className="kicker">Chapter One Cafe Admin</p>
          </div>
        </div>

        <div className="header-right">
          <div className={`live-badge ${isSyncing ? 'syncing' : ''}`}>
            <span className="dot" />
            Live Sync
          </div>
          
          <IconButton 
            label={isMuted ? "Unmute sound" : "Mute sound"} 
            onClick={() => {
              setIsMuted(!isMuted);
              notify(isMuted ? "Sound Unmuted" : "Sound Muted");
            }}
            className="admin-icon-button"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </IconButton>

          <IconButton 
            label="Force sync Google Sheets" 
            onClick={() => fetchAllOrders()} 
            className="admin-icon-button"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </IconButton>
        </div>
      </header>
      {error && (
        <div className="admin-alert" role="status">
          <X size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Board */}
      <section className="admin-stats-grid">
        <div className="stat-card sc-revenue">
          <div className="stat-icon-wrap bg-gold">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="stat-label">Today's Revenue</span>
            <h2 className="stat-value">{money(stats.revenue)}</h2>
          </div>
        </div>

        <div className={`stat-card sc-pending ${stats.pending ? 'stat-urgent' : ''}`}>
          {stats.pending > 0 && <span className="stat-urgent-dot" />}
          <div className="stat-icon-wrap bg-alert">
            <Clock3 size={22} />
          </div>
          <div>
            <span className="stat-label">Pending Kitchen</span>
            <h2 className="stat-value">{stats.pending}</h2>
          </div>
        </div>

        <div className={`stat-card sc-ready ${stats.ready ? 'stat-ready' : ''}`}>
          <div className="stat-icon-wrap bg-ready">
            <BellRing size={22} />
          </div>
          <div>
            <span className="stat-label">Ready to Serve</span>
            <h2 className="stat-value">{stats.ready}</h2>
          </div>
        </div>

        <div className="stat-card sc-completed">
          <div className="stat-icon-wrap bg-completed">
            <Check size={22} />
          </div>
          <div>
            <span className="stat-label">Completed Orders</span>
            <h2 className="stat-value">{stats.completed}</h2>
          </div>
        </div>
      </section>

      <section className="kitchen-queue-strip" aria-label="Active kitchen queue">
        <div className="kq-label">
          <Flame size={17} />
          <span>Kitchen Queue</span>
          <strong className="kq-count">{liveQueue.length} live</strong>
        </div>
        <div className="kq-cards">
          {liveQueue.length ? (
            liveQueue.map((order) => {
              const queueStatus = statusSlug(order.status || 'Ordered');
              return (
                <button
                  type="button"
                  className={`kq-card kq-${queueStatus} ${order.id === selectedOrderId ? 'kq-active' : ''}`}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <span className="kq-status-dot" />
                  <span className="kq-info">
                    <span className="kq-id">{order.id}</span>
                    <span className="kq-name">{order.customer?.name || 'Walk-in Customer'}</span>
                  </span>
                  <span className="kq-badge">{order.status === 'Ready to Serve' ? 'Ready' : order.status || 'Ordered'}</span>
                </button>
              );
            })
          ) : (
            <div className="kq-empty">No active kitchen orders</div>
          )}
        </div>
      </section>

      {/* Main Panel Layout */}
      <section className="admin-layout">
        
        {/* Left Side: Order list and filter panel */}
        <div className="admin-sidebar">
          <div className="filter-controls">
            <div className="admin-search-wrap">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search Order ID, Name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} /></button>}
            </div>

            <div className="select-delivery-filter">
              <button 
                className={deliveryFilter === 'All' ? 'active' : ''} 
                onClick={() => setDeliveryFilter('All')}
              >
                All
              </button>
              <button 
                className={deliveryFilter === 'Dine In' ? 'active' : ''} 
                onClick={() => setDeliveryFilter('Dine In')}
              >
                Dine-In
              </button>
              <button 
                className={deliveryFilter === 'Takeaway' ? 'active' : ''} 
                onClick={() => setDeliveryFilter('Takeaway')}
              >
                Takeaway
              </button>
            </div>
          </div>

          <div className="admin-tabs">
            {['All', 'New', 'Preparing', 'Ready', 'Archived'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? 'active' : ''} 
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className="tab-count">{getTabCount(tab)}</span>
              </button>
            ))}
          </div>

          {loading && orders.length === 0 ? (
            <div className="sidebar-state">
              <RefreshCw size={24} className="spin text-gold" />
              <p>Loading live kitchen orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="sidebar-state">
              <ClipboardList size={30} className="text-muted" />
              <p>No orders found in this filter</p>
            </div>
          ) : (
            <div className="order-cards-list">
              {filteredOrders.map(order => {
                const isSelected = order.id === selectedOrderId;
                const orderStatus = statusSlug(order.status || 'Ordered');
                const quickAction = getQuickAction(order.status || 'Ordered');
                const QuickIcon = quickAction?.Icon;
                
                return (
                  <article 
                    key={order.id} 
                    className={`admin-order-card ${isSelected ? 'selected' : ''} status-${orderStatus} ${['ordered', 'confirmed', 'preparing'].includes(orderStatus) ? 'card-urgent' : ''} ${orderStatus === 'ready-to-serve' ? 'card-ready' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="card-top">
                      <span className="card-id-row">
                        {['ordered', 'confirmed', 'preparing'].includes(orderStatus) && <span className="card-pulse-dot" />}
                        <span className="order-id">{order.id}</span>
                      </span>
                      <time className="order-time">{order.createdAt || order.time}</time>
                    </div>

                    <div className="card-body">
                      <h2>{order.customer?.name || 'Walk-in Customer'}</h2>
                      <p className="card-items-desc truncate">
                        {order.itemsSummary || getOrderItemsList(order).map(i => `${i.name} x${i.qty}`).join(', ')}
                      </p>
                    </div>

                    <div className="card-bottom">
                      <span className={`badge badge-${orderStatus}`}>
                        {order.status || 'Ordered'}
                      </span>
                      
                      <div className="card-meta-indicators">
                        <span className="delivery-type-indicator">
                          {order.deliveryType === 'Dine In' ? `Table ${order.tableNumber || '?'}` : 'Takeaway'}
                        </span>
                        <strong className="order-price">{money(order.total || 0)}</strong>
                      </div>
                    </div>
                    {quickAction && (
                      <div className="card-quick-actions">
                        <button
                          type="button"
                          className={`quick-btn ${quickAction.className}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleUpdateStatus(order.id, quickAction.status);
                          }}
                        >
                          {QuickIcon && <QuickIcon size={14} />}
                          <span>{quickAction.label}</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Detailed View */}
        <div className="admin-detail-panel">
          {selectedOrder ? (
            <div className="detail-scrollable">
              {/* Top Banner */}
              <div className={`detail-banner-card status-${statusSlug(selectedOrder.status || 'Ordered')}`}>
                <div className="banner-left">
                  <span className="banner-id">Order {selectedOrder.id}</span>
                  <div className="banner-customer">
                    <h2>{selectedOrder.customer?.name || 'Walk-in Customer'}</h2>
                    <p>{selectedOrder.customer?.phone || 'No phone provided'}</p>
                  </div>
                </div>

                <div className="banner-right">
                  <span className={`badge badge-${statusSlug(selectedOrder.status || 'Ordered')}`}>
                    {selectedOrder.status || 'Ordered'}
                  </span>
                  <time className="banner-date">
                    {selectedOrder.fullDate || selectedOrder.date} {selectedOrder.createdAt || selectedOrder.time}
                  </time>
                  <span className="banner-type-pill">
                    {selectedOrder.deliveryType === 'Dine In'
                      ? `Table ${selectedOrder.tableNumber || 'N/A'}`
                      : 'Takeaway'}
                  </span>
                </div>
              </div>


              {/* BIG Quick Action Buttons */}
              <div className="big-action-row">
                {['Ordered','Confirmed','Preparing','Ready to Serve','Completed'].map((s, i, arr) => {
                  const icons = [ReceiptText, ShieldCheck, ChefHat, BellRing, PackageCheck];
                  const Icon = icons[i];
                  const isCurrent = selectedOrder.status === s;
                  const isPassed = arr.indexOf(selectedOrder.status) > i && selectedOrder.status !== 'Cancelled';
                  return (
                    <button
                      key={s}
                      className={`big-step-btn ${isCurrent ? 'big-step-current' : ''} ${isPassed ? 'big-step-passed' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                    >
                      <Icon size={18} />
                      <span>{s === 'Ready to Serve' ? 'Ready' : s}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cancel / Reopen */}
              <div className="order-action-footer">
                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Completed' && (
                  <button
                    className="action-footer-btn btn-cancel-order"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                  >
                    <X size={15} /> Cancel Order
                  </button>
                )}
                {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Completed') && (
                  <button
                    className="action-footer-btn btn-reopen-order"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Ordered')}
                  >
                    <RefreshCw size={15} /> Re-open Order
                  </button>
                )}
                {selectedOrder.statusUpdatedAt && (
                  <span className="status-meta-updated">Updated: {selectedOrder.statusUpdatedAt}</span>
                )}
              </div>

              {/* Items + Fulfillment grid */}
              <div className="detail-sections-grid">

                {/* Items */}
                <div className="detail-section">
                  <div className="section-title">
                    <Utensils size={15} />
                    <h3>Items Ordered</h3>
                    <span className="items-count-badge">
                      {currentItems.reduce((s,i) => s + i.qty, 0)} items
                    </span>
                  </div>
                  <div className="invoice-lines-list">
                    {currentItems.map((line, idx) => (
                      <div className="invoice-line-item" key={line.lineId || idx}>
                        <div className="line-item-desc">
                          <h4>{line.name}</h4>
                          {line.spice && <span className="line-item-custom">🌶 {line.spice} spice</span>}
                          {line.extras && Object.values(line.extras).some(Boolean) && (
                            <span className="line-item-custom">
                              + {Object.entries(line.extras).filter(([,v]) => v).map(([k]) => k).join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="line-item-math">
                          <span>{line.qty} × {money(line.unitPrice || 0)}</span>
                          <strong>{money((line.unitPrice||0)*line.qty || line.total || 0)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="invoice-summary-block">
                    <div className="invoice-summary-row">
                      <span>Subtotal</span>
                      <span>{money(selectedOrder.total || 0)}</span>
                    </div>
                    <div className="invoice-summary-row strong">
                      <span>Total</span>
                      <span>{money(selectedOrder.total || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment */}
                <div className="detail-section">
                  <div className="section-title">
                    <Store size={15} />
                    <h3>Fulfillment</h3>
                  </div>
                  <div className="fulfillment-grid">
                    <div className="fulfillment-cell">
                      <span>Mode</span>
                      <strong>{selectedOrder.deliveryType || 'Dine In'}</strong>
                    </div>
                    {selectedOrder.deliveryType === 'Dine In' ? (
                      <div className="fulfillment-cell">
                        <span>Table</span>
                        <strong className="table-badge-big">Table {selectedOrder.tableNumber || 'N/A'}</strong>
                      </div>
                    ) : (
                      <div className="fulfillment-cell">
                        <span>Pickup</span>
                        <strong>Front Counter</strong>
                      </div>
                    )}
                  </div>

                  <div className="instructions-box">
                    <span>Special Instructions</span>
                    <p className={selectedOrder.customer?.instructions ? '' : 'no-instructions'}>
                      {selectedOrder.customer?.instructions || 'No special requests.'}
                    </p>
                  </div>

                  <div className="metadata-collapsible">
                    <button
                      type="button"
                      className="section-title min clean-toggle-btn"
                      onClick={() => setShowMetadata(!showMetadata)}
                      style={{ background:'transparent', border:'none', cursor:'pointer', padding:0, width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'8px', outline:'none' }}
                    >
                      <Database size={13} />
                      <h4>Audit Metadata {showMetadata ? '(hide)' : '(show)'}</h4>
                      <ChevronDown size={13} className="details-arrow" style={{ marginLeft:'auto', opacity:0.5, transform: showMetadata ? 'rotate(180deg)' : 'none', transition:'transform 0.2s ease' }} />
                    </button>
                    {showMetadata && (
                      <div className="metadata-table" style={{ marginTop:'10px' }}>
                        <div className="meta-row"><span>IP</span><code>{selectedOrder.metadata?.ip || '127.0.0.1'}</code></div>
                        <div className="meta-row"><span>Machine ID</span><code>{selectedOrder.metadata?.machineId || 'N/A'}</code></div>
                        <div className="meta-row truncate-right"><span>User Agent</span><code title={selectedOrder.metadata?.userAgent}>{selectedOrder.metadata?.userAgent || 'Browser'}</code></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-empty-state">
              <ClipboardList size={52} />
              <h2>No Order Selected</h2>
              <p>Tap any order from the list to manage it here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Hidden audio */}
      <audio id="admin-notification-sound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav" preload="auto" />

      {/* New Order Modal */}
      {newOrderPopup && (
        <div className="new-order-modal-overlay">
          <div className="new-order-modal-card">
            <div className="modal-icon-wrap">
              <BellRing size={32} className="ring-pulse" />
            </div>
            <span className="modal-kicker">🔔 New Order!</span>
            <h2 className="modal-order-id">{newOrderPopup.id}</h2>
            <div className="modal-detail-row">
              <span className="label">Customer</span>
              <strong className="value">{newOrderPopup.customerName}</strong>
            </div>
            <div className="modal-detail-row">
              <span className="label">Amount</span>
              <strong className="value gold">{money(newOrderPopup.total)}</strong>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-modal-dismiss" onClick={() => setNewOrderPopup(null)}>Dismiss</button>
              <button type="button" className="btn-modal-view" onClick={() => { setSelectedOrderId(newOrderPopup.id); setNewOrderPopup(null); }}>View Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
