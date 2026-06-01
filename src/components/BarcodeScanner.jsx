import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            console.log("SCANNED:", result.getText());
            alert(result.getText());

            onScan(result.getText());
          }
        }
      )
      .catch((err) => {
        console.error("Scanner Error:", err);
      });

    return () => {};
  }, [onScan]);

  return (
    <video
      ref={videoRef}
      style={{
        width: "100%",
        maxWidth: "600px",
        borderRadius: "12px"
      }}
      autoPlay
      muted
      playsInline
    />
  );
}