import type { CalculatorInput, CalculatorResult } from "@/types";

const PIECE_LENGTH_M = 2.4;

export function calculateMaterials(
  input: CalculatorInput,
  unitPrice = 0,
): CalculatorResult {
  const openingsDeduction = input.doorCount * 0.9 + input.windowCount * 0.3;
  const netPerimeter = Math.max(input.perimeter - openingsDeduction, 0);
  const wasteFactor = 1 + input.wastePercent / 100;
  const totalLength = netPerimeter * wasteFactor;
  const pieces = Math.ceil(totalLength / PIECE_LENGTH_M);
  const connectors = Math.max(pieces - 1, 0);
  const innerCorners = Math.max(Math.round(input.perimeter / 8), 4);
  const outerCorners = Math.max(Math.round(input.perimeter / 16), 2);
  const adhesiveKg = input.includeAdhesive
    ? Number((totalLength * 0.12).toFixed(1))
    : 0;
  const pricePerMeter = unitPrice / PIECE_LENGTH_M;
  const estimatedPrice = Math.round(
    totalLength * pricePerMeter +
      connectors * 350 +
      innerCorners * 900 +
      outerCorners * 900 +
      adhesiveKg * 2500,
  );

  return {
    pieces,
    connectors,
    innerCorners,
    outerCorners,
    adhesiveKg,
    totalLength: Number(totalLength.toFixed(2)),
    estimatedPrice,
    wasteMeters: Number((totalLength - netPerimeter).toFixed(2)),
  };
}
