import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

type AiResponse = {
  tags: string[];
  seoTitle: string;
  metaDescription: string;
};

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'now', 'then', 'here', 'there', 'about', 'above', 'below', 'up', 'down',
  'out', 'off', 'over', 'under', 'again', 'further', 'once', 'also', 'back', 'well', 'even',
]);

// Common educational/technical terms that should be prioritized
const EDUCATIONAL_TERMS = new Set([
  'introduction', 'tutorial', 'guide', 'lesson', 'course', 'example', 'practice', 'exercise',
  'concept', 'theory', 'principle', 'method', 'technique', 'algorithm', 'function', 'variable',
  'class', 'object', 'array', 'string', 'number', 'boolean', 'loop', 'condition', 'statement',
  'programming', 'development', 'coding', 'software', 'application', 'framework', 'library',
  'database', 'server', 'client', 'api', 'http', 'html', 'css', 'javascript', 'python', 'java',
  'react', 'node', 'express', 'sql', 'mongodb', 'git', 'github', 'deployment', 'testing',
]);

function extractSmartTags(text: string): string[] {
  // Normalize text: lowercase, remove special chars, split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Count word frequencies, prioritizing longer and educational terms
  const freq: Record<string, number> = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Skip stop words and very short words
    if (STOP_WORDS.has(word) || word.length < 3) continue;
    
    // Boost score for educational terms
    let score = 1;
    if (EDUCATIONAL_TERMS.has(word)) score += 2;
    if (word.length >= 6) score += 1; // Prefer longer, more specific words
    
    freq[word] = (freq[word] || 0) + score;
    
    // Also consider bigrams (two-word phrases)
    if (i < words.length - 1) {
      const nextWord = words[i + 1];
      if (!STOP_WORDS.has(nextWord) && nextWord.length >= 3) {
        const bigram = `${word} ${nextWord}`;
        freq[bigram] = (freq[bigram] || 0) + 1.5;
      }
    }
  }

  // Get top tags, preferring educational terms
  const tags = Object.entries(freq)
    .sort((a, b) => {
      // Sort by frequency first
      if (b[1] !== a[1]) return b[1] - a[1];
      // Then by length (prefer longer, more specific terms)
      return b[0].length - a[0].length;
    })
    .slice(0, 10)
    .map(([word]) => word);

  return tags;
}

function extractSeoTitle(text: string): string {
  // Try to find the first sentence or first line
  const firstLine = text.split('\n')[0].trim();
  const firstSentence = firstLine.split(/[.!?]/)[0].trim();
  
  // Use first sentence if it's reasonable length, otherwise first line
  let title = firstSentence.length > 10 && firstSentence.length <= 60 
    ? firstSentence 
    : firstLine;
  
  // Clean up and truncate
  title = title.replace(/\s+/g, ' ').slice(0, 60);
  
  // If title is too short, try to create one from first few words
  if (title.length < 10) {
    const words = text.split(/\s+/).slice(0, 8).join(' ');
    title = words.slice(0, 60);
  }
  
  return title || 'Educational Lesson';
}

function extractMetaDescription(text: string): string {
  // Try to find a good description: first paragraph or first few sentences
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
  
  let description = '';
  if (paragraphs.length > 0) {
    description = paragraphs[0].trim();
  } else {
    // Fallback: first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    description = sentences.slice(0, 2).join('. ').trim();
  }
  
  // Clean up and truncate to 155 characters
  description = description
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .slice(0, 155)
    .trim();
  
  // Ensure it ends properly
  if (description.length > 150 && !description.match(/[.!?]$/)) {
    description = description.slice(0, 152) + '...';
  }
  
  return description || 'Educational content and learning resource.';
}

async function analyzeTextForSeo(text: string): Promise<AiResponse> {
  // Simple, free text analysis - no API keys needed!
  const tags = extractSmartTags(text);
  const seoTitle = extractSeoTitle(text);
  const metaDescription = extractMetaDescription(text);

  return {
    tags,
    seoTitle,
    metaDescription,
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return await file.text();
  }

  if (name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  throw new Error('Unsupported file type. Please upload a .txt, .md, or .docx file.');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = (await extractTextFromFile(file)).trim();
    if (!text) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    const ai = await analyzeTextForSeo(text);

    return NextResponse.json(
      {
        tags: ai.tags,
        seoTitle: ai.seoTitle,
        metaDescription: ai.metaDescription,
        // Also send back a snippet of the text for convenience if needed client-side
        snippet: text.slice(0, 2000),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('AI analyze-upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze file with AI' },
      { status: 500 }
    );
  }
}


