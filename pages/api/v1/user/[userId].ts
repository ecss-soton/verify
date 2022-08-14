import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  id: string
  discordId: string
  sotonId: string
  firstName: string
  lastName: string
  discordTag: string
  school: string
  sotonLinkedDate: string
  discordLinkedDate: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") return res.status(405);


  res.status(200).json({
    id: "a1cbcb06-b5d8-4769-bbc1-352cf3ebfc4b",
    discordId: "267292139208048641",
    sotonId: "ec3g21",
    firstName: "Euan",
    lastName: "Caskie",
    discordTag: "Ortovox#9235",
    school: "Electronics & Computer Science (Student)",
    sotonLinkedDate: new Date().toISOString(),
    discordLinkedDate: new Date().toISOString(),
  });
}