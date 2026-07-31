import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  formatCuit,
  formatPartialCuit,
  toCanonicalCuit
} from "./provider-normalization";

describe("digitsOnly", () => {
  it.each([
    ["20123456789", "20123456789"],
    ["abc", ""],
    ["20 123 456", "20123456"],
    ["+54 (11)-1234.5678", "541112345678"],
    ["00123", "00123"],
    ["", ""]
  ])("normaliza %j como %j", (input, expected) => {
    expect(digitsOnly(input)).toBe(expected);
  });
});

describe("toCanonicalCuit", () => {
  it.each([
    ["20123456789", "20123456789"],
    ["20-12345678-9", "20123456789"],
    ["20.*12345678?/9", "20123456789"],
    ["20123456789999", "20123456789"],
    ["20123", "20123"]
  ])("canoniza %j como %j", (input, expected) => {
    expect(toCanonicalCuit(input)).toBe(expected);
  });
});

describe("formatPartialCuit", () => {
  it.each([
    ["", ""],
    ["2", "2"],
    ["20", "20"],
    ["201", "20-1"],
    ["2012345678", "20-12345678"],
    ["20123456789", "20-12345678-9"],
    ["20 # 1234.5678 / 9", "20-12345678-9"]
  ])("formatea %j como %j", (input, expected) => {
    expect(formatPartialCuit(input)).toBe(expected);
  });
});

describe("formatCuit", () => {
  it.each([
    ["20123456789", "20-12345678-9"],
    ["20123", "20-123"],
    ["20-12345678-9", "20-12345678-9"]
  ])("presenta %j como %j", (input, expected) => {
    expect(formatCuit(input)).toBe(expected);
  });
});
