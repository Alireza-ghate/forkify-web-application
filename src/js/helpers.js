// functions that we are reuse over and over in our project goes here
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    const res = await Promise.race([timeout(TIMEOUT_SEC), fetchPro]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

// export const getJASON = async function (url) {
//   try {
//     // if fetching data takes too long like more than 10 sec the timeout() will be returned or if before 10 sec data fetched fetch(url) will be returned
//     const res = await Promise.race([timeout(TIMEOUT_SEC), fetch(url)]);
//     const data = await res.json();
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);
//     return data;
//   } catch (err) {
//     // this makes the returned fullfiled promise of getJASON() "rejected"!
//     throw err;
//   }
// };

// export const sendJSON = async function (url, uploadData) {
//   try {
//     // if fetching data takes too long like more than 10 sec the timeout() will be returned or if before 10 sec data fetched fetch(url) will be returned
//     const res = await Promise.race([
//       timeout(TIMEOUT_SEC),
//       fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(uploadData),
//       }),
//     ]);
//     const data = await res.json();
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);
//     return data;
//   } catch (err) {
//     // this makes the returned fullfiled promise of getJASON() "rejected"!
//     throw err;
//   }
// };
