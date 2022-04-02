import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import { promises as fs } from "fs";
import { getTagTemplate } from "../../lib/tagTemplates";

let ejs = require("ejs");

export default async function briskclientRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectToDatabase();

  const rawtagdata = await db
    .collection("tags")
    .aggregate([
      {
        $lookup: {
          from: "triggers",
          localField: "trigger",
          foreignField: "_id",
          as: "trigger",
        },
      },
      {
        $project: {
          code: 1,
          template: 1,
          parameters: 1,
          trigger: { $arrayElemAt: ["$trigger", 0] },
        },
      },
    ])
    .toArray();

  const renderedtagdata = await Promise.all(rawtagdata.map(async (tag) => {
    const { template, parameters } = tag;

    if (!template) return tag;

    const { templateCode } = await getTagTemplate(template);
    const rendered_template = ejs.render(templateCode, parameters);
    
    return { ...tag, code: rendered_template };
  }));

  const briskclient_template = await fs.readFile(
    "lib/briskclient_template.js",
    "utf8"
  );

  let render = ejs.render(briskclient_template, {
    tagdata: JSON.stringify(renderedtagdata)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'"),
  });

  res.send(render);
}
