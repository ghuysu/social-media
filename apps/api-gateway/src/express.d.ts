// src/express.d.ts
import * as express from 'express';
import { GoogleSignInDto } from '@app/common';

declare global {
  namespace Express {
    interface Request {
      user?: GoogleSignInDto;
    }
  }
}
