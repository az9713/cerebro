'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchKnowledgeGraph,
  fetchConceptDetails,
  extractConceptsFromAllReports,
  type GraphNode,
  type GraphLink,
  type ConceptDetails,
} from '@/lib/api';

// Node colors by type - warm palette
const TYPE_COLORS: Record<string, string> = {
  person: '#DC7F5A',      // warm coral (youtube-like)
  organization: '#D97706', // amber
  technology: '#7C8B6F',   // sage
  concept: '#C45B28',      // terracotta (accent)
  event: '#8B7355',        // warm brown (paper)
  place: '#06b6d4',        // cyan
  product: '#ec4899',      // pink
  method: '#A3B18A',       // light sage
};

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConceptDetails | null>(null);
  const [extracting, setExtracting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Load graph data
  useEffect(() => {
    const loadGraph = async () => {
      try {
        setLoading(true);
        const data = await fetchKnowledgeGraph(150);

        // Initialize node positions randomly
        const simNodes: SimNode[] = data.nodes.map((node) => ({
          ...node,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
          vx: 0,
          vy: 0,
        }));

        setNodes(simNodes);
        setLinks(data.links);
      } catch (err) {
        setError('Failed to load knowledge graph');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGraph();
  }, []);

  // Set canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, window.innerHeight - 300),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Simple force simulation
  const simulate = useCallback(() => {
    if (nodes.length === 0) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Apply forces
    nodes.forEach((node) => {
      // Center gravity
      node.vx += (centerX - node.x) * 0.001;
      node.vy += (centerY - node.y) * 0.001;

      // Repulsion from other nodes
      nodes.forEach((other) => {
        if (node.id === other.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 150) {
          const force = (150 - dist) / dist * 0.5;
          node.vx += dx * force * 0.01;
          node.vy += dy * force * 0.01;
        }
      });
    });

    // Apply link forces
    links.forEach((link) => {
      const source = nodeMap.get(link.source as number);
      const target = nodeMap.get(link.target as number);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 100) * 0.01;

      source.vx += dx / dist * force;
      source.vy += dy / dist * force;
      target.vx -= dx / dist * force;
      target.vy -= dy / dist * force;
    });

    // Apply velocity and damping
    nodes.forEach((node) => {
      node.vx *= 0.9;
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;

      // Keep in bounds
      node.x = Math.max(30, Math.min(dimensions.width - 30, node.x));
      node.y = Math.max(30, Math.min(dimensions.height - 30, node.y));
    });

    setNodes([...nodes]);
  }, [nodes, links, dimensions]);

  // Animation loop
  useEffect(() => {
    if (loading || nodes.length === 0) return;

    let frameCount = 0;
    const maxFrames = 200; // Stop after stabilization

    const animate = () => {
      if (frameCount < maxFrames) {
        simulate();
        frameCount++;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, simulate]);

  // Draw graph with warm colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Clear with warm background
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#1C1917' : '#F7F3EE';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw links with warm color
    ctx.strokeStyle = isDark ? '#3D3835' : '#E8E2DB';
    ctx.lineWidth = 1;
    links.forEach((link) => {
      const source = nodeMap.get(link.source as number);
      const target = nodeMap.get(link.target as number);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const radius = Math.min(20, 8 + node.mention_count * 2);
      const color = TYPE_COLORS[node.type] || '#9C8E82';

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#F5F0EB' : '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = '11px "Source Sans 3", system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#F5F0EB' : '#2C2520';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + radius + 14);
    });
  }, [nodes, links, dimensions]);

  // Handle canvas click
  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    for (const node of nodes) {
      const radius = Math.min(20, 8 + node.mention_count * 2);
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < radius * radius) {
        try {
          const details = await fetchConceptDetails(node.id);
          setSelectedNode(details);
        } catch (err) {
          console.error('Failed to fetch concept details:', err);
        }
        return;
      }
    }

    setSelectedNode(null);
  };

  // Extract concepts from all reports
  const handleExtractAll = async () => {
    try {
      setExtracting(true);
      await extractConceptsFromAllReports(50);
      // Reload after a delay
      setTimeout(async () => {
        const data = await fetchKnowledgeGraph(150);
        const simNodes: SimNode[] = data.nodes.map((node) => ({
          ...node,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
          vx: 0,
          vy: 0,
        }));
        setNodes(simNodes);
        setLinks(data.links);
        setExtracting(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to extract concepts:', err);
      setExtracting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
            Knowledge Graph
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            Explore connections between concepts across all your content.
          </p>
        </div>

        <button
          onClick={handleExtractAll}
          disabled={extracting}
          className="
            px-5 py-2.5
            bg-[var(--accent-primary)] text-white
            rounded-xl font-medium
            hover:bg-[var(--accent-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {extracting ? 'Extracting...' : 'Extract from All Reports'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-[var(--text-secondary)] capitalize">
              {type}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Graph Canvas */}
        <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[var(--accent-primary)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[var(--text-secondary)]">Loading knowledge graph...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-red-500">{error}</div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <svg className="w-16 h-16 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <div className="text-[var(--text-secondary)]">No concepts extracted yet.</div>
              <button
                onClick={handleExtractAll}
                disabled={extracting}
                className="px-5 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Extract Concepts from Reports
              </button>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              onClick={handleCanvasClick}
              className="cursor-pointer"
            />
          )}
        </div>

        {/* Concept Details Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-[var(--bg-card)] rounded-xl p-6 shadow-card h-fit">
            <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-2">
              {selectedNode.name}
            </h2>

            <div
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white mb-4"
              style={{
                backgroundColor: TYPE_COLORS[selectedNode.concept_type] || '#9C8E82',
              }}
            >
              {selectedNode.concept_type}
            </div>

            {selectedNode.description && (
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                {selectedNode.description}
              </p>
            )}

            <div className="text-sm text-[var(--text-tertiary)] mb-4">
              Mentioned in {selectedNode.mention_count} report(s)
            </div>

            {selectedNode.reports.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Related Reports
                </h3>
                <div className="space-y-2">
                  {selectedNode.reports.slice(0, 5).map((report) => (
                    <Link
                      key={report.id}
                      href={`/reports/${report.id}`}
                      className="block p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-light)] transition-colors"
                    >
                      <div className="text-sm text-[var(--text-primary)] truncate">
                        {report.title}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] capitalize">
                        {report.content_type}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-sm text-[var(--text-tertiary)]">
        <div>
          <span className="font-semibold text-[var(--text-primary)]">{nodes.length}</span> concepts
        </div>
        <div>
          <span className="font-semibold text-[var(--text-primary)]">{links.length}</span> connections
        </div>
      </div>
    </div>
  );
}
