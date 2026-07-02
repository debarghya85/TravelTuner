const LOGIN_RETURN_KEY = "travel_tuner_login_return";

export function setLoginReturnPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(LOGIN_RETURN_KEY, path);
}

export function consumeLoginReturnPath() {
  if (typeof window === "undefined") {
    return null;
  }

  const path = window.sessionStorage.getItem(LOGIN_RETURN_KEY);
  if (path) {
    window.sessionStorage.removeItem(LOGIN_RETURN_KEY);
  }

  return path;
}
