import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/client";
import {auth} from "../../../../middleware/auth";

interface ResponseData {
  id: string
  discordId: string
  sotonId: string
  firstName: string | null
  lastName: string | null
  discordTag: string | null
  school: string | null
  sotonLinkedDate: string | null
  discordLinkedDate: string | null
}

interface ResponseError {
  error: boolean
  message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | ResponseError>
) {
  if (req.method !== "GET") return res.status(405).json({
    error: true,
    message: 'Only HTTP verb GET is permitted',
  });
  const check = auth(req, res);
  if (check) return check;

  if (!req.body.guildId) {
    return res.status(400).json({
      error: true,
      message: 'You must provide a guildId in the body of the request',
    })
  }

  const guild = await prisma.guild.findUnique({
    where: {
      id: req.body.guildId
    }
  })

  if (!guild) {
    return res.status(404).json({
      error: true,
      message: 'That guild does not exist or is not set up with the bot yet',
    })
  }

  const discordId = typeof req.query.userId === 'string' ? req.query.userId : req?.query?.userId?.[0]

    if (!discordId) {
        return res.status(400).json({
        error: true,
        message: 'Incorrectly formatted userId parameter',
        })
    }

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

  let accessLog = user.accessLog;

  if (Array.isArray(accessLog)) {
    accessLog.push({ guild: req.body.guildId, time: new Date().toISOString(), endpoint: '[userId]' })
  } else {
    accessLog = [];
  }

  await prisma.user.update({
    data: {
      accessLog: accessLog
    },
    where: {
      id: user.id,
    }
  })

  res.status(200).json({
    id: user.id,
    discordId: user.discordId,
    sotonId: user.sotonId,
    firstName: user.firstName,
    lastName: user.lastName,
    discordTag: user.discordTag,
    school: user.school,
    sotonLinkedDate: new Date(user.sotonLinkedDate).toISOString(),
    discordLinkedDate: user.discordLinkedDate ? new Date(user.discordLinkedDate).toISOString() : null,
  });
}
