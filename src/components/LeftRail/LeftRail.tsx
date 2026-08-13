import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useShell } from '../../context/ShellContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './LeftRail.css'

function Accordion({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <details className="rail-accordion" open>
      <summary>{title}</summary>
      <div className="rail-accordion__body">{children}</div>
    </details>
  )
}

export function LeftRail() {
  const {
    railOpen,
    setRailOpen,
    families,
    purities,
    states,
    selectedFamily,
    selectedPurity,
    selectedState,
    setSelectedFamily,
    setSelectedPurity,
    setSelectedState,
  } = useShell()
  const compact = useMediaQuery('(max-width: 1279px)')
  const location = useLocation()
  const showCatalogFacets = location.pathname.startsWith('/catalog')
  const closeIfCompact = () => {
    if (compact) setRailOpen(false)
  }

  return (
    <>
      {compact && railOpen ? (
        <button
          type="button"
          className="app-rail-backdrop"
          aria-label="Close navigation"
          onClick={() => setRailOpen(false)}
        />
      ) : null}
      <aside className={`app-rail ${railOpen ? 'is-open' : ''}`} aria-label="Account and filters">
        <p className="app-rail__label">Workspace</p>
        <nav className="app-rail__nav">
          <NavLink
            to="/catalog"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            onClick={closeIfCompact}
          >
            Catalog
          </NavLink>
          <NavLink
            to="/portal/orders"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            onClick={closeIfCompact}
          >
            Orders
          </NavLink>
          <NavLink
            to="/portal/settings"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            onClick={closeIfCompact}
          >
            Account
          </NavLink>
        </nav>

        {showCatalogFacets ? (
          <div className="app-rail__filters">
            <p className="app-rail__label">Filters</p>
            <Accordion title="Chemical Family">
              <ul className="rail-facet">
                {families.map((option) => (
                  <li key={option.value}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFamily === option.value}
                        onChange={() =>
                          setSelectedFamily(selectedFamily === option.value ? null : option.value)
                        }
                      />
                      <span>{option.value}</span>
                      <span className="rail-facet__count">{option.count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Purity Grade">
              <ul className="rail-facet">
                {purities.map((option) => (
                  <li key={option.value}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedPurity === option.value}
                        onChange={() =>
                          setSelectedPurity(selectedPurity === option.value ? null : option.value)
                        }
                      />
                      <span>{option.value}</span>
                      <span className="rail-facet__count">{option.count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Physical State">
              <ul className="rail-facet">
                {states.map((option) => (
                  <li key={option.value}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedState === option.value}
                        onChange={() =>
                          setSelectedState(selectedState === option.value ? null : option.value)
                        }
                      />
                      <span>{option.value}</span>
                      <span className="rail-facet__count">{option.count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Accordion>
          </div>
        ) : null}
      </aside>
    </>
  )
}
