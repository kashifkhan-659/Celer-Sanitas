// Splash on load, then the routing switch.
//
// Reach /             → patient intake
// Reach /?doctor      → doctor dashboard
//
// The splash sits on top of whichever page is behind it, so the app is already mounted and
// listening to Firestore while it shows. By the time it fades, the data has usually arrived.

import { useState } from 'react';
import PatientIntake from './pages/PatientIntake.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import Splash from './components/shared/Splash.jsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // window.location.search is the "?..." bit of the URL. .has('doctor') is true if the URL
  // contains ?doctor (or ?doctor=anything).
  const isDoctor = new URLSearchParams(window.location.search).has('doctor');

  return (
    <>
      {isDoctor ? <DoctorDashboard /> : <PatientIntake />}
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
    </>
  );
}