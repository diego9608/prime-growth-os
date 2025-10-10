'use client'

import { useState } from 'react'
import { FinanceMetric, CashFlowItem } from '@prime-growth-os/types'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle
} from 'lucide-react'

// Mock data for finance metrics
const mockFinanceMetrics: FinanceMetric[] = [
  {
    id: 'revenue-monthly',
    name: 'Ingresos Mensuales',
    value: 1850000,
    target: 2000000,
    period: 'Enero 2024',
    trend: 'up',
    category: 'revenue'
  },
  {
    id: 'gross-margin',
    name: 'Margen Bruto',
    value: 28,
    target: 35,
    period: 'Enero 2024',
    trend: 'down',
    category: 'margin'
  },
  {
    id: 'operating-cash-flow',
    name: 'Flujo de Caja Operativo',
    value: 425000,
    target: 500000,
    period: 'Enero 2024',
    trend: 'up',
    category: 'cash_flow'
  },
  {
    id: 'accounts-receivable',
    name: 'Cuentas por Cobrar',
    value: 1250000,
    target: 1000000,
    period: 'Enero 2024',
    trend: 'up',
    category: 'cash_flow'
  },
  {
    id: 'project-profitability',
    name: 'Rentabilidad por Proyecto',
    value: 22,
    target: 30,
    period: 'Enero 2024',
    trend: 'stable',
    category: 'efficiency'
  },
  {
    id: 'overhead-ratio',
    name: 'Ratio de Gastos Generales',
    value: 18,
    target: 15,
    period: 'Enero 2024',
    trend: 'up',
    category: 'efficiency'
  }
]

const mockCashFlow: CashFlowItem[] = [
  {
    id: 'cf-001',
    date: '2024-01-15',
    description: 'Pago Proyecto Oficinas Reforma',
    amount: 750000,
    type: 'income',
    category: 'Proyectos',
    projectId: 'proj-001'
  },
  {
    id: 'cf-002',
    date: '2024-01-14',
    description: 'Nómina Enero',
    amount: -285000,
    type: 'expense',
    category: 'Personal'
  },
  {
    id: 'cf-003',
    date: '2024-01-12',
    description: 'Compra Software Diseño',
    amount: -45000,
    type: 'expense',
    category: 'Tecnología'
  },
  {
    id: 'cf-004',
    date: '2024-01-10',
    description: 'Anticipo Casa Santa Fe',
    amount: 320000,
    type: 'income',
    category: 'Proyectos',
    projectId: 'proj-002'
  },
  {
    id: 'cf-005',
    date: '2024-01-08',
    description: 'Renta Oficina',
    amount: -65000,
    type: 'expense',
    category: 'Operación'
  }
]

export default function FinancePage() {
  const [metrics] = useState<FinanceMetric[]>(mockFinanceMetrics)
  const [cashFlow] = useState<CashFlowItem[]>(mockCashFlow)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const getTrendIcon = (trend: FinanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getMetricColor = (value: number, target: number, category: string) => {
    const ratio = value / target
    if (category === 'revenue' || category === 'cash_flow') {
      if (ratio >= 0.95) return 'text-green-600'
      if (ratio >= 0.8) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // For efficiency metrics, lower might be better
      if (ratio <= 1.05) return 'text-green-600'
      if (ratio <= 1.2) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const totalIncome = cashFlow.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = cashFlow.filter(item => item.type === 'expense').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const netCashFlow = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financiero</h1>
          <p className="text-gray-600 mt-2">
            Análisis completo de métricas financieras y flujo de caja
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="py-2 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
          <button className="btn-primary">
            <PieChart className="h-4 w-4 mr-2" />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ingresos</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              ${totalIncome.toLocaleString('es-MX')}
            </p>
            <p className="text-sm text-gray-600">+12% vs mes anterior</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Gastos</h3>
            </div>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              ${totalExpenses.toLocaleString('es-MX')}
            </p>
            <p className="text-sm text-gray-600">-5% vs mes anterior</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${
                netCashFlow >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Flujo Neto</h3>
            </div>
            {netCashFlow >= 0 ? 
              <TrendingUp className="h-5 w-5 text-green-600" /> : 
              <TrendingDown className="h-5 w-5 text-red-600" />
            }
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${
              netCashFlow >= 0 ? 'text-gray-900' : 'text-red-600'
            }`}>
              ${netCashFlow.toLocaleString('es-MX')}
            </p>
            <p className="text-sm text-gray-600">
              {netCashFlow >= 0 ? 'Flujo positivo' : 'Requiere atención'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${
                netCashFlow >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`} style={{ width: netCashFlow >= 0 ? '85%' : '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Métricas Financieras Detalladas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${
                    getMetricColor(metric.value, metric.target, metric.category)
                  }`}>
                    {metric.category === 'revenue' || metric.category === 'cash_flow' ? 
                      `$${metric.value.toLocaleString('es-MX')}` : 
                      `${metric.value}%`
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{metric.period}</p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Objetivo</span>
                  <span>
                    {Math.round((metric.value / metric.target) * 100)}% alcanzado
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.value >= metric.target ? 'bg-green-500' : 
                      metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Meta: {metric.category === 'revenue' || metric.category === 'cash_flow' ? 
                  `$${metric.target.toLocaleString('es-MX')}` : 
                  `${metric.target}%`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Flujo de Caja Reciente</h2>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Últimos 7 días</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">Fecha</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-left">Categoría</th>
                <th className="px-6 py-3 text-left">Tipo</th>
                <th className="px-6 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cashFlow.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('es-MX')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    {item.projectId && (
                      <div className="text-xs text-gray-500">Proyecto: {item.projectId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toLocaleString('es-MX')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Alerts */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas Financieras</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">DSO Elevado</h4>
              <p className="text-sm text-yellow-700">
                Los días de cobranza están por encima del objetivo. Revisar cuentas por cobrar pendientes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Margen Bajo Objetivo</h4>
              <p className="text-sm text-red-700">
                El margen bruto está 7 puntos porcentuales por debajo del objetivo. Revisar costos de proyectos.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Oportunidad de Inversión</h4>
              <p className="text-sm text-blue-700">
                Flujo de caja positivo permite considerar inversiones en nuevas tecnologías o expansión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}