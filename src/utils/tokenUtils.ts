import { IncomingHttpHeaders } from 'http';

export const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  if (!authorization) {
    throw new Error('Authorization header is missing');
  }

  if (!authorization.startsWith('Bearer')) {
    throw new Error('Authorization header is not in the Bearer scheme');
  }

  return authorization.slice(7); // The length of 'Bearer ' is 7
};
