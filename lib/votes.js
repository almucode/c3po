'use strict';

// Class for collecting votes.
class Votes {
  constructor(maxOptions) {
    this.map = {};  // Maps vote strings to counts.
    this.total = 0;  // Total vote count.
    this.maxOptions = maxOptions;  // Max options per vote.
  }

  add(vote) {
    let options = new Set(vote);  // Remove duplicates.
    if (options.size < 1 || options.size > this.maxOptions) {
      options = ["-"];  // Invalid vote.
    }
    for (let option of options) {
      this.map[option] = (this.map[option] || 0) + 1;  // Increment the count.
    }
    this.total++;
  }

  summarize() {
    return Object.keys(this.map)
        .map(key => [key, this.map[key]])  // Turn the map into array.
        .sort((a, b) => b[1] - a[1])  // Reverse sort.
        .map(keyValue => keyValue[0] + ': ' + keyValue[1])  // Pretty print.
        .join("\n");  // Multiline.
  }
}
