// Define types for the FB SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const APP_ID = '17841471521083259'; // Updated with user provided App ID
const API_VERSION = 'v18.0';

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  currency: string;
}

export interface AdDataPacket {
  csv: string;
  images: Record<string, string>; // Map Ad Name -> Image URL
}

export const initFacebookSdk = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : API_VERSION
      });
      resolve();
    };
  });
};

export const loginToFacebook = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // HTTPS Check
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
       // Allow localhost to proceed (SDK might warn but works), reject otherwise
       return reject("HTTPS_REQUIRED");
    }

    if (!window.FB) return reject("FB SDK not loaded");

    window.FB.login((response: any) => {
      if (response.authResponse) {
        resolve(response.authResponse.accessToken);
      } else {
        reject("User cancelled login or did not fully authorize.");
      }
    }, { scope: 'ads_read,read_insights' }); // Permissions required
  });
};

export const getAdAccounts = async (accessToken: string): Promise<MetaAdAccount[]> => {
  const url = `https://graph.facebook.com/${API_VERSION}/me/adaccounts?fields=name,account_id,currency&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.data;
};

export const getAccountInsights = async (accountId: string, accessToken: string): Promise<AdDataPacket> => {
  // Fetch Ads directly to get Creative + Insights in one go
  // We fetch at the Ad level to get the Creative Thumbnail
  const fields = 'name,creative{thumbnail_url,image_url},insights.date_preset(maximum){impressions,clicks,spend,cpc,ctr,actions,action_values}';
  const url = `https://graph.facebook.com/${API_VERSION}/${accountId}/ads?fields=${fields}&limit=50&access_token=${accessToken}`;
  
  const response = await fetch(url);
  const json = await response.json();
  
  if (json.error) throw new Error(json.error.message);

  let csvContent = `ad_name,platform,impressions,clicks,ctr,spend,conversions,roas,creative_type,audience\n`;
  const imageMap: Record<string, string> = {};

  if (json.data && Array.isArray(json.data)) {
    json.data.forEach((ad: any) => {
      const insights = ad.insights?.data?.[0];
      if (!insights) return; // Skip ads with no data

      // Capture Image
      const imgUrl = ad.creative?.thumbnail_url || ad.creative?.image_url;
      if (imgUrl) {
        imageMap[ad.name] = imgUrl;
      }

      // Extract Purchase value for ROAS calculation
      let purchaseValue = 0;
      let conversions = 0;
      
      if (insights.action_values) {
        const purchaseAction = insights.action_values.find((a: any) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
        if (purchaseAction) purchaseValue = parseFloat(purchaseAction.value);
      }
      
      if (insights.actions) {
        const purchaseCount = insights.actions.find((a: any) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
        if (purchaseCount) conversions = parseInt(purchaseCount.value);
      }

      const spend = parseFloat(insights.spend) || 0;
      const roas = spend > 0 ? (purchaseValue / spend).toFixed(2) : 0;
      const ctr = insights.ctr ? (parseFloat(insights.ctr) * 100).toFixed(2) : 0;

      // Infer creative type from name or missing data
      const creativeType = ad.name.toLowerCase().includes('reel') || ad.name.toLowerCase().includes('video') ? 'video' : 'image'; 
      const audience = 'meta_custom_audience';

      // Sanitize name for CSV
      const safeName = ad.name.replace(/,/g, '');
      
      csvContent += `${safeName},Meta,${insights.impressions},${insights.clicks},${ctr},${spend},${conversions},${roas},${creativeType},${audience}\n`;
    });
  }

  return {
    csv: csvContent,
    images: imageMap
  };
};

// --- SIMULATION MODE HELPERS (For when HTTPS is not available) ---

export const mockLogin = (): Promise<string> => {
  return new Promise(resolve => setTimeout(() => resolve("MOCK_SANDBOX_TOKEN_XYZ"), 1500));
}

export const mockGetAdAccounts = async (): Promise<MetaAdAccount[]> => {
  return [
    { id: 'act_sandbox_001', name: 'PreThink Sandbox Account (Alpha)', account_id: '8829102', currency: 'USD' },
    { id: 'act_sandbox_002', name: 'Stark Industries Global', account_id: '9910293', currency: 'USD' }
  ];
}

export const mockGetInsights = async (): Promise<AdDataPacket> => {
  // Returns a randomized CSV stream for simulation AND mock images
  const csv = `ad_name,platform,impressions,clicks,ctr,spend,conversions,roas,creative_type,audience
Reel_Summer_Vibe,Instagram,50000,2500,5.0,10000,150,4.5,video,broad
Static_Retargeting_01,Facebook,30000,900,3.0,5000,80,3.2,image,retargeting
Carousel_Collection_Fall,Facebook,25000,500,2.0,6000,40,2.0,carousel,women_25_45
Story_Flash_Sale,Instagram,40000,1200,3.0,4500,90,3.0,video,women_18_24
Search_Brand_Key,Google,15000,2000,13.3,3000,300,6.0,text,intent_high
Lookalike_Winter_Promo,Facebook,22000,800,3.6,5500,50,2.2,image,lookalike_1pct
UGC_TikTok_Style,Instagram,45000,3000,6.6,8000,120,3.8,video,gen_z
Dynamic_Catalog_Sales,Facebook,60000,1500,2.5,12000,200,4.2,carousel,retargeting_atc
Lead_Gen_Form_B,Facebook,12000,400,3.3,4000,60,1.5,image,small_business
Reel_Trends_Q3,Instagram,35000,1400,4.0,7000,75,3.2,video,women_18_34`; 

  const images: Record<string, string> = {
    "Reel_Summer_Vibe": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop",
    "Static_Retargeting_01": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop",
    "Carousel_Collection_Fall": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop",
    "Story_Flash_Sale": "https://images.unsplash.com/photo-1529139574466-a302d2774524?w=300&h=300&fit=crop",
    "UGC_TikTok_Style": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    "Dynamic_Catalog_Sales": "https://images.unsplash.com/photo-1551488852-0801712a5c5d?w=300&h=300&fit=crop",
  };

  return { csv, images };
};