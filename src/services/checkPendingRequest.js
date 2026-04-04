
const API_URL = import.meta.env.VITE_APP_API_URL;

// Checks whether the currently authenticated user has a PENDING verification request.
// NOTE: Backend route is `GET /verification/:id` but the controller uses `req.user.id`.
const checkPendingRequest = async () => {
  try {
    const pendingVerificationRequest = await fetch(`${API_URL}/verification/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!pendingVerificationRequest.ok) {
      throw new Error("Failed to get pending verification request");
    }

    const data = await pendingVerificationRequest.json();
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

export default checkPendingRequest;
  