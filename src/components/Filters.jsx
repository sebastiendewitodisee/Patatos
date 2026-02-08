import { useTranslation } from "react-i18next";

function Filters({
  statusFilter,
  onStatusChange,
  phaseFilter,
  onPhaseChange,
  search,
  onSearchChange,
  statusOptions,
  phaseOptions,
  onReset,
  isResetDisabled,
}) {
  const { t } = useTranslation();

  return (
    <section className="filters" aria-label={t("planning.filters.section_aria")}>
      <div className="status-filter" role="group" aria-label={t("planning.filters.status_group_aria")}>
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
        <label htmlFor="phase-filter" className="sr-only">
          {t("planning.filters.phase_label")}
        </label>
        <select
          id="phase-filter"
          className="select"
          value={phaseFilter}
          onChange={(event) => onPhaseChange(event.target.value)}
        >
          {phaseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="search-filter" className="sr-only">
          {t("planning.filters.search_label")}
        </label>
        <input
          id="search-filter"
          className="input"
          type="search"
          placeholder={t("planning.filters.search_placeholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <button type="button" className="filter-chip" onClick={onReset} disabled={isResetDisabled}>
          {t("planning.filters.reset")}
        </button>
      </div>
    </section>
  );
}

export default Filters;
