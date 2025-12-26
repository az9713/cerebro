/**
 * API client for Cerebro backend.
 */

const API_BASE = '/api';

// Types
export interface Report {
  id: number;
  filename: string;
  filepath: string;
  title: string;
  source_url: string | null;
  content_type: 'youtube' | 'article' | 'paper' | 'other';
  created_at: string;
  summary: string | null;
  word_count: number | null;
  content?: string;
}

export interface ReportList {
  items: Report[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchResult {
  id: number;
  title: string;
  filename: string;
  content_type: string;
  created_at: string;
  snippet: string;
}

export interface ActivityLogEntry {
  title: string;
  report_path: string;
  time: string;
}

export interface ActivityLog {
  date: string;
  videos: ActivityLogEntry[];
  articles: ActivityLogEntry[];
  papers: ActivityLogEntry[];
  other: ActivityLogEntry[];
}

export interface AnalysisJob {
  id: string;
  job_type: string;
  input_value: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress_message: string | null;
  result_filepath: string | null;
  error_message: string | null;
}

// Tags
export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface TagList {
  items: Tag[];
  total: number;
}

// Collections
export interface Collection {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  report_count?: number;
}

export interface CollectionList {
  items: Collection[];
  total: number;
}

// Favorites response
export interface FavoriteResponse {
  report_id: number;
  is_favorite: boolean;
}

export interface ModelInfo {
  key: string;
  id: string;
  name: string;
  description: string;
  input_cost: number;
  output_cost: number;
}

export type ModelKey = 'haiku' | 'sonnet' | 'opus';

// API functions
export async function fetchReports(
  contentType?: string,
  page = 1,
  pageSize = 20
): Promise<ReportList> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (contentType) {
    params.set('content_type', contentType);
  }

  const res = await fetch(`${API_BASE}/reports?${params}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchRecentReports(limit = 10): Promise<Report[]> {
  const res = await fetch(`${API_BASE}/reports/recent?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch recent reports');
  return res.json();
}

export async function fetchReport(id: number): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function searchReports(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/reports/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchTodayLog(): Promise<ActivityLog> {
  const res = await fetch(`${API_BASE}/logs/today`);
  if (!res.ok) throw new Error('Failed to fetch today log');
  return res.json();
}

export async function fetchLogByDate(date: string): Promise<ActivityLog> {
  const res = await fetch(`${API_BASE}/logs/${date}`);
  if (!res.ok) throw new Error('Failed to fetch log');
  return res.json();
}

export async function fetchLogDates(): Promise<{ date: string; filepath: string }[]> {
  const res = await fetch(`${API_BASE}/logs`);
  if (!res.ok) throw new Error('Failed to fetch log dates');
  return res.json();
}

export async function fetchModels(): Promise<{ models: ModelInfo[]; default: string }> {
  const res = await fetch(`${API_BASE}/analysis/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function submitAnalysis(
  type: 'youtube' | 'article' | 'arxiv',
  url: string,
  model: ModelKey = 'sonnet'
): Promise<{ job_id: string; status: string; model: string }> {
  const res = await fetch(`${API_BASE}/analysis/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, model }),
  });
  if (!res.ok) throw new Error('Failed to submit analysis');
  return res.json();
}

export async function fetchJobStatus(jobId: string): Promise<AnalysisJob> {
  const res = await fetch(`${API_BASE}/analysis/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return res.json();
}

export async function triggerSync(): Promise<void> {
  const res = await fetch(`${API_BASE}/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Sync failed');
}

// Utility to detect URL type
export function detectUrlType(url: string): 'youtube' | 'article' | 'arxiv' | 'unknown' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('arxiv.org')) {
    return 'arxiv';
  }
  if (url.startsWith('http')) {
    return 'article';
  }
  return 'unknown';
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Content type badge colors
export function getTypeColor(type: string): string {
  switch (type) {
    case 'youtube':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'article':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'paper':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

// ============ TAGS API ============

export async function fetchTags(): Promise<TagList> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

export async function createTag(name: string, color: string = '#6366f1'): Promise<Tag> {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
}

export async function updateTag(id: number, name?: string, color?: string): Promise<Tag> {
  const res = await fetch(`${API_BASE}/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error('Failed to update tag');
  return res.json();
}

export async function deleteTag(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete tag');
}

export async function fetchReportTags(reportId: number): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/tags/report/${reportId}`);
  if (!res.ok) throw new Error('Failed to fetch report tags');
  return res.json();
}

export async function addTagToReport(reportId: number, tagId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/report/${reportId}/tag/${tagId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to add tag to report');
}

export async function removeTagFromReport(reportId: number, tagId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/report/${reportId}/tag/${tagId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove tag from report');
}

// ============ COLLECTIONS API ============

export async function fetchCollections(): Promise<CollectionList> {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function fetchCollection(id: number): Promise<Collection & { reports: Report[] }> {
  const res = await fetch(`${API_BASE}/collections/${id}`);
  if (!res.ok) throw new Error('Failed to fetch collection');
  return res.json();
}

export async function createCollection(name: string, description?: string): Promise<Collection> {
  const res = await fetch(`${API_BASE}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
}

export async function updateCollection(id: number, name?: string, description?: string): Promise<Collection> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to update collection');
  return res.json();
}

export async function deleteCollection(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/collections/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete collection');
}

export async function addReportToCollection(collectionId: number, reportId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/collections/${collectionId}/reports/${reportId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to add report to collection');
}

export async function removeReportFromCollection(collectionId: number, reportId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/collections/${collectionId}/reports/${reportId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove report from collection');
}

export async function fetchReportCollections(reportId: number): Promise<Collection[]> {
  const res = await fetch(`${API_BASE}/collections/report/${reportId}`);
  if (!res.ok) throw new Error('Failed to fetch report collections');
  return res.json();
}

// ============ FAVORITES API ============

export async function fetchFavorites(): Promise<Report[]> {
  const res = await fetch(`${API_BASE}/reports/favorites`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function toggleFavorite(reportId: number): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/favorite`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle favorite');
  return res.json();
}
