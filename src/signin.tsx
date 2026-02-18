
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/auth"
import { useTranslation } from "react-i18next"
import {
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  Check,
  Mail,
  Lock,
  ArrowRight,
  Sparkles
} from "lucide-react"
import animationVideo from "./assets/animation2.mp4"

interface Tenant {
  id: number
  instanceName: string
  companyName: string | null
  odooUrl: string
  odooDb: string
  email: string
  isActive: boolean
  createdAt: string
  lastSyncAt: string | null
}

const Signin: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [isFetchingTenants, setIsFetchingTenants] = useState(false)
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false)

  // Cast import.meta to any to bypass environment-specific type missing error
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isLoading) {
      navigate('/contacts', { replace: true })
    }
  }, [isAuthenticated, authLoading, isLoading, navigate])

  useEffect(() => {
    fetchTenants()
    const storedTenantId = localStorage.getItem('current_tenant_id')
    if (storedTenantId) {
      setSelectedTenantId(storedTenantId)
    }
  }, [])

  useEffect(() => {
    if (tenants.length === 1 && !selectedTenantId) {
      const singleTenantId = tenants[0].id.toString()
      setSelectedTenantId(singleTenantId)
      localStorage.setItem('current_tenant_id', singleTenantId)
    }
  }, [tenants, selectedTenantId])

  const fetchTenants = async () => {
    setIsFetchingTenants(true)
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/list`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTenants(data.tenants || [])
        }
      }
    } catch (e) {
      console.error('Failed to fetch tenants:', e)
    } finally {
      setIsFetchingTenants(false)
    }
  }

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setIsTenantDropdownOpen(false)
    if (tenantId) {
      localStorage.setItem('current_tenant_id', tenantId)
    } else {
      localStorage.removeItem('current_tenant_id')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      const result = await signIn(email, password)

      if (!result.success) {
        const defaultErrorMessage = "Invalid email or password. Please check your credentials."
        setErrorMsg(result.error || t(defaultErrorMessage))
        setIsLoading(false)
        return
      }

      if (result.setupRequired || result.redirectTo === '/setup') {
        setIsLoading(false)
        navigate('/setup', { replace: true })
        return
      }

      setIsLoading(false)
      navigate("/contacts", { replace: true })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  const selectedTenant = tenants.find(t => t.id.toString() === selectedTenantId)
  const selectedTenantDisplay = selectedTenant
    ? `${selectedTenant.instanceName}${selectedTenant.companyName ? ` (${selectedTenant.companyName})` : ''}`
    : "Select Instance"

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white font-['Space_Grotesk'] overflow-hidden">
      <style>{`
        @keyframes blurIn {
          0% { filter: blur(10px); opacity: 0; transform: translateY(10px); }
          100% { filter: blur(0); opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes flowGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-blur-in { animation: blurIn 1s cubic-bezier(0.19, 1, 0.22, 1) both; }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) both; }
        .animate-slide-right { animation: slideRight 0.8s cubic-bezier(0.19, 1, 0.22, 1) both; }
        
        .premium-button {
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .premium-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.3);
        }
        .premium-button:active {
          transform: translateY(0);
        }

        /* 3D Iridescent Liquid Glass Card Styles */
        .glass-card-3d {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-radius: 2.5rem;
          box-shadow: 
            0 40px 80px -20px rgba(0, 0, 0, 0.6),
            inset 0 0 0 1px rgba(255, 255, 255, 0.15),
            inset 0 10px 20px -5px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
          transition: transform 0.5s ease;
        }

        .glass-card-3d:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }

        .iridescent-border {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, 
            #FF0000, 
            #FF4500, 
            #FFD700, 
            #FF8C00, 
            #FF0000
          );
          background-size: 300% 300%;
          animation: flowGradient 6s linear infinite;
          z-index: -1;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          padding: 2.5px;
          border-radius: inherit;
          filter: brightness(1.2) drop-shadow(0 0 8px rgba(255, 69, 0, 0.4));
        }

        .liquid-reflection {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(
            to bottom, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            transparent 100%
          );
          pointer-events: none;
        }

        /* Premium Input Styling */
        .premium-input-container {
          position: relative;
          transition: all 0.3s ease;
        }

        .premium-input {
          background: #fdfdfd;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-input:focus {
          background: #fff;
          border-color: #000;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Left Section - Sign In Form (40%) */}
      <div className="w-full md:w-[40%] bg-white p-8 sm:p-12 lg:p-20 flex flex-col justify-center relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl font-['Space Grotesk'] font-bold mb-4 tracking-tight leading-none text-black">
              Sign In
            </h1>
            <p className="text-gray-500 mb-8 font-medium">
              Access your warehouse management dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inline Error Message */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold animate-blur-in">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative premium-input-container rounded-xl overflow-hidden">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-4 premium-input outline-none text-black font-semibold placeholder:text-gray-300 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-1.5 block">
                  Password
                </label>
                <div className="relative premium-input-container rounded-xl overflow-hidden">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 premium-input outline-none text-black font-semibold placeholder:text-gray-300 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Tenant Selection */}
              {tenants.length > 1 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-1.5 block">
                    Select Instance
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => !isLoading && setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                      className="w-full flex items-center justify-between premium-input rounded-xl px-4 py-4 text-left outline-none hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Building2 size={18} className="text-gray-400 shrink-0" />
                        <span className="truncate font-semibold text-black">
                          {isFetchingTenants ? "Fetching..." : selectedTenantDisplay}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${isTenantDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isTenantDropdownOpen && (
                      <div className="absolute bottom-full mb-2 z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-blur-in">
                        <div className="max-h-48 overflow-y-auto">
                          {tenants.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleTenantChange(t.id.toString())}
                              className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                              <span className="font-semibold text-sm group-hover:text-black transition-colors">{t.instanceName}</span>
                              {selectedTenantId === t.id.toString() && <Check size={16} className="text-black" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 premium-button group shadow-2xl shadow-black/10"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Log Into OCTOPUS</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <p className="text-gray-400 text-xs text-center font-medium">
              &copy; 2024 Octopus platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Video (60%) */}
      <div className="hidden md:block md:w-[60%] bg-[#f5f5f5] relative overflow-hidden animate-blur-in">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={animationVideo} type="video/mp4" />
        </video>
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-black/10" />

        {/* 3D Liquid Glass Tagline Card */}
        <div className="absolute bottom-12 right-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass-card-3d p-10 relative group">
            {/* Iridescent Border Wrapper */}
            <div className="iridescent-border" />
            
            {/* Liquid Shine Effects */}
            <div className="liquid-reflection" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/10 blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 opacity-60">
                <Sparkles size={14} className="text-orange-400" />
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white">System Intelligence</span>
              </div>
              <p className="text-white font-['Syne'] font-extrabold text-3xl leading-[1.1] uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                Optimizing<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-yellow-200">Operations</span><br />
                At Scale
              </p>
              <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-red-500 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin
