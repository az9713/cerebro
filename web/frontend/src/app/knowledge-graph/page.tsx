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

// Node colors by type
const TYPE_COLORS: Record<string, string> = {
  person: '#ef4444',
  organization: '#f97316',
  technology: '#22c55e',
  concept: '#3b82f6',
  event: '#a855f7',
  place: '#06b6d4',
  product: '#ec4899',
  method: '#84cc16',
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

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw links
    ctx.strokeStyle = '#334155';
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
      const color = TYPE_COLORS[node.type] || '#64748b';

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#e2e8f0';
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Knowledge Graph
        </h1>

        <button
          onClick={handleExtractAll}
          disabled={extracting}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {extracting ? 'Extracting...' : 'Extract from All Reports'}
        </button>
      </div>

      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Explore connections between concepts across all your analyzed content.
        Click on a node to see details and related reports.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
              {type}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Graph Canvas */}
        <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-slate-400">Loading knowledge graph...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-red-400">{error}</div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="text-slate-400">No concepts extracted yet.</div>
              <button
                onClick={handleExtractAll}
                disabled={extracting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
          <div className="w-80 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {selectedNode.name}
            </h2>

            <div
              className="inline-block px-2 py-1 rounded text-xs text-white mb-4"
              style={{
                backgroundColor: TYPE_COLORS[selectedNode.concept_type] || '#64748b',
              }}
            >
              {selectedNode.concept_type}
            </div>

            {selectedNode.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {selectedNode.description}
              </p>
            )}

            <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Mentioned in {selectedNode.mention_count} report(s)
            </div>

            {selectedNode.reports.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Related Reports
                </h3>
                <div className="space-y-2">
                  {selectedNode.reports.slice(0, 5).map((report) => (
                    <Link
                      key={report.id}
                      href={`/reports/${report.id}`}
                      className="block p-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className="text-sm text-slate-900 dark:text-slate-100 truncate">
                        {report.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {report.content_type}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <span className="font-semibold">{nodes.length}</span> concepts
        </div>
        <div>
          <span className="font-semibold">{links.length}</span> connections
        </div>
      </div>
    </div>
  );
}
