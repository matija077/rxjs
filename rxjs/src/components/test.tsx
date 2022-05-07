import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
const Test: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const [count, setCount] = useState(0);
  const [quote, setQuote] = useState("");
  console.log("React 18 render!");
  const handleCount = () => {
    console.log(!clicked);
    flushSync(() => {
      setClicked(!clicked);
    });
    setCount(count + 1);
    //trigger re-render with specific state update (flushSync() method)
    flushSync(() => {
      setClicked((prevState) => {
        console.log(!prevState);
        return !prevState;
      });
    });
  };
  const handleQuote = () => {
    fetch("https://api.kanye.rest/")
      .then((res) => {
        console.log("tu sam prvo");
        return res.json();
      })
      .then((res) => {
        for (let i = 0; i < 5; i++) {
          Promise.resolve("value")
            .then((r) => i === 4 && console.log(r))
            .then((r) => i === 4 && console.log(r));
          /*window.setTimeout(() => {
                    i === 10000 && console.log('value')
                }, 0)
            fetch("localhost")
              .then((r) => i === 4 && console.log(r))
              .catch((e) => i === 4 && console.log(e));
          }*/
          setQuote(res.quote);
        }
      })
      .then(() => {
        console.log("tu sam");
        setClicked(!clicked);
        setCount(count + 1);
      });
  };
  const handleTimeout = () => {
    setTimeout(() => {
      setClicked(!clicked);
      setCount(count + 1);
    }, 1000);
  };
  return (
    <>
      <button onClick={handleCount}>Get Count</button>
      <p>Count is: {count} </p>
      <button onClick={handleQuote}>Get Quote</button>
      <p>Quote is: {quote} </p>
      <button onClick={handleTimeout}>Set timeout</button>
      <p>Check console </p>
    </>
  );
};
export default Test;
