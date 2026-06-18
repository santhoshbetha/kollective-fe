import { X, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

/*
#"Word Muting"
3. React Frontend: The Keyword Manager
Use Shadcn/UI Badge and Input to let users manage their "Mute List."
*/
export function WordMuteManager({ initialWords }) {
  const [words, setWords] = useState(initialWords);
  const [input, setInput] = useState("");

  const addWord = async () => {
    if (!input) return;
    await fetch("/api/settings/mute-word", { 
      method: "POST", 
      body: JSON.stringify({ word: input }) 
    });
    setWords([...words, input]);
    setInput("");
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-slate-50">
      <h3 className="font-bold flex items-center gap-2">
        <Hash className="h-4 w-4" /> Muted Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {words.map(word => (
          <Badge key={word} variant="secondary" className="gap-1">
            {word} <X className="h-3 w-3 cursor-pointer" onClick={() => removeWord(word)} />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. spoilers" />
        <Button onClick={addWord}>Mute</Button>
      </div>
    </div>
  );
}

/*
4. Why this is the "Golden Path" for Standalone:

    Precision: By using ILIKE %word%, you catch the keyword regardless of whether it's at the start, middle, or end of a sentence.
    User Sanity: This is the #1 feature for users to avoid spoilers, politics, or sensitive topics without having to unfollow their friends.
    Scalability: While Enum.reduce builds a longer SQL query, PostgreSQL handles multiple NOT ILIKE statements very efficiently on modern hardware. For extremely long lists, you could switch to PostgreSQL Full-Text Search logic.
*/

/*
Summary Checklist:

    Table: Stores individual strings linked to a user_id.
    Query: Dynamically builds WHERE NOT ILIKE clauses.
    UX: Users see "Vanish" effects immediately after adding a word.
*/
