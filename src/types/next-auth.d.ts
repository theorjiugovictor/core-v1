import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    businessName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      businessName: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    businessName: string;
  }
}
