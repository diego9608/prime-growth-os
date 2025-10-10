'use client'

import { useState } from 'react'
import { Lead } from '@prime-growth-os/types'
import {
  Search,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'

// Mock data for leads
const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    company: 'Constructora Reforma SA',
    contact: 'Ana García Mendoza',
    email: 'ana.garcia@reforma.mx',
    phone: '+52 55 1234-5678',
    projectType: 'comercial',
    budget: 2500000,
    timeline: 'Q2 2024',
    source: 'Google Ads',
    status: 'nuevo',
    createdAt: '2024-01-15T09:30:00Z',
    lastContact: '2024-01-15T09:30:00Z',
    slaHours: 2,
    priority: 'alta',
    notes: 'Interesados en oficinas corporativas de 1,200 m2. Requieren certificación LEED.'
  },
  {
    id: 'lead-002',
    company: 'Familia Rodríguez',
    contact: 'Carlos Rodríguez',
    email: 'carlos.rod@gmail.com',
    phone: '+52 55 9876-5432',
    projectType: 'residencial',
    budget: 850000,
    timeline: 'Q3 2024',
    source: 'Referido',
    status: 'contactado',
    createdAt: '2024-01-14T14:20:00Z',
    lastContact: '2024-01-15T10:45:00Z',
    slaHours: 18,
    priority: 'media',
    notes: 'Casa unifamiliar 280 m2. Presupuesto confirmado. Terreno ya adquirido en Santa Fe.'
  },
  {
    id: 'lead-003',
    company: 'Hotel Boutique Polanco',
    contact: 'María Elena Vázquez',
    email: 'mvazquez@hotelboutique.mx',
    phone: '+52 55 2468-1357',
    projectType: 'comercial',
    budget: 4200000,
    timeline: 'Q1 2025',
    source: 'LinkedIn Ads',
    status: 'propuesta',
    createdAt: '2024-01-12T11:15:00Z',
    lastContact: '2024-01-14T16:30:00Z',
    slaHours: 72,
    priority: 'alta',
    notes: 'Renovación completa de hotel 45 habitaciones. Requieren renders y cronograma detallado.'
  },
  {
    id: 'lead-004',
    company: 'Universidad Tecnológica',
    contact: 'Dr. Roberto Hernández',
    email: 'rhernandez@unitec.edu.mx',
    phone: '+52 55 3691-2580',
    projectType: 'institucional',
    budget: 8500000,
    timeline: 'Q4 2024',
    source: 'Email Marketing',
    status: 'negociacion',
    createdAt: '2024-01-10T08:45:00Z',
    lastContact: '2024-01-15T09:00:00Z',
    slaHours: 120,
    priority: 'alta',
    notes: 'Biblioteca central 2,500 m2. Proceso de licitación. Presentación programada para el 25 de enero.'
  },
  {
    id: 'lead-005',
    company: 'Desarrollo Los Cedros',
    contact: 'Ing. Patricia Luna',
    email: 'pluna@loscedros.mx',
    phone: '+52 55 7410-8529',
    projectType: 'residencial',
    budget: 1200000,
    timeline: 'Q3 2024',
    source: 'Facebook Ads',
    status: 'perdido',
    createdAt: '2024-01-08T13:20:00Z',
    lastContact: '2024-01-12T11:30:00Z',
    slaHours: 96,
    priority: 'baja',
    notes: 'Desarrollo residencial 15 casas. Se perdió por precio. Competidor ofreció 20% menos.'
  }
]

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(mockLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-100 text-blue-800'
      case 'contactado': return 'bg-yellow-100 text-yellow-800'
      case 'propuesta': return 'bg-purple-100 text-purple-800'
      case 'negociacion': return 'bg-orange-100 text-orange-800'
      case 'ganado': return 'bg-green-100 text-green-800'
      case 'perdido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'alta': return 'text-red-600'
      case 'media': return 'text-yellow-600'
      case 'baja': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getSLAStatus = (lead: Lead) => {
    const hoursElapsed = Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60))
    const remaining = lead.slaHours - hoursElapsed

    if (remaining <= 0) return { status: 'overdue', text: 'Vencido', color: 'text-red-600' }
    if (remaining <= 4) return { status: 'urgent', text: `${remaining}h restantes`, color: 'text-orange-600' }
    return { status: 'ok', text: `${remaining}h restantes`, color: 'text-green-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Leads</h1>
          <p className="text-gray-600 mt-2">
            {filteredLeads.length} leads activos • {leads.filter(l => l.status === 'nuevo').length} nuevos • {leads.filter(l => getSLAStatus(l).status === 'urgent').length} urgentes
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
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
                placeholder="Empresa o contacto..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="propuesta">Propuesta</option>
              <option value="negociacion">Negociación</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
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

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">Lead</th>
                <th className="px-6 py-3 text-left">Proyecto</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">SLA</th>
                <th className="px-6 py-3 text-left">Presupuesto</th>
                <th className="px-6 py-3 text-left">Fuente</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const slaStatus = getSLAStatus(lead)
                return (
                  <tr key={lead.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.company}</div>
                          <div className="text-sm text-gray-500">{lead.contact}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{lead.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{lead.projectType}</div>
                      <div className="text-sm text-gray-500">{lead.timeline}</div>
                      <div className={`inline-flex items-center text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {lead.priority.toUpperCase()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(lead.status)} capitalize`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${slaStatus.color}`}>
                          {slaStatus.text}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          ${lead.budget.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{lead.source}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900 p-1">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900 p-1">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900 p-1">
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Nuevos Esta Semana</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {leads.filter(l => l.status === 'nuevo').length}
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
                <dt className="text-sm font-medium text-gray-500 truncate">SLA Crítico</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {leads.filter(l => getSLAStatus(l).status === 'urgent').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Total</dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${leads.filter(l => l.status !== 'perdido').reduce((sum, l) => sum + l.budget, 0).toLocaleString('es-MX')}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversión</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {Math.round((leads.filter(l => l.status === 'ganado').length / leads.length) * 100)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}