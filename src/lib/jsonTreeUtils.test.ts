import { describe, it, expect } from "vitest";
import {
  getAllExpandablePaths,
  collectMatchPaths,
  collectAutoExpandedPaths,
} from "./jsonUtils";

describe("getAllExpandablePaths", () => {
  it("returns empty set for primitive root", () => {
    expect(getAllExpandablePaths(123)).toEqual(new Set());
    expect(getAllExpandablePaths("hello")).toEqual(new Set());
    expect(getAllExpandablePaths(null)).toEqual(new Set());
  });

  it("includes root path for object root", () => {
    const result = getAllExpandablePaths({ a: 1 });

    expect(result).toEqual(new Set(["Root"]));
  });

  it("collects nested object paths", () => {
    const result = getAllExpandablePaths({
      a: {
        b: {
          c: 1,
        },
      },
    });

    expect(result).toEqual(new Set(["Root", "Root.a", "Root.a.b"]));
  });

  it("collects array paths including indices", () => {
    const result = getAllExpandablePaths([{ a: 1 }, { b: 2 }]);

    expect(result).toEqual(new Set(["Root", "Root[0]", "Root[1]"]));
  });

  it("handles mixed objects and arrays", () => {
    const result = getAllExpandablePaths({
      items: [{ a: 1 }, { b: [1, 2] }],
    });

    expect(result).toEqual(
      new Set([
        "Root",
        "Root.items",
        "Root.items[0]",
        "Root.items[1]",
        "Root.items[1].b",
      ])
    );
  });

  it("includes empty objects and arrays", () => {
    const result = getAllExpandablePaths({
      emptyObj: {},
      emptyArr: [],
    });

    expect(result).toEqual(new Set(["Root", "Root.emptyObj", "Root.emptyArr"]));
  });

  it("skips null values inside objects", () => {
    const result = getAllExpandablePaths({
      a: null,
      b: {
        c: null,
      },
    });

    expect(result).toEqual(new Set(["Root", "Root.b"]));
  });
});

describe("collectAutoExpandedPaths", () => {
  it("returns empty array for empty search term", () => {
    const data = { a: { b: 1 } };

    expect(collectAutoExpandedPaths(data, "")).toEqual([]);
    expect(collectAutoExpandedPaths(data, "   ")).toEqual([]);
  });

  it("auto-expands paths leading to matching key", () => {
    const data = {
      a: {
        b: {
          c: 1,
        },
      },
    };

    const result = collectAutoExpandedPaths(data, "c");

    expect(new Set(result)).toEqual(new Set(["Root", "Root.a", "Root.a.b"]));
  });

  it("matches primitive values", () => {
    const data = {
      a: {
        b: {
          c: 42,
        },
      },
    };

    const result = collectAutoExpandedPaths(data, "42");

    expect(new Set(result)).toEqual(new Set(["Root", "Root.a", "Root.a.b"]));
  });

  it("matches null values", () => {
    const data = {
      a: {
        b: null,
      },
    };

    const result = collectAutoExpandedPaths(data, "null");

    expect(new Set(result)).toEqual(new Set(["Root", "Root.a"]));
  });

  it("handles arrays and index matching", () => {
    const data = {
      items: [{ name: "apple" }, { name: "banana" }],
    };

    const result = collectAutoExpandedPaths(data, "banana");

    expect(new Set(result)).toEqual(
      new Set(["Root", "Root.items", "Root.items[1]"])
    );
  });

  it("returns empty array when nothing matches", () => {
    const data = {
      a: { b: 1 },
    };

    const result = collectAutoExpandedPaths(data, "zzz");

    expect(result).toEqual([]);
  });
});

describe("collectMatchPaths", () => {
  it("collects paths matching primitive values", () => {
    const data = {
      a: {
        b: 123,
      },
    };

    const result = runCollectMatchPaths(data, "123");

    expect(result).toEqual(["Root.a.b"]);
  });

  it("collects paths matching key names", () => {
    const data = {
      userName: "ran",
      age: 44,
    };

    const result = runCollectMatchPaths(data, "user");

    expect(result).toEqual(["Root.userName"]);
  });

  it("matches null values", () => {
    const data = {
      a: null,
    };

    const result = runCollectMatchPaths(data, "null");

    expect(result).toEqual(["Root.a"]);
  });

  it("collects matches inside arrays", () => {
    const data = {
      items: [{ name: "apple" }, { name: "banana" }],
    };

    const result = runCollectMatchPaths(data, "banana");

    expect(result).toEqual(["Root.items[1].name"]);
  });

  it("does not include parent paths when only children match", () => {
    const data = {
      a: {
        b: {
          c: "match",
        },
      },
    };

    const result = runCollectMatchPaths(data, "match");

    expect(result).toEqual(["Root.a.b.c"]);
  });

  it("collects multiple matching paths", () => {
    const data = {
      a: "foo",
      b: "foo",
    };

    const result = runCollectMatchPaths(data, "foo");

    expect(result).toEqual(["Root.a", "Root.b"]);
  });

  it("does nothing for empty search term", () => {
    const data = {
      a: 1,
      b: { c: 2 },
    };

    const acc: string[] = [];
    collectMatchPaths(data, "Root", "", acc);

    expect(acc).toEqual([]);
  });
});

function runCollectMatchPaths(
  value: unknown,
  term: string,
  startPath = "Root"
) {
  const acc: string[] = [];
  collectMatchPaths(value, startPath, term, acc);
  return acc;
}
