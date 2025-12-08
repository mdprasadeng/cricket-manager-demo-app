import { KJUR } from "jsrsasign/lib/jsrsasign";

// Helper function to convert hex to base64
function hexToBase64(hexstring) {
  return btoa(
    hexstring
      .match(/\w{2}/g)
      .map(function (a) {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join("")
  );
}

async function signRequest(request) {
  if (process.env.REACT_APP_ENABLE_RSA_SIGNING !== "true") {
    return {};
  }
  const timestamp = Math.floor(Date.now() / 1000);

  // Fetch keys from the public folder
  const privateKeyPem = await fetch("/keys/client_private.pem").then((res) =>
    res.text()
  );
  const publicKeyPem = await fetch("/keys/client_public.pem").then((res) =>
    res.text()
  );

  const message = `${timestamp}:${request.method}:${request.url}:${
    Object.keys(request.body || {}).length ? JSON.stringify(request.body) : ""
  }`;

  // Create a new signature object
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  // Initialize the signature object with the private key
  sig.init(privateKeyPem);
  // Add the message to be signed
  sig.updateString(message);
  // Get the signature in hex format
  const signatureHex = sig.sign();

  // Convert the hex signature to base64
  const signatureB64 = hexToBase64(signatureHex);

  return {
    "x-public-key": publicKeyPem.replace(/[\r\n]/gm, ""),
    "x-signature": signatureB64,
    "x-timestamp": timestamp,
  };
}

export { signRequest };
