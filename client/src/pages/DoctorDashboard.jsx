// DoctorDashboard — the doctor's whole view.
//
// Two children: SessionList on the left, SummaryPanel on the right.
// Below 768px they collapse to a single stacked column: list on top, panel below.
//
// This file's only job is holding the "which session is selected" state and wiring the two
// children together. All the real work lives in the children and the Firestore hook.

import { useState } from 'react';
import Layout from '../components/shared/Layout.jsx';
import SessionList from '../components/doctor/SessionList.jsx';
import SummaryPanel from '../components/doctor/SummaryPanel.jsx';

export default function DoctorDashboard() {
  // Start with nothing selected. SummaryPanel shows the "Select a session" empty state.
  // setSelectedId is what SessionList calls when the doctor clicks a row.
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Layout>
      {/* items-start keeps both cards top-aligned even when one grows taller than the other. */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
        <div className="md:col-span-5">
          <SessionList selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="md:col-span-7">
          <SummaryPanel sessionId={selectedId} />
        </div>
      </div>
    </Layout>
  );
}