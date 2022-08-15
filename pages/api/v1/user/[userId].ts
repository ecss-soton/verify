import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";

interface ResponseData {
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

interface ResponseError {
  error: boolean
  message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
  if (req.method !== "GET") return res.status(405);

  const discordId = typeof req.query.userId === 'string' ? req.query.userId : req.query.userId[0]
  const user = await prisma.user.findFirst({
    where: {
      discordId: discordId,
    }
  });

  if (!user || !user.discordId || !user.sotonId) {
    return res.status(404).json({
      error: true,
      message: 'This user does not exist or is not verified in this guild',
    })
  }


  res.status(200).json({
    id: user.id,
    discordId: user.discordId,
    sotonId: user.sotonId,
    firstName: user.firstName,
    lastName: user.lastName,
    discordTag: user.discordTag,
    school: user.school,
    sotonLinkedDate: new Date(user.sotonLinkedDate).toISOString(),
    discordLinkedDate: new Date(user.discordLinkedDate).toISOString(),
  });
}