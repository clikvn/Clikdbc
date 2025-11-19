# 🤖 AI Agent Integration - OpenAI ChatKit (Hosted Mode)

Complete guide for the AI Agent feature using OpenAI's ChatKit in OpenAI Hosted mode.

---

## 📖 Overview

The AI Agent is integrated into the CMS using **OpenAI's ChatKit** framework in **OpenAI Hosted mode**. This provides a streamlined, production-ready chat experience powered by OpenAI's infrastructure.

### ✨ Features

- **Context-aware assistance**: AI understands which field you're editing
- **Conversation history**: Maintains context across messages  
- **Apply suggestions**: Click to apply AI suggestions directly to fields
- **Smart prompts**: Pre-built prompts for different field types
- **Real-time chat**: Instant responses with loading indicators
- **OpenAI Hosted**: Backend managed by OpenAI

---

## 🏗️ What is OpenAI Hosted Mode?

**OpenAI Hosted** is one of two modes available with ChatKit:

### OpenAI Hosted (Current) ✅
- OpenAI manages the backend infrastructure
- Direct API calls to OpenAI's Chat Completions endpoint
- Simple configuration with API key
- No backend server needed
- Fastest time to deployment

### Self Hosted (Alternative)
- You manage your own backend server
- More control over data flow
- Can implement custom logic
- Requires additional infrastructure

**We're using OpenAI Hosted** for simplicity and reliability.

---

## ⚡ Quick Start

### 1️⃣ Get API Key
Visit: https://platform.openai.com/api-keys

### 2️⃣ Create `.env` file
```bash
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

### 3️⃣ Restart server
```bash
npm run dev
```

**Done!** 🎉 

### 🧪 Test It
Open browser console (F12) and run:
```javascript
chatKitDebug.printInfo()    // Check configuration
chatKitDebug.testDetailed() // Test connection
```

### 🐛 Not Working?
Run diagnostics:
```javascript
chatKitDebug.printInfo()
```

---

## 📁 File Structure

```
/utils/
  ├── openai-chatkit-config.ts # ChatKit configuration
  ├── openai-test.ts           # Connection test
  ├── openai-debug.ts          # Advanced debugging
  └── openai-status-display.ts # Console status

/components/cms/
  └── AIAssistant.tsx          # Chat UI component
```

---

## 🔧 How It Works

### 1. Configuration
```typescript
// openai-chatkit-config.ts
export const chatKitConfig = {
  apiKey: VITE_OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  temperature: 0.7,
  systemPrompt: '...'
};
```

### 2. Field Context
```typescript
getChatKitConfigWithContext(fieldLabel, currentValue)
// Returns config with field-specific context
```

### 3. API Call (OpenAI Hosted)
```
POST https://api.openai.com/v1/chat/completions
{
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." }
  ]
}
```

### 4. Response Handling
```
Response → UI → User can apply to field
```

---

## ⚙️ Configuration

### Change Model

Edit `/utils/openai-chatkit-config.ts`:

```typescript
export const chatKitConfig: ChatKitConfig = {
  apiKey: OPENAI_API_KEY,
  model: 'gpt-4o', // or 'gpt-4o-mini', 'gpt-3.5-turbo'
  temperature: 0.7,
  systemPrompt: `...`
};
```

### Customize System Prompt

Edit the `systemPrompt` in the config:

```typescript
systemPrompt: `You are a helpful AI assistant for [your specific use case]...`
```

### Adjust Creativity

```typescript
temperature: 0.9, // 0.0 = consistent, 2.0 = creative
```

---

## 🧪 Testing

### Quick Test
```javascript
testChatKitConnection()
// or
testOpenAIConnection() // Backwards compatible
```

### Detailed Test
```javascript
chatKitDebug.testDetailed()
```

### Check Configuration
```javascript
chatKitDebug.printInfo()
```

### Manual Test
```javascript
const config = await import('/utils/openai-chatkit-config');
const chatConfig = config.getChatKitConfigWithContext('Test', 'value');
console.log(chatConfig);
```

---

## 🎯 Usage Example

```typescript
// In your form component
import { AIAssistant } from './components/cms/AIAssistant';

<AIAssistant
  fieldLabel="Professional Bio"
  currentValue={formData.bio}
  onApply={(value) => setFormData({ ...formData, bio: value })}
  initialMessage="Help me write a compelling bio"
/>
```

---

## 🚨 Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| "API key not configured" | Create `.env`, add key, restart server |
| "Invalid API key" | Get new key from OpenAI dashboard |
| "Rate limit exceeded" | Wait 1 minute, try again |
| "Network error" | Check internet connection |

### Debug Steps

1. **Check configuration**:
   ```javascript
   chatKitDebug.printInfo()
   ```

2. **Test connection**:
   ```javascript
   chatKitDebug.testDetailed()
   ```

3. **Check console logs**:
   - Look for `[ChatKit]` prefixed messages
   - Check where the flow stops

4. **Verify API key**:
   - https://platform.openai.com/api-keys
   - Ensure it's active and has credits

---

## 💰 Cost Management

### Pricing (Nov 2024)

**GPT-4o-mini** (Default):
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**GPT-4o**:
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

### Typical Usage

- Average message: ~500 tokens total
- 100 messages ≈ $0.03 (gpt-4o-mini)
- 100 messages ≈ $0.50 (gpt-4o)

### Monitor Usage

https://platform.openai.com/usage

---

## 🔒 Security

### API Key Protection

✅ **DO**:
- Store in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Rotate keys regularly

❌ **DON'T**:
- Commit keys to git
- Share keys publicly
- Hardcode in source
- Use in production without rate limiting

### Production Considerations

This implementation calls OpenAI directly from the client (OpenAI Hosted mode). 

**For production**, consider:
- Implementing rate limiting
- Adding user authentication
- Monitoring usage per user
- Setting up usage alerts

Or switch to **Self Hosted mode** with a backend API to:
- Hide your API key completely
- Implement custom business logic
- Add additional security layers
- Control costs more precisely

---

## 📚 API Reference

### `isChatKitConfigured()`

```typescript
function isChatKitConfigured(): boolean
```

Checks if API key is configured.

**Returns**: `true` if configured, `false` otherwise

### `getChatKitConfigWithContext()`

```typescript
function getChatKitConfigWithContext(
  fieldLabel: string,
  currentValue: string
): ChatKitConfig
```

Gets configuration with field context.

**Parameters**:
- `fieldLabel`: Name of the field being edited
- `currentValue`: Current field value

**Returns**: ChatKit configuration object

### `getCurrentModel()`

```typescript
function getCurrentModel(): string
```

Gets the current model name.

**Returns**: Model name (e.g., "gpt-4o-mini")

### `validateApiKey()`

```typescript
function validateApiKey(key: string): boolean
```

Validates API key format.

**Returns**: `true` if valid format, `false` otherwise

---

## 🎓 Best Practices

### 1. Field Context
```typescript
// Always provide field context for better responses
const config = getChatKitConfigWithContext(
  "Professional Bio",
  currentBioValue
);
```

### 2. Error Handling
```typescript
try {
  const response = await fetch(...);
} catch (error) {
  console.error('[ChatKit] Error:', error);
  toast.error('Failed to get response');
}
```

### 3. Loading States
```typescript
setIsLoading(true);
try {
  // API call
} finally {
  setIsLoading(false);
}
```

### 4. Optimistic Updates
```typescript
// Add user message to UI immediately
setMessages(prev => [...prev, newUserMessage]);
// Then get AI response
```

---

## 🌟 Why ChatKit?

### Advantages

✅ **Production Ready**: Built by OpenAI for production use  
✅ **OpenAI Hosted**: No backend infrastructure needed  
✅ **Best Practices**: Follows OpenAI's recommended patterns  
✅ **Simple Integration**: Minimal configuration required  
✅ **Reliable**: Backed by OpenAI's infrastructure  

### ChatKit vs Custom Implementation

| Feature | ChatKit | Custom |
|---------|---------|--------|
| Setup Time | Minutes | Hours |
| Maintenance | Low | High |
| Best Practices | Built-in | Manual |
| Updates | Automatic | Manual |
| Support | OpenAI | Self |

---

## 📞 Support

### Resources
- OpenAI ChatKit Docs: https://platform.openai.com/docs/guides/chatkit
- OpenAI API Docs: https://platform.openai.com/docs
- API Status: https://status.openai.com
- Pricing: https://openai.com/pricing

### Debug Commands
```javascript
chatKitDebug.printInfo()    // Configuration details
chatKitDebug.testDetailed() // Full connection test
testChatKitConnection()     // Quick test
```

---

## 🔄 Migration Notes

If migrating from previous implementation:

### What Changed
- ✅ New configuration file: `openai-chatkit-config.ts`
- ✅ Updated debug commands: `chatKitDebug.*`
- ✅ Same UI/UX experience
- ✅ Same `.env` variable name

### What Stayed the Same
- ✅ API key setup (still `VITE_OPENAI_API_KEY`)
- ✅ Component usage (same props)
- ✅ User interface
- ✅ Features and functionality

### Benefits
- 🎯 Following OpenAI's official patterns
- 📚 Better documentation
- 🔧 Easier to maintain
- 🚀 Future-proof

---

**Last Updated**: November 4, 2025  
**Framework**: OpenAI ChatKit  
**Mode**: OpenAI Hosted  
**Model**: GPT-4o-mini
