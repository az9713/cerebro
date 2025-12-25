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
      return 'bg-red-100 text-red-800';
    case 'article':
      return 'bg-blue-100 text-blue-800';
    case 'paper':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
