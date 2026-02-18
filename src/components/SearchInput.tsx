import { useState, useEffect } from "react";

interface SearchInputProps {
    setSearch: (query: string) => void;
}

function SearchInput({ setSearch }: SearchInputProps) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (query.length < 4) {
            // Si moins de 3 caractères, on ne lance pas la recherche
            setSearch("");
            return;
        }

        const timeout = setTimeout(() => {
            setSearch(query);
        }, 400); // délai de 400 ms

        return () => clearTimeout(timeout);
    }, [query, setSearch]);

    return (
        <input
            type="text"
            placeholder="Rechercher un produit"
            id="productSearch"
            className="enhanced-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

export default SearchInput;
