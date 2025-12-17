import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

type AiResponse = {
  tags: string[];
  seoTitle: string;
  metaDescription: string;
};

async function callAiForSeo(text: string): Promise<AiResponse> {
  const apiKey = process.env.HF_API_KEY;
  const model = process.env.HF_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

  // Simple non-AI fallback if no key is configured
  if (!apiKey) {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const freq: Record<string, number> = {};
    for (const w of words) {
      if (w.length < 4) continue;
      freq[w] = (freq[w] || 0) + 1;
    }

    const tags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w);

    const trimmed = text.trim().slice(0, 160).replace(/\s+/g, ' ');

    return {
      tags,
      seoTitle: trimmed.slice(0, 60) || 'Lesson',
      metaDescription: trimmed || 'Educational resource.',
    };
  }

  const prompt = `
You are an SEO assistant. Given the following educational content, extract:
- 5 to 10 short, lowercase SEO tags (single or double-word phrases)
- One concise SEO title (max 60 characters)
- One meta description (max 155 characters)

Return ONLY valid JSON in this exact shape:
{
  "tags": ["tag1", "tag2"],
  "seoTitle": "Title here",
  "metaDescription": "Description here"
}

Content:
---
${text.slice(0, 8000)}
---
`;

  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed with status ${res.status}`);
  }

  const data = await res.json();

  const rawText: string =
    typeof data === 'string'
      ? data
      : Array.isArray(data) && data.length > 0 && typeof data[0].generated_text === 'string'
      ? data[0].generated_text
      : JSON.stringify(data);

  // Try to extract JSON from the model output
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response did not contain JSON');
  }

  let parsed: AiResponse;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse AI JSON');
  }

  return {
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    seoTitle: String(parsed.seoTitle || '').slice(0, 60),
    metaDescription: String(parsed.metaDescription || '').slice(0, 155),
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

    const ai = await callAiForSeo(text);

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


