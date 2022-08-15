import {NextApiRequest, NextApiResponse} from "next";

const apiKeys = {
}

interface ResponseError {
    error: boolean
    message: string
}


export function auth(
    req: NextApiRequest,
    res: NextApiResponse<ResponseError>
) {
    console.log(req.headers)

    const attemptedAuth = req.headers.authorization;

    if (!attemptedAuth) {
        res.status(400).json({
            error: true,
            message: 'You must include an api key with the Authorization header',
        })
        return true;
    }

    // @ts-ignore
    if (!apiKeys[attemptedAuth]) {
        res.status(401).json({
            error: true,
            message: 'Unauthorized',
        })
        return true;
    }
}