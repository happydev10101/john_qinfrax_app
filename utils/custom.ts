import { Horizon } from 'stellar-sdk';
import { AccountAllBalnaces } from './types';
import { MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevels } from './consts';

const server = new Horizon.Server('https://horizon.stellar.org'); // Use testnet: 'https://horizon-testnet.stellar.org'

const test_main_asset_balance = process.env.NEXT_PUBLIC_TEST_MAIN_ASSET_BALANCE ? 
  parseInt(process.env.NEXT_PUBLIC_TEST_MAIN_ASSET_BALANCE) : 
  1500000000;

export const parse_fetch_response = async (response: any) => {
  if (response.ok) {
    return response.json();
  }
  let errorText = 'Something went wrong';
  try {
    errorText = await response.text();
  } catch(e) {}
  throw new Error(`Error code: ${response.status} : ${errorText}`);
}

export const jsonSafeParse = (str: string, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    
return defaultValue;
  }
}

export const dd = function (number: number): string {
  return number > 9 ? ('' + number) : ('0' + number)
}

// This function is deprecated.
// Instead, use dayjs
// dayjs(new Date()).format("YYYY-MM-DD")
// npm i dayjs
export const date2str = function (this_date: Date, style: number = 0 ): string {
  if ( !this_date ) return "";

  // As default, mysql date format
  let datetime: string = this_date.getFullYear() + "-"
              + dd(this_date.getMonth()+1)  + "-" 
              + dd(this_date.getDate()) + " "  
              + dd(this_date.getHours()) + ":"  
              + dd(this_date.getMinutes()) + ":" 
              + dd(this_date.getSeconds());
  if ( style === 1 ) {
    datetime = this_date.getFullYear() + "/"
              + dd(this_date.getMonth()+1)  + "/" 
              + dd(this_date.getDate()) + " "  
              + dd(this_date.getHours()) + ":"  
              + dd(this_date.getMinutes()) + ":" 
              + dd(this_date.getSeconds());
  }
  
return datetime;
}

export const getCurrentUrl = (): string => {
  let currentUrl = window.location.href;

  // Check if the last character is '/' and remove it
  if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, -1);
  }
  
return currentUrl;
}

export const id2item = (id: string | number | null, list: Array<any>): any => {
  if(id === null) return null;
  if(!list) return null;
  for (let i = 0; i < list.length; i++) { 
    if (list[i]['id'] == id)
    {
      return list[i];
    }
  }
  
  return null;
}

export const push_non_duplicate = (value: any, list: Array<any>): void => {
  if ( !value ) { 
    return; 
  }
  for ( let i = 0; i < list.length; i++) {
    if (list[i] === value) { return; }
  }
  list.push(value);
}

export const push_non_duplicate_id = (value: any, list: Array<any>): void => {
  if ( !value?.id ) { 
    return; 
  }
  for ( let i = 0; i < list.length; i++) {
    if (list[i]?.id === value.id) { return; }
  }
  list.push(value);
}

export const capitalizeFirstLetterOfEachWord = (string: string): string => {
  if (!string) return '';
  
return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const objectToFormData = (obj: any): FormData => {
  const formData = new FormData();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      formData.append(key, obj[key]);
    }
  }
  
return formData;
}

// ================================================================================================
// ================================================================================================
// BEGIN web3 settings functions
// ================================================================================================
// ================================================================================================
/**
 * Fetches the balance of a specific asset in a Stellar account.
 * 
 * @param {string} publicKey - The public key (Stellar address) of the account whose balance is being queried.
 * @param {string} assetCode - The asset code (e.g., "XLM" for native Lumens or custom asset code like "USD").
 * @param {string} issuerAddress - The address of the asset's issuer (for custom assets).
 * 
 * @returns {Promise<string | null>} - A promise that resolves to the balance of the specified asset in the account.
 *                                      Returns "0" if no balance is found, or null in case of an error.
 * 
 * @throws {Error} Will throw an error if there's a problem fetching the account balance from the Stellar network.
 */
export const getTokenBalance = async (publicKey: string, assetCode: string, issuerAddress: string): Promise<string | null> => {
  try {
      const account = await server.loadAccount(publicKey);
      const balance = account.balances.find(
          (b: any) => b.asset_code === assetCode && b.asset_issuer === issuerAddress
      );

      if (balance) {
          console.log(`Balance of ${assetCode}: ${balance.balance}`);

          if (process.env.NEXT_PUBLIC_IS_DEV === 'true') {
            return test_main_asset_balance.toString();
          }

          return balance.balance;

      } else {
          console.log(`No balance found for ${assetCode}`);
          return "0";
      }
  } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
  }
}

/**
 * Fetches all balances for a given Stellar account, including native XLM and custom assets.
 *
 * @param {string} publicKey - The Stellar public key (account address) to fetch balances for.
 * @returns {Promise<AccountAllBalances | null>} - An object containing native and custom token balances, or null if an error occurs.
 */
export const getAccountBalances = async (publicKey: string): Promise<AccountAllBalnaces | null> => {
  try {
    const account = await server.loadAccount(publicKey);
    const balances = account.balances;

    const result: AccountAllBalnaces = {
      nativeBalance: '0',
      tokenBalances: []
    };

    // Get native XLM balance
    const nativeBalance = balances.find((b: any) => b.asset_type === 'native');
    if (nativeBalance) {
      result.nativeBalance = nativeBalance.balance;
    }

    // Get custom token balances (other assets)
    const tokenBalances = balances.filter((b: any) => b.asset_type !== 'native');
    result.tokenBalances = tokenBalances.map((b: any) => ({
      assetCode: b.asset_code,
      assetIssuer: b.asset_issuer,
      balance: b.balance
    }));

    console.log(`Native Balance: ${result.nativeBalance}`);
    result.tokenBalances.forEach((token: any) => {
      console.log(`Token: ${token.assetCode}, Issuer: ${token.assetIssuer}, Balance: ${token.balance}`);
    });

    if (process.env.NEXT_PUBLIC_IS_DEV === 'true') {
      // Upsert main asset with test balance in development
      const existingMainAssetIndex = result.tokenBalances.findIndex(
        token => token.assetCode === MAIN_ASSET_CODE && token.assetIssuer === MAIN_ISSUER_ADDRESS
      );
      
      if (existingMainAssetIndex !== -1) {
        // Update existing main asset balance
        result.tokenBalances[existingMainAssetIndex].balance = test_main_asset_balance.toString();
      } else {
        // Add new main asset balance
        result.tokenBalances.push({
          assetCode: MAIN_ASSET_CODE,
          assetIssuer: MAIN_ISSUER_ADDRESS,
          balance: test_main_asset_balance.toString()
        });
      }
    }

    return result;

  } catch (error) {
    console.error("Error fetching account balances:", error);
    return null;
  }
};

/**
 * Fetches the total amount of XLM received by a given Stellar address in the last `daysAgo` days.
 *
 * @param {string} address - The Stellar wallet address to track.
 * @param {number} [daysAgo=30] - The number of past days to track transactions from (default is 30 days ago).
 * @returns {Promise<number>} - The total amount of XLM received within the specified period.
 */
export const getTotalXLMReceived = async function (address: string, daysAgo: number = 30): Promise<number> {
  try {
    console.log(`Fetching total XLM received for ${address} in the last ${daysAgo} days...`);

    let totalReceived = 0;
    const startFrom = new Date();
    startFrom.setDate(startFrom.getDate() - daysAgo); // Calculate the start date

    let operations = await server.operations()
      .forAccount(address)
      .limit(200) // Fetch up to 200 operations per request
      .order('desc')
      .call();

    while (operations?.records?.length > 0) {
      for (const operation of operations.records as Horizon.ServerApi.OperationRecord[]) {
        const operationDate = new Date(operation.created_at);

        // Stop fetching if operation is older than the start date
        if (operationDate < startFrom) {
          console.log(`Reached transactions older than ${daysAgo} days. Stopping.`);
          console.log(`Total XLM received by ${address} in the last ${daysAgo} days: ${totalReceived} XLM`);
          return totalReceived;
        }

        // Check if the operation is an XLM payment to the given address
        if (
          operation.type === 'payment' &&
          operation.asset_type === 'native' && // Ensure it's XLM
          operation.to === address // Ensure it's received by the given address
        ) {
          totalReceived += parseFloat(operation.amount);
        }
      }

      operations = await operations.next(); // Fetch the next batch of operations
    }

    console.log(`Total XLM received by ${address} in the last ${daysAgo} days: ${totalReceived} XLM`);
    return totalReceived;
  } catch (error) {
    console.error("Error fetching recent XLM transactions", error);
    return 0;
  }
};

/**
 * Fetches the current USD price of a given cryptocurrency using the CoinGecko API.
 *
 * @returns {Promise<Record<string, number>>} The current majorcoin prices in USD. Returns { xrp, usdc } as JSON object.
 *
 */
export const getCryptoPrices = async function (): Promise<Record<string, number>> {
  const url = `api/cryptoprice`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

/**
 * Get the minimum holding required to access discountable tiers
 * @returns {number} The minimum QINFRAX holding needed for the first tier with discount benefits
 */
export const getMinDiscountableHoldAmount = (): number => {
  // Find the first tier with a discount percentage > 0
  const firstDiscountableTier = TierLevels.find(tier => tier.discountPercent > 0);
  
  if (!firstDiscountableTier) {
    // If no discountable tier is found, return 0
    return 0;
  }
  
  return firstDiscountableTier.start;
}

/**
 * Fetches the current USD price of a stock prices.
 *
 * @returns {Promise<any>} The current majorcoin prices in USD. Returns {"AAPL":210.14,"TSLA":285.88,"GOOG":162.42,"MSFT":391.16,"AMZN":187.7,"NVDA":108.73,"META":549.74,"V":337.51,"JPM":243.22,"JNJ":155.35,"WMT":95.22,"UNH":420,"HD":356.92,"DIS":90.16,"PYPL":64.93,"NFLX":1110.38,"PFE":23.05,"KO":71.79,"PEP":133.76,"MRK":83.19,"INTC":20.51,"CSCO":56.84,"XOM":108.63,"CVX":140.1,"ABT":129.53}.
 *
 */
export const getStockPrices = async function (): Promise<any> {
  const url = `api/stockprice`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}