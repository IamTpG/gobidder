export const EyeIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export const EyeOffIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
};

export const MailIcon = () => {
  return (
    <svg
      className="w-12 h-12 text-primary mb-4 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
         {" "}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
       {" "}
    </svg>
  );
};

export const KeyIcon = () => (
  <svg
    className="w-12 h-12 text-primary mb-4 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
       {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11 11 11.5 9.5 13 7.5 13 6.5 14 6 14a2 2 0 01-2-2v-6a2 2 0 012-2h9a2 2 0 012 2z"
    />
     {" "}
  </svg>
);

export const CheckIcon = () => (
  <svg
    className="w-16 h-16 text-primary mb-4 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
       {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
     {" "}
  </svg>
);

export const GoogleIcon = () => {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M44.5 20H24V28.5H35.4292C34.6542 32.5125 31.7458 35.3958 28 36.5667V44.0417H37.5833C42.9125 39.4625 46.125 32.35 46.125 24C46.125 22.6125 46.0125 21.2542 45.8167 19.9542L44.5 20Z"
        fill="#4285F4"
      />
      <path
        d="M24 46.125C30.6375 46.125 36.2167 43.9042 40.4042 40.1792L31.925 33.1583C29.6125 34.6333 26.9667 35.5 24 35.5C18.2583 35.5 13.375 31.5708 11.6667 26.1583H2.08333V33.6333C5.55 40.7333 14.1208 46.125 24 46.125Z"
        fill="#34A853"
      />
      <path
        d="M11.6667 26.1583C11.1625 24.7833 10.9083 23.4125 10.9083 22C10.9083 20.5875 11.1625 19.2167 11.6667 17.8417V10.3667H2.08333C0.375 14.3917 0 17.9125 0 22C0 26.0875 0.375 29.6083 2.08333 33.6333L11.6667 26.1583Z"
        fill="#FBBC05"
      />
      <path
        d="M24 8.875C27.5708 8.875 30.7708 10.15 33.3042 12.5833L40.4042 5.55833C36.2167 1.83333 30.6375 0 24 0C14.1208 0 5.55 5.39167 2.08333 12.5833L11.6667 19.9542C13.375 14.475 18.2583 10.5 24 10.5C26.9667 10.5 29.6125 11.3667 31.925 12.8417L33.3042 12.5833Z"
        fill="#EA4335"
      />
    </svg>
  );
};

export const HeartIcon = ({ filled = false, className = "" }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};
