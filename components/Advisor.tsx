import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hola, soy tu experto tributario AI. He analizado la normativa para el año fiscal 2026. ¿Tienes dudas sobre qué procedimiento de retención en la fuente elegir?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // BYOK (Bring Your Own Key) State
  const [userApiKey, setUserApiKey] = useState('');
  const [hasKey, setHasKey] = useState(!!process.env.API_KEY || !!process.env.GEMINI_API_KEY);
  const [showKeyInput, setShowKeyInput] = useState(!hasKey);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showKeyInput]);

  const handleSaveKey = () => {
    if (userApiKey.trim().length > 10) {
       setHasKey(true);
       setShowKeyInput(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentKey = process.env.API_KEY || process.env.GEMINI_API_KEY || userApiKey;

    if (!currentKey) {
        setShowKeyInput(true);
        return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const systemInstruction = `
        Eres un experto tributario en Colombia y asesor especializado en Retención en la Fuente para empleados.
        Tienes acceso al contexto del Estatuto Tributario Colombiano para el año 2026.

        INFORMACIÓN CLAVE (ESTATUTO TRIBUTARIO):
        1. **Fecha Límite:** Los empleados deben elegir su procedimiento a principio de año (o semestralmente).
        2. **UVT 2026:** Valor oficial proyectado de **COP 52.374**.
        3. **Procedimiento 1 (Tabla):** Se aplica la tabla del Art 383 (variable mes a mes).
        4. **Procedimiento 2 (Fijo):** 
           - Es un porcentaje fijo semestral.
           - Se determina en Diciembre (para Ene-Jun) y en Junio (para Jul-Dic) con base en el promedio de los 12 meses anteriores.
        5. **Consejo:** La decisión depende del flujo de caja del empleado. P2 suaviza los picos de impuestos en meses de ingresos variables altos.

        Reglas de respuesta:
        1. Cita siempre el Estatuto Tributario vigente.
        2. Si preguntan por fechas, refiérete a los periodos estándar de definición (Dic/Jun).
        3. Explica claramente que el P2 ayuda a quienes tienen ingresos variables para evitar golpes fuertes de impuesto en un solo mes.
        4. Sé conciso y profesional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
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
      console.error(err);
      setError(err.message || "Error conectando con el servicio de IA. Verifica tu API Key.");
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error al procesar tu consulta. Verifica que tu API Key sea válida." }]);
      if (err.message?.includes('API key') || err.status === 403) {
          setShowKeyInput(true); // Re-ask for key if invalid
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#4285F4] p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Asesor Tributario</h3>
            <p className="text-xs text-white opacity-90">Contexto: Normativa 2026</p>
          </div>
        </div>
        {/* Change Key Button */}
        {hasKey && !process.env.API_KEY && !process.env.GEMINI_API_KEY && (
            <button 
                onClick={() => setShowKeyInput(true)}
                className="text-xs text-blue-100 hover:text-white underline"
            >
                Cambiar API Key
            </button>
        )}
      </div>

      {/* API Key Modal Overlay */}
      {showKeyInput && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full text-center">
                 <div className="w-12 h-12 bg-blue-50 text-[#4285F4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Configura tu Asesor IA</h3>
                 <p className="text-sm text-gray-500 mb-6">
                    Esta aplicación es gratuita y open-source. Para usar la inteligencia artificial, necesitas tu propia <strong>API Key de Google Gemini</strong> (es gratis).
                 </p>
                 
                 <div className="space-y-4">
                    
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                        Obtener mi API Key Gratis 
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>

                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="Pega tu API Key aquí (AIza...)" 
                            value={userApiKey}
                            onChange={(e) => setUserApiKey(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm"
                        />
                    </div>

                    <button 
                        onClick={handleSaveKey}
                        disabled={userApiKey.length < 10}
                        className="w-full py-3 bg-[#4285F4] text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    >
                        Guardar y Continuar
                    </button>
                    
                    <p className="text-[10px] text-gray-400 mt-4">
                        Tu clave se usa solo en tu navegador para conectar con Google. No se guarda en ningún servidor ajeno.
                    </p>
                 </div>
             </div>
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 ${showKeyInput ? 'blur-sm select-none overflow-hidden' : ''}`}>
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
                <span className="text-sm text-gray-500">Consultando normativa tributaria...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 bg-white border-t border-gray-100 ${showKeyInput ? 'blur-sm pointer-events-none' : ''}`}>
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
          Basado en el Estatuto Tributario Colombiano (2026).
        </p>
      </div>
    </div>
  );
};

export default Advisor;