export interface RssSource {
  id: string;
  name: string;
  url: string;
  lang: string;
}

export const RSS_SOURCES: RssSource[] = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    lang: "en",
  },
  {
    id: "google-ai",
    name: "Google AI",
    url: "https://blog.google/technology/ai/rss/",
    lang: "en",
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    lang: "en",
  },
  {
    id: "venturebeat-ai",
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    lang: "en",
  },
  {
    id: "arxiv-cs-ai",
    name: "arXiv CS.AI",
    url: "http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=20",
    lang: "en",
  },
];
