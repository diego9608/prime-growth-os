'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Brain,
  DollarSign,
  ChevronRight,
  FileText,
  TestTube,
  Shield,
  Download,
  RefreshCw,
  Check,
  X
} from 'lucide-react'

export default function StrategyClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBottleneck, setSelectedBottleneck] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [spendPlan, setSpendPlan] = useState<any>(null)
  const [executiveBrief, setExecutiveBrief] = useState<any>(null)
  const [experiments, setExperiments] = useState<any[]>([])
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [scenario, setScenario] = useState<'conservative' | 'base' | 'optimistic'>('base')

  // Check feature flag
  const sgpEnabled = process.env.NEXT_PUBLIC_FEATURE_SGP === 'on'

  // Load data on mount
  useEffect(() => {
    if (sgpEnabled) {
      loadSpendPlan()
      loadExecutiveBrief()
      loadExperiments()
      loadAuditLog()
    }
  }, [sgpEnabled, scenario])

  const loadSpendPlan = async () => {
    try {
      const res = await fetch('/api/predictor/spendplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      })
      const data = await res.json()
      setSpendPlan(data)
    } catch (error) {
      console.error('Failed to load spend plan:', error)
    }
  }

  const loadExecutiveBrief = async () => {
    try {
      const res = await fetch('/api/predictor/executive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, impact: 125000 })
      })
      const data = await res.json()
      setExecutiveBrief(data)
    } catch (error) {
      console.error('Failed to load executive brief:', error)
    }
  }

  const loadExperiments = async () => {
    try {
      const res = await fetch('/api/predictor/experiment')
      const data = await res.json()
      setExperiments(data.experiments || [])
    } catch (error) {
      console.error('Failed to load experiments:', error)
    }
  }

  const loadAuditLog = async () => {
    try {
      const res = await fetch('/api/predictor/audit')
      const data = await res.json()
      setAuditLog(data.entries || [])
    } catch (error) {
      console.error('Failed to load audit log:', error)
    }
  }

  const acceptRecommendation = async (recommendation: any) => {
    try {
      // Log to audit
      await fetch('/api/predictor/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          entityId: recommendation.id || `rec-${Date.now()}`,
          entityTitle: recommendation.stage,
          reasoning: 'High impact, low risk',
          expectedImpact: { revenue: parseInt(recommendation.potentialGain.replace(/\D/g, '')) },
          tags: ['bottleneck', recommendation.impact.toLowerCase()]
        })
      })

      // Create experiment
      await fetch('/api/predictor/experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: `Test: ${recommendation.recommendation}`,
          hypothesis: `Implementing ${recommendation.stage} optimization will increase efficiency by 30%`,
          metric: 'Processing Time',
          baseline: recommendation.waitTime,
          target: recommendation.waitTime * 0.5,
          recommendationId: recommendation.id
        })
      })

      // Reload data
      loadAuditLog()
      loadExperiments()
      alert('Recommendation accepted and experiment created!')
    } catch (error) {
      console.error('Failed to accept recommendation:', error)
    }
  }

  const exportBrief = async (format: 'pdf' | 'markdown') => {
    try {
      const res = await fetch(`/api/predictor/executive?format=${format}`)

      if (format === 'markdown') {
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `strategic-brief-${Date.now()}.md`
        a.click()
      } else {
        // For PDF, would need a PDF library
        alert('PDF export would be implemented with a PDF library')
      }
    } catch (error) {
      console.error('Failed to export brief:', error)
    }
  }

  const exportAudit = async () => {
    try {
      const res = await fetch('/api/predictor/audit?format=csv')
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-log-${Date.now()}.csv`
      a.click()
    } catch (error) {
      console.error('Failed to export audit log:', error)
    }
  }

  if (!sgpEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Strategic Growth Predictor</h1>
          <p className="text-gray-600">This feature is currently disabled. Set NEXT_PUBLIC_FEATURE_SGP=on to enable.</p>
        </div>
      </div>
    )
  }

  // Mock data for bottlenecks (would come from real SGP)
  const bottlenecks = [
    {
      stage: 'CPQ Generation',
      score: 0.85,
      impact: 'Critical',
      waitTime: 48,
      recommendation: 'Automate quote generation with dynamic pricing engine',
      potentialGain: '$125,000/year'
    },
    {
      stage: 'Lead Response',
      score: 0.72,
      impact: 'High',
      waitTime: 18,
      recommendation: 'Implement auto-assignment and instant chatbot response',
      potentialGain: '$85,000/year'
    },
    {
      stage: 'Contract Review',
      score: 0.65,
      impact: 'Medium',
      waitTime: 72,
      recommendation: 'Use Mexican contract validator for compliance checks',
      potentialGain: '$45,000/year'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Strategic Growth Predictor</h1>
                  <p className="text-sm text-gray-600">AI-powered insights for Cuarzo Architecture</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="conservative">Conservative</option>
                  <option value="base">Base Case</option>
                  <option value="optimistic">Optimistic</option>
                </select>
                <button
                  onClick={() => {
                    loadSpendPlan()
                    loadExecutiveBrief()
                  }}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Run Analysis</span>
                </button>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Executive Summary', icon: FileText },
              { id: 'bottlenecks', label: 'Drivers & Bottlenecks', icon: AlertTriangle },
              { id: 'spend', label: 'Spend Plan', icon: DollarSign },
              { id: 'audit', label: 'Audit & Experiments', icon: TestTube }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary Tab */}
        {activeTab === 'overview' && executiveBrief && (
          <div className="space-y-6">
            {/* BLUF Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Target className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Bottom Line Up Front</h3>
                    <p className="text-blue-800 font-medium text-lg">
                      {executiveBrief.bluf}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportBrief('markdown')}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* SCQA Framework */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Analysis (SCQA)</h3>
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
                    SITUATION
                  </span>
                  <p className="text-gray-700">{executiveBrief.situation}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded mb-2">
                    COMPLICATION
                  </span>
                  <p className="text-gray-700">{executiveBrief.complication}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
                    QUESTION
                  </span>
                  <p className="text-gray-700">{executiveBrief.question}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mb-2">
                    ANSWER
                  </span>
                  <p className="text-gray-700 font-medium">{executiveBrief.answer}</p>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            {executiveBrief.topActions && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Actions</h3>
                <div className="space-y-3">
                  {executiveBrief.topActions.map((action: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{index + 1}. {action.action}</span>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-green-600">+${(action.impact / 1000).toFixed(0)}K/year</span>
                          <span className="text-sm text-gray-500">Timeline: {action.timeline}</span>
                          <span className="text-sm text-gray-500">Confidence: {(action.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Used */}
            <div className="text-sm text-gray-500 text-right">
              Model: {executiveBrief.model === 'opus' ? 'Claude Opus (High Impact)' : 'Claude Sonnet (Cost-Optimized)'}
            </div>
          </div>
        )}

        {/* Bottlenecks Tab */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Bottlenecks (Theory of Constraints)</h3>
              <div className="space-y-4">
                {bottlenecks.map((bottleneck, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedBottleneck === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBottleneck(index === selectedBottleneck ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          bottleneck.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                          bottleneck.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bottleneck.impact}
                        </div>
                        <h4 className="font-medium text-gray-900">{bottleneck.stage}</h4>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Wait Time</p>
                          <p className="font-medium text-gray-900">{bottleneck.waitTime}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Score</p>
                          <p className="font-medium text-gray-900">{(bottleneck.score * 100).toFixed(0)}%</p>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                          selectedBottleneck === index ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>

                    {selectedBottleneck === index && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Recommendation</p>
                            <p className="text-sm text-gray-600 mt-1">{bottleneck.recommendation}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Potential Annual Gain</p>
                            <p className="text-lg font-semibold text-green-600">{bottleneck.potentialGain}</p>
                          </div>
                          <button
                            onClick={() => acceptRecommendation(bottleneck)}
                            className="btn-primary btn-sm"
                          >
                            Accept & Create Experiment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Spend Plan Tab */}
        {activeTab === 'spend' && spendPlan && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Spend Optimization</h3>

              {/* Guardrails Status */}
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(spendPlan.guardrails || {}).map(([key, guardrail]: [string, any]) => (
                  <div key={key} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    guardrail.status === 'ok' ? 'bg-green-100 text-green-800' :
                    guardrail.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {guardrail.status === 'ok' ? <Check className="h-3 w-3" /> :
                     guardrail.status === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                     <X className="h-3 w-3" />}
                    <span>{guardrail.message}</span>
                  </div>
                ))}
              </div>

              {/* Infeasibility Warning */}
              {spendPlan.infeasible && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Infeasibility Detected</h4>
                  <p className="text-red-700 mb-3">{spendPlan.infeasible.reason}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-900">Suggested Solutions:</p>
                    {spendPlan.infeasible.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-red-600">•</span>
                        <span className="text-sm text-red-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channel Allocations */}
              <div className="space-y-4">
                {Object.entries(spendPlan.current).map(([channel, currentSpend]) => {
                  const recommendedSpend = spendPlan.recommended[channel] || 0
                  const change = recommendedSpend - currentSpend
                  const changePercent = (change / currentSpend) * 100

                  return (
                    <div key={channel} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{channel}</h4>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Current</p>
                            <p className="font-medium">${currentSpend.toLocaleString()}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Recommended</p>
                            <p className="font-medium">${recommendedSpend.toLocaleString()}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {change > 0 ? '+' : ''}{changePercent.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Expected Impact */}
              {spendPlan.expectedImpact && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Expected Impact</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-green-700">Revenue</p>
                      <p className="text-lg font-semibold text-green-900">
                        ${(spendPlan.expectedImpact.revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Margin</p>
                      <p className="text-lg font-semibold text-green-900">
                        ${(spendPlan.expectedImpact.margin / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Leads</p>
                      <p className="text-lg font-semibold text-green-900">
                        {spendPlan.expectedImpact.leads}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">ROAS</p>
                      <p className="text-lg font-semibold text-green-900">
                        {spendPlan.expectedImpact.roas.toFixed(1)}x
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    Confidence: {(spendPlan.expectedImpact.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit & Experiments Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Experiments */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Experiments</h3>
                <div className="text-sm text-gray-500">
                  Batting Average: {experiments.filter((e: any) => e.status === 'completed' && e.decision === 'roll_out').length}/{experiments.filter((e: any) => e.status === 'completed').length}
                </div>
              </div>

              <div className="space-y-4">
                {experiments.map((experiment: any) => (
                  <div key={experiment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{experiment.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{experiment.hypothesis}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        experiment.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        experiment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {experiment.status}
                      </span>
                    </div>
                    {experiment.status === 'running' && (
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Sample: {experiment.currentSample}/{experiment.sampleSize}</span>
                          <span className="text-gray-500">Confidence: {(experiment.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                    {experiment.status === 'completed' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Result: {experiment.result || 'Completed'}</span>
                        <span className="text-gray-500">Decision: {experiment.decision || 'Pending'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
                <button
                  onClick={exportAudit}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLog.slice(0, 10).map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString('es-MX')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            entry.action === 'accept' ? 'bg-green-100 text-green-800' :
                            entry.action === 'reject' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.entityTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.expectedImpact?.revenue ? `$${(entry.expectedImpact.revenue / 1000).toFixed(0)}K` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}