import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryStats } from "@/lib/types/api.types"
import { formatIndianNumber, getIndianUnit } from "@/lib/utils"
import { TrendingUp, Users, PieChart } from "lucide-react"
import { useRef } from "react"
import { toPng } from "dom-to-image"
import {
  WhatsappIcon,
  TwitterIcon,
  LinkedinIcon,
  RedditIcon,
} from "next-share"

interface DailyStatsProps {
  data: SummaryStats
  title: string
}

export function DailyStats({ data, title }: DailyStatsProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const captureImage = async () => {
    if (cardRef.current) {
      // Convert the Next.js Image component's img element to a regular image
      const logoImg = cardRef.current.querySelector('img');
      if (logoImg) {
        // Replace the Next.js optimized image with a regular img for capture
        const regularImg = document.createElement('img');
        regularImg.src = '/finosauras-logo.png'; // Direct path to the image
        regularImg.width = 100;
        regularImg.height = 40;
        regularImg.className = 'object-contain';
        logoImg.parentNode?.replaceChild(regularImg, logoImg);

        // Wait for the new image to load
        await new Promise((resolve) => {
          if (regularImg.complete) {
            resolve(true);
          } else {
            regularImg.onload = () => resolve(true);
          }
        });
      }

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        height: cardRef.current.offsetHeight,
        width: cardRef.current.offsetWidth,
        style: {
          transform: 'scale(1)',
          'transform-origin': 'top left',
          background: 'white',
        },
        cacheBust: true,
      });

      return dataUrl;
    }
    throw new Error('Card reference is null');
  };

  const generateAndShare = async (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'reddit') => {
    try {
      console.log('Starting image generation...');
      const dataUrl = await captureImage();

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'scam-stats.png', { type: blob.type });

      // Create detailed share text
      const shareText = `🚨 Scam Alert: ${title}\n💰 Total Amount: ₹${formatIndianNumber(data.totalAmount)}\n👥 Total Cases: ${formatIndianNumber(data.totalCases)}\n\nStay informed and stay safe!\n\nBy Team Finosauras`;
      const currentUrl = window.location.href;

      // Try Web Share API
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: 'Finosauras Scam Dashboard Stats',
          text: shareText,
          url: currentUrl,
          files: [file]
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch (shareError) {
            console.error('Web Share API error:', shareError);
          }
        }
      }

      // Platform-specific URLs for fallback
      const urls = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚨 ${title}\n💰 ₹${formatIndianNumber(data.totalAmount)}\n👥 ${formatIndianNumber(data.totalCases)} cases`)}&url=${encodeURIComponent(currentUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`
      };

      window.open(urls[platform], '_blank');
    } catch (error) {
      console.error('Error in generateAndShare:', error);
    }
  };

  const formatAmount = (amount: number) => {
    const { value, unit } = getIndianUnit(amount);
    return (
      <div className="flex items-baseline">
        <span className="text-3xl sm:text-4xl font-bold text-red-600 tracking-tight">₹{value}</span>
        <span className="text-sm ml-1 text-red-600/80">{unit}</span>
      </div>
    );
  };

  return (
    <Card ref={cardRef} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-none">
      <CardHeader className="p-4 pb-2 flex justify-between items-center">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">{title}</span>
        </CardTitle>
        <div className="flex-shrink-0">
          <img
            src="/finosauras-logo.png" 
            alt="Finosauras Logo" 
            width={100} 
            height={40} 
            className="object-contain"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div className="group">
            <p className="text-sm text-gray-500 mb-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-red-500" />
              Total Amount
            </p>
            {formatAmount(data.totalAmount)}
          </div>

          <div className="group">
            <p className="text-sm text-gray-500 mb-1 flex items-center">
              <Users className="h-4 w-4 mr-1 text-blue-500" />
              Total Cases
            </p>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {formatIndianNumber(data.totalCases)}
              </span>
              <span className="text-sm ml-2 text-gray-500">reports</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <PieChart className="h-4 w-4 mr-1 text-purple-500" />
              Distribution
            </p>
            <div className="space-y-2">
              {/* First Row: Investment and Trading */}
              <div className="grid grid-cols-2 gap-2">
                {['investment', 'trading'].map((type) => (
                  data.scamsByType[type] > 0 && (
                    <div key={type} 
                      className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                      <span className="capitalize text-xs font-medium text-gray-700">{type}</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-xs text-gray-900">{data.scamsByType[type]}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-2" />
                      </div>
                    </div>
                  )
                ))}
              </div>
              {/* Second Row: Forex and Other */}
              <div className="grid grid-cols-2 gap-2">
                {['forex', 'other'].map((type) => (
                  data.scamsByType[type] > 0 && (
                    <div key={type} 
                      className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                      <span className="capitalize text-xs font-medium text-gray-700">{type}</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-xs text-gray-900">{data.scamsByType[type]}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-2" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-500">Share on</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => generateAndShare('whatsapp')}
                className="cursor-pointer"
                title="Share on WhatsApp"
              >
                <WhatsappIcon size={32} round />
              </button>
              <button
                onClick={() => generateAndShare('twitter')}
                className="cursor-pointer"
                title="Share on Twitter"
              >
                <TwitterIcon size={32} round />
              </button>
              <button
                onClick={() => generateAndShare('linkedin')}
                className="cursor-pointer"
                title="Share on LinkedIn"
              >
                <LinkedinIcon size={32} round />
              </button>
              <button
                onClick={() => generateAndShare('reddit')}
                className="cursor-pointer"
                title="Share on Reddit"
              >
                <RedditIcon size={32} round />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 