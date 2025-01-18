import { ReactNode, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "../hooks/useSupabase";
import { SessionContext } from "../hooks/useSession";
import Loading from "../components/Loading";

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { supabase } = useSupabase();

    useEffect(() => {
        const authStateListener = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        return () => {
            authStateListener.data.subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <SessionContext.Provider value={{ session }}>
            {loading ? <Loading />
                : children}
        </SessionContext.Provider>
    );
};