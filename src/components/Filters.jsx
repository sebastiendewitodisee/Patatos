function Filters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  search,
  onSearchChange,
  statusOptions,
  typeOptions,
}) {
  return (
    <section className="filters" aria-label="Filtres du planning">
      <div className="status-filter" role="group" aria-label="Filtrer par statut">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`filter-chip${statusFilter === option.value ? " is-active" : ""}`}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filter-fields">
        <label htmlFor="type-filter" className="sr-only">
          Filtrer par type
        </label>
        <select
          id="type-filter"
          className="select"
          value={typeFilter}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="search-filter" className="sr-only">
          Rechercher
        </label>
        <input
          id="search-filter"
          className="input"
          type="search"
          placeholder="Rechercher un titre, une note, un prénom..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </section>
  );
}

export default Filters;
