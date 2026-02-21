---
id: DEB-10.4
title: Deploy to Vercel
ePic: Polish & Launch Preparation
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [deployment, vercel, production]
---

## Description
Deploy the application to Vercel production.

## Acceptance Criteria
- [ ] Configure Vercel project
- [ ] Set environment variables in Vercel
- [ ] Configure Convex deployment
- [ ] Deploy production build
- [ ] Verify all features work
- [ ] Test with real OpenRouter API
- [ ] Configure custom domain (optional)

## Definition of Done
- [ ] App live at Vercel URL
- [ ] All features functional
- [ ] Performance acceptable

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables configured

### Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables (Vercel Dashboard)
- [ ] `OPENROUTER_API_KEY`
- [ ] `CONVEX_DEPLOYMENT_URL`
- [ ] `NEXT_PUBLIC_CONVEX_URL`

### Post-deployment
- [ ] Test debate creation
- [ ] Test real-time streaming
- [ ] Test user controls
- [ ] Test mobile responsiveness
- [ ] Monitor error logs

## Dependencies
- DEB-1.6 (Next.js config for Vercel)
- All previous stories completed

## Blocks
None (final task)
