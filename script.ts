import bcrypt from "bcrypt";

async function run() {
  const hashed = await bcrypt.hash("Anas@9645", 10);
  console.log(hashed);
}

run();