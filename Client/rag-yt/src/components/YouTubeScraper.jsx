import React, { useState } from 'react';
import { Search, Download, AlertCircle, CheckCircle } from 'lucide-react';

const YouTubeScraper = () => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Convert ISO 8601 duration to readable format
  const parseDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    let result = '';
    if (hours > 0) result += `${hours}:`;
    if (hours > 0 || minutes > 0) result += `${minutes.toString().padStart(2, '0')}:`;
    result += seconds.toString().padStart(2, '0');
    
    return result;
  };

  // Fetch video data from YouTube API
  const fetchVideoData = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your YouTube API key');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL. Please check the URL format.');
      return;
    }

    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      // Fetch basic video data
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${apiKey}`
      );

      if (!videoResponse.ok) {
        throw new Error(`API Error: ${videoResponse.status} ${videoResponse.statusText}`);
      }

      const videoJson = await videoResponse.json();

      if (!videoJson.items || videoJson.items.length === 0) {
        throw new Error('Video not found or is private/unavailable');
      }

      const video = videoJson.items[0];
      
      // Try to get captions/transcript
      let transcript = null;
      try {
        const captionsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
        );
        
        if (captionsResponse.ok) {
          const captionsJson = await captionsResponse.json();
          if (captionsJson.items && captionsJson.items.length > 0) {
            transcript = 'Captions available (download separately)';
          } else {
            transcript = 'No captions available';
          }
        } else {
          transcript = 'Captions check failed';
        }
      } catch (captionError) {
        transcript = 'Captions unavailable';
      }

      // Format the data
      const formattedData = {
        title: video.snippet.title,
        youtuber: video.snippet.channelTitle,
        like_count: parseInt(video.statistics.likeCount || 0),
        view_count: parseInt(video.statistics.viewCount || 0),
        comment_count: parseInt(video.statistics.commentCount || 0),
        duration: parseDuration(video.contentDetails.duration),
        duration_raw: video.contentDetails.duration,
        transcript: transcript,
        published_at: video.snippet.publishedAt,
        description: video.snippet.description,
        video_id: videoId,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url
      };

      setVideoData(formattedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch video data');
    } finally {
      setLoading(false);
    }
  };

  // Copy JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(videoData, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Video Data Scraper</h1>
        <p className="text-gray-600">Extract video metadata using YouTube Data API v3</p>
      </div>

      {/* API Key Input */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">
          <AlertCircle className="inline w-4 h-4 mr-1" />
          API Key Required
        </h3>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your YouTube Data API v3 key"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-yellow-700 mt-1">
          Get your free API key from Google Cloud Console
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video URL here (e.g., https://www.youtube.com/watch?v=...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchVideoData}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scrape Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Results */}
      {videoData && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Success!</span>
            </div>
            <p className="text-green-700 mt-1">Video data extracted successfully</p>
          </div>

          {/* Video Preview */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex gap-4">
              {videoData.thumbnail && (
                <img
                  src={videoData.thumbnail}
                  alt="Video thumbnail"
                  className="w-32 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{videoData.title}</h3>
                <p className="text-gray-600 mb-1">Channel: {videoData.youtuber}</p>
                <p className="text-gray-600 mb-1">Duration: {videoData.duration}</p>
                <p className="text-gray-600">Views: {videoData.view_count.toLocaleString()} • Likes: {videoData.like_count.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* JSON Output */}
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">JSON Output:</h3>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Copy JSON
              </button>
            </div>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(videoData, null, 2)}
            </pre>
          </div>

          {/* Sample API Calls */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-3">API Calls Made:</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border">
                <strong>Video Data:</strong><br />
                <code className="text-blue-600">
                  GET https://www.googleapis.com/youtube/v3/videos?id={videoData.video_id}&part=snippet,statistics,contentDetails&key=YOUR_API_KEY
                </code>
              </div>
              <div className="bg-white p-3 rounded border">
                <strong>Captions List:</strong><br />
                <code className="text-blue-600">
                  GET https://www.googleapis.com/youtube/v3/captions?videoId={videoData.video_id}&part=snippet&key=YOUR_API_KEY
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-3">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Get your free YouTube Data API v3 key from Google Cloud Console</li>
          <li>Enter the API key in the field above</li>
          <li>Paste any YouTube video URL (watch, youtu.be, embed formats supported)</li>
          <li>Click "Scrape Data" to extract the video information</li>
          <li>Copy the JSON output to use in your applications</li>
        </ol>
      </div>
    </div>
  );
};

export default YouTubeScraper;