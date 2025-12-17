// utils/crypto-price-service.ts

import { buyableCryptoCurrencyList } from "./consts";

type PriceCache = {
  [ids: string]: {
    prices: Record<string, number>;
    timestamp: number;
  };
};

const priceCache: PriceCache = {};

/**
 * Fetches cryptocurrency prices from CoinGecko API with caching
 * @param ids Array of CoinGecko cryptocurrency IDs
 * @returns Promise<Record<string, number>> Object with crypto IDs as keys and prices as values
 */
const fetchCryptoPrices = async (ids: string[]): Promise<Record<string, number>> => {
  const now = Date.now();
  const idsString = ids.sort().join(',');
  const cached = priceCache[idsString];

  // Return cached value if under 120 seconds old
  const timeLimit = 120 * 1000;
  if (cached && now - cached.timestamp < timeLimit) {
    return cached.prices;
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract prices from the response
    const prices: Record<string, number> = {};
    ids.forEach(id => {
      prices[id] = data[id]?.usd ?? 0;
    });

    priceCache[idsString] = { prices, timestamp: now };
    return prices;
  } catch (error) {
    console.error(`Error fetching crypto prices for ${idsString}:`, error);
    return cached?.prices ?? {};
  }
};

/**
 * Fetches all cryptocurrency prices including major assets and tradable cryptocurrencies
 * @returns {Promise<Record<string, number>>} Object containing cryptocurrency prices in USD
 * @example const prices = await getAllCryptoPrices(); console.log(prices.bitcoin, prices.xlm);
 */
export const getAllCryptoPrices = async (): Promise<Record<string, number>> => {
  // Major codes
  const majorCodes = ['stellar', 'ripple', 'usd-coin'];    
  // Get all cgkcode values from our tradable list
  const allCgkCodes = buyableCryptoCurrencyList.map(crypto => crypto.cgkcode);
  
  // Combine and remove duplicates
  const cgkCodesToFetch = [...new Set([...majorCodes, ...allCgkCodes])];

  // Fetch all prices in a single API call
  const cryptoPrices = await fetchCryptoPrices(cgkCodesToFetch);
  const modifiedResult = {
    ...cryptoPrices,
    // include custom key names (which is not equal to coingecko key)
    xlm: cryptoPrices.stellar,
    xrp: cryptoPrices.ripple,
    usdc: cryptoPrices['usd-coin'],
  };
  return modifiedResult;
};

/**
 * Clears the price cache
 */
export const clearPriceCache = (): void => {
  Object.keys(priceCache).forEach(key => delete priceCache[key]);
};

/**
 * Gets cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    cacheSize: Object.keys(priceCache).length,
    cacheKeys: Object.keys(priceCache),
    totalEntries: Object.values(priceCache).reduce((sum, entry) => sum + Object.keys(entry.prices).length, 0)
  };
};
