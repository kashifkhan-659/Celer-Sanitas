import { useState } from 'react';

// First step of an intake: who this session belongs to. A doctor with several sessions open
// otherwise has only symptom category and a clock time to tell them apart.
//
// Name and age only. Deliberately not a formal patient ID — an ID means nothing without a real
// registry to check it against, and there isn't one here.
//
// Type scale is deliberately matched to BodyMap so this reads as the first step of the same
// intake rather than a separate form.

export default function PatientDetails({ onSubmit }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  // Number('') is 0, so the empty check has to come before the numeric one.
  const ageNumber = Number(age);
  const nameValid = trimmedName.length > 0;
  const ageValid = age !== '' && Number.isInteger(ageNumber) && ageNumber > 0 && ageNumber < 130;
  const valid = nameValid && ageValid;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit({ patientName: trimmedName, patientAge: ageNumber });
  };

  // Focused state is a solid teal border with a pale teal fill — no glow ring, so the edge stays
  // crisp rather than blurring into a halo.
  const fieldClass = (ok) =>
    'mt-3 w-full rounded-full border bg-white px-5 py-3 text-body text-neutral-900 outline-none ' +
    'transition-colors placeholder:text-neutral-400 focus:border-teal-700 focus:bg-teal-50/40 ' +
    (touched && !ok ? 'border-neutral-400' : 'border-neutral-300');

  // Same size and weight as the INTAKE marker, in neutral rather than teal — teal is doing the
  // section-marker job at the top of the card and repeating it here would dilute it.
  const labelClass = 'text-[15px] font-semibold tracking-wide text-neutral-900';

  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-white p-10 shadow-[0_6px_28px_-10px_rgba(20,40,38,0.13),0_2px_8px_-4px_rgba(20,40,38,0.06)]">
      <p className="text-[15px] font-semibold tracking-wide text-teal-800">INTAKE</p>
      <h1 className="mt-5 text-question font-medium text-neutral-900">
        Let's start with your details
      </h1>
      <p className="mt-2 text-body text-neutral-500">
        So your doctor knows whose answers these are.
      </p>

      {/* noValidate: the messages below are calmer than the browser's own bubbles. */}
      <form onSubmit={submit} noValidate className="mt-8">
        <label className="block">
          <span className={labelClass}>Your name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Full name"
            className={fieldClass(nameValid)}
          />
          {touched && !nameValid && (
            <span className="mt-2 block text-body text-neutral-500">
              Please enter your name.
            </span>
          )}
        </label>

        <label className="mt-7 block">
          <span className={labelClass}>Your age</span>
          <input
            // inputMode numeric gets the number pad on phones without the spinner arrows and
            // scroll-to-change behaviour that type="number" brings.
            type="text"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Years"
            className={fieldClass(ageValid)}
          />
          {touched && !ageValid && (
            <span className="mt-2 block text-body text-neutral-500">
              Please enter your age in years.
            </span>
          )}
        </label>

        <button
          type="submit"
          className="mt-8 w-full rounded-full bg-teal-700 px-6 py-3 text-label font-semibold text-white
            transition-colors hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Continue
        </button>
      </form>
    </div>
  );
}