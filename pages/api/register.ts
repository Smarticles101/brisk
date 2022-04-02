import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { withSessionRoute } from "../../lib/withSession";
const bcrypt = require("bcrypt");

export default withSessionRoute(registerRoute);

async function registerRoute(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();

  const { username, password, admin } = JSON.parse(req.body);

  if (!username || !password) {
    res.status(400).json({ error: "Missing username or password" });
    return;
  }

  const user = await db.collection("users").findOne({ username });

  if (user) {
    return res.status(401).json({
      error: "User already exists",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const insertResult = await db.collection("users").insertOne({
    username,
    passwordHash,
    admin: admin || false,
  });

  res.send({ username, admin, _id: insertResult.insertedId });
}
