import { useNavigate } from "react-router-dom";
import { useData } from "../components/DataContext";
import { Uploader } from "../components/Uploader";
import { Footer } from "../components/Footer";

export function UploadPage() {
    const { setResults } = useData();
    const navigate = useNavigate();

    const handleUploadComplete = (data: any[]) => {
        setResults(data);
        navigate("/dashboard");
    };

    return (
        <div className="page-wrapper max-w-7xl mx-auto w-full px-4 pt-4 pb-6 flex flex-col min-h-screen">
            
            <header className="w-full text-center">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
                    LogScope
                </h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center w-full">
                <Uploader onUploadComplete={handleUploadComplete} />
            </main>

            <Footer />
        </div>
    );
}