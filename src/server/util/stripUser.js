import _ from 'lodash';

export default function stripUser (user) {
  return _.pick(user.toObject(), ['id', 'username', 'email', 'firstName', 'lastName', 'admin']);
}
