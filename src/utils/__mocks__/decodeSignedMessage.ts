export const decodeSignedMessage = (msg: string) => {
  switch (msg) {
    case 'admin-msg':
      return 'admin';
    case 'user-msg':
      return 'user';
    default:
      return null;
  }
};
