export const formatPrice = (price, currency = 'KES') => {
  if (!price && price !== 0) return 'Negotiable';
  return `${currency} ${Number(price).toLocaleString()}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getWhatsAppLink = (phone, message = '') => {
  const clean = phone?.replace(/\D/g, '');
  const intl = clean?.startsWith('0') ? '254' + clean.slice(1) : clean;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${intl}${message ? `?text=${encoded}` : ''}`;
};

export const getCallLink = (phone) => `tel:${phone}`;

export const CATEGORIES = {
  produce: {
    label: 'Farm Produce',
    icon: '🌽',
    color: '#2d7a47',
    subcategories: ['Maize', 'Beans', 'Irish Potato (Waru)', 'Peas (Minji)', 'Vegetables', 'Eggs', 'Milk', 'Meat', 'Poultry (Live)', 'Other Produce'],
  },
  agrovet: {
    label: 'Agrovet Supplies',
    icon: '🌿',
    color: '#4caf72',
    subcategories: ['Fertilizers', 'Pesticides', 'Herbicides', 'Animal Feeds', 'Veterinary Medicine', 'Seeds', 'Farm Tools', 'Other Supplies'],
  },
  services: {
    label: 'Services',
    icon: '🔧',
    color: '#1a7ab5',
    subcategories: ['Veterinary', 'Agrovet', 'Tractor Hire', 'Transport', 'Labour', 'Other Services'],
  },
  housing: {
    label: 'Housing',
    icon: '🏠',
    color: '#d4a017',
    subcategories: ['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Shop/Commercial'],
  },
};

export const SUBCATEGORY_ICONS = {
  // Farm Produce
  'Maize': '🌽',
  'Beans': '🫘',
  'Irish Potato (Waru)': '🥔',
  'Peas (Minji)': '🟢',
  'Vegetables': '🥬',
  'Eggs': '🥚',
  'Milk': '🥛',
  'Meat': '🥩',
  'Poultry (Live)': '🐔',
  'Other Produce': '🌾',
  // Agrovet
  'Fertilizers': '🧪',
  'Pesticides': '💊',
  'Herbicides': '🧴',
  'Animal Feeds': '🌾',
  'Veterinary Medicine': '💉',
  'Seeds': '🌱',
  'Farm Tools': '🛠️',
  'Other Supplies': '🌿',
  // Services
  'Veterinary': '🐄',
  'Agrovet': '🌿',
  'Tractor Hire': '🚜',
  'Transport': '🚛',
  'Labour': '👷',
  'Other Services': '🔧',
  // Housing
  'Single Room': '🏠',
  'Bedsitter': '🛏️',
  '1 Bedroom': '🏡',
  '2 Bedrooms': '🏘️',
  '3+ Bedrooms': '🏗️',
  'Shop/Commercial': '🏪',
};

export const UNIT_OPTIONS = ['Trays', 'Litres', 'Kgs', 'Bags (90kg)', 'Bags (50kg)', 'Bundles', 'Pieces', 'Crates', 'Tonnes', 'Per Month (Rent)', 'Per Service'];

export const MAWINGU_CENTER = { lat: -0.5, lng: 36.5 }; // Nyandarua County approximate

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '…' : str;

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
