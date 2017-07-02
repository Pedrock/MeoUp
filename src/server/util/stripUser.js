export default function stripUser (user, fields = ['password', 'createdAt', 'updatedAt', '_id', '__v']) {
  let newUser = user.toObject()
  newUser.id = user.id
  fields.forEach(field => {
    delete newUser[field]
  })
  return newUser
}
