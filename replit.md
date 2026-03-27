# INDNO1 - Sports Live Streaming Platform

A Next.js 16 sports live streaming platform for a betting company, supporting Cricket, Football, Basketball, and Tennis.

## Architecture

### Tech Stack
- **Framework**: Next.js 16.2 (App Router, Turbopack)
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: JWT tokens in httpOnly cookies + bcrypt password hashing
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4

### Key Features
1. **YouTube Live Streaming** - Embed YouTube live feeds with autoplay, hidden controls, oversized iframe to clip branding
2. **Branded Loading Overlay** - Custom "Loading Live Stream" overlay covers YouTube UI during buffering/startup; fades when playing
3. **Mute/Unmute via postMessage** - Controls YouTube audio via YouTube IFrame API postMessage (no page reload); `enablejsapi=1` in embed URL
4. **Fullscreen Support** - Browser Fullscreen API on the player container; ResizeObserver recalculates overlay positions in fullscreen
5. **Auto-hide Player Controls** - Mute/fullscreen buttons fade in on hover/tap, auto-hide after 3s idle (desktop: hover, mobile: tap)
6. **Video Overlay Anchoring** - Overlays anchored to the computed 16:9 video rectangle within the container; scales responsively with the visible video area
7. **Full-screen Ad Overlay** - Admin triggers full-screen ad takeover with countdown; existing ad system preserved
8. **Drag-and-Drop Overlay Editor** - Admin visually drags/resizes overlays on video preview; percentage-based coordinates
9. **File Upload** - Upload images, GIFs, and videos (up to 20MB) for overlays; saved to `/public/uploads/`
10. **Admin Dashboard** - Redesigned broadcast control panel aesthetic; stats, stream list, cleaner UX
11. **Premium Betting CTA** - Conversion-focused section below the live video with urgency messaging and animated CTAs
12. **Multi-Sport Support** - Cricket, Football, Basketball (tabs); Tennis in DB
13. **Mobile-First Homepage** - Responsive casino bets table (hides columns on small screens), responsive sport tabs, responsive stream header
14. **Homepage Random Rotation** - `HomeLivePlayer` shuffles live DB streams on load, auto-rotates every 30s, falls back to static embed if none live

## Database Schema

- `admin_users` - Admin login credentials (bcrypt hashed passwords)
- `streams` - YouTube URL, sport type, team names, schedule, live status; `ad_active` flag; `active_overlay_id` ref
- `overlays` - Logo/ad/banner overlays linked to streams; `pos_x`/`pos_y` (percentage), `width`, `height`, `opacity`, `ad_duration`

## Routes

### Public
- `/` - Homepage with existing components
- `/watch/[id]` - Watch a specific stream with overlays

### Admin (JWT protected)
- `/admin/login` - Admin login
- `/admin` - Dashboard (manage all streams)
- `/admin/streams/new` - Create a new stream
- `/admin/streams/[id]` - Edit stream + manage its overlays

### API
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Check session
- `GET /api/streams` - Public: list active streams (query: ?sport=, ?live=true)
- `GET /api/streams/[id]` - Public: single stream + overlays
- `GET /api/admin/streams` - Admin: all streams
- `POST /api/admin/streams` - Admin: create stream
- `PUT /api/admin/streams/[id]` - Admin: update stream
- `DELETE /api/admin/streams/[id]` - Admin: delete stream
- `POST /api/admin/overlays` - Admin: add overlay (with pos_x, pos_y)
- `PUT /api/admin/overlays/[id]` - Admin: update overlay (position/size auto-saved on drag)
- `DELETE /api/admin/overlays/[id]` - Admin: delete overlay
- `PUT /api/admin/streams/[id]/ad` - Admin: start/stop ad (sets ad_active, active_overlay_id)
- `POST /api/admin/upload` - Admin: upload image/GIF/video; returns /uploads/[filename]

## Security
- JWT tokens stored in httpOnly, secure, SameSite=Lax cookies
- bcrypt (cost 12) for password hashing
- All inputs validated and parameterized SQL queries (no injection risk)
- YouTube URL validation on both client and server
- Admin API endpoints check session on every request

## Default Admin Credentials
- **Username**: `admin`
- **Password**: `Admin@123`
- **IMPORTANT**: Change the password immediately via the database after first login

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `JWT_SECRET` - JWT signing secret (auto-generated, stored in Replit secrets)

## Development
```bash
npm run dev   # Start dev server on port 5000
npm run build # Build for production
npm run start # Start production server on port 5000
```
