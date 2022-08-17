import {NextApiRequest, NextApiResponse} from "next";


interface ResponseError {
    error: boolean
    message: string
}


export function auth(
    req: NextApiRequest,
    res: NextApiResponse<ResponseError>
) {
    const attemptedAuth = req.headers.authorization;

    if (!attemptedAuth) {
        res.status(400).json({
            error: true,
            message: 'You must include an api key with the Authorization header',
        })
        return true;
    }

    if (process.env.MAIN_BOT_KEY !== attemptedAuth) {
        res.status(401).json({
            error: true,
            message: 'Unauthorized',
        })
        return true;
    }
    
    return false;
}