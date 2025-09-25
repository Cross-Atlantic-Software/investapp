'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CircleAlert, Eye, EyeOff, Lock, LogIn, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse JSON, use the status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('adminToken', data.data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.data.user));
        router.push('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-themeTealWhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-64 bg-themeTeal rounded-lg flex items-center justify-center mb-6 shadow-lg px-4">
            <Image
              src="/images/logo.svg"
              alt="InvestApp Logo"
              width={120}
              height={40}
              className="filter brightness-0 invert"
              priority
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded p-8 shadow-sm shadow-themeTeal/10">
          <h2 className="text-lg font-bold text-themeTeal font-serif mb-4 text-center">
            Admin Login
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="peer block w-full pl-10 pr-3 py-4 border border-themeTealLighter rounded text-themeTealLight focus:outline-none focus:border-themeTeal transition-all duration-200"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-3 -top-2 text-xs font-medium text-themeTealLight bg-white px-1 transition-all duration-200 peer-focus:text-themeTeal"
                >
                  Username<span className='text-rose-600'>*</span>
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className='text-themeTealLight'/>
                </div>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="peer block w-full pl-10 pr-12 py-4 border border-themeTealLighter rounded text-themeTealLight focus:outline-none focus:border-themeTeal transition-all duration-200"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-3 -top-2 text-xs font-medium text-themeTealLight bg-white px-1 transition-all duration-200 peer-focus:text-themeTeal"
                >
                  Password<span className='text-rose-600'>*</span>
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className='text-themeTealLight'/>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer transition-colors duration-200"
                >
                  {showPassword ? (
                    <Eye width='20' height='20' className='text-themeTealLighter'/>
                  ) : (
                    <EyeOff width='20' height='20' className='text-themeTealLighter'/>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CircleAlert className='text-red-700'/>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-themeSkyBlue hover:bg-themeTeal focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <LogIn width='20' height='20'className='me-1' />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn width='20' height='20'className='me-1' />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className='text-center'>
          <Button text='Go back to InvestApp website' color="skyblue" variant="link" size="nospace" className='text-sm gap-0' href='../../' icon={ArrowLeft} iconPosition='left' />
        </div>
      </div>
    </div>
  );
}
