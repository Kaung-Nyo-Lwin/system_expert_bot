const paths = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  chat: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2V11.5A8.5 8.5 0 0 1 9.5 3h3a8.5 8.5 0 0 1 8.5 8.5Z M7 9h9 M7 13h6",
  code: "m8 5-7 7 7 7 M16 5l7 7-7 7 M14 3l-4 18",
  document: "M14 2H5v20h14V7l-5-5Z M14 2v6h5 M8 12h8 M8 16h6",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  external: "M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7",
  database:
    "M20 5c0 2-4 3-8 3S4 7 4 5s4-3 8-3 8 1 8 3Z M4 5v7c0 2 4 3 8 3s8-1 8-3V5 M4 12v7c0 2 4 3 8 3s8-1 8-3v-7",
  graph:
    "M12 8V4 M8 14l-4 4 M16 14l4 4 M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M14 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M23 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  check: "m5 12 4 4L19 6",
  download: "M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5",
  copy: "M9 9h12v12H9z M15 5V2H2v13h3",
  book: "M12 5C9 2 4 2 2 3v17c3-1 7-1 10 1 3-2 7-2 10-1V3c-2-1-7-1-10 2Zm0 0v16",
  refresh: "M20 7a9 9 0 1 0 1 9 M20 2v6h-6",
};
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.code} />
    </svg>
  );
}
