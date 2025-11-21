/**
 * OpenAI ChatKit Configuration (OpenAI Hosted Mode with Workflow Support)
 * Supports both Chat Completions API and ChatKit Workflows
 */

export interface ChatKitConfig {
  apiKey: string;
  workflowId?: string; // NEW: For ChatKit Workflows
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  useWorkflow?: boolean; // NEW: Toggle between workflow and chat completions
}

// ⚙️ CONFIGURATION - SUPPORTS BOTH ENVIRONMENT VARIABLES AND HARDCODED VALUES
// NOTE: Domain keys (domain_pk_*) only work with Realtime/Responses APIs, NOT Chat Completions
// For production (Vercel), use environment variables: VITE_OPENAI_API_KEY
// For development/Figma Make, you can hardcode the key below

// Try to get from environment variable first, then fall back to hardcoded value
const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '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';

// 🔧 RESPONSES API CONFIGURATION
// To enable Responses API mode (modern OpenAI API):
// 1. Set VITE_OPENAI_WORKFLOW_ID environment variable
// 2. Or hardcode the workflow ID below
// 
// Responses API is OpenAI's modern, simpler API (similar to Chat Completions but with enhanced features)
// Both use the same model (gpt-4o-mini) and pricing, but Responses API may have additional capabilities
//
// Learn more: https://platform.openai.com/docs/guides/migrate-to-responses

const OPENAI_WORKFLOW_ID = import.meta.env?.VITE_OPENAI_WORKFLOW_ID || '';  // Leave empty for Chat Completions API

// Default configuration for ChatKit
export const chatKitConfig: ChatKitConfig = {
  apiKey: OPENAI_API_KEY,
  workflowId: OPENAI_WORKFLOW_ID, // Optional: Your workflow ID from OpenAI platform
  useWorkflow: !!OPENAI_WORKFLOW_ID, // Auto-enable if workflow ID is set
  model: 'gpt-4o-mini', // Used if not using workflow (fast & affordable)
  temperature: 0.7, // Used if not using workflow
  systemPrompt: `You are a helpful AI assistant integrated into a digital business card builder. Your role is to help users create professional, engaging content for their business cards.

When helping users:
- Be concise but helpful
- Provide specific, actionable suggestions
- Match the professional tone appropriate for business cards
- Consider the field context provided
- Offer multiple options when appropriate
- Keep responses focused and relevant

Format your suggestions clearly and make them ready to use.`
};

/**
 * Check if ChatKit is configured properly
 */
export function isChatKitConfigured(): boolean {
  const hasApiKey = OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE' && OPENAI_API_KEY.length > 0;
  const configured = hasApiKey;
  
  console.log('[ChatKit] Configuration check:', configured ? '✅ Configured' : '❌ Not configured');
  
  if (configured) {
    // Show key type
    const keyType = OPENAI_API_KEY.startsWith('domain_pk_') 
      ? '⚠️ Domain Key (Only for Realtime/Responses APIs)' 
      : OPENAI_API_KEY.startsWith('sk-proj-')
      ? '🔑 Project Key'
      : OPENAI_API_KEY.startsWith('sk-svcacct-')
      ? '✅ Service Account Key'
      : '🔑 API Key';
    console.log('[ChatKit] Key Type:', keyType);
    
    if (chatKitConfig.useWorkflow && chatKitConfig.workflowId) {
      console.log('[ChatKit] Mode: Workflow (ID:', chatKitConfig.workflowId.substring(0, 12) + '...)');
    } else {
      console.log('[ChatKit] Mode: Chat Completions (Model:', chatKitConfig.model + ')');
    }
  }
  
  return configured;
}

/**
 * Check if using workflow mode
 */
export function isUsingWorkflow(): boolean {
  return !!(chatKitConfig.useWorkflow && chatKitConfig.workflowId);
}

/**
 * Get workflow ID
 */
export function getWorkflowId(): string | undefined {
  return chatKitConfig.workflowId;
}

/**
 * Get ChatKit configuration with field context
 */
export function getChatKitConfigWithContext(
  fieldLabel: string,
  currentValue: string
): ChatKitConfig {
  // If using workflow, field context will be passed as message content
  if (chatKitConfig.useWorkflow) {
    return {
      ...chatKitConfig
    };
  }
  
  // For chat completions, enhance system prompt with context
  const contextualPrompt = `${chatKitConfig.systemPrompt}

CURRENT FIELD CONTEXT:
- Field: ${fieldLabel}
- Current Value: ${currentValue || '(empty)'}

Please provide suggestions specifically for this field.`;

  return {
    ...chatKitConfig,
    systemPrompt: contextualPrompt
  };
}

/**
 * Get current model being used
 */
export function getCurrentModel(): string {
  if (chatKitConfig.useWorkflow) {
    return 'workflow:' + (chatKitConfig.workflowId?.substring(0, 8) || 'unknown');
  }
  return chatKitConfig.model || 'gpt-4o-mini';
}

/**
 * Check if API key is valid format
 * NOTE: Domain keys (domain_pk_*) only work with Realtime/Responses APIs
 * For Chat Completions API, use service account keys (sk-svcacct-*) or project keys (sk-proj-*)
 */
export function validateApiKey(key: string): boolean {
  const isValid = (key.startsWith('sk-') || key.startsWith('domain_pk_')) && key.length > 20;
  
  // Warn if using domain key with Chat Completions
  if (key.startsWith('domain_pk_') && chatKitConfig.useWorkflow === false) {
    console.warn('[ChatKit] ⚠️ Domain keys only work with Realtime/Responses APIs, not Chat Completions. Use sk-svcacct-* or sk-proj-* key instead.');
  }
  
  return isValid;
}

/**
 * Check if workflow ID is valid format
 */
export function validateWorkflowId(id: string): boolean {
  return id.length > 10; // Workflow IDs are typically long strings
}

export default chatKitConfig;
