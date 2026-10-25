import React, { useRef, useState } from "react";
import type { EndpointData } from "../../../backend/src/types";
import { API_URL } from "../constants/constants";
import { InfoTooltip } from "./InfoTooltip";
import { Spinner } from "./Spinner";

type Props = {
    onUploadComplete: (data: EndpointData[]) => void;
};



export function Uploader({ onUploadComplete }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (isLoading) return;


        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {

        if (!file.name.endsWith(".jsonl")) {
            alert("Please upload a .jsonl file.");
            return;
        }

        setIsLoading(true);

        try {
            const text = await file.text();
            const logs = text
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line) => JSON.parse(line));

            const initResponse = await fetch(`${API_URL}/api/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(logs),
            });

            if (!initResponse.ok) throw new Error("Failed to enqueue logs");

            const { jobId } = await initResponse.json();

            const pollForResults = async (): Promise<EndpointData[]> => {
                while (true) {
                    await new Promise((res) => setTimeout(res, 250));

                    const statusRes = await fetch(`${API_URL}/api/jobs/${jobId}`);
                    if (!statusRes.ok) throw new Error("Failed to fetch job status");

                    const job = await statusRes.json();

                    if (job.status === "completed") {
                        return job.result;
                    }
                    if (job.status === "failed") {
                        throw new Error(job.error || "Analysis failed in worker");
                    }
                }
            };

            const analyzedResults: EndpointData[] = await pollForResults();
            onUploadComplete(analyzedResults);
        } catch (error) {
            console.error("Error parsing JSONL:", error);
            alert("Failed to parse the file.");
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <>
            {isLoading ? (
                <Spinner></Spinner>
            ) : (<div
                className={`dropZone ${isDragging ? "is-dragging" : ""}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >

                <div className="absolute top-3 right-3">
                    <InfoTooltip />
                </div>

                <p className="text-sm text-gray-400 font-medium">
                    Drop <span className="text-gray-200 font-semibold">.jsonl</span> or browse
                </p>

                <input
                    type="file"
                    accept=".jsonl"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    style={{ display: "none" }}
                />
            </div>)}
        </>
    );
}