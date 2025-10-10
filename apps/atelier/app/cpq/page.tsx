'use client'

import { useState } from 'react'
import { CPQTier, CPQQuote } from '@prime-growth-os/types'
import { pricingTiers, calculateQuotePrice } from '@prime-growth-os/engine'
import {
  Calculator,
  Check,
  Clock,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Send,
  Eye,
  Edit,
  Download
} from 'lucide-react'

// Mock data for quotes
const mockQuotes: CPQQuote[] = [
  {
    id: 'quote-001',
    leadId: 'lead-001',
    tier: 'signature',
    customizations: ['renders_adicionales', 'certificacion_leed'],
    totalPrice: 275000,
    createdAt: '2024-01-15T10:30:00Z',
    status: 'enviada',
    validUntil: '2024-02-15T23:59:59Z'
  },
  {
    id: 'quote-002',
    leadId: 'lead-002',
    tier: 'core',
    customizations: ['recorrido_virtual'],
    totalPrice: 110000,
    createdAt: '2024-01-14T15:20:00Z',
    status: 'aceptada',
    validUntil: '2024-02-14T23:59:59Z'
  },
  {
    id: 'quote-003',
    leadId: 'lead-003',
    tier: 'masterpiece',
    customizations: ['recorrido_virtual', 'mobiliario_personalizado'],
    totalPrice: 415000,
    createdAt: '2024-01-12T12:45:00Z',
    status: 'borrador',
    validUntil: '2024-02-12T23:59:59Z'
  }
]

export default function CPQPage() {
  const [quotes] = useState<CPQQuote[]>(mockQuotes)
  const [selectedTier, setSelectedTier] = useState<string>('core')
  const [customizations, setCustomizations] = useState<string[]>([])
  const [projectSize, setProjectSize] = useState<number>(1)
  const [urgency, setUrgency] = useState<'normal' | 'expedito' | 'urgente'>('normal')

  const priceCalculation = calculateQuotePrice(selectedTier, customizations, projectSize, urgency)

  const toggleCustomization = (customization: string) => {
    setCustomizations(prev =>
      prev.includes(customization)
        ? prev.filter(c => c !== customization)
        : [...prev, customization]
    )
  }

  const getQuoteStatusColor = (status: CPQQuote['status']) => {
    switch (status) {
      case 'borrador': return 'bg-gray-100 text-gray-800'
      case 'enviada': return 'bg-blue-100 text-blue-800'
      case 'aceptada': return 'bg-green-100 text-green-800'
      case 'rechazada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const customizationOptions = [
    { id: 'renders_adicionales', name: 'Renders Adicionales', price: 8500 },
    { id: 'recorrido_virtual', name: 'Recorrido Virtual VR', price: 25000 },
    { id: 'modelado_avanzado', name: 'Modelado BIM Avanzado', price: 35000 },
    { id: 'certificacion_leed', name: 'Certificación LEED', price: 45000 },
    { id: 'diseño_paisajismo', name: 'Diseño de Paisajismo', price: 28000 },
    { id: 'mobiliario_personalizado', name: 'Mobiliario Personalizado', price: 40000 },
    { id: 'consultoria_feng_shui', name: 'Consultoría Feng Shui', price: 15000 },
    { id: 'automatizacion_hogar', name: 'Automatización del Hogar', price: 55000 },
    { id: 'sistema_seguridad', name: 'Sistema de Seguridad', price: 32000 },
    { id: 'paneles_solares', name: 'Integración Paneles Solares', price: 18000 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configure, Price, Quote (CPQ)</h1>
          <p className="text-gray-600 mt-2">
            Sistema de cotización inteligente para proyectos arquitectónicos
          </p>
        </div>
        <button className="btn-primary">
          <Calculator className="h-4 w-4 mr-2" />
          Nueva Cotización
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPQ Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Tiers */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Planes Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedTier === tier.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                    {selectedTier === tier.id && (
                      <Check className="h-5 w-5 text-primary-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${tier.basePrice.toLocaleString('es-MX')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {tier.deliveryTime} días
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Equipo de {tier.teamSize}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">Incluye:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {tier.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                          {feature}
                        </li>
                      ))}
                      {tier.features.length > 3 && (
                        <li className="text-primary-600">
                          +{tier.features.length - 3} características más
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customizations */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalizaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customizationOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    customizations.includes(option.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleCustomization(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                      <p className="text-sm text-gray-600">
                        +${option.price.toLocaleString('es-MX')}
                      </p>
                    </div>
                    {customizations.includes(option.id) && (
                      <Check className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Parameters */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Parámetros del Proyecto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador de Tamaño
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={projectSize}
                  onChange={(e) => setProjectSize(parseFloat(e.target.value))}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.0 = Proyecto estándar, 2.0 = Doble tamaño
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgencia
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as 'normal' | 'expedito' | 'urgente')}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="normal">Normal</option>
                  <option value="expedito">Expedito (+25%)</option>
                  <option value="urgente">Urgente (+50%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Entrega
                </label>
                <div className="py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                  {priceCalculation.tier ? (
                    urgency === 'urgente'
                      ? Math.ceil(priceCalculation.tier.deliveryTime * 0.6)
                      : urgency === 'expedito'
                      ? Math.ceil(priceCalculation.tier.deliveryTime * 0.8)
                      : priceCalculation.tier.deliveryTime
                  ) : 0} días
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen de Cotización</h2>

            {priceCalculation.tier && (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Plan {priceCalculation.tier.name}
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="font-medium">
                      ${priceCalculation.basePrice.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>

                {priceCalculation.customizationCost > 0 && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Personalizaciones</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo adicional:</span>
                      <span className="font-medium">
                        ${priceCalculation.customizationCost.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                )}

                {priceCalculation.sizePremium > 0 && (
                  <div className="border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ajuste por tamaño:</span>
                      <span className="font-medium">
                        ${priceCalculation.sizePremium.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                )}

                {priceCalculation.urgencyPremium > 0 && (
                  <div className="border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ajuste por urgencia:</span>
                      <span className="font-medium">
                        ${priceCalculation.urgencyPremium.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${priceCalculation.totalPrice.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cotización válida por 30 días
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button className="btn-primary w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Cotización
                  </button>
                  <button className="btn-outline w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cotizaciones Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Válida Hasta</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString('es-MX')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{quote.tier}</div>
                    <div className="text-sm text-gray-500">
                      {quote.customizations.length} personalizaciones
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${quote.totalPrice.toLocaleString('es-MX')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getQuoteStatusColor(quote.status)} capitalize`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quote.validUntil).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900 p-1">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}