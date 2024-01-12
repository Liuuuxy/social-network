export function getFollowListForUser(userId, allUsers) {
  if (userId > 10) {
    return [];
  }
  let startId = (userId + 1) % 10;
  let followed = [];

  const findUser = (id) => allUsers.find((user) => user.id === id);

  for (let i = 0; i < 3; i++) {
    followed.push(findUser(startId));
    startId++;
  }

  return followed;
}
