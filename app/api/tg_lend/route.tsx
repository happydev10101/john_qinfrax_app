// Backend - Next.js API route (pages/api/send-telegram.js)
import { NextResponse } from 'next/server';
import axios from 'axios';
import { validateTelegramWebAppData } from '@/utils/server-checks';

const botToken = process.env.BOT_TOKEN; // Store the bot token in .env.local
const chatId = process.env.TELEGRAM_MARKETER_ID;     // Store the chat ID in .env.local

export async function POST(req: Request) {
  try {
    const { initData: telegramInitData, amount, tier, walletAddress } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { validatedData, user } = validateTelegramWebAppData(telegramInitData);

    if (!validatedData) {
        return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
    }

    let telegramUserName = user?.username?.toString();    
    let usertext = !telegramUserName?.trim() || telegramUserName?.trim() === 'Unknown User' ? telegramUserName : `@${telegramUserName}`;

    const message = 
      `Lend Request\n\n`+
      `Username: ${usertext}\n\n`+      
      `Lend Amount: ${amount}\n\n` +
      `Tier: ${tier}\n\n` +
      `Wallet Address: ${walletAddress}\n`;
    // Send the message to Telegram API
    console.log('chatId', chatId, message)
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );

    // Check if the response from Telegram is successful
    if (response.status === 200) {
      return NextResponse.json({
        success: true,
        message: 'Request is delivered successfully',
      });
    } else {
      console.error('Error sending message to Telegram');
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to connect wallet' }, { status: 500 });
  }
}
