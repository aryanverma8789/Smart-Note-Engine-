/**
 * data_structures/Trie.js
 * ------------------------
 * Custom Trie (prefix tree) implementation for O(L) tag autocomplete.
 *
 * Methods:
 *   - insert(word)          : Add a word to the trie
 *   - searchPrefix(prefix)  : Return all words that start with the given prefix
 *   - has(word)             : Check if a full word exists in the trie
 *   - remove(word)          : Remove a word from the trie
 *   - getAllWords()          : Return all words stored in the trie
 */

class TrieNode {
  constructor() {
    this.children = {};       // { char: TrieNode }
    this.isEndOfWord = false; // Marks complete words
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word into the trie.
   * Time Complexity: O(L) where L = word length
   */
  insert(word) {
    if (!word || typeof word !== 'string') return;
    const cleaned = word.toLowerCase().trim();
    if (!cleaned) return;

    let node = this.root;
    for (const char of cleaned) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  /**
   * Search for all words that start with the given prefix.
   * Time Complexity: O(L + N) where L = prefix length, N = matching results
   * @returns {string[]} Array of matching words
   */
  searchPrefix(prefix) {
    if (!prefix || typeof prefix !== 'string') return [];
    const cleaned = prefix.toLowerCase().trim();
    if (!cleaned) return [];

    // Navigate to the end of the prefix
    let node = this.root;
    for (const char of cleaned) {
      if (!node.children[char]) return []; // Prefix not found
      node = node.children[char];
    }

    // Collect all words from this node
    const results = [];
    this._collectWords(node, cleaned, results);
    return results;
  }

  /**
   * Check if an exact word exists in the trie.
   */
  has(word) {
    if (!word) return false;
    const cleaned = word.toLowerCase().trim();
    let node = this.root;
    for (const char of cleaned) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }

  /**
   * Remove a word from the trie.
   */
  remove(word) {
    if (!word) return;
    const cleaned = word.toLowerCase().trim();
    this._removeHelper(this.root, cleaned, 0);
  }

  /**
   * Return all words stored in the trie.
   */
  getAllWords() {
    const results = [];
    this._collectWords(this.root, '', results);
    return results;
  }

  // ── Private helpers ───────────────────────────────────────────────
  _collectWords(node, prefix, results) {
    if (node.isEndOfWord) {
      results.push(prefix);
    }
    for (const [char, childNode] of Object.entries(node.children)) {
      this._collectWords(childNode, prefix + char, results);
    }
  }

  _removeHelper(node, word, depth) {
    if (!node) return false;
    if (depth === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      return Object.keys(node.children).length === 0;
    }
    const char = word[depth];
    const shouldDelete = this._removeHelper(node.children[char], word, depth + 1);
    if (shouldDelete) {
      delete node.children[char];
      return !node.isEndOfWord && Object.keys(node.children).length === 0;
    }
    return false;
  }
}

module.exports = Trie;
