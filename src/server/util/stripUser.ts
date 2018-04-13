import _ from 'lodash';

export default function stripUser (user: any) {
  return _.pick(user.toObject(), ['id', 'username', 'email', 'firstName', 'lastName', 'admin']);
}
