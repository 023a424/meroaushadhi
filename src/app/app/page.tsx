'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/language';
import { Button } from '@/components/ui/Button';
import { Camera } from '@/components/ui/Camera';
import { Chat } from '@/components/ui/Chat';
import { Scan, History, Settings, Loader2, X, HelpCircle, Clock } from 'lucide-react';
import { startMedicineChat } from '@/lib/gemini';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Function to decode base64
function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to extract medicine name from analysis
function extractMedicineName(analysis: string): string {
  try {
    // First try to find explicit medicine name patterns
    const patterns = [
      /(?:Medicine name|Name|Medicine):\s*([^\n.]+)/i,
      /^(?:Medicine name|Name|Medicine):\s*([^\n.]+)/im,
      /The medicine "([^"]+)"/i,
      /medicine called "([^"]+)"/i,
      /medicine (?:is|named|called) ([^\n.]+)/i
    ];

    for (const pattern of patterns) {
      const match = analysis.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Remove common prefixes and clean up
        return name.replace(/^(the|medicine|name|called|is)\s+/i, '');
      }
    }

    // If no patterns match, try to extract from the first line
    const firstLine = analysis.split('\n')[0];
    // Remove common prefixes from first line
    const cleanedFirstLine = firstLine
      .replace(/^(?:based on|looking at|analyzing|for|the|medicine|package)\s+/i, '')
      .replace(/(?:you provided|provided|image|package|here|is)\s*$/i, '')
      .trim();

    // If first line is too long, take just the first part that might be the name
    if (cleanedFirstLine.length > 50) {
      const potentialName = cleanedFirstLine.split(/[,.]/, 1)[0].trim();
      return potentialName.length > 50 ? 'Unknown Medicine' : potentialName;
    }

    return cleanedFirstLine || 'Unknown Medicine';
  } catch (error) {
    console.error('Error extracting medicine name:', error);
    return 'Unknown Medicine';
  }
}

const content = {
  en: {
    welcome: "Welcome to Mero Aushadhi App",
    description: "Your personal medicine information companion",
    actions: {
      scan: "Scan Medicine",
      history: "View History",
      settings: "Settings",
      howItWorks: "How it Works"
    },
    signOut: "Sign out",
    analysis: {
      loading: "Analyzing image...",
      error: "Failed to analyze image. Please try again."
    },
    history: {
      title: "Scan History",
      empty: "No scan history found",
      loading: "Loading history...",
      viewAnalysis: "View Analysis",
      delete: "Delete",
      close: "Close",
      deleteConfirm: "Are you sure you want to delete this scan?",
      deleteError: "Failed to delete scan. Please try again.",
      medicineName: "Unknown Medicine",
      deleteModal: {
        title: "Delete Scan",
        message: "Are you sure you want to delete this scan? This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Delete",
        deleting: "Deleting...",
      }
    },
    howItWorks: {
      title: "How it Works",
      steps: [
        {
          title: "Scan Medicine",
          description: "Use your camera to scan the medicine package. Make sure the text is clearly visible."
        },
        {
          title: "Get Analysis",
          description: "Our AI will analyze the medicine and provide detailed information about it."
        },
        {
          title: "Chat & Learn",
          description: "Ask questions about the medicine to get more information. All your scans are saved in history."
        }
      ],
      close: "Got it"
    },
    recentActivity: {
      title: "Recent Activity",
      empty: "No recent activity"
    }
  },
  np: {
    welcome: "मेरो औषधि एपमा स्वागत छ",
    description: "तपाईंको व्यक्तिगत औषधि जानकारी साथी",
    actions: {
      scan: "औषधि स्क्यान गर्नुहोस्",
      history: "इतिहास हेर्नुहोस्",
      settings: "सेटिङहरू",
      howItWorks: "कसरी काम गर्छ"
    },
    signOut: "साइन आउट",
    analysis: {
      loading: "छवि विश्लेषण गर्दै...",
      error: "छवि विश्लेषण गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।"
    },
    history: {
      title: "स्क्यान इतिहास",
      empty: "कुनै स्क्यान इतिहास फेला परेन",
      loading: "इतिहास लोड गर्दै...",
      viewAnalysis: "विश्लेषण हेर्नुहोस्",
      delete: "मेटाउनुहोस्",
      close: "बन्द गर्नुहोस्",
      deleteConfirm: "के तपाईं यो स्क्यान मेटाउन निश्चित हुनुहुन्छ?",
      deleteError: "स्क्यान मेटाउन असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।",
      medicineName: "अज्ञात औषधि",
      deleteModal: {
        title: "स्क्यान मेटाउनुहोस्",
        message: "के तपाईं यो स्क्यान मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।",
        cancel: "रद्द गर्नुहोस्",
        confirm: "मेटाउनुहोस्",
        deleting: "मेटाउँदै...",
      }
    },
    howItWorks: {
      title: "यो कसरी काम गर्छ",
      steps: [
        {
          title: "औषधि स्क्यान गर्नुहोस्",
          description: "औषधि प्याकेज स्क्यान गर्न आफ्नो क्यामेरा प्रयोग गर्नुहोस्। पाठ स्पष्ट रूपमा देखिएको सुनिश्चित गर्नुहोस्।"
        },
        {
          title: "विश्लेषण प्राप्त गर्नुहोस्",
          description: "हाम्रो एआईले औषधिको विश्लेषण गर्नेछ र यसको बारेमा विस्तृत जानकारी प्रदान गर्नेछ।"
        },
        {
          title: "च्याट गर्नुहोस् र सिक्नुहोस्",
          description: "थप जानकारी प्राप्त गर्न औषधिको बारेमा प्रश्नहरू सोध्नुहोस्। तपाईंका सबै स्क्यानहरू इतिहासमा सुरक्षित गरिन्छन्।"
        }
      ],
      close: "बुझें"
    },
    recentActivity: {
      title: "हालैको गतिविधि",
      empty: "कुनै हालैको गतिविधि छैन"
    }
  }
} as const;

// Update the history items type
interface HistoryItem {
  id: string;
  created_at: string;
  status: string;
  analysis_result?: { initial_analysis: string };
  image_data?: string;
  medicineName?: string;
  timestamp: number;
}

// yo protected app route ho
export default function AppPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = content[lang];

  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<{
    sessionId: string;
    initialMessage: string;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = '/auth';
          return;
        }
      } catch (error) {
        window.location.href = '/auth';
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = '/auth';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchHistory();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('medicine_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicine_images'
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleCapture = async (imageDataUrl: string) => {
    setShowCamera(false);
    setAnalyzing(true);
    setError(null);
    
    try {
      console.log('=== Starting Image Capture Process ===');
      console.log('1. Getting auth session...');
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.user) throw new Error('No authenticated user');
      console.log('Auth session found for user:', authSession.user.id);

      // Store image in medicine_images table
      console.log('2. Storing image in database...');
      const { data: imageRecord, error: insertError } = await supabase
        .from('medicine_images')
        .insert({
          user_id: authSession.user.id,
          image_data: imageDataUrl,
          file_name: `medicine_${Date.now()}.jpg`,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert Error:', insertError);
        throw insertError;
      }
      console.log('Image stored successfully with ID:', imageRecord.id);

      // Start chat session with language setting
      console.log('3. Starting chat session...');
      const chatData = await startMedicineChat(imageDataUrl, lang);
      console.log('Chat session started:', chatData.sessionId);
      
      // Update record with analysis status
      console.log('4. Updating analysis status...');
      const { error: updateError } = await supabase
        .from('medicine_images')
        .update({
          status: 'analyzed',
          analysis_result: { initial_analysis: chatData.initialMessage }
        })
        .eq('id', imageRecord.id);

      if (updateError) {
        console.error('Update Error:', updateError);
        throw updateError;
      }
      console.log('Analysis status updated successfully');

      setChatSession(chatData);
      await fetchHistory(); // Refresh history after successful capture
      console.log('=== Image Capture Process Completed ===');
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(t.analysis.error);
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('medicine_images')
        .select('id, created_at, status, analysis_result, image_data')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = data.map((item: any) => ({
        ...item,
        medicineName: extractMedicineName(item.analysis_result?.initial_analysis || ''),
        timestamp: Date.parse(item.created_at)
      }));

      setHistoryItems(processedData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleHistoryClick = async () => {
    setShowHistory(true);
    await fetchHistory();
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('medicine_images')
        .delete()
        .match({ id });

      if (deleteError) {
        throw deleteError;
      }

      setHistoryItems(prev => prev.filter(item => item.id !== id));
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting record:', err);
      setError(t.history.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    if (item.analysis_result?.initial_analysis) {
      setShowHistory(false); // Close history panel
      setChatSession({
        sessionId: item.id,
        initialMessage: item.analysis_result.initial_analysis
      });
    }
  };

  const HistoryModal = () => {
    if (!showHistory) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t.history.title}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(false)}
              className="rounded-full hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ea0d9]" />
                <p className="mt-2 text-gray-600">{t.history.loading}</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <History className="h-12 w-12 mb-4 text-gray-400" />
                <p className="text-gray-600">{t.history.empty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => {
                  const medicineName = item.analysis_result?.initial_analysis 
                    ? extractMedicineName(item.analysis_result.initial_analysis)
                    : t.history.medicineName;
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50 hover:bg-gray-100/80 rounded-xl p-4 transition-colors border border-gray-100"
                    >
                      <div className="flex items-start space-x-4">
                        {item.image_data && (
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image_data} 
                              alt={medicineName}
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{medicineName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(item.created_at), 'PPpp')}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleHistoryItemClick(item)}
                            disabled={!item.analysis_result?.initial_analysis}
                            className="bg-[#0ea0d9] hover:bg-[#0ea0d9]/90 text-white font-medium"
                          >
                            {t.history.viewAnalysis}
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeletingId(item.id);
                              setDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:bg-red-50 border-red-200"
                          >
                            {t.history.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => (
    <AnimatePresence>
      {deleteModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.history.deleteModal.title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t.history.deleteModal.message}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeletingId(null);
                  }}
                  disabled={isDeleting}
                  className="hover:bg-gray-50"
                >
                  {t.history.deleteModal.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={() => deletingId && handleDelete(deletingId)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                  isLoading={isDeleting}
                >
                  {isDeleting ? t.history.deleteModal.deleting : t.history.deleteModal.confirm}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const TutorialModal = () => (
    <AnimatePresence>
      {showTutorial && (
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.howItWorks.title}</h2>
              <div className="space-y-8">
                {t.howItWorks.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0ea0d9]/10 flex items-center justify-center">
                      <span className="text-[#0ea0d9] font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setShowTutorial(false)}
                  className="bg-[#0ea0d9] hover:bg-[#0ea0d9]/90 text-white font-medium"
                >
                  {t.howItWorks.close}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.welcome}</h1>
              <p className="mt-1 text-sm text-gray-600">{t.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="hover:bg-gray-50"
              >
                How it Works
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="hover:bg-gray-50"
              >
                {t.signOut}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-white rounded-xl shadow-sm p-6 text-center border border-[#0ea0d9]/10"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#0ea0d9] mx-auto" />
            <p className="mt-2 text-gray-600">{t.analysis.loading}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-red-50 text-red-800 p-6 rounded-xl border border-red-100 shadow-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer border border-gray-100 hover:border-[#0ea0d9]/20 relative"
            onClick={() => setShowCamera(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea0d9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 relative">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#0ea0d9]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Scan className="h-6 w-6 text-[#0ea0d9]" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t.actions.scan}</h2>
                  <p className="mt-1 text-sm text-gray-500">Scan medicine packages</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer border border-gray-100 hover:border-[#0ea0d9]/20 relative"
            onClick={handleHistoryClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea0d9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 relative">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#0ea0d9]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <History className="h-6 w-6 text-[#0ea0d9]" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t.actions.history}</h2>
                  <p className="mt-1 text-sm text-gray-500">View previous scans</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer border border-gray-100 hover:border-[#0ea0d9]/20 relative"
            onClick={() => setShowTutorial(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea0d9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 relative">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#0ea0d9]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6 text-[#0ea0d9]" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t.actions.howItWorks}</h2>
                  <p className="mt-1 text-sm text-gray-500">Learn how to use the app</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div>
            <Link 
              href="/app/settings"
              className="group block bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer border border-gray-100 hover:border-[#0ea0d9]/20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea0d9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-6 relative">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#0ea0d9]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-6 w-6 text-[#0ea0d9]" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t.actions.settings}</h2>
                    <p className="mt-1 text-sm text-gray-500">Customize preferences</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-semibold text-gray-900 mb-4"
              >
                {t.recentActivity.title}
              </motion.h2>
              {historyItems.length > 0 ? (
                <div className="space-y-4">
                  {historyItems.slice(0, 3).map((item, index) => {
                    const medicineName = item.analysis_result?.initial_analysis 
                      ? extractMedicineName(item.analysis_result.initial_analysis)
                      : t.history.medicineName;
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgb(249, 250, 251)' }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleHistoryItemClick(item)}
                      >
                        {item.image_data && (
                          <motion.img 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            src={item.image_data} 
                            alt={medicineName}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        )}
                        <div>
                          <motion.h3 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="font-medium text-gray-900"
                          >
                            {medicineName}
                          </motion.h3>
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="text-sm text-gray-500"
                          >
                            {format(new Date(item.created_at), 'PPp')}
                          </motion.p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-8 text-gray-500"
                >
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent activity</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {chatSession && (
        <Chat
          sessionId={chatSession.sessionId}
          initialMessage={chatSession.initialMessage}
          onClose={() => setChatSession(null)}
        />
      )}

      <HistoryModal />
      <DeleteModal />
      <TutorialModal />
    </div>
  );
} 