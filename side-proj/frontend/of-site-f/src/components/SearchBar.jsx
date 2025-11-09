// src/components/SearchBar.jsx
import { useState, useEffect } from "react";

export default function SearchBar({
  initial = "",
  initialDeadlineOnly = false,
  onSubmit,                 // (q, deadlineOnly) => void
  placeholder = "주소/물건명 검색",
}) {
  const [qInput, setQInput] = useState(initial);
  const [deadlineOnly, setDeadlineOnly] = useState(initialDeadlineOnly);

  useEffect(() => setQInput(initial), [initial]);
  useEffect(() => setDeadlineOnly(initialDeadlineOnly), [initialDeadlineOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(qInput.trim(), deadlineOnly);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={qInput}
        onChange={(e)=>setQInput(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-button border border-line bg-white w-56"
      />
      <label className="text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={deadlineOnly}
          onChange={(e)=>setDeadlineOnly(e.target.checked)}
        />
        마감 임박
      </label>
      <button type="submit" className="btn btn-primary">검색</button>
    </form>
  );
}
