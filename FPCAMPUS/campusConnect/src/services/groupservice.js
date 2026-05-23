const STORAGE_KEY = "groups";

export const getGroups = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

export const createGroup = (group) => {
  const groups = getGroups();
  groups.push(group);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export const addRequest = (groupId, user) => {
  const groups = getGroups();
  const updated = groups.map(g => {
    if (g.id === groupId) {
      return {
        ...g,
        requests: [...g.requests, user]
      };
    }
    return g;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const acceptRequest = (groupId, user) => {
  const groups = getGroups();
  const updated = groups.map(g => {
    if (g.id === groupId) {
      return {
        ...g,
        members: [...g.members, user],
        requests: g.requests.filter(u => u !== user)
      };
    }
    return g;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};