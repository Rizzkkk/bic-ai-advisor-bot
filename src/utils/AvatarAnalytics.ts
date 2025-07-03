/**
 * Analytics and Performance Monitoring for Bibhrajit AI Avatar
 */

export interface AvatarAnalytics {
  // Track Avatar-specific metrics
  avatarModeUsage: number;
  ragRetrievalAccuracy: number;
  voiceResponseRate: number;
  contextSourcesUsed: string[];
  
  // Quality metrics
  personaConsistencyScore: number;
  userSatisfactionInAvatarMode: number;
  
  // Performance metrics
  ragResponseTime: number;
  embeddingSearchTime: number;
  ttsGenerationTime: number;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  operation: string;
  success: boolean;
  metadata?: Record<string, any>;
}

class AvatarAnalyticsService {
  private metrics: PerformanceMetrics[] = [];
  
  startTimer(operation: string, metadata?: Record<string, any>): string {
    const id = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.push({
      startTime: Date.now(),
      operation,
      success: false,
      metadata
    });
    return id;
  }
  
  endTimer(operation: string, success: boolean = true, metadata?: Record<string, any>): void {
    const metric = this.metrics.find(m => 
      m.operation === operation && !m.endTime && m.startTime > Date.now() - 30000
    );
    
    if (metric) {
      metric.endTime = Date.now();
      metric.success = success;
      if (metadata) {
        metric.metadata = { ...metric.metadata, ...metadata };
      }
    }
  }
  
  getAverageResponseTime(operation: string): number {
    const relevantMetrics = this.metrics.filter(m => 
      m.operation === operation && m.endTime && m.success
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, metric) => 
      sum + (metric.endTime! - metric.startTime), 0
    );
    
    return totalTime / relevantMetrics.length;
  }
  
  getSuccessRate(operation: string): number {
    const relevantMetrics = this.metrics.filter(m => 
      m.operation === operation && m.endTime
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }
  
  trackAvatarModeUsage(): void {
    this.startTimer('avatar_mode_session');
  }
  
  trackRAGRetrieval(queryTime: number, resultsCount: number, threshold: number): void {
    const timerId = this.startTimer('rag_retrieval', {
      resultsCount,
      threshold
    });
    
    setTimeout(() => {
      this.endTimer('rag_retrieval', resultsCount > 0, {
        queryTime,
        accuracy: resultsCount > 0 ? 1 : 0
      });
    }, queryTime);
  }
  
  trackVoiceResponse(generationTime: number, success: boolean): void {
    const timerId = this.startTimer('voice_generation');
    
    setTimeout(() => {
      this.endTimer('voice_generation', success, {
        generationTime
      });
    }, generationTime);
  }
  
  getAnalyticsSummary(): AvatarAnalytics {
    return {
      avatarModeUsage: this.metrics.filter(m => m.operation === 'avatar_mode_session').length,
      ragRetrievalAccuracy: this.getSuccessRate('rag_retrieval'),
      voiceResponseRate: this.getSuccessRate('voice_generation'),
      contextSourcesUsed: [], // Would be populated from actual usage
      personaConsistencyScore: 0, // Would need AI evaluation
      userSatisfactionInAvatarMode: 0, // Would need user feedback
      ragResponseTime: this.getAverageResponseTime('rag_retrieval'),
      embeddingSearchTime: this.getAverageResponseTime('embedding_search'),
      ttsGenerationTime: this.getAverageResponseTime('voice_generation')
    };
  }
  
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
  
  clearMetrics(): void {
    this.metrics = [];
  }
}

export const avatarAnalytics = new AvatarAnalyticsService();

// Test scenarios for validation
export const TEST_SCENARIOS = [
  // Founder questions
  "How should I approach Series A fundraising for my fintech startup?",
  "What are the key metrics investors look for in SaaS businesses?",
  "How do I build a strong go-to-market strategy for B2B software?",
  
  // Investor questions  
  "What's your view on the African fintech market opportunity?",
  "How do you evaluate management teams in early-stage startups?",
  "What are the biggest risks in emerging market investments?",
  
  // Strategic questions
  "How do you approach M&A due diligence for tech companies?",
  "What's your framework for evaluating market entry strategies?",
  "How do you balance growth vs profitability in scaling businesses?",
  
  // Leadership questions
  "What's your philosophy on building high-performing teams?",
  "How do you make difficult strategic decisions under uncertainty?",
  "What's the most important quality for startup founders?"
];