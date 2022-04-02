import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(tagsRoute);

async function tagsRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  if (req.method === "GET") {
    const tags = getTags();

    res.send({ tags });
  }

  if (req.method === "POST") {
    console.log(req.body);
    const { name, code, trigger, template, parameters } = JSON.parse(req.body);

    if (!(name && trigger || code || (template && parameters))) {
      return res.status(400).json({
        error: "Missing required parameters",
      });
    }

    const tag = await createTag({ name, code, trigger, template, parameters });

    res.send(tag);
  }

  if (req.method === "DELETE") {
    const { tags } = JSON.parse(req.body);

    if (!tags) {
      return res.status(400).json({ error: "Missing tags" });
    }

    const tagObjectIds = tags.map((tag) => new ObjectId(tag));

    await deleteTags(tagObjectIds);

    res.send({ ok: true });
  }
}

export async function createTag({ name, code, trigger, template, parameters }) {
  const { db } = await connectToDatabase();

  const insertResponse = await db.collection("tags").insertOne({
    name,
    code,
    template,
    parameters,
    trigger: new ObjectId(trigger),
    createdAt: new Date(),
  });

  return {
    _id: insertResponse.insertedId,
    name,
    code,
    template,
    parameters,
    trigger,
  };
}

export async function getTags() {
  const { db } = await connectToDatabase();

  const triggers = await db.collection("tags").find({}).toArray();

  return triggers;
}

export async function deleteTags(tags) {
  const { db } = await connectToDatabase();

  await db.collection("tags").deleteMany({ _id: { $in: tags } });
}
