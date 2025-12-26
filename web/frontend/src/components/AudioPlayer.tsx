'use client';

import { useState, useRef, useEffect } from 'react';
import {
  generateAudio,
  getTTSVoices,
  getAudioStreamUrl,
  type TTSVoice,
} from '@/lib/api';

interface AudioPlayerProps {
  reportId: number;
}

export function AudioPlayer({ reportId }: AudioPlayerProps) {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const data = await getTTSVoices();
        setVoices(data.voices);
        setSelectedVoice(data.default);
      } catch (err) {
        console.error('Failed to load voices:', err);
      }
    };
    loadVoices();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAudio(reportId, selectedVoice);
      setAudioUrl(getAudioStreamUrl(reportId, selectedVoice));
    } catch (err) {
      setError('Failed to generate audio. Make sure OPENAI_API_KEY is set.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔊</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Listen to Report
          </span>
        </div>
        <span className="text-slate-500">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Voice Selection */}
          <div className="flex items-center gap-4">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.id} - {voice.description}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              {isGenerating ? 'Generating...' : audioUrl ? 'Regenerate' : 'Generate Audio'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="space-y-3">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          {!audioUrl && !isGenerating && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate an audio version of this report to listen while multitasking.
              Requires OpenAI API key.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
