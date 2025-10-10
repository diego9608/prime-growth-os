'use client'

import { useState } from 'react'
import { Vendor } from '@prime-growth-os/types'
import {
  Truck,
  Star,
  Clock,
  DollarSign,
  Award,
  Phone,
  Mail,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

// Mock data for vendors
const mockVendors: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'Construcciones Elite SA',
    category: 'Construcción General',
    contactPerson: 'Ing. Fernando López',
    email: 'flopez@elite.mx',
    phone: '+52 55 1234-5678',
    otifScore: 94,
    qualityRating: 4.8,
    costRating: 4.2,
    responseTime: 4.5,
    certifications: ['ISO 9001', 'LEED AP', 'OSHA'],
    status: 'activo',
    lastDelivery: '2024-01-10',
    totalOrders: 45,
    averageOrderValue: 185000
  },
  {
    id: 'vendor-002',
    name: 'Materiales Premium',
    category: 'Materiales de Construcción',
    contactPerson: 'Lic. Ana García',
    email: 'ventas@premium.mx',
    phone: '+52 55 9876-5432',
    otifScore: 88,
    qualityRating: 4.5,
    costRating: 3.8,
    responseTime: 6.2,
    certifications: ['ISO 14001', 'NOM-008'],
    status: 'activo',
    lastDelivery: '2024-01-12',
    totalOrders: 78,
    averageOrderValue: 95000
  },
  {
    id: 'vendor-003',
    name: 'Instalaciones Especializadas',
    category: 'MEP (Mecánico, Eléctrico, Plomería)',
    contactPerson: 'Ing. Carlos Mendoza',
    email: 'cmendoza@instalaciones.mx',
    phone: '+52 55 2468-1357',
    otifScore: 91,
    qualityRating: 4.6,
    costRating: 4.0,
    responseTime: 5.1,
    certifications: ['NFPA', 'IEEE', 'ASHRAE'],
    status: 'activo',
    lastDelivery: '2024-01-08',
    totalOrders: 32,
    averageOrderValue: 245000
  },
  {
    id: 'vendor-004',
    name: 'Acabados de Lujo',
    category: 'Acabados y Revestimientos',
    contactPerson: 'Arq. Patricia Luna',
    email: 'pluna@acabados.mx',
    phone: '+52 55 7410-8529',
    otifScore: 76,
    qualityRating: 4.9,
    costRating: 3.2,
    responseTime: 8.7,
    certifications: ['GREENGUARD', 'LEED'],
    status: 'en_evaluacion',
    lastDelivery: '2024-01-05',
    totalOrders: 18,
    averageOrderValue: 320000
  }
]

export default function VendorsPage() {
  const [vendors] = useState<Vendor[]>(mockVendors)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getOTIFColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800'
      case 'inactivo': return 'bg-red-100 text-red-800'
      case 'en_evaluacion': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="text-gray-600 mt-2">
            {filteredVendors.length} proveedores registrados • OTIF promedio: {Math.round(vendors.reduce((sum, v) => sum + v.otifScore, 0) / vendors.length)}%
          </p>
        </div>
        <button className="btn-primary">
          <Truck className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre o contacto..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="Construcción General">Construcción General</option>
              <option value="Materiales de Construcción">Materiales</option>
              <option value="MEP (Mecánico, Eléctrico, Plomería)">MEP</option>
              <option value="Acabados y Revestimientos">Acabados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="en_evaluacion">En Evaluación</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="btn-outline w-full">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </button>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`badge ${getStatusColor(vendor.status)}`}>
                  {vendor.status.replace('_', ' ')}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">{vendor.contactPerson}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{vendor.phone}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">OTIF Score</span>
                  {vendor.otifScore >= 95 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                </div>
                <p className={`text-lg font-bold ${getOTIFColor(vendor.otifScore)}`}>
                  {vendor.otifScore}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-600">Tiempo Respuesta</span>
                <p className="text-lg font-bold text-gray-900">
                  {vendor.responseTime}h
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-600">Calidad</span>
                <div className="flex items-center space-x-1">
                  {renderStars(vendor.qualityRating)}
                  <span className="text-sm text-gray-600 ml-1">{vendor.qualityRating}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-600">Costo</span>
                <div className="flex items-center space-x-1">
                  {renderStars(vendor.costRating)}
                  <span className="text-sm text-gray-600 ml-1">{vendor.costRating}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span>{vendor.totalOrders} órdenes</span>
              <span>Promedio: ${vendor.averageOrderValue.toLocaleString('es-MX')}</span>
              <span>Última entrega: {new Date(vendor.lastDelivery).toLocaleDateString('es-MX')}</span>
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Certificaciones:</p>
              <div className="flex flex-wrap gap-1">
                {vendor.certifications.map((cert, index) => (
                  <span key={index} className="badge bg-blue-100 text-blue-800 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="btn-primary text-sm flex-1">
                Nueva Orden
              </button>
              <button className="btn-outline text-sm flex-1">
                Ver Historial
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Proveedores Activos</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {vendors.filter(v => v.status === 'activo').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">OTIF Promedio</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {Math.round(vendors.reduce((sum, v) => sum + v.otifScore, 0) / vendors.length)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Tiempo Respuesta</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {Math.round(vendors.reduce((sum, v) => sum + v.responseTime, 0) / vendors.length * 10) / 10}h
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Valor Promedio</dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${Math.round(vendors.reduce((sum, v) => sum + v.averageOrderValue, 0) / vendors.length).toLocaleString('es-MX')}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}