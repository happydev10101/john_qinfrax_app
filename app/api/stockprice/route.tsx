import { NextResponse } from 'next/server';
const chatId = process.env.TELEGRAM_MARKETER_ID;     // Store the chat ID in .env.local
const finnhub_api_key = process.env.FINNHUB_API_KEY;

type PriceCache = {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
};

const priceCache: PriceCache = {};

// Your stock symbols
const stockSymbols: string[] = [
  'AAPL', 'TSLA', 'GOOG', 'MSFT', 'AMZN', 'NVDA', 'META', 'V', 'JPM', 'JNJ',
  'WMT', 'UNH', 'HD', 'DIS', 'PYPL', 'NFLX', 'PFE', 'KO', 'PEP', 'MRK',
  'INTC', 'CSCO', 'XOM', 'CVX', 'ABT'
];

// Fetch stock prices from Yahoo Finance
const fetchStockPrice = async (symbol: string): Promise<number> => {
  const now = Date.now();
  const cached = priceCache[symbol];

  const timeLimit = 120 * 1000; // 2 minutes cache
  if (cached && now - cached.timestamp < timeLimit) {
    return cached?.price ?? 0;
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhub_api_key}`);
    const data = await response.json();
    const price = data?.c ?? 0;

    priceCache[symbol] = { price, timestamp: now };
    return price;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return cached?.price ?? 0;
  }
};

export async function GET(req: Request) {
  try {
    const stockPrices: Record<string, number> = {};

    await Promise.all(
      stockSymbols.map(async (symbol) => {
        const price = await fetchStockPrice(symbol);
        stockPrices[symbol] = price;
      })
    );

    return NextResponse.json(stockPrices, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return NextResponse.json({ error: 'Failed to fetch stock prices' }, { status: 500 });
  }
}
