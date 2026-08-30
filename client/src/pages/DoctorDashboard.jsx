// DoctorDashboard — the doctor's whole view (DESIGN.md §4.3 — asymmetrical bento).
//
// Two children: SessionList (left, col-span-4) and SummaryPanel (right, col-span-8).
// Below 768px both collapse to a single stacked column: list on top, panel below.
//
// This file's only job is holding the "which session is selected" state and wiring the two
// children together. All the real work lives in the children and the Firestore hook — this
// component intentionally has almost no logic.

import { useState } from 'react';
import Layout from '../components/shared/Layout.jsx';
import SessionList from '../components/doctor/SessionList.jsx';
import SummaryPanel from '../components/doctor/SummaryPanel.jsx';

export default function DoctorDashboard() {
  // Start with nothing selected. SummaryPanel shows a calm "Select a session" empty state.
  // setSelectedId is what SessionList calls when the doctor clicks a row.
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Layout>
      {/*
        Bento grid: 12 columns on md+ (4 for the list, 8 for the panel), single column below md.
        `items-start` keeps both children top-aligned even when the panel grows taller than the list.
      */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-start">
        <div className="md:col-span-4">
          <SessionList selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="md:col-span-8">
          <SummaryPanel sessionId={selectedId} />
        </div>
      </div>
    </Layout>
  );
}