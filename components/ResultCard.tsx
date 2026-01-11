'use client';

interface BechdelResult {
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
}

interface ResultCardProps {
  title: string;
  artist: string;
  year?: number;
  result: BechdelResult;
}

export default function ResultCard({ title, artist, year, result }: ResultCardProps) {
  const statusColors = {
    pass: 'bg-green-600 text-white',
    fail: 'bg-red-600 text-white',
    partial: 'bg-yellow-600 text-white'
  };

  const statusEmojis = {
    pass: '🟢',
    fail: '🔴',
    partial: '🟡'
  };

  return (
    <div className="metal-card p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600">{artist} {year && `(${year})`}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${statusColors[result.status]}`}>
          {statusEmojis[result.status]} {result.status.toUpperCase()}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Confidence</span>
          <span className="text-sm font-bold text-gray-800">{result.confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              result.status === 'pass' ? 'bg-pass' :
              result.status === 'fail' ? 'bg-fail' : 'bg-partial'
            }`}
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold text-gray-800 mb-2">Analysis Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Female References:</span>
            <span className="font-semibold ml-2 text-gray-800">{result.analysis.femaleCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Female Pronouns:</span>
            <span className="font-semibold ml-2 text-gray-800">{result.analysis.femalePronouns}</span>
          </div>
          <div>
            <span className="text-gray-600">Male Pronouns:</span>
            <span className="font-semibold ml-2 text-gray-800">{result.analysis.malePronouns}</span>
          </div>
          <div>
            <span className="text-gray-600">Dominant Topic:</span>
            <span className="font-semibold ml-2 text-gray-800 capitalize">{result.analysis.topics.dominantTopic}</span>
          </div>
        </div>
        {result.analysis.femaleNames.length > 0 && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Female Names Found:</span>
            <span className="font-semibold ml-2 text-gray-800">
              {result.analysis.femaleNames.join(', ')}
            </span>
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Reasoning</h4>
        <ul className="space-y-1">
          {result.reasoning.map((reason, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="mr-2">{reason.startsWith('✓') ? '✓' : '•'}</span>
              <span className={reason.startsWith('✓') ? 'text-green-700' : ''}>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

