# Music Bechdel Test 🎵

A web application that applies the Bechdel test criteria to music. Analyze whether songs feature at least two women who talk to each other about something other than a man.

## Features

- **Song Analysis**: Analyze any song by searching and selecting from iTunes or local database
- **Bechdel Test Criteria**: Checks three criteria:
  1. It has to have at least two women in it
  2. They have to talk to each other
  3. They have to talk about something other than a man
- **Results Display**: Shows Pass/Fail/Partial status with detailed analysis
- **Searchable Database**: Build a database of analyzed songs
- **Filtering**: Filter songs by Pass/Fail/Partial status
- **Data Visualization**: View statistics and pass rates by decade

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Analyze a Song**: 
   - Enter the song title, artist name, and paste the lyrics
   - Optionally add the release year
   - Click "Analyze Song"

2. **View Results**:
   - See the Pass/Fail/Partial status
   - Review detailed analysis including:
     - Number of female references
     - Topic classification (romantic, self, ambition, friendship)
     - Confidence score
     - Reasoning for the result

3. **Browse Database**:
   - View all analyzed songs
   - Search by title or artist
   - Filter by Pass/Fail/Partial status

4. **View Statistics**:
   - See overall pass rates
   - View pass rates by decade (if songs have years)

## Example Songs

- **🟢 Pass**: "Boys" by Charli XCX ft. CupcakKe & Dorian Electra — women talking about agency/fun
- **🔴 Fail**: "Someone Like You" by Adele — only one female voice, romantic focus

## Technical Details

### Analysis Logic

The analyzer uses natural language processing to:
- Count female pronouns (she, her, hers) and names
- Identify dominant topics (romantic, self, ambition, friendship)
- Determine if women are mentioned in non-romantic contexts
- Calculate confidence scores based on evidence

### Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP requests

## Future Enhancements

- Integration with Spotify API for automatic metadata
- Integration with lyrics APIs (Genius, Musixmatch)
- Machine learning model for more accurate topic classification
- Persistent database (PostgreSQL/MongoDB)
- User accounts and saved playlists
- Collaborative filtering and tagging

## License

MIT

