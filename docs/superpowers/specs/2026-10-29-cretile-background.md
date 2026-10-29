# Cretile opening background

Samuel requested landscape and watercolor textures behind interface screenshots,
using the supplied reference for style. Applied to the opening section for review.

Initial asset: `assets/cretile-watercolor-landscape.webp`

## Selected treatment

Samuel selected `assets/cretile-pastel-sage.webp` on 2026-10-29 for every
interface shot. The shared `.interface-stage` component applies this landscape
to screenshots and video clips throughout Cretile, Superstash, homepage project
cards and next-project previews. Captions sit outside the background. The later
product-preview gallery is the agreed exception: it presents the media directly
without a landscape, before the alternating product explanation rows.

The page uses an 1180px maximum content width with a 24px minimum outer gutter.
Landscape padding is `clamp(16px, 3%, 32px)` on all four sides. Prose retains its
narrower reading width while interface media can use the full page width.

Raw screenshots are used when available. Clean sibling image and video exports
remove the baked-in white/grey decorative surround from the 1600 × 900 assets
(88px on each side, 75px above and below). The original files are retained.
The resulting 1424 × 750 interface is displayed at its native ratio without
further enlargement or fixed-ratio cropping. Rounded interface corners use 8px
inside the 16px landscape frame, with space around all four sides.

Generated with the built-in image-generation tool, then converted to WebP for the
site (1536 × 1024, about 343 KB). The interface remains a separate HTML image.

## Generation prompt

Use case: stylized-concept. Asset type: background image for a product designer
portfolio screenshot showcase. Create an original panoramic watercolor landscape
on textured cold-press paper, landscape 3:2 composition. Quiet hillside village
with tiny warm ivory houses and dark slender cypress trees near the outer left
and right edges, rolling sage-green hills across the bottom quarter, vast soft
dusty powder-blue sky occupying top two-thirds. Subtle watercolor blooms, visible
paper grain, loose hand-painted brushwork, faded botanical greens, warm cream
highlights. Inspired by old travel sketchbooks, tasteful and understated. The
middle 75% will be covered by a large software screenshot, so concentrate
interesting landscape detail toward the outer edges and bottom, keep center
calm. Low contrast muted colors; no neon, no glossy 3D, no gradient mesh.
Background only: no software interface, no device, no frame, no text, no labels,
no watermark. Full bleed painting.
