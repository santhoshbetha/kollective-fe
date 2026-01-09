/* eslint-disable no-case-declarations */
const DEFAULT_MAX_PIXELS = 1920 * 1080;

// runtime environment check
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const _browser_quirks = {};

// Some browsers will automatically draw images respecting their EXIF orientation
// while others won't, and the safest way to detect that is to examine how it
// is done on a known image.
// See https://github.com/w3c/csswg-drafts/issues/4666
// and https://github.com/blueimp/JavaScript-Load-Image/commit/1e4df707821a0afcc11ea0720ee403b8759f3881
const dropOrientationIfNeeded = (orientation) => new Promise((resolve) => {
  if (!isBrowser) {
    _browser_quirks['image-orientation-automatic'] = false;
    resolve(orientation);
    return;
  }

  switch (_browser_quirks['image-orientation-automatic']) {
    case true:
      resolve(1);
      break;
    case false:
      resolve(orientation);
      break;
    default:
    // black 2x1 JPEG, with the following meta information set:
    // - EXIF Orientation: 6 (Rotated 90° CCW)
      const testImageURL =
      'data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAA' +
      'AAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA' +
      'QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE' +
      'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/x' +
      'ABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAA' +
      'AAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==';
      const img = new Image();
      img.onload = () => {
        const automatic = (img.width === 1 && img.height === 2);
        _browser_quirks['image-orientation-automatic'] = automatic;
        resolve(automatic ? 1 : orientation);
      };
      img.onerror = () => {
        _browser_quirks['image-orientation-automatic'] = false;
        resolve(orientation);
      };
      // set src last to avoid synchronous load in some browsers
      img.src = testImageURL;
  }
});

// /**
//  *Some browsers don't allow reading from a canvas and instead return all-white
//  * or randomized data. Use a pre-defined image to check if reading the canvas
//  * works.
//  */
// const checkCanvasReliability = () => new Promise<void>((resolve, reject) => {
//   switch(_browser_quirks['canvas-read-unreliable']) {
//   case true:
//     reject('Canvas reading unreliable');
//     break;
//   case false:
//     resolve();
//     break;
//   default:
//     // 2×2 GIF with white, red, green and blue pixels
//     const testImageURL =
//       'data:image/gif;base64,R0lGODdhAgACAKEDAAAA//8AAAD/AP///ywAAAAAAgACAAACA1wEBQA7';
//     const refData =
//       [255, 255, 255, 255,  255, 0, 0, 255,  0, 255, 0, 255,  0, 0, 255, 255];
//     const img = new Image();
//     img.onload = () => {
//       const canvas  = document.createElement('canvas');
//       const context = canvas.getContext('2d');
//       context?.drawImage(img, 0, 0, 2, 2);
//       const imageData = context?.getImageData(0, 0, 2, 2);
//       if (imageData?.data.every((x, i) => refData[i] === x)) {
//         _browser_quirks['canvas-read-unreliable'] = false;
//         resolve();
//       } else {
//         _browser_quirks['canvas-read-unreliable'] = true;
//         reject('Canvas reading unreliable');
//       }
//     };
//     img.onerror = () => {
//       _browser_quirks['canvas-read-unreliable'] = true;
//       reject('Failed to load test image');
//     };
//     img.src = testImageURL;
//   }
// });

/** Convert the file into a local blob URL. */
const getImageUrl = (inputFile) => new Promise((resolve, reject) => {
  if (!isBrowser) {
    reject(new Error('Not running in a browser environment'));
    return;
  }

  // @ts-ignore: This is a browser capabilities check.
  if (window.URL && window.URL.createObjectURL) {
    try {
      resolve(window.URL.createObjectURL(inputFile));
    } catch (error) {
      reject(error);
    }
    return;
  }

  const reader = new FileReader();
  reader.onerror = (...args) => reject(...args);
  reader.onload  = ({ target }) => resolve((target && target.result) ? target.result.toString() : '');

  reader.readAsDataURL(inputFile);
});

/** Get an image element from a file. */
const loadImage = (inputFile) => new Promise((resolve, reject) => {
  if (!isBrowser) return reject(new Error('Not running in a browser environment'));
  getImageUrl(inputFile).then((url) => {
    const img = new Image();

    img.onerror = (...args) => reject([...args]);
    img.onload  = () => resolve(img);

    // set src last
    img.src = url;
  }).catch(reject);
});

/** Get the exif orientation for the image. */
async function getOrientation(img, type = 'image/png') {
  if (!isBrowser) return 1;
  if (!['image/jpeg', 'image/webp'].includes(type)) return 1;

  try {
    const exifr = await import('exifr');
    const orientation = (await exifr.orientation(img)) || 1;

    if (orientation !== 1) return await dropOrientationIfNeeded(orientation);
    return orientation;
  } catch {
    // don't spam the console in normal operation
    return 1;
  }
}

const processImage = (img, { width, height, orientation, type = 'image/png', name = 'resized.png' }) => new Promise((resolve, reject) => {
  if (!isBrowser) return reject(new Error('Not running in a browser environment'));

  const canvas = document.createElement('canvas');

  if (4 < orientation && orientation < 9) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d');
  if (!context) return reject(new Error('Failed to get canvas context'));

  switch (orientation) {
    case 2: context.transform(-1, 0, 0, 1, width, 0); break;
    case 3: context.transform(-1, 0, 0, -1, width, height); break;
    case 4: context.transform(1, 0, 0, -1, 0, height); break;
    case 5: context.transform(0, 1, 1, 0, 0, 0); break;
    case 6: context.transform(0, 1, -1, 0, height, 0); break;
    case 7: context.transform(0, -1, -1, 0, height, width); break;
    case 8: context.transform(0, -1, 1, 0, 0, width); break;
    default: break;
  }

  context.drawImage(img, 0, 0, width, height);

  canvas.toBlob((blob) => {
    if (!blob) return reject(new Error('Canvas toBlob returned null'));
    try {
      resolve(new File([blob], name, { type, lastModified: Date.now() }));
    } catch {
      // Some environments may not support File constructor; fall back to Blob
      resolve(blob);
    }
  }, type);
});

const resizeImage = (img, inputFile, maxPixels) => new Promise((resolve, reject) => {
  const { width = 0, height = 0 } = img || {};
  const type = (inputFile && inputFile.type) ? inputFile.type : 'image/png';
  const mp = Number(maxPixels) || DEFAULT_MAX_PIXELS;

  if (!width || !height) return reject(new Error('Invalid image dimensions'));

  const newWidth = Math.max(1, Math.round(Math.sqrt(mp * (width / height))));
  const newHeight = Math.max(1, Math.round(Math.sqrt(mp * (height / width))));

  getOrientation(img, type)
    .then((orientation) => processImage(img, {
      width: newWidth,
      height: newHeight,
      name: (inputFile && inputFile.name) ? inputFile.name : 'resized.png',
      orientation,
      type,
    }))
    .then(resolve)
    .catch(reject);
});

/** Resize an image to the maximum number of pixels. */
export default (inputFile, maxPixels = DEFAULT_MAX_PIXELS) => new Promise((resolve) => {
  if (!isBrowser) return resolve(inputFile);

  if (!inputFile || typeof inputFile.type !== 'string' || !inputFile.type.match(/image.*/)) {
    return resolve(inputFile);
  }
  if (inputFile.type === 'image/gif') return resolve(inputFile);

  loadImage(inputFile).then((img) => {
    const mp = Number(maxPixels) || DEFAULT_MAX_PIXELS;
    if ((img.width * img.height) < mp) return resolve(inputFile);

    resizeImage(img, inputFile, mp)
      .then(resolve)
      .catch(() => {
        // don't break upload pipeline, fallback to original file
        resolve(inputFile);
      });
  }).catch(() => resolve(inputFile));
});
