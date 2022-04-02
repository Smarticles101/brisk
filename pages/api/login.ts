import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { withSessionRoute } from "../../lib/withSession";
const bcrypt = require("bcrypt");

export default withSessionRoute(loginRoute);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();

  const { username, password } = JSON.parse(req.body);

  if (!username || !password) {
    res.status(400).json({ error: "Missing username or password" });
    return;
  }

  const user = await db.collection("users").findOne({ username });

  if (!user) {
    return res.status(401).json({
      error: "User not found",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return res.status(401).json({
      error: "Password is incorrect",
    });
  }

  // get user from database then:
  req.session.user = {
    username,
    admin: user.admin,
  };
  await req.session.save();
  res.send({ ok: true });
}
