import { ChangeEvent, useRef } from "react";

import useOCR from "./useOCR";

function App() {
  const { text, isLoading, error, readText } = useOCR();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div>
        <input
          type="file"
          accept="image/*, application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button onClick={handleUploadClick}>画像をアップロード</button>
        {isLoading && <p>読み取り中...</p>}
        {error && <p>エラー: {error}</p>}
        {text && (
          <div>
            <h3>抽出されたテキスト:</h3>
            <pre>{text}</pre>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
