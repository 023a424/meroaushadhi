import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getContextPrompt, sendChatMessage } from '@/lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  sessionId: string;
  initialAnalysis?: string;
}

export default function Chat({ sessionId, initialAnalysis }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const { lang } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let messageToSend = input;
      // If this is the first message, include the initial analysis as context
      if (messages.length === 0 && initialAnalysis) {
        messageToSend = getContextPrompt(initialAnalysis, input, lang);
      }

      const response = await sendChatMessage(
        messageToSend,
        sessionId,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        },
        lang
      );

      // Clear streaming message and add the complete response
      setStreamingMessage('');
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat Error:', err);
      setError(err.message || (lang === 'en' 
        ? 'Failed to send message. Please try again.'
        : 'सन्देश पठाउन असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component code ...
} 