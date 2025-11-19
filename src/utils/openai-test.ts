/**
 * OpenAI ChatKit Connection Test Utility
 * Provides simple console commands to test the ChatKit OpenAI Hosted mode
 */

import { isChatKitConfigured, getCurrentModel, getChatKitConfigWithContext } from './openai-chatkit-config';

/**
 * Test the OpenAI ChatKit connection
 */
async function testChatKitConnection() {
  console.group('🧪 Testing OpenAI ChatKit (Hosted Mode)');
  
  console.log('1️⃣ Checking configuration...');
  const configured = isChatKitConfigured();
  
  if (!configured) {
    console.error('❌ API key not configured');
    console.log('\n📝 To fix this:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add: VITE_OPENAI_API_KEY=sk-your-actual-key-here');
    console.log('3. Restart your development server');
    console.log('\n💡 Get your API key from: https://platform.openai.com/api-keys');
    console.groupEnd();
    return false;
  }
  
  console.log('✅ API key is configured');
  console.log(`📊 Using model: ${getCurrentModel()}`);
  console.log('🏠 Mode: OpenAI Hosted (ChatKit)');
  
  console.log('\n2️⃣ Testing connection...');
  
  try {
    const config = getChatKitConfigWithContext('Test Field', 'Test Value');
    
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
          { role: 'user', content: 'Say "Hello from ChatKit!" to confirm you are working.' }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ API request failed:', response.status, error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    
    console.log(`✅ Received response: "${message}"`);
    console.log('\n✅ Success! Your OpenAI ChatKit is working!');
    console.log('🎉 You can now use the AI Agent in your CMS');
    
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    console.log('Check the error messages above for details');
    console.groupEnd();
    return false;
  }
}

// Make the test function available globally
if (typeof window !== 'undefined') {
  (window as any).testChatKitConnection = testChatKitConnection;
  // Keep old name for backwards compatibility
  (window as any).testOpenAIConnection = testChatKitConnection;
  console.log('💡 Test commands available:');
  console.log('  testChatKitConnection() or testOpenAIConnection()');
}

export { testChatKitConnection };
