'use client'

import { useState } from 'react'
import { CaseStudy } from '@prime-growth-os/types'
import {
  FileText,
  Star,
  Clock,
  Users,
  DollarSign,
  Award,
  Eye,
  Share,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  Home,
  Briefcase
} from 'lucide-react'

// Mock data for case studies
const mockCaseStudies: CaseStudy[] = [
  {
    id: 'case-001',
    title: 'Torre Corporativa Sustentable Polanco',
    client: 'Grupo Inmobiliario Premium',
    projectType: 'comercial',
    description: 'Diseño de torre corporativa de 25 pisos con certificación LEED Platinum y tecnologías innovadoras de eficiencia energética.',
    challenge: 'Crear un edificio que cumpliera con los más altos estándares de sostenibilidad mientras mantenía la funcionalidad corporativa y un diseño arquitectónico distintivo.',
    solution: 'Implementamos un sistema integral de fachada inteligente, energía renovable, y espacios verdes verticales que reducen el consumo energético en 40%.',
    results: [
      'Certificación LEED Platinum obtenida',
      '40% reducción en consumo energético',
      '95% satisfacción de inquilinos',
      'Premio Nacional de Arquitectura Sustentable 2023'
    ],
    images: [
      '/images/torre-polanco-1.jpg',
      '/images/torre-polanco-2.jpg',
      '/images/torre-polanco-3.jpg'
    ],
    duration: 24,
    budget: 15000000,
    teamSize: 12,
    technologies: ['BIM 360', 'Revit', 'Rhino', 'Grasshopper', 'Enscape'],
    awards: [
      'Premio Nacional Arquitectura Sustentable 2023',
      'LEED Platinum Certification',
      'Green Building Award México'
    ],
    publishedAt: '2023-12-15',
    featured: true
  },
  {
    id: 'case-002',
    title: 'Residencia Minimalista Valle de Bravo',
    client: 'Familia Martínez',
    projectType: 'residencial',
    description: 'Casa de descanso de 450 m2 que integra arquitectura contemporánea con el entorno natural del bosque, maximizando vistas al lago.',
    challenge: 'Diseñar una residencia que se integrara armoniosamente con el bosque existente sin sacrificar comfort y funcionalidad moderna.',
    solution: 'Desarrollamos un diseño escalonado que sigue la topografía natural, con materiales locales y grandes ventanales que enmarcan las vistas.',
    results: [
      'Integración perfecta con el entorno',
      'Cero árboles talados durante construcción',
      'Sistema de captación de agua pluvial',
      'Publicación en Architectural Digest México'
    ],
    images: [
      '/images/valle-bravo-1.jpg',
      '/images/valle-bravo-2.jpg'
    ],
    duration: 18,
    budget: 4500000,
    teamSize: 6,
    technologies: ['SketchUp', 'V-Ray', 'AutoCAD', 'Photoshop'],
    awards: [
      'Architectural Digest Home of the Year',
      'Premio Diseño Sustentable 2023'
    ],
    publishedAt: '2023-11-20',
    featured: true
  },
  {
    id: 'case-003',
    title: 'Campus Universitario Tecnológico',
    client: 'Universidad Tecnológica de México',
    projectType: 'institucional',
    description: 'Masterplan y diseño de 5 edificios para campus universitario con capacidad para 8,000 estudiantes.',
    challenge: 'Crear espacios educativos flexibles que fomenten la colaboración y el aprendizaje innovador, con presupuesto optimizado.',
    solution: 'Diseñamos módulos prefabricados adaptables con espacios multifuncionales y tecnología integrada.',
    results: [
      'Capacidad para 8,000 estudiantes',
      '30% ahorro en costos vs construcción tradicional',
      'Espacios 100% accesibles',
      'Certificación LEED Gold'
    ],
    images: [
      '/images/campus-tech-1.jpg'
    ],
    duration: 36,
    budget: 25000000,
    teamSize: 18,
    technologies: ['Revit', 'Navisworks', 'Civil 3D', '3ds Max'],
    awards: [
      'Excellence in Educational Design Award'
    ],
    publishedAt: '2023-10-10',
    featured: false
  }
]

export default function CasesPage() {
  const [caseStudies] = useState<CaseStudy[]>(mockCaseStudies)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)

  const filteredCases = caseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || caseStudy.projectType === typeFilter
    const matchesFeatured = !featuredOnly || caseStudy.featured

    return matchesSearch && matchesType && matchesFeatured
  })

  const getProjectTypeIcon = (type: CaseStudy['projectType']) => {
    switch (type) {
      case 'residencial': return <Home className="h-4 w-4" />
      case 'comercial': return <Building2 className="h-4 w-4" />
      case 'institucional': return <Briefcase className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const getProjectTypeColor = (type: CaseStudy['projectType']) => {
    switch (type) {
      case 'residencial': return 'bg-green-100 text-green-800'
      case 'comercial': return 'bg-blue-100 text-blue-800'
      case 'institucional': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedCase) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedCase(null)}
            className="btn-outline"
          >
            ← Volver a Casos
          </button>
          <div className="flex space-x-3">
            <button className="btn-outline">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </button>
            <button className="btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Case Study Detail */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">{selectedCase.title}</h1>
                <p className="text-xl opacity-90">{selectedCase.client}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                {getProjectTypeIcon(selectedCase.projectType)}
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedCase.projectType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium text-gray-900">{selectedCase.duration} meses</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Presupuesto</p>
                  <p className="font-medium text-gray-900">${selectedCase.budget.toLocaleString('es-MX')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Equipo</p>
                  <p className="font-medium text-gray-900">{selectedCase.teamSize} personas</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción del Proyecto</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{selectedCase.description}</p>
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-900 mb-3">Desafío</h3>
                <p className="text-red-800">{selectedCase.challenge}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-900 mb-3">Solución</h3>
                <p className="text-green-800">{selectedCase.solution}</p>
              </div>
            </div>

            {/* Results */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resultados Clave</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCase.results.map((result, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-blue-900 font-medium">{result}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tecnologías Utilizadas</h2>
              <div className="flex flex-wrap gap-2">
                {selectedCase.technologies.map((tech, index) => (
                  <span key={index} className="badge bg-gray-100 text-gray-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Awards */}
            {selectedCase.awards.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reconocimientos</h2>
                <div className="space-y-3">
                  {selectedCase.awards.map((award, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-900 font-medium">{award}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Casos de Estudio</h1>
          <p className="text-gray-600 mt-2">
            Portfolio de proyectos destacados y casos de éxito del estudio
          </p>
        </div>
        <button className="btn-primary">
          <FileText className="h-4 w-4 mr-2" />
          Nuevo Caso
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Título, cliente o descripción..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Proyecto</label>
            <select
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="institucional">Institucional</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="space-y-2 w-full">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Solo destacados</span>
              </label>
              <button className="btn-outline w-full">
                <Filter className="h-4 w-4 mr-2" />
                Más filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((caseStudy) => (
          <div
            key={caseStudy.id}
            className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden cursor-pointer card-hover"
            onClick={() => setSelectedCase(caseStudy)}
          >
            {/* Case Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute top-4 left-4">
                <span className={`badge ${getProjectTypeColor(caseStudy.projectType)} flex items-center space-x-1`}>
                  {getProjectTypeIcon(caseStudy.projectType)}
                  <span className="capitalize">{caseStudy.projectType}</span>
                </span>
              </div>
              {caseStudy.featured && (
                <div className="absolute top-4 right-4">
                  <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Destacado</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">{caseStudy.title}</h3>
                <p className="text-sm opacity-90">{caseStudy.client}</p>
              </div>
            </div>

            {/* Case Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {caseStudy.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{caseStudy.duration}m</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <DollarSign className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      ${(caseStudy.budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{caseStudy.teamSize}</span>
                  </div>
                </div>
              </div>

              {/* Awards */}
              {caseStudy.awards.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {caseStudy.awards.length} reconocimiento{caseStudy.awards.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(caseStudy.publishedAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-900 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-primary-600 hover:text-primary-900 p-1">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron casos</h3>
          <p className="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setTypeFilter('all')
              setFeaturedOnly(false)
            }}
            className="btn-outline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Casos</dt>
                <dd className="text-lg font-medium text-gray-900">{caseStudies.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Destacados</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {caseStudies.filter(c => c.featured).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Premios</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {caseStudies.reduce((total, c) => total + c.awards.length, 0)}
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
                <dt className="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${(caseStudies.reduce((total, c) => total + c.budget, 0) / 1000000).toFixed(0)}M
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}