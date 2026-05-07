/**
 * Mock nearby users for proximity matching demo
 */

export interface NearbyUser {
  id: string;
  displayName: string;
  avatar: string;
  program: string;
  year: number;
  interests: string[];
  languages: string[];
  nationality: string;
  bio: string;
  matchScore: number;       // 0-100
  distanceMeters: number;
  lastSeen: string;         // ISO timestamp
  zonesExplored: number;
}

export const MOCK_NEARBY_USERS: NearbyUser[] = [
  {
    id: 'user-1',
    displayName: 'Aisha K.',
    avatar: '👩🏽‍💻',
    program: 'Computer Science',
    year: 2,
    interests: ['Coding', 'Hiking', 'Photography'],
    languages: ['English', 'Arabic'],
    nationality: 'Jordan',
    bio: 'CS major who loves building apps and exploring trails. Looking for study buddies and hiking partners!',
    matchScore: 92,
    distanceMeters: 45,
    lastSeen: new Date(Date.now() - 120000).toISOString(),
    zonesExplored: 7,
  },
  {
    id: 'user-2',
    displayName: 'Marcus L.',
    avatar: '👨🏻‍🎨',
    program: 'Fine Arts',
    year: 3,
    interests: ['Art', 'Music', 'Coffee'],
    languages: ['English', 'French'],
    nationality: 'Canada',
    bio: 'Visual artist and coffee enthusiast. Always down to visit galleries or find new cafés.',
    matchScore: 78,
    distanceMeters: 120,
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    zonesExplored: 5,
  },
  {
    id: 'user-3',
    displayName: 'Yuki T.',
    avatar: '👩🏻‍🔬',
    program: 'Biochemistry',
    year: 1,
    interests: ['Science', 'Anime', 'Cooking'],
    languages: ['English', 'Japanese'],
    nationality: 'Japan',
    bio: 'Just arrived at UBC! Looking to make friends and explore the campus together.',
    matchScore: 85,
    distanceMeters: 200,
    lastSeen: new Date(Date.now() - 60000).toISOString(),
    zonesExplored: 3,
  },
  {
    id: 'user-4',
    displayName: 'Priya S.',
    avatar: '👩🏽‍💼',
    program: 'Commerce',
    year: 2,
    interests: ['Business', 'Yoga', 'Travel'],
    languages: ['English', 'Hindi', 'Punjabi'],
    nationality: 'India',
    bio: 'Sauder student interested in startups. Love meeting new people from different backgrounds.',
    matchScore: 88,
    distanceMeters: 80,
    lastSeen: new Date(Date.now() - 180000).toISOString(),
    zonesExplored: 9,
  },
  {
    id: 'user-5',
    displayName: 'Chen W.',
    avatar: '👨🏻‍💻',
    program: 'Electrical Engineering',
    year: 4,
    interests: ['Robotics', 'Gaming', 'Basketball'],
    languages: ['English', 'Mandarin'],
    nationality: 'China',
    bio: 'Building robots by day, gaming by night. Looking for pickup basketball games.',
    matchScore: 72,
    distanceMeters: 300,
    lastSeen: new Date(Date.now() - 600000).toISOString(),
    zonesExplored: 6,
  },
];

// AI-generated intro message examples
export const AI_INTRO_TEMPLATES = [
  "Hey {name}! I noticed we both love {shared_interest}. I'm also new to UBC and trying to explore the campus. Would love to grab a coffee at the Nest sometime! ☕",
  "Hi {name}! Fellow {program} student here 👋 I see you've already explored {zones} zones — impressive! Want to team up and discover more of campus together?",
  "Hey there, {name}! We have {match_score}% compatibility — that's pretty cool! I'd love to chat about {shared_interest} sometime. What do you think?",
];
