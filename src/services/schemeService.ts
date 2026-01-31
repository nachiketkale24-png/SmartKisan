import AsyncStorage from '@react-native-async-storage/async-storage';
import schemesData from '../data/schemes.json';
import farmerProfile from '../data/farmerProfile.json';

// Types
export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  benefit: string;
  benefitAmount: number;
  deadline: string;
  status: 'Open' | 'Closed' | 'Closing Soon';
  description: string;
  descriptionHindi: string;
  benefits: string[];
  eligibility: {
    maxLandSize: number;
    aadhaarRequired: boolean;
    bankAccountRequired: boolean;
    states: string[];
  };
  documents: string[];
  applyMethod: string;
  applyLink: string;
}

export interface FarmerProfile {
  farmerId: string;
  name: string;
  nameHindi: string;
  phone: string;
  state: string;
  stateHindi: string;
  district: string;
  village: string;
  landSize: number;
  landUnit: string;
  cropTypes: string[];
  aadhaarLinked: boolean;
  bankLinked: boolean;
  bankName: string;
  kccHolder: boolean;
  category: string;
  registeredSchemes: string[];
}

export interface EligibilityResult {
  isEligible: boolean;
  missingRequirements: string[];
  missingRequirementsHindi: string[];
  matchedCriteria: string[];
  matchedCriteriaHindi: string[];
}

// Storage keys
const SCHEMES_CACHE_KEY = 'agriguard_schemes_cache';
const FARMER_PROFILE_KEY = 'agriguard_farmer_profile';

// Get schemes with offline support
export const getSchemes = async (): Promise<{ schemes: Scheme[]; lastUpdated: string; isOffline: boolean }> => {
  try {
    // Try to get cached data
    const cached = await AsyncStorage.getItem(SCHEMES_CACHE_KEY);
    
    // In a real app, you would fetch from API here
    // For now, we use local JSON and cache it
    const data = schemesData;
    
    // Cache the data
    await AsyncStorage.setItem(SCHEMES_CACHE_KEY, JSON.stringify(data));
    
    return {
      schemes: data.schemes as Scheme[],
      lastUpdated: data.lastUpdated,
      isOffline: false,
    };
  } catch (error) {
    // If error, try to return cached data
    try {
      const cached = await AsyncStorage.getItem(SCHEMES_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          schemes: data.schemes as Scheme[],
          lastUpdated: data.lastUpdated,
          isOffline: true,
        };
      }
    } catch (cacheError) {
      console.log('Cache read error:', cacheError);
    }
    
    // Return local data as fallback
    return {
      schemes: schemesData.schemes as Scheme[],
      lastUpdated: schemesData.lastUpdated,
      isOffline: true,
    };
  }
};

// Get single scheme by ID
export const getSchemeById = async (id: string): Promise<Scheme | null> => {
  const { schemes } = await getSchemes();
  return schemes.find(scheme => scheme.id === id) || null;
};

// Get farmer profile
export const getFarmerProfile = async (): Promise<FarmerProfile> => {
  try {
    const stored = await AsyncStorage.getItem(FARMER_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return default profile
    return farmerProfile as FarmerProfile;
  } catch (error) {
    return farmerProfile as FarmerProfile;
  }
};

// Save farmer profile
export const saveFarmerProfile = async (profile: FarmerProfile): Promise<void> => {
  await AsyncStorage.setItem(FARMER_PROFILE_KEY, JSON.stringify(profile));
};

// Check eligibility for a scheme
export const checkEligibility = async (scheme: Scheme): Promise<EligibilityResult> => {
  const profile = await getFarmerProfile();
  
  const missingRequirements: string[] = [];
  const missingRequirementsHindi: string[] = [];
  const matchedCriteria: string[] = [];
  const matchedCriteriaHindi: string[] = [];
  
  // Check land size
  if (scheme.eligibility.maxLandSize && profile.landSize <= scheme.eligibility.maxLandSize) {
    matchedCriteria.push(`Land size (${profile.landSize} acres) within limit`);
    matchedCriteriaHindi.push(`भूमि का आकार (${profile.landSize} एकड़) सीमा के भीतर`);
  } else if (scheme.eligibility.maxLandSize && profile.landSize > scheme.eligibility.maxLandSize) {
    missingRequirements.push(`Land size must be less than ${scheme.eligibility.maxLandSize} acres`);
    missingRequirementsHindi.push(`भूमि का आकार ${scheme.eligibility.maxLandSize} एकड़ से कम होना चाहिए`);
  }
  
  // Check Aadhaar linking
  if (scheme.eligibility.aadhaarRequired) {
    if (profile.aadhaarLinked) {
      matchedCriteria.push('Aadhaar is linked');
      matchedCriteriaHindi.push('आधार लिंक है');
    } else {
      missingRequirements.push('Aadhaar must be linked');
      missingRequirementsHindi.push('आधार लिंक होना चाहिए');
    }
  }
  
  // Check Bank account linking
  if (scheme.eligibility.bankAccountRequired) {
    if (profile.bankLinked) {
      matchedCriteria.push('Bank account is linked');
      matchedCriteriaHindi.push('बैंक खाता लिंक है');
    } else {
      missingRequirements.push('Bank account must be linked');
      missingRequirementsHindi.push('बैंक खाता लिंक होना चाहिए');
    }
  }
  
  // Check state eligibility
  if (scheme.eligibility.states.length > 0 && !scheme.eligibility.states.includes('All States')) {
    if (scheme.eligibility.states.includes(profile.state)) {
      matchedCriteria.push(`State (${profile.state}) is eligible`);
      matchedCriteriaHindi.push(`राज्य (${profile.stateHindi}) पात्र है`);
    } else {
      missingRequirements.push(`This scheme is not available in ${profile.state}`);
      missingRequirementsHindi.push(`यह योजना ${profile.stateHindi} में उपलब्ध नहीं है`);
    }
  } else {
    matchedCriteria.push('Available in all states');
    matchedCriteriaHindi.push('सभी राज्यों में उपलब्ध');
  }
  
  return {
    isEligible: missingRequirements.length === 0,
    missingRequirements,
    missingRequirementsHindi,
    matchedCriteria,
    matchedCriteriaHindi,
  };
};

// Generate scheme summary for voice
export const getSchemeSummaryForVoice = (scheme: Scheme, language: 'en' | 'hi' = 'hi'): string => {
  if (language === 'hi') {
    return `${scheme.nameHindi}। 
    लाभ: ${scheme.benefit}। 
    आवेदन की अंतिम तिथि: ${formatDateHindi(scheme.deadline)}। 
    ${scheme.descriptionHindi}। 
    आवेदन कैसे करें: ${scheme.applyMethod}।`;
  }
  
  return `${scheme.name}. 
    Benefit: ${scheme.benefit}. 
    Application deadline: ${formatDate(scheme.deadline)}. 
    ${scheme.description}. 
    How to apply: ${scheme.applyMethod}.`;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Format date in Hindi
export const formatDateHindi = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Get days remaining until deadline
export const getDaysRemaining = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
