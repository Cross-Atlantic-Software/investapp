"use client";

import { ChevronRight, ArrowRight, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useId, useState, useEffect, useMemo } from "react";
import { Button } from "../ui";

// Types
interface FilterOption {
  id: string | number;
  name: string;
  value: string;
}

interface FilterItemProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  isRadio?: boolean;
}

interface FilterSidebarProps {
  onApplyFilters?: (filters: FilterState) => void;
  onClearFilters?: () => void;
  stockData?: Array<{
    sector_ids?: string;
    subsector_ids?: string;
    theme_ids?: string;
  }>; // Stock data to filter options based on actual data
}

export interface FilterState {
  valuation: string[];
  sectors: string[];
  subsectors: string[];
  themes: string[];
}

// Filter Item Component
const FilterItem = ({ title, options, selectedValues, onSelectionChange, isRadio = false }: FilterItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  const handleSelectionChange = (value: string) => {
    if (isRadio) {
      // For radio buttons, only one selection allowed
      onSelectionChange([value]);
    } else {
      // For checkboxes, multiple selections allowed
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newValues);
    }
  };

  return (
    <div className="py-3 mx-4 border-b border-themeTealLighter last:border-0 text-themeTeal">
      <button
        type="button"
        className="w-full flex justify-between items-center cursor-pointer hover:bg-themeTealLighter/20 rounded-md px-2 py-2 transition-colors duration-200 group"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-themeTeal group-hover:text-themeTealDark transition-colors duration-200">{title}</span>
        <ChevronRight className={`transition-transform duration-300 text-themeTealLighter group-hover:text-themeTeal ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <ul className="py-2 pl-1">
            {options.length === 0 ? (
              <li className="py-2 text-sm text-gray-500 italic">No options available</li>
            ) : (
              options.map((option) => (
                <li key={option.id} className="py-1">
                  <label className="flex items-center cursor-pointer w-full group hover:bg-themeTealLighter/30 rounded-md px-2 py-2 transition-colors duration-200">
                    <div className="relative flex items-center">
                      <input
                        type={isRadio ? "radio" : "checkbox"}
                        name={isRadio ? title : undefined}
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleSelectionChange(option.value)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200
                        ${isRadio ? 'rounded-full' : 'rounded-sm'}
                        ${selectedValues.includes(option.value) 
                          ? 'bg-themeTeal border-themeTeal' 
                          : 'border-themeTealLighter group-hover:border-themeTeal'
                        }
                      `}>
                        {selectedValues.includes(option.value) && (
                          <>
                            {isRadio ? (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-themeTeal group-hover:text-themeTealDark transition-colors duration-200">
                      {option.name}
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

// Main Filter Sidebar Component
export default function Filters({ onApplyFilters, onClearFilters, stockData = [] }: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();

  // State for filter selections
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    valuation: [],
    sectors: [],
    subsectors: [],
    themes: [],
  });

  // State for dynamic data
  const [sectors, setSectors] = useState<FilterOption[]>([]);
  const [subsectors, setSubsectors] = useState<FilterOption[]>([]);
  const [themes, setThemes] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sectors and subsectors
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);

        // Fetch sectors
        const sectorsResponse = await fetch('/api/admin/sectors/select');
        const sectorsData = await sectorsResponse.json();
        
        if (sectorsData.success && sectorsData.data?.sectors) {
          const sectorOptions = sectorsData.data.sectors.map((sector: { id: number; name: string }) => ({
            id: sector.id,
            name: sector.name,
            value: sector.id.toString()
          }));
          setSectors(sectorOptions);
        }

        // Fetch subsectors
        const subsectorsResponse = await fetch('/api/admin/subsectors');
        const subsectorsData = await subsectorsResponse.json();
        
        if (subsectorsData.success && subsectorsData.data?.subsectors) {
          const subsectorOptions = subsectorsData.data.subsectors.map((subsector: { id: number; name: string }) => ({
            id: subsector.id,
            name: subsector.name,
            value: subsector.id.toString()
          }));
          setSubsectors(subsectorOptions);
        }

        // Fetch themes
        const themesResponse = await fetch('/api/themes/select');
        const themesData = await themesResponse.json();
        
        if (themesData.success && themesData.data?.themes) {
          const themeOptions = themesData.data.themes.map((theme: { id: number; name: string }) => ({
            id: theme.id,
            name: theme.name,
            value: theme.id.toString()
          }));
          setThemes(themeOptions);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Static valuation options
  const valuationOptions: FilterOption[] = [
    { id: 'above-300', name: 'Above 300 Cr', value: 'above-300' },
    { id: 'below-300', name: 'Below 300 Cr', value: 'below-300' },
  ];

  // Filter sectors based on actual stock data
  const filteredSectors = useMemo(() => {
    if (!stockData.length) return sectors;
    
    const usedSectorIds = new Set<number>();
    stockData.forEach((stock) => {
      if (stock.sector_ids) {
        try {
          const sectorIds = JSON.parse(stock.sector_ids);
          if (Array.isArray(sectorIds)) {
            sectorIds.forEach((id: number) => usedSectorIds.add(id));
          }
        } catch (error) {
          console.error('Error parsing sector_ids:', error);
        }
      }
    });
    
    return sectors.filter(sector => usedSectorIds.has(parseInt(sector.value)));
  }, [sectors, stockData]);

  // Filter subsectors based on actual stock data
  const filteredSubsectors = useMemo(() => {
    if (!stockData.length) return subsectors;
    
    const usedSubsectorIds = new Set<number>();
    stockData.forEach((stock) => {
      if (stock.subsector_ids) {
        try {
          const subsectorIds = JSON.parse(stock.subsector_ids);
          if (Array.isArray(subsectorIds)) {
            subsectorIds.forEach((id: number) => usedSubsectorIds.add(id));
          }
        } catch (error) {
          console.error('Error parsing subsector_ids:', error);
        }
      }
    });
    
    return subsectors.filter(subsector => usedSubsectorIds.has(parseInt(subsector.value)));
  }, [subsectors, stockData]);

  // Filter themes based on actual stock data
  const filteredThemes = useMemo(() => {
    if (!stockData.length) return themes;
    
    const usedThemeIds = new Set<number>();
    stockData.forEach((stock) => {
      if (stock.theme_ids) {
        try {
          const themeIds = JSON.parse(stock.theme_ids);
          if (Array.isArray(themeIds)) {
            themeIds.forEach((id: number) => usedThemeIds.add(id));
          }
        } catch (error) {
          console.error('Error parsing theme_ids:', error);
        }
      }
    });
    
    return themes.filter(theme => usedThemeIds.has(parseInt(theme.value)));
  }, [themes, stockData]);

  // Handle selection changes
  const handleSelectionChange = (filterKey: keyof FilterState, values: string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: values
    }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(selectedFilters);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedFilters({
      valuation: [],
      sectors: [],
      subsectors: [],
      themes: [],
    });
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
      <aside
        className={[
          "rounded-lg bg-themeTealWhite shadow-sm border border-themeTealLighter overflow-hidden transition-[width] duration-300",
          "w-full",
          collapsed ? "lg:w-16" : "lg:w-[clamp(260px,28vw,300px)]",
        ].join(" ")}
      >
      {/* header */}
      <div className="justify-between items-center p-4 hidden md:flex bg-themeTealWhite">
        <h3 className={collapsed ? "sr-only" : "text-lg font-semibold text-themeTeal"} id={`${bodyId}-label`}>
          Filters
        </h3>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? "Expand filters" : "Collapse filters"}
          aria-controls={bodyId}
          aria-expanded={!collapsed}
          className="p-1.5 rounded-md hover:bg-themeTealLighter/30 transition-colors duration-200 cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5 stroke-themeTeal" /> : <PanelLeftClose className="h-5 w-5 stroke-themeTeal" />}
        </button>
      </div>

      <div className="hidden md:block bg-themeTealLighter h-px" />

      {/* collapsible body that the header button controls */}
      <div id={bodyId} aria-labelledby={`${bodyId}-label`} hidden={collapsed}>
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center text-themeTeal">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-themeTeal mr-2"></div>
              Loading filters...
            </div>
          </div>
        ) : (
          <>
            {/* Commented filters for future use */}
            {/* { title: "Investment Solutions", items: ["Option 1", "Option 2", "Option 3"] } */}
            {/* { title: "Availability Status", items: ["Available", "Unavailable"] } */}
            {/* { title: "Share Class", items: ["Class A", "Class B"] } */}
            {/* { title: "Investment Size", items: ["$1M - $5M", "$5M - $10M"] } */}
            {/* { title: "Themes", items: ["Growth", "Sustainability"] } */}
            {/* { title: "VC Investors", items: ["Investor 1", "Investor 2"] } */}

            {/* Active Filters - Valuation first */}
            <FilterItem
              title="Valuation"
              options={valuationOptions}
              selectedValues={selectedFilters.valuation}
              onSelectionChange={(values) => handleSelectionChange('valuation', values)}
              isRadio={true}
            />

            {filteredSectors.length > 0 && (
              <FilterItem
                title="Industry Groups"
                options={filteredSectors}
                selectedValues={selectedFilters.sectors}
                onSelectionChange={(values) => handleSelectionChange('sectors', values)}
              />
            )}

            {filteredSubsectors.length > 0 && (
              <FilterItem
                title="Industries"
                options={filteredSubsectors}
                selectedValues={selectedFilters.subsectors}
                onSelectionChange={(values) => handleSelectionChange('subsectors', values)}
              />
            )}

            {filteredThemes.length > 0 && (
              <FilterItem
                title="Themes"
                options={filteredThemes}
                selectedValues={selectedFilters.themes}
                onSelectionChange={(values) => handleSelectionChange('themes', values)}
              />
            )}
          </>
        )}

        <div className="flex justify-between items-center p-4 bg-themeTealWhite border-t border-themeTealLighter">
          <Button 
            text="Clear All" 
            color="themeTeal" 
            variant="outline" 
            size="sm" 
            onClick={handleClearFilters}
            className="hover:shadow-md transition-shadow duration-200"
          />
          <Button 
            text="Filter Result" 
            color="themeTeal" 
            variant="solid" 
            size="sm" 
            onClick={handleApplyFilters}
            className="hover:shadow-md transition-shadow duration-200"
          />
        </div>
      </div>
    </aside>
  );
}
