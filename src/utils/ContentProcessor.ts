/**
 * Content Processing Utilities for Bibhrajit AI Avatar
 * Handles content validation, PII removal, and business insight preservation
 */

export interface ContentValidation {
  removePatterns: string[];
  preservePatterns: string[];
  chunkSize: number;
  overlapSize: number;
}

export const CONTENT_VALIDATION_CONFIG: ContentValidation = {
  // Remove these specific types of sensitive info
  removePatterns: [
    'client names',
    'financial figures', 
    'internal company details',
    'personal email addresses',
    'phone numbers',
    'confidential project codenames'
  ],
  
  // Preserve these business insights
  preservePatterns: [
    'strategic frameworks',
    'business methodologies', 
    'market analysis approaches',
    'leadership philosophies',
    'fundraising strategies'
  ],
  
  // Chunk size optimization (tokens, not characters)
  chunkSize: 700, // 500-800 token range
  overlapSize: 50 // tokens overlap between chunks
};

/**
 * Sanitizes content by removing PII while preserving business insights
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;
  
  // Remove email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers (various formats)
  sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
  
  // Remove specific financial figures (dollar amounts)
  sanitized = sanitized.replace(/\$[\d,]+(?:\.\d{2})?(?:[MBK])?/g, '[AMOUNT_REDACTED]');
  
  // Remove URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_REDACTED]');
  
  return sanitized;
}

/**
 * Validates content for business relevance
 */
export function validateBusinessContent(content: string): boolean {
  const businessKeywords = [
    'strategy', 'investment', 'fundraising', 'scaling', 'growth',
    'market', 'business', 'leadership', 'management', 'startup',
    'venture', 'capital', 'revenue', 'customer', 'product'
  ];
  
  const contentLower = content.toLowerCase();
  return businessKeywords.some(keyword => contentLower.includes(keyword));
}

/**
 * Chunks content optimally for embedding
 */
export function chunkContent(content: string, maxTokens: number = 700, overlapTokens: number = 50): string[] {
  // Rough token estimation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;
  
  const sentences = content.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Create overlap for context continuity
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlapChars / 5)); // Rough word estimation
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 100); // Filter out very small chunks
}

/**
 * Assigns domain based on content analysis
 */
export function assignContentDomain(content: string): string {
  const domainKeywords = {
    leadership: ['leadership', 'management', 'team', 'culture', 'vision'],
    mna: ['merger', 'acquisition', 'due diligence', 'valuation', 'deal'],
    consulting: ['consulting', 'advisory', 'strategy', 'implementation'],
    strategy: ['strategic', 'planning', 'roadmap', 'competitive', 'market'],
    investing: ['investment', 'venture', 'funding', 'capital', 'investor'],
    personal_philosophy: ['philosophy', 'principles', 'beliefs', 'values', 'mindset']
  };
  
  const contentLower = content.toLowerCase();
  
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return domain;
    }
  }
  
  return 'strategy'; // Default domain
}