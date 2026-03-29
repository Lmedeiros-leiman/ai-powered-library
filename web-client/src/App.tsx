import { useState } from 'react'
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { Greeter } from "./proto/greet_pb";

const transport = createConnectTransport({
  baseUrl: "http://localhost:5000",
});

const client = createClient(Greeter, transport);

function App() {
  const [response, setResponse] = useState<string>("")

  async function callApi() {
    try {
      const res = await client.sayHello({ name: "Leo" });
      setResponse(res.message);
    } catch (err) {
      if (err instanceof ConnectError) {
        console.error(err.code, err.message);
      }
    }
  }

  return (
    <>
      <button onClick={callApi}>Call API</button>
      <p>{response}</p>
    </>
  )
}

export default App