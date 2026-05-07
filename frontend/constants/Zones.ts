/**
 * UBC Explore Zones — Predefined campus areas to discover
 */

export interface ExploreZone {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  points: number;
  category: 'nature' | 'academic' | 'social' | 'culture' | 'athletics';
  icon: string; // Changed from emoji to Feather icon string
  funFact: string;
}

export const EXPLORE_ZONES: ExploreZone[] = [
  {
    id: 'nitobe-garden',
    name: 'Nitobe Memorial Garden',
    description: 'A serene Japanese garden ranked among the top 5 Japanese gardens outside of Japan.',
    latitude: 49.2668,
    longitude: -123.2594,
    radiusMeters: 80,
    points: 50,
    category: 'nature',
    icon: 'feather',
    funFact: 'Named after Dr. Inazo Nitobe, a Japanese educator who promoted cross-cultural understanding.',
  },
  {
    id: 'rose-garden',
    name: 'UBC Rose Garden',
    description: 'A stunning terraced garden overlooking the mountains and ocean. Perfect for sunset views.',
    latitude: 49.2695,
    longitude: -123.2568,
    radiusMeters: 60,
    points: 40,
    category: 'nature',
    icon: 'sun',
    funFact: 'The garden has over 250 varieties of roses and was established in 1969.',
  },
  {
    id: 'wreck-beach',
    name: 'Wreck Beach',
    description: 'Vancouver\'s famous clothing-optional beach, accessed by ~500 stairs through the forest.',
    latitude: 49.2622,
    longitude: -123.2618,
    radiusMeters: 120,
    points: 60,
    category: 'nature',
    icon: 'sunset',
    funFact: 'Wreck Beach is one of the longest clothing-optional beaches in North America.',
  },
  {
    id: 'bookstore',
    name: 'UBC Bookstore',
    description: 'The main campus bookstore, home to textbooks, UBC merch, and a great café.',
    latitude: 49.2648,
    longitude: -123.2497,
    radiusMeters: 50,
    points: 30,
    category: 'social',
    icon: 'shopping-bag',
    funFact: 'The UBC Bookstore was established in 1926 and is one of the largest in Canada.',
  },
  {
    id: 'koerner-library',
    name: 'Koerner Library',
    description: 'A beautiful modernist library with stunning reading rooms and academic resources.',
    latitude: 49.2662,
    longitude: -123.2543,
    radiusMeters: 60,
    points: 35,
    category: 'academic',
    icon: 'book',
    funFact: 'Designed by Arthur Erickson, one of Canada\'s most celebrated architects.',
  },
  {
    id: 'ikb-library',
    name: 'Irving K. Barber Learning Centre',
    description: 'A hub for collaborative learning with stunning architecture blending old and new.',
    latitude: 49.2677,
    longitude: -123.2527,
    radiusMeters: 60,
    points: 35,
    category: 'academic',
    icon: 'book-open',
    funFact: 'IKB incorporates the 1925 Main Library facade into its modern design.',
  },
  {
    id: 'museum-of-anthropology',
    name: 'Museum of Anthropology',
    description: 'A world-renowned museum showcasing First Nations art and global cultural treasures.',
    latitude: 49.2693,
    longitude: -123.2617,
    radiusMeters: 100,
    points: 60,
    category: 'culture',
    icon: 'globe',
    funFact: 'Houses over 50,000 ethnographic objects from cultures around the world.',
  },
  {
    id: 'ams-nest',
    name: 'AMS Nest',
    description: 'The student union building — food courts, club spaces, study areas, and campus events.',
    latitude: 49.2669,
    longitude: -123.2499,
    radiusMeters: 70,
    points: 40,
    category: 'social',
    icon: 'coffee',
    funFact: 'The Nest cost $112 million and opened in 2015 with a 6-story timber structure.',
  },
  {
    id: 'aquatic-centre',
    name: 'UBC Aquatic Centre',
    description: 'Olympic-sized pool and diving facilities open to students and the community.',
    latitude: 49.2633,
    longitude: -123.2458,
    radiusMeters: 80,
    points: 45,
    category: 'athletics',
    icon: 'activity',
    funFact: 'The pool was used as a training venue for the 2010 Winter Olympics.',
  },
  {
    id: 'pacific-spirit-park',
    name: 'Pacific Spirit Park',
    description: 'A 763-hectare regional park with 73 km of trails through old-growth forest.',
    latitude: 49.2571,
    longitude: -123.2365,
    radiusMeters: 150,
    points: 70,
    category: 'nature',
    icon: 'map',
    funFact: 'Home to over 150 bird species and some trees over 500 years old.',
  },
  {
    id: 'beaty-museum',
    name: 'Beaty Biodiversity Museum',
    description: 'Features a 25-metre blue whale skeleton — the largest in Canada.',
    latitude: 49.2635,
    longitude: -123.2511,
    radiusMeters: 60,
    points: 45,
    category: 'culture',
    icon: 'eye',
    funFact: 'The blue whale skeleton was found on a beach in PEI in 1987.',
  },
  {
    id: 'chan-centre',
    name: 'Chan Centre for Performing Arts',
    description: 'A stunning concert hall known for its exceptional acoustics and architecture.',
    latitude: 49.2677,
    longitude: -123.2600,
    radiusMeters: 70,
    points: 45,
    category: 'culture',
    icon: 'music',
    funFact: 'The cylindrical concert hall was designed to mimic the inside of a cello.',
  },
];

// Flat minimalist category colors (replacing the AI/pastel variants)
export const CATEGORY_COLORS: Record<ExploreZone['category'], string> = {
  nature: '#10B981',     // Emerald 500
  academic: '#3B82F6',   // Blue 500
  social: '#F59E0B',     // Amber 500
  culture: '#8B5CF6',    // Violet 500
  athletics: '#EF4444',  // Red 500
};

// UBC campus center for initial map position
export const UBC_CENTER = {
  latitude: 49.2606,
  longitude: -123.2460,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};
