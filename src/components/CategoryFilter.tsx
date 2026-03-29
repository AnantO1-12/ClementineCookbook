interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const options = ['All', ...categories];

  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
      {options.map((category) => {
        const isSelected = category === selected;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={isSelected ? 'pill-active' : 'pill-button'}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
