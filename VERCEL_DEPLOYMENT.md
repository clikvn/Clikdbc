# Vercel Deployment Guide

This guide will help you deploy your Digital Business Card application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- An OpenAI API key (if using AI features)

## Quick Deployment Steps

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select the repository containing this project

### 2. Configure Build Settings

Vercel should auto-detect the framework (Vite), but verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

These settings are automatically configured in `vercel.json`.

### 3. Add Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required (for AI features):
- **Name**: `VITE_OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk-`)
- Get it from: https://platform.openai.com/api-keys

#### Optional:
- **Name**: `VITE_OPENAI_WORKFLOW_ID`
- **Value**: Your OpenAI Workflow ID (leave empty to use Chat Completions API)

**Note**: Make sure to add these to all environments (Production, Preview, Development).

### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `https://your-project.vercel.app`

## Post-Deployment

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Follow the DNS configuration instructions

### Environment Variables Update

To update environment variables after deployment:

1. Go to **Settings** → **Environment Variables**
2. Update or add variables
3. Redeploy the project for changes to take effect

## Architecture Notes

### Client-Side Storage

This application uses browser localStorage for:
- Business card data
- User profiles
- AI conversation history

**Important**: Data is stored locally in the user's browser and is not synchronized across devices.

### API Security

**⚠️ Security Warning**: The OpenAI API key is included in the client-side bundle. For production apps with multiple users, consider:

1. **Backend Proxy**: Create a backend API to handle OpenAI requests
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Domain Restrictions**: Use domain-restricted API keys if available

For personal/internal use, the current implementation is acceptable.

## Build Optimization

The project is configured with:

- **Code Splitting**: React and UI libraries are split into separate chunks
- **Minification**: Terser minification for smaller bundle sizes
- **No Source Maps**: Source maps disabled in production for security
- **Asset Caching**: Static assets cached for 1 year

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found errors
**Solution**: 
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check that all imports use correct paths

### Environment Variables Not Working

**Issue**: AI features don't work after deployment
**Solution**:
- Verify `VITE_OPENAI_API_KEY` is set in Vercel
- Environment variable names must start with `VITE_`
- Redeploy after adding environment variables

### 404 on Refresh

**Issue**: Page shows 404 when refreshing on non-root routes
**Solution**: 
- Verify `vercel.json` is in the root directory
- Check that the rewrite rule is present (automatically configured)

### Images Not Loading

**Issue**: Images from assets folder not displaying
**Solution**:
- Ensure images are in `src/assets/`
- Verify image imports in components
- Check browser console for 404 errors

## Performance Tips

1. **Image Optimization**: Use WebP format for better compression
2. **Lazy Loading**: Components are loaded on-demand
3. **CDN**: Vercel automatically serves assets from their global CDN
4. **Caching**: Static assets are cached aggressively

## Monitoring

### Analytics

Vercel provides built-in analytics:
- Go to **Analytics** tab in your project
- View page views, performance metrics, and errors

### Logs

View deployment and function logs:
- Go to **Deployments** tab
- Click on a deployment
- View **Build Logs** or **Function Logs**

## Cost Considerations

### Vercel
- **Free Tier**: 100 GB bandwidth, unlimited personal projects
- **Pro Tier**: $20/month for commercial projects

### OpenAI API
- **GPT-4o-mini**: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- Monitor usage at: https://platform.openai.com/usage
- Set spending limits in OpenAI dashboard

## Support

For issues or questions:
- Check the [Vercel Documentation](https://vercel.com/docs)
- Review [Vite Documentation](https://vitejs.dev/)
- Open an issue in your repository

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Configure custom domain (if needed)
3. ✅ Set up monitoring and alerts
4. ✅ Share your deployed application
5. ✅ Consider implementing backend proxy for API security

---

**Deployment Date**: Ready for deployment
**Framework**: Vite + React
**Hosting**: Vercel
**Status**: Production Ready ✅

