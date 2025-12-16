interface Route {
  id: string;
  slug: string;
  name: string;
  botToken: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    requests: number;
  };
}

interface Request {
  id: string;
  routeId: string;
  route: Route;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'error';
  error?: string;
  createdAt: string;
  updatedAt: string;
}
