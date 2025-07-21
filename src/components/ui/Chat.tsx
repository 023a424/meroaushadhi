'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Loader2, Send, X } from 'lucide-react';
import { Message, sendChatMessage } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '@/context/language';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
  sessionId: string;
  initialMessage: string;
  onClose: () => void;
}

const content = {
  en: {
    title: 'Medicine Assistant',
    placeholder: 'Ask about the medicine...',
    error: 'Sorry, I encountered an error. Please try again.',
    close: 'Close'
  },
  np: {
    title: 'औषधि सहायक',
    placeholder: 'औषधिको बारेमा सोध्नुहोस्...',
    error: 'माफ गर्नुहोस्, मैले एउटा त्रुटि भेटाएँ। कृपया पुन: प्रयास गर्नुहोस्।',
    close: 'बन्द गर्नुहोस्'
  }
} as const;

export const Chat = ({ sessionId, initialMessage, onClose }: ChatProps) => {
  const { lang } = useLanguage();
  const t = content[lang];
  
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '0',
    role: 'assistant',
    content: initialMessage,
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingMessage('');

    try {
      // Include context about the medicine in the prompt
      const contextPrompt = messages.length === 1 
        ? `${lang === 'en' ? 'Context about the medicine' : 'औषधिको बारेमा जानकारी'}:\n${initialMessage}\n\n${lang === 'en' ? 'User question' : 'प्रयोगकर्ताको प्रश्न'}: ${input}`
        : input;

      const response = await sendChatMessage(
        contextPrompt,
        sessionId,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        },
        lang
      );

      // Use the returned response if available, otherwise fallback to streamingMessage
      const finalResponse = response.trim() !== "" ? response : streamingMessage;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t.error,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0ea0d9]/10 flex items-center justify-center">
              <span className="text-[#0ea0d9] font-semibold">AI</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#0ea0d9] text-white'
                      : 'bg-gray-100 text-gray-900'
                  } shadow-sm`}
                >
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user' ? 'prose-invert' : ''
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900 shadow-sm">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm sticky bottom-0"
        >
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea0d9] focus:border-transparent transition-shadow"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#0ea0d9] hover:bg-[#0ea0d9]/90 text-white shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}; 