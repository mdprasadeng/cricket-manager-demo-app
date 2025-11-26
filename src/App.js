import React, { useState } from "react";
import "./App.css";
import { buildRelayerTransaction } from "./signing";

function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiMethod, setApiMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState("");
  const [transactionPayload, setTransactionPayload] = useState("");
  const [signedPayload, setSignedPayload] = useState("");
  const [submitResponse, setSubmitResponse] = useState("");
  const [txnStatusResponse, setTxnStatusResponse] = useState("");
  const [jobStatusResponse, setJobStatusResponse] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const [loadingApiCall, setLoadingApiCall] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingJobStatus, setLoadingJobStatus] = useState(false);
  const [loadingTxnStatus, setLoadingTxnStatus] = useState(false);

  const parsedSubmitResponse = submitResponse
    ? JSON.parse(submitResponse)
    : null;
  const parsedJobStatus = jobStatusResponse
    ? JSON.parse(jobStatusResponse)
    : null;
  const parsedTxnStatus = txnStatusResponse
    ? JSON.parse(txnStatusResponse)
    : null;

  const handleApiCall = async () => {
    setLoadingApiCall(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}${apiUrl.startsWith("/") ? "" : "/"}${apiUrl}`;
      let res;

      if (apiMethod === "GET") {
        res = await fetch(url, { method: "GET" });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    setLoadingApiCall(false);
  };

  const handleSignPayload = async () => {
    setLoadingSign(true);
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
    setLoadingSign(false);
  };

  const handleSubmitTransaction = async () => {
    setLoadingSubmit(true);
    try {
      const convertedObj = JSON.parse(signedPayload);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/submit-transaction`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(convertedObj),
        }
      );

      const data = await res.json();
      setSubmitResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setSubmitResponse(error.message);
    }
    setLoadingSubmit(false);
  };

  const handleGetJobStatus = async () => {
    setLoadingJobStatus(true);
    try {
      const convertedObj = JSON.parse(signedPayload);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/status?jobId=${convertedObj.jobId}`,
        { method: "GET" }
      );

      const data = await res.json();
      setJobStatusResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setJobStatusResponse(error.message);
    }
    setLoadingJobStatus(false);
  };

  const handleGetTxnStatus = async () => {
    setLoadingTxnStatus(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/get-info/get-relayer-transaction?transactionId=${parsedJobStatus.transactionId}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      setTxnStatusResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTxnStatusResponse(error.message);
    }
    setLoadingTxnStatus(false);
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
          />
        )}

        <br />
        <button onClick={handleApiCall} disabled={loadingApiCall}>
          {loadingApiCall ? "Sending..." : "Send Request"}
        </button>

        <pre>{response}</pre>
      </div>

      <div>
        {response && (
          <>
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

            <button onClick={handleSignPayload} disabled={loadingSign}>
              {loadingSign ? "Signing..." : "Sign Payload"}
            </button>

            <pre>{signedPayload}</pre>
          </>
        )}
      </div>

      <div>
        {signedPayload && (
          <>
            <h2>3. Submit Transaction</h2>
            <textarea value={signedPayload} readOnly />
            <br />

            <button onClick={handleSubmitTransaction} disabled={loadingSubmit}>
              {loadingSubmit ? "Submitting..." : "Submit Transaction"}
            </button>

            <pre>{submitResponse}</pre>
          </>
        )}
      </div>

      <div>
        {parsedSubmitResponse?.jobId && (
          <>
            <h2>4. Get Job Status</h2>
            <textarea value={parsedSubmitResponse.jobId} readOnly />
            <br />

            <button onClick={handleGetJobStatus} disabled={loadingJobStatus}>
              {loadingJobStatus ? "Fetching..." : "Get Job Status"}
            </button>

            <pre>{jobStatusResponse}</pre>
          </>
        )}
      </div>

      <div>
        {parsedJobStatus?.transactionId && (
          <>
            <h2>5. Get Transaction Status</h2>
            <textarea value={parsedJobStatus.transactionId} readOnly />
            <br />

            <button onClick={handleGetTxnStatus} disabled={loadingTxnStatus}>
              {loadingTxnStatus ? "Fetching..." : "Get Transaction Status"}
            </button>

            <pre>{txnStatusResponse}</pre>
          </>
        )}
      </div>

      <div>
        {parsedTxnStatus?.hash && (
          <>
            <h2>6. Verify on Chain</h2>
            <textarea
              value={`https://glhf-testnet.explorer.caldera.xyz/tx/${parsedTxnStatus?.hash}`}
              readOnly
            />
            <button
              onClick={() =>
                window.open(
                  `https://glhf-testnet.explorer.caldera.xyz/tx/${parsedTxnStatus?.hash}`,
                  "_blank"
                )
              }
            >
              View Transaction
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
