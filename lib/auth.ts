export const sessionCookieName = "vira-mes-session";

export function getConfiguredPin() {
  const pin = process.env.FINANCE_APP_PIN;

  if (!pin) {
    throw new Error("FINANCE_APP_PIN nao configurado.");
  }

  if (!/^\d+$/.test(pin)) {
    throw new Error("FINANCE_APP_PIN deve conter apenas numeros.");
  }

  return pin;
}

export function getExpectedSessionToken() {
  return getConfiguredPin();
}

export function isValidPin(value: string) {
  return /^\d+$/.test(value) && value === getConfiguredPin();
}
