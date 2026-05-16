const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/(customer)/product/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add imports
const imports = `
import { ProductGallery } from "./components/ProductGallery";
import { ProductInfo } from "./components/ProductInfo";
import { ProductActions } from "./components/ProductActions";
import { SellerProfile } from "./components/SellerProfile";
`;
content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";' + imports);

// We need to replace the gallery, info, actions, and seller profile with the new components
// Instead of regex, let's use the unique start/end markers

// 1. Gallery
const galleryStart = `            {/* ── LEFT: IMAGE GALLERY ────────────────────────────── */}`;
const galleryEnd = `            {/* ── RIGHT: PRODUCT INFO ────────────────────────────── */}`;
const galleryReplacement = `
            {/* ── LEFT: IMAGE GALLERY ────────────────────────────── */}
            <ProductGallery 
              product={product} 
              img={img} 
              setImg={setImg} 
              galleryItems={galleryItems} 
              swipe={swipe} 
              setLightbox={setLightbox} 
              wishlisted={wishlisted} 
              onWishlist={onWishlist} 
              onShare={onShare} 
              savings={savings} 
            />

`;
const galleryStartIndex = content.indexOf(galleryStart);
const galleryEndIndex = content.indexOf(galleryEnd);
if (galleryStartIndex !== -1 && galleryEndIndex !== -1) {
  content = content.slice(0, galleryStartIndex) + galleryReplacement + content.slice(galleryEndIndex);
}

// 2. Info
const infoStart = `              {/* Brand + Status */}`;
const infoEnd = `              {/* ── ACTION BUTTONS ───────────────────────────────── */}`;
const infoReplacement = `
              <ProductInfo 
                product={product} 
                cond={cond} 
                mktVal={mktVal} 
                savedRs={savedRs} 
                savings={savings} 
                qty={qty} 
                setQty={setQty} 
              />

`;
const infoStartIndex = content.indexOf(infoStart);
const infoEndIndex = content.indexOf(infoEnd);
if (infoStartIndex !== -1 && infoEndIndex !== -1) {
  content = content.slice(0, infoStartIndex) + infoReplacement + content.slice(infoEndIndex);
}

// 3. Actions
const actionsStart = `              {/* ── ACTION BUTTONS ───────────────────────────────── */}`;
const actionsEnd = `              {/* ── SELLER CARD ──────────────────────────────────── */}`;
const actionsReplacement = `
              <ProductActions 
                product={product} 
                isAuthenticated={isAuthenticated} 
                qty={qty} 
                pulsed={pulsed} 
                onAddBag={onAddBag} 
                openVideoModal={openVideoModal} 
                actionsRef={actionsRef} 
              />

`;
const actionsStartIndex = content.indexOf(actionsStart);
const actionsEndIndex = content.indexOf(actionsEnd);
if (actionsStartIndex !== -1 && actionsEndIndex !== -1) {
  content = content.slice(0, actionsStartIndex) + actionsReplacement + content.slice(actionsEndIndex);
}

// 4. Seller Profile
const sellerStart = `              {/* ── SELLER CARD ──────────────────────────────────── */}`;
const sellerEnd = `            </article>`;
const sellerReplacement = `
              <SellerProfile product={product} />
            </article>`;
const sellerStartIndex = content.indexOf(sellerStart);
const sellerEndIndex = content.indexOf(sellerEnd);
if (sellerStartIndex !== -1 && sellerEndIndex !== -1) {
  content = content.slice(0, sellerStartIndex) + sellerReplacement + content.slice(sellerEndIndex + `            </article>`.length);
}

// Write back
fs.writeFileSync(pagePath, content);
console.log("Successfully replaced chunks in page.tsx");
