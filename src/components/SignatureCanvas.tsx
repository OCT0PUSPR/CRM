"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../context/theme"
import { useRTL } from "../context/rtl"
import { Eraser, Check, RotateCcw, PenTool } from "lucide-react"
import { motion } from "framer-motion"

interface SignatureCanvasProps {
  onSave: (signature: string) => void
  onClear?: () => void
  savedSignature?: string
  width?: number
  height?: number
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  showSaveOption?: boolean
}

export function SignatureCanvas({
  onSave,
  onClear,
  savedSignature,
  width = 400,
  height = 200,
  strokeColor,
  strokeWidth = 2.5,
  backgroundColor,
  showSaveOption = true,
}: SignatureCanvasProps) {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [saveForLater, setSaveForLater] = useState(false)

  const defaultStrokeColor = strokeColor || (isDark ? "#e8e8f2" : "#1c1c28")
  const defaultBgColor = backgroundColor || (isDark ? "#16161f" : "#fafafc")

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Fill background
    ctx.fillStyle = defaultBgColor
    ctx.fillRect(0, 0, width, height)

    // Load saved signature if provided
    if (savedSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setHasSignature(true)
      }
      img.src = savedSignature
    }
  }, [width, height, defaultBgColor, savedSignature])

  const getCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ("touches" in event) {
        const touch = event.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(event)
      if (!coords) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
      ctx.strokeStyle = defaultStrokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      setIsDrawing(true)
      setHasSignature(true)
    },
    [getCoordinates, defaultStrokeColor, strokeWidth]
  )

  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      const coords = getCoordinates(event)
      if (!coords) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    },
    [isDrawing, getCoordinates]
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    ctx.fillStyle = defaultBgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onClear?.()
  }, [defaultBgColor, onClear])

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const dataUrl = canvas.toDataURL("image/png")
    onSave(dataUrl)

    // Save to localStorage if option is checked
    if (saveForLater) {
      localStorage.setItem("crm_saved_signature", dataUrl)
    }
  }, [hasSignature, onSave, saveForLater])

  const loadSavedSignature = useCallback(() => {
    const saved = localStorage.getItem("crm_saved_signature")
    if (!saved) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = defaultBgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHasSignature(true)
    }
    img.src = saved
  }, [defaultBgColor])

  const hasSavedSignature = typeof window !== "undefined" && !!localStorage.getItem("crm_saved_signature")

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas container */}
      <div className="relative">
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
            isDark
              ? "bg-slate-800/50 ring-1 ring-slate-700"
              : "bg-slate-50 ring-1 ring-slate-200"
          } ${isDrawing ? "ring-2 ring-violet-500/50" : ""}`}
        >
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            style={{ maxWidth: width, height: height }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Placeholder text */}
          {!hasSignature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                isDark ? "bg-slate-700/50" : "bg-white"
              }`}>
                <PenTool className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              </div>
              <span className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {t("quotations.signature.sign_here")}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={`flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <button
          onClick={clearCanvas}
          disabled={!hasSignature}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            hasSignature
              ? isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm"
              : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent"
          }`}
        >
          <Eraser className="w-4 h-4" />
          {t("quotations.signature.clear")}
        </button>

        {hasSavedSignature && (
          <button
            onClick={loadSavedSignature}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              isDark
                ? "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20"
                : "bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t("quotations.signature.use_saved")}
          </button>
        )}

        <div className={`flex-1 flex items-center justify-end gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          {showSaveOption && (
            <label className={`inline-flex items-center gap-2.5 text-sm cursor-pointer select-none ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={saveForLater}
                  onChange={(e) => setSaveForLater(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all peer-checked:bg-violet-500 peer-checked:border-violet-500 ${
                  isDark ? "border-slate-600" : "border-slate-300"
                }`} />
                <Check className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              {t("quotations.signature.save_signature")}
            </label>
          )}

          <button
            onClick={saveSignature}
            disabled={!hasSignature}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              hasSignature
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Check className="w-4 h-4" />
            {t("quotations.signature.accept_sign")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignatureCanvas
