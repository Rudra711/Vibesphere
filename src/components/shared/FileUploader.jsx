import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactPlayer from 'react-player';

import { Button } from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";

const FileUploader = ({ fieldChange, mediaUrl }) => {
  const [file, setFile] = useState([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl);
  const [fileType, setFileType] = useState("");

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
      setFileType(acceptedFiles[0].type);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {fileType.startsWith("image/") ? (
              <img src={fileUrl} alt="image" className="file_uploader-img rounded-xl object-cover" />
            ) : (
              <div className="relative w-full h-64 xs:h-[400px] lg:h-[450px] rounded-xl overflow-hidden">
                <ReactPlayer
                  url={fileUrl}
                  width="100%"
                  height="100%"
                  controls={false}
                  muted
                  playing={false}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <p className="text-white text-2xl">Video Preview</p>
                </div>
              </div>
            )}
          </div>
          <p className="file_uploader-label">Click or drag media file to replace</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">Drag here</h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG, MP4 ...</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
