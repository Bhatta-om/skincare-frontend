// src/components/Skeleton.jsx — SkinMedica Luxury Redesign
import React from 'react'

// ── Base skeleton ─────────────────────────────────────────
export const SkeletonBox = ({ style = {} }) => (
  <div className="skeleton" style={{ borderRadius: 0, ...style }} />
)

export const SkeletonText = ({ style = {} }) => (
  <div className="skeleton" style={{ height: '12px', borderRadius: 0, ...style }} />
)

export const SkeletonCircle = ({ size = 40 }) => (
  <div className="skeleton" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
)

// ── Product Card Skeleton ─────────────────────────────────
export const ProductCardSkeleton = () => (
  <div style={{ background: '#FFFFFF', overflow: 'hidden' }}>
    {/* Image */}
    <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%', borderRadius: 0 }} />
    {/* Body */}
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SkeletonText style={{ width: '35%' }} />
      <SkeletonText style={{ width: '85%', height: '15px' }} />
      <SkeletonText style={{ width: '55%' }} />
      <SkeletonText style={{ width: '30%', height: '14px', marginTop: '4px' }} />
    </div>
  </div>
)

// ── Order Card Skeleton ───────────────────────────────────
export const OrderCardSkeleton = () => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <SkeletonBox style={{ width: '44px', height: '44px', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText style={{ width: '140px' }} />
          <SkeletonText style={{ width: '100px' }} />
        </div>
      </div>
      <SkeletonBox style={{ width: '70px', height: '24px' }} />
    </div>
    <SkeletonBox style={{ height: '3px', width: '100%', marginBottom: '12px' }} />
    <div style={{ display: 'flex', gap: '8px' }}>
      {[...Array(3)].map((_, i) => (
        <SkeletonBox key={i} style={{ width: '36px', height: '36px', flexShrink: 0 }} />
      ))}
    </div>
  </div>
)

// ── Profile Skeleton ──────────────────────────────────────
export const ProfileSkeleton = () => (
  <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
    {/* Header */}
    <div className="skeleton" style={{ height: '160px', borderRadius: 0 }} />

    <div className="container-luxury" style={{ padding: '40px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Edit profile card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', padding: '24px' }}>
            <SkeletonText style={{ width: '140px', height: '18px', marginBottom: '24px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <SkeletonText style={{ width: '70px', marginBottom: '8px' }} />
                <SkeletonBox style={{ height: '42px' }} />
              </div>
              <div>
                <SkeletonText style={{ width: '70px', marginBottom: '8px' }} />
                <SkeletonBox style={{ height: '42px' }} />
              </div>
            </div>
            {[1, 2].map(i => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <SkeletonText style={{ width: '60px', marginBottom: '8px' }} />
                <SkeletonBox style={{ height: '42px' }} />
              </div>
            ))}
            <SkeletonBox style={{ height: '42px', width: '140px', marginTop: '8px' }} />
          </div>

          {/* Password card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', padding: '24px' }}>
            <SkeletonText style={{ width: '160px', height: '18px', marginBottom: '24px' }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <SkeletonText style={{ width: '100px', marginBottom: '8px' }} />
                <SkeletonBox style={{ height: '42px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stats card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
            <div style={{ height: '2px' }} className="skeleton" />
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEE7DF' }}>
              <SkeletonText style={{ width: '120px', height: '15px' }} />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 24px', borderBottom: '1px solid #EEE7DF' }}>
                <SkeletonText style={{ width: '90px' }} />
                <SkeletonText style={{ width: '50px' }} />
              </div>
            ))}
          </div>

          {/* Account info card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEE7DF' }}>
              <SkeletonText style={{ width: '110px', height: '15px' }} />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #EEE7DF' }}>
                <SkeletonText style={{ width: '80px' }} />
                <SkeletonText style={{ width: '70px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ── Admin Stats Skeleton ──────────────────────────────────
export const AdminStatsSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ background: '#181818', border: '1px solid #252525', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="skeleton" style={{ height: '12px', width: '80px', background: '#2A2A2A' }} />
            <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 0, background: '#2A2A2A' }} />
          </div>
          <div className="skeleton" style={{ height: '28px', width: '70px', background: '#2A2A2A' }} />
          <div className="skeleton" style={{ height: '10px', width: '100px', background: '#2A2A2A' }} />
        </div>
      ))}
    </div>
    <div style={{ background: '#181818', border: '1px solid #252525', padding: '20px' }}>
      <div className="skeleton" style={{ height: '14px', width: '120px', background: '#2A2A2A', marginBottom: '20px' }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1E1E1E' }}>
          <div className="skeleton" style={{ height: '12px', width: '80px', background: '#2A2A2A' }} />
          <div className="skeleton" style={{ height: '12px', flex: 1, background: '#2A2A2A' }} />
          <div className="skeleton" style={{ height: '22px', width: '60px', background: '#2A2A2A' }} />
          <div className="skeleton" style={{ height: '12px', width: '70px', background: '#2A2A2A' }} />
        </div>
      ))}
    </div>
  </div>
)

// ── Home Featured Skeleton ────────────────────────────────
export const HomeSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#E6DDD3' }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ background: '#FFFFFF', overflow: 'hidden' }}>
        <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%', borderRadius: 0 }} />
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText style={{ width: '30%' }} />
          <SkeletonText style={{ width: '80%', height: '15px' }} />
          <SkeletonText style={{ width: '40%' }} />
        </div>
      </div>
    ))}
  </div>
)