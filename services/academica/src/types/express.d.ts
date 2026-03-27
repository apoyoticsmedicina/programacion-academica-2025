import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                rol: string;
                nombre?: string;
                foto?: string;
            };
        }
    }
}

export { };