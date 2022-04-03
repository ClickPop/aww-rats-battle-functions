export const rat = {
  ownerOf: (id: string) => {
    switch (id) {
      case '69':
        return Promise.resolve('admin');
      default:
        throw new Error('unknown id');
    }
  },
};

export const provider = {};
