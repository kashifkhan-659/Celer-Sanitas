// The Celer Sanitas mark. Used in the header and on the splash screen.
// Gradient id is namespaced so it can't collide with any other SVG on the page.

export default function Mark({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="100 40 460 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M123 359C202.117 219.365 296.604 138.806 492.5 52C429.294 119.39 388.032 167.399 355.921 217.064C348.017 229.555 340.571 242.046 333.643 254.421C323.343 273.21 313.832 292.901 304.5 314.5C409.069 255.091 460.948 215.042 543.5 133.5C472.062 293.478 355.5 432 290 464C251 474 162.157 413.179 123 359Z"
        fill="url(#celerMarkGradient)"
      />
      <defs>
        <linearGradient
          id="celerMarkGradient"
          x1="333.25"
          y1="52"
          x2="333.25"
          y2="465.088"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#164F49" />
          <stop offset="1" stopColor="#2A9D8F" />
        </linearGradient>
      </defs>
    </svg>
  );
}