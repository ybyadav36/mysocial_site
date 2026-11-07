// Generates the illustrated profile pictures in public/avatars/.
// Style: DiceBear "Lorelei" (CC0 1.0). Re-run with `npm run avatars` after editing.
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { mkdirSync, writeFileSync } from "node:fs";

const base = {
  beardProbability: 0,
  glassesProbability: 0,
  frecklesProbability: 0,
  earringsProbability: 0,
  hairAccessoriesProbability: 0,
};

const avatars = {
  aria: { hair: ["variant35"], hairColor: ["8a3b1c"], skinColor: ["f2d3b1"], eyes: ["variant14"], eyebrows: ["variant03"], mouth: ["happy05"], earringsProbability: 100, earrings: ["variant01"] },
  mei: { hair: ["variant19"], hairColor: ["1c1c1c"], skinColor: ["f5dcc4"], eyes: ["variant10"], eyebrows: ["variant09"], mouth: ["happy03"], glassesProbability: 100, glasses: ["variant04"] },
  zara: { hair: ["variant24"], hairColor: ["24160f"], skinColor: ["8d5524"], eyes: ["variant21"], eyebrows: ["variant07"], mouth: ["happy02"], earringsProbability: 100, earrings: ["variant03"] },
  isla: { hair: ["variant31"], hairColor: ["e0b25e"], skinColor: ["eabf94"], eyes: ["variant24"], eyebrows: ["variant02"], mouth: ["happy05"], frecklesProbability: 100 },
  priya: { hair: ["variant40"], hairColor: ["1a1110"], skinColor: ["c68642"], eyes: ["variant14"], eyebrows: ["variant11"], mouth: ["happy13"], earringsProbability: 100, earrings: ["variant02"] },
  nova: { hair: ["variant26"], hairColor: ["e88ab8"], skinColor: ["f1c9a5"], eyes: ["variant22"], eyebrows: ["variant05"], mouth: ["happy05"] },
  sofia: { hair: ["variant14"], hairColor: ["2b1b14"], skinColor: ["d9a066"], eyes: ["variant12"], eyebrows: ["variant04"], mouth: ["happy01"], hairAccessoriesProbability: 100, hairAccessories: ["flowers"] },
  ananya: { hair: ["variant41"], hairColor: ["1f1410"], skinColor: ["b97a50"], eyes: ["variant10"], eyebrows: ["variant10"], mouth: ["happy03"], earringsProbability: 100, earrings: ["variant01"] },
};

mkdirSync("public/avatars", { recursive: true });
for (const [id, options] of Object.entries(avatars)) {
  const svg = createAvatar(lorelei, { seed: id, ...base, ...options }).toString();
  writeFileSync(`public/avatars/${id}.svg`, svg);
  console.log(`public/avatars/${id}.svg`);
}
