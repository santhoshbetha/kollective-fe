import React, { useState, useRef, useEffect } from "react";
import { Command, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";

// "Autocompletion" in the React Textarea so when a user types @, a 
// Shadcn Command menu pops up with a list of event participants

export function EventChatInput({ participants }) {
  const [content, setContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionPos = e.target.selectionStart;
    setContent(value);

    // Detect if last typed char after an '@' is what we want
    const lastAtIdx = value.lastIndexOf("@", selectionPos - 1);
    if (lastAtIdx !== -1) {
      const query = value.slice(lastAtIdx + 1, selectionPos);
      if (!query.includes(" ")) { // Only trigger if no space yet
        setSearch(query);
        setShowMentions(true);
        // Logic to calculate cursorPos would go here (e.g., using a mirror div)
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (username: string) => {
    const lastAtIdx = content.lastIndexOf("@", textareaRef.current?.selectionStart);
    const before = content.slice(0, lastAtIdx);
    const after = content.slice(textareaRef.current?.selectionStart || 0);
    
    setContent(`${before}@${username} ${after}`);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleInput}
        placeholder="Type @ to mention someone..."
        className="min-h-[100px]"
      />

      {showMentions && (
        <div className="absolute z-50 w-64 mt-1 bg-popover border rounded-md shadow-md animate-in fade-in zoom-in-95">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search participants..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandGroup heading="Participants">
                {participants
                  .filter(p => p.username.toLowerCase().includes(search.toLowerCase()))
                  .map((p) => (
                    <CommandItem key={p.id} onSelect={() => insertMention(p.username)}>
                      <span>@{p.username}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

/*
2. Implementation Details

    Trigger Logic: The code scans backward from the cursor for the nearest @. If it finds a string without spaces, it assumes you're searching for a user.
    Shadcn Command: By using <CommandInput> inside the popup, you get a "Search within a search" experience that feels like GitHub or Discord.
    Filtering: The participants list is filtered locally for speed, which is ideal for "Standalone" apps where you already have the attendee list in the component state. 

3. Professional Tips

    Cursor Tracking: To make the menu float exactly at the cursor (like a real pro app), use a utility library like textarea-caret to get the exact x/y coordinates of the caret.
    Accessibility: Using Radix UI (which Shadcn is built on) ensures that users can navigate the mentions list using the Up/Down arrows and Enter key.
*/