import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(triggersRoute);

async function triggersRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  if (req.method === "GET") {
    const triggers = getTriggers();

    res.send({ triggers });
  }

  if (req.method === "POST") {
    const { name, type } = JSON.parse(req.body);

    if (!name || !type) {
      return res.status(400).json({
        error: "Missing name or type",
      });
    }

    const trigger = await createTrigger(name, type);

    res.send(trigger);
  }

  if (req.method === "DELETE") {
    const { triggers } = JSON.parse(req.body);

    if (!triggers) {
      return res.status(400).json({ error: "Missing triggers" });
    }

    const triggerObjectIds = triggers.map((trigger) => new ObjectId(trigger));

    await deleteTriggers(triggerObjectIds);

    res.send({ ok: true });
  }
}

export async function createTrigger(name, type) {
  const { db } = await connectToDatabase();

  const insertResponse = await db.collection("triggers").insertOne({
    name,
    type,
    createdAt: new Date(),
  });

  return {
    _id: insertResponse.insertedId,
    name,
    type,
  };
}

export async function getTriggers() {
  const { db } = await connectToDatabase();

  const triggers = await db.collection("triggers").find({}).toArray();

  return triggers;
}

export async function deleteTriggers(triggers) {
  const { db } = await connectToDatabase();

  await db.collection("triggers").deleteMany({ _id: { $in: triggers } });
}
