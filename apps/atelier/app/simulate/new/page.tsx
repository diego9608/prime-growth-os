'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SimulationData = {
  step1: {
    leadsPerChannel: { meta: number; google: number; referral: number; organic: number }
    speedToLead: number
    showRate: number
    appointmentsPerDay: number
  }
  step2: {
    timeToProposal: number
    proposalsUnder72h: number
    winRate: number
    ticketByPackage: { basic: number; standard: number; premium: number }
    revisions: number
  }
  step3: {
    activeCapacity: number
    otif: number
    rework: number
    tradesWithPlanB: number
  }
  step4: {
    dso: number
    margin: number
    advance: number
  }
  step5: {
    budgetByChannel: { meta: number; google: number; referral: number; organic: number }
    targetLeads: number
    maxCapacity: number
  }
}

const initialData: SimulationData = {
  step1: {
    leadsPerChannel: { meta: 0, google: 0, referral: 0, organic: 0 },
    speedToLead: 0,
    showRate: 0,
    appointmentsPerDay: 0
  },
  step2: {
    timeToProposal: 0,
    proposalsUnder72h: 0,
    winRate: 0,
    ticketByPackage: { basic: 0, standard: 0, premium: 0 },
    revisions: 0
  },
  step3: {
    activeCapacity: 0,
    otif: 0,
    rework: 0,
    tradesWithPlanB: 0
  },
  step4: {
    dso: 0,
    margin: 0,
    advance: 0
  },
  step5: {
    budgetByChannel: { meta: 0, google: 0, referral: 0, organic: 0 },
    targetLeads: 0,
    maxCapacity: 0
  }
}

export default function NewSimulationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<SimulationData>(initialData)
  const [scenarioType, setScenarioType] = useState<'baseline' | 'tobe'>('baseline')
  const router = useRouter()

  const updateStep = (step: number, values: any) => {
    setData(prev => ({ ...prev, [`step${step}`]: { ...prev[`step${step}` as keyof SimulationData], ...values } }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      saveSimulation()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveSimulation = async () => {
    const simulationId = `sim-${Date.now()}`

    const simulationData = {
      id: simulationId,
      type: scenarioType,
      data,
      createdAt: new Date().toISOString()
    }

    localStorage.setItem(simulationId, JSON.stringify(simulationData))

    router.push(`/simulate/${simulationId}/compare`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {scenarioType === 'baseline' ? 'Cuarzo Hoy (Baseline/As-Is)' : 'Cuarzo Meta (To-Be)'}
          </h1>
          <p className="mt-2 text-gray-600">
            Paso {currentStep} de 5 - {getStepTitle(currentStep)}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{ width: '80px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {currentStep === 1 && <Step1 data={data.step1} onChange={(v) => updateStep(1, v)} />}
          {currentStep === 2 && <Step2 data={data.step2} onChange={(v) => updateStep(2, v)} />}
          {currentStep === 3 && <Step3 data={data.step3} onChange={(v) => updateStep(3, v)} />}
          {currentStep === 4 && <Step4 data={data.step4} onChange={(v) => updateStep(4, v)} />}
          {currentStep === 5 && <Step5 data={data.step5} onChange={(v) => updateStep(5, v)} />}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentStep === 5 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStepTitle(step: number): string {
  const titles = {
    1: 'Demanda & Citas',
    2: 'Venta & Propuesta',
    3: 'Entrega & Proveedores',
    4: 'Finanzas',
    5: 'Ads & Objetivos'
  }
  return titles[step as keyof typeof titles]
}

function Step1({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Demanda & Citas</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leads Meta Ads</label>
          <input
            type="number"
            value={data.leadsPerChannel.meta}
            onChange={(e) => onChange({ leadsPerChannel: { ...data.leadsPerChannel, meta: Number(e.target.value) }})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leads Google Ads</label>
          <input
            type="number"
            value={data.leadsPerChannel.google}
            onChange={(e) => onChange({ leadsPerChannel: { ...data.leadsPerChannel, google: Number(e.target.value) }})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leads Referral</label>
          <input
            type="number"
            value={data.leadsPerChannel.referral}
            onChange={(e) => onChange({ leadsPerChannel: { ...data.leadsPerChannel, referral: Number(e.target.value) }})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leads Orgánico</label>
          <input
            type="number"
            value={data.leadsPerChannel.organic}
            onChange={(e) => onChange({ leadsPerChannel: { ...data.leadsPerChannel, organic: Number(e.target.value) }})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Speed-to-Lead (min)</label>
          <input
            type="number"
            value={data.speedToLead}
            onChange={(e) => onChange({ speedToLead: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Show Rate (%)</label>
          <input
            type="number"
            value={data.showRate}
            onChange={(e) => onChange({ showRate: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Citas por día</label>
          <input
            type="number"
            value={data.appointmentsPerDay}
            onChange={(e) => onChange({ appointmentsPerDay: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

function Step2({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Venta & Propuesta</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo a propuesta (días)</label>
          <input
            type="number"
            value={data.timeToProposal}
            onChange={(e) => onChange({ timeToProposal: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">% Propuestas ≤72h</label>
          <input
            type="number"
            value={data.proposalsUnder72h}
            onChange={(e) => onChange({ proposalsUnder72h: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Win Rate (%)</label>
          <input
            type="number"
            value={data.winRate}
            onChange={(e) => onChange({ winRate: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Revisiones promedio</label>
          <input
            type="number"
            value={data.revisions}
            onChange={(e) => onChange({ revisions: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Ticket promedio por paquete (MXN)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Básico</label>
            <input
              type="number"
              value={data.ticketByPackage.basic}
              onChange={(e) => onChange({ ticketByPackage: { ...data.ticketByPackage, basic: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Estándar</label>
            <input
              type="number"
              value={data.ticketByPackage.standard}
              onChange={(e) => onChange({ ticketByPackage: { ...data.ticketByPackage, standard: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Premium</label>
            <input
              type="number"
              value={data.ticketByPackage.premium}
              onChange={(e) => onChange({ ticketByPackage: { ...data.ticketByPackage, premium: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Entrega & Proveedores</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad activa (proyectos)</label>
          <input
            type="number"
            value={data.activeCapacity}
            onChange={(e) => onChange({ activeCapacity: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OTIF (%)</label>
          <input
            type="number"
            value={data.otif}
            onChange={(e) => onChange({ otif: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Retrabajo (%)</label>
          <input
            type="number"
            value={data.rework}
            onChange={(e) => onChange({ rework: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trades con plan B</label>
          <input
            type="number"
            value={data.tradesWithPlanB}
            onChange={(e) => onChange({ tradesWithPlanB: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

function Step4({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Finanzas</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DSO (días)</label>
          <input
            type="number"
            value={data.dso}
            onChange={(e) => onChange({ dso: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Margen (%)</label>
          <input
            type="number"
            value={data.margin}
            onChange={(e) => onChange({ margin: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo (%)</label>
          <input
            type="number"
            value={data.advance}
            onChange={(e) => onChange({ advance: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

function Step5({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ads & Objetivos</h2>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Budget mensual por canal (MXN)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Meta Ads</label>
            <input
              type="number"
              value={data.budgetByChannel.meta}
              onChange={(e) => onChange({ budgetByChannel: { ...data.budgetByChannel, meta: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Google Ads</label>
            <input
              type="number"
              value={data.budgetByChannel.google}
              onChange={(e) => onChange({ budgetByChannel: { ...data.budgetByChannel, google: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Referral</label>
            <input
              type="number"
              value={data.budgetByChannel.referral}
              onChange={(e) => onChange({ budgetByChannel: { ...data.budgetByChannel, referral: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Orgánico</label>
            <input
              type="number"
              value={data.budgetByChannel.organic}
              onChange={(e) => onChange({ budgetByChannel: { ...data.budgetByChannel, organic: Number(e.target.value) }})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta de leads mensuales</label>
          <input
            type="number"
            value={data.targetLeads}
            onChange={(e) => onChange({ targetLeads: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad máxima (proyectos)</label>
          <input
            type="number"
            value={data.maxCapacity}
            onChange={(e) => onChange({ maxCapacity: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  )
}