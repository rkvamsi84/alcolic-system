import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { NextApiResponseServerIO } from '@/types/socket';
import SocketServer from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    const httpServer: HTTPServer = res.socket.server as any;
    const io = new SocketServer(httpServer);
    
    res.socket.server.io = io.getIO();
  }

  res.end();
}
