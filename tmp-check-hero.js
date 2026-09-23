const fs = require("fs");
const h = fs.readFileSync(process.env.TEMP + "/hero-en.html", "utf8");
const needle = "Explore products";
let idx = 0;
let n = 0;
while ((idx = h.indexOf(needle, idx)) !== -1 && n < 5) {
  console.log("\n--- at", idx);
  console.log(h.slice(idx, idx + 450));
  idx += needle.length;
  n++;
}
if (n === 0) console.log("needle not found");
