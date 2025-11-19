/**
 * OpenAI ChatKit Configuration Status Display
 * Shows a small status indicator in the console on page load
 */

import { isChatKitConfigured, getCurrentModel } from './openai-chatkit-config';

function displayStatus() {
  const configured = isChatKitConfigured();
  
  if (configured) {
    console.log(
      '%c✅ OpenAI ChatKit Ready',
      'background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;'
    );
    console.log('%cYour AI Agent is configured and ready to use!', 'color: #10b981; font-size: 12px;');
    console.log(`%cMode: OpenAI Hosted (ChatKit)`, 'color: #6b7280; font-size: 11px;');
    console.log(`%cModel: ${getCurrentModel()}`, 'color: #6b7280; font-size: 11px;');
  } else {
    console.log(
      '%c⚠️ OpenAI ChatKit Not Configured',
      'background: #ef4444; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;'
    );
    console.log('%cAPI key not found. AI Agent will not work.', 'color: #ef4444; font-size: 12px;');
    console.log('%cQuick fix: chatKitDebug.printInfo()', 'color: #6b7280; font-size: 11px;');
  }
  
  // Show available commands
  console.log('\n%c🔧 Debug Commands:', 'font-weight: bold; font-size: 12px;');
  console.log('%c  chatKitDebug.printInfo()    %c- Check configuration', 'color: #3b82f6; font-family: monospace;', 'color: #6b7280;');
  console.log('%c  chatKitDebug.testDetailed() %c- Test connection', 'color: #3b82f6; font-family: monospace;', 'color: #6b7280;');
  console.log('%c  testChatKitConnection()     %c- Quick test', 'color: #3b82f6; font-family: monospace;', 'color: #6b7280;');
  console.log('');
}

// Run on load
if (typeof window !== 'undefined') {
  // Show status after a brief delay to let other logs settle
  setTimeout(displayStatus, 100);
}

export { displayStatus };
