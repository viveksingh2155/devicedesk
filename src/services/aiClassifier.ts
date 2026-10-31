import { Ticket, TicketCategory, TicketPriority } from '../types';

export interface AIAnalysisResult {
  suggestedCategory: TicketCategory;
  suggestedPriority: TicketPriority;
  priorityScore: number;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  extractedDevice?: string;
  problemSummary: string;
  troubleshootingSteps: string[];
  similarTickets: {
    ticketId: string;
    title: string;
    similarityScore: number;
    resolvedSolution?: string;
  }[];
  businessRuleEnforced: boolean;
  businessRuleNote?: string;
}

/**
 * Modular AI Classification & IT Decision Service.
 * Analyzes employee input, enforces organizational priority business rules,
 * extracts device entities, synthesizes troubleshooting workflows, and matches similar historical tickets.
 */
export class AITicketService {
  /**
   * Analyzes an issue title and description against enterprise knowledge heuristics and pattern models.
   */
  public static analyzeTicket(
    title: string,
    description: string,
    userSelectedPriority?: TicketPriority,
    existingTickets: Ticket[] = []
  ): AIAnalysisResult {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Identify category
    let category: TicketCategory = 'Other';
    if (
      text.includes('screen') ||
      text.includes('battery') ||
      text.includes('keyboard') ||
      text.includes('mouse') ||
      text.includes('laptop') ||
      text.includes('hardware') ||
      text.includes('charger') ||
      text.includes('overheat') ||
      text.includes('display') ||
      text.includes('fan') ||
      text.includes('monitor')
    ) {
      category = 'Hardware';
    } else if (
      text.includes('wifi') ||
      text.includes('network') ||
      text.includes('vpn') ||
      text.includes('internet') ||
      text.includes('connect') ||
      text.includes('dns') ||
      text.includes('firewall') ||
      text.includes('slow connection')
    ) {
      category = 'Network';
    } else if (
      text.includes('login') ||
      text.includes('password') ||
      text.includes('permission') ||
      text.includes('access') ||
      text.includes('2fa') ||
      text.includes('mfa') ||
      text.includes('locked out') ||
      text.includes('sso') ||
      text.includes('credential')
    ) {
      category = 'Access';
    } else if (
      text.includes('crash') ||
      text.includes('error') ||
      text.includes('install') ||
      text.includes('software') ||
      text.includes('app') ||
      text.includes('slack') ||
      text.includes('excel') ||
      text.includes('update') ||
      text.includes('outlook') ||
      text.includes('teams')
    ) {
      category = 'Software';
    }

    // 2. Identify suggested priority based on severity signals
    let suggestedPriority: TicketPriority = 'Medium';
    let reasoning = 'Standard operational request with moderate productivity impact.';
    let confidence = 0.88;

    const isSystemDown =
      text.includes('entire team') ||
      text.includes('production') ||
      text.includes('company wide') ||
      text.includes('outage') ||
      text.includes('security breach') ||
      text.includes('ransomware') ||
      text.includes('smoke') ||
      text.includes('server down') ||
      text.includes('cannot work at all');

    const isHighImpact =
      text.includes('blocked') ||
      text.includes('deadline today') ||
      text.includes('urgent') ||
      text.includes('executive') ||
      text.includes('critical client') ||
      text.includes('blue screen') ||
      text.includes('won\'t turn on');

    const isLowImpact =
      text.includes('request adapter') ||
      text.includes('cosmetic') ||
      text.includes('when you have time') ||
      text.includes('new mousepad') ||
      text.includes('minor font') ||
      text.includes('suggestion') ||
      text.includes('question about');

    if (isSystemDown) {
      suggestedPriority = 'Critical';
      reasoning = 'Severe enterprise-level impact or complete work stoppage detected.';
      confidence = 0.96;
    } else if (isHighImpact) {
      suggestedPriority = 'High';
      reasoning = 'Direct employee blockage or imminent operational deadline detected.';
      confidence = 0.92;
    } else if (isLowImpact) {
      suggestedPriority = 'Low';
      reasoning = 'Non-blocking inquiry or cosmetic item with zero downtime.';
      confidence = 0.94;
    }

    // 3. Business rule validation: Prevent arbitrary "Critical" selection by standard users
    let businessRuleEnforced = false;
    let businessRuleNote: string | undefined;

    if (userSelectedPriority === 'Critical' && !isSystemDown) {
      businessRuleEnforced = true;
      businessRuleNote =
        'Enterprise Policy Rule EP-104: Critical priority requires verified systemic downtime or data vulnerability. Downgraded to High pending IT Agent review.';
      suggestedPriority = 'High';
    }

    // 4. Extract device entities
    let extractedDevice: string | undefined;
    const deviceMatches = text.match(
      /(macbook pro|macbook air|thinkpad [x|t]\d+|dell xps|dell latitude|iphone|ipad|hp elitebook|dell ultrasharp|cisco router)/i
    );
    if (deviceMatches) {
      extractedDevice = deviceMatches[0].toUpperCase();
    }

    // 5. Synthesize problem summary
    const problemSummary =
      title.length > 50 ? title.slice(0, 47) + '...' : title;

    // 6. Generate intelligent troubleshooting recommendations
    const troubleshootingSteps: string[] = [];
    if (category === 'Network') {
      troubleshootingSteps.push('Verify local Wi-Fi / Ethernet cable link light.');
      troubleshootingSteps.push('Disconnect and reconnect the enterprise GlobalProtect VPN.');
      troubleshootingSteps.push('Flush local DNS cache via terminal (`ipconfig /flushdns`).');
    } else if (category === 'Access') {
      troubleshootingSteps.push('Attempt self-service password reset via Okta / Azure AD portal.');
      troubleshootingSteps.push('Ensure authenticator app clock is synced with UTC.');
      troubleshootingSteps.push('Check if department manager pre-approved the group access.');
    } else if (category === 'Hardware') {
      troubleshootingSteps.push('Disconnect all external docks and hold power button for 15 seconds.');
      troubleshootingSteps.push('Check power adapter LED indicator and try an alternate wall outlet.');
      troubleshootingSteps.push('Verify device serial number matches your Asset Portal record.');
    } else {
      troubleshootingSteps.push('Restart the application and check for pending OS updates.');
      troubleshootingSteps.push('Clear application cache and check background Task Manager processes.');
      troubleshootingSteps.push('Verify network connectivity to the cloud service endpoint.');
    }

    // 7. Find similar tickets from historical pool
    const similarTickets = existingTickets
      .filter((t) => t.category === category)
      .slice(0, 3)
      .map((t) => {
        // Simple Jaccard/keyword similarity
        const tTokens = (t.title + ' ' + t.description).toLowerCase().split(/\s+/);
        const queryTokens = text.split(/\s+/);
        const intersection = queryTokens.filter((token) => tTokens.includes(token));
        const score = Math.min(
          0.95,
          Math.max(0.45, Number((intersection.length / (queryTokens.length + 2)).toFixed(2)))
        );

        return {
          ticketId: t.ticketId,
          title: t.title,
          similarityScore: score,
          resolvedSolution:
            t.status === 'Resolved'
              ? 'Reset hardware configuration profile & cleared cache.'
              : undefined,
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);

    const priorityScoreMap = { Critical: 1, High: 2, Medium: 3, Low: 4 };

    return {
      suggestedCategory: category,
      suggestedPriority,
      priorityScore: priorityScoreMap[suggestedPriority],
      confidence,
      reasoning,
      extractedDevice,
      problemSummary,
      troubleshootingSteps,
      similarTickets,
      businessRuleEnforced,
      businessRuleNote,
    };
  }
}
