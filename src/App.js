import React, { useState } from "react";
import "./App.css";
import { buildRelayerTransaction } from "./signing";

function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiMethod, setApiMethod] = useState("POST"); // <--- NEW
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState("");
  const [transactionPayload, setTransactionPayload] = useState("");
  const [signedPayload, setSignedPayload] = useState("");
  const [submitResponse, setSubmitResponse] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const handleApiCall = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}${apiUrl.startsWith("/") ? "" : "/"}${apiUrl}`;
      console.log(url);
      let res;

      if (apiMethod === "GET") {
        res = await fetch(url, {
          method: "GET",
        });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        });
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (data.transactionPayload) {
        setTransactionPayload(JSON.stringify(data.transactionPayload, null, 2));
      }
    } catch (error) {
      setResponse(error.message);
    }
  };

  const handleSignPayload = async () => {
    try {
      const payload = JSON.parse(transactionPayload);
      const { signature, txPayload } = await buildRelayerTransaction(
        privateKey,
        payload.domain,
        payload.types,
        payload.forwardRequest
      );
      const jobId = crypto.randomUUID();

      let apiName = "NA";
      try {
        apiName = JSON.parse(requestBody)?.apiName || "NA";
      } catch {}

      const updatedPayload = {
        jobId,
        apiName,
        signedTransactionPayload: txPayload,
      };
      setSignedPayload(JSON.stringify(updatedPayload, null, 2));
    } catch (error) {
      setSignedPayload(error.message);
    }
  };

  const handleSubmitTransaction = async () => {
    try {
      const convertedObj = JSON.parse(signedPayload);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/submit-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(convertedObj),
        }
      );
      const data = await res.json();
      setSubmitResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setSubmitResponse(error.message);
    }
  };

  return (
    <div>
      <h1>API Showcase</h1>

      <div>
        <h2>1. Get Transaction Payload</h2>

        <select
          value={apiMethod}
          onChange={(e) => setApiMethod(e.target.value)}
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
        </select>

        <br />
        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
        <br />

        {apiMethod === "POST" && (
          <textarea
            placeholder="Request Body"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
          ></textarea>
        )}

        <br />
        <button onClick={handleApiCall}>Send Request</button>
        <pre>{response}</pre>
      </div>

      <div>
        <h2>2. Sign Transaction Payload</h2>
        <input
          type="text"
          placeholder="Private Key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Transaction Payload"
          value={transactionPayload}
          readOnly
        />
        <br />
        <button onClick={handleSignPayload}>Sign Payload</button>
        <pre>{signedPayload}</pre>
      </div>

      <div>
        <h2>3. Submit Transaction</h2>
        <textarea placeholder="Signed Payload" value={signedPayload} readOnly />
        <br />
        <button onClick={handleSubmitTransaction}>Submit Transaction</button>
        <pre>{submitResponse}</pre>
      </div>
    </div>
  );
}

export default App;
