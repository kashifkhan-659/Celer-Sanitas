// Temporary routing switch (per handoff §4: shared decision — awaiting confirmation on
// react-router-dom vs. this URL-param approach; using this as a safe interim so the dashboard
// is reachable for local testing).
//
// Reach /             → patient intake (existing behaviour, unchanged)
// Reach /?doctor      → doctor dashboard
//
// No new dependency added. Trivial to rip out and replace with a real router later.

import PatientIntake from './pages/PatientIntake.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';

export default function App() {
  // window.location.search is the "?..." bit of the URL. .has('doctor') is true if the URL
  // contains ?doctor (or ?doctor=anything). Simple and honest for a temporary switch.
  const isDoctor = new URLSearchParams(window.location.search).has('doctor');
  return isDoctor ? <DoctorDashboard /> : <PatientIntake />;
}