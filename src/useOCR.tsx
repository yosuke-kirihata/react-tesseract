import { useState, useCallback } from "react";
import { createWorker, OEM, RecognizeResult } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.mjs";

const useOCR = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //   const convertPDFToImages = async (
  //     file: File
  //   ): Promise<HTMLCanvasElement[]> => {
  //     const arrayBuffer = await file.arrayBuffer();
  //     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  //     const canvases: HTMLCanvasElement[] = [];

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       const viewport = page.getViewport({ scale: 1.5 });
  //       const canvas = document.createElement("canvas");
  //       const context = canvas.getContext("2d");
  //       canvas.height = viewport.height;
  //       canvas.width = viewport.width;

  //       await page.render({
  //         canvasContext: context!,
  //         viewport: viewport,
  //       }).promise;

  //       canvases.push(canvas);
  //     }

  //     return canvases;
  //   };

  const convertPdfToImageDataUrls = async (pdf: File): Promise<string[]> => {
    const pdfData = await pdf.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

    const imageDataUrls = [];
    for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
      const page = await pdfDoc.getPage(pageNo);
      const canvas = document.createElement("canvas");
      const viewport = page.getViewport({ scale: 2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const context = canvas.getContext("2d");
      if (context == null) {
        const error = new Error();
        throw error;
      }
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      const imageDataUrl = canvas.toDataURL();
      imageDataUrls.push(imageDataUrl);
    }
    return imageDataUrls;
  };

  const readText = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    let worker = null;

    try {
      worker = await createWorker("jpn", OEM.TESSERACT_ONLY, {
        logger: (evt) => {
          console.log(evt);
        },
        cacheMethod: "none",
        langPath: "/tessdata/",
        corePath: "/js/tesseract-core.wasm.js",
        workerPath: "/js/worker.min.js",
      });

      let fullText = "";

      if (file.type === "application/pdf") {
        // const images = await convertPDFToImages(file);
        const images = await convertPdfToImageDataUrls(file);
        for (const image of images) {
          const result: RecognizeResult = await worker.recognize(image);
          fullText += result.data.text + "\n\n";
        }
      } else {
        const result: RecognizeResult = await worker.recognize(file);
        fullText = result.data.text;
      }
      setText(fullText.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsLoading(false);
    }
  }, []);

  return { text, isLoading, error, readText };
};

export default useOCR;
