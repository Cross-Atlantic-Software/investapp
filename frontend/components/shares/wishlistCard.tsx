'use client';

import React, { useState, useEffect } from 'react';
import { Heart, HeartOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface WishlistCardProps {
  stockId: string;
  stockName: string;
  stockPrice: number;
  variant?: 'vertical' | 'horizontal';
}

interface WishlistStatus {
  isInWishlist: boolean;
}

export default function WishlistCard({ stockId, stockName, stockPrice, variant = 'vertical' }: WishlistCardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check wishlist status on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, stockId]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      const response = await fetch(`/api/wishlist/check/${stockId}`, {
        method: 'GET',
        headers: {
          'token': token,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsInWishlist(result.data.isInWishlist);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/remove/${stockId}`, {
          method: 'DELETE',
          headers: {
            'token': token,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsInWishlist(false);
          } else {
            alert(result.message || 'Failed to remove from wishlist');
          }
        } else {
          const result = await response.json();
          alert(result.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch(`/api/wishlist/add/${stockId}`, {
          method: 'POST',
          headers: {
            'token': token,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsInWishlist(true);
          } else {
            alert(result.message || 'Failed to add to wishlist');
          }
        } else {
          const result = await response.json();
          alert(result.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(price);
  };

  if (isChecking) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${variant === 'horizontal' ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center justify-center ${variant === 'horizontal' ? 'gap-2' : 'flex-col gap-2'}`}>
          <Loader2 className="w-5 h-5 animate-spin text-themeTeal" />
          <span className="text-sm text-gray-600">Checking wishlist...</span>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Add to Wishlist</h3>
            <div className="text-xs text-gray-600">{stockName}</div>
            <div className="text-sm font-semibold text-themeTeal">₹{formatPrice(stockPrice)}</div>
          </div>
          
          <button
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              isInWishlist
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-themeTeal text-white hover:bg-themeTealLight'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isInWishlist ? (
              <HeartOff className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {isLoading 
              ? 'Processing...' 
              : isInWishlist 
                ? 'Remove' 
                : 'Add'
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-center">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Add to Wishlist</h3>
          <div className="text-xs text-gray-600 mb-1">{stockName}</div>
          <div className="text-sm font-semibold text-themeTeal">₹{formatPrice(stockPrice)}</div>
        </div>
        
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
            isInWishlist
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-themeTeal text-white hover:bg-themeTealLight'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isInWishlist ? (
            <HeartOff className="w-4 h-4" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          {isLoading 
            ? 'Processing...' 
            : isInWishlist 
              ? 'Remove from Wishlist' 
              : 'Add to Wishlist'
          }
        </button>
        
      </div>
    </div>
  );
}