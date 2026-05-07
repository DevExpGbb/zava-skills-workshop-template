// A deliberately under-tested calculator. Branches that are NOT covered
// by tests/calculator.test.js are intentional — your test-generator
// skill should find them.

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

export function power(base, exponent) {
  if (exponent < 0) {
    return 1 / power(base, -exponent);
  }
  if (exponent === 0) return 1;
  let result = 1;
  for (let i = 0; i < exponent; i++) result *= base;
  return result;
}

export function factorial(n) {
  if (n < 0) throw new Error("factorial undefined for negative numbers");
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}
