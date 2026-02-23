import { calculateProjectScore } from "./scoreCalculator";

describe("calculateProjectScore", () => {
  test("returns 0 for empty or null input", () => {
    expect(calculateProjectScore([], null)).toBe(0);
    expect(calculateProjectScore(null, null)).toBe(0);
  });

  test("returns score of single file", () => {
    const results = [{ fileName: "test.css", score: 80 }];
    expect(calculateProjectScore(results, {})).toBe(80);
  });

  test("calculates unweighted average for standard files", () => {
    const results = [
      { fileName: "a.css", score: 100 },
      { fileName: "b.css", score: 50 },
    ];
    // (100 + 50) / 2 = 75
    expect(calculateProjectScore(results, {})).toBe(75);
  });

  test("applies 2x weight to default main files", () => {
    const results = [
      { fileName: "App.js", score: 50 }, // Weight 2 -> 100
      { fileName: "other.js", score: 100 }, // Weight 1 -> 100
    ];
    // Total Score: 100 + 100 = 200
    // Total Weight: 2 + 1 = 3
    // Average: 200 / 3 = 66.66 -> 67
    expect(calculateProjectScore(results, {})).toBe(67);
  });

  test("applies 2x weight to configured main files", () => {
    const config = { appFileName: "Main.js" };
    const results = [
      { fileName: "Main.js", score: 50 }, // Weight 2 -> 100
      { fileName: "other.js", score: 100 }, // Weight 1 -> 100
    ];
    expect(calculateProjectScore(results, config)).toBe(67);
  });

  test("handles mixed weights correctly", () => {
    const results = [
      { fileName: "index.html", score: 0 }, // W=2 -> 0
      { fileName: "App.css", score: 100 }, // W=2 -> 200
      { fileName: "comp.js", score: 100 }, // W=1 -> 100
    ];
    // Total Score: 300
    // Total Weight: 5
    // Average: 60
    expect(calculateProjectScore(results, {})).toBe(60);
  });
});
