# Deployment Guide

## Pre-Deployment Checklist

- [x] Database schema created and migrated
- [x] Row Level Security (RLS) enabled on all tables
- [x] Supabase authentication configured
- [x] Environment variables set
- [x] Build successful
- [x] All core features implemented
- [x] SEO optimization complete
- [x] Accessibility features added
- [x] Performance optimized

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and provides excellent performance.

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js and configure build settings
6. Environment variables are already set (no manual configuration needed)
7. Click "Deploy"
8. Your site will be live at `your-project.vercel.app`

**Custom Domain:**
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

### Option 2: Netlify

Netlify is another excellent hosting platform with great features.

**Steps:**
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "New site from Git"
4. Connect to GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Environment variables are auto-configured
7. Click "Deploy site"

**Note:** The `netlify.toml` file is already configured with the Next.js plugin.

### Option 3: Self-Hosted (VPS/Cloud)

For more control, you can deploy to any Node.js hosting environment.

**Requirements:**
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache as reverse proxy

**Steps:**
1. Clone repository on server
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start with PM2: `pm2 start npm --name "eduhub" -- start`
5. Configure Nginx to proxy to port 3000

## Post-Deployment Tasks

### 1. Update Environment Variables

If you change domains, update these in your hosting platform:
- `NEXT_PUBLIC_SITE_URL` (for sitemap generation)

### 2. Configure DNS

Point your domain to your hosting provider:
- **Vercel:** Add CNAME record pointing to `cname.vercel-dns.com`
- **Netlify:** Add CNAME record pointing to your Netlify subdomain

### 3. Enable Analytics (Optional)

**Google Analytics:**
1. Create a GA4 property
2. Add tracking code to `app/layout.tsx`

**Vercel Analytics:**
1. Enable in Vercel dashboard
2. Already integrated with Next.js

### 4. Set Up Monitoring

**Supabase:**
- Monitor database performance in Supabase dashboard
- Set up alerts for high usage
- Review query performance

**Application:**
- Use Vercel/Netlify monitoring dashboards
- Set up error tracking (Sentry)
- Monitor Core Web Vitals

### 5. SEO Configuration

Update these values after deployment:
1. In `public/robots.txt`, replace domain:
   ```
   Sitemap: https://yourdomain.com/sitemap.xml
   ```

2. Add your site to Google Search Console
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`
4. Add to Bing Webmaster Tools

### 6. Security Hardening

- Enable Supabase RLS policies (already done)
- Set up rate limiting in Supabase
- Enable Supabase Auth email confirmation (optional)
- Configure CORS if needed for external APIs
- Regular security audits

### 7. Backup Strategy

**Database:**
- Supabase provides automatic daily backups
- Enable Point-in-Time Recovery in Supabase
- Export database regularly for local backups

**Code:**
- Keep code in version control (Git)
- Tag releases
- Document major changes

## Performance Optimization

Already implemented:
- Server-Side Rendering (SSR)
- Static page generation where possible
- Optimized images
- Minimal JavaScript
- Database query optimization with indexes
- Proper caching headers

Additional optimizations (optional):
- Enable Vercel Edge Functions for faster response times
- Implement CDN for static assets
- Add service worker for offline support
- Implement image optimization service

## Monitoring & Maintenance

### Weekly Tasks
- Check error logs
- Review slow database queries
- Monitor user growth
- Check disk space and database size

### Monthly Tasks
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Review and optimize database queries
- Analyze user behavior and improve UX
- Content moderation review

### Quarterly Tasks
- Major dependency updates
- Performance audit
- SEO audit
- Accessibility audit
- User feedback review

## Scaling Considerations

When your platform grows:

**Database:**
- Upgrade Supabase plan for more connections
- Implement connection pooling
- Add read replicas
- Consider database partitioning

**Application:**
- Enable Vercel Edge Network
- Implement Redis caching
- Add background job processing
- Consider microservices architecture

**Content:**
- Implement CDN for PDFs
- Add image optimization service
- Enable lazy loading everywhere
- Implement pagination

## Cost Estimates

**Free Tier (Great for starting):**
- Supabase: Free (500MB database, 50,000 monthly active users)
- Vercel: Free (100GB bandwidth, unlimited deployments)
- Total: $0/month

**Production (Small to Medium):**
- Supabase Pro: $25/month (8GB database, unlimited MAU)
- Vercel Pro: $20/month (1TB bandwidth, advanced analytics)
- Custom domain: $12/year
- Total: ~$45/month

**Production (Large Scale):**
- Supabase Team: $599/month (custom resources)
- Vercel Enterprise: Custom pricing
- CDN: $50-200/month
- Total: $700+/month

## Rollback Procedure

If issues occur after deployment:

1. **Vercel/Netlify:** Use the dashboard to rollback to previous deployment
2. **Database:** Use Supabase Point-in-Time Recovery
3. **Code:** Revert Git commit and redeploy

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** Stack Overflow, GitHub Discussions

## Success Checklist

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] User signup/login works
- [ ] Lessons are searchable and viewable
- [ ] PDF preview works
- [ ] Bookmarks function properly
- [ ] Upload form submits successfully
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness
- [ ] SEO meta tags present
- [ ] Sitemap accessible
- [ ] All pages load under 3 seconds

Congratulations on your deployment!
