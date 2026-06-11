import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      hubs: 'AI Hubs',
      history: 'History',
      settings: 'Settings',
      logout: 'Logout',
      skin: 'Skin',
      gastro: 'Gastro',
      login: 'Login',
      signup: 'Sign Up',
      guide: 'User Guide',
      admin: 'Admin Console',
    },
    // General Health Assistant
    health: {
      modeImage: 'Medical Imaging',
      modeGeneral: 'General Health Assistant',
      title: 'General Health Assistant',
      inputPlaceholder: 'Describe your symptoms (e.g., I have fever and cold for 3 days...)',
      analyzeBtn: 'Analyze Symptoms',
      voiceInput: 'Voice Input',
      sections: {
        possible: 'What this could be',
        actions: 'What you can do now',
        alert: 'When to seek medical help',
      },
    },
    // Landing
    landing: {
      hero: {
        title: 'Multi-Model AI Platform',
        subtitle: 'Unlock the power of AI across Medical, Agriculture, Finance, and Education',
        cta: 'Get Started',
        explore: 'Explore Hubs',
      },
      hubs: {
        medical: 'Medical AI',
        agriculture: 'Agriculture AI',
        finance: 'Finance AI',
        student: 'Student AI',
      },
    },
    // Auth
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      username: 'Username',
      confirmPassword: 'Confirm Password',
      alreadyHaveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
    },
    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      totalQueries: 'Total Queries',
      recentActivity: 'Recent Activity',
      activeHubs: 'Active Hubs',
      greetingMorning: 'Good Morning',
      greetingAfternoon: 'Good Afternoon',
      greetingEvening: 'Good Evening',
      subtitle: 'Monitor and control your AI ecosystem in real time.',
      systemStatus: 'AI System Status',
      operational: 'Operational',
      runningNormally: 'All AI services running normally',
      totalInteractions: 'Total Interactions',
      avgConfidence: 'Avg. Confidence',
      reportsGenerated: 'Reports Generated',
      imagesProcessed: 'Images Processed',
      performanceTrend: 'AI Performance Trend',
      insightsPanel: 'AI Insights Panel',
      ecosystemMap: 'AI Ecosystem Map',
      hubPerformance: 'Hub Performance',
      averageLoad: 'Average Load',
      peakUsage: 'Peak Usage',
      awaitingQuery: 'Awaiting first query',
      basedOnUsage: 'Based on usage',
      analyzingData: 'Analyzing real-time data',
      liveUpdates: 'Live updates',
      medAgri: 'Medical & Agriculture',
      mostUsedHub: 'Most Used Hub',
      highestConfidence: 'Highest Confidence',
      peakActivityTime: 'Peak Activity Time',
      productivityScore: 'User Productivity Score',
      suggestion: 'Intelligent Agent Suggestion: Expand Agriculture AI models during daylight peak activity.',
      viewAllHubs: 'View All Hubs',
      averageConfidenceLabel: 'Average Confidence',
      accuracyPeak: 'Accuracy Peak',
      flowStreams: 'Flow streams represent active data throughput',
      activityStreaming: 'Real-time activity logs streaming',
      ecosystemMapDesc: 'Real-time flow of interactions across your AI ecosystem',
      week1: 'Week 1',
      week2: 'Week 2',
      week3: 'Week 3',
      week4: 'Week 4',
      mostUsedValue: 'Medical AI',
      avgConfidenceValue: 'Average across all models',
      peakTimeValue: '4:00 PM – 7:00 PM',
      peakTimeSub: 'Most active hours',
      productivitySub: 'Great job! Keep it up 🚀',
      viewAll: 'View All',
      thisWeek: 'This Week',
      last4Weeks: 'Last 4 Weeks',
      last3Months: 'Last 3 Months',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      upload: 'Upload',
      analyze: 'Analyze',
      download: 'Download',
    },
    // Crop Recommendation
    crop: {
      location: 'Region / State',
      soil: 'Soil Type',
      season: 'Season',
      water: 'Water Availability',
      ph: 'Soil pH (Optional)',
      land: 'Land Size (Acres)',
      duration: 'Duration (Months)',
      budget: 'Budget (₹)',
      goal: 'Farming Goal',
      recommendbtn: 'Get Recommendations',
      why: 'Why this recommendation?',
      mapTitle: 'Geographic Context',
      types: {
        clay: 'Clay',
        sandy: 'Sandy',
        loamy: 'Loamy',
        black: 'Black Cotton',
        red: 'Red Soil',
      },
    },
    // UX Enhancements
    ux: {
      disclaimer: {
        title: 'AI Disclaimer',
        text: 'This platform provides AI-based predictions and insights. Results should not be treated as professional advice.',
        footer: 'AI results may vary. Consult a professional for critical decisions.',
      },
      guide: {
        title: 'How to use',
        medical: 'Select a model type (e.g., Lungs, Brain), upload a clear medical image (X-Ray/MRI), and optionally add patient notes. The AI will detect anomalies and provide guidance.',
        agriculture: 'Taking a clear photo of a crop leaf will allow the AI to detect diseases. You simply need to upload it to receive treatment advice.',
        finance: 'Upload your transactions CSV file to receive a spending analysis. Optionally upload a budget CSV to see how you are tracking against your goals.',
        student: 'Enter your CGPA, skills, and interests to get personalized career advice and study plans.',
      },
      actions: {
        copy: 'Copy Result',
        copied: 'Copied!',
        downloadParams: 'Download Report',
      },
      feedback: {
        title: 'Was this helpful?',
        thanks: 'Thanks for your feedback!',
      },
    },
    // User Guide Page
    guidePage: {
      title: 'User Guide & AI Disclaimer',
      subtitle: 'How to use the Multi-Model AI Platform safely and effectively',
      about: {
        title: 'About the Platform',
        text: 'This platform integrates multiple advanced AI models to provide insights across Medical, Agriculture, Finance, and Education sectors. Our goal is to democratize access to expert-level analysis using Artificial Intelligence.',
      },
      disclaimer: {
        title: 'Critical Disclaimer',
        text: 'This platform uses Artificial Intelligence to generate predictions and insights based on provided inputs. The results should NOT be treated as professional, medical, financial, or legal advice. Always consult qualified professionals.',
      },
      modules: {
        medical: {
          title: 'Medical AI',
          desc: 'Provides general health insights based on symptoms or imaging. Useful for preliminary screening.',
          limitation: 'Not a diagnosis. Do not use for emergencies.',
        },
        agriculture: {
          title: 'Agriculture AI',
          desc: 'Detects crop diseases from leaf images and recommends crops based on soil conditions.',
          limitation: 'Results depend on image quality and local weather factors.',
        },
        finance: {
          title: 'Finance AI',
          desc: 'Analyzes spending habits from transaction data to provide budgeting advice.',
          limitation: 'Not certified financial advice. Use for planning only.',
        },
        student: {
          title: 'Student AI',
          desc: 'Suggests career paths and study plans based on academic profile.',
          limitation: 'Career outcomes are not guaranteed.',
        },
      },
      understanding: {
        title: 'Understanding AI Results',
        points: [
          'AI predictions are probabilistic (based on patterns), not definite facts.',
          'The quality of the result depends heavily on the quality of your input/upload.',
          'AI models may occasionally hallucinate or provide incomplete information.'
        ]
      },
      safety: {
        title: 'When to Seek Human Expertise',
        text: 'Do not rely on AI for medical emergencies, major financial investments, legal disputes, or high-risk agricultural decisions. Human judgment is irreplaceable in these critical scenarios.',
      },
      privacy: {
        title: 'Data & Privacy',
        text: 'Your data is securely processed. We do not share your personal inputs with third parties without consent. Your history is linked strictly to your account.',
      }
    },
  },
  hi: {
    nav: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      hubs: 'AI हब',
      history: 'इतिहास',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      signup: 'साइन अप',
      guide: 'उपयोगकर्ता गाइड',
      admin: 'एडमिन कंसोल',
    },
    landing: {
      hero: {
        title: 'मल्टी-मॉडल AI प्लेटफॉर्म',
        subtitle: 'चिकित्सा, कृषि, वित्त और शिक्षा में AI की शक्ति को अनलॉक करें',
        cta: 'शुरू करें',
        explore: 'हब एक्सप्लोर करें',
      },
      hubs: {
        medical: 'चिकित्सा AI',
        agriculture: 'कृषि AI',
        finance: 'वित्त AI',
        student: 'छात्र AI',
      },
    },
    auth: {
      login: 'लॉगिन',
      signup: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'पूरा नाम',
      username: 'उपयोगकर्ता नाम',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      alreadyHaveAccount: 'पहले से खाता है?',
      noAccount: 'खाता नहीं है?',
    },
    dashboard: {
      welcome: 'वापसी पर स्वागत है',
      totalQueries: 'कुल क्वेरी',
      recentActivity: 'हाल की गतिविधि',
      activeHubs: 'सक्रिय हब',
      greetingMorning: 'शुभ प्रभात',
      greetingAfternoon: 'शुभ दोपहर',
      greetingEvening: 'शुभ संध्या',
      subtitle: 'वास्तविक समय में अपने AI पारिस्थितिकी तंत्र की निगरानी और नियंत्रण करें।',
      systemStatus: 'AI सिस्टम स्थिति',
      operational: 'सक्रिय',
      runningNormally: 'सभी AI सेवाएं सामान्य रूप से चल रही हैं',
      totalInteractions: 'कुल बातचीत',
      avgConfidence: 'औसत आत्मविश्वास',
      reportsGenerated: 'रिपोर्ट उत्पन्न',
      imagesProcessed: 'छवियों को संसाधित किया गया',
      performanceTrend: 'AI प्रदर्शन रुझान',
      insightsPanel: 'AI अंतर्दृष्टि पैनल',
      ecosystemMap: 'AI पारिस्थितिकी तंत्र मानचित्र',
      hubPerformance: 'हब प्रदर्शन',
      averageLoad: 'औसत भार',
      peakUsage: 'चरम उपयोग',
      awaitingQuery: 'पहली क्वेरी की प्रतीक्षा है',
      basedOnUsage: 'उपयोग के आधार पर',
      analyzingData: 'वास्तविक समय डेटा का विश्लेषण',
      liveUpdates: 'लाइव अपडेट',
      medAgri: 'चिकित्सा और कृषि',
      mostUsedHub: 'सर्वाधिक उपयोग किया जाने वाला हब',
      highestConfidence: 'उच्चतम आत्मविश्वास',
      peakActivityTime: 'चरम गतिविधि समय',
      productivityScore: 'उपयोगकर्ता उत्पादकता स्कोर',
      suggestion: 'बुद्धिमान एजेंट सुझाव: दिन के उजाले के चरम गतिविधि के दौरान कृषि AI मॉडल का विस्तार करें।',
      viewAllHubs: 'सभी हब देखें',
      averageConfidenceLabel: 'औसत आत्मविश्वास',
      accuracyPeak: 'सटीकता शिखर',
      flowStreams: 'प्रवाह धाराएं सक्रिय डेटा थ्रूपुट का प्रतिनिधित्व करती हैं',
      activityStreaming: 'वास्तविक समय गतिविधि लॉग स्ट्रीमिंग',
      ecosystemMapDesc: 'आपके AI पारिस्थितिकी तंत्र में बातचीत का वास्तविक समय प्रवाह',
      week1: 'सप्ताह 1',
      week2: 'सप्ताह 2',
      week3: 'सप्ताह 3',
      week4: 'सप्ताह 4',
      mostUsedValue: 'चिकित्सा AI',
      avgConfidenceValue: 'सभी मॉडलों में औसत',
      peakTimeValue: 'शाम 4:00 - शाम 7:00',
      peakTimeSub: 'सबसे सक्रिय घंटे',
      productivitySub: 'बहुत बढ़िया काम! इसे जारी रखें 🚀',
      viewAll: 'सभी देखें',
      thisWeek: 'इस सप्ताह',
      last4Weeks: 'पिछले 4 सप्ताह',
      last3Months: 'पिछले 3 महीने',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      back: 'वापस',
      next: 'अगला',
      submit: 'सबमिट करें',
      upload: 'अपलोड करें',
      analyze: 'विश्लेषण करें',
      download: 'डाउनलोड करें',
    },
    crop: {
      location: 'क्षेत्र / राज्य',
      soil: 'मिट्टी का प्रकार',
      season: 'मौसम',
      water: 'पानी की उपलब्धता',
      ph: 'मिट्टी का पीएच (वैकल्पिक)',
      land: 'भूमि का आकार (एकड़)',
      duration: 'अवधि (महीने)',
      budget: 'बजट (₹)',
      goal: 'खेती का लक्ष्य',
      recommendbtn: 'सिफारिशें प्राप्त करें',
      why: 'यह सिफारिश क्यों?',
      mapTitle: 'भौगोलिक संदर्भ',
      types: {
        clay: 'चिकनी मिट्टी',
        sandy: 'रेतीली मिट्टी',
        loamy: 'दुमट मिट्टी',
        black: 'काली मिट्टी',
        red: 'लाल मिट्टी',
      },
    },
    ux: {
      disclaimer: {
        title: 'AI अस्वीकरण',
        text: 'यह प्लेटफ़ॉर्म AI-आधारित भविष्यवाणियां और अंतर्दृष्टि प्रदान करता है। परिणामों को पेशेवर सलाह के रूप में नहीं माना जाना चाहिए।',
        footer: 'AI परिणाम भिन्न हो सकते हैं। महत्वपूर्ण निर्णयों के लिए किसी पेशेवर से सलाह लें।',
      },
      guide: {
        title: 'कैसे उपयोग करें',
        medical: 'एक मॉडल प्रकार चुनें (जैसे, फेफड़े, मस्तिष्क), एक स्पष्ट चिकित्सा छवि (X-Ray/MRI) अपलोड करें। AI विसंगतियों का पता लगाएगा और मार्गदर्शन प्रदान करेगा।',
        agriculture: 'फसल की पत्ती की स्पष्ट फोटो लेने से AI बीमारियों का पता लगा सकेगा। उपचार सलाह प्राप्त करने के लिए बस इसे अपलोड करें।',
        finance: 'खर्च विश्लेषण प्राप्त करने के लिए अपना लेनदेन CSV फ़ाइल अपलोड करें। अपने लक्ष्यों के खिलाफ ट्रैकिंग देखने के लिए वैकल्पिक रूप से बजट CSV अपलोड करें।',
        student: 'व्यक्तिगत करियर सलाह और अध्ययन योजनाएं प्राप्त करने के लिए अपना CGPA, कौशल और रुचियां दर्ज करें।',
      },
      actions: {
        copy: 'परिणाम को कॉपी करें',
        copied: 'कॉपी किया गया!',
        downloadParams: 'रिपोर्ट डाउनलोड करें',
      },
      feedback: {
        title: 'क्या यह सहायक था?',
        thanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
      },
    },
    guidePage: {
      title: 'उपयोगकर्ता गाइड और AI अस्वीकरण',
      subtitle: 'मल्टी-मॉडल AI प्लेटफॉर्म का सुरक्षित और प्रभावी ढंग से उपयोग कैसे करें',
      about: {
        title: 'प्लेटफ़ॉर्म के बारे में',
        text: 'यह प्लेटफ़ॉर्म चिकित्सा, कृषि, वित्त और शिक्षा क्षेत्रों में अंतर्दृष्टि प्रदान करने के लिए कई उन्नत AI मॉडल को एकीकृत करता है।',
      },
      disclaimer: {
        title: 'महत्वपूर्ण अस्वीकरण',
        text: 'यह प्लेटफ़ॉर्म इनपुट के आधार पर भविष्यवाणियां उत्पन्न करने के लिए AI का उपयोग करता है। परिणामों को पेशेवर, चिकित्सा, या वित्तीय सलाह के रूप में नहीं माना जाना चाहिए। हमेशा विशेषज्ञों से सलाह लें।',
      },
      modules: {
        medical: {
          title: 'चिकित्सा AI',
          desc: 'लक्षणों या इमेजिंग के आधार पर सामान्य स्वास्थ्य जानकारी प्रदान करता है।',
          limitation: 'यह निदान नहीं है। आपात स्थिति के लिए उपयोग न करें।',
        },
        agriculture: {
          title: 'कृषि AI',
          desc: 'फसल की बीमारियों का पता लगाता है और मिट्टी की स्थिति के आधार पर फसलों की सिफारिश करता है।',
          limitation: 'परिणाम छवि गुणवत्ता और स्थानीय कारकों पर निर्भर करते हैं।',
        },
        finance: {
          title: 'वित्त AI',
          desc: 'बजटिंग सलाह प्रदान करने के लिए लेनदेन डेटा से खर्च की आदतों का विश्लेषण करता है।',
          limitation: 'यह प्रमाणित वित्तीय सलाह नहीं है।',
        },
        student: {
          title: 'छात्र AI',
          desc: 'अकादमिक प्रोफ़ाइल के आधार पर करियर रास्तों और अध्ययन योजनाओं का सुझाव देता है।',
          limitation: 'करियर परिणामों की कोई गारंटी नहीं है।',
        },
      },
      understanding: {
        title: 'AI परिणामों को समझना',
        points: [
          'AI भविष्यवाणियां संभावनाओं पर आधारित होती हैं, निश्चित तथ्यों पर नहीं।',
          'परिणाम की गुणवत्ता आपके इनपुट की गुणवत्ता पर निर्भर करती है।',
          'AI मॉडल कभी-कभी गलत जानकारी प्रदान कर सकते हैं।'
        ]
      },
      safety: {
        title: 'मानव विशेषज्ञता कब लें',
        text: 'चिकित्सा आपात स्थितियों, बड़े वित्तीय निवेशों, या उच्च जोखिम वाले निर्णयों के लिए केवल AI पर निर्भर न रहें।',
      },
      privacy: {
        title: 'डेटा और गोपनीयता',
        text: 'आपका डेटा सुरक्षित रूप से संसाधित किया जाता है। हम आपकी सहमति के बिना आपके इनपुट साझा नहीं करते हैं।',
      }
    },
  },
  te: {
    nav: {
      home: 'హోమ్',
      dashboard: 'డాష్‌బోర్డ్',
      hubs: 'AI హబ్‌లు',
      history: 'చరిత్ర',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్అవుట్',
      login: 'లాగిన్',
      signup: 'సైన్ అప్',
      guide: 'యూజర్ గైడ్',
      admin: 'అడ్మిన్ కన్సోల్',
    },
    landing: {
      hero: {
        title: 'మల్టీ-మోడల్ AI ప్లాట్‌ఫార్మ్',
        subtitle: 'వైద్యం, వ్యవసాయం, ఫైనాన్స్ మరియు విద్యలో AI  శక్తిని అన్‌లాక్ చేయండి',
        cta: 'ప్రారంభించండి',
        explore: 'హబ్‌లను అన్వేషించండి',
      },
      hubs: {
        medical: 'వైద్య AI',
        agriculture: 'వ్యవసాయ AI',
        finance: 'ఫైనాన్స్ AI',
        student: 'విద్యార్థి AI',
      },
    },
    auth: {
      login: 'లాగిన్',
      signup: 'సైన్ అప్',
      email: 'ఇమెయిల్',
      password: 'పాస్‌వర్డ్',
      name: 'పూర్తి పేరు',
      username: 'వినియోగదారు పేరు',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      noAccount: 'ఖాతా లేదా?',
    },
    dashboard: {
      welcome: 'మళ్లీ స్వాగతం',
      totalQueries: 'మొత్తం ప్రశ్నలు',
      recentActivity: 'ఇటీవలి కార్యకలాపాలు',
      activeHubs: 'క్రియాశీల హబ్‌లు',
      greetingMorning: 'శుభోదయం',
      greetingAfternoon: 'మధ్యాహ్న శుభాకాంక్షలు',
      greetingEvening: 'శుభ సాయంత్రం',
      subtitle: 'నిజ సమయంలో మీ AI పర్యావరణ వ్యవస్థను పర్యవేక్షించండి మరియు నియంత్రించండి.',
      systemStatus: 'AI సిస్టమ్ స్థితి',
      operational: 'కార్యాచరణలో ఉంది',
      runningNormally: 'అన్ని AI సేవలు సాధారణంగా నడుస్తున్నాయి',
      totalInteractions: 'మొత్తం పరస్పర చర్యలు',
      avgConfidence: 'సగటు విశ్వాసం',
      reportsGenerated: 'ఉత్పత్తి చేయబడిన నివేదికలు',
      imagesProcessed: 'ప్రాసెస్ చేయబడిన చిత్రాలు',
      performanceTrend: 'AI పనితీరు ట్రెండ్',
      insightsPanel: 'AI అంతర్ద్విషయాల ప్యానెల్',
      ecosystemMap: 'AI పర్యావరణ వ్యవస్థ మ్యాప్',
      hubPerformance: 'హబ్ పనితీరు',
      averageLoad: 'సగటు లోడ్',
      peakUsage: 'గరిష్ట వినియోగం',
      awaitingQuery: 'మొదటి ప్రశ్న కోసం వేచి ఉంది',
      basedOnUsage: 'వినియోగం ఆధారంగా',
      analyzingData: 'నిజ-సమయ డేటాను విశ్లేషిస్తోంది',
      liveUpdates: 'లైవ్ అప్‌డేట్లు',
      medAgri: 'వైద్య & వ్యవసాయం',
      mostUsedHub: 'ఎక్కువగా ఉపయోగించిన హబ్',
      highestConfidence: 'అత్యధిక విశ్వాసం',
      peakActivityTime: 'గరిష్ట కార్యాచరణ సమయం',
      productivityScore: 'యూజర్ ఉత్పాదకత స్కోర్',
      suggestion: 'ఇంటెలిజెంట్ ఏజెంట్ సూచన: పగటిపూట గరిష్ట కార్యాచరణలో వ్యవసాయ AI మోడళ్లను విస్తరించండి.',
      viewAllHubs: 'అన్ని హబ్‌లను వీక్షించండి',
      averageConfidenceLabel: 'సగటు విశ్వాసం',
      accuracyPeak: 'ఖచ్చితత్వ గరిష్ఠం',
      flowStreams: 'ప్రవాహ స్ట్రీమ్‌లు క్రియాశీల డేటా బదిలీని సూచిస్తాయి',
      activityStreaming: 'నిజ-సమయ కార్యాచరణ లాగ్‌లు స్ట్రీమింగ్ అవుతున్నాయి',
      ecosystemMapDesc: 'మీ AI పర్యావరణ వ్యవస్థలో పరస్పర చర్యల నిజ-సమయ ప్రవాహం',
      week1: 'వారం 1',
      week2: 'వారం 2',
      week3: 'వారం 3',
      week4: 'వారం 4',
      mostUsedValue: 'వైద్య AI',
      avgConfidenceValue: 'అన్ని మోడళ్లలో సగటు',
      peakTimeValue: 'సాయంత్రం 4:00 – 7:00',
      peakTimeSub: 'ఎక్కువగా యాక్టివ్ గా ఉండే గంటలు',
      productivitySub: 'అద్భుతమైన పని! ఇలాగే కొనసాగించండి 🚀',
      viewAll: 'అన్నీ వీక్షించండి',
      thisWeek: 'ఈ వారం',
      last4Weeks: 'గత 4 వారాలు',
      last3Months: 'గత 3 నెలలు',
    },
    common: {
      loading: 'లోడ్ అవుతోంది...',
      error: 'దోషం',
      success: 'విజయం',
      save: 'సేవ్ చేయండి',
      cancel: 'రద్దు చేయండి',
      delete: 'తొలగించండి',
      edit: 'సవరించండి',
      back: 'వెనక్కి',
      next: 'తరువాత',
      submit: 'సమర్పించండి',
      upload: 'అప్‌లోడ్ చేయండి',
      analyze: 'విశ్లేషించండి',
      download: 'డౌన్‌లోడ్ చేయండి',
    },
    crop: {
      location: 'ప్రాంతం / రాష్ట్రం',
      soil: 'మట్టి రకం',
      season: 'సీజన్',
      water: 'నీటి లభ్యత',
      ph: 'మట్టి pH (ఐచ్ఛికం)',
      land: 'భూమి పరిమాణం (ఎకరాలు)',
      duration: 'కాలవ్యవధి (నెలలు)',
      budget: 'బడ్జెట్ (₹)',
      goal: 'వ్యవసాయ లక్ష్యం',
      recommendbtn: 'సిఫార్సులను పొందండి',
      why: 'ఈ సిఫార్సు ఎందుకు?',
      mapTitle: 'భౌగోళిక సందర్భం',
      types: {
        clay: 'బంకమట్టి',
        sandy: 'ఇసుక నేల',
        loamy: 'లోమీ నేల',
        black: 'నల్ల రేగడి',
        red: 'ఎర్ర నేల',
      },
    },
    ux: {
      disclaimer: {
        title: 'AI నిరాకరణ',
        text: 'ఈ ప్లాట్‌ఫారమ్ AI-ఆధారిత అంచనాలు మరియు అంతర్దృష్టులను అందిస్తుంది. ఫలితాలను వృత్తిపరమైన సలహాగా పరిగణించకూడదు.',
        footer: 'AI ఫలితాలు మారవచ్చు. కీలక నిర్ణయాల కోసం నిపుణుడిని సంప్రదించండి.',
      },
      guide: {
        title: 'ఎలా ఉపయోగించాలి',
        medical: 'మోడల్ రకాన్ని ఎంచుకోండి (ఉదా., ఊపిరితిత్తులు), స్పష్టమైన వైద్య చిత్రాన్ని (X-Ray/MRI) అప్‌లోడ్ చేయండి. AI సమస్యలను గుర్తించి మార్గదర్శకత్వం ఇస్తుంది.',
        agriculture: 'పంట ఆకు యొక్క స్పష్టమైన ఫోటో తీయడం ద్వారా AI వ్యాధులను గుర్తించగలదు. చికిత్స సలహా కోసం దాన్ని అప్‌లోడ్ చేయండి.',
        finance: 'ఖర్చు విశ్లేషణను పొందడానికి మీ లావాదేవీల CSV ఫైల్‌ను అప్‌లోడ్ చేయండి. మీ లక్ష్యాలను బట్టి బడ్జెట్ CSV ని కూడా అప్‌లోడ్ చేయవచ్చు.',
        student: 'కెరీర్ సలహాలు మరియు అధ్యయన ప్రణాళికలను పొందడానికి మీ CGPA, నైపుణ్యాలు మరియు ఆసక్తులను నమోదు చేయండి.',
      },
      actions: {
        copy: 'ఫలితాన్ని కాపీ చేయండి',
        copied: 'కాపీ చేయబడింది!',
        downloadParams: 'నివేదికను డౌన్‌లోడ్ చేయండి',
      },
      feedback: {
        title: 'ఇది ఉపయోగకరంగా ఉందా?',
        thanks: 'మీ స్పందనకు ధన్యవాదాలు!',
      },
    },
    guidePage: {
      title: 'యూజర్ గైడ్ & AI నిరాకరణ',
      subtitle: 'మల్టీ-మోడల్ AI ప్లాట్‌ఫారమ్‌ను సురక్షితంగా ఎలా ఉపయోగించాలి',
      about: {
        title: 'ప్లాట్‌ఫారమ్ గురించి',
        text: 'వైద్యం, వ్యవసాయం, ఫైనాన్స్ మరియు విద్య రంగాలలో అంతర్దృష్టులను అందించడానికి ఈ ప్లాట్‌ఫారమ్ అధునాతన AI మోడళ్లను ఉపయోగిస్తుంది.',
      },
      disclaimer: {
        title: 'ముఖ్యమైన గమనిక',
        text: 'ఈ ప్లాట్‌ఫారమ్ అంచనాలను అందించడానికి AI ని ఉపయోగిస్తుంది. ఫలితాలను వృత్తిపరమైన, వైద్య లేదా ఆర్థిక సలహాగా పరిగణించకూడదు. ఎల్లప్పుడూ నిపుణులను సంప్రదించండి.',
      },
      modules: {
        medical: {
          title: 'వైద్య AI',
          desc: 'లక్షణాలు లేదా ఇమేజింగ్ ఆధారంగా ఆరోగ్య సమాచారాన్ని అందిస్తుంది.',
          limitation: 'ఇది వైద్య నిర్ధారణ కాదు. అత్యవసర పరిస్థితులకు ఉపయోగించవద్దు.',
        },
        agriculture: {
          title: 'వ్యవసాయ AI',
          desc: 'లక్షణాలు దెబ్బతిన్న పంటలను గుర్తిస్తుంది మరియు మట్టి ఆధారంగా పంటలను సిఫార్సు చేస్తుంది.',
          limitation: 'ఫలితాలు ఫోటో నాణ్యతపై ఆధారపడి ఉంటాయి.',
        },
        finance: {
          title: 'ఫైనాన్స్ AI',
          desc: 'ఖర్చు అలవాట్లను విశ్లేషించి బడ్జెట్ సలహాలను ఇస్తుంది.',
          limitation: 'ఇది ఆర్థిక సలహా కాదు. ప్రణాళిక కోసం మాత్రమే ఉపయోగించండి.',
        },
        student: {
          title: 'విద్యార్థి AI',
          desc: 'అకడమిక్ ప్రొఫైల్ ఆధారంగా కెరీర్ మార్గాలను సూచిస్తుంది.',
          limitation: 'కెరీర్ ఫలితాలకు హామీ లేదు.',
        },
      },
      understanding: {
        title: 'AI ఫలితాలను అర్థం చేసుకోవడం',
        points: [
          'AI అంచనాలు సంభావ్యతపై ఆధారపడి ఉంటాయి, కచ్చితమైన వాస్తవాలు కాదు.',
          'ఫలితం నాణ్యత మీ ఇన్‌పుట్ నాణ్యతపై ఆధారపడి ఉంటుంది.',
          'AI మోడల్స్ కొన్నిసార్లు తప్పు సమాచారాన్ని ఇవ్వవచ్చు.'
        ]
      },
      safety: {
        title: 'నిపుణులను ఎప్పుడు సంప్రదించాలి',
        text: 'వైద్య అత్యవసర పరిస్థితులు లేదా పెద్ద ఆర్థిక పెట్టుబడుల కోసం కేవలం AI పై ఆధారపడకండి.',
      },
      privacy: {
        title: 'డేటా & గోప్యత',
        text: 'మీ డేటా సురక్షితంగా రక్షించబడుతుంది. మీ సమాచారం మూడవ పక్షాలతో భాగస్వామ్యం చేయబడదు.',
      }
    },
  },
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Defensive fallback: return safe defaults instead of throwing,
    // prevents ReferenceError: language is not defined in any edge case.
    const safeLang = localStorage.getItem('language') || 'en';
    return {
      language: safeLang,
      changeLanguage: () => {},
      t: (key) => key,
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const SUPPORTED = ['en', 'hi', 'te'];

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return SUPPORTED.includes(saved) ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    if (!key) return '';
    const keys = key.split('.');
    // Try current language first, fall back to 'en', then return key
    let value = translations[language] ?? translations['en'];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined && value !== null) return value;
    // Try English fallback
    let fallback = translations['en'];
    for (const k of keys) {
      fallback = fallback?.[k];
    }
    return fallback ?? key;
  };

  const changeLanguage = (lang) => {
    if (SUPPORTED.includes(lang)) {
      setLanguage(lang);
    } else {
      console.warn(`[LanguageProvider] Unsupported locale: "${lang}", defaulting to "en"`);
      setLanguage('en');
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

