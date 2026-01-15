# University Partners Carousel Components

Three beautiful carousel components to showcase university partners on the PractiCheck company dashboard.

## 🎨 Available Carousel Styles

### 1. PartnersCarousel.tsx (Full Cards)
**Best for:** Detailed information display

**Features:**
- Full university cards with detailed information
- Single row horizontal scroll
- Shows location, student count, and establishment year
- Verified partner badges
- Hover effects with shadow transitions
- Stats section below carousel

**Usage:**
```tsx
import PartnersCarousel from '../components/PartnersCarousel';

<PartnersCarousel />
```

### 2. PartnersCarouselLogos.tsx (Logo Circles)
**Best for:** Clean, minimal design

**Features:**
- Circular logo badges with university initials
- Single row horizontal scroll
- Color-coded by university
- Hover reveals full name and student count
- Compact and elegant design
- Faster scroll speed

**Usage:**
```tsx
import PartnersCarouselLogos from '../components/PartnersCarouselLogos';

<PartnersCarouselLogos />
```

### 3. PartnersCarouselDual.tsx (Dual Row) ⭐ **Currently Active**
**Best for:** Maximum visual impact

**Features:**
- Two rows scrolling in opposite directions
- Compact cards with logo and info
- First row scrolls left to right
- Second row scrolls right to left
- Active partner badges
- Integrated stats section with gradient background
- Most dynamic and eye-catching

**Usage:**
```tsx
import PartnersCarouselDual from '../components/PartnersCarouselDual';

<PartnersCarouselDual />
```

## 🎯 Features Common to All Carousels

### Infinite Scroll
- Seamless looping animation
- No visible breaks or jumps
- Smooth continuous motion

### Hover Interactions
- Pause animation on hover
- Scale effects on cards/logos
- Enhanced shadows and borders
- Color transitions

### Accessibility
- Respects `prefers-reduced-motion`
- Keyboard accessible
- Semantic HTML structure

### Responsive Design
- Mobile-friendly
- Gradient overlays on edges
- Adaptive spacing

### Performance
- CSS animations (GPU accelerated)
- Optimized rendering
- Minimal JavaScript

## 🔧 Customization

### Change Animation Speed
Edit the animation duration in the `<style jsx>` section:

```css
/* Slower */
animation: scroll 90s linear infinite;

/* Faster */
animation: scroll 30s linear infinite;
```

### Modify University Data
Update the `getMockUniversities()` function or connect to your API:

```tsx
const fetchUniversities = async () => {
  const response = await fetch('YOUR_API_ENDPOINT');
  const data = await response.json();
  setUniversities(data);
};
```

### Change Colors
Modify the gradient colors in `getUniversityColor()`:

```tsx
const colors = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  // Add your custom colors
];
```

### Adjust Card Styling
Modify the card classes:

```tsx
className="bg-white rounded-xl shadow-soft hover:shadow-medium"
```

## 📊 University Data Structure

```typescript
interface University {
  id: string;
  name: string;
  shortName?: string;      // For logo carousels
  location: string;
  students: number;
  established?: string;    // Optional
  logo?: string;          // Optional image URL
}
```

## 🎨 Design Tokens Used

### Colors
- Primary: `primary-500`, `primary-600`, `primary-700`
- Success: `green-50`, `green-700`
- Neutral: `gray-50` to `gray-900`

### Shadows
- `shadow-soft`: Subtle elevation
- `shadow-medium`: Hover state
- `shadow-lg`: Logo circles
- `shadow-xl`: Stats section

### Spacing
- Card width: `w-72` or `w-80`
- Card spacing: `mx-3` or `mx-4`
- Section padding: `py-16`

## 🚀 Integration Example

In your landing page (`page.tsx`):

```tsx
import PartnersCarouselDual from '../components/PartnersCarouselDual';

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Partners Carousel */}
      <PartnersCarouselDual />
      
      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
```

## 🎭 Animation Details

### Scroll Animation
- Uses CSS `@keyframes` for smooth performance
- GPU-accelerated with `transform: translateX()`
- Linear timing function for consistent speed
- Infinite loop with seamless transition

### Hover Effects
- `animation-play-state: paused` on hover
- Scale transforms: `scale-110`
- Opacity transitions for text
- Color transitions for borders

## 📱 Responsive Behavior

### Mobile (< 640px)
- Single column stats
- Reduced card width
- Faster scroll speed
- Smaller gradients

### Tablet (640px - 1024px)
- Two column stats
- Medium card width
- Standard scroll speed

### Desktop (> 1024px)
- Four column stats
- Full card width
- Optimal scroll speed
- Full gradient overlays

## 🔍 SEO Considerations

All carousels include:
- Semantic HTML (`<section>`, `<h2>`, etc.)
- Descriptive headings
- Alt text ready (for logo images)
- Structured data ready

## 🎯 Best Practices

1. **Choose the right carousel** based on your content density needs
2. **Test on different devices** to ensure smooth performance
3. **Monitor animation performance** on lower-end devices
4. **Keep university data updated** for accuracy
5. **Use real logos** when available for better branding

## 🐛 Troubleshooting

### Animation not smooth?
- Check if too many cards are rendering
- Reduce animation duration
- Ensure GPU acceleration is enabled

### Cards overlapping?
- Adjust `mx-3` or `mx-4` spacing
- Check card width (`w-72`, `w-80`)
- Verify container overflow settings

### Hover not working?
- Check z-index values
- Verify pointer-events settings
- Test without gradient overlays

## 📝 Notes

- Currently using mock data for Kenyan universities
- Ready to connect to backend API
- All three components are production-ready
- Fully typed with TypeScript
- Follows PractiCheck design system