// @flow

export class ServerError extends Error {
  name: string;
  status: number;
  log: boolean;
  expressServerError: boolean;

  constructor (message: string = 'Internal Server Error.', { status = 500, name = 'ServerError', log = true }: { status?: number, name?: string, log?: boolean}) {
    super(message);
    this.name = name;
    this.status = status;
    this.log = log;
    this.expressServerError = true;
  }
}

export function handleServerErrors (req: $Request, res: $Response, next: express$NextFunction) {
  res.handleServerError = error => {
    if (error.expressServerError) {
      if (error.log === true) console.error(error);
      res.status(error.status).json({ name: error.name, message: error.message });
    } else {
      error.expressServerError = false;
      console.error(error);
      res.status(500).json({ name: 'ServerError', message: 'Internal Server Error.' });
    }
  };
  next();
}
