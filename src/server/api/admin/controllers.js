// @flow
export const index = {
  async get (req: $Request, res: $Response) {
    res.json({ message: 'This is going to be the admin API.' });
  }
};
