import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

interface PrivateProps {
    children: ReactNode
}

export function Private({ children }: PrivateProps): any {
    const { signed, loadingAuth } = useContext(AuthContext);

    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-4xl font-bold">Carregando</h1>
            </div>
        )
    }

    if (!signed) {
        return <Navigate to="/login" />
    }

    return children;
}