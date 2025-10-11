'use client'

import { useState } from 'react'
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
  Shield
} from 'lucide-react'

// Mock SGP data (in production would import from @prime-growth-os/sgp)
const mockSGPData = {
  bottlenecks: [
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
  ],
  spendOptimization: {
    current: {
      'Google Ads': 15000,
      'LinkedIn': 8000,
      'Facebook': 12000,
      'SEO': 5000,
      'Email': 3000,
      'Referidos': 7000
    },
    recommended: {
      'Google Ads': 12000,
      'LinkedIn': 14000,
      'Facebook': 8000,
      'SEO': 7000,
      'Email': 4000,
      'Referidos': 5000
    },
    expectedImpact: {
      revenue: 285000,
      margin: 85500,
      leads: 142,
      roas: 5.7
    }
  },
  experiments: [
    {
      name: 'LinkedIn Premium Targeting',
      status: 'running',
      hypothesis: 'Architecture decision-makers engage 3x more with case studies',
      progress: 65,
      confidence: 0.82,
      daysRemaining: 8
    },
    {
      name: 'Speed-to-Lead Optimization',
      status: 'completed',
      hypothesis: 'Sub-5 minute response increases conversion 40%',
      result: 'Confirmed: 38% lift',
      confidence: 0.94,
      decision: 'roll_out'
    }
  ],
  forecast: {
    revenue: {
      current: 850000,
      projected: [
        { month: 'Nov', value: 920000, confidence: { low: 880000, high: 960000 } },
        { month: 'Dec', value: 980000, confidence: { low: 920000, high: 1040000 } },
        { month: 'Jan', value: 1050000, confidence: { low: 980000, high: 1120000 } }
      ]
    },
    confidence: 0.78
  },
  executiveBrief: {
    bluf: 'Revenue growth constrained by CPQ bottleneck. Fix = +$125K/year. LinkedIn reallocation = +40% qualified leads.',
    situation: 'Cuarzo operates in a competitive architecture market with increasing demand for sustainable designs.',
    complication: 'Current CPQ process takes 72+ hours, losing 30% of hot leads to faster competitors.',
    question: 'How can we accelerate quote delivery while maintaining pricing accuracy?',
    answer: 'Implement dynamic pricing engine with pre-approved discount matrices, reducing CPQ to <24 hours.'
  }
}

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBottleneck, setSelectedBottleneck] = useState<number | null>(null)

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
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Live
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString('es-MX')}
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
              { id: 'bottlenecks', label: 'Bottlenecks', icon: AlertTriangle },
              { id: 'spend', label: 'Spend Optimization', icon: DollarSign },
              { id: 'experiments', label: 'Experiments', icon: TestTube },
              { id: 'forecast', label: 'Forecast', icon: TrendingUp }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* BLUF Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Target className="h-6 w-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Bottom Line Up Front</h3>
                  <p className="text-blue-800 font-medium text-lg">
                    {mockSGPData.executiveBrief.bluf}
                  </p>
                </div>
              </div>
            </div>

            {/* SCQA Framework */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Analysis</h3>
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
                    SITUATION
                  </span>
                  <p className="text-gray-700">{mockSGPData.executiveBrief.situation}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded mb-2">
                    COMPLICATION
                  </span>
                  <p className="text-gray-700">{mockSGPData.executiveBrief.complication}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
                    QUESTION
                  </span>
                  <p className="text-gray-700">{mockSGPData.executiveBrief.question}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mb-2">
                    ANSWER
                  </span>
                  <p className="text-gray-700 font-medium">{mockSGPData.executiveBrief.answer}</p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Expected Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(mockSGPData.spendOptimization.expectedImpact.revenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Expected ROAS</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockSGPData.spendOptimization.expectedImpact.roas.toFixed(1)}x
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(mockSGPData.forecast.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Tests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockSGPData.experiments.filter(e => e.status === 'running').length}
                    </p>
                  </div>
                  <TestTube className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottlenecks Tab */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Bottlenecks (Theory of Constraints)</h3>
              <div className="space-y-4">
                {mockSGPData.bottlenecks.map((bottleneck, index) => (
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
                          <button className="btn-primary btn-sm">
                            Implement Solution
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

        {/* Spend Optimization Tab */}
        {activeTab === 'spend' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Spend Optimization</h3>

              <div className="space-y-4">
                {Object.entries(mockSGPData.spendOptimization.current).map(([channel, currentSpend]) => {
                  const recommendedSpend = mockSGPData.spendOptimization.recommended[channel as keyof typeof mockSGPData.spendOptimization.recommended] || 0
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
                          <div className="text-center">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
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
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gray-400 rounded-full"
                          style={{ width: `${(currentSpend / 20000) * 100}%` }}
                        />
                        <div
                          className="absolute left-0 top-0 h-full bg-primary-500 rounded-full opacity-75"
                          style={{ width: `${(recommendedSpend / 20000) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Expected Impact</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Revenue</p>
                    <p className="text-lg font-semibold text-green-900">
                      ${(mockSGPData.spendOptimization.expectedImpact.revenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Margin</p>
                    <p className="text-lg font-semibold text-green-900">
                      ${(mockSGPData.spendOptimization.expectedImpact.margin / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Leads</p>
                    <p className="text-lg font-semibold text-green-900">
                      {mockSGPData.spendOptimization.expectedImpact.leads}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">ROAS</p>
                    <p className="text-lg font-semibold text-green-900">
                      {mockSGPData.spendOptimization.expectedImpact.roas.toFixed(1)}x
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Experiments</h3>

              <div className="space-y-4">
                {mockSGPData.experiments.map((experiment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{experiment.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{experiment.hypothesis}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        experiment.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {experiment.status === 'running' ? 'Running' : 'Completed'}
                      </span>
                    </div>

                    {experiment.status === 'running' ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Progress</span>
                          <span className="text-sm font-medium text-gray-900">{experiment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${experiment.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {experiment.daysRemaining} days remaining
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {(experiment.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Result</span>
                          <span className="text-sm font-medium text-green-600">{experiment.result}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Confidence</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(experiment.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Decision</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Roll Out
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Current Monthly Revenue</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(mockSGPData.forecast.revenue.current / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Forecast Confidence</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(mockSGPData.forecast.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {mockSGPData.forecast.revenue.projected.map((month, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{month.month}</h4>
                      <span className="text-lg font-semibold text-gray-900">
                        ${(month.value / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex items-center">
                          <div
                            className="absolute bg-green-200 h-full rounded-full"
                            style={{
                              left: `${((month.confidence.low - 800000) / 400000) * 100}%`,
                              width: `${((month.confidence.high - month.confidence.low) / 400000) * 100}%`
                            }}
                          />
                          <div
                            className="absolute w-1 h-6 bg-green-600 rounded-full"
                            style={{
                              left: `${((month.value - 800000) / 400000) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          ${(month.confidence.low / 1000).toFixed(0)}K
                        </span>
                        <span className="text-xs text-gray-500">
                          ${(month.confidence.high / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}