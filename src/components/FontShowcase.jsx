import { useState, useEffect } from "react";

const FontShowcase = () => {
  const [selectedFont, setSelectedFont] = useState("geist");

  const fontOptions = [
    {
      id: "geist",
      name: "Geist (Current)",
      fontFamily: "Geist, sans-serif",
      description: "Your current font - clean, modern, and highly readable",
      googleFonts: "family=Geist:wght@100..900"
    },
    {
      id: "inter",
      name: "Inter",
      fontFamily: "Inter, sans-serif",
      description: "Extremely popular for modern apps - crisp, clean, and versatile",
      googleFonts: "family=Inter:wght@100..900"
    },
    {
      id: "roboto",
      name: "Roboto",
      fontFamily: "Roboto, sans-serif",
      description: "Google's signature font - friendly, readable, and professional",
      googleFonts: "family=Roboto:wght@100..900"
    },
    {
      id: "open-sans",
      name: "Open Sans",
      fontFamily: "Open Sans, sans-serif",
      description: "Humanist design - approachable and highly legible",
      googleFonts: "family=Open+Sans:wght@300..800"
    },
    {
      id: "lato",
      name: "Lato",
      fontFamily: "Lato, sans-serif",
      description: "Warm and friendly - great for social platforms",
      googleFonts: "family=Lato:wght@100..900"
    },
    {
      id: "poppins",
      name: "Poppins",
      fontFamily: "Poppins, sans-serif",
      description: "Geometric and modern - trendy for social media apps",
      googleFonts: "family=Poppins:wght@100..900"
    },
    {
      id: "nunito",
      name: "Nunito",
      fontFamily: "Nunito, sans-serif",
      description: "Rounded and friendly - creates a welcoming feel",
      googleFonts: "family=Nunito:wght@200..1000"
    },
    {
      id: "montserrat",
      name: "Montserrat",
      fontFamily: "Montserrat, sans-serif",
      description: "Strong character - modern and distinctive",
      googleFonts: "family=Montserrat:wght@100..900"
    },
    {
      id: "work-sans",
      name: "Work Sans",
      fontFamily: "Work Sans, sans-serif",
      description: "Contemporary and clean - excellent for UI text",
      googleFonts: "family=Work+Sans:wght@100..900"
    },
    {
      id: "source-sans",
      name: "Source Sans Pro",
      fontFamily: "Source Sans Pro, sans-serif",
      description: "Adobe's professional font - reliable and readable",
      googleFonts: "family=Source+Sans+Pro:wght@200..900"
    }
  ];

  // Load Google Fonts dynamically
  useEffect(() => {
    const selectedFontData = fontOptions.find(f => f.id === selectedFont);
    if (selectedFontData && selectedFontData.googleFonts && selectedFont !== 'geist') {
      // Remove existing font link if it exists
      const existingLink = document.querySelector('link[data-font-link]');
      if (existingLink) {
        existingLink.remove();
      }

      // Add new font link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${selectedFontData.googleFonts}&display=swap`;
      link.setAttribute('data-font-link', 'true');
      document.head.appendChild(link);

      // Wait for font to load before applying
      link.onload = () => {
        document.body.style.fontFamily = selectedFontData.fontFamily;
        document.documentElement.style.setProperty('--font-sans', selectedFontData.fontFamily);
      };
    } else if (selectedFont === 'geist') {
      // Reset to Geist (already loaded)
      document.body.style.fontFamily = selectedFontData.fontFamily;
      document.documentElement.style.setProperty('--font-sans', selectedFontData.fontFamily);
    }
  }, [selectedFont]);

  const sampleTexts = {
    heading: "Kollective99",
    subheading: "FOR THE PEOPLE, OF THE PEOPLE",
    body: "If 'X','Threads' and 'Truth' feel like some one's private property and decentralized apps make us disconnected, Join Kollective to share your 'Voice'.",
    feature: "Create a profile, share your voice, and connect with communities worldwide.",
    button: "Get Started"
  };

  const handleFontSelect = (fontId) => {
    setSelectedFont(fontId);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Font Options for Kollective99
        </h1>

        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <p className="text-blue-200 text-sm">
            <strong>🎨 Live Preview:</strong> Click any font option below to apply it to your entire app instantly!
            Each font will be loaded from Google Fonts and applied to all text elements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {fontOptions.map((font) => (
            <div
              key={font.id}
              className={`relative rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden p-4 ${
                selectedFont === font.id
                  ? 'border-[#E2023F] shadow-lg shadow-[#E2023F]/20 bg-[#E2023F]/5'
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
              }`}
              onClick={() => handleFontSelect(font.id)}
              style={{ fontFamily: font.fontFamily }}
            >
              <div className="space-y-3">
                <h3 className="text-white text-lg font-bold">{font.name}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{font.description}</p>

                {/* Sample text preview */}
                <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">Kollective99</div>
                  <div className="text-sm text-gray-300">Sample text preview...</div>
                </div>
              </div>

              {selectedFont === font.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#E2023F] rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Preview Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Live Preview</h2>
            <p className="text-gray-400">Currently using: <span className="text-[#E2023F] font-semibold">{fontOptions.find(f => f.id === selectedFont)?.name}</span></p>
          </div>

          {/* Hero Section Preview */}
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-700">
            <div className="text-center space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent" style={{ fontFamily: "Protest Riot, sans-serif", lineHeight: "0.9" }}>
                {sampleTexts.heading}
              </h1>
              <div className="inline-block rounded-full bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 px-6 py-2 text-sm font-bold text-white shadow-lg" style={{ fontFamily: "Protest Riot, sans-serif" }}>
                {sampleTexts.subheading}
              </div>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                {sampleTexts.body}
              </p>
            </div>
          </div>

          {/* Content Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-white">Feature Cards</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-2">Create a profile</h4>
                  <p className="text-gray-300 text-sm">{sampleTexts.feature}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-2">Share your voice</h4>
                  <p className="text-gray-300 text-sm">Post content that matters to you and connect with communities.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-white">UI Elements</h3>
              <div className="space-y-4">
                <button className="px-6 py-3 bg-[#E2023F] text-white font-semibold rounded-lg hover:bg-[#E2023F]/80 transition-colors">
                  {sampleTexts.button}
                </button>
                <div className="space-y-2">
                  <p className="text-gray-300">Regular body text for readability testing.</p>
                  <p className="text-sm text-gray-400">Smaller text for secondary information.</p>
                  <p className="text-xs text-gray-500">Extra small text for metadata.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Font Recommendations for Social Media Apps</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-[#E2023F] mb-3">Top Picks for Kollective99:</h4>
              <ul className="text-gray-300 space-y-2">
                <li><strong>Inter:</strong> Modern, clean, excellent readability</li>
                <li><strong>Geist (Current):</strong> Already working well for you</li>
                <li><strong>Roboto:</strong> Friendly and professional</li>
                <li><strong>Open Sans:</strong> Approachable and legible</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#E2023F] mb-3">Implementation Notes:</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong>Live Changes:</strong> Applied instantly to your entire app</li>
                <li>• <strong>Google Fonts:</strong> Automatically loaded for each selection</li>
                <li>• <strong>Performance:</strong> Fonts are optimized for web use</li>
                <li>• <strong>To Make Permanent:</strong> Update --font-sans in your CSS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontShowcase;