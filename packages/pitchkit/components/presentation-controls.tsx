'use client'

import React, { useState, useEffect } from 'react'
import { Maximize, Minimize, Download, Tv } from 'lucide-react'

interface PresentationControlsProps {
  onExport?: () => void
  className?: string
}

export function PresentationControls({ onExport, className = '' }: PresentationControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTvMode, setIsTvMode] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const toggleTvMode = () => {
    setIsTvMode(!isTvMode)
    document.body.classList.toggle('tv-mode')
    if (!isTvMode && !isFullscreen) {
      toggleFullscreen()
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      window.print()
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex gap-2 print:hidden ${className}`}>
      <button
        onClick={toggleTvMode}
        className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800 transition-colors"
        aria-label="Modo TV"
      >
        <Tv className="h-4 w-4" />
        {isTvMode ? 'Salir TV' : 'Presentar en TV'}
      </button>

      <button
        onClick={toggleFullscreen}
        className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800 transition-colors"
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={handleExport}
        className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm text-stone-900 hover:bg-gold-400 transition-colors"
        aria-label="Exportar PDF"
      >
        <Download className="h-4 w-4" />
        Exportar PDF
      </button>
    </div>
  )
}