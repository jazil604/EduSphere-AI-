"use client";

import { Button } from "@/components/ui/button";

type SuggestionChipsProps = {
  suggestions: string[];
  onPick: (value: string) => void;
};

export function SuggestionChips({ suggestions, onPick }: SuggestionChipsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Button key={suggestion} size="sm" type="button" variant="secondary" onClick={() => onPick(suggestion)}>
          {suggestion}
        </Button>
      ))}
    </div>
  );
}

