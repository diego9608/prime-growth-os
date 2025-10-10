'use client'

import { useState } from 'react'
import { Project, StageGatePhase } from '@prime-growth-os/types'
import {
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
  Flag
} from 'lucide-react'

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Oficinas Corporativas Reforma',
    client: 'Constructora Reforma SA',
    type: 'comercial',
    budget: 2500000,
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    status: 'diseno',
    manager: 'Arq. María González',
    team: ['Arq. Carlos López', 'Ing. Ana Martínez', 'Dis. Pablo Ruiz'],
    progress: 35,
    phases: [
      {
        id: 'phase-1',
        name: 'Planificación y Concepto',
        description: 'Desarrollo del concepto arquitectónico y planificación inicial',
        duration: 30,
        deliverables: ['Brief del proyecto', 'Análisis de sitio', 'Conceptos iniciales', 'Presupuesto preliminar'],
        approvalRequired: true,
        status: 'completada'
      },
      {
        id: 'phase-2',
        name: 'Desarrollo de Diseño',
        description: 'Diseño detallado y documentación técnica',
        duration: 45,
        deliverables: ['Planos arquitectónicos', 'Renders 3D', 'Especificaciones técnicas', 'Planos MEP'],
        approvalRequired: true,
        status: 'en_progreso'
      },
      {
        id: 'phase-3',
        name: 'Documentación y Entrega',
        description: 'Finalización de documentos ejecutivos y entrega',
        duration: 30,
        deliverables: ['Planos ejecutivos', 'Manual de usuario', 'Certificaciones', 'Entrega final'],
        approvalRequired: true,
        status: 'pendiente'
      }
    ]
  },
  {
    id: 'proj-002',
    name: 'Casa Unifamiliar Santa Fe',
    client: 'Familia Rodríguez',
    type: 'residencial',
    budget: 850000,
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    status: 'planificacion',
    manager: 'Arq. Roberto Herrera',
    team: ['Arq. Laura Jiménez', 'Ing. Miguel Torres'],
    progress: 15,
    phases: [
      {
        id: 'phase-1',
        name: 'Planificación y Concepto',
        description: 'Desarrollo del concepto arquitectónico y planificación inicial',
        duration: 20,
        deliverables: ['Brief del proyecto', 'Análisis de sitio', 'Conceptos iniciales'],
        approvalRequired: true,
        status: 'en_progreso'
      },
      {
        id: 'phase-2',
        name: 'Desarrollo de Diseño',
        description: 'Diseño detallado y documentación técnica',
        duration: 35,
        deliverables: ['Planos arquitectónicos', 'Renders 3D', 'Especificaciones técnicas'],
        approvalRequired: true,
        status: 'pendiente'
      },
      {
        id: 'phase-3',
        name: 'Documentación y Entrega',
        description: 'Finalización de documentos ejecutivos y entrega',
        duration: 20,
        deliverables: ['Planos ejecutivos', 'Manual de usuario', 'Entrega final'],
        approvalRequired: true,
        status: 'pendiente'
      }
    ]
  }
]

export default function StageGatePage() {
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0])

  const getPhaseStatusColor = (status: StageGatePhase['status']) => {
    switch (status) {
      case 'completada': return 'bg-green-100 text-green-800'
      case 'en_progreso': return 'bg-blue-100 text-blue-800'
      case 'pendiente': return 'bg-gray-100 text-gray-800'
      case 'bloqueada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhaseIcon = (status: StageGatePhase['status']) => {
    switch (status) {
      case 'completada': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'en_progreso': return <Clock className="h-5 w-5 text-blue-600" />
      case 'pendiente': return <Clock className="h-5 w-5 text-gray-400" />
      case 'bloqueada': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getProjectStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planificacion': return 'bg-yellow-100 text-yellow-800'
      case 'diseno': return 'bg-blue-100 text-blue-800'
      case 'construccion': return 'bg-orange-100 text-orange-800'
      case 'entrega': return 'bg-purple-100 text-purple-800'
      case 'completado': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stage Gate Management</h1>
          <p className="text-gray-600 mt-2">
            Control de fases y entregables por proyecto arquitectónico
          </p>
        </div>
        <button className="btn-primary">
          <GitBranch className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Proyectos Activos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                    selectedProject?.id === project.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                    <span className={`badge ${getProjectStatusColor(project.status)} text-xs`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{project.client}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{project.progress}% completado</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-primary-500 h-1 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Details and Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {selectedProject && (
            <>
              {/* Project Header */}
              <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                    <p className="text-gray-600">{selectedProject.client}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${getProjectStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                    <button className="btn-outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Inicio</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(selectedProject.startDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Entrega</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(selectedProject.endDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Manager</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedProject.manager}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Presupuesto</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      ${selectedProject.budget.toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso General</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Equipo del Proyecto</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.team.map((member, index) => (
                      <span key={index} className="badge bg-blue-100 text-blue-800">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage Gate Timeline */}
              <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Timeline de Fases</h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-8">
                    {selectedProject.phases.map((phase, index) => (
                      <div key={phase.id} className="relative flex items-start">
                        {/* Timeline Node */}
                        <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center relative z-10">
                          {getPhaseIcon(phase.status)}
                        </div>

                        {/* Phase Content */}
                        <div className="ml-6 flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{phase.name}</h4>
                                <p className="text-sm text-gray-600">{phase.description}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`badge ${getPhaseStatusColor(phase.status)}`}>
                                  {phase.status.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">{phase.duration} días</span>
                              </div>
                            </div>

                            {/* Deliverables */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Entregables:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {phase.deliverables.map((deliverable, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-600">{deliverable}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            {phase.status === 'en_progreso' && (
                              <div className="flex items-center space-x-3">
                                <button className="btn-primary text-xs px-3 py-1">
                                  <Play className="h-3 w-3 mr-1" />
                                  Continuar
                                </button>
                                <button className="btn-outline text-xs px-3 py-1">
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pausar
                                </button>
                                <button className="btn-outline text-xs px-3 py-1">
                                  Ver Detalles
                                </button>
                              </div>
                            )}

                            {phase.status === 'pendiente' && (
                              <div className="flex items-center space-x-3">
                                <button className="btn-primary text-xs px-3 py-1">
                                  <Play className="h-3 w-3 mr-1" />
                                  Iniciar Fase
                                </button>
                                <button className="btn-outline text-xs px-3 py-1">
                                  Ver Requisitos
                                </button>
                              </div>
                            )}

                            {phase.approvalRequired && phase.status === 'completada' && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm text-green-800">
                                    Fase aprobada por el cliente
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Proyectos Activos</dt>
                <dd className="text-lg font-medium text-gray-900">{projects.length}</dd>
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
                <dt className="text-sm font-medium text-gray-500 truncate">Fases en Progreso</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {projects.reduce((count, p) => count + p.phases.filter(ph => ph.status === 'en_progreso').length, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Fases Completadas</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {projects.reduce((count, p) => count + p.phases.filter(ph => ph.status === 'completada').length, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Fases Bloqueadas</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {projects.reduce((count, p) => count + p.phases.filter(ph => ph.status === 'bloqueada').length, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}