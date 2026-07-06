import { App } from '@prisma/client';

interface SynonymMapping {
  keywords: string[];
  weight: number;
}

// Map key terms to specific app package names for semantic boost
const AI_SYNONYMS: Record<string, SynonymMapping> = {
  'com.manavstech.mynote': {
    keywords: ['notes', 'note', 'notebook', 'write', 'diary', 'markdown', 'text', 'todo', 'encrypted', 'offline notes'],
    weight: 15,
  },
  'com.manavstech.mplayer': {
    keywords: ['music', 'song', 'mp3', 'player', 'audio', 'sound', 'flac', 'visualizer', 'playlist', 'offline music'],
    weight: 15,
  },
  'com.manavstech.cdialer': {
    keywords: ['dialer', 'call', 'phone', 'contact', 'contacts', 'phonebook', 'caller', 'offline phone'],
    weight: 15,
  },
  'com.manavstech.chatme': {
    keywords: ['chat', 'message', 'messaging', 'messenger', 'secure chat', 'p2p', 'peer', 'encrypted message'],
    weight: 15,
  },
  'com.manavstech.mgpt': {
    keywords: ['ai', 'chatgpt', 'gpt', 'llm', 'ollama', 'assistant', 'ai chatbot', 'chatbot'],
    weight: 15,
  },
  'com.manavstech.gitagent': {
    keywords: ['git', 'github', 'commit', 'repo', 'repository', 'code agent', 'ai git'],
    weight: 15,
  },
  'com.manavstech.syllabusdesigner': {
    keywords: ['syllabus', 'course', 'curriculum', 'education', 'learn', 'study', 'ai course'],
    weight: 15,
  },
  'com.manavstech.techsite': {
    keywords: ['blog', 'news', 'articles', 'devlog', 'manavstech', 'website'],
    weight: 15,
  },
  'com.manavstech.dailybasket': {
    keywords: ['grocery', 'food', 'pantry', 'basket', 'stock', 'inventory', 'kitchen'],
    weight: 15,
  }
};

export function searchAppsWithAi(apps: App[], query: string): { app: App; score: number }[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return apps.map(app => ({ app, score: 0 }));
  }

  // Tokenize query words
  const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 2);

  const scoredApps = apps.map(app => {
    let score = 0;
    const name = app.name.toLowerCase();
    const shortDesc = app.shortDescription.toLowerCase();
    const desc = app.description.toLowerCase();
    const pkg = app.packageName.toLowerCase();

    // 1. Direct Name Matches (Highest Priority)
    if (name.includes(normalizedQuery)) {
      score += 50;
    }

    // 2. Package Name boost
    if (pkg.includes(normalizedQuery)) {
      score += 30;
    }

    // 3. Keyword Token matching in descriptions
    queryTokens.forEach(token => {
      // Name matches
      if (name.includes(token)) score += 15;
      // Short description matches
      if (shortDesc.includes(token)) score += 5;
      // Detailed description matches
      if (desc.includes(token)) score += 2;
    });

    // 4. Semantic Synonyms Boost (Matching synonyms mapping)
    const mapping = AI_SYNONYMS[app.packageName];
    if (mapping) {
      mapping.keywords.forEach(keyword => {
        if (normalizedQuery.includes(keyword)) {
          score += mapping.weight;
        }
        queryTokens.forEach(token => {
          if (keyword.includes(token) || token.includes(keyword)) {
            score += Math.floor(mapping.weight / 2);
          }
        });
      });
    }

    // 5. App tag matches (AI-powered / offline flags boost)
    if (app.isAiPowered && (normalizedQuery.includes('ai') || normalizedQuery.includes('intelligence') || normalizedQuery.includes('gpt'))) {
      score += 15;
    }
    if (app.isOffline && (normalizedQuery.includes('offline') || normalizedQuery.includes('local') || normalizedQuery.includes('no internet'))) {
      score += 15;
    }

    return { app, score };
  });

  // Filter out completely unrelated apps (score == 0) and sort by score descending
  return scoredApps
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function generatePersonalizedSuggestions(apps: App[], downloadHistoryPackNames: string[]): App[] {
  // If user has no download history, recommend featured and trending apps
  if (downloadHistoryPackNames.length === 0) {
    return apps.filter(app => app.isFeatured || app.isTrending).slice(0, 4);
  }

  // Find categories downloaded by user
  const userCategories = apps
    .filter(app => downloadHistoryPackNames.includes(app.packageName))
    .map(app => app.categoryId);

  // Recommend apps in similar categories that the user hasn't downloaded yet
  const recommendations = apps.filter(app => {
    const notDownloaded = !downloadHistoryPackNames.includes(app.packageName);
    const inSameCategory = userCategories.includes(app.categoryId);
    return notDownloaded && inSameCategory;
  });

  // Fallback if no specific category matching, recommend editor's choice
  if (recommendations.length === 0) {
    return apps
      .filter(app => !downloadHistoryPackNames.includes(app.packageName))
      .sort((a, b) => (b.isEditorsChoice ? 1 : 0) - (a.isEditorsChoice ? 1 : 0))
      .slice(0, 4);
  }

  return recommendations.slice(0, 4);
}
