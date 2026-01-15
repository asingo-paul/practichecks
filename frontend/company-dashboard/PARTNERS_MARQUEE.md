# University Partners Marquee

## What It Does
Displays university partners in a moving marquee style with two rows:
- **Top row**: Scrolls right to left →
- **Bottom row**: Scrolls left to right ←

## Files
- `src/components/PartnersMarquee.tsx` - Main component
- `src/components/PartnersMarquee.css` - Animation styles
- `src/app/page.tsx` - Integrated in landing page

## Features
- ✅ Continuous smooth scrolling
- ✅ Logo badge + University name
- ✅ Hover to pause
- ✅ 16 Kenyan universities
- ✅ Responsive design

## To View
```bash
npm run dev
```
Visit: http://localhost:3000

## Customize

### Change Speed
Edit `PartnersMarquee.css`:
```css
animation: scroll-rtl 40s linear infinite;
/*                   ↑ Change this number */
```

### Add University
Edit `PartnersMarquee.tsx`:
```typescript
{ id: '17', name: 'New University', shortName: 'NU' },
```