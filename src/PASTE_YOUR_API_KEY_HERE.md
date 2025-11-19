# 🔑 Paste Your OpenAI API Key Here

**For Figma Make**: Since `.env` files aren't supported, we hardcode the API key directly in the code.

---

## ✅ Quick Setup (30 seconds)

### Step 1: Get Your OpenAI API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Sign in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...` or `sk-svcacct-...`)

---

### Step 2: Paste Key in Config File

1. **Open**: `/utils/openai-chatkit-config.ts`

2. **Find lines 17-18** (near the top):

```typescript
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';  // 👈 Paste your key here
const OPENAI_WORKFLOW_ID = '';  // 👈 (Optional) Paste workflow ID here
```

3. **Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key**:

```typescript
const OPENAI_API_KEY = 'sk-proj-abc123xyz789...';  // ✅ Your real key
const OPENAI_WORKFLOW_ID = '';  // Leave empty for now
```

4. **Save the file** 💾

5. **Done!** The AI Agent will work now! 🎉

---

## 🎯 Example

### Before (Not Working):
```typescript
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';  // ❌
const OPENAI_WORKFLOW_ID = '';
```

### After (Working):
```typescript
const OPENAI_API_KEY = 'sk-proj-abc123xyz789YOUR_REAL_KEY_HERE';  // ✅
const OPENAI_WORKFLOW_ID = '';
```

---

## 🔄 Optional: Add Workflow ID

If you want to use your custom workflow (`wf_6909b0c869d081909617dcfc3bce6e2b0d212bc4b2d28342`):

```typescript
const OPENAI_API_KEY = 'sk-proj-abc123...';  // Your API key
const OPENAI_WORKFLOW_ID = 'wf_6909b0c869d081909617dcfc3bce6e2b0d212bc4b2d28342';  // ✅ Your workflow
```

**Without workflow**: Uses GPT-4 mini (cheaper) ✅  
**With workflow**: Uses your custom workflow (advanced) ✅

---

## ✅ Test It

After saving:

1. Open AI Agent (click "Personal AI" card in `/my_profile`)
2. Type: **"Hello!"**
3. Press **Enter**
4. 🎉 **You should get a response!**

---

## 🐛 Still Not Working?

### Check the key format:

**✅ Correct**:
```typescript
const OPENAI_API_KEY = 'sk-proj-abc123xyz...';
```

**❌ Wrong** (common mistakes):
```typescript
const OPENAI_API_KEY = "sk-proj-abc123...";  // Don't use double quotes
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';  // Forgot to replace
const OPENAI_API_KEY = ' sk-proj-abc123... ';  // Extra spaces
```

### Debug in console (F12):

```javascript
// Check if key is loaded
console.log('API Key:', OPENAI_API_KEY.substring(0, 10) + '...')
```

Should show: `sk-proj-ab...` ✅

---

## 📍 Where is the file?

**Path**: `/utils/openai-chatkit-config.ts`

**Lines to edit**: 17-18 (near the top of the file)

**Look for**:
```typescript
// ⚙️ HARDCODED CONFIGURATION FOR FIGMA MAKE
// Paste your OpenAI API key and workflow ID here:

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';  // 👈 HERE!
```

---

## ⚠️ Security Note

**For production apps**: Never hardcode API keys!  
**For Figma Make testing**: This is fine ✅

When you deploy for real users, use proper environment variables or backend proxies.

---

## ✅ Checklist

- [ ] Get API key from platform.openai.com/api-keys
- [ ] Open `/utils/openai-chatkit-config.ts`
- [ ] Find line 17
- [ ] Replace `'YOUR_OPENAI_API_KEY_HERE'` with your key
- [ ] Save file
- [ ] Test AI Agent
- [ ] ✅ It works!

---

**Current Status**: ⏳ Waiting for API key  
**File to edit**: `/utils/openai-chatkit-config.ts`  
**Lines**: 17-18  
**Time**: 30 seconds to fix! 🚀
