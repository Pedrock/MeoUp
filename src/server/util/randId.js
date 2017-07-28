// @flow
import crypto from 'crypto';
export default (method: buffer$Encoding = 'base64') => crypto.randomBytes(64).toString(method);
