/**
 * OpenAI ChatKit Debugging Utility
 * Comprehensive testing and debugging for OpenAI ChatKit (OpenAI Hosted mode)
 */

import { isChatKitConfigured, getCurrentModel, validateApiKey, isUsingWorkflow, getWorkflowId } from './openai-chatkit-config';

/**
 * Get detailed configuration information
 */
export function getDebugInfo() {
  const useWorkflow = isUsingWorkflow();
  const workflowId = getWorkflowId();
  
  const info = {
    environment: {
      hasImportMeta: typeof import.meta !== 'undefined',
      hasEnv: typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined',
      apiKeyExists: false,
      apiKeyValue: 'NOT_SET',
      apiKeyValid: false,
      workflowIdExists: !!workflowId,
      workflowIdValue: workflowId ? workflowId.substring(0, 16) + '...' : 'NOT_SET',
      isConfigured: false,
      model: 'unknown',
      mode: useWorkflow ? 'Workflow (OpenAI Hosted)' : 'Chat Completions (OpenAI Hosted)',
      usingWorkflow: useWorkflow
    },
    timestamp: new Date().toISOString()
  };

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    info.environment.apiKeyExists = !!import.meta.env.VITE_OPENAI_API_KEY;
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      const key = import.meta.env.VITE_OPENAI_API_KEY;
      // Show only first and last 4 characters for security
      info.environment.apiKeyValue = key.length > 8 
        ? `${key.substring(0, 7)}...${key.substring(key.length - 4)}`
        : 'TOO_SHORT';
      info.environment.apiKeyValid = validateApiKey(key);
    }
  }

  info.environment.isConfigured = isChatKitConfigured();
  
  try {
    info.environment.model = getCurrentModel();
  } catch (e) {
    // Model not available yet
  }

  return info;
}

/**
 * Print debug information to console
 */
export function printDebugInfo() {
  const info = getDebugInfo();
  
  console.group('🔍 OpenAI ChatKit - Debug Info');
  console.log('Environment Check:');
  console.table(info.environment);
  
  console.log('\n📋 Checklist:');
  console.log(`✓ import.meta available: ${info.environment.hasImportMeta ? '✅' : '❌'}`);
  console.log(`✓ import.meta.env available: ${info.environment.hasEnv ? '✅' : '❌'}`);
  console.log(`✓ API key exists: ${info.environment.apiKeyExists ? '✅' : '❌'}`);
  console.log(`✓ API key valid format: ${info.environment.apiKeyValid ? '✅' : '❌'}`);
  console.log(`✓ API key configured: ${info.environment.isConfigured ? '✅' : '❌'}`);
  console.log(`✓ Workflow ID exists: ${info.environment.workflowIdExists ? '✅' : '⭕ (optional)'}`);
  console.log(`✓ Model/Workflow: ${info.environment.model}`);
  console.log(`✓ Mode: ${info.environment.mode}`);
  
  if (info.environment.apiKeyExists) {
    console.log(`\n🔑 API Key Preview: ${info.environment.apiKeyValue}`);
  }
  
  if (info.environment.workflowIdExists) {
    console.log(`📋 Workflow ID Preview: ${info.environment.workflowIdValue}`);
  }
  
  if (!info.environment.isConfigured) {
    console.log('\n⚠️ Issues Found:');
    if (!info.environment.hasImportMeta) {
      console.log('- import.meta is not available (check your build tool)');
    }
    if (!info.environment.hasEnv) {
      console.log('- import.meta.env is not available (check Vite configuration)');
    }
    if (!info.environment.apiKeyExists) {
      console.log('- VITE_OPENAI_API_KEY is not set in environment');
      console.log('  Solution: Create .env file with: VITE_OPENAI_API_KEY=sk-your-key');
    }
    if (info.environment.apiKeyExists && !info.environment.apiKeyValid) {
      console.log('- API key format is invalid (should start with sk-)');
    }
    
    console.log('\n💡 Quick Fix:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add: VITE_OPENAI_API_KEY=sk-your-actual-key-here');
    console.log('3. Restart your development server');
  } else {
    console.log('\n✅ Configuration looks good!');
    if (info.environment.usingWorkflow) {
      console.log(`📦 Using: ChatKit Workflow Mode`);
      console.log(`🔧 Workflow: ${info.environment.workflowIdValue}`);
    } else {
      console.log(`📦 Using: ChatKit (OpenAI Hosted) with ${info.environment.model}`);
      console.log(`💡 Tip: Set VITE_OPENAI_WORKFLOW_ID to use Workflow mode`);
    }
  }
  
  console.log(`\n⏰ Generated: ${info.timestamp}`);
  console.groupEnd();
  
  return info;
}

/**
 * Test API connection with detailed error reporting
 */
export async function testConnectionDetailed() {
  console.group('🧪 Testing OpenAI ChatKit (OpenAI Hosted Mode)');
  
  // Step 1: Configuration check
  console.log('\n📌 Step 1: Configuration Check');
  const debugInfo = getDebugInfo();
  
  if (!debugInfo.environment.isConfigured) {
    console.error('❌ Configuration check failed');
    console.log('Run chatKitDebug.printInfo() for details');
    console.groupEnd();
    return false;
  }
  console.log('✅ Configuration is valid');
  console.log(`📊 Model: ${debugInfo.environment.model}`);
  console.log(`🏠 Mode: ${debugInfo.environment.mode}`);
  
  // Step 2: Import configuration
  console.log('\n📌 Step 2: Loading ChatKit Configuration');
  let config;
  try {
    const configModule = await import('./openai-chatkit-config');
    config = configModule.getChatKitConfigWithContext('Test Field', 'Test Value');
    console.log('✅ Configuration loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    console.groupEnd();
    return false;
  }
  
  // Step 3: Test connection
  console.log('\n📌 Step 3: Testing API Connection');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hi from ChatKit!" to confirm you are working.' }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API request failed');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      
      // Detailed error analysis
      if (response.status === 401) {
        console.log('\n💡 Diagnosis: Invalid API Key');
        console.log('- Your API key is not valid or has been revoked');
        console.log('- Get a new key from: https://platform.openai.com/api-keys');
      } else if (response.status === 429) {
        console.log('\n💡 Diagnosis: Rate Limit');
        console.log('- You have exceeded your rate limit');
        console.log('- Wait a moment and try again');
      } else if (response.status === 403) {
        console.log('\n💡 Diagnosis: Forbidden');
        console.log('- Your account may not have access');
        console.log('- Check your OpenAI account tier and credits');
      } else {
        console.log('\n💡 Diagnosis: API Error');
        console.log('- Check OpenAI status: https://status.openai.com');
        console.log('- Verify your account: https://platform.openai.com/account');
      }
      
      console.groupEnd();
      return false;
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    console.log(`✅ Received response: "${message}"`);
  } catch (error: any) {
    console.error('❌ Failed to send message');
    console.error('Error:', error);
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      console.log('\n💡 Diagnosis: Network Error');
      console.log('- Check your internet connection');
      console.log('- Check if OpenAI API is accessible');
    }
    
    console.groupEnd();
    return false;
  }
  
  // All tests passed
  console.log('\n\n🎉 All Tests Passed!');
  console.log('Your OpenAI ChatKit (OpenAI Hosted) integration is working correctly.');
  console.groupEnd();
  
  return true;
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).chatKitDebug = {
    getInfo: getDebugInfo,
    printInfo: printDebugInfo,
    testDetailed: testConnectionDetailed
  };
  
  // Keep old name for backwards compatibility
  (window as any).openaiDebug = (window as any).chatKitDebug;
  
  console.log('🔧 ChatKit Debug Tools Available:');
  console.log('  chatKitDebug.printInfo()    - Show configuration details');
  console.log('  chatKitDebug.testDetailed() - Run comprehensive test');
  console.log('  chatKitDebug.getInfo()      - Get debug data object');
  console.log('');
  console.log('  (Also available as openaiDebug.* for backwards compatibility)');
}
