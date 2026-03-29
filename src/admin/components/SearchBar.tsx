interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Rechercher...' }: SearchBarProps) => (
  <div className="admin-search-bar">
    <i className="fas fa-search" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="admin-search-input"
    />
    {value && (
      <button className="admin-search-clear" onClick={() => onChange('')} aria-label="Effacer">
        <i className="fas fa-times" />
      </button>
    )}
  </div>
);
