import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hola, soy tu experto tributario AI. He analizado el comunicado de LATAM Payroll sobre el recálculo para 2026. ¿Tienes dudas sobre qué procedimiento elegir antes del 15 de enero?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key no configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        Eres un experto tributario en Colombia y asesor especializado para empleados de Google Colombia (LATAM Payroll).
        Tienes acceso al contexto del comunicado "[IMPORTANT | Action Required] CO - Recálculo de Porcentaje Fijo de Retención (2026)".

        INFORMACIÓN CLAVE DEL DOCUMENTO DE LATAM PAYROLL:
        1. **Fecha Límite:** Los empleados deben elegir su procedimiento antes del **15 de Enero de 2026**. Si no eligen, continúan con el actual.
        2. **UVT 2026:** El documento cita una UVT de **COP 52.374**.
        3. **Procedimiento 1 (Tabla):** Se aplica la tabla del Art 383 (variable mes a mes).
        4. **Procedimiento 2 (Fijo):** 
           - Es un porcentaje fijo semestral.
           - REGLA DE CÁLCULO ESPECÍFICA DE LA AGENCIA:
             * Para el **Primer Semestre (Ene-Jun)**: Se tienen en cuenta los ingresos promedio de los 12 meses anteriores con corte a **NOVIEMBRE** del año anterior.
             * Para el **Segundo Semestre (Jul-Dic)**: Se tienen en cuenta los ingresos promedio de los 12 meses anteriores con corte a **MAYO**.
        5. **Consejo:** La decisión depende del flujo de caja del empleado. P2 suaviza los picos de impuestos en meses de comisiones altas.

        Reglas de respuesta:
        1. Cita siempre el Estatuto Tributario Y las reglas específicas de LATAM Payroll mencionadas arriba.
        2. Si preguntan por fechas, recuerda el corte de Noviembre/Mayo para el promedio.
        3. Explica claramente que el P2 ayuda a quienes tienen ingresos variables (comisiones/acciones) para evitar golpes fuertes de impuesto en un solo mes.
        4. Sé conciso y profesional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
        }
      });

      const text = response.text || "Lo siento, no pude generar una respuesta en este momento.";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (err: any) {
      setError(err.message || "Error conectando con el servicio de IA.");
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error al procesar tu consulta. Por favor intenta de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#4285F4] p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Asesor LATAM Payroll</h3>
            <p className="text-xs text-white opacity-90">Contexto: Normativa 2026</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#4285F4] text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-start gap-2 mb-1 opacity-50 text-xs uppercase font-bold tracking-wider">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                {msg.role === 'user' ? 'Tú' : 'Asesor'}
              </div>
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                <span className="text-sm text-gray-500">Consultando reglas LATAM Payroll...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none bg-gray-50 hover:bg-white transition"
            placeholder="¿Cuándo debo elegir procedimiento?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-[#4285F4] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Basado en documento oficial LATAM Payroll (Ene 2026).
        </p>
      </div>
    </div>
  );
};

export default Advisor;