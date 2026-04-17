addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle /admin routes - fix any encoding issues
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    const origin = url.origin;
    // Fetch from the Pages CDN origin directly
    const cdnUrl = url.protocol + '//bomberos-k141.pages.dev' + url.pathname;
    
    return fetch(cdnUrl).then(response => {
      // If the response is HTML with encoding issues, fix it
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        return response.text().then(text => {
          // Check for double-encoding patterns (Ã¡ = double-encoded á)
          if (text.includes('Ã¡') || text.includes('Ã©') || text.includes('Ã­') ||
              text.includes('Ã³') || text.includes('Ãº') || text.includes('Ã±')) {
            // Try to fix double-encoded content
            // The served text has UTF-8 bytes interpreted as Latin-1 then re-encoded as UTF-8
            // We need to decode Latin-1 bytes to get the original UTF-8
            const fixed = fixDoubleEncoding(text);
            return new Response(fixed, {
              status: response.status,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Content-Type-Options': 'nosniff'
              }
            });
          }
          return response;
        });
      }
      return response;
    }).catch(() => {
      // Fallback to origin response
      return fetch(event.request);
    });
  }
  
  // Pass through all other requests
  return fetch(event.request);
});

function fixDoubleEncoding(text) {
  // The double-encoding happens when UTF-8 bytes are interpreted as Latin-1
  // then re-encoded as UTF-8. To fix: encode as Latin-1, then decode as UTF-8
  try {
    // Check if text has double-encoding markers
    if (!text.includes('Ã') && !text.includes('â€™') && !text.includes('â€")) {
      return text; // No double-encoding detected
    }
    
    // Convert string to bytes (Latin-1 interpretation of UTF-8 bytes)
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0xFF;
    }
    
    // Decode as UTF-8
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(bytes);
  } catch (e) {
    console.error('Fix encoding error:', e);
    return text;
  }
}