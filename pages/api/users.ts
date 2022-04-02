import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(usersRoute);

async function usersRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user.admin) {
    // if user is not admin, return error
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  if (req.method === "GET") {
    const users = await getUsers();

    res.send({ users });
  }

  if (req.method === "DELETE") {
    const { users } = JSON.parse(req.body);

    if (!users) {
      return res.status(400).json({ error: "Missing users" });
    }

    const userObjectIds = users.map((user) => new ObjectId(user));

    await deleteUsers(userObjectIds);

    res.send({ ok: true });
  }
}

export async function getUsers() {
  const { db } = await connectToDatabase();

  const users = await db
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .toArray();

  return users;
}

export async function deleteUsers(users) {
  const { db } = await connectToDatabase();

  await db.collection("users").deleteMany({ _id: { $in: users } });
}