import { ChangeEvent, useEffect, useRef, useState } from "react";

import useOCR from "./useOCR";

function App() {
  const [langBlob, setLangBlob] = useState<Blob | null>(null);
  const [langPath, setLangPath] = useState<string>("");

  const { text, isInitialized, isLoading, error, readText } = useOCR({
    //langPath: "/tessdata/",
    langPath: langPath,
    language: "jpn",
  });

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

  useEffect(() => {
    const f = async () => {
      try {
        const response = await fetch("/tessdata/jpn.traineddata");
        const blob = await response.blob();
        setLangBlob(blob);
      } catch (error) {
        console.error(error);
      }
    };

    f();
  }, []);

  useEffect(() => {
    if (langBlob) {
      const blobUrl = URL.createObjectURL(langBlob);
      const langPath = `${blobUrl}#customElement`;
      setLangPath(langPath);

      return () => {
        if (langBlob) URL.revokeObjectURL(langPath);
      };
    }
  }, [langBlob]);

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
        {!isInitialized && <p>初期化中...</p>}
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
