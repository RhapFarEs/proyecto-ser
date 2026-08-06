import { describe, expect, it } from "vitest";

import { AVATAR_BUCKET, avatarPath } from "./avatar";

describe("where a profile photo lives", () => {
  const userId = "8f2b1c44-9a3e-4f7d-8b21-0c6d5e4a1b90";

  it("puts the user id first, which is what the bucket policies check", () => {
    // Insert, update and delete all test `(storage.foldername(name))[1]`
    // against the signed-in id. A path shaped any other way is rejected.
    expect(avatarPath(userId).split("/")[0]).toBe(userId);
  });

  it("is one fixed file per person, so a new photo replaces the old", () => {
    expect(avatarPath(userId)).toBe(`${userId}/avatar.jpg`);
    expect(avatarPath(userId)).toBe(avatarPath(userId));
  });

  it("gives two people two different paths", () => {
    expect(avatarPath("a")).not.toBe(avatarPath("b"));
  });

  it("names the bucket the policies were written against", () => {
    expect(AVATAR_BUCKET).toBe("avatars");
  });
});
