'use strict';

// Class for collecting votes.
class Votes {
  constructor(maxOptions) {
    this.map = {};  // Maps vote strings to counts.
    this.total = 0;  // Total vote count.
    this.maxOptions = maxOptions;  // Max options per vote.
  }

  add(id, vote) {
    let options = new Set(vote);  // Remove duplicates.
    if (options.size < 1 || options.size > this.maxOptions) {
      options = ["-"];  // Invalid vote.
    }
    for (let option of options) {
      this.map[option] = (this.map[option] || []).concat([id]);
    }
    this.total++;
  }

  summarize() {
    return Object.keys(this.map)
        .map(key => [key, this.map[key]])  // Turn the map into array.
        .sort(([aOption, aVotes], [bOption, bVotes]) => bVotes.length - aVotes.length)  // Reverse sort.
        .map(([option, votes]) => option + ': ' + votes.length + ' (' + votes.sort().join(', ') + ')')  // Pretty print.
        .join("\n");  // Multiline.
  }
}
