import React, { useState } from 'react'

const CHECKS = [
  "Page Number Sequence & Folio",
  "Running Head Style & Position",
  "Slug Line Page Range & File Name",
  "Word-to-Word Comparison",
  "Typos",
  "Missing Content",
  "Content Order",
  "Heading Levels & Numbering",
  "Mini TOC",
  "Equations",
  "Special Characters & Symbols",
  "Footnote Citation & Placement",
  "List Spacing",
  "Double Digit Alignment",
  "Facing Page Alignment",
  "Global Instructions",
  "Quotations",
  "Citations & Placement",
  "Image / Figure Cutoffs",
  "Image Size",
  "Line Art Readability",
  "Credit Lines",
  "Heading Style Consistency",
  "Box Style Consistency",
  "Table Style Consistency",
  "Font Consistency",
  "Key Term Page Numbers",
  "FPO / Placeholder Images",
  "Unwanted Characters",
]

export { CHECKS }

export default function CheckSelector({ selected, onChange }) {
  const allSelected = selected.length === CHECKS.length

  function toggle(check) {
    if (selected.includes(check)) onChange(selected.filter(c => c !== check))
    else onChange([...selected, check])
  }

  function toggleAll() {
    onChange(allSelected ? [] : [...CHECKS])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Validation Checks ({selected.length}/{CHECKS.length})
        </p>
        <button
          onClick={toggleAll}
          className="text-xs text-brand underline font-semibold"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {CHECKS.map(c => (
          <label key={c} className="check-pill">
            <input
              type="checkbox"
              checked={selected.includes(c)}
              onChange={() => toggle(c)}
            />
            <span className="text-xs leading-tight">{c}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
