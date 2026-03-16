// src/components/Skeleton.jsx
import React from 'react'

const shimmer = "animate-pulse bg-gray-200 rounded"

export const SkeletonBox = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`} />
)

export const SkeletonText = ({ className = '' }) => ( 
  <div className={`${shimmer} h-4 ${className}`} />
)

export const SkeletonCircle = ({ size = 40 }) => (
  <div className={`${shimmer} rounded-full shrink-0`} style={{ width: size, height: size }} />
)

// ── Product Card Skeleton ──────────────────────────────────
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    <div className="animate-pulse bg-gray-200 h-44 w-full" />
    <div className="p-3 space-y-2">
      <SkeletonText className="w-1/3" />
      <SkeletonText className="w-full" />
      <SkeletonText className="w-2/3" />
      <SkeletonText className="w-1/4 h-6 rounded-full" />
      <SkeletonText className="w-1/3 h-5 mt-1" />
      <SkeletonBox className="h-9 w-full mt-2 rounded-lg" />
      <SkeletonBox className="h-9 w-full rounded-lg" />
    </div>
  </div>
)

// ── Order Card Skeleton ────────────────────────────────────
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <SkeletonText className="w-36" />
        <SkeletonText className="w-24" />
      </div>
      <SkeletonBox className="h-7 w-20 rounded-full" />
    </div>
    <div className="border-t pt-3 space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-3 items-center">
          <SkeletonBox className="w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/4" />
          </div>
          <SkeletonText className="w-16" />
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center border-t pt-3">
      <SkeletonText className="w-20" />
      <SkeletonText className="w-24 h-5" />
    </div>
  </div>
)

// ── Profile Skeleton ───────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="animate-pulse bg-gray-300 h-32 w-full" />
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5 text-center space-y-2">
            <SkeletonCircle size={40} />
            <SkeletonText className="w-1/2 mx-auto h-6" />
            <SkeletonText className="w-2/3 mx-auto" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <SkeletonText className="w-1/4 h-5" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-1.5">
            <SkeletonText className="w-1/5" />
            <SkeletonBox className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <SkeletonBox className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  </div>
)

// ── Admin Dashboard Skeleton ───────────────────────────────
export const AdminStatsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="animate-pulse bg-gray-700 h-4 w-24 rounded" />
            <div className="animate-pulse bg-gray-700 rounded-full w-9 h-9" />
          </div>
          <div className="animate-pulse bg-gray-700 h-8 w-20 rounded" />
          <div className="animate-pulse bg-gray-700 h-3 w-32 rounded" />
        </div>
      ))}
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      <div className="animate-pulse bg-gray-700 h-5 w-36 rounded" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4 items-center py-2 border-b border-gray-800">
          <div className="animate-pulse bg-gray-700 h-4 w-24 rounded" />
          <div className="animate-pulse bg-gray-700 h-4 w-32 rounded flex-1" />
          <div className="animate-pulse bg-gray-700 h-6 w-16 rounded-full" />
          <div className="animate-pulse bg-gray-700 h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Home Featured Skeleton ─────────────────────────────────
export const HomeSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="animate-pulse bg-gray-200 h-36 sm:h-40 w-full" />
        <div className="p-3 space-y-2">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-full" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
)