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

// Content type badge colors - Editorial warm palette
export function getTypeColor(type: string): string {
  switch (type) {
    case 'youtube':
      return 'bg-type-youtube text-white';
    case 'article':
      return 'bg-type-article text-white';
    case 'paper':
      return 'bg-type-paper text-white';
    default:
      return 'bg-type-other text-white';
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

// ============ KNOWLEDGE GRAPH API ============

export interface GraphNode {
  id: number;
  name: string;
  type: string;
  description: string | null;
  mention_count: number;
}

export interface GraphLink {
  source: number;
  target: number;
  type: string;
  strength: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ConceptDetails {
  id: number;
  name: string;
  concept_type: string;
  description: string | null;
  mention_count: number;
  reports: Array<{
    id: number;
    title: string;
    content_type: string;
  }>;
}

export interface ExtractionResult {
  concepts_extracted: number;
  concepts_stored: number;
  relationships_stored: number;
}

export async function fetchKnowledgeGraph(limit = 100): Promise<KnowledgeGraph> {
  const res = await fetch(`${API_BASE}/knowledge-graph?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch knowledge graph');
  return res.json();
}

export async function fetchConceptDetails(conceptId: number): Promise<ConceptDetails> {
  const res = await fetch(`${API_BASE}/knowledge-graph/concept/${conceptId}`);
  if (!res.ok) throw new Error('Failed to fetch concept details');
  return res.json();
}

export async function extractConceptsFromReport(reportId: number): Promise<ExtractionResult> {
  const res = await fetch(`${API_BASE}/knowledge-graph/extract/${reportId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to extract concepts');
  return res.json();
}

export async function extractConceptsFromAllReports(limit = 50): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/knowledge-graph/extract-all?limit=${limit}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to start concept extraction');
  return res.json();
}

// ============ Q&A API ============

export interface QASource {
  id: number;
  title: string;
  content_type: string;
  source_url: string | null;
}

export interface QAAnswer {
  answer: string;
  sources: QASource[];
  tokens_used: number;
  cost: number | null;
  model: string | null;
  followup_suggestions: string[];
}

export async function askQuestion(
  question: string,
  model: ModelKey = 'sonnet',
  maxReports = 5
): Promise<QAAnswer> {
  const res = await fetch(`${API_BASE}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      model,
      max_reports: maxReports,
    }),
  });
  if (!res.ok) throw new Error('Failed to get answer');
  return res.json();
}

export async function getQuestionSuggestions(): Promise<{ suggestions: string[] }> {
  const res = await fetch(`${API_BASE}/qa/suggestions`);
  if (!res.ok) throw new Error('Failed to get suggestions');
  return res.json();
}

// ============ COMPARISON API ============

export interface ComparisonReport {
  id: number;
  title: string;
  content_type: string;
  source_url: string | null;
}

export interface ComparisonResult {
  comparison: string;
  report_a: ComparisonReport;
  report_b: ComparisonReport;
  tokens_used: number;
  cost: number | null;
  model: string | null;
}

export interface ComparisonSuggestion {
  id: number;
  title: string;
  content_type: string;
}

export async function compareReports(
  reportIdA: number,
  reportIdB: number,
  model: ModelKey = 'sonnet'
): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report_id_a: reportIdA,
      report_id_b: reportIdB,
      model,
    }),
  });
  if (!res.ok) throw new Error('Failed to compare reports');
  return res.json();
}

export async function getComparisonSuggestions(
  reportId: number,
  limit = 5
): Promise<{ suggestions: ComparisonSuggestion[] }> {
  const res = await fetch(`${API_BASE}/comparison/suggestions/${reportId}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to get comparison suggestions');
  return res.json();
}

// ============ TEXT-TO-SPEECH API ============

export interface TTSVoice {
  id: string;
  description: string;
}

export interface AudioVersion {
  voice: string;
  description: string;
  path: string;
}

export interface GenerateAudioResult {
  audio_path: string;
  voice: string;
  duration_estimate: number | null;
  cached: boolean;
}

export async function getTTSVoices(): Promise<{ voices: TTSVoice[]; default: string }> {
  const res = await fetch(`${API_BASE}/tts/voices`);
  if (!res.ok) throw new Error('Failed to fetch TTS voices');
  return res.json();
}

export async function generateAudio(
  reportId: number,
  voice = 'nova',
  forceRegenerate = false
): Promise<GenerateAudioResult> {
  const res = await fetch(`${API_BASE}/tts/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice, force_regenerate: forceRegenerate }),
  });
  if (!res.ok) throw new Error('Failed to generate audio');
  return res.json();
}

export async function getReportAudio(
  reportId: number
): Promise<{ report_id: number; audio_versions: AudioVersion[] }> {
  const res = await fetch(`${API_BASE}/tts/${reportId}`);
  if (!res.ok) throw new Error('Failed to fetch audio versions');
  return res.json();
}

export function getAudioStreamUrl(reportId: number, voice: string): string {
  return `${API_BASE}/tts/${reportId}/stream/${voice}`;
}

// ============ SPACED REPETITION API ============

export interface ReviewItem {
  id: number;
  report_id: number;
  title: string;
  content_type: string;
  source_url: string | null;
  repetitions: number;
  ease_factor: number;
  interval: number;
  next_review: string;
  summary: string | null;
}

export interface ReviewResult {
  report_id: number;
  next_review: string;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

export interface ReviewStats {
  total_reviews: number;
  due_today: number;
  reviewed_today: number;
  average_ease: number;
  streak: number;
}

export async function getDueReviews(limit = 10): Promise<{ items: ReviewItem[]; count: number }> {
  const res = await fetch(`${API_BASE}/reviews/due?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch due reviews');
  return res.json();
}

export async function addToReviewQueue(reportId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/reviews/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_id: reportId }),
  });
  if (!res.ok) throw new Error('Failed to add to review queue');
  return res.json();
}

export async function submitReview(reportId: number, quality: number): Promise<ReviewResult> {
  const res = await fetch(`${API_BASE}/reviews/${reportId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quality }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function getReviewStats(): Promise<ReviewStats> {
  const res = await fetch(`${API_BASE}/reviews/stats`);
  if (!res.ok) throw new Error('Failed to fetch review stats');
  return res.json();
}

// ============ CREDIBILITY API ============

export interface ScoreDetail {
  score: number;
  notes: string;
}

export interface CredibilityResult {
  overall_score: number;
  domain_score: number;
  ai_score: number;
  source_quality: ScoreDetail | null;
  evidence_quality: ScoreDetail | null;
  bias_level: ScoreDetail | null;
  fact_checkability: ScoreDetail | null;
  red_flags: string[];
  strengths: string[];
  recommendation: string;
}

export async function analyzeCredibility(reportId: number): Promise<CredibilityResult> {
  const res = await fetch(`${API_BASE}/credibility/${reportId}`);
  if (!res.ok) throw new Error('Failed to analyze credibility');
  return res.json();
}

// ============ LEARNING GOALS API ============

export interface LearningGoal {
  id: number;
  title: string;
  description: string | null;
  keywords: string[];
  target_count: number;
  current_count: number;
  status: 'active' | 'paused' | 'completed';
  progress_percent: number;
  created_at: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  keywords?: string[];
  target_count?: number;
}

export async function fetchGoals(): Promise<{ goals: LearningGoal[] }> {
  const res = await fetch(`${API_BASE}/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function fetchGoal(goalId: number): Promise<LearningGoal & { reports?: Report[] }> {
  const res = await fetch(`${API_BASE}/goals/${goalId}`);
  if (!res.ok) throw new Error('Failed to fetch goal');
  return res.json();
}

export async function createGoal(input: CreateGoalInput): Promise<LearningGoal> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function updateGoalStatus(goalId: number, status: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/goals/${goalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function deleteGoal(goalId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/goals/${goalId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete goal');
  return res.json();
}

export async function linkReportToGoal(goalId: number, reportId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/goals/${goalId}/reports/${reportId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to link report to goal');
  return res.json();
}

// ============ TRANSLATION API ============

export interface Language {
  code: string;
  name: string;
}

export interface TranslationResult {
  report_id: number;
  original_title: string;
  translated_title: string;
  translated_content: string;
  target_language: string;
  language_name: string;
}

export async function getSupportedLanguages(): Promise<{ languages: Language[] }> {
  const res = await fetch(`${API_BASE}/translate/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function translateReport(
  reportId: number,
  targetLanguage: string,
  sections: string[] = []
): Promise<TranslationResult> {
  const res = await fetch(`${API_BASE}/translate/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_language: targetLanguage,
      sections,
    }),
  });
  if (!res.ok) throw new Error('Failed to translate report');
  return res.json();
}

// ============ RECOMMENDATIONS API ============

export interface RecommendedReport {
  id: number;
  title: string;
  content_type: string;
  source_url: string | null;
  reason: string;
  score: number;
}

export interface TrendingTopic {
  topic: string;
  count: number;
}

export async function getRecommendations(limit = 10): Promise<{
  recommendations: RecommendedReport[];
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/recommendations?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function getSimilarReports(
  reportId: number,
  limit = 5
): Promise<{ similar: RecommendedReport[] }> {
  const res = await fetch(`${API_BASE}/recommendations/similar/${reportId}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch similar reports');
  return res.json();
}

export async function getTrendingTopics(): Promise<{ trending: TrendingTopic[] }> {
  const res = await fetch(`${API_BASE}/recommendations/trending`);
  if (!res.ok) throw new Error('Failed to fetch trending topics');
  return res.json();
}

// ============ REPORT MANAGEMENT API ============

export interface DeleteResult {
  status: string;
  report_id: number;
}

export interface BulkDeleteResult {
  deleted: number[];
  errors: Array<{ id: number; error: string }>;
}

export interface MoveResult {
  status: string;
  report_id: number;
  new_category: string;
  new_filepath: string;
}

export type ContentType = 'youtube' | 'article' | 'paper' | 'other';

export async function deleteReport(id: number): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
}

export async function bulkDeleteReports(ids: number[]): Promise<BulkDeleteResult> {
  const res = await fetch(`${API_BASE}/reports/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_ids: ids }),
  });
  if (!res.ok) throw new Error('Failed to delete reports');
  return res.json();
}

export async function moveReportCategory(id: number, newCategory: ContentType): Promise<MoveResult> {
  const res = await fetch(`${API_BASE}/reports/${id}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_category: newCategory }),
  });
  if (!res.ok) throw new Error('Failed to move report');
  return res.json();
}
