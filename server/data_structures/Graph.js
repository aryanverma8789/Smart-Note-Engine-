/**
 * data_structures/Graph.js
 * -------------------------
 * Graph utility for Breadth-First Search (BFS) traversal of note connections.
 *
 * This is used by the /api/notes/:id/network endpoint to find all notes
 * connected to a given note up to a certain depth (degrees of separation).
 *
 * The graph is built dynamically from MongoDB Note documents:
 *   - Each Note = a Node
 *   - Each entry in a Note's `links` array = an Edge
 *
 * BFS is used (not DFS) because we want to explore by "degree of separation"
 * — level by level — which maps directly to BFS layer-by-layer traversal.
 */

class Graph {
  constructor() {
    // Adjacency list: { noteId: Set([ linkedNoteId, ... ]) }
    this.adjacencyList = new Map();
  }

  /**
   * Add a node to the graph.
   */
  addNode(id) {
    const key = id.toString();
    if (!this.adjacencyList.has(key)) {
      this.adjacencyList.set(key, new Set());
    }
  }

  /**
   * Add a bidirectional edge between two nodes.
   * (Blueprint says directed, but app treats them as bidirectional)
   */
  addEdge(id1, id2) {
    const key1 = id1.toString();
    const key2 = id2.toString();
    this.addNode(key1);
    this.addNode(key2);
    this.adjacencyList.get(key1).add(key2);
    this.adjacencyList.get(key2).add(key1);
  }

  /**
   * Breadth-First Search from a starting node up to maxDepth levels.
   *
   * @param {string} startId  - The starting note ID
   * @param {number} maxDepth - Maximum degrees of separation (default 2)
   * @returns {{ visited: string[], edges: { source: string, target: string }[] }}
   *
   * Time Complexity: O(V + E) where V = nodes visited, E = edges traversed
   */
  bfs(startId, maxDepth = 2) {
    const start = startId.toString();
    if (!this.adjacencyList.has(start)) {
      return { visited: [start], edges: [] };
    }

    const visited = new Set([start]);
    const edges = [];
    const queue = [{ id: start, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift();

      if (depth >= maxDepth) continue;

      const neighbors = this.adjacencyList.get(id) || new Set();
      for (const neighborId of neighbors) {
        // Record edge regardless (we want all edges between visited nodes)
        edges.push({ source: id, target: neighborId });

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }

    // Deduplicate edges (A→B and B→A are the same visual edge)
    const uniqueEdges = [];
    const edgeSet = new Set();
    for (const edge of edges) {
      const key = [edge.source, edge.target].sort().join('->');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        uniqueEdges.push(edge);
      }
    }

    return { visited: Array.from(visited), edges: uniqueEdges };
  }

  /**
   * Build a graph from an array of Note documents.
   * Each note's `links` array represents directed edges.
   *
   * @param {Array} notes - Array of Note documents with _id and links fields
   * @returns {Graph}
   */
  static buildFromNotes(notes) {
    const graph = new Graph();

    for (const note of notes) {
      const noteId = note._id.toString();
      graph.addNode(noteId);

      for (const linkedId of (note.links || [])) {
        graph.addEdge(noteId, linkedId.toString());
      }
    }

    return graph;
  }
}

module.exports = Graph;
