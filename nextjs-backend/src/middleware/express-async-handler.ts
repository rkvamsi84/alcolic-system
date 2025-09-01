import { NextApiRequest, NextApiResponse } from 'next';

// Express async handler equivalent for Next.js
export const asyncHandler = (fn: Function) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      console.error('Async handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    });
  };
};

export default asyncHandler;
