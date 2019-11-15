'use strict';

// Utilities for operating with ArrayBuffers.
let buffer = {}

// Returns an Uint8Array view of an ArrayBuffer or any ArrayBufferView.
buffer.getByteView = function(data) {
  if ('buffer' in data && 'byteOffset' in data && 'byteLength' in data) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  return new Uint8Array(data);
}

// Converts an ArrayBuffer (or ArrayBufferView) into a Base64 string.
buffer.toBase64 = function(data) {
  return btoa(String.fromCharCode.apply(null, buffer.getByteView(data)));
}

// Converts a Base64 string into an ArrayBuffer.
buffer.fromBase64 = function(base64) {
  let bytes = atob(base64).split("").map(char => char.charCodeAt(0));
  return Uint8Array.from(bytes).buffer;
}

// Converts UTF-8 text in an ArrayBuffer (or ArrayBufferView) into a string.
buffer.toString = function(data) {
  var decoder = new TextDecoder("utf-8");
  return decoder.decode(data);
}

// Converts a string into an ArrayBuffer containing UTF-8 text.
buffer.fromString = function(string) {
  var encoder = new TextEncoder();
  return encoder.encode(string).buffer;
}

// Converts JSON in an ArrayBuffer (or ArrayBufferView) into an object.
buffer.toObject = function(data) {
  return JSON.parse(buffer.toString(data));
}

// Converts an object into an ArrayBuffer containing JSON.
buffer.fromObject = function(obj) {
  return buffer.fromString(JSON.stringify(obj));
}
