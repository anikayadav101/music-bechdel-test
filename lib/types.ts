export interface Song {
  id: string;
  title: string;
  artist: string;
  year?: number;
  lyrics: string;
  collaborators?: string[];
  bechdelResult?: {
    pass: boolean;
    status: 'pass' | 'fail' | 'partial';
    confidence: number;
    analysis: {
      femaleCount: number;
      femaleNames: string[];
      malePronouns: number;
      femalePronouns: number;
      topics: {
        romantic: number;
        self: number;
        ambition: number;
        friendship: number;
        other: number;
        dominantTopic: string;
      };
      hasFemaleDialogue: boolean;
      nonRomanticContext: boolean;
    };
    reasoning: string[];
  };
}


