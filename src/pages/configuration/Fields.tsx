"use client"

import React from "react"
import { useTheme } from "../../../context/theme"

export default function Fields() {
  const { mode } = useTheme()
  const isDark = mode === "dark"

  return (
    <main className={`flex-1 overflow-auto p-4 sm:p-6 w-full min-h-screen ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-2xl font-semibold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Fields
        </h1>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Coming Soon
        </p>
      </div>
    </main>
  )
}
