// src/pages/Home.jsx — Mobile Responsive + SEO
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import SEO from '../components/SEO'
import { HomeSkeleton } from '../components/Skeleton'
import { getProductImageUrl } from '../utils/productImage'
import {
  ArrowRight, FlaskConical, Sparkles, ShieldCheck,
  Truck, RefreshCw, Star, Droplets,
  Leaf, Sun, Package,
} from 'lucide-react'

// ── Scroll reveal ─────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

const Reveal = ({ children, delay = 0 }) => {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal ${delay ? `reveal-delay-${delay}` : ''}`}>
      {children}
    </div>
  )
}

const Stars = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11} strokeWidth={1}
        style={{ fill: i <= Math.round(rating) ? '#B8895A' : 'none', color: i <= Math.round(rating) ? '#B8895A' : '#E6DDD3' }}
      />
    ))}
  </div>
)

const ProductCard = ({ product }) => (
  <Link to={`/products/${product.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none' }}>
    {product.discount_percent > 0 && <span className="card-badge card-badge-sale">-{product.discount_percent}%</span>}
    {product.is_featured && !product.discount_percent && <span className="card-badge card-badge-new">Featured</span>}
    <div className="card-image">
      {product.image ? (
        <img src={getProductImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4EDE4' }}>
          <Package size={40} strokeWidth={1} style={{ color: '#D4C4B0' }} />
        </div>
      )}
      <button className="quick-add">Add to Cart</button>
    </div>
    <div className="card-body">
      <p className="card-category">{product.brand}</p>
      <p className="card-name">{product.name}</p>
      {product.review_count > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Stars rating={product.avg_rating} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688' }}>({product.review_count})</span>
        </div>
      )}
      <div className="card-price">
        {product.discount_percent > 0 && <span className="original">Rs. {product.price}</span>}
        <span className={product.discount_percent > 0 ? 'sale' : ''}>Rs. {product.discounted_price}</span>
      </div>
    </div>
  </Link>
)

const SkinTypeCard = ({ type, label, icon, desc }) => {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/products?suitable_skin_type=${type}`} style={{ textDecoration: 'none' }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ background: hov ? '#16100C' : '#FFFFFF', padding: 'clamp(20px, 3vw, 36px) clamp(12px, 2vw, 24px)', textAlign: 'center', transition: 'background 0.3s ease', cursor: 'pointer' }}>
        <div style={{ color: '#B8895A', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(13px, 1.5vw, 16px)', color: hov ? '#FAF8F5' : '#16100C', fontWeight: 400, marginBottom: '4px', transition: 'color 0.3s ease' }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400 }}>{desc}</p>
      </div>
    </Link>
  )
}

// ── Responsive styles injected ────────────────────────────
const HOME_CSS = `
  .home-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 520px; }
  .home-hero-right { display: flex; }
  .home-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E6DDD3; }
  .home-how { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
  .home-how-line { display: block; position: absolute; top: 27px; left: 12.5%; right: 12.5%; height: 1px; background: #E6DDD3; }
  .home-skin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E6DDD3; }
  .home-featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #E6DDD3; }
  .home-trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .home-stats { display: flex; gap: 32px; }
  .home-hero-pad { padding: 72px clamp(16px,4vw,64px) 72px 0; }
  .home-cta-btns { display: flex; gap: 14px; flex-wrap: wrap; }

  @media (max-width: 1024px) {
    .home-featured-grid { grid-template-columns: repeat(3, 1fr); }
    .home-skin-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .home-hero { grid-template-columns: 1fr; min-height: unset; }
    .home-hero-right { display: none; }
    .home-hero-pad { padding: 48px 0; }
    .home-features { grid-template-columns: 1fr; }
    .home-how { grid-template-columns: repeat(2, 1fr); gap: 32px; }
    .home-how-line { display: none; }
    .home-skin-grid { grid-template-columns: repeat(2, 1fr); }
    .home-featured-grid { grid-template-columns: repeat(2, 1fr); }
    .home-trust-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .home-stats { gap: 24px; flex-wrap: wrap; }
    .home-cta-btns { flex-direction: column; align-items: flex-start; }
  }

  @media (max-width: 480px) {
    .home-hero-pad { padding: 40px 0; }
    .home-skin-grid { grid-template-columns: repeat(2, 1fr); }
    .home-featured-grid { grid-template-columns: repeat(2, 1fr); }
    .home-trust-grid { grid-template-columns: repeat(2, 1fr); }
  }
`

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/products/?is_featured=true&page_size=4')
      .then(res => setFeatured(res.data.results || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  const skinTypes = [
    { type: 'oily',   label: 'Oily',   icon: <Droplets size={20} strokeWidth={1.5} />, desc: 'Balance & mattify'  },
    { type: 'dry',    label: 'Dry',    icon: <Leaf     size={20} strokeWidth={1.5} />, desc: 'Hydrate & nourish'  },
    { type: 'normal', label: 'Normal', icon: <Sun      size={20} strokeWidth={1.5} />, desc: 'Maintain & perfect' },
  ]

  const features = [
    { icon: <FlaskConical size={22} strokeWidth={1.5} />, title: 'AI Skin Analysis',    desc: 'Our AI model identifies your skin type and recommends precise formulas your skin needs.' },
    { icon: <Sparkles     size={22} strokeWidth={1.5} />, title: 'Personalized Results', desc: 'Curated recommendations matched to your skin type, concern, age, and lifestyle.' },
    { icon: <ShieldCheck  size={22} strokeWidth={1.5} />, title: 'Clinically Trusted',   desc: 'Every product in our collection is dermatologist-reviewed and clinically validated.' },
  ]

  return (
    <>
      <SEO
        title="Home"
        description="AI-powered skincare. Discover your skin type and find clinically proven products made precisely for you."
        url="/"
      />
      <style>{HOME_CSS}</style>

      <div style={{ background: '#FAF8F5' }}>

        {/* ── HERO ── */}
        <section style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(90deg,rgba(184,137,90,0.04) 0px,rgba(184,137,90,0.04) 1px,transparent 1px,transparent 80px)' }} />
          <div className="container-luxury">
            <div className="home-hero">
              <div className="home-hero-pad">
                <Reveal>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#B8895A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontWeight: 400 }}>
                    <span style={{ width: '24px', height: '1px', background: '#B8895A', display: 'inline-block', flexShrink: 0 }} />
                    Science-backed skincare
                  </div>
                </Reveal>
                <Reveal delay={1}>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,54px)', color: '#16100C', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '20px' }}>
                    Know Your Skin.<br />
                    <em style={{ color: '#B8895A' }}>Glow Better.</em>
                  </h1>
                </Reveal>
                <Reveal delay={2}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(14px,1.5vw,15px)', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, maxWidth: '400px', marginBottom: '32px' }}>
                    Personalized skincare powered by AI. Discover your skin type and find formulas crafted precisely for you.
                  </p>
                </Reveal>
                <Reveal delay={3}>
                  <div className="home-cta-btns">
                    <Link to="/skin-analysis" className="btn-primary" style={{ gap: '10px' }}>
                      <FlaskConical size={15} strokeWidth={1.5} /> Analyze My Skin
                    </Link>
                    <Link to="/products" className="btn-outline" style={{ gap: '8px' }}>
                      Shop Products <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                  </div>
                </Reveal>
                {/* Stats section removed - project appropriate content */}
              </div>

              {/* Right panel — hidden on mobile */}
              <div className="home-hero-right" style={{ background: '#EBD9C6', position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '480px', height: '480px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                <div style={{ position: 'absolute', width: '340px', height: '340px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.2)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px' }}>
                  <div style={{ background: '#FFFFFF', padding: '28px 32px', border: '1px solid #E6DDD3', marginBottom: '16px', minWidth: '240px' }}>
                    <FlaskConical size={28} strokeWidth={1.5} style={{ color: '#B8895A', marginBottom: '12px' }} />
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '17px', color: '#16100C', marginBottom: '8px', fontWeight: 400 }}>Free Skin Analysis</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#7B6458', lineHeight: 1.6, fontWeight: 300, marginBottom: '18px' }}>AI-powered. Results in 30 seconds.</p>
                    <Link to="/skin-analysis" className="btn-accent" style={{ fontSize: '10.5px', padding: '10px 20px', width: '100%', justifyContent: 'center' }}>Start Analysis</Link>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['Clinically Tested', 'Dermatologist Approved'].map(label => (
                      <span key={label} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', background: 'rgba(255,255,255,0.85)', border: '1px solid #E6DDD3', padding: '4px 10px', fontWeight: 400 }}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: '18px 0' }}>
          <div className="container-luxury">
            <div className="home-trust-grid">
              {[
                { icon: <Truck       size={17} strokeWidth={1.5} />, label: 'Fast Delivery' },
                { icon: <RefreshCw   size={17} strokeWidth={1.5} />, label: 'Easy Returns' },
                { icon: <ShieldCheck size={17} strokeWidth={1.5} />, label: 'Quality Products' },
                { icon: <FlaskConical size={17} strokeWidth={1.5} />, label: 'Student Project' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                  <span style={{ color: '#B8895A' }}>{icon}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', fontWeight: 400 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURED PRODUCTS ── */}
        <section style={{ padding: 'clamp(48px,8vw,96px) 0' }}>
          <div className="container-luxury">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(28px,4vw,48px)', flexWrap: 'wrap', gap: '16px' }}>
              <Reveal>
                <div>
                  <div className="section-eyebrow">Featured</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,38px)', color: '#16100C', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Bestselling Products</h2>
                </div>
              </Reveal>
              <Link to="/products" className="btn-ghost" style={{ gap: '6px', fontSize: '12px' }}>View All <ArrowRight size={14} strokeWidth={1.5} /></Link>
            </div>
            {loading ? <HomeSkeleton /> : featured.length > 0 ? (
              <div className="home-featured-grid">
                {featured.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#AA9688' }}>No featured products found.</div>
            )}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: 'clamp(40px,6vw,72px) 0', background: '#F4EDE4', borderTop: '1px solid #E6DDD3', borderBottom: '1px solid #E6DDD3' }}>
          <div className="container-luxury">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,4vw,56px)' }}>
              <Reveal><div className="section-eyebrow" style={{ justifyContent: 'center' }}>Why SkinCare</div></Reveal>
              <Reveal delay={1}><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,36px)', color: '#16100C', fontWeight: 400 }}>Everything for Healthy Skin</h2></Reveal>
            </div>
            <div className="home-features">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i + 1}>
                  <div style={{ background: '#FFFFFF', padding: 'clamp(28px,4vw,48px) clamp(20px,3vw,40px)', height: '100%' }}>
                    <div style={{ width: '48px', height: '48px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8895A', marginBottom: '20px', background: '#FAF8F5', flexShrink: 0 }}>{f.icon}</div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(16px,2vw,18px)', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>{f.title}</h3>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: 'clamp(48px,8vw,96px) 0' }}>
          <div className="container-luxury">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,64px)' }}>
              <Reveal><div className="section-eyebrow" style={{ justifyContent: 'center' }}>Simple Process</div></Reveal>
              <Reveal delay={1}><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,36px)', color: '#16100C', fontWeight: 400 }}>How It Works</h2></Reveal>
            </div>
            <div className="home-how">
              <span className="home-how-line" />
              {[
                { step: '01', icon: <FlaskConical size={20} strokeWidth={1.5} />, title: 'Upload Photo',  desc: 'Clear face photo in natural lighting.'          },
                { step: '02', icon: <Sparkles     size={20} strokeWidth={1.5} />, title: 'AI Analyzes',   desc: 'Our model reads your skin with 96% accuracy.'   },
                { step: '03', icon: <ShieldCheck  size={20} strokeWidth={1.5} />, title: 'Get Results',   desc: 'Receive your detailed skin profile instantly.'   },
                { step: '04', icon: <Package      size={20} strokeWidth={1.5} />, title: 'Shop Products', desc: 'Buy products formulated exactly for your skin.'  },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i + 1}>
                  <div style={{ textAlign: 'center', padding: '0 clamp(8px,2vw,24px)', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #B8895A', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8895A', margin: '0 auto 20px' }}>{s.icon}</div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px', fontWeight: 400 }}>Step {s.step}</p>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(14px,1.8vw,16px)', color: '#16100C', fontWeight: 400, marginBottom: '8px' }}>{s.title}</h3>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#7B6458', lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={2}>
              <div style={{ textAlign: 'center', marginTop: 'clamp(32px,4vw,56px)' }}>
                <Link to="/skin-analysis" className="btn-accent" style={{ gap: '10px' }}>
                  <FlaskConical size={15} strokeWidth={1.5} /> Try It Free Now
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── SKIN TYPE ── */}
        <section style={{ padding: 'clamp(40px,6vw,72px) 0', background: '#F4EDE4', borderTop: '1px solid #E6DDD3', borderBottom: '1px solid #E6DDD3' }}>
          <div className="container-luxury">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,48px)' }}>
              <Reveal><div className="section-eyebrow" style={{ justifyContent: 'center' }}>Curated For You</div></Reveal>
              <Reveal delay={1}><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,36px)', color: '#16100C', fontWeight: 400 }}>Shop By Skin Type</h2></Reveal>
            </div>
            <div className="home-skin-grid">
              {skinTypes.map((s, i) => (
                <Reveal key={s.type} delay={i + 1}>
                  <SkinTypeCard {...s} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: '#16100C', padding: 'clamp(56px,8vw,96px) 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.12)', pointerEvents: 'none' }} />
          <div className="container-luxury" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '16px', fontWeight: 400 }}>It's 100% Free</p>
            </Reveal>
            <Reveal delay={1}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,50px)', color: '#FAF8F5', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px' }}>
                Ready to <em style={{ color: '#B8895A' }}>Glow?</em>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(13px,1.5vw,15px)', color: '#6A5A50', lineHeight: 1.7, fontWeight: 300, maxWidth: '400px', margin: '0 auto 36px' }}>
                Start your skin analysis today — takes only 30 seconds and is completely free.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/skin-analysis" className="btn-accent" style={{ gap: '10px', padding: '15px 36px' }}>
                  <FlaskConical size={16} strokeWidth={1.5} /> Get Started Free
                </Link>
                <Link to="/products" className="btn-outline"
                  style={{ color: '#C8B49A', borderColor: 'rgba(255,255,255,0.18)', gap: '8px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#FAF8F5' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C8B49A' }}
                >
                  Browse Products <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  )
}