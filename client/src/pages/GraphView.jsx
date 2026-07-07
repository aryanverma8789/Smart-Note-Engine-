/**
 * pages/GraphView.jsx
 * --------------------
 * Interactive force-directed graph visualisation of note connections.
 *
 * - Reads :id from URL params (the root note for the BFS network).
 * - Calls GET /api/notes/:id/network  → { nodes: [...], links: [...] }
 * - Renders using react-force-graph (ForceGraph2D).
 * - Node labels = note titles; node colour = hue based on first tag.
 * - Click a node to open its Editor.
 * - Falls back to a demo graph if the backend is unavailable.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { notesAPI } from '../services/api';
import Editor from '../components/Editor';

// ── Colour palette for nodes (one per tag hash) ─────────────────────────────
const TAG_COLORS = [
  '#7c3aed', '#9f67fa', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

function tagToColor(tag) {
  if (!tag) return TAG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ── Fallback demo graph (shown when backend is offline) ──────────────────────
const DEMO_GRAPH = {
  nodes: [
    { id: 'a', title: 'Graph Theory',       tags: ['dsa']       },
    { id: 'b', title: 'BFS Algorithm',      tags: ['algorithm'] },
    { id: 'c', title: 'DFS Algorithm',      tags: ['algorithm'] },
    { id: 'd', title: 'React Hooks',        tags: ['react']     },
    { id: 'e', title: 'State Management',   tags: ['react']     },
  ],
  links: [
    { source: 'a', target: 'b' },
    { source: 'a', target: 'c' },
    { source: 'd', target: 'e' },
    { source: 'b', target: 'd' },
  ],
};

export default function GraphView() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const graphRef   = useRef();

  const [graphData,   setGraphData]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [rootNote,    setRootNote]    = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });
  const [editingNote, setEditingNote] = useState(null);

  // ── Fetch network data ────────────────────────────────────────────
  useEffect(() => {
    const fetchNetwork = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await notesAPI.getNetwork(id);
        // Backend returns { nodes, links, root }
        setGraphData({
          nodes: (data.nodes || []).map((n) => ({ ...n, id: n._id || n.id })),
          links: data.links || [],
        });
        setRootNote(data.root || data.nodes?.[0] || null);
      } catch {
        // Backend not ready — show demo graph with informational message
        setError('Backend offline — showing demo graph. Connect the API to see live data.');
        setGraphData(DEMO_GRAPH);
        setRootNote(DEMO_GRAPH.nodes[0]);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNetwork();
  }, [id]);

  // ── Node canvas painter ───────────────────────────────────────────
  const paintNode = useCallback((node, ctx, globalScale) => {
    const r = hoveredNode?.id === node.id ? 10 : 7;
    const color = tagToColor(node.tags?.[0]);

    // Glow
    if (hoveredNode?.id === node.id) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 6, 0, 2 * Math.PI);
      ctx.fillStyle = color + '33';
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    if (globalScale > 0.6) {
      const label = node.title || node.id;
      const fontSize = Math.max(10 / globalScale, 4);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(240,240,245,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(label, node.x, node.y + r + fontSize + 2);
    }
  }, [hoveredNode]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleNodeClick = (node) => {
    // If the node has a real _id, open editor; otherwise navigate
    if (node._id && node._id !== id) {
      navigate(`/graph/${node._id}`);
    } else if (node._id) {
      setEditingNote(node);
    }
  };

  const handleNodeHover = (node) => setHoveredNode(node);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="graph-page"
        onMouseMove={handleMouseMove}
        id="graph-view"
      >
        {/* Header */}
        <div className="graph-header">
          <button
            id="graph-back-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
            {rootNote ? `🕸 Network: ${rootNote.title}` : '🕸 Note Network'}
          </h2>
        </div>

        {/* Graph canvas */}
        <div className="graph-canvas" aria-label="Note network graph">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading note network…</span>
            </div>
          ) : (
            graphData && (
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeCanvasObject={paintNode}
                nodeCanvasObjectMode={() => 'replace'}
                linkColor={() => 'rgba(124, 58, 237, 0.4)'}
                linkWidth={1.5}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                backgroundColor="transparent"
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                cooldownTicks={100}
                onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
              />
            )
          )}

          {/* Legend */}
          <div className="graph-legend">
            <strong>Click</strong> a node to explore &nbsp;·&nbsp;
            <strong>Scroll</strong> to zoom &nbsp;·&nbsp;
            <strong>Drag</strong> to pan
          </div>

          {/* Tooltip on hover */}
          {hoveredNode && (
            <div
              className="graph-tooltip"
              style={{ left: mousePos.x + 12, top: mousePos.y - 32 }}
              aria-live="polite"
            >
              <strong>{hoveredNode.title || hoveredNode.id}</strong>
              {hoveredNode.tags?.length > 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                  {hoveredNode.tags.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="auth-error"
            role="alert"
            style={{ position: 'fixed', bottom: 20, right: 20, maxWidth: 360 }}
          >
            ℹ️ {error}
          </div>
        )}
      </div>

      {/* Note Editor modal (when clicking a node) */}
      {editingNote && (
        <Editor
          note={editingNote}
          allNotes={[]}
          onSave={() => setEditingNote(null)}
          onClose={() => setEditingNote(null)}
        />
      )}
    </>
  );
}
