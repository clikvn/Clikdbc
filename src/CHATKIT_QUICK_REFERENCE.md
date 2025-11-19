# 🚀 ChatKit Quick Reference Card

**1-Page Guide for OpenAI ChatKit (Hosted Mode)**

---

## ⚡ Quick Setup

```bash
# 1. Create .env file
echo "VITE_OPENAI_API_KEY=sk-your-key-here" > .env

# 2. Restart server
npm run dev

# 3. Test in browser console (F12)
chatKitDebug.printInfo()
```

✅ **Done!** If you see green checkmarks, you're ready!

---

## 🔧 Console Commands

```javascript
// Check configuration
chatKitDebug.printInfo()

// Test connection (detailed)
chatKitDebug.testDetailed()

// Quick test
testChatKitConnection()
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/utils/openai-chatkit-config.ts` | Configuration |
| `/components/cms/AIAssistant.tsx` | Chat component |
| `/utils/openai-debug.ts` | Debug tools |

---

## ⚙️ Configuration

**File**: `/utils/openai-chatkit-config.ts`

```typescript
export const chatKitConfig = {
  apiKey: VITE_OPENAI_API_KEY,
  model: 'gpt-4o-mini',      // Change model here
  temperature: 0.7,          // Adjust creativity (0-2)
  systemPrompt: '...'        // Customize instructions
};
```

---

## 🎯 Usage

```typescript
import { AIAssistant } from './components/cms/AIAssistant';

<AIAssistant
  fieldLabel="Bio"
  currentValue={bio}
  onApply={(value) => setBio(value)}
/>
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| ⚠️ Red status | Create `.env` + restart |
| ❌ Invalid key | Get new key: platform.openai.com/api-keys |
| 🚫 Rate limit | Wait 60 seconds |
| 📡 Network error | Check internet |

---

## 💰 Costs

**Model**: gpt-4o-mini (default)
- **1 message**: ~$0.0003
- **100 messages**: ~$0.03  
- **1000 messages**: ~$0.30

**Monitor**: platform.openai.com/usage

---

## 🔒 Security Checklist

- ✅ API key in `.env`
- ✅ `.env` in `.gitignore`
- ⚠️ Client-side API calls (consider backend for prod)
- 💡 Set usage limits on OpenAI dashboard

---

## 📊 What is OpenAI Hosted?

**OpenAI Hosted** = OpenAI manages the backend

✅ No backend needed  
✅ Direct API calls  
✅ Production ready  
✅ Auto-scaling  

vs **Self Hosted** = You manage backend (more control, more work)

---

## 🧪 Testing Checklist

Run these in browser console:

```javascript
// 1. Configuration
chatKitDebug.printInfo()
// Should show all ✅

// 2. Connection
chatKitDebug.testDetailed()
// Should pass all steps

// 3. In CMS
// - Go to /my_profile
// - Click AI icon ✨
// - Send a message
// - Should get response
```

---

## 📚 Documentation

- **Complete Guide**: [CHATKIT_README.md](./CHATKIT_README.md)
- **Implementation**: [CHATKIT_IMPLEMENTATION_SUMMARY.md](./CHATKIT_IMPLEMENTATION_SUMMARY.md)
- **OpenAI Docs**: https://platform.openai.com/docs/guides/chatkit

---

## 🎓 Common Tasks

### Change Model
```typescript
// In openai-chatkit-config.ts
model: 'gpt-4o' // More powerful, costs more
```

### Adjust Creativity
```typescript
temperature: 0.9 // More creative
temperature: 0.3 // More focused
```

### Customize Prompt
```typescript
systemPrompt: `Your custom instructions...`
```

---

## 📞 Get Help

**Having issues?**

1. `chatKitDebug.printInfo()` - See what's wrong
2. `chatKitDebug.testDetailed()` - Detailed test
3. Read [CHATKIT_README.md](./CHATKIT_README.md)
4. Check OpenAI status: status.openai.com

---

## ✅ Success Indicators

**You're all set when:**
- ✅ Green status in console
- ✅ `chatKitDebug.printInfo()` shows all ✅
- ✅ `chatKitDebug.testDetailed()` passes
- ✅ Can chat with AI in CMS

---

## 🚀 Production Checklist

Before going live:

- [ ] Set OpenAI usage limits
- [ ] Add rate limiting (optional)
- [ ] Implement user auth (optional)
- [ ] Set up cost monitoring
- [ ] Consider Self Hosted mode for max security

---

**Framework**: OpenAI ChatKit  
**Mode**: OpenAI Hosted  
**Model**: gpt-4o-mini  
**Status**: ✅ Ready to Use
