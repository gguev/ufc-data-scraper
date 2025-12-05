import { ValidationError } from "../errors/index.js";

const REGEX = /^[a-zA-Z0-9-]+$/;

export function validateString(param: unknown, paramName: string): string {
  if (typeof param !== "string" || param.trim() === "") {
    throw new ValidationError(
      `${paramName} must be a non-empty string`,
      paramName
    );
  }
  return param.trim();
}

export function validateNumber(
  param: unknown,
  paramName: string,
  min?: number,
  max?: number
): number {
  if (typeof param !== "number" || Number.isNaN(param)) {
    throw new ValidationError(`${paramName} must be a valid number`, paramName);
  }

  if (min !== undefined && param < min) {
    throw new ValidationError(
      `${paramName} must be at least ${min}`,
      paramName
    );
  }

  if (max !== undefined && param > max) {
    throw new ValidationError(`${paramName} must be at most ${max}`, paramName);
  }

  return param;
}

export function validateSlug(param: unknown, paramName: string): string {
  const str = validateString(param, paramName);

  if (!REGEX.test(str)) {
    throw new ValidationError(
      `${paramName} contains invalid characters. Only letters, numbers, and hyphens are allowed.`,
      paramName
    );
  }

  return str;
}

export function validateOptionalString(param: unknown): string | null {
  if (param === undefined || param === null) {
    return null;
  }

  if (typeof param !== "string") {
    throw new ValidationError(
      "Optional parameter must be a string or null/undefined"
    );
  }

  const trimmed = param.trim();
  return trimmed === "" ? null : trimmed;
}
