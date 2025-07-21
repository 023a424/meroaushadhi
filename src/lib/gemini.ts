// yo flowise api ko configuration ho
const FLOWISE_API_URL = process.env.NEXT_PUBLIC_FLOWISE_API_URL || 'http://localhost:5000';
const FLOWISE_CHATFLOW_ID = process.env.NEXT_PUBLIC_FLOWISE_CHATFLOW_ID;

if (!FLOWISE_CHATFLOW_ID) {
  console.error('FLOWISE_CHATFLOW_ID is not configured in environment variables');
}

// Message types
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

// Create a type for section data
export type SectionData = {
  title: string;
  content: string;
  status: 'loading' | 'complete' | 'error';
  error?: string;
};

// Create a type for the analysis update callback
type AnalysisUpdateCallback = (sections: Record<string, SectionData>) => void;

// Helper function to make API requests
async function makeFlowiseRequest(
  question: string,
  imageDataUrl?: string,
  sessionId?: string,
  onProgress?: (chunk: string) => void
) {
  console.log('=== Flowise Request Details ===');
  console.log('Question:', question);
  console.log('Session ID:', sessionId);
  console.log('Has Image:', !!imageDataUrl);

  const requestPayload: any = {
    question,
    sessionId,
    overrideConfig: {
      sessionId,
      // Disable streaming by default
      streamResponse: false
    }
  };

  if (imageDataUrl) {
    requestPayload.uploads = [{
      data: imageDataUrl,
      type: 'file',
      name: 'medicine.jpg',
      mime: 'image/jpeg'
    }];
  }

  const response = await fetch(`${FLOWISE_API_URL}/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload)
  });

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText);
    throw new Error('Failed to get response from Flowise');
  }

  const result = await response.json();
  console.log('=== Response ===');
  console.log('Response:', result);
  return result.text?.trim() || '';
}

// Initial analysis prompt
function getInitialPrompt(lang: 'en' | 'np') {
  return lang === 'en' 
    ? `Analyze this medicine package and provide a clear, simple analysis in this format:

MEDICINE NAME: [Name as shown on package]
CATEGORY: [Type of medicine]

KEY INFORMATION:
---------------
1. ACTIVE INGREDIENTS:
   - [Main ingredients with amounts]

2. USES:
   - [Main uses/purpose]

3. DOSAGE:
   - [Basic dosage info]

4. WARNINGS:
   - [Key safety warnings]

Keep it simple and clear. Focus on the most important information visible on the package.`
    : `यो औषधि प्याकेज विश्लेषण गर्नुहोस् र यो ढाँचामा स्पष्ट, सरल विश्लेषण प्रदान गर्नुहोस्:

औषधिको नाम: [प्याकेजमा देखाइएको नाम]
वर्ग: [औषधिको प्रकार]

मुख्य जानकारी:
-------------
1. सक्रिय तत्वहरू:
   - [मात्रासहित मुख्य तत्वहरू]

2. प्रयोगहरू:
   - [मुख्य प्रयोग/उद्देश्य]

3. मात्रा:
   - [आधारभूत मात्रा जानकारी]

4. चेतावनीहरू:
   - [मुख्य सुरक्षा चेतावनीहरू]

सरल र स्पष्ट राख्नुहोस्। प्याकेजमा देखिने सबैभन्दा महत्वपूर्ण जानकारीमा ध्यान दिनुहोस्।`;
}

// Update the medicine name extraction patterns
function extractMedicineName(analysis: string): string {
  try {
    // First try to find the medicine name in the structured format
    const structuredPatterns = [
      /MEDICINE NAME:\s*([^\n]+)/i,
      /औषधिको नाम:\s*([^\n]+)/i
    ];

    for (const pattern of structuredPatterns) {
      const match = analysis.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback patterns for older analyses
    const fallbackPatterns = [
      /(?:Medicine name|Name|Medicine):\s*([^\n.]+)/i,
      /^(?:Medicine name|Name|Medicine):\s*([^\n.]+)/im,
      /The medicine "([^"]+)"/i,
      /medicine called "([^"]+)"/i,
      /medicine (?:is|named|called) ([^\n.]+)/i
    ];

    for (const pattern of fallbackPatterns) {
      const match = analysis.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        return name.replace(/^(the|medicine|name|called|is)\s+/i, '');
      }
    }

    // If no patterns match, try to extract from the first line
    const firstLine = analysis.split('\n')[0];
    const cleanedFirstLine = firstLine
      .replace(/^(?:based on|looking at|analyzing|for|the|medicine|package)\s+/i, '')
      .replace(/(?:you provided|provided|image|package|here|is)\s*$/i, '')
      .trim();

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

// Function to start a new chat session
export async function startMedicineChat(imageDataUrl: string, lang: 'en' | 'np' = 'en') {
  try {
    const sessionId = Math.random().toString(36).substring(7);
    const initialResponse = await makeFlowiseRequest(getInitialPrompt(lang), imageDataUrl, sessionId);
    
    return {
      sessionId,
      initialMessage: initialResponse
    };
  } catch (error: any) {
    console.error('=== Medicine Chat Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    throw new Error(lang === 'en' 
      ? 'Failed to analyze medicine. Please try again.'
      : 'औषधि विश्लेषण गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
    );
  }
}

// Function to send a chat message
export async function sendChatMessage(
  message: string, 
  sessionId: string,
  onProgress?: (chunk: string) => void,
  lang: 'en' | 'np' = 'en'
) {
  try {
    const messageWithContext = lang === 'np' 
      ? `कृपया यो प्रश्नको स्पष्ट र सरल उत्तर दिनुहोस्:

${message}

निर्देशनहरू:
- सकेसम्म विशिष्ट जानकारी दिनुहोस्
- बुँदागत रूपमा लेख्नुहोस्
- महत्वपूर्ण कुराहरू बोल्ड गर्नुहोस्
- जानकारी नभएको खण्डमा सामान्य जानकारी दिनुहोस्`
      : `Please provide a clear and simple answer to this question:

${message}

Guidelines:
- Be as specific as possible
- Use bullet points
- Bold important information
- If specific info isn't available, provide general guidance`;

    const response = await makeFlowiseRequest(messageWithContext, undefined, sessionId);
    return response;
  } catch (error: any) {
    console.error('Chat Error:', error);
    throw new Error(lang === 'en'
      ? 'Failed to send message. Please try again.'
      : 'सन्देश पठाउन असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
    );
  }
}

// Update the PROMPTS object to include Nepali translations
const PROMPTS = {
  en: {
    identification: `Please analyze this product and provide the following information:
1. Product name as shown on package
2. Product category/type
3. Registration information if visible
4. Manufacturer details

Please format as:
Name:
Category:
Manufacturer:
Registration:`,

    composition: `Please analyze and list:
1. Main components and their quantities
2. Additional components if visible
3. Standard formulation details if available

Format as:
Main Components:
- [component]: [quantity]
Additional Components:
- [list]`,

    therapeutic: `Please provide information about:
1. Primary purposes
2. How it functions
3. Expected outcomes
4. Research-based information

Format as:
Primary Purposes:
Function:
Expected Outcomes:`,

    dosage: `Please provide information about:
1. Usage instructions
2. Recommended timing
3. Duration guidelines
4. Best practices

Format as:
Instructions:
Timing:
Duration:
Best Practices:`,

    safety: `Please provide information about:
1. Important precautions
2. Usage considerations
3. Common effects
4. Interaction guidelines

Format as:
Precautions:
Considerations:
Effects:
Guidelines:`,

    storage: `Please provide:
1. Storage recommendations
2. Duration of effectiveness
3. Handling guidelines

Format as:
Storage:
Duration:
Guidelines:`,

    manufacturer: `Please provide:
1. Company information
2. Contact details
3. Website if available

Format as:
Company:
Contact:
Website:`
  },
  np: {
    identification: `तपाईं एक औषधि पहिचान विशेषज्ञ हुनुहुन्छ। यो औषधि प्याकेजमा हेर्नुहोस् र मलाई बताउनुहोस्:
1. सटीक औषधिको नाम
2. निर्माताको नाम
3. कुनै दर्ता/लाइसेन्स नम्बरहरू देखिन्छन्
4. औषधिको प्रकार/वर्ग

जानकारी यस ढाँचामा प्रस्तुत गर्नुहोस्:
नाम:
वर्ग:
निर्माता:
दर्ता:`,

    composition: `तपाईं एक फार्मास्युटिकल संरचना विशेषज्ञ हुनुहुन्छ। यस औषधिको लागि:
1. सबै सक्रिय तत्वहरू र तिनको मात्रा सूचीबद्ध गर्नुहोस्
2. सबै निष्क्रिय तत्वहरू सूचीबद्ध गर्नुहोस् यदि देखिन्छ भने
3. मानक फर्मुलेसन विवरणहरू फेला पार्नुहोस्

यस ढाँचामा:
सक्रिय तत्वहरू:
- [तत्व]: [मात्रा]
निष्क्रिय तत्वहरू:
- [सूची]`,

    therapeutic: `तपाईं एक चिकित्सा विशेषज्ञ हुनुहुन्छ। यस औषधिको लागि:
1. यसको प्राथमिक प्रयोगहरू अनुसन्धान र व्याख्या गर्नुहोस्
2. यसको कार्य प्रक्रिया वर्णन गर्नुहोस्
3. अपेक्षित लाभहरू सूचीबद्ध गर्नुहोस्
4. चिकित्सा डाटाबेस र क्लिनिकल अध्ययनहरू प्रयोग गर्नुहोस्

यस ढाँचामा:
प्राथमिक प्रयोगहरू:
कार्य प्रक्रिया:
अपेक्षित लाभहरू:`,

    dosage: `तपाईं एक औषधि मात्रा विशेषज्ञ हुनुहुन्छ। यस औषधिको लागि:
1. मानक मात्रा निर्देशनहरू प्रदान गर्नुहोस्
2. प्रशासन विधि व्याख्या गर्नुहोस्
3. समय सिफारिसहरू निर्दिष्ट गर्नुहोस्
4. अवधि दिशानिर्देशहरू समावेश गर्नुहोस्

यस ढाँचामा:
मानक मात्रा:
विधि:
समय:
अवधि:`,

    safety: `तपाईं एक औषधि सुरक्षा विशेषज्ञ हुनुहुन्छ। यस औषधिको लागि:
1. सबै महत्वपूर्ण चेतावनीहरू सूचीबद्ध गर्नुहोस्
2. प्रतिकूल स्थितिहरू निर्दिष्ट गर्नुहोस्
3. सम्भावित साइड इफेक्टहरू विस्तृत गर्नुहोस्
4. ज्ञात औषधि अन्तर्क्रियाहरू सूचीबद्ध गर्नुहोस्

यस ढाँचामा:
चेतावनीहरू:
प्रतिकूल स्थितिहरू:
साइड इफेक्टहरू:
औषधि अन्तर्क्रियाहरू:`,

    storage: `तपाईं एक फार्मास्युटिकल भण्डारण विशेषज्ञ हुनुहुन्छ। यस औषधिको लागि:
1. भण्डारण अवस्थाहरू निर्दिष्ट गर्नुहोस्
2. शेल्फ लाइफ बताउनुहोस्
3. कुनै विशेष ह्यान्डलिङ निर्देशनहरू सूचीबद्ध गर्नुहोस्

यस ढाँचामा:
भण्डारण अवस्थाहरू:
शेल्फ लाइफ:
विशेष निर्देशनहरू:`,

    manufacturer: `तपाईं एक फार्मास्युटिकल कम्पनी अनुसन्धानकर्ता हुनुहुन्छ। यस निर्माताको लागि:
1. पूर्ण कम्पनी विवरणहरू प्रदान गर्नुहोस्
2. आधिकारिक सम्पर्क जानकारी फेला पार्नुहोस्
3. कम्पनी वेबसाइट प्रमाणित गर्नुहोस्

यस ढाँचामा:
कम्पनी:
सम्पर्क:
वेबसाइट:`
  }
} as const;

// Function to process a single section
async function processSection(
  section: string,
  prompt: string,
  imageDataUrl: string,
  updateCallback: AnalysisUpdateCallback,
  currentSections: Record<string, SectionData>
) {
  try {
    const result = await makeFlowiseRequest(prompt, imageDataUrl, undefined);
    const updatedSections = {
      ...currentSections,
      [section]: {
        title: section.toUpperCase(),
        content: result,
        status: 'complete' as const
      }
    };
    updateCallback(updatedSections);
    return result;
  } catch (error: any) {
    const updatedSections = {
      ...currentSections,
      [section]: {
        title: section.toUpperCase(),
        content: '',
        status: 'error' as const,
        error: error.message
      }
    };
    updateCallback(updatedSections);
    throw error;
  }
}

// Update the analyzeImage function to use language-specific prompts
export async function analyzeImage(
  imageDataUrl: string,
  updateCallback?: AnalysisUpdateCallback,
  lang: 'en' | 'np' = 'en'
) {
  const sections: Record<string, SectionData> = {
    identification: {
      title: lang === 'en' ? 'MEDICINE OVERVIEW' : 'औषधि विवरण',
      content: '',
      status: 'loading'
    },
    composition: {
      title: lang === 'en' ? 'COMPOSITION' : 'संरचना',
      content: '',
      status: 'loading'
    },
    therapeutic: {
      title: lang === 'en' ? 'THERAPEUTIC INFORMATION' : 'चिकित्सकीय जानकारी',
      content: '',
      status: 'loading'
    },
    dosage: {
      title: lang === 'en' ? 'DOSAGE & ADMINISTRATION' : 'मात्रा र प्रशासन',
      content: '',
      status: 'loading'
    },
    safety: {
      title: lang === 'en' ? 'SAFETY INFORMATION' : 'सुरक्षा जानकारी',
      content: '',
      status: 'loading'
    },
    storage: {
      title: lang === 'en' ? 'STORAGE & HANDLING' : 'भण्डारण र ह्यान्डलिङ',
      content: '',
      status: 'loading'
    },
    manufacturer: {
      title: lang === 'en' ? 'MANUFACTURER INFORMATION' : 'निर्माता जानकारी',
      content: '',
      status: 'loading'
    }
  };

  // Initialize with loading state
  updateCallback?.(sections);

  try {
    // Process all sections concurrently using language-specific prompts
    const requests = Object.entries(PROMPTS[lang]).map(([section, prompt]) =>
      processSection(section, prompt, imageDataUrl, updateCallback || (() => {}), sections)
    );

    // Wait for all requests to complete
    const results = await Promise.allSettled(requests);

    // Format the final report
    let fullReport = '';
    Object.entries(sections).forEach(([section, data], index) => {
      const result = results[index];
      
      fullReport += `${data.title}\n${'-'.repeat(data.title.length)}\n`;
      
      if (result.status === 'fulfilled') {
        fullReport += result.value;
      } else {
        fullReport += lang === 'en' 
          ? `Error: ${result.reason.message}`
          : `त्रुटि: ${result.reason.message}`;
      }
      
      fullReport += '\n\n';
    });

    return fullReport.trim();

  } catch (error: any) {
    console.error('=== Medicine Analysis Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    throw new Error(lang === 'en'
      ? 'Failed to complete medicine analysis. Please try again.'
      : 'औषधि विश्लेषण पूरा गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
    );
  }
}

// Update the context prompt format to get better responses
export function getContextPrompt(initialAnalysis: string, userQuestion: string, lang: 'en' | 'np' = 'en') {
  return lang === 'en'
    ? `You are a knowledgeable medical assistant. Based on this medicine information:
${initialAnalysis}

Please answer this question:
${userQuestion}

Important guidelines:
1. Always provide specific information based on the medicine details provided
2. If information is not available in the analysis, provide general information about similar medicines
3. Use bullet points for clarity
4. Bold important warnings or key points
5. Keep the response concise but informative
6. Never say "the provided text does not list..." - instead, provide relevant general information
7. For side effects or similar questions, list common ones from reliable medical sources`
    : `तपाईं एक जानकार मेडिकल सहायक हुनुहुन्छ। यो औषधि जानकारीको आधारमा:
${initialAnalysis}

कृपया यो प्रश्नको उत्तर दिनुहोस्:
${userQuestion}

महत्वपूर्ण निर्देशनहरू:
1. सधैं प्रदान गरिएको औषधि विवरणको आधारमा विशिष्ट जानकारी प्रदान गर्नुहोस्
2. यदि विश्लेषणमा जानकारी उपलब्ध छैन भने, समान औषधिहरूको बारेमा सामान्य जानकारी प्रदान गर्नुहोस्
3. स्पष्टताको लागि बुँदाहरू प्रयोग गर्नुहोस्
4. महत्वपूर्ण चेतावनी वा मुख्य बुँदाहरूलाई बोल्ड गर्नुहोस्
5. उत्तर संक्षिप्त तर जानकारीपूर्ण राख्नुहोस्
6. कहिल्यै "प्रदान गरिएको पाठमा उल्लेख छैन..." नभन्नुहोस् - बरु, सान्दर्भिक सामान्य जानकारी प्रदान गर्नुहोस्
7. साइड इफेक्ट वा यस्तै प्रश्नहरूको लागि, विश्वसनीय मेडिकल स्रोतहरूबाट सामान्य प्रभावहरू सूचीबद्ध गर्नुहोस्`;
} 