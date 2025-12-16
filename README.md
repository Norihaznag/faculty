# EduHub - University Resource Platform

A comprehensive W3Schools-style educational resource platform built with Next.js, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- Browse educational content by subjects (Computer Science, Mathematics, Physics, Chemistry, Biology, Engineering, Business, Languages)
- Search lessons across all subjects
- View lessons with PDF preview and download capabilities
- Bookmark favorite lessons for quick access
- Responsive, mobile-first design with collapsible sidebar navigation

### User Roles
- **Students**: Browse, bookmark, and upload content for review
- **Teachers**: Browse, bookmark, and upload content with faster approval consideration
- **Admins**: Approve/reject content uploads, manage platform, view analytics

### Content Management
- Students and teachers can upload lessons with:
  - Title, content (HTML), subject, semester
  - PDF links for document resources
  - External links for additional materials
  - Tags for categorization
- Admin approval workflow for all uploads
- Published lessons are SEO-optimized and publicly accessible

### Performance & SEO
- Server-Side Rendering (SSR) for optimal performance
- Optimized for slow connections with minimal JavaScript
- SEO-friendly with meta tags, Open Graph, and Twitter cards
- Dynamic sitemap.xml generation
- robots.txt for search engine crawlers
- Lighthouse-ready architecture

### Accessibility
- ARIA labels throughout the interface
- Keyboard navigation support
- Screen reader compatible
- High contrast design

## Tech Stack

- **Frontend**: Next.js 13.5, React 18.2, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Row Level Security)
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database setup:
   - The database schema has been automatically applied via migrations
   - Initial subjects have been seeded

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── auth/                # Authentication pages (login, signup)
│   ├── bookmarks/           # User bookmarks page
│   ├── lessons/[slug]/      # Dynamic lesson pages
│   ├── search/              # Search results page
│   ├── subjects/[slug]/     # Subject listing pages
│   ├── upload/              # Content upload form
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Home page
├── components/
│   ├── layout/              # Layout components (Header, Sidebar, MainLayout)
│   ├── lessons/             # Lesson-specific components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth-context.tsx     # Authentication context provider
│   ├── supabase.ts          # Supabase client and types
│   └── utils/               # Utility functions
└── public/
    └── robots.txt           # SEO robots file
```

## Database Schema

### Tables
- **profiles**: Extended user profiles with roles (student, teacher, admin)
- **subjects**: Academic subjects/categories
- **lessons**: Published educational content
- **tags**: Tags for categorizing lessons
- **lesson_tags**: Many-to-many relationship between lessons and tags
- **bookmarks**: User bookmarks for lessons
- **uploads**: Pending content submissions awaiting approval

### Security
- Row Level Security (RLS) enabled on all tables
- Granular access control based on user roles
- Secure authentication state management

## Key Features Explained

### Lesson Upload & Approval Workflow
1. Students/Teachers submit content via the Upload page
2. Submissions enter "pending" status
3. Admins review submissions in the Admin Dashboard
4. Approved content is automatically published as lessons
5. Rejected content is archived with admin notes

### Search Functionality
- Full-text search across lesson titles and content
- Results sorted by relevance (view count)
- Real-time search as you type

### PDF Integration
- Direct PDF links embedded in lessons
- In-browser PDF preview using iframe
- Download button for offline access

### Bookmark System
- One-click bookmarking for authenticated users
- Persistent bookmarks stored in database
- Quick access via Bookmarks page

## Admin Features

### Dashboard Statistics
- Total registered users
- Total published lessons
- Pending upload count

### Content Moderation
- Review pending uploads with full content preview
- Approve or reject with optional admin notes
- Automatic lesson creation upon approval
- Track approval history

## Performance Optimizations

- Server-Side Rendering for fast initial page loads
- Optimized images and lazy loading
- Minimal JavaScript bundle size
- Efficient database queries with proper indexing
- Static asset caching
- Responsive images for different screen sizes

## SEO Features

- Dynamic meta tags for each page
- Open Graph tags for social media sharing
- Twitter Card support
- Structured data for search engines
- Auto-generated sitemap.xml
- Robots.txt configuration

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Environment variables are auto-configured
4. Deploy

### Netlify
1. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
2. Add environment variables
3. Deploy

## Future Enhancements

- [ ] Premium content with subscription (Stripe/MarocPay integration)
- [ ] Ad placement system
- [ ] User reputation and gamification
- [ ] Comment system for lessons
- [ ] Rating and review system
- [ ] Advanced analytics dashboard
- [ ] Email notifications for approvals
- [ ] Content versioning
- [ ] Multi-language support
- [ ] Dark mode toggle

## Contributing

Content contributions are welcome through the Upload page. For code contributions, please submit issues or pull requests.

## License

This project is built for educational purposes.

## Support

For questions or issues, please use the platform's contact form or submit an issue in the repository.
