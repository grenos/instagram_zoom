/* eslint-disable prettier/prettier */
// @flow

import { UIManager } from 'react-native';

export default function measureNode(node) {
  return new Promise((resolve, reject) => {
    UIManager.measureLayoutRelativeToParent(
      node,
      e => reject(e),
      (x, y, w, h) => {
        resolve({ x, y, w, h });
      }
    );
  });
}
