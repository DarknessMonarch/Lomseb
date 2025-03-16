"use client";

import { useState } from "react";
import styles from "@/app/styles/dropdown.module.css";
import countriesData from "@/app/utility/Countries.jsx";
import { RiArrowDropDownLine as DropdownIcon  } from "react-icons/ri";
export default function Dropdown({
  options = [],
  onSelect,
  Icon,
  dropPlaceHolder,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    setSelectedOption(option.name);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.dropdownInput} onClick={() => setIsOpen(!isOpen)}>
        {Icon}
        <span>{selectedOption || dropPlaceHolder}</span>
        <DropdownIcon
          className={styles.dropdownIcon}
          alt="Dropdown icon"
          aria-label="Dropdown icon"
        />
      </div>
      {isOpen && options && options.length > 0 && (
        <div className={styles.dropdownArea}>
          {options.map((option) => (
            <span key={option.code} onClick={() => handleSelect(option)}>
              {option.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
