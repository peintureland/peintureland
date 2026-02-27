// scripts/generate-sitemaps.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// ⚠️ Supabase anon key, safe for read-only use
const supabaseUrl = "https://ywcpovfepiuspgcsjizs.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48"

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const baseUrl = "https://peintureland.com"
const today = new Date().toISOString().split('T')[0]

// Root directory for sitemaps
const outputDir = path.resolve('.')

// Fetch brands
async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, created_at')
  if (error) throw error
  return data || []
}

// Fetch products
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, created_at')
  if (error) throw error
  return data || []
}

// Write XML for each sitemap
function writeUrlSet(filename, items, template, priority) {
  const urls = items.map(item => `
  <url>
    <loc>${baseUrl}${template}${item.id}</loc>
    <lastmod>${item.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  fs.writeFileSync(path.join(outputDir, filename), xml)
}

async function main() {
  try {
    const [brands, products] = await Promise.all([
      fetchBrands(),
      fetchProducts()
    ])

    // Generate brand & product sitemaps
    writeUrlSet('sitemap-brands.xml', brands, '/brand.html?id=', 0.7)
    writeUrlSet('sitemap-products.xml', products, '/product.html?id=', 0.6)

    // Generate static pages sitemap
    const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/home.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/search.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`

    fs.writeFileSync(path.join(outputDir, 'sitemap-pages.xml'), pagesXml)

    // Generate sitemap index
    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-brands.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`

    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), indexXml)

    console.log('✅ Sitemaps generated successfully')
  } catch (err) {
    console.error('❌ Sitemap generation failed:', err)
    process.exit(1)
  }
}

main()