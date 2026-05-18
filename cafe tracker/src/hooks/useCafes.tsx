import { useContext } from "react";
import { CafeContext } from "../context/cafes";

export function useCafes() {
    const cafe = useContext(CafeContext);
    if(!cafe){
        throw new Error("Cafe context is not available");
    } else {
        return cafe;
    }
}

