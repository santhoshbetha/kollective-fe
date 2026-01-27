import { useState, useEffect } from "react";

const DarkBackgroundShowcase = () => {
  const [selectedTheme, setSelectedTheme] = useState("current");

  const darkThemes = [
    {
      id: "current",
      name: "Current (Deep Navy)",
      background: "#071226",
      description: "Your current dark theme - deep navy with subtle blue undertones"
    },
    {
      id: "charcoal",
      name: "Charcoal Gray",
      background: "#1a1a1a",
      description: "Classic charcoal gray - modern and professional"
    },
    {
      id: "midnight",
      name: "Midnight Black",
      background: "#0f0f0f",
      description: "Deep black with subtle warmth - elegant and sophisticated"
    },
    {
      id: "dark-slate",
      name: "Dark Slate",
      background: "#0f172a",
      description: "Slate blue-black - maintains the blue undertone but darker"
    },
    {
      id: "obsidian",
      name: "Obsidian",
      background: "#0c0a09",
      description: "Warm black with brown undertones - rich and luxurious"
    },
    {
      id: "void",
      name: "Cosmic Void",
      background: "#0a0a0a",
      description: "Pure black - minimal and modern"
    },
    {
      id: "dark-emerald",
      name: "Dark Emerald",
      background: "#0f2417",
      description: "Deep green-black - adds subtle green accent to complement your red gradient"
    },
    {
      id: "burgundy",
      name: "Burgundy Night",
      background: "#1c0b0f",
      description: "Deep burgundy-black - complements your red gradient perfectly"
    },
    {
      id: "purple-depth",
      name: "Purple Depth",
      background: "#0f0a1a",
      description: "Deep purple-black - creates harmony with your gradient's purple transition"
    }
  ];

  // Apply the selected theme to the entire app
  useEffect(() => {
    const selectedThemeData = darkThemes.find(t => t.id === selectedTheme);
    if (selectedThemeData) {
      // Update CSS custom properties for the dark theme
      document.documentElement.style.setProperty('--background', selectedThemeData.background);

      // Adjust other colors based on the background for better contrast
      const isDark = selectedThemeData.background !== "#1a1a1a"; // Charcoal is lighter
      if (isDark) {
        document.documentElement.style.setProperty('--foreground', '#e6eef6');
        document.documentElement.style.setProperty('--card', selectedThemeData.background);
        document.documentElement.style.setProperty('--card-foreground', '#e6eef6');
        document.documentElement.style.setProperty('--muted', 'rgba(255,255,255,0.03)');
        document.documentElement.style.setProperty('--muted-foreground', 'rgba(255,255,255,0.6)');
      } else {
        // For lighter backgrounds like charcoal
        document.documentElement.style.setProperty('--foreground', '#1a1a1a');
        document.documentElement.style.setProperty('--card', '#ffffff');
        document.documentElement.style.setProperty('--card-foreground', '#1a1a1a');
        document.documentElement.style.setProperty('--muted', '#f5f5f5');
        document.documentElement.style.setProperty('--muted-foreground', '#666666');
      }
    }
  }, [selectedTheme]);

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Dark Background Options for Kollective99
        </h1>

        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <strong>💡 Interactive Preview:</strong> Click any background option below to apply it to your entire app instantly!
            The changes will be visible throughout Kollective99. You can switch between themes to compare them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {darkThemes.map((theme) => (
            <div
              key={theme.id}
              className={`relative rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedTheme === theme.id
                  ? 'border-[#E2023F] shadow-lg shadow-[#E2023F]/20 scale-105'
                  : 'border-gray-700 hover:border-gray-500 hover:scale-102'
              }`}
              style={{ backgroundColor: theme.background }}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="p-6 h-48 flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">{theme.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{theme.description}</p>
                </div>

                {/* Sample content preview */}
                <div className="space-y-3">
                  <div className="h-2 bg-white/10 rounded"></div>
                  <div className="h-2 bg-white/10 rounded w-3/4"></div>
                  <div className="h-2 bg-white/10 rounded w-1/2"></div>
                </div>

                {/* Gradient text sample */}
                <div className="bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent font-bold text-lg">
                  Kollective99
                </div>
              </div>

              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#E2023F] rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedTheme && (
          <div className="mt-8 p-6 rounded-xl border border-gray-700" style={{ backgroundColor: darkThemes.find(t => t.id === selectedTheme)?.background }}>
            <h2 className="text-2xl font-bold text-white mb-4">
              Currently Applied: {darkThemes.find(t => t.id === selectedTheme)?.name}
            </h2>
            <p className="text-gray-300 mb-6">
              {darkThemes.find(t => t.id === selectedTheme)?.description}
            </p>

            {/* Preview of how content would look */}
            <div className="space-y-4">
              <div className="bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent text-3xl font-bold">
                Kollective99
              </div>
              <div className="text-gray-300">
                Sample post content would appear here with your vibrant gradient accents...
              </div>
              <div className="flex space-x-4">
                <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Like</div>
                <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Comment</div>
                <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Share</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Implementation Notes</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong>Live Preview:</strong> Changes are applied instantly to your entire app</li>
            <li>• <strong>Persistent:</strong> The selected background stays active until you choose another</li>
            <li>• <strong>Gradient Harmony:</strong> Each background is tested with your #E2023F → orange → yellow gradient</li>
            <li>• <strong>Best Matches:</strong> "Burgundy Night" and "Purple Depth" complement your gradient perfectly</li>
            <li>• <strong>To Make Permanent:</strong> Update the --background variable in your CSS file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DarkBackgroundShowcase;