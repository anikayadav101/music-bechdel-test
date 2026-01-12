// Music Bechdel Test Analysis Logic

export interface BechdelResult {
  pass: boolean;
  status: 'pass' | 'fail' | 'partial';
  confidence: number;
  analysis: {
    femaleCount: number;
    femaleNames: string[];
    malePronouns: number;
    femalePronouns: number;
    topics: TopicAnalysis;
    hasFemaleDialogue: boolean;
    nonRomanticContext: boolean;
  };
  reasoning: string[];
}

export interface TopicAnalysis {
  romantic: number;
  self: number;
  ambition: number;
  friendship: number;
  other: number;
  dominantTopic: string;
}

export interface SongData {
  title: string;
  artist: string;
  lyrics: string;
  year?: number;
  collaborators?: string[];
}

// Common female names for detection
const FEMALE_NAMES = [
  'sarah', 'emily', 'jessica', 'jennifer', 'amanda', 'lisa', 'michelle',
  'nicole', 'katherine', 'stephanie', 'rachel', 'elizabeth', 'lauren',
  'megan', 'samantha', 'ashley', 'christina', 'kimberly', 'amy', 'angela',
  'charli', 'cupcakke', 'dorian', 'adele', 'taylor', 'ariana', 'billie',
  'dua', 'lizzo', 'miley', 'selena', 'rihanna', 'beyonce', 'lady', 'gaga',
  'katy', 'perry', 'olivia', 'sza', 'doja', 'card', 'megan', 'thee', 'stallion'
];

// Romantic keywords
const ROMANTIC_KEYWORDS = [
  'love', 'lover', 'heart', 'romance', 'kiss', 'hug', 'boyfriend', 'girlfriend',
  'husband', 'wife', 'marry', 'wedding', 'together', 'forever', 'soulmate',
  'crush', 'dating', 'relationship', 'broken heart', 'heartbreak', 'miss you',
  'need you', 'want you', 'desire', 'passion', 'intimate', 'darling', 'baby',
  'honey', 'sweetheart', 'dear', 'beloved'
];

// Ambition/self keywords
const AMBITION_KEYWORDS = [
  'dream', 'goal', 'success', 'achieve', 'win', 'power', 'strong', 'independent',
  'freedom', 'free', 'own', 'myself', 'self', 'confidence', 'believe', 'hope',
  'future', 'career', 'work', 'job', 'business', 'money', 'wealth', 'fame',
  'famous', 'star', 'celebrity', 'talent', 'skill', 'ability'
];

// Friendship keywords
const FRIENDSHIP_KEYWORDS = [
  'friend', 'friends', 'sister', 'sisters', 'girl', 'girls', 'together',
  'party', 'fun', 'dance', 'hang', 'support', 'help', 'trust', 'loyal',
  'bond', 'friendship', 'squad', 'crew', 'team', 'group'
];

export function analyzeBechdelTest(song: SongData): BechdelResult {
  const lyrics = song.lyrics.toLowerCase();
  const words = lyrics.split(/\s+/);
  
  // Count female pronouns
  const femalePronouns = (lyrics.match(/\b(she|her|hers|herself)\b/g) || []).length;
  const malePronouns = (lyrics.match(/\b(he|him|his|himself)\b/g) || []).length;
  
  // Find female names
  const femaleNames: string[] = [];
  FEMALE_NAMES.forEach(name => {
    if (lyrics.includes(name)) {
      femaleNames.push(name);
    }
  });
  
  // Count topics
  const romanticCount = countKeywords(lyrics, ROMANTIC_KEYWORDS);
  const ambitionCount = countKeywords(lyrics, AMBITION_KEYWORDS);
  const friendshipCount = countKeywords(lyrics, FRIENDSHIP_KEYWORDS);
  const otherCount = words.length - romanticCount - ambitionCount - friendshipCount;
  
  // Determine dominant topic
  const topicCounts = {
    romantic: romanticCount,
    self: ambitionCount,
    friendship: friendshipCount,
    other: otherCount
  };
  const dominantTopic = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  // Count total female references (pronouns, names, and explicit references)
  const femaleReferences = femalePronouns + femaleNames.length;
  const explicitWomenRefs = (lyrics.match(/\b(girls?|women|ladies?|females?)\b/g) || []).length;
  const totalFemaleCount = femaleReferences + explicitWomenRefs;
  
  // Check for female dialogue (multiple female pronouns or names suggesting conversation)
  // This is inferred from multiple female references in the lyrics
  const hasFemaleDialogue = totalFemaleCount >= 2;
  
  // Check for non-male context - topic is about something other than a man
  const maleFocus = (lyrics.match(/\b(he|him|his|boy|boys?|man|men|guy|guys?|dude|dudes?)\b/g) || []).length;
  
  // Determine if this is a romantic song (likely about a man unless proven otherwise)
  const isRomanticSong = romanticCount > 3 && (romanticCount >= ambitionCount + friendshipCount || romanticCount > 5);
  
  // Check for clear female-to-female dialogue (multiple female pronouns suggesting conversation)
  const clearFemaleToFemaleDialogue = totalFemaleCount >= 2 && femalePronouns >= 2;
  
  // Determine if topic is about something other than a man
  // Rules:
  // 1. If explicit male references exist and dominate, it's about a man
  // 2. If it's a romantic song without clear female-to-female dialogue, assume it's about a man
  // 3. Otherwise, check if non-male topics (ambition, friendship) outweigh romantic/male topics
  const clearlyAboutMen = maleFocus > 0 && maleFocus >= (ambitionCount + friendshipCount);
  const romanticAboutMan = isRomanticSong && !clearFemaleToFemaleDialogue;
  const nonRomanticTopics = ambitionCount + friendshipCount + otherCount;
  
  // Pass criterion 3 if: NOT clearly about men AND (NOT romantic about man OR has strong non-romantic content)
  const nonMaleTopic = !clearlyAboutMen && (!romanticAboutMan || (nonRomanticTopics > romanticCount * 1.5));
  
  // Original Bechdel test criteria
  const criteria1 = totalFemaleCount >= 2; // At least two women
  const criteria2 = hasFemaleDialogue; // They talk to each other
  const criteria3 = nonMaleTopic; // They talk about something other than a man
  
  const passedCriteria = [criteria1, criteria2, criteria3].filter(Boolean).length;
  
  let status: 'pass' | 'fail' | 'partial';
  let pass: boolean;
  let confidence: number;
  const reasoning: string[] = [];
  
  if (passedCriteria === 3) {
    status = 'pass';
    pass = true;
    confidence = 85 + Math.min(15, totalFemaleCount * 2);
  } else if (passedCriteria === 2) {
    status = 'partial';
    pass = false;
    confidence = 60 + Math.min(20, totalFemaleCount * 3);
  } else {
    status = 'fail';
    pass = false;
    confidence = 30 + Math.min(30, totalFemaleCount * 5);
  }
  
  // Build reasoning based on original Bechdel test criteria
  if (!criteria1) {
    reasoning.push(`Only found ${totalFemaleCount} female reference(s) (need at least 2)`);
  } else {
    reasoning.push(`✓ Found at least 2 women (${totalFemaleCount} female references)`);
  }
  
  if (!criteria2) {
    reasoning.push('No clear evidence of women talking to each other');
  } else {
    reasoning.push('✓ Evidence of women talking to each other');
  }
  
  if (!criteria3) {
    if (isRomanticSong && !clearFemaleToFemaleDialogue) {
      reasoning.push(`Romantic song without clear female-to-female dialogue (${romanticCount} romantic mentions) - likely about a man`);
    } else if (clearlyAboutMen) {
      reasoning.push(`They talk about men (${maleFocus} male references vs ${ambitionCount + friendshipCount} other topics)`);
    } else {
      reasoning.push(`Topic appears to focus on relationships/men rather than other subjects`);
    }
  } else {
    reasoning.push(`✓ They talk about something other than a man`);
    if (ambitionCount > 0) {
      reasoning.push(`  - Self/ambition themes: ${ambitionCount} mentions`);
    }
    if (friendshipCount > 0) {
      reasoning.push(`  - Friendship/social themes: ${friendshipCount} mentions`);
    }
    if (isRomanticSong && clearFemaleToFemaleDialogue) {
      reasoning.push(`  - Romantic themes but with clear female-to-female dialogue`);
    }
  }
  
  if (maleFocus > 0 && maleFocus > femalePronouns * 2) {
    reasoning.push(`Heavy focus on male pronouns/topics (${maleFocus} mentions)`);
  }
  
  if (isRomanticSong) {
    reasoning.push(`Romantic song detected (${romanticCount} romantic keywords)`);
  }
  
  return {
    pass,
    status,
    confidence: Math.min(100, confidence),
    analysis: {
      femaleCount: totalFemaleCount,
      femaleNames: [...new Set(femaleNames)],
      malePronouns,
      femalePronouns,
      topics: {
        romantic: romanticCount,
        self: ambitionCount,
        ambition: ambitionCount,
        friendship: friendshipCount,
        other: otherCount,
        dominantTopic
      },
      hasFemaleDialogue,
      nonRomanticContext: nonMaleTopic
    },
    reasoning
  };
}

function countKeywords(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

// Helper function to get decade from year
export function getDecade(year?: number): string | null {
  if (!year) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

