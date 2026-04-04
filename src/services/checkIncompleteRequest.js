
const API_URL = import.meta.env.VITE_APP_API_URL;

// Legacy placeholder: Submerchants backend no longer supports INCOMPLETE verification drafts.
// We keep this function to avoid stale imports during refactors.
const checkIncompleteRequest = async () => {
  return {
    success: false,
    message: "Incomplete verification requests are not supported",
  };
};

export default checkIncompleteRequest;
  