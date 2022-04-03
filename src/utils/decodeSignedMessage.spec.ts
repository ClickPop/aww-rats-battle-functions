import { decodeSignedMessage } from './decodeSignedMessage';

const dummyWallet = '0xFa66D9E03ADd9dC77D37f5aB23e3dEF7E40A81F8';
const dummyMsg =
  '0x3eedff834cc55d5a859ae790cc7acd8e0d00a4a858d5f9b14883f13fb12cff653542c544a3d9cac4973fa46a8b74ca9683e776e7166c55b9cade8a0bb2109cdd1c';

describe('Decode Signed Message', () => {
  test('should return the correct wallet if provided the signed message', () => {
    expect(decodeSignedMessage(dummyMsg)).toEqual(dummyWallet.toLowerCase());
  });
});
