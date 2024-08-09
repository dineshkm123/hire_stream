import React, { useEffect, useRef } from "react";

export default function PosterGenerater({
  //   imageUrls,
  baseImageUrl = "https://image.slidesdocs.com/responsive-images/docs/cute-background-photo-art-pink-background-word-template_f78f6ec3e7__1131_1600.jpg",
  company,
  job,
  list,

  gap = 20,
  //   captions = [],
}) {
  const canvasRef = useRef(null);
  console.log(company, job);
  // Function to load an image from a URL and return a Promise
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Handle cross-origin
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  useEffect(() => {
    const createCollage = async () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const images = await Promise.all(list.map((s) => loadImage(s.userimg)));
      const baseImage = await loadImage(baseImageUrl);

      const numImages = images.length;
      const gridSize = Math.ceil(Math.sqrt(numImages * 4)); // Determine grid size

      const canvasWidth = baseImage.width;
      const canvasHeight = baseImage.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const imgDiameter = (canvasWidth - gap * (gridSize + 1)) / gridSize; // Diameter of each circle image
      const imgRadius = imgDiameter / 2;
      const textGap = 10; // Gap between image and text
      const textHeight = 20; // Height reserved for text

      // Draw base image
      context.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);

      context.font = "136px Arial";
      context.fillStyle = "#000"; // Text color
      context.textAlign = "center";
      context.fillText(
        company.name,
        canvasWidth / 2,
        gap * 2 + imgRadius + textHeight / 2
      );
      context.font = "86px Arial";
      context.fillText(
        job.title,
        canvasWidth / 2,
        gap * 2 + imgRadius + textGap * 3 + textHeight * 3
      );
      console.log(
        "object",
        canvasHeight / 3 - gap * 2 + imgRadius + textGap + textHeight / 2
      );

      const drawStars = (x, y, radius, points, innerRadius) => {
        const step = Math.PI / points;
        context.beginPath();
        for (let i = 0; i < 2 * points; i++) {
          const r = i % 2 === 0 ? radius : innerRadius;
          const angle = i * step;
          context.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        context.closePath();
        context.fillStyle = "#FFD700";
        context.fill();
      };

      images.forEach((img, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        const imagesInRow = Math.min(gridSize, numImages - row * gridSize);
        const rowWidth = imagesInRow * (imgDiameter + gap) - gap;
        const xOffset = (canvasWidth - rowWidth) / 2 - gap;

        const x = col * (imgDiameter + gap) + gap + imgRadius + xOffset;
        const y =
          row * (imgDiameter + gap) + gap + imgRadius + canvasHeight / 3;
        console.log("image", index + 1, x, y, "==", xOffset, rowWidth, gap);
        context.save();
        context.beginPath();
        context.arc(x, y, imgRadius, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(
          img,
          x - imgRadius,
          y - imgRadius,
          imgDiameter,
          imgDiameter
        );
        context.restore();

        // Draw dashed border around the image
        context.beginPath();
        context.arc(x, y, imgRadius, 0, Math.PI * 2, true);
        context.lineWidth = 3; // Border width
        context.setLineDash([5, 5]); // Dashed pattern
        context.strokeStyle = "magenta"; // Border color
        context.stroke();
        context.setLineDash([]); // Reset line dash

        // Draw stars around the image
        drawStars(x - imgRadius - 10, y - imgRadius - 10, 5, 5, 2);
        drawStars(x + imgRadius + 10, y - imgRadius - 10, 5, 5, 2);
        drawStars(x - imgRadius - 10, y + imgRadius + 10, 5, 5, 2);
        drawStars(x + imgRadius + 10, y + imgRadius + 10, 5, 5, 2);

        // Draw text below the image
        const caption = list[index].name || "";
        context.font = "26px Arial";
        context.fillStyle = "#000"; // Text color
        context.textAlign = "center";
        context.fillText(
          caption,
          x,
          y + imgRadius + textGap * 2 + textHeight / 2
        );

        const caption1 = list[index].usn || "";
        context.font = "16px Arial";
        context.fillText(caption1, x, y + imgRadius + textGap * 4 + textHeight);
      });
    };

    createCollage();
  }, [list, baseImageUrl, gap]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "collage.png";
    link.click();
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button onClick={handleDownload}>Download Selection Poster</button>
    </div>
  );
}
