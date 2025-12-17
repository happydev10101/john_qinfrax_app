import { NextResponse } from 'next/server';
import { buyableCryptoCurrencyList } from '@/utils/consts';
import { getAllCryptoPrices } from '@/utils/crypto-price-service';

export async function GET(req: Request) {
  try {
    const cryptoPrices = await getAllCryptoPrices();

    return NextResponse.json(cryptoPrices, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto prices' }, { status: 500 });
  }
}
