# 🤖 AI Agent Integration - Chat Completions API

Complete guide for the AI Agent feature using OpenAI's Chat Completions API (ChatKit).

---

## 📖 Overview

The AI Agent is integrated into the CMS to help users create professional content for their digital business cards. It uses **OpenAI's Chat Completions API** for fast, reliable responses.

### ✨ Features

- **Context-aware assistance**: AI understands which field you're editing
- **Conversation history**: Maintains context across messages
- **Apply suggestions**: Click to apply AI suggestions directly to fields
- **Smart prompts**: Pre-built prompts for different field types
- **Real-time chat**: Instant responses with loading indicators

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
openaiDebug.printInfo()    // Check configuration
openaiDebug.testDetailed() // Test connection
```

### 🐛 Not Working?
Quick fix guide: [DEBUG_QUICK_START.md](./DEBUG_QUICK_START.md)

📖 **Detailed guides**: 
- Setup: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- Debug: [DEBUGGING.md](./DEBUGGING.md)

---

## 🏗️ Architecture

### API Used
**Chat Completions API** (not Assistants API)
- Endpoint: `/v1/chat/completions`
- Model: `gpt-4o-mini` (configurable)
- Simple request/response pattern
- No threads, no runs, no polling

### Why Chat Completions?

✅ **Simpler**: One API call instead of 4-5  
✅ **Faster**: Immediate responses  
✅ **More reliable**: Fewer points of failure  
✅ **Easier to debug**: Clear error messages  
✅ **Cost-effective**: Pay per token, no overhead  

---

## 📁 File Structure

```
/utils/
  ├── openai-service.ts        # Core API integration
  ├── openai-test.ts           # Basic connection test
  ├── openai-debug.ts          # Advanced debugging
  └── openai-status-display.ts # Console status indicator

/components/cms/
  └── AIAssistant.tsx          # Chat UI component
```

---

## 🔧 How It Works

### 1. User Opens AI Agent
```
User clicks AI icon → AIAssistant component mounts
```

### 2. Configuration Check
```typescript
isConfigured() // Checks if VITE_OPENAI_API_KEY is set
```

### 3. User Sends Message
```typescript
sendMessageAndGetResponse(
  conversationHistory,  // Previous messages
  newMessage,           // User's new message
  fieldContext          // Current field info
)
```

### 4. API Request
```
POST /v1/chat/completions
{
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant..." },
    { role: "user", content: "Help me write a bio" },
    { role: "assistant", content: "I'd be happy to help..." },
    { role: "user", content: "Make it more professional" }
  ]
}
```

### 5. Display Response
```
Response → UI → User can apply to field
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

## ⚙️ Configuration

### Change Model

Edit `/utils/openai-service.ts`:

```typescript
const MODEL = 'gpt-4o';  // or 'gpt-4o-mini', 'gpt-3.5-turbo'
```

### Customize System Prompt

Edit the `SYSTEM_PROMPT` constant in `/utils/openai-service.ts`:

```typescript
const SYSTEM_PROMPT = `You are a helpful AI assistant...`;
```

### Adjust Temperature

In `sendMessageAndGetResponse()`:

```typescript
temperature: 0.7,  // 0.0 = deterministic, 2.0 = creative
```

---

## 🧪 Testing

### Quick Test
```javascript
testOpenAIConnection()
```

### Detailed Test
```javascript
openaiDebug.testDetailed()
```

### Check Configuration
```javascript
openaiDebug.printInfo()
```

### Manual Test
```javascript
const response = await sendMessageAndGetResponse(
  [],
  "Say hello"
);
console.log(response);
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
   openaiDebug.printInfo()
   ```

2. **Test connection**:
   ```javascript
   openaiDebug.testDetailed()
   ```

3. **Check console logs**:
   - Look for `[OpenAI]` prefixed messages
   - Check where the flow stops

4. **Verify API key**:
   - https://platform.openai.com/api-keys
   - Ensure it's active and has credits

Full debugging guide: [DEBUGGING.md](./DEBUGGING.md)

---

## 💰 Cost Management

### Pricing (Nov 2024)

**GPT-4o-mini**:
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
- Use in client-side only apps (without server)

### Note
This implementation calls OpenAI directly from the client. For production apps, consider using a backend API to hide your key.

---

## 📚 API Reference

### `sendMessageAndGetResponse()`

```typescript
async function sendMessageAndGetResponse(
  conversationHistory: Message[],
  newMessage: string,
  fieldContext?: {
    label: string;
    currentValue: string;
  }
): Promise<string>
```

**Parameters**:
- `conversationHistory`: Previous messages in the conversation
- `newMessage`: User's new message
- `fieldContext`: Optional field information for context

**Returns**: Assistant's response text

### `createThread()`

```typescript
async function createThread(): Promise<string>
```

Creates a local conversation ID (for UI state management only).

**Returns**: Local thread ID

### `isConfigured()`

```typescript
function isConfigured(): boolean
```

Checks if API key is configured.

**Returns**: `true` if configured, `false` otherwise

### `getCurrentModel()`

```typescript
function getCurrentModel(): string
```

Gets the current model name.

**Returns**: Model name (e.g., "gpt-4o-mini")

---

## 🎓 Best Practices

### 1. Context Management
```typescript
// Include field context for better responses
sendMessageAndGetResponse(
  messages,
  userMessage,
  {
    label: "Professional Bio",
    currentValue: currentBio
  }
);
```

### 2. Error Handling
```typescript
try {
  const response = await sendMessageAndGetResponse(...);
} catch (error) {
  console.error('AI Error:', error);
  toast.error('Failed to get response');
}
```

### 3. Loading States
```typescript
setIsLoading(true);
try {
  const response = await sendMessageAndGetResponse(...);
} finally {
  setIsLoading(false);
}
```

### 4. Optimistic Updates
```typescript
// Add user message to UI immediately
setMessages(prev => [...prev, newUserMessage]);

// Then get AI response
const response = await sendMessageAndGetResponse(...);
```

---

## 🔄 Migration from Assistants API

If you were using the Assistants API before:

### What Changed
- ❌ No more threads endpoint
- ❌ No more runs/polling
- ✅ Single API call
- ✅ Immediate responses
- ✅ Simpler code

### What Stayed the Same
- ✅ Same UI/UX
- ✅ Same conversation history
- ✅ Same message format
- ✅ Same field context

### Benefits
- 🚀 Faster responses
- 💰 Lower costs
- 🐛 Easier debugging
- 📉 Fewer errors

---

## 📞 Support

### Resources
- OpenAI Docs: https://platform.openai.com/docs
- API Status: https://status.openai.com
- Pricing: https://openai.com/pricing

### Internal Docs
- [Setup Checklist](./SETUP_CHECKLIST.md)
- [Debug Quick Start](./DEBUG_QUICK_START.md)
- [Full Debugging Guide](./DEBUGGING.md)

---

**Last Updated**: November 4, 2025  
**API**: Chat Completions API  
**Model**: GPT-4o-mini
