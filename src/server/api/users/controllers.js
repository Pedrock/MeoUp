import argon2 from 'argon2';
import blacklist from 'express-jwt-blacklist';
import User from './models';
import jwt from 'jsonwebtoken';
import stripUser from '~util/stripUser';
import randId from '~util/randId';
import { ServerError } from '~middleware/express-server-error';
import { MeoCloudOAuth } from '../../util/meocloud';

export const index = {
  async post (req, res) {
    try {
      let { username, email, password1, password2 } = req.body;
      if (password1 === password2) {
        let password = await argon2.hash(password1);
        let newUser = new User({ username, email, password });
        let savedUser = await newUser.save();
        res.json({ message: `Thanks for signing up, ${savedUser.username}!` });
      } else {
        throw new ServerError('Passwords don\'t match.', { status: 400 });
      }
    } catch (error) {
      res.handleServerError(error);
    }
  }
};

// separate into auth app if need be. 'sign-up' is handled as a POST request to '/users'
export const signIn = {
  async post (req, res) {
    try {
      let { username, password } = req.body;
      username = username.toLowerCase();
      let user = await User.findOne({ username });
      if (!user) throw new ServerError('Authentication failed. Incorrect username or password', { status: 401, log: false });
      let passwordHash = user.password;
      let matched = await argon2.verify(passwordHash, password);
      if (!user || !matched || !username || !password) {
        throw new ServerError('Authentication failed. Incorrect username or password', { status: 401, log: false });
      } else {
        user = stripUser(user);
        let token = jwt.sign(user, process.env.SECRET, { expiresIn: '30 days', jwtid: randId() });
        res.status(200).json({ message: `Welcome, ${user.username}!`, token, user });
      }
    } catch (error) {
      res.handleServerError(error);
    }
  }
};

export const signOut = {
  async post (req, res) {
    try {
      blacklist.revoke(req.user);
      res.json({ message: 'Sign out successful. Good bye! :)' });
    } catch (error) {
      res.handleServerError(error);
    }
  }
};

export const check = {
  async get (req, res) {
    try {
      let authorizedQueries = ['username', 'email'];
      if (authorizedQueries.includes(req.query.check)) {
        let check = req.query.check;
        let data = req.query.data;
        let user = await User.find({ [check]: data });
        if (user.length) res.json({ exists: true });
        else res.json({ exists: false });
      } else {
        throw new ServerError('Query not supported.', { status: 400 });
      }
    } catch (error) {
      res.handleServerError(error);
    }
  }
};

export const oauth = {
  async get (req, res) {
    try {
      const oauth = new MeoCloudOAuth();
      oauth.getOAuthRequestToken(async (error, oauthToken, oauthTokenSecret) => {
        if (error) {
          return res.handleServerError(error);
        } else {
          await User.findByIdAndUpdate(req.user.id, { oauthToken, oauthTokenSecret });
          res.json({ authorizeURL: `https://meocloud.pt/oauth/authorize?oauth_token=${oauthToken}` });
        }
      });
    } catch (error) {
      res.handleServerError(error);
    }
  },
  async post (req, res) {
    try {
      const oauth = new MeoCloudOAuth();
      const user = await User.findById(req.user.id);
      const { oauthToken, oauthTokenSecret } = user;
      oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, req.body.pin, (error, meocloudToken, meocloudSecret) => {
        if (error) {
          res.handleServerError(error);
        } else {
          user.oauthToken = user.oauthTokenSecret = undefined;
          user.meocloudToken = meocloudToken;
          user.meocloudSecret = meocloudSecret;
          user.save();
          res.end();
        }
      });
    } catch (error) {
      res.handleServerError(error);
    }
  },
  check: {
    async get (req, res) {
      const user = await User.findById(req.user.id);
      const { meocloudToken, meocloudSecret } = user;
      res.json(meocloudToken && meocloudSecret);
    }
  }
};
