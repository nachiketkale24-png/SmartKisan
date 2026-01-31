import AsyncStorage from '@react-native-async-storage/async-storage';
import mandiPricesData from '../data/mandi_prices.json';

// Types
export interface MandiPrice {
  name: string;
  nameHindi: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface CropPrices {
  crop: string;
  cropHindi: string;
  mandis: MandiPrice[];
}

export interface BestMandiRecommendation {
  crop: string;
  cropHindi: string;
  mandi: MandiPrice;
  message: string;
  messageHindi: string;
}

// Storage keys
const MANDI_PRICES_CACHE_KEY = 'agriguard_mandi_prices_cache';

// Get all mandi prices with offline support
export const getMandiPrices = async (): Promise<{ 
  prices: CropPrices[]; 
  lastUpdated: string; 
  isOffline: boolean 
}> => {
  try {
    // Try to get cached data
    const cached = await AsyncStorage.getItem(MANDI_PRICES_CACHE_KEY);
    
    // In a real app, you would fetch from API here
    // For now, we use local JSON and cache it
    const data = mandiPricesData;
    
    // Cache the data
    await AsyncStorage.setItem(MANDI_PRICES_CACHE_KEY, JSON.stringify(data));
    
    return {
      prices: data.prices as CropPrices[],
      lastUpdated: data.lastUpdated,
      isOffline: false,
    };
  } catch (error) {
    // If error, try to return cached data
    try {
      const cached = await AsyncStorage.getItem(MANDI_PRICES_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          prices: data.prices as CropPrices[],
          lastUpdated: data.lastUpdated,
          isOffline: true,
        };
      }
    } catch (cacheError) {
      console.log('Cache read error:', cacheError);
    }
    
    // Return local data as fallback
    return {
      prices: mandiPricesData.prices as CropPrices[],
      lastUpdated: mandiPricesData.lastUpdated,
      isOffline: true,
    };
  }
};

// Get prices for a specific crop
export const getCropPrices = async (cropName: string): Promise<CropPrices | null> => {
  const { prices } = await getMandiPrices();
  return prices.find(p => 
    p.crop.toLowerCase() === cropName.toLowerCase() ||
    p.cropHindi === cropName
  ) || null;
};

// Get best mandi recommendation for a crop
export const getBestMandi = (cropPrices: CropPrices): BestMandiRecommendation => {
  const bestMandi = cropPrices.mandis.reduce((best, current) => 
    current.price > best.price ? current : best
  );
  
  return {
    crop: cropPrices.crop,
    cropHindi: cropPrices.cropHindi,
    mandi: bestMandi,
    message: `Best place to sell ${cropPrices.crop} today: ${bestMandi.name} at ₹${bestMandi.price}/quintal`,
    messageHindi: `आज ${cropPrices.cropHindi} बेचने का सबसे अच्छा स्थान: ${bestMandi.nameHindi}, कीमत ₹${bestMandi.price}/क्विंटल`,
  };
};

// Get all best mandi recommendations
export const getAllBestMandis = async (): Promise<BestMandiRecommendation[]> => {
  const { prices } = await getMandiPrices();
  return prices.map(cropPrices => getBestMandi(cropPrices));
};

// Generate price summary for voice
export const getPriceSummaryForVoice = (cropPrices: CropPrices, language: 'en' | 'hi' = 'hi'): string => {
  const best = getBestMandi(cropPrices);
  
  if (language === 'hi') {
    let summary = `आज ${cropPrices.cropHindi} के भाव। `;
    summary += `सबसे अच्छा भाव ${best.mandi.nameHindi} में है, ${best.mandi.price} रुपये प्रति क्विंटल। `;
    
    cropPrices.mandis.forEach(mandi => {
      const trendText = mandi.trend === 'up' ? 'बढ़ा' : mandi.trend === 'down' ? 'गिरा' : 'स्थिर';
      summary += `${mandi.nameHindi}: ${mandi.price} रुपये, भाव ${trendText}। `;
    });
    
    return summary;
  }
  
  let summary = `Today's ${cropPrices.crop} prices. `;
  summary += `Best price at ${best.mandi.name}, ${best.mandi.price} rupees per quintal. `;
  
  cropPrices.mandis.forEach(mandi => {
    const trendText = mandi.trend === 'up' ? 'up' : mandi.trend === 'down' ? 'down' : 'stable';
    summary += `${mandi.name}: ${mandi.price} rupees, trend ${trendText}. `;
  });
  
  return summary;
};

// Get available crops
export const getAvailableCrops = async (): Promise<{ crop: string; cropHindi: string }[]> => {
  const { prices } = await getMandiPrices();
  return prices.map(p => ({ crop: p.crop, cropHindi: p.cropHindi }));
};

// Format last updated time
export const formatLastUpdated = (dateString: string): { en: string; hi: string } => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return {
      en: `Updated ${diffMins} minutes ago`,
      hi: `${diffMins} मिनट पहले अपडेट हुआ`,
    };
  } else if (diffHours < 24) {
    return {
      en: `Updated ${diffHours} hours ago`,
      hi: `${diffHours} घंटे पहले अपडेट हुआ`,
    };
  } else {
    return {
      en: `Updated on ${date.toLocaleDateString('en-IN')}`,
      hi: `${date.toLocaleDateString('hi-IN')} को अपडेट हुआ`,
    };
  }
};

// Get trend icon
export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};

// Get trend color
export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '#4CAF50';
    case 'down': return '#F44336';
    case 'stable': return '#FF9800';
    default: return '#9E9E9E';
  }
};
